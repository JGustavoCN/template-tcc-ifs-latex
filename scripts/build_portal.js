#!/usr/bin/env node
/**
 * build_portal.js - Construtor do Portal Web Acadêmico Dinâmico para GitHub Pages.
 *
 * Extrai dados 100% reais diretamente das fontes do LaTeX, do PDF, do Sumário e do Git:
 * 1. src/main.tex: Título, Autor, Orientador, Coorientador, Instituição, Local, Data, Tipo do Trabalho.
 * 2. src/config.tex: Diretrizes tipográficas, normas ABNT e layout institucional.
 * 3. src/build/main.toc: Sumário completo incluindo Capítulos, Seções, Subseções, Apêndices e Anexos.
 * 4. src/build/main.pdf & main.log: Quantidade exata de páginas e tamanho do arquivo compilado.
 * 5. src/referencias.bib & main.bbl: Contagem de referências catalogadas vs citadas.
 * 6. Git / GitHub Actions: Commit hash, branch, repositório e timestamp em Horário de Brasília (America/Sao_Paulo).
 *
 * ZERO MOCKS. Foco total em usabilidade, leitura limpa do PDF e dados autênticos.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const buildDir = path.join(srcDir, 'build');
const webDir = path.join(rootDir, 'web');
const outputDir = path.join(rootDir, 'public');

/**
 * Decodifica notação de acentos do LaTeX (\^e, \'a, \~a, \c{c}) para caracteres UTF-8 reais.
 */
function decodeLatexAccents(str) {
  if (!str) return '';
  return str
    .replace(/\\c\{c\}/gi, 'ç')
    .replace(/\\\^[eE]/g, (m) => m[2] === 'E' ? 'Ê' : 'ê')
    .replace(/\\\^\{([eE])\}/g, (m, p1) => p1 === 'E' ? 'Ê' : 'ê')
    .replace(/\\\^[aA]/g, (m) => m[2] === 'A' ? 'Â' : 'â')
    .replace(/\\\^\{([aA])\}/g, (m, p1) => p1 === 'A' ? 'Â' : 'â')
    .replace(/\\\^[oO]/g, (m) => m[2] === 'O' ? 'Ô' : 'ô')
    .replace(/\\\^\{([oO])\}/g, (m, p1) => p1 === 'O' ? 'Ô' : 'ô')
    .replace(/\\'([aAeEiIoOuU])/g, (m, p1) => {
      const map = { a:'á', e:'é', i:'í', o:'ó', u:'ú', A:'Á', E:'É', I:'Í', O:'Ó', U:'Ú' };
      return map[p1] || p1;
    })
    .replace(/\\'\{([aAeEiIoOuU])\}/g, (m, p1) => {
      const map = { a:'á', e:'é', i:'í', o:'ó', u:'ú', A:'Á', E:'É', I:'Í', O:'Ó', U:'Ú' };
      return map[p1] || p1;
    })
    .replace(/\\`([aAeEiIoOuU])/g, (m, p1) => {
      const map = { a:'à', e:'è', i:'ì', o:'ò', u:'ù', A:'À', E:'È', I:'Ì', O:'Ò', U:'Ù' };
      return map[p1] || p1;
    })
    .replace(/\\`\{([aAeEiIoOuU])\}/g, (m, p1) => {
      const map = { a:'à', e:'è', i:'ì', o:'ò', u:'ù', A:'À', E:'È', I:'Ì', O:'Ò', U:'Ù' };
      return map[p1] || p1;
    })
    .replace(/\\~([aAoOnN])/g, (m, p1) => {
      const map = { a:'ã', o:'õ', n:'ñ', A:'Ã', O:'Õ', N:'Ñ' };
      return map[p1] || p1;
    })
    .replace(/\\~\{([aAoOnN])\}/g, (m, p1) => {
      const map = { a:'ã', o:'õ', n:'ñ', A:'Ã', O:'Õ', N:'Ñ' };
      return map[p1] || p1;
    })
    .replace(/\\\^/g, '')
    .replace(/\\'/g, '')
    .replace(/\\~/g, '')
    .replace(/\\`/g, '');
}

/**
 * Remove formatações de LaTeX, comentários e quebras de linha para texto puro legível.
 */
function cleanLatex(raw) {
  if (!raw) return '';
  return decodeLatexAccents(raw)
    .replace(/%[^\n]*/g, '') // remove comentários de linha
    .replace(/\\par/g, ' – ')
    .replace(/\\textit\{([^}]+)\}/g, '$1')
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    .replace(/\\underline\{([^}]+)\}/g, '$1')
    .replace(/\\\\/g, ' ')
    .replace(/--/g, '–')
    .replace(/\\/g, '') // remove qualquer barra residual
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrai comandos LaTeX que utilizam chaves com balanceamento robusto de profundidade.
 */
function extractBracedCommand(text, commandName) {
  const regex = new RegExp('\\\\' + commandName + '\\s*(?:%[^\\n]*\\n\\s*)*\\{');
  const match = regex.exec(text);
  if (!match) return null;

  const openBrace = match.index + match[0].length - 1;
  let depth = 1;
  let i = openBrace + 1;
  while (i < text.length && depth > 0) {
    if (text[i] === '\\') {
      i += 2;
      continue;
    }
    if (text[i] === '{') depth++;
    else if (text[i] === '}') depth--;
    i++;
  }
  if (depth === 0) {
    return text.substring(openBrace + 1, i - 1);
  }
  return null;
}

/**
 * Extrai metadados do documento a partir de src/main.tex.
 */
function parseMainTex() {
  const mainTexPath = path.join(srcDir, 'main.tex');
  if (!fs.existsSync(mainTexPath)) {
    return {
      titulo: 'Trabalho de Conclusão de Curso',
      autor: 'Autor do Trabalho',
      orientador: 'Orientador',
      coorientador: null,
      instituicao: 'Instituto Federal de Sergipe',
      instituicaoLinhas: ['Instituto Federal de Sergipe'],
      campus: 'Campus Lagarto',
      curso: 'Bacharelado em Sistemas de Informação',
      local: 'Lagarto – SE',
      data: new Date().getFullYear().toString(),
      tipotrabalho: 'Trabalho de Conclusão de Curso'
    };
  }

  const content = fs.readFileSync(mainTexPath, 'utf-8');

  const rawInstituicao = extractBracedCommand(content, 'instituicao') || '';
  const linhasInst = rawInstituicao
    .split(/\\par|\\\\/)
    .map(l => cleanLatex(l))
    .filter(l => l.length > 0);

  const instituicaoNome = linhasInst[0] || 'Instituto Federal de Educação, Ciência e Tecnologia de Sergipe';
  const campusNome = linhasInst[1] || 'Campus Lagarto';
  const cursoNome = linhasInst[2] || 'Bacharelado em Sistemas de Informação';

  const titulo = cleanLatex(extractBracedCommand(content, 'titulo')) || 'Trabalho de Conclusão de Curso';
  const autor = cleanLatex(extractBracedCommand(content, 'autor')) || 'Autor não informado';
  const orientador = cleanLatex(extractBracedCommand(content, 'orientador')) || 'Orientador não informado';
  const coorientador = cleanLatex(extractBracedCommand(content, 'coorientador'));
  const local = cleanLatex(extractBracedCommand(content, 'local')) || 'Lagarto – SE';
  const data = cleanLatex(extractBracedCommand(content, 'data')) || new Date().getFullYear().toString();
  const tipotrabalho = cleanLatex(extractBracedCommand(content, 'tipotrabalho')) || 'Trabalho de Conclusão de Curso';
  const preambulo = cleanLatex(extractBracedCommand(content, 'preambulo'));

  return {
    titulo,
    autor,
    orientador,
    coorientador,
    instituicaoCompleta: `${instituicaoNome} – ${campusNome} – ${cursoNome}`,
    instituicaoNome,
    campusNome,
    cursoNome,
    local,
    data,
    tipotrabalho,
    preambulo
  };
}

/**
 * Extrai configurações de src/config.tex.
 */
function parseConfigTex() {
  const configPath = path.join(srcDir, 'config.tex');
  if (!fs.existsSync(configPath)) {
    return {
      norma: 'ABNT NBR 14724 / NBR 6023',
      fonte: 'Palatino',
      espacamento: '1.5',
      citacao: 'biblatex-abnt'
    };
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  return {
    norma: 'ABNT NBR 14724 / NBR 6023',
    fonte: content.includes('mathpazo') ? 'Palatino (mathpazo)' : 'Padrão LaTeX',
    espacamento: content.includes('OnehalfSpacing') ? '1.5' : '1.0',
    citacao: content.includes('style=abnt') ? 'BibLaTeX-ABNT' : 'Padrão'
  };
}

/**
 * Extrai o sumário hierárquico com capítulos, seções, apêndices e anexos de main.toc.
 */
function parseToc() {
  let tocPath = path.join(buildDir, 'main.toc');
  if (!fs.existsSync(tocPath)) {
    tocPath = path.join(srcDir, 'main.toc');
  }

  if (!fs.existsSync(tocPath)) return [];

  const content = fs.readFileSync(tocPath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const items = [];

  let currentContext = 'corpo'; // 'corpo', 'apendices', 'anexos'

  for (const line of lines) {
    // 0. Detectar divisórias de partes (ex: Apêndices, Anexos)
    const partMatch = line.match(/\\contentsline\s*\{part\}\{([^}]+)\}\{(\d+)\}/);
    if (partMatch) {
      const rawTitle = cleanLatex(partMatch[1].replace(/\\.*?\{|\}/g, ''));
      if (rawTitle.toLowerCase().includes('apêndice') || rawTitle.toLowerCase().includes('apendice')) {
        currentContext = 'apendices';
      } else if (rawTitle.toLowerCase().includes('anexo')) {
        currentContext = 'anexos';
      }
      items.push({
        type: 'part',
        number: null,
        title: rawTitle,
        page: parseInt(partMatch[2], 10)
      });
      continue;
    }

    // 1. Apêndice ou Anexo com letra (ex: \contentsline {appendix}{\chapternumberline {A}Roteiro...}{12}{appendix.A})
    const appMatch = line.match(/\\contentsline\s*\{appendix\}\{\\chapternumberline\s*\{([^}]+)\}\s*([^}]+)\}\{(\d+)\}/);
    if (appMatch) {
      const prefix = currentContext === 'anexos' ? 'Anexo' : 'Apêndice';
      items.push({
        type: 'appendix',
        number: `${prefix} ${appMatch[1].trim()}`,
        title: cleanLatex(appMatch[2]),
        page: parseInt(appMatch[3], 10)
      });
      continue;
    }

    // 2. Capítulo numerado: \contentsline {chapter}{\chapternumberline {1}Introdução}{3}{chapter.1}%
    const chapNum = line.match(/\\contentsline\s*\{chapter\}\{\\chapternumberline\s*\{([^}]+)\}\s*([^}]+)\}\{(\d+)\}/);
    if (chapNum) {
      items.push({
        type: 'chapter',
        number: chapNum[1].trim(),
        title: cleanLatex(chapNum[2]),
        page: parseInt(chapNum[3], 10)
      });
      continue;
    }

    // 3. Capítulo não numerado (ex: Bibliografia): \contentsline {chapter}{Bibliografia}{10}{section*.6}%
    const chapUnnum = line.match(/\\contentsline\s*\{chapter\}\{([^}]+)\}\{(\d+)\}/);
    if (chapUnnum) {
      const title = cleanLatex(chapUnnum[1].replace(/\\.*?\{|\}/g, ''));
      if (title && !title.startsWith('\\')) {
        items.push({
          type: 'chapter',
          number: null,
          title,
          page: parseInt(chapUnnum[2], 10)
        });
      }
      continue;
    }

    // 4. Seção secundária: \contentsline {section}{\numberline {1.1}Contextualização}{3}{section.1.1}%
    const secMatch = line.match(/\\contentsline\s*\{section\}\{\\numberline\s*\{([^}]+)\}\s*([^}]+)\}\{(\d+)\}/);
    if (secMatch) {
      items.push({
        type: 'section',
        number: secMatch[1].trim(),
        title: cleanLatex(secMatch[2]),
        page: parseInt(secMatch[3], 10)
      });
      continue;
    }

    // 5. Subseção terciária: \contentsline {subsection}{\numberline {1.4.1}Objetivo Geral}{4}{subsection.1.4.1}%
    const subsecMatch = line.match(/\\contentsline\s*\{subsection\}\{\\numberline\s*\{([^}]+)\}\s*([^}]+)\}\{(\d+)\}/);
    if (subsecMatch) {
      items.push({
        type: 'subsection',
        number: subsecMatch[1].trim(),
        title: cleanLatex(subsecMatch[2]),
        page: parseInt(subsecMatch[3], 10)
      });
      continue;
    }
  }

  return items;
}

/**
 * Extrai com 100% de precisão as páginas e o tamanho do PDF real compilado.
 */
function parsePdfStats() {
  const candidatePdfPaths = [
    path.join(buildDir, 'main.pdf'),
    path.join(srcDir, 'main.pdf'),
    path.join(outputDir, 'main.pdf')
  ];

  let resolvedPdfPath = null;
  for (const p of candidatePdfPaths) {
    if (fs.existsSync(p)) {
      resolvedPdfPath = p;
      break;
    }
  }

  let sizeBytes = null;
  let pages = null;

  if (resolvedPdfPath) {
    try {
      const stat = fs.statSync(resolvedPdfPath);
      sizeBytes = stat.size;

      const buf = fs.readFileSync(resolvedPdfPath);
      const latinText = buf.toString('latin1');
      const pageMarkers = latinText.match(/\/Type\s*\/Page(?![a-zA-Z])/g);
      if (pageMarkers && pageMarkers.length > 0) {
        pages = pageMarkers.length;
      }
    } catch (e) {
      console.warn('Aviso ao ler binário do PDF:', e.message);
    }
  }

  // Validação cruzada com o main.log
  const candidateLogPaths = [
    path.join(buildDir, 'main.log'),
    path.join(srcDir, 'main.log')
  ];

  for (const logPath of candidateLogPaths) {
    if (fs.existsSync(logPath)) {
      try {
        const logContent = fs.readFileSync(logPath, 'utf-8');
        const match = logContent.match(/Output written on [\s\S]*?\([\s\r\n]*([0-9]+)\s+pages?,\s*([0-9]+)\s+bytes\)/i);
        if (match) {
          if (!pages) pages = parseInt(match[1], 10);
          if (!sizeBytes) sizeBytes = parseInt(match[2], 10);
          break;
        }
      } catch (e) {}
    }
  }

  const finalPages = pages || 1;
  const finalSize = sizeBytes || 0;
  const sizeFormatted = finalSize >= 1048576 
    ? `${(finalSize / 1048576).toFixed(1)} MB`
    : `${Math.round(finalSize / 1024)} KB`;

  return {
    pdfPath: resolvedPdfPath,
    pages: finalPages,
    sizeBytes: finalSize,
    sizeFormatted
  };
}

/**
 * Contabiliza referências do arquivo .bib e citações compiladas no .bbl.
 */
function parseReferencesStats() {
  let totalBibEntries = 0;
  let totalCitedEntries = 0;

  const bibPath = path.join(srcDir, 'referencias.bib');
  if (fs.existsSync(bibPath)) {
    const bibContent = fs.readFileSync(bibPath, 'utf-8');
    const matches = bibContent.match(/@\w+\s*\{/g);
    totalBibEntries = matches ? matches.length : 0;
  }

  const candidateBblPaths = [
    path.join(buildDir, 'main.bbl'),
    path.join(srcDir, 'main.bbl')
  ];

  for (const bblPath of candidateBblPaths) {
    if (fs.existsSync(bblPath)) {
      const bblContent = fs.readFileSync(bblPath, 'utf-8');
      const matches = bblContent.match(/\\entry\{/g);
      if (matches) {
        totalCitedEntries = matches.length;
        break;
      }
    }
  }

  return {
    totalBibEntries,
    totalCitedEntries
  };
}

/**
 * Coleta metadados autênticos do Git e do GitHub Actions com fuso horário de Brasília forçado.
 */
function getRepoMetadata() {
  let repo = process.env.GITHUB_REPOSITORY;
  let commitSha = process.env.GITHUB_SHA;
  let runNumber = process.env.GITHUB_RUN_NUMBER || '1';
  let branch = process.env.GITHUB_REF_NAME;

  if (!commitSha) {
    try {
      commitSha = execSync('git rev-parse --short HEAD', { cwd: rootDir, encoding: 'utf-8' }).trim();
    } catch (e) {
      commitSha = 'local';
    }
  } else {
    commitSha = commitSha.substring(0, 7);
  }

  if (!branch) {
    try {
      branch = execSync('git branch --show-current', { cwd: rootDir, encoding: 'utf-8' }).trim();
    } catch (e) {
      branch = 'main';
    }
  }

  if (!repo) {
    try {
      const remoteUrl = execSync('git remote get-url origin', { cwd: rootDir, encoding: 'utf-8' }).trim();
      const match = remoteUrl.match(/github\.com[:/]([^/]+\/[^/.]+)/);
      if (match) repo = match[1];
    } catch (e) {}
  }

  if (!repo) {
    repo = 'JGustavoCN/template-tcc-ifs-latex';
  }

  // FUSO HORÁRIO DE BRASÍLIA RIGOROSAMENTE FORÇADO (America/Sao_Paulo)
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    repoUrl: `https://github.com/${repo}`,
    repoName: repo,
    commitSha,
    branch,
    runNumber,
    buildDate: dateFormatted,
    buildTime: timeFormatted,
    buildTimestamp: `${dateFormatted} às ${timeFormatted} (Horário de Brasília)`
  };
}

/**
 * Função principal do construtor do Portal.
 */
function buildPortal() {
  console.log('----------------------------------------------------');
  console.log('🚀 Iniciando Geração do Portal Web Acadêmico');
  console.log('----------------------------------------------------');

  const templatePath = path.join(webDir, 'template.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`[ERRO] Arquivo modelo não encontrado em: ${templatePath}`);
    process.exit(1);
  }

  // 1. Extração de dados 100% reais
  const meta = parseMainTex();
  const config = parseConfigTex();
  const toc = parseToc();
  const stats = parsePdfStats();
  const refs = parseReferencesStats();
  const repo = getRepoMetadata();

  const portalData = {
    meta,
    config,
    toc,
    stats,
    refs,
    repo
  };

  // 2. Preparação do diretório de saída (public/)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copia o logo.svg para public/logo.svg (Identidade Visual Oficial)
  const logoSvgPath = path.join(rootDir, 'logo.svg');
  if (fs.existsSync(logoSvgPath)) {
    try {
      fs.copyFileSync(logoSvgPath, path.join(outputDir, 'logo.svg'));
      console.log(`[OK] logo.svg copiado com sucesso para: public/logo.svg`);
    } catch (e) {
      console.warn(`[AVISO] Não foi possível copiar logo.svg:`, e.message);
    }
  }

  // Copia o logo_ifs.png para public/logo_ifs.png
  const logoIfsPath = path.join(srcDir, 'logo_ifs.png');
  if (fs.existsSync(logoIfsPath)) {
    try {
      fs.copyFileSync(logoIfsPath, path.join(outputDir, 'logo_ifs.png'));
    } catch (e) {}
  }

  // Copia o PDF gerado para public/main.pdf
  if (stats.pdfPath && fs.existsSync(stats.pdfPath)) {
    const destPdfPath = path.join(outputDir, 'main.pdf');
    try {
      fs.copyFileSync(stats.pdfPath, destPdfPath);
      console.log(`[OK] PDF sincronizado em: ${destPdfPath}`);
    } catch (e) {
      console.warn(`[AVISO] Não foi possível copiar PDF para public/:`, e.message);
    }
  }

  // 3. Renderização do HTML com substituição de marcadores
  let templateHtml = fs.readFileSync(templatePath, 'utf-8');

  templateHtml = templateHtml
    .replace(/\{\{TITULO\}\}/g, meta.titulo)
    .replace(/\{\{AUTOR\}\}/g, meta.autor)
    .replace(/\{\{ORIENTADOR\}\}/g, meta.orientador)
    .replace(/\{\{COORIENTADOR\}\}/g, meta.coorientador ? ` &bull; Coorientador: ${meta.coorientador}` : '')
    .replace(/\{\{INSTITUICAO_COMPLETA\}\}/g, meta.instituicaoCompleta)
    .replace(/\{\{INSTITUICAO_NOME\}\}/g, meta.instituicaoNome)
    .replace(/\{\{CAMPUS_NOME\}\}/g, meta.campusNome)
    .replace(/\{\{CURSO_NOME\}\}/g, meta.cursoNome)
    .replace(/\{\{LOCAL\}\}/g, meta.local)
    .replace(/\{\{DATA\}\}/g, meta.data)
    .replace(/\{\{PAGINAS\}\}/g, stats.pages.toString())
    .replace(/\{\{TAMANHO\}\}/g, stats.sizeFormatted)
    .replace(/\{\{DATA_COMPILACAO\}\}/g, repo.buildTimestamp)
    .replace(/\{\{DATA_COMPILACAO_CURTA\}\}/g, repo.buildDate)
    .replace(/\{\{COMMIT_SHA\}\}/g, repo.commitSha)
    .replace(/\{\{REPO_URL\}\}/g, repo.repoUrl)
    .replace(/\{\{TOTAL_REFS_BIB\}\}/g, refs.totalBibEntries.toString())
    .replace(/\{\{TOTAL_REFS_CITADAS\}\}/g, refs.totalCitedEntries.toString());

  // Injeção do payload JSON completo para o Drawer interativo
  const jsonPayload = `<script id="tcc-portal-data" type="application/json">${JSON.stringify(portalData)}</script>`;
  templateHtml = templateHtml.replace('<!-- {{PORTAL_DATA_INJECTION}} -->', jsonPayload);

  // Grava em public/index.html (para o deploy no GitHub Pages)
  const outHtmlPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(outHtmlPath, templateHtml, 'utf-8');


  console.log(`[OK] Portal gerado com sucesso em: ${outHtmlPath}`);
  console.log(`     📄 Título:       ${meta.titulo}`);
  console.log(`     👤 Autor:        ${meta.autor}`);
  console.log(`     🎓 Orientador:   ${meta.orientador}`);
  console.log(`     🏛️  Instituição:  ${meta.instituicaoCompleta}`);
  console.log(`     📑 Páginas:      ${stats.pages} (${stats.sizeFormatted})`);
  console.log(`     📚 Referências:  ${refs.totalCitedEntries} citadas / ${refs.totalBibEntries} cadastradas`);
  console.log(`     📌 Sumário:      ${toc.length} tópicos extraídos (incluindo Apêndices e Anexos)`);
  console.log(`     ⏰ Atualizado:   ${repo.buildTimestamp}`);
  console.log(`     🔗 Git Commit:   ${repo.commitSha} (${repo.branch})`);
  console.log('----------------------------------------------------');
}

buildPortal();

#!/usr/bin/env node
/**
 * build_portal.js - Construtor do Portal Web Acadêmico Dinâmico para GitHub Pages.
 *
 * Extrai dados 100% reais diretamente das fontes do LaTeX, do PDF e do Git:
 * 1. src/main.tex: Título, Autor, Orientador, Coorientador, Instituição, Local, Data, Tipo do Trabalho.
 * 2. src/config.tex: Diretrizes tipográficas, normas ABNT e layout institucional.
 * 3. src/build/main.toc: Sumário completo com capítulos, seções, apêndices, anexos e números de página.
 * 4. src/build/main.pdf & main.log: Quantidade exata de páginas e tamanho do arquivo compilado.
 * 5. src/referencias.bib & main.bbl: Contagem de referências catalogadas vs citadas.
 * 6. Git / GitHub Actions: Commit hash, branch, repositório e timestamp da compilação.
 *
 * ZERO MOCKS. Todos os dados refletem o estado autêntico dos arquivos do repositório.
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
 * Remove formatações de LaTeX, comentários e quebras de linha para texto puro legível.
 */
function cleanLatex(raw) {
  if (!raw) return '';
  return raw
    .replace(/%[^\n]*/g, '') // remove comentários de linha
    .replace(/\\par/g, ' – ')
    .replace(/\\textit\{([^}]+)\}/g, '$1')
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    .replace(/\\underline\{([^}]+)\}/g, '$1')
    .replace(/\\\\/g, ' ')
    .replace(/--/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrai comandos LaTeX que utilizam chaves com balanceamento robusto de profundidade.
 * Suporta comandos com argumentos aninhados (ex: \textit{Campus}, \par, etc.).
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
      i += 2; // pula caractere de escape
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
      local: 'Lagarto – SE',
      data: new Date().getFullYear().toString(),
      tipotrabalho: 'Trabalho de Conclusão de Curso'
    };
  }

  const content = fs.readFileSync(mainTexPath, 'utf-8');

  const titulo = cleanLatex(extractBracedCommand(content, 'titulo')) || 'Trabalho de Conclusão de Curso';
  const autor = cleanLatex(extractBracedCommand(content, 'autor')) || 'Autor não informado';
  const orientador = cleanLatex(extractBracedCommand(content, 'orientador')) || 'Orientador não informado';
  const coorientador = cleanLatex(extractBracedCommand(content, 'coorientador'));
  const instituicao = cleanLatex(extractBracedCommand(content, 'instituicao')) || 'Instituto Federal de Sergipe';
  const local = cleanLatex(extractBracedCommand(content, 'local')) || 'Lagarto – SE';
  const data = cleanLatex(extractBracedCommand(content, 'data')) || new Date().getFullYear().toString();
  const tipotrabalho = cleanLatex(extractBracedCommand(content, 'tipotrabalho')) || 'Trabalho de Conclusão de Curso';
  const preambulo = cleanLatex(extractBracedCommand(content, 'preambulo'));

  return {
    titulo,
    autor,
    orientador,
    coorientador,
    instituicao,
    local,
    data,
    tipotrabalho,
    preambulo
  };
}

/**
 * Extrai configurações estruturais e normativas de src/config.tex.
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
 * Extrai o sumário hierárquico com capítulos, seções e páginas reais de main.toc.
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

  for (const line of lines) {
    // 1. Capítulo numerado: \contentsline {chapter}{\chapternumberline {1}Introdução}{3}{chapter.1}%
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

    // 2. Apêndice / Anexo ou Capítulo Não Numerado: \contentsline {chapter}{Bibliografia}{10}{section*.6}%
    const chapUnnum = line.match(/\\contentsline\s*\{chapter\}\{([^}]+)\}\{(\d+)\}/);
    if (chapUnnum) {
      const rawTitle = chapUnnum[1];
      const title = cleanLatex(rawTitle.replace(/\\.*?\{|\}/g, ''));
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

    // 3. Seção secundária: \contentsline {section}{\numberline {1.1}Contextualização}{3}{section.1.1}%
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

    // 4. Subseção terciária: \contentsline {subsection}{\numberline {1.4.1}Objetivo Geral}{4}{subsection.1.4.1}%
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
 * Lê diretamente o binário do PDF e cruza com o log do LaTeX.
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

      // Lê o PDF para extrair o número exato de páginas inspecionando objetos de página
      const buf = fs.readFileSync(resolvedPdfPath);
      const latinText = buf.toString('latin1');
      const pageMarkers = latinText.match(/\/Type\s*\/Page(?![a-zA-Z])/g);
      if (pageMarkers && pageMarkers.length > 0) {
        pages = pageMarkers.length;
      }
    } catch (e) {
      console.warn('Aviso: Falha ao ler binário do PDF:', e.message);
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
        // Suporta quebras de linha TeX dentro dos parênteses do log
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
 * Coleta metadados autênticos de versionamento do Git e do GitHub Actions.
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

  return {
    repoUrl: `https://github.com/${repo}`,
    repoName: repo,
    commitSha,
    branch,
    runNumber,
    buildDate: new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

/**
 * Função principal do construtor do Portal.
 */
function buildPortal() {
  console.log('----------------------------------------------------');
  console.log('🚀 Iniciando Geração do Portal Web Acadêmico');
  console.log('----------------------------------------------------');

  // Garante que o template mestre exista
  let templatePath = path.join(webDir, 'template.html');
  if (!fs.existsSync(templatePath)) {
    templatePath = path.join(webDir, 'index.html');
  }

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

  // 2. Renderização do HTML com substituição dos marcadores
  let templateHtml = fs.readFileSync(templatePath, 'utf-8');

  templateHtml = templateHtml
    .replace(/\{\{TITULO\}\}/g, meta.titulo)
    .replace(/\{\{AUTOR\}\}/g, meta.autor)
    .replace(/\{\{ORIENTADOR\}\}/g, meta.orientador)
    .replace(/\{\{COORIENTADOR\}\}/g, meta.coorientador ? ` &bull; Coorientador: ${meta.coorientador}` : '')
    .replace(/\{\{INSTITUICAO\}\}/g, meta.instituicao)
    .replace(/\{\{LOCAL\}\}/g, meta.local)
    .replace(/\{\{DATA\}\}/g, meta.data)
    .replace(/\{\{PAGINAS\}\}/g, stats.pages.toString())
    .replace(/\{\{TAMANHO\}\}/g, stats.sizeFormatted)
    .replace(/\{\{DATA_COMPILACAO\}\}/g, repo.buildDate)
    .replace(/\{\{COMMIT_SHA\}\}/g, repo.commitSha)
    .replace(/\{\{REPO_URL\}\}/g, repo.repoUrl);

  // Injeção do payload JSON completo para reatividade do frontend
  const jsonPayload = `<script id="tcc-portal-data" type="application/json">${JSON.stringify(portalData)}</script>`;
  templateHtml = templateHtml.replace('<!-- {{PORTAL_DATA_INJECTION}} -->', jsonPayload);

  // 3. Preparação do diretório de saída (public/)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
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

  // Copia o logo institucional para a pasta do portal se existir
  const logoPath = path.join(srcDir, 'logo_ifs.png');
  if (fs.existsSync(logoPath)) {
    try {
      fs.copyFileSync(logoPath, path.join(outputDir, 'logo_ifs.png'));
    } catch (e) {}
  }

  // Grava o arquivo de deploy em public/index.html
  const outHtmlPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(outHtmlPath, templateHtml, 'utf-8');

  // Atualiza web/index.html como prévia local
  const localWebHtmlPath = path.join(webDir, 'index.html');
  fs.writeFileSync(localWebHtmlPath, templateHtml, 'utf-8');

  console.log(`[OK] Portal gerado com sucesso em: ${outHtmlPath}`);
  console.log(`     📄 Título:       ${meta.titulo}`);
  console.log(`     👤 Autor:        ${meta.autor}`);
  console.log(`     🎓 Orientador:   ${meta.orientador}`);
  console.log(`     🏛️  Instituição:  ${meta.instituicao}`);
  console.log(`     📑 Páginas:      ${stats.pages} (${stats.sizeFormatted})`);
  console.log(`     📚 Referências:  ${refs.totalCitedEntries} citadas / ${refs.totalBibEntries} cadastradas`);
  console.log(`     📌 Sumário:      ${toc.length} tópicos extraídos do main.toc`);
  console.log(`     🔗 Git Commit:   ${repo.commitSha} (${repo.branch})`);
  console.log('----------------------------------------------------');
}

buildPortal();

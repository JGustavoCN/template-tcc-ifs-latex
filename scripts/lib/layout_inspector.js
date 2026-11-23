/**
 * layout_inspector.js - Módulo Genérico de Auditoria de Flutuadores, Diagramação e PDF para TCC.
 *
 * Analisa sem depender de convenções rígidas de nomes de \label:
 * 1. Preâmbulo (src/config.tex): placeins, barreira de \subsection, frações de flutuadores,
 *    \brokenpenalty, \pdfminorversion e incompatibilidade com o pacote caption.
 * 2. Proporções geométricas (/MediaBox) de figuras PDF em src/figuras/ (recursivo, sem Python).
 * 3. Cruzamento universal de main.toc + main.lot + main.lof + main.aux + arquivos .tex:
 *    - Catálogo completo de flutuadores (tabelas, figuras, quadros) com arquivo/linha de origem
 *    - Resolução exata de entradas de main.lot / main.lof -> arquivo .tex e linha do \caption
 *    - Detecção de Float Drift (vazamento além da seção/subseção de origem)
 *    - Detecção de Float Congestion (acúmulo de flutuadores em páginas consecutivas)
 *    - Verificação de especificadores brandos ([htbp] sem '!')
 */

const fs = require('fs');
const path = require('path');

class LayoutInspector {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.srcDir = path.join(rootDir, 'src');
    this.buildDir = path.join(this.srcDir, 'build');
    this.figurasDir = path.join(this.srcDir, 'figuras');
    this.configTexPath = path.join(this.srcDir, 'config.tex');

    // Caches preenchidos por inspectFloats() para reuso no check.js
    this.lotLineMap = new Map();
    this.lofLineMap = new Map();
    this.loqLineMap = new Map();
    this.floatsByAnchor = new Map();
    this.floatsByNumberAndType = new Map();
  }

  /**
   * Localiza um arquivo auxiliar em src/build/ com fallback para src/ (CI/CD ou Overleaf).
   */
  resolveBuildArtifact(filename) {
    const primary = path.join(this.buildDir, filename);
    if (fs.existsSync(primary)) return primary;
    const fallback = path.join(this.srcDir, filename);
    if (fs.existsSync(fallback)) return fallback;
    return null;
  }

  /**
   * Lista recursivamente arquivos com determinada extensão dentro de um diretório.
   */
  walkFiles(dirPath, ext) {
    const results = [];
    if (!fs.existsSync(dirPath)) return results;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        results.push(...this.walkFiles(fullPath, ext));
      } else if (entry.name.toLowerCase().endsWith(ext)) {
        results.push(fullPath);
      }
    }
    return results;
  }

  /**
   * Limpa comandos simples de LaTeX de um título para comparação normalizada.
   */
  normalizeTitle(raw) {
    if (!raw) return '';
    return raw
      .replace(/\\ignorespaces\s*/g, '')
      .replace(/\\(?:textit|textbf|texttt|emph|text|citeonline|cite|textcite)\*?\{([^}]*)\}/g, '$1')
      .replace(/\\[a-zA-Z]+\s*/g, ' ')
      .replace(/[{}~$]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /**
   * Extrai dimensões (largura, altura, aspect ratio) lendo o MediaBox do PDF diretamente.
   */
  getPdfMediaBox(filePath) {
    try {
      if (!fs.existsSync(filePath)) return null;
      const buf = fs.readFileSync(filePath);
      const content = buf.toString('latin1');
      const mediaBoxRegex = /\/MediaBox\s*\[\s*(-?[0-9.]+)\s+(-?[0-9.]+)\s+(-?[0-9.]+)\s+(-?[0-9.]+)\s*\]/;
      const match = content.match(mediaBoxRegex);
      if (match) {
        const width = Math.abs(parseFloat(match[3]) - parseFloat(match[1]));
        const height = Math.abs(parseFloat(match[4]) - parseFloat(match[2]));
        const ratio = width > 0 ? height / width : 1;
        return {
          width: Math.round(width),
          height: Math.round(height),
          ratio: parseFloat(ratio.toFixed(2)),
          inverseRatio: parseFloat((width / (height || 1)).toFixed(2))
        };
      }
    } catch (e) {}
    return null;
  }

  /**
   * Inspeciona figuras vetoriais PDF em src/figuras/ (incluindo subpastas) e alerta sobre proporções perigosas.
   */
  inspectFigures() {
    const issues = [];
    const pdfPaths = this.walkFiles(this.figurasDir, '.pdf');

    for (const pdfPath of pdfPaths) {
      const relPdf = path.relative(this.rootDir, pdfPath).replace(/\\/g, '/');
      const mmdPath = pdfPath.replace(/\.pdf$/i, '.mmd');
      const hasMmd = fs.existsSync(mmdPath);
      const relMmd = hasMmd ? path.relative(this.rootDir, mmdPath).replace(/\\/g, '/') : null;

      const dims = this.getPdfMediaBox(pdfPath);
      if (!dims) continue;

      if (dims.ratio > 2.2) {
        issues.push({
          file: relPdf,
          mmdFile: relMmd,
          width: dims.width,
          height: dims.height,
          ratio: dims.ratio,
          type: 'SELO_POSTAL_RISK',
          severity: 'WARNING',
          message: `Figura com proporção vertical extrema (1:${dims.ratio}). Em página A4, sua largura pode encolher demais para respeitar a altura útil, tornando textos ilegíveis.`,
          suggestion: hasMmd
            ? `Reestruture ${relMmd} em layout horizontal/multi-coluna ou use width=\\textwidth, height=0.75\\textheight, keepaspectratio.`
            : 'Ajuste a imagem para proporção equilibrada (ex: 4:3 ou 16:9) ou limite altura com height=0.75\\textheight, keepaspectratio.'
        });
      }

      if (dims.inverseRatio > 3.8) {
        issues.push({
          file: relPdf,
          mmdFile: relMmd,
          width: dims.width,
          height: dims.height,
          ratio: dims.ratio,
          type: 'ULTRA_WIDE_RISK',
          severity: 'SUGGESTION',
          message: `Figura com formato ultra-panorâmico (${dims.inverseRatio}:1). Pode gerar espaços vazios verticais excessivos.`,
          suggestion: 'Avalie reorganizar os elementos verticalmente ou ajustar a escala para equilibrar a página.'
        });
      }
    }

    return issues;
  }

  /**
   * Inspeciona parâmetros de flutuadores, tipografia e pacotes no preâmbulo (src/config.tex).
   */
  inspectPreamble() {
    const issues = [];
    if (!fs.existsSync(this.configTexPath)) {
      issues.push({
        file: 'src/config.tex',
        type: 'MISSING_CONFIG',
        severity: 'ERROR',
        message: 'Arquivo src/config.tex não encontrado.'
      });
      return issues;
    }

    const configContent = fs.readFileSync(this.configTexPath, 'utf-8');
    // Remove comentários de linha para não dar falso positivo em linhas comentadas
    const activeConfig = configContent
      .split(/\r?\n/)
      .map(l => l.replace(/(^|[^\\])%.*/, '$1'))
      .join('\n');

    // 1. Pacote placeins com opção section
    const hasPlaceins = /\\usepackage(\[[^\]]*\])?\{placeins\}/.test(activeConfig);
    const hasPlaceinsSection = /\\usepackage\[[^\]]*section[^\]]*\]\{placeins\}/.test(activeConfig);

    if (!hasPlaceins) {
      issues.push({
        file: 'src/config.tex',
        type: 'MISSING_PLACEINS',
        severity: 'WARNING',
        message: "Pacote 'placeins' não está carregado. Tabelas e figuras podem vazar para seções posteriores.",
        suggestion: "Adicione '\\usepackage[section,below]{placeins}' em src/config.tex."
      });
    } else if (!hasPlaceinsSection) {
      issues.push({
        file: 'src/config.tex',
        type: 'PLACEINS_NO_SECTION',
        severity: 'SUGGESTION',
        message: "O pacote 'placeins' está sem a opção '[section]'.",
        suggestion: "Use '\\usepackage[section,below]{placeins}' para conter flutuadores por seção."
      });
    }

    // 2. Barreira automática em \subsection
    if (!/\\pretocmd\{\\subsection\}\{\\FloatBarrier\}/.test(activeConfig)) {
      issues.push({
        file: 'src/config.tex',
        type: 'NO_SUBSECTION_BARRIER',
        severity: 'SUGGESTION',
        message: 'Sem barreira automática de flutuadores em \\subsection; tabelas podem invadir a subseção seguinte.',
        suggestion: "Adicione '\\usepackage{etoolbox}' e '\\pretocmd{\\subsection}{\\FloatBarrier}{}{}' em src/config.tex."
      });
    }

    // 3. Calibração de \topfraction
    const topFractionMatch = activeConfig.match(/\\renewcommand\{\\topfraction\}\{([0-9.]+)\}/);
    if (!topFractionMatch) {
      issues.push({
        file: 'src/config.tex',
        type: 'DEFAULT_TOPFRACTION',
        severity: 'WARNING',
        message: '\\topfraction padrão do LaTeX (0.70) pode rejeitar tabelas altas em páginas com texto, causando represamento.',
        suggestion: "Adicione '\\renewcommand{\\topfraction}{0.85}' em src/config.tex."
      });
    } else if (parseFloat(topFractionMatch[1]) < 0.80) {
      issues.push({
        file: 'src/config.tex',
        type: 'LOW_TOPFRACTION',
        severity: 'SUGGESTION',
        message: `\\topfraction configurado como ${topFractionMatch[1]}. Recomenda-se >= 0.85 para acomodar tabelas densas.`,
        suggestion: "Ajuste para '\\renewcommand{\\topfraction}{0.85}'."
      });
    }

    // 4. \brokenpenalty (evita hifenização cortando virada de página)
    const brokenPenaltyMatch = activeConfig.match(/\\brokenpenalty\s*=\s*(\d+)/);
    if (!brokenPenaltyMatch || parseInt(brokenPenaltyMatch[1], 10) < 10000) {
      issues.push({
        file: 'src/config.tex',
        type: 'MISSING_BROKENPENALTY',
        severity: 'SUGGESTION',
        message: '\\brokenpenalty=10000 não configurado; palavras hifenizadas podem ser partidas entre páginas.',
        suggestion: "Adicione '\\brokenpenalty=10000' junto de \\widowpenalty e \\clubpenalty em src/config.tex."
      });
    }

    // 5. Pacote proibido caption (conflita com memoir/abntex2)
    if (/\\usepackage(\[[^\]]*\])?\{caption\}/.test(activeConfig)) {
      issues.push({
        file: 'src/config.tex',
        type: 'PROHIBITED_CAPTION_PACKAGE',
        severity: 'ERROR',
        message: "O pacote 'caption' é incompatível com a classe 'memoir'/'abntex2' e quebra o layout ABNT.",
        suggestion: "Remova '\\usepackage{caption}' e use as macros nativas do memoir (\\captionnamefont, \\captiontitlefont)."
      });
    }

    return issues;
  }

  /**
   * Extrai todas as entradas de main.toc (capítulos, seções e subseções com página exata).
   */
  parseTocFile() {
    const tocFile = this.resolveBuildArtifact('main.toc');
    if (!tocFile) return [];

    const sections = [];
    const lines = fs.readFileSync(tocFile, 'utf-8').split(/\r?\n/);

    // Ex: \contentsline {section}{\numberline {4.6}Modelagem...}{67}{section.4.6}%
    // Ex: \contentsline {chapter}{\chapternumberline {4}Desenvolvimento...}{55}{chapter.4}%
    const tocRegex = /\\contentsline\s*\{(chapter|section|subsection)\}\{(?:\\(?:chapter)?numberline\s*\{([^}]*)\})?(.*)\}\{(\d+)\}\{([^}]*)\}/;

    for (const line of lines) {
      const m = line.match(tocRegex);
      if (m) {
        const level = m[1];
        const number = (m[2] || '').trim();
        const rawTitle = (m[3] || '').trim();
        const page = parseInt(m[4], 10);
        const anchor = (m[5] || '').trim();
        sections.push({
          level,
          number,
          title: rawTitle,
          normTitle: this.normalizeTitle(rawTitle),
          page,
          anchor,
          label: null
        });
      }
    }

    return sections;
  }

  /**
   * Extrai entradas de main.lot ou main.lof preservando o número exato da linha no arquivo!
   */
  parseListFile(filename, defaultType) {
    const listFile = this.resolveBuildArtifact(filename);
    const lineMap = new Map();
    if (!listFile) return lineMap;

    const lines = fs.readFileSync(listFile, 'utf-8').split(/\r?\n/);
    // Ex: \contentsline {table}{\numberline {13}{\ignorespaces Regras...}}{68}{table.4.13}%
    const entryRegex = /\\contentsline\s*\{([^}]+)\}\{\\numberline\s*\{([^}]+)\}\{(.*)\}\}\{(\d+)\}\{([^}]*)\}/;

    lines.forEach((line, idx) => {
      const m = line.match(entryRegex);
      if (m) {
        lineMap.set(idx + 1, {
          listFile: filename,
          listLine: idx + 1,
          envKind: m[1].trim(),
          type: defaultType,
          number: m[2].trim(),
          title: m[3].replace(/\\ignorespaces\s*/g, '').trim(),
          page: parseInt(m[4], 10),
          anchor: m[5].trim()
        });
      }
    });

    return lineMap;
  }

  /**
   * Resolve uma linha de main.lot, main.lof ou main.loq para a tabela/figura/quadro e o arquivo .tex de origem.
   */
  resolveListEntry(listKind, lineNum) {
    const map = listKind === 'lot' ? this.lotLineMap : (listKind === 'loq' ? this.loqLineMap : this.lofLineMap);
    if (!map || map.size === 0) return null;

    const entry = map.get(lineNum);
    if (!entry) return null;

    const floatInfo =
      (entry.anchor && this.floatsByAnchor.get(entry.anchor)) ||
      this.floatsByNumberAndType.get(`${entry.type}:${entry.number}`) ||
      null;

    return {
      ...entry,
      label: floatInfo ? floatInfo.label : null,
      sourceFile: floatInfo ? floatInfo.sourceFile : null,
      declLine: floatInfo ? floatInfo.declLine : null,
      captionLine: floatInfo ? floatInfo.captionLine : null
    };
  }

  /**
   * Realiza auditoria cruzada 100% genérica de flutuadores:
   * main.toc + main.lot + main.lof + main.aux vs código .tex.
   */
  inspectFloats() {
    this.lotLineMap = this.parseListFile('main.lot', 'Tabela');
    this.lofLineMap = this.parseListFile('main.lof', 'Figura');
    this.loqLineMap = this.parseListFile('main.loq', 'Quadro');
    this.floatsByAnchor = new Map();
    this.floatsByNumberAndType = new Map();

    const auxFile = this.resolveBuildArtifact('main.aux');
    if (!auxFile) {
      return {
        hasAux: false,
        floats: [],
        drifts: [],
        congestions: [],
        specifierIssues: []
      };
    }

    const auxContent = fs.readFileSync(auxFile, 'utf-8');
    const auxLines = auxContent.split(/\r?\n/);

    // 1. Carrega todas as seções/subseções reais do main.toc (independente de \label)
    const sections = this.parseTocFile();

    // 2. Mapeia TODOS os \newlabel do main.aux (sem restringir prefixo de nome!)
    // Formato hyperref: \newlabel{nome}{{num}{pag}{titulo}{ancora}{}}
    const labelsByName = new Map();
    const labelsByAnchor = new Map();
    const newlabelRegex = /\\newlabel\{([^}]+)\}\{\{([^}]*)\}\{([^}]*)\}\{(.*)\}\{([^}]*)\}\{[^}]*\}\}/;

    for (const line of auxLines) {
      const m = line.match(newlabelRegex);
      if (!m) continue;
      const label = m[1].trim();
      const number = m[2].trim();
      const page = parseInt(m[3], 10);
      const title = m[4].trim();
      const anchor = m[5].trim();
      if (isNaN(page)) continue;

      const info = { label, number, page, title, anchor };
      labelsByName.set(label, info);
      if (anchor) {
        labelsByAnchor.set(anchor, info);
      }

      // Vincula label à seção correspondente do ToC, se existir
      if (/^(chapter|section|subsection)\./.test(anchor)) {
        const sec = sections.find(s => s.anchor === anchor);
        if (sec) sec.label = label;
      }
    }

    // Se main.toc não existia, faz fallback para seções presentes no main.aux
    if (sections.length === 0) {
      for (const info of labelsByName.values()) {
        if (/^(chapter|section|subsection)\./.test(info.anchor)) {
          const level = info.anchor.split('.')[0];
          sections.push({
            level,
            number: info.number,
            title: info.title,
            normTitle: this.normalizeTitle(info.title),
            page: info.page,
            anchor: info.anchor,
            label: info.label
          });
        }
      }
    }

    // 3. Monta o registro mestre de flutuadores a partir de main.lot + main.lof + âncoras do main.aux
    const floatsByKey = new Map();

    const registerFloat = (entry) => {
      const anchor = entry.anchor || '';
      const auxInfo = anchor ? labelsByAnchor.get(anchor) : null;
      const label = entry.label || (auxInfo ? auxInfo.label : null);
      const mapKey = label || anchor || `${entry.type}:${entry.number}`;

      if (!floatsByKey.has(mapKey)) {
        const fl = {
          label,
          anchor,
          number: entry.number,
          page: entry.page,
          title: entry.title || (auxInfo ? auxInfo.title : ''),
          type: entry.type,
          sourceFile: null,
          declLine: null,
          captionLine: null,
          specifier: null,
          sectionLevel: null,
          sectionTitle: null,
          sectionLabel: null,
          sectionPage: null,
          sectionIndex: -1,
          references: []
        };
        floatsByKey.set(mapKey, fl);
        if (anchor) this.floatsByAnchor.set(anchor, fl);
        this.floatsByNumberAndType.set(`${fl.type}:${fl.number}`, fl);
      }
    };

    for (const e of this.lotLineMap.values()) registerFloat(e);
    for (const e of this.lofLineMap.values()) registerFloat(e);
    for (const e of this.loqLineMap.values()) registerFloat(e);

    // Garante inclusão de flutuadores presentes no .aux mesmo se .lot/.lof não tiverem sido gerados
    for (const info of labelsByName.values()) {
      if (/^(table|figure|quadro)\./.test(info.anchor)) {
        const type = info.anchor.startsWith('figure.')
          ? 'Figura'
          : (info.anchor.startsWith('quadro.') ? 'Quadro' : 'Tabela');
        registerFloat({
          label: info.label,
          anchor: info.anchor,
          number: info.number,
          page: info.page,
          title: info.title,
          type
        });
      }
    }

    // 4. Escaneia arquivos .tex para correlacionar declaração, linha do \caption, especificador e seção
    const texFiles = this.getTexFiles();
    const envCounters = { figure: 0, table: 0, quadro: 0 };

    for (const filePath of texFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relPath = path.relative(this.rootDir, filePath).replace(/\\/g, '/');
      const lines = content.split(/\r?\n/);

      let currentSec = null;

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();
        if (trimmed.startsWith('%')) continue;
        const line = rawLine.replace(/(^|[^\\])%.*/, '$1');

        // Atualiza seção/subseção corrente
        const secHeader = line.match(/\\(chapter|section|subsection)\*?(?:\[[^\]]*\])?\{(.+)\}/);
        if (secHeader) {
          const level = secHeader[1];
          const title = secHeader[2].trim();
          let secLabel = null;
          for (let k = i; k <= Math.min(i + 2, lines.length - 1); k++) {
            const lm = lines[k].match(/\\label\{([^}]+)\}/);
            if (lm) {
              secLabel = lm[1].trim();
              break;
            }
          }
          currentSec = { level, title, normTitle: this.normalizeTitle(title), label: secLabel, line: i + 1 };
        }

        // Procura início de ambiente flutuante
        const envBegin = line.match(/\\begin\{(figure|table|quadro)\}(?:\[([^\]]*)\])?/);
        if (envBegin) {
          const envKind = envBegin[1];
          envCounters[envKind]++;
          const specifier = envBegin[2] || '';
          const typeName = envKind === 'figure' ? 'Figura' : (envKind === 'quadro' ? 'Quadro' : 'Tabela');

          let foundLabel = null;
          let captionLine = i + 1;
          for (let j = i; j < Math.min(i + 80, lines.length); j++) {
            const lm = lines[j].match(/\\label\{([^}]+)\}/);
            if (lm && !foundLabel) foundLabel = lm[1].trim();
            if (/\\caption(?:\[[^\]]*\])?\{/.test(lines[j])) captionLine = j + 1;
            if (lines[j].includes(`\\end{${envKind}}`)) break;
          }

          // Encontra o registro correspondente (por label ou fallback por tipo+sequência)
          let fl = (foundLabel && floatsByKey.get(foundLabel)) || null;
          if (!fl) {
            fl = this.floatsByNumberAndType.get(`${typeName}:${envCounters[envKind]}`) || null;
          }

          if (fl) {
            fl.sourceFile = relPath;
            fl.declLine = i + 1;
            fl.captionLine = captionLine;
            fl.specifier = specifier;
            if (foundLabel && !fl.label) fl.label = foundLabel;

            if (currentSec) {
              fl.sectionLevel = currentSec.level;
              fl.sectionTitle = currentSec.title;
              fl.sectionLabel = currentSec.label;

              let secIdx = -1;
              if (currentSec.label) {
                secIdx = sections.findIndex(s => s.label === currentSec.label);
              }
              if (secIdx === -1) {
                secIdx = sections.findIndex(
                  s => s.level === currentSec.level && s.normTitle === currentSec.normTitle
                );
              }
              if (secIdx !== -1) {
                fl.sectionIndex = secIdx;
                fl.sectionPage = sections[secIdx].page;
              }
            }
          }
        }

        // Referências cruzadas
        const refMatches = line.matchAll(/\\(?:ref|autoref|cref|Cref)\{([^}]+)\}/g);
        for (const rm of refMatches) {
          const fl = floatsByKey.get(rm[1].trim());
          if (fl) {
            fl.references.push({ file: relPath, line: i + 1 });
          }
        }
      }
    }

    const floatsList = Array.from(floatsByKey.values()).sort((a, b) => a.page - b.page);

    // 5. Análise de Float Drift e Especificadores
    const drifts = [];
    const specifierIssues = [];

    floatsList.forEach(fl => {
      if (fl.specifier && !fl.specifier.includes('!') && !fl.specifier.includes('H')) {
        specifierIssues.push({
          label: fl.label,
          number: fl.number,
          type: fl.type,
          file: fl.sourceFile,
          line: fl.declLine,
          specifier: fl.specifier,
          message: `${fl.type} ${fl.number}${fl.label ? ` (${fl.label})` : ''} usa especificador brando '[${fl.specifier}]'. Prefira '[!htbp]' para maior flexibilidade de encaixe.`
        });
      }

      if (fl.sectionPage !== null && fl.sectionIndex !== -1) {
        // Encontra o próximo cabeçalho de mesmo nível ou superior no main.toc
        const levelRank = { chapter: 1, section: 2, subsection: 3 };
        const myRank = levelRank[fl.sectionLevel] || 2;
        let nextBoundary = null;
        for (let s = fl.sectionIndex + 1; s < sections.length; s++) {
          const candRank = levelRank[sections[s].level] || 2;
          if (candRank <= myRank) {
            nextBoundary = sections[s];
            break;
          }
        }

        const pageDiff = fl.page - fl.sectionPage;
        // Vazou para página ESTRITAMENTE posterior ao início da próxima seção/subseção
        const leakedBeyondBoundary = nextBoundary && fl.page > nextBoundary.page;

        if (leakedBeyondBoundary || pageDiff >= 5) {
          const where = fl.sourceFile ? `${fl.sourceFile}:${fl.declLine}` : fl.sectionTitle;
          drifts.push({
            label: fl.label,
            number: fl.number,
            type: fl.type,
            title: fl.title,
            sourceFile: fl.sourceFile,
            line: fl.declLine,
            section: fl.sectionTitle || 'Seção',
            sectionPage: fl.sectionPage,
            pdfPage: fl.page,
            pageDiff,
            nextSection: nextBoundary ? `${nextBoundary.number} ${nextBoundary.title}` : null,
            nextSectionPage: nextBoundary ? nextBoundary.page : null,
            severity: (leakedBeyondBoundary || pageDiff >= 6) ? 'ERROR' : 'WARNING',
            message: leakedBeyondBoundary
              ? `${fl.type} ${fl.number} (${where}) declarada em '${fl.sectionTitle}' (pág. ${fl.sectionPage}) vazou para pág. ${fl.page}, após o início de '${nextBoundary.number} ${nextBoundary.title}' (pág. ${nextBoundary.page}).`
              : `${fl.type} ${fl.number} (${where}) declarada em '${fl.sectionTitle}' (pág. ${fl.sectionPage}), mas impressa na pág. ${fl.page} (+${pageDiff} págs).`,
            suggestion: "Adicione '\\FloatBarrier' após o elemento ou ajuste sua altura/especificador '[!htbp]'."
          });
        }
      }
    });

    // 6. Análise de Float Congestion (4 ou mais páginas seguidas contendo flutuadores)
    const pageFloatCounts = new Map();
    floatsList.forEach(fl => {
      pageFloatCounts.set(fl.page, (pageFloatCounts.get(fl.page) || 0) + 1);
    });

    const congestions = [];
    const sortedPages = Array.from(pageFloatCounts.keys()).sort((a, b) => a - b);
    let runStart = null;
    let runLength = 0;

    for (let k = 0; k < sortedPages.length; k++) {
      const curPage = sortedPages[k];
      const nextPage = sortedPages[k + 1];

      if (nextPage === curPage + 1) {
        if (runStart === null) runStart = curPage;
        runLength++;
      } else {
        if (runLength >= 3) { // 4+ páginas contínuas
          congestions.push({
            startPage: runStart,
            endPage: curPage,
            count: runLength + 1,
            message: `Sequência de ${runLength + 1} páginas contínuas com flutuadores (páginas ${runStart} a ${curPage}). Verifique se há acúmulo excessivo de tabelas/figuras com pouco texto entre elas.`
          });
        }
        runStart = null;
        runLength = 0;
      }
    }

    return {
      hasAux: true,
      floats: floatsList,
      drifts,
      congestions,
      specifierIssues
    };
  }

  getTexFiles() {
    const searchDirs = ['capitulos', 'apendices', 'anexos'];
    const files = [];

    for (const dirName of searchDirs) {
      const targetDir = path.join(this.srcDir, dirName);
      if (fs.existsSync(targetDir)) {
        const items = fs.readdirSync(targetDir);
        for (const item of items) {
          if (item.endsWith('.tex')) {
            files.push(path.join(targetDir, item));
          }
        }
      }
    }

    const mainTex = path.join(this.srcDir, 'main.tex');
    if (fs.existsSync(mainTex)) files.push(mainTex);

    const preTex = path.join(this.srcDir, 'pre-textuais.tex');
    if (fs.existsSync(preTex)) files.push(preTex);

    return files.sort();
  }
}

module.exports = LayoutInspector;

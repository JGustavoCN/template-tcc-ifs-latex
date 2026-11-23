/**
 * pdf_geometry.js - Auditoria Geométrica do PDF compilado (Zero-Python First).
 *
 * Motor em cascata (Progressive Enhancement):
 *   1. Primário: pdftotext -bbox-layout (Poppler — já incluso no MiKTeX e poppler-utils)
 *   2. Fallback: Python + PyMuPDF (fitz), acionado apenas se pdftotext não estiver disponível
 *   3. Tinta real (--ink): mgs (MiKTeX Ghostscript) ou gs -sDEVICE=bbox para detectar
 *      figuras/bordas vetoriais ultrapassando margens físicas A4.
 *
 * Detecções realizadas:
 *   - Estouro real de margem direita/esquerda frente às margens ABNT (A4: 595.28 x 841.89 pt)
 *   - Risco de corte físico de página (ex: número de página cortado em Listas)
 *   - Invasão da margem inferior (rodapé)
 *   - Flutuador (Tabela/Quadro/Figura/Código) cortando parágrafo ao meio na mesma página
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Constantes ABNT NBR 14724 (1 cm = 28.3465 pt)
const CM_TO_PT = 28.3464567;
const ABNT_LEFT_PT = 3.0 * CM_TO_PT;   // 85.04 pt
const ABNT_RIGHT_PT = 2.0 * CM_TO_PT;  // 56.69 pt
const ABNT_BOTTOM_PT = 2.0 * CM_TO_PT; // 56.69 pt

function decodeXmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function commandExists(cmd, testArgs = ['--version']) {
  const res = spawnSync(cmd, testArgs, { stdio: 'pipe', encoding: 'utf-8' });
  return !res.error;
}

function detectPythonWithFitz() {
  for (const pyCmd of ['python', 'python3', 'py']) {
    const res = spawnSync(pyCmd, ['-c', 'import fitz; print("OK")'], {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    if (!res.error && res.status === 0 && (res.stdout || '').includes('OK')) {
      return pyCmd;
    }
  }
  return null;
}

function detectGhostscript() {
  for (const gsCmd of ['mgs', 'gs', 'gswin64c']) {
    if (commandExists(gsCmd, ['--version'])) {
      return gsCmd;
    }
  }
  return null;
}

/**
 * Faz o parse do XHTML emitido por `pdftotext -bbox-layout`.
 */
function parsePopplerBboxXml(xml) {
  const pages = [];
  const pageRegex = /<page\s+width="([0-9.]+)"\s+height="([0-9.]+)">([\s\S]*?)<\/page>/g;
  const blockRegex = /<block\s+xMin="([0-9.-]+)"\s+yMin="([0-9.-]+)"\s+xMax="([0-9.-]+)"\s+yMax="([0-9.-]+)">([\s\S]*?)<\/block>/g;
  const lineRegex = /<line\s+xMin="([0-9.-]+)"\s+yMin="([0-9.-]+)"\s+xMax="([0-9.-]+)"\s+yMax="([0-9.-]+)">([\s\S]*?)<\/line>/g;
  const wordRegex = /<word\s+xMin="([0-9.-]+)"\s+yMin="([0-9.-]+)"\s+xMax="([0-9.-]+)"\s+yMax="([0-9.-]+)">([\s\S]*?)<\/word>/g;

  let pageMatch;
  let pageNum = 0;

  while ((pageMatch = pageRegex.exec(xml)) !== null) {
    pageNum++;
    const width = parseFloat(pageMatch[1]);
    const height = parseFloat(pageMatch[2]);
    const pageBody = pageMatch[3];
    const blocks = [];

    let blockMatch;
    blockRegex.lastIndex = 0;
    while ((blockMatch = blockRegex.exec(pageBody)) !== null) {
      const bXMin = parseFloat(blockMatch[1]);
      const bYMin = parseFloat(blockMatch[2]);
      const bXMax = parseFloat(blockMatch[3]);
      const bYMax = parseFloat(blockMatch[4]);
      const blockBody = blockMatch[5];

      const lines = [];
      let lineMatch;
      lineRegex.lastIndex = 0;
      while ((lineMatch = lineRegex.exec(blockBody)) !== null) {
        const lXMin = parseFloat(lineMatch[1]);
        const lYMin = parseFloat(lineMatch[2]);
        const lXMax = parseFloat(lineMatch[3]);
        const lYMax = parseFloat(lineMatch[4]);
        const lineBody = lineMatch[5];

        const words = [];
        let wordMatch;
        wordRegex.lastIndex = 0;
        while ((wordMatch = wordRegex.exec(lineBody)) !== null) {
          words.push({
            xMin: parseFloat(wordMatch[1]),
            yMin: parseFloat(wordMatch[2]),
            xMax: parseFloat(wordMatch[3]),
            yMax: parseFloat(wordMatch[4]),
            text: decodeXmlEntities(wordMatch[5])
          });
        }

        const lineText = words.map(w => w.text).join(' ').trim();
        if (lineText.length > 0) {
          lines.push({
            xMin: lXMin,
            yMin: lYMin,
            xMax: lXMax,
            yMax: lYMax,
            text: lineText,
            words
          });
        }
      }

      const blockText = lines.map(l => l.text).join(' ').trim();
      if (blockText.length > 0) {
        blocks.push({
          xMin: bXMin,
          yMin: bYMin,
          xMax: bXMax,
          yMax: bYMax,
          text: blockText,
          lines
        });
      }
    }

    pages.push({ page: pageNum, width, height, blocks });
  }

  return pages;
}

/**
 * Extrai caixas geométricas via `pdftotext -bbox-layout` (Poppler).
 */
function extractWithPoppler(pdfPath) {
  const res = spawnSync('pdftotext', ['-bbox-layout', pdfPath, '-'], {
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024
  });

  if (res.error || res.status !== 0 || !res.stdout) {
    return null;
  }

  return parsePopplerBboxXml(res.stdout);
}

/**
 * Fallback progressivo: extrai caixas geométricas via Python + PyMuPDF (fitz).
 */
function extractWithPyMuPDF(pyCmd, pdfPath) {
  const pyScript = [
    'import sys, json, fitz',
    'doc = fitz.open(sys.argv[1])',
    'pages = []',
    'for idx, page in enumerate(doc):',
    '    rect = page.rect',
    '    d = page.get_text("dict")',
    '    blocks = []',
    '    for b in d.get("blocks", []):',
    '        if b.get("type", 0) != 0: continue',
    '        lines = []',
    '        for l in b.get("lines", []):',
    '            txt = "".join(s.get("text", "") for s in l.get("spans", [])).strip()',
    '            if not txt: continue',
    '            lb = l["bbox"]',
    '            lines.append({"xMin": lb[0], "yMin": lb[1], "xMax": lb[2], "yMax": lb[3], "text": txt, "words": []})',
    '        if not lines: continue',
    '        bb = b["bbox"]',
    '        blocks.append({"xMin": bb[0], "yMin": bb[1], "xMax": bb[2], "yMax": bb[3], "text": " ".join(x["text"] for x in lines), "lines": lines})',
    '    pages.append({"page": idx + 1, "width": rect.width, "height": rect.height, "blocks": blocks})',
    'print(json.dumps(pages, ensure_ascii=False))'
  ].join('\n');

  const res = spawnSync(pyCmd, ['-c', pyScript, pdfPath], {
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024
  });

  if (res.error || res.status !== 0 || !res.stdout) {
    return null;
  }

  try {
    return JSON.parse(res.stdout);
  } catch (e) {
    return null;
  }
}

/**
 * Auditoria opcional de tinta real (texto + figuras + bordas vetoriais) via Ghostscript (`mgs`/`gs`).
 */
function auditInkBoundingBoxes(gsCmd, pdfPath, pagesMeta) {
  const res = spawnSync(gsCmd, ['-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=bbox', pdfPath], {
    encoding: 'utf-8',
    maxBuffer: 16 * 1024 * 1024
  });

  if (res.error || res.status !== 0) return [];

  // Ghostscript escreve %%HiResBoundingBox em stderr
  const output = `${res.stderr || ''}\n${res.stdout || ''}`;
  const hiResRegex = /%%HiResBoundingBox:\s*([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)/g;
  const overflows = [];
  let match;
  let pageIdx = 0;

  while ((match = hiResRegex.exec(output)) !== null) {
    pageIdx++;
    const x0 = parseFloat(match[1]);
    const y0 = parseFloat(match[2]);
    const x1 = parseFloat(match[3]);
    const y1 = parseFloat(match[4]);

    // Ignora páginas completamente em branco (0 0 0 0)
    if (x0 === 0 && y0 === 0 && x1 === 0 && y1 === 0) continue;

    const meta = pagesMeta[pageIdx - 1] || { width: 595.28, height: 841.89 };
    const rightLimit = meta.width - ABNT_RIGHT_PT;

    if (x1 > rightLimit + 6.0) {
      const excessPt = parseFloat((x1 - rightLimit).toFixed(1));
      overflows.push({
        page: pageIdx,
        side: 'right',
        x1: parseFloat(x1.toFixed(1)),
        limitPt: parseFloat(rightLimit.toFixed(1)),
        excessPt,
        severity: x1 > meta.width - 8 ? 'ERROR' : 'WARNING',
        message: `Tinta/elemento visual na página ${pageIdx} ultrapassa a margem direita ABNT em ${excessPt}pt (x1=${x1.toFixed(1)}pt, limite=${rightLimit.toFixed(1)}pt).`
      });
    }
  }

  return overflows;
}

/**
 * Classifica se um bloco é cabeçalho de flutuador (Tabela/Quadro/Figura/Código) ou linha de Fonte.
 */
function isFloatCaptionBlock(text) {
  return /^(?:Tabela|Quadro|Figura|Gráfico|Código|Algoritmo|Ilustração)\s+\d+\s*[–—-]/i.test(text.trim());
}

function isFloatSourceBlock(text) {
  return /^Fonte\s*:/i.test(text.trim());
}

function isRunningHeaderOrPageNumber(block) {
  const txt = block.text.trim();
  if (block.yMax < 78) {
    if (/^\d+$/.test(txt)) return true;
    if (txt.length <= 90 && block.lines.length <= 2) return true;
  }
  return false;
}

function isHeadingOrListLike(block) {
  const txt = block.text.trim();
  // Títulos numerados (ex: "1 INTRODUÇÃO", "2.1 Conceitos") ou CAIXA ALTA
  if (/^\d+(?:\.\d+)*\s+[A-ZÀ-Ú]/.test(txt) && txt.length < 140) return true;
  if (txt === txt.toUpperCase() && /[A-ZÀ-Ú]{4,}/.test(txt) && txt.length < 120) return true;
  // Itens de lista / alíneas / marcadores
  if (/^(?:[•●◦▪–—-]|\(?[a-z]\)|[ivx]+\))\s+/i.test(txt)) return true;
  return false;
}

/**
 * Executa a auditoria geométrica completa sobre o PDF gerado.
 */
function inspectPdfGeometry(pdfPath, options = {}) {
  const result = {
    available: false,
    engine: null,
    inkEngine: null,
    pagesAnalyzed: 0,
    maxXRightPt: 0,
    rightLimitPt: parseFloat((595.28 - ABNT_RIGHT_PT).toFixed(1)),
    marginOverflows: [],
    bottomOverflows: [],
    splitParagraphs: [],
    inkOverflows: [],
    hint: null
  };

  if (!pdfPath || !fs.existsSync(pdfPath)) {
    result.hint = 'PDF compilado não encontrado para inspeção geométrica.';
    return result;
  }

  let pages = null;

  // 1. Motor Primário: pdftotext -bbox-layout (Poppler / MiKTeX — ZERO Python)
  if (commandExists('pdftotext', ['-v'])) {
    pages = extractWithPoppler(pdfPath);
    if (pages && pages.length > 0) {
      result.available = true;
      result.engine = 'pdftotext (Poppler/MiKTeX)';
    }
  }

  // 2. Motor Fallback: Python + PyMuPDF (fitz)
  if (!result.available) {
    const pyCmd = detectPythonWithFitz();
    if (pyCmd) {
      pages = extractWithPyMuPDF(pyCmd, pdfPath);
      if (pages && pages.length > 0) {
        result.available = true;
        result.engine = 'PyMuPDF (fitz)';
      }
    }
  }

  if (!result.available || !pages) {
    result.hint = 'Para ativar a auditoria geométrica do PDF, garanta `pdftotext` (MiKTeX / poppler-utils) no PATH ou instale `pip install pymupdf`.';
    return result;
  }

  result.pagesAnalyzed = pages.length;

  // Determina a partir de qual página começa o corpo textual (ex: Capítulo 1) para a regra de corte de parágrafo
  const firstTextualPage = options.firstTextualPage || 1;
  const referencePages = new Set(options.referencePages || []);

  for (const page of pages) {
    const rightLimit = page.width - ABNT_RIGHT_PT;
    const bottomLimit = page.height - ABNT_BOTTOM_PT;

    // 1. Estouro real de margem direita e margem inferior por linha
    const pageOverflows = [];
    for (const block of page.blocks) {
      for (const line of block.lines) {
        if (line.xMax > result.maxXRightPt) {
          result.maxXRightPt = parseFloat(line.xMax.toFixed(1));
        }

        // Tolerância de 5.0 pt para kerning / pontuação saliente / alinhamento
        if (line.xMax > rightLimit + 5.0) {
          const excessPt = parseFloat((line.xMax - rightLimit).toFixed(1));
          const isPageClip = line.xMax > page.width - 8.0;
          pageOverflows.push({
            page: page.page,
            xMax: parseFloat(line.xMax.toFixed(1)),
            limitPt: parseFloat(rightLimit.toFixed(1)),
            excessPt,
            severity: isPageClip ? 'ERROR' : 'WARNING',
            snippet: line.text.slice(0, 100),
            message: isPageClip
              ? `Página ${page.page}: texto/número cortado na borda física da folha A4 (xMax=${line.xMax.toFixed(1)}pt / largura=${page.width.toFixed(1)}pt).`
              : `Página ${page.page}: linha ultrapassa a margem direita ABNT em ${excessPt}pt (xMax=${line.xMax.toFixed(1)}pt, limite=${rightLimit.toFixed(1)}pt).`
          });
        }
      }

      // Margem inferior (ignora capa/folha de rosto — págs 1 e 2; no abntex2 a última linha normal
      // com entrelinha 1.5 e descendentes pode alcançar ~800pt em A4 de 841.89pt, logo alerta acima de ~807pt)
      if (page.page >= 3 && block.yMax > bottomLimit + 22.0) {
        const excessPt = parseFloat((block.yMax - bottomLimit).toFixed(1));
        result.bottomOverflows.push({
          page: page.page,
          yMax: parseFloat(block.yMax.toFixed(1)),
          limitPt: parseFloat(bottomLimit.toFixed(1)),
          excessPt,
          snippet: block.text.slice(0, 90),
          message: `Página ${page.page}: conteúdo invade a margem inferior ABNT em ${excessPt}pt (yMax=${block.yMax.toFixed(1)}pt).`
        });
      }
    }

    // Mantém os 3 piores estouros por página para evitar poluição
    pageOverflows.sort((a, b) => b.excessPt - a.excessPt);
    result.marginOverflows.push(...pageOverflows.slice(0, 3));

    // 2. Flutuador cortando parágrafo ao meio (apenas no corpo textual, fora de referências)
    if (page.page >= firstTextualPage && !referencePages.has(page.page)) {
      const contentBlocks = page.blocks
        .filter(b => !isRunningHeaderOrPageNumber(b))
        .sort((a, b) => a.yMin - b.yMin);

      // Identifica intervalos [startIdx..endIdx] correspondentes a flutuadores na página
      let i = 0;
      while (i < contentBlocks.length) {
        if (isFloatCaptionBlock(contentBlocks[i].text)) {
          const floatStart = i;
          let floatEnd = i;
          const floatTitle = contentBlocks[i].text.slice(0, 80);

          // Avança até encontrar o bloco "Fonte:" do flutuador (no máximo 25 blocos adiante)
          for (let j = i; j < Math.min(contentBlocks.length, i + 25); j++) {
            if (isFloatSourceBlock(contentBlocks[j].text)) {
              floatEnd = j;
              break;
            }
            // Se encontrar outro título de flutuador antes de "Fonte:", para antes dele
            if (j > i && isFloatCaptionBlock(contentBlocks[j].text)) {
              floatEnd = j - 1;
              break;
            }
          }

          const prevBlock = floatStart > 0 ? contentBlocks[floatStart - 1] : null;
          const nextBlock = floatEnd + 1 < contentBlocks.length ? contentBlocks[floatEnd + 1] : null;

          if (prevBlock && nextBlock) {
            const prevText = prevBlock.text.trim();
            const nextText = nextBlock.text.trim();

            const prevLooksLikeProse =
              prevText.length >= 35 &&
              !isHeadingOrListLike(prevBlock) &&
              !isFloatSourceBlock(prevText) &&
              !isFloatCaptionBlock(prevText);

            const nextLooksLikeProse =
              nextText.length >= 20 &&
              !isHeadingOrListLike(nextBlock) &&
              !isFloatSourceBlock(nextText) &&
              !isFloatCaptionBlock(nextText);

            const prevEndsMidSentence = !/[.?!:;»”"'\]]$/.test(prevText);
            const nextStartsLowercase = /^[a-zà-öø-ÿ]/.test(nextText);

            if (prevLooksLikeProse && nextLooksLikeProse && prevEndsMidSentence && nextStartsLowercase) {
              const tail = prevText.slice(-55);
              const head = nextText.slice(0, 55);
              result.splitParagraphs.push({
                page: page.page,
                floatTitle,
                beforeSnippet: `...${tail}`,
                afterSnippet: `${head}...`,
                message: `Página ${page.page}: flutuador ("${floatTitle}") aparenta cortar um parágrafo ao meio.`,
                suggestion: 'Use [!htbp] ou mova a declaração do flutuador para depois do ponto final do parágrafo.'
              });
            }
          }

          i = floatEnd + 1;
        } else {
          i++;
        }
      }
    }
  }

  // 3. Auditoria opcional de tinta real (figuras/bordas vetoriais) via Ghostscript (`--ink`)
  if (options.checkInk) {
    const gsCmd = detectGhostscript();
    if (gsCmd) {
      result.inkEngine = `${gsCmd} (-sDEVICE=bbox)`;
      result.inkOverflows = auditInkBoundingBoxes(gsCmd, pdfPath, pages);
    }
  }

  return result;
}

module.exports = {
  inspectPdfGeometry,
  detectGhostscript,
  detectPythonWithFitz,
  commandExists
};

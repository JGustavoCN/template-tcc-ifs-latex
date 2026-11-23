#!/usr/bin/env node
/**
 * preview_page.js - Renderiza páginas do PDF compilado em PNG para inspeção visual rápida.
 *
 * Motor em cascata (Zero-Python First + Progressive Enhancement):
 *   1. pdftoppm (Poppler — já incluso no MiKTeX e poppler-utils no Linux/macOS)
 *   2. gs / gswin64c (Ghostscript completo com device png16m)
 *   3. Python + PyMuPDF (fitz) como fallback oportunista
 *
 * Uso:
 *   node scripts/preview_page.js 14
 *   node scripts/preview_page.js 14-16
 *   node scripts/preview_page.js 1,14,18 --dpi=180
 *   node scripts/preview_page.js --issues
 *   node scripts/preview_page.js 1-3 --slides
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { commandExists, detectPythonWithFitz } = require('./lib/pdf_geometry');

const rootDir = path.resolve(__dirname, '..');

function printHelp() {
  console.log(`
Uso: node scripts/preview_page.js <paginas|--issues> [opcoes]

Exemplos:
  node scripts/preview_page.js 1                Renderiza apenas a pagina 1
  node scripts/preview_page.js 14-16            Renderiza as paginas 14, 15 e 16
  node scripts/preview_page.js 1,13,18          Renderiza paginas especificas
  node scripts/preview_page.js --issues         Renderiza paginas com alertas do check.js
  node scripts/preview_page.js 1-3 --slides     Renderiza paginas dos slides Beamer

Opcoes:
  --dpi=<N>       Resolucao em DPI (padrao: 150)
  --pdf=<arq>     Caminho explicito do PDF de entrada
  --slides        Usa slides/build/apresentacao.pdf como entrada
  --outdir=<dir>  Diretorio de saida (padrao: src/build/previews)
  --help, -h      Exibe esta ajuda
`);
}

function parsePageSpec(spec) {
  const pages = new Set();
  const parts = String(spec).split(',').map(s => s.trim()).filter(Boolean);
  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      const lo = Math.min(start, end);
      const hi = Math.max(start, end);
      for (let p = lo; p <= hi; p++) {
        if (p >= 1) pages.add(p);
      }
    } else if (/^\d+$/.test(part)) {
      const p = parseInt(part, 10);
      if (p >= 1) pages.add(p);
    } else {
      throw new Error(`Especificacao de pagina invalida: "${part}"`);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

function resolveInputPdf(options) {
  if (options.pdf) {
    return path.isAbsolute(options.pdf) ? options.pdf : path.join(rootDir, options.pdf);
  }
  if (options.slides) {
    return path.join(rootDir, 'slides', 'build', 'apresentacao.pdf');
  }
  const candidates = [
    path.join(rootDir, 'src', 'build', 'main.pdf'),
    path.join(rootDir, 'src', 'main.pdf'),
    path.join(rootDir, 'public', 'main.pdf')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

function collectIssuePages() {
  const res = spawnSync(process.execPath, [path.join(__dirname, 'check.js'), '--json', '--no-build', '--build-only'], {
    cwd: rootDir,
    encoding: 'utf-8',
    maxBuffer: 16 * 1024 * 1024
  });

  if (!res.stdout) return [];

  try {
    const report = JSON.parse(res.stdout);
    const pages = new Set();

    const add = (p) => {
      const n = parseInt(p, 10);
      if (!isNaN(n) && n >= 1) pages.add(n);
    };

    (report.buildDiagnostics?.layoutIssues?.underfullVbox || []).forEach(x => add(x.page));
    (report.buildDiagnostics?.layoutIssues?.overfullVbox || []).forEach(x => add(x.page));
    (report.buildDiagnostics?.layoutIssues?.overfullHbox || []).forEach(x => { if (x.pdfPage) add(x.pdfPage); });
    (report.layoutAudit?.floatDrifts || []).forEach(x => add(x.floatPage));
    (report.geometryAudit?.marginOverflows || []).forEach(x => add(x.page));
    (report.geometryAudit?.bottomOverflows || []).forEach(x => add(x.page));
    (report.geometryAudit?.splitParagraphs || []).forEach(x => add(x.page));
    (report.geometryAudit?.inkOverflows || []).forEach(x => add(x.page));

    return Array.from(pages).sort((a, b) => a - b).slice(0, 12);
  } catch (e) {
    return [];
  }
}

function renderPageWithPdftoppm(pdfPath, pageNum, dpi, outDir) {
  const prefix = path.join(outDir, `_tmp_p${pageNum}`);
  const res = spawnSync('pdftoppm', ['-png', '-r', String(dpi), '-f', String(pageNum), '-l', String(pageNum), pdfPath, prefix], {
    stdio: 'pipe',
    encoding: 'utf-8'
  });

  if (res.error || res.status !== 0) return null;

  const generated = fs.readdirSync(outDir)
    .filter(f => f.startsWith(`_tmp_p${pageNum}-`) && f.endsWith('.png'))
    .sort();

  if (generated.length === 0) return null;

  const finalPath = path.join(outDir, `page-${String(pageNum).padStart(3, '0')}.png`);
  fs.renameSync(path.join(outDir, generated[0]), finalPath);
  return finalPath;
}

function renderPageWithGs(gsCmd, pdfPath, pageNum, dpi, outDir) {
  const finalPath = path.join(outDir, `page-${String(pageNum).padStart(3, '0')}.png`);
  const res = spawnSync(
    gsCmd,
    [
      '-q', '-dSAFER', '-dBATCH', '-dNOPAUSE',
      '-sDEVICE=png16m',
      `-r${dpi}`,
      `-dFirstPage=${pageNum}`,
      `-dLastPage=${pageNum}`,
      `-sOutputFile=${finalPath}`,
      pdfPath
    ],
    { stdio: 'pipe', encoding: 'utf-8' }
  );

  if (res.error || res.status !== 0 || !fs.existsSync(finalPath)) return null;
  return finalPath;
}

function renderPagesWithPyMuPDF(pyCmd, pdfPath, pages, dpi, outDir) {
  const pyScript = [
    'import sys, os, json, fitz',
    'pdf_path = sys.argv[1]',
    'out_dir = sys.argv[2]',
    'dpi = int(sys.argv[3])',
    'pages = [int(p) for p in sys.argv[4].split(",") if p]',
    'doc = fitz.open(pdf_path)',
    'saved = []',
    'for p in pages:',
    '    if 1 <= p <= len(doc):',
    '        out = os.path.join(out_dir, f"page-{p:03d}.png")',
    '        doc[p - 1].get_pixmap(dpi=dpi).save(out)',
    '        saved.append(out)',
    'print(json.dumps(saved))'
  ].join('\n');

  const res = spawnSync(pyCmd, ['-c', pyScript, pdfPath, outDir, String(dpi), pages.join(',')], {
    encoding: 'utf-8'
  });

  if (res.error || res.status !== 0 || !res.stdout) return null;
  try {
    return JSON.parse(res.stdout);
  } catch (e) {
    return null;
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const options = {
    dpi: 150,
    pdf: null,
    slides: args.includes('--slides'),
    issues: args.includes('--issues'),
    outdir: null,
    pageSpecs: []
  };

  for (const arg of args) {
    if (arg.startsWith('--dpi=')) options.dpi = Math.max(72, Math.min(300, parseInt(arg.slice(6), 10) || 150));
    else if (arg.startsWith('--pdf=')) options.pdf = arg.slice(6);
    else if (arg.startsWith('--outdir=')) options.outdir = arg.slice(9);
    else if (!arg.startsWith('--')) options.pageSpecs.push(arg);
  }

  const pdfPath = resolveInputPdf(options);
  if (!fs.existsSync(pdfPath)) {
    console.error(`[ERRO] PDF nao encontrado em: ${pdfPath}`);
    console.error(options.slides ? 'Execute primeiro: make slides' : 'Execute primeiro: make build');
    process.exit(1);
  }

  let pages = [];
  if (options.issues) {
    pages = collectIssuePages();
    if (pages.length === 0) {
      console.log('[OK] Nenhuma pagina com alertas de layout ou geometria encontrada pelo check.js!');
      process.exit(0);
    }
    console.log(`[INFO] Paginas com alertas detectadas: ${pages.join(', ')}`);
  } else if (options.pageSpecs.length > 0) {
    try {
      pages = parsePageSpec(options.pageSpecs.join(','));
    } catch (e) {
      console.error(`[ERRO] ${e.message}`);
      process.exit(1);
    }
  } else {
    pages = [1];
  }

  const defaultOutDir = options.slides
    ? path.join(rootDir, 'slides', 'build', 'previews')
    : path.join(rootDir, 'src', 'build', 'previews');
  const outDir = options.outdir
    ? (path.isAbsolute(options.outdir) ? options.outdir : path.join(rootDir, options.outdir))
    : defaultOutDir;

  fs.mkdirSync(outDir, { recursive: true });

  const generatedFiles = [];
  let usedEngine = null;

  // 1. Motor primario: pdftoppm (Poppler / MiKTeX)
  if (commandExists('pdftoppm', ['-v'])) {
    usedEngine = 'pdftoppm (Poppler/MiKTeX)';
    for (const p of pages) {
      const f = renderPageWithPdftoppm(pdfPath, p, options.dpi, outDir);
      if (f) generatedFiles.push(f);
    }
  }

  // 2. Fallback: Ghostscript completo (gs / gswin64c)
  if (generatedFiles.length === 0) {
    const gsCmd = commandExists('gs', ['--version'])
      ? 'gs'
      : (commandExists('gswin64c', ['--version']) ? 'gswin64c' : null);
    if (gsCmd) {
      usedEngine = `${gsCmd} (Ghostscript)`;
      for (const p of pages) {
        const f = renderPageWithGs(gsCmd, pdfPath, p, options.dpi, outDir);
        if (f) generatedFiles.push(f);
      }
    }
  }

  // 3. Fallback oportunista: Python + PyMuPDF (fitz)
  if (generatedFiles.length === 0) {
    const pyCmd = detectPythonWithFitz();
    if (pyCmd) {
      usedEngine = 'PyMuPDF (fitz)';
      const files = renderPagesWithPyMuPDF(pyCmd, pdfPath, pages, options.dpi, outDir);
      if (files) generatedFiles.push(...files);
    }
  }

  if (generatedFiles.length === 0) {
    console.error('[ERRO] Nenhum motor de renderizacao PNG disponivel.');
    console.error('Instale Poppler (pdftoppm — ja incluso no MiKTeX), Ghostscript (gs) ou Python + PyMuPDF (pip install pymupdf).');
    process.exit(1);
  }

  console.log(`[OK] ${generatedFiles.length} previa(s) gerada(s) em ${options.dpi} DPI via ${usedEngine}:`);
  generatedFiles.forEach(f => {
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    const kb = Math.round(fs.statSync(f).size / 1024);
    console.log(`  • ${rel} (${kb} KB)`);
  });
}

main();

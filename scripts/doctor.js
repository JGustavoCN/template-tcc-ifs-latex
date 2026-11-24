#!/usr/bin/env node
/**
 * doctor.js - Diagnóstico completo de dependências e capacidades do Template TCC IFS.
 *
 * Verifica ferramentas obrigatórias (LaTeX/Perl) e opcionais (Node, Poppler, Ghostscript,
 * Beamer, Git, Python/PyMuPDF) e informa exatamente quais comandos estão prontos para uso.
 *
 * Uso:
 *   node scripts/doctor.js
 *   node scripts/doctor.js --json
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const isColor = process.stdout.isTTY && !process.env.NO_COLOR && !process.argv.includes('--no-color');
const GREEN = isColor ? '\x1b[32m' : '';
const YELLOW = isColor ? '\x1b[33m' : '';
const RED = isColor ? '\x1b[31m' : '';
const CYAN = isColor ? '\x1b[36m' : '';
const GRAY = isColor ? '\x1b[90m' : '';
const BOLD = isColor ? '\x1b[1m' : '';
const RESET = isColor ? '\x1b[0m' : '';

const isWin = process.platform === 'win32';

function probeCommand(cmd, args = ['--version'], options = {}) {
  const res = spawnSync(cmd, args, {
    encoding: 'utf-8',
    stdio: 'pipe',
    timeout: options.timeout || 20000,
    shell: !!options.shell
  });
  if (res.error) {
    return { available: false, version: null, error: res.error.code || res.error.message };
  }
  const combined = `${res.stdout || ''}\n${res.stderr || ''}`.trim();
  const lines = combined.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const meaningful = lines.find(l => !/^(?:Initial Win CP|I changed them|Reverting Windows|Rc files read)/i.test(l)) || lines[0] || '';
  return {
    available: res.status === 0 || meaningful.length > 0,
    version: meaningful.slice(0, 90),
    exitCode: res.status
  };
}

function probeLatexPackage(filename) {
  const res = spawnSync('kpsewhich', [filename], { encoding: 'utf-8', stdio: 'pipe', timeout: 8000 });
  if (res.error || res.status !== 0) {
    return { available: false, path: null };
  }
  const out = (res.stdout || '').trim();
  return { available: out.length > 0, path: out || null };
}

function probePyMuPDF() {
  for (const py of ['python', 'python3', 'py']) {
    const res = spawnSync(py, ['-c', 'import fitz; print(fitz.__doc__.splitlines()[0])'], {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 8000
    });
    if (!res.error && res.status === 0 && (res.stdout || '').trim()) {
      return { available: true, command: py, version: res.stdout.trim().slice(0, 90) };
    }
  }
  return { available: false, command: null, version: null };
}

function runDoctor(rootDir) {
  // 1. Ferramentas CLI
  const tools = {
    pdflatex: probeCommand('pdflatex', ['--version']),
    latexmk: probeCommand('latexmk', ['--version']),
    biber: probeCommand('biber', ['--version'], { timeout: 25000 }),
    perl: probeCommand('perl', ['--version']),
    kpsewhich: probeCommand('kpsewhich', ['--version']),
    git: probeCommand('git', ['--version']),
    node: { available: true, version: `Node.js ${process.version}` },
    npx: probeCommand('npx', ['--version'], { shell: isWin }),
    pdftotext: probeCommand('pdftotext', ['-v']),
    pdftoppm: probeCommand('pdftoppm', ['-v']),
    mgs: probeCommand('mgs', ['--version']),
    gs: probeCommand('gs', ['--version']),
    pdfcrop: probeCommand('pdfcrop', ['--version']),
    pymupdf: probePyMuPDF()
  };

  // 2. Pacotes LaTeX essenciais e opcionais (somente se kpsewhich estiver disponível)
  const latexPackages = {};
  const pkgList = [
    { key: 'abntex2', file: 'abntex2.cls', required: true },
    { key: 'biblatex', file: 'biblatex.sty', required: true },
    { key: 'biblatex-abnt', file: 'abnt.bbx', required: true },
    { key: 'placeins', file: 'placeins.sty', required: true },
    { key: 'pdfpages', file: 'pdfpages.sty', required: true },
    { key: 'beamer', file: 'beamer.cls', required: false }
  ];

  for (const pkg of pkgList) {
    if (tools.kpsewhich.available) {
      latexPackages[pkg.key] = { ...probeLatexPackage(pkg.file), file: pkg.file, required: pkg.required };
    } else {
      latexPackages[pkg.key] = { available: null, path: null, file: pkg.file, required: pkg.required };
    }
  }

  // 3. Estado do repositório / manifesto
  const manifestPath = path.join(rootDir, 'template-manifest.json');
  let manifestVersion = null;
  if (fs.existsSync(manifestPath)) {
    try {
      manifestVersion = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')).version || null;
    } catch (e) {}
  }

  const hasGhostscript = tools.mgs.available || tools.gs.available;
  const gsName = tools.mgs.available ? 'mgs (MiKTeX)' : (tools.gs.available ? 'gs' : null);
  const nodeMajor = parseInt(process.version.replace(/^v/, '').split('.')[0], 10) || 0;

  // 4. Matriz de capacidades reais do template
  const capabilities = [
    {
      name: 'Compilação do TCC (make build)',
      required: true,
      ready: tools.pdflatex.available && tools.latexmk.available && tools.biber.available && tools.perl.available,
      detail: tools.pdflatex.available && tools.latexmk.available && tools.biber.available && tools.perl.available
        ? 'pdflatex + latexmk + biber + perl prontos'
        : 'Instale MiKTeX/TeX Live + Strawberry Perl (no Windows, rode .\\setup-windows.ps1)'
    },
    {
      name: 'Auditoria ABNT, Logs e Flutuadores (make check)',
      required: false,
      ready: nodeMajor >= 18,
      detail: nodeMajor >= 18
        ? `Node.js ${process.version} (ativo)`
        : 'Recomendado Node.js 18+ (https://nodejs.org/)'
    },
    {
      name: 'Auditoria Geométrica do PDF (margens/parágrafos)',
      required: false,
      ready: tools.pdftotext.available || tools.pymupdf.available,
      detail: tools.pdftotext.available
        ? 'Motor primário ativo: pdftotext (Poppler/MiKTeX — zero Python)'
        : (tools.pymupdf.available
          ? `Motor fallback ativo: PyMuPDF (${tools.pymupdf.command})`
          : 'Instale Poppler (já incluso no MiKTeX / poppler-utils) ou pip install pymupdf')
    },
    {
      name: 'Auditoria de Tinta Real (make check --ink)',
      required: false,
      ready: hasGhostscript,
      detail: hasGhostscript
        ? `Ativo via ${gsName} (-sDEVICE=bbox)`
        : 'Opcional: instale Ghostscript (gs) ou MiKTeX completo (mgs)'
    },
    {
      name: 'Prévia Visual em PNG (make preview)',
      required: false,
      ready: tools.pdftoppm.available || tools.gs.available || tools.pymupdf.available,
      detail: tools.pdftoppm.available
        ? 'Ativo via pdftoppm (Poppler/MiKTeX)'
        : (tools.gs.available
          ? 'Ativo via Ghostscript (gs)'
          : (tools.pymupdf.available ? 'Ativo via PyMuPDF (fitz)' : 'Instale Poppler (pdftoppm) ou PyMuPDF'))
    },
    {
      name: 'Diagramas Mermaid locais (make figures)',
      required: false,
      ready: tools.npx.available,
      detail: tools.npx.available
        ? `npx pronto${tools.pdfcrop.available ? ' + pdfcrop' : ' (sem pdfcrop)'}`
        : 'Instale Node.js/npx ou use https://mermaid.live'
    },
    {
      name: 'Slides da Banca Beamer 16:9 (make slides)',
      required: false,
      ready: tools.latexmk.available && latexPackages.beamer.available === true,
      detail: latexPackages.beamer.available === true
        ? 'beamer.cls + biblatex prontos'
        : 'Instale o pacote LaTeX beamer no MiKTeX/TeX Live'
    },
    {
      name: 'Portal Web, Diff Visual, DOI e Update (portal/diff/add-ref/update)',
      required: false,
      ready: nodeMajor >= 18 && tools.git.available,
      detail: nodeMajor >= 18 && tools.git.available
        ? 'Node.js 18+ e Git prontos'
        : 'Requer Node.js 18+ e Git (https://git-scm.com/)'
    }
  ];

  const missingRequired = capabilities.filter(c => c.required && !c.ready);
  const missingOptional = capabilities.filter(c => !c.required && !c.ready);
  const missingLatexRequired = Object.entries(latexPackages)
    .filter(([, v]) => v.required && v.available === false)
    .map(([k]) => k);

  let status = 'OK';
  if (missingRequired.length > 0 || missingLatexRequired.length > 0) {
    status = 'ERROR';
  } else if (missingOptional.length > 0) {
    status = 'PARTIAL';
  }

  return {
    status,
    platform: process.platform,
    templateVersion: manifestVersion,
    tools,
    latexPackages,
    capabilities,
    summary: {
      readyCapabilities: capabilities.filter(c => c.ready).length,
      totalCapabilities: capabilities.length,
      missingRequired: missingRequired.map(c => c.name),
      missingOptional: missingOptional.map(c => c.name),
      missingLatexRequired
    }
  };
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso: node scripts/doctor.js [--json]

Verifica todas as dependências obrigatórias e opcionais do Template TCC IFS
(LaTeX, Biber, Perl, Node, Git, Poppler, Ghostscript, Beamer e PyMuPDF).
`);
    process.exit(0);
  }

  const rootDir = path.resolve(__dirname, '..');
  const report = runDoctor(rootDir);

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.status === 'ERROR' ? 1 : 0);
  }

  console.log(`\n${BOLD}${CYAN}🩺 TCC Doctor — Diagnóstico de Dependências e Capacidades${RESET}`);
  console.log(`${CYAN}─────────────────────────────────────────────────────────────${RESET}`);
  if (report.templateVersion) {
    console.log(`  Versão do Template: ${BOLD}v${report.templateVersion}${RESET}  |  SO: ${report.platform}`);
  }

  console.log(`\n${BOLD}1. Ferramentas do Sistema${RESET}`);
  const toolLabels = [
    ['pdflatex', 'Obrigatório (compilação PDF)'],
    ['latexmk', 'Obrigatório (orquestração LaTeX)'],
    ['biber', 'Obrigatório (referências ABNT)'],
    ['perl', 'Obrigatório (runtime do latexmk)'],
    ['git', 'Recomendado (diff, update, CI/CD)'],
    ['node', 'Recomendado (check, portal, diff, add-ref)'],
    ['npx', 'Opcional (Mermaid CLI — make figures)'],
    ['pdftotext', 'Opcional (auditoria geométrica sem Python)'],
    ['pdftoppm', 'Opcional (preview PNG sem Python)'],
    ['pdfcrop', 'Opcional (recorte vetorial de diagramas)'],
    ['mgs', 'Opcional (MiKTeX Ghostscript — --ink)'],
    ['gs', 'Opcional (Ghostscript Linux/Mac)'],
    ['pymupdf', 'Fallback opcional (Python + fitz)']
  ];

  for (const [key, role] of toolLabels) {
    const t = report.tools[key];
    // Não polui mostrando gs ausente no Windows se mgs já existe, nem mgs ausente fora do Windows se gs existe
    if (key === 'gs' && isWin && report.tools.mgs.available) continue;
    if (key === 'mgs' && !isWin && report.tools.gs.available) continue;

    const icon = t.available ? `${GREEN}[OK]${RESET}` : (role.startsWith('Obrigatório') ? `${RED}[FALTA]${RESET}` : `${YELLOW}[OPCIONAL]${RESET}`);
    const ver = t.available && t.version ? ` ${GRAY}— ${t.version}${RESET}` : '';
    console.log(`  ${icon} ${BOLD}${key.padEnd(11)}${RESET} (${role})${ver}`);
  }

  if (report.tools.kpsewhich.available) {
    console.log(`\n${BOLD}2. Pacotes LaTeX Verificados (kpsewhich)${RESET}`);
    for (const [pkg, info] of Object.entries(report.latexPackages)) {
      const icon = info.available ? `${GREEN}[OK]${RESET}` : (info.required ? `${RED}[FALTA]${RESET}` : `${YELLOW}[OPCIONAL]${RESET}`);
      console.log(`  ${icon} ${pkg.padEnd(15)} (${info.file})`);
    }
  }

  console.log(`\n${BOLD}3. Matriz de Recursos do Template${RESET}`);
  for (const cap of report.capabilities) {
    const icon = cap.ready ? `${GREEN}[PRONTO]${RESET}` : (cap.required ? `${RED}[BLOQUEADO]${RESET}` : `${YELLOW}[INDISP.]${RESET}`);
    console.log(`  ${icon} ${BOLD}${cap.name}${RESET}`);
    console.log(`           ${GRAY}${cap.detail}${RESET}`);
  }

  console.log(`\n${BOLD}Resumo:${RESET} ${report.summary.readyCapabilities}/${report.summary.totalCapabilities} recursos prontos.`);
  if (report.status === 'OK') {
    console.log(`${GREEN}${BOLD}🎉 Ambiente 100% pronto! Todas as ferramentas obrigatórias e opcionais estão ativas.${RESET}\n`);
    process.exit(0);
  } else if (report.status === 'PARTIAL') {
    console.log(`${YELLOW}ℹ️  O core LaTeX está pronto; alguns recursos opcionais listados acima estão desabilitados.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}⚠️  Faltam dependências obrigatórias para compilar o TCC. Instale-as antes de rodar make build.${RESET}\n`);
    process.exit(1);
  }
}

main();

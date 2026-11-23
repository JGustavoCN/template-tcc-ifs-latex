#!/usr/bin/env node
/**
 * diff_report.js - Relatório Inteligente de Mudanças (Word-Diff + Antes/Depois) via Git.
 *
 * Usa o motor nativo do Git (`--word-diff=porcelain` + `.gitattributes` `diff=tex`)
 * sem nenhuma dependência externa para gerar:
 * 1. Terminal colorido por capítulo/seção com saldo de palavras e alertas sensíveis
 * 2. Relatório Visual HTML interativo (src/build/diff.html) com modos Split/Inline e Dark/Light
 * 3. Relatório Markdown (--md) pronto para revisão com orientador ou agentes de IA
 * 4. Saída JSON estruturada (--json)
 *
 * Uso:
 *   node scripts/diff_report.js                  # Alterações locais vs HEAD (ou último commit se limpo)
 *   node scripts/diff_report.js HEAD~1           # Compara desde o commit anterior
 *   node scripts/diff_report.js v1.0..HEAD --html
 *   node scripts/diff_report.js --md
 *   node scripts/diff_report.js --json
 *   node scripts/diff_report.js --all            # Inclui também scripts/configs além de src/
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const isColorSupported = process.stdout.isTTY && !process.env.NO_COLOR && !process.argv.includes('--no-color');
const GREEN = isColorSupported ? '\x1b[32m' : '';
const RED = isColorSupported ? '\x1b[31m' : '';
const YELLOW = isColorSupported ? '\x1b[33m' : '';
const BLUE = isColorSupported ? '\x1b[34m' : '';
const CYAN = isColorSupported ? '\x1b[36m' : '';
const GRAY = isColorSupported ? '\x1b[90m' : '';
const BOLD = isColorSupported ? '\x1b[1m' : '';
const RESET = isColorSupported ? '\x1b[0m' : '';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function countWordsSimple(str) {
  const m = String(str || '').match(/[a-zA-ZÀ-ÿ0-9]+(?:[-'][a-zA-ZÀ-ÿ0-9]+)*/g);
  return m ? m.length : 0;
}

function extractCitations(str) {
  const keys = new Set();
  const re = /\\(?:cite|citeonline|textcite|parencite|citep|citet)\*?(?:\[[^\]]*\])?\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(str || '')) !== null) {
    m[1].split(',').map(k => k.trim()).filter(Boolean).forEach(k => keys.add(k));
  }
  return Array.from(keys);
}

function extractNumbers(str) {
  const m = String(str || '').match(/\b\d+(?:[.,]\d+)?%?/g);
  return m ? [...new Set(m)] : [];
}

function runGit(args, cwd) {
  const res = spawnSync('git', args, { cwd, encoding: 'utf-8', maxBuffer: 25 * 1024 * 1024 });
  if (res.error) throw res.error;
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

/**
 * Faz parse da saída de `git diff --word-diff=porcelain`.
 */
function parsePorcelainDiff(rawDiff) {
  const files = [];
  if (!rawDiff || !rawDiff.trim()) return files;

  const lines = rawDiff.split(/\r?\n/);
  let currentFile = null;
  let currentHunk = null;
  let currentLineSegs = [];

  const flushLine = () => {
    if (!currentHunk || currentLineSegs.length === 0) return;
    const hasChange = currentLineSegs.some(s => s.type !== 'same');
    currentHunk.lines.push({ hasChange, segments: currentLineSegs });
    currentLineSegs = [];
  };

  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      flushLine();
      const match = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
      currentFile = {
        file: match ? match[2] : line.slice(11),
        hunks: [],
        wordsAdded: 0,
        wordsRemoved: 0,
        citationsAdded: [],
        citationsRemoved: [],
        numericChanges: false
      };
      files.push(currentFile);
      currentHunk = null;
      continue;
    }

    if (!currentFile) continue;

    if (
      line.startsWith('index ') ||
      line.startsWith('--- ') ||
      line.startsWith('+++ ') ||
      line.startsWith('new file mode') ||
      line.startsWith('deleted file mode') ||
      line.startsWith('old mode') ||
      line.startsWith('new mode') ||
      line.startsWith('Binary files ')
    ) {
      continue;
    }

    if (line.startsWith('@@ ')) {
      flushLine();
      const hunkMatch = line.match(/^@@ -(\d+(?:,\d+)?) \+(\d+(?:,\d+)?) @@(.*)$/);
      currentHunk = {
        header: line,
        oldRange: hunkMatch ? hunkMatch[1] : '',
        newRange: hunkMatch ? hunkMatch[2] : '',
        section: hunkMatch && hunkMatch[3] ? hunkMatch[3].trim() : '',
        lines: []
      };
      currentFile.hunks.push(currentHunk);
      continue;
    }

    if (!currentHunk) continue;

    if (line === '~') {
      flushLine();
    } else if (line.startsWith('+')) {
      const text = line.slice(1);
      currentLineSegs.push({ type: 'add', text });
      currentFile.wordsAdded += countWordsSimple(text);
    } else if (line.startsWith('-')) {
      const text = line.slice(1);
      currentLineSegs.push({ type: 'del', text });
      currentFile.wordsRemoved += countWordsSimple(text);
    } else if (line.startsWith(' ')) {
      currentLineSegs.push({ type: 'same', text: line.slice(1) });
    }
  }
  flushLine();

  // Pós-processa alertas sensíveis por arquivo (citações e valores numéricos)
  for (const f of files) {
    const addedBuf = [];
    const removedBuf = [];
    for (const h of f.hunks) {
      for (const ln of h.lines) {
        if (!ln.hasChange) continue;
        for (const seg of ln.segments) {
          if (seg.type === 'add') addedBuf.push(seg.text);
          if (seg.type === 'del') removedBuf.push(seg.text);
        }
      }
    }
    const addedStr = addedBuf.join(' ');
    const removedStr = removedBuf.join(' ');
    const addedCites = extractCitations(addedStr);
    const removedCites = extractCitations(removedStr);

    f.citationsAdded = addedCites.filter(c => !removedCites.includes(c));
    f.citationsRemoved = removedCites.filter(c => !addedCites.includes(c));

    const addedNums = extractNumbers(addedStr);
    const removedNums = extractNumbers(removedStr);
    f.numericChanges =
      addedNums.some(n => !removedNums.includes(n)) ||
      removedNums.some(n => !addedNums.includes(n));
  }

  return files;
}

function generateHtmlReport(report) {
  const fileCards = report.files.map((f, idx) => {
    const alerts = [];
    if (f.citationsRemoved.length > 0) {
      alerts.push(`<span class="badge badge-warn">Citações removidas: ${escapeHtml(f.citationsRemoved.join(', '))}</span>`);
    }
    if (f.citationsAdded.length > 0) {
      alerts.push(`<span class="badge badge-info">Citações adicionadas: ${escapeHtml(f.citationsAdded.join(', '))}</span>`);
    }
    if (f.numericChanges) {
      alerts.push(`<span class="badge badge-warn">Valores numéricos alterados</span>`);
    }

    const hunksHtml = f.hunks.map(h => {
      const secTitle = h.section ? `<span class="hunk-sec">${escapeHtml(h.section)}</span>` : '<span class="hunk-sec">(início do arquivo)</span>';
      const inlineRows = h.lines
        .filter(l => l.hasChange || l.segments.map(s => s.text).join('').trim().length > 0)
        .map(l => {
          const cls = l.hasChange ? 'line changed' : 'line ctx';
          const content = l.segments.map(seg => {
            if (seg.type === 'add') return `<ins>${escapeHtml(seg.text)}</ins>`;
            if (seg.type === 'del') return `<del>${escapeHtml(seg.text)}</del>`;
            return escapeHtml(seg.text);
          }).join('');
          return `<div class="${cls}">${content || '&nbsp;'}</div>`;
        }).join('\n');

      const beforeRows = h.lines.map(l => {
        const hasDel = l.segments.some(s => s.type === 'del');
        const onlyAdd = l.segments.every(s => s.type === 'add');
        if (onlyAdd) return `<div class="line empty">&nbsp;</div>`;
        const content = l.segments
          .filter(s => s.type !== 'add')
          .map(s => s.type === 'del' ? `<del>${escapeHtml(s.text)}</del>` : escapeHtml(s.text))
          .join('');
        return `<div class="line ${hasDel ? 'del-row' : 'ctx'}">${content || '&nbsp;'}</div>`;
      }).join('\n');

      const afterRows = h.lines.map(l => {
        const hasAdd = l.segments.some(s => s.type === 'add');
        const onlyDel = l.segments.every(s => s.type === 'del');
        if (onlyDel) return `<div class="line empty">&nbsp;</div>`;
        const content = l.segments
          .filter(s => s.type !== 'del')
          .map(s => s.type === 'add' ? `<ins>${escapeHtml(s.text)}</ins>` : escapeHtml(s.text))
          .join('');
        return `<div class="line ${hasAdd ? 'add-row' : 'ctx'}">${content || '&nbsp;'}</div>`;
      }).join('\n');

      return `
        <div class="hunk">
          <div class="hunk-header">
            <span class="hunk-range">-${escapeHtml(h.oldRange)} / +${escapeHtml(h.newRange)}</span>
            ${secTitle}
          </div>
          <div class="view-inline">${inlineRows}</div>
          <div class="view-split">
            <div class="split-col"><div class="col-label">Antes</div>${beforeRows}</div>
            <div class="split-col"><div class="col-label">Depois</div>${afterRows}</div>
          </div>
        </div>
      `;
    }).join('\n');

    return `
      <section class="file-card" data-file="${escapeHtml(f.file.toLowerCase())}" id="file-${idx}">
        <div class="file-header">
          <div class="file-title">${escapeHtml(f.file)}</div>
          <div class="file-stats">
            <span class="stat-add">+${f.wordsAdded} palavras</span>
            <span class="stat-del">-${f.wordsRemoved} palavras</span>
          </div>
        </div>
        ${alerts.length > 0 ? `<div class="alerts-bar">${alerts.join(' ')}</div>` : ''}
        ${hunksHtml}
      </section>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark" data-mode="split">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Visual de Mudanças (TCC Diff)</title>
  <style>
    :root {
      --bg: #0b1120; --surface: #111827; --card: #1e293b; --border: rgba(255,255,255,0.09);
      --text: #f8fafc; --muted: #94a3b8; --primary: #10b981;
      --add-bg: rgba(16,185,129,0.22); --add-text: #6ee7b7; --add-row: rgba(16,185,129,0.08);
      --del-bg: rgba(239,68,68,0.22); --del-text: #fca5a5; --del-row: rgba(239,68,68,0.08);
    }
    [data-theme="light"] {
      --bg: #f1f5f9; --surface: #ffffff; --card: #ffffff; --border: rgba(15,23,42,0.1);
      --text: #0f172a; --muted: #475569; --primary: #059669;
      --add-bg: #bbf7d0; --add-text: #14532d; --add-row: #f0fdf4;
      --del-bg: #fecaca; --del-text: #7f1d1d; --del-row: #fef2f2;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg); color: var(--text); line-height: 1.55; }
    header { position: sticky; top: 0; z-index: 20; background: var(--surface); border-bottom: 1px solid var(--border); padding: 1rem 1.5rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; }
    h1 { font-size: 1.1rem; display: flex; align-items: center; gap: 0.6rem; }
    .meta { font-size: 0.82rem; color: var(--muted); }
    .controls { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
    input[type="search"] { background: var(--card); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 0.45rem 0.75rem; font-size: 0.85rem; width: 220px; }
    button { background: var(--card); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 0.45rem 0.8rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
    button.active { background: var(--primary); color: #fff; border-color: var(--primary); }
    main { max-width: 1320px; margin: 1.5rem auto; padding: 0 1.25rem 3rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.85rem; }
    .kpi { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 0.9rem 1.1rem; }
    .kpi-label { font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .kpi-val { font-size: 1.35rem; font-weight: 700; margin-top: 0.25rem; }
    .file-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    .file-header { padding: 0.85rem 1.1rem; background: var(--card); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
    .file-title { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 0.9rem; font-weight: 700; }
    .file-stats { display: flex; gap: 0.75rem; font-size: 0.82rem; font-weight: 600; }
    .stat-add { color: var(--primary); }
    .stat-del { color: #ef4444; }
    .alerts-bar { padding: 0.55rem 1.1rem; border-bottom: 1px solid var(--border); display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .badge { font-size: 0.74rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; }
    .badge-warn { background: rgba(245,158,11,0.18); color: #fbbf24; }
    .badge-info { background: rgba(59,130,246,0.18); color: #60a5fa; }
    [data-theme="light"] .badge-warn { color: #b45309; }
    [data-theme="light"] .badge-info { color: #1d4ed8; }
    .hunk { border-top: 1px solid var(--border); }
    .hunk-header { padding: 0.45rem 1.1rem; font-size: 0.8rem; color: var(--muted); background: rgba(148,163,184,0.06); display: flex; gap: 0.75rem; flex-wrap: wrap; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
    .hunk-sec { color: var(--primary); font-weight: 600; }
    .view-inline { padding: 0.65rem 1.1rem; font-size: 0.88rem; }
    .view-split { display: grid; grid-template-columns: 1fr 1fr; }
    .split-col { padding: 0.65rem 1rem; font-size: 0.86rem; border-right: 1px solid var(--border); overflow-wrap: anywhere; }
    .split-col:last-child { border-right: none; }
    .col-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 0.4rem; font-weight: 700; }
    [data-mode="split"] .view-inline { display: none; }
    [data-mode="inline"] .view-split { display: none; }
    .line { padding: 0.16rem 0.35rem; border-radius: 4px; white-space: pre-wrap; word-break: break-word; }
    .line.ctx { opacity: 0.75; }
    .line.add-row { background: var(--add-row); }
    .line.del-row { background: var(--del-row); }
    .line.empty { opacity: 0.25; }
    ins { background: var(--add-bg); color: var(--add-text); text-decoration: none; padding: 0 2px; border-radius: 3px; font-weight: 600; }
    del { background: var(--del-bg); color: var(--del-text); text-decoration: line-through; padding: 0 2px; border-radius: 3px; }
    @media (max-width: 820px) { .view-split { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>🔍 Relatório Visual de Mudanças (TCC)</h1>
      <div class="meta">Comparação: <strong>${escapeHtml(report.rangeLabel)}</strong> &bull; Gerado em ${escapeHtml(report.generatedAt)}</div>
    </div>
    <div class="controls">
      <input type="search" id="filterInput" placeholder="Filtrar arquivo..." />
      <button id="btnSplit" class="active">Lado a Lado</button>
      <button id="btnInline">Unificado</button>
      <button id="btnTheme">Tema</button>
    </div>
  </header>
  <main>
    <div class="summary-grid">
      <div class="kpi"><div class="kpi-label">Arquivos alterados</div><div class="kpi-val">${report.summary.filesChanged}</div></div>
      <div class="kpi"><div class="kpi-label">Palavras adicionadas</div><div class="kpi-val stat-add">+${report.summary.wordsAdded}</div></div>
      <div class="kpi"><div class="kpi-label">Palavras removidas</div><div class="kpi-val stat-del">-${report.summary.wordsRemoved}</div></div>
      <div class="kpi"><div class="kpi-label">Saldo líquido</div><div class="kpi-val">${report.summary.netWords >= 0 ? '+' : ''}${report.summary.netWords}</div></div>
    </div>
    ${fileCards || '<div class="kpi">Nenhuma alteração encontrada para o intervalo selecionado.</div>'}
  </main>
  <script>
    const root = document.documentElement;
    document.getElementById('btnSplit').onclick = () => {
      root.setAttribute('data-mode', 'split');
      btnSplit.classList.add('active'); btnInline.classList.remove('active');
    };
    document.getElementById('btnInline').onclick = () => {
      root.setAttribute('data-mode', 'inline');
      btnInline.classList.add('active'); btnSplit.classList.remove('active');
    };
    document.getElementById('btnTheme').onclick = () => {
      root.setAttribute('data-theme', root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    };
    document.getElementById('filterInput').oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.file-card').forEach(el => {
        el.style.display = el.dataset.file.includes(q) ? '' : 'none';
      });
    };
  </script>
</body>
</html>`;
}

function generateMarkdownReport(report) {
  const out = [];
  out.push(`# Relatório de Mudanças do TCC (${report.rangeLabel})`);
  out.push('');
  out.push(`- **Arquivos alterados:** ${report.summary.filesChanged}`);
  out.push(`- **Palavras:** +${report.summary.wordsAdded} / -${report.summary.wordsRemoved} (saldo: ${report.summary.netWords >= 0 ? '+' : ''}${report.summary.netWords})`);
  out.push('');

  for (const f of report.files) {
    out.push(`## \`${f.file}\` (+${f.wordsAdded} / -${f.wordsRemoved} palavras)`);
    if (f.citationsAdded.length > 0) out.push(`- **Citações adicionadas:** \`${f.citationsAdded.join('`, `')}\``);
    if (f.citationsRemoved.length > 0) out.push(`- **Citações removidas:** \`${f.citationsRemoved.join('`, `')}\``);
    if (f.numericChanges) out.push(`- **Atenção:** houve alteração em valores numéricos/percentuais.`);
    out.push('');

    for (const h of f.hunks) {
      out.push(`### ${h.section || `Linhas +${h.newRange}`}`);
      out.push('```diff');
      for (const l of h.lines) {
        if (!l.hasChange) continue;
        const before = l.segments.filter(s => s.type !== 'add').map(s => s.text).join('');
        const after = l.segments.filter(s => s.type !== 'del').map(s => s.text).join('');
        if (before.trim()) out.push(`- ${before}`);
        if (after.trim()) out.push(`+ ${after}`);
      }
      out.push('```');
      out.push('');
    }
  }
  return out.join('\n');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    html: args.includes('--html'),
    md: args.includes('--md'),
    json: args.includes('--json'),
    all: args.includes('--all'),
    help: args.includes('--help') || args.includes('-h'),
    range: null
  };

  for (const a of args) {
    if (!a.startsWith('-')) {
      options.range = a;
      break;
    }
  }

  if (options.help) {
    console.log(`
Uso: node scripts/diff_report.js [ref-ou-intervalo] [opções]

Exemplos:
  node scripts/diff_report.js                  # Compara alterações locais (ou último commit)
  node scripts/diff_report.js HEAD~1           # Compara contra o commit anterior
  node scripts/diff_report.js HEAD~2..HEAD --html

Opções:
  --html     Gera relatório visual interativo Antes/Depois em src/build/diff.html
  --md       Imprime relatório estruturado em Markdown
  --json     Imprime saída estruturada em JSON
  --all      Inclui todos os arquivos do repositório (padrão: apenas pasta src/)
  --help     Exibe esta mensagem de ajuda
    `);
    process.exit(0);
  }
  return options;
}

function main() {
  const options = parseArgs();
  const rootDir = path.resolve(__dirname, '..');

  const pathFilter = options.all ? [] : ['--', 'src/'];
  let rangeArgs = options.range ? [options.range] : [];
  let rangeLabel = options.range || 'Alterações locais vs HEAD';

  const baseGitArgs = [
    'diff',
    '--word-diff=porcelain',
    '-U1'
  ];

  let res = runGit([...baseGitArgs, ...rangeArgs, ...pathFilter], rootDir);

  // Se não passou range e não há alterações locais não commitadas, compara o último commit (HEAD~1..HEAD)
  if (!options.range && !res.stdout.trim()) {
    const hasParent = runGit(['rev-parse', '--verify', 'HEAD~1'], rootDir).status === 0;
    if (hasParent) {
      res = runGit([...baseGitArgs, 'HEAD~1..HEAD', ...pathFilter], rootDir);
      rangeLabel = 'Último commit (HEAD~1..HEAD)';
    }
  }

  const files = parsePorcelainDiff(res.stdout);
  const wordsAdded = files.reduce((a, f) => a + f.wordsAdded, 0);
  const wordsRemoved = files.reduce((a, f) => a + f.wordsRemoved, 0);

  const now = new Date();
  const generatedAt = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const report = {
    rangeLabel,
    generatedAt,
    summary: {
      filesChanged: files.length,
      wordsAdded,
      wordsRemoved,
      netWords: wordsAdded - wordsRemoved
    },
    files
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (options.md) {
    console.log(generateMarkdownReport(report));
    return;
  }

  if (options.html) {
    const buildDir = path.join(rootDir, 'src', 'build');
    if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
    const outPath = path.join(buildDir, 'diff.html');
    fs.writeFileSync(outPath, generateHtmlReport(report), 'utf-8');
    console.log(`\n${GREEN}${BOLD}✅ Relatório visual gerado com sucesso:${RESET} src/build/diff.html`);
    console.log(`   Comparação: ${CYAN}${rangeLabel}${RESET} | Arquivos: ${files.length} | Palavras: ${GREEN}+${wordsAdded}${RESET} / ${RED}-${wordsRemoved}${RESET}\n`);
    return;
  }

  // Saída formatada no terminal
  console.log(`\n${BOLD}${CYAN}🔎 TCC Diff — Revisão Cirúrgica por Palavra e Seção${RESET}`);
  console.log(`${CYAN}───────────────────────────────────────────────────────────${RESET}`);
  console.log(`  Intervalo: ${BOLD}${rangeLabel}${RESET}`);
  console.log(`  Resumo:    ${files.length} arquivo(s) | ${GREEN}+${wordsAdded} palavras${RESET} | ${RED}-${wordsRemoved} palavras${RESET} (saldo: ${report.summary.netWords >= 0 ? '+' : ''}${report.summary.netWords})\n`);

  if (files.length === 0) {
    console.log(`  ${GREEN}[OK]${RESET} Nenhuma alteração pendente encontrada em ${options.all ? 'todo o repositório' : 'src/'}.\n`);
    return;
  }

  for (const f of files) {
    console.log(`${BOLD}${BLUE}📄 ${f.file}${RESET} (${GREEN}+${f.wordsAdded}${RESET} / ${RED}-${f.wordsRemoved}${RESET} palavras)`);
    if (f.citationsAdded.length > 0) {
      console.log(`   ${CYAN}[CITAÇÃO +]${RESET} ${f.citationsAdded.join(', ')}`);
    }
    if (f.citationsRemoved.length > 0) {
      console.log(`   ${YELLOW}[CITAÇÃO -]${RESET} ${f.citationsRemoved.join(', ')}`);
    }
    if (f.numericChanges) {
      console.log(`   ${YELLOW}[ALERTA NUMÉRICO]${RESET} Valores numéricos/percentuais foram alterados neste arquivo.`);
    }

    for (const h of f.hunks) {
      const secLabel = h.section ? `${CYAN}${h.section}${RESET}` : `${GRAY}(topo)${RESET}`;
      console.log(`   ${GRAY}@@ +${h.newRange} @@${RESET} ${secLabel}`);
      for (const l of h.lines) {
        if (!l.hasChange) continue;
        const rendered = l.segments.map(seg => {
          if (seg.type === 'add') return `${GREEN}{+${seg.text}+}${RESET}`;
          if (seg.type === 'del') return `${RED}[-${seg.text}-]${RESET}`;
          return seg.text;
        }).join('');
        console.log(`     ${rendered}`);
      }
    }
    console.log('');
  }

  console.log(`${GRAY}💡 Dica: execute '.\\make.bat diff --html' para abrir o comparador visual Antes/Depois em src/build/diff.html.${RESET}\n`);
}

main();

#!/usr/bin/env node
/**
 * add_doi.js - Importador Automático de Referências BibTeX (ABNT) via DOI.
 *
 * Consulta a API JSON oficial do CrossRef (com fallback automático para DataCite
 * para preprints arXiv / Zenodo / datasets) usando fetch() nativo do Node.js (v18+),
 * formatando a entrada limpa para biblatex-abnt em src/referencias.bib.
 *
 * Uso:
 *   node scripts/add_doi.js 10.1145/3611643.3616281
 *   node scripts/add_doi.js https://doi.org/10.48550/arXiv.2005.11401 --dry-run
 *   node scripts/add_doi.js 10.1145/3611643.3616281 --key=meuArtigo2024
 */

const fs = require('fs');
const path = require('path');

const isColorSupported = process.stdout.isTTY && !process.env.NO_COLOR;
const GREEN = isColorSupported ? '\x1b[32m' : '';
const YELLOW = isColorSupported ? '\x1b[33m' : '';
const RED = isColorSupported ? '\x1b[31m' : '';
const CYAN = isColorSupported ? '\x1b[36m' : '';
const GRAY = isColorSupported ? '\x1b[90m' : '';
const BOLD = isColorSupported ? '\x1b[1m' : '';
const RESET = isColorSupported ? '\x1b[0m' : '';

const USER_AGENT = 'template-tcc-ifs-latex/1.0 (https://github.com/JGustavoCN/template-tcc-ifs-latex)';

function normalizeDoi(input) {
  return String(input || '')
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .trim();
}

function stripDiacritics(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function escapeBibtexText(str) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]+>/g, '') // remove eventuais tags HTML/JATS do CrossRef (<i>, <scp>, etc.)
    .replace(/\s+/g, ' ')
    .replace(/(^|[^\\])&/g, '$1\\&')
    .replace(/(^|[^\\])%/g, '$1\\%')
    .trim();
}

/**
 * Protege siglas em caixa alta (ex: RAG, LLM, MCP, API) em títulos para evitar
 * que biblatex converta para minúsculas ao aplicar sentence-case.
 */
function protectTitleAcronyms(title) {
  const clean = escapeBibtexText(title);
  return clean.replace(/\b([A-Z]{2,}(?:-[A-Z0-9]+)?)\b/g, '{$1}');
}

function formatPages(rawPage) {
  if (!rawPage) return null;
  return String(rawPage).trim().replace(/\s*[-–—]+\s*/g, '--');
}

function todayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateKey(firstSurname, year, existingKeys) {
  const baseSurname = stripDiacritics(firstSurname || 'autor')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || 'autor';
  const baseYear = String(year || new Date().getFullYear()).replace(/[^0-9]/g, '');
  let candidate = `${baseSurname}${baseYear}`;

  if (!existingKeys.has(candidate)) return candidate;
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  for (const ch of letters) {
    if (!existingKeys.has(`${candidate}${ch}`)) return `${candidate}${ch}`;
  }
  return `${candidate}_${Date.now() % 1000}`;
}

function mapCrossrefType(type) {
  switch (type) {
    case 'journal-article': return 'article';
    case 'proceedings-article': return 'inproceedings';
    case 'book':
    case 'monograph':
    case 'edited-book':
    case 'reference-book': return 'book';
    case 'book-chapter':
    case 'book-section': return 'incollection';
    case 'dissertation': return 'phdthesis';
    case 'report': return 'techreport';
    default: return 'misc';
  }
}

async function fetchFromCrossref(doi) {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }
  });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`CrossRef HTTP ${resp.status}`);

  const data = await resp.json();
  const msg = data.message;
  if (!msg) return null;

  const entryType = mapCrossrefType(msg.type);
  const authorsArr = (msg.author || []).map(a => {
    if (a.name) return `{${escapeBibtexText(a.name)}}`;
    const family = escapeBibtexText(a.family || '');
    const given = escapeBibtexText(a.given || '');
    return given ? `${family}, ${given}` : family;
  }).filter(Boolean);

  const firstSurname = msg.author && msg.author[0]
    ? (msg.author[0].family || msg.author[0].name || 'autor')
    : 'autor';

  const title = protectTitleAcronyms((msg.title && msg.title[0]) || 'Sem título');
  const container = escapeBibtexText((msg['container-title'] && msg['container-title'][0]) || '');
  const dateParts =
    (msg.published && msg.published['date-parts'] && msg.published['date-parts'][0]) ||
    (msg['published-print'] && msg['published-print']['date-parts'] && msg['published-print']['date-parts'][0]) ||
    (msg['published-online'] && msg['published-online']['date-parts'] && msg['published-online']['date-parts'][0]) ||
    (msg.issued && msg.issued['date-parts'] && msg.issued['date-parts'][0]) ||
    [];
  const year = dateParts[0] || new Date().getFullYear();

  const fields = {
    author: authorsArr.join(' and ') || '{Autor Desconhecido}',
    title,
    year: String(year)
  };

  if (entryType === 'article') {
    if (container) fields.journal = container;
    if (msg.volume) fields.volume = String(msg.volume);
    if (msg.issue) fields.number = String(msg.issue);
    if (msg.page) fields.pages = formatPages(msg.page);
  } else if (entryType === 'inproceedings' || entryType === 'incollection') {
    if (container) fields.booktitle = container;
    if (msg.publisher) fields.publisher = escapeBibtexText(msg.publisher);
    if (msg.page) fields.pages = formatPages(msg.page);
  } else if (entryType === 'book') {
    if (msg.publisher) fields.publisher = escapeBibtexText(msg.publisher);
    if (msg['publisher-location']) fields.address = escapeBibtexText(msg['publisher-location']);
    if (msg.ISBN && msg.ISBN[0]) fields.isbn = msg.ISBN[0];
  } else {
    if (container) fields.howpublished = container;
    else if (msg.publisher) fields.publisher = escapeBibtexText(msg.publisher);
  }

  fields.doi = doi;
  fields.url = `https://doi.org/${doi}`;
  fields.urldate = todayIso();

  return { source: 'CrossRef', entryType, firstSurname, year, fields };
}

async function fetchFromDataCite(doi) {
  const url = `https://api.datacite.org/dois/${encodeURIComponent(doi)}`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/vnd.api+json' }
  });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`DataCite HTTP ${resp.status}`);

  const json = await resp.json();
  const attr = json.data && json.data.attributes;
  if (!attr) return null;

  const creators = (attr.creators || []).map(c => {
    if (c.familyName && c.givenName) {
      return `${escapeBibtexText(c.familyName)}, ${escapeBibtexText(c.givenName)}`;
    }
    return escapeBibtexText(c.name || '');
  }).filter(Boolean);

  const firstSurname = attr.creators && attr.creators[0]
    ? (attr.creators[0].familyName || (attr.creators[0].name || 'autor').split(/[,\s]+/)[0])
    : 'autor';

  const title = protectTitleAcronyms((attr.titles && attr.titles[0] && attr.titles[0].title) || 'Sem título');
  const year = attr.publicationYear || new Date().getFullYear();
  const resType = (attr.types && attr.types.resourceTypeGeneral || '').toLowerCase();
  const entryType = resType === 'book' ? 'book' : (resType === 'journalarticle' ? 'article' : 'misc');

  const fields = {
    author: creators.join(' and ') || '{Autor Desconhecido}',
    title,
    year: String(year)
  };
  if (attr.publisher) fields.publisher = escapeBibtexText(attr.publisher);
  fields.doi = doi;
  fields.url = `https://doi.org/${doi}`;
  fields.urldate = todayIso();

  return { source: 'DataCite', entryType, firstSurname, year, fields };
}

function formatBibtexEntry(entryType, key, fields) {
  const lines = [`@${entryType}{${key},`];
  const keys = Object.keys(fields);
  keys.forEach((k, idx) => {
    const comma = idx < keys.length - 1 ? ',' : '';
    lines.push(`    ${k} = {${fields[k]}}${comma}`);
  });
  lines.push('}');
  return lines.join('\n');
}

function loadExistingBibState(bibPath) {
  const existingKeys = new Set();
  const existingDois = new Set();
  if (!fs.existsSync(bibPath)) return { existingKeys, existingDois };

  const content = fs.readFileSync(bibPath, 'utf-8');
  const keyRe = /@\w+\s*\{\s*([^,\s]+)/g;
  let m;
  while ((m = keyRe.exec(content)) !== null) {
    existingKeys.add(m[1].trim());
  }
  const doiRe = /doi\s*=\s*[{"]([^}"]+)[}"]/gi;
  while ((m = doiRe.exec(content)) !== null) {
    existingDois.add(normalizeDoi(m[1]).toLowerCase());
  }
  return { existingKeys, existingDois };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    help: args.includes('--help') || args.includes('-h'),
    customKey: null,
    dois: []
  };

  for (const a of args) {
    if (a.startsWith('--key=')) {
      options.customKey = a.slice(6).trim();
    } else if (!a.startsWith('-')) {
      const cleaned = normalizeDoi(a);
      if (cleaned) options.dois.push(cleaned);
    }
  }

  if (options.help || options.dois.length === 0) {
    console.log(`
Uso: node scripts/add_doi.js <DOI> [DOI2 ...] [opções]

Exemplos:
  node scripts/add_doi.js 10.1145/3611643.3616281
  node scripts/add_doi.js https://doi.org/10.48550/arXiv.2005.11401 --dry-run
  node scripts/add_doi.js 10.1145/3611643.3616281 --key=silva2024

Opções:
  --dry-run      Exibe a entrada BibTeX gerada sem alterar src/referencias.bib
  --key=<nome>   Define manualmente a chave BibTeX (quando passar 1 DOI)
  --help, -h     Exibe esta mensagem de ajuda
    `);
    process.exit(options.help ? 0 : 1);
  }

  return options;
}

async function main() {
  if (typeof fetch !== 'function') {
    console.error(`${RED}[ERRO] Este script requer Node.js v18+ (com fetch nativo).${RESET}`);
    process.exit(1);
  }

  const options = parseArgs();
  const rootDir = path.resolve(__dirname, '..');
  const bibPath = path.join(rootDir, 'src', 'referencias.bib');
  const { existingKeys, existingDois } = loadExistingBibState(bibPath);

  console.log(`\n${BOLD}${CYAN}📚 Importador de Referências ABNT via DOI (CrossRef / DataCite)${RESET}`);
  console.log(`${CYAN}──────────────────────────────────────────────────────────────${RESET}`);

  let addedCount = 0;

  for (const doi of options.dois) {
    if (existingDois.has(doi.toLowerCase()) && !options.dryRun) {
      console.log(`  ${YELLOW}[PULADO]${RESET} DOI '${doi}' já está cadastrado em src/referencias.bib.`);
      continue;
    }

    try {
      console.log(`  ${GRAY}[+] Consultando metadados para DOI:${RESET} ${BOLD}${doi}${RESET}...`);
      let meta = await fetchFromCrossref(doi);
      if (!meta) {
        meta = await fetchFromDataCite(doi);
      }
      if (!meta) {
        console.error(`  ${RED}[ERRO]${RESET} DOI '${doi}' não encontrado no CrossRef nem no DataCite.`);
        continue;
      }

      const key = (options.customKey && options.dois.length === 1)
        ? options.customKey
        : generateKey(meta.firstSurname, meta.year, existingKeys);

      const bibEntry = formatBibtexEntry(meta.entryType, key, meta.fields);

      console.log(`\n${GREEN}  [OK] Metadados recuperados via ${meta.source}:${RESET}`);
      console.log(bibEntry.split('\n').map(l => `    ${l}`).join('\n'));

      if (options.dryRun) {
        console.log(`\n  ${CYAN}[DRY-RUN]${RESET} Modo de pré-visualização: src/referencias.bib não foi modificado.`);
      } else {
        const prefix = fs.existsSync(bibPath) && fs.readFileSync(bibPath, 'utf-8').trim().length > 0 ? '\n\n' : '';
        fs.appendFileSync(bibPath, `${prefix}${bibEntry}\n`, 'utf-8');
        existingKeys.add(key);
        existingDois.add(doi.toLowerCase());
        addedCount++;
        console.log(`\n  ${GREEN}${BOLD}✅ Adicionado em src/referencias.bib!${RESET}`);
      }

      console.log(`  ${GRAY}Como citar no texto:${RESET} \\cite{${key}}  ou  \\textcite{${key}}\n`);
    } catch (err) {
      console.error(`  ${RED}[ERRO]${RESET} Falha ao consultar DOI '${doi}': ${err.message}\n`);
    }
  }

  if (!options.dryRun && addedCount > 0) {
    console.log(`${GRAY}💡 Próximo passo: execute '.\\make.bat check' após citar a nova obra no texto.${RESET}\n`);
  }
}

main();

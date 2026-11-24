#!/usr/bin/env node
/**
 * update_template.js (v2.3) - Atualizador Seguro e Blindado do Template TCC IFS (LaTeX).
 *
 * Projetado para funcionar inclusive em projetos muito antigos ou criados via "Use this template"
 * no GitHub (históricos Git independentes / unrelated histories) sem NUNCA sobrescrever capítulos,
 * figuras, referências, metadados ou pastas autorais (docs/guias, docs/pdfs, resources, cache).
 *
 * Garantias de segurança e reversibilidade:
 *   1. Self-Update automático: detecta se há versão mais nova de si mesmo no upstream e se reinicia
 *   2. Modo --auto (-y): 1 comando direto sem perguntas (backup automático + branch isolada + --verify)
 *   3. Cria tag Git de backup (backup/pre-update-YYYYMMDD-HHMMSS) antes de qualquer escrita
 *   4. Suporta --branch para testar a atualização em uma branch isolada sem tocar na branch atual
 *   5. Salva manifesto de reversão em .git/template-update-last.json (invisível ao git status)
 *      com a lista exata de createdFiles (inclusive arquivos de bootstrap não rastreados antes)
 *      para que --rollback devolva o repo 100% limpo sem jamais rodar `git clean`.
 *
 * Uso:
 *   node scripts/update_template.js --auto                   # 1 comando direto: self-update + backup + branch isolada + validação
 *   node scripts/update_template.js --auto --skip-config     # 1 comando direto mantendo src/config.tex intacto
 *   node scripts/update_template.js --wizard                 # Modo guiado interativo com menu [1/2/3/0]
 *   node scripts/update_template.js                          # Verifica versão e diagnóstico da Zona 2
 *   node scripts/update_template.js --dry-run                # Simula --sync-infra sem alterar nenhum arquivo
 *   node scripts/update_template.js --sync-infra --branch    # Aplica Zona 1 em branch isolada + tag backup
 *   node scripts/update_template.js --sync-infra --branch --verify  # Aplica e já valida Zona 3 + doctor + check
 *   node scripts/update_template.js --prepare-ai             # Baixa apenas skill/guia para a IA conduzir
 *   node scripts/update_template.js --rollback               # Reverte 100% para o estado pré-update
 *   node scripts/update_template.js --json                   # Saída estruturada em JSON (ideal para IAs)
 *   node scripts/update_template.js --target=<dir>           # Simula em outro repositório (somente --dry-run/check)
 */

const { spawnSync } = require('child_process');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

const DEFAULT_OFFICIAL_REPO = 'https://github.com/JGustavoCN/template-tcc-ifs-latex.git';
const BOOTSTRAP_FILES = [
  'scripts/update_template.js',
  '.agents/skills/template_updater/SKILL.md',
  'docs/GUIA_ATUALIZACAO_TEMPLATE.md'
];
const SACRED_PROTECTED_PREFIXES = [
  'src/capitulos/',
  'src/figuras/',
  'src/apendices/',
  'src/anexos/',
  'docs/guias/',
  'docs/pdfs/',
  'resources/',
  'cache/',
  'example/'
];
const SACRED_PROTECTED_FILES = new Set([
  'src/main.tex',
  'src/metadados.tex',
  'src/pre-textuais.tex',
  'src/referencias.bib'
]);

const isColor = process.stdout.isTTY && !process.env.NO_COLOR && !process.argv.includes('--no-color');
const C = {
  reset: isColor ? '\x1b[0m' : '',
  bold: isColor ? '\x1b[1m' : '',
  green: isColor ? '\x1b[32m' : '',
  yellow: isColor ? '\x1b[33m' : '',
  blue: isColor ? '\x1b[34m' : '',
  cyan: isColor ? '\x1b[36m' : '',
  red: isColor ? '\x1b[31m' : '',
  gray: isColor ? '\x1b[90m' : ''
};

function parseArgs() {
  const args = process.argv.slice(2);
  let targetDir = null;
  let sourceRef = 'upstream/main';
  let sourceDir = null;
  for (const arg of args) {
    if (arg.startsWith('--target=')) targetDir = arg.slice(9);
    else if (arg.startsWith('--ref=')) sourceRef = arg.slice(6);
    else if (arg.startsWith('--source-dir=')) sourceDir = arg.slice(13);
  }
  return {
    help: args.includes('--help') || args.includes('-h'),
    json: args.includes('--json'),
    auto: args.includes('--auto') || args.includes('-y') || args.includes('--yes'),
    wizard: args.includes('--wizard') || args.includes('--guided') || args.includes('-i'),
    dryRun: args.includes('--dry-run'),
    syncInfra: args.includes('--sync-infra') || args.includes('--merge') || args.includes('-m'),
    skipConfig: args.includes('--skip-config'),
    useBranch: args.includes('--branch'),
    verify: args.includes('--verify'),
    prepareAi: args.includes('--prepare-ai'),
    rollback: args.includes('--rollback'),
    noFetch: args.includes('--no-fetch'),
    noSelfUpdate: args.includes('--no-self-update'),
    selfUpdated: args.includes('--self-updated'),
    bootstrapFresh: args.includes('--bootstrap-fresh'),
    targetDir,
    sourceRef,
    sourceDir
  };
}

function printHelp() {
  console.log(`
Uso: node scripts/update_template.js [opcoes]

Modos principais:
  --auto, -y      1 comando direto (zero perguntas): self-update + backup + branch isolada + Zona 1 + validacao
  --wizard        Modo guiado interativo com menu [1/2/3/0] (backup, simulacao, branch isolada e validacao)
  (padrao)        Verifica versao local vs. upstream/main e diagnostica a Zona 2
  --dry-run       Simula a sincronizacao sem modificar nenhum arquivo
  --sync-infra    Cria tag Git de backup e atualiza SOMENTE a Zona 1 (infraestrutura) + append no .gitignore
  --prepare-ai    Traz apenas os 3 arquivos essenciais (script + skill + guia) para uma IA conduzir depois
  --rollback      Restaura 100% o repositorio para o estado pre-update (inclusive removendo novos arquivos do update)

Opcoes adicionais:
  --branch          Cria e muda para uma branch isolada (chore/template-update-vX.Y.Z) antes de --sync-infra
  --skip-config     Mantem src/config.tex intacto durante --auto / --sync-infra (ideal perto da banca)
  --verify          Apos --sync-infra, executa prova da Zona 3 + doctor.js + check.js automaticamente
  --no-self-update  Nao reinicia automaticamente caso haja versao mais nova deste proprio script no upstream
  --no-fetch        Usa o upstream/main ja presente no Git local (offline)
  --ref=<gitref>    Usa outra referencia Git como origem (padrao: upstream/main)
  --source-dir=<d>  Usa uma pasta local do template como origem (util para testes offline)
  --target=<dir>    Audita/simula outro repositorio TCC (ex.: --target=../project-tcc --dry-run)
  --json            Emite relatorio estruturado em JSON (ideal para agentes de IA)
  --help, -h        Exibe esta ajuda
`);
}

function runGit(cwd, args, { binary = false } = {}) {
  const res = spawnSync('git', args, {
    cwd,
    encoding: binary ? undefined : 'utf-8',
    stdio: 'pipe',
    maxBuffer: 32 * 1024 * 1024
  });
  return {
    ok: !res.error && res.status === 0,
    status: res.status,
    stdout: binary ? res.stdout : (res.stdout || '').trim(),
    stderr: binary ? (res.stderr ? res.stderr.toString('utf-8') : '') : (res.stderr || '').trim(),
    error: res.error
  };
}

function resolveGitDir(repoDir) {
  const res = runGit(repoDir, ['rev-parse', '--git-dir']);
  if (!res.ok || !res.stdout) return path.join(repoDir, '.git');
  return path.isAbsolute(res.stdout) ? res.stdout : path.resolve(repoDir, res.stdout);
}

function getRollbackStatePath(repoDir) {
  return path.join(resolveGitDir(repoDir), 'template-update-last.json');
}

function readLocalManifest(repoDir) {
  const p = path.join(repoDir, 'template-manifest.json');
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e) {
    return null;
  }
}

function readGitJsonFile(repoDir, ref, relPath) {
  const res = runGit(repoDir, ['show', `${ref}:${relPath}`]);
  if (!res.ok || !res.stdout) return null;
  try {
    return JSON.parse(res.stdout);
  } catch (e) {
    return null;
  }
}

function readGitFileBuffer(repoDir, ref, relPath) {
  const res = runGit(repoDir, ['show', `${ref}:${relPath}`], { binary: true });
  if (!res.ok || !res.stdout) return null;
  return res.stdout;
}

function gitFileExistsInRef(repoDir, ref, relPath) {
  const res = runGit(repoDir, ['cat-file', '-e', `${ref}:${relPath}`]);
  return res.ok;
}

function buffersEqualNormalized(bufA, bufB) {
  if (!bufA || !bufB) return false;
  if (bufA.equals(bufB)) return true;
  const strA = bufA.toString('utf-8').replace(/\r\n/g, '\n');
  const strB = bufB.toString('utf-8').replace(/\r\n/g, '\n');
  return strA === strB;
}

function removeEmptyParentDirs(repoDir, filePath) {
  let dir = path.dirname(filePath);
  const absRoot = path.resolve(repoDir);
  while (dir.startsWith(absRoot) && dir !== absRoot) {
    try {
      const entries = fs.readdirSync(dir);
      if (entries.length === 0) {
        fs.rmdirSync(dir);
        dir = path.dirname(dir);
      } else {
        break;
      }
    } catch (e) {
      break;
    }
  }
}

function parsePorcelainPath(line) {
  return line.replace(/^[ MADRCU?!]{1,2}\s+/, '').trim().replace(/^"|"$/g, '').replace(/\\/g, '/');
}

function getDirtyFiles(repoDir) {
  const statusRes = runGit(repoDir, ['status', '--porcelain', '-uall']);
  if (!statusRes.ok || !statusRes.stdout) return [];
  return statusRes.stdout.split(/\r?\n/).filter(Boolean);
}

/**
 * Verifica se um status porcelain contém apenas arquivos legítimos de bootstrap do atualizador.
 */
function isOnlyBootstrapDirty(dirtyFiles) {
  if (dirtyFiles.length === 0) return false;
  const allowed = new Set(BOOTSTRAP_FILES);
  return dirtyFiles.every(line => allowed.has(parsePorcelainPath(line)));
}

function isSacredPath(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  if (SACRED_PROTECTED_FILES.has(norm)) return true;
  return SACRED_PROTECTED_PREFIXES.some(prefix => norm.startsWith(prefix));
}

function makeTimestampTag() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `backup/pre-update-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function createPromptHelper() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const queue = [];
  const waiters = [];
  let closed = false;

  rl.on('line', line => {
    const val = String(line || '').trim();
    if (waiters.length > 0) {
      waiters.shift()(val);
    } else {
      queue.push(val);
    }
  });

  rl.on('close', () => {
    closed = true;
    while (waiters.length > 0) {
      waiters.shift()('');
    }
  });

  return {
    ask(question) {
      process.stdout.write(question);
      if (queue.length > 0) {
        const val = queue.shift();
        if (!process.stdin.isTTY) process.stdout.write(`${val}\n`);
        return Promise.resolve(val);
      }
      if (closed) return Promise.resolve('');
      return new Promise(resolve => waiters.push(resolve));
    },
    close() {
      if (!closed) rl.close();
    }
  };
}

function createAutoSafetyCommit(repoDir, message = 'chore: backup antes de atualizar template') {
  const addRes = runGit(repoDir, ['add', '-A']);
  if (!addRes.ok) throw new Error(`Falha ao preparar arquivos: ${addRes.stderr}`);
  for (const bFile of BOOTSTRAP_FILES) {
    if (!gitFileExistsInRef(repoDir, 'HEAD', bFile)) {
      runGit(repoDir, ['reset', 'HEAD', '--', bFile]);
    }
  }
  const staged = runGit(repoDir, ['diff', '--cached', '--name-only']).stdout;
  if (!staged) return { created: false, hash: null };
  const commitRes = runGit(repoDir, ['commit', '-m', message]);
  if (!commitRes.ok) throw new Error(`Falha ao criar commit de segurança: ${commitRes.stderr}`);
  const hash = runGit(repoDir, ['rev-parse', '--short', 'HEAD']).stdout || '';
  return { created: true, hash };
}

/**
 * Verifica se há uma versão mais nova do próprio scripts/update_template.js na origem oficial.
 * Em modos ativos (--auto, --wizard, --sync-infra), se auto-atualiza e reinicia com --self-updated.
 */
function checkAndRunSelfUpdate(repoDir, src, opts, { allowApply = true } = {}) {
  const relSelf = 'scripts/update_template.js';
  if (opts.noSelfUpdate || opts.selfUpdated || opts.targetDir) {
    return { available: false, updated: false };
  }
  if (!src.existsInSource || !src.existsInSource(relSelf)) {
    return { available: false, updated: false };
  }
  const localSelfPath = path.join(repoDir, relSelf);
  if (!fs.existsSync(localSelfPath)) {
    return { available: false, updated: false };
  }
  const remoteBuf = src.readSourceFile(relSelf);
  const localBuf = fs.readFileSync(localSelfPath);
  if (!remoteBuf || buffersEqualNormalized(remoteBuf, localBuf)) {
    return { available: false, updated: false };
  }

  if (!allowApply) {
    return { available: true, updated: false };
  }

  if (!opts.json) {
    console.log(`\n${C.cyan}${C.bold}🔄 Nova versão do atualizador detectada em '${src.sourceLabel}'!${C.reset}`);
    console.log(`${C.gray}Auto-atualizando scripts/update_template.js e reiniciando com a versão mais recente...${C.reset}`);
  }

  fs.writeFileSync(localSelfPath, remoteBuf);

  const forwardArgs = process.argv.slice(2).filter(a => a !== '--self-updated');
  forwardArgs.push('--self-updated');
  if (!opts.noFetch && src.fetched) forwardArgs.push('--no-fetch');

  const reRun = spawnSync(process.execPath, [localSelfPath, ...forwardArgs], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });
  process.exit(reRun.status ?? 0);
}

/**
 * Executa a atualização 100% direta (--auto / -y) com o caminho mais seguro recomendado:
 * self-update -> commit de backup automático se houver pendências -> branch isolada + tag -> Zona 1 -> validação completa.
 */
function runAutoUpdate(repoDir, scriptRepoDir, opts) {
  const src = resolveUpstreamSource(repoDir, scriptRepoDir, opts);
  if (!src.upstreamManifest) {
    const err = { ok: false, error: `Não foi possível ler template-manifest.json em '${src.sourceLabel}'. Verifique sua conexão ou execute 'git fetch upstream'.` };
    if (opts.json) console.log(JSON.stringify(err, null, 2));
    else console.error(`${C.red}[ERRO]${C.reset} ${err.error}`);
    process.exit(1);
  }

  // 1. Self-update automático antes de executar o plano
  checkAndRunSelfUpdate(repoDir, src, opts, { allowApply: true });

  // 2. Se houver alterações autorais pendentes, salva automaticamente em commit de segurança
  let dirtyFiles = getDirtyFiles(repoDir);
  let autoBackupCommit = null;
  if (dirtyFiles.length > 0 && !isOnlyBootstrapDirty(dirtyFiles)) {
    const resCommit = createAutoSafetyCommit(repoDir, 'chore: backup automatico antes de atualizar template');
    if (resCommit.created) {
      autoBackupCommit = resCommit.hash;
      if (!opts.json) {
        console.log(`${C.green}✅ Alterações locais pendentes salvas com segurança no commit ${C.bold}${autoBackupCommit}${C.reset}${C.green} antes de atualizar.${C.reset}`);
      }
    }
    dirtyFiles = getDirtyFiles(repoDir);
  }

  const currentBranch = runGit(repoDir, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout || 'main';
  const currentHead = runGit(repoDir, ['rev-parse', '--short', 'HEAD']).stdout || '';
  const mergeBaseRes = opts.sourceDir ? { ok: false, stdout: '' } : runGit(repoDir, ['merge-base', 'HEAD', opts.sourceRef]);
  const hasSharedHistory = mergeBaseRes.ok && mergeBaseRes.stdout.length > 0;
  const { plan, assistedFindings, sacredDetected } = buildUpdatePlan(repoDir, src.upstreamManifest, src.existsInSource, src.readSourceFile, opts.skipConfig);
  const totalPendingActions = plan.toUpdate.length + plan.toCreate.length + plan.gitignoreToAppend.length;
  const localVersion = src.localManifest?.version || 'legado (< 2.5.0)';
  const upstreamVersion = src.upstreamManifest.version || 'desconhecida';

  const result = {
    ok: true,
    mode: 'auto',
    selfUpdated: opts.selfUpdated,
    autoBackupCommit,
    repoDir,
    currentBranch,
    source: src.sourceLabel,
    hasSharedHistory,
    workingTreeClean: dirtyFiles.length === 0,
    onlyBootstrapDirty: isOnlyBootstrapDirty(dirtyFiles),
    dirtyFilesCount: dirtyFiles.length,
    localVersion,
    upstreamVersion,
    upToDate: totalPendingActions === 0,
    backupTag: null,
    createdBranch: null,
    plan,
    assistedFindings,
    sacredPreserved: sacredDetected,
    verification: null
  };

  if (totalPendingActions === 0) {
    if (opts.json) console.log(JSON.stringify(result, null, 2));
    else console.log(`\n${C.green}${C.bold}✨ Seu projeto já está 100% atualizado (v${upstreamVersion})!${C.reset}\n`);
    process.exit(0);
  }

  const applied = executeSyncInfra(repoDir, plan, src.readSourceFile, {
    currentBranch,
    currentHead,
    upstreamVersion,
    useBranch: true
  });
  result.backupTag = applied.backupTag;
  result.createdBranch = applied.createdBranch;

  if (!opts.json) {
    printSummaryReport(result);
  }

  result.verification = runPostUpdateVerification(repoDir, {
    quiet: opts.json,
    allowedCreateIfMissing: src.upstreamManifest.zones?.createIfMissing?.paths || []
  });

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  printVerificationReport(result.verification, {
    backupTag: result.backupTag,
    createdBranch: result.createdBranch,
    upstreamVersion
  });
}

/**
 * Audita a Zona 2 (Híbrida/Assistida) e detecta pastas autorais da Zona 3 para dar visibilidade total.
 */
function inspectAssistedAndSacred(repoDir, manifest) {
  const assistedFindings = [];
  const sacredDetected = [];

  const metaPath = path.join(repoDir, 'src', 'metadados.tex');
  if (!fs.existsSync(metaPath)) {
    assistedFindings.push({
      file: 'src/metadados.tex',
      severity: 'ACTION_RECOMMENDED',
      message: 'Projeto em formato legado (sem src/metadados.tex). Crie src/metadados.tex para desacoplar seus dados pessoais de src/main.tex.'
    });
  } else {
    const metaTxt = fs.readFileSync(metaPath, 'utf-8');
    const missingMeta = [];
    if (!/\\bancaum\b/.test(metaTxt)) missingMeta.push('\\bancaum / \\bancadois');
    if (!/\\dataaprovacao\b/.test(metaTxt)) missingMeta.push('\\dataaprovacao');
    if (missingMeta.length > 0) {
      assistedFindings.push({
        file: 'src/metadados.tex',
        severity: 'OPTIONAL',
        message: `Variáveis opcionais de banca ainda não declaradas (${missingMeta.join(', ')}). Necessárias apenas se ativar \\imprimirfolhadeaprovacao.`
      });
    }
  }

  const mainPath = path.join(repoDir, 'src', 'main.tex');
  if (fs.existsSync(mainPath)) {
    const mainTxt = fs.readFileSync(mainPath, 'utf-8');
    const chapters = [...mainTxt.matchAll(/\\input\{capitulos\/([^}]+)\}/g)].map(m => m[1]);
    const optionalFeatures = [];
    if (!/\\imprimirfolhadeaprovacao/.test(mainTxt)) optionalFeatures.push('\\imprimirfolhadeaprovacao');
    if (!/\\listofquadros/.test(mainTxt)) optionalFeatures.push('\\listofquadros*');
    if (!/\\inserirfichacatalografica/.test(mainTxt)) optionalFeatures.push('\\inserirfichacatalografica');
    if (optionalFeatures.length > 0) {
      assistedFindings.push({
        file: 'src/main.tex',
        severity: 'OPTIONAL',
        chaptersDetected: chapters.length,
        message: `src/main.tex preservado (${chapters.length} capítulo(s) próprio(s)). Recursos novos opcionais disponíveis para adicionar manualmente se desejar: ${optionalFeatures.join(', ')}.`
      });
    }
  }

  const gitignorePath = path.join(repoDir, '.gitignore');
  const desiredEntries = manifest?.zones?.gitignoreAppend?.entries || ['slides/build/', 'docs/pdfs/*.pdf'];
  const missingGitignore = [];
  if (fs.existsSync(gitignorePath)) {
    const lines = fs.readFileSync(gitignorePath, 'utf-8').split(/\r?\n/).map(l => l.trim());
    for (const entry of desiredEntries) {
      if (!lines.includes(entry)) missingGitignore.push(entry);
    }
  } else {
    missingGitignore.push(...desiredEntries);
  }

  const sacredDirs = [
    'src/capitulos',
    'src/figuras',
    'src/apendices',
    'src/anexos',
    'docs/guias',
    'docs/pdfs',
    'resources',
    'cache',
    'example'
  ];
  for (const rel of sacredDirs) {
    if (fs.existsSync(path.join(repoDir, rel))) sacredDetected.push(`${rel}/`);
  }
  for (const relFile of ['src/metadados.tex', 'src/pre-textuais.tex', 'src/referencias.bib', 'src/main.tex']) {
    if (fs.existsSync(path.join(repoDir, relFile))) sacredDetected.push(relFile);
  }

  return { assistedFindings, missingGitignore, sacredDetected };
}

function handleRollback(repoDir, asJson) {
  const statePath = getRollbackStatePath(repoDir);
  let state = null;
  if (fs.existsSync(statePath)) {
    try {
      state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    } catch (e) {}
  }

  const tagsRes = runGit(repoDir, ['tag', '--list', 'backup/pre-update-*', '--sort=-creatordate']);
  const tags = tagsRes.ok && tagsRes.stdout ? tagsRes.stdout.split(/\r?\n/).filter(Boolean) : [];
  const targetTag = state?.backupTag || tags[0] || null;

  if (!targetTag) {
    const out = { ok: false, error: 'Nenhuma tag de backup (backup/pre-update-*) encontrada neste repositório.' };
    if (asJson) console.log(JSON.stringify(out, null, 2));
    else console.error(`${C.red}[ERRO]${C.reset} ${out.error}`);
    process.exit(1);
  }

  const removedUntracked = [];
  const currentBranch = runGit(repoDir, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout || '';
  const createdBranch = state?.createdBranch || null;
  const previousBranch = state?.previousBranch || null;

  const resetRes = runGit(repoDir, ['reset', '--hard', targetTag]);
  if (!resetRes.ok) {
    const out = { ok: false, tag: targetTag, error: resetRes.stderr || 'Falha ao executar git reset --hard.' };
    if (asJson) console.log(JSON.stringify(out, null, 2));
    else console.error(`${C.red}[ERRO]${C.reset} ${out.error}`);
    process.exit(1);
  }

  // Remove EXCLUSIVAMENTE os arquivos novos criados pelo update/bootstrap que não existiam na tag de backup
  const candidateUntracked = new Set(Array.isArray(state?.createdFiles) ? state.createdFiles : []);
  for (const bFile of BOOTSTRAP_FILES) {
    if (!gitFileExistsInRef(repoDir, targetTag, bFile)) {
      candidateUntracked.add(bFile);
    }
  }

  for (const relPath of candidateUntracked) {
    const fullPath = path.join(repoDir, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const trackedInTag = gitFileExistsInRef(repoDir, targetTag, relPath);
    if (!trackedInTag) {
      try {
        fs.unlinkSync(fullPath);
        removedUntracked.push(relPath);
        removeEmptyParentDirs(repoDir, fullPath);
      } catch (e) {}
    }
  }

  let switchedBackTo = null;
  let deletedBranch = null;
  if (createdBranch && previousBranch && currentBranch === createdBranch && createdBranch !== previousBranch) {
    const coRes = runGit(repoDir, ['checkout', previousBranch]);
    if (coRes.ok) {
      switchedBackTo = previousBranch;
      const delRes = runGit(repoDir, ['branch', '-D', createdBranch]);
      if (delRes.ok) deletedBranch = createdBranch;
    }
  }

  if (fs.existsSync(statePath)) {
    try { fs.unlinkSync(statePath); } catch (e) {}
  }

  const out = {
    ok: true,
    restoredTag: targetTag,
    removedCreatedFilesCount: removedUntracked.length,
    removedCreatedFiles: removedUntracked,
    switchedBackTo,
    deletedBranch,
    message: `Repositório restaurado integralmente para ${targetTag} (${removedUntracked.length} arquivo(s) novo(s) do update removido(s)).`
  };

  if (asJson) console.log(JSON.stringify(out, null, 2));
  else {
    console.log(`\n${C.green}${C.bold}✅ Rollback 100% concluído!${C.reset}`);
    console.log(`  Tag restaurada:            ${C.bold}${targetTag}${C.reset}`);
    console.log(`  Arquivos novos removidos:  ${removedUntracked.length} (somente os criados pelo update/bootstrap)`);
    if (switchedBackTo) console.log(`  Branch restaurada:         ${C.bold}${switchedBackTo}${C.reset} (branch temporária ${deletedBranch} removida)`);
    console.log('');
  }
  process.exit(0);
}

/**
 * Limpa scripts/update_template.js se foi baixado apenas para esta sessão e o usuário cancelou sem aplicar nada.
 */
function cleanupFreshBootstrapIfCancelled(repoDir) {
  const headExists = gitFileExistsInRef(repoDir, 'HEAD', 'scripts/update_template.js');
  if (!headExists) {
    const full = path.join(repoDir, 'scripts', 'update_template.js');
    if (fs.existsSync(full)) {
      try {
        fs.unlinkSync(full);
        removeEmptyParentDirs(repoDir, full);
        return true;
      } catch (e) {}
    }
  }
  return false;
}

/**
 * Resolve a fonte oficial do template (diretório local, git ref upstream/main ou fallback de simulação).
 */
function resolveUpstreamSource(repoDir, scriptRepoDir, opts) {
  let fetched = false;
  let upstreamAdded = false;
  const localManifest = readLocalManifest(repoDir);

  if (!opts.sourceDir && opts.sourceRef.startsWith('upstream/')) {
    const remotes = runGit(repoDir, ['remote', '-v']).stdout || '';
    if (!/upstream\s+.*\(fetch\)/.test(remotes)) {
      if (!(opts.targetDir && !opts.syncInfra)) {
        const officialUrl = localManifest?.officialRepo || DEFAULT_OFFICIAL_REPO;
        const addRes = runGit(repoDir, ['remote', 'add', 'upstream', officialUrl]);
        if (addRes.ok) upstreamAdded = true;
      }
    }
    if (!opts.noFetch) {
      const fetchRes = runGit(repoDir, ['fetch', 'upstream']);
      if (fetchRes.ok) fetched = true;
    }
  }

  let upstreamManifest = null;
  let readSourceFile = null;
  let existsInSource = null;
  let sourceLabel = opts.sourceRef;

  if (opts.sourceDir) {
    const absSrc = path.resolve(opts.sourceDir);
    upstreamManifest = readLocalManifest(absSrc);
    readSourceFile = (relPath) => {
      const p = path.join(absSrc, relPath);
      return fs.existsSync(p) ? fs.readFileSync(p) : null;
    };
    existsInSource = (relPath) => fs.existsSync(path.join(absSrc, relPath));
    sourceLabel = `local-dir (${path.basename(absSrc)})`;
  } else {
    upstreamManifest = readGitJsonFile(repoDir, opts.sourceRef, 'template-manifest.json');
    readSourceFile = (relPath) => readGitFileBuffer(repoDir, opts.sourceRef, relPath);
    existsInSource = (relPath) => gitFileExistsInRef(repoDir, opts.sourceRef, relPath);

    if (!upstreamManifest && opts.targetDir && opts.dryRun && fs.existsSync(path.join(scriptRepoDir, 'template-manifest.json'))) {
      upstreamManifest = readLocalManifest(scriptRepoDir);
      readSourceFile = (relPath) => {
        const p = path.join(scriptRepoDir, relPath);
        return fs.existsSync(p) ? fs.readFileSync(p) : null;
      };
      existsInSource = (relPath) => fs.existsSync(path.join(scriptRepoDir, relPath));
      sourceLabel = `local-template (${path.basename(scriptRepoDir)})`;
    }
  }

  return {
    localManifest,
    upstreamManifest,
    readSourceFile,
    existsInSource,
    sourceLabel,
    fetched,
    upstreamAdded
  };
}

function buildUpdatePlan(repoDir, upstreamManifest, existsInSource, readSourceFile, skipConfig) {
  const infraPaths = upstreamManifest.zones?.infra?.paths || [];
  const configPaths = new Set(upstreamManifest.zones?.infra?.configPaths || ['src/config.tex']);
  const createIfMissingPaths = upstreamManifest.zones?.createIfMissing?.paths || [];

  const plan = {
    toUpdate: [],
    toCreate: [],
    unchanged: [],
    skippedByFlag: [],
    gitignoreToAppend: []
  };

  for (const relPath of infraPaths) {
    if (skipConfig && configPaths.has(relPath)) {
      plan.skippedByFlag.push(relPath);
      continue;
    }
    if (!existsInSource(relPath)) continue;

    const srcBuf = readSourceFile(relPath);
    const localFull = path.join(repoDir, relPath);
    if (!fs.existsSync(localFull)) {
      plan.toCreate.push(relPath);
    } else {
      const localBuf = fs.readFileSync(localFull);
      if (buffersEqualNormalized(srcBuf, localBuf)) {
        plan.unchanged.push(relPath);
      } else {
        plan.toUpdate.push(relPath);
      }
    }
  }

  for (const relPath of createIfMissingPaths) {
    if (!existsInSource(relPath)) continue;
    if (!fs.existsSync(path.join(repoDir, relPath))) {
      plan.toCreate.push(relPath);
    }
  }

  const { assistedFindings, missingGitignore, sacredDetected } = inspectAssistedAndSacred(repoDir, upstreamManifest);
  plan.gitignoreToAppend = missingGitignore;

  return { plan, assistedFindings, sacredDetected };
}

/**
 * Aplica fisicamente a sincronização da Zona 1 com tag de backup, branch opcional e manifesto de rollback.
 */
function executeSyncInfra(repoDir, plan, readSourceFile, { currentBranch, currentHead, upstreamVersion, useBranch }) {
  const tag = makeTimestampTag();
  const tagRes = runGit(repoDir, ['tag', tag]);
  if (!tagRes.ok) {
    throw new Error(`Falha ao criar tag de backup '${tag}': ${tagRes.stderr}`);
  }

  let createdBranchName = null;
  if (useBranch) {
    const baseName = `chore/template-update-v${upstreamVersion}`;
    let candidate = baseName;
    if (runGit(repoDir, ['show-ref', '--verify', '--quiet', `refs/heads/${candidate}`]).ok) {
      candidate = `${baseName}-${Date.now().toString().slice(-4)}`;
    }
    const brRes = runGit(repoDir, ['checkout', '-b', candidate]);
    if (!brRes.ok) {
      throw new Error(`Falha ao criar branch isolada '${candidate}': ${brRes.stderr}`);
    }
    createdBranchName = candidate;
  }

  // Inclui também arquivos de bootstrap que não existiam na tag de backup para que --rollback deixe 0 arquivos extras
  const createdFilesSet = new Set(plan.toCreate);
  for (const bFile of BOOTSTRAP_FILES) {
    if (fs.existsSync(path.join(repoDir, bFile)) && !gitFileExistsInRef(repoDir, tag, bFile)) {
      createdFilesSet.add(bFile);
    }
  }

  const rollbackState = {
    timestamp: new Date().toISOString(),
    backupTag: tag,
    previousBranch: currentBranch,
    previousHead: currentHead,
    createdBranch: createdBranchName,
    createdFiles: [...createdFilesSet],
    updatedFiles: [...plan.toUpdate],
    gitignoreAppended: [...plan.gitignoreToAppend]
  };
  fs.writeFileSync(getRollbackStatePath(repoDir), JSON.stringify(rollbackState, null, 2), 'utf-8');

  for (const relPath of [...plan.toUpdate, ...plan.toCreate]) {
    const buf = readSourceFile(relPath);
    if (!buf) continue;
    const dest = path.join(repoDir, relPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
  }

  if (plan.gitignoreToAppend.length > 0) {
    const giPath = path.join(repoDir, '.gitignore');
    const currentGi = fs.existsSync(giPath) ? fs.readFileSync(giPath, 'utf-8') : '';
    const suffix = (currentGi.endsWith('\n') || currentGi.length === 0 ? '' : '\n')
      + '\n# Adicionado automaticamente pelo update_template.js (Template TCC IFS)\n'
      + plan.gitignoreToAppend.join('\n') + '\n';
    fs.writeFileSync(giPath, currentGi + suffix, 'utf-8');
  }

  return { backupTag: tag, createdBranch: createdBranchName };
}

/**
 * Baixa apenas os 3 arquivos essenciais de bootstrap para que uma IA conduza a atualização.
 */
function executePrepareAi(repoDir, existsInSource, readSourceFile) {
  const written = [];
  for (const relPath of BOOTSTRAP_FILES) {
    if (!existsInSource(relPath)) continue;
    const buf = readSourceFile(relPath);
    if (!buf) continue;
    const dest = path.join(repoDir, relPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    written.push(relPath);
  }
  return written;
}

/**
 * Executa auditoria pós-atualização: prova de integridade da Zona 3 + doctor + check.
 */
function runPostUpdateVerification(repoDir, { quiet = false, allowedCreateIfMissing = [] } = {}) {
  const allowedSet = new Set(allowedCreateIfMissing.map(p => p.replace(/\\/g, '/')));
  const verification = {
    sacredTouched: [],
    createIfMissingAdded: [],
    sacredIntact: true,
    doctor: null,
    check: null
  };

  // 1. Prova via git status de que nenhum arquivo sagrado foi modificado ou deletado
  const afterLines = getDirtyFiles(repoDir);
  for (const line of afterLines) {
    const isUntrackedNew = line.startsWith('??');
    const rel = parsePorcelainPath(line);
    if (!isSacredPath(rel)) continue;
    if (isUntrackedNew && allowedSet.has(rel)) {
      verification.createIfMissingAdded.push(rel);
      continue;
    }
    verification.sacredTouched.push(rel);
  }
  verification.sacredIntact = verification.sacredTouched.length === 0;

  // 2. Doctor (--json)
  const doctorScript = path.join(repoDir, 'scripts', 'doctor.js');
  if (fs.existsSync(doctorScript)) {
    if (!quiet) console.log(`\n${C.cyan}[1/2] Executando diagnóstico de dependências (doctor.js)...${C.reset}`);
    const docRes = spawnSync(process.execPath, [doctorScript, '--json'], {
      cwd: repoDir,
      encoding: 'utf-8',
      timeout: 60000
    });
    try {
      verification.doctor = JSON.parse(docRes.stdout || '{}');
    } catch (e) {
      verification.doctor = { ok: docRes.status === 0, parseError: true };
    }
  }

  // 3. Check (--json) — compila e audita layout/geometria/ABNT
  const checkScript = path.join(repoDir, 'scripts', 'check.js');
  if (fs.existsSync(checkScript)) {
    if (!quiet) console.log(`${C.cyan}[2/2] Recompilando e auditando PDF (check.js)...${C.reset}`);
    const chkRes = spawnSync(process.execPath, [checkScript, '--json'], {
      cwd: repoDir,
      encoding: 'utf-8',
      timeout: 180000,
      maxBuffer: 16 * 1024 * 1024
    });
    try {
      verification.check = JSON.parse(chkRes.stdout || '{}');
    } catch (e) {
      verification.check = { status: chkRes.status === 0 ? 'OK' : 'ERROR', parseError: true, stderr: (chkRes.stderr || '').slice(0, 400) };
    }
  }

  return verification;
}

function printVerificationReport(verification, { backupTag, createdBranch, upstreamVersion }) {
  console.log(`\n${C.cyan}${C.bold}============================================================${C.reset}`);
  console.log(`${C.cyan}${C.bold} 📋 Relatório de Validação Pós-Atualização${C.reset}`);
  console.log(`${C.cyan}${C.bold}============================================================${C.reset}`);
  console.log(`  Tag de Backup:      ${C.green}${C.bold}${backupTag}${C.reset}`);
  if (createdBranch) console.log(`  Branch Isolada:     ${C.green}${C.bold}${createdBranch}${C.reset}`);
  console.log(`  Integridade Zona 3: ${verification.sacredIntact
    ? `${C.green}${C.bold}✅ INTACTA (0 arquivos autorais tocados)${C.reset}`
    : `${C.red}${C.bold}❌ ALERTA: ${verification.sacredTouched.join(', ')}${C.reset}`}`);

  if (verification.doctor && verification.doctor.summary) {
    const d = verification.doctor.summary;
    const capOk = d.capabilitiesReady ?? d.readyCapabilities ?? '?';
    const capTot = d.capabilitiesTotal ?? d.totalCapabilities ?? '?';
    console.log(`  Ambiente (doctor):  ${verification.doctor.ready ? C.green : C.yellow}${capOk}/${capTot} capacidades prontas${C.reset}`);
  }

  if (verification.check && !verification.check.parseError) {
    const c = verification.check;
    const st = c.summary?.status || 'OK';
    const errs = c.summary?.errorsCount ?? 0;
    const warns = c.summary?.warningsCount ?? 0;
    const pages = c.geometryAudit?.pagesAnalyzed || '?';
    const overfull = c.buildDiagnostics?.layoutIssues?.overfullHbox?.length ?? 0;
    const drifts = c.layoutAudit?.floatDrifts?.length ?? 0;
    const g = c.geometryAudit || {};
    const geomIssues = (g.marginOverflows?.length || 0)
      + (g.bottomOverflows?.length || 0)
      + (g.splitParagraphs?.length || 0)
      + (g.hyphenatedPageBreaks?.length || 0);
    const statusColor = errs > 0 ? C.red : (warns > 0 || geomIssues > 0 ? C.yellow : C.green);
    console.log(`  Auditoria (check):  ${statusColor}${C.bold}${st}${C.reset} (${pages} págs | ${errs} erros | ${warns} avisos | ${overfull} Overfull | ${drifts} Float Drift | ${geomIssues} alertas geométricos)`);
    if (geomIssues > 0 || warns > 0) {
      console.log(`  ${C.gray}Dica: execute '.\\make.bat preview --issues' para inspecionar visualmente as páginas com alerta.${C.reset}`);
    }
  } else if (verification.check) {
    console.log(`  Auditoria (check):  ${C.yellow}Não foi possível ler o JSON completo (rode '.\\make.bat check' para detalhes)${C.reset}`);
  }

  console.log(`\n${C.bold}Como concluir ou desfazer:${C.reset}`);
  console.log(`  ✅ Aprovou tudo?   ${C.bold}git add . && git commit -m "chore(template): atualiza infra para v${upstreamVersion}"${C.reset}`);
  console.log(`  ↩️  Quer desfazer?  ${C.bold}node scripts/update_template.js --rollback${C.reset}\n`);
}

function printSummaryReport(result) {
  const { plan, assistedFindings, sacredPreserved: sacredDetected } = result;
  const totalPendingActions = plan.toUpdate.length + plan.toCreate.length + plan.gitignoreToAppend.length;

  console.log(`\n${C.cyan}${C.bold}============================================================${C.reset}`);
  console.log(`${C.cyan}${C.bold} 🔄 Atualizador Seguro do Template TCC IFS (v2.3 — 3 Zonas)${C.reset}`);
  console.log(`${C.cyan}${C.bold}============================================================${C.reset}`);
  console.log(`  Repositório:      ${C.bold}${result.repoDir}${C.reset} (branch: ${result.createdBranch || result.currentBranch})`);
  console.log(`  Versão Local:     ${C.yellow}${result.localVersion}${C.reset}  ➔  Oficial (${result.source}): ${C.green}v${result.upstreamVersion}${C.reset}`);
  console.log(`  Histórico Git:    ${result.hasSharedHistory ? `${C.green}Compartilhado${C.reset}` : `${C.cyan}Independente (Use this template) — suportado via --sync-infra${C.reset}`}`);
  console.log(`  Working Tree:     ${result.workingTreeClean ? `${C.green}Limpo${C.reset}` : (result.onlyBootstrapDirty ? `${C.cyan}Apenas bootstrap do atualizador — permitido${C.reset}` : `${C.yellow}${result.dirtyFilesCount} arquivo(s) com alteração pendente${C.reset}`)}`);

  if (result.backupTag) {
    console.log(`  Tag de Backup:    ${C.green}${C.bold}${result.backupTag}${C.reset} (reversível integralmente via --rollback)`);
  }
  if (result.createdBranch) {
    console.log(`  Branch Isolada:   ${C.green}${C.bold}${result.createdBranch}${C.reset} (branch '${result.currentBranch}' permanece 100% intocada)`);
  }

  console.log(`\n${C.bold}🟢 Zona 1 — Infraestrutura Pura (${plan.toUpdate.length} atualizar, ${plan.toCreate.length} criar, ${plan.unchanged.length} já iguais):${C.reset}`);
  if (plan.toUpdate.length > 0) {
    console.log(`  ${C.cyan}Atualizar (${plan.toUpdate.length}):${C.reset}`);
    plan.toUpdate.forEach(f => console.log(`    • ${f}`));
  }
  if (plan.toCreate.length > 0) {
    console.log(`  ${C.green}Criar novos (${plan.toCreate.length}):${C.reset}`);
    plan.toCreate.forEach(f => console.log(`    + ${f}`));
  }
  if (plan.skippedByFlag.length > 0) {
    console.log(`  ${C.yellow}Preservados via --skip-config:${C.reset} ${plan.skippedByFlag.join(', ')}`);
  }
  if (plan.gitignoreToAppend.length > 0) {
    console.log(`  ${C.cyan}Acrescentar ao .gitignore (sem apagar regras locais):${C.reset} ${plan.gitignoreToAppend.join(', ')}`);
  }
  if (totalPendingActions === 0) {
    console.log(`  ${C.green}[OK] Todos os arquivos de infraestrutura já estão idênticos à versão oficial.${C.reset}`);
  }

  console.log(`\n${C.bold}🟡 Zona 2 — Migração Assistida (NUNCA sobrescrita automaticamente):${C.reset}`);
  if (assistedFindings.length === 0) {
    console.log(`  ${C.green}[OK] Nenhuma pendência estrutural detectada em main.tex ou metadados.tex.${C.reset}`);
  } else {
    assistedFindings.forEach(item => {
      const tag = item.severity === 'ACTION_RECOMMENDED' ? `${C.yellow}[RECOMENDADO]${C.reset}` : `${C.cyan}[OPCIONAL]${C.reset}`;
      console.log(`  ${tag} ${C.bold}${item.file}${C.reset}: ${item.message}`);
    });
  }

  console.log(`\n${C.bold}🔴 Zona 3 — Conteúdo Autoral Intocável (${sacredDetected.length} caminho(s) protegido(s)):${C.reset}`);
  console.log(`  ${C.gray}${sacredDetected.join(', ')}${C.reset}`);
}

async function runWizard(repoDir, scriptRepoDir, opts) {
  const ui = createPromptHelper();
  try {
    console.log(`\n${C.cyan}${C.bold}🧭 Assistente Interativo de Atualização Segura (Template TCC IFS v2.3)${C.reset}`);
    console.log(`${C.gray}Seus capítulos, figuras, referências e pastas próprias (Zona 3) nunca são alterados.${C.reset}`);

    const src = resolveUpstreamSource(repoDir, scriptRepoDir, opts);
    if (!src.upstreamManifest) {
      throw new Error(`Não foi possível ler template-manifest.json em '${src.sourceLabel}'. Verifique sua conexão com o GitHub.`);
    }

    // Self-update automático antes de iniciar o menu interativo
    checkAndRunSelfUpdate(repoDir, src, opts, { allowApply: true });

    let dirtyFiles = getDirtyFiles(repoDir);
    let isClean = dirtyFiles.length === 0;
    let onlyBootstrapDirty = isOnlyBootstrapDirty(dirtyFiles);

    if (!isClean && !onlyBootstrapDirty) {
      const nonBootstrap = dirtyFiles.filter(l => !BOOTSTRAP_FILES.includes(parsePorcelainPath(l)));
      console.log(`\n${C.yellow}${C.bold}[ATENÇÃO] Você possui ${nonBootstrap.length} alteração(ões) local(is) ainda não salvas no Git:${C.reset}`);
      nonBootstrap.slice(0, 10).forEach(l => console.log(`  ${C.gray}${l}${C.reset}`));
      if (nonBootstrap.length > 10) console.log(`  ${C.gray}... (+${nonBootstrap.length - 10} arquivo(s))${C.reset}`);

      const ansCommit = (await ui.ask(`\nDeseja salvar um commit de segurança com seu trabalho atual antes de continuar? [s/N]: `)).toLowerCase();
      if (ansCommit === 's' || ansCommit === 'sim' || ansCommit === 'y') {
        const resCommit = createAutoSafetyCommit(repoDir, 'chore: backup antes de atualizar template');
        console.log(`${C.green}✅ Commit de segurança criado com sucesso (${resCommit.hash || 'ok'})!${C.reset}`);
        dirtyFiles = getDirtyFiles(repoDir);
        isClean = dirtyFiles.length === 0;
        onlyBootstrapDirty = isOnlyBootstrapDirty(dirtyFiles);
      } else {
        console.log(`\n${C.yellow}Atualização cancelada com segurança. Salve suas alterações no Git quando estiver pronto e rode novamente.${C.reset}`);
        if (opts.bootstrapFresh && cleanupFreshBootstrapIfCancelled(repoDir)) {
          console.log(`${C.gray}Arquivo temporário de bootstrap removido (repositório preservado sem sujeira).${C.reset}\n`);
        }
        process.exit(0);
      }
    }

    const currentBranch = runGit(repoDir, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout || 'main';
    const currentHead = runGit(repoDir, ['rev-parse', '--short', 'HEAD']).stdout || '';
    const mergeBaseRes = opts.sourceDir ? { ok: false, stdout: '' } : runGit(repoDir, ['merge-base', 'HEAD', opts.sourceRef]);
    const hasSharedHistory = mergeBaseRes.ok && mergeBaseRes.stdout.length > 0;
    const { plan, assistedFindings, sacredDetected } = buildUpdatePlan(repoDir, src.upstreamManifest, src.existsInSource, src.readSourceFile, false);
    const totalPendingActions = plan.toUpdate.length + plan.toCreate.length + plan.gitignoreToAppend.length;

    const previewResult = {
      ok: true,
      mode: 'wizard',
      repoDir,
      currentBranch,
      source: src.sourceLabel,
      hasSharedHistory,
      workingTreeClean: isClean,
      onlyBootstrapDirty,
      dirtyFilesCount: dirtyFiles.length,
      localVersion: src.localManifest?.version || 'legado (< 2.5.0)',
      upstreamVersion: src.upstreamManifest.version || 'desconhecida',
      backupTag: null,
      createdBranch: null,
      plan,
      assistedFindings,
      sacredPreserved: sacredDetected
    };

    printSummaryReport(previewResult);

    if (totalPendingActions === 0) {
      console.log(`\n${C.green}${C.bold}✨ Seu projeto já está 100% atualizado (v${previewResult.upstreamVersion})!${C.reset}\n`);
      process.exit(0);
    }

    console.log(`\n${C.bold}Escolha como deseja prosseguir:${C.reset}`);
    console.log(`  ${C.green}[1]${C.reset} Atualizar em ${C.bold}branch isolada${C.reset} (Recomendado — mantém '${currentBranch}' 100% intocada)`);
    console.log(`  ${C.cyan}[2]${C.reset} Atualizar em branch isolada ${C.bold}mantendo src/config.tex intacto${C.reset} (ideal perto da banca)`);
    console.log(`  ${C.yellow}[3]${C.reset} Apenas trazer o kit mínimo (skill + guia) para minha IA conduzir depois (não altera o TCC)`);
    console.log(`  ${C.gray}[0]${C.reset} Cancelar (não alterar nada)`);

    const choice = await ui.ask(`\nOpção [1/2/3/0] (padrão: 1): `);
    const selected = choice === '' ? '1' : choice;

    if (selected === '0') {
      console.log(`\n${C.yellow}Atualização cancelada. Nenhum arquivo do seu TCC foi alterado.${C.reset}`);
      if (opts.bootstrapFresh && cleanupFreshBootstrapIfCancelled(repoDir)) {
        console.log(`${C.gray}Arquivo temporário de bootstrap removido (repositório 100% limpo).${C.reset}\n`);
      }
      process.exit(0);
    }

    if (selected === '3') {
      const written = executePrepareAi(repoDir, src.existsInSource, src.readSourceFile);
      console.log(`\n${C.green}${C.bold}🤖 Kit mínimo para IA instalado (${written.length} arquivos):${C.reset}`);
      written.forEach(f => console.log(`  + ${f}`));
      console.log(`\n${C.bold}Agora basta abrir sua IA neste projeto e colar:${C.reset}`);
      console.log(`  ${C.cyan}"Use a skill template_updater para verificar e atualizar a infraestrutura do template com segurança em branch isolada."${C.reset}\n`);
      process.exit(0);
    }

    if (selected !== '1' && selected !== '2') {
      console.log(`\n${C.red}Opção inválida ('${selected}'). Operação cancelada sem alterar nada.${C.reset}\n`);
      if (opts.bootstrapFresh) cleanupFreshBootstrapIfCancelled(repoDir);
      process.exit(1);
    }

    const skipConfig = selected === '2';
    const finalPlanBundle = skipConfig
      ? buildUpdatePlan(repoDir, src.upstreamManifest, src.existsInSource, src.readSourceFile, true)
      : { plan, assistedFindings, sacredDetected };

    const { backupTag, createdBranch } = executeSyncInfra(repoDir, finalPlanBundle.plan, src.readSourceFile, {
      currentBranch,
      currentHead,
      upstreamVersion: previewResult.upstreamVersion,
      useBranch: true
    });

    console.log(`\n${C.green}${C.bold}✅ Infraestrutura sincronizada com sucesso!${C.reset}`);
    console.log(`  Tag de backup:   ${C.bold}${backupTag}${C.reset}`);
    console.log(`  Branch isolada:  ${C.bold}${createdBranch}${C.reset} (branch '${currentBranch}' intacta)`);

    const ansVerify = (await ui.ask(`\nExecutar validação completa agora (prova da Zona 3 + doctor + build/check)? [S/n]: `)).toLowerCase();
    if (ansVerify === '' || ansVerify === 's' || ansVerify === 'sim' || ansVerify === 'y') {
      const verification = runPostUpdateVerification(repoDir, {
        allowedCreateIfMissing: src.upstreamManifest.zones?.createIfMissing?.paths || []
      });
      printVerificationReport(verification, {
        backupTag,
        createdBranch,
        upstreamVersion: previewResult.upstreamVersion
      });
    } else {
      console.log(`\nQuando quiser validar, rode: ${C.bold}.\\make.bat doctor && .\\make.bat check${C.reset}`);
      console.log(`Para desfazer 100%:          ${C.bold}node scripts/update_template.js --rollback${C.reset}\n`);
    }
  } catch (err) {
    console.error(`\n${C.red}[ERRO]${C.reset} ${err.message}\n`);
    process.exit(1);
  } finally {
    ui.close();
  }
}

async function main() {
  const opts = parseArgs();
  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  const repoDir = opts.targetDir ? path.resolve(opts.targetDir) : path.resolve(__dirname, '..');
  const scriptRepoDir = path.resolve(__dirname, '..');

  if (!runGit(repoDir, ['--version']).ok) {
    const err = { ok: false, error: 'Git não encontrado no sistema. Instale em https://git-scm.com/.' };
    if (opts.json) console.log(JSON.stringify(err, null, 2));
    else console.error(`${C.red}[ERRO]${C.reset} ${err.error}`);
    process.exit(1);
  }

  if (!runGit(repoDir, ['rev-parse', '--is-inside-work-tree']).ok) {
    const err = { ok: false, error: `Diretório não é um repositório Git: ${repoDir}` };
    if (opts.json) console.log(JSON.stringify(err, null, 2));
    else console.error(`${C.red}[ERRO]${C.reset} ${err.error}`);
    process.exit(1);
  }

  if (opts.rollback) {
    if (opts.targetDir) {
      console.error('[ERRO] Por segurança, --rollback só deve ser executado dentro do próprio repositório alvo (sem --target).');
      process.exit(1);
    }
    handleRollback(repoDir, opts.json);
  }

  if (opts.auto) {
    if (opts.targetDir) {
      console.error('[ERRO] Por segurança, --auto só deve ser executado dentro do próprio repositório alvo (sem --target).');
      process.exit(1);
    }
    runAutoUpdate(repoDir, scriptRepoDir, opts);
    return;
  }

  if (opts.wizard) {
    if (opts.targetDir) {
      console.error('[ERRO] --wizard deve ser executado dentro do próprio repositório alvo (sem --target).');
      process.exit(1);
    }
    await runWizard(repoDir, scriptRepoDir, opts);
    return;
  }

  const dirtyFiles = getDirtyFiles(repoDir);
  const isClean = dirtyFiles.length === 0;
  const onlyBootstrapDirty = isOnlyBootstrapDirty(dirtyFiles);
  const currentBranch = runGit(repoDir, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout || 'main';
  const currentHead = runGit(repoDir, ['rev-parse', '--short', 'HEAD']).stdout || '';

  const src = resolveUpstreamSource(repoDir, scriptRepoDir, opts);
  if (!src.upstreamManifest) {
    const err = {
      ok: false,
      error: `Não foi possível ler template-manifest.json em '${src.sourceLabel}'. Verifique a conexão ou execute 'git fetch upstream'.`
    };
    if (opts.json) console.log(JSON.stringify(err, null, 2));
    else console.error(`${C.red}[ERRO]${C.reset} ${err.error}`);
    process.exit(1);
  }

  // Self-update: aplica automaticamente em --sync-infra (não dry-run); em --dry-run/check apenas sinaliza
  const selfUpd = checkAndRunSelfUpdate(repoDir, src, opts, { allowApply: Boolean(opts.syncInfra && !opts.dryRun) });

  if (opts.prepareAi) {
    const written = executePrepareAi(repoDir, src.existsInSource, src.readSourceFile);
    const out = {
      ok: true,
      mode: 'prepare-ai',
      repoDir,
      source: src.sourceLabel,
      upstreamVersion: src.upstreamManifest.version || 'desconhecida',
      writtenFiles: written,
      suggestedPrompt: 'Use a skill template_updater para verificar e atualizar a infraestrutura do template com segurança em branch isolada.'
    };
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      console.log(`\n${C.green}${C.bold}🤖 Kit mínimo para IA instalado (${written.length} arquivos):${C.reset}`);
      written.forEach(f => console.log(`  + ${f}`));
      console.log(`\n${C.bold}Prompt pronto para colar na IA:${C.reset}`);
      console.log(`  ${C.cyan}"${out.suggestedPrompt}"${C.reset}\n`);
    }
    process.exit(0);
  }

  const mergeBaseRes = opts.sourceDir ? { ok: false, stdout: '' } : runGit(repoDir, ['merge-base', 'HEAD', opts.sourceRef]);
  const hasSharedHistory = mergeBaseRes.ok && mergeBaseRes.stdout.length > 0;
  const { plan, assistedFindings, sacredDetected } = buildUpdatePlan(repoDir, src.upstreamManifest, src.existsInSource, src.readSourceFile, opts.skipConfig);

  const totalPendingActions = plan.toUpdate.length + plan.toCreate.length + plan.gitignoreToAppend.length;
  const localVersion = src.localManifest?.version || 'legado (< 2.5.0)';
  const upstreamVersion = src.upstreamManifest.version || 'desconhecida';

  const result = {
    ok: true,
    mode: opts.syncInfra ? (opts.dryRun ? 'dry-run' : 'sync-infra') : (opts.dryRun ? 'dry-run' : 'check'),
    selfUpdateAvailable: selfUpd.available,
    selfUpdated: opts.selfUpdated,
    repoDir,
    currentBranch,
    source: src.sourceLabel,
    fetched: src.fetched,
    upstreamAdded: src.upstreamAdded,
    hasSharedHistory,
    workingTreeClean: isClean,
    onlyBootstrapDirty,
    dirtyFilesCount: dirtyFiles.length,
    localVersion,
    upstreamVersion,
    upToDate: totalPendingActions === 0,
    backupTag: null,
    createdBranch: null,
    plan,
    assistedFindings,
    sacredPreserved: sacredDetected,
    verification: null
  };

  if (opts.syncInfra && !opts.dryRun) {
    if (opts.targetDir) {
      const err = { ok: false, error: 'Por segurança, --sync-infra não aceita --target. Execute o script dentro do próprio repositório que deseja atualizar.' };
      if (opts.json) console.log(JSON.stringify(err, null, 2));
      else console.error(`${C.red}[ERRO]${C.reset} ${err.error}`);
      process.exit(1);
    }

    if (!isClean && !onlyBootstrapDirty) {
      const err = {
        ok: false,
        error: `Existem ${dirtyFiles.length} alteração(ões) local(is) não commitada(s). Salve um commit antes de rodar --sync-infra para garantir backup seguro.`,
        dirtyFiles: dirtyFiles.slice(0, 15)
      };
      if (opts.json) console.log(JSON.stringify(err, null, 2));
      else {
        console.error(`\n${C.red}[BLOQUEADO]${C.reset} ${err.error}`);
        console.error(`${C.gray}Execute primeiro: git add . && git commit -m "chore: backup antes de atualizar template"${C.reset}\n`);
      }
      process.exit(1);
    }

    if (totalPendingActions === 0) {
      if (opts.json) console.log(JSON.stringify(result, null, 2));
      else console.log(`\n${C.green}${C.bold}✨ Infraestrutura já está 100% atualizada (v${upstreamVersion})!${C.reset}\n`);
      process.exit(0);
    }

    try {
      const applied = executeSyncInfra(repoDir, plan, src.readSourceFile, {
        currentBranch,
        currentHead,
        upstreamVersion,
        useBranch: opts.useBranch
      });
      result.backupTag = applied.backupTag;
      result.createdBranch = applied.createdBranch;
    } catch (e) {
      const err = { ok: false, error: e.message };
      if (opts.json) console.log(JSON.stringify(err, null, 2));
      else console.error(`${C.red}[ERRO]${C.reset} ${err.error}`);
      process.exit(1);
    }

    if (opts.verify) {
      result.verification = runPostUpdateVerification(repoDir, {
        quiet: opts.json,
        allowedCreateIfMissing: src.upstreamManifest.zones?.createIfMissing?.paths || []
      });
    }
  }

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  printSummaryReport(result);

  if (opts.syncInfra && !opts.dryRun && totalPendingActions > 0) {
    if (result.verification) {
      printVerificationReport(result.verification, {
        backupTag: result.backupTag,
        createdBranch: result.createdBranch,
        upstreamVersion
      });
    } else {
      console.log(`\n${C.green}${C.bold}🎉 Sincronização da Zona 1 concluída com sucesso!${C.reset}`);
      console.log(`Próximos passos obrigatórios de validação:`);
      console.log(`  1. Valide dependências:  ${C.bold}.\\make.bat doctor${C.reset}`);
      console.log(`  2. Recompile e audite:   ${C.bold}.\\make.bat check${C.reset}`);
      console.log(`  3. Confira o diff:       ${C.bold}git status && git diff --stat${C.reset}`);
      console.log(`  4. Se tudo estiver OK:   ${C.bold}git add . && git commit -m "chore(template): atualiza infra para v${upstreamVersion}"${C.reset}`);
      console.log(`  5. Para desfazer 100%:   ${C.bold}.\\make.bat update --rollback${C.reset}\n`);
    }
  } else if (totalPendingActions > 0) {
    console.log(`\n${C.bold}Como aplicar esta atualização com segurança:${C.reset}`);
    console.log(`  • Direto em 1 comando (Recomendado): ${C.bold}.\\make.bat update --auto${C.reset} ${C.gray}(backup + branch isolada + validação)${C.reset}`);
    console.log(`  • Assistente interativo:             ${C.bold}.\\make.bat update --wizard${C.reset}`);
    console.log(`    ${C.gray}(Adicione --skip-config se estiver perto da banca e não quiser alterar src/config.tex)${C.reset}\n`);
  } else {
    console.log('');
  }
}

main();

#!/usr/bin/env node
/**
 * update_template.js (v2.1) - Atualizador Seguro e Blindado do Template TCC IFS (LaTeX).
 *
 * Projetado para funcionar inclusive em projetos criados via "Use this template" no GitHub
 * (históricos Git independentes / unrelated histories) sem NUNCA sobrescrever capítulos,
 * figuras, referências, metadados ou pastas autorais (docs/guias, docs/pdfs, resources, cache).
 *
 * Garantias de segurança e reversibilidade:
 *   1. Exige working tree limpo (tolerando apenas scripts/update_template.js modificado pelo Passo 0)
 *   2. Cria tag Git de backup (backup/pre-update-YYYYMMDD-HHMMSS) antes de qualquer escrita
 *   3. Suporta --branch para testar a atualização em uma branch isolada sem tocar na branch atual
 *   4. Salva manifesto de reversão em .git/template-update-last.json (invisível ao git status)
 *      com a lista exata de createdFiles para que --rollback devolva o repo 100% limpo ao estado
 *      anterior sem jamais rodar `git clean` sobre arquivos do aluno.
 *
 * Uso:
 *   node scripts/update_template.js                          # Verifica versão e diagnóstico da Zona 2
 *   node scripts/update_template.js --dry-run                # Simula --sync-infra sem alterar nenhum arquivo
 *   node scripts/update_template.js --sync-infra             # Cria backup e sincroniza Zona 1 + .gitignore
 *   node scripts/update_template.js --sync-infra --branch    # Aplica em uma nova branch isolada
 *   node scripts/update_template.js --sync-infra --skip-config  # Mantém src/config.tex intacto
 *   node scripts/update_template.js --rollback               # Reverte 100% para o estado pré-update
 *   node scripts/update_template.js --json                   # Saída estruturada em JSON (ideal para IAs)
 *   node scripts/update_template.js --target=<dir>           # Simula em outro repositório (somente --dry-run/check)
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DEFAULT_OFFICIAL_REPO = 'https://github.com/JGustavoCN/template-tcc-ifs-latex.git';

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
    dryRun: args.includes('--dry-run'),
    syncInfra: args.includes('--sync-infra') || args.includes('--merge') || args.includes('-m'),
    skipConfig: args.includes('--skip-config'),
    useBranch: args.includes('--branch'),
    rollback: args.includes('--rollback'),
    noFetch: args.includes('--no-fetch'),
    targetDir,
    sourceRef,
    sourceDir
  };
}

function printHelp() {
  console.log(`
Uso: node scripts/update_template.js [opcoes]

Modos:
  (padrao)        Verifica versao local vs. upstream/main e diagnostica a Zona 2
  --dry-run       Simula a sincronizacao sem modificar nenhum arquivo
  --sync-infra    Cria tag Git de backup e atualiza SOMENTE a Zona 1 (infraestrutura) + append no .gitignore
  --rollback      Restaura 100% o repositorio para o estado pre-update (inclusive removendo apenas arquivos novos do update)

Opcoes adicionais:
  --branch        Cria e muda para uma branch isolada (chore/template-update-vX.Y.Z) antes de --sync-infra
  --skip-config   Mantem src/config.tex intacto durante --sync-infra (ideal perto da banca)
  --no-fetch      Usa o upstream/main ja presente no Git local (offline)
  --ref=<gitref>  Usa outra referencia Git como origem (padrao: upstream/main)
  --source-dir=<d> Usa uma pasta local do template como origem (util para testes offline)
  --target=<dir>  Audita/simula outro repositorio TCC (ex.: --target=../project-tcc --dry-run)
  --json          Emite relatorio estruturado em JSON (ideal para agentes de IA)
  --help, -h      Exibe esta ajuda
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

/**
 * Verifica se um status porcelain contém apenas o bootstrap legítimo de scripts/update_template.js.
 */
function isOnlyBootstrapDirty(dirtyFiles) {
  if (dirtyFiles.length === 0) return false;
  return dirtyFiles.every(line => {
    const filePart = line.replace(/^[ MADRCU?!]{1,2}\s+/, '').trim().replace(/^"|"$/g, '').replace(/\\/g, '/');
    return filePart === 'scripts/update_template.js';
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

function makeTimestampTag() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `backup/pre-update-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
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

  // 1. Se a atualização foi executada em branch isolada (--branch), limpa working tree e volta para a branch anterior
  const currentBranch = runGit(repoDir, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout || '';
  const createdBranch = state?.createdBranch || null;
  const previousBranch = state?.previousBranch || null;

  // Reseta rastreados para a tag de backup
  const resetRes = runGit(repoDir, ['reset', '--hard', targetTag]);
  if (!resetRes.ok) {
    const out = { ok: false, tag: targetTag, error: resetRes.stderr || 'Falha ao executar git reset --hard.' };
    if (asJson) console.log(JSON.stringify(out, null, 2));
    else console.error(`${C.red}[ERRO]${C.reset} ${out.error}`);
    process.exit(1);
  }

  // 2. Remove EXCLUSIVAMENTE os arquivos novos (untracked) que foram criados por este update (nunca usa git clean!)
  if (state && Array.isArray(state.createdFiles)) {
    for (const relPath of state.createdFiles) {
      const fullPath = path.join(repoDir, relPath);
      if (!fs.existsSync(fullPath)) continue;
      // Só remove se não estiver rastreado no commit da tag de backup
      const trackedInTag = gitFileExistsInRef(repoDir, targetTag, relPath);
      if (!trackedInTag) {
        try {
          fs.unlinkSync(fullPath);
          removedUntracked.push(relPath);
          removeEmptyParentDirs(repoDir, fullPath);
        } catch (e) {}
      }
    }
  }

  // 3. Se estava na branch temporária criada por --branch, retorna à branch anterior e remove a branch temporária
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

  // Remove o arquivo de estado de rollback após restaurar com sucesso
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
    console.log(`  Arquivos novos removidos:  ${removedUntracked.length} (somente os criados pelo update)`);
    if (switchedBackTo) console.log(`  Branch restaurada:         ${C.bold}${switchedBackTo}${C.reset} (branch temporária ${deletedBranch} removida)`);
    console.log('');
  }
  process.exit(0);
}

function main() {
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

  const statusRes = runGit(repoDir, ['status', '--porcelain']);
  const dirtyFiles = statusRes.ok && statusRes.stdout ? statusRes.stdout.split(/\r?\n/).filter(Boolean) : [];
  const isClean = dirtyFiles.length === 0;
  const onlyBootstrapDirty = isOnlyBootstrapDirty(dirtyFiles);
  const currentBranch = runGit(repoDir, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout || 'main';
  const currentHead = runGit(repoDir, ['rev-parse', '--short', 'HEAD']).stdout || '';
  const localManifest = readLocalManifest(repoDir);

  // 2. Configura e busca upstream (exceto se --source-dir foi informado)
  let fetched = false;
  let upstreamAdded = false;
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

  // 3. Resolve origem (pasta local via --source-dir, ref Git, ou fallback de simulação read-only)
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

  if (!upstreamManifest) {
    const err = {
      ok: false,
      error: `Não foi possível ler template-manifest.json em '${sourceLabel}'. Verifique a conexão ou execute 'git fetch upstream'.`
    };
    if (opts.json) console.log(JSON.stringify(err, null, 2));
    else console.error(`${C.red}[ERRO]${C.reset} ${err.error}`);
    process.exit(1);
  }

  const mergeBaseRes = opts.sourceDir ? { ok: false, stdout: '' } : runGit(repoDir, ['merge-base', 'HEAD', opts.sourceRef]);
  const hasSharedHistory = mergeBaseRes.ok && mergeBaseRes.stdout.length > 0;

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
    if (opts.skipConfig && configPaths.has(relPath)) {
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

  const totalPendingActions = plan.toUpdate.length + plan.toCreate.length + plan.gitignoreToAppend.length;
  const localVersion = localManifest?.version || 'legado (< 2.5.0)';
  const upstreamVersion = upstreamManifest.version || 'desconhecida';

  const result = {
    ok: true,
    mode: opts.syncInfra ? (opts.dryRun ? 'dry-run' : 'sync-infra') : (opts.dryRun ? 'dry-run' : 'check'),
    repoDir,
    currentBranch,
    source: sourceLabel,
    fetched,
    upstreamAdded,
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
    sacredPreserved: sacredDetected
  };

  // 6. Execução segura (--sync-infra, sem --dry-run)
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

    // Cria tag de backup no HEAD original ANTES de criar branch ou modificar qualquer arquivo
    const tag = makeTimestampTag();
    const tagRes = runGit(repoDir, ['tag', tag]);
    if (!tagRes.ok) {
      const err = { ok: false, error: `Falha ao criar tag de backup '${tag}': ${tagRes.stderr}` };
      if (opts.json) console.log(JSON.stringify(err, null, 2));
      else console.error(`${C.red}[ERRO]${C.reset} ${err.error}`);
      process.exit(1);
    }
    result.backupTag = tag;

    // Se --branch foi solicitado, cria branch isolada mantendo a branch principal 100% intocada
    let createdBranchName = null;
    if (opts.useBranch) {
      const baseName = `chore/template-update-v${upstreamVersion}`;
      let candidate = baseName;
      if (runGit(repoDir, ['show-ref', '--verify', '--quiet', `refs/heads/${candidate}`]).ok) {
        candidate = `${baseName}-${Date.now().toString().slice(-4)}`;
      }
      const brRes = runGit(repoDir, ['checkout', '-b', candidate]);
      if (!brRes.ok) {
        const err = { ok: false, error: `Falha ao criar branch isolada '${candidate}': ${brRes.stderr}` };
        if (opts.json) console.log(JSON.stringify(err, null, 2));
        else console.error(`${C.red}[ERRO]${C.reset} ${err.error}`);
        process.exit(1);
      }
      createdBranchName = candidate;
      result.createdBranch = candidate;
    }

    // Registra estado completo de rollback em .git/template-update-last.json ANTES de gravar arquivos
    const rollbackState = {
      timestamp: new Date().toISOString(),
      backupTag: tag,
      previousBranch: currentBranch,
      previousHead: currentHead,
      createdBranch: createdBranchName,
      createdFiles: [...plan.toCreate],
      updatedFiles: [...plan.toUpdate],
      gitignoreAppended: [...plan.gitignoreToAppend]
    };
    fs.writeFileSync(getRollbackStatePath(repoDir), JSON.stringify(rollbackState, null, 2), 'utf-8');

    // Aplica arquivos da Zona 1 + createIfMissing
    for (const relPath of [...plan.toUpdate, ...plan.toCreate]) {
      const buf = readSourceFile(relPath);
      if (!buf) continue;
      const dest = path.join(repoDir, relPath);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buf);
    }

    // Append idempotente no .gitignore (preserva 100% das regras existentes do aluno)
    if (plan.gitignoreToAppend.length > 0) {
      const giPath = path.join(repoDir, '.gitignore');
      const currentGi = fs.existsSync(giPath) ? fs.readFileSync(giPath, 'utf-8') : '';
      const suffix = (currentGi.endsWith('\n') || currentGi.length === 0 ? '' : '\n')
        + '\n# Adicionado automaticamente pelo update_template.js (Template TCC IFS)\n'
        + plan.gitignoreToAppend.join('\n') + '\n';
      fs.writeFileSync(giPath, currentGi + suffix, 'utf-8');
    }
  }

  // 7. Saída JSON ou Terminal
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  console.log(`\n${C.cyan}${C.bold}============================================================${C.reset}`);
  console.log(`${C.cyan}${C.bold} 🔄 Atualizador Seguro do Template TCC IFS (v2.1 — 3 Zonas)${C.reset}`);
  console.log(`${C.cyan}${C.bold}============================================================${C.reset}`);
  console.log(`  Repositório:      ${C.bold}${repoDir}${C.reset} (branch: ${result.createdBranch || currentBranch})`);
  console.log(`  Versão Local:     ${C.yellow}${localVersion}${C.reset}  ➔  Oficial (${sourceLabel}): ${C.green}v${upstreamVersion}${C.reset}`);
  console.log(`  Histórico Git:    ${hasSharedHistory ? `${C.green}Compartilhado${C.reset}` : `${C.cyan}Independente (Use this template) — suportado via --sync-infra${C.reset}`}`);
  console.log(`  Working Tree:     ${isClean ? `${C.green}Limpo${C.reset}` : (onlyBootstrapDirty ? `${C.cyan}Apenas bootstrap (scripts/update_template.js) — permitido${C.reset}` : `${C.yellow}${dirtyFiles.length} arquivo(s) com alteração pendente${C.reset}`)}`);

  if (result.backupTag) {
    console.log(`  Tag de Backup:    ${C.green}${C.bold}${result.backupTag}${C.reset} (reversível integralmente via --rollback)`);
  }
  if (result.createdBranch) {
    console.log(`  Branch Isolada:   ${C.green}${C.bold}${result.createdBranch}${C.reset} (branch '${currentBranch}' permanece 100% intocada)`);
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

  if (opts.syncInfra && !opts.dryRun && totalPendingActions > 0) {
    console.log(`\n${C.green}${C.bold}🎉 Sincronização da Zona 1 concluída com sucesso!${C.reset}`);
    console.log(`Próximos passos obrigatórios de validação:`);
    console.log(`  1. Valide dependências:  ${C.bold}.\\make.bat doctor${C.reset}`);
    console.log(`  2. Recompile e audite:   ${C.bold}.\\make.bat check${C.reset}`);
    console.log(`  3. Confira o diff:       ${C.bold}git status && git diff --stat${C.reset}`);
    console.log(`  4. Se tudo estiver OK:   ${C.bold}git add . && git commit -m "chore(template): atualiza infra para v${upstreamVersion}"${C.reset}`);
    console.log(`  5. Para desfazer 100%:   ${C.bold}.\\make.bat update --rollback${C.reset}\n`);
  } else if (totalPendingActions > 0) {
    console.log(`\n${C.bold}Como aplicar esta atualização com segurança:${C.reset}`);
    console.log(`  1. Salve suas alterações locais: ${C.bold}git add . && git commit -m "chore: backup pre-update"${C.reset}`);
    console.log(`  2. Aplique em branch isolada:    ${C.bold}.\\make.bat update --sync-infra --branch${C.reset}`);
    console.log(`     ${C.gray}(Ou direto na branch atual com .\\make.bat update --sync-infra; adicione --skip-config para manter src/config.tex)${C.reset}\n`);
  } else {
    console.log('');
  }
}

main();

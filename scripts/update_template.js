#!/usr/bin/env node

/**
 * Script de Verificação e Atualização do Template TCC IFS (LaTeX)
 * 
 * Verifica se o repositório local possui a versão mais recente do template oficial
 * e permite sincronizar melhorias (scripts, linter, portal web, workflows) sem
 * alterar o conteúdo autoral do trabalho do aluno.
 * 
 * Uso:
 *   node scripts/update_template.js           # Apenas verifica novidades
 *   node scripts/update_template.js --merge   # Aplica o merge do upstream automaticamente
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const OFFICIAL_REPO = 'https://github.com/JGustavoCN/template-tcc-ifs-latex.git';

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

function runCommand(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], ...options }).trim();
  } catch (error) {
    if (options.ignoreError) return null;
    throw error;
  }
}

function main() {
  console.log(`\n${colors.cyan}${colors.bold}======================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold} 🔄 Sincronizador de Atualizações do Template IFS${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}======================================================${colors.reset}\n`);

  // 1. Verifica se o git está instalado
  const gitVersion = runCommand('git --version', { ignoreError: true });
  if (!gitVersion) {
    console.error(`${colors.red}[ERRO] Git não encontrado no sistema.${colors.reset}`);
    console.error(`Instale o Git (https://git-scm.com/) para poder verificar ou atualizar o template automaticamente.\n`);
    process.exit(1);
  }

  // 2. Verifica se é um repositório git
  const isGitRepo = runCommand('git rev-parse --is-inside-work-tree', { ignoreError: true });
  if (!isGitRepo) {
    console.error(`${colors.red}[ERRO] Este diretório não é um repositório Git.${colors.reset}`);
    console.error(`Se você baixou este projeto em arquivo .ZIP, consulte a seção "Atualização Manual via ZIP" no README.md.\n`);
    process.exit(1);
  }

  // 3. Verifica se há arquivos modificados não salvos
  const statusOutput = runCommand('git status --porcelain', { ignoreError: true });
  const hasUnsavedChanges = statusOutput && statusOutput.length > 0;
  if (hasUnsavedChanges) {
    console.log(`${colors.yellow}[AVISO] Você possui alterações locais pendentes de commit.${colors.reset}`);
    console.log(`${colors.gray}Recomendamos salvar seu progresso antes de sincronizar o template:${colors.reset}`);
    console.log(`  git add .`);
    console.log(`  git commit -m "chore: salva alterações antes de atualizar template"\n`);
  }

  // 4. Verifica ou configura o remote 'upstream'
  const remotes = runCommand('git remote -v', { ignoreError: true }) || '';
  const hasUpstream = /upstream\s+.*\(fetch\)/.test(remotes);

  if (!hasUpstream) {
    console.log(`${colors.blue}[+] Configurando conexão com o repositório oficial (upstream)...${colors.reset}`);
    try {
      runCommand(`git remote add upstream ${OFFICIAL_REPO}`);
      console.log(`${colors.green}    Conectado com sucesso a:${colors.reset} ${OFFICIAL_REPO}\n`);
    } catch (err) {
      console.error(`${colors.red}[ERRO] Falha ao adicionar remote 'upstream': ${err.message}${colors.reset}\n`);
      process.exit(1);
    }
  } else {
    console.log(`${colors.gray}[i] Repositório oficial (upstream) já configurado.${colors.reset}`);
  }

  // 5. Busca as últimas atualizações do upstream
  console.log(`${colors.blue}[+] Buscando novidades no repositório oficial...${colors.reset}`);
  try {
    runCommand('git fetch upstream');
    console.log(`${colors.green}    Busca concluída!${colors.reset}\n`);
  } catch (err) {
    console.error(`${colors.red}[ERRO] Falha ao buscar atualizações do upstream.${colors.reset}`);
    console.error(`Verifique sua conexão com a internet ou acesso ao repositório.\n`);
    process.exit(1);
  }

  // 6. Compara commits
  const currentBranch = runCommand('git rev-parse --abbrev-ref HEAD', { ignoreError: true }) || 'main';
  const newCommitsCountStr = runCommand('git rev-list --count HEAD..upstream/main', { ignoreError: true });
  const newCommitsCount = parseInt(newCommitsCountStr || '0', 10);

  if (isNaN(newCommitsCount) || newCommitsCount === 0) {
    console.log(`${colors.green}${colors.bold}✨ Excelente! O seu projeto já possui a versão mais recente do template oficial.${colors.reset}\n`);
    console.log(`Você está em dia com todas as normas ABNT, scripts e melhorias do IFS.\n`);
    process.exit(0);
  }

  // 7. Exibe commits pendentes
  console.log(`${colors.yellow}${colors.bold}📢 Existem ${newCommitsCount} melhoria(s) disponíveis no repositório oficial:${colors.reset}\n`);
  const logList = runCommand('git log -n 5 --oneline HEAD..upstream/main', { ignoreError: true });
  if (logList) {
    console.log(logList.split('\n').map(line => `  ${colors.cyan}*${colors.reset} ${line}`).join('\n'));
    if (newCommitsCount > 5) {
      console.log(`  ${colors.gray}... e mais ${newCommitsCount - 5} alteração(ões).${colors.reset}`);
    }
    console.log();
  }

  // 8. Aplica ou instrui o merge
  const shouldMerge = process.argv.includes('--merge') || process.argv.includes('-m');

  if (shouldMerge) {
    if (hasUnsavedChanges) {
      console.error(`${colors.red}[ERRO] Não é seguro mesclar automaticamente com alterações pendentes.${colors.reset}`);
      console.error(`Faça um commit das suas alterações primeiro e tente novamente.\n`);
      process.exit(1);
    }

    console.log(`${colors.blue}[+] Mesclando as melhorias oficiais na sua branch (${currentBranch})...${colors.reset}`);
    try {
      const mergeOutput = runCommand('git merge upstream/main -m "Merge: atualizações oficiais do template IFS"');
      console.log(`\n${colors.green}${colors.bold}🎉 Template atualizado com sucesso!${colors.reset}`);
      console.log(`${colors.gray}${mergeOutput}${colors.reset}\n`);
      console.log(`Próximos passos recomendados:`);
      console.log(`  1. Execute a auditoria:  ${colors.bold}.\\make.bat check${colors.reset} (ou make check)`);
      console.log(`  2. Teste a compilação:   ${colors.bold}.\\make.bat build${colors.reset} (ou make build)`);
      console.log(`  3. Envie para o GitHub:  ${colors.bold}git push origin ${currentBranch}${colors.reset}\n`);
    } catch (mergeErr) {
      console.log(`\n${colors.yellow}${colors.bold}[ATENÇÃO] Ocorreram pequenos conflitos no merge.${colors.reset}`);
      console.log(`Isso acontece quando arquivos locais foram personalizados (ex: título e autor em src/main.tex).\n`);
      console.log(`${colors.cyan}Como resolver em 1 minuto:${colors.reset}`);
      console.log(`  1. Abra o arquivo ${colors.bold}src/metadados.tex${colors.reset} recém-criado e preencha com seu título e autor.`);
      console.log(`  2. No ${colors.bold}src/main.tex${colors.reset}, aceite a mudança do template mantendo:`);
      console.log(`     ${colors.gray}\\IfFileExists{metadados.tex}{\\input{metadados}}{}${colors.reset}`);
      console.log(`  3. Salve e conclua no terminal com:`);
      console.log(`     ${colors.bold}git add . && git commit -m "Merge: atualiza template e migra metadados"${colors.reset}\n`);
    }
  } else {
    console.log(`${colors.bold}Como aplicar as melhorias com segurança:${colors.reset}`);
    console.log(`  ${colors.cyan}Opção A (Automática):${colors.reset} Execute: ${colors.bold}.\\make.bat update --merge${colors.reset} (ou make update ARGS="--merge")`);
    console.log(`  ${colors.cyan}Opção B (Manual no Git):${colors.reset} Execute: ${colors.bold}git merge upstream/main${colors.reset}\n`);
    console.log(`${colors.gray}Dica: Seus capítulos (src/capitulos/) e dados pessoais (src/metadados.tex) são preservados.${colors.reset}\n`);
  }
}

main();

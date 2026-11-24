---
name: Atualizador Seguro do Template (Template Updater)
description: Fluxo seguro para verificar novas versões do template oficial, fazer bootstrap em projetos antigos, simular (--dry-run), atualizar infraestrutura (--sync-infra) sem tocar no texto autoral e validar via doctor/check/preview.
---

# Atualizador Seguro do Template TCC IFS (`template_updater`)

## Objective

Permitir que o agente de IA verifique se existe uma nova versão do repositório oficial **[template-tcc-ifs-latex](https://github.com/JGustavoCN/template-tcc-ifs-latex)** e atualize com segurança projetos novos ou antigos (inclusive com histórico Git independente, pastas próprias como `docs/guias/`, `docs/pdfs/`, `resources/`, `cache/` e capítulos personalizados) **sem jamais sobrescrever ou apagar conteúdo autoral do aluno**.

Referência visual completa com fluxograma Mermaid: [`docs/GUIA_ATUALIZACAO_TEMPLATE.md`](../../../docs/GUIA_ATUALIZACAO_TEMPLATE.md).

---

## Workflow Obrigatório (Siga na Ordem Exata)

### Passo 0 — Verificação de Bootstrap (Projetos Antigos < v2.5.0)
Antes de qualquer coisa, verifique se `scripts/update_template.js` local já suporta `--sync-infra`:
1. Execute `node scripts/update_template.js --help` (ou inspecione se o arquivo contém `--sync-infra`).
2. **Se NÃO suportar `--sync-infra` (versão antiga do template):**
   - Verifique `git status --porcelain`. Se houver alterações locais não commitadas, **PARE** e peça ao usuário para salvar um commit primeiro.
   - Baixe **exclusivamente** o novo `scripts/update_template.js` (sem tocar em nenhum outro arquivo):
     - Via Git: `git fetch upstream main` (configurando `upstream` se necessário) e `git checkout upstream/main -- scripts/update_template.js`.
     - Ou via download raw oficial se não houver `upstream`.
   - Informe ao usuário que o atualizador foi atualizado para a v2 e prossiga para o Passo 1.

### Passo 1 — Diagnóstico de Ambiente e Simulação (`doctor` + `--dry-run`)
1. Verifique o working tree (`git status --porcelain`). Se estiver sujo, avise o usuário que é obrigatório fazer commit antes de aplicar qualquer mudança.
2. Se `scripts/doctor.js` já existir, execute `node scripts/doctor.js --json` para diagnosticar dependências.
3. Execute a simulação read-only:
   ```bash
   node scripts/update_template.js --dry-run --json
   ```
4. Apresente ao usuário um resumo claro dividido nas **3 Zonas**:
   - **Versão local $\to$ Versão oficial** e tipo de histórico Git (compartilhado ou independente).
   - **🟢 Zona 1 (Infraestrutura):** quantos e quais arquivos serão atualizados/criados + novas entradas no `.gitignore`.
   - **🟡 Zona 2 (Assistida):** pendências opcionais detectadas em `src/main.tex` e `src/metadados.tex` (nunca aplicadas automaticamente).
   - **🔴 Zona 3 (Sagrada):** confirme explicitamente quais pastas/arquivos autorais foram detectados e permanecerão 100% intocados (`src/capitulos/`, `src/figuras/`, `src/referencias.bib`, `docs/guias/`, `docs/pdfs/`, `resources/`, `cache/`).
5. **Pergunte ao usuário antes de aplicar:**
   - Deseja aplicar a atualização completa (`--sync-infra`) ou preservar `src/config.tex` (`--sync-infra --skip-config`, recomendado se o TCC estiver às vésperas da banca)?

### Passo 2 — Execução Segura com Branch Isolada, Tag de Backup e Validação Integrada
Somente após aprovação explícita do usuário:
1. Confirme que o working tree está limpo (ou apenas com arquivos legítimos de bootstrap: `scripts/update_template.js`, `.agents/skills/template_updater/SKILL.md`, `docs/GUIA_ATUALIZACAO_TEMPLATE.md`).
2. Recomende aplicar em **branch isolada (`--branch`)** já com verificação pós-update (`--verify`) — ou `--auto --json` se o usuário autorizou o fluxo completo direto (incluindo self-update e backup automático):
   ```bash
   node scripts/update_template.js --sync-infra --branch --verify --json
   # ou, se o usuário pediu para manter config.tex intacto:
   node scripts/update_template.js --sync-infra --branch --skip-config --verify --json
   # ou modo direto 1 comando (após aprovação explícita do usuário):
   node scripts/update_template.js --auto --json
   ```
3. Registre e informe ao usuário a tag de backup (`backup/pre-update-YYYYMMDD-HHMMSS`), a branch criada, a prova de integridade da Zona 3 (`sacredIntact: true`) e o resultado de `doctor` e `check`, lembrando que `node scripts/update_template.js --rollback` reverte 100% (restaura modificados, remove apenas os arquivos novos do update/bootstrap e retorna à branch original).

### Passo 3 — Migração Assistida da Zona 2 (Somente se o usuário quiser)
- Nunca edite `src/main.tex`, `src/metadados.tex`, `AGENTS.md` ou `README.md` sem aprovação explícita.
- Se o usuário quiser ativar novos recursos opcionais (ex.: `\imprimirfolhadeaprovacao`, `\listofquadros*`, `\inserirfichacatalografica`, variáveis de banca em `src/metadados.tex`), mostre exatamente o bloco a adicionar (usando `.agents/skills/change_review/SKILL.md`) antes de editar.

### Passo 4 — Validação Obrigatória Pós-Atualização
1. Rode `.\make.bat doctor` (ou `make doctor`) para confirmar todas as dependências.
2. Rode `.\make.bat check --json` (ou `make check --json`) para recompilar o PDF e auditar build, flutuadores e geometria (principalmente se `src/config.tex` foi atualizado com `\brokenpenalty=10000` e barreira de `\subsection`).
3. Se o `check` apontar alertas em páginas específicas, rode `.\make.bat preview --issues` e inspecione visualmente.
4. Entregue sempre um **Relatório Final de Validação** contendo:
   - **Branches e Backup:** branch original (confirmando via `git log -1` que permaneceu 100% intacta), nome da branch isolada criada e tag `backup/pre-update-*`;
   - **Prova da Zona 3:** confirmação via `git status`/`git diff --name-only` de que nenhum arquivo autoral foi alterado;
   - **Saúde e Riscos:** resultado de `doctor` e `check` (páginas, erros, avisos, Overfull, Float Drift, geometria) + avaliação de impacto de `src/config.tex`;
   - **Próximo passo recomendado:** commitar/mesclar a branch, reaplicar com `--skip-config` ou desfazer 100% com `node scripts/update_template.js --rollback`.

---

## Boundaries

- ✅ **Always:** Execute `--dry-run --json` e aguarde aprovação antes de rodar `--sync-infra`.
- ✅ **Always:** Exija working tree limpo para que a tag `backup/pre-update-*` capture 100% do estado prévio do TCC.
- 🚫 **Never:** Nunca rode `git merge upstream/main --allow-unrelated-histories` nem `git reset --hard` fora do `--rollback` autorizado.
- 🚫 **Never:** Nunca sobrescreva ou delete arquivos da Zona 3 (`src/capitulos/`, `src/figuras/`, `src/referencias.bib`, `src/pre-textuais.tex`, `docs/pdfs/`, `docs/guias/`, `resources/`, `cache/`).

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

### Passo 2 — Execução Segura com Branch Isolada, Tag de Backup e Comparativo Real
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
   *(Observação: quando `src/config.tex` está na lista de atualização, `--verify` e `--auto` garantem automaticamente a existência de `.aux`/`.log` pré-update — compilando o estado antigo antes se necessário — e já retornam o bloco `verification.configImpactComparison` comparando paginação e flutuadores Antes vs. Depois.)*

### Passo 3 — Migração Assistida da Zona 2 (Somente se o usuário quiser)
- Nunca edite `src/main.tex`, `src/metadados.tex`, `AGENTS.md` ou `README.md` sem aprovação explícita.
- Se o usuário quiser ativar novos recursos opcionais (ex.: `\imprimirfolhadeaprovacao`, `\listofquadros*`, `\inserirfichacatalografica`, variáveis de banca em `src/metadados.tex`), mostre exatamente o bloco a adicionar (usando `.agents/skills/change_review/SKILL.md`) antes de editar.

### Passo 4 — Checklist Obrigatório de Certeza Pós-Atualização e Relatório Final
Antes de declarar sucesso, confirme todos estes itens no JSON retornado ou via comandos locais:
1. **Geração real dos artefatos de compilação:** verifique que `src/build/main.pdf`, `src/build/main.aux` e `src/build/main.log` foram gerados após a atualização (`buildDiagnostics.hasBuildFiles: true`, `buildConverged: true`, `layoutAudit.hasAux: true`). Se o PDF ainda estiver desatualizado ou sem `.aux`, execute `.\make.bat build` (ou `make build`) e `.\make.bat check --json` novamente.
2. **Prova de integridade da Zona 3 e Zona 2:** verifique `sacredIntact: true` e confirme via `git diff --name-status backup/pre-update-*` que nenhum arquivo em `src/capitulos/`, `src/figuras/`, `src/referencias.bib`, `src/main.tex`, `src/metadados.tex`, `src/pre-textuais.tex`, `docs/guias/`, `docs/pdfs/`, `resources/` ou `cache/` foi alterado.
3. **Resíduos e órfãos:** verifique se há `saveErrorFiles` (`*-SAVE-ERROR`) — limpe com `.\make.bat clean` — e alerte (sem apagar sozinho) se existirem scripts/PDFs legados órfãos em `scripts/` (ex.: `scripts/verify_abnt.js`, `scripts/main.pdf`).
4. **Comparativo de `src/config.tex` (`configImpactComparison`):** compare páginas (`before.pages` vs. `after.pages`), deslocamento dos flutuadores (`floatsShifted`), `Underfull \vbox`, `Overfull \hbox`, `floatDrifts` e `hyphenatedPageBreaks`. Se houver alerta visual, rode `.\make.bat preview --issues`.
5. **Entregue o Relatório Final de Validação** contendo:
   - **Branches e Backup (sem apagar nenhuma branch sem pedido explícito):** estado da branch original, nome da branch isolada criada, tag `backup/pre-update-*` e **qual branch o usuário deve manter ativa para continuar escrevendo o TCC** após aprovar/integrar;
   - **Prova da Zona 3** (`git status`/`git diff`);
   - **Saúde e Comparativo (`doctor` + `check` + `configImpactComparison`)** confirmando `.aux`/`.log` gerados e zero regressões;
   - **Decisão recomendada:** commitar e integrar na branch de trabalho, reaplicar com `--skip-config` ou desfazer 100% com `node scripts/update_template.js --rollback`.

---

## Boundaries

- ✅ **Always:** Execute `--dry-run --json` e aguarde aprovação antes de rodar `--sync-infra`.
- ✅ **Always:** Exija working tree limpo para que a tag `backup/pre-update-*` capture 100% do estado prévio do TCC.
- 🚫 **Never:** Nunca rode `git merge upstream/main --allow-unrelated-histories` nem `git reset --hard` fora do `--rollback` autorizado.
- 🚫 **Never:** Nunca sobrescreva ou delete arquivos da Zona 3 (`src/capitulos/`, `src/figuras/`, `src/referencias.bib`, `src/pre-textuais.tex`, `docs/pdfs/`, `docs/guias/`, `resources/`, `cache/`).

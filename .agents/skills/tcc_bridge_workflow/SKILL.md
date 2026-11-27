---
name: O Fluxo Supremo de Edição e Deploy (TCC-Bridge)
description: Orquestração ponta a ponta (v2.2.0) entre revisões do orientador no Google Docs, repositório LaTeX local, espelhamento ABNT no Docs, Google Drive e GitHub (CI/CD), combinando sync_gdocs_to_latex e sync_latex_to_gdocs.
---

# O Fluxo Supremo de Edição e Deploy (TCC-Bridge v2.2.0)

## Objective

Orquestrar o ciclo completo de revisão e publicação quando o servidor MCP `mcp-gdocs` (`mcp-gdocs-latex` v2.2.0) estiver conectado: coletar feedbacks no Google Docs (`sync_gdocs_to_latex`), aplicar alterações aprovadas no LaTeX local, auditar compilação/geometria via `make check` + `make preview`, espelhar no Google Docs (`sync_latex_to_gdocs`), publicar o PDF no Drive (`health_check`) e fechar no Git.

> **Pré-requisito opcional:** exige que o servidor MCP `mcp-gdocs` (v2.2.0) esteja conectado. Caso contrário, consulte `.agents/skills/mcp_gdocs_guide/SKILL.md` ou opere em modo 100% local.

---

## Step-by-Step Workflow

1. **Coleta & Triagem (Google Docs → LaTeX):**
   - Siga `.agents/skills/sync_gdocs_to_latex/SKILL.md` (etapas 1 a 3):
     - `list_drive_files` + `manage_doc_comments(action="list", only_unresolved=true)` + `get_latex_structure(tcc_dir="<raiz>")`.
     - Compare também seções apontadas via `compare_latex_with_doc` / `read_doc_content`.
     - Monte a tabela de triagem (com `.agents/skills/change_review/SKILL.md` quando houver mudança semântica) e **aguarde aprovação explícita** antes de editar.

2. **Aplicação Local & Validação do PDF (`make check` ANTES de `make clean`):**
   - Aplique apenas as mudanças aprovadas em `src/capitulos/` e `src/referencias.bib`.
   - Execute `.\make.bat check --json` (ou `make check --json`), que aciona `latexmk`, verifica flutuadores e audita a geometria real do PDF.
   - Se houver avisos ou alertas visuais, siga `.agents/skills/error_triage/SKILL.md` e use `.\make.bat preview --issues`.
   - Só execute `make clean` (`.\make.bat clean`) após validação limpa e após o deploy do PDF.

3. **Espelhamento ABNT no Google Docs (LaTeX → Google Docs):**
   - Siga `.agents/skills/sync_latex_to_gdocs/SKILL.md`:
     - Use `sync_latex_chapter` (capítulos inteiros com `[PENDENTE:]`) ou `read_doc_content(..., include_indices=true)` + `batch_replace_blocks` (edições em lote com `expected_text`) ou `replace_block_abnt` (unitário).
     - Para tabelas e figuras, insira via `insert_table` e `insert_figure` **de baixo para cima** usando `after_paragraph_snippet` (nunca empilhe no fim da seção se houver texto entre elas) e confira `is_inline: true`.
     - Feche na ordem canônica: `format_bibliography_abnt` → `format_document_abnt` → `sync_front_matter_abnt` → `lint_document_abnt` + `compare_latex_with_doc`.

4. **Deploy Idempotente do PDF no Google Drive:**
   - Siga `.agents/skills/health_check/SKILL.md` (`list_drive_files` + `check_pdf_sync`).
   - Se `OUT_OF_SYNC` e `%%EOF` válido, execute `sync_pdf_to_drive` apontando para `src/build/main.pdf`.

5. **Fechamento de Comentários & Entrega Git:**
   - Somente após confirmação explícita do usuário, responda e/ou encerre comentários autorizados com `manage_doc_comments(action="reply" | "resolve")`.
   - Gere o relatório via `.agents/skills/iteration_report/SKILL.md` e prepare o commit/push para atualizar o GitHub Pages/Releases (nunca faça `git push` com `make check` quebrado).

## Boundaries

- ✅ **Always:** Valide o PDF com `make check` antes de `sync_pdf_to_drive` e informe `expected_text` em toda substituição de bloco.
- 🚫 **Never:** Nunca altere texto autoral ou responda/resolva comentários de conteúdo sem aprovação explícita do autor.
- 🚫 **Never:** Nunca use nomes legados removidos (`list_available_documents`, `get_tcc_latex_structure`, `insert_native_table`, `insert_mermaid_diagram`, `sync_abnt_front_matter_lists`).

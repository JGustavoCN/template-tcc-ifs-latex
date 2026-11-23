---
name: O Fluxo Supremo de Edição e Deploy (TCC-Bridge)
description: Workflow passo a passo (v2.0.0) para sincronização ponta a ponta entre comentários do orientador no Google Docs, repositório LaTeX local, Google Drive e GitHub (CI/CD), quando o servidor opcional mcp-gdocs está conectado.
---

# O Fluxo Supremo de Edição e Deploy (TCC-Bridge v2.0.0)

## Objective

Processar comentários do orientador deixados no Google Docs, propor revisões seguras com preservação da autoria intelectual, aplicar as correções aprovadas no LaTeX local e no Google Docs, validar compilação/geometria via `make check` + `make preview`, sincronizar o PDF no Google Drive (com paridade MD5) e preparar o fechamento no Git.

> **Pré-requisito opcional:** Este workflow exige que o servidor MCP `mcp-gdocs` (`mcp-gdocs-latex` v2.0.0) esteja conectado. Caso não esteja ativo na sessão, consulte `.agents/skills/mcp_gdocs_guide/SKILL.md` para orientar o setup em 3 passos ou opere em modo 100% local.

---

## Step-by-Step Workflow

Siga esta ordem quando o usuário solicitar o processamento de comentários do orientador e sincronização completa:

1. **Descoberta & Mapeamento de Comentários:**
   - Se o ID do documento ainda não for conhecido, execute `list_available_documents` (retorna JSON HATEOAS com `data.docs` e `data.pdfs`).
   - Execute `manage_doc_comments(document_url_or_id, action="list", only_unresolved=true)` para listar os feedbacks pendentes e sua localização (`doc_location`).

2. **Raio-X Estrutural & Leitura Cirúrgica:**
   - Use `compare_latex_with_doc(document_url_or_id, tcc_dir="<raiz do repo>")` (ou `get_doc_skeleton`) para mapear o vínculo exato entre o Google Doc e os capítulos em `src/capitulos/`.
   - Use `read_doc_content(document_url_or_id, section_title="...")` para ler apenas as seções afetadas sem inflar o contexto.

3. **Revisão Visual e Consentimento (Obrigatório para Mudanças Semânticas):**
   - **Nunca** altere a semântica, reescreva parágrafos autorais ou resolva comentários de conteúdo sem aprovação explícita do usuário (ver `.agents/rules/autonomia.md`).
   - Para propostas de reescrita ou resposta a críticas teóricas do orientador, ative `.agents/skills/change_review/SKILL.md` (Antes vs. Depois) e aguarde confirmação antes de editar.

4. **Edição Dupla (LaTeX Local + Espelhamento ABNT no Google Docs):**
   - Aplique as alterações aprovadas nos arquivos em `src/capitulos/` (e em `src/referencias.bib` se houver novas referências).
   - Espelhe no Google Docs **sempre do maior índice para o menor (de baixo para cima)** escolhendo a ferramenta ortogonal correta da v2.0.0:
     - **Texto simples global:** `search_and_replace_text`.
     - **Estilo cirúrgico (negrito/itálico em trecho existente):** `search_in_doc` → `apply_text_style`.
     - **Substituição de bloco/parágrafo ABNT:** `replace_block_abnt` **sempre com `expected_text`** (trava otimista, anti-bleeding e preservação automática de `**negrito**` e `*itálico*`).
     - **Tabelas LaTeX:** `insert_native_table` passando `latex_table` (ou `headers` + `rows`), `caption` e `source` (padrão IBGE/ABNT nativo).
     - **Diagramas Mermaid / Figuras:** `insert_mermaid_diagram` (renderização via `mermaid.ink` ou PNG local com 2D Bounding Box).
     - **Referências / Sumário / Auditoria Docs:** se `.bib` ou títulos mudaram, execute `format_bibliography_abnt`, `sync_abnt_front_matter_lists` e `lint_document_abnt`.

5. **Build, Auditoria Geométrica e Prévia Local (ANTES de limpar!):**
   - Execute `.\make.bat check --json` (ou `make check --json`), que aciona o auto-build com `latexmk`, verifica logs, flutuadores e executa a auditoria geométrica do PDF (`pdftotext` / `PyMuPDF`).
   - Se houver erros ou avisos de layout/geometria, siga `.agents/skills/error_triage/SKILL.md` e inspecione visualmente com `.\make.bat preview --issues` (ou `.\make.bat preview <pag>`).
   - Somente após validação limpa, execute `make clean` (`.\make.bat clean`).

6. **Deploy Idempotente no Google Drive:**
   - Execute `.agents/skills/health_check/SKILL.md` (`list_available_documents` + `check_pdf_sync`).
   - Se o status for diferente de `IN_SYNC`, execute `sync_pdf_to_drive` apontando para `src/build/main.pdf` (validação `%%EOF`, guarda TOCTOU e `keepRevisionForever: true`).

7. **Fechamento de Comentários no Docs (Somente com Aprovação):**
   - Somente após aprovação expressa do usuário sobre a resposta/resolução de cada comentário, acione `manage_doc_comments(action="reply", ...)` e/ou `manage_doc_comments(action="resolve", ...)`.
   - **Regra Anti-Bloqueio:** Se uma mutação retornar bloqueio por comentário, **PARE** e reporte o `comment_id` ao usuário antes de resolver qualquer comentário.

8. **Fechamento e Entrega (Git / CI/CD):**
   - Gere o resumo padronizado via `.agents/skills/iteration_report/SKILL.md`.
   - Sugira (ou execute, se autorizado pelo usuário) `git add`, `git commit` e `git push` para atualizar o GitHub Pages e Releases — nunca faça `git push` com `make check` quebrado.

---

## Diretrizes de Conversão (LaTeX ➡️ Google Docs)

- **Citações (`\cite`, `\textcite`, `\citeonline`):** Converter para o formato ABNT correspondente no texto do Docs (ex.: `(SILVA, 2026)` ou `Silva (2026)`) e sincronizar a lista completa em `REFERÊNCIAS` via `format_bibliography_abnt`.
- **Destaques inline (`\textbf`, `\textit`, `\emph`):** Enviar como `**negrito**`, `*itálico*` ou `***negrito e itálico***` para `replace_block_abnt` (que preserva `WeightedFontFamily.Weight = 700`).
- **Tabelas (`\begin{tabular}`, `tabularx`) e Quadros:** Usar `insert_native_table` diretamente em vez de links provisórios.
- **Diagramas Mermaid (`.mmd`) e Figuras (`.png`):** Usar `insert_mermaid_diagram` diretamente.

## Boundaries

- ✅ **Always:** Valide o PDF com `make check` antes de `make clean` e antes de `sync_pdf_to_drive`.
- ✅ **Always:** Passe `expected_text` em toda chamada a `replace_block_abnt`.
- 🚫 **Never:** Nunca resolva comentários de conteúdo do orientador automaticamente sem permissão do usuário.
- 🚫 **Never:** Nunca faça `git push` ou upload de PDF se a compilação falhar ou o `check_pdf_sync` indicar PDF corrompido (sem `%%EOF`).

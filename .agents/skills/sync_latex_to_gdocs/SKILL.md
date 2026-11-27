---
name: Sincronização LaTeX → Google Docs (ABNT)
description: Fluxo completo para espelhar um projeto LaTeX novo ou atualizado para o Google Docs e Google Drive usando sync_latex_chapter, batch_replace_blocks, posicionamento exato de tabelas/figuras e fechamento ABNT (NBR 14724/6023/6024/6027).
---

# Sincronização LaTeX → Google Docs (ABNT — `mcp-gdocs-latex` v2.2.0)

## Objective

Espelhar fielmente um projeto TCC em LaTeX (`src/`) para o Google Docs e o Google Drive, preservando normas ABNT, evitando vazamento de macros LaTeX (*Zero-Leak Guard*), posicionando tabelas e figuras nos parágrafos exatos de origem e mantendo o PDF sincronizado por hash MD5.

> **Pré-requisito:** exige o servidor MCP `mcp-gdocs` (`mcp-gdocs-latex` v2.2.0) conectado. Se estiver ausente, consulte `.agents/skills/mcp_gdocs_guide/SKILL.md`.

---

## 1. Pré-verificação Obrigatória (Antes de qualquer mutação)

1. Execute `list_drive_files` para confirmar os IDs do Google Doc, do PDF placeholder e do eventual slot `mcp-image-slot.png`.
2. Execute `get_latex_structure(tcc_dir="<raiz do repo>")` para mapear capítulos, `.bib`, siglas, tabelas e figuras.
3. Valide e compile o projeto local com `.\make.bat check --json` (ou `make check --json`) garantindo **0 erros** antes de sincronizar ou subir `src/build/main.pdf`.
4. Escolha o modo:
   - **Modo A (Doc vazio ou reinicialização aprovada pelo usuário):**
     `init_doc_abnt(document_url_or_id, mode="latex_skeleton", tcc_dir="<raiz do repo>", confirm_overwrite=true)` *(somente use `confirm_overwrite=true` após aprovação explícita do usuário!)*.
   - **Modo B (Doc existente — atualização incremental):**
     `compare_latex_with_doc(document_url_or_id, tcc_dir="<raiz do repo>")` para identificar `missing_in_doc`, `extra_in_doc` e `assets_diff`.

---

## 2. Sincronização de Texto em Alta Escala (Evitar Gargalo de Chamadas)

- **Capítulos com placeholders `[PENDENTE: ...]` (Modo A):**
  - Use **`sync_latex_chapter`** (1 chamada por arquivo `.tex`, convertendo texto, `.bib`, `\ref` e `\allowbreak` em paralelo com *Zero-Leak Guard*).
  - Para auditar antes de gravar, rode primeiro com `dry_run=true` e confirme **`total_leaks == 0`**.
- **Múltiplas correções em seções existentes (Modo B):**
  - Leia apenas a seção divergente com **`read_doc_content(document_url_or_id, section_title="...", include_indices=true)`**.
  - Aplique todas as alterações da seção em **1 lote** com **`batch_replace_blocks`** (execução em `BatchUpdate` reverso; **sempre** informe `expected_text` em cada bloco).
- **Edições unitárias isoladas:** reserve `replace_block_abnt(..., expected_text=...)` apenas para correções pontuais únicas.

---

## 3. Regra de Ouro para Posicionamento de Tabelas e Figuras

> [!IMPORTANT]
> **NUNCA** empilhe 2+ tabelas ou figuras cegamente no `section_body_end_index` quando houver texto entre elas no `.tex`!

Use os metadados retornados por `sync_latex_chapter` em `pending_tables` e `pending_figures` (**`paragraph_index_in_section`** e **`after_paragraph_snippet`**):

1. Leia a seção alvo com `read_doc_content(document_url_or_id, section_title="...", include_indices=true)`.
2. Localize o `end_index` exato do parágrafo que termina com `after_paragraph_snippet`.
3. Insira tabelas (`insert_table`) e figuras (`insert_figure`) **de baixo para cima** (maior `end_index` → menor `end_index`) para não invalidar índices superiores:
   - **Tabelas / Quadros:** passe `latex_table` (extraído direto do `.tex`) ou `headers` + `rows`, com `caption` e `source` (`\fonte`).
   - **Diagramas Mermaid (`.mmd`):** passe `mmd_path` ou `mermaid_code` (usa `mermaid.ink` sem gastar cota do Drive).
   - **Imagens PNG/JPG ou gráficos `.pdf` (auto-rasterizados a 300 DPI):** passe `image_path` (usa `mcp-image-slot.png` se disponível, ou fallback paralelo multi-CDN).
   - **Sempre confira `is_inline: true`** no retorno de `insert_figure`.

---

## 4. Ordem Canônica de Fechamento ABNT (Sempre nesta sequência exata)

1. **`format_bibliography_abnt(document_url_or_id, tcc_dir="<raiz>", only_cited=true)`** — injeta/atualiza `REFERÊNCIAS` em ordem alfabética NBR 6023.
2. **`format_document_abnt(document_url_or_id)`** — aplica margens A4 3/3/2/2 cm, títulos NBR 6024, corpo 12pt/1,5, tabelas e legendas/fontes 10pt/1,0 e citações diretas longas 4 cm/10pt/1,0.
3. **`sync_front_matter_abnt(document_url_or_id, tcc_dir="<raiz>")`** — gera/atualiza `LISTA DE FIGURAS`, `LISTA DE TABELAS`, `LISTA DE ABREVIATURAS E SIGLAS` (`\begin{siglas}`) e `SUMÁRIO` NBR 6027 com paginação real NBR 14724.
4. **`lint_document_abnt(document_url_or_id)` + `compare_latex_with_doc(document_url_or_id, tcc_dir="<raiz>")`** — auditoria estrutural e normativa final.
5. **`check_pdf_sync` → `sync_pdf_to_drive`** — publica `src/build/main.pdf` no Drive somente se `OUT_OF_SYNC` (ver `.agents/skills/health_check/SKILL.md`).

---

## 5. Checklist de Qualidade Pós-Sincronização (Gate Final)

Antes de encerrar, confirme todos os critérios abaixo:
- **`compare_latex_with_doc`:** `0` seções faltantes, `0` seções extras, `100%` das tabelas e `100%` das figuras casadas.
- **`format_document_abnt`:** contagem de `Legendas e Fontes` = `2 × (total_tabelas + total_figuras)`.
- **`search_in_doc`:** **`0` ocorrências** de `Tabela Tabela`, `Seção seção`, `Capítulo Capítulo`, `_ ` (espaço após underscore) e `[PENDENTE:`.
- **`check_pdf_sync`:** `status: "IN_SYNC"` com MD5 idêntico ao `src/build/main.pdf` local e integridade `%%EOF` confirmada.

## Boundaries

- ✅ **Always:** Informe `expected_text` em `replace_block_abnt` / `batch_replace_blocks` e `tcc_dir` apontando para a raiz do repositório.
- 🚫 **Never:** Nunca sobrescreva um Doc existente com `confirm_overwrite=true` sem autorização explícita do usuário.
- 🚫 **Never:** Nunca ignore `is_inline: false` em `insert_figure` nem deixe `[PENDENTE:` sem preencher.

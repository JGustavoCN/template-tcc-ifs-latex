---
name: Guia Completo do MCP Google Docs ↔ LaTeX (mcp-gdocs-latex)
description: Guia operacional completo das 20 ferramentas ortogonais do servidor opcional mcp-gdocs-latex (v2.0.0), incluindo setup em 3 passos, inicialização ABNT, diff estrutural LaTeX ↔ Docs, tabelas nativas, diagramas Mermaid, listas NBR 6027 e sincronização de PDF.
---

# Guia do Servidor MCP `mcp-gdocs-latex` (Integração Opcional)

## Objective

Capacitar o agente a orientar a instalação opcional e operar com máxima precisão as **20 ferramentas ortogonais** do servidor **[mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)** (v2.0.0) integrado a este repositório (`template-tcc-ifs-latex`).

---

## 1. Quando o servidor `mcp-gdocs` NÃO está conectado (Guia de Setup em 3 Passos)

Se o usuário quiser usar Google Docs / Google Drive mas o servidor `mcp-gdocs` não aparecer nos servidores MCP ativos da sessão, oriente-o com este passo a passo enxuto:

1. **Baixar o executável nativo** em [github.com/JGustavoCN/mcp-gdocs-latex/releases](https://github.com/JGustavoCN/mcp-gdocs-latex/releases) (binário único em Go, sem precisar de Python ou Node):
   - Windows: `mcp-tcc.exe` | Linux: `mcp-tcc-linux` | macOS: `mcp-tcc-darwin`.
2. **Gerar credenciais (`credentials.json`) no Google Cloud Console:**
   - Ativar **Google Docs API** e **Google Drive API**.
   - Criar uma **Service Account** (*IAM e Admin → Contas de serviço*), baixar a chave JSON e salvá-la como `credentials.json`.
   - Compartilhar o Google Doc e o arquivo PDF placeholder no Google Drive como **Editor** com o `client_email` presente dentro do `credentials.json`.
3. **Registrar no `mcp_config.json` (Antigravity / VS Code / Cursor):**
   ```json
   {
     "mcpServers": {
       "mcp-gdocs": {
         "command": "C:\\caminho\\absoluto\\para\\mcp-tcc.exe",
         "env": {
           "GOOGLE_APPLICATION_CREDENTIALS": "C:\\caminho\\para\\credentials.json",
           "TCC_DIR": "C:\\caminho\\para\\seu-tcc",
           "ALLOWED_DOC_IDS": "ID_OU_URL_OPCIONAL_DO_DOC,ID_OPCIONAL_DO_PDF"
         }
       }
     }
   }
   ```
   > **Compatibilidade automática:** `TCC_DIR` pode apontar diretamente para a raiz deste template — o servidor detecta `src/main.tex`, `src/metadados.tex`, `src/referencias.bib` e `src/logo_ifs.png` automaticamente (também aceita `tcc-config.json` opcional na raiz).

---

## 2. Catálogo Completo das 20 Ferramentas Ortogonais (v2.0.0)

Todas as ferramentas retornam envelope HATEOAS `{ok, tool, summary, data, next_actions}` e aceitam tanto a **URL completa do Google Docs/Drive** quanto o **ID**.

| Categoria | Ferramenta | Finalidade Principal |
| :--- | :--- | :--- |
| **Descoberta & Mapa** | `list_available_documents` | Lista estruturada `data.docs` e `data.pdfs` compartilhados com a Service Account. |
| **Descoberta & Mapa** | `get_doc_skeleton` | Mapa hierárquico enxuto do Doc (`start_index`, `end_index`, `section_body_end_index`, `heading_id`, âncoras canônicas; aceita `include_assets: true`). |
| **Descoberta & Mapa** | `get_tcc_latex_structure` | Varre `src/main.tex` via `\input`/`\include`, extraindo metadados, `.bib`, seções NBR 6024, tabelas e figuras com linhas exatas. |
| **Diff Estrutural** | `compare_latex_with_doc` | Diff em 3 níveis (exato → número ABNT → substring) entre LaTeX local e Google Doc (`missing_in_doc`, `extra_in_doc`, `assets_diff`). |
| **Leitura & Busca** | `read_doc_content` | Lê documento completo, faixa de índices ou `section_title` em Markdown preservando `[PAGE_BREAK]` e tabelas. |
| **Leitura & Busca** | `search_in_doc` | Busca literal ou regex (`is_regex: true`) retornando offsets UTF-16 exatos. |
| **Auditoria & Geometria** | `inspect_doc_layout` | Inspeciona margens A4 em cm/pt, `LineSpacingPercent`, recuos e quebras de seção. |
| **Auditoria & Geometria** | `lint_document_abnt` | Auditor completo NBR 14724/6023/6024/6027 (margens, entrelinhas 1,5/1,0, ordem estrutural, numeração, LaTeX vazado e placeholders `[PENDENTE: ...]`). |
| **Inicialização** | `init_doc_abnt` | Inicializa Capa, Logo, Folha de Rosto e estrutura (`mode: "blank_template"` ou `"latex_skeleton"`). Exige `confirm_overwrite: true` para sobrescrever. |
| **Edição Atômica** | `replace_block_abnt` | Substituição anti-bleeding com guarda otimista `expected_text`, preserva `**negrito**` / `*itálico*` inline e aplica estilo ABNT (`NORMAL_TEXT`, recuo 1,25 cm, entrelinha 1,5). |
| **Edição Pontual** | `apply_text_style` | Aplica negrito/itálico/sublinhado/fonte em intervalos UTF-16 exatos sem recriar parágrafos. |
| **Edição Global** | `search_and_replace_text` | Substituição global simples de termos em todo o documento. |
| **Formatação ABNT** | `format_document_abnt` | Padroniza margens A4 (3/3/2/2 cm), fonte Times/Arial 12pt, tabelas 10pt/1,0 e citações diretas longas (4 cm/10pt/1,0), preservando bold/italic inline. |
| **Pré-Textuais** | `sync_abnt_front_matter_lists` | Gera/atualiza `LISTA DE FIGURAS`, `LISTA DE TABELAS` e `SUMÁRIO` (NBR 6027) com links internos e paginação real NBR 14724 via PDF. |
| **Bibliografia** | `format_bibliography_abnt` | Converte `src/referencias.bib` para ABNT NBR 6023 em ordem alfabética e injeta na seção `REFERÊNCIAS`. |
| **Tabelas Nativas** | `insert_native_table` | Insere tabela nativa IBGE/ABNT via protocolo *Two-Step* + `WriteControl` (aceita `latex_table` direto do `.tex` ou `headers` + `rows`, com `caption` e `source`). |
| **Diagramas/Figuras** | `insert_mermaid_diagram` | Insere diagrama `.mmd` (via `mermaid.ink/img/pako:...`) ou PNG local com enquadramento 2D (`450 × 620 pt`), legenda no topo e fonte no rodapé. |
| **Comentários** | `manage_doc_comments` | Unifica `action: "list"` (`only_unresolved: true`), `"reply"` e `"resolve"` de comentários no Google Drive. |
| **PDF & Integridade** | `check_pdf_sync` | Valida integridade física `%%EOF` (ISO 32000-1), proteção TOCTOU e paridade MD5 entre `src/build/main.pdf` e Drive. |
| **PDF & Integridade** | `sync_pdf_to_drive` | Upload idempotente do PDF para o Drive (suprime envio se `IN_SYNC`, mantém revisão com `keepRevisionForever: true`). |

---

## 3. Fluxos Operacionais Recomendados

### Fluxo A — Criar ou Espelhar um Google Doc Novo a partir deste Template
1. `list_available_documents` → confirmar o `document_id` compartilhado.
2. `get_tcc_latex_structure(tcc_dir="<raiz do repo>")` → validar capítulos, metadados e `.bib`.
3. `init_doc_abnt(document_url_or_id, mode="latex_skeleton", tcc_dir="<raiz do repo>")` (solicitar aprovação do usuário se precisar de `confirm_overwrite: true`).
4. Preencher os placeholders `[PENDENTE: ...]` **sempre do maior índice para o menor (de baixo para cima)** usando `replace_block_abnt` com `expected_text`.
5. Inserir tabelas e diagramas com `insert_native_table` e `insert_mermaid_diagram`.
6. Rodar `format_bibliography_abnt` → `format_document_abnt` → `sync_abnt_front_matter_lists` → `lint_document_abnt`.

### Fluxo B — Sincronização Incremental (LaTeX Atualizado → Google Doc Existente)
1. `compare_latex_with_doc(document_url_or_id, tcc_dir="<raiz do repo>")` → descobrir exatamente `missing_in_doc`, `extra_in_doc` e `assets_diff`.
2. Usar `read_doc_content(section_title="...")` apenas nas seções divergentes (economiza contexto).
3. Aplicar atualizações cirúrgicas com `replace_block_abnt` (com `expected_text`), `insert_native_table` ou `insert_mermaid_diagram` **de baixo para cima** (maior offset → menor offset).
4. Fechar com `format_bibliography_abnt` (se `.bib` mudou) → `sync_abnt_front_matter_lists` → `lint_document_abnt`.

### Fluxo C — Auditoria e Fechamento ABNT no Google Docs
1. `lint_document_abnt` e `inspect_doc_layout` para diagnosticar desvios de margens, entrelinhas, numeração NBR 6024 ou placeholders pendentes.
2. Corrigir em lote com `format_document_abnt` e regenerar listas/sumário com `sync_abnt_front_matter_lists`.
3. Reexecutar `lint_document_abnt` até zerar pendências críticas.

---

## 4. Mapa de Migração (Evite Ferramentas Legadas da v1)

| Nome Legado (REMOVIDO — não usar) | Substituto Oficial (v2.0.0) |
| :--- | :--- |
| `list_doc_comments` | `manage_doc_comments(action="list", only_unresolved=true)` |
| `reply_to_comment` | `manage_doc_comments(action="reply", comment_id=..., reply_content=...)` |
| `resolve_comment` | `manage_doc_comments(action="resolve", comment_id=...)` |
| `update_block_by_index` | `replace_block_abnt(..., expected_text=...)` |
| `apply_abnt_page_margins` | `format_document_abnt` (ou `init_doc_abnt`) |
| Deep Link manual para tabela/figura | `insert_native_table` e `insert_mermaid_diagram` |

---
name: Guia Completo do MCP Google Docs ↔ LaTeX (mcp-gdocs-latex)
description: Setup em 3 passos (incluindo slot rápido mcp-image-slot.png), catálogo oficial das 22 ferramentas ortogonais (v2.2), envelope HATEOAS, regras de segurança e mapa de migração de nomes antigos.
---

# Guia Completo do Servidor MCP `mcp-gdocs-latex` (v2.2.0)

## Objective

Capacitar o agente a orientar a instalação opcional (inclusive o canal rápido `mcp-image-slot.png`) e operar com máxima precisão as **22 ferramentas ortogonais** do servidor **[mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)** (v2.2.0) integrado a este repositório (`template-tcc-ifs-latex`).

> **Roteamento de fluxos:**
> - Enviar LaTeX → Google Docs/Drive: leia `.agents/skills/sync_latex_to_gdocs/SKILL.md`.
> - Trazer comentários/revisões do Google Docs → LaTeX local: leia `.agents/skills/sync_gdocs_to_latex/SKILL.md`.

---

## 1. Quando o servidor `mcp-gdocs` NÃO está conectado (Setup em 3 Passos)

Se o usuário quiser usar Google Docs / Google Drive mas o servidor `mcp-gdocs` não aparecer ativo na sessão, oriente-o com este passo a passo:

1. **Baixar o executável Go** em [github.com/JGustavoCN/mcp-gdocs-latex/releases](https://github.com/JGustavoCN/mcp-gdocs-latex/releases) (binário nativo único, zero dependências):
   - Windows: `mcp-tcc.exe` | Linux: `mcp-tcc-linux` | macOS: `mcp-tcc-darwin`.
2. **Gerar `credentials.json` no Google Cloud Console:**
   - Ativar **Google Docs API** e **Google Drive API**.
   - Criar uma **Service Account** (*IAM e Admin → Contas de serviço*), baixar a chave JSON e salvá-la como `credentials.json`.
   - Compartilhar no Google Drive o **Google Doc** do TCC e um arquivo **PDF placeholder** como **Editor** com o `client_email` presente no `credentials.json`.
3. **Configurar o `mcp_config.json` (Antigravity / VS Code / Cursor):**
   ```json
   {
     "mcpServers": {
       "mcp-gdocs": {
         "command": "C:\\caminho\\absoluto\\para\\mcp-tcc.exe",
         "env": {
           "GOOGLE_APPLICATION_CREDENTIALS": "C:\\caminho\\para\\credentials.json",
           "TCC_DIR": "C:\\caminho\\para\\seu-tcc",
           "ALLOWED_DOC_IDS": "ID_OU_URL_OPCIONAL_DO_DOC,ID_OPCIONAL_DO_PDF",
           "IMAGE_SLOT_FILE_ID": "ID_OPCIONAL_DO_MCP_IMAGE_SLOT_PNG"
         }
       }
     }
   }
   ```
   > **Autodescoberta de `src/`:** `TCC_DIR` deve apontar diretamente para a **raiz deste template** — a v2.2.0 detecta e promove `src/main.tex`, `src/metadados.tex`, `src/referencias.bib` e `src/logo_ifs.png` automaticamente.

---

## 2. Passo Opcional (30s) — Canal Rápido de Figuras (`mcp-image-slot.png` / Opção A)

Por padrão, Service Accounts não possuem cota própria para criar novos arquivos no Google Drive do usuário. Para inserir figuras PNG/JPG e gráficos `.pdf` (auto-rasterizados a 300 DPI) **100% dentro do ecossistema Google em ~3 segundos por figura**, sem OAuth 2.0 nem servidores temporários externos:

1. Faça upload de 1 arquivo PNG pequeno qualquer no seu Google Drive com o nome exato **`mcp-image-slot.png`**.
2. Compartilhe esse arquivo:
   - Como **Editor** com o `client_email` do seu `credentials.json`; e
   - Como **Leitor para qualquer pessoa com o link** (*"Anyone with the link → Viewer"*).
3. *(Opcional)* Informe o ID desse arquivo na variável de ambiente `IMAGE_SLOT_FILE_ID` do `mcp_config.json` (se omitir, o servidor descobre o arquivo pelo nome quando listado no Drive).
4. **Como funciona:** `insert_figure` sobrescreve esse slot via `Files.Update` usando a cota do próprio dono do arquivo, lê a imagem direto pelo Google Docs e já retorna `is_inline: true`.
5. **Fallback automático (caso o slot não exista):** o servidor usa upload concorrente via hosts temporários (`litterbox_1h` / `uguu_3h` / `tmpfiles_1h` / `catbox_cdn`) para imagens locais, e `mermaid.ink` diretamente para diagramas `.mmd`.

---

## 3. Catálogo Oficial das 22 Ferramentas Ortogonais (v2.2.0)

Todas as ferramentas retornam envelope HATEOAS `{ok, tool, summary, data, next_actions}` e aceitam tanto a **URL completa** quanto o **ID**.

| Categoria | Ferramenta | Finalidade Principal |
| :--- | :--- | :--- |
| **Descoberta & Estrutura** | `list_drive_files` | Lista `data.docs` e `data.pdfs` (e slot de imagem) acessíveis pela Service Account no Drive. |
| **Descoberta & Estrutura** | `get_doc_skeleton` | Mapa hierárquico enxuto do Doc (`start_index`, `end_index`, `section_body_end_index`, `heading_id`, âncoras canônicas; aceita `include_assets: true`). |
| **Descoberta & Estrutura** | `get_latex_structure` | Varre `src/main.tex` via `\input`/`\include`, extraindo metadados, `.bib`, seções NBR 6024, tabelas e figuras com linhas exatas. |
| **Descoberta & Estrutura** | `compare_latex_with_doc` | Diff estrutural em 3 níveis entre LaTeX local e Google Doc (`missing_in_doc`, `extra_in_doc`, `assets_diff`). |
| **Leitura, Busca & Auditoria** | `read_doc_content` | Lê o Doc completo, faixa de índices ou `section_title` em Markdown preservando `[PAGE_BREAK]`, tabelas e índices UTF-16 (`include_indices: true`). |
| **Leitura, Busca & Auditoria** | `search_in_doc` | Busca literal ou regex (`is_regex: true`) retornando offsets UTF-16 exatos. |
| **Leitura, Busca & Auditoria** | `inspect_doc_layout` | Inspeciona margens A4 em cm/pt, `LineSpacingPercent`, recuos e quebras de seção. |
| **Leitura, Busca & Auditoria** | `lint_document_abnt` | Auditor completo NBR 14724/6023/6024/6027 (margens, entrelinhas, numeração, LaTeX vazado e placeholders `[PENDENTE: ...]`). |
| **Inicialização & Escrita** | `init_doc_abnt` | Inicializa Capa, Logo, Folha de Rosto e estrutura (`mode: "blank_template"` ou `"latex_skeleton"`). Exige `confirm_overwrite: true` para sobrescrever. |
| **Inicialização & Escrita** | `replace_block_abnt` | Substituição atômica unitária anti-bleeding com `expected_text`, preserva `**negrito**`/`*itálico*` inline e aplica estilo ABNT. |
| **Inicialização & Escrita** | `batch_replace_blocks` | Executa **N substituições em 1 único `BatchUpdate` reverso** (cada item exige `expected_text`), ideal para múltiplas edições sem invalidar offsets. |
| **Inicialização & Escrita** | `sync_latex_chapter` | Converte capítulo `.tex` inteiro + `.bib` + `\ref` + `\allowbreak` com **Zero-Leak Guard** em paralelo, retornando `pending_tables` e `pending_figures` com `paragraph_index_in_section` e `after_paragraph_snippet`. |
| **Formatação & Pré-Textuais** | `format_document_abnt` | Aplica margens A4 (3/3/2/2 cm), títulos NBR 6024, corpo 12pt/1,5, tabelas e legendas/fontes 10pt/1,0, citações >3 linhas 4cm/10pt/1,0. |
| **Formatação & Pré-Textuais** | `sync_front_matter_abnt` | Gera/atualiza `LISTA DE FIGURAS`, `LISTA DE TABELAS`, `LISTA DE ABREVIATURAS E SIGLAS` (`\begin{siglas}`) e `SUMÁRIO` (NBR 6027) com paginação real NBR 14724. |
| **Formatação & Pré-Textuais** | `format_bibliography_abnt` | Converte `src/referencias.bib` para ABNT NBR 6023 em ordem alfabética (suporta `only_cited=true`) e injeta em `REFERÊNCIAS`. |
| **Visuais & Edição Pontual** | `insert_table` | Insere tabela nativa IBGE/ABNT via *Two-Step* + `WriteControl` (aceita `latex_table` direto do `.tex` ou `headers` + `rows`, com `caption` e `source`). |
| **Visuais & Edição Pontual** | `insert_figure` | Insere diagrama `.mmd` (`mmd_path`/`mermaid_code` via `mermaid.ink`) ou imagem/gráfico PNG/JPG/PDF (`image_path`, usando `mcp-image-slot.png` ou fallback multi-CDN) com `caption` e `source`. |
| **Visuais & Edição Pontual** | `apply_text_style` | Aplica negrito/itálico/sublinhado/fonte em intervalos UTF-16 exatos sem recriar parágrafos. |
| **Visuais & Edição Pontual** | `search_and_replace_text` | Substituição global simples de termos em todo o documento. |
| **Revisão & PDF no Drive** | `manage_doc_comments` | Unifica `action: "list"` (`only_unresolved: true`), `"reply"` e `"resolve"` no Google Docs/Drive. |
| **Revisão & PDF no Drive** | `check_pdf_sync` | Valida integridade física `%%EOF` (ISO 32000-1), guarda TOCTOU e paridade MD5 entre `src/build/main.pdf` e Drive. |
| **Revisão & PDF no Drive** | `sync_pdf_to_drive` | Upload idempotente do PDF para o Drive (suprime envio se `IN_SYNC`, mantém revisão com `keepRevisionForever: true`). |

---

## 4. Mapa de Migração (Nomes Antigos PROIBIDOS → v2.2.0)

| Nome Legado (REMOVIDO — nunca invocar) | Substituto Oficial (v2.2.0) |
| :--- | :--- |
| `list_available_documents` | `list_drive_files` |
| `get_tcc_latex_structure` | `get_latex_structure` |
| `insert_native_table` | `insert_table` |
| `insert_mermaid_diagram` | `insert_figure` |
| `sync_abnt_front_matter_lists` | `sync_front_matter_abnt` |
| `list_doc_comments` / `reply_to_comment` / `resolve_comment` | `manage_doc_comments(action="list" \| "reply" \| "resolve", ...)` |
| `update_block_by_index` | `replace_block_abnt` ou `batch_replace_blocks` (sempre com `expected_text`) |
| `apply_abnt_page_margins` | `format_document_abnt` (ou `init_doc_abnt`) |
| Múltiplas chamadas manuais `replace_block_abnt` num capítulo inteiro | `sync_latex_chapter` (capítulo com `[PENDENTE:]`) ou `batch_replace_blocks` |

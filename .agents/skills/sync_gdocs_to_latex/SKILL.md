---
name: Sincronização Google Docs → LaTeX (Revisões e Comentários)
description: Fluxo seguro para coletar comentários e edições diretas do orientador no Google Docs, mapear para os arquivos .tex/.bib locais, propor alterações para aprovação do autor, validar o build LaTeX e encerrar os comentários no Docs.
---

# Sincronização Google Docs → LaTeX (Revisões e Comentários — v2.2.0)

## Objective

Coletar comentários e eventuais edições diretas feitas pelo orientador no Google Docs, localizar exatamente os trechos correspondentes em `src/capitulos/` ou `src/referencias.bib`, submeter um plano claro à aprovação explícita do autor, validar a compilação LaTeX e somente então espelhar de volta e encerrar comentários no Docs.

> **Pré-requisito:** exige o servidor MCP `mcp-gdocs` (`mcp-gdocs-latex` v2.2.0) conectado. Se estiver ausente, consulte `.agents/skills/mcp_gdocs_guide/SKILL.md`.

---

## 1. Regra de Ouro (Fonte da Verdade + Autonomia)

- O repositório **LaTeX local (`src/`)** é a **fonte única da verdade** do TCC.
- **Nenhuma alteração** em `.tex`/`.bib` ou no Google Docs e **nenhuma resposta/resolução** de comentário (`manage_doc_comments`) pode ser executada sem **aprovação explícita** do autor (ver `.agents/rules/autonomia.md`).
- Se encontrar comentário discutindo conteúdo ou bloqueando um trecho, **PARE**, reporte o `comment_id` e aguarde instrução do usuário.

---

## 2. Step-by-Step Workflow

### Etapa 1 — Coleta de Revisões no Google Docs
1. Se o ID do documento não for conhecido, execute `list_drive_files`.
2. Execute `manage_doc_comments(document_url_or_id, action="list", only_unresolved=true)` para listar todos os comentários abertos com `comment_id`, autor, trecho citado (`quoted_file_content`) e `doc_location`.
3. Se o orientador também tiver feito edições diretas no texto do Docs (sem comentário), use `read_doc_content(document_url_or_id, section_title="...")` apenas nas seções apontadas e compare parágrafo a parágrafo com o `.tex` correspondente.

### Etapa 2 — Mapeamento Exato para os Arquivos `.tex` / `.bib`
1. Execute `get_latex_structure(tcc_dir="<raiz do repo>")` para descobrir o arquivo exato (`src/capitulos/...`, `src/pre-textuais.tex`, `src/referencias.bib`) e o intervalo `start_line..end_line`.
2. Leia apenas o intervalo relevante do arquivo `.tex` / `.bib` (economizando janela de contexto).

### Etapa 3 — Triagem e Plano de Aprovação (Antes de Editar)
Apresente ao usuário uma tabela estruturada com cada item coletado e **aguarde confirmação explícita** (item a item ou em lote):

| ID do comentário | Seção / Arquivo `.tex` | Pedido do orientador | Classificação | Proposta de edição no LaTeX | Proposta de resposta no Docs |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *(ex.: `AAA...`)* | `03-metodologia.tex:L42` | ... | *Ortografia/Estilo \| Ajuste Normativo/ABNT \| Conteúdo/Argumentação \| Referência `.bib` \| Dúvida a responder* | *(Antes vs. Depois)* | ... |

*(Para mudanças semânticas ou reescritas relevantes, utilize também o formato visual de `.agents/skills/change_review/SKILL.md`.)*

### Etapa 4 — Aplicação Local e Validação de Build
1. Aplique apenas as edições aprovadas nos arquivos `.tex` / `.bib`, preservando macros LaTeX corretas (`\cite{}`, `\textcite{}`, `\ref{}`, `\texttt{}`, `\allowbreak` onde necessário e entradas válidas em `src/referencias.bib`).
2. Execute compilação e auditoria local com `.\make.bat check --json` (ou `make check --json`) garantindo **0 erros e 0 warnings** no PDF compilado (`.\make.bat preview --issues` se surgir alerta visual).

### Etapa 5 — Retorno ao Google Docs e Fechamento (Sob Aprovação)
1. **Se o usuário aprovar o espelhamento de volta para o Docs:**
   - Leia os índices atuais da seção afetada com `read_doc_content(..., section_title="...", include_indices=true)`.
   - Atualize apenas os blocos alterados via **`batch_replace_blocks`** (ou `replace_block_abnt` se for bloco único), **sempre** com `expected_text`.
   - Rode `format_bibliography_abnt(only_cited=true)` se `.bib` mudou e `sync_front_matter_abnt` se títulos ou paginação mudaram.
   - Sincronize o novo `src/build/main.pdf` via `check_pdf_sync` → `sync_pdf_to_drive` (ver `.agents/skills/health_check/SKILL.md`).
2. **Somente após confirmação explícita do usuário para cada comentário:**
   - Responda objetivamente com `manage_doc_comments(document_url_or_id, action="reply", comment_id=..., reply_content=...)`.
   - Encerre com `manage_doc_comments(document_url_or_id, action="resolve", comment_id=...)` apenas os comentários autorizados pelo autor.

---

## Boundaries

- ✅ **Always:** Mapeie arquivo e linha exata via `get_latex_structure` e valide o PDF local com `make check` antes de retornar ao Docs.
- ✅ **Always:** Passe `expected_text` em `batch_replace_blocks` e `replace_block_abnt`.
- 🚫 **Never:** Nunca edite texto autoral ou responda/resolva comentários (`manage_doc_comments`) sem consentimento explícito do usuário.
- 🚫 **Never:** Nunca faça upload do PDF se `make check` apontar erro ou `check_pdf_sync` acusar ausência de `%%EOF`.

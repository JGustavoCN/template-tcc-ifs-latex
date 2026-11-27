---
name: Integração Opcional MCP Google Docs ↔ LaTeX (mcp-gdocs-latex)
description: Orienta a IA a detectar se o servidor MCP mcp-gdocs-latex está ativo, operar 100% local quando ausente e usar corretamente as 22 ferramentas ortogonais (v2.2.0) quando disponível.
mode: always
trigger: always_on
---

# Integração Opcional: Servidor MCP `mcp-gdocs-latex` (v2.2.0)

Este template LaTeX (`template-tcc-ifs-latex`) é **100% funcional localmente** (via `Makefile`/`make.bat` e GitHub Pages), mas possui suporte nativo e opcional ao servidor MCP **[mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)** (v2.2.0, geralmente registrado como `mcp-gdocs` no `mcp_config.json`), que conecta o projeto LaTeX ao **Google Docs** e ao **Google Drive** no padrão ABNT (NBR 14724, 6023, 6024, 6027 e 10520).

## 1. Regra de Detecção e Roteamento (Antes de qualquer ação na nuvem)

1. **Verifique se o servidor `mcp-gdocs` está conectado** na sessão atual (ferramentas como `list_drive_files`, `compare_latex_with_doc`, `manage_doc_comments`, `sync_pdf_to_drive`).
2. **Se NÃO estiver conectado:**
   - **NÃO tente chamar ferramentas MCP inexistentes** nem trate a ausência como erro.
   - Continue operando normalmente em modo local (`make build`, `make check`, `make diff`, `make portal`, `make slides`).
   - Se o usuário pedir para sincronizar com Google Docs, ler comentários do orientador no Docs ou enviar o PDF ao Google Drive, informe que este template suporta a integração opcional com o **[mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)** e leia `.agents/skills/mcp_gdocs_guide/SKILL.md` para orientá-lo na instalação em 3 passos (incluindo o slot rápido `mcp-image-slot.png`).
3. **Se ESTIVER conectado, roteie automaticamente para a skill certa:**
   - **Setup, `credentials.json`, `mcp-image-slot.png` ou catálogo das 22 ferramentas:** `.agents/skills/mcp_gdocs_guide/SKILL.md`.
   - **Enviar/espelhar capítulos, tabelas, figuras, bibliografia, pré-textuais ou PDF do LaTeX → Google Docs/Drive:** `.agents/skills/sync_latex_to_gdocs/SKILL.md`.
   - **Trazer revisões, edições diretas ou comentários do orientador do Google Docs → LaTeX local (`.tex`/`.bib`):** `.agents/skills/sync_gdocs_to_latex/SKILL.md`.
   - **Fluxo ponta a ponta combinado (comentários + espelhamento + `make check` + upload Drive):** `.agents/skills/tcc_bridge_workflow/SKILL.md` e `.agents/skills/health_check/SKILL.md`.

## 2. Contrato de Uso da v2.2.0 (22 Ferramentas Ortogonais — Regras Críticas)

- **Autodescoberta de `src/`:** ao passar `tcc_dir` para `get_latex_structure`, `compare_latex_with_doc`, `init_doc_abnt` ou `sync_latex_chapter`, informe a **raiz do repositório** — o servidor `mcp-gdocs-latex` v2.2.0 detecta e promove `src/main.tex`, `src/metadados.tex`, `src/referencias.bib` e `src/logo_ifs.png` automaticamente.
- **Envelope HATEOAS:** toda ferramenta retorna `{ok, tool, summary, data, next_actions}`. Siga as sugestões seguras de `next_actions` e nunca assuma formato texto plano legado.
- **Somente nomes oficiais da v2.2.0 (proibido usar nomes v1/v2.0):**
  - Drive / Descoberta: `list_drive_files` *(substitui `list_available_documents`)*
  - Estrutura LaTeX: `get_latex_structure` *(substitui `get_tcc_latex_structure`)*
  - Escrita de capítulo completo em paralelo (Zero-Leak Guard + `\allowbreak`): `sync_latex_chapter`
  - Substituições em lote (`BatchUpdate` reverso) e atômica: `batch_replace_blocks` e `replace_block_abnt` (**sempre** passando `expected_text`)
  - Tabelas e figuras/diagramas nativos: `insert_table` *(substitui `insert_native_table`)* e `insert_figure` *(substitui `insert_mermaid_diagram`)* — posicionando pela âncora `after_paragraph_snippet` de baixo para cima!
  - Formatação, pré-textuais e bibliografia: `format_document_abnt`, `sync_front_matter_abnt` *(substitui `sync_abnt_front_matter_lists`)*, `format_bibliography_abnt`
  - Comentários e PDF: `manage_doc_comments` (`action: "list" | "reply" | "resolve"`), `check_pdf_sync`, `sync_pdf_to_drive`
- **Travas de Segurança e Autonomia:**
  - Sempre passe `expected_text` em `replace_block_abnt` e em cada item de `batch_replace_blocks`.
  - Nunca use `confirm_overwrite: true` em `init_doc_abnt` sem aprovação explícita do usuário.
  - Nunca altere texto autoral (`.tex`, `.bib` ou Google Docs) nem responda/resolva comentários (`manage_doc_comments`) sem aprovação explícita do usuário (ver `.agents/rules/autonomia.md` e `.agents/skills/change_review/SKILL.md`).

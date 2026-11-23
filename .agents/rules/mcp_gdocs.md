---
name: Integração Opcional MCP Google Docs ↔ LaTeX (mcp-gdocs-latex)
description: Orienta a IA a detectar se o servidor MCP mcp-gdocs-latex está ativo, operar 100% local quando ausente e usar corretamente as 20 ferramentas ortogonais (v2.0.0) quando disponível.
mode: always
trigger: always_on
---

# Integração Opcional: Servidor MCP `mcp-gdocs-latex`

Este template LaTeX (`template-tcc-ifs-latex`) é **100% funcional localmente** (via `Makefile`/`make.bat` e GitHub Pages), mas possui suporte nativo e opcional ao servidor MCP **[mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)** (geralmente registrado como `mcp-gdocs` no `mcp_config.json`), que conecta o projeto LaTeX ao **Google Docs** e ao **Google Drive** no padrão ABNT (NBR 14724, 6023, 6024, 6027 e 10520).

## 1. Regra de Detecção Obrigatória (Antes de qualquer ação na nuvem)

1. **Verifique se o servidor `mcp-gdocs` está conectado** na sessão atual (ferramentas como `list_available_documents`, `compare_latex_with_doc`, `manage_doc_comments`, `sync_pdf_to_drive`).
2. **Se NÃO estiver conectado:**
   - **NÃO tente chamar ferramentas MCP inexistentes** nem trate a ausência como erro.
   - Continue operando normalmente em modo local (`make build`, `make check`, `make diff`, `make portal`, `make slides`).
   - Se o usuário pedir para sincronizar com Google Docs, ler comentários do orientador no Docs ou enviar o PDF ao Google Drive, informe que este template suporta a integração opcional com o **[mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)** e leia a skill `.agents/skills/mcp_gdocs_guide/SKILL.md` para orientá-lo na instalação em 3 passos.
3. **Se ESTIVER conectado:**
   - Ative as skills relevantes sob demanda:
     - `.agents/skills/mcp_gdocs_guide/SKILL.md` — catálogo completo das 20 ferramentas, setup e fluxos de inicialização/sincronização/auditoria ABNT.
     - `.agents/skills/tcc_bridge_workflow/SKILL.md` — fluxo ponta a ponta para resolver comentários do orientador, espelhar no Docs, compilar e sincronizar PDF.
     - `.agents/skills/health_check/SKILL.md` — validação de arquivos compartilhados (`list_available_documents`) e paridade MD5 (`check_pdf_sync`) antes de uploads.

## 2. Contrato de Uso da v2.0.0 (Regras Críticas)

- **Autodescoberta de `src/`:** Ao passar `tcc_dir` para `get_tcc_latex_structure`, `compare_latex_with_doc` ou `init_doc_abnt`, informe a **raiz do repositório** — o servidor `mcp-gdocs-latex` v2.0.0 detecta e promove `src/main.tex`, `src/metadados.tex`, `src/referencias.bib` e `src/logo_ifs.png` automaticamente.
- **Envelope HATEOAS:** Toda ferramenta retorna `{ok, tool, summary, data, next_actions}`. Siga as sugestões seguras de `next_actions` e nunca assuma formato texto plano legado.
- **Somente ferramentas da v2.0.0:** Nunca tente invocar ferramentas legadas removidas (`list_doc_comments`, `reply_to_comment`, `resolve_comment`, `update_block_by_index`, `apply_abnt_page_margins`, `update_local_latex`). Use as equivalentes oficiais:
  - Comentários: `manage_doc_comments` (`action: "list" | "reply" | "resolve"`)
  - Substituição atômica ABNT: `replace_block_abnt` (sempre com `expected_text`)
  - Tabelas e diagramas nativos: `insert_native_table` e `insert_mermaid_diagram`
  - Formatação/margens: `format_document_abnt`, `format_bibliography_abnt`, `sync_abnt_front_matter_lists`
- **Travas de Segurança e Autonomia:**
  - Sempre passe `expected_text` ao chamar `replace_block_abnt`.
  - Nunca use `confirm_overwrite: true` em `init_doc_abnt` sem confirmação explícita do usuário.
  - Nunca responda ou resolva comentários de conteúdo do orientador (`manage_doc_comments`) sem aprovação explícita do usuário (regra em `.agents/rules/autonomia.md`).
  - Nunca altere o texto autoral no Google Docs ou nos arquivos `.tex` sem aprovação prévia (use `.agents/skills/change_review/SKILL.md`).

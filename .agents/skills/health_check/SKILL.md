---
name: Health Check e Setup de Upload
description: Verifica se o servidor MCP mcp-gdocs está conectado, se o Google Doc e o PDF placeholder estão compartilhados no Drive e valida a paridade MD5/%%EOF antes de qualquer upload.
---

# Health Check e Setup de Upload (MCP `mcp-gdocs` v2.0.0)

## Objective

Garantir que o servidor opcional `mcp-gdocs` (`mcp-gdocs-latex` v2.0.0) esteja ativo, que a Service Account possua acesso aos documentos/PDFs compartilhados no Google Drive e que o PDF local em `src/build/main.pdf` esteja íntegro (`%%EOF`) e efetivamente alterado (`MD5`) antes de executar `sync_pdf_to_drive`.

## Workflow

1. **Verificação de Disponibilidade do Servidor MCP:**
   - Confirme se a ferramenta `list_available_documents` (servidor `mcp-gdocs`) está disponível na sessão.
   - Se o servidor **não estiver conectado**, interrompa o fluxo de nuvem e informe ao usuário que a sincronização com o Drive é opcional e requer a configuração do `mcp-gdocs-latex` (consulte `.agents/skills/mcp_gdocs_guide/SKILL.md`).

2. **Descoberta Estruturada de Arquivos (`list_available_documents`):**
   - Execute `list_available_documents`.
   - Leia o envelope JSON HATEOAS retornado (`data.docs: [{id, name}]` e `data.pdfs: [{id, name}]`).
   - Extraia os IDs do Google Doc e/ou do PDF de entrega compartilhados.
   - Se `data.pdfs` estiver vazio ao tentar publicar o PDF, **PARE imediatamente** e oriente o usuário conforme a seção *Error Handling* abaixo.

3. **Auditoria Pré-Upload de Integridade e Paridade (`check_pdf_sync`):**
   - Antes de chamar `sync_pdf_to_drive`, execute `check_pdf_sync` passando o ID do PDF remoto e o caminho local (`src/build/main.pdf`).
   - Decisão com base no retorno:
     - **`IN_SYNC` (MD5 idêntico):** Não é necessário reenviar o arquivo; informe ao usuário que o PDF no Drive já está atualizado.
     - **`OUT_OF_SYNC` (PDF íntegro com `%%EOF`, MD5 diferente):** Prossiga com `sync_pdf_to_drive`.
     - **Erro de integridade (`%%EOF` ausente / arquivo incompleto / TOCTOU):** **PARE**, recompile via `make build` e valide novamente antes de subir.

## Boundaries

- ✅ **Always:** Execute `list_available_documents` e `check_pdf_sync` antes de `sync_pdf_to_drive`.
- 🚫 **Never:** Nunca tente subir um PDF se `data.pdfs` estiver vazio ou se `src/build/main.pdf` não tiver passado pela verificação `%%EOF`.

## Error Handling / Communication

Se `data.pdfs` estiver vazio, instrua o usuário com esta orientação clara:

> *"⚠️ Setup incompleto no Google Drive! Para sincronizar o PDF via `mcp-gdocs`, faça upload de um arquivo PDF placeholder no seu Google Drive e compartilhe-o como **Editor** com o e-mail da sua Service Account (`client_email` do seu `credentials.json`). Se estiver usando `ALLOWED_DOC_IDS`, adicione também o ID desse PDF à variável. Me avise assim que compartilhar!"*

---
name: Health Check e Setup de Upload
description: Verifica se os PDFs compartilhados estão configurados corretamente via Google Drive antes de qualquer deploy.
---

# Health Check e Setup de Upload

## Objective

Garantir que a conta de serviço tenha permissões de edição no Google Drive e que o arquivo PDF placeholder exista antes de realizar o deploy.

## Tool Execution

Utilize a ferramenta `list_available_documents` (oferecida pelo servidor MCP `mcp-gdocs` ou equivalente) para validar o ambiente.

## Workflow

1. **Verificação de Ambiente:** Execute `list_available_documents`.
2. **Análise de Output:** Procure pela seção **"📕 PDFs Compartilhados"** no output.
3. **Decisão:**
   - **Se houver um PDF lá:** Extraia o ID desse PDF, guarde-o na memória e prossiga para o processo de upload/sincronização.
   - **Se NÃO houver PDF lá:** PARE o processo imediatamente.

## Boundaries

- ✅ **Always:** Execute este fluxo antes de tentar fazer upload de um arquivo PDF gerado.
- 🚫 **Never:** Não tente fazer o upload se a seção de PDFs compartilhados estiver vazia.

## Error Handling / Communication

Se a verificação falhar (nenhum PDF compartilhado), instrua o usuário exatamente com a seguinte mensagem:
*"⚠️ Setup Incompleto! Para sincronizar o PDF, faça upload de um arquivo PDF placeholder no seu Drive e compartilhe-o como 'Editor' com a minha conta de serviço: `mcp-bot@mcp-tcc.iam.gserviceaccount.com`. Me avise quando fizer isso!"*

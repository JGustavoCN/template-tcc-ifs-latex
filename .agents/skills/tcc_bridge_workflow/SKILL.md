---
name: O Fluxo Supremo de Edição e Deploy (TCC-Bridge)
description: Workflow passo a passo para sincronização ponta a ponta - do Google Docs para o repositório local, Google Drive e GitHub (CI/CD).
---

# O Fluxo Supremo de Edição e Deploy (TCC-Bridge)

## Objective

Processar os comentários do orientador deixados no Google Docs, aplicar as correções no arquivo fonte LaTeX localmente, recompilar o PDF, sincronizar para o Google Drive e realizar o deploy final via GitHub Actions.

## Step-by-Step Workflow

Siga ESTRITAMENTE esta ordem quando o usuário pedir para corrigir comentários do orientador:

1. **Mapeamento:** Execute a tool `list_doc_comments` para ler os feedbacks pendentes.
2. **Raio-X & Leitura:** Execute `get_doc_skeleton` e `read_doc_content` para ler cirurgicamente o trecho a ser modificado.
3. **Edição Dupla:**
   - Altere o arquivo `.tex` no repositório local.
   - Espelhe a alteração na nuvem usando `replace_text_in_doc` ou `multi_replace_doc_block`.
4. **Build Local:** Use o terminal para executar `make build`. Se houver erro, aplique a [Skill: Triagem de Erros] e recompile.
5. **Limpeza OBRIGATÓRIA:** Após o sucesso, execute `make clean` no terminal para apagar os arquivos temporários, mantendo o git limpo.
6. **Deploy Google Drive:** Execute a [Skill: Health Check e Setup de Upload] para achar o ID, e use `sync_pdf_to_drive` para atualizar a nuvem.
7. **Fechamento Docs:** Use `reply_to_comment` ou `resolve_comment` informando ao orientador que a correção foi aplicada.
8. **Deploy CI/CD (GitHub Actions):** Gere a mensagem usando a [Skill: Relatório de Fechamento] e execute os comandos de terminal `git add .`, `git commit -m "..."` e `git push` para acionar a publicação no GitHub Pages e a criação da Release.

## Boundaries

- ✅ **Always:** Siga a ordem exata das 8 etapas sem pular nenhuma.
- 🚫 **Never:** Não faça o `git push` se o `make build` falhar.

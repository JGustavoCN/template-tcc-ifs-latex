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
   - Espelhe a alteração na nuvem seguindo estas regras de decisão:
     - **Regra 1 (Texto Simples):** Quer apenas corrigir um erro de digitação ou trocar uma palavra sem mudar o visual? Use `search_and_replace_text`.
     - **Regra 2 (Estilo Cirúrgico - NOVA):** Quer apenas colocar uma palavra existente em itálico ou negrito? Use `search_in_doc` para pegar os índices exatos e envie para a ferramenta `apply_text_style`. Essa é a forma mais segura de formatar palavras isoladas sem esbarrar em bloqueios de comentários do parágrafo.
     - **Regra 3 (Reescrita Estrutural):** O orientador pediu para reescrever a frase ou aplicar formatação em múltiplos trechos de um parágrafo novo? Use `update_block_by_index`, enviando o bloco inteiro com o `\n` no final. (Sujeito à trava de comentários).
4. **Build Local:** Use o terminal para executar `make build`. Se houver erro, aplique a [Skill: Triagem de Erros] e recompile.
5. **Limpeza OBRIGATÓRIA:** Após o sucesso, execute `make clean` no terminal para apagar os arquivos temporários, mantendo o git limpo.
6. **Deploy Google Drive:** Execute a [Skill: Health Check e Setup de Upload] para achar o ID, e use `sync_pdf_to_drive` para atualizar a nuvem.
7. **Fechamento Docs:** Use `reply_to_comment` ou `resolve_comment` informando ao orientador que a correção foi aplicada.
8. **Deploy CI/CD (GitHub Actions):** Gere a mensagem usando a [Skill: Relatório de Fechamento] e execute os comandos de terminal `git add .`, `git commit -m "..."` e `git push` para acionar a publicação no GitHub Pages e a criação da Release.

## Diretrizes de Parsing (LaTeX ➡️ Google Docs)

- **Citações (`\cite`, `\textcite`):** Substituir pela formatação estática correspondente em ABNT (ex: `(FEITOZA, 2021)` ou `Segundo Feitoza (2021)`) no Payload JSON.
- **Listas (`\begin{itemize}`, `\begin{enumerate}`):** Converter os itens (`\item`) para parágrafos `NORMAL_TEXT` prefixados com um hífen simples (`-`), ignorando a indentação complexa do Docs.
- **Elementos Visuais Complexos (`\begin{figure}`, `\begin{table}`, `\begin{equation}`):** A API do Google Docs não suporta injeção direta de imagens via texto. Sempre que encontrar esses ambientes no LaTeX, você DEVE substituí-los por um "Deep Link" apontando para o PDF no Drive:
  1. Se você não tem o ID do PDF em memória, use a ferramenta `list_available_documents` para capturar o ID do PDF de entrega.
  2. Construa a URL de visualização: `https://drive.google.com/file/d/[ID_DO_PDF]/view`
  3. No payload JSON de substituição (`update_block_by_index`), gere o bloco exatamente assim:
     `{"text": "[VER IMAGEM/TABELA NO PDF COMPILADO]\n", "paragraph_style": "NORMAL_TEXT", "text_style": "BOLD", "link_url": "URL_CONSTRUIDA_AQUI"}`
  4. *Regra de Sincronia:* Para que o link exiba a imagem correta, garanta que você já executou `make build` e `sync_pdf_to_drive` para atualizar o PDF na nuvem na iteração atual.
- **Resolução de Comentários (Ação Anti-Bloqueio):** Se a ferramenta de substituição de texto retornar o erro "BLOCKED", você DEVE usar o ID fornecido na mensagem de erro para acionar a ferramenta `resolve_comment`. Somente após resolver o comentário, execute a substituição de texto novamente na mesma iteração.

## Boundaries

- ✅ **Always:** Siga a ordem exata das 8 etapas sem pular nenhuma.
- 🚫 **Never:** Não faça o `git push` se o `make build` falhar.

---
name: Relatório de Fechamento de Iteração
description: Gera um relatório final padronizado em Markdown após ciclos de compilação ou resolução de comentários, útil para os commits do usuário.
---

# Relatório de Fechamento de Iteração

## Objective

Consolidar todas as ações realizadas durante o fluxo de correção/deploy em um resumo claro e conciso, para que o usuário saiba exatamente o que mudou e possa utilizar o texto para mensagens de commit do git.

## Content Requirements

Sempre que concluir um fluxo substancial ou resolver comentários, gere um relatório final em Markdown contendo ESTRITAMENTE os seguintes tópicos:

1. **O que foi feito:** Resumo das alterações de conteúdo e decisões tomadas.
2. **Onde foi feito:** Uma lista de quais arquivos `.tex` foram modificados (ex: `src/capitulos/01-introducao.tex`).
3. **Status da Nuvem:** Resumo de quais comentários do Docs foram resolvidos e quais ferramentas foram usadas no Google Workspace.
4. **Status do Build & Deploy:** Confirmação explícita de que o PDF compilou limpo e de que a sincronização via `sync_pdf_to_drive` foi um sucesso.

## Format Guidelines

- Utilize títulos limpos em Markdown.
- Seja objetivo e direto.
- Deixe o texto formatado de uma forma que seja fácil para o usuário copiar e colar no `git commit -m "..."`.

## Boundaries

- ✅ **Always:** Gere este relatório ao final da execução do Fluxo Supremo de Edição e Deploy.
- 🚫 **Never:** Não feche uma iteração complexa de refatoração ou resolução de comentários sem gerar este documento.

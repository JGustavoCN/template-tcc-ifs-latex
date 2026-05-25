---
name: Triagem de Erros
description: Diretrizes para diagnosticar e resolver erros de compilação em LaTeX, separando problemas de template (core) de problemas de conteúdo (usuário).
---

# Triagem de Erros (Template vs. Conteúdo)

## Objective

Diagnosticar a origem de qualquer erro de compilação do LaTeX e adotar a estratégia de correção correta antes de modificar o código, preservando a integridade da arquitetura ABNT.

## Workflow de Diagnóstico

1. **Erro de Template (Core):**
   - *Sintoma:* Falhas em pacotes, conflitos de dependências ou problemas nas macros (ex: `abntex2`, `config.tex`).
   - *Ação:* Corrigir na raiz da arquitetura para melhorar o template globalmente, mediante permissão do usuário.
2. **Erro de Conteúdo (Usuário):**
   - *Sintoma:* Erros de sintaxe introduzidos nos capítulos (ex: `\cite` mal formatado, chaves não fechadas).
   - *Ação:* Corrigir pontualmente o arquivo `.tex` correspondente dentro de `src/capitulos/`, sem tocar no template base.

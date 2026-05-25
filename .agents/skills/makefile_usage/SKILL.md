---
name: Uso Obrigatório do Makefile
description: Força o uso exclusivo do Makefile para compilações locais (LaTeX) em vez de comandos manuais no terminal.
---

# Uso Obrigatório do Makefile

## Objective

Garantir que a compilação do TCC seja feita de forma determinística e automatizada, resolvendo todas as referências (BibTeX) através do Makefile.

## Commands

- **Compilar o TCC em LaTeX:** `make build` (ou `.\make.bat build` no Windows).
- **Limpar arquivos auxiliares:** `make clean` (ou `.\make.bat clean`).

## Boundaries

- ✅ **Always:** Analise o output do comando executado para validar se a ação teve sucesso (ex. procure por "PDF gerado").
- 🚫 **Never:** Não peça para o usuário rodar comandos complexos no terminal manualmente e não execute comandos avulsos como `pdflatex main.tex` diretamente.

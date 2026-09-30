---
name: Uso Obrigatório do Makefile
description: Força o uso exclusivo do Makefile para compilações locais (LaTeX) em vez de comandos manuais no terminal.
---

# Uso Obrigatório do Makefile

## Objective

Garantir que a compilação do TCC seja feita de forma determinística e automatizada, resolvendo todas as referências (BibTeX) através do Makefile.

## Commands

- **Compilar o TCC em LaTeX (enxuto):** `make build` (ou `.\make.bat build` no Windows).
- **Compilar diagramas Mermaid em PDF:** `make figures` (ou `.\make.bat figures`).
- **Diagnóstico inteligente & Auditoria ABNT:** `make check` (ou `.\make.bat check`).
- **Pipeline completo (figures -> build -> clean):** `make all` (ou `.\make.bat all`).
- **Limpar arquivos auxiliares:** `make clean` (ou `.\make.bat clean`).
- **Limpeza completa (inclusive PDF):** `make cleanall` (ou `.\make.bat cleanall`).

## Boundaries

- ✅ **Always:** Utilize o `make check` (ou `node scripts/check.js --json`) para verificar o estado da compilação, problemas de layout (`Underfull \vbox`) e referências sem ler logs gigantescos.
- 🚫 **Never:** Não peça para o usuário rodar comandos manuais avulsos como `pdflatex main.tex` diretamente.

# Diretrizes e Instruções do Projeto (Gemini & Antigravity)

Este repositório segue a especificação padronizada de regras do **Antigravity**.

As diretrizes operacionais completas, permissões de autonomia, comandos do Makefile e convenções de pesquisa bibliográfica estão definidas em:
👉 **[AGENTS.md](./AGENTS.md)**

---

## ⚡ Regras Rápidas e Princípios Fundamentais

1. **Idioma Obrigatório:** Sempre se comunique exclusivamente em Português do Brasil (pt-BR).
2. **Fonte Bibliográfica (`src/referencias.bib`):**
   - Sempre consulte e pesquise com base no arquivo [`src/referencias.bib`](./src/referencias.bib).
   - Toda afirmação conceitual ou citação no texto deve ter sua respectiva entrada no `.bib`.
   - Utilize fontes científicas qualificadas para propor novas referências.
3. **Uso Obrigatório do Makefile / make.bat:**
   - Para compilar: `make build` (ou `.\make.bat build`).
   - Para diagramas Mermaid: `make figures` (ou `.\make.bat figures`).
   - Para auditoria de layout/ABNT: `make check` (ou `.\make.bat check`).
   - Para pipeline completo: `make all` (ou `.\make.bat all`).
4. **Preservação de Autoria Intelectual:**
   - Nunca altere a semântica do trabalho sem autorização explícita do usuário.
   - Respeite as regras de consentimento da skill `.agents/skills/autonomy_rules`.
5. **Skills Nativas Recomendadas:**
   - Use `/antigravity-guide` para dúvidas de uso do Antigravity (IDE, CLI, atalhos).
   - Use `/agy-customizations` para entender regras, criação de skills ou MCP.

# Agent Project Specification: Template TCC IFS (LaTeX) & TCC-Bridge

Este arquivo define as diretrizes, limites de autonomia, fluxos de pesquisa e padrões operacionais para agentes de Inteligência Artificial atuando neste repositório.

---

## 🎯 Persona e Objetivo Principal

Você atua como **Pesquisador Acadêmico e Engenheiro de Software Sênior**, especialista em LaTeX (normas ABNT), BibTeX, diagramação vetorial e automação de fluxos de CI/CD e MCP (Model Context Protocol).

Seu papel é:
1. Garantir a consistência arquitetural do template ABNT (evitando quebras no core do LaTeX).
2. Auxiliar o autor na redação, organização e fundamentação metodológica do TCC.
3. Realizar diagnósticos rápidos e inteligentes de compilação e layout (`make check`).
4. Sincronizar perfeitamente as alterações com o Google Docs/Drive via MCP (quando ativo).

---

## 📚 Diretrizes de Pesquisa e Uso do `src/referencias.bib`

O arquivo [`src/referencias.bib`](file:///c:/Projetos/latex/template-tcc-ifs-latex/src/referencias.bib) é a **fonte única de verdade bibliográfica** do projeto. Sempre que estiver realizando pesquisas, sugerindo melhorias de conteúdo ou escrevendo seções:

1. **Consulta Prévia Obrigatória:**
   - Antes de sugerir citações, discutir autores ou propor conceitos teóricos, leia o [`src/referencias.bib`](file:///c:/Projetos/latex/template-tcc-ifs-latex/src/referencias.bib) para verificar as obras já cadastradas.
   - Priorize fundamentar argumentos utilizando referências já presentes na base do projeto.
2. **Adição de Novas Referências:**
   - Ao identificar a necessidade de novo embasamento científico, pesquise fontes conceituadas (artigos em periódicos, conferências da SBC, IEEE, ACM, livros didáticos ou documentações técnicas oficiais).
   - Adicione o registro BibTeX correspondente diretamente em [`src/referencias.bib`](file:///c:/Projetos/latex/template-tcc-ifs-latex/src/referencias.bib), garantindo todos os campos exigidos pela ABNT:
     - `@article`: `author`, `title`, `journal`, `year`, `volume`, `number`, `pages`.
     - `@book`: `author`, `title`, `publisher`, `year`, `address`.
     - `@inproceedings`: `author`, `title`, `booktitle`, `year`, `pages`.
     - `@online`: `author`, `title`, `year`, `url`, `urldate`.
3. **Casamento Exato de Citações no Texto:**
   - Toda citação no corpo dos arquivos em `src/capitulos/` deve utilizar a sintaxe compatível com `biblatex-abnt`:
     - Citação indireta entre parênteses: `\cite{chave}` -> (SILVA, 2026).
     - Citação com autor no texto: `\citeonline{chave}` ou `\textcite{chave}` -> segundo Silva (2026).
   - **NUNCA** deixe uma citação no texto sem a respectiva entrada no `.bib`. Após alterações, execute `make check` para validar se todas as citações foram resolvidas.

---

## 🔒 Limites de Autonomia e Consentimento

1. **Ações Autônomas (NÃO precisam de permissão prévia):**
   - Compilar o LaTeX (`make build`, `make all`).
   - Compilar diagramas Mermaid em PDF vetorial (`make figures`).
   - Rodar diagnósticos de integridade e ABNT (`make check` ou `node scripts/check.js --json`).
   - Corrigir erros de sintaxe LaTeX que estejam quebrando a compilação.
   - Navegar no código e inspecionar arquivos.
   - Aplicar correções puramente tipográficas e de estilo solicitadas sem alterar a semântica.
2. **Ações Restritas (EXIGEM aprovação explícita antes de executar):**
   - Alterar a semântica, o significado ou reescrever frases do TCC (ex: substituir termos teóricos fundamentais).
   - Deletar parágrafos inteiros de texto autoral.
   - Modificar pacotes institucionais ou macros na Área Restrita (`src/config.tex`).
   - Responder ou marcar como resolvidos comentários do orientador no Google Docs que envolvam discussão de conteúdo.
3. **Regra de Bloqueio:** Se esbarrar em um comentário de conteúdo bloqueando um trecho, **PARE A EXECUÇÃO**. Avise o usuário com o ID do comentário e pergunte como proceder antes de alterar o texto.

---

## 🛠️ Comandos de Compilação e Diagnóstico

Sempre utilize o Makefile (ou `make.bat` no Windows). **Nunca execute comandos manuais desgovernados como `pdflatex main.tex`**:

| Comando (Windows) | Comando (Linux/Mac) | Finalidade |
| :--- | :--- | :--- |
| `.\make.bat build` | `make build` | Compilação enxuta do PDF (silencia ruídos de fontes e pacotes). |
| `.\make.bat figures` | `make figures` | Converte diagramas `.mmd` em `src/figuras/` para PDF vetorial recortado. |
| `.\make.bat check` | `make check` | Auditoria inteligente: erros, `Underfull \vbox`, `Overfull \hbox`, geometria real do PDF (Poppler/PyMuPDF, `--ink` para tinta) e linter ABNT. |
| `.\make.bat check --json` | `make check --json` | Retorna o status de auditoria em JSON compacto (ideal para consumo por IAs). |
| `.\make.bat doctor` | `make doctor` | Verifica todas as dependências (LaTeX, Biber, Perl, Node, Git, Poppler, Ghostscript, Beamer, PyMuPDF) e capacidades prontas (`--json`). |
| `.\make.bat update --dry-run` | `make update ARGS="--dry-run"` | Verifica nova versão do template oficial e simula atualização segura em 3 Zonas (`--sync-infra`, `--skip-config`, `--rollback`). |
| `.\make.bat preview <pag>` | `make preview PAGES=<pag>` | Renderiza páginas do PDF em PNG (`src/build/previews/`) — suporta intervalos (`14-16`), `--issues` e `--slides`. |
| `.\make.bat slides` | `make slides` | Compila os slides Beamer 16:9 da defesa (`slides/apresentacao.tex`) reutilizando `src/referencias.bib` e `src/figuras/`. |
| `.\make.bat portal` | `make portal` | Gera o portal web dinâmico com PDF embutido e sumário para o GitHub Pages. |
| `.\make.bat diff` | `make diff` | Exibe word-diff por seção (`diff=tex`) e gera relatório visual Antes/Depois (`--html` / `--md`). |
| `.\make.bat add-ref <DOI>` | `make add-ref DOI=<DOI>` | Consulta CrossRef/DataCite e adiciona a referência formatada em `src/referencias.bib`. |
| `.\make.bat all` | `make all` | Pipeline completo: `figures` -> `build` -> `clean`. |
| `.\make.bat clean` | `make clean` | Remove arquivos intermediários (`.aux`, `.log`, etc.), preservando o PDF. |
| `.\make.bat cleanall` | `make cleanall` | Remove todos os arquivos gerados (incluindo o PDF final). |

---

## 🔌 Integração Opcional: Servidor MCP Google Docs ↔ LaTeX (`mcp-gdocs-latex`)

Este repositório funciona **100% localmente** (sem precisar de Google Docs/Drive), mas é nativamente compatível com o servidor MCP opcional **[mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)** (v2.2.0, registrado normalmente como `mcp-gdocs`), escrito em Go com **22 ferramentas ortogonais**, `ServerInstructions` nativo e resposta HATEOAS (`{ok, tool, summary, data, next_actions}`).

1. **Como agir conforme a disponibilidade na sessão:**
   - **Se o servidor `mcp-gdocs` ESTIVER conectado:** use o roteamento das skills dedicadas:
     - **Setup / `mcp-image-slot.png` / Catálogo (22 tools):** `.agents/skills/mcp_gdocs_guide/SKILL.md`.
     - **LaTeX → Google Docs & Drive:** `.agents/skills/sync_latex_to_gdocs/SKILL.md` (`init_doc_abnt`, `sync_latex_chapter`, `batch_replace_blocks`, `insert_table`, `insert_figure` com âncora `after_paragraph_snippet`, `format_bibliography_abnt`, `format_document_abnt`, `sync_front_matter_abnt`, `lint_document_abnt`, `compare_latex_with_doc`, `check_pdf_sync`, `sync_pdf_to_drive`).
     - **Google Docs → LaTeX (revisões e comentários):** `.agents/skills/sync_gdocs_to_latex/SKILL.md` (`list_drive_files`, `manage_doc_comments`, `read_doc_content`, `get_latex_structure`).
     - **Ciclo completo combinado:** `.agents/skills/tcc_bridge_workflow/SKILL.md` e `.agents/skills/health_check/SKILL.md`.
   - **Se o servidor `mcp-gdocs` NÃO estiver conectado:** opere normalmente no fluxo local (`make build`, `make check`, `make portal`, `make diff`, GitHub Pages/Releases). Se o usuário solicitar sincronização com Google Docs/Drive ou leitura de comentários no Docs, informe que existe a integração opcional `mcp-gdocs-latex` e consulte `.agents/skills/mcp_gdocs_guide/SKILL.md` para orientar o setup em 3 passos.
2. **Descoberta automática de `src/`:** ao informar `tcc_dir`, passe a **raiz deste repositório** — o `mcp-gdocs-latex` v2.2.0 promove `src/main.tex`, `src/metadados.tex`, `src/referencias.bib` e `src/logo_ifs.png` automaticamente.
3. **Travas obrigatórias:** siga `.agents/rules/mcp_gdocs.md` e `.agents/rules/autonomia.md` (sempre passe `expected_text` em `replace_block_abnt` e `batch_replace_blocks`; nunca use `confirm_overwrite: true` ou resolva comentários de conteúdo sem aprovação explícita).

---

## 🚀 Uso dos Recursos do Antigravity (Skills & Customizações)

Sempre que surgirem dúvidas arquiteturais ou necessidade de expansão da infraestrutura do agente, utilize e consulte:

1. **`/antigravity-guide` (`builtin/skills/antigravity_guide`):**
   - Ative para consultar recursos da plataforma Antigravity, opções de CLI (`agy`), extensões do IDE, atalhos de teclado e ciclo de vida de tarefas em background.
2. **`/agy-customizations` (`builtin/skills/agy-customizations`):**
   - Ative para entender a hierarquia de descoberta de regras (`AGENTS.md`, `GEMINI.md`, `.agents/rules/`), criação de novas `skills/`, hooks de execução (`hooks.json`) ou integração de novos servidores MCP (`mcp_config.json`).

---

## 📂 Estrutura de Diretórios e Escopo

- `src/capitulos/` – **Área Livre de Conteúdo.** Capítulos do TCC onde o texto é elaborado.
- `src/figuras/` – **Diagramas e Ilustrações.** Contém arquivos Mermaid (`.mmd`), PDFs vetoriais e imagens.
- `src/referencias.bib` – **Base Bibliográfica.** Catálogo de todas as referências citadas no trabalho.
- `src/config.tex` e `src/pre-textuais.tex` – **Área Restrita (Template).** Configurações institucionais do IFS e ABNT.
- `.agents/rules/` – Regras comportamentais persistentes carregadas automaticamente (`mode: always`):
  1. `autonomia.md` – Preservação rigorosa da autoria intelectual e consentimento.
  2. `mcp_gdocs.md` – Detecção e contrato operacional da integração opcional com `mcp-gdocs-latex` (v2.2.0 — 22 ferramentas).
- `.agents/skills/` – Habilidades modulares ativadas sob demanda (*progressive disclosure*):
  1. `bibliographic_research` – Workflow de pesquisa acadêmica, catalogação BibTeX e citações ABNT.
  2. `academic_writing_style` – Diretrizes de tom impessoal, vocabulário e clareza científica.
  3. `error_triage` – Diagnóstico rápido via `make check --json` + auditoria geométrica + `make preview` e triagem de erros (template vs conteúdo).
  4. `makefile_usage` – Padronização de compilação via Makefile e make.bat.
  5. `architecture_guardian` – Bloqueio de edições indevidas na Área Restrita do template.
  6. `autonomy_rules` – Travas de segurança para preservar a autoria intelectual do autor.
  7. `mcp_gdocs_guide` – Setup em 3 passos (`mcp-image-slot.png`), catálogo das 22 ferramentas ortogonais do `mcp-gdocs-latex` (v2.2.0) e mapa de migração.
  8. `sync_latex_to_gdocs` – Espelhamento LaTeX → Google Docs em alta escala (`sync_latex_chapter`, `batch_replace_blocks`, âncoras `after_paragraph_snippet` e fechamento ABNT).
  9. `sync_gdocs_to_latex` – Revisões e comentários do orientador no Google Docs → LaTeX local com triagem para aprovação e validação `make check`.
  10. `tcc_bridge_workflow` – Orquestração ponta a ponta (v2.2.0) combinando revisão bidirecional, Drive e CI/CD.
  11. `health_check` – Auditoria de arquivos compartilhados (`list_drive_files`) e paridade MD5/`%%EOF` (`check_pdf_sync`) antes de deploys no Drive.
  12. `iteration_report` – Relatório executivo de fechamento de ciclos de revisão.
  13. `change_review` – Revisão visual Antes vs. Depois (Carrossel, HTML via `make diff` e Mermaid) antes de alterações semânticas.
  14. `template_updater` – Atualização segura em 3 Zonas (`--auto` / `--wizard` / `--dry-run` / `--sync-infra` / `--skip-config` / `--rollback`) + Passo 0 de bootstrap (`docs/GUIA_ATUALIZACAO_TEMPLATE.md`).

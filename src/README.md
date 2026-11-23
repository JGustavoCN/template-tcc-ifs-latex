# 📄 Núcleo de Conteúdo LaTeX (abnTeX2 / ABNT — IFS)

> **Template Oficial de Trabalho de Conclusão de Curso em LaTeX**  
> Instituto Federal de Educação, Ciência e Tecnologia de Sergipe (IFS) — *Campus* Lagarto  
> Bacharelado em Sistemas de Informação

Este diretório (`src/`) concentra todo o código-fonte acadêmico, a base bibliográfica, as figuras e as configurações institucionais ABNT do TCC. Ele funciona **100% localmente** (via `Makefile`/`make.bat` ou Docker) e também é reconhecido automaticamente pelo Portal Web (`public/`), pelos Slides da Banca (`slides/`) e pelo servidor MCP opcional **[mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)** (v2.0.0).

---

## 📁 Estrutura de Diretórios e Separação de Responsabilidades

O projeto separa claramente o que é **Área Livre do Aluno** (preservada ao atualizar o template via `make update`) do que é **Área Restrita do Template** (núcleo ABNT):

```text
src/
├── main.tex                   ← [Core] Arquivo mestre: ordem ABNT NBR 14724 (pré-textuais, capítulos e pós-textuais)
├── config.tex                 ← [Core / Área Restrita] Pacotes, tipografia, quadro, aprovação, ficha e blindagem de layout
├── metadados.tex              ← [Área do Aluno] Título, autor, orientador, coorientador, curso e membros da banca
├── pre-textuais.tex           ← [Área do Aluno] Dedicatória, agradecimentos, epígrafe, resumo, abstract e siglas
├── referencias.bib            ← [Área do Aluno] Fonte única de verdade bibliográfica (BibLaTeX / NBR 6023)
├── logo_ifs.png               ← [Core] Brasão institucional oficial do IFS (capa e fallback Open Graph do portal)
├── capitulos/                 ← [Área do Aluno] Redação principal do TCC
│   ├── 01-introducao.tex      ← Contextualização, problema, hipótese, objetivos e justificativa
│   ├── 02-referencial.tex     ← Exemplos de citações diretas (curta/longa) e Quadro ABNT/IBGE
│   ├── 03-metodologia.tex     ← Exemplos de figura vetorial Mermaid e listagem de código (listings)
│   ├── 04-resultados.tex      ← Exemplo de Tabela numérica (booktabs)
│   └── 05-conclusao.tex       ← Considerações finais e trabalhos futuros
├── apendices/                 ← [Área do Aluno] Documentos elaborados pelo próprio autor
│   └── 01-apendice-a.tex      ← Ex.: roteiros de entrevista, questionários, provas de conceito
├── anexos/                    ← [Área do Aluno] Documentos de terceiros não elaborados pelo autor
│   └── 01-anexo-a.tex         ← Ex.: regulamentos, pareceres, certidões
├── figuras/                   ← [Área do Aluno] Ativos visuais com \graphicspath automático
│   ├── diagramas/             ← Diagramas Mermaid (.mmd) e PDFs vetoriais compilados
│   ├── graficos/              ← Gráficos quantitativos vetoriais (.pdf de Python, R, Excel, etc.)
│   ├── capturas/              ← Prints de tela, protótipos e interfaces (.png / .jpg)
│   ├── exemplo-diagrama.mmd   ← Exemplo na raiz (retrocompatível com projetos antigos)
│   └── exemplo-diagrama.pdf
└── build/                     ← [Gerado] Artefatos de compilação isolados (main.pdf, logs, .aux, .toc, previews/)
```

> **💡 Dica:** Nunca coloque dados pessoais dentro de `src/config.tex` ou `src/main.tex`. Centralize título, autor, orientador, data de aprovação e membros da banca em [`src/metadados.tex`](./metadados.tex) — ele também alimenta automaticamente o Portal Web (`make portal`) e o `mcp-gdocs-latex`.

---

## 🛠️ Comandos de Compilação, Auditoria e Produtividade

Todos os comandos devem ser executados a partir da **raiz do repositório** via `make.bat` (Windows) ou `Makefile` (Linux/macOS). Evite chamar `pdflatex` manualmente para não poluir `src/` com arquivos temporários.

| Comando (Windows) | Comando (Linux/Mac) | Finalidade |
| :--- | :--- | :--- |
| `.\make.bat build` | `make build` | **Compilação enxuta:** Compila `src/main.tex` em `src/build/main.pdf` via `latexmk` + `biber` com `max_print_line=10000`. |
| `.\make.bat figures` | `make figures` | **Diagramas Mermaid:** Varre `src/figuras/*.mmd` e `src/figuras/diagramas/*.mmd`, gera PDFs vetoriais e recorta com `pdfcrop`. |
| `.\make.bat check` | `make check` | **Auditoria completa (4 camadas):** Auto-build inteligente, erros/`Overfull \hbox` (rastreando `main.lot`/`lof`/`loq` → `.tex`), flutuadores (`--floats`), **geometria real do PDF** via Poppler/MiKTeX ou PyMuPDF (`--ink` para tinta real) e linter ABNT + contagem de palavras. |
| `.\make.bat check --json` | `make check --json` | Emite o relatório completo da auditoria em JSON estruturado (ideal para IAs e CI/CD). Suporta também `--no-build`, `--no-geometry`, `--ink`, `--build-only` e `--text-only`. |
| `.\make.bat preview <pag>` | `make preview PAGES=<pag>` | **Prévia visual em PNG:** Renderiza páginas em `src/build/previews/` (`14`, `14-16`, `1,14,18`, `--issues` para páginas com alertas, ou `--slides`). Usa `pdftoppm` (MiKTeX/Poppler) com fallback em `gs` e PyMuPDF. |
| `.\make.bat slides` | `make slides` | **Slides da Banca (Beamer 16:9):** Compila [`slides/apresentacao.tex`](../slides/apresentacao.tex) nas cores do IFS reutilizando diretamente `src/referencias.bib` e `src/figuras/`. |
| `.\make.bat portal` | `make portal` | **Portal Web Acadêmico:** Gera `public/index.html` com PDF embutido, sumário com busca dinâmica, extensão textual, Open Graph/Twitter Cards e modal **Citar este Trabalho (ABNT/BibTeX)**. |
| `.\make.bat diff` | `make diff` | **Revisão Visual de Mudanças:** Executa word-diff por `\section` (`.gitattributes` `diff=tex`) e gera comparador Antes/Depois (`--html` / `--md`). |
| `.\make.bat add-ref <DOI>` | `make add-ref DOI=<DOI>` | **Importador via DOI:** Consulta CrossRef/DataCite/arXiv e adiciona a entrada formatada em `src/referencias.bib`. |
| `.\make.bat update` | `make update` | **Atualização do Template:** Sincroniza melhorias da infraestrutura oficial preservando seus capítulos, figuras e metadados. |
| `.\make.bat all` | `make all` | **Pipeline completo:** Executa `figures` → `build` → `clean`. |
| `.\make.bat clean` | `make clean` | **Limpeza leve:** Remove intermediários (`.aux`, `.log`, `.bbl`, `*-SAVE-ERROR`), preservando `src/build/main.pdf`. |
| `.\make.bat cleanall` | `make cleanall` | **Limpeza total:** Remove todos os artefatos gerados, incluindo o PDF final. |

> **⚠️ Regra de ouro:** Sempre rode `.\make.bat check` (e `.\make.bat preview --issues`, se houver alertas) **antes** de executar `clean`, pois a auditoria utiliza `.log`, `.aux`, `.toc`, `.lof`, `.lot` e `.loq`.

---

## 📐 Padrões Tipográficos, ABNT e Blindagem de Layout (`src/config.tex`)

As configurações em [`src/config.tex`](./config.tex) implementam rigorosamente a ABNT (**NBR 14724, 6023, 6024, 6027 e 10520**) e previnem problemas clássicos de TCCs longos:

| Recurso / Norma | Configuração Adotada em `src/config.tex` | Benefício Prático |
| :--- | :--- | :--- |
| **Classe Base** | `abntex2` (baseado em `memoir`, `oneside`, `12pt`, `a4paper`) | Conformidade nativa ABNT sem conflitos com o pacote `caption`. |
| **Tipografia** | **Palatino** (`mathpazo`) + `microtype` + `courier` (código) | Alta legibilidade em tela e papel, 100% inclusa no MiKTeX / TeX Live. |
| **Margens e Entrelinhas** | 3 cm (sup./esq.), 2 cm (inf./dir.), entrelinha 1,5 (`\OnehalfSpacing`), recuo 1,25 cm | Padrão obrigatório ABNT NBR 14724. |
| **Controle de Quebras** | `\widowpenalty=10000`, `\clubpenalty=10000`, `\brokenpenalty=10000` | Evita linhas órfãs/viúvas e **proíbe palavras hifenizadas atravessando viradas de página**. |
| **Blindagem de Flutuadores** | `placeins` (`[section,below]`) + `\pretocmd{\subsection}{\FloatBarrier}{}{}` + frações calibradas (`topfraction=0.85`, `textfraction=0.15`, `floatpagefraction=0.70`) | Impede tabelas, quadros e figuras de vazarem para a seção/subseção seguinte e evita congestionamento em capítulos extensos. |
| **Listas sem Corte de Página** | `\setpnumwidth{2.5em}` + `\setrmarg{3.5em plus 1fil}` | Suporta TCCs de 100+ páginas e evita corte de números na Lista de Tabelas/Figuras/Quadros. |
| **Compatibilidade PDF 1.7** | `\pdfminorversion=7` | Aceita gráficos vetoriais modernos (Matplotlib, R, Mermaid, Canva, Inkscape) sem avisos. |
| **Quadro vs. Tabela (IBGE)** | Ambiente nativo `quadro` + `\listofquadros*` vs. `table` (`booktabs`) | Separa dados textuais (moldura fechada) de dados numéricos (bordas laterais abertas), conforme cobrado pelas bancas do IFS. |
| **Bibliografia e URLs** | `biblatex` (`style=abnt`, `sorting=nty`, `\bibitemsep=\baselineskip`) + `xurl` | Ordenação alfabética ABNT NBR 6023, quebra limpa de URLs longas e 1 linha em branco entre entradas. |
| **Aprovação e Ficha** | `\imprimirfolhadeaprovacao` + `\inserirfichacatalografica{...}` (`pdfpages`) | Gera a folha de aprovação com os dados de `metadados.tex` e anexa o PDF oficial da biblioteca do IFS no verso da folha de rosto. |

---

## 📝 Exemplos Práticos de Redação (Padrão ABNT + Linter)

### 1. Citações (`biblatex-abnt` / NBR 10520)

Cadastre a referência em [`src/referencias.bib`](./referencias.bib) (ou importe automaticamente via `.\make.bat add-ref 10.1145/...`) e cite no texto:

```latex
% Citação indireta com autor no corpo da frase:
Segundo \citeonline{exemplo2026}, o uso de fluxos padronizados...
% ou equivalente:
Conforme apontado por \textcite{exemplo2026}...

% Citação indireta entre parênteses no final da frase:
... elevando a reprodutibilidade experimental \cite{exemplo2026}.

% Citação direta curta (até 3 linhas, entre aspas duplas):
Para \citeonline{exemplo2026}, ``a separação entre conteúdo e forma reduz erros'' (p. 48).

% Citação direta longa (mais de 3 linhas — recuo 4 cm, fonte menor, espaçamento simples):
\begin{citacao}
    A padronização documental em ambientes automatizados permite que o pesquisador
    concentre esforços na validação experimental e na clareza argumentativa, reduzindo
    inconsistências normativas na etapa de avaliação pela banca examinadora \cite{exemplo2026}.
\end{citacao}
```

### 2. Figura Vetorial ou Captura de Tela

Graças ao `\graphicspath{{figuras/}{figuras/diagramas/}{figuras/graficos/}{figuras/capturas/}}`, basta informar o nome do arquivo (ou caminho relativo):

```latex
\begin{figure}[!htbp]
    \centering
    \caption[Arquitetura geral do sistema]{Arquitetura geral do sistema com \texttt{API} REST}
    \includegraphics[width=0.85\textwidth,height=0.45\textheight,keepaspectratio]{exemplo-diagrama.pdf}
    \fonte{Elaborado pelo autor (\the\year).}
    \label{fig:arquitetura-geral}
\end{figure}
```

> **💡 Título curto `\caption[...]{...}`:** Sempre que a legenda contiver código monoespaçado (`\texttt{...}`) ou fórmulas (`$...$`), forneça uma versão simples entre colchetes `[...]` para ir à Lista de Figuras/Tabelas/Quadros sem causar `Overfull \hbox` ou corte do número da página.

### 3. Tabela Numérica (Padrão IBGE / `booktabs` — laterais abertas)

```latex
\begin{table}[!htbp]
    \centering
    \caption{Resultados quantitativos por cenário experimental}
    \small
    \begin{tabular}{lccc}
        \toprule
        \textbf{Cenário} & \textbf{Execuções ($n$)} & \textbf{Acerto (\%)} & \textbf{Latência (s)} \\
        \midrule
        Linha de Base ($C_1$) & 30 & 63,3 & 1,42 \\
        Proposta ($C_2$)      & 30 & 96,7 & 1,85 \\
        \bottomrule
    \end{tabular}
    \fonte{Elaborado pelo autor (\the\year).}
    \label{tab:resultados-experimento}
\end{table}
```

### 4. Quadro Textual (Padrão ABNT — moldura totalmente fechada)

```latex
\begin{quadro}[!htbp]
    \centering
    \caption{Comparativo conceitual entre Quadro e Tabela segundo a ABNT/IBGE}
    \small
    \begin{tabularx}{\textwidth}{|l|X|X|}
        \hline
        \textbf{Critério} & \textbf{Quadro} & \textbf{Tabela} \\
        \hline
        Natureza dos dados & Textual, qualitativo ou comparativo & Numérico ou estatístico \\
        \hline
        Bordas laterais & Fechadas (moldura completa) & Abertas (`booktabs`) \\
        \hline
    \end{tabularx}
    \fonte{Elaborado pelo autor (\the\year).}
    \label{qua:comparativo-abnt}
\end{quadro}
```

### 5. Listagem de Código-Fonte (`listings`)

```latex
\begin{lstlisting}[language=Python, caption={Função de validação estruturada em Python}, label={lst:validacao}]
def validar_registro(registro: dict) -> bool:
    campos = ("matricula", "modalidade", "status")
    return all(c in registro and registro[c] for c in campos)
\end{lstlisting}
```

### 6. Ficha Catalográfica, Folha de Aprovação e Diretiva `% check-ignore`

- **Folha de Aprovação:** preencha `\orientador`, `\bancaum`, `\bancadois` (e opcionalmente `\coorientador`, `\bancatres` e `\dataaprovacao`) em [`src/metadados.tex`](./metadados.tex). O comando `\imprimirfolhadeaprovacao` já está ativo em [`src/main.tex`](./main.tex).
- **Ficha Catalográfica:** quando receber o PDF emitido pela Biblioteca do *Campus* após a aprovação (IN 06/2024 do IFS), salve-o em `src/figuras/ficha-catalografica.pdf` e descomente `\inserirfichacatalografica{figuras/ficha-catalografica.pdf}` em [`src/main.tex`](./main.tex).
- **Silenciar falsos positivos do linter:** adicione `% check-ignore` ao final de uma linha específica caso um termo técnico dispare um alerta de estilo intencional.

---

## 📊 Organização de Figuras e Fluxo Produtor → Consumidor

O template trata o LaTeX exclusivamente como **consumidor** de ativos visuais prontos (mantendo o build leve e sem depender de Python/R no CI/CD):

1. **Diagramas Mermaid (`src/figuras/diagramas/` ou `src/figuras/`):** crie arquivos `.mmd` e rode `.\make.bat figures` (`make figures`) para gerar PDFs vetoriais recortados automaticamente. Sem Node.js, exporte em PDF pelo [mermaid.live](https://mermaid.live).
2. **Gráficos quantitativos (`src/figuras/graficos/`):** gere em Python (`matplotlib`/`seaborn`), R (`ggplot2`) ou Excel/Sheets, exporte em **PDF vetorial** e salve nessa subpasta.
3. **Capturas de tela e protótipos (`src/figuras/capturas/`):** salve prints em `.png` ou `.jpg` com boa resolução (≥ 150–300 DPI).

Todos os arquivos de `src/figuras/` e suas subpastas também são reaproveitados automaticamente pelos slides de defesa em [`slides/apresentacao.tex`](../slides/apresentacao.tex) — sem duplicar nenhuma imagem.

---

## 🤖 Integração com Agentes de IA e MCP Opcional (`mcp-gdocs-latex`)

O repositório inclui regras persistentes (`.agents/rules/`) e habilidades modulares (`.agents/skills/`) otimizadas para trabalhar com o conteúdo em `src/`:

- **Regras (`.agents/rules/`):**
  - `autonomia.md`: proíbe alterações semânticas no texto autoral sem aprovação explícita.
  - `mcp_gdocs.md`: detecta se o servidor MCP opcional `mcp-gdocs-latex` (v2.0.0) está conectado e evita chamadas a ferramentas inexistentes quando em modo local.
- **Skills principais (`.agents/skills/`):**
  - `academic_writing_style` e `bibliographic_research`: tom impessoal, vocabulário científico e gestão ABNT de `src/referencias.bib`.
  - `error_triage`: rotina pós-build completa (`check --json` → auditoria geométrica → `preview --issues` → checagem de efeito cascata antes de `clean`).
  - `change_review`: comparativo visual Antes vs. Depois (`make diff --html`, Carrossel e Mermaid) antes de reescritas de conteúdo.
  - `architecture_guardian`: protege `src/config.tex` contra edições acidentais.
  - `mcp_gdocs_guide`, `tcc_bridge_workflow` e `health_check`: quando o servidor opcional **[mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)** (v2.0.0, 20 ferramentas ortogonais) estiver conectado, permite espelhar `src/` no Google Docs (tabelas nativas IBGE, diagramas Mermaid, bibliografia NBR 6023, Sumário/Listas NBR 6027), ler/responder comentários do orientador e sincronizar `src/build/main.pdf` no Google Drive com paridade MD5/`%%EOF`.

> 📋 **Preparando a entrega final?** Consulte o guia passo a passo em [`CHECKLIST_DEFESA.md`](../CHECKLIST_DEFESA.md) (baseado na IN 06/2024 do IFS) e os slides da banca em [`slides/apresentacao.tex`](../slides/apresentacao.tex).

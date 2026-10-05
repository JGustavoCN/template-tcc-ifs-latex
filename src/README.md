# 📄 Núcleo de Conteúdo LaTeX (abnTeX2 / ABNT — IFS)

> **Template Oficial de Trabalho de Conclusão de Curso em LaTeX**  
> Instituto Federal de Educação, Ciência e Tecnologia de Sergipe (IFS) — *Campus* Lagarto  
> Bacharelado em Sistemas de Informação

---

## 📁 Estrutura de Diretórios e Escopo

A pasta `src/` contém todo o código-fonte acadêmico e as configurações institucionais do trabalho:

```text
src/
├── main.tex                  ← Arquivo mestre (estruturação do documento e inclusão de partes)
├── metadados.tex             ← Área do Aluno: dados do trabalho (título, autor, orientador, banca)
├── config.tex                ← Área Restrita: configurações institucionais do IFS, pacotes e tipografia
├── pre-textuais.tex          ← Elementos pré-textuais opcionais (dedicatória, agradecimentos, epígrafe)
├── referencias.bib           ← Base única de verdade bibliográfica (BibLaTeX / NBR 6023)
├── logo_ifs.png              ← Brasão institucional oficial do IFS para a capa e folha de rosto
├── capitulos/                ← Área Livre de Conteúdo (redação dos capítulos do TCC)
│   ├── 01-introducao.tex
│   ├── 02-referencial.tex
│   ├── 03-metodologia.tex
│   ├── 04-resultados.tex
│   └── 05-conclusao.tex
├── apendices/                ← Documentos elaborados pelo próprio autor
│   └── 01-apendice-a.tex     ← Ex: Roteiros de entrevista, questionários, provas de conceito
├── anexos/                   ← Documentos de terceiros não elaborados pelo autor
│   └── 01-anexo-a.tex        ← Ex: Regulamentos, pareceres de comitê de ética, certidões
├── figuras/                  ← Diagramas e ilustrações vetoriais
│   ├── exemplo-diagrama.mmd  ← Código declarativo Mermaid versionado no Git
│   └── exemplo-diagrama.pdf  ← PDF vetorial compilado com corte automático (pdfcrop)
└── build/                    ← Pasta isolada de compilação (gerada automaticamente pelo latexmk)
```

---

## 🛠️ Comandos de Compilação e Diagnóstico

A compilação e a manutenção do template são gerenciadas exclusivamente através da raiz do projeto via `Makefile` (Linux/macOS) ou `make.bat` (Windows):

| Comando (Windows) | Comando (Linux/Mac) | Finalidade |
| :--- | :--- | :--- |
| `.\make.bat build` | `make build` | **Compilação enxuta:** Converte `main.tex` em PDF na pasta `src/build/` resolvendo dependências via `latexmk` + `biber`. |
| `.\make.bat figures` | `make figures` | **Diagramas como código:** Varre `src/figuras/*.mmd` e compila para PDF vetorial recortado (`pdfcrop`). |
| `.\make.bat check` | `make check` | **Auditoria inteligente:** Detecta erros, espaços excessivos (`Underfull \vbox`), vazamento de margem (`Overfull \hbox`), citações órfãs e linter de redação ABNT. |
| `.\make.bat portal` | `make portal` | **Portal Web:** Extrai metadados reais do LaTeX/PDF e gera a vitrine web em `public/index.html` para o GitHub Pages. |
| `.\make.bat update` | `make update` | **Sincronização do Template:** Conecta ao repositório oficial e atualiza automações e regras ABNT preservando seu texto. |
| `.\make.bat all` | `make all` | **Pipeline completo:** Executa sequencialmente `figures` → `build` → `clean`. |
| `.\make.bat clean` | `make clean` | **Limpeza leve:** Remove arquivos intermediários (`.aux`, `.log`, `.bbl`, etc.), preservando o PDF final. |
| `.\make.bat cleanall` | `make cleanall` | **Limpeza total:** Remove todos os artefatos gerados, incluindo o PDF. |

---

## 📐 Padrões Tipográficos e Normas ABNT Vigentes

As definições consolidadas em `src/config.tex` atendem com rigor aos padrões acadêmicos do IFS:

| Especificação | Padrão Adotado | Racional / Norma |
| :--- | :--- | :--- |
| **Classe Base** | `abntex2` (baseado em `memoir`) | Suporte canônico para trabalhos acadêmicos no Brasil. |
| **Tipografia** | **Palatino** (`mathpazo` + `microtype`) | Alta legibilidade em tela e papel, inclusa nativamente no TeX Live / MiKTeX. |
| **Mecanismo de Citação** | **BibLaTeX** com estilo `abnt` | Ordenação alfabética rígida por Autor-Título-Ano (`sorting=nty`). |
| **Espaçamento Bibliográfico** | `\setlength{\bibitemsep}{\baselineskip}` | 1 linha de espaço em branco entre referências distintas (ABNT NBR 6023). |
| **Margens da Página** | 3 cm (superior e esquerda), 2 cm (inferior e direita) | Padrão ABNT NBR 14724 para encadernação e margem de corte. |
| **Espaçamento do Texto** | 1,5 entre linhas (`\OnehalfSpacing`) | Norma padrão do corpo do trabalho. |
| **Recuo de Parágrafo** | 1,25 cm (`\parindent`) | Padrão uniforme no início de parágrafos. |
| **Citações Longas (≥ 4 linhas)** | Recuo de 4,0 cm com espaçamento simples e fonte 10 | Ambiente `\begin{citacao} ... \end{citacao}`. |

---

## 📝 Convenções de Escrita e Citações

### Citações no Texto (`biblatex-abnt` / NBR 10520)

```latex
% Citação indireta com autor no texto:
Segundo \citeonline{silva2026}, as arquiteturas baseadas em RAG...
% ou
Conforme apontado por \textcite{silva2026}...

% Citação indireta entre parênteses no final da frase:
... com melhoria comprovada na acurácia das respostas \cite{silva2026}.

% Múltiplas referências:
... abordagens consolidadas na literatura \cite{silva2026,microsoft2026}.

% Citação direta curta (até 3 linhas, entre aspas duplas):
Conforme \citeonline{silva2026}, ``o uso de embeddings otimiza a recuperação'' (p. 42).

% Citação direta longa (mais de 3 linhas):
\begin{citacao}
O Model Context Protocol estabelece uma camada padronizada de comunicação
entre assistentes inteligentes e sistemas de arquivos locais, viabilizando
a interoperabilidade sem a necessidade de acoplamento rígido ao servidor.
\end{citacao}
```

### Inclusão de Figuras e Diagramas (ABNT)

```latex
\begin{figure}[htbp]
    \centering
    \caption{Fluxo de Integração e Orquestração de Agentes}
    \includegraphics[width=0.85\textwidth]{figuras/exemplo-diagrama.pdf}
    \fonte{Elaborado pelo autor (\the\year).}
    \label{fig:fluxo-integracao}
\end{figure}
```

Referência cruzada no texto: `como ilustrado na \autoref{fig:fluxo-integracao}`.

---

## 📊 Diagramas como Código (Mermaid)

Para adicionar novos diagramas ao TCC:
1. Crie um arquivo `.mmd` dentro da pasta `src/figuras/` (ex: `src/figuras/arquitetura.mmd`).
2. Execute `make figures` (ou `.\make.bat figures`). O Mermaid CLI compilará para PDF vetorial recortado sem bordas brancas sobressalentes.
3. Se preferir não usar Node.js, você pode desenhar o diagrama online em [mermaid.live](https://mermaid.live), exportar em PDF e salvar diretamente em `src/figuras/`.

---

## 🤖 Integração com Agentes de IA e MCP

Este template é otimizado para interação com ferramentas de IA através das *Skills* em `.agents/skills/`:
- `academic_writing_style`: Assegura tom impessoal, ordem direta e proíbe vícios de linguagem.
- `bibliographic_research`: Pesquisa fontes qualificadas e mantém `src/referencias.bib` em conformidade.
- `error_triage`: Separa erros de conteúdo dos erros de configuração institucional.
- `tcc_bridge_workflow`: Orquestra a leitura de comentários de revisão no Google Docs via MCP e sincroniza com o LaTeX.

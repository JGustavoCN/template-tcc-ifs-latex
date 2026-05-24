# 📄 TCC — Projeto LaTeX (abnTeX2 / ABNT)

> **Avaliação Experimental de Arquiteturas Baseadas em RAG e Model Context Protocol
> no Cruzamento de Dados Acadêmicos: Um Estudo no Instituto Federal de Sergipe**
>
> Autor: José Gustavo Correia Nascimento  
> Curso: Bacharelado em Sistemas de Informação — IFS Campus Lagarto  
> Ano: 2026

---

## 📁 Estrutura do Projeto

```
docs/tcc/
├── main.tex                  ← Arquivo principal (abnTeX2)
├── referencias.bib           ← Referências bibliográficas (BibTeX)
├── README.md                 ← Este arquivo
└── capitulos/
    ├── introducao.tex        ← Cap. 1 — Introdução
    ├── fundamentacao.tex     ← Cap. 2 — Fundamentação Teórica
    ├── metodologia.tex       ← Cap. 3 — Metodologia
    ├── resultados.tex        ← Cap. 4 — Resultados e Discussão
    └── conclusao.tex         ← Cap. 5 — Considerações Finais
```

---

## 🔄 Sincronização com Google Docs

Este projeto é sincronizado automaticamente com o Google Docs
através de um **servidor MCP local** (`server_tcc.py`).

### Como funciona

```
Google Docs (orientador comenta)
       │
       ▼
 server_tcc.py (MCP)
  ├── list_doc_comments()   → Lê comentários do professor
  ├── read_doc_content()    → Lê texto estruturado do documento
  └── update_local_latex()  → Escreve no main.tex local
       │
       ▼
 docs/tcc/*.tex (atualizado)
       │
       ▼
 Overleaf / pdflatex (compilação)
```

### Comando rápido

No chat da IDE, basta digitar:

```
"Atualize o TCC com as correções do Docs."
```

O agente seguirá a skill `tcc-docs-latex` automaticamente.

### ID do Documento

```
1x97nc97Ex-3RdTyhhAqnTFXi4fRrkQEDc4dOVhv4xPI
```

---

## 🔧 Como compilar

### Opção 1 — Overleaf (recomendado)

1. Faça upload de todos os arquivos (`main.tex`, `referencias.bib`, pasta `capitulos/`)
2. O Overleaf detecta automaticamente o `abntex2`
3. Clique em **Recompile**

### Opção 2 — Local (pdflatex + bibtex)

```bash
cd docs/tcc
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

Ou com `latexmk` (uma vez só):

```bash
latexmk -pdf main.tex
```

---

## 📐 Classe e Normas

| Item              | Valor                                       |
|-------------------|---------------------------------------------|
| Classe            | `abntex2` (não `article`)                   |
| Citações          | `abntex2cite` com opção `alf` (autor-data)  |
| Normas seguidas   | NBR 14724, NBR 10520, NBR 6023, NBR 6028    |
| Margens           | 3cm (sup/esq), 2cm (inf/dir)                |
| Fonte             | Latin Modern, 12pt                          |
| Espaçamento       | 1,5 entre linhas                            |
| Recuo de parágrafo| 1,25 cm                                     |

---

## 📝 Convenções de escrita no LaTeX

### Citações (NBR 10520)

```latex
% Citação indireta no texto: Autor (ano)
\citeonline{feitoza2021} afirma que...

% Citação indireta entre parênteses: (AUTOR, ano)
... como demonstrado em pesquisas recentes \cite{feitoza2021}.

% Múltiplos autores
\cite{feitoza2021,silva2022}

% Citação direta curta (< 3 linhas)
Segundo \citeonline{neves2024}, ``texto citado'' (p. 12).

% Citação direta longa (≥ 3 linhas)
\begin{citacao}
Texto longo citado, com recuo de 4cm automático.
\end{citacao}
```

### Termos estrangeiros (itálico)

```latex
\textit{software}, \textit{chatbot}, \textit{dataset},
\textit{Model Context Protocol}, \textit{Retrieval-Augmented Generation}
```

### Siglas (primeira ocorrência por extenso)

```latex
Instituições Federais de Ensino (IFEs)
Modelos de Linguagem de Grande Escala (LLMs)
```

---

## ⚠️ Comentários do Orientador (tags)

O professor usa tags nos comentários do Google Docs:

| Tag       | Significado                                         |
|-----------|-----------------------------------------------------|
| `[CT02]`  | Correção de citação (NBR 10520)                     |
| `[TE01]`  | Termo estrangeiro deve estar em itálico              |
| `[REF01]` | Formatação de referências (NBR 6023)                 |
| `[Sugestão]` | Sugestão de melhoria de conteúdo                 |
| `[Correção]` | Correção genérica                                |

---

## 🔒 Segurança

- `credentials.json` (Service Account) está no `.gitignore`
- `*.bak` (backups automáticos) está no `.gitignore`
- A API do SUAP é acessada em modo **read-only**

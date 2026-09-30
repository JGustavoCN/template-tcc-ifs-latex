---
name: Pesquisa Bibliográfica e Gestão de Referências (ABNT)
description: Diretrizes e procedimentos para pesquisar literatura científica, gerenciar o arquivo src/referencias.bib e aplicar citações corretas (ABNT NBR 6023 e 10520) no TCC.
---

# Pesquisa Bibliográfica e Gestão de Referências (ABNT)

## Objective

Garantir que todas as afirmações conceituais, fundamentações teóricas e revisões de literatura do TCC sejam embasadas em fontes científicas idôneas, devidamente catalogadas no arquivo [`src/referencias.bib`](../../src/referencias.bib) e citadas conforme as normas da ABNT.

---

## Workflow de Pesquisa e Citação

### 1. Consulta Prévia Obrigatória ao `src/referencias.bib`
- **Antes de qualquer escrita teórica:** Abra e inspecione [`src/referencias.bib`](../../src/referencias.bib).
- Verifique se os autores ou obras relevantes já constam na base do projeto.
- Dê prioridade a construir os argumentos e fundamentações sobre as referências já adotadas no trabalho.

### 2. Critérios de Pesquisa Científica Qualificada
Quando for necessário embasar novos conceitos ou expandir o referencial teórico:
- **Fontes recomendadas:**
  - Artigos de periódicos indexados (CAPES, SciELO, IEEE, ACM, Springer, Elsevier).
  - Anais de conferências de renome (Simpósios e Congressos da SBC, IEEE, ACM).
  - Livros-texto de referência e teses/dissertações acadêmicas.
  - Documentações técnicas oficiais de tecnologias abordadas no TCC.
- **Evitar:** Artigos de blogs informais, fóruns sem curadoria ou fontes sem autoria verificável para conceitos fundamentais.

### 3. Padrão de Cadastro no `src/referencias.bib`
Toda nova entrada no `.bib` deve conter todos os campos obrigatórios da ABNT:

- **Artigo em Periódico (`@article`):**
  ```bibtex
  @article{sobrenomeAno,
      author = {Nome do Autor},
      title = {Título do Artigo},
      journal = {Nome do Periódico Científico},
      year = {2026},
      volume = {10},
      number = {2},
      pages = {45--60}
  }
  ```
- **Livro (`@book`):**
  ```bibtex
  @book{sobrenomeAno,
      author = {Nome do Autor},
      title = {Título do Livro},
      publisher = {Editora},
      address = {Local de Publicação},
      year = {2024}
  }
  ```
- **Trabalho em Congresso/Conferência (`@inproceedings`):**
  ```bibtex
  @inproceedings{sobrenomeAno,
      author = {Nome do Autor},
      title = {Título do Artigo Publicado},
      booktitle = {Anais do Simpósio Brasileiro de Sistemas de Informação (SBSI)},
      year = {2025},
      pages = {100--112}
  }
  ```
- **Documento Online ou Página Web (`@online`):**
  ```bibtex
  @online{chaveIdentificadora,
      author = {{Nome da Organização ou Autor}},
      title = {Título da Página ou Documentação Técnica},
      year = {2026},
      url = {https://exemplo.org/documento},
      urldate = {2026-05-24}
  }
  ```

### 4. Casamento de Citação no Texto (ABNT NBR 10520)
No corpo dos capítulos em `src/capitulos/`:
- **Citação indireta entre parênteses (fim de frase):**
  - Use `\cite{chave}` -> Produz: *(SILVA, 2026)*.
- **Citação com o autor integrando o texto (no discurso):**
  - Use `\citeonline{chave}` ou `\textcite{chave}` -> Produz: *segundo Silva (2026)*.
- **Regra de Ouro:** Jamais crie ou altere uma citação no texto sem antes garantir a entrada no `src/referencias.bib`.

### 5. Auditoria Obrigatória pós-edição
Após qualquer inclusão de citações ou edição no `.bib`:
- Execute `make check` (ou `node scripts/check.js --json`).
- O auditor verificará se o compilador LaTeX e o Biber resolveram todas as referências sem deixar chaves órfãs (`missingCitations` ou `LaTeX Warning: Citation undefined`).

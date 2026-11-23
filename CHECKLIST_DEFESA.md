# 🎓 Checklist de Defesa e Entrega Final do TCC (IFS)

> Guia prático baseado no fluxo institucional de Trabalho de Conclusão de Curso do **Instituto Federal de Educação, Ciência e Tecnologia de Sergipe (IFS)** (referência: **IN 06/2024** e normas ABNT NBR 14724 / 6023 / 10520).
>
> **⚠️ Atenção aos prazos:** Confirme sempre as datas exatas no calendário acadêmico do semestre vigente e nas orientações da Coordenação do Curso / SUAP.

---

## 📋 Fase 1 — Validação Técnica no Template (Antes de Enviar à Banca)

- [ ] **Compilar diagramas e PDF final do zero:**
  ```bash
  .\make.bat all          # Windows
  make all                # Linux / macOS
  ```
- [ ] **Executar auditoria completa sem erros nem avisos:**
  ```bash
  .\make.bat check --floats
  ```
  - [ ] `Total de Erros: 0` e `Total de Avisos: 0`.
  - [ ] Nenhum `Overfull \hbox` (vazamento de margem em texto ou nas Listas de Tabelas/Figuras/Quadros).
  - [ ] Nenhum *Float Drift* (tabela/figura vazando para seção/subseção seguinte).
- [ ] **Conferir elementos pré-textuais e metadados ([src/metadados.tex](./src/metadados.tex)):**
  - [ ] Título, nome completo do autor, orientador (e coorientador, se houver) sem abreviações indevidas.
  - [ ] Nomes e instituições dos avaliadores da banca preenchidos (`\bancaum`, `\bancadois`, etc.).
  - [ ] Resumo (pt-BR) e Abstract (en) revisados, com palavras-chave separadas por ponto.
  - [ ] Lista de Abreviaturas e Siglas (`src/pre-textuais.tex`) em ordem alfabética, contendo todas as siglas usadas no texto.
- [ ] **Conferir diferenciação ABNT/IBGE:**
  - [ ] Dados textuais/comparativos formatados em `\begin{quadro}` (bordas fechadas, listados na `LISTA DE QUADROS`).
  - [ ] Dados numéricos/estatísticos formatados em `\begin{table}` com `booktabs` (bordas laterais abertas, listados na `LISTA DE TABELAS`).
  - [ ] Todas as figuras, quadros e tabelas possuem `\caption`, `\fonte` e são citadas no texto via `\autoref{...}`.
- [ ] **Conferir referências ([src/referencias.bib](./src/referencias.bib)):**
  - [ ] Todas as obras citadas aparecem nas Referências em ordem alfabética (ABNT NBR 6023).
  - [ ] Nenhuma citação órfã (`[?]`) ou aviso pendente do Biber.

---

## 📨 Fase 2 — Submissão à Banca e Agendamento (SUAP / Orientador)

- [ ] **Validar versão de defesa com o orientador** antes do envio formal à banca.
- [ ] **Conferir abertura/agendamento do processo no SUAP** (formulários de composição da banca, data, horário e local/link da defesa).
- [ ] **Enviar o PDF da versão de defesa aos membros da banca** respeitando a antecedência mínima exigida pela norma vigente (geralmente **15 dias** — confirmar com a coordenação do curso).
- [ ] *(Opcional)* **Disponibilizar também o link público do Portal Web (GitHub Pages)** para facilitar a leitura rápida em dispositivos móveis e cópia de citações.
- [ ] **Preparar a apresentação (slides + demonstração prática do sistema, se houver):**
  - [ ] Testar o tempo de fala dentro do limite da banca (tipicamente 15 a 20 minutos).
  - [ ] Garantir plano B (vídeo gravado ou capturas locais) caso a internet/servidor falhe na demonstração.

---

## 🛠️ Fase 3 — Pós-Defesa: Correções da Banca e Ficha Catalográfica

- [ ] **Registrar todas as correções solicitadas na Ata de Defesa.**
- [ ] **Aplicar as alterações nos capítulos em `src/capitulos/`** e gerar o relatório visual de prestação de contas para o orientador:
  ```bash
  .\make.bat diff --html   # Gera src/build/diff.html com Antes vs. Depois
  ```
- [ ] **Atualizar a data oficial de aprovação** em `\dataaprovacao{...}` no arquivo [src/metadados.tex](./src/metadados.tex).
- [ ] **Solicitar a Ficha Catalográfica à Biblioteca do IFS** (via sistema/formulário da biblioteca do campus com o PDF corrigido em mãos).
- [ ] **Inserir o PDF da Ficha Catalográfica no verso da Folha de Rosto:**
  1. Salve o PDF recebido em `src/figuras/ficha-catalografica.pdf`.
  2. Descomente a linha `\inserirfichacatalografica{figuras/ficha-catalografica.pdf}` em [src/main.tex](./src/main.tex).
- [ ] **Rodar a auditoria final (`.\make.bat all` e `.\make.bat check --floats`)** confirmando `0 erros` e `0 avisos`.

---

## 🏛️ Fase 4 — Entrega Definitiva e Depósito Institucional

- [ ] **Colher assinaturas** na Folha de Aprovação / Ata de Defesa (conforme procedimento físico ou eletrônico via SUAP).
- [ ] **Preencher o Termo de Autorização de Publicação** para o Repositório Institucional do IFS (RI-IFS).
- [ ] **Realizar o depósito da versão final aprovada (PDF/A ou PDF conforme exigido pela biblioteca)** no processo do SUAP / Repositório Institucional dentro do prazo regulamentar pós-defesa.
- [ ] **Arquivar a entrega oficial no GitHub** com tag semântica e Portal Web atualizado:
  ```bash
  git tag -a v1.0-versao-final -m "Versão final aprovada pela banca (IFS)"
  git push origin main --tags
  ```

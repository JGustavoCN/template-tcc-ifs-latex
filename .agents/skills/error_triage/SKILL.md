---
name: Triagem de Erros
description: Diretrizes para diagnosticar e resolver erros de compilação, diagramação e geometria do PDF em LaTeX, separando problemas de template (core) de problemas de conteúdo (usuário).
---

# Triagem de Erros (Template vs. Conteúdo) e Rotina Pós-Build

## Objective

Diagnosticar rapidamente erros de compilação, vazamentos de margem, desalinhamento de flutuadores e quebras geométricas no PDF compilado, adotando a estratégia correta antes de modificar o código e preservando a integridade da arquitetura ABNT.

## Workflow Obrigatório de Diagnóstico e Validação Pós-Build

Sempre que editar capítulos, tabelas, quadros, figuras ou listas — **e SEMPRE antes de executar `make clean`** — siga esta sequência:

1. **Compilação + Triagem Completa (`check --json`):**
   - Execute `.\make.bat check --json` (Windows) ou `make check --json` (Linux/Mac). O comando realiza auto-build se o log estiver ausente/desatualizado e retorna em JSON estruturado:
     - `buildDiagnostics`: erros fatais (`compilationErrors`), `Overfull \hbox` com arquivo/linha exata (incluindo `main.lot`/`main.lof`/`main.loq` $\to$ `.tex`), `Underfull \vbox`, `missingReferences`, `missingCitations` e avisos do Biber.
     - `layoutAudit`: auditoria do preâmbulo (`config.tex`), proporções `/MediaBox` de figuras PDF, `floatDrifts` e `floatCongestions`.
     - `geometryAudit`: inspeção geométrica real do PDF (`pdftotext -bbox-layout` ou fallback `PyMuPDF`), cobrindo estouro físico de margem direita (`marginOverflows`), margem inferior (`bottomOverflows`), flutuadores cortando parágrafos/listas na mesma página ou no topo da página (`splitParagraphs`), hifenizações atravessando virada de página (`hyphenatedPageBreaks`) e tinta real (`--ink` via Ghostscript).
     - `textAudit`: conformidade ABNT (`\caption`, `\fonte`, `\label`, `\caption[curto]{longo}`) e estilo científico.

2. **Inspeção Visual em PNG das Páginas Afetadas:**
   - Após qualquer ajuste em tabelas, quadros, figuras ou listas (ou quando `check` apontar alertas em páginas específicas), renderize as páginas em PNG antes de considerar o problema resolvido:
     - `.\make.bat preview --issues` (renderiza automaticamente as páginas com alertas do último `check`), ou
     - `.\make.bat preview <pag>` / `.\make.bat preview <inicio>-<fim>`.
   - Inspecione visualmente as imagens geradas em `src/build/previews/` para confirmar ausência de cortes de números de página, sobreposições ou espaços anômalos.

3. **Regra Anti-Efeito Cascata (Reauditoria Obrigatória):**
   - Ao inserir `\FloatBarrier` ou redimensionar/reposicionar uma tabela ou figura, o deslocamento do fluxo textual pode fazer outro flutuador 1 ou 2 páginas adiante cortar um parágrafo ou lista.
   - **Nunca pare na primeira correção:** após aplicar correções de flutuadores, reexecute `check --json` (com auto-build) para garantir que `geometryAudit.splitParagraphs`, `layoutAudit.floatDrifts` e `buildDiagnostics.layoutIssues.overfullHbox` estejam todos zerados.

4. **Classificação da Causa Raiz (Template vs. Conteúdo):**
   - **Erro de Template (Core):**
     - *Sintoma:* Falhas em pacotes, conflitos de dependências, falta de `\brokenpenalty=10000` / `placeins` ou bugs nas macros de `src/config.tex`.
     - *Ação:* Solicite permissão explícita do usuário antes de alterar a Área Restrita (`src/config.tex`), conforme a skill `architecture_guardian`.
   - **Erro de Conteúdo (Usuário):**
     - *Sintoma:* Chaves não fechadas, `\cite` ausente em `src/referencias.bib`, tabela larga sem `\small`/`\resizebox`, `\caption` com `\texttt`/`$` sem título curto `\caption[...]{...}` causando estouro em `main.lot`/`main.lof`, ou flutuador exigindo `\FloatBarrier` pontual.
     - *Ação:* Corrija pontualmente o arquivo `.tex` correspondente em `src/capitulos/` (ou `src/referencias.bib`), preservando a semântica autoral.

5. **Limpeza Apenas no Final:**
   - Só execute `make clean` (`.\make.bat clean`) **após** concluir toda a validação (`check` + `preview`), pois `clean` remove `.log`, `.aux`, `.lot`, `.lof` e `.toc` necessários para a auditoria.

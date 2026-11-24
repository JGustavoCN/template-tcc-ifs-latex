# Guia Metodológico: Como Construir o Capítulo de Desenvolvimento da Solução em Trabalhos Acadêmicos e Tecnológicos

> **Fundamentação Epistemológica:** Diretrizes clássicas de estruturação lógica, argumentação demonstrativa e redação científica extraídas diretamente dos manuais de **Lakatos e Marconi (2003)** e **Severino (2017)**.  
> **Finalidade:** Servir como manual de referência técnica, lógica e discursiva para planejar, estruturar, redigir e defender o **Capítulo de Desenvolvimento da Solução** (Engenharia de Software e Construção de Artefatos) em Trabalhos de Conclusão de Curso (TCC), dissertações e relatórios técnicos em Computação e Sistemas de Informação.  
> **Aplicação Específica:** TCC em Sistemas de Informação (IFS *Campus* Lagarto) — Solução tecnológica para validação normativa com Model Context Protocol (MCP), Recuperação Aumentada por Geração (RAG) e supervisão *Human-in-the-Loop* (HITL).

---

## Sumário

0. [Localização das Fontes nos PDFs de Referência](#0-localização-das-fontes-nos-pdfs-de-referência)
1. [O que é o Desenvolvimento segundo Lakatos/Marconi e Severino?](#1-o-que-é-o-desenvolvimento-segundo-lakatosmarconi-e-severino)
   - [1.1 O Desenvolvimento como o "Corpo do Trabalho" (*Corpus*)](#11-o-desenvolvimento-como-o-corpo-do-trabalho-corpus)
   - [1.2 O Discurso Dissertativo: Demonstrar uma Tese Mediante Argumentos](#12-o-discurso-dissertativo-demonstrar-uma-tese-mediante-argumentos)
   - [1.3 Fronteiras Lógicas: O que vai na Metodologia, no Desenvolvimento e nos Resultados?](#13-fronteiras-lógicas-o-que-vai-na-metodologia-no-desenvolvimento-e-nos-resultados)
2. [A Tríade Canônica da Reconstrução Racional: Explicar, Discutir e Demonstrar](#2-a-tríade-canônica-da-reconstrução-racional-explicar-discutir-e-demonstrar)
   - [2.1 O Estágio da Explicação (Descrever, Classificar e Definir)](#21-o-estágio-da-explicação-descrever-classificar-e-definir)
   - [2.2 O Estágio da Discussão (O Confronto Dialético de Posições e Alternativas)](#22-o-estágio-da-discussão-o-confronto-dialético-de-posições-e-alternativas)
   - [2.3 O Estágio da Demonstração (Da Premissa Garantida à Nova Evidência)](#23-o-estágio-da-demonstração-da-premissa-garantida-à-nova-evidência)
3. [Técnicas de Argumentação Científica Aplicadas à Engenharia (Galliano / Lakatos)](#3-técnicas-de-argumentação-científica-aplicadas-à-engenharia-galliano--lakatos)
   - [3.1 Técnica de Progressão (O Encadeamento Causal Rígido)](#31-técnica-de-progressão-o-encadeamento-causal-rígido)
   - [3.2 Técnica de Oposição (O Contraste Dialético para Justificar Decisões)](#32-técnica-de-oposição-o-contraste-dialético-para-justificar-decisões)
   - [3.3 Técnica de Cronologia (A Trajetória Iterativa das Fases de Engenharia)](#33-técnica-de-cronologia-a-trajetória-iterativa-das-fases-de-engenharia)
4. [A Estrutura Canônica do Capítulo de Desenvolvimento em TCCs de Tecnologia](#4-a-estrutura-canônica-do-capítulo-de-desenvolvimento-em-tccs-de-tecnologia)
   - [Seção 1: Visão Geral e Trajetória de Engenharia da Solução](#seção-1-visão-geral-e-trajetória-de-engenharia-da-solução)
   - [Seção 2: Requisitos de Software Implementados](#seção-2-requisitos-de-software-implementados)
   - [Seção 3: Arquitetura do Sistema e Integração de Contextos](#seção-3-arquitetura-do-sistema-e-integração-de-contextos)
   - [Seção 4: Decisões Arquiteturais Estruturantes](#seção-4-decisões-arquiteturais-estruturantes)
   - [Seção 5: Implementação do Servidor MCP e Contratos das Ferramentas](#seção-5-implementação-do-servidor-mcp-e-contratos-das-ferramentas)
   - [Seção 6: Modelagem das Regras Normativas do ROD](#seção-6-modelagem-das-regras-normativas-do-rod)
   - [Seção 7: Interface Visual MCP Apps e Supervisão Humana (HITL)](#seção-7-interface-visual-mcp-apps-e-supervisão-humana-hitl)
   - [Seção 8: Validação Técnica, Rastreabilidade e Disponibilização dos Artefatos](#seção-8-validação-técnica-rastreabilidade-e-disponibilização-dos-artefatos)
5. [Como Escrever o Texto Técnico: Parágrafos, Figuras, Códigos e Tabelas](#5-como-escrever-o-texto-técnico-parágrafos-figuras-códigos-e-tabelas)
   - [5.1 A Microestrutura do Parágrafo Científico (Severino)](#51-a-microestrutura-do-parágrafo-científico-severino)
   - [5.2 Diretrizes para Inclusão de Figuras, Tabelas e Códigos (Lakatos & Marconi)](#52-diretrizes-para-inclusão-de-figuras-tabelas-e-códigos-lakatos--marconi)
   - [5.3 Estilo e Tom: Linguagem Cognoscitiva, Impessoal e Concisa](#53-estilo-e-tom-linguagem-cognoscitiva-impessoal-e-concisa)
6. [Armadilhas Críticas a Evitar no Capítulo de Desenvolvimento](#6-armadilhas-críticas-a-evitar-no-capítulo-de-desenvolvimento)
7. [Checklist de Auditoria e Autoavaliação do Capítulo](#7-checklist-de-auditoria-e-autoavaliação-do-capítulo)
8. [Referências Citadas](#8-referências-citadas)

---

## 0. Localização das Fontes nos PDFs de Referência

Para garantir rastreabilidade metodológica absoluta perante a banca examinadora, todas as diretrizes deste guia apoiam-se nas seguintes obras disponíveis na pasta `resources/references/`:

| Obra | Arquivo no Repositório | Edição | Localização no PDF |
| :--- | :--- | :--- | :--- |
| **LAKATOS, Eva Maria; MARCONI, Marina de Andrade.** *Fundamentos de Metodologia Científica*. | `lakatos2003-fundamentos-metodologia-cientifica.pdf` | 5. ed., Atlas, 2003. | Pág. do Livro = Pág. do PDF + 1.<br>Desenvolvimento: Livro p. 228–232 e 242–250 (PDF p. 227–231 e 241–249). |
| **SEVERINO, Antônio Joaquim.** *Metodologia do Trabalho Científico*. | `severino2017-metodologia-trabalho-cientifico-24ed.pdf` | 24. ed., Cortez, 2017. | Pág. do Livro = Pág. do PDF direta (1:1).<br>Estrutura Lógica: p. 91–98.<br>Corpo do Trabalho: p. 181–186.<br>TCC e Monografia: p. 235–241. |

---

## 1. O que é o Desenvolvimento segundo Lakatos/Marconi e Severino?

Um erro recorrente em cursos de graduação em tecnologia é transformar o capítulo de desenvolvimento em um simples "diário de bordo de programação" (ex.: *"no dia tal instalamos o pacote X e criamos a rota Y"*) ou em um mero "manual de usuário / documentação de API" com códigos jogados sem contextualização lógica.

Para a literatura científica clássica, o desenvolvimento é o **núcleo demonstrativo do trabalho**.

### 1.1 O Desenvolvimento como o "Corpo do Trabalho" (*Corpus*)

Severino (2017, p. 182) ensina que todo trabalho acadêmico possui três partes fundamentais — introdução, desenvolvimento e conclusão — e que:

> *"O desenvolvimento corresponde ao corpo do trabalho e será estruturado conforme as necessidades do plano definitivo da obra.*  
> *As subdivisões dos tópicos do plano lógico, os itens, seções, capítulos etc. surgem da exigência da logicidade e da necessidade de clareza e não de um critério puramente espacial.*  
> *Não basta enumerar simetricamente os vários itens: é preciso que haja subtítulos portadores de sentido. Em trabalhos científicos, todos os títulos de capítulos ou de outros itens devem ser temáticos e expressivos, ou seja, devem dar a ideia exata do conteúdo do setor que intitulam."*  
> — **SEVERINO (2017, p. 182, seção 4.2.2)**

Lakatos e Marconi (2003, p. 248) reforçam que o desenvolvimento:

> *"Parte principal do corpo da tese [ou dissertação/monografia]. Descreve o desenvolvimento e apresenta os resultados obtidos.*  
> *Compreende a revisão da literatura, os procedimentos metodológicos, a construção dos argumentos e a apresentação, análise e interpretação dos dados."*  
> — **LAKATOS; MARCONI (2003, p. 248, item 11.4.4.2)**

### 1.2 O Discurso Dissertativo: Demonstrar uma Tese Mediante Argumentos

Severino (2017, p. 91–92, seção 2.3) destaca a essência lógica que diferencia um trabalho acadêmico de um texto puramente técnico ou publicitário:

> *"O trabalho científico em geral, do ponto de vista lógico, é um discurso completo. [...] No sentido em que é tratado neste texto, o trabalho científico assume a forma dissertativa, pois seu objetivo é demonstrar, mediante argumentos, uma tese, que é uma solução proposta para um problema, relativo a determinado tema.*  
> *A demonstração baseia-se num processo de reflexão por argumentação, ou seja, baseia-se na articulação de ideias e fatos, portadores de razões que comprovem aquilo que se quer demonstrar.*  
> *Esses argumentos fundam-se nas conclusões dos raciocínios e nas conclusões dos processos de levantamento e caracterização dos fatos."*  
> — **SEVERINO (2017, p. 91, seção 2.3)**

Em outras palavras: **a solução de engenharia (o software, o servidor MCP, a arquitetura) é o argumento concreto do pesquisador para provar que a sua tese tecnológica funciona e resolve o problema delimitado**.

### 1.3 Fronteiras Lógicas: O que vai na Metodologia, no Desenvolvimento e nos Resultados?

Para que o texto tenha clareza cristalina perante a banca, cada capítulo desempenha uma função epistemológica distinta:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                       DIVISÃO DO CORPO DO TRABALHO                            │
├───────────────────────┬───────────────────────────────────────────────────────┤
│ CAPÍTULO              │ PAPEL EPISTEMOLÓGICO SEGUNDO LAKATOS E SEVERINO       │
├───────────────────────┼───────────────────────────────────────────────────────┤
│ Capítulo 2:           │ • O QUE JÁ SE SABE (O Estado da Arte e Teoria de Base) │
│ Referencial Teórico   │ • Conceitua e delimita os fundamentos teóricos.       │
│                       │ • Mapeia a literatura e trabalhos relacionados.      │
├───────────────────────┼───────────────────────────────────────────────────────┤
│ Capítulo 3:           │ • A TEORIA DO MÉTODO (O Plano de Investigação)         │
│ Metodologia           │ • Formulação de hipóteses, variáveis e oráculo.       │
│                       │ • Delineamento experimental e protocolo de medição.   │
│                       │ • Explica COMO será medido e testado, não o código.   │
├───────────────────────┼───────────────────────────────────────────────────────┤
│ Capítulo 4:           │ • A CONSTRUÇÃO DO ARTEFATO (A Engenharia da Solução)  │
│ Desenvolvimento       │ • Especificação de requisitos e escopo (MVP).         │
│                       │ • Decisões arquiteturais fundamentadas (ADRs).        │
│                       │ • Modelagem de regras, componentes, fluxos e HITL.    │
│                       │ • Validação técnica de integridade da solução.        │
├───────────────────────┼───────────────────────────────────────────────────────┤
│ Capítulo 5:           │ • AS EVIDÊNCIAS EMPÍRICAS (O Teste da Hipótese)       │
│ Resultados e          │ • Apresentação quantitativa dos dados coletados.      │
│ Discussão             │ • Confronto entre hipótese teórica e dados reais.     │
│                       │ • Interpretação crítica, limitações e implicações.    │
└───────────────────────┴───────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **A regra de ouro:**  
> - Se descreve **como você planejou o experimento, quais hipóteses formulou e quais métricas usará**, pertence à **Metodologia** (Capítulo 3).  
> - Se descreve **como o sistema foi concebido, por que foi arquitetado dessa forma, como as regras foram modeladas e como os componentes se integram**, pertence ao **Desenvolvimento** (Capítulo 4).  
> - Se apresenta **os números da medição experimental, as tabelas de conformidade (TCD) e a confirmação/refutação da hipótese**, pertence aos **Resultados** (Capítulo 5).

---

## 2. A Tríade Canônica da Reconstrução Racional: Explicar, Discutir e Demonstrar

Tanto Severino (2017, p. 182) quanto Lakatos e Marconi (2003, p. 243), amparados na clássica formulação de Salomon (1973, p. 273), estipulam que o desenvolvimento do discurso científico organiza-se em **três momentos intelectuais**:

```
                       OS TRÊS ESTÁGIOS DO CORPO DO TRABALHO
                               (SALOMON, 1973)

         ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
         │  1. EXPLICAR │  ─────> │  2. DISCUTIR │  ─────> │3. DEMONSTRAR │
         └──────────────┘         └──────────────┘         └──────────────┘
          Tornar evidente          Comparar dialetica-      Aplicar a argu-
          o que era obscuro        mente posições e         mentação fática
          (Descrever e             alternativas de          partindo de pre-
          definir o objeto)        projeto (ADRs)           missas a provas
```

### 2.1 O Estágio da Explicação (Descrever, Classificar e Definir)

* **Definição de Severino (2017, p. 182):** *"Explicar é tornar evidente o que estava implícito, obscuro ou complexo; é descrever, classificar e definir."*
* **Definição de Lakatos e Marconi (2003, p. 248–249):** A conceituação consiste em ajustar os termos mais adequados para refletir a realidade com precisão. O conceito atua como instrumento de inteligibilidade dos fenômenos.
* **Aplicação no Capítulo de Desenvolvimento:**
  - Definir formalmente a arquitetura híbrida de injeção de contexto.
  - Classificar os requisitos em funcionais, não funcionais e restrições normativas institucionais.
  - Explicar os limites de responsabilidade de cada subsistema (cliente conversacional, orquestrador, servidor MCP, base normativa estruturada em JSON).

### 2.2 O Estágio da Discussão (O Confronto Dialético de Posições e Alternativas)

* **Definição de Severino (2017, p. 182):** *"Discutir é comparar as várias posições que se entrechocam dialeticamente."*
* **Aplicação no Capítulo de Desenvolvimento:**
  - Nenhuma decisão técnica pode parecer "arbitrária" ou "gosto pessoal" do aluno.
  - O autor deve apresentar o debate técnico: por que usar o *Model Context Protocol* (MCP) em vez de simples chamadas HTTP diretas (*custom tools*)?
  - Por que separar a verificação de conformidade em contratos tipados determinísticos (Zod) em vez de delegar tudo à inferência probabilística da LLM?
  - Esse estágio ganha materialidade técnica por meio dos **Registros de Decisões Arquiteturais (ADRs — *Architectural Decision Records*)**, onde prós, contras e opções descartadas são confrontados abertamente.

### 2.3 O Estágio da Demonstração (Da Premissa Garantida à Nova Evidência)

* **Definição de Severino (2017, p. 183):** *"Demonstrar é aplicar a argumentação apropriada à natureza do trabalho. É partir de verdades garantidas para novas verdades."*
* **Definição de Lakatos e Marconi (2003, p. 248):** *"Demonstração das relações existentes entre fato ou fenômeno estudados e outros fatores; interpretação crítica dos dados, verificando se os mesmos comprovam ou refutam as hipóteses."*
* **Aplicação no Capítulo de Desenvolvimento:**
  - Demonstrar que a arquitetura concebida atende aos requisitos através da **rastreabilidade estrita** (cada requisito amarrado a um componente e a um teste).
  - Apresentar diagramas de sequência que comprovem como o fluxo de supervisão humana (*Human-in-the-Loop*) impede a emissão de documentos inválidos.
  - Relatar testes preliminares de integração e provas de conceito (PoCs) que asseguram a viabilidade do artefato antes da bateria experimental formal.

---

## 3. Técnicas de Argumentação Científica Aplicadas à Engenharia (Galliano / Lakatos)

Lakatos e Marconi (2003, p. 248, citando Galliano, 1977, p. 130–131) ensinam que a construção do raciocínio no corpo do trabalho deve apoiar-se em três técnicas de argumentação:

### 3.1 Técnica de Progressão (O Encadeamento Causal Rígido)

* **Conceito:** Relacionamento dos elementos em sequência lógica rigorosa, na qual cada seção decorre necessariamente da anterior e prepara a posterior.
* **Aplicação Prática no TCC:** O desenvolvimento não pode dar "saltos lógicos". A progressão canônica em engenharia de software é:
  $$\text{Problema do Domínio} \longrightarrow \text{Requisitos} \longrightarrow \text{Escopo/MVP} \longrightarrow \text{Decisões de Design (ADRs)} \longrightarrow \text{Implementação} \longrightarrow \text{Validação}$$
  Se o autor discutir a implementação de uma ferramenta sem ter apresentado o requisito e a decisão arquitetural prévia, a progressão lógica foi quebrada.

### 3.2 Técnica de Oposição (O Contraste Dialético para Justificar Decisões)

* **Conceito:** Apresentação de duas ou mais abordagens contrastantes no enfrentamento do problema. Trata-se de um recurso valioso para justificar a relevância da proposta.
* **Aplicação Prática no TCC:** O capítulo deve contrastar a abordagem puramente paramétrica ou RAG textual não estruturado (suscetível a alucinações e incapaz de cruzar dados tabulares e prazos dinâmicos com segurança) com a abordagem proposta (arquitetura híbrida com MCP determinístico em dupla camada semântica e supervisão HITL). Esse contraste evidencia a superioridade técnica da solução projetada.

### 3.3 Técnica de Cronologia (A Trajetória Iterativa das Fases de Engenharia)

* **Conceito:** Organização baseada na sequência temporal dos acontecimentos.
* **Aplicação Prática no TCC:** Deve ser usada com moderação. Em vez de registrar um diário de tarefas pessoais, a cronologia deve estruturar a **trajetória de maturidade do artefato**: da exploração técnica preliminar e Provas de Conceito (PoCs) até a refatoração orientada aos achados da validação normativa.

> *"As técnicas mais empregadas [e recomendadas na ciência] são: a oposição e a progressão."*  
> — **LAKATOS; MARCONI (2003, p. 248)**

---

## 4. A Estrutura Canônica do Capítulo de Desenvolvimento em TCCs de Tecnologia

Com base nas exigências de logicidade de Severino (2017, p. 182) e no encadeamento progressivo de Lakatos e Marconi (2003, p. 248), adota-se a seguinte estrutura enxuta de 8 seções temáticas para o **Capítulo 4 (Desenvolvimento da Solução)**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             ESTRUTURA TEMÁTICA DO CAPÍTULO DE DESENVOLVIMENTO               │
├───────┬───────────────────────────────────┬─────────────────────────────────┤
│ SEÇÃO │ TÍTULO EXPRESSIVO                 │ OBJETIVO E PAPEL LÓGICO         │
├───────┼───────────────────────────────────┼─────────────────────────────────┤
│ 4.1   │ Visão Geral e Trajetória de       │ Papel do assistente auditável,  │
│       │ Engenharia da Solução             │ fluxo em 6 etapas e maturidade. │
├───────┼───────────────────────────────────┼─────────────────────────────────┤
│ 4.2   │ Requisitos de Software            │ Tabela coesa RF-01..12 (EARS) e │
│       │ Implementados                     │ RNF-01..08 (Wiegers/Planguage). │
├───────┼───────────────────────────────────┼─────────────────────────────────┤
│ 4.3   │ Arquitetura do Sistema e          │ Camadas, servidor stateless,    │
│       │ Integração de Contextos           │ modo dual Mock/SUAP e ponte.    │
├───────┼───────────────────────────────────┼─────────────────────────────────┤
│ 4.4   │ Decisões Arquiteturais            │ 39 ADRs em 5 eixos e técnica de │
│       │ Estruturantes                     │ oposição para decisões centrais.│
├───────┼───────────────────────────────────┼─────────────────────────────────┤
│ 4.5   │ Implementação do Servidor MCP     │ 4 tools, View, prompt, rota PDF,│
│       │ e Contratos das Ferramentas       │ envelopes, canais e Zod D1-D5.  │
├───────┼───────────────────────────────────┼─────────────────────────────────┤
│ 4.6   │ Modelagem das Regras Normativas   │ Dupla Camada Semântica, 19 ROD  │
│       │ do ROD                            │ (18 ativas + 1 revogada) e RN-T.│
├───────┼───────────────────────────────────┼─────────────────────────────────┤
│ 4.7   │ Interface Visual MCP Apps e       │ Folha A4 vs. CRE, WCAG 2.2 AA,  │
│       │ Supervisão Humana (HITL)          │ ModelContext, HITL e sequência. │
├───────┼───────────────────────────────────┼─────────────────────────────────┤
│ 4.8   │ Validação Técnica, Rastreabilidade│ Teste 1 (SUAP real/Claude), RTM,│
│       │ e Disponibilização dos Artefatos  │ runner-tcd.ts e tags Git.       │
└───────┴───────────────────────────────────┴─────────────────────────────────┘
```

Abaixo detalha-se o conteúdo e a forma de redação para cada seção:

### Seção 1: Visão Geral e Trajetória de Engenharia da Solução
* **O que escrever:** Um resumo de alto nível da solução proposta, situando como ela atua como intermediária auditável entre a manifestação discente em linguagem natural e as bases acadêmicas do IFS (ROD, calendário e SUAP).
* **Progressão lógica:** Apresentar o fluxo macro em seis etapas (Entrada Discente, Recuperação Cadastral, Recuperação Normativa, Validação Prévia, Minuta com HITL e Emissão de Artefatos) e a trajetória iterativa de maturidade (`T-001`/`T-002` → `T-006` → `T-007`), sem assumir tom de "diário de bordo".

### Seção 2: Requisitos de Software Implementados
* **O que escrever:** Remeter ao Capítulo 3 para o método de elicitação e priorização (*In or Out* em três faixas) e apresentar os catálogos completos no corpo do texto em forma coesa.
* **Organização em tabelas:**
  - Uma tabela única de Requisitos Funcionais (`RF-01` a `RF-12`) em padrão *EARS*, indicando a situação real do artefato (9 implementados na versão avaliada e 3 planejados para trabalhos futuros).
  - Uma tabela única de Requisitos Não Funcionais (`RNF-01` a `RNF-08`) segundo a Tabela 14-1 de Wiegers e Beatty (2013) e *Planguage*, sem utilizar MoSCoW nem ISO/IEC 25010.

### Seção 3: Arquitetura do Sistema e Integração de Contextos
* **O que escrever:** A visão arquitetural em camadas, detalhando o servidor *stateless*, a arquitetura dual entre dados sintéticos e SUAP real (`JWTAuth`) e a ponte `STDIO ↔ Streamable HTTP` (`claude-stdio-bridge.mjs`).
* **Demonstração visual:** Inserir e analisar a figura da arquitetura (`figuras/arquitetura.pdf`), introduzida antes e interpretada textualmente depois.

### Seção 4: Decisões Arquiteturais Estruturantes
* **O que escrever:** A materialização da técnica de oposição dialética sobre o catálogo de **39 ADRs** (`D-001` a `D-039`) organizados em **5 eixos lógicos**.
* **Conteúdo:** Apresentar uma tabela-síntese agrupada por eixos e discutir em profundidade de 4 a 5 decisões centrais (MCP vs. chamadas HTTP diretas; TypeScript vs. Python; ROD em JSON em dupla camada vs. RAG vetorial; ferramenta única agregadora; calendário do *scraping* à API), explicitando contexto, alternativas descartadas, decisão e *trade-offs*.

### Seção 5: Implementação do Servidor MCP e Contratos das Ferramentas
* **O que escrever:** A anatomia interna do servidor MCP (`tcc-server/index.ts`): 4 ferramentas (`obter-dados-discente`, `consultar-calendario-academico`, `consultar-regras-rod`, `gerar-requerimento`), 1 View embutida (`ui://views/painel-auditoria.html`), 1 prompt demonstrativo (`demonstracao-trancamento`) e a rota `POST /output/sync-pdf`.
* **Conteúdo:** Explicar os envelopes `mcpSuccess`/`mcpError` (`D-015`), a dupla canalização semântica `content` vs. `structuredContent` (`D-037`) e o contrato Zod dos blocos `D1` a `D5`, exibindo apenas um trecho curto de contrato tipado (15 a 25 linhas).

### Seção 6: Modelagem das Regras Normativas do ROD
* **O que escrever:** A conversão de texto legal discursivo (artigos do ROD e marcos do calendário acadêmico) em lógica estruturada e auditável.
* **Demonstração:** Detalhar a Dupla Camada Semântica (`D-016`), catalogar no corpo do texto as 19 regras do ROD (18 vigentes e 1 revogada `ROD-PROF-07`, conforme `D-029`) e a regra temporal dinâmica `RN-TEMP-01` para os processos de Trancamento de Matrícula (total e parcial) e Exame de Proficiência, além dos *trade-offs* da modelagem em JSON sem MoSCoW.

### Seção 7: Interface Visual MCP Apps e Supervisão Humana (HITL)
* **O que escrever:** O mecanismo de governança operacional e a emissão da Folha Única A4 comparada ao formulário histórico da CRE (`D-021`).
* **Conteúdo e recursos visuais:** Descrever os requisitos de acessibilidade WCAG 2.2 AA e isolamento CSP (`D-023`, `D-026`), o ciclo HITL com `ModelContext` e `useSendFollowUp` em três intenções (`D-024`, `D-025`), analisar o diagrama de sequência (`figuras/sequencia.pdf`) e o diagrama de casos de uso revisado (`figuras/casos_uso.pdf`), além da minuta em Folha Única A4 gerada com persona sintética.

### Seção 8: Validação Técnica, Rastreabilidade e Disponibilização dos Artefatos
* **O que escrever:** O relato objetivo do `Teste 1` (integração real ao SUAP via `JWTAuth` e homologação no Claude Desktop), a Matriz de Rastreabilidade Bidirecional atualizada (`RF-01..12`, `RNF-01..08`, componentes e os 17 casos), e uma subseção curta sobre o executor da bancada (`runner-tcd.ts`) como artefato construído, remetendo ao Capítulo 3 para o protocolo experimental.
* **Garantia de Ciência Aberta:** Indicar o repositório, as tags Git imutáveis de versionamento experimental (`D-039`) e as instruções de reprodutibilidade, sem antecipar os resultados quantitativos do Capítulo 5.

---

## 5. Como Escrever o Texto Técnico: Parágrafos, Figuras, Códigos e Tabelas

### 5.1 A Microestrutura do Parágrafo Científico (Severino)

Severino (2017, p. 184–185) adverte enfaticamente contra dois vícios redacionais: o excesso de parágrafos de uma linha só e os blocos maciços sem divisão de raciocínio. O parágrafo é uma **unidade lógica de pensamento**:

> *"A estrutura do parágrafo reproduz a estrutura do próprio trabalho; constitui-se de uma introdução, de um corpo e de uma conclusão.*  
> *Na introdução, anuncia-se o que se pretende dizer; no corpo, desenvolve-se a ideia anunciada; na conclusão, resume-se ou sintetiza-se o que se conseguiu.*  
> *A articulação de um texto em parágrafos está intimamente vinculada à estrutura lógica do raciocínio desenvolvido. É por isso mesmo que, na maioria das vezes, esses parágrafos são iniciados com conjunções que indicam as várias formas de se passar de uma etapa lógica à outra."*  
> — **SEVERINO (2017, p. 185, item 3.b)**

#### A Fórmula Canônica do Parágrafo Técnico no Desenvolvimento:
1. **Tópico Frasal (Abertura):** Apresenta o componente, a regra ou a decisão de engenharia em foco;
2. **Desenvolvimento Fático (Corpo):** Detalha os aspectos estruturais, o fluxo de dados, o diagrama ou os parâmetros envolvidos;
3. **Fecho Demonstrativo (Conclusão):** Destaca o benefício de engenharia alcançado, a conformidade normativa assegurada ou conecta com o parágrafo seguinte.

#### Exemplo Prático de Parágrafo Aplicado ao TCC:
```latex
% Exemplo de parágrafo no padrão Severino (2017)
A validação de tempestividade temporal fundamenta-se na verificação
determinística dos marcos do calendário acadêmico oficial do IFS. Em vez de
delegar o cômputo de datas e prazos regimentais à capacidade probabilística do
modelo de linguagem, o componente \texttt{consultar-calendario-academico} recupera
a janela temporal oficial parametrizada para o período letivo vigente antes da
emissão da minuta. Essa abordagem elimina o risco de alucinação cronológica em
processos de trancamento de matrícula ou exame de proficiência, assegurando que
solicitações fora do prazo regimental sejam sinalizadas com precisão.
```

### 5.2 Diretrizes para Inclusão de Figuras, Tabelas e Códigos (Lakatos & Marconi)

Lakatos e Marconi (2003, p. 231, seção 10.4.8) prescrevem rigorosa sobriedade na apresentação de elementos visuais no corpo do trabalho:

> *"Os dados serão apresentados de acordo com sua análise estatística [ou técnica], incorporando no texto apenas as tabelas, os quadros, os gráficos e outras ilustrações estritamente necessárias à compreensão do desenrolar do raciocínio; os demais deverão vir em apêndice."*  
> — **LAKATOS; MARCONI (2003, p. 231, item 10.4.8)**

#### Regras Práticas para Ilustrações e Códigos:
1. **Regra da Não-Orfandade:** Toda figura, tabela ou listagem de código **deve ser citada no texto antes de sua ocorrência visual**. É inaceitável inserir uma imagem sem explicar o que ela representa.
2. **Análise Textual Mandatória:** Após a figura, o texto deve analisar os pontos críticos do diagrama (ex.: *"Como ilustra a Figura 4, a comunicação entre o cliente e o servidor MCP dá-se através de transporte JSON-RPC padrão sobre stdio..."*).
3. **Códigos-Fonte Enxutos:** Nunca cole arquivos inteiros de código (200 ou 500 linhas) no meio do capítulo. Apresente apenas a interface essencial, o contrato tipado ou o algoritmo nuclear (15 a 30 linhas). O código-fonte integral deve residir no repositório público ou em Apêndice.
4. **Padronização Visual:** Diagramas devem estar preferencialmente em formato vetorial (`.pdf` recortado), com tipografia nítida, paleta contrastante e legendas conforme ABNT NBR 14724.

### 5.3 Estilo e Tom: Linguagem Cognoscitiva, Impessoal e Concisa

Lakatos e Marconi (2003, p. 249–250) e Severino (2017, p. 184) definem as características estilísticas inegociáveis do texto científico:
* **Linguagem Técnica (Cognoscitiva e Racional):** Vocabulário exato da ciência da computação (interfaces, contratos, tipos, *payloads*, latência, desacoplamento).
* **Impessoalidade Rigorosa:** Evitar verbos na primeira pessoa (*"fizemos"*, *"percebi"*). Adotar a terceira pessoa do singular com voz passiva pronominal (*"verificou-se"*, *"implementou-se"*, *"observa-se"*) ou o sujeito analítico (*"a solução proposta adota"*, *"o módulo de validação processa"*).
* **Concisão e Simplicidade:** Frases diretas. Eliminar adjetivos grandiloquentes e vazios (*"fantástico"*, *"revolucionário"*, *"perfeito"*). Na ciência, o valor do artefato é demonstrado por evidências, não por adjetivação.

---

## 6. Armadilhas Críticas a Evitar no Capítulo de Desenvolvimento

| Vício Comum em TCCs de Tecnologia | Por que a Banca Penaliza? | Correção Metodológica Recomendada |
| :--- | :--- | :--- |
| **Transformar o capítulo em manual de instalação ou tutorial de ferramentas.** | Não agrega valor científico; o leitor da banca já conhece comandos como `npm install` ou `docker-compose up`. | Foque nos **conceitos de arquitetura, nas decisões de design e nas regras de negócio**, remetendo tutoriais operacionais ao README do repositório. |
| **Colar códigos longos e descontextualizados.** | Polui o ritmo da leitura e quebra o raciocínio demonstrativo (Lakatos & Marconi, 2003, p. 231). | Apresente apenas assinaturas de funções, tipos de dados ou contratos JSON esquematizados e explique o que eles garantem. |
| **Apresentar diagramas "mudos" sem análise textual.** | Figuras sem comentário textual tornam o trabalho meramente descritivo e sem profundidade reflexiva. | Introduza o diagrama antes, aponte seus componentes centrais no texto e deduza o que ele comprova na arquitetura. |
| **Misturar resultados experimentais com engenharia do artefato.** | Mistura o processo de construção com o processo de teste da hipótese. | O Capítulo 4 documenta a **construção** do sistema. O Capítulo 5 documenta a **avaliação empírica** das hipóteses e a mensuração de métricas. |
| **Omitir as decisões arquiteturais descartadas.** | Faz parecer que a solução foi escolhida por acaso ou por falta de conhecimento de outras alternativas. | Use ADRs para confrontar dialeticamente a alternativa escolhida contra as opções descartadas (técnica de oposição de Galliano). |

---

## 7. Checklist de Auditoria e Autoavaliação do Capítulo

Antes de submeter o Capítulo de Desenvolvimento ao orientador ou integrá-lo à versão final do TCC, audite os seguintes quesitos:

- [ ] **Logicidade dos Títulos:** Todos os títulos de seções e subseções são temáticos e expressivos, revelando claramente o conteúdo abordado (Severino, 2017, p. 182)?
- [ ] **Progressão dos Requisitos à Validação:** Há uma sequência lógica contínua desde a especificação das demandas institucionais até os testes preliminares do protótipo (Lakatos & Marconi, 2003, p. 248)?
- [ ] **Dialética nas ADRs:** As decisões arquiteturais apresentam o contexto, as alternativas descartadas com seus respectivos prós/contras e a fundamentação da opção vencedora?
- [ ] **Autoexplicabilidade de Ilustrações:** Todas as figuras, tabelas e diagramas estão numerados, possuem título no topo, fonte na base e são devidamente citados e interpretados no texto?
- [ ] **Sobriedade de Códigos:** Os trechos de código inclusos são estritamente necessários ao raciocínio lógico (contratos, interfaces, regras) e estão devidamente formatados?
- [ ] **Rastreabilidade Completa:** Existe uma matriz ou mecanismo claro que permita ao avaliador rastrear como cada requisito funcional desdobra-se em componentes e em validações técnicas?
- [ ] **Transparência e Reprodutibilidade:** O capítulo explicita como o artefato pode ser acessado, inspecionado e reproduzido em ambiente controlado (código aberto com licença e repositório)?
- [ ] **Tom Científico Impessoal:** O texto mantém tom neutro, impessoal, objetivo e fundamentado, sem adjetivações retóricas ou gírias tecnológicas desnecessárias?

---

## 8. Referências Citadas

* GALLIANO, Alfredo Guilherme. *O método científico*: teoria e prática. São Paulo: Harper & Row do Brasil, 1977.
* LAKATOS, Eva Maria; MARCONI, Marina de Andrade. *Fundamentos de metodologia científica*. 5. ed. São Paulo: Atlas, 2003.
* SALOMON, Délcio Vieira. *Como fazer uma monografia*. 2. ed. Belo Horizonte: Interlivros, 1973.
* SEVERINO, Antônio Joaquim. *Metodologia do trabalho científico*. 24. ed. São Paulo: Cortez, 2017.

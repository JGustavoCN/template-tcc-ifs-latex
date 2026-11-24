# Guia Metodológico: Como Construir o Capítulo de Metodologia em Trabalhos Acadêmicos e Tecnológicos

> **Fundamentação Epistemológica:** Diretrizes clássicas e metodológicas extraídas diretamente dos originais de **Lakatos e Marconi (2003)** e **Severino (2017)**.  
> **Finalidade:** Servir como manual de referência técnica, conceitual e de redação para estruturar, escrever, justificar e defender o Capítulo de Metodologia em Trabalhos de Conclusão de Curso (TCC), dissertações e artigos científicos na área de Computação e Sistemas de Informação.  
> **Aplicação Específica:** TCC em Sistemas de Informação (IFS *Campus* Lagarto) — Pesquisa aplicada com experimentação computacional controlada (Assistentes Conversacionais, RAG, MCP e Governança Normativa).

---

## Sumário

1. [O que é a Metodologia e por que ela existe? (Conceito e Necessidade)](#1-o-que-é-a-metodologia-e-por-que-ela-existe-conceito-e-necessidade)
   - [1.1 O Princípio da Reprodutibilidade e o Rigor contra o Empirismo Ingênuo](#11-o-princípio-da-reprodutibilidade-e-o-rigor-contra-o-empirismo-ingênuo)
   - [1.2 Distinção Epistemológica: Método, Metodologia, Técnica e Procedimento](#12-distinção-epistemológica-método-metodologia-técnica-e-procedimento)
   - [1.3 Metodologia versus Desenvolvimento: O que vai na Metodologia e o que vai no Desenvolvimento?](#13-metodologia-versus-desenvolvimento-o-que-vai-na-metodologia-e-o-que-vai-no-desenvolvimento)
2. [A Estrutura Canônica do Capítulo de Metodologia (Quais Seções Deve Ter)](#2-a-estrutura-canônica-do-capítulo-de-metodologia-quais-seções-deve-ter)
   - [Seção 1: Caracterização da Pesquisa (Tipologia e Enquadramento)](#seção-1-caracterização-da-pesquisa-tipologia-e-enquadramento)
   - [Seção 2: Contexto Institucional, Universo e Amostragem (Delimitação do Objeto)](#seção-2-contexto-institucional-universo-e-amostragem-delimitação-do-objeto)
   - [Seção 3: Procedimentos de Engenharia e Especificação do Artefato](#seção-3-procedimentos-de-engenharia-e-especificação-do-artefato)
   - [Seção 4: Delineamento Experimental (O Desenho da Investigação)](#seção-4-delineamento-experimental-o-desenho-da-investigação)
   - [Seção 5: Operacionalização das Variáveis e Instrumentos de Medição](#seção-5-operacionalização-das-variáveis-e-instrumentos-de-medição)
   - [Seção 6: Casos de Teste e Padrão de Referência (*Ground Truth* / Oráculo)](#seção-6-casos-de-teste-e-padrão-de-referência-ground-truth--oráculo)
   - [Seção 7: O Estudo Piloto (Pré-Teste Obrigatório)](#seção-7-o-estudo-piloto-pré-teste-obrigatório)
   - [Seção 8: Plano de Tratamento e Análise dos Dados](#seção-8-plano-de-tratamento-e-análise-dos-dados)
   - [Seção 9: Ameaças à Validade e Aspectos Éticos](#seção-9-ameaças-à-validade-e-aspectos-éticos)
3. [Como Construir e Escrever cada Seção: Roteiro Prático de Redação](#3-como-construir-e-escrever-cada-seção-roteiro-prático-de-redação)
   - [3.1 A Fórmula do Parágrafo Metodológico](#31-a-fórmula-do-parágrafo-metodológico)
   - [3.2 Tempos Verbais e Postura Científica (Pretérito vs. Presente/Futuro)](#32-tempos-verbais-e-postura-científica-pretérito-vs-presentefuturo)
4. [Armadilhas Críticas e Vícios Metodológicos a Evitar](#4-armadilhas-críticas-e-vícios-metodológicos-a-evitar)
5. [Estudo de Caso Prático: Aplicação ao TCC II (IFS Lagarto)](#5-estudo-de-caso-prático-aplicação-ao-tcc-ii-ifs-lagarto)
6. [Checklist de Auditoria e Autoavaliação do Capítulo](#6-checklist-de-auditoria-e-autoavaliação-do-capítulo)
7. [Referências Clássicas Consultadas](#7-referências-clássicas-consultadas)

---

## 1. O que é a Metodologia e por que ela existe? (Conceito e Necessidade)

Uma das deficiências mais comuns em trabalhos de graduação em tecnologia é transformar o capítulo de metodologia em uma simples "lista de ferramentas" (ex.: dizer que usou Python, React ou Docker) ou em um diário cronológico de desenvolvimento. 

Para a ciência, a metodologia é algo infinitamente mais profundo: **é a demonstração de como o pesquisador garantiu que suas conclusões são verdadeiras, controladas e livres de viés**.

### 1.1 O Princípio da Reprodutibilidade e o Rigor contra o Empirismo Ingênuo

Lakatos e Marconi (2003) advertem que o conhecimento científico diferencia-se do conhecimento vulgar ou do senso comum exatamente pela sistematicidade do método:

> *"O método científico é o conjunto das atividades sistemáticas e racionais que, com maior segurança e economia, permite alcançar o objetivo — conhecimentos válidos e verdadeiros —, traçando o caminho a ser seguido, detectando erros e auxiliando as decisões do cientista.*  
> *A ciência não se distingue pelo seu objeto de estudo, mas pelo modo como o estuda. Qualquer fato ou fenômeno pode ser objeto de investigação científica, desde que submetido ao rigor metodológico."*  
> — **LAKATOS; MARCONI (2003, p. 83–84, seção 4.1)**

Severino (2017) complementa explicando que todo trabalho acadêmico deve ser uma **construção lógica do raciocínio demonstrativo**:

> *"A metodologia científica [...] não é um conjunto de regras mecânicas que se devam seguir cegamente para se chegar a um resultado pré-fabricado. Trata-se, antes, do desdobramento da própria racionalidade do processo do conhecimento.*  
> *O texto científico deve constituir uma totalidade de inteligibilidade, estruturalmente orgânica, na qual os procedimentos metodológicos evidenciam passo a passo as condições sob as quais o fenômeno foi observado e os dados foram obtidos e analisados."*  
> — **SEVERINO (2017, p. 148–149, seção 3.4.9)**

**Consequência prática para a banca:** Se outro pesquisador ler a sua metodologia, ele precisa ser capaz de **reproduzir o seu experimento exatamente da mesma forma** e verificar se chega aos mesmos resultados. Se o capítulo não permitir a replicação, o trabalho é metodologicamente inválido.

---

### 1.2 Distinção Epistemológica: Método, Metodologia, Técnica e Procedimento

Lakatos e Marconi (2003, p. 83–115) e Severino (2017, p. 147–151) ensinam que o pesquisador não pode confundir estes quatro conceitos:

```
                            HIERARQUIA DO MÉTODO
   ┌────────────────────────────────────────────────────────────────────────┐
   │ 1. MÉTODO DE PENSAMENTO (Nível Filosófico / Epistemológico)           │
   │    Hipotético-dedutivo, indutivo, dialético ou fenomenológico.        │
   ├────────────────────────────────────────────────────────────────────────┤
   │ 2. METODOLOGIA (Nível Estrutural / Lógico)                             │
   │    A teoria do método: como a pesquisa foi planejada e organizada.    │
   ├────────────────────────────────────────────────────────────────────────┤
   │ 3. PROCEDIMENTOS TÉCNICOS (Nível Operacional)                          │
   │    Pesquisa bibliográfica, documental, experimental ou estudo de caso. │
   ├────────────────────────────────────────────────────────────────────────┤
   │ 4. TÉCNICAS E INSTRUMENTOS (Nível da Coleta Material)                  │
   │    Rubricas de avaliação, formulários, logs, métricas e códigos.       │
   └────────────────────────────────────────────────────────────────────────┘
```

* **Método Geral:** A postura lógica. No caso de testes de hipóteses com controle de variáveis, utiliza-se classicamente o **método hipotético-dedutivo** (Karl Popper): formula-se uma hipótese a partir de um problema e submete-se essa hipótese a testes empíricos de falseamento.
* **Metodologia:** O plano global que organiza objetivos, variáveis, tratamentos e instrumentos.
* **Procedimento Técnico:** O arranjo prático (ex.: experimento de bancada em laboratório computacional combinado com pesquisa documental).
* **Técnica:** O instrumento concreto (ex.: a rubrica com notas binárias 0 ou 1, a Taxa de Conformidade do Documento — TCD, ou o script de execução em lote).

---

### 1.3 Metodologia versus Desenvolvimento: O que vai na Metodologia e o que vai no Desenvolvimento?

Uma dúvida clássica levantada por orientadores e bancas é: **"A Metodologia deve ser mais abstrata e teórica sobre o que/como vou fazer, deixando a parte técnica e os detalhes para o Desenvolvimento?"**

A resposta da literatura científica é: **SIM, com uma ressalva epistemológica fundamental sobre o que significa "abstrato" e "genérico".**

#### A. O Respaldo em Severino (2017) e Lakatos & Marconi (2003)

Severino (2017, p. 181–183) e Lakatos & Marconi (2003, p. 171 e 220–226) deixam clara a divisão orgânica de um trabalho acadêmico:

1. **A Metodologia é a Lógica da Investigação (A Teoria do Método):**
   * Severino (2017, p. 157, item 7) define que na metodologia o pesquisador deve explicitar *"as fontes com que conta para a realização da pesquisa e os procedimentos metodológicos e técnicos que usará, deixando bem claro como é que vai proceder"*. Trata-se da explicitação das **condições lógicas e operacionais sob as quais o conhecimento será produzido e testado**.
   * Lakatos e Marconi (2003, p. 220) ensinam que a metodologia responde a: *Como? Com quê? Onde? Quanto?*. Ela formaliza o **delineamento** (quais fatores serão manipulados, quais variáveis serão controladas, quais hipóteses serão testadas e qual o oráculo de comparação).
   * **Conclusão:** A Metodologia **NÃO é um manual de programação nem um diário de bordo de software**. Ela não deve descrever portas de rede (ex.: porta 3000), rotas internas de API, classes de CSS, seletores de interface ou detalhes de bibliotecas auxiliares de renderização. Esses detalhes são operacionais e pertencem à engenharia.

2. **O Desenvolvimento é o Corpo de Demonstração e Construção do Objeto:**
   * Severino (2017, p. 182) explica: *"O desenvolvimento corresponde ao corpo do trabalho [...]. A fase de fundamentação lógica do tema deve ser exposta e provada; a reconstrução racional tem por objetivo explicar, discutir e demonstrar"*.
   * Em pesquisas de Computação e Sistemas de Informação que envolvem desenvolvimento tecnológico (*Design Science Research* ou Engenharia de Software), o artefato construído é parte da demonstração. É no **Capítulo de Desenvolvimento** que se apresentam: a arquitetura do sistema, os diagramas de componentes, as Decisões Arquiteturais (ADRs), a modelagem de dados, a integração entre clientes e servidores e as interfaces com o usuário.

3. **O Perigo do Termo "Genérico": A Metodologia não pode ser Vaga!**
   * O orientador tem total razão ao afirmar que a metodologia deve ser mais *estrutural e conceitual* do que um relatório técnico de código.
   * **Contudo, "genérico" NUNCA pode significar "superficial" ou "impreciso".**
   * Lakatos e Marconi (2003, p. 220–227) alertam que a especificação da metodologia deve ser a mais rigorosa e detalhada do projeto: as variáveis devem ter **definição operacional precisa** (p. 221), os critérios de pontuação devem ser fixados antes do teste (p. 222), o oráculo deve ser externo e o plano estatístico deve ser declarado com seu nível de significância ($\alpha = 0{,}05$).
   * Se a metodologia for "genérica" no sentido de não explicar o desenho experimental, como a rubrica pontua ou quais casos serão testados, **o trabalho perde a reprodutibilidade** e é sumariamente reprovado perante o método científico (SEVERINO, 2017, p. 148).

#### B. Matriz Definitiva: O que vai na Metodologia vs. O que vai no Desenvolvimento

| Dimensão de Análise | O que pertence à METODOLOGIA (Capítulo 3) | O que pertence ao DESENVOLVIMENTO (Capítulo 4) |
| :--- | :--- | :--- |
| **Foco Central** | O método científico de investigação e validação empírica. | A engenharia de software e a construção do artefato tecnológico. |
| **Pergunta-Guia** | *Como a pesquisa garante que suas conclusões são válidas e livres de viés?* | *Como o software foi arquitetado, implementado e estruturado tecnicamente?* |
| **Nível de Abstração** | **Estrutural / Conceitual:** Fatores independentes ($N$ e $D$), condições ($C_1$ a $C_4$), variáveis e hipóteses ($H_0/H_1$). | **Concreto / Técnico:** Linguagens (TypeScript), frameworks (`mcp-use v2`), classes, rotas HTTP e pacotes. |
| **Dados do Sistema** | Definição da amostragem (17 casos sintéticos, 6 personas e padrão de referência *ground truth* perante a LGPD). | Esquemas JSON de retorno, payloads de API, interfaces de domínio e mapeamento de campos. |
| **Ferramentas MCP** | **Papel de Instrumento Experimental:** Ferramentas vistas como fontes de informação controladas na bancada (normas vs. dados). | **Implementação de Software:** Código-fonte das tools, esquemas Zod, encoders, transporte STDIO/SSE e decorators. |
| **Interface e PDF** | A Folha A4 como instrumento observável da decisão discente para aferição da rubrica. | Componentes React (`view.tsx`), CSS, iframe sandboxed, renderização 300 DPI (`pdf-lib`) e botões de zoom. |
| **Avaliação** | Operacionalização da métrica (fórmula da TCD, 4 critérios de 0,25, regras de omissão/falhas críticas e teste piloto). | Testes de integração, logs de execução técnica, tempo de resposta em milissegundos e estabilidade de conexão. |

---

## 2. A Estrutura Canônica do Capítulo de Metodologia (Quais Seções Deve Ter)

Com base em Lakatos e Marconi (2003, Capítulos 8 a 11) e Severino (2017, Seção 3.4 e Parte IV), um capítulo de metodologia completo, defensável e à prova de questionamentos em bancas de Computação e Sistemas de Informação deve contemplar **9 seções fundamentais**:

```
                       ESTRUTURA CANÔNICA DO CAPÍTULO
   ├── 1. Caracterização da Pesquisa (Natureza, Abordagem, Objetivos, Procedimentos)
   ├── 2. Contexto Institucional e Objeto de Estudo (Universo e Delimitação)
   ├── 3. Procedimentos de Engenharia e Especificação do Artefato (Se aplicável)
   ├── 4. Delineamento Experimental (Variáveis, Fatores, Condições, Hipóteses)
   ├── 5. Operacionalização das Variáveis e Instrumentos de Medição (Rubrica/Métrica)
   ├── 6. Casos de Teste e Padrão de Referência (Ground Truth / Oráculo)
   ├── 7. Estudo Piloto (O Pré-Teste de Calibração)
   ├── 8. Plano de Tratamento e Análise dos Dados (Estatística e Hipóteses)
   └── 9. Ameaças à Validade e Aspectos Éticos (Limitações e LGPD)
```

---

### Seção 1: Caracterização da Pesquisa (Tipologia e Enquadramento)

**O que é:** O enquadramento formal da pesquisa segundo as taxonomias consagradas da metodologia científica.

**Fundamentação Teórica:**
* **Quanto à Natureza:** 
  * *Pesquisa Básica:* Objetiva gerar novos conhecimentos teóricos sem aplicação prática imediata prevista.
  * *Pesquisa Aplicada:* *"Tem como objetivo gerar conhecimentos para aplicação prática, dirigidos à solução de problemas específicos. Envolve verdades e interesses locais."* (LAKATOS; MARCONI, 2003, p. 86; SEVERINO, 2017, p. 147).  
  $\rightarrow$ *Para TCCs de desenvolvimento e experimentação tecnológica, trata-se invariavelmente de Pesquisa Aplicada.*
* **Quanto à Forma de Abordagem do Problema:**
  * *Quantitativa:* Privilegia a quantificação na coleta e no tratamento dos dados por meio de técnicas estatísticas (frequências, médias, desvios, testes de hipótese).
  * *Qualitativa:* Privilegia a interpretação dos fenômenos e a atribuição de significados.
  * *Mista (Quali-Quanti):* Constrói uma mensuração quantitativa objetiva (ex.: escores da TCD) apoiada na análise qualitativa detalhada dos erros críticos e das causas das falhas.
* **Quanto aos Objetivos:**
  * *Exploratória:* Proporcionar maior familiaridade com o problema (levantamento bibliográfico, entrevistas iniciais).
  * *Descritiva:* Descrever características de determinada população ou fenômeno e estabelecer relações entre variáveis.
  * *Explicativa:* Identificar os fatores determinantes que causam ou contribuem para a ocorrência dos fenômenos (explicar o *porquê*).
* **Quanto aos Procedimentos Técnicos:**
  * *Pesquisa Documental:* Investigação sobre documentos que ainda não receberam tratamento analítico (leis, regulamentos, resoluções institucionais, prontuários, calendários).
  * *Pesquisa Experimental de Laboratório / Bancada Computacional:* *"Consiste em determinar um objeto de estudo, selecionar as variáveis que seriam capazes de influenciá-lo, definir as formas de controle e de observação dos efeitos que a variável produz no objeto."* (SEVERINO, 2017, p. 147; LAKATOS; MARCONI, 2003, p. 190).

---

### Seção 2: Contexto Institucional, Universo e Amostragem (Delimitação do Objeto)

**O que é:** O esclarecimento rigoroso de **onde**, **com quem** e **sobre o que** o estudo é realizado.

**Fundamentação Teórica:**
Lakatos e Marconi (2003, p. 222–223) destacam que o pesquisador deve delimitar o **Universo** (população total que compartilha das características) e a **Amostra** (recorte representativo ou intencional submetido ao teste).

**O que deve constar no texto:**
1. *Delimitação Espacial e Institucional:* Identificar a instituição, o campus, o curso e os setores envolvidos (ex.: IFS *Campus* Lagarto, CRE, BSI).
2. *Universo do Domínio:* A totalidade de requerimentos e processos didáticos existentes na instituição.
3. *Recorte Amostral Focal:* Os tipos específicos de procedimentos selecionados para a investigação (ex.: Trancamento de Matrícula e Exame de Proficiência), justificando a escolha por sua representatividade, impacto administrativo e complexidade de regras no regulamento.

---

### Seção 3: Procedimentos de Engenharia e Especificação do Artefato

**O que é:** A descrição clara de como a solução tecnológica foi projetada, levantada e especificada antes da experimentação.

**Atenção Crítica:** Lakatos e Marconi (2003) ensinam que em pesquisas aplicadas que envolvem a construção de instrumentos ou protótipos, a especificação técnica dos requisitos não é um ato de intuição subjetiva, mas um procedimento metódico de investigação empírica.

**O que deve constar no texto:**
1. *Técnicas de Elicitação Utilizadas:* Entrevistas semiestruturadas com gestores, análise documental de regulamentos e formulários existentes.
2. *Classificação de Requisitos:* Requisitos Funcionais (RF), Não Funcionais (RNF) e Regras de Negócio (RN).
3. *Método de Priorização:* Aplicação de métodos estruturados (como o MoSCoW: *Must, Should, Could, Won't*).
4. *Distinção Fundamental de Escopo:* Uma tabela demonstrando claramente a diferença entre **o protótipo de software completo** (com todas as suas telas e módulos) e **o recorte experimental investigado na pesquisa** (a bancada de testes controlada).

---

### Seção 4: Delineamento Experimental (O Desenho da Investigação)

**O que é:** O coração da metodologia científica empírica. É aqui que o pesquisador define as variáveis, os tratamentos e a lógica causal da comparação.

**Fundamentação Teórica de Lakatos e Marconi (2003, p. 165–175) e Severino (2017, p. 147):**

#### A. A Definição Rígida das Variáveis:
* **Variável Independente ($X$ - Causa / Fator):** É o fator manipulado deliberadamente pelo pesquisador para observar o efeito que ele produz. Em computação, é a **disponibilidade de diferentes fontes de informação ou arquiteturas**.
* **Variável Dependente ($Y$ - Efeito / Desfecho):** É a variável que se altera em função da manipulação da variável independente. É o que o pesquisador mede (ex.: a **Conformidade Normativa do Documento**).
* **Variáveis de Controle (Invariantes):** Todos os fatores que poderiam interferir no resultado e que, por isso, devem ser mantidos rigidamente constantes em todas as execuções (ex.: mesma versão do modelo de linguagem, mesma temperatura de decodificação fixada em 0.0, mesmos prompts-base, mesmo conjunto de casos).

#### B. A Estrutura Fatorial $2 \times 2$:
Se o estudo investiga dois fatores independentes (por exemplo, Fator N: Normas/Prazos e Fator D: Dados do Aluno), o desenho ideal segundo a estatística experimental é o **arranjo fatorial $2 \times 2$**, gerando quatro condições:

```
                          MATRIZ FATORIAL 2 × 2
                         Fator D (Dados Discentes)
                         Ausente (D=0)    Presente (D=1)
      ┌────────────────┬────────────────┬────────────────┐
      │ Ausente (N=0)  │ Condição C1    │ Condição C3    │
      │                │ Linha de Base  │ Cadastral      │
Fator ├────────────────┼────────────────┼────────────────┤
  N   │ Presente (N=1) │ Condição C2    │ Condição C4    │
      │                │ Normativo-Temp │ Integrado      │
      └────────────────┴────────────────┴────────────────┘
```

#### C. Unidade Experimental:
A definição exata do que constitui **uma observação independente**. Exemplo: *uma execução de um caso sintético sob uma condição experimental específica*.

#### D. Hipóteses Formais de Trabalho:
* *Hipótese Nula ($H_0$):* Não há diferença significativa na conformidade documental entre as condições de disponibilidade informacional.
* *Hipótese Alternativa ($H_1$):* A condição integrada (C4) apresentará conformidade documental significativamente superior à linha de base sem ferramentas (C1) e às condições isoladas (C2 e C3).

---

### Seção 5: Operacionalização das Variáveis e Instrumentos de Medição

**O que é:** A tradução de um conceito abstrato ("conformidade normativa") em uma fórmula matemática e em uma rubrica observável de pontuação.

**Fundamentação Teórica:**
Lakatos e Marconi (2003, p. 169) explicam:
> *"A operacionalização de variáveis consiste na passagem do plano teórico para o plano operacional. Significa indicar os procedimentos empíricos e observáveis necessários para medir ou identificar o conceito abstrato."*

**O que deve constar no texto:**
1. *A Métrica Principal (ex.: TCD):* Apresentar a fórmula matemática, demonstrando que ela agrega subcritérios objetivos:
   $$\text{TCD} = \frac{K_{\text{id}} + K_{\text{class}} + K_{\text{restr}} + K_{\text{just}}}{4}$$
2. *A Escala Binária de Cada Critério:* Definir o que vale nota 1 e o que vale nota 0 para cada dimensão ($K_{\text{id}}, K_{\text{class}}, K_{\text{restr}}, K_{\text{just}}$).
3. *Justificativa dos Pesos:* Justificar metodologicamente a adoção de pesos iguais (0,25) como escolha de simetria e simplicidade, **reconhecendo expressamente a limitação de que a média simples permite compensação** (uma minuta com erro grave de restrição ainda pode obter escore 0,75). Por isso, declare que os critérios serão relatados separadamente.
4. *Métricas Complementares de Prudência (ex.: TDP):* Explicar como o sistema pontua comportamentos prudentes diante de dados ausentes (Taxa de Detecção de Pendência), separando a *completude do documento* da *segurança do agente*.

---

### Seção 6: Casos de Teste e Padrão de Referência (*Ground Truth* / Oráculo)

**O que é:** A especificação da "resposta ideal" contra a qual cada saída gerada pelo computador será comparada.

**Fundamentação Teórica:**
Apoiando-se no clássico problema do oráculo de teste em Engenharia de Software (Barr et al., 2015; Russell e Norvig, 2013), **a saída do próprio modelo de linguagem nunca pode ser usada como gabarito de si mesma**. O padrão de referência deve ser um artefato externo, construído a partir de documentos oficiais e revisado antes do experimento.

**O que deve constar no texto:**
1. *As Personas e Fixtures Sintéticas:* Perfis acadêmicos controlados que simulam diferentes situações da vida acadêmica (discente regular, com reprovações, com suspensão disciplinar, em primeiro período, etc.).
2. *Os Casos de Teste:* A lista finita e estruturada de casos cobrindo cenários favoráveis (deferíveis), desfavoráveis (com impedimento regimental) e casos de fronteira (fora do prazo ou nos limites de vagas).
3. *Blindagem contra Vazamento (*Data Leakage*):* Demonstrar que a entrada do modelo (`model_input`) contém apenas a solicitação discente e os metadados de execução, ficando o gabarito normativo (`reference`) isolado para uso exclusivo do avaliador.

---

### Seção 7: O Estudo Piloto (Pré-Teste Obrigatório)

**O que é:** A execução preliminar do experimento em escala reduzida para calibrar instrumentos antes da coleta principal.

**Fundamentação Teórica:**
Tanto Lakatos e Marconi quanto Severino consideram o pré-teste **uma etapa metodológica estritamente obrigatória**:

> *"Antes de iniciar a coleta definitiva dos dados, é indispensável a realização de um pré-teste. [...] O pré-teste tem por objetivo verificar a validade do instrumento de coleta, evidenciar ambiguidades nas questões, avaliar a extensão e o tempo de aplicação e calibrar os critérios dos avaliadores. As falhas apontadas no pré-teste permitem a revisão e o aprimoramento do plano antes de seu congelamento."*  
> — **LAKATOS; MARCONI (2003, p. 202, seção 9.4.2)**

> *"A aplicação de um procedimento preliminar ou pré-teste constitui garantia indispensável para assegurar a confiabilidade do processo de observação."*  
> — **SEVERINO (2017, p. 150, seção 3.4.9)**

**O que deve constar no texto:**
1. *Objetivo do Piloto:* Testar a estabilidade dos scripts do executor em lote, a captura dos logs, a clareza da rubrica e a concordância entre avaliadores.
2. *Amostra do Piloto:* Um subconjunto reduzido de casos (ex.: 2 casos representativos executados nas 4 condições).
3. *Calibração de Avaliadores:* A aplicação da rubrica por dois avaliadores independentes sobre as mesmas saídas piloto para medir o índice de concordância e revisar regras ambíguas antes do congelamento definitivo do protocolo.

---

### Seção 8: Plano de Tratamento e Análise dos Dados

**O que é:** A definição prévia de quais técnicas estatísticas e procedimentos analíticos serão aplicados aos números obtidos.

**Atenção de Ouro:** Lakatos e Marconi (2003, Cap. 10) alertam que **o pesquisador nunca deve coletar os dados primeiro para depois decidir como vai analisá-los**. A técnica de análise deve ser escolhida antes de ver os resultados para evitar a manipulação de testes que favoreçam a hipótese.

**O que deve constar no texto:**
1. *Codificação e Tabulação:* Como os dados brutos e as notas da rubrica serão organizados em matrizes de dados.
2. *Estatística Descritiva:* Cálculo de médias, medianas, desvio padrão, distribuição de frequências por critério $K$ e taxa de erros críticos.
3. *Estatística Inferencial (Comparação Pareada):* Reconhecer que, como os mesmos casos de teste são submetidos às quatro condições (C1 a C4), trata-se de um desenho com **medidas repetidas / pareadas por bloco de caso**.
4. *Critérios de Decisão das Hipóteses:* Declarar formalmente o nível de significância adotado ($\alpha = 0{,}05$) e as condições sob as quais $H_0$ será refutada.

---

### Seção 9: Ameaças à Validade e Aspectos Éticos

**O que é:** O reconhecimento lúcido das limitações científicas do estudo e a garantia de integridade ética.

**O que deve constar no texto:**
1. *Ameaças à Validade Interna:* Riscos de não determinismo do modelo generativo (mitigados com temperatura 0.0 e repetições controladas) e ruídos de rede (tratados com política de 1 retry apenas para falha de transporte).
2. *Ameaças à Validade Externa:* Reconhecer que os resultados obtidos limitam-se ao contexto do Regulamento de Organização Didática do IFS e aos modelos avaliados, não permitindo generalização cega para outras IFEs com sistemas distintos.
3. *Ameaças à Validade de Construto:* Reconhecer que a TCD é uma métrica operacional própria do estudo e que a média simples permite compensação de falhas graves, exigindo o reporte explícito dos subcritérios.
4. *Aspectos Éticos e LGPD:* Declarar explicitamente que a pesquisa utiliza **exclusivamente dados e personas sintéticas**, inexistindo o processamento ou exposição de dados pessoais reais de discentes ou servidores no experimento.

---

## 3. Como Construir e Escrever cada Seção: Roteiro Prático de Redação

### 3.1 A Fórmula do Parágrafo Metodológico

Para que o texto soe rigoroso, acadêmico e fluido, cada parágrafo de decisão metodológica deve seguir uma estrutura em **três tempos**:

```
                       FÓRMULA DO PARÁGRAFO EM 3 TEMPOS
   ┌────────────────────────────────────────────────────────────────────────┐
   │ 1. A ANCORAGEM TEÓRICA (A Regra da Metodologia Científica)            │
   │    Citar o conceito segundo Lakatos & Marconi ou Severino.             │
   ├────────────────────────────────────────────────────────────────────────┤
   │ 2. A JUSTIFICATIVA DA ESCOLHA (A Razão do Projeto)                     │
   │    Explicar por que essa abordagem atende à pergunta de pesquisa.      │
   ├────────────────────────────────────────────────────────────────────────┤
   │ 3. A MATERIALIZAÇÃO NO PROJETO (A Operacionalização Prática)           │
   │    Descrever como a regra foi concretizada nos arquivos/sistemas.      │
   └────────────────────────────────────────────────────────────────────────┘
```

#### Exemplo Prático de Redação Aplicada:

> *(Tempo 1 - Ancoragem):* De acordo com \textcite{lakatos2003}, a pesquisa aplicada orienta-se pela necessidade de produzir conhecimentos dirigidos à solução de problemas concretos e imediatos em dada realidade institucional.  
> *(Tempo 2 - Justificativa):* No presente trabalho, a escolha da abordagem aplicada justifica-se pelos gargalos operacionais e pela sobrecarga de atendimento observada nas secretarias acadêmicas e na Coordenadoria de Registros Escolares diante da conferência manual de requerimentos discentes.  
> *(Tempo 3 - Materialização):* Dessa forma, a investigação expressa-se no desenvolvimento e na avaliação experimental de um protótipo de assistente conversacional desenhado para automatizar a verificação normativa e a emissão de minutas para o Instituto Federal de Sergipe.

---

### 3.2 Tempos Verbais e Postura Científica (Pretérito vs. Presente/Futuro)

A concordância temporal é um dos pontos mais cobrados por bancas examinadoras:

| Situação no Trabalho | Tempo Verbal Recomendado | Exemplo Correto | Exemplo Incorreto |
| :--- | :--- | :--- | :--- |
| **Procedimentos já realizados** (Levantamento, especificação, arquitetura, criação de fixtures) | **Pretérito Perfeito** (Ação concluída) | *"Realizou-se o levantamento documental das resoluções..."* | *"Iremos realizar o levantamento das resoluções..."* |
| **Definições e conceitos estáveis** (Normas, equações, características de sistemas) | **Presente do Indicativo** (Verdade atemporal) | *"A métrica TCD representa a média simples dos critérios..."* | *"A métrica TCD representava a média..."* |
| **Etapas planejadas para execução futura** (No TCC I para o TCC II, ou testes da bancada principal) | **Futuro do Presente** ou **Voz Passiva com Previsão** | *"Na etapa experimental, os casos serão executados nas quatro condições..."* | *"Na etapa experimental, nós vamos rodar os casos..."* |

* **Regra de Ouro da Impessoalidade:** Nunca utilize a primeira pessoa do singular (*"eu fiz"*, *"meu trabalho"*). Utilize a terceira pessoa com pronome apassivador (*"adotou-se"*, *"investiga-se"*, *"define-se"*) ou a primeira pessoa do plural com modéstia científica (*"adotamos"*), sendo a forma apassivada a preferida segundo a ABNT.

---

## 4. Armadilhas Críticas e Vícios Metodológicos a Evitar

Ao redigir o capítulo de metodologia, fuja dos **cinco erros capitais** que desqualificam pesquisas em bancas examinadoras:

1. **A Síndrome do "Manual de Ferramentas":**  
   * *Erro:* Gastar cinco páginas explicando o que é o Node.js, o que é o Git ou o que é o Docker.  
   * *Correção:* A metodologia deve focar no **método científico da investigação**. A tecnologia adotada é apenas o instrumento da bancada; mencione a versão exata e justifique seu papel no controle experimental sem transformar o texto em tutorial de instalação.
2. **Afirmações Deterministas Precoces:**  
   * *Erro:* Escrever no capítulo de metodologia que *"a condição C4 reduz a zero os erros"* ou que *"o assistente garante que nenhum aluno seja prejudicado"*.  
   * *Correção:* Na metodologia, você está formulando **hipóteses e condições de teste**. Quem prova se o erro é zero ou não são os resultados do experimento. Use sempre tom condicional: *"a hipótese formulada prevê que C4 apresentará maior conformidade..."*.
3. **Métrica Própria tratada como "Padrão Universal":**  
   * *Erro:* Tratar a sua métrica (ex.: TCD) como se fosse uma lei física validada internacionalmente.  
   * *Correção:* Declare a métrica como **uma operacionalização específica de pesquisa**, justifique a escolha pragmática de seus pesos e exponha suas limitações (reconhecendo que médias mascaram erros críticos pontuais).
4. **Vazamento do Gabarito (*Data Leakage*):**  
   * *Erro:* O modelo de linguagem receber na pergunta o artigo da lei que deveria ser descoberto por ele.  
   * *Correção:* Documente detalhadamente que o prompt factual (`model_input`) foi totalmente blindado contra qualquer pista normativa do gabarito (`reference`).
5. **Omissão do Pré-Teste:**  
   * *Erro:* Iniciar a coleta final sem demonstrar como a rubrica foi calibrada.  
   * *Correção:* Apresente a seção de estudo piloto demonstrando que a rubrica passou por verificação prévia e teste de concordância entre avaliadores.

---

## 5. Estudo de Caso Prático: Aplicação ao TCC II (IFS Lagarto)

Para consolidar as diretrizes deste guia, vejamos a matriz de rastreabilidade exata que conecta a teoria metodológica clássica à estrutura real do seu TCC:

| Seção Metodológica Canônica | Enquadramento Epistemológico | Materialização no seu TCC (Capítulo 3 / Protocolo) |
| :--- | :--- | :--- |
| **1. Caracterização da Pesquisa** | Pesquisa Aplicada e Exploratório-Experimental (Lakatos & Marconi; Severino). | Seção 3.1: Pesquisa aplicada voltada à automação de rotinas da CRE no IFS *Campus* Lagarto. |
| **2. Contexto Institucional** | Delimitação do Universo e População do estudo empírico. | Seção 3.2: Requerimentos discentes regidos pela Resolução nº 35/2016/CS/IFS no curso de BSI. |
| **3. Procedimentos de Engenharia** | Elicitação e priorização de requisitos de software (ISO 29148 / MoSCoW). | Seção 3.3: 49 requisitos consolidados (24 RF, 8 RNF, 17 RN), com 42 *Must have*. |
| **4. Delineamento Experimental** | Experimento de bancada computacional em arranjo fatorial $2 \times 2$. | Seção 3.4: Fator N (Normas/Calendário) $\times$ Fator D (Dados Discentes) $\rightarrow$ Condições C1, C2, C3 e C4. |
| **5. Instrumentação de Bancada** | Isolamento do artefato e fontes de dados da bancada experimental. | Seção 3.5: Catálogo de ferramentas MCP desacopladas sob arquitetura *stateless*. |
| **6. Padrão de Referência (Oráculo)** | Ground Truth independente e resolução do problema do oráculo (Barr et al.). | Seção 3.6: 17 casos finitos (10 trancamentos e 7 proficiências) sobre 6 personas sintéticas. |
| **7. Operacionalização de Variáveis** | Passagem do construto abstrato para a métrica observável. | Seção 3.7: Taxa de Conformidade do Documento (TCD) com $K_{\text{id}}, K_{\text{class}}, K_{\text{restr}}, K_{\text{just}}$, TFC e TDP. |
| **8. Procedimentos e Estudo Piloto** | Calibração obrigatória antes do congelamento (Lakatos & Marconi; Severino). | Seção 3.8: Estudo piloto com 2 casos focais (`TRANC-01` e `PROF-03`) nas 4 condições (8 saídas) e $\kappa \ge 0{,}75$. |
| **9. Tratamento de Dados** | Plano de tabulação e análise pareada por bloco de caso. | Seção 3.9: Estatística descritiva, ANOVA fatorial de medidas repetidas / ART (Wobbrock) e Holm-Bonferroni. |
| **10. Ameaças e Aspectos Éticos** | Validade interna/externa e conformidade com a LGPD. | Seção 3.10: Uso exclusivo de dados 100% sintéticos e protocolo de supervisão humana (*Human-in-the-Loop*). |

---

## 6. Checklist de Auditoria e Autoavaliação do Capítulo

Antes de entregar ou defender o Capítulo de Metodologia, submeta seu texto a este checklist de dez itens:

- [ ] **1. Natureza e Objetivos Claros:** A pesquisa está formalmente classificada quanto à sua natureza (aplicada) e aos seus objetivos (exploratório-descritiva) com base em autores conceituados?
- [ ] **2. Delimitação Explícita do Objeto:** O leitor sabe exatamente em qual instituição, campus, curso e sobre quais processos a pesquisa incide?
- [ ] **3. Distinção entre Sistema Amplo e Recorte:** Há uma tabela diferenciando o protótipo de software completo do recorte experimental da pesquisa?
- [ ] **4. Variáveis Claramente Definidas:** A variável independente (fatores de informação), a variável dependente (conformidade) e as variáveis de controle (temperatura 0.0, modelo, prompts) estão isoladas?
- [ ] **5. Desenho Fatorial Justificado:** O desenho comparativo (ex.: fatorial $2 \times 2$, C1 a C4) está formalmente desenhado e amparado na literatura?
- [ ] **6. Métrica e Pesos Fundamentados:** A fórmula da métrica (TCD) foi apresentada e a atribuição de seus pesos foi explicitamente justificada, reconhecendo suas limitações de compensação?
- [ ] **7. Padrão de Referência Independente:** O oráculo normativo (*ground truth*) foi gerado a partir de resoluções vigentes e está blindado contra vazamento no prompt do modelo?
- [ ] **8. Pré-Teste Previsto:** O estudo piloto está formalizado para calibrar a rubrica e testar a estabilidade dos logs antes da coleta final?
- [ ] **9. Procedimento de Análise Antecipado:** As técnicas estatísticas para analisar os dados pareados foram definidas antes da observação dos resultados empíricos?
- [ ] **10. Postura Ética e LGPD:** O texto declara categoricamente o uso exclusivo de dados sintéticos e a ausência de riscos à privacidade de discentes reais?

---

## 7. Referências Clássicas Consultadas

* BARR, Earl T. et al. The oracle problem in software testing: a survey. **IEEE Transactions on Software Engineering**, v. 41, n. 5, p. 507–525, 2015.
* LAKATOS, Eva Maria; MARCONI, Marina de Andrade. **Fundamentos de metodologia científica**. 5. ed. São Paulo: Atlas, 2003. 311 p. (Especialmente Capítulo 4: *Métodos Científicos*, Capítulo 8: *Planejamento da Pesquisa*, e Capítulo 10: *Análise e Interpretação dos Dados*).
* POPPER, Karl. **A lógica da pesquisa científica**. São Paulo: Cultrix, 2013.
* RUSSELL, Stuart; NORVIG, Peter. **Inteligência Artificial: uma abordagem moderna**. 3. ed. Rio de Janeiro: Elsevier, 2013. (Capítulo 2: *Agentes Inteligentes e Medidas de Desempenho*).
* SEVERINO, Antônio Joaquim. **Metodologia do trabalho científico**. 24. ed. rev. e atual. São Paulo: Cortez, 2017. 320 p. (Especialmente Capítulo 3: *Metodologia da Pesquisa Científica*, Seções 3.4.7 e 3.4.9, e Parte IV: *A Elaboração da Monografia*).

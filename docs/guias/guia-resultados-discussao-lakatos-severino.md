# Guia Metodológico: Como Construir o Capítulo de Resultados e Discussão em Trabalhos Acadêmicos e Tecnológicos

> **Fundamentação Epistemológica:** Diretrizes clássicas de análise, interpretação, representação de dados e redação científica extraídas diretamente dos originais de **Lakatos e Marconi (2003)** e **Severino (2017)**.  
> **Finalidade:** Servir como manual de referência metodológica, analítica e redacional para planejar, estruturar, redigir e defender o **Capítulo 5 (Resultados e Discussão)** em Trabalhos de Conclusão de Curso (TCC) em Computação e Sistemas de Informação.  
> **Aplicação Específica:** TCC em Sistemas de Informação (IFS *Campus* Lagarto) — Avaliação experimental fatorial $2 \times 2$ ($N = 204$), calibração piloto ($N = 8$) e auditoria forense de assistente acadêmico baseado em MCP e RAG estruturado.

---

## Sumário

0. [Localização das Fontes nos PDFs de Referência](#0-localização-das-fontes-nos-pdfs-de-referência)
1. [Fundamentos Epistemológicos: Análise, Interpretação e Raciocínio Demonstrativo](#1-fundamentos-epistemológicos-análise-interpretação-e-raciocínio-demonstrativo)
   - [1.1 Análise versus Interpretação (Lakatos & Marconi, 2003)](#11-análise-versus-interpretação-lakatos--marconi-2003)
   - [1.2 O Raciocínio Demonstrativo e a Ordem Lógica de Exposição (Severino, 2017)](#12-o-raciocínio-demonstrativo-e-a-ordem-lógica-de-exposição-severino-2017)
   - [1.3 Fronteiras Lógicas com Metodologia (Cap. 3), Desenvolvimento (Cap. 4) e Conclusão (Cap. 6)](#13-fronteiras-lógicas-com-metodologia-cap-3-desenvolvimento-cap-4-e-conclusão-cap-6)
2. [Rigor na Apresentação de Dados, Verificação de Hipóteses e Armadilhas de Best](#2-rigor-na-apresentação-de-dados-verificação-de-hipóteses-e-armadilhas-de-best)
   - [2.1 Regras para Tabelas, Quadros e Gráficos (Lakatos & Marconi, 2003)](#21-regras-para-tabelas-quadros-e-gráficos-lakatos--marconi-2003)
   - [2.2 Confronto com as Hipóteses, Discrepâncias e Alcance de Generalização](#22-confronto-com-as-hipóteses-discrepâncias-e-alcance-de-generalização)
   - [2.3 Os Oito Erros Críticos na Análise e Interpretação (Best apud Lakatos & Marconi)](#23-os-oito-erros-críticos-na-análise-e-interpretação-best-apud-lakatos--marconi)
3. [Estrutura Temática Recomendada para o Capítulo 5 do TCC](#3-estrutura-temática-recomendada-para-o-capítulo-5-do-tcc)
4. [Técnicas de Redação, Tempos Verbais e Construção de Parágrafos](#4-técnicas-de-redação-tempos-verbais-e-construção-de-parágrafos)
   - [4.1 Tempos Verbais Obrigatórios](#41-tempos-verbais-obrigatórios)
   - [4.2 Fórmula do Parágrafo Analítico (Severino + Lakatos)](#42-fórmula-do-parágrafo-analítico-severino--lakatos)
   - [4.3 Recomendações para Figuras e Gráficos Vetoriais](#43-recomendações-para-figuras-e-gráficos-vetoriais)
5. [Armadilhas Comuns e Checklist de Auditoria do Capítulo 5](#5-armadilhas-comuns-e-checklist-de-auditoria-do-capítulo-5)
6. [Referências Citadas](#6-referências-citadas)

---

## 0. Localização das Fontes nos PDFs de Referência

Todas as diretrizes deste guia foram verificadas diretamente nos arquivos PDF armazenados em `resources/references/metodologia-e-engenharia/`:

| Obra | Arquivo no Repositório | Mapeamento Livro $\leftrightarrow$ PDF | Seções e Páginas Extraídas |
| :--- | :--- | :--- | :--- |
| **LAKATOS, Eva Maria; MARCONI, Marina de Andrade.** *Fundamentos de Metodologia Científica*. 5. ed. Atlas, 2003. | `lakatos2003-fundamentos-metodologia-cientifica.pdf` | Pág. do Livro = Pág. do PDF + 1 | **Seção 8.2.3.3** (*Análise e Interpretação dos Dados*, Livro p. 167–169 / PDF p. 166–168);<br>**Seção 8.2.3.4** (*Representação dos Dados: Tabelas, Quadros e Gráficos*, Livro p. 169–170 / PDF p. 168–169);<br>**Seções 10.4.8–10.4.11** (*Apresentação, Interpretação, Conclusões e Recomendações*, Livro p. 231–232 / PDF p. 230–231);<br>**Seção 11.4.4.2, d** (*Apresentação, análise e interpretação dos dados*, Livro p. 248 / PDF p. 247). |
| **SEVERINO, Antônio Joaquim.** *Metodologia do Trabalho Científico*. 24. ed. Cortez, 2017. | `severino2017-metodologia-trabalho-cientifico-24ed.pdf` | Pág. do Livro = Pág. do PDF (1:1) | **Seções 2.3 e 2.3.1** (*Estrutura Lógica e Demonstração*, p. 91–92);<br>**Seção 2.3.3** (*Análise e Síntese*, p. 96–97);<br>**Seção 4.2.3** (*Análise dos Dados e Construção do Raciocínio Demonstrativo*, p. 180–185);<br>**Seções 4.3 e 5.7** (*Relatando os Resultados e Relatórios Técnicos*, p. 186–187 e 246–247). |

---

## 1. Fundamentos Epistemológicos: Análise, Interpretação e Raciocínio Demonstrativo

Para a metodologia científica clássica, um capítulo de resultados não é um depósito bruto de planilhas ou *logs*, tampouco um comentário opinativo desconectado dos dados. Ele constitui o momento em que os fatos empiricamente apurados respondem ao problema de pesquisa e testam as hipóteses formuladas.

### 1.1 Análise versus Interpretação (Lakatos & Marconi, 2003)

Lakatos e Marconi (2003, p. 167–168, seção 8.2.3.3) definem **análise** e **interpretação** como o núcleo central da pesquisa, distinguindo suas duas operações complementares:

> *"Uma vez manipulados os dados e obtidos os resultados, o passo seguinte é a análise e interpretação dos mesmos, constituindo-se ambas no núcleo central da pesquisa. Para Best (1972:152), 'representa a aplicação lógica dedutiva e indutiva do processo de investigação'. A importância dos dados está não em si mesmos, mas em proporcionarem respostas às investigações."*  
> — **LAKATOS; MARCONI (2003, p. 167, Livro / PDF p. 166)**

1. **Análise (ou explicação):** *"É a tentativa de evidenciar as relações existentes entre o fenômeno estudado e outros fatores"* (p. 167). Segundo os autores, elabora-se em **três níveis** (p. 168 / PDF p. 167):
   - **Interpretação das relações entre variáveis:** examinar como as variáveis independentes ($D$ e $N$) e intervenientes afetam a variável dependente ($\text{TCD}$) e os indicadores complementares ($\text{TDP}$ e $\text{TFC}$);
   - **Explicação:** esclarecer a origem causal ou mecânica do comportamento observado na variável dependente (por exemplo, por que o acesso apenas ao SUAP sem normas em $C_3$ elevou a $\text{TFC}$ para 47,06% ou por que o esquema Zod induziu ancoragem em Trancamento);
   - **Especificação:** explicitar **como, onde e quando** as relações observadas são válidas (por exemplo, diferença de comportamento entre Trancamento de Matrícula e Exame de Proficiência, ou sob um modelo de menor capacidade *Lite*).

2. **Interpretação:** *"É a atividade intelectual que procura dar um significado mais amplo às respostas, vinculando-as a outros conhecimentos"* (p. 168 / PDF p. 167). Compreende dois movimentos essenciais:
   - **Construção de tipos, modelos ou esquemas:** sintetizar padrões empíricos recorrentes (como os seis fenômenos da auditoria forense no conjunto $N = 204$);
   - **Ligação com a teoria:** retomar o Referencial Teórico (Capítulo 2) para mostrar como os resultados confirmam, refinam ou restringem o conhecimento existente sobre RAG, *Model Context Protocol*, alucinações em LLMs e trabalhos correlatos.

### 1.2 O Raciocínio Demonstrativo e a Ordem Lógica de Exposição (Severino, 2017)

Severino (2017, p. 91–92 e p. 180–185) enfatiza que o trabalho científico assume a forma de discurso dissertativo demonstrativo, baseado na articulação entre **raciocínio lógico** e **levantamento empírico dos fatos**:

> *"A demonstração baseia-se num processo de reflexão por argumentação, ou seja, baseia-se na articulação de ideias e fatos, portadores de razões que comprovem aquilo que se quer demonstrar. Essa articulação é conseguida mediante a apresentação de argumentos. Esses argumentos fundam-se nas conclusões dos raciocínios e nas conclusões dos processos de levantamento e caracterização dos fatos."*  
> — **SEVERINO (2017, p. 91, seção 2.3)**

Sobre a organização dos resultados no texto final, Severino (2017, p. 181, seção 4.2.3) alerta para uma regra fundamental de escrita:

> *"A ordem lógica do pensamento de quem escreve pode não coincidir com a ordem de descoberta e de intuição do autor. Isto é normal, já que o pensamento expresso não pode perder de vista a finalidade que tem de comunicar ao leitor essas descobertas. Por isso, o que interessa antes de tudo é a inteligibilidade do texto."*  
> — **SEVERINO (2017, p. 181, seção 4.2.3)**

**Aplicação prática:** Ao redigir o Capítulo 5, não narre a coleta como um relatório cronológico de execuções ou falhas de cota no terminal; organize o capítulo segundo uma **sequência lógica demonstrativa**: primeiro a calibração do instrumento (Piloto $N=8$), depois o panorama quantitativo principal ($N=204$) e o teste das hipóteses, seguido pela decomposição fatorial e estratificada, pela auditoria forense dos desvios, pela telemetria computacional e, por fim, pela discussão teórica e limitações.

### 1.3 Fronteiras Lógicas com Metodologia (Cap. 3), Desenvolvimento (Cap. 4) e Conclusão (Cap. 6)

| Capítulo | O que pertence a ele | O que **NÃO** deve ser repetido no Capítulo 5 |
| :--- | :--- | :--- |
| **Cap. 3 — Metodologia** | Definição das hipóteses ($H_0, H_1$), matriz $2 \times 2$, fórmulas da rubrica ($\text{TCD}$, $\text{TDP}$, $\text{TFC}$, Trava $D_5$), catálogo dos 17 casos, protocolo de execução e escolha da análise descritiva pareada. | Não reexplicar as equações da TCD, a lista das 6 personas nem por que se escolheu `seed: 42` ou análise não paramétrica; apenas referenciar as seções do Cap. 3 e apresentar os **valores obtidos**. |
| **Cap. 4 — Desenvolvimento** | Arquitetura em 3 camadas, contratos Zod (`D1`–`D5`), 20 regras de negócio, HITL e prova técnica de conectividade com SUAP real e Claude Desktop (*Teste 1*, latências de `test:suap-real`). | Não reescrever arquitetura, contratos de ferramentas nem repetir a narrativa do *Teste 1*; se relevante para discussão, apenas retomar sua função complementar de engenharia. |
| **Cap. 5 — Resultados e Discussão** | **Números da calibração piloto ($N=8$), tabelas e gráficos da coleta ($N=204$), contrastes pareados, estabilidade ($k=3$), estratificação Trancamento vs. Proficiência, auditoria forense dos erros/ancoragem, telemetria ($N=204$), confronto formal com $H_0/H_1$, discussão contra a literatura do Cap. 2 e limitações/ameaças observadas.** | Não invadir recomendações finais ou agenda extensa de trabalhos futuros (que pertencem ao Capítulo 6 — Conclusão), limitando-se às implicações técnicas e limitações decorrentes dos dados. |
| **Cap. 6 — Conclusão** | Síntese categórica do atendimento aos objetivos (geral e específicos), resposta final ao problema e à tese, contribuições e trabalhos futuros. | Não apresentar tabelas numéricas novas nem rediscutir casos individuais que não foram analisados no Capítulo 5. |

---

## 2. Rigor na Apresentação de Dados, Verificação de Hipóteses e Armadilhas de Best

### 2.1 Regras para Tabelas, Quadros e Gráficos (Lakatos & Marconi, 2003)

Lakatos e Marconi (2003, p. 169–170 e p. 231) estabelecem critérios rigorosos de clareza visual e sobriedade na exposição dos dados:

> *"Quanto mais simples for a tabela ou o quadro, concentrando-se sobre limitado número de idéias, melhor; ficam mais claras, mais objetivas. Quando se têm muitos dados, é preferível utilizar um número maior de tabelas para não reduzir o seu valor interpretativo. O que caracteriza a boa tabela é a capacidade de apresentar idéias e relações independentemente do texto de informações."*  
> — **LAKATOS; MARCONI (2003, p. 170, Livro / PDF p. 169)**

> *"Os dados serão apresentados de acordo com sua análise estatística, incorporando no texto apenas as tabelas, os quadros, os gráficos e outras ilustrações estritamente necessárias à compreensão do desenrolar do raciocínio; os demais deverão vir em apêndice."*  
> — **LAKATOS; MARCONI (2003, p. 231, Livro / PDF p. 230)**

Diretrizes operacionais para as tabelas e gráficos do Capítulo 5:
1. **Diferenciação entre Tabela e Quadro (p. 170):** utilize **Tabela** para dados quantitativos apurados pelo pesquisador em números absolutos ou percentuais (ex.: resultados de $N=204$, contrastes pareados, telemetria); utilize **Quadro** (ou organização textual/tabular qualitativa) quando agrupar palavras, fenômenos ou classificações analíticas sem foco numérico predominante. *(Observação do template LaTeX do projeto: ambos usam o ambiente `table`, mas o conteúdo e o título devem respeitar essa lógica.)*
2. **Regra de Não-Orfandade e Sobriedade:** toda tabela ou figura gráfica deve ser introduzida no parágrafo anterior e **interpretada analiticamente** nos parágrafos seguintes — jamais substitua a análise por "a Tabela X mostra os resultados abaixo".
3. **Gráficos complementares:** *"Os gráficos, utilizados com habilidade, podem evidenciar aspectos visuais dos dados, de forma clara e de fácil compreensão. Em geral, são empregados para dar destaque a certas relações significativas"* (p. 170). No Capítulo 5, recomenda-se gerar figuras vetoriais enxutas em PDF (via Python/Matplotlib ou Mermaid) especificamente para visualizar:
   - A evolução comparativa de $\text{TCD}_{\text{parcial}}$, $\text{TCD}_{\text{final}}$ e $\text{TFC}$ entre $C_1$, $C_2$, $C_3$ e $C_4$ (evidenciando o salto de $C_4$ e o pico de falha crítica em $C_3$);
   - A assimetria estratificada entre **Trancamento de Matrícula** e **Exame de Proficiência** (evidenciando o impacto da ancoragem em $K_{\text{just}}$ e os efeitos sobre $\text{TCD}_{\text{final}}$).
4. **Síntese em vez de dados brutos (Severino, 2017, p. 247):** não cole transcrições integrais dos 204 *logs* JSON ou das 204 fichas no capítulo; apresente as matrizes consolidadas (incluindo a síntese dos 17 casos agregada em $k=3$) e os excertos pontuais estritamente necessários à auditoria forense.

### 2.2 Confronto com as Hipóteses, Discrepâncias e Alcance de Generalização

Na Seção `10.4.9` (*Interpretação dos Resultados*) e `11.4.4.2, d` (*Desenvolvimento*), Lakatos e Marconi (2003, p. 231–232 e p. 248) especificam o que **obrigatoriamente** deve constar na interpretação dos resultados:

> *"É aqui que são transcritos os resultados, agora sob forma de evidências para a confirmação ou a refutação das hipóteses. [...] É necessário assinalar: as discrepâncias entre os fatos obtidos e os previstos nas hipóteses; a comprovação ou a refutação da hipótese, ou ainda, a impossibilidade de realizá-la; especificação da maneira pela qual foi feita a validação das hipóteses no que concerne aos dados; qual é o valor da generalização dos resultados para o universo, no que se refere aos objetivos determinados; [...] como as provas obtidas mantêm a sustentabilidade da teoria, determinam sua limitação ou, até, a sua rejeição."*  
> — **LAKATOS; MARCONI (2003, p. 231–232, Livro / PDF p. 230–231)**

Para este TCC, isso implica três obrigações inegociáveis no Capítulo 5:
1. **Confrontar diretamente $H_0$ e $H_1$ (definidas na Seção 3.4.2 do Cap. 3)** usando os escores de $\text{TCD}_{\text{final}}$, $\text{TDP}$ e $\text{TFC}$ nas condições $C_1$ a $C_4$ e os seis contrastes pareados, deixando claro que a rejeição empírica de $H_0$ ocorre dentro do **universo fechado intencional de 17 casos sintéticos** (análise descritiva pareada, sem inferência probabilística populacional).
2. **Assinalar explicitamente as discrepâncias entre o previsto e o observado:**
   - Previa-se que sem ferramentas normativas ($C_1$ e $C_3$) a fundamentação legal ($K_{\text{just}}$) cairia homogeneamente próximo de zero; entretanto, observou-se $K_{\text{just}} = 52,94\%$ global (`90,00%` em Trancamento contra `0,00%` em Proficiência) devido à **ancoragem semântica em exemplos do *schema*** (`Art. 24, §2º`, `Art. 28`) e de um enunciado (`TRANC-09`).
   - Previa-se que $C_4$ (contexto completo) zeraria as falhas críticas; entretanto, embora tenha atingido `TFC = 0,00%` em Trancamento (`0/30`), apresentou `11,76%` global (`6/51` execuções: `TRANC-10`, `PROF-05`, `PROF-07`), revelando limites de atenção aritmética e preenchimento estrutural do modelo *Lite* que fundamentam a necessidade de travas determinísticas e supervisão HITL.
3. **Delimitar o alcance da generalização:** deixar transparente que os números valem para os 17 casos sintéticos desenhados sobre o ROD vigente do IFS *Campus* Lagarto e para o modelo invariante testado (`gemini-3.5-flash-lite`), não devendo ser extrapolados automaticamente para outros *campi*, outros cursos ou modelos de maior porte sem nova replicação.

### 2.3 Os Oito Erros Críticos na Análise e Interpretação (Best apud Lakatos & Marconi)

Lakatos e Marconi (2003, p. 169, Livro / PDF p. 168) listam oito falhas apontadas por Best (1972) que comprometem o êxito da investigação científica. A tabela abaixo traduz cada alerta para o contexto direto do Capítulo 5 deste TCC:

| Alerta de Best (Lakatos, 2003, p. 169) | Significado Metodológico | Aplicação Obrigatória no Capítulo 5 |
| :--- | :--- | :--- |
| **1. Confusão entre afirmações e fatos** | Aceitar hipóteses ou impressões como fatos sem respaldo em evidência verificável. | Toda afirmação numérica deve corresponder exatamente a [`metricas-consolidadas-204.json`](file:///c:/Projetos/latex/project-tcc/resources/experimento/artefatos/03-coleta-principal-n204/metricas-consolidadas-204.json) e ao relatório do piloto; nunca afirmar "o modelo compreendeu" quando apenas copiou um exemplo do *schema*. |
| **2. Incapacidade de reconhecer limitações** | Ignorar restrições de tamanho, composição e representatividade da amostra. | Explicitar o caráter fechado e intencional dos 17 casos sintéticos, o uso de um único modelo de linguagem (`gemini-3.5-flash-lite`) e a ausência de validação jurídica/com usuários reais na coleta. |
| **3. Tabulação descuidada** | Erros de somatório, rótulos ambíguos ou inconsistência entre tabelas. | Conferir consistência exata de denominadores ($N=204$, $n=51$ por condição, $n=30$ em Trancamento, $n=21$ em Proficiência, $k=3$ repetições) em todas as tabelas e no texto. |
| **4. Procedimentos estatísticos inadequados** | Aplicar testes cujos pressupostos não se cumprem. | Manter estritamente a **estatística descritiva pareada** e os **contrastes fatoriais pareados** definidos na Seção `3.9.1`, sem introduzir testes paramétricos descartados (como ANOVA ou Wilcoxon pós-hoc não executados). |
| **5. Erros de cálculo** | Divergências aritméticas em médias, desvios-padrão e diferenças. | Verificar todas as diferenças percentuais ($\Delta$ em pontos percentuais) e médias/desvios diretamente no JSON consolidado antes de compilar. |
| **6. Defeitos de lógica** | Confundir correlação com causalidade ou atribuir efeito à variável errada. | Não atribuir o ganho de $C_4$ ao "uso do protocolo MCP" em abstrato (pois `gerar-requerimento` está ativa de $C_1$ a $C_4$), mas sim à **disponibilidade controlada dos contextos informacionais** ($D$ e $N$). |
| **7. Parcialidade inconsciente do investigador** | *"Inclinando-se mais à omissão de resultados desfavoráveis à hipótese e enfatizando mais os dados favoráveis."* | **Regra de ouro:** reportar integralmente o colapso de $C_3$ (`TFC = 47,06%`), os 3 casos imperfeitos de $C_4$ (`TRANC-10`, `PROF-05`, `PROF-07`), a instabilidade de `TRANC-07_C3` (`94,12%` em $C_3$) e a contaminação parcial por ancoragem de *schema* em $C_1/C_3$. |
| **8. Falta de imaginação analítica** | Limitar-se a ler números óbvios sem extrair relações significativas. | Ir além da média global de `86,76%`, extraindo os **mecanismos explicativos**: efeito protetor assimétrico de $N_1$ ($C_1 \to C_2$), risco de dados sem norma ($C_3$), contraste de *Schema Leakage* (Trancamento vs. Proficiência) e necessidade de defesa em profundidade (MCP + determinismo + HITL). |

---

## 3. Estrutura Temática Recomendada para o Capítulo 5 do TCC

Aplicando a exigência de logicidade e subtítulos expressivos de Severino (2017, p. 182) combinada à sequência progressiva e analítica de Lakatos e Marconi (2003, p. 167–170, 231–232, 248), propõe-se organizar o **Capítulo 5 (Resultados e Discussão)** em **sete ou oito seções coesas**, partindo das evidências calibradas no piloto para a coleta principal, da macrovisão quantitativa para a auditoria qualitativa forense e, finalmente, para a discussão teórica e limitações:

| Seção | Título Temático Sugerido | Papel Epistemológico (Lakatos/Severino) | Fontes Primárias no Repositório |
| :---: | :--- | :--- | :--- |
| **5.1** | **Calibração do Instrumento e Estudo Piloto ($N = 8$)** | Demonstrar a confiabilidade prévia do instrumento de medição (concordância observada `32/32` critérios e `16/16` flags nos PDFs cegos), justificar os ajustes arquiteturais (`D-013`, `D-036`) e a seleção do modelo invariante (`gemini-3.5-flash-lite` vs. `gemini-3.6-flash` no *Free Tier*). | [`02-estudo-piloto-e-calibracao-humana.md`](file:///c:/Projetos/latex/project-tcc/resources/experimento/02-estudo-piloto-e-calibracao-humana.md), [`relatorio-estudo-piloto-tcd.md`](file:///c:/Projetos/latex/project-tcc/resources/metodologia/evidencias/relatorio-estudo-piloto-tcd.md) |
| **5.2** | **Resultados Globais da Coleta Principal ($N = 204$) e Teste das Hipóteses** | Apresentar a tabela mestra das condições $C_1$ a $C_4$ ($\text{TCD}_{\text{parcial}}$, $\text{TCD}_{\text{final}}$, critérios $K_{\text{id}}$ a $K_{\text{just}}$, $\text{TDP}$, $\text{TFC}$), figura gráfica comparativa e confronto formal com $H_0$ e $H_1$. | [`03-coleta-principal-fatorial-204.md`](file:///c:/Projetos/latex/project-tcc/resources/experimento/03-coleta-principal-fatorial-204.md) (Seção 1), [`metricas-consolidadas-204.json`](file:///c:/Projetos/latex/project-tcc/resources/experimento/artefatos/03-coleta-principal-n204/metricas-consolidadas-204.json) |
| **5.3** | **Efeitos Fatoriais Pareados, Interação $N \times D$ e Estabilidade Intra-Célula** | Analisar os seis contrastes pareados ($C_2-C_1$, $C_4-C_3$, $C_3-C_1$, $C_4-C_2$, $C_4-C_1$ e interação $N \times D$), o **efeito protetor do contexto normativo** ($C_1 \to C_2$ zerando $\text{TFC}$), o **risco da disponibilização isolada de dados em $C_3$** ($\text{TFC}=47,06\%$) e a estabilidade nas 68 células ($k=3$). | [`03-coleta-principal-fatorial-204.md`](file:///c:/Projetos/latex/project-tcc/resources/experimento/03-coleta-principal-fatorial-204.md) (Seção 2 e matriz de casos), `metricas-consolidadas-204.json` |
| **5.4** | **Análise Estratificada por Modalidade: Trancamento versus Proficiência** | Especificar *onde e como* as relações valem (nível de *especificação* de Lakatos): comparar Trancamento ($n=120$; $C_4$ com `97,50%` e `0,00%` $\text{TFC}$) e Proficiência ($n=84$; $C_4$ com `71,43%`), além da síntese dos 17 casos. | [`03-coleta-principal-fatorial-204.md`](file:///c:/Projetos/latex/project-tcc/resources/experimento/03-coleta-principal-fatorial-204.md) (Seções 3 e 4), [`04-auditoria-forense-ancoragem-e-anomalias-204.md`](file:///c:/Projetos/latex/project-tcc/resources/experimento/04-auditoria-forense-ancoragem-e-anomalias-204.md) (Seção 4) |
| **5.5** | **Auditoria Forense das Anomalias, Ancoragem em *Schema* e Efeito Protetor** | Explicar os seis fenômenos qualitativos identificados nos 204 *logs* brutos: garantia de isolamento sem contaminação de sessão, *Schema Leakage* em Trancamento vs. colapso `0%` em Proficiência (Fenômenos 1–3), proteção indireta de $N_1$ (Fenômeno 4), omissões estruturais JSON em `TRANC-07_C3` e `TRANC-10_C4` (Fenômeno 5) e limites aritméticos/sub-campo do modelo *Lite* em `PROF-05_C4` e `PROF-07_C4` (Fenômeno 6). | [`04-auditoria-forense-ancoragem-e-anomalias-204.md`](file:///c:/Projetos/latex/project-tcc/resources/experimento/04-auditoria-forense-ancoragem-e-anomalias-204.md) (Seções 1 a 3) |
| **5.6** | **Desempenho Operacional, Consumo de Contexto e Viabilidade Econômica** | Apresentar latência média, consumo de tokens entre $C_1$ e $C_4$, adesão às ferramentas (`0,00%` de omissão de ferramenta habilitada) e viabilidade de execução no nível gratuito oficial (*Free Tier*). | [`03-coleta-principal-fatorial-204.md`](file:///c:/Projetos/latex/project-tcc/resources/experimento/03-coleta-principal-fatorial-204.md) (Seção 5), `metricas-consolidadas-204.json` |
| **5.7** | **Discussão à Luz da Literatura e Implicações Arquiteturais** | Realizar a *ligação com a teoria* (Lakatos, p. 168): confrontar os achados com os trabalhos correlatos e o referencial de RAG, alucinações, MCP e HITL (Capítulo 2), extraindo recomendações de projeto para sistemas agênticos baseados em *schemas*. | [`02-referencial.tex`](file:///c:/Projetos/latex/project-tcc/src/capitulos/02-referencial.tex), [`03-coleta-principal-fatorial-204.md`](file:///c:/Projetos/latex/project-tcc/resources/experimento/03-coleta-principal-fatorial-204.md) (Seção 6) |
| **5.8** | **Limitações Observadas e Alcance dos Achados** | Reconhecer criticamente as limitações empíricas emergentes dos dados (amostra fechada de 17 casos, modelo único de menor porte, efeito residual de exemplos no *schema*, escopo restrito a um *campus* e ausência de testes com usuários finais ou leitores de tela) e delimitar o alcance de generalização. | [`04-auditoria-forense-ancoragem-e-anomalias-204.md`](file:///c:/Projetos/latex/project-tcc/resources/experimento/04-auditoria-forense-ancoragem-e-anomalias-204.md), [`03-metodologia.tex`](file:///c:/Projetos/latex/project-tcc/src/capitulos/03-metodologia.tex) (Seção 3.10) |

---

## 4. Técnicas de Redação, Tempos Verbais e Construção de Parágrafos

### 4.1 Tempos Verbais Obrigatórios

- **Pretérito perfeito:** para relatar tudo o que foi observado, medido e auditado nas execuções (*"observou-se"*, *"alcançou"*, *"atingiu"*, *"verificou-se"*, *"identificou-se"*).
- **Presente do indicativo:** exclusivamente para relações conceituais estáveis, interpretações teóricas, descrições do que tabelas e gráficos exibem (*"a Tabela X apresenta"*, *"os resultados demonstram"*) e implicações gerais de arquitetura.
- **Impessoalidade estrita:** manter terceira pessoa ou voz passiva pronominal, evitando expressões subjetivas (*"achamos"*, *"ficou claro que nosso sistema é excelente"*).

### 4.2 Fórmula do Parágrafo Analítico (Severino + Lakatos)

Seguindo a microestrutura do parágrafo de Severino (2017, p. 185) combinada aos três níveis de análise de Lakatos e Marconi (2003, p. 168), cada parágrafo de análise no Capítulo 5 deve percorrer três movimentos:

1. **Abertura (Tópico Frasal / Dado Central):** enuncia o fenômeno ou indicador específico medido no experimento;
2. **Desenvolvimento Fático (Contraste e Explicação Causal):** compara as condições ($C_1..C_4$), exibe números exatos com respectivos denominadores e explica o mecanismo técnico responsável (ex.: Trava $D_5$, recuperação do ROD ou falha aritmética);
3. **Fecho Interpretativo (Significado e Ligação):** explicita a implicação desse achado para a hipótese $H_1$, para a confiabilidade do sistema ou conecta ao próximo nível de análise.

#### Exemplo Prático de Parágrafo no Padrão Severino + Lakatos:
```latex
A disponibilização isolada dos dados cadastrais e acadêmicos do discente ($C_3$)
revelou o maior índice de falhas críticas de todo o experimento, elevando a
\text{TFC} global para 47,06\% (24 de 51 execuções) e derrubando a
\text{TCD}_{\text{final}} média para 43,14\%, mesmo após incremento na
pontuação parcial de identificação. Esse comportamento decorreu do fato de que,
munido apenas dos dados do estudante e desprovido das regras vigentes do ROD e
dos prazos do calendário, o modelo substituiu a abstenção cautelosa (\text{TDP} =
0,00\%) por recomendações favoráveis ou justificativas baseadas em memória
paramétrica equivocada, acumulando 14 falhas críticas em Trancamento e 10 em
Proficiência. Em contraste direto com a condição completa ($C_4$), na qual a
injeção do contexto normativo reduziu a \text{TFC} global para 11,76\% e zerou
as falhas críticas em Trancamento, o achado evidencia que fornecer dados
cadastrais sem fundamentação normativa estruturada amplifica o risco de falsos
deferimentos em assistentes baseados em LLMs.
```

### 4.3 Recomendações para Figuras e Gráficos Vetoriais

Em consonância com Lakatos e Marconi (2003, p. 170), recomenda-se complementar as tabelas principais com **gráficos vetoriais gerados diretamente a partir de [`metricas-consolidadas-204.json`](file:///c:/Projetos/latex/project-tcc/resources/experimento/artefatos/03-coleta-principal-n204/metricas-consolidadas-204.json)** via Python (`matplotlib` exportando em `.pdf` recortado com `bbox_inches='tight'`):
- **Gráfico 1:** Barras agrupadas comparando $\text{TCD}_{\text{parcial}}$, $\text{TCD}_{\text{final}}$, $\text{TDP}$ e $\text{TFC}$ nas quatro condições ($C_1$ a $C_4$);
- **Gráfico 2:** Painel comparativo estratificado entre **Trancamento de Matrícula** e **Exame de Proficiência** ($K_{\text{just}}$, $\text{TCD}_{\text{final}}$ e $\text{TFC}$ em $C_1$ a $C_4$), tornando visualmente imediato o efeito de ancoragem em *schema* frente ao colapso de `0,00%` em Proficiência sem o fator $N$.

---

## 5. Armadilhas Comuns e Checklist de Auditoria do Capítulo 5

### Armadilhas Críticas a Evitar

| Vício Comum em Capítulos de Resultados | Por que Compromete a Avaliação? | Correção Recomendada |
| :--- | :--- | :--- |
| **Omitir ou suavizar resultados desfavoráveis ($C_3$, `TRANC-10`, `PROF-05`, `PROF-07`).** | Configura o erro nº 7 de Best (parcialidade inconsciente; Lakatos, p. 169). | Analisar com transparência os desvios em subseção forense dedicada, convertendo-os em achados científicos valiosos. |
| **Usar estatísticas inferenciais não executadas (ANOVA, $p$-valor, Wilcoxon).** | Contraria a Seção `3.9.1` da Metodologia e os erros nº 3 e nº 4 de Best. | Reportar exclusivamente médias, desvios-padrão, proporções desagregadas, estabilidade ($k=3$) e os seis contrastes pareados. |
| **Confundir o efeito do protocolo MCP com o efeito dos contextos informacionais.** | Violação lógica (erro nº 6 de Best): `gerar-requerimento` esteve ativa em `C1..C4`. | Atribuir os ganhos observados à **disponibilidade controlada dos fatores $D$ e $N$** sob a camada MCP padronizada. |
| **Apresentar tabelas sem texto interpretativo ou gráficos sem números exatos.** | Transforma o capítulo em catálogo mudo (Lakatos, p. 167–170; Severino, p. 182). | Todo elemento visual deve ter introdução prévia, leitura dos valores críticos e ligação causal com as hipóteses e com o Cap. 2. |
| **Replicar seções inteiras da Metodologia ou Desenvolvimento.** | Quebra a unidade orgânica entre capítulos (Severino, p. 181). | Remeter brevemente ao Cap. 3 (`\ref{sec:rubrica_tcd}`, `\ref{sec:unidade_hipoteses}`) e ao Cap. 4 sem repetir descrições de arquitetura ou protocolo. |

### Checklist de Autoavaliação antes de Fechar o Capítulo 5

- [ ] **Fidelidade Numérica Absoluta:** Todos os percentuais, médias, desvios-padrão, latências e contagens ($N=8$, $N=204$, $n=51$, $n=30$, $n=21$) conferem exatamente com [`metricas-consolidadas-204.json`](file:///c:/Projetos/latex/project-tcc/resources/experimento/artefatos/03-coleta-principal-n204/metricas-consolidadas-204.json) e com os relatórios em [`resources/experimento/`](file:///c:/Projetos/latex/project-tcc/resources/experimento)?
- [ ] **Transparência sobre Falhas e Discrepâncias:** Os resultados adversos ($C_3$, ancoragem de *schema* em Trancamento, colapso `0%` em Proficiência e as 3 falhas residuais em $C_4$) estão apresentados e explicados sem omissão?
- [ ] **Confronto Formal de Hipóteses:** As hipóteses $H_0$ e $H_1$ do Capítulo 3 são retomadas explicitamente e confrontadas com as evidências empíricas e seus contrastes pareados?
- [ ] **Ligação com a Teoria (Cap. 2):** Os achados dialogam com a literatura revisada no Referencial Teórico (RAG estruturado vs. paramétrico, alucinações, falhas em protocolos MCP e papel do HITL)?
- [ ] **Qualidade Visual e Tipográfica:** Tabelas enxutas sem congestão de flutuadores, gráficos vetoriais legíveis em PDF, citações ABNT consistentes com `src/referencias.bib` e aprovação limpa em `.\make.bat check --json`?

---

## 6. Referências Citadas

* BEST, John W. *Research in education*. 2. ed. Englewood Cliffs: Prentice-Hall, 1972 *(apud Lakatos; Marconi, 2003, p. 167–169)*.
* LAKATOS, Eva Maria; MARCONI, Marina de Andrade. *Fundamentos de metodologia científica*. 5. ed. São Paulo: Atlas, 2003.
* SEVERINO, Antônio Joaquim. *Metodologia do trabalho científico*. 24. ed. São Paulo: Cortez, 2017.
* TRUJILLO FERRARI, Alfonso. *Metodologia da ciência*. 3. ed. Rio de Janeiro: Kennedy, 1974 *(apud Lakatos; Marconi, 2003, p. 167)*.

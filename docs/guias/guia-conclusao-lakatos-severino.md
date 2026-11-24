# Guia Metodológico: Como Construir o Capítulo de Conclusão (Considerações Finais) em Trabalhos Acadêmicos e Tecnológicos

> **Fundamentação Epistemológica:** Diretrizes clássicas de síntese conclusiva, fechamento lógico, recomendações práticas e sugestões para trabalhos futuros extraídas diretamente dos originais de **Lakatos e Marconi (2003)** e **Severino (2017)**.  
> **Finalidade:** Servir como manual de referência metodológica e redacional para planejar, estruturar, redigir e revisar o **Capítulo 6 (Considerações Finais)** do TCC, assegurando coerência integral com a Introdução (Cap. 1) e os Resultados e Discussão (Cap. 5).  
> **Aplicação Específica:** TCC em Bacharelado em Sistemas de Informação (IFS *Campus* Lagarto) — Encerramento da investigação experimental ($N = 8$ e $N = 204$), síntese das contribuições em MCP/RAG estruturado, recomendações arquiteturais e agenda de trabalhos futuros.

---

## Sumário

0. [Localização das Fontes nos PDFs de Referência](#0-localização-das-fontes-nos-pdfs-de-referência)
1. [Fundamentos Epistemológicos da Conclusão Científica](#1-fundamentos-epistemológicos-da-conclusão-científica)
   - [1.1 A Conclusão como Síntese e Balanço Crítico (Severino, 2017)](#11-a-conclusão-como-síntese-e-balanço-crítico-severino-2017)
   - [1.2 Vinculação às Hipóteses, Súmula e Recomendações vs. Sugestões (Lakatos & Marconi, 2003)](#12-vinculação-às-hipóteses-súmula-e-recomendações-vs-sugestões-lakatos--marconi-2003)
   - [1.3 Fronteiras Lógicas com os Demais Capítulos](#13-fronteiras-lógicas-com-os-demais-capítulos)
2. [Mapeamento Direto do TCC: Fechamento do Arco Cap. 1 ↔ Cap. 5](#2-mapeamento-direto-do-tcc-fechamento-do-arco-cap-1--cap-5)
   - [2.1 Resposta ao Problema de Pesquisa e às Hipóteses Formais](#21-resposta-ao-problema-de-pesquisa-e-às-hipóteses-formais)
   - [2.2 Verificação dos Objetivos Específicos (OE1 a OE7)](#22-verificação-dos-objetivos-específicos-oe1-a-oe7)
   - [2.3 Separação entre Recomendações Práticas e Trabalhos Futuros](#23-separação-entre-recomendações-práticas-e-trabalhos-futuros)
3. [Estrutura Temática Recomendada para o Capítulo 6 (`06-conclusao.tex`)](#3-estrutura-temática-recomendada-para-o-capítulo-6-06-conclusaotex)
4. [Técnicas de Redação, Tempos Verbais e Alinhamento com o Resumo](#4-técnicas-de-redação-tempos-verbais-e-alinhamento-com-o-resumo)
5. [Armadilhas Críticas e Checklist Final do Capítulo 6](#5-armadilhas-críticas-e-checklist-final-do-capítulo-6)
6. [Referências Citadas](#6-referências-citadas)

---

## 0. Localização das Fontes nos PDFs de Referência

Todas as diretrizes normativas e citações literais deste guia foram verificadas diretamente nos originais em `resources/references/metodologia-e-engenharia/` via extração programática em Python (`PyMuPDF`):

| Obra | Arquivo no Repositório | Mapeamento Livro $\leftrightarrow$ PDF | Seções e Páginas Extraídas |
| :--- | :--- | :--- | :--- |
| **LAKATOS, Eva Maria; MARCONI, Marina de Andrade.** *Fundamentos de Metodologia Científica*. 5. ed. Atlas, 2003. | `lakatos2003-fundamentos-metodologia-cientifica.pdf` | Pág. do Livro = Pág. do PDF + 1 | **Seção 8.2.3.5** (*Conclusões*, Livro p. 171 / PDF p. 170);<br>**Seções 10.4.10–10.4.11** (*Conclusões* e *Recomendações e Sugestões*, Livro p. 232 / PDF p. 231);<br>**Seção 11.2.3, c** (*Estrutura da Monografia: Conclusão*, Livro p. 236 / PDF p. 235);<br>**Seção 11.3.5, c** (*Conclusões da Dissertação*, Livro p. 243 / PDF p. 242);<br>**Seção 12.1.2.3–12.1.2.4** (*Conclusão e Requisitos de Linguagem*, Livro p. 254–255 / PDF p. 253–254). |
| **SEVERINO, Antônio Joaquim.** *Metodologia do Trabalho Científico*. 24. ed. Cortez, 2017. | `severino2017-metodologia-trabalho-cientifico-24ed.pdf` | Pág. do Livro = Pág. do PDF (1:1) | **Seção 4.2** (*Construção Lógica do Trabalho: Estrutura Formal*, p. 181–183);<br>**Seção 4.2.3, 3.a–3.b** (*Redação, Sobriedade e Construção do Parágrafo*, p. 183–185);<br>**Seção 4.3.1** (*Núcleo do Trabalho*, p. 186–187);<br>**Seção 5.3** (*O TCC — Trabalho de Conclusão de Curso*, p. 239–240). |

---

## 1. Fundamentos Epistemológicos da Conclusão Científica

Na tradição metodológica brasileira representada por Severino e Lakatos & Marconi, o capítulo final **não é um mero arremate estilístico** nem um resumo repetitivo do último capítulo: ele constitui o fechamento da demonstração lógica que amarra a problematização inicial (Introdução) às provas empíricas obtidas (Resultados e Discussão).

### 1.1 A Conclusão como Síntese e Balanço Crítico (Severino, 2017)

Severino (2017, p. 181–183) insere a conclusão na tríade orgânica da construção lógica (*Introdução, Desenvolvimento e Conclusão*), definindo-a com precisão:

> *"A construção lógica do trabalho é o arranjo encadeado dos raciocínios utilizados para a demonstração da hipótese formulada no início. [...] Todo trabalho científico [...] deve constituir uma totalidade de inteligibilidade, estruturalmente orgânica, deve formar uma unidade com sentido intrínseco e autônomo para o leitor que não participou de sua elaboração, que internamente as partes se concatenem logicamente."*  
> — **SEVERINO (2017, p. 181)**

> *"A conclusão é a síntese para a qual caminha o trabalho. Será breve e visará recapitular sinteticamente os resultados da pesquisa elaborada até então. Se o trabalho visar resolver uma tese-problema e se, para tal, o autor desenvolver uma ou várias hipóteses, através do raciocínio, a conclusão aparecerá como um balanço do empreendimento. O autor manifestará seu ponto de vista sobre os resultados obtidos, sobre o alcance deles."*  
> — **SEVERINO (2017, p. 183)**

Quanto à forma e ao estilo redacional da conclusão e de todo o núcleo final:
- **Brevidade e sobriedade (p. 183–184):** deve ser enxuta e precisa, evitando *"a pomposidade pretensiosa, o verbalismo vazio, as fórmulas feitas e a linguagem sentimental"*;
- **Síntese crítica proporcional (p. 183):** quando a discussão analítica aprofundada já ocupa capítulo próprio (como o nosso Capítulo 5), a conclusão retoma apenas o balanço essencial do empreendimento e o alcance dos achados, sem repetir minúcias já demonstradas.

### 1.2 Vinculação às Hipóteses, Súmula e Recomendações vs. Sugestões (Lakatos & Marconi, 2003)

Lakatos e Marconi (2003) complementam a visão de Severino especificando quatro pilares obrigatórios para a seção ou capítulo conclusivo:

1. **Vínculo explícito com as hipóteses e síntese dos achados (Seção 8.2.3.5, Livro p. 171 / PDF p. 170):**
   > *"As conclusões devem estar vinculadas à hipótese de investigação, cujo conteúdo foi comprovado ou refutado. Em termos formais, é uma exposição factual sobre o que foi investigado, analisado, interpretado; é uma síntese comentada das idéias essenciais e dos principais resultados obtidos, explicitados com precisão e clareza. Ao se redigirem as conclusões, os problemas que ficaram sem solução serão apontados, a fim de que no futuro possam ser estudados pelo próprio autor ou por outros."*
2. **Os quatro elementos de conteúdo e a redação categórica (Seção 10.4.10, Livro p. 232 / PDF p. 231):**
   As conclusões devem obrigatoriamente:
   - **Evidenciar as conquistas** alcançadas com o estudo;
   - **Indicar as limitações e reconsiderações** emergentes;
   - **Apontar a relação entre os fatos verificados e a teoria**;
   - **Representar** *"a súmula em que os argumentos, conceitos, fatos, hipóteses, teorias, modelos se unem e se completam"* (TRUJILLO FERRARI, 1982, p. 295 *apud* LAKATOS; MARCONI, 2003, p. 232).  
   Além disso, *"a maneira de redigir as conclusões deve ser precisa e categórica, sendo as mesmas pertinentes e ligadas às diferentes partes do trabalho. Dessa forma, não podem perder-se em argumentações, mas, ao contrário, têm de refletir a relação entre os dados obtidos e as hipóteses enunciadas."* (p. 232).
3. **Distinção funcional entre *Recomendações* e *Sugestões* (Seção 10.4.11, Livro p. 232 / PDF p. 231):**
   - **Recomendações:** *"indicações, de ordem prática, de intervenções na natureza ou na sociedade [ou na engenharia do sistema/instituição], de acordo com as conclusões da pesquisa"* — no caso do TCC, são as diretrizes concretas de projeto para quem construir ou implantar assistentes acadêmicos via MCP;
   - **Sugestões (Trabalhos Futuros):** *"importantes para o desenvolvimento da ciência: apresentam novas temáticas de pesquisa, inclusive levantando novas hipóteses, abrindo caminho a outros pesquisadores"*.
4. **Fecho da Introdução e unidade arquitetural (Seção 11.2.3, Livro p. 236 / PDF p. 235):**
   > *"A conclusão consiste no resumo completo, mas sintetizado, da argumentação dos dados e dos exemplos constantes das duas primeiras partes do trabalho. Da conclusão devem constar a relação existente entre as diferentes partes da argumentação e a união das idéias e, ainda, conter o fecho da introdução ou síntese de toda reflexão."*
   E conforme Barras (1979 *apud* LAKATOS; MARCONI, 2003, p. 255), toda conclusão deve preservar **imparcialidade** (esclarecendo limites), **ordem lógica** e **acuidade verificável**.

### 1.3 Fronteiras Lógicas com os Demais Capítulos

| Elemento | Onde reside o detalhamento | Como entra no Capítulo 6 (Considerações Finais) |
| :--- | :--- | :--- |
| **Problema, Hipótese e 7 Objetivos** | Capítulo 1 ([`01-introducao.tex`](file:///c:/Projetos/latex/project-tcc/src/capitulos/01-introducao.tex)) | Retomados explicitamente para **prestar contas** ponto a ponto do que foi respondido e comprovado. |
| **Fundamentação e Trabalhos Correlatos** | Capítulo 2 ([`02-referencial.tex`](file:///c:/Projetos/latex/project-tcc/src/capitulos/02-referencial.tex)) | Apenas síntese da contribuição comparativa frente às lacunas identificadas nos estudos anteriores (sem novas resenhas). |
| **Protocolo, Fatorial e Artefato** | Capítulos 3 e 4 | Referenciados como meios executados (sem redescrever arquitetura, equações ou listas de RFs/ADRs). |
| **Métricas, Auditoria Forense e Discussão** | Capítulo 5 ([`05-resultados.tex`](file:///c:/Projetos/latex/project-tcc/src/capitulos/05-resultados.tex)) | Consolidados em **súmula categórica** com os números-chave ($86{,}76\%$, $+51{,}47$ p.p., $\text{TFC}$, estabilidade $98{,}53\%$), sem reinserir tabelas ou análises extensas. |

---

## 2. Mapeamento Direto do TCC: Fechamento do Arco Cap. 1 $\leftrightarrow$ Cap. 5

Antes de redigir [`src/capitulos/06-conclusao.tex`](file:///c:/Projetos/latex/project-tcc/src/capitulos/06-conclusao.tex) (cujo texto atual ainda reflete a etapa preliminar de TCC~I com projeções futuras), deve-se auditar o fechamento exato de cada promessa feita na Introdução.

### 2.1 Resposta ao Problema de Pesquisa e às Hipóteses Formais

- **Pergunta de Pesquisa (`01-introducao.tex`, Seção 1.2):**  
  *Em que medida a disponibilização integrada de informações normativas e dados acadêmicos discentes influencia a conformidade documental das saídas geradas para requerimentos de Trancamento de Matrícula (total e parcial) e Exame de Proficiência, em comparação com a disponibilização isolada dessas informações e com uma linha de base sem ferramentas de consulta, no curso de Bacharelado em Sistemas de Informação do IFS, Campus Lagarto?*
- **Resposta Síntese Verificada no Cap. 5 ($N = 204$):**  
  - A disponibilização integrada ($C_4$: $D_1 N_1$) elevou a $\text{TCD}_{\text{final}}$ média de **$35{,}29\%$** na linha de base ($C_1$) para **$86{,}76\%$** ($+51{,}47$ p.p., fator de $2{,}46\times$) e a $\text{TCD}_{\text{parcial}}$ de **$41{,}18\%$** para **$95{,}59\%$** ($+54{,}41$ p.p.), superando também o contexto normativo isolado ($C_2 = 57{,}35\%$, ganho de $+29{,}41$ p.p.) e o contexto cadastral isolado ($C_3 = 43{,}14\%$, ganho de $+43{,}63$ p.p.).
  - Rejeita-se $\text{H}_0$ e confirma-se $\text{H}_1$, atribuindo o efeito ao **fornecimento controlado dos contextos informacionais ($D$ e $N$) sob a arquitetura MCP** (uma vez que `gerar-requerimento` operou em todas as condições).
  - Demonstra-se adicionalmente a **interação sinérgica $N \times D$ ($+21{,}57$ p.p.)** e o **efeito protetor do contexto normativo**: fornecer dados discentes sem normas ($C_3$) produziu o pior pico de alucinação confiante ($\text{TFC} = 47{,}06\%$), enquanto acoplar o ROD e o calendário eliminou por completo as falhas críticas em Trancamento ($97{,}50\%$ de $\text{TCD}_{\text{final}}$, $0{,}00\%$ de $\text{TFC}$) e zerou as falhas na condição $C_2$ ($\text{TDP} = 100{,}00\%$, $\text{TFC} = 0{,}00\%$).

### 2.2 Verificação dos Objetivos Específicos (OE1 a OE7)

| Objetivo (`01-introducao.tex`, Seção 1.4) | Evidência de Atendimento no Trabalho | Status |
| :--- | :--- | :--- |
| **OE1 — Realizar** levantamento documental do ROD, calendário acadêmico e formulário da CRE. | Sistematização das fontes `L-001` a `L-009`, consolidação das 19 regras estruturadas (ROD + resoluções modificativas até Res. 67/2021), calendário `2026.1`/`2026.2` e estrutura do formulário CRE (Caps. 3 e 4). | Atendido |
| **OE2 — Implementar** protótipo conversacional MCP integrado a regras do ROD, calendário e dados discentes. | Desenvolvimento do servidor `tcc-server` (`mcp-use 2.5.2`) com as quatro ferramentas desacopladas em Dupla Camada Semântica e provedores duais (SUAP real + sintético) (Cap. 4). | Atendido |
| **OE3 — Validar** tecnicamente comunicação autenticada com SUAP real e cliente compatível. | Execução do *Teste 1* (Seção 4.8): autenticação JWT na API REST do SUAP (`1.225 ms`) e fluxo completo no Claude Desktop via `mcp-remote` na conta institucional do pesquisador, mantendo base sintética no experimento controlado. | Atendido |
| **OE4 — Modelar** orquestração e descrições das ferramentas para controlar $N$ e $D$ nas 4 condições. | Controle fatorial $2 \times 2$ na bancada `runner-tcd.ts` com $0/204$ omissões de ferramentas e $0/204$ encerramentos forçados, acrescido da descoberta empírica e remediação arquitetural de *Schema Leakage* (`D-038`/`D-039`, Caps. 4 e 5). | Atendido |
| **OE5 — Desenvolver** painel visual interativo sob supervisão humana e exportação PDF em folha única A4. | Implementação da Folha Única A4 via MCP Apps (`ui://views/painel-auditoria.html`), Trava $D_5$, modal de retorno HITL (`useSendFollowUp`) e exportação PDF vetorial (Seção 4.7). | Atendido |
| **OE6 — Construir** conjunto de dados sintéticos para Trancamento e Exame de Proficiência. | Criação de 6 *Golden Personas* e 17 casos sintéticos (`TRANC-01..10`, `PROF-01..07`) em `fixtures-tcd-v0.2.json`, cobrindo regularidades, exceções médicas, revogações históricas e casos de borda (Cap. 3). | Atendido |
| **OE7 — Mensurar e comparar** TCD, TDP e TFC nas 4 condições com rubrica calibrada por piloto. | Execução do Piloto ($N = 8$, concordância cega de $100{,}0\%$ em `32/32` subcritérios e `16/16` *flags*) seguido da Coleta Principal ($N = 204$, estabilidade intra-célula de $98{,}53\%$), seis contrastes pareados e auditoria forense completa (Cap. 5). | Atendido |

### 2.3 Separação entre Recomendações Práticas e Trabalhos Futuros

Conforme Lakatos e Marconi (2003, p. 232), convém separar nitidamente no Capítulo 6:

1. **Recomendações Práticas de Engenharia e Uso Institucional (o que já decorre dos achados para quem for adotar ou implantar):**
   - Nunca expor dados cadastrais/acadêmicos de alunos ($D_1$) a um LLM sem pareamento obrigatório com regras institucionais e calendário atualizados ($N_1$);
   - Transferir cálculos aritméticos estritos (teto de $50\%$ no Art.~39) e checagens de contadores de reincidência para pré-condições determinísticas no servidor MCP antes da etapa de inferência generativa (`PROF-05_C4` e `PROF-07_C4`);
   - Manter validação Zod estrita em tempo de execução no servidor (para barrar omissões como `TRANC-10_C4`) e preservar exemplos normativos fora de descrições de *schema* e de `server.instructions` (`D-039`);
   - Preservar o modelo assistivo sob supervisão humana (**HITL**) e a conferência disciplinar manual pela CRE no SIPAC (`D-013`).

2. **Sugestões para Trabalhos Futuros (novas pesquisas e evoluções pós-TCC):**
   - **Ciclo 2 experimental descontaminado (*Clean-Room*) e avaliação multimodelo:** eliminar os quatro focos residuais de ancoragem lexical mapeados em `D-038`/`D-039` e comparar modelos de maior capacidade e com raciocínio estendido frente ao modelo compacto invariante;
   - **Validação empírica com usuários reais, acessibilidade e LGPD em produção:** conduzir testes de usabilidade com discentes e servidores da CRE, inspeção automatizada e com leitores de tela para validação efetiva dos critérios WCAG~2.2~AA e auditoria operacional de conformidade com a LGPD (alinhada ao recorte calibrado no Cap. 3 e Cap. 4);
   - **Evolução funcional planejada (`RF-10` a `RF-12`) e escala institucional:** implementar as rotas ampliadas do SUAP (`RF-10`: simulador de aprovação, auditor de atividades complementares e recomendador de matrícula), ampliar a base normativa para o ROD integral, PPCs, estágios e editais (`RF-11`), e incorporar cache local (*Stale-While-Revalidate*) e suporte multi-*campus* no IFS (`RF-12`);
   - **Ingestão normativa semiautomática e grafos de conhecimento:** investigar extratores auditáveis para portarias e resoluções modificativas a fim de reduzir o esforço de curadoria manual do `rodRegras.json`.

---

## 3. Estrutura Temática Recomendada para o Capítulo 6 (`06-conclusao.tex`)

Em obediência à recomendação de brevidade e síntese de Severino (2017, p. 183) e à súmula categórica de Lakatos e Marconi (2003, p. 232), recomenda-se estruturar o Capítulo 6 em **quatro seções concisas** (aproximadamente 3 a 5 páginas no total, sem tabelas extensas e sem repetir explicações metodológicas):

| Seção | Título Temático Sugerido | Papel Epistemológico (Lakatos / Severino) | Conteúdo Essencial |
| :---: | :--- | :--- | :--- |
| **6.1** | **Síntese dos Achados e Resposta aos Objetivos** | Fecho da Introdução (Lakatos, p. 236) e balanço do empreendimento perante o problema e hipóteses (Severino, p. 183; Lakatos, p. 171). | Retomada direta da pergunta de pesquisa, confirmação de $\text{H}_1$ (rejeição de $\text{H}_0$), síntese numérica essencial ($35{,}29\% \rightarrow 86{,}76\%$, $C_3 = 47{,}06\%$ $\text{TFC}$, Trancamento $97{,}50\%$) e prestação de contas dos sete objetivos específicos (`OE1`–`OE7`). |
| **6.2** | **Contribuições da Pesquisa** | Evidenciação das conquistas e ligação síntese-teoria (Lakatos, p. 232). | Três eixos claros de contribuição: (i) **arquitetural** (RAG estruturado via MCP + HITL superando o teto de assistentes apenas informativos); (ii) **científica/empírica** (evidência do efeito protetor de $N_1$, do risco de $D_1$ isolado e do fenômeno *Schema Leakage*); e (iii) **metodológica/tecnológica** (rubrica calibrada TCD/TDP/TFC e artefato reprodutível via *tags* Git). |
| **6.3** | **Recomendações Práticas e Implicações para Implantação** | Recomendações de ordem prática derivadas das conclusões (Lakatos, p. 232). | Diretrizes concretas para engenharia de servidores MCP e implantação institucional segura no IFS (pré-computação aritmética determinística, higiene epistêmica de *schemas*, validação estrita em *runtime* e governança HITL/SIPAC), articuladas ao reconhecimento conciso dos limites observados. |
| **6.4** | **Trabalhos Futuros** | Problemas sem solução aberta e sugestões para novas pesquisas (Lakatos, p. 171, 232). | Quatro frentes objetivas: (i) *Ciclo 2 Clean-Room* e comparação multimodelo; (ii) validação empírica de usabilidade (discentes e CRE), acessibilidade WCAG~2.2~AA e auditoria LGPD em produção; (iii) evolução funcional (`RF-10`–`RF-12`) e expansão multi-*campus*; e (iv) curadoria normativa semiautomática com apoio de grafos de conhecimento. |

---

## 4. Técnicas de Redação, Tempos Verbais e Alinhamento com o Resumo

- **Tempo verbal:**
  - **Pretérito perfeito** para atestar o que foi executado e constatado (*"concluiu-se"*, *"os resultados comprovaram"*, *"o protótipo implementou"*, *"rejeitou-se a hipótese nula"*);
  - **Presente do indicativo** para formulações conceituais estáveis, implicações arquiteturais permanentes e contribuições consolidadas (*"evidencia-se"*, *"recomenda-se"*, *"a arquitetura demonstra"*);
  - **Futuro do pretérito / infinitivo propositivo** apenas na Seção `6.4` (*"propõe-se investigar"*, *"permitiria comparar"*).
- **Estilo categórico sem triunfalismo:** Lakatos e Marconi (2003, p. 232) prescrevem precisão categórica baseada estritamente nas evidências obtidas. Evitar adjetivos exagerados (*"revolucionário"*, *"infalível"*, *"100% eficaz"*) e manter visível a ressalva sobre os casos de borda em Proficiência ($71{,}43\%$ / $\text{TFC} = 28{,}57\%$) e sobre o escopo sintético do experimento.
- **Remoção total de projeções de TCC~I:** o arquivo atual [`06-conclusao.tex`](file:///c:/Projetos/latex/project-tcc/src/capitulos/06-conclusao.tex) contém expressões como *"espera-se que os resultados..."* e *"Os próximos passos para a continuidade deste projeto no Trabalho de Conclusão de Curso II compreendem..."*, que **precisam ser integralmente substituídas** pela síntese efetivamente concluída.
- **Ponte para o Resumo e *Abstract*:** Severino (2017, p. 249–250) e Lakatos e Marconi (2003, p. 171) lembram que Introdução, Conclusão e Resumo formam os polos de coerência final do texto. Ao concluir o Capítulo 6, deve-se revisar [`src/pre-textuais.tex`](file:///c:/Projetos/latex/project-tcc/src/pre-textuais.tex) (Resumo e *Abstract*) para incorporar os números e conclusões definitivas (sempre solicitando permissão antes de editar Área Restrita).

---

## 5. Armadilhas Críticas e Checklist Final do Capítulo 6

### Armadilhas Comuns a Evitar
1. **Deixar resquícios de texto prospectivo do TCC~I** (*"espera-se comprovar"*, *"no TCC~II será executado"*).
2. **Introduzir números, referências ou argumentos novos** que não tenham sido apresentados e discutidos no Capítulo 5.
3. **Transformar o Capítulo 6 em resumo mecânico capítulo por capítulo** (*"No Capítulo 2 viu-se..., no Capítulo 3 fez-se..."*) em vez de síntese lógica de achados, respostas aos objetivos, recomendações e prospecção científica.
4. **Exagerar a generalização para fora do escopo validado** (esquecendo que a coleta principal usou `gemini-3.5-flash-lite`, 17 casos sintéticos do *Campus* Lagarto e não realizou validação com usuários reais nem auditoria operacional de WCAG/LGPD).
5. **Esquecer de responder explicitamente aos sete objetivos específicos e às hipóteses $\text{H}_0 / \text{H}_1$**.

### Checklist de Revisão antes de Fechar o Capítulo 6
- [ ] **Coerência Cap. 1 $\leftrightarrow$ Cap. 6:** Pergunta de pesquisa, $\text{H}_0/\text{H}_1$, Objetivo Geral e Objetivos Específicos `1` a `7` recebem resposta explícita?
- [ ] **Fidelidade aos Números do Cap. 5:** Todos os valores citados (`35,29%`, `57,35%`, `43,14%`, `86,76%`, `+51,47 p.p.`, `47,06%`, `97,50%`, `71,43%`, `98,53%`, `N=8`, `N=204`) conferem exatamente com [`05-resultados.tex`](file:///c:/Projetos/latex/project-tcc/src/capitulos/05-resultados.tex)?
- [ ] **Separação Recomendações vs. Trabalhos Futuros:** Intervenções práticas de projeto (`6.3`) estão claramente distinguidas de agendas futuras de pesquisa (`6.4`)?
- [ ] **Alinhamento sobre WCAG, LGPD e *Clean-Room*:** Validação efetiva com usuários reais, acessibilidade WCAG~2.2~AA, auditoria LGPD em produção e *Ciclo 2 Clean-Room* estão posicionados coerentemente em Trabalhos Futuros?
- [ ] **Qualidade Tipográfica e Compilação Limpa:** Zero referências indefinidas, zero alertas novos em `.\make.bat check --json`, estilo impessoal conforme `academic_writing_style`.

---

## 6. Referências Citadas

* BARRAS, Robert. *Os cientistas precisam escrever: guia de redação para cientistas, engenheiros e estudantes*. São Paulo: T. A. Queiroz / EDUSP, 1979 *(apud Lakatos; Marconi, 2003, p. 255)*.
* LAKATOS, Eva Maria; MARCONI, Marina de Andrade. *Fundamentos de metodologia científica*. 5. ed. São Paulo: Atlas, 2003.
* SEVERINO, Antônio Joaquim. *Metodologia do trabalho científico*. 24. ed. São Paulo: Cortez, 2017.
* TRUJILLO FERRARI, Alfonso. *Metodologia da pesquisa científica*. São Paulo: McGraw-Hill do Brasil, 1982 *(apud Lakatos; Marconi, 2003, p. 232)*.

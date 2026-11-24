# Guia Prático: Construção do Referencial Teórico do TCC

> **Base metodológica:** Lakatos e Marconi (2003) e Severino (2007), conferidos diretamente nos PDFs desta pasta.
> **Objetivo:** transformar as orientações dos dois livros em um procedimento passo a passo, desde a leitura metodológica até a redação de cada seção do Capítulo 2 ([`02-referencial.tex`](../src/capitulos/02-referencial.tex)).

> [!IMPORTANT]
> Este guia distingue duas coisas:
> - **📖 O que os autores dizem:** orientações localizadas nos livros, com página do livro e página do PDF.
> - **🛠️ Decisão do projeto:** adaptações práticas para este TCC (ferramentas, bases de busca, modelos de matriz). Elas **não** devem ser atribuídas a Lakatos, Marconi ou Severino.
>
> Os livros de metodologia fundamentam **como pesquisar e escrever**. Eles **não** substituem as fontes técnicas sobre LLMs, RAG, MCP e assistentes acadêmicos, que precisam vir da literatura especializada.

---

## Sumário

0. [Como usar este guia e localizar as páginas nos PDFs](#0-como-usar-este-guia-e-localizar-as-páginas-nos-pdfs)
1. [Etapa 1: Estudar a base metodológica (Lakatos e Severino)](#etapa-1--estudar-a-base-metodológica)
2. [Etapa 2: Definir o problema e as perguntas do referencial](#etapa-2--definir-o-problema-e-as-perguntas-do-referencial)
3. [Etapa 3: Definir a estrutura provisória (plano de trabalho)](#etapa-3--definir-a-estrutura-provisória-plano-de-trabalho)
4. [Etapa 4: Inventariar e avaliar as fontes existentes](#etapa-4--inventariar-e-avaliar-as-fontes-existentes)
5. [Etapa 5: Busca complementar (heurística)](#etapa-5--busca-complementar-heurística)
6. [Etapa 6: Triagem das fontes](#etapa-6--triagem-das-fontes)
7. [Etapa 7: Leitura analítica e fichamento](#etapa-7--leitura-analítica-e-fichamento)
8. [Etapa 8: Matriz de Fichamento Analítico (comparativa)](#etapa-8--matriz-de-fichamento-analítico-comparativa)
9. [Etapa 9: Síntese crítica e identificação de lacunas](#etapa-9--síntese-crítica-e-identificação-de-lacunas)
10. [Etapa 10: Mapa de rastreabilidade (afirmação → fonte → página)](#etapa-10--mapa-de-rastreabilidade)
11. [Etapa 11: Redação incremental, seção por seção](#etapa-11--redação-incremental-seção-por-seção)
12. [Etapa 12: Revisão, citações e validação técnica](#etapa-12--revisão-citações-e-validação-técnica)
13. [Apêndice A: Índice remissivo de páginas](#apêndice-a--índice-remissivo-de-páginas)
14. [Apêndice B: Checklist geral](#apêndice-b--checklist-geral)

---

## 0. Como usar este guia e localizar as páginas nos PDFs

### Arquivos

| Obra | Arquivo | Chave no `.bib` | Tipo de PDF |
| :--- | :--- | :--- | :--- |
| LAKATOS, E. M.; MARCONI, M. A. *Fundamentos de metodologia científica*. 5. ed. São Paulo: Atlas, 2003. | [lakatos2003-fundamentos-metodologia-cientifica.pdf](./LAKATOS%20-%20MARCONI%20-%20FUNDAMENTOS%20DE%20METODOLOGIA%20CIENTIFICA.pdf) | `lakatos2003` | Texto pesquisável (Ctrl+F funciona, com falhas de acentuação do OCR). |
| SEVERINO, A. J. *Metodologia do trabalho científico*. 23. ed. São Paulo: Cortez, 2007. | [SEVERINO_Metodologia_do_Trabalho_Cientifico_2007.pdf](./SEVERINO_Metodologia_do_Trabalho_Cientifico_2007.pdf) | `severino2007` | **Imagem escaneada** (Ctrl+F **não** funciona). Cada página do PDF contém **duas** páginas do livro. |

### Conversão entre página do livro e página do PDF

| Obra | Regra | Exemplo |
| :--- | :--- | :--- |
| **Lakatos e Marconi** | **página do PDF = página do livro − 1** | Livro p. 44 → PDF p. 43 |
| **Severino** | **página do PDF = ⌊página do livro ÷ 2⌋ + 1** | Livro p. 148 → PDF p. 75 (que mostra as p. 148–149) |

> [!TIP]
> Na maioria dos visualizadores (navegador, VS Code, Acrobat), é possível ir direto à página do PDF com `Ctrl+G` ou acrescentando `#page=N` ao caminho do arquivo.
> **Na citação do TCC, use sempre a página do livro impresso**, nunca a página do PDF.

---

## Etapa 1: Estudar a base metodológica

**Objetivo:** entender o que é e para que serve um referencial teórico antes de produzir qualquer texto.
**Resultado esperado:** anotações pessoais sobre os seis temas abaixo, com páginas.

### 1.1 Roteiro de leitura obrigatória (em ordem)

| # | Tema | Lakatos e Marconi (livro → PDF) | Severino (livro → PDF) |
| :-: | :--- | :--- | :--- |
| 1 | **Finalidade do referencial teórico** | 10.2.6 *Embasamento teórico*: p. 224–225 → PDF 223–224; 10.4.5 *Revisão bibliográfica*: p. 230 → PDF 229; 5.1.1 *Papel da teoria*: p. 115–118 → PDF 114–117 | 4.1.1, obs. 4: p. 132 → PDF 67; 4.2.3 *Raciocínio demonstrativo*: p. 148–150 → PDF 75–76 |
| 2 | **Pesquisa bibliográfica e levantamento** | 2.1 *Fases da pesquisa bibliográfica*: p. 44–49 → PDF 43–48; 9.1.2 *Pesquisa bibliográfica*: p. 183–185 → PDF 182–184 | 3.4.7: p. 122 → PDF 62; 4.2.1 *Levantamento das fontes*: p. 133–144 → PDF 67–73 |
| 3 | **Seleção, leitura, análise e fichamento** | 1.1 *Leitura*: p. 19–27 → PDF 18–26; 1.2 *Análise de texto*: p. 27–35 → PDF 26–34; 2.2 *Fichas*: p. 49–68 → PDF 48–67; 2.3 *Resumos*: p. 68–73 → PDF 67–72 | 2.2.1 *Leitura analítica*: p. 49–65 → PDF 25–33; 2.2.2 *Documentação*: p. 66–74 → PDF 34–38; 4.2.2 *Prática da documentação*: p. 144–148 → PDF 73–75 |
| 4 | **Revisão crítica e comparação entre autores** | 2.1.7 *Análise e interpretação*: p. 48–49 → PDF 47–48; 1.2.4 *Análise interpretativa e crítica*: p. 32–33 → PDF 31–32 | 1.d *Análise interpretativa*: p. 59–61 → PDF 30–31 |
| 5 | **Problema, lacunas e contribuição** | 5.1.1.5 *Indica lacunas no conhecimento*: p. 118 → PDF 117; 10.2.6.2 *Revisão da bibliografia*: p. 225 → PDF 224; 6.2 *Tema, problema e hipótese*: p. 126–128 → PDF 125–127 | 1.e *Problematização*: p. 62 → PDF 32; 4.1 *Projeto*: p. 129 → PDF 65 |
| 6 | **Citações, paráfrases e referências** | 2.2.3.2 *Ficha de citações*: p. 57–58 → PDF 56–57 | 2.b *Documentação temática*: p. 69 → PDF 35; 1.c *As citações*: p. 175–176 → PDF 88–89; 1.e *Referências no corpo do texto*: p. 179–181 → PDF 90–91; 1.f *Técnica bibliográfica*: p. 181–198 → PDF 91–100 |

> [!NOTE]
> Os itens 6.2 (Lakatos, p. 126–128), 6.3.3 *Comparação com outros estudos* (p. 133 → PDF 132) e 8.2.2.4 *Definição dos termos* (p. 160 → PDF 159) foram localizados pelo sumário, mas o conteúdo ainda não foi lido. Leia-os antes de citá-los.

### 1.2 Síntese do que os autores dizem (📖)

#### Tema 1: Finalidade e função do referencial teórico

- **Lakatos e Marconi (2003, p. 225; PDF 224):** *"Pesquisa alguma parte hoje da estaca zero."* A procura de fontes "torna-se imprescindível para a não-duplicação de esforços, a não 'descoberta' de idéias já expressas, a não-inclusão de 'lugares-comuns' no trabalho". A citação das conclusões de outros autores "permite salientar a contribuição da pesquisa realizada, demonstrar contradições ou reafirmar comportamentos e atitudes".
- **Lakatos e Marconi (2003, p. 224–225; PDF 223–224):** o embasamento teórico reúne três elementos: **teoria de base**, **revisão da bibliografia** e **definição dos termos**.
- **Lakatos e Marconi (2003, p. 115–118; PDF 114–117), papel da teoria:** a teoria (a) orienta os objetivos e restringe os fatos estudados; (b) oferece um sistema de conceitos e um vocabulário científico; (c) resume o conhecimento já existente; (d) prevê fatos; e (e) **indica lacunas no conhecimento**. Por isso, "antes de iniciar uma investigação, o pesquisador necessita conhecer a teoria já existente" (p. 118).
- **Lakatos e Marconi (2003, p. 230; PDF 229):** "a pesquisa bibliográfica não se encerra com a elaboração do projeto". O referencial continua aberto a obras novas.
- **Severino (2007, p. 132; PDF 67), obs. 4:** "nem sempre é necessário escrever um capítulo para explicar qual é o quadro teórico: o importante é basear-se nesse quadro teórico de maneira coerente."
- **Severino (2007, p. 148–150; PDF 75–76):** todo trabalho científico "deve constituir uma totalidade de inteligibilidade, estruturalmente orgânica". Os capítulos e parágrafos "devem ter uma sequência lógica rigorosa". A fundamentação deve **explicar** (descrever, classificar, definir), **discutir** ("comparar as várias posições que se entrechocam dialeticamente") e **demonstrar** ("partir de verdades garantidas para novas verdades").

> **Consequência para o TCC:** o Capítulo 2 é uma **argumentação**, não um catálogo de resumos. Cada seção precisa preparar o terreno para a proposta do trabalho.

#### Tema 2: Pesquisa bibliográfica e levantamento da literatura

- **Lakatos e Marconi (2003, p. 44; PDF 43):** a pesquisa bibliográfica tem **oito fases**: (a) escolha do tema; (b) elaboração do plano de trabalho; (c) identificação; (d) localização; (e) compilação; (f) fichamento; (g) análise e interpretação; (h) redação. **A redação é a última fase.**
- **Lakatos e Marconi (2003, p. 47; PDF 46), identificação:** consultar catálogos, depois o sumário/índice e os *abstracts* das obras e, por fim, a **bibliografia ao final** de livros e artigos. Esta última é a busca "em bola de neve".
- **Lakatos e Marconi (2003, p. 183; PDF 182):** a pesquisa bibliográfica "não é mera repetição do que já foi dito ou escrito sobre certo assunto, mas propicia o exame de um tema sob novo enfoque ou abordagem, chegando a conclusões inovadoras".
- **Lakatos e Marconi (2003, p. 186; PDF 185):** a pesquisa bibliográfica serve, em primeiro lugar, "para se saber em que estado se encontra atualmente o problema, que trabalhos já foram realizados a respeito e quais são as opiniões reinantes sobre o assunto". Também permite estabelecer "um modelo teórico inicial de referência".
- **Severino (2007, p. 122; PDF 62):** a pesquisa bibliográfica "é aquela que se realiza a partir do registro disponível, decorrente de pesquisas anteriores [...]. O pesquisador trabalha a partir das contribuições dos autores dos estudos analíticos constantes dos textos".
- **Severino (2007, p. 133–134; PDF 67–68):** a pesquisa deve recorrer "a um volume de fontes suficiente" para o raciocínio demonstrativo. Critério formal de levantamento: **"partir sempre do mais geral para o mais particular e do mais recente para o mais antigo"**, ressalvados os clássicos. *Heurística* é "a ciência, técnica e arte de localização e levantamento de documentos".
- **Severino (2007, p. 134; PDF 68):** a bibliografia especial deve ser **criteriosa**, "retendo apenas aquelas [obras] que interessem especificamente ao assunto tratado".
- **Severino (2007, p. 140; PDF 71), pesquisa na Internet:** diante do "excessivo volume de informações", "é preciso saber garimpar, sobretudo dirigindo-se a endereços certos". Destaca as bibliotecas universitárias e os bancos de teses.

#### Tema 3: Seleção, leitura, análise e fichamento

**Fases da leitura informativa (Lakatos e Marconi, 2003, p. 22–23; PDF 21–22):**

| Fase | O que fazer |
| :--- | :--- |
| a) Reconhecimento ou prévia | Leitura rápida do índice/sumário e dos títulos para verificar se o assunto existe. |
| b) Exploratória ou pré-leitura | Examinar página de rosto, introdução, prefácio, orelhas, bibliografia e notas. |
| c) Seletiva | Selecionar as informações mais importantes **relacionadas com o problema**; eliminar o supérfluo. |
| d) Reflexiva | Reconhecer e avaliar as informações e as intenções do autor. |
| e) Crítica | Avaliar as informações e ratificar ou retificar nossos próprios argumentos. |
| f) Interpretativa | Relacionar as afirmações do autor com **os problemas para os quais se busca solução**. É pertinente tudo o que serve para "provar, retificar ou negar, definir, delimitar e dividir conceitos". |
| g) Explicativa | Verificar os fundamentos de verdade do autor (necessária em monografias e teses). |

- **Lakatos e Marconi (2003, p. 19; PDF 18):** para identificar o texto, observar o **título**, a **data da publicação** (atualização e aceitação) e as **credenciais do autor**. Esse é um critério inicial de confiabilidade.
- **Lakatos e Marconi (2003, p. 29–30; PDF 28–29), objetivos da análise de texto:** distinguir fatos, hipóteses e problemas; encontrar ideias principais e secundárias; perceber como as ideias se relacionam; "identificar as conclusões e as bases que as sustentam".
- **Lakatos e Marconi (2003, p. 30–31; PDF 29–30):** a análise tem três partes: análise dos **elementos**, das **relações** (verifica a coerência entre partes e ideia central) e da **estrutura**.

**Leitura analítica (Severino, 2007, p. 53–65; PDF 27–33), as cinco abordagens:**

| Etapa | Livro → PDF | Perguntas-chave |
| :--- | :--- | :--- |
| **Delimitação da unidade** | p. 53–54 → PDF 27–28 | Qual trecho (capítulo, seção) tem um pensamento completo? |
| **1. Análise textual** | p. 54–56 → PDF 28–29 | Quem é o autor? Quais conceitos e termos preciso esclarecer? Qual o esquema do texto? |
| **2. Análise temática** | p. 56–59 → PDF 29–30 | De que fala o texto (tema)? Qual o problema? Qual a tese (ideia central)? Como o autor a demonstra (raciocínio)? Quais as ideias secundárias? |
| **3. Análise interpretativa** | p. 59–61 → PDF 30–31 | Como o texto se situa no pensamento do autor e da área? Quais seus pressupostos? Como se compara a ideias afins? Qual a crítica? |
| **4. Problematização** | p. 62 → PDF 32 | Quais questões explícitas ou implícitas o texto levanta para discussão? |
| **5. Síntese pessoal** | p. 62–63 → PDF 32 | O que eu concluo, articulando o texto ao meu problema? |

- **Severino (2007, p. 59; PDF 30):** "é esta análise temática que serve de base para o **resumo** ou **síntese** de um texto [...], a síntese das ideias do raciocínio e não a mera redução dos parágrafos."

**Tipos de fichas (Lakatos e Marconi, 2003, p. 56–59; PDF 55–58):**

| Ficha | Conteúdo | Página (livro → PDF) |
| :--- | :--- | :--- |
| Bibliográfica | Referência completa e descrição da obra. | p. 56 → PDF 55 |
| De citações | Transcrição fiel, **sempre entre aspas**, com o **número da página**. | p. 57 → PDF 56 |
| De resumo ou conteúdo | Síntese elaborada pelo leitor com suas próprias palavras. | p. 58 → PDF 57 |
| De esboço | Apresentação das principais ideias, de forma esquemática. | p. 59 → PDF 58 |
| De comentário ou analítica | Interpretação crítica pessoal, comparação com outros autores e "explicitação da importância da obra para o estudo em pauta". | p. 59 → PDF 58 |

Exemplos completos de cada ficha aparecem em Lakatos e Marconi (2003, p. 60–66; PDF 59–65).

- **Severino (2007, p. 146; PDF 74):** na pesquisa propriamente dita, a leitura não busca reconstituir o raciocínio do autor. Ela visa "o aproveitamento direto apenas daqueles elementos que sirvam para articular as ideias do novo raciocínio". Os elementos recolhidos "visam reforçar, apoiar e justificar as ideias pessoais formuladas pelo autor do trabalho".
- **Severino (2007, p. 147; PDF 74):** as fichas de documentação recebem **título e subtítulo**, "definidos pelas ideias diretrizes do roteiro provisório". Quando surge uma ideia nova, cria-se um novo título, que "passa a fazer parte do plano de trabalho". Ideias próprias também devem ser registradas.

#### Tema 4: Revisão crítica e comparação entre autores

- **Lakatos e Marconi (2003, p. 48–49; PDF 47–48), crítica do material bibliográfico:**
  - **Crítica externa:** do texto, da autenticidade (autor, tempo, lugar, circunstâncias) e da proveniência.
  - **Crítica interna:** de **interpretação** ("haver entendido o que o autor quis dizer, os problemas que postulou e as soluções que propôs") e do **valor interno do conteúdo** ("juízo sobre a autoridade do autor e o valor que representa o trabalho").
- **Lakatos e Marconi (2003, p. 32; PDF 31):** a análise interpretativa e crítica deve ser feita "do ponto de vista da coerência interna e validade dos argumentos [...] e da profundidade e originalidade dada à análise do problema".
- **Severino (2007, p. 60; PDF 31):** estabelecer "uma aproximação e uma associação das ideias expostas no texto com outras ideias semelhantes", fazendo "uma comparação com ideias temáticas afins".
- **Severino (2007, p. 61; PDF 31):** o juízo crítico tem duas perspectivas: (1) **coerência interna**, ou seja, se o autor atingiu logicamente os objetivos e se a conclusão está "realmente fundada numa argumentação sólida"; e (2) **originalidade, alcance, validade e contribuição** à discussão do problema.

#### Tema 5: Delimitação do problema e contribuição

- **Lakatos e Marconi (2003, p. 118; PDF 117):** a teoria indica "as áreas da realidade que demandam pesquisas". É ela que serve "de indicador para a delimitação do campo ou área mais necessitada de pesquisas".
- **Lakatos e Marconi (2003, p. 225; PDF 224):** salientar a contribuição da pesquisa, demonstrar contradições e enumerar discrepâncias são "de grande importância".
- **Lakatos e Marconi (2003, p. 44–45; PDF 43–44):** a delimitação do tema pode ser feita por adjetivos restritivos, complementos de especificação e determinação de circunstâncias (tempo e espaço).
- **Severino (2007, p. 62; PDF 32):** distingue a **determinação do problema** do texto (que conflito motivou o autor) da **problematização geral**, que levanta questões para discussão.

#### Tema 6: Citações, paráfrases e referências

- **Severino (2007, p. 69; PDF 35):** citação literal → **entre aspas** com indicação da fonte. Síntese das ideias (paráfrase) → **sem aspas**, mas **mantendo a fonte**. Ideias pessoais → sem aspas e sem referência, pois "a ausência de qualquer referência revela que são ideias elaboradas pelo próprio autor".
- **Severino (2007, p. 175; PDF 88):** as citações servem "para corroborar as ideias desenvolvidas pelo autor no decorrer do seu raciocínio". "Citações bem escolhidas apenas enriquecem o trabalho"; o inadmissível é "a transcrição literal de uma passagem de outro autor sem se fazer a devida referência". Usar *(sic!)*, apóstrofos para aspas internas e reticências para omissões.
- **Severino (2007, p. 179–180; PDF 90–91):** a citação de segunda mão (*apud*) precisa ser declarada e "só é usad[a] em caso de real necessidade".
- **Lakatos e Marconi (2003, p. 57; PDF 56):** na ficha de citações, as aspas são obrigatórias e o número da página deve constar após cada citação.

> [!WARNING]
> Severino descreve um sistema de chamadas em **nota de rodapé** (p. 176–181), com *ibid.*, *op. cit.* e *idem*. **Este projeto usa o sistema autor-data** do `biblatex-abnt` (NBR 10520). Siga a [Etapa 12](#etapa-12--revisão-citações-e-validação-técnica) para a sintaxe correta.

---

## Etapa 2: Definir o problema e as perguntas do referencial

📖 **Fundamento:** Lakatos e Marconi (2003, p. 44–47; PDF 43–46); Severino (2007, p. 129; PDF 65).
Severino afirma que, para elaborar o projeto, o pesquisador "precisa ter bem claro o seu objeto de pesquisa, como ele se coloca, como ele está problematizado [...], com que elementos teóricos pode contar".

### O que fazer

1. Releia a Introdução ([`01-introducao.tex`](../src/capitulos/01-introducao.tex)) e copie para um rascunho:
   - o **problema de pesquisa**;
   - o **objetivo geral** e os **objetivos específicos**;
   - a **hipótese** ou pressuposto, se houver.
2. Para cada objetivo específico, pergunte: *que conceitos o leitor precisa dominar para entender e aceitar esta parte do trabalho?*
3. Escreva de 3 a 6 **perguntas-guia do referencial**, sem citar ninguém.

🛠️ **Modelo (preencher):**

| Objetivo / parte do TCC | Conceito necessário | Pergunta-guia do referencial |
| :--- | :--- | :--- |
| *ex.: integrar o assistente a dados do SUAP* | MCP | *O que é o MCP e o que ele oferece em relação a integrações tradicionais?* |
| | | |

---

## Etapa 3: Definir a estrutura provisória (plano de trabalho)

📖 **Fundamento:**
- Lakatos e Marconi (2003, p. 46; PDF 45): as partes do trabalho "devem estar sistematicamente vinculadas entre si e ordenadas em função da unidade de conjunto". É preciso "distinguir o fundamental do secundário, o principal do subordinado".
- Severino (2007, p. 144–145; PDF 73): antes de explorar as fontes, o pesquisador deve ter presente a estrutura geral do trabalho. "A visualização dessas etapas [...] é um valioso roteiro"; "este plano é sempre provisório".
- Severino (2007, p. 149; PDF 75): "é preciso que haja subtítulos portadores de sentido".

### O que fazer

1. Parta da estrutura atual de [`02-referencial.tex`](../src/capitulos/02-referencial.tex).
2. Para **cada seção**, preencha um **mapa argumentativo**:
   - a **pergunta** que a seção responde;
   - as **afirmações** que ela precisa sustentar (ainda sem fontes);
   - a **ligação** com a seção seguinte (por que o leitor precisa dela para entender a próxima).
3. Use os títulos das seções como **títulos das fichas** (Severino, p. 147).

🛠️ **Mapa argumentativo provisório (a validar com o autor e o orientador):**

| Seção | Pergunta que responde | Afirmações a sustentar (rascunho) | Ponte para a seção seguinte |
| :--- | :--- | :--- | :--- |
| 2.1 Assistentes Virtuais Acadêmicos | Que problema institucional os assistentes buscam resolver e como evoluíram? | Evolução de *chatbots* por regras para assistentes com IA generativa; gargalos de atendimento em IFEs. | Assistentes atuais dependem de LLMs → 2.2 |
| 2.2 LLMs | O que são LLMs, o que oferecem e quais seus limites em domínios fechados? | Capacidades de geração; alucinações; conhecimento desatualizado ou ausente sobre normas locais. | Limitações motivam a ancoragem em documentos → 2.3 |
| 2.3 RAG | Como reduzir alucinações e ancorar respostas em documentos normativos? | Recuperação + geração; *embeddings*; busca semântica; injeção de contexto. | RAG atende documentos, mas não dados dinâmicos e estruturados → 2.4 |
| 2.4 MCP | Como conectar o modelo a sistemas e dados estruturados de forma padronizada? | Protocolo aberto; diferença para integrações REST ad hoc; acesso a dados em tempo real. | Com os conceitos definidos, comparar soluções existentes → 2.5 |
| 2.5 Trabalhos Relacionados | O que já foi feito e o que falta? | Comparação dos seis trabalhos; lacuna que o TCC ocupa. | Conduz à Metodologia (Cap. 3) |

> [!CAUTION]
> As afirmações acima são **hipóteses de trabalho**. Nenhuma deve ir para o texto final sem uma fonte que a sustente (Etapa 10).

---

## Etapa 4: Inventariar e avaliar as fontes existentes

📖 **Fundamento:** identificação, localização e compilação (Lakatos e Marconi, 2003, p. 47–48; PDF 46–47); crítica externa e interna (p. 48–49; PDF 47–48); credenciais do autor e data (p. 19; PDF 18).

### O que fazer

1. Liste **todas** as entradas de [`src/referencias.bib`](../src/referencias.bib).
2. Para cada uma, verifique:
   - [ ] o texto original foi localizado (PDF/URL) e está salvo?
   - [ ] os dados bibliográficos estão corretos (autor, título, ano, instituição, tipo)?
   - [ ] **autenticidade e proveniência:** quem publicou e onde (repositório institucional, periódico, anais)?
   - [ ] **autoridade:** a fonte passou por avaliação (banca, revisão por pares) ou é documentação oficial?
3. Classifique cada fonte por **papel** no Capítulo 2.

🛠️ **Inventário atual (preencher as colunas vazias):**

| Chave | Tipo | Papel no Cap. 2 | Original localizado? | Dados conferidos? | Observações de confiabilidade |
| :--- | :--- | :--- | :-: | :-: | :--- |
| `feitoza2021` | Dissertação (UFPB) | Trabalho relacionado | ☐ | ☐ | |
| `silva2022` | TCC (IFES) | Trabalho relacionado | ☐ | ☐ | |
| `oliveira2025` | TCC (UFAL) | Trabalho relacionado | ☐ | ☐ | |
| `cabral2025` | TCC (UFRN) | Trabalho relacionado | ☐ | ☐ | |
| `honorato2026` | TCC (IFPB) | Trabalho relacionado | ☐ | ☐ | |
| `neves2024` | TCC (UFRN) | Trabalho relacionado | ☐ | ☐ | |
| `lakatos2003` | Livro | Metodologia | ☑ | ☐ | |
| `severino2007` | Livro | Metodologia | ☑ | ☐ | |
| `sommerville2011`, `pressman2021`, `wiegers2013`, `iso29148`, `clegg1994` | Livros/norma | Engenharia de software (provável Cap. 3/4) | ☐ | ☐ | `clegg1994` está como `@inproceedings`, mas parece livro: conferir. |

> [!IMPORTANT]
> **Diagnóstico inicial:** as seções 2.2 (LLMs), 2.3 (RAG) e 2.4 (MCP) **ainda não têm nenhuma fonte técnica primária** no `.bib`. Essa é a principal lacuna bibliográfica a resolver na Etapa 5.

---

## Etapa 5: Busca complementar (heurística)

📖 **Fundamento:**
- Severino (2007, p. 133–134; PDF 67–68): volume de fontes suficiente; **do mais geral ao mais particular, do mais recente ao mais antigo**.
- Severino (2007, p. 145–146; PDF 73–74): partir "das obras gerais, enciclopédias, dicionários, tratados etc., chegando às monografias especializadas e aos artigos de revista, muito importantes devido a sua atualidade".
- Lakatos e Marconi (2003, p. 47; PDF 46): consultar sumários, *abstracts* e a **bibliografia final** das obras.

### O que fazer

Busque **apenas** o necessário para sustentar as afirmações da Etapa 3 que ainda não têm fonte.

🛠️ **Fontes recomendadas por tipo de afirmação (decisão do projeto):**

| Tipo de afirmação | Fonte preferencial | Onde buscar |
| :--- | :--- | :--- |
| Definição de conceito fundador (ex.: RAG, Transformer) | **Artigo original** que propôs o conceito | Anais (NeurIPS, ACL), IEEE Xplore, ACM DL |
| Panorama ou estado da arte | *Surveys* revisados por pares | IEEE, ACM, Springer, periódicos |
| Especificação de protocolo ou ferramenta (ex.: MCP) | **Documentação oficial** ou especificação | Site oficial do protocolo (`@online` com `urldate`) |
| Contexto brasileiro e IFEs | Teses, dissertações, TCCs, artigos da SBC | BDTD, repositórios institucionais, SBC OpenLib (SOL) |
| Afirmações sobre alucinação e limitações | Estudos empíricos revisados | Anais e periódicos |

> [!WARNING]
> **Preprints (arXiv)** são comuns em IA, mas não passaram por revisão por pares. Use-os quando forem a fonte original de um conceito, verifique se já existe versão publicada e indique o tipo da fonte. Evite blogs e posts sem autoria verificável.

🛠️ **Registro de buscas (protocolo mínimo):**

| Data | Base | String de busca | Filtros | Resultados | Selecionados |
| :--- | :--- | :--- | :--- | :-: | :-: |
| | | `"retrieval-augmented generation" AND (education OR university)` | 2020–2026 | | |
| | | | | | |

**Técnica "bola de neve"** (Lakatos e Marconi, p. 47): em cada fonte boa, examine as **referências** (para trás) e **quem a cita** (para frente).

---

## Etapa 6: Triagem das fontes

📖 **Fundamento:**
- Severino (2007, p. 145; PDF 73): "a primeira medida [...] é operar uma triagem em todo o material recolhido [...]. Nem tudo será necessariamente lido, pois nem tudo interessará devidamente ao tema." Para avaliar, leia "seu sumário, o prefácio, a introdução, as 'orelhas', assim como algumas passagens".
- Lakatos e Marconi (2003, p. 22; PDF 21): leituras de **reconhecimento**, **exploratória** e **seletiva**.

### O que fazer

Para cada fonte candidata, leia título, resumo, introdução e conclusão e decida:

| Critério | Pergunta | Se "não" |
| :--- | :--- | :--- |
| **Pertinência** | Sustenta alguma afirmação ou pergunta-guia da Etapa 3? | Descartar |
| **Autoridade** | Tem autoria identificável e origem confiável? | Descartar ou buscar fonte melhor |
| **Atualidade** | É recente o bastante para o tema? (em LLMs, a área muda rápido) | Manter só se for clássica ou fundadora |
| **Originalidade** | É a fonte primária do conceito? | Buscar a primária; evitar *apud* |
| **Acesso** | Consigo ler o texto completo? | Não citar o que não li |

---

## Etapa 7: Leitura analítica e fichamento

📖 **Fundamento:** Severino (2007, p. 53–65; PDF 27–33) e (p. 146–147; PDF 74); Lakatos e Marconi (2003, p. 56–66; PDF 55–65).

### O que fazer

1. Leia cada fonte selecionada aplicando as etapas de Severino: **textual → temática → interpretativa → problematização → síntese**.
2. Preencha **uma ficha por fonte**, combinando os tipos de Lakatos e Marconi (bibliográfica, citações, resumo e analítica).
3. Registre **sempre a página** de cada ideia, citação ou dado.
4. Dê à ficha o **título da seção** do Capítulo 2 a que ela serve (Severino, p. 147).

🛠️ **Modelo de ficha (copiar para cada fonte):**

```markdown
## Ficha: <chave-bib>
**Seção(ões) do Cap. 2:** 2.x – <título>
**Referência (ficha bibliográfica):** <ABNT completa>
**Tipo e origem:** <artigo revisado / TCC / documentação oficial / preprint> – <periódico, anais, repositório>

### 1. Análise textual
- Autor(es) e credenciais:
- Termos e conceitos a esclarecer:

### 2. Análise temática
- Tema (de que fala):
- Problema (que dificuldade enfrenta):
- Tese ou ideia central (o que defende):
- Raciocínio e método (como demonstra):
- Principais resultados (com números, se houver):
- Ideias secundárias:

### 3. Citações literais (sempre entre aspas e com página)
- "..." (p. X)

### 4. Resumo com minhas palavras (paráfrase, sempre com página)
- ... (p. X–Y)

### 5. Análise interpretativa e crítica (ficha analítica)
- Coerência interna (o método sustenta a conclusão?):
- Limitações declaradas pelo autor:
- Limitações que eu identifico:
- Converge com / diverge de: <outras chaves>

### 6. Problematização e contribuição para o meu TCC
- Que afirmação do meu Cap. 2 esta fonte sustenta?
- Que pergunta deixa em aberto?
- Ideias próprias que surgiram (sem referência = autoria minha):
```

> [!TIP]
> 🛠️ Sugestão de organização: crie uma pasta `resources/fichamentos/` com um arquivo `.md` por fonte (`feitoza2021.md`, `cabral2025.md`...). Isso facilita reagrupar as fichas por seção depois, como recomenda Severino (p. 147).

---

## Etapa 8: Matriz de Fichamento Analítico (comparativa)

📖 **Fundamento:**
- Severino (2007, p. 60; PDF 31): "uma comparação com ideias temáticas afins".
- Lakatos e Marconi (2003, p. 30; PDF 29): "localizar acontecimentos e idéias, comparando-os entre si, procurando semelhanças e diferenças".
- Lakatos e Marconi (2003, p. 225; PDF 224): demonstrar contradições e enumerar discrepâncias.

A matriz reúne as fichas da Etapa 7 em uma visão lado a lado. Ela é a ponte entre "ler" e "escrever".

### 8.1 Matriz dos Trabalhos Relacionados (Seção 2.5)

🛠️ **Modelo (preencher a partir das fichas, nunca de memória):**

| Critério | Feitoza (2021) | Silva (2022) | Neves (2024) | Oliveira (2025) | Cabral (2025) | Honorato e Alves (2026) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Nome da solução | Cecílio | | CampusHubAI | PLUTO | | MINERVA |
| Instituição | UFPB | IFES | UFRN | UFAL | UFRN | IFPB |
| Tipo de trabalho | Dissertação | TCC | TCC | TCC | TCC | TCC |
| Problema abordado | | | | | | |
| Público-alvo | | | | | | |
| Técnica (regras / NLU / LLM / RAG) | | | | | | |
| Fonte de conhecimento (documentos, FAQ, API) | | | | | | |
| Acesso a dados dinâmicos/estruturados? | | | | | | |
| Método de avaliação | | | | | | |
| Principais resultados | | | | | | |
| Limitações declaradas | | | | | | |
| Página(s) de referência | | | | | | |
| Relação com este TCC | | | | | | |

### 8.2 Matriz Conceito × Fonte (Seções 2.1 a 2.4)

🛠️ Use para conferir se cada conceito tem **definição**, **características** e **limitações** sustentadas por fontes.

| Conceito | Definição (fonte, p.) | Características (fonte, p.) | Limitações (fonte, p.) | Divergências entre autores |
| :--- | :--- | :--- | :--- | :--- |
| Assistente virtual / *chatbot* | | | | |
| LLM | | | | |
| Alucinação | | | | |
| RAG | | | | |
| *Embeddings* / busca semântica | | | | |
| MCP | | | | |

---

## Etapa 9: Síntese crítica e identificação de lacunas

📖 **Fundamento:**
- Lakatos e Marconi (2003, p. 118; PDF 117): a teoria indica "fatos e relações que ainda não estão satisfatoriamente explicados".
- Severino (2007, p. 61; PDF 31): avaliar coerência interna, originalidade, alcance e contribuição.
- Severino (2007, p. 62–63; PDF 32): problematização e síntese pessoal.

### O que fazer

Com a matriz preenchida, responda por escrito (rascunho, sem preocupação de estilo):

1. **Convergências:** em que os trabalhos concordam (técnicas, resultados, problemas)?
2. **Divergências:** onde discordam ou obtêm resultados diferentes? Por quê (método, contexto, dados)?
3. **Limitações recorrentes:** que limitação aparece em vários trabalhos?
4. **Lacuna:** que aspecto **nenhum** trabalho cobre ou cobre de forma insuficiente?
5. **Contribuição:** como este TCC se posiciona em relação a essa lacuna?

> [!CAUTION]
> A lacuna precisa **emergir da matriz**, com evidências. Não declare "nenhum trabalho faz X" sem ter conferido isso em todas as fontes. Prefira formulações delimitadas, como "entre os trabalhos analisados...".

---

## Etapa 10: Mapa de rastreabilidade

📖 **Fundamento:** Severino (2007, p. 146; PDF 74): os elementos retirados das fontes dão às afirmações do autor "a garantia de maior objetividade fundada no testemunho e na verificação de outros pensadores".

🛠️ **Regra do projeto:** *nenhuma afirmação conceitual entra no texto sem uma linha neste mapa.*

| # | Seção | Afirmação a fazer no texto | Fonte (chave) | Página | Tipo (direta / indireta / ideia própria) | Verificada no original? |
| :-: | :--- | :--- | :--- | :-: | :--- | :-: |
| 1 | 2.2 | | | | | ☐ |
| 2 | 2.3 | | | | | ☐ |

Este mapa responde à pergunta: **cada referência sustenta de fato a afirmação que pretendo fazer?**

---

## Etapa 11: Redação incremental, seção por seção

📖 **Fundamento:**
- Lakatos e Marconi (2003, p. 44; PDF 43): a redação é a **última** fase.
- Severino (2007, p. 150; PDF 76), *A redação do texto*: o autor "redige o texto, confrontando as fichas de documentação". Recomenda-se "uma primeira redação de rascunho", seguida de revisão completa "do todo".
- Severino (2007, p. 151–152; PDF 76–77), *A construção do parágrafo*: o parágrafo "tem por finalidade expressar as etapas do raciocínio". Evite tanto o excesso quanto a ausência de parágrafos. Estrutura: **introdução** (anuncia), **corpo** (desenvolve), **conclusão** (sintetiza).
- Severino (2007, p. 151; PDF 76): "estilo sóbrio e preciso", evitando "a pomposidade pretensiosa, o verbalismo vazio, as fórmulas feitas".
- Severino (2007, p. 149; PDF 75): a introdução "é a última parte do trabalho a ser escrita".

### Ordem sugerida de redação (🛠️)

| Ordem | Seção | Por quê |
| :-: | :--- | :--- |
| 1º | 2.2 LLMs | Base conceitual das demais; fontes técnicas mais estáveis. |
| 2º | 2.3 RAG | Depende das limitações dos LLMs. |
| 3º | 2.4 MCP | Depende da compreensão de RAG e de suas limitações. |
| 4º | 2.1 Assistentes Virtuais | Fica mais preciso quando os conceitos técnicos já estão claros. |
| 5º | 2.5 Trabalhos Relacionados | Usa todos os conceitos anteriores para comparar. |
| 6º | Introdução do Capítulo 2 | Severino: a introdução se escreve por último. |

### Ciclo de redação de cada seção

```text
1. Reler o mapa argumentativo da seção (Etapa 3)
2. Reunir as fichas com o título da seção (Etapa 7)
3. Conferir as linhas do mapa de rastreabilidade (Etapa 10)
4. Escrever um esqueleto: 1 frase-tópico por parágrafo
5. Desenvolver cada parágrafo (introdução → corpo → conclusão)
6. Inserir citações com página
7. Escrever a frase-ponte para a próxima seção
8. Compilar e validar (Etapa 12)
9. Revisar com o orientador antes da próxima seção
```

### Estrutura de parágrafo argumentativo (🛠️, baseada em Severino, p. 151)

| Parte | Função | Exemplo de movimento |
| :--- | :--- | :--- |
| Frase-tópico | Anuncia a ideia do parágrafo | "LLMs apresentam limitações quando aplicados a domínios normativos específicos." |
| Corpo | Desenvolve com evidências e relaciona autores | "Segundo A (ano), ... Em linha semelhante, B (ano) observa ... Entretanto, C (ano) ressalta ..." |
| Fechamento | Sintetiza e conecta ao problema do TCC | "Essa limitação motiva o uso de técnicas de recuperação, discutidas na próxima seção." |

### Sinais de que a seção virou "sequência de resumos" (evitar)

- Cada parágrafo começa com "Fulano (ano) apresenta..." e trata de um único autor.
- Não há palavras de relação entre autores (*em contraste*, *de modo convergente*, *entretanto*, *complementarmente*).
- A seção termina sem ligação com o problema do TCC.
- Há afirmações sem citação que não são claramente ideias próprias.

---

## Etapa 12: Revisão, citações e validação técnica

### 12.1 Sintaxe de citações neste projeto (`biblatex-abnt`, NBR 10520)

| Situação | Sintaxe LaTeX | Resultado aproximado |
| :--- | :--- | :--- |
| Indireta, autor no texto | `Segundo \citeonline{severino2007}, ...` | Segundo Severino (2007), ... |
| Indireta, entre parênteses | `... da literatura \cite{lakatos2003}.` | ... da literatura (LAKATOS; MARCONI, 2003). |
| Direta curta (até 3 linhas) | ```Conforme \citeonline[p.~225]{lakatos2003}, ``pesquisa alguma parte hoje da estaca zero''.``` | Conforme Lakatos e Marconi (2003, p. 225), "pesquisa ..." |
| Direta longa (4+ linhas) | `\begin{citacao} ... \cite[p.~149]{severino2007}\end{citacao}` | Bloco recuado 4 cm, fonte menor |
| Várias fontes | `\cite{oliveira2025,cabral2025}` | (OLIVEIRA, 2025; CABRAL, 2025) |

> [!NOTE]
> Página de citação = **página do livro impresso** (veja a tabela de conversão na [Seção 0](#0-como-usar-este-guia-e-localizar-as-páginas-nos-pdfs)).
> Para citações diretas, a página é **obrigatória**. Para paráfrases, é recomendada.

### 12.2 Checklist de revisão por seção

- [ ] Toda citação no `.tex` tem entrada correspondente no `.bib`.
- [ ] Toda citação direta tem aspas (ou ambiente `citacao`) e página.
- [ ] Nenhuma paráfrase reproduz a estrutura frasal do original.
- [ ] As novas entradas do `.bib` têm os campos ABNT exigidos (`@article`: author, title, journal, year, volume, number, pages; `@online`: author, title, year, url, urldate; etc.).
- [ ] Cada parágrafo tem frase-tópico e relaciona pelo menos uma ideia ao problema do TCC.
- [ ] A seção termina com uma ponte para a próxima.
- [ ] Executado `.\make.bat check` sem citações indefinidas.

### 12.3 Comandos

```powershell
.\make.bat build   # compila o PDF
.\make.bat check   # verifica citações indefinidas, overfull/underfull e linter ABNT
```

---

## Apêndice A: Índice remissivo de páginas

### Lakatos e Marconi (2003): página do PDF = livro − 1

| Seção | Assunto | Livro | PDF |
| :--- | :--- | :-: | :-: |
| Sumário | — | 7–13 | 7–13 |
| 1.1.1 | Elementos de identificação do texto (título, data, credenciais) | 19 | 18 |
| 1.1.4 | Fases da leitura informativa | 22–23 | 21–22 |
| 1.1.6–1.1.7 | Sublinhar, resumir, esquema | 24–27 | 23–26 |
| 1.2.1 | Análise de texto: fases (decomposição, generalização, crítica) | 27–29 | 26–28 |
| 1.2.2 | Objetivo e procedimento da análise | 29–30 | 28–29 |
| 1.2.3 | Partes: elementos, relações, estrutura | 30–31 | 29–30 |
| 1.2.4 | Análise textual, temática, interpretativa/crítica, problematização, conclusão pessoal | 31–33 | 30–32 |
| 1.2.5 | Exemplo completo de análise de texto | 33–35 | 32–34 |
| 2.1 | Oito fases da pesquisa bibliográfica | 44 | 43 |
| 2.1.1 | Escolha e delimitação do tema | 44–45 | 43–44 |
| 2.1.2 | Plano de trabalho (introdução, desenvolvimento, conclusão) | 46–47 | 45–46 |
| 2.1.3–2.1.5 | Identificação, localização, compilação | 47–48 | 46–47 |
| 2.1.6 | Fichamento | 48 | 47 |
| 2.1.7 | Análise e interpretação (crítica externa e interna) | 48–49 | 47–48 |
| 2.1.8 | Redação | 49 | 48 |
| 2.2 | Fichas: finalidade e composição | 49–55 | 48–54 |
| 2.2.3 | Tipos de fichas (bibliográfica, citações, resumo, esboço, analítica) | 56–59 | 55–58 |
| 2.2.4 | Exemplos de fichas | 60–66 | 59–65 |
| 2.3 | Resumos: conceito, como resumir, tipos | 68–73 | 67–72 |
| 5.1.1 | Papel da teoria (conceitos, resumo do conhecimento, lacunas) | 115–118 | 114–117 |
| 6.2 | Tema, problema e hipótese *(não lido)* | 126–128 | 125–127 |
| 6.3.3 | Comparação com outros estudos *(não lido)* | 133 | 132 |
| 8.2.2.4 | Definição dos termos *(não lido)* | 160 | 159 |
| 9.1.2 | Pesquisa bibliográfica (definição e finalidade) | 183–185 | 182–184 |
| 9.2.1 | Pesquisa bibliográfica como primeiro passo | 186 | 185 |
| 10.2.6 | Embasamento teórico: teoria de base, revisão, definição de termos | 224–225 | 223–224 |
| 10.4.5 | Revisão bibliográfica no relatório | 230 | 229 |

### Severino (2007): página do PDF = ⌊livro ÷ 2⌋ + 1

| Seção | Assunto | Livro | PDF |
| :--- | :--- | :-: | :-: |
| Sumário | — | 8–12 | 5–7 |
| 2.2.1 | Diretrizes para leitura, análise e interpretação | 49–53 | 25–27 |
| 1.a | Delimitação da unidade de leitura | 53–54 | 27–28 |
| 1.b | Análise textual | 54–56 | 28–29 |
| 1.c | Análise temática | 56–59 | 29–30 |
| 1.d | Análise interpretativa (comparação, crítica) | 59–61 | 30–31 |
| 1.e | Problematização | 62 | 32 |
| 1.f | Síntese pessoal e esquema-resumo da leitura analítica | 62–65 | 32–33 |
| 2.2.2 | Documentação como método de estudo | 66–68 | 34–35 |
| 2.b | Documentação temática (citação, síntese, ideia própria) | 68–70 | 35–36 |
| 2.c–2.d | Documentação bibliográfica e geral | 70–72 | 36–37 |
| 2.3 | Estrutura lógica do texto (demonstração, raciocínio, conceitos) | 74–89 | 38–45 |
| 3.4.7 | Pesquisa bibliográfica, documental, experimental, de campo | 122–123 | 62 |
| 4.1 | Elaborando o projeto de pesquisa | 129–132 | 65–67 |
| 4.2 | Desenvolvendo o processo de investigação | 133 | 67 |
| 4.2.1 | Levantamento das fontes (critério geral→particular; heurística) | 133–136 | 67–69 |
| 1.b / b.1 | Internet como fonte; pesquisa científica na Internet | 136–144 | 69–73 |
| 4.2.2 | Atividade de pesquisa e prática da documentação (triagem, ordem de leitura, fichas) | 144–148 | 73–75 |
| 4.2.3 | Análise dos dados e construção do raciocínio demonstrativo | 148–150 | 75–76 |
| 3.a | A redação do texto | 150–151 | 76 |
| 3.b | A construção do parágrafo | 151–152 | 76–77 |
| 1.c (4.3.1) | As citações | 175–176 | 88–89 |
| 1.d (4.3.1) | Notas de rodapé | 176–179 | 89–90 |
| 1.e (4.3.1) | Referências no corpo do texto; citação de segunda mão | 179–181 | 90–91 |
| 1.f (4.3.1) | Técnica bibliográfica (elaboração de referências) | 181–198 | 91–100 |
| 5.3 | O TCC | 202–203 | 102 |
| 5.5 | Resenhas e resumos | 204 | 103 |

---

## Apêndice B: Checklist geral

| # | Etapa | Entregável | Status |
| :-: | :--- | :--- | :-: |
| 1 | Base metodológica | Anotações sobre os 6 temas, com páginas | ☐ |
| 2 | Problema e perguntas | Tabela objetivo → conceito → pergunta-guia | ☐ |
| 3 | Estrutura provisória | Mapa argumentativo validado com o orientador | ☐ |
| 4 | Inventário | Tabela de fontes com confiabilidade conferida | ☐ |
| 5 | Busca complementar | Registro de buscas e novas entradas no `.bib` | ☐ |
| 6 | Triagem | Lista de fontes incluídas e excluídas, com motivo | ☐ |
| 7 | Fichamento | Uma ficha por fonte, com páginas | ☐ |
| 8 | Matriz | Matrizes 8.1 e 8.2 preenchidas | ☐ |
| 9 | Síntese e lacunas | Texto-rascunho com convergências, divergências e lacuna | ☐ |
| 10 | Rastreabilidade | Mapa afirmação → fonte → página | ☐ |
| 11 | Redação | Seções 2.2 → 2.3 → 2.4 → 2.1 → 2.5 → introdução | ☐ |
| 12 | Validação | `make check` limpo e revisão do orientador | ☐ |

---

## Referências deste guia

LAKATOS, Eva Maria; MARCONI, Marina de Andrade. **Fundamentos de metodologia científica**. 5. ed. São Paulo: Atlas, 2003.

SEVERINO, Antônio Joaquim. **Metodologia do trabalho científico**. 23. ed. rev. e atual. São Paulo: Cortez, 2007.

---
name: Estilo de Redação Acadêmica (TCC de Tecnologia)
description: Diretrizes de tom, pontuação, vocabulário e clareza metodológica para redação de TCC em Bacharelado em Sistemas de Informação e Computação.
---

# Estilo de Redação Acadêmica (TCC de Tecnologia)

## Objective

Garantir que a redação do TCC seja clara, objetiva, moderna e direta, alinhada aos padrões de publicações científicas da área de Computação e Sistemas de Informação, evitando vícios de linguagem, travessões excessivos, orações empilhadas e linguagem rebuscada/arcaica.

## Diretrizes de Escrita

### 1. Pontuação e Uso de Travessões
- 🚫 **Proibido usar travessões (`---` ou `--`)** no corpo do texto para isolar incisos, explicações ou parênteses informais.
- ✅ **Prefira:** usar parênteses `(...)`, vírgulas ou reestruturar o período em duas frases separadas.
- **Exemplo de correção:**
  - *Incorreto:* `requerimentos acadêmicos --- especificamente Trancamento e Proficiência --- em comparação`
  - *Correto:* `requerimentos acadêmicos (especificamente Trancamento e Proficiência) em comparação`

### 2. Estrutura Sintática e Fluidez (Evitar Orações Empilhadas)
- Evite frases muito longas com 4 ou mais orações subordinadas encadeadas por vírgulas.
- Mantenha os períodos curtos e na ordem direta: **Sujeito + Verbo + Complemento**.
- Quebre parágrafos densos em frases conclusivas independentes.

### 3. Vocabulário e Tom Técnico-Científico
- Evite palavras pedantes, arcaicas ou floreios literários que prejudiquem a fluidez da leitura.
- **Tabela de Substituições Recomendadas:**
  | Termo Rebuscado / Pouco Usual | Substituição Técnica Recomendada |
  | :--- | :--- |
  | `tece as considerações finais` | `apresenta as considerações finais` |
  | `Hipotetiza-se que` | `A hipótese desta pesquisa é que` / `Pressupõe-se que` |
  | `insumos empíricos` | `dados empíricos` / `evidências empíricas` |
  | `afasta qualquer viés` | `reduz a ocorrência de viés` |
  | `percurso metodológico` | `procedimentos metodológicos` |
  | `Não obstante` | `Ainda assim` / `Apesar disso` |
  | `visando à` | `para a` / `com o intuito de` |

### 4. Rigor Metodológico e Clareza sobre Dados e Experimentos
- **Distinção de Dados de Usuários:** Sempre explicitar a diferença entre:
  - *Autoexperimentação (Validação Técnica):* uso das credenciais do autor em ambiente de desenvolvimento apenas para verificar a conectividade de rotas da API do SUAP.
  - *Experimento Científico (Avaliação Quantitativa):* uso exclusivo de um *dataset* de arquétipos/personas fictícias (*mockados*) para garantir a LGPD, a reprodutibilidade e a isenção do teste.
- **Status das Simulações:** Deixar cristalino no texto o momento de execução dos testes (distinguindo o que foi testado preliminarmente no TCC I do que será executado sistematicamente no TCC II).

---
name: Revisão Visual de Mudanças (Change Review)
description: Apresenta comparativos visuais Antes vs. Depois (Carrossel, HTML via make diff e Mermaid) antes de aplicar reescritas semânticas ou resolver comentários de conteúdo no TCC.
---

# Revisão Visual de Mudanças (Change Review)

## Objective

Garantir transparência total e preservação da autoria intelectual (em alinhamento com `autonomy_rules` e `AGENTS.md`), exibindo claramente o **Antes vs. Depois** de propostas de alteração de texto antes de editar os arquivos em `src/capitulos/`.

---

## Quando Ativar (e Quando NÃO Ativar)

### ✅ Ativar SEMPRE quando:
- Reescrever parágrafos ou períodos para melhorar clareza, remover 1ª pessoa ou substituir termos arcaicos.
- Resolver comentários de conteúdo ou teóricos do orientador (via Google Docs / MCP ou revisão local).
- Dividir parágrafos densos (> 250 palavras) ou reorganizar seções inteiras.
- Alterar trechos que contenham **citações (`\cite`)** ou **dados numéricos/resultados**.

### ⏭️ NÃO ativar (evitar burocracia) quando:
- Corrigir erros puramente sintáticos de compilação LaTeX (ex.: fechar chave `}`, ajustar `\label`, trocar `[htbp]` por `[!htbp]`).
- Ajustar espaçamentos, pacotes ou scripts fora do texto autoral.

---

## Protocolo Operacional (3 Passos)

### Passo 1 — Pré-visualização Antes vs. Depois (ANTES de editar o `.tex`)
Apresente a proposta ao autor antes de modificar o texto autoral usando o formato mais adequado ao tamanho da mudança:

1. **Mudança pontual (1 a 3 parágrafos):** Use um bloco comparativo claro (ou `carousel` em artefatos Markdown):
   - **Origem:** (ex.: *Comentário #12 do Orientador* ou *Linter ABNT: voz impessoal*)
   - **Antes (original):** trecho exato atual.
   - **Depois (proposta):** trecho sugerido destacando apenas o que mudou.
   - **Justificativa:** motivo técnico ou normativo em 1 frase.
2. **Mudança estrutural (múltiplas seções ou capítulos):** Inclua um diagrama **Mermaid** (`flowchart LR`) mapeando o impacto por seção antes de listar os diffs.

### Passo 2 — Consentimento Explícito
Aguarde a confirmação do autor (*"aprova aplicar esta alteração?"*). Nunca sobrescreva argumentos autorais sem consentimento.

### Passo 3 — Aplicação e Relatório Pós-Mudança via Git
Após aprovação e edição do `.tex`:
1. Execute `.\make.bat check` (ou `make check`) para validar compilação, margens e normas ABNT.
2. Quando houver revisão extensa ou entrega para o orientador, gere o comparador visual interativo:
   ```bash
   .\make.bat diff --html   # Gera src/build/diff.html (Antes vs. Depois lado a lado)
   make diff ARGS="--html"  # Linux / macOS
   ```
3. Verifique no relatório se houve algum alerta de **citação removida** ou **valor numérico alterado** acidentalmente.

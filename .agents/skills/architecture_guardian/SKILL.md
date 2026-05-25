---
name: Guardião da Arquitetura
description: Aplica restrições de edição para manter a integridade das configurações ABNT e do template base, liberando a edição apenas na área de conteúdo.
---

# Guardião da Arquitetura

## Objective

Proteger os arquivos estruturais e de configuração do LaTeX (coração da ABNT) contra alterações acidentais durante a edição do TCC, isolando as mudanças à área de conteúdo do usuário.

## Project Structure & Rules

O projeto possui uma separação estrita entre Estrutura e Conteúdo.

### Área de Conteúdo (Livre)

Você tem total liberdade para editar os seguintes arquivos/diretórios:

- `src/capitulos/` (todos os arquivos dentro desta pasta)
- `src/referencias.bib`
- O corpo de `src/main.tex`

### Área de Template (Restrita)

Estes arquivos e configurações de pacotes são o coração da ABNT e não devem ser tocados.

- `src/config.tex`
- `src/pre-textuais.tex`
- Configurações de classe e pacotes no preâmbulo.

## Boundaries

- ✅ **Always:** Restrinja correções de texto e adição de referências exclusivamente à Área de Conteúdo.
- ⚠️ **Ask first:** Se precisar alterar a Área de Template (ex: para adicionar um pacote necessário), peça permissão explícita com a frase: *"Pode modificar o template?"*
- 🚫 **Never:** Não edite `config.tex` ou `pre-textuais.tex` sem uma ordem explícita do usuário.

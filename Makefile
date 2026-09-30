# Variáveis de detecção de SO
ifeq ($(OS),Windows_NT)
  WHICH = where
  DEVNUL = >nul 2>&1
else
  WHICH = which
  DEVNUL = >/dev/null 2>&1
endif

# Variáveis do projeto
SRC_DIR = src
MAIN_FILE = main.tex
BUILD_DIR = build
FIGURES_DIR = $(SRC_DIR)/figuras

MMD_FILES = $(wildcard $(FIGURES_DIR)/*.mmd)
PDF_FIGURES = $(patsubst $(FIGURES_DIR)/%.mmd, $(FIGURES_DIR)/%.pdf, $(MMD_FILES))

# Comandos de build usando latexmk
# O latexmk resolve todas as dependências e múltiplas compilações
BUILD_CMD = latexmk -pdf -silent -interaction=nonstopmode -outdir=$(BUILD_DIR) -cd $(SRC_DIR)/$(MAIN_FILE)
CLEAN_CMD = latexmk -c -outdir=$(BUILD_DIR) -cd $(SRC_DIR)/$(MAIN_FILE)
CLEAN_ALL_CMD = latexmk -C -outdir=$(BUILD_DIR) -cd $(SRC_DIR)/$(MAIN_FILE)

# Targets principais
.PHONY: all build figures check verify portal clean cleanall help check-node

all: figures build clean

build:
	@echo "Compilando $(MAIN_FILE)..."
	@$(BUILD_CMD)
	@echo "Compilação concluída. PDF gerado em $(SRC_DIR)/$(BUILD_DIR)/"

check-node:
	@$(WHICH) npx $(DEVNUL) || (echo "[AVISO] Node.js/npx não encontrado. Instale o Node.js para compilar diagramas via 'make figures', ou exporte em https://mermaid.live" && exit 1)

figures: check-node $(PDF_FIGURES)
	@echo "Processamento de figuras concluído."

$(FIGURES_DIR)/%.pdf: $(FIGURES_DIR)/%.mmd
	@echo "Compilando $< -> $@..."
	@npx -y @mermaid-js/mermaid-cli -i "$<" -o "$@" -b transparent
	@-$(WHICH) pdfcrop $(DEVNUL) && pdfcrop "$@" "$@" $(DEVNUL) || true

check:
	@node scripts/check.js

verify: check

portal:
	@node scripts/build_portal.js

clean:
	@echo "Limpando arquivos auxiliares..."
	@$(CLEAN_CMD)
	@echo "Limpeza de arquivos auxiliares concluída."

cleanall:
	@echo "Limpando todos os arquivos gerados (incluindo PDF)..."
	@$(CLEAN_ALL_CMD)
	@echo "Limpeza total concluída."

help:
	@echo "Opções do Makefile:"
	@echo "  make build    - Compila o projeto LaTeX gerando o PDF final de forma enxuta."
	@echo "  make figures  - Compila os diagramas Mermaid (.mmd) em PDF na pasta src/figuras/."
	@echo "  make check    - Executa o diagnóstico de build, layout, espaçamento e conformidade ABNT."
	@echo "  make portal   - Gera o portal web interativo dinâmico em public/ (para GitHub Pages)."
	@echo "  make all      - Executa figures -> build -> clean (pipeline completo)."
	@echo "  make clean    - Remove arquivos temporários e auxiliares (.aux, .log, etc)."
	@echo "  make cleanall - Remove todos os arquivos gerados (incluindo o .pdf final)."
	@echo "  make help     - Exibe esta mensagem de ajuda."



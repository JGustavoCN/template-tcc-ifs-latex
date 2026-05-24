# Makefile para facilitar a compilação do TCC

# Variáveis
SRC_DIR = src
MAIN_FILE = main.tex
BUILD_DIR = build

# Comandos de build usando latexmk
# O latexmk resolve todas as dependências e múltiplas compilações
BUILD_CMD = latexmk -pdf -interaction=nonstopmode -outdir=$(BUILD_DIR) -cd $(SRC_DIR)/$(MAIN_FILE)
CLEAN_CMD = latexmk -c -outdir=$(BUILD_DIR) -cd $(SRC_DIR)/$(MAIN_FILE)
CLEAN_ALL_CMD = latexmk -C -outdir=$(BUILD_DIR) -cd $(SRC_DIR)/$(MAIN_FILE)

# Targets principais
.PHONY: all build clean cleanall help

all: build

build:
	@echo "Compilando $(MAIN_FILE)..."
	@$(BUILD_CMD)
	@echo "Compilação concluída. PDF gerado em $(SRC_DIR)/$(BUILD_DIR)/"

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
	@echo "  make build    - Compila o projeto LaTeX gerando o PDF final."
	@echo "  make clean    - Remove arquivos temporários e auxiliares (.aux, .log, etc)."
	@echo "  make cleanall - Remove todos os arquivos gerados (incluindo o .pdf)."

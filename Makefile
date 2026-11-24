# Variáveis de detecção de SO
ifeq ($(OS),Windows_NT)
  WHICH = where
  DEVNUL = >nul 2>&1
  SET_LOG_WIDTH = set max_print_line=10000 &&
  RM_SAVE_ERR = del /q "$(SRC_DIR)\$(BUILD_DIR)\*-SAVE-ERROR" $(DEVNUL) || true
else
  WHICH = which
  DEVNUL = >/dev/null 2>&1
  SET_LOG_WIDTH = max_print_line=10000
  RM_SAVE_ERR = rm -f "$(SRC_DIR)/$(BUILD_DIR)"/*-SAVE-ERROR $(DEVNUL) || true
endif

# Variáveis do projeto
SRC_DIR = src
MAIN_FILE = main.tex
BUILD_DIR = build
FIGURES_DIR = $(SRC_DIR)/figuras
SLIDES_DIR = slides
SLIDES_FILE = apresentacao.tex

MMD_FILES = $(wildcard $(FIGURES_DIR)/*.mmd $(FIGURES_DIR)/diagramas/*.mmd)
PDF_FIGURES = $(MMD_FILES:.mmd=.pdf)

# Comandos de build usando latexmk
# O latexmk resolve todas as dependências e múltiplas compilações
# max_print_line=10000 evita quebra de caminhos de arquivo na coluna 79 do main.log
BUILD_CMD = $(SET_LOG_WIDTH) latexmk -pdf -silent -interaction=nonstopmode -outdir=$(BUILD_DIR) -cd $(SRC_DIR)/$(MAIN_FILE)
SLIDES_CMD = $(SET_LOG_WIDTH) latexmk -pdf -silent -interaction=nonstopmode -outdir=$(BUILD_DIR) -cd $(SLIDES_DIR)/$(SLIDES_FILE)
CLEAN_CMD = latexmk -c -outdir=$(BUILD_DIR) -cd $(SRC_DIR)/$(MAIN_FILE)
CLEAN_ALL_CMD = latexmk -C -outdir=$(BUILD_DIR) -cd $(SRC_DIR)/$(MAIN_FILE)

# Targets principais
.PHONY: all build figures check verify doctor preview slides portal diff add-ref update clean cleanall help check-node

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

$(FIGURES_DIR)/diagramas/%.pdf: $(FIGURES_DIR)/diagramas/%.mmd
	@echo "Compilando $< -> $@..."
	@npx -y @mermaid-js/mermaid-cli -i "$<" -o "$@" -b transparent
	@-$(WHICH) pdfcrop $(DEVNUL) && pdfcrop "$@" "$@" $(DEVNUL) || true

check:
	@node scripts/check.js $(ARGS)

verify: check

doctor:
	@node scripts/doctor.js $(ARGS)

preview:
	@node scripts/preview_page.js $(PAGES) $(ARGS)

slides:
	@echo "Compilando slides da banca ($(SLIDES_DIR)/$(SLIDES_FILE))..."
	@$(SLIDES_CMD)
	@echo "Slides compilados em $(SLIDES_DIR)/$(BUILD_DIR)/apresentacao.pdf"

portal:
	@node scripts/build_portal.js

diff:
	@node scripts/diff_report.js $(ARGS)

add-ref:
	@node scripts/add_doi.js $(DOI) $(ARGS)

update:
	@node scripts/update_template.js $(ARGS)

clean:
	@echo "Limpando arquivos auxiliares..."
	@$(CLEAN_CMD)
	@-$(RM_SAVE_ERR)
	@echo "Limpeza de arquivos auxiliares concluída."

cleanall:
	@echo "Limpando todos os arquivos gerados (incluindo PDF)..."
	@$(CLEAN_ALL_CMD)
	@-$(RM_SAVE_ERR)
	@echo "Limpeza total concluída."

help:
	@echo "Opções do Makefile:"
	@echo "  make build    - Compila o projeto LaTeX gerando o PDF final de forma enxuta."
	@echo "  make figures  - Compila os diagramas Mermaid (.mmd) em PDF na pasta src/figuras/."
	@echo "  make check    - Executa o diagnóstico de build, layout, geometria do PDF e ABNT."
	@echo "  make doctor   - Verifica todas as dependências (LaTeX, Biber, Perl, Node, Poppler, Beamer)."
	@echo "  make preview  - Renderiza páginas do PDF em PNG (ex: make preview PAGES=14-16 ou ARGS=--issues)."
	@echo "  make slides   - Compila os slides Beamer da banca em slides/build/apresentacao.pdf."
	@echo "  make portal   - Gera o portal web interativo dinâmico em public/ (para GitHub Pages)."
	@echo "  make diff     - Exibe word-diff por seção e gera relatório visual (--html / --md)."
	@echo "  make add-ref  - Importa referência ABNT via DOI para src/referencias.bib (DOI=...)."
	@echo "  make update   - Atualiza o template com segurança (--auto / --wizard / --dry-run / --rollback)."
	@echo "  make all      - Executa figures -> build -> clean (pipeline completo)."
	@echo "  make clean    - Remove arquivos temporários e auxiliares (.aux, .log, etc)."
	@echo "  make cleanall - Remove todos os arquivos gerados (incluindo o .pdf final)."
	@echo "  make help     - Exibe esta mensagem de ajuda."



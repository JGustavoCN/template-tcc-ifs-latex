#!/usr/bin/env bash
# Bootstrap de 1 comando para atualizar qualquer projeto TCC (inclusive versoes muito antigas sem scripts/ ou upstream).
#
# Modo direto 100% automatico (zero perguntas — backup + branch isolada + validacao + reversivel via --rollback):
#   curl -fsSL https://raw.githubusercontent.com/JGustavoCN/template-tcc-ifs-latex/main/update.sh | bash -s -- --auto
#
# Modo interativo guiado (--wizard):
#   curl -fsSL https://raw.githubusercontent.com/JGustavoCN/template-tcc-ifs-latex/main/update.sh | bash
#
# Uso local / opcoes:
#   bash update.sh --auto
#   bash update.sh --auto --skip-config
#   bash update.sh --source-dir=/caminho/template-tcc-ifs-latex --auto
#   bash update.sh --prepare-ai

set -euo pipefail

SOURCE_DIR=""
BRANCH="main"
USE_AUTO="${TCC_UPDATE_AUTO:-0}"
SKIP_CONFIG="${TCC_UPDATE_SKIP_CONFIG:-0}"
PREPARE_AI="${TCC_UPDATE_PREPARE_AI:-0}"
NO_WIZARD="0"

for arg in "$@"; do
  case "$arg" in
    --source-dir=*) SOURCE_DIR="${arg#*=}" ;;
    --branch=*)     BRANCH="${arg#*=}" ;;
    --auto|-y)      USE_AUTO="1" ;;
    --skip-config)  SKIP_CONFIG="1" ;;
    --prepare-ai)   PREPARE_AI="1" ;;
    --no-wizard)    NO_WIZARD="1" ;;
  esac
done

RAW_BASE="https://raw.githubusercontent.com/JGustavoCN/template-tcc-ifs-latex/${BRANCH}"

echo ""
echo "============================================================"
echo "  Bootstrap do Atualizador Seguro - Template TCC IFS"
echo "============================================================"

if ! command -v git >/dev/null 2>&1; then
  echo "[ERRO] Git nao encontrado. Instale o Git e tente novamente." >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "[ERRO] Node.js nao encontrado. Instale Node.js v18+ e tente novamente." >&2
  exit 1
fi
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[ERRO] A pasta atual nao e um repositorio Git. Execute na pasta raiz do seu TCC." >&2
  exit 1
fi
if [ ! -d "src" ]; then
  echo "[ERRO] Pasta 'src/' nao encontrada. Execute este comando na pasta raiz do seu TCC." >&2
  exit 1
fi

UPDATER="scripts/update_template.js"
EXISTED_BEFORE="0"
[ -f "$UPDATER" ] && EXISTED_BEFORE="1"

mkdir -p scripts
echo "[1/2] Obtendo o atualizador oficial mais recente (scripts/update_template.js)..."
if [ -n "$SOURCE_DIR" ]; then
  cp "${SOURCE_DIR}/${UPDATER}" "$UPDATER"
else
  curl -fsSL "${RAW_BASE}/${UPDATER}" -o "$UPDATER"
fi

NODE_ARGS=("$UPDATER" "--self-updated")
[ -n "$SOURCE_DIR" ] && NODE_ARGS+=("--source-dir=${SOURCE_DIR}")
[ "$EXISTED_BEFORE" = "0" ] && NODE_ARGS+=("--bootstrap-fresh")
[ "$SKIP_CONFIG" = "1" ] && NODE_ARGS+=("--skip-config")

if [ "$PREPARE_AI" = "1" ]; then
  NODE_ARGS+=("--prepare-ai")
  echo "[2/2] Preparando kit minimo para IA (script + skill + guia)..."
  node "${NODE_ARGS[@]}"
  exit $?
fi

if [ "$USE_AUTO" = "1" ]; then
  NODE_ARGS+=("--auto")
  echo "[2/2] Executando atualizacao direta segura (backup + branch isolada + validacao)..."
  node "${NODE_ARGS[@]}"
  exit $?
fi

if [ "$NO_WIZARD" = "1" ]; then
  NODE_ARGS+=("--dry-run")
  echo "[2/2] Executando simulacao (--dry-run)..."
  node "${NODE_ARGS[@]}"
  exit $?
fi

NODE_ARGS+=("--wizard")
echo "[2/2] Iniciando assistente guiado de atualizacao segura..."
if [ -r /dev/tty ]; then
  node "${NODE_ARGS[@]}" < /dev/tty
else
  node "${NODE_ARGS[@]}"
fi

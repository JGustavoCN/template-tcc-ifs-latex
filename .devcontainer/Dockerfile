# Usa a imagem oficial e enxuta do Ubuntu (tamanho drasticamente reduzido)
FROM ubuntu:24.04

# Impede prompts interativos durante a instalação
ENV DEBIAN_FRONTEND=noninteractive

# Atualiza e instala o LaTeX e ferramentas necessárias
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-science \
    texlive-publishers \
    texlive-lang-portuguese \
    texlive-bibtex-extra \
    lmodern \
    biber \
    latexmk \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

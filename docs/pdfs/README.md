# 📚 PDFs de Referência Locais (Privados — Ignorados pelo Git)

Esta pasta (`docs/pdfs/`) destina-se a armazenar **localmente** os PDFs que você usa como referência durante a pesquisa e redação do seu TCC:

- Artigos científicos (IEEE, ACM, SBC, Springer, SciELO);
- Normas institucionais do IFS e documentos oficiais;
- Livros de metodologia científica (ex.: Lakatos & Marconi, Severino) ou livros técnicos.

## 🔒 Proteção de Direitos Autorais e Repositório Leve

Por padrão, o arquivo [`.gitignore`](../../.gitignore) ignora automaticamente **`docs/pdfs/*.pdf`**.

Isso garante dois benefícios importantes:
1. **Respeito a direitos autorais:** livros comerciais e artigos com restrição de redistribuição **nunca são enviados ao GitHub público** por acidente.
2. **Repositório rápido:** evita inflar o histórico Git com dezenas de megabytes de arquivos binários.

> **Dica:** mantenha seus arquivos de síntese, fichamentos e guias autorais em Markdown (ex.: em `docs/guias/`), que são leves e versionáveis com segurança no Git.

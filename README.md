<div align="center">
  <img src="logo.svg" height="120" alt="Logo Principal" style="margin-right: 20px;" />
  <img src="src/logo_ifs.png" height="120" alt="Logo do IFS" />

# 🎓 Template de TCC em LaTeX (Híbrido)

</div>

Este repositório fornece um ambiente pronto, profissional e altamente automatizado para a escrita do seu Trabalho de Conclusão de Curso (TCC) seguindo as normas da ABNT utilizando LaTeX.

Além do suporte à compilação local ou conteinerizada, o grande diferencial deste template é a sua arquitetura preparada para o **Model Context Protocol (MCP)**. Utilizando o servidor **[mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)**, agentes de IA podem orquestrar um fluxo supremo de ponta a ponta: lendo feedbacks do seu orientador no Google Docs, espelhando no código LaTeX local, recompilando e sincronizando as atualizações de forma mágica!

## 🤖 Skills do Agente e Diretrizes de Autonomia

Para fazer toda a orquestração do MCP junto com este template LaTeX funcionar perfeitamente, o repositório conta com a pasta [`.agents/skills/`](./.agents/skills/). Ela armazena um conjunto de "habilidades" (skills) modulares — como o *TCC-Bridge Workflow* e a *Triagem de Erros* — que ensinam agentes de IA a compilar, editar e sincronizar seu TCC de forma inteligente e segura, sem quebrar o código ABNT.

As diretrizes completas de autonomia, comandos de compilação e normas de pesquisa com BibTeX estão detalhadas no arquivo [`AGENTS.md`](./AGENTS.md).

---

## 🚀 Opções de Compartilhamento do PDF

Este template oferece três vias para você disponibilizar o seu TCC atualizado para o seu orientador ou avaliadores. Você pode utilizar uma ou combinar várias delas:

1. **Google Drive via MCP:** Atualização cirúrgica e instantânea sem precisar sair do Google Docs (requer configuração local do servidor [mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)).
2. **GitHub Pages (A Vitrine):** Gera um link público e fixo. A cada `git push`, o PDF é recompilado na nuvem e o link é atualizado automaticamente.
3. **GitHub Releases:** Ideal para marcar entregas oficiais (ex: "Versão Banca", "Versão Final Corrigida").

Abaixo estão os passos para configurar a automação na nuvem (GitHub Pages e Releases).

---

### ⚙️ Passo 1: Configuração Obrigatória de Permissões (GitHub Actions)

Para que os servidores do GitHub consigam compilar o seu LaTeX e salvar o PDF no seu repositório, você precisa conceder permissão de escrita ao robô de automação.

1. Acesse o seu repositório no GitHub e clique na aba **Settings** (Configurações).
2. No menu lateral esquerdo, clique em **Actions** e depois em **General**.
3. Role a página até encontrar a seção **Workflow permissions**.
4. Marque a opção **Read and write permissions**.
5. Clique no botão **Save**.

---

### 🌐 Passo 2: Configurando o GitHub Pages (URL Pública)

Se você optou por ter um link limpo e direto para o seu PDF (ex: `https://seunome.github.io/seu-repositorio/main.pdf`), siga estes passos:

**Pré-requisito:** Você precisa fazer pelo menos um `git push` com alterações no seu código para que o GitHub Actions rode pela primeira vez e crie um branch oculto chamado `gh-pages`.

1. Vá na aba **Settings** do seu repositório.
2. No menu lateral esquerdo, clique em **Pages**.
3. Na seção **Build and deployment**, em **Source**, selecione a opção **Deploy from a branch**.
4. No menu suspenso **Branch**, selecione `gh-pages` e a pasta `/ (root)`.
5. Clique em **Save**.
6. Aguarde alguns minutos. O link oficial do seu PDF aparecerá no topo dessa mesma tela!

---

### 📌 Passo 3: Fixando o Link na Tela Inicial (Dica de UX)

Para facilitar a vida do seu orientador e de recrutadores que visitarem o seu perfil, coloque o link do seu PDF em destaque na página inicial do repositório:

1. Volte para a página inicial do seu projeto (aba **Code**).
2. No canto direito da tela, na seção **About**, clique no ícone de engrenagem.
3. No campo **Website**, cole o link gerado pelo seu GitHub Pages (ou o link público do seu Google Drive).
4. Clique em **Save changes**.

---

## 🧭 Guia Rápido: O que você precisa instalar?

O template foi projetado para ser modular. Você só instala o que realmente for utilizar:

| O que você deseja fazer? | Ferramentas Necessárias | O que você NÃO precisa |
| :--- | :--- | :--- |
| **Escrever o texto e gerar o PDF** *(Uso Básico)* | MiKTeX ou TeX Live + Perl *(ou Docker)* | ❌ Não precisa de Node.js |
| **Compilar diagramas Mermaid locais** (`make figures`) | Node.js (v18+) + MiKTeX/TeX Live | — |
| **Executar diagnóstico de layout e ABNT** (`make check`) | Node.js (v18+) | — |
| **Pipeline completo automatizado** (`make all`) | Node.js (v18+) + MiKTeX/TeX Live | — |
| **Criar diagramas sem instalar ferramentas** | Navegador acessando [mermaid.live](https://mermaid.live) | ❌ Não precisa de Node.js |
| **Ambiente 100% isolado sem poluir o computador** | Docker Desktop + VS Code | ❌ Não precisa de nada no host |

---

## 🛠️ Como usar (Ambiente Isolado via Docker)

Recomendado para quem não quer instalar nenhuma biblioteca no computador. O contêiner já vem com LaTeX, Biber, Node.js e Make pré-instalados.

**Requisitos:**

1. **Docker Desktop** instalado e rodando.
2. **VS Code** instalado.
3. Extensão **[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)** no VS Code.

**Passos:**

1. Faça o clone deste repositório:

   ```bash
   git clone https://github.com/JGustavoCN/template-tcc-ifs-latex.git
   ```

2. Abra a pasta clonada no VS Code.
3. O VS Code exibirá uma notificação no canto inferior direito: "Folder contains a Dev Container configuration file".
4. Clique no botão **"Reopen in Container"** (Reabrir no Contêiner).
5. Aguarde o VS Code construir a imagem (apenas na primeira vez).
6. Abra qualquer arquivo `.tex` e aperte `Ctrl+S`. O PDF será compilado na pasta `src/build/`!

---

## 🖥️ Como usar (Local nativo sem Docker - Para Windows)

Se você preferir compilar diretamente na sua máquina usando o Antigravity / VS Code de forma nativa:

### 1. Instalando Dependências

Abra o **PowerShell** como administrador na pasta do projeto e execute nosso script automatizado:

```powershell
.\setup-windows.ps1
```

O script instalará o `Strawberry Perl` e o `MiKTeX`, e oferecerá a instalação opcional do `Node.js LTS` caso você queira suporte a diagramas Mermaid e diagnósticos do TCC Checker.

*Aguarde a conclusão e **reinicie** sua IDE ou terminal para recarregar o PATH do sistema.*

### 2. Compilando automaticamente e Atalhos da IDE

Abra a pasta do projeto no VS Code ou Antigravity. As tarefas e atalhos já vêm prontos:

- **Compilação ao Salvar (`Ctrl+S`):** O projeto está configurado com `"onSave"`. Ao salvar qualquer arquivo `.tex`, a compilação dispara automaticamente.
- **Atalho de Build Geral (`Ctrl+Shift+B`):** Aciona a compilação nativa enxuta via Makefile/make.bat.
- **Visualização do PDF:** Clique no ícone do LaTeX Workshop ou use o atalho `Ctrl+Alt+V` para abrir a pré-visualização na aba ao lado.

### 3. Compilando via Terminal e Tarefas da IDE

Incluímos suporte completo multiplataforma via `Makefile` (Linux/macOS/Git Bash) e `make.bat` (Windows cmd/PowerShell), além de atalhos prontos no VS Code (`Ctrl+Shift+B`):

| Comando (Windows) | Comando (Linux/Mac) | O que faz |
| :--- | :--- | :--- |
| `.\make.bat build` | `make build` | **Compilação padrão:** Converte o LaTeX em PDF de forma enxuta resolvendo referências BibLaTeX/ABNT. Não requer Node.js. |
| `.\make.bat figures` | `make figures` | **Compila diagramas:** Varre `src/figuras/*.mmd` e compila para PDF vetorial recortado (`pdfcrop`). *(Requer Node.js)* |
| `.\make.bat check` | `make check` | **Diagnóstico inteligente & ABNT:** Analisa erros de compilação, espaçamentos anormais entre tabelas/textos (`Underfull \vbox`), vazamento de margem (`Overfull \hbox`), citações órfãs e linter de redação ABNT. *(Requer Node.js)* |
| `.\make.bat portal` | `make portal` | **Portal Web Acadêmico:** Extrai dados 100% reais do LaTeX/PDF e gera a vitrine web com sumário dinâmico em `public/index.html` para o GitHub Pages. *(Requer Node.js)* |
| `.\make.bat update` | `make update` | **Sincronização do Template:** Conecta ao repositório oficial e atualiza automações e regras ABNT preservando seu texto. *(Requer Node.js)* |
| `.\make.bat all` | `make all` | **Pipeline completo:** Executa `figures` → `build` → `clean` em sequência. |
| `.\make.bat clean` | `make clean` | **Limpeza leve:** Remove arquivos intermediários (`.aux`, `.log`, `.bbl`, etc.), mantendo o PDF final. |
| `.\make.bat cleanall` | `make cleanall` | **Limpeza total:** Remove todos os artefatos gerados, incluindo o PDF final. |
| `.\make.bat help` | `make help` | Exibe a lista de opções e resumo de uso. |

> **💡 Dica para IAs e automação:** O comando de verificação suporta a flag `--json` (`.\make.bat check --json` ou `node scripts/check.js --json`), permitindo que agentes de IA inspecionem a saúde do documento em milissegundos sem ler arquivos de log gigantes.

---

## 📊 Como usar Diagramas Mermaid (Dois Caminhos)

O template suporta diagramas declarativos via **[Mermaid](https://mermaid.js.org/)**, permitindo criar fluxogramas, diagramas de arquitetura, classes e sequências que são versionados diretamente no Git.

> **💡 Dica de Edição no VS Code:** Recomendamos a extensão **Mermaid Viewer** (`onlyutkarsh.mermaid-diagram-lens`), já pré-configurada nas extensões recomendadas deste projeto. Com ela, você ganha destaque de sintaxe completo, botões rápidos de CodeLens, pré-visualização com zoom/pan e exportação direta sem sair do editor.

### Caminho A: Automatizado via Terminal (Para quem tem Node.js)

1. Crie seu diagrama com a extensão `.mmd` dentro da pasta `src/figuras/` (veja o modelo em `src/figuras/exemplo-diagrama.mmd`).
2. Execute o comando:

   ```bash
   .\make.bat figures   # No Windows
   make figures         # No Linux/Mac
   ```

3. O Mermaid CLI (`@mermaid-js/mermaid-cli`) gerará o PDF vetorial correspondente e aplicará o `pdfcrop` automaticamente para remover bordas brancas em excesso.
4. Para gerar tudo de uma vez (figuras + PDF do TCC + limpeza), use `.\make.bat all`.

### Caminho B: Sem Node.js (Exportação Visual via Navegador)

Se você não possui nem deseja instalar o Node.js na sua máquina, você ainda pode utilizar toda a potência do Mermaid:

1. Acesse o editor online oficial: **[mermaid.live](https://mermaid.live)**.
2. Escreva o código do seu diagrama interativamente.
3. No painel de exportação (botão **Actions** / **Download**), selecione **PDF** (ou SVG).
4. Salve o arquivo baixado diretamente dentro de `src/figuras/meu-diagrama.pdf`.
5. Execute `.\make.bat build` (ou aperte `Ctrl+S` no VS Code). O LaTeX incluirá a sua figura perfeitamente!

### Como incluir a figura no seu capítulo (Padrão ABNT)

No seu arquivo `.tex` dentro de `src/capitulos/`, inclua o bloco de figura respeitando as normas da ABNT (título no topo, fonte abaixo e numeração/label):

```latex
\begin{figure}[htbp]
    \centering
    \caption{Arquitetura Geral do Sistema Proposto}
    \includegraphics[width=0.85\textwidth]{figuras/exemplo-diagrama.pdf}
    \fonte{Elaborado pelo autor (\the\year).}
    \label{fig:arquitetura-sistema}
\end{figure}
```

E no corpo do texto você pode referenciá-la normalmente usando `a \autoref{fig:arquitetura-sistema} ilustra...` ou `como visto na Figura~\ref{fig:arquitetura-sistema}`.

---

## 🔄 Como Atualizar seu Projeto para a Versão Mais Recente do Template

Se você iniciou seu TCC em uma versão anterior deste repositório e deseja obter as novas funcionalidades (linter de redação ABNT, novo portal web com sumário dinâmico, compilação de apêndices, automações do CI/CD e suporte a novos pacotes), você pode atualizar seu projeto de forma **segura**, sem perder seus capítulos, referências ou figuras.

### 🛡️ Separação de Responsabilidades (O que é protegido?)

O template foi projetado com separação estrita entre o conteúdo autoral do aluno e a infraestrutura de compilação:

- **Área Livre do Aluno (Preservada):**
  - `src/metadados.tex` (Seus dados pessoais, título do TCC, orientador e banca)
  - `src/capitulos/*.tex` (O texto dos seus capítulos)
  - `src/referencias.bib` (Sua base bibliográfica)
  - `src/figuras/` (Seus diagramas e ilustrações)
  - `src/pre-textuais.tex` (Agradecimentos, dedicatória e epígrafe)
- **Área de Infraestrutura do Template (Atualizada):**
  - `scripts/` (Linter ABNT `check.js`, gerador de portal `build_portal.js`, etc.)
  - `web/` (Visualizador web e layout responsivo do GitHub Pages)
  - `.github/workflows/` (Compilação e deploy na nuvem)
  - `Makefile` e `make.bat` (Comandos multiplataforma)
  - `src/config.tex` (Regras tipográficas institucionais do IFS)

---

### Opção 1: Atualização Automática via Terminal (Recomendado)

Se você utiliza Git, basta executar nosso assistente na raiz do projeto:

```bash
# No Windows:
.\make.bat update

# No Linux / macOS:
make update
```

O assistente conectará ao repositório oficial e listará as melhorias disponíveis. Para aplicar a atualização imediatamente:

```bash
# No Windows:
.\make.bat update --merge

# No Linux / macOS:
make update ARGS="--merge"
```

---

### Opção 2: Atualização Manual via Git (Linha de Comando)

Você também pode utilizar os comandos padrão do Git:

1. **Salve suas alterações locais:**
   ```bash
   git add .
   git commit -m "chore: salva alterações antes de atualizar o template"
   ```

2. **Conecte o repositório oficial como `upstream` (apenas na 1ª vez):**
   ```bash
   git remote add upstream https://github.com/JGustavoCN/template-tcc-ifs-latex.git
   ```

3. **Busque as novidades oficiais:**
   ```bash
   git fetch upstream
   ```

4. **Mescle as melhorias na sua branch:**
   ```bash
   git merge upstream/main -m "Merge: atualizações oficiais do template IFS"
   ```

*Nota:* Se houver algum conflito pontual no `src/main.tex`, basta manter seus dados e aceitar os novos comandos (como os blocos de apêndices ou o `\input{metadados}`).

---

### Opção 3: Atualização para quem baixou em .ZIP (Overleaf ou Sem Git)

1. Faça uma cópia de segurança (backup) da sua pasta atual de trabalho.
2. Baixe o `.zip` mais recente do repositório oficial no GitHub.
3. Extraia e substitua apenas os arquivos e pastas de automação:
   - Pastas `scripts/`, `web/`, `.github/`, `.agents/`.
   - Arquivos `Makefile`, `make.bat`, `.latexmkrc` e `src/config.tex`.
4. **Não substitua** `src/capitulos/` nem `src/referencias.bib`.
5. Se o seu `src/main.tex` antigo possuía os dados do trabalho diretamente nele, você pode movê-los para o novo arquivo `src/metadados.tex` para manter seu projeto limpo e desacoplado.

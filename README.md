<div align="center">
  <img src="logo.svg" height="120" alt="Logo Principal" style="margin-right: 20px;" />
  <img src="src/logo_ifs.png" height="120" alt="Logo do IFS" />

# 🎓 Template de TCC em LaTeX (Híbrido)

</div>

Este repositório fornece um ambiente pronto, profissional e altamente automatizado para a escrita do seu Trabalho de Conclusão de Curso (TCC) seguindo as normas da ABNT utilizando LaTeX.

Além do suporte à compilação local ou conteinerizada, o grande diferencial deste template é a sua arquitetura preparada para o **Model Context Protocol (MCP)**. Utilizando o servidor **[mcp-gdocs-latex](https://github.com/JGustavoCN/mcp-gdocs-latex)**, agentes de IA podem orquestrar um fluxo supremo de ponta a ponta: lendo feedbacks do seu orientador no Google Docs, espelhando no código LaTeX local, recompilando e sincronizando as atualizações de forma mágica!

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

## 🛠️ Como usar (Ambiente Isolado via Docker)

Recomendado para não precisar instalar bibliotecas pesadas no seu PC. Tudo roda via Docker.

**Requisitos:**

1. **Docker Desktop** instalado e rodando.
2. **VS Code** instalado.
3. Extensão **[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)** no VS Code.

**Passos:**

1. Faça o clone deste repositório:

   ```bash
   git clone https://github.com/seu-usuario/template-tcc.git
   ```

2. Abra a pasta clonada no VS Code.
3. O VS Code exibirá uma notificação no canto inferior direito: "Folder contains a Dev Container configuration file".
4. Clique no botão **"Reopen in Container"** (Reabrir no Contêiner).
5. Aguarde o VS Code construir a imagem (isso pode demorar alguns minutos na primeira vez, pois ele baixará o LaTeX).
6. Abra o arquivo `src/main.tex` e pressione `Ctrl+S`. O PDF será gerado na aba ao lado automaticamente!

> **Nota:** Todos os arquivos gerados (incluindo o PDF final compilado localmente) serão salvos dentro da pasta oculta `src/build/` para não poluir sua raiz. Se houver push para a `main`, o GitHub Actions gerará o PDF automaticamente!

---

## 🖥️ Como usar (Local nativo sem Docker - Para Windows)

Se você preferir não usar Docker e compilar tudo diretamente na sua máquina usando o Antigravity / VS Code de forma nativa, siga as instruções:

### 1. Instalando Dependências

Abra o **PowerShell** como administrador na pasta do projeto e execute o nosso script de setup. Ele instalará o `MiKTeX` (distribuição LaTeX) e o `Strawberry Perl` (necessário para rodar o `latexmk`):

```powershell
.\setup-windows.ps1
```

*Aguarde a conclusão da instalação pelo gerenciador de pacotes Winget e **reinicie** sua IDE ou terminal.*

### 2. Compilando automaticamente

Abra a pasta do projeto no VS Code ou Antigravity. A extensão **LaTeX Workshop** lerá as configurações da pasta e fará o trabalho duro.

- Abra `src/main.tex`
- Aperte `Ctrl+S` para salvar. A compilação será feita na hora!

### 3. Compilando via Terminal (Opcional)

Se preferir rodar manualmente por linha de comando sem depender da extensão, incluímos arquivos `Makefile` e `make.bat` no projeto. Basta rodar:

- `.\make.bat build` (ou `make build` se tiver o gnu-make)

Para limpar os arquivos `.aux` e `.log` gerados:

- `.\make.bat clean`

# 🎓 Template de TCC em LaTeX (Híbrido)

Este repositório fornece um ambiente pronto para escrever seu TCC usando LaTeX de duas formas:
1. **Ambiente Isolado (Recomendado):** Sem precisar instalar nada no seu PC. Tudo roda via Docker.
2. **Ambiente Local/Nativo (Windows):** Compilando tudo nativamente na sua máquina usando a sua IDE (Antigravity/VS Code).

## 🚀 Requisitos

1. **Docker Desktop** instalado e rodando.
2. **VS Code** instalado.
3. Extensão **[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)** no VS Code.

## 🛠️ Como usar

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

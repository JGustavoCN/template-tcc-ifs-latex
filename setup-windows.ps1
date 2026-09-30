Write-Host "========================================================"
Write-Host " Instalador de Dependências do Template TCC (Windows)"
Write-Host "========================================================"
Write-Host ""
Write-Host "Este script instala os componentes para compilação local do TCC."
Write-Host ""

# 1. Strawberry Perl (Necessário para o latexmk)
Write-Host "[1/2] Instalando Strawberry Perl..."
winget install -e --id StrawberryPerl.StrawberryPerl --accept-package-agreements --accept-source-agreements

# 2. MiKTeX (Distribuição LaTeX)
Write-Host "[2/2] Instalando MiKTeX..."
winget install -e --id MiKTeX.MiKTeX --accept-package-agreements --accept-source-agreements

# 3. Informação / Opção para Node.js (Mermaid e TCC Checker)
Write-Host ""
Write-Host "--------------------------------------------------------"
Write-Host " Dependência Opcional: Node.js (LTS)"
Write-Host " Necessário para:"
Write-Host "   - Compilar diagramas Mermaid automaticamente (make figures)"
Write-Host "   - Executar o diagnóstico de layout e ABNT (make check)"
Write-Host "--------------------------------------------------------"
$instalarNode = Read-Host "Deseja instalar o Node.js LTS agora via Winget? (S/N) [Padrão: S]"
if ($instalarNode -ne "N" -and $instalarNode -ne "n") {
    Write-Host "Instalando Node.js LTS..."
    winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
} else {
    Write-Host "Instalação do Node.js ignorada. Você pode compilar o texto perfeitamente via 'make build'."
}

Write-Host ""
Write-Host "========================================================"
Write-Host " Instalação Concluída!"
Write-Host " IMPORTANTE: Reinicie o seu computador ou terminal/IDE"
Write-Host " para que o LaTeX e o Perl sejam reconhecidos."
Write-Host " Depois disso, ao salvar seu arquivo (Ctrl+S) ou rodar"
Write-Host " '.\make.bat build', o PDF será gerado nativamente."
Write-Host "========================================================"

Write-Host "========================================================"
Write-Host " Instalador de Dependências LaTeX (Windows Nativo)"
Write-Host "========================================================"
Write-Host ""
Write-Host "Este script instala o TeX Live (via MiKTeX) e o Strawberry Perl."
Write-Host "Ambos são necessários para compilação local fora do Docker."
Write-Host ""

# Instalar Strawberry Perl (Necessário para o latexmk rodar sem problemas)
Write-Host "[1/2] Instalando Strawberry Perl..."
winget install -e --id StrawberryPerl.StrawberryPerl --accept-package-agreements --accept-source-agreements

# Instalar MiKTeX (Distribuição LaTeX para Windows)
Write-Host "[2/2] Instalando MiKTeX..."
winget install -e --id MiKTeX.MiKTeX --accept-package-agreements --accept-source-agreements

Write-Host ""
Write-Host "========================================================"
Write-Host " Instalação Concluída!"
Write-Host " IMPORTANTE: Reinicie o seu computador ou terminal/IDE"
Write-Host " para que o LaTeX e o Perl sejam reconhecidos."
Write-Host " Depois disso, abra este projeto e o LaTeX Workshop vai"
Write-Host " compilar nativamente."
Write-Host "========================================================"

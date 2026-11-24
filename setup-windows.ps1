Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Instalador de Dependencias do Template TCC (Windows)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script verifica e instala os componentes para compilacao local do TCC."
Write-Host ""

function Test-Tool($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

# 1. Strawberry Perl (Necessario para o latexmk)
if (Test-Tool "perl") {
    Write-Host "[OK] Perl ja encontrado no PATH. Pulando instalacao." -ForegroundColor Green
} else {
    Write-Host "[1/3] Instalando Strawberry Perl..." -ForegroundColor Yellow
    winget install -e --id StrawberryPerl.StrawberryPerl --accept-package-agreements --accept-source-agreements
}

# 2. MiKTeX (Distribuicao LaTeX + Poppler pdftotext/pdftoppm + Ghostscript mgs)
if (Test-Tool "pdflatex") {
    Write-Host "[OK] MiKTeX / pdflatex ja encontrado no PATH. Pulando instalacao." -ForegroundColor Green
} else {
    Write-Host "[2/3] Instalando MiKTeX..." -ForegroundColor Yellow
    winget install -e --id MiKTeX.MiKTeX --accept-package-agreements --accept-source-agreements
}

# 3. Dependencia Opcional/Recomendada: Node.js LTS
if (Test-Tool "node") {
    $nodeVer = node -v
    Write-Host "[OK] Node.js ja encontrado no PATH ($nodeVer). Pulando instalacao." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "--------------------------------------------------------"
    Write-Host " Dependencia Recomendada (Opcional): Node.js (LTS)"
    Write-Host " Necessario para:"
    Write-Host "   - Diagnostico de dependencias (make doctor)"
    Write-Host "   - Auditoria ABNT e geometrica do PDF (make check)"
    Write-Host "   - Previa visual em PNG (make preview)"
    Write-Host "   - Diagramas Mermaid (make figures), Portal, Diff e DOI"
    Write-Host "--------------------------------------------------------"
    $instalarNode = Read-Host "Deseja instalar o Node.js LTS agora via Winget? (S/N) [Padrao: S]"
    if ($instalarNode -ne "N" -and $instalarNode -ne "n") {
        Write-Host "[3/3] Instalando Node.js LTS..." -ForegroundColor Yellow
        winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    } else {
        Write-Host "Instalacao do Node.js ignorada. Voce pode compilar o texto perfeitamente via '.\make.bat build'."
    }
}

Write-Host ""
if ((Test-Tool "node") -and (Test-Path ".\scripts\doctor.js")) {
    Write-Host "Executando diagnostico rapido (.\make.bat doctor)..." -ForegroundColor Cyan
    node .\scripts\doctor.js
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Processo concluido!" -ForegroundColor Green
Write-Host " Se alguma ferramenta acabou de ser instalada, REINICIE"
Write-Host " o terminal/IDE para recarregar o PATH e rode:"
Write-Host "   .\make.bat doctor"
Write-Host "========================================================" -ForegroundColor Cyan

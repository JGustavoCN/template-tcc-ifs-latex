<#
.SYNOPSIS
    Bootstrap de 1 comando para atualizar qualquer projeto TCC (inclusive versoes muito antigas sem scripts/ ou upstream).

.DESCRIPTION
    Modo direto 100% automatico (1 comando, zero perguntas — backup + branch isolada + validacao + reversivel via --rollback):
      $env:TCC_UPDATE_AUTO=1; irm https://raw.githubusercontent.com/JGustavoCN/template-tcc-ifs-latex/main/update.ps1 | iex

    Modo interativo guiado (--wizard, com menu [1/2/3/0]):
      irm https://raw.githubusercontent.com/JGustavoCN/template-tcc-ifs-latex/main/update.ps1 | iex

    Uso local / opcoes diretas:
      .\update.ps1 -Auto
      .\update.ps1 -Auto -SkipConfig
      .\update.ps1 -SourceDir "C:\Projetos\latex\template-tcc-ifs-latex" -Auto
      .\update.ps1 -PrepareAI

    Seguranca:
      - Verifica se voce esta na raiz de um repositorio Git de TCC (com pasta src/)
      - NUNCA altera capitulos, figuras, referencias, metadados ou pastas autorais
      - Sempre cria tag de backup + branch isolada, reversivel 100% com: node scripts/update_template.js --rollback
#>
param(
    [string]$SourceDir = "",
    [string]$Branch = "main",
    [switch]$Auto,
    [switch]$SkipConfig,
    [switch]$PrepareAI,
    [switch]$NoWizard
)

$ErrorActionPreference = "Stop"

# Suporta variaveis de ambiente para uso via `irm ... | iex` (limpa ao final)
$UseAuto = $Auto.IsPresent -or ($env:TCC_UPDATE_AUTO -eq "1")
$UseSkipConfig = $SkipConfig.IsPresent -or ($env:TCC_UPDATE_SKIP_CONFIG -eq "1")
$UsePrepareAI = $PrepareAI.IsPresent -or ($env:TCC_UPDATE_PREPARE_AI -eq "1")

$RawBase = "https://raw.githubusercontent.com/JGustavoCN/template-tcc-ifs-latex/$Branch"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Bootstrap do Atualizador Seguro - Template TCC IFS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

try {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "[ERRO] Git nao encontrado no PATH. Instale em https://git-scm.com/ e tente novamente." -ForegroundColor Red
        exit 1
    }
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "[ERRO] Node.js nao encontrado no PATH. Instale Node.js v18+ em https://nodejs.org/ e tente novamente." -ForegroundColor Red
        exit 1
    }

    $insideGit = git rev-parse --is-inside-work-tree 2>$null
    if ($LASTEXITCODE -ne 0 -or $insideGit -ne "true") {
        Write-Host "[ERRO] A pasta atual nao e um repositorio Git. Execute este comando na pasta raiz do seu TCC." -ForegroundColor Red
        exit 1
    }
    if (-not (Test-Path "src")) {
        Write-Host "[ERRO] Pasta 'src/' nao encontrada. Execute este comando na pasta raiz do seu projeto TCC." -ForegroundColor Red
        exit 1
    }

    function Fetch-TemplateFile {
        param([string]$RelPath)
        $Dest = Join-Path (Get-Location) $RelPath
        $DestDir = Split-Path -Parent $Dest
        if ($DestDir -and -not (Test-Path $DestDir)) {
            New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
        }
        if ($SourceDir) {
            $Src = Join-Path $SourceDir $RelPath
            if (-not (Test-Path $Src)) {
                throw "Arquivo nao encontrado na origem local: $Src"
            }
            Copy-Item -Force -Path $Src -Destination $Dest
        } else {
            $Url = "$RawBase/$($RelPath -replace '\\','/')"
            Invoke-WebRequest -UseBasicParsing -Uri $Url -OutFile $Dest
        }
    }

    $UpdaterPath = "scripts/update_template.js"
    $ExistedBefore = Test-Path $UpdaterPath

    Write-Host "[1/2] Obtendo o atualizador oficial mais recente (scripts/update_template.js)..." -ForegroundColor Gray
    Fetch-TemplateFile -RelPath $UpdaterPath

    $NodeArgs = @($UpdaterPath, "--self-updated")
    if ($SourceDir) {
        $NodeArgs += "--source-dir=$SourceDir"
    }
    if (-not $ExistedBefore) {
        $NodeArgs += "--bootstrap-fresh"
    }
    if ($UseSkipConfig) {
        $NodeArgs += "--skip-config"
    }

    if ($UsePrepareAI) {
        $NodeArgs += "--prepare-ai"
        Write-Host "[2/2] Preparando kit minimo para IA (script + skill + guia)..." -ForegroundColor Gray
        & node @NodeArgs
        exit $LASTEXITCODE
    }

    if ($UseAuto) {
        $NodeArgs += "--auto"
        Write-Host "[2/2] Executando atualizacao direta segura (backup + branch isolada + validacao)..." -ForegroundColor Gray
        & node @NodeArgs
        exit $LASTEXITCODE
    }

    if ($NoWizard) {
        $NodeArgs += "--dry-run"
        Write-Host "[2/2] Executando simulacao (--dry-run)..." -ForegroundColor Gray
        & node @NodeArgs
        exit $LASTEXITCODE
    }

    $NodeArgs += "--wizard"
    Write-Host "[2/2] Iniciando assistente guiado de atualizacao segura..." -ForegroundColor Gray
    & node @NodeArgs
    exit $LASTEXITCODE
} finally {
    Remove-Item Env:TCC_UPDATE_AUTO -ErrorAction SilentlyContinue
    Remove-Item Env:TCC_UPDATE_SKIP_CONFIG -ErrorAction SilentlyContinue
    Remove-Item Env:TCC_UPDATE_PREPARE_AI -ErrorAction SilentlyContinue
}

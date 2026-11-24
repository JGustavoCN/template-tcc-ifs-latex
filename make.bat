@echo off
setlocal

set SRC_DIR=src
set MAIN_FILE=main.tex
set BUILD_DIR=build
set FIGURES_DIR=%SRC_DIR%\figuras
set SLIDES_DIR=slides
set SLIDES_FILE=apresentacao.tex

if "%1"=="" goto build
if "%1"=="build" goto build
if "%1"=="figures" goto figures
if "%1"=="check" goto check
if "%1"=="verify" goto check
if "%1"=="doctor" goto doctor
if "%1"=="preview" goto preview
if "%1"=="slides" goto slides
if "%1"=="portal" goto portal
if "%1"=="diff" goto diff
if "%1"=="add-ref" goto addref
if "%1"=="update" goto update
if "%1"=="all" goto all
if "%1"=="clean" goto clean
if "%1"=="cleanall" goto cleanall
if "%1"=="help" goto help

echo Comando invalido: "%1". Use "make.bat help" para opcoes.
exit /b 1

:all
echo === [1/3] Processando Figuras ===
call :figures
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Interrompendo pipeline em figures devido a erro.
    exit /b %ERRORLEVEL%
)
echo.
echo === [2/3] Compilando LaTeX ===
call :build
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Interrompendo pipeline em build devido a erro.
    exit /b %ERRORLEVEL%
)
echo.
echo === [3/3] Limpando Arquivos Auxiliares ===
call :clean
echo.
echo ========================================================
echo Pipeline concluido com sucesso!
echo PDF final disponivel em: %SRC_DIR%\%BUILD_DIR%\%MAIN_FILE:~0,-4%.pdf
echo ========================================================
goto :eof

:figures
echo Verificando dependencias para diagramas...
where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Node.js/npx nao foi encontrado no sistema.
    echo Para compilar diagramas Mermaid automaticamente, instale o Node.js: https://nodejs.org/
    echo Alternativa sem Node: exporte o diagrama em PDF via https://mermaid.live e salve em %FIGURES_DIR%\
    exit /b 1
)

set HAS_MMD=0
for %%f in ("%FIGURES_DIR%\*.mmd" "%FIGURES_DIR%\diagramas\*.mmd") do (
    if exist "%%f" (
        set HAS_MMD=1
        echo Compilando %%~nxf -^> %%~nf.pdf...
        call npx -y @mermaid-js/mermaid-cli -i "%%f" -o "%%~dpnf.pdf" -b transparent
        where pdfcrop >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            call pdfcrop "%%~dpnf.pdf" "%%~dpnf.pdf" >nul 2>nul
        )
    )
)

if "%HAS_MMD%"=="0" (
    echo Nenhum diagrama .mmd encontrado em %FIGURES_DIR%\.
) else (
    echo Diagramas processados com sucesso em %FIGURES_DIR%\.
)
goto :eof

:build
echo Compilando %MAIN_FILE%...
set max_print_line=10000
latexmk -pdf -silent -interaction=nonstopmode -outdir=%BUILD_DIR% -cd %SRC_DIR%\%MAIN_FILE%
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha na compilacao do LaTeX. Execute '.\make.bat check --no-build' para ver detalhes.
    exit /b %ERRORLEVEL%
)
echo Compilacao concluida. PDF gerado na pasta %SRC_DIR%\%BUILD_DIR%\
goto :eof

:check
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Node.js nao foi encontrado no sistema.
    echo Para executar o diagnostico e auditoria ABNT, instale o Node.js: https://nodejs.org/
    exit /b 1
)
node scripts\check.js %2 %3 %4 %5 %6
goto :eof

:doctor
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Node.js nao foi encontrado no sistema.
    echo Para executar o diagnostico completo de dependencias, instale o Node.js: https://nodejs.org/
    exit /b 1
)
node scripts\doctor.js %2 %3 %4 %5 %6
goto :eof

:preview
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Node.js nao foi encontrado no sistema.
    echo Para gerar previas em PNG, instale o Node.js: https://nodejs.org/
    exit /b 1
)
node scripts\preview_page.js %2 %3 %4 %5 %6
goto :eof

:slides
echo Compilando slides da banca (%SLIDES_DIR%\%SLIDES_FILE%)...
set max_print_line=10000
latexmk -pdf -silent -interaction=nonstopmode -outdir=%BUILD_DIR% -cd %SLIDES_DIR%\%SLIDES_FILE%
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha na compilacao dos slides. Verifique %SLIDES_DIR%\%BUILD_DIR%\apresentacao.log.
    exit /b %ERRORLEVEL%
)
echo Slides gerados com sucesso em: %SLIDES_DIR%\%BUILD_DIR%\apresentacao.pdf
goto :eof

:portal
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Node.js nao foi encontrado no sistema.
    echo Para gerar o portal web, instale o Node.js: https://nodejs.org/
    exit /b 1
)
node scripts\build_portal.js
goto :eof

:diff
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Node.js nao foi encontrado no sistema.
    echo Para gerar o relatorio de mudancas, instale o Node.js: https://nodejs.org/
    exit /b 1
)
node scripts\diff_report.js %2 %3 %4 %5 %6
goto :eof

:addref
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Node.js nao foi encontrado no sistema.
    echo Para importar referencias via DOI, instale o Node.js: https://nodejs.org/
    exit /b 1
)
node scripts\add_doi.js %2 %3 %4 %5 %6
goto :eof

:update
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Node.js nao foi encontrado no sistema.
    echo Para atualizar o template automaticamente, instale o Node.js: https://nodejs.org/
    exit /b 1
)
node scripts\update_template.js %2 %3 %4 %5 %6
goto :eof

:clean
echo Limpando arquivos auxiliares...
latexmk -c -outdir=%BUILD_DIR% -cd %SRC_DIR%\%MAIN_FILE%
if exist "%SRC_DIR%\%BUILD_DIR%\*-SAVE-ERROR" del /q "%SRC_DIR%\%BUILD_DIR%\*-SAVE-ERROR" >nul 2>nul
echo Limpeza de arquivos auxiliares concluida.
goto :eof

:cleanall
echo Limpando todos os arquivos gerados (incluindo PDF)...
latexmk -C -outdir=%BUILD_DIR% -cd %SRC_DIR%\%MAIN_FILE%
if exist "%SRC_DIR%\%BUILD_DIR%\*-SAVE-ERROR" del /q "%SRC_DIR%\%BUILD_DIR%\*-SAVE-ERROR" >nul 2>nul
echo Limpeza total concluida.
goto :eof

:help
echo ========================================================
echo  Opcoes do script make.bat:
echo ========================================================
echo   .\make.bat build    - Compila o LaTeX gerando o PDF final de forma enxuta.
echo   .\make.bat figures  - Compila os diagramas .mmd em PDF em src\figuras\
echo   .\make.bat check    - Executa o diagnostico de build, layout, geometria do PDF e ABNT.
echo   .\make.bat doctor   - Verifica todas as dependencias (LaTeX, Biber, Perl, Node, Poppler, Beamer).
echo   .\make.bat preview  - Renderiza paginas do PDF em PNG (ex: .\make.bat preview 14 ou --issues).
echo   .\make.bat slides   - Compila os slides Beamer da banca em slides\build\apresentacao.pdf.
echo   .\make.bat portal   - Gera o portal web interativo em public\ (GitHub Pages).
echo   .\make.bat diff     - Exibe word-diff por secao e gera relatorio visual (--html / --md).
echo   .\make.bat add-ref  - Importa referencia ABNT via DOI para src\referencias.bib.
echo   .\make.bat update   - Verifica e sincroniza melhorias do template (--dry-run / --sync-infra / --rollback).
echo   .\make.bat all      - Executa figures -^> build -^> clean (pipeline completo)
echo   .\make.bat clean    - Remove arquivos temporarios (.aux, .log, .bbl, etc).
echo   .\make.bat cleanall - Remove todos os arquivos gerados (incluindo .pdf).
echo   .\make.bat help     - Exibe esta mensagem de ajuda.
echo ========================================================
goto :eof

@echo off
setlocal

set SRC_DIR=src
set MAIN_FILE=main.tex
set BUILD_DIR=build

if "%1"=="" goto build
if "%1"=="build" goto build
if "%1"=="clean" goto clean
if "%1"=="cleanall" goto cleanall
if "%1"=="help" goto help

echo Comando invalido. Use "make.bat help" para opcoes.
goto :eof

:build
echo Compilando %MAIN_FILE%...
latexmk -pdf -interaction=nonstopmode -outdir=%BUILD_DIR% -cd %SRC_DIR%\%MAIN_FILE%
echo Compilacao concluida. PDF gerado na pasta %SRC_DIR%\%BUILD_DIR%\
goto :eof

:clean
echo Limpando arquivos auxiliares...
latexmk -c -outdir=%BUILD_DIR% -cd %SRC_DIR%\%MAIN_FILE%
echo Limpeza de arquivos auxiliares concluida.
goto :eof

:cleanall
echo Limpando todos os arquivos gerados (incluindo PDF)...
latexmk -C -outdir=%BUILD_DIR% -cd %SRC_DIR%\%MAIN_FILE%
echo Limpeza total concluida.
goto :eof

:help
echo Opcoes do script make.bat:
echo   make.bat build    - Compila o projeto LaTeX gerando o PDF final.
echo   make.bat clean    - Remove arquivos temporarios e auxiliares (.aux, .log, etc).
echo   make.bat cleanall - Remove todos os arquivos gerados (incluindo o .pdf).
goto :eof

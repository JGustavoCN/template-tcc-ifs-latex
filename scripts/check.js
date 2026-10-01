#!/usr/bin/env node
/**
 * check.js - Verificador Inteligente de Build, Diagramação e Conformidade ABNT para TCC.
 *
 * Funcionalidades:
 * 1. Diagnóstico do Build (src/build/main.log e main.blg):
 *    - Erros fatais de compilação sem o ruído do LaTeX
 *    - Citações e referências cruzadas não resolvidas
 *    - Problemas de espaçamento e diagramação:
 *      * Underfull \vbox: páginas com grandes vazios ou espaçamentos excessivos entre tabelas/textos
 *      * Overfull \vbox: conteúdo estourando a margem inferior
 *      * Overfull \hbox: linhas ou tabelas vazando a margem direita
 *      * Flutuadores problemáticos (tabelas/figuras muito grandes ou 'h' forçado)
 *    - Avisos do Biber / BibLaTeX no processamento de referências
 *    - Estatísticas do documento (páginas totais, tamanho do PDF)
 * 2. Auditoria ABNT e Redação (src/capitulos/*.tex):
 *    - Figuras e tabelas sem legenda (\caption), fonte (\fonte) ou rótulo (\label)
 *    - Vícios de linguagem acadêmica (1ª pessoa do singular/plural)
 *    - Palavras duplicadas em sequência acidental
 * 3. Suporte a formatos de saída:
 *    - Terminal interativo com resumo limpo e colorido
 *    - Saída em JSON (--json) para consumo estruturado por IAs e pipelines
 *
 * Uso:
 *   node scripts/check.js
 *   node scripts/check.js --json
 *   node scripts/check.js --build-only
 *   node scripts/check.js --text-only
 */

const fs = require('fs');
const path = require('path');

// Suporte a cores ANSI
const isColorSupported = process.stdout.isTTY && !process.env.NO_COLOR && !process.argv.includes('--no-color');
const GREEN = isColorSupported ? '\x1b[32m' : '';
const YELLOW = isColorSupported ? '\x1b[33m' : '';
const RED = isColorSupported ? '\x1b[31m' : '';
const BLUE = isColorSupported ? '\x1b[34m' : '';
const CYAN = isColorSupported ? '\x1b[36m' : '';
const BOLD = isColorSupported ? '\x1b[1m' : '';
const RESET = isColorSupported ? '\x1b[0m' : '';

class TCCChecker {
  constructor(rootDir, options = {}) {
    this.rootDir = rootDir;
    this.srcDir = path.join(rootDir, 'src');
    this.buildDir = path.join(this.srcDir, 'build');
    this.options = options;

    this.report = {
      timestamp: new Date().toISOString(),
      summary: {
        status: 'OK',
        errorsCount: 0,
        warningsCount: 0,
        suggestionsCount: 0,
        pages: null,
        pdfSizeBytes: null,
      },
      buildDiagnostics: {
        hasBuildFiles: false,
        compilationErrors: [],
        layoutIssues: {
          underfullVbox: [], // Espaços verticais excessivos (tabelas/textos esticados)
          overfullVbox: [],  // Estouro vertical inferior
          overfullHbox: [],  // Estouro horizontal lateral
          floatWarnings: []  // Tabelas/figuras com problemas de posicionamento
        },
        missingReferences: [],
        missingCitations: [],
        biberWarnings: [],
        generalWarnings: []
      },
      textAudit: {
        environmentIssues: [],
        repeatedWords: [],
        impersonalToneIssues: [],
        prohibitedDashes: [],
        archaicTermIssues: [],
        denseParagraphIssues: []
      }
    };
  }

  printSection(title) {
    if (!this.options.json) {
      console.log(`\n${BOLD}${BLUE}=== ${title} ===${RESET}`);
    }
  }

  addError(category, details) {
    this.report.summary.errorsCount++;
    this.report.summary.status = 'ERROR';
    if (this.report[category]) {
      if (Array.isArray(this.report[category])) {
        this.report[category].push(details);
      }
    }
  }

  addWarning(category, details) {
    this.report.summary.warningsCount++;
    if (this.report.summary.status !== 'ERROR') {
      this.report.summary.status = 'WARNING';
    }
    if (this.report[category]) {
      if (Array.isArray(this.report[category])) {
        this.report[category].push(details);
      }
    }
  }

  addSuggestion(category, details) {
    this.report.summary.suggestionsCount++;
    if (this.report[category]) {
      if (Array.isArray(this.report[category])) {
        this.report[category].push(details);
      }
    }
  }

  checkBuildLog() {
    let logFile = path.join(this.buildDir, 'main.log');
    let blgFile = path.join(this.buildDir, 'main.blg');
    let pdfFile = path.join(this.buildDir, 'main.pdf');

    if (!fs.existsSync(logFile)) {
      // Fallback para caso o build tenha ocorrido diretamente em src/ (ex: CI/CD ou Overleaf)
      const altLog = path.join(this.srcDir, 'main.log');
      if (fs.existsSync(altLog)) {
        logFile = altLog;
        blgFile = path.join(this.srcDir, 'main.blg');
        pdfFile = path.join(this.srcDir, 'main.pdf');
      } else {
        this.report.buildDiagnostics.hasBuildFiles = false;
        return;
      }
    }
    this.report.buildDiagnostics.hasBuildFiles = true;

    if (fs.existsSync(pdfFile)) {
      try {
        const stats = fs.statSync(pdfFile);
        this.report.summary.pdfSizeBytes = stats.size;
      } catch (e) {}
    }

    const logContent = fs.readFileSync(logFile, 'utf-8');

    // 1. Estatísticas do PDF (páginas geradas)
    const pagesMatch = logContent.match(/Output written on [\s\S]*?\(\s*([0-9]+)\s+pages?,\s*([0-9]+)\s+bytes\)/i);
    if (pagesMatch) {
      this.report.summary.pages = parseInt(pagesMatch[1], 10);
    }

    // 2. Erros Críticos de Compilação
    const lines = logContent.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('! ')) {
        const errorMsg = line.substring(2).trim();
        let contextLine = '';
        if (i + 1 < lines.length && lines[i + 1].startsWith('l.')) {
          contextLine = lines[i + 1].trim();
        }
        this.report.buildDiagnostics.compilationErrors.push({
          message: errorMsg,
          context: contextLine
        });
        this.report.summary.errorsCount++;
        this.report.summary.status = 'ERROR';
      }
    }

    // 3. Referências cruzadas indefinidas (\ref, \autoref)
    const refRegex = /LaTeX Warning: Reference `([^']+)' on page (\d+) undefined/g;
    let refMatch;
    const undefRefs = new Map();
    while ((refMatch = refRegex.exec(logContent)) !== null) {
      const key = refMatch[1];
      const page = refMatch[2];
      if (!undefRefs.has(key)) undefRefs.set(key, []);
      undefRefs.get(key).push(page);
    }
    for (const [key, pages] of undefRefs.entries()) {
      const item = { label: key, pages: [...new Set(pages)] };
      this.report.buildDiagnostics.missingReferences.push(item);
      this.report.summary.errorsCount++;
      this.report.summary.status = 'ERROR';
    }

    // 4. Citações bibliográficas indefinidas (\cite)
    const citeRegex = /LaTeX Warning: Citation `([^']+)' on page (\d+) undefined/g;
    let citeMatch;
    const undefCites = new Map();
    while ((citeMatch = citeRegex.exec(logContent)) !== null) {
      const key = citeMatch[1];
      const page = citeMatch[2];
      if (!undefCites.has(key)) undefCites.set(key, []);
      undefCites.get(key).push(page);
    }
    for (const [key, pages] of undefCites.entries()) {
      const item = { citationKey: key, pages: [...new Set(pages)] };
      this.report.buildDiagnostics.missingCitations.push(item);
      this.report.summary.errorsCount++;
      this.report.summary.status = 'ERROR';
    }

    // 5. Diagnóstico de Espaçamento e Diagramação (Underfull \vbox / Overfull \vbox)
    // Underfull \vbox (badness 10000) has occurred while \output is active [5]
    const underfullVboxRegex = /Underfull \\vbox \(badness (\d+)\) has occurred while \\output is active \[(\d+)\]/g;
    let uvMatch;
    const uvPages = new Map();
    while ((uvMatch = underfullVboxRegex.exec(logContent)) !== null) {
      const badness = parseInt(uvMatch[1], 10);
      const page = parseInt(uvMatch[2], 10);
      if (!uvPages.has(page) || uvPages.get(page) < badness) {
        uvPages.set(page, badness);
      }
    }
    for (const [page, badness] of uvPages.entries()) {
      const severity = badness >= 10000 ? 'ALTO' : 'MEDIO';
      this.report.buildDiagnostics.layoutIssues.underfullVbox.push({
        page,
        badness,
        severity,
        description: `Espaço em branco vertical excessivo na página ${page} (badness ${badness}). Geralmente causado por tabelas ou figuras deslocadas para a próxima página ou quebras forçadas.`
      });
      this.report.summary.warningsCount++;
      if (this.report.summary.status !== 'ERROR') this.report.summary.status = 'WARNING';
    }

    // Overfull \vbox (X pt too high) has occurred while \output is active [Y]
    const overfullVboxRegex = /Overfull \\vbox \(([0-9.]+pt too high)\) has occurred while \\output is active \[(\d+)\]/g;
    let ovMatch;
    while ((ovMatch = overfullVboxRegex.exec(logContent)) !== null) {
      const overflow = ovMatch[1];
      const page = parseInt(ovMatch[2], 10);
      this.report.buildDiagnostics.layoutIssues.overfullVbox.push({
        page,
        overflow,
        description: `Conteúdo ultrapassou a margem inferior da página ${page} em ${overflow}.`
      });
      this.report.summary.warningsCount++;
      if (this.report.summary.status !== 'ERROR') this.report.summary.status = 'WARNING';
    }

    // Overfull \hbox (X pt too wide) in paragraph at lines AA--BB
    const overfullHboxRegex = /Overfull \\hbox \(([0-9.]+pt too wide)\) in paragraph at lines (\d+)--(\d+)/g;
    let ohMatch;
    while ((ohMatch = overfullHboxRegex.exec(logContent)) !== null) {
      const overflow = ohMatch[1];
      const startLine = parseInt(ohMatch[2], 10);
      const endLine = parseInt(ohMatch[3], 10);
      this.report.buildDiagnostics.layoutIssues.overfullHbox.push({
        lines: `${startLine}-${endLine}`,
        overflow,
        description: `Texto ou elemento transbordou a margem lateral direita em ${overflow} (linhas ${startLine} a ${endLine}).`
      });
      this.report.summary.warningsCount++;
      if (this.report.summary.status !== 'ERROR') this.report.summary.status = 'WARNING';
    }

    // Avisos de Flutuadores (tabelas e figuras grandes ou teimosas)
    const floatTooLargeRegex = /Float too large for page by ([0-9.]+pt) on input line (\d+)/g;
    let flMatch;
    while ((flMatch = floatTooLargeRegex.exec(logContent)) !== null) {
      this.report.buildDiagnostics.layoutIssues.floatWarnings.push({
        line: parseInt(flMatch[2], 10),
        detail: `Elemento flutuante excede o tamanho da página por ${flMatch[1]} (linha ${flMatch[2]}).`
      });
      this.report.summary.warningsCount++;
      if (this.report.summary.status !== 'ERROR') this.report.summary.status = 'WARNING';
    }

    const floatSpecifierRegex = /LaTeX Warning: `!h' float specifier changed to `!ht'/g;
    if (floatSpecifierRegex.test(logContent)) {
      this.report.buildDiagnostics.layoutIssues.floatWarnings.push({
        detail: "Especificador de flutuador '[!h]' forçado foi alterado automaticamente para '[!ht]' pelo LaTeX para evitar quebra de página inadequada."
      });
      this.report.summary.suggestionsCount++;
    }

    // 6. Avisos de Pacotes Conhecidos (ignora o aviso interno do abntex2 de 'brazil' deprecado)

    const duplicateDestRegex = /pdfTeX warning \(ext4\): destination with the same identifier \(name\{([^}]+)\}\) has been already used/g;
    let dupMatch;
    const dupNames = new Set();
    while ((dupMatch = duplicateDestRegex.exec(logContent)) !== null) {
      dupNames.add(dupMatch[1]);
    }
    if (dupNames.size > 0) {
      this.report.buildDiagnostics.generalWarnings.push(
        `Hiperlinks com identificadores duplicados ignorados pelo pdfTeX: ${Array.from(dupNames).slice(0, 3).join(', ')}${dupNames.size > 3 ? '...' : ''}`
      );
      this.report.summary.suggestionsCount++;
    }

    // 7. Auditoria do Biber (.blg)
    if (fs.existsSync(blgFile)) {
      const blgContent = fs.readFileSync(blgFile, 'utf-8');
      const biberWarnRegex = /> WARN - (.*)/g;
      let bWarnMatch;
      while ((bWarnMatch = biberWarnRegex.exec(blgContent)) !== null) {
        const warnText = bWarnMatch[1].trim();
        this.report.buildDiagnostics.biberWarnings.push(warnText);
        this.report.summary.warningsCount++;
        if (this.report.summary.status !== 'ERROR') this.report.summary.status = 'WARNING';
      }

      const biberErrRegex = /> ERROR - (.*)/g;
      let bErrMatch;
      while ((bErrMatch = biberErrRegex.exec(blgContent)) !== null) {
        const errText = bErrMatch[1].trim();
        this.report.buildDiagnostics.biberWarnings.push(`ERRO BIBER: ${errText}`);
        this.report.summary.errorsCount++;
        this.report.summary.status = 'ERROR';
      }
    }
  }

  getTexFiles() {
    const searchDirs = ['capitulos', 'apendices', 'anexos'];
    const files = [];

    for (const dirName of searchDirs) {
      const targetDir = path.join(this.srcDir, dirName);
      if (fs.existsSync(targetDir)) {
        const items = fs.readdirSync(targetDir);
        for (const item of items) {
          if (item.endsWith('.tex')) {
            files.push(path.join(targetDir, item));
          }
        }
      }
    }

    const mainTex = path.join(this.srcDir, 'main.tex');
    if (fs.existsSync(mainTex)) {
      files.push(mainTex);
    }

    return files.sort();
  }

  checkTexFiles() {
    const texFiles = this.getTexFiles();
    if (texFiles.length === 0) return;

    for (const filePath of texFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relPath = path.relative(this.rootDir, filePath).replace(/\\/g, '/');

        // A. Auditoria de Ambientes (figure e table)
        const envPattern = /\\begin\{(figure|table)\}([\s\S]*?)\\end\{\1\}/g;
        let match;
        while ((match = envPattern.exec(content)) !== null) {
          const envType = match[1];
          const body = match[2];
          const nomeEnv = envType === 'figure' ? 'Figura' : 'Tabela';
          const lineNum = content.slice(0, match.index).split('\n').length;

          const hasCaption = /\\caption\{/.test(body);
          const hasFonte = /\\fonte\{/.test(body);
          const hasLabel = /\\label\{/.test(body);

          if (!hasCaption) {
            this.report.textAudit.environmentIssues.push({
              file: relPath,
              line: lineNum,
              type: 'ERROR',
              message: `${nomeEnv} sem legenda (\\caption{...}). Exigido pela ABNT.`
            });
            this.report.summary.errorsCount++;
            this.report.summary.status = 'ERROR';
          }
          if (!hasFonte) {
            this.report.textAudit.environmentIssues.push({
              file: relPath,
              line: lineNum,
              type: 'WARNING',
              message: `${nomeEnv} sem fonte explícita (\\fonte{...}). ABNT exige indicação de fonte em todas as ilustrações.`
            });
            this.report.summary.warningsCount++;
            if (this.report.summary.status !== 'ERROR') this.report.summary.status = 'WARNING';
          }
          if (!hasLabel) {
            this.report.textAudit.environmentIssues.push({
              file: relPath,
              line: lineNum,
              type: 'WARNING',
              message: `${nomeEnv} sem rótulo de referência cruzada (\\label{...}).`
            });
            this.report.summary.warningsCount++;
            if (this.report.summary.status !== 'ERROR') this.report.summary.status = 'WARNING';
          }
        }

        // B. Palavras duplicadas consecutivas
        const lines = content.split(/\r?\n/);
        const dupPattern = /\b([a-zA-ZÀ-ÿ]{2,})\s+\1\b/gi;
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('%')) return;
          const codePart = line.split('%')[0];
          let dMatch;
          while ((dMatch = dupPattern.exec(codePart)) !== null) {
            this.report.textAudit.repeatedWords.push({
              file: relPath,
              line: index + 1,
              word: dMatch[0]
            });
            this.report.summary.warningsCount++;
            if (this.report.summary.status !== 'ERROR') this.report.summary.status = 'WARNING';
          }
        });

        // C. Tom impessoal acadêmico (1ª pessoa)
        const firstPersonPatterns = [
          { regex: /\b(eu|meu|minha|meus|minhas)\b/gi, desc: '1ª pessoa do singular (eu/meu)' },
          { regex: /\b(nós|nosso|nossa|nossos|nossas)\b/gi, desc: '1ª pessoa do plural (nós/nosso)' },
          { regex: /\b(fizemos|analisamos|concluímos|observamos|desenvolvemos)\b/gi, desc: 'Verbo em 1ª pessoa do plural' }
        ];

        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('%') || line.includes('\\cite') || line.includes('\\bibitem')) return;
          const codePart = line.split('%')[0];
          const cleanText = codePart.replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{[^\}]*\})?/g, ' ');

          firstPersonPatterns.forEach(({ regex, desc }) => {
            let pMatch;
            while ((pMatch = regex.exec(cleanText)) !== null) {
              this.report.textAudit.impersonalToneIssues.push({
                file: relPath,
                line: index + 1,
                term: pMatch[0],
                description: desc
              });
              this.report.summary.suggestionsCount++;
            }
          });
        });

        // D. Verificação de travessões proibidos (--- ou --) no corpo do texto (skill academic_writing_style)
        const isContentFile = relPath.startsWith('src/capitulos/') || relPath.startsWith('src/apendices/') || relPath.startsWith('src/anexos/');
        if (isContentFile) {
          lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('%') || line.includes('\\captiondelim') || line.includes('\\hypersetup')) return;
            const codePart = line.split('%')[0];
            
            // Remove citações com intervalos numéricos (ex: p.~15--20) e intervalos numéricos soltos
            const cleanLine = codePart
              .replace(/\\cite[a-zA-Z]*(\[[^\]]*\])?\{[^}]*\}/g, ' ')
              .replace(/\b\d+\s*--\s*\d+\b/g, ' ')
              .replace(/\\caption\{[^}]*\}/g, ' ') // legendas já têm formatação própria
              .replace(/\\fonte\{[^}]*\}/g, ' ');

            const dashMatch = cleanLine.match(/(\s+---\s+|\s+--\s+|\b\w+---\w+\b|\b\w+--\w+\b)/);
            if (dashMatch) {
              this.report.textAudit.prohibitedDashes.push({
                file: relPath,
                line: index + 1,
                term: dashMatch[0].trim(),
                message: "Uso de travessão ('--' ou '---') para isolar explicações. Prefira parênteses '(...)' ou vírgulas (Diretriz academic_writing_style)."
              });
              this.report.summary.suggestionsCount++;
            }
          });
        }

        // E. Termos rebuscados/arcaicos e substituições recomendadas (skill academic_writing_style)
        const archaicTerms = [
          { pattern: /\btece(?:m|r)?\s+(?:as\s+)?considera[çc][õo]es\s+finais\b/gi, suggestion: 'apresenta as considerações finais' },
          { pattern: /\bhipotetiza-se\s+que\b/gi, suggestion: 'a hipótese desta pesquisa é que / pressupõe-se que' },
          { pattern: /\binsumos\s+emp[íi]ricos\b/gi, suggestion: 'dados empíricos / evidências empíricas' },
          { pattern: /\bafasta\s+qualquer\s+vi[ée]s\b/gi, suggestion: 'reduz a ocorrência de viés' },
          { pattern: /\bpercurso\s+metodol[óo]gico\b/gi, suggestion: 'procedimentos metodológicos' },
          { pattern: /\bn[ãa]o\s+obstante\b/gi, suggestion: 'ainda assim / apesar disso' },
          { pattern: /\bvisando\s+[àa]\b/gi, suggestion: 'para a / com o intuito de' }
        ];

        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('%')) return;
          const codePart = line.split('%')[0];

          archaicTerms.forEach(({ pattern, suggestion }) => {
            let aMatch;
            while ((aMatch = pattern.exec(codePart)) !== null) {
              this.report.textAudit.archaicTermIssues.push({
                file: relPath,
                line: index + 1,
                term: aMatch[0],
                suggestion
              });
              this.report.summary.suggestionsCount++;
            }
          });
        });

        // F. Parágrafos excessivamente extensos (> 250 palavras sem quebra de parágrafo)
        if (isContentFile) {
          const rawParagraphs = content.split(/\r?\n\s*\r?\n/);
          let currentLineTracker = 1;

          rawParagraphs.forEach((par) => {
            const parLines = par.split(/\r?\n/);
            const lineCount = parLines.length;
            const startLine = currentLineTracker;
            currentLineTracker += lineCount + 1; // +1 pela linha em branco divisória

            // Remove comentários e comandos de ambiente
            const cleanPar = parLines
              .map(l => l.split('%')[0])
              .join(' ')
              .replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{[^}]*\})?/g, ' ')
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
              .trim();

            if (cleanPar.length === 0) return;

            const words = cleanPar.split(/\s+/).filter(w => w.length > 0);
            if (words.length > 250) {
              this.report.textAudit.denseParagraphIssues.push({
                file: relPath,
                line: startLine,
                wordCount: words.length,
                message: `Parágrafo extenso identificado (${words.length} palavras). Blocos densos prejudicam a fluidez científica; divida em períodos menores.`
              });
              this.report.summary.suggestionsCount++;
            }
          });
        }

      } catch (err) {
        this.report.textAudit.environmentIssues.push({
          file: path.relative(this.rootDir, filePath),
          line: 0,
          type: 'ERROR',
          message: `Falha ao ler arquivo: ${err.message}`
        });
      }
    }
  }

  run() {
    const doBuild = !this.options.textOnly;
    const doText = !this.options.buildOnly;

    if (doBuild) {
      this.checkBuildLog();
    }
    if (doText) {
      this.checkTexFiles();
    }

    if (this.options.json) {
      console.log(JSON.stringify(this.report, null, 2));
      return this.report.summary.errorsCount > 0 ? 1 : 0;
    }

    // Saída Formatada no Terminal
    console.log(`\n${BOLD}${CYAN}🔍 TCC Checker - Diagnóstico de Compilação, Layout e ABNT${RESET}`);
    console.log(`${CYAN}───────────────────────────────────────────────────────────${RESET}`);

    // Seção de Status do Build
    if (doBuild) {
      this.printSection('1. Diagnóstico do Build & Compilação');
      const b = this.report.buildDiagnostics;

      if (!b.hasBuildFiles) {
        console.log(`  ${YELLOW}[AVISO]${RESET} Arquivos de build não encontrados em src/build/.`);
        console.log(`         Execute 'make build' ou '.\\make.bat build' antes de rodar o check.`);
      } else {
        if (this.report.summary.pages) {
          const sizeKb = this.report.summary.pdfSizeBytes ? ` (${Math.round(this.report.summary.pdfSizeBytes / 1024)} KB)` : '';
          console.log(`  ${GREEN}[OK]${RESET} PDF compilado com sucesso: ${BOLD}${this.report.summary.pages} páginas${RESET}${sizeKb}.`);
        }

        if (b.compilationErrors.length > 0) {
          console.log(`  ${RED}[ERRO FATAL]${RESET} Falhas de compilação detectadas:`);
          b.compilationErrors.forEach(err => {
            console.log(`    • ${RED}${err.message}${RESET} ${err.context ? `(${err.context})` : ''}`);
          });
        }

        if (b.missingReferences.length > 0) {
          console.log(`  ${RED}[ERRO]${RESET} Referências cruzadas não resolvidas:`);
          b.missingReferences.forEach(ref => {
            console.log(`    • \\ref{${ref.label}} utilizada na(s) página(s): ${ref.pages.join(', ')}`);
          });
        }

        if (b.missingCitations.length > 0) {
          console.log(`  ${RED}[ERRO]${RESET} Citações ausentes no arquivo referencias.bib:`);
          b.missingCitations.forEach(cite => {
            console.log(`    • \\cite{${cite.citationKey}} citada na(s) página(s): ${cite.pages.join(', ')}`);
          });
        }

        if (b.layoutIssues.underfullVbox.length > 0) {
          console.log(`  ${YELLOW}[LAYOUT - ESPAÇO EXCESSIVO]${RESET} Páginas com vazios/espaçamento vertical anormal:`);
          b.layoutIssues.underfullVbox.forEach(uv => {
            console.log(`    • Página ${BOLD}${uv.page}${RESET}: ${uv.description}`);
          });
        }

        if (b.layoutIssues.overfullHbox.length > 0) {
          console.log(`  ${YELLOW}[LAYOUT - VAZAMENTO DE MARGEM]${RESET} Elementos ultrapassando a margem direita:`);
          b.layoutIssues.overfullHbox.slice(0, 5).forEach(oh => {
            console.log(`    • Linhas ${oh.lines}: ultrapassa margem em ${oh.overflow}`);
          });
          if (b.layoutIssues.overfullHbox.length > 5) {
            console.log(`    ... e mais ${b.layoutIssues.overfullHbox.length - 5} ocorrência(s).`);
          }
        }

        if (b.layoutIssues.floatWarnings.length > 0) {
          console.log(`  ${YELLOW}[LAYOUT - FLUTUADORES]${RESET} Ajustes em tabelas/figuras:`);
          b.layoutIssues.floatWarnings.forEach(fw => {
            console.log(`    • ${fw.detail}`);
          });
        }

        if (b.biberWarnings.length > 0) {
          console.log(`  ${YELLOW}[BIBLIOGRAFIA - BIBER]${RESET} Avisos no processamento das referências:`);
          b.biberWarnings.forEach(bw => console.log(`    • ${bw}`));
        }

        if (b.generalWarnings.length > 0) {
          b.generalWarnings.forEach(gw => console.log(`  ${CYAN}[NOTA]${RESET} ${gw}`));
        }

        if (b.compilationErrors.length === 0 && b.missingReferences.length === 0 &&
            b.missingCitations.length === 0 && b.layoutIssues.underfullVbox.length === 0 &&
            b.layoutIssues.overfullHbox.length === 0 && b.biberWarnings.length === 0) {
          console.log(`  ${GREEN}[OK]${RESET} Diagramação, referências e citações limpas, sem anomalias detectadas.`);
        }
      }
    }

    // Seção de Auditoria Textual ABNT
    if (doText) {
      this.printSection('2. Auditoria ABNT e Redação Científica (.tex)');
      const t = this.report.textAudit;

      if (t.environmentIssues.length > 0) {
        t.environmentIssues.forEach(item => {
          const tag = item.type === 'ERROR' ? `${RED}[ERRO ABNT]${RESET}` : `${YELLOW}[AVISO ABNT]${RESET}`;
          console.log(`  ${tag} ${item.file}:${item.line} - ${item.message}`);
        });
      }

      if (t.repeatedWords.length > 0) {
        t.repeatedWords.forEach(item => {
          console.log(`  ${YELLOW}[REPETIÇÃO]${RESET} ${item.file}:${item.line} - Palavra duplicada: '${item.word}'`);
        });
      }

      if (t.impersonalToneIssues.length > 0) {
        console.log(`  ${CYAN}[SUGESTÃO - VOZ IMPESSOAL]${RESET} ${t.impersonalToneIssues.length} ocorrência(s) de 1ª pessoa no texto (prefira voz impessoal):`);
        t.impersonalToneIssues.slice(0, 4).forEach(item => {
          console.log(`    • ${item.file}:${item.line} - Termo '${item.term}' (${item.description})`);
        });
        if (t.impersonalToneIssues.length > 4) {
          console.log(`    ... e mais ${t.impersonalToneIssues.length - 4} sugestão(ões).`);
        }
      }

      if (t.prohibitedDashes.length > 0) {
        console.log(`  ${YELLOW}[ESTILO - PONTUAÇÃO]${RESET} ${t.prohibitedDashes.length} travessão(ões) ('--' ou '---') no corpo do texto (prefira parênteses ou vírgulas):`);
        t.prohibitedDashes.slice(0, 4).forEach(item => {
          console.log(`    • ${item.file}:${item.line} - Trecho: '${item.term}'`);
        });
        if (t.prohibitedDashes.length > 4) {
          console.log(`    ... e mais ${t.prohibitedDashes.length - 4} ocorrência(s).`);
        }
      }

      if (t.archaicTermIssues.length > 0) {
        console.log(`  ${CYAN}[ESTILO - VOCABULÁRIO]${RESET} ${t.archaicTermIssues.length} sugestão(ões) de substituição de termos arcaicos/pedantes:`);
        t.archaicTermIssues.slice(0, 4).forEach(item => {
          console.log(`    • ${item.file}:${item.line} - '${item.term}' ➔ Sugestão: '${item.suggestion}'`);
        });
        if (t.archaicTermIssues.length > 4) {
          console.log(`    ... e mais ${t.archaicTermIssues.length - 4} sugestão(ões).`);
        }
      }

      if (t.denseParagraphIssues.length > 0) {
        console.log(`  ${YELLOW}[ESTILO - FLUIDEZ]${RESET} ${t.denseParagraphIssues.length} parágrafo(s) excessivamente extenso(s) (> 250 palavras):`);
        t.denseParagraphIssues.forEach(item => {
          console.log(`    • ${item.file}:${item.line} - ${item.message}`);
        });
      }

      if (t.environmentIssues.length === 0 && t.repeatedWords.length === 0 && 
          t.impersonalToneIssues.length === 0 && t.prohibitedDashes.length === 0 &&
          t.archaicTermIssues.length === 0 && t.denseParagraphIssues.length === 0) {
        console.log(`  ${GREEN}[OK]${RESET} Figuras, tabelas e redação seguem integralmente o padrão ABNT e as diretrizes de estilo.`);
      }
    }

    // Painel de Resumo Final
    this.printSection('Resumo Geral');
    const s = this.report.summary;
    console.log(`  Total de Erros:      ${s.errorsCount > 0 ? RED + s.errorsCount : GREEN + '0'}${RESET}`);
    console.log(`  Total de Avisos:     ${s.warningsCount > 0 ? YELLOW + s.warningsCount : GREEN + '0'}${RESET}`);
    console.log(`  Sugestões de Estilo: ${CYAN + s.suggestionsCount + RESET}`);

    if (s.errorsCount === 0 && s.warningsCount === 0) {
      console.log(`\n  ${GREEN}${BOLD}🎉 Trabalho 100% aprovado pelo TCC Checker! Pronto para compilação final.${RESET}\n`);
      return 0;
    } else if (s.errorsCount > 0) {
      console.log(`\n  ${RED}${BOLD}⚠️  Atenção: Existem erros críticos que devem ser corrigidos antes da entrega.${RESET}\n`);
      return 1;
    } else {
      console.log(`\n  ${YELLOW}Os avisos acima não quebram o PDF, mas corrigi-los eleva o padrão visual para a banca.${RESET}\n`);
      return 0;
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    json: args.includes('--json'),
    buildOnly: args.includes('--build-only') || args.includes('-b'),
    textOnly: args.includes('--text-only') || args.includes('-t'),
    help: args.includes('--help') || args.includes('-h')
  };

  if (options.help) {
    console.log(`
Uso: node scripts/check.js [opções]

Opções:
  --json          Emite o relatório estruturado em formato JSON (ótimo para IAs e automação)
  --build-only    Executa apenas o diagnóstico de compilação, layout e log
  --text-only     Executa apenas a auditoria ABNT nos arquivos .tex
  --help          Exibe esta mensagem de ajuda
    `);
    process.exit(0);
  }

  return options;
}

function main() {
  const options = parseArgs();
  const rootDir = path.resolve(__dirname, '..');
  const checker = new TCCChecker(rootDir, options);
  const exitCode = checker.run();
  process.exit(exitCode);
}

main();

#!/usr/bin/env node
/**
 * check.js - Verificador Inteligente de Build, Diagramação e Conformidade ABNT para TCC.
 *
 * Funcionalidades:
 * 1. Auto-build inteligente:
 *    - Detecta se src/build/main.log está ausente, desatualizado (via main.fdb_latexmk)
 *      ou não convergiu (via main.run.xml) e compila automaticamente via latexmk.
 *    - Suporta --no-build para auditar estritamente o último log existente.
 * 2. Diagnóstico do Build (src/build/main.log, main.fls, main.blg, main.run.xml):
 *    - Parser de pilha de parênteses com unwrapping de 79 colunas e validação via main.fls
 *    - Mapeamento exato de Overfull/Underfull \hbox para arquivo .tex ou main.lot/main.lof -> Tabela/Figura -> .tex
 *    - Erros fatais, referências/citações ausentes, avisos do Biber, *-SAVE-ERROR e PDF 1.7
 * 3. Auditoria de Flutuadores e Diagramação (via LayoutInspector):
 *    - Preâmbulo (config.tex), proporção /MediaBox de figuras PDF, Float Drift e Float Congestion
 * 4. Auditoria ABNT e Redação (.tex):
 *    - Suporte completo a \caption[curto]{longo}, alerta preventivo para \caption com \texttt/$
 *    - Tolerância amigável a \legend, diretivas % check-ignore, palavras duplicadas Unicode,
 *      voz impessoal, travessões, termos arcaicos, parágrafos densos e citações estáticas.
 *
 * Uso:
 *   node scripts/check.js
 *   node scripts/check.js --json
 *   node scripts/check.js --floats
 *   node scripts/check.js --no-build
 *   node scripts/check.js --build-only
 *   node scripts/check.js --text-only
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const LayoutInspector = require('./lib/layout_inspector');
const { countProjectWords } = require('./lib/word_counter');
const { inspectPdfGeometry } = require('./lib/pdf_geometry');

// Suporte a cores ANSI
const isColorSupported = process.stdout.isTTY && !process.env.NO_COLOR && !process.argv.includes('--no-color');
const GREEN = isColorSupported ? '\x1b[32m' : '';
const YELLOW = isColorSupported ? '\x1b[33m' : '';
const RED = isColorSupported ? '\x1b[31m' : '';
const BLUE = isColorSupported ? '\x1b[34m' : '';
const CYAN = isColorSupported ? '\x1b[36m' : '';
const GRAY = isColorSupported ? '\x1b[90m' : '';
const BOLD = isColorSupported ? '\x1b[1m' : '';
const RESET = isColorSupported ? '\x1b[0m' : '';

class TCCChecker {
  constructor(rootDir, options = {}) {
    this.rootDir = rootDir;
    this.srcDir = path.join(rootDir, 'src');
    this.buildDir = path.join(this.srcDir, 'build');
    this.options = options;
    this.layoutInspector = new LayoutInspector(rootDir);

    this.report = {
      timestamp: new Date().toISOString(),
      summary: {
        status: 'OK',
        errorsCount: 0,
        warningsCount: 0,
        suggestionsCount: 0,
        pages: null,
        pdfSizeBytes: null,
        textualWords: 0,
        readingTimeMinutes: 0,
        readingTimeFormatted: '< 1 min'
      },
      wordStats: null,
      buildDiagnostics: {
        hasBuildFiles: false,
        autoBuilt: false,
        autoBuildReason: null,
        buildConverged: true,
        saveErrorFiles: [],
        compilationErrors: [],
        layoutIssues: {
          underfullVbox: [],
          overfullVbox: [],
          overfullHbox: [],
          underfullHbox: [],
          floatWarnings: []
        },
        missingReferences: [],
        missingCitations: [],
        biberWarnings: [],
        pdfInclusionWarnings: [],
        generalWarnings: []
      },
      layoutAudit: {
        hasAux: false,
        preambleIssues: [],
        figureAspectIssues: [],
        floatDrifts: [],
        floatCongestions: [],
        specifierIssues: [],
        floatsSummary: []
      },
      geometryAudit: {
        available: false,
        engine: null,
        inkEngine: null,
        pagesAnalyzed: 0,
        maxXRightPt: 0,
        rightLimitPt: 538.6,
        marginOverflows: [],
        bottomOverflows: [],
        splitParagraphs: [],
        hyphenatedPageBreaks: [],
        inkOverflows: [],
        hint: null
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

  bumpWarning() {
    this.report.summary.warningsCount++;
    if (this.report.summary.status !== 'ERROR') {
      this.report.summary.status = 'WARNING';
    }
  }

  bumpError() {
    this.report.summary.errorsCount++;
    this.report.summary.status = 'ERROR';
  }

  /**
   * Lista recursivamente arquivos de entrada relevantes em src/ (ignorando src/build/).
   */
  collectProjectInputFiles() {
    const fdbFile = this.layoutInspector.resolveBuildArtifact('main.fdb_latexmk');
    const tracked = [];

    if (fdbFile && fs.existsSync(fdbFile)) {
      try {
        const fdbContent = fs.readFileSync(fdbFile, 'utf-8');
        const regex = /^\s+"([^"]+)"\s+\d+/gm;
        let m;
        while ((m = regex.exec(fdbContent)) !== null) {
          const entry = m[1];
          // Ignora arquivos absolutos de sistema (MiKTeX/TeX Live) e saídas em build/
          if (path.isAbsolute(entry) || /^build[/\\]/i.test(entry)) continue;
          const full = path.join(this.srcDir, entry);
          if (fs.existsSync(full)) tracked.push(full);
        }
      } catch (e) {}
    }

    if (tracked.length > 0) return [...new Set(tracked)];

    // Fallback: varre src/ por .tex, .bib, .pdf, .png, .jpg
    const exts = new Set(['.tex', '.bib', '.pdf', '.png', '.jpg', '.jpeg']);
    const results = [];
    const walk = (dir) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (path.resolve(full) === path.resolve(this.buildDir)) continue;
          walk(full);
        } else if (exts.has(path.extname(entry.name).toLowerCase())) {
          results.push(full);
        }
      }
    };
    walk(this.srcDir);
    return results;
  }

  /**
   * Garante que exista um build recente antes da auditoria (salvo com --no-build ou --text-only).
   */
  ensureFreshBuild() {
    if (this.options.noBuild || this.options.textOnly) return;

    const existingLog = this.layoutInspector.resolveBuildArtifact('main.log');
    const existingAux = this.layoutInspector.resolveBuildArtifact('main.aux');
    const runXml = this.layoutInspector.resolveBuildArtifact('main.run.xml');

    let reason = null;

    if (!existingLog || !existingAux) {
      reason = 'arquivos de build ausentes em src/build/';
    } else {
      const logMtime = fs.statSync(existingLog).mtimeMs;
      const inputs = this.collectProjectInputFiles();
      for (const inp of inputs) {
        try {
          const st = fs.statSync(inp);
          if (st.mtimeMs > logMtime + 1500) {
            const rel = path.relative(this.rootDir, inp).replace(/\\/g, '/');
            reason = `arquivo alterado após último build (${rel})`;
            break;
          }
        } catch (e) {}
      }

      if (!reason && runXml && fs.existsSync(runXml)) {
        try {
          const xml = fs.readFileSync(runXml, 'utf-8');
          if (/active="1"/.test(xml)) {
            reason = 'compilação anterior não convergiu (main.run.xml ativo)';
          }
        } catch (e) {}
      }
    }

    if (!reason) return;

    // Verifica se latexmk está disponível (evita falhar em ambientes Node-only no CI)
    const probe = spawnSync('latexmk', ['--version'], {
      cwd: this.rootDir,
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    if (probe.error) {
      return;
    }

    if (!this.options.json) {
      console.log(`\n${CYAN}⚙️  Auto-build acionado:${RESET} ${reason}`);
      console.log(`${GRAY}   Executando latexmk com max_print_line=10000...${RESET}`);
    }

    const res = spawnSync(
      'latexmk',
      ['-pdf', '-silent', '-interaction=nonstopmode', '-outdir=build', '-cd', path.join('src', 'main.tex')],
      {
        cwd: this.rootDir,
        env: { ...process.env, max_print_line: '10000' },
        stdio: 'pipe',
        encoding: 'utf-8'
      }
    );

    this.report.buildDiagnostics.autoBuilt = true;
    this.report.buildDiagnostics.autoBuildReason = reason;

    if (res.status !== 0 && !this.options.json) {
      console.log(`${YELLOW}   [AVISO] latexmk retornou código ${res.status}; prosseguindo com diagnóstico do log.${RESET}`);
    }
  }

  /**
   * Carrega o conjunto de arquivos reais lidos pelo pdflatex a partir de main.fls.
   */
  loadFlsInputSet() {
    const flsFile = this.layoutInspector.resolveBuildArtifact('main.fls');
    const known = new Set();
    if (!flsFile) return known;

    try {
      const lines = fs.readFileSync(flsFile, 'utf-8').split(/\r?\n/);
      for (const line of lines) {
        if (line.startsWith('INPUT ')) {
          const raw = line.slice(6).trim().replace(/\\/g, '/');
          known.add(raw);
          known.add(raw.replace(/^\.\//, ''));
          known.add(path.basename(raw));
        }
      }
    } catch (e) {}
    return known;
  }

  /**
   * Desembrulha linhas quebradas rigidamente na coluna 79 pelo pdflatex.
   */
  unwrapTexLogLines(rawLines) {
    const unwrapped = [];
    const headerStartRegex = /^(?:Overfull |Underfull |LaTeX |Package |pdfTeX |! |l\.\d+|Output written|Here is how much|PDF statistics|\[\d+\])/;

    let i = 0;
    while (i < rawLines.length) {
      let current = rawLines[i];
      while (
        current.length === 79 &&
        i + 1 < rawLines.length &&
        rawLines[i + 1].length > 0 &&
        !headerStartRegex.test(rawLines[i + 1])
      ) {
        i++;
        current += rawLines[i];
      }
      unwrapped.push(current);
      i++;
    }
    return unwrapped;
  }

  /**
   * Limpa códigos de fonte internos do dump de caixa do TeX para leitura humana.
   */
  cleanTexBoxDump(rawLine) {
    if (!rawLine) return null;
    const cleaned = rawLine
      .replace(/\[\]/g, '')
      .replace(/\\(?:T1|OT1|OML|OMS|OMX|TS1)\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[0-9.]+(?:\s*\([^)]*\))?\s*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned.length > 0 ? cleaned.slice(0, 110) : null;
  }

  /**
   * Rastreia a pilha real de parênteses '(' e ')' no main.log (após unwrapping de 79 colunas)
   * para mapear Overfull/Underfull \hbox e Float too large ao arquivo .tex ou main.lot/main.lof.
   */
  parseLogLayoutEvents(logContent) {
    const rawLines = logContent.split(/\r?\n/);
    const lines = this.unwrapTexLogLines(rawLines);
    const flsInputs = this.loadFlsInputSet();

    // Pilha unificada de parênteses: cada '(' empilha { isFile, filePath? }; cada ')' desempilha 1.
    // Assim parênteses de texto como (badness 10000) ou (babel) nunca corrompem o arquivo ativo.
    const parenStack = [];
    const overfullHboxes = [];
    const underfullHboxes = [];
    const floatTooLarge = [];

    const fileExtRegex = /\.(?:tex|lot|lof|loq|toc|cls|sty|aux|bbl|fd|def|cfg|lbx|ldf|clo|trsl|ini|mkii)$/i;
    const overfullRegex = /Overfull \\hbox \(([0-9.]+pt too wide)\) in (?:paragraph|alignment) at lines? (\d+)(?:--(\d+))?/;
    const underfullRegex = /Underfull \\hbox \(badness (10000)\) in (?:paragraph|alignment) at lines? (\d+)(?:--(\d+))?/;
    const floatLargeRegex = /Float too large for page by ([0-9.]+pt) on input line (\d+)/;

    const getActiveProjectFile = () => {
      for (let j = parenStack.length - 1; j >= 0; j--) {
        const node = parenStack[j];
        if (!node.isFile) continue;
        const fp = node.filePath;
        if (/(?:MiKTeX|texlive|texmf)/i.test(fp)) continue;
        if (/\.(?:tex|lot|lof|loq|toc)$/i.test(fp)) return fp;
      }
      return null;
    };

    const resolveLocation = (activeFile, startLine, endLine, nextLogLine) => {
      const logSnippet = this.cleanTexBoxDump(nextLogLine);

      if (!activeFile) {
        return {
          file: null,
          listSource: null,
          element: null,
          lines: `${startLine}-${endLine}`,
          snippet: logSnippet,
          suggestion: null
        };
      }

      const norm = activeFile.replace(/\\/g, '/').replace(/^\.\//, '');
      const base = path.basename(norm).toLowerCase();

      // Caso 1: Estouro na Lista de Tabelas (main.lot), Lista de Figuras (main.lof) ou Lista de Quadros (main.loq)
      if (base === 'main.lot' || base === 'main.lof' || base === 'main.loq') {
        const listKind = base === 'main.lot' ? 'lot' : (base === 'main.loq' ? 'loq' : 'lof');
        const resolved = this.layoutInspector.resolveListEntry(listKind, startLine);
        if (resolved) {
          const texLoc = resolved.sourceFile
            ? `${resolved.sourceFile}:${resolved.captionLine || resolved.declLine}`
            : null;
          return {
            file: resolved.sourceFile || `src/build/${base}`,
            sourceLine: resolved.captionLine || resolved.declLine || startLine,
            listSource: `${base}:${startLine}`,
            element: `${resolved.type} ${resolved.number}`,
            pdfPage: resolved.page,
            lines: `${startLine}-${endLine}`,
            snippet: logSnippet || resolved.title.slice(0, 100),
            suggestion: texLoc
              ? `Use \\caption[Título curto sem código/fórmula]{Título completo} em ${texLoc} para evitar corte do número da página na lista.`
              : 'Use \\caption[Título curto sem código/fórmula]{Título completo} para evitar corte na lista.'
          };
        }
        return {
          file: `src/build/${base}`,
          listSource: `${base}:${startLine}`,
          element: listKind === 'lot' ? 'Lista de Tabelas' : (listKind === 'loq' ? 'Lista de Quadros' : 'Lista de Figuras'),
          lines: `${startLine}-${endLine}`,
          snippet: logSnippet,
          suggestion: 'Use \\caption[Título curto]{Título completo} na tabela/figura/quadro correspondente.'
        };
      }

      // Caso 2: Arquivo .tex do projeto (capítulo, apêndice, anexo, main.tex, pre-textuais.tex)
      let fullCandidate = path.isAbsolute(norm) ? norm : path.join(this.srcDir, norm);
      if (!fs.existsSync(fullCandidate)) {
        fullCandidate = path.join(this.rootDir, norm);
      }

      let relFile = norm;
      let texSnippet = null;
      if (fs.existsSync(fullCandidate)) {
        relFile = path.relative(this.rootDir, fullCandidate).replace(/\\/g, '/');
        try {
          const fLines = fs.readFileSync(fullCandidate, 'utf-8').split(/\r?\n/);
          const chunk = fLines
            .slice(Math.max(0, startLine - 1), endLine)
            .map(l => l.trim())
            .filter(Boolean);
          if (chunk.length > 0) {
            texSnippet = chunk.join(' ').slice(0, 110);
          }
        } catch (e) {}
      }

      return {
        file: relFile,
        sourceLine: startLine,
        listSource: null,
        element: null,
        lines: `${startLine}-${endLine}`,
        snippet: logSnippet || texSnippet,
        texSnippet,
        suggestion: null
      };
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1. Checa diagnósticos de caixa/flutuador na linha atual antes/com o estado corrente da pilha
      const ohMatch = line.match(overfullRegex);
      if (ohMatch) {
        const overflow = ohMatch[1];
        const startLine = parseInt(ohMatch[2], 10);
        const endLine = parseInt(ohMatch[3] || ohMatch[2], 10);
        const activeFile = getActiveProjectFile();
        const nextLine = (i + 1 < lines.length) ? lines[i + 1] : '';
        const loc = resolveLocation(activeFile, startLine, endLine, nextLine);

        overfullHboxes.push({
          ...loc,
          overflow,
          description: loc.element
            ? `${loc.element} (${loc.listSource}${loc.file && loc.sourceLine ? ` -> ${loc.file}:${loc.sourceLine}` : ''}) transbordou a margem em ${overflow}.`
            : (loc.file
              ? `Texto transbordou a margem direita em ${overflow} em ${loc.file}:${startLine}-${endLine}.`
              : `Texto transbordou a margem direita em ${overflow} (linhas ${startLine} a ${endLine}).`)
        });
      }

      const uhMatch = line.match(underfullRegex);
      if (uhMatch) {
        const startLine = parseInt(uhMatch[2], 10);
        const endLine = parseInt(uhMatch[3] || uhMatch[2], 10);
        const activeFile = getActiveProjectFile();
        const nextLine = (i + 1 < lines.length) ? lines[i + 1] : '';
        const loc = resolveLocation(activeFile, startLine, endLine, nextLine);

        underfullHboxes.push({
          ...loc,
          badness: 10000,
          description: loc.file
            ? `Espaçamento horizontal muito esticado (badness 10000) em ${loc.file}:${startLine}-${endLine}.`
            : `Espaçamento horizontal muito esticado (badness 10000) nas linhas ${startLine}-${endLine}.`
        });
      }

      const flMatch = line.match(floatLargeRegex);
      if (flMatch) {
        const overflow = flMatch[1];
        const lineNum = parseInt(flMatch[2], 10);
        const activeFile = getActiveProjectFile();
        const loc = resolveLocation(activeFile, lineNum, lineNum, '');
        floatTooLarge.push({
          file: loc.file,
          line: lineNum,
          overflow,
          detail: loc.file
            ? `Elemento flutuante excede a altura útil da página por ${overflow} em ${loc.file}:${lineNum}.`
            : `Elemento flutuante excede a altura útil da página por ${overflow} (linha ${lineNum}).`
        });
      }

      // 2. Atualiza a pilha de parênteses caractere por caractere
      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        if (ch === '(') {
          // Extrai o token logo após '(' até espaço, ')', '[' ou fim de linha
          const rest = line.slice(c + 1);
          const tokenMatch = rest.match(/^"([^"]+)"|^([^\s()\[\]]+)/);
          const candidate = tokenMatch ? (tokenMatch[1] || tokenMatch[2] || '').replace(/\\/g, '/') : '';
          const normCand = candidate.replace(/^\.\//, '');
          const isFile =
            candidate.length > 0 &&
            (flsInputs.has(candidate) ||
              flsInputs.has(normCand) ||
              fileExtRegex.test(candidate));

          if (isFile) {
            parenStack.push({ isFile: true, filePath: candidate });
          } else {
            parenStack.push({ isFile: false });
          }
        } else if (ch === ')') {
          if (parenStack.length > 0) parenStack.pop();
        }
      }
    }

    return { overfullHboxes, underfullHboxes, floatTooLarge };
  }

  checkBuildLog() {
    const logFile = this.layoutInspector.resolveBuildArtifact('main.log');
    const blgFile = this.layoutInspector.resolveBuildArtifact('main.blg');
    const pdfFile = this.layoutInspector.resolveBuildArtifact('main.pdf');
    const runXmlFile = this.layoutInspector.resolveBuildArtifact('main.run.xml');

    if (!logFile) {
      this.report.buildDiagnostics.hasBuildFiles = false;
      return;
    }
    this.report.buildDiagnostics.hasBuildFiles = true;

    if (pdfFile && fs.existsSync(pdfFile)) {
      try {
        this.report.summary.pdfSizeBytes = fs.statSync(pdfFile).size;
      } catch (e) {}
    }

    // Verifica arquivos residuais *-SAVE-ERROR em src/build/
    if (fs.existsSync(this.buildDir)) {
      try {
        const saveErrors = fs.readdirSync(this.buildDir).filter(f => f.endsWith('-SAVE-ERROR'));
        if (saveErrors.length > 0) {
          this.report.buildDiagnostics.saveErrorFiles = saveErrors;
          this.bumpWarning();
        }
      } catch (e) {}
    }

    // Verifica convergência em main.run.xml (biblatex/logreq)
    if (runXmlFile && fs.existsSync(runXmlFile)) {
      try {
        const xml = fs.readFileSync(runXmlFile, 'utf-8');
        if (/active="1"/.test(xml)) {
          this.report.buildDiagnostics.buildConverged = false;
          this.bumpWarning();
        }
      } catch (e) {}
    }

    // Lê main.log em latin1 para preservar acentos T1 sem gerar caracteres corrompidos
    const logContent = fs.readFileSync(logFile, 'latin1');

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
        this.bumpError();
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
      this.report.buildDiagnostics.missingReferences.push({ label: key, pages: [...new Set(pages)] });
      this.bumpError();
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
      this.report.buildDiagnostics.missingCitations.push({ citationKey: key, pages: [...new Set(pages)] });
      this.bumpError();
    }

    // 5. Espaçamento vertical (Underfull \vbox / Overfull \vbox)
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
      this.report.buildDiagnostics.layoutIssues.underfullVbox.push({
        page,
        badness,
        severity: badness >= 10000 ? 'ALTO' : 'MEDIO',
        description: `Espaço em branco vertical excessivo na página ${page} (badness ${badness}). Geralmente causado por tabelas/figuras deslocadas ou quebras forçadas.`
      });
      this.bumpWarning();
    }

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
      this.bumpWarning();
    }

    // 6. Overfull/Underfull \hbox e Float too large mapeados via File Stack Parser
    const parsedEvents = this.parseLogLayoutEvents(logContent);
    for (const oh of parsedEvents.overfullHboxes) {
      this.report.buildDiagnostics.layoutIssues.overfullHbox.push(oh);
      this.bumpWarning();
    }
    for (const uh of parsedEvents.underfullHboxes) {
      this.report.buildDiagnostics.layoutIssues.underfullHbox.push(uh);
      this.report.summary.suggestionsCount++;
    }
    for (const fl of parsedEvents.floatTooLarge) {
      this.report.buildDiagnostics.layoutIssues.floatWarnings.push(fl);
      this.bumpWarning();
    }

    if (/LaTeX Warning: `!h' float specifier changed to `!ht'/g.test(logContent)) {
      this.report.buildDiagnostics.layoutIssues.floatWarnings.push({
        detail: "Especificador '[!h]' foi alterado automaticamente para '[!ht]' pelo LaTeX. Prefira '[!htbp]'."
      });
      this.report.summary.suggestionsCount++;
    }

    // 7. Avisos de inclusão de PDF versão > 1.5
    const unwrappedLog = this.unwrapTexLogLines(lines).join('\n');
    const pdfIncRegex = /pdfTeX warning: pdflatex \(file ([^)]+)\): PDF inclusion: found PDF version <([^>]+)>, but at most version <([^>]+)> allowed/g;
    let piMatch;
    while ((piMatch = pdfIncRegex.exec(unwrappedLog)) !== null) {
      this.report.buildDiagnostics.pdfInclusionWarnings.push({
        file: piMatch[1].trim(),
        foundVersion: piMatch[2],
        maxAllowed: piMatch[3],
        suggestion: "Adicione '\\pdfminorversion=7' em src/config.tex."
      });
      this.report.summary.suggestionsCount++;
    }

    // 8. Avisos conhecidos do pdfTeX
    const duplicateDestRegex = /pdfTeX warning \(ext4\): destination with the same identifier \(name\{([^}]+)\}\) has been already used/g;
    let dupMatch;
    const dupNames = new Set();
    while ((dupMatch = duplicateDestRegex.exec(unwrappedLog)) !== null) {
      dupNames.add(dupMatch[1]);
    }
    if (dupNames.size > 0) {
      this.report.buildDiagnostics.generalWarnings.push(
        `Hiperlinks com identificadores duplicados ignorados pelo pdfTeX: ${Array.from(dupNames).slice(0, 3).join(', ')}${dupNames.size > 3 ? '...' : ''}`
      );
      this.report.summary.suggestionsCount++;
    }

    // 9. Auditoria do Biber (.blg)
    if (blgFile && fs.existsSync(blgFile)) {
      const blgContent = fs.readFileSync(blgFile, 'utf-8');
      const biberWarnRegex = /> WARN - (.*)/g;
      let bWarnMatch;
      while ((bWarnMatch = biberWarnRegex.exec(blgContent)) !== null) {
        this.report.buildDiagnostics.biberWarnings.push(bWarnMatch[1].trim());
        this.bumpWarning();
      }

      const biberErrRegex = /> ERROR - (.*)/g;
      let bErrMatch;
      while ((bErrMatch = biberErrRegex.exec(blgContent)) !== null) {
        this.report.buildDiagnostics.biberWarnings.push(`ERRO BIBER: ${bErrMatch[1].trim()}`);
        this.bumpError();
      }
    }
  }

  checkLayoutAndFloats() {
    // 1. Preâmbulo (src/config.tex)
    const pIssues = this.layoutInspector.inspectPreamble();
    this.report.layoutAudit.preambleIssues = pIssues;
    pIssues.forEach(iss => {
      if (iss.severity === 'ERROR') this.bumpError();
      else if (iss.severity === 'WARNING') this.bumpWarning();
      else this.report.summary.suggestionsCount++;
    });

    // 2. Proporções geométricas de figuras PDF em src/figuras/
    const fIssues = this.layoutInspector.inspectFigures();
    this.report.layoutAudit.figureAspectIssues = fIssues;
    fIssues.forEach(iss => {
      if (iss.severity === 'WARNING') this.bumpWarning();
      else this.report.summary.suggestionsCount++;
    });

    // 3. Flutuadores (main.toc + main.lot + main.lof + main.aux vs .tex)
    const flRes = this.layoutInspector.inspectFloats();
    this.report.layoutAudit.hasAux = flRes.hasAux;
    this.report.layoutAudit.floatDrifts = flRes.drifts;
    this.report.layoutAudit.floatCongestions = flRes.congestions;
    this.report.layoutAudit.specifierIssues = flRes.specifierIssues;
    this.report.layoutAudit.floatsSummary = flRes.floats.map(fl => ({
      label: fl.label,
      numero: fl.number,
      tipo: fl.type,
      pagina: fl.page,
      arquivo: fl.sourceFile,
      linha: fl.declLine,
      secaoOrigem: fl.sectionTitle || 'Geral',
      especificador: fl.specifier || ''
    }));

    flRes.drifts.forEach(d => {
      if (d.severity === 'ERROR') this.bumpError();
      else this.bumpWarning();
    });

    flRes.congestions.forEach(() => {
      this.report.summary.suggestionsCount++;
    });

    flRes.specifierIssues.forEach(() => {
      this.report.summary.suggestionsCount++;
    });
  }

  checkPdfGeometry() {
    if (this.options.noGeometry) return;

    const pdfFile = this.layoutInspector.resolveBuildArtifact('main.pdf');
    if (!pdfFile || !fs.existsSync(pdfFile)) return;

    // Descobre a página inicial do Capítulo 1 em main.toc para isolar corpo textual de pré-textuais
    let firstTextualPage = 1;
    const tocFile = this.layoutInspector.resolveBuildArtifact('main.toc');
    if (tocFile && fs.existsSync(tocFile)) {
      try {
        const tocContent = fs.readFileSync(tocFile, 'utf-8');
        const chapMatch = tocContent.match(/\\contentsline\s*\{chapter\}\{\\chapternumberline\s*\{1\}[\s\S]*?\}\{(\d+)\}/);
        if (chapMatch) {
          firstTextualPage = parseInt(chapMatch[1], 10);
        }
      } catch (e) {}
    }

    const geo = inspectPdfGeometry(pdfFile, {
      firstTextualPage,
      checkInk: !!this.options.ink
    });
    this.report.geometryAudit = geo;

    if (!geo.available) return;

    geo.marginOverflows.forEach(item => {
      if (item.severity === 'ERROR') this.bumpError();
      else this.bumpWarning();
    });
    geo.bottomOverflows.forEach(() => {
      this.bumpWarning();
    });
    geo.splitParagraphs.forEach(() => {
      this.bumpWarning();
    });
    (geo.hyphenatedPageBreaks || []).forEach(() => {
      this.report.summary.suggestionsCount++;
    });
    geo.inkOverflows.forEach(item => {
      if (item.severity === 'ERROR') this.bumpError();
      else this.bumpWarning();
    });
  }

  getTexFiles() {
    const searchDirs = ['capitulos', 'apendices', 'anexos'];
    const files = [];

    for (const dirName of searchDirs) {
      const targetDir = path.join(this.srcDir, dirName);
      if (fs.existsSync(targetDir)) {
        for (const item of fs.readdirSync(targetDir)) {
          if (item.endsWith('.tex')) files.push(path.join(targetDir, item));
        }
      }
    }

    const mainTex = path.join(this.srcDir, 'main.tex');
    if (fs.existsSync(mainTex)) files.push(mainTex);

    return files.sort();
  }

  /**
   * Extrai o argumento principal {...} de \caption{...} respeitando chaves aninhadas.
   */
  extractCaptionInfo(body) {
    const m = body.match(/\\caption(\[[^\]]*\])?\s*\{/);
    if (!m) return null;
    const hasShortTitle = Boolean(m[1]);
    let idx = m.index + m[0].length;
    let depth = 1;
    let content = '';
    while (idx < body.length && depth > 0) {
      const ch = body[idx];
      if (ch === '{' && body[idx - 1] !== '\\') depth++;
      else if (ch === '}' && body[idx - 1] !== '\\') depth--;
      if (depth > 0) content += ch;
      idx++;
    }
    return { hasShortTitle, text: content };
  }

  checkTexFiles() {
    const texFiles = this.getTexFiles();
    if (texFiles.length === 0) return;

    for (const filePath of texFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relPath = path.relative(this.rootDir, filePath).replace(/\\/g, '/');

        // A. Auditoria de Ambientes (figure, table e quadro)
        const envPattern = /\\begin\{(figure|table|quadro)\}([\s\S]*?)\\end\{\1\}/g;
        let match;
        while ((match = envPattern.exec(content)) !== null) {
          const envType = match[1];
          const body = match[2];
          const nomeEnv = envType === 'figure' ? 'Figura' : (envType === 'quadro' ? 'Quadro' : 'Tabela');
          const lineNum = content.slice(0, match.index).split('\n').length;

          const ignoreAll = /%\s*check-ignore(?::\s*all)?\b/i.test(body);
          const ignoreCaption = ignoreAll || /%\s*check-ignore:\s*no-caption/i.test(body);
          const ignoreShortCaption = ignoreAll || /%\s*check-ignore:\s*short-caption/i.test(body);
          const ignoreFonte = ignoreAll || /%\s*check-ignore:\s*no-fonte/i.test(body);
          const ignoreLabel = ignoreAll || /%\s*check-ignore:\s*no-label/i.test(body);

          const captionInfo = this.extractCaptionInfo(body);
          const hasCaption = Boolean(captionInfo);
          const hasFonteOficial = /\\fonte\{/.test(body);
          const hasLegend = /\\legend\{/.test(body);
          const hasLabel = /\\label\{/.test(body);

          if (!hasCaption && !ignoreCaption) {
            this.report.textAudit.environmentIssues.push({
              file: relPath,
              line: lineNum,
              type: 'ERROR',
              message: `${nomeEnv} sem legenda (\\caption{...}). Exigido pela ABNT.`
            });
            this.bumpError();
          } else if (hasCaption && !captionInfo.hasShortTitle && !ignoreShortCaption) {
            // Alerta preventivo: legenda sem versão curta [...] contendo código/fórmula inquebrável ou muito longa
            const hasUnbreakable = /\\texttt\{|\\url\{|\$[^$]{10,}\$/.test(captionInfo.text);
            const isVeryLong = captionInfo.text.length > 120;
            if (hasUnbreakable || isVeryLong) {
              this.report.textAudit.environmentIssues.push({
                file: relPath,
                line: lineNum,
                type: 'SUGGESTION',
                message: `Legenda de ${nomeEnv} contém trecho inquebrável (\\texttt/fórmula) ou é extensa sem título curto. Prefira \\caption[Título curto para a lista]{Título completo} para evitar estouro na lista.`
              });
              this.report.summary.suggestionsCount++;
            }
          }

          if (!hasFonteOficial && !ignoreFonte) {
            if (hasLegend) {
              this.report.textAudit.environmentIssues.push({
                file: relPath,
                line: lineNum,
                type: 'SUGGESTION',
                message: `${nomeEnv} utiliza \\legend{...}. O padrão oficial do IFS é \\fonte{...}. Considere padronizar.`
              });
              this.report.summary.suggestionsCount++;
            } else {
              this.report.textAudit.environmentIssues.push({
                file: relPath,
                line: lineNum,
                type: 'WARNING',
                message: `${nomeEnv} sem indicação de fonte (\\fonte{...}). ABNT exige indicação de fonte em todas as ilustrações.`
              });
              this.bumpWarning();
            }
          }

          if (!hasLabel && !ignoreLabel) {
            this.report.textAudit.environmentIssues.push({
              file: relPath,
              line: lineNum,
              type: 'WARNING',
              message: `${nomeEnv} sem rótulo de referência cruzada (\\label{...}).`
            });
            this.bumpWarning();
          }
        }

        // B. Palavras duplicadas consecutivas (lookaround Unicode estrito)
        const lines = content.split(/\r?\n/);
        const dupPattern = /(?<![a-zA-ZÀ-ÿ])([a-zA-ZÀ-ÿ]{2,})\s+\1(?![a-zA-ZÀ-ÿ])/gi;
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('%')) return;
          if (/%\s*check-ignore(?::\s*(?:all|repeat|repeticao))?/i.test(line)) return;

          const codePart = line.split('%')[0];
          let dMatch;
          while ((dMatch = dupPattern.exec(codePart)) !== null) {
            this.report.textAudit.repeatedWords.push({
              file: relPath,
              line: index + 1,
              word: dMatch[0]
            });
            this.bumpWarning();
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
          if (/%\s*check-ignore(?::\s*(?:all|tone|voz))?/i.test(line)) return;
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

        // D. Travessões proibidos (--- ou --) no corpo do texto
        const isContentFile = relPath.startsWith('src/capitulos/') || relPath.startsWith('src/apendices/') || relPath.startsWith('src/anexos/');
        if (isContentFile) {
          lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('%') || line.includes('\\captiondelim') || line.includes('\\hypersetup')) return;
            if (/%\s*check-ignore(?::\s*(?:all|dash|travessao))?/i.test(line)) return;
            const codePart = line.split('%')[0];

            const cleanLine = codePart
              .replace(/\\cite[a-zA-Z]*(\[[^\]]*\])?\{[^}]*\}/g, ' ')
              .replace(/\b\d+\s*--\s*\d+\b/g, ' ')
              .replace(/\\caption(?:\[[^\]]*\])?\{[^}]*\}/g, ' ')
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

        // E. Termos rebuscados/arcaicos
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
          if (/%\s*check-ignore(?::\s*(?:all|archaic|termo))?/i.test(line)) return;
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

        // F. Parágrafos excessivamente extensos (> 250 palavras)
        if (isContentFile) {
          const rawParagraphs = content.split(/\r?\n\s*\r?\n/);
          let currentLineTracker = 1;

          rawParagraphs.forEach((par) => {
            const parLines = par.split(/\r?\n/);
            const lineCount = parLines.length;
            const startLine = currentLineTracker;
            currentLineTracker += lineCount + 1;

            if (/%\s*check-ignore(?::\s*(?:all|dense|paragrafo))?/i.test(par)) return;

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
        this.bumpError();
      }
    }

    // Auditoria estática prévia de citações (cruza chaves dos .tex com src/referencias.bib)
    this.checkStaticCitations();

    // Contagem inteligente de palavras textuais e estimativa de tempo de leitura
    const wordStats = countProjectWords(this.rootDir);
    this.report.wordStats = wordStats;
    this.report.summary.textualWords = wordStats.textualWords;
    this.report.summary.readingTimeMinutes = wordStats.readingTimeMinutes;
    this.report.summary.readingTimeFormatted = wordStats.readingTimeFormatted;
  }

  checkStaticCitations() {
    const bibFile = path.join(this.srcDir, 'referencias.bib');
    if (!fs.existsSync(bibFile)) return;

    try {
      const bibContent = fs.readFileSync(bibFile, 'utf-8');
      const knownKeys = new Set();
      const bibKeyRegex = /@\w+\s*\{\s*([^,\s]+)/g;
      let bkMatch;
      while ((bkMatch = bibKeyRegex.exec(bibContent)) !== null) {
        knownKeys.add(bkMatch[1].trim());
      }

      const texFiles = this.getTexFiles();
      const citeRegex = /\\(?:cite|citeonline|textcite|parencite|citep|citet)\*?(?:\[[^\]]*\])?\{([^}]+)\}/g;

      for (const filePath of texFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relPath = path.relative(this.rootDir, filePath).replace(/\\/g, '/');
        const lines = content.split(/\r?\n/);

        lines.forEach((line, idx) => {
          if (line.trim().startsWith('%')) return;
          const codePart = line.split('%')[0];
          let cMatch;
          while ((cMatch = citeRegex.exec(codePart)) !== null) {
            const rawKeys = cMatch[1].split(',').map(k => k.trim()).filter(Boolean);
            for (const key of rawKeys) {
              if (!knownKeys.has(key)) {
                const alreadyReported = this.report.buildDiagnostics.missingCitations.some(c => c.citationKey === key);
                if (!alreadyReported) {
                  this.report.buildDiagnostics.missingCitations.push({
                    citationKey: key,
                    pages: [`${relPath}:${idx + 1}`]
                  });
                  this.bumpError();
                }
              }
            }
          }
        });
      }
    } catch (e) {}
  }

  run() {
    const doBuild = !this.options.textOnly;
    const doText = !this.options.buildOnly;

    if (doBuild) {
      this.ensureFreshBuild();
      // Roda LayoutInspector primeiro para popular o mapa de main.lot / main.lof -> .tex
      this.checkLayoutAndFloats();
      this.checkBuildLog();
      this.checkPdfGeometry();
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

    if (doBuild) {
      this.printSection('1. Diagnóstico do Build & Compilação');
      const b = this.report.buildDiagnostics;

      if (!b.hasBuildFiles) {
        console.log(`  ${YELLOW}[AVISO]${RESET} Arquivos de build não encontrados em src/build/.`);
        console.log(`         Execute 'make build' ou '.\\make.bat build' antes de rodar o check.`);
      } else {
        if (this.report.summary.pages) {
          const sizeKb = this.report.summary.pdfSizeBytes ? ` (${Math.round(this.report.summary.pdfSizeBytes / 1024)} KB)` : '';
          const autoTag = b.autoBuilt ? ` ${GRAY}[auto-build]${RESET}` : '';
          console.log(`  ${GREEN}[OK]${RESET} PDF compilado com sucesso: ${BOLD}${this.report.summary.pages} páginas${RESET}${sizeKb}.${autoTag}`);
        }

        if (!b.buildConverged) {
          console.log(`  ${YELLOW}[AVISO BUILD]${RESET} Compilação pode não ter convergido completamente (main.run.xml ativo). Execute 'make build'.`);
        }

        if (b.saveErrorFiles.length > 0) {
          console.log(`  ${YELLOW}[AVISO BUILD]${RESET} Arquivo(s) residual(is) de falha anterior em src/build/: ${b.saveErrorFiles.join(', ')}. Execute 'make clean'.`);
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
            console.log(`    • \\cite{${cite.citationKey}} localizada em: ${cite.pages.join(', ')}`);
          });
        }

        if (b.layoutIssues.underfullVbox.length > 0) {
          console.log(`  ${YELLOW}[LAYOUT - ESPAÇO EXCESSIVO]${RESET} Páginas com vazios/espaçamento vertical anormal:`);
          b.layoutIssues.underfullVbox.forEach(uv => {
            console.log(`    • Página ${BOLD}${uv.page}${RESET}: ${uv.description}`);
          });
        }

        if (b.layoutIssues.overfullVbox.length > 0) {
          console.log(`  ${YELLOW}[LAYOUT - ESTOURO INFERIOR]${RESET} Conteúdo ultrapassando a margem inferior:`);
          b.layoutIssues.overfullVbox.forEach(ov => {
            console.log(`    • Página ${BOLD}${ov.page}${RESET}: ${ov.description}`);
          });
        }

        if (b.layoutIssues.overfullHbox.length > 0) {
          console.log(`  ${YELLOW}[LAYOUT - VAZAMENTO DE MARGEM]${RESET} Elementos ultrapassando a margem direita:`);
          b.layoutIssues.overfullHbox.slice(0, 8).forEach(oh => {
            const loc = oh.element
              ? `${BOLD}${oh.element}${RESET} (${oh.listSource}${oh.file && oh.sourceLine ? ` ➔ ${BOLD}${oh.file}:${oh.sourceLine}${RESET}` : ''})`
              : (oh.file ? `${BOLD}${oh.file}:${oh.lines}${RESET}` : `Linhas ${oh.lines}`);
            console.log(`    • ${loc} — ultrapassa margem em ${oh.overflow}`);
            if (oh.snippet) console.log(`      ${CYAN}Trecho:${RESET} "${oh.snippet}"`);
            if (oh.suggestion) console.log(`      ${GRAY}➔ Sugestão: ${oh.suggestion}${RESET}`);
          });
          if (b.layoutIssues.overfullHbox.length > 8) {
            console.log(`    ... e mais ${b.layoutIssues.overfullHbox.length - 8} ocorrência(s).`);
          }
        }

        if (b.layoutIssues.underfullHbox.length > 0) {
          console.log(`  ${CYAN}[SUGESTÃO - ESPAÇAMENTO HORIZONTAL]${RESET} ${b.layoutIssues.underfullHbox.length} linha(s) muito esticada(s) (Underfull \\hbox badness 10000):`);
          b.layoutIssues.underfullHbox.slice(0, 4).forEach(uh => {
            const loc = uh.file ? `${uh.file}:${uh.lines}` : `Linhas ${uh.lines}`;
            console.log(`    • ${loc}${uh.snippet ? ` — "${uh.snippet}"` : ''}`);
          });
          if (b.layoutIssues.underfullHbox.length > 4) {
            console.log(`    ... e mais ${b.layoutIssues.underfullHbox.length - 4} ocorrência(s).`);
          }
        }

        if (b.layoutIssues.floatWarnings.length > 0) {
          console.log(`  ${YELLOW}[LAYOUT - FLUTUADORES]${RESET} Ajustes em tabelas/figuras:`);
          b.layoutIssues.floatWarnings.forEach(fw => console.log(`    • ${fw.detail}`));
        }

        if (b.pdfInclusionWarnings.length > 0) {
          console.log(`  ${CYAN}[SUGESTÃO - PDF 1.7]${RESET} ${b.pdfInclusionWarnings.length} figura(s) em versão PDF superior ao limite atual do pdflatex.`);
          console.log(`    ➔ Sugestão: ${b.pdfInclusionWarnings[0].suggestion}`);
        }

        if (b.biberWarnings.length > 0) {
          console.log(`  ${YELLOW}[BIBLIOGRAFIA - BIBER]${RESET} Avisos no processamento das referências:`);
          b.biberWarnings.forEach(bw => console.log(`    • ${bw}`));
        }

        if (b.generalWarnings.length > 0) {
          b.generalWarnings.forEach(gw => console.log(`  ${CYAN}[NOTA]${RESET} ${gw}`));
        }

        if (
          b.compilationErrors.length === 0 &&
          b.missingReferences.length === 0 &&
          b.missingCitations.length === 0 &&
          b.layoutIssues.underfullVbox.length === 0 &&
          b.layoutIssues.overfullVbox.length === 0 &&
          b.layoutIssues.overfullHbox.length === 0 &&
          b.biberWarnings.length === 0 &&
          b.buildConverged &&
          b.saveErrorFiles.length === 0
        ) {
          console.log(`  ${GREEN}[OK]${RESET} Compilação, margens, referências e citações limpas, sem anomalias detectadas.`);
        }
      }

      // Seção 2: Auditoria de Flutuadores & Diagramação
      this.printSection('2. Auditoria de Flutuadores & Diagramação do PDF');
      const la = this.report.layoutAudit;

      if (!la.hasAux) {
        console.log(`  ${YELLOW}[AVISO]${RESET} Arquivo src/build/main.aux não encontrado para mapear flutuadores.`);
      } else {
        la.preambleIssues.forEach(pi => {
          let tag = `${CYAN}[SUGESTÃO CONFIG]${RESET}`;
          if (pi.severity === 'ERROR') tag = `${RED}[ERRO CONFIG]${RESET}`;
          else if (pi.severity === 'WARNING') tag = `${YELLOW}[AVISO CONFIG]${RESET}`;
          console.log(`  ${tag} ${pi.message}`);
          if (pi.suggestion) console.log(`    ➔ Sugestão: ${pi.suggestion}`);
        });

        la.figureAspectIssues.forEach(fa => {
          const tag = fa.severity === 'WARNING' ? `${YELLOW}[PROPORÇÃO FIGURA]${RESET}` : `${CYAN}[SUGESTÃO FIGURA]${RESET}`;
          console.log(`  ${tag} ${fa.file}: ${fa.message}`);
          if (fa.suggestion) console.log(`    ➔ Sugestão: ${fa.suggestion}`);
        });

        la.floatDrifts.forEach(fd => {
          const tag = fd.severity === 'ERROR' ? `${RED}[FLUTUADOR VAZADO]${RESET}` : `${YELLOW}[FLUTUADOR DESLOCADO]${RESET}`;
          console.log(`  ${tag} ${fd.message}`);
          if (fd.suggestion) console.log(`    ➔ Sugestão: ${fd.suggestion}`);
        });

        la.floatCongestions.forEach(fc => {
          console.log(`  ${CYAN}[CONGESTIONAMENTO]${RESET} ${fc.message}`);
        });

        if (this.options.showFloats && la.floatsSummary.length > 0) {
          console.log(`\n  ${BOLD}Catálogo de Flutuadores Mapeados no PDF (${la.floatsSummary.length} elementos):${RESET}`);
          console.log(`  ${'Pág.'.padEnd(6)} | ${'Tipo'.padEnd(8)} | ${'Nº'.padEnd(4)} | ${'Espec.'.padEnd(10)} | ${'Origem (.tex)'}`);
          console.log(`  ${'─'.repeat(6)}─┼─${'─'.repeat(8)}─┼─${'─'.repeat(4)}─┼─${'─'.repeat(10)}─┼─${'─'.repeat(35)}`);
          la.floatsSummary.forEach(fl => {
            const spec = fl.especificador ? `[${fl.especificador}]` : '(padrão)';
            const orig = fl.arquivo ? `${fl.arquivo}:${fl.linha}` : fl.secaoOrigem;
            console.log(`  ${String(fl.pagina).padEnd(6)} | ${fl.tipo.padEnd(8)} | ${String(fl.numero).padEnd(4)} | ${spec.padEnd(10)} | ${orig}`);
          });
          console.log('');
        }

        if (la.preambleIssues.length === 0 && la.figureAspectIssues.length === 0 && la.floatDrifts.length === 0) {
          console.log(`  ${GREEN}[OK]${RESET} Preâmbulo calibrado e todos os ${la.floatsSummary.length} flutuadores sincronizados com suas seções.`);
        }
      }

      // Seção 3: Auditoria Geométrica do PDF (Poppler / PyMuPDF — Progressive Enhancement)
      if (!this.options.noGeometry) {
        const g = this.report.geometryAudit;
        const engineLabel = g.engine ? ` (${g.engine})` : '';
        this.printSection(`3. Auditoria Geométrica do PDF${engineLabel}`);

        if (!g.available) {
          console.log(`  ${GRAY}[DICA]${RESET} ${g.hint || 'Auditoria geométrica não executada.'}`);
        } else {
          if (g.marginOverflows.length > 0) {
            console.log(`  ${YELLOW}[GEOMETRIA - MARGEM DIREITA]${RESET} ${g.marginOverflows.length} linha(s) ultrapassando fisicamente a margem ABNT (${g.rightLimitPt}pt):`);
            g.marginOverflows.slice(0, 8).forEach(ov => {
              const tag = ov.severity === 'ERROR' ? `${RED}[CORTE DE FOLHA]${RESET}` : `${YELLOW}[ESTOURO]${RESET}`;
              console.log(`    • ${tag} Pág. ${BOLD}${ov.page}${RESET} (+${ov.excessPt}pt, xMax=${ov.xMax}pt) — "${ov.snippet}"`);
            });
            if (g.marginOverflows.length > 8) {
              console.log(`    ... e mais ${g.marginOverflows.length - 8} ocorrência(s).`);
            }
          }

          if (g.bottomOverflows.length > 0) {
            console.log(`  ${YELLOW}[GEOMETRIA - MARGEM INFERIOR]${RESET} ${g.bottomOverflows.length} bloco(s) invadindo o rodapé ABNT:`);
            g.bottomOverflows.slice(0, 5).forEach(bo => {
              console.log(`    • Pág. ${BOLD}${bo.page}${RESET} (+${bo.excessPt}pt, yMax=${bo.yMax}pt) — "${bo.snippet}"`);
            });
          }

          if (g.splitParagraphs.length > 0) {
            console.log(`  ${YELLOW}[GEOMETRIA - FLUTUADOR CORTANDO TEXTO/LISTA]${RESET} ${g.splitParagraphs.length} ocorrência(s):`);
            g.splitParagraphs.forEach(sp => {
              console.log(`    • ${sp.message}`);
              console.log(`      ${GRAY}Antes:${RESET} "${sp.beforeSnippet}" | ${GRAY}Depois:${RESET} "${sp.afterSnippet}"`);
              console.log(`      ${GRAY}➔ Sugestão: ${sp.suggestion}${RESET}`);
            });
          }

          if ((g.hyphenatedPageBreaks || []).length > 0) {
            console.log(`  ${CYAN}[SUGESTÃO - HIFENIZAÇÃO EM QUEBRA DE PÁGINA]${RESET} ${g.hyphenatedPageBreaks.length} palavra(s) partida(s) entre páginas:`);
            g.hyphenatedPageBreaks.slice(0, 6).forEach(hb => {
              console.log(`    • ${hb.message}`);
            });
            if (g.hyphenatedPageBreaks.length > 6) {
              console.log(`    ... e mais ${g.hyphenatedPageBreaks.length - 6} ocorrência(s).`);
            }
            console.log(`    ${GRAY}➔ Sugestão: ${g.hyphenatedPageBreaks[0].suggestion}${RESET}`);
          }

          if (g.inkOverflows.length > 0) {
            console.log(`  ${YELLOW}[GEOMETRIA - TINTA/VETORES (${g.inkEngine})]${RESET} ${g.inkOverflows.length} página(s) com figura/borda fora da margem:`);
            g.inkOverflows.slice(0, 6).forEach(io => {
              console.log(`    • ${io.message}`);
            });
          }

          if (
            g.marginOverflows.length === 0 &&
            g.bottomOverflows.length === 0 &&
            g.splitParagraphs.length === 0 &&
            (g.hyphenatedPageBreaks || []).length === 0 &&
            g.inkOverflows.length === 0
          ) {
            const inkNote = g.inkEngine ? ` + tinta real (${g.inkEngine})` : '';
            console.log(`  ${GREEN}[OK]${RESET} ${g.pagesAnalyzed} páginas inspecionadas (xMax máx: ${g.maxXRightPt}pt / limite ABNT: ${g.rightLimitPt}pt${inkNote}). Nenhum corte de margem, hifenização em virada ou parágrafo partido.`);
          }
        }
      }
    }

    // Seção 4: Auditoria Textual ABNT
    if (doText) {
      const textSectionNum = doBuild ? (this.options.noGeometry ? '3' : '4') : '1';
      this.printSection(`${textSectionNum}. Auditoria ABNT e Redação Científica (.tex)`);
      const t = this.report.textAudit;

      // Se --text-only, mostra citações ausentes detectadas estaticamente aqui
      if (!doBuild && this.report.buildDiagnostics.missingCitations.length > 0) {
        console.log(`  ${RED}[ERRO]${RESET} Citações ausentes no arquivo referencias.bib (análise estática):`);
        this.report.buildDiagnostics.missingCitations.forEach(cite => {
          console.log(`    • \\cite{${cite.citationKey}} localizada em: ${cite.pages.join(', ')}`);
        });
      }

      if (t.environmentIssues.length > 0) {
        t.environmentIssues.forEach(item => {
          let tag = `${YELLOW}[AVISO ABNT]${RESET}`;
          if (item.type === 'ERROR') tag = `${RED}[ERRO ABNT]${RESET}`;
          if (item.type === 'SUGGESTION') tag = `${CYAN}[SUGESTÃO ABNT]${RESET}`;
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

      if (
        t.environmentIssues.length === 0 &&
        t.repeatedWords.length === 0 &&
        t.impersonalToneIssues.length === 0 &&
        t.prohibitedDashes.length === 0 &&
        t.archaicTermIssues.length === 0 &&
        t.denseParagraphIssues.length === 0
      ) {
        console.log(`  ${GREEN}[OK]${RESET} Figuras, tabelas e redação seguem integralmente o padrão ABNT e as diretrizes de estilo.`);
      }
    }

    // Painel de Resumo Final
    this.printSection('Resumo Geral');
    const s = this.report.summary;
    if (this.report.wordStats) {
      const ws = this.report.wordStats;
      const formattedWords = ws.textualWords.toLocaleString('pt-BR');
      const appNote = ws.appendixWords > 0 ? ` (+${ws.appendixWords.toLocaleString('pt-BR')} em apêndices/anexos)` : '';
      console.log(`  Extensão Textual:    ${BOLD}${formattedWords} palavras${RESET}${appNote} | Leitura: ${CYAN}${ws.readingTimeFormatted}${RESET}`);
    }
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
    noBuild: args.includes('--no-build'),
    noGeometry: args.includes('--no-geometry'),
    ink: args.includes('--ink'),
    buildOnly: args.includes('--build-only') || args.includes('-b'),
    textOnly: args.includes('--text-only') || args.includes('-t'),
    showFloats: args.includes('--floats') || args.includes('-f'),
    help: args.includes('--help') || args.includes('-h')
  };

  if (options.help) {
    console.log(`
Uso: node scripts/check.js [opções]

Opções:
  --json            Emite o relatório estruturado em formato JSON (ótimo para IAs e automação)
  --no-build        Audita o último log existente sem disparar auto-build
  --no-geometry     Pula a inspeção geométrica do PDF (Poppler/PyMuPDF)
  --ink             Inclui auditoria de tinta real (figuras/bordas) via Ghostscript (mgs/gs)
  --floats, -f      Exibe o catálogo completo de flutuadores (tabelas e figuras) mapeados no PDF
  --build-only, -b  Executa apenas o diagnóstico de compilação, layout e flutuadores
  --text-only, -t   Executa apenas a auditoria ABNT nos arquivos .tex (sem compilar)
  --help, -h        Exibe esta mensagem de ajuda
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

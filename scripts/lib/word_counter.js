/**
 * word_counter.js - Contador Inteligente de Palavras Textuais e Tempo de Leitura para TCC em LaTeX.
 *
 * Desconsidera comandos LaTeX, comentários, blocos de código-fonte (lstlisting/verbatim),
 * labels e referências técnicas, preservando o texto científico real escrito pelo autor.
 * Compartilhado entre scripts/check.js e scripts/build_portal.js.
 */

const fs = require('fs');
const path = require('path');

const ACADEMIC_WORDS_PER_MINUTE = 180;

/**
 * Remove marcações técnicas do LaTeX preservando o texto visível ao leitor.
 */
function stripLatexMarkup(rawContent) {
  if (!rawContent) return '';

  // 1. Remove ambientes literais de código-fonte
  let text = rawContent.replace(/\\begin\{(lstlisting|verbatim|minted)\*?\}[\s\S]*?\\end\{\1\*?\}/g, ' ');

  // 2. Remove comentários de linha (preservando \% escapado)
  text = text
    .split(/\r?\n/)
    .map(line => line.replace(/(^|[^\\])%.*/, '$1'))
    .join('\n');

  // 3. Remove comandos estruturais/técnicos cujos argumentos não são texto corrido
  text = text
    .replace(/\\begin\{tabularx?\*?\}(?:\[[^\]]*\])?(?:\{[^}]*\})?\{[^}]*\}/g, ' ')
    .replace(/\\begin\{longtable\}(?:\[[^\]]*\])?\{[^}]*\}/g, ' ')
    .replace(/\\(?:begin|end)\{[^}]+\}(?:\[[^\]]*\])?/g, ' ')
    .replace(/\\(?:label|ref|autoref|pageref|cref|Cref|input|include|includegraphics|graphicspath|addbibresource|bibliographystyle|bibliography|usepackage|documentclass|hypersetup|lstset|pdfbookmark|vspace|hspace|setlength|addtolength|setcounter|counterwithout|renewcommand|newcommand|providecommand|pretocmd)\*?(?:\[[^\]]*\])?(?:\{[^}]*\})*/g, ' ')
    // Citações narrativas (\textcite / \citeonline) equivalem a ~2 palavras no texto ("Autor (2026)")
    .replace(/\\(?:textcite|citeonline)\*?(?:\[[^\]]*\])?\{[^}]*\}/g, ' Autor Ano ')
    // Citações entre parênteses não inflam a contagem autoral
    .replace(/\\(?:cite|parencite|citep|citet|footcite)\*?(?:\[[^\]]*\])?\{[^}]*\}/g, ' ')
    // Remove argumento opcional curto de \caption[curto]{longo} para não contar a legenda em dobro
    .replace(/\\caption\[[^\]]*\]/g, '\\caption')
    // Remove nomes de comandos restantes mantendo o conteúdo entre chaves (ex: \textbf{texto} -> texto)
    .replace(/\\[a-zA-Z@]+\*?/g, ' ')
    // Remove chaves, símbolos matemáticos soltos e separadores de tabela
    .replace(/[{}[\]$&~^_\\|]/g, ' ');

  return text;
}

/**
 * Conta palavras reais em uma string LaTeX.
 */
function countWordsInLatex(rawContent) {
  const clean = stripLatexMarkup(rawContent);
  const matches = clean.match(/[a-zA-ZÀ-ÿ0-9]+(?:[-'][a-zA-ZÀ-ÿ0-9]+)*/g);
  return matches ? matches.length : 0;
}

/**
 * Formata o tempo estimado de leitura de maneira amigável em pt-BR.
 */
function formatReadingTime(minutes) {
  if (!minutes || minutes <= 0) return '< 1 min';
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h}h ${String(m).padStart(2, '0')}min` : `~${h}h`;
}

/**
 * Calcula estatísticas completas de extensão textual do TCC.
 */
function countProjectWords(rootDir) {
  const srcDir = path.join(rootDir, 'src');
  const readDirStats = (subDir) => {
    const target = path.join(srcDir, subDir);
    const items = [];
    if (!fs.existsSync(target)) return items;
    const files = fs.readdirSync(target).filter(f => f.endsWith('.tex')).sort();
    for (const file of files) {
      const fullPath = path.join(target, file);
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const words = countWordsInLatex(content);
        items.push({
          file: `src/${subDir}/${file}`,
          name: file.replace(/\.tex$/, ''),
          words
        });
      } catch (e) {}
    }
    return items;
  };

  const byChapter = readDirStats('capitulos');
  const byAppendix = [
    ...readDirStats('apendices'),
    ...readDirStats('anexos')
  ];

  const textualWords = byChapter.reduce((acc, item) => acc + item.words, 0);
  const appendixWords = byAppendix.reduce((acc, item) => acc + item.words, 0);
  const totalWords = textualWords + appendixWords;
  const readingTimeMinutes = textualWords > 0
    ? Math.max(1, Math.round(textualWords / ACADEMIC_WORDS_PER_MINUTE))
    : 0;

  return {
    textualWords,
    appendixWords,
    totalWords,
    wordsPerMinute: ACADEMIC_WORDS_PER_MINUTE,
    readingTimeMinutes,
    readingTimeFormatted: formatReadingTime(readingTimeMinutes),
    byChapter,
    byAppendix
  };
}

module.exports = {
  ACADEMIC_WORDS_PER_MINUTE,
  stripLatexMarkup,
  countWordsInLatex,
  formatReadingTime,
  countProjectWords
};

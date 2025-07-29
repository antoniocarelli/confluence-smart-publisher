import MarkdownIt from 'markdown-it';

// Mapeamento de tipos e seus aliases
const ADMONITION_TYPES: { [key: string]: string } = {
  // Note
  'note': 'note',
  
  // Abstract
  'abstract': 'abstract',
  'summary': 'abstract',
  'tldr': 'abstract',
  
  // Info
  'info': 'info',
  'todo': 'info',
  
  // Tip
  'tip': 'tip',
  'hint': 'tip',
  'important': 'tip',
  
  // Success
  'success': 'success',
  'check': 'success',
  'done': 'success',
  
  // Question
  'question': 'question',
  'help': 'question',
  'faq': 'question',
  
  // Warning
  'warning': 'warning',
  'caution': 'warning',
  'attention': 'warning',
  
  // Failure
  'failure': 'failure',
  'fail': 'failure',
  'missing': 'failure',
  
  // Danger
  'danger': 'danger',
  'error': 'danger',
  
  // Bug
  'bug': 'bug',
  
  // Example
  'example': 'example',
  
  // Quote
  'quote': 'quote',
  'cite': 'quote'
};

// Títulos padrão para cada tipo
const DEFAULT_TITLES: { [key: string]: string } = {
  'note': 'Note',
  'abstract': 'Abstract',
  'info': 'Info',
  'tip': 'Tip',
  'success': 'Success',
  'question': 'Question',
  'warning': 'Warning',
  'failure': 'Failure',
  'danger': 'Danger',
  'bug': 'Bug',
  'example': 'Example',
  'quote': 'Quote'
};

/**
 * Parser personalizado para admonitions seguindo especificação Material for MkDocs
 * Suporta sintaxe: !!! tipo ["título"]
 * Com indentação obrigatória de 4 espaços para o conteúdo
 */
function parseAdmonition(state: any, start: number, end: number, silent: boolean): boolean {
  const startLine = start;
  let nextLine = start;
  
  // Verificar se a linha começa com !!!
  const startPos = state.bMarks[nextLine] + state.tShift[nextLine];
  const max = state.eMarks[nextLine];
  
  // Precisa ter pelo menos "!!! " (4 caracteres)
  if (startPos + 4 >= max) return false;
  
  const marker = state.src.slice(startPos, startPos + 3);
  if (marker !== '!!!') return false;
  
  // Deve ter um espaço após !!!
  if (state.src[startPos + 3] !== ' ') return false;
  
  // Extrair tipo e título da linha de abertura
  const headerLine = state.src.slice(startPos + 4, max).trim();
  
  // Regex para capturar: tipo obrigatório, título opcional entre aspas
  const match = headerLine.match(/^(\S+)(?:\s+"([^"]*)")?/);
  
  if (!match) return false;
  
  const inputType = match[1].toLowerCase();
  const customTitle = match[2];
  const admonitionType = ADMONITION_TYPES[inputType];
  
  // Tipo deve ser válido
  if (!admonitionType) return false;
  
  if (silent) return true;
  
  // Encontrar o fim do bloco admonition
  nextLine = start + 1;
  while (nextLine < end) {
    const pos = state.bMarks[nextLine] + state.tShift[nextLine];
    const lineMax = state.eMarks[nextLine];
    
    // Linha vazia - continuar
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }
    
    // Verificar se a linha está indentada com 4 espaços
    const lineContent = state.src.slice(pos, lineMax);
    if (!lineContent.startsWith('    ')) {
      // Linha não indentada - fim do bloco
      break;
    }
    
    nextLine++;
  }
  
  // Criar tokens para a estrutura do admonition
  const tokenOpen = state.push('admonition_open', 'div', 1);
  tokenOpen.markup = '!!!';
  tokenOpen.block = true;
  tokenOpen.info = admonitionType;
  tokenOpen.map = [start, nextLine];
  
  // Token do título
  const tokenTitle = state.push('admonition_title_open', 'p', 1);
  tokenTitle.markup = '!!!';
  tokenTitle.block = true;
  tokenTitle.map = [start, start + 1];
  
  const tokenTitleInline = state.push('inline', '', 0);
  tokenTitleInline.content = customTitle || DEFAULT_TITLES[admonitionType];
  tokenTitleInline.map = [start, start + 1];
  tokenTitleInline.children = [];
  
  const tokenTitleClose = state.push('admonition_title_close', 'p', -1);
  tokenTitleClose.markup = '!!!';
  tokenTitleClose.block = true;
  
  // Processar conteúdo interno se existir
  if (nextLine > start + 1) {
    const contentLines: string[] = [];
    for (let i = start + 1; i < nextLine; i++) {
      const linePos = state.bMarks[i] + state.tShift[i];
      const lineMax = state.eMarks[i];
      let lineContent = state.src.slice(linePos, lineMax);
      
      // Remover indentação de 4 espaços obrigatória
      if (lineContent.startsWith('    ')) {
        lineContent = lineContent.slice(4);
      } else if (lineContent.trim() === '') {
        // Linha vazia - manter como está
        lineContent = '';
      }
      
      contentLines.push(lineContent);
    }
    
    // Processar o conteúdo como markdown recursivamente
    const contentText = contentLines.join('\n').trim();
    
    if (contentText) {
      // Criar um novo estado para processar o conteúdo interno
      const oldParent = state.parentType;
      const oldLineMax = state.lineMax;
      const oldTShift = state.tShift[start];
      const oldSCount = state.sCount[start];
      const oldBMarks = state.bMarks[start];
      const oldEMarks = state.eMarks[start];
      
      state.parentType = 'admonition';
      
      // Tokenizar o conteúdo
      const contentState = new state.md.block.State(contentText, state.md, state.env, []);
      state.md.block.tokenize(contentState, contentState.line, contentState.lineMax);
      
      // Copiar os tokens gerados para o estado principal
      for (const token of contentState.tokens) {
        state.tokens.push(token);
      }
      
      // Restaurar estado anterior
      state.parentType = oldParent;
      state.lineMax = oldLineMax;
      state.tShift[start] = oldTShift;
      state.sCount[start] = oldSCount;
      state.bMarks[start] = oldBMarks;
      state.eMarks[start] = oldEMarks;
    }
  }
  
  // Token de fechamento
  const tokenClose = state.push('admonition_close', 'div', -1);
  tokenClose.markup = '!!!';
  tokenClose.block = true;
  
  state.line = nextLine;
  return true;
}

/**
 * Renderiza a tag de abertura do admonition
 */
function renderAdmonitionOpen(tokens: any[], idx: number, options: any, env: any, renderer: any): string {
  const token = tokens[idx];
  const type = token.info || 'note';
  return `<div class="admonition ${type}">\n`;
}

/**
 * Renderiza a tag de fechamento do admonition
 */
function renderAdmonitionClose(tokens: any[], idx: number, options: any, env: any, renderer: any): string {
  return '</div>\n';
}

/**
 * Renderiza o título do admonition
 */
function renderAdmonitionTitleOpen(tokens: any[], idx: number, options: any, env: any, renderer: any): string {
  return '<p class="admonition-title">';
}

/**
 * Renderiza o fechamento do título do admonition
 */
function renderAdmonitionTitleClose(tokens: any[], idx: number, options: any, env: any, renderer: any): string {
  return '</p>\n';
}

/**
 * Plugin principal que registra o parser e renderizadores de admonition
 * @param md Instância do MarkdownIt
 */
export function admonitionPlugin(md: MarkdownIt): void {
  // Registrar o parser antes do parser de parágrafo
  md.block.ruler.before('paragraph', 'admonition', parseAdmonition, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  });
  
  // Registrar os renderizadores
  md.renderer.rules.admonition_open = renderAdmonitionOpen;
  md.renderer.rules.admonition_close = renderAdmonitionClose;
  md.renderer.rules.admonition_title_open = renderAdmonitionTitleOpen;
  md.renderer.rules.admonition_title_close = renderAdmonitionTitleClose;
}

/**
 * Exportar tipos e constantes para uso em testes
 */
export { ADMONITION_TYPES, DEFAULT_TITLES };
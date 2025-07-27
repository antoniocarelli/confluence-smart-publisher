/**
 * Converts a table ADF node to markdown.
 * Generates CommonMark-compatible tables using GitHub Flavored Markdown table extension.
 * Supports both property tables and regular tables with proper formatting.
 * @param node The table ADF node
 * @param children The already converted children blocks (should be rows)
 * @returns ConverterResult
 */
import { AdfNode, MarkdownBlock, ConverterResult } from '../types';
import { isPropertyTable } from '../utils';

/**
 * Removes extra formatting from property table keys
 * @param text Text that may have extra ** formatting
 * @returns Clean text for property tables
 */
function cleanPropertyKey(text: string): string {
  // Remove extra ** formatting, but keep the content
  return text.replace(/^\*\*|\*\*$/g, '').trim();
}

/**
 * Escapes pipe characters in table cell content for CommonMark table compatibility
 * @param text Cell content that may contain pipes
 * @returns Escaped text safe for table cells
 */
function escapeTableCell(text: string): string {
  // Escape pipe characters that would break table structure
  return text.replace(/\|/g, '\\|').trim();
}

export default function convertTable(node: AdfNode, children: MarkdownBlock[]): ConverterResult {
  // Property Table: all rows have 2 cells (1 header, 1 cell)
  // Convert to definition-list style format which is more readable
  if (isPropertyTable(node)) {
    let markdown = '\n';
    for (const row of children) {
      // Expected format: '| key | value |'
      const cells = row.markdown.split('|').map(s => s.trim()).filter(Boolean);
      if (cells.length === 2) {
        // Clean the key (remove extra ** formatting) and format properly
        const cleanKey = cleanPropertyKey(cells[0]);
        const cleanValue = escapeTableCell(cells[1]);
        markdown += `**${cleanKey}:** ${cleanValue}\n\n`;
      }
    }
    return { 
      markdown,
      context: { hasComplexContent: true }
    };
  }

  // Regular Table: Generate GitHub Flavored Markdown table
  // This is supported by most CommonMark parsers with table extensions
  if (children.length === 0) {
    return { markdown: '', context: { hasComplexContent: false } };
  }

  let markdown = '';
  let isFirstRowHeader = false;
  
  // Check if first row should be treated as header
  // In GFM tables, we need to detect if the first row contains header cells
  const firstRow = children[0];
  if (firstRow && firstRow.markdown) {
    // Parse the first row to see if it looks like a header
    const firstRowCells = firstRow.markdown
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(cell => escapeTableCell(cell));
    
    isFirstRowHeader = firstRowCells.length > 0 && firstRowCells.every(cell => cell.length > 0);
  }

  // Process all rows
  for (let i = 0; i < children.length; i++) {
    const row = children[i];
    if (!row.markdown) continue;
    
    // Parse and clean cells
    const cells = row.markdown
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(cell => escapeTableCell(cell));
    
    if (cells.length === 0) continue;
    
    // Add the row
    markdown += '| ' + cells.join(' | ') + ' |\n';
    
    // Add separator row after header (first row if it's a header)
    if (i === 0 && isFirstRowHeader) {
      const separatorCells = cells.map(() => '---');
      markdown += '| ' + separatorCells.join(' | ') + ' |\n';
    }
  }
  
  return { 
    markdown,
    context: { hasComplexContent: children.length > 0 }
  };
}




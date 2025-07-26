/**
 * Converts bulletList to markdown.
 * Generates a CommonMark-compliant unordered list with consistent markers and proper indentation.
 * Follows CommonMark Spec v0.31.2 for bullet list formatting.
 * @param node The bulletList ADF node
 * @param children The already converted children blocks (should be listItems)
 * @param level The nesting level (default 0)
 * @returns ConverterResult
 */
import { AdfNode, MarkdownBlock, ConverterResult } from '../types';

/**
 * Renders bullet list with CommonMark-compliant indentation and markers
 * @param children List item children blocks
 * @param level Nesting level (0 = top level)
 * @returns Formatted markdown string
 */
function renderBulletList(children: MarkdownBlock[], level: number = 0): string {
  // CommonMark: Use consistent marker (-) and calculate proper indentation
  // Each list item should be indented by the width of the marker (1 char) + 1 space = 2 spaces per level
  const indent = '  '.repeat(level); // 2 spaces per level for consistent indentation
  const marker = '-'; // Use consistent dash marker for all levels per CommonMark best practices
  
  return children
    .map(child => {
      const lines = child.markdown.split('\n');
      let result = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Skip completely empty lines
        if (!trimmedLine) {
          if (i > 0) {
            result += '\n';
          }
          continue;
        }
        
        if (i === 0) {
          // First line gets the bullet marker
          result += `${indent}${marker} ${trimmedLine}`;
        } else {
          // Subsequent lines: indent to align with the content after the marker
          // CommonMark requires continuation to be indented to the first non-space character
          // after the list marker, which is 2 spaces from the start of the marker
          const continuationIndent = indent + '  '; // 2 spaces to align with content
          
          // If line starts with a list marker, it's a nested list - preserve structure
          if (/^(\s*[-*+]|\s*\d+\.)/.test(line)) {
            // This is a nested list item, maintain relative indentation
            result += `\n${line}`;
          } else {
            // Regular continuation content
            result += `\n${continuationIndent}${trimmedLine}`;
          }
        }
      }
      
      return result;
    })
    .join('\n');
}

export default function convertBulletList(node: AdfNode, children: MarkdownBlock[], level: number = 0): ConverterResult {
  const markdown = renderBulletList(children, level);
  
  return { 
    markdown,
    context: { 
      hasComplexContent: level > 0 || children.some(child => child.markdown.includes('\n'))
    }
  };
} 
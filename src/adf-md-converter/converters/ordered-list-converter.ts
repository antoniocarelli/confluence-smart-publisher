/**
 * Converts orderedList to markdown.
 * Generates a CommonMark-compliant ordered list with proper numbering and indentation.
 * Follows CommonMark Spec v0.31.2 for ordered list formatting.
 * @param node The orderedList ADF node
 * @param children The already converted children blocks (should be listItems)
 * @param level The nesting level (default 0)
 * @returns ConverterResult
 */
import { AdfNode, MarkdownBlock, ConverterResult } from '../types';

/**
 * Renders ordered list with CommonMark-compliant indentation and numbering
 * @param children List item children blocks
 * @param level Nesting level (0 = top level)
 * @param startNumber Starting number for the list
 * @returns Formatted markdown string
 */
function renderOrderedList(children: MarkdownBlock[], level: number = 0, startNumber: number = 1): string {
  // CommonMark: Calculate proper indentation based on marker width
  // For ordered lists, marker width varies (1., 2., ..., 10., 11., etc.)
  // We need to consider the widest marker in the list for proper alignment
  const maxNumber = startNumber + children.length - 1;
  const maxMarkerWidth = `${maxNumber}.`.length;
  const indent = '  '.repeat(level); // 2 spaces per nesting level
  
  let counter = startNumber;
  
  return children
    .map(child => {
      const lines = child.markdown.split('\n');
      let result = '';
      const currentMarker = `${counter}.`;
      
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
          // First line gets the number marker
          result += `${indent}${currentMarker} ${trimmedLine}`;
          counter++;
        } else {
          // Subsequent lines: indent to align with the content after the marker
          // CommonMark requires continuation to be indented to the first non-space character
          // after the list marker. For "1. ", that's 3 spaces from start of marker
          const continuationIndent = indent + ' '.repeat(currentMarker.length + 1);
          
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

export default function convertOrderedList(node: AdfNode, children: MarkdownBlock[], level: number = 0): ConverterResult {
  // CommonMark: start attribute should only be output if it's not 1
  const start = node.attrs && typeof node.attrs['order'] === 'number' ? node.attrs['order'] : 1;
  const markdown = renderOrderedList(children, level, start);
  
  return { 
    markdown,
    context: { 
      hasComplexContent: level > 0 || children.some(child => child.markdown.includes('\n')),
      startNumber: start !== 1 ? start : undefined // Track non-standard start for YAML if needed
    }
  };
} 
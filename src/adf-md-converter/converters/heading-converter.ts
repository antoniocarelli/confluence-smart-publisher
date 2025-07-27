/**
 * Converts a heading ADF node to markdown.
 * Generates CommonMark-compliant ATX headings with proper spacing.
 * Follows CommonMark Spec v0.31.2 for ATX heading formatting.
 * @param node The heading ADF node
 * @param children The already converted children blocks
 * @returns ConverterResult
 */
import { AdfNode, MarkdownBlock, ConverterResult } from '../types';

export default function convertHeading(node: AdfNode, children: MarkdownBlock[]): ConverterResult {
  // CommonMark: ATX headings use 1-6 # characters
  const level = node.attrs && typeof node.attrs['level'] === 'number' ? node.attrs['level'] : 1;
  
  // Ensure level is within CommonMark bounds (1-6)
  const clampedLevel = Math.max(1, Math.min(6, level));
  
  // Get heading text from children
  const text = children.map(child => child.markdown).join('');
  
  // CommonMark: ATX headings require space after # characters unless heading is empty
  // The opening sequence of # characters must be followed by a space or by the end of line
  const hashes = '#'.repeat(clampedLevel);
  const markdown = text.trim() ? `${hashes} ${text.trim()}` : hashes;
  
  return { markdown };
}




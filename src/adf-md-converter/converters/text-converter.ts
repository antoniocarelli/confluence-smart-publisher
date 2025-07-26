/**
 * Converts a text ADF node to markdown.
 * Generates CommonMark-compliant inline formatting for emphasis, strong, code, and links.
 * Follows CommonMark Spec v0.31.2 for inline formatting precedence and rules.
 * @param node The text ADF node
 * @param children The already converted children blocks (should be empty for text)
 * @returns ConverterResult
 */
import { AdfNode, MarkdownBlock, ConverterResult } from '../types';

export default function convertText(node: AdfNode, children: MarkdownBlock[]): ConverterResult {
  let text = node.text || '';
  
  if (Array.isArray(node.marks)) {
    // Apply marks in order, following CommonMark precedence rules
    // Process marks to build proper nested formatting
    let hasCode = false;
    let hasStrong = false;
    let hasEm = false;
    let linkHref = '';
    
    // Check what marks we have first
    for (const mark of node.marks) {
      if (mark.type === 'code') {
        hasCode = true;
      } else if (mark.type === 'strong') {
        hasStrong = true;
      } else if (mark.type === 'em') {
        hasEm = true;
      } else if (mark.type === 'link') {
        linkHref = mark.attrs && typeof mark.attrs['href'] === 'string' ? mark.attrs['href'] : '';
      }
    }
    
    // CommonMark: Code spans take precedence over other formatting
    if (hasCode) {
      // Inside code spans, other formatting is literal
      text = `\`${text}\``;
    } else {
      // Apply emphasis and strong formatting according to CommonMark rules
      // CommonMark: ** for strong, * for emphasis (consistent style)
      if (hasStrong && hasEm) {
        // Both strong and emphasis - nest properly: ***text*** = <strong><em>text</em></strong>
        text = `***${text}***`;
      } else if (hasStrong) {
        // Just strong
        text = `**${text}**`;
      } else if (hasEm) {
        // Just emphasis
        text = `*${text}*`;
      }
      
      // Apply link formatting last (links can contain formatted text)
      if (linkHref) {
        text = `[${text}](${linkHref})`;
      }
    }
    
    // Handle other marks that might be present (future extensibility)
    for (const mark of node.marks) {
      // Skip marks we've already processed
      if (['code', 'strong', 'em', 'link'].includes(mark.type)) {
        continue;
      }
      
      // Handle any additional mark types that might be added in the future
      // For now, we ignore unknown marks to maintain CommonMark compliance
    }
  }
  
  return { markdown: text };
} 
/**
 * Converts a codeBlock ADF node to markdown.
 * Generates CommonMark-compliant fenced code blocks.
 * Follows CommonMark Spec v0.31.2 for fenced code block formatting.
 * @param node The codeBlock ADF node
 * @param children The already converted children blocks (should be empty for codeBlock)
 * @returns ConverterResult
 */
import { AdfNode, MarkdownBlock, ConverterResult } from '../types';
import { detectMermaidSyntax } from '../utils';

export default function convertCodeBlock(node: AdfNode, children: MarkdownBlock[]): ConverterResult {
  // Extract language if present
  let language = node.attrs && typeof node.attrs.language === 'string' ? node.attrs.language : '';
  
  // Extract code content
  let code = '';
  if (Array.isArray(node.content)) {
    code = node.content.map(child => child.text || '').join('\n');
  } else if (typeof node.text === 'string') {
    code = node.text;
  }
  
  // Fallback if code is empty - CommonMark allows empty code blocks
  if (!code) {
    code = '';
  }

  // Smart Mermaid detection
  if (!language && detectMermaidSyntax(code)) {
    language = 'mermaid';
  } else if (language && language.toLowerCase().includes('mermaid')) {
    // Normalize Mermaid language variants
    language = 'mermaid';
  }

  // CommonMark: Fenced code blocks start on their own line without leading newline
  // The opening fence should be on its own line, followed by code content, then closing fence
  // Info string (language) should not contain backticks per CommonMark spec
  const safeLang = language.replace(/`/g, ''); // Remove any backticks from language
  const markdown = `\`\`\`${safeLang}\n${code}\n\`\`\``;
  
  return { markdown };
} 
/**
 * Converts a taskItem ADF node to markdown.
 * YAML generation is handled centrally by AdfToMarkdownConverter.
 * @param node The taskItem ADF node
 * @param children The already converted children blocks
 * @returns ConverterResult
 */
import { AdfNode, MarkdownBlock, ConverterResult } from '../types';

export default function convertTaskItem(node: AdfNode, children: MarkdownBlock[]): ConverterResult {
  const state = node.attrs && node.attrs['state'] === 'DONE' ? 'x' : ' ';
  let text = children.map(child => child.markdown).join('');
  if (!text && node.content && node.content[0] && node.content[0].text) {
    text = node.content[0].text;
  }
  const markdown = `[${state}] ${text}\n `;
  return { markdown };
} 
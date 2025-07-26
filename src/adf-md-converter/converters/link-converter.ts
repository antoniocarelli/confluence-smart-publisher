/**
 * Converts a link ADF node to markdown.
 * Generates CommonMark-compliant inline links with proper URL encoding and text handling.
 * Follows CommonMark Spec v0.31.2 for link formatting.
 * @param node The link ADF node
 * @param children The already converted children blocks
 * @param _level (ignored)
 * @param confluenceBaseUrl Base URL do Confluence para contexto
 * @returns Promise<ConverterResult>
 */
import { AdfNode, MarkdownBlock, ConverterResult } from '../types';
import { resolveLinkTextAndYaml } from '../link-utils';

export default async function convertLink(
  node: AdfNode,
  children: MarkdownBlock[],
  _level?: number,
  confluenceBaseUrl: string = ''
): Promise<ConverterResult> {
  const href = node.attrs && typeof node.attrs['href'] === 'string' ? node.attrs['href'] : '';
  const textFromChildren = children.map(child => child.markdown).join('');
  
  // Use link utility for advanced resolution, but ensure CommonMark compliance
  const { text, url, yaml } = await resolveLinkTextAndYaml({
    url: href,
    adfType: 'link',
    attrs: node.attrs || {},
    confluenceBaseUrl,
    originalType: 'link',
  });
  
  // Priority: use children text if available, otherwise use resolved text
  const linkText = textFromChildren.trim() ? textFromChildren : text;
  
  // CommonMark: Links use [text](url) format
  // URL should be properly encoded, but we trust the input is already valid
  // Empty URLs are allowed in CommonMark - they create anchor tags with empty href
  const cleanUrl = url.trim();
  
  // Escape any closing parentheses in URLs that aren't already escaped
  // CommonMark allows parentheses in URLs but they need to be balanced or escaped
  const escapedUrl = cleanUrl.replace(/(?<!\\)\)/g, '\\)');
  
  // CommonMark-compliant inline link format
  const markdown = `[${linkText}](${escapedUrl})`;
  
  return { markdown };
} 
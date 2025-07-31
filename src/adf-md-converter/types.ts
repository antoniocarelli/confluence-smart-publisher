// Shared types for ADF to Markdown conversion

/**
 * Represents a node in the Atlassian Document Format (ADF).
 */
export interface AdfNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: AdfNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

/**
 * Represents a Markdown block with optional YAML metadata.
 */
export interface MarkdownBlock {
  yamlBlock: string;
  markdown: string;
  adfInfo?: {
    adfType: string;
    localId?: string;
    id?: string;
    [key: string]: any;
  };
}

/**
 * Simplified converter result - converters only return markdown content.
 * YAML generation is handled centrally.
 */
export interface ConverterResult {
  markdown: string;
  context?: {
    hasComplexContent?: boolean;
    originalType?: string;
    needsYaml?: boolean;
    startNumber?: number;
    footnoteRef?: string;
    annotationRef?: string;
    annotationBlock?: string;
    annotationDef?: string;
  };
}

/**
 * Interface for footnote reference
 */
export interface FootnoteReference {
  id: string;
  number: number;
  content?: string;
}

/**
 * Interface for footnote mark in text
 */
export interface FootnoteMark {
  type: 'footnote';
  attrs: {
    id: string;
    footnoteType?: 'reference' | 'definition';
  };
}

/**
 * Document context for converters that need access to the full document.
 * Used by TOC converter to analyze all headings in the document.
 */
export interface DocumentContext {
  allNodes: AdfNode[];
  rootDocument: AdfNode;
}

/**
 * Represents a heading found in the document for TOC generation.
 */
export interface HeadingInfo {
  level: number;
  text: string;
  slug: string;
  localId?: string;
}

/**
 * Centralized icon/emoji mappings for consistent handling across converters
 */



/**
 * Maps emoji symbols to text equivalents (for slug generation)
 */
export const emojiToText: Record<string, string> = {
  '🚀': 'rocket',
  '⚡': 'lightning', 
  '🔥': 'fire',
  '💡': 'idea',
  '📝': 'note',
  '📋': 'clipboard',
  '🔧': 'tool',
  '⚙️': 'settings',
  '🎯': 'target',
  '📊': 'chart',
  '📈': 'graph',
  '🔍': 'search',
  '💻': 'computer',
  '📱': 'mobile',
  '🌐': 'web',
  '🔒': 'lock',
  '🔓': 'unlock',
  '✅': 'check',
  '❌': 'x',
  '⚠️': 'warning',
  '🚨': 'alert',
  '📁': 'folder',
  '📄': 'document',
  '🔗': 'link',
  // Include emojis for panels, status, and UI elements
  'ℹ️': 'info',
  '⚪': 'neutral',
  '🔵': 'blue',
  '🟢': 'green',
  '🟡': 'yellow',
  '🔴': 'red',
  '🟣': 'purple',
  '✔️': 'check-mark',
  '😃': 'smile',
  '😢': 'sad',
  '😉': 'wink',
  '😆': 'laugh',
  '😠': 'angry',
  '👍': 'thumbs-up',
  '👎': 'thumbs-down',
  '😊': 'blush',
  '😮': 'surprised',
  '😭': 'cry',
  '😎': 'cool',
  '🏁': 'checkered_flag',
  '⛔': 'block'
};

/**
 * Helper function to get emoji by name/color using emojiToText (inverse lookup)
 * @param name The name/color to look up (e.g., 'warning', 'success', 'info')
 * @returns The corresponding emoji or empty string if not found
 */
export function getEmojiByName(name: string): string {
  // Find the emoji by doing reverse lookup in emojiToText
  for (const [emoji, text] of Object.entries(emojiToText)) {
    if (text === name) {
      return emoji;
    }
  }
  return '';
}




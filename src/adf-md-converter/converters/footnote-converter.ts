import { AdfNode } from '../types';
import { ConverterResult } from '../types';

/**
 * Interface for footnote state management
 */
interface FootnoteState {
    counter: number;
    footnotes: Map<string, { id: string; content: string; number: number }>;
    references: Map<string, number>;
}

/**
 * Global footnote state for the current document
 */
let documentFootnoteState: FootnoteState = {
    counter: 0,
    footnotes: new Map(),
    references: new Map()
};

/**
 * Reset footnote state for new document conversion
 */
export function resetFootnoteState(): void {
    documentFootnoteState = {
        counter: 0,
        footnotes: new Map(),
        references: new Map()
    };
}

/**
 * Get all footnote content formatted for document end
 */
export function getFootnoteContent(): string {
    if (documentFootnoteState.footnotes.size === 0) {
        return '';
    }

    const footnoteArray = Array.from(documentFootnoteState.footnotes.values())
        .sort((a, b) => a.number - b.number);

    const footnoteDefinitions = footnoteArray
        .map(footnote => `[^${footnote.number}]: ${footnote.content}`)
        .join('\n');

    return '\n\n' + footnoteDefinitions;
}

/**
 * Convert footnote reference to markdown
 */
function convertFootnoteReference(node: AdfNode): ConverterResult {
    const footnoteId: string = (node.attrs?.id as string) || '';
    
    if (!footnoteId) {
        return { markdown: '' };
    }

    // Get or assign number for this footnote
    let footnoteNumber: number = documentFootnoteState.references.get(footnoteId) || 0;
    if (footnoteNumber === 0) {
        documentFootnoteState.counter++;
        footnoteNumber = documentFootnoteState.counter;
        documentFootnoteState.references.set(footnoteId, footnoteNumber);
    }

    return {
        markdown: `[^${footnoteNumber}]`,
        context: { footnoteRef: footnoteId }
    };
}

/**
 * Convert footnote content/definition
 */
function convertFootnoteContent(node: AdfNode): ConverterResult {
    const footnoteId: string = (node.attrs?.id as string) || '';
    
    if (!footnoteId) {
        return { markdown: '' };
    }

    // Get the footnote number
    let footnoteNumber: number = documentFootnoteState.references.get(footnoteId) || 0;
    if (footnoteNumber === 0) {
        documentFootnoteState.counter++;
        footnoteNumber = documentFootnoteState.counter;
        documentFootnoteState.references.set(footnoteId, footnoteNumber);
    }

    // Extract content from child nodes
    let content = '';
    if (node.content && node.content.length > 0) {
        // Process content nodes to extract text
        content = extractTextFromNodes(node.content);
    }

    // Store footnote definition
    documentFootnoteState.footnotes.set(footnoteId, {
        id: footnoteId,
        content: content.trim(),
        number: footnoteNumber
    });

    // Return empty markdown since footnotes are rendered at document end
    return { markdown: '' };
}

/**
 * Extract text content from ADF nodes recursively
 */
function extractTextFromNodes(nodes: AdfNode[]): string {
    let text = '';
    
    for (const node of nodes) {
        if (node.type === 'text') {
            text += node.text || '';
        } else if (node.content) {
            text += extractTextFromNodes(node.content);
        }
        
        // Add space between block elements
        if (node.type === 'paragraph' && text && !text.endsWith(' ')) {
            text += ' ';
        }
    }
    
    return text;
}

/**
 * Main footnote converter function
 */
export function convertFootnote(node: AdfNode): ConverterResult {
    const footnoteType = node.attrs?.footnoteType;
    
    switch (footnoteType) {
        case 'reference':
            return convertFootnoteReference(node);
        case 'definition':
            return convertFootnoteContent(node);
        default:
            // Handle generic footnote nodes
            if (node.attrs?.id) {
                return convertFootnoteReference(node);
            }
            return { markdown: '' };
    }
}
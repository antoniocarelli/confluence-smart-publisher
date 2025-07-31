/**
 * Footnote processing utilities for Material for MkDocs format
 */

/**
 * Regular expressions for footnote pattern matching
 */
export const FOOTNOTE_PATTERNS = {
    REFERENCE: /\[\^([^\]]+)\]/g,
    DEFINITION: /^\[\^([^\]]+)\]:\s*(.*)$/gm,
    INLINE_REFERENCE: /\[\^([^\]]+)\]/,
    INLINE_DEFINITION: /^\[\^([^\]]+)\]:\s*(.*)$/
};

/**
 * Interface for footnote reference
 */
export interface FootnoteReference {
    id: string;
    number: number;
    position: number;
}

/**
 * Interface for footnote definition
 */
export interface FootnoteDefinition {
    id: string;
    content: string;
    number: number;
}

/**
 * Extract footnote references from markdown text
 */
export function extractFootnoteReferences(text: string): FootnoteReference[] {
    const references: FootnoteReference[] = [];
    const matches = text.matchAll(FOOTNOTE_PATTERNS.REFERENCE);
    
    let position = 0;
    for (const match of matches) {
        if (match.index !== undefined) {
            references.push({
                id: match[1],
                number: 0, // Will be assigned during processing
                position: match.index
            });
            position++;
        }
    }
    
    return references;
}

/**
 * Extract footnote definitions from markdown text
 */
export function extractFootnoteDefinitions(text: string): FootnoteDefinition[] {
    const definitions: FootnoteDefinition[] = [];
    const matches = text.matchAll(FOOTNOTE_PATTERNS.DEFINITION);
    
    for (const match of matches) {
        definitions.push({
            id: match[1],
            content: match[2].trim(),
            number: 0 // Will be assigned during processing
        });
    }
    
    return definitions;
}

/**
 * Validate footnotes for orphaned references or definitions
 */
export function validateFootnotes(text: string): { isValid: boolean; errors: string[] } {
    const references = extractFootnoteReferences(text);
    const definitions = extractFootnoteDefinitions(text);
    
    const errors: string[] = [];
    
    // Check for orphaned references
    const refIds = new Set(references.map(ref => ref.id));
    const defIds = new Set(definitions.map(def => def.id));
    
    for (const refId of refIds) {
        if (!defIds.has(refId)) {
            errors.push(`Orphaned footnote reference: [^${refId}]`);
        }
    }
    
    // Check for orphaned definitions
    for (const defId of defIds) {
        if (!refIds.has(defId)) {
            errors.push(`Orphaned footnote definition: [^${defId}]`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Generate HTML for footnote
 */
export function generateFootnoteHtml(id: string, content: string, number: number): string {
    return `<div class="footnote" id="fn:${number}">
        <p>${content} <a href="#fnref:${number}" class="footnote-backref">↩</a></p>
    </div>`;
}

/**
 * Generate HTML for footnote reference
 */
export function generateFootnoteReferenceHtml(id: string, number: number): string {
    return `<sup id="fnref:${number}">
        <a href="#fn:${number}" class="footnote-ref" data-footnote-id="${number}">${number}</a>
    </sup>`;
}

/**
 * Process inline footnotes in text
 */
export function processInlineFootnotes(text: string): string {
    return text.replace(FOOTNOTE_PATTERNS.REFERENCE, (match, id) => {
        // This will be replaced by the markdown-it-footnote plugin
        return match;
    });
}

/**
 * Sort footnote definitions by their order of reference appearance
 */
export function sortFootnoteDefinitions(
    definitions: FootnoteDefinition[], 
    referenceOrder: string[]
): FootnoteDefinition[] {
    const sortedDefs: FootnoteDefinition[] = [];
    const defMap = new Map(definitions.map(def => [def.id, def]));
    
    // Add definitions in reference order
    for (const refId of referenceOrder) {
        const def = defMap.get(refId);
        if (def) {
            sortedDefs.push(def);
            defMap.delete(refId);
        }
    }
    
    // Add any remaining definitions
    sortedDefs.push(...Array.from(defMap.values()));
    
    return sortedDefs;
}
/**
 * Annotation processing utilities for Material for MkDocs format
 */

/**
 * Regular expressions for annotation pattern matching
 */
export const ANNOTATION_PATTERNS = {
    REFERENCE: /\((\d+)\)/g,
    DEFINITION: /^(\d+)\.\s+(.*)$/gm,
    ANNOTATE_BLOCK: /\{\s*\.annotate\s*\}/,
    INLINE_REFERENCE: /\((\d+)\)/,
    MULTI_LINE_DEFINITION: /^(\d+)\.\s+([\s\S]*?)(?=^\d+\.\s+|$)/gm
};

/**
 * Interface for annotation reference
 */
export interface AnnotationReference {
    localId: string;
    globalId: string;
    position: number;
}

/**
 * Interface for annotation definition
 */
export interface AnnotationDefinition {
    localId: string;
    globalId: string;
    content: string;
    htmlContent: string;
}

/**
 * Extract annotation references from text
 */
export function extractAnnotationReferences(text: string): AnnotationReference[] {
    const references: AnnotationReference[] = [];
    const matches = text.matchAll(ANNOTATION_PATTERNS.REFERENCE);
    
    for (const match of matches) {
        if (match.index !== undefined) {
            references.push({
                localId: match[1],
                globalId: '', // Will be assigned during processing
                position: match.index
            });
        }
    }
    
    return references;
}

/**
 * Extract annotation definitions from text
 */
export function extractAnnotationDefinitions(text: string): AnnotationDefinition[] {
    const definitions: AnnotationDefinition[] = [];
    const matches = text.matchAll(ANNOTATION_PATTERNS.DEFINITION);
    
    for (const match of matches) {
        definitions.push({
            localId: match[1],
            globalId: '', // Will be assigned during processing
            content: match[2].trim(),
            htmlContent: ''
        });
    }
    
    return definitions;
}

/**
 * Check if text has annotate class
 */
export function hasAnnotateClass(text: string): boolean {
    return ANNOTATION_PATTERNS.ANNOTATE_BLOCK.test(text);
}

/**
 * Process markdown annotations in a block
 */
export function processMarkdownAnnotations(markdown: string): {
    processedMarkdown: string;
    annotations: AnnotationDefinition[];
} {
    const lines = markdown.split('\n');
    const processedLines: string[] = [];
    const annotations: AnnotationDefinition[] = [];
    let isInAnnotatedBlock = false;
    let annotationCounter = 0;
    const localToGlobalMap = new Map<string, string>();
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for annotate block marker
        if (hasAnnotateClass(line)) {
            isInAnnotatedBlock = true;
            processedLines.push(line);
            continue;
        }
        
        // If we're in an annotated block, process references
        if (isInAnnotatedBlock) {
            let processedLine = line;
            
            // Replace local references with global ones
            processedLine = processedLine.replace(ANNOTATION_PATTERNS.REFERENCE, (match, localId) => {
                let globalId = localToGlobalMap.get(localId);
                if (!globalId) {
                    annotationCounter++;
                    globalId = annotationCounter.toString();
                    localToGlobalMap.set(localId, globalId);
                }
                return `(${globalId})`;
            });
            
            processedLines.push(processedLine);
            
            // Check for annotation definitions
            const defMatch = line.match(ANNOTATION_PATTERNS.INLINE_REFERENCE);
            if (defMatch) {
                const localId = defMatch[1];
                const globalId = localToGlobalMap.get(localId);
                if (globalId) {
                    // Look for definition content
                    const definitionPattern = new RegExp(`^${localId}\\. (.*)$`);
                    const defContentMatch = line.match(definitionPattern);
                    if (defContentMatch) {
                        annotations.push({
                            localId,
                            globalId,
                            content: defContentMatch[1].trim(),
                            htmlContent: ''
                        });
                    }
                }
            }
        } else {
            processedLines.push(line);
        }
        
        // Reset if we exit the annotated block
        if (isInAnnotatedBlock && line.trim() === '' && 
            i + 1 < lines.length && !lines[i + 1].trim().startsWith('(') &&
            !lines[i + 1].match(/^\d+\.\s+/)) {
            isInAnnotatedBlock = false;
        }
    }
    
    return {
        processedMarkdown: processedLines.join('\n'),
        annotations
    };
}

/**
 * Process annotated block with definitions
 */
export function processAnnotatedBlock(content: string): {
    processedContent: string;
    definitions: AnnotationDefinition[];
} {
    const lines = content.split('\n');
    const processedLines: string[] = [];
    const definitions: AnnotationDefinition[] = [];
    let currentDefinition: { id: string; content: string[] } | null = null;
    
    for (const line of lines) {
        const defMatch = line.match(/^(\d+)\.\s+(.*)$/);
        
        if (defMatch) {
            // Save previous definition if exists
            if (currentDefinition) {
                definitions.push({
                    localId: currentDefinition.id,
                    globalId: '', // Will be set during processing
                    content: currentDefinition.content.join('\n').trim(),
                    htmlContent: ''
                });
            }
            
            // Start new definition
            currentDefinition = {
                id: defMatch[1],
                content: [defMatch[2]]
            };
        } else if (currentDefinition && line.trim().startsWith('    ')) {
            // Continuation of definition (indented)
            currentDefinition.content.push(line.substring(4));
        } else {
            // Regular content line
            processedLines.push(line);
            
            // End current definition if we hit non-definition content
            if (currentDefinition) {
                definitions.push({
                    localId: currentDefinition.id,
                    globalId: '', // Will be set during processing
                    content: currentDefinition.content.join('\n').trim(),
                    htmlContent: ''
                });
                currentDefinition = null;
            }
        }
    }
    
    // Save last definition if exists
    if (currentDefinition) {
        definitions.push({
            localId: currentDefinition.id,
            globalId: '', // Will be set during processing
            content: currentDefinition.content.join('\n').trim(),
            htmlContent: ''
        });
    }
    
    return {
        processedContent: processedLines.join('\n'),
        definitions
    };
}

/**
 * Generate HTML marker for annotation
 */
export function generateAnnotationMarkerHtml(globalId: string): string {
    return `<span class="md-annotation" tabindex="0" data-md-visible="">
        <span class="md-annotation__index" tabindex="-1">
            <span data-md-annotation-id="${globalId}"></span>
        </span>
    </span>`;
}

/**
 * Validate annotations for consistency
 */
export function validateAnnotations(text: string): { isValid: boolean; errors: string[] } {
    const references = extractAnnotationReferences(text);
    const definitions = extractAnnotationDefinitions(text);
    
    const errors: string[] = [];
    
    // Check for orphaned references
    const refIds = new Set(references.map(ref => ref.localId));
    const defIds = new Set(definitions.map(def => def.localId));
    
    for (const refId of refIds) {
        if (!defIds.has(refId)) {
            errors.push(`Orphaned annotation reference: (${refId})`);
        }
    }
    
    // Check for orphaned definitions
    for (const defId of defIds) {
        if (!refIds.has(defId)) {
            errors.push(`Orphaned annotation definition: ${defId}.`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
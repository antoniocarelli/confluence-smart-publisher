import { AdfNode } from '../types';
import { ConverterResult } from '../types';

/**
 * Interface for annotation state management
 */
interface AnnotationState {
    counter: number;
    annotations: Map<string, { id: string; content: string; number: number }>;
    references: Map<string, number>;
    currentBlock: Map<string, number>; // Local ID to global ID mapping for current block
}

/**
 * Global annotation state for the current document
 */
let documentAnnotationState: AnnotationState = {
    counter: 0,
    annotations: new Map(),
    references: new Map(),
    currentBlock: new Map()
};

/**
 * Reset annotation state for new document conversion
 */
export function resetAnnotationState(): void {
    documentAnnotationState = {
        counter: 0,
        annotations: new Map(),
        references: new Map(),
        currentBlock: new Map()
    };
}

/**
 * Get all annotation content for processing
 */
export function getAnnotationContent(): string {
    // Annotations are processed in MarkdownRenderer, not in ADF conversion
    return '';
}

/**
 * Process annotation text to replace (N) with markers
 */
export function processAnnotationText(text: string, blockId: string): string {
    const annotationPattern = /\((\d+)\)/g;
    
    return text.replace(annotationPattern, (match, localId) => {
        // Get or create global ID for this local ID
        let globalId = documentAnnotationState.currentBlock.get(localId);
        if (!globalId) {
            documentAnnotationState.counter++;
            globalId = documentAnnotationState.counter;
            documentAnnotationState.currentBlock.set(localId, globalId);
        }
        
        return `(${globalId})`;
    });
}

/**
 * Process annotation definitions
 */
export function processAnnotationDefinitions(definitions: string[], blockId: string): string {
    let result = '';
    
    definitions.forEach((definition, index) => {
        const localId = (index + 1).toString();
        const globalId = documentAnnotationState.currentBlock.get(localId);
        
        if (globalId) {
            // Store annotation definition
            documentAnnotationState.annotations.set(globalId.toString(), {
                id: globalId.toString(),
                content: definition.trim(),
                number: globalId
            });
        }
    });
    
    // Clear current block mapping after processing definitions
    documentAnnotationState.currentBlock.clear();
    
    return result; // Definitions are hidden from output
}

/**
 * Main annotation converter function
 */
export function convertAnnotation(node: AdfNode): ConverterResult {
    const annotationType = node.attrs?.annotationType;
    
    switch (annotationType) {
        case 'reference':
            return handleAnnotationReference(node);
        case 'definition':
            return handleAnnotationDefinition(node);
        case 'block':
            return handleAnnotationNode(node);
        default:
            return handleAnnotationNode(node);
    }
}

/**
 * Handle annotation node (annotated block)
 */
function handleAnnotationNode(node: AdfNode): ConverterResult {
    const blockId: string = (node.attrs?.id as string) || `block_${Date.now()}`;
    let markdown = '';
    
    // Process content and mark as annotated block
    if (node.content && node.content.length > 0) {
        markdown = extractTextFromNodes(node.content);
        
        // Add annotate class to indicate this block has annotations
        markdown = `{ .annotate }\n\n${markdown}`;
        
        // Process annotation text
        markdown = processAnnotationText(markdown, blockId);
    }
    
    return {
        markdown,
        context: { annotationBlock: blockId }
    };
}

/**
 * Handle annotation reference
 */
function handleAnnotationReference(node: AdfNode): ConverterResult {
    const localId: string = (node.attrs?.localId as string) || '1';
    
    // This will be processed by processAnnotationText
    return {
        markdown: `(${localId})`,
        context: { annotationRef: localId }
    };
}

/**
 * Handle annotation definition
 */
function handleAnnotationDefinition(node: AdfNode): ConverterResult {
    const content = extractTextFromNodes(node.content || []);
    
    // Definitions are processed separately and hidden from output
    return {
        markdown: `<!-- ANNOTATION_DEF: ${content.trim()} -->`,
        context: { annotationDef: content.trim() }
    };
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
            
            // Add line breaks for block elements
            if (node.type === 'paragraph' || node.type === 'heading') {
                text += '\n\n';
            }
        }
    }
    
    return text.trim();
}
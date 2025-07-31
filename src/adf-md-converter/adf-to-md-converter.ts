/**
 * Main class responsible for converting ADF nodes to Markdown.
 * Traverses the ADF tree recursively and delegates conversion to specific converters.
 */
import { AdfNode, MarkdownBlock, ConverterResult, DocumentContext } from './types';
import { generateYamlBlock, createSmartYamlBlock } from './utils';
import convertDoc from './converters/doc-converter';
import convertParagraph from './converters/paragraph-converter';
import convertHeading from './converters/heading-converter';
import convertTable from './converters/table-converter';
import convertTableRow from './converters/table-row-converter';
import convertTableHeader from './converters/table-header-converter';
import convertTableCell from './converters/table-cell-converter';
import convertText from './converters/text-converter';
import convertBulletList from './converters/bullet-list-converter';
import convertListItem from './converters/list-item-converter';
import convertOrderedList from './converters/ordered-list-converter';
import convertTaskList from './converters/task-list-converter';
import convertTaskItem from './converters/task-item-converter';
import convertStrong from './converters/strong-converter';
import convertCode from './converters/code-converter';
import convertLink from './converters/link-converter';
import convertBlockCard from './converters/block-card-converter';
import convertInlineCard from './converters/inline-card-converter';
import convertEmbedCard from './converters/embed-card-converter';
import convertCodeBlock from './converters/code-block-converter';
import convertRule from './converters/rule-converter';
import convertExpand from './converters/expand-converter';
import convertPanel from './converters/panel-converter';
import convertStatus from './converters/status-converter';
import convertDate from './converters/date-converter';
import convertEmoji from './converters/emoji-converter';
import convertMention from './converters/mention-converter';
import convertHardBreak from './converters/hard-break-converter';
import convertExtension from './converters/extension-converter';
import convertBodiedExtension from './converters/bodied-extension-converter';
import convertMathBlock from './converters/math-block-converter';
import { convertFootnote, resetFootnoteState, getFootnoteContent } from './converters/footnote-converter';
import { convertAnnotation, resetAnnotationState, getAnnotationContent } from './converters/annotation-converter';

export class AdfToMarkdownConverter {
  private rootDocument?: AdfNode;
  private allNodes: AdfNode[] = [];

  /**
   * Converts a node using centralized YAML generation logic.
   * This eliminates the need for each converter to handle YAML manually.
   */
  private convertWithCentralizedYaml(
    node: AdfNode, 
    converter: (node: AdfNode, children: MarkdownBlock[], level?: number, confluenceBaseUrl?: string, documentContext?: DocumentContext) => Promise<MarkdownBlock> | MarkdownBlock | ConverterResult | Promise<ConverterResult>,
    children: MarkdownBlock[],
    level?: number,
    confluenceBaseUrl?: string
  ): Promise<MarkdownBlock> | MarkdownBlock {
    // Create document context for converters that need it (like TOC)
    const documentContext: DocumentContext | undefined = 
      this.rootDocument ? {
        allNodes: this.allNodes,
        rootDocument: this.rootDocument
      } : undefined;

    const result = converter(node, children, level, confluenceBaseUrl, documentContext);
    
    // Handle both async and sync converters
    if (result instanceof Promise) {
      return result.then(res => this.processConverterResult(node, res));
    } else {
      return this.processConverterResult(node, result);
    }
  }

  /**
   * Processes converter result and generates YAML centrally.
   */
  private processConverterResult(node: AdfNode, result: MarkdownBlock | ConverterResult): MarkdownBlock {
    // If it's already a MarkdownBlock (legacy converter), return as-is
    if ('yamlBlock' in result && 'adfInfo' in result) {
      return result as MarkdownBlock;
    }

    // If it's a new ConverterResult, generate YAML centrally
    const converterResult = result as ConverterResult;
    const context = converterResult.context || {};
    
    // Force YAML generation if needsYaml is explicitly set, otherwise use smart logic
    let yamlBlock: string;
    if (context.needsYaml) {
      // For complex table cells, include additional metadata for reversibility
      if (node.type === 'tableCell' && context.hasComplexContent) {
        yamlBlock = generateYamlBlock({ 
          adfType: node.type, 
          ...node.attrs,
          hasComplexContent: true,
          contentType: 'mixed' // Indicates mixed paragraph and list content
        });
      } else {
        yamlBlock = generateYamlBlock({ adfType: node.type, ...node.attrs });
      }
    } else {
      yamlBlock = createSmartYamlBlock(node, context);
    }
      
    const adfInfo = {
      adfType: node.type,
      localId: (node.attrs?.localId as string) || (node.attrs?.id as string) || ''
    };

    return {
      yamlBlock,
      markdown: converterResult.markdown,
      adfInfo
    };
  }

  /**
   * Renderiza um bloco Markdown com comentários HTML otimizados.
   * Usa o novo formato que combina ADF-START com YAML em um único comentário.
   */
  private renderBlock(block: MarkdownBlock): string {
    const { yamlBlock, markdown, adfInfo } = block;
    
    // Se não há yamlBlock, retorna apenas o markdown (elemento simples)
    if (!yamlBlock) {
      return markdown;
    }
    
    // Se há yamlBlock, ele já inclui ADF-START com YAML combinado
    // Extrai localId do comentário ADF-START para garantir consistência
    const adfType = adfInfo?.adfType || 'unknown';
    
    // Extract localId from yamlBlock ADF-START comment for consistency
    const localIdMatch = yamlBlock.match(/localId="([^"]+)"/);
    const localId = localIdMatch ? localIdMatch[1] : (adfInfo?.localId || '');
    
    const endComment = `<!-- ADF-END adfType="${adfType}" localId="${localId}" -->`;
      
    return [yamlBlock, markdown, endComment].filter(Boolean).join('\n');
  }

  /**
   * Collects all nodes recursively for document context.
   */
  private collectAllNodes(node: AdfNode): void {
    this.allNodes.push(node);
    if (Array.isArray(node.content)) {
      node.content.forEach(child => this.collectAllNodes(child));
    }
  }

  /**
   * Converts a single ADF node to MarkdownBlock, processing children first.
   * @param node The ADF node to convert
   * @param level The nesting level (for lists)
   */
  async convertNode(node: AdfNode, level: number = 0, confluenceBaseUrl: string = ''): Promise<MarkdownBlock> {
    // If this is the root document, collect all nodes for context and reset footnote/annotation state
    if (node.type === 'doc' && !this.rootDocument) {
      this.rootDocument = node;
      this.allNodes = [];
      this.collectAllNodes(node);
      resetFootnoteState();
      resetAnnotationState();
    }
    const children = await this.convertChildren(node, level, confluenceBaseUrl);
    const converter = this.getConverter(node.type);
    
    let block: MarkdownBlock;
    
    // Use centralized YAML generation for all converters
    if (node.type === 'bulletList' || node.type === 'orderedList' || node.type === 'taskList') {
      block = await Promise.resolve(this.convertWithCentralizedYaml(node, converter, children, level, confluenceBaseUrl));
    } else {
      block = await Promise.resolve(this.convertWithCentralizedYaml(node, converter, children, undefined, confluenceBaseUrl));
    }
    
    // Se for doc, não aplica renderBlock aqui (será feito na montagem final)
    if (node.type === 'doc') {
      // Para doc, renderiza todos os filhos já formatados
      let markdown = children.map(child => this.renderBlock(child)).join('\n\n');
      
      // Append footnote content at the end of the document
      const footnoteContent = getFootnoteContent();
      if (footnoteContent) {
        markdown += footnoteContent;
      }
      
      // Append annotation content (processed in MarkdownRenderer)
      const annotationContent = getAnnotationContent();
      if (annotationContent) {
        markdown += annotationContent;
      }
      
      return { yamlBlock: '', markdown, adfInfo: { adfType: 'doc' } };
    }

    return block;
  }

  /**
   * Converts all children of a node (if any) to MarkdownBlocks.
   * @param node The parent ADF node
   * @param level The nesting level (for lists)
   */
  async convertChildren(node: AdfNode, level: number = 0, confluenceBaseUrl: string = ''): Promise<MarkdownBlock[]> {
    if (!Array.isArray(node.content)) {return [];} 
    
    return Promise.all(node.content.map(child => {
      if (child.type === 'bulletList' || child.type === 'orderedList' || child.type === 'taskList') {
        // Increment level for nested lists inside listItems
        const isParentListItem = node.type === 'listItem';
        const childLevel = isParentListItem ? level + 1 : level;
        return this.convertNode(child, childLevel, confluenceBaseUrl);
      } else {
        return this.convertNode(child, level, confluenceBaseUrl);
      }
    }));
  }

  /**
   * Returns the converter function for a given node type.
   * If not implemented, returns a function that puts the original node in the yamlBlock.
   * @param type Node type
   */
  getConverter(type: string): (node: AdfNode, children: MarkdownBlock[], level?: number, confluenceBaseUrl?: string, documentContext?: DocumentContext) => Promise<MarkdownBlock> | MarkdownBlock | ConverterResult | Promise<ConverterResult> {
    if (type === 'doc') {return convertDoc;}
    if (type === 'paragraph') {return convertParagraph;}
    if (type === 'heading') {return convertHeading;}
    if (type === 'table') {return convertTable;}
    if (type === 'tableRow') {return convertTableRow;}
    if (type === 'tableHeader') {return convertTableHeader;}
    if (type === 'tableCell') {return convertTableCell;}
    if (type === 'text') {return convertText;}
    if (type === 'bulletList') {return convertBulletList;}
    if (type === 'listItem') {return convertListItem;}
    if (type === 'orderedList') {return convertOrderedList;}
    if (type === 'taskList') {return convertTaskList;}
    if (type === 'taskItem') {return convertTaskItem;}
    if (type === 'strong') {return convertStrong;}
    if (type === 'code') {return convertCode;}
    if (type === 'link') {return convertLink;}
    if (type === 'blockCard') {return convertBlockCard;}
    if (type === 'inlineCard') {return convertInlineCard;}
    if (type === 'embedCard') {return convertEmbedCard;}
    if (type === 'codeBlock') {return convertCodeBlock;}
    if (type === 'rule') {return convertRule;}
    if (type === 'expand') {return convertExpand;}
    if (type === 'panel') {return convertPanel;}
    if (type === 'status') {return convertStatus;}
    if (type === 'date') {return convertDate;}
    if (type === 'emoji' || type === 'emoticon') {return convertEmoji;}
    if (type === 'mention') {return convertMention;}
    if (type === 'hardBreak') {return convertHardBreak;}
    if (type === 'extension') {return convertExtension;}
    if (type === 'bodiedExtension') {return convertBodiedExtension;}
    if (type === 'math' || type === 'mathBlock' || type === 'easy-math-block') {return convertMathBlock;}
    if (type === 'footnote' || type === 'footnoteReference' || type === 'footnoteDefinition') {return convertFootnote;}
    if (type === 'annotation' || type === 'annotationReference' || type === 'annotationDefinition') {return convertAnnotation;}
    return (node, children) => ({
      yamlBlock: generateYamlBlock({ adfType: 'not-implemented', originalNode: node }),
      markdown: ''
    });
  }
}




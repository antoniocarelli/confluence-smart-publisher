import MarkdownIt from 'markdown-it';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import hljs from 'highlight.js';
// @ts-ignore
import footnotePlugin from 'markdown-it-footnote';

// Import custom admonition plugin
import { admonitionPlugin } from '../plugins/admonition-plugin';

/**
 * MarkdownRenderer class responsible for converting CommonMark-compliant Markdown content
 * to HTML with Material for MkDocs styling, enhanced plugin support, and syntax highlighting.
 * Supports CommonMark Spec v0.31.2 features and GitHub Flavored Markdown extensions.
 */
export class MarkdownRenderer {
    private md: MarkdownIt;
    private extensionUri: vscode.Uri;
    private globalAnnotationDefinitions: Map<string, string> = new Map();

    constructor(extensionUri: vscode.Uri) {
        this.extensionUri = extensionUri;
        
        // Configure markdown-it for CommonMark compliance
        this.md = new MarkdownIt({
            html: true,           // Enable HTML tags in source
            xhtmlOut: false,      // Use ">" for single tags (not "/>")
            breaks: false,        // Convert \n in paragraphs into <br> (disabled for CommonMark)
            linkify: true,        // Autoconvert URL-like text to links
            typographer: true,    // Enable smartquotes and other typographic replacements
            quotes: '""\'\'',     // Quote characters for typographer
            highlight: this.highlightCode.bind(this)
        });

        // Load plugins for enhanced CommonMark support
        this.loadMarkdownPlugins();
        
        // Configure footnotes for Material for MkDocs styling
        this.configureFootnotes();
    }

    /**
     * Loads markdown-it plugins to support CommonMark and GFM features
     */
    private loadMarkdownPlugins(): void {
        try {
            // Custom admonitions plugin (replaces markdown-it-admonition)
            this.md.use(admonitionPlugin);
            console.log('[Plugin Debug] Custom admonition plugin loaded successfully');

            // Footnotes plugin for Material for MkDocs support
            this.md.use(footnotePlugin);
            console.log('[Plugin Debug] markdown-it-footnote plugin loaded successfully');

            // Note: Additional plugins can be loaded here as needed
            // For now, we focus on the core plugins that support our CommonMark output
            
        } catch (error) {
            console.error('[Plugin Debug] Error loading markdown-it plugins:', error);
            // Fallback configuration - try to load the plugin without options
            try {
                this.md.use(admonitionPlugin);
                this.md.use(footnotePlugin);
                console.log('[Plugin Debug] Plugins loaded via fallback');
            } catch (fallbackError) {
                console.error('[Plugin Debug] Fallback plugin loading failed:', fallbackError);
            }
        }
    }

    /**
     * Configure footnotes for Material for MkDocs styling
     */
    private configureFootnotes(): void {
        // Override footnote renderer for Material for MkDocs styling
        this.md.renderer.rules.footnote_ref = (tokens, idx, options, env, renderer) => {
            const id = tokens[idx].meta.id;
            const refid = tokens[idx].meta.refid;
            
            return `<sup id="fnref:${id}">
                <a href="#fn:${id}" class="footnote-ref" data-footnote-id="${id}">${refid}</a>
            </sup>`;
        };

        this.md.renderer.rules.footnote_block_open = () => {
            return '<div class="footnote">\n<ol>\n';
        };

        this.md.renderer.rules.footnote_block_close = () => {
            return '</ol>\n</div>\n';
        };

        this.md.renderer.rules.footnote_anchor = (tokens, idx, options, env, renderer) => {
            const id = tokens[idx].meta.id;
            
            return `<a href="#fnref:${id}" class="footnote-backref">↩</a>`;
        };
    }

    /**
     * Enhanced syntax highlighting for code blocks using highlight.js
     * Supports major programming languages with proper CSS classes and highlighting
     * @param str Code content
     * @param lang Language identifier
     * @returns Highlighted HTML
     */
    private highlightCode(str: string, lang: string): string {
        if (!lang || !lang.trim()) {
            // No language specified - return plain code block
            return `<pre class="hljs"><code>${this.escapeHtml(str)}</code></pre>`;
        }

        const normalizedLang = this.normalizeLangName(lang.trim().toLowerCase());
        
        try {
            // Check if language is supported by highlight.js
            if (hljs.getLanguage(normalizedLang)) {
                const highlighted = hljs.highlight(str, { language: normalizedLang });
                return `<pre class="hljs"><code class="hljs language-${normalizedLang}">${highlighted.value}</code></pre>`;
            } else {
                // Language not supported - try auto-detection
                const autoHighlighted = hljs.highlightAuto(str);
                const detectedLang = autoHighlighted.language || 'text';
                console.log(`[Highlight Debug] Auto-detected language: ${detectedLang} for requested: ${lang}`);
                return `<pre class="hljs"><code class="hljs language-${detectedLang}">${autoHighlighted.value}</code></pre>`;
            }
        } catch (err) {
            console.warn(`[Highlight Debug] Error highlighting code for language '${lang}':`, err);
            // Fallback to plain text with language class
            return `<pre class="hljs"><code class="hljs language-${this.escapeHtml(normalizedLang)}">${this.escapeHtml(str)}</code></pre>`;
        }
    }

    /**
     * Normalizes language names to match highlight.js expectations
     * @param lang Original language name
     * @returns Normalized language name
     */
    private normalizeLangName(lang: string): string {
        const langMap: { [key: string]: string } = {
            // Common aliases to standard names
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'cs': 'csharp',
            'c#': 'csharp',
            'md': 'markdown',
            'sh': 'bash',
            'shell': 'bash',
            'yml': 'yaml',
            'jsx': 'javascript',
            'tsx': 'typescript',
            'golang': 'go',
            'kt': 'kotlin',
            'rb': 'ruby',
            'ps1': 'powershell',
            'psm1': 'powershell',
            'dockerfile': 'docker',
            'makefile': 'make',
            'cmake': 'cmake',
            'toml': 'ini', // Similar enough for basic highlighting
            'properties': 'ini',
            'conf': 'ini',
            'config': 'ini'
        };

        return langMap[lang] || lang;
    }

    /**
     * Renders CommonMark-compliant markdown content to HTML with Material for MkDocs styling
     * @param content Markdown content to render
     * @param documentUri URI of the document being rendered (for relative paths)
     * @returns HTML string with embedded CSS
     */
    public renderToHtml(content: string, documentUri?: vscode.Uri): string {
        // Pre-process markdown for annotations
        const processedContent = this.preprocessMarkdown(content);
        
        let htmlContent = this.md.render(processedContent);
        
        // Post-process HTML to fix any structural issues
        htmlContent = this.fixAdmonitionHtml(htmlContent);
        
        // Process annotations in HTML
        htmlContent = this.replaceAnnotationReferences(htmlContent);
        
        // Debug: Log generated HTML structure
        console.log('[HTML Debug] Generated HTML structure:');
        console.log(htmlContent.substring(0, 500) + '...');
        
        const cssContent = this.getMaterialCss();
        const highlightCss = this.getHighlightCss();
        
        return `<!DOCTYPE html>
<html lang="en" data-md-color-scheme="slate">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <style>
        ${cssContent}
        
        ${highlightCss}
        
        /* Material for MkDocs Official CSS for Footnotes and Annotations */
        :root {
            --md-annotation-bg-icon: url("data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z'/></svg>");
            --md-annotation-icon: url("data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z'/></svg>");
            --md-tooltip-width: 20rem;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .md-tooltip {
            position: absolute;
            z-index: 1000;
            background-color: var(--md-default-bg-color);
            border: 1px solid var(--md-default-fg-color--lighter);
            border-radius: 0.25rem;
            box-shadow: 0 0.2rem 0.5rem rgba(0,0,0,0.3);
            font-size: 0.8rem;
            max-width: var(--md-tooltip-width);
            opacity: 0;
            pointer-events: none;
            transform: translateY(-0.5rem);
            transition: opacity 0.25s cubic-bezier(0.1, 0.7, 0.1, 1), transform 0.25s cubic-bezier(0.1, 0.7, 0.1, 1);
        }

        .md-tooltip--active {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
        }

        .md-tooltip--inline {
            display: inline-block;
        }

        .md-tooltip__inner {
            padding: 0.75rem;
            color: var(--md-default-fg-color);
            line-height: 1.4;
        }

        .md-annotation {
            display: inline;
            line-height: 1;
            outline: none;
            position: relative;
            vertical-align: text-top;
        }

        .md-annotation__index {
            color: var(--md-default-fg-color--light);
            cursor: pointer;
            display: inline-block;
            font-size: 0.8rem;
            font-weight: 400;
            height: 2.2ch;
            line-height: 2.2ch;
            margin: 0 0.4ch;
            outline: none;
            overflow: hidden;
            position: relative;
            text-align: center;
            transition: color 0.25s cubic-bezier(0.1, 0.7, 0.1, 1), transform 0.25s cubic-bezier(0.1, 0.7, 0.1, 1);
            user-select: none;
            vertical-align: text-top;
            width: 2.2ch;
            z-index: 0;
        }

        .md-annotation__index::before {
            background-color: var(--md-default-fg-color--lighter);
            border-radius: 50%;
            content: "";
            height: 2.2ch;
            left: 0;
            mask-image: var(--md-annotation-bg-icon);
            mask-position: center;
            mask-repeat: no-repeat;
            mask-size: contain;
            position: absolute;
            top: 0;
            transition: background-color 0.25s cubic-bezier(0.1, 0.7, 0.1, 1), transform 0.25s cubic-bezier(0.1, 0.7, 0.1, 1);
            width: 2.2ch;
            z-index: -1;
        }

        .md-annotation__index[data-md-annotation-id]::after {
            background-color: var(--md-primary-fg-color);
            border-radius: 50%;
            color: var(--md-primary-bg-color);
            content: "";
            height: 2.2ch;
            left: 0;
            mask-image: var(--md-annotation-icon);
            mask-position: center;
            mask-repeat: no-repeat;
            mask-size: contain;
            position: absolute;
            top: 0;
            transition: background-color 0.25s cubic-bezier(0.1, 0.7, 0.1, 1);
            width: 2.2ch;
            z-index: 0;
        }

        .md-annotation__index:hover::before,
        .md-annotation__index:focus::before {
            background-color: var(--md-accent-fg-color);
            transform: scale(1.1);
        }

        .md-annotation__index:hover[data-md-annotation-id]::after,
        .md-annotation__index:focus[data-md-annotation-id]::after {
            background-color: var(--md-accent-fg-color);
            animation: pulse 2000ms infinite;
        }

        .md-annotation[data-md-visible] .md-annotation__index {
            color: var(--md-accent-fg-color);
            transform: rotate(45deg);
        }

        /* Footnote styling */
        .footnote-ref {
            color: var(--md-primary-fg-color);
            text-decoration: none;
            font-size: 0.8em;
            transition: color 0.25s cubic-bezier(0.1, 0.7, 0.1, 1);
        }

        .footnote-ref:hover {
            color: var(--md-accent-fg-color);
        }

        .footnote {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid var(--md-default-fg-color--lighter);
        }

        .footnote ol {
            list-style: decimal;
            padding-left: 1.5rem;
        }

        .footnote-backref {
            color: var(--md-primary-fg-color);
            text-decoration: none;
            margin-left: 0.5rem;
        }

        .footnote-tooltip {
            background-color: var(--md-default-bg-color);
            border: 1px solid var(--md-default-fg-color--lighter);
            border-radius: 0.25rem;
            box-shadow: 0 0.2rem 0.5rem rgba(0,0,0,0.3);
            color: var(--md-default-fg-color);
            font-size: 0.8rem;
            line-height: 1.4;
            max-width: 20rem;
            padding: 0.75rem;
            position: absolute;
            z-index: 1000;
        }

        .footnote-tooltip p,
        .md-tooltip__inner p {
            margin: 0 0 0.5rem 0;
        }

        .footnote-tooltip p:last-child,
        .md-tooltip__inner p:last-child {
            margin-bottom: 0;
        }

        .footnote-tooltip ul,
        .footnote-tooltip ol,
        .md-tooltip__inner ul,
        .md-tooltip__inner ol {
            margin: 0.5rem 0;
            padding-left: 1.5rem;
        }

        .footnote-tooltip li,
        .md-tooltip__inner li {
            margin: 0.25rem 0;
        }

        .footnote-tooltip code,
        .md-tooltip__inner code {
            background-color: var(--md-code-bg-color);
            color: var(--md-code-fg-color);
            font-size: 0.75rem;
            padding: 0.1rem 0.3rem;
            border-radius: 0.1rem;
        }

        .footnote-tooltip a,
        .md-tooltip__inner a {
            color: var(--md-primary-fg-color);
            text-decoration: none;
        }

        .footnote-tooltip a:hover,
        .md-tooltip__inner a:hover {
            color: var(--md-accent-fg-color);
            text-decoration: underline;
        }

        .footnote-tooltip strong,
        .md-tooltip__inner strong {
            font-weight: 600;
        }

        .footnote-tooltip em,
        .md-tooltip__inner em {
            font-style: italic;
        }

        .footnote-tooltip blockquote,
        .md-tooltip__inner blockquote {
            border-left: 2px solid var(--md-default-fg-color--lighter);
            margin: 0.5rem 0;
            padding-left: 0.75rem;
            font-style: italic;
        }

        .footnote-tooltip pre,
        .md-tooltip__inner pre {
            background-color: var(--md-code-bg-color);
            padding: 0.5rem;
            border-radius: 0.25rem;
            overflow-x: auto;
            font-size: 0.7rem;
        }

        .footnote-tooltip hr,
        .md-tooltip__inner hr {
            border: none;
            border-top: 1px solid var(--md-default-fg-color--lighter);
            margin: 0.75rem 0;
        }
        
        /* Enhanced styles for CommonMark compliance */
        .md-typeset table {
            border-collapse: collapse;
            margin: 1.5em 0;
            width: 100%;
        }
        
        .md-typeset table th,
        .md-typeset table td {
            border: 1px solid var(--md-default-fg-color--lighter);
            padding: 0.75em;
            text-align: left;
        }
        
        .md-typeset table th {
            background-color: var(--md-default-fg-color--lightest);
            font-weight: bold;
        }
        
        /* Better list styling for CommonMark compliance */
        .md-typeset ul,
        .md-typeset ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        
        .md-typeset li {
            margin: 0.25em 0;
        }
        
        .md-typeset li > p {
            margin: 0.5em 0;
        }
        
        /* Enhanced code block styling with syntax highlighting */
        .md-typeset pre {
            margin: 1.5em 0;
            overflow-x: auto;
            border-radius: 0.25rem;
            background-color: var(--md-code-bg-color, #2d3748) !important;
        }
        
        .md-typeset pre.hljs {
            padding: 1em;
            line-height: 1.5;
            font-family: 'SFMono-Regular', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
            font-size: 0.85em;
        }
        
        .md-typeset code {
            background-color: var(--md-code-bg-color, #2d3748);
            color: var(--md-code-fg-color, #e2e8f0);
            padding: 0.1em 0.4em;
            border-radius: 0.1rem;
            font-size: 0.85em;
            font-family: 'SFMono-Regular', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
        }
        
        /* Ensure highlighted code blocks have proper contrast */
        .md-typeset pre code.hljs {
            background: transparent;
            padding: 0;
        }
    </style>
</head>
<body data-md-color-scheme="slate">
    <div class="md-container">
        <main class="md-main">
            <div class="md-grid">
                <div class="md-content">
                    <article class="md-content__inner md-typeset">
                        ${htmlContent}
                    </article>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Global annotation definitions storage
        window.annotationDefinitions = new Map(${JSON.stringify(Array.from(this.globalAnnotationDefinitions.entries()))});

        let currentTooltip = null;

        // Tooltip creation function
        function createTooltip() {
            const tooltip = document.createElement('div');
            tooltip.className = 'footnote-tooltip';
            tooltip.style.display = 'none';
            document.body.appendChild(tooltip);
            return tooltip;
        }

        // Get footnote content
        function getFootnoteContent(footnoteId) {
            const footnoteElement = document.querySelector('#fn\\\\:' + footnoteId + ' p');
            if (footnoteElement) {
                // Clone content and remove the back-reference link
                const content = footnoteElement.cloneNode(true);
                const backref = content.querySelector('.footnote-backref');
                if (backref) backref.remove();
                return content.innerHTML;
            }
            return null;
        }

        // Get annotation content
        function getAnnotationContent(annotationId) {
            const content = window.annotationDefinitions.get(annotationId);
            if (content) {
                return content;
            }
            return null;
        }

        // Position tooltip
        function positionTooltip(tooltip, targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            let top = rect.top - tooltipRect.height - 10;
            
            // Adjust if tooltip goes outside viewport
            const padding = 10;
            if (left < padding) left = padding;
            if (left + tooltipRect.width > window.innerWidth - padding) {
                left = window.innerWidth - tooltipRect.width - padding;
            }
            if (top < padding) {
                top = rect.bottom + 10;
            }
            
            tooltip.style.left = left + window.scrollX + 'px';
            tooltip.style.top = top + window.scrollY + 'px';
        }

        // Show tooltip
        function showTooltip(content, targetElement) {
            hideTooltip();
            
            const tooltip = createTooltip();
            tooltip.innerHTML = content;
            tooltip.style.display = 'block';
            
            // Position tooltip
            requestAnimationFrame(() => {
                positionTooltip(tooltip, targetElement);
                tooltip.style.opacity = '1';
            });
            
            currentTooltip = tooltip;
        }

        // Hide tooltip
        function hideTooltip() {
            if (currentTooltip) {
                currentTooltip.remove();
                currentTooltip = null;
            }
        }

        // Material for MkDocs tooltip functions
        function createMaterialTooltip() {
            const tooltip = document.createElement('div');
            tooltip.className = 'md-tooltip md-tooltip--inline';
            
            const inner = document.createElement('div');
            inner.className = 'md-tooltip__inner';
            tooltip.appendChild(inner);
            
            document.body.appendChild(tooltip);
            return { tooltip, inner };
        }

        function showMaterialTooltip(content, targetElement, annotationId) {
            hideMaterialTooltip();
            
            const { tooltip, inner } = createMaterialTooltip();
            inner.innerHTML = content;
            
            // Position using CSS variables
            const rect = targetElement.getBoundingClientRect();
            const x = rect.left + (rect.width / 2);
            const y = rect.top;
            
            document.documentElement.style.setProperty('--md-tooltip-x', x + 'px');
            document.documentElement.style.setProperty('--md-tooltip-y', y + 'px');
            
            // Position tooltip
            tooltip.style.left = x + window.scrollX + 'px';
            tooltip.style.top = (y + window.scrollY - 10) + 'px';
            tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
            
            // Make links clickable
            const links = inner.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Allow default link behavior
                });
            });
            
            // Activate tooltip
            requestAnimationFrame(() => {
                tooltip.classList.add('md-tooltip--active');
            });
            
            currentTooltip = tooltip;
        }

        function hideMaterialTooltip() {
            if (currentTooltip) {
                currentTooltip.classList.remove('md-tooltip--active');
                setTimeout(() => {
                    if (currentTooltip) {
                        currentTooltip.remove();
                        currentTooltip = null;
                    }
                }, 250);
            }
        }

        // Event listeners for footnotes (hover)
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('footnote-ref')) {
                const footnoteId = e.target.getAttribute('data-footnote-id');
                const content = getFootnoteContent(footnoteId);
                if (content) {
                    showTooltip(content, e.target);
                }
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('footnote-ref')) {
                hideTooltip();
            }
        });

        // Event listeners for annotations (click)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('md-annotation__index') || 
                e.target.closest('.md-annotation__index')) {
                
                e.preventDefault();
                e.stopPropagation();
                
                const indexElement = e.target.closest('.md-annotation__index') || e.target;
                const annotationId = indexElement.querySelector('[data-md-annotation-id]')?.getAttribute('data-md-annotation-id');
                
                if (annotationId) {
                    const content = getAnnotationContent(annotationId);
                    if (content) {
                        showMaterialTooltip(content, indexElement, annotationId);
                        
                        // Toggle visible state
                        const annotation = indexElement.closest('.md-annotation');
                        if (annotation) {
                            annotation.setAttribute('data-md-visible', '');
                        }
                    }
                }
            } else {
                // Click outside - hide annotation tooltips
                hideMaterialTooltip();
                
                // Remove visible state from all annotations
                document.querySelectorAll('.md-annotation[data-md-visible]').forEach(annotation => {
                    annotation.removeAttribute('data-md-visible');
                });
            }
        });

        // Keep tooltip visible when hovering over it
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.footnote-tooltip') || e.target.closest('.md-tooltip')) {
                // Keep current tooltip
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('.footnote-tooltip') || e.target.closest('.md-tooltip')) {
                if (!e.relatedTarget || (!e.relatedTarget.closest('.footnote-tooltip') && 
                    !e.relatedTarget.closest('.md-tooltip') && 
                    !e.relatedTarget.classList.contains('footnote-ref'))) {
                    hideTooltip();
                    hideMaterialTooltip();
                }
            }
        });

        // Hide tooltips on scroll and resize
        window.addEventListener('scroll', () => {
            hideTooltip();
            hideMaterialTooltip();
        });

        window.addEventListener('resize', () => {
            hideTooltip();
            hideMaterialTooltip();
        });
    </script>
</body>
</html>`;
    }

    /**
     * Post-processes HTML to fix admonition structure issues
     * @param html Raw HTML from markdown-it
     * @returns Fixed HTML
     */
    private fixAdmonitionHtml(html: string): string {
        // Since our custom admonition plugin now works correctly, 
        // we only need basic validation without complex regex manipulation
        let processedHtml = html;
        
        // Count opening and closing admonition divs for debugging
        const admonitionOpening = (processedHtml.match(/<div[^>]*class="[^"]*admonition[^"]*"/g) || []).length;
        const totalClosingDivs = (processedHtml.match(/<\/div>/g) || []).length;
        
        console.log('[HTML Fix] Admonition divs:', admonitionOpening, 'Total closing divs:', totalClosingDivs);
        
        // Only log if there's a major structural issue - don't try to fix automatically
        if (admonitionOpening > 0) {
            const totalOpeningDivs = (processedHtml.match(/<div[^>]*>/g) || []).length;
            console.log('[HTML Fix] All opening divs:', totalOpeningDivs, 'All closing divs:', totalClosingDivs);
            
            if (totalOpeningDivs !== totalClosingDivs) {
                console.warn('[HTML Fix] WARNING: Mismatched div count detected, but leaving HTML as-is since plugin generates correct structure');
            }
        }
        
        return processedHtml;
    }

    /**
     * Renders only the HTML content without wrapper
     * @param content Markdown content to render
     * @returns HTML string
     */
    public renderContent(content: string): string {
        const htmlContent = this.md.render(content);
        
        // Debug: Log the complete HTML for debugging
        console.log('[HTML Debug] Complete HTML output:');
        console.log(htmlContent);
        
        // Check for unclosed admonition tags
        const admonitionMatches = htmlContent.match(/<div[^>]*class="[^"]*admonition[^"]*"/g);
        const closingDivs = htmlContent.match(/<\/div>/g);
        
        console.log('[HTML Debug] Admonition divs found:', admonitionMatches?.length || 0);
        console.log('[HTML Debug] Closing divs found:', closingDivs?.length || 0);
        
        return htmlContent;
    }

    /**
     * Escapes HTML entities in text
     * @param text Text to escape
     * @returns Escaped text
     */
    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    /**
     * Returns Material for MkDocs CSS styles
     * Loads CSS files from assets/css/ directory if available, otherwise uses fallback
     * @returns CSS string
     */
    private getMaterialCss(): string {
        // Only load SCSS files that we can properly process
        const scssFiles = [
            'palette.scss',
            'admonitions.scss'
        ];
        
        let combinedCss = '';
        
        for (const file of scssFiles) {
            try {
                const cssPath = path.join(this.extensionUri.fsPath, 'assets', 'css', file);
                if (fs.existsSync(cssPath)) {
                    let content = fs.readFileSync(cssPath, 'utf-8');
                    console.log(`[CSS Debug] Loading ${file}, original size: ${content.length}`);
                    
                    // Process SCSS content
                    content = this.processSCSSVariables(content);
                    console.log(`[CSS Debug] Processed ${file}, final size: ${content.length}`);
                    
                    combinedCss += `\n/* === ${file} === */\n` + content + '\n';
                }
            } catch (error) {
                console.warn(`Could not load CSS file: ${file}`, error);
            }
        }
        
        // Always include our enhanced fallback CSS as base
        const fallbackCss = this.getEnhancedFallbackCss();
        console.log(`[CSS Debug] Total CSS size: ${(fallbackCss + combinedCss).length} characters`);
        
        // Make sure admonition-specific styles come after base styles
        return fallbackCss + '\n' + combinedCss + '\n' + this.getAdmonitionSpecificStyles();
    }

    /**
     * Returns enhanced admonition-specific styles that override base styles
     * @returns CSS string with specific admonition styles
     */
    private getAdmonitionSpecificStyles(): string {
        return `
/* Enhanced Admonition Type-Specific Styles */
.md-typeset .admonition.note {
    border-color: #448aff !important;
}
.md-typeset .admonition.note > .admonition-title {
    background-color: rgba(68, 138, 255, 0.1) !important;
}

.md-typeset .admonition.tip {
    border-color: #00bfa5 !important;
}
.md-typeset .admonition.tip > .admonition-title {
    background-color: rgba(0, 191, 165, 0.1) !important;
}

.md-typeset .admonition.warning {
    border-color: #ff9100 !important;
}
.md-typeset .admonition.warning > .admonition-title {
    background-color: rgba(255, 145, 0, 0.1) !important;
}

.md-typeset .admonition.danger {
    border-color: #ff1744 !important;
}
.md-typeset .admonition.danger > .admonition-title {
    background-color: rgba(255, 23, 68, 0.1) !important;
}

.md-typeset .admonition.success {
    border-color: #00c853 !important;
}
.md-typeset .admonition.success > .admonition-title {
    background-color: rgba(0, 200, 83, 0.1) !important;
}

.md-typeset .admonition.info {
    border-color: #00b8d4 !important;
}
.md-typeset .admonition.info > .admonition-title {
    background-color: rgba(0, 184, 212, 0.1) !important;
}

.md-typeset .admonition.question {
    border-color: #64dd17 !important;
}
.md-typeset .admonition.question > .admonition-title {
    background-color: rgba(100, 221, 23, 0.1) !important;
}

.md-typeset .admonition.quote {
    border-color: #9e9e9e !important;
}
.md-typeset .admonition.quote > .admonition-title {
    background-color: rgba(158, 158, 158, 0.1) !important;
}

.md-typeset .admonition.abstract {
    border-color: #00bcd4 !important;
}
.md-typeset .admonition.abstract > .admonition-title {
    background-color: rgba(0, 188, 212, 0.1) !important;
}

.md-typeset .admonition.bug {
    border-color: #f50057 !important;
}
.md-typeset .admonition.bug > .admonition-title {
    background-color: rgba(245, 0, 87, 0.1) !important;
}

.md-typeset .admonition.example {
    border-color: #7c4dff !important;
}
.md-typeset .admonition.example > .admonition-title {
    background-color: rgba(124, 77, 255, 0.1) !important;
}

.md-typeset .admonition.failure {
    border-color: #ff5252 !important;
}
.md-typeset .admonition.failure > .admonition-title {
    background-color: rgba(255, 82, 82, 0.1) !important;
}
        `;
    }

    /**
     * Basic SCSS variable processing
     * @param scss SCSS content
     * @returns Processed CSS
     */
    private processSCSSVariables(scss: string): string {
        // Basic color variables from Material Design
        const colorMap: { [key: string]: string } = {
            '$clr-blue-a200': '#448aff',
            '$clr-light-blue-a400': '#00bcd4',
            '$clr-cyan-a700': '#00b8d4',
            '$clr-teal-a700': '#00bfa5',
            '$clr-green-a700': '#00c853',
            '$clr-light-green-a700': '#64dd17',
            '$clr-orange-a400': '#ff9100',
            '$clr-red-a200': '#ff5252',
            '$clr-red-a400': '#ff1744',
            '$clr-pink-a400': '#f50057',
            '$clr-deep-purple-a200': '#7c4dff',
            '$clr-grey': '#9e9e9e'
        };

        // Remove SCSS comments and imports
        let css = scss
            .replace(/\/\/\/.*$/gm, '') // Remove triple slash comments
            .replace(/\/\/.*$/gm, '')   // Remove double slash comments
            .replace(/@import.*?;/g, '') // Remove imports
            .replace(/@use.*?;/g, '')    // Remove use statements
            .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments

        // Process SCSS functions
        css = this.processSCSSFunctions(css);

        // Replace color variables
        for (const [variable, color] of Object.entries(colorMap)) {
            css = css.replace(new RegExp('\\' + variable, 'g'), color);
        }

        // Remove SCSS specific syntax
        css = css
            .replace(/\$[a-zA-Z0-9-_]+:/g, '--') // Convert SCSS variables to CSS custom properties
            .replace(/!default/g, '') // Remove !default
            .replace(/@use\s+["'][^"']+["']/g, '') // Remove @use statements
            .replace(/\$admonitions:\s*\([^)]+\)\s*!default;/s, ''); // Remove admonition map

        return css;
    }

    /**
     * Processes SCSS functions like px2rem, px2em and @each loops
     * @param scss SCSS content
     * @returns Processed CSS
     */
    private processSCSSFunctions(scss: string): string {
        let css = scss;

        // Replace px2rem() function - assuming 16px base font size
        css = css.replace(/px2rem\((\d+(?:\.\d+)?)px?\)/g, (match, pixels) => {
            const rem = parseFloat(pixels) / 16;
            return `${rem}rem`;
        });

        // Replace px2em() function - assuming 16px base font size
        css = css.replace(/px2em\((\d+(?:\.\d+)?)px?,?\s*(\d+(?:\.\d+)?)px?\)/g, (match, pixels, base) => {
            const em = parseFloat(pixels) / parseFloat(base);
            return `${em}em`;
        });

        css = css.replace(/px2em\((\d+(?:\.\d+)?)px?\)/g, (match, pixels) => {
            const em = parseFloat(pixels) / 16;
            return `${em}em`;
        });

        // Process admonition @each loop specifically
        css = this.processAdmonitionEachLoop(css);

        // Remove other complex SCSS syntax
        css = css
            .replace(/@each\s+[^{]+\{[^}]*\}/gs, '') // Remove remaining @each loops after processing
            .replace(/color\.adjust\([^)]+\)/g, 'rgba(0,0,0,0.1)') // Replace color.adjust with fallback
            .replace(/list\.nth\([^)]+\)/g, '""') // Replace list.nth with empty string
            .replace(/svg-load\([^)]+\)/g, '""'); // Replace svg-load with empty string

        return css;
    }

    /**
     * Processes the specific @each loop for admonitions
     * @param scss SCSS content
     * @returns Processed CSS
     */
    private processAdmonitionEachLoop(scss: string): string {
        // Admonition types and their colors (matching the SCSS map)
        const admonitions = {
            'note': '#448aff',
            'abstract': '#00bcd4', 
            'info': '#00b8d4',
            'tip': '#00bfa5',
            'success': '#00c853',
            'question': '#64dd17',
            'warning': '#ff9100',
            'failure': '#ff5252',
            'danger': '#ff1744',
            'bug': '#f50057',
            'example': '#7c4dff',
            'quote': '#9e9e9e'
        };

        let css = scss;

        // Generate CSS for admonition icon variables in :root
        const rootIconVars = Object.keys(admonitions).map(name => 
            `  --md-admonition-icon--${name}: "";`
        ).join('\n');

        // Replace the :root @each loop with generated CSS
        css = css.replace(
            /:root\s*\{\s*@each[^}]+svg-load[^}]+\}\s*\}/gs, 
            `:root {\n${rootIconVars}\n}`
        );

        // Generate CSS for each admonition type
        let admonitionStyles = '';
        
        for (const [name, color] of Object.entries(admonitions)) {
            admonitionStyles += `
/* ${name.charAt(0).toUpperCase() + name.slice(1)} admonition */
.md-typeset .admonition.${name} {
    border-color: ${color};
}

.md-typeset .admonition.${name}:focus-within {
    box-shadow: 0 0 0 0.25rem ${color}19;
}

.md-typeset .${name} > .admonition-title {
    background-color: ${color}19;
}

.md-typeset .${name} > .admonition-title::before {
    background-color: ${color};
    mask-image: var(--md-admonition-icon--${name});
}

.md-typeset .${name} > .admonition-title::after {
    color: ${color};
}
`;
        }

        // Replace the large @each loop that generates admonition flavors
        // This captures the entire loop from "Define admonition flavors" comment
        css = css.replace(
            /\/\/ Define admonition flavors[\s\S]*?@each[\s\S]*?\}\s*\}/gs,
            `// Define admonition flavors${admonitionStyles}`
        );

        return css;
    }

    /**
     * Returns fallback CSS when Material for MkDocs files are not available
     * @returns CSS string
     */
    private getFallbackCss(): string {
        return `
/* Material for MkDocs Base Styles */
:root {
    --md-primary-fg-color: #1976d2;
    --md-primary-fg-color--light: #64b5f6;
    --md-primary-fg-color--dark: #0d47a1;
    --md-accent-fg-color: #ff5722;
    --md-default-bg-color: #ffffff;
    --md-default-fg-color: #000000;
    --md-default-fg-color--light: #8a8a8a;
    --md-default-fg-color--lighter: #b3b3b3;
    --md-default-fg-color--lightest: #cccccc;
    --md-code-bg-color: #f5f5f5;
    --md-code-fg-color: #37474f;
    --md-admonition-note-color: #448aff;
    --md-admonition-tip-color: #00c853;
    --md-admonition-warning-color: #ff9100;
    --md-admonition-danger-color: #ff5252;
    --md-admonition-success-color: #00e676;
    --md-admonition-info-color: #00b8d4;
    --md-admonition-question-color: #9c27b0;
    --md-admonition-quote-color: #9e9e9e;
}

* {
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
    color: var(--md-default-fg-color);
    background-color: var(--md-default-bg-color);
    margin: 0;
    padding: 20px;
}

.md-content {
    max-width: 1200px;
    margin: 0 auto;
}

.md-content__inner {
    padding: 0 16px;
}

.md-typeset {
    font-size: 16px;
    line-height: 1.6;
    color: var(--md-default-fg-color);
}

/* Headings */
.md-typeset h1,
.md-typeset h2,
.md-typeset h3,
.md-typeset h4,
.md-typeset h5,
.md-typeset h6 {
    margin: 1.25em 0 0.5em;
    font-weight: 400;
    letter-spacing: -0.01em;
    color: var(--md-default-fg-color);
}

.md-typeset h1 {
    font-size: 2.5em;
    font-weight: 300;
    letter-spacing: -0.02em;
}

.md-typeset h2 {
    font-size: 2em;
    font-weight: 300;
    letter-spacing: -0.01em;
}

.md-typeset h3 {
    font-size: 1.5em;
    font-weight: 400;
}

.md-typeset h4 {
    font-size: 1.25em;
    font-weight: 500;
}

.md-typeset h5 {
    font-size: 1.125em;
    font-weight: 500;
}

.md-typeset h6 {
    font-size: 1em;
    font-weight: 500;
}

/* Paragraphs */
.md-typeset p {
    margin: 0 0 1em;
}

/* Lists */
.md-typeset ul,
.md-typeset ol {
    margin: 0 0 1em;
    padding-left: 1.5em;
}

.md-typeset li {
    margin: 0.25em 0;
}

/* Code */
.md-typeset code {
    background-color: var(--md-code-bg-color);
    color: var(--md-code-fg-color);
    padding: 0.125em 0.25em;
    border-radius: 0.125em;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.85em;
}

.md-typeset pre {
    background-color: var(--md-code-bg-color);
    color: var(--md-code-fg-color);
    border-radius: 0.25em;
    padding: 1em;
    margin: 1em 0;
    overflow-x: auto;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.85em;
    line-height: 1.4;
}

.md-typeset pre code {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
}

/* Tables */
.md-typeset table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    margin: 1em 0;
    border: 1px solid var(--md-default-fg-color--lightest);
}

.md-typeset th,
.md-typeset td {
    padding: 0.5em 1em;
    border-bottom: 1px solid var(--md-default-fg-color--lightest);
    text-align: left;
}

.md-typeset th {
    background-color: var(--md-code-bg-color);
    font-weight: 500;
}

/* Links */
.md-typeset a {
    color: var(--md-primary-fg-color);
    text-decoration: none;
}

.md-typeset a:hover {
    text-decoration: underline;
}

/* Blockquotes */
.md-typeset blockquote {
    border-left: 4px solid var(--md-default-fg-color--lightest);
    padding-left: 1em;
    margin: 1em 0;
    color: var(--md-default-fg-color--light);
}

/* Admonitions */
.admonition {
    margin: 1.5625em 0;
    padding: 0 0.75em;
    overflow: hidden;
    page-break-inside: avoid;
    border-left: 0.25em solid;
    border-radius: 0.125em;
    box-shadow: 0 0.25em 0.5em rgba(0, 0, 0, 0.05);
}

.admonition > :last-child {
    margin-bottom: 0.75em;
}

.admonition-title {
    position: relative;
    margin: 0 -0.75em 0.75em;
    padding: 0.5em 0.75em 0.5em 2.5em;
    font-weight: 700;
    background-color: rgba(68, 138, 255, 0.1);
}

.admonition-title::before {
    position: absolute;
    top: 0.5em;
    left: 0.75em;
    width: 1.25em;
    height: 1.25em;
    content: attr(data-icon);
}

/* Note admonition */
.admonition.note {
    border-color: var(--md-admonition-note-color);
}

.admonition.note > .admonition-title {
    background-color: rgba(68, 138, 255, 0.1);
}

/* Tip admonition */
.admonition.tip {
    border-color: var(--md-admonition-tip-color);
}

.admonition.tip > .admonition-title {
    background-color: rgba(0, 200, 83, 0.1);
}

/* Warning admonition */
.admonition.warning {
    border-color: var(--md-admonition-warning-color);
}

.admonition.warning > .admonition-title {
    background-color: rgba(255, 145, 0, 0.1);
}

/* Danger admonition */
.admonition.danger {
    border-color: var(--md-admonition-danger-color);
}

.admonition.danger > .admonition-title {
    background-color: rgba(255, 82, 82, 0.1);
}

/* Success admonition */
.admonition.success {
    border-color: var(--md-admonition-success-color);
}

.admonition.success > .admonition-title {
    background-color: rgba(0, 230, 118, 0.1);
}

/* Info admonition */
.admonition.info {
    border-color: var(--md-admonition-info-color);
}

.admonition.info > .admonition-title {
    background-color: rgba(0, 184, 212, 0.1);
}

/* Question admonition */
.admonition.question {
    border-color: var(--md-admonition-question-color);
}

.admonition.question > .admonition-title {
    background-color: rgba(156, 39, 176, 0.1);
}

/* Quote admonition */
.admonition.quote {
    border-color: var(--md-admonition-quote-color);
}

.admonition.quote > .admonition-title {
    background-color: rgba(158, 158, 158, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
    .md-content__inner {
        padding: 0 8px;
    }
    
    .md-typeset {
        font-size: 14px;
    }
    
    .md-typeset h1 {
        font-size: 2em;
    }
    
    .md-typeset h2 {
        font-size: 1.75em;
    }
}
        `;
    }

    /**
     * Returns enhanced fallback CSS based on Material for MkDocs
     * @returns CSS string
     */
    private getEnhancedFallbackCss(): string {
        return `
/* Material for MkDocs Enhanced Base Styles - Dark Theme (Slate) */
:root {
    --md-primary-fg-color: #82b1ff;
    --md-primary-fg-color--light: #adc5ff;
    --md-primary-fg-color--dark: #5a9cff;
    --md-accent-fg-color: #ff5722;
    
    /* Dark theme base colors */
    --md-default-bg-color: #1e1e1e;
    --md-default-fg-color: rgba(255, 255, 255, 0.87);
    --md-default-fg-color--light: rgba(255, 255, 255, 0.54);
    --md-default-fg-color--lighter: rgba(255, 255, 255, 0.32);
    --md-default-fg-color--lightest: rgba(255, 255, 255, 0.12);
    
    /* Dark theme code colors */
    --md-code-bg-color: #2d2d2d;
    --md-code-fg-color: #e1e1e1;
    
    /* Dark theme shadows */
    --md-shadow-z1: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.4);
    
    /* Admonition colors for dark theme */
    --md-admonition-fg-color: rgba(255, 255, 255, 0.87);
    --md-admonition-bg-color: #2d2d2d;
    --md-admonition-note-color: #82b1ff;
    --md-admonition-tip-color: #4dd0e1;
    --md-admonition-success-color: #66bb6a;
    --md-admonition-warning-color: #ffb74d;
    --md-admonition-danger-color: #ef5350;
    --md-admonition-info-color: #26c6da;
    --md-admonition-question-color: #ab47bc;
    --md-admonition-quote-color: #bdbdbd;
    --md-admonition-abstract-color: #4fc3f7;
    --md-admonition-failure-color: #ef5350;
    --md-admonition-bug-color: #ec407a;
    --md-admonition-example-color: #9575cd;
}

/* Force dark theme */
[data-md-color-scheme="slate"] {
    --md-default-bg-color: #1e1e1e;
    --md-default-fg-color: rgba(255, 255, 255, 0.87);
    --md-default-fg-color--light: rgba(255, 255, 255, 0.54);
    --md-default-fg-color--lighter: rgba(255, 255, 255, 0.32);
    --md-default-fg-color--lightest: rgba(255, 255, 255, 0.12);
    --md-code-bg-color: #2d2d2d;
    --md-code-fg-color: #e1e1e1;
}

* {
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
    color: var(--md-default-fg-color);
    background-color: var(--md-default-bg-color);
    margin: 0;
    padding: 1.25rem;
    font-size: 0.8rem;
}

.md-content {
    max-width: 1220px;
    margin: 0 auto;
}

.md-content__inner {
    padding: 0 1rem;
}

.md-typeset {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--md-default-fg-color);
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
}

/* Enhanced Typography */
.md-typeset h1,
.md-typeset h2,
.md-typeset h3,
.md-typeset h4,
.md-typeset h5,
.md-typeset h6 {
    margin: 1.25em 0 0.5em;
    font-weight: 400;
    letter-spacing: -0.01em;
    color: var(--md-default-fg-color);
    line-height: 1.25;
}

.md-typeset h1 {
    font-size: 2rem;
    font-weight: 300;
    letter-spacing: -0.02em;
}

.md-typeset h2 {
    font-size: 1.5rem;
    font-weight: 300;
    letter-spacing: -0.01em;
}

.md-typeset h3 {
    font-size: 1.25rem;
    font-weight: 400;
}

.md-typeset h4 {
    font-size: 1rem;
    font-weight: 700;
}

.md-typeset h5 {
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
}

.md-typeset h6 {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
}

/* Enhanced Code Styling */
.md-typeset code {
    background-color: var(--md-code-bg-color);
    color: var(--md-code-fg-color);
    padding: 0.125rem 0.25rem;
    border-radius: 0.125rem;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Monaco, "Courier New", monospace;
    font-size: 0.85em;
    word-break: break-word;
    box-decoration-break: clone;
}

.md-typeset pre {
    background-color: var(--md-code-bg-color);
    color: var(--md-code-fg-color);
    border-radius: 0.25rem;
    padding: 1rem;
    margin: 1.5em 0;
    overflow-x: auto;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Monaco, "Courier New", monospace;
    font-size: 0.85em;
    line-height: 1.4;
    box-shadow: var(--md-shadow-z1);
}

.md-typeset pre code {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
    box-decoration-break: none;
}

/* Enhanced Table Styling */
.md-typeset table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    margin: 1.5em 0;
    border: 1px solid var(--md-default-fg-color--lightest);
    border-radius: 0.25rem;
    overflow: hidden;
    box-shadow: var(--md-shadow-z1);
}

.md-typeset th,
.md-typeset td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--md-default-fg-color--lightest);
    text-align: left;
    vertical-align: top;
}

.md-typeset th {
    background-color: var(--md-code-bg-color);
    font-weight: 700;
    color: var(--md-default-fg-color);
}

.md-typeset tr:last-child td {
    border-bottom: none;
}

/* Enhanced Links */
.md-typeset a {
    color: var(--md-primary-fg-color);
    text-decoration: none;
    word-break: break-word;
}

.md-typeset a:hover {
    text-decoration: underline;
    color: var(--md-primary-fg-color--light);
}

/* Enhanced Blockquotes */
.md-typeset blockquote {
    border-left: 0.25rem solid var(--md-default-fg-color--lighter);
    padding-left: 1rem;
    margin: 1.5em 0;
    color: var(--md-default-fg-color--light);
    font-style: italic;
}

/* Enhanced Lists */
.md-typeset ul,
.md-typeset ol {
    margin: 0 0 1em;
    padding-left: 2rem;
}

.md-typeset li {
    margin: 0.5em 0;
}

.md-typeset li > p {
    margin: 0.5em 0;
}

/* Enhanced Admonitions */
.md-typeset .admonition {
    display: block;
    clear: both;
    padding: 0 0.75rem;
    margin: 1.25rem 0;
    font-size: 0.8rem;
    color: var(--md-admonition-fg-color);
    background-color: var(--md-admonition-bg-color);
    border: 0.09375rem solid #448aff;
    border-radius: 0.25rem;
    box-shadow: var(--md-shadow-z1);
    transition: box-shadow 125ms;
    page-break-inside: avoid;
    position: relative;
    z-index: 1;
}

.md-typeset .admonition:focus-within {
    box-shadow: 0 0 0 0.25rem rgba(68, 138, 255, 0.1);
}

.md-typeset .admonition > * {
    box-sizing: border-box;
    position: relative;
    z-index: auto;
}

.md-typeset .admonition > :last-child {
    margin-bottom: 0.75rem;
}

.md-typeset .admonition-title {
    position: relative;
    padding: 0.5rem 0.75rem 0.5rem 2.5rem;
    margin: 0 -0.75rem 0.75rem;
    font-weight: 700;
    background-color: rgba(68, 138, 255, 0.1);
    border: none;
    border-radius: 0.125rem 0.125rem 0 0;
    display: block;
    clear: both;
}

.md-typeset .admonition-title::before {
    position: absolute;
    left: 0.75rem;
    top: 0.625rem;
    width: 1.25rem;
    height: 1.25rem;
    content: "";
    background-color: #448aff;
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
}

.md-typeset .admonition-title code {
    box-shadow: 0 0 0 0.0625rem var(--md-default-fg-color--lightest);
}

/* Force proper containment for admonitions */
.md-typeset .admonition::after {
    content: "";
    display: table;
    clear: both;
}

/* Ensure elements after admonitions are properly positioned */
.md-typeset .admonition + * {
    clear: both;
    margin-top: 1rem;
}

/* Specific admonition types with proper colors */
.md-typeset .admonition.note {
    border-color: #448aff;
}
.md-typeset .admonition.note > .admonition-title {
    background-color: rgba(68, 138, 255, 0.1);
}
.md-typeset .admonition.note > .admonition-title::before {
    background-color: #448aff;
    content: "ℹ️";
    background: none;
    color: #448aff;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.md-typeset .admonition.tip {
    border-color: #00bfa5;
}
.md-typeset .admonition.tip > .admonition-title {
    background-color: rgba(0, 191, 165, 0.1);
}
.md-typeset .admonition.tip > .admonition-title::before {
    background-color: #00bfa5;
    content: "💡";
    background: none;
    color: #00bfa5;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.md-typeset .admonition.warning {
    border-color: #ff9100;
}
.md-typeset .admonition.warning > .admonition-title {
    background-color: rgba(255, 145, 0, 0.1);
}
.md-typeset .admonition.warning > .admonition-title::before {
    background-color: #ff9100;
    content: "⚠️";
    background: none;
    color: #ff9100;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.md-typeset .admonition.danger {
    border-color: #ff1744;
}
.md-typeset .admonition.danger > .admonition-title {
    background-color: rgba(255, 23, 68, 0.1);
}
.md-typeset .admonition.danger > .admonition-title::before {
    background-color: #ff1744;
    content: "🚨";
    background: none;
    color: #ff1744;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.md-typeset .admonition.success {
    border-color: #00c853;
}
.md-typeset .admonition.success > .admonition-title {
    background-color: rgba(0, 200, 83, 0.1);
}
.md-typeset .admonition.success > .admonition-title::before {
    background-color: #00c853;
    content: "✅";
    background: none;
    color: #00c853;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.md-typeset .admonition.info {
    border-color: #00b8d4;
}
.md-typeset .admonition.info > .admonition-title {
    background-color: rgba(0, 184, 212, 0.1);
}
.md-typeset .admonition.info > .admonition-title::before {
    background-color: #00b8d4;
    content: "ℹ️";
    background: none;
    color: #00b8d4;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.md-typeset .admonition.question {
    border-color: #64dd17;
}
.md-typeset .admonition.question > .admonition-title {
    background-color: rgba(100, 221, 23, 0.1);
}
.md-typeset .admonition.question > .admonition-title::before {
    background-color: #64dd17;
    content: "❓";
    background: none;
    color: #64dd17;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.md-typeset .admonition.quote {
    border-color: #9e9e9e;
}
.md-typeset .admonition.quote > .admonition-title {
    background-color: rgba(158, 158, 158, 0.1);
}
.md-typeset .admonition.quote > .admonition-title::before {
    background-color: #9e9e9e;
    content: "💬";
    background: none;
    color: #9e9e9e;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.md-typeset .admonition.abstract {
    border-color: #00bcd4;
}
.md-typeset .admonition.abstract > .admonition-title {
    background-color: rgba(0, 188, 212, 0.1);
}
.md-typeset .admonition.abstract > .admonition-title::before {
    background-color: #00bcd4;
    content: "📋";
    background: none;
    color: #00bcd4;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.md-typeset .admonition.bug {
    border-color: #f50057;
}
.md-typeset .admonition.bug > .admonition-title {
    background-color: rgba(245, 0, 87, 0.1);
}
.md-typeset .admonition.bug > .admonition-title::before {
    background-color: #f50057;
    content: "🐛";
    background: none;
    color: #f50057;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.md-typeset .admonition.example {
    border-color: #7c4dff;
}
.md-typeset .admonition.example > .admonition-title {
    background-color: rgba(124, 77, 255, 0.1);
}
.md-typeset .admonition.example > .admonition-title::before {
    background-color: #7c4dff;
    content: "🧪";
    background: none;
    color: #7c4dff;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.md-typeset .admonition.failure {
    border-color: #ff5252;
}
.md-typeset .admonition.failure > .admonition-title {
    background-color: rgba(255, 82, 82, 0.1);
}
.md-typeset .admonition.failure > .admonition-title::before {
    background-color: #ff5252;
    content: "❌";
    background: none;
    color: #ff5252;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Responsive Design */
@media (max-width: 768px) {
    body {
        padding: 1rem;
    }
    
    .md-content__inner {
        padding: 0 0.5rem;
    }
    
    .md-typeset {
        font-size: 0.9rem;
    }
    
    .md-typeset h1 {
        font-size: 1.75rem;
    }
    
    .md-typeset h2 {
        font-size: 1.5rem;
    }
    
    .md-typeset th,
    .md-typeset td {
        padding: 0.5rem 0.75rem;
    }
}
        `;
    }

    /**
     * Gets highlight.js CSS styles optimized for dark theme
     * @returns CSS string for syntax highlighting
     */
    private getHighlightCss(): string {
        return `
        /* Highlight.js GitHub Dark Theme - Optimized for Material Design */
        .hljs {
            color: #e6edf3;
            background: #0d1117;
        }
        
        .hljs-doctag,
        .hljs-keyword,
        .hljs-meta .hljs-keyword,
        .hljs-template-tag,
        .hljs-template-variable,
        .hljs-type,
        .hljs-variable.language_ {
            color: #ff7b72;
        }
        
        .hljs-title,
        .hljs-title.class_,
        .hljs-title.class_.inherited__,
        .hljs-title.function_ {
            color: #d2a8ff;
        }
        
        .hljs-attr,
        .hljs-attribute,
        .hljs-literal,
        .hljs-meta,
        .hljs-number,
        .hljs-operator,
        .hljs-variable,
        .hljs-selector-attr,
        .hljs-selector-class,
        .hljs-selector-id {
            color: #79c0ff;
        }
        
        .hljs-regexp,
        .hljs-string,
        .hljs-meta .hljs-string {
            color: #a5d6ff;
        }
        
        .hljs-built_in,
        .hljs-symbol {
            color: #ffa657;
        }
        
        .hljs-comment,
        .hljs-code,
        .hljs-formula {
            color: #8b949e;
        }
        
        .hljs-name,
        .hljs-quote,
        .hljs-selector-tag,
        .hljs-selector-pseudo {
            color: #7ee787;
        }
        
        .hljs-subst {
            color: #e6edf3;
        }
        
        .hljs-section {
            color: #1f6feb;
            font-weight: bold;
        }
        
        .hljs-bullet {
            color: #f2cc60;
        }
        
        .hljs-emphasis {
            color: #e6edf3;
            font-style: italic;
        }
        
        .hljs-strong {
            color: #e6edf3;
            font-weight: bold;
        }
        
        .hljs-addition {
            color: #aff5b4;
            background-color: #033a16;
        }
        
        .hljs-deletion {
            color: #ffdcd7;
            background-color: #67060c;
        }
        
        /* Language-specific enhancements */
        .hljs.language-sql .hljs-keyword {
            color: #ff7b72;
            font-weight: bold;
        }
        
        .hljs.language-sql .hljs-built_in {
            color: #ffa657;
        }
        
        .hljs.language-json .hljs-attr {
            color: #79c0ff;
        }
        
        .hljs.language-json .hljs-string {
            color: #a5d6ff;
        }
        
        .hljs.language-xml .hljs-tag {
            color: #7ee787;
        }
        
        .hljs.language-xml .hljs-attr {
            color: #79c0ff;
        }
        
        .hljs.language-css .hljs-selector-tag {
            color: #ffa657;
        }
        
        .hljs.language-css .hljs-attribute {
            color: #79c0ff;
        }
        
        /* Make sure line numbers and special elements are visible */
        .hljs-meta,
        .hljs-comment {
            font-style: italic;
        }
        
        .hljs-tag,
        .hljs-name {
            font-weight: normal;
        }
        `;
    }

    /**
     * Pre-process markdown content for annotations
     */
    private preprocessMarkdown(content: string): string {
        this.processAnnotations(content);
        return content;
    }

    /**
     * Process annotations in markdown content
     */
    private processAnnotations(content: string): void {
        const lines = content.split('\n');
        const annotationDefinitions = new Map<string, string>();
        let globalAnnotationCounter = 0;
        let isInAnnotatedBlock = false;
        const currentBlockGlobalIds = new Map<string, string>();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Check for annotate block marker
            if (line.includes('{ .annotate }')) {
                isInAnnotatedBlock = true;
                continue;
            }

            if (isInAnnotatedBlock) {
                // Process references (1), (2), etc.
                const referencePattern = /\((\d+)\)/g;
                let processedLine = lines[i];
                
                // Collect all local IDs in this line first
                const localIdsInLine: string[] = [];
                let match;
                while ((match = referencePattern.exec(lines[i])) !== null) {
                    localIdsInLine.push(match[1]);
                }
                
                // Replace local IDs with global IDs (in reverse order to avoid overlaps)
                for (let j = localIdsInLine.length - 1; j >= 0; j--) {
                    const localId = localIdsInLine[j];
                    let globalId = currentBlockGlobalIds.get(localId);
                    
                    if (!globalId) {
                        globalAnnotationCounter++;
                        globalId = globalAnnotationCounter.toString();
                        currentBlockGlobalIds.set(localId, globalId);
                    }
                    
                    // Replace the specific occurrence
                    processedLine = processedLine.replace(`(${localId})`, `(${globalId})`);
                }
                
                lines[i] = processedLine;

                // Check for definition lines
                const definitionMatch = line.match(/^(\d+)\.\s+(.*)$/);
                if (definitionMatch) {
                    const localId = definitionMatch[1];
                    let content = definitionMatch[2].trim();
                    
                    // Check for multi-line definitions (indented continuation)
                    let j = i + 1;
                    while (j < lines.length && lines[j].match(/^\s+/) && lines[j].trim() !== '') {
                        content += '\n' + lines[j].trim();
                        j++;
                    }
                    
                    const globalId = currentBlockGlobalIds.get(localId);
                    if (globalId) {
                        const processedContent = this.processAnnotationContentForTooltip(content);
                        annotationDefinitions.set(globalId, processedContent);
                        
                        // Hide definition lines from output
                        lines[i] = '';
                        for (let k = i + 1; k < j; k++) {
                            lines[k] = '';
                        }
                    }
                }

                // End block if we hit empty line and next line isn't a definition
                if (line === '' && i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (!nextLine.match(/^\d+\.\s+/) && nextLine !== '') {
                        isInAnnotatedBlock = false;
                        currentBlockGlobalIds.clear();
                    }
                }
            }
        }

        this.storeAnnotationDefinitions(annotationDefinitions);
    }

    /**
     * Process annotation content for tooltip display
     */
    private processAnnotationContentForTooltip(content: string): string {
        // Split into lines for processing
        const lines = content.split('\n');
        const processedLines: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            if (line === '') {
                // Empty line becomes paragraph break
                if (processedLines.length > 0) {
                    processedLines.push('</p><p>');
                }
                continue;
            }

            // Process basic markdown formatting
            line = this.processBasicMarkdownForHTML(line);

            // Handle list items
            if (line.match(/^-\s+/)) {
                line = '<li>' + line.replace(/^-\s+/, '') + '</li>';
                // Wrap in ul if first list item
                if (i === 0 || !lines[i-1]?.trim().match(/^-\s+/)) {
                    line = '<ul>' + line;
                }
                // Close ul if last list item
                if (i === lines.length - 1 || !lines[i+1]?.trim().match(/^-\s+/)) {
                    line = line + '</ul>';
                }
            }

            processedLines.push(line);
        }

        // Wrap in paragraph if not already structured
        let result = processedLines.join('');
        if (!result.match(/^<(p|ul|ol|h[1-6]|div)/)) {
            result = '<p>' + result + '</p>';
        }

        return result;
    }

    /**
     * Process basic markdown formatting for HTML
     */
    private processBasicMarkdownForHTML(text: string): string {
        // Process in order: links, code, bold, italic

        // Links: [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Inline code: `code`
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold: **text**
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Italic: *text*
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        return text;
    }

    /**
     * Store annotation definitions globally
     */
    private storeAnnotationDefinitions(definitions: Map<string, string>): void {
        definitions.forEach((content, id) => {
            this.globalAnnotationDefinitions.set(id, content);
        });
    }

    /**
     * Replace annotation references with Material for MkDocs HTML structure
     */
    private replaceAnnotationReferences(html: string): string {
        // Replace (N) with proper annotation structure inside paragraphs
        return html.replace(/<p>(.*?)<\/p>/gs, (pMatch: string, pContent: string) => {
            const processedContent = pContent.replace(/\((\d+)\)/g, (refMatch: string, id: string) => {
                return `<span class="md-annotation" tabindex="0" data-md-visible="">
                    <span class="md-annotation__index" tabindex="-1">
                        <span data-md-annotation-id="${id}"></span>
                    </span>
                </span>`;
            });
            return `<p>${processedContent}</p>`;
        });
    }
}
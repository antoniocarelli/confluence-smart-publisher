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
        // Load the new SCSS files from assets/css
        const scssFiles = [
            'colors.scss',
            'base.scss', 
            'tooltip.scss',
            'footnotes.scss',
            'admonitions.scss',
            'palette.scss',
            'csp.css'
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
        
        // If no CSS files were loaded, return a minimal fallback
        if (combinedCss.trim() === '') {
            console.warn('[CSS Debug] No CSS files were loaded, using minimal fallback');
            return `
            /* Minimal fallback CSS */
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
                padding: 1rem;
            }
            .md-typeset { font-size: 1rem; }
            `;
        }
        
        console.log(`[CSS Debug] Total CSS size: ${combinedCss.length} characters`);
        
        // Return combined CSS without hardcoded styles
        return combinedCss;
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

    // Fallback CSS methods removed - now using SCSS files from assets/css/

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
            
            // Process annotation definitions and matches
            if (line.includes('--{') && line.includes('}--')) {
                // Process annotation content
                const annotationMatch = line.match(/--\{(.+?)\}--/g);
                if (annotationMatch) {
                    annotationMatch.forEach((match) => {
                        const content = match.slice(3, -3); // Remove --{ }--
                        const localId = content.split(':')[0];
                        const definition = content.split(':').slice(1).join(':').trim();
                        
                        if (definition) {
                            const globalId = `annotation-${++globalAnnotationCounter}`;
                            annotationDefinitions.set(localId, definition);
                            this.globalAnnotationDefinitions.set(globalId, definition);
                        }
                    });
                }
            }
        }
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
}

/* Basic Typography and Layout */
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
    color: var(--md-default-fg-color);
    background-color: var(--md-default-bg-color);
    margin: 0;
    padding: 1rem;
}

.md-typeset {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--md-default-fg-color);
}

/* Enhanced Admonitions */
.admonition {
    margin: 1.5em 0;
    padding: 0 0.75em;
    border-left: 0.25em solid #448aff;
    border-radius: 0.125em;
    background-color: var(--md-admonition-bg-color);
}

.admonition-title {
    position: relative;
    margin: 0 -0.75em 0.75em;
    padding: 0.5em 0.75em;
    font-weight: 700;
    background-color: rgba(68, 138, 255, 0.1);
}

        `;
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
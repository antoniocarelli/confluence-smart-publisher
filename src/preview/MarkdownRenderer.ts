import MarkdownIt from 'markdown-it';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Import markdown-it plugins for CommonMark compliance
const markdownItAdmonition = require('markdown-it-admonition');

/**
 * MarkdownRenderer class responsible for converting CommonMark-compliant Markdown content
 * to HTML with Material for MkDocs styling and enhanced plugin support.
 * Supports CommonMark Spec v0.31.2 features and GitHub Flavored Markdown extensions.
 */
export class MarkdownRenderer {
    private md: MarkdownIt;
    private extensionUri: vscode.Uri;

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
    }

    /**
     * Loads markdown-it plugins to support CommonMark and GFM features
     */
    private loadMarkdownPlugins(): void {
        try {
            // Admonitions plugin (already supported)
            this.md.use(markdownItAdmonition);
            console.log('[Plugin Debug] markdown-it-admonition loaded successfully');

            // Note: Additional plugins can be loaded here as needed
            // For now, we focus on the core plugins that support our CommonMark output
            
        } catch (error) {
            console.error('[Plugin Debug] Error loading markdown-it plugins:', error);
            // Fallback configuration
            try {
                this.md.use(markdownItAdmonition, {});
            } catch (fallbackError) {
                console.error('[Plugin Debug] Fallback admonition loading failed:', fallbackError);
            }
        }
    }

    /**
     * Renders CommonMark-compliant markdown content to HTML with Material for MkDocs styling
     * @param content Markdown content to render
     * @param documentUri URI of the document being rendered (for relative paths)
     * @returns HTML string with embedded CSS
     */
    public renderToHtml(content: string, documentUri?: vscode.Uri): string {
        let htmlContent = this.md.render(content);
        
        // Post-process HTML to fix any structural issues
        htmlContent = this.fixAdmonitionHtml(htmlContent);
        
        // Debug: Log generated HTML structure
        console.log('[HTML Debug] Generated HTML structure:');
        console.log(htmlContent.substring(0, 500) + '...');
        
        const cssContent = this.getMaterialCss();
        
        return `<!DOCTYPE html>
<html lang="en" data-md-color-scheme="slate">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <style>
        ${cssContent}
        
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
        
        /* Code block improvements */
        .md-typeset pre {
            margin: 1.5em 0;
            overflow-x: auto;
        }
        
        .md-typeset code {
            background-color: var(--md-code-bg-color);
            padding: 0.1em 0.4em;
            border-radius: 0.1rem;
            font-size: 0.85em;
        }
    </style>
</head>
<body data-md-color-scheme="slate">
    <div class="md-content">
        <article class="md-content__inner md-typeset">
            ${htmlContent}
        </article>
    </div>
</body>
</html>`;
    }

    /**
     * Post-processes HTML to fix admonition structure issues
     * @param html Raw HTML from markdown-it
     * @returns Fixed HTML
     */
    private fixAdmonitionHtml(html: string): string {
        // Ensure all admonition divs are properly closed
        let processedHtml = html;
        
        // Count opening and closing admonition divs
        const admonitionOpening = (processedHtml.match(/<div[^>]*class="[^"]*admonition[^"]*"/g) || []).length;
        const totalClosingDivs = (processedHtml.match(/<\/div>/g) || []).length;
        
        console.log('[HTML Fix] Admonition divs:', admonitionOpening, 'Total closing divs:', totalClosingDivs);
        
        // If there's a structural issue, try to fix it
        if (admonitionOpening > 0) {
            // Make sure each admonition block is properly contained
            processedHtml = processedHtml.replace(
                /<div([^>]*class="[^"]*admonition[^"]*"[^>]*)>([\s\S]*?)(?=<h[1-6]|<div class="admonition|$)/g,
                (match, attrs, content) => {
                    // Ensure the admonition block is properly closed before the next heading or admonition
                    const openDivs = (content.match(/<div/g) || []).length;
                    const closeDivs = (content.match(/<\/div>/g) || []).length;
                    
                    // Add missing closing divs if needed
                    let fixedContent = content;
                    for (let i = closeDivs; i < openDivs; i++) {
                        fixedContent += '</div>';
                    }
                    
                    return `<div${attrs}>${fixedContent}</div>`;
                }
            );
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
     * Syntax highlighting for code blocks
     * @param str Code content
     * @param lang Language identifier
     * @returns Highlighted HTML
     */
    private highlightCode(str: string, lang: string): string {
        if (lang && lang.trim()) {
            try {
                // Basic syntax highlighting classes for common languages
                const languageClass = `language-${lang.trim()}`;
                return `<pre class="highlight"><code class="${languageClass}">${this.escapeHtml(str)}</code></pre>`;
            } catch (err) {
                // Fallback to plain text
                return `<pre class="highlight"><code>${this.escapeHtml(str)}</code></pre>`;
            }
        }
        return `<pre class="highlight"><code>${this.escapeHtml(str)}</code></pre>`;
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
}
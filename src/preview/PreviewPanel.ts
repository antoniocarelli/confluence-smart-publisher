import * as vscode from 'vscode';
import { MarkdownRenderer } from './MarkdownRenderer';

/**
 * PreviewPanel class manages the lifecycle of the Markdown preview WebviewPanel
 */
export class PreviewPanel {
    public static currentPanel: PreviewPanel | undefined;
    private static readonly viewType = 'markdownPreview';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _renderer: MarkdownRenderer;
    private _disposables: vscode.Disposable[] = [];
    private _currentDocument: vscode.TextDocument | undefined;
    private _initialDocument: vscode.TextDocument | undefined;
    private _updateTimeout: NodeJS.Timeout | undefined;

    public static createOrShow(extensionUri: vscode.Uri, outputChannel: vscode.OutputChannel) {
        const activeEditor = vscode.window.activeTextEditor;
        const column = activeEditor ? vscode.ViewColumn.Beside : undefined;

        // If we already have a panel, show it and update with current document
        if (PreviewPanel.currentPanel) {
            PreviewPanel.currentPanel._panel.reveal(column);
            // Update with current active document if it's a markdown file
            if (activeEditor && PreviewPanel.currentPanel._isMarkdownDocument(activeEditor.document)) {
                PreviewPanel.currentPanel._initialDocument = activeEditor.document;
                PreviewPanel.currentPanel._update();
            }
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            PreviewPanel.viewType,
            'Markdown Preview',
            column || vscode.ViewColumn.One,
            {
                // Enable javascript in the webview
                enableScripts: true,
                // Restrict the webview to only loading content from our extension's directory
                localResourceRoots: [extensionUri],
                // Keep the webview alive even when not visible
                retainContextWhenHidden: true
            }
        );

        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri, outputChannel, activeEditor?.document);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, outputChannel: vscode.OutputChannel) {
        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri, outputChannel);
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        private readonly outputChannel: vscode.OutputChannel,
        initialDocument?: vscode.TextDocument
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._renderer = new MarkdownRenderer(extensionUri);
        this._initialDocument = initialDocument;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            e => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Listen for changes to the active text editor
        vscode.window.onDidChangeActiveTextEditor(
            (editor) => {
                if (this._panel.visible) {
                    // Update initial document if a new markdown file is opened
                    if (editor && this._isMarkdownDocument(editor.document)) {
                        this._initialDocument = editor.document;
                    }
                    this._updateDebounced();
                }
            },
            null,
            this._disposables
        );

        // Listen for text document changes
        vscode.workspace.onDidChangeTextDocument(
            e => {
                if (this._panel.visible && this._isMarkdownDocument(e.document)) {
                    // Update the document being previewed if it matches
                    if (this._initialDocument && e.document.uri.toString() === this._initialDocument.uri.toString()) {
                        this._initialDocument = e.document;
                    }
                    this._updateDebounced();
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public dispose() {
        PreviewPanel.currentPanel = undefined;

        // Clean up resources
        this._panel.dispose();

        if (this._updateTimeout) {
            clearTimeout(this._updateTimeout);
        }

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _isMarkdownDocument(document: vscode.TextDocument): boolean {
        return document.languageId === 'markdown';
    }

    private _isDocumentValid(document: vscode.TextDocument): boolean {
        try {
            // Check if the document is still open by checking if we can access its content
            document.getText();
            return true;
        } catch (error) {
            // Document is no longer valid (was closed)
            return false;
        }
    }

    private _updateDebounced() {
        // Debounce updates to avoid excessive renders
        if (this._updateTimeout) {
            clearTimeout(this._updateTimeout);
        }
        
        this._updateTimeout = setTimeout(() => {
            this._update();
        }, 300);
    }

    private _update() {
        const activeEditor = vscode.window.activeTextEditor;
        let document: vscode.TextDocument | undefined;
        
        // Try to use the active editor's document first
        if (activeEditor && this._isMarkdownDocument(activeEditor.document)) {
            document = activeEditor.document;
            this._initialDocument = document; // Update our reference
        } 
        // If no active editor or not markdown, use the initial document if it's still valid
        else if (this._initialDocument && this._isDocumentValid(this._initialDocument) && this._isMarkdownDocument(this._initialDocument)) {
            document = this._initialDocument;
        }
        
        // If no document available, show welcome screen
        if (!document) {
            // Clear invalid document reference
            if (this._initialDocument && !this._isDocumentValid(this._initialDocument)) {
                this._initialDocument = undefined;
            }
            this._panel.webview.html = this._getWelcomeHtml();
            return;
        }
        
        // If document is not markdown, show not markdown screen
        if (!this._isMarkdownDocument(document)) {
            this._panel.webview.html = this._getNotMarkdownHtml();
            return;
        }

        this._currentDocument = document;
        const content = document.getText();
        
        try {
            this.outputChannel.appendLine(`[Preview] Updating preview for: ${document.fileName}`);
            const html = this._renderer.renderToHtml(content, document.uri);
            this._panel.webview.html = html;
            
            // Update panel title with file name
            const fileName = document.fileName.split(/[\/\\]/).pop() || 'Markdown Preview';
            this._panel.title = `Preview: ${fileName}`;
            
        } catch (error) {
            this.outputChannel.appendLine(`[Preview] Error rendering markdown: ${error}`);
            this._panel.webview.html = this._getErrorHtml(error);
        }
    }

    private _getWelcomeHtml(): string {
        return `<!DOCTYPE html>
<html lang="en" data-md-color-scheme="slate">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            padding: 2rem;
            background-color: #1e1e1e;
            color: rgba(255, 255, 255, 0.87);
            text-align: center;
        }
        .welcome-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
            background: #2d2d2d;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .welcome-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        h1 {
            color: #82b1ff;
            margin-bottom: 1rem;
        }
        p {
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.7);
        }
        .instruction {
            background-color: #3c3c3c;
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1rem;
            font-style: italic;
        }
        code {
            background-color: #404040;
            color: #e1e1e1;
            padding: 0.2em 0.4em;
            border-radius: 3px;
        }
    </style>
</head>
<body data-md-color-scheme="slate">
    <div class="welcome-container">
        <div class="welcome-icon">📄</div>
        <h1>Markdown Preview</h1>
        <p>Welcome to the Confluence Smart Publisher Markdown Preview!</p>
        <p>Open a Markdown file to see the live preview with Material for MkDocs styling.</p>
        <div class="instruction">
            💡 Tip: The preview supports admonitions like <code>!!! note</code>, <code>!!! tip</code>, <code>!!! warning</code>, and more!
        </div>
    </div>
</body>
</html>`;
    }

    private _getNotMarkdownHtml(): string {
        return `<!DOCTYPE html>
<html lang="en" data-md-color-scheme="slate">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            padding: 2rem;
            background-color: #1e1e1e;
            color: rgba(255, 255, 255, 0.87);
            text-align: center;
        }
        .message-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
            background: #2d2d2d;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .message-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        h2 {
            color: #ffb74d;
            margin-bottom: 1rem;
        }
        p {
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.7);
        }
        code {
            background-color: #404040;
            color: #e1e1e1;
            padding: 0.2em 0.4em;
            border-radius: 3px;
        }
    </style>
</head>
<body data-md-color-scheme="slate">
    <div class="message-container">
        <div class="message-icon">⚠️</div>
        <h2>Not a Markdown File</h2>
        <p>The currently active file is not a Markdown document.</p>
        <p>Please open a <code>.md</code> file to see the preview.</p>
    </div>
</body>
</html>`;
    }

    private _getErrorHtml(error: any): string {
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        return `<!DOCTYPE html>
<html lang="en" data-md-color-scheme="slate">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview - Error</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            padding: 2rem;
            background-color: #1e1e1e;
            color: rgba(255, 255, 255, 0.87);
            text-align: center;
        }
        .error-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
            background: #2d2d2d;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            border-left: 4px solid #ef5350;
        }
        .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        h2 {
            color: #ef5350;
            margin-bottom: 1rem;
        }
        p {
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.7);
        }
        .error-details {
            background-color: #3c2222;
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1rem;
            font-family: monospace;
            text-align: left;
            color: #ff8a80;
        }
    </style>
</head>
<body data-md-color-scheme="slate">
    <div class="error-container">
        <div class="error-icon">🚨</div>
        <h2>Preview Error</h2>
        <p>An error occurred while rendering the Markdown preview.</p>
        <div class="error-details">${this._escapeHtml(errorMessage)}</div>
    </div>
</body>
</html>`;
    }

    private _escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}
import * as vscode from 'vscode';
import { publishConfluenceFile, ConfluenceClient, BodyFormat } from './confluenceClient';
import * as path from 'path';
import { formatConfluenceDocument, decodeHtmlEntities } from './confluenceFormatter';
import { getEmojiPickerHtml } from './webview';
import { MarkdownConverter } from './markdownConverter';
import { AdfToMarkdownConverter } from './adf-md-converter/adf-to-md-converter';
import { createXMLCSPBlock, createYAMLCSPBlock } from './csp-utils';
import { PreviewPanel } from './preview/PreviewPanel';
import { FileOrganizer } from './file-organizer';

export function registerCommands(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
    // Command to publish .confluence file
    const publishCmd = vscode.commands.registerCommand('confluence-smart-publisher.publishConfluence', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath.endsWith('.confluence')) {
            vscode.window.showErrorMessage('Select a .confluence file to publish.');
            return;
        }
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Publishing to Confluence...',
                cancellable: false
            }, async () => {
                outputChannel.appendLine(`[Publish] Starting publication of file: "${uri.fsPath}"`);
                const result = await publishConfluenceFile(uri.fsPath);
                outputChannel.appendLine(`[Publish] Page published successfully! ID: ${result.pageId}`);
                vscode.window.showInformationMessage(`Page published successfully! ID: ${result.pageId}`);
            });
        } catch (e: any) {
            outputChannel.appendLine(`[Publish] Error: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error publishing to Confluence: ${e.message || e}`);
        }
    });

    // Command to get page by title
    const getPageByTitleCmd = vscode.commands.registerCommand('confluence-smart-publisher.getPageByTitle', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath) {
            vscode.window.showErrorMessage('Select a folder to save the page.');
            return;
        }
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat.type !== vscode.FileType.Directory) {
            vscode.window.showErrorMessage('Select a folder to save the page.');
            return;
        }
        const spaceKey = await vscode.window.showInputBox({ prompt: 'Enter the Confluence Space Key', ignoreFocusOut: true });
        if (!spaceKey) {
            vscode.window.showWarningMessage('Space Key not provided.');
            return;
        }
        const title = await vscode.window.showInputBox({ prompt: 'Enter the exact page title', ignoreFocusOut: true });
        if (!title) {
            vscode.window.showWarningMessage('Title not provided.');
            return;
        }
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Downloading page from Confluence...',
                cancellable: false
            }, async () => {
                outputChannel.appendLine(`[Download by Title] Searching page: SpaceKey=${spaceKey}, Title=${title}`);
                const client = new ConfluenceClient();
                const page = await client.getPageByTitle(spaceKey, title);
                if (!page) {throw new Error('Page not found.');}
                const pageId = page.id;
                const filePath = await client.downloadConfluencePage(pageId, BodyFormat.ATLAS_DOC_FORMAT, uri.fsPath);
                outputChannel.appendLine(`[Download by Title] Page downloaded to: "${filePath}"`);
                vscode.window.showInformationMessage(`Page downloaded to: "${filePath}"`);
            });
        } catch (e: any) {
            outputChannel.appendLine(`[Download by Title] Error: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error downloading page: ${e.message || e}`);
        }
    });

    // Command to get page by ID
    const getPageByIdCmd = vscode.commands.registerCommand('confluence-smart-publisher.getPageById', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath) {
            vscode.window.showErrorMessage('Select a folder to save the page.');
            return;
        }
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat.type !== vscode.FileType.Directory) {
            vscode.window.showErrorMessage('Select a folder to save the page.');
            return;
        }
        const pageId = await vscode.window.showInputBox({ prompt: 'Enter the Confluence Page ID', ignoreFocusOut: true });
        if (!pageId) {
            vscode.window.showWarningMessage('Page ID not provided.');
            return;
        }
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Downloading page from Confluence...',
                cancellable: false
            }, async () => {
                outputChannel.appendLine(`[Download by ID] Searching page: ID=${pageId}`);
                const client = new ConfluenceClient();
                const filePath = await client.downloadConfluencePage(pageId, BodyFormat.ATLAS_DOC_FORMAT , uri.fsPath);
                outputChannel.appendLine(`[Download by ID] Page downloaded to: "${filePath}"`);
                vscode.window.showInformationMessage(`Page downloaded to: "${filePath}"`);
            });
        } catch (e: any) {
            outputChannel.appendLine(`[Download by ID] Error: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error downloading page: ${e.message || e}`);
        }
    });

    // Command to create new page
    const createPageCmd = vscode.commands.registerCommand('confluence-smart-publisher.createPage', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath) {
            vscode.window.showErrorMessage('Select a folder to create the new page.');
            return;
        }
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat.type !== vscode.FileType.Directory) {
            vscode.window.showErrorMessage('Select a folder to create the new page.');
            return;
        }

        const fileName = await vscode.window.showInputBox({ prompt: 'Enter the file name (ex: NewPage.confluence)', ignoreFocusOut: true });
        if (!fileName) {
            vscode.window.showWarningMessage('File name not provided.');
            return;
        }

        const templateId = await vscode.window.showInputBox({ prompt: 'Enter the Template File ID', ignoreFocusOut: true });
        if (!templateId) {
            vscode.window.showWarningMessage('Template file ID not provided.');
            return;
        }

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Downloading template file from Confluence...',
                cancellable: false
            }, async () => {
                outputChannel.appendLine(`[Create Page] Downloading template: ID=${templateId}`);
                const client = new ConfluenceClient();
                const tempDir = uri.fsPath;
                const templatePath = await client.downloadConfluencePage(templateId, BodyFormat.ATLAS_DOC_FORMAT, tempDir);
                const fs = await import('fs');
                let content = fs.readFileSync(templatePath, 'utf-8');
                content = content.replace(/<csp:file_id>[\s\S]*?<\/csp:file_id>\s*/, '');
                const newFilePath = path.join(uri.fsPath, fileName.endsWith('.confluence') ? fileName : fileName + '.confluence');
                fs.writeFileSync(newFilePath, content, { encoding: 'utf-8' });
                outputChannel.appendLine(`[Create Page] File "${fileName}" created at "${newFilePath}"`);
                vscode.window.showInformationMessage(`File "${fileName}" created successfully!`);
            });
        } catch (e: any) {
            outputChannel.appendLine(`[Create Page] Error: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error creating page: ${e.message || e}`);
        }
    });

    // Command to format Confluence document
    const formatConfluenceCmd = vscode.commands.registerCommand('confluence-smart-publisher.formatConfluence', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath.endsWith('.confluence')) {
            vscode.window.showErrorMessage('Select a .confluence file to format.');
            return;
        }
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            outputChannel.appendLine(`[Format] Starting formatting of file: "${uri.fsPath}"`);

            const editor = await vscode.window.showTextDocument(document, { preview: false });
            const config = vscode.workspace.getConfiguration('confluenceSmartPublisher');
            const numberChapters = config.get('format.numberChapters', false);
            const formatted = formatConfluenceDocument(document.getText());
            await editor.edit(editBuilder => {
                const start = new vscode.Position(0, 0);
                const end = new vscode.Position(document.lineCount, 0);
                editBuilder.replace(new vscode.Range(start, end), formatted);
            });
            outputChannel.appendLine(`[Format] File formatted: "${uri.fsPath}"`);
            vscode.window.showInformationMessage('File formatted successfully!');
        } catch (e: any) {
            outputChannel.appendLine(`[Format] Error formatting: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error formatting file: ${e.message || e}`);
        }
    });

    // Command to sync with published version
    const syncWithPublishedCmd = vscode.commands.registerCommand('confluence-smart-publisher.syncWithPublished', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath.endsWith('.confluence')) {
            vscode.window.showErrorMessage('Select a .confluence file to sync.');
            return;
        }
        const fs = await import('fs');
        let fileId = '';
        try {
            const content = fs.readFileSync(uri.fsPath, 'utf-8');
            const match = content.match(/<csp:file_id>(\d+)<\/csp:file_id>/);
            if (match) {
                fileId = match[1];
            }
        } catch (e) {}

        if (!fileId) {
            const input = await vscode.window.showInputBox({ prompt: 'Enter the Confluence Page ID to sync', ignoreFocusOut: true });
            if (!input) {
                vscode.window.showWarningMessage('Page ID not provided.');
                return;
            }
            fileId = input;
        }

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Downloading published version from Confluence...',
                cancellable: false
            }, async () => {
                outputChannel.appendLine(`[Sync] Downloading published version for synchronization. fileId=${fileId}`);
                const client = new ConfluenceClient();
                const temp = require('os').tmpdir();
                const fs = await import('fs');
                const path = await import('path');
                const config = vscode.workspace.getConfiguration('confluenceSmartPublisher');
                const numberChapters = config.get('format.numberChapters', false);
                // Baixa o arquivo publicado
                const publishedPath = await client.downloadConfluencePage(fileId, BodyFormat.ATLAS_DOC_FORMAT, temp);

                // Lê e formata o conteúdo local
                const localContent = fs.readFileSync(uri.fsPath, 'utf-8');
                const formattedLocal = formatConfluenceDocument(localContent);
                const formattedLocalPath = path.join(temp, 'local_formatted_' + path.basename(uri.fsPath));
                fs.writeFileSync(formattedLocalPath, formattedLocal, { encoding: 'utf-8' });

                // Lê e formata o conteúdo publicado
                const publishedContent = fs.readFileSync(publishedPath, 'utf-8');
                const formattedPublished = formatConfluenceDocument(publishedContent);
                const formattedPublishedPath = path.join(temp, 'published_formatted_' + path.basename(publishedPath));
                fs.writeFileSync(formattedPublishedPath, formattedPublished, { encoding: 'utf-8' });

                outputChannel.appendLine(`[Sync] Showing diff for user decision.`);
                const leftUri = vscode.Uri.file(formattedLocalPath);
                const rightUri = vscode.Uri.file(formattedPublishedPath);
                const title = `Diff: Local (formatted) ↔ Published (formatted) (${fileId})`;
                await vscode.commands.executeCommand('vscode.diff', leftUri, rightUri, title);

                const choice = await vscode.window.showQuickPick([
                    {
                        label: 'Update local file with online content',
                        detail: 'Overwrites the local file with the content downloaded from Confluence.'
                    },
                    {
                        label: 'Update Confluence with local content',
                        detail: 'Publishes the local file to Confluence.'
                    },
                    {
                        label: 'Cancel',
                        detail: 'No changes will be made.'
                    }
                ], { placeHolder: 'Choose sync action' });

                if (!choice || choice.label === 'Cancel') {
                    outputChannel.appendLine('[Sync] Sync cancelled by user.');
                    return;
                }

                if (choice.label === 'Update local file with online content') {
                    fs.writeFileSync(uri.fsPath, publishedContent, { encoding: 'utf-8' });
                    outputChannel.appendLine('[Sync] Local file updated successfully!');
                    vscode.window.showInformationMessage('Local file updated successfully!');
                } else if (choice.label === 'Update Confluence with local content') {
                    await vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: 'Publishing local content to Confluence...',
                        cancellable: false
                    }, async () => {
                        outputChannel.appendLine('[Sync] Publishing local content to Confluence...');
                        await publishConfluenceFile(uri.fsPath);
                        outputChannel.appendLine('[Sync] Local content published successfully!');
                        vscode.window.showInformationMessage('Local content published to Confluence successfully!');
                    });
                }
            });
        } catch (e: any) {
            outputChannel.appendLine(`[Sync] Error syncing: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error syncing: ${e.message || e}`);
        }
    });

    // Command to set emoji title
    const setEmojiTitleCmd = vscode.commands.registerCommand('confluence-smart-publisher.setEmojiTitle', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath.endsWith('.confluence')) {
            vscode.window.showErrorMessage('Select a .confluence file to set the emoji.');
            return;
        }

        // Criar e mostrar o painel do webview
        const panel = vscode.window.createWebviewPanel(
            'emojiPicker',
            'Select Emoji',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // Configurar o HTML do webview
        panel.webview.html = getEmojiPickerHtml(panel.webview, context.extensionUri);

        // Lidar com mensagens do webview
        panel.webview.onDidReceiveMessage(
            async message => {
                if (message.command === 'emojiSelected') {
                    const emoji = message.emoji;
                    try {
                        const codePoint = emoji.codePointAt(0)?.toString(16);
                        if (!codePoint) {
                            throw new Error('Error getting emoji code.');
                        }

                        const fs = await import('fs');
                        let content = fs.readFileSync(uri.fsPath, 'utf-8');
                        const cspParamsRegex = /<csp:parameters[\s\S]*?<\/csp:parameters>/gi;
                        const cspPropertiesRegex = /<csp:properties>[\s\S]*?<\/csp:properties>/i;
                        const emojiKeysRegex = /<csp:key>emoji-title-draft<\/csp:key>\s*<csp:value>[a-zA-Z0-9]+<\/csp:value>\s*<csp:key>emoji-title-published<\/csp:key>\s*<csp:value>[a-zA-Z0-9]+<\/csp:value>/;
                        const emojiProps = `<csp:key>emoji-title-draft</csp:key>\n  <csp:value>${codePoint}</csp:value>\n  <csp:key>emoji-title-published</csp:key>\n  <csp:value>${codePoint}</csp:value>`;
                        
                        let novoContent = content;
                        if (cspParamsRegex.test(content)) {
                            novoContent = content.replace(cspParamsRegex, (paramsBlock) => {
                                if (cspPropertiesRegex.test(paramsBlock)) {
                                    return paramsBlock.replace(cspPropertiesRegex, (propertiesBlock) => {
                                        if (emojiKeysRegex.test(propertiesBlock)) {
                                            return propertiesBlock.replace(emojiKeysRegex, emojiProps);
                                        } else {
                                            return propertiesBlock.replace(/(<\/csp:properties>)/, `  ${emojiProps}\n$1`);
                                        }
                                    });
                                } else {
                                    return paramsBlock.replace(/(<\/csp:parameters>)/, `  <csp:properties>\n  ${emojiProps}\n  </csp:properties>\n$1`);
                                }
                            });
                        } else {
                            const cspMetadata = {
                                file_id: '',
                                labels_list: '',
                                parent_id: '',
                                properties: [
                                    { key: 'emoji-title-draft', value: codePoint },
                                    { key: 'emoji-title-published', value: codePoint }
                                ]
                            };
                            novoContent = createXMLCSPBlock(cspMetadata) + '\n' + content;
                        }

                        fs.writeFileSync(uri.fsPath, novoContent, { encoding: 'utf-8' });
                        outputChannel.appendLine(`[Emoji] Emoji set successfully: ${emoji}`);
                        vscode.window.showInformationMessage(`Emoji set successfully: ${emoji}`);
                    } catch (e: any) {
                        outputChannel.appendLine(`[Emoji] Error setting emoji: ${e.message || e}`);
                        outputChannel.show(true);
                        vscode.window.showErrorMessage(`Error setting emoji: ${e.message || e}`);
                    } finally {
                        panel.dispose();
                    }
                }
            },
            undefined,
            context.subscriptions
        );
    });

    // Command to decode HTML entities
    const decodeHtmlCmd = vscode.commands.registerCommand('confluence-smart-publisher.decodeHtml', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath.endsWith('.confluence')) {
            vscode.window.showErrorMessage('Select a .confluence file to decode.');
            return;
        }

        try {
            const document = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(document, { preview: false });
            
            const content = document.getText();
            const decodedContent = decodeHtmlEntities(content);

            await editor.edit(editBuilder => {
                const start = new vscode.Position(0, 0);
                const end = new vscode.Position(document.lineCount, 0);
                editBuilder.replace(new vscode.Range(start, end), decodedContent);
            });

            outputChannel.appendLine(`[Decode HTML] File decoded: "${uri.fsPath}"`);
            vscode.window.showInformationMessage('HTML entities decoded successfully!');
        } catch (e: any) {
            outputChannel.appendLine(`[Decode HTML] Error decoding: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error decoding HTML entities: ${e.message || e}`);
        }
    });

    // Command to convert Markdown to Confluence
    const convertMarkdownCmd = vscode.commands.registerCommand('confluence-smart-publisher.convertMarkdown', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath.endsWith('.md')) {
            vscode.window.showErrorMessage('Select a .md file to convert.');
            return;
        }

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Converting Markdown to Confluence...',
                cancellable: false
            }, async () => {
                outputChannel.appendLine(`[Convert] Starting conversion of file: "${uri.fsPath}"`);
                const converter = MarkdownConverter.getInstance();
                const confluenceFilePath = await converter.convertFile(uri.fsPath);
                outputChannel.appendLine(`[Convert] File successfully converted: "${path.basename(confluenceFilePath)}"`);
                vscode.window.showInformationMessage(`File successfully converted: "${path.basename(confluenceFilePath)}"`);
                
                // Opens the converted file
                const doc = await vscode.workspace.openTextDocument(confluenceFilePath);
                await vscode.window.showTextDocument(doc);
            });
        } catch (e: any) {
            outputChannel.appendLine(`[Convert] Error: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error converting file: ${e.message || e}`);
        }
    });

    // Command to convert Confluence to Markdown
    const convertConfluenceToMarkdownCmd = vscode.commands.registerCommand('confluence-smart-publisher.convertConfluenceToMarkdown', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath.endsWith('.confluence')) {
            vscode.window.showErrorMessage('Select a .confluence file to convert.');
            return;
        }
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Converting Confluence to Markdown...',
                cancellable: false
            }, async () => {
                outputChannel.appendLine(`[Convert] Starting conversion of file: "${uri.fsPath}"`);
                const fs = await import('fs');
                const path = await import('path');
                const yaml = await import('js-yaml');
                const content = fs.readFileSync(uri.fsPath, 'utf-8');
                outputChannel.appendLine(`[DEBUG] File content: ${content.substring(0, 500)}`);
                let adfJson;
                try {
                    adfJson = JSON.parse(content);
                } catch (e) {
                    throw new Error('The .confluence file is not in valid ADF JSON format.');
                }
                outputChannel.appendLine(`[DEBUG] adfJson: ${JSON.stringify(adfJson, null, 2).substring(0, 500)}`);

                // Converter bloco csp para YAML puro usando a função utilitária
                let yamlBlock = '';
                if (adfJson.csp) {
                    try {
                        yamlBlock = createYAMLCSPBlock(adfJson.csp);
                    } catch (e) {
                        outputChannel.appendLine(`[DEBUG] Error converting csp to YAML: ${e}`);
                    }
                }

                // Obter confluenceBaseUrl da configuração para lookup de títulos
                const config = vscode.workspace.getConfiguration('confluenceSmartPublisher');
                const confluenceBaseUrl = (config.get('baseUrl') as string)?.replace(/\/$/, '') || '';

                // Converter bloco content para markdown
                let markdown = '';
                if (adfJson.content) {
                    const converter = new AdfToMarkdownConverter();
                    const markdownBlock = await converter.convertNode(adfJson.content, 0, confluenceBaseUrl);
                    outputChannel.appendLine(`[DEBUG] markdownBlock: ${JSON.stringify(markdownBlock, null, 2)}`);
                    markdown = markdownBlock.markdown;
                } else {
                    outputChannel.appendLine('[DEBUG] Content block not found in JSON.');
                }

                const outputPath = uri.fsPath.replace(/\.confluence$/, '.md');
                const finalContent = `${yamlBlock.trim()}

${markdown.trim()}
`;
                fs.writeFileSync(outputPath, finalContent, 'utf-8');

                outputChannel.appendLine(`[Convert] File successfully converted: "${path.basename(outputPath)}"`);
                vscode.window.showInformationMessage(`File successfully converted: "${path.basename(outputPath)}"`);
                // Opens the converted file
                const doc = await vscode.workspace.openTextDocument(outputPath);
                await vscode.window.showTextDocument(doc);
            });
        } catch (e: any) {
            outputChannel.appendLine(`[Convert] Error: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error converting file: ${e.message || e}`);
        }
    });

    // Command to open markdown preview
    const previewCmd = vscode.commands.registerCommand('confluence-smart-publisher.preview', () => {
        try {
            outputChannel.appendLine('[Preview] Opening Markdown preview...');
            PreviewPanel.createOrShow(context.extensionUri, outputChannel);
            outputChannel.appendLine('[Preview] Markdown preview opened successfully');
        } catch (e: any) {
            outputChannel.appendLine(`[Preview] Error: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error opening preview: ${e.message || e}`);
        }
    });

    // Command to download all pages from a space
    const downloadAllSpacePagesCmd = vscode.commands.registerCommand('confluence-smart-publisher.downloadAllSpacePages', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath) {
            vscode.window.showErrorMessage('Select a folder to save the pages.');
            return;
        }
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat.type !== vscode.FileType.Directory) {
            vscode.window.showErrorMessage('Select a folder to save the pages.');
            return;
        }

        const spaceKey = await vscode.window.showInputBox({ prompt: 'Enter the Confluence Space Key', ignoreFocusOut: true });
        if (!spaceKey) {
            vscode.window.showWarningMessage('Space Key not provided.');
            return;
        }

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Fetching space details...',
                cancellable: false
            }, async (progress) => {
                outputChannel.appendLine(`[Download All Pages] Fetching details for Space Key: ${spaceKey}`);
                const client = new ConfluenceClient();
                const space = await client.getSpaceByKey(spaceKey);

                if (!space) {
                    vscode.window.showErrorMessage(`Space with key "${spaceKey}" not found or you don't have permissions.`);
                    outputChannel.appendLine(`[Download All Pages] Space with key "${spaceKey}" not found.`);
                    return;
                }

                const spaceId = space.id;
                const spaceName = space.name;

                progress.report({ message: `Downloading pages from space "${spaceName}"...`, increment: 0 });
                outputChannel.appendLine(`[Download All Pages] Starting download for Space: "${spaceName}" (ID: ${spaceId})`);
                
                const pages = await client.getPagesInSpace(spaceId, BodyFormat.ATLAS_DOC_FORMAT);

                if (pages.length === 0) {
                    vscode.window.showInformationMessage(`No pages found in space "${spaceName}".`);
                    outputChannel.appendLine(`[Download All Pages] No pages found in space "${spaceName}".`);
                    return;
                }

                let completedDownloads = 0;
                for (const page of pages) {
                    const pageTitle = page.title || `Page_${page.id}`;
                    progress.report({ message: `Downloading "${pageTitle}"...`, increment: (100 / pages.length) });
                    try {
                        const filePath = await client.downloadConfluencePage(page.id, BodyFormat.ATLAS_DOC_FORMAT, uri.fsPath);
                        outputChannel.appendLine(`[Download All Pages] Downloaded and converted "${pageTitle}" to: "${filePath}"`);
                        completedDownloads++;
                    } catch (pageError: any) {
                        outputChannel.appendLine(`[Download All Pages] Error downloading page "${pageTitle}" (ID: ${page.id}): ${pageError.message || pageError}`);
                        vscode.window.showWarningMessage(`Could not download page "${pageTitle}". See output channel for details.`);
                    }
                }
                outputChannel.appendLine(`[Download All Pages] Completed downloading ${completedDownloads} of ${pages.length} pages from space "${spaceName}".`);
                vscode.window.showInformationMessage(`Completed downloading ${completedDownloads} of ${pages.length} pages from space "${spaceName}".`);
            });
        } catch (e: any) {
            outputChannel.appendLine(`[Download All Pages] Error: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error downloading all pages: ${e.message || e}`);
        }
    });

    // Command to organize files based on Confluence page hierarchy
    const organizeFilesCmd = vscode.commands.registerCommand('confluence-smart-publisher.organizeFiles', async (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath) {
            vscode.window.showErrorMessage('Select a folder to organize files.');
            return;
        }
        
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat.type !== vscode.FileType.Directory) {
            vscode.window.showErrorMessage('Select a folder to organize files.');
            return;
        }

        // Ask user if they want to limit search to a specific space
        const limitToSpace = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Limit search to a specific Confluence space?',
            ignoreFocusOut: true
        });

        let spaceKey: string | undefined;
        if (limitToSpace === 'Yes') {
            spaceKey = await vscode.window.showInputBox({ 
                prompt: 'Enter the Confluence Space Key (optional)', 
                ignoreFocusOut: true 
            });
            if (spaceKey === '') {
                spaceKey = undefined; // Treat empty string as no space key
            }
        }

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Organizing files based on Confluence hierarchy...',
                cancellable: false
            }, async (progress) => {
                outputChannel.appendLine(`[Organize Files] Starting organization of folder: ${uri.fsPath}`);
                if (spaceKey) {
                    outputChannel.appendLine(`[Organize Files] Limiting search to space: ${spaceKey}`);
                }

                const organizer = new FileOrganizer(outputChannel);
                const result = await organizer.organizeFiles(uri.fsPath, spaceKey);

                // Show results
                if (result.success) {
                    const message = result.summary;
                    vscode.window.showInformationMessage(message);
                    outputChannel.appendLine(`[Organize Files] Organization completed: ${message}`);
                    
                    // Show detailed results if there were errors
                    if (result.errors.length > 0) {
                        outputChannel.show(true);
                        vscode.window.showWarningMessage(`${result.errors.length} errors occurred during organization. Check the output channel for details.`);
                    }
                } else {
                    vscode.window.showErrorMessage(`Organization failed: ${result.errors.join(', ')}`);
                    outputChannel.show(true);
                }
            });
        } catch (e: any) {
            outputChannel.appendLine(`[Organize Files] Error: ${e.message || e}`);
            outputChannel.show(true);
            vscode.window.showErrorMessage(`Error organizing files: ${e.message || e}`);
        }
    });

    // Register all commands
    context.subscriptions.push(
        publishCmd,
        getPageByTitleCmd,
        getPageByIdCmd,
        createPageCmd,
        formatConfluenceCmd,
        syncWithPublishedCmd,
        setEmojiTitleCmd,
        decodeHtmlCmd,
        convertMarkdownCmd,
        convertConfluenceToMarkdownCmd,
        previewCmd,
        downloadAllSpacePagesCmd,
        organizeFilesCmd
    );
} 
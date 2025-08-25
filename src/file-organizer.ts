import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfluenceClient, Page } from './confluenceClient';

export interface FileOrganizationResult {
    success: boolean;
    organizedFiles: number;
    totalFiles: number;
    errors: string[];
    summary: string;
}

export interface FileMatch {
    filePath: string;
    fileName: string;
    page: Page;
    hierarchy: Page[];
}

export class FileOrganizer {
    private client: ConfluenceClient;
    private outputChannel: vscode.OutputChannel;
    private movedFiles: Set<string> = new Set(); // Track moved files to prevent duplicates

    constructor(outputChannel: vscode.OutputChannel) {
        this.client = new ConfluenceClient();
        this.outputChannel = outputChannel;
    }

    /**
     * Organize files in a folder based on Confluence page hierarchy
     * @param folderPath Path to the folder containing files to organize
     * @param spaceKey Optional space key to limit search
     * @returns Promise with organization results
     */
    async organizeFiles(folderPath: string, spaceKey?: string): Promise<FileOrganizationResult> {
        const result: FileOrganizationResult = {
            success: true,
            organizedFiles: 0,
            totalFiles: 0,
            errors: [],
            summary: ''
        };

        try {
            this.outputChannel.appendLine(`[Organize Files] Starting organization of folder: ${folderPath}`);
            
            // Reset moved files tracking
            this.movedFiles.clear();
            
            // Get all files in the folder
            const files = await this.getFilesInFolder(folderPath);
            result.totalFiles = files.length;
            
            if (files.length === 0) {
                result.summary = 'No files found in the selected folder.';
                return result;
            }

            // Process files in batches to avoid overwhelming the API
            const batchSize = 10;
            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                await this.processFileBatch(batch, folderPath, spaceKey, result);
                
                // Update progress
                const progress = Math.min(((i + batchSize) / files.length) * 100, 100);
                this.outputChannel.appendLine(`[Organize Files] Progress: ${Math.round(progress)}% (${i + batchSize}/${files.length} files processed)`);
            }

            result.summary = `Successfully organized ${result.organizedFiles} out of ${result.totalFiles} files.`;
            if (result.errors.length > 0) {
                result.summary += ` ${result.errors.length} errors occurred.`;
            }

        } catch (error: any) {
            result.success = false;
            result.errors.push(`Organization failed: ${error.message}`);
            this.outputChannel.appendLine(`[Organize Files] Error: ${error.message}`);
        }

        return result;
    }

    /**
     * Get all files in a folder
     * @param folderPath Path to the folder
     * @returns Array of file paths
     */
    private async getFilesInFolder(folderPath: string): Promise<string[]> {
        const files: string[] = [];
        
        try {
            const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isFile()) {
                    const filePath = path.join(folderPath, entry.name);
                    files.push(filePath);
                }
            }
        } catch (error: any) {
            throw new Error(`Failed to read folder contents: ${error.message}`);
        }

        return files.sort(); // Sort alphabetically for consistent processing
    }

    /**
     * Process a batch of files
     * @param files Array of file paths to process
     * @param baseFolder Base folder path
     * @param spaceKey Optional space key
     * @param result Result object to update
     */
    private async processFileBatch(
        files: string[], 
        baseFolder: string, 
        spaceKey: string | undefined, 
        result: FileOrganizationResult
    ): Promise<void> {
        for (const filePath of files) {
            try {
                // Skip if file has already been moved
                if (this.movedFiles.has(filePath)) {
                    this.outputChannel.appendLine(`[Organize Files] Skipping already moved file: ${path.basename(filePath)}`);
                    continue;
                }

                const fileName = path.basename(filePath, path.extname(filePath));
                
                // Search for matching Confluence page
                const matchingPages = await this.client.searchPagesByTitle(fileName, spaceKey);
                
                if (matchingPages.length === 0) {
                    this.outputChannel.appendLine(`[Organize Files] No matching page found for file: ${fileName}`);
                    continue;
                }

                // Use the first matching page (most relevant)
                const page = matchingPages[0];
                this.outputChannel.appendLine(`[Organize Files] Found matching page for "${fileName}": "${page.title}" (ID: ${page.id})`);

                // Get page hierarchy
                const hierarchy = await this.client.getPageHierarchy(page.id);
                
                // Organize file based on hierarchy
                await this.organizeFileByHierarchy(filePath, page, hierarchy, baseFolder, result);

            } catch (error: any) {
                const fileName = path.basename(filePath);
                const errorMsg = `Failed to process file "${fileName}": ${error.message}`;
                result.errors.push(errorMsg);
                this.outputChannel.appendLine(`[Organize Files] ${errorMsg}`);
            }
        }
    }

    /**
     * Organize a single file based on its page hierarchy
     * @param filePath Path to the file
     * @param page The matching Confluence page
     * @param hierarchy Page hierarchy (parents)
     * @param baseFolder Base folder path
     * @param result Result object to update
     */
    private async organizeFileByHierarchy(
        filePath: string,
        page: Page,
        hierarchy: Page[],
        baseFolder: string,
        result: FileOrganizationResult
    ): Promise<void> {
        try {
            // Check if file still exists (might have been moved already)
            if (!fs.existsSync(filePath)) {
                this.outputChannel.appendLine(`[Organize Files] File no longer exists (already moved): ${path.basename(filePath)}`);
                return;
            }

            // If page has no parent, keep it in the base folder
            if (hierarchy.length <= 1) {
                this.outputChannel.appendLine(`[Organize Files] Page "${page.title}" has no parent, keeping in base folder`);
                return;
            }

            // Create folder structure based on hierarchy
            const folderPath = await this.createHierarchyFolders(hierarchy, baseFolder);
            
            // Move file to the appropriate folder
            const fileName = path.basename(filePath);
            const targetPath = path.join(folderPath, fileName);
            
            // Check if target file already exists
            if (fs.existsSync(targetPath)) {
                const errorMsg = `Target file already exists: ${targetPath}`;
                result.errors.push(errorMsg);
                this.outputChannel.appendLine(`[Organize Files] ${errorMsg}`);
                return;
            }

            // Move the file
            await fs.promises.rename(filePath, targetPath);
            result.organizedFiles++;
            this.movedFiles.add(filePath); // Track that this file has been moved
            
            this.outputChannel.appendLine(`[Organize Files] Moved "${fileName}" to "${path.relative(baseFolder, targetPath)}"`);

            // Process child pages if this is a parent page
            await this.processChildPages(page, baseFolder, result);

        } catch (error: any) {
            throw new Error(`Failed to organize file by hierarchy: ${error.message}`);
        }
    }

    /**
     * Create folder structure based on page hierarchy
     * @param hierarchy Page hierarchy (parents)
     * @param baseFolder Base folder path
     * @returns Path to the created folder
     */
    private async createHierarchyFolders(hierarchy: Page[], baseFolder: string): Promise<string> {
        // Skip the current page (last in hierarchy) and create folders for parents
        const parentPages = hierarchy.slice(0, -1);
        
        if (parentPages.length === 0) {
            return baseFolder;
        }

        let currentPath = baseFolder;
        
        for (const parentPage of parentPages) {
            const folderName = this.sanitizeFolderName(parentPage.title);
            currentPath = path.join(currentPath, folderName);
            
            // Create folder if it doesn't exist
            if (!fs.existsSync(currentPath)) {
                try {
                    await fs.promises.mkdir(currentPath, { recursive: true });
                    this.outputChannel.appendLine(`[Organize Files] Created folder: "${path.relative(baseFolder, currentPath)}"`);
                } catch (error: any) {
                    // If folder creation fails, try to use existing folder or create with suffix
                    if (error.code === 'EEXIST') {
                        this.outputChannel.appendLine(`[Organize Files] Folder already exists: "${path.relative(baseFolder, currentPath)}"`);
                    } else {
                        // Try to create folder with a suffix to avoid conflicts
                        const folderSuffix = Math.floor(Math.random() * 1000);
                        const alternativePath = `${currentPath}_${folderSuffix}`;
                        try {
                            await fs.promises.mkdir(alternativePath, { recursive: true });
                            currentPath = alternativePath;
                            this.outputChannel.appendLine(`[Organize Files] Created alternative folder: "${path.relative(baseFolder, currentPath)}"`);
                        } catch (altError: any) {
                            this.outputChannel.appendLine(`[Organize Files] Failed to create folder: "${path.relative(baseFolder, currentPath)}" - ${altError.message}`);
                            // Return the base folder as fallback
                            return baseFolder;
                        }
                    }
                }
            } else {
                this.outputChannel.appendLine(`[Organize Files] Using existing folder: "${path.relative(baseFolder, currentPath)}"`);
            }
        }

        return currentPath;
    }

    /**
     * Process child pages of a given page
     * @param parentPage The parent page
     * @param baseFolder Base folder path
     * @param result Result object to update
     */
    private async processChildPages(
        parentPage: Page,
        baseFolder: string,
        result: FileOrganizationResult
    ): Promise<void> {
        try {
            const childPages = await this.client.getChildPages(parentPage.id);
            
            if (childPages.length === 0) {
                return;
            }

            this.outputChannel.appendLine(`[Organize Files] Found ${childPages.length} child pages for "${parentPage.title}"`);

            // Create parent folder path
            const hierarchy = await this.client.getPageHierarchy(parentPage.id);
            const parentFolderPath = await this.createHierarchyFolders(hierarchy, baseFolder);

            // Look for files that match child page titles
            const files = await this.getFilesInFolder(baseFolder);
            
            for (const childPage of childPages) {
                const matchingFiles = files.filter(filePath => {
                    // Skip if file has already been moved
                    if (this.movedFiles.has(filePath)) {
                        return false;
                    }
                    
                    const fileName = path.basename(filePath, path.extname(filePath));
                    return this.isFileNameMatch(fileName, childPage.title);
                });

                for (const filePath of matchingFiles) {
                    try {
                        // Double-check if file still exists
                        if (!fs.existsSync(filePath)) {
                            this.outputChannel.appendLine(`[Organize Files] Child file no longer exists (already moved): ${path.basename(filePath)}`);
                            continue;
                        }

                        const fileName = path.basename(filePath);
                        const targetPath = path.join(parentFolderPath, fileName);
                        
                        // Check if target file already exists
                        if (fs.existsSync(targetPath)) {
                            const errorMsg = `Target file already exists: ${targetPath}`;
                            result.errors.push(errorMsg);
                            this.outputChannel.appendLine(`[Organize Files] ${errorMsg}`);
                            continue;
                        }

                        // Move the file
                        await fs.promises.rename(filePath, targetPath);
                        result.organizedFiles++;
                        this.movedFiles.add(filePath); // Track that this file has been moved
                        
                        this.outputChannel.appendLine(`[Organize Files] Moved child file "${fileName}" to parent folder "${path.relative(baseFolder, targetPath)}"`);

                    } catch (error: any) {
                        const fileName = path.basename(filePath);
                        const errorMsg = `Failed to move child file "${fileName}": ${error.message}`;
                        result.errors.push(errorMsg);
                        this.outputChannel.appendLine(`[Organize Files] ${errorMsg}`);
                    }
                }
            }

        } catch (error: any) {
            this.outputChannel.appendLine(`[Organize Files] Failed to process child pages: ${error.message}`);
        }
    }

    /**
     * Sanitize folder name to be filesystem-safe
     * @param name Original name
     * @returns Sanitized name
     */
    private sanitizeFolderName(name: string): string {
        return name
            .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    /**
     * Check if a filename matches a page title (flexible matching)
     * @param fileName File name (without extension)
     * @param pageTitle Page title
     * @returns True if they match
     */
    private isFileNameMatch(fileName: string, pageTitle: string): boolean {
        // Exact match
        if (fileName === pageTitle) {
            return true;
        }

        // Case-insensitive match
        if (fileName.toLowerCase() === pageTitle.toLowerCase()) {
            return true;
        }

        // Remove special characters and compare
        const normalize = (str: string) => str
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();

        return normalize(fileName) === normalize(pageTitle);
    }
}

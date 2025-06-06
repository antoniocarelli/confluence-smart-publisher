# 🔄 Sync with Published on Confluence
Compares and synchronizes local content with the published version on Confluence, allowing you to choose which version to keep.

**Command ID:** `confluence-smart-publisher.syncWithPublished`

## How to Use
1. Right-click on a `.confluence` file in the VS Code explorer
2. Select "Confluence Smart Publisher" > "Sync with Published on Confluence"
3. Choose the desired sync action:
   - Update local file with online content
   - Update Confluence with local content
   - Cancel

### "Sync with Published" Command Flow

The **Sync with Published** command (`syncWithPublished`) executes a series of steps to synchronize local content with the published version on Confluence. See the detailed flow:

1. **Initial Validation**
   - The command checks if the selected file has the `.confluence` extension
   - Validates if the file contains a valid page ID in `<csp:parameters>`
   - Verifies Confluence connectivity

2. **Content Comparison**
   - Downloads the current published version from Confluence
   - Compares local and published content
   - Identifies differences in:
     - Main content
     - Labels
     - Properties
     - Title and emojis

3. **Sync Options**
   - Presents the user with sync options:
     - Update local with online content
     - Update Confluence with local content
     - Cancel operation

4. **Sync Execution**
   - If updating local:
     - Downloads and converts published content
     - Updates local file while preserving CSP structure
   - If updating Confluence:
     - Converts local content to Confluence format
     - Updates the page via REST API
     - Syncs all metadata, properties and images

5. **User Feedback**
   - Displays a success message or an error message if something fails
   - Shows a summary of changes made

>Note: The entire flow is executed transparently, with logs in the "Output (CSP)" panel of VSCode to facilitate diagnosis in case of problems.

## Benefits
- Visual diff comparison
- Flexible sync options
- Prevents content loss
- Maintains version consistency

## Limitations
- Requires file to be previously published
- Needs proper Confluence credentials
- Internet connection required 
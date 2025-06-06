# 🎨 Format Document
Formats a `.confluence` file according to predefined rules, including optional chapter numbering.

**Command ID:** `confluence-smart-publisher.formatConfluence`

## How to Use
1. Right-click on a `.confluence` file in the VS Code explorer
2. Select "Confluence Smart Publisher" > "Format Document"

### "Format Document" Command Flow

The **Format Document** command (`formatConfluence`) executes a series of steps to standardize the formatting of a `.confluence` file. See the detailed flow:

1. **Initial Validation**
   - The command checks if the selected file has the `.confluence` extension
   - Validates if the file contains valid Confluence Storage Format content

2. **Content Analysis**
   - Reads the entire file content
   - Identifies document structure:
     - Headers and their levels
     - Lists and their nesting
     - Code blocks
     - Tables
     - CSP tags and parameters

3. **Formatting Application**
   - Applies consistent spacing and indentation
   - Standardizes header formatting
   - Normalizes list structures
   - Formats code blocks
   - Aligns table cells
   - Preserves CSP tags and their content

4. **Chapter Numbering**
   - If enabled, applies automatic chapter numbering
   - Updates all header references
   - Maintains document hierarchy

5. **File Update**
   - Updates the file with formatted content
   - Preserves all metadata and parameters
   - Maintains file integrity

6. **User Feedback**
   - Displays a success message or an error message if something fails

>Note: The entire flow is executed transparently, with logs in the "Output | CSP" panel of VSCode to facilitate diagnosis in case of problems.

## Benefits
- Consistent document structure
- Optional automatic chapter numbering
- Improved readability
- Standardized formatting

## Limitations
- Only works with `.confluence` files
- May modify existing formatting 
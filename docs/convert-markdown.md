# 🔄 Convert to Confluence Format
Converts a Markdown file to the Confluence Storage Format, creating a new `.confluence` file.

**Command ID:** `confluence-smart-publisher.convertMarkdown`

## How to Use
1. Right-click on a `.md` file in the VS Code explorer
2. Select "Confluence Smart Publisher" > "Convert to Confluence Format"

### "Convert to Confluence Format" Command Flow

The **Convert to Confluence Format** command (`convertMarkdown`) executes a series of steps to transform a Markdown file into the Confluence Storage Format. See the detailed flow:

1. **Initial Validation**
   - The command checks if the selected file has the `.md` extension. If not, it displays an error message.

2. **File Reading**
   - The file content is read for analysis and conversion.

3. **Markdown Parsing**
   - The system parses the Markdown content, identifying:
     - Headers and their levels
     - Lists (ordered and unordered)
     - Code blocks
     - Tables
     - Links and images
     - Text formatting (bold, italic, etc.)

4. **Confluence Format Conversion**
   - Converts each Markdown element to its Confluence Storage Format equivalent
   - Maintains the document structure
   - Preserves formatting and styling

5. **File Creation**
   - Creates a new `.confluence` file with the same name as the original
   - Writes the converted content to the new file
   - Preserves the original Markdown file

6. **User Feedback**
   - Displays a success message with the path of the created file or an error message if something fails

>Note: The entire flow is executed transparently, with logs in the "Output | CSP" panel of VSCode to facilitate diagnosis in case of problems.

## Benefits
- Easy migration from Markdown
- Supports common Markdown syntax
- Maintains formatting and structure
- Automatic file creation

## Limitations
- Only works with `.md` files
- Some complex Markdown features may not be fully supported
- May require manual adjustments after conversion 
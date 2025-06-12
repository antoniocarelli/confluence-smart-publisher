# 🔤 Decode HTML Entities
Converts HTML entities in your `.confluence` file to their corresponding special characters, while preserving parameters and tags to prevent data loss and formatting errors.

**Command ID:** `confluence-smart-publisher.decodeHtml`

## How to Use
1. Right-click on a `.confluence` file in the VS Code explorer
2. Select "Confluence Smart Publisher" > "Decode HTML Entities"

### "Decode HTML Entities" Command Flow

The **Decode HTML Entities** command (`decodeHtml`) executes a series of steps to convert HTML entities to their corresponding special characters while preserving CSP tags. See the detailed flow:

1. **Initial Validation**
   - The command checks if the selected file has the `.confluence` extension
   - Validates if the file contains valid Confluence Storage Format content

2. **Content Analysis**
   - Identifies and preserves all CSP tags (`<csp:*>`)
   - Locates HTML entities in the content
   - Maps entities to their corresponding special characters

3. **Entity Conversion**
   - Converts common HTML entities (e.g., `&amp;` to `&`, `&lt;` to `<`)
   - Preserves CSP tags during conversion
   - Maintains document structure and formatting

4. **File Update**
   - Updates the file with decoded content
   - Preserves all metadata and parameters
   - Maintains file integrity

5. **User Feedback**
   - Displays a success message or an error message if something fails

>Note: The entire flow is executed transparently, with logs in the "Output | CSP" panel of VSCode to facilitate diagnosis in case of problems.

## Benefits
- Improved readability
- Proper character display
- Easier editing
- Safe conversion that preserves parameters and tags

## Limitations
- Only works with `.confluence` files
- May affect some special formatting 
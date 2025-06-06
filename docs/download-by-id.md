# 🔢 Download Document by ID
Downloads a Confluence page using its unique ID and converts it to a local `.confluence` file.

**Command ID:** `confluence-smart-publisher.getPageById`

## How to Use
1. Right-click on a folder in the VS Code explorer
2. Select "Confluence Smart Publisher" > "Download Document by ID"
3. Enter the Confluence Page ID

### "Download Document by ID" Command Flow

The **Download Document by ID** command (`getPageById`) executes a series of steps to download and convert a Confluence page to a local `.confluence` file. See the detailed flow:

1. **Initial Validation**
   - The command checks if the selected path is a valid folder
   - Validates if the provided page ID exists in Confluence

2. **Page Retrieval**
   - Connects to Confluence using configured credentials
   - Downloads the page content using the provided ID
   - Retrieves all associated metadata:
     - Labels
     - Page properties
     - Title and emojis
     - Parent page information

3. **Content Conversion**
   - Converts the Confluence Storage Format to local format
   - Preserves all formatting and structure
   - Maintains images and attachments references

4. **File Creation**
   - Creates a new `.confluence` file
   - Sets up the `<csp:parameters>` block with page ID
   - Adds all metadata in appropriate CSP tags
   - Writes the converted content

5. **User Feedback**
   - Displays a success message with the path of the created file
   - Shows an error message if something fails

>Note: The entire flow is executed transparently, with logs in the "Output (CSP)" panel of VSCode to facilitate diagnosis in case of problems.

## Benefits
- Precise page retrieval using unique ID
- Converts to editable local format
- Maintains page structure and formatting
- Preserves metadata including:
  - Labels
  - Page properties
  - Title emojis
  - All metadata stored in CSP tags

## Limitations
- Requires knowledge of the page ID
- Needs proper Confluence credentials
- Internet connection required 
# 🔍 Download Document by Title
Downloads a Confluence page by its title and converts it to a local `.confluence` file.

**Command ID:** `confluence-smart-publisher.getPageByTitle`

## How to Use
1. Right-click on a folder in the VS Code explorer
2. Select "Confluence Smart Publisher" > "Download Document by Title"
3. Enter the Confluence Space Key
4. Enter the exact page title

### "Download Document by Title" Command Flow

The **Download Document by Title** command (`getPageByTitle`) executes a series of steps to download and convert a Confluence page to a local `.confluence` file using its title. See the detailed flow:

1. **Initial Validation**
   - The command checks if the selected path is a valid folder
   - Validates if the provided space key exists in Confluence
   - Verifies if the page title exists in the specified space

2. **Page Search**
   - Connects to Confluence using configured credentials
   - Searches for the page by title in the specified space
   - Retrieves the page ID and content
   - Gets all associated metadata:
     - Labels
     - Page properties
     - Title and emojis
     - Parent page id

3. **Content Conversion**
   - Converts the Confluence Storage Format to local format
   - Preserves all formatting and structure
   - Maintains images and attachments references

4. **File Creation**
   - Creates a new `.confluence` file
   - Sets up the `<csp:parameters>` block
   - Adds all metadata in appropriate CSP tags
   - Writes the converted content

5. **User Feedback**
   - Displays a success message with the path of the created file
   - Shows an error message if something fails

>Note: The entire flow is executed transparently, with logs in the "Output (CSP)" panel of VSCode to facilitate diagnosis in case of problems.

## Benefits
- Easy retrieval of existing Confluence pages
- Converts to editable local format
- Maintains page structure and formatting
- Preserves metadata including:
  - Labels
  - Page properties
  - Title emojis
  - All metadata stored in CSP tags

## Limitations
- Requires exact page title match
- Needs proper Confluence credentials
- Internet connection required 
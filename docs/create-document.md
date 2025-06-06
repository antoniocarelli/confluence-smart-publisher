# 📝 Create Document
Creates a new `.confluence` file based on a template from Confluence.

**Command ID:** `confluence-smart-publisher.createPage`

## How to Use
1. Right-click on a folder in the VS Code explorer
2. Select "Confluence Smart Publisher" > "Create Document"
3. Enter the desired file name
4. Enter the Template File ID

### "Create Document" Command Flow

The **Create Document** command (`createPage`) executes a series of steps to create a new document based on a Confluence template. See the detailed flow:

1. **Initial Validation**
   - The command checks if the selected path is a valid folder
   - Validates if the provided template ID exists in Confluence

2. **Template Retrieval**
   - Connects to Confluence using configured credentials
   - Downloads the template content using the provided ID
   - Converts the template to Confluence Storage Format

3. **File Creation**
   - Creates a new `.confluence` file with the specified name
   - Initializes the file with template content
   - Sets up the basic CSP parameters structure

4. **Metadata Setup**
   - Creates the `<csp:parameters>` block
   - Initializes empty `<csp:labels_list>` and `<csp:properties>` sections
   - Sets up the document structure for future publishing

5. **User Feedback**
   - Displays a success message with the path of the created file
   - Shows an error message if something fails

>Note: The entire flow is executed transparently, with logs in the "Output (CSP)" panel of VSCode to facilitate diagnosis in case of problems.

## Benefits
- Quick creation of new documents
- Template-based structure
- Consistent formatting

## Limitations
- Requires a valid template ID
- Needs proper Confluence credentials
- Internet connection required 
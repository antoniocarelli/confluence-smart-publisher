# 📤 Publish Document
Publishes a `.confluence` file to your Confluence space. This command will either create a new page or update an existing one if the file has been previously published.

**Command ID:** `confluence-smart-publisher.publishConfluence`

## How to Use
1. Right-click on a `.confluence` file in the VS Code explorer
2. Select "Confluence Smart Publisher" > "Publish Document"

### "Publish Document" Command Flow

The **Publish Document** command (`publishConfluence`) executes a series of steps to ensure that the content of the `.confluence` file is correctly published or updated on Confluence, keeping metadata and properties synchronized. See the detailed flow:

1. **Initial Validation**
   - The command checks if the selected file has the `.confluence` extension. If not, it displays an error message.

2. **File Reading**
   - The file content is read for analysis and information extraction.

3. **Page ID Verification**
   - The system looks for the `<csp:file_id>` tag in the `<csp:parameters>` block.
     - **If it exists**: understands that the page was previously published and performs an update on Confluence.
     - **If it doesn't exist**: creates a new page on Confluence.

4. **Page Creation or Update**
   - Creation:
     - Extracts information such as title, parentId, labels, and properties from the <csp:parameters> block.
     - Removes the <csp:parameters> block from the content before sending to Confluence.
     - Creates the page via Confluence REST API.
     - If there are referenced local images, performs a second update to attach them correctly.
   - Update:
     - Extracts the page ID.
     - Removes the <csp:parameters> block from the content.
     - Updates the page content via REST API.
     - If there are referenced local images, performs a second update to attach them correctly.

5. **Metadata Synchronization**
   - Adds labels defined in the <csp:labels_list> tag.
   - Updates properties defined in the <csp:properties> tag.

6. **ID Persistence**
   - If the page was created (no <csp:file_id> existed), writes the new ID at the beginning of the local file, inside the <csp:parameters> block.

7. **User Feedback**
   - Displays a success message with the ID of the published page or an error message if something fails.
>Note: The entire flow is executed transparently, with logs in the "Output | CSP" panel of VSCode to facilitate diagnosis in case of problems.


## Benefits
- One-click publishing to Confluence
- Automatic handling of new pages and updates
- Maintains metadata and properties synchronization
- Supports image attachments

## Limitations
- Requires a valid `.confluence` file
- Needs proper Confluence credentials configured
- Internet connection required 
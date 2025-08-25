
# Download All Space Pages Feature

## 1. Need Reported

Currently, the extension allows users to download individual pages from Confluence. There is a need for a new command that enables users to download all pages within a specified Confluence space. This command should convert each downloaded page to Markdown format, similar to the existing `convertConfluenceToMarkdown` command, and save them to a user-specified local folder.

## 2. Implementation Steps

### 2.1. API Integration

- **Identify Confluence API Endpoint:** Use the `GET /spaces/{id}/pages` endpoint from the Confluence Cloud REST API v2 to retrieve pages within a space. This endpoint supports pagination, which is crucial for handling spaces with a large number of pages.
- **Authentication:** Ensure the existing Confluence API client handles authentication for this new endpoint.
- **Pagination Logic:** Implement a loop or recursive function to fetch all pages by iterating through the `next` URL provided in the `Link` response header until all pages are retrieved.

### 2.2. Command Definition and Registration

- **New Command:** Define a new VS Code command (e.g., `confluence.downloadAllSpacePages`).
- **User Input:** Prompt the user to enter the Confluence Space ID. Input validation should be implemented to ensure a valid ID is provided.
- **Context Menu Integration:** Integrate the command into the VS Code explorer context menu, allowing users to right-click a folder and select this command. The selected folder will be the destination for the downloaded files.

### 2.3. Page Processing and Conversion

- **Iterate and Download:** For each page retrieved from the Confluence API:
    - Download the page content.
    - Call the existing `convertConfluenceToMarkdown` command/function to convert the Confluence page content (ADF) to Markdown.
    - Save the converted Markdown content to a file in the selected local folder. The filename should be derived from the page title.

### 2.4. Error Handling and User Feedback

- **API Errors:** Handle potential API errors (e.g., invalid space ID, permission issues, network errors).
- **Conversion Errors:** Gracefully handle errors during Markdown conversion.
- **User Progress:** Provide feedback to the user on the download progress (e.g., number of pages downloaded, current page being processed).
- **Completion/Error Messages:** Inform the user upon successful completion or if any errors occurred.

## 3. Acceptance Criteria

- The user can trigger the command from the VS Code explorer context menu.
- The command prompts for a Confluence Space ID.
- All pages from the specified space are downloaded.
- Each downloaded page is converted to Markdown using the `convertConfluenceToMarkdown` command.
- Converted Markdown files are saved in the folder where the command was initiated.
- The command handles spaces with a large number of pages using pagination.
- Appropriate error messages are displayed for invalid Space IDs, API errors, or conversion failures.
- User progress is displayed during the download and conversion process.
- No existing functionality is broken or negatively impacted.

## 4. Senior Developer Considerations

- **Code Reusability:** Maximize the reuse of existing components, especially `confluenceClient.ts` for API interactions and `adf-to-md-converter.ts` (or `markdownConverter.ts` which uses it) for Markdown conversion. Avoid duplicating API call logic or conversion logic.
- **Modularity:** Design the new command in a modular way, separating concerns (API calls, file operations, UI interactions) to ensure maintainability and testability.
- **Performance:** Pay attention to potential performance bottlenecks, especially when dealing with a large number of pages. Efficient pagination and asynchronous operations are critical.
- **Error Handling Robustness:** Implement comprehensive error handling and logging to diagnose issues in production.
- **User Experience:** Ensure the user interface (input prompts, progress indicators, messages) is intuitive and provides clear feedback.
- **Testing:** Add unit and integration tests for the new command, covering API interactions, pagination, conversion, and file saving.
- **Security:** Ensure that any API keys or credentials are handled securely and not exposed.
- **Internationalization:** Ensure all user-facing strings are localized (if the extension supports multiple languages).
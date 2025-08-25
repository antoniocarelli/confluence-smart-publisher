# Organize Files Feature

## 1. Need Reported

Currently, when users download multiple pages from Confluence, the files are saved in a flat structure within a single folder. This creates organizational challenges when working with large numbers of files, especially when the original Confluence space has a hierarchical structure with parent-child relationships between pages. There is a need for a new command that automatically organizes downloaded files into folders that mirror the Confluence page hierarchy, making it easier to navigate and manage the downloaded content.

## 2. Implementation Steps

### 2.1. Confluence API Integration

- **Page Hierarchy Retrieval:** Use the Confluence Cloud REST API v2 to retrieve page hierarchy information, including parent-child relationships.
- **Page Search by Title:** Implement functionality to search for Confluence pages by title to establish the connection between local files and Confluence pages.
- **Parent Information Retrieval:** For each identified page, retrieve its parent page information to understand the hierarchical structure.
- **Child Pages Discovery:** Query all child pages of a given parent to identify which local files should be moved to the same folder.

### 2.2. Command Definition and Registration

- **New Command:** Define a new VS Code command (e.g., `confluence.organizeFiles`).
- **User Input:** Prompt the user to select a folder containing downloaded Confluence files that need to be organized.
- **Context Menu Integration:** Integrate the command into the VS Code explorer context menu, allowing users to right-click a folder and select this command to organize its contents.

### 2.3. File Organization Algorithm

The organization process follows these steps:

1. **Initial File Analysis:**
   - Scan the selected folder for all files
   - Identify the first file in the folder (alphabetically or by creation date)
   - Extract the filename (without extension) to use as the search term

2. **Confluence Page Matching:**
   - Search Confluence for a page with the same title as the first file
   - If found, retrieve the parent page information
   - If the page has a parent, create a folder with the parent's name

3. **File Movement Logic:**
   - Move the first file to the newly created parent folder
   - If the first file's corresponding page has a parent, and that parent also has a parent, create additional nested folders as needed

4. **Child Page Processing:**
   - Query all child pages of the identified parent
   - For each child page, search for corresponding files in the original folder
   - Move matching files to the same parent folder

5. **Recursive Organization:**
   - Repeat the process for any remaining files in the original folder
   - Continue until all files are organized into appropriate hierarchical folders

### 2.4. Special Cases Handling

- **Parent File Detection:** If a file with the same name as a parent page is found, it should be moved to the parent folder along with its children
- **Nested Parent Structure:** If a parent page also has a parent, create the complete folder hierarchy and move the entire folder structure accordingly
- **File Name Matching:** Implement flexible matching algorithms to handle slight variations between file names and page titles (e.g., special characters, case sensitivity)

### 2.5. Error Handling and User Feedback

- **API Errors:** Handle potential API errors (e.g., network issues, authentication problems, page not found)
- **File System Errors:** Gracefully handle file system errors (e.g., permission issues, disk space problems)
- **Progress Tracking:** Provide real-time feedback on the organization progress
- **Conflict Resolution:** Handle cases where folders with the same name already exist
- **Completion Summary:** Display a summary of the organization results upon completion

## 3. Acceptance Criteria

- The user can trigger the command from the VS Code explorer context menu by right-clicking on a folder
- The command automatically analyzes the folder contents and identifies files that correspond to Confluence pages
- Files are organized into folders that mirror the Confluence page hierarchy
- Parent-child relationships are correctly established and maintained
- Files with names matching parent pages are moved to the appropriate parent folders
- The command handles nested parent structures by creating the complete folder hierarchy
- All files from the original folder are processed and organized
- The command provides clear progress feedback during the organization process
- Appropriate error messages are displayed for API errors, file system issues, or matching failures
- The original folder structure is preserved for files that cannot be matched to Confluence pages
- No existing functionality is broken or negatively impacted

## 4. Senior Developer Considerations

- **Code Reusability:** Maximize the reuse of existing components, especially `confluenceClient.ts` for API interactions and existing page search functionality
- **Performance Optimization:** Implement efficient algorithms for file matching and folder creation, especially when dealing with large numbers of files
- **Memory Management:** Ensure the solution can handle folders with hundreds or thousands of files without memory issues
- **Concurrency:** Consider implementing parallel processing for API calls and file operations where appropriate
- **Data Consistency:** Implement mechanisms to ensure the folder structure accurately reflects the Confluence hierarchy
- **Rollback Capability:** Consider providing an option to undo the organization if needed
- **Logging and Debugging:** Implement comprehensive logging to help diagnose issues during development and production use
- **Testing Strategy:** Add unit tests for the matching algorithms, integration tests for API interactions, and end-to-end tests for the complete workflow
- **User Experience:** Ensure the organization process is intuitive and provides clear feedback about what is happening at each step
- **Error Recovery:** Implement robust error recovery mechanisms to handle partial failures during the organization process
- **Configuration Options:** Consider providing configuration options for matching algorithms, folder naming conventions, and error handling preferences

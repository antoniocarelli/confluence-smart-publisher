# ✨ Smart Snippets
Automatic suggestions of XML code blocks for custom tags, with completion of required and optional attributes, speeding up document writing.

## How to Use
1. Open any `.confluence` file
2. Type `csp` to trigger the snippet suggestions
3. Select the desired snippet from the list
4. Use Tab to navigate through the required fields

## Available Snippets

### Basic Structure
- `csp-parameters` - Creates the CSP parameters block with file ID, labels, parent ID and properties
- `csp-layout` - Creates page layouts with different section types (single, two columns, three columns, etc.)

### Content Elements
- `csp-table` - Creates a complete table with headers, body and footer
- `csp-code` - Adds a code block with language selection
- `csp-image` - Inserts an image with filename and width parameters
- `csp-link` - Creates a link with appearance options (inline, block, embed)
- `csp-quote` - Adds a blockquote

### Confluence Macros
- `csp-info` - Adds information panels (info, tip, note, warning, error)
- `csp-task` - Creates a task list with status and assignee
- `csp-expand` - Creates an expandable section with title
- `csp-user` - Inserts a user mention
- `csp-date` - Adds a date/time element
- `csp-status` - Adds a status indicator with color options
- `csp-emoji` - Inserts an emoticon with various options

### Confluence Specific
- `csp:status` - Adds a status macro
- `csp:expand` - Creates an expandable section
- `csp:column` - Adds a column layout
- `csp:ac` - Inserts an Atlassian Connect macro
- `csp:jira` - Adds a Jira issues macro
- `csp:children` - Inserts a children display macro
- `csp:attachments` - Adds an attachments macro

### Metadata
- `csp:parameters` - Creates the CSP parameters block
- `csp:labels` - Adds labels to the page
- `csp:properties` - Adds page properties

### "Smart Snippets" Flow

The **Smart Snippets** feature provides intelligent code snippets for common Confluence Storage Format patterns. See the detailed flow:

1. **Snippet Trigger**
   - Monitors typing in `.confluence` files
   - Detects the `csp` trigger
   - Shows available snippets
   - Provides snippet descriptions

2. **Snippet Selection**
   - Displays categorized snippets
   - Shows snippet previews
   - Provides usage examples
   - Allows quick selection

3. **Template Insertion**
   - Inserts complete tag structure
   - Includes required attributes
   - Adds optional attributes
   - Maintains proper formatting

4. **Field Navigation**
   - Highlights required fields
   - Allows tab navigation
   - Provides field descriptions
   - Validates input values

5. **Context Awareness**
   - Adapts to document structure
   - Maintains proper nesting
   - Ensures valid placement
   - Prevents invalid insertions

>Note: The snippets feature is always available in `.confluence` files, just type `csp` to see the available options.

## Benefits
- Rapid document creation
- Consistent tag structure
- Reduced typing errors
- Better code organization

## Limitations
- Only works with `.confluence` files
- Requires proper XML formatting
- May need manual adjustment for complex cases 
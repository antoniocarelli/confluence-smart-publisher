# 😊 Set Title Emoji
Adds an emoji to your page title, which will be displayed in both draft and published versions.

**Command ID:** `confluence-smart-publisher.setEmojiTitle`

## How to Use
1. Right-click on a `.confluence` file in the VS Code explorer
2. Select "Confluence Smart Publisher" > "Set Title Emoji"
3. Choose an emoji from the picker

### "Set Title Emoji" Command Flow

The **Set Title Emoji** command (`setEmojiTitle`) executes a series of steps to add or update an emoji in the page title. See the detailed flow:

1. **Initial Validation**
   - The command checks if the selected file has the `.confluence` extension
   - Validates if the file contains valid Confluence Storage Format content

2. **Emoji Selection**
   - Opens the emoji picker interface
   - Waits for user selection
   - Validates the selected emoji

3. **Title Analysis**
   - Reads the current page title
   - Checks for existing emoji
   - Determines the best position for the new emoji

4. **Title Update**
   - Updates the title in the `<csp:parameters>` block
   - Preserves the emoji for both draft and published versions
   - Maintains title formatting and structure

5. **File Update**
   - Updates the file with the new title
   - Preserves all other metadata and parameters
   - Maintains file integrity

6. **User Feedback**
   - Displays a success message or an error message if something fails

>Note: The entire flow is executed transparently, with logs in the "Output | CSP" panel of VSCode to facilitate diagnosis in case of problems.

## Technical Details
- The emoji is configured in the CSP (Confluence Smart Publisher) tag
- The emoji will only be visible in the Confluence page after publishing

## Benefits
- Visual enhancement of page titles
- Easy emoji selection
- Consistent emoji usage across versions

## Limitations
- Only works with `.confluence` files
- Requires file to be properly formatted
- Emoji visibility is limited to the published Confluence page
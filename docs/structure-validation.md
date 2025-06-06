# 🔍 Structure Validation
Real-time validation of document structure, ensuring all required tags and attributes are properly formatted.

## How to Use
The validation runs automatically as you type in any `.confluence` file. No manual command is needed.

### "Structure Validation" Flow

The **Structure Validation** feature executes a series of checks in real-time to ensure your document follows the correct Confluence Storage Format structure. See the detailed flow:

1. **Initial Validation**
   - The system monitors all `.confluence` files in your workspace
   - Validates the structure in real-time
   - Checks for required tags and attributes

2. **Tag Analysis**
   - Verifies the presence of required tags
   - Validates tag nesting and hierarchy
   - Checks for proper tag closure

3. **Attribute Validation**
   - Verifies required attributes are present
   - Validates attribute values
   - Checks for proper attribute formatting
   - Ensures attribute values match expected patterns

4. **Visual Feedback**
   - Displays errors and warnings in the Problems panel
   - Shows inline error indicators
   - Provides hover information for issues
   - Offers quick fixes when available

5. **Auto-correction**
   - Suggests automatic fixes for common issues
   - Provides one-click solutions for simple problems
   - Maintains document integrity during corrections

>Note: The entire validation process runs transparently in the background, with real-time feedback in the editor.

## Benefits
- Immediate feedback on structure issues
- Prevents invalid document publication
- Reduces manual error checking
- Improves document quality

## Limitations
- Only works with `.confluence` files
- Requires proper XML formatting
- Some complex validations may require manual intervention 
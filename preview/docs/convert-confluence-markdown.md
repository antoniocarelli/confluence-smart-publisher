# Convert Confluence to Markdown

This command converts Confluence Storage Format files (`.confluence`) to Markdown format (`.md`), preserving the document structure and formatting.

## Supported Elements

### 1. Metadata
The converter extracts metadata from the `<csp:parameters>` block and creates a YAML front matter:

```yaml
---
file_id: "123456"
labels: ["user-story", "scope", "pending"]
version: "1.0"
status: "current"
lastModified: "2025-06-09"
---
```

### 2. Headers
Converts Confluence headers to Markdown format:

```markdown
# H1 Title
## H2 Title
### H3 Title
#### H4 Title
##### H5 Title
###### H6 Title
```

### 3. Tables
Converts Confluence tables to Markdown format:

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

### 4. Lists
Supports both ordered and unordered lists:

```markdown
1. First item
2. Second item
   - Subitem 1
   - Subitem 2
3. Third item

- Unordered item 1
- Unordered item 2
  - Nested item 1
  - Nested item 2
```

### 5. Code Blocks
Preserves language specification:

```markdown
```typescript
const code = "example";
```
```

### 6. Info Blocks
Converts Confluence macros to Markdown with emojis:

| Confluence Macro | Markdown Output |
|-----------------|----------------|
| `ac:name="info"` | `> ℹ️ **Info**: Text` |
| `ac:name="tip"` | `> 💡 **Tip**: Text` |
| `ac:name="note"` | `> 📝 **Note**: Text` |
| `ac:name="warning"` | `> ⚠️ **Warning**: Text` |
| `ac:name="error"` | `> ⛔ **Error**: Text` |

### 7. Expandable Sections
Converts Confluence expand macros to HTML details:

```markdown
<details>
<summary>Expandable Title</summary>

Content inside the expandable section
</details>
```

### 8. Links
Converts both internal and external links:

```markdown
[Internal Link](#section-id)
[External Link](https://example.com)
```

## Usage

1. Right-click on a `.confluence` file in the VS Code explorer
2. Select "Confluence Smart Publisher" from the context menu
3. Choose "Convert to Markdown"
4. The converted file will be saved in the same directory with `.md` extension

## Notes

- The converter preserves the document structure and formatting
- HTML entities are automatically decoded
- Links to other Confluence pages are converted to anchor links
- The original file is not modified
- The converted file includes a YAML front matter with metadata 
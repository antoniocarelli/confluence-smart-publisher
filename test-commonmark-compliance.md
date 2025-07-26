# CommonMark Compliance Test

This document tests the CommonMark Spec v0.31.2 compliance of the refactored Confluence JSON -> Markdown converter.

## Headings (ATX Style)

# H1 Heading
## H2 Heading  
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

## Emphasis and Strong

*This is emphasis*

**This is strong**

***This is strong emphasis***

`This is code`

## Lists

### Bullet Lists

- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
    - Deep nested item
- Item 3

### Ordered Lists

1. First item
2. Second item
   - Mixed nested bullet
   - Another bullet
3. Third item
   1. Nested ordered
   2. Another ordered

### Lists with Multi-line Content

- This is a list item
  with continuation on the next line

- This is another item
  
  With a paragraph break

## Code Blocks

```javascript
function hello() {
    console.log("Hello, CommonMark!");
}
```

```python
def commonmark_test():
    return "All tests passing!"
```

```
Plain code block without language
```

## Links

[Simple link](https://example.com)

[Link with title](https://example.com "Example Site")

[Link with parentheses](https://example.com/path(with)parens)

## Tables (GitHub Flavored Markdown)

| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Cell 1 | Cell 2 | Cell 3 |
| Cell 4 | Cell 5 | Cell 6 |

## Property Table Style

**Name:** John Doe

**Role:** Developer

**Location:** Remote

## Admonitions (Material for MkDocs)

!!! note "Important Note"
    This is a note admonition that should render properly
    with the Material for MkDocs styling.

!!! warning "Warning"
    This is a warning that demonstrates proper admonition
    formatting with CommonMark compliance.

## Mixed Content Test

This paragraph contains **bold text**, *italic text*, `inline code`, and a [link](https://example.com).

Here's a complex list:

1. First item with **bold**
   
   This is a continuation paragraph.
   
   ```bash
   echo "Code block in list"
   ```
   
2. Second item with *emphasis*
   - Nested bullet with `code`
   - Another bullet
     1. Deep nested ordered
     2. Another deep item

## Line Breaks and Paragraphs

This is paragraph one.

This is paragraph two after a blank line.

This is a line\
with a hard break.

## Escaping

These should be literal: \*not emphasized\* \`not code\` \[not a link\]

## Complex Nested Example

- **Project Setup**
  
  1. Clone the repository
  2. Install dependencies
     ```bash
     npm install
     ```
  3. Configure settings
     
     Edit the `config.json` file:
     
     ```json
     {
       "commonmark": true,
       "version": "0.31.2"
     }
     ```

- **Testing**
  
  Run the test suite with `npm test`

---

*This test file validates that all generated Markdown follows CommonMark Spec v0.31.2*
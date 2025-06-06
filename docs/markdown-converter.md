# Markdown to Confluence Storage Format Converter

## Overview

This feature will allow users to convert Markdown files (`.md`) to Confluence Storage Format (`.confluence`), making it easier to publish content from various sources to Confluence. The conversion will create a new file with the `.confluence` extension, leaving the original Markdown file untouched.

## Important Notes

1. The conversion process is **read-only** - it will not modify the original Markdown file
2. A new file will be created with the same name and location as the original, but with `.confluence` extension
3. The converted file will need to be published separately using the existing publish functionality
4. Initial version will support only standard Markdown elements, without Confluence-specific markup

## Technical Design

### 1. Core Components

#### 1.1 Markdown Parser
- Utilize `marked` library for parsing Markdown
- Support for CommonMark specification
- Focus on standard Markdown elements only

#### 1.2 Confluence Storage Format Generator
- Convert parsed Markdown AST to basic Confluence Storage Format
- Generate proper XML structure
- Focus on standard HTML elements without Confluence macros

### 2. Conversion Rules

#### 2.1 Basic Elements (Initial Scope)
- Headers (`#` to `######`) → `<h1>` to `<h6>`
- Paragraphs → `<p>`
- Lists (ordered/unordered) → `<ul>`/`<ol>`
- Links → `<a>`
- Images → `<ac:image>`
- Code blocks → `<ac:structured-macro>`
- Tables → `<table>`

#### 2.2 Special Cases (Initial Scope)
- Code highlighting → `<ac:parameter>`
- Task lists → `<ac:task-list>`
- Blockquotes → `<blockquote>`
- Horizontal rules → `<hr>`

### 3. Implementation Phases

#### Phase 1: Basic Conversion
- Implement core Markdown parsing
- Basic element conversion
- Simple file handling
- Create new `.confluence` file without modifying original

#### Phase 2: Advanced Features
- Support for basic Confluence macros
- Image handling
- Table formatting
- Code block syntax highlighting

#### Phase 3: Enhancement
- Metadata handling
- Error recovery
- Progress reporting

### 4. User Interface

#### 4.1 Command Palette
- New command: "Convert Markdown to Confluence"
- Available in file explorer context menu, for .md files
- Creates new `.confluence` file in the same directory

#### 4.2 Settings
- Conversion preferences
- Default macro mappings
- Image handling options

### 5. Error Handling

- Invalid Markdown syntax
- Unsupported features
- File system errors
- File already exists errors

### 6. Performance Considerations

- Large file handling
- Memory usage optimization
- Progress reporting for long conversions

## Implementation Plan

1. **Setup Phase**
   - Add necessary dependencies
   - Create basic project structure

2. **Core Development**
   - Implement Markdown parser integration
   - Create basic conversion logic
   - Add file handling capabilities
   - Implement new file creation logic

3. **Documentation**
   - User guide
   - API documentation
   - Example conversions
   - Troubleshooting guide

## Dependencies

- `marked`: Markdown parsing
- `xml-escape`: XML character escaping
- `fs-extra`: Enhanced file system operations
- `vscode`: VS Code extension API

## Future Enhancements

1. **Custom Templates**
   - Allow users to define custom conversion rules
   - Template-based conversion

2. **Batch Processing**
   - Convert entire directories
   - Handle multiple files simultaneously

3. **Preview**
   - Real-time preview of conversion
   - Side-by-side comparison

4. **Confluence Macros**
   - Support for Confluence-specific macros
   - Macro configuration interface

## Limitations

1. Only standard Markdown features will be supported initially
2. No automatic publishing - manual publishing required after conversion
3. Complex nested structures might require manual adjustment
4. Custom Markdown extensions are not supported
5. Confluence macros are not supported in initial version

## Success Criteria

1. Successful conversion of basic Markdown elements
2. Proper handling of images and attachments
3. Accurate conversion of tables and code blocks
4. Maintainable and extensible codebase
5. Good performance with large files
6. Clear error messages and recovery options
7. Original Markdown file remains unchanged
8. New `.confluence` file is created successfully 
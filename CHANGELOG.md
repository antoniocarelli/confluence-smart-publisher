# Change Log

All notable changes to the "confluence-smart-publisher" extension will be documented in this file.

## [0.4.4] - 2025-01-27
### Major New Feature: File Organization by Confluence Hierarchy
- **📁 Smart File Organization**: New command to automatically organize downloaded Confluence files into folders that mirror the original page hierarchy
- **🔍 Intelligent Page Matching**: Uses Confluence API to match local files with their corresponding pages by title
- **🌳 Hierarchy Preservation**: Creates folder structure based on parent-child relationships from Confluence
- **🔄 Batch Processing**: Processes files in batches to avoid overwhelming the Confluence API
- **🎯 Flexible Matching**: Implements smart matching algorithms to handle variations between file names and page titles
- **⚡ Progress Tracking**: Real-time progress updates and detailed logging in the output channel
- **🛡️ Error Handling**: Comprehensive error handling for API failures, file system issues, and conflicts
- **🎛️ Space Filtering**: Optional space key filtering to limit search scope and improve performance
- **📋 Context Menu Integration**: New "Organize Files by Confluence Hierarchy" command available in explorer context menu

#### Technical Implementation
- **New API Methods**: Added `getChildPages()`, `getPageHierarchy()`, and `searchPagesByTitle()` to ConfluenceClient
- **FileOrganizer Class**: New `src/file-organizer.ts` with complete organization logic
- **Command Integration**: Added `confluence-smart-publisher.organizeFiles` command with user-friendly prompts
- **Package Configuration**: Updated package.json with new command and menu entries
- **Type Safety**: Full TypeScript implementation with proper interfaces and error handling

#### User Experience
- **Simple Workflow**: Right-click any folder → "Organize Files by Confluence Hierarchy"
- **Optional Space Filtering**: Choose to limit search to specific Confluence space for better performance
- **Clear Feedback**: Progress notifications and detailed results summary
- **Conflict Resolution**: Handles file name conflicts gracefully with clear error reporting
- **Preservation**: Files that can't be matched remain in their original location

## [0.4.3] - 2025-07-29
### MAJOR: Custom Admonition Implementation
- **🔧 Replaced External Dependency**: Removed `markdown-it-admonition` dependency and implemented custom admonition plugin
- **📝 Full Admonition Support**: Complete implementation supporting all 12 admonition types with aliases
  - `note`, `abstract/summary/tldr`, `info/todo`, `tip/hint/important`
  - `success/check/done`, `question/help/faq`, `warning/caution/attention`
  - `failure/fail/missing`, `danger/error`, `bug`, `example`, `quote/cite`
- **🎯 Material for MkDocs Compatibility**: 100% compatible with Material for MkDocs admonition syntax
- **⚡ Improved Performance**: Custom implementation optimized for project-specific needs
- **🛡️ Enhanced Maintainability**: Internal code control eliminates external dependency risks
- **✅ Comprehensive Testing**: Extensive test coverage including edge cases and alias validation
- **📋 Specification Compliance**: Follows CommonMark standards with proper 4-space indentation requirement

#### Technical Implementation
- Created `src/plugins/admonition-plugin.ts` with full parser implementation
- Updated `src/preview/MarkdownRenderer.ts` to use custom plugin
- Maintained complete CSS/SCSS compatibility with existing styling
- Zero breaking changes - all existing functionality preserved

## [0.4.2] - 2025-07-28
### BUGFIX: Adjust alignment of markers in ordered lists and correct task item formatting
- Modify the rendering of the first line in ordered lists to include a padded marker for consistent alignment.
- Update the indentation of subsequent lines to ensure compliance with CommonMark standards.
- Correct the formatting of the generated markdown for task items, removing an extra space before the line break.

These changes aim to improve the presentation and readability of the generated markdown.

## [0.4.1] - 2025-07-27
### Major Enhancement: CommonMark Compliance
- **🎯 CommonMark Spec v0.31.2 Compliance**: Refactored the Confluence JSON -> Markdown converter to be fully compliant with CommonMark Spec v0.31.2
- **📝 Improved Markdown Generation**: Enhanced all converter modules to produce clean, portable, and standard-compliant Markdown
- **🔧 List Formatting Overhaul**: Fixed bullet and ordered list formatting with proper indentation and consistent markers
  - Bullet lists now use consistent `-` markers with proper 2-space indentation per nesting level
  - Ordered lists follow CommonMark continuation indentation rules
  - Improved handling of nested list structures
- **💪 Enhanced Text Processing**: Upgraded text converter with proper CommonMark emphasis and strong emphasis handling
  - Correct precedence rules for nested formatting (***text*** for strong emphasis)
  - Proper code span precedence over other formatting
  - Improved link formatting with URL escaping
- **🎨 Code Block Improvements**: Updated code block generation to follow CommonMark fenced code block specification
  - Removed improper leading newlines
  - Enhanced language info string handling
  - Proper fence formatting on dedicated lines
- **📊 Table Enhancement**: Improved table converter with GitHub Flavored Markdown compatibility
  - Better pipe character escaping
  - Enhanced header detection and separator generation
  - Property table formatting improvements
- **🔗 Link Processing**: Enhanced link converter with proper URL escaping and CommonMark compliance
- **📋 Heading Standardization**: Ensured ATX heading compliance with level constraints and spacing requirements

### Preview Engine Enhancements
- **🎨 Enhanced Styling**: Added CommonMark-specific CSS improvements for tables, lists, and code blocks
- **🔧 Better Plugin Support**: Improved markdown-it configuration for CommonMark compliance
- **📱 Responsive Tables**: Enhanced table styling with proper borders and spacing
- **📝 List Improvements**: Better visual formatting for nested lists and list item content
- **✨ Advanced Syntax Highlighting**: Integrated highlight.js for professional code highlighting
  - Support for 20+ programming languages (Java, Python, JavaScript, TypeScript, SQL, PHP, C#, etc.)
  - Smart language detection and normalization
  - GitHub Dark theme optimized for Material Design
  - Language-specific enhancements for better readability
  - Automatic fallback for unsupported languages

### Technical Improvements
- **🏗️ Architecture Cleanup**: Improved converter code organization and documentation
- **📚 Documentation**: Enhanced inline documentation with CommonMark specification references
- **✅ Standards Compliance**: All generated Markdown now passes CommonMark validation
- **🎯 Consistency**: Unified formatting approach across all converter modules
- **📦 Dependencies**: Added highlight.js (v11.9.0) for advanced syntax highlighting
- **🎨 Enhanced CSS**: Custom GitHub Dark theme with Material Design integration
- **🔧 Language Support**: Smart language normalization and alias handling

## [0.4.0] - 2025-07-25
### Major New Feature
- **🔍 Material for MkDocs Preview System**
  - ✨ **Live Markdown Preview**: Added high-fidelity Markdown preview with Material for MkDocs styling
  - 🎨 **Authentic Styling**: Integrated real CSS from mkdocs-material repository (v9.6.15) for pixel-perfect rendering
  - 📝 **Admonitions Support**: Full support for 8 admonition types (`note`, `tip`, `warning`, `danger`, `success`, `info`, `question`, `quote`)
  - ⚡ **Real-time Updates**: Auto-refresh preview with debounced updates (300ms) as you type
  - 🎯 **Smart Context**: Automatically detects Markdown files and provides appropriate UI states
  - 🔧 **Command Integration**: New `confluence-smart-publisher.preview` command accessible via Command Palette and context menu
  - 🎪 **WebviewPanel Management**: Sophisticated panel lifecycle management with singleton pattern
  - 📱 **Responsive Design**: Mobile-friendly preview that works on all screen sizes
  - 🛡️ **Fallback Support**: Comprehensive fallback CSS when Material files unavailable
  - 🔄 **SCSS Processing**: Built-in SCSS variable processing for Material Design colors

### Technical Enhancements
- **📦 New Dependencies**: Added `markdown-it` and `markdown-it-admonition` for advanced Markdown processing
- **🏗️ Modular Architecture**: New `src/preview/` directory with `MarkdownRenderer` and `PreviewPanel` classes
- **🎨 Asset Management**: CSS assets system in `assets/css/` with Material for MkDocs files
- **📋 Package Integration**: Updated package.json with new preview command and context menu entries
- **🔄 CSS Integration**: Direct integration of mkdocs-material SCSS files (v9.6.15) with automatic processing
- **🎨 Material Design Colors**: Full color palette support with SCSS variable processing
- **🛠️ TypeScript Enhancements**: Enhanced type safety with proper fs module integration

### Documentation & Validation
- **📖 Comprehensive Guide**: Added `MATERIAL_CSS_GUIDE.md` with detailed CSS integration instructions
- **🧪 Validation System**: Created extensive test suite with `test-case.md` and validation HTML pages
- **🔍 Visual Testing**: Generated validation pages for comparing rendering fidelity
- **📋 Assets Documentation**: Complete guide for Material for MkDocs CSS extraction and integration

### Files Added/Modified
- **New Files**: 
  - `src/preview/MarkdownRenderer.ts` - Core markdown rendering with Material styling
  - `src/preview/PreviewPanel.ts` - WebviewPanel lifecycle management
  - `assets/css/material.css` - Main mkdocs-material SCSS file (91 lines)
  - `assets/css/palette.scss` - Color palette definitions (41 lines)  
  - `assets/css/admonitions.scss` - Admonition styling (196 lines)
  - `MATERIAL_CSS_GUIDE.md` - CSS integration guide
  - `test-case.md` - Comprehensive test document
  - `validation.html` & `validation-updated.html` - Visual validation pages

## [0.3.3] - 2025-07-23
### Enhanced
- **🎨 Panel Converter Enhancement**
  - ✅ **Material for MkDocs Admonition Support**: Panel converter now uses Material for MkDocs Admonition format instead of blockquotes
  - 🔄 **Comprehensive Panel Type Mapping**: Complete mapping of all Confluence panel types (`info`, `note`, `warning`, `success`, `error`, `tip`, `example`, `quote`, `abstract`, `failure`, `bug`, `question`, `custom`)
  - 🎯 **Smart Title Extraction**: First paragraph content automatically used as admonition title, remaining content properly indented
  - 📝 **Improved Formatting**: Clean syntax without unnecessary quotes in titles
  - 🛡️ **Fallback Support**: Intelligent fallback for unknown panel types to `note` admonition

## [0.3.2] - 2025-07-22
### Enhanced
- **📦 Multi-Platform Distribution**
  - 🌐 **Open VSX Registry**: Extension now available on Open VSX Registry for broader VSCode ecosystem compatibility
  - 🔄 **Expanded Accessibility**: Support for VSCode-compatible editors beyond the official marketplace

## [0.3.1] - 2025-06-30
### Major Changes
- **🚀 Complete Migration from Atlassian Storage Format to Atlas Document Format (ADF)**
  - 📊 **New Standard Format**: All `.confluence` files now use Atlas Document Format (ADF) instead of Atlassian Storage Format as the default format
  - 🔄 **CSP Metadata Migration**: Complete rewrite of CSP (Confluence Smart Publisher) parameter blocks
    - Before: `<csp:parameters>` Atlassian Storage Format tags
    - After: Clean Atlas Document Format (ADF) objects with `csp` property
  - 🧹 **Dependency Cleanup**: Removed Atlassian Storage Format-related dependencies (`xml-escape`, `cheerio`, `fast-xml-parser`)
  - ⚡ **Performance Improvements**: Faster parsing and validation with native Atlas Document Format (ADF) support
  - 🔍 **Enhanced Validation**: Type-safe Atlas Document Format (ADF) schema validation instead of regex-based Atlassian Storage Format parsing
  - 🎯 **Unified Data Extraction**: New generic `extractCSPValue()` function supports Atlas Document Format (ADF), YAML, and Atlassian Storage Format formats
  - 💪 **Backwards Compatibility**: Seamless migration path with automatic format detection
  - 🛠️ **Developer Experience**: Better IntelliSense and type safety with TypeScript interfaces

### Enhanced
- **Complete Table of Contents (TOC) Converter Rewrite**
  - ✨ Full support for all Confluence TOC macro parameters based on [official documentation](https://confluence.atlassian.com/doc/table-of-contents-macro-182682099.html)
  - 📋 **Output Types**: `list` (hierarchical) and `flat` (horizontal menu)
  - 🎨 **List Styles**: Complete support for all bullet styles (default, none, disc, circle, square, decimal, alphabetical, roman numerals)
  - 🔢 **Hierarchical Numbering**: Intelligent outline numbering (1.1, 1.2.1, etc.)
  - 🎯 **Advanced Filtering**: Regex support for include/exclude heading patterns
  - 🔗 **Flexible Separators**: Brackets, braces, parentheses, pipes, and custom separators for flat lists
  - 📏 **Custom Indentation**: Pixel-based indentation control
  - 🌐 **Absolute URLs**: Support for full URLs with base URL integration
  - 🎨 **CSS Classes**: Custom styling support with div wrappers
  - 🖨️ **Print Control**: Configurable printable/non-printable TOCs
  - 🔄 **Smart Slug Generation**: Confluence-compatible anchor generation
  - 📝 **Recursive Text Extraction**: Support for complex inline elements (strong, em, links)

## [0.2.0] - 2025-06-11
- Added new command to convert Confluence Storage Format files to Markdown
  - Support for converting Confluence macros (info, tip, note, warning, error) to Markdown with emojis
  - Support for converting Confluence tables, lists, code blocks, and expandable sections to Markdown
  - Added YAML front matter support for document metadata

## [0.1.3] - 2025-06-07
- Refactored cleanHeadingContent function to remove numbering at the beginning of content
- Removed required attributes for 'ri:space' tag in Confluence schema
- Removed required attribute 'ri:space-key' for 'ri:page' tag in Confluence schema
- Updated GitHub Actions workflows to maintain only essential files in gh-pages branch

## [0.1.2] - 205-06-06
- Fixed LI tag formatting and corrected the required attribute for `<ri:user>` tag

## [0.1.1] - 2025-06-05
- Added new command to convert Markdown files to Confluence Storage Format
- Added support for common Markdown syntax including headers, lists, code blocks, and tables

## [0.0.8] - 2025-06-05
- Resolved broken image links in README documentation
- Optimized extension package size by removing unnecessary image assets

## [0.0.7] - 2025-06-04
- Removed the "Compare Local Document with Published" command (diffWithPublished) to simplify the interface
- Kept only the "Sync with Published on Confluence" command which already includes the comparison functionality
- Bugfix in the page title emoji definition command
- Bugfix on Confluence Diagnostics

## [0.0.6] - 2025-06-04
- Some minor bug fixes
- Fixed chapter numbering
- Changed the numbering format

**Before**:

> 1 Title <br>
> 1\.1 Subtitle <br>
> 1\.1\.1 Sub-subtitle <br>

**After**:
> 1\. Title <br>
> 1\.1\. Subtitle <br>
> 1\.1\.1\. Sub-subtitle <br>

## [0.0.5] - 2025-06-02
- Readme translated to English
- All user communications translated to English

## [0.0.4] - 2025-05-30
- Code formatting refactoring to make it simpler, more efficient, and better organized

## [0.0.3] - 2025-05-29
- Added "Decode HTML entities" command to the extension manifest and context menu for .confluence files
- Removed "Encode HTML entities" option when publishing, as it's not necessary and causes conflicts with Confluence

## [0.0.2] - 2025-05-28
- New smart snippets for custom Confluence tags
- HtmlEntities mode support: automatic conversion of special characters to HTML entities when publishing or downloading pages

## [0.0.1] - 2025-05-27
- First version: publishing, downloading, formatting, diff and synchronization of Confluence pages
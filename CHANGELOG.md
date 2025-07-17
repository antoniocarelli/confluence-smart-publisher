# Change Log

All notable changes to the "confluence-smart-publisher" extension will be documented in this file.

## [0.3.0] - 2025-06-30
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
# 🚀 Confluence Smart Publisher

Visual Studio Code extension that allows you to create, edit, publish, download, and synchronize Confluence pages directly from your editor, using `.confluence` files in a custom XML format named Confluence Storage Format.

## 🎬 Extension in Action

### 🩺 Real-time Diagnostics
<div align="left">
  <img src="https://antoniocarelli.github.io/confluence-smart-publisher/images/diagnostics.gif" alt="Diagnosis" width="500"/>
</div>
Visualize problemas de estrutura e tags em tempo real, com dicas e correções automáticas diretamente no editor.

### 🛠️ Smart Formatter
<div align="left">
  <img src="https://antoniocarelli.github.io/confluence-smart-publisher/images/formater.gif" alt="Formatter" width="500"/>
</div>
Formate seus arquivos `.confluence` automaticamente, com numeração de capítulos e padronização de tags.

## ☕️ Buy me a coffe
Enjoying the Confluence Smart Publisher extension?
[Support its development by buying me a coffee and help keep it running!](https://www.paypal.com/donate/?business=ESQ3RSFYC6JMY&no_recurring=0&item_name=Enjoying+the+Confluence+Smart+Publisher+extension?%0ASupport+its+development+by+buying+me+a+coffee+and+help+keep+it+running%21&currency_code=BRL)


## 📋 Table of Contents

- [Extension in Action](#-extension-in-action)
  - [Real-time Diagnostics](#-real-time-diagnostics)
  - [Smart Formatter](#-smart-formatter)
- [Features](#-features)
  - [Commands](#-commands)
  - [Unique Feature](#-unique-feature)
  - [Validations and Diagnostics](#-validations-and-diagnostics)
    - [Structure Validation](#-structure-validation)
    - [Visual Diagnostics](#-visual-diagnostics)
    - [Specific Validations](#-specific-validations)
    - [Auto-correction](#-auto-correction)
    - [Logs and Diagnostics](#-logs-and-diagnostics)
- [Requirements](#️-requirements)
- [Installation](#-installation)
- [Extension Settings](#️-extension-settings)
- [File Structure](#-confluence-file-structure)
- [Dependencies](#-dependencies)
- [Known Issues](#-known-issues)
- [Contributing](#-contributing)
- [More Information](#ℹ️-more-information)
- [License](#-license)
- [Current Version](#-current-version)

## ✨ Features

### 🎮 Commands
- **Direct publishing**: Publish `.confluence` files as pages on Confluence with a single click. [📚 Documentation](https://antoniocarelli.github.io/confluence-smart-publisher/docs/publish-document)
- **Page downloading**: Download Confluence pages by title or ID, converting them to local editable format. [📚 Documentation by title](https://antoniocarelli.github.io/confluence-smart-publisher/docs/download-by-title)  [📚 Documentation by id](https://antoniocarelli.github.io/confluence-smart-publisher/docs/download-by-id)
- **Synchronization**: Compare and synchronize local content with what's published on Confluence, choosing which version to keep. [📚 Documentation](https://antoniocarelli.github.io/confluence-smart-publisher/docs/sync-with-published)
- **Template-based creation**: Create new files based on Confluence template pages. [📚 Documentation](https://antoniocarelli.github.io/confluence-smart-publisher/docs/create-document)
- **Markdown to Confluence**: Convert Markdown files to Confluence Storage Format, supporting common syntax like headers, lists, code blocks, and tables. [📚 Documentation](https://antoniocarelli.github.io/confluence-smart-publisher/docs/convert-markdown)
- **Confluence to Markdown**: Convert Confluence Storage Format files to Markdown, preserving metadata, macros, and formatting. [📚 Documentation](https://antoniocarelli.github.io/confluence-smart-publisher/docs/convert-confluence-markdown)
- **Automatic formatting**: Format `.confluence` files with specific rules, including automatic chapter numbering. [📚 Documentation](https://antoniocarelli.github.io/confluence-smart-publisher/docs/format-document)
- **Structure validation**: Real-time diagnostics of required tags, structure, and attributes, displaying issues in VSCode. [📚 Documentation](https://antoniocarelli.github.io/confluence-smart-publisher/docs/structure-validation)
- **Tag auto-completion**: Smart suggestions for Confluence custom tags and attributes. [📚 Documentation](https://antoniocarelli.github.io/confluence-smart-publisher/docs/tag-auto-completion)
- **Smart snippets**: Automatic suggestions of XML code blocks for custom tags, with completion of required and optional attributes, speeding up document writing. Just type `csp` and the options will appear like magic! [📚 Documentation](https://antoniocarelli.github.io/confluence-smart-publisher/docs/smart-snippets)
- **Html Entities Decode**: Automatic conversion of HTML entities to special characters when downloading pages. [📚 Documentation](https://antoniocarelli.github.io/confluence-smart-publisher/docs/decode-html)
- **Set title emoji**: Easily add emojis to your page titles directly in VSCode. [📚 Documentation](https://antoniocarelli.github.io/confluence-smart-publisher/docs/set-title-emoji)

> All commands are available in the file explorer context menu when right-clicking on `.confluence` files or folders, in the "Confluence Smart Publisher" submenu.

### 🔄 UNIQUE FEATURE: Metadata synchronization!

> `Labels`, `Properties`, `PageId`, and `ParentId` are always kept up-to-date between the local file and the remote page on Confluence.  
> **Any changes made locally (or in Confluence) are transparently reflected, avoiding inconsistencies and facilitating version control and organization of your documents.**

> **Important Note:** To ensure metadata synchronization, you need to use the "Sync with Published on Confluence" command. This command will compare and synchronize all metadata between your local file and the remote page, allowing you to choose which version to keep. Without using this command, metadata changes made in Confluence won't be automatically reflected in your local file.

### 🔍 Validations and Diagnostics

The Confluence Smart Publisher extension offers several validation and diagnostic features to ensure the integrity and quality of your documents:

#### 📝 Structure Validation
- **Real-time Validation**: Checks the document structure as you type, ensuring all required tags are present and properly formatted.
- **Tag Diagnostics**: Identifies missing, malformed, or invalid attributes, displaying warnings directly in the editor.
- **Attribute Validation**: Verifies if required attributes are present and if their values are valid.

#### 👁️ Visual Diagnostics
- **Error Markers**: Structure issues are highlighted with red underlines in the editor.
- **Correction Tips**: Hovering over errors displays suggestions on how to fix the problem.
- **Problems List**: All issues found are listed in the VS Code "Problems" panel.

#### ✅ Specific Validations
- **Metadata Validation**: Checks if the `<csp:parameters>` block is present and properly formatted.
- **ID Validation**: Confirms if page and parent IDs are in valid format.
- **Label Validation**: Verifies if labels are in correct format and don't contain invalid characters.
- **Properties Validation**: Ensures page properties are in valid format.

#### 🔧 Auto-correction
- **Automatic Formatting**: When saving the file, the extension can automatically fix formatting issues.
- **Indentation Correction**: Automatically adjusts XML indentation for better readability.
- **Tag Normalization**: Standardizes tag formatting to maintain document consistency.

#### 📊 Logs and Diagnostics
- **Log Panel**: All operations are logged in the VS Code "Output | CSP" panel.
- **Error Diagnostics**: In case of publication or synchronization failure, detailed logs are generated to facilitate problem identification.
- **Operation Status**: Visual feedback on ongoing operations.

## ⚙️ Requirements

- VS Code version 1.96.0 or higher.
- Confluence Cloud (Atlassian) account with edit permission.
- Confluence API Token (generate at [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)).

## 📥 Installation

1. Open VS Code
2. Go to the extensions tab (Ctrl+Shift+X)
3. Search for "Confluence Smart Publisher"
4. Click "Install"
5. After installation, configure the necessary options in VS Code settings

Alternatively, you can install from the VS Code Marketplace: [Confluence Smart Publisher](https://marketplace.visualstudio.com/items?itemName=AntonioCarelli.confluence-smart-publisher)

## 🔧 Extension Settings

This extension adds the following settings to VSCode:

| Key                                              | Description                                                                                  |
|--------------------------------------------------|----------------------------------------------------------------------------------------------|
| `confluenceSmartPublisher.baseUrl`               | Base URL of your Confluence instance (e.g., https://company.atlassian.net/wiki)              |
| `confluenceSmartPublisher.username`              | Confluence username (usually email)                                                          |
| `confluenceSmartPublisher.apiToken`              | Confluence API Token                                                                         |
| `confluenceSmartPublisher.format.numberChapters` | Automatically numbers chapters when formatting the `.confluence` document (default: true)    |
| `confluenceSmartPublisher.htmlEntitiesDecode`    | Activates automatic conversion of HTML entities to special characters when downloading pages (default: false) |

## 📄 .confluence File Structure
This extension adds a `<csp:parameters>` block to the document, which is used internally by the Confluence Smart Publisher extension, and whose values can be modified.

`<csp:file_id>`: Page ID in Confluence (automatically filled after publication).

`<csp:labels_list>`: List of labels separated by commas. Additions and changes will be reflected on the online page.

`<csp:parent_id>`: Parent page ID in Confluence.

`<csp:properties>`: Page properties (key/value). These properties can be changed, deleted, or new ones included. But be careful as changes may cause unexpected effects.

Example:
```xml
<csp:parameters xmlns:csp="https://confluence.smart.publisher/csp">
  <csp:file_id>123456</csp:file_id>
  <csp:labels_list>user-story,scope,pending</csp:labels_list>
  <csp:parent_id>654321</csp:parent_id>
  <csp:properties>
    <csp:key>content-appearance-published</csp:key>
    <csp:value>fixed-width</csp:value>
  </csp:properties>
</csp:parameters>
<!-- Page content in Confluence Storage format -->
```

## 🧩 Dependencies

- [cheerio](https://cheerio.js.org/)
   - Manipulation and parsing of HTML/XML in jQuery style, facilitating the extraction and modification of elements.
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)
   - Fast conversion between XML and JSON, essential for reading and validating .confluence files.
- [form-data](https://github.com/form-data/form-data)
   - Creation of multipart forms for file uploads (e.g., attaching images to Confluence via API).
- [node-fetch](https://github.com/node-fetch/node-fetch)
   - Performs HTTP/HTTPS requests, allowing communication with the Confluence API.
- [xml-escape](https://github.com/miketheprogrammer/xml-escape)
   - Escapes special characters to ensure valid XML when publishing or downloading content.
- [entities](https://github.com/fb55/entities)
   - Library for decoding HTML entities, used in the decoding functionality.
- [emoji-mart](https://github.com/missive/emoji-mart)
   - Emoji picker used to add emojis to titles.

## 🚧 Known Issues

- The format of `.confluence` files must strictly follow the expected structure, otherwise publication may fail.
- Only Confluence Cloud (Atlassian) is supported. There is no support for Confluence Server/Data Center.
- There is no support for password authentication, only API Token.
- Pages with very large attachments may experience slowness during download or synchronization.
- Special characters in file names can cause attachment problems.

## 🧑‍💻 Contributing

Contributions are welcome! Follow the Extension Guidelines to ensure best practices.

1. Fork the repository
2. Create a branch for your feature (git checkout -b feature/your-feature)
3. Commit your changes (git commit -m 'Add new feature')
4. Push to the branch (git push origin feature/your-feature)
5. Open a Pull Request

## ℹ️ More Information

- [Official VSCode documentation for extensions](https://code.visualstudio.com/api)
- [Official Confluence Cloud REST API documentation](developer.atlassian.com/cloud/confluence/rest/)
- [Official Confluence Storage Format documentation](https://confluence.atlassian.com/doc/confluence-storage-format-790796544.html)
   - This documentation is for the Data Center version, but much of it applies to the Cloud version.

## 📄 License

This extension is distributed under the MIT license. See the LICENSE file for more details.

---

_Have fun publishing to Confluence smartly!_
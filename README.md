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


## 📋 Table of Contents

- [Features](#-features)
  - [Commands](#-commands)
  - [Unique Feature](#-unique-feature)
  - [Validations and Diagnostics](#-validations-and-diagnostics)
- [Requirements](#️-requirements)
- [Installation](#-installation)
- [Extension Settings](#️-extension-settings)
- [Available Commands](#️-available-commands)
- [File Structure](#-confluence-file-structure)
- [Dependencies](#-dependencies)
- [Known Issues](#-known-issues)
- [Contributing](#-contributing)
- [More Information](#ℹ️-more-information)
- [License](#-license)
- [Current Version](#-current-version)

## ✨ Features

### 🎮 Commands
- **Direct publishing**: Publish `.confluence` files as pages on Confluence with a single click. Refer to the ["Publish Document" Command Flow](#publish-document-command-flow) for more information.
- **Page downloading**: Download Confluence pages by title or ID, converting them to local editable format.
- **Synchronization**: Compare and synchronize local content with what's published on Confluence, choosing which version to keep.
- **Template-based creation**: Create new files based on Confluence template pages.
- **Automatic formatting**: Format `.confluence` files with specific rules, including automatic chapter numbering.
- **Structure validation**: Real-time diagnostics of required tags, structure, and attributes, displaying issues in VSCode.
- **Tag auto-completion**: Smart suggestions for Confluence custom tags and attributes.
- **Smart snippets**: Automatic suggestions of XML code blocks for custom tags, with completion of required and optional attributes, speeding up document writing. Just type `csp` and the options will appear like magic!
- **Html Entities Decode**: Automatic conversion of HTML entities to special characters when downloading pages.
- **Set title emoji**: Easily add emojis to your page titles directly in VSCode.

> All commands are available in the file explorer context menu when right-clicking on `.confluence` files or folders, in the "Confluence Smart Publisher" submenu.

#### "Publish Document" Command Flow

The **Publish Document** command (`publishConfluence`) executes a series of steps to ensure that the content of the `.confluence` file is correctly published or updated on Confluence, keeping metadata and properties synchronized. See the detailed flow:

1. **User Action**
   - The user right-clicks on a `.confluence` file and selects "Publish Document" or executes the corresponding command from the VSCode command menu.

2. **Initial Validation**
   - The command checks if the selected file has the `.confluence` extension. If not, it displays an error message.

3. **File Reading**
   - The file content is read for analysis and information extraction.

4. **Page ID Verification**
   - The system looks for the `<csp:file_id>` tag in the `<csp:parameters>` block.
     - **If it exists**: understands that the page was previously published and performs an update on Confluence.
     - **If it doesn't exist**: creates a new page on Confluence.

5. **Page Creation or Update**
   - Creation:
     - Extracts information such as title, parentId, labels, and properties from the <csp:parameters> block.
     - Removes the <csp:parameters> block from the content before sending to Confluence.
     - Creates the page via Confluence REST API.
     - If there are referenced local images, performs a second update to attach them correctly.
   - Update:
     - Extracts the page ID.
     - Removes the <csp:parameters> block from the content.
     - Updates the page content via REST API.
     - If there are referenced local images, performs a second update to attach them correctly.

6. **Metadata Synchronization**
   - Adds labels defined in the <csp:labels_list> tag.
   - Updates properties defined in the <csp:properties> tag.

7. **ID Persistence**
   - If the page was created (no <csp:file_id> existed), writes the new ID at the beginning of the local file, inside the <csp:parameters> block.

8. **User Feedback**
   - Displays a success message with the ID of the published page or an error message if something fails.
>Note: The entire flow is executed transparently, with logs in the "Output | CSP" panel of VSCode to facilitate diagnosis in case of problems.


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
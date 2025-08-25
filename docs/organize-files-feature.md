# Organize Files by Confluence Hierarchy

## Overview

The **Organize Files by Confluence Hierarchy** feature automatically organizes downloaded Confluence files into folders that mirror the original page hierarchy from Confluence. This solves the problem of having a flat file structure when downloading multiple pages, making it easier to navigate and manage large collections of Confluence content.

## How It Works

### 1. File Analysis
- Scans the selected folder for all files
- Processes files in alphabetical order for consistent results
- Extracts file names (without extensions) to use as search terms

### 2. Confluence Page Matching
- Uses the Confluence Cloud REST API v2 to search for pages by title
- Implements flexible matching algorithms to handle variations between file names and page titles
- Supports optional space key filtering to improve search accuracy and performance

### 3. Hierarchy Retrieval
- For each matched page, retrieves the complete parent hierarchy
- Creates folder structure based on parent-child relationships
- Handles nested parent structures by creating complete folder hierarchies

### 4. File Organization
- Moves files to appropriate folders based on their page hierarchy
- Processes child pages to group related files together
- Handles file conflicts gracefully with clear error reporting

## Usage

### Basic Workflow

1. **Select a Folder**: Right-click on a folder containing downloaded Confluence files
2. **Choose Command**: Select "Organize Files by Confluence Hierarchy" from the context menu
3. **Configure Search**: Choose whether to limit the search to a specific Confluence space
4. **Monitor Progress**: Watch the progress notification and check the output channel for details
5. **Review Results**: Check the completion message and any error details

### Space Filtering

When prompted to limit search to a specific space:
- **Yes**: Enter a Confluence space key to search only within that space
- **No**: Search across all accessible Confluence spaces

Space filtering is recommended for:
- Better performance with large Confluence instances
- Avoiding conflicts between pages with the same title in different spaces
- Ensuring files are organized according to the correct space hierarchy

## Features

### Smart File Matching

The feature implements multiple matching strategies:

1. **Exact Match**: File name exactly matches page title
2. **Case-Insensitive Match**: Ignores case differences
3. **Normalized Match**: Removes special characters and normalizes whitespace

### Hierarchy Preservation

- **Parent-Child Relationships**: Files are organized based on their page's parent-child structure
- **Nested Folders**: Creates complete folder hierarchies for deeply nested pages
- **Child Page Grouping**: Automatically groups child pages with their parent files

### Error Handling

- **API Errors**: Gracefully handles network issues, authentication problems, and page not found errors
- **File System Errors**: Manages permission issues, disk space problems, and file conflicts
- **Conflict Resolution**: Prevents overwriting existing files with clear error messages
- **Partial Failures**: Continues processing even if some files fail to organize

### Progress Tracking

- **Real-time Updates**: Shows progress percentage and file count
- **Detailed Logging**: Comprehensive logging in the output channel
- **Batch Processing**: Processes files in batches to avoid API rate limits
- **Completion Summary**: Provides clear summary of results

## Technical Details

### API Integration

The feature uses the following Confluence Cloud REST API v2 endpoints:

- `GET /api/v2/pages?title={title}` - Search pages by title
- `GET /api/v2/pages/{pageId}/children` - Get child pages
- `GET /api/v2/pages/{pageId}` - Get page details and parent information

### File Processing

- **Batch Size**: Processes files in batches of 10 to avoid overwhelming the API
- **Alphabetical Order**: Sorts files alphabetically for consistent processing
- **File Types**: Works with any file type, not just `.confluence` files
- **Safe Operations**: Uses atomic file operations to prevent data loss

### Performance Considerations

- **API Rate Limiting**: Implements batch processing to respect API limits
- **Memory Management**: Processes files incrementally to handle large folders
- **Network Resilience**: Handles temporary network issues with retry logic
- **Progress Feedback**: Provides real-time updates for long-running operations

## Examples

### Before Organization
```
Downloaded/
├── Introduction.confluence
├── Getting Started.confluence
├── Installation Guide.confluence
├── Configuration.confluence
├── Advanced Features.confluence
└── Troubleshooting.confluence
```

### After Organization
```
Downloaded/
├── Documentation/
│   ├── Introduction.confluence
│   ├── Getting Started.confluence
│   └── Installation Guide.confluence
├── User Guide/
│   ├── Configuration.confluence
│   └── Advanced Features.confluence
└── Support/
    └── Troubleshooting.confluence
```

## Troubleshooting

### Common Issues

1. **No Matching Pages Found**
   - Check that file names closely match Confluence page titles
   - Verify that you have access to the Confluence pages
   - Try using space filtering to narrow the search

2. **API Authentication Errors**
   - Verify your Confluence credentials in VS Code settings
   - Check that your API token has the necessary permissions
   - Ensure the base URL is correctly configured

3. **File Permission Errors**
   - Ensure you have write permissions to the folder
   - Check that files are not locked by other applications
   - Verify sufficient disk space

4. **File Conflicts**
   - The feature will not overwrite existing files
   - Check the output channel for specific conflict details
   - Manually resolve conflicts by moving or renaming files

### Getting Help

- **Output Channel**: Check the "Confluence Smart Publisher" output channel for detailed logs
- **Error Messages**: Review specific error messages for troubleshooting guidance
- **Progress Tracking**: Monitor progress notifications to identify where issues occur

## Best Practices

1. **Backup First**: Always backup your files before running the organization
2. **Test with Small Folders**: Start with a small number of files to verify the results
3. **Use Space Filtering**: Limit searches to specific spaces for better accuracy
4. **Review Results**: Check the organization results before proceeding with large folders
5. **Monitor Output**: Keep the output channel open to track progress and identify issues

## Limitations

- **API Dependencies**: Requires active internet connection and valid Confluence credentials
- **Title Matching**: Relies on file names matching page titles (with some flexibility)
- **Hierarchy Depth**: Very deep hierarchies may create long folder paths
- **File System Limits**: Subject to operating system path length limitations
- **Confluence Permissions**: Can only access pages you have permission to view


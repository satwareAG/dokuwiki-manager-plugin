# DokuWiki Manager - TypingMind Plugin

A powerful plugin for managing DokuWiki websites directly from TypingMind. This plugin allows you to perform common DokuWiki operations such as reading and editing pages, managing media files, and searching content.

## Features

- **Page Operations**: Get, create, edit, and search wiki pages
- **Media Operations**: List, upload, download, and delete media files
- **Information Retrieval**: Get page history, metadata, and search content
- **Secure Authentication**: Support for both Basic Authentication and Bearer Token authentication

## Setup

1. **Import the Plugin** into your TypingMind workspace
2. **Configure the Plugin** with your DokuWiki credentials:
   - **DokuWiki URL**: The full URL to your DokuWiki instance (e.g., `https://wiki.example.com`)
   - **Authentication Method**: Choose between Basic Auth (username/password) or Bearer Token
   - **Username**: Your DokuWiki username (required for Basic Auth)
   - **Password/Token**: Your DokuWiki password (for Basic Auth) or Bearer token (for Token Auth)
   - **Default Namespace** (optional): Default namespace for operations

## Authentication Methods

The plugin supports two authentication methods:

### Basic Authentication

Uses username and password for authentication. This is the standard method for most DokuWiki installations.

Requirements:
- DokuWiki URL
- Username
- Password

### Bearer Token Authentication

Uses a bearer token for authentication. This is useful for applications or services that use token-based authentication.

Requirements:
- DokuWiki URL
- Bearer Token (in the password field)
- No username required

## Usage Examples

### Reading a Wiki Page

```
I need to see the content of the "start" page in my DokuWiki.
```

### Editing a Wiki Page

```
Update the page "project:roadmap" with this new content:
# Project Roadmap

## Phase 1
- Task 1
- Task 2

## Phase 2
- Task 3
- Task 4
```

### Searching Wiki Pages

```
Search my DokuWiki for all pages containing information about "python scripting"
```

### Listing Media Files

```
Show me all media files in the "documentation" namespace of my DokuWiki
```

## Supported Operations

- `get_page`: Retrieve a wiki page's content
- `save_page`: Create or update a wiki page
- `append_page`: Append content to an existing wiki page
- `list_pages`: List pages in a namespace
- `search_pages`: Search pages by content
- `get_page_info`: Get metadata about a page
- `get_page_history`: Get revision history of a page
- `list_media`: List media files in a namespace
- `get_media`: Download a media file
- `save_media`: Upload a media file
- `delete_media`: Delete a media file

## Limitations

- This plugin requires valid DokuWiki credentials with appropriate permissions
- Operations are limited to the permissions of the provided user account
- Large media files may encounter issues with browser limitations

## Privacy & Security Note

Your DokuWiki credentials are stored in your TypingMind account and are transmitted securely. However, always ensure you're using HTTPS for your DokuWiki instance to prevent credential interception.

## Troubleshooting

- **Authentication Errors**: Verify your username and password, or check that your token is valid
- **Permission Errors**: Ensure your user has the necessary permissions in DokuWiki
- **Connection Errors**: Verify the DokuWiki URL is correct and accessible
- **Token Issues**: Bearer tokens may expire; generate a new token if necessary

## Development

This plugin is structured in a modular way:

- `src/auth.js`: Authentication module supporting both Basic Auth and Bearer Token
- `src/apiClient.js`: API client for communicating with DokuWiki JSON-RPC API
- `src/errorHandler.js`: Error handling for user-friendly error messages
- `implementation.js`: Main entry point for the plugin

To run tests:

```
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
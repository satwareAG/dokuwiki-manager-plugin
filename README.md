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

## Architecture

The DokuWiki Manager plugin is built with a modular architecture that provides clean separation of concerns, maintainability, and testability. The architecture consists of the following components:

### Core Components

- **Authentication Module** (`src/auth.js`): Handles authentication with DokuWiki API
  - Supports both Basic Auth and Bearer Token authentication
  - Manages secure credential handling and request signing
  - Includes connection testing functionality

- **API Client Module** (`src/apiClient.js`): Core communication layer with DokuWiki
  - Manages JSON-RPC requests to the DokuWiki API
  - Implements retry logic and error handling
  - Provides utility methods for common operations

- **Error Handler Module** (`src/errorHandler.js`): Comprehensive error management
  - Maps DokuWiki error codes to user-friendly messages
  - Provides recovery suggestions for common errors
  - Enhances error details for better debugging

- **Main Entry Point** (`implementation.js`): Plugin integration with TypingMind
  - Routes operations to appropriate handler methods
  - Coordinates between modules
  - Formats responses for TypingMind compatibility

### Data Flow

1. **Request Initiation**: TypingMind calls the plugin with operation parameters
2. **Authentication**: Credentials from user settings are used to authenticate
3. **API Communication**: The request is transformed into appropriate JSON-RPC calls
4. **Error Handling**: Responses are checked for errors and enhanced with friendly messages
5. **Response Formatting**: Successful responses are returned to TypingMind

### Error Handling Strategy

The plugin implements a robust error handling strategy:

1. **Error Detection**: Errors are captured at all levels (network, API, application)
2. **Error Enhancement**: Technical errors are augmented with user-friendly messages
3. **Recovery Suggestions**: Where possible, the plugin suggests solutions for errors
4. **Graceful Degradation**: Some errors (like non-existent pages) return empty content instead of errors

## Developer Documentation

### Module Structure

```
dokuwiki-manager-plugin/
├── implementation.js     # Main entry point
├── plugin.json          # Plugin configuration
├── src/
│   ├── index.js         # Module exports
│   ├── auth.js          # Authentication module
│   ├── apiClient.js     # API client module
│   └── errorHandler.js  # Error handling module
├── tests/
│   ├── auth.test.js     # Authentication tests
│   ├── apiClient.test.js # API client tests
│   └── errorHandler.test.js # Error handler tests
└── package.json         # NPM configuration
```

### Testing

The plugin has 80%+ test coverage with Jest. Each module has a corresponding test file that verifies its functionality.

To run tests:

```bash
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

### Error Code Reference

The plugin maps DokuWiki error codes to user-friendly messages:

- **0**: Success
- **111**: Not allowed to read page
- **121**: Page doesn't exist
- **133**: Page is locked
- **221**: Media file doesn't exist
- **401**: Authentication failed
- **403**: Insufficient permissions
- **500**: Server error

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# DokuWiki Manager Plugin - Development Guide

## Project Structure

This project uses a modular architecture with separate modules for authentication, API client, and error handling.

```
dokuwiki-manager-plugin/
├── src/                    # Source code
│   ├── auth.js             # Authentication module
│   ├── apiClient.js        # JSON-RPC client
│   ├── errorHandler.js     # Error handling
│   └── index.js            # Entry point
├── tests/                  # Test suite
│   ├── auth.test.js        # Auth module tests
│   ├── apiClient.test.js   # API client tests
│   └── errorHandler.test.js # Error handler tests
├── examples/               # Example usage
│   └── test-client.js      # Example client
├── dokuwiki-dev/           # Local development environment
│   ├── docker-compose.yml  # Docker configuration
│   ├── start.sh            # Start script
│   └── stop.sh             # Stop script
├── implementation.js       # Main plugin entry point
└── plugin.json             # TypingMind plugin config
```

## Development Setup

### Prerequisites

- Node.js (v14+)
- npm (v6+)
- Docker and Docker Compose (for local DokuWiki)

### First-Time Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/satwareAG/dokuwiki-manager-plugin.git
   cd dokuwiki-manager-plugin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the DokuWiki development environment:**
   ```bash
   cd dokuwiki-dev
   ./start.sh
   ```

4. **Complete the DokuWiki setup:**
    - Navigate to http://localhost:8080/install.php
    - Follow the setup instructions to create an admin user
    - Make note of your credentials for testing

5. **Update the test client with your credentials:**
   ```javascript
   // In examples/test-client.js
   const config = {
     wikiUrl: 'http://localhost:8080',
     username: 'your_username',
     password: 'your_password',
     defaultNamespace: ''
   };
   ```

### Development Workflow

#### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

#### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

#### Testing with DokuWiki

```bash
# Start DokuWiki environment
cd dokuwiki-dev
./start.sh

# Run test client
npm run dev

# Stop DokuWiki environment
cd dokuwiki-dev
./stop.sh
```

#### IntelliJ IDEA Integration

The project includes run configurations for:
- Running tests
- Generating test coverage reports
- Running the test client
- Linting and formatting code
- Starting and stopping the DokuWiki environment

These are available in the Run Configurations dropdown.

## Project Architecture

### Authentication Module (`src/auth.js`)

Provides authentication mechanisms for DokuWiki:
- Basic Authentication (username/password)
- Bearer Token Authentication

```javascript
const headers = createAuthHeaders({
  username: 'admin',
  password: 'password'
});
```

### API Client (`src/apiClient.js`)

Handles communication with the DokuWiki JSON-RPC API:
- Creates and manages connections
- Handles request/response cycle
- Integrates with error handling

```javascript
const client = await createClient({
  wikiUrl: 'http://localhost:8080',
  username: 'admin',
  password: 'password'
});

const result = await client.call('core.getPage', {
  page: 'start'
});
```

### Error Handler (`src/errorHandler.js`)

Provides enhanced error handling with:
- User-friendly messages
- Recovery suggestions
- Error categorization

```javascript
try {
  // API call
} catch (error) {
  const enhancedError = handleDokuWikiError(error);
  console.error(`Error: ${enhancedError.userMessage}`);
  console.error(`Recovery: ${enhancedError.recoverySuggestion}`);
}
```

## DokuWiki API Reference

Common operations:

### Pages

- `core.getPage`: Get page content
- `core.savePage`: Create or update page
- `core.appendPage`: Append content to page
- `core.listPages`: List pages in namespace
- `core.getPageInfo`: Get page metadata
- `core.getPageHistory`: Get page revision history

### Media

- `core.listMedia`: List media files
- `core.getMedia`: Download media file
- `core.saveMedia`: Upload media file
- `core.deleteMedia`: Delete media file

## Contributing Guidelines

1. **Branch naming:**
    - `feature/feature-name`
    - `fix/issue-id-description`
    - `refactor/scope`

2. **Commit messages:**
    - Format: `<type>(<scope>): <subject>`
    - Example: `feat(auth): Add support for token-based authentication`

3. **Code quality:**
    - Maintain test coverage (80%+)
    - Follow ESLint rules
    - Document public methods with JSDoc

/**
 * Authentication module for DokuWiki API
 * Handles authentication with DokuWiki JSON-RPC API.
 * 
 * @module dokuwiki-manager/auth
 * @author satware AG
 * @license MIT
 */

/**
 * Generate authentication headers based on the authentication method and credentials
 * 
 * @param {Object} userSettings - User settings from Typing Mind plugin
 * @param {string} userSettings.wikiUrl - URL of the DokuWiki instance
 * @param {string} userSettings.authMethod - Authentication method (BASIC_AUTH or BEARER_TOKEN)
 * @param {string} userSettings.username - DokuWiki username (required for BASIC_AUTH)
 * @param {string} userSettings.password - DokuWiki password or Bearer token
 * @returns {Object} Headers object with appropriate authentication
 * @throws {Error} If required settings are missing or invalid
 */
function getAuthHeaders(userSettings) {
  // Input validation
  if (!userSettings) {
    throw new Error("User settings are required");
  }

  if (!userSettings.wikiUrl) {
    throw new Error("DokuWiki URL is required in settings");
  }

  if (!userSettings.authMethod) {
    throw new Error("Authentication method is required in settings");
  }
  
  if (!userSettings.password) {
    throw new Error("Password/Token is required in settings");
  }

  // Header initialization
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Apply authentication based on method
  switch (userSettings.authMethod) {
    case 'BASIC_AUTH':
      if (!userSettings.username) {
        throw new Error("Username is required for Basic Authentication");
      }
      
      const credentials = btoa(`${userSettings.username}:${userSettings.password}`);
      headers['Authorization'] = `Basic ${credentials}`;
      break;
      
    case 'BEARER_TOKEN':
      headers['Authorization'] = `Bearer ${userSettings.password}`;
      break;
      
    default:
      throw new Error(`Unsupported authentication method: ${userSettings.authMethod}. Use BASIC_AUTH or BEARER_TOKEN.`);
  }
  
  return headers;
}

/**
 * Creates a JSON-RPC client for communicating with DokuWiki API
 * 
 * @param {Object} userSettings - User settings from Typing Mind plugin
 * @returns {Object} Client object with configured API methods
 * @throws {Error} If connection fails or settings are invalid
 */
async function createJsonRpcClient(userSettings) {
  // Input validation
  if (!userSettings) {
    throw new Error("User settings are required");
  }
  
  const { wikiUrl } = userSettings;
  
  // Format base URL
  const baseUrl = wikiUrl.endsWith('/')
    ? `${wikiUrl}lib/exe/jsonrpc.php`
    : `${wikiUrl}/lib/exe/jsonrpc.php`;
  
  // Get authentication headers
  const headers = getAuthHeaders(userSettings);
  
  // Create the client
  const client = {
    baseUrl,
    headers,
    async call(method, params = {}) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: method,
            params: params
          })
        });
  
        // Handle HTTP errors
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }
  
        // Parse response
        const result = await response.json();
        
        // Handle JSON-RPC errors
        if (result.error) {
          const error = new Error(result.error.message);
          error.code = result.error.code;
          throw error;
        }
  
        return result.result;
      } catch (error) {
        // Enhance error with context
        if (!error.message.includes('DokuWiki API error')) {
          error.message = `DokuWiki API error calling ${method}: ${error.message}`;
        }
        throw error;
      }
    }
  };

  return client;
}

/**
 * Test the connection to the DokuWiki instance
 * 
 * @param {Object} client - JSON-RPC client
 * @returns {Promise<boolean>} True if connection is successful
 * @throws {Error} If connection fails
 */
async function testConnection(client) {
  try {
    // Call a simple public API method to test authentication
    const wikiTitle = await client.call('core.getWikiTitle');
    return true;
  } catch (error) {
    throw new Error(`Failed to connect to DokuWiki: ${error.message}`);
  }
}

// Export the module functions
module.exports = {
  getAuthHeaders,
  createJsonRpcClient,
  testConnection
};
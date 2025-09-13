/**
 * DokuWiki API client module
 * Provides a client for making JSON-RPC calls to DokuWiki API.
 * 
 * @module dokuwiki-manager/apiClient
 * @author satware AG
 * @license MIT
 */

// Import modules
const auth = require('./auth');
const { handleApiError, getRecoverySuggestion } = require('./errorHandler');

/**
 * Create and initialize a DokuWiki API client
 * 
 * @param {Object} userSettings - User settings from Typing Mind plugin
 * @param {boolean} testConnection - Whether to test the connection (default: true)
 * @returns {Promise<Object>} The API client object
 * @throws {Error} If connection fails or settings are invalid
 */
async function createApiClient(userSettings, testConnection = true) {
  try {
    // Create the base JSON-RPC client
    const jsonRpcClient = await auth.createJsonRpcClient(userSettings);
    
    // Test connection if requested
    if (testConnection) {
      await auth.testConnection(jsonRpcClient);
    }
    
    // Create an enhanced client with error handling
    const client = {
      // Expose the base client
      _jsonRpcClient: jsonRpcClient,
      
      /**
       * Make an API call to DokuWiki
       * 
       * @param {string} method - The API method to call
       * @param {Object} params - The parameters to pass to the method
       * @returns {Promise<any>} The API response
       * @throws {Error} If the API call fails
       */
      async call(method, params = {}) {
        try {
          // Make the API call
          return await this._jsonRpcClient.call(method, params);
        } catch (error) {
          // Handle API errors
          const enhancedError = handleApiError(error);
          
          // Add recovery suggestion if available
          const recoverySuggestion = getRecoverySuggestion(enhancedError);
          if (recoverySuggestion) {
            enhancedError.message += `\n\nPossible solution: ${recoverySuggestion}`;
          }
          
          throw enhancedError;
        }
      },
      
      /**
       * Check if a page exists
       * 
       * @param {string} pageId - The page ID
       * @returns {Promise<boolean>} True if the page exists
       */
      async pageExists(pageId) {
        try {
          const pageInfo = await this.call('core.getPageInfo', { page: pageId });
          return true;
        } catch (error) {
          // Error 121 means page doesn't exist
          if (error.code === 121) {
            return false;
          }
          // Rethrow other errors
          throw error;
        }
      },
      
      /**
       * Check if a media file exists
       * 
       * @param {string} mediaId - The media ID
       * @returns {Promise<boolean>} True if the media file exists
       */
      async mediaExists(mediaId) {
        try {
          const mediaInfo = await this.call('core.getMediaInfo', { media: mediaId });
          return true;
        } catch (error) {
          // Error 221 means media file doesn't exist
          if (error.code === 221) {
            return false;
          }
          // Rethrow other errors
          throw error;
        }
      },
      
      /**
       * Get wiki configuration information
       * 
       * @returns {Promise<Object>} Wiki information including title, version, and API version
       */
      async getWikiInfo() {
        const [title, version, apiVersion] = await Promise.all([
          this.call('core.getWikiTitle'),
          this.call('core.getWikiVersion'),
          this.call('core.getAPIVersion')
        ]);
        
        return {
          title,
          version,
          apiVersion
        };
      }
    };
    
    return client;
  } catch (error) {
    // Enhance initialization errors
    if (!error.message.includes('DokuWiki')) {
      error.message = `Failed to initialize DokuWiki client: ${error.message}`;
    }
    throw error;
  }
}

// Export the module functions
module.exports = {
  createApiClient
};
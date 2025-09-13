/**
 * Tests for the API client module
 */

// Mock the dependencies
jest.mock('../src/auth', () => ({
  createJsonRpcClient: jest.fn(),
  testConnection: jest.fn()
}));

jest.mock('../src/errorHandler', () => ({
  handleApiError: jest.fn(error => error),
  getRecoverySuggestion: jest.fn(),
  ERROR_MESSAGES: { 121: 'Page not found' }
}));

// Import mocks for explicit control
const auth = require('../src/auth');
const errorHandler = require('../src/errorHandler');

// Import the module to test
const { createApiClient } = require('../src/apiClient');

describe('API Client Module', () => {
  // Valid user settings for tests
  const userSettings = {
    wikiUrl: 'https://wiki.example.com',
    authMethod: 'BASIC_AUTH',
    username: 'user',
    password: 'password123'
  };
  
  // Sample JSON-RPC client for mocking
  const mockJsonRpcClient = {
    call: jest.fn()
  };
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mocks
    auth.createJsonRpcClient.mockResolvedValue(mockJsonRpcClient);
    auth.testConnection.mockResolvedValue(true);
    mockJsonRpcClient.call.mockResolvedValue('Mock response');
  });

  describe('createApiClient', () => {
    test('should create and initialize API client successfully', async () => {
      const client = await createApiClient(userSettings);
      
      expect(auth.createJsonRpcClient).toHaveBeenCalledWith(userSettings);
      expect(auth.testConnection).toHaveBeenCalledWith(mockJsonRpcClient);
      expect(client).toBeDefined();
      expect(client._jsonRpcClient).toBe(mockJsonRpcClient);
    });
    
    test('should skip connection test when disabled', async () => {
      const client = await createApiClient(userSettings, false);
      
      expect(auth.createJsonRpcClient).toHaveBeenCalledWith(userSettings);
      expect(auth.testConnection).not.toHaveBeenCalled();
    });
    
    test('should throw enhanced error when initialization fails', async () => {
      auth.createJsonRpcClient.mockRejectedValue(new Error('Init failed'));
      
      await expect(createApiClient(userSettings))
        .rejects.toThrow('Failed to initialize DokuWiki client: Init failed');
    });
    
    test('should preserve error message if it already mentions DokuWiki', async () => {
      auth.createJsonRpcClient.mockRejectedValue(new Error('DokuWiki connection error'));
      
      await expect(createApiClient(userSettings))
        .rejects.toThrow('DokuWiki connection error');
    });
  });
  
  describe('client.call', () => {
    test('should delegate to JSON-RPC client correctly', async () => {
      const client = await createApiClient(userSettings, false);
      
      await client.call('test.method', { param: 'value' });
      
      expect(mockJsonRpcClient.call).toHaveBeenCalledWith('test.method', { param: 'value' });
    });
    
    test('should handle API errors with enhanced error handling', async () => {
      const error = new Error('API error');
      error.code = 500;
      mockJsonRpcClient.call.mockRejectedValue(error);
      errorHandler.handleApiError.mockImplementation((err) => {
        err.message = 'Enhanced: ' + err.message;
        return err;
      });
      errorHandler.getRecoverySuggestion.mockReturnValue('Try this solution');
      
      const client = await createApiClient(userSettings, false);
      
      await expect(client.call('test.method')).rejects.toThrow('Enhanced: API error\n\nPossible solution: Try this solution');
      
      expect(errorHandler.handleApiError).toHaveBeenCalledWith(error);
      expect(errorHandler.getRecoverySuggestion).toHaveBeenCalled();
    });
    
    test('should not add recovery suggestion if none available', async () => {
      const error = new Error('API error');
      mockJsonRpcClient.call.mockRejectedValue(error);
      errorHandler.handleApiError.mockImplementation((err) => {
        err.message = 'Enhanced: ' + err.message;
        return err;
      });
      errorHandler.getRecoverySuggestion.mockReturnValue(null);
      
      const client = await createApiClient(userSettings, false);
      
      await expect(client.call('test.method')).rejects.toThrow('Enhanced: API error');
    });
  });
  
  describe('client.pageExists', () => {
    test('should return true when page exists', async () => {
      const client = await createApiClient(userSettings, false);
      mockJsonRpcClient.call.mockResolvedValue({ id: 'test', revision: 123 });
      
      const result = await client.pageExists('test:page');
      
      expect(result).toBe(true);
      expect(mockJsonRpcClient.call).toHaveBeenCalledWith('core.getPageInfo', { page: 'test:page' });
    });
    
    test('should return false when page does not exist', async () => {
      const error = new Error('Page not found');
      error.code = 121;
      mockJsonRpcClient.call.mockRejectedValue(error);
      
      const client = await createApiClient(userSettings, false);
      const result = await client.pageExists('test:nonexistent');
      
      expect(result).toBe(false);
    });
    
    test('should propagate other errors', async () => {
      const error = new Error('Server error');
      error.code = 500;
      mockJsonRpcClient.call.mockRejectedValue(error);
      
      const client = await createApiClient(userSettings, false);
      
      await expect(client.pageExists('test:page')).rejects.toThrow('Server error');
    });
  });
  
  describe('client.mediaExists', () => {
    test('should return true when media exists', async () => {
      const client = await createApiClient(userSettings, false);
      mockJsonRpcClient.call.mockResolvedValue({ id: 'test', revision: 123 });
      
      const result = await client.mediaExists('test:image.jpg');
      
      expect(result).toBe(true);
      expect(mockJsonRpcClient.call).toHaveBeenCalledWith('core.getMediaInfo', { media: 'test:image.jpg' });
    });
    
    test('should return false when media does not exist', async () => {
      const error = new Error('Media not found');
      error.code = 221;
      mockJsonRpcClient.call.mockRejectedValue(error);
      
      const client = await createApiClient(userSettings, false);
      const result = await client.mediaExists('test:nonexistent.jpg');
      
      expect(result).toBe(false);
    });
    
    test('should propagate other errors', async () => {
      const error = new Error('Server error');
      error.code = 500;
      mockJsonRpcClient.call.mockRejectedValue(error);
      
      const client = await createApiClient(userSettings, false);
      
      await expect(client.mediaExists('test:image.jpg')).rejects.toThrow('Server error');
    });
  });
  
  describe('client.getWikiInfo', () => {
    test('should fetch and return wiki information', async () => {
      // Mock responses for each API call
      mockJsonRpcClient.call
        .mockResolvedValueOnce('Test Wiki') // For getWikiTitle
        .mockResolvedValueOnce('Release 2023-04-04') // For getWikiVersion
        .mockResolvedValueOnce(42); // For getAPIVersion
      
      const client = await createApiClient(userSettings, false);
      const info = await client.getWikiInfo();
      
      expect(info).toEqual({
        title: 'Test Wiki',
        version: 'Release 2023-04-04',
        apiVersion: 42
      });
      
      // Verify all API calls were made
      expect(mockJsonRpcClient.call).toHaveBeenCalledWith('core.getWikiTitle');
      expect(mockJsonRpcClient.call).toHaveBeenCalledWith('core.getWikiVersion');
      expect(mockJsonRpcClient.call).toHaveBeenCalledWith('core.getAPIVersion');
    });
    
    test('should propagate errors from API calls', async () => {
      const error = new Error('API error');
      mockJsonRpcClient.call.mockRejectedValue(error);
      
      const client = await createApiClient(userSettings, false);
      
      await expect(client.getWikiInfo()).rejects.toThrow('API error');
    });
  });
});
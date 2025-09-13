/**
 * Tests for the authentication module
 * 
 * @jest-environment jsdom
 */

// Mock fetch for testing
global.fetch = jest.fn();
global.btoa = jest.fn((str) => `base64encoded_${str}`);

// Import the module to test
const { getAuthHeaders, createJsonRpcClient, testConnection } = require('../src/auth');

describe('Authentication Module', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default fetch mock
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: 'Test Wiki', error: null })
      })
    );
  });

  describe('getAuthHeaders', () => {
    test('should throw error for missing user settings', () => {
      expect(() => getAuthHeaders(null)).toThrow('User settings are required');
    });
    
    test('should throw error for missing wiki URL', () => {
      expect(() => getAuthHeaders({})).toThrow('DokuWiki URL is required in settings');
    });
    
    test('should throw error for missing authentication method', () => {
      expect(() => getAuthHeaders({ wikiUrl: 'https://wiki.example.com' }))
        .toThrow('Authentication method is required in settings');
    });
    
    test('should throw error for missing password/token', () => {
      expect(() => getAuthHeaders({
        wikiUrl: 'https://wiki.example.com',
        authMethod: 'BASIC_AUTH'
      })).toThrow('Password/Token is required in settings');
    });
    
    test('should throw error for Basic Auth without username', () => {
      expect(() => getAuthHeaders({
        wikiUrl: 'https://wiki.example.com',
        authMethod: 'BASIC_AUTH',
        password: 'password123'
      })).toThrow('Username is required for Basic Authentication');
    });
    
    test('should throw error for unsupported authentication method', () => {
      expect(() => getAuthHeaders({
        wikiUrl: 'https://wiki.example.com',
        authMethod: 'UNKNOWN_AUTH',
        username: 'user',
        password: 'password123'
      })).toThrow('Unsupported authentication method');
    });
    
    test('should generate correct headers for Basic Auth', () => {
      const headers = getAuthHeaders({
        wikiUrl: 'https://wiki.example.com',
        authMethod: 'BASIC_AUTH',
        username: 'user',
        password: 'password123'
      });
      
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Basic base64encoded_user:password123'
      });
      
      expect(global.btoa).toHaveBeenCalledWith('user:password123');
    });
    
    test('should generate correct headers for Bearer Token', () => {
      const headers = getAuthHeaders({
        wikiUrl: 'https://wiki.example.com',
        authMethod: 'BEARER_TOKEN',
        password: 'token123'
      });
      
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123'
      });
    });
  });
  
  describe('createJsonRpcClient', () => {
    test('should throw error for missing user settings', async () => {
      await expect(createJsonRpcClient(null)).rejects.toThrow('User settings are required');
    });
    
    test('should create client with correct base URL (with trailing slash)', async () => {
      // Disable test connection to focus on URL construction
      jest.spyOn(global, 'fetch').mockImplementation(() => {
        throw new Error('Connection disabled for this test');
      });
      
      try {
        await createJsonRpcClient({
          wikiUrl: 'https://wiki.example.com/',
          authMethod: 'BASIC_AUTH',
          username: 'user',
          password: 'password123'
        }, false); // Don't test connection
      } catch (error) {
        // We expect an error because test connection is disabled
      }
      
      // Check that the URL was constructed correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://wiki.example.com/lib/exe/jsonrpc.php',
        expect.anything()
      );
    });
    
    test('should create client with correct base URL (without trailing slash)', async () => {
      // Disable test connection to focus on URL construction
      jest.spyOn(global, 'fetch').mockImplementation(() => {
        throw new Error('Connection disabled for this test');
      });
      
      try {
        await createJsonRpcClient({
          wikiUrl: 'https://wiki.example.com',
          authMethod: 'BASIC_AUTH',
          username: 'user',
          password: 'password123'
        }, false); // Don't test connection
      } catch (error) {
        // We expect an error because test connection is disabled
      }
      
      // Check that the URL was constructed correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://wiki.example.com/lib/exe/jsonrpc.php',
        expect.anything()
      );
    });
    
    test('should create client with correct request body format', async () => {
      const client = await createJsonRpcClient({
        wikiUrl: 'https://wiki.example.com',
        authMethod: 'BASIC_AUTH',
        username: 'user',
        password: 'password123'
      }, false); // Don't test connection
      
      // Mock Date.now for consistent testing
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 1234567890);
      
      await client.call('test.method', { param1: 'value1' });
      
      // Restore Date.now
      Date.now = originalDateNow;
      
      // Check request format
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        {
          method: 'POST',
          headers: expect.any(Object),
          body: '{"jsonrpc":"2.0","id":1234567890,"method":"test.method","params":{"param1":"value1"}}'
        }
      );
    });
    
    test('should handle API errors correctly', async () => {
      // Mock fetch to return an error
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            result: null,
            error: {
              code: 123,
              message: 'Test error'
            }
          })
        })
      );
      
      const client = await createJsonRpcClient({
        wikiUrl: 'https://wiki.example.com',
        authMethod: 'BASIC_AUTH',
        username: 'user',
        password: 'password123'
      }, false); // Don't test connection
      
      try {
        await client.call('test.method');
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).toContain('Test error');
        expect(error.code).toBe(123);
      }
    });
    
    test('should handle HTTP errors correctly', async () => {
      // Mock fetch to return an HTTP error
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: false,
          status: 404,
          text: () => Promise.resolve('Not Found')
        })
      );
      
      const client = await createJsonRpcClient({
        wikiUrl: 'https://wiki.example.com',
        authMethod: 'BASIC_AUTH',
        username: 'user',
        password: 'password123'
      }, false); // Don't test connection
      
      try {
        await client.call('test.method');
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).toContain('HTTP error 404');
        expect(error.message).toContain('Not Found');
      }
    });
    
    test('should handle network errors correctly', async () => {
      // Mock fetch to throw a network error
      global.fetch.mockImplementation(() => 
        Promise.reject(new Error('Network error'))
      );
      
      const client = await createJsonRpcClient({
        wikiUrl: 'https://wiki.example.com',
        authMethod: 'BASIC_AUTH',
        username: 'user',
        password: 'password123'
      }, false); // Don't test connection
      
      try {
        await client.call('test.method');
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).toContain('Network error');
      }
    });
  });
  
  describe('testConnection', () => {
    test('should return true for successful connection', async () => {
      const client = {
        call: jest.fn().mockResolvedValue('Test Wiki')
      };
      
      const result = await testConnection(client);
      
      expect(result).toBe(true);
      expect(client.call).toHaveBeenCalledWith('core.getWikiTitle');
    });
    
    test('should throw error for failed connection', async () => {
      const client = {
        call: jest.fn().mockRejectedValue(new Error('Connection failed'))
      };
      
      await expect(testConnection(client)).rejects.toThrow('Failed to connect to DokuWiki: Connection failed');
    });
  });
});
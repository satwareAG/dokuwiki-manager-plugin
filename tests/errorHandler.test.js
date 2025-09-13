/**
 * Tests for the error handler module
 */

// Import the module to test
const { ERROR_MESSAGES, handleApiError, getRecoverySuggestion } = require('../src/errorHandler');

describe('Error Handler Module', () => {
  describe('handleApiError', () => {
    test('should return original error if no code is present', () => {
      const error = new Error('Test error');
      const result = handleApiError(error);
      
      expect(result.message).toBe('Test error');
      expect(result.code).toBeUndefined();
    });
    
    test('should enhance error message with user-friendly message', () => {
      const error = new Error('Technical error message');
      error.code = 121;
      
      const result = handleApiError(error);
      
      expect(result.message).toContain('The requested page (revision) does not exist');
      expect(result.message).toContain('(Code: 121)');
      expect(result.code).toBe(121);
    });
    
    test('should preserve original technical message', () => {
      const error = new Error('Technical database error');
      error.code = 500;
      
      const result = handleApiError(error);
      
      expect(result.message).toContain('Server error occurred');
      expect(result.message).toContain('Technical database error');
      expect(result.code).toBe(500);
    });
    
    test('should not modify error if error code is unknown', () => {
      const error = new Error('Unknown error');
      error.code = 9999;
      
      const result = handleApiError(error);
      
      expect(result.message).toBe('Unknown error');
      expect(result.code).toBe(9999);
    });
  });
  
  describe('getRecoverySuggestion', () => {
    test('should return null if no code is present', () => {
      const error = new Error('Test error');
      const result = getRecoverySuggestion(error);
      
      expect(result).toBeNull();
    });
    
    test('should return authentication suggestion for auth errors', () => {
      const error = new Error('Authentication failed');
      error.code = 401;
      
      const result = getRecoverySuggestion(error);
      
      expect(result).toContain('Check your username and password');
      expect(result).toContain('authentication method');
    });
    
    test('should return permission suggestion for permission errors', () => {
      const error = new Error('Permission denied');
      error.code = 403;
      
      const result = getRecoverySuggestion(error);
      
      expect(result).toContain('doesn\'t have sufficient permissions');
      expect(result).toContain('wiki administrator');
    });
    
    test('should return connection suggestion for connection errors', () => {
      const error = new Error('Connection failed');
      error.code = 1001;
      
      const result = getRecoverySuggestion(error);
      
      expect(result).toContain('Check your network connection');
      expect(result).toContain('DokuWiki URL is correct');
    });
    
    test('should return page locked suggestion for locked page errors', () => {
      const error = new Error('Page locked');
      error.code = 133;
      
      const result = getRecoverySuggestion(error);
      
      expect(result).toContain('being edited by another user');
      expect(result).toContain('Try again later');
    });
    
    test('should return server error suggestion for server errors', () => {
      const error = new Error('Server error');
      error.code = 500;
      
      const result = getRecoverySuggestion(error);
      
      expect(result).toContain('server is experiencing issues');
      expect(result).toContain('try again later');
    });
    
    test('should return null for unknown error codes', () => {
      const error = new Error('Unknown error');
      error.code = 9999;
      
      const result = getRecoverySuggestion(error);
      
      expect(result).toBeNull();
    });
  });
  
  describe('ERROR_MESSAGES', () => {
    test('should have appropriate message for page not found', () => {
      expect(ERROR_MESSAGES[121]).toBe('The requested page (revision) does not exist');
    });
    
    test('should have appropriate message for authentication failure', () => {
      expect(ERROR_MESSAGES[401]).toBe('Authentication failed. Please check your credentials');
    });
    
    test('should have appropriate message for page locked', () => {
      expect(ERROR_MESSAGES[133]).toBe('The page is currently locked');
    });
    
    test('should have appropriate message for server error', () => {
      expect(ERROR_MESSAGES[500]).toBe('Server error occurred. Please try again later');
    });
  });
});
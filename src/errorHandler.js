/**
 * Error handling utilities for DokuWiki API
 * 
 * @module dokuwiki-manager/errorHandler
 * @author satware AG
 * @license MIT
 */

// Map of DokuWiki error codes to user-friendly messages
const ERROR_MESSAGES = {
  // Success
  0: "Success",
  
  // Page errors
  111: "You are not allowed to read this page",
  121: "The requested page (revision) does not exist",
  131: "Empty or invalid page ID given",
  132: "Refusing to write an empty new wiki page",
  133: "The page is currently locked",
  134: "The page content was blocked",
  
  // Media errors
  211: "You are not allowed to read this media file",
  212: "You are not allowed to delete this media file",
  221: "The requested media file (revision) does not exist",
  231: "Empty or invalid media ID given",
  232: "Media file is still referenced",
  233: "Failed to delete media file",
  234: "Invalid base64 encoded data",
  235: "Empty file given",
  236: "Failed to save media",
  
  // Authentication errors
  401: "Authentication failed. Please check your credentials",
  403: "Insufficient permissions to perform this operation",
  
  // Server errors
  500: "Server error occurred. Please try again later",
  
  // Connection errors
  1000: "Unable to connect to the DokuWiki server",
  1001: "Network error when connecting to server",
  1002: "Timeout when connecting to server"
};

/**
 * Handles DokuWiki API error codes and provides user-friendly error messages
 * 
 * @param {Error} error - Error object from API call
 * @returns {Error} Enhanced error with user-friendly message
 */
function handleApiError(error) {
  // If no error code is present, return the original error
  if (!error.code) {
    return error;
  }
  
  // Clone the error to avoid modifying the original
  const enhancedError = new Error(error.message);
  enhancedError.code = error.code;
  enhancedError.originalMessage = error.message;
  
  // Enhance with a user-friendly message if available
  if (ERROR_MESSAGES[error.code]) {
    enhancedError.message = `${ERROR_MESSAGES[error.code]} (Code: ${error.code})`;
    
    // Preserve original technical message when relevant
    if (error.originalMessage && !enhancedError.message.includes(error.originalMessage)) {
      enhancedError.message += ` - ${error.originalMessage}`;
    }
  }
  
  return enhancedError;
}

/**
 * Provides recovery suggestions for specific error types
 * 
 * @param {Error} error - Error object from API call
 * @returns {string|null} Recovery suggestion or null if none available
 */
function getRecoverySuggestion(error) {
  if (!error.code) {
    return null;
  }
  
  // Authentication errors
  if (error.code === 401 || error.message.includes('Authentication failed')) {
    return "Check your username and password in plugin settings. Make sure you have the correct authentication method selected.";
  }
  
  // Permission errors
  if (error.code === 403 || error.code === 111 || error.code === 212) {
    return "Your account doesn't have sufficient permissions. Contact your wiki administrator for access.";
  }
  
  // Connection errors
  if (error.code >= 1000 && error.code < 2000) {
    return "Check your network connection and verify that the DokuWiki URL is correct in plugin settings.";
  }
  
  // Page locked
  if (error.code === 133) {
    return "The page is currently being edited by another user. Try again later.";
  }
  
  // Server errors
  if (error.code >= 500 && error.code < 600) {
    return "The server is experiencing issues. Please try again later or contact your wiki administrator.";
  }
  
  return null;
}

// Export the module functions and constants
module.exports = {
  ERROR_MESSAGES,
  handleApiError,
  getRecoverySuggestion
};
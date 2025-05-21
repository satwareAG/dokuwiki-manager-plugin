/**
 * DokuWiki Manager Plugin - Main Module
 * Entry point for the plugin that exports all modules.
 * 
 * @module dokuwiki-manager
 * @author satware AG
 * @license MIT
 */

// Import modules
const auth = require('./auth');
const apiClient = require('./apiClient');
const errorHandler = require('./errorHandler');

// Export all modules
module.exports = {
  auth,
  apiClient,
  errorHandler
};
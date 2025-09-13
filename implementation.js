/**
 * DokuWiki Manager Plugin
 * A TypingMind plugin for managing DokuWiki websites
 * 
 * Created by satware AG
 * License: MIT
 */

// Import modules
const { apiClient } = require('./src/index');
const { handleApiError, getRecoverySuggestion } = require('./src/errorHandler');

/**
 * Main entry point for the DokuWiki Manager plugin
 * Called by Typing Mind when the plugin is invoked
 * 
 * @param {Object} params - Parameters from the plugin function specification
 * @param {Object} userSettings - User settings from the plugin configuration
 * @returns {any} - Result of the operation
 * @throws {Error} - If the operation fails
 */
async function manage_dokuwiki(params, userSettings) {
  try {
    // Validate operation parameter
    if (!params || !params.operation) {
      throw new Error("Operation parameter is required");
    }
    
    // Create and initialize the API client
    const client = await apiClient.createApiClient(userSettings);

    // Route to the appropriate handler based on the operation
    switch (params.operation) {
      case "get_page":
        return await getPage(params, client);
      case "save_page":
        return await savePage(params, client);
      case "append_page":
        return await appendPage(params, client);
      case "list_pages":
        return await listPages(params, client, userSettings);
      case "search_pages":
        return await searchPages(params, client);
      case "get_page_info":
        return await getPageInfo(params, client);
      case "get_page_history":
        return await getPageHistory(params, client);
      case "list_media":
        return await listMedia(params, client, userSettings);
      case "get_media":
        return await getMedia(params, client);
      case "save_media":
        return await saveMedia(params, client);
      case "delete_media":
        return await deleteMedia(params, client);
      default:
        throw new Error(`Unsupported operation: ${params.operation}`);
    }
  } catch (error) {
    // Enhance error with recovery suggestions
    const enhancedError = handleApiError(error);
    const suggestion = getRecoverySuggestion(enhancedError);
    
    if (suggestion) {
      enhancedError.message += `\n\nPossible solution: ${suggestion}`;
    }
    
    throw enhancedError;
  }
}

/**
 * Get a wiki page's content
 */
async function getPage(params, client) {
  if (!params.pageId) {
    throw new Error("Page ID is required for get_page operation");
  }

  try {
    const result = await client.call('core.getPage', {
      page: params.pageId,
      rev: params.rev || 0
    });

    return result;
  } catch (error) {
    // Special handling for non-existent pages
    if (error.code === 121) {
      return ""; // Return empty string for non-existent pages (matches DokuWiki behavior)
    }
    throw error;
  }
}

/**
 * Save a wiki page's content (create or update)
 */
async function savePage(params, client) {
  if (!params.pageId) {
    throw new Error("Page ID is required for save_page operation");
  }
  if (params.content === undefined) {
    throw new Error("Content is required for save_page operation");
  }

  return await client.call('core.savePage', {
    page: params.pageId,
    text: params.content,
    summary: params.summary || "",
    isminor: params.minor || false
  });
}

/**
 * Append content to a wiki page
 */
async function appendPage(params, client) {
  if (!params.pageId) {
    throw new Error("Page ID is required for append_page operation");
  }
  if (!params.content) {
    throw new Error("Content is required for append_page operation");
  }

  return await client.call('core.appendPage', {
    page: params.pageId,
    text: params.content,
    summary: params.summary || "",
    isminor: params.minor || false
  });
}

/**
 * List pages in a namespace
 */
async function listPages(params, client, userSettings) {
  const namespace = params.namespace || userSettings?.defaultNamespace || "";
  const depth = params.depth || 1;
  const includeHash = params.include_hash || false;

  const result = await client.call('core.listPages', {
    namespace: namespace,
    depth: depth,
    hash: includeHash
  });

  return result;
}

/**
 * Search pages by content
 */
async function searchPages(params, client) {
  if (!params.searchQuery && !params.query) {
    throw new Error("Search query is required for search_pages operation");
  }

  const query = params.query || params.searchQuery;

  const result = await client.call('core.searchPages', {
    query: query
  });

  return result;
}

/**
 * Get page metadata
 */
async function getPageInfo(params, client) {
  if (!params.pageId) {
    throw new Error("Page ID is required for get_page_info operation");
  }

  const result = await client.call('core.getPageInfo', {
    page: params.pageId,
    rev: params.rev || 0,
    author: params.include_author || false,
    hash: params.include_hash || false
  });

  return result;
}

/**
 * Get page revision history
 */
async function getPageHistory(params, client) {
  if (!params.pageId) {
    throw new Error("Page ID is required for get_page_history operation");
  }

  const result = await client.call('core.getPageHistory', {
    page: params.pageId,
    first: params.first || 0
  });

  return result;
}

/**
 * List media files in a namespace
 */
async function listMedia(params, client, userSettings) {
  const namespace = params.namespace || userSettings?.defaultNamespace || "";
  const depth = params.depth || 1;
  const pattern = params.pattern || "";
  const includeHash = params.include_hash || false;

  const result = await client.call('core.listMedia', {
    namespace: namespace,
    pattern: pattern,
    depth: depth,
    hash: includeHash
  });

  return result;
}

/**
 * Get media file content
 */
async function getMedia(params, client) {
  if (!params.mediaId) {
    throw new Error("Media ID is required for get_media operation");
  }

  const result = await client.call('core.getMedia', {
    media: params.mediaId,
    rev: params.rev || 0
  });

  return result;
}

/**
 * Save media file
 */
async function saveMedia(params, client) {
  if (!params.mediaId) {
    throw new Error("Media ID is required for save_media operation");
  }
  
  // Check for content parameter (support both content and base64_content)
  const base64Content = params.base64_content || params.content;
  if (!base64Content) {
    throw new Error("Content (base64 encoded) is required for save_media operation");
  }

  const result = await client.call('core.saveMedia', {
    media: params.mediaId,
    base64: base64Content,
    overwrite: params.overwrite || false
  });

  return result;
}

/**
 * Delete media file
 */
async function deleteMedia(params, client) {
  if (!params.mediaId) {
    throw new Error("Media ID is required for delete_media operation");
  }

  const result = await client.call('core.deleteMedia', {
    media: params.mediaId
  });

  return result;
}
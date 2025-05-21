/**
 * DokuWiki Manager Plugin
 * A TypingMind plugin for managing DokuWiki websites
 * 
 * Created by satware AG
 * License: MIT
 */

// Main function that will be called by TypingMind
async function manage_dokuwiki(params, userSettings) {
  // Parameter validation
  if (!params.operation) {
    throw new Error("Operation parameter is required");
  }

  // Authenticate and create the JSON-RPC client
  const client = await createJsonRpcClient(userSettings);

  // Route to the appropriate handler based on the operation
  try {
    switch (params.operation) {
      case "get_page":
        return await getPage(params, client);
      case "save_page":
        return await savePage(params, client);
      case "append_page":
        return await appendPage(params, client);
      case "list_pages":
        return await listPages(params, client);
      case "search_pages":
        return await searchPages(params, client);
      case "get_page_info":
        return await getPageInfo(params, client);
      case "get_page_history":
        return await getPageHistory(params, client);
      case "list_media":
        return await listMedia(params, client);
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
    // Enhanced error handling
    if (error.code) {
      // Handle specific DokuWiki API error codes
      handleDokuWikiError(error);
    }
    throw error;
  }
}

// Helper Functions

/**
 * Create a JSON-RPC client with authentication
 */
async function createJsonRpcClient(userSettings) {
  const { wikiUrl, username, password } = userSettings;
  
  if (!wikiUrl) {
    throw new Error("DokuWiki URL is required in the plugin settings");
  }
  
  if (!username || !password) {
    throw new Error("DokuWiki username and password are required in the plugin settings");
  }

  // Create a basic client object with auth details
  const client = {
    baseUrl: wikiUrl.endsWith('/') ? `${wikiUrl}lib/exe/jsonrpc.php` : `${wikiUrl}/lib/exe/jsonrpc.php`,
    auth: `Basic ${btoa(`${username}:${password}`)}`,
    async call(method, params = {}) {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.auth
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: method,
          params: params
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        const error = new Error(result.error.message);
        error.code = result.error.code;
        throw error;
      }

      return result.result;
    }
  };

  // Test the connection
  try {
    await client.call('core.getWikiTitle');
    return client;
  } catch (error) {
    throw new Error(`Failed to connect to DokuWiki: ${error.message}`);
  }
}

/**
 * Handle DokuWiki-specific error codes
 */
function handleDokuWikiError(error) {
  // Map of DokuWiki error codes to user-friendly messages
  const errorMap = {
    0: "Success",
    111: "You are not allowed to read this page",
    121: "The requested page (revision) does not exist",
    131: "Empty or invalid page ID given",
    132: "Refusing to write an empty new wiki page",
    133: "The page is currently locked",
    134: "The page content was blocked",
    211: "You are not allowed to read this media file",
    212: "You are not allowed to delete this media file",
    221: "The requested media file (revision) does not exist",
    231: "Empty or invalid media ID given",
    232: "Media file is still referenced",
    233: "Failed to delete media file",
    234: "Invalid base64 encoded data",
    235: "Empty file given",
    236: "Failed to save media"
  };

  // Enhance the error message if we have a specific message for this code
  if (errorMap[error.code]) {
    error.message = `${errorMap[error.code]} (Code: ${error.code})`;
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
      rev: params.revision || 0
    });

    return result;
  } catch (error) {
    // Specific handling for get_page errors
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
    isminor: params.isMinor || false
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
    isminor: params.isMinor || false
  });
}

/**
 * List pages in a namespace
 */
async function listPages(params, client) {
  const namespace = params.namespace || userSettings?.defaultNamespace || "";
  const depth = params.depth || 1;

  const result = await client.call('core.listPages', {
    namespace: namespace,
    depth: depth,
    hash: false
  });

  return result;
}

/**
 * Search pages by content
 */
async function searchPages(params, client) {
  if (!params.searchQuery) {
    throw new Error("Search query is required for search_pages operation");
  }

  const result = await client.call('core.searchPages', {
    query: params.searchQuery
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
    rev: params.revision || 0,
    author: true,
    hash: false
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
async function listMedia(params, client) {
  const namespace = params.namespace || userSettings?.defaultNamespace || "";
  const depth = params.depth || 1;
  const pattern = params.pattern || "";

  const result = await client.call('core.listMedia', {
    namespace: namespace,
    pattern: pattern,
    depth: depth,
    hash: false
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
    rev: params.revision || 0
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
  if (!params.content) {
    throw new Error("Content (base64 encoded) is required for save_media operation");
  }

  const result = await client.call('core.saveMedia', {
    media: params.mediaId,
    base64: params.content,
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
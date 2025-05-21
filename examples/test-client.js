/**
 * Test client for DokuWiki Manager Plugin
 * This example demonstrates how to use the modular API client with a local DokuWiki instance
 */

const { apiClient } = require('../src');
const { handleDokuWikiError } = require('../src/errorHandler');

// DokuWiki configuration - Update with your local instance details
const config = {
    wikiUrl: 'http://localhost:8080',
    username: 'admin',
    password: 'DevTest2025!',
    authMethod: 'BASIC_AUTH',
    defaultNamespace: ''
};

/**
 * Test various DokuWiki API operations
 */
async function testDokuWikiAPI() {
    let client;

    try {
        // Create API client
        console.log('Connecting to DokuWiki instance...');
        client = await apiClient.createApiClient(config);
        console.log('Connected successfully!');

        // Get wiki title
        const wikiTitle = await client.call('core.getWikiTitle');
        console.log(`Wiki Title: ${wikiTitle}`);

        // Get page content
        try {
            console.log('\nFetching content of "start" page...');
            const pageContent = await client.call('core.getPage', {
                page: 'start'
            });
            console.log('Page content:\n-------------------');
            console.log(pageContent || '(Empty page)');
            console.log('-------------------');
        } catch (error) {
            // Handle DokuWiki-specific errors
            const enhancedError = handleDokuWikiError(error);
            console.error(`Error fetching page: ${enhancedError.userMessage || error.message}`);
            if (enhancedError.recoverySuggestion) {
                console.error(`Recovery suggestion: ${enhancedError.recoverySuggestion}`);
            }
        }

        // List pages in wiki
        try {
            console.log('\nListing pages in root namespace...');
            const pages = await client.call('core.listPages', {
                namespace: '',
                depth: 1
            });

            console.log('Pages:');
            if (Array.isArray(pages)) {
                pages.forEach((page, index) => {
                    // Handle different possible return formats
                    if (typeof page === 'string') {
                        console.log(`- ${page}`);
                    } else if (typeof page === 'object') {
                        const pageId = page.id || page.page || `Page ${index + 1}`;
                        const pageSize = page.size || 'unknown size';
                        const pageMtime = page.mtime ? new Date(page.mtime * 1000).toLocaleString() : 'unknown date';
                        console.log(`- ${pageId} (${pageSize} bytes, last modified: ${pageMtime})`);
                    } else {
                        console.log(`- ${String(page)}`);
                    }
                });
            } else {
                console.log('No pages found or unexpected result format:', pages);
            }
        } catch (error) {
            const enhancedError = handleDokuWikiError(error);
            console.error(`Error listing pages: ${enhancedError.userMessage || error.message}`);
        }

        // Create a test page
        try {
            console.log('\nCreating a test page...');
            await client.call('core.savePage', {
                page: 'test_page',
                text: '====== Test Page ======\n\nThis page was created by the DokuWiki Manager Plugin test client.',
                summary: 'Created by test client'
            });
            console.log('Test page created successfully!');
        } catch (error) {
            const enhancedError = handleDokuWikiError(error);
            console.error(`Error creating page: ${enhancedError.userMessage || error.message}`);
        }

    } catch (error) {
        console.error('Error connecting to DokuWiki:');
        console.error(error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    }
}

// Run the test client
testDokuWikiAPI().catch(error => {
    console.error('Unhandled error in test client:', error);
});

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

// Port to listen on
const PORT = 3000;

// In-memory cache for API responses
const apiCache = {
    cache: {},
    // Default TTL is 1 hour (in milliseconds)
    defaultTTL: 60 * 60 * 1000,
    
    // Get an item from the cache
    get: function(key) {
        const item = this.cache[key];
        if (!item) return null;
        
        // Check if the item has expired
        if (Date.now() > item.expiry) {
            delete this.cache[key];
            return null;
        }
        
        return item.data;
    },
    
    // Put an item in the cache
    put: function(key, data, ttl = this.defaultTTL) {
        this.cache[key] = {
            data: data,
            expiry: Date.now() + ttl
        };
    },
    
    // Generate a cache key from the request data
    generateKey: function(data) {
        return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
    },
    
    // Clear the entire cache
    clear: function() {
        this.cache = {};
    },
    
    // Get cache statistics
    getStats: function() {
        const now = Date.now();
        let active = 0;
        let expired = 0;
        
        for (const key in this.cache) {
            if (now > this.cache[key].expiry) {
                expired++;
            } else {
                active++;
            }
        }
        
        return {
            total: Object.keys(this.cache).length,
            active,
            expired
        };
    }
};

// MIME types for file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

// Read the API key from .env file
let apiKey = '';
try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const keyMatch = envFile.match(/GEMINI_API_KEY=(.+)/);
    if (keyMatch && keyMatch[1]) {
        apiKey = keyMatch[1].trim();
        console.log('API key loaded successfully');
    }
} catch (error) {
    console.error('Error loading API key:', error);
}

// Create the server
const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS requests for CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // Parse the URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Handle API proxy requests
    if (pathname === '/api/gemini' && req.method === 'POST') {
        handleApiProxy(req, res);
        return;
    }
    
    // Handle cache stats endpoint
    if (pathname === '/api/cache-stats' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(apiCache.getStats()));
        return;
    }
    
    // Handle cache clear endpoint
    if (pathname === '/api/cache-clear' && req.method === 'POST') {
        apiCache.clear();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Cache cleared successfully' }));
        return;
    }
    
    // Normalize the path to serve index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Get the file path
    const filePath = path.join(__dirname, pathname);
    
    // Serve the file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            // If the file doesn't exist, return 404
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
            
            // For other errors, return 500
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
            return;
        }
        
        // Determine content type based on file extension
        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        
        // Send the response
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

// Handle API proxy requests
function handleApiProxy(req, res) {
    // Get request body
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        // Check if the request has been responded to already
        if (res.headersSent) {
            console.warn('Headers already sent, skipping response');
            return;
        }
        
        // Parse the request body
        let requestData;
        try {
            requestData = JSON.parse(body);
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
        }
        
        // Generate a cache key for this request
        const cacheKey = apiCache.generateKey(requestData);
        
        // Check if we have a cached response
        const cachedResponse = apiCache.get(cacheKey);
        if (cachedResponse) {
            console.log('Using cached response for request');
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'X-Cache': 'HIT'  // Set the cache header in the same call as writeHead
            });
            res.end(cachedResponse);
            return;
        }
        
        // Prepare the request to the Gemini API
        // Using gemini-2.0-flash model instead of gemini-pro
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        // Make the request to the Gemini API
        const apiReq = https.request(options, apiRes => {
            let responseData = '';
            
            apiRes.on('data', chunk => {
                responseData += chunk;
            });
            
            apiRes.on('end', () => {
                // Skip if headers already sent
                if (res.headersSent) {
                    console.warn('Headers already sent, skipping response in apiRes.on(end)');
                    return;
                }
                
                // Cache the response if status is 200
                if (apiRes.statusCode === 200) {
                    apiCache.put(cacheKey, responseData);
                    console.log('Cached response for future requests');
                }
                
                // Forward the response from the Gemini API
                res.writeHead(apiRes.statusCode, { 
                    'Content-Type': 'application/json',
                    'X-Cache': 'MISS'  // Set the cache header in the same call as writeHead
                });
                res.end(responseData);
            });
        });
        
        // Handle errors
        apiReq.on('error', error => {
            // Skip if headers already sent
            if (res.headersSent) {
                console.warn('Headers already sent, skipping error response');
                return;
            }
            
            console.error('Error making request to Gemini API:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to contact Gemini API' }));
        });
        
        // Send the request
        apiReq.write(JSON.stringify(requestData));
        apiReq.end();
    });
}

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`API proxy available at http://localhost:${PORT}/api/gemini`);
    console.log(`Cache statistics available at http://localhost:${PORT}/api/cache-stats`);
}); 
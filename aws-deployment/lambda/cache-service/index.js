/**
 * Distributed Cache Service for SIMISAI
 * Uses DynamoDB for cross-Lambda response caching
 */

const AWS = require('aws-sdk');
const crypto = require('crypto');

// Initialize DynamoDB with performance optimizations
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1',
    maxRetries: 2,
    retryDelayOptions: {
        customBackoff: function(retryCount) {
            return Math.pow(2, retryCount) * 50; // Faster retry for cache
        }
    }
});

const CACHE_TABLE = process.env.CACHE_TABLE || 'simisai-response-cache';
const DEFAULT_TTL = 300; // 5 minutes default TTL

/**
 * Generate cache key from request data
 */
function generateCacheKey(type, data, provider = 'default') {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    return `${type}:${provider}:${hash.slice(0, 16)}`;
}

/**
 * Get cached response from DynamoDB
 */
async function getCachedResponse(cacheKey) {
    try {
        const params = {
            TableName: CACHE_TABLE,
            Key: { id: cacheKey },
            ProjectionExpression: 'response, ttl, createdAt'
        };
        
        const result = await dynamodb.get(params).promise();
        
        if (!result.Item) {
            return null; // Cache miss
        }
        
        // Check TTL
        const now = Math.floor(Date.now() / 1000);
        if (result.Item.ttl < now) {
            // Expired, delete and return null
            await deleteCachedResponse(cacheKey);
            return null;
        }
        
        return {
            response: result.Item.response,
            cached: true,
            age: now - result.Item.createdAt
        };
        
    } catch (error) {
        console.error('Cache get error:', error);
        return null; // Fail silently for cache
    }
}

/**
 * Set cached response in DynamoDB
 */
async function setCachedResponse(cacheKey, response, ttl = DEFAULT_TTL) {
    try {
        const now = Math.floor(Date.now() / 1000);
        const expireTime = now + ttl;
        
        const params = {
            TableName: CACHE_TABLE,
            Item: {
                id: cacheKey,
                response: response,
                ttl: expireTime,
                createdAt: now,
                size: JSON.stringify(response).length
            }
        };
        
        await dynamodb.put(params).promise();
        
        return {
            cached: true,
            ttl: ttl,
            expiresAt: new Date(expireTime * 1000).toISOString()
        };
        
    } catch (error) {
        console.error('Cache set error:', error);
        return { cached: false, error: error.message };
    }
}

/**
 * Delete cached response
 */
async function deleteCachedResponse(cacheKey) {
    try {
        await dynamodb.delete({
            TableName: CACHE_TABLE,
            Key: { id: cacheKey }
        }).promise();
        return true;
    } catch (error) {
        console.error('Cache delete error:', error);
        return false;
    }
}

/**
 * Get cache statistics
 */
async function getCacheStats() {
    try {
        const params = {
            TableName: CACHE_TABLE,
            Select: 'COUNT'
        };
        
        const result = await dynamodb.scan(params).promise();
        
        return {
            totalItems: result.Count,
            tableSize: result.ScannedCount
        };
        
    } catch (error) {
        console.error('Cache stats error:', error);
        return { totalItems: 0, tableSize: 0 };
    }
}

/**
 * Clear expired cache entries (cleanup function)
 */
async function cleanupExpiredCache() {
    try {
        const now = Math.floor(Date.now() / 1000);
        
        // Scan for expired items
        const params = {
            TableName: CACHE_TABLE,
            FilterExpression: 'ttl < :now',
            ExpressionAttributeValues: {
                ':now': now
            },
            ProjectionExpression: 'id'
        };
        
        const result = await dynamodb.scan(params).promise();
        
        // Delete expired items in batches
        const deletePromises = result.Items.map(item => 
            deleteCachedResponse(item.id)
        );
        
        await Promise.all(deletePromises);
        
        return {
            deletedCount: result.Items.length,
            cleanupTime: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Cache cleanup error:', error);
        return { deletedCount: 0, error: error.message };
    }
}

/**
 * Main cache service handler
 */
exports.handler = async (event) => {
    const { operation, cacheKey, response, ttl, type, data, provider } = event;
    
    try {
        switch (operation) {
            case 'get':
                return await getCachedResponse(cacheKey);
                
            case 'set':
                return await setCachedResponse(cacheKey, response, ttl);
                
            case 'delete':
                return await deleteCachedResponse(cacheKey);
                
            case 'generate':
                return { cacheKey: generateCacheKey(type, data, provider) };
                
            case 'stats':
                return await getCacheStats();
                
            case 'cleanup':
                return await cleanupExpiredCache();
                
            default:
                return {
                    error: 'Invalid operation',
                    supportedOperations: ['get', 'set', 'delete', 'generate', 'stats', 'cleanup']
                };
        }
        
    } catch (error) {
        console.error('Cache service error:', error);
        return {
            error: error.message,
            operation: operation
        };
    }
};

/**
 * Helper functions for other Lambda functions
 */
exports.generateCacheKey = generateCacheKey;
exports.getCachedResponse = getCachedResponse;
exports.setCachedResponse = setCachedResponse;
exports.deleteCachedResponse = deleteCachedResponse;
exports.getCacheStats = getCacheStats;
exports.cleanupExpiredCache = cleanupExpiredCache;

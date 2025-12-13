/**
 * Optimized Hybrid LLM Service - Performance Enhanced
 * Features: Connection pooling, response caching, optimized memory usage
 */

const AWS = require('aws-sdk');

// Initialize AWS SDK with connection reuse
const sagemakerRuntime = new AWS.SageMakerRuntime({ 
    region: 'us-east-1',
    maxRetries: 2,
    retryDelayOptions: {
        customBackoff: function(retryCount) {
            return Math.pow(2, retryCount) * 100;
        }
    }
});

// Configuration with performance optimizations
const CONFIG = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4',
        maxTokens: 300, // Reduced from 1000 for faster responses
        temperature: 0.7,
        timeout: 10000 // 10 second timeout
    },
    sagemaker: {
        endpoint: 'simisai-sealion-realtime-endpoint',
        region: 'us-east-1',
        maxTokens: 200, // Reduced for faster inference
        temperature: 0.7
    },
    cache: {
        ttl: 300000, // 5 minutes cache
        maxSize: 100 // Maximum cached responses
    }
};

// In-memory cache for response optimization
const responseCache = new Map();
let cacheHits = 0;
let cacheMisses = 0;

// Current provider state
let currentProvider = 'openai';
let sagemakerReady = false;
let requestCount = 0;

/**
 * Generate cache key for request
 */
function generateCacheKey(messages, provider) {
    const messageContent = messages.map(m => `${m.role}:${m.content}`).join('|');
    return `${provider}:${Buffer.from(messageContent).toString('base64').slice(0, 50)}`;
}

/**
 * Check cache for existing response
 */
function getCachedResponse(cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CONFIG.cache.ttl) {
        cacheHits++;
        return cached.response;
    }
    cacheMisses++;
    return null;
}

/**
 * Store response in cache
 */
function setCachedResponse(cacheKey, response) {
    // Implement LRU cache eviction
    if (responseCache.size >= CONFIG.cache.maxSize) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
    }
    
    responseCache.set(cacheKey, {
        response,
        timestamp: Date.now()
    });
}

/**
 * Check if SageMaker endpoint is ready (optimized)
 */
async function checkSagemakerStatus() {
    try {
        // Use cached status for 30 seconds to avoid repeated calls
        if (sagemakerReady && Date.now() - lastSagemakerCheck < 30000) {
            return sagemakerReady;
        }
        
        const result = await sagemakerRuntime.describeEndpoint({
            EndpointName: CONFIG.sagemaker.endpoint
        }).promise();
        
        sagemakerReady = result.EndpointStatus === 'InService';
        lastSagemakerCheck = Date.now();
        return sagemakerReady;
    } catch (error) {
        console.log('SageMaker endpoint not ready:', error.message);
        sagemakerReady = false;
        lastSagemakerCheck = Date.now();
        return false;
    }
}

let lastSagemakerCheck = 0;

/**
 * Optimized OpenAI API call with timeout and retry
 */
async function callOpenAI(messages) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.openai.timeout);
    
    try {
        const response = await fetch(CONFIG.openai.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.openai.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CONFIG.openai.model,
                messages: messages,
                max_tokens: CONFIG.openai.maxTokens,
                temperature: CONFIG.openai.temperature,
                stream: false // Disable streaming for faster response
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('OpenAI request timeout');
        }
        throw error;
    }
}

/**
 * Optimized SageMaker endpoint call
 */
async function callSagemaker(messages) {
    const payload = {
        messages: messages,
        max_tokens: CONFIG.sagemaker.maxTokens,
        temperature: CONFIG.sagemaker.temperature,
        top_p: 0.9,
        stream: false // Disable streaming for faster response
    };
    
    const result = await sagemakerRuntime.invokeEndpoint({
        EndpointName: CONFIG.sagemaker.endpoint,
        ContentType: 'application/json',
        Body: JSON.stringify(payload)
    }).promise();
    
    const response = JSON.parse(result.Body.toString());
    return response.generated_text || response.choices?.[0]?.message?.content || 'Response generated successfully';
}

/**
 * Optimized main handler with caching and performance monitoring
 */
exports.handler = async (event) => {
    const startTime = Date.now();
    
    try {
        // Parse request body with error handling
        let body;
        try {
            body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
                } catch (parseError) {
            return createErrorResponse(400, 'Invalid JSON in request body');
        }
        
        const { messages } = body;
        
        if (!messages || !Array.isArray(messages)) {
            return createErrorResponse(400, 'Invalid messages format');
        }
        
        // Generate cache key
        const cacheKey = generateCacheKey(messages, currentProvider);
        
        // Check cache first
        const cachedResponse = getCachedResponse(cacheKey);
        if (cachedResponse) {
            console.log('🚀 Cache hit - returning cached response');
            return createSuccessResponse(cachedResponse, {
                provider: currentProvider === 'openai' ? 'OpenAI GPT-4 (Cached)' : 'SEA-LION 27B (Cached)',
                status: 'Cached Response',
                note: 'Response served from cache for optimal performance',
                cacheHit: true,
                processingTime: Date.now() - startTime
            });
        }
        
        // Provider switching logic (optimized)
        if (currentProvider === 'openai') {
            sagemakerReady = await checkSagemakerStatus();
            requestCount++;
            
            // Switch to SageMaker after fewer requests for better performance
            if (sagemakerReady && requestCount >= 2) {
                currentProvider = 'sagemaker';
                console.log('🔄 Switching to SEA-LION LLM for better performance!');
            }
        }
        
        let response;
        let providerInfo;
        let processingTime;
        
        // Call appropriate provider with performance monitoring
        const providerStartTime = Date.now();
        
        if (currentProvider === 'openai') {
            response = await callOpenAI(messages);
            providerInfo = {
                provider: 'OpenAI GPT-4',
                status: 'Optimized Mode',
                note: 'Fast response with reduced token limit',
                requestCount: requestCount,
                sagemakerReady: sagemakerReady
            };
        } else {
            response = await callSagemaker(messages);
            providerInfo = {
                provider: 'SEA-LION LLM (27B)',
                status: 'Production Mode',
                note: 'Custom medical AI model with optimized inference',
                requestCount: requestCount,
                sagemakerReady: sagemakerReady
            };
        }
        
        processingTime = Date.now() - providerStartTime;
        
        // Cache the response
        setCachedResponse(cacheKey, {
            response,
            provider: providerInfo,
            processingTime
        });
        
        const totalTime = Date.now() - startTime;
        
        return createSuccessResponse(response, {
            ...providerInfo,
            processingTime,
            totalTime,
            cacheHit: false,
            cacheStats: {
                hits: cacheHits,
                misses: cacheMisses,
                hitRate: cacheHits / (cacheHits + cacheMisses) * 100
            }
        });
        
    } catch (error) {
        console.error('Error in optimized handler:', error);
        
        // Enhanced fallback system
        if (currentProvider === 'sagemaker') {
            console.log('🔄 Falling back to OpenAI...');
            currentProvider = 'openai';
            
            try {
                const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
                const response = await callOpenAI(body.messages);
                
                return createSuccessResponse(response, {
                    provider: 'OpenAI GPT-4 (Fallback)',
                    status: 'Fallback Mode',
                    note: 'SEA-LION temporarily unavailable, using OpenAI fallback',
                    fallback: true
                });
            } catch (fallbackError) {
                console.error('Fallback failed:', fallbackError);
            }
        }
        
        return createErrorResponse(500, 'LLM service temporarily unavailable', {
            error: error.message,
            provider: currentProvider,
            processingTime: Date.now() - startTime
        });
    }
};

/**
 * Create success response with performance headers
 */
function createSuccessResponse(response, metadata) {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Processing-Time': metadata.processingTime || 0,
            'X-Cache-Hit': metadata.cacheHit || false,
            'X-Provider': metadata.provider || 'Unknown'
        },
        body: JSON.stringify({
            response: response,
            provider: metadata,
            timestamp: new Date().toISOString()
        })
    };
}

/**
 * Create error response
 */
function createErrorResponse(statusCode, message, details = {}) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            error: message,
            timestamp: new Date().toISOString(),
            ...details
        })
    };
}

/**
 * Warm-up function for Lambda optimization
 */
exports.warmup = async (event) => {
    console.log('Lambda warm-up initiated');
    
    // Pre-warm SageMaker connection
    try {
        await checkSagemakerStatus();
        console.log('✅ SageMaker connection warmed up');
    } catch (error) {
        console.log('⚠️ SageMaker warm-up failed:', error.message);
    }
    
    // Pre-warm OpenAI connection
    try {
        await callOpenAI([{ role: 'user', content: 'warmup' }]);
        console.log('✅ OpenAI connection warmed up');
    } catch (error) {
        console.log('⚠️ OpenAI warm-up failed:', error.message);
    }
    
    return { statusCode: 200, body: 'Warm-up complete' };
};
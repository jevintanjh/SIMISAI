/**
 * AI Provider Status Service
 * Checks availability of SEA-LION and OpenAI, provides intelligent routing
 */

const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');

const sagemakerClient = new SageMakerRuntimeClient({ region: 'us-east-1' });
const SAGEMAKER_ENDPOINT = 'simisai-sealion-realtime-endpoint';

// Status cache with TTL
let statusCache = {
    sagemaker: { available: false, lastChecked: 0, responseTime: 0 },
    openai: { available: false, lastChecked: 0, responseTime: 0 },
    recommended: 'openai' // Default recommendation
};

const CACHE_TTL = 30000; // 30 seconds cache

exports.handler = async (event) => {
    console.log('AI Provider Status Service Event:', JSON.stringify(event, null, 2));
    
    try {
        const { httpMethod, pathParameters } = event;
        
        if (httpMethod === 'GET') {
            return await handleGetStatus(pathParameters);
        } else if (httpMethod === 'POST') {
            return await handleCheckStatus(JSON.parse(event.body || '{}'));
        } else {
            return createResponse(405, { error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Error in AI Provider Status Service:', error);
        return createResponse(500, { 
            error: 'Internal server error',
            message: error.message 
        });
    }
};

/**
 * Handle GET request for current AI provider status
 */
async function handleGetStatus(pathParameters) {
    const { action } = pathParameters || {};
    
    if (action === 'check') {
        // Force fresh check
        await checkAllProviders();
    } else {
        // Use cached status if available
        const now = Date.now();
        if (now - statusCache.sagemaker.lastChecked > CACHE_TTL || 
            now - statusCache.openai.lastChecked > CACHE_TTL) {
            await checkAllProviders();
        }
    }
    
    return createResponse(200, {
        providers: {
            sagemaker: {
                available: statusCache.sagemaker.available,
                responseTime: statusCache.sagemaker.responseTime,
                lastChecked: new Date(statusCache.sagemaker.lastChecked).toISOString(),
                endpoint: SAGEMAKER_ENDPOINT,
                description: 'SEA-LION 27B - Custom ASEAN Medical AI Model'
            },
            openai: {
                available: statusCache.openai.available,
                responseTime: statusCache.openai.responseTime,
                lastChecked: new Date(statusCache.openai.lastChecked).toISOString(),
                description: 'OpenAI GPT-4 - Fast and Reliable Fallback'
            }
        },
        recommendation: {
            primary: statusCache.recommended,
            reason: getRecommendationReason(),
            timestamp: new Date().toISOString()
        },
        systemStatus: getSystemStatus()
    });
}

/**
 * Handle POST request for status check
 */
async function handleCheckStatus(requestBody) {
    const { forceCheck = false } = requestBody;
    
    if (forceCheck) {
        await checkAllProviders();
    }
    
    return createResponse(200, {
        status: 'checked',
        providers: statusCache,
        recommendation: statusCache.recommended,
        timestamp: new Date().toISOString()
    });
}

/**
 * Check all AI providers and update status cache
 */
async function checkAllProviders() {
    console.log('🔍 Checking AI provider status...');
    
    // Check SageMaker
    await checkSagemakerStatus();
    
    // Check OpenAI
    await checkOpenAIStatus();
    
    // Determine recommendation
    updateRecommendation();
    
    console.log('✅ Provider status updated:', statusCache);
}

/**
 * Check SageMaker endpoint status
 */
async function checkSagemakerStatus() {
    const startTime = Date.now();
    
    try {
        // Quick test with minimal payload
        const testPayload = {
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 10,
            temperature: 0.1
        };
        
        const command = new InvokeEndpointCommand({
            EndpointName: SAGEMAKER_ENDPOINT,
            ContentType: 'application/json',
            Body: JSON.stringify(testPayload)
        });
        
        // Set 5 second timeout for status check
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('SageMaker timeout')), 5000);
        });
        
        const response = await Promise.race([
            sagemakerClient.send(command),
            timeoutPromise
        ]);
        
        const responseTime = Date.now() - startTime;
        
        statusCache.sagemaker = {
            available: true,
            lastChecked: Date.now(),
            responseTime: responseTime
        };
        
        console.log('✅ SageMaker available - response time:', responseTime + 'ms');
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        
        statusCache.sagemaker = {
            available: false,
            lastChecked: Date.now(),
            responseTime: responseTime
        };
        
        console.log('❌ SageMaker unavailable:', error.message);
    }
}

/**
 * Check OpenAI status
 */
async function checkOpenAIStatus() {
    const startTime = Date.now();
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 5,
                temperature: 0.1
            }),
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
            statusCache.openai = {
                available: true,
                lastChecked: Date.now(),
                responseTime: responseTime
            };
            
            console.log('✅ OpenAI available - response time:', responseTime + 'ms');
        } else {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        
        statusCache.openai = {
            available: false,
            lastChecked: Date.now(),
            responseTime: responseTime
        };
        
        console.log('❌ OpenAI unavailable:', error.message);
    }
}

/**
 * Update recommendation based on provider status
 */
function updateRecommendation() {
    const { sagemaker, openai } = statusCache;
    
    if (sagemaker.available && openai.available) {
        // Both available - choose based on response time
        if (sagemaker.responseTime < openai.responseTime + 1000) { // 1 second tolerance
            statusCache.recommended = 'sagemaker';
        } else {
            statusCache.recommended = 'openai';
        }
    } else if (sagemaker.available) {
        statusCache.recommended = 'sagemaker';
    } else if (openai.available) {
        statusCache.recommended = 'openai';
    } else {
        statusCache.recommended = 'openai'; // Default fallback
    }
}

/**
 * Get recommendation reason
 */
function getRecommendationReason() {
    const { sagemaker, openai } = statusCache;
    
    if (sagemaker.available && openai.available) {
        if (statusCache.recommended === 'sagemaker') {
            return 'SEA-LION is faster and available';
        } else {
            return 'OpenAI is more reliable for this request';
        }
    } else if (sagemaker.available) {
        return 'SEA-LION is available, OpenAI is not';
    } else if (openai.available) {
        return 'SEA-LION unavailable, using OpenAI fallback';
    } else {
        return 'Using OpenAI as emergency fallback';
    }
}

/**
 * Get overall system status
 */
function getSystemStatus() {
    const { sagemaker, openai } = statusCache;
    
    if (sagemaker.available && openai.available) {
        return 'excellent';
    } else if (sagemaker.available || openai.available) {
        return 'good';
    } else {
        return 'degraded';
    }
}

/**
 * Create HTTP response
 */
function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify(body)
    };
}

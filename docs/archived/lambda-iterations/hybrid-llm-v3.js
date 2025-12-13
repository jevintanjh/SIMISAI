/**
 * Hybrid LLM Service - AWS SDK v3 Version
 * OpenAI → Sealion LLM switching for SIMISAI
 * System Architect Deployment
 */

// Use AWS SDK v3 (built into Lambda runtime)
const { SageMakerClient, DescribeEndpointCommand } = require('@aws-sdk/client-sagemaker');
const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');

// Initialize AWS clients
const sagemakerClient = new SageMakerClient({ region: 'us-east-1' });
const sagemakerRuntimeClient = new SageMakerRuntimeClient({ region: 'us-east-1' });

// Configuration
const CONFIG = {
    sagemaker: {
        endpoint: process.env.SAGEMAKER_ENDPOINT || 'simisai-sealion-realtime-endpoint',
        region: 'us-east-1'
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4'
    }
};

// Current provider (starts with OpenAI)
let currentProvider = 'openai';
let sagemakerReady = false;
let requestCount = 0;

/**
 * Check if SageMaker endpoint is ready
 */
async function checkSagemakerStatus() {
    try {
        const command = new DescribeEndpointCommand({
            EndpointName: CONFIG.sagemaker.endpoint
        });
        const result = await sagemakerClient.send(command);
        return result.EndpointStatus === 'InService';
    } catch (error) {
        console.log('SageMaker endpoint not ready:', error.message);
        return false;
    }
}

/**
 * Call OpenAI API using fetch (Node.js 18+)
 */
async function callOpenAI(messages) {
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
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
    }
}

/**
 * Call SageMaker endpoint
 */
async function callSagemaker(messages) {
    try {
        const payload = {
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
        };
        
        const command = new InvokeEndpointCommand({
            EndpointName: CONFIG.sagemaker.endpoint,
            ContentType: 'application/json',
            Body: JSON.stringify(payload)
        });
        
        const result = await sagemakerRuntimeClient.send(command);
        const response = JSON.parse(result.Body.toString());
        return response.generated_text || response.response || 'No response from SageMaker';
    } catch (error) {
        console.error('SageMaker API error:', error);
        throw error;
    }
}

/**
 * Main LLM handler with automatic provider switching
 */
exports.handler = async (event) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        
        // Parse the request body
        let body;
        if (typeof event.body === 'string') {
            body = JSON.parse(event.body);
        } else {
            body = event.body;
        }
        
        const { messages } = body;
        
        if (!messages || !Array.isArray(messages)) {
            throw new Error('Invalid messages format');
        }
        
        // Check if we should switch to SageMaker
        if (currentProvider === 'openai') {
            sagemakerReady = await checkSagemakerStatus();
            requestCount++;
            
            // Switch to SageMaker if ready and we've made enough requests
            if (sagemakerReady && requestCount >= 3) {
                currentProvider = 'sagemaker';
                console.log('🔄 Switching to Sealion LLM!');
            }
        }
        
        let response;
        let providerInfo;
        
        if (currentProvider === 'openai') {
            response = await callOpenAI(messages);
            providerInfo = {
                provider: 'OpenAI GPT-4',
                status: 'Demo Mode',
                note: 'Switching to Sealion LLM when ready...',
                requestCount: requestCount,
                sagemakerReady: sagemakerReady
            };
        } else {
            response = await callSagemaker(messages);
            providerInfo = {
                provider: 'Sealion LLM (27B)',
                status: 'Production Mode',
                note: 'Custom medical AI model active!',
                requestCount: requestCount,
                sagemakerReady: sagemakerReady
            };
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                response: response,
                provider: providerInfo,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('Handler error:', error);
        
        // Fallback to OpenAI if SageMaker fails
        if (currentProvider === 'sagemaker') {
            console.log('🔄 Falling back to OpenAI...');
            currentProvider = 'openai';
            
            try {
                const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
                const response = await callOpenAI(body.messages);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        response: response,
                        provider: {
                            provider: 'OpenAI GPT-4 (Fallback)',
                            status: 'Fallback Mode',
                            note: 'Sealion LLM temporarily unavailable'
                        },
                        timestamp: new Date().toISOString()
                    })
                };
            } catch (fallbackError) {
                console.error('Fallback failed:', fallbackError);
            }
        }
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'LLM service temporarily unavailable',
                provider: currentProvider,
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};

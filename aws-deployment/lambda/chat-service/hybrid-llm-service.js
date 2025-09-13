/**
 * Hybrid LLM Service - OpenAI → Sealion LLM
 * Hackathon Demo: Start with OpenAI, switch to Sealion when ready
 */

const AWS = require('aws-sdk');
const https = require('https');

// Initialize AWS SDK
const sagemaker = new AWS.SageMaker({ region: 'us-east-1' });

// Configuration
const CONFIG = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4'
    },
    sagemaker: {
        endpoint: 'simisai-sealion-realtime-endpoint',
        region: 'us-east-1'
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
        const result = await sagemaker.describeEndpoint({
            EndpointName: CONFIG.sagemaker.endpoint
        }).promise();
        
        return result.EndpointStatus === 'InService';
    } catch (error) {
        console.log('SageMaker endpoint not ready:', error.message);
        return false;
    }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(messages) {
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
    
    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Call SageMaker endpoint
 */
async function callSagemaker(messages) {
    const sagemakerRuntime = new AWS.SageMakerRuntime({ 
        region: CONFIG.sagemaker.region 
    });
    
    const payload = {
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
    };
    
    const result = await sagemakerRuntime.invokeEndpoint({
        EndpointName: CONFIG.sagemaker.endpoint,
        ContentType: 'application/json',
        Body: JSON.stringify(payload)
    }).promise();
    
    const response = JSON.parse(result.Body.toString());
    return response.generated_text;
}

/**
 * Main LLM handler with automatic provider switching
 */
exports.handler = async (event) => {
    try {
        const { messages } = JSON.parse(event.body);
        
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
                note: 'Switching to Sealion LLM when ready...'
            };
        } else {
            response = await callSagemaker(messages);
            providerInfo = {
                provider: 'Sealion LLM (27B)',
                status: 'Production Mode',
                note: 'Custom medical AI model active!'
            };
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: response,
                provider: providerInfo,
                requestCount: requestCount,
                sagemakerReady: sagemakerReady
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        // Fallback to OpenAI if SageMaker fails
        if (currentProvider === 'sagemaker') {
            console.log('🔄 Falling back to OpenAI...');
            currentProvider = 'openai';
            
            try {
                const response = await callOpenAI(JSON.parse(event.body).messages);
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
                        }
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
                provider: currentProvider
            })
        };
    }
};

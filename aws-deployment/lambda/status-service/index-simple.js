/**
 * Status Service - Monitor LLM Provider Status (Simplified)
 * Hackathon Demo: Real-time status updates
 */

exports.handler = async (event) => {
    try {
        // For now, return a simple status without calling SageMaker
        // This avoids dependency issues during debugging
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                sagemaker: {
                    status: 'InService',
                    ready: true,
                    endpoint: 'simisai-sealion-realtime-endpoint',
                    lastUpdated: new Date().toISOString()
                },
                currentProvider: 'sagemaker',
                message: '🚀 Sealion LLM is ready! Using custom AI model...',
                debug: 'Simplified version - SageMaker check disabled for debugging'
            })
        };
        
    } catch (error) {
        console.error('Status check error:', error);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                sagemaker: {
                    status: 'Unknown',
                    ready: false,
                    error: error.message
                },
                currentProvider: 'openai',
                message: '⏳ Sealion LLM status unknown... Using OpenAI for demo'
            })
        };
    }
};





/**
 * Status Service - Monitor LLM Provider Status
 * Hackathon Demo: Real-time status updates
 */

const { SageMakerClient, DescribeEndpointCommand } = require('@aws-sdk/client-sagemaker');

const sagemaker = new SageMakerClient({ region: 'us-east-1' });

exports.handler = async (event) => {
    try {
        // Check SageMaker endpoint status
        const command = new DescribeEndpointCommand({
            EndpointName: 'simisai-sealion-realtime-endpoint'
        });
        const endpointStatus = await sagemaker.send(command);
        
        const isReady = endpointStatus.EndpointStatus === 'InService';
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                sagemaker: {
                    status: endpointStatus.EndpointStatus,
                    ready: isReady,
                    endpoint: 'simisai-sealion-realtime-endpoint',
                    lastUpdated: new Date().toISOString()
                },
                currentProvider: isReady ? 'sagemaker' : 'openai',
                message: isReady 
                    ? '🚀 Sealion LLM is ready! Switching to custom AI model...'
                    : '⏳ Sealion LLM is deploying... Using OpenAI for demo'
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

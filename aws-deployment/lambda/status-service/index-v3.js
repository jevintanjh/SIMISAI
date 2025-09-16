/**
 * Status Service - AWS SDK v3 Version
 * Monitor LLM Provider Status for SIMISAI
 * System Architect Deployment
 */

// Use AWS SDK v3 (built into Lambda runtime)
const { SageMakerClient, DescribeEndpointCommand } = require('@aws-sdk/client-sagemaker');

const sagemakerClient = new SageMakerClient({ region: 'us-east-1' });

exports.handler = async (event) => {
    try {
        console.log('Status check event:', JSON.stringify(event, null, 2));
        
        // Check SageMaker endpoint status
        const command = new DescribeEndpointCommand({
            EndpointName: 'simisai-sealion-realtime-endpoint'
        });
        
        const endpointStatus = await sagemakerClient.send(command);
        const isReady = endpointStatus.EndpointStatus === 'InService';
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
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
                    : '⏳ Sealion LLM is deploying... Using OpenAI for demo',
                timestamp: new Date().toISOString(),
                services: {
                    hybridLambda: 'simisai-hybrid-llm-service',
                    statusService: 'simisai-status-service',
                    sagemakerEndpoint: 'simisai-sealion-realtime-endpoint'
                }
            })
        };
        
    } catch (error) {
        console.error('Status check error:', error);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                sagemaker: {
                    status: 'Unknown',
                    ready: false,
                    error: error.message,
                    endpoint: 'simisai-sealion-realtime-endpoint'
                },
                currentProvider: 'openai',
                message: '⏳ Sealion LLM status unknown... Using OpenAI for demo',
                timestamp: new Date().toISOString(),
                services: {
                    hybridLambda: 'simisai-hybrid-llm-service',
                    statusService: 'simisai-status-service',
                    sagemakerEndpoint: 'simisai-sealion-realtime-endpoint'
                }
            })
        };
    }
};

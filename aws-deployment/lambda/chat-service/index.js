const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');

const sagemakerClient = new SageMakerRuntimeClient({ region: 'us-east-1' });

exports.handler = async (event) => {
    console.log('SIMISAI Chat Service - System Architect Deployment');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Parse the request body
        const body = JSON.parse(event.body || '{}');
        const { message, conversation_id } = body;
        
        if (!message) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                body: JSON.stringify({
                    error: 'Message is required'
                })
            };
        }
        
        // Prepare payload for SageMaker Sealion LLM
        const payload = {
            inputs: message,
            parameters: {
                max_new_tokens: 150,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true
            }
        };
        
        // Call SageMaker endpoint (will be configured later)
        const endpointName = process.env.SAGEMAKER_ENDPOINT_NAME || 'sealion-chat-endpoint';
        
        try {
            const command = new InvokeEndpointCommand({
                EndpointName: endpointName,
                ContentType: 'application/json',
                Body: JSON.stringify(payload)
            });
            
            const response = await sagemakerClient.send(command);
            const responseBody = JSON.parse(Buffer.from(response.Body).toString());
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                body: JSON.stringify({
                    response: responseBody.generated_text || responseBody.outputs || 'Response received',
                    conversation_id: conversation_id,
                    timestamp: new Date().toISOString(),
                    endpoint: endpointName
                })
            };
            
        } catch (sagemakerError) {
            console.error('SageMaker Error:', sagemakerError);
            
            // Fallback response if SageMaker is not ready
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                body: JSON.stringify({
                    response: `I received your message: "${message}". SageMaker endpoint is being set up. This is a fallback response from the System Architect deployment.`,
                    conversation_id: conversation_id,
                    timestamp: new Date().toISOString(),
                    status: 'fallback_response'
                })
            };
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};
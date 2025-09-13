const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');

const sagemakerClient = new SageMakerRuntimeClient({ region: 'us-east-1' });

exports.handler = async (event) => {
    console.log('SIMISAI Chat Service with SageMaker Integration');
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
        
        // Call SageMaker endpoint
        const endpointName = 'simisai-sealion-serverless-endpoint';
        
        try {
            console.log(`Calling SageMaker endpoint: ${endpointName}`);
            console.log(`Payload: ${JSON.stringify(payload)}`);
            
            const command = new InvokeEndpointCommand({
                EndpointName: endpointName,
                ContentType: 'application/json',
                Body: JSON.stringify(payload)
            });
            
            const response = await sagemakerClient.send(command);
            const responseBody = JSON.parse(Buffer.from(response.Body).toString());
            
            console.log('SageMaker response:', JSON.stringify(responseBody));
            
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
                    endpoint: endpointName,
                    model: 'Gemma-SEA-LION-v4-27B-IT-Q4_K_M',
                    source: 'sagemaker'
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
                    response: `I received your message: "${message}". SageMaker endpoint is being initialized. This is a fallback response from the System Architect deployment.`,
                    conversation_id: conversation_id,
                    timestamp: new Date().toISOString(),
                    status: 'fallback_response',
                    error: sagemakerError.message
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

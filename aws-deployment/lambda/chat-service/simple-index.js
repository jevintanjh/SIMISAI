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
        
        // Simulate AI response (will be replaced with SageMaker integration)
        const responses = [
            `I received your message: "${message}". This is a response from the SIMISAI Chat Service deployed by the System Architect.`,
            `Thank you for your message: "${message}". The chat service is working correctly.`,
            `Message received: "${message}". SageMaker integration will be added next.`,
            `Hello! I got your message: "${message}". The System Architect has successfully deployed this Lambda function.`
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                response: randomResponse,
                conversation_id: conversation_id,
                timestamp: new Date().toISOString(),
                status: 'lambda_deployed',
                service: 'simisai-chat-service'
            })
        };
        
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

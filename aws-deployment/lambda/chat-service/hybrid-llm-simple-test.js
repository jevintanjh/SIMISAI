/**
 * Simplified test version to debug timeout issues
 */

exports.handler = async (event) => {
    console.log('Lambda function started');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const body = JSON.parse(event.body);
        const { messages } = body;
        
        console.log('Parsed messages:', messages);
        
        // Extract the last user message
        const lastMessage = messages[messages.length - 1];
        const userInput = lastMessage.content;
        
        console.log('User input:', userInput);
        
        // Simple response without external API calls
        const response = `Hello! I received your message: "${userInput}". I'm SIMISAI, your medical device assistant. This is a test response to verify the Lambda function is working.`;
        
        const result = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: response,
                provider: {
                    provider: 'Test Mode',
                    status: 'Debug Version',
                    note: 'Simple test without external API calls'
                },
                requestCount: 1,
                sagemakerReady: false,
                debug: 'Simple test version working'
            })
        };
        
        console.log('Returning result:', JSON.stringify(result, null, 2));
        return result;
        
    } catch (error) {
        console.error('Error occurred:', error);
        console.error('Stack trace:', error.stack);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Test version error',
                message: error.message,
                debug: 'Simple test version error handling'
            })
        };
    }
};
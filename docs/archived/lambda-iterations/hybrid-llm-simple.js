/**
 * Hybrid LLM Service - Simplified Version for Debugging
 * Hackathon Demo: Mock responses for testing
 */

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { messages } = body;
        
        // Extract the last user message
        const lastMessage = messages[messages.length - 1];
        const userInput = lastMessage.content;
        
        // Mock response based on input
        let response;
        if (userInput.toLowerCase().includes('hello') || userInput.toLowerCase().includes('hi')) {
            response = "Hello! I'm SIMISAI, your AI-powered medical device assistant. How can I help you with your medical device today?";
        } else if (userInput.toLowerCase().includes('thermometer')) {
            response = "For digital thermometers, here's how to use them properly:\n\n1. Clean the thermometer with alcohol\n2. Place under tongue or in armpit\n3. Wait for the beep sound\n4. Read the temperature display\n\nNormal body temperature is 98.6°F (37°C). Contact a doctor if temperature is above 100.4°F (38°C).";
        } else if (userInput.toLowerCase().includes('blood pressure')) {
            response = "For blood pressure monitors:\n\n1. Sit comfortably with feet flat on floor\n2. Wrap cuff around upper arm\n3. Position cuff at heart level\n4. Press start button and remain still\n5. Wait for measurement to complete\n\nNormal BP is less than 120/80 mmHg. Consult your doctor for readings above 140/90 mmHg.";
        } else {
            response = `I understand you're asking about: "${userInput}". As your medical device assistant, I can help you with:\n\n• Digital thermometers\n• Blood pressure monitors\n• Blood glucose meters\n• Nebulizers\n• And other medical devices\n\nPlease ask me about a specific device for detailed instructions!`;
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: response,
                provider: {
                    provider: 'SIMISAI Mock LLM',
                    status: 'Demo Mode',
                    note: 'Simplified version for debugging - SageMaker integration pending'
                },
                requestCount: 1,
                sagemakerReady: false,
                debug: 'Simplified version - AWS SDK dependency removed'
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Chat service temporarily unavailable',
                message: error.message,
                debug: 'Simplified version error handling'
            })
        };
    }
};
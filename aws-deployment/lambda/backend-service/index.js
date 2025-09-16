/**
 * Backend Service Lambda Function
 * Provides API endpoints for devices, instructions, and chat
 */

const AWS = require('aws-sdk');

// Mock data for devices and instructions
const MOCK_DEVICES = [
    {
        id: 'thermometer-001',
        name: 'Digital Thermometer',
        type: 'thermometer',
        brand: 'Generic',
        model: 'DT-100',
        description: 'Digital thermometer for oral, rectal, and axillary temperature measurement'
    },
    {
        id: 'bp-monitor-001',
        name: 'Blood Pressure Monitor',
        type: 'blood_pressure',
        brand: 'Generic',
        model: 'BP-200',
        description: 'Automatic blood pressure monitor with digital display'
    },
    {
        id: 'glucose-meter-001',
        name: 'Glucose Meter',
        type: 'glucose',
        brand: 'Generic',
        model: 'GM-300',
        description: 'Blood glucose monitoring device'
    }
];

const MOCK_INSTRUCTIONS = {
    'thermometer-001': [
        {
            id: 1,
            stepNumber: 1,
            title: 'Prepare the Thermometer',
            description: 'Clean the thermometer with alcohol and ensure it\'s dry before use.',
            imageUrl: '/Demo 1.jpg',
            estimatedTime: '30 seconds'
        },
        {
            id: 2,
            stepNumber: 2,
            title: 'Position Correctly',
            description: 'Place the thermometer under your tongue or in your armpit. Keep your mouth closed.',
            imageUrl: '/Demo 2.jpg',
            estimatedTime: '1 minute'
        },
        {
            id: 3,
            stepNumber: 3,
            title: 'Wait for Reading',
            description: 'Hold the thermometer in place until you hear a beep sound indicating the reading is complete.',
            imageUrl: '/Demo 3.jpg',
            estimatedTime: '30 seconds'
        },
        {
            id: 4,
            stepNumber: 4,
            title: 'Read Temperature',
            description: 'Read the temperature display. Normal body temperature is 98.6°F (37°C).',
            imageUrl: '/Demo 4.jpg',
            estimatedTime: '10 seconds'
        }
    ],
    'bp-monitor-001': [
        {
            id: 1,
            stepNumber: 1,
            title: 'Prepare for Measurement',
            description: 'Sit comfortably with feet flat on the floor and rest for 5 minutes.',
            imageUrl: '/Demo 5.jpg',
            estimatedTime: '5 minutes'
        },
        {
            id: 2,
            stepNumber: 2,
            title: 'Apply Cuff',
            description: 'Wrap the cuff around your upper arm, 1 inch above the elbow.',
            imageUrl: '/Demo 6.jpg',
            estimatedTime: '1 minute'
        },
        {
            id: 3,
            stepNumber: 3,
            title: 'Start Measurement',
            description: 'Press the start button and remain still during the measurement.',
            imageUrl: '/Demo 7.jpg',
            estimatedTime: '1 minute'
        }
    ]
};

exports.handler = async (event) => {
    console.log('Backend service request:', JSON.stringify(event, null, 2));
    
    const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
    
    // Enable CORS
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
    
    // Handle preflight requests
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }
    
    try {
        // Route handling
        if (path === '/api/devices' && httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(MOCK_DEVICES)
            };
        }
        
        if (path.startsWith('/api/devices/') && httpMethod === 'GET') {
            const deviceId = pathParameters?.id;
            const device = MOCK_DEVICES.find(d => d.id === deviceId);
            
            if (!device) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Device not found' })
                };
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(device)
            };
        }
        
        if (path.startsWith('/api/devices/') && path.endsWith('/instructions') && httpMethod === 'GET') {
            const deviceId = pathParameters?.id;
            const instructions = MOCK_INSTRUCTIONS[deviceId] || [];
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(instructions)
            };
        }
        
        if (path.startsWith('/api/devices/') && path.includes('/instructions/') && httpMethod === 'GET') {
            const deviceId = pathParameters?.id;
            const stepNumber = parseInt(pathParameters?.step || '1');
            const instructions = MOCK_INSTRUCTIONS[deviceId] || [];
            const instruction = instructions.find(i => i.stepNumber === stepNumber);
            
            if (!instruction) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Instruction not found' })
                };
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(instruction)
            };
        }
        
        if (path.startsWith('/api/chat/') && httpMethod === 'GET') {
            const sessionId = pathParameters?.sessionId;
            
            // Return empty chat history for now
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify([])
            };
        }
        
        if (path === '/api/chat/ask' && httpMethod === 'POST') {
            const requestBody = JSON.parse(body || '{}');
            const { sessionId, question, language = 'en' } = requestBody;
            
            // For now, return a simple response
            // In production, this would call the SEA-LION API
            const response = {
                ok: true,
                message: {
                    id: Date.now(),
                    sessionId: sessionId || 'default',
                    message: `I received your question: "${question}". This is a mock response from the backend service.`,
                    isUser: false,
                    language: language,
                    timestamp: new Date().toISOString()
                }
            };
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(response)
            };
        }
        
        // Default response for unmatched routes
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Endpoint not found', path, method: httpMethod })
        };
        
    } catch (error) {
        console.error('Backend service error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};





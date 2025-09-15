/**
 * Hybrid Guidance Service - OpenAI → SageMaker Fallback
 * Fast, reliable guidance with intelligent fallback system
 */

const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');

const sagemakerClient = new SageMakerRuntimeClient({ region: 'us-east-1' });
const ENDPOINT_NAME = 'simisai-sealion-realtime-endpoint';

// OpenAI Configuration
const OPENAI_CONFIG = {
    apiKey: process.env.OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4',
    timeout: 10000 // 10 second timeout
};

// Device information mapping
const DEVICE_INFO = {
    'blood_pressure_monitor': {
        name: 'Blood Pressure Monitor',
        steps: [
            'Prepare the cuff and device',
            'Position the cuff correctly',
            'Start the measurement',
            'Wait for completion',
            'Read and record results'
        ]
    },
    'digital_oral_thermometer': {
        name: 'Digital Oral Thermometer',
        steps: [
            'Prepare the thermometer',
            'Turn on the device',
            'Position under tongue',
            'Wait for measurement',
            'Read and clean device'
        ]
    },
    'digital_ear_thermometer': {
        name: 'Digital Ear Thermometer',
        steps: [
            'Prepare the thermometer',
            'Turn on the device',
            'Position in ear canal',
            'Wait for measurement',
            'Read and clean device'
        ]
    }
};

// Language information mapping
const LANGUAGE_INFO = {
    'en': { name: 'English', code: 'en-US' },
    'id': { name: 'Indonesian', code: 'id-ID' },
    'ms': { name: 'Malay', code: 'ms-MY' },
    'th': { name: 'Thai', code: 'th-TH' },
    'vi': { name: 'Vietnamese', code: 'vi-VN' },
    'fil': { name: 'Filipino', code: 'fil-PH' },
    'my': { name: 'Burmese', code: 'my-MM' },
    'lo': { name: 'Lao', code: 'lo-LA' },
    'km': { name: 'Khmer', code: 'km-KH' },
    'zh': { name: 'Chinese', code: 'zh-CN' }
};

// Guidance style information
const STYLE_INFO = {
    'direct': {
        name: 'Direct Instructions',
        description: 'Clear, step-by-step commands for immediate action',
        characteristics: 'Use imperative mood, be concise and direct'
    },
    'gentle': {
        name: 'Gentle Suggestions',
        description: 'Soft, encouraging guidance with helpful tips',
        characteristics: 'Use encouraging tone, include helpful tips and reassurance'
    },
    'detailed': {
        name: 'Detailed Explanations',
        description: 'Comprehensive information with context and reasoning',
        characteristics: 'Include context, explain why each step is important, provide additional details'
    }
};

exports.handler = async (event) => {
    console.log('Hybrid Guidance Service Event:', JSON.stringify(event, null, 2));
    
    try {
        const { httpMethod, pathParameters, queryStringParameters } = event;
        
        if (httpMethod === 'GET') {
            return await handleGetGuidance(pathParameters, queryStringParameters);
        } else if (httpMethod === 'POST') {
            return await handleGenerateGuidance(JSON.parse(event.body));
        } else {
            return createResponse(405, { error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Error in Hybrid Guidance Service:', error);
        return createResponse(500, { 
            error: 'Internal server error',
            message: error.message 
        });
    }
};

/**
 * Handle GET request for guidance instructions with hybrid AI
 */
async function handleGetGuidance(pathParameters, queryStringParameters) {
    const { deviceType, stepNumber } = pathParameters || {};
    const { language = 'en', style = 'direct', brand, model } = queryStringParameters || {};
    
    if (!deviceType || !stepNumber) {
        return createResponse(400, { error: 'Missing required parameters: deviceType, stepNumber' });
    }
    
    // Validate parameters
    if (!DEVICE_INFO[deviceType]) {
        return createResponse(400, { error: `Invalid device type: ${deviceType}` });
    }
    
    if (!LANGUAGE_INFO[language]) {
        return createResponse(400, { error: `Invalid language: ${language}` });
    }
    
    if (!STYLE_INFO[style]) {
        return createResponse(400, { error: `Invalid guidance style: ${style}` });
    }
    
    const stepNum = parseInt(stepNumber);
    if (isNaN(stepNum) || stepNum < 1 || stepNum > 5) {
        return createResponse(400, { error: 'Step number must be between 1 and 5' });
    }
    
    try {
        // Try SEA-LION first, fallback to OpenAI
        const instruction = await generateGuidanceWithHybridAI({
            deviceType,
            stepNumber: stepNum,
            language,
            guidanceStyle: style,
            deviceBrand: brand,
            deviceModel: model
        });
        
        return createResponse(200, instruction);
        
    } catch (error) {
        console.error('Error generating guidance:', error);
        
        // Fallback to default instruction
        const fallbackInstruction = getDefaultInstruction(deviceType, stepNum, language);
        return createResponse(200, fallbackInstruction);
    }
}

/**
 * Generate guidance using SEA-LION as primary, OpenAI as fallback
 */
async function generateGuidanceWithHybridAI({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel }) {
    // Try SEA-LION first with timeout
    try {
        console.log('🦁 Attempting SEA-LION generation...');
        const sealionResult = await generateGuidanceWithSEALION({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel });
        return sealionResult;
    } catch (error) {
        console.log('⚠️ SEA-LION failed, falling back to OpenAI:', error.message);
        
        // Fallback to OpenAI
        try {
            console.log('🔄 Switching to OpenAI fallback...');
            const openaiResult = await generateGuidanceWithOpenAI({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel });
            return openaiResult;
        } catch (openaiError) {
            console.error('❌ Both SEA-LION and OpenAI failed:', openaiError.message);
            throw openaiError;
        }
    }
}

/**
 * Generate guidance using SEA-LION (primary method)
 */
async function generateGuidanceWithSEALION({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel }) {
    const deviceInfo = DEVICE_INFO[deviceType];
    const languageInfo = LANGUAGE_INFO[language];
    const styleInfo = STYLE_INFO[guidanceStyle];
    
    const prompt = `Generate a ${languageInfo.name} instruction for ${deviceInfo.name} (Step ${stepNumber}).

Device: ${deviceInfo.name}
Brand: ${deviceBrand || 'Generic'}
Model: ${deviceModel || 'Standard'}
Language: ${languageInfo.name} (${languageInfo.code})
Style: ${styleInfo.name} - ${styleInfo.description}

Requirements:
1. Title: Clear, concise step title in ${languageInfo.name}
2. Description: Detailed instruction in ${languageInfo.name} (${styleInfo.characteristics})
3. Checkpoints: 2-3 key checkpoints for this step

Format as JSON:
{
  "title": "Step title in ${languageInfo.name}",
  "description": "Detailed instruction in ${languageInfo.name}",
  "checkpoints": ["Checkpoint 1", "Checkpoint 2", "Checkpoint 3"]
}

Step ${stepNumber} for ${deviceInfo.name}:
${deviceInfo.steps[stepNumber - 1] || 'Complete the procedure'}`;

    const payload = {
        messages: [
            {
                role: "system",
                content: "You are a medical device guidance expert. Generate clear, step-by-step instructions for medical devices in the specified language and style. Always respond with valid JSON format."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9
    };

    const command = new InvokeEndpointCommand({
        EndpointName: ENDPOINT_NAME,
        ContentType: 'application/json',
        Body: JSON.stringify(payload)
    });

    const startTime = Date.now();
    
    // Set a timeout for SEA-LION (5 seconds)
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('SEA-LION timeout - switching to OpenAI')), 5000);
    });
    
    try {
        const response = await Promise.race([
            sagemakerClient.send(command),
            timeoutPromise
        ]);
        
        const generationTime = Date.now() - startTime;
        
        const result = JSON.parse(response.Body);
        const content = result.choices?.[0]?.message?.content || result.generated_text || 'Response generated successfully';
        
        // Parse response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                title: parsed.title,
                description: parsed.description,
                checkpoints: parsed.checkpoints || [],
                language: language,
                isAIGenerated: true,
                provider: 'SEA-LION 27B',
                generationTimestamp: new Date().toISOString(),
                generationTimeMs: generationTime,
                tokensUsed: result.usage?.total_tokens || 0
            };
        }
        
        // Fallback parsing
        return {
            title: 'Step Instruction',
            description: content,
            checkpoints: ['Complete the step'],
            language: language,
            isAIGenerated: true,
            provider: 'SEA-LION 27B',
            generationTimestamp: new Date().toISOString(),
            generationTimeMs: generationTime,
            tokensUsed: result.usage?.total_tokens || 0
        };
        
    } catch (error) {
        console.error('SEA-LION generation failed:', error);
        throw error;
    }
}

/**
 * Generate guidance using OpenAI (fallback method)
 */
async function generateGuidanceWithOpenAI({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel }) {
    const deviceInfo = DEVICE_INFO[deviceType];
    const languageInfo = LANGUAGE_INFO[language];
    const styleInfo = STYLE_INFO[guidanceStyle];
    
    const prompt = `Generate a ${languageInfo.name} instruction for ${deviceInfo.name} (Step ${stepNumber}).

Device: ${deviceInfo.name}
Brand: ${deviceBrand || 'Generic'}
Model: ${deviceModel || 'Standard'}
Language: ${languageInfo.name} (${languageInfo.code})
Style: ${styleInfo.name} - ${styleInfo.description}

Requirements:
1. Title: Clear, concise step title in ${languageInfo.name}
2. Description: Detailed instruction in ${languageInfo.name} (${styleInfo.characteristics})
3. Checkpoints: 2-3 key checkpoints for this step

Format as JSON:
{
  "title": "Step title in ${languageInfo.name}",
  "description": "Detailed instruction in ${languageInfo.name}",
  "checkpoints": ["Checkpoint 1", "Checkpoint 2", "Checkpoint 3"]
}

Step ${stepNumber} for ${deviceInfo.name}:
${deviceInfo.steps[stepNumber - 1] || 'Complete the procedure'}`;

    const startTime = Date.now();
    
    try {
        const response = await fetch(OPENAI_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: OPENAI_CONFIG.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a medical device guidance expert. Generate clear, step-by-step instructions for medical devices in the specified language and style. Always respond with valid JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            }),
            signal: AbortSignal.timeout(OPENAI_CONFIG.timeout)
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        const generationTime = Date.now() - startTime;
        
        // Parse OpenAI response
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                title: parsed.title,
                description: parsed.description,
                checkpoints: parsed.checkpoints || [],
                language: language,
                isAIGenerated: true,
                provider: 'OpenAI GPT-4',
                generationTimestamp: new Date().toISOString(),
                generationTimeMs: generationTime,
                tokensUsed: data.usage?.total_tokens || 0
            };
        }
        
        // Fallback parsing
        return {
            title: 'Step Instruction',
            description: content,
            checkpoints: ['Complete the step'],
            language: language,
            isAIGenerated: true,
            provider: 'OpenAI GPT-4',
            generationTimestamp: new Date().toISOString(),
            generationTimeMs: generationTime,
            tokensUsed: data.usage?.total_tokens || 0
        };
        
    } catch (error) {
        console.error('OpenAI generation failed:', error);
        throw error;
    }
}

/**
 * Get default instruction (fallback)
 */
function getDefaultInstruction(deviceType, stepNumber, language) {
    const deviceInfo = DEVICE_INFO[deviceType];
    const languageInfo = LANGUAGE_INFO[language];
    
    const defaultInstructions = {
        'blood_pressure_monitor': {
            1: { title: 'Prepare the cuff', description: 'Remove the blood pressure cuff from its case and ensure it is clean and properly inflated.' },
            2: { title: 'Position the cuff', description: 'Wrap the cuff around your upper arm, about 1 inch above your elbow.' },
            3: { title: 'Start measurement', description: 'Press the start button and remain still during the measurement.' },
            4: { title: 'Wait for completion', description: 'Keep the cuff in place until you hear a beep or see the measurement complete.' },
            5: { title: 'Read results', description: 'Read the blood pressure values from the display and record them.' }
        },
        'digital_oral_thermometer': {
            1: { title: 'Prepare thermometer', description: 'Remove the thermometer from its case and ensure it is clean and dry.' },
            2: { title: 'Turn on device', description: 'Press the power button to turn on the thermometer and wait for the ready indicator.' },
            3: { title: 'Position under tongue', description: 'Place the thermometer tip under your tongue and close your mouth gently.' },
            4: { title: 'Wait for measurement', description: 'Keep the thermometer in place until you hear a beep or see the temperature reading.' },
            5: { title: 'Read and clean', description: 'Read the temperature from the display and clean the thermometer before storing.' }
        },
        'digital_ear_thermometer': {
            1: { title: 'Prepare thermometer', description: 'Remove the thermometer from its case and ensure it is clean and dry.' },
            2: { title: 'Turn on device', description: 'Press the power button to turn on the thermometer and wait for the ready indicator.' },
            3: { title: 'Position in ear', description: 'Gently insert the thermometer tip into the ear canal until it fits snugly.' },
            4: { title: 'Wait for measurement', description: 'Keep the thermometer in place until you hear a beep or see the temperature reading.' },
            5: { title: 'Read and clean', description: 'Read the temperature from the display and clean the thermometer before storing.' }
        }
    };
    
    const instruction = defaultInstructions[deviceType]?.[stepNumber] || {
        title: 'Step Instruction',
        description: 'Please follow the device instructions carefully.'
    };
    
    return {
        title: instruction.title,
        description: instruction.description,
        checkpoints: ['Complete the step'],
        language: language,
        isAIGenerated: false,
        isDefault: true,
        provider: 'Default Instructions',
        generationTimestamp: new Date().toISOString()
    };
}

/**
 * Handle POST request for custom guidance generation
 */
async function handleGenerateGuidance(requestBody) {
    const { deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel } = requestBody;
    
    if (!deviceType || !stepNumber || !language || !guidanceStyle) {
        return createResponse(400, { error: 'Missing required fields' });
    }
    
    try {
        const instruction = await generateGuidanceWithHybridAI({
            deviceType,
            stepNumber,
            language,
            guidanceStyle,
            deviceBrand,
            deviceModel
        });
        
        return createResponse(200, instruction);
        
    } catch (error) {
        console.error('Error generating custom guidance:', error);
        return createResponse(500, { 
            error: 'Failed to generate guidance',
            message: error.message 
        });
    }
}

/**
 * Create HTTP response
 */
function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify(body)
    };
}

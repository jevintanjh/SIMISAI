/**
 * AI-Generated Guidance Service Lambda Function
 * Uses SEA-LION LLM to generate personalized guidance instructions
 */

const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');

const sagemakerClient = new SageMakerRuntimeClient({ region: 'us-east-1' });
const ENDPOINT_NAME = 'simisai-sealion-realtime-endpoint';

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
    console.log('AI Guidance Service Event:', JSON.stringify(event, null, 2));
    
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
        console.error('Error in AI Guidance Service:', error);
        return createResponse(500, { 
            error: 'Internal server error',
            message: error.message 
        });
    }
};

/**
 * Handle GET request for guidance instructions
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
        // Generate AI instruction
        const instruction = await generateGuidanceInstruction({
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
 * Handle POST request for custom guidance generation
 */
async function handleGenerateGuidance(requestBody) {
    const { deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel } = requestBody;
    
    if (!deviceType || !stepNumber || !language || !guidanceStyle) {
        return createResponse(400, { error: 'Missing required fields' });
    }
    
    try {
        const instruction = await generateGuidanceInstruction({
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
 * Generate guidance instruction using AI provider hierarchy: SEA-LION → OpenAI → AI Singapore → Default
 */
async function generateGuidanceInstruction({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel }) {
    const prompt = buildPrompt({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel });
    
    const messages = [
        {
            role: "system",
            content: "You are a medical device guidance expert. Generate clear, step-by-step instructions for medical devices in the specified language and style. Always respond with valid JSON format."
        },
        {
            role: "user",
            content: prompt
        }
    ];

    const startTime = Date.now();
    let instruction;
    let provider = 'unknown';
    
    try {
        // 1. Try SEA-LION SageMaker endpoint first
        console.log('Trying SEA-LION SageMaker endpoint...');
        
        // Create prompt for SEA-LION (correct format)
        const prompt = buildSEALIONPrompt({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel });
        
        const payload = JSON.stringify({
            prompt: prompt,
            max_tokens: 500,
            temperature: 0.7
        });

        const command = new InvokeEndpointCommand({
            EndpointName: ENDPOINT_NAME,
            ContentType: 'application/json',
            Body: payload
        });

        const response = await sagemakerClient.send(command);
        const result = JSON.parse(response.Body);
        instruction = parseSEALIONResponse(result, language, Date.now() - startTime);
        provider = 'SEA-LION SageMaker';
        
    } catch (sagemakerError) {
        console.log('SEA-LION endpoint failed, trying OpenAI fallback:', sagemakerError.message);
        
        try {
            // 2. Try OpenAI as fallback
            console.log('Trying OpenAI fallback...');
            const openaiResponse = await callOpenAI(messages);
            instruction = parseOpenAIResponse(openaiResponse, language, Date.now() - startTime);
            provider = 'OpenAI GPT-4 (Fallback)';
            
        } catch (openaiError) {
            console.log('OpenAI fallback failed, trying AI Singapore API:', openaiError.message);
            
            try {
                // 3. Try AI Singapore SEA-LION API as final fallback
                console.log('Trying AI Singapore SEA-LION API...');
                const aiSingaporeResponse = await callAISingaporeSealion(messages);
                instruction = parseAISingaporeResponse(aiSingaporeResponse, language, Date.now() - startTime);
                provider = 'AI Singapore SEA-LION API';
                
            } catch (aiSingaporeError) {
                console.log('AI Singapore API failed, using default instruction:', aiSingaporeError.message);
                
                // 4. Final fallback to default instruction
                instruction = getDefaultInstruction(deviceType, stepNumber, language);
                instruction.isDefault = true;
                instruction.provider = 'Default Instruction';
                provider = 'Default Instruction';
            }
        }
    }
    
    // Log generation metrics
    await logGeneration({
        deviceType,
        stepNumber,
        language,
        guidanceStyle,
        status: 'success',
        generationTime: Date.now() - startTime,
        tokensUsed: instruction.tokensUsed || 0,
        provider: provider
    });
    
    return instruction;
}

/**
 * Build prompt for SEA-LION based on device and preferences
 */
function buildPrompt({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel }) {
    const deviceInfo = DEVICE_INFO[deviceType];
    const languageInfo = LANGUAGE_INFO[language];
    const styleInfo = STYLE_INFO[guidanceStyle];

    return `
Generate a ${languageInfo.name} instruction for ${deviceInfo.name} (Step ${stepNumber}).

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
${deviceInfo.steps[stepNumber - 1] || 'Complete the procedure'}
`;
}

/**
 * Build prompt for SEA-LION endpoint (correct format)
 */
function buildSEALIONPrompt({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel }) {
    const deviceInfo = DEVICE_INFO[deviceType];
    const languageInfo = LANGUAGE_INFO[language];
    const styleInfo = STYLE_INFO[guidanceStyle];

    return `You are SIMISAI, an AI medical device assistant. Generate a ${languageInfo.name} instruction for ${deviceInfo.name} (Step ${stepNumber}).

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

Step ${stepNumber} for ${deviceInfo.name}: ${deviceInfo.steps[stepNumber - 1] || 'Complete the procedure'}`;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(messages) {
    const { Configuration, OpenAIApi } = require('openai');
    
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    });
    
    const openai = new OpenAIApi(configuration);
    
    const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9
    });
    
    return response.data;
}

/**
 * Call AI Singapore SEA-LION API
 */
async function callAISingaporeSealion(messages) {
    const https = require('https');
    
    const apiKey = process.env.AI_SINGAPORE_API_KEY;
    if (!apiKey) {
        throw new Error('AI Singapore API key not configured');
    }
    
    const payload = JSON.stringify({
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9
    });
    
    const options = {
        hostname: 'api.aisingapore.org',
        port: 443,
        path: '/sealion/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Content-Length': Buffer.byteLength(payload)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (error) {
                    reject(new Error('Failed to parse AI Singapore response'));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(payload);
        req.end();
    });
}

/**
 * Parse SEA-LION response
 */
function parseSEALIONResponse(response, language, generationTime) {
    try {
        let content;
        
        // Handle different response formats from SEA-LION endpoint
        if (response.choices && response.choices[0] && response.choices[0].message) {
            content = response.choices[0].message.content;
        } else if (response.generated_text) {
            content = response.generated_text;
        } else if (response.text) {
            content = response.text;
        } else if (typeof response === 'string') {
            content = response;
        } else {
            console.log('Unexpected SEA-LION response format:', response);
            throw new Error('Unexpected response format from SEA-LION');
        }
        
        console.log('SEA-LION response content:', content);
        
        // Try to parse JSON from the content
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                title: parsed.title,
                description: parsed.description,
                checkpoints: parsed.checkpoints || [],
                language: language,
                isAIGenerated: true,
                generationTimestamp: new Date().toISOString(),
                generationTimeMs: generationTime,
                tokensUsed: response.usage?.total_tokens || 0,
                provider: 'SEA-LION SageMaker'
            };
        }
        
        // Fallback parsing - use the raw content
        return {
            title: 'Step Instruction',
            description: content,
            checkpoints: ['Complete the step'],
            language: language,
            isAIGenerated: true,
            generationTimestamp: new Date().toISOString(),
            generationTimeMs: generationTime,
            tokensUsed: response.usage?.total_tokens || 0,
            provider: 'SEA-LION SageMaker'
        };
        
    } catch (error) {
        console.error('Error parsing SEA-LION response:', error);
        throw new Error('Failed to parse SEA-LION response');
    }
}

/**
 * Parse OpenAI response
 */
function parseOpenAIResponse(response, language, generationTime) {
    try {
        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                title: parsed.title,
                description: parsed.description,
                checkpoints: parsed.checkpoints || [],
                language: language,
                isAIGenerated: true,
                generationTimestamp: new Date().toISOString(),
                generationTimeMs: generationTime,
                tokensUsed: response.usage?.total_tokens || 0,
                provider: 'OpenAI GPT-4'
            };
        }
        
        // Fallback parsing
        return {
            title: 'Step Instruction',
            description: content,
            checkpoints: ['Complete the step'],
            language: language,
            isAIGenerated: true,
            generationTimestamp: new Date().toISOString(),
            generationTimeMs: generationTime,
            tokensUsed: response.usage?.total_tokens || 0,
            provider: 'OpenAI GPT-4'
        };
        
    } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        throw new Error('Failed to parse OpenAI response');
    }
}

/**
 * Parse AI Singapore response
 */
function parseAISingaporeResponse(response, language, generationTime) {
    try {
        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                title: parsed.title,
                description: parsed.description,
                checkpoints: parsed.checkpoints || [],
                language: language,
                isAIGenerated: true,
                generationTimestamp: new Date().toISOString(),
                generationTimeMs: generationTime,
                tokensUsed: response.usage?.total_tokens || 0,
                provider: 'AI Singapore SEA-LION'
            };
        }
        
        // Fallback parsing
        return {
            title: 'Step Instruction',
            description: content,
            checkpoints: ['Complete the step'],
            language: language,
            isAIGenerated: true,
            generationTimestamp: new Date().toISOString(),
            generationTimeMs: generationTime,
            tokensUsed: response.usage?.total_tokens || 0,
            provider: 'AI Singapore SEA-LION'
        };
        
    } catch (error) {
        console.error('Error parsing AI Singapore response:', error);
        throw new Error('Failed to parse AI Singapore response');
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
        generationTimestamp: new Date().toISOString()
    };
}

/**
 * Log generation metrics
 */
async function logGeneration({ deviceType, stepNumber, language, guidanceStyle, status, generationTime, tokensUsed, provider }) {
    // TODO: Implement database logging
    console.log(`Generated instruction for ${deviceType} step ${stepNumber} in ${language} using ${provider} (${status}) - ${generationTime}ms, ${tokensUsed} tokens`);
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



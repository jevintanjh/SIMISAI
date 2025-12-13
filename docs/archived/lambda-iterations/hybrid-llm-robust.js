/**
 * Hybrid LLM Service - Robust Production Version
 * Features: Fast OpenAI fallback when SageMaker is slow/unavailable
 * Includes proper timeout handling and error recovery
 */

const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');
const https = require('https');

// Initialize AWS SDK v3 client with shorter timeout
const sagemakerClient = new SageMakerRuntimeClient({ 
    region: 'us-east-1',
    requestHandler: {
        requestTimeout: 25000, // 25 second timeout for SageMaker
        connectionTimeout: 5000 // 5 second connection timeout
    }
});

exports.handler = async (event) => {
    console.log('Lambda function started');
    
    try {
        const body = JSON.parse(event.body);
        const { messages } = body;
        
        // Extract the last user message
        const lastMessage = messages[messages.length - 1];
        const userInput = lastMessage.content;
        
        console.log('Processing input:', userInput);
        
        // Detect language
        const language = detectLanguageImproved(userInput);
        console.log('Detected language:', language);
        
        // Try services in priority order with fast fallback
        let response;
        let providerInfo;
        let sagemakerSuccess = false;
        
        // Priority 1: Try SageMaker with timeout protection
        try {
            console.log('Attempting SageMaker...');
            const sagemakerResponse = await Promise.race([
                callSageMakerEndpoint(userInput, language),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('SageMaker timeout')), 20000)
                )
            ]);
            
            response = sagemakerResponse;
            providerInfo = {
                provider: 'SEA-LION LLM (27B)',
                status: 'Production Mode',
                note: 'SEA-LION endpoint responding successfully',
                detectedLanguage: language
            };
            sagemakerSuccess = true;
            console.log('SageMaker success');
            
        } catch (sagemakerError) {
            console.log('SageMaker failed:', sagemakerError.message);
            
            // Priority 2: Try OpenAI fallback
            if (process.env.OPENAI_API_KEY) {
                try {
                    console.log('Attempting OpenAI fallback...');
                    const openaiResponse = await Promise.race([
                        callOpenAI(userInput, language),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('OpenAI timeout')), 15000)
                        )
                    ]);
                    
                    response = openaiResponse;
                    providerInfo = {
                        provider: 'OpenAI GPT-4',
                        status: 'Fallback Mode',
                        note: 'Using OpenAI as SageMaker backup',
                        detectedLanguage: language
                    };
                    console.log('OpenAI fallback success');
                    
                } catch (openaiError) {
                    console.log('OpenAI fallback failed:', openaiError.message);
                    throw new Error('Both SageMaker and OpenAI failed');
                }
            } else {
                throw new Error('SageMaker failed and no OpenAI key');
            }
        }
        
        // If both AI services failed, use enhanced local responses
        if (!response) {
            console.log('Using local fallback responses');
            response = generateImprovedResponse(userInput, language);
            providerInfo = {
                provider: 'SIMISAI Enhanced Local',
                status: 'Local Fallback',
                note: 'All AI services unavailable - using enhanced local responses',
                detectedLanguage: language
            };
        }
        
        console.log('Returning response from:', providerInfo.provider);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                response: response,
                provider: providerInfo,
                requestCount: 1,
                sagemakerReady: sagemakerSuccess,
                debug: 'Robust production version with fast fallbacks'
            })
        };
        
    } catch (error) {
        console.error('Critical error:', error);
        
        // Final emergency fallback
        const emergencyResponse = "Hello! I'm SIMISAI, your medical device assistant. I'm currently experiencing technical difficulties, but I'm here to help. Please ask me about specific medical devices like thermometers, blood pressure monitors, or glucose meters.";
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: emergencyResponse,
                provider: {
                    provider: 'Emergency Fallback',
                    status: 'Basic Service',
                    note: 'All advanced AI services temporarily unavailable'
                },
                requestCount: 1,
                sagemakerReady: false,
                debug: error.message
            })
        };
    }
};

/**
 * Call SEA-LION SageMaker endpoint with optimized settings
 */
async function callSageMakerEndpoint(userInput, language) {
    try {
        const prompt = createSeaLionPrompt(userInput, language);
        
        const command = new InvokeEndpointCommand({
            EndpointName: 'simisai-sealion-realtime-endpoint',
            ContentType: 'application/json',
            Body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 300, // Reduced for faster response
                    temperature: 0.7,
                    top_p: 0.9,
                    do_sample: true
                }
            })
        });
        
        const result = await sagemakerClient.send(command);
        const response = JSON.parse(new TextDecoder().decode(result.Body));
        
        // Extract response text from various possible formats
        let generatedText = response.generated_text || response[0]?.generated_text || response.text || response.output;
        
        // Clean up the response (remove prompt if included)
        if (generatedText && generatedText.includes(prompt)) {
            generatedText = generatedText.replace(prompt, '').trim();
        }
        
        return generatedText || 'SEA-LION is ready to assist with your medical device questions.';
        
    } catch (error) {
        console.error('SageMaker endpoint error:', error);
        throw new Error(`SageMaker failed: ${error.message}`);
    }
}

/**
 * Call OpenAI API as fallback with timeout protection
 */
async function callOpenAI(userInput, language) {
    return new Promise((resolve, reject) => {
        const prompt = createOpenAIPrompt(userInput, language);
        
        const payload = JSON.stringify({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are SIMISAI, a helpful AI medical device assistant. Provide clear, safe, and accurate guidance for medical device usage. Keep responses concise and practical."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 300, // Reduced for faster response
            temperature: 0.7
        });
        
        const options = {
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 10000 // 10 second timeout
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    const content = response.choices?.[0]?.message?.content;
                    
                    if (content) {
                        resolve(content);
                    } else {
                        reject(new Error('Invalid OpenAI response format'));
                    }
                } catch (parseError) {
                    reject(new Error('Failed to parse OpenAI response'));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(new Error(`OpenAI request failed: ${error.message}`));
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('OpenAI request timed out'));
        });
        
        req.write(payload);
        req.end();
    });
}

/**
 * Create language-specific prompt for SEA-LION
 */
function createSeaLionPrompt(userInput, language) {
    const prompts = {
        'English': `You are SIMISAI, an AI medical device assistant. Help with: "${userInput}"\n\nProvide clear, step-by-step instructions:`,
        'Mandarin': `你是SIMISAI医疗设备助手。帮助解决："${userInput}"\n\n请提供清晰的逐步指导：`,
        'Indonesian': `Anda adalah SIMISAI, asisten perangkat medis. Bantu dengan: "${userInput}"\n\nBerikan instruksi langkah demi langkah:`,
        'Thai': `คุณคือ SIMISAI ผู้ช่วยอุปกรณ์การแพทย์ ช่วยเกี่ยวกับ: "${userInput}"\n\nให้คำแนะนำทีละขั้นตอน:`,
        'Vietnamese': `Bạn là SIMISAI, trợ lý thiết bị y tế. Giúp về: "${userInput}"\n\nCung cấp hướng dẫn từng bước:`
    };
    
    return prompts[language] || prompts['English'];
}

/**
 * Create language-specific prompt for OpenAI
 */
function createOpenAIPrompt(userInput, language) {
    return `As SIMISAI medical device assistant, help with: "${userInput}". Provide safe, step-by-step guidance in ${language}.`;
}

/**
 * Language detection with improved algorithm
 */
function detectLanguageImproved(text) {
    if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(text)) return 'Mandarin';
    if (/[\u0e00-\u0e7f]/.test(text)) return 'Thai';
    if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) return 'Vietnamese';
    if (/\b(halo|saya|bantuan|termometer|tekanan|darah)\b/i.test(text)) return 'Indonesian';
    if (/\b(kumusta|ako|tulong|termometro|presyon)\b/i.test(text)) return 'Tagalog';
    if (/[\u0b80-\u0bff]/.test(text)) return 'Tamil';
    if (/[\u1780-\u17ff]/.test(text)) return 'Khmer';
    if (/[\u0e80-\u0eff]/.test(text)) return 'Lao';
    if (/[\u1000-\u109f]/.test(text)) return 'Burmese';
    
    return 'English';
}

/**
 * Generate improved multilingual responses (final fallback)
 */
function generateImprovedResponse(input, language) {
    const responses = {
        'English': {
            greeting: "Hello! I'm SIMISAI, your AI medical device assistant. How can I help with your medical device today?",
            thermometer: "Digital Thermometer Instructions:\n\n1. Clean with alcohol\n2. Place under tongue\n3. Wait for beep\n4. Read temperature\n\nNormal: 98.6°F (37°C). See doctor if over 100.4°F (38°C).",
            bloodPressure: "Blood Pressure Monitor Steps:\n\n1. Sit comfortably\n2. Wrap cuff on upper arm\n3. Position at heart level\n4. Press start, stay still\n5. Read results\n\nNormal: <120/80 mmHg. Consult doctor if >140/90 mmHg.",
            general: "I can help with:\n• Thermometers\n• Blood pressure monitors\n• Glucose meters\n• Nebulizers\n\nWhat device do you need help with?"
        },
        'Mandarin': {
            greeting: "你好！我是SIMISAI，AI医疗设备助手。需要什么医疗设备帮助？",
            thermometer: "数字体温计使用：\n\n1. 酒精消毒\n2. 舌下放置\n3. 等待蜂鸣\n4. 读取显示\n\n正常：37°C。超过38°C请就医。",
            bloodPressure: "血压计使用：\n\n1. 舒适坐姿\n2. 上臂缠袖带\n3. 心脏水平\n4. 按开始保持静止\n5. 读取结果\n\n正常：<120/80。>140/90请咨询医生。",
            general: "我可以帮助：\n• 体温计\n• 血压计\n• 血糖仪\n• 雾化器\n\n需要哪种设备帮助？"
        }
    };
    
    const langResponses = responses[language] || responses['English'];
    const inputLower = input.toLowerCase();
    
    if (/thermo|temp|fever|热|体温/i.test(inputLower)) return langResponses.thermometer;
    if (/blood.*pressure|bp|血压|tekanan/i.test(inputLower)) return langResponses.bloodPressure;
    if (/hello|hi|你好|halo|สวัสดี/i.test(inputLower)) return langResponses.greeting;
    
    return langResponses.general;
}
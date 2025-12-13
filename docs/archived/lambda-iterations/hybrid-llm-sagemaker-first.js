/**
 * Hybrid LLM Service - SageMaker SEA-LION First Priority
 * Optimized to showcase SEA-LION as primary AI with fast OpenAI fallback
 * Priority: SageMaker SEA-LION → OpenAI GPT-4 → Enhanced Local
 */

const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');
const https = require('https');

// Initialize AWS SDK v3 client with optimized settings for fast SageMaker
const sagemakerClient = new SageMakerRuntimeClient({ 
    region: 'us-east-1',
    requestHandler: {
        requestTimeout: 20000, // 20 second timeout for SageMaker (generous but reasonable)
        connectionTimeout: 3000 // Fast connection timeout
    }
});

exports.handler = async (event) => {
    const startTime = Date.now();
    console.log('Lambda started - SageMaker SEA-LION priority mode');
    
    try {
        const body = JSON.parse(event.body);
        const { messages } = body;
        
        // Extract the last user message
        const lastMessage = messages[messages.length - 1];
        const userInput = lastMessage.content;
        
        console.log('Processing input:', userInput);
        
        // Detect language for optimized prompts
        const language = detectLanguageImproved(userInput);
        console.log('Detected language:', language);
        
        let response;
        let providerInfo;
        let sagemakerSuccess = false;
        
        // **PRIORITY 1: SEA-LION SageMaker (Primary for demo)**
        try {
            console.log('🚀 Attempting SEA-LION SageMaker first...');
            
            // Fast SageMaker attempt with timeout protection
            const sagemakerResponse = await Promise.race([
                callSageMakerEndpointOptimized(userInput, language),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('SageMaker taking too long')), 18000) // 18 second timeout
                )
            ]);
            
            response = sagemakerResponse;
            providerInfo = {
                provider: 'SEA-LION LLM (27B)',
                status: 'Primary AI Service',
                note: '🌏 ASEAN-specialized AI model - Custom trained for Southeast Asian medical guidance',
                detectedLanguage: language,
                responseTime: `${Date.now() - startTime}ms`,
                model: 'SEA-LION 27B Parameters',
                region: 'ASEAN Optimized'
            };
            sagemakerSuccess = true;
            console.log('✅ SEA-LION success in', Date.now() - startTime, 'ms');
            
        } catch (sagemakerError) {
            console.log('⚠️ SEA-LION unavailable:', sagemakerError.message);
            
            // **PRIORITY 2: OpenAI GPT-4 (Fast fallback)**
            if (process.env.OPENAI_API_KEY) {
                try {
                    console.log('🔄 Falling back to OpenAI GPT-4...');
                    const openaiResponse = await Promise.race([
                        callOpenAIOptimized(userInput, language),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('OpenAI timeout')), 10000) // 10 second OpenAI timeout
                        )
                    ]);
                    
                    response = openaiResponse;
                    providerInfo = {
                        provider: 'OpenAI GPT-4',
                        status: 'Backup AI Service',
                        note: '🔄 SEA-LION temporarily loading - using OpenAI for fast response',
                        detectedLanguage: language,
                        responseTime: `${Date.now() - startTime}ms`,
                        fallbackReason: 'SageMaker endpoint warming up or high demand'
                    };
                    console.log('✅ OpenAI fallback success in', Date.now() - startTime, 'ms');
                    
                } catch (openaiError) {
                    console.log('⚠️ OpenAI also failed:', openaiError.message);
                    throw new Error('Both AI services unavailable');
                }
            } else {
                throw new Error('No OpenAI fallback configured');
            }
        }
        
        // **PRIORITY 3: Enhanced local responses (emergency fallback)**
        if (!response) {
            console.log('🛟 Using enhanced local fallback...');
            response = generateImprovedResponse(userInput, language);
            providerInfo = {
                provider: 'SIMISAI Enhanced Local',
                status: 'Emergency Fallback',
                note: '🛟 All AI services temporarily unavailable - using enhanced medical device database',
                detectedLanguage: language,
                responseTime: `${Date.now() - startTime}ms`
            };
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`✅ Response ready from ${providerInfo.provider} in ${totalTime}ms`);
        
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
                debug: `SageMaker-first architecture - ${totalTime}ms total time`,
                architecture: 'SEA-LION (Primary) → OpenAI (Fallback) → Local (Emergency)'
            })
        };
        
    } catch (error) {
        console.error('💥 Critical error:', error);
        
        // Ultra-fast emergency response
        const emergencyResponse = generateEmergencyResponse();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: emergencyResponse,
                provider: {
                    provider: 'Emergency Response System',
                    status: 'System Recovery',
                    note: '🚨 All AI services experiencing issues - providing basic medical device guidance',
                    responseTime: `${Date.now() - startTime}ms`
                },
                requestCount: 1,
                sagemakerReady: false,
                debug: `Emergency mode: ${error.message}`,
                architecture: 'Emergency fallback active'
            })
        };
    }
};

/**
 * Optimized SageMaker call for SEA-LION with better prompts
 */
async function callSageMakerEndpointOptimized(userInput, language) {
    try {
        const prompt = createSeaLionOptimizedPrompt(userInput, language);
        
        console.log('📡 Calling SEA-LION with optimized prompt...');
        
        const command = new InvokeEndpointCommand({
            EndpointName: 'simisai-sealion-realtime-endpoint',
            ContentType: 'application/json',
            Body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 300, // Balanced for quality and speed
                    temperature: 0.7,
                    top_p: 0.9,
                    do_sample: true,
                    repetition_penalty: 1.1 // Prevent repetition
                }
            })
        });
        
        const result = await sagemakerClient.send(command);
        const response = JSON.parse(new TextDecoder().decode(result.Body));
        
        // Extract and clean response
        let generatedText = response.generated_text || response[0]?.generated_text || response.text || response.output;
        
        // Clean up the response (remove prompt if included)
        if (generatedText && generatedText.includes(prompt)) {
            generatedText = generatedText.replace(prompt, '').trim();
        }
        
        // Ensure we have a good response
        if (!generatedText || generatedText.length < 10) {
            throw new Error('SEA-LION returned insufficient response');
        }
        
        console.log('🎯 SEA-LION response length:', generatedText.length);
        return generatedText;
        
    } catch (error) {
        console.error('❌ SageMaker endpoint error:', error);
        throw new Error(`SEA-LION endpoint failed: ${error.message}`);
    }
}

/**
 * Fast OpenAI fallback with medical focus
 */
async function callOpenAIOptimized(userInput, language) {
    return new Promise((resolve, reject) => {
        const prompt = createOpenAIOptimizedPrompt(userInput, language);
        
        const payload = JSON.stringify({
            model: "gpt-4o-mini", // Fast model for quick fallback
            messages: [
                {
                    role: "system",
                    content: "You are SIMISAI, a medical device assistant. Provide clear, safe instructions for medical device usage. Be concise but comprehensive."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 250, // Optimized for speed
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
            timeout: 8000 // Fast timeout for fallback
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
            reject(error);
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
 * Create optimized prompts for SEA-LION (ASEAN-focused)
 */
function createSeaLionOptimizedPrompt(userInput, language) {
    const prompts = {
        'English': `You are SIMISAI, an AI medical device assistant specialized in Southeast Asian healthcare. A user asks: "${userInput}"

Please provide clear, step-by-step instructions for using medical devices safely. Focus on practical guidance that's easy to follow.

Response:`,
        'Chinese': `你是SIMISAI，专门服务于东南亚医疗保健的AI助手。用户询问："${userInput}"

请提供清晰的逐步医疗设备使用指导，注重安全和实用性。

回复：`,
        'Indonesian': `Anda adalah SIMISAI, asisten AI perangkat medis yang mengkhususkan diri dalam layanan kesehatan Asia Tenggara. Pengguna bertanya: "${userInput}"

Berikan instruksi langkah demi langkah yang jelas untuk menggunakan perangkat medis dengan aman.

Jawaban:`,
        'Thai': `คุณคือ SIMISAI ผู้ช่วย AI อุปกรณ์ทางการแพทย์ที่เชี่ยวชาญในการดูแลสุขภาพเอเชียตะวันออกเฉียงใต้ ผู้ใช้ถาม: "${userInput}"

กรุณาให้คำแนะนำทีละขั้นตอนที่ชัดเจนในการใช้อุปกรณ์ทางการแพทย์อย่างปลอดภัย

ตอบ:`,
        'Vietnamese': `Bạn là SIMISAI, trợ lý AI thiết bị y tế chuyên về chăm sóc sức khỏe Đông Nam Á. Người dùng hỏi: "${userInput}"

Hãy cung cấp hướng dẫn từng bước rõ ràng để sử dụng thiết bị y tế một cách an toàn.

Trả lời:`
    };
    
    return prompts[language] || prompts['English'];
}

/**
 * Create focused OpenAI prompts
 */
function createOpenAIOptimizedPrompt(userInput, language) {
    return `As SIMISAI medical device assistant, help with: "${userInput}". Provide step-by-step guidance in ${language}. Be clear and concise.`;
}

/**
 * Improved language detection
 */
function detectLanguageImproved(text) {
    // Chinese characters (including Traditional and Simplified)
    if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(text)) return 'Chinese';
    
    // Thai script
    if (/[\u0e00-\u0e7f]/.test(text)) return 'Thai';
    
    // Vietnamese (Latin with diacritics)
    if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) return 'Vietnamese';
    
    // Indonesian keywords
    if (/\b(halo|selamat|saya|anda|bantuan|termometer|tekanan|darah|bagaimana|menggunakan|instruksi)\b/i.test(text)) return 'Indonesian';
    
    // Malay keywords  
    if (/\b(hello|selamat|saya|anda|bantuan|termometer|tekanan|darah|bagaimana|guna|panduan)\b/i.test(text)) return 'Malay';
    
    // Filipino/Tagalog keywords
    if (/\b(kumusta|hello|ako|ikaw|tulong|termometro|presyon|dugo|paano|gamitin)\b/i.test(text)) return 'Filipino';
    
    // Tamil script
    if (/[\u0b80-\u0bff]/.test(text)) return 'Tamil';
    
    // Other Southeast Asian scripts
    if (/[\u1780-\u17ff]/.test(text)) return 'Khmer'; // Cambodia
    if (/[\u0e80-\u0eff]/.test(text)) return 'Lao';    // Laos
    if (/[\u1000-\u109f]/.test(text)) return 'Burmese'; // Myanmar
    
    return 'English';
}

/**
 * Enhanced local responses with comprehensive medical device guidance
 */
function generateImprovedResponse(input, language) {
    const responses = {
        'English': {
            greeting: "Hello! I'm SIMISAI, your AI-powered medical device assistant specializing in ASEAN healthcare. What device do you need help with?",
            thermometer: "**Digital Thermometer Instructions:**\n\n📋 **Preparation:**\n1. Clean thermometer tip with alcohol wipe\n2. Turn on device and wait for ready signal\n\n🌡️ **Taking Temperature:**\n3. **Oral**: Place under tongue, close mouth\n4. **Underarm**: Place in armpit, hold arm down\n5. Wait for beep signal (30-60 seconds)\n6. Read temperature on display\n\n📊 **Normal Ranges:**\n• Oral: 98.6°F (37°C) ± 0.5°F\n• Underarm: 97.6°F (36.4°C) ± 0.5°F\n\n🚨 **When to Contact Doctor:**\n• Fever over 100.4°F (38°C) for adults\n• Any fever in infants under 3 months",
            
            bloodPressure: "**Blood Pressure Monitor Guide:**\n\n🪑 **Preparation (5 minutes):**\n1. Sit quietly, feet flat on floor\n2. Rest arm on table at heart level\n3. Avoid caffeine/smoking 30 min before\n\n🩺 **Taking Measurement:**\n4. Wrap cuff snugly around upper arm (1 inch above elbow)\n5. Ensure cuff is at heart level\n6. Press START button\n7. Remain completely still and silent\n8. Wait for automatic deflation and reading\n\n📊 **Understanding Results:**\n• **Normal**: Less than 120/80 mmHg\n• **Elevated**: 120-129 (systolic) and less than 80 (diastolic)\n• **High BP Stage 1**: 130-139/80-89 mmHg\n• **High BP Stage 2**: 140/90 mmHg or higher\n\n⚠️ **Consult Doctor If:** Consistently above 140/90 mmHg",
            
            glucose: "**Blood Glucose Meter Instructions:**\n\n🧼 **Preparation:**\n1. Wash hands thoroughly with soap and warm water\n2. Dry hands completely\n3. Gather supplies: meter, test strips, lancet device\n\n🩸 **Testing Process:**\n4. Insert test strip into meter\n5. Use lancet to prick side of fingertip\n6. Gently squeeze to form blood drop\n7. Touch blood drop to test strip (don't smear)\n8. Wait 5-10 seconds for result\n\n📊 **Target Levels (mg/dL):**\n• **Fasting**: 80-130 mg/dL\n• **Before meals**: 80-130 mg/dL\n• **2 hours after meals**: Less than 180 mg/dL\n• **Bedtime**: 100-140 mg/dL\n\n🚨 **Important**: Follow your doctor's specific target ranges",
            
            nebulizer: "**Nebulizer Usage Guide:**\n\n🧽 **Setup:**\n1. Wash hands and clean nebulizer cup\n2. Assemble nebulizer according to instructions\n3. Connect tubing to air compressor\n\n💊 **Medication:**\n4. Add prescribed medication to nebulizer cup\n5. Do not mix medications unless directed\n6. Attach mouthpiece or mask\n\n💨 **Treatment:**\n7. Sit upright in comfortable position\n8. Place mouthpiece in mouth, seal lips around it\n9. Turn on compressor\n10. Breathe slowly and deeply through mouth\n11. Continue until medication is gone (10-15 minutes)\n\n🧼 **After Use:**\n12. Clean nebulizer cup and mouthpiece with warm soapy water\n13. Air dry all parts",
            
            general: "I can provide detailed guidance for these medical devices:\n\n🌡️ **Digital Thermometers** - Accurate temperature measurement\n🩸 **Blood Pressure Monitors** - Heart health monitoring\n🍬 **Blood Glucose Meters** - Diabetes management\n💨 **Nebulizers** - Respiratory treatment delivery\n🫁 **Pulse Oximeters** - Blood oxygen monitoring\n💉 **Insulin Pens** - Diabetes medication delivery\n🩹 **Wound Care Devices** - Proper wound management\n\n**ASEAN Healthcare Focus**: Specialized guidance for Southeast Asian medical practices and climate considerations.\n\nWhat specific device would you like detailed instructions for?"
        },
        
        'Chinese': {
            greeting: "您好！我是SIMISAI，专门服务于东盟医疗保健的AI医疗设备助手。请问您需要哪种设备的帮助？",
            thermometer: "**数字体温计使用指南：**\n\n📋 **准备工作：**\n1. 用酒精棉球清洁体温计头部\n2. 开机等待准备就绪信号\n\n🌡️ **测量体温：**\n3. **口温**：放置舌下，闭嘴\n4. **腋温**：放置腋下，夹紧手臂\n5. 等待蜂鸣信号（30-60秒）\n6. 读取显示温度\n\n📊 **正常范围：**\n• 口温：37°C ± 0.3°C\n• 腋温：36.4°C ± 0.3°C\n\n🚨 **就医指标：**\n• 成人发热超过38°C\n• 3个月以下婴儿任何发热",
            bloodPressure: "**血压计使用指南：**\n\n🪑 **准备（5分钟）：**\n1. 安静坐着，双脚平放\n2. 手臂放桌上与心脏同高\n3. 测量前30分钟避免咖啡因/吸烟\n\n🩺 **测量过程：**\n4. 袖带紧贴上臂（肘上1寸）\n5. 确保袖带与心脏同高\n6. 按开始按钮\n7. 保持完全静止和安静\n8. 等待自动放气和读数\n\n📊 **结果理解：**\n• **正常**：低于120/80 mmHg\n• **偏高**：120-129（收缩压）且低于80（舒张压）\n• **高血压1期**：130-139/80-89 mmHg\n• **高血压2期**：140/90 mmHg或更高\n\n⚠️ **就医指标：** 持续高于140/90 mmHg",
            general: "我可以为这些医疗设备提供详细指导：\n\n🌡️ **数字体温计** - 准确体温测量\n🩸 **血压计** - 心脏健康监测\n🍬 **血糖仪** - 糖尿病管理\n💨 **雾化器** - 呼吸治疗\n\n**东盟医疗专注**: 针对东南亚医疗实践和气候考虑的专业指导。\n\n请问您需要哪种特定设备的详细说明？"
        }
    };
    
    const langResponses = responses[language] || responses['English'];
    const inputLower = input.toLowerCase();
    
    // Smart device detection with multiple keywords
    if (/thermo|temp|fever|热|体温|发烧|อุณหภูมิ|nhiệt độ/i.test(inputLower)) return langResponses.thermometer;
    if (/blood.*pressure|bp|血压|高血压|量血压|ความดัน|huyết áp/i.test(inputLower)) return langResponses.bloodPressure;
    if (/glucose|sugar|diabetes|血糖|糖尿病|เบาหวาน|đường huyết/i.test(inputLower)) return langResponses.glucose;
    if (/nebulizer|inhaler|雾化|吸入|พ่นยา|xông khí/i.test(inputLower)) return langResponses.nebulizer;
    if (/hello|hi|你好|您好|halo|สวัสดี|xin chào|kumusta/i.test(inputLower)) return langResponses.greeting;
    
    return langResponses.general;
}

/**
 * Emergency response for critical failures
 */
function generateEmergencyResponse() {
    return "🚨 **SIMISAI Emergency Mode Active**\n\nI'm experiencing technical difficulties but can provide basic medical device guidance:\n\n**Quick Device Help:**\n• **Thermometer**: Clean → Under tongue → Wait for beep → Read display\n• **Blood Pressure**: Sit quietly → Wrap cuff → Press start → Stay still\n• **Glucose Meter**: Wash hands → Insert strip → Prick finger → Apply blood\n\n**For urgent medical concerns, please contact your healthcare provider immediately.**\n\n*System will return to full AI capability shortly.*";
}
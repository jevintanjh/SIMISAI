/**
 * Hybrid LLM Service - Refined ASEAN Language Detection
 * Improved Indonesian vs Malay distinction
 */

// Use AWS SDK v3 compatible approach
const https = require('https');

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        // Handle different event formats
        let body;
        if (typeof event.body === 'string') {
            body = JSON.parse(event.body);
        } else if (event.body) {
            body = event.body;
        } else {
            // Direct invocation format
            body = event;
        }
        
        console.log('Parsed body:', JSON.stringify(body, null, 2));
        
        const { messages } = body;
        
        // Extract the last user message
        const lastMessage = messages[messages.length - 1];
        const userInput = lastMessage.content;
        
        // Detect language with refined ASEAN algorithm
        const language = detectRefinedASEANLanguage(userInput);
        
        // Try to call SEA-LION endpoint first
        let response;
        let providerInfo;
        let sagemakerSuccess = false;
        
        try {
            // Call actual SEA-LION endpoint using HTTPS
            const sagemakerResponse = await callSageMakerEndpointHTTPS(userInput, language);
            
            // Check if we got a real response or just the fallback text
            if (sagemakerResponse && sagemakerResponse !== 'SEA-LION response received' && sagemakerResponse.length > 10) {
                response = sagemakerResponse;
                providerInfo = {
                    provider: 'SEA-LION LLM (27B)',
                    status: 'Production Mode',
                    note: 'Real SEA-LION endpoint active!',
                    detectedLanguage: language,
                    supportedLanguages: ['English', 'Mandarin', 'Indonesian', 'Malay', 'Thai', 'Vietnamese', 'Tagalog', 'Tamil', 'Khmer', 'Lao', 'Burmese'],
                    aseanLanguages: ['Chinese (Mandarin)', 'Thai', 'Vietnamese', 'Bahasa Malay', 'Indonesian']
                };
                sagemakerSuccess = true;
            } else {
                throw new Error('SEA-LION returned fallback response');
            }
        } catch (sagemakerError) {
            console.log('SEA-LION endpoint failed, using fallback:', sagemakerError.message);
            
            // Fallback to refined mock responses
            const fallbackResponse = generateRefinedASEANResponse(userInput, language);
            
            // Handle new response format with clarification needs
            if (typeof fallbackResponse === 'object' && fallbackResponse.needsClarification) {
                response = fallbackResponse.response;
                providerInfo = {
                    provider: 'SIMISAI ASEAN Refined',
                    status: 'Clarification Mode',
                    note: 'SEA-LION temporarily unavailable - asking for clarification',
                    detectedLanguage: language,
                    supportedLanguages: ['English', 'Mandarin', 'Indonesian', 'Malay', 'Thai', 'Vietnamese', 'Tagalog', 'Tamil', 'Khmer', 'Lao', 'Burmese'],
                    aseanLanguages: ['Chinese (Mandarin)', 'Thai', 'Vietnamese', 'Bahasa Malay', 'Indonesian'],
                    needsClarification: true
                };
            } else {
                response = fallbackResponse;
                providerInfo = {
                    provider: 'SIMISAI ASEAN Refined',
                    status: 'Fallback Mode',
                    note: 'SEA-LION temporarily unavailable - using refined ASEAN responses',
                    detectedLanguage: language,
                    supportedLanguages: ['English', 'Mandarin', 'Indonesian', 'Malay', 'Thai', 'Vietnamese', 'Tagalog', 'Tamil', 'Khmer', 'Lao', 'Burmese'],
                    aseanLanguages: ['Chinese (Mandarin)', 'Thai', 'Vietnamese', 'Bahasa Malay', 'Indonesian']
                };
            }
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: response,
                provider: providerInfo,
                requestCount: 1,
                sagemakerReady: sagemakerSuccess,
                debug: 'Refined ASEAN language detection version'
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Chat service temporarily unavailable',
                message: error.message,
                debug: 'Refined ASEAN language detection error handling'
            })
        };
    }
};

/**
 * Refined ASEAN language detection algorithm
 * Improved Indonesian vs Malay distinction
 */
function detectRefinedASEANLanguage(text) {
    // Remove extra whitespace and normalize
    const normalizedText = text.trim();
    const textLower = normalizedText.toLowerCase();
    
    // 1. CHINESE (Mandarin) - Most specific detection first
    // Check for Chinese characters (CJK Unified Ideographs)
    if (/[\u4e00-\u9fff]/.test(text)) {
        return 'Mandarin';
    }
    
    // Check for Chinese punctuation and symbols
    if (/[\u3000-\u303f\u3100-\u312f\u3200-\u32ff]/.test(text)) {
        return 'Mandarin';
    }
    
    // 2. THAI - Very specific Unicode range
    // Thai characters (U+0E00-U+0E7F)
    if (/[\u0e00-\u0e7f]/.test(text)) {
        return 'Thai';
    }
    
    // 3. VIETNAMESE - Latin with diacritics
    // Vietnamese specific diacritics
    if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) {
        return 'Vietnamese';
    }
    
    // Vietnamese common words/phrases
    if (/\b(xin chào|tôi|bạn|của|với|nhiệt kế|máy đo|huyết áp|glucose|nebulizer|thiết bị|y tế|bác sĩ|bệnh viện)\b/i.test(text)) {
        return 'Vietnamese';
    }
    
    // 4. BAHASA MALAY - Check Malay-specific words FIRST
    // Malay-specific words (not Indonesian)
    if (/\b(selamat|awak|anda|peranti|perubatan|doktor|hospital|kesihatan|suhu badan|alat kesihatan)\b/i.test(text)) {
        return 'Malay';
    }
    
    // Malay vs Indonesian distinction - Malay uses "peranti" vs Indonesian "perangkat"
    if (/\b(peranti|perubatan|doktor|hospital|kesihatan|awak|anda)\b/i.test(text) && !/\b(perangkat|medis|dokter|rumah sakit|kesehatan|saya)\b/i.test(text)) {
        return 'Malay';
    }
    
    // 5. INDONESIAN - Check Indonesian-specific words AFTER Malay
    // Indonesian-specific medical terms
    if (/\b(halo|saya|perlu|bantuan|termometer|tekanan darah|glukosa|nebulizer|perangkat|medis|dokter|rumah sakit|alat kesehatan|pengukur|suhu tubuh|monitor|alat bantu)\b/i.test(text)) {
        return 'Indonesian';
    }
    
    // Indonesian-specific greetings and common phrases
    if (/\b(halo|hai|selamat pagi|selamat siang|selamat sore|selamat malam|terima kasih|tolong|bagaimana|menggunakan|perangkat|alat|kesehatan|medis)\b/i.test(text)) {
        return 'Indonesian';
    }
    
    // 6. TAGALOG - Filipino/Tagalog
    if (/\b(kumusta|ako|ikaw|kailangan|tulong|termometro|presyon|dugo|glucose|nebulizer|paano|gamitin|doktor|ospital|kagamitan|kalusugan|pagsukat|temperatura|monitor|tulong)\b/i.test(text)) {
        return 'Tagalog';
    }
    
    // 7. TAMIL - Tamil script
    if (/[\u0b80-\u0bff]/.test(text)) {
        return 'Tamil';
    }
    
    // 8. KHMER - Khmer script
    if (/[\u1780-\u17ff]/.test(text)) {
        return 'Khmer';
    }
    
    // 9. LAO - Lao script
    if (/[\u0e80-\u0eff]/.test(text)) {
        return 'Lao';
    }
    
    // 10. BURMESE - Myanmar script
    if (/[\u1000-\u109f]/.test(text)) {
        return 'Burmese';
    }
    
    // Default to English
    return 'English';
}

/**
 * Call SEA-LION endpoint using HTTPS (no AWS SDK dependency)
 */
async function callSageMakerEndpointHTTPS(userInput, language) {
    try {
        const AWS = require('aws-sdk');
        const sagemakerRuntime = new AWS.SageMakerRuntime({ region: 'us-east-1' });
        
        // Create prompt for SEA-LION
        const prompt = createRefinedASEANPrompt(userInput, language);
        
        const payload = JSON.stringify({
            prompt: prompt,
            max_tokens: 500,
            temperature: 0.7
        });
        
        const params = {
            EndpointName: 'simisai-sealion-realtime-endpoint',
            ContentType: 'application/json',
            Body: payload
        };
        
        console.log('Calling SageMaker endpoint with payload:', payload);
        
        const result = await sagemakerRuntime.invokeEndpoint(params).promise();
        console.log('SageMaker raw result:', result);
        
        let responseBody;
        if (result.Body) {
            const bodyString = result.Body.toString();
            console.log('SageMaker response body string:', bodyString);
            responseBody = JSON.parse(bodyString);
        } else {
            throw new Error('No response body from SageMaker');
        }
        
        console.log('SageMaker parsed response:', responseBody);
        
        // Handle OpenAI-style response format from predictor.py
        if (responseBody.choices && responseBody.choices[0] && responseBody.choices[0].message) {
            return responseBody.choices[0].message.content;
        } else if (responseBody.generated_text) {
            return responseBody.generated_text;
        } else if (responseBody.text) {
            return responseBody.text;
        } else {
            console.log('Unexpected response format:', responseBody);
            return 'SEA-LION response received';
        }
        
    } catch (error) {
        console.error('SageMaker endpoint error:', error);
        throw error;
    }
}

/**
 * Create refined ASEAN language-specific prompt for SEA-LION
 */
function createRefinedASEANPrompt(userInput, language) {
    const languagePrompts = {
        'English': `You are SIMISAI, an AI medical device assistant. Help the user with their medical device question: "${userInput}"`,
        'Mandarin': `你是SIMISAI，一个AI医疗设备助手。帮助用户解决他们的医疗设备问题："${userInput}"`,
        'Indonesian': `Anda adalah SIMISAI, asisten perangkat medis AI. Bantu pengguna dengan pertanyaan perangkat medis mereka: "${userInput}"`,
        'Malay': `Anda adalah SIMISAI, pembantu peranti perubatan AI. Bantu pengguna dengan soalan peranti perubatan mereka: "${userInput}"`,
        'Thai': `คุณคือ SIMISAI ผู้ช่วยอุปกรณ์ทางการแพทย์ AI ช่วยผู้ใช้กับคำถามเกี่ยวกับอุปกรณ์ทางการแพทย์: "${userInput}"`,
        'Vietnamese': `Bạn là SIMISAI, trợ lý thiết bị y tế AI. Giúp người dùng với câu hỏi về thiết bị y tế: "${userInput}"`,
        'Tagalog': `Ikaw ay SIMISAI, isang AI medical device assistant. Tulungan ang user sa kanilang medical device question: "${userInput}"`
    };
    
    return languagePrompts[language] || languagePrompts['English'];
}

/**
 * Generate refined ASEAN-optimized multilingual responses (fallback)
 */
function generateRefinedASEANResponse(input, language) {
    const responses = {
        'English': {
            greeting: "👋 **Hello! I'm SIMISAI**\n\nYour AI-powered medical device assistant! 🤖\n\n**🩺 I'm here to help you with:**\n• Digital thermometers\n• Blood pressure monitors\n• Blood glucose meters\n• Nebulizers\n• And other medical devices\n\n**💬 Just ask me anything like:**\n• \"How do I use my thermometer?\"\n• \"How do I position the device correctly?\"\n• \"Help with blood pressure monitor\"\n\n**✨ Let's make medical device usage easy and safe!**",
            thermometer: "🌡️ **Digital Thermometer Guide**\n\n**📋 Step-by-Step Instructions:**\n\n1️⃣ **Prepare**: Clean thermometer with alcohol\n2️⃣ **Position**: Place under tongue (close mouth gently) OR in armpit (hold arm close to body)\n3️⃣ **Wait**: Keep thermometer in place until you hear the beep sound\n4️⃣ **Read**: Check temperature from the display\n\n**💡 Positioning Tips:**\n• **Oral**: Place under tongue, close mouth, breathe through nose\n• **Armpit**: Place in center of armpit, hold arm down\n\n**⚠️ Important Notes:**\n• Normal temperature: 98.6°F (37°C)\n• Contact doctor if above 100.4°F (38°C)\n• Wait 15 minutes after eating/drinking for oral readings",
            bloodPressure: "🩸 **Blood Pressure Monitor Guide**\n\n**📋 Step-by-Step Instructions:**\n\n1️⃣ **Prepare**: Sit comfortably with feet flat on floor\n2️⃣ **Position**: Wrap cuff around upper arm (1 inch above elbow)\n3️⃣ **Align**: Position cuff at heart level\n4️⃣ **Start**: Press start button and remain still\n5️⃣ **Wait**: Wait for measurement to complete\n\n**💡 Positioning Tips:**\n• Cuff should be snug but not tight\n• Keep arm relaxed and supported\n• Don't talk or move during measurement\n\n**🔧 Troubleshooting:**\n• **Won't turn on**: Check batteries, ensure proper connection\n• **Error readings**: Reposition cuff, check for air leaks\n• **Inconsistent results**: Take multiple readings, ensure proper positioning\n\n**⚠️ Important Notes:**\n• Normal BP: Less than 120/80 mmHg\n• Consult doctor if above 140/90 mmHg\n• Take multiple readings for accuracy",
            general: "🤖 **SIMISAI Medical Device Assistant**\n\n**🩺 I can help you with:**\n\n🌡️ **Digital Thermometers** - Temperature measurement guidance\n🩸 **Blood Pressure Monitors** - BP measurement instructions\n🍬 **Blood Glucose Meters** - Blood sugar testing help\n💨 **Nebulizers** - Breathing treatment guidance\n🏥 **Other Medical Devices** - General device support\n\n**💬 How to get help:**\n• Ask specific questions like \"How do I use my thermometer?\"\n• Request positioning help: \"How do I position the device?\"\n• Get device-specific instructions for any medical device\n\n**✨ I'm here to make medical device usage easy and safe!**"
        },
        'Mandarin': {
            greeting: "你好！我是SIMISAI，您的AI医疗设备助手。今天我可以如何帮助您使用医疗设备？",
            thermometer: "数字体温计使用方法：\n\n1. 用酒精清洁体温计\n2. 放在舌下或腋下\n3. 等待蜂鸣声\n4. 读取温度显示\n\n正常体温为98.6°F（37°C）。如果温度超过100.4°F（38°C），请咨询医生。",
            bloodPressure: "血压计使用方法：\n\n1. 舒适地坐着，双脚平放在地板上\n2. 将袖带缠绕在上臂\n3. 将袖带定位在心脏水平\n4. 按下开始按钮并保持静止\n5. 等待测量完成\n\n正常血压低于120/80 mmHg。如果读数超过140/90 mmHg，请咨询医生。",
            general: "我可以帮助您使用：\n\n• 数字体温计\n• 血压计\n• 血糖仪\n• 雾化器\n• 其他医疗设备\n\n请询问具体设备以获得详细说明！"
        },
        'Indonesian': {
            greeting: "Halo! Saya SIMISAI, asisten perangkat medis bertenaga AI Anda. Bagaimana saya bisa membantu Anda dengan perangkat medis hari ini?",
            thermometer: "Untuk termometer digital, berikut cara menggunakannya dengan benar:\n\n1. Bersihkan termometer dengan alkohol\n2. Letakkan di bawah lidah atau ketiak\n3. Tunggu suara bip\n4. Baca tampilan suhu\n\nSuhu tubuh normal adalah 98.6°F (37°C). Hubungi dokter jika suhu di atas 100.4°F (38°C).",
            bloodPressure: "Untuk monitor tekanan darah:\n\n1. Duduk nyaman dengan kaki rata di lantai\n2. Bungkus manset di sekitar lengan atas\n3. Posisikan manset setinggi jantung\n4. Tekan tombol start dan tetap diam\n5. Tunggu pengukuran selesai\n\nTekanan darah normal kurang dari 120/80 mmHg. Konsultasikan dokter untuk pembacaan di atas 140/90 mmHg.",
            general: "Saya dapat membantu Anda dengan:\n\n• Termometer digital\n• Monitor tekanan darah\n• Meter glukosa darah\n• Nebulizer\n• Dan perangkat medis lainnya\n\nSilakan tanyakan tentang perangkat tertentu untuk instruksi detail!"
        },
        'Malay': {
            greeting: "Selamat! Saya SIMISAI, pembantu peranti perubatan AI anda. Bagaimana saya boleh membantu anda dengan peranti perubatan hari ini?",
            thermometer: "Untuk termometer digital, berikut cara menggunakannya dengan betul:\n\n1. Bersihkan termometer dengan alkohol\n2. Letakkan di bawah lidah atau ketiak\n3. Tunggu bunyi bip\n4. Baca paparan suhu\n\nSuhu badan normal ialah 98.6°F (37°C). Hubungi doktor jika suhu melebihi 100.4°F (38°C).",
            bloodPressure: "Untuk monitor tekanan darah:\n\n1. Duduk selesa dengan kaki rata di lantai\n2. Balut manset di sekitar lengan atas\n3. Letakkan manset setinggi jantung\n4. Tekan butang mula dan kekal diam\n5. Tunggu pengukuran selesai\n\nTekanan darah normal kurang daripada 120/80 mmHg. Rujuk doktor untuk bacaan melebihi 140/90 mmHg.",
            general: "Saya boleh membantu anda dengan:\n\n• Termometer digital\n• Monitor tekanan darah\n• Meter glukosa darah\n• Nebulizer\n• Dan peranti perubatan lain\n\nSila tanya tentang peranti tertentu untuk arahan terperinci!"
        },
        'Thai': {
            greeting: "สวัสดี! ฉันคือ SIMISAI ผู้ช่วยอุปกรณ์ทางการแพทย์ที่ขับเคลื่อนด้วย AI ของคุณ วันนี้ฉันจะช่วยคุณเกี่ยวกับอุปกรณ์ทางการแพทย์ได้อย่างไร?",
            thermometer: "สำหรับเครื่องวัดอุณหภูมิดิจิทัล นี่คือวิธีใช้งานที่ถูกต้อง:\n\n1. ทำความสะอาดเครื่องวัดอุณหภูมิด้วยแอลกอฮอล์\n2. วางไว้ใต้ลิ้นหรือรักแร้\n3. รอเสียงบีป\n4. อ่านการแสดงผลอุณหภูมิ\n\nอุณหภูมิร่างกายปกติคือ 98.6°F (37°C) ติดต่อแพทย์หากอุณหภูมิสูงกว่า 100.4°F (38°C)",
            bloodPressure: "สำหรับเครื่องวัดความดันโลหิต:\n\n1. นั่งสบายๆ โดยวางเท้าราบกับพื้น\n2. ใส่ผ้าพันแขนรอบแขนส่วนบน\n3. วางผ้าพันแขนให้อยู่ในระดับหัวใจ\n4. กดปุ่มเริ่มและอยู่นิ่งๆ\n5. รอให้การวัดเสร็จสิ้น\n\nความดันโลหิตปกติต่ำกว่า 120/80 mmHg ปรึกษาแพทย์หากการอ่านสูงกว่า 140/90 mmHg",
            general: "ฉันสามารถช่วยคุณเกี่ยวกับ:\n\n• เครื่องวัดอุณหภูมิดิจิทัล\n• เครื่องวัดความดันโลหิต\n• เครื่องวัดระดับน้ำตาลในเลือด\n• เครื่องพ่นยา\n• และอุปกรณ์ทางการแพทย์อื่นๆ\n\nกรุณาถามเกี่ยวกับอุปกรณ์เฉพาะเพื่อคำแนะนำรายละเอียด!"
        },
        'Vietnamese': {
            greeting: "Xin chào! Tôi là SIMISAI, trợ lý thiết bị y tế được hỗ trợ bởi AI của bạn. Hôm nay tôi có thể giúp bạn với thiết bị y tế như thế nào?",
            thermometer: "Đối với nhiệt kế kỹ thuật số, đây là cách sử dụng đúng:\n\n1. Làm sạch nhiệt kế bằng cồn\n2. Đặt dưới lưỡi hoặc nách\n3. Chờ tiếng bíp\n4. Đọc hiển thị nhiệt độ\n\nNhiệt độ cơ thể bình thường là 98.6°F (37°C). Liên hệ bác sĩ nếu nhiệt độ trên 100.4°F (38°C).",
            bloodPressure: "Đối với máy đo huyết áp:\n\n1. Ngồi thoải mái với chân đặt phẳng trên sàn\n2. Quấn vòng bít quanh cánh tay trên\n3. Đặt vòng bít ở mức tim\n4. Nhấn nút bắt đầu và giữ yên\n5. Chờ đo xong\n\nHuyết áp bình thường dưới 120/80 mmHg. Tham khảo ý kiến bác sĩ nếu chỉ số trên 140/90 mmHg.",
            general: "Tôi có thể giúp bạn với:\n\n• Nhiệt kế kỹ thuật số\n• Máy đo huyết áp\n• Máy đo đường huyết\n• Máy xông mũi\n• Và các thiết bị y tế khác\n\nVui lòng hỏi về thiết bị cụ thể để có hướng dẫn chi tiết!"
        }
    };
    
    const langResponses = responses[language] || responses['English'];
    
    // Check for specific device mentions with improved detection
    const inputLower = input.toLowerCase();
    
    // Check for positioning/placement questions
    if (inputLower.includes('position') || inputLower.includes('place') || inputLower.includes('where') || inputLower.includes('how to') || inputLower.includes('correctly') || inputLower.includes('properly')) {
        // Determine device type from context or default to thermometer
        if (inputLower.includes('thermometer') || inputLower.includes('termometer') || inputLower.includes('体温计') || inputLower.includes('เครื่องวัดอุณหภูมิ') || inputLower.includes('nhiệt kế')) {
            return langResponses.thermometer;
        } else if (inputLower.includes('blood pressure') || inputLower.includes('bp') || inputLower.includes('bp machine') || inputLower.includes('blood pressure machine') || inputLower.includes('tekanan darah') || inputLower.includes('血压') || inputLower.includes('ความดันโลหิต') || inputLower.includes('huyết áp')) {
            return langResponses.bloodPressure;
        } else {
            // Default to thermometer for positioning questions
            return langResponses.thermometer;
        }
    }
    
    // Check for troubleshooting questions
    if (inputLower.includes('why can') || inputLower.includes('wont') || inputLower.includes("won't") || inputLower.includes('not working') || inputLower.includes('error') || inputLower.includes('problem') || inputLower.includes('issue')) {
        // Determine device type from context
        if (inputLower.includes('thermometer') || inputLower.includes('termometer') || inputLower.includes('体温计') || inputLower.includes('เครื่องวัดอุณหภูมิ') || inputLower.includes('nhiệt kế')) {
            return langResponses.thermometer;
        } else if (inputLower.includes('blood pressure') || inputLower.includes('bp') || inputLower.includes('bp machine') || inputLower.includes('blood pressure machine') || inputLower.includes('tekanan darah') || inputLower.includes('血压') || inputLower.includes('ความดันโลหิต') || inputLower.includes('huyết áp')) {
            return langResponses.bloodPressure;
        } else {
            // Default to general help for troubleshooting
            return langResponses.general;
        }
    }
    
    // Check for help requests with enhanced context awareness
    if (inputLower.includes('help') || inputLower.includes('assist') || inputLower.includes('support') || inputLower.includes('bantuan') || inputLower.includes('ช่วย') || inputLower.includes('giúp')) {
        // If help request is ambiguous, ask for clarification
        if (inputLower.includes('device') && !inputLower.includes('thermometer') && !inputLower.includes('blood pressure') && !inputLower.includes('bp')) {
            return {
                response: language === 'English' ? 
                    "I'd be happy to help with your medical device! Which device are you using?\n\n🌡️ **Digital Thermometer** - Temperature measurement\n🩸 **Blood Pressure Monitor** - BP measurement\n🍬 **Blood Glucose Meter** - Blood sugar testing\n💨 **Nebulizer** - Breathing treatment\n\n**Please let me know which one, and I'll provide specific guidance!**" :
                    langResponses.general,
                needsClarification: true
            };
        }
        return langResponses.general;
    }
    
    // Check for specific device mentions
    if (inputLower.includes('thermometer') || inputLower.includes('termometer') || inputLower.includes('体温计') || inputLower.includes('เครื่องวัดอุณหภูมิ') || inputLower.includes('nhiệt kế')) {
        return langResponses.thermometer;
    }
    
    if (inputLower.includes('blood pressure') || inputLower.includes('bp') || inputLower.includes('bp machine') || inputLower.includes('blood pressure machine') || inputLower.includes('tekanan darah') || inputLower.includes('血压') || inputLower.includes('ความดันโลหิต') || inputLower.includes('huyết áp')) {
        return langResponses.bloodPressure;
    }
    
    // Check for greetings
    if (inputLower.includes('hello') || inputLower.includes('hi') || inputLower.includes('你好') || inputLower.includes('halo') || inputLower.includes('สวัสดี') || inputLower.includes('xin chào') || inputLower.includes('selamat')) {
        return langResponses.greeting;
    }
    
    // Enhanced context awareness for ambiguous queries
    if (inputLower.includes('how') && inputLower.includes('use') && !inputLower.includes('thermometer') && !inputLower.includes('blood pressure') && !inputLower.includes('bp')) {
        return {
            response: language === 'English' ? 
                "I'll help you use your medical device! To give you the most accurate instructions, could you tell me:\n\n1️⃣ **Which device** are you using?\n2️⃣ **What specific step** are you having trouble with?\n3️⃣ **Any error messages** you're seeing?\n\nThis will help me provide personalized guidance! 🎯" :
                langResponses.general,
            needsClarification: true
        };
    }
    
    // Enhanced troubleshooting detection for ambiguous issues
    if ((inputLower.includes('not working') || inputLower.includes('error') || inputLower.includes('problem')) && !inputLower.includes('thermometer') && !inputLower.includes('blood pressure') && !inputLower.includes('bp')) {
        return {
            response: language === 'English' ? 
                "I understand you're having an issue with your device. Let me help troubleshoot! 🔧\n\n**Please tell me:**\n\n1️⃣ **Which device** is having problems?\n2️⃣ **What exactly** is happening?\n3️⃣ **When did** the issue start?\n4️⃣ **Any error messages** or unusual behavior?\n\nWith this info, I can provide specific troubleshooting steps! 🎯" :
                langResponses.general,
            needsClarification: true
        };
    }
    
    // For any other questions, provide helpful guidance
    return langResponses.general;
}

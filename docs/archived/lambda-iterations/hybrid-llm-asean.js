/**
 * Hybrid LLM Service - ASEAN Language Detection Version
 * Priority: Fix Chinese, Thai, Vietnamese, Bahasa Malay detection
 */

// Use AWS SDK v3 compatible approach
const https = require('https');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { messages } = body;
        
        // Extract the last user message
        const lastMessage = messages[messages.length - 1];
        const userInput = lastMessage.content;
        
        // Detect language with improved ASEAN algorithm
        const language = detectASEANLanguage(userInput);
        
        // Try to call SEA-LION endpoint first
        let response;
        let providerInfo;
        let sagemakerSuccess = false;
        
        try {
            // Call actual SEA-LION endpoint using HTTPS
            const sagemakerResponse = await callSageMakerEndpointHTTPS(userInput, language);
            response = sagemakerResponse;
            providerInfo = {
                provider: 'SEA-LION LLM (27B)',
                status: 'Production Mode',
                note: 'Real SEA-LION endpoint active!',
                detectedLanguage: language,
                supportedLanguages: ['English', 'Mandarin', 'Indonesian', 'Malay', 'Thai', 'Vietnamese', 'Tagalog', 'Tamil', 'Khmer', 'Lao', 'Burmese'],
                aseanLanguages: ['Chinese (Mandarin)', 'Thai', 'Vietnamese', 'Bahasa Malay']
            };
            sagemakerSuccess = true;
        } catch (sagemakerError) {
            console.log('SEA-LION endpoint failed, using fallback:', sagemakerError.message);
            
            // Fallback to improved mock responses
            response = generateASEANResponse(userInput, language);
            providerInfo = {
                provider: 'SIMISAI ASEAN Mock',
                status: 'Fallback Mode',
                note: 'SEA-LION temporarily unavailable - using ASEAN-optimized responses',
                detectedLanguage: language,
                supportedLanguages: ['English', 'Mandarin', 'Indonesian', 'Malay', 'Thai', 'Vietnamese', 'Tagalog', 'Tamil', 'Khmer', 'Lao', 'Burmese'],
                aseanLanguages: ['Chinese (Mandarin)', 'Thai', 'Vietnamese', 'Bahasa Malay']
            };
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
                debug: 'ASEAN language detection version'
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
                debug: 'ASEAN language detection error handling'
            })
        };
    }
};

/**
 * Improved ASEAN language detection algorithm
 */
function detectASEANLanguage(text) {
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
    
    // 4. BAHASA MALAY - Distinguish from Indonesian
    // Malay specific words (not Indonesian)
    if (/\b(selamat|awak|saya|anda|bagaimana|menggunakan|termometer|tekanan darah|glukosa|nebulizer|peranti|perubatan|doktor|hospital)\b/i.test(text)) {
        return 'Malay';
    }
    
    // Malay vs Indonesian distinction
    if (/\b(awak|anda|bagaimana|menggunakan|peranti|perubatan)\b/i.test(text) && !/\b(halo|saya|perlu|bantuan|bagaimana|menggunakan)\b/i.test(text)) {
        return 'Malay';
    }
    
    // 5. INDONESIAN - Indonesian specific words
    if (/\b(halo|saya|perlu|bantuan|termometer|tekanan darah|glukosa|nebulizer|perangkat|medis|dokter|rumah sakit)\b/i.test(text)) {
        return 'Indonesian';
    }
    
    // 6. TAGALOG - Filipino/Tagalog
    if (/\b(kumusta|ako|ikaw|kailangan|tulong|termometro|presyon|dugo|glucose|nebulizer|paano|gamitin|doktor|ospital)\b/i.test(text)) {
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
    return new Promise((resolve, reject) => {
        const endpointUrl = 'https://runtime.sagemaker.us-east-1.amazonaws.com/endpoints/simisai-sealion-realtime-endpoint/invocations';
        
        // Create prompt for SEA-LION
        const prompt = createASEANPrompt(userInput, language);
        
        const payload = JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 500,
                temperature: 0.7,
                top_p: 0.9
            }
        });
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };
        
        const req = https.request(endpointUrl, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    const generatedText = response.generated_text || response.text || response.output || 'SEA-LION response received';
                    resolve(generatedText);
                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    reject(new Error('Failed to parse SEA-LION response'));
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('HTTPS request error:', error);
            reject(error);
        });
        
        req.write(payload);
        req.end();
    });
}

/**
 * Create ASEAN language-specific prompt for SEA-LION
 */
function createASEANPrompt(userInput, language) {
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
 * Generate ASEAN-optimized multilingual responses (fallback)
 */
function generateASEANResponse(input, language) {
    const responses = {
        'English': {
            greeting: "Hello! I'm SIMISAI, your AI-powered medical device assistant. How can I help you with your medical device today?",
            thermometer: "For digital thermometers, here's how to use them properly:\n\n1. Clean the thermometer with alcohol\n2. Place under tongue or in armpit\n3. Wait for the beep sound\n4. Read the temperature display\n\nNormal body temperature is 98.6°F (37°C). Contact a doctor if temperature is above 100.4°F (38°C).",
            bloodPressure: "For blood pressure monitors:\n\n1. Sit comfortably with feet flat on floor\n2. Wrap cuff around upper arm\n3. Position cuff at heart level\n4. Press start button and remain still\n5. Wait for measurement to complete\n\nNormal BP is less than 120/80 mmHg. Consult your doctor for readings above 140/90 mmHg.",
            general: "I can help you with:\n\n• Digital thermometers\n• Blood pressure monitors\n• Blood glucose meters\n• Nebulizers\n• And other medical devices\n\nPlease ask me about a specific device for detailed instructions!"
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
    
    if (inputLower.includes('thermometer') || inputLower.includes('termometer') || inputLower.includes('体温计') || inputLower.includes('เครื่องวัดอุณหภูมิ') || inputLower.includes('nhiệt kế')) {
        return langResponses.thermometer;
    }
    
    if (inputLower.includes('blood pressure') || inputLower.includes('tekanan darah') || inputLower.includes('血压') || inputLower.includes('ความดันโลหิต') || inputLower.includes('huyết áp')) {
        return langResponses.bloodPressure;
    }
    
    if (inputLower.includes('hello') || inputLower.includes('hi') || inputLower.includes('你好') || inputLower.includes('halo') || inputLower.includes('สวัสดี') || inputLower.includes('xin chào') || inputLower.includes('selamat')) {
        return langResponses.greeting;
    }
    
    return langResponses.general;
}








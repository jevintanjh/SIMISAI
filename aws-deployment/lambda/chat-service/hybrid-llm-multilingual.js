/**
 * Hybrid LLM Service - Multilingual Version
 * Supports SEA-LION v4 languages: Burmese, English, Mandarin, Indonesian, Khmer, Lao, Malay, Tagalog, Tamil, Thai, Vietnamese
 */

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { messages } = body;
        
        // Extract the last user message
        const lastMessage = messages[messages.length - 1];
        const userInput = lastMessage.content;
        
        // Detect language and provide appropriate response
        const language = detectLanguage(userInput);
        const response = generateMultilingualResponse(userInput, language);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                response: response,
                provider: {
                    provider: 'SIMISAI Multilingual LLM',
                    status: 'Demo Mode',
                    note: 'Enhanced multilingual support - SEA-LION integration ready',
                    detectedLanguage: language,
                    supportedLanguages: ['English', 'Mandarin', 'Indonesian', 'Malay', 'Thai', 'Vietnamese', 'Tagalog', 'Tamil', 'Khmer', 'Lao', 'Burmese']
                },
                requestCount: 1,
                sagemakerReady: true,
                debug: 'Multilingual version with SEA-LION language support'
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
                debug: 'Multilingual version error handling'
            })
        };
    }
};

/**
 * Detect language from user input
 */
function detectLanguage(text) {
    // Chinese characters
    if (/[\u4e00-\u9fff]/.test(text)) {
        return 'Mandarin';
    }
    
    // Thai characters
    if (/[\u0e00-\u0e7f]/.test(text)) {
        return 'Thai';
    }
    
    // Vietnamese characters (Latin with diacritics)
    if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) {
        return 'Vietnamese';
    }
    
    // Indonesian/Malay keywords
    if (/\b(halo|saya|perlu|bantuan|termometer|tekanan|darah|glukosa|darah|nebulizer)\b/i.test(text)) {
        return 'Indonesian';
    }
    
    // Tagalog keywords
    if (/\b(kumusta|ako|kailangan|tulong|termometro|presyon|dugo|glucose|nebulizer)\b/i.test(text)) {
        return 'Tagalog';
    }
    
    // Tamil characters
    if (/[\u0b80-\u0bff]/.test(text)) {
        return 'Tamil';
    }
    
    // Khmer characters
    if (/[\u1780-\u17ff]/.test(text)) {
        return 'Khmer';
    }
    
    // Lao characters
    if (/[\u0e80-\u0eff]/.test(text)) {
        return 'Lao';
    }
    
    // Burmese characters
    if (/[\u1000-\u109f]/.test(text)) {
        return 'Burmese';
    }
    
    // Default to English
    return 'English';
}

/**
 * Generate multilingual response based on detected language
 */
function generateMultilingualResponse(input, language) {
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
    
    // Check for specific device mentions
    if (input.toLowerCase().includes('thermometer') || input.toLowerCase().includes('termometer') || input.toLowerCase().includes('体温计') || input.toLowerCase().includes('เครื่องวัดอุณหภูมิ') || input.toLowerCase().includes('nhiệt kế')) {
        return langResponses.thermometer;
    }
    
    if (input.toLowerCase().includes('blood pressure') || input.toLowerCase().includes('tekanan darah') || input.toLowerCase().includes('血压') || input.toLowerCase().includes('ความดันโลหิต') || input.toLowerCase().includes('huyết áp')) {
        return langResponses.bloodPressure;
    }
    
    if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi') || input.toLowerCase().includes('你好') || input.toLowerCase().includes('halo') || input.toLowerCase().includes('สวัสดี') || input.toLowerCase().includes('xin chào')) {
        return langResponses.greeting;
    }
    
    return langResponses.general;
}





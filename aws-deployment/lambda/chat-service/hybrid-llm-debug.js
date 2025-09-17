/**
 * Hybrid LLM Service - Debug Version
 * Debug language detection issues
 */

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { messages } = body;
        
        // Extract the last user message
        const lastMessage = messages[messages.length - 1];
        const userInput = lastMessage.content;
        
        // Debug language detection
        const debugInfo = debugLanguageDetection(userInput);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: `Debug: Language detection for "${userInput}"`,
                debug: debugInfo,
                provider: {
                    provider: 'Debug Version',
                    status: 'Debug Mode',
                    note: 'Language detection debugging'
                }
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
                error: 'Debug service error',
                message: error.message
            })
        };
    }
};

/**
 * Debug language detection
 */
function debugLanguageDetection(text) {
    const debug = {
        input: text,
        length: text.length,
        charCodes: [],
        unicodeTests: {},
        detectedLanguage: 'Unknown'
    };
    
    // Get character codes
    for (let i = 0; i < Math.min(text.length, 10); i++) {
        debug.charCodes.push({
            char: text[i],
            code: text.charCodeAt(i),
            hex: text.charCodeAt(i).toString(16)
        });
    }
    
    // Test Unicode ranges
    debug.unicodeTests.chinese = /[\u4e00-\u9fff]/.test(text);
    debug.unicodeTests.thai = /[\u0e00-\u0e7f]/.test(text);
    debug.unicodeTests.vietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
    debug.unicodeTests.malay = /\b(selamat|awak|saya|anda|bagaimana|menggunakan|termometer|tekanan darah|glukosa|nebulizer|peranti|perubatan|doktor|hospital)\b/i.test(text);
    debug.unicodeTests.indonesian = /\b(halo|saya|perlu|bantuan|termometer|tekanan darah|glukosa|nebulizer|perangkat|medis|dokter|rumah sakit)\b/i.test(text);
    
    // Detect language
    if (debug.unicodeTests.chinese) {
        debug.detectedLanguage = 'Mandarin';
    } else if (debug.unicodeTests.thai) {
        debug.detectedLanguage = 'Thai';
    } else if (debug.unicodeTests.vietnamese) {
        debug.detectedLanguage = 'Vietnamese';
    } else if (debug.unicodeTests.malay) {
        debug.detectedLanguage = 'Malay';
    } else if (debug.unicodeTests.indonesian) {
        debug.detectedLanguage = 'Indonesian';
    } else {
        debug.detectedLanguage = 'English';
    }
    
    return debug;
}








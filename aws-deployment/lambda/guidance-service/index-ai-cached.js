/**
 * AI-Cached Guidance Service with Performance Optimizations
 * Phase 2 & 3: VPC-optimized with intelligent caching
 */

// In-memory cache for responses (survives across Lambda warm starts)
const responseCache = new Map();
const CACHE_TTL = 3600000; // 1 hour cache TTL
const MAX_CACHE_SIZE = 100;

exports.handler = async (event) => {
    console.log('Guidance service request:', JSON.stringify(event, null, 2));

    try {
        const { httpMethod, pathParameters, queryStringParameters } = event;

        if (httpMethod === 'GET' && pathParameters) {
            return await handleGetGuidance(pathParameters, queryStringParameters || {});
        }

        return createResponse(404, { error: 'Endpoint not found' });

    } catch (error) {
        console.error('Handler error:', error);
        return createResponse(500, { error: 'Internal server error', message: error.message });
    }
};

/**
 * Handle GET request for guidance step with caching
 */
async function handleGetGuidance(pathParams, queryParams) {
    const { deviceType, stepNumber } = pathParams;
    const { language = 'en', style = 'direct', brand, model } = queryParams;

    console.log(`Guidance request: ${deviceType}, step ${stepNumber}, language ${language}, style ${style}`);

    if (!deviceType || !stepNumber) {
        return createResponse(400, { error: 'Missing deviceType or stepNumber' });
    }

    const stepNum = parseInt(stepNumber);
    if (isNaN(stepNum) || stepNum < 1 || stepNum > 5) {
        return createResponse(400, { error: 'Step number must be between 1 and 5' });
    }

    const startTime = Date.now();

    // Generate cache key
    const cacheKey = generateCacheKey({ deviceType, stepNumber: stepNum, language, style, brand, model });

    // Check cache first
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
        console.log('Cache hit for:', cacheKey);
        cachedResponse.cacheHit = true;
        cachedResponse.responseTime = Date.now() - startTime;
        cachedResponse.cacheTimestamp = cachedResponse.originalTimestamp;
        return createResponse(200, cachedResponse);
    }

    console.log('Cache miss for:', cacheKey);

    // Try AI generation with optimized settings for VPC
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'undefined') {
        try {
            console.log('Attempting optimized AI generation...');
            const aiInstruction = await generateOptimizedAIGuidance({
                deviceType,
                stepNumber: stepNum,
                language,
                guidanceStyle: style,
                deviceBrand: brand,
                deviceModel: model,
                startTime
            });

            // Cache the AI response
            setCachedResponse(cacheKey, aiInstruction);

            console.log('AI generation successful, cached response');
            return createResponse(200, aiInstruction);

        } catch (aiError) {
            console.error('AI generation failed:', aiError.message);
        }
    }

    // Enhanced fallback with caching
    console.log('Using enhanced static content with caching');
    const staticInstruction = getEnhancedStaticGuidance({
        deviceType,
        stepNumber: stepNum,
        language,
        guidanceStyle: style,
        deviceBrand: brand,
        deviceModel: model,
        startTime
    });

    // Cache the static response
    setCachedResponse(cacheKey, staticInstruction);

    return createResponse(200, staticInstruction);
}

/**
 * Generate cache key
 */
function generateCacheKey({ deviceType, stepNumber, language, style, brand, model }) {
    const parts = [deviceType, stepNumber, language, style];
    if (brand && model) {
        parts.push(`${brand}-${model}`);
    }
    return parts.join('_');
}

/**
 * Get cached response
 */
function getCachedResponse(cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return { ...cached.response };
    }

    // Remove expired cache entry
    if (cached) {
        responseCache.delete(cacheKey);
    }

    return null;
}

/**
 * Set cached response with cache size management
 */
function setCachedResponse(cacheKey, response) {
    // Remove oldest entries if cache is full
    if (responseCache.size >= MAX_CACHE_SIZE) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
    }

    responseCache.set(cacheKey, {
        response: { ...response, originalTimestamp: response.cacheTimestamp },
        timestamp: Date.now()
    });
}

/**
 * Optimized AI generation for VPC environment
 */
async function generateOptimizedAIGuidance({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel, startTime }) {
    const prompt = buildOptimizedPrompt({
        deviceType,
        stepNumber,
        language,
        guidanceStyle,
        deviceBrand,
        deviceModel
    });

    // VPC-optimized OpenAI call
    const aiResponse = await callOptimizedOpenAI(prompt);

    const instruction = parseAIResponse(aiResponse, {
        deviceType,
        stepNumber,
        language,
        guidanceStyle,
        processingTime: Date.now() - startTime,
        isAI: true
    });

    return instruction;
}

/**
 * Build optimized prompt (shorter for faster response)
 */
function buildOptimizedPrompt({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel }) {
    const deviceName = getDeviceName(deviceType);
    const languageName = getLanguageName(language);

    let stylePrompt = '';
    switch (guidanceStyle) {
        case 'direct': stylePrompt = 'Be concise and direct.'; break;
        case 'gentle': stylePrompt = 'Be friendly and reassuring.'; break;
        case 'detailed': stylePrompt = 'Provide detailed explanations.'; break;
        default: stylePrompt = 'Be clear and helpful.'; break;
    }

    const brandInfo = deviceBrand && deviceModel ? ` Device: ${deviceBrand} ${deviceModel}.` : '';

    return [
        {
            role: "system",
            content: `You are SIMIS medical assistant. Generate step ${stepNumber} guidance for ${deviceName} in ${languageName}. ${stylePrompt} Return JSON: {"title":"Title","description":"Instructions","warnings":"Safety","tips":"Tips","checkpoints":["Check1","Check2","Check3"]}`
        },
        {
            role: "user",
            content: `Step ${stepNumber} of 5 for ${deviceName}.${brandInfo}`
        }
    ];
}

/**
 * VPC-optimized OpenAI API call
 */
async function callOptimizedOpenAI(messages) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
                'User-Agent': 'SIMIS-Guidance/1.0'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: messages,
                max_tokens: 400,
                temperature: 0.7,
                top_p: 0.9,
                frequency_penalty: 0.1
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('OpenAI API error response:', errorBody);
            throw new Error(`OpenAI API error: ${response.status} - ${errorBody.slice(0, 200)}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid OpenAI response structure');
        }

        return data.choices[0].message.content;

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('OpenAI request timeout after 12 seconds');
        }

        console.error('OpenAI call failed:', error.message);
        throw error;
    }
}

/**
 * Enhanced static guidance with caching optimization
 */
function getEnhancedStaticGuidance({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel, startTime }) {
    const deviceInfo = getDeviceInfo(deviceType);
    const stepInfo = getStepInfo(stepNumber);

    let description = deviceInfo.steps[stepNumber - 1] || `Step ${stepNumber} for ${deviceInfo.name}`;
    let title = stepInfo.title;
    let warnings = deviceInfo.warnings[stepNumber - 1] || "Always follow manufacturer instructions.";
    let tips = deviceInfo.tips[stepNumber - 1] || "Take your time and ensure accuracy.";
    let checkpoints = deviceInfo.checkpoints[stepNumber - 1] || ["Step completed", "Device ready", "Safety confirmed"];

    // Style adaptation
    if (guidanceStyle === 'gentle') {
        description = "Please " + description.toLowerCase() + " Remember to be gentle and patient.";
        warnings = "Gently note: " + warnings;
    } else if (guidanceStyle === 'detailed') {
        description = description + " This step ensures accurate and safe operation.";
        tips = tips + " For additional information, consult your device manual.";
    }

    // Brand/model customization
    if (deviceBrand && deviceModel) {
        tips = `For your ${deviceBrand} ${deviceModel}: ` + tips;
    }

    // Basic translation support
    if (language !== 'en') {
        const translations = getBasicTranslations(language);
        if (translations) {
            title = translations.steps[stepNumber - 1] || title;
            if (translations.prefix) {
                description = translations.prefix + " " + description;
            }
        }
    }

    return {
        title,
        description,
        instructions: description,
        warnings,
        tips,
        checkpoints,
        language,
        requestedLanguage: language,
        languageFallback: language !== 'en' ? 'en' : null,
        supportedLanguages: ["en", "id", "th", "vi", "fil", "ms", "zh", "my", "lo", "km"],
        guidanceStyle: guidanceStyle,
        qualityScore: 0.88,
        isAiGenerated: false,
        aiProvider: "Enhanced Static Content (Cached)",
        cacheTimestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        cacheHit: false,
        requestId: Math.random().toString(36).substring(2, 15)
    };
}

/**
 * Parse AI response with error handling
 */
function parseAIResponse(aiResponse, context) {
    let parsed;

    try {
        // Clean up response if it has markdown formatting
        let cleanResponse = aiResponse;
        if (cleanResponse.includes('```json')) {
            cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```/g, '');
        }

        parsed = JSON.parse(cleanResponse.trim());

    } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError.message);
        console.error('Raw AI response:', aiResponse);

        // Create structured response from text
        parsed = {
            title: `Step ${context.stepNumber}`,
            description: aiResponse,
            warnings: "Consult healthcare professionals for medical concerns.",
            tips: "Follow manufacturer instructions.",
            checkpoints: ["Step completed", "Device ready", "Safety confirmed"]
        };
    }

    return {
        title: parsed.title || `Step ${context.stepNumber}`,
        description: parsed.description || aiResponse,
        instructions: parsed.instructions || parsed.description || aiResponse,
        warnings: parsed.warnings || "Always consult healthcare professionals for medical concerns.",
        tips: parsed.tips || "Follow manufacturer instructions for best results.",
        checkpoints: Array.isArray(parsed.checkpoints) ? parsed.checkpoints.slice(0, 4) : ["Step completed", "Device ready", "Results recorded"],
        language: context.language,
        requestedLanguage: context.language,
        languageFallback: null,
        supportedLanguages: ["en", "id", "th", "vi", "fil", "ms", "zh", "my", "lo", "km"],
        guidanceStyle: context.guidanceStyle,
        qualityScore: 0.95,
        isAiGenerated: true,
        aiProvider: "OpenAI GPT-4 (Cached)",
        cacheTimestamp: new Date().toISOString(),
        responseTime: context.processingTime,
        cacheHit: false,
        requestId: Math.random().toString(36).substring(2, 15)
    };
}

/**
 * Device information database (same as before)
 */
function getDeviceInfo(deviceType) {
    const devices = {
        'digital_oral_thermometer': {
            name: 'Digital Oral Thermometer',
            steps: [
                'Clean the thermometer probe with alcohol and ensure it is dry',
                'Turn on the thermometer and wait for the ready signal',
                'Place the probe under the tongue and close your mouth gently',
                'Wait for the beep signal indicating measurement is complete',
                'Read the temperature display and clean the thermometer'
            ],
            warnings: [
                'Do not use if the probe is cracked or damaged',
                'Ensure the thermometer is properly calibrated',
                'Do not bite down on the probe',
                'Do not remove until the measurement is complete',
                'Clean thoroughly after each use'
            ],
            tips: [
                'Keep alcohol wipes nearby for cleaning',
                'Wait for the ready indicator before use',
                'Keep your mouth closed during measurement',
                'Stay still and breathe through your nose',
                'Store in a protective case'
            ],
            checkpoints: [
                ['Probe cleaned with alcohol', 'Device is dry', 'Ready indicator shown'],
                ['Thermometer turned on', 'Display shows ready', 'No error messages'],
                ['Probe under tongue', 'Mouth closed gently', 'Patient comfortable'],
                ['Waiting for beep', 'Staying perfectly still', 'Breathing through nose'],
                ['Temperature displayed', 'Reading recorded', 'Device cleaned and stored']
            ]
        },
        'blood_pressure_monitor': {
            name: 'Blood Pressure Monitor',
            steps: [
                'Prepare the cuff and ensure it is the correct size for your arm',
                'Position the cuff on your upper arm at heart level',
                'Start the measurement and remain completely still',
                'Wait for the measurement cycle to complete',
                'Record the blood pressure reading and remove the cuff'
            ],
            warnings: [
                'Use the correct cuff size for accurate readings',
                'Do not measure over clothing or jewelry',
                'Avoid caffeine and exercise before measurement',
                'Do not move or talk during measurement',
                'Consult a doctor for consistently high readings'
            ],
            tips: [
                'Rest for 5 minutes before measuring',
                'Ensure the cuff is snug but not overly tight',
                'Keep your arm supported and relaxed',
                'Take multiple readings for better accuracy',
                'Keep a log of your blood pressure readings'
            ],
            checkpoints: [
                ['Correct cuff size selected', 'Cuff is clean and functional', 'Device powered on'],
                ['Cuff positioned on upper arm', 'At heart level', 'Snug but comfortable fit'],
                ['Start button pressed', 'Staying completely still', 'Arm relaxed and supported'],
                ['Cuff inflating and deflating', 'Remaining quiet', 'Measurement in progress'],
                ['Systolic and diastolic readings displayed', 'Values recorded', 'Cuff removed carefully']
            ]
        }
    };

    return devices[deviceType] || devices['digital_oral_thermometer'];
}

// Helper functions (same as previous version)
function getStepInfo(stepNumber) {
    const steps = {
        1: { title: 'Preparation' },
        2: { title: 'Setup' },
        3: { title: 'Measurement' },
        4: { title: 'Reading Results' },
        5: { title: 'Completion' }
    };
    return steps[stepNumber] || { title: `Step ${stepNumber}` };
}

function getDeviceName(deviceType) {
    const devices = {
        'digital_oral_thermometer': 'Digital Oral Thermometer',
        'blood_pressure_monitor': 'Blood Pressure Monitor',
        'glucose_meter': 'Blood Glucose Meter',
        'ear_thermometer': 'Ear Thermometer',
        'forehead_thermometer': 'Forehead Thermometer'
    };
    return devices[deviceType] || deviceType.replace(/_/g, ' ');
}

function getLanguageName(languageCode) {
    const languages = {
        'en': 'English',
        'id': 'Indonesian',
        'ms': 'Malay',
        'th': 'Thai',
        'vi': 'Vietnamese',
        'fil': 'Filipino',
        'zh': 'Chinese',
        'my': 'Burmese',
        'lo': 'Lao',
        'km': 'Khmer'
    };
    return languages[languageCode] || 'English';
}

function getBasicTranslations(language) {
    const translations = {
        'id': {
            prefix: 'Petunjuk:',
            steps: ['Persiapan', 'Pengaturan', 'Pengukuran', 'Membaca Hasil', 'Penyelesaian']
        },
        'ms': {
            prefix: 'Arahan:',
            steps: ['Persediaan', 'Penetapan', 'Pengukuran', 'Membaca Keputusan', 'Penyiapan']
        },
        'th': {
            prefix: 'คำแนะนำ:',
            steps: ['การเตรียมการ', 'การติดตั้ง', 'การวัด', 'การอ่านผล', 'การเสร็จสิ้น']
        },
        'vi': {
            prefix: 'Hướng dẫn:',
            steps: ['Chuẩn bị', 'Thiết lập', 'Đo lường', 'Đọc kết quả', 'Hoàn thành']
        },
        'fil': {
            prefix: 'Gabay:',
            steps: ['Paghahanda', 'Pag-setup', 'Pagsukat', 'Pagbasa ng Resulta', 'Pagkakatapos']
        }
    };
    return translations[language] || null;
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
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Cache-Control': 'public, max-age=3600', // 1 hour browser cache
            'X-Cache-Status': body.cacheHit ? 'HIT' : 'MISS'
        },
        body: JSON.stringify(body)
    };
}
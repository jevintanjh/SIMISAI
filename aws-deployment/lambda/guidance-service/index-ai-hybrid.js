/**
 * Hybrid AI-Database Guidance Service
 * Try AI first, fallback to enhanced static content if AI fails
 */

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
 * Handle GET request for guidance step
 */
async function handleGetGuidance(pathParams, queryParams) {
    const { deviceType, stepNumber } = pathParams;
    const { language = 'en', style = 'direct', brand, model } = queryParams;

    console.log(`Generating guidance for: ${deviceType}, step ${stepNumber}, language ${language}, style ${style}`);

    if (!deviceType || !stepNumber) {
        return createResponse(400, { error: 'Missing deviceType or stepNumber' });
    }

    const stepNum = parseInt(stepNumber);
    if (isNaN(stepNum) || stepNum < 1 || stepNum > 5) {
        return createResponse(400, { error: 'Step number must be between 1 and 5' });
    }

    const startTime = Date.now();

    // Try AI first if OpenAI key is available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'undefined') {
        try {
            console.log('Attempting AI generation...');
            const aiInstruction = await generateAIGuidance({
                deviceType,
                stepNumber: stepNum,
                language,
                guidanceStyle: style,
                deviceBrand: brand,
                deviceModel: model,
                startTime
            });

            console.log('AI generation successful');
            return createResponse(200, aiInstruction);

        } catch (aiError) {
            console.error('AI generation failed, falling back to enhanced static:', aiError.message);
        }
    }

    // Fallback to enhanced static content
    console.log('Using enhanced static content');
    const staticInstruction = getEnhancedStaticGuidance({
        deviceType,
        stepNumber: stepNum,
        language,
        guidanceStyle: style,
        deviceBrand: brand,
        deviceModel: model,
        startTime
    });

    return createResponse(200, staticInstruction);
}

/**
 * Generate guidance using OpenAI (with timeout and error handling)
 */
async function generateAIGuidance({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel, startTime }) {
    // Build AI prompt
    const prompt = buildGuidancePrompt({
        deviceType,
        stepNumber,
        language,
        guidanceStyle,
        deviceBrand,
        deviceModel
    });

    // Call OpenAI with shorter timeout for Lambda
    const aiResponse = await callOpenAI(prompt);

    // Parse and format response
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
 * Get enhanced static guidance (improved fallback)
 */
function getEnhancedStaticGuidance({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel, startTime }) {
    const deviceInfo = getDeviceInfo(deviceType);
    const stepInfo = getStepInfo(stepNumber);

    // Enhanced static content with context awareness
    let description = deviceInfo.steps[stepNumber - 1] || `Step ${stepNumber} for ${deviceInfo.name}`;
    let title = stepInfo.title;
    let warnings = deviceInfo.warnings[stepNumber - 1] || "Always follow manufacturer instructions.";
    let tips = deviceInfo.tips[stepNumber - 1] || "Take your time and ensure accuracy.";
    let checkpoints = deviceInfo.checkpoints[stepNumber - 1] || ["Step completed", "Device ready", "Safety confirmed"];

    // Adjust based on guidance style
    if (guidanceStyle === 'gentle') {
        description = "Please " + description.toLowerCase() + " Remember to be gentle and patient with yourself.";
        warnings = "Gently note: " + warnings;
    } else if (guidanceStyle === 'detailed') {
        description = description + " This step is important for ensuring accurate results and safe operation.";
        tips = tips + " For additional details, consult your device manual.";
    }

    // Add brand/model specific notes
    if (deviceBrand && deviceModel) {
        tips = `For your ${deviceBrand} ${deviceModel}: ` + tips;
    }

    // Translate basic content if not English
    if (language !== 'en') {
        const translations = getBasicTranslations(language);
        if (translations) {
            title = translations.steps[stepNumber - 1] || title;
            // Keep description in English for now, but add translated prefix
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
        qualityScore: 0.85,
        isAiGenerated: false,
        aiProvider: "Enhanced Static Content",
        cacheTimestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        cacheHit: false,
        requestId: Math.random().toString(36).substring(2, 15)
    };
}

/**
 * Build guidance prompt for AI
 */
function buildGuidancePrompt({ deviceType, stepNumber, language, guidanceStyle, deviceBrand, deviceModel }) {
    const deviceName = getDeviceName(deviceType);
    const stepName = getStepName(stepNumber);
    const languageName = getLanguageName(language);

    let styleInstructions = '';
    switch (guidanceStyle) {
        case 'direct':
            styleInstructions = 'Be concise and direct. Use clear, actionable steps.';
            break;
        case 'gentle':
            styleInstructions = 'Be friendly and reassuring. Use encouraging language.';
            break;
        case 'detailed':
            styleInstructions = 'Provide comprehensive explanations with context.';
            break;
        default:
            styleInstructions = 'Be clear and helpful.';
    }

    const brandInfo = deviceBrand && deviceModel ? ` The device is a ${deviceBrand} ${deviceModel}.` : '';

    return [
        {
            role: "system",
            content: `You are SIMIS, a medical device assistant. Generate guidance for step ${stepNumber} of using a ${deviceName}.

Requirements:
- Respond in ${languageName}
- ${styleInstructions}
- Be medically accurate
- Include 3-4 checkpoints
- Keep under 150 words

Return JSON: {"title":"Step title","description":"Instructions","warnings":"Safety notes","tips":"Helpful tips","checkpoints":["Check 1","Check 2","Check 3"]}`
        },
        {
            role: "user",
            content: `Step ${stepNumber} (${stepName}) for ${deviceName}.${brandInfo} This is step ${stepNumber} of 5 total steps.`
        }
    ];
}

/**
 * Call OpenAI API with Lambda-optimized settings
 */
async function callOpenAI(messages) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for Lambda

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: messages,
                max_tokens: 300,
                temperature: 0.7
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Parse AI response
 */
function parseAIResponse(aiResponse, context) {
    let parsed;

    try {
        parsed = JSON.parse(aiResponse);
    } catch (e) {
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
        checkpoints: Array.isArray(parsed.checkpoints) ? parsed.checkpoints : ["Step completed", "Device ready", "Results recorded"],
        language: context.language,
        requestedLanguage: context.language,
        languageFallback: null,
        supportedLanguages: ["en", "id", "th", "vi", "fil", "ms", "zh", "my", "lo", "km"],
        guidanceStyle: context.guidanceStyle,
        qualityScore: 0.95,
        isAiGenerated: true,
        aiProvider: "OpenAI GPT-4",
        cacheTimestamp: new Date().toISOString(),
        responseTime: context.processingTime,
        cacheHit: false,
        requestId: Math.random().toString(36).substring(2, 15)
    };
}

/**
 * Device information database
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
                ['Probe cleaned', 'Device is dry', 'Ready to use'],
                ['Thermometer on', 'Display shows ready', 'No error messages'],
                ['Probe under tongue', 'Mouth closed', 'Patient comfortable'],
                ['Waiting for beep', 'Staying still', 'Breathing through nose'],
                ['Temperature read', 'Device cleaned', 'Stored safely']
            ]
        },
        'blood_pressure_monitor': {
            name: 'Blood Pressure Monitor',
            steps: [
                'Prepare the cuff and ensure it is the correct size',
                'Position the cuff on your upper arm at heart level',
                'Start the measurement and remain still',
                'Wait for the measurement to complete',
                'Record the blood pressure reading and remove the cuff'
            ],
            warnings: [
                'Use the correct cuff size for accurate readings',
                'Do not measure over clothing',
                'Avoid caffeine before measurement',
                'Do not move or talk during measurement',
                'Consult a doctor for concerning readings'
            ],
            tips: [
                'Rest for 5 minutes before measuring',
                'Ensure the cuff is snug but not tight',
                'Keep your arm supported and relaxed',
                'Take multiple readings for accuracy',
                'Keep a record of your readings'
            ],
            checkpoints: [
                ['Correct cuff size', 'Cuff is clean', 'Device ready'],
                ['Cuff on upper arm', 'At heart level', 'Snug fit'],
                ['Start button pressed', 'Staying still', 'Arm relaxed'],
                ['Measurement in progress', 'Remaining quiet', 'Cuff inflating/deflating'],
                ['Reading displayed', 'Values recorded', 'Cuff removed']
            ]
        }
    };

    return devices[deviceType] || devices['digital_oral_thermometer'];
}

/**
 * Helper functions
 */
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
        'glucose_meter': 'Blood Glucose Meter'
    };
    return devices[deviceType] || deviceType;
}

function getStepName(stepNumber) {
    const steps = {
        1: 'Preparation',
        2: 'Setup',
        3: 'Measurement',
        4: 'Reading Results',
        5: 'Completion'
    };
    return steps[stepNumber] || `Step ${stepNumber}`;
}

function getLanguageName(languageCode) {
    const languages = {
        'en': 'English',
        'id': 'Indonesian',
        'ms': 'Malay',
        'th': 'Thai',
        'vi': 'Vietnamese',
        'fil': 'Filipino'
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
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify(body)
    };
}
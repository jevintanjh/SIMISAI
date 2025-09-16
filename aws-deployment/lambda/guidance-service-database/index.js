/**
 * AI-Generated Guidance Service Lambda Function - Database Optimized
 * 
 * Features:
 * - PostgreSQL database lookup for pre-generated content
 * - Sub-100ms response times for cached content
 * - AI fallback for missing content
 * - Comprehensive performance monitoring
 * - Multi-language support with cultural context
 */

const { Pool } = require('pg');
const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');

// Database connection pool
const dbPool = new Pool({
    host: process.env.DB_HOST || 'simisai-production-db.xxx.us-east-1.rds.amazonaws.com',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'simisai_guidance',
    user: process.env.DB_USER || 'simis_guidance_app',
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,                    // Maximum connections
    idleTimeoutMillis: 30000,   // 30 seconds
    connectionTimeoutMillis: 2000, // 2 seconds
    statement_timeout: 5000,    // 5 seconds
    query_timeout: 10000,       // 10 seconds
});

// AI clients
const sagemakerClient = new SageMakerRuntimeClient({ region: 'us-east-1' });
const ENDPOINT_NAME = 'simisai-sealion-realtime-endpoint';

// Performance tracking
const performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    aiGenerations: 0,
    fallbackResponses: 0,
    totalRequests: 0,
    avgResponseTime: 0
};

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
    const startTime = Date.now();
    const requestId = event.requestContext?.requestId || 'unknown';
    
    try {
        console.log(`[${requestId}] Guidance request received:`, JSON.stringify(event, null, 2));
        
        // Parse request
        const { httpMethod, pathParameters, queryStringParameters } = event;
        
        if (httpMethod === 'GET') {
            return await handleGetGuidance(pathParameters, queryStringParameters, requestId, startTime);
        } else if (httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            return await handleGenerateGuidance(body, requestId, startTime);
        } else {
            return createResponse(405, { error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error(`[${requestId}] Error in guidance service:`, error);
        
        // Log error for monitoring
        await logError({
            requestId,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        return createResponse(500, { 
            error: 'Internal server error',
            requestId 
        });
    }
};

/**
 * Handle GET request for guidance
 */
async function handleGetGuidance(pathParameters, queryStringParameters, requestId, startTime) {
    const { deviceType, stepNumber } = pathParameters || {};
    const { language = 'en', style = 'direct' } = queryStringParameters || {};
    
    // Validate parameters
    if (!deviceType || !stepNumber) {
        return createResponse(400, { error: 'Missing required parameters: deviceType, stepNumber' });
    }
    
    const stepNum = parseInt(stepNumber);
    if (isNaN(stepNum) || stepNum < 1 || stepNum > 10) {
        return createResponse(400, { error: 'Invalid stepNumber: must be between 1 and 10' });
    }
    
    try {
        // Attempt database lookup first
        const cachedGuidance = await getCachedGuidance(deviceType, stepNum, language, style);
        
        if (cachedGuidance) {
            // Cache hit - return immediately
            performanceMetrics.cacheHits++;
            performanceMetrics.totalRequests++;
            
            const responseTime = Date.now() - startTime;
            await logRequest({
                requestId,
                deviceType,
                stepNumber: stepNum,
                language,
                style,
                responseTime,
                cacheHit: true,
                requestType: 'cache_hit'
            });
            
            console.log(`[${requestId}] Cache hit - Response time: ${responseTime}ms`);
            
            return createResponse(200, {
                ...cachedGuidance,
                responseTime,
                cacheHit: true,
                requestId
            });
        }
        
        // Cache miss - check if we should generate or use fallback
        performanceMetrics.cacheMisses++;
        
        const shouldGenerate = await shouldGenerateContent(deviceType, stepNum, language, style);
        
        if (shouldGenerate) {
            // Generate new content using AI
            const generatedGuidance = await generateAndCacheGuidance(
                deviceType, stepNum, language, style, requestId, startTime
            );
            
            if (generatedGuidance) {
                return createResponse(200, {
                    ...generatedGuidance,
                    responseTime: Date.now() - startTime,
                    cacheHit: false,
                    aiGenerated: true,
                    requestId
                });
            }
        }
        
        // Use fallback content
        performanceMetrics.fallbackResponses++;
        const fallbackGuidance = await getFallbackGuidance(deviceType, stepNum, language);
        
        // Log missing guidance request for future generation
        await logMissingGuidanceRequest(deviceType, stepNum, language, style);
        
        const responseTime = Date.now() - startTime;
        await logRequest({
            requestId,
            deviceType,
            stepNumber: stepNum,
            language,
            style,
            responseTime,
            cacheHit: false,
            requestType: 'fallback'
        });
        
        console.log(`[${requestId}] Fallback response - Response time: ${responseTime}ms`);
        
        return createResponse(200, {
            ...fallbackGuidance,
            responseTime,
            cacheHit: false,
            fallback: true,
            requestId
        });
        
    } catch (error) {
        console.error(`[${requestId}] Error in handleGetGuidance:`, error);
        
        // Return emergency fallback
        const emergencyGuidance = getEmergencyFallback(deviceType, stepNum, language);
        
        return createResponse(200, {
            ...emergencyGuidance,
            responseTime: Date.now() - startTime,
            cacheHit: false,
            emergency: true,
            requestId,
            warning: 'Using emergency fallback due to system error'
        });
    }
}

/**
 * Get cached guidance from database
 */
async function getCachedGuidance(deviceType, stepNumber, language, style) {
    try {
        const query = `
            SELECT 
                gc.step_title,
                gc.step_description,
                gc.step_instructions,
                gc.step_warnings,
                gc.step_tips,
                gc.generation_quality_score as quality_score,
                gc.is_ai_generated,
                gc.generated_by_ai_provider as ai_provider,
                gc.generated_at as cache_timestamp
            FROM guidance_content gc
            JOIN device_types dt ON gc.device_id = dt.device_id
            JOIN supported_languages sl ON gc.language_id = sl.language_id
            JOIN guidance_styles gs ON gc.style_id = gs.style_id
            JOIN guidance_steps gst ON gc.step_id = gst.step_id
            WHERE dt.device_key = $1
              AND gst.step_number = $2
              AND sl.language_code = $3
              AND gs.style_key = $4
              AND gc.is_cached = TRUE
            LIMIT 1
        `;
        
        const result = await dbPool.query(query, [deviceType, stepNumber, language, style]);
        
        if (result.rows.length > 0) {
            const row = result.rows[0];
            return {
                title: row.step_title,
                description: row.step_description,
                instructions: row.step_instructions,
                warnings: row.step_warnings,
                tips: row.step_tips,
                qualityScore: parseFloat(row.quality_score),
                isAiGenerated: row.is_ai_generated,
                aiProvider: row.ai_provider,
                cacheTimestamp: row.cache_timestamp
            };
        }
        
        return null;
        
    } catch (error) {
        console.error('Error getting cached guidance:', error);
        return null;
    }
}

/**
 * Check if we should generate new content
 */
async function shouldGenerateContent(deviceType, stepNumber, language, style) {
    try {
        // Check if content is already being generated
        const query = `
            SELECT generation_status, generation_attempts
            FROM missing_guidance_requests mgr
            JOIN device_types dt ON mgr.device_type_id = dt.id
            JOIN supported_languages sl ON mgr.language_id = sl.id
            JOIN guidance_styles gst ON mgr.style_id = gst.id
            WHERE dt.device_key = $1
              AND mgr.step_number = $2
              AND sl.language_code = $3
              AND gst.style_key = $4
        `;
        
        const result = await dbPool.query(query, [deviceType, stepNumber, language, style]);
        
        if (result.rows.length > 0) {
            const row = result.rows[0];
            
            // Don't generate if already being processed or failed too many times
            if (row.generation_status === 'processing' || row.generation_attempts >= 3) {
                return false;
            }
        }
        
        // Check generation limits and costs
        const shouldGenerate = await checkGenerationLimits(language);
        return shouldGenerate;
        
    } catch (error) {
        console.error('Error checking generation requirements:', error);
        return false; // Default to not generating on error
    }
}

/**
 * Check generation limits and costs
 */
async function checkGenerationLimits(language) {
    try {
        // Check daily generation limits
        const query = `
            SELECT COUNT(*) as daily_generations
            FROM guidance_generation_log
            WHERE language_id = (SELECT id FROM supported_languages WHERE language_code = $1)
              AND DATE(created_at) = CURRENT_DATE
              AND request_type = 'ai_generated'
        `;
        
        const result = await dbPool.query(query, [language]);
        const dailyGenerations = parseInt(result.rows[0].daily_generations);
        
        // Limit daily generations per language to 100
        if (dailyGenerations >= 100) {
            console.log(`Daily generation limit reached for ${language}: ${dailyGenerations}`);
            return false;
        }
        
        return true;
        
    } catch (error) {
        console.error('Error checking generation limits:', error);
        return false;
    }
}

/**
 * Generate and cache new guidance content
 */
async function generateAndCacheGuidance(deviceType, stepNumber, language, style, requestId, startTime) {
    try {
        console.log(`[${requestId}] Generating new guidance content...`);
        
        // Mark as processing
        await markGenerationProcessing(deviceType, stepNumber, language, style);
        
        // Generate content using AI
        const generatedContent = await generateGuidanceWithAI(deviceType, stepNumber, language, style);
        
        if (generatedContent) {
            // Store in database
            const storedContent = await storeGeneratedGuidance(
                deviceType, stepNumber, language, style, generatedContent
            );
            
            if (storedContent) {
                performanceMetrics.aiGenerations++;
                
                const responseTime = Date.now() - startTime;
                await logRequest({
                    requestId,
                    deviceType,
                    stepNumber,
                    language,
                    style,
                    responseTime,
                    cacheHit: false,
                    requestType: 'ai_generated',
                    aiProvider: generatedContent.aiProvider,
                    tokensUsed: generatedContent.tokensUsed,
                    qualityScore: generatedContent.qualityScore
                });
                
                console.log(`[${requestId}] Generated and cached guidance - Response time: ${responseTime}ms`);
                
                return {
                    title: storedContent.step_title,
                    description: storedContent.step_description,
                    instructions: storedContent.step_instructions,
                    warnings: storedContent.step_warnings,
                    tips: storedContent.step_tips,
                    qualityScore: storedContent.quality_score,
                    isAiGenerated: true,
                    aiProvider: storedContent.ai_provider
                };
            }
        }
        
        // Mark generation as failed
        await markGenerationFailed(deviceType, stepNumber, language, style);
        return null;
        
    } catch (error) {
        console.error(`[${requestId}] Error generating guidance:`, error);
        await markGenerationFailed(deviceType, stepNumber, language, style);
        return null;
    }
}

/**
 * Generate guidance using AI
 */
async function generateGuidanceWithAI(deviceType, stepNumber, language, style) {
    try {
        // Try SEA-LION first, then OpenAI fallback
        let result = await trySEALIONGeneration(deviceType, stepNumber, language, style);
        
        if (!result) {
            result = await tryOpenAIGeneration(deviceType, stepNumber, language, style);
        }
        
        if (!result) {
            result = await tryAISingaporeGeneration(deviceType, stepNumber, language, style);
        }
        
        return result;
        
    } catch (error) {
        console.error('Error in AI generation:', error);
        return null;
    }
}

/**
 * Try SEA-LION generation
 */
async function trySEALIONGeneration(deviceType, stepNumber, language, style) {
    try {
        const prompt = buildSEALIONPrompt(deviceType, stepNumber, language, style);
        
        const command = new InvokeEndpointCommand({
            EndpointName: ENDPOINT_NAME,
            ContentType: 'application/json',
            Body: JSON.stringify({ prompt })
        });
        
        const response = await sagemakerClient.send(command);
        const result = JSON.parse(Buffer.from(response.Body).toString());
        
        if (result && result.response) {
            const parsedResponse = parseSEALIONResponse(result.response);
            return {
                ...parsedResponse,
                aiProvider: 'SEA-LION',
                tokensUsed: estimateTokens(prompt + result.response),
                qualityScore: assessQuality(parsedResponse)
            };
        }
        
        return null;
        
    } catch (error) {
        console.error('SEA-LION generation failed:', error);
        return null;
    }
}

/**
 * Try OpenAI generation
 */
async function tryOpenAIGeneration(deviceType, stepNumber, language, style) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.log('OpenAI API key not configured');
            return null;
        }
        
        const messages = [
            {
                role: 'system',
                content: buildSystemPrompt(deviceType, language, style)
            },
            {
                role: 'user',
                content: `Generate step ${stepNumber} guidance for ${deviceType} in ${language} with ${style} style.`
            }
        ];
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const content = data.choices[0].message.content;
            const parsedResponse = parseOpenAIResponse(content);
            
            return {
                ...parsedResponse,
                aiProvider: 'OpenAI',
                tokensUsed: data.usage?.total_tokens || 0,
                qualityScore: assessQuality(parsedResponse)
            };
        }
        
        return null;
        
    } catch (error) {
        console.error('OpenAI generation failed:', error);
        return null;
    }
}

/**
 * Try AI Singapore generation
 */
async function tryAISingaporeGeneration(deviceType, stepNumber, language, style) {
    try {
        const apiKey = process.env.AI_SINGAPORE_API_KEY;
        if (!apiKey) {
            console.log('AI Singapore API key not configured');
            return null;
        }
        
        const prompt = buildAISingaporePrompt(deviceType, stepNumber, language, style);
        
        const response = await fetch('https://api.aisingapore.org/v1/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sealion-v3.5-8b-instruct',
                prompt: prompt,
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const content = data.choices[0].text;
            const parsedResponse = parseAISingaporeResponse(content);
            
            return {
                ...parsedResponse,
                aiProvider: 'AI Singapore',
                tokensUsed: estimateTokens(prompt + content),
                qualityScore: assessQuality(parsedResponse)
            };
        }
        
        return null;
        
    } catch (error) {
        console.error('AI Singapore generation failed:', error);
        return null;
    }
}

/**
 * Store generated guidance in database
 */
async function storeGeneratedGuidance(deviceType, stepNumber, language, style, content) {
    try {
        const query = `
            INSERT INTO guidance_steps (
                device_type_id, step_number, language_id, style_id,
                step_title, step_description, step_instructions,
                step_warnings, step_tips, is_ai_generated,
                ai_provider, generation_timestamp, quality_score
            )
            SELECT 
                dt.id, $2, sl.id, gst.id,
                $5, $6, $7, $8, $9, TRUE,
                $10, CURRENT_TIMESTAMP, $11
            FROM device_types dt
            CROSS JOIN supported_languages sl
            CROSS JOIN guidance_styles gst
            WHERE dt.device_key = $1
              AND sl.language_code = $3
              AND gst.style_key = $4
            ON CONFLICT (device_type_id, step_number, language_id, style_id)
            DO UPDATE SET
                step_title = EXCLUDED.step_title,
                step_description = EXCLUDED.step_description,
                step_instructions = EXCLUDED.step_instructions,
                step_warnings = EXCLUDED.step_warnings,
                step_tips = EXCLUDED.step_tips,
                is_ai_generated = EXCLUDED.is_ai_generated,
                ai_provider = EXCLUDED.ai_provider,
                generation_timestamp = EXCLUDED.generation_timestamp,
                quality_score = EXCLUDED.quality_score,
                cache_timestamp = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            RETURNING step_title, step_description, step_instructions, 
                     step_warnings, step_tips, quality_score, ai_provider
        `;
        
        const result = await dbPool.query(query, [
            deviceType,
            stepNumber,
            language,
            style,
            content.title,
            content.description,
            content.instructions,
            content.warnings,
            content.tips,
            content.aiProvider,
            content.qualityScore
        ]);
        
        if (result.rows.length > 0) {
            // Mark missing request as completed
            await markGenerationCompleted(deviceType, stepNumber, language, style);
            return result.rows[0];
        }
        
        return null;
        
    } catch (error) {
        console.error('Error storing generated guidance:', error);
        return null;
    }
}

/**
 * Get fallback guidance content
 */
async function getFallbackGuidance(deviceType, stepNumber, language) {
    // Try to get any available guidance for this device/step/language
    try {
        const query = `
            SELECT 
                step_title,
                step_description,
                step_instructions,
                step_warnings,
                step_tips,
                quality_score
            FROM guidance_complete
            WHERE device_key = $1
              AND step_number = $2
              AND language_code = $3
            ORDER BY quality_score DESC, cache_timestamp DESC
            LIMIT 1
        `;
        
        const result = await dbPool.query(query, [deviceType, stepNumber, language]);
        
        if (result.rows.length > 0) {
            const row = result.rows[0];
            return {
                title: row.step_title,
                description: row.step_description,
                instructions: row.step_instructions,
                warnings: row.step_warnings,
                tips: row.step_tips,
                qualityScore: parseFloat(row.quality_score),
                fallback: true
            };
        }
        
        // If no language-specific content, try English
        if (language !== 'en') {
            return await getFallbackGuidance(deviceType, stepNumber, 'en');
        }
        
        // Last resort: emergency fallback
        return getEmergencyFallback(deviceType, stepNumber, language);
        
    } catch (error) {
        console.error('Error getting fallback guidance:', error);
        return getEmergencyFallback(deviceType, stepNumber, language);
    }
}

/**
 * Get emergency fallback content
 */
function getEmergencyFallback(deviceType, stepNumber, language) {
    const emergencyContent = {
        'blood_pressure_monitor': {
            1: { title: 'Prepare Device', description: 'Ensure the blood pressure monitor is ready for use.' },
            2: { title: 'Position Cuff', description: 'Place the cuff correctly on your arm.' },
            3: { title: 'Start Measurement', description: 'Begin the blood pressure measurement.' },
            4: { title: 'Wait for Results', description: 'Remain still while the measurement completes.' },
            5: { title: 'Read Results', description: 'Read and record the blood pressure values.' }
        },
        'digital_oral_thermometer': {
            1: { title: 'Prepare Thermometer', description: 'Ensure the thermometer is clean and ready.' },
            2: { title: 'Turn On Device', description: 'Power on the thermometer and wait for readiness.' },
            3: { title: 'Position Under Tongue', description: 'Place the thermometer tip under your tongue.' },
            4: { title: 'Wait for Reading', description: 'Keep the thermometer in place until measurement completes.' },
            5: { title: 'Read and Clean', description: 'Read the temperature and clean the device.' }
        }
    };
    
    const deviceContent = emergencyContent[deviceType] || emergencyContent['digital_oral_thermometer'];
    const stepContent = deviceContent[stepNumber] || deviceContent[1];
    
    return {
        title: stepContent.title,
        description: stepContent.description,
        instructions: stepContent.description,
        warnings: 'Please consult a healthcare professional for detailed guidance.',
        tips: 'This is emergency fallback content. The system is working to provide better guidance.',
        qualityScore: 0.3,
        emergency: true
    };
}

/**
 * Utility functions for prompt building and response parsing
 */
function buildSEALIONPrompt(deviceType, stepNumber, language, style) {
    const languagePrompts = {
        'id': 'Jawab dalam bahasa Indonesia untuk perangkat medis.',
        'th': 'ตอบเป็นภาษาไทยสำหรับอุปกรณ์ทางการแพทย์',
        'fil': 'Sagutin sa Filipino para sa medical device.',
        'vi': 'Trả lời bằng tiếng Việt cho thiết bị y tế.',
        'en': 'Answer in English for medical device guidance.'
    };
    
    const stylePrompts = {
        'direct': 'Use direct, concise instructions.',
        'gentle': 'Use a gentle, reassuring tone.',
        'detailed': 'Provide detailed, step-by-step guidance.',
        'quick': 'Provide brief, essential steps only.',
        'visual': 'Optimize for visual learners.'
    };
    
    return `Generate step ${stepNumber} guidance for ${deviceType}. ${languagePrompts[language] || languagePrompts['en']} ${stylePrompts[style] || stylePrompts['direct']}`;
}

function buildSystemPrompt(deviceType, language, style) {
    return `You are SIMIS, a medical device assistant. Generate guidance for ${deviceType} in ${language} with ${style} style. Be accurate, clear, and helpful.`;
}

function buildAISingaporePrompt(deviceType, stepNumber, language, style) {
    return `Generate step ${stepNumber} guidance for ${deviceType} in ${language} with ${style} style.`;
}

function parseSEALIONResponse(response) {
    // Parse SEA-LION response format
    return {
        title: extractTitle(response) || 'Guidance Step',
        description: extractDescription(response) || response.substring(0, 100),
        instructions: response,
        warnings: extractWarnings(response),
        tips: extractTips(response)
    };
}

function parseOpenAIResponse(response) {
    // Parse OpenAI response format
    return {
        title: extractTitle(response) || 'Guidance Step',
        description: extractDescription(response) || response.substring(0, 100),
        instructions: response,
        warnings: extractWarnings(response),
        tips: extractTips(response)
    };
}

function parseAISingaporeResponse(response) {
    // Parse AI Singapore response format
    return {
        title: extractTitle(response) || 'Guidance Step',
        description: extractDescription(response) || response.substring(0, 100),
        instructions: response,
        warnings: extractWarnings(response),
        tips: extractTips(response)
    };
}

function extractTitle(text) {
    const titleMatch = text.match(/^(.*?)(?:\n|\.)/);
    return titleMatch ? titleMatch[1].trim() : null;
}

function extractDescription(text) {
    const descMatch = text.match(/Description[:\s]*(.*?)(?:\n|$)/i);
    return descMatch ? descMatch[1].trim() : null;
}

function extractWarnings(text) {
    const warningMatch = text.match(/Warning[:\s]*(.*?)(?:\n|$)/i);
    return warningMatch ? warningMatch[1].trim() : null;
}

function extractTips(text) {
    const tipMatch = text.match(/Tip[:\s]*(.*?)(?:\n|$)/i);
    return tipMatch ? tipMatch[1].trim() : null;
}

function assessQuality(content) {
    // Simple quality assessment based on content length and structure
    let score = 0.5; // Base score
    
    if (content.title && content.title.length > 5) score += 0.1;
    if (content.description && content.description.length > 20) score += 0.1;
    if (content.instructions && content.instructions.length > 50) score += 0.2;
    if (content.warnings) score += 0.1;
    if (content.tips) score += 0.1;
    
    return Math.min(score, 1.0);
}

function estimateTokens(text) {
    // Rough token estimation (4 characters per token)
    return Math.ceil(text.length / 4);
}

/**
 * Database utility functions
 */
async function markGenerationProcessing(deviceType, stepNumber, language, style) {
    try {
        const query = `
            UPDATE missing_guidance_requests 
            SET generation_status = 'processing',
                generation_attempts = generation_attempts + 1,
                last_generation_attempt = CURRENT_TIMESTAMP
            FROM device_types dt, supported_languages sl, guidance_styles gst
            WHERE missing_guidance_requests.device_type_id = dt.id
              AND missing_guidance_requests.language_id = sl.id
              AND missing_guidance_requests.style_id = gst.id
              AND dt.device_key = $1
              AND missing_guidance_requests.step_number = $2
              AND sl.language_code = $3
              AND gst.style_key = $4
        `;
        
        await dbPool.query(query, [deviceType, stepNumber, language, style]);
    } catch (error) {
        console.error('Error marking generation as processing:', error);
    }
}

async function markGenerationCompleted(deviceType, stepNumber, language, style) {
    try {
        const query = `
            UPDATE missing_guidance_requests 
            SET generation_status = 'completed'
            FROM device_types dt, supported_languages sl, guidance_styles gst
            WHERE missing_guidance_requests.device_type_id = dt.id
              AND missing_guidance_requests.language_id = sl.id
              AND missing_guidance_requests.style_id = gst.id
              AND dt.device_key = $1
              AND missing_guidance_requests.step_number = $2
              AND sl.language_code = $3
              AND gst.style_key = $4
        `;
        
        await dbPool.query(query, [deviceType, stepNumber, language, style]);
    } catch (error) {
        console.error('Error marking generation as completed:', error);
    }
}

async function markGenerationFailed(deviceType, stepNumber, language, style) {
    try {
        const query = `
            UPDATE missing_guidance_requests 
            SET generation_status = 'failed'
            FROM device_types dt, supported_languages sl, guidance_styles gst
            WHERE missing_guidance_requests.device_type_id = dt.id
              AND missing_guidance_requests.language_id = sl.id
              AND missing_guidance_requests.style_id = gst.id
              AND dt.device_key = $1
              AND missing_guidance_requests.step_number = $2
              AND sl.language_code = $3
              AND gst.style_key = $4
        `;
        
        await dbPool.query(query, [deviceType, stepNumber, language, style]);
    } catch (error) {
        console.error('Error marking generation as failed:', error);
    }
}

async function logMissingGuidanceRequest(deviceType, stepNumber, language, style) {
    try {
        const query = `
            INSERT INTO missing_guidance_requests (device_type_id, step_number, language_id, style_id)
            SELECT dt.id, $2, sl.id, gst.id
            FROM device_types dt
            CROSS JOIN supported_languages sl
            CROSS JOIN guidance_styles gst
            WHERE dt.device_key = $1
              AND sl.language_code = $3
              AND gst.style_key = $4
            ON CONFLICT (device_type_id, step_number, language_id, style_id)
            DO UPDATE SET 
                request_count = missing_guidance_requests.request_count + 1,
                last_requested_at = CURRENT_TIMESTAMP,
                priority_score = missing_guidance_requests.priority_score + 1
        `;
        
        await dbPool.query(query, [deviceType, stepNumber, language, style]);
    } catch (error) {
        console.error('Error logging missing guidance request:', error);
    }
}

async function logRequest(requestData) {
    try {
        const query = `
            INSERT INTO guidance_generation_log (
                device_type_id, step_number, language_id, style_id,
                request_type, ai_provider, generation_time_ms, tokens_used,
                quality_score, cache_hit, created_at
            )
            SELECT 
                dt.id, $2, sl.id, gst.id,
                $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP
            FROM device_types dt
            CROSS JOIN supported_languages sl
            CROSS JOIN guidance_styles gst
            WHERE dt.device_key = $1
              AND sl.language_code = $3
              AND gst.style_key = $4
        `;
        
        await dbPool.query(query, [
            requestData.deviceType,
            requestData.stepNumber,
            requestData.language,
            requestData.style,
            requestData.requestType,
            requestData.aiProvider || null,
            requestData.responseTime,
            requestData.tokensUsed || 0,
            requestData.qualityScore || null,
            requestData.cacheHit
        ]);
    } catch (error) {
        console.error('Error logging request:', error);
    }
}

async function logError(errorData) {
    try {
        // Log errors to CloudWatch or external logging service
        console.error('Error logged:', errorData);
    } catch (error) {
        console.error('Error logging error:', error);
    }
}

/**
 * Handle POST request for custom guidance generation
 */
async function handleGenerateGuidance(body, requestId, startTime) {
    const { deviceType, stepNumber, language, style, deviceBrand, deviceModel } = body;
    
    if (!deviceType || !stepNumber || !language || !style) {
        return createResponse(400, { error: 'Missing required fields' });
    }
    
    try {
        const generatedContent = await generateAndCacheGuidance(
            deviceType, stepNumber, language, style, requestId, startTime
        );
        
        if (generatedContent) {
            return createResponse(200, {
                ...generatedContent,
                responseTime: Date.now() - startTime,
                requestId
            });
        } else {
            return createResponse(500, { 
                error: 'Failed to generate guidance',
                requestId 
            });
        }
        
    } catch (error) {
        console.error(`[${requestId}] Error in handleGenerateGuidance:`, error);
        return createResponse(500, { 
            error: 'Internal server error',
            requestId 
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
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Cache-Control': 'public, max-age=300' // 5 minutes cache
        },
        body: JSON.stringify(body)
    };
}

/**
 * Cleanup function for Lambda
 */
exports.cleanup = async () => {
    try {
        await dbPool.end();
        console.log('Database connection pool closed');
    } catch (error) {
        console.error('Error closing database pool:', error);
    }
};

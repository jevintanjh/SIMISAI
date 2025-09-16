/**
 * Guidance Pre-Generator Lambda Function
 * 
 * Purpose:
 * - Pre-generate guidance content for all device/language/style combinations
 * - Populate PostgreSQL database with high-quality guidance content
 * - Implement batch processing with quality validation
 * - Monitor generation progress and costs
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
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    statement_timeout: 30000,    // 30 seconds for generation
    query_timeout: 60000,        // 60 seconds for generation
});

// AI clients
const sagemakerClient = new SageMakerRuntimeClient({ region: 'us-east-1' });
const ENDPOINT_NAME = 'simisai-sealion-realtime-endpoint';

// Generation configuration
const GENERATION_CONFIG = {
    batchSize: 50,              // Generate 50 entries per batch
    concurrency: 5,             // 5 concurrent AI requests
    retryAttempts: 3,           // Retry failed generations
    qualityThreshold: 0.8,      // Minimum quality score
    costLimitUSD: 100,          // USD per batch
    maxTokensPerRequest: 500,   // Maximum tokens per AI request
};

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
    const startTime = Date.now();
    const requestId = event.requestId || `pregen-${Date.now()}`;
    
    try {
        console.log(`[${requestId}] Pre-generation request received:`, JSON.stringify(event, null, 2));
        
        const { action, phase, priority, limit } = event;
        
        switch (action) {
            case 'generate':
                return await handleGeneration(phase, priority, limit, requestId, startTime);
            case 'validate':
                return await handleValidation(requestId, startTime);
            case 'status':
                return await handleStatus(requestId, startTime);
            case 'cleanup':
                return await handleCleanup(requestId, startTime);
            default:
                return createResponse(400, { error: 'Invalid action. Use: generate, validate, status, or cleanup' });
        }
        
    } catch (error) {
        console.error(`[${requestId}] Error in pre-generator:`, error);
        return createResponse(500, { 
            error: 'Internal server error',
            requestId,
            message: error.message 
        });
    }
};

/**
 * Handle guidance generation
 */
async function handleGeneration(phase, priority, limit, requestId, startTime) {
    try {
        console.log(`[${requestId}] Starting generation - Phase: ${phase}, Priority: ${priority}, Limit: ${limit}`);
        
        // Get generation targets
        const targets = await getGenerationTargets(phase, priority, limit);
        
        if (targets.length === 0) {
            return createResponse(200, {
                message: 'No targets found for generation',
                targets: 0,
                requestId
            });
        }
        
        console.log(`[${requestId}] Found ${targets.length} generation targets`);
        
        // Process targets in batches
        const results = await processGenerationBatch(targets, requestId);
        
        const responseTime = Date.now() - startTime;
        
        return createResponse(200, {
            message: 'Generation completed',
            targets: targets.length,
            generated: results.generated,
            failed: results.failed,
            skipped: results.skipped,
            responseTime,
            requestId,
            results: results.details
        });
        
    } catch (error) {
        console.error(`[${requestId}] Error in handleGeneration:`, error);
        return createResponse(500, { 
            error: 'Generation failed',
            requestId,
            message: error.message 
        });
    }
}

/**
 * Get generation targets based on phase and priority
 */
async function getGenerationTargets(phase, priority, limit) {
    try {
        let query = `
            SELECT DISTINCT
                dt.device_key,
                sl.language_code,
                gst.style_key,
                dt.total_steps
            FROM device_types dt
            CROSS JOIN supported_languages sl
            CROSS JOIN guidance_styles gst
            WHERE dt.is_active = TRUE
              AND sl.is_active = TRUE
              AND gst.is_active = TRUE
        `;
        
        // Apply phase filtering
        if (phase === '1') {
            // Phase 1: English + Direct style only
            query += ` AND sl.language_code = 'en' AND gst.style_key = 'direct'`;
        } else if (phase === '2') {
            // Phase 2: Top 3 languages + Direct style
            query += ` AND sl.language_code IN ('en', 'id', 'th') AND gst.style_key = 'direct'`;
        } else if (phase === '3') {
            // Phase 3: All languages + Direct style
            query += ` AND gst.style_key = 'direct'`;
        } else if (phase === '4') {
            // Phase 4: Core languages + All styles
            query += ` AND sl.language_code IN ('en', 'id', 'th')`;
        }
        
        // Apply priority filtering
        if (priority === 'high') {
            query += ` AND sl.language_code IN ('en', 'id', 'th')`;
        } else if (priority === 'medium') {
            query += ` AND sl.language_code IN ('en', 'id', 'th', 'fil', 'vi')`;
        }
        
        // Exclude already generated content
        query += `
            AND NOT EXISTS (
                SELECT 1 FROM guidance_steps gs
                WHERE gs.device_type_id = dt.id
                  AND gs.language_id = sl.id
                  AND gs.style_id = gst.id
                  AND gs.quality_score >= ${GENERATION_CONFIG.qualityThreshold}
            )
        `;
        
        query += ` ORDER BY dt.device_key, sl.language_code, gst.style_key`;
        
        if (limit) {
            query += ` LIMIT ${parseInt(limit)}`;
        }
        
        const result = await dbPool.query(query);
        
        // Expand to include all steps for each device
        const targets = [];
        for (const row of result.rows) {
            for (let step = 1; step <= row.total_steps; step++) {
                targets.push({
                    deviceKey: row.device_key,
                    stepNumber: step,
                    languageCode: row.language_code,
                    styleKey: row.style_key
                });
            }
        }
        
        return targets;
        
    } catch (error) {
        console.error('Error getting generation targets:', error);
        throw error;
    }
}

/**
 * Process generation batch
 */
async function processGenerationBatch(targets, requestId) {
    const results = {
        generated: 0,
        failed: 0,
        skipped: 0,
        details: []
    };
    
    // Process in smaller batches to manage concurrency
    const batchSize = GENERATION_CONFIG.batchSize;
    const batches = [];
    
    for (let i = 0; i < targets.length; i += batchSize) {
        batches.push(targets.slice(i, i + batchSize));
    }
    
    console.log(`[${requestId}] Processing ${batches.length} batches of ${batchSize} targets each`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`[${requestId}] Processing batch ${batchIndex + 1}/${batches.length}`);
        
        const batchResults = await processBatch(batch, requestId);
        
        results.generated += batchResults.generated;
        results.failed += batchResults.failed;
        results.skipped += batchResults.skipped;
        results.details.push(...batchResults.details);
        
        // Add delay between batches to manage rate limits
        if (batchIndex < batches.length - 1) {
            await sleep(2000); // 2 second delay
        }
    }
    
    return results;
}

/**
 * Process a single batch
 */
async function processBatch(batch, requestId) {
    const results = {
        generated: 0,
        failed: 0,
        skipped: 0,
        details: []
    };
    
    // Process with controlled concurrency
    const concurrency = GENERATION_CONFIG.concurrency;
    const chunks = [];
    
    for (let i = 0; i < batch.length; i += concurrency) {
        chunks.push(batch.slice(i, i + concurrency));
    }
    
    for (const chunk of chunks) {
        const promises = chunk.map(target => processTarget(target, requestId));
        const chunkResults = await Promise.allSettled(promises);
        
        for (const result of chunkResults) {
            if (result.status === 'fulfilled') {
                const targetResult = result.value;
                results[targetResult.status]++;
                results.details.push(targetResult);
            } else {
                results.failed++;
                results.details.push({
                    target: 'unknown',
                    status: 'failed',
                    error: result.reason?.message || 'Unknown error'
                });
            }
        }
        
        // Small delay between chunks
        await sleep(500);
    }
    
    return results;
}

/**
 * Process a single target
 */
async function processTarget(target, requestId) {
    const { deviceKey, stepNumber, languageCode, styleKey } = target;
    
    try {
        // Check if already exists with good quality
        const existing = await checkExistingGuidance(deviceKey, stepNumber, languageCode, styleKey);
        if (existing && existing.qualityScore >= GENERATION_CONFIG.qualityThreshold) {
            return {
                target: `${deviceKey}/${stepNumber}/${languageCode}/${styleKey}`,
                status: 'skipped',
                reason: 'Already exists with good quality',
                qualityScore: existing.qualityScore
            };
        }
        
        // Generate new content
        const generatedContent = await generateGuidanceContent(target);
        
        if (generatedContent && generatedContent.qualityScore >= GENERATION_CONFIG.qualityThreshold) {
            // Store in database
            const stored = await storeGeneratedContent(target, generatedContent);
            
            if (stored) {
                return {
                    target: `${deviceKey}/${stepNumber}/${languageCode}/${styleKey}`,
                    status: 'generated',
                    qualityScore: generatedContent.qualityScore,
                    aiProvider: generatedContent.aiProvider,
                    tokensUsed: generatedContent.tokensUsed
                };
            }
        }
        
        return {
            target: `${deviceKey}/${stepNumber}/${languageCode}/${styleKey}`,
            status: 'failed',
            reason: 'Quality threshold not met or storage failed',
            qualityScore: generatedContent?.qualityScore || 0
        };
        
    } catch (error) {
        console.error(`[${requestId}] Error processing target ${deviceKey}/${stepNumber}/${languageCode}/${styleKey}:`, error);
        return {
            target: `${deviceKey}/${stepNumber}/${languageCode}/${styleKey}`,
            status: 'failed',
            error: error.message
        };
    }
}

/**
 * Check if guidance already exists
 */
async function checkExistingGuidance(deviceKey, stepNumber, languageCode, styleKey) {
    try {
        const query = `
            SELECT quality_score, is_ai_generated, ai_provider
            FROM guidance_complete
            WHERE device_key = $1
              AND step_number = $2
              AND language_code = $3
              AND style_key = $4
        `;
        
        const result = await dbPool.query(query, [deviceKey, stepNumber, languageCode, styleKey]);
        
        if (result.rows.length > 0) {
            return {
                qualityScore: parseFloat(result.rows[0].quality_score),
                isAiGenerated: result.rows[0].is_ai_generated,
                aiProvider: result.rows[0].ai_provider
            };
        }
        
        return null;
        
    } catch (error) {
        console.error('Error checking existing guidance:', error);
        return null;
    }
}

/**
 * Generate guidance content using AI
 */
async function generateGuidanceContent(target) {
    const { deviceKey, stepNumber, languageCode, styleKey } = target;
    
    // Try different AI providers in order of preference
    const providers = [
        () => trySEALIONGeneration(target),
        () => tryOpenAIGeneration(target),
        () => tryAISingaporeGeneration(target)
    ];
    
    for (const provider of providers) {
        try {
            const result = await provider();
            if (result && result.qualityScore >= GENERATION_CONFIG.qualityThreshold) {
                return result;
            }
        } catch (error) {
            console.error(`AI provider failed for ${deviceKey}/${stepNumber}/${languageCode}/${styleKey}:`, error);
        }
    }
    
    return null;
}

/**
 * Try SEA-LION generation
 */
async function trySEALIONGeneration(target) {
    try {
        const prompt = buildSEALIONPrompt(target);
        
        const command = new InvokeEndpointCommand({
            EndpointName: ENDPOINT_NAME,
            ContentType: 'application/json',
            Body: JSON.stringify({ prompt })
        });
        
        const response = await sagemakerClient.send(command);
        const result = JSON.parse(Buffer.from(response.Body).toString());
        
        if (result && result.response) {
            const parsedResponse = parseSEALIONResponse(result.response);
            const qualityScore = assessQuality(parsedResponse, target);
            
            return {
                ...parsedResponse,
                aiProvider: 'SEA-LION',
                tokensUsed: estimateTokens(prompt + result.response),
                qualityScore
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
async function tryOpenAIGeneration(target) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return null;
        }
        
        const messages = [
            {
                role: 'system',
                content: buildSystemPrompt(target)
            },
            {
                role: 'user',
                content: `Generate step ${target.stepNumber} guidance for ${target.deviceKey} in ${target.languageCode} with ${target.styleKey} style.`
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
                max_tokens: GENERATION_CONFIG.maxTokensPerRequest,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const content = data.choices[0].message.content;
            const parsedResponse = parseOpenAIResponse(content);
            const qualityScore = assessQuality(parsedResponse, target);
            
            return {
                ...parsedResponse,
                aiProvider: 'OpenAI',
                tokensUsed: data.usage?.total_tokens || 0,
                qualityScore
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
async function tryAISingaporeGeneration(target) {
    try {
        const apiKey = process.env.AI_SINGAPORE_API_KEY;
        if (!apiKey) {
            return null;
        }
        
        const prompt = buildAISingaporePrompt(target);
        
        const response = await fetch('https://api.aisingapore.org/v1/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sealion-v3.5-8b-instruct',
                prompt: prompt,
                max_tokens: GENERATION_CONFIG.maxTokensPerRequest,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const content = data.choices[0].text;
            const parsedResponse = parseAISingaporeResponse(content);
            const qualityScore = assessQuality(parsedResponse, target);
            
            return {
                ...parsedResponse,
                aiProvider: 'AI Singapore',
                tokensUsed: estimateTokens(prompt + content),
                qualityScore
            };
        }
        
        return null;
        
    } catch (error) {
        console.error('AI Singapore generation failed:', error);
        return null;
    }
}

/**
 * Store generated content in database
 */
async function storeGeneratedContent(target, content) {
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
            RETURNING id
        `;
        
        const result = await dbPool.query(query, [
            target.deviceKey,
            target.stepNumber,
            target.languageCode,
            target.styleKey,
            content.title,
            content.description,
            content.instructions,
            content.warnings,
            content.tips,
            content.aiProvider,
            content.qualityScore
        ]);
        
        return result.rows.length > 0;
        
    } catch (error) {
        console.error('Error storing generated content:', error);
        return false;
    }
}

/**
 * Handle validation
 */
async function handleValidation(requestId, startTime) {
    try {
        console.log(`[${requestId}] Starting content validation...`);
        
        const validationResults = await validateAllContent();
        
        const responseTime = Date.now() - startTime;
        
        return createResponse(200, {
            message: 'Validation completed',
            responseTime,
            requestId,
            results: validationResults
        });
        
    } catch (error) {
        console.error(`[${requestId}] Error in validation:`, error);
        return createResponse(500, { 
            error: 'Validation failed',
            requestId,
            message: error.message 
        });
    }
}

/**
 * Validate all content
 */
async function validateAllContent() {
    try {
        const query = `
            SELECT 
                device_key,
                step_number,
                language_code,
                style_key,
                step_title,
                step_description,
                step_instructions,
                quality_score,
                is_ai_generated
            FROM guidance_complete
            ORDER BY device_key, step_number, language_code, style_key
        `;
        
        const result = await dbPool.query(query);
        
        const validationResults = {
            total: result.rows.length,
            valid: 0,
            invalid: 0,
            issues: []
        };
        
        for (const row of result.rows) {
            const validation = validateContent(row);
            
            if (validation.isValid) {
                validationResults.valid++;
            } else {
                validationResults.invalid++;
                validationResults.issues.push({
                    target: `${row.device_key}/${row.step_number}/${row.language_code}/${row.style_key}`,
                    issues: validation.issues
                });
            }
        }
        
        return validationResults;
        
    } catch (error) {
        console.error('Error validating content:', error);
        throw error;
    }
}

/**
 * Validate individual content
 */
function validateContent(content) {
    const issues = [];
    
    // Check required fields
    if (!content.step_title || content.step_title.length < 5) {
        issues.push('Title too short or missing');
    }
    
    if (!content.step_description || content.step_description.length < 20) {
        issues.push('Description too short or missing');
    }
    
    if (!content.step_instructions || content.step_instructions.length < 50) {
        issues.push('Instructions too short or missing');
    }
    
    // Check quality score
    if (content.quality_score < 0.5) {
        issues.push('Quality score too low');
    }
    
    // Check content length
    if (content.step_instructions.length > 2000) {
        issues.push('Instructions too long');
    }
    
    return {
        isValid: issues.length === 0,
        issues
    };
}

/**
 * Handle status check
 */
async function handleStatus(requestId, startTime) {
    try {
        console.log(`[${requestId}] Checking generation status...`);
        
        const status = await getGenerationStatus();
        
        const responseTime = Date.now() - startTime;
        
        return createResponse(200, {
            message: 'Status retrieved',
            responseTime,
            requestId,
            status
        });
        
    } catch (error) {
        console.error(`[${requestId}] Error getting status:`, error);
        return createResponse(500, { 
            error: 'Status check failed',
            requestId,
            message: error.message 
        });
    }
}

/**
 * Get generation status
 */
async function getGenerationStatus() {
    try {
        // Get overall statistics
        const statsQuery = `
            SELECT 
                COUNT(*) as total_combinations,
                COUNT(*) FILTER (WHERE gs.id IS NOT NULL) as generated,
                COUNT(*) FILTER (WHERE gs.quality_score >= 0.8) as high_quality,
                AVG(gs.quality_score) as avg_quality
            FROM (
                SELECT dt.id as device_id, sl.id as language_id, gst.id as style_id, dt.total_steps
                FROM device_types dt
                CROSS JOIN supported_languages sl
                CROSS JOIN guidance_styles gst
                WHERE dt.is_active = TRUE AND sl.is_active = TRUE AND gst.is_active = TRUE
            ) combinations
            CROSS JOIN generate_series(1, combinations.total_steps) as step_number
            LEFT JOIN guidance_steps gs ON gs.device_type_id = combinations.device_id
                AND gs.step_number = step_number
                AND gs.language_id = combinations.language_id
                AND gs.style_id = combinations.style_id
        `;
        
        const statsResult = await dbPool.query(statsQuery);
        const stats = statsResult.rows[0];
        
        // Get language breakdown
        const languageQuery = `
            SELECT 
                sl.language_code,
                sl.language_name,
                COUNT(*) as total_needed,
                COUNT(gs.id) as generated,
                COUNT(gs.id) FILTER (WHERE gs.quality_score >= 0.8) as high_quality
            FROM device_types dt
            CROSS JOIN supported_languages sl
            CROSS JOIN guidance_styles gst
            CROSS JOIN generate_series(1, dt.total_steps) as step_number
            LEFT JOIN guidance_steps gs ON gs.device_type_id = dt.id
                AND gs.step_number = step_number
                AND gs.language_id = sl.id
                AND gs.style_id = gst.id
            WHERE dt.is_active = TRUE AND sl.is_active = TRUE AND gst.is_active = TRUE
            GROUP BY sl.language_code, sl.language_name
            ORDER BY sl.language_code
        `;
        
        const languageResult = await dbPool.query(languageQuery);
        
        // Get device breakdown
        const deviceQuery = `
            SELECT 
                dt.device_key,
                dt.device_name,
                COUNT(*) as total_needed,
                COUNT(gs.id) as generated,
                COUNT(gs.id) FILTER (WHERE gs.quality_score >= 0.8) as high_quality
            FROM device_types dt
            CROSS JOIN supported_languages sl
            CROSS JOIN guidance_styles gst
            CROSS JOIN generate_series(1, dt.total_steps) as step_number
            LEFT JOIN guidance_steps gs ON gs.device_type_id = dt.id
                AND gs.step_number = step_number
                AND gs.language_id = sl.id
                AND gs.style_id = gst.id
            WHERE dt.is_active = TRUE AND sl.is_active = TRUE AND gst.is_active = TRUE
            GROUP BY dt.device_key, dt.device_name
            ORDER BY dt.device_key
        `;
        
        const deviceResult = await dbPool.query(deviceQuery);
        
        return {
            overall: {
                totalCombinations: parseInt(stats.total_combinations),
                generated: parseInt(stats.generated),
                highQuality: parseInt(stats.high_quality),
                completionRate: parseFloat((stats.generated / stats.total_combinations * 100).toFixed(2)),
                averageQuality: parseFloat(stats.avg_quality || 0).toFixed(3)
            },
            byLanguage: languageResult.rows,
            byDevice: deviceResult.rows
        };
        
    } catch (error) {
        console.error('Error getting generation status:', error);
        throw error;
    }
}

/**
 * Handle cleanup
 */
async function handleCleanup(requestId, startTime) {
    try {
        console.log(`[${requestId}] Starting cleanup...`);
        
        // Clean up old low-quality content
        const cleanupQuery = `
            DELETE FROM guidance_steps
            WHERE quality_score < 0.5
              AND created_at < NOW() - INTERVAL '7 days'
        `;
        
        const result = await dbPool.query(cleanupQuery);
        
        const responseTime = Date.now() - startTime;
        
        return createResponse(200, {
            message: 'Cleanup completed',
            deletedRows: result.rowCount,
            responseTime,
            requestId
        });
        
    } catch (error) {
        console.error(`[${requestId}] Error in cleanup:`, error);
        return createResponse(500, { 
            error: 'Cleanup failed',
            requestId,
            message: error.message 
        });
    }
}

/**
 * Utility functions
 */
function buildSEALIONPrompt(target) {
    const { deviceKey, stepNumber, languageCode, styleKey } = target;
    
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
    
    return `Generate step ${stepNumber} guidance for ${deviceKey}. ${languagePrompts[languageCode] || languagePrompts['en']} ${stylePrompts[styleKey] || stylePrompts['direct']}`;
}

function buildSystemPrompt(target) {
    return `You are SIMIS, a medical device assistant. Generate high-quality guidance for ${target.deviceKey} in ${target.languageCode} with ${target.styleKey} style. Be accurate, clear, and helpful.`;
}

function buildAISingaporePrompt(target) {
    return `Generate step ${target.stepNumber} guidance for ${target.deviceKey} in ${target.languageCode} with ${target.styleKey} style.`;
}

function parseSEALIONResponse(response) {
    return {
        title: extractTitle(response) || 'Guidance Step',
        description: extractDescription(response) || response.substring(0, 100),
        instructions: response,
        warnings: extractWarnings(response),
        tips: extractTips(response)
    };
}

function parseOpenAIResponse(response) {
    return {
        title: extractTitle(response) || 'Guidance Step',
        description: extractDescription(response) || response.substring(0, 100),
        instructions: response,
        warnings: extractWarnings(response),
        tips: extractTips(response)
    };
}

function parseAISingaporeResponse(response) {
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

function assessQuality(content, target) {
    let score = 0.5; // Base score
    
    if (content.title && content.title.length > 5) score += 0.1;
    if (content.description && content.description.length > 20) score += 0.1;
    if (content.instructions && content.instructions.length > 50) score += 0.2;
    if (content.warnings) score += 0.1;
    if (content.tips) score += 0.1;
    
    // Bonus for language-specific quality
    if (target.languageCode !== 'en') {
        if (content.instructions.includes(target.languageCode)) score += 0.1;
    }
    
    return Math.min(score, 1.0);
}

function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

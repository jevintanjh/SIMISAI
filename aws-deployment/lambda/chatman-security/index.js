const AWS = require('aws-sdk');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

// Configuration
const RATE_LIMIT_TABLE = 'simisai-rate-limits';
const ALERT_TOPIC_ARN = 'arn:aws:sns:us-east-1:710743745504:simisai-alerts';

// Content filtering keywords
const INAPPROPRIATE_KEYWORDS = [
    'hack', 'exploit', 'illegal', 'harm', 'kill', 'suicide', 'drug', 'weapon',
    'bomb', 'terrorist', 'violence', 'abuse', 'harassment', 'spam'
];

const MEDICAL_MISINFORMATION_KEYWORDS = [
    'miracle cure', 'self-diagnose', 'fake medicine', 'alternative medicine',
    'natural cure', 'home remedy', 'doctor not needed'
];

exports.handler = async (event) => {
    console.log('ChatMan Security Service - Processing request:', JSON.stringify(event));
    
    try {
        const { message, sessionId, userId, ipAddress, timestamp } = JSON.parse(event.body);
        
        // 1. Content Filtering
        const contentFilterResult = await filterContent(message);
        if (!contentFilterResult.approved) {
            await logSecurityIncident('INAPPROPRIATE_CONTENT', {
                message,
                sessionId,
                userId,
                ipAddress,
                reason: contentFilterResult.reason
            });
            
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({
                    error: contentFilterResult.reason,
                    code: 'INAPPROPRIATE_CONTENT',
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        // 2. Rate Limiting
        const rateLimitResult = await checkRateLimit(userId, ipAddress);
        if (!rateLimitResult.allowed) {
            await logSecurityIncident('RATE_LIMIT_EXCEEDED', {
                message,
                sessionId,
                userId,
                ipAddress,
                reason: rateLimitResult.reason
            });
            
            return {
                statusCode: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Retry-After': rateLimitResult.retryAfter
                },
                body: JSON.stringify({
                    error: rateLimitResult.reason,
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: rateLimitResult.retryAfter,
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        // 3. Abuse Detection
        const abuseResult = await detectAbuse(message, sessionId, userId);
        if (abuseResult.detected) {
            await logSecurityIncident('ABUSE_DETECTED', {
                message,
                sessionId,
                userId,
                ipAddress,
                reason: abuseResult.reason
            });
            
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({
                    error: abuseResult.reason,
                    code: 'ABUSE_DETECTED',
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        // 4. Update rate limit counters
        await updateRateLimitCounters(userId, ipAddress);
        
        // Message approved
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                status: 'Message approved',
                originalMessage: message,
                securityChecks: {
                    contentFilter: 'passed',
                    rateLimit: 'passed',
                    abuseDetection: 'passed'
                },
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('ChatMan Security Service Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                code: 'SECURITY_SERVICE_ERROR',
                timestamp: new Date().toISOString()
            })
        };
    }
};

async function filterContent(message) {
    const lowerCaseMessage = message.toLowerCase();
    
    // Check for inappropriate content
    for (const keyword of INAPPROPRIATE_KEYWORDS) {
        if (lowerCaseMessage.includes(keyword)) {
            return {
                approved: false,
                reason: '🚫 Inappropriate content detected. Please keep the conversation professional and focused on medical devices.'
            };
        }
    }
    
    // Check for medical misinformation
    for (const keyword of MEDICAL_MISINFORMATION_KEYWORDS) {
        if (lowerCaseMessage.includes(keyword)) {
            return {
                approved: false,
                reason: '⚠️ Medical misinformation detected. Please consult healthcare professionals for medical advice.'
            };
        }
    }
    
    return { approved: true };
}

async function checkRateLimit(userId, ipAddress) {
    const now = Date.now();
    const minuteWindow = Math.floor(now / 60000); // 1-minute windows
    
    try {
        // Check user rate limit (10 messages per minute)
        const userKey = `user:${userId}:${minuteWindow}`;
        const userCount = await getRateLimitCount(userKey);
        
        if (userCount >= 10) {
            return {
                allowed: false,
                reason: '⏳ You have exceeded the rate limit. Please wait a moment before sending more messages.',
                retryAfter: 60
            };
        }
        
        // Check IP rate limit (50 messages per minute)
        const ipKey = `ip:${ipAddress}:${minuteWindow}`;
        const ipCount = await getRateLimitCount(ipKey);
        
        if (ipCount >= 50) {
            return {
                allowed: false,
                reason: '⏳ Rate limit exceeded for this IP address. Please wait before sending more messages.',
                retryAfter: 60
            };
        }
        
        return { allowed: true };
        
    } catch (error) {
        console.error('Rate limit check error:', error);
        // Allow message if rate limiting fails
        return { allowed: true };
    }
}

async function getRateLimitCount(key) {
    try {
        const params = {
            TableName: RATE_LIMIT_TABLE,
            Key: { id: key }
        };
        
        const result = await dynamodb.get(params).promise();
        return result.Item ? result.Item.count : 0;
        
    } catch (error) {
        console.error('Error getting rate limit count:', error);
        return 0;
    }
}

async function updateRateLimitCounters(userId, ipAddress) {
    const now = Date.now();
    const minuteWindow = Math.floor(now / 60000);
    
    try {
        // Update user counter
        const userKey = `user:${userId}:${minuteWindow}`;
        await incrementRateLimitCount(userKey);
        
        // Update IP counter
        const ipKey = `ip:${ipAddress}:${minuteWindow}`;
        await incrementRateLimitCount(ipKey);
        
    } catch (error) {
        console.error('Error updating rate limit counters:', error);
    }
}

async function incrementRateLimitCount(key) {
    try {
        const params = {
            TableName: RATE_LIMIT_TABLE,
            Key: { id: key },
            UpdateExpression: 'ADD #count :inc SET #timestamp = :timestamp',
            ExpressionAttributeNames: {
                '#count': 'count',
                '#timestamp': 'timestamp'
            },
            ExpressionAttributeValues: {
                ':inc': 1,
                ':timestamp': Date.now()
            }
        };
        
        await dynamodb.update(params).promise();
        
    } catch (error) {
        console.error('Error incrementing rate limit count:', error);
    }
}

async function detectAbuse(message, sessionId, userId) {
    // Simple abuse detection patterns
    const abusePatterns = [
        /(.)\1{10,}/, // Repeated characters (spam)
        /(.)\1{5,}/g, // Multiple repeated characters
        /[!@#$%^&*()_+=\[\]{}|;':",./<>?]{10,}/, // Excessive special characters
        /(.)\1{3,}/g // Repeated words/phrases
    ];
    
    for (const pattern of abusePatterns) {
        if (pattern.test(message)) {
            return {
                detected: true,
                reason: '🚫 Spam or abuse pattern detected. Please send meaningful messages.'
            };
        }
    }
    
    // Check message length (too short or too long)
    if (message.length < 2) {
        return {
            detected: true,
            reason: '📝 Message too short. Please provide more details.'
        };
    }
    
    if (message.length > 1000) {
        return {
            detected: true,
            reason: '📝 Message too long. Please keep messages under 1000 characters.'
        };
    }
    
    return { detected: false };
}

async function logSecurityIncident(type, details) {
    try {
        const message = {
            type: type,
            details: details,
            timestamp: new Date().toISOString(),
            source: 'ChatMan Security Service'
        };
        
        await sns.publish({
            TopicArn: ALERT_TOPIC_ARN,
            Message: JSON.stringify(message),
            Subject: `SIMISAI Security Alert: ${type}`
        }).promise();
        
        console.log('Security incident logged:', message);
        
    } catch (error) {
        console.error('Error logging security incident:', error);
    }
}
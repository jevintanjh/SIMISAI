/**
 * Check Database Structure Lambda
 * Simple function to check what tables exist in our database
 */

const { Client } = require('pg');

// Database connection configuration
const dbConfig = {
    host: 'simisai-production-db.colo2qks0ive.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'simisai_guidance',
    user: 'simisai_admin',
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
};

exports.handler = async (event) => {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('✅ Connected to database');
        
        // Check what tables exist
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('📋 Available tables:', tablesResult.rows.map(r => r.table_name));
        
        // Check guidance_content table structure
        const structureResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'guidance_content'
            ORDER BY ordinal_position
        `);
        
        console.log('🏗️ guidance_content structure:', structureResult.rows);
        
        // Check if we have any data
        const dataResult = await client.query(`
            SELECT COUNT(*) as total_entries,
                   COUNT(DISTINCT device_id) as devices,
                   COUNT(DISTINCT language_id) as languages,
                   COUNT(DISTINCT style_id) as styles
            FROM guidance_content
        `);
        
        console.log('📊 Data summary:', dataResult.rows[0]);
        
        // Check a sample entry
        const sampleResult = await client.query(`
            SELECT gc.*, dt.device_key, sl.language_code, gs.style_key
            FROM guidance_content gc
            JOIN device_types dt ON gc.device_id = dt.device_id
            JOIN supported_languages sl ON gc.language_id = sl.language_id
            JOIN guidance_styles gs ON gc.style_id = gs.style_id
            LIMIT 1
        `);
        
        console.log('🔍 Sample entry:', sampleResult.rows[0] || 'No entries found');
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Database structure check completed',
                tables: tablesResult.rows.map(r => r.table_name),
                guidance_content_structure: structureResult.rows,
                data_summary: dataResult.rows[0],
                sample_entry: sampleResult.rows[0] || null,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('💥 Database check failed:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Database check failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    } finally {
        await client.end();
    }
};

/**
 * Simple Database Setup Lambda
 * Creates tables and inserts initial data using direct PostgreSQL connection
 */

const { Client } = require('pg');

// Database connection configuration
const dbConfig = {
    host: 'simisai-production-db.colo2qks0ive.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'postgres',
    user: 'simisai_admin',
    password: process.env.DB_PASSWORD, // Will be set via environment variable
    ssl: {
        rejectUnauthorized: false
    }
};

// SQL statements for setup
const setupSQL = `
-- Create database (if not exists)
SELECT 'CREATE DATABASE simisai_guidance' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'simisai_guidance')\\gexec

-- Connect to guidance database
\\c simisai_guidance

-- Device Types Table
CREATE TABLE IF NOT EXISTS device_types (
    device_id SERIAL PRIMARY KEY,
    device_key VARCHAR(50) UNIQUE NOT NULL,
    device_name_en VARCHAR(100) NOT NULL,
    device_category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Supported Languages Table
CREATE TABLE IF NOT EXISTS supported_languages (
    language_id SERIAL PRIMARY KEY,
    language_code VARCHAR(10) UNIQUE NOT NULL,
    language_name VARCHAR(50) NOT NULL,
    native_name VARCHAR(50) NOT NULL,
    is_rtl BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guidance Styles Table
CREATE TABLE IF NOT EXISTS guidance_styles (
    style_id SERIAL PRIMARY KEY,
    style_key VARCHAR(50) UNIQUE NOT NULL,
    style_name VARCHAR(100) NOT NULL,
    style_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guidance Steps Table
CREATE TABLE IF NOT EXISTS guidance_steps (
    step_id SERIAL PRIMARY KEY,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Main Guidance Content Table
CREATE TABLE IF NOT EXISTS guidance_content (
    content_id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES device_types(device_id),
    language_id INTEGER NOT NULL REFERENCES supported_languages(language_id),
    style_id INTEGER NOT NULL REFERENCES guidance_styles(style_id),
    step_id INTEGER NOT NULL REFERENCES guidance_steps(step_id),
    step_title TEXT NOT NULL,
    step_description TEXT NOT NULL,
    step_instructions TEXT,
    step_warnings TEXT,
    step_tips TEXT,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    generated_by_ai_provider VARCHAR(50),
    generation_quality_score NUMERIC(3,2),
    generated_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_cached BOOLEAN DEFAULT TRUE,
    cache_hit_count INTEGER DEFAULT 0,
    UNIQUE (device_id, language_id, style_id, step_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_guidance_content_lookup 
ON guidance_content (device_id, language_id, style_id, step_id);

CREATE INDEX IF NOT EXISTS idx_guidance_content_cache 
ON guidance_content (is_cached, cache_hit_count DESC);
`;

const initialDataSQL = `
-- Insert initial data
INSERT INTO device_types (device_key, device_name_en, device_category) VALUES
('blood_pressure_monitor', 'Blood Pressure Monitor', 'vital_signs'),
('digital_oral_thermometer', 'Digital Oral Thermometer', 'vital_signs'),
('digital_ear_thermometer', 'Digital Ear Thermometer', 'vital_signs')
ON CONFLICT (device_key) DO NOTHING;

INSERT INTO guidance_styles (style_key, style_name, style_description) VALUES
('direct', 'Direct', 'Straightforward, concise instructions'),
('gentle', 'Gentle', 'Friendly, reassuring tone with empathy'),
('detailed', 'Detailed', 'Comprehensive step-by-step guidance')
ON CONFLICT (style_key) DO NOTHING;

INSERT INTO supported_languages (language_code, language_name, native_name, is_rtl) VALUES
('en', 'English', 'English', FALSE),
('id', 'Indonesian', 'Bahasa Indonesia', FALSE),
('th', 'Thai', 'ไทย', FALSE),
('fil', 'Filipino', 'Filipino', FALSE),
('vi', 'Vietnamese', 'Tiếng Việt', FALSE),
('ms', 'Malay', 'Bahasa Melayu', FALSE),
('zh', 'Chinese', '中文', FALSE)
ON CONFLICT (language_code) DO NOTHING;

INSERT INTO guidance_steps (step_number, step_name, step_description) VALUES
(1, 'Preparation', 'Prepare the device and environment'),
(2, 'Setup', 'Set up the device for measurement'),
(3, 'Measurement', 'Perform the measurement'),
(4, 'Reading', 'Read and interpret the results'),
(5, 'Completion', 'Complete the process and clean up')
ON CONFLICT DO NOTHING;
`;

async function executeSQL(client, sql) {
    try {
        const result = await client.query(sql);
        return result;
    } catch (error) {
        console.error('SQL execution error:', error);
        throw error;
    }
}

exports.handler = async (event) => {
    const client = new Client(dbConfig);
    
    try {
        console.log('Starting database setup...');
        await client.connect();
        
        // Execute setup SQL
        console.log('Creating tables...');
        await executeSQL(client, setupSQL);
        
        // Execute initial data
        console.log('Inserting initial data...');
        await executeSQL(client, initialDataSQL);
        
        console.log('Database setup completed successfully!');
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Database setup completed successfully',
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('Database setup failed:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Database setup failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    } finally {
        await client.end();
    }
};

-- Setup Guidance Database Schema
-- This script creates the database and all necessary tables for the guidance system

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS simisai_guidance;

-- Use the guidance database
\c simisai_guidance;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Device Types Table
CREATE TABLE IF NOT EXISTS device_types (
    device_id SERIAL PRIMARY KEY,
    device_key VARCHAR(50) UNIQUE NOT NULL,
    device_name_en VARCHAR(100) NOT NULL,
    device_name_id VARCHAR(100),
    device_name_th VARCHAR(100),
    device_name_fil VARCHAR(100),
    device_name_vi VARCHAR(100),
    device_name_ms VARCHAR(100),
    device_name_zh VARCHAR(100),
    device_category VARCHAR(50) NOT NULL,
    device_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    style_characteristics JSONB,
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

-- =====================================================
-- CONTENT TABLES
-- =====================================================

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
    step_images JSONB,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    generated_by_ai_provider VARCHAR(50),
    generation_quality_score NUMERIC(3,2),
    generated_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_cached BOOLEAN DEFAULT TRUE,
    cache_hit_count INTEGER DEFAULT 0,
    UNIQUE (device_id, language_id, style_id, step_id)
);

-- =====================================================
-- MONITORING TABLES
-- =====================================================

-- Generation Logs Table
CREATE TABLE IF NOT EXISTS generation_logs (
    log_id SERIAL PRIMARY KEY,
    device_key VARCHAR(50) NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    style_key VARCHAR(50) NOT NULL,
    step_number INTEGER NOT NULL,
    ai_provider VARCHAR(50) NOT NULL,
    generation_time_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    quality_score NUMERIC(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Missing Requests Table
CREATE TABLE IF NOT EXISTS missing_requests (
    request_id SERIAL PRIMARY KEY,
    device_key VARCHAR(50) NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    style_key VARCHAR(50) NOT NULL,
    step_number INTEGER NOT NULL,
    request_count INTEGER DEFAULT 1,
    first_requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_generated BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMP WITH TIME ZONE
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    metric_id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    total_requests INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    avg_response_time_ms NUMERIC(10,2) DEFAULT 0,
    ai_generation_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (metric_date)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_guidance_content_lookup 
ON guidance_content (device_id, language_id, style_id, step_id);

CREATE INDEX IF NOT EXISTS idx_guidance_content_cache 
ON guidance_content (is_cached, cache_hit_count DESC);

CREATE INDEX IF NOT EXISTS idx_missing_requests_priority 
ON missing_requests (request_count DESC, is_generated, first_requested_at);

CREATE INDEX IF NOT EXISTS idx_generation_logs_provider 
ON generation_logs (ai_provider, success, created_at DESC);

-- =====================================================
-- INITIAL DATA POPULATION
-- =====================================================

-- Device Types (Revised Scope)
INSERT INTO device_types (device_key, device_name_en, device_category) VALUES
('blood_pressure_monitor', 'Blood Pressure Monitor', 'vital_signs'),
('digital_oral_thermometer', 'Digital Oral Thermometer', 'vital_signs'),
('digital_ear_thermometer', 'Digital Ear Thermometer', 'vital_signs')
ON CONFLICT (device_key) DO NOTHING;

-- Guidance Styles (Revised Scope - 3 Styles)
INSERT INTO guidance_styles (style_key, style_name, style_description) VALUES
('direct', 'Direct', 'Straightforward, concise instructions'),
('gentle', 'Gentle', 'Friendly, reassuring tone with empathy'),
('detailed', 'Detailed', 'Comprehensive step-by-step guidance')
ON CONFLICT (style_key) DO NOTHING;

-- Supported Languages (Revised Scope - 7 ASEAN Languages)
INSERT INTO supported_languages (language_code, language_name, native_name, is_rtl) VALUES
('en', 'English', 'English', FALSE),
('id', 'Indonesian', 'Bahasa Indonesia', FALSE),
('th', 'Thai', 'ไทย', FALSE),
('fil', 'Filipino', 'Filipino', FALSE),
('vi', 'Vietnamese', 'Tiếng Việt', FALSE),
('ms', 'Malay', 'Bahasa Melayu', FALSE),
('zh', 'Chinese', '中文', FALSE)
ON CONFLICT (language_code) DO NOTHING;

-- Guidance Steps (5 steps for each device)
INSERT INTO guidance_steps (step_number, step_name, step_description) VALUES
(1, 'Preparation', 'Prepare the device and environment'),
(2, 'Setup', 'Set up the device for measurement'),
(3, 'Measurement', 'Perform the measurement'),
(4, 'Reading', 'Read and interpret the results'),
(5, 'Completion', 'Complete the process and clean up')
ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for complete guidance lookup
CREATE OR REPLACE VIEW guidance_lookup AS
SELECT 
    gc.content_id,
    dt.device_key,
    dt.device_name_en as device_name,
    sl.language_code,
    sl.language_name,
    gs.style_key,
    gs.style_name,
    gst.step_number,
    gst.step_name,
    gc.step_title,
    gc.step_description,
    gc.step_instructions,
    gc.step_warnings,
    gc.step_tips,
    gc.is_ai_generated,
    gc.generated_by_ai_provider,
    gc.generation_quality_score,
    gc.cache_hit_count,
    gc.last_updated_at
FROM guidance_content gc
JOIN device_types dt ON gc.device_id = dt.device_id
JOIN supported_languages sl ON gc.language_id = sl.language_id
JOIN guidance_styles gs ON gc.style_id = gs.style_id
JOIN guidance_steps gst ON gc.step_id = gst.step_id
WHERE gc.is_cached = TRUE;

-- View for missing content
CREATE OR REPLACE VIEW missing_content AS
SELECT 
    mr.request_id,
    mr.device_key,
    mr.language_code,
    mr.style_key,
    mr.step_number,
    mr.request_count,
    mr.first_requested_at,
    mr.last_requested_at,
    mr.is_generated
FROM missing_requests mr
WHERE mr.is_generated = FALSE
ORDER BY mr.request_count DESC, mr.first_requested_at ASC;

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get guidance content
CREATE OR REPLACE FUNCTION get_guidance_content(
    p_device_key VARCHAR(50),
    p_language_code VARCHAR(10),
    p_style_key VARCHAR(50),
    p_step_number INTEGER
)
RETURNS TABLE (
    content_id INTEGER,
    step_title TEXT,
    step_description TEXT,
    step_instructions TEXT,
    step_warnings TEXT,
    step_tips TEXT,
    is_ai_generated BOOLEAN,
    generated_by_ai_provider VARCHAR(50),
    generation_quality_score NUMERIC(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gc.content_id,
        gc.step_title,
        gc.step_description,
        gc.step_instructions,
        gc.step_warnings,
        gc.step_tips,
        gc.is_ai_generated,
        gc.generated_by_ai_provider,
        gc.generation_quality_score
    FROM guidance_content gc
    JOIN device_types dt ON gc.device_id = dt.device_id
    JOIN supported_languages sl ON gc.language_id = sl.language_id
    JOIN guidance_styles gs ON gc.style_id = gs.style_id
    JOIN guidance_steps gst ON gc.step_id = gst.step_id
    WHERE dt.device_key = p_device_key
        AND sl.language_code = p_language_code
        AND gs.style_key = p_style_key
        AND gst.step_number = p_step_number
        AND gc.is_cached = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to log missing requests
CREATE OR REPLACE FUNCTION log_missing_request(
    p_device_key VARCHAR(50),
    p_language_code VARCHAR(10),
    p_style_key VARCHAR(50),
    p_step_number INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO missing_requests (device_key, language_code, style_key, step_number)
    VALUES (p_device_key, p_language_code, p_style_key, p_step_number)
    ON CONFLICT (device_key, language_code, style_key, step_number)
    DO UPDATE SET
        request_count = missing_requests.request_count + 1,
        last_requested_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to update cache hit count
CREATE OR REPLACE FUNCTION update_cache_hit(
    p_content_id INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE guidance_content 
    SET cache_hit_count = cache_hit_count + 1,
        last_updated_at = CURRENT_TIMESTAMP
    WHERE content_id = p_content_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant permissions to Lambda execution role
-- (This will be configured via IAM policies)

COMMIT;

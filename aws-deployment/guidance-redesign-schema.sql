-- =====================================================
-- SIMISAI GUIDANCE SYSTEM REDESIGN - DATABASE SCHEMA
-- =====================================================
-- PostgreSQL Schema for Pre-Generated Guidance Storage
-- Optimized for Performance and Multi-Language Support

-- =====================================================
-- 1. DEVICE TYPES TABLE
-- =====================================================
CREATE TABLE device_types (
    id SERIAL PRIMARY KEY,
    device_key VARCHAR(50) UNIQUE NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    device_category VARCHAR(50) NOT NULL,
    total_steps INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. GUIDANCE STYLES TABLE
-- =====================================================
CREATE TABLE guidance_styles (
    id SERIAL PRIMARY KEY,
    style_key VARCHAR(20) UNIQUE NOT NULL,
    style_name VARCHAR(50) NOT NULL,
    style_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. LANGUAGES TABLE
-- =====================================================
CREATE TABLE supported_languages (
    id SERIAL PRIMARY KEY,
    language_code VARCHAR(5) UNIQUE NOT NULL,
    language_name VARCHAR(50) NOT NULL,
    native_name VARCHAR(50),
    is_rtl BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. GUIDANCE STEPS TABLE (Pre-Generated Content)
-- =====================================================
CREATE TABLE guidance_steps (
    id SERIAL PRIMARY KEY,
    device_type_id INTEGER REFERENCES device_types(id),
    step_number INTEGER NOT NULL,
    language_id INTEGER REFERENCES supported_languages(id),
    style_id INTEGER REFERENCES guidance_styles(id),
    
    -- Content Fields
    step_title VARCHAR(200) NOT NULL,
    step_description TEXT NOT NULL,
    step_instructions TEXT NOT NULL,
    step_warnings TEXT,
    step_tips TEXT,
    
    -- Metadata
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_provider VARCHAR(50),
    generation_timestamp TIMESTAMP,
    quality_score DECIMAL(3,2) DEFAULT 0.00,
    
    -- Cache and Performance
    is_cached BOOLEAN DEFAULT TRUE,
    cache_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(device_type_id, step_number, language_id, style_id),
    CHECK (step_number > 0 AND step_number <= 10),
    CHECK (quality_score >= 0.00 AND quality_score <= 1.00)
);

-- =====================================================
-- 5. GUIDANCE GENERATION LOG TABLE
-- =====================================================
CREATE TABLE guidance_generation_log (
    id SERIAL PRIMARY KEY,
    device_type_id INTEGER REFERENCES device_types(id),
    step_number INTEGER,
    language_id INTEGER REFERENCES supported_languages(id),
    style_id INTEGER REFERENCES guidance_styles(id),
    
    -- Generation Details
    request_type VARCHAR(20) NOT NULL, -- 'cache_hit', 'ai_generated', 'fallback'
    ai_provider VARCHAR(50),
    generation_time_ms INTEGER,
    tokens_used INTEGER,
    quality_score DECIMAL(3,2),
    
    -- Request Context
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(100),
    
    -- Response Details
    response_size_bytes INTEGER,
    cache_hit BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. MISSING GUIDANCE REQUESTS TABLE (AI Generation Queue)
-- =====================================================
CREATE TABLE missing_guidance_requests (
    id SERIAL PRIMARY KEY,
    device_type_id INTEGER REFERENCES device_types(id),
    step_number INTEGER NOT NULL,
    language_id INTEGER REFERENCES supported_languages(id),
    style_id INTEGER REFERENCES guidance_styles(id),
    
    -- Request Details
    request_count INTEGER DEFAULT 1,
    first_requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Generation Status
    generation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    ai_provider VARCHAR(50),
    generation_attempts INTEGER DEFAULT 0,
    last_generation_attempt TIMESTAMP,
    
    -- Priority (based on request frequency)
    priority_score INTEGER DEFAULT 1,
    
    -- Constraints
    UNIQUE(device_type_id, step_number, language_id, style_id)
);

-- =====================================================
-- 7. PERFORMANCE METRICS TABLE
-- =====================================================
CREATE TABLE guidance_performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    language_id INTEGER REFERENCES supported_languages(id),
    
    -- Request Metrics
    total_requests INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    ai_generations INTEGER DEFAULT 0,
    fallback_responses INTEGER DEFAULT 0,
    
    -- Performance Metrics
    avg_response_time_ms DECIMAL(8,2),
    p95_response_time_ms DECIMAL(8,2),
    p99_response_time_ms DECIMAL(8,2),
    
    -- Quality Metrics
    avg_quality_score DECIMAL(3,2),
    user_satisfaction_score DECIMAL(3,2),
    
    -- Cost Metrics
    total_tokens_used INTEGER DEFAULT 0,
    estimated_cost_usd DECIMAL(10,4) DEFAULT 0.0000,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, language_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary lookup indexes
CREATE INDEX idx_guidance_steps_lookup ON guidance_steps(device_type_id, step_number, language_id, style_id);
CREATE INDEX idx_guidance_steps_cache ON guidance_steps(is_cached, cache_timestamp);
CREATE INDEX idx_guidance_steps_quality ON guidance_steps(quality_score DESC);

-- Generation log indexes
CREATE INDEX idx_generation_log_date ON guidance_generation_log(created_at);
CREATE INDEX idx_generation_log_device ON guidance_generation_log(device_type_id, language_id);
CREATE INDEX idx_generation_log_performance ON guidance_generation_log(generation_time_ms);

-- Missing requests indexes
CREATE INDEX idx_missing_requests_status ON missing_guidance_requests(generation_status, priority_score DESC);
CREATE INDEX idx_missing_requests_frequency ON missing_guidance_requests(request_count DESC, last_requested_at);

-- Performance metrics indexes
CREATE INDEX idx_performance_metrics_date ON guidance_performance_metrics(metric_date);
CREATE INDEX idx_performance_metrics_language ON guidance_performance_metrics(language_id, metric_date);

-- =====================================================
-- INITIAL DATA POPULATION
-- =====================================================

-- Device Types (Revised Scope)
INSERT INTO device_types (device_key, device_name, device_category) VALUES
('blood_pressure_monitor', 'Blood Pressure Monitor', 'vital_signs'),
('digital_oral_thermometer', 'Digital Oral Thermometer', 'vital_signs'),
('digital_ear_thermometer', 'Digital Ear Thermometer', 'vital_signs');

-- Guidance Styles (Revised Scope - 3 Styles)
INSERT INTO guidance_styles (style_key, style_name, style_description) VALUES
('direct', 'Direct', 'Straightforward, concise instructions'),
('gentle', 'Gentle', 'Friendly, reassuring tone with empathy'),
('detailed', 'Detailed', 'Comprehensive step-by-step guidance');

-- Supported Languages (Revised Scope - 7 ASEAN Languages)
INSERT INTO supported_languages (language_code, language_name, native_name, is_rtl) VALUES
('en', 'English', 'English', FALSE),
('id', 'Indonesian', 'Bahasa Indonesia', FALSE),
('th', 'Thai', 'ไทย', FALSE),
('fil', 'Filipino', 'Filipino', FALSE),
('vi', 'Vietnamese', 'Tiếng Việt', FALSE),
('ms', 'Malay', 'Bahasa Melayu', FALSE),
('zh', 'Chinese', '中文', FALSE);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Complete Guidance View (for easy querying)
CREATE VIEW guidance_complete AS
SELECT 
    gs.id,
    dt.device_key,
    dt.device_name,
    gs.step_number,
    sl.language_code,
    sl.language_name,
    gst.style_key,
    gst.style_name,
    gs.step_title,
    gs.step_description,
    gs.step_instructions,
    gs.step_warnings,
    gs.step_tips,
    gs.is_ai_generated,
    gs.ai_provider,
    gs.quality_score,
    gs.is_cached,
    gs.cache_timestamp,
    gs.created_at,
    gs.updated_at
FROM guidance_steps gs
JOIN device_types dt ON gs.device_type_id = dt.id
JOIN supported_languages sl ON gs.language_id = sl.id
JOIN guidance_styles gst ON gs.style_id = gst.id;

-- Missing Guidance Summary View
CREATE VIEW missing_guidance_summary AS
SELECT 
    dt.device_key,
    dt.device_name,
    mgr.step_number,
    sl.language_code,
    sl.language_name,
    gst.style_key,
    gst.style_name,
    mgr.request_count,
    mgr.priority_score,
    mgr.generation_status,
    mgr.first_requested_at,
    mgr.last_requested_at
FROM missing_guidance_requests mgr
JOIN device_types dt ON mgr.device_type_id = dt.id
JOIN supported_languages sl ON mgr.language_id = sl.id
JOIN guidance_styles gst ON mgr.style_id = gst.id
ORDER BY mgr.priority_score DESC, mgr.request_count DESC;

-- Performance Summary View
CREATE VIEW guidance_performance_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    sl.language_code,
    sl.language_name,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE cache_hit = TRUE) as cache_hits,
    COUNT(*) FILTER (WHERE request_type = 'ai_generated') as ai_generations,
    COUNT(*) FILTER (WHERE request_type = 'fallback') as fallback_responses,
    AVG(generation_time_ms) as avg_response_time,
    AVG(quality_score) as avg_quality
FROM guidance_generation_log gl
JOIN supported_languages sl ON gl.language_id = sl.id
GROUP BY DATE_TRUNC('day', created_at), sl.language_code, sl.language_name
ORDER BY date DESC, total_requests DESC;

-- =====================================================
-- FUNCTIONS FOR GUIDANCE RETRIEVAL
-- =====================================================

-- Function to get guidance with fallback
CREATE OR REPLACE FUNCTION get_guidance(
    p_device_key VARCHAR(50),
    p_step_number INTEGER,
    p_language_code VARCHAR(5),
    p_style_key VARCHAR(20)
) RETURNS TABLE (
    step_title VARCHAR(200),
    step_description TEXT,
    step_instructions TEXT,
    step_warnings TEXT,
    step_tips TEXT,
    is_cached BOOLEAN,
    quality_score DECIMAL(3,2),
    cache_timestamp TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gc.step_title,
        gc.step_description,
        gc.step_instructions,
        gc.step_warnings,
        gc.step_tips,
        gc.is_cached,
        gc.quality_score,
        gc.cache_timestamp
    FROM guidance_complete gc
    WHERE gc.device_key = p_device_key
      AND gc.step_number = p_step_number
      AND gc.language_code = p_language_code
      AND gc.style_key = p_style_key
      AND gc.is_cached = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to log missing guidance request
CREATE OR REPLACE FUNCTION log_missing_guidance(
    p_device_key VARCHAR(50),
    p_step_number INTEGER,
    p_language_code VARCHAR(5),
    p_style_key VARCHAR(20)
) RETURNS VOID AS $$
DECLARE
    v_device_type_id INTEGER;
    v_language_id INTEGER;
    v_style_id INTEGER;
BEGIN
    -- Get IDs
    SELECT id INTO v_device_type_id FROM device_types WHERE device_key = p_device_key;
    SELECT id INTO v_language_id FROM supported_languages WHERE language_code = p_language_code;
    SELECT id INTO v_style_id FROM guidance_styles WHERE style_key = p_style_key;
    
    -- Insert or update missing guidance request
    INSERT INTO missing_guidance_requests (device_type_id, step_number, language_id, style_id)
    VALUES (v_device_type_id, p_step_number, v_language_id, v_style_id)
    ON CONFLICT (device_type_id, step_number, language_id, style_id)
    DO UPDATE SET 
        request_count = missing_guidance_requests.request_count + 1,
        last_requested_at = CURRENT_TIMESTAMP,
        priority_score = missing_guidance_requests.priority_score + 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_device_types_updated_at
    BEFORE UPDATE ON device_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guidance_steps_updated_at
    BEFORE UPDATE ON guidance_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE device_types IS 'Medical device types supported by the guidance system';
COMMENT ON TABLE guidance_styles IS 'Different guidance presentation styles';
COMMENT ON TABLE supported_languages IS 'Languages supported for guidance content';
COMMENT ON TABLE guidance_steps IS 'Pre-generated guidance content with caching';
COMMENT ON TABLE guidance_generation_log IS 'Audit log for all guidance requests and generations';
COMMENT ON TABLE missing_guidance_requests IS 'Queue for missing guidance that needs AI generation';
COMMENT ON TABLE guidance_performance_metrics IS 'Daily performance metrics for monitoring';

COMMENT ON COLUMN guidance_steps.quality_score IS 'Quality score from 0.00 to 1.00 based on AI generation quality';
COMMENT ON COLUMN missing_guidance_requests.priority_score IS 'Priority based on request frequency for AI generation queue';
COMMENT ON COLUMN guidance_performance_metrics.estimated_cost_usd IS 'Estimated cost in USD for AI generation tokens';

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Create application user (adjust as needed)
-- CREATE USER simis_guidance_app WITH PASSWORD 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO simis_guidance_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO simis_guidance_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO simis_guidance_app;

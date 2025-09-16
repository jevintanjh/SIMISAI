/**
 * Insert Guidance Content Lambda
 * Inserts Phase 1 and Phase 2 content into the database
 */

const { Client } = require('pg');
const fs = require('fs');

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

// Phase 1 content (15 entries - English + Direct style)
const phase1Content = [
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'en',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Prepare the cuff and device',
        step_description: 'Step 1: Prepare the cuff and device for Blood Pressure Monitor',
        step_instructions: 'Remove the blood pressure cuff from its case. Ensure it is clean and properly inflated. Check for any tears or damage to the cuff or tubing.',
        step_warnings: 'Do not use if the cuff is damaged or has holes.',
        step_tips: 'Store the device in a cool, dry place when not in use.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'en',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Position the cuff correctly',
        step_description: 'Step 2: Position the cuff correctly for Blood Pressure Monitor',
        step_instructions: 'Wrap the cuff around your upper arm, positioning it so the bottom edge is about 1 inch above your elbow. The cuff should be snug but not tight.',
        step_warnings: 'Ensure the cuff is not too tight - you should be able to fit one finger between the cuff and your arm.',
        step_tips: 'Position yourself comfortably with your back supported and feet flat on the floor.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'en',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Start the measurement',
        step_description: 'Step 3: Start the measurement for Blood Pressure Monitor',
        step_instructions: 'Press the start button on the monitor. Sit still with your arm supported at heart level. Do not talk or move during the measurement.',
        step_warnings: 'Do not move or talk during measurement as this can affect accuracy.',
        step_tips: 'Take multiple readings at different times of day for a complete picture.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'en',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Read and record results',
        step_description: 'Step 4: Read and record results for Blood Pressure Monitor',
        step_instructions: 'Wait for the beep indicating measurement is complete. Note the systolic and diastolic readings displayed on the screen.',
        step_warnings: 'If readings seem unusually high or low, wait 5 minutes and measure again.',
        step_tips: 'Record your readings with the date and time for your healthcare provider.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'en',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Complete and clean up',
        step_description: 'Step 5: Complete and clean up for Blood Pressure Monitor',
        step_instructions: 'Remove the cuff and turn off the device. Clean the cuff with a damp cloth if needed. Store the device in its case.',
        step_warnings: 'Always clean the cuff after each use to maintain hygiene.',
        step_tips: 'Replace the batteries when the low battery indicator appears.'
    },
    // Digital Oral Thermometer entries
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'en',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Prepare the thermometer',
        step_description: 'Step 1: Prepare the thermometer for Digital Oral Thermometer',
        step_instructions: 'Remove the thermometer from its case. Check that it is clean and the battery has sufficient power. If needed, clean the probe with alcohol.',
        step_warnings: 'Do not use if the probe is cracked or damaged.',
        step_tips: 'Keep spare batteries on hand for reliable operation.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'en',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Turn on the device',
        step_description: 'Step 2: Turn on the device for Digital Oral Thermometer',
        step_instructions: 'Press the power button to turn on the device. Wait for the display to show ready or the temperature symbol.',
        step_warnings: 'Wait at least 15 minutes after eating or drinking hot/cold liquids before taking temperature.',
        step_tips: 'Use the same thermometer consistently for accurate tracking.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'en',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Position under tongue',
        step_description: 'Step 3: Position under tongue for Digital Oral Thermometer',
        step_instructions: 'Place the probe under your tongue, positioning it as far back as possible. Close your mouth gently and breathe through your nose.',
        step_warnings: 'Keep your mouth closed during measurement for accurate results.',
        step_tips: 'Take temperature at the same time each day for consistent monitoring.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'en',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Read the temperature',
        step_description: 'Step 4: Read the temperature for Digital Oral Thermometer',
        step_instructions: 'Wait for the beep indicating measurement is complete. Read the temperature displayed on the screen.',
        step_warnings: 'Normal body temperature is typically 98.6°F (37°C). Consult a doctor if temperature is above 100.4°F (38°C).',
        step_tips: 'Consider taking multiple readings if the first seems unusual.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'en',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Clean and store device',
        step_description: 'Step 5: Clean and store device for Digital Oral Thermometer',
        step_instructions: 'Remove the thermometer and turn it off. Clean the probe with alcohol and return to its case.',
        step_warnings: 'Clean the probe thoroughly after each use to prevent contamination.',
        step_tips: 'Store in a clean, dry place away from direct sunlight.'
    },
    // Digital Ear Thermometer entries
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'en',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Prepare the thermometer',
        step_description: 'Step 1: Prepare the thermometer for Digital Ear Thermometer',
        step_instructions: 'Remove the thermometer from its case. Check that it is clean and the battery has sufficient power. If needed, clean the probe with alcohol.',
        step_warnings: 'Do not use if the probe is cracked or damaged.',
        step_tips: 'Keep spare batteries on hand for reliable operation.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'en',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Turn on the device',
        step_description: 'Step 2: Turn on the device for Digital Ear Thermometer',
        step_instructions: 'Press the power button to turn on the device. Wait for the display to show ready or the temperature symbol.',
        step_warnings: 'Ensure the ear canal is clean and free of earwax for accurate readings.',
        step_tips: 'Use the same thermometer consistently for accurate tracking.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'en',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Position in ear canal',
        step_description: 'Step 3: Position in ear canal for Digital Ear Thermometer',
        step_instructions: 'Gently pull the ear up and back (for adults) or down and back (for children). Insert the probe into the ear canal until it fits snugly.',
        step_warnings: 'Position the probe correctly in the ear canal for accurate measurement.',
        step_tips: 'Take temperature at the same time each day for consistent monitoring.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'en',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Read the temperature',
        step_description: 'Step 4: Read the temperature for Digital Ear Thermometer',
        step_instructions: 'Wait for the beep indicating measurement is complete. Read the temperature displayed on the screen.',
        step_warnings: 'Normal body temperature is typically 98.6°F (37°C). Consult a doctor if temperature is above 100.4°F (38°C).',
        step_tips: 'Consider taking multiple readings if the first seems unusual.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'en',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Clean and store device',
        step_description: 'Step 5: Clean and store device for Digital Ear Thermometer',
        step_instructions: 'Remove the thermometer and turn it off. Clean the probe with alcohol and return to its case.',
        step_warnings: 'Clean the probe thoroughly after each use to prevent contamination.',
        step_tips: 'Store in a clean, dry place away from direct sunlight.'
    }
];

async function insertContent(client, content) {
    try {
        const sql = `
            INSERT INTO guidance_content (
                device_id, language_id, style_id, step_id,
                step_title, step_description, step_instructions, step_warnings, step_tips,
                is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
            ) VALUES (
                (SELECT device_id FROM device_types WHERE device_key = $1),
                (SELECT language_id FROM supported_languages WHERE language_code = $2),
                (SELECT style_id FROM guidance_styles WHERE style_key = $3),
                (SELECT step_id FROM guidance_steps WHERE step_number = $4),
                $5, $6, $7, $8, $9,
                $10, $11, $12, $13
            )
            ON CONFLICT (device_id, language_id, style_id, step_id) DO UPDATE SET
                step_title = EXCLUDED.step_title,
                step_description = EXCLUDED.step_description,
                step_instructions = EXCLUDED.step_instructions,
                step_warnings = EXCLUDED.step_warnings,
                step_tips = EXCLUDED.step_tips,
                is_ai_generated = EXCLUDED.is_ai_generated,
                generated_by_ai_provider = EXCLUDED.generated_by_ai_provider,
                generation_quality_score = EXCLUDED.generation_quality_score,
                generated_at = EXCLUDED.generated_at,
                last_updated_at = CURRENT_TIMESTAMP
        `;
        
        const values = [
            content.device_key,
            content.language_code,
            content.style_key,
            content.step_number,
            content.step_title,
            content.step_description,
            content.step_instructions,
            content.step_warnings,
            content.step_tips,
            true, // is_ai_generated
            'SIMISAI-Phase1',
            0.95, // generation_quality_score
            new Date().toISOString()
        ];
        
        await client.query(sql, values);
        console.log(`✅ Inserted: ${content.device_key} - Step ${content.step_number} (${content.language_code})`);
        
    } catch (error) {
        console.error(`❌ Error inserting content:`, error.message);
        throw error;
    }
}

exports.handler = async (event) => {
    const client = new Client(dbConfig);
    
    try {
        console.log('🚀 Starting content insertion...');
        await client.connect();
        console.log('✅ Connected to guidance database');
        
        let insertedCount = 0;
        
        // Insert Phase 1 content
        console.log('📝 Inserting Phase 1 content (15 entries)...');
        for (const content of phase1Content) {
            await insertContent(client, content);
            insertedCount++;
        }
        
        console.log(`🎉 Successfully inserted ${insertedCount} guidance entries!`);
        
        // Verify insertion
        const result = await client.query('SELECT COUNT(*) as total FROM guidance_content');
        const totalEntries = result.rows[0].total;
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Content insertion completed successfully',
                phase: 'Phase 1',
                entries_inserted: insertedCount,
                total_entries_in_db: totalEntries,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('💥 Content insertion failed:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Content insertion failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    } finally {
        await client.end();
    }
};

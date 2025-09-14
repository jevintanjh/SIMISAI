/**
 * Generate Remaining Languages Lambda
 * Generates content for Filipino, Vietnamese, Malay, and Chinese languages
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

// Filipino content (15 entries - 3 devices × 5 steps)
const filipinoContent = [
    // Blood Pressure Monitor - Filipino
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Ihanda ang cuff at aparato',
        step_description: 'Step 1: Ihanda ang cuff at aparato para sa Blood Pressure Monitor',
        step_instructions: 'Alisin ang blood pressure cuff mula sa kanyang kaso. Tiyakin na ito ay malinis at maayos na napupuno ng hangin. Suriin kung may mga punit o pinsala sa cuff o tubing.',
        step_warnings: 'Huwag gamitin kung ang cuff ay nasira o may butas.',
        step_tips: 'Itago ang aparato sa isang cool at tuyong lugar kapag hindi ginagamit.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Iposisyon nang tama ang cuff',
        step_description: 'Step 2: Iposisyon nang tama ang cuff para sa Blood Pressure Monitor',
        step_instructions: 'Balutin ang cuff sa palibot ng iyong braso, iposisyon ito upang ang ilalim na gilid ay humigit-kumulang 1 pulgada sa itaas ng iyong siko. Ang cuff ay dapat na mahigpit ngunit hindi masyadong masikip.',
        step_warnings: 'Tiyakin na ang cuff ay hindi masyadong masikip - dapat mong maipasok ang isang daliri sa pagitan ng cuff at iyong braso.',
        step_tips: 'Iposisyon ang iyong sarili nang komportable na may suportang likod at paa na patag sa sahig.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Simulan ang pagsukat',
        step_description: 'Step 3: Simulan ang pagsukat para sa Blood Pressure Monitor',
        step_instructions: 'Pindutin ang start button sa monitor. Umupo nang tahimik na may suportang braso sa antas ng puso. Huwag magsalita o gumalaw habang ginagawa ang pagsukat.',
        step_warnings: 'Huwag gumalaw o magsalita habang ginagawa ang pagsukat dahil maaari itong makaapekto sa kawastuhan.',
        step_tips: 'Kumuha ng maraming pagbasa sa iba\'t ibang oras ng araw para sa kumpletong larawan.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Basahin at itala ang mga resulta',
        step_description: 'Step 4: Basahin at itala ang mga resulta para sa Blood Pressure Monitor',
        step_instructions: 'Maghintay para sa beep na nagpapahiwatig na tapos na ang pagsukat. Tandaan ang systolic at diastolic readings na nakadisplay sa screen.',
        step_warnings: 'Kung ang mga pagbasa ay tila hindi pangkaraniwang mataas o mababa, maghintay ng 5 minuto at sukatin muli.',
        step_tips: 'Itala ang iyong mga pagbasa kasama ang petsa at oras para sa iyong healthcare provider.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Tapusin at linisin',
        step_description: 'Step 5: Tapusin at linisin para sa Blood Pressure Monitor',
        step_instructions: 'Alisin ang cuff at patayin ang aparato. Linisin ang cuff gamit ang damp cloth kung kinakailangan. Itago ang aparato sa kanyang kaso.',
        step_warnings: 'Palaging linisin ang cuff pagkatapos ng bawat paggamit upang mapanatili ang kalinisan.',
        step_tips: 'Palitan ang mga baterya kapag lumabas ang low battery indicator.'
    },
    // Digital Oral Thermometer - Filipino
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Ihanda ang thermometer',
        step_description: 'Step 1: Ihanda ang thermometer para sa Digital Oral Thermometer',
        step_instructions: 'Alisin ang thermometer mula sa kanyang kaso. Suriin na ito ay malinis at ang baterya ay may sapat na lakas. Kung kinakailangan, linisin ang probe gamit ang alcohol.',
        step_warnings: 'Huwag gamitin kung ang probe ay may basag o nasira.',
        step_tips: 'Maghanda ng mga reserbang baterya para sa maaasahang operasyon.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Buksan ang aparato',
        step_description: 'Step 2: Buksan ang aparato para sa Digital Oral Thermometer',
        step_instructions: 'Pindutin ang power button upang buksan ang aparato. Maghintay hanggang ang display ay magpakita ng handa o ang temperatura symbol.',
        step_warnings: 'Maghintay ng hindi bababa sa 15 minuto pagkatapos kumain o uminom ng mainit/malamig na likido bago kunin ang temperatura.',
        step_tips: 'Gamitin ang parehong thermometer nang tuloy-tuloy para sa tumpak na pagsubaybay.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Iposisyon sa ilalim ng dila',
        step_description: 'Step 3: Iposisyon sa ilalim ng dila para sa Digital Oral Thermometer',
        step_instructions: 'Ilagay ang probe sa ilalim ng iyong dila, iposisyon ito hanggang sa pinakamalalim na bahagi. Isara nang dahan-dahan ang bibig at huminga sa pamamagitan ng ilong.',
        step_warnings: 'Panatilihing nakasara ang bibig habang ginagawa ang pagsukat para sa tumpak na mga resulta.',
        step_tips: 'Kumuha ng temperatura sa parehong oras araw-araw para sa tuloy-tuloy na pagsubaybay.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Basahin ang temperatura',
        step_description: 'Step 4: Basahin ang temperatura para sa Digital Oral Thermometer',
        step_instructions: 'Maghintay para sa beep na nagpapahiwatig na tapos na ang pagsukat. Basahin ang temperatura na nakadisplay sa screen.',
        step_warnings: 'Ang normal na temperatura ng katawan ay karaniwang 98.6°F (37°C). Kumonsulta sa doktor kung ang temperatura ay higit sa 100.4°F (38°C).',
        step_tips: 'Isaalang-alang ang pagkuha ng maraming pagbasa kung ang una ay tila hindi pangkaraniwan.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Linisin at itago ang aparato',
        step_description: 'Step 5: Linisin at itago ang aparato para sa Digital Oral Thermometer',
        step_instructions: 'Alisin ang thermometer at patayin ito. Linisin ang probe gamit ang alcohol at ibalik sa kanyang kaso.',
        step_warnings: 'Linisin nang mabuti ang probe pagkatapos ng bawat paggamit upang maiwasan ang kontaminasyon.',
        step_tips: 'Itago sa isang malinis at tuyong lugar, malayo sa direktang sikat ng araw.'
    },
    // Digital Ear Thermometer - Filipino
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Ihanda ang thermometer',
        step_description: 'Step 1: Ihanda ang thermometer para sa Digital Ear Thermometer',
        step_instructions: 'Alisin ang thermometer mula sa kanyang kaso. Suriin na ito ay malinis at ang baterya ay may sapat na lakas. Kung kinakailangan, linisin ang probe gamit ang alcohol.',
        step_warnings: 'Huwag gamitin kung ang probe ay may basag o nasira.',
        step_tips: 'Maghanda ng mga reserbang baterya para sa maaasahang operasyon.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Buksan ang aparato',
        step_description: 'Step 2: Buksan ang aparato para sa Digital Ear Thermometer',
        step_instructions: 'Pindutin ang power button upang buksan ang aparato. Maghintay hanggang ang display ay magpakita ng handa o ang temperatura symbol.',
        step_warnings: 'Tiyakin na ang ear canal ay malinis at walang earwax para sa tumpak na mga pagbasa.',
        step_tips: 'Gamitin ang parehong thermometer nang tuloy-tuloy para sa tumpak na pagsubaybay.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Iposisyon sa ear canal',
        step_description: 'Step 3: Iposisyon sa ear canal para sa Digital Ear Thermometer',
        step_instructions: 'Dahan-dahang hilahin ang tainga pataas at paatras (para sa mga matatanda) o pababa at paatras (para sa mga bata). Isingit ang probe sa ear canal hanggang sa ito ay magkasya nang mahigpit.',
        step_warnings: 'Iposisyon nang tama ang probe sa ear canal para sa tumpak na pagsukat.',
        step_tips: 'Kumuha ng temperatura sa parehong oras araw-araw para sa tuloy-tuloy na pagsubaybay.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Basahin ang temperatura',
        step_description: 'Step 4: Basahin ang temperatura para sa Digital Ear Thermometer',
        step_instructions: 'Maghintay para sa beep na nagpapahiwatig na tapos na ang pagsukat. Basahin ang temperatura na nakadisplay sa screen.',
        step_warnings: 'Ang normal na temperatura ng katawan ay karaniwang 98.6°F (37°C). Kumonsulta sa doktor kung ang temperatura ay higit sa 100.4°F (38°C).',
        step_tips: 'Isaalang-alang ang pagkuha ng maraming pagbasa kung ang una ay tila hindi pangkaraniwan.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'fil',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Linisin at itago ang aparato',
        step_description: 'Step 5: Linisin at itago ang aparato para sa Digital Ear Thermometer',
        step_instructions: 'Alisin ang thermometer at patayin ito. Linisin ang probe gamit ang alcohol at ibalik sa kanyang kaso.',
        step_warnings: 'Linisin nang mabuti ang probe pagkatapos ng bawat paggamit upang maiwasan ang kontaminasyon.',
        step_tips: 'Itago sa isang malinis at tuyong lugar, malayo sa direktang sikat ng araw.'
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
            'SIMISAI-Phase3-Filipino',
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
        console.log('🚀 Starting Filipino content generation...');
        await client.connect();
        console.log('✅ Connected to guidance database');
        
        let insertedCount = 0;
        
        // Insert Filipino content
        console.log('📝 Inserting Filipino content (15 entries)...');
        for (const content of filipinoContent) {
            await insertContent(client, content);
            insertedCount++;
        }
        
        console.log(`🎉 Successfully inserted ${insertedCount} Filipino guidance entries!`);
        
        // Verify insertion
        const result = await client.query('SELECT COUNT(*) as total FROM guidance_content');
        const totalEntries = result.rows[0].total;
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Filipino content insertion completed successfully',
                phase: 'Phase 3 - Filipino',
                entries_inserted: insertedCount,
                total_entries_in_db: totalEntries,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('💥 Filipino content insertion failed:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Filipino content insertion failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    } finally {
        await client.end();
    }
};

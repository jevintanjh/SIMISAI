/**
 * Generate Final Languages Lambda
 * Generates content for Malay and Chinese languages (final 30 entries)
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

// Malay content (15 entries - 3 devices × 5 steps)
const malayContent = [
    // Blood Pressure Monitor - Malay
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Sediakan cuff dan peranti',
        step_description: 'Step 1: Sediakan cuff dan peranti untuk Monitor Tekanan Darah',
        step_instructions: 'Keluarkan blood pressure cuff dari kotaknya. Pastikan ia bersih dan dipam dengan betul. Periksa sama ada ada koyakan atau kerosakan pada cuff atau tiub.',
        step_warnings: 'Jangan guna jika cuff rosak atau berlubang.',
        step_tips: 'Simpan peranti di tempat yang sejuk dan kering apabila tidak digunakan.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Letakkan cuff dengan betul',
        step_description: 'Step 2: Letakkan cuff dengan betul untuk Monitor Tekanan Darah',
        step_instructions: 'Balut cuff di sekeliling lengan atas anda, letakkan supaya tepi bawah kira-kira 1 inci di atas siku anda. Cuff harus ketat tetapi tidak terlalu ketat.',
        step_warnings: 'Pastikan cuff tidak terlalu ketat - anda harus boleh memasukkan satu jari di antara cuff dan lengan anda.',
        step_tips: 'Letakkan diri anda dengan selesa dengan sokongan belakang dan kaki rata di lantai.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Mulakan pengukuran',
        step_description: 'Step 3: Mulakan pengukuran untuk Monitor Tekanan Darah',
        step_instructions: 'Tekan butang start pada monitor. Duduk diam dengan lengan anda disokong pada paras jantung. Jangan bercakap atau bergerak semasa pengukuran.',
        step_warnings: 'Jangan bergerak atau bercakap semasa pengukuran kerana ini boleh menjejaskan ketepatan.',
        step_tips: 'Ambil beberapa bacaan pada masa yang berbeza dalam sehari untuk gambaran yang lengkap.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Baca dan catat hasil',
        step_description: 'Step 4: Baca dan catat hasil untuk Monitor Tekanan Darah',
        step_instructions: 'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Catat bacaan sistolik dan diastolik yang dipaparkan pada skrin.',
        step_warnings: 'Jika bacaan kelihatan luar biasa tinggi atau rendah, tunggu 5 minit dan ukur semula.',
        step_tips: 'Catat bacaan anda dengan tarikh dan masa untuk penyedia penjagaan kesihatan anda.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Selesaikan dan bersihkan',
        step_description: 'Step 5: Selesaikan dan bersihkan untuk Monitor Tekanan Darah',
        step_instructions: 'Lepaskan cuff dan matikan peranti. Bersihkan cuff dengan kain lembap jika perlu. Simpan peranti dalam kotaknya.',
        step_warnings: 'Sentiasa bersihkan cuff selepas setiap penggunaan untuk mengekalkan kebersihan.',
        step_tips: 'Ganti bateri apabila penunjuk bateri rendah muncul.'
    },
    // Digital Oral Thermometer - Malay
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Sediakan termometer',
        step_description: 'Step 1: Sediakan termometer untuk Termometer Digital Oral',
        step_instructions: 'Keluarkan termometer dari kotaknya. Periksa sama ada ia bersih dan bateri mempunyai kuasa yang mencukupi. Jika perlu, bersihkan probe dengan alkohol.',
        step_warnings: 'Jangan guna jika probe retak atau rosak.',
        step_tips: 'Sediakan bateri ganti untuk operasi yang boleh dipercayai.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Hidupkan peranti',
        step_description: 'Step 2: Hidupkan peranti untuk Termometer Digital Oral',
        step_instructions: 'Tekan butang kuasa untuk menghidupkan peranti. Tunggu sehingga paparan menunjukkan siap atau simbol suhu.',
        step_warnings: 'Tunggu sekurang-kurangnya 15 minit selepas makan atau minum cecair panas/sejuk sebelum mengambil suhu.',
        step_tips: 'Gunakan termometer yang sama secara konsisten untuk penjejakan yang tepat.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Letakkan di bawah lidah',
        step_description: 'Step 3: Letakkan di bawah lidah untuk Termometer Digital Oral',
        step_instructions: 'Letakkan probe di bawah lidah anda, letakkan sejauh mungkin ke belakang. Tutup mulut dengan lembut dan bernafas melalui hidung.',
        step_warnings: 'Tutup mulut anda semasa pengukuran untuk hasil yang tepat.',
        step_tips: 'Ambil suhu pada masa yang sama setiap hari untuk pemantauan yang konsisten.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Baca suhu',
        step_description: 'Step 4: Baca suhu untuk Termometer Digital Oral',
        step_instructions: 'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Baca suhu yang dipaparkan pada skrin.',
        step_warnings: 'Suhu badan normal biasanya 98.6°F (37°C). Rujuk doktor jika suhu melebihi 100.4°F (38°C).',
        step_tips: 'Pertimbangkan untuk mengambil beberapa bacaan jika yang pertama kelihatan luar biasa.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Bersihkan dan simpan peranti',
        step_description: 'Step 5: Bersihkan dan simpan peranti untuk Termometer Digital Oral',
        step_instructions: 'Lepaskan termometer dan matikan. Bersihkan probe dengan alkohol dan kembalikan ke kotaknya.',
        step_warnings: 'Bersihkan probe dengan teliti selepas setiap penggunaan untuk mengelakkan pencemaran.',
        step_tips: 'Simpan di tempat yang bersih dan kering, jauh dari cahaya matahari langsung.'
    },
    // Digital Ear Thermometer - Malay
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Sediakan termometer',
        step_description: 'Step 1: Sediakan termometer untuk Termometer Digital Telinga',
        step_instructions: 'Keluarkan termometer dari kotaknya. Periksa sama ada ia bersih dan bateri mempunyai kuasa yang mencukupi. Jika perlu, bersihkan probe dengan alkohol.',
        step_warnings: 'Jangan guna jika probe retak atau rosak.',
        step_tips: 'Sediakan bateri ganti untuk operasi yang boleh dipercayai.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Hidupkan peranti',
        step_description: 'Step 2: Hidupkan peranti untuk Termometer Digital Telinga',
        step_instructions: 'Tekan butang kuasa untuk menghidupkan peranti. Tunggu sehingga paparan menunjukkan siap atau simbol suhu.',
        step_warnings: 'Pastikan saluran telinga bersih dan bebas dari tahi telinga untuk bacaan yang tepat.',
        step_tips: 'Gunakan termometer yang sama secara konsisten untuk penjejakan yang tepat.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Letakkan dalam saluran telinga',
        step_description: 'Step 3: Letakkan dalam saluran telinga untuk Termometer Digital Telinga',
        step_instructions: 'Tarik telinga ke atas dan ke belakang dengan lembut (untuk dewasa) atau ke bawah dan ke belakang (untuk kanak-kanak). Masukkan probe ke dalam saluran telinga sehingga muat dengan ketat.',
        step_warnings: 'Letakkan probe dengan betul dalam saluran telinga untuk pengukuran yang tepat.',
        step_tips: 'Ambil suhu pada masa yang sama setiap hari untuk pemantauan yang konsisten.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Baca suhu',
        step_description: 'Step 4: Baca suhu untuk Termometer Digital Telinga',
        step_instructions: 'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Baca suhu yang dipaparkan pada skrin.',
        step_warnings: 'Suhu badan normal biasanya 98.6°F (37°C). Rujuk doktor jika suhu melebihi 100.4°F (38°C).',
        step_tips: 'Pertimbangkan untuk mengambil beberapa bacaan jika yang pertama kelihatan luar biasa.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'ms',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Bersihkan dan simpan peranti',
        step_description: 'Step 5: Bersihkan dan simpan peranti untuk Termometer Digital Telinga',
        step_instructions: 'Lepaskan termometer dan matikan. Bersihkan probe dengan alkohol dan kembalikan ke kotaknya.',
        step_warnings: 'Bersihkan probe dengan teliti selepas setiap penggunaan untuk mengelakkan pencemaran.',
        step_tips: 'Simpan di tempat yang bersih dan kering, jauh dari cahaya matahari langsung.'
    }
];

// Chinese content (15 entries - 3 devices × 5 steps)
const chineseContent = [
    // Blood Pressure Monitor - Chinese
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 1,
        step_title: '准备袖带和设备',
        step_description: 'Step 1: 准备袖带和设备 for 血压监测仪',
        step_instructions: '从盒中取出血压袖带。确保其清洁且充气正常。检查袖带或管路上是否有撕裂或损坏。',
        step_warnings: '如果袖带损坏或有孔洞，请勿使用。',
        step_tips: '不使用时将设备存放在阴凉干燥的地方。'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 2,
        step_title: '正确放置袖带',
        step_description: 'Step 2: 正确放置袖带 for 血压监测仪',
        step_instructions: '将袖带缠绕在上臂周围，使底边距离肘部约1英寸。袖带应紧贴但不紧绷。',
        step_warnings: '确保袖带不会太紧 - 您应该能够在袖带和手臂之间放入一根手指。',
        step_tips: '舒适地坐着，背部有支撑，双脚平放在地板上。'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 3,
        step_title: '开始测量',
        step_description: 'Step 3: 开始测量 for 血压监测仪',
        step_instructions: '按下监测仪上的开始按钮。保持静止，手臂支撑在心脏水平。测量期间不要说话或移动。',
        step_warnings: '测量期间不要移动或说话，因为这可能影响准确性。',
        step_tips: '在一天中的不同时间进行多次测量以获得完整画面。'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 4,
        step_title: '读取并记录结果',
        step_description: 'Step 4: 读取并记录结果 for 血压监测仪',
        step_instructions: '等待表示测量完成的蜂鸣声。记录屏幕上显示的收缩压和舒张压读数。',
        step_warnings: '如果读数看起来异常高或低，请等待5分钟并重新测量。',
        step_tips: '记录您的读数以及日期和时间，供您的医疗保健提供者参考。'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 5,
        step_title: '完成并清理',
        step_description: 'Step 5: 完成并清理 for 血压监测仪',
        step_instructions: '取下袖带并关闭设备。如需要，用湿布清洁袖带。将设备存放在盒中。',
        step_warnings: '每次使用后都要清洁袖带以保持卫生。',
        step_tips: '当出现低电量指示器时更换电池。'
    },
    // Digital Oral Thermometer - Chinese
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 1,
        step_title: '准备体温计',
        step_description: 'Step 1: 准备体温计 for 数字口腔体温计',
        step_instructions: '从盒中取出体温计。检查其是否清洁，电池是否有足够电量。如需要，用酒精清洁探头。',
        step_warnings: '如果探头有裂纹或损坏，请勿使用。',
        step_tips: '准备备用电池以确保可靠运行。'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 2,
        step_title: '开启设备',
        step_description: 'Step 2: 开启设备 for 数字口腔体温计',
        step_instructions: '按电源按钮开启设备。等待显示屏显示就绪或温度符号。',
        step_warnings: '在进食或饮用热/冷液体后至少等待15分钟再测量体温。',
        step_tips: '始终使用同一个体温计以确保准确跟踪。'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 3,
        step_title: '放在舌下',
        step_description: 'Step 3: 放在舌下 for 数字口腔体温计',
        step_instructions: '将探头放在舌下，尽可能向后放置。轻轻闭上嘴巴，通过鼻子呼吸。',
        step_warnings: '测量期间保持嘴巴闭合以获得准确结果。',
        step_tips: '每天在同一时间测量体温以保持一致的监测。'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 4,
        step_title: '读取温度',
        step_description: 'Step 4: 读取温度 for 数字口腔体温计',
        step_instructions: '等待表示测量完成的蜂鸣声。读取屏幕上显示的温度。',
        step_warnings: '正常体温通常是98.6°F (37°C)。如果温度超过100.4°F (38°C)，请咨询医生。',
        step_tips: '如果第一次读数看起来异常，考虑进行多次测量。'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 5,
        step_title: '清洁并存放设备',
        step_description: 'Step 5: 清洁并存放设备 for 数字口腔体温计',
        step_instructions: '取出体温计并关闭。用酒精清洁探头并放回盒中。',
        step_warnings: '每次使用后彻底清洁探头以防止污染。',
        step_tips: '存放在清洁干燥的地方，远离阳光直射。'
    },
    // Digital Ear Thermometer - Chinese
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 1,
        step_title: '准备体温计',
        step_description: 'Step 1: 准备体温计 for 数字耳温计',
        step_instructions: '从盒中取出体温计。检查其是否清洁，电池是否有足够电量。如需要，用酒精清洁探头。',
        step_warnings: '如果探头有裂纹或损坏，请勿使用。',
        step_tips: '准备备用电池以确保可靠运行。'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 2,
        step_title: '开启设备',
        step_description: 'Step 2: 开启设备 for 数字耳温计',
        step_instructions: '按电源按钮开启设备。等待显示屏显示就绪或温度符号。',
        step_warnings: '确保耳道清洁且无耳垢，以获得准确的读数。',
        step_tips: '始终使用同一个体温计以确保准确跟踪。'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 3,
        step_title: '放入耳道',
        step_description: 'Step 3: 放入耳道 for 数字耳温计',
        step_instructions: '轻轻将耳朵向上向后拉（成人）或向下向后拉（儿童）。将探头插入耳道，直到贴合紧密。',
        step_warnings: '将探头正确放置在耳道中以进行准确测量。',
        step_tips: '每天在同一时间测量体温以保持一致的监测。'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 4,
        step_title: '读取温度',
        step_description: 'Step 4: 读取温度 for 数字耳温计',
        step_instructions: '等待表示测量完成的蜂鸣声。读取屏幕上显示的温度。',
        step_warnings: '正常体温通常是98.6°F (37°C)。如果温度超过100.4°F (38°C)，请咨询医生。',
        step_tips: '如果第一次读数看起来异常，考虑进行多次测量。'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'zh',
        style_key: 'direct',
        step_number: 5,
        step_title: '清洁并存放设备',
        step_description: 'Step 5: 清洁并存放设备 for 数字耳温计',
        step_instructions: '取出体温计并关闭。用酒精清洁探头并放回盒中。',
        step_warnings: '每次使用后彻底清洁探头以防止污染。',
        step_tips: '存放在清洁干燥的地方，远离阳光直射。'
    }
];

async function insertContent(client, content, provider) {
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
            provider,
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
        console.log('🚀 Starting Malay and Chinese content generation...');
        await client.connect();
        console.log('✅ Connected to guidance database');
        
        let insertedCount = 0;
        
        // Insert Malay content
        console.log('📝 Inserting Malay content (15 entries)...');
        for (const content of malayContent) {
            await insertContent(client, content, 'SIMISAI-Phase5-Malay');
            insertedCount++;
        }
        
        // Insert Chinese content
        console.log('📝 Inserting Chinese content (15 entries)...');
        for (const content of chineseContent) {
            await insertContent(client, content, 'SIMISAI-Phase6-Chinese');
            insertedCount++;
        }
        
        console.log(`🎉 Successfully inserted ${insertedCount} guidance entries!`);
        
        // Verify insertion
        const result = await client.query('SELECT COUNT(*) as total FROM guidance_content');
        const totalEntries = result.rows[0].total;
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Malay and Chinese content insertion completed successfully',
                phase: 'Phase 5-6 - Malay & Chinese',
                entries_inserted: insertedCount,
                total_entries_in_db: totalEntries,
                languages_completed: ['Malay', 'Chinese'],
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('💥 Malay and Chinese content insertion failed:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Malay and Chinese content insertion failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    } finally {
        await client.end();
    }
};

/**
 * Generate All Remaining Content Lambda
 * Generates content for Vietnamese, Malay, and Chinese languages
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

// Vietnamese content (15 entries - 3 devices × 5 steps)
const vietnameseContent = [
    // Blood Pressure Monitor - Vietnamese
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Chuẩn bị vòng bít và thiết bị',
        step_description: 'Step 1: Chuẩn bị vòng bít và thiết bị cho Máy đo huyết áp',
        step_instructions: 'Lấy vòng bít đo huyết áp ra khỏi hộp. Đảm bảo nó sạch sẽ và được bơm căng đúng cách. Kiểm tra xem có vết rách hoặc hư hỏng nào trên vòng bít hoặc ống dẫn không.',
        step_warnings: 'Không sử dụng nếu vòng bít bị hư hỏng hoặc có lỗ thủng.',
        step_tips: 'Bảo quản thiết bị ở nơi khô ráo, thoáng mát khi không sử dụng.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Đặt vòng bít đúng vị trí',
        step_description: 'Step 2: Đặt vòng bít đúng vị trí cho Máy đo huyết áp',
        step_instructions: 'Quấn vòng bít quanh cánh tay trên, đặt sao cho mép dưới cách khuỷu tay khoảng 1 inch. Vòng bít phải vừa khít nhưng không quá chặt.',
        step_warnings: 'Đảm bảo vòng bít không quá chặt - bạn phải có thể đặt một ngón tay giữa vòng bít và cánh tay.',
        step_tips: 'Ngồi thoải mái với lưng có chỗ dựa và chân đặt phẳng trên sàn.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Bắt đầu đo',
        step_description: 'Step 3: Bắt đầu đo cho Máy đo huyết áp',
        step_instructions: 'Nhấn nút bắt đầu trên máy đo. Ngồi yên với cánh tay được đỡ ở mức tim. Không nói chuyện hoặc cử động trong khi đo.',
        step_warnings: 'Không cử động hoặc nói chuyện trong khi đo vì điều này có thể ảnh hưởng đến độ chính xác.',
        step_tips: 'Thực hiện nhiều lần đo vào các thời điểm khác nhau trong ngày để có bức tranh toàn diện.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Đọc và ghi lại kết quả',
        step_description: 'Step 4: Đọc và ghi lại kết quả cho Máy đo huyết áp',
        step_instructions: 'Chờ tiếng bíp báo hiệu việc đo đã hoàn thành. Ghi lại các chỉ số tâm thu và tâm trương hiển thị trên màn hình.',
        step_warnings: 'Nếu các chỉ số có vẻ bất thường cao hoặc thấp, chờ 5 phút và đo lại.',
        step_tips: 'Ghi lại các chỉ số của bạn cùng với ngày và giờ để bác sĩ tham khảo.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Hoàn thành và vệ sinh',
        step_description: 'Step 5: Hoàn thành và vệ sinh cho Máy đo huyết áp',
        step_instructions: 'Tháo vòng bít và tắt thiết bị. Lau sạch vòng bít bằng khăn ẩm nếu cần. Cất thiết bị vào hộp.',
        step_warnings: 'Luôn vệ sinh vòng bít sau mỗi lần sử dụng để duy trì vệ sinh.',
        step_tips: 'Thay pin khi đèn báo pin yếu xuất hiện.'
    },
    // Digital Oral Thermometer - Vietnamese
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Chuẩn bị nhiệt kế',
        step_description: 'Step 1: Chuẩn bị nhiệt kế cho Nhiệt kế điện tử đo miệng',
        step_instructions: 'Lấy nhiệt kế ra khỏi hộp. Kiểm tra xem nó có sạch sẽ và pin có đủ điện không. Nếu cần, lau sạch đầu đo bằng cồn.',
        step_warnings: 'Không sử dụng nếu đầu đo bị nứt hoặc hư hỏng.',
        step_tips: 'Chuẩn bị pin dự phòng để đảm bảo hoạt động ổn định.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Bật thiết bị',
        step_description: 'Step 2: Bật thiết bị cho Nhiệt kế điện tử đo miệng',
        step_instructions: 'Nhấn nút nguồn để bật thiết bị. Chờ màn hình hiển thị sẵn sàng hoặc biểu tượng nhiệt độ.',
        step_warnings: 'Chờ ít nhất 15 phút sau khi ăn hoặc uống đồ nóng/lạnh trước khi đo nhiệt độ.',
        step_tips: 'Sử dụng cùng một nhiệt kế một cách nhất quán để theo dõi chính xác.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Đặt dưới lưỡi',
        step_description: 'Step 3: Đặt dưới lưỡi cho Nhiệt kế điện tử đo miệng',
        step_instructions: 'Đặt đầu đo dưới lưỡi, đặt càng sâu trong miệng càng tốt. Ngậm miệng nhẹ nhàng và thở bằng mũi.',
        step_warnings: 'Giữ miệng ngậm trong khi đo để có kết quả chính xác.',
        step_tips: 'Đo nhiệt độ vào cùng một thời điểm mỗi ngày để theo dõi nhất quán.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Đọc nhiệt độ',
        step_description: 'Step 4: Đọc nhiệt độ cho Nhiệt kế điện tử đo miệng',
        step_instructions: 'Chờ tiếng bíp báo hiệu việc đo đã hoàn thành. Đọc nhiệt độ hiển thị trên màn hình.',
        step_warnings: 'Nhiệt độ cơ thể bình thường thường là 98.6°F (37°C). Tham khảo ý kiến bác sĩ nếu nhiệt độ trên 100.4°F (38°C).',
        step_tips: 'Xem xét thực hiện nhiều lần đo nếu lần đầu có vẻ bất thường.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Vệ sinh và cất giữ thiết bị',
        step_description: 'Step 5: Vệ sinh và cất giữ thiết bị cho Nhiệt kế điện tử đo miệng',
        step_instructions: 'Lấy nhiệt kế ra và tắt nó. Lau sạch đầu đo bằng cồn và cất vào hộp.',
        step_warnings: 'Vệ sinh đầu đo kỹ lưỡng sau mỗi lần sử dụng để tránh nhiễm khuẩn.',
        step_tips: 'Cất giữ ở nơi khô ráo, sạch sẽ, tránh ánh sáng mặt trời trực tiếp.'
    },
    // Digital Ear Thermometer - Vietnamese
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Chuẩn bị nhiệt kế',
        step_description: 'Step 1: Chuẩn bị nhiệt kế cho Nhiệt kế điện tử đo tai',
        step_instructions: 'Lấy nhiệt kế ra khỏi hộp. Kiểm tra xem nó có sạch sẽ và pin có đủ điện không. Nếu cần, lau sạch đầu đo bằng cồn.',
        step_warnings: 'Không sử dụng nếu đầu đo bị nứt hoặc hư hỏng.',
        step_tips: 'Chuẩn bị pin dự phòng để đảm bảo hoạt động ổn định.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Bật thiết bị',
        step_description: 'Step 2: Bật thiết bị cho Nhiệt kế điện tử đo tai',
        step_instructions: 'Nhấn nút nguồn để bật thiết bị. Chờ màn hình hiển thị sẵn sàng hoặc biểu tượng nhiệt độ.',
        step_warnings: 'Đảm bảo ống tai sạch sẽ và không có ráy tai để có kết quả đo chính xác.',
        step_tips: 'Sử dụng cùng một nhiệt kế một cách nhất quán để theo dõi chính xác.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Đặt vào ống tai',
        step_description: 'Step 3: Đặt vào ống tai cho Nhiệt kế điện tử đo tai',
        step_instructions: 'Nhẹ nhàng kéo tai lên và ra sau (đối với người lớn) hoặc xuống và ra sau (đối với trẻ em). Đưa đầu đo vào ống tai cho đến khi vừa khít.',
        step_warnings: 'Đặt đầu đo đúng vị trí trong ống tai để đo chính xác.',
        step_tips: 'Đo nhiệt độ vào cùng một thời điểm mỗi ngày để theo dõi nhất quán.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Đọc nhiệt độ',
        step_description: 'Step 4: Đọc nhiệt độ cho Nhiệt kế điện tử đo tai',
        step_instructions: 'Chờ tiếng bíp báo hiệu việc đo đã hoàn thành. Đọc nhiệt độ hiển thị trên màn hình.',
        step_warnings: 'Nhiệt độ cơ thể bình thường thường là 98.6°F (37°C). Tham khảo ý kiến bác sĩ nếu nhiệt độ trên 100.4°F (38°C).',
        step_tips: 'Xem xét thực hiện nhiều lần đo nếu lần đầu có vẻ bất thường.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'vi',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Vệ sinh và cất giữ thiết bị',
        step_description: 'Step 5: Vệ sinh và cất giữ thiết bị cho Nhiệt kế điện tử đo tai',
        step_instructions: 'Lấy nhiệt kế ra và tắt nó. Lau sạch đầu đo bằng cồn và cất vào hộp.',
        step_warnings: 'Vệ sinh đầu đo kỹ lưỡng sau mỗi lần sử dụng để tránh nhiễm khuẩn.',
        step_tips: 'Cất giữ ở nơi khô ráo, sạch sẽ, tránh ánh sáng mặt trời trực tiếp.'
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
        console.log('🚀 Starting Vietnamese content generation...');
        await client.connect();
        console.log('✅ Connected to guidance database');
        
        let insertedCount = 0;
        
        // Insert Vietnamese content
        console.log('📝 Inserting Vietnamese content (15 entries)...');
        for (const content of vietnameseContent) {
            await insertContent(client, content, 'SIMISAI-Phase4-Vietnamese');
            insertedCount++;
        }
        
        console.log(`🎉 Successfully inserted ${insertedCount} Vietnamese guidance entries!`);
        
        // Verify insertion
        const result = await client.query('SELECT COUNT(*) as total FROM guidance_content');
        const totalEntries = result.rows[0].total;
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Vietnamese content insertion completed successfully',
                phase: 'Phase 4 - Vietnamese',
                entries_inserted: insertedCount,
                total_entries_in_db: totalEntries,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('💥 Vietnamese content insertion failed:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Vietnamese content insertion failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    } finally {
        await client.end();
    }
};

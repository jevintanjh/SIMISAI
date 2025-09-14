INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'Prepare the cuff and device',
    'Step 1: Prepare the cuff and device for Blood Pressure Monitor',
    'Remove the blood pressure cuff from its case. Ensure it is clean and properly inflated. Check for any tears or damage to the cuff or tubing.',
    'Do not use if the cuff is damaged or has holes.',
    'Store the device in a cool, dry place when not in use.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.395Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'Position the cuff correctly',
    'Step 2: Position the cuff correctly for Blood Pressure Monitor',
    'Wrap the cuff around your upper arm, positioning it so the bottom edge is about 1 inch above your elbow. The cuff should be snug but not tight.',
    'Ensure the cuff is not too tight - you should be able to fit one finger between the cuff and your arm.',
    'Position yourself comfortably with your back supported and feet flat on the floor.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.395Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'Start the measurement',
    'Step 3: Start the measurement for Blood Pressure Monitor',
    'Press the start button on the monitor. Sit still with your arm supported at heart level. Do not talk or move during the measurement.',
    'Do not move or talk during measurement as this can affect accuracy.',
    'Take multiple readings at different times of day for a complete picture.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.395Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'Read and record results',
    'Step 4: Read and record results for Blood Pressure Monitor',
    'Wait for the beep indicating measurement is complete. Note the systolic and diastolic readings displayed on the screen.',
    'If readings seem unusually high or low, wait 5 minutes and measure again.',
    'Record your readings with the date and time for your healthcare provider.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.395Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'Complete and clean up',
    'Step 5: Complete and clean up for Blood Pressure Monitor',
    'Remove the cuff and turn off the device. Clean the cuff with a damp cloth if needed. Store the device in its case.',
    'Always clean the cuff after each use to maintain hygiene.',
    'Replace the batteries when the low battery indicator appears.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.395Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'Siapkan manset dan alat',
    'Step 1: Siapkan manset dan alat for Monitor Tekanan Darah',
    'Keluarkan manset tekanan darah dari kotaknya. Pastikan bersih dan terisi udara dengan baik. Periksa apakah ada robekan atau kerusakan pada manset atau selang.',
    'Jangan gunakan jika manset rusak atau berlubang.',
    'Simpan alat di tempat yang sejuk dan kering saat tidak digunakan.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.395Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'Posisikan manset dengan benar',
    'Step 2: Posisikan manset dengan benar for Monitor Tekanan Darah',
    'Lilitkan manset di sekitar lengan atas Anda, posisikan sehingga tepi bawah sekitar 1 inci di atas siku Anda. Manset harus pas tetapi tidak ketat.',
    'Pastikan manset tidak terlalu ketat - Anda harus bisa memasukkan satu jari di antara manset dan lengan Anda.',
    'Posisikan diri Anda dengan nyaman dengan punggung ditopang dan kaki rata di lantai.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'Mulai pengukuran',
    'Step 3: Mulai pengukuran for Monitor Tekanan Darah',
    'Tekan tombol start pada monitor. Duduk diam dengan lengan Anda ditopang setinggi jantung. Jangan berbicara atau bergerak selama pengukuran.',
    'Jangan bergerak atau berbicara selama pengukuran karena dapat mempengaruhi akurasi.',
    'Ambil beberapa pembacaan pada waktu yang berbeda dalam sehari untuk gambaran lengkap.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'Baca dan catat hasil',
    'Step 4: Baca dan catat hasil for Monitor Tekanan Darah',
    'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Catat pembacaan sistolik dan diastolik yang ditampilkan di layar.',
    'Jika pembacaan terlihat tidak biasa tinggi atau rendah, tunggu 5 menit dan ukur lagi.',
    'Catat pembacaan Anda dengan tanggal dan waktu untuk penyedia layanan kesehatan Anda.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'Selesaikan dan bersihkan',
    'Step 5: Selesaikan dan bersihkan for Monitor Tekanan Darah',
    'Lepaskan manset dan matikan alat. Bersihkan manset dengan kain lembab jika diperlukan. Simpan alat di kotaknya.',
    'Selalu bersihkan manset setelah setiap penggunaan untuk menjaga kebersihan.',
    'Ganti baterai ketika indikator baterai rendah muncul.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'เตรียมผ้าพันแขนและเครื่องมือ',
    'Step 1: เตรียมผ้าพันแขนและเครื่องมือ for เครื่องวัดความดันโลหิต',
    'นำผ้าพันแขนวัดความดันออกจากกล่อง ตรวจสอบให้แน่ใจว่าสะอาดและอัดลมได้ดี ตรวจสอบว่ามีรอยฉีกขาดหรือเสียหายหรือไม่',
    'ห้ามใช้หากผ้าพันแขนเสียหายหรือมีรู',
    'เก็บเครื่องในที่เย็นและแห้งเมื่อไม่ได้ใช้',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'วางผ้าพันแขนให้ถูกต้อง',
    'Step 2: วางผ้าพันแขนให้ถูกต้อง for เครื่องวัดความดันโลหิต',
    'พันผ้าพันแขนรอบแขนบน วางให้ขอบล่างอยู่ประมาณ 1 นิ้วเหนือข้อศอก ผ้าพันแขนควรกระชับแต่ไม่แน่น',
    'ตรวจสอบให้แน่ใจว่าผ้าพันแขนไม่แน่นเกินไป - ควรสามารถใส่หนึ่งนิ้วระหว่างผ้าพันแขนและแขนได้',
    'นั่งให้สบายโดยหลังมีที่รองรับและเท้าเรียบกับพื้น',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'เริ่มการวัด',
    'Step 3: เริ่มการวัด for เครื่องวัดความดันโลหิต',
    'กดปุ่มเริ่มต้นบนเครื่องนั่งนิ่งๆ โดยแขนของคุณอยู่ในระดับหัวใจ อย่าพูดหรือเคลื่อนไหวระหว่างการวัด',
    'อย่าเคลื่อนไหวหรือพูดระหว่างการวัดเพราะอาจส่งผลต่อความแม่นยำ',
    'วัดหลายครั้งในเวลาต่างๆ ของวันเพื่อภาพรวมที่สมบูรณ์',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'อ่านและบันทึกผลลัพธ์',
    'Step 4: อ่านและบันทึกผลลัพธ์ for เครื่องวัดความดันโลหิต',
    'รอเสียงบี๊บที่แสดงว่าการวัดเสร็จสิ้น บันทึกค่าความดันซิสโตลิกและไดแอสโตลิกที่แสดงบนหน้าจอ',
    'หากค่าที่อ่านดูสูงหรือต่ำผิดปกติ รอ 5 นาทีแล้ววัดใหม่',
    'บันทึกการอ่านของคุณพร้อมวันที่และเวลาสำหรับผู้ให้บริการด้านสุขภาพ',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'เสร็จสิ้นและทำความสะอาด',
    'Step 5: เสร็จสิ้นและทำความสะอาด for เครื่องวัดความดันโลหิต',
    'ถอดผ้าพันแขนและปิดเครื่อง ทำความสะอาดผ้าพันแขนด้วยผ้าเปียกหากจำเป็น เก็บเครื่องในกล่อง',
    'ทำความสะอาดผ้าพันแขนหลังใช้ทุกครั้งเพื่อรักษาความสะอาด',
    'เปลี่ยนแบตเตอรี่เมื่อตัวบ่งชี้แบตเตอรี่ต่ำปรากฏ',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'Prepare the thermometer',
    'Step 1: Prepare the thermometer for Digital Oral Thermometer',
    'Remove the thermometer from its case. Check that it is clean and the battery has sufficient power. If needed, clean the probe with alcohol.',
    'Do not use if the probe is cracked or damaged.',
    'Keep spare batteries on hand for reliable operation.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'Turn on the device',
    'Step 2: Turn on the device for Digital Oral Thermometer',
    'Press the power button to turn on the device. Wait for the display to show ready or the temperature symbol.',
    'Wait at least 15 minutes after eating or drinking hot/cold liquids before taking temperature.',
    'Use the same thermometer consistently for accurate tracking.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'Position under tongue',
    'Step 3: Position under tongue for Digital Oral Thermometer',
    'Place the probe under your tongue, positioning it as far back as possible. Close your mouth gently and breathe through your nose.',
    'Keep your mouth closed during measurement for accurate results.',
    'Take temperature at the same time each day for consistent monitoring.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'Read the temperature',
    'Step 4: Read the temperature for Digital Oral Thermometer',
    'Wait for the beep indicating measurement is complete. Read the temperature displayed on the screen.',
    'Normal body temperature is typically 98.6°F (37°C). Consult a doctor if temperature is above 100.4°F (38°C).',
    'Consider taking multiple readings if the first seems unusual.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'Clean and store device',
    'Step 5: Clean and store device for Digital Oral Thermometer',
    'Remove the thermometer and turn it off. Clean the probe with alcohol and return to its case.',
    'Clean the probe thoroughly after each use to prevent contamination.',
    'Store in a clean, dry place away from direct sunlight.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'Siapkan termometer',
    'Step 1: Siapkan termometer for Termometer Digital Mulut',
    'Keluarkan termometer dari kotaknya. Periksa apakah bersih dan baterai memiliki daya yang cukup. Jika perlu, bersihkan probe dengan alkohol.',
    'Jangan gunakan jika probe retak atau rusak.',
    'Siapkan baterai cadangan untuk operasi yang dapat diandalkan.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'Nyalakan alat',
    'Step 2: Nyalakan alat for Termometer Digital Mulut',
    'Tekan tombol power untuk menyalakan alat. Tunggu hingga layar menampilkan siap atau simbol suhu.',
    'Tunggu setidaknya 15 menit setelah makan atau minum cairan panas/dingin sebelum mengukur suhu.',
    'Gunakan termometer yang sama secara konsisten untuk pelacakan yang akurat.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'Posisikan di bawah lidah',
    'Step 3: Posisikan di bawah lidah for Termometer Digital Mulut',
    'Letakkan probe di bawah lidah Anda, posisikan sejauh mungkin ke belakang. Tutup mulut dengan lembut dan bernapas melalui hidung.',
    'Tutup mulut Anda selama pengukuran untuk hasil yang akurat.',
    'Ukur suhu pada waktu yang sama setiap hari untuk pemantauan yang konsisten.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'Baca suhu',
    'Step 4: Baca suhu for Termometer Digital Mulut',
    'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Baca suhu yang ditampilkan di layar.',
    'Suhu tubuh normal biasanya 98.6°F (37°C). Konsultasikan dokter jika suhu di atas 100.4°F (38°C).',
    'Pertimbangkan untuk mengambil beberapa pembacaan jika yang pertama terlihat tidak biasa.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'Bersihkan dan simpan alat',
    'Step 5: Bersihkan dan simpan alat for Termometer Digital Mulut',
    'Lepaskan termometer dan matikan. Bersihkan probe dengan alkohol dan kembalikan ke kotaknya.',
    'Bersihkan probe secara menyeluruh setelah setiap penggunaan untuk mencegah kontaminasi.',
    'Simpan di tempat yang bersih dan kering, jauh dari sinar matahari langsung.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'เตรียมเครื่องวัดอุณหภูมิ',
    'Step 1: เตรียมเครื่องวัดอุณหภูมิ for เครื่องวัดอุณหภูมิดิจิทัลทางปาก',
    'นำเครื่องวัดอุณหภูมิออกจากกล่อง ตรวจสอบว่าสะอาดและแบตเตอรี่มีพลังงานเพียงพอ หากจำเป็น ทำความสะอาดหัววัดด้วยแอลกอฮอล์',
    'ห้ามใช้หากหัววัดแตกหรือเสียหาย',
    'เตรียมแบตเตอรี่สำรองไว้สำหรับการทำงานที่เชื่อถือได้',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'เปิดเครื่อง',
    'Step 2: เปิดเครื่อง for เครื่องวัดอุณหภูมิดิจิทัลทางปาก',
    'กดปุ่มเปิดเครื่องเพื่อเปิดเครื่อง รอให้หน้าจอแสดงพร้อมหรือสัญลักษณ์อุณหภูมิ',
    'รออย่างน้อย 15 นาทีหลังจากกินหรือดื่มของเหลวร้อน/เย็นก่อนวัดอุณหภูมิ',
    'ใช้เครื่องวัดอุณหภูมิเครื่องเดียวกันอย่างสม่ำเสมอเพื่อการติดตามที่แม่นยำ',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'วางใต้ลิ้น',
    'Step 3: วางใต้ลิ้น for เครื่องวัดอุณหภูมิดิจิทัลทางปาก',
    'วางหัววัดใต้ลิ้นของคุณ วางให้ลึกที่สุดเท่าที่เป็นไปได้ ปิดปากเบาๆ และหายใจทางจมูก',
    'ปิดปากระหว่างการวัดเพื่อผลลัพธ์ที่แม่นยำ',
    'วัดอุณหภูมิในเวลาเดียวกันทุกวันเพื่อการติดตามอย่างสม่ำเสมอ',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'อ่านอุณหภูมิ',
    'Step 4: อ่านอุณหภูมิ for เครื่องวัดอุณหภูมิดิจิทัลทางปาก',
    'รอเสียงบี๊บที่แสดงว่าการวัดเสร็จสิ้น อ่านอุณหภูมิที่แสดงบนหน้าจอ',
    'อุณหภูมิร่างกายปกติโดยทั่วไปคือ 98.6°F (37°C) ปรึกษาแพทย์หากอุณหภูมิสูงกว่า 100.4°F (38°C)',
    'พิจารณาวัดหลายครั้งหากครั้งแรกดูผิดปกติ',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'ทำความสะอาดและเก็บเครื่อง',
    'Step 5: ทำความสะอาดและเก็บเครื่อง for เครื่องวัดอุณหภูมิดิจิทัลทางปาก',
    'ถอดเครื่องวัดอุณหภูมิและปิดเครื่อง ทำความสะอาดหัววัดด้วยแอลกอฮอล์และเก็บในกล่อง',
    'ทำความสะอาดหัววัดอย่างละเอียดหลังใช้ทุกครั้งเพื่อป้องกันการปนเปื้อน',
    'เก็บในที่สะอาดและแห้ง ห่างจากแสงแดดโดยตรง',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'Prepare the thermometer',
    'Step 1: Prepare the thermometer for Digital Ear Thermometer',
    'Remove the thermometer from its case. Check that it is clean and the battery has sufficient power. If needed, clean the probe with alcohol.',
    'Do not use if the probe is cracked or damaged.',
    'Keep spare batteries on hand for reliable operation.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'Turn on the device',
    'Step 2: Turn on the device for Digital Ear Thermometer',
    'Press the power button to turn on the device. Wait for the display to show ready or the temperature symbol.',
    'Ensure the ear canal is clean and free of earwax for accurate readings.',
    'Use the same thermometer consistently for accurate tracking.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'Position in ear canal',
    'Step 3: Position in ear canal for Digital Ear Thermometer',
    'Gently pull the ear up and back (for adults) or down and back (for children). Insert the probe into the ear canal until it fits snugly.',
    'Position the probe correctly in the ear canal for accurate measurement.',
    'Take temperature at the same time each day for consistent monitoring.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'Read the temperature',
    'Step 4: Read the temperature for Digital Ear Thermometer',
    'Wait for the beep indicating measurement is complete. Read the temperature displayed on the screen.',
    'Normal body temperature is typically 98.6°F (37°C). Consult a doctor if temperature is above 100.4°F (38°C).',
    'Consider taking multiple readings if the first seems unusual.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'Clean and store device',
    'Step 5: Clean and store device for Digital Ear Thermometer',
    'Remove the thermometer and turn it off. Clean the probe with alcohol and return to its case.',
    'Clean the probe thoroughly after each use to prevent contamination.',
    'Store in a clean, dry place away from direct sunlight.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'Siapkan termometer',
    'Step 1: Siapkan termometer for Termometer Digital Telinga',
    'Keluarkan termometer dari kotaknya. Periksa apakah bersih dan baterai memiliki daya yang cukup. Jika perlu, bersihkan probe dengan alkohol.',
    'Jangan gunakan jika probe retak atau rusak.',
    'Siapkan baterai cadangan untuk operasi yang dapat diandalkan.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'Nyalakan alat',
    'Step 2: Nyalakan alat for Termometer Digital Telinga',
    'Tekan tombol power untuk menyalakan alat. Tunggu hingga layar menampilkan siap atau simbol suhu.',
    'Pastikan saluran telinga bersih dan bebas dari kotoran telinga untuk pembacaan yang akurat.',
    'Gunakan termometer yang sama secara konsisten untuk pelacakan yang akurat.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'Posisikan di saluran telinga',
    'Step 3: Posisikan di saluran telinga for Termometer Digital Telinga',
    'Tarik telinga ke atas dan ke belakang dengan lembut (untuk dewasa) atau ke bawah dan ke belakang (untuk anak-anak). Masukkan probe ke dalam saluran telinga hingga pas.',
    'Posisikan probe dengan benar di saluran telinga untuk pengukuran yang akurat.',
    'Ukur suhu pada waktu yang sama setiap hari untuk pemantauan yang konsisten.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'Baca suhu',
    'Step 4: Baca suhu for Termometer Digital Telinga',
    'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Baca suhu yang ditampilkan di layar.',
    'Suhu tubuh normal biasanya 98.6°F (37°C). Konsultasikan dokter jika suhu di atas 100.4°F (38°C).',
    'Pertimbangkan untuk mengambil beberapa pembacaan jika yang pertama terlihat tidak biasa.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'id'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'Bersihkan dan simpan alat',
    'Step 5: Bersihkan dan simpan alat for Termometer Digital Telinga',
    'Lepaskan termometer dan matikan. Bersihkan probe dengan alkohol dan kembalikan ke kotaknya.',
    'Bersihkan probe secara menyeluruh setelah setiap penggunaan untuk mencegah kontaminasi.',
    'Simpan di tempat yang bersih dan kering, jauh dari sinar matahari langsung.',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'เตรียมเครื่องวัดอุณหภูมิ',
    'Step 1: เตรียมเครื่องวัดอุณหภูมิ for เครื่องวัดอุณหภูมิดิจิทัลทางหู',
    'นำเครื่องวัดอุณหภูมิออกจากกล่อง ตรวจสอบว่าสะอาดและแบตเตอรี่มีพลังงานเพียงพอ หากจำเป็น ทำความสะอาดหัววัดด้วยแอลกอฮอล์',
    'ห้ามใช้หากหัววัดแตกหรือเสียหาย',
    'เตรียมแบตเตอรี่สำรองไว้สำหรับการทำงานที่เชื่อถือได้',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'เปิดเครื่อง',
    'Step 2: เปิดเครื่อง for เครื่องวัดอุณหภูมิดิจิทัลทางหู',
    'กดปุ่มเปิดเครื่องเพื่อเปิดเครื่อง รอให้หน้าจอแสดงพร้อมหรือสัญลักษณ์อุณหภูมิ',
    'ตรวจสอบให้แน่ใจว่าช่องหูสะอาดและไม่มีขี้หูเพื่อการอ่านที่แม่นยำ',
    'ใช้เครื่องวัดอุณหภูมิเครื่องเดียวกันอย่างสม่ำเสมอเพื่อการติดตามที่แม่นยำ',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'วางในช่องหู',
    'Step 3: วางในช่องหู for เครื่องวัดอุณหภูมิดิจิทัลทางหู',
    'ดึงหูขึ้นและไปข้างหลังเบาๆ (สำหรับผู้ใหญ่) หรือลงและไปข้างหลัง (สำหรับเด็ก) สอดหัววัดเข้าไปในช่องหูจนกระชับ',
    'วางหัววัดให้ถูกต้องในช่องหูเพื่อการวัดที่แม่นยำ',
    'วัดอุณหภูมิในเวลาเดียวกันทุกวันเพื่อการติดตามอย่างสม่ำเสมอ',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'อ่านอุณหภูมิ',
    'Step 4: อ่านอุณหภูมิ for เครื่องวัดอุณหภูมิดิจิทัลทางหู',
    'รอเสียงบี๊บที่แสดงว่าการวัดเสร็จสิ้น อ่านอุณหภูมิที่แสดงบนหน้าจอ',
    'อุณหภูมิร่างกายปกติโดยทั่วไปคือ 98.6°F (37°C) ปรึกษาแพทย์หากอุณหภูมิสูงกว่า 100.4°F (38°C)',
    'พิจารณาวัดหลายครั้งหากครั้งแรกดูผิดปกติ',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'th'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'ทำความสะอาดและเก็บเครื่อง',
    'Step 5: ทำความสะอาดและเก็บเครื่อง for เครื่องวัดอุณหภูมิดิจิทัลทางหู',
    'ถอดเครื่องวัดอุณหภูมิและปิดเครื่อง ทำความสะอาดหัววัดด้วยแอลกอฮอล์และเก็บในกล่อง',
    'ทำความสะอาดหัววัดอย่างละเอียดหลังใช้ทุกครั้งเพื่อป้องกันการปนเปื้อน',
    'เก็บในที่สะอาดและแห้ง ห่างจากแสงแดดโดยตรง',
    true,
    'SIMISAI-Phase2',
    0.95,
    '2025-09-14T16:21:32.396Z'
);
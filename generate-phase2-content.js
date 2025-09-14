/**
 * Phase 2 Content Generator
 * Generates 45 guidance entries: 3 devices × 5 steps × 3 languages (English, Indonesian, Thai) + Direct style
 */

import fs from 'fs';

const devices = [
    'blood_pressure_monitor',
    'digital_oral_thermometer', 
    'digital_ear_thermometer'
];

const languages = [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Indonesian' },
    { code: 'th', name: 'Thai' }
];

const steps = [1, 2, 3, 4, 5];

const stepNames = {
    1: 'Preparation',
    2: 'Setup', 
    3: 'Measurement',
    4: 'Reading',
    5: 'Completion'
};

const deviceNames = {
    'blood_pressure_monitor': {
        en: 'Blood Pressure Monitor',
        id: 'Monitor Tekanan Darah',
        th: 'เครื่องวัดความดันโลหิต'
    },
    'digital_oral_thermometer': {
        en: 'Digital Oral Thermometer',
        id: 'Termometer Digital Mulut',
        th: 'เครื่องวัดอุณหภูมิดิจิทัลทางปาก'
    },
    'digital_ear_thermometer': {
        en: 'Digital Ear Thermometer',
        id: 'Termometer Digital Telinga',
        th: 'เครื่องวัดอุณหภูมิดิจิทัลทางหู'
    }
};

const deviceInstructions = {
    'blood_pressure_monitor': {
        1: {
            en: 'Prepare the cuff and device',
            id: 'Siapkan manset dan alat',
            th: 'เตรียมผ้าพันแขนและเครื่องมือ'
        },
        2: {
            en: 'Position the cuff correctly',
            id: 'Posisikan manset dengan benar',
            th: 'วางผ้าพันแขนให้ถูกต้อง'
        },
        3: {
            en: 'Start the measurement',
            id: 'Mulai pengukuran',
            th: 'เริ่มการวัด'
        },
        4: {
            en: 'Read and record results',
            id: 'Baca dan catat hasil',
            th: 'อ่านและบันทึกผลลัพธ์'
        },
        5: {
            en: 'Complete and clean up',
            id: 'Selesaikan dan bersihkan',
            th: 'เสร็จสิ้นและทำความสะอาด'
        }
    },
    'digital_oral_thermometer': {
        1: {
            en: 'Prepare the thermometer',
            id: 'Siapkan termometer',
            th: 'เตรียมเครื่องวัดอุณหภูมิ'
        },
        2: {
            en: 'Turn on the device',
            id: 'Nyalakan alat',
            th: 'เปิดเครื่อง'
        },
        3: {
            en: 'Position under tongue',
            id: 'Posisikan di bawah lidah',
            th: 'วางใต้ลิ้น'
        },
        4: {
            en: 'Read the temperature',
            id: 'Baca suhu',
            th: 'อ่านอุณหภูมิ'
        },
        5: {
            en: 'Clean and store device',
            id: 'Bersihkan dan simpan alat',
            th: 'ทำความสะอาดและเก็บเครื่อง'
        }
    },
    'digital_ear_thermometer': {
        1: {
            en: 'Prepare the thermometer',
            id: 'Siapkan termometer',
            th: 'เตรียมเครื่องวัดอุณหภูมิ'
        },
        2: {
            en: 'Turn on the device',
            id: 'Nyalakan alat',
            th: 'เปิดเครื่อง'
        },
        3: {
            en: 'Position in ear canal',
            id: 'Posisikan di saluran telinga',
            th: 'วางในช่องหู'
        },
        4: {
            en: 'Read the temperature',
            id: 'Baca suhu',
            th: 'อ่านอุณหภูมิ'
        },
        5: {
            en: 'Clean and store device',
            id: 'Bersihkan dan simpan alat',
            th: 'ทำความสะอาดและเก็บเครื่อง'
        }
    }
};

// Generate Phase 2 content
const phase2Content = [];

devices.forEach(device => {
    languages.forEach(language => {
        steps.forEach(step => {
            const content = {
                device_key: device,
                device_name: deviceNames[device][language.code],
                language_code: language.code,
                language_name: language.name,
                style_key: 'direct',
                step_number: step,
                step_name: stepNames[step],
                step_title: deviceInstructions[device][step][language.code],
                step_description: `Step ${step}: ${deviceInstructions[device][step][language.code]} for ${deviceNames[device][language.code]}`,
                step_instructions: generateInstructions(device, step, language.code),
                step_warnings: generateWarnings(device, step, language.code),
                step_tips: generateTips(device, step, language.code),
                is_ai_generated: true,
                generated_by_ai_provider: 'SIMISAI-Phase2',
                generation_quality_score: 0.95,
                generated_at: new Date().toISOString()
            };
            
            phase2Content.push(content);
        });
    });
});

function generateInstructions(device, step, language) {
    const instructions = {
        'blood_pressure_monitor': {
            1: {
                en: 'Remove the blood pressure cuff from its case. Ensure it is clean and properly inflated. Check for any tears or damage to the cuff or tubing.',
                id: 'Keluarkan manset tekanan darah dari kotaknya. Pastikan bersih dan terisi udara dengan baik. Periksa apakah ada robekan atau kerusakan pada manset atau selang.',
                th: 'นำผ้าพันแขนวัดความดันออกจากกล่อง ตรวจสอบให้แน่ใจว่าสะอาดและอัดลมได้ดี ตรวจสอบว่ามีรอยฉีกขาดหรือเสียหายหรือไม่'
            },
            2: {
                en: 'Wrap the cuff around your upper arm, positioning it so the bottom edge is about 1 inch above your elbow. The cuff should be snug but not tight.',
                id: 'Lilitkan manset di sekitar lengan atas Anda, posisikan sehingga tepi bawah sekitar 1 inci di atas siku Anda. Manset harus pas tetapi tidak ketat.',
                th: 'พันผ้าพันแขนรอบแขนบน วางให้ขอบล่างอยู่ประมาณ 1 นิ้วเหนือข้อศอก ผ้าพันแขนควรกระชับแต่ไม่แน่น'
            },
            3: {
                en: 'Press the start button on the monitor. Sit still with your arm supported at heart level. Do not talk or move during the measurement.',
                id: 'Tekan tombol start pada monitor. Duduk diam dengan lengan Anda ditopang setinggi jantung. Jangan berbicara atau bergerak selama pengukuran.',
                th: 'กดปุ่มเริ่มต้นบนเครื่องนั่งนิ่งๆ โดยแขนของคุณอยู่ในระดับหัวใจ อย่าพูดหรือเคลื่อนไหวระหว่างการวัด'
            },
            4: {
                en: 'Wait for the beep indicating measurement is complete. Note the systolic and diastolic readings displayed on the screen.',
                id: 'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Catat pembacaan sistolik dan diastolik yang ditampilkan di layar.',
                th: 'รอเสียงบี๊บที่แสดงว่าการวัดเสร็จสิ้น บันทึกค่าความดันซิสโตลิกและไดแอสโตลิกที่แสดงบนหน้าจอ'
            },
            5: {
                en: 'Remove the cuff and turn off the device. Clean the cuff with a damp cloth if needed. Store the device in its case.',
                id: 'Lepaskan manset dan matikan alat. Bersihkan manset dengan kain lembab jika diperlukan. Simpan alat di kotaknya.',
                th: 'ถอดผ้าพันแขนและปิดเครื่อง ทำความสะอาดผ้าพันแขนด้วยผ้าเปียกหากจำเป็น เก็บเครื่องในกล่อง'
            }
        },
        'digital_oral_thermometer': {
            1: {
                en: 'Remove the thermometer from its case. Check that it is clean and the battery has sufficient power. If needed, clean the probe with alcohol.',
                id: 'Keluarkan termometer dari kotaknya. Periksa apakah bersih dan baterai memiliki daya yang cukup. Jika perlu, bersihkan probe dengan alkohol.',
                th: 'นำเครื่องวัดอุณหภูมิออกจากกล่อง ตรวจสอบว่าสะอาดและแบตเตอรี่มีพลังงานเพียงพอ หากจำเป็น ทำความสะอาดหัววัดด้วยแอลกอฮอล์'
            },
            2: {
                en: 'Press the power button to turn on the device. Wait for the display to show ready or the temperature symbol.',
                id: 'Tekan tombol power untuk menyalakan alat. Tunggu hingga layar menampilkan siap atau simbol suhu.',
                th: 'กดปุ่มเปิดเครื่องเพื่อเปิดเครื่อง รอให้หน้าจอแสดงพร้อมหรือสัญลักษณ์อุณหภูมิ'
            },
            3: {
                en: 'Place the probe under your tongue, positioning it as far back as possible. Close your mouth gently and breathe through your nose.',
                id: 'Letakkan probe di bawah lidah Anda, posisikan sejauh mungkin ke belakang. Tutup mulut dengan lembut dan bernapas melalui hidung.',
                th: 'วางหัววัดใต้ลิ้นของคุณ วางให้ลึกที่สุดเท่าที่เป็นไปได้ ปิดปากเบาๆ และหายใจทางจมูก'
            },
            4: {
                en: 'Wait for the beep indicating measurement is complete. Read the temperature displayed on the screen.',
                id: 'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Baca suhu yang ditampilkan di layar.',
                th: 'รอเสียงบี๊บที่แสดงว่าการวัดเสร็จสิ้น อ่านอุณหภูมิที่แสดงบนหน้าจอ'
            },
            5: {
                en: 'Remove the thermometer and turn it off. Clean the probe with alcohol and return to its case.',
                id: 'Lepaskan termometer dan matikan. Bersihkan probe dengan alkohol dan kembalikan ke kotaknya.',
                th: 'ถอดเครื่องวัดอุณหภูมิและปิดเครื่อง ทำความสะอาดหัววัดด้วยแอลกอฮอล์และเก็บในกล่อง'
            }
        },
        'digital_ear_thermometer': {
            1: {
                en: 'Remove the thermometer from its case. Check that it is clean and the battery has sufficient power. If needed, clean the probe with alcohol.',
                id: 'Keluarkan termometer dari kotaknya. Periksa apakah bersih dan baterai memiliki daya yang cukup. Jika perlu, bersihkan probe dengan alkohol.',
                th: 'นำเครื่องวัดอุณหภูมิออกจากกล่อง ตรวจสอบว่าสะอาดและแบตเตอรี่มีพลังงานเพียงพอ หากจำเป็น ทำความสะอาดหัววัดด้วยแอลกอฮอล์'
            },
            2: {
                en: 'Press the power button to turn on the device. Wait for the display to show ready or the temperature symbol.',
                id: 'Tekan tombol power untuk menyalakan alat. Tunggu hingga layar menampilkan siap atau simbol suhu.',
                th: 'กดปุ่มเปิดเครื่องเพื่อเปิดเครื่อง รอให้หน้าจอแสดงพร้อมหรือสัญลักษณ์อุณหภูมิ'
            },
            3: {
                en: 'Gently pull the ear up and back (for adults) or down and back (for children). Insert the probe into the ear canal until it fits snugly.',
                id: 'Tarik telinga ke atas dan ke belakang dengan lembut (untuk dewasa) atau ke bawah dan ke belakang (untuk anak-anak). Masukkan probe ke dalam saluran telinga hingga pas.',
                th: 'ดึงหูขึ้นและไปข้างหลังเบาๆ (สำหรับผู้ใหญ่) หรือลงและไปข้างหลัง (สำหรับเด็ก) สอดหัววัดเข้าไปในช่องหูจนกระชับ'
            },
            4: {
                en: 'Wait for the beep indicating measurement is complete. Read the temperature displayed on the screen.',
                id: 'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Baca suhu yang ditampilkan di layar.',
                th: 'รอเสียงบี๊บที่แสดงว่าการวัดเสร็จสิ้น อ่านอุณหภูมิที่แสดงบนหน้าจอ'
            },
            5: {
                en: 'Remove the thermometer and turn it off. Clean the probe with alcohol and return to its case.',
                id: 'Lepaskan termometer dan matikan. Bersihkan probe dengan alkohol dan kembalikan ke kotaknya.',
                th: 'ถอดเครื่องวัดอุณหภูมิและปิดเครื่อง ทำความสะอาดหัววัดด้วยแอลกอฮอล์และเก็บในกล่อง'
            }
        }
    };
    
    return instructions[device][step][language];
}

function generateWarnings(device, step, language) {
    const warnings = {
        'blood_pressure_monitor': {
            1: {
                en: 'Do not use if the cuff is damaged or has holes.',
                id: 'Jangan gunakan jika manset rusak atau berlubang.',
                th: 'ห้ามใช้หากผ้าพันแขนเสียหายหรือมีรู'
            },
            2: {
                en: 'Ensure the cuff is not too tight - you should be able to fit one finger between the cuff and your arm.',
                id: 'Pastikan manset tidak terlalu ketat - Anda harus bisa memasukkan satu jari di antara manset dan lengan Anda.',
                th: 'ตรวจสอบให้แน่ใจว่าผ้าพันแขนไม่แน่นเกินไป - ควรสามารถใส่หนึ่งนิ้วระหว่างผ้าพันแขนและแขนได้'
            },
            3: {
                en: 'Do not move or talk during measurement as this can affect accuracy.',
                id: 'Jangan bergerak atau berbicara selama pengukuran karena dapat mempengaruhi akurasi.',
                th: 'อย่าเคลื่อนไหวหรือพูดระหว่างการวัดเพราะอาจส่งผลต่อความแม่นยำ'
            },
            4: {
                en: 'If readings seem unusually high or low, wait 5 minutes and measure again.',
                id: 'Jika pembacaan terlihat tidak biasa tinggi atau rendah, tunggu 5 menit dan ukur lagi.',
                th: 'หากค่าที่อ่านดูสูงหรือต่ำผิดปกติ รอ 5 นาทีแล้ววัดใหม่'
            },
            5: {
                en: 'Always clean the cuff after each use to maintain hygiene.',
                id: 'Selalu bersihkan manset setelah setiap penggunaan untuk menjaga kebersihan.',
                th: 'ทำความสะอาดผ้าพันแขนหลังใช้ทุกครั้งเพื่อรักษาความสะอาด'
            }
        },
        'digital_oral_thermometer': {
            1: {
                en: 'Do not use if the probe is cracked or damaged.',
                id: 'Jangan gunakan jika probe retak atau rusak.',
                th: 'ห้ามใช้หากหัววัดแตกหรือเสียหาย'
            },
            2: {
                en: 'Wait at least 15 minutes after eating or drinking hot/cold liquids before taking temperature.',
                id: 'Tunggu setidaknya 15 menit setelah makan atau minum cairan panas/dingin sebelum mengukur suhu.',
                th: 'รออย่างน้อย 15 นาทีหลังจากกินหรือดื่มของเหลวร้อน/เย็นก่อนวัดอุณหภูมิ'
            },
            3: {
                en: 'Keep your mouth closed during measurement for accurate results.',
                id: 'Tutup mulut Anda selama pengukuran untuk hasil yang akurat.',
                th: 'ปิดปากระหว่างการวัดเพื่อผลลัพธ์ที่แม่นยำ'
            },
            4: {
                en: 'Normal body temperature is typically 98.6°F (37°C). Consult a doctor if temperature is above 100.4°F (38°C).',
                id: 'Suhu tubuh normal biasanya 98.6°F (37°C). Konsultasikan dokter jika suhu di atas 100.4°F (38°C).',
                th: 'อุณหภูมิร่างกายปกติโดยทั่วไปคือ 98.6°F (37°C) ปรึกษาแพทย์หากอุณหภูมิสูงกว่า 100.4°F (38°C)'
            },
            5: {
                en: 'Clean the probe thoroughly after each use to prevent contamination.',
                id: 'Bersihkan probe secara menyeluruh setelah setiap penggunaan untuk mencegah kontaminasi.',
                th: 'ทำความสะอาดหัววัดอย่างละเอียดหลังใช้ทุกครั้งเพื่อป้องกันการปนเปื้อน'
            }
        },
        'digital_ear_thermometer': {
            1: {
                en: 'Do not use if the probe is cracked or damaged.',
                id: 'Jangan gunakan jika probe retak atau rusak.',
                th: 'ห้ามใช้หากหัววัดแตกหรือเสียหาย'
            },
            2: {
                en: 'Ensure the ear canal is clean and free of earwax for accurate readings.',
                id: 'Pastikan saluran telinga bersih dan bebas dari kotoran telinga untuk pembacaan yang akurat.',
                th: 'ตรวจสอบให้แน่ใจว่าช่องหูสะอาดและไม่มีขี้หูเพื่อการอ่านที่แม่นยำ'
            },
            3: {
                en: 'Position the probe correctly in the ear canal for accurate measurement.',
                id: 'Posisikan probe dengan benar di saluran telinga untuk pengukuran yang akurat.',
                th: 'วางหัววัดให้ถูกต้องในช่องหูเพื่อการวัดที่แม่นยำ'
            },
            4: {
                en: 'Normal body temperature is typically 98.6°F (37°C). Consult a doctor if temperature is above 100.4°F (38°C).',
                id: 'Suhu tubuh normal biasanya 98.6°F (37°C). Konsultasikan dokter jika suhu di atas 100.4°F (38°C).',
                th: 'อุณหภูมิร่างกายปกติโดยทั่วไปคือ 98.6°F (37°C) ปรึกษาแพทย์หากอุณหภูมิสูงกว่า 100.4°F (38°C)'
            },
            5: {
                en: 'Clean the probe thoroughly after each use to prevent contamination.',
                id: 'Bersihkan probe secara menyeluruh setelah setiap penggunaan untuk mencegah kontaminasi.',
                th: 'ทำความสะอาดหัววัดอย่างละเอียดหลังใช้ทุกครั้งเพื่อป้องกันการปนเปื้อน'
            }
        }
    };
    
    return warnings[device][step][language];
}

function generateTips(device, step, language) {
    const tips = {
        'blood_pressure_monitor': {
            1: {
                en: 'Store the device in a cool, dry place when not in use.',
                id: 'Simpan alat di tempat yang sejuk dan kering saat tidak digunakan.',
                th: 'เก็บเครื่องในที่เย็นและแห้งเมื่อไม่ได้ใช้'
            },
            2: {
                en: 'Position yourself comfortably with your back supported and feet flat on the floor.',
                id: 'Posisikan diri Anda dengan nyaman dengan punggung ditopang dan kaki rata di lantai.',
                th: 'นั่งให้สบายโดยหลังมีที่รองรับและเท้าเรียบกับพื้น'
            },
            3: {
                en: 'Take multiple readings at different times of day for a complete picture.',
                id: 'Ambil beberapa pembacaan pada waktu yang berbeda dalam sehari untuk gambaran lengkap.',
                th: 'วัดหลายครั้งในเวลาต่างๆ ของวันเพื่อภาพรวมที่สมบูรณ์'
            },
            4: {
                en: 'Record your readings with the date and time for your healthcare provider.',
                id: 'Catat pembacaan Anda dengan tanggal dan waktu untuk penyedia layanan kesehatan Anda.',
                th: 'บันทึกการอ่านของคุณพร้อมวันที่และเวลาสำหรับผู้ให้บริการด้านสุขภาพ'
            },
            5: {
                en: 'Replace the batteries when the low battery indicator appears.',
                id: 'Ganti baterai ketika indikator baterai rendah muncul.',
                th: 'เปลี่ยนแบตเตอรี่เมื่อตัวบ่งชี้แบตเตอรี่ต่ำปรากฏ'
            }
        },
        'digital_oral_thermometer': {
            1: {
                en: 'Keep spare batteries on hand for reliable operation.',
                id: 'Siapkan baterai cadangan untuk operasi yang dapat diandalkan.',
                th: 'เตรียมแบตเตอรี่สำรองไว้สำหรับการทำงานที่เชื่อถือได้'
            },
            2: {
                en: 'Use the same thermometer consistently for accurate tracking.',
                id: 'Gunakan termometer yang sama secara konsisten untuk pelacakan yang akurat.',
                th: 'ใช้เครื่องวัดอุณหภูมิเครื่องเดียวกันอย่างสม่ำเสมอเพื่อการติดตามที่แม่นยำ'
            },
            3: {
                en: 'Take temperature at the same time each day for consistent monitoring.',
                id: 'Ukur suhu pada waktu yang sama setiap hari untuk pemantauan yang konsisten.',
                th: 'วัดอุณหภูมิในเวลาเดียวกันทุกวันเพื่อการติดตามอย่างสม่ำเสมอ'
            },
            4: {
                en: 'Consider taking multiple readings if the first seems unusual.',
                id: 'Pertimbangkan untuk mengambil beberapa pembacaan jika yang pertama terlihat tidak biasa.',
                th: 'พิจารณาวัดหลายครั้งหากครั้งแรกดูผิดปกติ'
            },
            5: {
                en: 'Store in a clean, dry place away from direct sunlight.',
                id: 'Simpan di tempat yang bersih dan kering, jauh dari sinar matahari langsung.',
                th: 'เก็บในที่สะอาดและแห้ง ห่างจากแสงแดดโดยตรง'
            }
        },
        'digital_ear_thermometer': {
            1: {
                en: 'Keep spare batteries on hand for reliable operation.',
                id: 'Siapkan baterai cadangan untuk operasi yang dapat diandalkan.',
                th: 'เตรียมแบตเตอรี่สำรองไว้สำหรับการทำงานที่เชื่อถือได้'
            },
            2: {
                en: 'Use the same thermometer consistently for accurate tracking.',
                id: 'Gunakan termometer yang sama secara konsisten untuk pelacakan yang akurat.',
                th: 'ใช้เครื่องวัดอุณหภูมิเครื่องเดียวกันอย่างสม่ำเสมอเพื่อการติดตามที่แม่นยำ'
            },
            3: {
                en: 'Take temperature at the same time each day for consistent monitoring.',
                id: 'Ukur suhu pada waktu yang sama setiap hari untuk pemantauan yang konsisten.',
                th: 'วัดอุณหภูมิในเวลาเดียวกันทุกวันเพื่อการติดตามอย่างสม่ำเสมอ'
            },
            4: {
                en: 'Consider taking multiple readings if the first seems unusual.',
                id: 'Pertimbangkan untuk mengambil beberapa pembacaan jika yang pertama terlihat tidak biasa.',
                th: 'พิจารณาวัดหลายครั้งหากครั้งแรกดูผิดปกติ'
            },
            5: {
                en: 'Store in a clean, dry place away from direct sunlight.',
                id: 'Simpan di tempat yang bersih dan kering, jauh dari sinar matahari langsung.',
                th: 'เก็บในที่สะอาดและแห้ง ห่างจากแสงแดดโดยตรง'
            }
        }
    };
    
    return tips[device][step][language];
}

// Output the generated content
console.log('Phase 2 Content Generated:');
console.log(`Total entries: ${phase2Content.length}`);
console.log('\nContent Preview:');
phase2Content.slice(0, 3).forEach((content, index) => {
    console.log(`\n${index + 1}. ${content.device_name} (${content.language_name}) - Step ${content.step_number}: ${content.step_title}`);
    console.log(`   Instructions: ${content.step_instructions.substring(0, 100)}...`);
    console.log(`   Warnings: ${content.step_warnings.substring(0, 80)}...`);
    console.log(`   Tips: ${content.step_tips.substring(0, 80)}...`);
});

// Save to file
fs.writeFileSync('phase2-content.json', JSON.stringify(phase2Content, null, 2));
console.log('\n✅ Phase 2 content saved to phase2-content.json');

// Generate SQL insert statements
const sqlStatements = phase2Content.map(content => {
    return `INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = '${content.device_key}'),
    (SELECT language_id FROM supported_languages WHERE language_code = '${content.language_code}'),
    (SELECT style_id FROM guidance_styles WHERE style_key = '${content.style_key}'),
    (SELECT step_id FROM guidance_steps WHERE step_number = ${content.step_number}),
    '${content.step_title.replace(/'/g, "''")}',
    '${content.step_description.replace(/'/g, "''")}',
    '${content.step_instructions.replace(/'/g, "''")}',
    '${content.step_warnings.replace(/'/g, "''")}',
    '${content.step_tips.replace(/'/g, "''")}',
    ${content.is_ai_generated},
    '${content.generated_by_ai_provider}',
    ${content.generation_quality_score},
    '${content.generated_at}'
);`;
});

fs.writeFileSync('phase2-content.sql', sqlStatements.join('\n\n'));
console.log('✅ Phase 2 SQL insert statements saved to phase2-content.sql');

console.log('\n🚀 Phase 2 Generation Complete!');
console.log('📊 Generated 45 guidance entries for Top 3 Languages + Direct style');
console.log('💾 Ready for database insertion');

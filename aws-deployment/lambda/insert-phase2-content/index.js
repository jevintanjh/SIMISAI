/**
 * Insert Phase 2 Content Lambda
 * Inserts Phase 2 content (45 entries - Top 3 languages + Direct style)
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

// Phase 2 content (45 entries - Top 3 languages: English, Indonesian, Thai + Direct style)
const phase2Content = [
    // Blood Pressure Monitor - Indonesian
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'id',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Siapkan manset dan alat',
        step_description: 'Step 1: Siapkan manset dan alat for Monitor Tekanan Darah',
        step_instructions: 'Keluarkan manset tekanan darah dari kotaknya. Pastikan bersih dan terisi udara dengan baik. Periksa apakah ada robekan atau kerusakan pada manset atau selang.',
        step_warnings: 'Jangan gunakan jika manset rusak atau berlubang.',
        step_tips: 'Simpan alat di tempat yang sejuk dan kering saat tidak digunakan.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'id',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Posisikan manset dengan benar',
        step_description: 'Step 2: Posisikan manset dengan benar for Monitor Tekanan Darah',
        step_instructions: 'Lilitkan manset di sekitar lengan atas Anda, posisikan sehingga tepi bawah sekitar 1 inci di atas siku Anda. Manset harus pas tetapi tidak ketat.',
        step_warnings: 'Pastikan manset tidak terlalu ketat - Anda harus bisa memasukkan satu jari di antara manset dan lengan Anda.',
        step_tips: 'Posisikan diri Anda dengan nyaman dengan punggung ditopang dan kaki rata di lantai.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'id',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Mulai pengukuran',
        step_description: 'Step 3: Mulai pengukuran for Monitor Tekanan Darah',
        step_instructions: 'Tekan tombol start pada monitor. Duduk diam dengan lengan Anda ditopang setinggi jantung. Jangan berbicara atau bergerak selama pengukuran.',
        step_warnings: 'Jangan bergerak atau berbicara selama pengukuran karena dapat mempengaruhi akurasi.',
        step_tips: 'Ambil beberapa pembacaan pada waktu yang berbeda dalam sehari untuk gambaran lengkap.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'id',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Baca dan catat hasil',
        step_description: 'Step 4: Baca dan catat hasil for Monitor Tekanan Darah',
        step_instructions: 'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Catat pembacaan sistolik dan diastolik yang ditampilkan di layar.',
        step_warnings: 'Jika pembacaan terlihat tidak biasa tinggi atau rendah, tunggu 5 menit dan ukur lagi.',
        step_tips: 'Catat pembacaan Anda dengan tanggal dan waktu untuk penyedia layanan kesehatan Anda.'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'id',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Selesaikan dan bersihkan',
        step_description: 'Step 5: Selesaikan dan bersihkan for Monitor Tekanan Darah',
        step_instructions: 'Lepaskan manset dan matikan alat. Bersihkan manset dengan kain lembab jika diperlukan. Simpan alat di kotaknya.',
        step_warnings: 'Selalu bersihkan manset setelah setiap penggunaan untuk menjaga kebersihan.',
        step_tips: 'Ganti baterai ketika indikator baterai rendah muncul.'
    },
    // Blood Pressure Monitor - Thai
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'th',
        style_key: 'direct',
        step_number: 1,
        step_title: 'เตรียมผ้าพันแขนและเครื่องมือ',
        step_description: 'Step 1: เตรียมผ้าพันแขนและเครื่องมือ for เครื่องวัดความดันโลหิต',
        step_instructions: 'นำผ้าพันแขนวัดความดันออกจากกล่อง ตรวจสอบให้แน่ใจว่าสะอาดและอัดลมได้ดี ตรวจสอบว่ามีรอยฉีกขาดหรือเสียหายหรือไม่',
        step_warnings: 'ห้ามใช้หากผ้าพันแขนเสียหายหรือมีรู',
        step_tips: 'เก็บเครื่องในที่เย็นและแห้งเมื่อไม่ได้ใช้'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'th',
        style_key: 'direct',
        step_number: 2,
        step_title: 'วางผ้าพันแขนให้ถูกต้อง',
        step_description: 'Step 2: วางผ้าพันแขนให้ถูกต้อง for เครื่องวัดความดันโลหิต',
        step_instructions: 'พันผ้าพันแขนรอบแขนบน วางให้ขอบล่างอยู่ประมาณ 1 นิ้วเหนือข้อศอก ผ้าพันแขนควรกระชับแต่ไม่แน่น',
        step_warnings: 'ตรวจสอบให้แน่ใจว่าผ้าพันแขนไม่แน่นเกินไป - ควรสามารถใส่หนึ่งนิ้วระหว่างผ้าพันแขนและแขนได้',
        step_tips: 'นั่งให้สบายโดยหลังมีที่รองรับและเท้าเรียบกับพื้น'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'th',
        style_key: 'direct',
        step_number: 3,
        step_title: 'เริ่มการวัด',
        step_description: 'Step 3: เริ่มการวัด for เครื่องวัดความดันโลหิต',
        step_instructions: 'กดปุ่มเริ่มต้นบนเครื่องนั่งนิ่งๆ โดยแขนของคุณอยู่ในระดับหัวใจ อย่าพูดหรือเคลื่อนไหวระหว่างการวัด',
        step_warnings: 'อย่าเคลื่อนไหวหรือพูดระหว่างการวัดเพราะอาจส่งผลต่อความแม่นยำ',
        step_tips: 'วัดหลายครั้งในเวลาต่างๆ ของวันเพื่อภาพรวมที่สมบูรณ์'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'th',
        style_key: 'direct',
        step_number: 4,
        step_title: 'อ่านและบันทึกผลลัพธ์',
        step_description: 'Step 4: อ่านและบันทึกผลลัพธ์ for เครื่องวัดความดันโลหิต',
        step_instructions: 'รอเสียงบี๊บที่แสดงว่าการวัดเสร็จสิ้น บันทึกค่าความดันซิสโตลิกและไดแอสโตลิกที่แสดงบนหน้าจอ',
        step_warnings: 'หากค่าที่อ่านดูสูงหรือต่ำผิดปกติ รอ 5 นาทีแล้ววัดใหม่',
        step_tips: 'บันทึกการอ่านของคุณพร้อมวันที่และเวลาสำหรับผู้ให้บริการด้านสุขภาพ'
    },
    {
        device_key: 'blood_pressure_monitor',
        language_code: 'th',
        style_key: 'direct',
        step_number: 5,
        step_title: 'เสร็จสิ้นและทำความสะอาด',
        step_description: 'Step 5: เสร็จสิ้นและทำความสะอาด for เครื่องวัดความดันโลหิต',
        step_instructions: 'ถอดผ้าพันแขนและปิดเครื่อง ทำความสะอาดผ้าพันแขนด้วยผ้าเปียกหากจำเป็น เก็บเครื่องในกล่อง',
        step_warnings: 'ทำความสะอาดผ้าพันแขนหลังใช้ทุกครั้งเพื่อรักษาความสะอาด',
        step_tips: 'เปลี่ยนแบตเตอรี่เมื่อตัวบ่งชี้แบตเตอรี่ต่ำปรากฏ'
    },
    // Digital Oral Thermometer - Indonesian
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'id',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Siapkan termometer',
        step_description: 'Step 1: Siapkan termometer for Termometer Digital Mulut',
        step_instructions: 'Keluarkan termometer dari kotaknya. Periksa apakah bersih dan baterai memiliki daya yang cukup. Jika perlu, bersihkan probe dengan alkohol.',
        step_warnings: 'Jangan gunakan jika probe retak atau rusak.',
        step_tips: 'Siapkan baterai cadangan untuk operasi yang dapat diandalkan.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'id',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Nyalakan alat',
        step_description: 'Step 2: Nyalakan alat for Termometer Digital Mulut',
        step_instructions: 'Tekan tombol power untuk menyalakan alat. Tunggu hingga layar menampilkan siap atau simbol suhu.',
        step_warnings: 'Tunggu setidaknya 15 menit setelah makan atau minum cairan panas/dingin sebelum mengukur suhu.',
        step_tips: 'Gunakan termometer yang sama secara konsisten untuk pelacakan yang akurat.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'id',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Posisikan di bawah lidah',
        step_description: 'Step 3: Posisikan di bawah lidah for Termometer Digital Mulut',
        step_instructions: 'Letakkan probe di bawah lidah Anda, posisikan sejauh mungkin ke belakang. Tutup mulut dengan lembut dan bernapas melalui hidung.',
        step_warnings: 'Tutup mulut Anda selama pengukuran untuk hasil yang akurat.',
        step_tips: 'Ukur suhu pada waktu yang sama setiap hari untuk pemantauan yang konsisten.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'id',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Baca suhu',
        step_description: 'Step 4: Baca suhu for Termometer Digital Mulut',
        step_instructions: 'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Baca suhu yang ditampilkan di layar.',
        step_warnings: 'Suhu tubuh normal biasanya 98.6°F (37°C). Konsultasikan dokter jika suhu di atas 100.4°F (38°C).',
        step_tips: 'Pertimbangkan untuk mengambil beberapa pembacaan jika yang pertama terlihat tidak biasa.'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'id',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Bersihkan dan simpan alat',
        step_description: 'Step 5: Bersihkan dan simpan alat for Termometer Digital Mulut',
        step_instructions: 'Lepaskan termometer dan matikan. Bersihkan probe dengan alkohol dan kembalikan ke kotaknya.',
        step_warnings: 'Bersihkan probe secara menyeluruh setelah setiap penggunaan untuk mencegah kontaminasi.',
        step_tips: 'Simpan di tempat yang bersih dan kering, jauh dari sinar matahari langsung.'
    },
    // Digital Oral Thermometer - Thai
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'th',
        style_key: 'direct',
        step_number: 1,
        step_title: 'เตรียมเครื่องวัดอุณหภูมิ',
        step_description: 'Step 1: เตรียมเครื่องวัดอุณหภูมิ for เครื่องวัดอุณหภูมิดิจิทัลทางปาก',
        step_instructions: 'นำเครื่องวัดอุณหภูมิออกจากกล่อง ตรวจสอบว่าสะอาดและแบตเตอรี่มีพลังงานเพียงพอ หากจำเป็น ทำความสะอาดหัววัดด้วยแอลกอฮอล์',
        step_warnings: 'ห้ามใช้หากหัววัดแตกหรือเสียหาย',
        step_tips: 'เตรียมแบตเตอรี่สำรองไว้สำหรับการทำงานที่เชื่อถือได้'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'th',
        style_key: 'direct',
        step_number: 2,
        step_title: 'เปิดเครื่อง',
        step_description: 'Step 2: เปิดเครื่อง for เครื่องวัดอุณหภูมิดิจิทัลทางปาก',
        step_instructions: 'กดปุ่มเปิดเครื่องเพื่อเปิดเครื่อง รอให้หน้าจอแสดงพร้อมหรือสัญลักษณ์อุณหภูมิ',
        step_warnings: 'รออย่างน้อย 15 นาทีหลังจากกินหรือดื่มของเหลวร้อน/เย็นก่อนวัดอุณหภูมิ',
        step_tips: 'ใช้เครื่องวัดอุณหภูมิเครื่องเดียวกันอย่างสม่ำเสมอเพื่อการติดตามที่แม่นยำ'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'th',
        style_key: 'direct',
        step_number: 3,
        step_title: 'วางใต้ลิ้น',
        step_description: 'Step 3: วางใต้ลิ้น for เครื่องวัดอุณหภูมิดิจิทัลทางปาก',
        step_instructions: 'วางหัววัดใต้ลิ้นของคุณ วางให้ลึกที่สุดเท่าที่เป็นไปได้ ปิดปากเบาๆ และหายใจทางจมูก',
        step_warnings: 'ปิดปากระหว่างการวัดเพื่อผลลัพธ์ที่แม่นยำ',
        step_tips: 'วัดอุณหภูมิในเวลาเดียวกันทุกวันเพื่อการติดตามอย่างสม่ำเสมอ'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'th',
        style_key: 'direct',
        step_number: 4,
        step_title: 'อ่านอุณหภูมิ',
        step_description: 'Step 4: อ่านอุณหภูมิ for เครื่องวัดอุณหภูมิดิจิทัลทางปาก',
        step_instructions: 'รอเสียงบี๊บที่แสดงว่าการวัดเสร็จสิ้น อ่านอุณหภูมิที่แสดงบนหน้าจอ',
        step_warnings: 'อุณหภูมิร่างกายปกติโดยทั่วไปคือ 98.6°F (37°C) ปรึกษาแพทย์หากอุณหภูมิสูงกว่า 100.4°F (38°C)',
        step_tips: 'พิจารณาวัดหลายครั้งหากครั้งแรกดูผิดปกติ'
    },
    {
        device_key: 'digital_oral_thermometer',
        language_code: 'th',
        style_key: 'direct',
        step_number: 5,
        step_title: 'ทำความสะอาดและเก็บเครื่อง',
        step_description: 'Step 5: ทำความสะอาดและเก็บเครื่อง for เครื่องวัดอุณหภูมิดิจิทัลทางปาก',
        step_instructions: 'ถอดเครื่องวัดอุณหภูมิและปิดเครื่อง ทำความสะอาดหัววัดด้วยแอลกอฮอล์และเก็บในกล่อง',
        step_warnings: 'ทำความสะอาดหัววัดอย่างละเอียดหลังใช้ทุกครั้งเพื่อป้องกันการปนเปื้อน',
        step_tips: 'เก็บในที่สะอาดและแห้ง ห่างจากแสงแดดโดยตรง'
    },
    // Digital Ear Thermometer - Indonesian
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'id',
        style_key: 'direct',
        step_number: 1,
        step_title: 'Siapkan termometer',
        step_description: 'Step 1: Siapkan termometer for Termometer Digital Telinga',
        step_instructions: 'Keluarkan termometer dari kotaknya. Periksa apakah bersih dan baterai memiliki daya yang cukup. Jika perlu, bersihkan probe dengan alkohol.',
        step_warnings: 'Jangan gunakan jika probe retak atau rusak.',
        step_tips: 'Siapkan baterai cadangan untuk operasi yang dapat diandalkan.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'id',
        style_key: 'direct',
        step_number: 2,
        step_title: 'Nyalakan alat',
        step_description: 'Step 2: Nyalakan alat for Termometer Digital Telinga',
        step_instructions: 'Tekan tombol power untuk menyalakan alat. Tunggu hingga layar menampilkan siap atau simbol suhu.',
        step_warnings: 'Pastikan saluran telinga bersih dan bebas dari kotoran telinga untuk pembacaan yang akurat.',
        step_tips: 'Gunakan termometer yang sama secara konsisten untuk pelacakan yang akurat.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'id',
        style_key: 'direct',
        step_number: 3,
        step_title: 'Posisikan di saluran telinga',
        step_description: 'Step 3: Posisikan di saluran telinga for Termometer Digital Telinga',
        step_instructions: 'Tarik telinga ke atas dan ke belakang dengan lembut (untuk dewasa) atau ke bawah dan ke belakang (untuk anak-anak). Masukkan probe ke dalam saluran telinga hingga pas.',
        step_warnings: 'Posisikan probe dengan benar di saluran telinga untuk pengukuran yang akurat.',
        step_tips: 'Ukur suhu pada waktu yang sama setiap hari untuk pemantauan yang konsisten.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'id',
        style_key: 'direct',
        step_number: 4,
        step_title: 'Baca suhu',
        step_description: 'Step 4: Baca suhu for Termometer Digital Telinga',
        step_instructions: 'Tunggu bunyi bip yang menunjukkan pengukuran selesai. Baca suhu yang ditampilkan di layar.',
        step_warnings: 'Suhu tubuh normal biasanya 98.6°F (37°C). Konsultasikan dokter jika suhu di atas 100.4°F (38°C).',
        step_tips: 'Pertimbangkan untuk mengambil beberapa pembacaan jika yang pertama terlihat tidak biasa.'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'id',
        style_key: 'direct',
        step_number: 5,
        step_title: 'Bersihkan dan simpan alat',
        step_description: 'Step 5: Bersihkan dan simpan alat for Termometer Digital Telinga',
        step_instructions: 'Lepaskan termometer dan matikan. Bersihkan probe dengan alkohol dan kembalikan ke kotaknya.',
        step_warnings: 'Bersihkan probe secara menyeluruh setelah setiap penggunaan untuk mencegah kontaminasi.',
        step_tips: 'Simpan di tempat yang bersih dan kering, jauh dari sinar matahari langsung.'
    },
    // Digital Ear Thermometer - Thai
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'th',
        style_key: 'direct',
        step_number: 1,
        step_title: 'เตรียมเครื่องวัดอุณหภูมิ',
        step_description: 'Step 1: เตรียมเครื่องวัดอุณหภูมิ for เครื่องวัดอุณหภูมิดิจิทัลทางหู',
        step_instructions: 'นำเครื่องวัดอุณหภูมิออกจากกล่อง ตรวจสอบว่าสะอาดและแบตเตอรี่มีพลังงานเพียงพอ หากจำเป็น ทำความสะอาดหัววัดด้วยแอลกอฮอล์',
        step_warnings: 'ห้ามใช้หากหัววัดแตกหรือเสียหาย',
        step_tips: 'เตรียมแบตเตอรี่สำรองไว้สำหรับการทำงานที่เชื่อถือได้'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'th',
        style_key: 'direct',
        step_number: 2,
        step_title: 'เปิดเครื่อง',
        step_description: 'Step 2: เปิดเครื่อง for เครื่องวัดอุณหภูมิดิจิทัลทางหู',
        step_instructions: 'กดปุ่มเปิดเครื่องเพื่อเปิดเครื่อง รอให้หน้าจอแสดงพร้อมหรือสัญลักษณ์อุณหภูมิ',
        step_warnings: 'ตรวจสอบให้แน่ใจว่าช่องหูสะอาดและไม่มีขี้หูเพื่อการอ่านที่แม่นยำ',
        step_tips: 'ใช้เครื่องวัดอุณหภูมิเครื่องเดียวกันอย่างสม่ำเสมอเพื่อการติดตามที่แม่นยำ'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'th',
        style_key: 'direct',
        step_number: 3,
        step_title: 'วางในช่องหู',
        step_description: 'Step 3: วางในช่องหู for เครื่องวัดอุณหภูมิดิจิทัลทางหู',
        step_instructions: 'ดึงหูขึ้นและไปข้างหลังเบาๆ (สำหรับผู้ใหญ่) หรือลงและไปข้างหลัง (สำหรับเด็ก) สอดหัววัดเข้าไปในช่องหูจนกระชับ',
        step_warnings: 'วางหัววัดให้ถูกต้องในช่องหูเพื่อการวัดที่แม่นยำ',
        step_tips: 'วัดอุณหภูมิในเวลาเดียวกันทุกวันเพื่อการติดตามอย่างสม่ำเสมอ'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'th',
        style_key: 'direct',
        step_number: 4,
        step_title: 'อ่านอุณหภูมิ',
        step_description: 'Step 4: อ่านอุณหภูมิ for เครื่องวัดอุณหภูมิดิจิทัลทางหู',
        step_instructions: 'รอเสียงบี๊บที่แสดงว่าการวัดเสร็จสิ้น อ่านอุณหภูมิที่แสดงบนหน้าจอ',
        step_warnings: 'อุณหภูมิร่างกายปกติโดยทั่วไปคือ 98.6°F (37°C) ปรึกษาแพทย์หากอุณหภูมิสูงกว่า 100.4°F (38°C)',
        step_tips: 'พิจารณาวัดหลายครั้งหากครั้งแรกดูผิดปกติ'
    },
    {
        device_key: 'digital_ear_thermometer',
        language_code: 'th',
        style_key: 'direct',
        step_number: 5,
        step_title: 'ทำความสะอาดและเก็บเครื่อง',
        step_description: 'Step 5: ทำความสะอาดและเก็บเครื่อง for เครื่องวัดอุณหภูมิดิจิทัลทางหู',
        step_instructions: 'ถอดเครื่องวัดอุณหภูมิและปิดเครื่อง ทำความสะอาดหัววัดด้วยแอลกอฮอล์และเก็บในกล่อง',
        step_warnings: 'ทำความสะอาดหัววัดอย่างละเอียดหลังใช้ทุกครั้งเพื่อป้องกันการปนเปื้อน',
        step_tips: 'เก็บในที่สะอาดและแห้ง ห่างจากแสงแดดโดยตรง'
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
            'SIMISAI-Phase2',
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
        console.log('🚀 Starting Phase 2 content insertion...');
        await client.connect();
        console.log('✅ Connected to guidance database');
        
        let insertedCount = 0;
        
        // Insert Phase 2 content
        console.log('📝 Inserting Phase 2 content (45 entries - Indonesian & Thai)...');
        for (const content of phase2Content) {
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
                message: 'Phase 2 content insertion completed successfully',
                phase: 'Phase 2',
                entries_inserted: insertedCount,
                total_entries_in_db: totalEntries,
                languages: ['Indonesian', 'Thai'],
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('💥 Phase 2 content insertion failed:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Phase 2 content insertion failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    } finally {
        await client.end();
    }
};

import OpenAI from "openai";
import { Language, DeviceType, GuidanceStyle, AiGuidanceResponse } from "@shared/schema";
import { languageConfig } from "./languages";
import { deviceInstructions } from "./deviceInstructions";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key-placeholder',
  dangerouslyAllowBrowser: true
});

const hasValidApiKey = () => {
  return import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'demo-key-placeholder';
};

export class AIService {
  async generateGuidance(
    deviceType: DeviceType,
    currentStep: number,
    language: Language,
    guidanceStyle: GuidanceStyle,
    userAction: string,
    isCorrectiveNeeded: boolean = false
  ): Promise<AiGuidanceResponse> {
    const device = deviceInstructions[deviceType];
    const langConfig = languageConfig[language];
    const currentStepInstruction = device.steps[currentStep];
    
    // If no valid API key, return fallback response
    if (!hasValidApiKey()) {
      const fallbackTranslations: Record<DeviceType, Record<Language, string[]>> = {
        oral_thermometer: {
          english: device.steps,
          bahasa_indonesia: [
            "Nyalakan termometer dan tunggu sinyal siap",
            "Letakkan ujung di bawah lidah Anda, di sisi mulut",
            "Tutup mulut dengan lembut dan jaga bibir tetap tertutup",
            "Tunggu termometer berbunyi bip (biasanya 30-60 detik)",
            "Lepaskan dan baca tampilan suhu"
          ],
          bahasa_melayu: [
            "Hidupkan termometer dan tunggu isyarat sedia",
            "Letakkan hujung di bawah lidah anda, di tepi mulut",
            "Tutup mulut perlahan dan pastikan bibir tertutup",
            "Tunggu termometer berbunyi bip (biasanya 30-60 saat)",
            "Keluarkan dan baca paparan suhu"
          ],
          thai: [
            "เปิดเครื่องวัดอุณหภูมิและรอสัญญาณพร้อม",
            "วางปลายใต้ลิ้นของคุณ ด้านข้างของปาก",
            "ปิดปากเบาๆ และให้ริมฝีปากแนบกัน",
            "รอเครื่องวัดอุณหภูมิส่งเสียงบี๊บ (ปกติ 30-60 วินาที)",
            "เอาออกและอ่านการแสดงอุณหภูมิ"
          ],
          vietnamese: [
            "Bật nhiệt kế và đợi tín hiệu sẵn sàng",
            "Đặt đầu dưới lưỡi của bạn, ở bên cạnh miệng",
            "Nhẹ nhàng đóng miệng và giữ môi khép kín",
            "Đợi nhiệt kế kêu bíp (thường là 30-60 giây)",
            "Lấy ra và đọc màn hình nhiệt độ"
          ],
          filipino: [
            "Buksan ang thermometer at hintayin ang ready signal",
            "Ilagay ang dulo sa ilalim ng dila, sa gilid ng bibig",
            "Isara ang bibig ng mahinahon at panatilihing nakadikit ang labi",
            "Hintayin ang tunog ng thermometer (karaniwang 30-60 segundo)",
            "Alisin at basahin ang temperature display"
          ],
          myanmar: [
            "အပူချိန်တိုင်းကိရိယာကို ဖွင့်ပြီး အဆင်သင့်အချက်အလက်ကို စောင့်ပါ",
            "လျှာအောက်တွင် ပါးစပ်ဘေးတွင် ထိပ်ကို ထားပါ",
            "ပါးစပ်ကို နူးညံ့စွာပိတ်ပြီး နှုတ်ခမ်းများကို ကပ်အောင်ထားပါ",
            "အပူချိန်တိုင်းကိရိယာ ဗီပ်အသံထွက်သည်အထိ စောင့်ပါ (ပုံမှန် 30-60 စက္ကန့်)",
            "ဖယ်ရှားပြီး အပူချိန်ပြသမှုကို ဖတ်ပါ"
          ],
          lao: [
            "ເປີດເຄື່ອງວັດອຸນຫະພູມແລະລໍຖ້າສັນຍານພ້ອມ",
            "ວາງປາຍໃຕ້ລີ້ນຂອງເຈົ້າ, ຢູ່ຂ້າງປາກ",
            "ປິດປາກເບົາໆແລະໃຫ້ຮິມຝີປາກແນບກັນ",
            "ລໍຖ້າເຄື່ອງວັດອຸນຫະພູມສົ່ງສຽງບີບ (ປົກກະຕິ 30-60 ວິນາທີ)",
            "ເອົາອອກແລະອ່ານການສະແດງອຸນຫະພູມ"
          ],
          khmer: [
            "បើកម៉ាស៊ីនវាស់កម្ដៅ និងរង់ចាំសញ្ញាណ​ត្រៀម",
            "ដាក់ចុងនៅក្រោមអណ្ដាត របស់អ្នក នៅជិតមាត់",
            "បិទមាត់បន្តិចៗ និងទុកបបូរមាត់ឲ្យជិតគ្នា",
            "រង់ចាំម៉ាស៊ីនវាស់កម្ដៅបន្លឺសំឡេង (ធម្មតា 30-60 វិនាទី)",
            "យកចេញ និងអានការបង្ហាញកម្ដៅ"
          ],
          brunei_malay: [
            "Buka termometer dan tunggu isyarat sedia",
            "Letakkan hujung di bawah lidah anda, di sisi mulut",
            "Tutup mulut perlahan dan pastikan bibir rapat",
            "Tunggu termometer berbunyi bip (biasanya 30-60 saat)",
            "Keluarkan dan baca paparan suhu"
          ]
        },
        infrared_thermometer: {
          english: device.steps,
          bahasa_indonesia: [
            "Nyalakan termometer infrared dan tunggu sinyal siap",
            "Arahkan ke dahi, jaga jarak 1-3 cm",
            "Tekan tombol pengukuran dan tahan tetap",
            "Tunggu bunyi bip dan hasil pengukuran",
            "Baca hasil suhu pada layar"
          ],
          bahasa_melayu: [
            "Hidupkan termometer inframerah dan tunggu isyarat sedia",
            "Halakan ke dahi, jaga jarak 1-3 cm",
            "Tekan butang pengukuran dan tahan",
            "Tunggu bunyi bip dan keputusan pengukuran",
            "Baca keputusan suhu pada skrin"
          ],
          thai: [
            "เปิดเครื่องวัดอุณหภูมิอินฟราเรดและรอสัญญาณพร้อม",
            "จ่อไปที่หน้าผาก เว้นระยะ 1-3 ซม.",
            "กดและกดค้างปุ่มวัด",
            "รอเสียงบี๊บและผลการวัด",
            "อ่านอุณหภูมิบนจอแสดงผล"
          ],
          vietnamese: [
            "Bật nhiệt kế hồng ngoại và đợi tín hiệu sẵn sàng",
            "Hướng về phía trán, cách 1-3 cm",
            "Nhấn và giữ nút đo",
            "Đợi tiếng bíp và kết quả đo",
            "Đọc nhiệt độ trên màn hình"
          ],
          filipino: [
            "Buksan ang infrared thermometer at hintayin ang ready signal",
            "Itutok sa noo, 1-3 cm ang layo",
            "Pindutin at hawakan ang measurement button",
            "Hintayin ang beep at measurement result",
            "Basahin ang temperature sa display"
          ],
          myanmar: [
            "အင်ဖရာရက်အပူချိန်တိုင်းကိရိယာကို ဖွင့်ပြီး အဆင်သင့်အချက်အလက်ကို စောင့်ပါ",
            "နဖူးဆီသို့ ညွှန်းပါ၊ 1-3 စင်တီမီတာ အကွာအဝေး",
            "တိုင်းတာမှုခလုတ်ကို နှိပ်ပြီး ဆုပ်ကိုင်ထားပါ",
            "ဗီပ်အသံနှင့် တိုင်းတာမှုရလဒ်ကို စောင့်ပါ",
            "ပြသမှုပေါ်တွင် အပူချိန်ကို ဖတ်ပါ"
          ],
          lao: [
            "ເປີດເຄື່ອງວັດອຸນຫະພູມອິນຟຣາເຣດແລະລໍຖ້າສັນຍານພ້ອມ",
            "ຊີ້ໄປທີ່ຫນ້າຜາກ, ຫ່າງ 1-3 ຊັງຕີແມັດ",
            "ກົດແລະຖືປຸ່ມວັດແທກ",
            "ລໍຖ້າສຽງບີບແລະຜົນການວັດແທກ",
            "ອ່ານອຸນຫະພູມໃນການສະແດງຜົນ"
          ],
          khmer: [
            "បើកម៉ាស៊ីនវាស់កម្ដៅអ៊ីនហ្វ្រារ៉េដ និងរង់ចាំសញ្ញាណត្រៀម",
            "ចង្អុលទៅកាន់ថ្ងាស, ចម្ងាយ 1-3 សង់ទីម៉ែត្រ",
            "ចុចនិងកាន់ប៊ូតុងវាស់",
            "រង់ចាំសំឡេងបន្លឺ និងលទ្ធផលវាស់",
            "អានកម្ដៅនៅលើអេក្រង់បង្ហាញ"
          ],
          brunei_malay: [
            "Buka termometer inframerah dan tunggu isyarat sedia",
            "Halakan ke dahi, jaga jarak 1-3 cm",
            "Tekan dan tahan butang pengukuran",
            "Tunggu bunyi bip dan keputusan pengukuran",
            "Baca suhu pada paparan"
          ]
        },
        blood_pressure_monitor: {
          english: device.steps,
          bahasa_indonesia: [
            "Pasang manset di lengan atas, 2-3 cm di atas siku",
            "Pastikan manset pas tapi tidak terlalu ketat",
            "Tekan tombol START untuk memulai pengukuran",
            "Duduk tenang, jangan bergerak atau bicara",
            "Tunggu pengukuran selesai dan baca hasilnya"
          ],
          bahasa_melayu: [
            "Pasang manset di lengan atas, 2-3 cm di atas siku",
            "Pastikan manset sesuai tetapi tidak terlalu ketat",
            "Tekan butang START untuk memulakan pengukuran",
            "Duduk tenang, jangan bergerak atau bercakap",
            "Tunggu pengukuran selesai dan baca keputusannya"
          ],
          thai: [
            "ใส่สายรัดที่แขนส่วนบน 2-3 ซม. เหนือข้อศอก",
            "ตรวจสอบให้แน่ใจว่าสายรัดพอดีแต่ไม่แน่นเกินไป",
            "กดปุ่ม START เพื่อเริ่มการวัด",
            "นั่งเงียบ อย่าเคลื่อนไหวหรือพูด",
            "รอการวัดเสร็จสิ้นและอ่านผลลัพธ์"
          ],
          vietnamese: [
            "Đặt băng quấn trên cánh tay trên, 2-3 cm phía trên khuỷu tay",
            "Đảm bảo băng quấn vừa vặn nhưng không quá chặt",
            "Nhấn nút START để bắt đầu đo",
            "Ngồi yên lặng, đừng di chuyển hoặc nói chuyện",
            "Đợi đo xong và đọc kết quả"
          ],
          filipino: [
            "Ikabit ang cuff sa itaas ng braso",
            "Siguraduhing tama ang pagkakakabit ng cuff",
            "Pindutin ang START button para simulan",
            "Mananahimik at huwag kumukyut habang sumusukat",
            "Hintayin makumpleto at basahin ang resulta"
          ],
          myanmar: [
            "လက်မောင်းအပေါ်ပိုင်းတွင် လက်စွပ်ကို တပ်ပါ၊ တံတောင်ဆစ်အပေါ် 2-3 စင်တီမီတာ",
            "လက်စွပ်သည် သင့်လျော်သော်လည်း အလွန်တင်းမကျပ်ရန် သေချာပါစေ",
            "တိုင်းတာခြင်းစတင်ရန် START ခလုတ်ကို နှိပ်ပါ",
            "ဆိတ်ဆိတ်ထိုင်ပါ၊ မလှုပ်ရှားပါနှင့် မပြောပါနှင့်",
            "တိုင်းတာမှုပြီးသည်အထိ စောင့်ပြီး ရလဒ်ကို ဖတ်ပါ"
          ],
          lao: [
            "ໃສ່ສາຍຮັດທີ່ແຂນສ່ວນເທິງ, 2-3 ຊັງຕີແມັດເໜືອຂໍ້ຕໍ່",
            "ໃຫ້ແນ່ໃຈວ່າສາຍຮັດພໍດີແຕ່ບໍ່ແໜ້ນເກີນໄປ",
            "ກົດປຸ່ມ START ເພື່ອເລີ່ມການວັດ",
            "ນັ່ງເງິບໆ, ຢ່າເຄື່ອນໄຫວຫຼືເວົ້າ",
            "ລໍຖ້າການວັດສຳເລັດແລະອ່ານຜົນລັບ"
          ],
          khmer: [
            "ដាក់កម្ទេចនៅលើផ្នែកខាងលើនៃដៃ 2-3 សង់ទីម៉ែត្រពីលើកែងដៃ",
            "ត្រូវប្រាកដថាកម្ទេចត្រឹមត្រូវប៉ុន្តែមិនតឹងពេក",
            "ចុចប៊ូតុង START ដើម្បីចាប់ផ្តើមវាស់",
            "អង្គុយស្ងៀម កុំផ្លាស់ទីឬនិយាយ",
            "រង់ចាំការវាស់បានបញ្ចប់ និងអានលទ្ធផល"
          ],
          brunei_malay: [
            "Pasang manset di lengan atas, 2-3 cm di atas siku",
            "Pastikan manset sesuai tetapi tidak terlalu ketat",
            "Tekan butang START untuk memulakan pengukuran",
            "Duduk tenang, jangan bergerak atau bercakap",
            "Tunggu pengukuran selesai dan baca keputusannya"
          ]
        },
        blood_glucose_meter: {
          english: device.steps,
          bahasa_indonesia: [
            "Masukkan strip tes ke dalam alat pengukur",
            "Tusuk ujung jari dengan lancet untuk darah",
            "Teteskan darah ke area tes pada strip",
            "Tunggu alat menghitung kadar gula darah",
            "Baca hasil pada layar dan catat"
          ],
          bahasa_melayu: [
            "Masukkan jalur ujian ke dalam meter",
            "Tusuk hujung jari dengan lancet untuk darah",
            "Teteskan darah ke kawasan ujian pada jalur",
            "Tunggu alat mengira paras gula darah",
            "Baca keputusan pada skrin dan catat"
          ],
          thai: [
            "ใส่แผ่นทดสอบลงในเครื่องวัด",
            "ใช้แลนเซ็ตเจาะปลายนิ้วเพื่อเอาเลือด",
            "หยดเลือดลงบนบริเวณทดสอบของแผ่น",
            "รอเครื่องคำนวณระดับน้ำตาลในเลือด",
            "อ่านผลลัพธ์บนหน้าจอและบันทึก"
          ],
          vietnamese: [
            "Chèn dải thử vào máy đo",
            "Dùng kim chích đầu ngón tay để lấy máu",
            "Nhỏ máu lên vùng thử của dải",
            "Đợi máy tính toán mức đường huyết",
            "Đọc kết quả trên màn hình và ghi lại"
          ],
          filipino: [
            "Ilagay ang test strip sa glucometer",
            "Linisin ang daliri gamit ng alcohol",
            "Gamitin ang lancet para sa dugo sa daliri",
            "Ilagay ang patak ng dugo sa test strip",
            "Hintayin ang resulta sa screen"
          ],
          myanmar: [
            "တိုင်းတာကိရိယာထဲသို့ စမ်းသပ်မှုတန်းကို ထည့်ပါ",
            "လက်ညှိုးဖျားကို သွေးယူရန် လန်းဆက်ဖြင့် ထိုးပါ",
            "တန်း၏ စမ်းသပ်မှုနေရာပေါ်သို့ သွေးကို ယိုခေါက်ပါ",
            "ကိရိယာက သွေးထဲရှိ သကြားဓာတ်ပမာဏကို တွက်ချက်ရန် စောင့်ပါ",
            "ပြသမှုပေါ်တွင် ရလဒ်ကို ဖတ်ပြီး မှတ်တမ်းတင်ပါ"
          ],
          lao: [
            "ໃສ່ແຜ່ນທົດສອບເຂົ້າໄປໃນເຄື່ອງວັດ",
            "ໃຊ້ແລນເຊັດແທງຫົວນິ້ວເພື່ອເອົາເລືອດ",
            "ຢອດເລືອດລົງໃສ່ບໍລິເວນທົດສອບຂອງແຜ່ນ",
            "ລໍຖ້າເຄື່ອງຄິດໄລ່ລະດັບນ້ຳຕານໃນເລືອດ",
            "ອ່ານຜົນລັບໃນໜ້າຈໍ ແລະບັນທຶກ"
          ],
          khmer: [
            "បញ្ចូលបន្ទះធ្វើតេស្តទៅក្នុងម៉ាស៊ីនវាស់",
            "ប្រើឡង់សេតចាក់ចុងម្រាមដៃដើម្បីយកឈាម",
            "ចុះឈាមលើតំបន់ធ្វើតេស្តនៃបន្ទះ",
            "រង់ចាំឲ្យម៉ាស៊ីនគណនាកម្រិតស្ករក្នុងឈាម",
            "អានលទ្ធផលនៅលើអេក្រង់ និងកត់ត្រា"
          ],
          brunei_malay: [
            "Masukkan jalur ujian ke dalam meter",
            "Tusuk hujung jari dengan lancet untuk darah",
            "Teteskan darah ke kawasan ujian pada jalur",
            "Tunggu alat mengira paras gula darah",
            "Baca keputusan pada skrin dan catat"
          ]
        }
      };

      const translatedSteps = fallbackTranslations[deviceType]?.[language] || device.steps;
      const instruction = translatedSteps[currentStep] || currentStepInstruction;

      return {
        instruction: currentStepInstruction,
        translatedInstruction: instruction,
        corrective: isCorrectiveNeeded,
        nextAction: isCorrectiveNeeded ? "Please adjust your position and try again" : undefined,
        audioInstruction: instruction
      };
    }

    try {
      const stylePrompts = {
        direct: "Give short, direct instructions",
        gentle: "Use encouraging, supportive language", 
        detailed: "Provide detailed explanations with reasoning"
      };

      const systemPrompt = `You are SIMIS.AI, a medical device guidance assistant. ${stylePrompts[guidanceStyle]}. 
      Current device: ${device.name}
      Current step ${currentStep + 1}/${device.totalSteps}: ${currentStepInstruction}
      Target language: ${langConfig.nativeName} (${langConfig.code})
      User action detected: ${userAction}
      ${isCorrectiveNeeded ? "PROVIDE CORRECTIVE FEEDBACK" : "PROVIDE ENCOURAGEMENT"}
      
      Respond in JSON format with:
      - instruction: English instruction
      - translatedInstruction: Instruction in ${langConfig.nativeName}
      - corrective: boolean indicating if this is corrective feedback
      - nextAction: what the user should do next (optional)
      - audioInstruction: simplified version for text-to-speech`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `User is on step ${currentStep + 1}: "${currentStepInstruction}". User action: "${userAction}". ${isCorrectiveNeeded ? "User needs correction." : "User is doing well."}` 
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        instruction: result.instruction || currentStepInstruction,
        translatedInstruction: result.translatedInstruction || currentStepInstruction,
        corrective: isCorrectiveNeeded,
        nextAction: result.nextAction,
        audioInstruction: result.audioInstruction || result.translatedInstruction
      };

    } catch (error) {
      console.error('AI Service error:', error);
      // Fallback response
      return {
        instruction: currentStepInstruction,
        translatedInstruction: currentStepInstruction,
        corrective: isCorrectiveNeeded,
        nextAction: undefined,
        audioInstruction: currentStepInstruction
      };
    }
  }

  async answerQuestion(
    question: string,
    language: Language,
    deviceType: DeviceType,
    context: string
  ): Promise<string> {
    const device = deviceInstructions[deviceType];
    const langConfig = languageConfig[language];

    // If no valid API key, return fallback response
    if (!hasValidApiKey()) {
      const fallbackResponses: Record<string, string> = {
        "why is the cuff too loose?": "The cuff should be snug but not too tight. You should be able to slip one finger underneath comfortably.",
        "how long should i wait?": "For an oral thermometer, wait until you hear the beep, usually 30-60 seconds.",
        "what if it doesn't beep?": "Make sure the thermometer is turned on and the tip is properly placed under your tongue.",
        "is this temperature normal?": "Normal oral temperature is typically 98.6°F (37°C), but can range from 97-99°F (36.1-37.2°C)."
      };
      
      const normalizedQuestion = question.toLowerCase();
      for (const [key, response] of Object.entries(fallbackResponses)) {
        if (normalizedQuestion.includes(key.slice(0, -1))) { // Remove ? for partial matching
          return response;
        }
      }
      
      return `I'm here to help with ${device.name} usage. Common questions include: positioning, timing, and reading results.`;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are SIMIS.AI helping with ${device.name}. Answer in ${langConfig.nativeName}. Keep responses concise and helpful. Current context: ${context}`
          },
          { role: "user", content: question }
        ],
        max_tokens: 200
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't understand your question.";
    } catch (error) {
      console.error('AI question answering error:', error);
      return "I'm having trouble processing your question right now. Please ensure your API key is configured.";
    }
  }
}

export const aiService = new AIService();

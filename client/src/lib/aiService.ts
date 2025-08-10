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
          bahasa_melayu: device.steps,
          thai: device.steps,
          vietnamese: device.steps,
          filipino: device.steps,
          myanmar: device.steps,
          lao: device.steps,
          khmer: device.steps,
          brunei_malay: device.steps
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
          bahasa_melayu: device.steps,
          thai: device.steps,
          vietnamese: device.steps,
          filipino: device.steps,
          myanmar: device.steps,
          lao: device.steps,
          khmer: device.steps,
          brunei_malay: device.steps
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
          bahasa_melayu: device.steps,
          thai: device.steps,
          vietnamese: device.steps,
          filipino: device.steps,
          myanmar: device.steps,
          lao: device.steps,
          khmer: device.steps,
          brunei_malay: device.steps
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
          bahasa_melayu: device.steps,
          thai: device.steps,
          vietnamese: device.steps,
          filipino: device.steps,
          myanmar: device.steps,
          lao: device.steps,
          khmer: device.steps,
          brunei_malay: device.steps
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

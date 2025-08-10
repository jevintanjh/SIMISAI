import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from 'openai';
import { z } from 'zod';

// OpenAI client for backend API usage
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const aiGuidanceRequestSchema = z.object({
  deviceType: z.string(),
  currentStep: z.number(),
  language: z.string(),
  guidanceStyle: z.string(),
  userAction: z.string(),
  isCorrectiveNeeded: z.boolean().default(false),
  deviceName: z.string().optional(),
  currentStepInstruction: z.string().optional(),
  languageNativeName: z.string().optional(),
  languageCode: z.string().optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Guidance session endpoints
  app.post("/api/guidance/start", (req, res) => {
    try {
      const { deviceType, language, guidanceStyle, voicePreference } = req.body;
      
      const session = {
        id: `session_${Date.now()}`,
        deviceType,
        language,
        guidanceStyle,
        voicePreference,
        currentStep: 0,
        totalSteps: 5,
        isActive: true,
        createdAt: new Date(),
        completedSteps: [],
        feedback: []
      };

      res.json({ success: true, session });
    } catch (error) {
      res.status(500).json({ error: "Failed to start guidance session" });
    }
  });

  app.post("/api/guidance/:sessionId/step", (req, res) => {
    try {
      const { sessionId } = req.params;
      const { stepNumber, completed } = req.body;

      // In a real implementation, this would update the session in the database
      res.json({ 
        success: true, 
        message: `Step ${stepNumber} ${completed ? 'completed' : 'updated'}` 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update step" });
    }
  });

  app.post("/api/guidance/:sessionId/end", (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // In a real implementation, this would mark the session as completed
      res.json({ success: true, message: "Session ended successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  // Computer vision simulation endpoint
  app.post("/api/cv/analyze", (req, res) => {
    try {
      const { imageData, deviceType } = req.body;
      
      // Simulate computer vision processing delay
      setTimeout(() => {
        const confidence = 0.7 + Math.random() * 0.25;
        const deviceDetected = Math.random() > 0.3;
        
        const result = {
          deviceDetected,
          deviceType: deviceDetected ? deviceType : undefined,
          confidence,
          boundingBox: deviceDetected ? {
            x: 150 + Math.random() * 100,
            y: 100 + Math.random() * 50,
            width: 200 + Math.random() * 100,
            height: 150 + Math.random() * 50
          } : undefined,
          userActions: ["positioning_device"],
          feedback: deviceDetected ? undefined : "Device not clearly visible"
        };

        res.json(result);
      }, 500);
    } catch (error) {
      res.status(500).json({ error: "Computer vision analysis failed" });
    }
  });

  // AI Guidance Generation endpoint
  app.post("/api/ai/generate-guidance", async (req, res) => {
    try {
      const data = aiGuidanceRequestSchema.parse(req.body);
      
      console.log('AI Generation Request:', {
        deviceType: data.deviceType,
        guidanceStyle: data.guidanceStyle,
        language: data.language,
        currentStep: data.currentStep,
        userAction: data.userAction,
        isCorrectiveNeeded: data.isCorrectiveNeeded
      });
      
      const stylePrompts = {
        direct: "BE DIRECT AND BRIEF. Use minimal words. No encouragement or praise. Just state what to do. Example: 'Place thermometer under tongue. Wait for beep.' Maximum 10 words per sentence.",
        gentle: "BE VERY ENCOURAGING AND SUPPORTIVE. Always start with praise like 'You're doing wonderfully!' or 'Great work!' Use caring language like 'Take your time', 'Don't worry', 'You've got this!' Make the user feel supported and confident.", 
        detailed: "BE EDUCATIONAL AND THOROUGH. Explain WHY each step is important, what sounds/sensations to expect, potential issues to watch for, and scientific reasoning. Include tips and background knowledge. Use 2-3 sentences minimum with rich context."
      };

      const systemPrompt = `You are SIMIS.AI, a medical device guidance assistant.

GUIDANCE STYLE: ${data.guidanceStyle.toUpperCase()}
STYLE REQUIREMENT: ${stylePrompts[data.guidanceStyle]}

Current device: ${data.deviceName || data.deviceType}
Current step ${data.currentStep + 1}: ${data.currentStepInstruction || "Using medical device"}
Target language: ${data.languageNativeName || data.language} (${data.languageCode || data.language})
User action detected: ${data.userAction}
${data.isCorrectiveNeeded ? "PROVIDE CORRECTIVE FEEDBACK" : "PROVIDE ENCOURAGEMENT"}

IMPORTANT: Your response must match the ${data.guidanceStyle} style exactly as described above.

Respond in JSON format with:
- instruction: English instruction
- translatedInstruction: Instruction in ${data.languageNativeName || data.language}
- corrective: boolean indicating if this is corrective feedback
- nextAction: what the user should do next (optional)
- audioInstruction: SAME as translatedInstruction - keep audio and visual instructions identical for consistency`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `User is on step ${data.currentStep + 1}: "${data.currentStepInstruction}". User action: "${data.userAction}". ${data.isCorrectiveNeeded ? "User needs correction." : "User is doing well."}` 
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      console.log('AI Generation Response:', {
        style: data.guidanceStyle,
        instruction: result.instruction,
        translatedInstruction: result.translatedInstruction
      });
      
      res.json({
        instruction: result.instruction || data.currentStepInstruction,
        translatedInstruction: result.translatedInstruction || data.currentStepInstruction,
        corrective: data.isCorrectiveNeeded,
        nextAction: result.nextAction,
        audioInstruction: result.audioInstruction || result.translatedInstruction
      });

    } catch (error) {
      console.error('AI Generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate AI guidance",
        fallback: true 
      });
    }
  });

  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { question, language, deviceType, context } = req.body;
      
      if (!question || !language || !deviceType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      console.log('AI Chat Request:', {
        question,
        language,
        deviceType,
        context
      });

      const deviceInfo = {
        blood_pressure_monitor: "Blood Pressure Monitor",
        infrared_thermometer: "Infrared Thermometer", 
        oral_thermometer: "Oral Thermometer",
        blood_glucose_meter: "Blood Glucose Meter"
      }[deviceType] || deviceType;

      const languageNames: Record<string, string> = {
        english: "English",
        bahasa_indonesia: "Bahasa Indonesia",
        bahasa_melayu: "Bahasa Melayu",
        thai: "Thai",
        vietnamese: "Vietnamese",
        myanmar: "Myanmar",
        khmer: "Khmer",
        lao: "Lao",
        tagalog: "Tagalog",
        brunei_malay: "Brunei Malay"
      };

      const languageName = languageNames[language] || language;

      const systemPrompt = `You are SIMIS.AI, a helpful medical device guidance assistant.

You are helping with: ${deviceInfo}
Current context: ${context || "Initial setup"}
Answer in: ${languageName}

FORMATTING RULES:
- Use numbered lists (1. 2. 3.) for step-by-step solutions
- Use bullet points (- ) for multiple options or tips  
- Use **bold text** for important keywords or device names
- Add line breaks between different points for readability
- Keep each point concise (1-2 sentences max)

Provide helpful, accurate, and well-formatted answers about medical device usage. Keep responses conversational and supportive.
Focus on safety, proper usage techniques, and addressing user concerns.

Example of good formatting:
**Kiểm tra các nguyên nhân có thể:**

1. **Kiểm tra pin**: Đảm bảo pin được lắp đúng hướng và còn đủ năng lượng
2. **Kiểm tra nút nguồn**: Nhấn và giữ nút trong đủ thời gian
3. **Xem hướng dẫn**: Kiểm tra các yêu cầu đặc biệt để khởi động

**Lưu ý**: Nếu vẫn không hoạt động, hãy liên hệ hỗ trợ kỹ thuật.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        max_tokens: 300
      });

      const answer = response.choices[0].message.content || "I'm sorry, I couldn't understand your question.";

      console.log('AI Chat Response:', { answer });

      res.json({ answer });

    } catch (error) {
      console.error('AI Chat error:', error);
      res.status(500).json({ 
        error: "Failed to process chat question",
        answer: "I'm having trouble processing your question right now. Please try again."
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

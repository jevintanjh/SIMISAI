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
      
      const stylePrompts = {
        direct: "Give short, direct instructions",
        gentle: "Use encouraging, supportive language", 
        detailed: "Provide detailed explanations with reasoning"
      };

      const systemPrompt = `You are SIMIS.AI, a medical device guidance assistant. ${stylePrompts[data.guidanceStyle]}. 
      Current device: ${data.deviceName || data.deviceType}
      Current step ${data.currentStep + 1}: ${data.currentStepInstruction || "Using medical device"}
      Target language: ${data.languageNativeName || data.language} (${data.languageCode || data.language})
      User action detected: ${data.userAction}
      ${data.isCorrectiveNeeded ? "PROVIDE CORRECTIVE FEEDBACK" : "PROVIDE ENCOURAGEMENT"}
      
      Respond in JSON format with:
      - instruction: English instruction
      - translatedInstruction: Instruction in ${data.languageNativeName || data.language}
      - corrective: boolean indicating if this is corrective feedback
      - nextAction: what the user should do next (optional)
      - audioInstruction: simplified version for text-to-speech in the target language`;

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

  const httpServer = createServer(app);
  return httpServer;
}

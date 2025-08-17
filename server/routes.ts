import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertChatMessageSchema, insertGuidanceSessionSchema } from "@shared/schema";
import { z } from "zod";
import { cvService } from "./cv-service";
import { cvServiceHF } from "./cv-service-hf";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket for real-time chat on a specific path to avoid conflicts
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/chat-ws',
    // Add error handling for WebSocket server
    handleProtocols: () => 'chat-protocol'
  });
  
  // Handle WebSocket server errors
  wss.on('error', (error: any) => {
    console.error('WebSocket server error:', error);
    if (error.code === 'ENOTSUP') {
      console.log('WebSocket server binding issue detected, continuing with HTTP server...');
    }
  });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to chat');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          // Save user message
          const userMessage = await storage.createChatMessage({
            sessionId: message.sessionId,
            message: message.content,
            isUser: true,
            language: message.language || 'en'
          });
          
          // Broadcast user message
          wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                message: userMessage
              }));
            }
          });
          
          // Generate AI response via Sealion AI (with safe fallback)
          const aiResponse = await generateSealionResponse({
            sessionId: message.sessionId,
            userMessage: message.content,
            language: message.language || 'en'
          });
          const aiMessage = await storage.createChatMessage({
            sessionId: message.sessionId,
            message: aiResponse,
            isUser: false,
            language: message.language || 'en'
          });
          
          // Broadcast AI response
          setTimeout(() => {
            wss.clients.forEach(client => {
              if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({
                  type: 'chat_message',
                  message: aiMessage
                }));
              }
            });
          }, 1000);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from chat');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
    });
  });

  // API Routes
  app.post('/api/chat/ask', async (req, res) => {
    try {
      const { sessionId, question, language = 'en', deviceHint } = req.body || {};
      const sid: string = sessionId || 'default';

      // Save user message
      const savedUser = await storage.createChatMessage({
        sessionId: sid,
        message: String(question || ''),
        isUser: true,
        language
      });

      // Build extra context from device hint
      let extraContext = '';
      if (deviceHint && typeof deviceHint === 'object') {
        const parts: string[] = [];
        if (deviceHint.type) parts.push(`Detected device type: ${deviceHint.type}`);
        if (deviceHint.label) parts.push(`Label: ${deviceHint.label}`);
        if (deviceHint.confidence) parts.push(`Confidence: ${deviceHint.confidence}`);
        if (parts.length) extraContext = parts.join('\n');
      }

      const answer = await generateSealionResponse({
        sessionId: sid,
        userMessage: savedUser.message,
        language,
        extraContext
      });

      const savedAi = await storage.createChatMessage({
        sessionId: sid,
        message: answer,
        isUser: false,
        language
      });

      res.json({ ok: true, message: savedAi });
    } catch (err) {
      console.error('[chat] /api/chat/ask failed:', err);
      res.status(500).json({ ok: false, error: 'Chat failed' });
    }
  });
  app.get('/api/debug/sealion', async (_req, res) => {
    const configured = Boolean(process.env.SEALION_API_KEY && (process.env.SEALION_API_URL || process.env.OPENAI_BASE_URL));
    const details = {
      configured,
      apiBaseUrl: (process.env.SEALION_API_URL || process.env.OPENAI_BASE_URL) ? 'present' : 'missing',
      model: process.env.SEALION_MODEL || 'sealion-v3.5-8b-instruct',
      env: process.env.NODE_ENV
    };
    res.json(details);
  });
  app.get('/api/devices', async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  });

  app.get('/api/devices/:id', async (req, res) => {
    try {
      const device = await storage.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch device' });
    }
  });

  app.get('/api/devices/:id/instructions', async (req, res) => {
    try {
      const instructions = await storage.getInstructionsByDevice(req.params.id);
      res.json(instructions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch instructions' });
    }
  });

  app.get('/api/devices/:id/instructions/:step', async (req, res) => {
    try {
      const step = parseInt(req.params.step);
      const instruction = await storage.getInstruction(req.params.id, step);
      if (!instruction) {
        return res.status(404).json({ error: 'Instruction not found' });
      }
      res.json(instruction);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch instruction' });
    }
  });

  app.post('/api/guidance-sessions', async (req, res) => {
    try {
      const sessionData = insertGuidanceSessionSchema.parse(req.body);
      const session = await storage.createGuidanceSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid session data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create guidance session' });
    }
  });

  app.get('/api/guidance-sessions/:id', async (req, res) => {
    try {
      const session = await storage.getGuidanceSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch session' });
    }
  });

  app.patch('/api/guidance-sessions/:id', async (req, res) => {
    try {
      const updates = req.body;
      const session = await storage.updateGuidanceSession(req.params.id, updates);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update session' });
    }
  });

  app.get('/api/chat/:sessionId', async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  });

  // CV Detection Routes
  app.post('/api/cv/detect', async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      console.log('CV detection request received');
      console.log('Image data length:', imageData.length);
      
      // Use Hugging Face service if HF_SPACES_URL is set, otherwise use local service
      const service = process.env.HF_SPACES_URL ? cvServiceHF : cvService;
      const result = await service.detectObjectsFromBase64(imageData);
      
      console.log('CV detection completed');
      console.log('Detections found:', result.detections.length);
      
      res.json(result);
    } catch (error) {
      console.error('CV detection error:', error);
      res.status(500).json({ 
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.get('/api/cv/health', async (req, res) => {
    try {
      console.log('CV health check requested');
      
      const isHealthy = await cvService.healthCheck();
      const modelInfo = cvService.getModelInfo();
      
      console.log('CV health check result:', { isHealthy, modelInfo });
      
      res.json({
        healthy: isHealthy,
        model_info: modelInfo,
        timestamp: new Date().toISOString(),
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          CV_MODEL_PATH: process.env.CV_MODEL_PATH,
          HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN ? 'SET' : 'NOT_SET'
        }
      });
    } catch (error) {
      console.error('CV health check error:', error);
      res.status(500).json({ 
        error: 'CV service health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/cv/stream', async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      // For real-time streaming, you might want to implement WebSocket
      // This is a placeholder for future real-time detection
      const result = await cvService.detectObjectsFromBase64(imageData);
      res.json(result);
    } catch (error) {
      console.error('CV stream error:', error);
      res.status(500).json({ 
        error: 'Failed to process stream',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return httpServer;
}

async function generateSealionResponse(args: { sessionId: string; userMessage: string; language: string; extraContext?: string }): Promise<string> {
  const { sessionId, userMessage, language, extraContext } = args;

  const apiKey = process.env.SEALION_API_KEY;
  const apiBaseUrl = process.env.SEALION_API_URL || process.env.OPENAI_BASE_URL;
  const model = process.env.SEALION_MODEL || "sealion-v3.5-8b-instruct";

  if (!apiKey || !apiBaseUrl) {
    console.log('[chat] Sealion not configured. Using fallback.');
    return generateFallbackResponse(userMessage, language);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const history = (await storage.getChatMessages(sessionId)).slice(-8);
    // Try to enrich context using the user's current session and device instructions when available
    let deviceContext = '';
    try {
      const session = await storage.getGuidanceSession(sessionId);
      if (session?.deviceId) {
        const steps = await storage.getInstructionsByDevice(session.deviceId);
        const current = session.currentStep ?? 1;
        const nearby = steps
          .filter(s => Math.abs(s.stepNumber - current) <= 2)
          .map(s => `Step ${s.stepNumber}: ${s.title} — ${s.description}`)
          .join('\n');
        if (nearby) deviceContext = `Relevant device steps (around current step ${current}):\n${nearby}`;
      }
    } catch {}

    const messages = [
      {
        role: "system",
        content: [
          "You are SIMIS AI, a multilingual medical device assistant.",
          `- Answer strictly in the user's language (ISO code: ${language}). Do not switch languages.`,
          "- Explain step-by-step, short and clear.",
          "- If safety-critical, recommend checking the device manual and consulting a clinician.",
          "- Keep responses under 120 words.",
          deviceContext ? `\n${deviceContext}` : '',
          extraContext ? `\n${extraContext}` : ''
        ].filter(Boolean).join('\n')
      },
      ...history.map(m => ({ role: m.isUser ? "user" : "assistant", content: m.message })),
      { role: "user", content: userMessage }
    ];

    // Normalize base URL (handle cases where env includes trailing slash or /v1)
    const normalizedBase = (apiBaseUrl || '')
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/v1$/i, '');
    const endpoint = `${normalizedBase}/v1/chat/completions`;
    console.log('[chat] Calling Sealion:', { endpoint, model });
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 400,
        chat_template_kwargs: {
          thinking_mode: "off"
        },
        cache: {
          "no-cache": true
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[chat] Sealion API error:", res.status, text);
      return generateFallbackResponse(userMessage, language);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    console.log('[chat] Sealion success');
    return content || generateFallbackResponse(userMessage, language);
  } catch (error) {
    console.error("[chat] Sealion API request failed:", error);
    return generateFallbackResponse(userMessage, language);
  }
}

function generateFallbackResponse(userMessage: string, language: string): string {
  const responses = {
    en: {
      cuff: "The cuff should be snug, not tight. You should be able to slide one finger under it.",
      tight: "If it feels too tight, loosen slightly. It must be secure without restricting blood flow.",
      position: "Position the cuff ~1 inch above the elbow with the tube pointing down your arm.",
      default: "I can help with your device. What step are you on, or what seems unclear?"
    },
    id: {
      cuff: "Manset harus pas, tidak terlalu ketat. Harus bisa menyelipkan satu jari di bawahnya.",
      tight: "Jika terlalu ketat, longgarkan sedikit. Harus aman tanpa menghambat aliran darah.",
      position: "Posisikan manset ~1 inci di atas siku dengan selang mengarah ke bawah lengan.",
      default: "Saya dapat membantu. Anda berada di langkah berapa atau bagian mana yang kurang jelas?"
    },
    th: {
      cuff: "ข้อมือควรพอดี ไม่แน่นเกินไป ควรสอดนิ้วเข้าไปได้หนึ่งนิ้ว",
      tight: "หากแน่นเกินไป ให้คลายเล็กน้อย ควรมั่นคงแต่ไม่รบกวนการไหลเวียนเลือด",
      position: "วางข้อมือประมาณ 1 นิ้วเหนือข้อศอก โดยให้ท่อหันลงตามแขน",
      default: "ฉันช่วยได้ คุณอยู่ขั้นตอนไหน หรือส่วนไหนที่ยังไม่ชัดเจน?"
    },
    vi: {
      cuff: "Vòng bít phải vừa khít, không quá chặt. Có thể luồn một ngón tay vào bên dưới.",
      tight: "Nếu quá chặt, hãy nới lỏng một chút. Phải chắc nhưng không cản trở máu lưu thông.",
      position: "Đặt vòng bít cách khuỷu tay ~1 inch, ống hướng xuống cánh tay.",
      default: "Tôi có thể giúp. Bạn đang ở bước nào, hoặc phần nào chưa rõ?"
    },
    fil: {
      cuff: "Ang cuff ay dapat sakto lang, hindi masyadong mahigpit. Dapat maisuot ang isang daliri sa ilalim.",
      tight: "Kung masyadong mahigpit, luwagan nang bahagya. Dapat ligtas ngunit hindi humahadlang sa daloy ng dugo.",
      position: "Iposisyon ang cuff ~1 pulgada sa itaas ng siko, ang tubo ay pababa sa braso.",
      default: "Makakatulong ako. Nasa anong hakbang ka o anong bahagi ang hindi malinaw?"
    }
  } as const;

  const lang = (responses as any)[language] || responses.en;
  const text = userMessage.toLowerCase();
  if (text.includes('cuff') || text.includes('manset')) return lang.cuff;
  if (text.includes('tight') || text.includes('ketat')) return lang.tight;
  if (text.includes('position') || text.includes('posisi')) return lang.position;
  return lang.default;
}

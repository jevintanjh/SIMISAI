import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertChatMessageSchema, insertGuidanceSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket for real-time chat on a specific path to avoid conflicts
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/chat-ws'
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
          
          // Generate AI response (simplified)
          const aiResponse = generateAIResponse(message.content, message.language);
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
  });

  // API Routes
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

  return httpServer;
}

function generateAIResponse(userMessage: string, language: string): string {
  const responses = {
    en: {
      cuff: "The cuff should be snug but not tight. You should be able to slip one finger underneath it comfortably.",
      tight: "If the cuff feels too tight, loosen it slightly. It should be secure but not cutting off circulation.",
      position: "Make sure the cuff is positioned about 1 inch above your elbow, with the tube facing down your arm.",
      default: "I can help you with your blood pressure monitoring. What specific step are you having trouble with?"
    },
    id: {
      cuff: "Manset harus pas tetapi tidak ketat. Anda harus bisa menyelipkan satu jari di bawahnya dengan nyaman.",
      tight: "Jika manset terasa terlalu ketat, longgarkan sedikit. Harus aman tetapi tidak memotong sirkulasi.",
      position: "Pastikan manset diposisikan sekitar 1 inci di atas siku Anda, dengan selang menghadap ke bawah lengan.",
      default: "Saya dapat membantu Anda dengan pemantauan tekanan darah. Langkah spesifik apa yang Anda kesulitan?"
    }
  };

  const langResponses = responses[language as keyof typeof responses] || responses.en;
  
  if (userMessage.toLowerCase().includes('cuff') || userMessage.toLowerCase().includes('manset')) {
    return langResponses.cuff;
  }
  if (userMessage.toLowerCase().includes('tight') || userMessage.toLowerCase().includes('ketat')) {
    return langResponses.tight;
  }
  if (userMessage.toLowerCase().includes('position') || userMessage.toLowerCase().includes('posisi')) {
    return langResponses.position;
  }
  
  return langResponses.default;
}

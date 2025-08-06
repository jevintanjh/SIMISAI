import { 
  type Device, 
  type Instruction, 
  type ChatMessage, 
  type GuidanceSession,
  type InsertDevice, 
  type InsertInstruction, 
  type InsertChatMessage, 
  type InsertGuidanceSession 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Devices
  getDevices(): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  
  // Instructions
  getInstructionsByDevice(deviceId: string): Promise<Instruction[]>;
  getInstruction(deviceId: string, stepNumber: number): Promise<Instruction | undefined>;
  createInstruction(instruction: InsertInstruction): Promise<Instruction>;
  
  // Chat Messages
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Guidance Sessions
  getGuidanceSession(id: string): Promise<GuidanceSession | undefined>;
  createGuidanceSession(session: InsertGuidanceSession): Promise<GuidanceSession>;
  updateGuidanceSession(id: string, updates: Partial<GuidanceSession>): Promise<GuidanceSession | undefined>;
}

export class MemStorage implements IStorage {
  private devices: Map<string, Device>;
  private instructions: Map<string, Instruction>;
  private chatMessages: Map<string, ChatMessage>;
  private guidanceSessions: Map<string, GuidanceSession>;

  constructor() {
    this.devices = new Map();
    this.instructions = new Map();
    this.chatMessages = new Map();
    this.guidanceSessions = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample devices
    const bpMonitor: Device = {
      id: randomUUID(),
      name: "Digital BP Monitor",
      type: "bp_monitor",
      stepCount: 5,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Automated blood pressure monitoring device"
    };

    const glucoseMeter: Device = {
      id: randomUUID(),
      name: "Glucose Meter",
      type: "glucose_meter",
      stepCount: 4,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Blood glucose monitoring device"
    };

    this.devices.set(bpMonitor.id, bpMonitor);
    this.devices.set(glucoseMeter.id, glucoseMeter);

    // Create sample instructions for BP Monitor
    const bpInstructions: Instruction[] = [
      {
        id: randomUUID(),
        deviceId: bpMonitor.id,
        stepNumber: 1,
        title: "Prepare the Device",
        description: "Ensure the blood pressure monitor is on a stable surface and plugged in or has sufficient battery.",
        translations: {
          "id": {
            title: "Persiapkan Perangkat",
            description: "Pastikan monitor tekanan darah berada di permukaan yang stabil dan terpasang atau memiliki baterai yang cukup."
          }
        },
        audioUrl: null,
        imageUrl: null,
        checkpoints: ["Device powered on", "Stable surface"]
      },
      {
        id: randomUUID(),
        deviceId: bpMonitor.id,
        stepNumber: 2,
        title: "Wrap the Cuff Around Your Arm",
        description: "Place the cuff around your upper arm, about 1 inch above your elbow. The cuff should be snug but not too tight.",
        translations: {
          "id": {
            title: "Lingkarkan Manset di Lengan Anda",
            description: "Lingkarkan manset di sekitar lengan atas Anda, sekitar 1 inci di atas siku. Manset harus pas tetapi tidak terlalu ketat."
          }
        },
        audioUrl: null,
        imageUrl: null,
        checkpoints: ["Cuff positioned correctly", "Proper tightness"]
      }
    ];

    bpInstructions.forEach(instruction => {
      this.instructions.set(instruction.id, instruction);
    });
  }

  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(device => device.isActive);
  }

  async getDevice(id: string): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = randomUUID();
    const device: Device = { 
      ...insertDevice, 
      id,
      description: insertDevice.description ?? null,
      isActive: insertDevice.isActive ?? true,
      imageUrl: insertDevice.imageUrl ?? null
    };
    this.devices.set(id, device);
    return device;
  }

  async getInstructionsByDevice(deviceId: string): Promise<Instruction[]> {
    return Array.from(this.instructions.values())
      .filter(instruction => instruction.deviceId === deviceId)
      .sort((a, b) => a.stepNumber - b.stepNumber);
  }

  async getInstruction(deviceId: string, stepNumber: number): Promise<Instruction | undefined> {
    return Array.from(this.instructions.values())
      .find(instruction => instruction.deviceId === deviceId && instruction.stepNumber === stepNumber);
  }

  async createInstruction(insertInstruction: InsertInstruction): Promise<Instruction> {
    const id = randomUUID();
    const instruction: Instruction = { 
      ...insertInstruction, 
      id,
      translations: insertInstruction.translations ?? null,
      audioUrl: insertInstruction.audioUrl ?? null,
      imageUrl: insertInstruction.imageUrl ?? null,
      checkpoints: insertInstruction.checkpoints || null
    };
    this.instructions.set(id, instruction);
    return instruction;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      language: insertMessage.language ?? "en",
      timestamp: new Date().toISOString() 
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getGuidanceSession(id: string): Promise<GuidanceSession | undefined> {
    return this.guidanceSessions.get(id);
  }

  async createGuidanceSession(insertSession: InsertGuidanceSession): Promise<GuidanceSession> {
    const id = randomUUID();
    const session: GuidanceSession = { 
      ...insertSession, 
      id,
      currentStep: insertSession.currentStep ?? 1,
      language: insertSession.language ?? "en",
      completedAt: insertSession.completedAt ?? null,
      isCompleted: insertSession.isCompleted ?? false,
      startedAt: new Date().toISOString() 
    };
    this.guidanceSessions.set(id, session);
    return session;
  }

  async updateGuidanceSession(id: string, updates: Partial<GuidanceSession>): Promise<GuidanceSession | undefined> {
    const session = this.guidanceSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.guidanceSessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();

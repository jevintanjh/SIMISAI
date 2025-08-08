import { GuidanceSession } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for SIMIS AI guidance sessions
export interface IStorage {
  getSession(id: string): Promise<GuidanceSession | undefined>;
  createSession(session: Omit<GuidanceSession, 'id'>): Promise<GuidanceSession>;
  updateSession(id: string, updates: Partial<GuidanceSession>): Promise<GuidanceSession | undefined>;
  endSession(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, GuidanceSession>;

  constructor() {
    this.sessions = new Map();
  }

  async getSession(id: string): Promise<GuidanceSession | undefined> {
    return this.sessions.get(id);
  }

  async createSession(sessionData: Omit<GuidanceSession, 'id'>): Promise<GuidanceSession> {
    const id = randomUUID();
    const session: GuidanceSession = { ...sessionData, id };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<GuidanceSession>): Promise<GuidanceSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async endSession(id: string): Promise<boolean> {
    const session = this.sessions.get(id);
    if (!session) return false;
    
    const endedSession = { ...session, isActive: false };
    this.sessions.set(id, endedSession);
    return true;
  }
}

export const storage = new MemStorage();

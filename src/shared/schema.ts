import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "bp_monitor", "glucose_meter", etc.
  stepCount: integer("step_count").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  imageUrl: text("image_url"),
  description: text("description"),
});

export const instructions = pgTable("instructions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  translations: jsonb("translations").$type<Record<string, { title: string; description: string }>>(),
  audioUrl: text("audio_url"),
  imageUrl: text("image_url"),
  checkpoints: jsonb("checkpoints").$type<string[]>(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  message: text("message").notNull(),
  isUser: boolean("is_user").notNull(),
  language: text("language").notNull().default("en"),
  timestamp: text("timestamp").notNull().default(sql`now()`),
});

export const guidanceSessions = pgTable("guidance_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  currentStep: integer("current_step").notNull().default(1),
  language: text("language").notNull().default("en"),
  startedAt: text("started_at").notNull().default(sql`now()`),
  completedAt: text("completed_at"),
  isCompleted: boolean("is_completed").notNull().default(false),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({ id: true });
export const insertInstructionSchema = createInsertSchema(instructions).omit({ id: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true });
export const insertGuidanceSessionSchema = createInsertSchema(guidanceSessions).omit({ id: true, startedAt: true });

export type Device = typeof devices.$inferSelect;
export type Instruction = typeof instructions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type GuidanceSession = typeof guidanceSessions.$inferSelect;

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type InsertInstruction = z.infer<typeof insertInstructionSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertGuidanceSession = z.infer<typeof insertGuidanceSessionSchema>;

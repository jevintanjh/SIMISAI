import { z } from "zod";

// Device types supported by the system (MVP: oral thermometer focus)
export const deviceTypeSchema = z.enum([
  "infrared_thermometer",
  "blood_pressure_monitor",
  "blood_glucose_meter"
]);

// Supported languages
export const languageSchema = z.enum([
  "english",
  "bahasa_indonesia",
  "bahasa_melayu", 
  "thai",
  "vietnamese",
  "filipino",
  "myanmar",
  "lao",
  "khmer",
  "brunei_malay"
]);

// Guidance style preferences
export const guidanceStyleSchema = z.enum([
  "direct",
  "gentle", 
  "detailed"
]);

// Voice preferences
export const voicePreferenceSchema = z.enum([
  "male",
  "female",
  "text_only"
]);

// User guidance session
export const guidanceSessionSchema = z.object({
  id: z.string(),
  deviceType: deviceTypeSchema,
  language: languageSchema,
  guidanceStyle: guidanceStyleSchema,
  voicePreference: voicePreferenceSchema,
  currentStep: z.number().default(0),
  totalSteps: z.number().default(5),
  isActive: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  completedSteps: z.array(z.number()).default([]),
  feedback: z.array(z.string()).default([])
});

// Computer vision detection result
export const detectionResultSchema = z.object({
  deviceDetected: z.boolean(),
  deviceType: deviceTypeSchema.optional(),
  confidence: z.number().min(0).max(1),
  boundingBox: z.object({
    x: z.number(),
    y: z.number(), 
    width: z.number(),
    height: z.number()
  }).optional(),
  userActions: z.array(z.string()).default([]),
  feedback: z.string().optional()
});

// AI guidance response
export const aiGuidanceResponseSchema = z.object({
  instruction: z.string(),
  translatedInstruction: z.string(),
  corrective: z.boolean().default(false),
  nextAction: z.string().optional(),
  audioInstruction: z.string().optional()
});

export type DeviceType = z.infer<typeof deviceTypeSchema>;
export type Language = z.infer<typeof languageSchema>;
export type GuidanceStyle = z.infer<typeof guidanceStyleSchema>;
export type VoicePreference = z.infer<typeof voicePreferenceSchema>;
export type GuidanceSession = z.infer<typeof guidanceSessionSchema>;
export type DetectionResult = z.infer<typeof detectionResultSchema>;
export type AiGuidanceResponse = z.infer<typeof aiGuidanceResponseSchema>;

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageCircle, X, Send, Mic, Bot } from "lucide-react";
import type { ChatMessage } from "@shared/schema";

interface FloatingChatProps {
	sessionId: string;
	language: string;
	deviceHint?: { type?: string; label?: string; confidence?: number } | null;
}

export default function FloatingChat(_props: FloatingChatProps) {
	// Temporarily disabled per request while we rebuild the chatbot
	return null;
}

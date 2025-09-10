import { Icon } from "@iconify/react";

interface OptimizedIconProps {
  icon: string;
  className?: string;
  size?: number | string;
}

export default function OptimizedIcon({ 
  icon, 
  className = "", 
  size = 24 
}: OptimizedIconProps) {
  // For now, we'll use @iconify/react but this can be easily migrated to astro-icon later
  return (
    <Icon 
      icon={icon} 
      className={className}
      style={{ fontSize: size }}
    />
  );
}

// Common icon mappings for easier migration later
export const Icons = {
  // Navigation
  arrowLeft: "mingcute:arrow-left-line",
  arrowRight: "mingcute:arrow-right-line",
  back: "mingcute:arrow-to-left-fill",
  play: "mingcute:play-fill",
  pause: "mingcute:pause-fill",
  stop: "mingcute:stop-line",
  
  // Device & Settings
  device: "mingcute:cellphone-vibration-line",
  settings: "mingcute:settings-1-line",
  language: "mingcute:world-2-line",
  voice: "mingcute:mic-ai-line",
  
  // Status
  check: "mingcute:check-line",
  checkCircle: "mingcute:check-circle-fill",
  alert: "mingcute:alert-fill",
  
  // Camera
  camera: "mingcute:camera-2-line",
  cameraOff: "mingcute:camera-2-off-line",
  refresh: "mingcute:refresh-anticlockwise-1-fill",
  
  // Chat
  chat: "mingcute:chat-4-fill",
  send: "mingcute:send-fill",
  list: "mingcute:list-expansion-fill",
  
  // UI
  checkList: "mingcute:check-list-line",
  externalLink: "mingcute:external-link-line",
} as const;

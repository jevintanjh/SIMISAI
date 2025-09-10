import { Button } from "@/components/ui/button";
import { Camera, List, History, Settings } from "lucide-react";

interface BottomNavigationProps {
  currentTab: "scan" | "devices" | "history" | "settings";
  onTabChange: (tab: "scan" | "devices" | "history" | "settings") => void;
}

export default function BottomNavigation({ currentTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "scan" as const, icon: Camera, label: "Scan" },
    { id: "devices" as const, icon: List, label: "Devices" },
    { id: "history" as const, icon: History, label: "History" },
    { id: "settings" as const, icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1E1B4B] border-t border-[rgba(139,92,246,0.3)] max-w-md mx-auto h-20 z-50 shadow-lg">
      <div className="flex">
        {tabs.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant="ghost"
            onClick={() => onTabChange(id)}
            className={`flex-1 flex-col space-y-1 p-4 h-auto transition-all duration-200 ${
              currentTab === id
                ? "text-[#8B5CF6] bg-[rgba(139,92,246,0.1)]"
                : "text-[#94A3B8] hover:text-[#A78BFA] hover:bg-[rgba(139,92,246,0.05)]"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}

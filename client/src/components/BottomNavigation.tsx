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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
      <div className="flex">
        {tabs.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant="ghost"
            onClick={() => onTabChange(id)}
            className={`flex-1 flex-col space-y-1 p-4 h-auto ${
              currentTab === id
                ? "text-[hsl(207,90%,54%)]"
                : "text-gray-400 hover:text-gray-600"
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

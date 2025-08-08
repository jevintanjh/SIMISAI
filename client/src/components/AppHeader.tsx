import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Stethoscope, Globe, ChevronDown, Camera } from "lucide-react";

interface AppHeaderProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  useMediaPipe?: boolean;
  onToggleMediaPipe?: (enabled: boolean) => void;
}

const languages = [
  { code: "en", name: "English" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "th", name: "ไทย" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "fil", name: "Filipino" },
];

export default function AppHeader({ currentLanguage, onLanguageChange, useMediaPipe = true, onToggleMediaPipe }: AppHeaderProps) {
  const currentLangName = languages.find(lang => lang.code === currentLanguage)?.name || "EN";
  
  return (
    <header className="medical-blue px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-lg p-2">
            <Stethoscope className="text-[hsl(207,90%,54%)] text-lg" />
          </div>
          <h1 className="text-lg font-semibold">SIMIS AI</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {onToggleMediaPipe && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleMediaPipe(!useMediaPipe)}
              className="bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white"
            >
              <Camera className="w-4 h-4 mr-1" />
              <span className="text-xs">{useMediaPipe ? 'MP' : 'STD'}</span>
            </Button>
          )}
          
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white"
            >
              <Globe className="w-4 h-4 mr-2" />
              <span>{currentLangName.slice(0, 2).toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => onLanguageChange(language.code)}
                className={currentLanguage === language.code ? "bg-blue-50" : ""}
              >
                {language.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

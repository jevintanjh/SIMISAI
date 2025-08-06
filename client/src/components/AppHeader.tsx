import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Stethoscope, Globe, ChevronDown } from "lucide-react";

interface AppHeaderProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { code: "en", name: "English" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "th", name: "ไทย" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "fil", name: "Filipino" },
];

export default function AppHeader({ currentLanguage, onLanguageChange }: AppHeaderProps) {
  const currentLangName = languages.find(lang => lang.code === currentLanguage)?.name || "EN";
  
  return (
    <header className="medical-blue px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-lg p-2">
            <Stethoscope className="text-[hsl(207,90%,54%)] text-lg" />
          </div>
          <h1 className="text-lg font-semibold">Medical Assistant</h1>
        </div>
        
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
    </header>
  );
}

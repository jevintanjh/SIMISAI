import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Stethoscope, Globe, Camera } from "lucide-react";

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
  // Updated to use radio buttons instead of dropdown - v2
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  return (
    <header className="px-4 py-3 shadow-lg" style={{ backgroundColor: '#211326' }}>
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-lg p-2">
            <Stethoscope className="text-[#9D7DAA] text-lg" />
          </div>
          <h1 className="text-lg font-semibold text-white">SIMIS AI</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {onToggleMediaPipe && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleMediaPipe(!useMediaPipe)}
              className="hover:bg-[#4D3557] text-white border border-[#9D7DAA]"
            >
              <Camera className="w-4 h-4 mr-1" />
              <span className="text-xs">{useMediaPipe ? 'MP' : 'STD'}</span>
            </Button>
          )}
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="hover:bg-[#4D3557] text-white border border-[#9D7DAA]"
            >
              <Globe className="w-4 h-4 mr-2" />
              <span>{languages.find(lang => lang.code === currentLanguage)?.name.slice(0, 2).toUpperCase()}</span>
            </Button>
            
            {showLanguageSelector && (
              <div className="absolute right-0 top-full mt-2 rounded-lg shadow-lg border border-[#9D7DAA] p-4 min-w-[200px] z-50" style={{ backgroundColor: '#4D3557' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white">Select Language</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLanguageSelector(false)}
                    className="h-6 w-6 p-0 text-[#9D7DAA] hover:text-white hover:bg-[#211326]"
                  >
                    ×
                  </Button>
                </div>
                
                <RadioGroup
                  value={currentLanguage}
                  onValueChange={(value) => {
                    onLanguageChange(value);
                    setShowLanguageSelector(false);
                  }}
                  className="space-y-2"
                >
                  {languages.map((language) => (
                    <div key={language.code} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={language.code} 
                        id={language.code}
                        className="border-[#9D7DAA] text-[#9D7DAA] data-[state=checked]:bg-[#9D7DAA] data-[state=checked]:border-[#9D7DAA]"
                      />
                      <Label 
                        htmlFor={language.code} 
                        className="text-sm text-white cursor-pointer flex-1 hover:text-[#9D7DAA]"
                      >
                        {language.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close language selector */}
      {showLanguageSelector && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowLanguageSelector(false)}
        />
      )}
    </header>
  );
}

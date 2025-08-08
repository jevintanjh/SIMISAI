import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe, ChevronDown } from 'lucide-react';
import { useGuidanceStore } from '@/store/guidanceStore';
import { languageConfig, getLanguageName, getLanguageFlag } from '@/lib/languages';
import { Language } from '@shared/schema';

export const LanguageSelector: React.FC = () => {
  const { selectedLanguage, setSelectedLanguage } = useGuidanceStore();
  const [isOpen, setIsOpen] = useState(false);

  const selectedConfig = languageConfig[selectedLanguage];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="lg"
        className="bg-purple-800/50 border-purple-600 text-purple-100 hover:bg-purple-700/50 px-6 py-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="w-5 h-5 mr-2" />
        <span className="mr-2">{selectedConfig.flag}</span>
        {selectedConfig.nativeName}
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <Card className="bg-purple-900/90 border-purple-600 p-4 min-w-[280px] max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {(Object.entries(languageConfig) as [Language, typeof languageConfig[Language]][]).map(([lang, config]) => (
                <Button
                  key={lang}
                  variant={selectedLanguage === lang ? "default" : "ghost"}
                  size="sm"
                  className="w-full text-left justify-start text-purple-100 hover:bg-purple-700/50"
                  onClick={() => {
                    setSelectedLanguage(lang);
                    setIsOpen(false);
                  }}
                >
                  <span className="mr-2 text-lg">{config.flag}</span>
                  {config.nativeName}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

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
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 px-6 py-3 rounded-lg flex items-center gap-2"
      >
        <Globe className="w-5 h-5" />
        <span className="mr-1">{selectedConfig.flag}</span>
        {selectedConfig.code === 'english' ? 'English' : selectedConfig.nativeName}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-slate-800/90 border border-slate-600 rounded-lg p-3 min-w-[280px] max-h-80 overflow-y-auto">
          <div className="space-y-1">
            {(Object.entries(languageConfig) as [Language, typeof languageConfig[Language]][]).map(([lang, config]) => (
              <button
                key={lang}
                onClick={() => {
                  setSelectedLanguage(lang);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${
                  selectedLanguage === lang 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-base">{config.flag}</span>
                {config.nativeName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Stethoscope, Globe, Camera } from "lucide-react";

interface TestHeaderProps {
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

export default function TestHeader({ currentLanguage, onLanguageChange, useMediaPipe = true, onToggleMediaPipe }: TestHeaderProps) {
  console.log('🚨 TEST HEADER COMPONENT IS LOADING! 🚨');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  return (
    <header style={{ 
      backgroundColor: '#FF0000', 
      color: 'white', 
      padding: '1rem', 
      border: '5px solid yellow',
      fontSize: '24px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          backgroundColor: '#00FF00', 
          color: '#000000', 
          padding: '10px', 
          margin: '0',
          border: '3px solid blue'
        }}>
          🚨 TEST HEADER - THIS SHOULD BE VISIBLE 🚨
        </h1>
        <p style={{ margin: '10px 0', fontSize: '18px' }}>
          If you can see this, the component is working!
        </p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLanguageSelector(!showLanguageSelector)}
          style={{ 
            backgroundColor: '#0000FF', 
            color: 'white', 
            border: '2px solid white',
            padding: '10px 20px'
          }}
        >
          <Globe style={{ marginRight: '8px' }} />
          Language Selector
        </Button>
        
        {onToggleMediaPipe && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleMediaPipe(!useMediaPipe)}
            style={{ 
              backgroundColor: '#FF00FF', 
              color: 'white', 
              border: '2px solid white',
              padding: '10px 20px'
            }}
          >
            <Camera style={{ marginRight: '8px' }} />
            {useMediaPipe ? 'MP' : 'STD'}
          </Button>
        )}
      </div>
      
      {showLanguageSelector && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: '50%', 
          transform: 'translateX(-50%)',
          backgroundColor: '#000000',
          color: 'white',
          padding: '20px',
          border: '3px solid #00FF00',
          borderRadius: '10px',
          marginTop: '10px',
          zIndex: 1000
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Select Language</h3>
          <RadioGroup
            value={currentLanguage}
            onValueChange={(value) => {
              onLanguageChange(value);
              setShowLanguageSelector(false);
            }}
          >
            {languages.map((language) => (
              <div key={language.code} style={{ margin: '10px 0' }}>
                <RadioGroupItem value={language.code} id={language.code} />
                <Label htmlFor={language.code} style={{ marginLeft: '10px' }}>
                  {language.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
    </header>
  );
}

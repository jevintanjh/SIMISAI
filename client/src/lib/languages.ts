import { Language } from "@shared/schema";

export const languageConfig: Record<Language, {
  name: string;
  nativeName: string;
  flag: string;
  code: string;
}> = {
  english: {
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    code: "en"
  },
  bahasa_indonesia: {
    name: "Indonesian",
    nativeName: "Bahasa Indonesia", 
    flag: "🇮🇩",
    code: "id"
  },
  bahasa_melayu: {
    name: "Malay",
    nativeName: "Bahasa Melayu",
    flag: "🇲🇾", 
    code: "ms"
  },
  thai: {
    name: "Thai",
    nativeName: "ภาษาไทย",
    flag: "🇹🇭",
    code: "th"
  },
  vietnamese: {
    name: "Vietnamese", 
    nativeName: "Tiếng Việt",
    flag: "🇻🇳",
    code: "vi"
  },
  filipino: {
    name: "Filipino",
    nativeName: "Filipino", 
    flag: "🇵🇭",
    code: "fil"
  },
  myanmar: {
    name: "Myanmar",
    nativeName: "မြန်မာ",
    flag: "🇲🇲",
    code: "my"
  },
  lao: {
    name: "Lao",
    nativeName: "ລາວ",
    flag: "🇱🇦", 
    code: "lo"
  },
  khmer: {
    name: "Khmer",
    nativeName: "ភាសាខ្មែរ",
    flag: "🇰🇭",
    code: "km"
  },
  brunei_malay: {
    name: "Brunei Malay",
    nativeName: "Bahasa Melayu Brunei",
    flag: "🇧🇳",
    code: "ms-BN"
  }
};

export const getLanguageName = (language: Language): string => {
  return languageConfig[language].nativeName;
};

export const getLanguageFlag = (language: Language): string => {
  return languageConfig[language].flag;
};

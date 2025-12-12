
export enum MBTI {
  INTJ = "INTJ", INTP = "INTP", ENTJ = "ENTJ", ENTP = "ENTP",
  INFJ = "INFJ", INFP = "INFP", ENFJ = "ENFJ", ENFP = "ENFP",
  ISTJ = "ISTJ", ISFJ = "ISFJ", ESTJ = "ESTJ", ESFJ = "ESFJ",
  ISTP = "ISTP", ISFP = "ISFP", ESTP = "ESTP", ESFP = "ESFP"
}

export interface UserProfile {
  name: string;
  profession: string;
  mbti: MBTI | string;
}

export interface ScheduleItem {
  id: string;
  time: string; // HH:MM format (24h)
  title: string;
  description: string;
  completed: boolean;
}

export interface ScheduleResponse {
  reply: string; // Conversational response from AI
  schedule: ScheduleItem[];
  rationale: string;
  lifestyleUpdate?: {
    outfitAdvice?: string;
    dietAdvice?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  dateStr: string;
  schedule: ScheduleItem[];
  rationale: string;
}

export interface TimeZone {
  id: string;
  name: string;
  timeZone: string;
}

export type ThemeId = 'deep-space' | 'morandi-clay' | 'morandi-olive' | 'morandi-blue';

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    bgMain: string;
    bgCard: string;
    bgInput: string;
    textMain: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    border: string;
  };
}

export interface WeatherData {
  temperature: number;
  conditionCode: number;
  conditionText: string;
  isDay: boolean;
  city?: string;
}

export type StyleOption = 
  | 'Minimalist' 
  | 'Classic' 
  | 'Business' 
  | 'Casual Chic' 
  | 'Sporty' 
  | 'Preppy' 
  | 'Vintage' 
  | 'Streetwear';

export interface LifestyleData {
  weather: WeatherData | null;
  selectedStyle: StyleOption;
  outfitAdvice: string;
  dietAdvice: string;
}

export type Language = 'English' | 'Chinese' | 'Spanish' | 'Arabic' | 'Russian' | 'French';

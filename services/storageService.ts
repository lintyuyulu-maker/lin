
import { UserProfile, HistoryEntry, ThemeId, ScheduleItem, ChatMessage, Language, LifestyleData, TimeZone } from '../types';

const KEYS = {
  PROFILE: 'ai_butler_profile',
  HISTORY: 'ai_butler_history',
  THEME: 'ai_butler_theme',
  CURRENT_SCHEDULE: 'ai_butler_current_schedule',
  CHAT_HISTORY: 'ai_butler_chat_history',
  LANGUAGE: 'ai_butler_language',
  LIFESTYLE_DATA: 'ai_butler_lifestyle_data',
  CLOCK_ZONES: 'ai_butler_clock_zones',
  TIMER_SETTINGS: 'ai_butler_timer_settings',
};

export const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const getProfile = (): UserProfile | null => {
  const data = localStorage.getItem(KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
};

export const saveHistoryEntry = (entry: HistoryEntry) => {
  const history = getHistory();
  history.unshift(entry); // Add to top
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
};

export const getHistory = (): HistoryEntry[] => {
  const data = localStorage.getItem(KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
};

export const saveTheme = (themeId: ThemeId) => {
  localStorage.setItem(KEYS.THEME, themeId);
};

export const getTheme = (): ThemeId => {
  // Requirement: Default to "Morandi Clay"
  return (localStorage.getItem(KEYS.THEME) as ThemeId) || 'morandi-clay';
};

export const saveLanguage = (language: Language) => {
  localStorage.setItem(KEYS.LANGUAGE, language);
};

export const getLanguage = (): Language => {
  return (localStorage.getItem(KEYS.LANGUAGE) as Language) || 'English';
};

// --- Session Persistence ---

export const saveCurrentSchedule = (schedule: ScheduleItem[]) => {
  localStorage.setItem(KEYS.CURRENT_SCHEDULE, JSON.stringify(schedule));
};

export const getCurrentSchedule = (): ScheduleItem[] => {
  const data = localStorage.getItem(KEYS.CURRENT_SCHEDULE);
  return data ? JSON.parse(data) : [];
};

export const saveChatHistory = (messages: ChatMessage[]) => {
  localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(messages));
};

export const getChatHistory = (): ChatMessage[] => {
  const data = localStorage.getItem(KEYS.CHAT_HISTORY);
  return data ? JSON.parse(data) : [];
};

export const clearSessionData = () => {
  localStorage.removeItem(KEYS.CURRENT_SCHEDULE);
  localStorage.removeItem(KEYS.CHAT_HISTORY);
};

// --- Module Persistence ---

export const saveLifestyleData = (data: LifestyleData) => {
  localStorage.setItem(KEYS.LIFESTYLE_DATA, JSON.stringify(data));
};

export const getLifestyleData = (): LifestyleData => {
  const data = localStorage.getItem(KEYS.LIFESTYLE_DATA);
  return data ? JSON.parse(data) : {
    weather: null,
    selectedStyle: 'Classic',
    outfitAdvice: '',
    dietAdvice: ''
  };
};

export const saveClockZones = (zones: TimeZone[]) => {
  localStorage.setItem(KEYS.CLOCK_ZONES, JSON.stringify(zones));
};

export const getClockZones = (): TimeZone[] | null => {
  const data = localStorage.getItem(KEYS.CLOCK_ZONES);
  return data ? JSON.parse(data) : null;
};

export const saveTimerSettings = (settings: { duration: number; mode: 'stopwatch' | 'timer' }) => {
  localStorage.setItem(KEYS.TIMER_SETTINGS, JSON.stringify(settings));
};

export const getTimerSettings = () => {
  const data = localStorage.getItem(KEYS.TIMER_SETTINGS);
  return data ? JSON.parse(data) : { duration: 60000, mode: 'stopwatch' };
};

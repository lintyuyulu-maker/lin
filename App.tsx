
import React, { useState, useEffect } from 'react';
import WorldClock from './features/WorldClock';
import PrecisionTimer from './features/PrecisionTimer';
import SmartScheduler from './features/SmartScheduler';
import History from './features/History';
import Lifestyle from './features/Lifestyle';
import { ScheduleItem, Theme, ThemeId, Language, LifestyleData, TimeZone } from './types';
import { sendNotification } from './services/notificationService';
import { 
  getTheme, saveTheme, 
  getLanguage, saveLanguage,
  getLifestyleData, saveLifestyleData,
  getClockZones, saveClockZones
} from './services/storageService';
import { TRANSLATIONS } from './services/localizationService';
import Button from './components/Button';
import Card from './components/Card';

const THEMES: Record<ThemeId, Theme> = {
  'deep-space': {
    id: 'deep-space',
    name: 'Deep Space',
    colors: {
      bgMain: '#0f172a',
      bgCard: '#1e293b',
      bgInput: '#334155',
      textMain: '#e2e8f0',
      textMuted: '#94a3b8',
      accent: '#6366f1',
      accentHover: '#4f46e5',
      border: '#334155'
    }
  },
  'morandi-clay': {
    id: 'morandi-clay',
    name: 'Morandi Clay',
    colors: {
      bgMain: '#F5F0EB',
      bgCard: '#FFFFFF',
      bgInput: '#E8E2DD',
      textMain: '#5E504C',
      textMuted: '#9D918B',
      accent: '#B09F96', // Dusty Brown
      accentHover: '#8C7B72',
      border: '#E0D6D0'
    }
  },
  'morandi-olive': {
    id: 'morandi-olive',
    name: 'Morandi Olive',
    colors: {
      bgMain: '#F0F2EB',
      bgCard: '#FFFFFF',
      bgInput: '#E2E6DC',
      textMain: '#4A503D',
      textMuted: '#8F9779',
      accent: '#8F9779', // Sage Green
      accentHover: '#6E755C',
      border: '#D1D6C8'
    }
  },
  'morandi-blue': {
    id: 'morandi-blue',
    name: 'Morandi Blue',
    colors: {
      bgMain: '#EBF0F5',
      bgCard: '#FFFFFF',
      bgInput: '#DCE4EB',
      textMain: '#425066',
      textMuted: '#8A99AD',
      accent: '#8DA3C1', // Dusty Blue
      accentHover: '#6B82A3',
      border: '#CED6E0'
    }
  }
};

const LANGUAGES: Language[] = ['English', 'Chinese', 'Spanish', 'Arabic', 'Russian', 'French'];

// Initial preset zones for World Clock
const INITIAL_ZONES: TimeZone[] = [
  { id: 'utc', name: 'UTC', timeZone: 'UTC' },
  { id: 'ny', name: 'New York', timeZone: 'America/New_York' },
  { id: 'lon', name: 'London', timeZone: 'Europe/London' },
  { id: 'tok', name: 'Tokyo', timeZone: 'Asia/Tokyo' },
];

function App() {
  const [activeTab, setActiveTab] = useState<'clock' | 'timer' | 'schedule' | 'lifestyle' | 'history'>('schedule');
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('morandi-clay');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('English');
  const [showSettings, setShowSettings] = useState(false);

  // Global Shared State (Module Coherence)
  const [lifestyleData, setLifestyleData] = useState<LifestyleData>(getLifestyleData());
  const [clockZones, setClockZones] = useState<TimeZone[]>(getClockZones() || INITIAL_ZONES);

  // Load Settings
  useEffect(() => {
    setCurrentThemeId(getTheme());
    setCurrentLanguage(getLanguage());
  }, []);

  // Persist Global State changes
  useEffect(() => {
    saveLifestyleData(lifestyleData);
  }, [lifestyleData]);

  useEffect(() => {
    saveClockZones(clockZones);
  }, [clockZones]);

  // Persist Theme
  const handleThemeChange = (id: ThemeId) => {
    setCurrentThemeId(id);
    saveTheme(id);
  };

  // Persist Language
  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    saveLanguage(lang);
  };

  // System Notification Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      const taskStarting = schedule.find(item => item.time === currentTime && !item.completed);
      
      if (taskStarting) {
        // Use localized prefix
        const prefix = TRANSLATIONS[currentLanguage].scheduledPrefix;
        sendNotification(`${prefix}: ${taskStarting.title}`, taskStarting.description);
        setSchedule(prev => prev.map(i => i.id === taskStarting.id ? { ...i, completed: true } : i));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [schedule, currentLanguage]);

  const handleScheduleUpdate = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule);
  };

  const theme = THEMES[currentThemeId] || THEMES['morandi-clay'];
  const t = TRANSLATIONS[currentLanguage];
  const isRTL = currentLanguage === 'Arabic';

  return (
    <>
      <style>
        {`
          :root {
            --bg-main: ${theme.colors.bgMain};
            --bg-card: ${theme.colors.bgCard};
            --bg-input: ${theme.colors.bgInput};
            --text-main: ${theme.colors.textMain};
            --text-muted: ${theme.colors.textMuted};
            --accent: ${theme.colors.accent};
            --accent-hover: ${theme.colors.accentHover};
            --border: ${theme.colors.border};
          }
          body {
            background-color: var(--bg-main);
            color: var(--text-main);
          }
        `}
      </style>

      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans transition-colors duration-300">
        
        {/* Header / Nav */}
        <header className="fixed top-0 left-0 right-0 bg-[var(--bg-main)]/95 backdrop-blur-md border-b border-[var(--border)] z-50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <span className="text-xl font-bold text-[var(--accent)]">
                  AI Butler
                </span>
              </div>
              
              <nav className="flex items-center space-x-1 sm:space-x-4 rtl:space-x-reverse overflow-x-auto scrollbar-hide">
                {[
                  { id: 'schedule', label: t.navSchedule },
                  { id: 'lifestyle', label: t.navLifestyle },
                  { id: 'clock', label: t.navClock },
                  { id: 'timer', label: t.navTimer },
                  { id: 'history', label: t.navHistory },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm border border-[var(--border)]' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                
                <div className="h-6 w-px bg-[var(--border)] mx-2 shrink-0"></div>
                
                <button 
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] shrink-0"
                  title={t.settingsTitle}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col">
          <div className="flex-1">
            {activeTab === 'clock' && (
              <WorldClock 
                language={currentLanguage} 
                zones={clockZones} 
                onUpdateZones={setClockZones} 
              />
            )}
            {activeTab === 'timer' && (
              <PrecisionTimer language={currentLanguage} />
            )}
            {activeTab === 'schedule' && (
              <SmartScheduler 
                onScheduleUpdate={handleScheduleUpdate} 
                language={currentLanguage}
                lifestyleData={lifestyleData}
                onUpdateLifestyle={setLifestyleData}
                clockZones={clockZones}
              />
            )}
            {activeTab === 'lifestyle' && (
              <Lifestyle 
                language={currentLanguage} 
                data={lifestyleData}
                onUpdateData={setLifestyleData}
              />
            )}
            {activeTab === 'history' && (
              <History language={currentLanguage} />
            )}
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center text-[var(--text-muted)] text-xs">
            <p>System Status: Operational • {schedule.length} {t.scheduledPrefix}</p>
          </footer>
        </main>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
             <div className="max-w-md w-full">
                <Card title={t.settingsTitle} className="w-full">
                  <div className="space-y-6">
                     
                     {/* Language Selector */}
                     <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">{t.languageLabel}</label>
                        <select
                          value={currentLanguage}
                          onChange={(e) => handleLanguageChange(e.target.value as Language)}
                          className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                        >
                           {LANGUAGES.map(lang => (
                             <option key={lang} value={lang}>{lang}</option>
                           ))}
                        </select>
                     </div>

                     <div className="h-px bg-[var(--border)]" />

                     {/* Theme Selector */}
                     <div>
                       <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">{t.themeLabel}</label>
                       <div className="grid grid-cols-2 gap-3">
                          {Object.values(THEMES).map((t) => (
                             <button
                               key={t.id}
                               onClick={() => handleThemeChange(t.id)}
                               className={`
                                 flex items-center p-3 rounded-lg border text-sm font-medium transition-all
                                 ${currentThemeId === t.id 
                                    ? 'border-[var(--accent)] ring-1 ring-[var(--accent)] bg-[var(--bg-input)]' 
                                    : 'border-[var(--border)] hover:bg-[var(--bg-input)]'}
                               `}
                             >
                                <div 
                                  className="w-4 h-4 rounded-full mr-3 border border-gray-300 rtl:mr-0 rtl:ml-3" 
                                  style={{ backgroundColor: t.colors.bgMain }}
                                ></div>
                                <span className="text-[var(--text-main)]">{t.name}</span>
                             </button>
                          ))}
                       </div>
                     </div>
                     <div className="pt-4 flex justify-end">
                       <Button onClick={() => setShowSettings(false)}>{t.done}</Button>
                     </div>
                  </div>
                </Card>
             </div>
          </div>
        )}

      </div>
    </>
  );
}

export default App;

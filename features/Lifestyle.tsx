
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getCoordinates, getWeather } from '../services/weatherService';
import { generateOutfitAdvice, generateDietaryAdvice } from '../services/geminiService';
import { getProfile } from '../services/storageService';
import { WeatherData, StyleOption, UserProfile, Language, LifestyleData } from '../types';
import { TRANSLATIONS } from '../services/localizationService';

const STYLES: StyleOption[] = [
  'Minimalist', 'Classic', 'Business', 'Casual Chic', 
  'Sporty', 'Preppy', 'Vintage', 'Streetwear'
];

interface LifestyleProps {
  language: Language;
  data: LifestyleData;
  onUpdateData: (data: LifestyleData) => void;
}

const Lifestyle: React.FC<LifestyleProps> = ({ language, data, onUpdateData }) => {
  const [activeModule, setActiveModule] = useState<'clothing' | 'diet'>('clothing');
  
  // Loading states (local)
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingOutfit, setLoadingOutfit] = useState(false);
  const [loadingDiet, setLoadingDiet] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
  }, []);

  const handleFetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const coords = await getCoordinates();
      const weatherData = await getWeather(coords.lat, coords.lon);
      onUpdateData({ ...data, weather: weatherData });
    } catch (error) {
      alert("Unable to access satellite location services. Please check permissions.");
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleGenerateOutfit = async () => {
    if (!data.weather || !profile) return;
    setLoadingOutfit(true);
    try {
      const advice = await generateOutfitAdvice(data.weather, data.selectedStyle, profile, language);
      onUpdateData({ ...data, outfitAdvice: advice });
    } catch (e) {
      onUpdateData({ ...data, outfitAdvice: t.serviceUnavailable });
    } finally {
      setLoadingOutfit(false);
    }
  };

  const handleGenerateDiet = async () => {
    if (!profile) return;
    setLoadingDiet(true);
    try {
      const advice = await generateDietaryAdvice(profile, language);
      onUpdateData({ ...data, dietAdvice: advice });
    } catch (e) {
      onUpdateData({ ...data, dietAdvice: t.serviceUnavailable });
    } finally {
      setLoadingDiet(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all Lifestyle data? This will clear acquired weather and generated advice.")) {
      onUpdateData({
        weather: null,
        selectedStyle: 'Classic',
        outfitAdvice: '',
        dietAdvice: ''
      });
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        {TRANSLATIONS[language].noRecords}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-end">
        <Button variant="ghost" onClick={handleReset} className="text-xs">
          {t.resetLifestyle}
        </Button>
      </div>

      <div className="flex space-x-4 mb-8 justify-center rtl:space-x-reverse">
        <button
          onClick={() => setActiveModule('clothing')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${activeModule === 'clothing' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]'}`}
        >
          {t.clothingTab}
        </button>
        <button
          onClick={() => setActiveModule('diet')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${activeModule === 'diet' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]'}`}
        >
          {t.dietTab}
        </button>
      </div>

      {activeModule === 'clothing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title={t.satelliteTitle}>
            <div className="flex flex-col items-center justify-center space-y-6 min-h-[200px]">
              {!data.weather ? (
                <div className="text-center">
                  <div className="text-[var(--text-muted)] mb-4">{t.noData}</div>
                  <Button onClick={handleFetchWeather} isLoading={loadingWeather}>
                    {t.acquireData}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-6xl font-light text-[var(--accent)] mb-2">
                      {data.weather.temperature}°C
                    </div>
                    <div className="text-xl text-[var(--text-main)] font-medium">
                      {data.weather.conditionText}
                    </div>
                    <div className="text-sm text-[var(--text-muted)] mt-1">
                      {data.weather.isDay ? 'Daytime' : 'Nighttime'}
                    </div>
                  </div>
                  <Button variant="ghost" onClick={handleFetchWeather} isLoading={loadingWeather} className="text-xs">
                    {t.refreshData}
                  </Button>
                </>
              )}
            </div>
          </Card>

          <Card title={t.styleConfig}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">{t.styleLabel}</label>
                <select 
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                  value={data.selectedStyle}
                  onChange={(e) => onUpdateData({ ...data, selectedStyle: e.target.value as StyleOption })}
                >
                  {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <Button 
                onClick={handleGenerateOutfit} 
                disabled={!data.weather || loadingOutfit} 
                isLoading={loadingOutfit}
                className="w-full"
              >
                {t.recommendBtn}
              </Button>
              
              {data.outfitAdvice && (
                <div className="mt-4 p-4 bg-[var(--bg-input)] rounded-lg border border-[var(--border)]">
                   <p className="text-[var(--text-main)] text-sm leading-relaxed whitespace-pre-wrap">{data.outfitAdvice}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeModule === 'diet' && (
        <Card title={t.dietTitle} className="max-w-2xl mx-auto">
          <div className="space-y-6 text-center">
             <div className="text-[var(--text-muted)] text-sm mb-4">
                {t.dietAnalysis}: <span className="text-[var(--accent)]">{profile.profession}</span>.
             </div>
             
             {!data.dietAdvice ? (
                <Button onClick={handleGenerateDiet} isLoading={loadingDiet}>
                  {t.generateDiet}
                </Button>
             ) : (
                <div className="text-left animate-fade-in">
                   <div className="p-6 bg-[var(--bg-input)] rounded-lg border border-[var(--border)] shadow-inner">
                      <p className="text-[var(--text-main)] text-base leading-relaxed whitespace-pre-wrap">{data.dietAdvice}</p>
                   </div>
                   <div className="mt-6 flex justify-center">
                      <Button variant="ghost" onClick={handleGenerateDiet} isLoading={loadingDiet}>
                        {t.regenerateDiet}
                      </Button>
                   </div>
                </div>
             )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Lifestyle;


import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Language, TimeZone } from '../types';
import { TRANSLATIONS } from '../services/localizationService';

interface WorldClockProps {
  language: Language;
  zones: TimeZone[];
  onUpdateZones: (zones: TimeZone[]) => void;
}

const INITIAL_ZONES: TimeZone[] = [
  { id: 'utc', name: 'UTC', timeZone: 'UTC' },
  { id: 'ny', name: 'New York', timeZone: 'America/New_York' },
  { id: 'lon', name: 'London', timeZone: 'Europe/London' },
  { id: 'tok', name: 'Tokyo', timeZone: 'Asia/Tokyo' },
];

const WorldClock: React.FC<WorldClockProps> = ({ language, zones, onUpdateZones }) => {
  const [time, setTime] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [newZoneCity, setNewZoneCity] = useState('');
  const [newZoneRegion, setNewZoneRegion] = useState('UTC');
  
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const availableTimeZones = (Intl as any).supportedValuesOf 
    ? (Intl as any).supportedValuesOf('timeZone') 
    : ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Europe/Paris', 'Asia/Dubai', 'Australia/Sydney', 'America/Los_Angeles'];

  const addZone = () => {
    if (newZoneCity && newZoneRegion) {
      onUpdateZones([...zones, { 
        id: Date.now().toString(), 
        name: newZoneCity, 
        timeZone: newZoneRegion 
      }]);
      setNewZoneCity('');
      setIsAdding(false);
    }
  };

  const removeZone = (id: string) => {
    if (window.confirm(t.confirmDeleteClock)) {
      onUpdateZones(zones.filter(z => z.id !== id));
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset clocks to default?")) {
      onUpdateZones(INITIAL_ZONES);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="ghost" onClick={handleReset} className="text-xs">
          {t.resetClocks}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => {
          const timeString = new Intl.DateTimeFormat(language === 'English' ? 'en-US' : 'default', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: zone.timeZone,
          }).format(time);

          const dateString = new Intl.DateTimeFormat(language === 'English' ? 'en-US' : 'default', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            timeZone: zone.timeZone,
          }).format(time);

          return (
            <Card key={zone.id} className="relative group hover:border-[var(--accent)] transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-main)]">{zone.name}</h3>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{zone.timeZone}</span>
                </div>
                
                <button 
                  onClick={() => removeZone(zone.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-[var(--text-muted)] hover:text-red-500 rounded-full hover:bg-[var(--bg-input)]"
                  title={t.delete}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
              
              <div className="text-4xl font-mono text-[var(--accent)] mb-2 tracking-wider">
                {timeString}
              </div>
              
              <div className="text-sm text-[var(--text-muted)] border-t border-[var(--border)] pt-2">
                <span>{dateString}</span>
              </div>
            </Card>
          );
        })}

        {/* Add New Zone Card */}
        <Card className="flex flex-col justify-center items-center min-h-[160px] border-dashed border-2 border-[var(--border)] bg-transparent">
          {!isAdding ? (
            <Button variant="ghost" onClick={() => setIsAdding(true)}>
              + {t.addClock}
            </Button>
          ) : (
            <div className="w-full space-y-3">
              <input
                type="text"
                placeholder={t.cityNamePlaceholder}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                value={newZoneCity}
                onChange={(e) => setNewZoneCity(e.target.value)}
              />
              <select
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                value={newZoneRegion}
                onChange={(e) => setNewZoneRegion(e.target.value)}
              >
                {availableTimeZones.map((tz: string) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
              <div className="flex space-x-2">
                <Button onClick={addZone} className="flex-1 text-xs">{t.save}</Button>
                <Button variant="secondary" onClick={() => setIsAdding(false)} className="flex-1 text-xs">{t.cancel}</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default WorldClock;

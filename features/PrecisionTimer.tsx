
import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Language } from '../types';
import { TRANSLATIONS } from '../services/localizationService';
import { getTimerSettings, saveTimerSettings } from '../services/storageService';

interface PrecisionTimerProps {
  language: Language;
}

const PrecisionTimer: React.FC<PrecisionTimerProps> = ({ language }) => {
  const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch');
  
  const t = TRANSLATIONS[language];

  // Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swRef = useRef<number | null>(null);
  const swStartTime = useRef<number>(0);

  // Timer State
  const [timerDuration, setTimerDuration] = useState(60000); // 1 min default
  const [timerLeft, setTimerLeft] = useState(60000);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const timerEndTime = useRef<number>(0);

  // Load persistence
  useEffect(() => {
    const settings = getTimerSettings();
    setMode(settings.mode);
    setTimerDuration(settings.duration);
    setTimerLeft(settings.duration);
  }, []);

  // Save persistence
  useEffect(() => {
    saveTimerSettings({ mode, duration: timerDuration });
  }, [mode, timerDuration]);

  // Stopwatch Logic
  useEffect(() => {
    if (swRunning) {
      swStartTime.current = performance.now() - swTime;
      swRef.current = requestAnimationFrame(updateStopwatch);
    } else {
      if (swRef.current) cancelAnimationFrame(swRef.current);
    }
    return () => {
      if (swRef.current) cancelAnimationFrame(swRef.current);
    };
  }, [swRunning]);

  const updateStopwatch = () => {
    setSwTime(performance.now() - swStartTime.current);
    swRef.current = requestAnimationFrame(updateStopwatch);
  };

  const resetStopwatch = () => {
    setSwRunning(false);
    setSwTime(0);
  };

  // Timer Logic
  useEffect(() => {
    if (timerRunning) {
      timerEndTime.current = performance.now() + timerLeft;
      timerRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    }
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [timerRunning]);

  const updateTimer = () => {
    const remaining = timerEndTime.current - performance.now();
    if (remaining <= 0) {
      setTimerLeft(0);
      setTimerRunning(false);
      // Play sound or notify
      new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(e => console.log('Audio play failed', e));
    } else {
      setTimerLeft(remaining);
      timerRef.current = requestAnimationFrame(updateTimer);
    }
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerLeft(timerDuration);
  };

  const handleGlobalReset = () => {
    if (window.confirm("Reset timer settings?")) {
      setMode('stopwatch');
      setTimerDuration(60000);
      setTimerLeft(60000);
      resetStopwatch();
      resetTimer();
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 0) ms = 0;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10); // Show 2 digits
    return (
      <div className="flex items-baseline justify-center space-x-2 font-mono" dir="ltr">
        <span className="text-6xl font-bold text-[var(--text-main)]">{minutes.toString().padStart(2, '0')}</span>
        <span className="text-4xl text-[var(--text-muted)]">:</span>
        <span className="text-6xl font-bold text-[var(--text-main)]">{seconds.toString().padStart(2, '0')}</span>
        <span className="text-4xl text-[var(--text-muted)]">.</span>
        <span className="text-4xl text-[var(--accent)]">{milliseconds.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-end">
        <Button variant="ghost" onClick={handleGlobalReset} className="text-xs">
          {t.resetTimer}
        </Button>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setMode('stopwatch')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${mode === 'stopwatch' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'}`}
        >
          {t.stopwatch}
        </button>
        <button
          onClick={() => setMode('timer')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${mode === 'timer' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'}`}
        >
          {t.timer}
        </button>
      </div>

      <Card className="text-center py-12">
        {mode === 'stopwatch' ? (
          <>
            <div className="mb-12">
              {formatTime(swTime)}
            </div>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => setSwRunning(!swRunning)} 
                variant={swRunning ? 'secondary' : 'primary'}
                className="w-32"
              >
                {swRunning ? t.pause : t.start}
              </Button>
              <Button onClick={resetStopwatch} variant="ghost" disabled={swRunning && swTime === 0}>
                {t.reset}
              </Button>
            </div>
          </>
        ) : (
          <>
             <div className="mb-8">
              {formatTime(timerLeft)}
            </div>
            
            {!timerRunning && (
                <div className="mb-8 flex justify-center items-center space-x-4">
                   <input 
                      type="number" 
                      className="bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-main)] px-3 py-2 rounded w-24 text-center"
                      value={Math.floor(timerDuration / 60000)}
                      onChange={(e) => {
                          const mins = parseInt(e.target.value) || 0;
                          const newDur = mins * 60000;
                          setTimerDuration(newDur);
                          setTimerLeft(newDur);
                      }}
                   />
                   <span className="text-[var(--text-muted)]">min</span>
                </div>
            )}

            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => setTimerRunning(!timerRunning)} 
                variant={timerRunning ? 'secondary' : 'primary'}
                className="w-32"
              >
                {timerRunning ? t.pause : t.start}
              </Button>
              <Button onClick={resetTimer} variant="ghost">
                {t.reset}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PrecisionTimer;

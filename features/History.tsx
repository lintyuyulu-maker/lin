
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { getHistory } from '../services/storageService';
import { HistoryEntry, Language } from '../types';
import { TRANSLATIONS } from '../services/localizationService';

interface HistoryProps {
  language: Language;
}

const History: React.FC<HistoryProps> = ({ language }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const t = TRANSLATIONS[language];

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const filteredHistory = history.filter(entry => {
    const term = searchTerm.toLowerCase();
    // Search in rationale or any schedule item
    const inRationale = entry.rationale.toLowerCase().includes(term);
    const inTasks = entry.schedule.some(item => 
      item.title.toLowerCase().includes(term) || 
      item.description.toLowerCase().includes(term)
    );
    return inRationale || inTasks || entry.dateStr.includes(term);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <p>{t.noRecords}</p>
        </div>
      ) : (
        <div className="space-y-8">
           {filteredHistory.map(entry => (
             <Card key={entry.id} title={`${t.recordPrefix}: ${entry.dateStr} (${new Date(entry.timestamp).toLocaleTimeString()})`}>
                <div className="mb-4 text-sm text-[var(--text-muted)] italic border-l-2 border-[var(--border)] pl-4 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-4">
                   "{entry.rationale}"
                </div>
                <div className="space-y-2">
                   {entry.schedule.map(item => (
                     <div key={item.id} className="flex items-start text-sm">
                        <span className="font-mono text-[var(--accent)] w-16 shrink-0">{item.time}</span>
                        <div>
                           <span className="text-[var(--text-main)] font-medium">{item.title}</span>
                           <span className="text-[var(--text-muted)] mx-2">-</span>
                           <span className="text-[var(--text-muted)]">{item.description}</span>
                        </div>
                     </div>
                   ))}
                </div>
             </Card>
           ))}
        </div>
      )}
    </div>
  );
};

export default History;


import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { UserProfile, MBTI, ScheduleResponse, ScheduleItem, ChatMessage, Language, LifestyleData, TimeZone } from '../types';
import { createSchedulerChat, sendSchedulerMessage, mapMessagesToHistory } from '../services/geminiService';
import { requestNotificationPermission } from '../services/notificationService';
import { 
  getProfile, saveProfile, saveHistoryEntry, 
  getCurrentSchedule, saveCurrentSchedule, 
  getChatHistory, saveChatHistory, clearSessionData 
} from '../services/storageService';
import { Chat } from "@google/genai";
import { TRANSLATIONS } from '../services/localizationService';

interface SmartSchedulerProps {
  onScheduleUpdate: (schedule: ScheduleItem[]) => void;
  language: Language;
  lifestyleData: LifestyleData;
  onUpdateLifestyle: (data: LifestyleData) => void;
  clockZones: TimeZone[];
}

const GREETINGS: Record<Language, string> = {
  English: "Greetings. I am ready to organize your day. What tasks or events should I schedule for you?",
  Spanish: "Saludos. Estoy listo para organizar su día. ¿Qué tareas o eventos debo programar?",
  French: "Salutations. Je suis prêt à organiser votre journée. Quelles tâches ou événements dois-je programmer ?",
  Russian: "Приветствую. Я готов организовать ваш день. Какие задачи или события мне следует запланировать?",
  Chinese: "您好。我已准备好为您安排日程。需要为您规划哪些任务或活动？",
  Arabic: "تحياتي. أنا مستعد لتنظيم يومك. ما هي المهام أو الأحداث التي يجب أن أجدولها لك؟"
};

const SmartScheduler: React.FC<SmartSchedulerProps> = ({ 
  onScheduleUpdate, 
  language,
  lifestyleData,
  onUpdateLifestyle,
  clockZones
}) => {
  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    profession: '',
    mbti: MBTI.INTJ,
  });
  const [isProfileSet, setIsProfileSet] = useState(false);
  
  // Chat & Schedule State - Initialize from storage to ensure persistence
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatHistory());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => getCurrentSchedule());
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latestRationale, setLatestRationale] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  // Initialization
  useEffect(() => {
    requestNotificationPermission();
    const savedProfile = getProfile();
    if (savedProfile) {
      setProfile(savedProfile);
      setIsProfileSet(true);
    }
  }, []);

  // Sync Schedule and Messages to Storage whenever they change
  useEffect(() => {
    saveCurrentSchedule(schedule);
    onScheduleUpdate(schedule);
  }, [schedule, onScheduleUpdate]);

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Init Chat when profile is set
  useEffect(() => {
    if (isProfileSet && !chatInstance) {
      // Reconstruct history for Gemini SDK
      const historyContent = mapMessagesToHistory(messages);
      const chat = createSchedulerChat(profile, language, historyContent);
      setChatInstance(chat);

      // Only add initial greeting if history is empty
      if (messages.length === 0) {
        const greetingText = GREETINGS[language] || GREETINGS['English'];
        setMessages([{
          id: 'init',
          sender: 'ai',
          text: greetingText.replace('.', `, ${profile.name}.`),
          timestamp: Date.now()
        }]);
      }
    }
  }, [isProfileSet, profile, chatInstance, messages, language]); 

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name && profile.profession) {
      saveProfile(profile);
      setIsProfileSet(true);
    }
  };

  const handleEditProfile = () => {
    setIsProfileSet(false);
    setChatInstance(null);
  };

  const handleResetSession = () => {
    if (window.confirm(t.resetConfirm)) {
      clearSessionData();
      setSchedule([]);
      setMessages([]);
      setLatestRationale('');
      setChatInstance(null);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatInstance) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the current language and context to the message handler
      const response: ScheduleResponse = await sendSchedulerMessage(
        chatInstance, 
        userMsg.text, 
        schedule, 
        lifestyleData,
        clockZones,
        language
      );
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
      setSchedule(response.schedule);
      setLatestRationale(response.rationale);
      
      // Handle Lifestyle Updates driven by the Chat AI
      if (response.lifestyleUpdate) {
        const newData = { ...lifestyleData };
        if (response.lifestyleUpdate.outfitAdvice) {
          newData.outfitAdvice = response.lifestyleUpdate.outfitAdvice;
        }
        if (response.lifestyleUpdate.dietAdvice) {
          newData.dietAdvice = response.lifestyleUpdate.dietAdvice;
        }
        onUpdateLifestyle(newData);
      }
      
      // Save to history on every significant update
      if (response.schedule.length > 0) {
        saveHistoryEntry({
          id: Date.now().toString(),
          timestamp: Date.now(),
          dateStr: new Date().toLocaleDateString(),
          schedule: response.schedule,
          rationale: response.rationale
        });
      }

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        text: t.serviceUnavailable,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileForm = () => (
    <Card title={t.profileTitle} className="max-w-xl mx-auto mt-10">
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.nameLabel}</label>
          <input
            required
            type="text"
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder={t.namePlaceholder}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.professionLabel}</label>
          <input
            required
            type="text"
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
            value={profile.profession}
            onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
            placeholder={t.professionPlaceholder}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.mbtiLabel}</label>
          <select
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
            value={profile.mbti}
            onChange={(e) => setProfile({ ...profile, mbti: e.target.value })}
          >
            {Object.values(MBTI).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="pt-2 flex justify-between gap-4">
          <Button type="submit" className="w-full">{t.initProtocol}</Button>
        </div>
      </form>
    </Card>
  );

  const renderScheduler = () => (
    <div className="h-[calc(100vh-12rem)] grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: Chat Interface (5 cols) */}
      <div className="lg:col-span-5 flex flex-col h-full">
         <div className="flex justify-between items-center mb-2 px-1">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">{t.butlerConsole}</div>
            <button onClick={handleEditProfile} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] underline">
               {profile.name} ({profile.mbti})
            </button>
         </div>
         
         <Card className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
               {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`
                        max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                        ${msg.sender === 'user' 
                          ? 'bg-[var(--accent)] text-white rounded-br-none rtl:rounded-bl-none rtl:rounded-br-2xl' 
                          : 'bg-[var(--bg-input)] text-[var(--text-main)] rounded-bl-none rtl:rounded-br-none rtl:rounded-bl-2xl border border-[var(--border)]'}
                      `}
                    >
                      {msg.text}
                    </div>
                 </div>
               ))}
               {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-[var(--bg-input)] rounded-2xl rounded-bl-none rtl:rounded-br-none rtl:rounded-bl-2xl px-4 py-3 border border-[var(--border)]">
                       <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                       </div>
                    </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-card)]">
               <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.inputPlaceholder}
                    className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-full px-4 py-2 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none placeholder-[var(--text-muted)]"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rtl:rotate-180">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  </Button>
               </form>
            </div>
         </Card>
      </div>

      {/* Right Column: Live Schedule (7 cols) */}
      <div className="lg:col-span-7 flex flex-col h-full min-h-[400px]">
         <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex items-center space-x-2">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">{t.liveItinerary}</div>
              {latestRationale && (
                <span className="hidden sm:inline text-[10px] text-[var(--text-muted)] italic truncate max-w-[200px] border-l border-[var(--border)] pl-2 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-2">
                   "{latestRationale}"
                </span>
              )}
            </div>
            
            <button 
              onClick={handleResetSession}
              className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-400/10 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              {t.resetProtocol}
            </button>
         </div>

         <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-3">
            {schedule.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--text-muted)] p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-4 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                  </svg>
                  <p>{t.noTasks}</p>
                  <p className="text-sm">{t.typePrompt}</p>
               </div>
            ) : (
               schedule.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="group bg-[var(--bg-card)] rounded-xl p-4 shadow-sm border border-[var(--border)] hover:border-[var(--accent)] transition-all animate-fade-in flex items-start"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                     <div className="flex flex-col items-center mr-4 rtl:mr-0 rtl:ml-4 min-w-[60px]">
                        <span className="text-lg font-bold text-[var(--accent)] font-mono">{item.time}</span>
                        <div className="h-full w-px bg-[var(--border)] mt-2 group-last:hidden"></div>
                     </div>
                     <div className="flex-1 pb-1">
                        <div className="flex justify-between items-start">
                           <h4 className="text-[var(--text-main)] font-semibold text-lg leading-tight">{item.title}</h4>
                           {item.completed && (
                              <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-full border border-green-500/20">
                                 {t.done}
                              </span>
                           )}
                        </div>
                        <p className="text-[var(--text-muted)] text-sm mt-1 leading-relaxed">{item.description}</p>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );

  return isProfileSet ? renderScheduler() : renderProfileForm();
};

export default SmartScheduler;

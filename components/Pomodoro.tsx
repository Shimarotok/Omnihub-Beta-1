
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Bell } from 'lucide-react';
import { useStore } from './StoreContext';
import { POMODORO_PRESETS } from '../constants';

const Pomodoro: React.FC = () => {
  const { state, updateSettings } = useStore();
  const [timeLeft, setTimeLeft] = useState(state.settings.pomodoroWork * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Replaced NodeJS.Timeout with any to resolve namespace errors in browser environments
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    if (state.settings.notificationsEnabled) {
      new Notification(isBreak ? "Break Over!" : "Work Session Complete!", {
        body: isBreak ? "Back to focus?" : "Time for a short break."
      });
    }
    const nextMode = !isBreak;
    setIsBreak(nextMode);
    setTimeLeft((nextMode ? state.settings.pomodoroBreak : state.settings.pomodoroWork) * 60);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(state.settings.pomodoroWork * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? (timeLeft / (state.settings.pomodoroBreak * 60)) * 100
    : (timeLeft / (state.settings.pomodoroWork * 60)) * 100;

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center max-w-sm mx-auto">
      <div className="w-full flex justify-between mb-8">
        <span className={`px-4 py-1 rounded-full text-sm font-bold tracking-tight ${isBreak ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
          {isBreak ? 'REST' : 'FOCUS'}
        </span>
        <button onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-64 h-64 mb-8">
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            cx="128" cy="128" r="120" 
            stroke="currentColor" strokeWidth="8" fill="transparent"
            className="text-gray-100"
          />
          <circle 
            cx="128" cy="128" r="120" 
            stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray={754}
            strokeDashoffset={754 * (1 - progress / 100)}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${isBreak ? 'text-green-500' : 'text-orange-500'}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-6xl font-black tracking-tighter tabular-nums text-gray-900">{formatTime(timeLeft)}</span>
          <span className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{isBreak ? 'Break' : 'Session'}</span>
        </div>
      </div>

      <div className="flex gap-6 mb-8">
        <button 
          onClick={resetTimer}
          className="p-4 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-90"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button 
          onClick={toggleTimer}
          className={`p-6 rounded-full shadow-lg shadow-orange-200 text-white transition-all active:scale-95 ${isActive ? 'bg-gray-800' : 'bg-orange-600 hover:bg-orange-700'}`}
        >
          {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>
        <button 
          className="p-4 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-all"
          onClick={() => {
            if (Notification.permission !== "granted") {
              Notification.requestPermission();
            }
          }}
        >
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {showSettings && (
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="h-px bg-gray-100" />
          <h4 className="font-bold text-sm text-gray-900">Presets</h4>
          <div className="flex gap-2 flex-wrap">
            {POMODORO_PRESETS.map(preset => (
              <button 
                key={preset.label}
                onClick={() => {
                  updateSettings({ pomodoroWork: preset.work, pomodoroBreak: preset.break });
                  setTimeLeft(preset.work * 60);
                  setIsActive(false);
                  setIsBreak(false);
                }}
                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Work (Min)</label>
              <input 
                type="number" 
                value={state.settings.pomodoroWork} 
                onChange={(e) => updateSettings({ pomodoroWork: Number(e.target.value) })}
                className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Break (Min)</label>
              <input 
                type="number" 
                value={state.settings.pomodoroBreak} 
                onChange={(e) => updateSettings({ pomodoroBreak: Number(e.target.value) })}
                className="w-full bg-gray-50 px-3 py-2 rounded-xl text-sm outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;

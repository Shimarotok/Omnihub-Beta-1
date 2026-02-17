
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

  const totalTime = (isBreak ? state.settings.pomodoroBreak : state.settings.pomodoroWork) * 60;
  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="bg-white dark:bg-gray-900 p-8 pt-10 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center w-full max-w-[400px] mx-auto animate-in fade-in zoom-in duration-500">
      <div className="w-full flex justify-between items-center mb-12">
        <span className={`px-6 py-2 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase shadow-sm ${isBreak ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400'}`}>
          {isBreak ? 'Short Break' : 'Deep Focus'}
        </span>
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className={`p-3 rounded-2xl transition-all ${showSettings ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Main Timer Display */}
      <div className="relative w-full aspect-square max-w-[300px] mb-12">
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            cx="50%" cy="50%" r="46%" 
            stroke="currentColor" strokeWidth="10" fill="transparent"
            className="text-gray-50 dark:text-gray-800/30"
          />
          <circle 
            cx="50%" cy="50%" r="46%" 
            stroke="currentColor" strokeWidth="14" fill="transparent"
            strokeDasharray="289%" // Approximated based on viewBox
            style={{ 
              strokeDasharray: '289.02% 289.02%',
              strokeDashoffset: `${289.02 * (1 - progress / 100)}%`
            }}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${isBreak ? 'text-emerald-500' : 'text-orange-500'}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-7xl font-black tracking-tighter tabular-nums text-gray-900 dark:text-white leading-none drop-shadow-sm">{formatTime(timeLeft)}</span>
          <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 mt-6 uppercase tracking-[0.4em]">{isActive ? (isBreak ? 'Cooling Down' : 'Sprinting') : 'Ready to Start'}</span>
        </div>
      </div>

      <div className="flex gap-6 mb-4 items-center">
        <button 
          onClick={resetTimer}
          className="p-6 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-[2.5rem] hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-90"
        >
          <RotateCcw className="w-7 h-7" />
        </button>
        <button 
          onClick={toggleTimer}
          className={`w-28 h-28 rounded-[3.5rem] shadow-2xl flex items-center justify-center transition-all active:scale-90 ${
            isActive 
              ? 'bg-gray-900 dark:bg-gray-800 text-white shadow-black/20' 
              : `text-white ${isBreak ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/40' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/40'}`
          }`}
        >
          {isActive ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current ml-1" />}
        </button>
        <button 
          className={`p-6 rounded-[2.5rem] transition-all ${state.settings.notificationsEnabled ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}
          onClick={() => {
            if (Notification.permission !== "granted") {
              Notification.requestPermission();
            }
            updateSettings({ notificationsEnabled: !state.settings.notificationsEnabled });
          }}
        >
          <Bell className="w-7 h-7" />
        </button>
      </div>

      {showSettings && (
        <div className="w-full mt-10 pt-10 border-t border-gray-100 dark:border-gray-800 space-y-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Timer Presets</h4>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
              {POMODORO_PRESETS.map(preset => (
                <button 
                  key={preset.label}
                  onClick={() => {
                    updateSettings({ pomodoroWork: preset.work, pomodoroBreak: preset.break });
                    setTimeLeft(preset.work * 60);
                    setIsActive(false);
                    setIsBreak(false);
                  }}
                  className={`px-6 py-4 rounded-[1.5rem] text-xs font-black whitespace-nowrap transition-all ${
                    state.settings.pomodoroWork === preset.work 
                      ? 'bg-orange-600 text-white shadow-xl shadow-orange-500/30' 
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Work (min)</label>
              <input 
                type="number" 
                value={state.settings.pomodoroWork} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateSettings({ pomodoroWork: val });
                  if (!isActive && !isBreak) setTimeLeft(val * 60);
                }}
                className="w-full bg-gray-50 dark:bg-gray-800 px-6 py-5 rounded-[1.5rem] text-lg font-black outline-none border border-transparent focus:border-orange-200 dark:focus:border-orange-900 transition-all dark:text-white"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Break (min)</label>
              <input 
                type="number" 
                value={state.settings.pomodoroBreak} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateSettings({ pomodoroBreak: val });
                  if (!isActive && isBreak) setTimeLeft(val * 60);
                }}
                className="w-full bg-gray-50 dark:bg-gray-800 px-6 py-5 rounded-[1.5rem] text-lg font-black outline-none border border-transparent focus:border-emerald-200 dark:focus:border-emerald-900 transition-all dark:text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;

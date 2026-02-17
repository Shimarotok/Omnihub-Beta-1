
import React from 'react';
import { useStore } from './StoreContext';
import { THEMES, FONTS, CURRENCIES } from '../constants';
import { Check, Moon, Sun, Bell, BellOff } from 'lucide-react';

const Settings: React.FC = () => {
  const { state, updateSettings } = useStore();
  const { theme, mode, font, currency, notificationsEnabled } = state.settings;

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-2xl font-bold mb-1 dark:text-white">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Personalize your workspace.</p>
      </header>

      {/* Theme Selection */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Appearance</h3>
        
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            <button 
              onClick={() => updateSettings({ mode: 'light' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'light' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
            <button 
              onClick={() => updateSettings({ mode: 'dark' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'dark' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map(t => (
              <button
                key={t}
                onClick={() => updateSettings({ theme: t })}
                className={`relative h-20 rounded-2xl overflow-hidden border-2 transition-all ${theme === t ? 'border-blue-500 scale-105 z-10' : 'border-transparent'}`}
              >
                <div className={`absolute inset-0 ${mode === 'light' ? THEMES[t].light : THEMES[t].dark}`} />
                <div className={`absolute bottom-0 left-0 right-0 h-1/3 ${THEMES[t].accent}`} />
                {theme === t && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10">
                    <div className="bg-blue-500 text-white p-1 rounded-full"><Check className="w-3 h-3" /></div>
                  </div>
                )}
                <span className={`absolute top-2 left-2 text-xs font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Typography and Regional */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Global Prefs</h3>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Font Style</span>
            <select 
              value={font}
              onChange={(e) => updateSettings({ font: e.target.value })}
              className="bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg text-sm font-medium border-none outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
            </select>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Currency</span>
            <select 
              value={currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg text-sm font-medium border-none outline-none dark:text-white"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Notifications</span>
            <button 
              onClick={() => {
                if (!notificationsEnabled) Notification.requestPermission();
                updateSettings({ notificationsEnabled: !notificationsEnabled });
              }}
              className={`p-2 rounded-xl transition-all ${notificationsEnabled ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'}`}
            >
              {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;

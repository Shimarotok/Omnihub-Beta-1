
import React from 'react';
import { useStore } from './StoreContext';
import { THEMES, FONTS, CURRENCIES } from '../constants';
import { Check, Moon, Sun, Monitor, Bell, BellOff } from 'lucide-react';

const Settings: React.FC = () => {
  const { state, updateSettings } = useStore();
  const { theme, mode, font, currency, notificationsEnabled } = state.settings;

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-2xl font-bold mb-1">Settings</h2>
        <p className="text-gray-500">Personalize your workspace.</p>
      </header>

      {/* Theme Selection */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Appearance</h3>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button 
              onClick={() => updateSettings({ mode: 'light' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'light' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
            <button 
              onClick={() => updateSettings({ mode: 'dark' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'dark' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
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
                <span className="absolute top-2 left-2 text-xs font-bold">{t}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Typography and Regional */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Global Prefs</h3>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <span className="font-semibold text-gray-700">Font Style</span>
            <select 
              value={font}
              onChange={(e) => updateSettings({ font: e.target.value })}
              className="bg-gray-50 px-3 py-1 rounded-lg text-sm font-medium border-none outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
            </select>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="font-semibold text-gray-700">Currency</span>
            <select 
              value={currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="bg-gray-50 px-3 py-1 rounded-lg text-sm font-medium border-none outline-none"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="font-semibold text-gray-700">Notifications</span>
            <button 
              onClick={() => {
                if (!notificationsEnabled) Notification.requestPermission();
                updateSettings({ notificationsEnabled: !notificationsEnabled });
              }}
              className={`p-2 rounded-xl transition-all ${notificationsEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
            >
              {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </section>

      {/* Budget Goals */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Budgeting Goals</h3>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Daily Limit</label>
            <input 
              type="number" 
              value={state.settings.budgets.daily}
              onChange={(e) => updateSettings({ budgets: { ...state.settings.budgets, daily: Number(e.target.value) } })}
              className="w-full bg-gray-50 px-4 py-3 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Weekly Limit</label>
            <input 
              type="number" 
              value={state.settings.budgets.weekly}
              onChange={(e) => updateSettings({ budgets: { ...state.settings.budgets, weekly: Number(e.target.value) } })}
              className="w-full bg-gray-50 px-4 py-3 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;

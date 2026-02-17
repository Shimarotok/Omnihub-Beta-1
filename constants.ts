
import { AppSettings, ThemeName } from './types';

export const THEMES: Record<ThemeName, { light: string; dark: string; accent: string }> = {
  Classic: {
    light: 'bg-slate-50 text-slate-900',
    dark: 'bg-slate-950 text-slate-50',
    accent: 'bg-blue-600',
  },
  Ocean: {
    light: 'bg-sky-50 text-sky-950',
    dark: 'bg-indigo-950 text-sky-50',
    accent: 'bg-sky-500',
  },
  Forest: {
    light: 'bg-emerald-50 text-emerald-950',
    dark: 'bg-zinc-950 text-emerald-50',
    accent: 'bg-emerald-600',
  },
  Sunset: {
    light: 'bg-orange-50 text-orange-950',
    dark: 'bg-stone-950 text-orange-50',
    accent: 'bg-rose-500',
  },
};

export const FONTS = [
  { name: 'Inter', value: 'font-sans' },
  { name: 'Open Sans', value: 'font-["Open_Sans"]' },
  { name: 'Roboto Mono', value: 'font-mono' },
  { name: 'Playfair', value: 'font-serif' },
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'BRL', 'KRW'];

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'Classic',
  mode: 'light',
  font: 'font-sans',
  currency: 'USD',
  pomodoroWork: 25,
  pomodoroBreak: 5,
  notificationsEnabled: false,
  dashboardOrder: ['finances', 'tasks', 'events', 'notes'],
  budgets: {
    daily: 50,
    weekly: 300,
    monthly: 1200,
  },
};

export const POMODORO_PRESETS = [
  { label: 'Pomodoro', work: 25, break: 5 },
  { label: 'Long Focus', work: 50, break: 10 },
  { label: 'Short Bursts', work: 15, break: 3 },
];

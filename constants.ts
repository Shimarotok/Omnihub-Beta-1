
export type NoteType = 'text' | 'checklist' | 'drawing';
export type Priority = 'low' | 'medium' | 'high';
export type ThemeName = 'Classic' | 'Ocean' | 'Forest' | 'Sunset';
export type Mode = 'light' | 'dark';

export interface Note { id: string; type: NoteType; title: string; content: string; createdAt: number; }
export interface Task { id: string; title: string; description?: string; dueDate: string; completed: boolean; priority: Priority; subTasks: { id: string; title: string; completed: boolean }[]; category: string; }
export interface CalendarEvent { id: string; title: string; start: string; end: string; description?: string; location?: string; }
export interface FinanceEntry { id: string; amount: number; type: 'spending' | 'earning'; category: string; date: string; note?: string; }

export interface AppSettings {
  theme: ThemeName; mode: Mode; font: string; currency: string; pomodoroWork: number; pomodoroBreak: number;
  notificationsEnabled: boolean; dashboardOrder: string[]; budgets: { daily: number; weekly: number; monthly: number; };
}

export interface AppState { notes: Note[]; tasks: Task[]; events: CalendarEvent[]; finances: FinanceEntry[]; settings: AppSettings; }

export const THEMES: Record<ThemeName, { light: string; dark: string; accent: string }> = {
  Classic: { light: 'bg-slate-50 text-slate-900', dark: 'bg-slate-950 text-slate-50', accent: 'bg-blue-600' },
  Ocean: { light: 'bg-sky-50 text-sky-950', dark: 'bg-indigo-950 text-sky-50', accent: 'bg-sky-500' },
  Forest: { light: 'bg-emerald-50 text-emerald-950', dark: 'bg-zinc-950 text-emerald-50', accent: 'bg-emerald-600' },
  Sunset: { light: 'bg-orange-50 text-orange-950', dark: 'bg-stone-950 text-orange-50', accent: 'bg-rose-500' },
};

export const FONTS = [
  { name: 'Inter', value: 'font-sans' },
  { name: 'Open Sans', value: 'font-["Open_Sans"]' },
  { name: 'Roboto Mono', value: 'font-mono' },
  { name: 'Playfair', value: 'font-serif' },
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'BRL', 'KRW'];

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'Classic', mode: 'light', font: 'font-sans', currency: 'USD', pomodoroWork: 25, pomodoroBreak: 5,
  notificationsEnabled: false, dashboardOrder: ['finances', 'tasks', 'events', 'notes'],
  budgets: { daily: 50, weekly: 300, monthly: 1200 },
};

export const POMODORO_PRESETS = [
  { label: 'Pomodoro', work: 25, break: 5 },
  { label: 'Long Focus', work: 50, break: 10 },
  { label: 'Short Bursts', work: 15, break: 3 },
];

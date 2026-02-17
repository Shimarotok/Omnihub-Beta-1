
export type NoteType = 'text' | 'checklist' | 'drawing';
export type Priority = 'low' | 'medium' | 'high';

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  content: string; // For text and checklist (JSON string), or dataURL for drawing
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority: Priority;
  subTasks: { id: string; title: string; completed: boolean }[];
  category: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}

export interface FinanceEntry {
  id: string;
  amount: number;
  type: 'spending' | 'earning';
  category: string;
  date: string;
  note?: string;
}

export type ThemeName = 'Classic' | 'Ocean' | 'Forest' | 'Sunset';
export type Mode = 'light' | 'dark';

export interface AppSettings {
  theme: ThemeName;
  mode: Mode;
  font: string;
  currency: string;
  pomodoroWork: number;
  pomodoroBreak: number;
  notificationsEnabled: boolean;
  budgets: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface AppState {
  notes: Note[];
  tasks: Task[];
  events: CalendarEvent[];
  finances: FinanceEntry[];
  settings: AppSettings;
}

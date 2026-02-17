
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Note, Task, CalendarEvent, FinanceEntry, AppSettings } from '../constants';
import { INITIAL_SETTINGS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface StoreContextType {
  state: AppState;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  deleteNote: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteTask: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  addFinance: (entry: Omit<FinanceEntry, 'id'>) => void;
  deleteFinance: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  aiBreakdown: (title: string) => Promise<string[]>;
  aiSmartInput: (text: string) => Promise<any>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('omnihub_state');
    return saved ? JSON.parse(saved) : { notes: [], tasks: [], events: [], finances: [], settings: INITIAL_SETTINGS };
  });

  useEffect(() => { localStorage.setItem('omnihub_state', JSON.stringify(state)); }, [state]);

  const addNote = (note: any) => setState(p => ({ ...p, notes: [{ ...note, id: crypto.randomUUID(), createdAt: Date.now() }, ...p.notes] }));
  const deleteNote = (id: string) => setState(p => ({ ...p, notes: p.notes.filter(n => n.id !== id) }));
  const addTask = (task: any) => setState(p => ({ ...p, tasks: [{ ...task, id: crypto.randomUUID(), completed: false }, ...p.tasks] }));
  const toggleTask = (id: string) => setState(p => ({
    ...p, tasks: p.tasks.map(t => t.id === id ? { ...t, completed: !t.completed, subTasks: (t.subTasks || []).map(s => ({ ...s, completed: !t.completed })) } : t)
  }));
  const toggleSubtask = (tId: string, sId: string) => setState(p => ({
    ...p, tasks: p.tasks.map(t => {
      if (t.id !== tId) return t;
      const subs = t.subTasks.map(s => s.id === sId ? { ...s, completed: !s.completed } : s);
      return { ...t, subTasks: subs, completed: subs.every(s => s.completed) };
    })
  }));
  const deleteTask = (id: string) => setState(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== id) }));
  const addEvent = (ev: any) => setState(p => ({ ...p, events: [{ ...ev, id: crypto.randomUUID() }, ...p.events] }));
  const deleteEvent = (id: string) => setState(p => ({ ...p, events: p.events.filter(e => e.id !== id) }));
  const addFinance = (f: any) => setState(p => ({ ...p, finances: [{ ...f, id: crypto.randomUUID() }, ...p.finances] }));
  const deleteFinance = (id: string) => setState(p => ({ ...p, finances: p.finances.filter(f => f.id !== id) }));
  const updateSettings = (upd: any) => setState(p => ({ ...p, settings: { ...p.settings, ...upd } }));

  const aiBreakdown = async (taskTitle: string) => {
    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Break down: "${taskTitle}" into 3-5 subtasks.`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { subtasks: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["subtasks"] } }
      });
      return JSON.parse(resp.text).subtasks || [];
    } catch { return []; }
  };

  const aiSmartInput = async (input: string) => {
    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze: "${input}". Today is ${new Date().toISOString()}. Output JSON with type (task/event/note/finance).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['task', 'event', 'note', 'finance'] },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              date: { type: Type.STRING },
              startTime: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              financeType: { type: Type.STRING, enum: ['spending', 'earning'] },
              priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
              subtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["type", "title"]
          }
        }
      });
      return JSON.parse(resp.text);
    } catch { return null; }
  };

  return <StoreContext.Provider value={{ state, addNote, deleteNote, addTask, toggleTask, toggleSubtask, deleteTask, addEvent, deleteEvent, addFinance, deleteFinance, updateSettings, aiBreakdown, aiSmartInput }}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const c = useContext(StoreContext);
  if (!c) throw new Error('useStore error');
  return c;
};

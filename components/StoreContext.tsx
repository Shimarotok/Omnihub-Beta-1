
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Note, Task, CalendarEvent, FinanceEntry, AppSettings } from '../types';
import { INITIAL_SETTINGS } from '../constants';

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
  syncGoogleCalendar: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('omnihub_state');
    if (saved) return JSON.parse(saved);
    return {
      notes: [],
      tasks: [],
      events: [],
      finances: [],
      settings: INITIAL_SETTINGS,
    };
  });

  useEffect(() => {
    localStorage.setItem('omnihub_state', JSON.stringify(state));
  }, [state]);

  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = { ...note, id: crypto.randomUUID(), createdAt: Date.now() };
    setState(prev => ({ ...prev, notes: [newNote, ...prev.notes] }));
  };

  const deleteNote = (id: string) => {
    setState(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));
  };

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = { ...task, id: crypto.randomUUID(), completed: false };
    setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
  };

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === id) {
          const newCompleted = !t.completed;
          // If manually completing main task, complete all subtasks
          return {
            ...t,
            completed: newCompleted,
            subTasks: t.subTasks.map(st => ({ ...st, completed: newCompleted }))
          };
        }
        return t;
      })
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === taskId) {
          const updatedSubTasks = t.subTasks.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          // If all subtasks are now completed, the main task should be completed too
          const allCompleted = updatedSubTasks.length > 0 && updatedSubTasks.every(st => st.completed);
          return { ...t, subTasks: updatedSubTasks, completed: allCompleted };
        }
        return t;
      })
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, events: [newEvent, ...prev.events] }));
  };

  const deleteEvent = (id: string) => {
    setState(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
  };

  const addFinance = (entry: Omit<FinanceEntry, 'id'>) => {
    const newEntry: FinanceEntry = { ...entry, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, finances: [newEntry, ...prev.finances] }));
  };

  const deleteFinance = (id: string) => {
    setState(prev => ({ ...prev, finances: prev.finances.filter(f => f.id !== id) }));
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  };

  const syncGoogleCalendar = () => {
    alert("Syncing with Google Calendar... (Simulation)");
  };

  return (
    <StoreContext.Provider value={{
      state, addNote, deleteNote, addTask, toggleTask, toggleSubtask, deleteTask, addEvent, deleteEvent, addFinance, deleteFinance, updateSettings, syncGoogleCalendar
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};


import React, { useState } from 'react';
import { useStore } from './StoreContext';
import { Clock, CheckSquare, Calendar, Trash2, MapPin, ChevronDown, ChevronUp, FileText, ArrowUpDown, List as ListIcon, Image as ImageIcon } from 'lucide-react';
import { Note } from '../constants';

type SortOption = 'date-desc' | 'date-asc' | 'title-asc';

export const UnifiedListView: React.FC<{ type: 'tasks' | 'events' | 'notes' }> = ({ type }) => {
  const { state, toggleTask, toggleSubtask, deleteTask, deleteEvent, deleteNote } = useStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  const items: any[] = type === 'tasks' ? state.tasks : type === 'events' ? state.events : state.notes;

  const sorted = [...items].sort((a: any, b: any) => {
    if (sortBy === 'date-desc') return new Date(b.createdAt || b.dueDate || b.start).getTime() - new Date(a.createdAt || a.dueDate || a.start).getTime();
    if (sortBy === 'date-asc') return new Date(a.createdAt || a.dueDate || a.start).getTime() - new Date(b.createdAt || b.dueDate || b.start).getTime();
    return (a.title || '').localeCompare(b.title || '');
  });

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  const getNoteIcon = (note: Note) => {
    if (note.type === 'checklist') return <ListIcon className="w-5 h-5 text-amber-500" />;
    if (note.type === 'drawing') return <ImageIcon className="w-5 h-5 text-amber-500" />;
    return <FileText className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black dark:text-white capitalize">{type}</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{items.length} entries</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold outline-none dark:text-white"
          >
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="title-asc">A-Z</option>
          </select>
        </div>
      </header>

      <div className="space-y-4">
        {sorted.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No {type} yet</p>
          </div>
        ) : sorted.map((item: any) => (
          <div key={item.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-5 group transition-all hover:shadow-lg">
            <div className="flex items-center gap-4">
              {type === 'tasks' ? (
                <button onClick={() => toggleTask(item.id)} className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 dark:border-gray-800'}`}>
                   {item.completed && <div className="w-4 h-4 rounded bg-white" />}
                </button>
              ) : type === 'events' ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600"><Calendar className="w-5 h-5" /></div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl">{getNoteIcon(item)}</div>
              )}
              
              <div className="flex-1 min-w-0" onClick={() => toggleExpand(item.id)}>
                <h4 className={`font-black text-gray-900 dark:text-white truncate ${item.completed ? 'line-through opacity-50' : ''}`}>{item.title || 'Untitled'}</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.createdAt || item.dueDate || item.start).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => toggleExpand(item.id)} className="text-gray-300 dark:text-gray-700">{expanded.has(item.id) ? <ChevronUp /> : <ChevronDown />}</button>
                <button onClick={() => {
                  if (type === 'tasks') deleteTask(item.id);
                  else if (type === 'events') deleteEvent(item.id);
                  else deleteNote(item.id);
                }} className="text-gray-200 dark:text-gray-800 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>

            {expanded.has(item.id) && (
              <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 text-sm animate-in slide-in-from-top-1">
                {type === 'notes' && item.type === 'drawing' ? (
                  <img src={item.content} alt="Drawing" className="w-full rounded-2xl bg-white border dark:border-gray-700" />
                ) : type === 'notes' && item.type === 'checklist' ? (
                  <div className="space-y-2">
                    {JSON.parse(item.content).map((st: any) => (
                      <div key={st.id} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${st.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`} />
                        <span className={st.completed ? 'line-through text-gray-400' : 'dark:text-gray-300'}>{st.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{item.content || item.description || 'No additional details.'}</p>
                )}
                
                {type === 'tasks' && item.subTasks?.map((s: any) => (
                  <div key={s.id} onClick={() => toggleSubtask(item.id, s.id)} className="flex items-center gap-3 py-2 cursor-pointer">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${s.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 dark:border-gray-800'}`}>
                      {s.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className={s.completed ? 'line-through text-gray-400' : 'dark:text-gray-300'}>{s.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

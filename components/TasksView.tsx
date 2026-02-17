
import React, { useState } from 'react';
import { useStore } from './StoreContext';
import { CheckSquare, ArrowUpDown, Clock, Trash2, List, ChevronDown, ChevronUp } from 'lucide-react';
import { Task } from '../types';

const TasksView: React.FC = () => {
  const { state, toggleTask, toggleSubtask, deleteTask } = useStore();
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const pendingTasks = state.tasks.filter(t => !t.completed);

  const sortedTasks = [...pendingTasks].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'title') {
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    } else {
      const pMap = { high: 3, medium: 2, low: 1 };
      return sortOrder === 'asc' 
        ? pMap[a.priority] - pMap[b.priority] 
        : pMap[b.priority] - pMap[a.priority];
    }
  });

  const toggleSort = (type: 'date' | 'title' | 'priority') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedTasks(newExpanded);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Task Board</h2>
            <p className="text-sm font-medium text-gray-500">{pendingTasks.length} missions active</p>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => toggleSort('date')}
            className={`px-4 py-2 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold whitespace-nowrap ${sortBy === 'date' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border-gray-100 text-gray-400'}`}
          >
            <Clock className="w-4 h-4" />
            By Date
          </button>
          <button 
            onClick={() => toggleSort('priority')}
            className={`px-4 py-2 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold whitespace-nowrap ${sortBy === 'priority' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border-gray-100 text-gray-400'}`}
          >
            <AlertCircleIcon className="w-4 h-4" />
            By Priority
          </button>
          <button 
            onClick={() => toggleSort('title')}
            className={`px-4 py-2 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold whitespace-nowrap ${sortBy === 'title' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border-gray-100 text-gray-400'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
            A-Z
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {sortedTasks.length > 0 ? sortedTasks.map(task => {
          const isExpanded = expandedTasks.has(task.id);
          const completedSub = task.subTasks.filter(s => s.completed).length;
          const totalSub = task.subTasks.length;
          const progress = totalSub > 0 ? (completedSub / totalSub) * 100 : 0;

          return (
            <div key={task.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="p-5 flex items-center justify-between group">
                <div className="flex items-center gap-4 flex-1">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                      task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-100 hover:border-emerald-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded bg-white transition-transform ${task.completed ? 'scale-100' : 'scale-0'}`} />
                  </button>
                  <div className="flex-1 min-w-0" onClick={() => toggleExpand(task.id)}>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-gray-900 truncate ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</h4>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {totalSub > 0 && <span className="text-emerald-500 flex items-center gap-1"><List className="w-3 h-3" /> {completedSub}/{totalSub}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleExpand(task.id)} className="p-2 text-gray-300 hover:text-gray-600">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Expandable Subtasks */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-300">
                  <div className="h-px bg-gray-50 mb-4" />
                  {task.description && <p className="text-sm text-gray-500 mb-4 px-2">{task.description}</p>}
                  
                  {totalSub > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1 px-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subtask Progress</span>
                        <span className="text-[10px] font-bold text-emerald-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="space-y-2">
                        {task.subTasks.map(st => (
                          <button 
                            key={st.id}
                            onClick={() => toggleSubtask(task.id, st.id)}
                            className="w-full flex items-center gap-3 p-3 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all text-left"
                          >
                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                              st.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-200'
                            }`}>
                              {st.completed && <CheckIcon className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm font-medium text-gray-700 ${st.completed ? 'line-through opacity-50' : ''}`}>{st.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }) : (
          <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-[3rem] p-16 text-center text-gray-400">
            <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="font-black text-xl text-gray-900 mb-1">Clear Horizon</h3>
            <p className="text-sm">No pending tasks found. Time to relax!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default TasksView;

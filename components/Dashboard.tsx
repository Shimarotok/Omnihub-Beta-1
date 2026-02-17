
import React, { useState, useRef } from 'react';
import { useStore } from './StoreContext';
import { Calendar, CheckSquare, FileText, DollarSign, Clock, ChevronRight, GripVertical, Check, X, AlertCircle, Edit2 } from 'lucide-react';

const Dashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { state, updateSettings } = useStore();
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const holdTimerRef = useRef<any>(null);

  const today = new Date().toISOString().split('T')[0];
  const order = state.settings.dashboardOrder || ['finances', 'tasks', 'events', 'notes'];

  const todayTasks = state.tasks.filter(t => t.dueDate.startsWith(today));
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const pendingTodayCount = todayTasks.length - completedTasks;
  const taskProgress = todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 0;
  
  const upcomingEvents = state.events
    .filter(e => new Date(e.start).getTime() >= new Date().setHours(0,0,0,0))
    .sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const totalTodaySpending = state.finances
    .filter(f => f.date === today && f.type === 'spending')
    .reduce((sum, f) => sum + f.amount, 0);

  const budgetProgress = Math.min((totalTodaySpending / state.settings.budgets.daily) * 100, 100);

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Rearrangement Logic
  const handleHoldStart = (e: React.PointerEvent) => {
    if (isReordering) return;
    holdTimerRef.current = setTimeout(() => {
      setIsReordering(true);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 600);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  };

  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setHoveredIndex(index);
  };

  const onDrop = (index: number) => {
    if (draggedIndex === null) return;
    const newOrder = [...order];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, movedItem);
    updateSettings({ dashboardOrder: newOrder });
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const handleQuickBudgetEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const current = state.settings.budgets.daily;
    const newVal = window.prompt(`Update Daily Budget (${state.settings.currency}):`, current.toString());
    if (newVal !== null) {
      const num = parseFloat(newVal);
      if (!isNaN(num) && num >= 0) {
        updateSettings({
          budgets: {
            ...state.settings.budgets,
            daily: num
          }
        });
      }
    }
  };

  const renderPanel = (type: string, index: number) => {
    const isDragging = draggedIndex === index;
    const isHovered = hoveredIndex === index;
    
    // Base styles for all panels - unified full width
    const panelBaseClasses = `w-full bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col group transition-all duration-300 relative ${
      isReordering ? 'cursor-grab active:cursor-grabbing' : 'active:scale-[0.98]'
    } ${isDragging ? 'opacity-30 scale-95 grayscale' : ''} ${
      isHovered ? 'border-blue-400 dark:border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/20 translate-y-1' : ''
    }`;

    const commonProps = {
      draggable: isReordering,
      onDragStart: () => onDragStart(index),
      onDragOver: (e: React.DragEvent) => onDragOver(e, index),
      onDrop: () => onDrop(index),
      onDragEnd: () => { setDraggedIndex(null); setHoveredIndex(null); },
      onPointerDown: handleHoldStart,
      onPointerUp: handleHoldEnd,
      onPointerLeave: handleHoldEnd,
    };

    switch (type) {
      case 'finances':
        return (
          <div key="finances" className="col-span-6" {...commonProps}>
            <button 
              onClick={() => !isReordering && onNavigate('finances')}
              className={panelBaseClasses}
            >
              {isReordering && <div className="absolute top-6 right-8 text-blue-500 animate-bounce"><GripVertical className="w-5 h-5" /></div>}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Finances</h3>
                </div>
                {!isReordering && <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-blue-500" />}
              </div>
              <div className="flex items-end justify-between">
                <div className="text-left">
                  <div className="text-3xl font-black text-gray-900 dark:text-white">
                    <span className="text-sm font-bold mr-0.5">{state.settings.currency}</span>
                    {totalTodaySpending}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Spent Today</div>
                </div>
                <div className="flex-1 max-w-[150px] mb-2 ml-4 relative">
                  <div className="flex justify-between text-[8px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1 group/budget" onClick={handleQuickBudgetEdit}>
                    <span className="flex items-center gap-1 hover:text-blue-500 transition-colors">Budget <Edit2 className="w-2 h-2" /></span>
                    <span className={budgetProgress > 90 ? 'text-red-500' : 'text-blue-500'}>{Math.round(budgetProgress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden" onClick={handleQuickBudgetEdit}>
                    <div 
                      className={`h-full transition-all duration-700 ${budgetProgress > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                      style={{ width: `${budgetProgress}%` }} 
                    />
                  </div>
                </div>
              </div>
            </button>
          </div>
        );
      case 'tasks':
        return (
          <div key="tasks" className="col-span-6" {...commonProps}>
            <button 
              onClick={() => !isReordering && onNavigate('tasks')}
              className={panelBaseClasses}
            >
              {isReordering && <div className="absolute top-6 right-8 text-emerald-500 animate-bounce"><GripVertical className="w-5 h-5" /></div>}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Tasks</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    {pendingTodayCount} left
                  </span>
                  {!isReordering && <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-emerald-500" />}
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">
                  <span>Today's Progress</span>
                  <span>{Math.round(taskProgress)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${taskProgress}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                {[...state.tasks].sort((a,b) => {
                  if (a.completed !== b.completed) return a.completed ? 1 : -1;
                  const pMap = { high: 3, medium: 2, low: 1 };
                  return pMap[b.priority] - pMap[a.priority];
                }).slice(0, 3).map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all border text-left ${
                      task.completed 
                        ? 'bg-gray-50/30 dark:bg-white/5 border-transparent opacity-60' 
                        : 'bg-gray-50/50 dark:bg-white/5 border-transparent group-hover:border-gray-100 dark:group-hover:border-gray-800'
                    }`}
                  >
                    {task.completed ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <CheckSquare className="w-2.5 h-2.5 text-white" />
                      </div>
                    ) : (
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                    )}
                    <span className={`flex-1 font-bold text-gray-700 dark:text-gray-300 truncate text-sm ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </button>
          </div>
        );
      case 'events':
        return (
          <div key="events" className="col-span-6" {...commonProps}>
            <button 
              onClick={() => !isReordering && onNavigate('calendar')}
              className={panelBaseClasses}
            >
              {isReordering && <div className="absolute top-6 right-8 text-blue-500 animate-bounce"><GripVertical className="w-5 h-5" /></div>}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Events</h3>
                </div>
                {!isReordering && <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-blue-500" />}
              </div>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 2).map(e => (
                  <div key={e.id} className="flex gap-4 p-4 rounded-3xl border border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors relative overflow-hidden text-left">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />
                    <div className="min-w-[50px] flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-sm border border-gray-50 dark:border-gray-800">
                      <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase leading-none">{new Date(e.start).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-black text-gray-900 dark:text-white leading-tight">{new Date(e.start).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">{e.title}</div>
                      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase">{formatTime(e.start)}</div>
                    </div>
                  </div>
                )) : <div className="text-center py-2 text-sm text-gray-400 italic">No upcoming events.</div>}
              </div>
            </button>
          </div>
        );
      case 'notes':
        return (
          <div key="notes" className="col-span-6" {...commonProps}>
            <button 
              onClick={() => !isReordering && onNavigate('notes')}
              className={panelBaseClasses}
            >
              {isReordering && <div className="absolute top-6 right-8 text-amber-500 animate-bounce"><GripVertical className="w-5 h-5" /></div>}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Recent Notes</h3>
                </div>
                {!isReordering && <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-blue-500" />}
              </div>
              <div className="space-y-3">
                {state.notes.slice(0, 2).map(note => (
                  <div 
                    key={note.id} 
                    className="p-4 rounded-[1.5rem] bg-gray-50/50 dark:bg-white/5 border border-transparent group-hover:border-gray-100 dark:group-hover:border-gray-800 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-black text-[10px] truncate text-gray-400 dark:text-gray-500 uppercase tracking-widest">{note.title || 'Untitled'}</div>
                    </div>
                    <div className="text-[11px] font-medium text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {note.content.startsWith('[') ? 'Checklist Note' : note.content}
                    </div>
                  </div>
                ))}
                {state.notes.length === 0 && (
                   <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 text-center">
                     <FileText className="w-6 h-6 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                     <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">No Notes Yet</p>
                   </div>
                )}
              </div>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-24 select-none">
      <header className="py-2 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">OmniHub</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">Your day at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
           {isReordering && (
             <button 
               onClick={() => setIsReordering(false)}
               className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-200 animate-in zoom-in"
             >
               <Check className="w-5 h-5" />
             </button>
           )}
           <div className="bg-white dark:bg-gray-900 p-3 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] font-black text-blue-500 uppercase">{new Date().toLocaleDateString('en-US', { month: 'short' })}</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">{new Date().getDate()}</span>
          </div>
        </div>
      </header>

      {isReordering && (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-[2rem] border border-blue-100 dark:border-blue-800 animate-in slide-in-from-top-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-xl text-blue-600 dark:text-blue-400"><GripVertical className="w-5 h-5" /></div>
             <div>
               <p className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase">Reorder Active</p>
               <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">Drag and drop to rearrange</p>
             </div>
           </div>
           <button onClick={() => setIsReordering(false)} className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm"><Check className="w-5 h-5 text-blue-600" /></button>
        </div>
      )}

      {/* Unified grid: all panels are col-span-6 */}
      <div className="grid grid-cols-6 gap-6">
        {order.map((type, index) => renderPanel(type, index))}
      </div>

      {!isReordering && (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-300 dark:text-gray-700">
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.2em]">Hold any panel to rearrange</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

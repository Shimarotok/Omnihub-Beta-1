
import React from 'react';
import { useStore } from './StoreContext';
import { Calendar, CheckSquare, FileText, DollarSign, ArrowRight, Clock, ChevronRight, List as ListIcon, TrendingUp } from 'lucide-react';

const Dashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { state } = useStore();
  const today = new Date().toISOString().split('T')[0];
  
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

  return (
    <div className="space-y-6 pb-24">
      <header className="py-2 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">OmniHub</h1>
          <p className="text-gray-500 font-bold text-sm">Your day at a glance.</p>
        </div>
        <div className="bg-white p-3 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col items-center min-w-[80px]">
          <span className="text-[10px] font-black text-blue-500 uppercase">{new Date().toLocaleDateString('en-US', { month: 'short' })}</span>
          <span className="text-xl font-black text-gray-900">{new Date().getDate()}</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-6 gap-4">
        
        {/* Unified Finance Panel */}
        <button 
          onClick={() => onNavigate('finances')}
          className="col-span-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Finances</h3>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-left">
              <div className="text-3xl font-black text-gray-900">
                <span className="text-sm font-bold mr-0.5">{state.settings.currency}</span>
                {totalTodaySpending}
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Spent Today</div>
            </div>
            <div className="flex-1 max-w-[150px] mb-2 ml-4">
              <div className="flex justify-between text-[8px] font-bold uppercase text-gray-400 mb-1">
                <span>Budget</span>
                <span className={budgetProgress > 90 ? 'text-red-500' : 'text-blue-500'}>{Math.round(budgetProgress)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${budgetProgress > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                  style={{ width: `${budgetProgress}%` }} 
                />
              </div>
            </div>
          </div>
        </button>

        {/* Unified Tasks Panel (Merged Summary + Priority) */}
        <button 
          onClick={() => onNavigate('tasks')}
          className="col-span-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-all active:scale-[0.98] text-left"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Tasks</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {pendingTodayCount} left
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500" />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
              <span>Today's Progress</span>
              <span>{Math.round(taskProgress)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${taskProgress}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            {[...state.tasks].sort((a,b) => {
              // Priority sorting: Pending first
              if (a.completed !== b.completed) return a.completed ? 1 : -1;
              const pMap = { high: 3, medium: 2, low: 1 };
              return pMap[b.priority] - pMap[a.priority];
            }).slice(0, 3).map(task => (
              <div 
                key={task.id} 
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all border ${
                  task.completed 
                    ? 'bg-gray-50/30 border-transparent opacity-60' 
                    : 'bg-gray-50/50 border-transparent group-hover:border-gray-100'
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
                <span className={`flex-1 font-bold text-gray-700 truncate text-sm ${task.completed ? 'line-through' : ''}`}>
                  {task.title}
                </span>
                {task.subTasks.length > 0 && (
                  <span className="text-[9px] font-black text-gray-400 uppercase">
                    {task.subTasks.filter(s => s.completed).length}/{task.subTasks.length}
                  </span>
                )}
              </div>
            ))}
            {state.tasks.length === 0 && (
              <p className="text-center py-2 text-sm text-gray-400 italic">No tasks found. Tap to add!</p>
            )}
          </div>
        </button>

        {/* Unified Next Events Section */}
        <button 
          onClick={() => onNavigate('calendar')}
          className="col-span-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Events</h3>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
          </div>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 2).map(e => (
              <div key={e.id} className="flex gap-4 p-4 rounded-3xl border border-gray-50 bg-gray-50/30 group-hover:bg-white transition-colors relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />
                <div className="min-w-[50px] flex flex-col items-center justify-center bg-white rounded-2xl p-2 shadow-sm border border-gray-50">
                  <span className="text-[9px] font-black text-gray-400 uppercase leading-none">{new Date(e.start).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-lg font-black text-gray-900 leading-tight">{new Date(e.start).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{e.title}</div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    {formatTime(e.start)} - {formatTime(e.end)}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-4">
                 <p className="text-sm text-gray-400 italic">No upcoming events.</p>
              </div>
            )}
          </div>
        </button>

        {/* Quick Access Notes Section */}
        <div className="col-span-6 grid grid-cols-2 gap-3 mt-2">
          {state.notes.slice(0, 2).map(note => (
            <button 
              key={note.id} 
              onClick={() => onNavigate('notes')}
              className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 h-32 overflow-hidden text-left hover:border-amber-200 transition-all active:scale-95 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <div className="font-black text-[10px] truncate text-gray-400 uppercase tracking-widest">{note.title || 'Untitled Note'}</div>
              </div>
              {note.type === 'drawing' ? (
                <div className="bg-gray-50 rounded-xl h-16 overflow-hidden flex items-center justify-center border border-gray-100 group-hover:border-amber-100">
                  <img src={note.content} alt="Drawing" className="w-full h-full object-cover opacity-80" />
                </div>
              ) : (
                <div className="text-[11px] font-medium text-gray-600 line-clamp-3 leading-relaxed">
                  {note.content.startsWith('[') ? 'Checklist Note' : note.content}
                </div>
              )}
            </button>
          ))}
          {state.notes.length === 0 && (
             <button 
              onClick={() => onNavigate('notes')}
              className="col-span-2 bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 text-center group active:scale-95 transition-all"
            >
               <FileText className="w-6 h-6 text-gray-300 mx-auto mb-2 group-hover:text-amber-400 transition-colors" />
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Notes Yet</p>
             </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

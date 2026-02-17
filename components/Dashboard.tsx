
import React from 'react';
import { useStore } from './StoreContext';
import { Calendar, CheckSquare, FileText, DollarSign, ArrowRight, Clock, ChevronRight, AlertCircle } from 'lucide-react';

const Dashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { state } = useStore();
  const today = new Date().toISOString().split('T')[0];
  
  const todayTasks = state.tasks.filter(t => t.dueDate.startsWith(today));
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const pendingTasksCount = todayTasks.length - completedTasks;
  const taskProgress = todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 0;
  
  const todayEvents = state.events.filter(e => e.start.startsWith(today));
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
      <header className="py-2 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">OmniHub</h1>
          <p className="text-gray-500 font-medium text-sm">Welcome back!</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold text-gray-700">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-6 gap-4">
        
        {/* Task Summary Widget */}
        <button 
          onClick={() => onNavigate('tasks')}
          className="col-span-3 bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group"
        >
          <div className="flex justify-between items-start w-full">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <CheckSquare className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
          </div>
          <div className="text-left mt-4">
            <div className="text-3xl font-black text-gray-900">{pendingTasksCount}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tasks Left Today</div>
            <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${taskProgress}%` }} />
            </div>
          </div>
        </button>

        {/* Finance Summary Widget */}
        <button 
          onClick={() => onNavigate('finances')}
          className="col-span-3 bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group"
        >
          <div className="flex justify-between items-start w-full">
            <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:bg-red-100 transition-colors">
              <DollarSign className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
          </div>
          <div className="text-left mt-4">
            <div className="text-3xl font-black text-gray-900">
              <span className="text-sm font-bold mr-0.5">{state.settings.currency}</span>
              {totalTodaySpending}
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spent Today</div>
            <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ${budgetProgress > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${budgetProgress}%` }} 
              />
            </div>
          </div>
        </button>

        {/* Detailed Upcoming Events Section */}
        <div className="col-span-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-black text-gray-900">Next Events</h3>
            </div>
            <button onClick={() => onNavigate('calendar')} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 3).map(e => (
              <div key={e.id} className="flex gap-4 p-4 rounded-3xl border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-colors relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />
                <div className="min-w-[60px] flex flex-col items-center justify-center bg-white rounded-2xl p-2 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(e.start).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-xl font-black text-gray-900 leading-none">{new Date(e.start).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{e.title}</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    {formatTime(e.start)} - {formatTime(e.end)}
                  </div>
                  {e.location && (
                    <div className="text-[10px] text-gray-400 mt-1 truncate">📍 {e.location}</div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                 <p className="text-sm text-gray-400 italic">No events on your radar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Pending Tasks Section */}
        <div className="col-span-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-emerald-500" />
              <h3 className="text-xl font-black text-gray-900">Priority Tasks</h3>
            </div>
            <button onClick={() => onNavigate('tasks')} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1">
              Check All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {state.tasks.filter(t => !t.completed).sort((a,b) => {
              const pMap = { high: 3, medium: 2, low: 1 };
              return pMap[b.priority] - pMap[a.priority];
            }).slice(0, 4).map(task => (
              <div key={task.id} className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{task.title}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                    {task.subTasks.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <ListIcon className="w-2.5 h-2.5" />
                        {task.subTasks.filter(s => s.completed).length}/{task.subTasks.length} Done
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase text-gray-300">{task.priority}</div>
              </div>
            ))}
            {state.tasks.filter(t => !t.completed).length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 italic">All tasks completed! Enjoy the quiet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Note Snapshot Snapshot */}
        <div className="col-span-6 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-gray-900 text-sm">Notes</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {state.notes.slice(0, 2).map(note => (
              <button 
                key={note.id} 
                onClick={() => onNavigate('notes')}
                className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 h-28 overflow-hidden text-left hover:border-amber-200 transition-colors"
              >
                <div className="font-bold text-xs mb-1 truncate text-gray-900">{note.title}</div>
                {note.type === 'drawing' ? (
                  <img src={note.content} alt="Drawing" className="w-full h-12 object-cover rounded-lg opacity-60" />
                ) : (
                  <div className="text-[10px] text-gray-500 line-clamp-3">{note.content}</div>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const ListIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default Dashboard;

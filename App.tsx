
import React, { useState } from 'react';
import { StoreProvider, useStore } from './components/StoreContext';
import { THEMES } from './constants';
import AddModal from './components/AddModal';
import Dashboard from './components/Dashboard';
import Finances from './components/Finances';
import Settings from './components/Settings';
import Pomodoro from './components/Pomodoro';
import TasksView from './components/TasksView';
import EventsView from './components/EventsView';
import { Home, Calendar, DollarSign, Timer, Settings as SettingsIcon, Plus, FileText, CheckSquare } from 'lucide-react';

const AppContent: React.FC = () => {
  const { state } = useStore();
  const [activeView, setActiveView] = useState('home');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const themeColors = THEMES[state.settings.theme];
  const themeClass = state.settings.mode === 'light' ? themeColors.light : themeColors.dark;
  const accentColor = themeColors.accent;

  const renderView = () => {
    switch (activeView) {
      case 'home': return <Dashboard onNavigate={setActiveView} />;
      case 'finances': return <Finances />;
      case 'settings': return <Settings />;
      case 'timer': return <div className="flex items-center justify-center min-h-[70vh]"><Pomodoro /></div>;
      case 'tasks': return <TasksView />;
      case 'calendar': return <EventsView />;
      case 'notes': 
        return (
          <div className="py-20 text-center animate-in fade-in duration-500">
            <div className="text-gray-400 mb-4 bg-white/50 p-8 rounded-[3rem] border border-dashed border-gray-200">
              <div className="mb-4 flex justify-center">
                <FileText className="w-12 h-12 text-gray-200" />
              </div>
              Notes view coming soon in the demo...
            </div>
            <button 
              onClick={() => setActiveView('home')} 
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              Go Back Home
            </button>
          </div>
        );
      default: return <Dashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 selection:bg-blue-100 ${themeClass} ${state.settings.font}`}>
      <div className="max-w-xl mx-auto px-5 pt-4 pb-28">
        {renderView()}
      </div>

      {/* Bottom Navigation Bar with Integrated Add Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
        <nav className="max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-gray-100 px-6 py-3 flex justify-between items-center rounded-[2.5rem] shadow-2xl shadow-black/5">
          <button 
            onClick={() => setActiveView('home')} 
            className={`flex flex-col items-center gap-1 transition-all ${activeView === 'home' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Dash</span>
          </button>
          <button 
            onClick={() => setActiveView('finances')} 
            className={`flex flex-col items-center gap-1 transition-all ${activeView === 'finances' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Cash</span>
          </button>
          
          {/* Integrated Add Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsAddOpen(true);
            }}
            className={`w-12 h-12 ${accentColor} text-white rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center active:scale-90 transition-all group hover:scale-105 -mt-8 border-4 border-white`}
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          <button 
            onClick={() => setActiveView('timer')} 
            className={`flex flex-col items-center gap-1 transition-all ${activeView === 'timer' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
          >
            <Timer className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Focus</span>
          </button>
          <button 
            onClick={() => setActiveView('settings')} 
            className={`flex flex-col items-center gap-1 transition-all ${activeView === 'settings' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">More</span>
          </button>
        </nav>
      </div>

      {isAddOpen && <AddModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />}
    </div>
  );
};

const App: React.FC = () => (
  <StoreProvider>
    <AppContent />
  </StoreProvider>
);

export default App;

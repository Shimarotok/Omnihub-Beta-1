
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './StoreContext';
import { getSmartSubdivision, processSmartInput } from '../services/geminiService';
import DrawingCanvas from './DrawingCanvas';
import { Plus, Calendar, CheckSquare, FileText, DollarSign, ArrowLeft, Loader2, List, Edit3, TrendingDown, TrendingUp, Clock, X, AlertCircle, Mic, MicOff, Sparkles, Send } from 'lucide-react';
import { Priority } from '../types';

type Step = 'main' | 'smart' | 'note-sub' | 'finance-sub' | 'event-form' | 'task-form' | 'note-text-form' | 'note-checklist-form' | 'note-drawing-form' | 'finance-spending-form' | 'finance-earning-form';

const AddModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { addNote, addTask, addEvent, addFinance } = useStore();
  const [step, setStep] = useState<Step>('main');
  const [loading, setLoading] = useState(false);
  const [newSubTaskInput, setNewSubTaskInput] = useState('');
  
  // Smart Input State
  const [smartInputText, setSmartInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const getCurrentTime = (offsetHours = 0) => {
    const d = new Date();
    d.setHours(d.getHours() + offsetHours);
    return d.toTimeString().slice(0, 5);
  };

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    amount: '',
    category: 'General',
    priority: 'medium' as Priority,
    date: today,
    endDate: today,
    startTime: getCurrentTime(1),
    endTime: getCurrentTime(2),
    dueTime: '23:59',
    subTasks: [],
    checklistItems: [],
  });

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSmartInputText(prev => (prev.trim() ? prev + ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSmartSubmit = async () => {
    if (!smartInputText.trim()) return;
    setLoading(true);
    const result = await processSmartInput(smartInputText);
    setLoading(false);

    if (result) {
      // Map result to app actions
      if (result.type === 'task') {
        addTask({ 
          title: result.title, 
          description: result.description || '', 
          dueDate: result.date ? `${result.date}T${result.dueTime || '23:59'}:00` : `${today}T23:59:00`,
          priority: (result.priority as Priority) || 'medium',
          category: 'General',
          subTasks: (result.subtasks || []).map((s: string) => ({
            id: crypto.randomUUID(),
            title: s,
            completed: false
          }))
        });
      } else if (result.type === 'event') {
        addEvent({
          title: result.title,
          description: result.description || '',
          start: `${result.date || today}T${result.startTime || '09:00'}:00`,
          end: `${result.date || today}T${result.endTime || '10:00'}:00`,
        });
      } else if (result.type === 'note') {
        addNote({ title: result.title, type: 'text', content: result.description || '' });
      } else if (result.type === 'finance') {
        addFinance({
          amount: result.amount || 0,
          type: result.financeType || 'spending',
          category: 'General',
          date: result.date || today,
          note: result.description || ''
        });
      }
      onClose();
      reset();
    }
  };

  const handleStartDateChange = (newDate: string) => {
    setFormData((prev: any) => ({
      ...prev,
      date: newDate,
      endDate: prev.endDate === prev.date ? newDate : prev.endDate
    }));
  };

  const handleStartTimeChange = (newStartTime: string) => {
    const [hours, minutes] = newStartTime.split(':').map(Number);
    const startDateTime = new Date(formData.date);
    startDateTime.setHours(hours, minutes, 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    const newEndTime = endDateTime.toTimeString().slice(0, 5);
    const newEndDate = endDateTime.toISOString().split('T')[0];

    setFormData((prev: any) => ({
      ...prev,
      startTime: newStartTime,
      endTime: newEndTime,
      endDate: newEndDate
    }));
  };

  const handleSmartDivide = async () => {
    if (!formData.title) return;
    setLoading(true);
    const subtasks = await getSmartSubdivision(formData.title);
    setFormData((prev: any) => ({
      ...prev,
      subTasks: [
        ...prev.subTasks,
        ...subtasks.map(s => ({ id: crypto.randomUUID(), title: s, completed: false }))
      ]
    }));
    setLoading(false);
  };

  const addManualSubTask = () => {
    if (!newSubTaskInput.trim()) return;
    setFormData((prev: any) => ({
      ...prev,
      subTasks: [...prev.subTasks, { id: crypto.randomUUID(), title: newSubTaskInput, completed: false }]
    }));
    setNewSubTaskInput('');
  };

  const removeSubTask = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      subTasks: prev.subTasks.filter((st: any) => st.id !== id)
    }));
  };

  const handleSave = () => {
    if (step === 'event-form') {
      const startStr = `${formData.date}T${formData.startTime}:00`;
      const endStr = `${formData.endDate}T${formData.endTime}:00`;
      addEvent({ title: formData.title, start: startStr, end: endStr, description: formData.description });
    } else if (step === 'task-form') {
      const dueStr = `${formData.endDate}T${formData.dueTime}:00`;
      addTask({ 
        title: formData.title, 
        description: formData.description, 
        dueDate: dueStr, 
        category: formData.category, 
        priority: formData.priority,
        subTasks: formData.subTasks 
      });
    } else if (step === 'note-text-form') {
      addNote({ title: formData.title, type: 'text', content: formData.description });
    } else if (step === 'note-checklist-form') {
      addNote({ title: formData.title, type: 'checklist', content: JSON.stringify(formData.checklistItems) });
    } else if (step === 'finance-spending-form') {
      addFinance({ amount: Number(formData.amount), type: 'spending', category: formData.category, date: formData.date, note: formData.description });
    } else if (step === 'finance-earning-form') {
      addFinance({ amount: Number(formData.amount), type: 'earning', category: formData.category, date: formData.date, note: formData.description });
    }
    reset();
    onClose();
  };

  const reset = () => {
    setStep('main');
    setFormData({ 
      title: '', 
      description: '', 
      amount: '', 
      category: 'General', 
      priority: 'medium',
      date: today, 
      endDate: today,
      startTime: getCurrentTime(1),
      endTime: getCurrentTime(2),
      dueTime: '23:59',
      subTasks: [], 
      checklistItems: [] 
    });
    setNewSubTaskInput('');
    setSmartInputText('');
  };

  const renderContent = () => {
    switch (step) {
      case 'main':
        return (
          <div className="space-y-4 p-4">
            {/* Smart Input Shortcut */}
            <button 
              onClick={() => setStep('smart')}
              className="w-full bg-blue-600 p-6 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-blue-200 group transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-black text-lg">Smart Input</div>
                  <div className="text-xs text-blue-100 font-bold opacity-80 uppercase tracking-widest">Natural Language / Voice</div>
                </div>
              </div>
              <Mic className="w-5 h-5 opacity-60" />
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setStep('event-form')} className="flex flex-col items-center p-6 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all border border-blue-100 group">
                <Calendar className="w-10 h-10 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-blue-900">Event</span>
              </button>
              <button onClick={() => setStep('task-form')} className="flex flex-col items-center p-6 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition-all border border-emerald-100 group">
                <CheckSquare className="w-10 h-10 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-emerald-900">Task</span>
              </button>
              <button onClick={() => setStep('note-sub')} className="flex flex-col items-center p-6 bg-amber-50 hover:bg-amber-100 rounded-2xl transition-all border border-amber-100 group">
                <FileText className="w-10 h-10 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-amber-900">Note</span>
              </button>
              <button onClick={() => setStep('finance-sub')} className="flex flex-col items-center p-6 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all border border-purple-100 group">
                <DollarSign className="w-10 h-10 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-purple-900">Finance</span>
              </button>
            </div>
          </div>
        );

      case 'smart':
        return (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="p-4 bg-blue-50 w-fit mx-auto rounded-3xl text-blue-600">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-gray-900">What's on your mind?</h3>
              <p className="text-sm text-gray-500 font-medium px-4 leading-relaxed">
                "Add task Plan Party with subtasks Invite friends and Buy snacks"<br/>
                "Spent 25 dollars on lunch"<br/>
                "Dinner with Sarah at 7pm tonight"
              </p>
            </div>

            <div className="relative group">
              <textarea
                value={smartInputText}
                onChange={(e) => setSmartInputText(e.target.value)}
                placeholder="Type or speak naturally..."
                className="w-full p-6 pt-10 bg-gray-50 rounded-[2.5rem] border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 outline-none h-48 resize-none font-medium transition-all"
              />
              <button 
                onClick={toggleListening}
                className={`absolute top-4 right-4 p-3 rounded-2xl transition-all shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-400 border border-gray-100 hover:text-blue-500'}`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              {isListening && (
                <div className="absolute top-12 right-12 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full animate-bounce">
                  Listening...
                </div>
              )}
            </div>

            <button 
              onClick={handleSmartSubmit}
              disabled={loading || !smartInputText.trim()}
              className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-bold shadow-xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Process with Gemini</span>
                </>
              )}
            </button>
          </div>
        );

      case 'note-sub':
        return (
          <div className="grid grid-cols-1 gap-3 p-4">
            <button onClick={() => setStep('note-text-form')} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
              <Edit3 className="text-amber-600" />
              <div className="text-left">
                <div className="font-semibold">Text Note</div>
                <div className="text-xs text-gray-500">Simple markdown-like text</div>
              </div>
            </button>
            <button onClick={() => setStep('note-checklist-form')} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
              <List className="text-amber-600" />
              <div className="text-left">
                <div className="font-semibold">Checklist</div>
                <div className="text-xs text-gray-500">Interactive todo list</div>
              </div>
            </button>
            <button onClick={() => setStep('note-drawing-form')} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
              <Edit3 className="text-amber-600" />
              <div className="text-left">
                <div className="font-semibold">Drawing</div>
                <div className="text-xs text-gray-500">Handwritten or sketched</div>
              </div>
            </button>
          </div>
        );

      case 'finance-sub':
        return (
          <div className="grid grid-cols-1 gap-3 p-4">
            <button onClick={() => setStep('finance-spending-form')} className="flex items-center gap-4 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-all">
              <TrendingDown className="text-red-600" />
              <div className="text-left">
                <div className="font-semibold text-red-900">Spending</div>
                <div className="text-xs text-red-700">Money going out</div>
              </div>
            </button>
            <button onClick={() => setStep('finance-earning-form')} className="flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all">
              <TrendingUp className="text-green-600" />
              <div className="text-left">
                <div className="font-semibold text-green-900">Earning</div>
                <div className="text-xs text-green-700">Money coming in</div>
              </div>
            </button>
          </div>
        );

      case 'note-drawing-form':
        return (
          <div className="p-0 h-[70vh]">
            <DrawingCanvas 
              onSave={(dataUrl) => {
                addNote({ title: 'New Sketch', type: 'drawing', content: dataUrl });
                reset();
                onClose();
              }} 
              onCancel={() => setStep('note-sub')}
            />
          </div>
        );

      default:
        // Filter out date/time for note types
        const isNoteForm = step.startsWith('note-');

        return (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter title..."
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {step === 'task-form' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl border transition-all ${
                        formData.priority === p 
                          ? p === 'high' ? 'bg-red-600 text-white border-red-600' : p === 'medium' ? 'bg-amber-500 text-white border-amber-500' : 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-400 border-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {(step === 'finance-spending-form' || step === 'finance-earning-form') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input 
                  type="number" 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {!isNoteForm && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {step === 'event-form' ? 'Start Date' : 'Date'}
                  </label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>

                {step === 'task-form' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
                    <div className="relative">
                      <input 
                        type="time" 
                        value={formData.dueTime}
                        onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                )}

                {step === 'event-form' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <div className="relative">
                      <input 
                        type="time" 
                        value={formData.startTime}
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isNoteForm && (step === 'event-form' || step === 'task-form') && (
              <div className="grid grid-cols-2 gap-3">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
                {step === 'event-form' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <div className="relative">
                      <input 
                        type="time" 
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {(step === 'event-form' || step === 'task-form' || step === 'note-text-form' || step === 'finance-spending-form' || step === 'finance-earning-form') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Add details..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                />
              </div>
            )}

            {(step === 'task-form' || step === 'event-form') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Sub-tasks</label>
                  <button 
                    type="button"
                    onClick={handleSmartDivide}
                    disabled={loading || !formData.title}
                    className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 flex items-center gap-1 disabled:opacity-50 transition-colors"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertCircle className="w-3 h-3" />}
                    Smart Split (AI)
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newSubTaskInput}
                    onChange={(e) => setNewSubTaskInput(e.target.value)}
                    placeholder="Add sub-task manually..."
                    className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border-none ring-1 ring-gray-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addManualSubTask()}
                  />
                  <button 
                    type="button" 
                    onClick={addManualSubTask}
                    className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {formData.subTasks.length > 0 && (
                  <ul className="space-y-1 bg-gray-50 p-3 rounded-2xl border border-gray-100 max-h-40 overflow-y-auto scrollbar-hide">
                    {formData.subTasks.map((st: any) => (
                      <li key={st.id} className="text-sm text-gray-600 flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-gray-50 group transition-all">
                        <div className="flex items-center gap-2 truncate">
                           <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
                           <span className="truncate">{st.title}</span>
                        </div>
                        <button 
                          onClick={() => removeSubTask(st.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button 
              onClick={handleSave}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Save Entry
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          {step !== 'main' ? (
            <button onClick={() => setStep('main')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-500" />
            </button>
          ) : <div className="w-10" />}
          <h2 className="font-bold text-lg">{step === 'main' ? 'Add New' : step === 'smart' ? 'Smart Input' : 'Create Entry'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 bg-white">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AddModal;

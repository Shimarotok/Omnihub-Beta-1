
import React, { useState, useEffect } from 'react';
import { useStore } from './StoreContext';
import { getSmartSubdivision } from '../services/geminiService';
import DrawingCanvas from './DrawingCanvas';
import { Plus, Calendar, CheckSquare, FileText, DollarSign, ArrowLeft, Loader2, List, Edit3, TrendingDown, TrendingUp, Clock, X, AlertCircle } from 'lucide-react';
import { Priority } from '../types';

type Step = 'main' | 'note-sub' | 'finance-sub' | 'event-form' | 'task-form' | 'note-text-form' | 'note-checklist-form' | 'note-drawing-form' | 'finance-spending-form' | 'finance-earning-form';

const AddModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { addNote, addTask, addEvent, addFinance } = useStore();
  const [step, setStep] = useState<Step>('main');
  const [loading, setLoading] = useState(false);
  const [newSubTaskInput, setNewSubTaskInput] = useState('');

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
  };

  const renderContent = () => {
    switch (step) {
      case 'main':
        return (
          <div className="grid grid-cols-2 gap-4 p-4">
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
          <div className="p-0 h-[60vh]">
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

            {(step === 'event-form' || step === 'task-form') && (
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
                    className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 flex items-center gap-1 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertCircle className="w-3 h-3" />}
                    Smart Split
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
                    className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {formData.subTasks.length > 0 && (
                  <ul className="space-y-1 bg-gray-50 p-3 rounded-2xl border border-gray-100 max-h-40 overflow-y-auto">
                    {formData.subTasks.map((st: any) => (
                      <li key={st.id} className="text-sm text-gray-600 flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-gray-50 group">
                        <div className="flex items-center gap-2 truncate">
                           <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
                           <span className="truncate">{st.title}</span>
                        </div>
                        <button 
                          onClick={() => removeSubTask(st.id)}
                          className="text-gray-300 hover:text-red-500"
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
              Save
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4" onClick={(e) => {
      // Close modal if background is clicked
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          {step !== 'main' ? (
            <button onClick={() => setStep('main')} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-6 h-6 text-gray-500" />
            </button>
          ) : <div className="w-10" />}
          <h2 className="font-bold text-lg">Add New</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <Plus className="w-6 h-6 text-gray-500 rotate-45" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AddModal;

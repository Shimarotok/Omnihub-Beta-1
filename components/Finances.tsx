
import React, { useState } from 'react';
import { useStore } from './StoreContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Calendar, Plus, Edit2, Check } from 'lucide-react';

const Finances: React.FC = () => {
  const { state, deleteFinance, updateSettings } = useStore();
  const { currency, budgets } = state.settings;
  const [editingBudget, setEditingBudget] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  const [tempValue, setTempValue] = useState('');

  // Process data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayEntries = state.finances.filter(f => f.date === date);
    const spending = dayEntries.filter(f => f.type === 'spending').reduce((acc, f) => acc + f.amount, 0);
    const earning = dayEntries.filter(f => f.type === 'earning').reduce((acc, f) => acc + f.amount, 0);
    const label = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    return { date, label, spending, earning };
  });

  const today = new Date().toISOString().split('T')[0];
  const todaySpending = state.finances
    .filter(f => f.date === today && f.type === 'spending')
    .reduce((acc, f) => acc + f.amount, 0);

  const budgetUsage = Math.min((todaySpending / budgets.daily) * 100, 100);

  const handleStartEdit = (type: 'daily' | 'weekly' | 'monthly', val: number) => {
    setEditingBudget(type);
    setTempValue(val.toString());
  };

  const handleSaveBudget = () => {
    if (!editingBudget) return;
    const numVal = parseFloat(tempValue);
    if (!isNaN(numVal) && numVal >= 0) {
      updateSettings({
        budgets: {
          ...budgets,
          [editingBudget]: numVal
        }
      });
    }
    setEditingBudget(null);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black dark:text-white">Finances</h2>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Track and manage your limits.</p>
      </header>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 gap-4">
        {[
          { id: 'daily' as const, label: 'Daily Budget', val: budgets.daily, icon: <Wallet className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', usage: budgetUsage },
          { id: 'weekly' as const, label: 'Weekly Budget', val: budgets.weekly, icon: <TrendingUp className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
          { id: 'monthly' as const, label: 'Monthly Budget', val: budgets.monthly, icon: <Calendar className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' }
        ].map((item) => (
          <div 
            key={item.id}
            onClick={() => editingBudget !== item.id && handleStartEdit(item.id, item.val)}
            className={`bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all cursor-pointer group ${editingBudget === item.id ? 'ring-2 ring-blue-500 scale-[1.02]' : 'hover:shadow-md'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className={`p-3 ${item.bg} dark:bg-white/5 rounded-2xl`}>{item.icon}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{item.label}</span>
                <Edit2 className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              {editingBudget === item.id ? (
                <div className="flex items-center gap-2 w-full mt-2" onClick={e => e.stopPropagation()}>
                  <span className="text-xl font-black dark:text-white">{currency}</span>
                  <input 
                    autoFocus
                    type="number"
                    value={tempValue}
                    onChange={e => setTempValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveBudget()}
                    className="bg-gray-50 dark:bg-gray-800 border-none outline-none ring-2 ring-blue-100 dark:ring-blue-900/40 rounded-xl px-3 py-2 font-black text-xl w-32 dark:text-white"
                  />
                  <button onClick={handleSaveBudget} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-3xl font-black dark:text-white">
                  <span className="text-sm font-bold mr-0.5">{currency}</span>
                  {item.val}
                </div>
              )}
            </div>

            {item.id === 'daily' && (
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                  <span>Spent {currency} {todaySpending}</span>
                  <span className={item.usage > 90 ? 'text-red-500' : 'text-blue-500'}>{Math.round(item.usage)}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${item.usage > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${item.usage}%` }} 
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-black mb-6 dark:text-white">Cashflow Analysis</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:opacity-10" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc', opacity: 0.1 }}
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', background: '#111827', color: '#fff' }}
              />
              <Bar dataKey="earning" fill="#10b981" radius={[6, 6, 0, 0]} name="Earning" barSize={14} />
              <Bar dataKey="spending" fill="#ef4444" radius={[6, 6, 0, 0]} name="Spending" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent History */}
      <div className="space-y-4">
        <h3 className="text-lg font-black dark:text-white">Recent Transactions</h3>
        <div className="space-y-3">
          {state.finances.slice(0, 10).map(f => (
            <div key={f.id} className="flex items-center justify-between bg-white dark:bg-gray-900 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 group">
              <div className="flex items-center gap-4 text-left">
                <div className={`p-3 rounded-2xl ${f.type === 'earning' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                  {f.type === 'earning' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{f.category}</div>
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{f.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`font-black text-lg ${f.type === 'earning' ? 'text-green-600' : 'text-red-600'}`}>
                  {f.type === 'earning' ? '+' : '-'}{currency}{f.amount}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteFinance(f.id); }}
                  className="p-2 text-gray-200 dark:text-gray-800 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
            </div>
          ))}
          {state.finances.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white/50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold text-sm uppercase tracking-widest">No history found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finances;

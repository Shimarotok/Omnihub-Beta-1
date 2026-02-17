
import React from 'react';
import { useStore } from './StoreContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
// Added Plus icon to the import list
import { TrendingUp, TrendingDown, Wallet, Calendar, Plus } from 'lucide-react';

const Finances: React.FC = () => {
  const { state, deleteFinance } = useStore();
  const { currency, budgets } = state.settings;

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

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h2 className="text-2xl font-bold mb-4">Finances</h2>
      </header>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-50 rounded-xl"><Wallet className="w-5 h-5 text-blue-600" /></div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Budget</span>
          </div>
          <div className="text-2xl font-bold">{currency} {budgets.daily}</div>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Spent {currency} {todaySpending}</span>
              <span>{Math.round(budgetUsage)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${budgetUsage > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${budgetUsage}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-green-50 rounded-xl"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weekly Budget</span>
          </div>
          <div className="text-2xl font-bold">{currency} {budgets.weekly}</div>
          <p className="text-xs text-gray-400 mt-2 italic">Tracked across 7 rolling days</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-50 rounded-xl"><Calendar className="w-5 h-5 text-purple-600" /></div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Budget</span>
          </div>
          <div className="text-2xl font-bold">{currency} {budgets.monthly}</div>
          <p className="text-xs text-gray-400 mt-2 italic">Planning for the month ahead</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6">7-Day Income vs Spending</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="earning" fill="#10b981" radius={[4, 4, 0, 0]} name="Earning" barSize={12} />
              <Bar dataKey="spending" fill="#ef4444" radius={[4, 4, 0, 0]} name="Spending" barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent History */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold">Recent Transactions</h3>
        <div className="space-y-2">
          {state.finances.slice(0, 10).map(f => (
            <div key={f.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${f.type === 'earning' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {f.type === 'earning' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{f.category}</div>
                  <div className="text-xs text-gray-400">{f.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`font-bold ${f.type === 'earning' ? 'text-green-600' : 'text-red-600'}`}>
                  {f.type === 'earning' ? '+' : '-'}{currency}{f.amount}
                </div>
                <button 
                  onClick={() => deleteFinance(f.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>
            </div>
          ))}
          {state.finances.length === 0 && (
            <div className="text-center py-10 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              No transactions yet. Start by adding one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finances;

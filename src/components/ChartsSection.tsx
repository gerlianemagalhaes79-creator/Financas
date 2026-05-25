import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown, Landmark, Scale, AlertTriangle, ArrowRightLeft } from 'lucide-react';

interface ChartsSectionProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  allTransactions: Transaction[]; // Used for multi-month history aggregation
}

const COLORS = [
  '#f43f5e', // rose-500
  '#06b6d4', // cyan-500
  '#eab308', // yellow-500
  '#a855f7', // purple-500
  '#3b82f6', // blue-500
  '#f97316', // orange-500
  '#10b981', // emerald-500
  '#64748b', // slate-500
  '#ec4899', // pink-500
];

export default function ChartsSection({
  transactions,
  selectedMonth,
  selectedYear,
  allTransactions,
}: ChartsSectionProps) {
  
  // 1. Calculate Monthly Figures
  const monthlyIncomes = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = monthlyIncomes - monthlyExpenses;

  // 2. Aggregate current month's expenses by Category (for Pie Chart)
  const expenseByCategoryMap: { [category: string]: number } = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expenseByCategoryMap[t.category] = (expenseByCategoryMap[t.category] || 0) + t.amount;
    });

  const categoryData = Object.keys(expenseByCategoryMap).map(cat => ({
    name: cat,
    value: parseFloat(expenseByCategoryMap[cat].toFixed(2)),
  })).sort((a, b) => b.value - a.value);

  // 3. Aggregate 6-Month Comparison History (for Bar Chart)
  const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // We'll generate a list of the last 6 months including selected month
  const historyData = [];
  for (let i = 5; i >= 0; i--) {
    let targetMonth = selectedMonth - i;
    let targetYear = selectedYear;
    if (targetMonth < 0) {
      targetMonth += 12;
      targetYear -= 1;
    }
    
    const monthKey = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
    
    // Filter all transactions belonging to this targetYear/targetMonth
    const monthTx = allTransactions.filter(t => t.date.startsWith(monthKey));
    
    const inc = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const exp = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const bal = inc - exp;

    historyData.push({
      name: `${MONTHS_SHORT[targetMonth]} ${String(targetYear).substring(2)}`,
      Receitas: parseFloat(inc.toFixed(2)),
      Despesas: parseFloat(exp.toFixed(2)),
      Saldo: parseFloat(bal.toFixed(2)),
    });
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Summary Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Receitas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Entradas / Receitas</span>
            <span className="text-xl font-extrabold text-emerald-500 truncate block">
              + R$ {monthlyIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-500 shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Saídas / Despesas</span>
            <span className="text-xl font-extrabold text-red-500 truncate block">
              - R$ {monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-500 shadow-sm">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Saldo Final */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Saldo do Mês</span>
            <span className={`text-xl font-extrabold truncate block ${netBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className={`p-3 rounded-xl shadow-sm ${
            netBalance >= 0 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' 
              : 'bg-red-50 dark:bg-red-950/30 text-red-500'
          }`}>
            <Scale className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Graphical Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income vs Expenses Comparer Chart  */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-[340px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
            Histórico Mensal (Últimos 6 Meses)
          </h3>
          <div className="flex-1 w-full text-xs min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={historyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-10 opacity-60" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px',
                    border: 'none',
                    color: '#f8fafc'
                  }} 
                  formatter={(value: any) => [`R$ ${parseFloat(value).toLocaleString('pt-BR')}`]}
                />
                <Legend iconType="circle" />
                <Bar name="Entradas" dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Saídas" dataKey="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Expenses Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-[340px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Distribuição de Despesas do Mês
          </h3>
          {categoryData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/10 rounded-xl border border-dashed border-slate-200/50 dark:border-slate-800">
              <AlertTriangle className="w-6 h-6 text-slate-300 dark:text-slate-700 mb-1.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nenhuma despesa para exibir no gráfico</p>
              <p className="text-[10px] text-slate-400 mt-0.5"> Lance compras ou pague contas fixas para renderizar o gráfico por categoria.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 min-h-0">
              {/* Pie Section */}
              <div className="w-full sm:w-1/2 h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderRadius: '12px',
                        border: 'none',
                        color: '#f8fafc'
                      }}
                      formatter={(value: any) => [`R$ ${parseFloat(value).toLocaleString('pt-BR')}`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Static indicator inside Donut hole */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                  <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                    R$ {monthlyExpenses.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Legends Section */}
              <div className="w-full sm:w-1/2 p-1 overflow-y-auto max-h-[220px] text-xs space-y-1.5">
                {categoryData.map((item, index) => {
                  const percentage = Math.round((item.value / monthlyExpenses) * 100);
                  return (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-450 font-bold min-w-[28px]">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

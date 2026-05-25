import React, { useState } from 'react';
import { FixedBill } from '../types';
import { Landmark, CalendarDays, Plus, Trash2, CheckCircle, Clock, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

interface FixedBillsSectionProps {
  bills: FixedBill[];
  selectedMonth: number;
  selectedYear: number;
  onAddBill: (bill: Omit<FixedBill, 'id' | 'ownerId' | 'createdAt'>) => void;
  onDeleteBill: (id: string) => void;
  onQuickPay: (bill: FixedBill) => void;
  paidBillIds: string[]; // IDs of fixed bills paid in this specific month
}

const CATEGORIES_PT = [
  'Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Outros', 'Recebimento'
];

export default function FixedBillsSection({
  bills,
  selectedMonth,
  selectedYear,
  onAddBill,
  onDeleteBill,
  onQuickPay,
  paidBillIds,
}: FixedBillsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [dueDateStr, setDueDateStr] = useState('10');
  const [category, setCategory] = useState('Moradia');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return setErrorMsg('Insira uma descrição');
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return setErrorMsg('O valor deve ser maior que zero');
    
    const dueDate = parseInt(dueDateStr);
    if (isNaN(dueDate) || dueDate < 1 || dueDate > 31) return setErrorMsg('Dia de vencimento inválido (1-31)');

    onAddBill({
      description: description.trim(),
      amount,
      type,
      dueDate,
      category,
    });

    setDescription('');
    setAmountStr('');
    setType('expense');
    setDueDateStr('10');
    setCategory('Moradia');
    setErrorMsg('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-500" />
            Minhas Contas Fixas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Custos e receitas recorrentes que ocorrem mensalmente.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-all border border-emerald-100/50 dark:border-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center justify-between">
            Nova Conta Fixa Recorrente
            <button
              type="button"
              onClick={() => { setIsAdding(false); setErrorMsg(''); }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Cancelar
            </button>
          </h3>

          {errorMsg && (
            <div className="mb-3.5 p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950 text-xs rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Aluguel, Plano de Internet, Academia, Salário"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm p-2 bg-white dark:bg-slate-850 hover:border-slate-300 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => {
                  const val = e.target.value as 'expense' | 'income';
                  setType(val);
                  if (val === 'income') setCategory('Recebimento');
                  else setCategory('Moradia');
                }}
                className="w-full text-sm p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="expense">Despesa (Pagar)</option>
                <option value="income">Receita (Receber)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 1200"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full text-sm p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Dia Vencimento</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full text-sm p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 text-center focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
              >
                {type === 'income' ? (
                  <>
                    <option value="Salário">Salário</option>
                    <option value="Investimentos">Investimentos</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Recebimento">Recebimento Geral</option>
                  </>
                ) : (
                  CATEGORIES_PT.filter(c => c !== 'Recebimento').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md shadow-emerald-500/10 transition-all text-sm cursor-pointer"
          >
            Cadastrar Conta Fixa
          </button>
        </form>
      )}

      {/* Bills List */}
      {bills.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/50 flex flex-col items-center justify-center">
          <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-755 mb-2" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nenhuma conta fixa</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Insira despesas ou receitas recorrentes que se repetem todo mês.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {bills.map((bill) => {
            const isPaid = paidBillIds.includes(bill.id);
            const isExpense = bill.type === 'expense';

            return (
              <div
                key={bill.id}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${
                    isExpense 
                      ? 'bg-red-50 dark:bg-red-950/45 text-red-600 dark:text-red-400' 
                      : 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 leading-tight">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {bill.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {bill.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Dia {bill.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4 shrink-0">
                  <div>
                    <p className={`text-sm font-bold ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                      {isExpense ? '-' : '+'} R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 justify-end font-medium">
                      {isPaid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider text-[9px]">Lançado</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-amber-500 font-semibold uppercase tracking-wider text-[9px]">Pendente</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isPaid && (
                      <button
                        onClick={() => onQuickPay(bill)}
                        className="p-1 px-2.5 text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm transition-all cursor-pointer"
                        title={isExpense ? "Pagar Conta" : "Receber Valor"}
                      >
                        {isExpense ? 'Lançar' : 'Lançar'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Excluir conta corrente fixa "${bill.description}"?`)) {
                          onDeleteBill(bill.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      title="Excluir Conta Fixa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Support for checkcircle2 custom icon logic since lucide-react loads checkcircle2
import { CheckCircle2 } from 'lucide-react';

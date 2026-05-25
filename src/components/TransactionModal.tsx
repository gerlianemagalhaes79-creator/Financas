import React, { useState, useEffect } from 'react';
import { CreditCard, Transaction } from '../types';
import { X, Calendar, DollarSign, Tag, CircleSlash, ArrowRightLeft, AlertCircle } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  preSelectedCardId: string | null;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'ownerId' | 'createdAt'>) => void;
  selectedMonth: number;
  selectedYear: number;
}

const CATEGORIES_EXPENSE = [
  'Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Assinaturas', 'Compras', 'Outros'
];

const CATEGORIES_INCOME = [
  'Salário', 'Investimentos', 'Freelance', 'Prêmio', 'Recebimento Geral'
];

export default function TransactionModal({
  isOpen,
  onClose,
  cards,
  preSelectedCardId,
  onAddTransaction,
  selectedMonth,
  selectedYear,
}: TransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [cardId, setCardId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar data inicial com o mês/ano selecionado no cabeçalho para evitar erros de ano/mês distantes
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      let dayStr = String(today.getDate()).padStart(2, '0');
      let mStr = String(selectedMonth + 1).padStart(2, '0');
      let yStr = String(selectedYear);
      
      // Se for o mesmo ano/mês selecionado, usa o dia atual, senão o primeiro dia do mês
      if (selectedMonth === currentMonth && selectedYear === currentYear) {
        setDate(`${yStr}-${mStr}-${dayStr}`);
      } else {
        setDate(`${yStr}-${mStr}-01`);
      }

      if (preSelectedCardId) {
        setCardId(preSelectedCardId);
        setType('expense');
        setCategory('Compras');
      } else {
        setCardId(null);
        setType('expense');
        setCategory('Alimentação');
      }
      
      setDescription('');
      setAmountStr('');
      setErrorMsg('');
    }
  }, [isOpen, preSelectedCardId, selectedMonth, selectedYear]);

  // Se o tipo mudar, reseta categoria
  useEffect(() => {
    if (type === 'income') {
      setCategory('Salário');
      setCardId(null); // Cartão de crédito geralmente não recebe receitas de fluxo de caixa direto
    } else {
      setCategory('Alimentação');
    }
  }, [type]);

  // Se cartão de crédito for selecionado, o tipo deve ser obrigatoriamente despesa
  useEffect(() => {
    if (cardId) {
      setType('expense');
    }
  }, [cardId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return setErrorMsg('Insira uma descrição');
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return setErrorMsg('O valor deve ser maior que zero');
    if (!date) return setErrorMsg('Selecione uma data');

    onAddTransaction({
      description: description.trim(),
      amount,
      type,
      date,
      category,
      cardId: cardId === 'none' ? null : cardId,
      billId: null, // transações padrão não estão atreladas a uma conta fixa diretamente na criação normal
      isPaid: cardId ? false : isPaid, // compra no cartão é faturamento pendente até o pagamento da fatura
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-500" />
              Lançar Transação
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {preSelectedCardId ? 'Adicionando despesa ao cartão selecionado' : 'Registre uma despesa ou receita'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-150 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950 text-xs rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}

          {/* Type Choice - Incomes vs Expense */}
          {!preSelectedCardId && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Fluxo de Caixa</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    type === 'expense' 
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 scale-[1.02] shadow-sm' 
                      : 'bg-white dark:bg-slate-850 hover:bg-slate-50 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-850'
                  }`}
                >
                  Despesa (-)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCardId(null);
                  }}
                  className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    type === 'income' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 scale-[1.02] shadow-sm' 
                      : 'bg-white dark:bg-slate-850 hover:bg-slate-50 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-850'
                  }`}
                >
                  Receita (+)
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Supermercado, Almoço de domingo, Gasolina"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm p-3 bg-slate-50 hover:bg-slate-100 focus:bg-white dark:bg-slate-850 dark:hover:bg-slate-800/80 dark:focus:bg-slate-850 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Valor (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full text-sm p-3 pl-8 bg-slate-50 hover:bg-slate-100 focus:bg-white dark:bg-slate-850 dark:hover:bg-slate-800/80 dark:focus:bg-slate-850 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 transition-all font-bold"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm p-3 bg-slate-50 hover:bg-slate-100 focus:bg-white dark:bg-slate-850 dark:hover:bg-slate-800/80 dark:focus:bg-slate-850 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Credit Card selector (Only for Expenses) */}
          {type === 'expense' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Meio de Pagamento / Cartão</label>
              <select
                value={cardId || 'none'}
                onChange={(e) => setCardId(e.target.value === 'none' ? null : e.target.value)}
                className="w-full text-sm p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 transition-all cursor-pointer font-medium"
              >
                <option value="none">Dinheiro / Débito / Pix</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    💳 {card.name} (•••• {card.last4})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 transition-all cursor-pointer font-medium"
              >
                {type === 'expense' 
                  ? CATEGORIES_EXPENSE.map(cat => <option key={cat} value={cat}>{cat}</option>)
                  : CATEGORIES_INCOME.map(cat => <option key={cat} value={cat}>{cat}</option>)
                }
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm mt-2 cursor-pointer"
          >
            Confirmar Lançamento
          </button>
        </form>
      </div>
    </div>
  );
}

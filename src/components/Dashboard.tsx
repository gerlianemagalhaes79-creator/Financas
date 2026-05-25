import { useState } from 'react';
import { CreditCard, FixedBill, Transaction } from '../types';
import CreditCardSection from './CreditCardSection';
import FixedBillsSection from './FixedBillsSection';
import ChartsSection from './ChartsSection';
import TransactionModal from './TransactionModal';
import { 
  ArrowRightLeft, Plus, CalendarDays, Search, Trash2, Tag, CreditCard as CardIcon, 
  HelpCircle, AlertCircle, Sparkles, Filter, FileText, CheckCircle, Wallet
} from 'lucide-react';

interface DashboardProps {
  cards: CreditCard[];
  bills: FixedBill[];
  transactions: Transaction[];
  onAddCard: (card: Omit<CreditCard, 'id' | 'ownerId' | 'createdAt'>) => void;
  onDeleteCard: (id: string) => void;
  onAddBill: (bill: Omit<FixedBill, 'id' | 'ownerId' | 'createdAt'>) => void;
  onDeleteBill: (id: string) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'ownerId' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
  selectedMonth: number;
  selectedYear: number;
}

export default function Dashboard({
  cards,
  bills,
  transactions,
  onAddCard,
  onDeleteCard,
  onAddBill,
  onDeleteBill,
  onAddTransaction,
  onDeleteTransaction,
  selectedMonth,
  selectedYear,
}: DashboardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // 1. Filter Transactions according to selected Month and Year (YYYY-MM)
  const monthString = String(selectedMonth + 1).padStart(2, '0');
  const targetYearMonth = `${selectedYear}-${monthString}`;
  
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(targetYearMonth));

  // 2. Card specific monthly calculations.
  // We sum transactions falling inside this month's credit card invoice faturamento.
  const monthlyCardExpenses: { [cardId: string]: number } = {};
  cards.forEach(card => {
    // Standard simplistic calculation: transactions belonging to this card in this calendar month
    const cardTx = currentMonthTransactions.filter(t => t.cardId === card.id);
    const sum = cardTx.reduce((acc, t) => acc + t.amount, 0);
    monthlyCardExpenses[card.id] = sum;
  });

  // 3. Paid fixed bills tracking logic
  // A fixed bill is paid if a transaction in this selectedMonth belongs to it (has billId === bill.id)
  const paidFixedBillIdsForMonth = currentMonthTransactions
    .filter(t => t.billId !== null)
    .map(t => t.billId as string);

  // 4. Handle quick-payment of a fixed bill
  const handleQuickPay = (bill: FixedBill) => {
    // Create a transaction replicating the fixed bill parameters
    const dateFormatted = `${selectedYear}-${monthString}-${String(bill.dueDate).padStart(2, '0')}`;
    onAddTransaction({
      description: `Conta: ${bill.description}`,
      amount: bill.amount,
      type: bill.type,
      date: dateFormatted,
      category: bill.category,
      cardId: null, // Fixed bills are usually paid cash/Pix/debit, not credit card directly
      billId: bill.id, // Linked to track as Paid
      isPaid: true
    });
  };

  // 5. Apply filters on current month transactions for the logged list
  let filteredTransactions = currentMonthTransactions;
  
  if (selectedCardId) {
    // If a credit card is selected, filter specifically by that card!
    filteredTransactions = filteredTransactions.filter(t => t.cardId === selectedCardId);
  }

  if (searchTerm.trim()) {
    const s = searchTerm.toLowerCase();
    filteredTransactions = filteredTransactions.filter(t => 
      t.description.toLowerCase().includes(s) || 
      t.category.toLowerCase().includes(s)
    );
  }

  if (selectedCategoryFilter !== 'All') {
    filteredTransactions = filteredTransactions.filter(t => t.category === selectedCategoryFilter);
  }

  // Get unique categories of the raw currentMonthTransactions for quick filter tags
  const activeCategories = Array.from(new Set(currentMonthTransactions.map(t => t.category)));

  // Selected Card Metadata
  const activeCard = cards.find(c => c.id === selectedCardId);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      
      {/* Dynamic Alert Banner when single Credit Card is selected */}
      {selectedCardId && activeCard && (
        <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-450 rounded-2xl border border-emerald-500/20 dark:border-emerald-550/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-emerald-400 rounded-xl text-white">
              <CardIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Filtro Ativado: Fatura de {activeCard.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">
                Exibindo apenas despesas realizadas no cartão final <strong>{activeCard.last4}</strong> neste mês.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setModalOpen(true)}
              className="flex-1 sm:flex-none p-2 px-4 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-650 dark:hover:bg-emerald-600 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              Adicionar Compra no {activeCard.name}
            </button>
            <button
              onClick={() => setSelectedCardId(null)}
              className="p-2 px-3 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-700/60 rounded-xl transition-all cursor-pointer"
            >
              Limpar Filtro
            </button>
          </div>
        </div>
      )}

      {/* Primary Column section - Credit Cards and Fixed Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Credit Cards (8 cols on lg) */}
        <div className="lg:col-span-6 space-y-6">
          <CreditCardSection 
            cards={cards}
            selectedCardId={selectedCardId}
            onSelectCard={setSelectedCardId}
            onAddCard={onAddCard}
            onDeleteCard={onDeleteCard}
            monthlyCardExpenses={monthlyCardExpenses}
          />
        </div>

        {/* Right Column: Fixed Bills (4 cols on lg) */}
        <div className="lg:col-span-6 space-y-6">
          <FixedBillsSection 
            bills={bills}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onAddBill={onAddBill}
            onDeleteBill={onDeleteBill}
            onQuickPay={handleQuickPay}
            paidBillIds={paidFixedBillIdsForMonth}
          />
        </div>
      </div>

      {/* Secondary section: Charts dashboard */}
      <ChartsSection 
        transactions={currentMonthTransactions}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        allTransactions={transactions}
      />

      {/* Tertiary section: Main transactional records list logger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
        
        {/* Title and trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-500" />
              Lançamentos de {targetYearMonth}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Histórico detalhado do fluxo financeiro do mês (Dinheiro, Débito e Cartões).
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-1.5 p-3 px-4 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar Transação
          </button>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Quick Category filter button */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all cursor-pointer font-medium"
            >
              <option value="All">Todas as Categorias</option>
              {activeCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions list layout */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/50 flex flex-col items-center justify-center">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-750 mb-2.5" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nenhum lançamento encontrado</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
              Registre despesas ou pagamentos para alimentar os relatórios deste mês. 
              {selectedCardId && ' Verifique se há gastos especificamente nesta fatura de cartão.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-100 dark:border-slate-850 rounded-xl">
            {/* Desktop Table View (Hidden on mobile) */}
            <table className="hidden md:table min-w-full divide-y divide-slate-100 dark:divide-slate-850 text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoria / Meio</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 align-middle text-right uppercase tracking-wider">Valor</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-450 text-center uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                {filteredTransactions.map((tx) => {
                  const txCard = cards.find(c => c.id === tx.cardId);
                  const isExpense = tx.type === 'expense';
                  
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-850/20 transition-all font-medium text-slate-700 dark:text-slate-300 text-xs">
                      {/* Description */}
                      <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {tx.description}
                      </td>
                      {/* Category and Mode */}
                      <td className="px-5 py-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-600 dark:text-slate-400">
                            {tx.category}
                          </span>
                          
                          {txCard ? (
                            <span className="px-2 py-0.5 rounded-md bg-violet-500/10 dark:bg-violet-500/5 font-bold text-[10px] text-violet-600 dark:text-violet-400 border border-violet-500/10 flex items-center gap-1">
                              <CardIcon className="w-3 h-3" />
                              {txCard.name}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-500 dark:text-slate-400">
                              💵 Dinheiro/Pix
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-5 py-3.5 font-mono text-slate-400">
                        {tx.date.split('-').reverse().join('/')}
                      </td>
                      {/* Paid Status */}
                      <td className="px-5 py-3.5">
                        {tx.isPaid ? (
                          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/5 w-fit px-2 py-0.5 rounded-md">
                            ● PAGO
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/5 w-fit px-2 py-0.5 rounded-md font-sans">
                            ● FATURADO
                          </span>
                        )}
                      </td>
                      {/* Amount */}
                      <td className={`px-5 py-3.5 text-right font-bold text-sm ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isExpense ? '-' : '+'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      {/* Deletes */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer hover:scale-110 active:scale-90"
                          title="Excluir Lançamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards Stack View (Hidden on large viewports) */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-850">
              {filteredTransactions.map((tx) => {
                const txCard = cards.find(c => c.id === tx.cardId);
                const isExpense = tx.type === 'expense';

                return (
                  <div key={tx.id} className="p-4 bg-white dark:bg-slate-900 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{tx.description}</p>
                        <p className="text-[10px] text-slate-405 font-mono">{tx.date.split('-').reverse().join('/')}</p>
                      </div>
                      <span className={`text-base font-bold shrink-0 ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isExpense ? '-' : '+'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-650 dark:text-slate-400">
                          {tx.category}
                        </span>
                        
                        {txCard ? (
                          <span className="px-2 py-0.5 rounded-md bg-violet-500/10 dark:bg-violet-555/5 font-bold text-[10px] text-violet-600 dark:text-violet-400 border border-violet-500/10 flex items-center gap-1">
                            💳 {txCard.name}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-105 dark:bg-slate-800 font-bold text-[10px] text-slate-500 dark:text-slate-400">
                            💵 Pix/Dinheiro
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {tx.isPaid ? (
                          <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 dark:bg-emerald-500/5 px-1.5 py-0.5 rounded-md">
                            PAGO
                          </span>
                        ) : (
                          <span className="text-[9px] text-amber-500 font-bold bg-amber-500/10 dark:bg-amber-550/5 px-1.5 py-0.5 rounded-md">
                            FATURADO
                          </span>
                        )}

                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 px-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 transition-all cursor-pointer hover:scale-105 active:scale-95"
                          title="Excluir Lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Entry Modal popup integration */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cards={cards}
        preSelectedCardId={selectedCardId}
        onAddTransaction={onAddTransaction}
        onAddBill={onAddBill}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

    </main>
  );
}

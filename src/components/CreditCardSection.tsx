import React, { useState } from 'react';
import { CreditCard as CardType } from '../types';
import { CreditCard as CardIcon, Plus, Trash2, Check, AlertCircle, ShoppingBag, Landmark } from 'lucide-react';

interface CreditCardSectionProps {
  cards: CardType[];
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onAddCard: (card: Omit<CardType, 'id' | 'ownerId' | 'createdAt'>) => void;
  onDeleteCard: (id: string) => void;
  monthlyCardExpenses: { [cardId: string]: number };
}

const PALETTE = [
  { name: 'Roxo (Nubank)', bg: 'bg-violet-600 dark:bg-violet-750', text: 'text-white', hex: '#7c3aed' },
  { name: 'Laranja (Itaú)', bg: 'bg-orange-500 dark:bg-orange-600', text: 'text-white', hex: '#f97316' },
  { name: 'Azul (C6/BB)', bg: 'bg-blue-600 dark:bg-blue-750', text: 'text-white', hex: '#2563eb' },
  { name: 'Verde (Sicredi/Crefisa)', bg: 'bg-emerald-600 dark:bg-emerald-700 border border-emerald-500/10', text: 'text-white', hex: '#059669' },
  { name: 'Grafite (Black)', bg: 'bg-slate-800 dark:bg-slate-900 border border-slate-700/50', text: 'text-white', hex: '#1e293b' },
  { name: 'Vermelho (Santander)', bg: 'bg-rose-600 dark:bg-rose-700', text: 'text-white', hex: '#e11d48' },
];

export default function CreditCardSection({
  cards,
  selectedCardId,
  onSelectCard,
  onAddCard,
  onDeleteCard,
  monthlyCardExpenses,
}: CreditCardSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [limitStr, setLimitStr] = useState('');
  const [closingDayStr, setClosingDayStr] = useState('5');
  const [dueDayStr, setDueDayStr] = useState('12');
  const [color, setColor] = useState('bg-violet-600 dark:bg-violet-750');
  const [last4, setLast4] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg('Insira o nome do cartão');
    
    const limit = parseFloat(limitStr);
    if (isNaN(limit) || limit <= 0) return setErrorMsg('O limite deve ser maior que zero');
    
    const closingDay = parseInt(closingDayStr);
    const dueDay = parseInt(dueDayStr);
    if (isNaN(closingDay) || closingDay < 1 || closingDay > 31) return setErrorMsg('Dia de fechamento inválido (1-31)');
    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) return setErrorMsg('Dia de vencimento inválido (1-31)');

    const digits = last4.replace(/\D/g, '');
    if (digits.length !== 4) return setErrorMsg('Os últimos 4 dígitos devem conter exatamente 4 números');

    onAddCard({
      name: name.trim(),
      limit,
      closingDay,
      dueDay,
      color,
      last4: digits,
    });

    // Reset Form
    setName('');
    setLimitStr('');
    setClosingDayStr('5');
    setDueDayStr('12');
    setColor('bg-violet-600 dark:bg-violet-750');
    setLast4('');
    setErrorMsg('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CardIcon className="w-5 h-5 text-emerald-500" />
            Meus Cartões de Crédito
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Clique no cartão para abrir a fatura e lançar despesas de forma rápida.
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
            Novo Cartão de Crédito
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
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Nome do Cartão (ex: Nubank)</label>
              <input
                type="text"
                placeholder="Ex: Nubank Visa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm p-2 bg-white dark:bg-slate-850 hover:border-slate-300 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Limite total (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 5000"
                value={limitStr}
                onChange={(e) => setLimitStr(e.target.value)}
                className="w-full text-sm p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Últimos 4 dígitos</label>
              <input
                type="text"
                maxLength={4}
                placeholder="Ex: 4321"
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, ''))}
                className="w-full text-sm p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 text-center font-mono focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Fechamento (Dia)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={closingDayStr}
                onChange={(e) => setClosingDayStr(e.target.value)}
                className="w-full text-sm p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 text-center focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Vencimento (Dia)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDayStr}
                onChange={(e) => setDueDayStr(e.target.value)}
                className="w-full text-sm p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 text-center focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">Selecione uma Cor / Estilo</label>
              <div className="flex flex-wrap gap-2">
                {PALETTE.map((colorItem) => (
                  <button
                    key={colorItem.hex}
                    type="button"
                    onClick={() => setColor(colorItem.bg)}
                    className={`w-8 h-8 rounded-full ${colorItem.bg} ring-offset-2 ring-emerald-500 transition-all flex items-center justify-center`}
                  >
                    {color === colorItem.bg && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 shadow-md shadow-emerald-500/10 transition-all text-sm cursor-pointer"
          >
            Cadastrar Cartão
          </button>
        </form>
      )}

      {/* Cards list */}
      {cards.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/50 flex flex-col items-center justify-center">
          <CardIcon className="w-8 h-8 text-slate-300 dark:text-slate-750 mb-2" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nenhum cartão adicionado</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Cadastre seus cartões para organizar gastos faturados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => {
            const expenseSum = monthlyCardExpenses[card.id] || 0;
            const availableLimit = Math.max(0, card.limit - expenseSum);
            const percentage = Math.min(100, Math.round((expenseSum / card.limit) * 100));
            const isSelected = selectedCardId === card.id;

            return (
              <div
                key={card.id}
                onClick={() => onSelectCard(isSelected ? null : card.id)}
                className={`group relative overflow-hidden rounded-2xl p-5 cursor-pointer text-left transition-all duration-300 transform border select-none ${
                  card.color
                } ${
                  isSelected 
                    ? 'ring-4 ring-emerald-500 dark:ring-emerald-400/80 scale-[1.02] shadow-xl' 
                    : 'shadow-md hover:scale-[1.01] hover:shadow-lg border-transparent'
                }`}
              >
                {/* Visual Card details (chip details, last4) */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-white drop-shadow-sm truncate pr-8 max-w-[160px]">
                      {card.name}
                    </h4>
                    <p className="text-[10px] text-white/70 font-mono tracking-wider mt-0.5">
                      •••• •••• •••• {card.last4}
                    </p>
                  </div>
                  {/* Miniature Simcard Chip */}
                  <div className="w-8 h-6 bg-amber-300/85 rounded-md relative border border-amber-400/30 shadow-inner overflow-hidden flex flex-col justify-between p-1">
                    <div className="grid grid-cols-3 gap-[1px] h-full w-full opacity-60">
                      <div className="border border-amber-950/20 rounded-[1px]"></div>
                      <div className="border border-amber-950/20 rounded-[1px]"></div>
                      <div className="border border-amber-950/20 rounded-[1px]"></div>
                      <div className="border border-amber-950/20 rounded-[1px]"></div>
                      <div className="border border-amber-950/20 rounded-[1px]"></div>
                      <div className="border border-amber-950/20 rounded-[1px]"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-white/70 block uppercase tracking-wide">Fatura Atual</span>
                    <span className="text-lg font-extrabold text-white">
                      R$ {expenseSum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/70 block uppercase tracking-wide">Limite Disp.</span>
                    <span className="text-xs font-semibold text-white/90">
                      R$ {availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-black/15 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        percentage > 85 ? 'bg-red-400' : 'bg-emerald-300'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] text-white/60">
                      Uso de limite: {percentage}%
                    </span>
                    <span className="text-[9px] text-white/60">
                      Vence dia {card.dueDay} • Fecha dia {card.closingDay}
                    </span>
                  </div>
                </div>

                {/* Delete button (only visible when in group-hover or if selected) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Excluir o cartão "${card.name}"? Isso não afetará as transações já registradas, mas elas perderão o vínculo com o cartão.`)) {
                      onDeleteCard(card.id);
                    }
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/25 opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:scale-115 text-white/90 transition-all duration-200"
                  title="Excluir Cartão"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { Sun, Moon, LogOut, Wallet, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface DashboardHeaderProps {
  user: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null;
  isGuest: boolean;
  onLogout: () => void;
  selectedMonth: number; // 0-11
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function DashboardHeader({
  user,
  isGuest,
  onLogout,
  selectedMonth,
  selectedYear,
  onMonthChange,
  isDarkMode,
  onToggleTheme
}: DashboardHeaderProps) {
  
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      onMonthChange(11, selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      onMonthChange(0, selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1, selectedYear);
    }
  };

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Finanças <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-medium">Pro</span>
            </h1>
          </div>
        </div>

        {/* Center: Month Navigator */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner select-none">
          <button 
            onClick={handlePrevMonth}
            className="p-1 px-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 px-4 min-w-[130px] text-center">
            {MONTHS_PT[selectedMonth]} de {selectedYear}
          </span>
          
          <button 
            onClick={handleNextMonth}
            className="p-1 px-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
            title="Próximo Mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right Side: Theme, User Profile */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all"
            title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    referrerPolicy="no-referrer"
                    alt={user.displayName || 'User'} 
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 shadow"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm">
                    {user.displayName ? user.displayName.charAt(0) : 'U'}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                    {user.displayName || 'Utilizador'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    Nuvem Ativa
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Modo Convidado
                  </p>
                  <p className="text-[10px] text-amber-500 font-medium">
                    Salvo Localmente
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              className="p-2 ml-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}

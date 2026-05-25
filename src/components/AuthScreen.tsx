import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, handleFirestoreError } from '../firebase';
import { Wallet, Sparkles, Shield, RefreshCw, Layers, LayoutGrid, CheckCircle } from 'lucide-react';

interface AuthScreenProps {
  onContinueAsGuest: () => void;
  isDarkMode: boolean;
}

export default function AuthScreen({ onContinueAsGuest, isDarkMode }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      // Sugerido login via popup por conta do ambiente de iframe do AI Studio
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google authentication error:", err);
      // Se der erro por bloqueio de popup de iframe, orientamos o modo visitante ou abrir em nova aba
      setError(
        'Falha no login com Google. Popups podem estar bloqueados no iframe. Por favor, tente o "Modo Visitante" abaixo ou use em tela cheia.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      
      {/* Decorative ambient subtle background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[25%] w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-[20%] right-[25%] w-[400px] h-[400px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full filter blur-[100px]" />
      </div>

      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Side: Brand presentation (Hidden on mobile) */}
        <div className="hidden md:flex md:col-span-7 bg-slate-900 relative p-12 flex-col justify-between overflow-hidden">
          {/* Subtle line designs */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-slate-900 to-slate-900 z-0" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[60px] translate-x-12 -translate-y-12" />
          
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">Finanças Pro</span>
          </div>

          <div className="relative z-10 space-y-6 my-auto">
            <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
              Tome o controle definitivo de suas <span className="text-emerald-400">finanças</span> com elegância.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Adicione cartões de crédito com fechamento inteligente, organize suas contas fixas mensais de modo recorrente e acompanhe seu saldo em tempo real com gráficos interativos.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="p-1 px-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-350 font-medium">Controle de faturas de cartões de crédito</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 px-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-350 font-medium">Fluxo de Caixa e Agendador de Contas Fixas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 px-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-350 font-medium">Relatórios visuais inteligentes</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-450 font-mono flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Segurança autenticada por servidores Google
          </div>
        </div>

        {/* Right Side: Login & Actions */}
        <div className="col-span-12 md:col-span-5 p-8 sm:p-12 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <div className="md:hidden flex justify-center mb-4">
              <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl shadow-emerald-500/20">
                <Wallet className="w-7 h-7" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Boas-vindas!
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Escolha uma forma de acesso para começar a organizar seu caixa.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/20 text-red-655 dark:text-red-400 border border-thin border-red-100 dark:border-red-950 text-xs rounded-xl flex items-start gap-2 text-left leading-tight">
              <span className="shrink-0 font-bold">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Google Authentication Trigger */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 p-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-700 shadow-sm font-bold text-sm transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.123C18.29 1.19 15.447 0 12.24 0 5.48 0 0 5.37 0 12s5.48 12 12.24 12c7.05 0 11.75-4.82 11.75-11.66 0-.79-.08-1.39-.24-2.055H12.24z"
                  />
                </svg>
              )}
              Sincronizar com Google
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <hr className="flex-grow border-slate-200 dark:border-slate-800" />
              <span className="px-3 text-[10px] text-slate-450 font-bold uppercase tracking-wider">ou continue localmente</span>
              <hr className="flex-grow border-slate-200 dark:border-slate-800" />
            </div>

            {/* Continue as Guest Trigger */}
            <button
              onClick={onContinueAsGuest}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/10 font-bold text-sm transition-all focus:outline-none flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Acessar como Visitante (Offline)
            </button>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400">
            <p>Ao acessar, seus dados serão guardados na nuvem ou em seu navegador de forma privada.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

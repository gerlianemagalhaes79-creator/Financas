import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  Wallet, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  ExternalLink 
} from 'lucide-react';

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
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google authentication error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError(
          'O pop-up de login foi bloqueado pelo seu navegador. Por favor, autorize e permita os pop-ups para este site e clique em entrar novamente.'
        );
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(
          'Este domínio atual não está autorizado nos domínios do Firebase Authentication. Adicione-o nas configurações do painel Firebase.'
        );
      } else {
        setError(
          `Falha de autenticação com o Google: ${err.message || err.code || 'Erro desconhecido.'}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      
      {/* Decorative ambient subtle background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" id="auth-ambient-glows">
        <div className="absolute top-[20%] left-[25%] w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-[20%] right-[25%] w-[400px] h-[400px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full filter blur-[100px]" />
      </div>

      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12" id="auth-main-card">
        
        {/* Left Side: Brand presentation (Hidden on mobile) */}
        <div className="hidden md:flex md:col-span-6 bg-slate-900 relative p-10 flex-col justify-between overflow-hidden" id="auth-brand-panel">
          {/* Subtle line designs */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-slate-900 to-slate-900 z-0" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[60px] translate-x-12 -translate-y-12" />
          
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">Finanças Pro</span>
          </div>

          <div className="relative z-10 space-y-5 my-auto">
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight">
              Tome o controle definitivo de suas <span className="text-emerald-400">finanças</span> com elegância.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Adicione cartões de crédito com fechamento inteligente, organize suas contas fixas de modo recorrente e acompanhe seu saldo em tempo real com gráficos interativos.
            </p>

            <div className="space-y-3.5 pt-4">
              <div className="flex items-center gap-3">
                <div className="p-1 px-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-slate-300 font-medium">Controle de faturas de cartões de crédito</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 px-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-slate-300 font-medium">Fluxo de Caixa e Agendador de Contas Fixas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 px-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-slate-300 font-medium">Relatórios visuais inteligentes</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-slate-400 font-mono flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-450" />
            Segurança autenticada por servidores Google
          </div>
        </div>

        {/* Right Side: Google Login */}
        <div className="col-span-12 md:col-span-6 p-8 sm:p-12 flex flex-col justify-center" id="auth-actions-panel">
          <div className="text-center md:text-left mb-8">
            <div className="md:hidden flex justify-center mb-4">
              <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl shadow-emerald-500/20">
                <Wallet className="w-7 h-7" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-850 dark:text-slate-100 tracking-tight">
              Acesse sua Conta
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-sm mx-auto md:mx-0">
              Conecte-se com sua Conta Google para sincronizar automaticamente seus lançamentos, cartões e contas salvas.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-850 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 text-xs rounded-xl flex items-start gap-2 text-left leading-relaxed animate-fade-in" id="auth-error-banner">
              <span className="shrink-0 font-bold text-amber-500 text-sm">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Standard Google Trigger (Prominent Visual Design) */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3.5 p-4.5 bg-white dark:bg-slate-850 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-500 shadow-md font-black text-sm tracking-wide transition-all focus:outline-none disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.123C18.29 1.19 15.447 0 12.24 0 5.48 0 0 5.37 0 12s5.48 12 12.24 12c7.05 0 11.75-4.82 11.75-11.66 0-.79-.08-1.39-.24-2.055H12.24z"
                  />
                </svg>
              )}
              {loading ? 'Identificando...' : 'Acessar com o Google'}
            </button>

            {/* Development helper tip if app is used inside an iframe */}
            {window.self !== window.top && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-150 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-center space-y-2.5">
                <p className="font-semibold text-slate-750 dark:text-slate-200">ℹ️ Dica de visualização</p>
                <p>O navegador pode restringir popups de autenticação quando o app roda dentro da janela de simulação do editor. Se houver dificuldades, use o botão abaixo para abrir diretamente na sua própria aba livre de travas:</p>
                <button
                  onClick={handleOpenNewTab}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-extrabold text-[11px] transition-all cursor-pointer shadow-sm active:scale-95 hover:scale-102"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir em Nova Aba Externa
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 leading-relaxed">
            <p>Ao fazer o login, suas preferências e movimentações financeiras ficarão salvas com segurança na nuvem.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

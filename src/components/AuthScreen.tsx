import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../firebase';
import { 
  Wallet, 
  Sparkles, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  Mail, 
  Lock, 
  ExternalLink,
  LogIn,
  UserPlus
} from 'lucide-react';

interface AuthScreenProps {
  onContinueAsGuest: () => void;
  isDarkMode: boolean;
}

type AuthMethod = 'email' | 'google';

export default function AuthScreen({ onContinueAsGuest, isDarkMode }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<AuthMethod>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Email state variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google authentication error:", err);
      setError(
        'O Google bloqueou o popup dentro do iframe do AI Studio. Clique no botão de "ABRIR EM NOVA ABA" logo acima para rodar o app livre de restrições ou use a aba "E-mail e Senha" ao lado!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Email auth error:", err);
      let localizedError = 'Ocorreu um erro ao autenticar.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        localizedError = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/email-already-in-use') {
        localizedError = 'Este endereço de e-mail já está em uso.';
      } else if (err.code === 'auth/invalid-email') {
        localizedError = 'O formato do e-mail é inválido.';
      } else if (err.code === 'auth/weak-password') {
        localizedError = 'A senha é muito fraca. Escolha uma senha mais forte.';
      }
      setError(localizedError);
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

        {/* Right Side: Login & Actions */}
        <div className="col-span-12 md:col-span-6 p-6 sm:p-10 flex flex-col justify-center" id="auth-actions-panel">
          <div className="text-center md:text-left mb-6">
            <div className="md:hidden flex justify-center mb-4">
              <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl shadow-emerald-500/20">
                <Wallet className="w-7 h-7" />
              </div>
            </div>
            <h1 className="text-xl font-black text-slate-850 dark:text-slate-100 tracking-tight">
              Acesso à Nuvem
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto md:mx-0">
              Escolha e-mail ou conta Google. E-mail funciona 100% livre de bloqueios do navegador.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5" id="auth-tab-selector">
            <button
              onClick={() => { setActiveTab('email'); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              E-mail e Senha
            </button>
            <button
              onClick={() => { setActiveTab('google'); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'google'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              G-mail/Google
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-850 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 text-xs rounded-xl flex items-start gap-2 text-left leading-tight" id="auth-error-banner">
              <span className="shrink-0 font-bold text-amber-500">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {activeTab === 'email' ? (
              /* Email Auth Form */
              <form onSubmit={handleEmailAuth} className="space-y-3.5" id="auth-email-form">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block ml-1">Senha (mínimo 6 dígitos)</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="******"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 bg-slate-850 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  ) : isRegistering ? (
                    <UserPlus className="w-3.5 h-3.5" />
                  ) : (
                    <LogIn className="w-3.5 h-3.5" />
                  )}
                  {isRegistering ? 'Criar Nova Conta' : 'Acessar Conta'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setError('');
                    }}
                    className="text-[11px] text-emerald-500 hover:text-emerald-600 font-bold underline transition-all bg-transparent outline-none border-none cursor-pointer"
                  >
                    {isRegistering 
                      ? 'Já possui uma conta? Faça Login' 
                      : 'Não possui conta ainda? Cadastre-se grátis'}
                  </button>
                </div>
              </form>
            ) : (
              /* Google Auth Layout */
              <div className="space-y-3.5" id="auth-google-form">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-2">
                  <p className="font-semibold text-slate-750 dark:text-slate-200">ℹ️ Por que o erro de bloqueio acontece?</p>
                  <p>Mesmo maximizado, o app ainda roda dentro de um iframe protegido da plataforma AI Studio. Para usar o login com Google sem bloqueio, use o botão azul de nova aba abaixo!</p>
                </div>

                {/* Direct Bypass Link (Big & Prominent) */}
                <button
                  onClick={handleOpenNewTab}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 animate-bounce" />
                  Abrir APP em Nova Aba para Logar
                </button>

                <span className="block text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest my-2">- ou tente de qualquer forma -</span>

                {/* Standard Google Trigger */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 p-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-700 shadow-sm font-bold text-xs transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
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
                  Tentar Sincronizar pelo Iframe
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center my-4" id="auth-divider">
              <hr className="flex-grow border-slate-200 dark:border-slate-800" />
              <span className="px-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">Acesso offline ultra rápido</span>
              <hr className="flex-grow border-slate-200 dark:border-slate-800" />
            </div>

            {/* Continue as Guest Trigger */}
            <button
              onClick={onContinueAsGuest}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/10 font-bold text-xs transition-all focus:outline-none flex items-center justify-center gap-2 cursor-pointer"
              id="auth-guest-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Entrar como Visitante (Teste Grátis Local)
            </button>
          </div>

          <div className="mt-6 text-center text-[10px] text-slate-400">
            <p>Ao se autenticar com E-mail, seus cartões e contas são guardados na nuvem e salvos automaticamente a cada alteração.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

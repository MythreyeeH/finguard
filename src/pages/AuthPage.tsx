import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [_, setLocation] = useLocation();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setLocation('/'); // Redirect on success
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setErrorMsg('Sign up successful! Please check your email to verify your account or login directly if auto-confirmation is enabled.');
        setIsLogin(true); // switch to login mode after signup
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden relative selection:bg-emerald-500/30">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: "cover" }} />
      
      {/* Left side: Branding & Visuals */}
      <div className="flex-1 p-8 md:p-12 z-10 hidden lg:flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-xl shadow-emerald-500/20 flex items-center justify-center shrink-0">
            <span className="text-white font-black font-display text-2xl">F</span>
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-white tracking-tight">Finguard.</h1>
            <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mt-1 opacity-70">Intelligence Hub</p>
          </div>
        </div>

        <div className="max-w-xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl lg:text-7xl font-display font-black text-white leading-[1.1] tracking-tighter mb-6"
          >
            Master your<br />liquidity.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-xl text-white/50 font-medium"
          >
            The autonomous decision engine for modern finance teams navigating complex cash flow environments.
          </motion.p>
        </div>
        
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
          © {new Date().getFullYear()} Finguard Systems Inc.
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="w-full lg:w-[600px] flex items-center justify-center p-6 z-10 backdrop-blur-[100px] bg-background/50 border-l border-white/5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl relative"
        >
          {/* Mobile Logo inside card */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0">
              <span className="text-white font-bold font-display text-xl">F</span>
            </div>
            <h1 className="font-display font-black text-xl text-white">Finguard.</h1>
          </div>

          <div className="mb-8">
            <h3 className="text-3xl font-display font-black text-white mb-2">{isLogin ? 'Welcome back' : 'Request Access'}</h3>
            <p className="text-sm text-white/50">{isLogin ? 'Enter your credentials to access the intelligence hub.' : 'Create your tenant to secure your financial architecture.'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-emerald-400 uppercase font-black tracking-widest ml-1">Email Protocol</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coo@company.com"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-emerald-400 uppercase font-black tracking-widest ml-1">Secure Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium font-mono tracking-widest"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="p-3 mt-2 text-xs font-semibold rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    {errorMsg}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isLogin ? 'Authenticate' : 'Initialize Tenant'} <ArrowRight className="w-4 h-4 ml-1" /></>}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-sm text-white/50">
              {isLogin ? "Don't have a secure tenant yet?" : "Already managing liquidity?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
                className="ml-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors uppercase tracking-wider text-xs"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import { 
  Key, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Check, 
  ShieldCheck, 
  User 
} from 'lucide-react';

export default function SignInModal({ isOpen, onClose, defaultTab = 'signin' }) {
  const [tab, setTab] = useState(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name || 'New Developer', email, password);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role) => {
    setError('');
    setLoading(true);
    try {
      if (role === 'admin') {
        await login('admin@ytkey.io', 'Admin@1234');
        onClose();
        navigate('/admin');
      } else {
        await login('demo@ytkey.io', 'Demo@1234');
        onClose();
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/auth/google/url');
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        await loginWithGoogle({
          email: 'nishkarsh.dev@gmail.com',
          name: 'Nishkarsh',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
        });
        onClose();
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google Auth error:', err);
      await loginWithGoogle({
        email: 'nishkarsh.dev@gmail.com',
        name: 'Nishkarsh',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
      });
      onClose();
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-md"
    >
      <div className="space-y-6 pt-2">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/25">
            <Key className="w-6 h-6 text-white -rotate-45" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {tab === 'signin' ? 'Sign in to VBIT-API-STORE' : 'Create Developer Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Access your YouTube API keys and dashboard
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-[#07080D] border border-slate-200 dark:border-white/[0.06] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'signin'
                ? 'bg-white dark:bg-[#161924] text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-white dark:bg-[#161924] text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Google Sign In */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white hover:bg-slate-200 dark:hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md border border-slate-200 dark:border-transparent transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.37 7.34 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center">
          <div className="flex-1 border-t border-slate-200 dark:border-white/[0.08]"></div>
          <span className="px-3 text-[10px] text-slate-500 uppercase font-semibold">or with email</span>
          <div className="flex-1 border-t border-slate-200 dark:border-white/[0.08]"></div>
        </div>

        {/* Sign In / Register Form */}
        <form onSubmit={tab === 'signin' ? handleSignIn : handleRegister} className="space-y-4 text-xs">
          
          {tab === 'register' && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nishkarsh"
                  className="w-full bg-slate-100 dark:bg-[#07080D] border border-slate-300 dark:border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-slate-100 dark:bg-[#07080D] border border-slate-300 dark:border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Password</label>
              {tab === 'signin' && (
                <Link
                  to="/forgot-password"
                  onClick={onClose}
                  className="text-[11px] text-purple-400 hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-100 dark:bg-[#07080D] border border-slate-300 dark:border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-gradient-purple text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{tab === 'signin' ? 'Sign In & Open Dashboard' : 'Create Account & Open Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] space-y-2 text-center">
          <p className="text-[11px] font-semibold text-slate-500">Quick 1-Click Demo Login:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('user')}
              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#161924] hover:bg-slate-200 dark:hover:bg-[#1e2232] text-slate-900 dark:text-white text-[11px] font-bold border border-slate-200 dark:border-white/[0.06] transition-all"
            >
              Demo User (Nishkarsh)
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('admin')}
              className="py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[11px] font-bold border border-amber-500/20 transition-all"
            >
              Super Admin Portal
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}

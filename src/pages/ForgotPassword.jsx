import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Radio, Mail, Key, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: request code, 2: reset password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.demo_reset_code) {
        setDemoCode(res.data.demo_reset_code);
        setCode(res.data.demo_reset_code); // auto-fill for frictionless demo testing
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send recovery code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email,
        code,
        newPassword
      });
      setMessage(res.data.message);
      setStep(3); // success
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              TuneKey<span className="text-brand-500">.API</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white mt-4">Password Recovery</h2>
          <p className="text-xs text-slate-400 mt-1">Regain access to your Telegram bot API credentials</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-slate-700/80 shadow-2xl">
          
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Account Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@tunekey.io"
                    className="w-full bg-[#070A10] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                {loading ? 'Generating...' : 'Send Recovery Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {demoCode && (
                <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-400 font-mono">
                  Demo recovery code generated: <strong>{demoCode}</strong>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">6-Digit Code</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#070A10] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#070A10] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                {loading ? 'Resetting...' : 'Set New Password'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <p className="text-xs text-slate-300">You can now sign in with your updated password.</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-slate-400">
            Remembered password?{' '}
            <Link to="/login" className="text-brand-400 font-semibold hover:underline">
              Back to Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

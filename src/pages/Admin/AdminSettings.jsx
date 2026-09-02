import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  User, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function AdminSettings() {
  const [username, setUsername] = useState('admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminUsername();
  }, []);

  const fetchAdminUsername = async () => {
    try {
      const res = await axios.get('/api/admin/payment-settings');
      if (res.data?.settings?.admin_username) {
        setUsername(res.data.settings.admin_username);
      }
    } catch(e) {}
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword && newPassword !== confirmPassword) {
      return setError('New password and confirm password do not match.');
    }

    if (newPassword && newPassword.length < 6) {
      return setError('New password must be at least 6 characters long.');
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/admin/change-password', {
        newUsername: username.trim(),
        currentPassword,
        newPassword
      });

      if (res.data?.success) {
        setMessage('🔒 Admin credentials updated securely!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2.5">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <span>Admin Portal Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage root administrator credentials and portal authentication security.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="p-6 rounded-3xl bg-white dark:bg-[#0F121C] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Admin Username
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Current Password (Optional if first setup)
          </label>
          <div className="relative">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Updating Credentials...' : 'Save Admin Credentials'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

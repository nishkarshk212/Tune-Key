import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Settings as SettingsIcon, User, Lock, LogOut, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/user/profile', { name });
      showNotification('Profile updated successfully!');
      refreshUser();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/user/change-password', {
        currentPassword,
        newPassword
      });
      showNotification('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account & Security Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage developer profile, credentials, and API access preferences.
        </p>
      </div>

      {notification.message && (
        <div className={`p-4 rounded-2xl border flex items-center space-x-3 text-xs font-semibold animate-fadeIn ${
          notification.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <User className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Developer Profile</h3>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Developer Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-[#07080D] border border-slate-300 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-200 dark:bg-white/[0.03] border border-slate-300 dark:border-white/[0.05] rounded-xl px-3.5 py-2.5 text-slate-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">Email cannot be modified directly.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl btn-gradient-purple text-white font-bold text-xs shadow-md transition-all"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <Lock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Password</h3>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-100 dark:bg-[#07080D] border border-slate-300 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-100 dark:bg-[#07080D] border border-slate-300 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#161924] hover:bg-slate-200 dark:hover:bg-[#1e2232] text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/[0.08] shadow-sm transition-all"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>

      {/* Session Management & Sign Out Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#11131B] border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Active Session</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <strong>{user?.email}</strong>. Terminate your active dashboard session.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition-all flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Dashboard</span>
        </button>
      </div>

    </div>
  );
}

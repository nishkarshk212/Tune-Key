import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/Modal';
import { 
  Key, 
  Search, 
  Trash2, 
  Power, 
  Sliders, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Clock,
  Calendar,
  Zap,
  Sparkles
} from 'lucide-react';

export default function KeyManagement() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dailyQuota, setDailyQuota] = useState(1500);
  const [totalQuota, setTotalQuota] = useState(45000);
  const [rpsLimit, setRpsLimit] = useState(20);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/keys');
      setKeys(res.data.keys || []);
    } catch (err) {
      showNotification('Failed to fetch keys', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggle = async (k) => {
    try {
      const nextStatus = k.status === 'active' ? 'inactive' : 'active';
      const res = await api.put(`/admin/keys/${k.id}`, { status: nextStatus });
      showNotification(res.data.message || `Key is now ${nextStatus}`);
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to toggle status', 'error');
    }
  };

  const handleRevoke = async (k) => {
    if (!window.confirm(`Permanently revoke ${k.key_name}? This key will stop working immediately.`)) return;
    try {
      const res = await api.put(`/admin/keys/${k.id}`, { status: 'revoked' });
      showNotification('API Key has been permanently revoked');
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to revoke key', 'error');
    }
  };

  const handleRegenerate = async (k) => {
    if (!window.confirm(`Regenerate API credentials for ${k.user_email}? The 30-day expiration date will be preserved.`)) return;
    try {
      const res = await api.post(`/admin/keys/${k.id}/regenerate`);
      showNotification(res.data.message || 'Key regenerated successfully');
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to regenerate key', 'error');
    }
  };

  const handleExtend = async (k) => {
    try {
      const res = await api.post(`/admin/keys/${k.id}/extend`, { days: 30 });
      showNotification(res.data.message || 'Subscription extended by 30 days');
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to extend subscription', 'error');
    }
  };

  const handleSaveQuotas = async (e) => {
    e.preventDefault();
    if (!selectedKey) return;
    try {
      const res = await api.put(`/admin/keys/${selectedKey.id}`, {
        daily_quota: parseInt(dailyQuota),
        total_quota: parseInt(totalQuota),
        rps_limit: parseInt(rpsLimit)
      });
      showNotification(res.data.message || 'Quotas updated successfully');
      setIsEditModalOpen(false);
      setSelectedKey(null);
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Update failed', 'error');
    }
  };

  const calculateDaysRemaining = (expiresAt) => {
    if (!expiresAt) return 'No limit';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} Days`;
  };

  const filteredKeys = keys.filter((k) => {
    const term = searchTerm.toLowerCase();
    return (
      k.key_name?.toLowerCase().includes(term) ||
      k.api_key?.toLowerCase().includes(term) ||
      k.user_email?.toLowerCase().includes(term) ||
      k.plan_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Key className="w-5 h-5 text-amber-500" />
            <span>Global API Keys & Subscriptions Inspector</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage Free/Paid subscriptions, inspect 30-day expiry dates, regenerate tokens, or extend validity.
          </p>
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search key, user email, plan..."
            className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <th className="pb-3 font-semibold">User / Email</th>
                  <th className="pb-3 font-semibold">API Key Prefix</th>
                  <th className="pb-3 font-semibold">Plan / Type</th>
                  <th className="pb-3 font-semibold">Expiry Date</th>
                  <th className="pb-3 font-semibold">Days Left</th>
                  <th className="pb-3 font-semibold">Usage (Day / Tot)</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-mono">
                {filteredKeys.map((k) => {
                  const isRevoked = k.status === 'revoked';
                  const isExpired = k.status === 'expired' || (k.expires_at && new Date(k.expires_at) < new Date());
                  const isActive = k.status === 'active' && !isExpired;
                  const isFree = k.type === 'free' || k.plan_id === 'plan_free';
                  const daysLeft = calculateDaysRemaining(k.expires_at);

                  return (
                    <tr key={k.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 font-sans">
                        <p className="font-bold text-slate-900 dark:text-white">{k.user_name || 'User'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{k.user_email}</p>
                      </td>

                      <td className="py-3.5 text-purple-600 dark:text-purple-400">
                        <div className="flex items-center space-x-1.5">
                          <span>{k.api_key.substring(0, 16)}...</span>
                          <button
                            onClick={() => handleCopy(k.api_key, k.id)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            title="Copy API Key"
                          >
                            {copiedKey === k.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 font-sans">
                        <span className="font-bold text-slate-900 dark:text-white">{k.plan_name || 'Free Tier'}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isFree ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}>
                          {isFree ? 'Free' : 'Paid (30D)'}
                        </span>
                      </td>

                      <td className="py-3.5 text-slate-600 dark:text-slate-300 text-[11px]">
                        {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Lifetime'}
                      </td>

                      <td className="py-3.5 font-bold font-sans">
                        <span className={`${
                          daysLeft === 'Expired' 
                            ? 'text-rose-500' 
                            : parseInt(daysLeft) <= 3 
                            ? 'text-amber-500' 
                            : 'text-emerald-500'
                        }`}>
                          {daysLeft}
                        </span>
                      </td>

                      <td className="py-3.5 text-slate-900 dark:text-white">
                        <span className="font-bold">{k.today_requests || 0}</span>
                        <span className="text-slate-400"> / {k.daily_quota || 500}</span>
                      </td>

                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isRevoked
                            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                            : isExpired
                            ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                            : isActive
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {isExpired ? 'Expired' : k.status}
                        </span>
                      </td>

                      <td className="py-3.5 text-right space-x-1.5 font-sans">
                        <button
                          onClick={() => handleExtend(k)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 text-[11px] font-bold border border-emerald-500/30 cursor-pointer"
                          title="Extend validity by 30 days"
                        >
                          +30 Days
                        </button>

                        <button
                          onClick={() => handleRegenerate(k)}
                          className="px-2 py-1 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500/25 text-[11px] font-bold border border-purple-500/30 cursor-pointer"
                          title="Regenerate key (retaining expiry)"
                        >
                          Regen
                        </button>

                        <button
                          onClick={() => {
                            setSelectedKey(k);
                            setDailyQuota(k.daily_quota || 1500);
                            setTotalQuota(k.total_quota || 45000);
                            setRpsLimit(k.rps_limit || 20);
                            setIsEditModalOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-[11px] font-bold border border-slate-300 dark:border-slate-700 cursor-pointer"
                        >
                          Limits
                        </button>

                        <button
                          onClick={() => handleToggle(k)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                            isActive
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isActive ? 'Pause' : 'Resume'}
                        </button>

                        <button
                          onClick={() => handleRevoke(k)}
                          className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-[11px] font-bold border border-rose-500/30 cursor-pointer"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Quotas Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Override Quotas: ${selectedKey?.key_name}`}
      >
        <form onSubmit={handleSaveQuotas} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Daily Request Limit
            </label>
            <input
              type="number"
              required
              min="50"
              value={dailyQuota}
              onChange={(e) => setDailyQuota(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Total Request Quota
            </label>
            <input
              type="number"
              required
              min="500"
              value={totalQuota}
              onChange={(e) => setTotalQuota(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Rate Limit (RPS)
            </label>
            <input
              type="number"
              required
              min="1"
              value={rpsLimit}
              onChange={(e) => setRpsLimit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black tracking-wide shadow-md transition-all cursor-pointer"
            >
              Update Quotas
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

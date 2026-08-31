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
  Bot, 
  Globe 
} from 'lucide-react';

export default function KeyManagement() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [quotaLimit, setQuotaLimit] = useState(100000);
  const [rpsLimit, setRpsLimit] = useState(30);
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
      const res = await api.patch(`/admin/keys/${k.id}/toggle-status`);
      showNotification(res.data.message);
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to toggle status', 'error');
    }
  };

  const handleRevoke = async (k) => {
    if (!window.confirm(`Permanently revoke ${k.key_name}?`)) return;
    try {
      const res = await api.delete(`/admin/keys/${k.id}/revoke`);
      showNotification(res.data.message);
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to revoke key', 'error');
    }
  };

  const handleSaveQuotas = async (e) => {
    e.preventDefault();
    if (!selectedKey) return;
    try {
      const res = await api.put(`/admin/keys/${selectedKey.id}/quotas`, {
        daily_quota: parseInt(quotaLimit),
        rps_limit: parseInt(rpsLimit)
      });
      showNotification(res.data.message);
      setIsEditModalOpen(false);
      setSelectedKey(null);
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Update failed', 'error');
    }
  };

  const filteredKeys = keys.filter((k) => {
    const term = searchTerm.toLowerCase();
    return (
      k.key_name?.toLowerCase().includes(term) ||
      k.api_key?.toLowerCase().includes(term) ||
      k.user_email?.toLowerCase().includes(term)
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Global YouTube API Keys Inspector</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search all active API keys across the platform, override rate limits, or block abusive keys.
          </p>
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search key, user email, or label..."
            className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <th className="pb-3 font-semibold">Key / Bot Label</th>
                  <th className="pb-3 font-semibold">User Email</th>
                  <th className="pb-3 font-semibold">API Key Prefix</th>
                  <th className="pb-3 font-semibold">Today / Daily Limit</th>
                  <th className="pb-3 font-semibold">RPS</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-mono">
                {filteredKeys.map((k) => {
                  const isRevoked = k.status === 'revoked';
                  const isActive = k.status === 'active';

                  return (
                    <tr key={k.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 font-sans">
                        <p className="font-bold text-slate-900 dark:text-white">{k.key_name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{k.bot_type}</p>
                      </td>

                      <td className="py-3.5 text-slate-700 dark:text-slate-300 font-sans">{k.user_email}</td>

                      <td className="py-3.5 text-brand-600 dark:text-brand-400">
                        <div className="flex items-center space-x-1.5">
                          <span>{k.api_key.substring(0, 18)}...</span>
                          <button
                            onClick={() => handleCopy(k.api_key, k.id)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {copiedKey === k.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 text-slate-900 dark:text-white">
                        <span className="font-bold">{k.today_requests?.toLocaleString()}</span>
                        <span className="text-slate-500"> / {k.daily_quota?.toLocaleString()}</span>
                      </td>

                      <td className="py-3.5 text-emerald-600 dark:text-emerald-400 font-bold">{k.rps_limit} req/s</td>

                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isRevoked
                            ? 'bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30'
                            : isActive
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {k.status}
                        </span>
                      </td>

                      <td className="py-3.5 text-right space-x-2 font-sans">
                        <button
                          onClick={() => {
                            setSelectedKey(k);
                            setQuotaLimit(k.daily_quota);
                            setRpsLimit(k.rps_limit);
                            setIsEditModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-[11px] font-bold border border-slate-300 dark:border-slate-700"
                        >
                          Limits
                        </button>

                        <button
                          onClick={() => handleToggle(k)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            isActive
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isActive ? 'Pause' : 'Resume'}
                        </button>

                        <button
                          onClick={() => handleRevoke(k)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500/20 text-[11px] font-bold border border-red-500/30"
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
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Daily Request Quota</label>
            <input
              type="number"
              required
              value={quotaLimit}
              onChange={(e) => setQuotaLimit(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Rate Limit (Requests per Second)</label>
            <input
              type="number"
              required
              value={rpsLimit}
              onChange={(e) => setRpsLimit(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
            >
              Save Quota Override
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

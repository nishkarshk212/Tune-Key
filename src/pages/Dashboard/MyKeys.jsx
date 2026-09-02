import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import Modal from '../../components/Modal';
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Power, 
  Bot, 
  Globe, 
  Activity,
  AlertCircle,
  Calendar,
  Zap
} from 'lucide-react';

export default function MyKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);

  // Form states
  const [keyName, setKeyName] = useState('');
  const [allowedIps, setAllowedIps] = useState('');
  const [botType, setBotType] = useState('YukkiMusic Bot v3');
  const [selectedPlanId, setSelectedPlanId] = useState('plan_free');
  const [createdNewKey, setCreatedNewKey] = useState(null);

  const [searchParams] = useSearchParams();

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/keys');
      setKeys(res.data.keys || []);
    } catch (e) {
      showNotification('Failed to load API keys', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
    if (searchParams.get('action') === 'create') {
      setSelectedPlanId('plan_free');
      setCreatedNewKey(null);
      setIsCreateModalOpen(true);
    }
    const timer = setInterval(() => {
      fetchKeys();
    }, 8000);
    return () => clearInterval(timer);
  }, [searchParams]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const handleCopy = (text, fieldId) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/user/keys/create', {
        keyName: keyName || 'Free YouTube Bot Key',
        allowedIps,
        botType,
        planId: selectedPlanId
      });
      showNotification(res.data.message || 'API Key created successfully!');
      setCreatedNewKey(res.data.key);
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to create key', 'error');
    }
  };

  const handleToggleStatus = async (key) => {
    try {
      const res = await api.patch(`/user/keys/${key.id}/toggle`);
      showNotification(res.data.message);
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to toggle status', 'error');
    }
  };

  const handleRegenerate = async () => {
    if (!selectedKey) return;
    try {
      const res = await api.post(`/user/keys/${selectedKey.id}/regenerate`);
      showNotification('API credentials regenerated successfully!');
      setIsRegenerateModalOpen(false);
      setSelectedKey(null);
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Regeneration failed', 'error');
    }
  };

  const handleRevoke = async () => {
    if (!selectedKey) return;
    try {
      const res = await api.delete(`/user/keys/${selectedKey.id}/revoke`);
      showNotification('API Key revoked permanently.', 'error');
      setIsRevokeModalOpen(false);
      setSelectedKey(null);
      fetchKeys();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Revocation failed', 'error');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!selectedKey) return;
    try {
      await api.put(`/user/keys/${selectedKey.id}/settings`, {
        key_name: keyName,
        allowed_ips: allowedIps,
        bot_type: botType
      });
      showNotification('Key settings updated!');
      setIsSettingsModalOpen(false);
      setSelectedKey(null);
      fetchKeys();
    } catch (err) {
      showNotification('Failed to update settings', 'error');
    }
  };

  const openSettingsModal = (key) => {
    setSelectedKey(key);
    setKeyName(key.key_name);
    setAllowedIps(key.allowed_ips || '');
    setBotType(key.bot_type || 'YukkiMusic Bot');
    setIsSettingsModalOpen(true);
  };

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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">YouTube API Credentials Manager</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your bot credentials, regenerate tokens, adjust IP whitelists, and monitor usage limits.
          </p>
        </div>

        <button
          onClick={() => {
            setKeyName(`Telegram Bot #${keys.length + 1}`);
            setAllowedIps('');
            setBotType('YukkiMusic Bot v3');
            setIsCreateModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-red-600 hover:from-brand-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Key</span>
        </button>
      </div>

      {/* Keys List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
      ) : keys.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/15 text-brand-500 flex items-center justify-center mx-auto">
            <Key className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No API Keys Generated Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Create your first dedicated YouTube API key to start streaming audio on your Telegram Music Bots.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg"
          >
            Create API Key Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((k) => {
            const isRevoked = k.status === 'revoked';
            const isActive = k.status === 'active';
            const quotaPct = k.daily_quota > 0 ? Math.min(100, Math.round((k.today_requests / k.daily_quota) * 100)) : 0;

            return (
              <div
                key={k.id}
                className={`glass-panel rounded-2xl p-6 transition-all ${
                  isRevoked
                    ? 'border-red-500/30 bg-red-500/5 opacity-60'
                    : isActive
                    ? 'hover:border-slate-300 dark:hover:border-slate-700'
                    : 'bg-slate-100/60 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left: Info & Keys */}
                  <div className="space-y-4 flex-1">
                    
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{k.key_name}</span>
                      </h3>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isRevoked
                          ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                          : !isActive && k.status === 'expired'
                          ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                          : isActive
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}>
                        {k.expires_at && new Date(k.expires_at) < new Date() ? 'EXPIRED' : k.status}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                        {k.plan_name || 'Starter Plan'}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        k.type === 'paid' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {k.type === 'paid' ? 'Paid (30D)' : 'Free Key'}
                      </span>

                      <span className="text-xs text-slate-500 flex items-center space-x-1">
                        <Bot className="w-3.5 h-3.5 text-telegram" />
                        <span>{k.bot_type || 'Telegram Bot'}</span>
                      </span>
                    </div>

                    {/* Expiration alert if expired */}
                    {k.expires_at && new Date(k.expires_at) < new Date() && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span><strong>Your subscription has expired.</strong> API calls from this key are paused.</span>
                        </div>
                        <a
                          href="/dashboard/plans"
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition-colors"
                        >
                          Renew Subscription
                        </a>
                      </div>
                    )}

                    {/* API Key Box */}
                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-sans">
                          <span>YouTube API Key (<code className="text-brand-600 dark:text-brand-400">x-api-key</code>)</span>
                          <span className="text-slate-400 dark:text-slate-500">Keep confidential</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-100 dark:bg-[#06090e] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-brand-600 dark:text-brand-400">
                          <span className="truncate pr-2">{k.api_key}</span>
                          <button
                            onClick={() => handleCopy(k.api_key, `api_${k.id}`)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0"
                            title="Copy API Key"
                          >
                            {copiedField === `api_${k.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Bot Client Token */}
                      <div>
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-sans">
                          <span>Bot Client Token (PyTgCalls Token)</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-100 dark:bg-[#06090e] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-telegram-dark dark:text-telegram-light">
                          <span className="truncate pr-2">{k.client_token}</span>
                          <button
                            onClick={() => handleCopy(k.client_token, `tok_${k.id}`)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0"
                            title="Copy Client Token"
                          >
                            {copiedField === `tok_${k.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>Purchased: <strong className="text-slate-800 dark:text-slate-300">{k.purchase_date ? new Date(k.purchase_date).toLocaleDateString() : (k.created_at ? new Date(k.created_at).toLocaleDateString() : 'N/A')}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Expires: <strong className="text-slate-800 dark:text-slate-300">{k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Lifetime'}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Days Remaining: <strong className="text-emerald-500">
                          {k.expires_at 
                            ? Math.max(0, Math.ceil((new Date(k.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) + ' Days'
                            : 'Unlimited'}
                        </strong></span>
                      </div>
                    </div>

                  </div>

                  {/* Right: Quotas & Actions */}
                  <div className="lg:w-72 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                    
                    {/* Quota Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Today's Usage:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {k.today_requests?.toLocaleString()} / {k.daily_quota?.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            quotaPct > 80 ? 'bg-red-500' : 'bg-brand-500'
                          }`}
                          style={{ width: `${Math.max(3, quotaPct)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                        <span>Resets 00:00 UTC</span>
                        <span>Total used: {k.used_quota?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {!isRevoked && (
                      <div className="space-y-2 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleToggleStatus(k)}
                            className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                              isActive
                                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>

                          <button
                            onClick={() => openSettingsModal(k)}
                            className="flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Configure</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setSelectedKey(k);
                              setIsRegenerateModalOpen(true);
                            }}
                            className="flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Regenerate</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedKey(k);
                              setIsRevokeModalOpen(true);
                            }}
                            className="flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 text-xs font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CREATE NEW KEY */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreatedNewKey(null);
        }}
        title="Provision YouTube API Key"
      >
        {createdNewKey ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>API Key Provisioned Successfully!</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Your dedicated <strong>{createdNewKey.plan_name || 'FREE'}</strong> API key is ready. Add this to your Telegram Bot config.
              </p>
            </div>

            {/* Key Card */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#0E1018] border border-slate-200 dark:border-white/[0.08] space-y-2">
              <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                <span>YOUR API KEY:</span>
                <span className="text-purple-400 font-bold">{createdNewKey.daily_quota} req / day</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#161924] border border-slate-200 dark:border-white/[0.06] font-mono text-slate-900 dark:text-white font-bold">
                <span className="truncate pr-2">{createdNewKey.api_key}</span>
                <button
                  onClick={() => handleCopy(createdNewKey.api_key, 'modal-key')}
                  className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-bold flex items-center space-x-1 transition-all"
                >
                  {copiedField === 'modal-key' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'modal-key' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreatedNewKey(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md"
              >
                Done / Return to Keys
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
            {/* 1. Plan Selector */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Select Subscription Plan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                {/* Free Plan (Pre-Selected) */}
                <div
                  onClick={() => setSelectedPlanId('plan_free')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPlanId === 'plan_free'
                      ? 'bg-blue-50/90 dark:bg-purple-500/10 border-2 border-blue-600 dark:border-purple-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-[#0E1018] border-slate-200 dark:border-white/[0.08] hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 dark:text-white">FREE Plan</span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-mono">₹0 (Free)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">500 Requests / day (Instant Auto-Generate)</p>
                </div>

                {/* Basic Plan */}
                <div
                  onClick={() => setSelectedPlanId('plan_basic')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPlanId === 'plan_basic'
                      ? 'bg-blue-50/90 dark:bg-purple-500/10 border-2 border-blue-600 dark:border-purple-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-[#0E1018] border-slate-200 dark:border-white/[0.08] hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 dark:text-white">BASIC Plan</span>
                    <span className="text-purple-500 dark:text-purple-400 font-mono">₹49/mo</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">1,000 Requests / day</p>
                </div>

                {/* Pro Plan */}
                <div
                  onClick={() => setSelectedPlanId('plan_pro')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPlanId === 'plan_pro'
                      ? 'bg-blue-50/90 dark:bg-purple-500/10 border-2 border-blue-600 dark:border-purple-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-[#0E1018] border-slate-200 dark:border-white/[0.08] hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 dark:text-white">PRO Plan ⭐</span>
                    <span className="text-purple-500 dark:text-purple-400 font-mono">₹99/mo</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">1,500 Requests / day</p>
                </div>

                {/* Advanced Plan */}
                <div
                  onClick={() => setSelectedPlanId('plan_advanced')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPlanId === 'plan_advanced'
                      ? 'bg-blue-50/90 dark:bg-purple-500/10 border-2 border-blue-600 dark:border-purple-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-[#0E1018] border-slate-200 dark:border-white/[0.08] hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 dark:text-white">ADVANCED</span>
                    <span className="text-purple-500 dark:text-purple-400 font-mono">₹149/mo</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">2,000 Requests / day</p>
                </div>

              </div>
            </div>

            {/* 2. Key Label */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Key Label / Bot Name</label>
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. Free YouTube Bot Key"
                className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
              >
                Cancel
              </button>
              {selectedPlanId === 'plan_free' ? (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center space-x-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Auto-Generate Free API Key</span>
                </button>
              ) : (
                <a
                  href={`/dashboard/plans?selected=${selectedPlanId}`}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center space-x-1.5"
                >
                  <span>Proceed to UPI QR Checkout →</span>
                </a>
              )}
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 2: REGENERATE CONFIRMATION */}
      <Modal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
        title="Regenerate API Credentials?"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Regenerating will immediately invalidate the old API key. You must update your Telegram Bot's .env configuration file with the new key.
            </span>
          </div>

          <p className="text-slate-700 dark:text-slate-300">
            Are you sure you want to regenerate credentials for <strong>"{selectedKey?.key_name}"</strong>?
          </p>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              onClick={() => setIsRegenerateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleRegenerate}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md"
            >
              Yes, Regenerate Key
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: REVOKE CONFIRMATION */}
      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Permanently Revoke API Key?"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              This action cannot be undone. All future requests made with this API key will be permanently rejected.
            </span>
          </div>

          <p className="text-slate-700 dark:text-slate-300">
            Are you sure you want to revoke <strong>"{selectedKey?.key_name}"</strong>?
          </p>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              onClick={() => setIsRevokeModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleRevoke}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md"
            >
              Permanently Revoke
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: KEY SETTINGS */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Edit API Key Settings"
      >
        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Key Label</label>
            <input
              type="text"
              required
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Bot Framework</label>
            <input
              type="text"
              value={botType}
              onChange={(e) => setBotType(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Allowed IPs (Whitelist)</label>
            <input
              type="text"
              value={allowedIps}
              onChange={(e) => setAllowedIps(e.target.value)}
              placeholder="e.g. 185.220.101.5 (leave blank for any IP)"
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

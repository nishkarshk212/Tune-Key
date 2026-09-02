import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Layers, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap,
  Sparkles
} from 'lucide-react';
import Modal from '../../components/Modal';

export default function PlanManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    tier: 'pro',
    price: 99,
    daily_quota: 1500,
    total_quota: 45000,
    rps_limit: 20,
    features: ['1,500 Requests / day', '1 Key', 'Priority Support'],
    is_popular: 0,
    is_active: 1
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/admin/plans');
      if (res.data?.success) {
        setPlans(res.data.plans || []);
      }
    } catch (err) {
      setError('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      tier: 'pro',
      price: 99,
      daily_quota: 1500,
      total_quota: 45000,
      rps_limit: 20,
      features: ['1,500 Requests / day', '1 Dedicated Key', 'Priority Support'],
      is_popular: 0,
      is_active: 1
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setIsEditing(true);
    setCurrentId(plan.id);
    let parsedFeatures = [];
    try {
      parsedFeatures = typeof plan.features_json === 'string' ? JSON.parse(plan.features_json) : plan.features_json || [];
    } catch(e) {}

    setFormData({
      name: plan.name,
      tier: plan.tier || 'pro',
      price: plan.price,
      daily_quota: plan.daily_quota,
      total_quota: plan.total_quota,
      rps_limit: plan.rps_limit || 20,
      features: parsedFeatures,
      is_popular: plan.is_popular ? 1 : 0,
      is_active: plan.is_active ? 1 : 0
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      if (isEditing) {
        const res = await axios.put(`/api/admin/plans/${currentId}`, formData);
        if (res.data?.success) setMessage('Plan updated successfully');
      } else {
        const res = await axios.post('/api/admin/plans', formData);
        if (res.data?.success) setMessage('Plan created successfully');
      }
      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save plan');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete plan "${name}"?`)) return;
    try {
      await axios.delete(`/api/admin/plans/${id}`);
      setMessage('Plan deleted successfully');
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete plan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2.5">
            <Layers className="w-6 h-6 text-amber-500" />
            <span>Plan & Pricing Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage public subscription tiers, INR (₹) rates, daily limits, and VIP features.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPlans}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        </div>
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

      {/* Plans Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          let features = [];
          try {
            features = typeof plan.features_json === 'string' ? JSON.parse(plan.features_json) : plan.features_json || [];
          } catch(e) {}

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl bg-white dark:bg-[#0F121C] border transition-all flex flex-col justify-between ${
                plan.is_popular 
                  ? 'border-amber-500/50 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5' 
                  : 'border-slate-200 dark:border-white/[0.08]'
              } ${!plan.is_active ? 'opacity-60' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-500 text-xs font-black tracking-wider uppercase">
                    {plan.name}
                  </span>
                  {plan.is_popular === 1 && (
                    <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      <span>Popular</span>
                    </span>
                  )}
                </div>

                <div className="my-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    ₹{plan.price}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1.5">/ 30 Days</span>
                </div>

                <div className="space-y-2 py-3 border-t border-slate-100 dark:border-white/[0.06] text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Daily Quota:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{plan.daily_quota?.toLocaleString()} req/day</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Total Quota:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{plan.total_quota?.toLocaleString()} req</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Rate Limit:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{plan.rps_limit || 15} req/sec</span>
                  </div>
                </div>

                <ul className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {features.map((f, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <span className={`text-xs font-bold ${plan.is_active ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {plan.is_active ? '● Active' : '○ Inactive'}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Edit Plan"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {plan.id !== 'plan_free' && (
                    <button
                      onClick={() => handleDelete(plan.id, plan.name)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Plan Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Subscription Plan' : 'Create New Plan'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="PRO"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Price in INR (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-bold text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Daily Limit
              </label>
              <input
                type="number"
                required
                min="50"
                value={formData.daily_quota}
                onChange={(e) => setFormData({ ...formData, daily_quota: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-bold text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Total Quota
              </label>
              <input
                type="number"
                required
                min="500"
                value={formData.total_quota}
                onChange={(e) => setFormData({ ...formData, total_quota: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-bold text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                RPS Limit
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.rps_limit}
                onChange={(e) => setFormData({ ...formData, rps_limit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-bold text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_popular === 1}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="font-bold text-slate-700 dark:text-slate-300">Mark as Popular</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active === 1}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="font-bold text-slate-700 dark:text-slate-300">Active</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black tracking-wide shadow-md transition-all cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

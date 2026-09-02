import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Server, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap,
  Activity,
  Layers,
  X
} from 'lucide-react';
import Modal from '../../components/Modal';

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 99,
    requests_per_day: 1500,
    requests_per_month: 45000,
    is_active: 1
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/services');
      if (res.data?.success) {
        setServices(res.data.services || []);
      }
    } catch (err) {
      setError('Failed to load API services');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      description: '',
      price: 99,
      requests_per_day: 1500,
      requests_per_month: 45000,
      is_active: 1
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setIsEditing(true);
    setCurrentId(srv.id);
    setFormData({
      name: srv.name,
      description: srv.description || '',
      price: srv.price,
      requests_per_day: srv.requests_per_day,
      requests_per_month: srv.requests_per_month,
      is_active: srv.is_active ? 1 : 0
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      if (isEditing) {
        const res = await api.put(`/admin/services/${currentId}`, formData);
        if (res.data?.success) {
          setMessage('Service updated successfully');
        }
      } else {
        const res = await api.post('/admin/services', formData);
        if (res.data?.success) {
          setMessage('New service created successfully');
        }
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save service');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete service "${name}"?`)) return;
    try {
      await api.delete(`/admin/services/${id}`);
      setMessage('Service removed successfully');
      fetchServices();
    } catch (err) {
      setError('Failed to delete service');
    }
  };

  const handleToggleStatus = async (srv) => {
    try {
      await api.put(`/admin/services/${srv.id}`, {
        is_active: srv.is_active ? 0 : 1
      });
      fetchServices();
    } catch (err) {
      setError('Failed to toggle status');
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
            <Server className="w-6 h-6 text-amber-500" />
            <span>Manage API Services</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure streaming engines, metadata APIs, INR pricing, and daily request quotas.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchServices}
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
            <span>Add API Service</span>
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div 
            key={srv.id}
            className={`p-6 rounded-3xl bg-white dark:bg-[#0F121C] border transition-all flex flex-col justify-between ${
              srv.is_active 
                ? 'border-slate-200 dark:border-white/[0.08] hover:border-amber-500/40' 
                : 'border-rose-500/20 opacity-70 bg-rose-500/[0.02]'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    srv.is_active 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  }`}>
                    {srv.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {srv.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">
                {srv.description || 'No description provided.'}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Price:</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">₹{srv.price}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Daily Limit:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{srv.requests_per_day?.toLocaleString()} req/day</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Monthly Limit:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{srv.requests_per_month?.toLocaleString()} req/mo</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <button
                onClick={() => handleToggleStatus(srv)}
                className={`text-xs font-bold transition-colors cursor-pointer ${
                  srv.is_active ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {srv.is_active ? 'Disable' : 'Enable'}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEdit(srv)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Edit Service"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(srv.id, srv.name)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit API Service' : 'Add New API Service'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Service Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. YouTube Direct Audio Stream Engine"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Service capabilities and Telegram bot integration..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Daily Limit
              </label>
              <input
                type="number"
                required
                min="10"
                value={formData.requests_per_day}
                onChange={(e) => setFormData({ ...formData, requests_per_day: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Monthly Limit
              </label>
              <input
                type="number"
                required
                min="100"
                value={formData.requests_per_month}
                onChange={(e) => setFormData({ ...formData, requests_per_month: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active === 1}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
            />
            <label htmlFor="is_active" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Active & Available for API key creation
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
              {isEditing ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/Modal';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  Key, 
  Activity, 
  UserX, 
  UserCheck, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState('25.00');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      showNotification('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const handleToggleSuspension = async (user) => {
    try {
      const res = await api.patch(`/admin/users/${user.id}/toggle-status`);
      showNotification(res.data.message);
      fetchUsers();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  const handleAddCredits = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await api.post(`/admin/users/${selectedUser.id}/adjust-balance`, {
        amount: parseFloat(creditAmount)
      });
      showNotification(res.data.message);
      setIsCreditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Adjustment failed', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term) || u.id?.includes(term);
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registered Developers & Bot Accounts</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage developer roles, adjust wallet balances, inspect quotas, or suspend abusive accounts.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or ID..."
            className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
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
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Balance</th>
                  <th className="pb-3 font-semibold">Keys Active</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Joined</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {filteredUsers.map((u) => {
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr key={u.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`}
                            alt="Avatar"
                            className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${u.balance?.toFixed(2)}
                      </td>

                      <td className="py-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {u.key_count || 0} keys
                      </td>

                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isSuspended
                            ? 'bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setCreditAmount('25.00');
                            setIsCreditModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-colors"
                        >
                          + Credits
                        </button>

                        <button
                          onClick={() => handleToggleSuspension(u)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            isSuspended
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/30 hover:bg-red-500/20'
                          }`}
                        >
                          {isSuspended ? 'Unsuspend' : 'Suspend'}
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

      {/* Credit Adjustment Modal */}
      <Modal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        title={`Adjust Balance: ${selectedUser?.name}`}
      >
        <form onSubmit={handleAddCredits} className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Add or deduct wallet credit for <strong>{selectedUser?.email}</strong>. Use negative values to deduct.
          </p>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Credit Amount ($ USD)</label>
            <input
              type="number"
              step="0.01"
              required
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
            >
              Apply Adjustment
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

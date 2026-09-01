import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Receipt, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Copy, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  QrCode,
  ArrowUpRight
} from 'lucide-react';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending_verification' | 'completed' | 'rejected'
  const [actionLoading, setActionLoading] = useState(null);
  const [copiedUtr, setCopiedUtr] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleApprove = async (orderId) => {
    try {
      setActionLoading(orderId);
      const res = await api.post(`/admin/orders/${orderId}/approve`);
      if (res.data.success) {
        setActionMessage({
          type: 'success',
          text: res.data.message || 'Order approved and API Key provisioned!'
        });
        await loadOrders();
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to approve order.'
      });
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleReject = async (orderId) => {
    const reason = window.prompt('Enter rejection reason (optional):', 'Invalid UTR or Payment not received');
    if (reason === null) return;

    try {
      setActionLoading(orderId);
      const res = await api.post(`/admin/orders/${orderId}/reject`, { reason });
      if (res.data.success) {
        setActionMessage({
          type: 'info',
          text: res.data.message || 'Order rejected.'
        });
        await loadOrders();
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to reject order.'
      });
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(id);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const pendingCount = orders.filter(o => o.payment_status === 'pending_verification' || o.payment_status === 'pending').length;
  const completedRevenue = orders
    .filter(o => o.payment_status === 'completed')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      o.id?.toLowerCase().includes(term) ||
      o.user_email?.toLowerCase().includes(term) ||
      o.user_name?.toLowerCase().includes(term) ||
      o.plan_name?.toLowerCase().includes(term) ||
      o.transaction_id?.toLowerCase().includes(term) ||
      o.payment_method?.toLowerCase().includes(term)
    );

    const matchesStatus = (
      statusFilter === 'all' ||
      (statusFilter === 'pending_verification' && (o.payment_status === 'pending_verification' || o.payment_status === 'pending')) ||
      o.payment_status === statusFilter
    );

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Stats Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-purple-400" />
            <span>UTR Verifications & Order Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review manual Paytm/UPI QR payments, verify 12-digit UTRs, and approve 1-click API key activations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-700 dark:text-amber-300 flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending UTRs: <strong className="text-sm">{pendingCount}</strong></span>
          </div>

          <div className="p-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-700 dark:text-emerald-300">
            Approved Revenue: <strong>₹{completedRevenue.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl text-xs flex items-center space-x-3 border ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : actionMessage.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}>
          {actionMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          {actionMessage.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#11131B] text-slate-400 hover:text-white'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_verification')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              statusFilter === 'pending_verification'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-100 dark:bg-[#11131B] text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending UTRs</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#11131B] text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#11131B] text-red-400 hover:bg-red-500/10'
            }`}
          >
            Rejected
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by UTR, User, or Plan..."
            className="w-full bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] text-slate-500 text-xs">
          No orders found matching your filter criteria.
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0E1018] text-[11px]">
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Plan & Amount</th>
                  <th className="py-3 px-4 font-semibold">UTR / Reference No.</th>
                  <th className="py-3 px-4 font-semibold">Gateway / Method</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] font-mono">
                {filteredOrders.map((o) => {
                  const isPending = o.payment_status === 'pending_verification' || o.payment_status === 'pending';

                  return (
                    <tr 
                      key={o.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-[#161924] transition-colors ${
                        isPending ? 'bg-amber-500/[0.04]' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-slate-900 dark:text-white">{o.user_name || 'User'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{o.user_email}</div>
                      </td>

                      {/* Plan & Amount */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-purple-400">{o.plan_name}</div>
                        <div className="text-slate-900 dark:text-white font-mono font-bold">₹{o.amount}</div>
                      </td>

                      {/* UTR / Transaction ID with 1-Click Copy */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold font-mono px-2 py-1 rounded-lg ${
                            isPending 
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs' 
                              : 'bg-slate-100 dark:bg-[#07080D] text-slate-300 text-xs'
                          }`}>
                            {o.transaction_id || 'N/A'}
                          </span>
                          {o.transaction_id && (
                            <button
                              onClick={() => copyToClipboard(o.transaction_id, o.id)}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Copy UTR"
                            >
                              {copiedUtr === o.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 font-sans text-slate-400 text-[11px]">
                        {o.payment_method}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 inline-flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>PENDING</span>
                          </span>
                        ) : o.payment_status === 'completed' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>APPROVED</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30 inline-flex items-center space-x-1">
                            <XCircle className="w-3 h-3" />
                            <span>REJECTED</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] font-sans">
                        {new Date(o.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>

                      {/* Actions: Strictly Approve and Reject Options */}
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleApprove(o.id)}
                              disabled={actionLoading === o.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md shadow-emerald-500/20 flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
                              title="Approve Payment"
                            >
                              {actionLoading === o.id ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Approve</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(o.id)}
                              disabled={actionLoading === o.id}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
                              title="Reject Payment"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : o.payment_status === 'completed' ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-500 dark:text-emerald-400 font-bold text-[11px] font-sans">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-rose-400 font-bold text-[11px] font-sans">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Receipt, Search, DollarSign, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await api.get('/admin/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o.id?.toLowerCase().includes(term) ||
      o.user_email?.toLowerCase().includes(term) ||
      o.plan_name?.toLowerCase().includes(term) ||
      o.payment_method?.toLowerCase().includes(term)
    );
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Orders & Subscriptions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time financial transactions, plan activations, and payment method logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-700 dark:text-emerald-300">
            Total Revenue: <strong>${totalRevenue.toFixed(2)}</strong>
          </div>

          <div className="relative sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders..."
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
            />
          </div>
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
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">User Email</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Payment Gateway</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-mono">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-bold text-slate-700 dark:text-slate-300">{o.id}</td>
                    <td className="py-3.5 text-slate-900 dark:text-white font-sans font-medium">{o.user_email}</td>
                    <td className="py-3.5 text-brand-600 dark:text-brand-400 font-sans font-semibold">{o.plan_name}</td>
                    <td className="py-3.5 text-slate-900 dark:text-white font-bold">${o.amount?.toFixed(2)}</td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-400 font-sans">{o.payment_method}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-slate-500 text-[11px]">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

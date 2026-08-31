import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Users, 
  Key, 
  Receipt, 
  Activity, 
  DollarSign, 
  Server, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw 
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overview');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-[#0B0F17] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Master Administration Terminal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">Platform Infrastructure & User Oversight</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Monitor gross platform revenue, active bot connections, rate limits, and proxy health.
          </p>
        </div>

        <button
          onClick={fetchAdminStats}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Gross Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">₹{stats.totalRevenue?.toLocaleString() || '0'}</span>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-2">● +18.4% this week</p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Developers</span>
            <Users className="w-4 h-4 text-telegram" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{stats.totalUsers || 0}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Active Telegram Bot Hosts</p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Bot Keys</span>
            <Key className="w-4 h-4 text-brand-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{stats.activeKeys || 0}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Total provisioned: {stats.totalKeys || 0}</p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Daily Requests Processed</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{stats.totalRequestsToday?.toLocaleString() || 0}</span>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-2">Avg Latency: 32ms</p>
        </div>

      </div>

      {/* Upstream Health and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Node Health */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Relay Cluster Health</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">12/12 ACTIVE</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-[#06090e] border border-slate-200 dark:border-slate-800">
              <span className="font-mono text-slate-900 dark:text-white">relay-us-east-01</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">28ms • 0% loss</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-[#06090e] border border-slate-200 dark:border-slate-800">
              <span className="font-mono text-slate-900 dark:text-white">relay-eu-frankfurt-01</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">22ms • 0% loss</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-[#06090e] border border-slate-200 dark:border-slate-800">
              <span className="font-mono text-slate-900 dark:text-white">relay-asia-singapore-01</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">42ms • 0% loss</span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Sales & Subscriptions</h3>
            <span className="text-xs text-slate-500 font-mono">Live Transactions</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Developer</th>
                    <th className="pb-2">Plan</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                  {data.recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 text-slate-700 dark:text-slate-300 font-bold">{ord.id}</td>
                      <td className="py-2.5 text-slate-900 dark:text-white">{ord.user_email || 'user@domain.com'}</td>
                      <td className="py-2.5 text-brand-600 dark:text-brand-400">{ord.plan_name}</td>
                      <td className="py-2.5 text-slate-900 dark:text-white font-bold">${ord.amount?.toFixed(2)}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          {ord.payment_status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-500 text-[10px]">{new Date(ord.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">No orders recorded yet.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Terminal, Search, RefreshCw, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/logs');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      l.endpoint?.toLowerCase().includes(term) ||
      l.query?.toLowerCase().includes(term) ||
      l.user_email?.toLowerCase().includes(term) ||
      l.api_key?.toLowerCase().includes(term) ||
      l.ip_address?.toLowerCase().includes(term);

    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === '200' 
      ? l.status_code === 200 
      : l.status_code !== 200;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live YouTube Gateway Traffic Stream</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time audit log of all incoming music queries, stream requests, status codes, and latencies.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none font-medium"
          >
            <option value="all">All Status Codes</option>
            <option value="200">200 OK Only</option>
            <option value="errors">Errors / Blocked Only</option>
          </select>

          <div className="relative sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter endpoint, query, IP..."
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none font-mono"
            />
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
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
                  <th className="pb-3 font-semibold">Time</th>
                  <th className="pb-3 font-semibold">Endpoint</th>
                  <th className="pb-3 font-semibold">Search / Video Query</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Latency</th>
                  <th className="pb-3 font-semibold">User Email</th>
                  <th className="pb-3 font-semibold">IP Address</th>
                  <th className="pb-3 font-semibold text-right">Bot Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-mono">
                {filteredLogs.map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">{new Date(l.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 text-brand-600 dark:text-brand-400">{l.endpoint}</td>
                    <td className="py-3 text-slate-900 dark:text-white font-semibold truncate max-w-[180px]">{l.query || '—'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.status_code === 200 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-500 dark:text-red-400'
                      }`}>
                        {l.status_code}
                      </span>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">{l.latency_ms}ms</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 font-sans">{l.user_email || 'anonymous'}</td>
                    <td className="py-3 text-slate-500 text-[11px]">{l.ip_address}</td>
                    <td className="py-3 text-right text-slate-400 dark:text-slate-500 text-[11px] truncate max-w-[120px]">{l.bot_agent}</td>
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

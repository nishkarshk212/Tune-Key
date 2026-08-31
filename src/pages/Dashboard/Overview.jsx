import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/Modal';
import { 
  Key, 
  Activity, 
  Crown, 
  Wallet, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  MoreVertical, 
  Check, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Overview() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [revealedKeys, setRevealedKeys] = useState({});

  // Generate Key Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [generating, setGenerating] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/dashboard/stats');
      setData(res.data);
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleReveal = (id) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.post('/user/keys/create', {
        keyName: newKeyName || `Bot Key #${(data?.keys?.length || 0) + 1}`,
        botType: 'YukkiMusic Bot v3'
      });
      setCreatedKey(res.data.apiKey);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate key');
    } finally {
      setGenerating(false);
    }
  };

  // API Usage Line Chart Config
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'API Requests',
        data: [1500, 3200, 2800, 7500, 12450, 8900, 11200],
        borderColor: '#38BDF8',
        backgroundColor: 'rgba(56, 189, 248, 0.08)',
        tension: 0.45,
        fill: true,
        pointBackgroundColor: '#38BDF8',
        pointBorderColor: '#08090D',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#161924',
        titleColor: '#ffffff',
        bodyColor: '#38BDF8',
        bodyFont: { family: 'JetBrains Mono', weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString()} Requests`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Outfit', size: 11 } }
      },
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)' },
        ticks: { color: '#64748b', font: { family: 'Outfit', size: 10 } }
      }
    }
  };

  const todayRequests = 12450;
  const todayQuota = 50000;
  const usagePercentage = Math.round((todayRequests / todayQuota) * 100); // 24%

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Greeting */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Welcome back, {user?.name || 'Nishkarsh'}! Here's your API overview.
        </p>
      </div>

      {/* 4 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total API Keys */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total API Keys</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data?.stats?.activeKeysCount || 3}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Active keys</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Key className="w-5 h-5 -rotate-45" />
          </div>
        </div>

        {/* Card 2: Requests Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">Requests Today</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
              12,450
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">of 50,000</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Plan */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">Plan</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Pro Plan
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Renews on 24 May 2024</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Crown className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Account Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">Account Balance</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
              ${user?.balance?.toFixed(2) || '9.20'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Available credit</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ANALYTICS ROW: API Usage Chart + Today's Usage Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: API Usage Line Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">API Usage</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right: Today's Usage Circular Gauge (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] flex flex-col justify-between text-center">
          <div className="flex items-center justify-between text-left">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Usage</h3>
              <p className="text-xs font-mono font-semibold text-slate-500 mt-0.5">
                12,450 <span className="text-slate-600 font-normal">/ 50,000</span>
              </p>
            </div>
          </div>

          {/* Circular Progress Gauge */}
          <div className="py-6 flex items-center justify-center relative">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  strokeWidth="8"
                  className="stroke-slate-100 dark:stroke-[#1A1D2B]"
                  fill="transparent"
                />
                {/* Active Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * usagePercentage) / 100}
                  strokeLinecap="round"
                  stroke="url(#usageGradient)"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="usageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {usagePercentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-center space-x-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset in 08:45:12</span>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: YOUR API KEYS TABLE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] space-y-4">
        
        {/* Table Header with "+ Generate New Key" */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Your API Keys</h3>
          <button
            onClick={() => {
              setNewKeyName('');
              setCreatedKey(null);
              setIsGenerateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl btn-gradient-purple text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-purple-600/30 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate New Key</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-white/[0.04]">
                <th className="pb-3 font-semibold">NAME</th>
                <th className="pb-3 font-semibold">API KEY</th>
                <th className="pb-3 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold">REQUESTS</th>
                <th className="pb-3 font-semibold">EXPIRES IN</th>
                <th className="pb-3 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              
              {/* Row 1: Main Bot Key */}
              <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-4 font-bold text-slate-900 dark:text-white">Main Bot Key</td>
                <td className="py-4 font-mono text-slate-600 dark:text-slate-300">
                  {revealedKeys['key1'] ? 'yt_live_7f8a3c9b1e2d4f5a6b7c8d9e' : 'yt_live_7f8a••••••••••••••'}
                </td>
                <td className="py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </td>
                <td className="py-4 font-mono text-slate-600 dark:text-slate-300">12,450 / 50,000</td>
                <td className="py-4 text-slate-500">28 Days</td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end space-x-2 text-slate-400">
                    <button
                      onClick={() => handleCopy('yt_live_7f8a3c9b1e2d4f5a6b7c8d9e0f1a2b3c', 'k1')}
                      className="p-1.5 hover:text-white rounded hover:bg-white/[0.05] transition-colors"
                      title="Copy Key"
                    >
                      {copiedKey === 'k1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => toggleReveal('key1')}
                      className="p-1.5 hover:text-white rounded hover:bg-white/[0.05] transition-colors"
                      title="Reveal Key"
                    >
                      {revealedKeys['key1'] ? <EyeOff className="w-3.5 h-3.5 text-purple-400" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button className="p-1.5 hover:text-white rounded hover:bg-white/[0.05] transition-colors">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2: Backup Key */}
              <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-4 font-bold text-slate-900 dark:text-white">Backup Key</td>
                <td className="py-4 font-mono text-slate-600 dark:text-slate-300">
                  {revealedKeys['key2'] ? 'yt_live_9c3b8a1e4f2d5a6b7c8d9e0f' : 'yt_live_9c3b••••••••••••••'}
                </td>
                <td className="py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </td>
                <td className="py-4 font-mono text-slate-600 dark:text-slate-300">2,300 / 50,000</td>
                <td className="py-4 text-slate-500">28 Days</td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end space-x-2 text-slate-400">
                    <button
                      onClick={() => handleCopy('yt_live_9c3b8a1e4f2d5a6b7c8d9e0f1a2b3c4d', 'k2')}
                      className="p-1.5 hover:text-white rounded hover:bg-white/[0.05] transition-colors"
                      title="Copy Key"
                    >
                      {copiedKey === 'k2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => toggleReveal('key2')}
                      className="p-1.5 hover:text-white rounded hover:bg-white/[0.05] transition-colors"
                      title="Reveal Key"
                    >
                      {revealedKeys['key2'] ? <EyeOff className="w-3.5 h-3.5 text-purple-400" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button className="p-1.5 hover:text-white rounded hover:bg-white/[0.05] transition-colors">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 3: Test Key */}
              <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-4 font-bold text-slate-900 dark:text-white">Test Key</td>
                <td className="py-4 font-mono text-slate-600 dark:text-slate-300">
                  {revealedKeys['key3'] ? 'yt_live_a1d94f2e3b5a6c7d8e9f0a1b' : 'yt_live_a1d9••••••••••••••'}
                </td>
                <td className="py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500">
                    Inactive
                  </span>
                </td>
                <td className="py-4 font-mono text-slate-600 dark:text-slate-300">0 / 50,000</td>
                <td className="py-4 text-slate-500">-</td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end space-x-2 text-slate-400">
                    <button
                      onClick={() => handleCopy('yt_live_a1d94f2e3b5a6c7d8e9f0a1b2c3d4e5f', 'k3')}
                      className="p-1.5 hover:text-white rounded hover:bg-white/[0.05] transition-colors"
                      title="Copy Key"
                    >
                      {copiedKey === 'k3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => toggleReveal('key3')}
                      className="p-1.5 hover:text-white rounded hover:bg-white/[0.05] transition-colors"
                      title="Reveal Key"
                    >
                      {revealedKeys['key3'] ? <EyeOff className="w-3.5 h-3.5 text-purple-400" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button className="p-1.5 hover:text-white rounded hover:bg-white/[0.05] transition-colors">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

      </div>

      {/* GENERATE NEW API KEY MODAL (Matching Bottom Center of Screenshot) */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate New API Key"
        maxWidth="max-w-md"
      >
        {createdKey ? (
          <div className="text-center py-4 space-y-5">
            {/* Green Circular Checkmark */}
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Your API Key has been generated!
              </h3>
            </div>

            {/* Key Field with Copy Button */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-[#07080D] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3.5 py-3 text-xs font-mono text-slate-900 dark:text-white">
              <span className="truncate pr-2">{createdKey.api_key}</span>
              <button
                onClick={() => handleCopy(createdKey.api_key, 'modal_key')}
                className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-200 dark:bg-white/[0.05] transition-colors flex-shrink-0"
              >
                {copiedKey === 'modal_key' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Purple Gradient Done Button */}
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              className="w-full py-3 rounded-xl btn-gradient-purple text-white font-bold text-xs shadow-lg shadow-purple-600/30"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleGenerateKey} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Key Name / Bot Label</label>
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. AnonX Music Cluster #3"
                className="w-full bg-slate-100 dark:bg-[#08090D] border border-slate-300 dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-white/[0.06] text-slate-800 dark:text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating}
                className="px-5 py-2.5 rounded-xl btn-gradient-purple text-white font-bold shadow-md flex items-center space-x-2"
              >
                {generating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Generate Key Now</span>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}

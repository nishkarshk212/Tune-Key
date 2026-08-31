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
  Check, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck
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

  // Extract real dynamic stats
  const keysList = data?.keys || [];
  const activeKeysCount = data?.stats?.activeKeysCount ?? 0;
  const todayRequests = data?.stats?.todayRequests ?? 0;
  const totalDailyQuota = data?.stats?.totalDailyQuota ?? (keysList[0]?.daily_quota || 0);
  const activePlanName = keysList[0]?.plan_name || (user?.role === 'admin' ? 'Super Admin' : 'Free Tier');
  const usagePercentage = totalDailyQuota > 0 ? Math.min(100, Math.round((todayRequests / totalDailyQuota) * 100)) : 0;

  // Real Dynamic 7-day usage chart
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'API Requests',
        data: todayRequests > 0 ? [0, 0, 0, 0, 0, 0, todayRequests] : [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        tension: 0.45,
        fill: true,
        pointBackgroundColor: '#8b5cf6',
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
        bodyColor: '#8b5cf6',
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
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Developer Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <strong className="text-purple-500 dark:text-purple-400">{user?.name || user?.email}</strong>!
          </p>
        </div>

        <Link
          to="/dashboard/plans"
          className="px-4 py-2.5 rounded-xl btn-gradient-purple text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-all self-start sm:self-auto"
        >
          <Crown className="w-4 h-4" />
          <span>Upgrade YouTube API Plan</span>
        </Link>
      </div>

      {/* 4 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total API Keys */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total API Keys</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {activeKeysCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Active Gateway Keys</p>
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
              {todayRequests.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">of {totalDailyQuota.toLocaleString()} daily limit</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Plan */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Plan</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {activePlanName}
            </p>
            <p className="text-[11px] text-purple-400 mt-0.5">
              {user?.role === 'admin' ? 'Full Admin Access' : 'Dedicated Quota'}
            </p>
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
              ₹0.00
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Wallet Credit</p>
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
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Live Traffic Telemetry</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right: Today's Usage Circular Gauge (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] flex flex-col justify-between text-center">
          <div className="flex items-center justify-between text-left">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Quota Usage</h3>
              <p className="text-xs font-mono font-semibold text-slate-500 mt-0.5">
                {todayRequests.toLocaleString()} <span className="text-slate-600 font-normal">/ {totalDailyQuota.toLocaleString()}</span>
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
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#38bdf8" />
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
            <span>Daily Quota Resets at Midnight (UTC)</span>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: YOUR API KEYS TABLE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] space-y-4">
        
        {/* Table Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active YouTube Gateway Keys</h3>
            <p className="text-xs text-slate-500">Your provisioned API keys for YukkiMusic, AnonXMusic, and Telegram bots.</p>
          </div>
          <Link
            to="/dashboard/plans"
            className="px-4 py-2 rounded-xl btn-gradient-purple text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-purple-600/30 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Get New Key / Plan</span>
          </Link>
        </div>

        {/* Table Content */}
        {keysList.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Key className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No API Keys Active Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select a plan (Free ₹0 or Paid) on the Plans page to generate your dedicated YouTube bot API Key.
            </p>
            <Link
              to="/dashboard/plans"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg"
            >
              <span>Explore Plans</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-white/[0.04]">
                  <th className="pb-3 font-semibold">NAME / BOT TYPE</th>
                  <th className="pb-3 font-semibold">API KEY</th>
                  <th className="pb-3 font-semibold">STATUS</th>
                  <th className="pb-3 font-semibold">TODAY'S REQUESTS</th>
                  <th className="pb-3 font-semibold">DAILY LIMIT</th>
                  <th className="pb-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {keysList.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{k.key_name || 'YouTube Bot Key'}</div>
                      <div className="text-[10px] text-purple-400 font-medium">{k.plan_name || k.bot_type}</div>
                    </td>
                    <td className="py-4 font-mono text-slate-600 dark:text-slate-300">
                      {revealedKeys[k.id] ? k.api_key : `${k.api_key?.slice(0, 10)}••••••••••••••••`}
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        {k.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-600 dark:text-slate-300">
                      {(k.today_requests || 0).toLocaleString()}
                    </td>
                    <td className="py-4 font-mono text-slate-600 dark:text-slate-300">
                      {(k.daily_quota || 500).toLocaleString()} / day
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 text-slate-400">
                        <button
                          onClick={() => handleCopy(k.api_key, k.id)}
                          className="p-1.5 hover:text-white rounded hover:bg-white/[0.05] transition-colors"
                          title="Copy Key"
                        >
                          {copiedKey === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => toggleReveal(k.id)}
                          className="p-1.5 hover:text-white rounded hover:bg-white/[0.05] transition-colors"
                          title="Reveal Key"
                        >
                          {revealedKeys[k.id] ? <EyeOff className="w-3.5 h-3.5 text-purple-400" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}

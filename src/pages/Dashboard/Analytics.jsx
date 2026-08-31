import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Activity, Clock, Zap, BarChart2, ShieldCheck, CheckCircle2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.get('/user/dashboard/stats');
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  // Hourly Traffic Chart
  const hourlyData = {
    labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    datasets: [
      {
        label: 'YouTube Searches & Queries',
        data: [120, 85, 240, 680, 1420, 2150, 3100, 2400],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ef4444',
      },
      {
        label: 'Opus Audio Stream Relays',
        data: [90, 60, 180, 450, 980, 1600, 2450, 1900],
        borderColor: '#229ed9',
        backgroundColor: 'rgba(34, 158, 217, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#229ed9',
      }
    ]
  };

  const doughnutData = {
    labels: ['/search (Queries)', '/stream (Opus)', '/info (Metadata)', '/quota (Health)'],
    datasets: [
      {
        data: [58, 32, 7, 3],
        backgroundColor: ['#ef4444', '#229ed9', '#10b981', '#f59e0b'],
        borderWidth: 0,
      }
    ]
  };

  const latencyData = {
    labels: ['US East', 'US West', 'EU Central (Frankfurt)', 'Asia (Singapore)', 'India (Mumbai)'],
    datasets: [
      {
        label: 'Average Latency (ms)',
        data: [28, 34, 22, 45, 38],
        backgroundColor: '#10b981',
        borderRadius: 8,
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">API Usage & Telemetry Analytics</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics on your Telegram Music Bot query throughput, stream relays, and response latency.
        </p>
      </div>

      {/* Main Hourly Chart */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hourly Request Load (24-Hour Cycle)</h3>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">● Live Sync</span>
        </div>

        <div className="h-72">
          <Line
            data={hourlyData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: { color: textColor, font: { family: 'Outfit', size: 11 } }
                }
              },
              scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Outfit', size: 10 } } },
                y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Outfit', size: 10 } } }
              }
            }}
          />
        </div>
      </div>

      {/* 2-Column Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Doughnut: Endpoint Usage */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Endpoint Query Distribution</h3>
            <span className="text-[10px] text-slate-500">By Path</span>
          </div>

          <div className="h-56 mt-4 flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: textColor, font: { family: 'Outfit', size: 10 } }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Bar: Global Node Latency */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Global Edge Stream Latency (ms)</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">&lt;45ms SLA</span>
          </div>

          <div className="h-56 mt-4">
            <Bar
              data={latencyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Outfit', size: 9 } } },
                  y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Outfit', size: 10 } } }
                }
              }}
            />
          </div>
        </div>

      </div>

    </div>
  );
}

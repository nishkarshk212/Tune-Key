import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  Receipt, 
  Terminal, 
  ArrowLeft, 
  Radio, 
  Activity, 
  Server, 
  Zap,
  Sliders,
  Sun,
  Moon
} from 'lucide-react';

export default function AdminLayout() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const isCurrent = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: 'Admin Overview', path: '/admin', icon: Activity },
    { label: 'User Accounts', path: '/admin/users', icon: Users },
    { label: 'Global API Keys', path: '/admin/keys', icon: Key },
    { label: 'Orders & Payments', path: '/admin/orders', icon: Receipt },
    { label: 'Live Traffic Logs', path: '/admin/logs', icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B12] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0B0F17] border-r border-amber-500/20 flex flex-col justify-between p-4 flex-shrink-0 transition-colors duration-300">
        <div>
          {/* Header */}
          <div className="px-2 py-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">VBIT-API-STORE</h2>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Admin Portal</span>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrent(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: Back to App */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="p-3 bg-slate-100 dark:bg-[#06090e] border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Relay Nodes:</span>
              <span>12 Online</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mt-1">
              <span>Upstream Quota:</span>
              <span className="text-slate-900 dark:text-white font-mono">98.4%</span>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-16 px-6 bg-white/90 dark:bg-[#0B0F17]/90 border-b border-amber-500/20 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"></span>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              TuneKey SaaS Administration Control Unit
            </h1>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">Admin: <strong className="text-amber-600 dark:text-amber-400">{user?.email}</strong></span>
            
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <div className="p-6 flex-1">
          <Outlet />
        </div>
      </main>

    </div>
  );
}

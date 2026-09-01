import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/Modal';
import { 
  LayoutDashboard, 
  Key, 
  Package, 
  BarChart3, 
  ShoppingCart, 
  Receipt, 
  BookOpen, 
  Headphones, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Bell, 
  Menu, 
  X,
  ShieldCheck,
  ChevronDown,
  User,
  AlertTriangle,
  Wallet
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'YouTube Streaming Gateway Online',
      message: 'Active endpoint: https://vbit-api-store.vercel.app/api/v1/yt. Direct Opus 160kbps audio enabled.',
      time: 'Just now',
      unread: true,
    },
    {
      id: 2,
      title: 'Daily Quota Reset System',
      message: 'Your key quotas automatically reset daily at 00:00 UTC with real-time telemetry.',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: '24/7 Telegram Support Channel',
      message: 'Join @VAMPIREUPDATES for real-time bot maintenance updates and live support.',
      time: '1 day ago',
      unread: false,
    },
  ]);

  const hasUnread = notifications.some(n => n.unread);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const isCurrent = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'API Keys', path: '/dashboard/keys', icon: Key },
    { label: 'Plans', path: '/dashboard/plans', icon: Package },
    { label: 'Wallet & Top-up', path: '/dashboard/wallet', icon: Wallet },
    { label: 'Usage', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Orders & Invoices', path: '/dashboard/invoices', icon: Receipt },
    { label: 'Documentation', path: '/docs', icon: BookOpen },
    { label: 'Support', path: 'https://t.me/VAMPIREUPDATES', isExternal: true, icon: Headphones },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#0D0E15] border-r border-slate-200 dark:border-white/[0.06] flex-col justify-between p-5 flex-shrink-0">
        <div>
          
          {/* Logo: VBIT-API-STORE */}
          <Link to="/" className="flex items-center space-x-2.5 px-2 py-1 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-purple-500/20">
              <Key className="w-4 h-4 text-white -rotate-45" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              VBIT<span className="text-purple-500">-API</span>-STORE
            </span>
          </Link>

          {/* Navigation items list */}
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrent(item.path);

              if (item.isExternal) {
                return (
                  <a
                    key={item.label}
                    href={item.path}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-purple-600/15 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-purple-500' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/[0.06]">
                <Link
                  to="/admin"
                  className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition-all border border-amber-500/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Prominent Sidebar Logout Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06]">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Header Bar */}
        <header className="h-20 px-6 sm:px-8 bg-white/80 dark:bg-[#08090D]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between transition-colors duration-300">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.05]"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="text-lg font-black text-white">
              VBIT<span className="text-purple-500">-API</span>-STORE
            </Link>
          </div>

          <div className="hidden lg:block"></div>

          {/* Right Header: Theme, Bell, Profile Dropdown */}
          <div className="flex items-center space-x-4">
            
            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserDropdownOpen(false);
                }}
                title="Notifications"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] p-3 z-40 shadow-2xl text-xs animate-scaleUp">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">Notifications</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                          {notifications.filter(n => n.unread).length} new
                        </span>
                      </div>
                      {notifications.some(n => n.unread) && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-purple-500 hover:text-purple-600 dark:hover:text-purple-300 font-semibold cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="py-2 max-h-80 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item))}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              n.unread 
                                ? 'bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20' 
                                : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-start space-x-2.5">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white text-[12px] leading-tight">{n.title}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed mt-1 break-words">{n.message}</p>
                                <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">{n.time}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                      <a
                        href="https://t.me/VAMPIREUPDATES"
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-500 hover:underline flex items-center space-x-1 font-semibold"
                      >
                        <span>Telegram Channel ↗</span>
                      </a>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Capsule Pill with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 p-1.5 px-3 rounded-2xl bg-slate-100 dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] hover:border-purple-500/50 transition-all cursor-pointer"
              >
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover border border-purple-500/40"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">
                    {user?.name || user?.email?.split('@')[0] || 'Developer'}
                  </p>
                  <p className="text-[10px] text-purple-400 font-medium">Premium User</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] p-2 z-40 shadow-2xl text-xs animate-scaleUp">
                    
                    <div className="p-3 border-b border-slate-100 dark:border-white/[0.06] space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">{user?.name || 'Nishkarsh'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className="flex items-center justify-between pt-2 text-[11px]">
                        <span className="text-slate-500">Credit Balance:</span>
                        <span className="font-mono text-emerald-500 font-bold">₹{Number(user?.balance || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-white hover:bg-purple-600/15 transition-colors font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-purple-400" />
                        <span>Dashboard Overview</span>
                      </Link>

                      <Link
                        to="/dashboard/keys"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-white hover:bg-purple-600/15 transition-colors font-medium"
                      >
                        <Key className="w-4 h-4 text-indigo-400" />
                        <span>My API Keys</span>
                      </Link>

                      <Link
                        to="/dashboard/wallet"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-white hover:bg-purple-600/15 transition-colors font-medium"
                      >
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>Wallet & Add Funds</span>
                      </Link>

                      <Link
                        to="/dashboard/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-white hover:bg-purple-600/15 transition-colors font-medium"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/10 font-bold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Mobile Sidebar Dropdown */}
        {mobileSidebarOpen && (
          <div className="lg:hidden glass-panel border-b border-slate-200 dark:border-white/[0.08] px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrent(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    active
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileSidebarOpen(false);
                setIsLogoutModalOpen(true);
              }}
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Dynamic Dashboard Page Outlet */}
        <main className="p-6 sm:p-8 flex-1">
          <Outlet />
        </main>

      </div>

      {/* SIGN OUT CONFIRMATION MODAL */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign Out"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-xs text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mx-auto">
            <LogOut className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ready to leave?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Are you sure you want to sign out of your <strong>VBIT-API-STORE</strong> dashboard?
            </p>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(false)}
              className="py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30 transition-all"
            >
              Yes, Sign Out
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SignInModal from './SignInModal';
import { 
  Key, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck,
  Send,
  Zap,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [signInModalTab, setSignInModalTab] = useState('signin');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-[#08090D]/85 border-b border-slate-200 dark:border-white/[0.06] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Brand: VBIT-API-STORE */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Key className="w-4 h-4 text-white -rotate-45" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                VBIT<span className="text-purple-500">-API</span>-STORE
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-400">
              <Link
                to="/"
                className={`hover:text-slate-900 dark:hover:text-white transition-colors ${
                  isCurrent('/') ? 'text-slate-900 dark:text-white font-semibold' : ''
                }`}
              >
                Home
              </Link>
              <a
                href="/#features"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="/#pricing"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Pricing
              </a>
              <Link
                to="/docs"
                className={`hover:text-slate-900 dark:hover:text-white transition-colors ${
                  isCurrent('/docs') ? 'text-slate-900 dark:text-white font-semibold' : ''
                }`}
              >
                Docs
              </Link>
              <a
                href="/#faq"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                FAQ
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center space-x-4">
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>

              {/* Auth State Buttons */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2.5 p-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] hover:border-purple-500/50 transition-colors"
                  >
                    <img
                      src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt="User"
                      className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-900 border border-purple-500/30"
                    />
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.name || 'Nishkarsh'}</p>
                      <p className="text-[10px] text-purple-400 font-medium">Premium User</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 z-40 border border-slate-200 dark:border-white/[0.08] text-sm animate-scaleUp">
                        <div className="px-3 py-2 border-b border-slate-200 dark:border-white/[0.06]">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.email}</p>
                          <div className="mt-1 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Balance:</span>
                            <span className="font-mono text-emerald-500 font-bold">₹{user?.balance ? user.balance.toFixed(2) : '500.00'}</span>
                          </div>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-white hover:bg-purple-600/15 transition-colors font-medium text-xs"
                          >
                            <LayoutDashboard className="w-4 h-4 text-purple-400" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/dashboard/keys"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-white hover:bg-purple-600/15 transition-colors font-medium text-xs"
                          >
                            <Key className="w-4 h-4 text-indigo-400" />
                            <span>API Keys</span>
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors font-semibold text-xs"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Admin Portal</span>
                            </Link>
                          )}
                        </div>

                        <div className="pt-1 border-t border-slate-200 dark:border-white/[0.06]">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors font-medium text-xs"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setSignInModalTab('signin');
                      setSignInModalOpen(true);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setSignInModalTab('register');
                      setSignInModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl btn-gradient-purple text-white text-sm font-bold shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-all"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-slate-200 dark:border-white/[0.08] px-4 pt-2 pb-5 space-y-2 animate-fadeIn">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] font-medium text-sm"
            >
              Home
            </Link>
            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] font-medium text-sm"
            >
              Features
            </a>
            <a
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] font-medium text-sm"
            >
              Pricing
            </a>
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] font-medium text-sm"
            >
              Documentation
            </Link>
            <a
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] font-medium text-sm"
            >
              FAQ
            </a>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-purple-400 font-bold text-sm"
              >
                Open Dashboard
              </Link>
            ) : (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSignInModalTab('signin');
                    setSignInModalOpen(true);
                  }}
                  className="text-center py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-xs font-bold text-slate-900 dark:text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSignInModalTab('register');
                    setSignInModalOpen(true);
                  }}
                  className="text-center py-2 rounded-xl btn-gradient-purple text-xs font-bold text-white"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Quick Sign In / Registration Modal Panel */}
      <SignInModal
        isOpen={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
        defaultTab={signInModalTab}
      />
    </>
  );
}

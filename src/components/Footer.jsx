import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, ShieldCheck, Zap, Send, Github, Heart, CheckCircle2, Key } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-[#070A10] border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Key className="w-4 h-4 text-white -rotate-45" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                VBIT<span className="text-purple-500">-API</span>-STORE
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Ultra-low latency, high-quota YouTube API keys and direct audio streaming proxy built specifically for Telegram Music Bots (YukkiMusic, AnonX, PyTgCalls). Anti-ban IP rotation and 99.99% Voice Chat uptime guarantee.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All 12 Global Streaming Relay Nodes Operational</span>
            </div>
          </div>

          {/* Telegram Bots */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold text-xs tracking-wider uppercase mb-3">Supported Bots</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>YukkiMusic Bot v3</span>
              </li>
              <li className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>AnonXMusic Bot</span>
              </li>
              <li className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>PyTgCalls Voice Client</span>
              </li>
              <li className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>Victoria & Daisy Music</span>
              </li>
              <li className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>Custom Python / Node Bots</span>
              </li>
            </ul>
          </div>

          {/* Resources & Docs */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold text-xs tracking-wider uppercase mb-3">Developer Docs</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Quickstart Integration</Link>
              </li>
              <li>
                <Link to="/docs#endpoints" className="hover:text-slate-900 dark:hover:text-white transition-colors">API Endpoints Reference</Link>
              </li>
              <li>
                <Link to="/docs#env-vars" className="hover:text-slate-900 dark:hover:text-white transition-colors">Bot .env Generator</Link>
              </li>
              <li>
                <Link to="/docs#pytgcalls" className="hover:text-slate-900 dark:hover:text-white transition-colors">PyTgCalls Stream Handler</Link>
              </li>
              <li>
                <Link to="/dashboard/keys" className="hover:text-slate-900 dark:hover:text-white transition-colors">Generate API Credentials</Link>
              </li>
            </ul>
          </div>

          {/* Community & Support */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold text-xs tracking-wider uppercase mb-3">Community & Support</h4>
            <div className="space-y-3">
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-telegram/15 border border-telegram/30 text-telegram-dark dark:text-telegram-light hover:bg-telegram/25 transition-all text-xs font-semibold"
              >
                <Send className="w-4 h-4" />
                <span>Join Telegram Group</span>
              </a>
              <div className="text-[11px] text-slate-500 leading-tight">
                24/7 Developer Support, Quota Upgrades, and Bot Deployment help on Telegram.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 VBIT-API-STORE. Engineered for Telegram Voice Chat Music Bots.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="hover:text-slate-700 dark:hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-400 transition-colors cursor-pointer">API SLA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

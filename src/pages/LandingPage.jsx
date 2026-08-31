import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  Rocket, 
  ShieldCheck, 
  Puzzle, 
  Headphones, 
  Key, 
  ArrowRight, 
  Check, 
  Star, 
  Smile, 
  Clock, 
  Layers, 
  Radio, 
  Bot, 
  Send, 
  Code2, 
  Music, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  CheckCircle2,
  Search,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(0);
  const [faqCategory, setFaqCategory] = useState('All');
  const [faqSearch, setFaqSearch] = useState('');

  const features = [
    {
      icon: Zap,
      title: 'Instant Delivery',
      desc: 'Get your API key instantly after successful payment.',
      color: 'text-purple-400'
    },
    {
      icon: Rocket,
      title: 'High Performance',
      desc: 'Optimized for Telegram Music Bots. Super fast and reliable.',
      color: 'text-cyan-400'
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Unique',
      desc: 'Each API key is unique, private and tied to your account.',
      color: 'text-emerald-400'
    },
    {
      icon: Puzzle,
      title: 'Easy Integration',
      desc: 'Simple documentation and code examples to get you started.',
      color: 'text-indigo-400'
    },
    {
      icon: Headphones,
      title: 'Premium Support',
      desc: '24/7 support via Telegram and support system.',
      color: 'text-pink-400'
    }
  ];

  const plans = [
    {
      id: 'plan_free',
      name: 'FREE',
      monthlyPrice: 0,
      yearlyPrice: 0,
      requests: '500 Requests / day',
      keys: '1 Dedicated API Key',
      support: 'Community Support',
      uptime: '98% Uptime',
      isPopular: false
    },
    {
      id: 'plan_basic',
      name: 'BASIC',
      monthlyPrice: 49,
      yearlyPrice: 39,
      requests: '1,000 Requests / day',
      keys: '1 Dedicated API Key',
      support: 'Standard Support',
      uptime: '99% Uptime',
      isPopular: false
    },
    {
      id: 'plan_pro',
      name: 'PRO',
      monthlyPrice: 99,
      yearlyPrice: 79,
      requests: '1,500 Requests / day',
      keys: '1 Dedicated API Key',
      support: 'Priority Support',
      uptime: '99.9% Uptime',
      isPopular: true
    },
    {
      id: 'plan_advanced',
      name: 'ADVANCED',
      monthlyPrice: 149,
      yearlyPrice: 119,
      requests: '2,000 Requests / day',
      keys: '1 Dedicated API Key',
      support: 'Priority Support',
      uptime: '99.9% Uptime',
      isPopular: false
    },
    {
      id: 'plan_unlimited',
      name: 'UNLIMITED',
      monthlyPrice: 199,
      yearlyPrice: 159,
      requests: '2,500 Requests / day',
      keys: '1 Dedicated API Key',
      support: 'VIP Support',
      uptime: '99.9% Uptime',
      isPopular: false
    }
  ];

  const faqs = [
    {
      category: 'Bot Setup',
      q: 'What is the official API Base URL for Telegram Music Bots?',
      a: 'The official API base URL is https://vbit-api-store.vercel.app/api/v1/yt. In your bot\'s config.env or .env file, configure:\nAPI_URL=https://vbit-api-store.vercel.app/api/v1/yt\nAPI_KEY=your_generated_key'
    },
    {
      category: 'General',
      q: 'Why do Telegram Music Bots need VBIT-API-STORE?',
      a: 'Telegram Music Bots (such as YukkiMusic, AnonX, and PyTgCalls) make thousands of requests to search tracks and stream audio. Standard Google API keys hit quota limits within hours (HTTP 429). VBIT-API-STORE provides dedicated, high-quota API keys that keep your bots online 24/7 with zero downtime.'
    },
    {
      category: 'API & Quotas',
      q: 'How does the Free Tier key and daily quota reset work?',
      a: 'Every new account gets a Free Bot Key with 500 requests/day. Quotas automatically reset every day at 00:00 UTC. You can monitor your real-time usage and remaining daily quota directly on your live dashboard.'
    },
    {
      category: 'Bot Setup',
      q: 'Is VBIT-API-STORE compatible with YukkiMusic, AnonX, and PyTgCalls?',
      a: 'Yes! VBIT-API-STORE is a 100% plug-and-play drop-in replacement. We provide direct 160kbps Opus stream links that plug directly into PyTgCalls without consuming server CPU for FFmpeg conversion.'
    },
    {
      category: 'Payments',
      q: 'How do I pay with Paytm QR / UPI in India?',
      a: 'Navigate to "Add Funds" in your dashboard, scan the merchant Paytm UPI QR code with any UPI app (GPay, PhonePe, Paytm), and submit your 12-digit UTR transaction ID. Your balance is credited upon quick approval.'
    },
    {
      category: 'API & Quotas',
      q: 'How fast is key delivery after payment?',
      a: 'Instant and automated! As soon as your plan is activated, your high-quota YouTube API key is provisioned immediately in your dashboard with one-click copy.'
    },
    {
      category: 'General',
      q: 'Can I generate multiple API keys in one plan?',
      a: 'No. Each plan subscription provisions 1 dedicated high-speed API key to guarantee maximum performance, dedicated bandwidth, and strict quota allocation for your Telegram music bot. If you need a fresh token, you can instantly regenerate your key at any time from your dashboard.'
    },
    {
      category: 'General',
      q: 'How do I get 24/7 technical assistance?',
      a: 'You can reach out directly to our support team on Telegram at @VAMPIREUPDATES. We provide 24/7 assistance for bot deployment, token configuration, and custom enterprise limits.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = faqCategory === 'All' || faq.category === faqCategory;
    const matchesSearch = faqSearch === '' || 
      faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
      faq.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
        
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Text & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                <span>#1 Source for Telegram Music Bots</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
                Power Your Telegram <br />
                Music Bot with <br />
                <span className="gradient-text-hero">VBIT-API-STORE</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
                Get fast, reliable and affordable YouTube API keys for your Telegram Music Bot. 99.9% uptime, high performance and developer friendly.
              </p>

              {/* Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/register"}
                  className="px-7 py-3.5 rounded-xl btn-gradient-purple text-white font-bold text-sm flex items-center space-x-2 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-all"
                >
                  <span>{isAuthenticated ? "Go to Dashboard" : "Get Started Now"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#pricing"
                  className="px-6 py-3.5 rounded-xl bg-slate-200/70 dark:bg-[#11131B] hover:bg-slate-300/80 dark:hover:bg-[#181B26] border border-slate-300 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all"
                >
                  View Pricing
                </a>
              </div>

              {/* Stats Bar */}
              <div className="pt-8 border-t border-slate-200 dark:border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-6">
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Smile className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">10K+</p>
                    <p className="text-[11px] text-slate-500">Happy Customers</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">99.9%</p>
                    <p className="text-[11px] text-slate-500">Uptime</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">1M+</p>
                    <p className="text-[11px] text-slate-500">API Requests/Day</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">24/7</p>
                    <p className="text-[11px] text-slate-500">Support</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: 3D Hologram & Floating Key Graphics */}
            <div className="lg:col-span-5 relative flex justify-center">
              
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                
                {/* Glowing Circular Stage / Pedestal */}
                <div className="absolute inset-8 rounded-full border border-purple-500/30 bg-gradient-to-b from-purple-600/10 via-indigo-900/20 to-transparent blur-sm"></div>
                <div className="absolute w-72 h-72 rounded-full border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-glow-spin"></div>

                {/* Central YouTube API Window Card */}
                <div className="relative z-10 w-80 rounded-2xl bg-[#0e1018] border border-white/[0.12] p-5 shadow-2xl space-y-4">
                  
                  {/* Top Mock Window Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 rounded bg-red-600 flex items-center justify-center text-[8px] font-bold text-white">
                        ▶
                      </div>
                      <span className="text-xs font-bold text-white tracking-wide">YouTube API</span>
                    </div>
                    <div className="flex space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                  </div>

                  {/* 3D Key Icon Glowing Centered */}
                  <div className="py-6 flex flex-col items-center justify-center relative">
                    <div className="relative p-5 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-[0_0_40px_rgba(139,92,246,0.6)] animate-float">
                      <Key className="w-12 h-12 text-white -rotate-45" />
                    </div>

                    {/* Pedestal Base Ring */}
                    <div className="mt-4 w-44 h-4 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-60 blur-sm"></div>
                  </div>

                  {/* Connected Status Notification */}
                  <div className="p-2.5 rounded-xl bg-[#090b10] border border-emerald-500/30 flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-white">API Connected</p>
                      <p className="text-[9px] text-slate-400">Your Telegram Bot is ready to rock! 🚀</p>
                    </div>
                  </div>

                </div>

                {/* Floating Orbit Badges */}
                <div className="absolute -top-2 right-4 p-2.5 rounded-xl bg-[#11131B] border border-purple-500/30 shadow-lg text-purple-400 animate-float z-20">
                  <Music className="w-5 h-5" />
                </div>

                <div className="absolute top-1/2 -left-4 p-2.5 rounded-xl bg-[#11131B] border border-cyan-500/30 shadow-lg text-cyan-400 animate-float-slow z-20">
                  <Send className="w-5 h-5" />
                </div>

                <div className="absolute -bottom-2 right-8 p-2.5 rounded-xl bg-[#11131B] border border-indigo-500/30 shadow-lg text-indigo-400 animate-float z-20">
                  <Code2 className="w-5 h-5" />
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY CHOOSE VBIT-API-STORE SECTION */}
      <section id="features" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Why Choose VBIT-API-STORE?
          </h2>
        </div>

        {/* 5 Features Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] hover:border-purple-500/40 transition-all hover:-translate-y-1 group"
              >
                <div className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#161924] flex items-center justify-center ${item.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SIMPLE, TRANSPARENT PRICING SECTION */}
      <section id="pricing" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Simple, Transparent Pricing
          </h2>

          {/* Toggle Monthly / Yearly */}
          <div className="mt-6 inline-flex items-center space-x-3 text-xs font-semibold">
            <span className={billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                billingCycle === 'yearly' ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
            <span className={billingCycle === 'yearly' ? 'text-purple-400 font-bold' : 'text-slate-500'}>
              Yearly (Save 20%)
            </span>
          </div>
        </div>

        {/* 5 Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-12">
          {plans.map((p) => {
            const price = billingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice;

            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  p.isPopular
                    ? 'card-pro-glow bg-[#11131B] lg:-translate-y-2'
                    : 'bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07]'
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  {/* Plan Name */}
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {p.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-3 flex items-baseline">
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                      ₹{price}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">/month</span>
                  </div>

                  {/* Features List */}
                  <div className="mt-6 space-y-3 pt-6 border-t border-slate-200 dark:border-white/[0.06] text-xs">
                    <div className="flex items-center space-x-2.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{p.requests}</span>
                    </div>
                    <div className="flex items-center space-x-2.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{p.keys}</span>
                    </div>
                    <div className="flex items-center space-x-2.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{p.support}</span>
                    </div>
                    <div className="flex items-center space-x-2.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{p.uptime}</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8">
                  <Link
                    to={isAuthenticated ? `/dashboard/plans?selected=${p.id}` : `/register?plan=${p.id}`}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                      p.isPopular
                        ? 'btn-gradient-purple text-white shadow-lg shadow-purple-600/30'
                        : 'bg-slate-100 dark:bg-[#161924] hover:bg-slate-200 dark:hover:bg-[#1e2232] text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.08]'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

        {/* Payment Methods & Trust Bar */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          
          <div className="flex items-center space-x-4">
            <span>We accept</span>
            <div className="flex items-center space-x-2 font-bold text-slate-700 dark:text-slate-300">
              <span className="px-2 py-1 rounded bg-slate-200/60 dark:bg-[#11131B] border border-slate-300 dark:border-white/[0.06]">VISA</span>
              <span className="px-2 py-1 rounded bg-slate-200/60 dark:bg-[#11131B] border border-slate-300 dark:border-white/[0.06]">Mastercard</span>
              <span className="px-2 py-1 rounded bg-slate-200/60 dark:bg-[#11131B] border border-slate-300 dark:border-white/[0.06]">PayPal</span>
              <span className="px-2 py-1 rounded bg-slate-200/60 dark:bg-[#11131B] border border-slate-300 dark:border-white/[0.06]">UPI</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span>Trusted by 10,000+ developers worldwide</span>
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">4.9/5</span>
          </div>

        </div>
      </section>

      {/* 4. FAQ ACCORDION SECTION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support & Documentation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Everything you need to know about setting up your Telegram music bots, API keys, quotas, and payments.
          </p>
        </div>

        {/* Search & Categories */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions (e.g. API URL, Yukki, Quota, Paytm)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors shadow-sm"
            />
          </div>

          <div className="flex items-center justify-center flex-wrap gap-2">
            {['All', 'Bot Setup', 'API & Quotas', 'Payments', 'General'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  faqCategory === cat
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-white dark:bg-[#11131B] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.07] hover:border-purple-500/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] p-6 text-slate-400 text-xs">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
              <p>No questions matched your search query "{faqSearch}".</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'bg-white dark:bg-[#11131B] border-purple-500/40 shadow-xl shadow-purple-500/5'
                      : 'bg-white dark:bg-[#11131B] border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.15]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 pr-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-mono uppercase font-bold flex-shrink-0">
                        {faq.category}
                      </span>
                      <span>{faq.q}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-4 whitespace-pre-line">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Telegram 24/7 Support Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-purple-900/20 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Still have questions or need custom bot limits?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Our engineering team is active 24/7 on Telegram to help configure your music bots.</p>
          </div>
          <a
            href="https://t.me/VAMPIREUPDATES"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Join @VAMPIREUPDATES</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>

    </div>
  );
}

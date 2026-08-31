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
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(0);

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
      q: 'Why do Telegram Music Bots need VBIT-API-STORE?',
      a: 'Telegram Music Bots (such as YukkiMusic, AnonX, and PyTgCalls) make thousands of requests to search tracks and resolve audio streams. Free Google API keys hit quota limits within hours (HTTP 429). VBIT-API-STORE provides dedicated, high-quota API keys that keep your bots online 24/7 without drops.'
    },
    {
      q: 'How fast is key delivery after payment?',
      a: 'Instant and automated! As soon as your checkout completes (via UPI, Card, or PayPal), your high-quota YouTube API key is provisioned immediately in your dashboard.'
    },
    {
      q: 'Is VBIT-API-STORE compatible with YukkiMusic and AnonX bots?',
      a: 'Yes! VBIT-API-STORE is a 100% plug-and-play drop-in replacement. Simply paste your API key in your config.env file under YOUTUBE_API_KEY and restart your bot.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major payment options: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), and PayPal.'
    },
    {
      q: 'Can I generate multiple API keys under one subscription?',
      a: 'Yes! Depending on your chosen tier (Pro allows 3 keys, Advanced allows 10 keys, Unlimited offers unlimited keys), you can generate and manage multiple bot instances simultaneously.'
    }
  ];

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
      <section id="faq" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-purple-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

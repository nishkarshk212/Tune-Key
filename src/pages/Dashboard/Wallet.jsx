import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { 
  Wallet as WalletIcon, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Smartphone,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Wallet() {
  const { user, refreshUser } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Top-Up Form States
  const [depositAmount, setDepositAmount] = useState(99);
  const [customAmount, setCustomAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const QUICK_AMOUNTS = [49, 99, 199, 299, 499, 999];

  const fetchWallet = async () => {
    try {
      const res = await api.get('/user/wallet');
      if (res.data.success) {
        setWalletData(res.data);
      }
    } catch (err) {
      showNotification('Failed to load wallet data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    const timer = setInterval(() => {
      fetchWallet();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : depositAmount;

    if (!finalAmount || finalAmount < 10) {
      showNotification('Minimum top-up amount is ₹10', 'error');
      return;
    }

    if (!utrNumber || utrNumber.trim().length < 6) {
      showNotification('Please enter a valid 12-digit UTR number', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/user/wallet/deposit', {
        amount: finalAmount,
        utrNumber: utrNumber.trim(),
        paymentMethod: 'Paytm UPI QR'
      });

      if (res.data.success) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        showNotification(res.data.message || 'Deposit submitted successfully! Balance will be credited upon verification.');
        setUtrNumber('');
        setCustomAmount('');
        setShowQrModal(false);
        fetchWallet();
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to submit deposit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const currentEffectiveAmount = customAmount ? parseFloat(customAmount) || 0 : depositAmount;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Toast Notification */}
      {notification.message && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between animate-scaleUp shadow-xl ${
          notification.type === 'error' 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ message: '', type: '' })} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
            <WalletIcon className="w-3.5 h-3.5" />
            <span>Billing & Balance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Account Wallet & Funds
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Add funds via Paytm UPI QR to instantly activate subscriptions, purchase keys, or auto-renew bot plans.
          </p>
        </div>

        <button
          onClick={() => { setRefreshing(true); fetchWallet(); }}
          disabled={refreshing}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-white text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
          <span>Refresh Balance</span>
        </button>
      </div>

      {/* 1. Wallet Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Balance Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-purple-900/10 border border-purple-500/30 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <WalletIcon className="w-24 h-24 text-purple-400" />
          </div>
          <span className="text-xs text-purple-400 font-bold uppercase tracking-wider block">Available Balance</span>
          <div className="flex items-baseline space-x-1 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
              ₹{Number(walletData?.balance || user?.balance || 0).toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-bold">INR</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Ready for instant plan checkout & bot key activation
          </p>
        </div>

        {/* Total Deposited */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Lifetime Top-ups</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-2">
            ₹{Number(walletData?.totalDeposited || 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified UPI payments credited</p>
        </div>

        {/* Total Spent */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Subscriptions</span>
            <ArrowUpRight className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-2">
            ₹{Number(walletData?.totalSpent || 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Invested in high-speed bot keys</p>
        </div>

      </div>

      {/* 2. Main Action Area: Add Funds & QR Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Add Funds Form (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] shadow-xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Top-Up Wallet via UPI</h2>
                <p className="text-xs text-slate-500">Scan merchant QR or pay to UPI ID</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold">
              0% Gateway Fee
            </span>
          </div>

          {/* Quick Select Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              1. Select Top-Up Amount
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setDepositAmount(amt); setCustomAmount(''); }}
                  className={`py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    depositAmount === amt && !customAmount
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-500'
                      : 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-purple-500/50'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="mt-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  placeholder="Or enter custom amount (e.g. ₹500)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0D14] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* UTR Submission Form */}
          <form onSubmit={handleDepositSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                2. Enter 12-Digit UPI Transaction ID / UTR Number
              </label>
              <input
                type="text"
                required
                maxLength="25"
                placeholder="e.g. 423985729104 or Paytm Txn ID"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0D14] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Found in your Google Pay, PhonePe, or Paytm payment receipt details.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl btn-gradient-purple text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Deposit for ₹{currentEffectiveAmount}</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Right: Official Merchant QR & Details (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] shadow-xl flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
              <QrCode className="w-4 h-4" />
              <span>Official Paytm UPI Merchant</span>
            </div>

            {/* QR Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-center">
              <img
                src="/assets/paytm_qr.jpg"
                alt="Paytm Merchant UPI QR"
                className="w-44 h-44 sm:w-48 sm:h-48 mx-auto rounded-xl object-contain border border-slate-200 dark:border-white/[0.1] shadow-md bg-white p-2 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setShowQrModal(true)}
              />
              <p className="text-[11px] text-purple-400 font-semibold mt-2 cursor-pointer" onClick={() => setShowQrModal(true)}>
                🔍 Click to Zoom QR Code
              </p>
            </div>

            {/* Merchant Details */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0D14] border border-slate-200 dark:border-white/[0.06]">
                <div>
                  <span className="text-[10px] text-slate-400 block">Merchant Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">Mohammed Hakeeb</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold">Verified</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0D14] border border-slate-200 dark:border-white/[0.06]">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-slate-400 block">UPI ID / VPA</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white truncate block">
                    mohammadhakeeb@fam
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('mohammadhakeeb@fam')}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-600/15 hover:bg-purple-600 text-purple-400 hover:text-white text-[11px] font-bold transition-all flex items-center space-x-1 flex-shrink-0 cursor-pointer"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Note */}
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 text-[11px] text-slate-500 dark:text-slate-400 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <p>Deposits are credited automatically or verified within 2-5 minutes by admin.</p>
          </div>

        </div>

      </div>

      {/* 3. Fast Plan Activation with Wallet Balance */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Quick Plan Activation</h2>
            <p className="text-xs text-slate-500">Spend wallet credits directly to activate your dedicated YouTube API keys</p>
          </div>
          <Link
            to="/dashboard/plans"
            className="text-xs text-purple-400 hover:underline flex items-center space-x-1 font-semibold"
          >
            <span>All Plans</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <Link
            to="/dashboard/plans"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-purple-500/40 transition-all block group"
          >
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-900 dark:text-white">FREE TIER</span>
              <span className="text-emerald-400 font-mono">₹0</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">500 req/day trial key</p>
          </Link>

          <Link
            to="/dashboard/plans"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-purple-500/40 transition-all block group"
          >
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-900 dark:text-white">BASIC TIER</span>
              <span className="text-purple-400 font-mono">₹49/mo</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">1,000 req/day dedicated</p>
          </Link>

          <Link
            to="/dashboard/plans"
            className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-500 transition-all block group"
          >
            <div className="flex justify-between items-center font-bold">
              <span className="text-purple-300 font-black">PRO TIER ⭐</span>
              <span className="text-purple-400 font-mono">₹99/mo</span>
            </div>
            <p className="text-[11px] text-purple-300/80 mt-1">1,500 req/day + 10 RPS</p>
          </Link>

          <Link
            to="/dashboard/plans"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-purple-500/40 transition-all block group"
          >
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-900 dark:text-white">UNLIMITED</span>
              <span className="text-purple-400 font-mono">₹299/mo</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Unlimited requests & 10 keys</p>
          </Link>
        </div>
      </div>

      {/* 4. Transactions Ledger Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Wallet & Transaction History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Transaction ID / Order</th>
                <th className="pb-3">Type / Description</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Loading wallet ledger...</td>
                </tr>
              ) : !walletData?.transactions || walletData.transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    <WalletIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No deposit transactions yet. Use the form above to top up!
                  </td>
                </tr>
              ) : (
                walletData.transactions.map((tx) => {
                  const isDeposit = !tx.plan_id || tx.plan_id === 'wallet_deposit';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                        {tx.id}
                      </td>
                      <td className="py-3.5">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {isDeposit ? 'Wallet Deposit Top-Up' : `${tx.plan_name || 'Plan'} Subscription`}
                        </span>
                        {tx.transaction_id && (
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            UTR: {tx.transaction_id}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 font-mono font-bold">
                        <span className={isDeposit ? 'text-emerald-500 dark:text-emerald-400' : 'text-purple-400'}>
                          {isDeposit ? '+' : '-'}₹{Number(tx.amount || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {tx.payment_method || 'Paytm UPI'}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.payment_status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400'
                            : tx.payment_status === 'pending'
                            ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {tx.payment_status === 'completed' ? 'Approved' : tx.payment_status === 'pending' ? 'Pending' : 'Rejected'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono text-[11px] text-slate-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Zoom Modal */}
      <Modal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="Paytm UPI Merchant QR Scanner"
      >
        <div className="text-center space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 inline-block shadow-xl">
            <img
              src="/assets/paytm_qr.jpg"
              alt="Full QR"
              className="w-64 h-64 mx-auto object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">Mohammed Hakeeb</p>
            <p className="font-mono text-purple-400 text-xs mt-1">mohammadhakeeb@fam</p>
          </div>
          <p className="text-slate-400 text-[11px]">
            Scan with any UPI app (Paytm, Google Pay, PhonePe, BHIM, Cred) and submit your 12-digit UTR transaction number.
          </p>
        </div>
      </Modal>

    </div>
  );
}

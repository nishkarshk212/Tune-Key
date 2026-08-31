import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  Copy, 
  ArrowRight, 
  QrCode, 
  Clock,
  Sparkles,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // QR & UTR Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [botName, setBotName] = useState('');
  const [utrSubmittedOrder, setUtrSubmittedOrder] = useState(null);
  
  // Instant Free Activation / Success State
  const [successOrder, setSuccessOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans/list');
      if (res.data.success) {
        setPlans(res.data.plans);
        // Default to PRO plan
        const pro = res.data.plans.find(p => p.tier?.toLowerCase() === 'pro') || res.data.plans[2] || res.data.plans[0];
        setSelectedPlan(pro);
      }
    } catch (err) {
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const requestedPlanId = searchParams.get('selected');
    if (requestedPlanId && plans.length > 0) {
      const found = plans.find(p => p.id === requestedPlanId || p.tier?.toLowerCase() === requestedPlanId.toLowerCase());
      if (found) {
        setSelectedPlan(found);
      }
    }
  }, [searchParams, plans]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleInitiatePayment = () => {
    if (!selectedPlan) return;

    if (selectedPlan.price === 0) {
      // Free plan instant activation
      handleFreeActivation();
    } else {
      // Open Paytm UPI QR Modal
      setUtrNumber('');
      setError('');
      setShowQrModal(true);
    }
  };

  const handleFreeActivation = async () => {
    setError('');
    setProcessing(true);
    try {
      const res = await api.post('/plans/checkout', {
        planId: selectedPlan.id,
        paymentMethod: 'Free Activation',
        botName: `${selectedPlan.name} Free Key`
      });

      setSuccessOrder(res.data);
      triggerConfetti();
      refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to activate free plan.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitUtr = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setError('Please enter the 12-digit UPI UTR / Reference number.');
      return;
    }

    setError('');
    setProcessing(true);

    try {
      const res = await api.post('/payment/manual/submit-utr', {
        planId: selectedPlan.id,
        utrNumber: utrNumber.trim(),
        amount: selectedPlan.price,
        botName: botName.trim() || `${selectedPlan.name} Dedicated Key`
      });

      if (res.data.success) {
        setShowQrModal(false);
        setUtrSubmittedOrder(res.data.order);
        refreshUser();
      } else {
        setError(res.data.error || 'Failed to submit payment verification.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit UTR. Please check and try again.');
    } finally {
      setProcessing(false);
    }
  };

  const copyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Select a Plan</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Scan QR via Paytm, GPay, PhonePe, enter UTR reference number, and get your dedicated YouTube API Key activated.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: 5 Plans Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((p) => {
              const isSelected = selectedPlan?.id === p.id;
              const isPro = p.is_popular || p.tier?.toLowerCase() === 'pro';

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-[#11131B] border-2 border-blue-600 dark:border-purple-500 shadow-xl shadow-blue-500/15 dark:shadow-[0_0_35px_-5px_rgba(124,58,237,0.35)] ring-2 ring-blue-500/20 dark:ring-purple-500/20'
                      : 'bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] hover:border-blue-400 dark:hover:border-purple-500/40 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-bold uppercase tracking-wider ${
                        isSelected ? 'text-blue-700 dark:text-purple-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {p.name}
                      </h3>
                      {isPro && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-500 dark:to-purple-600 text-white shadow-sm">
                          POPULAR
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-baseline">
                      <span className={`text-2xl font-black font-mono ${
                        isSelected ? 'text-blue-900 dark:text-white' : 'text-slate-900 dark:text-white'
                      }`}>
                        {p.price === 0 ? 'FREE' : `₹${p.price}`}
                      </span>
                      {p.price > 0 && <span className="text-xs text-slate-500 ml-1">/mo</span>}
                    </div>

                    <div className="mt-4 space-y-2 pt-3 border-t border-slate-200/80 dark:border-white/[0.06] text-xs">
                      <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-emerald-400 font-bold' : 'text-emerald-500'}`} />
                        <span className="font-bold">{p.daily_quota?.toLocaleString()} req / day</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-emerald-400 font-bold' : 'text-emerald-500'}`} />
                        <span>1 Dedicated Key</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-emerald-400 font-bold' : 'text-emerald-500'}`} />
                        <span>{p.price === 0 ? 'Community Support' : 'Priority Support'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      className={`w-full py-2 rounded-xl font-bold text-xs transition-all ${
                        isSelected
                          ? 'bg-blue-600 hover:bg-blue-700 dark:btn-gradient-purple text-white shadow-md shadow-blue-500/25 dark:shadow-purple-500/25'
                          : 'bg-slate-100 dark:bg-[#161924] hover:bg-slate-200 dark:hover:bg-[#1e2232] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order Summary & QR Trigger Box (4 cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] space-y-6 sticky top-28 shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Order Summary
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold">
                Paytm UPI QR
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Selected Plan Details */}
            {selectedPlan && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{selectedPlan.name} Plan</p>
                    <p className="text-[11px] text-slate-500">{selectedPlan.daily_quota?.toLocaleString()} Requests / day</p>
                    <p className="text-[11px] text-slate-500">1 Dedicated API Key</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {selectedPlan.price === 0 ? '₹0' : `₹${selectedPlan.price}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1">
                    <span>Total (INR)</span>
                    <span className="font-mono text-purple-400 font-black">
                      {selectedPlan.price === 0 ? '₹0 (Free)' : `₹${selectedPlan.price}`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Badge */}
            {selectedPlan?.price > 0 && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-500 font-semibold text-[11px]">Pay via Paytm QR / UPI</p>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0E1018] border border-slate-200 dark:border-white/[0.08] space-y-1 text-[11px]">
                  <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold">
                    <QrCode className="w-4 h-4 text-purple-400" />
                    <span>Paytm QR (MOHAMMED HAKEEB)</span>
                  </div>
                  <p className="text-slate-500 text-[10px]">
                    Paytm, Google Pay, PhonePe, BHIM, RuPay on UPI
                  </p>
                </div>
              </div>
            )}

            {/* Pay / Activate CTA Button */}
            <button
              onClick={handleInitiatePayment}
              disabled={processing || !selectedPlan}
              className="w-full py-3.5 rounded-xl btn-gradient-purple text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : selectedPlan?.price === 0 ? (
                <>
                  <span>Activate Free Plan (500 req/day)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR & Pay ₹{selectedPlan?.price}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Verified & Instant Activation</span>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 📸 PAYTM QR CODE & UTR SUBMISSION MODAL */}
      {/* ========================================================================= */}
      {showQrModal && selectedPlan && (
        <Modal
          isOpen={true}
          onClose={() => setShowQrModal(false)}
          title={`Pay ₹${selectedPlan.price} via Paytm / UPI QR`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-5 text-xs">
            
            {/* QR Code Display */}
            <div className="text-center p-4 bg-slate-100 dark:bg-[#07080D] border border-slate-200 dark:border-white/[0.1] rounded-2xl space-y-3">
              <div className="inline-block p-2 bg-white rounded-2xl shadow-xl">
                <img 
                  src="/assets/paytm_qr.jpg" 
                  alt="Paytm QR Code - MOHAMMED HAKEEB" 
                  className="w-56 h-auto rounded-xl mx-auto object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Merchant: <strong className="text-purple-400">MOHAMMED HAKEEB</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Exact Amount to Pay: <strong className="text-emerald-400 text-sm font-mono">₹{selectedPlan.price}</strong>
                </p>
              </div>
            </div>

            {/* UTR Submission Form */}
            <form onSubmit={handleSubmitUtr} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  12-digit UTR / UPI Reference Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 423819283912 or UPI Ref ID"
                  className="w-full bg-slate-100 dark:bg-[#0E1018] border border-slate-300 dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  You can find the 12-digit UTR in your Paytm, GPay, or PhonePe payment receipt.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Bot Name / Note (Optional)
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="e.g. YukkiMusic Bot"
                  className="w-full bg-slate-100 dark:bg-[#0E1018] border border-slate-300 dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-[#161924] text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-[#1e2232] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl btn-gradient-purple text-white font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span>Submit for Admin Approval</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* ⏳ UTR SUBMITTED CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {utrSubmittedOrder && (
        <Modal
          isOpen={true}
          onClose={() => {
            setUtrSubmittedOrder(null);
            navigate('/dashboard/invoices');
          }}
          title="Payment Submitted for Verification!"
          maxWidth="max-w-md"
        >
          <div className="text-center py-4 space-y-4 text-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Clock className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                UTR Submitted Successfully!
              </h3>
              <p className="text-slate-500 mt-1">
                Your payment of <strong className="text-emerald-400 font-mono">₹{utrSubmittedOrder.amount}</strong> for plan <strong className="text-purple-400">{utrSubmittedOrder.planName}</strong> is awaiting admin confirmation.
              </p>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-[#07080D] border border-slate-200 dark:border-white/[0.1] rounded-xl text-left font-mono space-y-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Submitted UTR:</span>
                <span className="text-amber-400 font-bold">{utrSubmittedOrder.utr}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Status:</span>
                <span className="text-amber-400 font-bold uppercase">Pending Verification</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              The administrator will verify your UTR and activate your dedicated API key shortly. You can check the status anytime under Invoices / Orders.
            </p>

            <button
              onClick={() => {
                setUtrSubmittedOrder(null);
                navigate('/dashboard/invoices');
              }}
              className="w-full py-3 rounded-xl btn-gradient-purple text-white font-bold shadow-md shadow-purple-600/30"
            >
              View Order Status
            </button>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 🎉 INSTANT FREE ACTIVATION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {successOrder && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSuccessOrder(null);
            navigate('/dashboard/keys');
          }}
          title="Plan Activated!"
          maxWidth="max-w-md"
        >
          <div className="text-center py-4 space-y-4 text-xs">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                YouTube API Key Provisioned!
              </h3>
              <p className="text-slate-500 mt-1">
                Plan <strong className="text-purple-400">{successOrder.order?.planName || selectedPlan?.name}</strong> is now active on your account.
              </p>
            </div>

            {/* API Key Box with 1-Click Copy */}
            <div className="p-4 bg-slate-100 dark:bg-[#07080D] border border-slate-200 dark:border-white/[0.1] rounded-2xl text-left space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Dedicated YouTube API Key:</span>
                <span className="text-emerald-400 font-semibold font-mono">STATUS: ACTIVE</span>
              </div>
              <div className="flex items-center justify-between bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] p-2.5 rounded-xl">
                <code className="text-purple-400 font-mono font-bold text-xs truncate mr-2">
                  {successOrder.apiKey?.api_key || 'v-bit-free-key'}
                </code>
                <button
                  onClick={() => copyApiKey(successOrder.apiKey?.api_key || '')}
                  className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors flex-shrink-0"
                  title="Copy API Key"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {copied && <p className="text-[10px] text-emerald-400 text-right">Copied to clipboard!</p>}
            </div>

            <button
              onClick={() => {
                setSuccessOrder(null);
                navigate('/dashboard/keys');
              }}
              className="w-full py-3 rounded-xl btn-gradient-purple text-white font-bold shadow-md shadow-purple-600/30"
            >
              View My Keys
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}

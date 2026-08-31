import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Check, ShieldCheck, Zap, AlertCircle, Copy, ArrowRight, Radio, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // Razorpay (UPI, QR, Cards, NetBanking)
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
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
        const pro = res.data.plans.find(p => p.tier?.toLowerCase() === 'pro') || res.data.plans[1] || res.data.plans[0];
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
    loadRazorpayScript();
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

  const handleCheckout = async () => {
    if (!selectedPlan) return;

    setError('');
    setProcessing(true);

    try {
      // 1. Create order on backend
      const orderRes = await api.post('/payment/razorpay/create-order', {
        planId: selectedPlan.id,
        botName: `${selectedPlan.name} Dedicated Key`
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.error || 'Failed to create payment order');
      }

      const { orderId, amount, currency, keyId, dbOrderId } = orderRes.data;

      // 2. Check if Razorpay SDK is available and key is configured
      const isScriptLoaded = await loadRazorpayScript();

      if (isScriptLoaded && keyId && keyId.startsWith('rzp_')) {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency || 'INR',
          name: 'VBIT-API-STORE',
          description: `${selectedPlan.name} Plan - Dedicated YouTube API Key`,
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
          order_id: orderId,
          handler: async function (response) {
            try {
              setProcessing(true);
              const verifyRes = await api.post('/payment/razorpay/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: selectedPlan.id,
                botName: `${selectedPlan.name} Dedicated Key`,
                dbOrderId
              });

              if (verifyRes.data.success) {
                setSuccessOrder(verifyRes.data);
                triggerConfetti();
                refreshUser();
              } else {
                setError(verifyRes.data.error || 'Payment verification failed');
              }
            } catch (vErr) {
              setError(vErr.response?.data?.error || 'Payment verification error');
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#7C3AED'
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setError(resp.error?.description || 'Razorpay payment was declined');
          setProcessing(false);
        });
        rzp.open();
      } else {
        // Instant Sandbox/Test simulation when Razorpay keys are in testing mode
        const verifyRes = await api.post('/payment/razorpay/verify', {
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          planId: selectedPlan.id,
          botName: `${selectedPlan.name} Dedicated Key`,
          dbOrderId
        });

        setSuccessOrder(verifyRes.data);
        triggerConfetti();
        refreshUser();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || err.message || 'Payment initiation failed. Please try again.');
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
          Upgrade your YouTube API quota for Telegram Music Bots with instant automated key provisioning via Razorpay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: 4 Plans Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((p) => {
              const isSelected = selectedPlan?.id === p.id;
              const isPro = p.is_popular || p.tier?.toLowerCase() === 'pro';

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'card-pro-glow bg-[#11131B]'
                      : 'bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] hover:border-purple-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{p.name}</h3>
                      {isPro && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                          MOST POPULAR
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-baseline">
                      <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">₹{p.price}</span>
                      <span className="text-xs text-slate-500 ml-1">/month</span>
                    </div>

                    <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 dark:border-white/[0.06] text-xs">
                      <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{p.daily_quota?.toLocaleString()} Requests / day</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>1 Dedicated API Key</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Priority Support</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>99.9% Uptime</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                        isSelected
                          ? 'btn-gradient-purple text-white shadow-md'
                          : 'bg-slate-100 dark:bg-[#161924] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select Plan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order Summary Box (4 cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] space-y-6 sticky top-28 shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Order Summary
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                Razorpay Verified
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
                    ₹{selectedPlan.price}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1">
                    <span>Total (INR)</span>
                    <span className="font-mono text-purple-400 font-black">₹{selectedPlan.price}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods (Razorpay / UPI / Cards) */}
            <div className="space-y-2 text-xs">
              <p className="text-slate-500 font-semibold text-[11px]">Accepted Payment Methods</p>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0E1018] border border-slate-200 dark:border-white/[0.08] space-y-2">
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>UPI (GPay, PhonePe, Paytm, BHIM)</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>Debit / Credit Cards (Visa, Mastercard, RuPay)</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>NetBanking & Wallets</span>
                </div>
              </div>
            </div>

            {/* Pay / Activate CTA Button */}
            <button
              onClick={handleCheckout}
              disabled={processing || !selectedPlan}
              className="w-full py-3.5 rounded-xl btn-gradient-purple text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>
                    {selectedPlan?.price === 0 ? 'Activate FREE Plan (500 req/day)' : `Pay ₹${selectedPlan?.price} via Razorpay`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-bit Encrypted & Automated Provisioning</span>
            </div>

          </div>
        </div>

      </div>

      {/* Celebratory Success Order Confirmation Modal */}
      {successOrder && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSuccessOrder(null);
            navigate('/dashboard/keys');
          }}
          title="Payment Successful!"
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
                  {successOrder.apiKey?.api_key || 'yt_live_provisioned_key'}
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

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setSuccessOrder(null);
                  navigate('/dashboard/bot-config');
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-[#161924] hover:bg-slate-200 dark:hover:bg-[#1e2232] text-slate-800 dark:text-white font-bold transition-colors"
              >
                Bot Config Helper
              </button>
              <button
                onClick={() => {
                  setSuccessOrder(null);
                  navigate('/dashboard/keys');
                }}
                className="flex-1 py-3 rounded-xl btn-gradient-purple text-white font-bold shadow-md shadow-purple-600/30"
              >
                View My Keys
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

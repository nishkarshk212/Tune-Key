import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import confetti from 'canvas-confetti';
import { 
  Check, 
  CreditCard, 
  QrCode, 
  Coins, 
  Wallet, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [error, setError] = useState('');

  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/plans/list');
      const loadedPlans = res.data.plans || [];
      setPlans(loadedPlans);
      if (loadedPlans.length > 0) {
        // Default to Pro Plan
        const pro = loadedPlans.find(p => p.tier?.toLowerCase() === 'pro') || loadedPlans[1] || loadedPlans[0];
        setSelectedPlan(pro);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
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
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;

    setError('');
    setProcessing(true);

    try {
      const res = await api.post('/plans/checkout', {
        planId: selectedPlan.id,
        paymentMethod,
        botName: `${selectedPlan.name} Key`
      });

      setSuccessOrder(res.data);
      triggerConfetti();
      refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Select a Plan</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upgrade your YouTube API quota for Telegram Music Bots with instant automated key provisioning.
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
                      <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">${p.price}</span>
                      <span className="text-xs text-slate-500 ml-1">/month</span>
                    </div>

                    <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 dark:border-white/[0.06] text-xs">
                      <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{p.daily_quota?.toLocaleString()} Requests / day</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{p.max_keys} API Key{p.max_keys > 1 ? 's' : ''}</span>
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

        {/* Right: Order Summary Box matching bottom right of screenshot (4 cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.07] space-y-6 sticky top-28">
            
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              Order Summary
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
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
                    <p className="text-[11px] text-slate-500">{selectedPlan.max_keys} API Keys</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    ${selectedPlan.price?.toFixed(2)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono">${selectedPlan.price?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1">
                    <span>Total</span>
                    <span className="font-mono text-purple-400">${selectedPlan.price?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-2 text-xs">
              <p className="text-slate-500 font-semibold text-[11px]">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    paymentMethod === 'UPI'
                      ? 'border-purple-500 bg-purple-500/15 text-white'
                      : 'border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#0E1018] text-slate-400'
                  }`}
                >
                  UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    paymentMethod === 'Card'
                      ? 'border-purple-500 bg-purple-500/15 text-white'
                      : 'border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#0E1018] text-slate-400'
                  }`}
                >
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('PayPal')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    paymentMethod === 'PayPal'
                      ? 'border-purple-500 bg-purple-500/15 text-white'
                      : 'border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#0E1018] text-slate-400'
                  }`}
                >
                  PayPal
                </button>
              </div>
            </div>

            {/* Pay CTA Button */}
            <button
              onClick={handleCheckout}
              disabled={processing || !selectedPlan}
              className="w-full py-3.5 rounded-xl btn-gradient-purple text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Pay ${selectedPlan?.price?.toFixed(2)} Securely</span>
              )}
            </button>

          </div>
        </div>

      </div>

      {/* Success Order Confirmation Modal */}
      {successOrder && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSuccessOrder(null);
            navigate('/dashboard');
          }}
          title="Order Completed!"
          maxWidth="max-w-md"
        >
          <div className="text-center py-4 space-y-4 text-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Your API Key has been generated!
              </h3>
              <p className="text-slate-500 mt-1">Plan {successOrder.order?.planName} is now active.</p>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-[#07080D] border border-slate-200 dark:border-white/[0.1] rounded-xl text-left font-mono">
              <span className="text-slate-400 text-[10px] block">API Key:</span>
              <span className="text-purple-400 font-bold text-xs">{successOrder.apiKey?.api_key}</span>
            </div>

            <button
              onClick={() => {
                setSuccessOrder(null);
                navigate('/dashboard');
              }}
              className="w-full py-3 rounded-xl btn-gradient-purple text-white font-bold"
            >
              Done
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, 
  QrCode, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Eye
} from 'lucide-react';

export default function PaymentSettings() {
  const [upiId, setUpiId] = useState('mohammadhakeeb@fam');
  const [merchantName, setMerchantName] = useState('Mohammed Hakeeb');
  const [qrUrl, setQrUrl] = useState('/assets/paytm_qr.jpg');
  const [instructions, setInstructions] = useState('Scan with any UPI app (Paytm, Google Pay, PhonePe, BHIM, Cred) and submit your 12-digit UTR transaction number.');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/admin/payment-settings');
      if (res.data?.success && res.data?.settings) {
        setUpiId(res.data.settings.upi_id || 'mohammadhakeeb@fam');
        setMerchantName(res.data.settings.merchant_name || 'Mohammed Hakeeb');
        setQrUrl(res.data.settings.qr_url || '/assets/paytm_qr.jpg');
        setInstructions(res.data.settings.payment_instructions || '');
      }
    } catch (err) {
      setError('Failed to fetch payment settings from database');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await axios.post('/api/admin/payment-settings', {
        upi_id: upiId.trim(),
        merchant_name: merchantName.trim(),
        qr_url: qrUrl.trim(),
        payment_instructions: instructions.trim()
      });

      if (res.data?.success) {
        setMessage(res.data.message || 'Payment settings updated successfully! Live across all checkout pages.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2.5">
            <CreditCard className="w-6 h-6 text-amber-500" />
            <span>Payment & Gateway Settings</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure dynamic UPI merchant details, Paytm QR codes, and checkout instructions.
          </p>
        </div>
        <button
          onClick={fetchPaymentSettings}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white dark:bg-[#0F121C] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Merchant UPI ID (VPA)
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="mohammadhakeeb@fam"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This UPI ID is copied by users on the Add Funds and Checkout pages.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Merchant Display Name
              </label>
              <input
                type="text"
                required
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="Mohammed Hakeeb"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                QR Code Image URL / Path
              </label>
              <input
                type="text"
                required
                value={qrUrl}
                onChange={(e) => setQrUrl(e.target.value)}
                placeholder="/assets/paytm_qr.jpg"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Relative path in public directory (e.g. <code>/assets/paytm_qr.jpg</code>) or direct HTTPS image URL.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Checkout & Payment Instructions
              </label>
              <textarea
                rows="3"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Scan with any UPI app and submit your 12-digit UTR number..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Live Changes...' : 'Save Payment Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0F121C] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <Eye className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Live Checkout Preview
              </h3>
            </div>

            <div className="text-center space-y-3">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 inline-block shadow-md">
                <img
                  src={qrUrl}
                  alt="QR Preview"
                  className="w-44 h-44 object-contain mx-auto rounded-lg"
                  onError={(e) => { e.target.src = '/assets/paytm_qr.jpg'; }}
                />
              </div>

              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{merchantName || 'Merchant Name'}</p>
                <p className="font-mono text-purple-600 dark:text-purple-400 text-xs mt-0.5">{upiId || 'upi@id'}</p>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 px-2">
                {instructions}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-300">
            <ShieldCheck className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            <span>Changes made here take effect immediately across all user dashboards.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

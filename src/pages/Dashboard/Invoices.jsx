import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/Modal';
import { Receipt, Download, Printer, CheckCircle2, FileText, Calendar, Clock, XCircle } from 'lucide-react';

export default function Invoices() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    async function loadInvoices() {
      try {
        setLoading(true);
        const res = await api.get('/user/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const openInvoice = (order) => {
    setSelectedInvoice(order);
    setIsInvoiceOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Billing History & Invoices</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          View your YouTube API plan purchases, UTR payment verification status, and tax receipts.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] space-y-3">
          <Receipt className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">You haven't made any purchases yet. New invoices will appear here after upgrading.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0E1018] text-[11px]">
                  <th className="py-3 px-4 font-semibold">Order / Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Plan Name</th>
                  <th className="py-3 px-4 font-semibold">Payment Method / UTR</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {orders.map((o) => {
                  const isPending = o.payment_status === 'pending_verification';

                  return (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-[#161924] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 font-bold">{o.id}</td>
                      <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">{o.plan_name}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        <div>{o.payment_method}</div>
                        {o.transaction_id && (
                          <div className="text-[10px] text-purple-400 font-mono">Ref: {o.transaction_id}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">₹{o.amount}</td>
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>PENDING VERIFICATION</span>
                          </span>
                        ) : o.payment_status === 'completed' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>COMPLETED</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30 inline-flex items-center space-x-1">
                            <XCircle className="w-3 h-3" />
                            <span>REJECTED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openInvoice(o)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#161924] hover:bg-slate-200 dark:hover:bg-[#1e2232] text-slate-700 dark:text-slate-300 transition-colors"
                          title="View Official Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      <Modal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        title="Official Receipt & Invoice"
        maxWidth="max-w-xl"
      >
        {selectedInvoice && (
          <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-white/[0.08]">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">VBIT-API-STORE</h3>
                <p className="text-[11px] text-slate-500">Dedicated YouTube API Gateway</p>
                <p className="text-[11px] text-slate-500">Merchant: MOHAMMED HAKEEB</p>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded font-bold uppercase text-[10px] ${
                  selectedInvoice.payment_status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {selectedInvoice.payment_status?.toUpperCase()}
                </span>
                <p className="font-mono text-[11px] text-slate-500 mt-1">Invoice: {selectedInvoice.id}</p>
                <p className="text-[11px] text-slate-500">{new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Line items */}
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.08] text-[11px] text-slate-500">
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06] font-mono">
                <tr>
                  <td className="py-2.5">
                    <p className="font-bold text-slate-900 dark:text-white">{selectedInvoice.plan_name} Plan</p>
                    <p className="text-[10px] text-slate-500 font-sans">Dedicated High-Quota YouTube API Key</p>
                  </td>
                  <td className="py-2.5">1</td>
                  <td className="py-2.5 text-right">₹{selectedInvoice.amount}</td>
                  <td className="py-2.5 text-right">₹{selectedInvoice.amount}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-white/[0.08] text-right">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono">₹{selectedInvoice.amount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment Reference (UTR)</span>
                <span className="font-mono text-purple-400">{selectedInvoice.transaction_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2">
                <span>Total Paid (INR)</span>
                <span className="font-mono text-emerald-400">₹{selectedInvoice.amount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#161924] hover:bg-slate-200 dark:hover:bg-[#1e2232] text-slate-800 dark:text-white font-bold flex items-center justify-center space-x-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

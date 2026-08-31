import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/Modal';
import { Receipt, Download, Printer, CheckCircle2, FileText, Calendar, DollarSign } from 'lucide-react';

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
          Download PDF receipts and tax invoices for your YouTube API plan purchases.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
          <Receipt className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">You haven't made any purchases yet. New invoices will appear here after upgrading.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <th className="pb-3 font-semibold">Invoice #</th>
                  <th className="pb-3 font-semibold">Plan Name</th>
                  <th className="pb-3 font-semibold">Payment Method</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-mono text-slate-700 dark:text-slate-300 font-bold">{o.id}</td>
                    <td className="py-3.5 text-slate-900 dark:text-white font-semibold">{o.plan_name}</td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-400">{o.payment_method}</td>
                    <td className="py-3.5 font-mono font-bold text-slate-900 dark:text-white">${o.amount?.toFixed(2)}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => openInvoice(o)}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="View Official Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      <Modal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        title="Official Tax Invoice"
        maxWidth="max-w-xl"
      >
        {selectedInvoice && (
          <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">TuneKey API Cloud Ltd.</h3>
                <p className="text-[11px] text-slate-500">VAT ID: EU893201948</p>
                <p className="text-[11px] text-slate-500">YouTube Gateway Network</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">
                  PAID
                </span>
                <p className="font-mono text-[11px] text-slate-500 mt-1">Invoice: {selectedInvoice.id}</p>
                <p className="text-[11px] text-slate-500">{new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Line items */}
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                <tr>
                  <td className="py-2.5">
                    <p className="font-bold text-slate-900 dark:text-white">{selectedInvoice.plan_name}</p>
                    <p className="text-[10px] text-slate-500 font-sans">Monthly YouTube API Key Allocation</p>
                  </td>
                  <td className="py-2.5">1</td>
                  <td className="py-2.5 text-right">${selectedInvoice.amount?.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-bold">${selectedInvoice.amount?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Summary */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <div className="w-48 space-y-1 text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (0%):</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Paid:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">${selectedInvoice.amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`relative w-full ${maxWidth} glass-panel dark:glass-panel bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl z-10 transform transition-all animate-scaleUp`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800/80">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-wide">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-slate-700 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

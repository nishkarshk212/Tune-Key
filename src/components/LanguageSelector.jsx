import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export default function LanguageSelector({ compact = false }) {
  const { currentLang, activeLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-purple-500/40 transition-all text-xs font-bold cursor-pointer"
        title="Change Language / भाषा बदलें"
      >
        <span className="text-sm">{activeLanguage.flag}</span>
        {!compact && (
          <span className="hidden sm:inline font-sans text-xs">
            {activeLanguage.native}
          </span>
        )}
        <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400" />
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] p-1.5 shadow-2xl z-50 animate-scaleUp text-xs">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
            <span>Select Language</span>
            <Globe className="w-3 h-3 text-purple-400" />
          </div>
          
          <div className="py-1 space-y-0.5 max-h-64 overflow-y-auto">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/15 text-purple-400 font-bold border border-purple-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div>
                      <p className="font-semibold text-xs leading-tight">{lang.native}</p>
                      <p className="text-[10px] text-slate-400">{lang.name}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

export default function CodeBlock({ code, language = 'bash', title = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-[#070A10] font-mono text-xs shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e1422] border-b border-slate-800 text-slate-400">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          {title ? (
            <span className="text-slate-300 font-medium ml-2">{title}</span>
          ) : (
            <div className="flex items-center space-x-1 ml-2 text-slate-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>{language}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[11px]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

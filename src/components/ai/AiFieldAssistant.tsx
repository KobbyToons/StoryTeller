import React, { useState } from 'react';
import { requestAiText } from '../../utils/aiClient';
import { Sparkles, Loader2, RefreshCw, Scissors, Eye, Check, X, Undo2 } from 'lucide-react';

interface AiFieldAssistantProps {
  fieldType: string;
  currentValue: string;
  onApply: (newValue: string) => void;
  context?: Record<string, any>;
  placeholderKeywords?: string;
  className?: string;
  showExpandVisuals?: boolean;
  showShorten?: boolean;
}

export const AiFieldAssistant: React.FC<AiFieldAssistantProps> = ({
  fieldType,
  currentValue,
  onApply,
  context,
  placeholderKeywords = 'Keywords or direction...',
  className = '',
  showExpandVisuals = true,
  showShorten = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [previousValue, setPreviousValue] = useState<string | null>(null);

  const handleAction = async (action: 'generate' | 'rewrite' | 'shorten' | 'expand_visuals') => {
    setLoading(true);
    try {
      const generated = await requestAiText({
        fieldType,
        action,
        currentValue,
        keywords: keywords.trim(),
        context,
      });

      if (generated && generated.trim()) {
        setPreviousValue(currentValue);
        onApply(generated.trim());
        setIsOpen(false);
        setKeywords('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    if (previousValue !== null) {
      onApply(previousValue);
      setPreviousValue(null);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`flex items-center gap-1.5 ${isOpen ? 'relative z-50' : ''}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition shadow-sm ${
            isOpen
              ? 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-400'
              : 'bg-slate-900/90 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 border border-cyan-800/60'
          }`}
          title={`AI Assist for ${fieldType}`}
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>AI</span>
        </button>

        {previousValue !== null && (
          <button
            type="button"
            onClick={handleUndo}
            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center gap-0.5"
            title="Undo AI edit"
          >
            <Undo2 className="w-2.5 h-2.5" />
            <span>Undo</span>
          </button>
        )}
      </div>

      {isOpen && (
        <>
          {/* Backdrop click dismiss */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-full mt-1.5 z-50 w-72 bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-2xl space-y-2.5 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                AI {fieldType}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Keyword / direction input */}
            <div>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAction(currentValue ? 'rewrite' : 'generate');
                  }
                }}
                placeholder={placeholderKeywords}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:border-cyan-500 outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction('generate')}
                className="px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 rounded font-semibold text-[11px] flex items-center justify-center gap-1 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Generate</span>
              </button>

              <button
                type="button"
                disabled={loading || !currentValue}
                onClick={() => handleAction('rewrite')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded font-semibold text-[11px] flex items-center justify-center gap-1 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                <span>Rephrase</span>
              </button>

              {showShorten && (
                <button
                  type="button"
                  disabled={loading || !currentValue}
                  onClick={() => handleAction('shorten')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded font-semibold text-[11px] flex items-center justify-center gap-1 transition disabled:opacity-50"
                >
                  <Scissors className="w-3 h-3" />
                  <span>Tighten</span>
                </button>
              )}

              {showExpandVisuals && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAction('expand_visuals')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded font-semibold text-[11px] flex items-center justify-center gap-1 transition disabled:opacity-50"
                >
                  <Eye className="w-3 h-3" />
                  <span>Visuals</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

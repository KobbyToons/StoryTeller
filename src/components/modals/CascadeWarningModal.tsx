import React from 'react';
import { CascadeDelayAssessment } from '../../utils/pacingCalculations';
import { AlertTriangle, ShieldAlert, X, Check } from 'lucide-react';

interface CascadeWarningModalProps {
  isOpen: boolean;
  assessment: CascadeDelayAssessment | null;
  chapterTitle: string;
  onCancel: () => void;
  onConfirmOverride: () => void;
}

export const CascadeWarningModal: React.FC<CascadeWarningModalProps> = ({
  isOpen,
  assessment,
  chapterTitle,
  onCancel,
  onConfirmOverride,
}) => {
  if (!isOpen || !assessment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-200">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
              Pipeline Lock Gatekeeper
            </span>
            <h2 className="text-lg font-black text-white">
              Cascading Production Delay Warning
            </h2>
            <p className="text-xs text-slate-400">
              Chapter: <strong className="text-white">{chapterTitle}</strong> is currently in <strong>Narrative Locked</strong> status.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 border border-rose-900/60 space-y-3 text-xs">
          <p className="text-rose-200 font-medium leading-relaxed">
            {assessment.warningMessage}
          </p>

          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <span className="font-bold text-slate-400 block">
              Affected Downstream Production Departments:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {assessment.affectedDepartments.map((dept, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/80 text-rose-300 font-semibold text-[11px]"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition"
          >
            Preserve Narrative Lock (Cancel)
          </button>
          <button
            onClick={onConfirmOverride}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Override & Log Delay</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ProjectData } from '../../types/project';
import { formatStandardComicScript } from '../../utils/pacingCalculations';
import { Download, Copy, X, Check, FileText, Code } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  project: ProjectData;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, project, onClose }) => {
  const [exportType, setExportType] = useState<'comic_script' | 'pitch_bible' | 'json_backup'>('comic_script');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentChapter = project.chapters.find((c) => c.id === project.activeChapterId) || project.chapters[0];

  const getExportContent = (): string => {
    if (exportType === 'comic_script') {
      return formatStandardComicScript(project.title, currentChapter.title, currentChapter.pages || []);
    } else if (exportType === 'pitch_bible') {
      let doc = `# ${project.title.toUpperCase()} - PITCH BIBLE & WORLD REFERENCE\n\n`;
      doc += `## LOGLINE & PREMISE\n${project.logline.fullLogline}\n\n`;
      doc += `## WORLD RULES\n`;
      project.pitchBible.worldRules.forEach((r) => {
        doc += `### ${r.title} (${r.category})\n${r.description}\nBOUNDARY: ${r.boundaryRule}\n\n`;
      });
      doc += `## CHARACTERS\n`;
      project.pitchBible.characters.forEach((c) => {
        doc += `### ${c.name} (${c.role})\n`;
        doc += `- Core Flaw: ${c.coreFlaw}\n`;
        doc += `- Motivation: ${c.motivation}\n`;
        doc += `- Internal Need vs External Want: ${c.internalNeedVsExternalWant}\n`;
        doc += `- Shape Language: ${c.shapeLanguage}\n`;
        doc += `- Silhouette: ${c.visualSilhouette}\n`;
        doc += `- Dialogue Voice: ${c.dialogueVoice}\n\n`;
      });
      return doc;
    } else {
      return JSON.stringify(project, null, 2);
    }
  };

  const content = getExportContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extension = exportType === 'json_backup' ? 'json' : 'txt';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${exportType}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Production Export Center</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Type Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setExportType('comic_script')}
            className={`flex-1 py-1.5 rounded-md font-semibold transition flex items-center justify-center gap-1.5 ${
              exportType === 'comic_script' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Standard Comic Script</span>
          </button>
          <button
            onClick={() => setExportType('pitch_bible')}
            className={`flex-1 py-1.5 rounded-md font-semibold transition flex items-center justify-center gap-1.5 ${
              exportType === 'pitch_bible' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pitch Bible Markdown</span>
          </button>
          <button
            onClick={() => setExportType('json_backup')}
            className={`flex-1 py-1.5 rounded-md font-semibold transition flex items-center justify-center gap-1.5 ${
              exportType === 'json_backup' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Project JSON Backup</span>
          </button>
        </div>

        {/* Text Preview */}
        <div className="relative">
          <textarea
            readOnly
            value={content}
            rows={12}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 font-mono outline-none focus:border-cyan-500 leading-relaxed"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400">
            Formatted for production teams, pencillers, letterers & directors.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy All'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

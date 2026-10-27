import React from 'react';
import { 
  PipelineStage, 
  ProductionMedium, 
  ProjectData 
} from '../types/project';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  GitFork, 
  FileText, 
  LayoutGrid, 
  Lock, 
  Unlock, 
  Download, 
  RotateCcw,
  Film,
  PanelTop,
  Sliders
} from 'lucide-react';

interface HeaderProps {
  project: ProjectData;
  activeStage: PipelineStage;
  onSelectStage: (stage: PipelineStage) => void;
  onUpdateMedium: (medium: ProductionMedium) => void;
  onToggleLock: () => void;
  onOpenExport: () => void;
  onResetProject: () => void;
  onOpenComicControlDeck: () => void;
  isComicDeckOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  activeStage,
  onSelectStage,
  onUpdateMedium,
  onToggleLock,
  onOpenExport,
  onResetProject,
  onOpenComicControlDeck,
  isComicDeckOpen,
}) => {
  const currentChapter = project.chapters.find((c) => c.id === project.activeChapterId) || project.chapters[0];
  const isLocked = currentChapter?.isLocked ?? false;

  const stages: { id: PipelineStage; step: number; label: string; icon: React.ReactNode }[] = [
    { id: 'logline', step: 1, label: 'Logline & Concept', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'bible', step: 2, label: 'Pitch Bible', icon: <Users className="w-4 h-4" /> },
    { id: 'beats', step: 3, label: 'Beat Sheet', icon: <GitFork className="w-4 h-4" /> },
    { id: 'script', step: 4, label: 'Script Editor', icon: <FileText className="w-4 h-4" /> },
    { id: 'storyboard', step: 5, label: 'Storyboards & Flow', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'animatic', step: 6, label: 'Narrative Lock', icon: <Film className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      {/* Top Bar: Brand, Project Title, Medium & Lock Status */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black tracking-wider">
            SQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base">SEQUENTIAL</span>
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                Studio Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
              {project.title} &bull; {currentChapter?.title || 'Chapter 1'}
            </p>
          </div>
        </div>

        {/* Medium Toggle & Quick Tools */}
        <div className="flex items-center gap-2">
          {/* Comic vs Animation Medium */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onUpdateMedium('comic')}
              className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                project.medium === 'comic'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Comic
            </button>
            <button
              onClick={() => onUpdateMedium('animation')}
              className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                project.medium === 'animation'
                  ? 'bg-indigo-500 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Animation
            </button>
          </div>

          {/* Comic Layout & Pacing Deck Quick Toggle */}
          <button
            onClick={onOpenComicControlDeck}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 shadow-sm ${
              isComicDeckOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-400/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Open Dedicated Comic Panel & Pacing Deck"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Comic Control Deck</span>
          </button>

          {/* Lock Switch */}
          <button
            onClick={onToggleLock}
            className={`px-2.5 py-1.5 text-xs rounded-lg border transition flex items-center gap-1.5 font-medium ${
              isLocked
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/80 hover:bg-rose-900'
                : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50'
            }`}
            title={isLocked ? 'Narrative is Locked (Changes trigger Cascade Alerts)' : 'Draft Mode (Iterative edits permitted)'}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isLocked ? 'Narrative Locked' : 'Draft Mode'}</span>
          </button>

          {/* Export */}
          <button
            onClick={onOpenExport}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition flex items-center gap-1 font-medium"
            title="Export Script, Screenplay, Pitch Bible, or Project JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Reset */}
          <button
            onClick={onResetProject}
            className="p-1.5 text-xs rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset to Master Example Project"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sequential Funnel Navigation (Stages 1 through 6) */}
      <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/60 overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1 py-1 min-w-max">
          {stages.map((st) => {
            const isActive = activeStage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onSelectStage(st.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition relative ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {st.step}
                </span>
                <span>{st.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

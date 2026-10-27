import React, { useState } from 'react';
import { ProjectData, Chapter, ScriptPage, ScriptPanel } from '../../types/project';
import { analyzePageEyeFlow, calculateLetteringAreaCoverage } from '../../utils/pacingCalculations';
import { 
  LayoutGrid, 
  Eye, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ZoomIn, 
  Columns, 
  Camera, 
  MessageSquareOff,
  MoveHorizontal
} from 'lucide-react';

interface StoryboardStageProps {
  project: ProjectData;
  onProceedToAnimatic: () => void;
  onNavigateToScriptPage: (pageIndex: number) => void;
}

export const StoryboardStage: React.FC<StoryboardStageProps> = ({
  project,
  onProceedToAnimatic,
  onNavigateToScriptPage,
}) => {
  const currentChapter = project.chapters.find((c) => c.id === project.activeChapterId) || project.chapters[0];
  const pages = currentChapter?.pages || [];
  const [spreadMode, setSpreadMode] = useState<boolean>(true);
  const [selectedSpreadIndex, setSelectedSpreadIndex] = useState<number>(0);
  const [showFocalGrid, setShowFocalGrid] = useState<boolean>(true);

  // Redundancy Analysis: Check if dialogue simply restates what panel description already says
  const redundancyWarnings: { pageNumber: number; panelNumber: number; issue: string; suggestion: string }[] = [];
  pages.forEach((pg) => {
    pg.panels.forEach((p) => {
      const descLower = p.description.toLowerCase();
      p.dialogues.forEach((d) => {
        const textLower = d.text.toLowerCase();
        // Check for common redundancy triggers (e.g., character saying "Look!" or stating action verb already in description)
        if (
          (descLower.includes('rain') && textLower.includes('it is raining')) ||
          (descLower.includes('gun') && textLower.includes('he has a gun')) ||
          (descLower.includes('fire') && textLower.includes('everything is on fire'))
        ) {
          redundancyWarnings.push({
            pageNumber: pg.pageNumber,
            panelNumber: p.panelNumber,
            issue: `Dialogue "${d.text}" duplicates visible action in panel description.`,
            suggestion: 'Visual storytelling already communicates this. Cut dialogue or replace with internal reaction.',
          });
        }
      });
    });
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950/60 border border-amber-800/40 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pipeline Stage 5 &bull; Visual Composition</span>
            <h1 className="text-xl font-bold text-white mt-0.5">Storyboarding, Thumbnails & Eye-Flow Analysis</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Where writing translates into visual pacing. Test thumbnail composition and the flow of the reader's eye across page turns. Detect redundant dialogue where visual acting renders words unnecessary.
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Spread Toggle, Grid Toggle, Redundancy Audit */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setSpreadMode(true)}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                spreadMode ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Two-Page Spread View</span>
            </button>
            <button
              onClick={() => setSpreadMode(false)}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                !spreadMode ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Chapter Thumbnails</span>
            </button>
          </div>

          <button
            onClick={() => setShowFocalGrid(!showFocalGrid)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
              showFocalGrid ? 'bg-slate-800 text-amber-300 border-amber-500/50' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Rule-of-Thirds & Focal Grid</span>
          </button>
        </div>

        {/* Redundancy Count badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Show Don't Tell Audit:</span>
          {redundancyWarnings.length === 0 ? (
            <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              No Dialogue Redundancy Detected
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3 h-3" />
              {redundancyWarnings.length} Visual Redundancy Warning(s)
            </span>
          )}
        </div>
      </div>

      {/* SPREAD MODE: Two-Page Reader Spread View (Even Page Left, Odd Page Right) */}
      {spreadMode ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Physical Comic Book Spread Layout (Left: Verso, Right: Recto with Turn Reveal)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={selectedSpreadIndex === 0}
                onClick={() => setSelectedSpreadIndex(Math.max(0, selectedSpreadIndex - 2))}
                className="px-2.5 py-1 bg-slate-800 rounded disabled:opacity-30 text-white"
              >
                &larr; Prev Spread
              </button>
              <span className="font-mono text-white">
                Pages {selectedSpreadIndex + 1} - {Math.min(pages.length, selectedSpreadIndex + 2)} of {pages.length}
              </span>
              <button
                disabled={selectedSpreadIndex + 2 >= pages.length}
                onClick={() => setSelectedSpreadIndex(selectedSpreadIndex + 2)}
                className="px-2.5 py-1 bg-slate-800 rounded disabled:opacity-30 text-white"
              >
                Next Spread &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-2xl">
            {/* Left Page (Even) */}
            {pages[selectedSpreadIndex] && (
              <ThumbnailPageCard
                page={pages[selectedSpreadIndex]}
                showGrid={showFocalGrid}
                onOpenScript={() => onNavigateToScriptPage(selectedSpreadIndex)}
              />
            )}

            {/* Right Page (Odd) */}
            {pages[selectedSpreadIndex + 1] ? (
              <ThumbnailPageCard
                page={pages[selectedSpreadIndex + 1]}
                showGrid={showFocalGrid}
                onOpenScript={() => onNavigateToScriptPage(selectedSpreadIndex + 1)}
              />
            ) : (
              <div className="border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center p-12 text-slate-600 text-xs text-center">
                Blank page or end of issue.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ALL THUMBNAILS GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {pages.map((pg, idx) => (
            <ThumbnailPageCard
              key={pg.id}
              page={pg}
              showGrid={showFocalGrid}
              onOpenScript={() => onNavigateToScriptPage(idx)}
            />
          ))}
        </div>
      )}

      {/* Redundancy Warnings Details Card */}
      {redundancyWarnings.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <MessageSquareOff className="w-4 h-4" />
            <span>Redundant Dialogue Flags (Show Don't Tell Principle)</span>
          </div>
          <div className="space-y-1.5">
            {redundancyWarnings.map((warn, i) => (
              <div key={i} className="text-xs bg-slate-950/80 p-2.5 rounded border border-amber-900/40 text-slate-300">
                <div className="font-bold text-amber-300 mb-0.5">
                  Page {warn.pageNumber}, Panel {warn.panelNumber}: {warn.issue}
                </div>
                <div className="text-[11px] text-slate-400">{warn.suggestion}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advance to Animatic Lock */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onProceedToAnimatic}
          className="py-2.5 px-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <span>Approve Storyboards & Narrative Lock</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Thumbnail Page Render Card
interface ThumbnailPageCardProps {
  page: ScriptPage;
  showGrid: boolean;
  onOpenScript: () => void;
}

const ThumbnailPageCard: React.FC<ThumbnailPageCardProps> = ({ page, showGrid, onOpenScript }) => {
  const eyeFlow = analyzePageEyeFlow(page);
  const isOdd = page.pageNumber % 2 !== 0;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">PAGE {page.pageNumber}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
            isOdd ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {isOdd ? 'Facing Right (Odd)' : 'Facing Left (Even)'}
          </span>
        </div>
        <button
          onClick={onOpenScript}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          Edit in Script &rarr;
        </button>
      </div>

      {/* Thumbnail Wireframe Canvas */}
      <div className="relative bg-slate-900 border-2 border-slate-700 rounded-lg p-2 aspect-[3/4] flex flex-col gap-1.5 overflow-hidden">
        {/* Rule-of-Thirds Grid lines */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
            <div className="border-r border-b border-cyan-400" />
            <div className="border-r border-b border-cyan-400" />
            <div className="border-b border-cyan-400" />
            <div className="border-r border-b border-cyan-400" />
            <div className="border-r border-b border-cyan-400" />
            <div className="border-b border-cyan-400" />
            <div className="border-r border-cyan-400" />
            <div className="border-r border-cyan-400" />
            <div />
          </div>
        )}

        {/* SVG Z-Pattern Eye-Flow connector */}
        {eyeFlow.flowPoints.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            {page.panels.map((p, idx) => {
              if (idx === page.panels.length - 1) return null;
              const startY = ((idx + 0.5) / page.panels.length) * 100;
              const endY = ((idx + 1.5) / page.panels.length) * 100;
              const startX = p.panelNumber % 2 === 1 ? 30 : 70;
              const endX = (p.panelNumber + 1) % 2 === 1 ? 30 : 70;
              return (
                <line
                  key={idx}
                  x1={`${startX}%`}
                  y1={`${startY}%`}
                  x2={`${endX}%`}
                  y2={`${endY}%`}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  opacity="0.75"
                />
              );
            })}
          </svg>
        )}

        {/* Panel Blocks */}
        {page.panels.map((p) => {
          const analysis = calculateLetteringAreaCoverage(p);
          return (
            <div
              key={p.id}
              className="relative bg-slate-950 border border-slate-700 rounded p-1.5 flex flex-col justify-between flex-grow"
              style={{ flexBasis: `${(p.panelSizeWeight / 6) * 100}%` }}
            >
              <div className="flex items-center justify-between text-[9px]">
                <span className="font-bold text-slate-300">P{p.panelNumber}</span>
                <span className="font-mono text-cyan-400">{p.shotSize}</span>
              </div>

              <p className="text-[9px] text-slate-400 line-clamp-1 italic">{p.description}</p>

              <div className="flex items-center justify-between text-[8px] text-slate-500 pt-0.5 border-t border-slate-800">
                <span>{p.dialogues.length} speech balloon(s)</span>
                <span className={analysis.status === 'optimal' ? 'text-emerald-400' : 'text-amber-400'}>
                  {analysis.estimatedBalloonAreaPercent}% art
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
        <span>Gutter Cadence: <strong className="text-white capitalize">{eyeFlow.gutterJumpTension}</strong></span>
        <span>Page Turn Reveal: <strong className="text-amber-400">{eyeFlow.pageTurnCliffhangerRating}/10</strong></span>
      </div>
    </div>
  );
};

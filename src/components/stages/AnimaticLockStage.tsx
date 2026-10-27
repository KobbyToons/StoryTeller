import React, { useState, useEffect } from 'react';
import { ProjectData, Chapter, ScriptPage } from '../../types/project';
import { calculateReadingTimeAndRhythm } from '../../utils/pacingCalculations';
import { 
  Film, 
  Lock, 
  Unlock, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Volume2, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  History
} from 'lucide-react';

interface AnimaticLockStageProps {
  project: ProjectData;
  onToggleLock: () => void;
  onOpenExport: () => void;
}

export const AnimaticLockStage: React.FC<AnimaticLockStageProps> = ({
  project,
  onToggleLock,
  onOpenExport,
}) => {
  const currentChapter = project.chapters.find((c) => c.id === project.activeChapterId) || project.chapters[0];
  const isLocked = currentChapter?.isLocked ?? false;
  const isComic = project.medium === 'comic';

  const [activePlayerMode, setActivePlayerMode] = useState<'comic_reader' | 'animation_animatic'>(
    isComic ? 'comic_reader' : 'animation_animatic'
  );

  // Comic Reader Simulator State
  const pages = currentChapter.pages || [];
  const [currentReaderPageIndex, setCurrentReaderPageIndex] = useState<number>(0);
  const [isAutoPlayingReader, setIsAutoPlayingReader] = useState<boolean>(false);
  const [readingWPM, setReadingWPM] = useState<number>(180);

  // Animation Animatic Player State
  const shots = currentChapter.scenes?.flatMap((s) => s.shots) || [];
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [isAnimaticPlaying, setIsAnimaticPlaying] = useState<boolean>(false);
  const [shotSecondsRemaining, setShotSecondsRemaining] = useState<number>(shots[0]?.durationSeconds || 3);

  const rhythm = calculateReadingTimeAndRhythm(pages);

  // Auto-play timer for animation animatic
  useEffect(() => {
    let timer: any;
    if (isAnimaticPlaying && shots.length > 0) {
      timer = setInterval(() => {
        setShotSecondsRemaining((prev) => {
          if (prev <= 0.1) {
            // Next shot
            if (currentShotIndex < shots.length - 1) {
              const nextIndex = currentShotIndex + 1;
              setCurrentShotIndex(nextIndex);
              return shots[nextIndex]?.durationSeconds || 3;
            } else {
              setIsAnimaticPlaying(false);
              return 0;
            }
          }
          return prev - 0.1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isAnimaticPlaying, currentShotIndex, shots]);

  const currentShot = shots[currentShotIndex];
  const currentReaderPage = pages[currentReaderPageIndex];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className={`border rounded-xl p-5 shadow-lg transition ${
        isLocked
          ? 'bg-gradient-to-r from-slate-900 to-rose-950/60 border-rose-800/40'
          : 'bg-gradient-to-r from-slate-900 to-emerald-950/60 border-emerald-800/40'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-lg border ${
              isLocked ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {isLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isLocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                Pipeline Stage 6 &bull; Narrative Lock Gate
              </span>
              <h1 className="text-xl font-bold text-white mt-0.5">
                The Animatic / Pencil Stage: Narrative Lock
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                The final narrative lock. Once approved, the narrative is frozen so illustrators, letterers, colorists, and animators can commit to production. Any script changes past this point trigger cascading delay warnings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleLock}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition shadow-lg ${
                isLocked
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
              }`}
            >
              {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{isLocked ? 'Unlock Chapter (Open Draft)' : 'Lock Narrative for Production'}</span>
            </button>

            <button
              onClick={onOpenExport}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg border border-slate-700 flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Script Package</span>
            </button>
          </div>
        </div>
      </div>

      {/* Space vs Time Pacing Concept Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white block">Sequential Art vs. Animation Pacing Mindset:</span>
            <span className="text-slate-400">
              In comics, <strong>space controls time</strong>: the reader dictates reading speed, while panel dimensions and gutter spacing create psychological rhythm. In animation, <strong>time controls space</strong>: the director dictates seconds per cut.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setActivePlayerMode('comic_reader')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activePlayerMode === 'comic_reader'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Comic Reader Pace
          </button>
          <button
            onClick={() => setActivePlayerMode('animation_animatic')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activePlayerMode === 'animation_animatic'
                ? 'bg-indigo-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Animation Animatic
          </button>
        </div>
      </div>

      {/* SIMULATOR 1: COMIC READER PACING SIMULATOR */}
      {activePlayerMode === 'comic_reader' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Comic Reader Experience & Pacing Rhythm</h2>
              <p className="text-xs text-slate-400">
                Simulate how real readers scan panel artwork and absorb speech balloon word counts.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-mono">
                Total Issue Est: <strong className="text-cyan-400">~{Math.ceil(rhythm.estimatedReadTimeSeconds / 60)} min</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Pace:</span>
                <select
                  value={readingWPM}
                  onChange={(e) => setReadingWPM(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-white"
                >
                  <option value="140">Deliberate (140 WPM)</option>
                  <option value="180">Standard (180 WPM)</option>
                  <option value="240">Rapid Skim (240 WPM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reader Page View */}
          {currentReaderPage ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">PAGE {currentReaderPage.pageNumber}</span>
                  <span className="text-xs text-slate-400">({currentReaderPage.panels.length} panels)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentReaderPageIndex === 0}
                    onClick={() => setCurrentReaderPageIndex(Math.max(0, currentReaderPageIndex - 1))}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs text-white"
                  >
                    &larr; Prev Page
                  </button>
                  <span className="text-xs font-mono text-slate-400">
                    {currentReaderPageIndex + 1} / {pages.length}
                  </span>
                  <button
                    disabled={currentReaderPageIndex >= pages.length - 1}
                    onClick={() => setCurrentReaderPageIndex(Math.min(pages.length - 1, currentReaderPageIndex + 1))}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs text-white"
                  >
                    Next Page &rarr;
                  </button>
                </div>
              </div>

              {/* Rendered comic panels in reading sequence */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentReaderPage.panels.map((p) => {
                  const words = p.dialogues.reduce((sum, d) => sum + (d.text.split(/\s+/).length || 0), 0);
                  const scanSeconds = Number(((words / readingWPM) * 60 + 2.5).toFixed(1));

                  return (
                    <div
                      key={p.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold bg-slate-900 px-2 py-0.5 rounded text-white border border-slate-700">
                          P{p.panelNumber}
                        </span>
                        <span className="text-cyan-400 font-mono font-bold text-[11px]">{p.shotSize}</span>
                        <span className="text-slate-500 font-mono text-[11px]">~{scanSeconds}s</span>
                      </div>

                      <p className="text-xs text-slate-300 italic my-auto line-clamp-3">
                        "{p.description}"
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        {p.dialogues.map((d) => (
                          <div
                            key={d.id}
                            className={`p-2 rounded text-xs ${
                              d.type === 'caption'
                                ? 'bg-amber-950/60 border border-amber-800 text-amber-200'
                                : 'bg-slate-900 border border-slate-700 text-white'
                            }`}
                          >
                            <span className="font-bold text-[10px] uppercase block opacity-75">{d.character}:</span>
                            <span>{d.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-500">
              No comic pages created in this chapter yet.
            </div>
          )}
        </div>
      )}

      {/* SIMULATOR 2: ANIMATION ANIMATIC PLAYER */}
      {activePlayerMode === 'animation_animatic' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Animatic Timeline Player with Scratch Audio</h2>
              <p className="text-xs text-slate-400">
                Presents shot pacing, camera cut duration, and dialogue delivery for animation release.
              </p>
            </div>
            <span className="font-mono text-xs text-indigo-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              Shot {currentShotIndex + 1} of {shots.length}
            </span>
          </div>

          {currentShot ? (
            <div className="space-y-4">
              {/* Animatic Screen Frame */}
              <div className="relative bg-slate-950 border-4 border-slate-800 rounded-xl aspect-video flex flex-col justify-between p-6 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-800 font-mono">
                    SHOT #{currentShot.shotNumber} &bull; {currentShot.framing}
                  </span>
                  <span className="bg-slate-900 text-amber-400 font-mono font-bold px-2 py-0.5 rounded border border-slate-800">
                    ⏱ {shotSecondsRemaining.toFixed(1)}s / {currentShot.durationSeconds}s
                  </span>
                </div>

                <div className="text-center max-w-xl mx-auto space-y-3">
                  <p className="text-sm text-slate-200 italic font-medium leading-relaxed">
                    "{currentShot.action}"
                  </p>
                  {currentShot.characterSpeaker && (
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg shadow inline-block">
                      <div className="text-xs font-bold text-indigo-300 uppercase">
                        {currentShot.characterSpeaker}
                      </div>
                      <div className="text-xs text-white mt-0.5">"{currentShot.dialogue}"</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Volume2 className="w-4 h-4" />
                    <span>Scratch: {currentShot.scratchAudioCue || 'Ambient room tone'}</span>
                  </div>
                  <span className="font-mono text-[11px]">Transition: {currentShot.transition}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setCurrentShotIndex(0);
                    setShotSecondsRemaining(shots[0]?.durationSeconds || 3);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  title="Restart"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAnimaticPlaying(!isAnimaticPlaying)}
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 shadow"
                >
                  {isAnimaticPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isAnimaticPlaying ? 'Pause Animatic' : 'Play Animatic'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-500">
              No animation shots created in this chapter yet.
            </div>
          )}
        </div>
      )}

      {/* Production Cascade Log & Department Impact */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Production Cascade Audit & Delay Log
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {project.cascadeLog.length} Registered Pipeline Change(s)
          </span>
        </div>

        {project.cascadeLog.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500">
            No cascading revisions logged. The pipeline has run without disruption.
          </div>
        ) : (
          <div className="space-y-2">
            {project.cascadeLog.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 rounded-lg p-3 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.chapterTitle}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                      log.impactLevel === 'critical' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {log.impactLevel}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">{log.changeSummary}</p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-amber-400 block">
                    ~{log.estimatedDelayDays} day pipeline delay
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1 justify-end">
                    {log.impactedDepartments.map((dept, i) => (
                      <span key={i} className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

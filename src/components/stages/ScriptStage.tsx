import React, { useState } from 'react';
import { ProjectData, Chapter, ScriptPage, ScreenplayScene, AnimationShot, ShotSize } from '../../types/project';
import { ComicScriptEditor } from '../comic/ComicScriptEditor';
import { calculateReadingTimeAndRhythm } from '../../utils/pacingCalculations';
import { 
  FileText, 
  Film, 
  BookOpen, 
  Clock, 
  BarChart2, 
  Plus, 
  Trash2, 
  Camera, 
  Sparkles,
  ArrowRight,
  Layers
} from 'lucide-react';

interface ScriptStageProps {
  project: ProjectData;
  onUpdateChapterPages: (chapterId: string, pages: ScriptPage[]) => void;
  onUpdateChapterScenes: (chapterId: string, scenes: ScreenplayScene[]) => void;
  onSelectChapter: (chapterId: string) => void;
  onProceedToStoryboards: () => void;
  onLockedEditAttempt: (changeNature: 'dialogue_trim' | 'panel_reorder' | 'scene_rewrite') => boolean;
}

export const ScriptStage: React.FC<ScriptStageProps> = ({
  project,
  onUpdateChapterPages,
  onUpdateChapterScenes,
  onSelectChapter,
  onProceedToStoryboards,
  onLockedEditAttempt,
}) => {
  const currentChapter = project.chapters.find((c) => c.id === project.activeChapterId) || project.chapters[0];
  const isComic = project.medium === 'comic';

  // Rhythm metrics for comic
  const rhythm = calculateReadingTimeAndRhythm(currentChapter?.pages || []);

  const handleUpdatePages = (newPages: ScriptPage[]) => {
    onUpdateChapterPages(currentChapter.id, newPages);
  };

  const handleUpdateScenes = (newScenes: ScreenplayScene[]) => {
    onUpdateChapterScenes(currentChapter.id, newScenes);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Chapter Selector & Pacing Status Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Current Chapter:</span>
            <select
              value={currentChapter.id}
              onChange={(e) => onSelectChapter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-bold text-white focus:border-cyan-500 outline-none"
            >
              {project.chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Ch. {ch.number}: {ch.title} ({ch.isLocked ? '🔒 Locked' : 'Draft'})
                </option>
              ))}
            </select>
          </div>

          {isComic && (
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 border-l border-slate-800 pl-3">
              <span>
                Pages: <strong className="text-white">{currentChapter.pages?.length || 0}</strong>
              </span>
              <span>
                Panels: <strong className="text-white">{rhythm.totalPanels}</strong> (~{rhythm.averagePanelsPerPage}/pg)
              </span>
              <span>
                Read Time: <strong className="text-cyan-400">~{Math.ceil(rhythm.estimatedReadTimeSeconds / 60)} min</strong>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                rhythm.pacingRhythmRating === 'Well-Paced'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {rhythm.pacingRhythmRating}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onProceedToStoryboards}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg border border-slate-700 transition flex items-center gap-2"
        >
          <span>Hand Off to Storyboards & Thumbnails</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Comic Mode: The Dedicated Comic Script Editor & Pacing Deck */}
      {isComic ? (
        <ComicScriptEditor
          chapter={currentChapter}
          characters={project.pitchBible.characters}
          onUpdateChapterPages={handleUpdatePages}
          isNarrativeLocked={currentChapter.isLocked}
          onLockedEditAttempt={onLockedEditAttempt}
        />
      ) : (
        /* Animation Mode: Screenplay & Shot breakdown */
        <AnimationScriptEditor
          chapter={currentChapter}
          onUpdateScenes={handleUpdateScenes}
          isNarrativeLocked={currentChapter.isLocked}
          onLockedEditAttempt={onLockedEditAttempt}
        />
      )}
    </div>
  );
};

// Animation Mode Screenplay Editor sub-component
interface AnimationScriptEditorProps {
  chapter: Chapter;
  onUpdateScenes: (scenes: ScreenplayScene[]) => void;
  isNarrativeLocked: boolean;
  onLockedEditAttempt: (changeNature: 'dialogue_trim' | 'panel_reorder' | 'scene_rewrite') => boolean;
}

const AnimationScriptEditor: React.FC<AnimationScriptEditorProps> = ({
  chapter,
  onUpdateScenes,
  isNarrativeLocked,
  onLockedEditAttempt,
}) => {
  const scenes = chapter.scenes || [];

  const handleAddScene = () => {
    if (isNarrativeLocked && !onLockedEditAttempt('scene_rewrite')) return;
    const newScene: ScreenplayScene = {
      id: `sc_${Date.now()}`,
      sceneNumber: scenes.length + 1,
      slugline: 'INT. SECTOR 4 HAVEN - NIGHT',
      setting: 'INT.',
      timeOfDay: 'NIGHT',
      shots: [
        {
          id: `sh_${Date.now()}_1`,
          shotNumber: 1,
          framing: 'Medium Long',
          action: 'Establish the location with camera slow push-in.',
          characterSpeaker: 'SPEAKER',
          dialogue: 'Dialogue line...',
          durationSeconds: 3.5,
          scratchAudioCue: 'Ambient background drone and hum.',
          transition: 'Cut',
        },
      ],
    };
    onUpdateScenes([...scenes, newScene]);
  };

  const handleUpdateScene = (sceneId: string, fields: Partial<ScreenplayScene>) => {
    if (isNarrativeLocked && !onLockedEditAttempt('scene_rewrite')) return;
    const updated = scenes.map((s) => (s.id === sceneId ? { ...s, ...fields } : s));
    onUpdateScenes(updated);
  };

  const handleAddShot = (sceneId: string) => {
    if (isNarrativeLocked && !onLockedEditAttempt('panel_reorder')) return;
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    const newShot: AnimationShot = {
      id: `sh_${Date.now()}`,
      shotNumber: scene.shots.length + 1,
      framing: 'Close-Up',
      action: 'Character visual reaction.',
      durationSeconds: 2.5,
      transition: 'Cut',
    };
    handleUpdateScene(sceneId, { shots: [...scene.shots, newShot] });
  };

  const totalRuntimeSeconds = scenes.reduce((sum, sc) => {
    return sum + sc.shots.reduce((sSum, sh) => sSum + (sh.durationSeconds || 0), 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Animation Screenplay & Shot-by-Shot Timing</h2>
          <p className="text-xs text-slate-400">
            Screenplay format with action lines strictly focused on visible and audible information.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-mono bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            Est. Episode Timing: <strong>{Math.floor(totalRuntimeSeconds / 60)}m {Math.round(totalRuntimeSeconds % 60)}s</strong>
          </span>
          <button
            onClick={handleAddScene}
            className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Screenplay Scene
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {scenes.map((scene) => (
          <div key={scene.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 font-script">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-400 text-xs">SCENE {scene.sceneNumber}:</span>
                <input
                  type="text"
                  value={scene.slugline}
                  onChange={(e) => handleUpdateScene(scene.id, { slugline: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs font-bold text-white uppercase focus:border-indigo-500 outline-none w-72"
                />
              </div>
              <button
                onClick={() => handleAddShot(scene.id)}
                className="text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700 flex items-center gap-1 font-sans"
              >
                <Plus className="w-3 h-3" />
                Add Shot Cue
              </button>
            </div>

            {/* Shots */}
            <div className="space-y-3 pl-2 border-l-2 border-indigo-950">
              {scene.shots.map((shot) => (
                <div key={shot.id} className="bg-slate-950 rounded-lg p-3 text-xs space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold text-white">SHOT #{shot.shotNumber} ({shot.framing.toUpperCase()})</span>
                    <span className="font-mono text-indigo-400">{shot.durationSeconds}s duration</span>
                  </div>
                  <p className="text-slate-300 italic">{shot.action}</p>
                  {shot.characterSpeaker && (
                    <div className="text-center py-1">
                      <div className="font-bold text-white">{shot.characterSpeaker}</div>
                      <div className="text-slate-200">{shot.dialogue}</div>
                    </div>
                  )}
                  {shot.scratchAudioCue && (
                    <div className="text-[11px] text-amber-400 font-sans">
                      🔊 Audio scratch: {shot.scratchAudioCue}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

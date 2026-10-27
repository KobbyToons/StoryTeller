import React, { useState, useEffect } from 'react';
import { 
  ProjectData, 
  PipelineStage, 
  ProductionMedium, 
  ScriptPage, 
  ScreenplayScene,
  Beat,
  Chapter
} from './types/project';
import { defaultProject } from './data/defaultProject';
import { Header } from './components/Header';
import { LoglineStage } from './components/stages/LoglineStage';
import { PitchBibleStage } from './components/stages/PitchBibleStage';
import { BeatSheetStage } from './components/stages/BeatSheetStage';
import { ScriptStage } from './components/stages/ScriptStage';
import { StoryboardStage } from './components/stages/StoryboardStage';
import { AnimaticLockStage } from './components/stages/AnimaticLockStage';
import { CascadeWarningModal } from './components/modals/CascadeWarningModal';
import { ExportModal } from './components/modals/ExportModal';
import { calculateCascadingImpact, CascadeDelayAssessment } from './utils/pacingCalculations';

const STORAGE_KEY = 'sequential_studio_project_data';

export default function App() {
  const [project, setProject] = useState<ProjectData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load project from storage', e);
    }
    return defaultProject;
  });

  const [activeStage, setActiveStage] = useState<PipelineStage>('script');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [cascadeModalState, setCascadeModalState] = useState<{
    isOpen: boolean;
    assessment: CascadeDelayAssessment | null;
    changeNature: 'dialogue_trim' | 'panel_reorder' | 'scene_rewrite';
  }>({
    isOpen: false,
    assessment: null,
    changeNature: 'scene_rewrite',
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Failed to save project to storage', e);
    }
  }, [project]);

  const currentChapter = project.chapters.find((c) => c.id === project.activeChapterId) || project.chapters[0];

  // Stage Progression Handlers
  const handleSelectStage = (stage: PipelineStage) => {
    setActiveStage(stage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateMedium = (medium: ProductionMedium) => {
    setProject((prev) => ({
      ...prev,
      medium,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleToggleLock = () => {
    const isNowLocked = !currentChapter.isLocked;
    const updatedChapters = project.chapters.map((ch) =>
      ch.id === currentChapter.id
        ? {
            ...ch,
            isLocked: isNowLocked,
            lockedAt: isNowLocked ? new Date().toISOString() : undefined,
          }
        : ch
    );

    setProject((prev) => ({
      ...prev,
      chapters: updatedChapters,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleResetProject = () => {
    if (window.confirm('Reset all project data back to the default master sequential example?')) {
      setProject(defaultProject);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Locked Edit Interceptor
  const handleLockedEditAttempt = (changeNature: 'dialogue_trim' | 'panel_reorder' | 'scene_rewrite'): boolean => {
    if (!currentChapter.isLocked) return true;

    const assessment = calculateCascadingImpact(true, 1, changeNature);
    setCascadeModalState({
      isOpen: true,
      assessment,
      changeNature,
    });
    return false; // Intercept edit until user overrides in modal
  };

  const handleConfirmLockOverride = () => {
    if (!cascadeModalState.assessment) return;

    // Append to cascade log and unlock chapter temporarily or proceed
    const newLogEntry = {
      id: `cl_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      chapterTitle: `Ch. ${currentChapter.number}: ${currentChapter.title}`,
      changeSummary: `Writer override: modified locked sequence (${cascadeModalState.changeNature.replace('_', ' ')}).`,
      impactLevel: cascadeModalState.assessment.impactLevel,
      impactedDepartments: cascadeModalState.assessment.affectedDepartments,
      estimatedDelayDays: cascadeModalState.assessment.estimatedDelayDays,
    };

    const updatedChapters = project.chapters.map((ch) =>
      ch.id === currentChapter.id
        ? {
            ...ch,
            isLocked: false, // Unlock to allow writer revisions
          }
        : ch
    );

    setProject((prev) => ({
      ...prev,
      chapters: updatedChapters,
      cascadeLog: [newLogEntry, ...prev.cascadeLog],
      updatedAt: new Date().toISOString(),
    }));

    setCascadeModalState({ isOpen: false, assessment: null, changeNature: 'scene_rewrite' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header & Funnel Navigation */}
      <Header
        project={project}
        activeStage={activeStage}
        onSelectStage={handleSelectStage}
        onUpdateMedium={handleUpdateMedium}
        onToggleLock={handleToggleLock}
        onOpenExport={() => setIsExportOpen(true)}
        onResetProject={handleResetProject}
        onOpenComicControlDeck={() => setActiveStage('script')}
        isComicDeckOpen={activeStage === 'script' && project.medium === 'comic'}
      />

      {/* Main Sequential Funnel Content View */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6">
        {activeStage === 'logline' && (
          <LoglineStage
            data={project.logline}
            onUpdate={(logline) => setProject((prev) => ({ ...prev, logline, updatedAt: new Date().toISOString() }))}
            onProceedToBeats={() => setActiveStage('bible')}
          />
        )}

        {activeStage === 'bible' && (
          <PitchBibleStage
            bible={project.pitchBible}
            onUpdateBible={(pitchBible) =>
              setProject((prev) => ({ ...prev, pitchBible, updatedAt: new Date().toISOString() }))
            }
            onProceedToBeats={() => setActiveStage('beats')}
          />
        )}

        {activeStage === 'beats' && (
          <BeatSheetStage
            project={project}
            onUpdateBeats={(beats: Beat[]) =>
              setProject((prev) => ({ ...prev, beats, updatedAt: new Date().toISOString() }))
            }
            onUpdateChapters={(chapters: Chapter[]) =>
              setProject((prev) => ({ ...prev, chapters, updatedAt: new Date().toISOString() }))
            }
            onSelectChapter={(activeChapterId: string) =>
              setProject((prev) => ({ ...prev, activeChapterId }))
            }
            onProceedToScript={() => setActiveStage('script')}
          />
        )}

        {activeStage === 'script' && (
          <ScriptStage
            project={project}
            onUpdateChapterPages={(chapterId: string, pages: ScriptPage[]) => {
              const updatedChapters = project.chapters.map((ch) =>
                ch.id === chapterId ? { ...ch, pages } : ch
              );
              setProject((prev) => ({ ...prev, chapters: updatedChapters, updatedAt: new Date().toISOString() }));
            }}
            onUpdateChapterScenes={(chapterId: string, scenes: ScreenplayScene[]) => {
              const updatedChapters = project.chapters.map((ch) =>
                ch.id === chapterId ? { ...ch, scenes } : ch
              );
              setProject((prev) => ({ ...prev, chapters: updatedChapters, updatedAt: new Date().toISOString() }));
            }}
            onSelectChapter={(activeChapterId: string) =>
              setProject((prev) => ({ ...prev, activeChapterId }))
            }
            onProceedToStoryboards={() => setActiveStage('storyboard')}
            onLockedEditAttempt={handleLockedEditAttempt}
          />
        )}

        {activeStage === 'storyboard' && (
          <StoryboardStage
            project={project}
            onProceedToAnimatic={() => setActiveStage('animatic')}
            onNavigateToScriptPage={(_pageIndex: number) => setActiveStage('script')}
          />
        )}

        {activeStage === 'animatic' && (
          <AnimaticLockStage
            project={project}
            onToggleLock={handleToggleLock}
            onOpenExport={() => setIsExportOpen(true)}
          />
        )}
      </main>

      {/* Cascading Production Delay Warning Modal */}
      <CascadeWarningModal
        isOpen={cascadeModalState.isOpen}
        assessment={cascadeModalState.assessment}
        chapterTitle={currentChapter.title}
        onCancel={() =>
          setCascadeModalState({ isOpen: false, assessment: null, changeNature: 'scene_rewrite' })
        }
        onConfirmOverride={handleConfirmLockOverride}
      />

      {/* Production Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        project={project}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { 
  ScriptPage, 
  ScriptPanel, 
  DialogueEntry, 
  ShotSize, 
  CharacterProfile,
  Chapter
} from '../../types/project';
import { 
  calculateLetteringAreaCoverage, 
  analyzePageEyeFlow,
  formatStandardComicScript
} from '../../utils/pacingCalculations';
import { AiFieldAssistant } from '../ai/AiFieldAssistant';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Eye, 
  MoveUp, 
  MoveDown, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Camera, 
  MessageSquare, 
  Layout, 
  Maximize2, 
  Sliders, 
  FileText, 
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Copy,
  Scissors
} from 'lucide-react';

interface ComicScriptEditorProps {
  chapter: Chapter;
  characters: CharacterProfile[];
  onUpdateChapterPages: (pages: ScriptPage[]) => void;
  isNarrativeLocked: boolean;
  onLockedEditAttempt: (changeNature: 'dialogue_trim' | 'panel_reorder' | 'scene_rewrite') => boolean;
}

export const ComicScriptEditor: React.FC<ComicScriptEditorProps> = ({
  chapter,
  characters,
  onUpdateChapterPages,
  isNarrativeLocked,
  onLockedEditAttempt,
}) => {
  const pages = chapter.pages || [];
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [showEyeFlowOverlay, setShowEyeFlowOverlay] = useState<boolean>(true);
  const [showRealEstateHeatmap, setShowRealEstateHeatmap] = useState<boolean>(true);
  const [copiedFormat, setCopiedFormat] = useState<boolean>(false);

  const currentPage = pages[selectedPageIndex] || pages[0];

  const shotSizes: ShotSize[] = [
    'Extreme Wide',
    'Wide Establishing',
    'Medium Long',
    'Medium',
    'Over-the-Shoulder',
    'Close-Up',
    'Extreme Close-Up',
    'Dutch Angle / Tilt',
    'Bird\'s Eye',
    'Worm\'s Eye',
  ];

  const handleUpdatePage = (pageIndex: number, fields: Partial<ScriptPage>) => {
    if (isNarrativeLocked && !onLockedEditAttempt('scene_rewrite')) {
      return;
    }
    const updated = pages.map((p, idx) => (idx === pageIndex ? { ...p, ...fields } : p));
    onUpdateChapterPages(updated);
  };

  const handleAddPage = () => {
    if (isNarrativeLocked && !onLockedEditAttempt('scene_rewrite')) {
      return;
    }
    const newPageNum = pages.length + 1;
    const newPage: ScriptPage = {
      id: `pg_${Date.now()}`,
      pageNumber: newPageNum,
      isDoublePageSpread: false,
      readingFlowDirection: 'western-z',
      pageGoalNotes: 'Define page visual turning point...',
      panels: [
        {
          id: `p_${Date.now()}_1`,
          panelNumber: 1,
          shotSize: 'Wide Establishing',
          cameraAngle: 'High Angle',
          description: 'Establish new location or environmental shift.',
          dialogues: [
            {
              id: `d_${Date.now()}_1`,
              character: characters[0]?.name.toUpperCase() || 'PROTAGONIST',
              type: 'caption',
              text: 'Narrative caption setting the stakes.',
              balloonPosition: 'top-left',
            },
          ],
          panelSizeWeight: 3,
          focalPoint: { x: 50, y: 50 },
        },
        {
          id: `p_${Date.now()}_2`,
          panelNumber: 2,
          shotSize: 'Close-Up',
          cameraAngle: 'Eye Level',
          description: 'Character reaction to unexpected event.',
          dialogues: [],
          panelSizeWeight: 3,
          focalPoint: { x: 50, y: 50 },
        },
      ],
    };

    const newPages = [...pages, newPage];
    onUpdateChapterPages(newPages);
    setSelectedPageIndex(newPages.length - 1);
  };

  const handleDeletePage = (pageIndex: number) => {
    if (pages.length <= 1) return;
    if (isNarrativeLocked && !onLockedEditAttempt('scene_rewrite')) {
      return;
    }
    const remaining = pages.filter((_, idx) => idx !== pageIndex).map((p, i) => ({
      ...p,
      pageNumber: i + 1,
    }));
    onUpdateChapterPages(remaining);
    setSelectedPageIndex(Math.max(0, pageIndex - 1));
  };

  // Panel operations
  const handleAddPanel = () => {
    if (!currentPage) return;
    if (isNarrativeLocked && !onLockedEditAttempt('panel_reorder')) {
      return;
    }
    const currentPanels = currentPage.panels || [];
    const newPanelNumber = currentPanels.length + 1;
    const newPanel: ScriptPanel = {
      id: `p_${Date.now()}`,
      panelNumber: newPanelNumber,
      shotSize: newPanelNumber % 2 === 0 ? 'Close-Up' : 'Medium',
      cameraAngle: 'Eye Level',
      description: 'Describe the action, character staging, and visual focal point.',
      dialogues: [],
      panelSizeWeight: 2,
      focalPoint: { x: 50, y: 50 },
    };

    handleUpdatePage(selectedPageIndex, {
      panels: [...currentPanels, newPanel],
    });
    setSelectedPanelId(newPanel.id);
  };

  const handleUpdatePanel = (panelId: string, fields: Partial<ScriptPanel>) => {
    if (!currentPage) return;
    if (isNarrativeLocked && 'dialogues' in fields && !onLockedEditAttempt('dialogue_trim')) {
      return;
    }
    if (isNarrativeLocked && ('panelSizeWeight' in fields || 'shotSize' in fields) && !onLockedEditAttempt('panel_reorder')) {
      return;
    }

    const updatedPanels = (currentPage.panels || []).map((panel) =>
      panel.id === panelId ? { ...panel, ...fields } : panel
    );
    handleUpdatePage(selectedPageIndex, { panels: updatedPanels });
  };

  const handleDeletePanel = (panelId: string) => {
    if (!currentPage) return;
    if (currentPage.panels.length <= 1) return;
    if (isNarrativeLocked && !onLockedEditAttempt('panel_reorder')) {
      return;
    }

    const remaining = currentPage.panels
      .filter((p) => p.id !== panelId)
      .map((p, idx) => ({ ...p, panelNumber: idx + 1 }));
    handleUpdatePage(selectedPageIndex, { panels: remaining });
  };

  const handleReorderPanel = (index: number, direction: 'up' | 'down') => {
    if (!currentPage) return;
    const panels = [...currentPage.panels];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= panels.length) return;

    if (isNarrativeLocked && !onLockedEditAttempt('panel_reorder')) {
      return;
    }

    const temp = panels[index];
    panels[index] = panels[targetIndex];
    panels[targetIndex] = temp;

    const renumbered = panels.map((p, i) => ({ ...p, panelNumber: i + 1 }));
    handleUpdatePage(selectedPageIndex, { panels: renumbered });
  };

  // Dialogue operations
  const handleAddDialogue = (panelId: string) => {
    if (!currentPage) return;
    const panel = currentPage.panels.find((p) => p.id === panelId);
    if (!panel) return;

    if (isNarrativeLocked && !onLockedEditAttempt('dialogue_trim')) {
      return;
    }

    const positions: DialogueEntry['balloonPosition'][] = [
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
      'center',
    ];
    const nextPos = positions[panel.dialogues.length % positions.length];

    const newDialogue: DialogueEntry = {
      id: `d_${Date.now()}`,
      character: characters[0]?.name.toUpperCase() || 'SPEAKER',
      type: 'dialogue',
      text: 'Enter spoken dialogue or caption text...',
      balloonPosition: nextPos,
    };

    handleUpdatePanel(panelId, {
      dialogues: [...panel.dialogues, newDialogue],
    });
  };

  const handleUpdateDialogue = (
    panelId: string,
    dialogueId: string,
    fields: Partial<DialogueEntry>
  ) => {
    if (!currentPage) return;
    const panel = currentPage.panels.find((p) => p.id === panelId);
    if (!panel) return;

    if (isNarrativeLocked && !onLockedEditAttempt('dialogue_trim')) {
      return;
    }

    const updatedDialogues = panel.dialogues.map((d) =>
      d.id === dialogueId ? { ...d, ...fields } : d
    );
    handleUpdatePanel(panelId, { dialogues: updatedDialogues });
  };

  const handleDeleteDialogue = (panelId: string, dialogueId: string) => {
    if (!currentPage) return;
    const panel = currentPage.panels.find((p) => p.id === panelId);
    if (!panel) return;

    if (isNarrativeLocked && !onLockedEditAttempt('dialogue_trim')) {
      return;
    }

    const remaining = panel.dialogues.filter((d) => d.id !== dialogueId);
    handleUpdatePanel(panelId, { dialogues: remaining });
  };

  // Quick Page Grid Presets
  const applyPresetLayout = (presetName: string) => {
    if (!currentPage) return;
    if (isNarrativeLocked && !onLockedEditAttempt('panel_reorder')) {
      return;
    }

    let newPanels: ScriptPanel[] = [];
    if (presetName === '1-splash') {
      newPanels = [
        {
          id: `p_${Date.now()}_1`,
          panelNumber: 1,
          shotSize: 'Extreme Wide',
          cameraAngle: 'Low Angle Splash',
          description: 'Full-page splash showcase: key climatic revelation or monumental action.',
          dialogues: [],
          panelSizeWeight: 6,
          focalPoint: { x: 50, y: 50 },
        },
      ];
    } else if (presetName === '3-dramatic') {
      newPanels = [
        {
          id: `p_${Date.now()}_1`,
          panelNumber: 1,
          shotSize: 'Wide Establishing',
          cameraAngle: 'High Angle',
          description: 'Establish the battlefield or room tension.',
          dialogues: [],
          panelSizeWeight: 3,
          focalPoint: { x: 30, y: 40 },
        },
        {
          id: `p_${Date.now()}_2`,
          panelNumber: 2,
          shotSize: 'Medium',
          cameraAngle: 'Eye Level',
          description: 'Character prepares their weapon or reveals secret.',
          dialogues: [],
          panelSizeWeight: 2,
          focalPoint: { x: 70, y: 50 },
        },
        {
          id: `p_${Date.now()}_3`,
          panelNumber: 3,
          shotSize: 'Dutch Angle / Tilt',
          cameraAngle: 'Tilted Low',
          description: 'Sudden cliffhanger shock or weapon firing.',
          dialogues: [],
          panelSizeWeight: 3,
          focalPoint: { x: 50, y: 60 },
        },
      ];
    } else if (presetName === '5-action') {
      newPanels = [
        { id: `p_${Date.now()}_1`, panelNumber: 1, shotSize: 'Wide Establishing', cameraAngle: 'Eye Level', description: 'Approach target.', dialogues: [], panelSizeWeight: 2, focalPoint: { x: 30, y: 30 } },
        { id: `p_${Date.now()}_2`, panelNumber: 2, shotSize: 'Close-Up', cameraAngle: 'Side Angle', description: 'Trigger pressed.', dialogues: [], panelSizeWeight: 1, focalPoint: { x: 50, y: 50 } },
        { id: `p_${Date.now()}_3`, panelNumber: 3, shotSize: 'Medium', cameraAngle: 'High Angle', description: 'Dodge and roll.', dialogues: [], panelSizeWeight: 1, focalPoint: { x: 50, y: 50 } },
        { id: `p_${Date.now()}_4`, panelNumber: 4, shotSize: 'Over-the-Shoulder', cameraAngle: 'OTS', description: 'Confront opponent face-to-face.', dialogues: [], panelSizeWeight: 2, focalPoint: { x: 60, y: 50 } },
        { id: `p_${Date.now()}_5`, panelNumber: 5, shotSize: 'Extreme Close-Up', cameraAngle: 'Level', description: 'Eyes widen as trap triggers.', dialogues: [], panelSizeWeight: 2, focalPoint: { x: 50, y: 50 } },
      ];
    } else if (presetName === '6-grid') {
      newPanels = [1, 2, 3, 4, 5, 6].map((num) => ({
        id: `p_${Date.now()}_${num}`,
        panelNumber: num,
        shotSize: (num % 2 === 0 ? 'Close-Up' : 'Medium') as ShotSize,
        cameraAngle: 'Eye Level',
        description: `Panel ${num} rhythmic sequence.`,
        dialogues: [],
        panelSizeWeight: 2,
        focalPoint: { x: 50, y: 50 },
      }));
    }

    handleUpdatePage(selectedPageIndex, { panels: newPanels });
  };

  const eyeFlow = currentPage ? analyzePageEyeFlow(currentPage) : null;
  const isOddPage = (currentPage?.pageNumber || 1) % 2 !== 0;

  const handleCopyStandardScript = () => {
    if (!currentPage) return;
    const formatted = formatStandardComicScript(chapter.title, `Page ${currentPage.pageNumber}`, [currentPage]);
    navigator.clipboard.writeText(formatted);
    setCopiedFormat(true);
    setTimeout(() => setCopiedFormat(false), 2000);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner & Mode Description */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              Pipeline Stage 4 &bull; Comic Director Deck
            </span>
            <span className="text-xs text-slate-400">
              Chapter: <strong className="text-white">{chapter.title}</strong>
            </span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">
            Sequential Comic Script Editor & Pacing Analyzer
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Break down scripts by page and panel. Use AI to generate staging descriptions, rephrase dialogue, and trim text to fit lettering room limits.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyStandardScript}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
            title="Copy standard DC/Marvel comic script format for this page"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copiedFormat ? 'Script Copied!' : 'Copy Script Text'}</span>
          </button>

          <button
            onClick={handleAddPage}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Page</span>
          </button>
        </div>
      </div>

      {/* Page Navigation & Presets Bar */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Page selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {pages.map((pg, idx) => {
            const isSelected = idx === selectedPageIndex;
            const isOdd = pg.pageNumber % 2 !== 0;
            return (
              <button
                key={pg.id}
                onClick={() => setSelectedPageIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>Page {pg.pageNumber}</span>
                <span className={`text-[10px] px-1 rounded ${
                  isOdd ? 'bg-amber-950/60 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isOdd ? 'Turn Reveal' : 'Spread'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Presets & Overlays */}
        <div className="flex items-center gap-2">
          {/* Preset Buttons */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] bg-slate-900 p-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 px-1 font-medium">Layout:</span>
            <button
              onClick={() => applyPresetLayout('1-splash')}
              className="px-2 py-0.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white"
              title="Full Page Splash (1 panel)"
            >
              Splash
            </button>
            <button
              onClick={() => applyPresetLayout('3-dramatic')}
              className="px-2 py-0.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white"
              title="3-Panel Dramatic Shift"
            >
              3-Panel
            </button>
            <button
              onClick={() => applyPresetLayout('5-action')}
              className="px-2 py-0.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white"
              title="5-Panel Dynamic Action"
            >
              5-Action
            </button>
            <button
              onClick={() => applyPresetLayout('6-grid')}
              className="px-2 py-0.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white"
              title="6-Panel Classic Sequential Grid"
            >
              6-Grid
            </button>
          </div>

          {/* Eye Flow Overlay Toggle */}
          <button
            onClick={() => setShowEyeFlowOverlay(!showEyeFlowOverlay)}
            className={`px-2.5 py-1 text-xs rounded-lg border font-medium flex items-center gap-1.5 transition ${
              showEyeFlowOverlay
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700/80 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Eye-Flow</span>
          </button>

          {/* Real Estate Heatmap Toggle */}
          <button
            onClick={() => setShowRealEstateHeatmap(!showRealEstateHeatmap)}
            className={`px-2.5 py-1 text-xs rounded-lg border font-medium flex items-center gap-1.5 transition ${
              showRealEstateHeatmap
                ? 'bg-amber-950 text-amber-300 border-amber-700/80 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Letterer Meter</span>
          </button>
        </div>
      </div>

      {/* Main Dual-View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Comic Script Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
            {/* Page Header bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex-grow mr-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-white">
                    PAGE {currentPage?.pageNumber || 1}
                  </h2>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    isOddPage
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {isOddPage ? 'Facing Right (Odd Page Reveal)' : 'Facing Left (Even Page Spread)'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={currentPage?.pageGoalNotes || ''}
                    onChange={(e) => handleUpdatePage(selectedPageIndex, { pageGoalNotes: e.target.value })}
                    placeholder="Writer Note: Goal of this page (e.g. Reveal Kai's memory drive)..."
                    className="bg-transparent text-xs text-slate-400 w-full outline-none focus:text-slate-200 border-b border-transparent focus:border-cyan-500"
                  />
                  <AiFieldAssistant
                    fieldType="Page Goal & Pacing Note"
                    currentValue={currentPage?.pageGoalNotes || ''}
                    onApply={(val) => handleUpdatePage(selectedPageIndex, { pageGoalNotes: val })}
                    placeholderKeywords="cliffhanger reveal, quiet pause, chase..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pages.length > 1 && (
                  <button
                    onClick={() => handleDeletePage(selectedPageIndex)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                    title="Delete this page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleAddPanel}
                  className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  Add Panel
                </button>
              </div>
            </div>

            {/* Panels List */}
            <div className="space-y-4">
              {(currentPage?.panels || []).map((panel, pIdx) => {
                const analysis = calculateLetteringAreaCoverage(panel);
                const isSelected = panel.id === selectedPanelId;

                return (
                  <div
                    key={panel.id}
                    onClick={() => setSelectedPanelId(panel.id)}
                    className={`rounded-xl border transition p-4 space-y-3 ${
                      isSelected
                        ? 'bg-slate-950/90 border-cyan-500/80 ring-1 ring-cyan-500/30 shadow-lg'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Panel Top Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 font-black text-xs flex items-center justify-center">
                          P{panel.panelNumber}
                        </span>

                        {/* Shot Size / Framing */}
                        <div className="flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-slate-400" />
                          <select
                            value={panel.shotSize}
                            onChange={(e) =>
                              handleUpdatePanel(panel.id, { shotSize: e.target.value as ShotSize })
                            }
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-semibold text-white focus:border-cyan-500 outline-none"
                          >
                            {shotSizes.map((sz) => (
                              <option key={sz} value={sz}>
                                {sz}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Camera Angle */}
                        <input
                          type="text"
                          value={panel.cameraAngle}
                          onChange={(e) => handleUpdatePanel(panel.id, { cameraAngle: e.target.value })}
                          placeholder="Angle (e.g. Eye Level, Low Angle)"
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 w-28 outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Dimension Weight & Reorder */}
                      <div className="flex items-center gap-2">
                        {/* Panel Weight (Relative visual area) */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          <span>Size:</span>
                          <select
                            value={panel.panelSizeWeight}
                            onChange={(e) =>
                              handleUpdatePanel(panel.id, { panelSizeWeight: Number(e.target.value) })
                            }
                            className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
                          >
                            <option value="1">1 (Tiny Detail)</option>
                            <option value="2">2 (Standard)</option>
                            <option value="3">3 (Wide/Tall)</option>
                            <option value="4">4 (Half Page)</option>
                            <option value="6">6 (Full Splash)</option>
                          </select>
                        </div>

                        {/* Move Up / Down */}
                        <button
                          disabled={pIdx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderPanel(pIdx, 'up');
                          }}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Panel Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={pIdx === (currentPage.panels?.length || 0) - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderPanel(pIdx, 'down');
                          }}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Panel Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePanel(panel.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                          title="Delete Panel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Action Line & Visual Description with AI Assist */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Visual Description & Penciller Directions
                        </label>
                        <AiFieldAssistant
                          fieldType="Panel Visual Staging"
                          currentValue={panel.description}
                          onApply={(val) => handleUpdatePanel(panel.id, { description: val })}
                          placeholderKeywords="neon steam, rim light, silhouette, dynamic kick..."
                          showExpandVisuals={true}
                          context={{ shotSize: panel.shotSize, angle: panel.cameraAngle }}
                        />
                      </div>
                      <textarea
                        value={panel.description}
                        onChange={(e) => handleUpdatePanel(panel.id, { description: e.target.value })}
                        rows={2}
                        placeholder="What is depicted? Specify character poses, background elements, lighting sources, and focal hierarchy."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-500 outline-none leading-relaxed"
                      />
                    </div>

                    {/* Speech Balloons & Captions with AI Assist */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <MessageSquare className="w-3 h-3 text-cyan-400" />
                          Dialogue, Captions & SFX ({panel.dialogues.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddDialogue(panel.id)}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Balloon / Caption
                        </button>
                      </div>

                      {panel.dialogues.length === 0 && (
                        <div className="text-center py-2 text-[11px] text-slate-500 border border-dashed border-slate-800/80 rounded-lg">
                          Silent visual panel (Pacing breath or kinetic action).
                        </div>
                      )}

                      <div className="space-y-2">
                        {panel.dialogues.map((diag) => (
                          <div
                            key={diag.id}
                            className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {/* Speaker Name */}
                                <input
                                  type="text"
                                  value={diag.character}
                                  onChange={(e) =>
                                    handleUpdateDialogue(panel.id, diag.id, { character: e.target.value })
                                  }
                                  className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs font-bold text-white uppercase"
                                />

                                {/* Balloon Type */}
                                <select
                                  value={diag.type}
                                  onChange={(e) =>
                                    handleUpdateDialogue(panel.id, diag.id, { type: e.target.value as any })
                                  }
                                  className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-300"
                                >
                                  <option value="dialogue">Dialogue</option>
                                  <option value="caption">Caption</option>
                                  <option value="whisper">Whisper</option>
                                  <option value="shout">Shout</option>
                                  <option value="sfx">SFX</option>
                                </select>

                                {/* Placement Anchor */}
                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <span>Anchor:</span>
                                  <select
                                    value={diag.balloonPosition}
                                    onChange={(e) =>
                                      handleUpdateDialogue(panel.id, diag.id, {
                                        balloonPosition: e.target.value as any,
                                      })
                                    }
                                    className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-cyan-300 font-medium"
                                  >
                                    <option value="top-left">Top-Left</option>
                                    <option value="top-right">Top-Right</option>
                                    <option value="center">Center</option>
                                    <option value="bottom-left">Bottom-Left</option>
                                    <option value="bottom-right">Bottom-Right</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <AiFieldAssistant
                                  fieldType={`${diag.character} (${diag.type})`}
                                  currentValue={diag.text}
                                  onApply={(val) => handleUpdateDialogue(panel.id, diag.id, { text: val })}
                                  placeholderKeywords="sarcastic, ominous, whisper..."
                                  showShorten={true}
                                  context={{ character: diag.character, type: diag.type }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDialogue(panel.id, diag.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400"
                                  title="Remove dialogue"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <input
                              type="text"
                              value={diag.text}
                              onChange={(e) =>
                                handleUpdateDialogue(panel.id, diag.id, { text: e.target.value })
                              }
                              placeholder="Spoken words, sound effect, or caption narration..."
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 outline-none font-script"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Artist Specific Notes with AI Assist */}
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={panel.notesForArtist || ''}
                        onChange={(e) => handleUpdatePanel(panel.id, { notesForArtist: e.target.value })}
                        placeholder="[Artist Note: e.g. Silhouette lighting, heavy black rain gutters]..."
                        className="w-full bg-transparent text-[11px] text-indigo-300 italic border-b border-dashed border-indigo-900/60 focus:border-indigo-500 outline-none py-1"
                      />
                      <AiFieldAssistant
                        fieldType="Artist / Penciller Note"
                        currentValue={panel.notesForArtist || ''}
                        onApply={(val) => handleUpdatePanel(panel.id, { notesForArtist: val })}
                        placeholderKeywords="screentone, ink splash, camera angle..."
                        showExpandVisuals={true}
                      />
                    </div>

                    {/* Visual Real Estate & Lettering Room Meter */}
                    <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                      analysis.status === 'optimal'
                        ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-300'
                        : analysis.status === 'dense'
                        ? 'bg-amber-950/30 border-amber-900/50 text-amber-300'
                        : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        {analysis.status === 'optimal' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <span>Lettering Real Estate: ~{analysis.estimatedBalloonAreaPercent}% Coverage</span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-950">
                              {analysis.wordCount} words
                            </span>
                          </div>
                          <p className="text-[11px] opacity-90">{analysis.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Live Interactive Comic Page & Eye-Flow Visualizer */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Live Page Layout & Eye-Flow Deck
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentPage?.panels?.length || 0} Panels
              </span>
            </div>

            {/* Cliffhanger / Page Turn Gauge */}
            {eyeFlow && (
              <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Page-Turn Reveal Cliffhanger:</span>
                  <span className="font-bold text-amber-400">{eyeFlow.pageTurnCliffhangerRating}/10</span>
                </div>
                <p className="text-[11px] text-slate-400">{eyeFlow.summary}</p>
              </div>
            )}

            {/* RENDERED COMIC PAGE CANVAS */}
            <div className="relative bg-slate-950 border-4 border-slate-800 rounded-xl p-3 aspect-[3/4] shadow-2xl overflow-hidden flex flex-col justify-between">
              {/* Eye-Flow SVG Overlay */}
              {showEyeFlowOverlay && eyeFlow && eyeFlow.flowPoints.length > 1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="5"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                    </marker>
                  </defs>
                  {/* SVG Eye-flow path connecting sequential panels */}
                  {currentPage?.panels.map((p, idx) => {
                    if (idx === currentPage.panels.length - 1) return null;
                    const nextP = currentPage.panels[idx + 1];
                    const startY = ((idx + 0.5) / currentPage.panels.length) * 100;
                    const endY = ((idx + 1.5) / currentPage.panels.length) * 100;
                    const startX = p.panelNumber % 2 === 1 ? 35 : 65;
                    const endX = nextP.panelNumber % 2 === 1 ? 35 : 65;

                    return (
                      <line
                        key={idx}
                        x1={`${startX}%`}
                        y1={`${startY}%`}
                        x2={`${endX}%`}
                        y2={`${endY}%`}
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                        strokeDasharray="4 3"
                        markerEnd="url(#arrow)"
                        opacity="0.85"
                      />
                    );
                  })}
                </svg>
              )}

              {/* Rendered Panels on the page */}
              <div className="w-full h-full flex flex-col gap-2.5 z-10">
                {(currentPage?.panels || []).map((panel) => {
                  const analysis = calculateLetteringAreaCoverage(panel);
                  const isSelected = panel.id === selectedPanelId;

                  return (
                    <div
                      key={panel.id}
                      onClick={() => setSelectedPanelId(panel.id)}
                      className={`relative border-2 rounded-lg p-2.5 flex flex-col justify-between cursor-pointer transition flex-grow ${
                        isSelected
                          ? 'border-cyan-400 bg-slate-900/90 shadow-lg'
                          : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
                      }`}
                      style={{
                        flexBasis: `${(panel.panelSizeWeight / 6) * 100}%`,
                      }}
                    >
                      {/* Panel Label & Camera info */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold bg-slate-950 px-1.5 py-0.5 rounded text-white border border-slate-800">
                          P{panel.panelNumber}
                        </span>
                        <span className="font-mono text-cyan-300 font-bold bg-slate-950/80 px-1 rounded">
                          {panel.shotSize}
                        </span>
                      </div>

                      {/* Visual Action Preview snippet */}
                      <p className="text-[10px] text-slate-300 line-clamp-2 my-1 italic">
                        "{panel.description}"
                      </p>

                      {/* Placed Speech Balloons / Captions inside panel */}
                      <div className="space-y-1 my-auto">
                        {panel.dialogues.map((d) => (
                          <div
                            key={d.id}
                            className={`text-[9px] p-1 font-bold leading-tight ${
                              d.type === 'caption'
                                ? 'comic-caption max-w-[85%]'
                                : d.type === 'sfx'
                                ? 'comic-sfx text-amber-400 text-xs uppercase'
                                : 'comic-balloon max-w-[85%]'
                            } ${
                              d.balloonPosition === 'top-right' || d.balloonPosition === 'bottom-right'
                                ? 'ml-auto text-right'
                                : d.balloonPosition === 'center'
                                ? 'mx-auto text-center'
                                : 'mr-auto text-left'
                            }`}
                          >
                            <span className="text-[8px] font-black uppercase tracking-wider block opacity-75">
                              {d.character}:
                            </span>
                            <span>{d.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Real Estate Heatmap Badge */}
                      {showRealEstateHeatmap && (
                        <div className="flex items-center justify-between text-[9px] pt-1 border-t border-slate-800/80">
                          <span className="text-slate-400">Balloon Area:</span>
                          <span
                            className={`font-mono font-bold ${
                              analysis.status === 'optimal'
                                ? 'text-emerald-400'
                                : analysis.status === 'dense'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {analysis.estimatedBalloonAreaPercent}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pacing Advice Card */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Sequential Pacing Rule:
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sequential art gives the reader control over time, whereas animation dictates speed directly. Adjust panel widths to stretch time: wider panels invite prolonged gaze, while narrow tall panels accelerate reading cadence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

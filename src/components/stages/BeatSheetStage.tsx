import React, { useState } from 'react';
import { ProjectData, Beat, Chapter, BeatType, ActTag, SubplotDef } from '../../types/project';
import { AiFieldAssistant } from '../ai/AiFieldAssistant';
import { 
  GitFork, 
  Plus, 
  Trash2, 
  ArrowRight, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  BarChart2,
  Kanban,
  Calendar,
  Filter,
  MoveLeft,
  MoveRight,
  Link2,
  Sliders,
  ChevronDown,
  Edit3,
  Wand2
} from 'lucide-react';

interface BeatSheetStageProps {
  project: ProjectData;
  onUpdateBeats: (beats: Beat[]) => void;
  onUpdateChapters: (chapters: Chapter[]) => void;
  onSelectChapter: (chapterId: string) => void;
  onProceedToScript: () => void;
}

export const BeatSheetStage: React.FC<BeatSheetStageProps> = ({
  project,
  onUpdateBeats,
  onUpdateChapters,
  onSelectChapter,
  onProceedToScript,
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'kanban'>('kanban');
  const [kanbanGroupBy, setKanbanGroupBy] = useState<'acts' | 'chapters' | 'status'>('acts');
  const [selectedSubplotFilter, setSelectedSubplotFilter] = useState<string>('all');
  const [showTensionChart, setShowTensionChart] = useState<boolean>(true);
  const [editingBeatId, setEditingBeatId] = useState<string | null>(null);

  const chapters = project.chapters;
  const subplots = project.pitchBible.subplots;
  const activeChapter = chapters.find((c) => c.id === project.activeChapterId) || chapters[0];

  const filteredBeats = project.beats.filter((b) => {
    if (selectedSubplotFilter !== 'all' && b.subplotId !== selectedSubplotFilter) return false;
    return true;
  });

  const beatTypeOptions: BeatType[] = [
    'Inciting Incident',
    'Call to Action',
    'First Plot Point',
    'Pinch Point 1',
    'Midpoint Shift',
    'Pinch Point 2',
    'All Hope Lost / Crisis',
    'Dark Night of the Soul',
    'Climax / Confrontation',
    'Resolution / Aftermath',
    'Subplot Escalation',
  ];

  const handleAddBeat = (chapterId: string, act: ActTag = 'Act 1') => {
    const newBeat: Beat = {
      id: `bt_${Date.now()}`,
      chapterId: chapterId || activeChapter?.id || chapters[0]?.id || 'ch1',
      act,
      beatType: 'Subplot Escalation',
      title: 'New Story Beat',
      summary: 'Action or revelation that escalates tension or tests character needs.',
      tensionRating: 6,
      subplotId: subplots[0]?.id || 'sub_a',
      status: 'planned',
      pageTarget: 4,
    };
    onUpdateBeats([...project.beats, newBeat]);
    setEditingBeatId(newBeat.id);
  };

  const handleUpdateBeat = (beatId: string, fields: Partial<Beat>) => {
    const updated = project.beats.map((b) => (b.id === beatId ? { ...b, ...fields } : b));
    onUpdateBeats(updated);
  };

  const handleDeleteBeat = (beatId: string) => {
    onUpdateBeats(project.beats.filter((b) => b.id !== beatId));
    if (editingBeatId === beatId) setEditingBeatId(null);
  };

  const handleMoveBeatAct = (beat: Beat, direction: 'prev' | 'next') => {
    const actOrder: ActTag[] = ['Act 1', 'Act 2A', 'Act 2B', 'Act 3'];
    const currentIdx = actOrder.indexOf(beat.act);
    const targetIdx = direction === 'prev' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx >= 0 && targetIdx < actOrder.length) {
      handleUpdateBeat(beat.id, { act: actOrder[targetIdx] });
    }
  };

  const handleMoveBeatStatus = (beat: Beat, direction: 'prev' | 'next') => {
    const statuses: Beat['status'][] = ['planned', 'drafted', 'approved'];
    const currentIdx = statuses.indexOf(beat.status);
    const targetIdx = direction === 'prev' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx >= 0 && targetIdx < statuses.length) {
      handleUpdateBeat(beat.id, { status: statuses[targetIdx] });
    }
  };

  const handleMoveBeatChapter = (beat: Beat, direction: 'prev' | 'next') => {
    const currentIdx = chapters.findIndex((c) => c.id === beat.chapterId);
    const targetIdx = direction === 'prev' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx >= 0 && targetIdx < chapters.length) {
      handleUpdateBeat(beat.id, { chapterId: chapters[targetIdx].id });
    }
  };

  const handleUpdateChapter = (chapterId: string, fields: Partial<Chapter>) => {
    const updated = chapters.map((c) => (c.id === chapterId ? { ...c, ...fields } : c));
    onUpdateChapters(updated);
  };

  // SVG Tension Curve
  const chartWidth = 720;
  const chartHeight = 130;
  const beatsForChart = [...filteredBeats].sort((a, b) => {
    const chA = chapters.findIndex((c) => c.id === a.chapterId);
    const chB = chapters.findIndex((c) => c.id === b.chapterId);
    if (chA !== chB) return chA - chB;
    return a.id.localeCompare(b.id);
  });

  const chartPoints = beatsForChart.map((b, i) => {
    const x = beatsForChart.length > 1 ? (i / (beatsForChart.length - 1)) * (chartWidth - 50) + 25 : 50;
    const y = chartHeight - 20 - (b.tensionRating / 10) * (chartHeight - 40);
    return { x, y, beat: b };
  });

  const pathD = chartPoints.length > 1
    ? chartPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  // Kanban Columns definitions
  const actColumns: { id: ActTag; title: string; subtitle: string }[] = [
    { id: 'Act 1', title: 'Act 1: The Inciting Trigger', subtitle: 'Status Quo, Inciting Incident, First Call' },
    { id: 'Act 2A', title: 'Act 2A: Rising Stakes', subtitle: 'New Arena, First Tests, Subplot Escalation' },
    { id: 'Act 2B', title: 'Act 2B: The Midpoint Shift', subtitle: 'Irreversible Choice, Dark Night of the Soul' },
    { id: 'Act 3', title: 'Act 3: Crisis & Climax', subtitle: 'All Hope Lost, Final Confrontation, Resolution' },
  ];

  const statusColumns: { id: Beat['status']; title: string; color: string }[] = [
    { id: 'planned', title: 'Planned Beats', color: 'border-slate-700' },
    { id: 'drafted', title: 'In Script Draft', color: 'border-cyan-700' },
    { id: 'approved', title: 'Locked for Production', color: 'border-emerald-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 to-cyan-950/70 border border-cyan-800/40 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Pipeline Stage 3 &bull; Story Writing Outline
              </span>
              <h1 className="text-xl font-bold text-white mt-0.5">
                Dynamic Beat Sheet & Multi-Arc Narrative Board
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Structure long-term plots with woven subplots (A-Plot, B-Plot, C-Plot) across multiple chapters. Use AI to generate escalating story twists, rephrase summaries, and calibrate narrative tension.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAddBeat(activeChapter?.id || 'ch1')}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Story Beat</span>
          </button>
        </div>
      </div>

      {/* View Switcher, Filters & Chapters Carousel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'timeline'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Multi-Chapter Timeline</span>
            </button>
          </div>

          {viewMode === 'kanban' && (
            <div className="flex items-center gap-1 text-xs bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[11px] px-1.5 font-medium">Columns:</span>
              {(['acts', 'chapters', 'status'] as const).map((group) => (
                <button
                  key={group}
                  onClick={() => setKanbanGroupBy(group)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold capitalize transition ${
                    kanbanGroupBy === group
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subplot Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" />
            Arc:
          </span>
          <button
            onClick={() => setSelectedSubplotFilter('all')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              selectedSubplotFilter === 'all'
                ? 'bg-slate-200 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Subplots ({project.beats.length})
          </button>
          {subplots.map((sub) => {
            const count = project.beats.filter((b) => b.subplotId === sub.id).length;
            const isSelected = selectedSubplotFilter === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubplotFilter(sub.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                  isSelected ? 'text-white' : 'text-slate-300 hover:text-white bg-slate-950 border border-slate-800'
                }`}
                style={{
                  backgroundColor: isSelected ? sub.color : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: sub.color }}
                />
                <span>{sub.name}</span>
                <span className="opacity-80 font-mono text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-Time Tension Curve Graph */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Narrative Tension Curve (Pacing Dynamics)</h2>
          </div>
          <button
            onClick={() => setShowTensionChart(!showTensionChart)}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            {showTensionChart ? 'Hide Graph' : 'Show Graph'}
          </button>
        </div>

        {showTensionChart && chartPoints.length > 0 && (
          <div className="relative bg-slate-950 rounded-lg p-3 border border-slate-800 overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32">
              <line x1="25" y1="20" x2={chartWidth - 25} y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="25" y1={chartHeight / 2} x2={chartWidth - 25} y2={chartHeight / 2} stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="25" y1={chartHeight - 20} x2={chartWidth - 25} y2={chartHeight - 20} stroke="#334155" />

              {pathD && (
                <path
                  d={`${pathD} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - 20} L ${chartPoints[0].x} ${chartHeight - 20} Z`}
                  fill="url(#tensionFill)"
                  opacity="0.2"
                />
              )}

              {pathD && <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />}

              {chartPoints.map((p, idx) => {
                const sub = subplots.find((s) => s.id === p.beat.subplotId);
                return (
                  <g key={idx} className="cursor-pointer" onClick={() => setEditingBeatId(p.beat.id)}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill={sub?.color || '#06b6d4'}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <text
                      x={p.x}
                      y={p.y - 7}
                      fontSize="9"
                      fill="#94a3b8"
                      textAnchor="middle"
                      className="font-mono font-bold"
                    >
                      {p.beat.tensionRating}
                    </text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="tensionFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-3 pt-1">
              <span>Act 1 Setup (Low Tension)</span>
              <span>Midpoint Twist (Escalation)</span>
              <span>Climax Battle (Peak Tension)</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Chapter Details Bar with AI Assist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5 flex-grow">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400">Chapter {activeChapter?.number} Title:</span>
            <input
              type="text"
              value={activeChapter?.title || ''}
              onChange={(e) => handleUpdateChapter(activeChapter.id, { title: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-sm font-bold text-white focus:border-cyan-500 outline-none w-56"
            />
            <AiFieldAssistant
              fieldType="Chapter Title"
              currentValue={activeChapter?.title || ''}
              onApply={(val) => handleUpdateChapter(activeChapter.id, { title: val })}
              placeholderKeywords="noir, suspenseful, punchy..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={activeChapter?.synopsis || ''}
              onChange={(e) => handleUpdateChapter(activeChapter.id, { synopsis: e.target.value })}
              placeholder="Synopsis for this chapter's sequence..."
              className="bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 w-full max-w-xl outline-none focus:border-cyan-500"
            />
            <AiFieldAssistant
              fieldType="Chapter Synopsis"
              currentValue={activeChapter?.synopsis || ''}
              onApply={(val) => handleUpdateChapter(activeChapter.id, { synopsis: val })}
              placeholderKeywords="escape, ambush, confrontation..."
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {/* Columns by ACT */}
          {kanbanGroupBy === 'acts' &&
            actColumns.map((col) => {
              const colBeats = filteredBeats.filter((b) => b.act === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3 flex flex-col min-h-[500px]"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</h3>
                      <p className="text-[10px] text-slate-400">{col.subtitle}</p>
                    </div>
                    <span className="text-xs font-bold bg-slate-950 px-2 py-0.5 rounded text-cyan-400 border border-slate-800 font-mono">
                      {colBeats.length}
                    </span>
                  </div>

                  {/* Beats in column */}
                  <div className="space-y-3 flex-grow">
                    {colBeats.map((beat) => (
                      <BeatCard
                        key={beat.id}
                        beat={beat}
                        subplots={subplots}
                        chapters={chapters}
                        onUpdate={(fields) => handleUpdateBeat(beat.id, fields)}
                        onDelete={() => handleDeleteBeat(beat.id)}
                        onMoveAct={(dir) => handleMoveBeatAct(beat, dir)}
                        onMoveStatus={(dir) => handleMoveBeatStatus(beat, dir)}
                        onMoveChapter={(dir) => handleMoveBeatChapter(beat, dir)}
                        beatTypeOptions={beatTypeOptions}
                        isEditing={editingBeatId === beat.id}
                        onToggleEdit={() => setEditingBeatId(editingBeatId === beat.id ? null : beat.id)}
                      />
                    ))}

                    {colBeats.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                        No beats plotted in this act.
                      </div>
                    )}
                  </div>

                  {/* Quick Add Beat to Act */}
                  <button
                    onClick={() => handleAddBeat(activeChapter?.id || 'ch1', col.id)}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Add Beat to {col.id}</span>
                  </button>
                </div>
              );
            })}

          {/* Columns by CHAPTER */}
          {kanbanGroupBy === 'chapters' &&
            chapters.map((ch) => {
              const colBeats = filteredBeats.filter((b) => b.chapterId === ch.id);
              return (
                <div
                  key={ch.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3 flex flex-col min-h-[500px]"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Ch. {ch.number}: {ch.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{ch.synopsis}</p>
                    </div>
                    <span className="text-xs font-bold bg-slate-950 px-2 py-0.5 rounded text-cyan-400 border border-slate-800 font-mono">
                      {colBeats.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-grow">
                    {colBeats.map((beat) => (
                      <BeatCard
                        key={beat.id}
                        beat={beat}
                        subplots={subplots}
                        chapters={chapters}
                        onUpdate={(fields) => handleUpdateBeat(beat.id, fields)}
                        onDelete={() => handleDeleteBeat(beat.id)}
                        onMoveAct={(dir) => handleMoveBeatAct(beat, dir)}
                        onMoveStatus={(dir) => handleMoveBeatStatus(beat, dir)}
                        onMoveChapter={(dir) => handleMoveBeatChapter(beat, dir)}
                        beatTypeOptions={beatTypeOptions}
                        isEditing={editingBeatId === beat.id}
                        onToggleEdit={() => setEditingBeatId(editingBeatId === beat.id ? null : beat.id)}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddBeat(ch.id)}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Add Beat to Ch. {ch.number}</span>
                  </button>
                </div>
              );
            })}

          {/* Columns by STATUS */}
          {kanbanGroupBy === 'status' &&
            statusColumns.map((col) => {
              const colBeats = filteredBeats.filter((b) => b.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3 flex flex-col min-h-[500px]"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</h3>
                    <span className="text-xs font-bold bg-slate-950 px-2 py-0.5 rounded text-cyan-400 border border-slate-800 font-mono">
                      {colBeats.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-grow">
                    {colBeats.map((beat) => (
                      <BeatCard
                        key={beat.id}
                        beat={beat}
                        subplots={subplots}
                        chapters={chapters}
                        onUpdate={(fields) => handleUpdateBeat(beat.id, fields)}
                        onDelete={() => handleDeleteBeat(beat.id)}
                        onMoveAct={(dir) => handleMoveBeatAct(beat, dir)}
                        onMoveStatus={(dir) => handleMoveBeatStatus(beat, dir)}
                        onMoveChapter={(dir) => handleMoveBeatChapter(beat, dir)}
                        beatTypeOptions={beatTypeOptions}
                        isEditing={editingBeatId === beat.id}
                        onToggleEdit={() => setEditingBeatId(editingBeatId === beat.id ? null : beat.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* VIEW MODE 2: MULTI-CHAPTER TIMELINE MATRIX */}
      {viewMode === 'timeline' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Multi-Arc Subplot Matrix Across Chapters</h3>
              <p className="text-xs text-slate-400">
                Visualize how each subplot thread (A, B, C) progresses across each issue or episode.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[750px] space-y-4">
              {/* Header: Chapters */}
              <div className="grid grid-cols-3 gap-4 border-b border-slate-800 pb-2 text-xs font-bold text-slate-300">
                {chapters.map((ch) => (
                  <div key={ch.id} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span>Ch. {ch.number}: {ch.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{ch.targetPagesOrRuntime} pgs</span>
                  </div>
                ))}
              </div>

              {/* Subplot Rows */}
              {subplots.map((sub) => {
                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold" style={{ color: sub.color }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                      <span>{sub.name} ({sub.type})</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {chapters.map((ch) => {
                        const beatsInLane = filteredBeats.filter(
                          (b) => b.chapterId === ch.id && b.subplotId === sub.id
                        );

                        return (
                          <div
                            key={ch.id}
                            className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 min-h-[120px] space-y-2"
                          >
                            {beatsInLane.map((b) => (
                              <div
                                key={b.id}
                                onClick={() => setEditingBeatId(b.id)}
                                className="bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded p-2 text-xs cursor-pointer transition shadow"
                              >
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                                  <span className="font-semibold text-white">{b.beatType}</span>
                                  <span className="font-mono text-cyan-400">⚡{b.tensionRating}</span>
                                </div>
                                <div className="font-bold text-slate-200">{b.title}</div>
                                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{b.summary}</p>
                              </div>
                            ))}

                            {beatsInLane.length === 0 && (
                              <div className="h-full flex items-center justify-center text-[10px] text-slate-600 italic">
                                Subplot rests in this chapter
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Advance to Script */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-800">
        <span className="text-xs text-slate-400">
          Once beats and subplots are structured, move into the Comic Script Editor to format pages, panels, and speech balloon pacing.
        </span>
        <button
          onClick={onProceedToScript}
          className="py-2.5 px-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <span>Open Comic Script Editor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Sub-component: Interactive Beat Card with AI Assist
interface BeatCardProps {
  beat: Beat;
  subplots: SubplotDef[];
  chapters: Chapter[];
  onUpdate: (fields: Partial<Beat>) => void;
  onDelete: () => void;
  onMoveAct: (dir: 'prev' | 'next') => void;
  onMoveStatus: (dir: 'prev' | 'next') => void;
  onMoveChapter: (dir: 'prev' | 'next') => void;
  beatTypeOptions: BeatType[];
  isEditing: boolean;
  onToggleEdit: () => void;
}

const BeatCard: React.FC<BeatCardProps> = ({
  beat,
  subplots,
  chapters,
  onUpdate,
  onDelete,
  onMoveAct,
  onMoveStatus,
  onMoveChapter,
  beatTypeOptions,
  isEditing,
  onToggleEdit,
}) => {
  const currentSubplot = subplots.find((s) => s.id === beat.subplotId) || subplots[0];
  const chapter = chapters.find((c) => c.id === beat.chapterId);

  return (
    <div
      className={`bg-slate-950 border rounded-xl p-3 space-y-2.5 transition shadow-sm ${
        isEditing ? 'border-cyan-500 ring-1 ring-cyan-500/30' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Card Bar */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white flex items-center gap-1"
          style={{ backgroundColor: currentSubplot?.color || '#3b82f6' }}
        >
          <Link2 className="w-2.5 h-2.5" />
          {currentSubplot?.name.split(' ')[0]}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            ⚡ {beat.tensionRating}/10
          </span>
          <button
            onClick={onToggleEdit}
            className="p-1 text-slate-400 hover:text-white transition"
            title="Edit Beat"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-500 hover:text-rose-400 transition"
            title="Delete Beat"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Beat Classification & Title */}
      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 block">
          {beat.beatType}
        </span>
        {isEditing ? (
          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="text"
              value={beat.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-white focus:border-cyan-500 outline-none"
            />
            <AiFieldAssistant
              fieldType="Beat Title"
              currentValue={beat.title}
              onApply={(val) => onUpdate({ title: val })}
              placeholderKeywords="ambush, reveal, escape..."
              context={{ beatType: beat.beatType, subplot: currentSubplot?.name }}
            />
          </div>
        ) : (
          <div className="text-xs font-bold text-white mt-0.5">{beat.title}</div>
        )}
      </div>

      {/* Summary with AI assist */}
      {isEditing ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Beat Action & Stakes</span>
            <AiFieldAssistant
              fieldType="Story Beat Summary"
              currentValue={beat.summary}
              onApply={(val) => onUpdate({ summary: val })}
              placeholderKeywords="cliffhanger, betrayal, chase..."
              context={{ title: beat.title, beatType: beat.beatType }}
            />
          </div>
          <textarea
            value={beat.summary}
            onChange={(e) => onUpdate({ summary: e.target.value })}
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none leading-relaxed"
          />
        </div>
      ) : (
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{beat.summary}</p>
      )}

      {/* Expanded Controls when in editing mode */}
      {isEditing && (
        <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Beat Type</label>
              <select
                value={beat.beatType}
                onChange={(e) => onUpdate({ beatType: e.target.value as BeatType })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[11px] text-slate-300 outline-none"
              >
                {beatTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Link Subplot</label>
              <select
                value={beat.subplotId}
                onChange={(e) => onUpdate({ subplotId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[11px] text-slate-300 outline-none"
              >
                {subplots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Chapter</label>
              <select
                value={beat.chapterId}
                onChange={(e) => onUpdate({ chapterId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[11px] text-slate-300 outline-none"
              >
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Ch. {ch.number}: {ch.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Target Page Count</label>
              <input
                type="number"
                min="1"
                max="50"
                value={beat.pageTarget || 4}
                onChange={(e) => onUpdate({ pageTarget: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[11px] text-slate-300 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Tension Intensity:</span>
              <span className="font-bold text-cyan-400">{beat.tensionRating}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={beat.tensionRating}
              onChange={(e) => onUpdate({ tensionRating: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Card Footer: Metadata badges & Move arrows */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
            Ch. {chapter?.number || 1}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono">
            ~{beat.pageTarget || 4}p
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onMoveAct('prev')}
            className="p-1 hover:text-white hover:bg-slate-900 rounded"
            title="Move to Previous Act"
          >
            <MoveLeft className="w-3 h-3" />
          </button>
          <span className="text-[9px] font-bold text-slate-500 uppercase">{beat.act}</span>
          <button
            onClick={() => onMoveAct('next')}
            className="p-1 hover:text-white hover:bg-slate-900 rounded"
            title="Move to Next Act"
          >
            <MoveRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { LoglineData } from '../../types/project';
import { validateLoglineClarity } from '../../utils/pacingCalculations';
import { AiFieldAssistant } from '../ai/AiFieldAssistant';
import { Sparkles, AlertCircle, Copy, RefreshCw, Compass, ArrowRight, Wand2 } from 'lucide-react';

interface LoglineStageProps {
  data: LoglineData;
  onUpdate: (updated: LoglineData) => void;
  onProceedToBeats: () => void;
}

export const LoglineStage: React.FC<LoglineStageProps> = ({ data, onUpdate, onProceedToBeats }) => {
  const [copied, setCopied] = useState(false);
  const analysis = validateLoglineClarity(data.fullLogline);

  const handleFieldChange = (field: keyof LoglineData, value: string | string[]) => {
    onUpdate({
      ...data,
      [field]: value,
    });
  };

  const generateFormulaPitch = () => {
    const proto = data.protagonist || 'a determined lead';
    const goal = data.primaryGoal || 'accomplish an impossible objective';
    const conflict = data.centralConflict || 'deadly adversaries';
    const stakes = data.stakes || 'everything is lost';
    const formula = `When ${proto} discovers a truth that shatters their world, they must ${goal} against ${conflict} before ${stakes}.`;
    handleFieldChange('fullLogline', formula);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.fullLogline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-800/40 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Pipeline Stage 1 &bull; Macro Funnel</span>
            <h1 className="text-xl font-bold text-white mt-0.5">The Logline & Core Concept</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Every sequential art project starts with a single, compelling sentence. Use the AI assistants on each pillar to generate, polish, and tighten your premise.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 1-Sentence Pitch Tester & Clarity Gauge */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                The One-Sentence Premise Pitch
              </label>
              <div className="flex items-center gap-2">
                <AiFieldAssistant
                  fieldType="One-Sentence Logline"
                  currentValue={data.fullLogline}
                  onApply={(val) => handleFieldChange('fullLogline', val)}
                  placeholderKeywords="cyber-courier, bounty hunter, ticking clock..."
                  showShorten={true}
                  context={{
                    protagonist: data.protagonist,
                    goal: data.primaryGoal,
                    conflict: data.centralConflict,
                    stakes: data.stakes,
                  }}
                />
                <button
                  type="button"
                  onClick={generateFormulaPitch}
                  className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1 transition"
                  title="Synthesize formula from the 6 pillars below"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  Formula
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3 text-slate-400" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <textarea
              value={data.fullLogline}
              onChange={(e) => handleFieldChange('fullLogline', e.target.value)}
              rows={4}
              placeholder="e.g. When an ostracized cyber-courier discovers an android child carrying an encrypted memory drive, she must smuggle him past private security squads before the city-wide blackout locks down Sector 4 forever."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none leading-relaxed"
            />

            {/* Premise Clarity Analysis Meter */}
            <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Clarity & Tightness Score:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  analysis.clarityScore >= 80 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                }`}>
                  {analysis.clarityScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    analysis.clarityScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${analysis.clarityScore}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                <span>Words: <strong className="text-white">{analysis.wordCount}</strong> (Ideal: 25-45)</span>
                <span>Single Sentence: {analysis.isSingleSentence ? <strong className="text-emerald-400">Yes ✓</strong> : <strong className="text-rose-400">Split into multiple ⚠️</strong>}</span>
              </div>

              {analysis.suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {analysis.suggestions.map((sug, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-amber-300">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Six Story Pillars with AI on each space */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">The 6 Core Story Pillars</h2>
            
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-medium">1. Protagonist & Flaw</label>
                  <AiFieldAssistant
                    fieldType="Protagonist & Flaw"
                    currentValue={data.protagonist}
                    onApply={(val) => handleFieldChange('protagonist', val)}
                    placeholderKeywords="cynical detective, rogue pilot, cyborg..."
                  />
                </div>
                <input
                  type="text"
                  value={data.protagonist}
                  onChange={(e) => handleFieldChange('protagonist', e.target.value)}
                  placeholder="Who drives the story? What is their initial fatal flaw?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-medium">2. Primary Goal (External Want)</label>
                  <AiFieldAssistant
                    fieldType="Primary Goal"
                    currentValue={data.primaryGoal}
                    onApply={(val) => handleFieldChange('primaryGoal', val)}
                    placeholderKeywords="smuggle prototype, escape citadel, destroy weapon..."
                  />
                </div>
                <input
                  type="text"
                  value={data.primaryGoal}
                  onChange={(e) => handleFieldChange('primaryGoal', e.target.value)}
                  placeholder="What tangible goal must they achieve before the deadline?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-medium">3. Central Antagonist / Conflict</label>
                  <AiFieldAssistant
                    fieldType="Central Antagonist"
                    currentValue={data.centralConflict}
                    onApply={(val) => handleFieldChange('centralConflict', val)}
                    placeholderKeywords="ruthless marshal, rival guild, AI syndicate..."
                  />
                </div>
                <input
                  type="text"
                  value={data.centralConflict}
                  onChange={(e) => handleFieldChange('centralConflict', e.target.value)}
                  placeholder="Who or what actively pushes back against them?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-medium">4. Stakes & Ticking Clock</label>
                  <AiFieldAssistant
                    fieldType="Stakes & Ticking Clock"
                    currentValue={data.stakes}
                    onApply={(val) => handleFieldChange('stakes', val)}
                    placeholderKeywords="blackout at midnight, memory wipe, bio-toxin..."
                  />
                </div>
                <input
                  type="text"
                  value={data.stakes}
                  onChange={(e) => handleFieldChange('stakes', e.target.value)}
                  placeholder="What disaster occurs if the protagonist fails?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-medium">5. World Setting</label>
                    <AiFieldAssistant
                      fieldType="World Setting"
                      currentValue={data.setting}
                      onApply={(val) => handleFieldChange('setting', val)}
                      placeholderKeywords="flooded megacity, orbital depot, wasteland..."
                    />
                  </div>
                  <input
                    type="text"
                    value={data.setting}
                    onChange={(e) => handleFieldChange('setting', e.target.value)}
                    placeholder="Physical environment & arena"
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-medium">6. Underlying Theme</label>
                    <AiFieldAssistant
                      fieldType="Underlying Theme"
                      currentValue={data.theme}
                      onApply={(val) => handleFieldChange('theme', val)}
                      placeholderKeywords="found family, trust vs survival, corruption..."
                    />
                  </div>
                  <input
                    type="text"
                    value={data.theme}
                    onChange={(e) => handleFieldChange('theme', e.target.value)}
                    placeholder="What argument does the story make?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audience, Tone & Workflow Transition */}
        <div className="space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">Audience & Visual Tone</h2>
            
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-medium">Target Audience & Comps</label>
                  <AiFieldAssistant
                    fieldType="Target Audience & Comparative Titles"
                    currentValue={data.targetAudience}
                    onApply={(val) => handleFieldChange('targetAudience', val)}
                    placeholderKeywords="graphic novel comps, manga fans, dark sci-fi..."
                  />
                </div>
                <textarea
                  value={data.targetAudience}
                  onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
                  rows={2}
                  placeholder="e.g. Fans of Cyberpunk, Akira, Blade Runner 2049"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Tone & Aesthetic Keywords</label>
                <div className="flex flex-wrap gap-1.5">
                  {data.toneKeywords.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-[11px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sequential Funnel Rule</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Lock the core premise before moving to character profiles and beat sheets. Clear stakes here will directly guide your panel layouts and visual pacing.
            </p>
            <button
              onClick={onProceedToBeats}
              className="w-full mt-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <span>Lock Concept & Open Pitch Bible</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

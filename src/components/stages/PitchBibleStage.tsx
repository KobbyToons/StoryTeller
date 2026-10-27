import React, { useState } from 'react';
import { ProjectData, CharacterProfile, WorldRule, SubplotDef } from '../../types/project';
import { AiFieldAssistant } from '../ai/AiFieldAssistant';
import { requestAiCharacter } from '../../utils/aiClient';
import { 
  Users, 
  ShieldAlert, 
  Sparkles, 
  Palette, 
  Circle, 
  Triangle, 
  Square, 
  Plus, 
  Trash2, 
  ArrowRight,
  GitBranch,
  Eye,
  Loader2,
  Wand2
} from 'lucide-react';

interface PitchBibleStageProps {
  bible: ProjectData['pitchBible'];
  onUpdateBible: (updated: ProjectData['pitchBible']) => void;
  onProceedToBeats: () => void;
}

export const PitchBibleStage: React.FC<PitchBibleStageProps> = ({
  bible,
  onUpdateBible,
  onProceedToBeats,
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'world' | 'subplots' | 'visuals'>('characters');
  const [selectedCharId, setSelectedCharId] = useState<string>(bible.characters[0]?.id || '');
  const [aiCharPrompt, setAiCharPrompt] = useState<string>('');
  const [aiCharRole, setAiCharRole] = useState<CharacterProfile['role']>('Protagonist');
  const [isGeneratingChar, setIsGeneratingChar] = useState<boolean>(false);
  const [showAiCharModal, setShowAiCharModal] = useState<boolean>(false);

  const selectedChar = bible.characters.find((c) => c.id === selectedCharId) || bible.characters[0];

  const handleUpdateChar = (charId: string, fields: Partial<CharacterProfile>) => {
    const updatedChars = bible.characters.map((c) => (c.id === charId ? { ...c, ...fields } : c));
    onUpdateBible({
      ...bible,
      characters: updatedChars,
    });
  };

  const handleAddCharacter = () => {
    const newChar: CharacterProfile = {
      id: `char_${Date.now()}`,
      name: 'New Character',
      role: 'Key Ally',
      coreFlaw: 'Overconfident in hostile territory.',
      motivation: 'Protect their district from corporate takeover.',
      internalNeedVsExternalWant: 'Wants independence; needs to trust the team.',
      shapeLanguage: 'circle',
      visualSilhouette: 'Compact hood, utility vest with radio antennae.',
      dialogueVoice: 'Direct, informal, talks with hands.',
      paletteHex: '#38BDF8',
      relationships: [],
    };
    onUpdateBible({
      ...bible,
      characters: [...bible.characters, newChar],
    });
    setSelectedCharId(newChar.id);
  };

  const handleAiGenerateFullCharacter = async () => {
    setIsGeneratingChar(true);
    try {
      const generated = await requestAiCharacter({
        role: aiCharRole,
        concept: aiCharPrompt || 'distinctive sequential art character with high dramatic contrast',
        existingCharacters: bible.characters.map((c) => ({ name: c.name, role: c.role })),
        worldTone: bible.visualAesthetics.lightingTone,
      });

      if (generated) {
        const newChar: CharacterProfile = {
          id: `char_${Date.now()}`,
          name: generated.name || 'New Character',
          role: generated.role || aiCharRole,
          coreFlaw: generated.coreFlaw || 'Incapable of compromise.',
          motivation: generated.motivation || 'Achieve objective before deadline.',
          internalNeedVsExternalWant: generated.internalNeedVsExternalWant || 'Wants survival; Needs redemption.',
          shapeLanguage: (['circle', 'triangle', 'square'].includes(generated.shapeLanguage) ? generated.shapeLanguage : 'triangle') as any,
          visualSilhouette: generated.visualSilhouette || 'High collar duster with mechanical arm.',
          dialogueVoice: generated.dialogueVoice || 'Crisp, sarcastic, direct.',
          paletteHex: generated.paletteHex || '#06B6D4',
          relationships: [],
        };

        onUpdateBible({
          ...bible,
          characters: [...bible.characters, newChar],
        });
        setSelectedCharId(newChar.id);
        setShowAiCharModal(false);
        setAiCharPrompt('');
      }
    } finally {
      setIsGeneratingChar(false);
    }
  };

  const handleDeleteCharacter = (charId: string) => {
    if (bible.characters.length <= 1) return;
    const remaining = bible.characters.filter((c) => c.id !== charId);
    onUpdateBible({
      ...bible,
      characters: remaining,
    });
    setSelectedCharId(remaining[0]?.id || '');
  };

  const handleAddWorldRule = () => {
    const newRule: WorldRule = {
      id: `wr_${Date.now()}`,
      title: 'New Universe Rule',
      category: 'Physics & Tech',
      description: 'Detail how this fundamental mechanism operates.',
      boundaryRule: 'State explicitly what can NEVER happen under any circumstance.',
    };
    onUpdateBible({
      ...bible,
      worldRules: [...bible.worldRules, newRule],
    });
  };

  const handleUpdateRule = (ruleId: string, fields: Partial<WorldRule>) => {
    const updatedRules = bible.worldRules.map((r) => (r.id === ruleId ? { ...r, ...fields } : r));
    onUpdateBible({
      ...bible,
      worldRules: updatedRules,
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    onUpdateBible({
      ...bible,
      worldRules: bible.worldRules.filter((r) => r.id !== ruleId),
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-800/40 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Pipeline Stage 2 &bull; Universe & Cast</span>
              <h1 className="text-xl font-bold text-white mt-0.5">The Pitch Bible (World, Characters & Subplots)</h1>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Establish character flaws, motivations, visual silhouettes, and the rules of the universe. Use AI to generate, polish, and tighten any field instantly based on your keywords.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAiCharModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Wand2 className="w-4 h-4 text-slate-950" />
            <span>AI Full Character Generator</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('characters')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'characters'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Characters & Shape Language ({bible.characters.length})
        </button>
        <button
          onClick={() => setActiveTab('world')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'world'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          World Rules & Boundaries ({bible.worldRules.length})
        </button>
        <button
          onClick={() => setActiveTab('subplots')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'subplots'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          Multi-Arc Subplots ({bible.subplots.length})
        </button>
        <button
          onClick={() => setActiveTab('visuals')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'visuals'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Visual Aesthetics & Color Script
        </button>
      </div>

      {/* Tab 1: Characters (Cast Profiles with rich AI assist on every field) */}
      {activeTab === 'characters' && selectedChar && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Character List Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cast Profiles</span>
              <button
                onClick={handleAddCharacter}
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-slate-700 flex items-center gap-1 transition font-medium"
              >
                <Plus className="w-3 h-3" />
                Add Blank
              </button>
            </div>

            <div className="space-y-2">
              {bible.characters.map((char) => {
                const isSelected = char.id === selectedChar.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: char.paletteHex }}
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{char.name}</div>
                        <div className="text-[11px] text-slate-400">{char.role}</div>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      {char.shapeLanguage === 'triangle' && <Triangle className="w-3.5 h-3.5 text-amber-400" />}
                      {char.shapeLanguage === 'square' && <Square className="w-3.5 h-3.5 text-rose-400" />}
                      {char.shapeLanguage === 'circle' && <Circle className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Character Editor */}
          <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2 flex-grow">
                <input
                  type="text"
                  value={selectedChar.name}
                  onChange={(e) => handleUpdateChar(selectedChar.id, { name: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-base font-bold text-white focus:border-cyan-500 outline-none w-48"
                />
                <AiFieldAssistant
                  fieldType="Character Name"
                  currentValue={selectedChar.name}
                  onApply={(val) => handleUpdateChar(selectedChar.id, { name: val })}
                  placeholderKeywords="cyberpunk, mystical, noir..."
                  context={{ role: selectedChar.role }}
                />

                <select
                  value={selectedChar.role}
                  onChange={(e) => handleUpdateChar(selectedChar.id, { role: e.target.value as any })}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:border-cyan-500 outline-none"
                >
                  <option value="Protagonist">Protagonist</option>
                  <option value="Antagonist">Antagonist</option>
                  <option value="Deuteragonist">Deuteragonist</option>
                  <option value="Foil">Foil</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Comic Relief">Comic Relief</option>
                  <option value="Key Ally">Key Ally</option>
                </select>
              </div>

              {bible.characters.length > 1 && (
                <button
                  onClick={() => handleDeleteCharacter(selectedChar.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                  title="Delete Character"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Shape Language & Visual Silhouette for Sequential Artists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sequential Shape Language
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Fundamental geometry guides the storyboard artist's silhouette readability.
                </p>
                <div className="flex items-center gap-2">
                  {(['circle', 'triangle', 'square'] as const).map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => handleUpdateChar(selectedChar.id, { shapeLanguage: shape })}
                      className={`px-3 py-1.5 rounded text-xs font-medium border flex items-center gap-1.5 capitalize transition ${
                        selectedChar.shapeLanguage === shape
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {shape === 'circle' && <Circle className="w-3.5 h-3.5 text-emerald-400" />}
                      {shape === 'triangle' && <Triangle className="w-3.5 h-3.5 text-amber-400" />}
                      {shape === 'square' && <Square className="w-3.5 h-3.5 text-rose-400" />}
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Visual Signature Palette
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="color"
                    value={selectedChar.paletteHex}
                    onChange={(e) => handleUpdateChar(selectedChar.id, { paletteHex: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedChar.paletteHex}
                    onChange={(e) => handleUpdateChar(selectedChar.id, { paletteHex: e.target.value })}
                    className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 font-mono"
                  />
                  <span className="text-[11px] text-slate-400">Spot color for letterer & colorist</span>
                </div>
              </div>
            </div>

            {/* Core Flaw & Motivation with AI Assits */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Core Flaw (Internal Obstacle)</label>
                  <AiFieldAssistant
                    fieldType="Character Core Flaw"
                    currentValue={selectedChar.coreFlaw}
                    onApply={(val) => handleUpdateChar(selectedChar.id, { coreFlaw: val })}
                    placeholderKeywords="arrogant, survivor guilt, paranoid..."
                    context={{ name: selectedChar.name, role: selectedChar.role }}
                  />
                </div>
                <input
                  type="text"
                  value={selectedChar.coreFlaw}
                  onChange={(e) => handleUpdateChar(selectedChar.id, { coreFlaw: e.target.value })}
                  placeholder="e.g. Incapable of trusting partners due to past betrayal."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Motivation (External Drive)</label>
                  <AiFieldAssistant
                    fieldType="Character Motivation"
                    currentValue={selectedChar.motivation}
                    onApply={(val) => handleUpdateChar(selectedChar.id, { motivation: val })}
                    placeholderKeywords="escape, vengeance, protect family..."
                    context={{ name: selectedChar.name, role: selectedChar.role }}
                  />
                </div>
                <input
                  type="text"
                  value={selectedChar.motivation}
                  onChange={(e) => handleUpdateChar(selectedChar.id, { motivation: e.target.value })}
                  placeholder="e.g. Secure medical passage off-world before terminal limb failure."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Internal Need vs. External Want</label>
                  <AiFieldAssistant
                    fieldType="Internal Need vs External Want"
                    currentValue={selectedChar.internalNeedVsExternalWant}
                    onApply={(val) => handleUpdateChar(selectedChar.id, { internalNeedVsExternalWant: val })}
                    placeholderKeywords="wants survival, needs redemption..."
                    context={{ name: selectedChar.name, motivation: selectedChar.motivation }}
                  />
                </div>
                <input
                  type="text"
                  value={selectedChar.internalNeedVsExternalWant}
                  onChange={(e) => handleUpdateChar(selectedChar.id, { internalNeedVsExternalWant: e.target.value })}
                  placeholder="Wants solitary survival; Needs to sacrifice for family."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Visual Silhouette & Key Props</label>
                  <AiFieldAssistant
                    fieldType="Visual Silhouette & Props"
                    currentValue={selectedChar.visualSilhouette}
                    onApply={(val) => handleUpdateChar(selectedChar.id, { visualSilhouette: val })}
                    placeholderKeywords="cybernetic limbs, heavy coats, goggles..."
                    showExpandVisuals={true}
                    context={{ name: selectedChar.name, shape: selectedChar.shapeLanguage }}
                  />
                </div>
                <textarea
                  value={selectedChar.visualSilhouette}
                  onChange={(e) => handleUpdateChar(selectedChar.id, { visualSilhouette: e.target.value })}
                  rows={2}
                  placeholder="e.g. Asymmetric high-collar jacket, cybernetic left leg, jagged low ponytail."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Dialogue Voice & Speech Cadence</label>
                  <AiFieldAssistant
                    fieldType="Dialogue Voice & Speech Cadence"
                    currentValue={selectedChar.dialogueVoice}
                    onApply={(val) => handleUpdateChar(selectedChar.id, { dialogueVoice: val })}
                    placeholderKeywords="sarcastic, clinical, poetic, gravelly..."
                    showShorten={true}
                    context={{ name: selectedChar.name, role: selectedChar.role }}
                  />
                </div>
                <textarea
                  value={selectedChar.dialogueVoice}
                  onChange={(e) => handleUpdateChar(selectedChar.id, { dialogueVoice: e.target.value })}
                  rows={2}
                  placeholder="e.g. Cynical, clipped sentences, caustic dry humor, avoids sentimental vocabulary."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: World Rules & Boundaries with AI Assist */}
      {activeTab === 'world' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Immutable World Rules & Stakes Boundaries</h2>
              <p className="text-xs text-slate-400">
                Outlining the boundaries prevents convenient plot contrivances and preserves narrative tension.
              </p>
            </div>
            <button
              onClick={handleAddWorldRule}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 flex items-center gap-1.5 transition font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Universe Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bible.worldRules.map((rule) => (
              <div key={rule.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      {rule.category}
                    </span>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      value={rule.title}
                      onChange={(e) => handleUpdateRule(rule.id, { title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                    />
                    <AiFieldAssistant
                      fieldType="World Rule Title"
                      currentValue={rule.title}
                      onApply={(val) => handleUpdateRule(rule.id, { title: val })}
                      placeholderKeywords="energy, security, psychic..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-slate-400">Mechanism</span>
                      <AiFieldAssistant
                        fieldType="World Rule Description"
                        currentValue={rule.description}
                        onApply={(val) => handleUpdateRule(rule.id, { description: val })}
                        placeholderKeywords="overheat, failure, limitation..."
                      />
                    </div>
                    <textarea
                      value={rule.description}
                      onChange={(e) => handleUpdateRule(rule.id, { description: e.target.value })}
                      rows={3}
                      placeholder="Describe how the rule works..."
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-rose-950/30 border border-rose-900/50 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      <ShieldAlert className="w-3 h-3" />
                      What CANNOT Happen
                    </div>
                    <AiFieldAssistant
                      fieldType="Boundary Rule (What cannot happen)"
                      currentValue={rule.boundaryRule}
                      onApply={(val) => handleUpdateRule(rule.id, { boundaryRule: val })}
                      placeholderKeywords="no wireless recharge, no cures..."
                    />
                  </div>
                  <textarea
                    value={rule.boundaryRule}
                    onChange={(e) => handleUpdateRule(rule.id, { boundaryRule: e.target.value })}
                    rows={2}
                    placeholder="e.g. Wireless cyber-limb recharges do not exist."
                    className="w-full bg-slate-950/80 border border-rose-900/40 rounded p-1.5 text-xs text-rose-200 focus:border-rose-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Multi-Arc Subplots */}
      {activeTab === 'subplots' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">Multi-Arc Subplot Registry</h2>
            <p className="text-xs text-slate-400">
              Long-term sequential narratives interweave primary conflict (A-Plot) with character arcs (B-Plot) and world revelations (C-Plot).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bible.subplots.map((sub) => (
              <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: sub.color }}
                  >
                    {sub.type}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white">{sub.name}</div>
                  <AiFieldAssistant
                    fieldType="Subplot Description"
                    currentValue={sub.description}
                    onApply={(val) => {
                      const updated = bible.subplots.map((s) => (s.id === sub.id ? { ...s, description: val } : s));
                      onUpdateBible({ ...bible, subplots: updated });
                    }}
                    placeholderKeywords="rivalry, romance, conspiracy..."
                  />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{sub.description}</p>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">Involved Characters:</span>
                  <div className="flex flex-wrap gap-1">
                    {sub.leadCharacterIds.map((charId) => {
                      const c = bible.characters.find((x) => x.id === charId);
                      return (
                        <span
                          key={charId}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {c?.name || charId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Visual Aesthetics */}
      {activeTab === 'visuals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">Visual Aesthetic & Cinematography Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Sequential Art Style & Linework</label>
                <AiFieldAssistant
                  fieldType="Art Style & Linework"
                  currentValue={bible.visualAesthetics.artStyle}
                  onApply={(val) =>
                    onUpdateBible({
                      ...bible,
                      visualAesthetics: { ...bible.visualAesthetics, artStyle: val },
                    })
                  }
                  placeholderKeywords="heavy ink, textured screentones, watercolor..."
                />
              </div>
              <textarea
                value={bible.visualAesthetics.artStyle}
                onChange={(e) =>
                  onUpdateBible({
                    ...bible,
                    visualAesthetics: { ...bible.visualAesthetics, artStyle: e.target.value },
                  })
                }
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Lighting Tone & Mood</label>
                <AiFieldAssistant
                  fieldType="Lighting Tone & Mood"
                  currentValue={bible.visualAesthetics.lightingTone}
                  onApply={(val) =>
                    onUpdateBible({
                      ...bible,
                      visualAesthetics: { ...bible.visualAesthetics, lightingTone: val },
                    })
                  }
                  placeholderKeywords="chiaroscuro, neon vermillion, foggy..."
                />
              </div>
              <textarea
                value={bible.visualAesthetics.lightingTone}
                onChange={(e) =>
                  onUpdateBible({
                    ...bible,
                    visualAesthetics: { ...bible.visualAesthetics, lightingTone: e.target.value },
                  })
                }
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1 text-xs">Color Script Highlights</label>
            <div className="flex items-center gap-3">
              {bible.visualAesthetics.colorScript.map((color, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded border border-slate-700 shadow" style={{ backgroundColor: color }} />
                  <span className="text-[11px] font-mono text-slate-400">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Full Character Generation Modal */}
      {showAiCharModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">AI Full Character Generator</h3>
              </div>
              <button onClick={() => setShowAiCharModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Generate a complete sequential character profile (Name, Core Flaw, Motivation, Shape Language, Silhouette, Dialogue Voice, and Color Palette) from your prompt.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Character Role</label>
                <select
                  value={aiCharRole}
                  onChange={(e) => setAiCharRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none"
                >
                  <option value="Protagonist">Protagonist</option>
                  <option value="Antagonist">Antagonist</option>
                  <option value="Deuteragonist">Deuteragonist</option>
                  <option value="Foil">Foil</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Comic Relief">Comic Relief</option>
                  <option value="Key Ally">Key Ally</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Concept, Archetype or Keywords</label>
                <textarea
                  value={aiCharPrompt}
                  onChange={(e) => setAiCharPrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. Rogue cyber-surgeon with tremor hands and underground clinic debts, sharp sarcastic wit, triangle shape."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAiCharModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGeneratingChar}
                onClick={handleAiGenerateFullCharacter}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 shadow"
              >
                {isGeneratingChar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generate Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advance to Beat Sheet */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onProceedToBeats}
          className="py-2.5 px-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <span>Confirm Bible & Plot Beat Sheet</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

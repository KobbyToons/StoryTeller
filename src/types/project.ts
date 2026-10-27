export type PipelineStage = 'logline' | 'bible' | 'beats' | 'script' | 'storyboard' | 'animatic';

export type ProductionMedium = 'comic' | 'animation';

export interface LoglineData {
  protagonist: string;
  primaryGoal: string;
  centralConflict: string;
  stakes: string;
  setting: string;
  theme: string;
  fullLogline: string;
  targetAudience: string;
  toneKeywords: string[];
}

export interface CharacterRelationship {
  targetCharId: string;
  dynamic: string;
  tensionLevel: number; // 1-5
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: 'Protagonist' | 'Antagonist' | 'Foil' | 'Deuteragonist' | 'Mentor' | 'Comic Relief' | 'Key Ally';
  coreFlaw: string;
  motivation: string;
  internalNeedVsExternalWant: string;
  shapeLanguage: 'circle' | 'triangle' | 'square';
  visualSilhouette: string;
  dialogueVoice: string;
  paletteHex: string;
  avatarSeed?: string;
  relationships: CharacterRelationship[];
}

export interface WorldRule {
  id: string;
  title: string;
  category: 'Physics & Tech' | 'Societal Boundary' | 'Magic/System' | 'Visual Environment';
  description: string;
  boundaryRule: string; // What CANNOT happen (vital for maintaining stakes)
}

export interface SubplotDef {
  id: string;
  name: string;
  type: 'A-Plot (Main Conflict)' | 'B-Plot (Character Arc)' | 'C-Plot (World/Mystery)' | 'Romantic Arc' | 'Rivalry / Foil';
  leadCharacterIds: string[];
  description: string;
  color: string;
}

export type ActTag = 'Prologue' | 'Act 1' | 'Act 2A' | 'Act 2B' | 'Act 3' | 'Epilogue';

export type BeatType = 
  | 'Inciting Incident' 
  | 'Call to Action' 
  | 'First Plot Point' 
  | 'Pinch Point 1' 
  | 'Midpoint Shift' 
  | 'Pinch Point 2' 
  | 'All Hope Lost / Crisis' 
  | 'Dark Night of the Soul' 
  | 'Climax / Confrontation' 
  | 'Resolution / Aftermath'
  | 'Subplot Escalation';

export interface Beat {
  id: string;
  chapterId: string;
  act: ActTag;
  beatType: BeatType;
  title: string;
  summary: string;
  tensionRating: number; // 1 to 10
  subplotId: string; // ID of subplot
  status: 'planned' | 'drafted' | 'approved';
  pageTarget?: number;
}

export type ShotSize = 
  | 'Extreme Wide' 
  | 'Wide Establishing' 
  | 'Medium Long' 
  | 'Medium' 
  | 'Over-the-Shoulder' 
  | 'Close-Up' 
  | 'Extreme Close-Up' 
  | 'Dutch Angle / Tilt' 
  | 'Bird\'s Eye' 
  | 'Worm\'s Eye';

export interface DialogueEntry {
  id: string;
  character: string;
  type: 'dialogue' | 'caption' | 'whisper' | 'shout' | 'sfx';
  text: string;
  balloonPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export interface ScriptPanel {
  id: string;
  panelNumber: number;
  shotSize: ShotSize;
  cameraAngle: string;
  description: string;
  dialogues: DialogueEntry[];
  panelSizeWeight: number; // 1 (tiny), 2 (standard), 3 (wide/tall), 4 (half page), 6 (splash page)
  focalPoint: { x: number; y: number }; // 0-100% relative coordinates in panel
  notesForArtist?: string;
}

export interface ScriptPage {
  id: string;
  pageNumber: number;
  isDoublePageSpread: boolean;
  panels: ScriptPanel[];
  pageGoalNotes?: string;
  readingFlowDirection: 'western-z' | 'manga-rtl';
}

export interface AnimationShot {
  id: string;
  shotNumber: number;
  framing: ShotSize;
  action: string;
  characterSpeaker?: string;
  dialogue?: string;
  durationSeconds: number;
  scratchAudioCue?: string;
  transition: 'Cut' | 'Dissolve' | 'Wipe' | 'Whip Pan' | 'Fade to Black';
}

export interface ScreenplayScene {
  id: string;
  sceneNumber: number;
  slugline: string;
  setting: 'INT.' | 'EXT.' | 'INT./EXT.';
  timeOfDay: 'DAY' | 'NIGHT' | 'DUSK' | 'DAWN' | 'CONTINUOUS';
  shots: AnimationShot[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  synopsis: string;
  targetPagesOrRuntime: number; // pages for comic, minutes for animation
  isLocked: boolean;
  lockedAt?: string;
  pages: ScriptPage[];
  scenes: ScreenplayScene[];
}

export interface CascadeChangeLog {
  id: string;
  timestamp: string;
  chapterTitle: string;
  changeSummary: string;
  impactLevel: 'low' | 'moderate' | 'severe' | 'critical';
  impactedDepartments: string[]; // e.g. ["Storyboards", "Rough Pencils", "Lettering Real Estate", "Keyframe Animation"]
  estimatedDelayDays: number;
}

export interface ProjectData {
  id: string;
  title: string;
  medium: ProductionMedium;
  activeChapterId: string;
  logline: LoglineData;
  pitchBible: {
    visualAesthetics: {
      artStyle: string;
      lightingTone: string;
      colorScript: string[];
      cinematicRules: string;
    };
    worldRules: WorldRule[];
    characters: CharacterProfile[];
    subplots: SubplotDef[];
  };
  chapters: Chapter[];
  beats: Beat[];
  cascadeLog: CascadeChangeLog[];
  updatedAt: string;
}

import { ScriptPanel, ScriptPage, Beat, ShotSize } from '../types/project';

export interface LetteringAnalysis {
  wordCount: number;
  estimatedBalloonAreaPercent: number; // e.g. 18%
  status: 'optimal' | 'dense' | 'critical';
  recommendation: string;
}

export interface EyeFlowPoint {
  panelNumber: number;
  x: number; // 0-100%
  y: number; // 0-100%
  label: string;
  type: 'focal' | 'dialogue';
}

export interface EyeFlowAnalysis {
  flowPoints: EyeFlowPoint[];
  hasReverseFlowRisk: boolean;
  gutterJumpTension: 'smooth' | 'dynamic' | 'chaotic';
  pageTurnCliffhangerRating: number; // 1-10
  summary: string;
}

export interface PaceDistribution {
  fastActionPanels: number;
  dialogueHeavyPanels: number;
  scenicBreathingPanels: number;
  averagePanelsPerPage: number;
  totalPanels: number;
  totalDialogueWords: number;
  estimatedReadTimeSeconds: number;
  pacingRhythmRating: 'Well-Paced' | 'Front-Heavy' | 'Rushed' | 'Text-Overloaded';
}

export interface CascadeDelayAssessment {
  impactLevel: 'low' | 'moderate' | 'severe' | 'critical';
  estimatedDelayDays: number;
  affectedDepartments: string[];
  warningMessage: string;
}

/**
 * Calculates lettering visual real-estate usage in a comic panel.
 * Sequential art best practice: Speech balloons should occupy < 25% of panel area.
 * Above 35% begins suffocating the pencils/inks; above 45% creates letterer room crisis.
 */
export function calculateLetteringAreaCoverage(
  panel: ScriptPanel
): LetteringAnalysis {
  const totalWords = panel.dialogues.reduce((sum, d) => {
    const words = d.text.trim() ? d.text.trim().split(/\s+/).length : 0;
    return sum + words;
  }, 0);

  // Panel size weight: 1 (tiny) to 6 (full splash)
  // Base capacity: standard panel (weight 2) has roughly 100% base art area
  const weight = Math.max(1, panel.panelSizeWeight || 2);
  const relativeArea = (weight / 2) * 100;

  // Approximate balloon area: Each word in a comic speech bubble with leading, margins & tail
  // occupies roughly 0.65 area units. A 30-word block + tail + margins takes ~20 area units.
  const estimatedBalloonUnits = totalWords * 0.7 + (panel.dialogues.length * 3);
  const rawPercentage = Math.round((estimatedBalloonUnits / relativeArea) * 100);
  const estimatedBalloonAreaPercent = Math.min(95, Math.max(0, rawPercentage));

  let status: 'optimal' | 'dense' | 'critical' = 'optimal';
  let recommendation = 'Balloon real estate is balanced. Artwork has ample breathing room.';

  if (estimatedBalloonAreaPercent >= 40) {
    status = 'critical';
    recommendation = `CRITICAL: Text consumes ~${estimatedBalloonAreaPercent}% of panel area! Balloon cluster will obscure crucial character acting and background art. Split into 2 panels or trim ${Math.ceil(totalWords * 0.35)} words.`;
  } else if (estimatedBalloonAreaPercent >= 26) {
    status = 'dense';
    recommendation = `DENSE: Text occupies ~${estimatedBalloonAreaPercent}% of panel area. Letterer will need tight margins. Consider moving exposition to a caption or pacing across adjacent panels.`;
  }

  return {
    wordCount: totalWords,
    estimatedBalloonAreaPercent,
    status,
    recommendation,
  };
}

/**
 * Evaluates visual eye flow across panels on a comic page (Z-pattern / manga flow).
 */
export function analyzePageEyeFlow(page: ScriptPage): EyeFlowAnalysis {
  const points: EyeFlowPoint[] = [];
  const panels = page.panels || [];

  if (panels.length === 0) {
    return {
      flowPoints: [],
      hasReverseFlowRisk: false,
      gutterJumpTension: 'smooth',
      pageTurnCliffhangerRating: 5,
      summary: 'No panels on this page to analyze yet.',
    };
  }

  // Build sequential flow points per panel
  panels.forEach((p, idx) => {
    // Panel focal point
    points.push({
      panelNumber: p.panelNumber,
      x: p.focalPoint?.x ?? (idx % 2 === 0 ? 30 : 70),
      y: p.focalPoint?.y ?? 40,
      label: `P${p.panelNumber} Focal (${p.shotSize})`,
      type: 'focal',
    });

    // Dialogue anchors
    p.dialogues.forEach((d, dIdx) => {
      let dx = 50;
      let dy = 25;
      if (d.balloonPosition === 'top-left') { dx = 25; dy = 20; }
      else if (d.balloonPosition === 'top-right') { dx = 75; dy = 20; }
      else if (d.balloonPosition === 'bottom-left') { dx = 25; dy = 75; }
      else if (d.balloonPosition === 'bottom-right') { dx = 75; dy = 75; }

      points.push({
        panelNumber: p.panelNumber,
        x: dx,
        y: dy,
        label: `${d.character || 'Speaker'} (${d.type})`,
        type: 'dialogue',
      });
    });
  });

  // Check for reverse flow risk: reading flow backwards (e.g. dialogue on bottom-left placed before dialogue on top-right in Western Z)
  let reverseFlowDetected = false;
  panels.forEach((p) => {
    if (p.dialogues.length >= 2) {
      const first = p.dialogues[0].balloonPosition;
      const second = p.dialogues[1].balloonPosition;
      if (first === 'bottom-right' && second === 'top-left') {
        reverseFlowDetected = true;
      }
    }
  });

  // Gutter jump tension based on panel count & shot transitions
  let gutterJumpTension: 'smooth' | 'dynamic' | 'chaotic' = 'smooth';
  if (panels.length >= 7) {
    gutterJumpTension = 'chaotic';
  } else if (panels.length >= 4) {
    gutterJumpTension = 'dynamic';
  }

  // Cliffhanger rating: in printed sequential art, odd pages face right; turning the page is a physical reveal.
  const isOddPage = page.pageNumber % 2 !== 0;
  const lastPanel = panels[panels.length - 1];
  let pageTurnCliffhangerRating = 5;

  if (lastPanel) {
    const isDramaticShot = ['Close-Up', 'Extreme Close-Up', 'Dutch Angle / Tilt'].includes(lastPanel.shotSize);
    const hasDialogue = lastPanel.dialogues.length > 0;
    if (isOddPage) {
      // Prime spot for page-turn cliffhanger!
      pageTurnCliffhangerRating = isDramaticShot ? 9 : 7;
    } else {
      pageTurnCliffhangerRating = isDramaticShot ? 6 : 4;
    }
  }

  const summary = reverseFlowDetected
    ? 'Warning: Balloon placement causes reverse eye flow (reader must jump backwards against the Z-reading path).'
    : panels.length >= 6
    ? 'High panel density creates rapid visual cadence. Ensure clear gutters and focal contrast.'
    : 'Page eye-flow follows standard sequential rhythm with natural scan transitions.';

  return {
    flowPoints: points,
    hasReverseFlowRisk: reverseFlowDetected,
    gutterJumpTension,
    pageTurnCliffhangerRating,
    summary,
  };
}

/**
 * Calculates overall rhythm, read time, and pacing across pages.
 */
export function calculateReadingTimeAndRhythm(pages: ScriptPage[]): PaceDistribution {
  if (!pages || pages.length === 0) {
    return {
      fastActionPanels: 0,
      dialogueHeavyPanels: 0,
      scenicBreathingPanels: 0,
      averagePanelsPerPage: 0,
      totalPanels: 0,
      totalDialogueWords: 0,
      estimatedReadTimeSeconds: 0,
      pacingRhythmRating: 'Well-Paced',
    };
  }

  let totalPanels = 0;
  let totalWords = 0;
  let fastAction = 0;
  let dialogueHeavy = 0;
  let scenicBreathing = 0;

  pages.forEach((p) => {
    (p.panels || []).forEach((panel) => {
      totalPanels += 1;
      const analysis = calculateLetteringAreaCoverage(panel);
      totalWords += analysis.wordCount;

      if (['Extreme Wide', 'Wide Establishing'].includes(panel.shotSize) && analysis.wordCount <= 10) {
        scenicBreathing += 1;
      } else if (analysis.status === 'critical' || analysis.wordCount >= 35) {
        dialogueHeavy += 1;
      } else {
        fastAction += 1;
      }
    });
  });

  const avgPanelsPerPage = pages.length > 0 ? Number((totalPanels / pages.length).toFixed(1)) : 0;

  // Reading time formula:
  // Comics: ~180 words/minute for text + 2.5 seconds per panel for scanning visual composition
  // Seconds = (words / 180) * 60 + (panels * 2.5)
  const secondsFromWords = (totalWords / 180) * 60;
  const secondsFromPanels = totalPanels * 2.5;
  const estimatedReadTimeSeconds = Math.round(secondsFromWords + secondsFromPanels);

  let pacingRhythmRating: PaceDistribution['pacingRhythmRating'] = 'Well-Paced';
  if (totalPanels > 0 && dialogueHeavy / totalPanels > 0.5) {
    pacingRhythmRating = 'Text-Overloaded';
  } else if (avgPanelsPerPage > 7) {
    pacingRhythmRating = 'Rushed';
  }

  return {
    fastActionPanels: fastAction,
    dialogueHeavyPanels: dialogueHeavy,
    scenicBreathingPanels: scenicBreathing,
    averagePanelsPerPage: avgPanelsPerPage,
    totalPanels,
    totalDialogueWords: totalWords,
    estimatedReadTimeSeconds,
    pacingRhythmRating,
  };
}

/**
 * Assesses production cascading delay when changes are made after narrative lock.
 */
export function calculateCascadingImpact(
  isLocked: boolean,
  pagesChangedCount: number,
  changeNature: 'dialogue_trim' | 'panel_reorder' | 'scene_rewrite' | 'character_removal'
): CascadeDelayAssessment {
  if (!isLocked) {
    return {
      impactLevel: 'low',
      estimatedDelayDays: 0,
      affectedDepartments: ['Writing Draft'],
      warningMessage: 'Narrative is currently in open draft mode. Iteration is free with no downstream pipeline impact.',
    };
  }

  let delayPerUnit = 1;
  let impactLevel: CascadeDelayAssessment['impactLevel'] = 'moderate';
  const depts = ['Writing Revision', 'Thumbnail Storyboards'];

  if (changeNature === 'dialogue_trim') {
    delayPerUnit = 0.5;
    impactLevel = 'low';
    depts.push('Lettering Layout');
  } else if (changeNature === 'panel_reorder') {
    delayPerUnit = 1.5;
    impactLevel = 'moderate';
    depts.push('Pencil Lineart', 'Lettering Layout', 'Editor Review');
  } else if (changeNature === 'scene_rewrite') {
    delayPerUnit = 3.0;
    impactLevel = 'severe';
    depts.push('Thumbnail Storyboards', 'Rough Pencils', 'Clean Inks', 'Flat Colors', 'Lettering');
  } else if (changeNature === 'character_removal') {
    delayPerUnit = 5.0;
    impactLevel = 'critical';
    depts.push('Character Model Sheets', 'Storyboards', 'Pencils', 'Inks', 'Colors', 'Voice Scratch / Cast');
  }

  const estimatedDelayDays = Math.ceil(pagesChangedCount * delayPerUnit);

  return {
    impactLevel,
    estimatedDelayDays,
    affectedDepartments: depts,
    warningMessage: `⚠️ CASCADE WARNING: Narrative is LOCKED. Changing ${pagesChangedCount} page(s) (${changeNature.replace('_', ' ')}) causes an estimated ~${estimatedDelayDays} day delay across ${depts.length} downstream departments.`,
  };
}

/**
 * Generates industry-standard Dark Horse / Marvel / DC style comic script markdown.
 */
export function formatStandardComicScript(
  projectTitle: string,
  chapterTitle: string,
  pages: ScriptPage[]
): string {
  let output = `# ${projectTitle.toUpperCase()}\n`;
  output += `## CHAPTER: ${chapterTitle.toUpperCase()}\n`;
  output += `STANDARD SEQUENTIAL COMIC SCRIPT FORMAT\n`;
  output += `====================================================\n\n`;

  pages.forEach((page) => {
    output += `PAGE ${page.pageNumber}${page.isDoublePageSpread ? ' (DOUBLE PAGE SPREAD)' : ''}\n`;
    if (page.pageGoalNotes) {
      output += `[Page Note: ${page.pageGoalNotes}]\n`;
    }
    output += `----------------------------------------------------\n\n`;

    (page.panels || []).forEach((panel) => {
      output += `PANEL ${panel.panelNumber} (${panel.shotSize.toUpperCase()} - ${panel.cameraAngle.toUpperCase()})\n`;
      output += `${panel.description}\n\n`;

      (panel.dialogues || []).forEach((d) => {
        const typeHeader = d.type !== 'dialogue' ? ` (${d.type.toUpperCase()})` : '';
        output += `    ${d.character.toUpperCase()}${typeHeader}\n`;
        output += `    ${d.text}\n\n`;
      });

      if (panel.notesForArtist) {
        output += `    [ARTIST NOTE: ${panel.notesForArtist}]\n\n`;
      }
    });

    output += `\n`;
  });

  return output;
}

/**
 * Validates a 1-sentence logline and extracts key storytelling pillars.
 */
export function validateLoglineClarity(logline: string): {
  wordCount: number;
  clarityScore: number; // 0-100
  suggestions: string[];
  isSingleSentence: boolean;
} {
  const trimmed = logline.trim();
  if (!trimmed) {
    return {
      wordCount: 0,
      clarityScore: 0,
      suggestions: ['Enter your 1-sentence logline to begin testing premise clarity.'],
      isSingleSentence: false,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const sentenceCount = (trimmed.match(/[.!?]+(?=\s|$)/g) || []).length || 1;
  const isSingleSentence = sentenceCount === 1;

  let score = 70;
  const suggestions: string[] = [];

  // Optimal word count for a pitch logline is 25-45 words
  if (words.length < 15) {
    score -= 20;
    suggestions.push('Logline is too brief. Ensure protagonist flaw, primary goal, and stakes are explicit.');
  } else if (words.length > 55) {
    score -= 25;
    suggestions.push(`Logline is too long (${words.length} words). Tighten down to a single punchy sentence under 45 words.`);
  } else {
    score += 15;
  }

  if (!isSingleSentence) {
    score -= 15;
    suggestions.push('Keep the core concept strictly in ONE sentence to pass the sequential pitch funnel.');
  }

  // Key sequential art conflict words check
  const hasConflictIndicator = /\b(must|before|against|confront|prevent|stop|forced|battle|threatens|uncovers)\b/i.test(trimmed);
  if (!hasConflictIndicator) {
    score -= 10;
    suggestions.push('Strengthen the central conflict verb (e.g. "must prevent", "is forced to confront").');
  } else {
    score += 10;
  }

  return {
    wordCount: words.length,
    clarityScore: Math.min(100, Math.max(10, score)),
    suggestions,
    isSingleSentence,
  };
}

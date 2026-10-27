import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLetteringAreaCoverage,
  analyzePageEyeFlow,
  calculateReadingTimeAndRhythm,
  calculateCascadingImpact,
  validateLoglineClarity,
  formatStandardComicScript,
} from './pacingCalculations';
import { ScriptPanel, ScriptPage } from '../types/project';

test('calculateLetteringAreaCoverage identifies optimal vs critical lettering area', () => {
  const lightPanel: ScriptPanel = {
    id: 'p1',
    panelNumber: 1,
    shotSize: 'Wide Establishing',
    cameraAngle: 'Eye Level',
    description: 'Neon skyline drenched in rain.',
    dialogues: [
      { id: 'd1', character: 'JAX', type: 'dialogue', text: 'Sector 4 is burning.', balloonPosition: 'top-left' },
    ],
    panelSizeWeight: 2,
    focalPoint: { x: 50, y: 50 },
  };

  const lightResult = calculateLetteringAreaCoverage(lightPanel);
  assert.equal(lightResult.status, 'optimal');
  assert.equal(lightResult.wordCount, 4);
  assert.ok(lightResult.estimatedBalloonAreaPercent < 25);

  const overloadedPanel: ScriptPanel = {
    id: 'p2',
    panelNumber: 2,
    shotSize: 'Close-Up',
    cameraAngle: 'Low Angle',
    description: 'Villain monologuing.',
    dialogues: [
      {
        id: 'd2',
        character: 'MALIK',
        type: 'dialogue',
        text: 'You never understood the syndicate, Jax! The servers were corrupted thirty years before you ever set foot in the megacity citadel, and now every single mainframe belongs to us! There is no exit and no hope!',
        balloonPosition: 'top-left',
      },
      {
        id: 'd3',
        character: 'MALIK',
        type: 'dialogue',
        text: 'And what is more, your sister signed the authorization papers before she vanished into the wasteland fringe!',
        balloonPosition: 'top-right',
      },
    ],
    panelSizeWeight: 1, // tiny panel with huge monologue
    focalPoint: { x: 50, y: 50 },
  };

  const heavyResult = calculateLetteringAreaCoverage(overloadedPanel);
  assert.equal(heavyResult.status, 'critical');
  assert.ok(heavyResult.estimatedBalloonAreaPercent >= 40);
  assert.ok(heavyResult.recommendation.includes('CRITICAL'));
});

test('analyzePageEyeFlow detects points and evaluates page turn tension', () => {
  const page1: ScriptPage = {
    id: 'pg1',
    pageNumber: 1, // Odd page - physical page-turn reveal candidate
    isDoublePageSpread: false,
    readingFlowDirection: 'western-z',
    panels: [
      {
        id: 'p1',
        panelNumber: 1,
        shotSize: 'Wide Establishing',
        cameraAngle: 'Eye Level',
        description: 'Jax approaches alley.',
        dialogues: [],
        panelSizeWeight: 3,
        focalPoint: { x: 20, y: 30 },
      },
      {
        id: 'p2',
        panelNumber: 2,
        shotSize: 'Dutch Angle / Tilt',
        cameraAngle: 'Dutch',
        description: 'A cybernetic assassin drops from the ceiling with blades drawn!',
        dialogues: [
          { id: 'd1', character: 'JAX', type: 'shout', text: 'LOOK OUT!', balloonPosition: 'bottom-right' },
        ],
        panelSizeWeight: 3,
        focalPoint: { x: 80, y: 60 },
      },
    ],
  };

  const flow = analyzePageEyeFlow(page1);
  assert.equal(flow.flowPoints.length, 3); // 2 panel focals + 1 dialogue
  assert.equal(flow.hasReverseFlowRisk, false);
  // Odd page with dramatic ending panel has high cliffhanger rating
  assert.ok(flow.pageTurnCliffhangerRating >= 8);
});

test('calculateReadingTimeAndRhythm aggregates panel counts and pacing metrics', () => {
  const pages: ScriptPage[] = [
    {
      id: 'pg1',
      pageNumber: 1,
      isDoublePageSpread: false,
      readingFlowDirection: 'western-z',
      panels: [
        {
          id: 'p1',
          panelNumber: 1,
          shotSize: 'Wide Establishing',
          cameraAngle: 'High',
          description: 'Sprawling city.',
          dialogues: [{ id: 'd1', character: 'NARRATOR', type: 'caption', text: 'The city was silent.', balloonPosition: 'top-left' }],
          panelSizeWeight: 4,
          focalPoint: { x: 50, y: 50 },
        },
        {
          id: 'p2',
          panelNumber: 2,
          shotSize: 'Close-Up',
          cameraAngle: 'Level',
          description: 'Jax eyes.',
          dialogues: [],
          panelSizeWeight: 2,
          focalPoint: { x: 50, y: 50 },
        },
      ],
    },
  ];

  const rhythm = calculateReadingTimeAndRhythm(pages);
  assert.equal(rhythm.totalPanels, 2);
  assert.equal(rhythm.totalDialogueWords, 4);
  assert.ok(rhythm.estimatedReadTimeSeconds > 0);
  assert.equal(rhythm.pacingRhythmRating, 'Well-Paced');
});

test('calculateCascadingImpact alerts on locked narrative revisions', () => {
  const unlocked = calculateCascadingImpact(false, 3, 'scene_rewrite');
  assert.equal(unlocked.estimatedDelayDays, 0);

  const locked = calculateCascadingImpact(true, 4, 'scene_rewrite');
  assert.equal(locked.impactLevel, 'severe');
  assert.ok(locked.estimatedDelayDays >= 10);
  assert.ok(locked.affectedDepartments.includes('Clean Inks'));
});

test('validateLoglineClarity scores 1-sentence pitches correctly', () => {
  const goodLogline =
    'When a cynical cybernetic detective uncovers a corporation wiping memory implants, he must smuggle the whistleblower out of Sector 9 before his own cyberware expires.';
  const analysis = validateLoglineClarity(goodLogline);

  assert.equal(analysis.isSingleSentence, true);
  assert.ok(analysis.clarityScore >= 80);

  const twoSentences = 'Jax is a cyber detective. He fights corrupt machines every single day in the rain.';
  const badAnalysis = validateLoglineClarity(twoSentences);
  assert.equal(badAnalysis.isSingleSentence, false);
});

test('formatStandardComicScript outputs proper industry formatting', () => {
  const pages: ScriptPage[] = [
    {
      id: 'pg1',
      pageNumber: 1,
      isDoublePageSpread: false,
      readingFlowDirection: 'western-z',
      panels: [
        {
          id: 'p1',
          panelNumber: 1,
          shotSize: 'Wide Establishing',
          cameraAngle: 'High Angle',
          description: 'A neon-drenched rainy street.',
          dialogues: [
            { id: 'd1', character: 'JAX', type: 'caption', text: 'Rain never cleanses Sector 9.', balloonPosition: 'top-left' },
          ],
          panelSizeWeight: 2,
          focalPoint: { x: 50, y: 50 },
        },
      ],
    },
  ];

  const script = formatStandardComicScript('Neon Exodus', 'Issue #1', pages);
  assert.ok(script.includes('PAGE 1'));
  assert.ok(script.includes('PANEL 1 (WIDE ESTABLISHING - HIGH ANGLE)'));
  assert.ok(script.includes('JAX (CAPTION)'));
});

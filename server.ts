import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

async function callGeminiWithTimeout<T>(promise: Promise<T>, timeoutMs = 25000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI request timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// POST /api/ai/generate: Specialized endpoint for sequential storytelling text generation & rephrasing
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const { fieldType, action, currentValue, context, keywords } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: true,
        text: generateLocalFallback(fieldType, action, currentValue, keywords, context),
        isFallback: true,
      });
    }

    const systemInstruction = `You are a world-class comic book editor, showrunner, and sequential art storytelling director.
Your goal is to assist writers with punchy, high-impact, visual storytelling tailored for comics, graphic novels, manga, and animation pipelines.
Guidelines:
- Sequential art requires visual specificity, strong character silhouettes, sharp motivations, and tight dialogue.
- For dialogue: Write dialogue that sounds distinct and natural for character speech, avoiding exposition dumping.
- For panel descriptions: Focus strictly on what is visually depictable (staging, lighting, camera angle, character poses).
- For character flaws & wants: Provide psychological depth and dramatic friction.
- For loglines: Keep strictly to one punchy, irresistible sentence.
- Always return ONLY the generated text directly without conversational conversational prefixes, quotes, or markdown wrappers unless requested.`;

    let prompt = '';
    if (action === 'generate') {
      prompt = `Generate a creative, compelling ${fieldType} for a sequential art / comic project.
Context: ${JSON.stringify(context || {})}
Keywords or direction from writer: "${keywords || 'evocative, fresh, high-stakes'}"
Return only the final ${fieldType} text.`;
    } else if (action === 'rewrite' || action === 'rephrase') {
      prompt = `Rewrite and polish the following ${fieldType} to make it more evocative, distinct, and dramatic for sequential art:
Original text: "${currentValue}"
Context: ${JSON.stringify(context || {})}
Additional writer notes/keywords: "${keywords || ''}"
Make it punchy and remove fluff. Return only the revised text.`;
    } else if (action === 'shorten' || action === 'trim_dialogue') {
      prompt = `Sequential art panels have strict speech balloon real-estate limits (<25% of panel area).
Trim and tighten this text to be concise while preserving voice and dramatic subtext:
Original text: "${currentValue}"
Context: ${JSON.stringify(context || {})}
Target: Make it roughly 30-50% shorter, punchier, and impactful. Return only the shortened text.`;
    } else if (action === 'expand_visuals') {
      prompt = `Expand the following ${fieldType} with rich visual details, sensory staging, silhouette contrast, or cinematic lighting cues for the comic artist / animator:
Current text: "${currentValue}"
Context: ${JSON.stringify(context || {})}
Keywords: "${keywords || ''}"
Return only the expanded description.`;
    } else {
      prompt = `Assist with ${fieldType} in a sequential comic writing pipeline.
Action: ${action}
Current text: "${currentValue || ''}"
Keywords: "${keywords || ''}"
Context: ${JSON.stringify(context || {})}`;
    }

    const response = await callGeminiWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.8,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      }),
      25000
    );

    const generatedText = response.text ? response.text.trim() : '';

    return res.status(200).json({
      success: true,
      text: generatedText || currentValue,
    });
  } catch (error: any) {
    console.warn('Notice in /api/ai/generate, serving creative fallback:', error?.message || error);
    const fallbackText = generateLocalFallback(
      req.body.fieldType,
      req.body.action,
      req.body.currentValue,
      req.body.keywords,
      req.body.context
    );
    return res.status(200).json({
      success: true,
      text: fallbackText,
      isFallback: true,
      error: error?.message || 'Fallback generated',
    });
  }
});

// POST /api/ai/generate-character: Generate a complete rich cast profile from a single concept/keyword
app.post('/api/ai/generate-character', async (req: Request, res: Response) => {
  try {
    const { concept, role, existingCharacters, worldTone } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: true,
        character: generateLocalFallbackCharacter(role, concept),
        isFallback: true,
      });
    }

    const systemInstruction = `You are a character designer and story consultant for comic books and animation.
You will generate a fully realized character profile formatted as JSON.
The shape language must be one of: "circle", "triangle", or "square".
The paletteHex must be a hex color code (e.g. "#EF4444").
Return strictly valid JSON with no markdown formatting.`;

    const prompt = `Create a distinctive sequential art character profile for role: "${role || 'Protagonist'}".
Writer concept / keywords: "${concept || 'complex hero with dark past'}"
World tone: "${worldTone || 'Cyber-noir with chiaroscuro lighting'}"
Existing cast context: ${JSON.stringify(existingCharacters || [])}

Provide valid JSON matching this structure:
{
  "name": "Character Name",
  "role": "${role || 'Protagonist'}",
  "coreFlaw": "Internal fatal flaw that blinds them",
  "motivation": "External goal driving them forward",
  "internalNeedVsExternalWant": "Wants X (tangible goal); Needs Y (emotional/moral growth)",
  "shapeLanguage": "triangle" | "circle" | "square",
  "visualSilhouette": "Distinctive silhouette markings, costume shape, signature prop for artist",
  "dialogueVoice": "Speech rhythm, cadence, word choice quirks",
  "paletteHex": "#06B6D4"
}`;

    const response = await callGeminiWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.85,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      }),
      25000
    );

    let characterData;
    try {
      characterData = JSON.parse(response.text || '{}');
    } catch {
      characterData = generateLocalFallbackCharacter(role, concept);
    }

    return res.status(200).json({
      success: true,
      character: characterData,
    });
  } catch (error: any) {
    console.warn('Notice in /api/ai/generate-character, serving fallback:', error?.message || error);
    return res.status(200).json({
      success: true,
      character: generateLocalFallbackCharacter(req.body.role, req.body.concept),
      isFallback: true,
    });
  }
});

// Fallback generators for instant response and offline continuity
function generateLocalFallback(
  fieldType: string,
  action: string,
  currentValue?: string,
  keywords?: string,
  context?: any
): string {
  const ft = (fieldType || '').toLowerCase();
  const kw = keywords ? ` (${keywords})` : '';

  if (ft.includes('flaw')) {
    const flaws = [
      'Paranoid hyper-independence; refuses to ask for reinforcements even when surrounded.',
      'Obsessive perfectionism that freezes them in critical split-second tactical decisions.',
      'Incurable cynicism masking unresolved survivor guilt from an earlier catastrophic mission.',
      'Compulsive truth-teller who escalates diplomatic negotiations into armed standoffs.',
    ];
    return flaws[Math.floor(Math.random() * flaws.length)] + kw;
  }

  if (ft.includes('motivation')) {
    const motivations = [
      'Secure passage out of the quarantine sector before the blast doors seal at midnight.',
      'Uncover the encrypted memory drive that exonerates their framed faction.',
      'Dismantle the automated corporate surveillance grid from the inside out.',
      'Rescue their estranged younger sibling from the syndicate reconditioning labs.',
    ];
    return motivations[Math.floor(Math.random() * motivations.length)] + kw;
  }

  if (ft.includes('need') || ft.includes('want')) {
    return 'Wants solitary survival and rapid escape; Needs to accept emotional vulnerability and protect their surrogate crew.' + kw;
  }

  if (ft.includes('silhouette') || ft.includes('visual')) {
    return 'Asymmetric high-collar trench duster, heavy mechanical left prosthetic, jagged low ponytail, and glowing ocular telemetry lens.' + kw;
  }

  if (ft.includes('voice') || ft.includes('dialogue')) {
    if (action === 'shorten' && currentValue) {
      return currentValue.split('. ')[0] + '.';
    }
    return 'Clipped, pragmatic cadence; dry black humor, avoids unnecessary exposition, pauses before admitting vulnerability.' + kw;
  }

  if (ft.includes('logline')) {
    return `When an ostracized cyber-courier discovers an android child carrying an encrypted memory drive, she must smuggle him past private security squads before the city-wide blackout locks down the sector forever.${kw}`;
  }

  if (ft.includes('panel') || ft.includes('description') || ft.includes('staging')) {
    return `High-contrast composition. Neon halogen rim-light cuts through industrial steam as the character freezes mid-stride, hand hovering above their holster.${kw}`;
  }

  if (ft.includes('beat') || ft.includes('summary')) {
    return `A sudden perimeter breach forces an irreversible choice: abandon the prototype to escape, or trigger the secondary power surge and fight through the corridor.${kw}`;
  }

  if (ft.includes('name')) {
    const names = ['Kaelen Vance', 'Vesper Drake', 'Jax Thorne', 'Lyra Mercer', 'Dr. Silas Novak'];
    return names[Math.floor(Math.random() * names.length)] + (keywords ? ` - ${keywords}` : '');
  }

  return (currentValue ? `Refined: ${currentValue}` : `Generated ${fieldType} for story context`) + kw;
}

function generateLocalFallbackCharacter(role: string = 'Key Ally', concept?: string) {
  return {
    name: concept ? `${concept.split(' ')[0]} Cross` : 'Vesper Locke',
    role: role || 'Key Ally',
    coreFlaw: 'Over-relies on automated sensory data; blinds herself to organic human intuition.',
    motivation: 'Avenge her shattered squadron by exposing the syndicate backdoor codes.',
    internalNeedVsExternalWant: 'Wants cold retribution; Needs to rediscover genuine camaraderie.',
    shapeLanguage: 'triangle',
    visualSilhouette: 'Angular high-cut tactical vest, dual shock-batons holstered at lower back, sharp asymmetrical visor.',
    dialogueVoice: 'Direct, rapid-fire operational jargon, punctuated by sharp sardonic retorts.',
    paletteHex: '#06B6D4',
  };
}

// Development with Vite middleware or Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

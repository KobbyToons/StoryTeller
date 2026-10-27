export interface AiGenerateOptions {
  fieldType: string;
  action: 'generate' | 'rewrite' | 'shorten' | 'expand_visuals';
  currentValue?: string;
  keywords?: string;
  context?: Record<string, any>;
}

export async function requestAiText(options: AiGenerateOptions): Promise<string> {
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      throw new Error(`AI generation failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.text || options.currentValue || '';
  } catch (err) {
    console.warn('AI request failed, returning current value or local fallback:', err);
    return options.currentValue || '';
  }
}

export async function requestAiCharacter(params: {
  role?: string;
  concept?: string;
  existingCharacters?: any[];
  worldTone?: string;
}): Promise<any> {
  try {
    const res = await fetch('/api/ai/generate-character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Character generation failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.character;
  } catch (err) {
    console.warn('AI character request failed:', err);
    return null;
  }
}

import { MEME_TEMPLATES, MEME_TEMPLATE_IDS, buildMemeUrl } from './_meme-templates.js';

const TEMPLATE_LIST = MEME_TEMPLATES
  .map((t) => `  - ${t.id}: ${t.name} (${t.blurb})`)
  .join('\n');

const MEME_PROMPT = `You write Friday "Meme Mode" LinkedIn posts. The team explicitly wants edgier, fun, meme-energy content — they would rather be original than post boring corporate slop.

VOICE
- Edgier than normal LinkedIn. PG-13. Mild profanity OK ("damn", "hell", "shit", "ass"). NO f-bombs, NO slurs, NO punching down at any group.
- Embrace meme grammar where it fits: "POV:", "the way I just…", "no thoughts head empty", "tell me you X without telling me", "it's giving…", "the audacity", "respectfully…", "lowkey/highkey".
- Pop-culture references welcome (movies, shows, internet culture). Avoid politics and current events.
- Self-deprecating > preachy. Specific > generic. Funny > clever.

OUTPUT — three pieces, all coherent with the user's post:

1. HOOK: one line, under 70 characters, designed to stop the scroll. Meme-flavored.
2. CAPTION: 200-600 characters. Short paragraphs (1-2 sentences each). One blank line between paragraphs. CTA optional — only add one if it actually lands. Keep the user's core message and any facts.
3. IMAGE MACRO: pick ONE template id from the list and write top + bottom overlay text.

WRITING RULES (still apply, even in meme mode)
- No em dashes. Use periods or commas.
- Contractions always.
- Straight quotes only.
- Overlay text under 60 characters per line. ALL CAPS reads best on memes.

ALLOWED TEMPLATES (pick the one whose format matches your joke):
${TEMPLATE_LIST}

OUTPUT FORMAT — return ONLY this JSON, nothing else, no markdown fences:
{
  "hook": "string",
  "caption": "string",
  "template": "one-of-the-ids-above",
  "topText": "string",
  "bottomText": "string"
}`;

async function callClaude(text) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not configured');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: MEME_PROMPT,
      messages: [{ role: 'user', content: `POST:\n${text}` }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

async function callOpenAI(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not configured');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      // GPT is more reliable about returning bare JSON when asked.
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: MEME_PROMPT },
        { role: 'user', content: `POST:\n${text}` },
      ],
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function parseMemeJson(raw) {
  // Strip accidental markdown fences if the model adds them despite instructions.
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Model returned non-JSON: ${raw.slice(0, 200)}`);
  }
  const { hook, caption, template, topText, bottomText } = parsed;
  if (!hook || !caption || !template) {
    throw new Error('Model JSON missing required fields');
  }
  if (!MEME_TEMPLATE_IDS.includes(template)) {
    throw new Error(`Model picked unknown template "${template}"`);
  }
  return {
    hook: String(hook).trim(),
    caption: String(caption).trim(),
    template,
    topText: String(topText || '').trim(),
    bottomText: String(bottomText || '').trim(),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, model } = req.body || {};
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }
  const chosenModel = model === 'openai' ? 'openai' : 'claude';

  try {
    const raw = chosenModel === 'openai'
      ? await callOpenAI(text.trim())
      : await callClaude(text.trim());
    const meme = parseMemeJson(raw);
    const memeUrl = buildMemeUrl(meme.template, meme.topText, meme.bottomText);
    return res.status(200).json({ ...meme, memeUrl, model: chosenModel });
  } catch (err) {
    console.error('Meme generation error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

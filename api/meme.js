import { MEME_TEMPLATES, MEME_TEMPLATE_IDS, buildMemeUrl } from './_meme-templates.js';

const TEMPLATE_LIST = MEME_TEMPLATES
  .map((t) => `  - ${t.id}: ${t.name} (${t.blurb})`)
  .join('\n');

const MEME_PROMPT = `You are a chronically online Instagram + TikTok content creator who happens to also crush it on LinkedIn. 500k+ across platforms. You know exactly which formats save, which get ratio'd, and which feel forced. You write the team's Friday "Meme Mode" post, because Fridays should not read like a deck.

PERSONA & VOICE
- You speak the way Gen Z and elder millennial creators actually talk online. Conversational, fast, specific. No corporate cadence, no thought-leader posture, no "in today's fast-paced world" energy.
- PG-13 ceiling. Mild profanity is fine ("damn", "hell", "shit", "ass", "pissed"). NO f-bombs. NO slurs. NO punching down at any group. NO politics, religion, current news.
- You know when to use meme grammar and when it's cringe. Use sparingly and on purpose. Examples that still land: "POV:", "tell me you X without telling me X", "the way I just…", "it's giving ___", "respectfully…", "the audacity", "lowkey / highkey", "rent free", "no thoughts head empty", "girl/bro/y'all (sparingly)", "ate", "send this to a ___", "saying the quiet part out loud", "main character energy".
- DO NOT use these (burned out, instant cringe): "this slaps", "we love to see it", "iykyk" (overused), "no notes" (overused), "✨literally✨", random sparkle emoji decoration, hashtag salads, "let's break this down".
- Pop-culture references are welcome but only if they actually fit the joke (Office, Succession, Severance, RHOA, Drake, Beyoncé tour, Taylor Swift eras, the latest streaming hits). If you don't have a perfect ref, skip it.
- Self-deprecating > preachy. Specific > generic. Funny > clever. Show > tell.

INFLUENCER CRAFT YOU APPLY
- Hook = scroll-stop in under 1.5 seconds. Concrete, weird, or contrarian. Numbers and "POV:" and "tell me…" still print. Vague "I had a thought today" does not.
- Caption = built for SAVES and SHARES, not just likes. Either land a relatable observation people will tag a coworker on, OR drop a tight insight that earns a screenshot. Pick one lane.
- Whitespace is a weapon. One thought per line. Blank line between beats. Long paragraphs die on mobile.
- A CTA is optional. If you add one, make it specific ("send this to the PM who lives in your DMs") not generic ("what do you think?"). Forced CTAs read as cope.
- The destination is LinkedIn, so the joke needs to make sense to a marketer / founder / SDR scrolling on their lunch break. The energy is TikTok, the audience is LinkedIn.

OUTPUT — three coherent pieces matching the user's post:

1. HOOK: one line, under 70 characters. Scroll-stop. Specific.
2. CAPTION: 200–600 characters. Short paragraphs (1–2 sentences each), blank line between beats. Optional CTA only if it slaps. Preserve the user's core message and any factual claims.
3. IMAGE MACRO: pick ONE template id from the list below and write top + bottom overlay text. The meme should land the SAME joke as the caption, not a different one.

WRITING RULES (non-negotiable, even in meme mode)
- No em dashes. Use periods or commas.
- Contractions always.
- Straight quotes only.
- Overlay text under 60 characters per line. ALL CAPS reads best on memes.

ALLOWED TEMPLATES (pick the one whose FORMAT matches your joke, not just the vibe):
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

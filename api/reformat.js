const HUMANIZER_RULES = `
ANTI-AI WRITING RULES (non-negotiable):
- NEVER use em dashes (--). Use periods or commas instead.
- NEVER use these words: crucial, delve, landscape, pivotal, underscore, showcase, foster, leverage, navigate, testament, tapestry, interplay, intricate, garnered, encompasses, vital, enduring, vibrant, profound, groundbreaking, nestled, renowned
- NEVER use "Not only X, but Y" or "It's not just X, it's Y" structures
- NEVER use "serves as" or "stands as" when you mean "is"
- NEVER use "At its core", "The real question is", "What really matters", "The deeper issue"
- NEVER use rule-of-three lists ("innovation, inspiration, and insights")
- NEVER use "Let's dive in", "Here's the thing", "Let me break this down"
- NEVER use filler: "In order to" (say "to"), "Due to the fact that" (say "because")
- Use "is" and "has" not "serves as" and "boasts"
- Use simple words. "Big" not "significant". "Hard" not "challenging".
- Contractions always. "don't" not "do not". "it's" not "it is".
- Use straight quotes, never curly quotes`;

const OPTIMIZE_PROMPT = `Rewrite this LinkedIn post for maximum readability and mobile "fold-stop" power. Keep the author's core message and facts.

Structure rules:
- Hook in <8 words, ideally with a number, first-person, or curiosity
- Second line rehooks (challenges or extends the hook)
- One idea per line; break every 1-2 sentences
- Sentences under 12 words on average
- 3+ short paragraph blocks separated by blank lines
- No orphan single-word lines
- End with a sharp takeaway and a question CTA
- Total length 700-1500 chars
${HUMANIZER_RULES}

The result should sound like a real person wrote it, not like AI polished it. Messy is better than perfect. Have opinions. Vary sentence length.

Return ONLY the rewritten post text. No preamble, no quotes, no commentary.`;

const POLISH_PROMPT = `You are a careful editor. The writer has a specific voice and emotional tone. PRESERVE it completely while improving only the structure for LinkedIn mobile readability.

What you MUST keep untouched:
- The writer's exact word choices and vocabulary
- Emotional language, vulnerability, personal anecdotes
- Their natural speaking rhythm and personality
- The opening line's sentiment (you may tighten it, never rewrite it)
- The closing thought's meaning and feel

What you CAN change (structure only):
- Add line breaks between ideas (one thought per line)
- Add blank lines to create 3+ visual chunks
- Split run-on sentences into shorter ones (keep the original words)
- Remove orphan single-word lines by merging them into the previous line
- Trim filler words ("just", "really", "very", "actually") only if they add nothing
- Fix obvious typos or grammar errors

What you MUST NOT do:
- Rewrite sentences in a different voice
- Add LinkedIn buzzwords, hashtags, or engagement bait
- Turn a personal story into a "lesson post"
- Add a question CTA if the writer didn't have one
- Change the emotional register (if it's sad, keep it sad; if it's angry, keep it angry)
- Make it sound more "professional" or "polished". Rawness is often the point
${HUMANIZER_RULES}

Return ONLY the edited post text. No preamble, no quotes, no commentary.`;

async function callClaude(text, systemPrompt) {
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
      system: systemPrompt,
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

async function callOpenAI(text, systemPrompt) {
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
      messages: [
        { role: 'system', content: systemPrompt },
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, model, mode } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!model || !['claude', 'openai'].includes(model)) {
    return res.status(400).json({ error: 'Model must be "claude" or "openai"' });
  }

  const systemPrompt = mode === 'optimize' ? OPTIMIZE_PROMPT : POLISH_PROMPT;

  try {
    const result = model === 'claude'
      ? await callClaude(text.trim(), systemPrompt)
      : await callOpenAI(text.trim(), systemPrompt);

    return res.status(200).json({ result: result.trim() });
  } catch (err) {
    console.error('Reformat error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

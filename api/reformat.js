const SYSTEM_PROMPT = `You are an expert LinkedIn growth writer. Rewrite the post below for maximum readability and "fold-stop" power on mobile. Keep the author's voice and facts. Apply these rules:
- Hook in <8 words, ideally with a number, first-person, or curiosity
- Second line rehooks (challenges or extends the hook)
- One idea per line; break every 1-2 sentences
- Sentences under 12 words on average
- 3+ short paragraph blocks separated by blank lines
- No orphan single-word lines
- End with a sharp takeaway and a question CTA
- Total length 700-1500 chars

Return ONLY the rewritten post text — no preamble, no quotes, no commentary.`;

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
      system: SYSTEM_PROMPT,
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
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
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

  const { text, model } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!model || !['claude', 'openai'].includes(model)) {
    return res.status(400).json({ error: 'Model must be "claude" or "openai"' });
  }

  try {
    const result = model === 'claude'
      ? await callClaude(text.trim())
      : await callOpenAI(text.trim());

    return res.status(200).json({ result: result.trim() });
  } catch (err) {
    console.error('Reformat error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

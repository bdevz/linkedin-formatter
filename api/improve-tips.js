const SYSTEM_PROMPT = `You are a LinkedIn post coach. The user will give you their post text and a list of scoring rules with grades. For each rule that scored below A, provide ONE specific, actionable suggestion to improve it.

Rules you may see:
- hook: The opening line — should be punchy (<8 words), use numbers, first-person, or curiosity triggers
- fold: What's visible before "...more" on mobile (~140 chars) — needs to hook AND rehook
- length: Post character count — sweet spot is 700-1500 chars
- lineLength: Individual line length — keep under 100 chars per line
- whitespace: Blank lines between content — needs breathing room, not a wall of text
- shortSentences: Average sentence word count — aim for under 12 words average
- orphans: Single-word lines that look awkward
- chunking: Number of paragraph blocks — aim for 3-8 distinct chunks
- ending: The final line — should be punchy, memorable, under 6 words ideally
- cta: Call to action — end with a question or invite to comment
- emoji: Emoji usage — 1-3 is tasteful, 8+ is spammy

RESPONSE FORMAT — return valid JSON only:
{
  "tips": {
    "hook": "Rewrite suggestion or tip here",
    "ending": "Rewrite suggestion or tip here"
  }
}

Rules:
- Only include rules that scored below A
- Each tip must be 1-2 sentences max
- Be specific to THIS post — reference the actual content
- If suggesting a rewrite, show the exact rewritten line
- For structural rules (whitespace, chunking, length), give the specific action ("add a blank line after line 3")
- Return ONLY the JSON object, no markdown fences, no commentary`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, rules } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!rules || !Array.isArray(rules)) {
    return res.status(400).json({ error: 'Rules array is required' });
  }

  const failing = rules.filter((r) => r.grade !== 'A');
  if (!failing.length) {
    return res.status(200).json({ tips: {} });
  }

  const rulesDescription = failing
    .map((r) => `- ${r.id} (${r.grade}): ${r.label} — ${r.detail}`)
    .join('\n');

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
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
        messages: [{
          role: 'user',
          content: `POST:\n${text.trim()}\n\nSCORES:\n${rulesDescription}`,
        }],
      }),
    });

    if (!apiRes.ok) {
      const err = await apiRes.text();
      throw new Error(`Anthropic API error ${apiRes.status}: ${err}`);
    }

    const data = await apiRes.json();
    const raw = data.content[0].text.trim();
    const parsed = JSON.parse(raw);
    return res.status(200).json({ tips: parsed.tips || {} });
  } catch (err) {
    console.error('Improve tips error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

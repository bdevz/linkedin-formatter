const COMMENT_SYSTEM = `You are a strategic LinkedIn commenter. Your goal is to craft comments that make the commenter look like a genuine expert — the kind of comment that makes people click through to their profile.

COMMENTER CONTEXT:
Name: {name}
Headline: {headline}

PHILOSOPHY — every comment must follow these principles:
1. Write from the READER's perspective. Don't just share your opinion — articulate what the reader is likely thinking but hasn't said.
2. Add a unique angle that most commenters will miss. Find the non-obvious insight, the second-order implication, the counterintuitive truth.
3. Be genuinely insightful, not performative. NEVER write "Great post!", "Love this!", "Congrats!", "So true!", "Well said!", or any variation. These are invisible on LinkedIn.
4. Match the commenter's expertise (headline) to the topic. The comment should feel like it comes from someone with THAT specific background.
5. Keep it concise: 2-4 sentences. LinkedIn comments that are too long get skipped. Punchy > comprehensive.
6. Consider what the original author is trying to achieve and what the existing conversation is missing.

STYLE GUIDELINES:
- Start with a specific observation or insight, never with praise
- Use concrete language, not abstractions
- One idea per comment, driven to a sharp point
- End with a thought-provoking line or a brief question that advances the conversation (not a generic "What do you think?")
- Sound like a real human with a distinct perspective, not a comment bot
- Write in a conversational tone — how you'd actually talk to someone at a conference, not how you'd write a formal essay

RESPONSE FORMAT — return valid JSON only:
{
  "comments": [
    {
      "angle": "Brief label for the angle taken (3-5 words)",
      "text": "The actual comment text"
    }
  ]
}

Generate exactly 3 comments, each taking a distinctly different angle:
- One that challenges or adds nuance to the post's main point
- One that shares a concrete personal/professional observation related to the topic
- One that highlights an implication or connection most people won't see

Return ONLY the JSON object, no markdown fences, no commentary.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { post, name, headline, direction } = req.body || {};

  if (!post || typeof post !== 'string' || !post.trim()) {
    return res.status(400).json({ error: 'Post text is required' });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const systemPrompt = COMMENT_SYSTEM
    .replace('{name}', name || 'Anonymous')
    .replace('{headline}', headline || 'Professional');

  let userMessage = `ORIGINAL POST:\n${post.trim()}`;
  if (direction && direction.trim()) {
    userMessage += `\n\nCOMMENTER'S DIRECTION: ${direction.trim()}`;
  }

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
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!apiRes.ok) {
      const err = await apiRes.text();
      throw new Error(`Anthropic API error ${apiRes.status}: ${err}`);
    }

    const data = await apiRes.json();
    const raw = data.content[0].text.trim();
    const parsed = JSON.parse(raw);
    return res.status(200).json({ comments: parsed.comments || [] });
  } catch (err) {
    console.error('Comment crafter error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

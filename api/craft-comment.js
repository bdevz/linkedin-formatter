import { humanize } from './_humanizer.js';

const COMMENT_SYSTEM = `You write LinkedIn comments for someone. The comments must sound like a real person typed them on their phone, not like AI generated them.

COMMENTER:
Name: {name}
Role: {headline}

WHAT MAKES A GOOD LINKEDIN COMMENT:
- Write from the reader's perspective, not just your own
- Add an angle most commenters will miss
- Never write "Great post!", "Love this!", "Congrats!", "So true!", "Well said!" or any variation
- 2-3 sentences max. Short is better.
- One idea, stated directly

CRITICAL: ANTI-AI WRITING RULES
These are non-negotiable. If you break any of these, the comment is useless.

NEVER use em dashes (--). Use periods or commas instead.
NEVER use these AI-tell words: crucial, delve, landscape, pivotal, underscore, showcase, foster, leverage, navigate, testament, tapestry, interplay, intricate, garnered, encompasses, vital, enduring, vibrant, profound, groundbreaking, nestled, renowned
NEVER use "Not only X, but Y" or "It's not just X, it's Y" structures
NEVER use "serves as" or "stands as" when you mean "is"
NEVER use persuasive tropes: "At its core", "The real question is", "What really matters", "The deeper issue"
NEVER use rule-of-three lists ("innovation, inspiration, and insights")
NEVER use signposting: "Let's dive in", "Here's the thing", "Let me break this down"
NEVER use filler: "In order to" (say "to"), "Due to the fact that" (say "because"), "It is important to note that" (just say it)
NEVER use curly quotes. Use straight quotes only.
NEVER start with "What strikes me" or any observation-announcement pattern

INSTEAD, write like this:
- Use "is" and "has" not "serves as" and "boasts"
- Use simple words. "Big" not "significant". "Hard" not "challenging". "Weird" not "intriguing".
- Vary sentence length. Mix short punchy with slightly longer ones.
- Have a real opinion. "I genuinely think..." or "honestly this is..." or "we tried this and..."
- Let it be slightly messy. Perfect structure screams AI. A human might start mid-thought.
- Use first person naturally. "we saw this at our company" or "I ran into this exact problem"
- Contractions always. "don't" not "do not". "it's" not "it is". "can't" not "cannot"
- Okay to have a minor grammar imperfection or casual phrasing. Real people don't write perfectly in comments.

GOOD COMMENT EXAMPLES (notice the casual, real tone):
- "we ran into this exact problem scaling from 50 to 200 people. the playbook that worked at 50 actively broke things at 200. had to basically unlearn everything"
- "interesting timing on this. just had a conversation yesterday about how the partner ecosystem stuff is way harder than most people realize coming from enterprise"
- "this is the part nobody talks about. the $3M raise is the headline but surviving near bankruptcy as a teenager is probably what actually made the company work"

BAD COMMENT EXAMPLES (obvious AI, do NOT write like this):
- "What strikes me isn't the lack of formal education -- it's the timing instincts."
- "Pattern recognition beats pattern matching to Stanford archetypes every time."
- "The hostel-to-rentals-to-immigration progression isn't random -- it's the same playbook scaled."

RESPONSE FORMAT - return valid JSON only:
{
  "comments": [
    {
      "angle": "short label (2-4 words)",
      "text": "the comment"
    }
  ]
}

Generate exactly 3 comments with different angles. Return ONLY the JSON, no markdown fences.`;


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
    const comments = parsed.comments || [];

    // Three-tier humanization: deterministic cleanup + pattern detection + surgical fix
    const humanized = await Promise.all(
      comments.map(async (c) => {
        const cleaned = await humanize(c.text, key);
        return { angle: c.angle, text: cleaned };
      })
    );

    return res.status(200).json({ comments: humanized });
  } catch (err) {
    console.error('Comment crafter error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

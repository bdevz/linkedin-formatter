export const STORAGE_KEY = 'li-formatter:current';
export const DRAFTS_KEY = 'li-formatter:drafts';
export const PROFILE_KEY = 'li-formatter:profile';
export const INSPIRATIONS_KEY = 'li-formatter:inspirations';

export const SAMPLE_POST = `I've written 500 LinkedIn posts.

100 went viral. The other 400 didn't.

Here's the pattern I missed for the first three years:

Most readers skim.
LinkedIn sessions are short.
Clarity keeps the reader's attention.

So stop rambling.

Do this instead:

→ One idea per line.
→ Break every 1–2 sentences.
→ End with a question, not a period.

The hook earns the click.
The fold earns the read.
The CTA earns the comment.

That's the whole game.

What's the best LinkedIn hook you've ever read?`;

export function loadJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch { /* quota exceeded or private browsing */ }
}

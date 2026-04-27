// Scoring engine for LinkedIn posts.
// Each rule returns { score: 0-100, grade: A-F, label, detail, status: 'pass'|'warn'|'fail' }

export const MOBILE_FOLD_CHARS = 140; // ~3 short lines on mobile before "...more"
export const DESKTOP_FOLD_CHARS = 210; // ~3 lines on desktop before "...more"

function gradeFromScore(s) {
  if (s >= 90) return 'A';
  if (s >= 80) return 'B';
  if (s >= 70) return 'C';
  if (s >= 60) return 'D';
  return 'F';
}

function statusFromScore(s) {
  if (s >= 80) return 'pass';
  if (s >= 60) return 'warn';
  return 'fail';
}

function tokens(line) {
  return line.trim().split(/\s+/).filter(Boolean);
}

function splitLines(text) {
  return text.split(/\n/);
}

function nonEmptyLines(text) {
  return splitLines(text).filter((l) => l.trim().length);
}

// ---- Individual rules ----

function ruleHook(text) {
  const lines = nonEmptyLines(text);
  const hook = (lines[0] || '').trim();
  const wc = tokens(hook).length;
  let score = 0;
  const reasons = [];
  if (!hook) {
    return { id: 'hook', label: 'Hook strength', score: 0, detail: 'Write a first line.', status: 'fail', grade: 'F' };
  }
  if (wc <= 8) { score += 35; reasons.push('punchy length'); }
  else if (wc <= 12) { score += 22; reasons.push('decent length'); }
  else { score += 5; reasons.push(`${wc} words — too long`); }

  if (/\d/.test(hook)) { score += 15; reasons.push('has numbers'); }
  if (/^(i\b|i'|i'm|i\u2019)/i.test(hook)) { score += 15; reasons.push('first-person'); }
  if (/[?!]/.test(hook)) { score += 10; reasons.push('emotive punctuation'); }
  if (/\b(here'?s|what|why|how|the truth|nobody|everyone|stop|don'?t)\b/i.test(hook)) { score += 15; reasons.push('curiosity trigger'); }
  if (/^(hey|hi|hello|good (morning|afternoon|evening))/i.test(hook)) { score -= 25; reasons.push('generic opener'); }
  score = Math.max(0, Math.min(100, score + 25));

  const hookPreview = hook.length > 60 ? hook.slice(0, 57) + '...' : hook;
  return {
    id: 'hook',
    label: 'Hook strength',
    score,
    detail: reasons.join(' · '),
    highlight: score < 80 ? hookPreview : '',
    status: statusFromScore(score),
    grade: gradeFromScore(score),
  };
}

function ruleFold(text) {
  const truncated = text.slice(0, MOBILE_FOLD_CHARS);
  const hasNoun = /[a-zA-Z]{4,}/.test(truncated);
  const endsMidWord = text.length > MOBILE_FOLD_CHARS && !/[\s.,!?;:]$/.test(truncated);
  let score = 50;
  const reasons = [];
  if (text.length <= MOBILE_FOLD_CHARS) {
    score = 70;
    reasons.push('post fits before fold (no expand needed)');
  } else {
    const aboveFold = text.slice(0, MOBILE_FOLD_CHARS);
    const lines = aboveFold.split(/\n/);
    const firstLine = lines[0].trim();
    const secondLine = (lines[1] || '').trim();
    if (firstLine.length >= 20 && firstLine.length <= 90) { score += 15; reasons.push('hook reads cleanly'); }
    if (secondLine.length > 0) { score += 10; reasons.push('hook + rehook visible'); }
    if (endsMidWord) { score -= 15; reasons.push('cuts mid-word'); }
    if (/\n\s*\n/.test(aboveFold)) { score += 10; reasons.push('breathing room above fold'); }
    if (firstLine.length > MOBILE_FOLD_CHARS) { score -= 20; reasons.push('hook sentence too long'); }
    score += 15;
  }
  if (!hasNoun) score -= 30;
  score = Math.max(0, Math.min(100, score));
  return {
    id: 'fold',
    label: 'The fold',
    score,
    detail: reasons.join(' · ') || '—',
    status: statusFromScore(score),
    grade: gradeFromScore(score),
  };
}

function ruleLength(text) {
  const chars = text.length;
  let score = 0;
  let detail = '';
  if (chars < 200) { score = 40; detail = `${chars} chars — too short for depth`; }
  else if (chars < 500) { score = 65; detail = `${chars} chars — okay, but more room helps`; }
  else if (chars >= 700 && chars <= 1500) { score = 95; detail = `${chars} chars — sweet spot`; }
  else if (chars > 1500 && chars <= 2200) { score = 80; detail = `${chars} chars — long but acceptable`; }
  else if (chars > 2200 && chars <= 3000) { score = 60; detail = `${chars} chars — risk of drop-off`; }
  else if (chars > 3000) { score = 35; detail = `${chars} chars — over LinkedIn cap (3000)`; }
  else { score = 70; detail = `${chars} chars`; }
  return {
    id: 'length',
    label: 'Post length',
    score,
    detail,
    status: statusFromScore(score),
    grade: gradeFromScore(score),
  };
}

function ruleLineLength(text) {
  const lines = nonEmptyLines(text);
  if (!lines.length) return { id: 'lineLength', label: 'Line length', score: 0, detail: 'No content', status: 'fail', grade: 'F' };
  const longLines = lines.filter((l) => l.length > 100);
  const veryLong = lines.filter((l) => l.length > 140).length;
  const ratio = longLines.length / lines.length;
  let score = 100 - Math.round(ratio * 80) - veryLong * 8;
  score = Math.max(0, Math.min(100, score));
  const detail = `${longLines.length}/${lines.length} lines over 100 chars${veryLong ? `, ${veryLong} over 140` : ''}`;
  const highlight = longLines.length ? longLines.slice(0, 2).map((l) => l.length > 50 ? l.slice(0, 47) + '...' : l).join(' | ') : '';
  return { id: 'lineLength', label: 'Line length', score, detail, highlight, status: statusFromScore(score), grade: gradeFromScore(score) };
}

function ruleWhitespace(text) {
  const lines = splitLines(text);
  const blanks = lines.filter((l) => !l.trim()).length;
  const nonBlanks = lines.filter((l) => l.trim()).length;
  if (!nonBlanks) return { id: 'whitespace', label: 'Whitespace', score: 0, detail: 'Empty post', status: 'fail', grade: 'F' };
  const ratio = blanks / nonBlanks;
  let score = 0;
  let detail = '';
  if (ratio < 0.15) { score = 35; detail = 'Wall of text — break it up'; }
  else if (ratio < 0.3) { score = 65; detail = 'Could use more breaks'; }
  else if (ratio <= 0.8) { score = 95; detail = `${blanks} blank lines · ${nonBlanks} content lines`; }
  else { score = 70; detail = 'Maybe too airy — feels thin'; }
  return { id: 'whitespace', label: 'Whitespace', score, detail, status: statusFromScore(score), grade: gradeFromScore(score) };
}

function ruleShortSentences(text) {
  const sentences = text
    .replace(/\n/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!sentences.length) return { id: 'shortSentences', label: 'Short sentences', score: 0, detail: '—', status: 'fail', grade: 'F' };
  const lengths = sentences.map((s) => tokens(s).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const long = lengths.filter((n) => n > 20).length;
  let score = 100;
  if (avg > 18) score -= 30;
  else if (avg > 14) score -= 15;
  else if (avg > 12) score -= 5;
  score -= Math.min(30, long * 8);
  score = Math.max(0, Math.min(100, score));
  const longSentences = sentences.filter((s) => tokens(s).length > 20);
  const highlight = longSentences.length
    ? longSentences.slice(0, 2).map((s) => s.length > 50 ? s.slice(0, 47) + '...' : s).join(' | ')
    : '';
  return {
    id: 'shortSentences',
    label: 'Short sentences',
    score,
    detail: `avg ${avg.toFixed(1)} words${long ? ` · ${long} long` : ''}`,
    highlight,
    status: statusFromScore(score),
    grade: gradeFromScore(score),
  };
}

function ruleOrphans(text) {
  const lines = nonEmptyLines(text);
  const orphanLines = [];
  lines.forEach((l) => {
    const w = tokens(l);
    if (w.length === 1 && l.length < 12) orphanLines.push(l.trim());
  });
  let score = 100 - orphanLines.length * 25;
  score = Math.max(0, score);
  const detail = orphanLines.length ? `${orphanLines.length} orphan line(s)` : 'no orphans';
  const highlight = orphanLines.length ? orphanLines.slice(0, 3).map((l) => `"${l}"`).join(', ') : '';
  return { id: 'orphans', label: 'No orphan words', score, detail, highlight, status: statusFromScore(score), grade: gradeFromScore(score) };
}

function ruleChunking(text) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  let score = 50;
  let detail = '';
  if (blocks.length === 1) { score = 30; detail = 'One block — split into chunks'; }
  else if (blocks.length === 2) { score = 60; detail = '2 chunks — could go further'; }
  else if (blocks.length >= 3 && blocks.length <= 8) { score = 95; detail = `${blocks.length} chunks — well structured`; }
  else if (blocks.length > 8) { score = 75; detail = `${blocks.length} chunks — verging on choppy`; }
  return { id: 'chunking', label: 'Topic chunking', score, detail, status: statusFromScore(score), grade: gradeFromScore(score) };
}

function rulePowerEnding(text) {
  const lines = nonEmptyLines(text);
  const last = (lines[lines.length - 1] || '').trim();
  if (!last) return { id: 'ending', label: 'Power ending', score: 0, detail: '—', status: 'fail', grade: 'F' };
  let score = 20;
  const wc = tokens(last).length;
  const reasons = [];

  // Length scoring — punchy endings win
  if (wc <= 6) { score += 30; reasons.push('punchy'); }
  else if (wc <= 10) { score += 22; reasons.push('short'); }
  else if (wc <= 16) { score += 10; reasons.push('medium length'); }
  else { score += 0; reasons.push(`${wc} words — too long for impact`); }

  // Ending punctuation — questions and exclamations drive engagement
  if (/[?]$/.test(last)) { score += 20; reasons.push('ends with question'); }
  else if (/[!]$/.test(last)) { score += 15; reasons.push('ends with emphasis'); }
  else if (/\.$/.test(last)) { score += 5; reasons.push('plain period'); }
  else { reasons.push('missing punctuation'); }

  // Power phrases — real engagement triggers (not "so")
  if (/\b(remember this|the truth is|that'?s (why|the|it)|never forget|bottom line|here'?s what matters)\b/i.test(last)) {
    score += 15; reasons.push('power phrase');
  }

  // CTA phrases in ending line
  if (/\b(tell me|what (would|do|did) you|your turn|agree\??|thoughts\??|drop a|share your|comment below)\b/i.test(last)) {
    score += 15; reasons.push('CTA in ending');
  }

  // Penalty for weak endings
  if (/^(thanks|thank you|cheers|good luck|hope this helps)/i.test(last)) {
    score -= 20; reasons.push('weak closer');
  }
  if (/\b(anyway|just saying|lol|haha)\b/i.test(last)) {
    score -= 15; reasons.push('undermines ending');
  }

  score = Math.max(0, Math.min(100, score));
  const lastPreview = last.length > 60 ? last.slice(0, 57) + '...' : last;
  return {
    id: 'ending', label: 'Power ending', score,
    detail: reasons.join(' · '),
    highlight: lastPreview,
    status: statusFromScore(score), grade: gradeFromScore(score),
  };
}

function ruleCTA(text) {
  const lines = nonEmptyLines(text);
  const lastTwo = lines.slice(-2).join(' ');
  const hasQuestion = /\?\s*$/.test(text.trim()) || /\?/.test(lastTwo);
  const hasInvite = /\b(comment|share|thoughts\?|tell me|what do you think|agree\?|your turn|drop a)\b/i.test(lastTwo);
  let score = 30;
  let detail = 'no clear CTA';
  if (hasQuestion) { score += 50; detail = 'ends with a question'; }
  if (hasInvite) { score += 25; detail += hasQuestion ? ' + invite' : ' (invite phrasing)'; }
  score = Math.min(100, score);
  const lastLine = (lines[lines.length - 1] || '').trim();
  const highlight = score < 80 ? (lastLine.length > 60 ? lastLine.slice(0, 57) + '...' : lastLine) : '';
  return { id: 'cta', label: 'Call to action', score, detail, highlight, status: statusFromScore(score), grade: gradeFromScore(score) };
}

function ruleEmoji(text) {
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  const matches = text.match(emojiRegex) || [];
  const n = matches.length;
  let score = 100;
  let detail = `${n} emoji`;
  if (n > 8) { score = 50; detail += ' — feels spammy'; }
  else if (n > 4) { score = 75; detail += ' — borderline'; }
  else if (n >= 1 && n <= 3) { score = 95; detail += ' — tasteful'; }
  else { score = 85; detail = 'no emoji — fine'; }
  return { id: 'emoji', label: 'Emoji use', score, detail, status: statusFromScore(score), grade: gradeFromScore(score) };
}

export function scorePost(text) {
  if (!text || !text.trim()) {
    return { overall: 0, grade: 'F', rules: [] };
  }
  const rules = [
    ruleHook(text),
    ruleFold(text),
    ruleLength(text),
    ruleLineLength(text),
    ruleWhitespace(text),
    ruleShortSentences(text),
    ruleOrphans(text),
    ruleChunking(text),
    rulePowerEnding(text),
    ruleCTA(text),
    ruleEmoji(text),
  ];
  const weights = {
    hook: 2.0, fold: 2.0, length: 1.0, lineLength: 1.2,
    whitespace: 1.2, shortSentences: 1.0, orphans: 0.6,
    chunking: 1.0, ending: 0.9, cta: 1.1, emoji: 0.4,
  };
  let totalW = 0, weighted = 0;
  rules.forEach((r) => {
    const w = weights[r.id] || 1;
    weighted += r.score * w;
    totalW += w;
  });
  const overall = Math.round(weighted / totalW);
  return { overall, grade: gradeFromScore(overall), rules };
}

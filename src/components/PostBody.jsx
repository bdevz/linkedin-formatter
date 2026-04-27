import React from 'react';

function renderInline(text) {
  const parts = [];
  const re = /(#[\w-]+|@[\w.-]+|https?:\/\/\S+)/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    parts.push(<span key={`t${i++}`} className="inline-token">{tok}</span>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function PostBody({ text, foldChars, expanded, onToggle }) {
  if (!text.trim()) {
    return <div className="post-body empty">Your post will appear here…</div>;
  }
  const showFold = !expanded && text.length > foldChars;
  const visible = showFold ? text.slice(0, foldChars) : text;
  const hidden = showFold ? '' : text.slice(foldChars);
  const lines = visible.split('\n');

  return (
    <div className="post-body">
      {lines.map((line, i) => (
        <div key={i} className={'post-line' + (line.trim() ? '' : ' blank')}>
          {line.trim() ? renderInline(line) : '\u00A0'}
        </div>
      ))}
      {showFold && (
        <button className="more-btn" onClick={onToggle}>…more</button>
      )}
      {expanded && text.length > foldChars && (
        <div className="fold-divider" aria-hidden="true" />
      )}
      {expanded && text.length > foldChars && text.slice(foldChars).split('\n').map((line, i) => (
        <div key={'h' + i} className={'post-line' + (line.trim() ? '' : ' blank')}>
          {line.trim() ? renderInline(line) : '\u00A0'}
        </div>
      ))}
    </div>
  );
}

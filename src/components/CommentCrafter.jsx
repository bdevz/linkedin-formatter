import { useState } from 'react';

export default function CommentCrafter({ open, profile, onClose }) {
  const [post, setPost] = useState('');
  const [direction, setDirection] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(-1);

  if (!open) return null;

  const handleCraft = async () => {
    setLoading(true);
    setError('');
    setComments([]);
    setCopiedIdx(-1);
    try {
      const res = await fetch('/api/craft-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post,
          name: profile.name,
          headline: profile.headline,
          direction,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Comment crafting failed');
      setComments(data.comments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPost('');
    setDirection('');
    setComments([]);
    setError('');
    setLoading(false);
    setCopiedIdx(-1);
    onClose();
  };

  const handleCopy = async (idx) => {
    try {
      await navigator.clipboard.writeText(comments[idx].text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(-1), 1400);
    } catch { /* clipboard not available */ }
  };

  const handleEditComment = (idx, newText) => {
    setComments(comments.map((c, i) => i === idx ? { ...c, text: newText } : c));
  };

  const handleNewPost = () => {
    setPost('');
    setDirection('');
    setComments([]);
    setError('');
    setCopiedIdx(-1);
  };

  return (
    <div className="pop-shell" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="pop comment-crafter-pop">
        <div className="drawer-head">
          <div className="drawer-title">Comment Crafter</div>
          <button className="x" onClick={handleClose}>&times;</button>
        </div>

        {!comments.length && !loading && (
          <>
            <textarea
              className="comment-crafter-input"
              value={post}
              onChange={(e) => setPost(e.target.value)}
              placeholder="Paste the LinkedIn post you want to comment on..."
              rows={6}
            />
            <div className="comment-crafter-direction">
              <label className="comment-crafter-direction-label">Direction (optional)</label>
              <input
                className="comment-crafter-direction-input"
                type="text"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                placeholder="e.g. challenge the premise, share contrarian data, relate to my industry..."
              />
            </div>
            <p className="ai-hint">
              Commenting as <strong>{profile.name || 'Your Name'}</strong> — {profile.headline || 'Your headline'}
            </p>
          </>
        )}

        {loading && (
          <div className="ai-loading">
            <div className="ai-spinner" />
            <span>Crafting 3 comment angles...</span>
          </div>
        )}

        {error && <div className="ai-error">{error}</div>}

        {comments.length > 0 && (
          <div className="comment-crafter-results">
            {comments.map((c, idx) => (
              <div key={idx} className="comment-crafter-card">
                <div className="comment-crafter-card-head">
                  <span className="comment-crafter-angle">{c.angle}</span>
                  <button
                    className={`btn small${copiedIdx === idx ? ' copied' : ''}`}
                    onClick={() => handleCopy(idx)}
                  >
                    {copiedIdx === idx ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <textarea
                  className="comment-crafter-text"
                  value={c.text}
                  onChange={(e) => handleEditComment(idx, e.target.value)}
                  rows={4}
                />
              </div>
            ))}
          </div>
        )}

        <div className="ai-actions">
          {!comments.length && !loading && (
            <button className="btn primary ai" onClick={handleCraft} disabled={!post.trim()}>
              Craft Comments
            </button>
          )}
          {comments.length > 0 && (
            <>
              <button className="btn" onClick={handleCraft}>Regenerate</button>
              <button className="btn" onClick={handleNewPost}>New Post</button>
            </>
          )}
          {error && (
            <button className="btn primary ai" onClick={handleCraft} disabled={!post.trim()}>
              Retry
            </button>
          )}
          <button className="btn ghost" onClick={handleClose} disabled={loading}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

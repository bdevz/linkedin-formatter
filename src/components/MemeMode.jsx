import { useState } from 'react';
import { memeTemplateName } from '../lib/meme-templates';

export default function MemeMode({ open, text, onClose, onUse }) {
  const [model, setModel] = useState('claude');
  const [hook, setHook] = useState('');
  const [caption, setCaption] = useState('');
  const [template, setTemplate] = useState('');
  const [memeUrl, setMemeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const reset = () => {
    setHook('');
    setCaption('');
    setTemplate('');
    setMemeUrl('');
    setError('');
  };

  const handleGenerate = async () => {
    setLoading(true);
    reset();
    try {
      const res = await fetch('/api/meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Meme generation failed');
      setHook(data.hook);
      setCaption(data.caption);
      setTemplate(data.template);
      setMemeUrl(data.memeUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setLoading(false);
    onClose();
  };

  const handleUse = () => {
    const combined = hook ? `${hook}\n\n${caption}` : caption;
    onUse(combined);
    reset();
    onClose();
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(memeUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meme-${template}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(memeUrl, '_blank');
    }
  };

  return (
    <div className="pop-shell" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="pop ai-pop meme-pop">
        <div className="drawer-head">
          <div className="drawer-title">Meme Mode 🔥</div>
          <button className="x" onClick={handleClose}>&times;</button>
        </div>

        <div className="ai-model-toggle">
          <button
            className={`ai-model-btn ${model === 'claude' ? 'active' : ''}`}
            onClick={() => setModel('claude')}
            disabled={loading}
          >
            Claude
          </button>
          <button
            className={`ai-model-btn ${model === 'openai' ? 'active' : ''}`}
            onClick={() => setModel('openai')}
            disabled={loading}
          >
            GPT
          </button>
        </div>

        {!hook && !loading && !error && (
          <p className="ai-hint">
            Friday energy. Generates an edgier hook, a short caption, and a meme image macro to match.
            PG-13, no f-bombs, brand-safe-ish.
          </p>
        )}

        {loading && (
          <div className="ai-loading">
            <div className="ai-spinner" />
            <span>Cooking up the meme with {model === 'claude' ? 'Claude' : 'GPT'}…</span>
          </div>
        )}

        {error && <div className="ai-error">{error}</div>}

        {hook && (
          <div className="meme-result">
            <div className="meme-block">
              <label className="meme-label">Hook</label>
              <input
                className="meme-hook-input"
                value={hook}
                onChange={(e) => setHook(e.target.value)}
              />
            </div>

            <div className="meme-block">
              <label className="meme-label">Caption</label>
              <textarea
                className="ai-output"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={8}
              />
            </div>

            {memeUrl && (
              <div className="meme-block">
                <label className="meme-label">
                  Image · template: <strong>{memeTemplateName(template)}</strong>
                </label>
                <div className="img-gen-preview">
                  <img src={memeUrl} alt={`Meme using template ${template}`} />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="ai-actions">
          {!hook && !loading && (
            <button className="btn primary ai" onClick={handleGenerate} disabled={!text.trim()}>
              Generate
            </button>
          )}
          {hook && (
            <>
              <button className="btn primary" onClick={handleUse}>
                Use caption
              </button>
              <button className="btn" onClick={handleDownload} disabled={!memeUrl}>
                Download meme
              </button>
              <button className="btn" onClick={handleGenerate}>
                Regenerate
              </button>
            </>
          )}
          {error && (
            <button className="btn primary ai" onClick={handleGenerate}>
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

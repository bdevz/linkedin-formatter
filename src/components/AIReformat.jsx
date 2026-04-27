import { useState } from 'react';

const MODES = [
  { id: 'polish', label: 'Polish', desc: 'Fix structure, keep your voice and tone intact' },
  { id: 'optimize', label: 'Optimize', desc: 'Rewrite for maximum virality and engagement' },
];

export default function AIReformat({ open, text, onClose, onUse }) {
  const [model, setModel] = useState('claude');
  const [mode, setMode] = useState('polish');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleReformat = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetch('/api/reformat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reformat failed');
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult('');
    setError('');
    setLoading(false);
    onClose();
  };

  const handleUse = () => {
    onUse(result);
    setResult('');
    setError('');
    onClose();
  };

  return (
    <div className="pop-shell" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="pop ai-pop">
        <div className="drawer-head">
          <div className="drawer-title">Reformat with AI</div>
          <button className="x" onClick={handleClose}>&times;</button>
        </div>

        <div className="ai-mode-toggle">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`ai-mode-btn ${mode === m.id ? 'active' : ''}`}
              onClick={() => setMode(m.id)}
              disabled={loading}
              title={m.desc}
            >
              <span className="ai-mode-label">{m.label}</span>
              <span className="ai-mode-desc">{m.desc}</span>
            </button>
          ))}
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

        {!result && !loading && !error && (
          <p className="ai-hint">
            {mode === 'polish'
              ? 'Your post will be restructured for readability while keeping your voice and emotional tone.'
              : 'Your post will be rewritten for maximum virality and engagement. Tone may change.'}
          </p>
        )}

        {loading && (
          <div className="ai-loading">
            <div className="ai-spinner" />
            <span>Reformatting with {model === 'claude' ? 'Claude' : 'GPT'}...</span>
          </div>
        )}

        {error && (
          <div className="ai-error">{error}</div>
        )}

        {result && (
          <textarea
            className="ai-output"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            rows={12}
          />
        )}

        <div className="ai-actions">
          {!result && !loading && (
            <button className="btn primary ai" onClick={handleReformat} disabled={!text.trim()}>
              Reformat
            </button>
          )}
          {result && (
            <button className="btn primary" onClick={handleUse}>
              Use this version
            </button>
          )}
          <button className="btn ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

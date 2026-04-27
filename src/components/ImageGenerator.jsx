import { useState } from 'react';

const MODELS = [
  { id: 'gpt', label: 'GPT (DALL-E 3)', desc: 'OpenAI — creative, stylized' },
  { id: 'flux-dev', label: 'Flux Dev', desc: 'fal.ai — fast, balanced' },
  { id: 'flux-pro', label: 'Flux Pro', desc: 'fal.ai — highest quality' },
];

export default function ImageGenerator({ open, text, onClose }) {
  const [model, setModel] = useState('gpt');
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setImageUrl('');
    setPrompt('');
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image generation failed');
      setImageUrl(data.imageUrl);
      setPrompt(data.prompt);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImageUrl('');
    setPrompt('');
    setError('');
    setLoading(false);
    onClose();
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'linkedin-image.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  const selected = MODELS.find((m) => m.id === model);

  return (
    <div className="pop-shell" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="pop img-gen-pop">
        <div className="drawer-head">
          <div className="drawer-title">Generate Post Image</div>
          <button className="x" onClick={handleClose}>&times;</button>
        </div>

        <div className="ai-model-toggle">
          {MODELS.map((m) => (
            <button
              key={m.id}
              className={`ai-model-btn ${model === m.id ? 'active' : ''}`}
              onClick={() => setModel(m.id)}
              disabled={loading}
              title={m.desc}
            >
              {m.label}
            </button>
          ))}
        </div>

        {!imageUrl && !loading && !error && (
          <p className="img-gen-hint">
            {selected.desc} — analyzes your post and generates a
            scroll-stopping image tailored to your content.
          </p>
        )}

        {loading && (
          <div className="img-gen-loading">
            <div className="ai-spinner" />
            <div>
              <div>Creating your image with {selected.label}...</div>
              <div className="img-gen-loading-sub">This may take 15-30 seconds</div>
            </div>
          </div>
        )}

        {error && (
          <div className="ai-error">{error}</div>
        )}

        {imageUrl && (
          <>
            <div className="img-gen-preview">
              <img src={imageUrl} alt="Generated LinkedIn post image" />
            </div>
            <details className="img-gen-prompt-details">
              <summary>Image prompt used</summary>
              <p className="img-gen-prompt-text">{prompt}</p>
            </details>
          </>
        )}

        <div className="ai-actions">
          {!imageUrl && !loading && (
            <button className="btn primary ai" onClick={handleGenerate} disabled={!text.trim()}>
              Generate
            </button>
          )}
          {imageUrl && (
            <>
              <button className="btn primary" onClick={handleDownload}>
                Download
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

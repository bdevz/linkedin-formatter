import { useState } from 'react';

export default function Scorecard({ result, text }) {
  const [tips, setTips] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!result || !result.rules.length) {
    return <div className="scorecard empty">Start writing to see your scorecard.</div>;
  }

  const { overall, grade, rules } = result;
  const hasFailing = rules.some((r) => r.grade !== 'A');

  const handleGetTips = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/improve-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text || '',
          rules: rules.map((r) => ({ id: r.id, grade: r.grade, label: r.label, detail: r.detail })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get tips');
      setTips(data.tips || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scorecard">
      <div className="overall">
        <div className={`big-grade grade-${grade}`}>{grade}</div>
        <div className="overall-meta">
          <div className="overall-num">
            {overall}<span className="over-100">/100</span>
          </div>
          <div className="overall-label">Viral readiness</div>
        </div>
      </div>

      {hasFailing && (
        <button
          className="btn tips-btn"
          onClick={handleGetTips}
          disabled={loading}
        >
          {loading ? 'Getting tips...' : Object.keys(tips).length ? 'Refresh tips' : 'Get AI tips to improve'}
        </button>
      )}
      {error && <div className="tips-error">{error}</div>}

      <ul className="rules">
        {rules.map((r) => (
          <li key={r.id} className={`rule status-${r.status}`}>
            <div className="rule-top">
              <span className={`dot ${r.status}`} />
              <span className="rule-label">{r.label}</span>
              <span className={`rule-grade grade-${r.grade}`}>{r.grade}</span>
            </div>
            <div className="rule-bar">
              <div className="rule-bar-fill" style={{ width: r.score + '%' }} />
            </div>
            <div className="rule-detail">{r.detail}</div>
            {r.highlight && r.status !== 'pass' && (
              <div className="rule-highlight">⚠ {r.highlight}</div>
            )}
            {tips[r.id] && (
              <div className="rule-tip">💡 {tips[r.id]}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

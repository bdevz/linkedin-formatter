import React from 'react';

export default function Scorecard({ result }) {
  if (!result || !result.rules.length) {
    return <div className="scorecard empty">Start writing to see your scorecard.</div>;
  }
  const { overall, grade, rules } = result;
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
          </li>
        ))}
      </ul>
    </div>
  );
}

import React from 'react';

export default function Toolbar({ chars, words, onCopy, onClear, onSampleLoad, onOpenDrafts, onOpenProfile, onOpenInspirations, draftCount, inspirationCount }) {
  return (
    <div className="toolbar">
      <div className="tb-left">
        <div className="counters">
          <span className="count"><strong>{chars}</strong> chars</span>
          <span className="count"><strong>{words}</strong> words</span>
          <span className="count subtle">{chars > 3000 ? 'OVER LIMIT' : `${3000 - chars} left`}</span>
        </div>
      </div>
      <div className="tb-right">
        <button className="btn ghost" onClick={onSampleLoad}>Load sample</button>
        <button className="btn ghost" onClick={onClear}>Clear</button>
        <button className="btn ghost" onClick={onOpenProfile}>Profile</button>
        <button className="btn ghost" onClick={onOpenDrafts}>
          Drafts{draftCount ? ` (${draftCount})` : ''}
        </button>
        <button className="btn ghost" onClick={onOpenInspirations}>
          Inspiration{inspirationCount ? ` (${inspirationCount})` : ''}
        </button>
        <button className="btn primary" onClick={onCopy}>Copy text</button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

export default function DraftDrawer({ open, onClose, drafts, onLoad, onDelete, onSaveAs, current }) {
  const [name, setName] = useState('');
  if (!open) return null;

  return (
    <div className="drawer-shell" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div className="drawer-title">Drafts</div>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="save-as">
          <input
            className="name-input"
            placeholder="Name this draft…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="btn"
            disabled={!name.trim() || !current.trim()}
            onClick={() => { onSaveAs(name.trim()); setName(''); }}
          >
            Save
          </button>
        </div>
        <div className="drawer-list">
          {drafts.length === 0 && (
            <div className="empty-drafts">No saved drafts yet.</div>
          )}
          {drafts.map((d) => (
            <div key={d.id} className="draft-row">
              <div className="draft-meta">
                <div className="draft-name">{d.name}</div>
                <div className="draft-preview">
                  {d.text.slice(0, 60).replace(/\n/g, ' ') + (d.text.length > 60 ? '…' : '')}
                </div>
              </div>
              <div className="draft-actions">
                <button className="btn small" onClick={() => onLoad(d)}>Load</button>
                <button className="btn small ghost" onClick={() => onDelete(d.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

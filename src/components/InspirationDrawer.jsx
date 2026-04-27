import { useState } from 'react';
import { PLATFORMS } from '../lib/platforms';
import { timeAgo } from '../lib/time';

export default function InspirationDrawer({ open, onClose, inspirations, onSave, onDelete, onInsert, onInsertHook }) {
  const [mode, setMode] = useState('browse');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterCreator, setFilterCreator] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ creator: '', platform: 'linkedin', content: '', notes: '' });

  if (!open) return null;

  const filtered = inspirations.filter((item) => {
    if (filterPlatform !== 'all' && item.platform !== filterPlatform) return false;
    if (filterCreator && !item.creator.toLowerCase().includes(filterCreator.toLowerCase())) return false;
    return true;
  });

  const handleSave = () => {
    if (!form.creator.trim() || !form.content.trim()) return;
    onSave({ creator: form.creator.trim(), platform: form.platform, content: form.content.trim(), notes: form.notes.trim() });
    setForm({ creator: '', platform: 'linkedin', content: '', notes: '' });
    setMode('browse');
  };

  const handleDelete = (id) => {
    if (confirm('Delete this inspiration?')) onDelete(id);
  };

  const platformEmoji = (value) => {
    const p = PLATFORMS.find((pl) => pl.value === value);
    return p ? p.emoji : '✦';
  };

  const isEmpty = inspirations.length === 0;

  return (
    <div className="drawer-shell" onClick={onClose}>
      <div className="drawer inspo-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div className="drawer-title">Inspiration Library</div>
          <button className="x" onClick={onClose}>×</button>
        </div>

        <div className="inspo-tabs">
          <button
            className={'inspo-tab' + (mode === 'browse' ? ' active' : '')}
            onClick={() => setMode('browse')}
          >
            Browse
          </button>
          <button
            className={'inspo-tab' + (mode === 'add' ? ' active' : '')}
            onClick={() => setMode('add')}
          >
            + Add New
          </button>
        </div>

        {mode === 'add' && (
          <div className="inspo-form">
            <label>
              Creator name
              <input
                className="name-input"
                placeholder="e.g. Sahil Bloom, Dwarkesh Patel"
                value={form.creator}
                onChange={(e) => setForm({ ...form, creator: e.target.value })}
              />
            </label>
            <label>
              Platform
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.emoji} {p.label}</option>
                ))}
              </select>
            </label>
            <label>
              Content
              <textarea
                rows={5}
                placeholder="Paste the post, quote, or passage that inspired you..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </label>
            <label>
              Notes (optional)
              <textarea
                rows={3}
                placeholder="What do you like about this? Patterns, hooks, style..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            <button
              className="btn primary"
              disabled={!form.creator.trim() || !form.content.trim()}
              onClick={handleSave}
            >
              Save inspiration
            </button>
          </div>
        )}

        {mode === 'browse' && (
          <>
            {!isEmpty && (
              <div className="inspo-filters">
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                >
                  <option value="all">All platforms</option>
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.emoji} {p.label}</option>
                  ))}
                </select>
                <input
                  placeholder="Search creator..."
                  value={filterCreator}
                  onChange={(e) => setFilterCreator(e.target.value)}
                />
              </div>
            )}

            <div className="inspo-list">
              {isEmpty && (
                <div className="inspo-empty">
                  No saved inspirations yet.<br />
                  Click "Add New" to save your first one.
                </div>
              )}

              {!isEmpty && filtered.length === 0 && (
                <div className="inspo-empty">No matches for this filter.</div>
              )}

              {filtered.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <div key={item.id} className="inspo-card">
                    <div
                      className="inspo-card-head"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="inspo-platform">{platformEmoji(item.platform)}</span>
                      <span className="inspo-creator">{item.creator}</span>
                      <span className="inspo-time">{timeAgo(item.savedAt)}</span>
                    </div>

                    {!isExpanded && (
                      <div className="inspo-preview">
                        {item.content.slice(0, 80).replace(/\n/g, ' ') + (item.content.length > 80 ? '...' : '')}
                      </div>
                    )}

                    {isExpanded && (
                      <>
                        <div className="inspo-full">{item.content}</div>
                        {item.notes && <div className="inspo-notes">{item.notes}</div>}
                        <div className="inspo-actions">
                          <button className="btn small" onClick={() => onInsertHook(item.content)}>
                            Use as hook
                          </button>
                          <button className="btn small" onClick={() => onInsert(item.content)}>
                            Insert full
                          </button>
                          <button className="btn small ghost" onClick={() => handleDelete(item.id)}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

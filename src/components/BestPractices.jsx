import { useState } from 'react';
import { CATEGORIES } from '../lib/best-practices';

export default function BestPractices({ overrides, onUpdate }) {
  const [openCats, setOpenCats] = useState({});
  const [search, setSearch] = useState('');
  const [addingTo, setAddingTo] = useState(null);
  const [addText, setAddText] = useState('');
  const [editingTip, setEditingTip] = useState(null);
  const [editText, setEditText] = useState('');

  // Merge defaults with user overrides
  const merged = CATEGORIES.map((cat) => {
    const ov = overrides[cat.id];
    if (!ov) return cat;
    return {
      ...cat,
      tips: ov.tips !== undefined ? ov.tips : cat.tips,
    };
  });

  const query = search.toLowerCase().trim();
  const filtered = query
    ? merged.map((cat) => ({
        ...cat,
        tips: cat.tips.filter((t) => t.text.toLowerCase().includes(query)),
      })).filter((cat) => cat.tips.length > 0)
    : merged;

  const toggleCat = (id) =>
    setOpenCats((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleAdd = (catId) => {
    if (!addText.trim()) return;
    const cat = merged.find((c) => c.id === catId);
    const newTip = { id: Date.now().toString(36), text: addText.trim() };
    const currentTips = overrides[catId]?.tips || cat.tips;
    onUpdate({
      ...overrides,
      [catId]: { tips: [...currentTips, newTip] },
    });
    setAddText('');
    setAddingTo(null);
  };

  const handleDelete = (catId, tipId) => {
    const cat = merged.find((c) => c.id === catId);
    const currentTips = overrides[catId]?.tips || cat.tips;
    onUpdate({
      ...overrides,
      [catId]: { tips: currentTips.filter((t) => t.id !== tipId) },
    });
  };

  const handleEditStart = (tip) => {
    setEditingTip(tip.id);
    setEditText(tip.text);
  };

  const handleEditSave = (catId) => {
    if (!editText.trim()) return;
    const cat = merged.find((c) => c.id === catId);
    const currentTips = overrides[catId]?.tips || cat.tips;
    onUpdate({
      ...overrides,
      [catId]: {
        tips: currentTips.map((t) =>
          t.id === editingTip ? { ...t, text: editText.trim() } : t
        ),
      },
    });
    setEditingTip(null);
    setEditText('');
  };

  const handleReset = () => {
    if (confirm('Reset all best practices to defaults? Your custom tips will be lost.')) {
      onUpdate({});
    }
  };

  return (
    <div className="bp-panel">
      <div className="bp-head">Best Practices</div>
      <input
        className="bp-search"
        placeholder="Search tips..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 && (
        <div className="bp-empty">No tips match your search.</div>
      )}

      {filtered.map((cat) => {
        const isOpen = query ? true : openCats[cat.id];
        return (
          <div key={cat.id} className="bp-category">
            <div className="bp-cat-head" onClick={() => toggleCat(cat.id)}>
              <span className="bp-cat-emoji">{cat.emoji}</span>
              <span className="bp-cat-label">{cat.label}</span>
              <span className="bp-cat-count">{cat.tips.length}</span>
              <span className={'bp-cat-chevron' + (isOpen ? ' open' : '')}>
                &#x25B6;
              </span>
            </div>

            {isOpen && (
              <div className="bp-tips">
                {cat.tips.map((tip) => (
                  <div key={tip.id} className="bp-tip">
                    {editingTip === tip.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleEditSave(cat.id);
                        }}
                      >
                        <input
                          className="bp-edit-input"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                          onBlur={() => handleEditSave(cat.id)}
                        />
                      </form>
                    ) : (
                      <>
                        <div className="bp-tip-text">{tip.text}</div>
                        <div className="bp-tip-actions">
                          <button
                            className="bp-tip-btn"
                            onClick={() => handleEditStart(tip)}
                          >
                            Edit
                          </button>
                          <button
                            className="bp-tip-btn delete"
                            onClick={() => handleDelete(cat.id, tip.id)}
                          >
                            Del
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                <div className="bp-add-row">
                  {addingTo === cat.id ? (
                    <form
                      className="bp-add-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAdd(cat.id);
                      }}
                    >
                      <input
                        className="bp-add-input"
                        placeholder="New tip..."
                        value={addText}
                        onChange={(e) => setAddText(e.target.value)}
                        autoFocus
                        onBlur={() => {
                          if (!addText.trim()) setAddingTo(null);
                        }}
                      />
                      <button className="btn small" type="submit">
                        Add
                      </button>
                    </form>
                  ) : (
                    <button
                      className="bp-add-btn"
                      onClick={() => {
                        setAddingTo(cat.id);
                        setAddText('');
                      }}
                    >
                      + Add tip
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {Object.keys(overrides).length > 0 && (
        <button className="bp-reset" onClick={handleReset}>
          Reset to defaults
        </button>
      )}
    </div>
  );
}

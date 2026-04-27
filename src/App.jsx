import { useState, useEffect, useMemo } from 'react';
import { scorePost } from './lib/scoring';
import { STORAGE_KEY, DRAFTS_KEY, PROFILE_KEY, INSPIRATIONS_KEY, SAMPLE_POST, loadJSON, saveJSON } from './lib/storage';
import Toolbar from './components/Toolbar';
import HookLibrary from './components/HookLibrary';
import MobileMock from './components/MobileMock';
import DesktopMock from './components/DesktopMock';
import Scorecard from './components/Scorecard';
import DraftDrawer from './components/DraftDrawer';
import ProfilePopover from './components/ProfilePopover';
import InspirationDrawer from './components/InspirationDrawer';

export default function App() {
  const [text, setText] = useState(() => {
    const saved = loadJSON(STORAGE_KEY, null);
    return saved && typeof saved === 'string' ? saved : SAMPLE_POST;
  });
  const [profile, setProfile] = useState(() =>
    loadJSON(PROFILE_KEY, { name: 'Your Name', headline: 'Your headline goes here', avatar: '' })
  );
  const [drafts, setDrafts] = useState(() => loadJSON(DRAFTS_KEY, []));
  const [inspirations, setInspirations] = useState(() => loadJSON(INSPIRATIONS_KEY, []));
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [inspirationsOpen, setInspirationsOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState(false);
  const [expandedDesktop, setExpandedDesktop] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-save
  useEffect(() => { saveJSON(STORAGE_KEY, text); }, [text]);
  useEffect(() => { saveJSON(PROFILE_KEY, profile); }, [profile]);
  useEffect(() => { saveJSON(DRAFTS_KEY, drafts); }, [drafts]);
  useEffect(() => { saveJSON(INSPIRATIONS_KEY, inspirations); }, [inspirations]);

  const score = useMemo(() => scorePost(text), [text]);
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* clipboard not available */ }
  };
  const handleClear = () => { if (confirm('Clear the editor?')) setText(''); };
  const handleSample = () => setText(SAMPLE_POST);
  const handleSaveAs = (name) => {
    const d = { id: Date.now().toString(36), name, text, savedAt: Date.now() };
    setDrafts([d, ...drafts]);
  };
  const handleLoadDraft = (d) => { setText(d.text); setDraftsOpen(false); };
  const handleDeleteDraft = (id) => setDrafts(drafts.filter((d) => d.id !== id));
  const handlePickHook = (h) => setText((t) => h + '\n\n' + t);

  const handleSaveInspiration = (entry) => {
    const item = { id: Date.now().toString(36), ...entry, savedAt: Date.now() };
    setInspirations([item, ...inspirations]);
  };
  const handleDeleteInspiration = (id) => setInspirations(inspirations.filter((i) => i.id !== id));
  const handleInsertInspiration = (content) => { setText(content); setInspirationsOpen(false); };
  const handleInsertInspirationHook = (content) => {
    const firstLine = content.split('\n')[0];
    setText((t) => firstLine + '\n\n' + t);
    setInspirationsOpen(false);
  };

  return (
    <div className="app">
      <header className="app-head">
        <div className="brand">
          <div className="brand-mark">LF</div>
          <div>
            <div className="brand-name">LinkedIn Formatter</div>
            <div className="brand-sub">Hook → Fold → Read → Comment</div>
          </div>
        </div>
        <div className="head-right">
          <div className="pill">
            <span className={`pill-dot grade-${score.grade}`} />
            Score <strong>{score.overall || 0}</strong> · {score.grade || '—'}
          </div>
        </div>
      </header>

      <main className="layout">
        {/* LEFT: editor */}
        <section className="col editor-col">
          <Toolbar
            chars={chars}
            words={words}
            onCopy={handleCopy}
            onClear={handleClear}
            onSampleLoad={handleSample}
            onOpenDrafts={() => setDraftsOpen(true)}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenInspirations={() => setInspirationsOpen(true)}
            draftCount={drafts.length}
            inspirationCount={inspirations.length}
          />
          <div className="editor-wrap">
            <textarea
              className="editor"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'Paste or write your LinkedIn post here…\n\nThe first line is your hook.\nThe first 140 characters are your fold.'}
              spellCheck
            />
            {copied && <div className="copied-toast">Copied ✓</div>}
          </div>
          <div className="editor-foot">
            <HookLibrary onPick={handlePickHook} />
          </div>
        </section>

        {/* MIDDLE: previews */}
        <section className="col preview-col">
          <div className="preview-head">
            <div className="ph-title">Live preview</div>
            <div className="ph-legend">
              <span className="lg-fold" /> fold line
              <span className="lg-faded" /> below the fold (faded — only visible after click)
            </div>
          </div>
          <div className="previews">
            <div className="preview-card">
              <div className="preview-label">Mobile · 390pt</div>
              <MobileMock
                text={text}
                profile={profile}
                expanded={expandedMobile}
                onToggle={() => setExpandedMobile(!expandedMobile)}
              />
              <button
                className="tiny-toggle"
                onClick={() => setExpandedMobile(!expandedMobile)}
              >
                {expandedMobile ? 'Show feed view' : 'Show expanded view'}
              </button>
            </div>
            <div className="preview-card">
              <div className="preview-label">Desktop · 555px column</div>
              <DesktopMock
                text={text}
                profile={profile}
                expanded={expandedDesktop}
                onToggle={() => setExpandedDesktop(!expandedDesktop)}
              />
              <button
                className="tiny-toggle"
                onClick={() => setExpandedDesktop(!expandedDesktop)}
              >
                {expandedDesktop ? 'Show feed view' : 'Show expanded view'}
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: scorecard */}
        <section className="col score-col">
          <div className="score-head">Viral readiness</div>
          <Scorecard result={score} />
        </section>
      </main>

      <DraftDrawer
        open={draftsOpen}
        onClose={() => setDraftsOpen(false)}
        drafts={drafts}
        current={text}
        onSaveAs={handleSaveAs}
        onLoad={handleLoadDraft}
        onDelete={handleDeleteDraft}
      />

      <ProfilePopover
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onChange={setProfile}
      />

      <InspirationDrawer
        open={inspirationsOpen}
        onClose={() => setInspirationsOpen(false)}
        inspirations={inspirations}
        onSave={handleSaveInspiration}
        onDelete={handleDeleteInspiration}
        onInsert={handleInsertInspiration}
        onInsertHook={handleInsertInspirationHook}
      />
    </div>
  );
}

import React from 'react';
import { DESKTOP_FOLD_CHARS } from '../lib/scoring';
import PostBody from './PostBody';

export default function DesktopMock({ text, profile, expanded, onToggle }) {
  return (
    <div className="device desktop">
      <div className="browser-bar">
        <div className="dots-row">
          <span className="d r" />
          <span className="d y" />
          <span className="d g" />
        </div>
        <div className="url">linkedin.com/feed/</div>
      </div>
      <div className="desktop-feed">
        <div className="feed-card desktop-card">
          <div className="card-head">
            <div
              className="avatar"
              style={profile.avatar ? { backgroundImage: `url(${profile.avatar})` } : {}}
            >
              {!profile.avatar && (profile.name || 'Y').slice(0, 1)}
            </div>
            <div className="who">
              <div className="name">
                {profile.name || 'Your Name'}
                <span className="badge">✓</span>
              </div>
              <div className="headline">{profile.headline || 'Your headline goes here'}</div>
              <div className="meta">now · 🌐</div>
            </div>
            <button className="follow">+ Follow</button>
          </div>
          <PostBody text={text} foldChars={DESKTOP_FOLD_CHARS} expanded={expanded} onToggle={onToggle} />
          <div className="reactions">
            <span className="reaction-stack">👍❤️💡</span>
            <span>0</span>
            <span className="spacer" />
            <span>0 comments · 0 reposts</span>
          </div>
          <div className="actions-row">
            {['Like', 'Comment', 'Repost', 'Send'].map((a) => (
              <div key={a} className="action">
                <div className="a-ico" />
                <div className="a-lab">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { MOBILE_FOLD_CHARS } from '../lib/scoring';
import PostBody from './PostBody';

export default function MobileMock({ text, profile, expanded, onToggle }) {
  return (
    <div className="device mobile">
      <div className="device-frame">
        <div className="status-bar">
          <span>9:41</span>
          <span className="status-icons">••• ◐ 87</span>
        </div>
        <div className="feed-scroll">
          <div className="feed-card">
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
              <div className="dots">⋯</div>
            </div>
            <PostBody text={text} foldChars={MOBILE_FOLD_CHARS} expanded={expanded} onToggle={onToggle} />
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
          <div className="feed-divider" />
          <div className="next-card-peek" />
        </div>
        <div className="tab-bar">
          {['Home', 'Video', 'Network', 'Notifs', 'Jobs'].map((t, i) => (
            <div key={t} className={'tab' + (i === 0 ? ' active' : '')}>
              <div className="tab-ico" />
              <div className="tab-lab">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

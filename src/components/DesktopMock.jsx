import React from 'react';
import { DESKTOP_FOLD_CHARS, DESKTOP_FOLD_CHARS_IMAGE } from '../lib/scoring';
import PostBody from './PostBody';

/* ── Inline SVG icons ── */

const LikeIcon = (
  <svg className="a-ico" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M19.46 11l-3.91-3.91a7 7 0 0 1-1.69-2.74l-.49-1.47A2.76 2.76 0 0 0 10.76 1 2.75 2.75 0 0 0 8 3.74v4.76H5.12A2.12 2.12 0 0 0 3 10.62v1.15a4.3 4.3 0 0 0 .52 2.06L5.74 18a2.27 2.27 0 0 0 2 1.17h6.5A2.75 2.75 0 0 0 17 16.42V11Z"/>
    <line x1="8" y1="10" x2="8" y2="19.17"/>
  </svg>
);

const CommentIcon = (
  <svg className="a-ico" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 9h10M7 13h6M21 12a9 9 0 0 1-9 9 9.1 9.1 0 0 1-4.42-1.15L3 21l1.15-4.58A9 9 0 1 1 21 12Z"/>
  </svg>
);

const RepostIcon = (
  <svg className="a-ico" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 2L16 4.5 13.5 7"/>
    <path d="M2.5 12.5V11a4 4 0 0 1 4-4h9.5"/>
    <path d="M10.5 22L8 19.5 10.5 17"/>
    <path d="M21.5 11.5V13a4 4 0 0 1-4 4H8"/>
  </svg>
);

const SendIcon = (
  <svg className="a-ico" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M21 3L14.5 21a.55.55 0 0 1-1 0L10 14 3 10.5a.55.55 0 0 1 0-1L21 3Z"/>
    <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round"/>
  </svg>
);

const HomeNavIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 9v2h-2v7a3 3 0 0 1-3 3h-4v-6h-4v6H6a3 3 0 0 1-3-3v-7H1V9l11-7Z"/>
  </svg>
);

const NetworkNavIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 16v6H3v-6a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3Zm5.5-3A3.5 3.5 0 1 0 14 9.5a3.5 3.5 0 0 0 3.5 3.5Zm1 2h-2a2.5 2.5 0 0 0-2.5 2.5V22h7v-4.5a2.5 2.5 0 0 0-2.5-2.5ZM7.5 2A4.5 4.5 0 1 0 12 6.5 4.49 4.49 0 0 0 7.5 2Z"/>
  </svg>
);

const JobsNavIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 6V5a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v1H2v4a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V6ZM9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9Zm13 9v4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-4h8v1a1 1 0 0 0 2 0v-1Z"/>
  </svg>
);

const MsgNavIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4H8a7 7 0 0 0 0 14h.5l4.09 3.41a1 1 0 0 0 1.41-.17c.13-.17.2-.38.2-.58V18A7 7 0 0 0 16 4Zm-3 8H8a1 1 0 0 1 0-2h5a1 1 0 0 1 0 2Zm2-4H8a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2Z"/>
  </svg>
);

const NotifNavIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 19h-8.28a2 2 0 1 1-3.44 0H2v-1a4.52 4.52 0 0 1 1.17-2.83l1-1.17h15.7l1 1.17A4.42 4.42 0 0 1 22 18ZM18.21 7.44A6.27 6.27 0 0 0 12 2a6.27 6.27 0 0 0-6.21 5.44L5 14h14Z"/>
  </svg>
);

const actionItems = [
  { label: 'Like', icon: LikeIcon },
  { label: 'Comment', icon: CommentIcon },
  { label: 'Repost', icon: RepostIcon },
  { label: 'Send', icon: SendIcon },
];

const navTabs = [
  { label: 'Home', icon: HomeNavIcon, active: true },
  { label: 'My Network', icon: NetworkNavIcon },
  { label: 'Jobs', icon: JobsNavIcon },
  { label: 'Messaging', icon: MsgNavIcon },
  { label: 'Notifications', icon: NotifNavIcon },
];

export default function DesktopMock({ text, profile, expanded, onToggle, image }) {
  const foldChars = image ? DESKTOP_FOLD_CHARS_IMAGE : DESKTOP_FOLD_CHARS;
  return (
    <div className="device desktop">
      {/* LinkedIn nav bar */}
      <div className="li-nav-desktop">
        <svg className="li-logo" width="34" height="34" viewBox="0 0 34 34">
          <rect width="34" height="34" rx="4" fill="#0a66c2"/>
          <path d="M12.15 27h-3.86V15.13h3.86Zm-1.93-13.5a2.24 2.24 0 1 1 0-4.48 2.24 2.24 0 0 1 0 4.48ZM27.34 27h-3.85v-5.77c0-1.37-.03-3.13-1.91-3.13s-2.2 1.49-2.2 3.03V27h-3.86V15.13h3.71v1.62h.05a4.07 4.07 0 0 1 3.66-2.01c3.92 0 4.64 2.58 4.64 5.93V27Z" fill="white"/>
        </svg>
        <div className="li-search-desktop">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.25" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5"/>
            <path d="M11.25 11.25L14 14" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Search</span>
        </div>
        <div className="li-nav-tabs">
          {navTabs.map(({ label, icon, active }) => (
            <div key={label} className={`li-nav-tab${active ? ' active' : ''}`}>
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
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
          <PostBody text={text} foldChars={foldChars} expanded={expanded} onToggle={onToggle} />
          {image && (
            <div className="post-image">
              <img src={image} alt="Post attachment" />
            </div>
          )}
          <div className="reactions">
            <span className="reaction-stack">
              <span className="reaction-circle like" />
              <span className="reaction-circle heart" />
              <span className="reaction-circle celebrate" />
            </span>
            <span>42</span>
            <span className="spacer" />
            <span>3 comments · 1 repost</span>
          </div>
          <div className="actions-row">
            {actionItems.map(({ label, icon }) => (
              <div key={label} className="action">
                {icon}
                <div className="a-lab">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

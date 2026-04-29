import React from 'react';
import { MOBILE_FOLD_CHARS, MOBILE_FOLD_CHARS_IMAGE } from '../lib/scoring';
import PostBody from './PostBody';

/* ── Inline SVG icons ── */

const SignalIcon = (
  <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
    <rect x="0" y="9" width="3" height="3" rx=".5"/>
    <rect x="4.5" y="6" width="3" height="6" rx=".5"/>
    <rect x="9" y="3" width="3" height="9" rx=".5"/>
    <rect x="13.5" y="0" width="3" height="12" rx=".5"/>
  </svg>
);

const WifiIcon = (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <circle cx="8" cy="10.5" r="1" fill="currentColor" stroke="none"/>
    <path d="M5.17 8.33a4 4 0 0 1 5.66 0"/>
    <path d="M2.93 6.1a7 7 0 0 1 10.14 0"/>
    <path d="M.7 3.87A10 10 0 0 1 15.3 3.87"/>
  </svg>
);

const BatteryIcon = (
  <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
    <rect x=".5" y=".5" width="22" height="11" rx="2" stroke="currentColor"/>
    <rect x="2" y="2" width="16" height="8" rx="1" fill="currentColor"/>
    <path d="M24 4v4a2 2 0 0 0 0-4Z" fill="currentColor" opacity=".4"/>
  </svg>
);

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

const HomeIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 9v2h-2v7a3 3 0 0 1-3 3h-4v-6h-4v6H6a3 3 0 0 1-3-3v-7H1V9l11-7Z"/>
  </svg>
);

const VideoIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 3H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-6.5 9.84-4 2.6A1 1 0 0 1 9 14.6V9.4a1 1 0 0 1 1.5-.84l4 2.6a1 1 0 0 1 0 1.68Z"/>
  </svg>
);

const NetworkIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 16v6H3v-6a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3Zm5.5-3A3.5 3.5 0 1 0 14 9.5a3.5 3.5 0 0 0 3.5 3.5Zm1 2h-2a2.5 2.5 0 0 0-2.5 2.5V22h7v-4.5a2.5 2.5 0 0 0-2.5-2.5ZM7.5 2A4.5 4.5 0 1 0 12 6.5 4.49 4.49 0 0 0 7.5 2Z"/>
  </svg>
);

const NotifIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 19h-8.28a2 2 0 1 1-3.44 0H2v-1a4.52 4.52 0 0 1 1.17-2.83l1-1.17h15.7l1 1.17A4.42 4.42 0 0 1 22 18ZM18.21 7.44A6.27 6.27 0 0 0 12 2a6.27 6.27 0 0 0-6.21 5.44L5 14h14Z"/>
  </svg>
);

const JobsIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 6V5a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v1H2v4a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V6ZM9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9Zm13 9v4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-4h8v1a1 1 0 0 0 2 0v-1Z"/>
  </svg>
);

const actionItems = [
  { label: 'Like', icon: LikeIcon },
  { label: 'Comment', icon: CommentIcon },
  { label: 'Repost', icon: RepostIcon },
  { label: 'Send', icon: SendIcon },
];

const tabItems = [
  { label: 'Home', icon: HomeIcon },
  { label: 'Video', icon: VideoIcon },
  { label: 'My Network', icon: NetworkIcon },
  { label: 'Notifications', icon: NotifIcon },
  { label: 'Jobs', icon: JobsIcon },
];

export default function MobileMock({ text, profile, expanded, onToggle, image }) {
  const foldChars = image ? MOBILE_FOLD_CHARS_IMAGE : MOBILE_FOLD_CHARS;
  return (
    <div className="device mobile">
      <div className="device-frame">
        {/* iPhone status bar */}
        <div className="status-bar">
          <span className="sb-time">9:41</span>
          <span className="sb-notch" />
          <span className="sb-icons">{SignalIcon}{WifiIcon}{BatteryIcon}</span>
        </div>

        {/* LinkedIn header */}
        <div className="li-header-mobile">
          <svg className="li-logo" width="26" height="26" viewBox="0 0 24 24">
            <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5v-9h3ZM6.5 8.25A1.75 1.75 0 1 1 6.5 4.8a1.75 1.75 0 0 1 0 3.45ZM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66Z" fill="#0a66c2"/>
          </svg>
          <div className="li-search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.25" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5"/>
              <path d="M11.25 11.25L14 14" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Search</span>
          </div>
          <svg className="li-msg-icon" width="24" height="24" viewBox="0 0 24 24" fill="rgba(0,0,0,0.6)">
            <path d="M16 4H8a7 7 0 0 0 0 14h.5l4.09 3.41a1 1 0 0 0 1.41-.17c.13-.17.2-.38.2-.58V18A7 7 0 0 0 16 4Zm-3 8H8a1 1 0 0 1 0-2h5a1 1 0 0 1 0 2Zm2-4H8a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2Z"/>
          </svg>
        </div>

        {/* Feed */}
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
              <span className="li-following-tag">Following</span>
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
          <div className="feed-divider" />
          <div className="next-card-peek" />
        </div>

        {/* Bottom tab bar */}
        <div className="tab-bar">
          {tabItems.map((t, i) => (
            <div key={t.label} className={'tab' + (i === 0 ? ' active' : '')}>
              <div className="tab-ico">{t.icon}</div>
              <div className="tab-lab">{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

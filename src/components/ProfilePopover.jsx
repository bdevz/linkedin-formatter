import React from 'react';

export default function ProfilePopover({ profile, onChange, open, onClose }) {
  if (!open) return null;

  return (
    <div className="pop-shell" onClick={onClose}>
      <div className="pop" onClick={(e) => e.stopPropagation()}>
        <div className="pop-title">Your profile</div>
        <label>
          Name
          <input
            value={profile.name}
            onChange={(e) => onChange({ ...profile, name: e.target.value })}
          />
        </label>
        <label>
          Headline
          <input
            value={profile.headline}
            onChange={(e) => onChange({ ...profile, headline: e.target.value })}
          />
        </label>
        <label>
          Avatar (paste image URL or upload)
          <input
            value={profile.avatar || ''}
            placeholder="https://…"
            onChange={(e) => onChange({ ...profile, avatar: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (!f) return;
              const r = new FileReader();
              r.onload = () => onChange({ ...profile, avatar: r.result });
              r.readAsDataURL(f);
            }}
          />
        </label>
        <button className="btn" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

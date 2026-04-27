import React, { useState } from 'react';
import { hookLibrary } from '../lib/hook-library';

export default function HookLibrary({ onPick }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={'hook-lib' + (open ? ' open' : '')}>
      <button className="lib-toggle" onClick={() => setOpen(!open)}>
        {open ? '× Close hook library' : '✦ Hook library'}
      </button>
      {open && (
        <div className="lib-body">
          {hookLibrary.map((cat) => (
            <div key={cat.category} className="lib-cat">
              <div className="lib-cat-name">{cat.category}</div>
              {cat.examples.map((ex, i) => (
                <button key={i} className="lib-ex" onClick={() => onPick(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

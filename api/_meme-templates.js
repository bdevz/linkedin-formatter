// Server-side counterpart to src/lib/meme-templates.js. Kept as a sibling
// `_*.js` file (mirrors _humanizer.js) so Vercel bundles it with the function.

export const MEME_TEMPLATES = [
  { id: 'drake',    name: 'Drake',                  blurb: 'reject / approve' },
  { id: 'ds',       name: 'Distracted Boyfriend',   blurb: 'tempted by the new shiny' },
  { id: 'ants',     name: 'Two Buttons',            blurb: 'impossible choice' },
  { id: 'gb',       name: 'Expanding Brain',        blurb: 'galaxy-brain escalation' },
  { id: 'fine',     name: 'This Is Fine',           blurb: 'everything is on fire' },
  { id: 'cmm',      name: 'Change My Mind',         blurb: 'spicy take, sit down' },
  { id: 'pigeon',   name: 'Is This A Pigeon?',      blurb: 'confidently wrong' },
  { id: 'fry',      name: 'Not Sure If…',           blurb: 'suspicious squint' },
  { id: 'rollsafe', name: 'Roll Safe',              blurb: 'big-brain workaround' },
  { id: 'success',  name: 'Success Kid',            blurb: 'small win, big energy' },
  { id: 'bs',       name: 'Bernie Asking',          blurb: 'i am once again asking' },
  { id: 'spongebob',name: 'Mocking SpongeBob',      blurb: 'sArCaStIc QuOtE' },
];

export const MEME_TEMPLATE_IDS = MEME_TEMPLATES.map((t) => t.id);

// memegen.link path-encoding rules. See https://memegen.link/docs/
//   space -> _   underscore -> __   dash -> --   ? -> ~q   & -> ~a
//   % -> ~p   # -> ~h   / -> ~s   \ -> ~b   < -> ~l   > -> ~g
//   " -> ''   newline -> ~n
export function encodeMemeText(text) {
  if (!text) return '_';
  return String(text)
    .replace(/_/g, '__')
    .replace(/-/g, '--')
    .replace(/ /g, '_')
    .replace(/\?/g, '~q')
    .replace(/&/g, '~a')
    .replace(/%/g, '~p')
    .replace(/#/g, '~h')
    .replace(/\//g, '~s')
    .replace(/\\/g, '~b')
    .replace(/</g, '~l')
    .replace(/>/g, '~g')
    .replace(/"/g, "''")
    .replace(/\n/g, '~n');
}

export function buildMemeUrl(template, top, bottom) {
  return `https://api.memegen.link/images/${template}/${encodeMemeText(top)}/${encodeMemeText(bottom)}.png`;
}

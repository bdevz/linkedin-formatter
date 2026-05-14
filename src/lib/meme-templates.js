// Display-only metadata for the Meme Mode UI (used to show the template
// name next to the generated meme). The server (api/_meme-templates.js)
// owns the canonical list, encoding, and URL building.

export const MEME_TEMPLATES = [
  { id: 'drake',    name: 'Drake' },
  { id: 'ds',       name: 'Distracted Boyfriend' },
  { id: 'ants',     name: 'Two Buttons' },
  { id: 'gb',       name: 'Expanding Brain' },
  { id: 'fine',     name: 'This Is Fine' },
  { id: 'cmm',      name: 'Change My Mind' },
  { id: 'pigeon',   name: 'Is This A Pigeon?' },
  { id: 'fry',      name: 'Not Sure If…' },
  { id: 'rollsafe', name: 'Roll Safe' },
  { id: 'success',  name: 'Success Kid' },
  { id: 'bs',       name: 'Bernie Asking' },
  { id: 'spongebob',name: 'Mocking SpongeBob' },
];

export function memeTemplateName(id) {
  return MEME_TEMPLATES.find((t) => t.id === id)?.name || id;
}

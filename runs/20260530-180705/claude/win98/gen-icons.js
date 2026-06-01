/* Generates Windows-98-style SVG icons into ./icons */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'icons');
fs.mkdirSync(dir, { recursive: true });

const S = 48; // viewbox
const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" shape-rendering="crispEdges">`;
const foot = `</svg>`;
// emoji-based focal icon helper (smooth rendering for the glyph)
const glyph = (g, size=34, y=37) =>
  `<text x="24" y="${y}" font-size="${size}" text-anchor="middle" shape-rendering="auto">${g}</text>`;

const icons = {
  // --- computer / monitor ---
  computer: head + `
    <rect x="6" y="8" width="36" height="26" rx="2" fill="#c0c0c0" stroke="#000"/>
    <rect x="9" y="11" width="30" height="20" fill="#0a7"/>
    <rect x="9" y="11" width="30" height="20" fill="url(#g1)" opacity=".4"/>
    <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#088"/></linearGradient></defs>
    <rect x="16" y="34" width="16" height="4" fill="#808080"/>
    <rect x="10" y="38" width="28" height="5" rx="1" fill="#c0c0c0" stroke="#000"/>
    <circle cx="34" cy="40.5" r="1.2" fill="#0a0"/>` + foot,

  // --- floppy ---
  floppy: head + `
    <rect x="8" y="8" width="32" height="32" rx="1" fill="#1a1a8a" stroke="#000"/>
    <rect x="14" y="8" width="14" height="12" fill="#111"/>
    <rect x="22" y="9" width="4" height="10" fill="#888"/>
    <rect x="12" y="24" width="24" height="14" fill="#dcdce6"/>
    <rect x="15" y="27" width="14" height="8" fill="#fff" stroke="#999"/>` + foot,

  // --- hard drive ---
  drive: head + `
    <rect x="8" y="16" width="32" height="18" rx="2" fill="#d8d8d8" stroke="#000"/>
    <rect x="8" y="16" width="32" height="9" fill="#bdbdbd"/>
    <rect x="12" y="28" width="14" height="3" fill="#888"/>
    <circle cx="34" cy="29.5" r="1.6" fill="#0a0"/>` + foot,

  // --- cd-rom ---
  cd: head + `
    <circle cx="24" cy="22" r="16" fill="#ccc" stroke="#888"/>
    <circle cx="24" cy="22" r="16" fill="url(#cd)" opacity=".7"/>
    <circle cx="24" cy="22" r="4" fill="#fff" stroke="#888"/>
    <defs><linearGradient id="cd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0f"/><stop offset=".5" stop-color="#0ff"/><stop offset="1" stop-color="#ff0"/></linearGradient></defs>` + foot,

  // --- folder ---
  folder: head + `
    <path d="M6 14 h12 l4 4 h20 v22 h-36 z" fill="#ffd34d" stroke="#a8842a"/>
    <path d="M6 18 h40 v22 h-40 z" fill="#ffdf7e" stroke="#a8842a"/>` + foot,

  // --- recycle bin ---
  recycle: head + glyph('🗑️', 36, 38) + foot,
  // --- notepad ---
  notepad: head + `
    <rect x="11" y="6" width="26" height="36" fill="#fff" stroke="#000"/>
    <rect x="11" y="6" width="26" height="5" fill="#2a5db0"/>
    <line x1="15" y1="16" x2="33" y2="16" stroke="#36c"/>
    <line x1="15" y1="21" x2="33" y2="21" stroke="#999"/>
    <line x1="15" y1="26" x2="33" y2="26" stroke="#999"/>
    <line x1="15" y1="31" x2="29" y2="31" stroke="#999"/>` + foot,

  // --- paint ---
  paint: head + glyph('🎨', 36, 38) + foot,
  // --- calculator ---
  calc: head + `
    <rect x="10" y="6" width="28" height="36" rx="2" fill="#dcdcdc" stroke="#000"/>
    <rect x="14" y="10" width="20" height="8" fill="#9fd39f" stroke="#555"/>
    ${[0,1,2,3].map(r=>[0,1,2].map(c=>`<rect x="${14+c*7}" y="${22+r*5}" width="5" height="3.5" fill="#777"/>`).join('')).join('')}` + foot,

  // --- minesweeper ---
  mines: head + glyph('💣', 34, 37) + foot,
  // --- media player ---
  media: head + `
    <circle cx="24" cy="24" r="18" fill="#1769c9" stroke="#0a3a7a"/>
    <polygon points="19,15 35,24 19,33" fill="#fff"/>` + foot,

  // --- internet explorer ---
  ie: head + `
    <circle cx="24" cy="24" r="17" fill="#1f7fd4"/>
    <ellipse cx="24" cy="24" rx="17" ry="7" fill="none" stroke="#ffd400" stroke-width="3"/>
    <path d="M9 20 q15 -10 30 0" fill="none" stroke="#ffd400" stroke-width="3"/>
    <text x="24" y="31" font-size="16" text-anchor="middle" fill="#fff" font-family="Georgia" font-style="italic" font-weight="bold">e</text>` + foot,

  // --- start menu items ---
  programs: head + `
    <rect x="9" y="12" width="30" height="26" rx="2" fill="#d8d8d8" stroke="#000"/>
    <rect x="14" y="8" width="6" height="6" fill="#e33"/><rect x="22" y="8" width="6" height="6" fill="#2c2"/>` + foot,
  settings: head + glyph('⚙️', 34, 37) + foot,
  find:     head + glyph('🔍', 32, 36) + foot,
  help:     head + glyph('❓', 32, 37) + foot,
  run:      head + glyph('🏃', 32, 37) + foot,
  shutdown: head + `
    <circle cx="24" cy="24" r="14" fill="#d33" stroke="#811"/>
    <rect x="22" y="11" width="4" height="14" fill="#fff"/>
    <path d="M16 18 a11 11 0 1 0 16 0" fill="none" stroke="#fff" stroke-width="3"/>` + foot,
  sound: head + `
    <polygon points="10,20 16,20 22,14 22,34 16,28 10,28" fill="#333"/>
    <path d="M26 18 q5 6 0 12" fill="none" stroke="#333" stroke-width="2"/>
    <path d="M30 14 q9 10 0 20" fill="none" stroke="#333" stroke-width="2"/>` + foot,
};

let n = 0;
for (const [name, svg] of Object.entries(icons)) {
  fs.writeFileSync(path.join(dir, name + '.svg'), svg.trim());
  n++;
}
console.log('Wrote ' + n + ' icons to ' + dir);

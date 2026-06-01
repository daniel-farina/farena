# Windows 98 HTML Clone

A highly authentic recreation of Windows 98 in a single HTML file (or folder).

## Features
- Classic boot sequence with progress bar
- Authentic 90s UI: 3D beveled buttons, title bars, silver taskbar
- Draggable + resizable windows with minimize/maximize/close
- Working **Start Menu** with cascading submenus
- Right-click context menus on desktop + icons
- Live updating taskbar clock + volume popup
- **6 fully functional applications**:
  - Notepad (with find, edit, multiple docs)
  - MS Paint (pencil, brush, eraser, shapes, flood fill, color palette, save)
  - Calculator (full keyboard support, memory functions)
  - Minesweeper (real game logic, timer, smiley, win/lose)
  - Internet Explorer (fake nostalgic 90s web navigation)
  - Windows Explorer / My Computer (fake folder navigation)
- Original **procedural retro sounds** (boot chime, clicks, dings, errors, minimize etc.)
- CRT scanline effect
- Display Properties (wallpaper switching)
- Shut Down dialog + classic "It is now safe..." screen
- Run dialog (Win+R style)
- Recycle Bin that fills when you win Minesweeper

## How to use

### Easiest (Recommended)
1. Open a terminal in this folder
2. Run: `python3 -m http.server 8080`
3. Open http://localhost:8080 in your browser

All sounds, icons, and wallpaper work perfectly.

### Bonus: Single-file version
Try `windows98-standalone.html` (assets are partially inlined as data URIs). Open directly in a browser. Some sounds may be missing due to inlining complexity — the served folder version is the best experience.

## Controls & Tips
- Double-click desktop icons to open apps
- Drag windows by title bar, resize from bottom-right corner
- F1 key opens Help
- Cmd/Ctrl + R opens Run dialog
- Win key not mapped (browser limitation) — use the Start button
- Minesweeper: Left click to reveal, Right click to flag. Click smiley to restart.

## Technical notes
- Pure vanilla HTML + CSS + JS. No frameworks.
- All sounds generated with Python + math (8-bit 11kHz retro lo-fi).
- Icons and wallpaper generated via AI image model then downscaled to authentic sizes.
- Designed for fun and nostalgia — not 100% bug-free or complete.

Enjoy your trip back to 1998!

Made with care by Grok.

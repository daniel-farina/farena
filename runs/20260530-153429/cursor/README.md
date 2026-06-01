# Windows 98 HTML Clone

A nostalgic recreation of Microsoft Windows 98 in pure HTML, CSS, and JavaScript.

## Features

- Boot splash screen with progress bar and startup chime
- Desktop with draggable icons and marquee selection
- Start menu with cascading Programs submenu
- Taskbar with running apps, system tray, and live clock
- Window management: drag, minimize, maximize, close
- Right-click context menus
- Synthesized sound effects via Web Audio API

## Applications

- **My Computer** — File explorer with drives and folders
- **Recycle Bin** — Empty bin view
- **Internet Explorer** — Retro web pages with working links
- **Notepad** — Editable text with menu bar
- **Minesweeper** — Fully playable 9×9 game

## Run

Open `index.html` in a browser, or serve locally:

```bash
cd win98
python3 -m http.server 8080
```

Then visit http://localhost:8080

Click anywhere after boot to enable audio (browser autoplay policy).

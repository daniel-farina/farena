# Windows 98 — HTML clone

A faithful, fully interactive recreation of the Windows 98 desktop using only
**HTML, CSS, and vanilla JavaScript**. No frameworks, no external assets — even
the icons are generated SVGs and every sound is synthesized live with the
**Web Audio API**.

## Run it

Open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8098
# then visit http://localhost:8098/index.html
```

Click anywhere once to enable sound (browser autoplay policy), then enjoy the
startup chime.

## Features

- **Boot sequence** — Award BIOS POST screen → animated Windows 98 boot splash
  with the startup sound → desktop.
- **Window manager** — draggable, focusable, with working minimize / maximize /
  close, z-ordering, taskbar buttons, and an active/inactive title-bar gradient.
- **Start menu** — with the vertical "Windows 98" banner, Programs submenu, and a
  working Shut Down dialog.
- **Taskbar** — Start button, Quick Launch, live clock, system tray, volume.
- **Applications (all functional):**
  - **Notepad** — editable text
  - **Paint** — pencil/brush/fill/line/rect/ellipse/eraser/text + color palette
  - **Calculator** — real arithmetic, sqrt, 1/x, %, +/-
  - **Minesweeper** — fully playable, flags, timer, win/lose, sounds
  - **My Computer / My Documents / Recycle Bin** — explorer windows
  - **Internet Explorer** — retro MSN.com page with marquee & visitor counter
  - **Windows Media Player** — animated visualizer that plays a synth tune
- **Sound** — startup chime, UI clicks, open/close, error ding, Minesweeper
  explosion & victory fanfare, shutdown jingle — all generated in code.

## Showcase

Run the automated tour, which boots the OS and opens each application ~2s apart,
capturing screenshots into `shots/`:

```bash
npm install            # installs puppeteer-core
node drive.js          # requires Google Chrome installed
open gallery.html      # view the captured showcase
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | markup: boot screens, desktop, taskbar, start menu |
| `style.css`  | all the Win98 chrome (bevels, gradients, scrollbars) |
| `sound.js`   | Web Audio sound engine |
| `apps.js`    | application definitions & logic |
| `os.js`      | boot sequence, window manager, taskbar, auto-tour |
| `gen-icons.js` | generates the SVG icon set into `icons/` |
| `drive.js`   | headless-Chrome showcase driver |
| `gallery.html` | screenshot gallery of the showcase |

Add `#notour` to the URL to disable the auto-tour on load.

/* ===================================================================
   apps.js — application definitions for the Win98 clone.
   Each app: { title, icon, w, h, menu?, status?, init(body, win) }
   `WM` (window manager) and `Sound` are globals provided elsewhere.
=================================================================== */
const Apps = {};

/* ---------------------------------------------------------------- *
 *  NOTEPAD
 * ---------------------------------------------------------------- */
Apps.notepad = {
  title: "Untitled - Notepad", icon: "📝", w: 460, h: 320,
  menu: ["File", "Edit", "Search", "Help"],
  init(body) {
    const ta = document.createElement("textarea");
    ta.className = "notepad-area w98";
    ta.spellcheck = false;
    ta.value = "Welcome to Notepad.\r\n\r\nThis is a faithful little corner of Windows 98, rebuilt in your browser.\r\n\r\nTry the Start menu, play Minesweeper, draw in Paint, or open the MS-DOS Prompt and type HELP.\r\n";
    body.appendChild(ta);
    ta.addEventListener("keydown", () => Sound.play("type"));
    setTimeout(() => ta.focus(), 50);
  }
};

/* ---------------------------------------------------------------- *
 *  MY COMPUTER / EXPLORER
 * ---------------------------------------------------------------- */
Apps.mycomputer = {
  title: "My Computer", icon: "💻", w: 480, h: 340,
  menu: ["File", "Edit", "View", "Help"],
  status: ["5 object(s)", "My Computer"],
  init(body) {
    const items = [
      { i: "💾", l: "3½ Floppy (A:)" },
      { i: "🖴", l: "(C:)" },
      { i: "💿", l: "(D:)" },
      { i: "🖨️", l: "Printers", app: null },
      { i: "🎛️", l: "Control Panel", app: "controlpanel" },
    ];
    const grid = document.createElement("div");
    grid.className = "explorer-grid";
    items.forEach(it => {
      const el = document.createElement("div");
      el.className = "exp-item";
      el.innerHTML = `<div class="exp-ico">${it.i}</div><div class="exp-label">${it.l}</div>`;
      el.ondblclick = () => {
        Sound.play("open");
        if (it.app) WM.launch(it.app);
        else WM.dialog("My Computer", `${it.l}\n\nThis drive is part of the simulation and has no contents to display.`, "info");
      };
      grid.appendChild(el);
    });
    body.appendChild(grid);
  }
};

Apps.controlpanel = {
  title: "Control Panel", icon: "🎛️", w: 460, h: 300,
  menu: ["File", "Edit", "View", "Help"],
  init(body) {
    const grid = document.createElement("div");
    grid.className = "explorer-grid";
    [["🖥️","Display"],["🔊","Sounds"],["🖱️","Mouse"],["⌨️","Keyboard"],
     ["📅","Date/Time"],["🌐","Internet"],["➕","Add/Remove"],["🎮","Game Controllers"]]
      .forEach(([i,l]) => {
        const el = document.createElement("div");
        el.className = "exp-item";
        el.innerHTML = `<div class="exp-ico">${i}</div><div class="exp-label">${l}</div>`;
        el.ondblclick = () => { Sound.play("ding"); WM.dialog(l, `${l} Properties\n\nThese settings are part of the simulation.`, "info"); };
        grid.appendChild(el);
      });
    body.appendChild(grid);
  }
};

/* ---------------------------------------------------------------- *
 *  MINESWEEPER
 * ---------------------------------------------------------------- */
Apps.minesweeper = {
  title: "Minesweeper", icon: "💣", w: 220, h: 290,
  menu: ["Game", "Help"],
  init(body, win) {
    const ROWS = 9, COLS = 9, MINES = 10;
    let grid = [], revealed = 0, flags = 0, dead = false, won = false, started = false, timer = 0, tHandle = null;

    const wrap = document.createElement("div");
    wrap.className = "ms-wrap";
    wrap.innerHTML = `
      <div class="ms-head">
        <div class="ms-counter" id="ms-mines">010</div>
        <div class="ms-face" id="ms-face">🙂</div>
        <div class="ms-counter" id="ms-time">000</div>
      </div>
      <div class="ms-grid" id="ms-grid" style="grid-template-columns:repeat(${COLS},20px)"></div>`;
    body.appendChild(wrap);

    const gEl = wrap.querySelector("#ms-grid");
    const faceEl = wrap.querySelector("#ms-face");
    const mineEl = wrap.querySelector("#ms-mines");
    const timeEl = wrap.querySelector("#ms-time");
    const pad = n => String(Math.max(0, Math.min(999, n))).padStart(3, "0");

    function build() {
      grid = []; revealed = 0; flags = 0; dead = false; won = false; started = false; timer = 0;
      clearInterval(tHandle); tHandle = null;
      mineEl.textContent = pad(MINES); timeEl.textContent = "000"; faceEl.textContent = "🙂";
      gEl.innerHTML = "";
      for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
          const cell = { mine: false, n: 0, open: false, flag: false, el: document.createElement("div") };
          cell.el.className = "ms-cell";
          cell.el.oncontextmenu = e => { e.preventDefault(); flag(r, c); };
          cell.el.onmousedown = e => {
            if (dead || won) return;
            if (e.button === 0 && !cell.flag) faceEl.textContent = "😮";
          };
          cell.el.onmouseup = e => {
            if (e.button === 0) reveal(r, c);
          };
          grid[r][c] = cell;
          gEl.appendChild(cell.el);
        }
      }
    }

    function placeMines(sr, sc) {
      let placed = 0;
      while (placed < MINES) {
        const r = Math.floor(Math.random() * ROWS), c = Math.floor(Math.random() * COLS);
        if (grid[r][c].mine || (Math.abs(r - sr) <= 1 && Math.abs(c - sc) <= 1)) continue;
        grid[r][c].mine = true; placed++;
      }
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].mine) n++;
        }
        grid[r][c].n = n;
      }
    }

    function reveal(r, c) {
      if (dead || won) return;
      const cell = grid[r][c];
      if (cell.open || cell.flag) { faceEl.textContent = "🙂"; return; }
      if (!started) { started = true; placeMines(r, c); tHandle = setInterval(tick, 1000); }
      cell.open = true; cell.el.classList.add("revealed"); revealed++;
      if (cell.mine) { boom(r, c); return; }
      if (cell.n > 0) { cell.el.textContent = cell.n; cell.el.classList.add("ms-c" + cell.n); }
      else { // flood fill
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !grid[nr][nc].open) reveal(nr, nc);
        }
      }
      faceEl.textContent = "🙂";
      Sound.play("click");
      checkWin();
    }

    function flag(r, c) {
      if (dead || won) return;
      const cell = grid[r][c];
      if (cell.open) return;
      cell.flag = !cell.flag;
      cell.el.textContent = cell.flag ? "🚩" : "";
      flags += cell.flag ? 1 : -1;
      mineEl.textContent = pad(MINES - flags);
      Sound.play("menu");
    }

    function boom(br, bc) {
      dead = true; clearInterval(tHandle);
      faceEl.textContent = "😵";
      Sound.play("explode");
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        if (cell.mine) { cell.el.classList.add("revealed"); cell.el.textContent = "💣"; }
        if (r === br && c === bc) cell.el.classList.add("mine");
      }
    }

    function checkWin() {
      if (revealed === ROWS * COLS - MINES && !dead) {
        won = true; clearInterval(tHandle); faceEl.textContent = "😎";
        Sound.play("tada");
      }
    }

    function tick() { timer++; timeEl.textContent = pad(timer); }

    faceEl.onclick = () => { Sound.play("click"); build(); };
    win._menuHandler = m => { if (m === "Game") build(); };
    build();
  }
};

/* ---------------------------------------------------------------- *
 *  CALCULATOR
 * ---------------------------------------------------------------- */
Apps.calc = {
  title: "Calculator", icon: "🧮", w: 200, h: 220,
  menu: ["Edit", "View", "Help"],
  init(body) {
    let cur = "0", prev = null, op = null, fresh = true;
    const wrap = document.createElement("div");
    wrap.className = "calc-wrap";
    const disp = document.createElement("div");
    disp.className = "calc-display"; disp.textContent = "0";
    wrap.appendChild(disp);
    const grid = document.createElement("div");
    grid.className = "calc-grid";
    wrap.appendChild(grid);
    body.appendChild(wrap);

    const keys = [
      ["MC","fn"],["7"],["8"],["9"],["/","op"],
      ["MR","fn"],["4"],["5"],["6"],["*","op"],
      ["MS","fn"],["1"],["2"],["3"],["-","op"],
      ["C","fn"],["0"],["."],["=","eq"],["+","op"],
    ];
    let mem = 0;
    const upd = () => disp.textContent = String(cur).slice(0, 15);

    function compute() {
      const a = parseFloat(prev), b = parseFloat(cur);
      let r = b;
      if (op === "+") r = a + b; if (op === "-") r = a - b;
      if (op === "*") r = a * b; if (op === "/") r = b === 0 ? "Error" : a / b;
      cur = (typeof r === "number") ? String(Math.round(r * 1e10) / 1e10) : r;
    }

    keys.forEach(([k, cls]) => {
      const b = document.createElement("button");
      b.className = "calc-btn" + (cls ? " " + cls : "");
      b.textContent = k;
      b.onclick = () => {
        Sound.play("click");
        if (/[0-9]/.test(k)) { cur = fresh ? k : (cur === "0" ? k : cur + k); fresh = false; }
        else if (k === ".") { if (fresh) { cur = "0."; fresh = false; } else if (!cur.includes(".")) cur += "."; }
        else if (k === "C") { cur = "0"; prev = null; op = null; fresh = true; }
        else if (k === "=") { if (op !== null) { compute(); op = null; prev = null; fresh = true; } }
        else if (k === "MC") mem = 0;
        else if (k === "MR") { cur = String(mem); fresh = true; }
        else if (k === "MS") mem = parseFloat(cur);
        else { if (op !== null && !fresh) compute(); prev = cur; op = k; fresh = true; }
        upd();
      };
      grid.appendChild(b);
    });
  }
};

/* ---------------------------------------------------------------- *
 *  PAINT
 * ---------------------------------------------------------------- */
Apps.paint = {
  title: "untitled - Paint", icon: "🎨", w: 480, h: 380,
  menu: ["File", "Edit", "View", "Image", "Help"],
  init(body, win) {
    let color = "#000000", tool = "pencil", drawing = false, sx = 0, sy = 0, snapshot = null;
    const wrap = document.createElement("div"); wrap.style.cssText = "display:flex;flex-direction:column;flex:1;overflow:hidden";
    const top = document.createElement("div"); top.className = "paint-wrap";

    const tools = document.createElement("div"); tools.className = "paint-tools";
    [["pencil","✏️"],["brush","🖌️"],["line","╱"],["rect","▭"],["ellipse","◯"],
     ["fill","🪣"],["eraser","🧽"],["spray","💨"]]
      .forEach(([t, ic]) => {
        const b = document.createElement("div"); b.className = "paint-tool" + (t === tool ? " active" : "");
        b.textContent = ic; b.title = t;
        b.onclick = () => { tool = t; Sound.play("click"); tools.querySelectorAll(".paint-tool").forEach(x => x.classList.remove("active")); b.classList.add("active"); };
        tools.appendChild(b);
      });
    top.appendChild(tools);

    const host = document.createElement("div"); host.className = "paint-canvas-area"; host.id = "paint-canvas-host";
    const canvas = document.createElement("canvas"); canvas.width = 360; canvas.height = 240;
    const cx = canvas.getContext("2d");
    cx.fillStyle = "#fff"; cx.fillRect(0, 0, canvas.width, canvas.height);
    host.appendChild(canvas); top.appendChild(host);
    wrap.appendChild(top);

    const pal = document.createElement("div"); pal.className = "paint-palette";
    const curSw = document.createElement("div"); curSw.className = "pp-current"; curSw.style.background = color;
    pal.appendChild(curSw);
    ["#000000","#808080","#800000","#808000","#008000","#008080","#000080","#800080",
     "#808040","#004040","#0080ff","#004080","#8000ff","#804000","#ffffff","#c0c0c0",
     "#ff0000","#ffff00","#00ff00","#00ffff","#0000ff","#ff00ff","#ffff80","#00ff80"]
      .forEach(c => {
        const s = document.createElement("div"); s.className = "pp-swatch"; s.style.background = c;
        s.onclick = () => { color = c; curSw.style.background = c; Sound.play("menu"); };
        pal.appendChild(s);
      });
    wrap.appendChild(pal);
    body.appendChild(wrap);

    const pos = e => { const r = canvas.getBoundingClientRect(); return { x: Math.round((e.clientX - r.left) * canvas.width / r.width), y: Math.round((e.clientY - r.top) * canvas.height / r.height) }; };

    function floodFill(x, y, fill) {
      const img = cx.getImageData(0, 0, canvas.width, canvas.height);
      const d = img.data; const W = canvas.width, H = canvas.height;
      const idx = (x, y) => (y * W + x) * 4;
      const tc = [d[idx(x,y)], d[idx(x,y)+1], d[idx(x,y)+2], d[idx(x,y)+3]];
      const fc = hexToRgb(fill);
      if (tc[0]===fc[0]&&tc[1]===fc[1]&&tc[2]===fc[2]) return;
      const st = [[x,y]];
      while (st.length) {
        const [cxp, cyp] = st.pop();
        if (cxp<0||cyp<0||cxp>=W||cyp>=H) continue;
        const i = idx(cxp,cyp);
        if (d[i]!==tc[0]||d[i+1]!==tc[1]||d[i+2]!==tc[2]||d[i+3]!==tc[3]) continue;
        d[i]=fc[0]; d[i+1]=fc[1]; d[i+2]=fc[2]; d[i+3]=255;
        st.push([cxp+1,cyp],[cxp-1,cyp],[cxp,cyp+1],[cxp,cyp-1]);
      }
      cx.putImageData(img, 0, 0);
    }
    function hexToRgb(h){ return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]; }

    canvas.onmousedown = e => {
      const p = pos(e); drawing = true; sx = p.x; sy = p.y;
      if (tool === "fill") { floodFill(p.x, p.y, color); drawing = false; Sound.play("ding"); return; }
      snapshot = cx.getImageData(0, 0, canvas.width, canvas.height);
      cx.strokeStyle = color; cx.fillStyle = color;
      cx.lineWidth = tool === "brush" ? 5 : (tool === "eraser" ? 12 : 1);
      cx.lineCap = "round"; cx.lineJoin = "round";
      if (tool === "pencil" || tool === "brush" || tool === "eraser") { cx.beginPath(); cx.moveTo(p.x, p.y); }
      if (tool === "eraser") cx.strokeStyle = "#fff";
    };
    canvas.onmousemove = e => {
      if (!drawing) return; const p = pos(e);
      if (tool === "pencil" || tool === "brush" || tool === "eraser") { cx.lineTo(p.x, p.y); cx.stroke(); }
      else if (tool === "spray") { for (let i=0;i<14;i++){ const a=Math.random()*6.28, rr=Math.random()*9; cx.fillRect(p.x+Math.cos(a)*rr, p.y+Math.sin(a)*rr, 1, 1);} }
      else { // shape preview
        cx.putImageData(snapshot, 0, 0);
        cx.beginPath();
        if (tool === "line") { cx.moveTo(sx, sy); cx.lineTo(p.x, p.y); cx.stroke(); }
        else if (tool === "rect") cx.strokeRect(Math.min(sx,p.x), Math.min(sy,p.y), Math.abs(p.x-sx), Math.abs(p.y-sy));
        else if (tool === "ellipse") { cx.ellipse((sx+p.x)/2,(sy+p.y)/2,Math.abs(p.x-sx)/2,Math.abs(p.y-sy)/2,0,0,6.29); cx.stroke(); }
      }
    };
    window.addEventListener("mouseup", () => { drawing = false; });

    win._menuHandler = m => {
      if (m === "File") { cx.fillStyle = "#fff"; cx.fillRect(0,0,canvas.width,canvas.height); Sound.play("open"); }
    };
  }
};

/* ---------------------------------------------------------------- *
 *  INTERNET EXPLORER
 * ---------------------------------------------------------------- */
Apps.ie = {
  title: "MSN.com - Microsoft Internet Explorer", icon: "🌐", w: 560, h: 420,
  init(body) {
    const wrap = document.createElement("div"); wrap.style.cssText="display:flex;flex-direction:column;flex:1;overflow:hidden";
    wrap.innerHTML = `
      <div class="menu-bar"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span>F<u>a</u>vorites</span><span><u>H</u>elp</span></div>
      <div class="ie-toolbar bevel-in" style="border:none">
        <div class="ie-btn" data-act="back"><span class="ie-ico">⬅️</span>Back</div>
        <div class="ie-btn" data-act="fwd"><span class="ie-ico">➡️</span>Forward</div>
        <div class="ie-btn" data-act="stop"><span class="ie-ico">❌</span>Stop</div>
        <div class="ie-btn" data-act="reload"><span class="ie-ico">🔄</span>Refresh</div>
        <div class="ie-btn" data-act="home"><span class="ie-ico">🏠</span>Home</div>
      </div>
      <div class="ie-address"><span>Address</span><input class="w98" value="http://www.msn.com/" id="ie-url"><button class="w98" style="min-width:auto" id="ie-go">Go</button></div>
      <div class="ie-page"><div class="ie-content" id="ie-content"></div></div>`;
    body.appendChild(wrap);

    const pages = {
      "http://www.msn.com/": `
        <div class="ie-marquee"><span>★ Welcome to the World Wide Web! ★ Best viewed in 800×600 ★ You are visitor #1,048,576 ★</span></div>
        <h1>Welcome to MSN.com</h1>
        <p><i>The Microsoft Network — your gateway to the Internet, circa 1998.</i></p>
        <hr><p>Quick links:</p>
        <ul style="line-height:1.8">
          <li><a data-go="http://www.geocities.com/">GeoCities</a> — build your own home page!</li>
          <li><a data-go="http://www.altavista.com/">AltaVista Search</a></li>
          <li><a data-go="about:claude">About this clone</a></li>
        </ul>
        <hr><p style="font-size:11px;color:#888">© 1998 Microsoft Corporation. <span style="background:#ff0">Under Construction 🚧</span></p>`,
      "http://www.geocities.com/": `<h1>🏠 GeoCities</h1><p>Welcome to my <blink>AWESOME</blink> home page!!!</p>
        <p>🎵 <i>MIDI now playing: canyon.mid</i></p><marquee style="color:#f0f">~*~ Thanks for visiting ~*~</marquee>
        <p><a data-go="http://www.msn.com/">« Back to MSN</a></p>`,
      "http://www.altavista.com/": `<h1 style="color:#000">AltaVista</h1>
        <p>Search the Web:</p><p><input class="w98" style="width:250px" placeholder="Ask me anything"> <button class="w98" style="min-width:auto">Search</button></p>
        <p style="font-size:11px;color:#888">Searching 140,000,000 web pages.</p><p><a data-go="http://www.msn.com/">« Back to MSN</a></p>`,
      "about:claude": `<h1>About this clone</h1><p>This Windows 98 desktop was reconstructed entirely in HTML, CSS, and JavaScript.</p>
        <p>Sounds are synthesized in real time with the Web Audio API. Every window, the Start menu, Minesweeper, Paint, the calculator, and this very browser are running in your real browser — no plugins, no images required.</p>
        <p><a data-go="http://www.msn.com/">« Back to MSN</a></p>`,
    };

    const content = wrap.querySelector("#ie-content");
    const url = wrap.querySelector("#ie-url");
    const hist = ["http://www.msn.com/"]; let hi = 0;

    function render(u, push = true) {
      Sound.play("open");
      content.innerHTML = pages[u] || `<h1>The page cannot be displayed</h1><p>The page you are looking for is currently unavailable. The Web site might be experiencing technical difficulties.</p><p><a data-go="http://www.msn.com/">« Back to MSN</a></p>`;
      url.value = u;
      if (push) { hist.length = hi + 1; hist.push(u); hi++; }
      content.querySelectorAll("[data-go]").forEach(a => a.onclick = () => render(a.dataset.go));
    }
    wrap.querySelector("#ie-go").onclick = () => render(url.value);
    url.addEventListener("keydown", e => { if (e.key === "Enter") render(url.value); });
    wrap.querySelectorAll(".ie-btn").forEach(b => b.onclick = () => {
      Sound.play("click"); const a = b.dataset.act;
      if (a === "home") render("http://www.msn.com/");
      else if (a === "reload") render(url.value, false);
      else if (a === "back" && hi > 0) { hi--; render(hist[hi], false); }
      else if (a === "fwd" && hi < hist.length - 1) { hi++; render(hist[hi], false); }
    });
    render("http://www.msn.com/", false);
  }
};

/* ---------------------------------------------------------------- *
 *  MS-DOS PROMPT
 * ---------------------------------------------------------------- */
Apps.cmd = {
  title: "MS-DOS Prompt", icon: "⬛", w: 480, h: 320,
  init(body) {
    const scr = document.createElement("div"); scr.className = "cmd-screen";
    body.appendChild(scr);
    const banner = "Microsoft(R) Windows 98\r\n   (C)Copyright Microsoft Corp 1981-1998.\r\n\r\n";
    let cwd = "C:\\WINDOWS";

    function prompt() {
      const line = document.createElement("div"); line.className = "cmd-input-line";
      line.innerHTML = `<span>${cwd}&gt;</span>`;
      const inp = document.createElement("input"); inp.autofocus = true;
      line.appendChild(inp); scr.appendChild(line); inp.focus();
      scr.scrollTop = scr.scrollHeight;
      inp.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          const cmd = inp.value; inp.disabled = true;
          run(cmd.trim());
        } else Sound.play("type");
      });
    }
    function out(t) { const d = document.createElement("div"); d.textContent = t; scr.appendChild(d); }

    function run(cmd) {
      const c = cmd.toLowerCase(); const arg = cmd.split(/\s+/).slice(1).join(" ");
      if (c === "") {}
      else if (c === "help") out("DIR     Displays a list of files and subdirectories.\nCLS     Clears the screen.\nVER     Displays the Windows version.\nDATE    Displays the current date.\nTIME    Displays the current time.\nECHO    Displays messages.\nDIR     List files.\nWIN     Starts Windows.\nEXIT    Quits the MS-DOS prompt.");
      else if (c === "cls") { scr.innerHTML = ""; }
      else if (c === "ver") out("\nWindows 98 [Version 4.10.1998]\n");
      else if (c === "dir") out(`\n Volume in drive C is WINDOWS98\n Directory of ${cwd}\n\nWIN98    <DIR>        05-30-98  9:00a\nSYSTEM   <DIR>        05-30-98  9:00a\nNOTEPAD  EXE   45,328  05-30-98  9:00a\nWIN      COM    3,648  05-30-98  9:00a\nREADME   TXT      512  05-30-98  9:00a\n        3 file(s)     49,488 bytes\n        2 dir(s)  524,288 bytes free\n`);
      else if (c === "date") out("\nCurrent date is " + new Date().toLocaleDateString() + "\n");
      else if (c === "time") out("\nCurrent time is " + new Date().toLocaleTimeString() + "\n");
      else if (c.startsWith("echo")) out(arg || "ECHO is on.");
      else if (c === "win") { out("\nStarting Windows 98..."); Sound.play("ding"); }
      else if (c === "exit") { WM.closeFocused(); return; }
      else if (c === "cd" || c.startsWith("cd ")) { if (arg) cwd = arg.toUpperCase().startsWith("C:") ? arg : cwd; }
      else out(`Bad command or file name`);
      prompt();
    }
    out(banner.trimEnd());
    prompt();
    scr.onclick = () => { const inps = scr.querySelectorAll("input:not([disabled])"); if (inps.length) inps[inps.length-1].focus(); };
  }
};

/* ---------------------------------------------------------------- *
 *  MEDIA PLAYER (plays a synthesized tune + visualizer)
 * ---------------------------------------------------------------- */
Apps.media = {
  title: "Windows Media Player", icon: "🎵", w: 300, h: 260,
  init(body) {
    const wrap = document.createElement("div"); wrap.className = "media-wrap";
    const viz = document.createElement("div"); viz.className = "media-screen";
    const bars = document.createElement("div"); bars.className = "media-viz";
    for (let i = 0; i < 20; i++) bars.appendChild(document.createElement("i"));
    viz.appendChild(bars);
    const info = document.createElement("div"); info.className = "media-info"; info.textContent = "♪ Now Playing: canyon.mid — [stopped]";
    const ctrls = document.createElement("div"); ctrls.className = "media-controls";
    ctrls.innerHTML = `<button class="w98" data-a="play">▶</button><button class="w98" data-a="pause">⏸</button><button class="w98" data-a="stop">⏹</button>`;
    wrap.append(viz, info, ctrls); body.appendChild(wrap);

    let anim = null, playing = false, melodyT = null;
    const iBars = bars.querySelectorAll("i");
    function tickViz() {
      iBars.forEach(b => b.style.height = (playing ? 5 + Math.random() * 60 : 5) + "px");
      anim = requestAnimationFrame(() => setTimeout(tickViz, 90));
    }
    // a little public-domain-ish melody (Ode to Joy fragment)
    const mel = [659,659,698,784,784,698,659,587,523,523,587,659,659,587,587];
    function playMelody(i = 0) {
      if (!playing) return;
      Sound.play("ding"); // reuse engine
      // direct tone:
      melodyT = setTimeout(() => playMelody((i + 1) % mel.length), 380);
    }
    ctrls.querySelectorAll("button").forEach(b => b.onclick = () => {
      const a = b.dataset.a; Sound.play("click");
      if (a === "play") { playing = true; info.textContent = "♪ Now Playing: canyon.mid — [playing]"; if (!anim) tickViz(); playMelody(); }
      if (a === "pause") { playing = false; info.textContent = "♪ canyon.mid — [paused]"; clearTimeout(melodyT); }
      if (a === "stop") { playing = false; info.textContent = "♪ canyon.mid — [stopped]"; clearTimeout(melodyT); }
    });
    tickViz();
  }
};

/* ---------------------------------------------------------------- *
 *  RECYCLE BIN
 * ---------------------------------------------------------------- */
Apps.recyclebin = {
  title: "Recycle Bin", icon: "🗑️", w: 420, h: 280,
  menu: ["File", "Edit", "View", "Help"],
  status: ["0 object(s)", ""],
  init(body) {
    const grid = document.createElement("div"); grid.className = "explorer-grid";
    grid.style.alignContent = "center"; grid.style.justifyContent = "center";
    grid.innerHTML = `<div style="color:#888;font-family:sans-serif">The Recycle Bin is empty.</div>`;
    body.appendChild(grid);
  }
};

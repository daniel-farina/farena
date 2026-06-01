/* ===================================================================
   win98.js — desktop, window manager, boot sequence, taskbar.
=================================================================== */
(() => {
  "use strict";

  /* ----------------------------- BOOT ----------------------------- */
  const biosText = `Award Modular BIOS v4.51PG, An Energy Star Ally
Copyright (C) 1984-98, Award Software, Inc.

Pentium II MMX CPU at 350MHz
Memory Test :  65536K OK

Award Plug and Play BIOS Extension v1.0A
Initialize Plug and Play Cards...
PNP Init Completed

Detecting HDD Primary Master  ... WDC AC234000L
Detecting HDD Primary Slave   ... None
Detecting HDD Secondary Master... CD-ROM 40X

Press DEL to enter SETUP
05/30/98-i440BX-W977-2A69KA0EC-00

Starting Windows 98...`;

  const biosEl = document.getElementById("bios-text");
  const biosScreen = document.getElementById("bios");
  const splash = document.getElementById("splash");
  const desktop = document.getElementById("desktop");

  function typeBios(i = 0) {
    if (i <= biosText.length) {
      biosEl.textContent = biosText.slice(0, i);
      const step = biosText[i] === "\n" ? 14 : 4;
      setTimeout(() => typeBios(i + step), 12);
    } else {
      setTimeout(() => { biosScreen.classList.add("hidden"); showSplash(); }, 600);
    }
  }
  function showSplash() {
    splash.classList.remove("hidden");
    setTimeout(() => {
      splash.classList.add("hidden");
      desktop.classList.remove("hidden");
      Sound.play("startup");
      bootDone = true;
    }, 3200);
  }

  let bootDone = false;
  // Kick off after first interaction OR immediately (audio will resume on click).
  function startBoot() { typeBios(); }

  /* ------------------------- DESKTOP ICONS ------------------------ */
  const desktopIcons = [
    { app: "mycomputer", label: "My Computer", icon: "💻" },
    { app: "recyclebin", label: "Recycle Bin", icon: "🗑️" },
    { app: "ie",         label: "Internet Explorer", icon: "🌐" },
    { app: "notepad",    label: "My Documents", icon: "📁" },
    { app: "minesweeper",label: "Minesweeper", icon: "💣" },
    { app: "paint",      label: "Paint", icon: "🎨" },
    { app: "media",      label: "Media Player", icon: "🎵" },
  ];
  const iconsHost = document.getElementById("icons");
  desktopIcons.forEach(d => {
    const el = document.createElement("div");
    el.className = "dicon"; el.tabIndex = 0;
    el.innerHTML = `<div class="dicon-img">${d.icon}</div><div class="dicon-label">${d.label}</div>`;
    el.addEventListener("click", e => {
      e.stopPropagation();
      iconsHost.querySelectorAll(".dicon").forEach(x => x.classList.remove("selected"));
      el.classList.add("selected");
    });
    el.addEventListener("dblclick", () => { WM.launch(d.app); });
    iconsHost.appendChild(el);
  });

  /* ------------------------ WINDOW MANAGER ------------------------ */
  const winHost = document.getElementById("windows");
  const taskButtons = document.getElementById("task-buttons");
  let zCounter = 100;
  const openWindows = new Map(); // id -> {win, taskBtn, app}
  let idSeq = 0;
  let focused = null;

  const WM = {
    launch(appKey) {
      const app = Apps[appKey];
      if (!app) { this.dialog("Error", "Cannot find the program.", "error"); return; }
      Sound.play("open");
      const id = "win" + (++idSeq);
      const win = document.createElement("div");
      win.className = "window";
      win.style.width = app.w + "px";
      win.style.height = app.h + "px";
      const offset = (openWindows.size % 8) * 22;
      win.style.left = (60 + offset) + "px";
      win.style.top = (40 + offset) + "px";
      win.style.zIndex = ++zCounter;
      win.dataset.id = id;

      const menuHtml = app.menu
        ? `<div class="menu-bar">${app.menu.map(m => `<span data-menu="${m}">${underline(m)}</span>`).join("")}</div>`
        : "";
      const statusHtml = app.status
        ? `<div class="status-bar">${app.status.map((s, i) => `<div class="sb-pane ${i ? "" : "narrow"}">${s}</div>`).join("")}</div>`
        : "";

      win.innerHTML = `
        <div class="title-bar">
          <span class="title-ico">${app.icon}</span>
          <span class="title-text">${app.title}</span>
          <span class="title-btns">
            <button class="tb-btn tb-min" title="Minimize">_</button>
            <button class="tb-btn tb-max" title="Maximize">□</button>
            <button class="tb-btn tb-close" title="Close">✕</button>
          </span>
        </div>
        ${menuHtml}
        <div class="window-body"></div>
        ${statusHtml}
        <div class="resize-handle"></div>`;
      winHost.appendChild(win);

      const body = win.querySelector(".window-body");
      try { app.init(body, win); } catch (e) { console.error(e); body.textContent = "Application error."; }

      // taskbar button
      const tb = document.createElement("div");
      tb.className = "task-btn";
      tb.innerHTML = `<span class="title-ico">${app.icon}</span><span class="tbk-txt">${app.title}</span>`;
      taskButtons.appendChild(tb);

      const rec = { win, taskBtn: tb, app, minimized: false, maximized: false, prev: null };
      openWindows.set(id, rec);

      // events
      tb.addEventListener("click", () => {
        if (focused === id && !rec.minimized) { minimize(id); }
        else if (rec.minimized) { restore(id); focus(id); }
        else focus(id);
      });
      win.addEventListener("mousedown", () => focus(id), true);
      win.querySelector(".tb-close").addEventListener("click", e => { e.stopPropagation(); close(id); });
      win.querySelector(".tb-min").addEventListener("click", e => { e.stopPropagation(); minimize(id); });
      win.querySelector(".tb-max").addEventListener("click", e => { e.stopPropagation(); toggleMax(id); });

      // menu clicks
      win.querySelectorAll("[data-menu]").forEach(m => m.addEventListener("click", () => {
        Sound.play("menu");
        const name = m.dataset.menu;
        if (name === "Help") this.dialog("About", `${app.title.split(" - ")[0]}\n\nPart of the Windows 98 clone.\nReconstructed in HTML, CSS & JavaScript.`, "info");
        else if (win._menuHandler) win._menuHandler(name);
      }));

      makeDraggable(win, win.querySelector(".title-bar"), id);
      makeResizable(win, win.querySelector(".resize-handle"), rec);
      win.querySelector(".title-bar").addEventListener("dblclick", () => toggleMax(id));

      focus(id);
      return id;
    },

    closeFocused() { if (focused) close(focused); },

    dialog(title, msg, type = "info", buttons = ["OK"]) {
      Sound.play(type === "error" ? "error" : "ding");
      const id = "dlg" + (++idSeq);
      const icons = { info: "ℹ️", error: "❌", warn: "⚠️", question: "❓" };
      const win = document.createElement("div");
      win.className = "window";
      win.style.width = "320px";
      win.style.left = (window.innerWidth / 2 - 160) + "px";
      win.style.top = (window.innerHeight / 2 - 90) + "px";
      win.style.zIndex = ++zCounter + 500;
      win.innerHTML = `
        <div class="title-bar">
          <span class="title-text">${title}</span>
          <span class="title-btns"><button class="tb-btn tb-close">✕</button></span>
        </div>
        <div class="window-body">
          <div class="dialog-body">
            <div class="dialog-row">
              <div class="dialog-icon">${icons[type] || "ℹ️"}</div>
              <div class="dialog-msg">${msg.replace(/\n/g, "<br>")}</div>
            </div>
            <div class="dialog-btns">${buttons.map(b => `<button class="w98" data-b="${b}">${b}</button>`).join("")}</div>
          </div>
        </div>`;
      winHost.appendChild(win);
      makeDraggable(win, win.querySelector(".title-bar"), null);
      win.addEventListener("mousedown", () => { win.style.zIndex = ++zCounter + 500; });
      return new Promise(resolve => {
        const done = v => { Sound.play("click"); win.remove(); resolve(v); };
        win.querySelector(".tb-close").onclick = () => done(null);
        win.querySelectorAll("[data-b]").forEach(b => b.onclick = () => done(b.dataset.b));
      });
    },
  };
  window.WM = WM;

  function underline(label) {
    // underline first letter (Win98 mnemonic look)
    return `<u>${label[0]}</u>${label.slice(1)}`;
  }

  function focus(id) {
    if (focused === id) return;
    const rec = openWindows.get(id); if (!rec) return;
    openWindows.forEach((r, key) => {
      r.win.classList.toggle("inactive", key !== id);
      r.taskBtn.classList.toggle("active", key === id);
    });
    rec.win.style.zIndex = ++zCounter;
    focused = id;
  }
  function minimize(id) {
    const rec = openWindows.get(id); if (!rec) return;
    Sound.play("minimize");
    rec.win.style.display = "none"; rec.minimized = true;
    rec.taskBtn.classList.remove("active");
    if (focused === id) focused = null;
  }
  function restore(id) {
    const rec = openWindows.get(id); if (!rec) return;
    rec.win.style.display = "flex"; rec.minimized = false;
  }
  function toggleMax(id) {
    const rec = openWindows.get(id); if (!rec) return;
    const w = rec.win;
    if (!rec.maximized) {
      Sound.play("maximize");
      rec.prev = { left: w.style.left, top: w.style.top, width: w.style.width, height: w.style.height };
      w.style.left = "0px"; w.style.top = "0px";
      w.style.width = window.innerWidth + "px";
      w.style.height = (window.innerHeight - 28) + "px";
      rec.maximized = true; w.classList.add("maximized");
    } else {
      Sound.play("minimize");
      Object.assign(w.style, rec.prev);
      rec.maximized = false; w.classList.remove("maximized");
    }
  }
  function close(id) {
    const rec = openWindows.get(id); if (!rec) return;
    Sound.play("close");
    rec.win.remove(); rec.taskBtn.remove();
    openWindows.delete(id);
    if (focused === id) focused = null;
  }

  /* ----------------------- DRAG & RESIZE -------------------------- */
  function makeDraggable(win, handle, id) {
    let dragging = false, ox = 0, oy = 0;
    handle.addEventListener("mousedown", e => {
      if (e.target.closest(".tb-btn")) return;
      const rec = id && openWindows.get(id);
      if (rec && rec.maximized) return;
      dragging = true; ox = e.clientX - win.offsetLeft; oy = e.clientY - win.offsetTop;
      e.preventDefault();
    });
    window.addEventListener("mousemove", e => {
      if (!dragging) return;
      let nx = e.clientX - ox, ny = e.clientY - oy;
      ny = Math.max(0, Math.min(ny, window.innerHeight - 50));
      nx = Math.max(-win.offsetWidth + 60, Math.min(nx, window.innerWidth - 30));
      win.style.left = nx + "px"; win.style.top = ny + "px";
    });
    window.addEventListener("mouseup", () => dragging = false);
  }
  function makeResizable(win, handle, rec) {
    let rz = false, sw = 0, sh = 0, sx = 0, sy = 0;
    handle.addEventListener("mousedown", e => {
      if (rec.maximized) return;
      rz = true; sw = win.offsetWidth; sh = win.offsetHeight; sx = e.clientX; sy = e.clientY;
      e.preventDefault(); e.stopPropagation();
    });
    window.addEventListener("mousemove", e => {
      if (!rz) return;
      win.style.width = Math.max(160, sw + e.clientX - sx) + "px";
      win.style.height = Math.max(90, sh + e.clientY - sy) + "px";
    });
    window.addEventListener("mouseup", () => rz = false);
  }

  /* --------------------------- START MENU ------------------------- */
  const startBtn = document.getElementById("start-btn");
  const startMenu = document.getElementById("start-menu");
  const programsMenu = document.getElementById("programs-menu");
  let startOpen = false;

  function openStart() {
    startOpen = true; startMenu.classList.remove("hidden");
    startBtn.classList.add("active"); Sound.play("menu");
  }
  function closeStart() {
    startOpen = false; startMenu.classList.add("hidden");
    programsMenu.classList.add("hidden");
    startBtn.classList.remove("active");
    startMenu.querySelectorAll(".sm-item").forEach(i => i.classList.remove("open"));
  }
  startBtn.addEventListener("click", e => { e.stopPropagation(); startOpen ? closeStart() : openStart(); });

  startMenu.querySelectorAll(".sm-item").forEach(item => {
    item.addEventListener("mouseenter", () => {
      startMenu.querySelectorAll(".sm-item").forEach(i => i.classList.remove("open"));
      item.classList.add("open");
      if (item.dataset.sub === "programs") {
        const r = item.getBoundingClientRect();
        programsMenu.style.left = r.right - 2 + "px";
        programsMenu.style.bottom = (window.innerHeight - r.bottom - 4) + "px";
        programsMenu.classList.remove("hidden");
      } else {
        programsMenu.classList.add("hidden");
      }
    });
    item.addEventListener("click", e => {
      e.stopPropagation();
      const app = item.dataset.app;
      if (app === "shutdown") { closeStart(); shutdown(); }
      else if (app === "run") { closeStart(); runDialog(); }
      else if (app === "help") { closeStart(); WM.dialog("Windows Help", "Windows 98 Help\n\nThis is a loving reconstruction of Windows 98. Explore the Start menu and desktop icons!", "info"); }
      else if (app === "find") { closeStart(); WM.dialog("Find: All Files", "Find is part of the simulation.", "info"); }
      else if (app && Apps[app]) { closeStart(); WM.launch(app); }
    });
  });
  programsMenu.querySelectorAll(".sm-item").forEach(item => {
    item.addEventListener("click", e => { e.stopPropagation(); const a = item.dataset.app; if (a) { closeStart(); WM.launch(a); } });
  });

  /* quick launch */
  document.querySelectorAll(".ql-icon").forEach(q => q.addEventListener("click", () => WM.launch(q.dataset.app)));

  /* --------------------------- RUN DIALOG ------------------------- */
  async function runDialog() {
    const id = "run" + (++idSeq);
    const win = document.createElement("div");
    win.className = "window"; win.style.width = "340px";
    win.style.left = (window.innerWidth/2 - 170) + "px"; win.style.top = (window.innerHeight/2 - 80) + "px";
    win.style.zIndex = ++zCounter + 500;
    win.innerHTML = `
      <div class="title-bar"><span class="title-ico">▶️</span><span class="title-text">Run</span>
      <span class="title-btns"><button class="tb-btn tb-close">✕</button></span></div>
      <div class="window-body"><div class="dialog-body">
        <div class="dialog-row"><div class="dialog-icon">▶️</div>
        <div class="dialog-msg">Type the name of a program, and Windows will open it for you.<br><br>
        <div class="run-row">Open: <input class="w98" id="run-input" value=""></div></div></div>
        <div class="dialog-btns"><button class="w98" data-b="ok">OK</button><button class="w98" data-b="cancel">Cancel</button></div>
      </div></div>`;
    winHost.appendChild(win);
    makeDraggable(win, win.querySelector(".title-bar"), null);
    const inp = win.querySelector("#run-input"); inp.focus();
    const go = () => {
      const v = inp.value.trim().toLowerCase().replace(/\.exe$/,"");
      const map = { notepad:"notepad", calc:"calc", mspaint:"paint", paint:"paint", winmine:"minesweeper",
                    iexplore:"ie", explorer:"mycomputer", command:"cmd", cmd:"cmd", mplayer:"media", control:"controlpanel" };
      win.remove();
      if (map[v]) WM.launch(map[v]);
      else if (v) WM.dialog("Run", `Cannot find the file '${v}'. Make sure you typed the name correctly.`, "error");
    };
    win.querySelector('[data-b="ok"]').onclick = go;
    win.querySelector('[data-b="cancel"]').onclick = () => win.remove();
    win.querySelector(".tb-close").onclick = () => win.remove();
    inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  }

  /* --------------------------- SHUTDOWN --------------------------- */
  async function shutdown() {
    const choice = await shutdownDialog();
    if (!choice || choice === "cancel") return;
    Sound.play("shutdown");
    const ov = document.createElement("div");
    if (choice === "restart") {
      ov.className = "shutdown-overlay dos";
      ov.innerHTML = `<div>Please wait while your computer shuts down.<br><br>It is now safe to restart.</div>`;
      setTimeout(() => location.reload(), 2500);
    } else {
      ov.className = "shutdown-overlay";
      ov.innerHTML = `<div>It's now safe to turn off<br>your computer.</div>`;
    }
    document.body.appendChild(ov);
  }
  function shutdownDialog() {
    const win = document.createElement("div");
    win.className = "window"; win.style.width = "360px";
    win.style.left = (window.innerWidth/2 - 180) + "px"; win.style.top = (window.innerHeight/2 - 100) + "px";
    win.style.zIndex = ++zCounter + 600;
    win.innerHTML = `
      <div class="title-bar"><span class="title-ico">🔌</span><span class="title-text">Shut Down Windows</span>
      <span class="title-btns"><button class="tb-btn tb-close">✕</button></span></div>
      <div class="window-body"><div class="dialog-body">
        <div class="dialog-row"><div class="dialog-icon">🖥️</div><div class="dialog-msg">
          <b>What do you want the computer to do?</b><br><br>
          <label style="display:block;margin:4px 0"><input type="radio" name="sd" value="shutdown" checked> Shut down</label>
          <label style="display:block;margin:4px 0"><input type="radio" name="sd" value="restart"> Restart</label>
          <label style="display:block;margin:4px 0"><input type="radio" name="sd" value="standby"> Stand by</label>
        </div></div>
        <div class="dialog-btns"><button class="w98" data-b="ok">OK</button><button class="w98" data-b="cancel">Cancel</button></div>
      </div></div>`;
    winHost.appendChild(win);
    makeDraggable(win, win.querySelector(".title-bar"), null);
    return new Promise(res => {
      win.querySelector('[data-b="ok"]').onclick = () => { const v = win.querySelector('input[name=sd]:checked').value; win.remove(); res(v === "standby" ? "cancel" : v); };
      win.querySelector('[data-b="cancel"]').onclick = () => { win.remove(); res("cancel"); };
      win.querySelector(".tb-close").onclick = () => { win.remove(); res("cancel"); };
    });
  }

  /* ----------------------- DESKTOP CONTEXT ------------------------ */
  const deskMenu = document.getElementById("desk-menu");
  desktop.addEventListener("contextmenu", e => {
    if (e.target.closest(".window") || e.target.closest(".taskbar")) return;
    e.preventDefault();
    deskMenu.style.left = Math.min(e.clientX, window.innerWidth - 160) + "px";
    deskMenu.style.top = Math.min(e.clientY, window.innerHeight - 200) + "px";
    deskMenu.classList.remove("hidden");
  });
  deskMenu.querySelectorAll(".ctx-item").forEach(it => it.addEventListener("click", () => {
    const act = it.dataset.act; deskMenu.classList.add("hidden"); Sound.play("click");
    if (act === "props") WM.launch("controlpanel");
    else if (act === "refresh") { Sound.play("ding"); }
    else if (act === "new") WM.dialog("New", "Create new items here in the full version!", "info");
  }));

  /* --------------------- GLOBAL CLICK HANDLING -------------------- */
  document.addEventListener("click", () => {
    Sound.resume();
    if (startOpen) closeStart();
    deskMenu.classList.add("hidden");
    document.getElementById("vol-panel").classList.add("hidden");
  });
  desktop.addEventListener("mousedown", e => {
    if (e.target === desktop || e.target === iconsHost) {
      iconsHost.querySelectorAll(".dicon").forEach(x => x.classList.remove("selected"));
    }
  });

  /* --------------------------- VOLUME ----------------------------- */
  const volPanel = document.getElementById("vol-panel");
  const volSlider = document.getElementById("vol-slider");
  const volMute = document.getElementById("vol-mute");
  document.getElementById("tray-vol").addEventListener("click", e => {
    e.stopPropagation();
    volPanel.classList.toggle("hidden");
  });
  volPanel.addEventListener("click", e => e.stopPropagation());
  volSlider.addEventListener("input", () => Sound.setVolume(volSlider.value / 100));
  volMute.addEventListener("change", () => { Sound.setMuted(volMute.checked); document.getElementById("tray-vol").textContent = volMute.checked ? "🔇" : "🔊"; });

  /* ---------------------------- CLOCK ----------------------------- */
  const clock = document.getElementById("clock");
  function updClock() {
    const d = new Date();
    let h = d.getHours(), m = d.getMinutes();
    const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
    clock.textContent = `${h}:${String(m).padStart(2, "0")} ${ap}`;
    clock.title = d.toDateString();
  }
  updClock(); setInterval(updClock, 1000);

  /* --------------------------- KICKOFF ---------------------------- */
  Sound.init();
  // Audio cannot start before a user gesture; the startup chime fires on
  // boot completion and will play once the user has clicked anywhere.
  window.addEventListener("pointerdown", () => Sound.resume(), { once: true });
  startBoot();
})();

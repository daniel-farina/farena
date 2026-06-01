const desktop = document.querySelector("#desktop");
const boot = document.querySelector("#boot");
const windowsHost = document.querySelector("#windows");
const startButton = document.querySelector("#start");
const startMenu = document.querySelector("#start-menu");
const taskButtons = document.querySelector("#task-buttons");
const clock = document.querySelector("#clock");
const soundToggle = document.querySelector("#sound-toggle");
const shutdownDialog = document.querySelector("#shutdown-dialog");

let zTop = 10;
let soundOn = true;
let audioContext;
let paintColor = "#000000";
const openWindows = new Map();

const apps = {
  computer: {
    title: "My Computer",
    size: [430, 300],
    render: () => `
      <div class="menu-strip"><span>File</span><span>Edit</span><span>View</span><span>Help</span></div>
      <div class="computer-list">
        <div class="drive"><span></span><b>3 1/2 Floppy (A:)</b></div>
        <div class="drive"><span></span><b>Local Disk (C:)</b></div>
        <div class="drive"><span></span><b>CD Audio (D:)</b></div>
        <div class="drive"><span></span><b>Control Panel</b></div>
        <div class="drive"><span></span><b>Dial-Up Networking</b></div>
        <div class="drive"><span></span><b>Printers</b></div>
      </div>`
  },
  notepad: {
    title: "Untitled - Notepad",
    size: [520, 350],
    render: () => `
      <div class="menu-strip"><span>File</span><span>Edit</span><span>Search</span><span>Help</span></div>
      <textarea class="notepad-area" spellcheck="false">Welcome to Retro98.

Double-click icons, drag windows, open the Start menu, paint on the canvas, and play some beeps in Media Player.

This is a clean-room retro desktop tribute, built with plain HTML, CSS, and JavaScript.</textarea>`
  },
  paint: {
    title: "Paint",
    size: [560, 380],
    render: () => `
      <div class="toolbar">
        <button data-tool="clear">Clear</button>
        <span>Color:</span>
      </div>
      <div class="paint-wrap">
        <div class="swatches">
          ${["#000000", "#808080", "#800000", "#ff0000", "#808000", "#ffff00", "#008000", "#00ff00", "#008080", "#00ffff", "#000080", "#0000ff", "#800080", "#ff00ff", "#ffffff", "#c0c0c0"].map((c) => `<button class="swatch" data-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join("")}
        </div>
        <canvas class="paint-canvas" width="760" height="420"></canvas>
      </div>`
  },
  mines: {
    title: "Mines",
    size: [330, 360],
    render: () => `
      <div class="toolbar"><button data-new-mines>New</button><b data-mine-status>Find the mines</b></div>
      <div class="mines-grid" data-mines-grid></div>`
  },
  internet: {
    title: "The Internet",
    size: [540, 340],
    render: () => `
      <div class="toolbar">
        <button>Back</button><button>Forward</button><button>Stop</button>
        <input value="https://retro98.local/home" aria-label="Address" style="flex:1; min-width:0;">
      </div>
      <article class="browser-page">
        <h2>Welcome to the Information Superhighway</h2>
        <p>This page was loaded at blazing local-file speed.</p>
        <p><a href="#" data-fake-link>Click here</a> for a very important alert.</p>
        <marquee behavior="alternate">Best viewed on a 1024x768 CRT.</marquee>
      </article>`
  },
  media: {
    title: "Media Player",
    size: [360, 265],
    render: () => `
      <div class="media-player">
        <div class="visualizer">${Array.from({ length: 24 }, () => "<i></i>").join("")}</div>
        <div class="toolbar">
          <button data-tone="startup">Startup</button>
          <button data-tone="chord">Chord</button>
          <button data-tone="error">Error</button>
          <button data-tone="stop">Stop</button>
        </div>
        <p>Audio is synthesized with Web Audio. Browsers may wait for your first click before playing sound.</p>
      </div>`
  },
  trash: {
    title: "Recycle Bin",
    size: [340, 220],
    render: () => `
      <div class="computer-list">
        <div class="drive"><span></span><b>old_homework.doc</b></div>
        <div class="drive"><span></span><b>bad_bitmap.bmp</b></div>
        <div class="drive"><span></span><b>temp42.tmp</b></div>
      </div>`
  }
};

setTimeout(() => {
  boot.classList.add("done");
  playSequence([392, 523, 659, 784], 0.08, "triangle");
}, 1850);

setInterval(updateClock, 1000);
updateClock();

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("dblclick", () => openApp(button.dataset.open));
  button.addEventListener("click", () => {
    document.querySelectorAll(".desktop-icon").forEach((icon) => icon.classList.remove("selected"));
    if (button.classList.contains("desktop-icon")) button.classList.add("selected");
  });
});

document.querySelectorAll(".start-items [data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    toggleStart(false);
    openApp(button.dataset.open);
  });
});

startButton.addEventListener("click", () => toggleStart(startMenu.hidden));
soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "♪" : "x";
  soundToggle.title = soundOn ? "Sound on" : "Sound off";
  playTone(soundOn ? 740 : 180, 0.05);
});

document.querySelector("#shutdown").addEventListener("click", () => {
  toggleStart(false);
  shutdownDialog.hidden = false;
  playSequence([220, 165], 0.12, "sine");
});

shutdownDialog.addEventListener("click", (event) => {
  if (event.target === shutdownDialog || event.target.closest("[data-dialog-close]")) {
    shutdownDialog.hidden = true;
    playTone(330, 0.06);
  }
});

desktop.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".start-menu") && !event.target.closest(".start-button")) toggleStart(false);
});

function openApp(id) {
  if (openWindows.has(id)) {
    focusWindow(openWindows.get(id));
    return;
  }

  const app = apps[id];
  const win = document.createElement("section");
  const [width, height] = app.size;
  const offset = (openWindows.size % 5) * 28;
  win.className = "window";
  win.dataset.app = id;
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  win.style.left = `${Math.min(110 + offset, window.innerWidth - 260)}px`;
  win.style.top = `${Math.min(38 + offset, window.innerHeight - 190)}px`;
  win.innerHTML = `
    <div class="titlebar" data-drag-handle>
      <span>${app.title}</span>
      <div class="title-actions">
        <button class="title-btn" data-minimize aria-label="Minimize">_</button>
        <button class="title-btn" data-maximize aria-label="Maximize">□</button>
        <button class="title-btn" data-close aria-label="Close">x</button>
      </div>
    </div>
    <div class="window-body">${app.render()}</div>
  `;

  windowsHost.append(win);
  openWindows.set(id, win);
  createTaskButton(id, app.title);
  wireWindow(win);
  focusWindow(win);
  playTone(560, 0.04);

  if (id === "paint") setupPaint(win);
  if (id === "mines") setupMines(win);
}

function wireWindow(win) {
  win.addEventListener("pointerdown", () => focusWindow(win));
  win.querySelector("[data-close]").addEventListener("click", () => closeWindow(win));
  win.querySelector("[data-minimize]").addEventListener("click", () => minimizeWindow(win));
  win.querySelector("[data-maximize]").addEventListener("click", () => {
    win.classList.toggle("maximized");
    focusWindow(win);
    playTone(460, 0.04);
  });

  const handle = win.querySelector("[data-drag-handle]");
  handle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button") || win.classList.contains("maximized")) return;
    event.preventDefault();
    focusWindow(win);
    const rect = win.getBoundingClientRect();
    const shiftX = event.clientX - rect.left;
    const shiftY = event.clientY - rect.top;
    handle.setPointerCapture(event.pointerId);

    const move = (moveEvent) => {
      const maxLeft = window.innerWidth - 80;
      const maxTop = window.innerHeight - 56;
      win.style.left = `${Math.max(0, Math.min(maxLeft, moveEvent.clientX - shiftX))}px`;
      win.style.top = `${Math.max(0, Math.min(maxTop, moveEvent.clientY - shiftY))}px`;
    };

    const stop = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
    };

    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  });

  win.addEventListener("click", (event) => {
    const fake = event.target.closest("[data-fake-link]");
    if (fake) {
      event.preventDefault();
      openAlert("Internet Explorer", "The web page has performed an illegal nostalgia operation.");
    }
  });
}

function createTaskButton(id, title) {
  const button = document.createElement("button");
  button.className = "task-button";
  button.dataset.task = id;
  button.textContent = title;
  button.addEventListener("click", () => {
    const win = openWindows.get(id);
    if (!win) return;
    if (win.hidden) {
      win.hidden = false;
      focusWindow(win);
    } else if (win.classList.contains("inactive")) {
      focusWindow(win);
    } else {
      minimizeWindow(win);
    }
  });
  taskButtons.append(button);
}

function focusWindow(win) {
  document.querySelectorAll(".window").forEach((item) => item.classList.add("inactive"));
  document.querySelectorAll(".task-button").forEach((item) => item.classList.remove("active"));
  win.classList.remove("inactive");
  win.hidden = false;
  win.style.zIndex = ++zTop;
  const task = document.querySelector(`[data-task="${win.dataset.app}"]`);
  if (task) task.classList.add("active");
}

function minimizeWindow(win) {
  win.hidden = true;
  const task = document.querySelector(`[data-task="${win.dataset.app}"]`);
  if (task) task.classList.remove("active");
  playTone(260, 0.04);
}

function closeWindow(win) {
  const id = win.dataset.app;
  win.remove();
  openWindows.delete(id);
  document.querySelector(`[data-task="${id}"]`)?.remove();
  playTone(190, 0.05);
}

function toggleStart(open) {
  startMenu.hidden = !open;
  startButton.classList.toggle("active", open);
  startButton.setAttribute("aria-expanded", String(open));
  if (open) playTone(480, 0.04);
}

function setupPaint(win) {
  const canvas = win.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.lineCap = "square";
  ctx.lineJoin = "round";
  ctx.lineWidth = 5;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let drawing = false;

  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  canvas.addEventListener("pointerdown", (event) => {
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    const p = point(event);
    ctx.strokeStyle = paintColor;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  canvas.addEventListener("pointerup", () => {
    drawing = false;
    playTone(620, 0.02);
  });
  win.querySelectorAll("[data-color]").forEach((button) => {
    button.addEventListener("click", () => {
      paintColor = button.dataset.color;
      playTone(700, 0.025);
    });
  });
  win.querySelector("[data-tool='clear']").addEventListener("click", () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    playSequence([500, 650], 0.04);
  });
}

function setupMines(win) {
  const grid = win.querySelector("[data-mines-grid]");
  const status = win.querySelector("[data-mine-status]");
  const makeBoard = () => {
    grid.innerHTML = "";
    status.textContent = "Find the mines";
    const mines = new Set();
    while (mines.size < 10) mines.add(Math.floor(Math.random() * 81));
    for (let i = 0; i < 81; i++) {
      const cell = document.createElement("button");
      cell.className = "mine-cell";
      cell.dataset.index = i;
      cell.dataset.mine = mines.has(i) ? "1" : "0";
      cell.addEventListener("click", () => openCell(cell, mines, status));
      cell.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (!cell.classList.contains("open")) {
          cell.classList.toggle("flagged");
          cell.textContent = cell.classList.contains("flagged") ? "⚑" : "";
          playTone(320, 0.03);
        }
      });
      grid.append(cell);
    }
  };
  win.querySelector("[data-new-mines]").addEventListener("click", makeBoard);
  makeBoard();
}

function openCell(cell, mines, status) {
  if (cell.classList.contains("open") || cell.classList.contains("flagged")) return;
  const index = Number(cell.dataset.index);
  cell.classList.add("open");
  if (cell.dataset.mine === "1") {
    cell.textContent = "*";
    status.textContent = "Boom. New game?";
    playSequence([160, 110, 80], 0.08, "sawtooth");
    return;
  }

  const count = neighbors(index).filter((n) => mines.has(n)).length;
  cell.textContent = count || "";
  cell.style.color = ["", "#0000ff", "#008000", "#ff0000", "#000080", "#800000"][count] || "#000";
  playTone(520 + count * 35, 0.025);
}

function neighbors(index) {
  const x = index % 9;
  const y = Math.floor(index / 9);
  const out = [];
  for (let yy = y - 1; yy <= y + 1; yy++) {
    for (let xx = x - 1; xx <= x + 1; xx++) {
      if (xx === x && yy === y) continue;
      if (xx >= 0 && xx < 9 && yy >= 0 && yy < 9) out.push(yy * 9 + xx);
    }
  }
  return out;
}

function openAlert(title, message) {
  const id = `alert-${Date.now()}`;
  apps[id] = {
    title,
    size: [350, 150],
    render: () => `<div class="dialog-body"><span class="big-icon power"></span><p>${message}</p></div><div class="dialog-actions"><button data-close-alert>OK</button></div>`
  };
  openApp(id);
  const win = openWindows.get(id);
  win.querySelector("[data-close-alert]").addEventListener("click", () => closeWindow(win));
  playSequence([170, 140], 0.09, "square");
}

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat([], {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());
}

function getAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function playTone(frequency, duration = 0.08, type = "square", delay = 0) {
  if (!soundOn) return;
  const audio = getAudio();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const start = audio.currentTime + delay;
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(0.05, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playSequence(notes, duration = 0.08, type = "square") {
  notes.forEach((note, index) => playTone(note, duration, type, index * duration * 1.15));
}

document.addEventListener("click", (event) => {
  const tone = event.target.closest("[data-tone]")?.dataset.tone;
  if (!tone) return;
  const player = event.target.closest(".window").querySelector(".visualizer");
  if (tone === "startup") playSequence([392, 523, 659, 784, 1047], 0.08, "triangle");
  if (tone === "chord") [262, 330, 392, 523].forEach((note) => playTone(note, 0.35, "sine"));
  if (tone === "error") playSequence([120, 90], 0.13, "sawtooth");
  if (tone === "stop") playTone(100, 0.05);
  player.classList.toggle("playing", tone !== "stop");
});

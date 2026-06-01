/**
 * Main initialization for Windows 98 clone
 */
document.addEventListener('DOMContentLoaded', () => {
  const bootScreen = document.getElementById('boot-screen');
  const bootBar = document.getElementById('boot-progress-bar');
  const bootStatus = document.getElementById('boot-status');
  const startBtn = document.getElementById('start-btn');
  const startMenu = document.getElementById('start-menu');
  const contextMenu = document.getElementById('context-menu');
  const desktop = document.getElementById('desktop');
  const selectionRect = document.getElementById('selection-rect');

  const bootMessages = [
    'Starting Windows 98...',
    'Loading system files...',
    'Initializing device drivers...',
    'Loading network support...',
    'Starting Windows...',
  ];

  let bootStep = 0;
  const bootInterval = setInterval(() => {
    bootStep++;
    bootBar.style.width = `${(bootStep / bootMessages.length) * 100}%`;
    bootStatus.textContent = bootMessages[bootStep - 1] || '';

    if (bootStep >= bootMessages.length) {
      clearInterval(bootInterval);
      setTimeout(() => {
        bootScreen.classList.add('hidden');
        Win98Sound.init();
        Win98Sound.startup();
        setTimeout(() => bootScreen.remove(), 800);
      }, 600);
    }
  }, 500);

  document.addEventListener('click', () => Win98Sound.init(), { once: true });

  const desktopIcons = [
    { id: 'my-computer', label: 'My Computer', icon: Apps.ICONS.myComputer, action: () => Apps.openMyComputer() },
    { id: 'recycle-bin', label: 'Recycle Bin', icon: Apps.ICONS.recycleBin, action: () => Apps.openRecycleBin() },
    { id: 'ie', label: 'Internet Explorer', icon: Apps.ICONS.ie, action: () => Apps.openInternetExplorer() },
    { id: 'notepad', label: 'Notepad', icon: Apps.ICONS.notepad, action: () => Apps.openNotepad() },
    { id: 'minesweeper', label: 'Minesweeper', icon: Apps.ICONS.minesweeper, action: () => Apps.openMinesweeper() },
  ];

  desktopIcons.forEach((icon, i) => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.dataset.id = icon.id;
    el.style.left = `${16 + (i % 1) * 80}px`;
    el.style.top = `${16 + i * 80}px`;
    el.innerHTML = `<img src="${icon.icon}" alt=""><span>${icon.label}</span>`;
    desktop.appendChild(el);

    el.addEventListener('dblclick', () => {
      Win98Sound.click();
      icon.action();
    });

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      Win98Sound.click();
      document.querySelectorAll('.desktop-icon').forEach(ic => ic.classList.remove('selected'));
      el.classList.add('selected');
    });

    setupIconDrag(el);
  });

  function setupIconDrag(el) {
    let dragging = false;
    let startX, startY, origLeft, origTop;

    el.addEventListener('mousedown', (e) => {
      if (e.detail > 1) return;
      dragging = true;
      el.classList.add('dragging');
      startX = e.clientX;
      startY = e.clientY;
      origLeft = el.offsetLeft;
      origTop = el.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      el.style.left = `${origLeft + e.clientX - startX}px`;
      el.style.top = `${origTop + e.clientY - startY}px`;
    });

    document.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false;
        el.classList.remove('dragging');
      }
    });
  }

  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    Win98Sound.click();
    const isOpen = startMenu.classList.toggle('open');
    startBtn.classList.toggle('active', isOpen);
    if (isOpen) Win98Sound.menuPopup();
  });

  document.querySelectorAll('.start-launch').forEach(item => {
    item.addEventListener('click', () => {
      Win98Sound.click();
      closeStartMenu();
      const app = item.dataset.app;
      const actions = {
        'my-computer': () => Apps.openMyComputer(),
        'recycle-bin': () => Apps.openRecycleBin(),
        'ie': () => Apps.openInternetExplorer(),
        'notepad': () => Apps.openNotepad(),
        'minesweeper': () => Apps.openMinesweeper(),
        'about': () => Apps.openAbout(),
        'shutdown': () => shutdown(),
      };
      if (actions[app]) actions[app]();
    });
  });

  function closeStartMenu() {
    startMenu.classList.remove('open');
    startBtn.classList.remove('active');
  }

  document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && e.target !== startBtn) {
      closeStartMenu();
    }
    closeContextMenu();
    document.querySelectorAll('.menu-item.open').forEach(m => m.classList.remove('open'));

    if (e.target === desktop || e.target.id === 'desktop') {
      document.querySelectorAll('.desktop-icon').forEach(ic => ic.classList.remove('selected'));
    }
  });

  desktop.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, 'desktop');
  });

  document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      icon.classList.add('selected');
      document.querySelectorAll('.desktop-icon').forEach(ic => {
        if (ic !== icon) ic.classList.remove('selected');
      });
      showContextMenu(e.clientX, e.clientY, 'icon', icon.dataset.id);
    });
  });

  function showContextMenu(x, y, type, iconId) {
    Win98Sound.menuPopup();
    const items = type === 'desktop'
      ? [
          { label: 'Arrange Icons', action: arrangeIcons },
          { label: 'Refresh', action: () => Win98Sound.notify() },
          { separator: true },
          { label: 'Properties', action: () => Apps.openAbout() },
        ]
      : [
          { label: 'Open', action: () => desktopIcons.find(i => i.id === iconId)?.action() },
          { separator: true },
          { label: 'Create Shortcut', disabled: true },
          { label: 'Delete', disabled: true },
          { separator: true },
          { label: 'Properties', action: () => Apps.showDialog('Properties', `${iconId}\n\nType: Application\nLocation: C:\\Windows\\Desktop`, 'info') },
        ];

    contextMenu.innerHTML = items.map(item => {
      if (item.separator) return '<div class="menu-separator"></div>';
      return `<div class="context-item ${item.disabled ? 'disabled' : ''}">${item.label}</div>`;
    }).join('');

    contextMenu.style.left = `${Math.min(x, window.innerWidth - 180)}px`;
    contextMenu.style.top = `${Math.min(y, window.innerHeight - 200)}px`;
    contextMenu.classList.add('open');

    contextMenu.querySelectorAll('.context-item:not(.disabled)').forEach((el, i) => {
      const actionable = items.filter(it => !it.separator && !it.disabled);
      const idx = [...contextMenu.querySelectorAll('.context-item:not(.disabled)')].indexOf(el);
      el.addEventListener('click', () => {
        Win98Sound.click();
        closeContextMenu();
        if (actionable[idx]?.action) actionable[idx].action();
      });
    });
  }

  function closeContextMenu() {
    contextMenu.classList.remove('open');
  }

  function arrangeIcons() {
    document.querySelectorAll('.desktop-icon').forEach((el, i) => {
      el.style.left = '16px';
      el.style.top = `${16 + i * 80}px`;
    });
    Win98Sound.ding();
  }

  let selecting = false;
  let selStartX, selStartY;

  desktop.addEventListener('mousedown', (e) => {
    if (e.target !== desktop) return;
    selecting = true;
    selStartX = e.clientX;
    selStartY = e.clientY;
    selectionRect.style.display = 'block';
    selectionRect.style.left = `${selStartX}px`;
    selectionRect.style.top = `${selStartY}px`;
    selectionRect.style.width = '0';
    selectionRect.style.height = '0';
  });

  document.addEventListener('mousemove', (e) => {
    if (!selecting) return;
    const x = Math.min(e.clientX, selStartX);
    const y = Math.min(e.clientY, selStartY);
    const w = Math.abs(e.clientX - selStartX);
    const h = Math.abs(e.clientY - selStartY);
    selectionRect.style.left = `${x}px`;
    selectionRect.style.top = `${y}px`;
    selectionRect.style.width = `${w}px`;
    selectionRect.style.height = `${h}px`;

    document.querySelectorAll('.desktop-icon').forEach(icon => {
      const rect = icon.getBoundingClientRect();
      const selRect = selectionRect.getBoundingClientRect();
      const overlap = !(rect.right < selRect.left || rect.left > selRect.right || rect.bottom < selRect.top || rect.top > selRect.bottom);
      icon.classList.toggle('selected', overlap);
    });
  });

  document.addEventListener('mouseup', () => {
    selecting = false;
    selectionRect.style.display = 'none';
  });

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  document.getElementById('tray-volume').addEventListener('click', () => {
    Win98Sound.ding();
    Apps.showDialog('Volume Control', 'Volume: ████████░░ 80%\n\nWave: ██████████ 100%\nSynth: ██████░░░░ 60%', 'info');
  });

  function shutdown() {
    Apps.showDialog('Shut Down Windows', 'Are you sure you want to shut down your computer?', 'question');
    const overlay = document.querySelector('.dialog-overlay:last-child');
    if (overlay) {
      const btns = overlay.querySelector('.dialog-buttons');
      btns.innerHTML = `
        <button class="btn shutdown-yes">Yes</button>
        <button class="btn shutdown-no">No</button>
      `;
      overlay.querySelector('.shutdown-yes').addEventListener('click', () => {
        Win98Sound.shutdown();
        overlay.remove();
        document.body.innerHTML = `
          <div style="background:#000;color:#808080;height:100vh;display:flex;align-items:center;justify-content:center;font-family:Tahoma,sans-serif;font-size:14px;">
            It is now safe to turn off your computer.
          </div>
        `;
      });
      overlay.querySelector('.shutdown-no').addEventListener('click', () => {
        Win98Sound.click();
        overlay.remove();
      });
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeStartMenu();
      closeContextMenu();
    }
  });
});

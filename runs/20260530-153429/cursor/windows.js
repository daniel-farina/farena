/**
 * Window manager for Windows 98 clone
 */
const WindowManager = (() => {
  let zIndex = 100;
  const windows = new Map();
  let activeWindowId = null;

  function createWindow(options) {
    const {
      id,
      title,
      icon,
      width = 480,
      height = 320,
      x,
      y,
      content,
      resizable = true,
      menuBar = false,
      statusBar = false,
      onClose,
    } = options;

    if (windows.has(id)) {
      focusWindow(id);
      const w = windows.get(id);
      if (w.el.classList.contains('minimized')) {
        restoreWindow(id);
      }
      return w.el;
    }

    const desktop = document.getElementById('desktop');
    const taskbarHeight = 28;
    const defaultX = x ?? 80 + (windows.size * 24) % 200;
    const defaultY = y ?? 40 + (windows.size * 24) % 150;

    const win = document.createElement('div');
    win.className = 'window';
    win.id = `window-${id}`;
    win.style.width = `${width}px`;
    win.style.height = `${height}px`;
    win.style.left = `${defaultX}px`;
    win.style.top = `${defaultY}px`;
    win.style.zIndex = ++zIndex;
    if (!resizable) win.style.resize = 'none';

    win.innerHTML = `
      <div class="title-bar">
        <img class="title-bar-icon" src="${icon}" alt="">
        <span class="title-bar-text">${title}</span>
        <div class="title-bar-controls">
          <button class="title-btn btn-minimize" title="Minimize">_</button>
          <button class="title-btn btn-maximize" title="Maximize">□</button>
          <button class="title-btn btn-close" title="Close">×</button>
        </div>
      </div>
      ${menuBar ? '<div class="menu-bar"></div>' : ''}
      <div class="window-body">${content}</div>
      ${statusBar ? '<div class="status-bar"><div class="status-bar-section grow"></div></div>' : ''}
    `;

    desktop.appendChild(win);
    setupDrag(win);
    setupControls(win, id, onClose);

    win.addEventListener('mousedown', () => focusWindow(id));
    win.addEventListener('touchstart', () => focusWindow(id));

    const taskBtn = createTaskbarButton(id, title, icon);
    windows.set(id, { el: win, taskBtn, maximized: false, prevRect: null, onClose });

    Win98Sound.windowOpen();
    focusWindow(id);
    return win;
  }

  function createTaskbarButton(id, title, icon) {
    const container = document.getElementById('taskbar-apps');
    const btn = document.createElement('button');
    btn.className = 'taskbar-app btn outset';
    btn.dataset.windowId = id;
    btn.innerHTML = `<img src="${icon}" alt=""><span>${title}</span>`;
    btn.addEventListener('click', () => {
      Win98Sound.click();
      const w = windows.get(id);
      if (!w) return;
      if (w.el.classList.contains('minimized')) {
        restoreWindow(id);
      } else if (activeWindowId === id) {
        minimizeWindow(id);
      } else {
        focusWindow(id);
      }
    });
    container.appendChild(btn);
    return btn;
  }

  function setupDrag(win) {
    const titleBar = win.querySelector('.title-bar');
    let dragging = false;
    let startX, startY, startLeft, startTop;

    titleBar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.title-btn')) return;
      if (win.classList.contains('maximized')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = win.offsetLeft;
      startTop = win.offsetTop;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      win.style.left = `${startLeft + e.clientX - startX}px`;
      win.style.top = `${Math.max(0, startTop + e.clientY - startY)}px`;
    });

    document.addEventListener('mouseup', () => { dragging = false; });
  }

  function setupControls(win, id, onClose) {
    win.querySelector('.btn-minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      minimizeWindow(id);
    });

    win.querySelector('.btn-maximize').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMaximize(id);
    });

    win.querySelector('.btn-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeWindow(id, onClose);
    });
  }

  function focusWindow(id) {
    const w = windows.get(id);
    if (!w) return;
    activeWindowId = id;
    w.el.style.zIndex = ++zIndex;
    w.el.classList.remove('inactive');

    windows.forEach((win, winId) => {
      if (winId !== id) {
        win.el.classList.add('inactive');
        win.taskBtn.classList.remove('active');
      }
    });
    w.taskBtn.classList.add('active');
  }

  function minimizeWindow(id) {
    const w = windows.get(id);
    if (!w) return;
    w.el.classList.add('minimized');
    w.taskBtn.classList.remove('active');
    Win98Sound.minimize();
    activeWindowId = null;

    let topZ = 0;
    let topId = null;
    windows.forEach((win, winId) => {
      if (!win.el.classList.contains('minimized') && parseInt(win.el.style.zIndex) > topZ) {
        topZ = parseInt(win.el.style.zIndex);
        topId = winId;
      }
    });
    if (topId) focusWindow(topId);
  }

  function restoreWindow(id) {
    const w = windows.get(id);
    if (!w) return;
    w.el.classList.remove('minimized');
    Win98Sound.windowOpen();
    focusWindow(id);
  }

  function toggleMaximize(id) {
    const w = windows.get(id);
    if (!w) return;

    if (w.maximized) {
      w.el.classList.remove('maximized');
      if (w.prevRect) {
        w.el.style.left = w.prevRect.left;
        w.el.style.top = w.prevRect.top;
        w.el.style.width = w.prevRect.width;
        w.el.style.height = w.prevRect.height;
      }
      w.maximized = false;
      Win98Sound.restore?.() || Win98Sound.windowOpen();
    } else {
      w.prevRect = {
        left: w.el.style.left,
        top: w.el.style.top,
        width: w.el.style.width,
        height: w.el.style.height,
      };
      w.el.classList.add('maximized');
      w.maximized = true;
      Win98Sound.maximize();
    }
    focusWindow(id);
  }

  function closeWindow(id, onClose) {
    const w = windows.get(id);
    if (!w) return;
    if (onClose && onClose() === false) return;

    w.el.remove();
    w.taskBtn.remove();
    windows.delete(id);
    Win98Sound.windowClose();

    if (activeWindowId === id) {
      activeWindowId = null;
      let topZ = 0;
      let topId = null;
      windows.forEach((win, winId) => {
        if (!win.el.classList.contains('minimized') && parseInt(win.el.style.zIndex) > topZ) {
          topZ = parseInt(win.el.style.zIndex);
          topId = winId;
        }
      });
      if (topId) focusWindow(topId);
    }
  }

  function getWindow(id) {
    return windows.get(id)?.el;
  }

  function isOpen(id) {
    return windows.has(id);
  }

  return {
    createWindow,
    focusWindow,
    closeWindow,
    getWindow,
    isOpen,
    get windows() { return windows; },
  };
})();

/**
 * Windows 98 applications
 */
const Apps = (() => {
  const ICONS = {
    myComputer: 'assets/icon-my-computer.png',
    recycleBin: 'assets/icon-recycle-bin.png',
    ie: 'assets/icon-internet-explorer.png',
    notepad: 'assets/icon-notepad.png',
    minesweeper: 'assets/icon-minesweeper.png',
  };

  const FILE_SYSTEM = {
    'C:': {
      name: 'Local Disk (C:)',
      items: [
        { name: 'Windows', type: 'folder', icon: '📁' },
        { name: 'Program Files', type: 'folder', icon: '📁' },
        { name: 'My Documents', type: 'folder', icon: '📁' },
        { name: 'autoexec.bat', type: 'file', icon: '📄' },
        { name: 'config.sys', type: 'file', icon: '📄' },
      ],
    },
    'D:': {
      name: 'Local Disk (D:)',
      items: [
        { name: 'Games', type: 'folder', icon: '📁' },
        { name: 'Backup', type: 'folder', icon: '📁' },
        { name: 'readme.txt', type: 'file', icon: '📄' },
      ],
    },
    'Windows': {
      name: 'Windows',
      items: [
        { name: 'System', type: 'folder', icon: '📁' },
        { name: 'Desktop', type: 'folder', icon: '📁' },
        { name: 'win.ini', type: 'file', icon: '📄' },
        { name: 'system.ini', type: 'file', icon: '📄' },
      ],
    },
    'Program Files': {
      name: 'Program Files',
      items: [
        { name: 'Internet Explorer', type: 'folder', icon: '📁' },
        { name: 'Accessories', type: 'folder', icon: '📁' },
        { name: 'Games', type: 'folder', icon: '📁' },
      ],
    },
    'My Documents': {
      name: 'My Documents',
      items: [
        { name: 'Letter to Mom.txt', type: 'file', icon: '📄' },
        { name: 'Resume.doc', type: 'file', icon: '📄' },
        { name: 'Budget.xls', type: 'file', icon: '📄' },
      ],
    },
    'Games': {
      name: 'Games',
      items: [
        { name: 'Minesweeper', type: 'app', icon: ICONS.minesweeper },
        { name: 'Solitaire', type: 'app', icon: '🃏' },
        { name: 'FreeCell', type: 'app', icon: '🃏' },
      ],
    },
  };

  function openMyComputer() {
    const id = 'my-computer';
    let currentPath = 'root';

    function renderExplorer() {
      const win = WindowManager.getWindow(id);
      if (!win) return;
      const content = win.querySelector('.explorer-content');
      const sidebar = win.querySelector('.explorer-sidebar');

      sidebar.innerHTML = `
        <div class="explorer-tree-item ${currentPath === 'root' ? 'selected' : ''}" data-path="root">🖥️ Desktop</div>
        <div class="explorer-tree-item" data-path="C:">💾 (C:)</div>
        <div class="explorer-tree-item" data-path="D:">💾 (D:)</div>
      `;

      sidebar.querySelectorAll('.explorer-tree-item').forEach(item => {
        item.addEventListener('click', () => {
          Win98Sound.click();
          currentPath = item.dataset.path;
          renderExplorer();
        });
      });

      let items;
      if (currentPath === 'root') {
        items = [
          { name: '3½ Floppy (A:)', type: 'drive', icon: '💾' },
          { name: '(C:)', type: 'drive', icon: '💾', path: 'C:' },
          { name: '(D:)', type: 'drive', icon: '💾', path: 'D:' },
          { name: 'Control Panel', type: 'folder', icon: '⚙️' },
          { name: 'Printers', type: 'folder', icon: '🖨️' },
        ];
      } else {
        items = FILE_SYSTEM[currentPath]?.items || [];
      }

      content.innerHTML = items.map((item, i) => `
        <div class="explorer-item" data-index="${i}" data-name="${item.name}" data-type="${item.type}" data-path="${item.path || ''}">
          ${typeof item.icon === 'string' && item.icon.includes('.png')
            ? `<img src="${item.icon}" alt="">`
            : `<span style="font-size:32px">${item.icon}</span>`}
          <span>${item.name}</span>
        </div>
      `).join('');

      content.querySelectorAll('.explorer-item').forEach(el => {
        el.addEventListener('dblclick', () => {
          Win98Sound.click();
          const type = el.dataset.type;
          const name = el.dataset.name;
          const path = el.dataset.path;

          if (type === 'drive' || type === 'folder') {
            currentPath = path || name.replace(/[()]/g, '').split(' ').pop();
            if (FILE_SYSTEM[currentPath] || currentPath === 'C:' || currentPath === 'D:') {
              renderExplorer();
            } else {
              showDialog('Information', `The folder "${name}" is empty or not accessible.`, 'info');
            }
          } else if (type === 'app' && name === 'Minesweeper') {
            openMinesweeper();
          } else if (type === 'file') {
            openNotepad(name);
          }
        });

        el.addEventListener('click', () => {
          content.querySelectorAll('.explorer-item').forEach(i => i.classList.remove('selected'));
          el.classList.add('selected');
          Win98Sound.click();
        });
      });

      const statusSection = win.querySelector('.status-bar-section');
      if (statusSection) {
        statusSection.textContent = `${items.length} object(s)`;
      }
    }

    WindowManager.createWindow({
      id,
      title: 'My Computer',
      icon: ICONS.myComputer,
      width: 520,
      height: 360,
      statusBar: true,
      content: `
        <div class="explorer-layout">
          <div class="explorer-sidebar"></div>
          <div class="explorer-content inset"></div>
        </div>
      `,
    });

    renderExplorer();
  }

  function openRecycleBin() {
    const id = 'recycle-bin';
    WindowManager.createWindow({
      id,
      title: 'Recycle Bin',
      icon: ICONS.recycleBin,
      width: 400,
      height: 280,
      content: `
        <div class="recycle-empty">
          <img src="${ICONS.recycleBin}" alt="">
          <p>Recycle Bin is empty.</p>
        </div>
      `,
    });
  }

  function openNotepad(filename = 'Untitled') {
    const id = `notepad-${Date.now()}`;
    const win = WindowManager.createWindow({
      id,
      title: `${filename} - Notepad`,
      icon: ICONS.notepad,
      width: 500,
      height: 380,
      menuBar: true,
      content: `<textarea class="notepad-area inset" spellcheck="false">${filename !== 'Untitled' ? `Contents of ${filename}...\n\nLorem ipsum dolor sit amet.` : ''}</textarea>`,
    });

    const menuBar = win.querySelector('.menu-bar');
    menuBar.innerHTML = `
      <div class="menu-item" data-menu="file">File<div class="menu-dropdown">
        <div class="menu-dropdown-item" data-action="new">New</div>
        <div class="menu-dropdown-item" data-action="open">Open...</div>
        <div class="menu-dropdown-item" data-action="save">Save</div>
        <div class="menu-separator"></div>
        <div class="menu-dropdown-item" data-action="exit">Exit</div>
      </div></div>
      <div class="menu-item" data-menu="edit">Edit<div class="menu-dropdown">
        <div class="menu-dropdown-item" data-action="undo">Undo</div>
        <div class="menu-separator"></div>
        <div class="menu-dropdown-item" data-action="cut">Cut</div>
        <div class="menu-dropdown-item" data-action="copy">Copy</div>
        <div class="menu-dropdown-item" data-action="paste">Paste</div>
      </div></div>
      <div class="menu-item" data-menu="help">Help<div class="menu-dropdown">
        <div class="menu-dropdown-item" data-action="about">About Notepad</div>
      </div></div>
    `;

    setupMenuBar(win, id, {
      exit: () => WindowManager.closeWindow(id),
      about: () => showDialog('About Notepad', 'Notepad\n\nVersion 4.00\n\n(c) Microsoft Corporation. All rights reserved.', 'info'),
    });

    const textarea = win.querySelector('.notepad-area');
    textarea.addEventListener('keydown', () => Win98Sound.keyPress());
  }

  function openInternetExplorer(url) {
    const id = 'internet-explorer';
    const pages = {
      home: {
        title: 'Welcome to the Internet',
        html: `
          <h1>🌐 Welcome to the World Wide Web!</h1>
          <p>You've successfully connected to the Internet using Microsoft Internet Explorer 4.0.</p>
          <p>The web is a global hypertext system. Browse links below to explore popular sites of 1998:</p>
          <div class="ie-links">
            <a href="#" data-page="yahoo">Yahoo! - Yet Another Hierarchical Officious Oracle</a>
            <a href="#" data-page="altavista">AltaVista - The most powerful search engine</a>
            <a href="#" data-page="geocities">GeoCities - Home of the best personal pages</a>
            <a href="#" data-page="napster">Napster - Share music with friends (preview)</a>
            <a href="#" data-page="doom">id Software - DOOM and Quake</a>
          </div>
          <p style="margin-top:24px;font-size:10px;color:#808080">Best viewed with Internet Explorer 4.0 at 800×600 resolution.</p>
        `,
      },
      yahoo: { title: 'Yahoo!', html: '<h1>Yahoo!</h1><p>The web organized. News, email, search, and more.</p><p>Stock quote: YHOO $148.00 (+3.25)</p>' },
      altavista: { title: 'AltaVista', html: '<h1>AltaVista Search</h1><p>Search the entire web with the most comprehensive index.</p><input type="text" placeholder="Search..." style="width:300px;padding:4px"> <button class="btn">Search</button>' },
      geocities: { title: 'GeoCities', html: '<h1>Welcome to my GeoCities page!</h1><p>🚧 Under Construction 🚧</p><p>Last updated: March 15, 1998</p><p>Sign my guestbook! Email me!</p><marquee>Thanks for visiting!!!</marquee>' },
      napster: { title: 'Napster', html: '<h1>Napster Preview</h1><p>Share MP3 files with users around the world. Coming soon...</p>' },
      doom: { title: 'id Software', html: '<h1>id Software</h1><p>Creators of DOOM, Quake, and Hexen.</p><p>"Our games will blow your mind."</p>' },
    };

    let currentPage = 'home';

    function navigate(page) {
      currentPage = page;
      const win = WindowManager.getWindow(id);
      if (!win) return;
      const content = win.querySelector('.ie-content');
      const address = win.querySelector('.ie-address input');
      const p = pages[page];
      content.innerHTML = p.html;
      address.value = page === 'home' ? 'http://www.microsoft.com/' : `http://www.${page}.com/`;

      content.querySelectorAll('a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          Win98Sound.click();
          navigate(link.dataset.page);
        });
      });
    }

    if (WindowManager.isOpen(id)) {
      WindowManager.focusWindow(id);
      if (url) navigate(url);
      return;
    }

    WindowManager.createWindow({
      id,
      title: 'Microsoft Internet Explorer',
      icon: ICONS.ie,
      width: 640,
      height: 480,
      menuBar: true,
      content: `
        <div class="ie-toolbar">
          <button class="btn ie-back">Back</button>
          <button class="btn ie-forward">Forward</button>
          <button class="btn ie-stop">Stop</button>
          <button class="btn ie-refresh">Refresh</button>
          <button class="btn ie-home">Home</button>
          <div class="ie-address">
            <label>Address</label>
            <input type="text" value="http://www.microsoft.com/">
            <button class="btn ie-go">Go</button>
          </div>
        </div>
        <div class="ie-content inset"></div>
      `,
    });

    const win = WindowManager.getWindow(id);
    win.querySelector('.ie-back').addEventListener('click', () => { Win98Sound.click(); navigate('home'); });
    win.querySelector('.ie-forward').addEventListener('click', () => Win98Sound.click());
    win.querySelector('.ie-stop').addEventListener('click', () => Win98Sound.click());
    win.querySelector('.ie-refresh').addEventListener('click', () => { Win98Sound.click(); navigate(currentPage); });
    win.querySelector('.ie-home').addEventListener('click', () => { Win98Sound.click(); navigate('home'); });
    win.querySelector('.ie-go').addEventListener('click', () => { Win98Sound.click(); Win98Sound.notify(); });

    navigate(url || 'home');
  }

  function openMinesweeper() {
    const id = 'minesweeper';
    if (WindowManager.isOpen(id)) {
      WindowManager.focusWindow(id);
      return;
    }

    const ROWS = 9, COLS = 9, MINES = 10;
    let grid, revealed, flagged, gameOver, gameWon, flagsLeft;

    function initGame() {
      grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
      revealed = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
      flagged = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
      gameOver = false;
      gameWon = false;
      flagsLeft = MINES;

      let placed = 0;
      while (placed < MINES) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        if (grid[r][c] !== -1) {
          grid[r][c] = -1;
          placed++;
        }
      }

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c] === -1) continue;
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === -1) count++;
            }
          }
          grid[r][c] = count;
        }
      }
      render();
    }

    function render() {
      const win = WindowManager.getWindow(id);
      if (!win) return;
      const container = win.querySelector('.minesweeper');
      const mineCount = container.querySelector('.mine-counter:first-child');
      const face = container.querySelector('.mine-face');
      const gridEl = container.querySelector('.mine-grid');

      mineCount.textContent = String(flagsLeft).padStart(3, '0');
      face.textContent = gameOver ? '😵' : gameWon ? '😎' : '🙂';

      gridEl.style.gridTemplateColumns = `repeat(${COLS}, 16px)`;
      gridEl.innerHTML = '';

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = document.createElement('button');
          cell.className = 'mine-cell';
          cell.dataset.row = r;
          cell.dataset.col = c;

          if (revealed[r][c]) {
            cell.classList.add('revealed');
            if (grid[r][c] === -1) {
              cell.classList.add('mine');
            } else if (grid[r][c] > 0) {
              cell.textContent = grid[r][c];
              cell.classList.add(`n${grid[r][c]}`);
            }
          } else if (flagged[r][c]) {
            cell.classList.add('flagged');
          }

          cell.addEventListener('click', () => handleClick(r, c));
          cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            handleFlag(r, c);
          });

          gridEl.appendChild(cell);
        }
      }
    }

    function handleClick(r, c) {
      if (gameOver || gameWon || flagged[r][c] || revealed[r][c]) return;
      Win98Sound.click();

      if (grid[r][c] === -1) {
        gameOver = true;
        for (let i = 0; i < ROWS; i++) {
          for (let j = 0; j < COLS; j++) {
            if (grid[i][j] === -1) revealed[i][j] = true;
          }
        }
        Win98Sound.mineExplode();
        render();
        return;
      }

      floodReveal(r, c);
      checkWin();
      render();
    }

    function floodReveal(r, c) {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || revealed[r][c] || flagged[r][c]) return;
      revealed[r][c] = true;
      if (grid[r][c] === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            floodReveal(r + dr, c + dc);
          }
        }
      }
    }

    function handleFlag(r, c) {
      if (gameOver || gameWon || revealed[r][c]) return;
      Win98Sound.click();
      flagged[r][c] = !flagged[r][c];
      flagsLeft += flagged[r][c] ? -1 : 1;
      render();
    }

    function checkWin() {
      let unrevealedSafe = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!revealed[r][c] && grid[r][c] !== -1) unrevealedSafe++;
        }
      }
      if (unrevealedSafe === 0) {
        gameWon = true;
        Win98Sound.mineWin();
      }
    }

    WindowManager.createWindow({
      id,
      title: 'Minesweeper',
      icon: ICONS.minesweeper,
      width: 200,
      height: 280,
      resizable: false,
      menuBar: true,
      content: `
        <div class="minesweeper" style="margin:4px">
          <div class="mine-header inset">
            <div class="mine-counter">010</div>
            <button class="mine-face btn outset">🙂</button>
            <div class="mine-counter">010</div>
          </div>
          <div class="mine-grid"></div>
        </div>
      `,
    });

    const win = WindowManager.getWindow(id);
    win.querySelector('.mine-face').addEventListener('click', () => {
      Win98Sound.click();
      initGame();
    });

    initGame();
  }

  function openAbout() {
    showDialog(
      'About Windows',
      'Microsoft Windows 98\n\nVersion 4.10.1998\n\n(C) 1981-1998 Microsoft Corp.\n\nThis is a fan-made HTML recreation.',
      'info'
    );
  }

  function setupMenuBar(win, windowId, actions) {
    const items = win.querySelectorAll('.menu-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        Win98Sound.menuPopup();
        items.forEach(i => i.classList.remove('open'));
        item.classList.toggle('open');
      });
    });

    win.querySelectorAll('.menu-dropdown-item').forEach(dropItem => {
      dropItem.addEventListener('click', (e) => {
        e.stopPropagation();
        Win98Sound.click();
        const action = dropItem.dataset.action;
        if (actions[action]) actions[action]();
        items.forEach(i => i.classList.remove('open'));
      });
    });
  }

  function showDialog(title, message, type = 'info') {
    const icons = { info: 'ℹ️', warning: '⚠️', error: '❌', question: '❓' };
    if (type === 'error') Win98Sound.error();
    else Win98Sound.notify();

    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.innerHTML = `
      <div class="dialog">
        <div class="title-bar">
          <span class="title-bar-text" style="flex:1">${title}</span>
          <div class="title-bar-controls">
            <button class="title-btn dialog-close">×</button>
          </div>
        </div>
        <div class="dialog-body">
          <div class="dialog-icon">${icons[type] || icons.info}</div>
          <div class="dialog-message">${message.replace(/\n/g, '<br>')}</div>
        </div>
        <div class="dialog-buttons">
          <button class="btn dialog-ok">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('.dialog-ok').addEventListener('click', () => { Win98Sound.click(); close(); });
    overlay.querySelector('.dialog-close').addEventListener('click', () => { Win98Sound.click(); close(); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  }

  return {
    ICONS,
    openMyComputer,
    openRecycleBin,
    openNotepad,
    openInternetExplorer,
    openMinesweeper,
    openAbout,
    showDialog,
  };
})();

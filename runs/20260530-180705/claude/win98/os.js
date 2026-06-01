/* ============================================================
   Windows 98 — OS shell: boot, window manager, taskbar, tour
   ============================================================ */
(() => {
  const $ = s => document.querySelector(s);
  const win = $('#windows'), tasks = $('#tasks'), startmenu = $('#startmenu'),
        startbtn = $('#startbtn'), desktop = $('#desktop');
  let z = 100, openWins = {}, idc = 0;

  /* ---------- clock ---------- */
  function tick(){
    const d = new Date();
    let h = d.getHours(), m = d.getMinutes(), ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    $('#clock').textContent = `${h}:${String(m).padStart(2,'0')} ${ap}`;
  }
  setInterval(tick, 1000);

  /* ---------- desktop icons ---------- */
  const desktopApps = [
    ['mycomputer','My Computer','icons/computer.svg'],
    ['documents','My Documents','icons/folder.svg'],
    ['ie','Internet Explorer','icons/ie.svg'],
    ['recycle','Recycle Bin','icons/recycle.svg'],
    ['notepad','Notepad','icons/notepad.svg'],
    ['paint','Paint','icons/paint.svg'],
    ['mines','Minesweeper','icons/mines.svg'],
    ['calc','Calculator','icons/calc.svg'],
    ['media','Media Player','icons/media.svg'],
  ];
  function buildIcons(){
    const c = $('#icons');
    desktopApps.forEach(([app,label,ic]) => {
      const d = document.createElement('div'); d.className = 'dicon'; d.dataset.app = app;
      d.innerHTML = `<img src="${ic}"><span>${label}</span>`;
      d.addEventListener('click', e => {
        c.querySelectorAll('.dicon').forEach(x => x.classList.remove('selected'));
        d.classList.add('selected');
      });
      d.addEventListener('dblclick', () => openApp(app));
      c.appendChild(d);
    });
  }
  desktop.addEventListener('mousedown', e => {
    if (e.target === desktop || e.target.id === 'icons')
      $('#icons').querySelectorAll('.dicon').forEach(x => x.classList.remove('selected'));
    closeStart();
  });

  /* ---------- window manager ---------- */
  function openApp(appKey){
    const def = Apps[appKey];
    if (!def) return;
    // already open -> focus / restore
    if (openWins[appKey]) { restore(openWins[appKey]); return; }
    Sound.open();
    const id = 'w' + (idc++);
    const w = document.createElement('div');
    w.className = 'window'; w.style.zIndex = ++z;
    const ww = def.w || 300, wh = def.h || 280;
    const offset = (Object.keys(openWins).length % 6) * 24;
    w.style.width = ww + 'px';
    if (def.h) w.style.height = wh + 'px';
    w.style.left = (90 + offset) + 'px';
    w.style.top  = (40 + offset) + 'px';

    const menu = (def.menu || []).map(m => `<span>${m[0]}<u></u>${m.slice(1)}</span>`)
      .map((s,i)=>`<span>${def.menu[i]}</span>`).join('');
    w.innerHTML = `
      <div class="titlebar">
        <img src="${def.icon}"><span class="ttl">${def.title}</span>
        <div class="tb-btns">
          <div class="tb-btn" data-act="min">_</div>
          <div class="tb-btn" data-act="max">□</div>
          <div class="tb-btn" data-act="close">✕</div>
        </div>
      </div>
      ${def.menu ? `<div class="menubar">${menu}</div>` : ''}
      <div class="win-body"></div>`;
    win.appendChild(w);
    def.build(w.querySelector('.win-body'));

    const rec = { id, app: appKey, el: w, def, min: false, max: false, prev: null };
    openWins[appKey] = rec;

    // focus
    const focus = () => {
      Object.values(openWins).forEach(r => r.el.classList.add('inactive'));
      w.classList.remove('inactive'); w.style.zIndex = ++z;
      Object.values(openWins).forEach(r => r.taskBtn && r.taskBtn.classList.remove('active'));
      rec.taskBtn && rec.taskBtn.classList.add('active');
    };
    w.addEventListener('mousedown', () => { focus(); });

    // title bar buttons
    w.querySelectorAll('.tb-btn').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const act = b.dataset.act;
      if (act === 'close') closeWin(rec);
      else if (act === 'min') minimize(rec);
      else if (act === 'max') toggleMax(rec);
    }));

    dragify(w, w.querySelector('.titlebar'), rec);
    addTaskBtn(rec);
    focus();
    return rec;
  }

  function addTaskBtn(rec){
    const b = document.createElement('div'); b.className = 'task-btn active';
    b.innerHTML = `<img src="${rec.def.icon}"><span>${rec.def.title}</span>`;
    b.addEventListener('click', () => {
      if (rec.el.classList.contains('inactive') || rec.min) restore(rec);
      else minimize(rec);
    });
    rec.taskBtn = b; tasks.appendChild(b);
  }

  function minimize(rec){ rec.min = true; rec.el.style.display = 'none';
    rec.taskBtn.classList.remove('active'); Sound.click(); }
  function restore(rec){ rec.min = false; rec.el.style.display = 'flex'; rec.el.style.zIndex = ++z;
    Object.values(openWins).forEach(r => { r.el.classList.add('inactive'); r.taskBtn && r.taskBtn.classList.remove('active'); });
    rec.el.classList.remove('inactive'); rec.taskBtn.classList.add('active'); }
  function toggleMax(rec){
    const w = rec.el;
    if (!rec.max){ rec.prev = { l:w.style.left, t:w.style.top, ww:w.style.width, h:w.style.height };
      w.style.left='0'; w.style.top='0'; w.style.width='100%'; w.style.height='calc(100% - 30px)'; rec.max=true; }
    else { w.style.left=rec.prev.l; w.style.top=rec.prev.t; w.style.width=rec.prev.ww; w.style.height=rec.prev.h; rec.max=false; }
    Sound.click();
  }
  function closeWin(rec){ Sound.close(); rec.el.remove(); rec.taskBtn.remove(); delete openWins[rec.app]; }

  function dragify(w, handle, rec){
    let down=false, ox=0, oy=0;
    handle.addEventListener('mousedown', e => {
      if (e.target.closest('.tb-btn')) return;
      if (rec.max) return;
      down=true; ox=e.clientX - w.offsetLeft; oy=e.clientY - w.offsetTop;
      document.body.style.cursor='default';
    });
    window.addEventListener('mousemove', e => {
      if(!down) return;
      let nx=e.clientX-ox, ny=e.clientY-oy;
      ny=Math.max(0,Math.min(ny, window.innerHeight-60));
      w.style.left=nx+'px'; w.style.top=ny+'px';
    });
    window.addEventListener('mouseup', ()=> down=false);
  }

  /* ---------- start menu ---------- */
  function openStart(){ startmenu.classList.remove('hidden'); startbtn.classList.add('on'); Sound.click(); }
  function closeStart(){ startmenu.classList.add('hidden'); startbtn.classList.remove('on');
    document.querySelectorAll('.submenu').forEach(s=>s.remove()); }
  startbtn.addEventListener('click', e => { e.stopPropagation();
    startmenu.classList.contains('hidden') ? openStart() : closeStart(); });

  startmenu.addEventListener('click', e => {
    const it = e.target.closest('.sm-item'); if(!it) return;
    if (it.id === 'sm-shutdown'){ shutdown(); return; }
    if (it.dataset.app){ openApp(it.dataset.app); closeStart(); return; }
    if (it.dataset.sub === 'programs'){ showPrograms(it); return; }
  });
  function showPrograms(anchor){
    document.querySelectorAll('.submenu').forEach(s=>s.remove());
    const sm = document.createElement('div'); sm.className='submenu';
    const list = [['notepad','Notepad','icons/notepad.svg'],['paint','Paint','icons/paint.svg'],
      ['calc','Calculator','icons/calc.svg'],['mines','Minesweeper','icons/mines.svg'],
      ['media','Media Player','icons/media.svg'],['ie','Internet Explorer','icons/ie.svg'],
      ['mycomputer','Windows Explorer','icons/computer.svg']];
    sm.innerHTML = list.map(([a,n,i])=>`<div class="sm-item" data-app="${a}"><img class="sm-ico" src="${i}"><span>${n}</span></div>`).join('');
    const r = anchor.getBoundingClientRect();
    sm.style.left = (r.right - 4) + 'px'; sm.style.bottom = (window.innerHeight - r.bottom - 4) + 'px';
    desktop.appendChild(sm);
    sm.addEventListener('click', e=>{ const it=e.target.closest('.sm-item'); if(it){ openApp(it.dataset.app); closeStart(); } });
  }

  /* quick launch + tray */
  $('.quick-launch').addEventListener('click', e=>{ const t=e.target.closest('[data-app]'); if(t) openApp(t.dataset.app); });
  $('#tray-sound').addEventListener('click', ()=> Sound.chord());

  /* ---------- shutdown ---------- */
  function shutdown(){
    closeStart();
    const ov = document.createElement('div'); ov.className='screen';
    ov.style.cssText='background:rgba(0,0,0,.4);z-index:99999;display:flex;align-items:center;justify-content:center;';
    ov.innerHTML = `<div class="window" style="width:340px;position:static;">
      <div class="titlebar"><span class="ttl">Shut Down Windows</span></div>
      <div class="dlg-body">
        <div class="dlg-row"><img src="icons/shutdown.svg">
          <div><p class="dlg-p"><b>Are you sure you want to shut down<br>the computer?</b></p></div></div>
        <div class="dlg-btns">
          <button class="w98" id="yes-shut">Yes</button>
          <button class="w98" id="no-shut">No</button>
        </div></div></div>`;
    desktop.appendChild(ov);
    ov.querySelector('#no-shut').onclick=()=>{ Sound.click(); ov.remove(); };
    ov.querySelector('#yes-shut').onclick=()=>{ Sound.tada(); ov.remove();
      desktop.classList.add('hidden');
      const sd=$('#shutdown-screen'); sd.classList.remove('hidden');
      sd.style.background='#000'; sd.style.display='flex'; sd.style.alignItems='center'; sd.style.justifyContent='center';
    };
  }

  /* ===================== BOOT SEQUENCE ===================== */
  function boot(){
    // BIOS memory count
    let mem = 0; const memEl = $('#bios-mem');
    const memTimer = setInterval(()=>{ mem += 8192; memEl.textContent = `Memory Test : ${mem}K OK`;
      if (mem >= 65536){ clearInterval(memTimer); } }, 60);

    setTimeout(()=>{ // BIOS -> splash
      $('#bios').classList.add('hidden');
      $('#splash').classList.remove('hidden');
    }, 2200);

    setTimeout(()=>{ // splash -> desktop + startup sound
      $('#splash').classList.add('hidden');
      desktop.classList.remove('hidden');
      tick();
      try { Sound.startup(); } catch(e){}
      // welcome window
      setTimeout(welcomeWindow, 600);
      // auto-tour
      if (!location.hash.includes('notour')) setTimeout(tour, 1600);
    }, 5600);
  }

  function welcomeWindow(){
    const rec = openApp('mycomputer'); // ensures something is up
  }

  /* ===================== AUTO TOUR =====================
     Open each application, one every 2 seconds, to showcase. */
  function tour(){
    // close the initial my computer first
    const order = ['notepad','paint','calc','mines','mycomputer','ie','media','recycle','documents'];
    // tidy: close any pre-opened windows
    Object.values(openWins).forEach(r => closeWin(r));
    let i = 0;
    log('Starting application showcase tour…');
    function step(){
      if (i >= order.length){
        log('Tour complete — all applications shown.');
        document.body.dataset.tourDone = '1';
        return;
      }
      const app = order[i++];
      log('Opening: ' + app);
      const rec = openApp(app);
      // cascade nicely
      if (rec){ rec.el.style.left = (60 + (i*30)) + 'px'; rec.el.style.top = (30 + (i*22)) + 'px'; }
      document.body.dataset.lastOpened = app;
      setTimeout(step, 2000);
    }
    step();
  }
  function log(msg){ // expose progress for the screenshot driver
    document.body.dataset.tourLog = msg;
    console.log('[TOUR] ' + msg);
  }

  /* ---------- init ---------- */
  buildIcons();
  // resume audio on first user gesture (autoplay policy)
  ['click','keydown'].forEach(ev => window.addEventListener(ev, ()=>Sound.resume(), { once:true }));
  // expose for the headless driver to trigger sound + skip waits
  window.W98 = { openApp, tour, boot };
  boot();
})();

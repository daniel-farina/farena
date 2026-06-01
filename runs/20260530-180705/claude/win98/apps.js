/* ============================================================
   Application definitions. Each returns:
   { title, icon, w, h, build(body) }  -> build fills the .win-body
   ============================================================ */
const Apps = {};

/* ---------- Notepad ---------- */
Apps.notepad = {
  title: 'Untitled - Notepad', icon: 'icons/notepad.svg', w: 420, h: 300,
  menu: ['File','Edit','Search','Help'],
  build(body){
    const ta = document.createElement('textarea');
    ta.className = 'notepad-area';
    ta.spellcheck = false;
    ta.value =
`Welcome to Windows 98.

      .---.
     /     \\
     | () () |
      \\  ^  /
       |||||
       |||||

This is a faithful HTML re-creation of the classic
Microsoft Windows 98 desktop — built entirely with
HTML, CSS and JavaScript. All sounds are synthesized
live with the Web Audio API.

Try the other programs:
  * Paint        - draw with your mouse
  * Minesweeper  - the all-time time-waster
  * Calculator   - it actually calculates
  * Internet Explorer - surf the '98 web
  * My Computer  - browse your drives

Drag the title bars. Resize. Minimize. Enjoy!
`;
    body.appendChild(ta);
  }
};

/* ---------- Calculator ---------- */
Apps.calc = {
  title: 'Calculator', icon: 'icons/calc.svg', w: 220, h: 250,
  menu: ['Edit','View','Help'],
  build(body){
    const wrap = document.createElement('div'); wrap.className='calc';
    wrap.innerHTML = `<div class="calc-disp field" id="calc-disp">0.</div>
      <div class="calc-grid"></div>`;
    body.appendChild(wrap);
    const grid = wrap.querySelector('.calc-grid');
    const disp = wrap.querySelector('#calc-disp');
    const keys = ['Back','CE','C','/','sqrt',
                  '7','8','9','*','%',
                  '4','5','6','-','1/x',
                  '1','2','3','+','=',
                  '0','+/-','.','',''];
    let cur='0', prev=null, op=null, fresh=true;
    const show=()=> disp.textContent = cur + (cur.includes('.')?'':'.');
    function press(k){
      Sound.click();
      if(/[0-9]/.test(k)){ if(fresh||cur==='0'){cur=k;fresh=false;} else cur+=k; }
      else if(k==='.'){ if(!cur.includes('.')) cur+='.'; fresh=false; }
      else if(k==='C'){ cur='0'; prev=null; op=null; fresh=true; }
      else if(k==='CE'){ cur='0'; fresh=true; }
      else if(k==='Back'){ cur=cur.length>1?cur.slice(0,-1):'0'; }
      else if(k==='+/-'){ cur=(parseFloat(cur)*-1).toString(); }
      else if(k==='sqrt'){ cur=Math.sqrt(parseFloat(cur)).toString(); }
      else if(k==='1/x'){ cur=(1/parseFloat(cur)).toString(); }
      else if(k==='%'){ cur=(parseFloat(cur)/100).toString(); }
      else if(['+','-','*','/'].includes(k)){ if(op&&!fresh) calc(); prev=parseFloat(cur); op=k; fresh=true; }
      else if(k==='='){ calc(); op=null; }
      show();
    }
    function calc(){
      if(op===null||prev===null) return;
      const b=parseFloat(cur);
      let r=prev;
      if(op==='+')r=prev+b; if(op==='-')r=prev-b; if(op==='*')r=prev*b; if(op==='/')r=b?prev/b:0;
      cur=(Math.round(r*1e10)/1e10).toString(); prev=r; fresh=true;
    }
    keys.forEach(k=>{
      const b=document.createElement('button');
      if(k===''){ b.style.visibility='hidden'; grid.appendChild(b); return; }
      b.textContent=k;
      if(['+','-','*','/','='].includes(k)) b.className='calc-op';
      if(['sqrt','%','1/x','Back','CE','C','+/-'].includes(k)) b.className='calc-fn';
      b.onclick=()=>press(k);
      grid.appendChild(b);
    });
  }
};

/* ---------- Paint ---------- */
Apps.paint = {
  title: 'untitled - Paint', icon: 'icons/paint.svg', w: 520, h: 380,
  menu: ['File','Edit','View','Image','Colors','Help'],
  build(body){
    const wrap=document.createElement('div'); wrap.className='paint';
    wrap.innerHTML=`
      <div class="paint-tools out" id="ptools"></div>
      <div class="paint-right">
        <div class="paint-canvas-wrap in"><canvas id="paint-canvas" width="420" height="250"></canvas></div>
        <div class="paint-palette out" id="ppal"></div>
      </div>`;
    body.appendChild(wrap);
    const canvas=wrap.querySelector('#paint-canvas');
    const cx=canvas.getContext('2d');
    cx.fillStyle='#fff'; cx.fillRect(0,0,canvas.width,canvas.height);
    let color='#000', tool='pencil', size=2, drawing=false, sx,sy;
    let snapshot=null;
    const tools=[['✏️','pencil'],['🖌️','brush'],['🪣','fill'],['／','line'],['▭','rect'],['◯','ellipse'],['🧹','eraser'],['🔤','text']];
    const tcont=wrap.querySelector('#ptools');
    tools.forEach(([ico,t],i)=>{
      const b=document.createElement('div'); b.className='ptool'+(t==='pencil'?' sel':''); b.textContent=ico;
      b.onclick=()=>{ tool=t; size=(t==='brush')?6:(t==='eraser')?12:2; tcont.querySelectorAll('.ptool').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); Sound.click(); };
      tcont.appendChild(b);
    });
    const cols=['#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
                '#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff'];
    const pal=wrap.querySelector('#ppal');
    cols.forEach(c=>{ const d=document.createElement('div'); d.className='pcolor'; d.style.background=c;
      d.onclick=()=>{ color=c; Sound.click(); }; pal.appendChild(d); });
    function pos(e){ const r=canvas.getBoundingClientRect(); return [e.clientX-r.left, e.clientY-r.top]; }
    function flood(x,y){
      const img=cx.getImageData(0,0,canvas.width,canvas.height), d=img.data;
      const idx=(x,y)=>(y*canvas.width+x)*4;
      const t=idx(x,y), tc=[d[t],d[t+1],d[t+2],d[t+3]];
      const tmp=document.createElement('canvas').getContext('2d'); tmp.fillStyle=color; tmp.fillRect(0,0,1,1);
      const nc=tmp.getImageData(0,0,1,1).data;
      if(tc[0]===nc[0]&&tc[1]===nc[1]&&tc[2]===nc[2]) return;
      const st=[[x,y]];
      while(st.length){ const [cxp,cyp]=st.pop(); if(cxp<0||cyp<0||cxp>=canvas.width||cyp>=canvas.height) continue;
        const i=idx(cxp,cyp); if(d[i]!==tc[0]||d[i+1]!==tc[1]||d[i+2]!==tc[2]||d[i+3]!==tc[3]) continue;
        d[i]=nc[0]; d[i+1]=nc[1]; d[i+2]=nc[2]; d[i+3]=255;
        st.push([cxp+1,cyp],[cxp-1,cyp],[cxp,cyp+1],[cxp,cyp-1]); }
      cx.putImageData(img,0,0);
    }
    canvas.onmousedown=e=>{ [sx,sy]=pos(e); drawing=true;
      if(tool==='fill'){ flood(Math.floor(sx),Math.floor(sy)); drawing=false; return; }
      if(tool==='text'){ const t=prompt('Text:'); if(t){ cx.fillStyle=color; cx.font='16px Tahoma'; cx.fillText(t,sx,sy);} drawing=false; return;}
      snapshot=cx.getImageData(0,0,canvas.width,canvas.height);
      cx.beginPath(); cx.moveTo(sx,sy);
    };
    canvas.onmousemove=e=>{ if(!drawing) return; const [x,y]=pos(e);
      cx.lineCap='round'; cx.lineWidth=size;
      cx.strokeStyle = tool==='eraser'?'#fff':color; cx.fillStyle=cx.strokeStyle;
      if(tool==='pencil'||tool==='brush'||tool==='eraser'){ cx.lineTo(x,y); cx.stroke(); }
      else { cx.putImageData(snapshot,0,0); cx.beginPath();
        if(tool==='line'){ cx.moveTo(sx,sy); cx.lineTo(x,y); cx.stroke(); }
        if(tool==='rect'){ cx.strokeRect(Math.min(sx,x),Math.min(sy,y),Math.abs(x-sx),Math.abs(y-sy)); }
        if(tool==='ellipse'){ cx.ellipse((sx+x)/2,(sy+y)/2,Math.abs(x-sx)/2,Math.abs(y-sy)/2,0,0,7); cx.stroke(); }
      }
    };
    window.addEventListener('mouseup',()=>drawing=false);
    // pre-draw a little smiley so the canvas isn't blank in the showcase
    setTimeout(()=>{ cx.strokeStyle='#ff0000'; cx.lineWidth=3;
      cx.beginPath(); cx.arc(210,120,60,0,7); cx.stroke();
      cx.fillStyle='#0000ff'; cx.beginPath(); cx.arc(190,105,7,0,7); cx.arc(230,105,7,0,7); cx.fill();
      cx.strokeStyle='#008000'; cx.beginPath(); cx.arc(210,130,30,0.2*Math.PI,0.8*Math.PI); cx.stroke();
      cx.fillStyle='#ff00ff'; cx.font='bold 18px Tahoma'; cx.fillText('Paint!',150,210);
    },300);
  }
};

/* ---------- Minesweeper ---------- */
Apps.mines = {
  title: 'Minesweeper', icon: 'icons/mines.svg', w: 0, h: 0,
  menu: ['Game','Help'],
  build(body){
    const C=9,R=9,M=10;
    const wrap=document.createElement('div'); wrap.className='mine';
    wrap.innerHTML=`<div class="mine-head out">
        <div class="mine-lcd" id="m-flags">010</div>
        <div class="mine-face out" id="m-face">🙂</div>
        <div class="mine-lcd" id="m-time">000</div>
      </div><div class="mine-grid in" id="m-grid" style="grid-template-columns:repeat(${C},20px)"></div>`;
    body.appendChild(wrap);
    const grid=wrap.querySelector('#m-grid'), face=wrap.querySelector('#m-face');
    const flagsEl=wrap.querySelector('#m-flags'), timeEl=wrap.querySelector('#m-time');
    let cells=[], mines=new Set(), revealed=0, flags=0, over=false, t=0, timer=null, started=false;
    function pad(n){ return String(Math.max(0,n)).padStart(3,'0'); }
    function reset(){
      grid.innerHTML=''; cells=[]; mines=new Set(); revealed=0; flags=0; over=false; started=false; t=0;
      clearInterval(timer); timeEl.textContent='000'; flagsEl.textContent=pad(M); face.textContent='🙂';
      while(mines.size<M) mines.add(Math.floor(Math.random()*C*R));
      for(let i=0;i<C*R;i++){
        const c=document.createElement('div'); c.className='cell'; c.dataset.i=i;
        c.onmousedown=e=>{ if(over) return; if(e.button===2){ e.preventDefault(); toggleFlag(i); }
          else { face.textContent='😮'; } };
        c.onclick=()=>{ if(!over) reveal(i); };
        c.oncontextmenu=e=>{ e.preventDefault(); if(!over) toggleFlag(i); };
        grid.appendChild(c); cells.push(c);
      }
    }
    function neighbors(i){ const r=Math.floor(i/C), cc=i%C, out=[];
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){ if(!dr&&!dc)continue;
        const nr=r+dr, nc=cc+dc; if(nr>=0&&nr<R&&nc>=0&&nc<C) out.push(nr*C+nc); } return out; }
    function count(i){ return neighbors(i).filter(n=>mines.has(n)).length; }
    function toggleFlag(i){ const c=cells[i]; if(c.classList.contains('open'))return;
      if(c.textContent==='🚩'){ c.textContent=''; flags--; } else { c.textContent='🚩'; flags++; }
      Sound.click(); flagsEl.textContent=pad(M-flags); }
    function reveal(i){
      const c=cells[i]; if(c.classList.contains('open')||c.textContent==='🚩') return;
      if(!started){ started=true; timer=setInterval(()=>{ t++; timeEl.textContent=pad(t); },1000); }
      face.textContent='🙂';
      if(mines.has(i)){ lose(i); return; }
      c.classList.add('open'); revealed++;
      const n=count(i);
      if(n){ c.textContent=n; c.classList.add('c'+n); }
      else neighbors(i).forEach(reveal);
      if(revealed===C*R-M) win();
    }
    function lose(i){ over=true; clearInterval(timer); face.textContent='😵'; Sound.boom();
      mines.forEach(m=>{ if(!cells[m].textContent.includes('🚩')){ cells[m].classList.add('open','mine'); cells[m].textContent='💣'; } });
      cells[i].style.background='#f00'; }
    function win(){ over=true; clearInterval(timer); face.textContent='😎'; Sound.tada(); }
    face.onclick=()=>{ Sound.click(); reset(); };
    reset();
  }
};

/* ---------- My Computer / Explorer ---------- */
Apps.mycomputer = {
  title: 'My Computer', icon: 'icons/computer.svg', w: 460, h: 320,
  menu: ['File','Edit','View','Go','Favorites','Help'],
  build(body){
    const items=[
      ['icons/floppy.svg','3½ Floppy (A:)'],['icons/drive.svg','(C:)'],
      ['icons/cd.svg','(D:)'],['icons/folder.svg','Control Panel'],
      ['icons/folder.svg','Printers'],['icons/folder.svg','Dial-Up Networking']];
    const wrap=document.createElement('div'); wrap.className='explorer';
    wrap.innerHTML=`
      <div class="explorer-bar">
        <span>Address</span>
        <div class="field" style="flex:1;display:flex;align-items:center;gap:4px;padding:2px 4px;">
          <img src="icons/computer.svg" style="width:16px;height:16px;"> My Computer</div>
      </div>
      <div class="explorer-body" id="ex-body"></div>`;
    body.appendChild(wrap);
    const b=wrap.querySelector('#ex-body');
    items.forEach(([ic,nm])=>{ const it=document.createElement('div'); it.className='ex-item';
      it.innerHTML=`<img src="${ic}"><span>${nm}</span>`; b.appendChild(it); });
  }
};

/* ---------- Internet Explorer ---------- */
Apps.ie = {
  title: 'MSN.com - Microsoft Internet Explorer', icon: 'icons/ie.svg', w: 560, h: 400,
  menu: ['File','Edit','View','Go','Favorites','Help'],
  build(body){
    const wrap=document.createElement('div'); wrap.className='ie-page';
    wrap.innerHTML=`
      <div class="ie-nav out">
        <button class="w98" style="min-width:auto">&#9664; Back</button>
        <button class="w98" style="min-width:auto">Forward &#9654;</button>
        <button class="w98" style="min-width:auto">Stop</button>
        <button class="w98" style="min-width:auto">Refresh</button>
        <button class="w98" style="min-width:auto">Home</button>
      </div>
      <div class="ie-nav out" style="border-top:0">
        <span>Address</span>
        <div class="field" style="flex:1;padding:2px 6px;">http://www.msn.com/</div>
        <button class="w98" style="min-width:auto">Go</button>
      </div>
      <div class="ie-content">
        <div class="ie-marquee"><span>★ Welcome to the World Wide Web ★ Best viewed at 800×600 ★ This site is under construction ★ Sign our guestbook! ★</span></div>
        <div class="ie-hero">
          <h1>Welcome to the Internet</h1>
          <div>The information superhighway starts here.</div>
        </div>
        <div class="ie-body">
          <p><b>Today on the Web — May 30, 2026 (retro edition):</b></p>
          <ul style="margin:8px 0 8px 22px;line-height:1.8">
            <li><a href="#">📰 Headlines</a> — Y2K: should you be worried?</li>
            <li><a href="#">🎮 Games</a> — Top 10 shareware downloads</li>
            <li><a href="#">📧 Hotmail</a> — Free web-based e-mail!</li>
            <li><a href="#">🔍 Search the Web</a> — find anything in seconds</li>
          </ul>
          <p>You are visitor number <b style="font-family:monospace;background:#000;color:#0f0;padding:2px 6px">00013337</b></p>
          <p style="text-align:center">
            <svg class="under-construction" width="180" height="40" xmlns="http://www.w3.org/2000/svg">
              <rect width="180" height="40" fill="#ffd400"/>
              <rect width="180" height="40" fill="none" stroke="#000" stroke-width="3" stroke-dasharray="10 6"/>
              <text x="90" y="25" text-anchor="middle" font-family="Tahoma" font-weight="bold" font-size="13">🚧 UNDER CONSTRUCTION 🚧</text>
            </svg>
          </p>
          <p style="text-align:center;color:#888">Powered by a 56k modem. Please do not pick up the phone.</p>
        </div>
      </div>`;
    body.appendChild(wrap);
  }
};

/* ---------- Media Player ---------- */
Apps.media = {
  title: 'Windows Media Player', icon: 'icons/media.svg', w: 320, h: 220,
  menu: ['File','View','Play','Help'],
  build(body){
    const wrap=document.createElement('div'); wrap.className='amp';
    wrap.innerHTML=`
      <div class="amp-disp">
        <div class="amp-title" id="amp-title">♪ Windows 98 - The Microsoft Sound.mid</div>
        <div class="amp-time" id="amp-time">00:00</div>
        <div class="amp-viz" id="amp-viz"></div>
      </div>
      <div class="amp-ctrls">
        <button id="amp-play">▶ PLAY</button>
        <button id="amp-stop">■ STOP</button>
      </div>`;
    body.appendChild(wrap);
    const viz=wrap.querySelector('#amp-viz'); for(let i=0;i<24;i++) viz.appendChild(document.createElement('i'));
    const bars=[...viz.children]; const timeEl=wrap.querySelector('#amp-time');
    let playing=false, raf=null, sec=0, ticker=null;
    function loop(){ bars.forEach(b=> b.style.height=(10+Math.random()*90)+'%'); raf=requestAnimationFrame(()=>setTimeout(loop,80)); }
    wrap.querySelector('#amp-play').onclick=()=>{ if(playing)return; playing=true; Sound.tune(); loop();
      ticker=setInterval(()=>{ sec++; timeEl.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0'); },1000); };
    wrap.querySelector('#amp-stop').onclick=()=>{ playing=false; cancelAnimationFrame(raf); clearInterval(ticker);
      bars.forEach(b=>b.style.height='10%'); };
    // auto-play visualizer (silent) so showcase looks alive
    setTimeout(()=>{ if(!playing){ playing=true; loop(); ticker=setInterval(()=>{ sec++; timeEl.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0'); },1000);} },400);
  }
};

/* ---------- Recycle Bin ---------- */
Apps.recycle = {
  title: 'Recycle Bin', icon: 'icons/recycle.svg', w: 380, h: 240,
  menu: ['File','Edit','View','Help'],
  build(body){
    const wrap=document.createElement('div'); wrap.className='explorer';
    wrap.innerHTML=`<div class="explorer-bar"><span>Address</span>
      <div class="field" style="flex:1;display:flex;align-items:center;gap:4px;padding:2px 4px;">
      <img src="icons/recycle.svg" style="width:16px;height:16px;"> Recycle Bin</div></div>
      <div class="explorer-body" style="align-items:center;justify-content:center;color:#404040">
        <div style="text-align:center"><img src="icons/recycle.svg" style="width:48px;height:48px;opacity:.5"><br><br>The Recycle Bin is empty.</div>
      </div>`;
    body.appendChild(wrap);
  }
};

/* ---------- My Documents ---------- */
Apps.documents = {
  title: 'My Documents', icon: 'icons/folder.svg', w: 420, h: 280,
  menu: ['File','Edit','View','Go','Favorites','Help'],
  build(body){
    const items=[['icons/notepad.svg','Readme.txt'],['icons/paint.svg','My Picture.bmp'],
      ['icons/folder.svg','My Pictures'],['icons/folder.svg','My Music'],['icons/media.svg','welcome.wav']];
    const wrap=document.createElement('div'); wrap.className='explorer';
    wrap.innerHTML=`<div class="explorer-bar"><span>Address</span>
      <div class="field" style="flex:1;display:flex;align-items:center;gap:4px;padding:2px 4px;">
      <img src="icons/folder.svg" style="width:16px;height:16px;"> My Documents</div></div>
      <div class="explorer-body" id="doc-body"></div>`;
    body.appendChild(wrap);
    const b=wrap.querySelector('#doc-body');
    items.forEach(([ic,nm])=>{ const it=document.createElement('div'); it.className='ex-item';
      it.innerHTML=`<img src="${ic}"><span>${nm}</span>`; b.appendChild(it); });
  }
};

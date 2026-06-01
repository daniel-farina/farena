/* ============================================================
   Win98 sound engine — all audio synthesized with Web Audio API
   (no external files needed; works offline)
   ============================================================ */
const Sound = (() => {
  let ctx = null;
  function ac(){
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // generic tone
  function tone(freq, start, dur, type='sine', gain=0.2, glideTo=null){
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime + start);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + start + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.05);
  }

  // The iconic Windows 98 startup — a lush rising pad/chime
  function startup(){
    const c = ac();
    // chord swell pad
    const chord = [220, 277.18, 329.63, 440, 554.37]; // A maj-ish
    chord.forEach((f,i) => {
      const o = c.createOscillator(), g = c.createGain(), f2 = c.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = f;
      f2.type='lowpass'; f2.frequency.setValueAtTime(400,c.currentTime); f2.frequency.exponentialRampToValueAtTime(3500,c.currentTime+1.6);
      g.gain.setValueAtTime(0.0001,c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.05,c.currentTime+0.6+i*0.04);
      g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+3.4);
      o.connect(f2).connect(g).connect(c.destination);
      o.start(); o.stop(c.currentTime+3.6);
    });
    // sparkle bell sequence on top
    const bells = [880, 1108.7, 1318.5, 1760];
    bells.forEach((f,i)=> tone(f, 0.5+i*0.18, 1.2, 'sine', 0.18));
    tone(1318.5, 1.3, 1.8, 'triangle', 0.12);
  }

  function click(){ tone(900, 0, 0.03, 'square', 0.04); }
  function open(){ tone(520,0,0.06,'square',0.06); tone(780,0.05,0.08,'square',0.05); }
  function close(){ tone(500,0,0.05,'square',0.05,300); }
  function ding(){ // error / info
    tone(660,0,0.12,'sine',0.18); tone(660,0.16,0.18,'sine',0.18);
  }
  function chord(){ tone(523,0,0.5,'sine',0.12); tone(659,0,0.5,'sine',0.12); tone(784,0,0.5,'sine',0.12); }
  function tada(){ // shutdown / minesweeper win
    [523,587,659,784,1047].forEach((f,i)=>tone(f,i*0.1,0.4,'triangle',0.12));
  }
  function boom(){ // minesweeper lose
    const c=ac(); const o=c.createOscillator(),g=c.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(180,c.currentTime); o.frequency.exponentialRampToValueAtTime(40,c.currentTime+0.5);
    g.gain.setValueAtTime(0.25,c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.5);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+0.55);
  }
  // a short tune for media player
  function tune(){
    const notes=[[523,0],[659,.25],[784,.5],[659,.75],[523,1],[587,1.25],[523,1.5]];
    notes.forEach(([f,t])=>tone(f,t,0.3,'square',0.08));
  }

  return { startup, click, open, close, ding, chord, tada, boom, tune, resume:ac };
})();

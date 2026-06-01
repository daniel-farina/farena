/* ===================================================================
   sound.js — synthesized Windows-98-style sound effects.
   Uses the Web Audio API so no external audio files are required.
=================================================================== */
const Sound = (() => {
  let ctx = null;
  let master = null;
  let volume = 0.7;
  let muted = false;

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }

  function resume() { if (ctx && ctx.state === "suspended") ctx.resume(); }

  function setVolume(v) { volume = v; if (master) master.gain.value = muted ? 0 : v; }
  function setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : volume; }

  // A simple tone with an ADSR-ish envelope.
  function tone(freq, start, dur, type = "sine", peak = 0.3) {
    if (!ctx) return;
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  // glide between two frequencies
  function glide(f1, f2, start, dur, type = "sine", peak = 0.3) {
    if (!ctx) return;
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t0);
    osc.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  // short noise burst (for clicks / mechanical sounds)
  function noise(start, dur, peak = 0.15, hp = 1000) {
    if (!ctx) return;
    const t0 = ctx.currentTime + start;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = "highpass"; filt.frequency.value = hp;
    const g = ctx.createGain(); g.gain.value = peak;
    src.connect(filt); filt.connect(g); g.connect(master);
    src.start(t0);
  }

  // ---- named effects -------------------------------------------------
  const fx = {
    // The iconic ascending pad — our homage to the Win98 startup chord.
    startup() {
      init(); resume();
      const notes = [
        [392.0, 0.00, 1.6],   // G4
        [493.9, 0.18, 1.5],   // B4
        [587.3, 0.36, 1.4],   // D5
        [784.0, 0.55, 1.6],   // G5
      ];
      notes.forEach(([f, s, d]) => {
        tone(f, s, d, "sine", 0.22);
        tone(f * 2, s, d * 0.7, "triangle", 0.06);
      });
      // shimmering high sparkle
      glide(1568, 2093, 0.55, 1.3, "sine", 0.05);
      tone(196, 0.0, 1.8, "sine", 0.12); // low pad
    },
    shutdown() {
      init(); resume();
      glide(784, 196, 0, 1.4, "sine", 0.22);
      glide(587, 147, 0, 1.4, "triangle", 0.08);
    },
    click() { init(); resume(); noise(0, 0.03, 0.08, 2000); },
    open() { init(); resume(); glide(440, 660, 0, 0.12, "square", 0.08); },
    close() { init(); resume(); glide(660, 330, 0, 0.12, "square", 0.07); },
    minimize() { init(); resume(); glide(700, 350, 0, 0.15, "sine", 0.08); },
    maximize() { init(); resume(); glide(350, 700, 0, 0.15, "sine", 0.08); },
    error() {
      init(); resume();
      tone(330, 0, 0.18, "square", 0.18);
      tone(330, 0.22, 0.32, "square", 0.18);
    },
    ding() { init(); resume(); tone(880, 0, 0.12, "sine", 0.2); tone(1320, 0.02, 0.25, "sine", 0.12); },
    tada() {
      init(); resume();
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.5, "triangle", 0.16));
    },
    menu() { init(); resume(); tone(1200, 0, 0.02, "sine", 0.04); },
    explode() {
      init(); resume();
      noise(0, 0.5, 0.4, 100);
      glide(200, 40, 0, 0.5, "sawtooth", 0.25);
    },
    beep() { init(); resume(); tone(800, 0, 0.15, "square", 0.15); },
    type() { init(); resume(); noise(0, 0.015, 0.04, 3000); },
  };

  function play(name) { try { (fx[name] || (() => {}))(); } catch (e) {} }

  return { init, resume, play, setVolume, setMuted };
})();

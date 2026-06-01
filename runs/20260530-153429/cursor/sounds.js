/**
 * Windows 98 sound synthesis via Web Audio API
 */
const Win98Sound = (() => {
  let ctx = null;

  function getContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  function resume() {
    const c = getContext();
    if (c.state === 'suspended') c.resume();
    return c;
  }

  function tone(freq, duration, type = 'square', volume = 0.08, startTime = 0) {
    const c = getContext();
    const t = c.currentTime + startTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  function noise(duration, volume = 0.06) {
    const c = getContext();
    const t = c.currentTime;
    const bufferSize = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * volume;
    }
    const source = c.createBufferSource();
    source.buffer = buffer;
    const gain = c.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(gain);
    gain.connect(c.destination);
    source.start(t);
    source.stop(t + duration);
  }

  return {
    init() { resume(); },

    click() {
      resume();
      tone(1200, 0.03, 'square', 0.04);
      tone(800, 0.02, 'square', 0.03, 0.01);
    },

    menuPopup() {
      resume();
      tone(600, 0.04, 'sine', 0.06);
      tone(900, 0.03, 'sine', 0.05, 0.02);
    },

    windowOpen() {
      resume();
      tone(440, 0.06, 'sine', 0.07);
      tone(660, 0.05, 'sine', 0.06, 0.04);
      tone(880, 0.04, 'sine', 0.05, 0.08);
    },

    windowClose() {
      resume();
      tone(880, 0.04, 'sine', 0.06);
      tone(660, 0.04, 'sine', 0.05, 0.03);
      tone(440, 0.05, 'sine', 0.04, 0.06);
    },

    minimize() {
      resume();
      tone(500, 0.05, 'triangle', 0.05);
      tone(300, 0.08, 'triangle', 0.04, 0.04);
    },

    maximize() {
      resume();
      tone(300, 0.05, 'triangle', 0.05);
      tone(500, 0.06, 'triangle', 0.04, 0.04);
    },

    error() {
      resume();
      tone(200, 0.15, 'square', 0.1);
      tone(150, 0.2, 'square', 0.08, 0.1);
      tone(100, 0.25, 'square', 0.06, 0.2);
    },

    notify() {
      resume();
      tone(784, 0.1, 'sine', 0.07);
      tone(988, 0.12, 'sine', 0.06, 0.1);
    },

    startup() {
      resume();
      const notes = [523, 659, 784, 1047, 784, 1047, 1319];
      const durations = [0.12, 0.12, 0.12, 0.2, 0.1, 0.1, 0.35];
      let offset = 0;
      notes.forEach((freq, i) => {
        tone(freq, durations[i], 'sine', 0.09, offset);
        offset += durations[i] * 0.85;
      });
    },

    shutdown() {
      resume();
      tone(880, 0.15, 'sine', 0.08);
      tone(660, 0.15, 'sine', 0.07, 0.12);
      tone(440, 0.2, 'sine', 0.06, 0.24);
      tone(220, 0.4, 'sine', 0.05, 0.4);
    },

    ding() {
      resume();
      tone(1318, 0.3, 'sine', 0.08);
    },

    chord() {
      resume();
      tone(523, 0.4, 'sine', 0.05);
      tone(659, 0.4, 'sine', 0.04);
      tone(784, 0.4, 'sine', 0.03);
    },

    mineExplode() {
      resume();
      noise(0.15, 0.12);
      tone(80, 0.3, 'sawtooth', 0.1);
    },

    mineWin() {
      resume();
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, 'sine', 0.07, i * 0.12));
    },

    keyPress() {
      resume();
      tone(800 + Math.random() * 200, 0.02, 'square', 0.02);
    },
  };
})();

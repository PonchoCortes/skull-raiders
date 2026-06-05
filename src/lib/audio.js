// src/lib/audio.js — Sintetizador Procedural Skull Raiders 2.0

class AudioManager {
  constructor() {
    this.ctx = null;
    this.musicInterval = null;
    this.masterGain = null;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.4;
    this._initialized = false;
  }

  init() {
    if (this._initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.ctx.destination);
      this._initialized = true;
    } catch (e) {
      console.warn('Audio init failed', e);
    }
  }

  _resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setSfxVolume(v) { this.sfxVolume = v; }
  setMusicVolume(v) {
    this.musicVolume = v;
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  playSFX(name) {
    if (!this._initialized) return;
    this._resume();
    const now = this.ctx.currentTime;

    const connect = (node, gainVal, dur) => {
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gainVal * this.sfxVolume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      node.connect(g);
      g.connect(this.ctx.destination);
      node.start(now);
      node.stop(now + dur);
    };

    if (name === 'shoot') {
      // Cañonazo grave + ruido de propulsión
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.4);
      connect(osc, 0.7, 0.4);

      // Ruido blanco corto de explosión
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 200;
      const g2 = this.ctx.createGain();
      g2.gain.setValueAtTime(0.4 * this.sfxVolume, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      noise.connect(filter); filter.connect(g2); g2.connect(this.ctx.destination);
      noise.start(now); noise.stop(now + 0.15);
    }

    if (name === 'hit') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.18);
      connect(osc, 0.5, 0.18);
    }

    if (name === 'splash') {
      // Burbujeo ascendente en capas
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        const delay = i * 0.04;
        osc.frequency.setValueAtTime(120 + i * 80, now + delay);
        osc.frequency.exponentialRampToValueAtTime(600 + i * 100, now + delay + 0.18);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.2 * this.sfxVolume, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);
        osc.connect(g); g.connect(this.ctx.destination);
        osc.start(now + delay); osc.stop(now + delay + 0.18);
      }
    }

    if (name === 'explode') {
      // Explosión grande con graves y noise
      const bufSize = this.ctx.sampleRate * 0.55;
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(20, now + 0.55);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.65 * this.sfxVolume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      noise.connect(filter); filter.connect(g); g.connect(this.ctx.destination);
      noise.start(now); noise.stop(now + 0.55);

      // Sub-bass punch
      const sub = this.ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(80, now);
      sub.frequency.exponentialRampToValueAtTime(20, now + 0.3);
      connect(sub, 0.5, 0.3);
    }

    if (name === 'skull_hit') {
      // Sonido caricaturesco de monito golpeado
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
      connect(osc, 0.3, 0.25);
      // "Aaaayyy" pitch
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(300, now + 0.3);
      connect(osc2, 0.2, 0.3);
    }

    if (name === 'coin') {
      // Tintinear de moneda
      const freqs = [880, 1100, 1320];
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0, now + i * 0.08);
        g.gain.linearRampToValueAtTime(0.25 * this.sfxVolume, now + i * 0.08 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
        osc.connect(g); g.connect(this.ctx.destination);
        osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.2);
      });
    }

    if (name === 'levelup') {
      // Fanfarria de victoria corta
      const melody = [523, 659, 784, 1047];
      melody.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = f;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.35 * this.sfxVolume, now + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
        osc.connect(g); g.connect(this.ctx.destination);
        osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.25);
      });
    }

    if (name === 'buy') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(660, now + 0.15);
      connect(osc, 0.3, 0.2);
    }
  }

  // 🎵 Música chiptune procedural mejorada
  playMusic(type) {
    if (!this._initialized) return;
    this.stopMusic();
    this._resume();

    // Escalas y melodías piratas
    const MENU_NOTES = [
      220, 0, 246, 0, 261, 0, 293, 0,
      329, 0, 293, 0, 261, 246, 220, 0,
      196, 0, 220, 246, 261, 0, 246, 0,
      220, 196, 174, 0, 196, 0, 220, 0,
    ];
    const BATTLE_MELODY = [
      146, 146, 165, 174, 196, 174, 165, 146,
      130, 130, 146, 165, 146, 130, 110, 0,
      146, 0, 196, 0, 174, 165, 146, 0,
      130, 146, 165, 196, 174, 165, 146, 130,
    ];
    const BOSS_MELODY = [
      110, 0, 110, 123, 110, 0, 98, 0,
      87, 0, 87, 110, 130, 0, 110, 0,
      110, 0, 110, 130, 146, 0, 130, 110,
      98, 87, 73, 0, 98, 0, 110, 0,
    ];
    const WIN_MELODY = [
      523, 659, 784, 659, 784, 1047, 0, 0,
    ];

    const noteMap = {
      menu: { notes: MENU_NOTES, tempo: 240, wave: 'sine', vol: 0.025 },
      battle: { notes: BATTLE_MELODY, tempo: 190, wave: 'triangle', vol: 0.04 },
      boss: { notes: BOSS_MELODY, tempo: 160, wave: 'sawtooth', vol: 0.045 },
      win: { notes: WIN_MELODY, tempo: 130, wave: 'triangle', vol: 0.06 },
    };

    const cfg = noteMap[type] || noteMap.battle;
    let step = 0;

    const playNote = () => {
      if (!this.ctx || !this._initialized) return;
      const freq = cfg.notes[step % cfg.notes.length];
      step++;
      if (freq === 0) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = cfg.wave;
      osc.frequency.value = freq;

      const g = this.ctx.createGain();
      const vol = cfg.vol * this.musicVolume;
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + (cfg.tempo / 1000) * 0.8);

      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + cfg.tempo / 1000);
    };

    this.musicInterval = setInterval(playNote, cfg.tempo);
    playNote();
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new AudioManager();

/* AudioManager — one shared instance for the whole site.
   • Sound effects: Web Audio buffers (low latency, short, throttled)
   • Voice intro + background music: single <audio> elements (never duplicated)
   • Preferences (sound / music on-off) persist in localStorage */

const KEYS = { sound: "lw.sound", music: "lw.music" };

function readPref(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
}
function writePref(key, on) {
  try { localStorage.setItem(key, on ? "1" : "0"); } catch { /* private mode */ }
}

const THROTTLE_MS = { hover: 110, click: 45, transition: 250, notification: 400 };

export class AudioManager extends EventTarget {
  constructor(cfg) {
    super();
    this.cfg = cfg;
    this.soundOn = readPref(KEYS.sound, true);
    this.musicOn = readPref(KEYS.music, true);
    this.ctx = null;
    this.sfxGain = null;
    this.raw = {};
    this.buffers = {};
    this.lastPlayed = {};
    this.tracks = (cfg.music || []).filter((t) => t && t.src);
    this.trackIndex = 0;
    this.music = null;
    this.musicPlaying = false;
    this.voice = null;
    this.voiceState = cfg.voiceIntro ? "idle" : "unavailable";
    this.ducked = false;
    this._fadeTimer = null;
  }

  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  /* ---------- unlock (must be called from a user gesture) --------------- */
  unlock() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!this.ctx) {
      this.ctx = new Ctx();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.cfg.sfxVolume ?? 0.5;
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    Object.keys(this.raw).forEach((name) => this._decode(name));
  }

  /* ---------- sound effects --------------------------------------------- */
  preloadSfx() {
    if (this._sfxPromise) return this._sfxPromise;
    const entries = Object.entries(this.cfg.sfx || {}).filter(([, src]) => src);
    this._sfxPromise = Promise.allSettled(
      entries.map(async ([name, src]) => {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`sfx ${name} missing`);
        this.raw[name] = await res.arrayBuffer();
        if (this.ctx) await this._decode(name);
      })
    );
    return this._sfxPromise;
  }

  async _decode(name) {
    if (this.buffers[name] || !this.raw[name] || !this.ctx) return;
    try {
      this.buffers[name] = await this.ctx.decodeAudioData(this.raw[name].slice(0));
    } catch {
      /* unsupported file — that sound just stays silent */
    }
  }

  play(name) {
    if (!this.soundOn || !this.ctx || this.ctx.state !== "running") return;
    if (name === "hover" && !this.cfg.hoverSound) return;
    const buf = this.buffers[name];
    if (!buf) return;
    const now = performance.now();
    if (now - (this.lastPlayed[name] || 0) < (THROTTLE_MS[name] || 60)) return;
    this.lastPlayed[name] = now;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.sfxGain);
    src.start();
  }

  setSound(on) {
    this.soundOn = on;
    writePref(KEYS.sound, on);
    if (!on && this.voice && !this.voice.paused) this.stopVoice();
    this.emit("change");
  }

  /* ---------- voice intro (plays once, never loops) --------------------- */
  initVoice() {
    if (!this.cfg.voiceIntro || this.voice) return;
    const a = new Audio();
    a.preload = "auto";
    a.loop = false;
    a.volume = this.cfg.voiceVolume ?? 1;
    a.addEventListener("ended", () => this._setVoice("ended"));
    a.addEventListener("error", () => this._setVoice("unavailable"));
    a.src = this.cfg.voiceIntro;
    this.voice = a;
  }

  _setVoice(state) {
    this.voiceState = state;
    this._duck(state === "playing");
    this.emit("voice", state);
  }

  /** fromGesture=true when the visitor pressed a button (allowed by browsers). */
  async playVoice({ fromGesture = false } = {}) {
    if (!this.voice || this.voiceState === "unavailable") return;
    if (!this.soundOn) {
      if (!fromGesture) return this._setVoice("idle");
      this.setSound(true);
    }
    try {
      this.voice.currentTime = 0;
      await this.voice.play();
      this._setVoice("playing");
    } catch (err) {
      if (err && err.name === "NotAllowedError") this._setVoice("blocked");
      else if (!err || err.name !== "AbortError") this._setVoice("unavailable");
    }
  }

  stopVoice() {
    if (!this.voice) return;
    this.voice.pause();
    if (this.voiceState === "playing") this._setVoice("ended");
  }

  /* ---------- background music ------------------------------------------ */
  get track() {
    return this.tracks[this.trackIndex] || null;
  }

  _ensureMusic() {
    if (this.music || !this.tracks.length) return this.music;
    const a = new Audio();
    a.preload = "metadata";
    a.loop = this.tracks.length === 1;
    a.volume = this._musicVolume();
    a.addEventListener("play", () => { this.musicPlaying = true; this.emit("music"); });
    a.addEventListener("pause", () => { this.musicPlaying = false; this.emit("music"); });
    a.addEventListener("ended", () => this.next());
    a.addEventListener("timeupdate", () => this.emit("time", { t: a.currentTime, d: a.duration }));
    a.addEventListener("error", () => { this.musicPlaying = false; this.emit("music", { error: true }); });
    a.src = this.track.src;
    this.music = a;
    return a;
  }

  /** Resolves once the first track's metadata is ready (or failed / timed out). */
  prepareMusic(timeout = 6000) {
    const a = this._ensureMusic();
    if (!a) return Promise.resolve(false);
    if (a.readyState >= 1) return Promise.resolve(true);
    return new Promise((resolve) => {
      const done = (ok) => { clearTimeout(t); a.removeEventListener("loadedmetadata", onOk); a.removeEventListener("error", onErr); resolve(ok); };
      const onOk = () => done(true);
      const onErr = () => done(false);
      const t = setTimeout(() => done(false), timeout);
      a.addEventListener("loadedmetadata", onOk);
      a.addEventListener("error", onErr);
    });
  }

  _musicVolume() {
    return (this.cfg.musicVolume ?? 0.45) * (this.ducked ? 0.3 : 1);
  }

  _duck(on) {
    this.ducked = on;
    if (!this.music) return;
    const target = this._musicVolume();
    clearInterval(this._fadeTimer);
    this._fadeTimer = setInterval(() => {
      const v = this.music.volume;
      const step = (target - v) * 0.25;
      if (Math.abs(target - v) < 0.01) { this.music.volume = target; clearInterval(this._fadeTimer); }
      else this.music.volume = Math.min(1, Math.max(0, v + step));
    }, 40);
  }

  playMusic() {
    const a = this._ensureMusic();
    if (!a || !this.musicOn || !a.paused) return;
    a.play().catch(() => { this.musicPlaying = false; this.emit("music"); });
  }

  pauseMusic() {
    if (this.music && !this.music.paused) this.music.pause();
  }

  setMusic(on) {
    this.musicOn = on;
    writePref(KEYS.music, on);
    on ? this.playMusic() : this.pauseMusic();
    this.emit("change");
  }

  _loadTrack(i) {
    if (!this.tracks.length) return;
    this.trackIndex = (i + this.tracks.length) % this.tracks.length;
    const a = this._ensureMusic();
    a.src = this.track.src;
    a.loop = this.tracks.length === 1;
    this.emit("music");
    if (this.musicOn) a.play().catch(() => {});
  }

  next() { this._loadTrack(this.trackIndex + 1); }
  prev() {
    if (this.music && this.music.currentTime > 3) { this.music.currentTime = 0; return; }
    this._loadTrack(this.trackIndex - 1);
  }
}

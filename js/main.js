/* ✦ little world — boot sequence
   Welcome screen  →  Loading (real asset checks)  →  ENTER MY WORLD  →  Profile */
import { CONFIG } from "./config.js";
import { AudioManager } from "./audio.js";
import { startDecorations } from "./decorations.js";
import { buildWorld, setupModal } from "./world.js";
import { $, $$, burst, ripple, toast, wait, reducedMotion } from "./fx.js";
import { pixelIcon } from "./icons.js";

/* ---------- theme + basics ---------------------------------------------- */
function applyTheme(theme) {
  const root = document.documentElement.style;
  Object.entries(theme).forEach(([k, v]) => root.setProperty(`--c-${k}`, v));
}
applyTheme(CONFIG.theme);
document.title = CONFIG.siteTitle;

const audio = new AudioManager(CONFIG.audio);
audio.preloadSfx();
audio.initVoice();
audio.prepareMusic(); // fetch metadata early (never autoplays)
startDecorations($("#decor"), { reducedMotion });
const openModal = setupModal(audio);

// fill decorative pixel icons declared in the HTML: <span data-px="heart">
$$("[data-px]").forEach((el) => { el.innerHTML = pixelIcon(el.dataset.px); });

// split the small title line into letters for a bouncy entrance
$$(".welcome__line:not(.welcome__line--big)").forEach((line) => {
  const text = line.textContent;
  line.setAttribute("aria-label", text);
  line.innerHTML = [...text].map((c, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`).join("");
});

/* ---------- unlock audio on first gesture ------------------------------- */
["pointerdown", "keydown", "touchend", "click"].forEach((type) =>
  window.addEventListener(type, () => audio.unlock(), { capture: true, passive: true })
);

/* ---------- global click feedback --------------------------------------- */
const RIPPLE = ".btn, .icon-btn, .social, .tab, .hud__btn, .status-chip";
document.addEventListener("click", (e) => {
  const el = e.target.closest("button, a, [role='tab'], .toast.is-clickable");
  if (el && !el.disabled) {
    const sfx = el.dataset.sfx;
    if (sfx !== "none") audio.play(sfx || "click");
    if (el.matches(RIPPLE)) ripple(el, e);
  }
  if (e.clientX || e.clientY) burst(e.clientX, e.clientY, { count: 4, icons: ["sparkle", "star"] });
});

// optional hover sound (off by default in config) — mouse only, throttled in AudioManager
document.addEventListener("pointerover", (e) => {
  if (e.pointerType !== "mouse") return;
  const el = e.target.closest(".icard, .social, .fav, .btn");
  if (el && !el.contains(e.relatedTarget)) audio.play("hover");
});

/* ---------- HUD (shared on every screen) -------------------------------- */
const hudMusic = $("#hud-music"), hudSound = $("#hud-sound");
function syncHUD() {
  hudMusic.setAttribute("aria-pressed", String(audio.musicOn));
  $("b", hudMusic).textContent = audio.musicOn ? "ON" : "OFF";
  hudMusic.classList.toggle("is-playing", audio.musicPlaying);
  hudSound.setAttribute("aria-pressed", String(audio.soundOn));
  $("b", hudSound).textContent = audio.soundOn ? "ON" : "OFF";
}
hudMusic.addEventListener("click", () => audio.setMusic(!audio.musicOn));
hudSound.addEventListener("click", () => audio.setSound(!audio.soundOn)); // click sfx plays afterwards if now on
if (!audio.tracks.length) hudMusic.hidden = true;
audio.addEventListener("change", syncHUD);
audio.addEventListener("music", syncHUD);
syncHUD();

/* ---------- screens ----------------------------------------------------- */
async function swapScreen(from, to) {
  from.classList.add("is-leaving");
  await wait(620);
  from.hidden = true;
  from.classList.remove("is-active", "is-leaving");
  to.hidden = false;
  void to.offsetWidth;
  to.classList.add("is-active");
}

/* ---------- 1. welcome -------------------------------------------------- */
const welcome = $("#welcome"), loading = $("#loading");
const voiceBtn = $("#voice-btn"), voiceRow = $("#voice-row");
const VOICE_UI = {
  idle: ["▶", "hear my hello"],
  blocked: ["♪", "tap to allow sound"],
  playing: ["■", "stop voice"],
  ended: ["↻", "replay hello"],
};
function syncVoice() {
  const state = audio.voiceState;
  voiceRow.hidden = state === "unavailable";
  if (state === "unavailable") return;
  const [glyph, label] = VOICE_UI[state] || VOICE_UI.idle;
  $(".voice__glyph", voiceBtn).textContent = glyph;
  $(".voice__label", voiceBtn).textContent = label;
  voiceRow.dataset.state = state;
}
audio.addEventListener("voice", syncVoice);
syncVoice();
voiceBtn.addEventListener("click", () => {
  audio.unlock();
  if (audio.voiceState === "playing") audio.stopVoice();
  else audio.playVoice({ fromGesture: true });
});
// try to greet the visitor right away; browsers may block this until a tap
audio.playVoice();

$("#welcome-start").addEventListener("click", (e) => {
  if (e.currentTarget.disabled) return;
  e.currentTarget.disabled = true;
  audio.play("transition");
  swapScreen(welcome, loading).then(runLoading);
});

/* ---------- 2. loading (progress = real work completed) ----------------- */
let world = null;
const windowLoaded = new Promise((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", r, { once: true })));
const withTimeout = (p, ms = 8000) => Promise.race([Promise.resolve(p).then(() => true, () => false), new Promise((r) => setTimeout(() => r(false), ms))]);
function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
    if (img.decode) img.decode().then(resolve, resolve);
  });
}

async function runLoading() {
  const log = $("#boot-log"), pct = $("#boot-pct"), bar = $("#boot-bar"), meter = $("#boot-meter");
  const tasks = [
    ["Initializing personal space…", () => { world = buildWorld(CONFIG, audio, openModal); }],
    ["Loading profile data…", () => preloadImage(world.avatarSrc)],
    ["Loading pixel fonts…", () => document.fonts && document.fonts.ready],
    ["Tuning sound effects…", () => audio.preloadSfx()],
    ["Warming up background music…", () => audio.prepareMusic()],
    ["Connecting to my little world…", () => windowLoaded],
  ];
  let target = 0, shown = 0, finished = false;
  const frame = () => {
    shown += (target - shown) * (reducedMotion ? 1 : 0.14);
    if (target - shown < 0.4) shown = target;
    const v = Math.round(shown);
    pct.textContent = `${v}%`;
    bar.style.transform = `scaleX(${shown / 100})`;
    meter.setAttribute("aria-valuenow", String(v));
    if (v >= 100 && finished) return done();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  for (let i = 0; i < tasks.length; i++) {
    const [label, run] = tasks[i];
    const line = document.createElement("li");
    line.innerHTML = `<span class="boot__mark">◌</span> ${label}`;
    log.appendChild(line);
    let ok = true;
    try { ok = await withTimeout(run()); } catch { ok = false; }
    line.classList.add(ok ? "is-ok" : "is-skip");
    $(".boot__mark", line).textContent = ok ? "✓" : "–";
    target = Math.round(((i + 1) / tasks.length) * 100);
    await wait(110); // just enough to read each line
  }
  finished = true;

  function done() {
    const line = document.createElement("li");
    line.className = "is-ready";
    line.innerHTML = `<span class="boot__mark">♡</span> Everything is ready!`;
    log.appendChild(line);
    loading.classList.add("is-ready");
    audio.play("notification");
    const enter = $("#enter-btn");
    enter.hidden = false;
    requestAnimationFrame(() => enter.classList.add("is-in"));
    enter.focus({ preventScroll: true });
  }
}

/* ---------- 3. enter my world ------------------------------------------- */
$("#enter-btn").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  if (btn.disabled) return;
  btn.disabled = true;
  const r = btn.getBoundingClientRect();
  document.documentElement.style.setProperty("--iris-x", `${r.left + r.width / 2}px`);
  document.documentElement.style.setProperty("--iris-y", `${r.top + r.height / 2}px`);
  audio.play("transition");
  audio.playMusic(); // inside a click → allowed by the browser
  document.body.classList.add("is-entering");
  await wait(760);
  loading.hidden = true;
  const main = $("#world");
  main.hidden = false;
  document.body.classList.add("in-world");
  void main.offsetWidth;
  main.classList.add("is-active");
  world.reveal();
  await wait(700);
  document.body.classList.remove("is-entering");
  await wait(900);
  audio.play("notification");
  toast({
    title: "1 new message",
    body: `${CONFIG.visitorMessage.from} left you a little note · click to read`,
    icon: "mail",
    onClick: world.openLetter,
    timeout: 8000,
  });
});

/* Builds the main profile "desktop" from CONFIG and wires its interactions. */
import { pixelIcon } from "./icons.js";
import { $, $$, escapeHTML as h, burst, toast, typewrite, revealOnScroll } from "./fx.js";

/* ---------- helpers ----------------------------------------------------- */
function hashHue(str) {
  let x = 0;
  for (const c of str) x = (x * 31 + c.charCodeAt(0)) % 360;
  return 180 + (x % 110); // keep generated covers in the blue/lavender family
}

export function imageURL(cfg, src, width) {
  const local = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname) || !location.protocol.startsWith("http");
  const useCDN = cfg.imageCDN === true || (cfg.imageCDN === "auto" && !local);
  if (!useCDN || /\.svg$/i.test(src) || /^(https?:|data:)/.test(src)) return src;
  return `/.netlify/images?url=/${src.replace(/^\/+/, "")}&w=${width}&fm=webp`;
}

function readNum(key) {
  try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; }
}
function writeVal(key, v) {
  try { localStorage.setItem(key, String(v)); } catch { /* ignore */ }
}
function readSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); } catch { return new Set(); }
}

/* ---------- modal ------------------------------------------------------- */
export function setupModal(audio) {
  const dialog = $("#modal");
  const close = () => {
    if (!dialog.open) return;
    dialog.classList.add("is-closing");
    setTimeout(() => { dialog.classList.remove("is-closing"); dialog.close(); }, 220);
  };
  $("#modal-close").addEventListener("click", close);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  return function openModal({ title, icon = "heart", html }) {
    $("#modal-title").innerHTML = `${pixelIcon(icon)}<span>${h(title)}</span>`;
    $("#modal-body").innerHTML = html;
    if (!dialog.open) dialog.showModal();
    audio.play("notification");
  };
}

/* ---------- sections ---------------------------------------------------- */
function renderProfile(cfg) {
  const p = cfg.profile;
  const s = p.statuses[0] || { label: "online", emoji: "●", color: "#34d399" };
  $("#profile-body").innerHTML = `
    <div class="pcard">
      <div class="pcard__avatar-wrap">
        <span class="pcard__ring" aria-hidden="true"></span>
        <img class="pcard__avatar" src="${imageURL(cfg, p.avatar, 360)}" data-raw="${h(p.avatar)}" alt="${h(p.displayName)}'s avatar" width="180" height="180" decoding="async">
        <span class="pcard__float pcard__float--a" aria-hidden="true">${pixelIcon("heart")}</span>
        <span class="pcard__float pcard__float--b" aria-hidden="true">${pixelIcon("star")}</span>
        <span class="pcard__float pcard__float--c" aria-hidden="true">${pixelIcon("drop")}</span>
        <span class="pcard__float pcard__float--d" aria-hidden="true">${pixelIcon("sparkle")}</span>
      </div>
      <button class="status-chip" id="status-chip" type="button" title="Click to change status" style="--dot:${s.color}">
        <span class="status-chip__dot" aria-hidden="true"></span>
        <span class="status-chip__label"><span class="status-chip__emoji">${h(s.emoji)}</span> ${h(s.label)}</span>
      </button>
      <h2 class="pcard__name">${h(p.displayName)}</h2>
      <p class="pcard__nick">${h(p.nickname)}</p>
      <p class="pcard__tagline">${h(p.tagline)}</p>
      <ul class="pcard__tags">${p.tags.map((t) => `<li>${h(t)}</li>`).join("")}</ul>
      <div class="pcard__actions">
        <button class="btn btn--primary" id="say-hi" type="button">${pixelIcon("heart")}<span>send a heart</span></button>
        <button class="btn btn--ghost" id="open-letter-2" type="button">${pixelIcon("mail")}<span>read my note</span></button>
      </div>
      <p class="pcard__hearts" aria-live="polite"><span id="heart-count">0</span> hearts sent from this device</p>
    </div>`;
  const img = $(".pcard__avatar");
  img.addEventListener("error", () => { if (img.src !== new URL(img.dataset.raw, location.href).href) img.src = img.dataset.raw; }, { once: true });
}

function renderStatus(cfg) {
  const st = cfg.currentStatus;
  const battery = Math.max(0, Math.min(100, Number(st.socialBattery) || 0));
  $("#status-body").innerHTML = `
    <dl class="kv kv--status">
      <div><dt>mood</dt><dd>${h(st.mood)}</dd></div>
      <div><dt>doing</dt><dd>${h(st.doing)}</dd></div>
      <div><dt>weather</dt><dd>${h(st.weather)}</dd></div>
      <div class="kv__battery"><dt>social battery</dt>
        <dd><span class="meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${battery}" aria-label="Social battery">
          <span class="meter__fill" style="--v:${battery}%"></span></span><b>${battery}%</b></dd></div>
    </dl>`;
}

function renderPlayer(cfg) {
  $("#player-body").innerHTML = `
    <div class="player">
      <div class="disc" aria-hidden="true"><span class="disc__label">${pixelIcon("drop")}</span></div>
      <div class="player__info">
        <p class="player__kicker"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span id="player-state">paused</span></p>
        <p class="player__title" id="player-title">—</p>
        <p class="player__artist" id="player-artist"></p>
        <div class="player__progress" aria-hidden="true"><span id="player-bar"></span></div>
        <div class="player__ctrls">
          <button class="icon-btn" id="player-prev" type="button" aria-label="Previous track">◀◀</button>
          <button class="icon-btn icon-btn--big" id="player-toggle" type="button" aria-label="Play music">▶</button>
          <button class="icon-btn" id="player-next" type="button" aria-label="Next track">▶▶</button>
        </div>
      </div>
    </div>`;
}

function renderAbout(cfg) {
  $("#about-body").innerHTML = `<dl class="kv kv--about">${cfg.about
    .map((r, i) => `<div style="--i:${i}"><dt>${h(r.label)}</dt><dd>${h(r.value)}</dd></div>`)
    .join("")}</dl>`;
}

function renderFacts() {
  $("#facts-body").innerHTML = `
    <div class="facts">
      <p class="facts__count mono" id="fact-count"></p>
      <p class="facts__text" id="fact-text" aria-live="polite"></p>
      <button class="btn btn--soft" id="fact-next" type="button">↻ <span>another fact</span></button>
    </div>`;
}

function renderLetter(cfg) {
  const m = cfg.visitorMessage;
  $("#letter-body").innerHTML = `
    <button class="envelope" id="open-letter" type="button" aria-label="Open the note for visitors">
      <span class="envelope__flap" aria-hidden="true"></span>
      <span class="envelope__paper"><b>${h(m.subject)}</b><span>from ${h(m.from)} · click to open</span></span>
      <span class="envelope__seal" aria-hidden="true">${pixelIcon("heart")}</span>
    </button>`;
}

function renderInterests(cfg) {
  $("#interests-body").innerHTML = `<div class="interests">${cfg.interests
    .map((it, i) => `
      <button class="icard" type="button" aria-pressed="false" style="--i:${i}" aria-label="${h(it.title)} — flip card">
        <span class="icard__inner">
          <span class="icard__face icard__front">
            <span class="icard__icon">${pixelIcon(it.icon)}</span>
            <span class="icard__title">${h(it.title)}</span>
            <span class="icard__blurb">${h(it.blurb)}</span>
            <span class="icard__hint mono">click ▸</span>
          </span>
          <span class="icard__face icard__back">
            <span class="icard__title">${h(it.title)}</span>
            <span class="icard__list">${it.details.map((d) => `<span>✦ ${h(d)}</span>`).join("")}</span>
          </span>
        </span>
      </button>`)
    .join("")}</div>`;
}

function renderFavorites(cfg) {
  const groups = Object.entries(cfg.favorites);
  const liked = readSet("lw.liked");
  let serial = 0;
  $("#favorites-body").innerHTML = `
    <div class="tabs" role="tablist" aria-label="Favorite categories">
      ${groups.map(([name], i) => `<button class="tab" role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" type="button">${h(name)}</button>`).join("")}
    </div>
    ${groups.map(([name, items], i) => `
      <div class="collection" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}" ${i === 0 ? "" : "hidden"}>
        ${items.map((it) => {
          serial++;
          const id = `${name}:${it.title}`;
          const hue = it.hue ?? hashHue(it.title);
          const on = liked.has(id);
          return `
          <div class="fav" style="--h:${hue}">
            <div class="fav__cover" aria-hidden="true">
              <span class="fav__no mono">No.${String(serial).padStart(3, "0")}</span>
              ${pixelIcon(["star", "heart", "cloud", "sparkle", "flower"][serial % 5])}
            </div>
            <div class="fav__meta">
              <span class="fav__title">${h(it.title)}</span>
              <span class="fav__sub">${h(it.sub || "")}</span>
            </div>
            <button class="fav__like" type="button" data-id="${h(id)}" aria-pressed="${on}" aria-label="Collect ${h(it.title)}">${pixelIcon("heart")}</button>
          </div>`;
        }).join("")}
      </div>`).join("")}`;
}

function renderSocials(cfg) {
  $("#links-body").innerHTML = `<div class="socials">${cfg.socials
    .map((s) => {
      const external = /^https?:/.test(s.url);
      return `
      <a class="social" href="${h(s.url)}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ""}>
        <span class="social__icon">${pixelIcon(s.icon)}</span>
        <span class="social__text"><b>${h(s.label)}</b><span>${h(s.handle)}</span></span>
        <span class="social__arrow" aria-hidden="true">↗</span>
      </a>`;
    })
    .join("")}</div>`;
}

/* ---------- interactions ------------------------------------------------ */
function bindWindows(audio) {
  $$("[data-win]").forEach((win) => {
    const min = $('[data-action="minimize"]', win);
    const heart = $('[data-action="heart"]', win);
    min?.addEventListener("click", () => {
      const collapsed = win.classList.toggle("is-collapsed");
      min.setAttribute("aria-expanded", String(!collapsed));
      min.setAttribute("aria-label", collapsed ? "Expand window" : "Minimize window");
      min.textContent = collapsed ? "+" : "_";
    });
    heart?.addEventListener("click", (e) => {
      const r = heart.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, { icons: ["heart"], count: 6 });
      heart.classList.remove("is-pop");
      void heart.offsetWidth;
      heart.classList.add("is-pop");
      e.stopPropagation();
    });
    // bring clicked window "to front" — a little OS detail
    win.addEventListener("pointerdown", () => {
      $$("[data-win].is-focused").forEach((w) => w !== win && w.classList.remove("is-focused"));
      win.classList.add("is-focused");
    });
  });
}

function bindProfile(cfg, audio, openLetter) {
  const statuses = cfg.profile.statuses;
  let si = 0;
  const chip = $("#status-chip");
  chip.addEventListener("click", () => {
    si = (si + 1) % statuses.length;
    const s = statuses[si];
    chip.style.setProperty("--dot", s.color);
    const label = $(".status-chip__label", chip);
    label.classList.remove("is-swap");
    void label.offsetWidth;
    label.classList.add("is-swap");
    label.innerHTML = `<span class="status-chip__emoji">${h(s.emoji)}</span> ${h(s.label)}`;
    $("#menubar-status").textContent = `${s.emoji} ${s.label}`;
  });

  let hearts = readNum("lw.hearts");
  const counter = $("#heart-count");
  counter.textContent = hearts;
  $("#say-hi").addEventListener("click", (e) => {
    hearts++;
    writeVal("lw.hearts", hearts);
    counter.textContent = hearts;
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, { icons: ["heart", "sparkle"], count: 9 });
    if (hearts === 1 || hearts % 10 === 0) {
      audio.play("notification");
      toast({ title: hearts === 1 ? "heart received ♡" : `${hearts} hearts!`, body: `${cfg.profile.displayName} says thank you~`, icon: "heart" });
    }
  });
  $("#open-letter-2").addEventListener("click", openLetter);
}

function bindPlayer(audio) {
  const title = $("#player-title"), artist = $("#player-artist"), state = $("#player-state");
  const toggle = $("#player-toggle"), bar = $("#player-bar"), win = $("#win-player");
  const sync = () => {
    const t = audio.track;
    title.textContent = t ? t.title : "no music added yet";
    artist.textContent = t ? t.artist || "" : "add a file in assets/audio/music";
    const playing = audio.musicPlaying;
    win.classList.toggle("is-playing", playing);
    state.textContent = playing ? "now playing" : audio.musicOn ? "paused" : "music off";
    toggle.textContent = playing ? "❚❚" : "▶";
    toggle.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    $("#menubar-track").textContent = t ? `♫ ${t.title}` : "";
  };
  audio.addEventListener("music", sync);
  audio.addEventListener("change", sync);
  audio.addEventListener("time", (e) => {
    const { t, d } = e.detail;
    bar.style.transform = `scaleX(${d ? Math.min(1, t / d) : 0})`;
  });
  toggle.addEventListener("click", () => {
    if (audio.musicPlaying) audio.setMusic(false);
    else audio.setMusic(true);
  });
  $("#player-next").addEventListener("click", () => { audio.musicOn = true; audio.next(); audio.setMusic(true); });
  $("#player-prev").addEventListener("click", () => { audio.musicOn = true; audio.prev(); audio.setMusic(true); });
  if (audio.tracks.length < 2) { $("#player-next").disabled = true; $("#player-prev").disabled = true; }
  sync();
}

function bindFacts(cfg) {
  const facts = cfg.facts;
  if (!facts.length) return;
  const order = facts.map((_, i) => i).sort(() => Math.random() - 0.5);
  let n = 0;
  const show = () => {
    typewrite($("#fact-text"), facts[order[n % order.length]]);
    $("#fact-count").textContent = `fact ${String((n % order.length) + 1).padStart(2, "0")} / ${String(order.length).padStart(2, "0")}`;
  };
  $("#fact-next").addEventListener("click", () => { n++; show(); });
  show();
}

function bindInterests() {
  $$(".icard").forEach((card) => {
    card.addEventListener("click", () => {
      const on = card.getAttribute("aria-pressed") !== "true";
      card.setAttribute("aria-pressed", String(on));
      if (on) {
        const r = card.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + 24, { count: 5, icons: ["sparkle", "star"] });
      }
    });
  });
}

function bindFavorites() {
  const tabs = $$(".tab");
  const select = (i, focus) => {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      if (on) { panel.classList.remove("is-in"); void panel.offsetWidth; panel.classList.add("is-in"); }
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") select((i + 1) % tabs.length, true);
      if (e.key === "ArrowLeft") select((i - 1 + tabs.length) % tabs.length, true);
    });
  });
  const liked = readSet("lw.liked");
  $$(".fav__like").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const on = !liked.has(id);
      on ? liked.add(id) : liked.delete(id);
      btn.setAttribute("aria-pressed", String(on));
      writeVal("lw.liked", JSON.stringify([...liked]));
      if (on) {
        const r = btn.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, { icons: ["heart"], count: 5 });
      }
    });
  });
}

function bindNav() {
  const links = $$("[data-nav]");
  links.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.getElementById(a.dataset.nav);
    if (!target) return;
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    target.classList.remove("is-pinged");
    void target.offsetWidth;
    target.classList.add("is-pinged");
  }));
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.classList.toggle("is-active", l.dataset.nav === en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  [...new Set(links.map((l) => l.dataset.nav))].forEach((id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
}

function startClock() {
  const el = $("#menubar-clock");
  const tick = () => { el.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };
  tick();
  setInterval(tick, 15000);
}

/* ---------- public ------------------------------------------------------ */
export function buildWorld(cfg, audio, openModal) {
  renderProfile(cfg);
  renderStatus(cfg);
  renderPlayer(cfg);
  renderAbout(cfg);
  renderFacts(cfg);
  renderLetter(cfg);
  renderInterests(cfg);
  renderFavorites(cfg);
  renderSocials(cfg);
  $("#menubar-name").textContent = cfg.osName;
  $("#menubar-status").textContent = `${cfg.profile.statuses[0]?.emoji || "●"} ${cfg.profile.statuses[0]?.label || "online"}`;
  $("#footer-name").textContent = cfg.profile.displayName;
  $("#footer-year").textContent = new Date().getFullYear();

  const m = cfg.visitorMessage;
  const openLetter = () => openModal({
    title: m.subject,
    icon: "mail",
    html: `<div class="letter">${m.body.map((p) => `<p>${h(p)}</p>`).join("")}<p class="letter__sign">— ${h(m.from)} ♡</p></div>`,
  });
  $("#open-letter").addEventListener("click", openLetter);

  bindWindows(audio);
  bindProfile(cfg, audio, openLetter);
  bindPlayer(audio);
  bindFacts(cfg);
  bindInterests();
  bindFavorites();
  bindNav();
  startClock();

  return {
    avatarSrc: imageURL(cfg, cfg.profile.avatar, 360),
    openLetter,
    reveal: () => revealOnScroll($$(".reveal")),
  };
}

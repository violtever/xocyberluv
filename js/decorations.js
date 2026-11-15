/* Floating decorations — a small, recycled pool of pixel icons that drift
   down the screen. Only transform/opacity are animated (GPU friendly). */
import { pixelIcon, DECOR_ICONS } from "./icons.js";

const COLORS = ["var(--c-sky)", "var(--c-cyan)", "var(--c-lavender)", "var(--c-primary)", "var(--c-pink)", "#ffffff"];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function dress(el, { first = false, still = false } = {}) {
  el.innerHTML = pixelIcon(pick(DECOR_ICONS));
  const size = rand(10, 26);
  el.style.setProperty("--x", `${rand(0, 100).toFixed(2)}vw`);
  el.style.setProperty("--size", `${size.toFixed(1)}px`);
  el.style.setProperty("--op", rand(0.16, 0.42).toFixed(2));
  el.style.setProperty("--drift", `${rand(-60, 60).toFixed(0)}px`);
  el.style.setProperty("--spin", `${rand(-200, 200).toFixed(0)}deg`);
  el.style.color = pick(COLORS);
  if (still) el.style.setProperty("--y", `${rand(4, 92).toFixed(1)}vh`);
  // timing is set once: changing it mid-animation would make icons jump
  if (first) {
    // smaller icons fall slower → feels like depth
    const dur = rand(16, 26) + (26 - size) * 0.6;
    el.style.setProperty("--dur", `${dur.toFixed(1)}s`);
    el.style.setProperty("--delay", `${-rand(0, dur).toFixed(1)}s`);
  }
}

export function startDecorations(container, { reducedMotion }) {
  const small = window.matchMedia("(max-width: 640px)").matches;
  const count = reducedMotion ? 8 : small ? 10 : 18;
  container.classList.toggle("is-still", reducedMotion);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "decor__item";
    dress(el, { first: true, still: reducedMotion });
    if (!reducedMotion) el.addEventListener("animationiteration", () => dress(el));
    frag.appendChild(el);
  }
  container.appendChild(frag);
  document.addEventListener("visibilitychange", () => {
    container.classList.toggle("is-paused", document.hidden);
  });
}

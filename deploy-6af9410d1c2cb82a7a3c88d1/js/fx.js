/* Small UI effects shared across screens. */
import { pixelIcon } from "./icons.js";

export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- sparkle burst at a point ----------------------------------- */
const BURST_ICONS = ["sparkle", "heart", "star", "drop"];
export function burst(x, y, { count = 7, icons = BURST_ICONS } = {}) {
  if (reducedMotion) return;
  const layer = document.getElementById("fx-layer");
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "burst";
    el.innerHTML = pixelIcon(icons[i % icons.length]);
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const dist = 26 + Math.random() * 34;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    el.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    el.style.setProperty("--s", (0.7 + Math.random() * 0.6).toFixed(2));
    el.addEventListener("animationend", () => el.remove(), { once: true });
    layer.appendChild(el);
  }
}

/* ---------- soft ripple inside buttons --------------------------------- */
export function ripple(target, event) {
  if (reducedMotion) return;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.6;
  const r = document.createElement("span");
  r.className = "ripple";
  r.style.width = r.style.height = `${size}px`;
  const cx = event.clientX || rect.left + rect.width / 2;
  const cy = event.clientY || rect.top + rect.height / 2;
  r.style.left = `${cx - rect.left - size / 2}px`;
  r.style.top = `${cy - rect.top - size / 2}px`;
  r.addEventListener("animationend", () => r.remove(), { once: true });
  target.appendChild(r);
}

/* ---------- OS-style toast notifications ------------------------------- */
export function toast({ title, body = "", icon = "heart", onClick, timeout = 5200 }) {
  const wrap = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.innerHTML = `
    <span class="toast__icon">${pixelIcon(icon)}</span>
    <span class="toast__text"><strong>${escapeHTML(title)}</strong>${body ? `<span>${escapeHTML(body)}</span>` : ""}</span>
    <button class="toast__close" type="button" aria-label="Dismiss notification" data-sfx="none">×</button>`;
  const close = () => {
    if (el.classList.contains("is-leaving")) return;
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), reducedMotion ? 0 : 320);
  };
  el.querySelector(".toast__close").addEventListener("click", (e) => { e.stopPropagation(); close(); });
  if (onClick) {
    el.classList.add("is-clickable");
    el.tabIndex = 0;
    const go = () => { onClick(); close(); };
    el.addEventListener("click", go);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
  }
  wrap.appendChild(el);
  setTimeout(close, timeout);
  return el;
}

/* ---------- reveal on scroll ------------------------------------------- */
export function revealOnScroll(elements) {
  if (reducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  elements.forEach((el) => io.observe(el));
}

/* ---------- typewriter -------------------------------------------------- */
const typing = new WeakMap();
export function typewrite(el, text, speed = 22) {
  clearInterval(typing.get(el));
  if (reducedMotion) { el.textContent = text; return; }
  let i = 0;
  el.textContent = "";
  el.classList.add("is-typing");
  const t = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i >= text.length) { clearInterval(t); el.classList.remove("is-typing"); }
  }, speed);
  typing.set(el, t);
}

export const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion ? Math.min(ms, 60) : ms));

/* Pixel icon library — every icon is a tiny grid drawn as crisp SVG rects.
   'o' = currentColor (themeable), other letters map to fixed tints below. */

const TINTS = {
  o: "currentColor",
  W: "#ffffff",
  w: "rgba(255,255,255,.7)",
  k: "rgba(30,42,74,.55)",
  y: "#ffe58a",
  R: "#ff9ec9",
  B: "#7cc4ff",
  g: "#8fe3c0",
};

const GRIDS = {
  heart: [".oo.oo.", "owooooo", "ooooooo", "ooooooo", ".ooooo.", "..ooo..", "...o..."],
  star: ["...o...", "..ooo..", "ooooooo", ".ooooo.", ".ooooo.", "oo...oo", "o.....o"],
  drop: ["..o..", ".ooo.", "ooooo", "owooo", "owooo", "ooooo", ".ooo."],
  cloud: ["...ooo...", ".oowwoo..", "owwoooooo", "ooooooooo", ".ooooooo."],
  flower: [".oo.oo.", "ooooooo", ".ooyoo.", "ooyyyoo", ".ooyoo.", "ooooooo", ".oo.oo."],
  bow: ["oo.....oo", "oooo.oooo", "ooookoooo", "oooo.oooo", "oo.....oo"],
  sparkle: ["..o..", "..o..", "ooWoo", "..o..", "..o.."],
  music: ["..ooooo..", ".o.....o.", "o.......o", "o.......o", "oo.....oo", "ooo...ooo", "ooo...ooo", ".oo...oo."],
  movies: ["WoWoWoWoW", "ooooooooo", "o.......o", "o..oW...o", "o.......o", "ooooooooo"],
  games: [".ooooooooo.", "ooWoooooWoo", "oWWWoooWoWo", "ooWoooooWoo", "ooooo.ooooo", ".ooo...ooo."],
  camera: ["...ooo...", "ooooooooo", "ooo...ooo", "oo..W..oo", "oo.....oo", "ooo...ooo", "ooooooooo"],
  art: ["..ooooo..", ".ooooooo.", "ooRooBooo", "oooooooyo", "ooo..oooo", "oo...oooo", ".oo.ooo..", "..ooo...."],
  note: ["..oooooo", "..oooooo", "..o....o", "..o....o", "ooo..ooo", "ooo..ooo"],
  play: [".ooooooo.", "oooWooooo", "oooWWoooo", "oooWWWooo", "oooWWoooo", "oooWooooo", ".ooooooo."],
  headphones: ["..ooooo..", ".o.....o.", "o.......o", "o.......o", "oo.....oo", "ooo...ooo", "ooo...ooo", ".oo...oo."],
  chat: [".ooooooo.", "ooooooooo", "ooWoWoWoo", "ooooooooo", ".ooooooo.", "..oo.....", "..o......"],
  mail: ["ooooooooo", "oWoooooWo", "ooWoooWoo", "oooWoWooo", "ooooWoooo", "ooooooooo"],
  code: ["..o...o..", ".o.....o.", "o.......o", ".o.....o.", "..o...o.."],
  user: ["..ooo..", ".ooooo.", ".ooooo.", "..ooo..", ".......", "ooooooo", "ooooooo"],
  folder: ["ooo......", "ooooooooo", "owwwwwwwo", "ooooooooo", "ooooooooo", "ooooooooo"],
  home: ["....o....", "...ooo...", "..ooooo..", ".ooooooo.", "ooooooooo", ".oo...oo.", ".oo.y.oo.", ".oo...oo."],
};

const cache = new Map();

export function pixelIcon(name, { title = "" } = {}) {
  const key = name + "|" + title;
  if (cache.has(key)) return cache.get(key);
  const grid = GRIDS[name] || GRIDS.sparkle;
  const h = grid.length;
  const w = Math.max(...grid.map((r) => r.length));
  let rects = "";
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (!TINTS[ch]) { x++; continue; }
      let run = 1;
      while (row[x + run] === ch) run++;
      rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${TINTS[ch]}"/>`;
      x += run;
    }
  });
  const a11y = title ? `role="img" aria-label="${title}"` : `aria-hidden="true"`;
  const svg = `<svg class="px" viewBox="0 0 ${w} ${h}" ${a11y} shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
  cache.set(key, svg);
  return svg;
}

export const DECOR_ICONS = ["heart", "star", "drop", "cloud", "flower", "bow", "sparkle"];

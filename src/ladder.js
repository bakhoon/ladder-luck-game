// Ladder geometry, all in board units (the SVG viewBox is W x H).
export const W = 342;
export const H = 380;
const MIN_GAP = 18; // how close two rung ends may sit on the same line

export const BUDDIES = [
  { color: '#E4572E', name: 'Red' },
  { color: '#F29E4C', name: 'Orange' },
  { color: '#F2C14E', name: 'Yellow' },
  { color: '#4C9F70', name: 'Green' },
  { color: '#3B6EA5', name: 'Blue' },
  { color: '#7B5EA7', name: 'Purple' },
  { color: '#E879A6', name: 'Pink' },
  { color: '#8B5E3C', name: 'Brown' },
  { color: '#2A9D8F', name: 'Teal' },
  { color: '#6CB4E4', name: 'Sky' },
];

export const MAX_PLAYERS = BUDDIES.length; // 10

export const PENS = BUDDIES.slice(0, 6);

export const colX = (i, n) => (W * (i + 0.5)) / n;

export const snapDistance = (n) => Math.min(26, (W / n) * 0.45);

export function nearest(x, n) {
  const c = Math.max(0, Math.min(n - 1, Math.round(x / (W / n) - 0.5)));
  return { c, d: Math.abs(x - colX(c, n)) };
}

// A rung joins line `a` (at height y1) to line `a + 1` (at height y2).
// Rungs may not cross each other or bunch up on the same line, which keeps
// the ladder a fair one-to-one mapping.
export function clash(n, list) {
  return list.some((r) => {
    if (r.a === n.a) {
      return (
        Math.abs(r.y1 - n.y1) < MIN_GAP ||
        Math.abs(r.y2 - n.y2) < MIN_GAP ||
        (r.y1 - n.y1) * (r.y2 - n.y2) < 0
      );
    }
    if (r.a === n.a - 1) return Math.abs(r.y2 - n.y1) < MIN_GAP;
    if (r.a === n.a + 1) return Math.abs(r.y1 - n.y2) < MIN_GAP;
    return false;
  });
}

export const clampY = (y) => Math.max(14, Math.min(H - 14, y));

export function randomRungs(n, count = n * 2 + 1) {
  const rungs = [];
  for (let k = 0; k < 120 && rungs.length < count; k++) {
    const y1 = 22 + Math.random() * (H - 44);
    const r = {
      id: `${Date.now()}-${k}`,
      a: Math.floor(Math.random() * (n - 1)),
      y1,
      y2: clampY(y1 + (Math.random() - 0.5) * 40),
      color: PENS[Math.floor(Math.random() * PENS.length)].color,
    };
    if (!clash(r, rungs)) rungs.push(r);
  }
  return rungs;
}

// Follow a buddy from the top of line `start` to the bottom.
export function trace(start, n, rungs) {
  let col = start;
  let y = 0;
  let last = null;
  const points = [{ x: colX(col, n), y: 0 }];
  for (let guard = 0; guard < 200; guard++) {
    let best = null;
    for (const r of rungs) {
      if (r === last) continue;
      let enterY, exitCol, exitY;
      if (r.a === col) { enterY = r.y1; exitCol = col + 1; exitY = r.y2; }
      else if (r.a === col - 1) { enterY = r.y2; exitCol = col - 1; exitY = r.y1; }
      else continue;
      if (enterY > y && (!best || enterY < best.enterY)) best = { r, enterY, exitCol, exitY };
    }
    if (!best) break;
    points.push({ x: colX(col, n), y: best.enterY });
    points.push({ x: colX(best.exitCol, n), y: best.exitY });
    col = best.exitCol;
    y = best.exitY;
    last = best.r;
  }
  points.push({ x: colX(col, n), y: H });
  return { points, end: col };
}

export function pathLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  return len;
}

// Points of the path up to `dist` along it, plus the moving tip.
export function partialPath(points, dist) {
  const out = [points[0]];
  let left = dist;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (left >= seg) { out.push(b); left -= seg; continue; }
    const t = seg === 0 ? 0 : left / seg;
    const tip = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    out.push(tip);
    return { points: out, tip };
  }
  return { points: out, tip: points[points.length - 1] };
}

export function shuffledResults(n, busts) {
  const res = Array.from({ length: n }, (_, i) => (i < busts ? 'bust' : 'safe'));
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

export const toPoints = (pts) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

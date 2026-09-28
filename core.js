// core.js: palette, helpers and the paint wrapper for the zine theme's pictures.
// The method is the one from github.com/JohnHeibel/PDoomVideo: the model writes p5.js + p5.brush code that paints
// each picture, and headless Chrome turns the canvas into a PNG. No image model is involved.
//
// The look is a two-ink risograph print: cream paper, navy ink outlines, flat orange and pink fills with halftone
// dots for shading, white stars. A picture is painted in passes, because p5.brush paints fills and strokes on a WEBGL
// canvas while the halftone dots are drawn on a plain 2D canvas:
//   paint(pts, o)  queues a flat fill (drawn now), halftone dots (2D buffer) and an ink outline (queued)
//   commit()       lays down the dots over the fills, then the ink over the dots
// Call commit() after each object, so the next object's fill covers this one's ink.

const PAL = {
  paper: '#EFE7D6', cream: '#FBF5E8', white: '#FFFDF6',
  ink: '#2E3B7A', inkDk: '#222C5E',
  orange: '#EE7E43', orangeDk: '#D2602A', orangeLt: '#F6A877',
  pink: '#EC6FA4', pinkDk: '#C94E86', pinkLt: '#F5B2CC',
};
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// Hand-drawn wobble. Seeded per picture in paintPiece, so a render is repeatable.
const jit = a => (random() * 2 - 1) * a;

let W = 800, H = 800, dotG = null, INK_QUEUE = [];

// ---------- geometry ----------
function rectPts(x, y, w, h, j = 0) {
  return [[x + jit(j), y + jit(j)], [x + w / 2 + jit(j), y + jit(j) * .5], [x + w + jit(j), y + jit(j)],
          [x + w + jit(j) * .5, y + h / 2], [x + w + jit(j), y + h + jit(j)], [x + w / 2 + jit(j), y + h + jit(j) * .5],
          [x + jit(j), y + h + jit(j)], [x + jit(j) * .5, y + h / 2]];
}
function ellPts(cx, cy, rx, ry, n = 32, j = 0, rot = 0) {
  const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * rx + jit(j), cy + Math.sin(a) * ry + jit(j)]); } return p;
}
function starPts(cx, cy, r, inner = .45, n = 5, rot = -Math.PI / 2) {
  const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, q = i % 2 ? r * inner : r; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p;
}
// A cloud of round lobes around an ellipse: the big puffy hair in the reference picture.
function puffPts(cx, cy, rx, ry, lobes = 11, depth = .16, rot = 0, seed = 1) {
  const p = [], n = lobes * 10;
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU, k = (i % 10) / 10, bump = Math.sin(k * Math.PI) * (1 + (hash(seed + Math.floor(i / 10)) - .5) * .5);
    const r = 1 - depth + depth * bump;
    p.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
  }
  return p;
}
const move = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
function rotPts(pts, cx, cy, a) { const c = Math.cos(a), s = Math.sin(a); return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); }

// ---------- paint ----------
// o.fill: flat colour. o.dots: { col, r, gap, angle, from, to, fade } halftone dots clipped to the shape; the dot
// radius runs from `from` to `to` (0..1 of r) along direction `fade` (radians), which is how the print shades.
// o.ink: outline colour (null for none), o.sw: weight, o.br: brush, o.curv: smooth the outline through the points.
function paint(pts, o = {}) {
  if (o.fill) {
    brush.noStroke(); brush.noHatch(); brush.noFill(); brush.wash(o.fill, o.op ?? 255);
    if (o.curv) { brush.beginShape(o.curv); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(true); }
    else brush.polygon(pts);
  }
  if (o.dots) halftone(pts, o.dots, o.curv);
  if (o.ink !== null) INK_QUEUE.push({ pts, col: o.ink || PAL.ink, sw: o.sw ?? 1, br: o.br || 'ink', curv: o.curv || 0 });
}
function inkLine(pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5) { INK_QUEUE.push({ pts, col, sw, br, curv, open: true }); }
// Typewriter lettering, printed with the dots: the "L15" and "F#2206" labels along the circuit lines.
function label(txt, x, y, size, col = PAL.ink, o = {}) {
  const c = dotG.drawingContext;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.globalAlpha = o.op ?? 1;
  c.font = `${o.weight || 400} ${size}px ${o.font || '"DejaVu Sans Mono", monospace'}`; c.fillStyle = col;
  c.textAlign = o.align || 'left'; c.textBaseline = 'middle'; c.fillText(txt, 0, 0);
  c.restore();
}

function halftone(pts, d, curv) {
  const c = dotG.drawingContext, r = d.r ?? 4, gap = d.gap ?? r * 2.4, ang = d.angle ?? Math.PI / 4;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, reach = Math.hypot(x1 - x0, y1 - y0) / 2 + gap;
  const fade = d.fade ?? Math.PI / 2, fx = Math.cos(fade), fy = Math.sin(fade);
  c.save(); c.beginPath();
  if (curv) { // same smoothing the brush uses: a closed Catmull-Rom through the points
    const n = pts.length; c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
  } else { c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); }
  c.closePath(); c.clip();
  c.fillStyle = d.col || PAL.pink; c.globalAlpha = d.op ?? 1;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  for (let u = -reach; u <= reach; u += gap) for (let v = -reach; v <= reach; v += gap) {
    const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
    const k = clamp(((x - cx) * fx + (y - cy) * fy) / reach * .5 + .5);
    const rr = r * lerp(d.from ?? 1, d.to ?? 1, k);
    if (rr < .4) continue;
    c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill();
  }
  c.restore();
}

// Lay the queued dots over the fills painted so far, then the queued ink over both.
function commit() {
  // p5.brush defers washes into a mask layer; a tiny off-canvas watercolour fill forces it to composite now, so the
  // dots land over the fills rather than under them (the same trick PDoomVideo's flushLetters uses).
  brush.noStroke(); brush.noHatch(); brush.noWash(); brush.fill('#000000', 1); brush.fillBleed(0); brush.fillTexture(0, 0);
  brush.polygon([[-50, -50], [-40, -50], [-40, -40]]); brush.noFill();
  image(dotG, 0, 0); dotG.clear();
  for (const q of INK_QUEUE) {
    brush.noFill(); brush.noWash(); brush.noHatch(); brush.set(q.br, q.col, q.sw);
    if (q.open) brush.spline(q.pts, q.curv);
    else { brush.beginShape(q.curv); for (const p of q.pts) brush.vertex(p[0], p[1]); brush.endShape(true); }
  }
  INK_QUEUE = [];
}

function defineBrushes() {
  brush.add('ink', { type: 'default', weight: 5, scatter: .2, sharpness: .85, grain: 40, opacity: 240, spacing: .2, pressure: [1.15, .8], rotate: 'natural', noise: .12 });
  brush.add('inkfine', { type: 'default', weight: 2.4, scatter: .12, sharpness: .9, grain: 40, opacity: 235, spacing: .2, pressure: [1.1, .85], rotate: 'natural', noise: .08 });
  brush.add('sketch', { type: 'default', weight: 1.6, scatter: .5, sharpness: .6, grain: 20, opacity: 150, spacing: .4, pressure: [1, .5], rotate: 'natural', noise: .3 });
}

// ---------- pieces ----------
// Each picture registers itself: piece(name, width, height, fn). fn paints in pixel space, origin top-left.
// `bg: true` paints the paper first; otherwise the PNG keeps a transparent background, for stickers.
// `frames: n` makes an animation: fn(frame) is called for frame 0..n-1, each painted in its own width×height cell of
// one strip, left to right, which CSS plays with steps(n). Every frame starts from the same seed, so the hand wobble
// stays put and only what fn moves moves.
const PIECES = {};
function piece(name, w, h, fn, o = {}) { PIECES[name] = { w, h, fn, ...o }; }

// ---------- p5 lifecycle ----------
let CURRENT = null;
function setup() {
  const name = new URLSearchParams(location.search).get('piece');
  CURRENT = PIECES[name];
  if (!CURRENT) throw new Error(`no piece named ${name}; known: ${Object.keys(PIECES).join(', ')}`);
  W = CURRENT.w; H = CURRENT.h;
  createCanvas(W * (CURRENT.frames ?? 1), H, WEBGL); pixelDensity(1); noLoop();
  brush.scaleBrushes(CURRENT.brushScale ?? 1.4); defineBrushes();
  dotG = createGraphics(W, H); dotG.pixelDensity(1);
}
function draw() {
  clear();
  const frames = CURRENT.frames ?? 1;
  if (CURRENT.bg) { background(PAL.paper); }
  for (let frame = 0; frame < frames; frame++) {
    push(); translate(-W * frames / 2 + W * frame, -H / 2);
    randomSeed(CURRENT.seed ?? 7); noiseSeed(7);
    CURRENT.fn(frame);
    commit();
    pop();
  }
  window.painted = true;
}

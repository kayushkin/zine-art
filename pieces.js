// pieces.js: every picture the zine theme uses. `node render.mjs --pieces` writes each into the repo that serves it, in a
// clone beside this one: bridge-ui's zine/<name>.png for a picture the chat draws (BRIDGE_UI_PIECES at the end), and
// dash's public/art/zine/<name>.png for the rest.
// Transparent backgrounds throughout: the page's own CSS paper shows through.

// ---------- the mascot ----------
piece('crab-wave', 620, 560, () => crab(300, 350, 30, { pose: 'wave' }));
piece('crab-cheer', 620, 560, () => crab(310, 360, 30, { pose: 'cheer', eyes: 'star' }));
piece('crab-think', 620, 560, () => crab(290, 360, 30, { pose: 'think', eyes: 'look', mouth: 'flat' }));
piece('crab-sleep', 620, 560, () => crab(290, 370, 30, { pose: 'sleep', eyes: 'closed' }));
// the status row's mascot, one animation per mood of bridge-ui's status slot (`data-mood`), frame by frame (`frames: n`, see core.js), in one 220×200 cell each so zine.css
// treats them alike. Each takes the crab's centre and unit, so the loading and empty-chat crabs reuse them at size.
const MINI = { w: 220, h: 200, brushScale: 1.1 };
function thoughtDots(cx, cy, s, count) {
  // rising from the head to the upper right, each bigger than the last
  [[5.2, -4.8, .5], [6.4, -6.4, .75], [7.4, -8.4, 1.05]].slice(0, count)
    .forEach(([x, y, r]) => paint(ellPts(cx + x * s, cy + y * s, r * s, r * s, 16), { fill: PAL.cream, sw: clamp(s / 17, .5, 2.2) }));
  commit();
}
const MOOD_FRAMES = {
  // a claw tapping the chin while a thought forms, three dots rising one at a time
  thinking: { frames: 6, draw(cx, cy, s, frame) {
    const tap = frame % 2;
    crab(cx, cy, s, { pose: 'think', eyes: 'look', mouth: 'flat', marks: false, look: [.38, .38, .2, .38, .5, .38][frame],
      claws: [[-6.4, 1.6, .25, .9], [3.6, 2.6 - tap * .7, .15 + tap * .25, -2.2]] });
    thoughtDots(cx, cy, s, [3, 3, 0, 1, 2, 3][frame]);
  } },
  // scuttling: legs in a tripod gait, claws pumping, the body bobbing, speed lines behind
  working: { frames: 4, draw(cx, cy, s, frame) {
    const claws = [
      [[-6.8, 3.2, .2, 1.4], [7.4, -2.6, .6, -.1]], [[-7.2, 1.6, .5, 1.1], [7.0, -.6, .2, .2]],
      [[-6.6, 3.6, .2, 1.5], [7.6, -3.4, .65, -.25]], [[-7.0, 2.0, .5, 1.2], [7.2, -1.0, .25, .1]]][frame];
    crab(cx, cy - (frame % 2) * .3 * s, s, { pose: 'run', mouth: 'grin', claws, legSwing: frame % 2 ? -.7 : .7, speed: [1, .7, 1.15, .75][frame] });
  } },
  // parked on the reader: waving hard, with a "!" bobbing on the other side
  waiting: { frames: 6, draw(cx, cy, s, frame) {
    const wave = [[7.0, -4.6, .55, -.35], [7.6, -3.6, .55, -.1], [7.8, -2.4, .5, .1], [7.6, -3.6, .55, -.1], [7.0, -4.6, .55, -.35], [6.2, -5.4, .6, -.6]][frame];
    crab(cx, cy, s, { pose: 'wave', mouth: 'o', marks: false, claws: [[-6.4, 1.6, .25, .9], wave] });
    label('!', cx - 6.2 * s, cy - (6.0 + [0, .2, .4, .2, 0, -.2][frame]) * s, s * 3.2, PAL.pink, { weight: 700, align: 'center', rot: -.1 });
    commit();
  } },
  // asleep: breathing, and z's drifting up and growing as they go
  resting: { frames: 6, draw(cx, cy, s, frame) {
    crab(cx, cy - [0, .1, .2, .2, .1, 0][frame] * s, s, { pose: 'sleep', eyes: 'closed', marks: false });
    for (let k = 0; k < 3; k++) {
      const t = (frame / 6 + k / 3) % 1;
      label(t > .6 ? 'Z' : 'z', cx + (5.2 + 2.6 * t) * s, cy - (5.2 + 4.0 * t) * s, s * (1.3 + 1.3 * t), k % 2 ? PAL.pink : PAL.ink, { weight: 700 });
    }
    commit();
  } },
  // the reader is typing: it turns to look down at the text box, a claw cupped to listen
  noticing: { frames: 6, draw(cx, cy, s, frame) {
    const lean = [0, .1, .2, .2, .1, 0][frame];
    crab(cx + lean * s, cy + lean * .5 * s, s, { pose: 'wave', mouth: frame === 3 ? 'smile' : 'o', marks: false, look: .45, lookDown: .8,
      claws: [[-6.4, 1.6, .25, .9], [5.4, -4.0 + lean, .3, -2.3]] });
  } },
  // something went wrong: claws flailing, eyes crossed out, shaking side to side
  trouble: { frames: 4, draw(cx, cy, s, frame) {
    const claws = [
      [[-7.4, -5.2, .7, .5], [7.4, -5.2, .7, -.5]], [[-7.8, -3.8, .3, .8], [7.0, -6.0, .8, -.3]],
      [[-7.4, -5.2, .7, .5], [7.4, -5.2, .7, -.5]], [[-7.0, -6.0, .8, .3], [7.8, -3.8, .3, -.8]]][frame];
    // lower than the others, so the "!" above the raised claws stays in the cell
    crab(cx + [0, -.3, 0, .3][frame] * s, cy + 1.2 * s, s, { pose: 'alarm', eyes: 'x', mouth: 'o', claws });
  } },
};
for (const [mood, { frames, draw }] of Object.entries(MOOD_FRAMES))
  piece(`crab-mini-${mood}-frames`, MINI.w, MINI.h, frame => draw(110, 120, 9.5, frame), { brushScale: MINI.brushScale, frames });
// The conductor: the orchestrator, docked at the foot of the chat sidebar. No headset — a bow tie, and a baton in the
// right claw. One strip per `data-state` of bridge-ui's `.bc-conductor`, and `glance` for the pointer over it.
function baton(cx, cy, s, [tipX, tipY], angle, length = 4.2) {
  const x0 = cx + tipX * s, y0 = cy + tipY * s, x1 = x0 + Math.cos(angle) * length * s, y1 = y0 + Math.sin(angle) * length * s;
  inkLine([[x0, y0], [x1, y1]], clamp(s / 17, .5, 2.2) * 1.6, PAL.ink, 'ink', 0);
  commit();
  paint(ellPts(x1, y1, .42 * s, .42 * s, 12), { fill: PAL.white, sw: clamp(s / 17, .5, 2.2) * .7 });
  commit();
  return [x1, y1];
}
const conductor = (cx, cy, s, o) => crab(cx, cy, s, { headset: false, bowtie: true, marks: false, ...o });
const CONDUCTOR_FRAMES = {
  // keeping the work moving: a four-beat pattern with the baton, the free claw shaping it, notes drifting up
  conducting: { frames: 8, draw(cx, cy, s, frame) {
    const tip = [[6.2, -1.0], [5.6, 1.2], [4.4, .2], [3.8, -.8], [6.8, 0], [7.4, -1.0], [7.0, -3.2], [6.4, -4.6]][frame];
    const angle = [-.9, -.5, -1.4, -1.8, -.7, -.5, -1.2, -1.5][frame];
    conductor(cx, cy + (frame % 2) * .15 * s, s, { mouth: 'smile', look: -.25,
      claws: [[-6.4, [1.0, .6, .2, 0, .2, .6, 1.0, 1.2][frame], .4, .9], [tip[0], tip[1], .15, -.4]] });
    baton(cx, cy, s, tip, angle);
    const t = frame / 8;
    label('♪', cx + (8.0 + .8 * t) * s, cy - (4.4 + 4.0 * t) * s, s * (2.4 + .8 * t), frame % 2 ? PAL.pink : PAL.ink, { weight: 700, font: '"DejaVu Sans", sans-serif' });
    commit();
  } },
  // a run in flight: both claws going, big fast sweeps
  busy: { frames: 6, draw(cx, cy, s, frame) {
    const tip = [[7.6, -4.6], [5.0, 1.6], [7.8, -.4], [7.2, -4.2], [4.8, 1.2], [8.0, -1.0]][frame];
    const angle = [-1.6, -.3, -1.0, -1.5, -.2, -.8][frame];
    conductor(cx, cy - (frame % 3 === 0 ? .25 : 0) * s, s, { mouth: 'flat', look: 0,
      claws: [[[-7.6, -4.4, -5.0][frame % 3], [-4.2, 1.4, -.6][frame % 3], .5, .8], [tip[0], tip[1], .15, -.4]] });
    baton(cx, cy, s, tip, angle);
  } },
  // something needs you: it turns to you, baton up with a pink pennant, beckoning
  alert: { frames: 6, draw(cx, cy, s, frame) {
    cx += .5 * s; // the beckoning claw reaches further left than the others
    const wave = [[-7.0, -4.6, .55, .35], [-7.6, -3.6, .55, .1], [-7.8, -2.4, .5, -.1], [-7.6, -3.6, .55, .1], [-7.0, -4.6, .55, .35], [-6.2, -5.4, .6, .6]][frame];
    conductor(cx, cy, s, { mouth: 'o', look: 0, claws: [wave, [5.6, -4.2, .15, -.4]] });
    const [x1, y1] = baton(cx, cy, s, [5.6, -4.2], -1.45, 4.6);
    const flap = [0, .5, 1, .5, 0, -.5][frame] * s;
    paint([[x1, y1 + .4 * s], [x1 + 3.2 * s, y1 + 1.2 * s + flap], [x1, y1 + 2.4 * s]], { fill: PAL.pink, sw: clamp(s / 17, .5, 2.2) });
    commit();
    label('!', cx - 6.4 * s, cy - (7.4 + [0, .2, .4, .2, 0, -.2][frame]) * s, s * 3, PAL.pink, { weight: 700, align: 'center' });
    commit();
  } },
  // the last run failed: the baton snapped, claws up
  trouble: { frames: 4, draw(cx, cy, s, frame) {
    cx += .5 * s; // the flailing claws reach further left than the others
    const claws = [[[-7.4, -5.2, .7, .5], [7.4, -5.2, .7, -.5]], [[-7.8, -3.8, .3, .8], [7.0, -6.0, .8, -.3]],
      [[-7.4, -5.2, .7, .5], [7.4, -5.2, .7, -.5]], [[-7.0, -6.0, .8, .3], [7.8, -3.8, .3, -.8]]][frame];
    conductor(cx + [0, -.3, 0, .3][frame] * s, cy + 1.2 * s, s, { eyes: 'x', mouth: 'o', claws });
    const sw = clamp(s / 17, .5, 2.2) * 1.6, spin = frame * .9;
    inkLine([[cx + 5.5 * s, cy + 3.8 * s], [cx + (5.5 + 2.8 * Math.cos(spin)) * s, cy + (3.8 + 2.8 * Math.sin(spin)) * s]], sw, PAL.ink, 'ink', 0);
    inkLine([[cx - 5.0 * s, cy + 4.4 * s], [cx + (-5.0 + 2.6 * Math.cos(-spin)) * s, cy + (4.4 + 2.6 * Math.sin(-spin)) * s]], sw, PAL.ink, 'ink', 0);
    commit();
  } },
  // autonomous mode off: dozing on its feet, the baton drooping
  resting: { frames: 6, draw(cx, cy, s, frame) {
    conductor(cx, cy - [0, .1, .2, .2, .1, 0][frame] * s, s, { eyes: 'closed', mouth: 'o', claws: [[-6.0, 2.4, .1, 1.2], [6.0, 2.4, .15, -1.2]] });
    baton(cx, cy, s, [6.0, 2.4], .9 + [0, .05, .1, .1, .05, 0][frame], 3.6);
    for (let k = 0; k < 3; k++) {
      const t = (frame / 6 + k / 3) % 1;
      label(t > .6 ? 'Z' : 'z', cx + (4.6 + 2.6 * t) * s, cy - (5.6 + 4.0 * t) * s, s * (1.3 + 1.3 * t), k % 2 ? PAL.pink : PAL.ink, { weight: 700 });
    }
    commit();
  } },
  // the pointer is over it: it turns to you and raises the baton, as if to say "yes?"
  glance: { frames: 6, draw(cx, cy, s, frame) {
    const tip = [[6.2, -1.0], [6.4, -3.0], [6.2, -5.0], [6.0, -5.6], [6.2, -5.0], [6.4, -3.0]][frame];
    conductor(cx, cy - [0, .1, .25, .3, .25, .1][frame] * s, s, { mouth: 'grin', look: 0, eyes: frame === 3 ? 'star' : 'open',
      claws: [[-6.4, [1.6, 1.0, .4, .2, .4, 1.0][frame], .3, .9], [tip[0], tip[1], .15, -.4]] });
    baton(cx, cy, s, tip, -1.2 - frame * .05);
  } },
};
for (const [state, { frames, draw }] of Object.entries(CONDUCTOR_FRAMES))
  piece(`conductor-${state}-frames`, MINI.w, MINI.h, frame => draw(96, 126, 10.5, frame), { brushScale: MINI.brushScale, frames });
// the page-loading crab: the thinking mood, big
piece('crab-think-frames', 620, 560, frame => MOOD_FRAMES.thinking.draw(270, 360, 30, frame), { frames: MOOD_FRAMES.thinking.frames });
// an empty chat: the crab waving hello under a "hi!" bubble, the bubble and crab laid out as the two layers were
piece('crab-hello-frames', 620, 560, frame => {
  const k = .785, ox = 384, bx = x => ox + x * k, by = y => y * k;
  paint([[bx(118), by(150)], [bx(62), by(222)], [bx(170), by(150)]], { fill: PAL.cream, sw: 2 });
  commit();
  paint(puffPts(bx(150), by(95), 128 * k, 78 * k, 9, .1, 0, 5), { fill: PAL.cream, dots: { col: PAL.pinkLt, r: 2.4, gap: 7, from: 0, to: 1, fade: Math.PI / 2 }, sw: 2 });
  label('hi!', bx(150), by(96) - [0, 2, 4, 2, 0, -2][frame], 64 * k, PAL.ink, { weight: 700, align: 'center', rot: -.06 });
  commit();
  const wave = [[7.0, -4.6, .55, -.35], [7.6, -3.6, .55, -.1], [7.8, -2.4, .5, .1], [7.6, -3.6, .55, -.1], [7.0, -4.6, .55, -.35], [6.2, -5.4, .6, -.6]][frame];
  crab(261, 396, 23.4, { pose: 'wave', claws: [[-6.4, 1.6, .25, .9], wave], eyes: frame === 4 ? 'closed' : 'open' });
}, { frames: 6 });
// the brand mark in the top bar: drawn small, so the ink is heavier for its size
piece('crab-mark', 200, 190, () => crab(98, 118, 10, { pose: 'wave' }), { brushScale: 1.1 });

// ---------- stickers ----------
// a white star with a navy edge and a pink halftone shadow, slightly turned
piece('star', 220, 220, () => {
  paint(starPts(116, 120, 84, .46, 5, -Math.PI / 2 + .18), { fill: PAL.pink, dots: { col: PAL.pinkDk, r: 2.6, gap: 7 }, ink: null });
  commit();
  paint(starPts(106, 110, 84, .46, 5, -Math.PI / 2 + .18), { fill: PAL.white, sw: 2.2 });
  commit();
});
// a four-point sparkle, orange or pink
for (const [name, col, dots] of [['sparkle-orange', PAL.orange, PAL.orangeDk], ['sparkle-pink', PAL.pink, PAL.pinkDk]]) {
  piece(name, 180, 180, () => {
    paint(starPts(90, 90, 78, .3, 4), { fill: col, dots: { col: dots, r: 2.2, gap: 6, from: 0, to: 1, fade: Math.PI / 4 }, sw: 1.6 });
    commit();
  });
}
piece('bolt', 200, 280, () => {
  const bolt = [[112, 12], [40, 150], [96, 150], [70, 268], [168, 104], [110, 104], [150, 12]];
  paint(move(bolt, 8, 8), { fill: PAL.ink, ink: null });
  commit();
  paint(bolt, { fill: PAL.orange, dots: { col: PAL.pink, r: 3, gap: 8, from: 0, to: 1, fade: Math.PI / 2 }, sw: 2 });
  commit();
});
piece('heart', 220, 200, () => {
  const heart = [];
  for (let i = 0; i < 60; i++) { const t = i / 60 * TAU; heart.push([110 + 5.2 * 16 * Math.pow(Math.sin(t), 3), 92 - 5.2 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); }
  paint(heart, { fill: PAL.pink, dots: { col: PAL.pinkDk, r: 2.8, gap: 7.5, from: 0, to: 1, fade: Math.PI * .6 }, sw: 2 });
  paint(ellPts(78, 62, 16, 9, 14, 0, -.6), { fill: PAL.white, ink: null });
  commit();
});
// a speech bubble with a typed "hi!", for empty states
piece('bubble', 300, 230, () => {
  // the tail first, then the cloud over its root, so the two read as one outline
  paint([[118, 150], [62, 222], [170, 150]], { fill: PAL.cream, sw: 2 });
  commit();
  paint(puffPts(150, 95, 128, 78, 9, .1, 0, 5), { fill: PAL.cream, dots: { col: PAL.pinkLt, r: 2.4, gap: 7, from: 0, to: 1, fade: Math.PI / 2 }, sw: 2 });
  label('hi!', 150, 96, 64, PAL.ink, { weight: 700, align: 'center', rot: -.06 });
  commit();
});

// ---------- circuits ----------
// A tall strip of circuit traces for the page edges: lines that run in, jog at 45 degrees and end in a dot, with
// typewriter labels as in the reference ("L15", "F#2206 refus").
function circuitStrip(w, h, side, seed) {
  const edge = side < 0 ? 0 : w, labels = ['L15 IN', 'F#2206 refus', 'R3 ok', 'CH-07', 'NODE 12', 'SYNC', 'Q#88', 'TX 4.2', 'BUS A'];
  for (let i = 0, y = 60; y < h - 40; i++, y += 90 + hash(seed + i) * 110) {
    const reach = 70 + hash(seed + i * 3) * (w - 110), jog = (hash(seed + i * 5) - .5) * 90, x1 = edge - side * reach * .55, x2 = edge - side * reach;
    const path = [[edge + side * 10, y], [x1, y], [x1 - side * Math.abs(jog) * .6, y + jog], [x2, y + jog]];
    inkLine(path, 1.8, PAL.ink, 'inkfine', 0);
    for (const [px, py] of [path[1], path[3]]) paint(ellPts(px, py, 7.5, 7.5, 14), { fill: PAL.ink, ink: null });
    if (hash(seed + i * 7) > .55) label(labels[Math.floor(hash(seed + i * 11) * labels.length)], x2 + (side < 0 ? 12 : -12), y + jog - 18, 18, PAL.ink, { align: side < 0 ? 'left' : 'right', op: .8 });
  }
  commit();
}
piece('circuit-left', 260, 1400, () => circuitStrip(260, 1400, -1, 11));
piece('circuit-right', 260, 1400, () => circuitStrip(260, 1400, 1, 23));

// ---------- the login poster ----------
// The reference's composition: a big orange puff filling the frame, the character in it, stars, and circuits.
piece('poster', 1100, 820, () => {
  paint(puffPts(560, 430, 470, 360, 13, .14, .1, 9), { fill: PAL.orange, dots: { col: PAL.pink, r: 4, gap: 10, from: 0, to: 1, fade: Math.PI * .65 }, sw: 2.2 });
  commit();
  paint(puffPts(575, 420, 330, 250, 10, .12, .4, 4), { fill: PAL.cream, dots: { col: PAL.pinkLt, r: 3.6, gap: 9, from: 0, to: 1, fade: Math.PI * .6 }, ink: PAL.ink, sw: 1.2 });
  commit();
  crab(560, 470, 37, { pose: 'wave' });
  paint(starPts(930, 170, 62, .46, 5, -1.3), { fill: PAL.white, sw: 2 }); commit();
  paint(starPts(170, 640, 40, .46, 5, -1.9), { fill: PAL.white, sw: 1.8 }); commit();
  paint(starPts(880, 700, 28, .2, 4), { fill: PAL.pink, sw: 1.4 }); commit();
  paint(starPts(150, 200, 30, .2, 4), { fill: PAL.cream, sw: 1.4 }); commit();
}, { seed: 3 });

// ---------- status icons ----------
// One per session state, shown at 16px in the sidebar and the header in place of bridge-ui's plain dots. Painted
// big (128px) with heavy ink so they survive being shrunk eight times; zine.css animates the working ones.
const ST = 128, SC = 64;
function badgeDisc(fill, dots) {
  paint(ellPts(SC, SC, 50, 50, 36), { fill, dots, sw: 2.0 });
}
// The states where something is happening are animations: a strip of `frames` cells that zine.css plays with
// steps(), so each is drawn frame by frame rather than one picture turned by CSS. Frame 0 is the still that shows
// when the reader asks for reduced motion, so it should read on its own.
function cogPts(cx, cy, teeth, outer, inner, turn) {
  const pts = [];
  for (let i = 0; i < teeth * 4; i++) {
    // flat-topped teeth: two points out, two points in, per tooth
    const a = turn + i / (teeth * 4) * TAU, r = (i % 4 === 1 || i % 4 === 2) ? outer : inner;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}
// a tool call: two cogs meshing, turning one tooth each per loop, the big one clockwise
piece('status-working-frames', ST, ST, frame => {
  const t = frame / 6;
  paint(cogPts(90, 38, 6, 28, 20, -t * TAU / 6 + 0.26), { fill: PAL.pink, dots: { col: PAL.pinkDk, r: 3, gap: 8 }, sw: 2.0 });
  commit();
  paint(ellPts(90, 38, 8, 8, 16), { fill: PAL.cream, sw: 1.4 });
  commit();
  paint(cogPts(54, 76, 8, 43, 32, t * TAU / 8), { fill: PAL.orange, dots: { col: PAL.pink, r: 3, gap: 8, from: 0, to: 1, fade: Math.PI / 2 }, sw: 2.0 });
  commit();
  paint(ellPts(54, 76, 14, 14, 20), { fill: PAL.pink, sw: 1.6 });
  commit();
}, { brushScale: 2.4, frames: 6 });
// waiting on the model: a thought bubble whose three dots rise one after another, then rest
piece('status-thinking-frames', ST, ST, frame => {
  paint(ellPts(22, 116, 8, 8, 14), { fill: PAL.pink, sw: 1.6 });
  paint(ellPts(64, 58, 60, 46, 40), { fill: PAL.pink, dots: { col: PAL.pinkDk, r: 3, gap: 8, from: 0, to: 1, fade: Math.PI / 2 }, sw: 2.0 });
  commit();
  for (let i = 0; i < 3; i++) {
    const lift = clamp(1 - Math.abs(frame - 2 * i) / 1.5);
    const r = 11 + 3 * lift;
    paint(ellPts(30 + i * 34, 62 - 16 * lift, r, r, 18), { fill: PAL.cream, sw: 1.6 });
  }
  commit();
}, { brushScale: 2.4, frames: 8 });
// the turn is over but subagents or commands it started still run: an orange ball circling a quiet disc
piece('status-background-frames', ST, ST, frame => {
  const a = frame / 8 * TAU - Math.PI / 2;
  paint(ellPts(SC, SC, 40, 40, 32), { fill: PAL.cream, dots: { col: PAL.orangeLt, r: 3, gap: 8 }, sw: 2.0 });
  commit();
  paint(starPts(SC, SC, 22, .34, 4, Math.PI / 4), { fill: PAL.pink, sw: 1.4 });
  commit();
  paint(ellPts(SC + Math.cos(a) * 46, SC + Math.sin(a) * 46, 13, 13, 18), { fill: PAL.orange, sw: 1.8 });
  commit();
}, { brushScale: 2.4, frames: 8 });
// compacting: two plates press a pink disc flat and let it go
piece('status-compacting-frames', ST, ST, frame => {
  const squash = [0, .35, .7, 1, .7, .35][frame];
  const rx = 42 + 16 * squash, ry = 42 - 22 * squash;
  paint(ellPts(SC, SC, rx, ry, 32), { fill: PAL.pink, dots: { col: PAL.pinkDk, r: 3, gap: 8 }, sw: 2.0 });
  commit();
  paint(rectPts(SC - 38, SC - ry - 16, 76, 12), { fill: PAL.ink, ink: null });
  paint(rectPts(SC - 38, SC + ry + 4, 76, 12), { fill: PAL.ink, ink: null });
  commit();
}, { brushScale: 2.4, frames: 6 });
piece('status-idle', ST, ST, () => {
  badgeDisc(PAL.cream, { col: PAL.pinkLt, r: 3.4, gap: 8 });
  commit();
  paint(ellPts(SC, SC, 16, 16, 20), { fill: PAL.ink, ink: null });
  commit();
}, { brushScale: 2.4 });
piece('status-done', ST, ST, () => {
  badgeDisc(PAL.cream, null);
  commit();
  inkLine([[34, 66], [56, 90], [98, 36]], 5, PAL.pink, 'ink', 0);
  inkLine([[34, 66], [56, 90], [98, 36]], 1.6, PAL.ink, 'inkfine', 0);
  commit();
}, { brushScale: 2.4 });
piece('status-aborted', ST, ST, () => {
  badgeDisc(PAL.cream, null);
  commit();
  inkLine([[40, 40], [88, 88]], 3.2, PAL.ink, 'ink', 0);
  inkLine([[88, 40], [40, 88]], 3.2, PAL.ink, 'ink', 0);
  commit();
}, { brushScale: 2.4 });
piece('status-error', ST, ST, () => {
  const bolt = [[72, 8], [30, 70], [60, 70], [48, 122], [98, 52], [68, 52], [86, 8]];
  paint(bolt, { fill: PAL.orange, dots: { col: PAL.pink, r: 3, gap: 8 }, sw: 2.0 });
  commit();
}, { brushScale: 2.4 });
piece('status-paused', ST, ST, () => {
  badgeDisc(PAL.cream, null);
  commit();
  paint(rectPts(42, 36, 14, 56), { fill: PAL.ink, ink: null });
  paint(rectPts(72, 36, 14, 56), { fill: PAL.ink, ink: null });
  commit();
}, { brushScale: 2.4 });
// rate limited, waiting for the limit to reset: an hourglass that drains, then turns over
piece('status-rate-limited-frames', ST, ST, frame => {
  const turned = frame === 6, left = turned ? 1 : 1 - frame / 5;
  const glass = [[34, 14], [94, 14], [70, 64], [94, 114], [34, 114], [58, 64]];
  const turn = pts => turned ? rotPts(pts, SC, SC, Math.PI / 2) : pts;
  paint(turn(glass), { fill: PAL.cream, sw: 2.0 });
  commit();
  // sand is a triangle in each bulb, the top one shrinking toward the neck and the bottom one filling up
  const top = 46 - 20 * left, bottom = 104 - 26 * (1 - left);
  if (left > 0) paint(turn([[64 - 16 * left, top], [64 + 16 * left, top], [64, 64]]), { fill: PAL.orange, ink: null });
  if (left < 1) paint(turn([[64 - 18 * (1 - left) - 10, 104], [64 + 18 * (1 - left) + 10, 104], [64, bottom]]), { fill: PAL.orange, ink: null });
  if (!turned && left > 0) paint(turn(rectPts(62, 64, 4, 38)), { fill: PAL.orange, ink: null });
  commit();
}, { brushScale: 2.4, frames: 7 });
piece('status-disconnected', ST, ST, () => {
  // a ring snapped in two, the halves pulled apart
  for (const [a0, dx] of [[0.35, 6], [Math.PI + 0.35, -6]]) {
    const arc = []; for (let i = 0; i <= 14; i++) { const a = a0 + i / 14 * (Math.PI - 0.7); arc.push([SC + dx + Math.cos(a) * 44, SC + Math.sin(a) * 44]); }
    inkLine(arc, 4, PAL.ink, 'ink', .5);
  }
  commit();
}, { brushScale: 2.4 });
// waiting on the reader: the speech bubble hops, squashing as it lands, to ask for attention
// [lift, width, height] per frame, as a share of the bubble at rest, which is drawn at 0.86 so the top of the hop fits
const HOP = [[0, 1, 1], [0, 1.12, .86], [-10, .92, 1.1], [-18, .96, 1.04], [-8, 1, 1], [0, 1.1, .9]];
for (const [name, fill, mark] of [['status-asking-frames', PAL.pink, '?'], ['status-permission-frames', PAL.orange, '!']]) {
  piece(name, ST, ST, frame => {
    // squash and stretch about the middle of the bubble's foot, then lift
    const [dy, width, height] = HOP[frame], sx = width * .86, sy = height * .86;
    const place = pts => pts.map(([x, y]) => [SC + (x - SC) * sx, 122 + (y - 122) * sy + dy]);
    paint(place([[30, 86], [18, 120], [58, 96]]), { fill, sw: 2.0 });
    commit();
    paint(place(ellPts(SC, 56, 54, 44, 36)), { fill, sw: 2.0 });
    const [[, markY]] = place([[SC, 58]]);
    label(mark, SC, markY, 80 * sy, PAL.cream, { weight: 900, align: 'center' });
    commit();
  }, { brushScale: 2.4, frames: HOP.length });
}
piece('status-empty', ST, ST, () => {
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, b = a + 0.32; inkLine([[SC + Math.cos(a) * 46, SC + Math.sin(a) * 46], [SC + Math.cos(b) * 46, SC + Math.sin(b) * 46]], 3, PAL.ink, 'ink', 0); }
  commit();
}, { brushScale: 2.4 });

// the archive button on a sidebar row: a file box with an orange lid, and for an archived row a box with an arrow
// coming back out of it
function fileBox() {
  paint(rectPts(22, 50, 84, 62), { fill: PAL.cream, dots: { col: PAL.pinkLt, r: 3, gap: 8, from: 0, to: 1 }, sw: 2 });
  commit();
  paint(rectPts(14, 32, 100, 22), { fill: PAL.orange, sw: 2 });
  inkLine([[48, 74], [80, 74]], 2.4, PAL.ink, 'ink', 0);
  commit();
}
piece('archive-box', ST, ST, () => fileBox(), { brushScale: 2.4 });
piece('archive-reopen', ST, ST, () => {
  fileBox();
  paint([[64, 2], [36, 30], [54, 30], [54, 60], [74, 60], [74, 30], [92, 30]], { fill: PAL.pink, sw: 2 });
  commit();
}, { brushScale: 2.4 });

// ---------- avatars ----------
// discord-signup-store's Event-Manager bot. Discord crops avatars to a circle, so the crab sits inside it on paper.
piece('avatar-event-manager', 512, 512, () => crab(252, 290, 21, { pose: 'wave' }), { bg: true });

// ---------- favicons ----------
// dash's tab icon, shown at 16-32px: the crab fills the square, with the heaviest ink of any piece, on a paper disc
// so the navy outline still reads on a dark tab bar.
piece('favicon', 256, 256, () => {
  paint(ellPts(128, 128, 126, 126, 48), { fill: PAL.paper, ink: null });
  commit();
  crab(128, 150, 12, { pose: 'wave' });
}, { brushScale: 1.4 });
// the home-screen icon on phones, which the phone puts on a rounded square of its own: on paper, with room round it
piece('apple-touch-icon', 180, 180, () => crab(88, 102, 7.4, { pose: 'wave' }), { bg: true, brushScale: 1.1 });

// ---------- the library's shelf ----------
// kayushkin.com/library picks a shelf from a painted bookshelf: one object per shelf, each standing on the plank
// (the page draws the plank), so every object's base sits on the bottom edge of its 300x300 canvas.
const SHELF = 300, FLOOR = 288;

// an ink drop shadow offset down-right, the zine's hard sticker shadow
function shadowed(pts, o) {
  paint(move(pts, 7, 7), { fill: PAL.ink, ink: null, curv: o.curv });
  commit();
  paint(pts, o);
  commit();
}
// a band of an annulus between two angles, for headphone bands and mic yokes
function arcBand(cx, cy, r0, r1, a0, a1, n = 28) {
  const out = [], inn = [];
  for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); out.push([cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]); inn.push([cx + Math.cos(a) * r0, cy + Math.sin(a) * r0]); }
  return out.concat(inn.reverse());
}

// Books: two upright, one leaning, and headphones over them, since audiobooks share the shelf.
piece('shelf-books', SHELF, SHELF, () => {
  // leaning right, resting on its bottom-right corner, so its foot stays on the plank
  const lean = rotPts(rectPts(168, FLOOR - 196, 54, 196, 1.5), 222, FLOOR - 2, .28);
  shadowed(lean, { fill: PAL.cream, dots: { col: PAL.pinkLt, r: 2.4, gap: 7, from: .2, to: 1, fade: 0 }, sw: 2 });
  const a = rectPts(36, FLOOR - 206, 62, 206, 1.5);
  shadowed(a, { fill: PAL.orange, dots: { col: PAL.orangeDk, r: 2.6, gap: 7.5, from: 0, to: 1, fade: 0 }, sw: 2 });
  paint(rectPts(44, FLOOR - 150, 46, 30, 1), { fill: PAL.cream, sw: 1.4 });
  inkLine([[38, FLOOR - 186], [96, FLOOR - 186]], 1.4); inkLine([[38, FLOOR - 26], [96, FLOOR - 26]], 1.4);
  commit();
  const b = rectPts(100, FLOOR - 228, 70, 228, 1.5);
  shadowed(b, { fill: PAL.pink, dots: { col: PAL.pinkDk, r: 2.6, gap: 7.5, from: 0, to: 1, fade: 0 }, sw: 2 });
  paint(starPts(135, FLOOR - 120, 19, .46), { fill: PAL.white, sw: 1.4 });
  inkLine([[102, FLOOR - 206], [168, FLOOR - 206]], 1.4); inkLine([[102, FLOOR - 30], [168, FLOOR - 30]], 1.4);
  commit();
  // headphones hung over the pink book
  paint(arcBand(135, FLOOR - 214, 46, 56, Math.PI * 1.02, Math.PI * 1.98), { fill: PAL.ink, ink: null });
  commit();
  for (const x of [86, 184]) {
    paint(ellPts(x, FLOOR - 204, 17, 25, 20, .8), { fill: PAL.orange, dots: { col: PAL.orangeDk, r: 2, gap: 6 }, sw: 1.8 });
    paint(ellPts(x, FLOOR - 204, 7, 12, 14), { fill: PAL.cream, ink: null });
    commit();
  }
});

// Movies: a clapperboard leaning on a film reel.
piece('shelf-movies', SHELF, SHELF, () => {
  shadowed(ellPts(186, FLOOR - 112, 100, 100, 40, .8), { fill: PAL.orange, dots: { col: PAL.orangeDk, r: 2.8, gap: 8, from: 0, to: 1, fade: Math.PI * .75 }, sw: 2.2 });
  for (let i = 0; i < 6; i++) {
    const t = i / 6 * TAU + .3;
    paint(ellPts(186 + Math.cos(t) * 56, FLOOR - 112 + Math.sin(t) * 56, 20, 20, 18), { fill: PAL.paper, sw: 1.6 });
  }
  paint(ellPts(186, FLOOR - 112, 13, 13, 14), { fill: PAL.ink, ink: null });
  commit();
  const body = rectPts(22, FLOOR - 128, 176, 128, 1.2);
  shadowed(body, { fill: PAL.ink, ink: PAL.inkDk, sw: 2 });
  for (const [y, txt] of [[FLOOR - 92, 'SCENE 7'], [FLOOR - 58, 'TAKE 2'], [FLOOR - 24, 'LIBRARY']]) {
    inkLine([[34, y + 14], [186, y + 14]], 1.2, PAL.cream, 'inkfine', 0);
    label(txt, 38, y, 19, PAL.cream, { weight: 700 });
  }
  commit();
  // the striped arm, opened up from its hinge at the board's top-left
  const hinge = [22, FLOOR - 130], tilt = -.34;
  const arm = rotPts(rectPts(22, FLOOR - 164, 178, 32, .8), hinge[0], hinge[1], tilt);
  paint(arm, { fill: PAL.cream, sw: 2 });
  commit();
  for (let i = 0; i < 5; i++) {
    const x = 34 + i * 34;
    paint(rotPts([[x, FLOOR - 164], [x + 18, FLOOR - 164], [x + 6, FLOOR - 132], [x - 12, FLOOR - 132]], hinge[0], hinge[1], tilt), { fill: PAL.ink, ink: null });
  }
  commit();
  paint(starPts(258, FLOOR - 196, 22, .46, 5, -Math.PI / 2 + .3), { fill: PAL.pink, sw: 1.4 });
  commit();
});

// Shows: a little television with rabbit ears and a star on the screen.
piece('shelf-shows', SHELF, SHELF, () => {
  for (const [x, y] of [[96, 22], [214, 34]]) {
    inkLine([[150, FLOOR - 186], [x, y]], 2.2, PAL.ink, 'ink', 0);
  }
  commit();
  for (const [x, y] of [[96, 22], [214, 34]]) paint(ellPts(x, y, 9, 9, 14), { fill: PAL.pink, sw: 1.4 });
  commit();
  for (const x of [70, 214]) paint(rectPts(x, FLOOR - 22, 18, 22, .6), { fill: PAL.ink, ink: null });
  commit();
  const body = rectPts(26, FLOOR - 196, 248, 178, 1.4);
  shadowed(body, { fill: PAL.orange, dots: { col: PAL.orangeDk, r: 2.6, gap: 7.5, from: 0, to: 1, fade: Math.PI * .6 }, sw: 2.2 });
  const screen = rectPts(46, FLOOR - 176, 162, 138, 1);
  paint(screen, { fill: PAL.cream, dots: { col: PAL.pinkLt, r: 3, gap: 8, from: 1, to: .2, fade: Math.PI / 2 }, sw: 2 });
  commit();
  paint(starPts(127, FLOOR - 104, 40, .46, 5, -Math.PI / 2 + .2), { fill: PAL.white, sw: 1.8 });
  commit();
  for (const y of [FLOOR - 150, FLOOR - 106]) paint(ellPts(242, y, 14, 14, 16), { fill: PAL.cream, sw: 1.6 });
  for (let i = 0; i < 4; i++) inkLine([[226, FLOOR - 76 + i * 11], [258, FLOOR - 76 + i * 11]], 1.4, PAL.ink, 'inkfine', 0);
  commit();
});

// Manga: volumes stacked flat, numbered on the spine, with a POW burst behind.
piece('shelf-manga', SHELF, SHELF, () => {
  shadowed(starPts(212, 86, 76, .62, 11, -Math.PI / 2 + .2), { fill: PAL.pink, dots: { col: PAL.pinkDk, r: 2.4, gap: 7, from: 0, to: 1, fade: Math.PI / 2 }, sw: 2 });
  label('POW!', 212, 90, 34, PAL.white, { weight: 900, align: 'center', rot: -.12, font: '"DejaVu Sans", sans-serif' });
  commit();
  const vols = [
    [30, FLOOR - 44, 214, 44, PAL.orange, PAL.orangeDk, '1'],
    [44, FLOOR - 86, 200, 42, PAL.cream, PAL.pinkLt, '2'],
    [24, FLOOR - 128, 206, 42, PAL.pink, PAL.pinkDk, '3'],
    [52, FLOOR - 168, 188, 40, PAL.cream, PAL.orangeLt, '4'],
  ];
  for (const [x, y, w, h, fill, dot, n] of vols) {
    shadowed(rectPts(x, y, w, h, 1), { fill, dots: { col: dot, r: 2.2, gap: 6.5, from: 0, to: 1, fade: 0 }, sw: 2 });
    paint(rectPts(x + w - 44, y + 6, 32, h - 12, .6), { fill: PAL.ink, ink: null });
    label(n, x + w - 28, y + h / 2 + 1, 22, PAL.cream, { weight: 700, align: 'center' });
    inkLine([[x + 14, y + h / 2], [x + w - 60, y + h / 2]], 1.3, PAL.ink, 'inkfine', 0);
    commit();
  }
});

// Podcasts: a studio microphone on its stand, with sound coming off it.
piece('shelf-podcasts', SHELF, SHELF, () => {
  shadowed(ellPts(150, FLOOR - 12, 78, 15, 28, .6), { fill: PAL.orange, dots: { col: PAL.orangeDk, r: 2, gap: 6 }, sw: 2 });
  paint(rectPts(141, FLOOR - 96, 18, 86, .5), { fill: PAL.ink, ink: null });
  commit();
  paint(arcBand(150, FLOOR - 176, 80, 92, Math.PI * .02, Math.PI * .98), { fill: PAL.ink, ink: null });
  commit();
  const head = ellPts(150, FLOOR - 186, 62, 86, 40, .6);
  shadowed(head, { fill: PAL.cream, dots: { col: PAL.ink, r: 2.1, gap: 9, from: 1, to: .5, fade: 0 }, sw: 2.2 });
  paint(rectPts(86, FLOOR - 186, 128, 24, .8), { fill: PAL.pink, dots: { col: PAL.pinkDk, r: 1.8, gap: 6 }, sw: 1.8 });
  commit();
  for (const side of [-1, 1]) for (const r of [102, 126]) {
    const pts = []; for (let i = 0; i <= 12; i++) { const a = side * (-.5 + i / 12) * .9 + (side < 0 ? Math.PI : 0); pts.push([150 + Math.cos(a) * r, FLOOR - 190 + Math.sin(a) * r]); }
    inkLine(pts, 2, PAL.orange, 'inkfine', .5);
  }
  commit();
});

// Music: a vinyl record standing on its edge in front of a little speaker, with a note floating up. The page
// stacks three layers so the record alone can spin while music plays: shelf-music behind, shelf-music-record, and
// shelf-music-front over it. All three share one canvas, and the record turns about its centre.
const MUSIC_RECORD = { cx: 116, r: 104, cy: FLOOR - 104 };
piece('shelf-music', SHELF, SHELF, () => {
  // the speaker cabinet behind, on the right
  shadowed(rectPts(166, FLOOR - 214, 112, 214, 1.4), { fill: PAL.orange, dots: { col: PAL.orangeDk, r: 2.6, gap: 7.5, from: 0, to: 1, fade: Math.PI * .6 }, sw: 2.2 });
  paint(ellPts(222, FLOOR - 172, 20, 20, 20), { fill: PAL.cream, sw: 1.8 });
  paint(ellPts(222, FLOOR - 172, 7, 7, 12), { fill: PAL.ink, ink: null });
  commit();
  // the record's shadow stays put while the record turns
  const { cx, cy, r } = MUSIC_RECORD;
  paint(move(ellPts(cx, cy, r, r, 48), 7, 7), { fill: PAL.ink, ink: null });
  commit();
});

// the record, upright with its foot on the plank; drawn round so it reads the same at any angle
piece('shelf-music-record', SHELF, SHELF, () => {
  const { cx, cy, r } = MUSIC_RECORD;
  paint(ellPts(cx, cy, r, r, 48), { fill: PAL.ink, ink: PAL.inkDk, sw: 2.2 });
  for (const gr of [88, 74, 60]) inkLine(ellPts(cx, cy, gr, gr, 40).concat([[cx + gr, cy]]), 1.1, PAL.orangeLt, 'inkfine', .5);
  commit();
  paint(ellPts(cx, cy, 36, 36, 28), { fill: PAL.pink, dots: { col: PAL.pinkDk, r: 2, gap: 6, from: 0, to: 1, fade: Math.PI / 2 }, sw: 1.8 });
  commit();
  // a cream band printed on the label, so the turning shows
  paint(arcBand(cx, cy, 16, 27, -2.5, -1.2, 16), { fill: PAL.cream, ink: null });
  commit();
  paint(ellPts(cx, cy, 6, 6, 12), { fill: PAL.paper, sw: 1.2 });
  commit();
});

piece('shelf-music-front', SHELF, SHELF, () => {
  const { cx, cy } = MUSIC_RECORD;
  // a glint across the grooves: light from the room, so it does not turn with the record
  inkLine(ellPts(cx, cy, 80, 80, 40).slice(24, 30), 3, PAL.cream, 'ink', .5);
  commit();
  // the woofer, showing below and right of the record
  paint(ellPts(232, FLOOR - 82, 34, 34, 28), { fill: PAL.cream, dots: { col: PAL.pinkLt, r: 2.2, gap: 6.5, from: 1, to: .2, fade: Math.PI / 2 }, sw: 2 });
  paint(ellPts(232, FLOOR - 82, 13, 13, 16), { fill: PAL.ink, ink: null });
  commit();
  // an eighth-note pair floating in the corner above the record
  paint([[44, 58], [50, 58], [50, 16], [44, 16]], { fill: PAL.ink, ink: null });
  paint([[90, 46], [96, 46], [96, 4], [90, 4]], { fill: PAL.ink, ink: null });
  paint([[44, 16], [96, 4], [96, 18], [44, 30]], { fill: PAL.ink, ink: null });
  commit();
  paint(ellPts(35, 61, 15, 11, 20, 0, -.4), { fill: PAL.pink, sw: 1.8 });
  paint(ellPts(81, 49, 15, 11, 20, 0, -.4), { fill: PAL.pink, sw: 1.8 });
  commit();
});

// ---------- where each picture lives ----------
// bridge-ui's zine.css draws these, so they ship with bridge-ui and dash imports the ones it shows itself. Any other
// piece is dash's own. A misspelt name here fails the render rather than landing a picture in the wrong repo.
const BRIDGE_UI_PIECES = [
  'star', 'crab-sleep', 'crab-hello-frames', 'archive-box', 'archive-reopen',
  ...Object.keys(MOOD_FRAMES).map(mood => `crab-mini-${mood}-frames`),
  ...Object.keys(CONDUCTOR_FRAMES).map(state => `conductor-${state}-frames`),
  ...Object.keys(PIECES).filter(name => name.startsWith('status-')),
];
for (const name of BRIDGE_UI_PIECES) {
  if (!PIECES[name]) throw new Error(`BRIDGE_UI_PIECES names ${name}, which is not a piece`);
  PIECES[name].home = 'bridge-ui';
}

// kayushkin.com/library draws these; render.mjs writes them into that repo's public/art/library/.
for (const name of Object.keys(PIECES).filter(n => n.startsWith('shelf-'))) PIECES[name].home = 'kayushkin.com'

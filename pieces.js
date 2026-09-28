// pieces.js: every picture the zine theme uses. `node render.mjs --pieces` writes each to public/art/zine/<name>.png.
// Transparent backgrounds throughout: the page's own CSS paper shows through.

// ---------- the mascot ----------
piece('crab-wave', 620, 560, () => crab(300, 350, 30, { pose: 'wave' }));
piece('crab-cheer', 620, 560, () => crab(310, 360, 30, { pose: 'cheer', eyes: 'star' }));
piece('crab-think', 620, 560, () => crab(290, 360, 30, { pose: 'think', eyes: 'look', mouth: 'flat' }));
piece('crab-sleep', 620, 560, () => crab(290, 370, 30, { pose: 'sleep', eyes: 'closed' }));
// the status row's mascot, one per mood of bridge-ui's status slot (`data-mood`): drawn small, heavier ink
piece('crab-mini-thinking', 220, 200, () => crab(104, 128, 11, { pose: 'think', eyes: 'look', mouth: 'flat' }), { brushScale: 1.1 });
piece('crab-mini-working', 220, 200, () => crab(118, 124, 11, { pose: 'run', mouth: 'grin' }), { brushScale: 1.1 });
piece('crab-mini-waiting', 220, 200, () => crab(116, 128, 11, { pose: 'wave', mouth: 'o', mark: '!' }), { brushScale: 1.1 });
piece('crab-mini-resting', 220, 200, () => crab(100, 132, 11, { pose: 'sleep', eyes: 'closed' }), { brushScale: 1.1 });
piece('crab-mini-trouble', 220, 220, () => crab(110, 150, 11, { pose: 'alarm', eyes: 'x', mouth: 'o' }), { brushScale: 1.1 });
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
piece('status-working', ST, ST, () => {
  // an orange cog-star: eight blunt points round a pink hub
  const pts = [];
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? 40 : 56; pts.push([SC + Math.cos(a) * r, SC + Math.sin(a) * r]); }
  paint(pts, { fill: PAL.orange, dots: { col: PAL.pink, r: 3, gap: 8, from: 0, to: 1, fade: Math.PI / 2 }, sw: 2.0 });
  commit();
  paint(ellPts(SC, SC, 17, 17, 20), { fill: PAL.pink, sw: 1.6 });
  commit();
}, { brushScale: 2.4 });
piece('status-thinking', ST, ST, () => {
  paint(starPts(SC, SC, 58, .3, 4), { fill: PAL.pink, dots: { col: PAL.pinkDk, r: 3, gap: 8, from: 0, to: 1, fade: Math.PI / 4 }, sw: 2.0 });
  commit();
}, { brushScale: 2.4 });
piece('status-background', ST, ST, () => {
  badgeDisc(PAL.cream, { col: PAL.orangeLt, r: 3, gap: 8 });
  commit();
  paint(starPts(SC, SC, 34, .32, 4, Math.PI / 4), { fill: PAL.orange, sw: 1.6 });
  commit();
}, { brushScale: 2.4 });
piece('status-compacting', ST, ST, () => {
  // a squashed pink disc with pressure lines above and below
  paint(ellPts(SC, SC, 52, 30, 30), { fill: PAL.pink, dots: { col: PAL.pinkDk, r: 3, gap: 8 }, sw: 2.0 });
  inkLine([[SC - 28, 18], [SC + 28, 18]], 1.8, PAL.ink, 'ink', 0);
  inkLine([[SC - 28, 110], [SC + 28, 110]], 1.8, PAL.ink, 'ink', 0);
  commit();
}, { brushScale: 2.4 });
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
piece('status-rate-limited', ST, ST, () => {
  // an hourglass
  paint([[34, 14], [94, 14], [70, 64], [94, 114], [34, 114], [58, 64]], { fill: PAL.cream, sw: 2.0 });
  commit();
  paint([[46, 104], [82, 104], [64, 78]], { fill: PAL.orange, ink: null });
  paint([[48, 26], [80, 26], [64, 46]], { fill: PAL.orange, ink: null });
  commit();
}, { brushScale: 2.4 });
piece('status-disconnected', ST, ST, () => {
  // a ring snapped in two, the halves pulled apart
  for (const [a0, dx] of [[0.35, 6], [Math.PI + 0.35, -6]]) {
    const arc = []; for (let i = 0; i <= 14; i++) { const a = a0 + i / 14 * (Math.PI - 0.7); arc.push([SC + dx + Math.cos(a) * 44, SC + Math.sin(a) * 44]); }
    inkLine(arc, 4, PAL.ink, 'ink', .5);
  }
  commit();
}, { brushScale: 2.4 });
for (const [name, fill, mark] of [['status-asking', PAL.pink, '?'], ['status-permission', PAL.orange, '!']]) {
  piece(name, ST, ST, () => {
    // a speech bubble with its tail at the bottom left
    paint([[30, 86], [18, 120], [58, 96]], { fill, sw: 2.0 });
    commit();
    paint(ellPts(SC, 56, 54, 44, 36), { fill, sw: 2.0 });
    label(mark, SC, 58, 70, PAL.cream, { weight: 900, align: 'center' });
    commit();
  }, { brushScale: 2.4 });
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

// pieces.js: every picture the zine theme uses. `node render.mjs --pieces` writes each to public/art/zine/<name>.png.
// Transparent backgrounds throughout: the page's own CSS paper shows through.

// ---------- the mascot ----------
piece('crab-wave', 620, 560, () => crab(300, 350, 30, { pose: 'wave' }));
piece('crab-cheer', 620, 560, () => crab(310, 360, 30, { pose: 'cheer', eyes: 'star' }));
piece('crab-think', 620, 560, () => crab(290, 360, 30, { pose: 'think', eyes: 'look', mouth: 'flat' }));
piece('crab-sleep', 620, 560, () => crab(290, 370, 30, { pose: 'sleep', eyes: 'closed' }));
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

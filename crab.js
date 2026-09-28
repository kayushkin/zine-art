// crab.js: Dash's mascot, the 🦀 of the brand drawn as a riso-print switchboard operator. An orange puffy shell,
// big eyes on stalks (a star in one), pink cheeks, a navy headset with a boom mic, and two claws.
//
// crab(cx, cy, s, o): (cx, cy) is the centre of the shell, `s` the unit; the shell is 10s wide and 6.4s tall, the
// eyes reach up to about -7s and the legs down to about +5s.
//   o.pose:  'wave' (right claw up), 'cheer' (both up), 'think' (claw at the chin), 'sleep' (eyes shut, claws down),
//            'run' (claws pumping, speed lines behind), 'alarm' (claws flung up, a "!" by the head)
//   o.eyes:  'open' | 'star' (a star in both) | 'closed' | 'look' (glancing to the side, as in the reference) | 'x'
//   o.mouth: 'grin' | 'o' | 'smile' | 'flat'
//   o.headset: false to leave it off
// For animation frames, which move one pose a little at a time:
//   o.claws:    [left, right], each [tipX, tipY, open, ang] in units of s, in place of the pose's claws
//   o.legSwing: how far, in s, the feet swing; alternate legs swing opposite ways (a scuttle)
//   o.speed:    how long the run pose's speed lines are, 1 as drawn
//   o.look:     how far the pupils glance sideways, in place of the eyes setting's
//   o.lookDown: how far the pupils glance down, 0 to 1
//   o.bowtie:   a pink bow tie under the mouth (the conductor wears one, with no headset)
//   o.marks:    false to leave off the pose's marks by the head (the "?", the z's, the "!"), to draw them yourself
function crab(cx, cy, s, o = {}) {
  const P = (x, y) => [cx + x * s, cy + y * s];
  const pts = arr => arr.map(([x, y]) => P(x, y));
  const sw = clamp(s / 17, .5, 2.2), pose = o.pose || 'wave', eyes = o.eyes || 'open';

  // legs first, so the shell covers their roots: three a side, bent at the knee
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
    const rootX = side * (2.4 + i * 1.1), rootY = 1.6 + i * .25;
    const swing = (o.legSwing ?? 0) * ((i + (side > 0 ? 1 : 0)) % 2 ? 1 : -1);
    const kneeX = side * (4.6 + i * 1.0) + swing * .5, kneeY = 2.6 + i * .6, footX = side * (5.4 + i * 1.1) + swing, footY = 4.6 + i * .4;
    leg(pts([[rootX, rootY], [kneeX, kneeY], [footX, footY]]), s * .9, sw);
  }

  // claws: the arm from the shell's side to the pincer, drawn before the shell
  const claw = (side, tipX, tipY, open, ang) => {
    const root = [side * 4.2, .2], elbow = [side * 5.8, (root[1] + tipY) / 2 + (tipY < -1 ? .6 : -.2)];
    leg(pts([root, elbow, [tipX, tipY + .9]]), s * 1.05, sw);
    pincer(P(tipX, tipY), s * 1.8, side, open, ang, sw);
  };
  if (o.claws) {
    if (pose === 'run') for (const [y, len] of [[-1.6, 3.2], [0.2, 4.2], [2.0, 2.8]]) inkLine(pts([[-6.2, y], [-6.2 - len * (o.speed ?? 1), y]]), sw * .9, PAL.ink, 'inkfine', 0);
    claw(-1, ...o.claws[0]); claw(1, ...o.claws[1]);
  }
  else if (pose === 'wave') { claw(-1, -6.4, 1.6, .25, .9); claw(1, 7.0, -4.6, .55, -.35); }
  else if (pose === 'cheer') { claw(-1, -7.0, -4.6, .55, .35); claw(1, 7.0, -4.6, .55, -.35); }
  else if (pose === 'think') { claw(-1, -6.4, 1.6, .25, .9); claw(1, 3.6, 2.6, .15, -2.2); }
  else if (pose === 'run') {
    // speed lines trailing off to the left, then one claw thrust forward and one back
    for (const [y, len] of [[-1.6, 3.2], [0.2, 4.2], [2.0, 2.8]]) inkLine(pts([[-6.2, y], [-6.2 - len * (o.speed ?? 1), y]]), sw * .9, PAL.ink, 'inkfine', 0);
    claw(-1, -6.8, 3.2, .2, 1.4); claw(1, 7.4, -2.6, .6, -.1);
  }
  else if (pose === 'alarm') { claw(-1, -7.4, -5.2, .7, .5); claw(1, 7.4, -5.2, .7, -.5); }
  else { claw(-1, -6.0, 2.4, .1, 1.2); claw(1, 6.0, 2.4, .1, -1.2); }
  commit();

  // headset band arches behind the eyes; ear cups and the boom mic come after the shell
  if (o.headset !== false) {
    inkLine(pts([[-3.9, -2.0], [-4.2, -6.0], [-2.4, -8.8], [0, -9.3], [2.4, -8.8], [4.2, -6.0], [3.9, -2.0]]), sw * 1.5, PAL.ink, 'ink', .8);
    commit();
  }

  // eye stalks, behind the shell's top edge
  for (const side of [-1, 1]) leg(pts([[side * 1.3, -2.2], [side * 1.7, -3.8], [side * 2.1, -5.0]]), s * .75, sw);
  commit();

  // the shell: a puffy cloud like the reference's hair, pink halftone settling toward the bottom
  const shell = puffPts(cx, cy, 5 * s, 3.2 * s, 12, .12, -.2, 3);
  paint(shell, { fill: PAL.orange, dots: { col: PAL.pink, r: s * .18, gap: s * .42, from: 0, to: 1, fade: Math.PI / 2 }, sw: sw * 1.1 });
  // a cream highlight up top, with orange dots fading out, like the lit side of the face
  paint(ellPts(cx - 2.0 * s, cy - 1.6 * s, 1.5 * s, .6 * s, 22, s * .03, -.3),
        { fill: PAL.cream, dots: { col: PAL.orangeLt, r: s * .14, gap: s * .36, from: 1, to: 0, fade: -.4 }, ink: null });
  commit();

  // cheeks
  for (const side of [-1, 1]) paint(ellPts(cx + side * 2.9 * s, cy + .5 * s, .95 * s, .5 * s, 20),
    { fill: PAL.pinkLt, dots: { col: PAL.pink, r: s * .11, gap: s * .26 }, ink: null });

  // mouth
  const m = o.mouth || (pose === 'sleep' ? 'o' : 'grin');
  if (m === 'grin') {
    const mouth = pts([[-1.5, .1], [-.8, .25], [0, .28], [.8, .25], [1.5, .1], [1.1, 1.0], [0, 1.35], [-1.1, 1.0]]);
    paint(mouth, { fill: PAL.ink, ink: PAL.ink, sw: sw * .6, curv: .6 });
    paint(pts([[-.7, .95], [0, .75], [.7, .95], [0, 1.25]]), { fill: PAL.pink, ink: null, curv: .8 });
  } else if (m === 'o') {
    paint(ellPts(cx, cy + .7 * s, .45 * s, .55 * s, 16), { fill: PAL.ink, ink: PAL.ink, sw: sw * .5 });
  } else if (m === 'smile') {
    inkLine(pts([[-1.2, .3], [0, 1.0], [1.2, .3]]), sw * .9);
  } else {
    inkLine(pts([[-.8, .7], [.8, .7]]), sw * .9);
  }
  commit();

  // eyes on the stalk tips
  for (const side of [-1, 1]) {
    const [ex, ey] = P(side * 2.3, -6.0), r = 1.7 * s;
    paint(ellPts(ex, ey, r * .92, r, 28), { fill: PAL.cream, sw: sw * 1.1 });
    if (eyes === 'closed') {
      inkLine([[ex - r * .6, ey + r * .1], [ex, ey + r * .45], [ex + r * .6, ey + r * .1]], sw * 1.1);
      continue;
    }
    if (eyes === 'x') {
      inkLine([[ex - r * .45, ey - r * .45], [ex + r * .45, ey + r * .45]], sw * 1.3, PAL.ink, 'ink', 0);
      inkLine([[ex + r * .45, ey - r * .45], [ex - r * .45, ey + r * .45]], sw * 1.3, PAL.ink, 'ink', 0);
      continue;
    }
    const look = o.look ?? (eyes === 'look' ? .38 : 0), px = ex + look * r * (side < 0 ? 1.1 : .7), py = ey + r * (.08 + (o.lookDown ?? 0) * .45);
    paint(ellPts(px, py, r * .55, r * .62, 24), { fill: PAL.ink, dots: { col: PAL.pink, r: s * .08, gap: s * .2, from: 0, to: 1 }, ink: null });
    if (eyes === 'star' || side < 0) paint(starPts(px, py, r * .36, .45), { fill: PAL.white, ink: null });
    else paint(ellPts(px - r * .18, py - r * .2, r * .16, r * .16, 12), { fill: PAL.white, ink: null });
    // a lash flick on the outside corner
    inkLine([[ex + side * r * .75, ey - r * .55], [ex + side * r * 1.15, ey - r * .9]], sw * .9);
  }
  commit();

  if (o.bowtie) {
    for (const side of [-1, 1]) paint(pts([[side * .2, 2.4], [side * 2.0, 1.5], [side * 2.0, 3.3]]), { fill: PAL.pink, sw: sw * .9 });
    paint(ellPts(cx, cy + 2.4 * s, .55 * s, .55 * s, 12), { fill: PAL.pinkDk, sw: sw * .8 });
    commit();
  }

  // headset: ear cups at the shell's shoulders and a boom mic sweeping toward the mouth
  if (o.headset !== false) {
    for (const side of [-1, 1]) paint(ellPts(cx + side * 4.1 * s, cy - 1.6 * s, .75 * s, 1.05 * s, 18, 0, side * .2), { fill: PAL.ink, dots: { col: PAL.orangeLt, r: s * .07, gap: s * .2 }, sw });
    inkLine(pts([[4.4, -1.0], [4.2, .6], [3.2, 1.4], [2.2, 1.5]]), sw * 1.5, PAL.ink, 'ink', .8);
    paint(ellPts(cx + 1.9 * s, cy + 1.5 * s, .42 * s, .36 * s, 14), { fill: PAL.ink, sw: sw * .6 });
    commit();
  }

  // little marks by the head
  if (o.marks === false) return;
  if (pose === 'sleep') {
    label('z', cx + 5.4 * s, cy - 5.6 * s, s * 1.4, PAL.ink, { weight: 700 });
    label('z', cx + 6.4 * s, cy - 7.0 * s, s * 1.9, PAL.ink, { weight: 700 });
    label('Z', cx + 7.6 * s, cy - 8.8 * s, s * 2.5, PAL.pink, { weight: 700 });
    commit();
  }
  if (pose === 'think') {
    label('?', cx + 5.8 * s, cy - 6.4 * s, s * 3.2, PAL.pink, { weight: 700, rot: .15 });
    commit();
  }
  if (pose === 'alarm' || o.mark === '!') {
    // between the raised claws when alarmed; otherwise by the head on the side away from the waving claw
    label('!', cx + (pose === 'alarm' ? 0 : -6.2) * s, cy - (pose === 'alarm' ? 9.6 : 6.0) * s, s * 3.2, PAL.pink, { weight: 700, align: 'center', rot: -.1 });
    commit();
  }
}

// A leg or arm: a tapered orange tube along a bent path, with an ink edge.
function leg(path, thick, sw) {
  const L = [], R = [];
  for (let i = 0; i < path.length; i++) {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, t = thick * lerp(1, .6, i / (path.length - 1)) / 2;
    L.push([path[i][0] - dy / d * t, path[i][1] + dx / d * t]); R.unshift([path[i][0] + dy / d * t, path[i][1] - dx / d * t]);
  }
  paint([...L, ...R], { fill: PAL.orangeDk, sw: sw * .8, curv: .4 });
}

// A pincer at (x, y): a fat claw with a notch that opens by `open` (0..1), turned by `ang`, mirrored by `side`.
function pincer([x, y], r, side, open, ang, sw) {
  const q = (px, py) => { const c = Math.cos(ang), s = Math.sin(ang), X = px * side; return [x + X * c - py * s, y + X * s + py * c]; };
  const top = [], bottom = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * (Math.PI - open * 1.2); top.push(q(Math.cos(a) * r, Math.sin(a) * r * .8 - r * .1)); }
  const notch = q(r * .15, -r * .05);
  for (let i = 0; i <= 8; i++) { const a = open * .8 + i / 8 * (Math.PI - open * .8); bottom.push(q(Math.cos(a) * r * .9, Math.sin(a) * r * .55 + r * .05)); }
  paint([...top, notch, ...bottom], { fill: PAL.orange, dots: { col: PAL.pink, r: r * .1, gap: r * .26, from: 0, to: 1, fade: ang + Math.PI / 2 }, sw, curv: .3 });
}

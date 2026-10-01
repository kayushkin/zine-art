# About zine-art

## What it owns

The painting studio for the zine theme, the two-ink risograph look of dash and bridge-ui's chat: cream paper, navy ink, flat orange and pink, halftone dots, and a crab mascot. Every picture the theme shows is **painted by code here, not by an image model**: p5.js and p5.brush paint each piece in the system Chrome (`/usr/bin/google-chrome`) and `render.mjs` saves the canvas as a PNG, the way github.com/JohnHeibel/PDoomVideo made its video. It is a public repo with no service, no port and no deploy. The PNGs are committed in the repos that serve them, so neither needs this repo to build.

## Where this prompt lives

These sections are stored in agent-store as a project prompt collection and rendered, with identical text, to `AGENTS.md` and `CLAUDE.md` at the root of this repo, so that whichever file a harness reads it gets the same thing. Edit them on dash `/files`, or edit either rendered file: the 15-minute scan carries the edit back into the sections and out to the other file.

# How it works

## The files

`core.js` holds the palette (`PAL`), `paint(pts, {fill, dots, ink})`, where `dots` is halftone shading clipped to the shape, and `piece(name, w, h, fn, options)`; call `commit()` after each object so its dots and ink land over its fill. `crab.js` is the mascot. `pieces.js` lists every picture. `studio.html` loads all three; `render.mjs` serves the folder on a free port, opens `studio.html?piece=<name>` once per piece and saves each canvas.

## Where each picture goes

`render.mjs --pieces` writes each piece into the clone beside this repo that serves it. **bridge-ui's `zine/`** gets the pictures bridge-ui's `zine.css` draws — the status-row crabs, the conductor, the session status icons, the archive boxes, `star`, `crab-sleep` and `crab-hello-frames` — listed in `BRIDGE_UI_PIECES` at the end of `pieces.js`. **dash's `public/art/zine/`** gets the rest: the login poster, circuit strips, stickers, the peeking crab's poses, the brand mark, favicon and home-screen icon. A misspelt name in `BRIDGE_UI_PIECES` fails the render rather than landing a picture in the wrong repo. A new picture for the chat goes in that list; a new one for dash's own pages does not.

## Animations

A piece with `frames: n` is an animation: `fn(frame)` paints each frame into its own cell of one strip, and the stylesheet plays the strip with `steps(n)`. Frame 0 is what a reader who asks for reduced motion sees, so it must read on its own. `crab()` takes `claws`, `legSwing`, `speed`, `look` and `marks: false` so a frame can move one pose. `MOOD_FRAMES` draws one strip per `data-mood` of bridge-ui's status slot (`crab-mini-<mood>-frames`), reused large for the loading and empty-chat crabs; `CONDUCTOR_FRAMES` one per `data-state` of the conductor, the orchestrator at the foot of the chat sidebar, plus `glance` for the pointer over it. **The session crab is the agent you are talking to, and the conductor is the orchestrator.**

# Working in this repo

## Render, look, commit in two repos

`npm install`, then `node render.mjs --sheet --out=out/sheet.png` puts every piece on one image (`--only=a,b` for some). **Open the sheet before you commit a change to a picture**: fix scale, contrast and clutter until it reads at the size it is shown, which for the status icons is 16px. `node render.mjs --pieces [--only=…]` then writes the PNGs into dash and bridge-ui, and those changes are committed and pushed in **those** repos — a change to a piece here is usually three commits. A bridge-ui picture goes live by deploying dash. ⚠️ Not every piece renders byte for byte the same twice (`crab-wave` does not), so render only the pieces you changed, or the other repos get a diff for pictures nobody touched.

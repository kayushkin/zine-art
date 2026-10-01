# zine-art

The pictures for the zine theme of [bridge-ui](https://github.com/kayushkin/bridge-ui): a two-ink risograph print with a crab mascot. Every picture is painted by code — [p5.js](https://p5js.org) with [p5.brush](https://github.com/acamposuribe/p5.brush), rendered to PNG in headless Chrome — not drawn by an image model.

```bash
npm install
node render.mjs --sheet --out=out/sheet.png     # every piece on one image
node render.mjs --pieces --only=star             # write PNGs into ../bridge-ui and ../dash
```

`pieces.js` lists every picture, `crab.js` draws the mascot, and `core.js` holds the palette, the brush and the halftone dots. `render.mjs` expects Chrome at `/usr/bin/google-chrome` (`--chrome=<path>` to change it) and writes into the `bridge-ui` and `dash` clones beside this one.

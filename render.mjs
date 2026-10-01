// render.mjs: paint the zine theme's pictures in headless Chrome.
//   node render.mjs --pieces [--only=crab-wave,star]   write each piece into the repo that serves it: bridge-ui's
//                                                       zine/<name>.png (BRIDGE_UI_PIECES in pieces.js), else dash's
//                                                       public/art/zine/<name>.png
//   node render.mjs --sheet [--only=…] --out=out/sheet.png   every piece on one checker sheet, for looking at
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { extname, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true] }))
// the dash and bridge-ui clones beside this repo (~/repos/<name>)
const outDirs = { dash: join(here, '..', 'dash', 'public', 'art', 'zine'), 'bridge-ui': join(here, '..', 'bridge-ui', 'zine') }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }

// p5 loads its scripts over http, not file://, so serve this folder on a free port for the run.
const server = createServer(async (req, res) => {
  const path = join(here, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  if (!path.startsWith(here)) { res.writeHead(403).end(); return }
  let body
  try { body = await readFile(path) } catch { res.writeHead(404).end(); return }
  res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' }).end(body)
})
await new Promise(ok => server.listen(0, '127.0.0.1', ok))
const base = `http://127.0.0.1:${server.address().port}/studio.html`

// The system Chrome, as PDoomVideo does, so no Playwright browser download is needed.
const browser = await chromium.launch({ executablePath: args.chrome || '/usr/bin/google-chrome', args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage()
const failures = []
page.on('pageerror', e => failures.push(e.message))
page.on('console', m => { if (m.type() === 'error') failures.push(m.text()) })

await page.goto(base + '?piece=__list__').catch(() => {})
await page.waitForFunction(() => typeof PIECES === 'object')
const homes = await page.evaluate(() => Object.fromEntries(Object.entries(PIECES).map(([name, p]) => [name, p.home ?? 'dash'])))
let names = Object.keys(homes)
if (args.only) names = String(args.only).split(',')
failures.length = 0

const shots = []
for (const name of names) {
  const t0 = Date.now()
  await page.goto(`${base}?piece=${name}`)
  await page.waitForFunction(() => window.painted === true || window.__failed, null, { timeout: 120000 })
  if (failures.length) throw new Error(`${name}: ${failures.join('\n')}`)
  const url = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'))
  const png = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64')
  shots.push({ name, png })
  console.log(`${name}  ${Date.now() - t0} ms`)
}

if (args.pieces) {
  for (const { name, png } of shots) {
    const outDir = outDirs[homes[name]]
    if (!outDir) throw new Error(`${name}: no folder for home ${homes[name]}`)
    await mkdir(outDir, { recursive: true })
    await writeFile(join(outDir, `${name}.png`), png)
    console.log(`wrote ${join(outDir, name)}.png`)
  }
}
if (args.sheet) {
  // lay the pieces out on paper so transparent edges show what they will look like on the page
  const out = args.out || join(here, 'out', 'sheet.png')
  await mkdir(dirname(out), { recursive: true })
  const html = `<body style="margin:0;background:#EFE7D6;display:flex;flex-wrap:wrap;gap:12px;padding:12px;width:1500px">${
    shots.map(s => `<figure style="margin:0;font:14px monospace;color:#2E3B7A"><img style="max-width:480px;max-height:480px;display:block;outline:1px dashed #2E3B7A55" src="data:image/png;base64,${s.png.toString('base64')}"><figcaption>${s.name}</figcaption></figure>`).join('')}</body>`
  await page.setViewportSize({ width: 1524, height: 800 })
  await page.setContent(html)
  await page.screenshot({ path: out, fullPage: true })
  console.log(`sheet: ${out}`)
}
await browser.close()
server.close()

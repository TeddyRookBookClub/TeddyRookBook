#!/usr/bin/env node
/*
  Zip files for the offline download kit. Run after build-manifests.js:

      node scripts/offline/build-archives.js [public] [out-dir]

  Writes to out-dir (default: offline-dist, outside public/ so it never goes to GitHub Pages):
    TeddyRookBook-offline-kit.zip   the kit: start and update scripts, README (small)
    trb-core.zip, trb-<section>.zip one per section, the files listed in its manifest, plus .trb/zip/<id>.json
    offline-index.json              the section list these zips were made from

  The workflow .github/workflows/offline-release.yml uploads them to the GitHub release "offline".
  Needs the `zip` command (on GitHub's Ubuntu runners already).
*/
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const PUB = path.resolve(process.argv[2] || path.join(ROOT, 'public'));
const OUT = path.resolve(process.argv[3] || path.join(ROOT, 'offline-dist'));
const MAN = path.join(PUB, 'offline', 'manifests');
const NOZIP = '.jpg:.jpeg:.png:.gif:.webp:.mp3:.m4a:.mp4:.webm:.woff:.woff2:.zip:.pdf:.wasm';

if (!fs.existsSync(path.join(MAN, 'index.json'))) { console.error('No manifests in ' + MAN + ' (run build-manifests.js first)'); process.exit(1); }
{ const rel = path.relative(PUB, OUT); if (!rel.startsWith('..') && !path.isAbsolute(rel)) { console.error('Put the zips outside the site folder, not in ' + OUT); process.exit(1); } }
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const index = JSON.parse(fs.readFileSync(path.join(MAN, 'index.json'), 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'trb-zip-'));
const mb = n => (n / 1048576).toFixed(1) + ' MB';
const sizes = [];

function zipSection(id) {
  const m = JSON.parse(fs.readFileSync(path.join(MAN, id + '.json'), 'utf8'));
  const zip = path.join(OUT, 'trb-' + id + '.zip');
  const list = m.files.map(f => f[0]).filter(p => fs.existsSync(path.join(PUB, p)));
  // the files, read from public/ (names on stdin, so any number of them)
  execFileSync('zip', ['-q', '-X', '-n', NOZIP, zip, '-@'], { cwd: PUB, input: list.join('\n') + '\n', maxBuffer: 1 << 26 });
  // the manifest these files match, so the kit's updater knows what it has
  const d = path.join(tmp, id); fs.mkdirSync(path.join(d, '.trb', 'zip'), { recursive: true });
  fs.writeFileSync(path.join(d, '.trb', 'zip', id + '.json'), JSON.stringify(m));
  execFileSync('zip', ['-q', '-X', zip, '.trb/zip/' + id + '.json'], { cwd: d });
  sizes.push([id, m.bytes, fs.statSync(zip).size]);
}

zipSection('core');
for (const [id, s] of Object.entries(index.sections)) if (!s.online && fs.existsSync(path.join(MAN, id + '.json'))) zipSection(id);

// the kit itself: TeddyRookBook/ with the scripts (executable bits kept for Mac and Linux)
const kitDir = path.join(tmp, 'kit', 'TeddyRookBook');
fs.cpSync(path.join(__dirname, 'kit'), kitDir, { recursive: true });
execFileSync('zip', ['-q', '-X', '-r', path.join(OUT, 'TeddyRookBook-offline-kit.zip'), 'TeddyRookBook'], { cwd: path.join(tmp, 'kit') });
fs.copyFileSync(path.join(MAN, 'index.json'), path.join(OUT, 'offline-index.json'));
fs.rmSync(tmp, { recursive: true, force: true });

let total = 0; for (const s of sizes) total += s[2];
console.log('Offline zips in ' + path.relative(process.cwd(), OUT) + ': ' + sizes.length + ' sections, ' + mb(total) + ' together; kit ' + mb(fs.statSync(path.join(OUT, 'TeddyRookBook-offline-kit.zip')).size));
if (process.env.VERBOSE) for (const [id, raw, z] of sizes) console.log('  ' + id.padEnd(28) + mb(raw).padStart(10) + ' -> ' + mb(z).padStart(9));

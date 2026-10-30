/* Math Ladder: pictures for Pre-K (static/math/viz/pk.js), registered as "pk-pic" and "pk-read".
   Big, friendly pictures for ages 3 to 5, used with a grown-up. Emoji things to count, plus simple drawings (shapes,
   towers, ribbons, a pan balance, position scenes, the sky at different times of day, coins and hands). Nothing in a
   picture states the answer, so it is safe inside a practice problem. Drawn hands use the cartoon skin color
   (#ffcc4d, outline #e8a93a).

   Use:  <div class="ml-viz" data-viz="pk-pic" data-opts='{"n": 4, "obj": "apple"}'></div>

   Every kind:  kind (default "group"), label (aria-label), pick: true (each picture is a big button that chooses the
   matching answer button of the problem card, in order: picture 1 = choice 1; use with fixed-order choices),
   names: true (letters A, B, C under the pictures; on by default with pick).
   kind "group"   n, obj (see OBJ below), layout: row | line | grid | circle | scatter | dice | frame5 | frame10, cols,
                  seed (scatter), mix: [{obj, n}, …] (different things together), tap (default true: tap to count; each
                  counted thing shows its number and, unless muted, the number is said aloud), plate: true (a mat)
   kind "groups"  groups: [{n, obj, layout, mix, name}], stack: true (one above the other), op: "+" | "−" (drawn between
                  two groups), cross: k on a group (the last k are crossed out: taken away), tap (default true)
   kind "hand"    n (0 to 10 fingers held up, on one or two hands)
   kind "path"    from, to, hide: [numbers shown as "?"]
   kind "row"     items: [obj | {obj, color, shape}], hide: [indexes shown as "?"], arrows: true (steps in order)
   kind "sizes"   items: [{obj, s: 0.5 to 1.7}]   the same kind of thing at different sizes
   kind "towers"  items: [{h, color, obj: "blocks" | "flower" | "tree"}]
   kind "lengths" items: [{len, color, obj: "ribbon" | "train" | "pencil" | "snake", ofs}], units: true (blocks under
                  each item, to measure), line: true (a start line)
   kind "balance" left, right (obj), tilt: "left" | "right" (the heavier side goes down)
   kind "shapes"  items: [{s: circle | square | triangle | rectangle | oval | star | heart | diamond, color, size, rot}],
                  corners: true (a dot on every corner)
   kind "scene"   items: [{ref: "table" | "box", thing, pos: above | on | under | beside | front | behind}]
                  or between: [a, thing, b] (three things in a row)
   kind "line"    items: [obj, …] waiting in line; the door is at the left, so the first one is next to it
   kind "sky"     items: [{time: "morning" | "afternoon" | "night"}]
   kind "coins"   items: [{c: "penny" | "nickel" | "dime" | "quarter"}]

   "pk-read": a "Read to me" button for a lesson page. It reads the lesson's words aloud with the browser's own voice
   (speechSynthesis) and skips the notes for grown-ups. Shown only where the browser can speak.          */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math;

  var OBJ = {
    apple: '🍎', pear: '🍐', orange: '🍊', banana: '🍌', strawberry: '🍓', carrot: '🥕', lemon: '🍋', watermelon: '🍉',
    cookie: '🍪', cupcake: '🧁', egg: '🥚', mushroom: '🍄', acorn: '🌰', leaf: '🍁', flower: '🌼', tulip: '🌷', sunflower: '🌻',
    star: '⭐', heart: '❤️', ball: '⚽', basketball: '🏀', balloon: '🎈', kite: '🪁', car: '🚗', bus: '🚌', boat: '⛵',
    rocket: '🚀', truck: '🚚', bike: '🚲', tractor: '🚜', fish: '🐟', duck: '🦆', chick: '🐤', frog: '🐸', turtle: '🐢',
    snail: '🐌', bee: '🐝', ladybug: '🐞', butterfly: '🦋', cat: '🐱', dog: '🐶', bunny: '🐰', bear: '🧸', owl: '🦉',
    penguin: '🐧', sock: '🧦', shoe: '👟', cap: '🧢', shell: '🐚', crayon: '🖍️', book: '📘', bell: '🔔', drum: '🥁',
    present: '🎁', umbrella: '☂️', key: '🔑', spoon: '🥄', elephant: '🐘', mouse: '🐁', cow: '🐄', hen: '🐔', horse: '🐎',
    rabbit: '🐇', whale: '🐋', pumpkin: '🎃', bird: '🐦', pig: '🐷', fox: '🦊', lion: '🦁', monkey: '🐵', panda: '🐼',
    koala: '🐨', snowflake: '❄️', tree: '🌳', sprout: '🌱', seed: '🌰', chickhatch: '🐣', snowman: '⛄', ice: '🧊',
    drop: '💧', house: '🏠', brick: '🧱', bread: '🍞', sandwich: '🥪', bowl: '🥣', tshirt: '👕', bath: '🛁', bed: '🛏️',
    moon: '🌙', sun: '☀️', sunrise: '🌅', alarm: '⏰', tooth: '🦷', caterpillar: '🐛', cake: '🎂', letter: '✉️',
    mailbox: '📬', backpack: '🎒', dinner: '🍝', door: '🚪', clock: '🕒', pizza: '🍕', tent: '⛺', ruler: '📐', phone: '📱', donut: '🍩',
    target: '🎯', envelope: '✉️', dot: '' };
  var COLORS = { red: ['#ee5d6c', '#c93a4b'], blue: ['#4f93e0', '#2f6fb8'], yellow: ['#ffcf3f', '#c99700'], green: ['#38b27a', '#1f8a58'],
    orange: ['#f59f4a', '#d26d18'], purple: ['#9775e8', '#6741d9'], pink: ['#f07fae', '#c2255c'], brown: ['#b07a45', '#77502b'] };
  var SKIN = '#ffcc4d', SKINE = '#e8a93a', LET = 'ABCDEFGH';

  var CSS = [
    '.pkp{--pk-ink:#1d2320;--pk-muted:#5d6862;--pk-line:#cfd9d2;--pk-card:#fff;--pk-soft:#f6f2e6;--pk-mat:#e9f4ec;--pk-wood:#c99a62;--pk-woodE:#8e6337;--pk-floor:#d8cfb8;--pk-sel:#00562f;--pk-num:#00703c}',
    'html[data-theme="dark"] .pkp{--pk-ink:#e6ece8;--pk-muted:#a9b8af;--pk-line:#3b5a48;--pk-card:#14211a;--pk-soft:#1f3027;--pk-mat:#203a2b;--pk-wood:#b38a5a;--pk-woodE:#7d5a33;--pk-floor:#3a4a40;--pk-sel:#6cc79a;--pk-num:#2f8f5f}',
    '.pkp{color:var(--pk-ink)}',
    '.pkp .pkp-stage{background:var(--pk-card);border-radius:14px;padding:10px 6px;text-align:center;overflow:hidden;container-type:inline-size}',
    '.pkp .pkp-bar{display:flex;flex-wrap:wrap;gap:.4rem;justify-content:flex-end;margin:0 0 .35rem}',
    '.pkp .pkp-btn{font:600 .9rem system-ui,sans-serif;min-height:40px;padding:.3rem .85rem;border-radius:999px;border:1px solid var(--pk-line);background:var(--pk-card);color:var(--pk-ink);cursor:pointer}',
    '.pkp .pkp-btn:hover{border-color:#b8963e}',
    '.pkp .pkp-btn:focus-visible,.pkp .pkp-o:focus-visible,.pkp .pkp-pk:focus-visible{outline:3px solid #b8963e;outline-offset:2px}',
    '.pkp .pkp-ro{margin:.4rem 0 0;font-size:1rem;min-height:1.4em}',
    '.pkp .pkp-ro:empty{display:none}',
    '.pkp .pkp-ctl{display:flex;flex-wrap:wrap;gap:.5rem;margin:.45rem 0 0;justify-content:center}',
    '.pkp .pkp-ctl:empty{display:none}',
    '.pkp .pkp-things{display:grid;gap:4px;justify-content:center;margin:0 auto}',
    '.pkp .pkp-o{position:relative;display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;padding:0;border:0;border-radius:12px;background:none;font-size:34px;line-height:1;color:inherit;font-family:"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif}',
    'button.pkp-o{cursor:pointer}',
    'button.pkp-o:hover{background:var(--pk-soft)}',
    '.pkp .pkp-o.done{background:var(--pk-mat)}',
    '.pkp .pkp-o .pkp-n{position:absolute;right:0;top:0;min-width:20px;height:20px;border-radius:10px;background:var(--pk-num);color:#fff;font:800 12px/20px system-ui,sans-serif}',
    '.pkp .pkp-o .pkp-x{position:absolute;inset:6px;pointer-events:none}',
    '.pkp .pkp-o.crossed .pkp-e{opacity:.4}',
    '.pkp .pkp-dot{display:block;width:30px;height:30px;border-radius:50%;background:var(--pkd,#ee5d6c);box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}',
    '.pkp .pkp-scatter{position:relative;margin:0 auto;max-width:100%}',
    '.pkp .pkp-scatter .pkp-o{position:absolute;transform:translate(-50%,-50%)}',
    '.pkp .pkp-plate{background:var(--pk-mat);border-radius:22px;padding:10px;display:inline-block;min-width:150px;min-height:70px}',
    '.pkp .pkp-frame{display:inline-grid;grid-template-columns:repeat(5,48px);border:3px solid var(--pk-muted);border-radius:6px;background:var(--pk-card)}',
    '.pkp .pkp-frame>span{width:48px;height:48px;display:flex;align-items:center;justify-content:center;border:1px solid var(--pk-line)}',
    '.pkp .pkp-dice{display:inline-grid;grid-template-columns:repeat(3,40px);grid-auto-rows:40px;padding:10px;border:3px solid var(--pk-muted);border-radius:16px;background:var(--pk-card)}',
    '.pkp .pkp-dice>span{display:flex;align-items:center;justify-content:center}',
    '.pkp .pkp-gs{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center}',
    '.pkp .pkp-gs.stack{flex-direction:column;align-items:stretch}',
    '.pkp .pkp-gs.stack .pkp-g{text-align:left}',
    '.pkp .pkp-gs.stack .pkp-things{justify-content:start}',
    '.pkp .pkp-g{border:2px solid var(--pk-line);border-radius:16px;padding:6px 8px;background:var(--pk-soft);min-width:90px}',
    '.pkp .pkp-op{font:800 2rem system-ui,sans-serif;color:var(--pk-muted)}',
    '.pkp .pkp-lab{display:block;font:800 1rem system-ui,sans-serif;color:var(--pk-muted);margin-top:2px}',
    '.pkp .pkp-path{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}',
    '.pkp .pkp-path>span{width:46px;height:46px;display:flex;align-items:center;justify-content:center;border:2px solid var(--pk-line);border-radius:10px;background:var(--pk-soft);font:800 1.5rem system-ui,sans-serif}',
    '.pkp .pkp-path>span.q,.pkp .pkp-row .q{border:3px dashed #b8963e;color:#b8963e;background:var(--pk-card)}',
    '.pkp .pkp-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center}',
    '.pkp .pkp-row.fit{flex-wrap:nowrap;gap:4px}',
    '.pkp .pkp-row.fit>span{width:min(56px,calc((100cqw - var(--n) * 4px) / var(--n)));height:auto;aspect-ratio:1;font-size:min(34px,calc((100cqw - var(--n) * 4px) / var(--n) * .6))}',
    '.pkp .pkp-row>span{width:56px;height:56px;display:flex;align-items:center;justify-content:center;border:2px solid var(--pk-line);border-radius:12px;background:var(--pk-soft);font-size:34px;font-family:"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif}',
    '.pkp .pkp-row>span.q{font:800 1.8rem system-ui,sans-serif}',
    '.pkp .pkp-row>i{font-style:normal;color:var(--pk-muted);font:800 1.3rem system-ui,sans-serif}',
    '.pkp .pkp-picks{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:flex-end}',
    '.pkp .pkp-pk{display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-end;border:2px solid transparent;border-radius:16px;padding:4px 6px;background:none;color:inherit;font:inherit}',
    'button.pkp-pk{cursor:pointer;border-color:var(--pk-line)}',
    'button.pkp-pk:hover{background:var(--pk-soft)}',
    '.pkp .pkp-pk.on{border-color:var(--pk-sel);background:var(--pk-mat)}',
    '.pkp .pkp-picks{gap:8px}',
    '.pkp .pkp-picks button.pkp-pk svg{max-width:calc((100cqw - var(--n,1) * 22px) / var(--n,1))}',
    '.pkp .pkp-big{line-height:1;font-family:"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif}',
    '.pkp svg{display:block;max-width:100%;height:auto;margin:0 auto;overflow:visible}',
    '.pkp .pkp-emo{font-family:"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif}',
    '.mlp-card:has(.pkp) .ml-choice{min-height:56px;font-size:1.35rem}',
    '.mlp-card:has(.pkp) .ml-choices{gap:.6rem}',
    '.pkr{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:.2rem 0 .6rem}',
    '.pkr .pkp-btn{font:600 1rem system-ui,sans-serif;min-height:44px;padding:.35rem 1rem;border-radius:999px;border:1px solid #b8963e;background:transparent;color:inherit;cursor:pointer}',
    '.pkr .pkp-btn:focus-visible{outline:3px solid #b8963e;outline-offset:2px}',
    '.pkr small{opacity:.8}'
  ].join('');
  function injectCss() { if (D.getElementById('pkp-css')) return; var s = D.createElement('style'); s.id = 'pkp-css'; s.textContent = CSS; (D.head || D.documentElement).appendChild(s); }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function int(v, d) { v = parseInt(v, 10); return isFinite(v) ? v : d; }
  function seeded(seed) { var s = ((seed | 0) * 2654435761 >>> 0) || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function col(name) { return COLORS[name] || COLORS.red; }
  function emo(k) { return OBJ[k] !== undefined ? OBJ[k] : /^[^\x00-\x7f]+$/.test(String(k)) ? String(k) : '❓'; } // a key, or an emoji given as is
  function r1(v) { return M.round(v * 10) / 10; }

  /* ---------------- voice (the browser's own speech; numbers and words only) ---------------- */
  var VKEY = 'trb-pk-voice';
  function canSpeak() { return !!(W.speechSynthesis && W.SpeechSynthesisUtterance); }
  function muted() { try { return W.localStorage.getItem(VKEY) === 'off'; } catch (e) { return false; } }
  function setMuted(m) { try { W.localStorage.setItem(VKEY, m ? 'off' : 'on'); } catch (e) { } }
  function plainSay(t) {
    return String(t || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, ' ')
      .replace(/\s+/g, ' ').replace(/\?\s*$/, '?').trim();
  }
  function speak(t, force) {
    if (!canSpeak() || (!force && muted())) return;
    try { W.speechSynthesis.cancel(); var u = new W.SpeechSynthesisUtterance(plainSay(t)); u.rate = 0.9; u.lang = 'en-US'; W.speechSynthesis.speak(u); } catch (e) { }
  }
  function voiceBar(el, getText) {
    if (!canSpeak()) return null;
    var bar = D.createElement('div'); bar.className = 'pkp-bar';
    var rd = D.createElement('button'); rd.type = 'button'; rd.className = 'pkp-btn'; rd.innerHTML = '<span aria-hidden="true">🔊</span> Read to me';
    rd.addEventListener('click', function () { speak(getText(), true); });
    var mt = D.createElement('button'); mt.type = 'button'; mt.className = 'pkp-btn pkp-mute';
    function paint() { var m = muted(); mt.setAttribute('aria-pressed', m ? 'true' : 'false'); mt.innerHTML = m ? '<span aria-hidden="true">🔇</span> Counting voice off' : '<span aria-hidden="true">🔈</span> Counting voice on'; }
    mt.addEventListener('click', function () { setMuted(!muted()); paint(); if (muted() && canSpeak()) try { W.speechSynthesis.cancel(); } catch (e) { } });
    paint(); bar.appendChild(rd); bar.appendChild(mt); el.appendChild(bar); return bar;
  }

  /* ---------------- things to count ---------------- */
  function thing(k, color) {
    if (k === 'dot') return '<span class="pkp-dot" style="--pkd:' + col(color || 'red')[0] + '"></span>';
    return emo(k);
  }
  var DICE = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8], 7: [0, 2, 3, 4, 5, 6, 8], 8: [0, 1, 2, 3, 5, 6, 7, 8], 9: [0, 1, 2, 3, 4, 5, 6, 7, 8] };
  function list(o) { // the things of one group, in order: [{k, color}]
    var out = [];
    if (o.mix) o.mix.forEach(function (m) { for (var i = 0; i < int(m.n, 0); i++) out.push({ k: m.obj, color: m.color }); });
    else for (var i = 0; i < int(o.n, 0); i++) out.push({ k: o.obj || 'apple', color: o.color });
    if (o.mix && o.shuffle !== false) { var rnd = seeded(int(o.seed, 7) + 3); for (var j = out.length - 1; j > 0; j--) { var r = M.floor(rnd() * (j + 1)), t = out[j]; out[j] = out[r]; out[r] = t; } }
    return out;
  }
  function groupHtml(o, tap, base) {
    var items = list(o), n = items.length, lay = o.layout || (n > 5 ? 'grid' : 'row'), cross = int(o.cross, 0);
    function one(it, i, style) {
      var tag = tap ? 'button' : 'span', cr = i >= n - cross;
      return '<' + tag + (tap ? ' type="button"' : '') + ' class="pkp-o' + (cr ? ' crossed' : '') + '" data-i="' + (base + i) + '"' + (style ? ' style="' + style + '"' : '') +
        (tap ? ' aria-label="' + esc(it.k === 'dot' ? 'counter' : it.k) + ', not counted yet"' : ' aria-hidden="true"') + '><span class="pkp-e">' + thing(it.k, it.color) + '</span>' +
        (cr ? '<svg class="pkp-x" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1L9 9M9 1L1 9" style="stroke:#c93a4b;stroke-width:1.4;stroke-linecap:round"/></svg>' : '') + '</' + tag + '>';
    }
    var h = '';
    if (lay === 'frame5' || lay === 'frame10') {
      var cells = lay === 'frame5' ? 5 : 10; h = '<div class="pkp-frame" style="grid-template-columns:repeat(5,48px)">';
      for (var c = 0; c < cells; c++) h += '<span>' + (c < n ? one(items[c], c, 'width:44px;height:44px;font-size:28px') : '') + '</span>';
      return h + '</div>';
    }
    if (lay === 'dice') {
      var pos = DICE[n] || []; h = '<div class="pkp-dice">';
      for (var d = 0; d < 9; d++) { var at = pos.indexOf(d); h += '<span>' + (at >= 0 ? one(items[at], at, 'width:38px;height:38px;font-size:26px') : '') + '</span>'; }
      return h + '</div>';
    }
    if (lay === 'scatter' || lay === 'circle') {
      var Wd = n > 6 ? 300 : 240, Hd = n > 6 ? 200 : 160, pts = [], rnd = seeded(int(o.seed, 1));
      if (lay === 'circle') for (var k = 0; k < n; k++) { var a = -M.PI / 2 + k * 2 * M.PI / M.max(1, n); pts.push([Wd / 2 + (Hd / 2 - 30) * M.cos(a), Hd / 2 + (Hd / 2 - 30) * M.sin(a)]); }
      else {
        var cols = n > 6 ? 5 : 4, rows = M.ceil((n + 3) / cols), cl = []; for (var q = 0; q < cols * rows; q++) cl.push(q);
        for (var z = cl.length - 1; z > 0; z--) { var y = M.floor(rnd() * (z + 1)), tt = cl[z]; cl[z] = cl[y]; cl[y] = tt; }
        var cw = (Wd - 40) / cols, ch = (Hd - 40) / rows; Hd = M.max(Hd, rows * 56 + 30); ch = (Hd - 40) / rows;
        for (var p = 0; p < n; p++) { var cc = cl[p] % cols, rr = M.floor(cl[p] / cols); pts.push([20 + cw * (cc + .5) + (rnd() - .5) * (cw - 52) * .8, 20 + ch * (rr + .5) + (rnd() - .5) * (ch - 52) * .8]); }
      }
      h = '<div class="pkp-scatter" style="width:' + Wd + 'px;height:' + Hd + 'px">';
      items.forEach(function (it, i) { h += one(it, i, 'left:' + r1(100 * pts[i][0] / Wd) + '%;top:' + r1(100 * pts[i][1] / Hd) + '%'); });
      return h + '</div>';
    }
    var cols2 = lay === 'line' ? n : int(o.cols, 5);
    if (lay === 'row' && n <= 5) cols2 = n;
    h = '<div class="pkp-things" style="grid-template-columns:repeat(' + M.max(1, M.min(cols2, n)) + ',52px)">';
    items.forEach(function (it, i) { h += one(it, i); });
    return h + '</div>';
  }

  /* ---------------- drawings ---------------- */
  function svg(w, h, body, label) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + esc(label || 'A picture') + '" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>'; }
  function etext(x, y, k, size) { return '<text class="pkp-emo" x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="middle" style="font-size:' + size + 'px">' + emo(k) + '</text>'; }
  function shapePath(s, cx, cy, r, rot) {
    var pts = null, k;
    function reg(n, start, rx, ry) { var p = []; for (var i = 0; i < n; i++) { var a = start + i * 2 * M.PI / n; p.push([cx + rx * M.cos(a), cy + ry * M.sin(a)]); } return p; }
    switch (s) {
      case 'circle': return { el: '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"', pts: [] };
      case 'oval': return { el: '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + r1(r * .62) + '"', pts: [] };
      case 'square': pts = [[cx - r * .85, cy - r * .85], [cx + r * .85, cy - r * .85], [cx + r * .85, cy + r * .85], [cx - r * .85, cy + r * .85]]; break;
      case 'rectangle': pts = [[cx - r * 1.15, cy - r * .62], [cx + r * 1.15, cy - r * .62], [cx + r * 1.15, cy + r * .62], [cx - r * 1.15, cy + r * .62]]; break;
      case 'triangle': pts = reg(3, -M.PI / 2, r, r).map(function (p) { return [p[0], p[1] + r * .15]; }); break;
      case 'diamond': pts = [[cx, cy - r], [cx + r * .7, cy], [cx, cy + r], [cx - r * .7, cy]]; break;
      case 'star': pts = []; for (k = 0; k < 10; k++) { var a = -M.PI / 2 + k * M.PI / 5, rr = k % 2 ? r * .45 : r; pts.push([cx + rr * M.cos(a), cy + rr * M.sin(a)]); } break;
      case 'heart': return { el: '<path d="M' + cx + ' ' + r1(cy + r * .85) + ' C ' + r1(cx - r * 1.3) + ' ' + r1(cy - r * .1) + ' ' + r1(cx - r * .7) + ' ' + r1(cy - r * 1.05) + ' ' + cx + ' ' + r1(cy - r * .4) + ' C ' + r1(cx + r * .7) + ' ' + r1(cy - r * 1.05) + ' ' + r1(cx + r * 1.3) + ' ' + r1(cy - r * .1) + ' ' + cx + ' ' + r1(cy + r * .85) + ' Z"', pts: [] };
      default: return shapePath('circle', cx, cy, r, 0);
    }
    if (rot) { var t = rot * M.PI / 180; pts = pts.map(function (p) { var dx = p[0] - cx, dy = p[1] - cy; return [cx + dx * M.cos(t) - dy * M.sin(t), cy + dx * M.sin(t) + dy * M.cos(t)]; }); }
    return { el: '<polygon points="' + pts.map(function (p) { return r1(p[0]) + ',' + r1(p[1]); }).join(' ') + '"', pts: s === 'star' ? [] : pts };
  }
  function shapeSvg(it, o) {
    var sz = +it.size || 1, r = 34 * sz, Wd = 100 * M.max(1, sz) + (it.s === 'rectangle' ? 40 * sz : 0), Hd = 90 * M.max(1, sz), c = col(it.color || 'blue');
    var sp = shapePath(it.s, Wd / 2, Hd / 2, r, +it.rot || 0);
    var b = sp.el + ' style="fill:' + c[0] + ';stroke:' + c[1] + ';stroke-width:3;stroke-linejoin:round"/>';
    if (o.corners) sp.pts.forEach(function (p) { b += '<circle cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="5" style="fill:#b8963e;stroke:#fff;stroke-width:1.5"/>'; });
    return svg(Wd, Hd, b, 'A ' + (it.color || '') + ' shape');
  }
  function towerSvg(it) {
    var h = int(it.h, 3), c = col(it.color || 'blue'), u = 24, Hd = 9 * u + 14, b = '', x0 = 14;
    if (it.obj === 'flower') {
      var top = Hd - 8 - h * u;
      b = '<path d="M30 ' + (Hd - 8) + ' V ' + (top + 14) + '" style="stroke:#38b27a;stroke-width:5;stroke-linecap:round"/><ellipse cx="38" cy="' + r1((Hd - 8 + top) / 2 + 10) + '" rx="9" ry="4" style="fill:#38b27a"/>' + etext(30, top + 20, 'flower', 30);
    } else if (it.obj === 'tree') {
      var tt = Hd - 8 - h * u;
      b = '<rect x="24" y="' + r1(tt + 18) + '" width="12" height="' + r1(Hd - 8 - tt - 18) + '" style="fill:var(--pk-wood);stroke:var(--pk-woodE);stroke-width:1.5"/><ellipse cx="30" cy="' + r1(tt + 18) + '" rx="22" ry="20" style="fill:#38b27a;stroke:#1f8a58;stroke-width:2"/>';
    } else for (var i = 0; i < h; i++) b += '<rect x="' + x0 + '" y="' + (Hd - 8 - (i + 1) * u) + '" width="' + (u + 8) + '" height="' + (u - 1) + '" rx="3" style="fill:' + c[0] + ';stroke:' + c[1] + ';stroke-width:2"/>';
    b += '<path d="M2 ' + (Hd - 7) + ' H58" style="stroke:var(--pk-muted);stroke-width:3;stroke-linecap:round"/>';
    return svg(60, Hd, b, it.obj === 'flower' ? 'A flower' : it.obj === 'tree' ? 'A tree' : 'A tower of blocks');
  }
  function lengthsSvg(o, pickable) {
    var items = o.items || [], u = 26, ROW = o.units ? 74 : 54, x0 = 40, maxL = 0;
    items.forEach(function (it) { maxL = M.max(maxL, int(it.len, 3) + (+it.ofs || 0)); });
    var Wd = x0 + maxL * u + 30, Hd = items.length * ROW + 10, b = '';
    if (o.line !== false) b += '<path d="M' + (x0 - 2) + ' 4 V' + (Hd - 4) + '" style="stroke:#b8963e;stroke-width:3;stroke-dasharray:6 4"/>';
    items.forEach(function (it, i) {
      var L = int(it.len, 3), y = 10 + i * ROW, x = x0 + (+it.ofs || 0) * u, w = L * u, c = col(it.color || 'red'), inner = '';
      if (it.obj === 'train') for (var k = 0; k < L; k++) inner += '<rect x="' + (x + k * u) + '" y="' + y + '" width="' + (u - 1) + '" height="' + (u - 1) + '" rx="3" style="fill:' + c[0] + ';stroke:' + c[1] + ';stroke-width:2"/>';
      else if (it.obj === 'pencil') inner = '<rect x="' + x + '" y="' + (y + 4) + '" width="' + (w - 20) + '" height="18" style="fill:' + c[0] + ';stroke:' + c[1] + ';stroke-width:2"/><polygon points="' + (x + w - 20) + ',' + (y + 4) + ' ' + (x + w) + ',' + (y + 13) + ' ' + (x + w - 20) + ',' + (y + 22) + '" style="fill:#e8bf85;stroke:' + c[1] + ';stroke-width:2"/><polygon points="' + (x + w - 7) + ',' + (y + 9.5) + ' ' + (x + w) + ',' + (y + 13) + ' ' + (x + w - 7) + ',' + (y + 16.5) + '" style="fill:#333"/>';
      else if (it.obj === 'snake') inner = '<rect x="' + x + '" y="' + (y + 5) + '" width="' + w + '" height="16" rx="8" style="fill:' + c[0] + ';stroke:' + c[1] + ';stroke-width:2"/><circle cx="' + (x + w - 8) + '" cy="' + (y + 11) + '" r="2.4" style="fill:#222"/>';
      else inner = '<rect x="' + x + '" y="' + (y + 5) + '" width="' + w + '" height="16" rx="4" style="fill:' + c[0] + ';stroke:' + c[1] + ';stroke-width:2"/>';
      if (o.units) for (var q = 0; q < L; q++) inner += '<rect x="' + (x + q * u + 1) + '" y="' + (y + 32) + '" width="' + (u - 3) + '" height="' + (u - 3) + '" rx="3" style="fill:#ffcf3f;stroke:#c99700;stroke-width:2"/>';
      var lab = pickable || o.names ? '<text x="' + (x0 - 16) + '" y="' + (y + 18) + '" text-anchor="middle" style="font:800 16px system-ui,sans-serif;fill:var(--pk-muted)">' + LET[i] + '</text>' : '';
      b += pickable ? '<g class="pkp-pk" data-pick="' + i + '" role="button" tabindex="0" aria-label="Picture ' + LET[i] + '" style="cursor:pointer"><rect x="2" y="' + (y - 4) + '" width="' + (Wd - 4) + '" height="' + (ROW - 6) + '" rx="10" style="fill:transparent;stroke:var(--pk-line);stroke-width:1.5"/>' + inner + lab + '</g>' : inner + lab;
    });
    return svg(Wd, Hd, b, 'Things lined up at a start line');
  }
  function balanceSvg(o) {
    var t = o.tilt === 'left' ? -1 : o.tilt === 'right' ? 1 : 0, cx = 150, py = 70, dy = 18 * t, b = '';
    b += '<polygon points="' + cx + ',' + py + ' ' + (cx - 26) + ',176 ' + (cx + 26) + ',176" style="fill:var(--pk-wood);stroke:var(--pk-woodE);stroke-width:2"/>';
    b += '<path d="M' + (cx - 110) + ' ' + (py - dy) + ' L' + (cx + 110) + ' ' + (py + dy) + '" style="stroke:var(--pk-woodE);stroke-width:6;stroke-linecap:round"/>';
    [[-1, o.left], [1, o.right]].forEach(function (s) {
      var x = cx + s[0] * 100, y = py + s[0] * dy;
      b += '<path d="M' + x + ' ' + y + ' L' + (x - 34) + ' ' + (y + 52) + ' M' + x + ' ' + y + ' L' + (x + 34) + ' ' + (y + 52) + '" style="stroke:var(--pk-muted);stroke-width:2"/>';
      b += '<path d="M' + (x - 44) + ' ' + (y + 52) + ' Q ' + x + ' ' + (y + 74) + ' ' + (x + 44) + ' ' + (y + 52) + ' Z" style="fill:var(--pk-soft);stroke:var(--pk-muted);stroke-width:2"/>';
      b += etext(x, y + 50, s[1], 40);
    });
    b += '<circle cx="' + cx + '" cy="' + py + '" r="6" style="fill:#b8963e"/>';
    return svg(300, 180, b, 'A pan balance with a thing on each side');
  }
  function sceneSvg(it) {
    var b = '<path d="M4 182 H256" style="stroke:var(--pk-floor);stroke-width:4;stroke-linecap:round"/>', th = it.thing || 'ball', pos = it.pos;
    if (it.ref === 'table') {
      var tab = '<rect x="60" y="100" width="140" height="12" rx="3" style="fill:var(--pk-wood);stroke:var(--pk-woodE);stroke-width:2"/><rect x="70" y="112" width="10" height="68" style="fill:var(--pk-wood);stroke:var(--pk-woodE);stroke-width:2"/><rect x="180" y="112" width="10" height="68" style="fill:var(--pk-wood);stroke:var(--pk-woodE);stroke-width:2"/>';
      var ty = { above: 46, on: 97, under: 176, beside: 176 }[pos] || 97, tx = pos === 'beside' ? 232 : 130;
      b += tab + etext(tx, ty, th, 40);
    } else {
      var box = '<rect x="80" y="100" width="100" height="80" rx="3" style="fill:var(--pk-wood);stroke:var(--pk-woodE);stroke-width:2.5"/><rect x="74" y="90" width="112" height="14" rx="3" style="fill:var(--pk-wood);stroke:var(--pk-woodE);stroke-width:2.5"/><path d="M130 90 V180" style="stroke:var(--pk-woodE);stroke-width:2;opacity:.5"/>';
      if (pos === 'behind') b += etext(166, 112, th, 46) + box;
      else if (pos === 'front') b += box + etext(130, 200, th, 56);
      else if (pos === 'beside') b += box + etext(225, 178, th, 46);
      else b += box + etext(130, 60, th, 44);
    }
    return svg(260, 206, b, 'A picture of where something is').replace('width="260" height="206"', 'width="180" height="143"');
  }
  function skySvg(it) {
    var t = it.time, b = '';
    if (t === 'night') {
      b += '<rect width="170" height="120" rx="12" style="fill:#1c2541"/><circle cx="125" cy="30" r="15" style="fill:#ffe066"/><circle cx="133" cy="25" r="13" style="fill:#1c2541"/>';
      [[30, 22], [60, 40], [90, 16], [150, 60], [40, 62]].forEach(function (p) { b += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.2" style="fill:#fff"/>'; });
    } else if (t === 'morning') {
      b += '<defs><linearGradient id="pkm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#ffd8a8"/></linearGradient></defs><rect width="170" height="120" rx="12" style="fill:url(#pkm)"/><circle cx="34" cy="92" r="17" style="fill:#ffb52e"/>';
    } else {
      b += '<rect width="170" height="120" rx="12" style="fill:#8fd0ff"/><circle cx="92" cy="24" r="16" style="fill:#ffcf3f"/>';
      for (var k = 0; k < 8; k++) { var a = k * M.PI / 4; b += '<path d="M' + r1(92 + 21 * M.cos(a)) + ' ' + r1(24 + 21 * M.sin(a)) + ' L' + r1(92 + 27 * M.cos(a)) + ' ' + r1(24 + 27 * M.sin(a)) + '" style="stroke:#ffcf3f;stroke-width:3;stroke-linecap:round"/>'; }
    }
    b += '<path d="M0 92 H170 V108 Q170 120 158 120 H12 Q0 120 0 108 Z" style="fill:' + (t === 'night' ? '#2b4a3a' : '#5cb85c') + '"/>';
    var nt = t === 'night', land = it.land || 'house';
    if (land === 'house') b += '<rect x="112" y="72" width="34" height="26" style="fill:' + (nt ? '#6b5b4a' : '#e8bf85') + '"/><polygon points="108,73 129,56 150,73" style="fill:' + (nt ? '#7a3b3b' : '#d9503f') + '"/><rect x="124" y="80" width="10" height="10" style="fill:' + (nt ? '#ffe066' : '#bfe3ff') + '"/>';
    else if (land === 'tree') b += '<rect x="58" y="70" width="8" height="26" style="fill:' + (nt ? '#4a3a2a' : '#8e6337') + '"/><circle cx="62" cy="62" r="17" style="fill:' + (nt ? '#24412f' : '#2f9e5b') + '"/>';
    else if (land === 'tent') b += '<polygon points="96,96 120,64 144,96" style="fill:' + (nt ? '#5a4a7a' : '#f59f4a') + '"/><polygon points="114,96 120,80 126,96" style="fill:' + (nt ? '#2a2440' : '#8e4d16') + '"/>';
    else b += '<path d="M0 96 Q 60 66 120 96 Z" style="fill:' + (nt ? '#21402f' : '#3f9a3c') + '"/>';
    return svg(170, 120, b, 'The sky at one time of day');
  }
  var COIN = { penny: [19.05, '#c87533', '#8a4b1c', false], nickel: [21.21, '#c0c4c8', '#7d8489', false], dime: [17.91, '#d3d7db', '#7d8489', true], quarter: [24.26, '#cfd3d6', '#7d8489', true] };
  function coinSvg(it) {
    var c = COIN[it.c] || COIN.penny, r = c[0] * 1.55, s = M.ceil(2 * r + 8), cx = s / 2, b = '';
    b += '<circle cx="' + cx + '" cy="' + cx + '" r="' + r1(r) + '" style="fill:' + c[1] + ';stroke:' + c[2] + ';stroke-width:' + (c[3] ? 3 : 2) + (c[3] ? ';stroke-dasharray:1.5 1.5' : '') + '"/>';
    b += '<circle cx="' + cx + '" cy="' + cx + '" r="' + r1(r * .78) + '" style="fill:none;stroke:' + c[2] + ';stroke-width:1.2;opacity:.7"/>';
    b += '<ellipse cx="' + r1(cx - r * .3) + '" cy="' + r1(cx - r * .35) + '" rx="' + r1(r * .25) + '" ry="' + r1(r * .14) + '" style="fill:#fff;opacity:.35"/>';
    return svg(s, s, b, 'A coin');
  }
  function handSvg(n) {
    n = M.max(0, M.min(10, int(n, 0)));
    function hand(up, x0, flip) {
      var b = '<g transform="translate(' + x0 + ' 0)' + (flip ? ' translate(110 0) scale(-1 1)' : '') + '">';
      var fx = [26, 44, 62, 80];
      // fingers: index, middle, ring, little (left to right); the thumb on the right
      var order = [0, 1, 2, 3]; // fingers go up index first, then middle, ring, little; the thumb is the 5th
      var len = [62, 68, 62, 50];
      for (var i = 0; i < 4; i++) {
        var isUp = up > order[i], h = isUp ? len[i] : 18, y = 92 - h;
        b += '<rect x="' + (fx[i] - 8) + '" y="' + y + '" width="16" height="' + (h + 14) + '" rx="8" style="fill:' + SKIN + ';stroke:' + SKINE + ';stroke-width:2"/>';
      }
      var th = up >= 5;
      b += th ? '<rect x="88" y="66" width="16" height="50" rx="8" transform="rotate(38 96 110)" style="fill:' + SKIN + ';stroke:' + SKINE + ';stroke-width:2"/>' : '<rect x="74" y="96" width="16" height="34" rx="8" transform="rotate(70 82 112)" style="fill:' + SKIN + ';stroke:' + SKINE + ';stroke-width:2"/>';
      b += '<rect x="14" y="86" width="80" height="64" rx="22" style="fill:' + SKIN + ';stroke:' + SKINE + ';stroke-width:2"/>';
      if (!th) b += '<rect x="66" y="98" width="30" height="14" rx="7" style="fill:' + SKIN + ';stroke:' + SKINE + ';stroke-width:2"/>';
      return b + '</g>';
    }
    var two = n > 5, Wd = two ? 250 : 120;
    var body = two ? hand(5, 0, false) + hand(n - 5, 130, true) : hand(n, 5, false);
    return svg(Wd, 158, body, two ? 'Two hands holding up fingers' : 'A hand holding up fingers');
  }

  /* ---------------- the visual ---------------- */
  function factory(el, o) {
    injectCss();
    o = o || {};
    var kind = o.kind || 'group';
    el.classList.add('pkp', 'pkp-' + kind, 'ml-notex');
    el.setAttribute('role', 'group');
    el.innerHTML = '';
    var card = el.closest ? el.closest('.mlp-card') : null;
    var vbar = voiceBar(el, function () {
      var q = card && card.querySelector('.mlp-q');
      if (q) return q.textContent;
      var fig = el.closest && el.closest('figure'), fc = fig && fig.querySelector('figcaption');
      return fc ? fc.textContent : '';
    });
    var stage = D.createElement('div'); stage.className = 'pkp-stage'; el.appendChild(stage);
    var ro = D.createElement('p'); ro.className = 'pkp-ro'; ro.setAttribute('aria-live', 'polite'); el.appendChild(ro);
    var ctl = D.createElement('div'); ctl.className = 'pkp-ctl'; el.appendChild(ctl);
    var pick = !!o.pick, names = o.names !== undefined ? !!o.names : pick, h = '', canTap = false;

    function pickWrap(inner, i, extra) {
      var lab = names ? '<span class="pkp-lab" aria-hidden="true">' + LET[i] + '</span>' : '';
      if (!pick) return '<span class="pkp-pk"' + (extra || '') + '>' + inner + lab + '</span>';
      return '<button type="button" class="pkp-pk" data-pick="' + i + '" aria-label="Picture ' + LET[i] + '"' + (extra || '') + '>' + inner + lab + '</button>';
    }
    var items = o.items || [];
    switch (kind) {
      case 'groups':
        canTap = o.tap !== false && !pick;
        var base = 0;
        h = '<div class="pkp-gs' + (o.stack ? ' stack' : '') + '">';
        (o.groups || []).forEach(function (g, i) {
          if (i && o.op) h += '<span class="pkp-op" aria-hidden="true">' + esc(o.op) + '</span>';
          var inner = groupHtml(g, canTap, base); base += list(g).length;
          if (g.plate) inner = '<div class="pkp-plate">' + inner + '</div>';
          h += pick ? pickWrap('<span class="pkp-g">' + inner + '</span>', i) : '<div class="pkp-g">' + inner + (g.name ? '<span class="pkp-lab">' + esc(g.name) + '</span>' : '') + '</div>';
        });
        h += '</div>';
        break;
      case 'hand': h = handSvg(o.n); break;
      case 'path':
        h = '<div class="pkp-path">';
        for (var v = int(o.from, 1); v <= int(o.to, 5); v++) h += (o.hide || []).indexOf(v) >= 0 ? '<span class="q" aria-label="a hidden number">?</span>' : '<span>' + v + '</span>';
        h += '</div>'; break;
      case 'row':
        h = '<div class="pkp-row' + (o.arrows ? '' : ' fit') + '" style="--n:' + items.length + '">';
        items.forEach(function (it, i) {
          if (i && o.arrows) h += '<i aria-hidden="true">→</i>';
          if ((o.hide || []).indexOf(i) >= 0) { h += '<span class="q" aria-label="a hidden picture">?</span>'; return; }
          var k = typeof it === 'string' ? it : it.obj;
          if (typeof it === 'object' && it.shape) h += '<span>' + svg(44, 44, shapePath(it.shape, 22, 22, 17, 0).el + ' style="fill:' + col(it.color)[0] + ';stroke:' + col(it.color)[1] + ';stroke-width:2.5;stroke-linejoin:round"/>', it.color + ' ' + it.shape) + '</span>';
          else h += '<span>' + thing(k, it.color) + '</span>';
        });
        h += '</div>'; break;
      case 'sizes':
        h = '<div class="pkp-picks" style="--n:' + items.length + '">';
        items.forEach(function (it, i) { var px = M.round(56 * (+it.s || 1)); h += pickWrap('<span class="pkp-big" style="font-size:' + px + 'px">' + emo(it.obj) + '</span>', i); });
        h += '</div>'; break;
      case 'towers':
        h = '<div class="pkp-picks" style="--n:' + items.length + '">'; items.forEach(function (it, i) { h += pickWrap(towerSvg(it), i); }); h += '</div>'; break;
      case 'shapes':
        h = '<div class="pkp-picks" style="--n:' + items.length + ';align-items:center">'; items.forEach(function (it, i) { h += pickWrap(it.s === 'thing' ? '<span class="pkp-big" style="font-size:64px">' + emo(it.obj) + '</span>' : shapeSvg(it, o), i); }); h += '</div>'; break;
      case 'lengths': h = lengthsSvg(o, pick); break;
      case 'balance': h = balanceSvg(o); break;
      case 'scene':
        if (o.between) { h = '<div class="pkp-row" style="gap:14px">' + o.between.map(function (k) { return '<span style="width:70px;height:70px;font-size:46px">' + emo(k) + '</span>'; }).join('') + '</div>'; break; }
        h = '<div class="pkp-picks" style="--n:' + items.length + '">'; items.forEach(function (it, i) { h += pickWrap(sceneSvg(it), i); }); h += '</div>'; break;
      case 'line':
        h = '<div class="pkp-row" style="gap:4px"><span style="width:62px;height:80px;font-size:54px;border-color:#b8963e" aria-label="the door">' + emo('door') + '</span>';
        items.forEach(function (k, i) { h += '<span data-pos="' + i + '" style="font-size:40px">' + emo(k) + '</span>'; });
        h += '</div>'; break;
      case 'sky': h = '<div class="pkp-picks" style="--n:' + items.length + '">'; items.forEach(function (it, i) { h += pickWrap(skySvg(it), i); }); h += '</div>'; break;
      case 'coins': h = '<div class="pkp-picks" style="--n:' + items.length + ';align-items:center">'; items.forEach(function (it, i) { h += pickWrap(coinSvg(it), i); }); h += '</div>'; break;
      default:
        canTap = o.tap !== false;
        h = o.plate ? '<div class="pkp-plate">' + groupHtml(o, canTap, 0) + '</div>' : groupHtml(o, canTap, 0);
    }
    stage.innerHTML = h;
    if (o.label) stage.setAttribute('aria-label', o.label);

    // tap to count
    var order = 0, nodes = [].slice.call(stage.querySelectorAll('button.pkp-o'));
    function sayCount() { ro.innerHTML = order ? 'You counted <b>' + order + '</b>' + (order === nodes.length ? '. That is all of them.' : ' so far.') : 'Tap each one as you count it.'; }
    if (vbar && !(canTap && nodes.length)) { var mb = vbar.querySelector('.pkp-mute'); if (mb) mb.remove(); }
    if (canTap && nodes.length) {
      nodes.forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.classList.contains('done')) return;
          order++; b.classList.add('done'); b.insertAdjacentHTML('beforeend', '<span class="pkp-n" aria-hidden="true">' + order + '</span>');
          b.setAttribute('aria-label', b.getAttribute('aria-label').replace(/, not counted yet$/, ', counted: number ' + order));
          speak(String(order)); sayCount(); again.hidden = false;
        });
      });
      var again = D.createElement('button'); again.type = 'button'; again.className = 'pkp-btn'; again.textContent = 'Start over'; again.hidden = true;
      again.addEventListener('click', function () { order = 0; nodes.forEach(function (b) { b.classList.remove('done'); var nn = b.querySelector('.pkp-n'); if (nn) nn.remove(); b.setAttribute('aria-label', b.getAttribute('aria-label').replace(/, counted: number \d+$/, ', not counted yet')); }); sayCount(); again.hidden = true; });
      ctl.appendChild(again); sayCount();
    }
    // a picture as the answer: choose the matching answer button
    if (pick) {
      var pks = [].slice.call(stage.querySelectorAll('[data-pick]'));
      var mark = function (i) { pks.forEach(function (p) { p.classList.toggle('on', +p.getAttribute('data-pick') === i); }); };
      var choose = function (i) {
        var cs = card ? card.querySelectorAll('.ml-choice') : [];
        if (cs[i] && !cs[i].disabled) cs[i].click();
        mark(i);
      };
      pks.forEach(function (p) {
        var i = +p.getAttribute('data-pick');
        p.addEventListener('click', function () { choose(i); });
        if (p.tagName.toLowerCase() === 'g') p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(i); } });
      });
      if (card) card.addEventListener('click', function (e) { var c = e.target.closest && e.target.closest('.ml-choice'); if (c) mark(+c.getAttribute('data-i')); });
    }
    return { destroy: function () { try { if (canSpeak()) W.speechSynthesis.cancel(); } catch (e) { } } };
  }

  /* ---------------- "Read to me" for a lesson ---------------- */
  function reader(el, o) {
    injectCss();
    el.classList.add('pkr');
    if (!canSpeak()) { el.hidden = true; return {}; }
    var go = D.createElement('button'); go.type = 'button'; go.className = 'pkp-btn'; go.innerHTML = '<span aria-hidden="true">🔊</span> Read this page to me';
    var stop = D.createElement('button'); stop.type = 'button'; stop.className = 'pkp-btn'; stop.innerHTML = '<span aria-hidden="true">⏹</span> Stop'; stop.hidden = true;
    var tip = D.createElement('small'); tip.textContent = (o && o.tip) || 'The notes for grown-ups are not read aloud.';
    el.appendChild(go); el.appendChild(stop); el.appendChild(tip);
    go.addEventListener('click', function () {
      var art = el.closest('.mlp-lesson') || el.parentNode, parts = [];
      [].forEach.call(art.querySelectorAll('p, li, .mlp-ex-q'), function (n) {
        if (n.closest('.mlp-note, .mlp-list, .mlp-try, .pkp, .pkr, figcaption, .mlp-box-lab')) return;
        if (n.closest('.mlp-ex-steps') && n.tagName !== 'LI') return;
        var t = plainSay(n.textContent); if (t) parts.push(t);
      });
      try {
        W.speechSynthesis.cancel();
        parts.forEach(function (t, i) { var u = new W.SpeechSynthesisUtterance(t); u.rate = 0.9; u.lang = 'en-US'; if (i === parts.length - 1) u.onend = function () { stop.hidden = true; }; W.speechSynthesis.speak(u); });
        stop.hidden = !parts.length;
      } catch (e) { }
    });
    stop.addEventListener('click', function () { try { W.speechSynthesis.cancel(); } catch (e) { } stop.hidden = true; });
    return { destroy: function () { try { W.speechSynthesis.cancel(); } catch (e) { } } };
  }

  try { injectCss(); } catch (e) { }
  function boot() { if (ML.viz && ML.viz.register) { ML.viz.register('pk-pic', factory); ML.viz.register('pk-read', reader); return true; } return false; }
  if (!boot()) { if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else W.setTimeout(boot, 0); }
  ML.__pkpic = { objs: Object.keys(OBJ), dice: DICE };
})(window, document);

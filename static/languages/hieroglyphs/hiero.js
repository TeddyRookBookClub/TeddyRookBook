/* Teddy Rook Book: the Egyptian hieroglyph tools in Languages (/languages/hieroglyphs/). Shared helpers on window.TRBHiero.
   Every sign, word and royal name comes from the Egyptology model, MathLadder.egypt (static/egypt/viz/egypt.js), read when the
   page runs, so signs and words added to the model appear here without changes. The hieroglyphs are drawn with the site's own
   font, TRB Hieroglyphs (static/egypt/fonts/), by Unicode code point. Progress and settings live in localStorage under
   'trb-hiero-v1' (every read and write is wrapped in try/catch; the tools work without storage). No libraries, no network. */
(function (W, D) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', KEY = 'trb-hiero-v1';
  function EG() { return W.MathLadder && W.MathLadder.egypt; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }

  // Gardiner's categories (Egyptian Grammar, Sign List). There is no J.
  var CATS = [['A', 'Man and his occupations'], ['B', 'Woman and her occupations'], ['C', 'Gods in human form'], ['D', 'Parts of the human body'],
    ['E', 'Mammals'], ['F', 'Parts of mammals'], ['G', 'Birds'], ['H', 'Parts of birds'], ['I', 'Amphibians, reptiles and the like'],
    ['K', 'Fish and parts of fish'], ['L', 'Insects and other small creatures'], ['M', 'Trees and plants'], ['N', 'Sky, earth and water'],
    ['O', 'Buildings and parts of buildings'], ['P', 'Ships and parts of ships'], ['Q', 'Household and funerary furniture'],
    ['R', 'Temple furniture and sacred emblems'], ['S', 'Crowns, dress and staffs'], ['T', 'Warfare, hunting and butchery'],
    ['U', 'Farming, crafts and professions'], ['V', 'Rope, fiber, baskets and bags'], ['W', 'Vessels of stone and pottery'],
    ['X', 'Loaves and cakes'], ['Y', 'Writing, games and music'], ['Z', 'Strokes, signs from hieratic, and shapes'], ['Aa', 'Unclassified']];
  function cat(code) { var m = /^[A-Z][a-z]?/.exec(code); return m ? m[0] : ''; }
  function codeNum(code) { var m = /^([A-Z][a-z]?)(\d+)([A-Z]?)$/.exec(code); return m ? [m[1], +m[2], m[3]] : [code, 0, '']; }
  function codeSort(a, b) { var x = codeNum(a), y = codeNum(b), ci = CATS.map(function (c) { return c[0]; }); return ci.indexOf(x[0]) - ci.indexOf(y[0]) || x[1] - y[1] || (x[2] < y[2] ? -1 : x[2] > y[2] ? 1 : 0); }
  function uniName(code) { var m = codeNum(code); return 'EGYPTIAN HIEROGLYPH ' + m[0].toUpperCase() + ('00' + m[1]).slice(-3) + m[2]; }
  function cp(u) { return 'U+' + u.codePointAt(0).toString(16).toUpperCase(); }
  var KIND = { uni: ['One-sound sign', 'uniliteral'], bi: ['Two-sound sign', 'biliteral'], tri: ['Three-sound sign', 'triliteral'],
    logo: ['Word sign', 'ideogram'], det: ['Determinative', 'meaning sign'], num: ['Numeral', 'number sign'] };
  // words and royal names (from the model) that use a sign
  function examples(code) {
    var E = EG(), out = [];
    Object.keys(E.WORDS).forEach(function (k) { var w = E.WORDS[k]; if (E.codes(w.sp).indexOf(code) >= 0) out.push({ key: k, sp: w.sp, tl: w.tl, en: w.en, kind: 'word' }); });
    Object.keys(E.NAMES).forEach(function (k) { var n = E.NAMES[k]; if (n.signs.indexOf(code) >= 0) out.push({ key: k, sp: n.sp, tl: n.tl, en: n.en, kind: 'name' }); });
    return out;
  }

  /* ---------- drawing hieroglyphs as SVG: the model's quadrat layout (MathLadder.egypt.layout), one <text> per sign ---------- */
  // items(L, U, x0, y0) -> the signs as { u, x, y, fs, flip, w } in px: x, y is the text's baseline origin
  function items(L, U, x0, y0) {
    return L.signs.map(function (p) {
      var F = p.fs * U, x = x0 + p.x * U, y = y0 + p.y * U, w = p.w * U;
      return { u: p.u, c: p.c, x: x - 0.04 * F, y: y + p.top * F, fs: F, flip: !!p.flip, bx: x, bw: w, by: y, bh: p.h * U };
    });
  }
  function signText(it, cls) {
    var tr = it.flip ? ' transform="translate(' + (2 * it.bx + it.bw).toFixed(2) + ',0) scale(-1,1)"' : '';
    return '<text class="' + (cls || 'hg-sign') + '" x="' + it.x.toFixed(2) + '" y="' + it.y.toFixed(2) + '" font-size="' + it.fs.toFixed(2) + '"' + tr + '>' + it.u + '</text>';
  }
  // a word or a few groups as an inline SVG string (sp: the model's spelling code)
  function glyphSVG(sp, o) {
    o = o || {}; var E = EG(), U = o.U || 40, pad = o.pad == null ? 0.1 * U : o.pad, L;
    try { L = E.layout(sp, { dir: o.dir || 'ltr' }); } catch (e) { return '<span class="hg-err">' + esc(e.message) + '</span>'; }
    var w = L.w * U + 2 * pad, h = L.h * U + 2 * pad;
    if (o.max && w > o.max) { U = U * o.max / w; pad = o.pad == null ? 0.1 * U : o.pad; w = L.w * U + 2 * pad; h = L.h * U + 2 * pad; }
    var s = '<svg class="hg-gsvg' + (o.cls ? ' ' + o.cls : '') + '" viewBox="0 0 ' + w.toFixed(1) + ' ' + h.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" role="img" aria-label="' + esc(o.label || 'Hieroglyphs') + '" focusable="false">';
    items(L, U, pad, pad).forEach(function (it) { s += signText(it); });
    return s + '</svg>';
  }
  /* Groups for a row of sound signs, the way scribes packed signs into blocks (quadrats): two low, wide signs stack one above
     the other; two tall, narrow signs stand side by side. Reading order is kept (top before bottom, left before right). */
  function dims(c) { var m = EG().SIGNS[c].m; return { w: m[0], h: m[1] - m[2] }; }
  function isFlat(c) { var d = dims(c); return d.h <= 0.26 && d.w >= 0.3; }
  function isNarrow(c) { var d = dims(c); return d.w <= 0.24 && d.h >= 0.5; }
  function group(codes, on) {
    if (on === false) return codes.join('-');
    var g = [], i = 0;
    while (i < codes.length) {
      var a = codes[i], b = codes[i + 1];
      if (b && isFlat(a) && isFlat(b)) { g.push(a + ':' + b); i += 2; continue; }
      if (b && isNarrow(a) && isNarrow(b)) { g.push(a + '*' + b); i += 2; continue; }
      g.push(a); i++;
    }
    return g.join('-');
  }

  /* ---------- storage (one key for all the tools) ---------- */
  function load() { var s = null; try { s = JSON.parse(W.localStorage.getItem(KEY)); } catch (e) { s = null; } return s && typeof s === 'object' ? s : {}; }
  function save(s) { try { W.localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }

  /* ---------- copy to the clipboard, with a fallback ---------- */
  function copy(text, button) {
    function done(ok) { if (!button) return; var t = button.getAttribute('data-label') || button.textContent; button.setAttribute('data-label', t); button.textContent = ok ? 'Copied ✓' : 'Select and copy'; setTimeout(function () { button.textContent = t; }, 1600); }
    function fallback() {
      var ta = D.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.left = '0'; ta.style.top = '0';
      D.body.appendChild(ta); ta.select(); var ok = false; try { ok = D.execCommand('copy'); } catch (e) { ok = false; } D.body.removeChild(ta); done(ok);
    }
    try { if (W.navigator.clipboard && W.isSecureContext) { W.navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); return; } } catch (e) { }
    fallback();
  }
  function fontReady(cb) {
    var called = false; function go() { if (!called) { called = true; cb(); } }
    try { if (D.fonts && D.fonts.load) { D.fonts.load('48px "TRB Hieroglyphs"', '𓄿𓇋').then(go, go); setTimeout(go, 2500); return; } } catch (e) { }
    go();
  }
  function ready(fn) {
    function go() {
      if (!EG()) { var box = $('[data-hg-root]'); if (box) box.insertAdjacentHTML('afterbegin', '<p class="hg-warn">The hieroglyph kit didn’t load. <button type="button" class="cbtn" onclick="location.reload()">Reload the page</button></p>'); return; }
      fn(EG());
    }
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', go); else go();
  }
  function tl(s) { return '<span class="eg-tl">' + esc(EG().show(s)) + '</span>'; }
  function h(s) { return '<span class="eg-h">' + esc(s) + '</span>'; }
  function download(name, blob) {
    var a = D.createElement('a'), url = URL.createObjectURL(blob); a.href = url; a.download = name; D.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 800);
  }

  W.TRBHiero = { EG: EG, esc: esc, $: $, $$: $$, CATS: CATS, cat: cat, codeSort: codeSort, uniName: uniName, cp: cp, KIND: KIND, examples: examples,
    items: items, signText: signText, glyphSVG: glyphSVG, group: group, isFlat: isFlat, isNarrow: isNarrow, load: load, save: save, copy: copy,
    fontReady: fontReady, ready: ready, tl: tl, h: h, download: download, NS: NS };
})(window, document);

/* Competition pages (layouts/comp/): reveals, hints, the visualization loader, filters and the challenge checker.

   Visualizations: static/comp/viz/<id>.js registers  (window.CompViz = window.CompViz || {})['<id>'] = function (el, api) {…}
   A slot <div class="cp-viz" data-viz="<id>" data-v="<mtime>"> inside a solution is loaded the first time that solution
   is shown. Errors in a viz are caught and shown as a short note, so one broken viz never breaks the page.
   api (also window.CompVizAPI):
     api.dark()            true in the dark theme
     api.reduced()         true if the visitor prefers reduced motion
     api.onTheme(fn)       fn() whenever the site theme changes
     api.colors()          { bg, panel, ink, muted, grid, axis, green, blue, red, gold, purple, orange, pink, teal, *Soft fills,
                             skin: '#ffcc4d', skinLine: '#e8a93a' } for the current theme
     api.tex(str, node, display)  typeset TeX (no $ delimiters) into node (an HTML element, or an SVG <foreignObject>);
                             returns node. In SVG <text>, use plain text instead.
     api.typeset(root)     render $…$ / $$…$$ in the text under root
   Math: window.MathLadder from static/math/core/tex.js (loaded before this file on these pages).
   Challenge progress: localStorage 'trb-compchal-v1' = { v: 1, p: { <id>: { s: 1 (solved by check) | 2 (marked proved),
   t: epoch ms, n: tries, h: hints seen } } }. Keys starting trb- are per learner (static/js/profiles.js). */
(function (W, D) {
  'use strict';
  var ML = function () { return W.MathLadder || {}; };
  var M = Math;

  // ------------------------------------------------------------------ api
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function reduced() { try { return W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  var LIGHT = { bg: '#ffffff', panel: '#fbf8f0', ink: '#1d2320', muted: '#5d6862', grid: '#e4ebe6', axis: '#56625b', green: '#00703c', blue: '#1c6fd6', red: '#d6336c', gold: '#b8860b', purple: '#7048e8', orange: '#e8590c', pink: '#c2255c', teal: '#0c8599' };
  var DARK = { bg: '#14211a', panel: '#1b2b22', ink: '#e6ece8', muted: '#a9b8af', grid: '#2a3d32', axis: '#a9b8af', green: '#6cc79a', blue: '#74c0fc', red: '#ff8787', gold: '#ffd479', purple: '#b197fc', orange: '#ffa94d', pink: '#f783ac', teal: '#66d9e8' };
  function soft(hex, a) { var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function colors() {
    var d = dark(), c = {}, k, src = d ? DARK : LIGHT;
    for (k in src) c[k] = src[k];
    ['green', 'blue', 'red', 'gold', 'purple', 'orange', 'pink', 'teal'].forEach(function (k) { c[k + 'Soft'] = soft(c[k], d ? 0.28 : 0.18); });
    c.skin = '#ffcc4d'; c.skinLine = '#e8a93a';
    return c;
  }
  var themeFns = [];
  function onTheme(fn) { if (typeof fn === 'function') themeFns.push(fn); }
  try {
    new MutationObserver(function () { themeFns.forEach(function (f) { try { f(); } catch (e) { warn(e); } }); })
      .observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  } catch (e) { }
  function tex(s, node, display) {
    if (!node) return node;
    var m = ML();
    try { node.innerHTML = m.tex ? m.tex(String(s), { display: !!display }) : ''; if (!m.tex) node.textContent = String(s); }
    catch (e) { node.textContent = String(s); }
    return node;
  }
  function typeset(root) { var m = ML(); try { if (m.typeset && root) m.typeset(root); } catch (e) { warn(e); } }
  function warn(e) { try { console.warn('[comp]', e && e.message ? e.message : e); } catch (x) { } }
  var api = { dark: dark, reduced: reduced, onTheme: onTheme, colors: colors, tex: tex, typeset: typeset };
  W.CompVizAPI = api;

  // ------------------------------------------------------------------ viz loader
  var base = (function () {
    var s = D.currentScript && D.currentScript.src;
    if (!s) { var all = D.querySelectorAll('script[src*="comp/comp.js"]'); if (all.length) s = all[all.length - 1].src; }
    return s ? s.replace(/comp\.js(\?.*)?$/, 'viz/') : '/comp/viz/';
  })();
  var loading = {};
  function load(id, v) {
    if (loading[id]) return loading[id];
    loading[id] = new Promise(function (res, rej) {
      if (W.CompViz && W.CompViz[id]) return res();
      var s = D.createElement('script');
      s.src = base + encodeURIComponent(id) + '.js' + (v ? '?v=' + v : '');
      s.async = true;
      s.onload = function () { res(); };
      s.onerror = function () { rej(new Error('could not load ' + id)); };
      D.head.appendChild(s);
    });
    return loading[id];
  }
  function fail(el, e) {
    warn(e);
    el.innerHTML = '';
    var p = D.createElement('p'); p.className = 'cp-viz-msg'; p.textContent = 'The animation could not load. The solution below does not depend on it.';
    el.appendChild(p);
  }
  function mount(el) {
    if (el.getAttribute('data-mounted')) return;
    el.setAttribute('data-mounted', '1');
    var id = el.getAttribute('data-viz');
    load(id, el.getAttribute('data-v')).then(function () {
      var f = W.CompViz && W.CompViz[id];
      if (typeof f !== 'function') throw new Error('viz ' + id + ' did not register');
      f(el, api);
    }).catch(function (e) { fail(el, e); });
  }
  W.addEventListener('error', function (ev) {
    // an error thrown later by a viz (a timer, an event handler): note it on that viz instead of leaving it half-drawn
    var f = ev && ev.filename || '';
    var m = /\/comp\/viz\/([^/?#]+)\.js/.exec(f);
    if (m) { ev.preventDefault(); var el = D.querySelector('.cp-viz[data-viz="' + decodeURIComponent(m[1]) + '"]'); if (el && !el.querySelector('.cp-viz-msg')) fail(el, ev.message); }
  });

  // ------------------------------------------------------------------ reveals and hints
  function show(region) {
    if (!region) return;
    region.hidden = false;
    if (!region.getAttribute('data-typeset')) { region.setAttribute('data-typeset', '1'); typeset(region); }
    Array.prototype.forEach.call(region.querySelectorAll('.cp-viz[data-viz]'), mount);
  }
  function onReveal(btn) {
    var r = D.getElementById(btn.getAttribute('data-reveal'));
    if (!r) return;
    var open = btn.getAttribute('aria-expanded') === 'true';
    if (open) { r.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.textContent = btn.textContent.replace(/^Hide/, 'Show'); }
    else { show(r); btn.setAttribute('aria-expanded', 'true'); btn.textContent = btn.textContent.replace(/^Show/, 'Hide'); }
  }
  function onHint(btn) {
    var list = D.getElementById(btn.getAttribute('data-hint'));
    if (!list) return;
    var items = list.querySelectorAll('li'), next = null, i, shown = 0;
    for (i = 0; i < items.length; i++) { if (items[i].hidden) { if (!next) next = items[i]; } else shown++; }
    if (!next) return;
    list.hidden = false; next.hidden = false; shown++;
    typeset(next);
    btn.setAttribute('aria-expanded', 'true');
    if (shown >= items.length) { btn.disabled = true; btn.textContent = items.length > 1 ? 'All hints shown' : 'Hint shown'; }
    else btn.textContent = 'Show hint ' + (shown + 1) + ' of ' + items.length;
    var card = btn.closest('[data-cid]');
    if (card) save(card.getAttribute('data-cid'), function (r) { r.h = M.max(r.h || 0, shown); });
  }

  // ------------------------------------------------------------------ filters (Putnam table)
  function initFilter(f) {
    var table = D.getElementById(f.getAttribute('data-filter'));
    if (!table) return;
    var rows = table.querySelectorAll('tbody tr'), out = f.querySelector('output');
    function run() {
      var a = f.elements.area.value, d = f.elements.diff.value, r = f.elements.ready.checked, n = 0;
      Array.prototype.forEach.call(rows, function (tr) {
        var ok = (!a || (' ' + tr.getAttribute('data-areas') + ' ').indexOf(' ' + a + ' ') >= 0) &&
          (!d || tr.getAttribute('data-diff') === d) && (!r || tr.getAttribute('data-ready') === '1');
        tr.hidden = !ok; if (ok) n++;
      });
      if (out) out.textContent = n + (n === 1 ? ' problem' : ' problems');
    }
    f.addEventListener('change', run);
    f.addEventListener('submit', function (e) { e.preventDefault(); });
    run();
  }

  // ------------------------------------------------------------------ challenge progress
  var KEY = 'trb-compchal-v1';
  function loadP() { try { var o = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (o && o.p) return o; } catch (e) { } return { v: 1, p: {} }; }
  function save(id, fn) {
    if (!id) return;
    var o = loadP(), r = o.p[id] || {};
    fn(r); o.p[id] = r;
    try { W.localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { }
    paint();
  }
  function paint() {
    var root = D.getElementById('cp-chal');
    if (!root) return;
    var o = loadP(), n = 0;
    Array.prototype.forEach.call(root.querySelectorAll('[data-cid]'), function (card) {
      var r = o.p[card.getAttribute('data-cid')], done = !!(r && r.s);
      var b = card.querySelector('[data-done]'); if (b) b.hidden = !done;
      var pr = card.querySelector('[data-proved]');
      if (pr) { pr.setAttribute('aria-pressed', r && r.s === 2 ? 'true' : 'false'); pr.textContent = r && r.s === 2 ? 'Proved ✓' : 'I proved it'; }
      if (done && !card.classList.contains('cp-coming')) n++;
    });
    var s = root.querySelector('[data-solved]'); if (s) s.textContent = n;
  }

  // ------------------------------------------------------------------ answer checking
  // A small expression reader: numbers, + - * / ^, parentheses, implicit multiplication, pi, e, sqrt, cbrt, abs, exp,
  // ln, log (base 10), log2, sin cos tan asin acos atan sinh cosh tanh, floor, ceil, and the challenge's variables.
  // Unicode × ÷ − √ π are accepted. Returns a function of a variables object, or throws.
  var FN = { sqrt: M.sqrt, cbrt: M.cbrt || function (x) { return x < 0 ? -M.pow(-x, 1 / 3) : M.pow(x, 1 / 3); }, abs: M.abs, exp: M.exp, ln: M.log,
    log: function (x) { return M.log(x) / M.LN10; }, log2: function (x) { return M.log(x) / M.LN2; }, sin: M.sin, cos: M.cos, tan: M.tan,
    asin: M.asin, acos: M.acos, atan: M.atan, arcsin: M.asin, arccos: M.acos, arctan: M.atan, sinh: M.sinh, cosh: M.cosh, tanh: M.tanh, floor: M.floor, ceil: M.ceil };
  function compile(src, vars) {
    var s = String(src).replace(/[×·∙]/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/\*\*/g, '^').replace(/\s+/g, ' ').trim();
    var t = [], i = 0, m, re = /^(?:(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+)|([A-Za-z_][A-Za-z_0-9]*)|([-+*/^(),!]))/;
    while (i < s.length) {
      if (s[i] === ' ') { i++; continue; }
      m = re.exec(s.slice(i)); if (!m) throw new Error('I could not read "' + s[i] + '".');
      if (m[1]) t.push({ k: 'n', v: parseFloat(m[1]) });
      else if (m[2]) {
        var w = m[2];
        if (FN[w] || w === 'pi' || w === 'e' || vars.indexOf(w) >= 0) t.push({ k: 'id', v: w });
        else { // split runs like "nx" or "2pi" into known names
          var j = 0, ok = true;
          while (j < w.length) {
            var hit = null;
            ['sqrt', 'cbrt', 'pi'].concat(vars).forEach(function (n) { if (w.substr(j, n.length) === n && (!hit || n.length > hit.length)) hit = n; });
            if (!hit && w[j] === 'e') hit = 'e';
            if (!hit) { ok = false; break; }
            t.push({ k: 'id', v: hit }); j += hit.length;
          }
          if (!ok) throw new Error('I don\'t know "' + w + '".' + (vars.length ? ' Use ' + vars.join(', ') + '.' : ''));
        }
      } else t.push({ k: m[3] });
      i += m[0].length;
    }
    var p = 0;
    function peek() { return t[p]; }
    function take(k) { if (t[p] && t[p].k === k) return t[p++]; return null; }
    function need(k) { if (!take(k)) throw new Error('Check the parentheses.'); }
    function startsAtom(x) { return x && (x.k === 'n' || x.k === 'id' || x.k === '('); }
    function expr() { var a = term(); for (; ;) { if (take('+')) { a = bin(a, term(), '+'); } else if (take('-')) { a = bin(a, term(), '-'); } else return a; } }
    function term() {
      var a = unary();
      for (; ;) {
        if (take('*')) a = bin(a, unary(), '*'); else if (take('/')) a = bin(a, unary(), '/');
        else if (startsAtom(peek())) a = bin(a, power(), '*'); else return a;
      }
    }
    function unary() { if (take('-')) { var a = unary(); return function (V) { return -a(V); }; } if (take('+')) return unary(); return power(); }
    function power() { var b = post(); if (take('^')) { var e = unary(); return function (V) { return M.pow(b(V), e(V)); }; } return b; }
    function post() { var a = atom(); while (take('!')) a = (function (f) { return function (V) { return fact(f(V)); }; })(a); return a; }
    function atom() {
      var x = t[p++];
      if (!x) throw new Error('The answer looks unfinished.');
      if (x.k === 'n') return function () { return x.v; };
      if (x.k === '(') { var a = expr(); need(')'); return a; }
      if (x.k === 'id') {
        if (FN[x.v]) { var f = FN[x.v], arg = take('(') ? (function () { var a = expr(); need(')'); return a; })() : power(); return function (V) { return f(arg(V)); }; }
        if (x.v === 'pi') return function () { return M.PI; };
        if (x.v === 'e') return function () { return M.E; };
        return function (V) { return V[x.v]; };
      }
      throw new Error('Something is out of place near "' + x.k + '".');
    }
    function bin(a, b, o) {
      return o === '+' ? function (V) { return a(V) + b(V); } : o === '-' ? function (V) { return a(V) - b(V); } :
        o === '*' ? function (V) { return a(V) * b(V); } : function (V) { return a(V) / b(V); };
    }
    if (!t.length) throw new Error('Type an answer first.');
    var f = expr();
    if (p < t.length) throw new Error('Something is out of place near "' + (t[p].k === 'n' || t[p].k === 'id' ? t[p].v : t[p].k) + '".');
    return f;
  }
  function fact(n) { if (n < 0 || n !== M.floor(n) || n > 170) return NaN; var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  function close(a, b, tol) { if (!isFinite(a) || !isFinite(b)) return false; return M.abs(a - b) <= tol * M.max(1, M.abs(b)); }
  function checkExpr(form, input) {
    var vars = (form.getAttribute('data-vars') || '').split(',').filter(Boolean);
    var tol = parseFloat(form.getAttribute('data-tol')) || 1e-9;
    var want = compile(form.getAttribute('data-answer'), vars), got = compile(input, vars);
    if (!vars.length) return close(got({}), want({}), tol);
    var dom = (form.getAttribute('data-domain') || '').split(',').map(parseFloat), lo = isFinite(dom[0]) ? dom[0] : 1, hi = isFinite(dom[1]) ? dom[1] : 9;
    var ints = form.getAttribute('data-domain') ? false : true, tried = 0;
    for (var k = 0; k < 40 && tried < 12; k++) {
      var V = {};
      vars.forEach(function (v, j) { V[v] = ints ? lo + ((k * 7 + j * 3) % (hi - lo + 1)) : lo + (hi - lo) * (((k + 1) * 0.6180339887 + j * 0.414) % 1); });
      var w = want(V); if (!isFinite(w)) continue;
      tried++;
      if (!close(got(V), w, M.max(tol, 1e-9))) return false;
    }
    return tried > 0;
  }
  function initCheck(form) {
    var card = form.closest('[data-cid]'), id = card && card.getAttribute('data-cid'), fb = form.querySelector('.cp-fb');
    var type = form.getAttribute('data-type');
    if (type === 'proof') {
      var b = form.querySelector('[data-proved]');
      if (b) b.addEventListener('click', function () { save(id, function (r) { if (r.s === 2) { delete r.s; } else { r.s = 2; r.t = Date.now(); } }); });
      return;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = false, val;
      fb.className = 'cp-fb';
      try {
        if (type === 'choice') {
          var c = form.querySelector('input[type=radio]:checked');
          if (!c) { fb.textContent = 'Pick one of the choices first.'; return; }
          ok = c.value === String(form.getAttribute('data-answer'));
        } else {
          val = form.querySelector('input[type=text]').value;
          if (!val.trim()) { fb.textContent = 'Type an answer first.'; return; }
          ok = checkExpr(form, val);
        }
      } catch (err) { fb.textContent = err.message || 'I could not read that answer.'; return; }
      save(id, function (r) { r.n = (r.n || 0) + 1; if (ok && r.s !== 2) { r.s = 1; r.t = Date.now(); } });
      fb.className = 'cp-fb ' + (ok ? 'ok' : 'no');
      fb.textContent = ok ? 'Right! Compare your method with our solution.' : 'Not quite. Check your work, or take a hint.';
    });
  }

  W.CompCheck = { compile: compile, value: function (src, vars, V) { return compile(src, vars || [])(V || {}); } }; // for scripts/comp/check-comp.js

  // ------------------------------------------------------------------ start
  function init() {
    Array.prototype.forEach.call(D.querySelectorAll('.cp [data-tex], .cp-card-h, .cp-q > h2, .cp-table, .cp-ynote'), typeset);
    D.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button[data-reveal], button[data-hint]');
      if (!b) return;
      if (b.hasAttribute('data-reveal')) onReveal(b); else onHint(b);
    });
    Array.prototype.forEach.call(D.querySelectorAll('form.cp-filter'), initFilter);
    Array.prototype.forEach.call(D.querySelectorAll('.cp-check'), initCheck);
    paint();
    // printing: typeset the hidden solutions and hints too (comp.css shows them in print)
    W.addEventListener('beforeprint', function () { Array.prototype.forEach.call(D.querySelectorAll('.cp-sol, .cp-hints'), function (r) { if (!r.getAttribute('data-typeset')) { r.setAttribute('data-typeset', '1'); typeset(r); } }); });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})(window, document);

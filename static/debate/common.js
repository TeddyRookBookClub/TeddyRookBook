/* Debate tools: shared helpers. Everything is saved in this browser under one key, "trb-debate-v1":
   {v:1, timer:{...}, flows:[...], cases:[...], drills:{...}, ballots:{...}}. Nothing is sent anywhere. */
(function () {
  'use strict';
  var KEY = 'trb-debate-v1';
  var mem = null, ok = true;

  function load() {
    if (mem) return mem;
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { ok = false; }
    if (!d || typeof d !== 'object') d = {};
    d.v = 1;
    mem = d;
    return d;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(mem || {})); ok = true; return true; } catch (e) { ok = false; return false; }
  }
  // get or create one part of the saved object
  function part(name, dflt) {
    var d = load();
    if (d[name] == null) d[name] = dflt;
    return d[name];
  }
  function canSave() { try { localStorage.setItem(KEY + '-t', '1'); localStorage.removeItem(KEY + '-t'); return true; } catch (e) { return false; } }

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid(p) { return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function json(id) { var el = document.getElementById(id); if (!el) return null; try { return JSON.parse(el.textContent); } catch (e) { return null; } }

  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  // ask for a file and hand back its text
  function pickFile(accept, cb) {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = accept || '.json,application/json';
    inp.style.display = 'none';
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { cb(String(r.result || ''), f.name); inp.remove(); };
      r.readAsText(f);
    });
    document.body.appendChild(inp);
    inp.click();
  }
  function say(el, msg) {
    if (!el) return;
    el.textContent = msg;
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.textContent = ''; }, 6000);
  }
  function stamp() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function shuffle(a, rnd) { rnd = rnd || Math.random; a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // tabs: buttons [role=tab][data-v] inside box; panels by id prefix + value; remembers the choice under store key
  function tabs(box, prefix, onShow, rememberAs) {
    var btns = $$('[role=tab]', box);
    function show(v, focus) {
      btns.forEach(function (b) {
        var on = b.dataset.v === v;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
        var p = document.getElementById(prefix + b.dataset.v);
        if (p) p.hidden = !on;
      });
      if (rememberAs) { part('ui', {})[rememberAs] = v; save(); }
      try { history.replaceState(null, '', '#' + v); } catch (e) { }
      if (onShow) onShow(v);
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { show(b.dataset.v); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, j = -1;
        if (k === 'ArrowRight') j = (i + 1) % btns.length;
        else if (k === 'ArrowLeft') j = (i - 1 + btns.length) % btns.length;
        else if (k === 'Home') j = 0; else if (k === 'End') j = btns.length - 1;
        if (j >= 0) { e.preventDefault(); show(btns[j].dataset.v, true); }
      });
    });
    var h = (location.hash || '').slice(1);
    var start = btns.some(function (b) { return b.dataset.v === h; }) ? h : ((rememberAs && part('ui', {})[rememberAs]) || (btns[0] && btns[0].dataset.v));
    if (!btns.some(function (b) { return b.dataset.v === start; })) start = btns[0] && btns[0].dataset.v;
    if (start) show(start);
    return show;
  }

  // a textarea that grows with its text
  function autosize(t) {
    function fit() { t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; }
    t.addEventListener('input', fit);
    fit();
    return fit;
  }

  // tool pages keep working offline after a first visit (static/debate/tools/sw.js, scope /debate/tools/)
  try {
    var m = location.pathname.match(/^(.*\/debate\/tools\/)/);
    if (m && 'serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', function () { navigator.serviceWorker.register(m[1] + 'sw.js').catch(function () { }); });
    }
  } catch (e) { }

  window.TRBDebate = {
    KEY: KEY, load: load, save: save, part: part, canSave: canSave, ok: function () { return ok; },
    $: $, $$: $$, esc: esc, uid: uid, json: json, download: download, pickFile: pickFile, say: say, stamp: stamp, shuffle: shuffle, tabs: tabs, autosize: autosize
  };
})();

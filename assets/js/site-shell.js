{{- /* Site shell script, the same on every page (built by layouts/_partials/footer.html with resources.ExecuteAsTemplate,
   minified and fingerprinted). Loaded with a plain <script src> at the end of the page, where these scripts used to be inline,
   so they run at the same moment and in the same order. Each part is kept as it was:
   1. light/dark switch aria-checked (was in layouts/_partials/header.html)
   2-6. "Expand all", click-to-play videos, text size (Aa), "More" menus and site search, the offline notice loader
        (were in layouts/_partials/extend_footer.html)
   7-10. the theme's footer scripts: menu scroll position, back-to-top link, theme toggle, code copy buttons
        (were in themes/PaperMod/layouts/_partials/footer.html; code copy only where the <script> tag has data-cc). */ -}}
/* 1. Light/dark switch: aria-checked follows the theme. */
(function () { 'use strict'; var b = document.getElementById('theme-toggle'), h = document.documentElement; if (!b) return; function sync() { b.setAttribute('aria-checked', h.getAttribute('data-theme') === 'dark' ? 'true' : 'false'); } sync(); try { new MutationObserver(sync).observe(h, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) { } })();
/* "Expand all" for any group of two or more collapsible sections (<details>) on a page. */
(function (D) {
  function skip(d) { return d.closest('header, nav, .header, [data-noexpand]') || d.classList.contains('pl-more'); }
  function isD(n) { return n && n.nodeType === 1 && n.tagName === 'DETAILS'; }
  function nextEl(n) { n = n.nextSibling; while (n && n.nodeType !== 1) n = n.nextSibling; return n; }
  function bar(list, before, parent) {
    var answers = list.every(function (d) { return d.classList.contains('hs-ans'); });
    var w = D.createElement('div'); w.className = 'xa-bar';
    var b = D.createElement('button'); b.type = 'button'; b.className = 'xa-btn'; w.appendChild(b);
    function vis() { return list.filter(function (d) { return d.getClientRects().length > 0; }); }
    function upd() {
      var v = vis(), open = v.length && v.every(function (d) { return d.open; });
      b.textContent = open ? (answers ? '▴ Hide all answers' : '▴ Collapse all') : (answers ? '▾ Show all answers' : '▾ Expand all');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      w.hidden = v.length < 2;
    }
    b.addEventListener('click', function () { var v = vis(), open = v.every(function (d) { return d.open; }); v.forEach(function (d) { d.open = !open; }); upd(); });
    list.forEach(function (d) { d.addEventListener('toggle', upd); });
    parent.insertBefore(w, before);
    // put the button on the same line as the heading just above it
    var h = w.previousElementSibling;
    if (h && /^H[2-4]$/.test(h.tagName)) { var row = D.createElement('div'); row.className = 'xa-head'; h.parentNode.insertBefore(row, h); row.appendChild(h); row.appendChild(w); }
    upd(); ups.push(upd);
  }
  var ups = [], tm;
  function again() { clearTimeout(tm); tm = setTimeout(function () { ups.forEach(function (f) { f(); }); }, 120); }
  D.addEventListener('change', again); D.addEventListener('input', again); D.addEventListener('click', again);
  function run() {
    var all = [].slice.call(D.querySelectorAll('main details, #main details, .main details')).filter(function (d) { return !skip(d); });
    var done = new Set();
    // 1) runs of sibling sections
    all.forEach(function (d) {
      if (done.has(d)) return;
      var p = d.previousElementSibling; if (isD(p) && !skip(p)) return; // not the start of a run
      var runL = [d], n = nextEl(d);
      while (isD(n) && !skip(n)) { runL.push(n); n = nextEl(n); }
      if (runL.length >= 2) { runL.forEach(function (x) { done.add(x); }); bar(runL, d, d.parentNode); }
    });
    // 2) other sections that share a section, e.g. answer notes spread through a list
    var groups = new Map();
    all.forEach(function (d) {
      if (done.has(d) || d.parentNode.closest('details')) return;
      var c = d.parentNode.closest('section, article, .hs-sec') || d.closest('main, #main, .main');
      if (!c) return;
      if (!groups.has(c)) groups.set(c, []);
      groups.get(c).push(d);
    });
    groups.forEach(function (list, c) {
      if (list.length < 2) return;
      var h = c.querySelector(':scope > h1, :scope > h2, :scope > h3');
      bar(list, h ? h.nextSibling : c.firstChild, c);
    });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', run); else run();
})(document);
/* Click-to-play videos: swap the picture for the player only when pressed. */
document.addEventListener('click', function (e) {
  var at = e.target.closest && e.target.closest('.trb-video-at');
  if (at) {
    var fig = document.querySelector('.trb-video-play[data-yt="' + at.dataset.yt + '"]') || document.querySelector('iframe[data-yt="' + at.dataset.yt + '"]');
    if (!fig) return;
    var fr = document.createElement('iframe');
    fr.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(at.dataset.yt) + '?autoplay=1&rel=0&start=' + (+at.dataset.start || 0);
    fr.title = 'Video'; fr.setAttribute('data-yt', at.dataset.yt);
    fr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; fr.allowFullscreen = true; fr.referrerPolicy = 'strict-origin-when-cross-origin';
    fig.replaceWith(fr); fr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  var b = e.target.closest && e.target.closest('.trb-video-play'); if (!b) return;
  var f = document.createElement('iframe');
  f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(b.dataset.yt) + '?autoplay=1&rel=0';
  f.title = b.getAttribute('aria-label').replace(/^Play the video: /, '');
  f.setAttribute('data-yt', b.dataset.yt);
  f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin';
  b.replaceWith(f);
});
/* Text-size control in the header (next to the light/dark switch). Remembered on this device. */
(function () {
  var sw = document.querySelector('.logo-switches'); if (!sw) return;
  var STEPS = [0.85, 0.93, 1, 1.1, 1.2, 1.32, 1.45], root = document.documentElement;
  function cur() { var f = parseFloat(getComputedStyle(root).getPropertyValue('--fs')) || 1; var best = 2; STEPS.forEach(function (s, i) { if (Math.abs(s - f) < Math.abs(STEPS[best] - f)) best = i; }); return best; }
  var wrap = document.createElement('span'); wrap.className = 'trb-fs';
  wrap.innerHTML = '<button type="button" class="trb-fs-btn" aria-expanded="false" aria-label="Text size" title="Text size">Aa</button>' +
    '<span class="trb-fs-pop" role="group" aria-label="Text size" hidden><button type="button" data-d="-1" aria-label="Smaller text">A−</button><output></output><button type="button" data-d="1" aria-label="Larger text">A+</button><button type="button" data-d="0" aria-label="Reset text size">Reset</button></span>';
  sw.appendChild(wrap);
  var btn = wrap.firstChild, pop = wrap.lastChild, out = pop.querySelector('output');
  function set(i) {
    i = Math.max(0, Math.min(STEPS.length - 1, i)); var f = STEPS[i];
    if (f === 1) root.style.removeProperty('--fs'); else root.style.setProperty('--fs', f);
    try { if (f === 1) localStorage.removeItem('trb-fs'); else localStorage.setItem('trb-fs', f); } catch (e) { }
    out.textContent = Math.round(f * 100) + '%';
    pop.querySelector('[data-d="-1"]').disabled = i === 0; pop.querySelector('[data-d="1"]').disabled = i === STEPS.length - 1;
    window.dispatchEvent(new Event('resize'));
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); pop.hidden = !pop.hidden; btn.setAttribute('aria-expanded', !pop.hidden); if (!pop.hidden) set(cur()); });
  pop.addEventListener('click', function (e) { e.stopPropagation(); var b = e.target.closest('[data-d]'); if (!b) return; var d = +b.dataset.d; set(d === 0 ? 2 : cur() + d); });
  /* Formula colors on/off (docs/formula-colors.md): shown on pages with color-coded formulas; remembered on this device. */
  var fc = document.createElement('button'); fc.type = 'button'; fc.className = 'trb-fs-fc'; fc.hidden = true; pop.appendChild(fc);
  function fcOn() { return root.getAttribute('data-fcolors') !== 'off'; }
  function fcShow() { var on = fcOn(); fc.innerHTML = 'Formula colors: <b>' + (on ? 'on' : 'off') + '</b>'; fc.setAttribute('aria-pressed', String(on)); }
  fc.addEventListener('click', function () {
    var on = !fcOn(), R = window.MathLadder && window.MathLadder.roles;
    if (R && R.set) R.set(on);
    else { if (on) root.removeAttribute('data-fcolors'); else root.setAttribute('data-fcolors', 'off'); try { if (on) localStorage.removeItem('trb-fcolors'); else localStorage.setItem('trb-fcolors', 'off'); } catch (e) { } }
    fcShow();
  });
  btn.addEventListener('click', function () { fc.hidden = !document.querySelector('.ml-role[data-role]'); fcShow(); });
  document.addEventListener('click', function () { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') pop.hidden = true; });
})();
/* "More" menu: close when clicking elsewhere or pressing Escape. */
(function () {
  var ds = document.querySelectorAll('#menu .trb-more details'); if (!ds.length) return;
  // the group name is a link to that group's page, beside the summary (layouts/_partials/header.html); the arrow (or hovering, with a mouse) opens the list
  if (window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches) ds.forEach(function (d) {
    var li = d.parentNode, t = 0;
    li.addEventListener('mouseenter', function () { clearTimeout(t); d.open = true; });
    li.addEventListener('mouseleave', function () { t = setTimeout(function () { d.open = false; }, 200); });
  });
  ds.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) ds.forEach(function (o) { if (o !== d) o.open = false; }); }); });
  document.addEventListener('click', function (e) { ds.forEach(function (d) { if (d.open && !d.contains(e.target)) d.open = false; }); });
  document.addEventListener('keydown', function (e) { if (e.key !== 'Escape') return; ds.forEach(function (d) { if (d.open) { d.open = false; d.querySelector('summary').focus(); } }); });
})();
/* Site search: a button in the header (or press /) opens a search box over the page. The index is /index.json. */
(function () {
  var sw = document.querySelector('.logo-switches'); if (!sw) return;
  var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'trb-sbtn'; btn.title = 'Search the site (/)'; btn.setAttribute('aria-label', 'Search the site');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
  sw.insertBefore(btn, sw.firstChild);
  var ov = document.createElement('div'); ov.className = 'trb-search'; ov.hidden = true; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Search');
  ov.innerHTML = '<div class="trb-sbox"><form role="search"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="color:var(--secondary)"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" placeholder="Search books, infographics, games, lessons…" aria-label="Search" autocomplete="off"><kbd>Esc</kbd><button type="button" class="trb-sclose" aria-label="Close">×</button></form><ul class="trb-sres"></ul></div>';
  document.body.appendChild(ov);
  var inp = ov.querySelector('input'), res = ov.querySelector('.trb-sres'), idx = null, loading = null, sel = -1, last = null;
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function load() {
    if (!loading) loading = fetch('/index.json').then(function (r) { return r.json(); }).then(function (d) {
      idx = d.map(function (e) { e.nt = norm(e.t); e.nd = norm(e.d); e.nx = norm(e.x); e.ns = e.s ? ' ' + norm(e.s) + ' ' : ''; return e; }); return idx;
    }).catch(function () { loading = null; res.innerHTML = '<li class="trb-snote">Search could not load. Check your connection and try again.</li>'; });
    return loading;
  }
  function hl(s, terms) { var h = esc(s); terms.forEach(function (t) { if (t.length < 2) return; var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'); h = h.replace(re, '<mark>$1</mark>'); }); return h; }
  function search(q) {
    var terms = norm(q).split(/\s+/).filter(Boolean); if (!terms.length) { res.innerHTML = '<li class="trb-snote">Try a book, author, word, game or topic, for example <i>Homer</i>, <i>chess</i>, <i>VIX</i> or <i>Rome</i>.</li>'; return; }
    var out = [];
    idx.forEach(function (e) {
      var sc = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i], s = 0;
        if (e.ns && e.ns.indexOf(' ' + t + ' ') >= 0) s = 12; // a main section's own search word (data/start.yaml)
        else if (e.nt.indexOf(t) === 0) s = 10; else if (e.nt.indexOf(' ' + t) >= 0) s = 8; else if (e.nt.indexOf(t) >= 0) s = 6;
        else if (e.nx.indexOf(t) >= 0) s = 4; else if (e.nd.indexOf(t) >= 0) s = 2;
        if (!s) return; sc += s;
      }
      if (e.k !== 'Library') sc += 1;
      out.push([sc, e]);
    });
    out.sort(function (a, b) { return b[0] - a[0] || a[1].t.length - b[1].t.length; });
    sel = -1;
    var rawTerms = q.trim().split(/\s+/);
    res.innerHTML = out.length ? out.slice(0, 30).map(function (r) { var e = r[1]; return '<li><a href="' + esc(e.u) + '"><span class="k ' + esc(e.k) + '">' + esc(e.k) + '</span><span><b>' + hl(e.t, rawTerms) + '</b>' + (e.d ? '<small>' + hl(e.d.length > 160 ? e.d.slice(0, 157) + '…' : e.d, rawTerms) + '</small>' : '') + '</span></a></li>'; }).join('')
      : '<li class="trb-snote">Nothing found for “' + esc(q) + '”.</li>';
  }
  function open(q) {
    last = document.activeElement; ov.hidden = false; document.documentElement.style.overflow = 'hidden';
    if (q != null) inp.value = q; inp.focus(); inp.select();
    load().then(function () { if (idx) search(inp.value); });
  }
  function close() { ov.hidden = true; document.documentElement.style.overflow = ''; if (last && last.focus) last.focus(); }
  btn.addEventListener('click', function () { open(); });
  ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.trb-sclose')) close(); });
  ov.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); var a = res.querySelectorAll('a')[Math.max(0, sel)]; if (a) location.href = a.href; });
  inp.addEventListener('input', function () { if (idx) search(inp.value); });
  inp.addEventListener('keydown', function (e) {
    var as = res.querySelectorAll('a'); if (!as.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (sel >= 0) as[sel].classList.remove('sel'); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + as.length) % as.length; as[sel].classList.add('sel'); as[sel].scrollIntoView({ block: 'nearest' }); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !ov.hidden) { close(); return; }
    if (e.key === '/' && ov.hidden && !/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '') && !e.target.isContentEditable && !document.querySelector('canvas:focus')) {
      if (document.querySelector('.gwrap, .hr, .th, #chess, #tabula')) return; // games use their own keys
      e.preventDefault(); open();
    }
  });
  var m = /[?&]search=([^&]*)/.exec(location.search); if (m) open(decodeURIComponent(m[1].replace(/\+/g, ' ')));
  window.trbSearch = open;
})();
/* Keyboard and screen-reader helpers (see "Keyboard" in assets/css/site-shell.css). */
(function () {
  // Skip link: move focus into <main id="main-content"> too (the theme's # link handler below only scrolls).
  var sk = document.querySelector('.trb-skip'), t = document.getElementById('main-content');
  if (sk && !t) sk.parentNode.removeChild(sk);
  else if (sk) sk.addEventListener('click', function () {
    if (t.hasAttribute('tabindex')) { t.focus({ preventScroll: true }); return; }
    // focusable only for this one move, so later clicks inside the page (games, canvases) do not land on <main>
    t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
    t.addEventListener('blur', function () { t.removeAttribute('tabindex'); }, { once: true });
  });
  // Search box: a modal dialog, so Tab stays inside it while it is open.
  var ov = document.querySelector('.trb-search');
  if (ov) {
    ov.setAttribute('aria-modal', 'true');
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || ov.hidden) return;
      var f = [].slice.call(ov.querySelectorAll('input,button,a[href]')).filter(function (x) { return x.offsetParent !== null; }); if (!f.length) return;
      var a = f[0], z = f[f.length - 1], c = document.activeElement;
      if (!ov.contains(c)) { e.preventDefault(); a.focus(); }
      else if (e.shiftKey && c === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && c === z) { e.preventDefault(); a.focus(); }
    });
  }
  // Links inside running text (a sentence, a table cell, a breadcrumb) get .trb-il, an underline, so they are not told apart by
  // color alone. Only plain inline text links: buttons, cards, menus and links that are the whole line are left as they are.
  var seen = window.WeakSet ? new WeakSet() : null;
  function links() {
    var as = document.querySelectorAll('main a[href]:not(.trb-il)'), n = Math.min(as.length, 4000);
    for (var i = 0; i < n; i++) {
      var a = as[i];
      if (seen) { if (seen.has(a)) continue; seen.add(a); }
      if (a.closest('.toc, [role="tablist"], [role="menu"], [role="toolbar"], button, summary')) continue;
      if (a.querySelector('img, svg, canvas, picture')) continue;
      var cs = getComputedStyle(a);
      if (cs.display !== 'inline' || cs.textDecorationLine.indexOf('underline') >= 0) continue;
      var p = a.parentElement; while (p && getComputedStyle(p).display === 'inline') p = p.parentElement;
      if (!p) continue;
      var lt = a.textContent.replace(/\s+/g, '').length; if (!lt) continue;
      if (p.textContent.replace(/\s+/g, '').length - lt < 2) continue;
      a.classList.add('trb-il');
    }
  }
  // A box that scrolls sideways or up and down (a wide table, a long list) and holds nothing focusable gets tabindex="0",
  // so keyboard users can reach it and scroll it with the arrow keys.
  function scrollers() {
    var els = document.querySelectorAll('main pre, main table, main ol, main ul, main [class*="table"], main [class*="tw"], main [class*="box"], main [class*="wrap"]'), n = Math.min(els.length, 3000);
    for (var i = 0; i < n; i++) {
      var el = els[i];
      if (el.hasAttribute('tabindex') || !(el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2)) continue;
      var cs = getComputedStyle(el);
      if (!/auto|scroll/.test(cs.overflowX + cs.overflowY)) continue;
      if (el.querySelector('a[href], button, input, select, textarea, [tabindex]')) continue;
      el.setAttribute('tabindex', '0');
    }
  }
  links();
  window.addEventListener('load', function () {
    links(); scrollers();
    // pages that draw their content later (planners, tables, games) are checked again, at most every half second
    var m = document.getElementById('main-content'), tm = 0;
    if (m && window.MutationObserver) new MutationObserver(function () { if (!tm) tm = setTimeout(function () { tm = 0; links(); scrollers(); }, 500); }).observe(m, { childList: true, subtree: true });
  });
})();
/* Offline: only for people who saved sections on /offline/. Keeps the service worker registered and shows "Update available". */
try{if(localStorage.getItem('trb-off')&&'serviceWorker' in navigator){var s=document.createElement('script');s.src='{{ "js/offline-notice.js" | relURL }}?v={{ (os.Stat "static/js/offline-notice.js").ModTime.Unix }}';s.defer=true;document.head.appendChild(s)}}catch(e){}
/* Read aloud: on lessons and guides (the same list as ROOTS in assets/js/read-aloud.js), and only where the browser can speak,
   load assets/js/read-aloud.js and assets/css/read-aloud.css (speaker buttons beside section headings, a player bar). */
{{- $raJS := resources.Get "js/read-aloud.js" | resources.Minify | fingerprint "md5" }}{{ $raCSS := resources.Get "css/read-aloud.css" | resources.Minify | fingerprint "md5" }}
(function(){try{if(!window.speechSynthesis||!window.SpeechSynthesisUtterance||!document.querySelector('article.mlp-lesson,.gbi,article.sh,article.rn,.cx-regions,article.wh,div[class="hs"],.hs-lesson,article.cp,article.gx'))return;var l=document.createElement('link');l.rel='stylesheet';l.href='{{ $raCSS.RelPermalink }}';document.head.appendChild(l);var s=document.createElement('script');s.src='{{ $raJS.RelPermalink }}';s.defer=true;document.head.appendChild(s)}catch(e){}})();
/* Background music (Teddy Rook's Continued-Fraction Suite): a ♪ button beside Aa, and buttons with data-trb-music="play".
   This stub only loads the player (static/music/suite/player/player.js and .css) when one is pressed, or when trb-music-v1
   says music was playing on the last page (under 30 minutes ago, and not in the pop-out window). Sound never starts by itself
   on a first visit. While the pop-out window plays, the page's own sounds (event trb:sound-start) are passed on to it. */
(function () {
  var K = 'trb-music-v1', P = '{{ "music/suite/player/" | relURL }}', V = '?v={{ with os.Stat "static/music/suite/player/player.js" }}{{ .ModTime.Unix }}{{ end }}', ld = 0, q = [], bc = null;
  function st() { try { return JSON.parse(localStorage.getItem(K) || 'null') || {}; } catch (e) { return {}; } }
  function go(c) {
    if (window.TRBPlayer) return window.TRBPlayer.cmd(c);
    q.push(c); if (ld) return; ld = 1;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = P + 'player.css' + V; document.head.appendChild(l);
    var s = document.createElement('script'); s.src = P + 'player.js' + V;
    s.onload = function () { q.forEach(function (c) { window.TRBPlayer.cmd(c); }); q = []; };
    document.head.appendChild(s);
  }
  window.trbMusic = go;
  var sw = document.querySelector('.logo-switches');
  if (sw) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'trb-mbtn'; b.title = 'Background music';
    b.setAttribute('aria-label', 'Background music'); b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17.5V6l10-2v11.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6.5" cy="17.5" r="2.5" fill="currentColor"/><circle cx="16.5" cy="15.5" r="2.5" fill="currentColor"/></svg>';
    b.addEventListener('click', function (e) { e.stopPropagation(); go('panel'); });
    sw.appendChild(b);
  }
  document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-trb-music]'); if (t) { e.preventDefault(); go(t.getAttribute('data-trb-music')); } });
  var s = st(), n = Date.now(), popOn = function (s) { return s.pop && Date.now() - s.pop < 10000; };
  if (s.playing && n - (s.t || 0) < 18e5 && !popOn(s)) go('resume');
  window.addEventListener('trb:sound-start', function () {
    if (window.TRBPlayer || !window.BroadcastChannel || !popOn(st())) return;
    try { (bc = bc || new BroadcastChannel('trb-music')).postMessage({ t: 'duck' }); } catch (e) { }
  });
})();
    let menu = document.getElementById('menu');
    if (menu) {
        // Set the scroll position
        const scrollPosition = localStorage.getItem("menu-scroll-position");
        if (scrollPosition) {
            menu.scrollLeft = parseInt(scrollPosition, 10);
        }
        
        menu.onscroll = function () {
            localStorage.setItem("menu-scroll-position", menu.scrollLeft);
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            var id = this.getAttribute("href").substr(1);
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.querySelector(`[id='${decodeURIComponent(id)}']`).scrollIntoView({
                    behavior: "smooth"
                });
            } else {
                document.querySelector(`[id='${decodeURIComponent(id)}']`).scrollIntoView();
            }
            if (id === "top") {
                history.replaceState(null, null, " ");
            } else {
                history.pushState(null, null, `#${id}`);
            }
        });
    });

{{- if (not site.Params.disableScrollToTop) }}
    var toplink = document.getElementById("top-link");
    window.onscroll = function () {
        const scrollThreshold = window.innerHeight;
        if (document.body.scrollTop > scrollThreshold || document.documentElement.scrollTop > scrollThreshold) {
            toplink.classList.remove("hidden");
        } else {
            toplink.classList.add("hidden");
        }
    };

{{- end }}
{{- if (not site.Params.disableThemeToggle) }}
    document.getElementById("theme-toggle").addEventListener("click", () => {
        const html = document.querySelector("html");
        if (html.dataset.theme === "dark") {
            html.dataset.theme = 'light';
            localStorage.setItem("pref-theme", 'light');
        } else {
            html.dataset.theme = 'dark';
            localStorage.setItem("pref-theme", 'dark');
        }
    })

{{- end }}
if (document.currentScript && document.currentScript.hasAttribute('data-cc')) {
    document.querySelectorAll('pre > code').forEach((codeblock) => {
        const container = codeblock.parentNode.parentNode;

        const copybutton = document.createElement('button');
        copybutton.classList.add('copy-code');
        copybutton.innerHTML = '{{- i18n "code_copy" | default "copy" }}';

        function copyingDone() {
            copybutton.innerHTML = '{{- i18n "code_copied" | default "copied!" }}';
            setTimeout(() => {
                copybutton.innerHTML = '{{- i18n "code_copy" | default "copy" }}';
            }, 2000);
        }

        copybutton.addEventListener('click', (cb) => {
            if ('clipboard' in navigator) {
                navigator.clipboard.writeText(codeblock.textContent);
                copyingDone();
                return;
            }

            const range = document.createRange();
            range.selectNodeContents(codeblock);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            try {
                document.execCommand('copy');
                copyingDone();
            } catch (e) { };
            selection.removeRange(range);
        });

        if (container.classList.contains("highlight")) {
            container.appendChild(copybutton);
        } else if (container.parentNode.firstChild == container) {
            // td containing LineNos
        } else if (codeblock.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName == "TABLE") {
            // table containing LineNos and code
            codeblock.parentNode.parentNode.parentNode.parentNode.parentNode.appendChild(copybutton);
        } else {
            // code blocks not having highlight as parent class
            codeblock.parentNode.appendChild(copybutton);
        }
    });
}

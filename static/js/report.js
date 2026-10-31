/* "Report a problem": a quiet link that gathers the details of a mistake so the visitor can pass them on. Nothing is sent
   from the page: the visitor copies the details and pastes them in a direct message on X, or (later) in an email.
   No network calls, no tracking, nothing stored.

   THE SETTING  data/report.yaml, put on this script's tag as data-report (layouts/_partials/report/script.html):
     { channel: "x" | "email", x_handle, x_id (optional, the account's number: opens the message box directly), email }
     "email" with no address falls back to X. Switching to email = editing that file and rebuilding.
   WHERE  the footer of every page (.trb-social), a page link on lessons and other pages that teach
     (layouts/_partials/report/link.html: <button data-report="page" data-kind="…">), the embed bar, and every ladder problem
     card (static/math/core/runner.js calls TRB.report.open({ problem: {…} })). Buttons stay hidden (CSS) until this file
     runs, so pages that use the engine without it never show a dead link.
   DETAILS  page title, address (no #hash; query parameters that look personal are dropped), date, phone or computer,
     theme, the section (data-kind), and for a problem: topic id and title, level, seed, mode, question, the answer given
     and the expected answer (only once the card has shown it). Never names, progress, XP or profile data: only the fields
     listed in build() are read, whatever else is passed. A page may add short facts with TRB.reportContext() → { label: value }.

   API  window.TRB.report = { open(ctx), text(), config }
        module.exports = { build(ctx), channel(cfg), xUrl(cfg, text), mailto(cfg, subject, body), subject(ctx), REASONS,
                           device(screenW, screenH), cleanUrl(href) }        (Node tests: scripts/report/test-report.js) */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  try { api.ui(root, root.document); } catch (e) { if (root.console) root.console.error(e); }
})(this, function () {
  'use strict';
  var REASONS = [['wrong', 'Wrong answer'], ['wording', 'Confusing wording'], ['typo', 'Typo'], ['broken', 'Broken page'], ['other', 'Other']];
  var MAX = { note: 800, q: 700, ans: 200, title: 160, extra: 120 };
  var BAD_KEY = /name|learner|kid|child|student|profile|progress|xp|streak|score|email|user|age|pid/i;

  function str(v, max) {
    v = v == null ? '' : String(v);
    v = v.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    v = v.replace(/[ \t\r\f\v]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
    if (max && v.length > max) v = v.slice(0, max - 1) + '…';
    return v;
  }
  function reasonLabel(k) { for (var i = 0; i < REASONS.length; i++) if (REASONS[i][0] === k) return REASONS[i][1]; return ''; }
  function device(w, h) { w = +w || 0; h = +h || 0; var m = Math.min(w || h, h || w); return m && m < 600 ? 'phone' : 'computer'; }
  function cleanUrl(href) {
    href = String(href || '');
    try {
      var u = new URL(href);
      var keep = [];
      u.searchParams.forEach(function (v, k) { if (!BAD_KEY.test(k)) keep.push([k, v]); });
      var q = keep.map(function (p) { return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]); }).join('&');
      return u.origin + u.pathname + (q ? '?' + q : '');
    } catch (e) { return href.split('#')[0].split('?')[0]; }
  }
  function isoDate(d) { d = d instanceof Date ? d : new Date(+d || Date.now()); function p(n) { return (n < 10 ? '0' : '') + n; } return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }

  /* The text the visitor copies. Only these fields are read. */
  function build(c) {
    c = c || {};
    var L = ['Problem report for Teddy Rook Book'];
    L.push('What’s wrong: ' + (reasonLabel(c.reason) || '(not chosen)'));
    var note = str(c.note, MAX.note); if (note) L.push('Note: ' + note);
    L.push('');
    L.push('Page: ' + (str(c.title, MAX.title) || '(no title)'));
    L.push('Address: ' + cleanUrl(c.url));
    if (c.kind) L.push('Section: ' + str(c.kind, 60));
    L.push('Date: ' + (c.date ? str(c.date, 20) : isoDate()));
    L.push('Device: ' + (c.device === 'phone' ? 'phone' : 'computer') + ' · Theme: ' + (c.theme === 'dark' ? 'dark' : 'light') + (c.embed ? ' · Embedded' : ''));
    var x = c.extra;
    if (x && typeof x === 'object') Object.keys(x).slice(0, 6).forEach(function (k) {
      if (BAD_KEY.test(k)) return; var v = x[k]; if (v == null || typeof v === 'object') return;
      v = str(v, MAX.extra); if (v) L.push(str(k, 40) + ': ' + v);
    });
    var p = c.problem;
    if (p && typeof p === 'object') {
      L.push('');
      var id = str(p.topic, 80), tt = str(p.topicTitle, MAX.title);
      L.push('Topic: ' + (id || '(unknown)') + (tt ? ' (' + tt + ')' : ''));
      var bits = [];
      if (p.level != null && p.level !== '') bits.push('Level: ' + str(p.level, 4));
      if (p.seed != null && p.seed !== '') bits.push('Seed: ' + str(p.seed, 40));
      if (p.mode) bits.push('Mode: ' + str(p.mode, 12));
      if (bits.length) L.push(bits.join(' · '));
      var q = str(p.question, MAX.q); if (q) L.push('Question: ' + q);
      L.push('Answer given: ' + (p.answered ? (str(p.given, MAX.ans) || '(blank)') : '(not answered yet)'));
      var ex = str(p.expected, MAX.ans); if (p.answered && ex) L.push('Expected answer: ' + ex);
    }
    return L.join('\n');
  }
  function subject(c) { c = c || {}; return 'Problem report: ' + (reasonLabel(c.reason) || 'Teddy Rook Book') + (c.title ? ' · ' + str(c.title, 80) : ''); }
  function validEmail(e) { return /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i.test(String(e || '')); }
  function channel(cfg) {
    cfg = cfg || {};
    if (String(cfg.channel || '').toLowerCase() === 'email' && validEmail(cfg.email)) return 'email';
    return 'x';
  }
  function handle(cfg) { return String((cfg && cfg.x_handle) || 'teddyrookbook').replace(/^@/, '').replace(/[^A-Za-z0-9_]/g, '') || 'teddyrookbook'; }
  function xUrl(cfg, text) {
    var id = String((cfg && cfg.x_id) || '').replace(/\D/g, '');
    if (id) return 'https://x.com/messages/compose?recipient_id=' + id + (text ? '&text=' + encodeURIComponent(String(text).slice(0, 1500)) : '');
    return 'https://x.com/' + handle(cfg);
  }
  function mailto(cfg, subj, body) {
    body = String(body || ''); if (body.length > 1800) body = body.slice(0, 1799) + '…';
    return 'mailto:' + String(cfg.email).trim() + '?subject=' + encodeURIComponent(subj || '') + '&body=' + encodeURIComponent(body);
  }

  /* ---------------- the page ---------------- */
  function ui(W, D) {
    var me = D.currentScript || D.querySelector('script[data-report]');
    var cfg = { channel: 'x', x_handle: 'teddyrookbook', x_id: '', email: '' };
    try { var raw = me && me.getAttribute('data-report'); if (raw) { var o = JSON.parse(raw); if (o && typeof o === 'object') for (var k in o) cfg[k] = o[k]; } } catch (e) { }
    var ch = channel(cfg), embed = /\/embed\//.test(W.location.pathname) || D.documentElement.hasAttribute('data-embed');
    var dlg = null, cur = null, lastFocus = null, els = {};

    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function theme() {
      var t = D.documentElement.getAttribute('data-theme') || (D.body && D.body.classList.contains('dark') ? 'dark' : '');
      if (t === 'dark' || t === 'light') return t;
      try { return W.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) { return 'light'; }
    }
    function pageTitle() {
      var h = D.querySelector('main h1, .main h1, .emb-main h1, h1');
      var t = String(D.title || '').replace(/\s*[|·–-]\s*Teddy Rook Book\s*$/, '');
      return t || (h ? h.textContent : '');
    }
    function ctx() {
      var c = { reason: '', note: '', title: pageTitle(), url: W.location.href, date: isoDate(), device: device(W.screen && W.screen.width, W.screen && W.screen.height), theme: theme(), embed: embed, kind: cur && cur.kind || '', problem: cur && cur.problem || null, extra: null };
      try { if (typeof (W.TRB && W.TRB.reportContext) === 'function') c.extra = W.TRB.reportContext(); } catch (e) { }
      if (dlg) {
        var r = dlg.querySelector('input[name="trb-rp-why"]:checked'); c.reason = r ? r.value : '';
        c.note = els.note.value;
      }
      return c;
    }
    function style() {
      if (D.getElementById('trb-rp-css')) return;
      var s = D.createElement('style'); s.id = 'trb-rp-css';
      s.textContent =
        'html.trb-report-on .trb-report-row,html.trb-report-on .mlp-report-row{display:flex}html.trb-report-on .trb-report{display:inline-flex}' +
        '.trb-report-row{justify-content:flex-end;margin:1.2rem 0 .4rem}.mlp-report-row{justify-content:flex-end;margin:.5rem 0 0}' +
        '.trb-report{font:inherit;font-size:.82rem;background:none;border:0;padding:.2rem .35rem;margin:0;color:var(--secondary,var(--e-muted,#5d6862));cursor:pointer;text-decoration:underline;text-decoration-color:rgba(127,127,127,.5);text-underline-offset:2px;border-radius:5px;align-items:center;gap:.3rem}' +
        '.trb-report:hover{color:var(--primary,var(--e-ink,#1d2320))}.trb-report:focus-visible{outline:2px solid #b8963e;outline-offset:2px}' +
        '.trb-report svg{width:.95em;height:.95em;flex:none}' +
        '.trb-social .trb-report{font-size:inherit;padding:0;text-decoration:none}' +
        '.emb-foot .trb-report{color:var(--e-bar-ink,#f3ead2);font-size:11px;padding:0 .2rem;text-decoration:underline}' +
        '.trb-rp{width:min(560px,calc(100vw - 24px));max-height:calc(100dvh - 24px);box-sizing:border-box;margin:auto;padding:0;border:1px solid var(--rp-line);border-radius:14px;background:var(--rp-bg);color:var(--rp-ink);box-shadow:0 20px 50px rgba(0,0,0,.3);font:15px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
        '--rp-bg:#fff;--rp-ink:#1d2320;--rp-muted:#5d6862;--rp-line:#cfdcd4;--rp-soft:#f3f6f4;--rp-g:#004225;--rp-gt:#fff;--rp-a:#00562f}' +
        '[data-theme=dark] .trb-rp{--rp-bg:#12261b;--rp-ink:#e6ece8;--rp-muted:#a9b8af;--rp-line:#2f4c3c;--rp-soft:#0b1a13;--rp-g:#6cc79a;--rp-gt:#0b1a13;--rp-a:#6cc79a}' +
        '.trb-rp::backdrop{background:rgba(5,15,10,.55)}' +
        '.trb-rp form{display:block;margin:0;padding:1rem 1.1rem 1.1rem;overflow:auto;max-height:calc(100dvh - 26px);box-sizing:border-box}' +
        '.trb-rp h2{margin:0 0 .2rem;font-size:1.2rem;line-height:1.3;color:var(--rp-ink)}' +
        '.trb-rp .rp-sub{margin:0 0 .7rem;color:var(--rp-muted);font-size:.88rem}' +
        '.trb-rp fieldset{border:0;margin:0 0 .7rem;padding:0;min-width:0}.trb-rp legend{font-weight:700;padding:0;margin:0 0 .35rem}' +
        '.trb-rp .rp-why{display:flex;flex-wrap:wrap;gap:.35rem}' +
        '.trb-rp .rp-why label{display:inline-flex;align-items:center;gap:.35rem;border:1.5px solid var(--rp-line);border-radius:999px;padding:.25rem .7rem .25rem .5rem;cursor:pointer;font-size:.9rem}' +
        '.trb-rp .rp-why label:has(input:checked){border-color:var(--rp-a);background:var(--rp-soft)}' +
        '.trb-rp .rp-why input{accent-color:var(--rp-a);margin:0}' +
        '.trb-rp .rp-lab{display:block;font-weight:700;margin:0 0 .3rem}.trb-rp .rp-lab small{font-weight:400;color:var(--rp-muted)}' +
        '.trb-rp textarea{display:block;width:100%;box-sizing:border-box;font:inherit;font-size:.92rem;color:var(--rp-ink);background:var(--rp-soft);border:1.5px solid var(--rp-line);border-radius:9px;padding:.45rem .55rem;margin:0 0 .7rem;resize:vertical}' +
        '.trb-rp textarea:focus-visible,.trb-rp input:focus-visible,.trb-rp .rp-btn:focus-visible{outline:2px solid #b8963e;outline-offset:2px}' +
        '.trb-rp .rp-out{font:12.5px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;min-height:8.5em;white-space:pre-wrap}' +
        '.trb-rp .rp-acts{display:flex;flex-wrap:wrap;gap:.45rem;margin:.1rem 0 .5rem}' +
        '.trb-rp .rp-btn{font:inherit;font-size:.92rem;font-weight:600;display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:.35rem .95rem;border-radius:999px;border:1.5px solid var(--rp-line);background:transparent;color:var(--rp-ink);cursor:pointer;text-decoration:none;box-shadow:none;box-sizing:border-box}' +
        '.trb-rp .rp-btn:hover{border-color:var(--rp-a)}.trb-rp .rp-btn.pri{background:var(--rp-g);border-color:var(--rp-g);color:var(--rp-gt)}' +
        '.trb-rp .rp-close{margin-left:auto}' +
        '.trb-rp .rp-help,.trb-rp .rp-priv{margin:.2rem 0 0;font-size:.85rem;color:var(--rp-muted)}.trb-rp .rp-help b{color:var(--rp-ink)}' +
        '.trb-rp .rp-stat{margin:.2rem 0 0;font-size:.88rem;font-weight:600;color:var(--rp-a);min-height:1.2em}' +
        '@media (max-width:420px){.trb-rp form{padding:.85rem .8rem .9rem}.trb-rp .rp-btn{flex:1 1 auto}.trb-rp .rp-close{margin-left:0}}' +
        '@media print{.trb-report-row,.mlp-report-row,.trb-social .trb-report,.trb-rp{display:none !important}}';
      (D.head || D.documentElement).appendChild(s);
    }
    function make() {
      if (dlg) return dlg;
      dlg = D.createElement('dialog'); dlg.className = 'trb-rp'; dlg.setAttribute('aria-labelledby', 'trb-rp-h');
      var xhelp = String(cfg.x_id || '').replace(/\D/g, '') ? 'Opens a message to <b>@' + esc(handle(cfg)) + '</b> on X in a new tab, with the details filled in.'
        : 'Opens <b>@' + esc(handle(cfg)) + '</b> on X in a new tab. Send a direct message and paste.';
      var open = ch === 'email' ? '<a class="rp-btn rp-go" href="#" target="' + (embed ? '_blank' : '_self') + '">Open email</a>'
        : '<a class="rp-btn rp-go" href="' + esc(xUrl(cfg)) + '" target="_blank" rel="noopener">Open X messages</a>';
      var help = ch === 'email' ? 'Opens your email app with a message to <b>' + esc(cfg.email) + '</b>, the details filled in.' : xhelp;
      dlg.innerHTML = '<form method="dialog" novalidate>' +
        '<h2 id="trb-rp-h">Report a problem</h2>' +
        '<p class="rp-sub" id="trb-rp-sub">Thank you for spotting it. Pick what’s wrong, then copy the details.</p>' +
        '<fieldset><legend>What’s wrong?</legend><div class="rp-why">' +
        REASONS.map(function (r) { return '<label><input type="radio" name="trb-rp-why" value="' + r[0] + '"> ' + r[1] + '</label>'; }).join('') + '</div></fieldset>' +
        '<label class="rp-lab" for="trb-rp-note">A note <small>(optional)</small></label>' +
        '<textarea id="trb-rp-note" rows="2" maxlength="' + MAX.note + '" placeholder="What did you expect to see?"></textarea>' +
        '<label class="rp-lab" for="trb-rp-out">The details <small>(you can edit them)</small></label>' +
        '<textarea id="trb-rp-out" class="rp-out" rows="9" spellcheck="false"></textarea>' +
        '<div class="rp-acts"><button type="button" class="rp-btn pri rp-copy">Copy details</button>' + open + '<button type="button" class="rp-btn rp-close">Close</button></div>' +
        '<p class="rp-stat" role="status" aria-live="polite"></p>' +
        '<p class="rp-help">' + help + '</p>' +
        '<p class="rp-priv">Nothing is sent from this page. You choose what to share.</p>' +
        '</form>';
      (D.body || D.documentElement).appendChild(dlg);
      els.note = dlg.querySelector('#trb-rp-note'); els.out = dlg.querySelector('#trb-rp-out'); els.stat = dlg.querySelector('.rp-stat'); els.go = dlg.querySelector('.rp-go');
      var edited = false;
      function refresh() { if (!edited) els.out.value = build(ctx()); link(); }
      dlg.addEventListener('change', function (e) { if (e.target.name === 'trb-rp-why') refresh(); });
      els.note.addEventListener('input', refresh);
      els.out.addEventListener('input', function () { edited = true; link(); });
      dlg._reset = function () { edited = false; };
      dlg._refresh = refresh;
      dlg.querySelector('.rp-copy').addEventListener('click', function () { copy(); });
      dlg.querySelector('.rp-close').addEventListener('click', close);
      els.go.addEventListener('click', function () { copy(true); });
      dlg.addEventListener('close', function () { if (lastFocus && lastFocus.focus && D.contains(lastFocus)) try { lastFocus.focus({ preventScroll: true }); } catch (e) { } });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); }); // a click on the backdrop
      return dlg;
    }
    function link() {
      if (!els.go) return;
      if (ch === 'email') els.go.href = mailto(cfg, subject(ctx()), els.out.value);
      else els.go.href = xUrl(cfg, els.out.value);
    }
    function say(t) { els.stat.textContent = ''; setTimeout(function () { els.stat.textContent = t; }, 30); }
    function selectAll() { try { els.out.focus({ preventScroll: true }); els.out.select(); els.out.setSelectionRange(0, els.out.value.length); } catch (e) { } }
    function oldCopy() {
      var ok = false;
      try { var a = D.activeElement; selectAll(); ok = D.execCommand && D.execCommand('copy'); if (a && a !== els.out && a.focus) a.focus({ preventScroll: true }); } catch (e) { ok = false; }
      return !!ok;
    }
    function copy(going) {
      var text = els.out.value, done = function (ok) {
        if (ok) say(going ? 'Copied. Paste the details in your message.' : 'Copied. ' + (ch === 'email' ? 'Paste them in an email, or use “Open email”.' : 'Paste them in a direct message to @' + handle(cfg) + '.'));
        else { selectAll(); say('This page can’t reach the clipboard. The details are selected: press Ctrl+C (⌘+C on a Mac), or long-press and choose Copy.'); }
      };
      if (W.navigator && W.navigator.clipboard && W.navigator.clipboard.writeText && W.isSecureContext !== false) {
        W.navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(oldCopy()); });
      } else done(oldCopy());
    }
    function close() { if (!dlg) return; if (dlg.close && dlg.open) dlg.close(); else { dlg.removeAttribute('open'); if (lastFocus && lastFocus.focus) lastFocus.focus(); } }
    function open(c) {
      style(); make();
      cur = c || {}; lastFocus = D.activeElement;
      dlg.querySelectorAll('input[name="trb-rp-why"]').forEach(function (r) { r.checked = false; });
      els.note.value = ''; els.stat.textContent = ''; dlg._reset();
      D.getElementById('trb-rp-sub').textContent = cur.problem ? 'Thank you for spotting it. The details of this problem are filled in below. Pick what’s wrong, then copy them.' : 'Thank you for spotting it. Pick what’s wrong, then copy the details.';
      dlg._refresh();
      if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
      var first = dlg.querySelector('input[name="trb-rp-why"]'); if (first) try { first.focus(); } catch (e) { }
    }

    var T = W.TRB = W.TRB || {};
    T.report = { open: open, text: function () { return els.out ? els.out.value : build(ctx()); }, config: cfg, channel: ch };
    style();
    D.documentElement.classList.add('trb-report-on');
    function reveal() { [].forEach.call(D.querySelectorAll('.trb-report-row[hidden], .trb-report[data-report][hidden]'), function (e) { e.hidden = false; }); }
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', reveal); else reveal();
    // every [data-report] button on the page (page links, the footer, the embed bar)
    D.addEventListener('click', function (e) {
      var b = e.target && e.target.closest && e.target.closest('[data-report]:not(script)');
      if (!b) return; e.preventDefault();
      open({ kind: b.getAttribute('data-kind') || '' });
    });
  }

  return { build: build, channel: channel, xUrl: xUrl, mailto: mailto, subject: subject, REASONS: REASONS, device: device, cleanUrl: cleanUrl, ui: ui, _str: str };
});

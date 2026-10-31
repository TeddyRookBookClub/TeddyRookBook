/* Learner profiles: the header chip and its menu, the add/edit dialog, files and save codes.
   Loaded by profiles.js only when profiles are in use (or on /progress/). Nothing here talks to a server.
   window.TRBProfilesUI = { openAdd, openEdit(id), switchTo(id), saveFile(ids, family), openFile(), openRestore(), previewRestore(obj), copyCode(id),
                            loadCode(text) → Promise, toast(text), onChange(fn) } */
(function (W, D) {
  'use strict';
  var PF = W.TRBProfiles; if (!PF || W.TRBProfilesUI) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fv(f, n) { return f.elements.namedItem(n); }
  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var subs = [];
  function changed() { subs.forEach(function (f) { try { f(); } catch (e) { } }); render(); }
  var FULL = 'There isn’t room left in this browser’s storage. Save a learner to a file, delete one you no longer need here, and try again.';
  function why(r) { return !r || r.ok ? '' : r.why === 'full' ? FULL : r.why === 'name' ? 'Please type a name.' : r.why === 'many' ? 'Twelve learners is the most one browser can hold.' : r.why === 'damaged' ? 'The list of learners in this browser can’t be read. See My Progress.' : r.why === 'file' ? 'That isn’t a Teddy Rook Book learner file.' : 'Something went wrong. Nothing was changed.'; }

  var css = el('style', null, '' +
    '.trb-pf{position:relative;display:inline-flex;margin-left:.45rem}' +
    '.trb-pf-btn{display:inline-flex;align-items:center;gap:.3rem;max-width:11rem;background:rgba(255,255,255,.1);border:1px solid rgba(243,234,210,.35);color:#f3ead2;border-radius:999px;padding:3px 9px 3px 6px;font:600 13.5px/1.2 system-ui,sans-serif;cursor:pointer}' +
    '.trb-pf-btn:hover{background:rgba(255,255,255,.18)}.trb-pf-btn:focus-visible,.trb-pf-menu [role=menuitem]:focus-visible,.trb-pf-dlg :focus-visible{outline:2px solid #d8b860;outline-offset:2px}' +
    '.trb-pf-btn .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.trb-pf-btn svg{flex:none}' +
    '.trb-pf-menu{position:absolute;right:0;top:calc(100% + 8px);z-index:950;min-width:250px;max-width:min(320px,calc(100vw - 16px));max-height:calc(100vh - 90px);overflow:auto;background:var(--entry);color:var(--primary);border:1px solid var(--border);border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.22);padding:.35rem;font:14.5px/1.3 system-ui,sans-serif;text-align:left}' +
    '.trb-pf-menu[hidden]{display:none}.trb-pf-menu p{margin:.3rem .55rem .25rem;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--secondary)}' +
    '.trb-pf-menu [role=menuitem],.trb-pf-menu [role=menuitemradio]{display:flex;align-items:center;gap:.5rem;width:100%;background:none;border:0;border-radius:8px;padding:.48rem .6rem;color:var(--primary);font:inherit;text-align:left;cursor:pointer;text-decoration:none;box-shadow:none}' +
    '.trb-pf-menu [role=menuitem]:hover,.trb-pf-menu [role=menuitemradio]:hover,.trb-pf-menu [role=menuitem]:focus,.trb-pf-menu [role=menuitemradio]:focus{background:var(--tertiary);outline:none}' +
    '.trb-pf-menu [aria-checked=true]{font-weight:700}.trb-pf-menu [aria-checked=true]::after{content:"✓";margin-left:auto;color:#00562f}[data-theme=dark] .trb-pf-menu [aria-checked=true]::after{color:#6cc79a}' +
    'header.header .trb-pf-menu a[role=menuitem]{color:var(--primary)}.trb-pf-menu hr{border:0;border-top:1px solid var(--border);margin:.3rem .2rem}.trb-pf-menu .ic{width:1.3em;text-align:center;flex:none}' +
    '@media (max-width:520px){.trb-pf{position:static;margin-left:1px}.trb-pf-btn{width:26px;height:26px;padding:0;justify-content:center;font-size:14px}.trb-pf-btn .n,.trb-pf-btn svg{display:none}.trb-pf-menu{position:fixed;left:8px;right:8px;top:64px;max-width:none;min-width:0}html.trb-pf-on .logo{height:auto;min-height:var(--header-height,60px)}html.trb-pf-on .logo-switches{line-height:1;min-height:44px;align-items:center}}' +
    '.trb-pf-ov{position:fixed;inset:0;z-index:1000;background:rgba(5,15,10,.55);display:flex;align-items:flex-start;justify-content:center;padding:8vh 12px 12px;overflow:auto}.trb-pf-ov[hidden]{display:none}' +
    '.trb-pf-dlg{width:min(440px,100%);background:var(--theme);color:var(--primary);border:1px solid var(--border);border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.3);padding:1rem 1.1rem;font:15px/1.45 system-ui,sans-serif}' +
    '.trb-pf-dlg h2{font:700 1.25rem Georgia,serif;color:#004225;margin:0 0 .6rem}[data-theme=dark] .trb-pf-dlg h2{color:#6cc79a}' +
    '.trb-pf-dlg label.f{display:block;margin:.5rem 0}.trb-pf-dlg label.f span{display:block;font-weight:600;font-size:.9rem;margin-bottom:.2rem}' +
    '.trb-pf-dlg input[type=text],.trb-pf-dlg textarea{width:100%;box-sizing:border-box;font:inherit;padding:.45rem .6rem;border:1px solid var(--border);border-radius:9px;background:var(--entry);color:var(--primary)}' +
    '.trb-pf-dlg textarea{font:12px/1.35 ui-monospace,monospace;word-break:break-all}' +
    '.trb-pf-dlg fieldset{border:0;padding:0;margin:.5rem 0}.trb-pf-dlg legend{font-weight:600;font-size:.9rem;padding:0;margin-bottom:.25rem}' +
    '.trb-pf-icons{display:flex;flex-wrap:wrap;gap:.3rem}.trb-pf-icons label{position:relative}.trb-pf-icons input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}' +
    '.trb-pf-icons span{display:grid;place-items:center;width:2.2rem;height:2.2rem;border:1.5px solid var(--border);border-radius:9px;font-size:1.25rem;background:var(--entry)}' +
    '.trb-pf-icons input:checked+span{border-color:#00562f;box-shadow:0 0 0 2px #00562f inset}.trb-pf-icons input:focus-visible+span{outline:2px solid #d8b860;outline-offset:2px}' +
    '[data-theme=dark] .trb-pf-icons input:checked+span{border-color:#6cc79a;box-shadow:0 0 0 2px #6cc79a inset}' +
    '.trb-pf-rl{margin:.2rem 0 .5rem;padding-left:1.1rem;line-height:1.6}.trb-pf-rl .note{font-size:.85rem}' +
    '.trb-pf-dlg .chk{display:flex;gap:.45rem;align-items:center;margin:.6rem 0}.trb-pf-dlg .note{font-size:.85rem;color:var(--secondary);margin:.3rem 0}' +
    '.trb-pf-btns{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.8rem}.trb-pf-btns button{font:inherit;font-size:.92rem;padding:.42rem .9rem;border-radius:9px;border:1px solid var(--border);background:var(--entry);color:var(--primary);cursor:pointer}' +
    '.trb-pf-btns .pri{background:#004225;border-color:#004225;color:#fff;font-weight:600}.trb-pf-btns .del{margin-left:auto;color:#a3352a;border-color:#d9a79f}[data-theme=dark] .trb-pf-btns .del{color:#f0a49a;border-color:#7a3a33}' +
    '.trb-pf-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:1100;max-width:min(520px,calc(100vw - 24px));background:#004225;color:#fff;border-radius:10px;padding:.6rem .9rem;font:14px/1.4 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)}.trb-pf-toast[hidden]{display:none}' +
    '@media print{.trb-pf,.trb-pf-toast{display:none}}');
  D.head.appendChild(css);

  // ---------- toast ----------
  var toastEl = null, toastT = 0;
  function toast(t) {
    if (!D.body) return;
    if (!toastEl) { toastEl = el('div', 'trb-pf-toast'); toastEl.setAttribute('role', 'status'); toastEl.hidden = true; D.body.appendChild(toastEl); }
    toastEl.textContent = t; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { toastEl.hidden = true; }, 6000);
  }

  // ---------- switching ----------
  function switchTo(id) {
    var r = PF.requestSwitch(id); if (!r.ok) { toast(why(r)); return; }
    if (r.same) return;
    var p = PF.get(id); try { W.sessionStorage.setItem('trb-profiles-hi', p ? p.name : ''); } catch (e) { }
    W.location.reload();
  }

  // ---------- files and codes ----------
  function slug(s) { return String(s || 'learner').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'learner'; }
  function download(name, text) {
    var a = D.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name;
    D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function saveFile(ids, family) {
    var o = PF.exportData(ids, !!family), one = ids && ids.length === 1 ? PF.get(ids[0]) : null;
    if (!o.profiles.length) return;
    download(one ? 'teddy-rook-' + slug(one.name) + '.json' : 'teddy-rook-family-' + o.saved.slice(0, 10) + '.json', JSON.stringify(o));
    toast(one ? 'Saved ' + one.name + ' to a file.' : 'Saved ' + o.profiles.length + ' learner' + (o.profiles.length === 1 ? '' : 's') + ' to one file.');
    if (family && W.TRB && W.TRB.backupSaved) W.TRB.backupSaved(); // a family file is a backup: the reminder count starts again
  }

  // ---------- restore from a backup file: show what is in it, then add its learners or replace everything ----------
  var KEEP = ['trb-fs', 'trb-units', 'trb-backup-v1']; // device settings that "Replace everything" leaves alone
  var PLAN_NAMES = { 'trb-planner-v1': 'the lesson planner', 'trb-family-v1': 'Family Study', 'trb-meals-v1': 'the meal planner', 'trb-garden-v1': 'the garden planner' };
  // any Teddy Rook Book file → the family-file shape (an older one-learner progress file keeps its planner and plans too)
  function asFamily(o, name) {
    if (!o || o.site !== 'teddyrookbook.com') return null;
    if (o.kind === 'trb-profiles' && Array.isArray(o.profiles)) return o;
    if (!o.data || typeof o.data !== 'object') return null;
    var data = {}, shared = {};
    for (var k in o.data) if (Object.prototype.hasOwnProperty.call(o.data, k) && typeof o.data[k] === 'string') {
      if (PF.isProfileKey(k)) data[k] = o.data[k]; else if (k.indexOf('trb-') === 0 && k !== PF.REG && k !== 'trb-backup-v1') shared[k] = o.data[k];
    }
    return { site: o.site, kind: 'trb-profiles', v: 1, saved: o.saved, profiles: [{ name: name || 'Me', age: '', icon: '', data: data }], shared: shared, old: true };
  }
  function day(iso) { var d = new Date(iso); return isNaN(d) ? 'an unknown date' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); }
  function wipe() { // everything but the device settings; returns what was there, to put back if the restore fails
    var back = {}, ks = [];
    try { for (var i = 0; i < W.localStorage.length; i++) ks.push(W.localStorage.key(i)); } catch (e) { }
    ks.forEach(function (k) { if (k && (k.indexOf('trb-') === 0 || PF.isProfileKey(k)) && KEEP.indexOf(k) < 0) { try { back[k] = W.localStorage.getItem(k); W.localStorage.removeItem(k); } catch (e) { } } });
    return back;
  }
  function unwipe(back) { wipe(); for (var k in back) if (back[k] != null) { try { W.localStorage.setItem(k, back[k]); } catch (e) { } } }
  function restore(o, mode, withShared) {
    var fresh = !PF.on() && !PF.hasProgress(), back = null;
    if (mode === 'replace') { back = wipe(); fresh = true; }
    var r = PF.importData(o, { replace: function () { return false; }, shared: function () { return !!withShared; }, firstName: 'Me' });
    if (!r.ok) { if (back) unwipe(back); return r; }
    // a browser with no work of its own: drop the empty "Me" that the first import made, so the file's first learner is active
    var first = PF.list()[0];
    if (fresh && first && first.id === 'p1' && PF.list().length > 1) PF.remove('p1');
    if (W.TRB && W.TRB.backupSaved) W.TRB.backupSaved(Math.min(Date.now(), Date.parse(o.saved) || Date.now()));
    r.reload = true; return r;
  }
  function previewRestore(raw) {
    var o = raw && raw.site === 'teddyrookbook.com' ? raw : null, fam = asFamily(o, 'Me');
    if (!fam || !fam.profiles.length) { toast(why({ ok: false, why: 'file' })); return; }
    var plans = Object.keys(fam.shared || {}).filter(function (k) { return PLAN_NAMES[k]; });
    var here = plans.filter(function (k) { try { return W.localStorage.getItem(k) != null; } catch (e) { return false; } });
    var rows = fam.profiles.map(function (p) {
      var n = p && p.data && typeof p.data === 'object' ? Object.keys(p.data).filter(PF.isProfileKey).length : 0;
      return '<li><span aria-hidden="true">' + esc(p.icon || '🙂') + '</span> <b>' + esc(PF.label({ name: String(p.name || 'Learner').slice(0, 30), age: p.age })) + '</b> <span class="note">(' + (n ? n + ' saved item' + (n === 1 ? '' : 's') : 'no progress yet') + ')</span></li>';
    }).join('');
    var body = '<p class="note">This file was saved on <b>' + esc(day(fam.saved)) + '</b>. Nothing in this browser changes until you choose below.</p>' +
      (fam.old ? '<label class="f"><span>An older file for one learner. Name for this learner</span><input type="text" name="nm" maxlength="30" value="Me" autocomplete="off"></label>' : '<p style="margin:.4rem 0 .2rem"><b>Learners in the file</b></p>') +
      '<ul class="trb-pf-rl">' + rows + '</ul>' +
      (plans.length ? '<p class="note">It also holds ' + plans.map(function (k) { return PLAN_NAMES[k]; }).join(', ') + '.</p>' +
        '<label class="chk"><input type="checkbox" name="sh"' + (here.length ? '' : ' checked') + '> When adding, load those too' + (here.length ? ' (they replace the ones here)' : '') + '</label>' : '') +
      '<p class="note"><b>Add these learners</b> keeps everyone already here and adds the learners from the file. <b>Replace everything</b> clears this browser’s progress first and puts back exactly what is in the file.</p>';
    function nameIt(f) { if (fam.old) { var v = fv(f, 'nm').value.trim() || 'Me'; fam.profiles[0].name = v; } }
    function finish(r) {
      if (!r.ok) { toast(why(r)); return; }
      closeDlg(); var n = r.added.length;
      toast('Restored ' + n + ' learner' + (n === 1 ? '' : 's') + (r.shared ? ' and the plans' : '') + '. Reloading…');
      setTimeout(function () { W.location.reload(); }, 900);
    }
    dialog('Restore from a backup file', body, [
      ['Add these learners', 'pri', function (f) { nameIt(f); var sh = f.querySelector('input[name=sh]'); finish(restore(fam, 'add', sh && sh.checked)); }],
      ['Replace everything', 'del', function (f) {
        nameIt(f);
        if (!W.confirm('Replace everything in this browser with the file? All progress here now, for every learner, and the planner and household plans are removed first. This can’t be undone. (Save a backup of this browser first if you might want it.)')) return;
        finish(restore(fam, 'replace', true));
      }],
      ['Cancel']]);
  }
  var rpicker = null;
  function openRestore() {
    if (!rpicker) {
      rpicker = el('input'); rpicker.type = 'file'; rpicker.accept = '.json,application/json'; rpicker.hidden = true; D.body.appendChild(rpicker);
      rpicker.addEventListener('change', function () {
        var f = rpicker.files[0]; if (!f) return;
        f.text().then(function (t) { var o = null; try { o = JSON.parse(t); } catch (e) { } previewRestore(o); })
          .catch(function () { toast('That file couldn’t be read.'); }).then(function () { rpicker.value = ''; });
      });
    }
    rpicker.click();
  }
  function importObj(o) {
    var act = PF.active(), many = o && o.kind === 'trb-profiles' && Array.isArray(o.profiles) ? o.profiles.length : 1;
    var opt = {
      replace: function (name) { return W.confirm('“' + name + '” is already here. Replace ' + name + '’s progress in this browser with the one in the file?\n\nChoose Cancel to add the file as a separate learner.'); },
      shared: function () { return W.confirm('The file also holds the lesson planner and the household plans (meals, garden). Load those too? They replace the ones in this browser.'); }
    };
    if (o && o.site === 'teddyrookbook.com' && o.kind !== 'trb-profiles') {
      var nm = W.prompt('This is a progress file. What name should the learner in it have?', 'Learner'); if (nm == null) return { ok: false, why: 'cancel' };
      opt.name = nm;
    }
    if (!PF.on() && many) opt.firstName = 'Me';
    var r = PF.importData(o, opt); if (!r.ok) return r;
    var mine = act && r.replaced.some(function (n) { return n.toLowerCase() === act.name.toLowerCase(); });
    toast((r.added.length ? 'Added ' + r.added.join(', ') + '. ' : '') + (r.replaced.length ? 'Replaced ' + r.replaced.join(', ') + '. ' : '') + (r.shared ? 'Loaded the planner and household plans.' : ''));
    if (mine || r.shared) setTimeout(function () { W.location.reload(); }, 900); else changed();
    return r;
  }
  var picker = null;
  function openFile() {
    if (!picker) {
      picker = el('input'); picker.type = 'file'; picker.accept = '.json,application/json'; picker.hidden = true; D.body.appendChild(picker);
      picker.addEventListener('change', function () {
        var f = picker.files[0]; if (!f) return;
        f.text().then(function (t) { var o; try { o = JSON.parse(t); } catch (e) { o = null; } var r = importObj(o); if (!r.ok && r.why !== 'cancel') toast(why(r)); })
          .catch(function () { toast('That file couldn’t be read.'); }).then(function () { picker.value = ''; });
      });
    }
    picker.click();
  }
  function b64u(bytes) { var s = ''; for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(str) { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; var s = atob(str), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
  function pipe(bytes, T) { return new Response(new Blob([bytes]).stream().pipeThrough(T)).arrayBuffer().then(function (ab) { return new Uint8Array(ab); }); }
  var ZIP = typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';
  function makeCode(id) {
    var bytes = new TextEncoder().encode(JSON.stringify(PF.exportData([id])));
    return (ZIP ? pipe(bytes, new CompressionStream('deflate-raw')).then(function (b) { return 'TRB1.' + b64u(b); }) : Promise.resolve('TRB0.' + b64u(bytes)));
  }
  function loadCode(text) {
    var code = String(text || '').replace(/\s+/g, ''), m = /^TRB([01])\.([A-Za-z0-9_-]+)$/.exec(code);
    if (!m) return Promise.resolve({ ok: false, msg: 'That doesn’t look like a learner save code. It starts with TRB1.' });
    var bytes; try { bytes = unb64u(m[2]); } catch (e) { return Promise.resolve({ ok: false, msg: 'That code has characters that don’t belong in it. Check that you copied all of it.' }); }
    var p = m[1] === '1' ? (ZIP ? pipe(bytes, new DecompressionStream('deflate-raw')) : Promise.reject(new Error('nozip'))) : Promise.resolve(bytes);
    return p.then(function (b) { var r = importObj(JSON.parse(new TextDecoder().decode(b))); return r.ok ? r : { ok: false, msg: why(r) }; })
      .catch(function (e) { return { ok: false, msg: e && e.message === 'nozip' ? 'This browser can’t open that code. Try a recent Chrome, Edge, Firefox or Safari.' : 'That code looks incomplete or damaged. Check that you copied all of it.' }; });
  }
  function copyCode(id) {
    id = id || (PF.active() || {}).id; if (!id) return;
    makeCode(id).then(function (code) {
      var p = PF.get(id);
      function show() { dialog('Save code for ' + esc(p.name), '<p class="note">Copy this code and keep it somewhere safe. On another device, open My Progress and paste it under “Load a save code”.</p><textarea rows="5" readonly aria-label="Save code">' + esc(code) + '</textarea>', [['Close', 'pri']], function (box) { var ta = box.querySelector('textarea'); ta.focus(); ta.select(); }); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(function () { toast('Save code for ' + p.name + ' copied (' + code.length.toLocaleString() + ' characters). Paste it on My Progress on another device.'); }, show);
      else show();
    });
  }

  // ---------- dialogs ----------
  var ov = null, lastFocus = null;
  function closeDlg() { if (!ov) return; ov.hidden = true; ov.innerHTML = ''; if (lastFocus && lastFocus.focus && D.contains(lastFocus)) lastFocus.focus(); }
  function dialog(title, body, buttons, after) {
    if (!ov) {
      ov = el('div', 'trb-pf-ov'); ov.hidden = true; D.body.appendChild(ov);
      ov.addEventListener('mousedown', function (e) { if (e.target === ov) closeDlg(); });
      ov.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); closeDlg(); return; }
        if (e.key !== 'Tab') return;
        var f = [].filter.call(ov.querySelectorAll('button, input, textarea, select, a[href]'), function (x) { return !x.disabled && x.getClientRects().length; });
        if (!f.length) return; var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
    lastFocus = D.activeElement;
    ov.innerHTML = '<form class="trb-pf-dlg" role="dialog" aria-modal="true" aria-labelledby="trb-pf-h" novalidate><h2 id="trb-pf-h">' + title + '</h2>' + body +
      '<div class="trb-pf-btns">' + buttons.map(function (b, i) { return '<button type="' + (i === 0 ? 'submit' : 'button') + '" class="' + (b[1] || '') + '" data-b="' + i + '">' + esc(b[0]) + '</button>'; }).join('') + '</div></form>';
    ov.hidden = false;
    var form = ov.firstChild;
    form.addEventListener('submit', function (e) { e.preventDefault(); if (buttons[0][2]) buttons[0][2](form); else closeDlg(); });
    form.addEventListener('click', function (e) { var b = e.target.closest('button[data-b]'); if (!b || b.type === 'submit') return; var f = buttons[+b.dataset.b][2]; if (f) f(form); else closeDlg(); });
    if (after) after(form); else { var i = form.querySelector('input[type=text]'); (i || form.querySelector('button')).focus(); }
    return form;
  }
  function iconsHTML(cur) {
    return '<fieldset><legend>Picture</legend><div class="trb-pf-icons">' + PF.ICONS.map(function (ic, i) { return '<label><input type="radio" name="ic" value="' + ic + '"' + (ic === cur ? ' checked' : '') + ' aria-label="Picture ' + (i + 1) + '"><span aria-hidden="true">' + ic + '</span></label>'; }).join('') + '</div></fieldset>';
  }
  function openAdd() {
    var first = !PF.on(), n = PF.list().length;
    var body = (first ? '<p class="note">Each learner keeps their own progress in this browser: ladders, lessons, games and words. Switch learners from the name at the top of every page.</p><label class="f"><span>Name for the progress already in this browser</span><input type="text" name="first" value="Me" maxlength="30" autocomplete="off"></label>' : '') +
      '<label class="f"><span>New learner’s name</span><input type="text" name="name" maxlength="30" required autocomplete="off" placeholder="Anna"></label>' +
      '<label class="f"><span>Age or grade (optional)</span><input type="text" name="age" maxlength="20" autocomplete="off" placeholder="9, or Grade 4"></label>' +
      iconsHTML(first ? PF.ICONS[1] : PF.ICONS.filter(function (ic) { return !PF.list().some(function (p) { return p.icon === ic; }); })[0] || PF.ICONS[n % PF.ICONS.length]) +
      '<label class="chk"><input type="checkbox" name="go" checked> Switch to this learner now</label>';
    dialog('Add a learner', body, [['Add', 'pri', function (f) {
      var name = fv(f, 'name').value.trim(); if (!name) { fv(f, 'name').focus(); toast('Please type a name.'); return; }
      var r = PF.add({ name: name, age: fv(f, 'age').value, icon: (f.querySelector('input[name=ic]:checked') || {}).value }, first ? fv(f, 'first').value : '');
      if (!r.ok) { toast(why(r)); return; }
      var go = fv(f, 'go').checked; closeDlg();
      if (go) switchTo(r.profile.id); else { toast(name + ' added. Switch from the name at the top of the page.'); changed(); }
    }], ['Cancel']], function (f) { var i0 = fv(f, 'first') || fv(f, 'name'); i0.focus(); i0.select(); });
  }
  function openEdit(id) {
    var p = PF.get(id || (PF.active() || {}).id); if (!p) return;
    var body = '<label class="f"><span>Name</span><input type="text" name="name" maxlength="30" required autocomplete="off" value="' + esc(p.name) + '"></label>' +
      '<label class="f"><span>Age or grade (optional)</span><input type="text" name="age" maxlength="20" autocomplete="off" value="' + esc(p.age) + '"></label>' + iconsHTML(p.icon);
    dialog('Edit ' + esc(p.name), body, [['Save', 'pri', function (f) {
      var r = PF.update(p.id, { name: fv(f, 'name').value, age: fv(f, 'age').value, icon: (f.querySelector('input[name=ic]:checked') || {}).value });
      if (!r.ok) { toast(why(r)); return; } closeDlg(); toast('Saved.'); changed();
    }], ['Cancel'], ['Delete…', 'del', function () {
      var last = PF.list().length === 1;
      var q = last ? 'Stop using learner profiles? ' + p.name + '’s progress stays in this browser as it is now.' :
        'Delete ' + p.name + ' and all of ' + p.name + '’s progress in this browser? This can’t be undone. (Save ' + p.name + ' to a file first if you might want it later.)';
      if (!W.confirm(q)) return;
      var r = PF.remove(p.id); if (!r.ok) { toast(why(r)); return; }
      closeDlg();
      if (r.reload || r.off) { W.location.reload(); return; }
      toast(p.name + ' deleted.'); changed();
    }]]);
  }

  // ---------- the header chip ----------
  var wrap = null, btn = null, menu = null;
  function items() { return [].slice.call(menu.querySelectorAll('[role=menuitem],[role=menuitemradio]')); }
  function openMenu(focusFirst) {
    render(); menu.hidden = false; btn.setAttribute('aria-expanded', 'true');
    if (W.matchMedia && W.matchMedia('(max-width:520px)').matches) { var b = btn.getBoundingClientRect().bottom + 6; menu.style.top = b + 'px'; menu.style.maxHeight = (W.innerHeight - b - 10) + 'px'; } else { menu.style.top = ''; menu.style.maxHeight = ''; }
    var it = items(), cur = menu.querySelector('[aria-checked=true]'); if (focusFirst !== false) (cur || it[0]).focus();
  }
  function closeMenu(refocus) { if (!menu || menu.hidden) return; menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (refocus) btn.focus(); }
  function render() {
    if (!wrap) return;
    var act = PF.active();
    if (!act) { wrap.hidden = true; D.documentElement.classList.remove('trb-pf-on'); return; }
    wrap.hidden = false; D.documentElement.classList.add('trb-pf-on');
    btn.innerHTML = '<span aria-hidden="true">' + esc(act.icon || '🙂') + '</span><span class="n">' + esc(act.name) + '</span><svg aria-hidden="true" viewBox="0 0 12 12" width="10" height="10"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
    btn.setAttribute('aria-label', 'Learner: ' + PF.label(act) + '. Switch learner or save progress');
    btn.title = 'Learner: ' + PF.label(act);
    var list = PF.list();
    menu.innerHTML = '<p id="trb-pf-mh">Learners in this browser</p>' + list.map(function (p) {
      return '<button type="button" role="menuitemradio" aria-checked="' + (p.id === act.id) + '" data-a="sw" data-id="' + esc(p.id) + '" tabindex="-1"><span class="ic" aria-hidden="true">' + esc(p.icon || '🙂') + '</span>' + esc(PF.label(p)) + '</button>';
    }).join('') + '<hr>' +
      '<button type="button" role="menuitem" data-a="add" tabindex="-1"><span class="ic" aria-hidden="true">＋</span>Add a learner</button>' +
      '<button type="button" role="menuitem" data-a="edit" tabindex="-1"><span class="ic" aria-hidden="true">✎</span>Rename or delete ' + esc(act.name) + '</button><hr>' +
      '<button type="button" role="menuitem" data-a="save" tabindex="-1"><span class="ic" aria-hidden="true">⬇</span>Save ' + esc(act.name) + ' to a file</button>' +
      (list.length > 1 ? '<button type="button" role="menuitem" data-a="all" tabindex="-1"><span class="ic" aria-hidden="true">⬇</span>Save all learners to one file</button>' : '') +
      '<button type="button" role="menuitem" data-a="open" tabindex="-1"><span class="ic" aria-hidden="true">⬆</span>Open a learner file</button>' +
      '<button type="button" role="menuitem" data-a="code" tabindex="-1"><span class="ic" aria-hidden="true">📋</span>Copy a save code</button><hr>' +
      (PF.hasProgress() ? '' : '<button type="button" role="menuitem" data-a="restore" tabindex="-1"><span class="ic" aria-hidden="true">⤴</span>Moving to a new device? Restore a backup</button>') +
      '<a role="menuitem" href="/progress/" tabindex="-1"><span class="ic" aria-hidden="true">📈</span>My Progress</a>';
  }
  function mount() {
    var sw = D.querySelector('.logo-switches'); if (!sw || wrap) return;
    wrap = el('span', 'trb-pf'); wrap.hidden = true;
    btn = el('button', 'trb-pf-btn'); btn.type = 'button'; btn.setAttribute('aria-haspopup', 'menu'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'trb-pf-menu');
    menu = el('div', 'trb-pf-menu'); menu.id = 'trb-pf-menu'; menu.setAttribute('role', 'menu'); menu.setAttribute('aria-labelledby', 'trb-pf-mh'); menu.hidden = true;
    wrap.appendChild(btn); wrap.appendChild(menu);
    var tg = D.getElementById('theme-toggle'); if (tg && tg.parentNode === sw) sw.insertBefore(wrap, tg.nextSibling); else sw.appendChild(wrap);
    btn.addEventListener('click', function (e) { e.stopPropagation(); if (menu.hidden) openMenu(e.detail === 0); else closeMenu(); });
    btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openMenu(); } });
    menu.addEventListener('click', function (e) {
      e.stopPropagation();
      var b = e.target.closest('[data-a]'); if (!b) return;
      var a = b.dataset.a, act = PF.active(); closeMenu(a === 'sw');
      if (a === 'sw') switchTo(b.dataset.id);
      else if (a === 'add') openAdd();
      else if (a === 'edit') openEdit(act.id);
      else if (a === 'save') saveFile([act.id]);
      else if (a === 'all') saveFile(null, true);
      else if (a === 'open') openFile();
      else if (a === 'code') copyCode(act.id);
      else if (a === 'restore') openRestore();
    });
    menu.addEventListener('keydown', function (e) {
      var it = items(), i = it.indexOf(D.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); it[(i + 1) % it.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); it[(i - 1 + it.length) % it.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); it[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); it[it.length - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); }
      else if (e.key === 'Tab') closeMenu(false);
    });
    D.addEventListener('click', function (e) { if (!wrap.contains(e.target)) closeMenu(false); });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) closeMenu(wrap.contains(D.activeElement)); });
    render();
  }

  function start() {
    mount();
    var m = null, hi = null;
    try { m = W.sessionStorage.getItem('trb-profiles-msg'); W.sessionStorage.removeItem('trb-profiles-msg'); hi = W.sessionStorage.getItem('trb-profiles-hi'); W.sessionStorage.removeItem('trb-profiles-hi'); } catch (e) { }
    if (m) toast(m === 'full' ? 'Couldn’t switch learners: ' + FULL : 'Couldn’t switch learners. Nothing was changed.');
    else if (hi) { var a = PF.active(); if (a && a.name === hi) toast('Now learning as ' + PF.label(a) + '.'); }
  }
  W.TRBProfilesUI = { openAdd: openAdd, openEdit: openEdit, switchTo: switchTo, saveFile: saveFile, openFile: openFile, openRestore: openRestore, previewRestore: previewRestore, copyCode: copyCode, loadCode: loadCode, toast: toast, why: why, refresh: changed,
    onChange: function (f) { subs.push(f); } };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
  try { W.dispatchEvent(new Event('trb-profiles-ui')); } catch (e) { }
})(window, document);

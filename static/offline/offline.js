/* /offline/: choose sections to keep on this device, download them with progress, update and remove.
   The work itself is in /js/offline-core.js; the service worker (/sw.js) serves the saved copies. */
(function () {
  'use strict';
  var O = window.TRBOffline, root = document.getElementById('off');
  if (!root) return;
  function $(n) { return root.querySelector('[data-off="' + n + '"]'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } }
  var size = O ? O.size : function () { return ''; };
  var msg = $('msg');

  if (!O || !('serviceWorker' in navigator) || !window.caches) {
    msg.textContent = 'This browser cannot save pages for offline use. A recent Chrome, Edge, Safari or Firefox can, or use the download kit below.';
    $('groups').innerHTML = ''; $('bar').hidden = true; return;
  }
  navigator.serviceWorker.register('/sw.js').catch(function () { });

  var index = null, st = null, sel = {}, busy = false, ctl = null, planned = null, timer = 0;
  var applyBtn = $('apply'), stopBtn = $('stop');

  /* ---------- install button ---------- */
  var bip = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); bip = e; $('install').hidden = false; });
  $('install-btn').addEventListener('click', function () { if (!bip) return; bip.prompt(); bip.userChoice.then(function () { bip = null; $('install').hidden = true; }); });
  var standalone = window.matchMedia && matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (!standalone && /iP(hone|ad|od)/.test(navigator.userAgent)) {
    var ib = $('install'); ib.hidden = false; $('install-btn').hidden = true;
    ib.querySelector('.off-note').innerHTML = 'To add the app: tap <b>Share</b>, then <b>Add to Home Screen</b>.';
  }

  /* ---------- status ---------- */
  function savedIds() { return st ? Object.keys(st.sections).filter(function (id) { return id !== 'core'; }) : []; }
  function title(id) { var s = index && index.sections[id] || st && st.titles && st.titles[id]; return s ? (s.icon ? s.icon + ' ' : '') + s.title : id; }
  function when(t) { if (!t) return ''; var d = new Date(t); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }

  function renderStatus() {
    var ids = savedIds(), total = 0;
    Object.keys(st.sections).forEach(function (id) { total += st.sections[id].bytes; });
    if (!ids.length) {
      msg.textContent = navigator.onLine ? 'Nothing is saved on this device yet. Choose sections below.' : 'You are offline, and nothing is saved on this device yet. Come back when you are online.';
      $('stats').hidden = $('saved').hidden = $('update').hidden = true;
    } else {
      msg.textContent = navigator.onLine ? 'These sections work on this device without a connection.' : 'You are offline. Everything saved below still works. Changes and updates need a connection.';
      var s = $('stats'); s.hidden = false;
      s.innerHTML = '<div class="off-stat"><b>' + ids.length + '</b><span>section' + (ids.length > 1 ? 's' : '') + ' saved</span></div>' +
        '<div class="off-stat"><b>' + size(total) + '</b><span>saved pages and files</span></div>' +
        '<div class="off-stat"><b data-off="quota">…</b><span>space left for this site</span></div>' +
        '<div class="off-stat"><b>' + esc(when(st.at).split(',')[0]) + '</b><span>last saved or updated</span></div>';
      if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (e) { var q = $('quota'); if (q) q.textContent = e.quota ? size(Math.max(0, e.quota - e.usage)) : 'unknown'; });
      else $('quota').textContent = 'unknown';
      var t = $('saved'); t.hidden = false;
      t.innerHTML = '<table><thead><tr><th>Saved section</th><th class="n">Size</th><th class="n"><span class="off-vh">Remove</span></th></tr></thead><tbody>' +
        ids.map(function (id) {
          var u = index && index.sections[id] && index.sections[id].url;
          return '<tr><td>' + (u ? '<a href="' + esc(u) + '">' + esc(title(id)) + '</a>' : esc(title(id))) + '</td><td class="n">' + size(st.sections[id].bytes) + '</td><td class="n"><button type="button" class="off-btn sm" data-rm="' + esc(id) + '"' + (busy || !navigator.onLine ? ' disabled' : '') + '>Remove</button></td></tr>';
        }).join('') +
        '<tr><td>Site basics <small class="off-note">(saved with any section)</small></td><td class="n">' + size(st.sections.core ? st.sections.core.bytes : 0) + '</td><td class="n"><button type="button" class="off-btn sm" data-rm="*"' + (busy ? ' disabled' : '') + '>Remove all</button></td></tr></tbody></table>';
      renderUpdate();
    }
  }
  function renderUpdate(checking) {
    var u = $('update'), up = st && st.update;
    if (!savedIds().length) { u.hidden = true; return; }
    u.hidden = false;
    if (checking) { u.className = 'off-update ok'; u.innerHTML = '<p>Checking for updates…</p>'; return; }
    if (up && (up.files || up.drop)) {
      u.className = 'off-update';
      u.innerHTML = '<p><b>Update available (' + size(up.bytes) + ').</b> ' + up.files + ' changed or new file' + (up.files === 1 ? '' : 's') + (up.drop ? ', ' + up.drop + ' to remove' : '') + '. Only these download.</p><button type="button" class="off-btn pri" data-off="do-update"' + (busy || !navigator.onLine ? ' disabled' : '') + '>Update now</button>';
    } else {
      u.className = 'off-update ok';
      u.innerHTML = '<p>Saved pages are up to date' + (st.checked ? ' (checked ' + esc(when(st.checked)) + ')' : '') + '.</p>' + (navigator.onLine ? '<button type="button" class="off-btn sm" data-off="recheck">Check again</button>' : '');
    }
  }

  /* ---------- section list ---------- */
  function renderGroups() {
    var saved = st.sections, upd = (st.update && st.update.changed) || [];
    $('core-size').textContent = size(index.core.bytes);
    $('groups').innerHTML = index.groups.map(function (g, gi) {
      var items = g.items.map(function (id) {
        var s = index.sections[id], on = !!s.online, has = !!saved[id];
        var chips = (has ? '<span class="off-chip">Saved</span>' : '') + (has && upd.indexOf(id) >= 0 ? '<span class="off-chip up">Update</span>' : '') + (on ? '<span class="off-chip on">Online only</span>' : '');
        return '<label class="off-item' + (on ? ' dis' : '') + '"' + (on ? ' title="' + esc(s.online) + '"' : '') + '><input type="checkbox" data-id="' + esc(id) + '"' + (on ? ' disabled' : '') + (sel[id] ? ' checked' : '') + '><span class="t">' + esc((s.icon ? s.icon + ' ' : '') + s.title) + chips + '</span><span class="s">' + (on ? '' : size(s.bytes)) + '</span></label>';
      }).join('');
      var gb = 0; g.items.forEach(function (id) { gb += index.sections[id].bytes || 0; });
      return '<fieldset class="off-group"><legend><label class="off-glabel"><input type="checkbox" data-g="' + gi + '">' + esc(g.name) + ' <small>all, up to ' + size(gb) + '</small></label></legend><div class="off-items">' + items + '</div></fieldset>';
    }).join('');
    syncChecks();
  }
  function syncChecks() {
    root.querySelectorAll('input[data-id]').forEach(function (c) { c.checked = !!sel[c.getAttribute('data-id')]; c.disabled = busy || index.sections[c.getAttribute('data-id')].online ? true : false; });
    root.querySelectorAll('input[data-g]').forEach(function (c) {
      var ids = index.groups[+c.getAttribute('data-g')].items.filter(function (id) { return !index.sections[id].online; });
      var n = ids.filter(function (id) { return sel[id]; }).length;
      c.checked = n > 0 && n === ids.length; c.indeterminate = n > 0 && n < ids.length; c.disabled = busy;
    });
  }
  root.addEventListener('change', function (e) {
    var c = e.target; if (busy) return;
    if (c.hasAttribute('data-id')) { if (c.checked) sel[c.getAttribute('data-id')] = 1; else delete sel[c.getAttribute('data-id')]; }
    else if (c.hasAttribute('data-g')) index.groups[+c.getAttribute('data-g')].items.forEach(function (id) { if (index.sections[id].online) return; if (c.checked) sel[id] = 1; else delete sel[id]; });
    else return;
    syncChecks(); recalc();
  });

  /* ---------- what the choice costs ---------- */
  function recalc() {
    clearTimeout(timer); applyBtn.disabled = true; planned = null;
    var want = Object.keys(sel);
    $('sum').textContent = 'Working out the sizes…';
    timer = setTimeout(function () {
      O.plan(want, index).then(function (pl) {
        if (Object.keys(sel).join() !== want.join()) return;
        planned = pl;
        var parts = [], n = want.length;
        if (pl.get.length) parts.push('<b>To download: ' + size(pl.bytes) + '</b> (' + pl.get.length + ' file' + (pl.get.length > 1 ? 's' : '') + ')');
        if (pl.drop.length) parts.push('<b>To remove: ' + size(pl.dropBytes) + '</b>');
        var head = n ? n + ' section' + (n > 1 ? 's' : '') + ' chosen, ' + size(pl.bytes + pl.keep) + ' in all with the site basics. ' : 'Nothing chosen. ';
        $('sum').innerHTML = head + (parts.length ? parts.join('. ') + '.' : (n ? 'All of it is saved and up to date.' : ''));
        applyBtn.disabled = busy || !(pl.get.length || pl.drop.length) || !navigator.onLine;
        applyBtn.textContent = pl.get.length || !pl.drop.length ? 'Save my choices' : 'Remove';
        if (pl.bytes && navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (e) {
          if (e.quota && pl.bytes > e.quota - e.usage) $('sum').innerHTML += ' <span class="off-msg-err">This device may not have room for that much. Try fewer sections.</span>';
        });
      }).catch(function () { $('sum').textContent = navigator.onLine ? 'Could not work out the sizes. Reload the page to try again.' : 'Choosing sections needs a connection.'; });
    }, 200);
  }

  /* ---------- download, update, remove ---------- */
  function run(pl, label) {
    if (busy) return;
    busy = true; ctl = window.AbortController ? new AbortController() : null;
    applyBtn.disabled = true; stopBtn.hidden = !ctl; syncChecks(); renderStatus();
    var pg = $('prog'), bar = pg.querySelector('span'), txt = $('prog-txt'); pg.hidden = false; bar.style.width = '0';
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () { });
    var t0 = Date.now();
    txt.textContent = label + '…';
    return O.apply(pl, function (p) {
      var f = p.totalBytes ? p.bytes / p.totalBytes : (p.total ? p.done / p.total : 1);
      bar.style.width = Math.round(f * 100) + '%';
      txt.textContent = label + ': ' + size(p.bytes) + ' of ' + size(p.totalBytes) + ' (' + p.done + ' of ' + p.total + ' files). Keep this page open.';
    }, ctl && ctl.signal).then(function (ns) {
      st = ns;
      var ids = savedIds();
      ls('trb-off', ids.length ? '1' : null); ls('trb-off-update', null); ls('trb-off-checked', ids.length ? String(Date.now()) : null);
      bar.style.width = '100%';
      txt.textContent = ids.length ? 'Done in ' + Math.max(1, Math.round((Date.now() - t0) / 1000)) + ' s. ' + ids.length + ' section' + (ids.length > 1 ? 's are' : ' is') + ' saved on this device.' : 'Done. Nothing is saved on this device now.';
    }, function (err) {
      txt.innerHTML = err && err.name === 'AbortError' ? 'Stopped. What downloaded so far is kept, so pressing the button again carries on where it left off.' : '<span class="off-msg-err">' + esc(err && err.message || 'Something went wrong.') + '</span> What downloaded so far is kept.';
      return O.state().then(function (s) { st = s; });
    }).then(function () {
      busy = false; ctl = null; stopBtn.hidden = true;
      sel = {}; savedIds().forEach(function (id) { if (index.sections[id] && !index.sections[id].online) sel[id] = 1; });
      renderStatus(); renderGroups(); recalc();
    });
  }
  applyBtn.addEventListener('click', function () { if (planned) run(planned, planned.get.length ? 'Downloading' : 'Removing'); });
  stopBtn.addEventListener('click', function () { if (ctl) ctl.abort(); });
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || busy) return;
    if (b.getAttribute('data-off') === 'do-update') O.plan(savedIds(), index).then(function (pl) { run(pl, 'Updating'); });
    else if (b.getAttribute('data-off') === 'recheck') check();
    else if (b.hasAttribute('data-rm')) {
      var id = b.getAttribute('data-rm');
      if (id === '*') {
        if (!confirm('Remove everything saved for offline use on this device? Your saves and progress are not affected.')) return;
        O.clearAll().then(function () { ls('trb-off', null); ls('trb-off-update', null); return O.state(); }).then(function (s) { st = s; sel = {}; renderStatus(); if (index) { renderGroups(); recalc(); } });
        return;
      }
      if (!index) return;
      O.plan(savedIds().filter(function (x) { return x !== id; }), index).then(function (pl) { run(pl, 'Removing ' + title(id)); });
    }
  });
  window.addEventListener('beforeunload', function (e) { if (busy) { e.preventDefault(); e.returnValue = ''; } });

  function check() {
    if (!savedIds().length || !navigator.onLine) return;
    renderUpdate(true);
    O.check().then(function (r) {
      return O.state().then(function (s) { st = s; ls('trb-off-checked', String(Date.now())); ls('trb-off-update', JSON.stringify(r && (r.files || r.drop) ? r : null)); renderUpdate(); renderGroups(); });
    }).catch(function () { renderUpdate(); });
  }

  /* ---------- start ---------- */
  O.state().then(function (s) {
    st = s; renderStatus();
    return O.getIndex().then(function (ix) {
      index = ix;
      savedIds().forEach(function (id) { if (index.sections[id] && !index.sections[id].online) sel[id] = 1; });
      renderStatus(); renderGroups(); recalc(); check();
    });
  }).catch(function () {
    $('groups').innerHTML = '<p class="off-note">' + (navigator.onLine ? 'The list of sections could not load. Reload the page to try again.' : 'The list of sections needs a connection. What is already saved still works.') + '</p>';
    $('sum').textContent = ''; applyBtn.disabled = true;
  });
})();

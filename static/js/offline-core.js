/* Teddy Rook Book: saving sections of the site for use without a connection.
   Shared by the service worker (/sw.js) and the /offline/ page. Plain ES5-ish, no modules.

   How it works
   - The build writes /offline/manifests/index.json (all sections, sizes and a hash per section)
     and one manifest per section: [path, bytes, hash] for every file the section needs.
   - Saved files live in the Cache Storage cache "trb-off-files", one entry per URL, each tagged
     with its hash (header x-trb-hash). The manifests that were saved live in "trb-off-meta".
   - An update compares the new manifests with the saved ones and downloads only the files whose
     hash changed or that are new, then deletes files no saved section needs any more.
*/
(function (G) {
  'use strict';
  var FILES = 'trb-off-files', META = 'trb-off-meta', MAN = '/offline/manifests/';
  var STATE = '/__off/state.json';
  var FONT_HOSTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

  /* 'math/x/index.html' -> '/math/x/'  (the URL people visit) */
  function urlFor(p) {
    p = '/' + String(p).replace(/^\/+/, '');
    if (/\/index\.html$/.test(p)) p = p.slice(0, -10);
    return encodeURI(p);
  }
  /* any request URL -> the key it is saved under */
  function keyFor(u) {
    var url = new URL(u, G.location ? G.location.href : 'https://teddyrookbook.com/');
    var p = url.pathname;
    try { p = encodeURI(decodeURI(p)); } catch (e) { }
    if (/\/index\.html$/.test(p)) p = p.slice(0, -10);
    return p;
  }
  function slashed(p) { return /\/[^/.]+$/.test(p) ? p + '/' : null; }

  function json(r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + r.url); return r.json(); }
  function getIndex() { return fetch(MAN + 'index.json', { cache: 'no-store' }).then(json); }
  var memo = {};
  function getManifest(id, hash) {
    var k = id + '@' + hash;
    if (!memo[k]) { memo[k] = fetch(MAN + id + '.json?h=' + (hash || ''), { cache: 'no-cache' }).then(json); memo[k].catch(function () { delete memo[k]; }); }
    return memo[k];
  }

  function meta() { return caches.open(META); }
  function readMeta(key) { return meta().then(function (c) { return c.match(key); }).then(function (r) { return r ? r.json() : null; }); }
  function writeMeta(key, obj) { return meta().then(function (c) { return c.put(key, new Response(JSON.stringify(obj), { headers: { 'content-type': 'application/json' } })); }); }
  function dropMeta(key) { return meta().then(function (c) { return c.delete(key); }); }

  function state() { return readMeta(STATE).then(function (s) { return s || { v: 1, sections: {} }; }); }
  function saved() { // { id: manifest } for everything saved (core included)
    return state().then(function (s) {
      var ids = Object.keys(s.sections), out = {};
      return Promise.all(ids.map(function (id) { return readMeta('/__off/m/' + id + '.json').then(function (m) { if (m) out[id] = m; }); })).then(function () { return out; });
    });
  }

  /* What it takes to end up with exactly the sections in `want` (core is added when anything is wanted). */
  function plan(want, index) {
    want = want.filter(function (id) { return id === 'core' || (index.sections[id] && !index.sections[id].online); });
    if (want.length && want.indexOf('core') < 0) want.unshift('core');
    return saved().then(function (old) {
      var news = {};
      return Promise.all(want.map(function (id) {
        var info = id === 'core' ? index.core : index.sections[id];
        if (old[id] && old[id].hash === info.hash) { news[id] = old[id]; return; }
        return getManifest(id, info.hash).then(function (m) { news[id] = m; });
      })).then(function () {
        var oldMap = {}, oldSize = {}, newMap = {}, get = [], drop = [], bytes = 0, keep = 0, dropBytes = 0;
        Object.keys(old).forEach(function (id) { old[id].files.forEach(function (f) { oldMap[f[0]] = f[2]; oldSize[f[0]] = f[1]; }); });
        Object.keys(news).forEach(function (id) { news[id].files.forEach(function (f) { newMap[f[0]] = f; }); });
        Object.keys(newMap).forEach(function (p) { var f = newMap[p]; if (oldMap[p] !== f[2]) { get.push(f); bytes += f[1]; } else keep += f[1]; });
        Object.keys(oldMap).forEach(function (p) { if (!newMap[p]) { drop.push(p); dropBytes += oldSize[p]; } });
        var changed = Object.keys(news).filter(function (id) { return !old[id] || old[id].hash !== news[id].hash; });
        var removed = Object.keys(old).filter(function (id) { return !news[id]; });
        return { want: want, get: get, drop: drop, bytes: bytes, keep: keep, dropBytes: dropBytes, manifests: news, changed: changed, removed: removed, index: index, fonts: index.fonts || [] };
      });
    });
  }

  /* Download and store. onProgress({done, total, bytes, totalBytes}). Stops early when signal is aborted;
     whatever was stored is kept and skipped next time (each file carries its hash). */
  function apply(pl, onProgress, signal) {
    var total = pl.get.length, done = 0, bytes = 0, failed = [], i = 0, full = false;
    function tick() { if (onProgress) onProgress({ done: done, total: total, bytes: bytes, totalBytes: pl.bytes }); }
    return caches.open(FILES).then(function (cache) {
      function one(f) {
        var key = urlFor(f[0]);
        return cache.match(key).then(function (have) {
          if (have && have.headers.get('x-trb-hash') === f[2]) return;
          var tries = 0;
          function go() {
            return fetch(key, { cache: tries ? 'reload' : 'no-cache', credentials: 'same-origin', signal: signal }).then(function (r) {
              if (!r.ok) throw new Error('HTTP ' + r.status);
              return r.blob().then(function (b) {
                var h = new Headers({ 'content-type': r.headers.get('content-type') || 'application/octet-stream', 'x-trb-hash': f[2] });
                return cache.put(key, new Response(b, { status: 200, headers: h }));
              });
            }).catch(function (e) {
              if (signal && signal.aborted) throw e;
              if (e && e.name === 'QuotaExceededError') { full = true; throw e; }
              if (++tries < 3) return go(); failed.push(f[0]);
            });
          }
          return go();
        }).then(function () { done++; bytes += f[1]; tick(); });
      }
      function worker() { if (signal && signal.aborted) return Promise.reject(new DOMException('Stopped', 'AbortError')); if (full) return Promise.resolve(); var f = pl.get[i++]; return f ? one(f).then(worker) : Promise.resolve(); }
      tick();
      var ws = []; for (var k = 0; k < 6; k++) ws.push(worker());
      return Promise.all(ws).catch(function (e) { if (!full) throw e; }).then(function () {
        if (full) { var q = new Error('This device ran out of room for saved pages. What downloaded so far is kept. Remove a section or choose fewer.'); q.name = 'QuotaExceededError'; throw q; }
        if (failed.length) { var e = new Error(failed.length + ' file' + (failed.length > 1 ? 's' : '') + ' could not be downloaded. Try again in a minute.'); e.failed = failed; throw e; }
        return Promise.all(pl.drop.map(function (p) { return cache.delete(urlFor(p)); }));
      }).then(function () { return pl.want.length ? saveFonts(cache, pl.fonts) : dropFonts(cache); });
    }).then(function () {
      var st = { v: 1, sections: {}, titles: {}, at: Date.now(), checked: Date.now(), built: pl.index.built, update: null };
      return Promise.all(Object.keys(pl.manifests).map(function (id) {
        var m = pl.manifests[id], info = pl.index.sections[id];
        st.sections[id] = { hash: m.hash, bytes: m.bytes, files: m.files.length };
        if (info) st.titles[id] = { title: info.title, url: info.url, icon: info.icon };
        return writeMeta('/__off/m/' + id + '.json', m);
      }).concat(pl.removed.map(function (id) { return dropMeta('/__off/m/' + id + '.json'); }))).then(function () {
        return pl.want.length ? writeMeta(STATE, st) : dropMeta(STATE);
      }).then(function () { return st; });
    });
  }

  /* The web fonts come from Google Fonts. Save them too, so saved pages look the same offline. Best effort. */
  function saveFonts(cache, urls) {
    return Promise.all((urls || []).map(function (u) {
      return cache.match(u).then(function (have) {
        if (have) return;
        return fetch(u, { mode: 'cors' }).then(function (r) {
          if (!r.ok) return;
          return r.clone().text().then(function (css) {
            var files = []; css.replace(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g, function (_, f) { files.push(f); });
            return Promise.all(files.map(function (f) { return cache.match(f).then(function (h) { if (!h) return fetch(f, { mode: 'cors' }).then(function (fr) { if (fr.ok) return cache.put(f, fr); }); }); }))
              .then(function () { return cache.put(u, r); });
          });
        });
      }).catch(function () { });
    }));
  }
  function dropFonts(cache) {
    return cache.keys().then(function (ks) { return Promise.all(ks.filter(function (r) { return FONT_HOSTS.test(r.url); }).map(function (r) { return cache.delete(r); })); });
  }

  /* Is there an update for the saved sections? Resolves {bytes, files, changed[], removed[]} or null if nothing is saved. */
  function check() {
    return state().then(function (s) {
      var ids = Object.keys(s.sections); if (!ids.length) return null;
      return getIndex().then(function (index) {
        var want = ids.filter(function (id) { return id === 'core' || (index.sections[id] && !index.sections[id].online); });
        return plan(want, index).then(function (pl) {
          var gone = ids.filter(function (id) { return want.indexOf(id) < 0; });
          var res = { bytes: pl.bytes, files: pl.get.length, drop: pl.drop.length, changed: pl.changed, removed: gone, built: index.built, at: Date.now() };
          s.checked = Date.now(); s.update = (pl.get.length || pl.drop.length) ? res : null;
          return writeMeta(STATE, s).then(function () { return res; });
        });
      });
    });
  }

  /* Remove everything that was saved. */
  function clearAll() { return Promise.all([caches.delete(FILES), caches.delete(META)]); }

  /* Look up a saved copy for a request (used by the service worker). */
  function match(u) {
    return caches.open(FILES).then(function (c) {
      if (FONT_HOSTS.test(u)) return c.match(u);
      var k = keyFor(u);
      return c.match(k).then(function (r) { var s; return r || ((s = slashed(k)) ? c.match(s) : null); });
    });
  }

  function size(n) {
    if (!n) return '0 MB';
    if (n < 1048576) return Math.max(0.1, n / 1048576).toFixed(1) + ' MB';
    if (n < 1073741824) return (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB';
    return (n / 1073741824).toFixed(2) + ' GB';
  }

  G.TRBOffline = { FILES: FILES, META: META, urlFor: urlFor, keyFor: keyFor, getIndex: getIndex, state: state, saved: saved, plan: plan, apply: apply, check: check, clearAll: clearAll, match: match, size: size };
})(typeof self !== 'undefined' ? self : this);

/* Teddy Rook Book service worker: the installable app and pages saved for use without a connection.
   It is only registered for people who open /offline/ or have saved something there.

   - Pages: the network first, as usual. If there is no connection (or it takes more than a few
     seconds and a saved copy exists), the saved copy. If the page was not saved, a friendly
     "not saved" page.
   - Other files: the network first; the saved copy only when the network fails. So online browsing
     works exactly as without this file.
   - Live data (Markets) and the offline manifests are never touched.
   - Saving, removing and updating sections is done by /js/offline-core.js (shared with /offline/).
*/
'use strict';
importScripts('/js/offline-core.js');
var SHELL = 'trb-off-shell-v1';
var FALLBACK = '/offline/fallback/';
var SKIP = /^\/(markets|offline\/manifests)\//;
var FONTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

/* Keep a copy of the small "not saved" page and its stylesheet, so it can be shown even before any section is saved. */
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) {
    return fetch(FALLBACK, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) return;
      return r.clone().text().then(function (html) {
        var css = [], re = /<link[^>]+rel=["']?stylesheet["']?[^>]*>|<script[^>]+src=[^>]*>/gi, m, h;
        while ((m = re.exec(html))) if ((h = /(?:href|src)=["']?([^"' >]+)/i.exec(m[0])) && !/^(https?:)?\/\//.test(h[1].replace(location.origin, ''))) css.push(h[1]);
        return Promise.all(css.map(function (u) { return fetch(u).then(function (cr) { if (cr.ok) return c.put(TRBOffline.keyFor(u), cr); }); }))
          .then(function () { return c.put(FALLBACK, r); });
      });
    }).catch(function () { });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('trb-off-shell-') === 0 && k !== SHELL; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function shell(u) { return caches.open(SHELL).then(function (c) { return c.match(TRBOffline.keyFor(u)); }); }
function saved(u) { return TRBOffline.match(u).then(function (r) { return r || shell(u); }); }
function notSaved() {
  return saved(FALLBACK).then(function (r) {
    return r || new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Offline</title><body style="font:18px/1.5 Georgia,serif;max-width:34rem;margin:3rem auto;padding:0 1rem"><h1>No connection</h1><p>This page is not saved on this device. <a href="/offline/">See what is saved</a>.</p>', { headers: { 'content-type': 'text/html; charset=utf-8' } });
  });
}

function page(req) {
  var net = fetch(req);
  return saved(req.url).then(function (copy) {
    if (!copy) return net.catch(notSaved);
    var timer = new Promise(function (res) { setTimeout(function () { res(copy); }, 5000); });
    return Promise.race([net.then(function (r) { return r.status >= 500 ? copy : r; }), timer]).catch(function () { return copy; });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) {
    if (FONTS.test(req.url)) e.respondWith(fetch(req).catch(function () { return TRBOffline.match(req.url).then(function (r) { return r || Response.error(); }); }));
    return;
  }
  if (SKIP.test(url.pathname) || url.pathname === '/sw.js') return;
  if (req.mode === 'navigate') { e.respondWith(page(req)); return; }
  e.respondWith(fetch(req).catch(function () { return saved(req.url).then(function (r) { return r || Response.error(); }); }));
});

/* The small notice on every page asks here whether an update is waiting. */
self.addEventListener('message', function (e) {
  var d = e.data || {}, port = e.ports && e.ports[0];
  if (d.type !== 'check' || !port) return;
  e.waitUntil(TRBOffline.check().then(function (r) { port.postMessage({ ok: true, update: r }); }, function (err) { port.postMessage({ ok: false, error: String(err && err.message || err) }); }));
});

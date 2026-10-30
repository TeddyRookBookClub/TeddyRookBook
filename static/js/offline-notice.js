/* Loaded on every page, but only for people who saved part of the site on /offline/ (localStorage "trb-off").
   Keeps the service worker registered and, about once a day, asks it whether the saved pages have an update.
   If so, shows a small notice with the size. */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  var DAY = 864e5, LS = window.localStorage;
  function get(k) { try { return LS.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { LS.setItem(k, v); } catch (e) { } }
  navigator.serviceWorker.register('/sw.js').catch(function () { });
  if (/^\/offline\//.test(location.pathname) || !navigator.onLine) return;

  function size(n) { return n < 1048576 ? Math.max(0.1, n / 1048576).toFixed(1) + ' MB' : (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB'; }
  function show(u) {
    if (!u || (!u.files && !u.drop) || +get('trb-off-later') > Date.now()) return;
    var d = document.createElement('div'); d.className = 'trb-offn'; d.setAttribute('role', 'status');
    d.innerHTML = '<span>Update available for your saved pages' + (u.bytes ? ' (' + size(u.bytes) + ')' : '') + '.</span> <a href="/offline/#update">Update</a> <button type="button" aria-label="Not now">Later</button>';
    d.querySelector('button').onclick = function () { set('trb-off-later', Date.now() + DAY); d.remove(); };
    var st = document.createElement('style');
    st.textContent = '.trb-offn{position:fixed;left:12px;right:12px;bottom:14px;margin:0 auto;width:fit-content;z-index:950;display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .7rem;max-width:40rem;box-sizing:border-box;background:#004225;color:#f3ead2;border-radius:12px;padding:.55rem .8rem;font:15px/1.35 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)}' +
      '.trb-offn a{color:#fff;font-weight:700;text-decoration:underline;box-shadow:none}.trb-offn button{font:inherit;background:none;border:1px solid rgba(243,234,210,.5);color:inherit;border-radius:8px;padding:.15rem .6rem;cursor:pointer}' +
      '[data-theme="dark"] .trb-offn{background:#12261b;border:1px solid #6cc79a}[data-theme="dark"] .trb-offn a{color:#6cc79a}@media print{.trb-offn{display:none}}';
    document.head.appendChild(st); document.body.appendChild(d);
  }

  var last = +get('trb-off-checked') || 0;
  if (Date.now() - last < DAY) { try { show(JSON.parse(get('trb-off-update'))); } catch (e) { } return; }
  navigator.serviceWorker.ready.then(function (reg) {
    if (!reg.active) return;
    var ch = new MessageChannel();
    ch.port1.onmessage = function (e) {
      if (!e.data || !e.data.ok) return;
      set('trb-off-checked', Date.now());
      var u = e.data.update; set('trb-off-update', JSON.stringify(u && (u.files || u.drop) ? u : null));
      show(u);
    };
    reg.active.postMessage({ type: 'check' }, [ch.port2]);
  });
})();

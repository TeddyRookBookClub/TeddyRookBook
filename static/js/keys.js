/* Keyboard play for the games: makes board squares, points, tiles, territories and move lists reachable with Tab,
   lets Enter or Space press them, and moves between neighbouring pieces with the arrow keys.
   Usage: <script src="/js/keys.js" data-sel=".tb-pt,.tb-moves [data-n]" data-board=".tb-board"></script>
   data-sel: what to make pressable. data-board: containers where the arrow keys move focus (optional). */
(function (W, D) {
  'use strict';
  var me = D.currentScript; if (!me) return;
  var SEL = me.getAttribute('data-sel') || '', BOARD = me.getAttribute('data-board') || '';
  if (!SEL) return;
  function label(el) {
    if (el.getAttribute('aria-label')) return;
    var t = el.querySelector && el.querySelector('title');
    var txt = (el.dataset.label || (t && t.textContent) || el.getAttribute('title') || el.textContent || '').trim().replace(/\s+/g, ' ');
    if (txt) el.setAttribute('aria-label', txt.slice(0, 80));
  }
  function prep(root) {
    var els = (root || D).querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.__trbKey) continue; el.__trbKey = 1;
      if (!/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) { if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button'); }
      label(el);
    }
  }
  var pending = false;
  function run() { pending = false; prep(D); }
  new MutationObserver(function () { if (!pending) { pending = true; (W.requestAnimationFrame || setTimeout)(run); } }).observe(D.documentElement, { childList: true, subtree: true });
  if (D.readyState !== 'loading') prep(D); else D.addEventListener('DOMContentLoaded', function () { prep(D); });

  function press(el) {
    if (/^(BUTTON|A)$/.test(el.tagName)) { el.click(); return; }
    var ev; try { ev = new MouseEvent('click', { bubbles: true, cancelable: true, view: W }); } catch (e) { ev = D.createEvent('MouseEvents'); ev.initEvent('click', true, true); }
    el.dispatchEvent(ev);
  }
  function center(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }
  D.addEventListener('keydown', function (e) {
    var el = e.target; if (!el || !el.matches || !el.matches(SEL)) return;
    if ((e.key === 'Enter' || e.key === ' ') && el.tagName !== 'BUTTON' && el.tagName !== 'A') { e.preventDefault(); press(el); return; }
    if (!BOARD || !/^Arrow/.test(e.key)) return;
    var box = el.closest(BOARD); if (!box) return;
    e.preventDefault();
    var c = center(el), best = null, bestD = 1e9, dx = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0, dy = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
    var all = box.querySelectorAll(SEL);
    for (var i = 0; i < all.length; i++) {
      var o = all[i]; if (o === el || o.offsetParent === null && o.getBBox == null) continue;
      var p = center(o); if (!p.w && !p.h) continue;
      var ax = p.x - c.x, ay = p.y - c.y, along = ax * dx + ay * dy;
      if (along <= 2) continue;
      var across = Math.abs(ax * dy) + Math.abs(ay * dx), d = along + across * 2.2;
      if (d < bestD) { bestD = d; best = o; }
    }
    if (best) best.focus();
  });
  var st = D.createElement('style');
  st.textContent = SEL.split(',').map(function (s) { return s.trim() + ':focus-visible'; }).join(',') + '{outline:3px solid #d8b860 !important;outline-offset:2px;border-radius:4px}';
  D.head.appendChild(st);
})(window, document);

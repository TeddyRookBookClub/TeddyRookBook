/* RuleDrag: dragging that only lands on allowed states. Written for this site (used by the Contraption Workshop,
   /games/contraption/, and the continued-fraction tree, /connections/rhythm-of-numbers/tree/).

   The idea, from the paper "Declarative Dragging" (Horowitz, Blinn and Heer, UIST 2026): while you drag, the page
   does not move the thing to the pointer. It asks which allowed states there are, works out where the dragged handle
   would sit in each one, and shows the state whose handle is nearest the pointer. Dragging becomes a way to explore
   the states that keep the rules true. This file is our own small version, with no outside code.

   RuleDrag.nearest(states, at, pt, bonus)  -> {state, d} or null. at(state) gives the handle's point {x, y};
                                              bonus(state) (optional) is a distance in px taken off, a "magnet".
   RuleDrag.toward(states, at, from, dx, dy) -> the nearest state in the direction (dx, dy) from point `from`
                                              (for the arrow keys), or null.
   RuleDrag.attach(el, opts) wires pointer events on el (mouse, pen and touch; one pointer at a time).
     opts.point(e)          -> {x, y} in your own coordinates
     opts.begin(pt, e)      -> a session, or null to ignore this press. A session has:
        states: [...]  and  at(state)          the allowed states and where each one puts the handle; or
        project(pt)    -> state                 a rule that maps any point to an allowed state (continuous rules);
        grab: {x, y}   (optional)              the handle's point at the press, so the handle keeps its offset;
        bonus(state)   (optional)              magnet distance in px;
        move(state, pt)                         called when the pointer moves (state is the chosen state);
        end(state)  and  cancel()               called on release, and on Escape or a lost pointer.
   Returns a function that removes the listeners. */
(function (g) {
  'use strict';
  function nearest(states, at, pt, bonus) {
    var best = null, bd = Infinity;
    for (var i = 0; i < states.length; i++) {
      var s = states[i], p = at(s);
      if (!p) continue;
      var d = Math.hypot(p.x - pt.x, p.y - pt.y) - (bonus ? (bonus(s) || 0) : 0);
      if (d < bd) { bd = d; best = s; }
    }
    return best === null ? null : { state: best, d: bd };
  }
  function toward(states, at, from, dx, dy) {
    var L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, best = null, bd = Infinity;
    for (var i = 0; i < states.length; i++) {
      var p = at(states[i]);
      if (!p) continue;
      var vx = p.x - from.x, vy = p.y - from.y, along = vx * ux + vy * uy;
      if (along < 0.5) continue;
      var side = Math.abs(vx * uy - vy * ux), score = along + 2.5 * side;
      if (side > along * 1.5 + 2) continue;
      if (score < bd) { bd = score; best = states[i]; }
    }
    return best;
  }
  function attach(el, o) {
    var ses = null, pid = null, off = { x: 0, y: 0 }, last = null;
    el.style.touchAction = 'none';
    function pick(pt) {
      var q = { x: pt.x + off.x, y: pt.y + off.y };
      var st = ses.project ? ses.project(q) : (function () { var r = nearest(ses.states, ses.at, q, ses.bonus); return r && r.state; })();
      if (st !== null && st !== undefined) last = st;
      if (last !== null) ses.move(last, q);
    }
    function down(e) {
      if (ses || (e.button !== undefined && e.button > 0)) return;
      var pt = o.point(e), s = o.begin(pt, e);
      if (!s) return;
      ses = s; pid = e.pointerId; last = null;
      off = s.grab ? { x: s.grab.x - pt.x, y: s.grab.y - pt.y } : { x: 0, y: 0 };
      try { el.setPointerCapture(pid); } catch (err) { /* older browsers */ }
      e.preventDefault();
      pick(pt);
    }
    function move(e) { if (ses && e.pointerId === pid) { e.preventDefault(); pick(o.point(e)); } }
    function finish(ok) {
      if (!ses) return;
      var s = ses; ses = null; pid = null;
      if (ok && last !== null) s.end(last); else if (s.cancel) s.cancel();
    }
    function up(e) { if (ses && e.pointerId === pid) finish(true); }
    function lost(e) { if (ses && e.pointerId === pid) finish(false); }
    function key(e) { if (ses && e.key === 'Escape') finish(false); }
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', lost);
    el.addEventListener('lostpointercapture', lost);
    document.addEventListener('keydown', key);
    return function () {
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', lost);
      el.removeEventListener('lostpointercapture', lost); document.removeEventListener('keydown', key);
    };
  }
  var api = { nearest: nearest, toward: toward, attach: attach };
  if (typeof module === 'object' && module.exports) module.exports = api; else g.RuleDrag = api;
})(typeof window !== 'undefined' ? window : this);

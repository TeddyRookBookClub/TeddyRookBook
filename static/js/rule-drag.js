/* RuleDrag: dragging that only lands on allowed states. Written for this site (used by the Contraption Workshop,
   /games/contraption/, the continued-fraction tree, /connections/rhythm-of-numbers/tree/, the Circuit Bench,
   /science-lab/circuit-bench/, and the Equation Balancer, /science-lab/equation-balancer/).

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
   Returns a function that removes the listeners.
   RuleDrag.keys(el, opts) is the keyboard twin of attach (added for the Circuit Bench and the Equation Balancer):
     the arrow keys move a focus among the things you can pick up; Enter picks one up; the arrow keys then move it
     between its allowed states (the nearest one in that direction, using toward); Enter drops it; Escape puts it back.
     opts.items()           -> the things that can be picked up now
     opts.itemAt(item)      -> {x, y}; opts.same(a, b) (optional) -> true if a and b are the same thing
     opts.focus(item)       -> called when the focus moves (draw a ring, announce it)
     opts.pick(item)        -> a session like attach's ({states, at, move(state), end(state), cancel()}, and
                               start: the state to begin in), or null if it can't be picked up
     opts.blocked()         (optional) called when an arrow key finds no state that way
     opts.key(e, focused)   (optional) gets every key first; return true if it handled it
     opts.pickKeys          (optional) the keys that pick up and drop, default ['Enter', ' ']
   Returns {focused(), holding(), setFocus(item), detach()}. */
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
  function keys(el, o) {
    var foc = null, ses = null, cur = null, pk = o.pickKeys || ['Enter', ' '];
    var DIR = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    function same(a, b) { return o.same ? o.same(a, b) : a === b; }
    function down(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (!ses && o.key && o.key(e, foc)) return;
      var d = DIR[e.key];
      if (d) {
        e.preventDefault();
        if (ses) {
          var n = toward(ses.states, ses.at, ses.at(cur), d[0], d[1]);
          if (n !== null) { cur = n; ses.move(cur, ses.at(cur)); } else if (o.blocked) o.blocked();
          return;
        }
        var its = o.items(), here = null;
        if (!its.length) return;
        if (foc) for (var i = 0; i < its.length; i++) if (same(its[i], foc)) { here = its[i]; break; }
        var nf = here ? toward(its, o.itemAt, o.itemAt(here), d[0], d[1]) : its[0];
        if (nf) { foc = nf; o.focus(foc); } else if (o.blocked) o.blocked();
        return;
      }
      if (pk.indexOf(e.key) >= 0) {
        if (ses) { e.preventDefault(); var s = ses; ses = null; s.end(cur); return; }
        if (foc) { var s2 = o.pick(foc); if (s2) { e.preventDefault(); ses = s2; cur = s2.start !== undefined ? s2.start : s2.states[0]; ses.move(cur, ses.at(cur)); } }
        return;
      }
      if (e.key === 'Escape' && ses) { e.preventDefault(); var s3 = ses; ses = null; if (s3.cancel) s3.cancel(); }
    }
    function blur() { if (ses) { var s = ses; ses = null; if (s.cancel) s.cancel(); } }
    el.addEventListener('keydown', down);
    el.addEventListener('blur', blur);
    return {
      focused: function () { return foc; }, holding: function () { return !!ses; },
      setFocus: function (it) { foc = it; if (it && o.focus) o.focus(it); },
      detach: function () { el.removeEventListener('keydown', down); el.removeEventListener('blur', blur); }
    };
  }
  var api = { nearest: nearest, toward: toward, attach: attach, keys: keys };
  if (typeof module === 'object' && module.exports) module.exports = api; else g.RuleDrag = api;
})(typeof window !== 'undefined' ? window : this);

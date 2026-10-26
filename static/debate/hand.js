/* Hand signals for the debate timer: a cartoon hand (the site's one skin color) holding up fingers.
   DebateHand.svg({fingers, half, fist}) returns SVG markup: one hand for 0-5 fingers, two hands for 6-10. */
(function () {
  'use strict';
  var SKIN = '#ffcc4d', LINE = '#e8a93a', SW = 4;
  // four fingers: x, top when raised; index finger first (from the thumb side)
  var F = [{ x: 30, top: 14 }, { x: 52, top: 4 }, { x: 74, top: 12 }, { x: 96, top: 28 }];
  function finger(f, up, bent) {
    if (bent) {
      // bent at the middle knuckle: half height with the tip folded forward
      return '<rect x="' + f.x + '" y="48" width="20" height="44" rx="10" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="' + SW + '"/>' +
        '<rect x="' + (f.x - 14) + '" y="40" width="34" height="18" rx="9" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="' + SW + '"/>';
    }
    if (up) return '<rect x="' + f.x + '" y="' + f.top + '" width="20" height="' + (100 - f.top) + '" rx="10" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="' + SW + '"/>';
    // folded: just the knuckle showing above the palm
    return '<rect x="' + f.x + '" y="64" width="20" height="30" rx="10" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="' + SW + '"/>';
  }
  function thumb(up) {
    if (up) return '<rect x="10" y="84" width="22" height="64" rx="11" transform="rotate(-35 21 146)" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="' + SW + '"/>';
    return '<rect x="30" y="112" width="56" height="20" rx="10" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="' + SW + '"/>';
  }
  // n raised fingers (0-5) on one hand; the thumb is the fifth
  function hand(n, opt) {
    opt = opt || {};
    var s = '';
    var palm = '<rect x="24" y="80" width="98" height="92" rx="28" fill="' + SKIN + '" stroke="' + LINE + '" stroke-width="' + SW + '"/>';
    for (var i = 0; i < 4; i++) s += finger(F[i], i < n, opt.half && i === 0);
    var th = n >= 5;
    // palm drawn after the fingers so the knuckles sit behind it, then the thumb in front
    s += palm + '<path d="M40 150 q30 10 66 0" fill="none" stroke="' + LINE + '" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
    s += thumb(th);
    return '<g>' + s + '</g>';
  }
  function svg(sig) {
    var n = sig.fist ? 0 : (sig.fingers || 0);
    var label = sig.label || '';
    if (n > 5) {
      return '<svg viewBox="-34 0 348 190" role="img" aria-label="' + label + '"><g transform="translate(0,6)">' + hand(5) + '</g><g transform="translate(280,6) scale(-1,1)">' + hand(n - 5) + '</g></svg>';
    }
    return '<svg viewBox="-34 0 172 190" role="img" aria-label="' + label + '"><g transform="translate(0,6)">' + hand(n, { half: sig.half }) + '</g></svg>';
  }
  window.DebateHand = { svg: svg };
})();

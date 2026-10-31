/* Playing-card faces drawn in SVG (original, plain and readable). TRBCards.svg('KH', {w: 80}) -> markup string.
   Number cards use the usual pip layout; the court cards are simple cartoon figures in the site's one skin color. */
(function (root) {
  'use strict';
  var GLYPH = { S: '♠', H: '♥', D: '♦', C: '♣' }, VS = '︎';   // text style, never emoji
  var RED = { H: 1, D: 1 };
  var L = 30, C = 50, R = 70;
  var PIPS = {
    '2': [[C, 30], [C, 110]], '3': [[C, 30], [C, 70], [C, 110]],
    '4': [[L, 30], [R, 30], [L, 110], [R, 110]], '5': [[L, 30], [R, 30], [C, 70], [L, 110], [R, 110]],
    '6': [[L, 30], [R, 30], [L, 70], [R, 70], [L, 110], [R, 110]],
    '7': [[L, 30], [R, 30], [C, 50], [L, 70], [R, 70], [L, 110], [R, 110]],
    '8': [[L, 30], [R, 30], [C, 50], [L, 70], [R, 70], [C, 90], [L, 110], [R, 110]],
    '9': [[L, 30], [R, 30], [L, 57], [R, 57], [C, 70], [L, 83], [R, 83], [L, 110], [R, 110]],
    '10': [[L, 30], [R, 30], [C, 43], [L, 57], [R, 57], [L, 83], [R, 83], [C, 97], [L, 110], [R, 110]]
  };
  function pip(x, y, s, size) {
    var rot = y > 72 ? ' transform="rotate(180 ' + x + ' ' + y + ')"' : '';
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" text-anchor="middle" dominant-baseline="central"' + rot + '>' + GLYPH[s] + VS + '</text>';
  }
  function court(r, s, col) {
    // a simple figure: shoulders in the suit color, a face, and a crown (king, queen) or a cap (jack)
    var skin = '#ffcc4d', line = '#e8a93a', gold = '#b8963e', o = '';
    o += '<rect x="22" y="24" width="56" height="92" rx="6" fill="' + (RED[s] ? '#fdeeee' : '#eef1f4') + '" stroke="' + col + '" stroke-width="1"/>';
    o += '<path d="M30 112 C30 88 40 80 50 80 C60 80 70 88 70 112 Z" fill="' + col + '"/>';
    o += '<path d="M44 82 L50 92 L56 82" fill="none" stroke="#fff" stroke-width="2"/>';
    o += '<circle cx="50" cy="64" r="13" fill="' + skin + '" stroke="' + line + '" stroke-width="1.6"/>';
    o += '<circle cx="45.5" cy="63" r="1.6" fill="#333"/><circle cx="54.5" cy="63" r="1.6" fill="#333"/>';
    o += '<path d="M46 69 Q50 72 54 69" fill="none" stroke="#333" stroke-width="1.3" stroke-linecap="round"/>';
    if (r === 'K') {
      o += '<path d="M37 52 L37 40 L43 46 L50 36 L57 46 L63 40 L63 52 Z" fill="' + gold + '" stroke="#8a6d22" stroke-width="1"/>';
      o += '<path d="M42 72 Q50 82 58 72 L58 76 Q50 86 42 76 Z" fill="#8a6d22" opacity=".55"/>';
    } else if (r === 'Q') {
      o += '<path d="M39 52 L41 43 L46 48 L50 41 L54 48 L59 43 L61 52 Z" fill="' + gold + '" stroke="#8a6d22" stroke-width="1"/>';
      o += '<circle cx="50" cy="45" r="1.8" fill="#fff"/>';
      o += '<path d="M37 60 Q36 76 41 80 M63 60 Q64 76 59 80" fill="none" stroke="#7a4b1e" stroke-width="3" stroke-linecap="round"/>';
    } else {
      o += '<path d="M36 55 Q38 42 50 42 Q62 42 64 55 Z" fill="' + col + '"/><path d="M60 46 Q70 40 72 48" fill="none" stroke="' + gold + '" stroke-width="2.4" stroke-linecap="round"/>';
    }
    o += '<text x="50" y="104" font-size="12" text-anchor="middle" fill="#fff" font-weight="700">' + GLYPH[s] + VS + '</text>';
    return o;
  }
  function svg(code, opt) {
    opt = opt || {};
    var r = code.slice(0, -1), s = code.slice(-1), col = RED[s] ? '#c0392b' : '#1d1d1d';
    var w = opt.w || 70, title = opt.title;
    var o = '<svg class="card-svg" viewBox="0 0 100 140" width="' + w + '" height="' + Math.round(w * 1.4) + '" role="img" aria-label="' + (title || '') + '"' + (title ? '' : ' aria-hidden="true"') + '>';
    o += '<rect x="1" y="1" width="98" height="138" rx="9" fill="#fff" stroke="#9aa39e" stroke-width="1.5"/>';
    o += '<g fill="' + col + '" font-family="Georgia, \'Times New Roman\', serif">';
    var rs = r === '10' ? 17 : 20;
    o += '<text x="11" y="21" font-size="' + rs + '" font-weight="700" text-anchor="middle">' + r + '</text><text x="11" y="37" font-size="15" text-anchor="middle">' + GLYPH[s] + VS + '</text>';
    o += '<g transform="rotate(180 50 70)"><text x="11" y="21" font-size="' + rs + '" font-weight="700" text-anchor="middle">' + r + '</text><text x="11" y="37" font-size="15" text-anchor="middle">' + GLYPH[s] + VS + '</text></g>';
    if (r === 'A') o += pip(50, 70, s, 52);
    else if (PIPS[r]) PIPS[r].forEach(function (p) { o += pip(p[0], p[1], s, 22); });
    else o += court(r, s, col);
    o += '</g></svg>';
    return o;
  }
  // a short text label with the suit glyph, e.g. "K♥"
  function label(code) { return code.slice(0, -1) + GLYPH[code.slice(-1)] + VS; }
  root.TRBCards = { svg: svg, label: label, red: function (c) { return !!RED[c.slice(-1)]; }, GLYPH: GLYPH };
})(typeof self !== 'undefined' ? self : this);

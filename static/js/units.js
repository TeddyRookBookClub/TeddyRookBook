/* Units: show measurements in US units, metric, or both (the default). Text inside [data-units] is converted in place;
   pages can also listen for the "trb-units" event. The choice is kept in this browser only. */
(function (W, D) {
  'use strict';
  var KEY = 'trb-units', mode = 'both';
  try { var s = W.localStorage.getItem(KEY); if (s === 'us' || s === 'metric' || s === 'both') mode = s; } catch (e) { }

  // ---------- number parsing and formatting ----------
  var FR = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };
  function num(t) {
    t = t.replace(/,/g, '').trim();
    var m = t.match(/^(-?\d+)\s+(\d+)\/(\d+)$/); if (m) return +m[1] + m[2] / m[3];
    m = t.match(/^(\d+)\/(\d+)$/); if (m) return m[1] / m[2];
    m = t.match(/^(\d+)?\s*([½¼¾⅓⅔⅛])$/); if (m) return (+(m[1] || 0)) + FR[m[2]];
    return parseFloat(t);
  }
  function rnd(v, d) { var p = Math.pow(10, d); return Math.round(v * p) / p; }
  function fmt(v, d) {
    var r = rnd(v, d), s = Math.abs(r) >= 1000 ? Math.round(r).toLocaleString('en-US') : String(r);
    return s.replace(/^-0$/, '0');
  }
  // each unit: factor to its metric base and a chooser that picks a readable metric unit for the largest value
  function len(cm, src) { // cm in, returns [unit, divisor, decimals]
    var a = Math.abs(cm);
    if (src === 'in' && a >= 10 && a < 300) return ['cm', 1, 0];
    if (a < 1) return ['mm', 0.1, a < 0.2 ? 1 : 0];
    if (a < 100) return ['cm', 1, a < 10 ? 1 : 0];
    if (a < 100000) return ['m', 100, a < 1000 ? 1 : 0];
    return ['km', 100000, a < 1000000 ? 1 : 0];
  }
  var U = {
    in: { to: 2.54, pick: len }, ft: { to: 30.48, pick: len }, yd: { to: 91.44, pick: len }, mi: { to: 160934.4, pick: len },
    sqft: { to: 0.092903, pick: function (a) { return Math.abs(a) < 1 ? ['m²', 1, 2] : Math.abs(a) < 10 ? ['m²', 1, 1] : ['m²', 1, 0]; } },
    acre: { to: 0.404686, pick: function (a) { return ['ha', 1, Math.abs(a) < 10 ? 2 : 1]; } },
    lb: { to: 0.453592, pick: function (a) { return Math.abs(a) < 1 ? ['g', 0.001, 0] : ['kg', 1, Math.abs(a) < 10 ? 1 : 0]; } },
    oz: { to: 28.3495, pick: function (a) { return a < 1000 ? ['g', 1, 0] : ['kg', 1000, 1]; } },
    gal: { to: 3.78541, pick: function (a) { return Math.abs(a) < 1 ? ['L', 1, 1] : ['L', 1, 0]; } },
    qt: { to: 0.946353, pick: function (a) { return ['L', 1, 1]; } },
    F: { temp: true }
  };
  var WORD = [
    ['sqft', 'square feet|square foot|sq\\.? ?ft'], ['acre', 'acres|acre'],
    ['in', 'inches|inch|in\\.?(?=\\s*(?:deep|wide|long|tall|high|apart|thick|across|diameter|in diameter|from|below|above|of|off|on|each|band|x\\s|×|\\)|,|;|:|\\.(?!\\d)|$))|″'],
    ['ft', 'feet|foot|ft'], ['yd', 'yards|yard|yd'], ['mi', 'miles|mile'],
    ['lb', 'pounds|pound|lbs?'], ['oz', 'ounces|ounce|oz'],
    ['gal', 'gallons|gallon|gal'], ['qt', 'quarts|quart|qt'],
    ['F', '°\\s?F|degrees F(?:ahrenheit)?|degrees Fahrenheit']
  ];
  var N = '(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+\\s?[½¼¾⅓⅔⅛]|[½¼¾⅓⅔⅛]|\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?)';
  var SEP = '\\s*(?:–|-|—|to|or|and)\\s*';
  var UNIT = '(' + WORD.map(function (w) { return w[1]; }).join('|') + ')';
  // 1) "5-gallon", "6-ft", "1/4-inch": hyphenated adjectives; 2) values, ranges and A x B dimensions followed by a unit
  var HAS = '(\\s*\\((?:about\\s*|≈\\s*)?[-–\\d.,\\s\\/x×to]+\\s*(?:mm|cm|m|km|m²|ha|L|ml|g|kg|°\\s?C)\\))?';
  var RE = new RegExp('(^|[^\\w/.])(-?' + N + '(?:' + SEP + '-?' + N + ')*(?:\\s*[x×]\\s*' + N + ')*)(\\s?-\\s?|\\s*)' + UNIT + '(?![A-Za-z])' + HAS, 'g');
  function kind(u) { for (var i = 0; i < WORD.length; i++) if (new RegExp('^(?:' + WORD[i][1] + ')$', 'i').test(u)) return WORD[i][0]; return null; }
  function metric(nums, joins, k) {
    if (k === 'F') return nums.map(function (f) { return fmt((f - 32) * 5 / 9, 0); }).join(' to ') + '°C';
    var u = U[k], vals = nums.map(function (v) { return v * u.to; }), big = Math.max.apply(null, vals.map(Math.abs));
    var p = u.pick(big, k), out = vals.map(function (v) { return fmt(v / p[1], p[2]); });
    var j = joins.length && joins[0] === 'x' ? ' × ' : '–';
    return out.join(j) + ' ' + p[0];
  }
  function convert(text, m) {
    if (m === 'us') return text;
    return text.replace(RE, function (all, pre, numtxt, gap, unit, has, off, str) {
      if (has) return m === 'metric' ? pre + has.trim().replace(/^\(\s*/, '').replace(/\)$/, '') : all;
      var k = kind(unit.replace(/\s+/g, ' ')); if (!k) return all;
      var rest = str.slice(off + all.length);
      if (k === 'in' && /^in$/i.test(unit) && /^\s*(?:the|a|an|this|that|your|my|our|their)\b/i.test(rest)) return all;
      var lead = /^-/.test(numtxt), body = lead ? numtxt.slice(1) : numtxt;
      if (lead && k !== 'F') return all;
      var parts = body.split(/\s*(–|-|—|\bto\b|\bor\b|\band\b|x|×)\s*/).filter(function (x) { return x !== ''; });
      var nums = [], joins = [];
      for (var i = 0; i < parts.length; i++) { if (i % 2 === 0) nums.push(num(parts[i])); else joins.push(parts[i] === '×' ? 'x' : parts[i]); }
      if (!nums.length || nums.length !== joins.length + 1 || nums.some(isNaN)) return all;
      if (lead) nums[0] = -nums[0];
      var mt = metric(nums, joins, k);
      if (m === 'metric') return pre + mt;
      var hyph = /-/.test(gap);
      return hyph ? pre + numtxt + gap + unit + ' (' + mt + ')' : all + ' (' + mt + ')';
    });
  }
  W.TRBconvertUnits = convert;

  // ---------- apply to the page ----------
  var nodes = [];
  function skip(n) { var p = n.parentNode; return !p || /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION|CODE|PRE)$/.test(p.nodeName) || (p.closest && p.closest('[data-nounits]')); }
  function doNode(n) {
    if (n.__trbOut !== undefined && n.nodeValue === n.__trbOut) return;
    if (skip(n)) return;
    if (n.__trbOrig === undefined) nodes.push(n);
    n.__trbOrig = n.nodeValue;
    var out = convert(n.__trbOrig, mode);
    n.__trbOut = out; if (out !== n.nodeValue) n.nodeValue = out;
  }
  function walk(root) {
    if (root.nodeType === 3) { doNode(root); return; }
    if (root.nodeType !== 1) return;
    var tw = D.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n; while ((n = tw.nextNode())) if (/\d|[½¼¾]/.test(n.nodeValue)) doNode(n);
  }
  function reapply() {
    nodes = nodes.filter(function (n) { return n.isConnected; });
    nodes.forEach(function (n) { var out = convert(n.__trbOrig, mode); n.__trbOut = out; if (n.nodeValue !== out) n.nodeValue = out; });
  }
  function set(m) {
    mode = m; try { W.localStorage.setItem(KEY, m); } catch (e) { }
    reapply();
    D.querySelectorAll('.un-pick button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.u === m); });
    D.dispatchEvent(new CustomEvent('trb-units', { detail: m }));
  }
  W.TRBUnits = { mode: function () { return mode; }, set: set, convert: convert };
  function picker() {
    var d = D.createElement('div'); d.className = 'un-pick'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Units'); d.setAttribute('data-nounits', '');
    d.innerHTML = '<span>Units</span>' + [['both', 'Both'], ['us', 'US'], ['metric', 'Metric']].map(function (o) { return '<button type="button" data-u="' + o[0] + '" aria-pressed="' + (o[0] === mode) + '">' + o[1] + '</button>'; }).join('');
    d.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) set(b.dataset.u); });
    return d;
  }
  function init() {
    var roots = D.querySelectorAll('[data-units]'); if (!roots.length) return;
    var slots = D.querySelectorAll('[data-units-ui]');
    if (slots.length) slots.forEach(function (s) { s.appendChild(picker()); });
    else { var r = roots[0], h = r.querySelector('.hs-hero') || r.querySelector('.hs-crumbs') || r.querySelector('h1'); var p = picker(); p.classList.add('un-float'); if (h && h.parentNode) h.parentNode.insertBefore(p, h.nextSibling); else r.insertBefore(p, r.firstChild); }
    roots.forEach(function (r) {
      walk(r);
      new MutationObserver(function (ms) {
        ms.forEach(function (m) {
          if (m.type === 'characterData') doNode(m.target);
          else m.addedNodes.forEach(walk);
        });
      }).observe(r, { childList: true, subtree: true, characterData: true });
    });
    if (mode !== 'both') D.dispatchEvent(new CustomEvent('trb-units', { detail: mode }));
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})(window, document);

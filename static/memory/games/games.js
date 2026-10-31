/* Memory games (/memory/games/<game>/): palace, chunk-it, story-chain, card-pairs, warm-up. Needs core.js (TRBMem).
   Each game is drawn into #mg[data-game]. Bests and the card-pairs schedule live in trb-memory-v1 (games: {...}). */
(function () {
  'use strict';
  var M = window.TRBMem, root = document.getElementById('mg');
  if (!M || !root) return;
  var GAME = root.dataset.game;

  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k];
      else if (k === 'cls') e.className = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function btn(t, f, c) { return h('button', { type: 'button', cls: 'mc-btn' + (c ? ' ' + c : ''), text: t, onclick: f }); }
  function shuffle(a) { return M.shuffle(a, Math.random); }
  function G() { var o = M.load(); o.games = o.games || {}; o.games[GAME] = o.games[GAME] || {}; return { o: o, g: o.games[GAME] }; }
  function focus(el) { setTimeout(function () { if (el) try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }, 30); }

  // everyday things to remember (no people): emoji picture + word
  var THINGS = [['🍎', 'apple'], ['🚲', 'bicycle'], ['🎈', 'balloon'], ['🐸', 'frog'], ['🧀', 'cheese'], ['🎺', 'trumpet'], ['🦆', 'duck'], ['🍌', 'banana'],
    ['⏰', 'alarm clock'], ['🐢', 'turtle'], ['🎩', 'top hat'], ['🍕', 'pizza'], ['🔑', 'key'], ['🐘', 'elephant'], ['☂️', 'umbrella'], ['🥕', 'carrot'],
    ['🚂', 'train'], ['🐝', 'bee'], ['🧦', 'sock'], ['🍩', 'doughnut'], ['🪁', 'kite'], ['🐙', 'octopus'], ['🎻', 'violin'], ['🧲', 'magnet'],
    ['🦒', 'giraffe'], ['🍦', 'ice cream'], ['🚀', 'rocket'], ['🐧', 'penguin'], ['🥁', 'drum'], ['🌵', 'cactus'], ['🧸', 'teddy bear'], ['🍉', 'watermelon'],
    ['⚽', 'soccer ball'], ['🦀', 'crab'], ['🕯️', 'candle'], ['🐌', 'snail'], ['🎁', 'present'], ['🥚', 'egg'], ['🦉', 'owl'], ['🧁', 'cupcake'],
    ['📯', 'horn'], ['🐠', 'fish'], ['🍋', 'lemon'], ['🧹', 'broom'], ['🐇', 'rabbit'], ['🪣', 'bucket'], ['🦔', 'hedgehog'], ['🍪', 'cookie']];
  function pick(n) { return shuffle(THINGS.slice()).slice(0, n).map(function (t) { return { e: t[0], w: t[1] }; }); }

  var GAMES = {};

  /* ======================= Memory Palace Builder ======================= */
  var STOPS = [
    { n: 'Front door', x: 66, y: 240, draw: '<rect x="54" y="214" width="26" height="52" rx="2" fill="#7a4b2a"/><circle cx="75" cy="242" r="2" fill="#e8c86a"/>' },
    { n: 'Hall mirror', x: 118, y: 212, draw: '<ellipse cx="118" cy="214" rx="10" ry="14" fill="#cfe6f2" stroke="#8a6d3b" stroke-width="2.5"/>' },
    { n: 'Kitchen table', x: 182, y: 248, draw: '<rect x="164" y="244" width="40" height="5" fill="#9b6b3e"/><rect x="168" y="249" width="3" height="17" fill="#9b6b3e"/><rect x="197" y="249" width="3" height="17" fill="#9b6b3e"/>' },
    { n: 'Stove', x: 238, y: 236, draw: '<rect x="224" y="236" width="28" height="30" fill="#e7e2da" stroke="#777" stroke-width="1.5"/><circle cx="232" cy="240" r="3" fill="#555"/><circle cx="244" cy="240" r="3" fill="#555"/>' },
    { n: 'Sofa', x: 296, y: 248, draw: '<rect x="276" y="244" width="44" height="16" rx="5" fill="#5b8c6a"/><rect x="276" y="236" width="44" height="10" rx="4" fill="#4c7a5a"/>' },
    { n: 'Stairs', x: 340, y: 214, draw: '<path d="M326 266 h8 v-10 h8 v-10 h8 v-10 h8 v-10" fill="none" stroke="#8a6d3b" stroke-width="3"/>' },
    { n: 'Piano', x: 304, y: 150, draw: '<rect x="282" y="140" width="44" height="26" fill="#2b2b2b"/><rect x="284" y="150" width="40" height="5" fill="#fff"/>' },
    { n: 'Easel', x: 205, y: 140, draw: '<path d="M196 170 L205 122 L214 170" fill="none" stroke="#8a6d3b" stroke-width="2.5"/><rect x="192" y="126" width="26" height="20" fill="#fff" stroke="#8a6d3b" stroke-width="1.5"/>' },
    { n: 'Chalkboard', x: 92, y: 128, draw: '<rect x="70" y="114" width="46" height="28" fill="#2f5d46" stroke="#8a6d3b" stroke-width="3"/>' },
    { n: 'Bookshelf', x: 132, y: 154, draw: '<rect x="124" y="140" width="20" height="30" fill="#9b6b3e"/><rect x="126" y="143" width="4" height="10" fill="#c0392b"/><rect x="131" y="143" width="4" height="10" fill="#2e6f9e"/><rect x="136" y="143" width="5" height="10" fill="#e0b45c"/><rect x="126" y="157" width="15" height="10" fill="#5b8c6a"/>' }
  ];
  function houseSvg(opt) {
    opt = opt || {};
    var o = '<svg class="mg-house" viewBox="0 0 400 290" role="img" aria-label="A house cut open: three rooms upstairs, three downstairs, with numbered stops along a route">';
    o += '<rect x="0" y="0" width="400" height="290" fill="var(--mg-sky)"/>';
    o += '<path d="M24 92 L200 18 L376 92 Z" fill="#c9653f" stroke="#8a3f22" stroke-width="2"/>';
    o += '<rect x="40" y="92" width="320" height="178" fill="var(--mg-wall)" stroke="#5a4a3a" stroke-width="3"/>';
    o += '<line x1="40" y1="180" x2="360" y2="180" stroke="#5a4a3a" stroke-width="4"/>';
    o += '<line x1="150" y1="92" x2="150" y2="270" stroke="#5a4a3a" stroke-width="2.5"/><line x1="262" y1="92" x2="262" y2="270" stroke="#5a4a3a" stroke-width="2.5"/>';
    o += '<rect x="0" y="270" width="400" height="20" fill="#8cc06a"/>';
    // room names: upstairs on the roof's edge, downstairs on the lawn, clear of the stops
    var rooms = [['Schoolroom', 95, 86, '#fff'], ['Art corner', 206, 86, '#fff'], ['Music room', 311, 86, '#fff'], ['Front hall', 95, 284, '#24461f'], ['Kitchen', 206, 284, '#24461f'], ['Family room', 311, 284, '#24461f']];
    rooms.forEach(function (r) { o += '<text x="' + r[1] + '" y="' + r[2] + '" text-anchor="middle" font-size="10" fill="' + r[3] + '" font-weight="700">' + r[0] + '</text>'; });
    STOPS.forEach(function (s) { o += s.draw; });
    var use = opt.n || STOPS.length, path = 'M' + STOPS.slice(0, use).map(function (s) { return s.x + ' ' + s.y; }).join(' L');
    o += '<path d="' + path + '" fill="none" stroke="#b8963e" stroke-width="2" stroke-dasharray="5 5" opacity=".9"/>';
    o += '</svg>';
    return o;
  }
  function person(x, y) {   // the walker, in the site's one cartoon skin color
    return '<g class="mg-walker" transform="translate(' + x + ' ' + y + ')"><rect x="-6" y="-2" width="12" height="16" rx="4" fill="#6b4fa3"/><circle cx="0" cy="-9" r="7" fill="#ffcc4d" stroke="#e8a93a" stroke-width="1.5"/><circle cx="-2.4" cy="-10" r="1" fill="#333"/><circle cx="2.4" cy="-10" r="1" fill="#333"/><rect x="-5" y="14" width="4" height="8" fill="#2b2b2b"/><rect x="1" y="14" width="4" height="8" fill="#2b2b2b"/></g>';
  }
  GAMES.palace = function () {
    var level = 5, things = [], placed = {}, order = [], at = 0, score = 0, mode = 'pick';
    function intro() {
      root.innerHTML = '';
      var b = G().g.best;
      root.appendChild(h('p', { cls: 'mc-tip', text: 'A memory palace is a place you know, with stops in a fixed order. Things left at the stops come back when you walk the route in your head. Here the house is drawn for you; the real thing is your own home.' }));
      var seg = h('div', { cls: 'mc-seg', role: 'group', 'aria-label': 'How many things' });
      [5, 7, 10].forEach(function (n) { seg.appendChild(h('button', { type: 'button', cls: 'mc-btn' + (level === n ? ' is-on' : ''), 'aria-pressed': level === n ? 'true' : 'false', text: n + ' things', onclick: function () { level = n; intro(); } })); });
      root.appendChild(seg);
      if (b) root.appendChild(h('p', { cls: 'mc-small', text: 'Your best: ' + b }));
      root.appendChild(h('div', { cls: 'mc-row' }, [btn('Build my palace', build, 'mc-primary')]));
      root.appendChild(h('div', { cls: 'mg-housewrap', html: houseSvg() }));
      drawStops(root.querySelector('svg'), {});
    }
    function drawStops(svg, opts) {
      var NS = 'http://www.w3.org/2000/svg';
      STOPS.slice(0, opts.n || STOPS.length).forEach(function (s, i) {
        var g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'mg-stop' + (opts.active === i ? ' is-active' : '') + (opts.click ? ' is-click' : ''));
        var it = placed[i];
        g.innerHTML = '<circle cx="' + s.x + '" cy="' + (s.y - 22) + '" r="11" class="mg-dot"/>' +
          '<text x="' + s.x + '" y="' + (s.y - 22) + '" text-anchor="middle" dominant-baseline="central" font-size="' + (it && opts.show ? 14 : 11) + '" class="mg-dott">' + (it && opts.show ? it.e : (i + 1)) + '</text>';
        if (opts.click) {
          g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Stop ' + (i + 1) + ': ' + s.n + (it ? ', has the ' + it.w : ''));
          g.addEventListener('click', function () { opts.click(i); });
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.click(i); } });
        }
        svg.appendChild(g);
      });
      if (opts.walker != null) { var w = document.createElementNS(NS, 'g'); w.innerHTML = person(STOPS[opts.walker].x + 16, STOPS[opts.walker].y); svg.appendChild(w.firstChild); }
    }
    function build() {
      things = pick(level); placed = {}; at = 0;
      step();
    }
    function step() {
      root.innerHTML = '';
      if (at >= things.length) return ready();
      var t = things[at];
      root.appendChild(h('p', { cls: 'mc-shead', text: 'Place ' + (at + 1) + ' of ' + things.length }));
      root.appendChild(h('div', { cls: 'mg-next' }, [h('span', { cls: 'mg-emoji', text: t.e, 'aria-hidden': 'true' }), h('b', { text: 'the ' + t.w }), h('span', { cls: 'mc-small', text: ' Tap a free stop. Taking the stops in number order makes the walk easy.' })]));
      var wrap = h('div', { cls: 'mg-housewrap', html: houseSvg({ n: STOPS.length }) }); root.appendChild(wrap);
      drawStops(wrap.querySelector('svg'), { show: true, active: firstFree(), click: function (i) {
        if (placed[i]) return;
        placed[i] = t; vivid(i, t);
      } });
      var f = wrap.querySelector('.mg-stop.is-active'); focus(f);
    }
    function firstFree() { for (var i = 0; i < STOPS.length; i++) if (!placed[i]) return i; return -1; }
    function vivid(i, t) {
      root.innerHTML = '';
      var ideas = ['huge, as big as the whole room', 'making a loud noise', 'covered in glitter', 'spinning round and round', 'dripping with honey', 'wearing a tiny hat', 'bouncing up and down', 'glowing like a lamp'];
      root.appendChild(h('div', { cls: 'mg-vivid' }, [h('span', { cls: 'mg-emoji', text: t.e, 'aria-hidden': 'true' }), h('p', null, [h('b', { text: 'Stop ' + (i + 1) + ', ' + STOPS[i].n + ': ' }), 'picture the ' + t.w + ' there, ' + ideas[Math.floor(Math.random() * ideas.length)] + '. See it for a moment. The odder the picture, the better it sticks.'])]));
      var nx = btn(at + 1 < things.length ? 'Pictured it: next' : 'Pictured it: done', function () { at++; step(); }, 'mc-primary'); root.appendChild(h('div', { cls: 'mc-row' }, [nx])); focus(nx);
    }
    function ready() {
      order = Object.keys(placed).map(Number).sort(function (a, b) { return a - b; });
      root.innerHTML = '';
      root.appendChild(h('p', { cls: 'mc-tip', text: 'All placed. Now the pictures hide. Walk the route from the front door, stop by stop, and name what you left at each one.' }));
      var go = btn('Walk the palace', function () { at = 0; score = 0; walk(); }, 'mc-primary'); root.appendChild(h('div', { cls: 'mc-row' }, [go])); focus(go);
    }
    function walk() {
      root.innerHTML = '';
      if (at >= order.length) return done();
      var i = order[at], t = placed[i];
      root.appendChild(h('p', { cls: 'mc-shead', text: 'Stop ' + (i + 1) + ': ' + STOPS[i].n + ' · ' + score + ' right so far' }));
      var wrap = h('div', { cls: 'mg-housewrap', html: houseSvg() }); root.appendChild(wrap);
      drawStops(wrap.querySelector('svg'), { active: i, walker: i });
      root.appendChild(h('p', { text: 'What did you leave at the ' + STOPS[i].n.toLowerCase() + '?' }));
      var grid = h('div', { cls: 'mg-pick' }), opts = shuffle(things.slice()), fb = h('p', { cls: 'mc-fb', role: 'status' }), over = false;
      opts.forEach(function (o) {
        grid.appendChild(h('button', { type: 'button', cls: 'mg-tile', 'aria-label': o.w, onclick: function () {
          if (over) return; over = true;
          var ok = o === t; if (ok) score++;
          this.classList.add(ok ? 'is-ok' : 'is-no');
          fb.textContent = ok ? 'Yes: the ' + t.w + '.' : 'It was the ' + t.w + ' ' + t.e + '.';
          setTimeout(function () { at++; walk(); }, ok ? 600 : 1500);
        } }, [h('span', { cls: 'mg-emoji', text: o.e, 'aria-hidden': 'true' }), h('small', { text: o.w })]));
      });
      root.appendChild(grid); root.appendChild(fb); focus(grid.querySelector('button'));
    }
    function done() {
      var s = G(), res = score + ' of ' + order.length + ' with ' + level + ' things';
      if (!s.g.bestN || score > s.g.bestN || (score === s.g.bestN && level > (s.g.bestL || 0))) { s.g.bestN = score; s.g.bestL = level; s.g.best = res; M.save(s.o); }
      root.innerHTML = '';
      root.appendChild(h('p', { cls: 'mc-result', text: score + ' of ' + order.length + ' remembered.' }));
      root.appendChild(h('p', { text: score === order.length ? 'A full walk! Try more things, or build a palace in your own home: front door, mat, mirror, stairs, and on.' : 'The stops you missed are where the picture was weakest. Next time make those bigger, louder or funnier.' }));
      var wrap = h('div', { cls: 'mg-housewrap', html: houseSvg() }); root.appendChild(wrap);
      drawStops(wrap.querySelector('svg'), { show: true });
      root.appendChild(h('div', { cls: 'mc-row' }, [btn('Play again', build, 'mc-primary'), btn('Change size', intro)]));
    }
    intro();
  };

  /* ======================= Chunk It ======================= */
  var YEARS = [['1066', 'the Battle of Hastings'], ['1215', 'Magna Carta'], ['1492', 'Columbus first sails to the Americas'], ['1620', 'the Mayflower lands'],
    ['1776', 'the Declaration of Independence'], ['1789', 'Washington becomes the first president'], ['1865', 'the American Civil War ends'], ['1903', 'the Wright brothers fly'], ['1969', 'the first people walk on the Moon']];
  GAMES['chunk-it'] = function () {
    var s0 = G().g, len = s0.len || 6, num = '', cuts = {}, timer = null, years = [];
    function make() {
      years = []; var out = '';
      if (len >= 8 && Math.random() < .35) {   // sometimes the chunks are famous years: meaning makes the best chunks
        var ys = shuffle(YEARS.slice());
        while (out.length + 4 <= len && ys.length) { var y = ys.pop(); years.push(y); out += y[0]; }
      }
      while (out.length < len) out += String(Math.floor(Math.random() * 10));
      return out;
    }
    function intro() {
      root.innerHTML = '';
      root.appendChild(h('p', { cls: 'mc-tip', text: 'Most people hold about four things at once. Twelve loose digits is twelve things; three chunks of four is three. While the number shows, tap the gaps to split it into chunks of three or four, say the chunks aloud, then type it back.' }));
      var g = G().g;
      root.appendChild(h('p', { cls: 'mc-small', text: 'Level: ' + len + ' digits' + (g.best ? ' · your best: ' + g.best + ' digits' : '') }));
      var b = btn('Show me a number', show, 'mc-primary'); root.appendChild(h('div', { cls: 'mc-row' }, [b])); focus(b);
    }
    function show() {
      num = make(); cuts = {};
      root.innerHTML = '';
      var secs = Math.max(4, Math.round(len * .9));
      var bar = h('div', { cls: 'mg-timer' }, [h('i', { style: 'animation-duration:' + secs + 's' })]);
      root.appendChild(bar);
      var row = h('div', { cls: 'mg-digits', role: 'group', 'aria-label': 'The number; buttons between digits split it into chunks' });
      function draw() {
        row.innerHTML = '';
        for (var i = 0; i < num.length; i++) {
          row.appendChild(h('span', { cls: 'mg-d', text: num[i] }));
          if (i < num.length - 1) (function (k) {
            row.appendChild(h('button', { type: 'button', cls: 'mg-gap' + (cuts[k] ? ' is-cut' : ''), 'aria-label': (cuts[k] ? 'Join after digit ' : 'Split after digit ') + (k + 1), 'aria-pressed': cuts[k] ? 'true' : 'false', onclick: function () { cuts[k] = !cuts[k]; draw(); var b = row.querySelectorAll('.mg-gap')[k]; if (b) b.focus(); } }));
          })(i);
        }
      }
      draw();
      root.appendChild(row);
      var chunksNow = h('p', { cls: 'mc-small', text: 'Tip: try ' + (len <= 8 ? 'two or three' : len <= 12 ? 'three or four' : 'four or five') + ' chunks.' });
      root.appendChild(chunksNow);
      root.appendChild(h('div', { cls: 'mc-row' }, [btn('Ready: hide it', ask, 'mc-primary')]));
      clearTimeout(timer); timer = setTimeout(ask, secs * 1000);
    }
    function ask() {
      clearTimeout(timer);
      var chunks = [], cur = '';
      for (var i = 0; i < num.length; i++) { cur += num[i]; if (cuts[i] || i === num.length - 1) { chunks.push(cur); cur = ''; } }
      root.innerHTML = '';
      root.appendChild(h('p', { text: 'Type the number' + (chunks.length > 1 ? ' (you made ' + chunks.length + ' chunks)' : '') + '.' }));
      var inp = h('input', { type: 'text', inputmode: 'numeric', cls: 'mc-in mg-in', autocomplete: 'off', 'aria-label': 'The number' });
      var fb = h('div', { role: 'status' });
      function check() {
        var v = inp.value.replace(/\D/g, '');
        if (!v) { inp.focus(); return; }
        inp.readOnly = true;
        var ok = v === num, s = G();
        if (ok) { len = Math.min(24, len + 1); if (!s.g.best || num.length > s.g.best) s.g.best = num.length; }
        else len = Math.max(4, len - 1);
        s.g.len = len; M.save(s.o);
        fb.innerHTML = '';
        fb.appendChild(h('p', { cls: 'mc-result', text: ok ? 'Right! Next number: ' + len + ' digits.' : 'Not quite. It was ' + M.groups(num, 4).join(' ') + '. Next: ' + len + ' digits.' }));
        if (years.length) fb.appendChild(h('p', { cls: 'mc-small', text: 'Hidden years: ' + years.map(function (y) { return y[0] + ' (' + y[1] + ')'; }).join(', ') + '. A chunk that means something is the easiest kind to hold.' }));
        if (!ok && Object.keys(cuts).filter(function (k) { return cuts[k]; }).length === 0) fb.appendChild(h('p', { cls: 'mc-small', text: 'Try splitting it into chunks next time: tap the gaps while it shows.' }));
        var n = btn('Next number', show, 'mc-primary'); fb.appendChild(h('div', { cls: 'mc-row' }, [n])); focus(n);
      }
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      root.appendChild(h('div', { cls: 'mc-row' }, [inp, btn('Check', check, 'mc-primary')]));
      root.appendChild(fb); focus(inp);
    }
    intro();
  };

  /* ======================= Story Chain ======================= */
  var LINKS = ['bouncing on', 'hiding inside', 'riding on', 'painting', 'juggling', 'balancing on', 'sneezing on', 'dancing with', 'tickling', 'chasing', 'singing to', 'sitting on', 'rolling over', 'wrapped around'];
  GAMES['story-chain'] = function () {
    var n = G().g.n || 5, list = [], i = 0, answer = [];
    function intro() {
      root.innerHTML = '';
      root.appendChild(h('p', { cls: 'mc-tip', text: 'The link method: join each picture to the next with a tiny, silly scene. Then one picture calls up the next, like links in a chain.' }));
      var g = G().g; root.appendChild(h('p', { cls: 'mc-small', text: 'Chain length: ' + n + (g.best ? ' · your best: ' + g.best : '') }));
      var b = btn('Start a chain', start, 'mc-primary'); root.appendChild(h('div', { cls: 'mc-row' }, [b])); focus(b);
    }
    function start() { list = pick(n); i = 0; link(); }
    function link() {
      root.innerHTML = '';
      if (i >= list.length) return recall();
      var a = list[i], b = list[i + 1];
      root.appendChild(h('p', { cls: 'mc-shead', text: 'Picture ' + (i + 1) + ' of ' + list.length }));
      var card = h('div', { cls: 'mg-link' }, [h('div', { cls: 'mg-card' }, [h('span', { cls: 'mg-emoji', text: a.e, 'aria-hidden': 'true' }), h('b', { text: a.w })])]);
      if (b) {
        card.appendChild(h('span', { cls: 'mg-arrow', text: '→', 'aria-hidden': 'true' }));
        card.appendChild(h('div', { cls: 'mg-card' }, [h('span', { cls: 'mg-emoji', text: b.e, 'aria-hidden': 'true' }), h('b', { text: b.w })]));
      }
      root.appendChild(card);
      root.appendChild(h('p', null, b ? ['Picture the ', h('b', { text: a.w }), ' ' + LINKS[Math.floor(Math.random() * LINKS.length)] + ' the ', h('b', { text: b.w }), '. Or make up your own scene: the sillier, the better.'] : ['Last one: the ', h('b', { text: a.w }), '. Now run the whole chain once in your head.']));
      var nx = btn(b ? 'Linked: next' : 'Done: hide them', function () { i++; link(); }, 'mc-primary'); root.appendChild(h('div', { cls: 'mc-row' }, [nx])); focus(nx);
    }
    function recall() {
      answer = []; root.innerHTML = '';
      root.appendChild(h('p', { text: 'Tap the pictures in the order of your chain.' }));
      var strip = h('ol', { cls: 'mg-strip' }); root.appendChild(strip);
      var grid = h('div', { cls: 'mg-pick' });
      shuffle(list.slice()).forEach(function (t) {
        grid.appendChild(h('button', { type: 'button', cls: 'mg-tile', 'aria-label': t.w, onclick: function () {
          if (this.disabled) return; this.disabled = true; answer.push(t);
          strip.appendChild(h('li', { text: t.e + ' ' + t.w }));
          if (answer.length === list.length) check();
        } }, [h('span', { cls: 'mg-emoji', text: t.e, 'aria-hidden': 'true' }), h('small', { text: t.w })]));
      });
      root.appendChild(grid);
      root.appendChild(h('div', { cls: 'mc-row' }, [btn('Undo', function () { var t = answer.pop(); if (!t) return; strip.removeChild(strip.lastChild); grid.querySelector('[aria-label="' + t.w + '"]').disabled = false; })]));
      focus(grid.querySelector('button'));
    }
    function check() {
      var sc = M.score(list, answer), s = G();
      if (sc.perfect) { if (!s.g.best || n > s.g.best) s.g.best = n; n = Math.min(14, n + 1); } else n = Math.max(4, n - (sc.until < n / 2 ? 1 : 0));
      s.g.n = n; M.save(s.o);
      root.innerHTML = '';
      root.appendChild(h('p', { cls: 'mc-result', text: sc.perfect ? 'The whole chain, in order!' : sc.total + ' of ' + list.length + ' in the right place.' }));
      var ol = h('ol', { cls: 'mc-cmp' });
      list.forEach(function (t, k) { ol.appendChild(h('li', { cls: answer[k] === t ? 'is-ok' : 'is-no', text: t.e + ' ' + t.w + (answer[k] === t ? '' : ' (you had ' + answer[k].w + ')') })); });
      root.appendChild(ol);
      if (!sc.perfect) root.appendChild(h('p', { cls: 'mc-small', text: 'The chain broke after the ' + (sc.first ? list[sc.first - 1].w : 'start') + '. Make that link stronger next time: more action, more noise.' }));
      var b = btn('Next chain (' + n + ')', start, 'mc-primary'); root.appendChild(h('div', { cls: 'mc-row' }, [b])); focus(b);
    }
    intro();
  };

  /* ======================= Card Pairs ======================= */
  // Each pair (a picture and its word) has a stage. A pair matched with no wrong flips waits longer (1, 3, 7 rounds);
  // a pair that took a wrong flip comes back next round. Each cleared round adds a new pair, from 3 up to 10.
  var GAP = [1, 3, 7, 21];
  GAMES['card-pairs'] = function () {
    var s = G().g; s.round = s.round || 0; s.size = s.size || 3; s.p = s.p || {};
    function due() {
      var keys = Object.keys(s.p), out = keys.filter(function (w) { return s.p[w].due <= s.round; });
      out.sort(function (a, b) { return s.p[a].due - s.p[b].due; });
      return out;
    }
    function intro() {
      root.innerHTML = '';
      root.appendChild(h('p', { cls: 'mc-tip', text: 'Match each picture with its word. Picture plus word gives the memory two paths in. Pairs you fumble come back next round; pairs you know wait 1, then 3, then 7 rounds, the way spaced review works.' }));
      root.appendChild(h('p', { cls: 'mc-small', text: 'Round ' + (s.round + 1) + ' · ' + s.size + ' pairs · ' + Object.keys(s.p).length + ' pairs seen' + (due().length ? ' · ' + due().length + ' coming back' : '') }));
      var b = btn('Deal', deal, 'mc-primary');
      root.appendChild(h('div', { cls: 'mc-row' }, [b, btn('Start over', function () { if (!confirm('Start the pairs over from round 1?')) return; var g = G(); g.o.games[GAME] = {}; M.save(g.o); s = G().g; s.round = 0; s.size = 3; s.p = {}; intro(); }, 'mc-quiet')]));
      focus(b);
    }
    function deal() {
      var back = due().slice(0, Math.max(1, s.size - 1)), words = back.slice();
      var fresh = shuffle(THINGS.filter(function (t) { return !s.p[t[1]]; }));
      while (words.length < s.size && fresh.length) words.push(fresh.pop()[1]);
      if (words.length < s.size) shuffle(THINGS.slice()).forEach(function (t) { if (words.length < s.size && words.indexOf(t[1]) < 0) words.push(t[1]); });
      var em = {}; THINGS.forEach(function (t) { em[t[1]] = t[0]; });
      var cards = [];
      words.forEach(function (w) { cards.push({ w: w, pic: true }); cards.push({ w: w, pic: false }); });
      cards = shuffle(cards);
      var miss = {}, open = [], got = 0, flips = 0, lock = false;
      root.innerHTML = '';
      var info = h('p', { cls: 'mc-small', role: 'status', text: 'Round ' + (s.round + 1) + ': find ' + words.length + ' pairs.' + (back.length ? ' ' + back.length + ' of them are back for review.' : '') });
      root.appendChild(info);
      var grid = h('div', { cls: 'mg-pairs', style: '--cols:' + (cards.length <= 6 ? 3 : cards.length <= 12 ? 4 : 5) });
      cards.forEach(function (c, k) {
        var b = h('button', { type: 'button', cls: 'mg-pc', 'aria-label': 'Card ' + (k + 1) + ', face down' }, [h('span', { cls: 'mg-face' }, c.pic ? [h('span', { cls: 'mg-emoji', text: em[c.w], 'aria-hidden': 'true' })] : [h('b', { text: c.w })])]);
        b.onclick = function () {
          if (lock || b.classList.contains('is-up') || b.classList.contains('is-done')) return;
          b.classList.add('is-up'); b.setAttribute('aria-label', c.pic ? 'picture of a ' + c.w : 'the word ' + c.w); open.push({ b: b, c: c }); flips++;
          if (open.length === 2) {
            var x = open[0], y = open[1];
            if (x.c.w === y.c.w) { [x, y].forEach(function (z) { z.b.classList.add('is-done'); }); open = []; got++; if (got === words.length) setTimeout(finish, 450); }
            else { miss[x.c.w] = 1; miss[y.c.w] = 1; lock = true; setTimeout(function () { [x, y].forEach(function (z) { z.b.classList.remove('is-up'); z.b.setAttribute('aria-label', 'face down'); }); open = []; lock = false; }, 900); }
          }
        };
        grid.appendChild(b);
      });
      root.appendChild(grid); focus(grid.querySelector('button'));
      function finish() {
        var g = G(), S = g.g; S.round = (S.round || 0) + 1; S.p = S.p || {};
        words.forEach(function (w) {
          var p = S.p[w] || { st: -1 };
          if (miss[w]) { p.st = -1; p.due = S.round; }                 // straight back next round
          else { p.st = Math.min(GAP.length - 1, p.st + 1); p.due = S.round + GAP[p.st]; }   // then 1, 3, 7, 21 rounds later
          S.p[w] = p;
        });
        var clean = !Object.keys(miss).length;
        if (clean) S.size = Math.min(10, (S.size || 3) + 1);
        S.best = Math.max(S.best || 0, clean ? words.length : 0);
        M.save(g.o); s = S;
        root.innerHTML = '';
        root.appendChild(h('p', { cls: 'mc-result', text: clean ? 'All pairs, no slips! Next round has ' + S.size + ' pairs.' : 'Done in ' + flips + ' flips. ' + Object.keys(miss).length + ' pair' + (Object.keys(miss).length > 1 ? 's' : '') + ' will be back next round.' }));
        var b = btn('Next round', deal, 'mc-primary'); root.appendChild(h('div', { cls: 'mc-row' }, [b, btn('How it works', intro)])); focus(b);
      }
    }
    intro();
  };

  /* ======================= Daily warm-up ======================= */
  GAMES['warm-up'] = function () {
    root.innerHTML = '<p class="mc-small">Loading your lists…</p>';
    var url = root.dataset.lists;
    fetch(url).then(function (r) { return r.json(); }).then(start, function () { root.innerHTML = '<p>The lists could not load. Try again later, or open the <a href="' + root.dataset.challenges + '">memory challenges</a>.</p>'; });
    function start(lists) {
      lists = lists.map(M.normList);
      var o = M.load(), t = M.today(), dueSets = [], started = [];
      lists.forEach(function (L) {
        var S = o.lists[L.slug]; if (!S || !S.c) return;
        var CH = M.chunks(L.items), any = false;
        CH.forEach(function (c) { var st = S.c[c.from + '-' + c.to]; if (st) any = true; if (M.isDue(st, t)) dueSets.push({ L: L, c: c }); });
        if (any) started.push(L);
      });
      root.innerHTML = '';
      var qs = [], mode;
      if (dueSets.length) {
        mode = 'due';
        dueSets.slice(0, 4).forEach(function (d) { M.shuffle(d.L.items.slice(d.c.from, d.c.to), Math.random).forEach(function (it) { qs.push({ L: d.L, it: it, set: d }); }); });
        root.appendChild(h('p', { cls: 'mc-tip', text: dueSets.length + ' chunk' + (dueSets.length > 1 ? 's are' : ' is') + ' due today' + (dueSets.length > 4 ? '; here are the first four' : '') + '. Answer from memory: a chunk you get all right moves to its next review day, and a slip brings it back tomorrow.' }));
      } else if (started.length) {
        mode = 'mix';
        started.forEach(function (L) { M.shuffle(L.items, Math.random).slice(0, 3).forEach(function (it) { qs.push({ L: L, it: it }); }); });
        qs = M.shuffle(qs, Math.random).slice(0, 10);
        root.appendChild(h('p', { cls: 'mc-tip', text: 'Nothing is due today, so here is a mix from the lists you have started. Mixing subjects is a memory boost of its own.' }));
      } else {
        mode = 'taste';
        var pl = lists.filter(function (L) { return L.slug === 'planets'; })[0] || lists[0];
        if (pl) M.shuffle(pl.items, Math.random).slice(0, 5).forEach(function (it) { qs.push({ L: pl, it: it }); });
        root.appendChild(h('p', { cls: 'mc-tip', html: 'You have not started a list yet. Here is a taste; then pick a list on the <a href="' + root.dataset.challenges + '">memory challenges</a> page and learn its first chunk. From tomorrow, this warm-up will bring back whatever is due.' }));
      }
      if (!qs.length) { root.appendChild(h('p', { text: 'No questions today.' })); return; }
      var i = 0, right = 0, miss = {}, slot = h('div'), prog = h('p', { cls: 'mc-shead' });
      root.appendChild(prog); root.appendChild(slot);
      var b = btn('Begin', one, 'mc-primary'); slot.appendChild(h('div', { cls: 'mc-row' }, [b])); focus(b);
      function one() {
        if (i >= qs.length) return end();
        var q = qs[i], L = q.L, F = {}; (L.fields || []).forEach(function (f) { F[f.key] = f.label; });
        var main = L.main || L.prompts[0].ask, p = L.prompts.filter(function (x) { return x.ask === main; })[0] || L.prompts[0];
        if (!M.usable(p, q.it)) p = L.prompts.filter(function (x) { return M.usable(x, q.it); })[0];
        if (!p) { qs.splice(i, 1); return one(); }      // a never-asked field: skip the item
        prog.textContent = (i + 1) + ' of ' + qs.length + ' · ' + L.title;
        slot.innerHTML = '';
        var cue = p.from.map(function (k) { return F[k] + ': ' + (q.it[k] == null ? '' : q.it[k]); }).join(' · ');
        var box = h('div', { cls: 'mc-ask' }, [h('div', { cls: 'mc-cue', text: cue }), h('div', { cls: 'mc-askfor', text: F[p.ask] + '?' })]);
        var inp = h('input', { type: 'text', cls: 'mc-in', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': F[p.ask] });
        var fb = h('p', { cls: 'mc-fb', role: 'status' }), over = false;
        var answers = [];
        L.items.forEach(function (x) { if (!M.noquiz(x, p.ask) && p.from.every(function (k) { return M.norm(x[k]) === M.norm(q.it[k]); })) answers = answers.concat(M.answersFor(x, p.ask, main)); });
        var pool = L.items.map(function (x) { return x[p.ask] == null ? '' : String(x[p.ask]); });
        function sub(giveUp) {
          if (over) return;
          if (!giveUp && !inp.value.trim()) { inp.focus(); return; }
          var r = giveUp ? { ok: false } : M.match(inp.value, answers, pool);
          if (r.ambiguous) { fb.textContent = 'Which one? Give a little more.'; return; }
          over = true; inp.readOnly = true;
          if (r.ok) right++; else if (q.set) miss[q.set.L.slug + '|' + q.set.c.from] = 1;
          box.classList.add(r.ok ? 'is-ok' : 'is-no');
          fb.textContent = r.ok ? 'Right.' : 'It was: ' + q.it[p.ask] + '.';
          if (q.it.note) box.appendChild(h('p', { cls: 'mc-inote', text: q.it.note }));
          setTimeout(function () { i++; one(); }, (r.ok ? 500 : 1500) + (q.it.note ? 2500 : 0));
        }
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sub(); } });
        var mathy = p.choice || L.items.some(function (x) { return M.isMath(x[p.ask]); });
        if (mathy) {        // formulas are picked, not typed
          var truth = String(q.it[p.ask]), opts = [truth], seenK = {}; seenK[M.strict(truth)] = 1;
          M.shuffle(L.items, Math.random).forEach(function (x) { var v = x[p.ask] == null ? '' : String(x[p.ask]); if (opts.length < 4 && v && !M.noquiz(x, p.ask) && !seenK[M.strict(v)]) { seenK[M.strict(v)] = 1; opts.push(v); } });
          var grid = h('div', { cls: 'mc-choices' });
          M.shuffle(opts, Math.random).forEach(function (v) { grid.appendChild(h('button', { type: 'button', cls: 'mc-choice', text: v, onclick: function () { inp.value = v; this.classList.add(M.match(v, answers, pool).ok ? 'is-ok' : 'is-no'); sub(); } })); });
          box.appendChild(grid); box.appendChild(fb); slot.appendChild(box); focus(grid.querySelector('button'));
        } else {
          box.appendChild(h('div', { cls: 'mc-row' }, [inp, btn('Check', function () { sub(); }, 'mc-primary'), btn('Show me', function () { sub(true); })]));
          box.appendChild(fb); slot.appendChild(box); focus(inp);
        }
      }
      function end() {
        prog.textContent = '';
        slot.innerHTML = '';
        var o2 = M.load(), t2 = M.today(), moved = 0, back = 0;
        if (mode === 'due') {
          dueSets.slice(0, 4).forEach(function (d) {
            var S = M.listState(o2, d.L.slug), k = d.c.from + '-' + d.c.to, ok = !miss[d.L.slug + '|' + d.c.from];
            S.c[k] = M.review(S.c[k], ok, t2); if (ok) moved++; else back++;
          });
        }
        o2.games = o2.games || {}; o2.games['warm-up'] = { last: t2, right: right, of: qs.length };
        M.save(o2);
        slot.appendChild(h('p', { cls: 'mc-result', text: right + ' of ' + qs.length + ' right. Warmed up!' }));
        if (mode === 'due') slot.appendChild(h('p', { text: moved + ' chunk' + (moved === 1 ? '' : 's') + ' moved to the next review day' + (back ? ', and ' + back + ' will come back tomorrow' : '') + '.' }));
        slot.appendChild(h('p', null, ['Next: the ', h('a', { href: root.dataset.challenges, text: 'memory challenges' }), ', or a quick game of ', h('a', { href: '../chunk-it/', text: 'Chunk It' }), '.']));
      }
    }
  };

  if (GAMES[GAME]) GAMES[GAME]();
})();

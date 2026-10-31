/* Digits trainer (/memory/challenges/pi/): pi to 1,000 decimals and e to 100 (data/memory/digits.json, inlined as #pi-data).
   Learn: blocks of chunks (4 or 5 digits), look then type, with the 1-3-7-21 reviews (trb-memory-v1 lists["digits-<k>"]).
   Recall: type from the start with live checking that stops at the first mistake; best run in best["pi:<k>"].
   Optional Major System words for each chunk (our own peg list: 0 s/z, 1 t/d, 2 n, 3 m, 4 r, 5 l, 6 j/sh/ch, 7 k/hard g, 8 f/v, 9 p/b). */
(function () {
  'use strict';
  var M = window.TRBMem, root = document.getElementById('pi'), dataEl = document.getElementById('pi-data');
  if (!M || !root || !dataEl) return;
  var D; try { D = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var st = { k: 'pi', size: 4, block: 5, major: false };
  try { var sv = JSON.parse(localStorage.getItem('trb-memory-v1') || '{}').piPref; if (sv) { if (D[sv.k]) st.k = sv.k; if (sv.size === 4 || sv.size === 5) st.size = sv.size; st.major = !!sv.major; } } catch (e) { }
  function savePref() { var o = M.load(); o.piPref = { k: st.k, size: st.size, major: st.major }; M.save(o); }
  function C() { return D[st.k]; }
  function dec() { return C().digits.slice(1); }        // the decimals (the trainer counts these; the whole part is given)
  function whole() { return C().digits[0]; }
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === 'text') e.textContent = attrs[k]; else if (k === 'cls') e.className = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function btn(t, f, c) { return h('button', { type: 'button', cls: 'mc-btn' + (c ? ' ' + c : ''), text: t, onclick: f }); }
  // blocks of `block` chunks, each a review unit: decimals [from, to)
  function blocks() {
    var n = dec().length, per = st.size * st.block, out = [];
    for (var a = 0; a < n; a += per) out.push({ from: a, to: Math.min(n, a + per) });
    return out;
  }
  function stateKey() { return 'digits-' + st.k + '-' + st.size; }
  function bkey(b) { return b.from + '-' + b.to; }

  var tab = 'learn';
  function shell() {
    root.innerHTML = '';
    var o = M.load(), best = o.best['pi:' + st.k];
    var which = h('div', { cls: 'mc-seg', role: 'group', 'aria-label': 'Which number' });
    Object.keys(D).filter(function (k) { return k[0] !== '_'; }).forEach(function (k) {
      which.appendChild(h('button', { type: 'button', cls: 'mc-btn' + (st.k === k ? ' is-on' : ''), 'aria-pressed': st.k === k ? 'true' : 'false', text: D[k].label + ' · ' + D[k].decimals + ' decimals', onclick: function () { st.k = k; savePref(); shell(); } }));
    });
    var size = h('select', { cls: 'mc-sel', id: 'pi-size' }, [h('option', { value: 4, text: 'Chunks of 4' }), h('option', { value: 5, text: 'Chunks of 5' })]);
    size.value = String(st.size); size.onchange = function () { st.size = +size.value; savePref(); shell(); };
    var mj = h('input', { type: 'checkbox', id: 'pi-major' }); mj.checked = st.major; mj.onchange = function () { st.major = mj.checked; savePref(); shell(); };
    root.appendChild(which);
    root.appendChild(h('div', { cls: 'mc-row' }, [h('label', { 'for': 'pi-size', cls: 'mc-lab', text: 'Group the digits:' }), size, mj, h('label', { 'for': 'pi-major', text: 'Show Major System words' })]));
    root.appendChild(h('p', { cls: 'mc-small', text: best ? 'Your best: ' + best + ' decimals of ' + C().label + ' in a row.' : 'No record yet for ' + C().label + '.' }));
    var tabs = h('div', { cls: 'mc-tabs', role: 'tablist', 'aria-label': 'Trainer' });
    [['learn', 'Learn in chunks'], ['recall', 'Recall from the start'], ['see', 'See the digits']].forEach(function (t) {
      tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': tab === t[0] ? 'true' : 'false', text: t[1], onclick: function () { tab = t[0]; shell(); } }));
    });
    root.appendChild(tabs);
    var box = h('div', { cls: 'pi-box', role: 'tabpanel' }); root.appendChild(box);
    ({ learn: learn, recall: recall, see: see })[tab](box);
  }
  function chunkTiles(from, to, opt) {
    opt = opt || {};
    var s = dec(), row = h('div', { cls: 'pi-chunks' });
    for (var a = from; a < to; a += st.size) {
      var ch = s.slice(a, Math.min(to, a + st.size));
      var t = h('div', { cls: 'pi-chunk' }, [h('small', { text: String(a + 1) }), h('b', { text: opt.hide ? ch.replace(/\d/g, '•') : ch })]);
      if (st.major && !opt.hide) t.appendChild(h('span', { cls: 'pi-words', text: M.majorWords(ch).join(' · ') }));
      row.appendChild(t);
    }
    return row;
  }

  /* ---------- learn ---------- */
  function learn(box) {
    var o = M.load(), S = M.listState(o, stateKey()), t = M.today(), B = blocks();
    var due = B.filter(function (b) { return M.isDue(S.c[bkey(b)], t); });
    var next = B.filter(function (b) { return !S.c[bkey(b)]; })[0];
    var learnedTo = 0; B.forEach(function (b) { if (S.c[bkey(b)] && b.from === learnedTo) learnedTo = b.to; });
    box.appendChild(h('p', { cls: 'mc-tip', text: 'Twelve digits are too many to hold; three chunks of four are easy. Learn a block of ' + st.block + ' chunks, cover it, and type it back. Each block comes back on day 1, 3, 7 and 21. Picture each chunk if you can: a year it looks like, a pattern, or the Major System words.' }));
    box.appendChild(h('p', { cls: 'mc-small', text: 'Learned so far: ' + learnedTo + ' of ' + dec().length + ' decimals.' }));
    if (due.length) box.appendChild(h('div', { cls: 'mc-callout' }, [h('b', { text: 'Review first: ' }), 'decimals ' + (due[0].from + 1) + '–' + due[0].to + ' are due today.', h('div', { cls: 'mc-row' }, [btn('Review them', function () { run(due[0], true); }, 'mc-primary')])]));
    else if (next) box.appendChild(h('div', { cls: 'mc-callout' }, [h('b', { text: 'Next up: ' }), 'decimals ' + (next.from + 1) + '–' + next.to + '.', h('div', { cls: 'mc-row' }, [btn('Learn them', function () { run(next, false); }, 'mc-primary')])]));
    else box.appendChild(h('div', { cls: 'mc-callout' }, [h('b', { text: 'Every block learned. ' }), 'Try Recall from the start.']));
    var learned = B.filter(function (b) { return S.c[bkey(b)]; });
    if (learned.length) {
      var ul = h('ul', { cls: 'pi-blocks' });
      learned.forEach(function (b) { var s = S.c[bkey(b)]; ul.appendChild(h('li', { cls: M.isDue(s, t) ? 'is-due' : '' }, [(b.from + 1) + '–' + b.to + ': ', M.isDue(s, t) ? 'due today ' : 'next ' + s.d + ' ', btn('Practice', function () { run(b, M.isDue(s, t)); })])); });
      box.appendChild(h('details', { cls: 'pi-learned' }, [h('summary', { text: 'Your blocks (' + learned.length + ')' }), ul]));
    }
    function run(b, review) {
      box.innerHTML = '';
      box.appendChild(h('p', { cls: 'mc-shead', text: 'Decimals ' + (b.from + 1) + '–' + b.to + (review ? ' · review' : '') }));
      if (b.from > 0) box.appendChild(h('p', { cls: 'mc-small', text: 'Leading in: …' + dec().slice(Math.max(0, b.from - st.size), b.from) }));
      var stage = h('div'); box.appendChild(stage);
      if (review) type(true); else look();
      function look() {
        stage.innerHTML = '';
        stage.appendChild(chunkTiles(b.from, b.to));
        stage.appendChild(h('p', { cls: 'mc-tip', text: 'Say each chunk aloud in rhythm. Look for patterns, years and repeats.' }));
        stage.appendChild(h('div', { cls: 'mc-row' }, [btn('Cover and type it', function () { type(false); }, 'mc-primary')]));
      }
      function type(first) {
        stage.innerHTML = '';
        var target = dec().slice(b.from, b.to);
        var show = h('div', { cls: 'pi-typed', 'aria-hidden': 'true' });
        var inp = h('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', cls: 'mc-in pi-in', 'aria-label': 'Type decimals ' + (b.from + 1) + ' to ' + b.to });
        var msg = h('p', { cls: 'mc-fb', role: 'status' });
        stage.appendChild(show); stage.appendChild(h('div', { cls: 'mc-row' }, [inp, btn('Show me', function () { done(false, inp.value.replace(/\D/g, '').length); })]));
        stage.appendChild(msg);
        inp.oninput = function () {
          var v = inp.value.replace(/\D/g, '').slice(0, target.length), r = M.digitCheck(target, v);
          inp.value = v; paint(show, target, v, st.size);
          if (!r.ok) return done(false, r.at);
          if (v.length === target.length) done(true);
        };
        setTimeout(function () { inp.focus(); }, 20);
        var over = false;
        function done(ok, at) {
          if (over) return; over = true; inp.readOnly = true;
          var o2 = M.load(), S2 = M.listState(o2, stateKey()), k = bkey(b), t2 = M.today();
          if (first) S2.c[k] = M.review(S2.c[k], ok, t2);
          else if (ok && !S2.c[k]) S2.c[k] = M.learn(t2);
          M.save(o2);
          var now = S2.c[k];
          msg.textContent = ok ? 'All ' + target.length + ' right!' + (now ? ' Next review ' + now.d + '.' : '') : 'Decimal ' + (b.from + at + 1) + ' is ' + target[at] + '. Look again, then try once more.';
          msg.className = 'mc-fb ' + (ok ? 'pi-ok' : 'pi-no');
          stage.appendChild(h('div', { cls: 'mc-row' }, ok ? [btn('Back', function () { shell(); }, 'mc-primary')] : [btn('Look again', look, 'mc-primary'), btn('Back', function () { shell(); })]));
        }
      }
    }
  }
  function paint(el, target, typed, size) {
    el.innerHTML = '';
    for (var i = 0; i < typed.length; i++) {
      if (i && i % size === 0) el.appendChild(document.createTextNode(' '));
      el.appendChild(h('span', { cls: typed[i] === target[i] ? 'pi-g' : 'pi-r', text: typed[i] }));
    }
  }

  /* ---------- recall from the start ---------- */
  function recall(box) {
    var all = dec();
    box.appendChild(h('p', { cls: 'mc-tip', text: 'Type the decimals of ' + C().label + ' from the start (after ' + whole() + '.). Each digit is checked as you type, and the run stops at the first mistake.' }));
    var show = h('div', { cls: 'pi-typed pi-long', 'aria-hidden': 'true' });
    var count = h('p', { cls: 'pi-count', role: 'status', text: '0 decimals' });
    var inp = h('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', cls: 'mc-in pi-in', 'aria-label': 'Type the decimals of ' + C().label });
    box.appendChild(h('div', { cls: 'pi-lead', text: whole() + '.' }));
    box.appendChild(show); box.appendChild(count); box.appendChild(h('div', { cls: 'mc-row' }, [inp, btn('Start over', function () { shell(); })]));
    var res = h('div'); box.appendChild(res);
    var over = false, t0 = 0;
    inp.oninput = function () {
      if (over) return;
      if (!t0) t0 = Date.now();
      var v = inp.value.replace(/\D/g, '').slice(0, all.length), r = M.digitCheck(all, v);
      paint(show, all, v, st.size);
      count.textContent = r.right + ' decimal' + (r.right === 1 ? '' : 's');
      if (!r.ok) finish(r.at, v[r.at]);
      else if (v.length === all.length) finish(all.length);
    };
    setTimeout(function () { inp.focus(); }, 20);
    function finish(n, wrong) {
      over = true; inp.readOnly = true;
      var o = M.load(), nb = n > 0 && M.better(o, 'pi:' + st.k, n, false); M.save(o);
      res.appendChild(h('p', { cls: 'mc-result', text: n === all.length ? 'All ' + n + ' decimals. Wonderful!' : n + ' decimals in a row.' + (nb ? ' A new best!' : '') }));
      if (n < all.length) {
        res.appendChild(h('p', { text: 'Decimal ' + (n + 1) + ' is ' + all[n] + (wrong ? ', not ' + wrong : '') + '. Here is what comes next:' }));
        var a = Math.floor(n / st.size) * st.size;
        res.appendChild(chunkTiles(a, Math.min(all.length, a + st.size * 3)));
      }
      res.appendChild(h('p', { cls: 'mc-small', text: 'Time: ' + M.fmtTime(Date.now() - t0) + '.' }));
      res.appendChild(h('div', { cls: 'mc-row' }, [btn('Try again', function () { shell(); }, 'mc-primary')]));
    }
  }

  /* ---------- see ---------- */
  function see(box) {
    box.appendChild(h('p', { cls: 'mc-tip', text: C().label + ' = ' + whole() + '.' + dec().slice(0, 10) + '… Numbers above each chunk count the decimals.' }));
    box.appendChild(chunkTiles(0, dec().length));
    box.appendChild(h('p', { cls: 'mc-small', text: C().note }));
  }
  shell();
  window.TRBPi = { state: st, digits: function () { return dec(); } };
})();

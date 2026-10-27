/* Art & Drawing Ladder: art history flashcards (layouts/art/flashcards.html). Cards come from MathLadder.art.WORKS (the kit's
   catalog). Spaced review: Again brings a card back in a minute; Hard, Good and Easy push it 1, 3 or 6+ days out and grow the
   interval. Saved in localStorage (trb-art-cards-v1); every access is wrapped so the page still works without storage. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('arf'); if (!root) return;
  function start() {
    var A = W.MathLadder && W.MathLadder.art; if (!A || !A.WORKS) { D.getElementById('arf-stage').innerHTML = '<p>The cards could not load.</p>'; return; }
    var KEY = 'trb-art-cards-v1', st = { cards: {}, prefs: {}, newDay: {} };
    try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.cards) st = raw; } catch (e) { }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
    var deck = D.getElementById('arf-deck'), track = D.getElementById('arf-track'), dirG = D.getElementById('arf-dir'), newSel = D.getElementById('arf-new');
    var stage = D.getElementById('arf-stage'), flipB = D.getElementById('arf-flip'), grade = D.getElementById('arf-grade'), pos = D.getElementById('arf-pos'), prog = D.getElementById('arf-prog'), dueEl = D.getElementById('arf-due');
    A.TRACKS.forEach(function (t) { var o = D.createElement('option'); o.value = t.key; o.textContent = t.name; track.appendChild(o); });
    A.PERIODS.slice().sort(function (a, b) { return a.start - b.start; }).forEach(function (p) { if (!A.worksIn(p.key).length) return; var o = D.createElement('option'); o.value = 'p:' + p.key; o.textContent = 'Period: ' + p.name; deck.appendChild(o); });
    var P = st.prefs || {}; if (P.deck) deck.value = P.deck; if (P.track) track.value = P.track; if (P.newN) newSel.value = P.newN; var dir = P.dir || 'w';
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function pool() {
      var v = deck.value, list = A.WORKS.filter(function (w) {
        if (v.indexOf('c:') === 0 && !w.topics.some(function (t) { return t.indexOf(v.slice(2) + '.') === 0; })) return false;
        if (v.indexOf('p:') === 0 && w.period !== v.slice(2)) return false;
        if (track.value && (A.period(w.period) || {}).track !== track.value) return false;
        return w.topics.some(function (t) { return /^ah[12]\./.test(t); });
      });
      return list.sort(function (a, b) { return a.year - b.year; });
    }
    var queue = [], cur = null, flipped = false, done = 0;
    function cid(w) { return w.id + ':' + dir; }
    function build() {
      var now = Date.now(), list = pool(), due = [], fresh = [];
      list.forEach(function (w) { var c = st.cards[cid(w)]; if (c) { if (c.due <= now) due.push(w); } else fresh.push(w); });
      var used = (st.newDay[today()] || 0), room = Math.max(0, (+newSel.value || 20) - used);
      queue = due.sort(function (a, b) { return st.cards[cid(a)].due - st.cards[cid(b)].due; }).concat(fresh.slice(0, room));
      done = 0; dueEl.textContent = due.length + ' due · ' + Math.min(room, fresh.length) + ' new';
      next();
    }
    function frontHtml(w) {
      if (dir === 'a') { var p = A.period(w.period); return '<p class="arf-ask">Name a work by</p><p class="arf-front-t">' + esc(w.artist) + '</p><p class="arf-ask">' + esc(p ? p.name : '') + (w.style ? ' · ' + esc(w.style) : '') + '</p>'; }
      if (A.hasImg(w)) return '<img src="' + A.imgUrl(w) + '" alt="A work of art: who made it, and when?"><p class="arf-ask">Who made it, about when, and in which period?</p>';
      return '<p class="arf-front-t">' + esc(w.title) + '</p><p class="arf-ask">Who made it, about when, and in which period?</p>';
    }
    function backHtml(w) {
      var p = A.period(w.period), c = A.city(w.now);
      return '<div class="arf-back"><b>' + esc(w.title) + '</b><br>' + esc(w.artist) + ', ' + esc(w.date) + '<br><span class="arf-per">' + esc(p ? p.name : '') + (w.style ? ' · ' + esc(w.style) : '') + '</span><br><small>' + esc(w.medium) + ' · ' + esc(w.at) + '</small>' + (w.note ? '<br><small>' + esc(w.note) + '</small>' : '') + '</div>';
    }
    function next() {
      cur = queue.shift() || null; flipped = false; grade.hidden = true; flipB.hidden = !cur;
      var total = done + queue.length + (cur ? 1 : 0); pos.textContent = cur ? 'Card ' + (done + 1) + ' of ' + total : ''; prog.style.width = total ? Math.round(done / total * 100) + '%' : '100%';
      stage.innerHTML = cur ? '<div class="arf-card">' + frontHtml(cur) + '</div>' : '<div class="arf-card"><p class="arf-front-t">All done for now</p><p class="arf-ask">Come back tomorrow for the cards that are due, or choose another deck.</p></div>';
    }
    function flip() { if (!cur || flipped) return; flipped = true; stage.querySelector('.arf-card').insertAdjacentHTML('beforeend', backHtml(cur)); grade.hidden = false; flipB.hidden = true; grade.querySelector('[data-q="3"]').focus(); }
    function rate(q) {
      if (!cur || !flipped) return; var k = cid(cur), c = st.cards[k], isNew = !c; c = c || { iv: 0, ease: 2.5 };
      if (q === 1) { c.iv = 0; c.ease = Math.max(1.3, c.ease - 0.2); c.due = Date.now() + 60 * 1000; queue.splice(Math.min(3, queue.length), 0, cur); }
      else { c.iv = q === 2 ? Math.max(1, c.iv * 1.2) : q === 3 ? (c.iv ? c.iv * c.ease : 1) : (c.iv ? c.iv * c.ease * 1.3 : 4); if (q === 2) c.ease = Math.max(1.3, c.ease - 0.15); if (q === 4) c.ease += 0.15; c.due = Date.now() + c.iv * 864e5; }
      st.cards[k] = c; if (isNew) st.newDay[today()] = (st.newDay[today()] || 0) + 1; save(); done++; next();
    }
    function prefs() { st.prefs = { deck: deck.value, track: track.value, dir: dir, newN: newSel.value }; save(); }
    function markDir() { [].forEach.call(dirG.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === dir)); }); }
    dirG.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; dir = b.getAttribute('data-v'); markDir(); prefs(); build(); });
    [deck, track, newSel].forEach(function (el) { el.addEventListener('change', function () { prefs(); build(); }); });
    flipB.addEventListener('click', flip); stage.addEventListener('click', flip);
    grade.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) rate(+b.getAttribute('data-q')); });
    D.addEventListener('keydown', function (e) { if (e.target.closest && e.target.closest('select,input')) return; if (e.key === ' ' || e.key === 'Enter') { if (!flipped) { e.preventDefault(); flip(); } } else if (/^[1-4]$/.test(e.key) && flipped) rate(+e.key); });
    D.getElementById('arf-reset').addEventListener('click', function () { if (!confirm('Forget your progress on the cards in this deck?')) return; pool().forEach(function (w) { delete st.cards[w.id + ':w']; delete st.cards[w.id + ':a']; }); save(); build(); });
    markDir(); build();
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})(window, document);

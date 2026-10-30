#!/usr/bin/env node
/* Pre-K answer check, independent of the generators (static/math/gen/pk.js).

   node scripts/math/verify-pk.js [-n 400]

   For every Pre-K topic it makes n problems per level (1, 2, 3) and works each answer out again from two things only:
   p.ask (what the question asks, such as "count", "the biggest" or "what comes next in the pattern") and the picture
   spec (p.viz.opts): it counts the drawn things, finds the repeating part of a pattern, reads the tilt of a balance, and
   so on, with its own tables of facts (weights, shapes of real things, story order, corners). It then compares its answer
   with the problem's marked choice. It also checks that pictures only use things pk-pic can draw, that a "pick" picture
   has one answer button per picture, and that the right answer is unique. Exit status 1 on any mismatch. */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm');
var ROOT = path.resolve(__dirname, '..', '..');
var N = 400; var ai = process.argv.indexOf('-n'); if (ai > 0) N = Math.max(10, parseInt(process.argv[ai + 1], 10) || 400);
global.window = global;
require(path.join(ROOT, 'static/homeschool/calc/cas.js'));
require(path.join(ROOT, 'static/math/core/gen.js'));
require(path.join(ROOT, 'static/math/core/tex.js'));
require(path.join(ROOT, 'static/math/core/check.js'));
require(path.join(ROOT, 'static/math/gen/pk.js'));
var ML = global.MathLadder;
// what pk-pic can draw: its OBJ table, read from the visual's own source
var vsrc = fs.readFileSync(path.join(ROOT, 'static/math/viz/pk.js'), 'utf8');
var OBJ = vm.runInNewContext('(' + vsrc.match(/var OBJ = (\{[\s\S]*?\});/)[1] + ')');
var topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/math/topics/pk.json'), 'utf8')).topics;
var LET = 'ABCDE';

// ---- this checker's own facts
var WEIGHT = { elephant: 5000, whale: 30000, cow: 600, horse: 500, truck: 5000, tractor: 3000, bus: 12000, lion: 190, watermelon: 5, pumpkin: 5,
  bike: 12, mouse: 0.02, hen: 2, rabbit: 2, fish: 0.5, balloon: 0.005, strawberry: 0.02, leaf: 0.002, ball: 0.4, cat: 4, duck: 1.5, acorn: 0.005, egg: 0.06, bee: 0.0001, shoe: 0.4, butterfly: 0.0005 };
var KIND = {}; [['fruit', 'apple pear orange banana strawberry lemon watermelon'], ['ride', 'car bus boat truck bike tractor rocket'],
  ['animal', 'cat dog bunny pig cow horse duck frog fish owl penguin fox lion monkey'], ['wear', 'sock shoe cap tshirt']].forEach(function (g) { g[1].split(' ').forEach(function (k) { KIND[k] = g[0]; }); });
var REALSHAPE = { clock: 'circle', cookie: 'circle', donut: 'circle', target: 'circle', ball: 'circle', pizza: 'triangle', tent: 'triangle', ruler: 'triangle',
  door: 'rectangle', phone: 'rectangle', brick: 'rectangle', envelope: 'rectangle', book: 'rectangle' };
var CORNERS = { triangle: 3, square: 4, rectangle: 4, diamond: 4, circle: 0, oval: 0 };
var STORIES = [['egg', 'chickhatch', 'chick'], ['seed', 'sprout', 'tulip'], ['caterpillar', 'butterfly'], ['ice', 'drop'], ['snowflake', 'snowman'], ['brick', 'house'],
  ['bread', 'sandwich'], ['letter', 'mailbox'], ['sprout', 'tree'], ['sunrise', 'sun', 'moon'], ['sock', 'shoe']];
var DAYORDER = ['wake up', 'get dressed', 'eat breakfast', 'go out', 'eat lunch', 'eat dinner', 'read a bedtime story', 'go to sleep'];
var DAYPIC = { alarm: 'wake up', bowl: 'eat breakfast', sandwich: 'eat lunch', dinner: 'eat dinner', bed: 'go to sleep' };
var WHEN = { 'eat breakfast': 'morning', 'wake up': 'morning', 'see the sun come up': 'morning', 'eat lunch': 'afternoon', 'see the stars': 'night', 'go to sleep': 'night', 'put on pajamas': 'night', 'have a bedtime story': 'night' };
var COIN_MM = { penny: 19.05, nickel: 21.21, dime: 17.91, quarter: 24.26 };
var POSWORD = { above: 'above', on: 'on the', under: 'under', beside: 'beside', front: 'in front', behind: 'behind' };

function things(g) { var out = []; if (g.mix) g.mix.forEach(function (m) { for (var i = 0; i < m.n; i++) out.push(m.obj); }); else for (var j = 0; j < (g.n || 0); j++) out.push(g.obj || 'apple'); return out; }
function groupsOf(o) { return o.kind === 'groups' ? o.groups : [o]; }
function argBy(arr, f, want) { // index of the max / min / middle value (must be unique)
  var vals = arr.map(f), s = vals.slice().sort(function (a, b) { return a - b; });
  var t = want === 'max' ? s[s.length - 1] : want === 'min' ? s[0] : s[1];
  if (vals.filter(function (v) { return v === t; }).length !== 1) throw new Error('not unique: ' + vals.join(','));
  return vals.indexOf(t);
}
function oddIndex(arr, key) { var vals = arr.map(key); var i = vals.findIndex(function (v) { return vals.filter(function (x) { return x === v; }).length === 1; }); if (i < 0 || vals.filter(function (v) { return v !== vals[i]; }).some(function (v) { return v !== vals[(i + 1) % vals.length]; })) throw new Error('no single odd one'); return i; }
function emoji(k) { if (k in OBJ) return OBJ[k]; if (/^[^\x00-\x7f]+$/.test(String(k))) return k; throw new Error('pk-pic cannot draw ' + k); }

// returns { idx } (a picture), { num }, { has: text the right choice contains } or { text }
function expect(p) {
  var o = (p.viz && p.viz.opts) || {}, a = p.ask || {}, it = o.items || [];
  switch (a.t) {
    case 'count':
      var n = 0; groupsOf(o).forEach(function (g) { var ts = things(g); if (a.left) ts = ts.slice(0, ts.length - (g.cross || 0)); n += ts.filter(function (k) { return !a.obj || k === a.obj; }).length; }); return { num: n };
    case 'path': var shown = []; for (var v = o.from; v <= o.to; v++) shown.push(v); if (o.hide.length !== 1) throw new Error('one hidden number expected'); return { num: shown.filter(function (x) { return o.hide.indexOf(x) >= 0; })[0] };
    case 'hand': return { num: o.n + (a.plus || 0) };
    case 'plus1': return { num: a.n + 1 };
    case 'later': return { num: Math.max(a.a, a.b) };
    case 'which-n': var cn = o.groups.map(function (g) { return things(g).length; }); if (cn.filter(function (c) { return c === a.n; }).length !== 1) throw new Error('target count not unique'); return { idx: cn.indexOf(a.n) };
    case 'more': case 'fewer': var c2 = o.groups.map(function (g) { return things(g).length; }); if (c2[0] === c2[1]) throw new Error('equal groups'); var wi = a.t === 'more' ? (c2[0] > c2[1] ? 0 : 1) : (c2[0] < c2[1] ? 0 : 1); return { has: emoji(o.groups[wi].obj) };
    case 'same': var c3 = o.groups.map(function (g) { return things(g).length; }); return { text: c3[0] === c3[1] ? 'Yes, the same' : 'No, not the same' };
    case 'size': return { idx: argBy(it, function (x) { return x.s; }, a.want) };
    case 'height': return { idx: argBy(it, function (x) { return x.h; }, a.want) };
    case 'blocks': return { num: it[0].h };
    case 'len': return { idx: argBy(it, function (x) { return x.len; }, a.want) };
    case 'units': return { num: it[0].len };
    case 'known': var kh = argBy(a.items, function (k) { return WEIGHT[k]; }, a.want === 'heavy' ? 'max' : 'min'); return { has: emoji(a.items[kh]) };
    case 'balance':
      var down = o.tilt === 'left' ? o.left : o.right, up = o.tilt === 'left' ? o.right : o.left;
      if (!(WEIGHT[down] > WEIGHT[up])) throw new Error('balance tips the wrong way: ' + down + ' vs ' + up);
      return { has: emoji(a.want === 'heavy' ? down : up) };
    case 'color': if (it.filter(function (x) { return x.color === a.color; }).length !== 1) throw new Error('color not unique'); return { idx: it.findIndex(function (x) { return x.color === a.color; }) };
    case 'odd-color': return { idx: oddIndex(it, function (x) { return x.color; }) };
    case 'odd-shape': return { idx: oddIndex(it, function (x) { return x.s; }) };
    case 'odd-size': return { idx: oddIndex(it, function (x) { return x.s > 1; }) };
    case 'odd': return { idx: oddIndex(it, function (x) { return x.s + '/' + x.color; }) };
    case 'count-color': return { num: it.filter(function (x) { return x.color === a.color; }).length };
    case 'count-shape': return { num: it.filter(function (x) { return x.s === a.s; }).length };
    case 'count-size': return { num: it.filter(function (x) { return (x.s > 1) === a.big; }).length };
    case 'odd-group': return { has: emoji(it[oddIndex(it, function (k) { if (!KIND[k]) throw new Error('unknown kind ' + k); return KIND[k]; })]) };
    case 'pattern':
      var L = it.length, hid = o.hide[0];
      for (var per = 1; per <= L / 2; per++) {
        var ok = true; for (var i = 0; i < L && ok; i++) for (var j = i + per; j < L; j += per) if (it[i] !== null && it[j] !== null && it[i] !== it[j]) { ok = false; break; }
        if (ok && per > 1) { for (var q = hid % per; q < L; q += per) if (it[q] !== null) return { text: it[q] }; }
      }
      throw new Error('no pattern found');
    case 'shape': if (it.filter(function (x) { return x.s === a.s; }).length !== 1) throw new Error('shape not unique'); return { idx: it.findIndex(function (x) { return x.s === a.s; }) };
    case 'name-shape': return { text: it[0].s };
    case 'corners': case 'sides': return { num: CORNERS[it[0].s] };
    case 'which-corners': var wc = it.map(function (x) { return CORNERS[x.s]; }); if (wc.filter(function (c) { return c === a.n; }).length !== 1) throw new Error('corner count not unique'); return { idx: wc.indexOf(a.n) };
    case 'real': return { has: REALSHAPE[it[0].obj] };
    case 'real-which': var rw = it.filter(function (k) { return REALSHAPE[k] === a.s; }); if (rw.length !== 1) throw new Error('real thing not unique'); return { has: emoji(rw[0]) };
    case 'pos': return { has: POSWORD[it[0].pos] };
    case 'pick-pos': if (it.filter(function (x) { return x.pos === a.pos; }).length !== 1) throw new Error('pos not unique'); return { idx: it.findIndex(function (x) { return x.pos === a.pos; }) };
    case 'between': return { has: emoji(o.between[1]) };
    case 'line': return { has: emoji(it[a.want === 'first' ? 0 : a.want === 'last' ? it.length - 1 : 1]) };
    case 'story':
      var st = STORIES.filter(function (s) { return s.length === it.length && s.every(function (x, i) { return it[i] === null || it[i] === x; }); });
      if (st.length < 1) throw new Error('unknown story'); var hs = it.indexOf(null); var ans = st.map(function (s) { return s[hs]; }); if (ans.some(function (x) { return x !== ans[0]; })) throw new Error('story ambiguous'); return { has: emoji(ans[0]) };
    case 'time': return { has: it[0].time };
    case 'pick-time': return { idx: it.findIndex(function (x) { return x.time === a.time; }) };
    case 'do': return { has: WHEN[a.what] };
    case 'pair': var ia = DAYORDER.indexOf(a.a), ib = DAYORDER.indexOf(a.b), sa = ['put on socks', 'put on shoes'];
      if (sa.indexOf(a.a) >= 0) { ia = sa.indexOf(a.a); ib = sa.indexOf(a.b); }
      if (ia < 0 || ib < 0) throw new Error('unknown step'); return { text: (a.want === 'first') === (ia < ib) ? a.a : a.b, contains: true };
    case 'day':
      var steps = it.map(function (k) { return k === null ? null : DAYPIC[k]; }), h = steps.indexOf(null), known = steps.filter(Boolean).map(function (s) { return DAYORDER.indexOf(s); });
      // the three pictures are in order: the missing one sits between its neighbors in the day
      var cands = Object.keys(DAYPIC).filter(function (k) {
        var d = DAYORDER.indexOf(DAYPIC[k]); if (steps.indexOf(DAYPIC[k]) >= 0) return false;
        var all = steps.map(function (s, i) { return i === h ? d : DAYORDER.indexOf(s); }); return all.every(function (x, i) { return !i || x > all[i - 1]; });
      });
      var ch = p.a.choices.map(function (c) { return cands.filter(function (k) { return c.indexOf(OBJ[k]) === 0; }).length > 0; });
      if (ch.filter(Boolean).length !== 1) throw new Error('day step not unique among the choices'); return { idx: ch.indexOf(true), byChoice: true };
    case 'coin-count': return { num: it.length };
    case 'coin': return { idx: a.want === 'penny' ? it.findIndex(function (x) { return x.c === 'penny'; }) : argBy(it, function (x) { return COIN_MM[x.c]; }, a.want === 'biggest' ? 'max' : 'min') };
  }
  throw new Error('unknown ask ' + a.t);
}

var bad = 0, total = 0, perTopic = {};
topics.forEach(function (t) {
  perTopic[t.id] = 0;
  for (var lv = 1; lv <= 3; lv++) for (var s = 0; s < N; s++) {
    var p = ML.makeProblem(t.id, 'v' + s, { level: lv, mode: 'quiz' }); total++; perTopic[t.id]++;
    try {
      var A = p.a; if (A.t !== 'mc') throw new Error('answer is not a tap choice');
      if (new Set(A.choices).size !== A.choices.length) throw new Error('repeated choices');
      var right = A.choices[A.v], o = (p.viz && p.viz.opts) || {};
      groupsOf(o).forEach(function (g) { things(g).forEach(emoji); });
      (o.items || []).forEach(function (x) { if (typeof x === 'string') emoji(x); else if (x && x.obj && o.kind !== 'sizes' && x.s !== 'thing') { } else if (x && x.obj) emoji(x.obj); });
      if (o.pick) { var k = (o.items || o.groups || []).length; if (A.choices.length !== k || !A.keep) throw new Error('pick picture needs one fixed choice per picture'); }
      var e = expect(p), got;
      if (e.idx !== undefined) { got = e.byChoice ? A.v === e.idx : right === LET[e.idx]; }
      else if (e.num !== undefined) got = right === String(e.num);
      else if (e.has !== undefined) { got = right.indexOf(e.has) >= 0 && A.choices.filter(function (c) { return c.indexOf(e.has) >= 0; }).length === 1; }
      else got = e.contains ? right.indexOf(e.text) >= 0 : right === e.text;
      if (!got) throw new Error('answer ' + right + ' but the picture says ' + JSON.stringify(e));
    } catch (err) { bad++; if (bad <= 15) console.log('  ✗ ' + t.id + ' L' + lv + ' seed v' + s + ': ' + err.message + '\n      q: ' + p.q.replace(/<[^>]+>/g, '')); }
  }
});
console.log('Pre-K answer check: ' + topics.length + ' topics, ' + total + ' problems, ' + (bad ? bad + ' mismatches' : 'every answer worked out again from the picture'));
process.exit(bad ? 1 : 0);

/* Panegyris / Ludi: an isometric festival-grounds builder in Koine Greek and Latin. */
(function (W, D) {
  'use strict';
  var FV = W.FestVocab, A = W.FestArt, C = W.FestCore, FD = W.FestData, V = FV.V, B = FV.B, T = FV.T;
  var root = D.getElementById('fest'); if (!root) return;
  var N = C.N, TW = A.TW, TH = A.TH, idx = C.idx;
  var DAY = 180; // game seconds per day (one day is one month of the festival calendar)

  var DEF = {
    path: { size: [1, 1], cost: 10, kind: 'path', group: 'gWays' },
    gate: { size: [1, 1], kind: 'gate' },
    theater: { size: [3, 3], cost: 900, upkeep: 40, kind: 'show', fun: 55, dur: 14, cap: 24, price: 8, value: 12, group: 'gShows', appeal: 6 },
    hippodrome: { size: [5, 3], cost: 1500, upkeep: 70, kind: 'show', fun: 75, dur: 16, cap: 36, price: 12, value: 18, group: 'gShows', appeal: 8 },
    temple: { size: [3, 2], cost: 700, upkeep: 25, kind: 'show', fun: 28, energy: 10, dur: 8, cap: 14, price: 2, value: 6, group: 'gShows', appeal: 5, decor: 2 },
    palaestra: { size: [3, 3], cost: 600, upkeep: 25, kind: 'show', fun: 40, energy: -12, dur: 10, cap: 12, price: 5, value: 8, group: 'gShows', appeal: 4 },
    odeum: { size: [2, 2], cost: 500, upkeep: 20, kind: 'show', fun: 35, dur: 10, cap: 14, price: 5, value: 8, group: 'gShows', appeal: 4 },
    bakery: { size: [1, 1], cost: 150, upkeep: 6, kind: 'food', hunger: -65, dur: 3, cap: 3, price: 3, value: 5, group: 'gFood' },
    tavern: { size: [1, 1], cost: 200, upkeep: 8, kind: 'drink', thirst: -55, fun: 8, dur: 4, cap: 4, price: 4, value: 6, group: 'gFood' },
    fountain: { size: [1, 1], cost: 120, upkeep: 2, kind: 'drink', thirst: -40, dur: 2, cap: 2, price: 0, value: 2, group: 'gFood', decor: 1 },
    market: { size: [1, 1], cost: 180, upkeep: 6, kind: 'shop', fun: 16, dur: 4, cap: 3, price: 6, value: 8, group: 'gFood', appeal: 1 },
    baths: { size: [2, 2], cost: 800, upkeep: 30, kind: 'rest', energy: 45, fun: 18, toilet: -40, dur: 12, cap: 14, price: 6, value: 9, group: 'gCare', appeal: 3 },
    latrine: { size: [1, 1], cost: 100, upkeep: 3, kind: 'toilet', toilet: -100, dur: 3, cap: 2, price: 0, value: 2, group: 'gCare' },
    bench: { size: [1, 1], cost: 20, upkeep: 0, kind: 'rest', energy: 22, dur: 5, cap: 2, price: 0, value: 0, group: 'gCare' },
    olive: { size: [1, 1], cost: 25, kind: 'decor', decor: 1.2, group: 'gDecor' },
    cypress: { size: [1, 1], cost: 25, kind: 'decor', decor: 1, group: 'gDecor' },
    statue: { size: [1, 1], cost: 150, kind: 'decor', decor: 2.5, group: 'gDecor' },
    flowers: { size: [1, 1], cost: 30, kind: 'decor', decor: 1.5, group: 'gDecor' },
    torch: { size: [1, 1], cost: 40, kind: 'decor', decor: 0.4, light: 3, group: 'gDecor' },
    // unlocked by rank
    stadium: { size: [5, 2], cost: 1200, upkeep: 50, kind: 'show', fun: 60, energy: -8, dur: 14, cap: 30, price: 9, value: 14, group: 'gShows', appeal: 6, rank: 2 },
    library: { size: [2, 2], cost: 650, upkeep: 22, kind: 'show', fun: 38, energy: 8, dur: 10, cap: 10, price: 4, value: 8, group: 'gShows', appeal: 4, rank: 2 },
    amphitheater: { size: [4, 4], cost: 3000, upkeep: 120, kind: 'show', fun: 90, dur: 18, cap: 60, price: 15, value: 24, group: 'gShows', appeal: 10, rank: 4 },
    stoa: { size: [3, 1], cost: 350, upkeep: 8, kind: 'rest', energy: 35, dur: 6, cap: 8, price: 0, value: 0, group: 'gCare', decor: 1.5, rank: 2 },
    inn: { size: [2, 2], cost: 700, upkeep: 25, kind: 'rest', energy: 70, hunger: -30, dur: 14, cap: 8, price: 8, value: 12, group: 'gCare', rank: 2 },
    altar: { size: [1, 1], cost: 120, kind: 'decor', decor: 2, group: 'gDecor', rank: 2 },
    trophy: { size: [1, 1], cost: 600, kind: 'decor', decor: 5, group: 'gDecor', rank: 4 },
    aqueduct: { size: [1, 3], cost: 900, upkeep: 15, kind: 'water', group: 'gCity', rank: 2, only: 'rome' },
    curia: { size: [3, 2], cost: 1500, upkeep: 40, kind: 'civic', group: 'gCity', rank: 3 },
    barracks: { size: [3, 3], cost: 1200, upkeep: 60, kind: 'civic', group: 'gCity', rank: 3 }
  };
  var STAFF = { worker: { hire: 60, wage: 30, tunic: '#8a5a33', hair: '#5a3b22' }, musician: { hire: 90, wage: 45, tunic: '#5b4a7a', hair: '#2a1d14' } };
  var GROUPS = ['gWays', 'gShows', 'gFood', 'gCare', 'gDecor', 'gCity'];
  var LAND = [[8, 16, 35, 43], [4, 10, 39, 43], [0, 4, 43, 43], [0, 0, 43, 43]], LANDCOST = [1500, 3500, 7000];
  var ICON = { hunger: '🍞', thirst: '💧', toilet: '🚻', energy: '💤', fun: '🎭', happy: '😊', sad: '😞', money: '🪙', pretty: '🌿', lost: '❓', dark: '🌙', dirty: '🗑️', music: '🎵', fest: '🎉' };
  var SIDES = ['south-east', 'south-west', 'north-west', 'north-east'];
  function hasEntry(type) { var k = DEF[type].kind; return k !== 'decor' && k !== 'water' && k !== 'path' && k !== 'gate'; }
  function dimsOf(type, rot) { return C.dims(DEF[type].size, rot || 0); }
  function fmt(n) { return C.fmt(n); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- language display ----------
  var show = { n: true, e: true }, prefs = { ent: false };
  var forceLang = null;
  function L(o, cls) {
    if (!o) return '';
    var k = forceLang || (S && S.setting === 'rome' ? 'l' : 'g'), h = '';
    if (show.n && o[k]) h += '<span class="l' + k + '">' + o[k] + '</span>';
    if ((show.e || !h) && o.e) h += '<span class="le">' + o.e + '</span>';
    return '<span class="vx ' + (cls || '') + '">' + h + '</span>';
  }

  // ---------- storage (every key starts with trb- so learner profiles can swap them) ----------
  var KEY = { prefs: 'trb-fest-prefs', stars: 'trb-fest-stars', auto: function (g) { return 'trb-fest-auto-' + g; }, slot: function (n) { return 'trb-fest-slot-' + n; } };
  function lsGet(k) { try { return W.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { W.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { W.localStorage.removeItem(k); } catch (e) { } }
  (function moveOldKeys() { // saves from before the trb- keys
    ['greece', 'rome'].forEach(function (s) { var o = lsGet('panegyris-v1-' + s); if (o != null) { if (lsGet(KEY.auto(s)) == null) lsSet(KEY.auto(s), o); lsDel('panegyris-v1-' + s); } });
    var l = lsGet('panegyris-langs'); if (l != null) { if (lsGet(KEY.prefs) == null) lsSet(KEY.prefs, l); lsDel('panegyris-langs'); }
  })();
  (function () { try { var l = JSON.parse(lsGet(KEY.prefs)); if (l && ('n' in l) && (l.n || l.e)) { show = { n: !!l.n, e: !!l.e }; prefs.ent = !!l.ent; } } catch (e) { } })();
  function savePrefs() { lsSet(KEY.prefs, JSON.stringify({ n: show.n, e: show.e, ent: prefs.ent })); }
  function stars() { try { return JSON.parse(lsGet(KEY.stars)) || {}; } catch (e) { return {}; } }

  // ---------- state ----------
  var S = null, occ, pathG, objById = {}, nextId = 1, vid = 1, litter = new Uint8Array(N * N), lightG = new Uint8Array(N * N), gateB = null;
  function inMap(x, y) { return x >= 0 && y >= 0 && x < N && y < N; }
  function inb(x, y) { var b = LAND[S ? S.land || 0 : 0]; return x >= b[0] && y >= b[1] && x <= b[2] && y <= b[3]; }
  var GATE = { x: 21, y: N - 1 }, GI = idx(21, N - 1);
  function rankOf(s) { var r = 1; FV.RANKS.forEach(function (k, i) { if (i && s.totalVisitors >= k.v && s.fame >= k.f) r = Math.max(r, i + 1); }); return r; }
  function working(o) { return o.ok && o.open !== false; }
  function has(type) { return S.objects.some(function (o) { return o.type === type && (!hasEntry(type) || o.ok); }); }
  function scen() { return S && S.scen ? FD.SCEN.filter(function (q) { return q.id === S.scen; })[0] : null; }
  function unlocked(type) { var d = DEF[type], sc = scen(); return (d.rank || 1) <= (S.rank || 1) || (sc && sc.unlock && sc.unlock.indexOf(type) >= 0); }

  function newState(setting, sc) {
    var s = { setting: setting, coins: sc ? sc.coins : 3000, day: 1, time: 0, fame: 50, totalVisitors: 0, entryFee: 10, objects: [], paths: [], goals: {}, lifetimeIncome: 0, v: 3, land: 0, rank: 1,
      seed: (Math.random() * 2147483647) | 0, ledger: C.newLedger(), m0: sc ? sc.m0 : (setting === 'rome' ? 1 : 9), staff: [], litter: [], gid: sc ? 'sc-' + sc.id : setting, scen: sc ? sc.id : null,
      sgoals: {}, festVisitors: 0, shopSales: 0, dayVisitors: 0, festDayVis: 0, cmp: {} };
    for (var y = N - 2; y >= N - 7; y--) s.paths.push(idx(GATE.x, y));
    for (var x = GATE.x - 3; x <= GATE.x + 3; x++) if (x !== GATE.x) s.paths.push(idx(x, N - 7));
    var r = C.mulberry(setting === 'rome' ? 11 : 5);
    for (var i = 0; i < 70; i++) {
      var tx = Math.floor(r() * N), ty = Math.floor(r() * N);
      if (Math.abs(tx - GATE.x) < 5 && ty > N - 10) continue;
      s.objects.push({ type: r() < 0.6 ? 'olive' : 'cypress', x: tx, y: ty, seed: Math.floor(r() * 1000), wild: 1, rot: 0 });
    }
    return s;
  }
  function rebuild() {
    occ = new Int32Array(N * N).fill(0); pathG = new Uint8Array(N * N); objById = {};
    S.paths.forEach(function (i) { pathG[i] = 1; });
    pathG[GI] = 2;
    var keep = [];
    S.objects.forEach(function (o) {
      if (!DEF[o.type]) return;
      o.rot = o.rot || 0; var dm = dimsOf(o.type, o.rot), w = dm[0], h = dm[1];
      if (!fits(o.x, o.y, w, h, true, o.wild)) return;
      o.id = o.id || nextId++; nextId = Math.max(nextId, o.id + 1);
      o.w = w; o.h = h; o.inside = o.inside || []; o.served = o.served || 0; o.income = o.income || 0;
      if (o.price == null) o.price = DEF[o.type].price || 0; if (o.open == null) o.open = true;
      for (var yy = o.y; yy < o.y + h; yy++) for (var xx = o.x; xx < o.x + w; xx++) occ[idx(xx, yy)] = o.id;
      objById[o.id] = o; keep.push(o);
    });
    S.objects = keep; groundDirty = true; refreshLinks();
  }
  // Which buildings have a path at their entrance, which of those reach the gate, where there is water and light.
  function refreshLinks() {
    gateB = C.bfs(GI, function (i) { return pathG[i] > 0 && inb(i % N, (i / N) | 0); });
    lightG.fill(0);
    var aq = S.objects.filter(function (o) { return o.type === 'aqueduct'; });
    S.objects.forEach(function (o) {
      var d = DEF[o.type];
      if (hasEntry(o.type)) {
        var e = C.entrance(o.x, o.y, o.w, o.h, o.rot); o.ex = e.x; o.ey = e.y; o.side = e.side;
        o.eIdx = inMap(e.x, e.y) ? idx(e.x, e.y) : -1;
        o.ok = o.eIdx >= 0 && inb(e.x, e.y) && pathG[o.eIdx] === 1;
        o.linked = o.ok && gateB.dist[o.eIdx] >= 0;
        o.water = (d.kind === 'drink' || o.type === 'baths') && aq.some(function (a) { return Math.abs(a.x + a.w / 2 - o.x - o.w / 2) <= 8 && Math.abs(a.y + a.h / 2 - o.y - o.h / 2) <= 8; });
        if (o.ok) lightAround(e.x, e.y, 1);
      }
      if (d.light) lightAround(o.x, o.y, d.light);
    });
    lightAround(GATE.x, GATE.y, 2);
  }
  function lightAround(x, y, r) { for (var yy = y - r; yy <= y + r; yy++) for (var xx = x - r; xx <= x + r; xx++) if (inMap(xx, yy) && Math.abs(xx - x) + Math.abs(yy - y) <= r + 1) lightG[idx(xx, yy)] = 1; }
  function fits(x, y, w, h, strict, anywhere) {
    for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) {
      if (!(anywhere ? inMap(xx, yy) : inb(xx, yy))) return false;
      var i = idx(xx, yy); if (pathG[i]) return false;
      if (occ[i] && (strict || !objById[occ[i]] || !objById[occ[i]].wild)) return false;
    }
    return true;
  }
  function access(o) { return o.ok ? [o.eIdx] : []; }
  function walkable(i) { return pathG[i] > 0 && inb(i % N, (i / N) | 0); }
  function bfs(from) { return C.bfs(from, walkable); }
  var route = C.route;

  // ---------- money ----------
  function earn(cat, amt) { if (!amt) return; S.coins += C.book(S.ledger, cat, amt); if (cat === 'fees' || cat === 'sales') S.lifetimeIncome += amt; }
  function spend(cat, amt) { if (!amt) return; S.coins += C.book(S.ledger, cat, amt); }

  // ---------- festivals ----------
  var fests = [], featured = {}, crowd = 1;
  function festName(f) { return L({ g: f.g, l: f.l, e: f.e }, 'inline'); }
  function setFests() {
    fests = C.festsOn(FD.FESTS.filter(function (f) { return f.setting === S.setting; }), S.day, S.m0);
    featured = {}; crowd = 1;
    var yr = C.calendar(S.day, S.m0).year;
    fests.forEach(function (f) {
      var c = f.crowd; if (f.great && yr % f.great.every === f.great.at) c = f.great.crowd;
      crowd = Math.max(crowd, c); f.feat.forEach(function (t) { featured[t] = 1; });
    });
  }
  function isGreat(f) { return f.great && C.calendar(S.day, S.m0).year % f.great.every === f.great.at; }
  function festTarget() { return Math.round(20 + 8 * (S.rank || 1) + 6 * (S.land || 0)); }

  // ---------- visitors ----------
  var visitors = [], feed = [], staff = [];
  var TUNICS = ['#f3efe4', '#2f5f93', '#b44b3a', '#c9a24a', '#6f8a47', '#8c1d2c', '#e8d7b0', '#5b4a7a'];
  var HAIR = ['#3a2a1e', '#5a3b22', '#7a5530', '#2a1d14', '#a0764a', '#8a8a8a'];
  function spawn() {
    var r = Math.random, names = FV.NAMES[S.setting];
    var v = {
      id: vid++, name: names[Math.floor(r() * names.length)], tile: GI, x: GATE.x, y: GATE.y, path: [], state: 'walk', timer: 0,
      needs: { hunger: 10 + r() * 30, thirst: 10 + r() * 30, toilet: r() * 30, energy: 80 + r() * 20, fun: 40 + r() * 20 },
      money: 40 + Math.floor(r() * 90) + (fests.length ? 20 : 0), happy: 55 + r() * 15 + (fests.length ? 8 : 0), rej: {}, cd: {}, tunic: TUNICS[Math.floor(r() * TUNICS.length)], hair: HAIR[Math.floor(r() * HAIR.length)], bubble: null, age: 0, spent: 0
    };
    if (v.money < S.entryFee) return;
    v.money -= S.entryFee; earn('fees', S.entryFee);
    S.totalVisitors++; S.dayVisitors = (S.dayVisitors || 0) + 1; visitors.push(v);
    if (fests.length) { S.festVisitors = (S.festVisitors || 0) + 1; S.festDayVis = (S.festDayVis || 0) + 1; if (r() < 0.25) think(v, 'fest', 'fest'); }
    else if (r() < 0.3) think(v, 'arrive', 'happy');
  }
  var COMPLAIN = { noFood: 1, noDrink: 1, noToilet: 1, noSeat: 1, bored: 1, pricey: 1, lost: 1, dark: 1, dirty: 1, broke: 1 };
  function think(v, key, icon, where) {
    var now = simClock;
    if (v.cd[key] && now - v.cd[key] < 25) return;
    v.cd[key] = now; v.bubble = { icon: ICON[icon] || '💬', t: 2.6 };
    if (COMPLAIN[key]) S.cmp[key] = (S.cmp[key] || 0) + 1;
    feed.unshift({ v: v.name, vid: v.id, t: T[key], icon: ICON[icon] || '💬', where: where ? B[where] : null });
    if (feed.length > 40) feed.pop();
    feedDirty = true;
  }
  function wants(o, need) {
    var d = DEF[o.type];
    if (need === 'hunger') return d.kind === 'food' || (d.hunger || 0) < -20;
    if (need === 'thirst') return d.kind === 'drink';
    if (need === 'toilet') return (d.toilet || 0) < 0;
    if (need === 'energy') return d.kind === 'rest' || (d.energy || 0) > 0;
    return d.kind === 'show' || d.kind === 'shop' || (d.fun || 0) > 20;
  }
  function capOf(o) { var c = DEF[o.type].cap || 0; return o.water ? Math.round(c * 1.5) : c; }
  function decide(v) {
    var n = v.needs;
    if (v.state === 'leaving') return;
    if (v.happy < 18 || n.energy < 12 || v.age > DAY * 1.2 || (v.money < 1 && n.hunger > 70)) return leave(v);
    var need = null;
    if (n.toilet > 75) need = 'toilet'; else if (n.hunger > 60) need = 'hunger'; else if (n.thirst > 55) need = 'thirst';
    else if (n.energy < 35) need = 'energy'; else if (n.fun < 45 || Math.random() < 0.35) need = 'fun';
    if (!need) return wander(v);
    var b = bfs(v.tile), best = null, bestScore = 1e9;
    S.objects.forEach(function (o) {
      if (!hasEntry(o.type) || DEF[o.type].kind === 'civic' || !wants(o, need)) return;
      if (v.rej[o.id] && simClock - v.rej[o.id] < 40) return;
      var acc = access(o); if (!acc.length || b.dist[acc[0]] < 0) return;
      var d = DEF[o.type], dmin = b.dist[acc[0]], sc = dmin + o.price * 1.5 - (d.appeal || 0) * 2 + o.inside.length / Math.max(1, capOf(o)) * 6 + Math.random() * 4;
      if (featured[o.type]) sc -= 8;
      if (need === 'fun' && v.last === o.id) sc += 25;
      if (sc < bestScore) { bestScore = sc; best = { o: o, at: acc[0] }; }
    });
    if (!best) {
      var miss = { hunger: 'noFood', thirst: 'noDrink', toilet: 'noToilet', energy: 'noSeat', fun: 'bored' }[need];
      think(v, miss, need); v.happy -= need === 'fun' ? 1 : 5; return wander(v);
    }
    var d = DEF[best.o.type], will = d.value * (0.9 + v.happy / 180) * 1.5 * (featured[best.o.type] ? 1.25 : 1);
    if (best.o.price > will) { think(v, 'pricey', 'money', best.o.type); v.rej[best.o.id] = simClock; v.happy -= 3; return wander(v); }
    if (best.o.price > v.money) { think(v, 'broke', 'money'); return leave(v); }
    v.target = best.o.id; v.path = route(b, best.at); v.goal = best.at;
    if (!v.path.length) arrive(v);
  }
  function wander(v) {
    var cx = v.tile % N, cy = (v.tile / N) | 0, opts = [];
    for (var k = 0; k < 4; k++) {
      var nx = cx + (k === 0) - (k === 1), ny = cy + (k === 2) - (k === 3);
      if (inb(nx, ny) && pathG[idx(nx, ny)] === 1 && idx(nx, ny) !== v.prevTile) opts.push(idx(nx, ny));
    }
    if (!opts.length && v.prevTile != null && pathG[v.prevTile] === 1) opts.push(v.prevTile);
    v.target = null; v.path = opts.length ? [opts[Math.floor(Math.random() * opts.length)]] : [];
    if (!opts.length) { v.timer = 1; }
  }
  function leave(v) {
    v.state = 'leaving'; v.target = null;
    var b = bfs(v.tile);
    if (b.dist[GI] < 0) { think(v, 'lost', 'lost'); v.path = []; v.stuck = (v.stuck || 0) + 1; if (v.stuck > 3) depart(v); return; }
    v.path = route(b, GI);
    think(v, 'home', v.happy > 60 ? 'happy' : 'sad');
  }
  function depart(v) {
    visitors.splice(visitors.indexOf(v), 1);
    S.fame = S.fame * 0.93 + v.happy * 0.07;
    if (v.happy > 75 && Math.random() < 0.5) feed.unshift({ v: v.name, vid: v.id, t: T.homeHappy, icon: ICON.happy });
    else if (v.happy < 35) feed.unshift({ v: v.name, vid: v.id, t: T.homeSad, icon: ICON.sad });
    if (feed.length > 40) feed.pop(); feedDirty = true;
    if (sel && sel.v === v) select(null);
  }
  function arrive(v) {
    var o = objById[v.target];
    if (!o || !o.ok) { v.target = null; return; }
    var d = DEF[o.type];
    if (!o.open) { think(v, 'closed', 'sad', o.type); v.rej[o.id] = simClock; v.target = null; return; }
    if (o.inside.length >= capOf(o)) { v.state = 'queue'; v.timer = 3; v.queueT = (v.queueT || 0) + 3; if (v.queueT > 15) { v.rej[o.id] = simClock; v.state = 'walk'; v.queueT = 0; v.target = null; } return; }
    v.queueT = 0;
    if (o.price > v.money) { think(v, 'broke', 'money'); return leave(v); }
    v.money -= o.price; v.spent += o.price; o.income += o.price; o.served++; earn('sales', o.price);
    if (d.kind === 'food' || d.kind === 'drink' || d.kind === 'shop') S.shopSales = (S.shopSales || 0) + o.price;
    o.inside.push(v.id); v.state = 'inside'; v.timer = d.dur; v.last = o.id;
  }
  function exitBuilding(v) {
    var o = objById[v.target]; v.state = 'walk';
    if (o) {
      var d = DEF[o.type], n = v.needs, boost = featured[o.type] ? 1.3 : 1;
      var at = o.inside.indexOf(v.id); if (at >= 0) o.inside.splice(at, 1);
      ['hunger', 'thirst', 'toilet'].forEach(function (k) { if (d[k]) n[k] = Math.max(0, n[k] + d[k]); });
      if (d.energy) n.energy = Math.min(100, n.energy + d.energy);
      if (d.fun) n.fun = Math.min(100, n.fun + d.fun * boost);
      v.happy = Math.min(100, v.happy + (4 + (d.appeal || 0) + (d.fun || 0) / 10) * boost + (o.water ? 2 : 0));
      if ((d.kind === 'food' || d.kind === 'drink' || d.kind === 'shop') && o.type !== 'fountain' && Math.random() < 0.45) v.litter = 3 + Math.random() * 8;
      if (Math.random() < 0.75) think(v, o.type, 'happy', o.type);
    }
    v.target = null;
  }

  // ---------- staff ----------
  function hire(type) {
    var d = STAFF[type];
    if (S.coins < d.hire) return toast(L(V.noMoney));
    spend('build', d.hire);
    staff.push(newStaff(type, GI)); toast(L(B[type]) + ' +1');
    undoPush({ t: 'hire', s: staff[staff.length - 1], cost: d.hire });
  }
  function newStaff(type, tile) { return { type: type, tile: tile, x: tile % N, y: (tile / N) | 0, path: [], timer: 0, id: vid++ }; }
  function fire(i) { staff.splice(i, 1); }
  function updateStaff(s, dt) {
    if (s.timer > 0) { s.timer -= dt; if (s.timer <= 0 && s.sweeping) { s.sweeping = false; if (litter[s.tile]) { litter[s.tile]--; } } return; }
    if (!s.path.length) {
      if (!pathG[s.tile]) { s.tile = GI; s.x = GATE.x; s.y = GATE.y; }
      if (s.type === 'worker') {
        if (litter[s.tile]) { s.sweeping = true; s.timer = 1.2; return; }
        var b = bfs(s.tile), best = -1, bd = 26;
        for (var i = 0; i < N * N; i++) if (litter[i] && b.dist[i] >= 0 && b.dist[i] < bd) { bd = b.dist[i]; best = i; }
        if (best >= 0) { s.path = route(b, best); return; }
      }
      wander(s); if (!s.path.length) s.timer = 1; return;
    }
    var nx = s.path[0] % N, ny = (s.path[0] / N) | 0;
    if (!pathG[s.path[0]]) { s.path = []; return; }
    var dx = nx - s.x, dy = ny - s.y, dist = Math.hypot(dx, dy), sp = 1.5 * dt;
    if (dist <= sp) { s.x = nx; s.y = ny; s.prevTile = s.tile; s.tile = s.path.shift(); }
    else { s.x += dx / dist * sp; s.y += dy / dist * sp; }
  }

  // ---------- simulation ----------
  var simClock = 0, spawnAcc = 0, speed = 1, feedDirty = true, lastSave = 0;
  function darkness(f) { // 0 = full day, 1 = deep night
    if (f < 0.7) return 0;
    if (f < 0.8) return (f - 0.7) / 0.1;
    if (f < 0.93) return 1;
    return (1 - f) / 0.07;
  }
  function decorAt(x, y) {
    var s = 0;
    for (var yy = y - 2; yy <= y + 2; yy++) for (var xx = x - 2; xx <= x + 2; xx++) {
      if (!inb(xx, yy)) continue; var o = objById[occ[idx(xx, yy)]];
      if (o && DEF[o.type].decor) s += DEF[o.type].decor / (1 + Math.abs(xx - x) + Math.abs(yy - y));
    }
    return s;
  }
  function step(dt) {
    simClock += dt; S.time += dt;
    if (S.time >= DAY) endDay();
    var shows = S.objects.filter(function (o) { return DEF[o.type].kind === 'show' && working(o); }).length, dk = darkness(S.time / DAY);
    var rate = 0.14 * (0.35 + S.fame / 100) * Math.min(1.4, 0.35 + shows * 0.3) * Math.max(0.15, 1.35 - S.entryFee / 35) * (S.event === 'rain' ? 0.55 : S.event === 'feast' ? 1.6 : 1) * crowd * (1 - dk * 0.65);
    if (S.campaign) { S.campaign -= dt; if (S.campaign <= 0) { S.campaign = 0; S.land = Math.min(3, (S.land || 0) + 1); S.fame = Math.min(100, S.fame + 3); rebuild(); toast('🏆 ' + L(V.won)); buildTools(); } }
    spawnAcc += rate * dt;
    while (spawnAcc > 1) { spawnAcc -= 1; if (visitors.length < 140 + (S.land || 0) * 40) spawn(); }
    var mus = staff.filter(function (s) { return s.type === 'musician'; });
    for (var i = visitors.length - 1; i >= 0; i--) updateVisitor(visitors[i], dt, dk, mus);
    for (i = 0; i < staff.length; i++) updateStaff(staff[i], dt);
  }
  function updateVisitor(v, dt, dk, mus) {
    var n = v.needs; v.age += dt;
    n.hunger = Math.min(100, n.hunger + 0.55 * dt); n.thirst = Math.min(100, n.thirst + 0.7 * dt);
    n.toilet = Math.min(100, n.toilet + 0.38 * dt); n.energy = Math.max(0, n.energy - (v.state === 'inside' ? 0.05 : 0.28) * dt);
    n.fun = Math.max(0, n.fun - (v.state === 'inside' ? 0 : 0.45) * dt);
    var pen = (n.hunger > 80 ? 0.2 : 0) + (n.thirst > 80 ? 0.2 : 0) + (n.toilet > 90 ? 0.45 : 0) + (n.energy < 20 ? 0.12 : 0) + (n.fun < 15 ? 0.1 : 0);
    if (v.state !== 'inside' && dk > 0.4 && !lightG[v.tile]) { pen += 0.25; if (Math.random() < dt * 0.05) think(v, 'dark', 'dark'); }
    v.happy = Math.max(0, Math.min(100, v.happy - pen * dt));
    if (v.state !== 'inside') for (var m = 0; m < mus.length; m++) if (Math.abs(mus[m].x - v.x) + Math.abs(mus[m].y - v.y) < 3) { n.fun = Math.min(100, n.fun + 3 * dt); v.happy = Math.min(100, v.happy + 0.35 * dt); if (Math.random() < dt * 0.04) think(v, 'music', 'music'); break; }
    if (v.bubble) { v.bubble.t -= dt; if (v.bubble.t <= 0) v.bubble = null; }
    if (v.litter > 0 && v.state !== 'inside') { v.litter -= dt; if (v.litter <= 0 && pathG[v.tile] === 1 && litter[v.tile] < 3) { litter[v.tile]++; } }
    if (Math.random() < dt * 0.08) {
      if (n.hunger > 60) think(v, 'hungry', 'hunger'); else if (n.thirst > 55) think(v, 'thirsty', 'thirst');
      else if (n.toilet > 75) think(v, 'toilet', 'toilet'); else if (n.energy < 30) think(v, 'tired', 'energy');
    }
    if (v.state === 'inside') { v.timer -= dt; if (v.timer <= 0) { exitBuilding(v); decide(v); } return; }
    if (v.state === 'queue') { v.timer -= dt; if (v.timer <= 0) { v.state = 'walk'; arrive(v); } return; }
    if (v.timer > 0) { v.timer -= dt; return; }
    if (!v.path.length) {
      if (v.state === 'leaving') { if (v.tile === GI) return depart(v); return leave(v); }
      if (v.target) return arrive(v);
      var dec = decorAt(v.tile % N, (v.tile / N) | 0);
      if (dec > 2) { v.happy = Math.min(100, v.happy + dec * 0.3); if (Math.random() < 0.15) think(v, 'pretty', 'pretty'); }
      return decide(v);
    }
    var nx = v.path[0] % N, ny = (v.path[0] / N) | 0;
    if (!pathG[v.path[0]]) { v.path = []; v.target = null; think(v, 'lost', 'lost'); return; }
    var dx = nx - v.x, dy = ny - v.y, dist = Math.hypot(dx, dy), sp = 1.7 * dt;
    if (dist <= sp) {
      v.x = nx; v.y = ny; v.prevTile = v.tile; v.tile = v.path.shift();
      if (litter[v.tile]) { v.happy = Math.max(0, v.happy - 0.6 * litter[v.tile]); if (Math.random() < 0.2) think(v, 'dirty', 'dirty'); }
    } else { v.x += dx / dist * sp; v.y += dy / dist * sp; }
  }
  function avgHappy() { return visitors.length ? visitors.reduce(function (a, v) { return a + v.happy; }, 0) / visitors.length : 0; }
  function endDay() {
    S.time -= DAY;
    var up = 0, wages = 0; S.objects.forEach(function (o) { up += DEF[o.type].upkeep || 0; });
    staff.forEach(function (s) { wages += STAFF[s.type].wage; });
    spend('upkeep', up); spend('wages', wages);
    if (has('curia')) S.fame = Math.min(100, S.fame + 2);
    var msg = L(V.day) + ' ' + S.day + ' · ' + L(V.income) + ' +' + fmt(C.totals(S.ledger.today).inc) + ' · ' + L(V.upkeep) + ' −' + fmt(up + wages);
    if (fests.length) { // festival goal
      var tg = festTarget();
      if ((S.festDayVis || 0) >= tg) { var rw = 200 + 100 * (S.rank || 1); earn('reward', rw); S.fame = Math.min(100, S.fame + 3); msg += '<br>🎉 Festival goal met: +' + fmt(rw) + ' coins, +3 fame'; }
    }
    C.closeDay(S.ledger, { day: S.day, vis: S.dayVisitors || 0, happy: Math.round(avgHappy()), cmp: S.cmp });
    S.day++; S.dayVisitors = 0; S.festDayVis = 0; S.cmp = {};
    setFests();
    var r = Math.random(); S.event = S.day < 3 ? null : r < 0.14 ? 'rain' : r < 0.3 ? 'feast' : r < 0.38 ? 'athlete' : r < 0.45 ? 'tax' : null;
    if (fests.length && S.event === 'feast') S.event = null;
    if (S.event === 'athlete') S.fame = Math.min(100, S.fame + 4);
    if (S.event === 'tax') { var tax = Math.min(400, Math.max(0, Math.floor(S.coins * 0.04))); spend('tax', tax); msg += '<br>📜 ' + L(V.evTax) + ' −' + fmt(tax); }
    else if (S.event) msg += '<br>' + EVI[S.event] + ' ' + L(V[{ rain: 'evRain', feast: 'evFeast', athlete: 'evAthlete' }[S.event]]);
    if (fests.length) msg += '<br>' + fests.map(function (f) { return f.icon + ' ' + festName(f) + (isGreat(f) ? ' <span class="le">(Great)</span>' : ''); }).join(' · ') + ' <button type="button" class="f-btn sm" data-learn="' + fests[0].id + '">Learn more</button>';
    toast(msg, fests.length || S.event ? 7 : 3.2);
    var sc = scen(); if (sc && S.day > sc.days && !S.scenDone) finishScen();
    labels();
  }
  var EVI = { rain: '🌧️', feast: '🎉', athlete: '🏅', tax: '📜' };
  function snapshot() {
    var count = {}; S.objects.forEach(function (o) { if (!hasEntry(o.type) || o.ok) count[o.type] = (count[o.type] || 0) + 1; });
    Object.keys(DEF).forEach(function (k) { count[k] = count[k] || 0; });
    return { land: S.land || 0, totalVisitors: S.totalVisitors, coins: S.coins, fame: S.fame, day: S.day, count: count, visitors: visitors.length, avgHappy: avgHappy(),
      festVisitors: S.festVisitors || 0, shopSales: S.shopSales || 0,
      shows: S.objects.filter(function (o) { return DEF[o.type].kind === 'show' && o.ok; }).length,
      showCount: S.objects.filter(function (o) { return DEF[o.type].kind === 'show'; }).length };
  }
  function checkGoals() {
    var rk = rankOf(S); if (rk > (S.rank || 1)) { S.rank = rk; toast('🏅 ' + L(V.newRank) + ': ' + L(FV.RANKS[rk - 1]), 6); buildTools(); renderGoals(); }
    var st = snapshot(), sc = scen();
    if (sc && !S.scenDone) {
      sc.goals.forEach(function (g, i) { if (!S.sgoals[i] && g.test(st)) { S.sgoals[i] = 1; toast('⭐ ' + esc(g.e)); renderGoals(); } });
      if (sc.goals.every(function (g, i) { return S.sgoals[i]; })) finishScen();
    } else FV.GOALS.forEach(function (g) { if (!S.goals[g.id] && g.test(st)) { S.goals[g.id] = 1; toast('🌿 ' + L(g)); renderGoals(); } });
  }
  function finishScen() {
    var sc = scen(); if (!sc) return;
    S.scenDone = 1;
    var n = sc.goals.filter(function (g, i) { return S.sgoals[i]; }).length, st = stars();
    if ((st[sc.id] || 0) < n) { st[sc.id] = n; lsSet(KEY.stars, JSON.stringify(st)); }
    speed = 0; labels(); saveGame();
    openPanel('<h2>' + sc.icon + ' ' + esc(sc.e) + '</h2><p class="stars big">' + starStr(n) + '</p>' +
      '<ul class="f-goals">' + sc.goals.map(function (g, i) { return '<li class="' + (S.sgoals[i] ? 'won' : '') + '">' + (S.sgoals[i] ? '⭐' : '○') + ' ' + esc(g.e) + '</li>'; }).join('') + '</ul>' +
      '<p>' + (n === 3 ? 'All three stars. A festival to remember!' : n ? 'Well done. Try again for more stars.' : 'No stars this time. Try a different plan.') + '</p>' +
      '<p class="row"><button type="button" class="f-btn prim" id="sc-menu">Back to the menu</button> <button type="button" class="f-btn" id="sc-keep">Keep playing</button></p>', 'scen');
    $('#sc-menu').onclick = function () { closePanel(); startScreen(); };
    $('#sc-keep').onclick = function () { closePanel(); setSpeed(1); };
  }
  function starStr(n) { return '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n); }

  // ---------- rendering ----------
  var cv, ctx, dpr = 1, cam = { x: 0, y: N * TH / 2, z: 1 }, ground = null, groundDirty = true, hover = null;
  var GPAD = 60, GOX = N * TW / 2 + GPAD, GOY = GPAD;
  function buildGround() {
    var p = A.PAL[S.setting], w = N * TW + GPAD * 2, h = N * TH + GPAD * 2 + 30, seed = S.seed | 0;
    ground = ground || D.createElement('canvas'); ground.width = w; ground.height = h;
    var c = ground.getContext('2d'); c.clearRect(0, 0, w, h); c.save(); c.translate(GOX, GOY);
    var L0 = A.P(0, N, 0), B0 = A.P(N, N, 0), R0 = A.P(N, 0, 0);
    A.poly(c, [L0, B0, [B0[0], B0[1] + 22], [L0[0], L0[1] + 22]], '#9c7b52'); A.poly(c, [B0, R0, [R0[0], R0[1] + 22], [B0[0], B0[1] + 22]], '#7e623f');
    c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(L0[0], L0[1] + 10, B0[0] - L0[0], 2);
    // Every tile's look comes from its own coordinates and the save's seed, so laying a path never changes another tile.
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var i = idx(x, y), pts = [A.P(x, y), A.P(x + 1, y), A.P(x + 1, y + 1), A.P(x, y + 1)], g = C.groundTile(x, y, seed, p.grass.length);
      if (pathG[i]) {
        A.poly(c, pts, A.shade(p.path, g.shade));
        for (var k = 0; k < 4; k++) { var sp = g.specks[k], q = A.P(x + 0.15 + sp[0] * 0.7, y + 0.15 + sp[1] * 0.7); c.fillStyle = A.shade(p.path, (sp[2] - 0.5) * 0.3); c.fillRect(q[0] - 2, q[1] - 1, 4 + sp[3] * 3, 2); }
        c.strokeStyle = p.pathD; c.lineWidth = 1.2;
        [[0, -1, 0, 1], [1, 0, 1, 2], [0, 1, 2, 3], [-1, 0, 3, 0]].forEach(function (e) {
          var nx = x + e[0], ny = y + e[1];
          if (!inb(nx, ny) || !pathG[idx(nx, ny)]) { c.beginPath(); c.moveTo(pts[e[2]][0], pts[e[2]][1]); c.lineTo(pts[e[3]][0], pts[e[3]][1]); c.stroke(); }
        });
      } else {
        var gcol = p.grass[g.grass];
        if (!inb(x, y)) gcol = A.shade(gcol, -0.3 - ((x * 5 + y * 3) % 3) * 0.04);
        A.poly(c, pts, gcol);
        if (g.tuft) { var t = A.P(x + g.tx, y + g.ty); c.fillStyle = A.shade(gcol, -0.15); c.fillRect(t[0], t[1] - 3, 1, 3); c.fillRect(t[0] + 2, t[1] - 4, 1, 4); }
      }
    }
    var bd = LAND[S.land || 0], cs = [A.P(bd[0], bd[1]), A.P(bd[2] + 1, bd[1]), A.P(bd[2] + 1, bd[3] + 1), A.P(bd[0], bd[3] + 1)];
    if ((S.land || 0) < 3) { c.setLineDash([10, 6]); A.poly(c, cs, null, 'rgba(255,248,220,.85)', 2.5); c.setLineDash([]); }
    c.restore(); groundDirty = false;
  }
  function screenToTile(sx, sy) {
    var wx = (sx - cv.clientWidth / 2) / cam.z + cam.x, wy = (sy - cv.clientHeight / 2) / cam.z + cam.y;
    var tx = (wx / (TW / 2) + wy / (TH / 2)) / 2, ty = (wy / (TH / 2) - wx / (TW / 2)) / 2;
    return { x: Math.floor(tx), y: Math.floor(ty), fx: tx, fy: ty };
  }
  function resize() {
    dpr = Math.min(2, W.devicePixelRatio || 1);
    cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(cv.clientHeight * dpr);
  }
  function drawSprite(o) {
    var d = DEF[o.type], s = A.sprite(o.type, d.size[0], d.size[1], S.setting, o.seed, o.rot || 0), p = A.P(o.x, o.y, 0);
    ctx.drawImage(s.cv, p[0] - s.ox, p[1] - s.oy, s.w, s.h);
  }
  function drawPerson(x, y, tunic, hair, bob, extra) {
    var p0 = A.P(x + 0.5, y + 0.5, 0);
    ctx.save(); ctx.translate(p0[0], p0[1]); ctx.scale(1.3, 1.3);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    A.person(ctx, 0, -bob, tunic, hair);
    if (extra) extra(bob);
    ctx.restore();
  }
  function drawVisitor(v, t) {
    var bob = v.path.length ? Math.abs(Math.sin(t * 9 + v.id)) * 1.6 : 0;
    drawPerson(v.x, v.y, v.tunic, v.hair, bob, function () {
      if (sel && sel.v === v) { ctx.strokeStyle = '#f3dfa3'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 8, 3.5, 0, 0, Math.PI * 2); ctx.stroke(); }
      if (v.bubble) bubble(v.bubble.icon);
    });
  }
  function bubble(icon) {
    var bx = 6, by = -34;
    ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx - 9, by - 9, 18, 16, 6); else ctx.rect(bx - 9, by - 9, 18, 16); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 4, by + 7); ctx.lineTo(bx - 7, by + 11); ctx.lineTo(bx, by + 7); ctx.fill();
    ctx.font = '11px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText(icon, bx, by - 1);
  }
  function drawStaff(s, t) {
    var d = STAFF[s.type], bob = s.path.length ? Math.abs(Math.sin(t * 8 + s.id)) * 1.4 : 0;
    drawPerson(s.x, s.y, d.tunic, d.hair, bob, function (b) {
      if (s.type === 'worker') { ctx.strokeStyle = '#6b4a2c'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(4, -12 - b); ctx.lineTo(7, 0); ctx.stroke(); ctx.fillStyle = '#c9a24a'; ctx.fillRect(5, -2, 5, 2.5); }
      else { ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(1, -15 - b); ctx.lineTo(7, -8 - b); ctx.moveTo(0, -15 - b); ctx.lineTo(-5, -8 - b); ctx.stroke(); if (Math.sin(t * 3 + s.id) > 0.3) { ctx.font = '9px system-ui'; ctx.fillStyle = '#5b4a7a'; ctx.fillText('♪', 9, -24 - b); } }
      ctx.fillStyle = 'rgba(184,150,62,.9)'; ctx.fillRect(-3, -9 - b, 6, 1.4); // staff sash
    });
  }
  function drawLive(o, t) {
    var p;
    if (o.type === 'hippodrome' && o.inside.length) {
      for (var k = 0; k < 3; k++) {
        var a = t * 0.9 + k * 2.1, rx = o.w / 2 - 0.8, ry = o.h / 2 - 0.62;
        if (o.w < o.h) { rx = o.w / 2 - 0.62; ry = o.h / 2 - 0.8; }
        p = A.P(o.x + o.w / 2 + Math.cos(a) * rx, o.y + o.h / 2 + Math.sin(a) * ry, 3);
        ctx.fillStyle = ['#b44b3a', '#2f5f93', '#6f8a47'][k]; ctx.beginPath(); ctx.ellipse(p[0], p[1], 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6b4a2c'; ctx.fillRect(p[0] - 3, p[1] - 5, 2, 3); ctx.fillRect(p[0] + 1, p[1] - 5, 2, 3);
      }
    }
    if (o.type === 'fountain' && o.ok) {
      p = A.P(o.x + 0.5, o.y + 0.5, 30); ctx.strokeStyle = 'rgba(210,235,255,.85)'; ctx.lineWidth = 1.2;
      for (var j = 0; j < 4; j++) { var ph = (t * 1.5 + j / 4) % 1; ctx.beginPath(); ctx.arc(p[0] + (j - 1.5) * 3, p[1] + ph * 18, 1 + ph * 1.5, 0, Math.PI * 2); ctx.stroke(); }
    }
    if (o.type === 'baths' && o.inside.length) {
      p = A.P(o.x + o.w / 2, o.y + o.h / 2, 60); ctx.fillStyle = 'rgba(255,255,255,.35)';
      for (var s2 = 0; s2 < 3; s2++) { var ph2 = (t * 0.4 + s2 / 3) % 1; ctx.beginPath(); ctx.arc(p[0] + Math.sin(ph2 * 6 + s2) * 5, p[1] - ph2 * 22, 3 + ph2 * 4, 0, Math.PI * 2); ctx.fill(); }
    }
    if ((o.type === 'theater' || o.type === 'odeum' || o.type === 'temple' || o.type === 'palaestra') && o.inside.length) {
      var n = Math.min(10, o.inside.length);
      for (var q = 0; q < n; q++) { var aa = Math.PI + (q + 0.5) / n * Math.PI, rr = Math.min(o.w, o.h) * 0.33; var pp = A.P(o.x + o.w / 2 + 0.25 + Math.cos(aa) * rr, o.y + o.h / 2 + 0.25 + Math.sin(aa) * rr, o.type === 'theater' ? 24 : 4); ctx.fillStyle = TUNICS[q % TUNICS.length]; ctx.fillRect(pp[0] - 1.5, pp[1] - 4, 3, 4); }
    }
    if (hasEntry(o.type) && (!o.ok || !o.linked)) return;
    if (!o.open) { p = A.P(o.x + o.w / 2, o.y + o.h / 2, 30); ctx.font = '16px system-ui'; ctx.textAlign = 'center'; ctx.fillText('⛔', p[0], p[1]); }
  }
  // An arrow on the tile in front of an entrance, pointing in. good: a path is there.
  function entArrow(ex, ey, side, good) {
    var dir = [[-1, 0], [0, -1], [1, 0], [0, 1]][side], cx = ex + 0.5, cy = ey + 0.5, px = -dir[1], py = dir[0];
    var tip = A.P(cx + dir[0] * 0.45, cy + dir[1] * 0.45), l = A.P(cx - dir[0] * 0.15 + px * 0.3, cy - dir[1] * 0.15 + py * 0.3), r = A.P(cx - dir[0] * 0.15 - px * 0.3, cy - dir[1] * 0.15 - py * 0.3);
    var b0 = A.P(cx - dir[0] * 0.15 + px * 0.12, cy - dir[1] * 0.15 + py * 0.12), b1 = A.P(cx - dir[0] * 0.15 - px * 0.12, cy - dir[1] * 0.15 - py * 0.12);
    var t0 = A.P(cx - dir[0] * 0.42 + px * 0.12, cy - dir[1] * 0.42 + py * 0.12), t1 = A.P(cx - dir[0] * 0.42 - px * 0.12, cy - dir[1] * 0.42 - py * 0.12);
    var fill = good ? 'rgba(46,160,90,.92)' : 'rgba(214,120,30,.95)';
    A.poly(ctx, [A.P(ex, ey), A.P(ex + 1, ey), A.P(ex + 1, ey + 1), A.P(ex, ey + 1)], good ? 'rgba(108,199,154,.28)' : 'rgba(240,160,60,.3)', fill, 1.5);
    A.poly(ctx, [tip, l, b0, t0, t1, b1, r], fill, 'rgba(255,255,255,.9)', 1.2);
  }
  function placing() { return moving ? moving.o.type : (DEF[tool] && tool !== 'path' ? tool : null); }
  function render(t) {
    if (groundDirty) buildGround();
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) resize();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var sky = ctx.createLinearGradient(0, 0, 0, h), dk = darkness(S.time / DAY);
    sky.addColorStop(0, S.setting === 'rome' ? '#e9dcc0' : '#dfe9ef'); sky.addColorStop(1, S.setting === 'rome' ? '#f6ecd8' : '#f3f1e8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    ctx.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, dpr * (w / 2 - cam.x * cam.z), dpr * (h / 2 - cam.y * cam.z));
    ctx.drawImage(ground, -GOX, -GOY);
    // litter
    for (var i = 0; i < N * N; i++) if (litter[i]) { var lx = i % N, ly = (i / N) | 0; for (var k = 0; k < litter[i]; k++) { var q = A.P(lx + 0.2 + C.hash(lx, ly, 50 + k, 7) * 0.6, ly + 0.2 + C.hash(lx, ly, 60 + k, 7) * 0.6); ctx.fillStyle = k % 2 ? '#e8e0c8' : '#a8763e'; ctx.fillRect(q[0] - 2, q[1] - 1, 4, 2.5); } }
    var pt = placing(), rot = moving ? moving.o.rot : buildRot;
    if (hover && tool) {
      var dm = pt ? dimsOf(pt, rot) : [1, 1], hw = dm[0], hh = dm[1], ok = tool === 'demolish' || tool === 'look' || (tool === 'move' && !moving) || (tool === 'path' ? canPath(hover.x, hover.y) : fits(hover.x, hover.y, hw, hh));
      A.poly(ctx, [A.P(hover.x, hover.y), A.P(hover.x + hw, hover.y), A.P(hover.x + hw, hover.y + hh), A.P(hover.x, hover.y + hh)], ok ? 'rgba(255,255,255,.28)' : 'rgba(200,40,40,.3)', ok ? 'rgba(255,255,255,.8)' : 'rgba(200,40,40,.8)', 1.5);
    }
    var items = [];
    S.objects.forEach(function (o) { items.push({ d: o.x + o.w - 1 + o.y + o.h - 1 + 0.5, o: o }); });
    visitors.forEach(function (v) { if (v.state !== 'inside') items.push({ d: v.x + v.y + 0.6, v: v }); });
    staff.forEach(function (s) { items.push({ d: s.x + s.y + 0.6, s: s }); });
    items.push({ d: GATE.x + GATE.y + 0.5, g: 1 });
    var ghostOK = hover && pt && fits(hover.x, hover.y, dimsOf(pt, rot)[0], dimsOf(pt, rot)[1]);
    if (ghostOK) items.push({ d: hover.x + hover.y + dimsOf(pt, rot)[0] + dimsOf(pt, rot)[1], ghost: 1 });
    items.sort(function (a, b) { return a.d - b.d; });
    items.forEach(function (it) {
      if (it.o) { drawSprite(it.o); drawLive(it.o, t); if (sel && sel.o === it.o) A.poly(ctx, [A.P(it.o.x, it.o.y), A.P(it.o.x + it.o.w, it.o.y), A.P(it.o.x + it.o.w, it.o.y + it.o.h), A.P(it.o.x, it.o.y + it.o.h)], null, '#f3dfa3', 2); }
      else if (it.v) drawVisitor(it.v, t);
      else if (it.s) drawStaff(it.s, t);
      else if (it.g) drawSprite({ type: 'gate', x: GATE.x, y: GATE.y, w: 1, h: 1, rot: 0 });
      else if (it.ghost) { ctx.globalAlpha = 0.6; drawSprite({ type: pt, x: hover.x, y: hover.y, seed: moving ? moving.o.seed : 5, rot: rot }); ctx.globalAlpha = 1; }
    });
    // night
    if (dk > 0) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = 'rgba(14,22,52,' + (dk * 0.5).toFixed(3) + ')'; ctx.fillRect(0, 0, w, h);
      ctx.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, dpr * (w / 2 - cam.x * cam.z), dpr * (h / 2 - cam.y * cam.z));
      ctx.globalCompositeOperation = 'lighter';
      S.objects.forEach(function (o) {
        var c = null, r = 40;
        if (o.type === 'torch') { c = A.P(o.x + 0.5, o.y + 0.5, 40); r = 70; }
        else if (hasEntry(o.type) && o.ok && o.open) c = A.P(o.ex + 0.5, o.ey + 0.5, 6);
        if (!c) return;
        var g = ctx.createRadialGradient(c[0], c[1], 2, c[0], c[1], r); g.addColorStop(0, 'rgba(255,170,80,' + (0.45 * dk).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,170,80,0)');
        ctx.fillStyle = g; ctx.fillRect(c[0] - r, c[1] - r, r * 2, r * 2);
      });
      ctx.globalCompositeOperation = 'source-over';
    } else if (S.time / DAY > 0.6) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = 'rgba(255,140,60,' + ((S.time / DAY - 0.6) * 0.6).toFixed(3) + ')'; ctx.fillRect(0, 0, w, h); }
    // entrance arrows on top: while placing, with the 🚪 overlay, and for the selected building
    ctx.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, dpr * (w / 2 - cam.x * cam.z), dpr * (h / 2 - cam.y * cam.z));
    if (prefs.ent || pt || tool === 'move') S.objects.forEach(function (o) { if (hasEntry(o.type) && inMap(o.ex, o.ey)) entArrow(o.ex, o.ey, o.side, o.ok); });
    else if (sel && sel.o && hasEntry(sel.o.type) && inMap(sel.o.ex, sel.o.ey)) entArrow(sel.o.ex, sel.o.ey, sel.o.side, sel.o.ok);
    ctx.font = '18px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    S.objects.forEach(function (o) { if (hasEntry(o.type) && (!o.ok || !o.linked)) { var wp = A.P(o.x + o.w / 2, o.y + o.h / 2, 50 + Math.sin(t * 4) * 3); ctx.fillText('⚠️', wp[0], wp[1]); } });
    if (ghostOK && hasEntry(pt)) { var dmg = dimsOf(pt, rot), e = C.entrance(hover.x, hover.y, dmg[0], dmg[1], rot); if (inMap(e.x, e.y)) entArrow(e.x, e.y, e.side, inb(e.x, e.y) && pathG[idx(e.x, e.y)] === 1); }
  }

  // ---------- tools & input ----------
  var tool = 'look', sel = null, buildRot = 0, moving = null, undoStack = [], stroke = null;
  function undoPush(a) { undoStack.push(a); if (undoStack.length > 40) undoStack.shift(); labelsUndo(); }
  function canPath(x, y) { return inb(x, y) && !pathG[idx(x, y)] && (!occ[idx(x, y)] || (objById[occ[idx(x, y)]] && objById[occ[idx(x, y)]].wild)); }
  function placePath(x, y) {
    if (inb(x, y) && objById[occ[idx(x, y)]] && objById[occ[idx(x, y)]].wild) clearWild(x, y, 1, 1);
    if (!canPath(x, y)) return false;
    if (S.coins < DEF.path.cost) { toast(L(V.noMoney)); return false; }
    spend('build', DEF.path.cost); S.paths.push(idx(x, y)); pathG[idx(x, y)] = 1; groundDirty = true; refreshLinks();
    if (stroke) { stroke.list.push(idx(x, y)); stroke.cost += DEF.path.cost; } else undoPush({ t: 'paths', list: [idx(x, y)], cost: DEF.path.cost });
    return true;
  }
  function clearWild(x, y, w, h) {
    var hit = false;
    for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) {
      if (!inb(xx, yy)) continue; var o = objById[occ[idx(xx, yy)]];
      if (o && o.wild) { S.objects.splice(S.objects.indexOf(o), 1); hit = true; }
    }
    if (hit) rebuild();
  }
  function expand() {
    var lv = S.land || 0;
    if (lv >= 3 || (S.rank || 1) < 3) return toast(L(V.locked));
    if (S.campaign) return toast('⚔️ ' + L(V.marched));
    if (!has('barracks') || (lv >= 1 && !has('curia'))) return toast(L(V.needArmy));
    if (S.coins < LANDCOST[lv]) return toast(L(V.noMoney));
    spend('land', LANDCOST[lv]); S.campaign = DAY * 0.5; toast('⚔️ ' + L(V.marched), 5);
  }
  function place(type, x, y, rot) {
    var d = DEF[type]; rot = rot == null ? buildRot : rot;
    if (!unlocked(type)) { toast('🔒 ' + L(V.locked)); return; }
    var dm = dimsOf(type, rot);
    if (inb(x, y) && inb(x + dm[0] - 1, y + dm[1] - 1)) clearWild(x, y, dm[0], dm[1]);
    if (!fits(x, y, dm[0], dm[1])) { toast(L(V.blocked)); return; }
    if (S.coins < d.cost) { toast(L(V.noMoney)); return; }
    var o = { type: type, x: x, y: y, rot: rot, seed: Math.floor(Math.random() * 999) };
    spend('build', d.cost); S.objects.push(o); rebuild();
    undoPush({ t: 'place', id: o.id, cost: d.cost });
    if (hasEntry(type) && !o.ok) toast('⚠️ ' + L(V.noEntrance), 4);
    else if (hasEntry(type) && !o.linked) toast('⚠️ ' + L(V.noLink), 4);
    if (hasEntry(type)) select({ o: o });
    puff(x + dm[0] / 2, y + dm[1] / 2);
  }
  function kickOut(o) { (o.inside || []).slice().forEach(function (id) { var v = visitors.find(function (q) { return q.id === id; }); if (v) { v.state = 'walk'; v.target = null; } }); o.inside = []; }
  function removeObj(o) { kickOut(o); S.objects.splice(S.objects.indexOf(o), 1); rebuild(); if (sel && sel.o === o) select(null); }
  function demolish(x, y) {
    if (!inb(x, y)) return;
    var i = idx(x, y), o = objById[occ[i]];
    if (o) {
      var refund = Math.floor((DEF[o.type].cost || 0) * 0.5);
      removeObj(o); earn('refund', refund);
      undoPush({ t: 'demolish', o: { type: o.type, x: o.x, y: o.y, rot: o.rot, seed: o.seed, price: o.price, wild: o.wild }, refund: refund });
      if (refund) toast('⛏️ +' + fmt(refund) + ' (half the cost back)');
      return;
    }
    if (pathG[i] === 1) { S.paths.splice(S.paths.indexOf(i), 1); pathG[i] = 0; litter[i] = 0; earn('refund', 5); groundDirty = true; refreshLinks(); undoPush({ t: 'dpath', i: i, refund: 5 }); }
  }
  function undo() {
    var a = undoStack.pop(); labelsUndo();
    if (!a) return toast('Nothing to undo.');
    if (a.t === 'place') { var o = objById[a.id]; if (o) { removeObj(o); spend('build', -a.cost); } }
    else if (a.t === 'paths') { a.list.forEach(function (i) { var at = S.paths.indexOf(i); if (at >= 0) { S.paths.splice(at, 1); litter[i] = 0; spend('build', -DEF.path.cost); } }); rebuild(); }
    else if (a.t === 'demolish') { var q = a.o, dm = dimsOf(q.type, q.rot); if (fits(q.x, q.y, dm[0], dm[1], true, q.wild)) { S.objects.push(q); earn('refund', -a.refund); rebuild(); } else return toast(L(V.blocked)); }
    else if (a.t === 'dpath') { if (!pathG[a.i] && !occ[a.i]) { S.paths.push(a.i); earn('refund', -a.refund); rebuild(); } }
    else if (a.t === 'move') { var m = objById[a.id]; if (m) { var ox = m.x, oy = m.y, orr = m.rot; kickOut(m); m.x = a.from.x; m.y = a.from.y; m.rot = a.from.rot; rebuild(); if (!objById[m.id]) { m.x = ox; m.y = oy; m.rot = orr; S.objects.push(m); rebuild(); toast(L(V.blocked)); } } }
    else if (a.t === 'hire') { var k = staff.indexOf(a.s); if (k >= 0) { staff.splice(k, 1); spend('build', -a.cost); } }
    toast('↶ ' + L(V.undo));
  }
  function rotate() {
    if (moving) { moving.o.rot = (moving.o.rot + 1) & 3; }
    else if (placing()) { buildRot = (buildRot + 1) & 3; }
    else if (sel && sel.o && hasEntry(sel.o.type)) return rotateExisting(sel.o);
    else return;
    toast('⟳ ' + L(V.entrance) + ': ' + SIDES[moving ? moving.o.rot : buildRot], 1.4);
  }
  function rotateExisting(o) {
    var from = { x: o.x, y: o.y, rot: o.rot }, d = DEF[o.type];
    S.objects.splice(S.objects.indexOf(o), 1); rebuild();
    for (var k = 1; k <= 4; k++) { var r = (from.rot + k) & 3, dm = C.dims(d.size, r); if (k === 4 || fits(o.x, o.y, dm[0], dm[1], true)) { o.rot = r; break; } }
    if (o.rot !== from.rot) kickOut(o);
    S.objects.push(o); rebuild(); if (!objById[o.id]) { o.rot = from.rot; S.objects.push(o); rebuild(); }
    if (o.rot !== from.rot) undoPush({ t: 'move', id: o.id, from: from });
    select({ o: o }); if (infoBox()) infoBox().dataset.sig = ''; updateInfo();
  }
  function startMove(o) {
    if (!o || o.wild) return;
    moving = { o: o, from: { x: o.x, y: o.y, rot: o.rot } };
    kickOut(o); S.objects.splice(S.objects.indexOf(o), 1); rebuild(); select(null);
    toast(L(V.move) + ': ' + L(B[o.type], 'inline'), 2);
  }
  function dropMove(x, y) {
    var o = moving.o, dm = dimsOf(o.type, o.rot);
    if (inb(x, y) && inb(x + dm[0] - 1, y + dm[1] - 1)) clearWild(x, y, dm[0], dm[1]);
    if (!fits(x, y, dm[0], dm[1])) return toast(L(V.blocked));
    o.x = x; o.y = y; S.objects.push(o); rebuild();
    undoPush({ t: 'move', id: o.id, from: moving.from }); moving = null;
    if (hasEntry(o.type) && !o.ok) toast('⚠️ ' + L(V.noEntrance), 4);
  }
  function cancelMove() { if (!moving) return; var o = moving.o; o.x = moving.from.x; o.y = moving.from.y; o.rot = moving.from.rot; S.objects.push(o); moving = null; rebuild(); }
  var puffs = [];
  function puff(x, y) { puffs.push({ x: x, y: y, t: 0 }); }

  var pointers = {}, drag = null, pinch = null, lpTimer = 0;
  function bindInput() {
    cv.addEventListener('pointerdown', function (e) {
      cv.setPointerCapture(e.pointerId); pointers[e.pointerId] = { x: e.offsetX, y: e.offsetY };
      var ids = Object.keys(pointers); clearTimeout(lpTimer);
      if (ids.length === 2) { var a = pointers[ids[0]], b = pointers[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: cam.z, t0: Date.now(), maxd: 0 }; if (drag && drag.painting) endStroke(); drag = null; return; }
      var tt = screenToTile(e.offsetX, e.offsetY); if (e.pointerType !== 'mouse') hover = inb(tt.x, tt.y) ? tt : null;
      drag = { x: e.offsetX, y: e.offsetY, cx: cam.x, cy: cam.y, moved: false, button: e.button, painting: tool === 'path' && e.button === 0 };
      if (drag.painting) { stroke = { t: 'paths', list: [], cost: 0 }; placePath(tt.x, tt.y); }
      else if (e.pointerType !== 'mouse' && (placing() || (tool === 'look' && sel && sel.o))) {
        var dd = drag; lpTimer = setTimeout(function () { if (drag === dd && !dd.moved) { dd.long = true; rotate(); if (navigator.vibrate) try { navigator.vibrate(15); } catch (er) { } } }, 480);
      }
    });
    cv.addEventListener('pointermove', function (e) {
      if (pointers[e.pointerId]) pointers[e.pointerId] = { x: e.offsetX, y: e.offsetY };
      var t = screenToTile(e.offsetX, e.offsetY), ids = Object.keys(pointers);
      if (e.pointerType === 'mouse' || ids.length === 1) hover = inb(t.x, t.y) ? t : hover && e.pointerType !== 'mouse' ? hover : null;
      if (pinch && ids.length === 2) { var a = pointers[ids[0]], b = pointers[ids[1]], dd = Math.hypot(a.x - b.x, a.y - b.y); pinch.maxd = Math.max(pinch.maxd, Math.abs(dd - pinch.d)); cam.z = clampZ(pinch.z * dd / pinch.d); return; }
      if (!drag) return;
      var dx = e.offsetX - drag.x, dy = e.offsetY - drag.y;
      if (Math.hypot(dx, dy) > 6) { drag.moved = true; clearTimeout(lpTimer); }
      if (drag.painting) { if (inb(t.x, t.y)) placePath(t.x, t.y); return; }
      if (drag.moved) { cam.x = drag.cx - dx / cam.z; cam.y = drag.cy - dy / cam.z; clampCam(); }
    });
    function up(e) {
      delete pointers[e.pointerId]; clearTimeout(lpTimer);
      if (pinch) {
        if (Object.keys(pointers).length < 2) { if (Date.now() - pinch.t0 < 320 && pinch.maxd < 14) { cam.z = pinch.z; rotate(); } pinch = null; }
        drag = null; return;
      }
      if (drag && drag.painting) endStroke();
      if (drag && !drag.moved && !drag.painting && !drag.long && drag.button === 0) click(e.offsetX, e.offsetY);
      drag = null;
    }
    function endStroke() { if (stroke && stroke.list.length) undoPush(stroke); stroke = null; }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hover = null; });
    cv.addEventListener('wheel', function (e) { e.preventDefault(); cam.z = clampZ(cam.z * (e.deltaY < 0 ? 1.12 : 0.89)); }, { passive: false });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    D.addEventListener('keydown', function (e) {
      if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || !S || !$('#f-start').hidden) return;
      if (e.key === 'Escape') { cancelMove(); setTool('look'); select(null); closePanel(); }
      else if (e.code === 'Space') { e.preventDefault(); setSpeed(speed ? 0 : 1); }
      else if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) rotate();
      else if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
    });
  }
  function clampZ(z) { return Math.max(0.28, Math.min(2.4, z)); }
  function clampCam() { var m = N * TW / 2; cam.x = Math.max(-m, Math.min(m, cam.x)); cam.y = Math.max(0, Math.min(N * TH, cam.y)); }
  function click(sx, sy) {
    var t = screenToTile(sx, sy);
    if (tool === 'look') {
      var best = null, bd = 0.8;
      visitors.forEach(function (v) { if (v.state === 'inside') return; var d = Math.hypot(v.x + 0.5 - t.fx, v.y + 0.5 - t.fy); if (d < bd) { bd = d; best = v; } });
      if (best) return select({ v: best });
      if (inb(t.x, t.y) && occ[idx(t.x, t.y)]) return select({ o: objById[occ[idx(t.x, t.y)]] });
      return select(null);
    }
    if (!inb(t.x, t.y)) return;
    if (tool === 'demolish') return demolish(t.x, t.y);
    if (tool === 'move') { if (moving) return dropMove(t.x, t.y); return startMove(objById[occ[idx(t.x, t.y)]]); }
    if (tool === 'path') return;
    place(tool, t.x, t.y);
  }

  // ---------- UI ----------
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  function infoBox() { return $('#f-info'); }
  function shell() {
    root.innerHTML =
      '<div class="f-top">' +
      '<div class="f-brand" id="f-brand"></div>' +
      '<div class="f-stats"><button type="button" class="st st-money" id="st-coins" aria-expanded="false" aria-controls="f-money"></button><span class="st" id="st-vis"></span><span class="st" id="st-fame"></span><span class="st" id="st-day"></span></div>' +
      '<div class="f-speed" id="f-speed"></div>' +
      '<div class="f-langs" id="f-langs"></div>' +
      '<button class="f-btn" id="f-statsb" type="button" aria-label="Stats" title="Stats and calendar">📊</button>' +
      '<button class="f-btn" id="f-saveb" type="button" aria-label="Save slots" title="Save, load, export, import">💾</button>' +
      '<button class="f-btn" id="f-helpb" type="button" aria-label="Help" title="How to play">?</button>' +
      '<button class="f-btn" id="f-menu" type="button" aria-label="Menu" title="Menu">☰</button>' +
      '</div>' +
      '<div class="f-main"><div class="f-tools" id="f-tools"></div>' +
      '<div class="f-stage"><canvas id="f-cv" aria-label="Festival grounds"></canvas><div class="f-toast" id="f-toast" aria-live="polite"></div><div class="f-info" id="f-info" hidden></div>' +
      '<div class="f-money" id="f-money" hidden></div>' +
      '<div class="f-bb"><button class="f-btn" id="b-rot" type="button" title="Rotate (R key; on touch: long-press or two-finger tap)">⟳ <span class="bbl">' + 'Rotate' + '</span></button><button class="f-btn" id="b-undo" type="button" title="Undo (Ctrl+Z)">↶ <span class="bbl">Undo</span></button><button class="f-btn" id="b-ent" type="button" aria-pressed="false" title="Show every entrance">🚪</button></div>' +
      '<div class="f-zoom"><button class="f-btn" id="z-in" type="button" aria-label="Zoom in">＋</button><button class="f-btn" id="z-out" type="button" aria-label="Zoom out">－</button></div></div>' +
      '<aside class="f-side" id="f-side"><div class="f-advice" id="f-advice"></div><h3 id="f-gh"></h3><ul class="f-goals" id="f-goals"></ul><h3 id="f-th"></h3><ol class="f-feed" id="f-feed"></ol><p class="f-note" id="f-note"></p></aside></div>' +
      '<div class="f-start" id="f-start"></div><div class="f-help" id="f-help" hidden></div><div class="f-panel" id="f-panel" hidden role="dialog" aria-modal="true"></div>';
    cv = $('#f-cv'); ctx = cv.getContext('2d');
    W.addEventListener('resize', resize); resize(); bindInput();
    $('#z-in').onclick = function () { cam.z = clampZ(cam.z * 1.2); };
    $('#z-out').onclick = function () { cam.z = clampZ(cam.z / 1.2); };
    $('#f-menu').onclick = function () { cancelMove(); saveGame(); startScreen(); };
    $('#f-helpb').onclick = openHelp;
    $('#f-statsb').onclick = function () { openStats(); };
    $('#f-saveb').onclick = openSaves;
    $('#b-rot').onclick = rotate; $('#b-undo').onclick = undo;
    $('#b-ent').onclick = function () { prefs.ent = !prefs.ent; savePrefs(); this.setAttribute('aria-pressed', prefs.ent); this.classList.toggle('on', prefs.ent); };
    $('#st-coins').onclick = function () { var m = $('#f-money'); m.hidden = !m.hidden; this.setAttribute('aria-expanded', !m.hidden); if (!m.hidden) renderMoney(); };
    root.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-learn]'); if (b) { openStats('cal', b.dataset.learn); } });
  }
  function labels() {
    $('#f-brand').innerHTML = (S.setting === 'rome' ? '🏛️ ' : '🏺 ') + '<span class="f-bt">Ancient Festival Tycoon</span>';
    $('#f-speed').innerHTML = [['0', '❚❚', 'Pause'], ['1', '▶', 'Normal speed'], ['2', '▶▶', 'Fast'], ['4', '▶▶▶', 'Fastest']].map(function (s) {
      return '<button type="button" class="f-btn sp' + (String(speed) === s[0] ? ' on' : '') + '" data-sp="' + s[0] + '" title="' + s[2] + '" aria-label="' + s[2] + '">' + s[1] + '</button>';
    }).join('');
    $$('[data-sp]').forEach(function (b) { b.onclick = function () { setSpeed(+b.dataset.sp); }; });
    $('#f-langs').innerHTML = [S.setting === 'rome' ? ['n', 'La', 'Latin'] : ['n', 'Ελ', 'Greek'], ['e', 'En', 'English']].map(function (k) {
      return '<label class="lt lt-' + k[0] + '" title="' + k[2] + '"><input type="checkbox" data-lang="' + k[0] + '"' + (show[k[0]] ? ' checked' : '') + '>' + k[1] + '</label>';
    }).join('');
    $$('[data-lang]').forEach(function (c) {
      c.onchange = function () {
        show[c.dataset.lang] = c.checked;
        if (!show.n && !show.e) { show[c.dataset.lang === 'n' ? 'e' : 'n'] = true; }
        savePrefs(); labels(); buildTools(); renderGoals(); feedDirty = true; if (sel) { infoBox().dataset.sig = ''; updateInfo(); }
      };
    });
    $('#f-th').innerHTML = L(V.thoughts); $('#f-gh').innerHTML = scen() ? '⭐ ' + esc(scen().e) : L(V.goals); $('#f-note').innerHTML = '💾 ' + L(V.saved);
    $('#b-ent').classList.toggle('on', prefs.ent); $('#b-ent').setAttribute('aria-pressed', prefs.ent);
    labelsUndo();
  }
  function labelsUndo() { var b = $('#b-undo'); if (b) b.disabled = !undoStack.length; var r = $('#b-rot'); if (r) r.disabled = !(placing() || (sel && sel.o && hasEntry(sel.o.type))); }
  function buildTools() {
    var h = '<div class="tg">' + [['look', '🔍', V.look], ['move', '✥', V.move], ['demolish', '⛏️', V.demolish]].map(function (q) {
      return '<button type="button" class="tool' + (tool === q[0] ? ' on' : '') + '" data-t="' + q[0] + '"><span class="ti">' + q[1] + '</span>' + L(q[2]) + '</button>';
    }).join('') + '</div>';
    GROUPS.forEach(function (g) {
      h += '<div class="tg"><h4>' + L(V[g]) + '</h4>';
      Object.keys(DEF).forEach(function (k) {
        var d = DEF[k]; if (d.group !== g || (d.only && d.only !== S.setting)) return;
        var lock = !unlocked(k);
        h += '<button type="button" class="tool' + (tool === k ? ' on' : '') + (lock ? ' lock' : '') + '" data-t="' + k + '"' + (lock ? ' title="Unlocks at rank ' + d.rank + ': ' + FV.RANKS[d.rank - 1].e + '"' : '') + '>' +
          (k === 'path' ? '<span class="ti">🟫</span>' : '<canvas width="56" height="44" data-icon="' + k + '"></canvas>') +
          '<span class="tn">' + L(B[k]) + '</span><span class="tc' + (lock ? ' lk' : '') + '">' + (lock ? '🔒 ' + d.rank : fmt(d.cost)) + '</span></button>';
      });
      if (g === 'gCity' && (S.land || 0) < 3) h += '<button type="button" class="tool act' + ((S.rank || 1) < 3 ? ' lock' : '') + '" id="f-expand"><span class="ti">⚔️</span><span class="tn">' + L(V.expand) + '</span><span class="tc' + ((S.rank || 1) < 3 ? ' lk' : '') + '">' + ((S.rank || 1) < 3 ? '🔒 3' : fmt(LANDCOST[S.land || 0])) + '</span></button>';
      h += '</div>';
    });
    h += '<div class="tg"><h4>' + L(V.gStaff) + '</h4>' + Object.keys(STAFF).map(function (k) {
      var n = staff.filter(function (s) { return s.type === k; }).length;
      return '<button type="button" class="tool hire" data-hire="' + k + '" title="Hire for ' + STAFF[k].hire + ' coins, then ' + STAFF[k].wage + ' coins a day"><span class="ti">' + (k === 'worker' ? '🧹' : '🎵') + '</span><span class="tn">' + L(B[k]) + (n ? ' <b>×' + n + '</b>' : '') + '</span><span class="tc">' + STAFF[k].hire + '</span></button>';
    }).join('') + '</div>';
    $('#f-tools').innerHTML = h;
    $$('[data-icon]').forEach(function (c) { var d = DEF[c.dataset.icon]; A.icon(c, c.dataset.icon, d.size[0], d.size[1], S.setting); });
    $$('.tool').forEach(function (b) {
      b.onclick = function () {
        if (b.id === 'f-expand') return expand();
        if (b.dataset.hire) { hire(b.dataset.hire); return buildTools(); }
        if (b.classList.contains('lock')) return toast('🔒 ' + L(V.locked) + ' <span class="le">' + esc(b.title) + '</span>');
        setTool(b.dataset.t);
      };
    });
  }
  function setTool(t) {
    if (t !== 'move') cancelMove();
    tool = t; $$('.tool').forEach(function (b) { b.classList.toggle('on', !!b.dataset.t && b.dataset.t === t); });
    if (t !== 'look') select(null);
    labelsUndo();
  }
  function setSpeed(s) { speed = s; labels(); }
  function select(s) {
    sel = s; var box = infoBox();
    labelsUndo();
    if (!s) { box.hidden = true; return; }
    box.hidden = false; box.dataset.sig = ''; updateInfo();
  }
  function bar(v, bad) { var c = bad ? (v > 70 ? '#b44b3a' : v > 45 ? '#c9a24a' : '#6f8a47') : (v < 30 ? '#b44b3a' : v < 55 ? '#c9a24a' : '#6f8a47'); return '<span class="bar"><i style="width:' + Math.round(v) + '%;background:' + c + '"></i></span>'; }
  function entStatus(o) {
    if (!o.ok) return '<p class="warn">⚠️ ' + L(V.noEntrance) + '</p>';
    if (!o.linked) return '<p class="warn">⚠️ ' + L(V.noLink) + '</p>';
    return '<p class="okk">🚪 ' + L(V.entrance, 'inline') + ': ' + SIDES[o.side] + ' side ✓</p>';
  }
  function updateInfo() {
    if (!sel) return; var box = infoBox(), h = '<button class="f-x" type="button" aria-label="Close">×</button>';
    if (sel.v) {
      var v = sel.v; if (visitors.indexOf(v) < 0) return select(null);
      var last = feed.find(function (f) { return f.vid === v.id; });
      h += '<div class="ih"><b class="nm">' + v.name + '</b></div>' + (last ? '<div class="iq">' + last.icon + ' ' + L(last.t) + '</div>' : '') +
        '<dl class="needs"><dt>' + L(V.joy) + '</dt><dd>' + bar(v.happy) + '</dd><dt>' + L(V.hunger) + '</dt><dd>' + bar(v.needs.hunger, 1) + '</dd>' +
        '<dt>' + L(V.thirst) + '</dt><dd>' + bar(v.needs.thirst, 1) + '</dd><dt>' + L(V.energy) + '</dt><dd>' + bar(v.needs.energy) + '</dd>' +
        '<dt>' + L(V.fun) + '</dt><dd>' + bar(v.needs.fun) + '</dd><dt>' + L(V.toilet) + '</dt><dd>' + bar(v.needs.toilet, 1) + '</dd>' +
        '<dt>' + L(V.purse) + '</dt><dd>🪙 ' + fmt(v.money) + '</dd></dl>';
      box.innerHTML = h; $('.f-x', box).onclick = function () { select(null); }; return;
    }
    var o = sel.o, d = DEF[o.type];
    if (!objById[o.id]) return select(null);
    var sig = 'o' + o.id + o.open + o.rot + o.ok + o.linked + JSON.stringify(show);
    if (box.dataset.sig === sig) {
      if (d.kind !== 'civic' && hasEntry(o.type)) { var dd = box.querySelectorAll('.needs dd'); if (dd[1]) dd[1].textContent = o.inside.length + ' / ' + capOf(o); if (dd[2]) dd[2].textContent = fmt(o.served); if (dd[3]) dd[3].textContent = '🪙 ' + fmt(o.income); }
      return;
    }
    h += '<div class="ih"><canvas width="64" height="50" id="info-ic"></canvas><div>' + L(B[o.type], 'big') + '</div></div>';
    if (hasEntry(o.type)) h += entStatus(o);
    if (featured[o.type] && fests.length) h += '<p class="okk">🎉 ' + festName(fests[0]) + ': extra visitors</p>';
    if (o.water) h += '<p class="okk">💧 Aqueduct water: room for more guests</p>';
    if (d.kind === 'civic') h += '<dl class="needs"><dt>' + L(V.upkeep) + '</dt><dd>🪙 ' + d.upkeep + '</dd></dl><p class="le">' + (o.type === 'curia' ? 'The council adds 2 fame every day and is needed for the later campaigns.' : 'Soldiers camp here. With a camp you can send them out to win more land.') + '</p>';
    else if (d.kind === 'water') h += '<p class="le">Fresh water for fountains, taverns and baths within 8 tiles: they can serve half as many guests again.</p><dl class="needs"><dt>' + L(V.upkeep) + '</dt><dd>🪙 ' + d.upkeep + '</dd></dl>';
    else if (hasEntry(o.type)) {
      h += '<dl class="needs"><dt>' + L(V.price) + '</dt><dd><input type="range" min="0" max="30" step="1" value="' + o.price + '" id="i-price" aria-label="Price"> <b id="i-pv">' + (o.price || L(V.free)) + '</b></dd>' +
        '<dt>' + L(V.inside) + '</dt><dd>' + o.inside.length + ' / ' + capOf(o) + '</dd><dt>' + L(V.served) + '</dt><dd>' + fmt(o.served) + '</dd>' +
        '<dt>' + L(V.income) + '</dt><dd>🪙 ' + fmt(o.income) + '</dd><dt>' + L(V.upkeep) + '</dt><dd>🪙 ' + (d.upkeep || 0) + '</dd></dl>' +
        '<button type="button" class="f-btn wide" id="i-open">' + (o.open ? '⛔ ' : '✅ ') + L(V.toggleOpen) + '</button>';
    }
    if (!o.wild) h += '<div class="irow">' + (hasEntry(o.type) ? '<button type="button" class="f-btn" id="i-rot">⟳ ' + L(V.rotate) + '</button>' : '') + '<button type="button" class="f-btn" id="i-move">✥ ' + L(V.move) + '</button></div>';
    box.innerHTML = h; box.dataset.sig = sig;
    $('.f-x', box).onclick = function () { select(null); };
    var ic = $('#info-ic'); if (ic) A.icon(ic, o.type, DEF[o.type].size[0], DEF[o.type].size[1], S.setting);
    var pr = $('#i-price'); if (pr) pr.oninput = function () { o.price = +pr.value; $('#i-pv').innerHTML = o.price || L(V.free); };
    var op = $('#i-open'); if (op) op.onclick = function () { o.open = !o.open; box.dataset.sig = ''; updateInfo(); };
    var ro = $('#i-rot'); if (ro) ro.onclick = function () { rotateExisting(o); };
    var mv = $('#i-move'); if (mv) mv.onclick = function () { setTool('move'); startMove(o); };
  }
  function renderFeed() {
    if (!feedDirty) return; feedDirty = false;
    $('#f-feed').innerHTML = feed.slice(0, 18).map(function (f) {
      return '<li><span class="fi">' + f.icon + '</span><div><small class="fn">' + f.v + (f.where ? ' · ' + L(f.where, 'inline') : '') + '</small>' + L(f.t, 'q') + '</div></li>';
    }).join('');
  }
  function renderGoals() {
    if (!S) return;
    var rk = S.rank || 1, nx = FV.RANKS[rk], sc = scen(), h = '';
    if (sc) h = '<li class="le">' + esc(sc.blurb) + ' Day ' + Math.min(S.day, sc.days) + ' of ' + sc.days + '.</li>' + sc.goals.map(function (g, i) { return '<li class="' + (S.sgoals[i] ? 'won' : '') + '">' + (S.sgoals[i] ? '⭐' : '☆') + ' ' + esc(g.e) + '</li>'; }).join('');
    h += '<li class="won">🏅 ' + L(V.rank, 'inline') + ' ' + rk + ': ' + L(FV.RANKS[rk - 1], 'inline') + (nx ? '<br><small class="le">Next: ' + nx.e + ' at ' + nx.need + '</small>' : '') + '</li>';
    if (!sc) h += FV.GOALS.map(function (g) { return '<li class="' + (S.goals[g.id] ? 'won' : '') + '">' + (S.goals[g.id] ? '🌿' : '○') + ' ' + L(g) + '</li>'; }).join('');
    $('#f-goals').innerHTML = h;
  }
  var ADVICE = {
    noFood: 'couldn’t find food. Build a bread stall by a busy path.', noDrink: 'couldn’t find a drink. Add a fountain or tavern.',
    noToilet: 'couldn’t find a latrine. Build one near the attractions.', noSeat: 'had nowhere to rest. Benches are cheap.',
    bored: 'were bored. Add another attraction or a market stall.', pricey: 'thought a price was too high. Lower it in the Inspect panel.',
    lost: 'got lost. Make sure every path joins the gate path.', dark: 'found it too dark. Torches light the paths at night.',
    dirty: 'saw litter. Hire a worker to sweep.', broke: 'ran out of money. Keep a few things cheap or free.'
  };
  function topIssues(cmp) { return Object.keys(cmp || {}).filter(function (k) { return ADVICE[k]; }).sort(function (a, b) { return cmp[b] - cmp[a]; }); }
  function renderAdvice() {
    var h = '', iss = topIssues(S.cmp), bad = S.objects.filter(function (o) { return hasEntry(o.type) && !o.ok; }).length;
    if (fests.length) { var tg = festTarget(); h += '<div class="fest-now">' + fests.map(function (f) { return f.icon + ' ' + festName(f) + (isGreat(f) ? ' <span class="le">(Great)</span>' : ''); }).join('<br>') + '<div class="le">Festival goal: ' + Math.min(S.festDayVis || 0, tg) + ' / ' + tg + ' visitors today</div><button type="button" class="f-btn sm" data-learn="' + fests[0].id + '">Learn more</button></div>'; }
    if (bad) h += '<p class="warn">⚠️ ' + bad + ' building' + (bad > 1 ? 's have' : ' has') + ' no path at the entrance.</p>';
    if (iss.length && S.cmp[iss[0]] >= 3) h += '<p class="tip">💡 ' + S.cmp[iss[0]] + ' visitors ' + ADVICE[iss[0]] + '</p>';
    var el = $('#f-advice'); if (el.dataset.h !== h) { el.innerHTML = h; el.dataset.h = h; }
  }
  function renderStats() {
    var avg = avgHappy(), t = C.totals(S.ledger.today), cal = C.calendar(S.day, S.m0), mo = FD.MONTHS[S.setting][cal.month];
    var tip = 'Today: +' + fmt(t.inc) + ' income, −' + fmt(t.out) + ' spending. Click for the breakdown.';
    $('#st-coins').title = tip; $('#st-coins').setAttribute('aria-label', 'Coins ' + fmt(S.coins) + '. ' + tip);
    $('#st-coins').innerHTML = '🪙 <b' + (S.coins < 0 ? ' class="neg"' : '') + '>' + fmt(S.coins) + '</b> <span class="flow"><span class="inc">+' + fmt(t.inc) + '</span> <span class="out">−' + fmt(t.out) + '</span></span>';
    $('#st-vis').innerHTML = '👥 <b>' + visitors.length + '</b> ' + L(V.visitors, 'inline');
    $('#st-fame').innerHTML = '🏅 <b>' + (S.rank || 1) + '</b> ⭐ <b>' + Math.round(S.fame) + '</b> ' + L(V.fame, 'inline') + (visitors.length ? ' · ' + (avg >= 60 ? '😊' : avg >= 40 ? '😐' : '😞') + ' <b>' + Math.round(avg) + '</b>' : '');
    var dk = darkness(S.time / DAY);
    $('#st-day').innerHTML = (fests.length ? fests[0].icon : S.event ? EVI[S.event] : dk > 0.5 ? '🌙' : '☀️') + ' ' + L(V.day, 'inline') + ' <b>' + S.day + '</b> <span class="mon" title="' + esc(mo.e) + ', year ' + cal.year + '">' + esc((S.setting === 'rome' ? mo.l : mo.g)) + '</span><span class="dayp"><i style="width:' + (S.time / DAY * 100).toFixed(0) + '%"></i></span>';
    if (!$('#f-money').hidden) renderMoney();
    renderAdvice();
  }
  var CATN = { fees: 'Entrance fees', sales: 'Tickets and sales', refund: 'Refunds', reward: 'Festival rewards', build: 'Building', upkeep: 'Upkeep', wages: 'Staff wages', land: 'Campaigns for land', tax: 'Tax' };
  function moneyTable(d) {
    var t = C.totals(d), r = function (k) { return (d[k] ? '<tr><td>' + CATN[k] + '</td><td class="num">' + fmt(d[k]) + '</td></tr>' : ''); };
    return '<table class="mt"><tbody><tr><th colspan="2">Income</th></tr>' + C.INC.map(r).join('') + '<tr class="sum"><td>Total income</td><td class="num">+' + fmt(t.inc) + '</td></tr>' +
      '<tr><th colspan="2">Spending</th></tr>' + C.OUT.map(r).join('') + '<tr class="sum"><td>Total spending</td><td class="num">−' + fmt(t.out) + '</td></tr>' +
      '<tr class="net"><td>Net</td><td class="num">' + (t.net >= 0 ? '+' : '') + fmt(t.net) + '</td></tr></tbody></table>';
  }
  function renderMoney() {
    var y = S.ledger.hist[S.ledger.hist.length - 1], up = 0, wages = 0;
    S.objects.forEach(function (o) { up += DEF[o.type].upkeep || 0; }); staff.forEach(function (s) { wages += STAFF[s.type].wage; });
    var h = '<button class="f-x" type="button" aria-label="Close">×</button><h4>🪙 ' + fmt(S.coins) + ' coins</h4><p class="le">Today so far (day ' + S.day + ')</p>' + moneyTable(S.ledger.today) +
      '<p class="le">Due at the end of today: upkeep ' + fmt(up) + ', wages ' + fmt(wages) + '.</p>' +
      (y ? '<p class="le">Yesterday: +' + fmt(y.inc) + ' / −' + fmt(y.out) + '</p>' : '') + '<button type="button" class="f-btn wide" id="m-more">📊 More stats</button>';
    var m = $('#f-money'); if (m.dataset.h === h) return; m.innerHTML = h; m.dataset.h = h;
    $('.f-x', m).onclick = function () { m.hidden = true; $('#st-coins').setAttribute('aria-expanded', 'false'); };
    $('#m-more').onclick = function () { m.hidden = true; openStats('money'); };
  }
  var toastT = 0;
  function toast(html, secs) { var t = $('#f-toast'); t.innerHTML = html; t.classList.add('on'); toastT = secs || 3.2; }

  // ---------- panels (stats, saves, scenario results) ----------
  var panelPrev = null;
  function openPanel(html, kind) {
    var p = $('#f-panel'); if (p.hidden) panelPrev = speed;
    if (kind !== 'scen') speed = 0;
    p.innerHTML = '<button type="button" class="f-btn close" id="p-x">✕ Close</button>' + html; p.hidden = false; p.scrollTop = 0; p.dataset.kind = kind || '';
    $('#p-x').onclick = closePanel;
  }
  function closePanel() { var p = $('#f-panel'); if (p.hidden) return; p.hidden = true; if (p.dataset.kind !== 'scen' && panelPrev != null) speed = panelPrev; panelPrev = null; if (S) labels(); }
  function chart(hist) {
    var days = hist.slice(-14); if (!days.length) return '<p class="le">The chart starts after your first full day.</p>';
    var max = Math.max(1, Math.max.apply(null, days.map(function (d) { return Math.max(d.inc, d.out); }))), W0 = 560, H0 = 160, pad = 26, bw = (W0 - pad - 8) / days.length, g = '';
    for (var i = 0; i <= 2; i++) { var yy = H0 - 18 - (H0 - 30) * i / 2; g += '<line x1="' + pad + '" x2="' + W0 + '" y1="' + yy + '" y2="' + yy + '" class="gl"/><text x="' + (pad - 4) + '" y="' + (yy + 3) + '" class="ax" text-anchor="end">' + fmtK(max * i / 2) + '</text>'; }
    days.forEach(function (d, k) {
      var x = pad + k * bw + bw * 0.12, w = Math.max(2, bw * 0.36), hi = (H0 - 30) * d.inc / max, ho = (H0 - 30) * d.out / max, base = H0 - 18;
      g += '<rect class="b-inc" x="' + x.toFixed(1) + '" y="' + (base - hi).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(0.5, hi).toFixed(1) + '" rx="2"><title>Day ' + d.day + ' income: ' + fmt(d.inc) + '</title></rect>' +
        '<rect class="b-out" x="' + (x + w + 2).toFixed(1) + '" y="' + (base - ho).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(0.5, ho).toFixed(1) + '" rx="2"><title>Day ' + d.day + ' spending: ' + fmt(d.out) + '</title></rect>' +
        '<text x="' + (x + w + 1).toFixed(1) + '" y="' + (H0 - 4) + '" class="ax" text-anchor="middle">' + d.day + '</text>';
    });
    return '<div class="lg2"><span><i class="k-inc"></i>Income</span><span><i class="k-out"></i>Spending</span></div><svg class="chart" viewBox="0 0 ' + W0 + ' ' + H0 + '" role="img" aria-label="Income and spending for the last ' + days.length + ' days">' + g + '</svg>' +
      '<details><summary>Table</summary><table class="mt"><thead><tr><th>Day</th><th class="num">Income</th><th class="num">Spending</th><th class="num">Visitors</th><th class="num">Happiness</th></tr></thead><tbody>' +
      days.map(function (d) { return '<tr><td>' + d.day + '</td><td class="num">' + fmt(d.inc) + '</td><td class="num">' + fmt(d.out) + '</td><td class="num">' + (d.vis || 0) + '</td><td class="num">' + (d.happy || '–') + '</td></tr>'; }).join('') + '</tbody></table></details>';
  }
  function fmtK(n) { return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(Math.round(n)); }
  function openStats(sec, festId) {
    var avg = avgHappy(), y = S.ledger.hist[S.ledger.hist.length - 1], iss = topIssues(S.cmp), cal = C.calendar(S.day, S.m0);
    var h = '<h2>📊 Festival stats</h2><nav class="ptabs"><a href="#ps-money">Money</a><a href="#ps-vis">Visitors</a><a href="#ps-bld">Buildings</a><a href="#ps-staff">Staff</a><a href="#ps-cal">Calendar</a></nav>';
    h += '<h3 id="ps-money">Money</h3><div class="two"><div><p class="le">Today (day ' + S.day + ')</p>' + moneyTable(S.ledger.today) + '</div><div><p class="le">Yesterday</p>' + (y ? moneyTable(y.d) : '<p class="le">No full day yet.</p>') + '</div></div><h4>Last 14 days</h4>' + chart(S.ledger.hist);
    h += '<h3 id="ps-vis">Visitors</h3><ul class="kv"><li>Here now <b>' + visitors.length + '</b></li><li>Arrived today <b>' + (S.dayVisitors || 0) + '</b></li><li>All visitors <b>' + fmt(S.totalVisitors) + '</b></li><li>Average happiness <b>' + Math.round(avg) + '</b></li><li>Fame <b>' + Math.round(S.fame) + '</b></li><li>Entrance fee <b>' + S.entryFee + '</b> <input type="range" min="0" max="30" value="' + S.entryFee + '" id="ps-fee" aria-label="Entrance fee"></li></ul>';
    h += '<h4>What visitors told you today</h4>' + (iss.length ? '<ul class="issues">' + iss.map(function (k) { return '<li><b>' + S.cmp[k] + '</b> ' + ADVICE[k] + '</li>'; }).join('') + '</ul>' : '<p class="le">No complaints yet today.</p>');
    var rows = S.objects.filter(function (o) { return !o.wild && hasEntry(o.type); }).map(function (o) {
      return '<tr><td>' + L(B[o.type], 'inline') + '</td><td>' + (!o.ok ? '⚠️ no path at entrance' : !o.linked ? '⚠️ not joined to the gate' : o.open ? '✓ open' : '⛔ closed') + '</td><td class="num">' + fmt(o.served) + '</td><td class="num">' + fmt(o.income) + '</td><td class="num">' + (DEF[o.type].upkeep || 0) + '</td></tr>';
    }).join('');
    h += '<h3 id="ps-bld">Buildings</h3>' + (rows ? '<div class="tw"><table class="mt"><thead><tr><th>Building</th><th>Status</th><th class="num">Guests</th><th class="num">Income</th><th class="num">Upkeep a day</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<p class="le">No buildings yet.</p>');
    h += '<h3 id="ps-staff">Staff</h3><p class="le">Workers sweep up litter. Pipe players cheer up visitors near them. Wages are paid at the end of each day.</p><ul class="kv">' +
      staff.map(function (s, i) { return '<li>' + (s.type === 'worker' ? '🧹 ' : '🎵 ') + L(B[s.type], 'inline') + ' <span class="le">' + STAFF[s.type].wage + ' a day</span> <button type="button" class="f-btn sm" data-fire="' + i + '">Let go</button></li>'; }).join('') + '</ul>' +
      '<p>' + Object.keys(STAFF).map(function (k) { return '<button type="button" class="f-btn" data-hire2="' + k + '">Hire ' + B[k].e.split(' (')[0] + ' (' + STAFF[k].hire + ')</button>'; }).join(' ') + '</p>';
    var months = FD.MONTHS[S.setting], list = FD.FESTS.filter(function (f) { return f.setting === S.setting; });
    h += '<h3 id="ps-cal">' + L(V.calendar) + '</h3><p class="le">Each day of play is one month; twelve days make a year. You are in year ' + cal.year + '. Festivals bring bigger crowds, and some buildings draw extra visitors.</p><ol class="cal">' +
      months.map(function (m, i) {
        var fs = list.filter(function (f) { return f.m === i; });
        return '<li class="' + (i === cal.month ? 'now' : '') + '"><b>' + esc(S.setting === 'rome' ? m.l : m.g) + '</b> <span class="le">' + esc(m.e) + '</span>' + fs.map(function (f) { return '<span class="fchip">' + f.icon + ' ' + esc(f.e) + (f.every ? ' <span class="le">(every ' + f.every + ' years)</span>' : '') + '</span>'; }).join('') + '</li>';
      }).join('') + '</ol>' +
      list.map(function (f) {
        return '<details class="fnote" id="fn-' + f.id + '"' + (f.id === festId ? ' open' : '') + '><summary>' + f.icon + ' ' + festName(f) + '</summary><p>' + esc(f.note) + '</p><p class="le">Draws extra visitors to: ' + f.feat.filter(function (t) { return B[t]; }).map(function (t) { return B[t].e; }).join(', ') + '.</p><p class="src">Learn more: ' + f.src.map(function (s) { return '<a href="' + s[1] + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a>'; }).join(' · ') + '</p></details>';
      }).join('');
    openPanel(h, 'stats');
    var fee = $('#ps-fee'); if (fee) fee.oninput = function () { S.entryFee = +fee.value; fee.previousElementSibling.textContent = S.entryFee; };
    $$('[data-fire]').forEach(function (b) { b.onclick = function () { fire(+b.dataset.fire); buildTools(); openStats('staff'); }; });
    $$('[data-hire2]').forEach(function (b) { b.onclick = function () { hire(b.dataset.hire2); buildTools(); openStats('staff'); }; });
    $$('.ptabs a').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); var t = $(a.getAttribute('href')); if (t) $('#f-panel').scrollTop = t.offsetTop - 50; }; });
    var target = festId ? $('#fn-' + festId) : sec ? $('#ps-' + sec) : null;
    if (target) $('#f-panel').scrollTop = target.offsetTop - 50;
  }

  // ---------- help ----------
  var helpPrevSpeed = 1;
  function openHelp() {
    helpPrevSpeed = speed; speed = 0; var h = $('#f-help');
    function row(o) { return '<tr><td class="lg">' + (o.g || '') + '</td><td class="ll">' + (o.l || '') + '</td><td>' + (o.e || '') + '</td></tr>'; }
    var bl = Object.keys(DEF).filter(function (k) { return DEF[k].group; }).map(function (k) {
      var d = DEF[k], does = [];
      if (d.fun) does.push(ICON.fun + ' fun'); if (d.hunger) does.push(ICON.hunger + ' food'); if (d.thirst) does.push(ICON.thirst + ' drink');
      if (d.energy > 0) does.push(ICON.energy + ' rest'); if (d.toilet) does.push(ICON.toilet + ' bathroom'); if (d.decor) does.push(ICON.pretty + ' beauty nearby');
      if (d.light) does.push('🔥 light at night'); if (d.kind === 'water') does.push('💧 water for nearby fountains and baths (Rome)');
      if (k === 'path') does.push('visitors walk on paths');
      return '<tr><td class="lg">' + (B[k].g || '') + '</td><td class="ll">' + (B[k].l || '') + '</td><td>' + B[k].e + '</td><td>🪙 ' + fmt(d.cost) + '</td><td>' + d.size[0] + '×' + d.size[1] + '</td><td>' + does.join(', ') + '</td></tr>';
    }).join('');
    h.innerHTML = '<button type="button" class="f-btn close" id="help-x">✕ Close</button>' +
      '<h2>How to play</h2>' +
      '<ol><li>Pick <b>Greece</b>, <b>Rome</b> or a <b>scenario</b> on the start screen (☰ brings it back any time).</li>' +
      '<li>Choose the <b>path</b> tool and drag across the grass to lay paths from the entrance gate. Visitors only walk on paths.</li>' +
      '<li>Pick a building and click the map to place it. Each building has one <b>entrance</b> (a small gate). The green or orange arrow shows where it is. Press <b>R</b> or ⟳ to turn the building before you place it. A path must touch the entrance, or the building stays shut and shows ⚠️.</li>' +
      '<li>Visitors pay the entrance fee, then look for what they need. Keep them fed, watered, rested and entertained, and give them latrines.</li>' +
      '<li>Use <b>🔍 Inspect</b> to click a building (price, open or close, turn, move) or a visitor (needs and last thought).</li>' +
      '<li>Happy visitors raise your <b>fame</b> (⭐), which brings more visitors. Each day, buildings cost upkeep and staff cost wages. Click the coins at the top to see where the money went.</li></ol>' +
      '<h3>Controls</h3><ul><li><b>Move around:</b> drag the map. <b>Zoom:</b> mouse wheel, pinch, or ＋/－.</li>' +
      '<li><b>Turn a building:</b> R key or ⟳. On a touch screen, long-press the map or tap with two fingers.</li>' +
      '<li><b>Undo:</b> ↶ or Ctrl+Z. <b>Move</b> (✥) picks up a building and puts it somewhere else for free. <b>Demolish</b> (⛏️) gives back half the cost.</li>' +
      '<li><b>Speed:</b> ❚❚ pause, ▶ normal, ▶▶ fast, ▶▶▶ fastest. Space bar pauses too.</li>' +
      '<li><b>🚪</b> shows every entrance. <b>📊</b> opens stats and the festival calendar. <b>💾</b> saves to a slot, or exports and imports a save file.</li>' +
      '<li><b>Languages:</b> Greece is played in Greek and Rome in Latin; the switches at the top turn that language and the English on or off. Greek is blue, Latin is red, English is small and grey.</li>' +
      '<li><b>Esc</b> returns to the Inspect tool.</li></ul>' +
      '<h3>Festivals and the calendar</h3><p>Each day of play is one month. Real ancient festivals come round in their months: the Panathenaia, Olympic and Pythian Games, Lenaia and City Dionysia in Greece; the Ludi Megalenses, Ludi Apollinares, Ludi Romani and Saturnalia in Rome. On a festival day more visitors come, some buildings draw extra crowds, and you earn a reward if enough visitors arrive. Open 📊 to read about each one.</p>' +
      '<h3>Ranks, land and days</h3><ul><li><b>Ranks:</b> as more visitors come and your fame grows you rise from citizen to market overseer, magistrate and general. Each rank unlocks buildings marked 🔒.</li><li><b>More land:</b> from rank 3, build an army camp and press ⚔️ to send the soldiers out. Half a day later the boundary moves outward. Later campaigns also need a council house.</li><li><b>Day and night:</b> evenings get dark. Torches and open buildings light the paths; visitors dislike dark corners.</li><li><b>Each day is different:</b> rain keeps people home, feast days bring crowds, a famous athlete lifts your fame, and now and then the tax collector calls.</li></ul>' +
      '<h3>Visitor needs</h3><p>' + ICON.hunger + ' hunger → bread stall · ' + ICON.thirst + ' thirst → tavern or fountain · ' + ICON.toilet + ' bathroom → latrine or baths · ' + ICON.energy + ' tiredness → bench or baths · ' + ICON.fun + ' boredom → attractions and market stalls. If a price is higher than a visitor thinks fair, they walk away. Scenery (' + ICON.pretty + ') near paths makes visitors happier; litter (' + ICON.dirty + ') makes them grumpy. The 💡 tip in the side panel names the biggest problem today.</p>' +
      '<h3>Staff</h3><p>🧹 Workers sweep litter from the paths. 🎵 Pipe players cheer up visitors near them. Hire them from the tool panel; they are paid each day.</p>' +
      '<h3>Buildings</h3><div class="tw"><table><thead><tr><th>Greek</th><th>Latin</th><th>English</th><th>Cost</th><th>Size</th><th>Gives</th></tr></thead><tbody>' + bl + '</tbody></table></div>' +
      '<h3>Word list: what visitors say</h3><div class="tw"><table><thead><tr><th>Greek</th><th>Latin</th><th>English</th></tr></thead><tbody>' + Object.keys(T).map(function (k) { return row(T[k]); }).join('') + '</tbody></table></div>' +
      '<h3>Word list: buttons and labels</h3><div class="tw"><table><thead><tr><th>Greek</th><th>Latin</th><th>English</th></tr></thead><tbody>' + Object.keys(V).filter(function (k) { return V[k].g || V[k].l; }).map(function (k) { return row(V[k]); }).join('') + '</tbody></table></div>' +
      '<h3>Saving</h3><p>There is no account. Your festival saves itself every few seconds in this browser only (one autosave for Greece, one for Rome and one for each scenario). Use 💾 for three extra save slots, or export a save file to keep it or move it to another device. Clearing browser data or using a private window starts over.</p>';
    h.hidden = false; h.scrollTop = 0;
    $('#help-x').onclick = function () { h.hidden = true; speed = helpPrevSpeed; if (S) labels(); };
  }

  // ---------- saving ----------
  function serialize() {
    S.staff = staff.map(function (s) { return { type: s.type, tile: s.tile }; });
    S.litter = []; for (var i = 0; i < N * N; i++) if (litter[i]) S.litter.push([i, litter[i]]);
    return JSON.stringify(S, function (k, v) { return k === 'inside' || k === 'ok' || k === 'linked' || k === 'water' || k === 'eIdx' ? undefined : v; });
  }
  function saveGame() { if (!S) return; lsSet(KEY.auto(S.gid || S.setting), serialize()); }
  function parseSave(txt) {
    var o; try { o = typeof txt === 'string' ? JSON.parse(txt) : txt; } catch (e) { return null; }
    if (!o || (o.setting !== 'greece' && o.setting !== 'rome')) return null;
    o = C.migrate(o, DEF, { seed: (Math.random() * 2147483647) | 0 });
    if (!o) return null;
    o.gid = o.gid || o.setting; o.sgoals = o.sgoals || {}; o.cmp = o.cmp || {}; o.goals = o.goals || {};
    if (!o.ledger || !o.ledger.today) o.ledger = C.newLedger();
    if (typeof o.coins !== 'number' || !isFinite(o.coins)) o.coins = 0;
    return o;
  }
  function loadAuto(g) { var t = lsGet(KEY.auto(g)); return t ? parseSave(t) : null; }
  function slotInfo(n) { var t = lsGet(KEY.slot(n)); if (!t) return null; try { var o = JSON.parse(t); return { day: o.day, setting: o.setting, scen: o.scen, at: o.savedAt }; } catch (e) { return null; } }
  function openSaves() {
    var h = '<h2>💾 Saves</h2><p class="le">Your festival also saves itself every few seconds (autosave). Slots keep a copy you can go back to.</p><ul class="slots">';
    for (var n = 1; n <= 3; n++) {
      var si = slotInfo(n);
      h += '<li><b>Slot ' + n + '</b> <span class="le">' + (si ? (si.setting === 'rome' ? 'Rome' : 'Greece') + (si.scen ? ' (scenario)' : '') + ', day ' + si.day + (si.at ? ', saved ' + new Date(si.at).toLocaleString() : '') : 'empty') + '</span> ' +
        '<button type="button" class="f-btn sm" data-ss="' + n + '">Save here</button>' + (si ? ' <button type="button" class="f-btn sm" data-sl="' + n + '">Load</button>' : '') + '</li>';
    }
    h += '</ul><h3>Save file</h3><p class="le">Export makes a small file you can keep or open on another device. Import loads one back.</p><p><button type="button" class="f-btn" id="sv-exp">⬇ Export save file</button> <label class="f-btn">⬆ Import save file<input type="file" id="sv-imp" accept=".json,application/json" hidden></label></p><p id="sv-msg" class="le" aria-live="polite"></p>';
    openPanel(h, 'saves');
    $$('[data-ss]').forEach(function (b) { b.onclick = function () { S.savedAt = Date.now(); if (lsSet(KEY.slot(b.dataset.ss), serialize())) { openSaves(); $('#sv-msg').textContent = 'Saved in slot ' + b.dataset.ss + '.'; } else $('#sv-msg').textContent = 'This browser would not save. It may be full or in private mode.'; }; });
    $$('[data-sl]').forEach(function (b) { b.onclick = function () { var o = parseSave(lsGet(KEY.slot(b.dataset.sl))); if (o) { closePanel(); begin(o); } }; });
    $('#sv-exp').onclick = exportSave; $('#sv-imp').onchange = function () { importSave(this.files[0], function (m) { var el = $('#sv-msg'); if (el) el.textContent = m; }); };
  }
  function exportSave() {
    if (!S) return; S.savedAt = Date.now();
    var blob = new Blob([serialize()], { type: 'application/json' }), a = D.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'festival-' + S.setting + '-day' + S.day + '.json';
    D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function importSave(file, msg) {
    if (!file) return;
    if (file.size > 2e6) return msg('That file is too big to be a festival save.');
    var r = new FileReader();
    r.onload = function () { var o = parseSave(String(r.result)); if (!o) return msg('That file isn’t a festival save.'); closePanel(); begin(o); toast('⬆ Save file loaded.'); };
    r.onerror = function () { msg('The file could not be read.'); };
    r.readAsText(file);
  }

  // ---------- start screen ----------
  function startScreen() {
    speed = 0; var st = $('#f-start'); st.hidden = false; closePanel();
    var card = function (s, emoji) {
      var sv = loadAuto(s); forceLang = s === 'rome' ? 'l' : 'g';
      var h = '<div class="sc sc-' + s + '"><div class="se">' + emoji + '</div>' + L(V[s], 'big') +
        '<button type="button" class="f-btn prim" data-new="' + s + '">' + L(V.newGame) + '</button>' +
        (sv ? '<button type="button" class="f-btn" data-go="' + s + '">' + L(V.resume) + ' · ' + L(V.day, 'inline') + ' ' + sv.day + '</button>' : '') + '</div>';
      forceLang = null; return h;
    };
    var str = stars(), sc = FD.SCEN.map(function (q) {
      var sv = lsGet(KEY.auto('sc-' + q.id)), n = str[q.id] || 0;
      return '<li class="scn"><span class="se2">' + q.icon + '</span><div><b>' + esc(q.e) + '</b> <span class="le">' + (q.setting === 'rome' ? 'Rome' : 'Greece') + ' · ' + q.days + ' days</span><br><span class="stars" aria-label="' + n + ' of 3 stars">' + starStr(n) + '</span> <span class="le">' + esc(q.blurb) + '</span></div>' +
        '<div class="scb"><button type="button" class="f-btn prim" data-scen="' + q.id + '">' + (sv ? 'Restart' : 'Play') + '</button>' + (sv ? '<button type="button" class="f-btn" data-scgo="' + q.id + '">Continue</button>' : '') + '</div></li>';
    }).join('');
    var slots = [1, 2, 3].map(function (n) { var si = slotInfo(n); return si ? '<button type="button" class="f-btn" data-slot="' + n + '">Slot ' + n + ': ' + (si.setting === 'rome' ? 'Rome' : 'Greece') + ', day ' + si.day + '</button>' : ''; }).join('');
    st.innerHTML = '<div class="sbox"><h2>' + 'Ancient Festival Tycoon' + '</h2>' +
      '<div class="scs">' + card('greece', '🏺') + card('rome', '🏛️') + '</div>' +
      '<p class="sp">Greece is played in Greek and Rome in Latin.</p><div class="slang"><span id="s-langs"></span></div>' +
      '<h3 class="sh">Scenarios</h3><ul class="scl">' + sc + '</ul>' +
      '<p class="srow">' + slots + '<label class="f-btn">⬆ Import save file<input type="file" id="s-imp" accept=".json,application/json" hidden></label> <button type="button" class="f-btn" id="s-help">? How to play</button></p><p id="s-msg" class="le" aria-live="polite"></p>' +
      '<p class="snote">No account and nothing uploaded: your festival is saved only in this browser on this device. Clearing browser data or using a private window starts over. Use 💾 in the game to export a save file.</p></div>';
    $('#s-langs').innerHTML = [['n', 'Show the Greek or Latin'], ['e', 'Show English']].map(function (k) {
      return '<label class="lt lt-' + k[0] + '"><input type="checkbox" data-sl2="' + k[0] + '"' + (show[k[0]] ? ' checked' : '') + '> ' + k[1] + '</label>';
    }).join('');
    $$('[data-sl2]', st).forEach(function (c) { c.onchange = function () { show[c.dataset.sl2] = c.checked; if (!show.n && !show.e) { show[c.dataset.sl2 === 'n' ? 'e' : 'n'] = true; } savePrefs(); startScreen(); }; });
    $('#s-help').onclick = openHelp;
    $$('[data-new]', st).forEach(function (b) { b.onclick = function () { begin(newState(b.dataset.new)); }; });
    $$('[data-go]', st).forEach(function (b) { b.onclick = function () { var o = loadAuto(b.dataset.go); if (o) begin(o); }; });
    $$('[data-scen]', st).forEach(function (b) { b.onclick = function () { var q = FD.SCEN.filter(function (z) { return z.id === b.dataset.scen; })[0]; begin(newState(q.setting, q)); }; });
    $$('[data-scgo]', st).forEach(function (b) { b.onclick = function () { var o = loadAuto('sc-' + b.dataset.scgo); if (o) begin(o); }; });
    $$('[data-slot]', st).forEach(function (b) { b.onclick = function () { var o = parseSave(lsGet(KEY.slot(b.dataset.slot))); if (o) begin(o); }; });
    $('#s-imp').onchange = function () { importSave(this.files[0], function (m) { $('#s-msg').textContent = m; }); };
  }
  function begin(state) {
    S = state; visitors = []; feed = []; sel = null; simClock = 0; undoStack = []; moving = null; buildRot = 0;
    S.cmp = S.cmp || {}; S.sgoals = S.sgoals || {};
    litter = new Uint8Array(N * N); (S.litter || []).forEach(function (p) { if (p[0] >= 0 && p[0] < N * N) litter[p[0]] = Math.min(3, p[1] | 0); });
    rebuild();
    staff = (S.staff || []).filter(function (s) { return STAFF[s.type]; }).map(function (s) { return newStaff(s.type, pathG[s.tile] ? s.tile : GI); });
    setFests();
    $('#f-start').hidden = true; setTool('look'); speed = 1;
    var c0 = A.P(GATE.x, N - 9, 0); cam = { x: c0[0], y: c0[1], z: W.innerWidth < 700 ? 0.85 : 1.05 };
    labels(); buildTools(); renderGoals(); feedDirty = true; root.classList.toggle('rome', S.setting === 'rome');
    $('#f-money').hidden = true;
    var sc = scen(); if (sc && S.day === 1 && S.time < 1) toast(sc.icon + ' <b>' + esc(sc.e) + '</b><br>' + esc(sc.blurb), 7);
    saveGame();
  }

  // ---------- main loop ----------
  var lastT = 0, uiAcc = 0, goalAcc = 0;
  function frame(ts) {
    var t = ts / 1000, real = Math.min(0.1, t - (lastT || t)); lastT = t;
    if (S && $('#f-start').hidden) {
      if (speed) { var dt = real * speed, stepN = Math.ceil(dt / 0.05); for (var i = 0; i < stepN; i++) step(dt / stepN); }
      render(t);
      uiAcc += real; goalAcc += real;
      if (uiAcc > 0.25) { uiAcc = 0; renderStats(); renderFeed(); if (sel) updateInfo(); }
      if (goalAcc > 1) { goalAcc = 0; checkGoals(); }
      if (toastT > 0) { toastT -= real; if (toastT <= 0) $('#f-toast').classList.remove('on'); }
      if (t - lastSave > 15) { lastSave = t; saveGame(); }
    }
    W.requestAnimationFrame(frame);
  }
  D.addEventListener('visibilitychange', function () { if (D.hidden) saveGame(); });
  W.addEventListener('pagehide', saveGame);

  shell(); startScreen(); W.requestAnimationFrame(frame);
  W.__fest = { get S() { return S; }, get visitors() { return visitors; }, get staff() { return staff; }, get objById() { return objById; }, place: place, placePath: placePath, begin: begin, newState: newState, setSpeed: setSpeed, step: step, rotate: rotate, undo: undo, setTool: setTool, hire: hire, endDay: endDay, startMove: startMove, dropMove: dropMove, demolish: demolish, openStats: openStats, openSaves: openSaves, get buildRot() { return buildRot; }, litter: function () { return litter; } };
})(window, document);

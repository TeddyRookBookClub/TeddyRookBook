/* Panegyris / Ludi: an isometric festival-grounds builder in Koine Greek and Latin. */
(function (W, D) {
  'use strict';
  var FV = W.FestVocab, A = W.FestArt, V = FV.V, B = FV.B, T = FV.T;
  var root = D.getElementById('fest'); if (!root) return;
  var N = 44, TW = A.TW, TH = A.TH;
  var DAY = 180; // game seconds per day

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
    baths: { size: [2, 2], cost: 800, upkeep: 30, kind: 'rest', energy: 45, fun: 18, toilet: -40, dur: 12, cap: 14, price: 6, value: 9, group: 'gCare', appeal: 3 },
    latrine: { size: [1, 1], cost: 100, upkeep: 3, kind: 'toilet', toilet: -100, dur: 3, cap: 2, price: 0, value: 2, group: 'gCare' },
    bench: { size: [1, 1], cost: 20, upkeep: 0, kind: 'rest', energy: 22, dur: 5, cap: 2, price: 0, value: 0, group: 'gCare' },
    olive: { size: [1, 1], cost: 25, kind: 'decor', decor: 1.2, group: 'gDecor' },
    cypress: { size: [1, 1], cost: 25, kind: 'decor', decor: 1, group: 'gDecor' },
    statue: { size: [1, 1], cost: 150, kind: 'decor', decor: 2.5, group: 'gDecor' },
    flowers: { size: [1, 1], cost: 30, kind: 'decor', decor: 1.5, group: 'gDecor' },
    // unlocked by rank
    stadium: { size: [5, 2], cost: 1200, upkeep: 50, kind: 'show', fun: 60, energy: -8, dur: 14, cap: 30, price: 9, value: 14, group: 'gShows', appeal: 6, rank: 2 },
    library: { size: [2, 2], cost: 650, upkeep: 22, kind: 'show', fun: 38, energy: 8, dur: 10, cap: 10, price: 4, value: 8, group: 'gShows', appeal: 4, rank: 2 },
    amphitheater: { size: [4, 4], cost: 3000, upkeep: 120, kind: 'show', fun: 90, dur: 18, cap: 60, price: 15, value: 24, group: 'gShows', appeal: 10, rank: 4 },
    stoa: { size: [3, 1], cost: 350, upkeep: 8, kind: 'rest', energy: 35, dur: 6, cap: 8, price: 0, value: 0, group: 'gCare', decor: 1.5, rank: 2 },
    inn: { size: [2, 2], cost: 700, upkeep: 25, kind: 'rest', energy: 70, hunger: -30, dur: 14, cap: 8, price: 8, value: 12, group: 'gCare', rank: 2 },
    altar: { size: [1, 1], cost: 120, kind: 'decor', decor: 2, group: 'gDecor', rank: 2 },
    trophy: { size: [1, 1], cost: 600, kind: 'decor', decor: 5, group: 'gDecor', rank: 4 },
    curia: { size: [3, 2], cost: 1500, upkeep: 40, kind: 'civic', group: 'gCity', rank: 3 },
    barracks: { size: [3, 3], cost: 1200, upkeep: 60, kind: 'civic', group: 'gCity', rank: 3 }
  };
  var GROUPS = ['gWays', 'gShows', 'gFood', 'gCare', 'gDecor', 'gCity'];
  // Land: the festival starts on the middle plot; each campaign pushes the boundary out. [x0, y0, x1, y1] inclusive.
  var LAND = [[8, 16, 35, 43], [4, 10, 39, 43], [0, 4, 43, 43], [0, 0, 43, 43]], LANDCOST = [1500, 3500, 7000];
  var ICON = { hunger: '🍞', thirst: '💧', toilet: '🚻', energy: '💤', fun: '🎭', happy: '😊', sad: '😞', money: '🪙', pretty: '🌿', lost: '❓' };

  // ---------- language display ----------
  var show = { n: true, e: true }; // n: the setting's own language (Greek in Greece, Latin in Rome); e: English
  var forceLang = null;
  function L(o, cls) {
    if (!o) return '';
    var k = forceLang || (S && S.setting === 'rome' ? 'l' : 'g'), h = '';
    if (show.n && o[k]) h += '<span class="l' + k + '">' + o[k] + '</span>';
    if ((show.e || !h) && o.e) h += '<span class="le">' + o.e + '</span>';
    return '<span class="vx ' + (cls || '') + '">' + h + '</span>';
  }

  // ---------- state ----------
  var S = null, occ, pathG, objById = {}, nextId = 1, vid = 1;
  function idx(x, y) { return y * N + x; }
  function inMap(x, y) { return x >= 0 && y >= 0 && x < N && y < N; }
  function inb(x, y) { var b = LAND[S ? S.land || 0 : 0]; return x >= b[0] && y >= b[1] && x <= b[2] && y <= b[3]; } // inside the land you hold
  var GATE = { x: 21, y: N - 1 };
  function rankOf(s) { var r = 1; FV.RANKS.forEach(function (k, i) { if (i && s.totalVisitors >= k.v && s.fame >= k.f) r = Math.max(r, i + 1); }); return r; }
  function has(type) { return S.objects.some(function (o) { return o.type === type; }); }

  function newState(setting) {
    var s = { setting: setting, coins: 3000, day: 1, time: 0, fame: 50, totalVisitors: 0, entryFee: 10, objects: [], paths: [], goals: {}, lifetimeIncome: 0, v: 2, land: 0, rank: 1 };
    for (var y = N - 2; y >= N - 7; y--) s.paths.push(idx(GATE.x, y));
    for (var x = GATE.x - 3; x <= GATE.x + 3; x++) if (x !== GATE.x) s.paths.push(idx(x, N - 7));
    // some starting trees
    var r = A.mulberry(setting === 'rome' ? 11 : 5);
    for (var i = 0; i < 70; i++) {
      var tx = Math.floor(r() * N), ty = Math.floor(r() * N);
      if (Math.abs(tx - GATE.x) < 5 && ty > N - 10) continue;
      s.objects.push({ type: r() < 0.6 ? 'olive' : 'cypress', x: tx, y: ty, seed: Math.floor(r() * 1000), wild: 1 });
    }
    return s;
  }
  function rebuild() {
    occ = new Int32Array(N * N).fill(0); pathG = new Uint8Array(N * N); objById = {};
    S.paths.forEach(function (i) { pathG[i] = 1; });
    pathG[idx(GATE.x, GATE.y)] = 2;
    var keep = [];
    S.objects.forEach(function (o) {
      var d = DEF[o.type], w = d.size[0], h = d.size[1];
      if (!fits(o.x, o.y, w, h, true, o.wild)) return;
      o.id = o.id || nextId++; nextId = Math.max(nextId, o.id + 1);
      o.w = w; o.h = h; o.inside = []; o.served = o.served || 0; o.income = o.income || 0;
      if (o.price == null) o.price = d.price || 0; if (o.open == null) o.open = true;
      for (var yy = o.y; yy < o.y + h; yy++) for (var xx = o.x; xx < o.x + w; xx++) occ[idx(xx, yy)] = o.id;
      objById[o.id] = o; keep.push(o);
    });
    S.objects = keep; groundDirty = true;
  }
  function fits(x, y, w, h, strict, anywhere) {
    for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) {
      if (!(anywhere ? inMap(xx, yy) : inb(xx, yy))) return false;
      var i = idx(xx, yy); if (pathG[i]) return false;
      if (occ[i] && (strict || !objById[occ[i]] || !objById[occ[i]].wild)) return false;
    }
    return true;
  }
  function access(o) {
    var out = [];
    for (var yy = o.y - 1; yy <= o.y + o.h; yy++) for (var xx = o.x - 1; xx <= o.x + o.w; xx++) {
      var edge = (yy === o.y - 1 || yy === o.y + o.h) !== (xx === o.x - 1 || xx === o.x + o.w);
      if (edge && inb(xx, yy) && pathG[idx(xx, yy)] === 1) out.push(idx(xx, yy));
    }
    return out;
  }

  // ---------- path finding ----------
  function bfs(from) {
    var dist = new Int16Array(N * N).fill(-1), prev = new Int32Array(N * N).fill(-1), q = [from], h = 0;
    dist[from] = 0;
    while (h < q.length) {
      var c = q[h++], cx = c % N, cy = (c / N) | 0;
      for (var k = 0; k < 4; k++) {
        var nx = cx + (k === 0) - (k === 1), ny = cy + (k === 2) - (k === 3);
        if (!inb(nx, ny)) continue; var n = idx(nx, ny);
        if (dist[n] >= 0 || !pathG[n]) continue;
        dist[n] = dist[c] + 1; prev[n] = c; q.push(n);
      }
    }
    return { dist: dist, prev: prev };
  }
  function route(b, to) { var p = []; for (var c = to; c !== -1; c = b.prev[c]) p.unshift(c); p.shift(); return p; }

  // ---------- visitors ----------
  var visitors = [], feed = [];
  var TUNICS = ['#f3efe4', '#2f5f93', '#b44b3a', '#c9a24a', '#6f8a47', '#8c1d2c', '#e8d7b0', '#5b4a7a'];
  function spawn() {
    var gi = idx(GATE.x, GATE.y), r = Math.random, names = FV.NAMES[S.setting];
    var v = {
      id: vid++, name: names[Math.floor(r() * names.length)], tile: gi, x: GATE.x, y: GATE.y, path: [], state: 'walk', timer: 0,
      needs: { hunger: 10 + r() * 30, thirst: 10 + r() * 30, toilet: r() * 30, energy: 80 + r() * 20, fun: 40 + r() * 20 },
      money: 40 + Math.floor(r() * 90), happy: 55 + r() * 15, rej: {}, cd: {}, tunic: TUNICS[Math.floor(r() * TUNICS.length)], bubble: null, age: 0, spent: 0
    };
    if (v.money < S.entryFee) return;
    v.money -= S.entryFee; S.coins += S.entryFee; S.lifetimeIncome += S.entryFee; todayIncome += S.entryFee;
    S.totalVisitors++; visitors.push(v);
    if (Math.random() < 0.3) think(v, 'arrive', 'happy');
  }
  function think(v, key, icon, where) {
    var now = simClock;
    if (v.cd[key] && now - v.cd[key] < 25) return;
    v.cd[key] = now; v.bubble = { icon: ICON[icon] || '💬', t: 2.6 };
    feed.unshift({ v: v.name, vid: v.id, t: T[key], icon: ICON[icon] || '💬', where: where ? B[where] : null });
    if (feed.length > 40) feed.pop();
    feedDirty = true;
  }
  var NEED_KIND = { hunger: 'food', thirst: 'drink', toilet: 'toilet', energy: 'rest', fun: 'show' };
  function wants(o, need) {
    var d = DEF[o.type];
    if (need === 'hunger') return d.kind === 'food';
    if (need === 'thirst') return d.kind === 'drink';
    if (need === 'toilet') return (d.toilet || 0) < 0;
    if (need === 'energy') return d.kind === 'rest' || (d.energy || 0) > 0;
    return d.kind === 'show' || (d.fun || 0) > 20;
  }
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
      if (!DEF[o.type].kind || DEF[o.type].kind === 'decor' || !wants(o, need)) return;
      if (v.rej[o.id] && simClock - v.rej[o.id] < 40) return;
      var acc = access(o), dmin = 1e9, at = -1;
      acc.forEach(function (a) { if (b.dist[a] >= 0 && b.dist[a] < dmin) { dmin = b.dist[a]; at = a; } });
      if (at < 0) return;
      var d = DEF[o.type], sc = dmin + o.price * 1.5 - (d.appeal || 0) * 2 + o.inside.length / Math.max(1, d.cap) * 6 + Math.random() * 4;
      if (need === 'fun' && v.last === o.id) sc += 25;
      if (sc < bestScore) { bestScore = sc; best = { o: o, at: at }; }
    });
    if (!best) {
      var miss = { hunger: 'noFood', thirst: 'noDrink', toilet: 'noToilet', energy: 'noSeat', fun: 'bored' }[need];
      think(v, miss, need); v.happy -= need === 'fun' ? 1 : 5; return wander(v);
    }
    var d = DEF[best.o.type], will = d.value * (0.9 + v.happy / 180) * 1.5;
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
    var b = bfs(v.tile), g = idx(GATE.x, GATE.y);
    if (b.dist[g] < 0) { think(v, 'lost', 'lost'); v.path = []; v.stuck = (v.stuck || 0) + 1; if (v.stuck > 3) depart(v); return; }
    v.path = route(b, g);
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
    if (!o) { v.target = null; return; }
    var d = DEF[o.type];
    if (!o.open) { think(v, 'closed', 'sad', o.type); v.rej[o.id] = simClock; v.target = null; return; }
    if (o.inside.length >= d.cap) { v.state = 'queue'; v.timer = 3; v.queueT = (v.queueT || 0) + 3; if (v.queueT > 15) { v.rej[o.id] = simClock; v.state = 'walk'; v.queueT = 0; v.target = null; } return; }
    v.queueT = 0;
    if (o.price > v.money) { think(v, 'broke', 'money'); return leave(v); }
    v.money -= o.price; v.spent += o.price; o.income += o.price; o.served++; S.coins += o.price; S.lifetimeIncome += o.price; todayIncome += o.price;
    o.inside.push(v.id); v.state = 'inside'; v.timer = d.dur; v.last = o.id;
  }
  function exitBuilding(v) {
    var o = objById[v.target]; v.state = 'walk';
    if (o) {
      var d = DEF[o.type], n = v.needs;
      o.inside.splice(o.inside.indexOf(v.id), 1);
      ['hunger', 'thirst', 'toilet'].forEach(function (k) { if (d[k]) n[k] = Math.max(0, n[k] + d[k]); });
      if (d.energy) n.energy = Math.min(100, n.energy + d.energy);
      if (d.fun) n.fun = Math.min(100, n.fun + d.fun);
      v.happy = Math.min(100, v.happy + 4 + (d.appeal || 0) + (d.fun || 0) / 10);
      if (Math.random() < 0.75) think(v, o.type, 'happy', o.type);
    }
    v.target = null;
  }

  // ---------- simulation ----------
  var simClock = 0, spawnAcc = 0, todayIncome = 0, speed = 1, feedDirty = true, lastSave = 0;
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
    var shows = S.objects.filter(function (o) { return DEF[o.type].kind === 'show'; }).length;
    var rate = 0.14 * (0.35 + S.fame / 100) * Math.min(1.4, 0.35 + shows * 0.3) * Math.max(0.15, 1.35 - S.entryFee / 35) * (S.event === 'rain' ? 0.55 : S.event === 'feast' ? 1.6 : 1);
    if (S.campaign) { S.campaign -= dt; if (S.campaign <= 0) { S.campaign = 0; S.land = Math.min(3, (S.land || 0) + 1); S.fame = Math.min(100, S.fame + 3); groundDirty = true; toast('🏆 ' + L(V.won)); buildTools(); } }
    spawnAcc += rate * dt;
    while (spawnAcc > 1) { spawnAcc -= 1; if (visitors.length < 140 + (S.land || 0) * 40) spawn(); }
    for (var i = visitors.length - 1; i >= 0; i--) updateVisitor(visitors[i], dt);
  }
  function updateVisitor(v, dt) {
    var n = v.needs; v.age += dt;
    n.hunger = Math.min(100, n.hunger + 0.55 * dt); n.thirst = Math.min(100, n.thirst + 0.7 * dt);
    n.toilet = Math.min(100, n.toilet + 0.38 * dt); n.energy = Math.max(0, n.energy - (v.state === 'inside' ? 0.05 : 0.28) * dt);
    n.fun = Math.max(0, n.fun - (v.state === 'inside' ? 0 : 0.45) * dt);
    var pen = (n.hunger > 80 ? 0.2 : 0) + (n.thirst > 80 ? 0.2 : 0) + (n.toilet > 90 ? 0.45 : 0) + (n.energy < 20 ? 0.12 : 0) + (n.fun < 15 ? 0.1 : 0);
    v.happy = Math.max(0, Math.min(100, v.happy - pen * dt));
    if (v.bubble) { v.bubble.t -= dt; if (v.bubble.t <= 0) v.bubble = null; }
    if (Math.random() < dt * 0.08) {
      if (n.hunger > 60) think(v, 'hungry', 'hunger'); else if (n.thirst > 55) think(v, 'thirsty', 'thirst');
      else if (n.toilet > 75) think(v, 'toilet', 'toilet'); else if (n.energy < 30) think(v, 'tired', 'energy');
    }
    if (v.state === 'inside') { v.timer -= dt; if (v.timer <= 0) { exitBuilding(v); decide(v); } return; }
    if (v.state === 'queue') { v.timer -= dt; if (v.timer <= 0) { v.state = 'walk'; arrive(v); } return; }
    if (v.timer > 0) { v.timer -= dt; return; }
    if (!v.path.length) {
      if (v.state === 'leaving') { if (v.tile === idx(GATE.x, GATE.y)) return depart(v); return leave(v); }
      if (v.target) return arrive(v);
      var dec = decorAt(v.tile % N, (v.tile / N) | 0);
      if (dec > 2) { v.happy = Math.min(100, v.happy + dec * 0.3); if (Math.random() < 0.15) think(v, 'pretty', 'pretty'); }
      return decide(v);
    }
    var nx = v.path[0] % N, ny = (v.path[0] / N) | 0;
    if (!pathG[v.path[0]]) { v.path = []; v.target = null; think(v, 'lost', 'lost'); return; }
    var dx = nx - v.x, dy = ny - v.y, dist = Math.hypot(dx, dy), sp = 1.7 * dt;
    if (dist <= sp) { v.x = nx; v.y = ny; v.prevTile = v.tile; v.tile = v.path.shift(); }
    else { v.x += dx / dist * sp; v.y += dy / dist * sp; }
  }
  function endDay() {
    S.time -= DAY; S.day++;
    var up = 0; S.objects.forEach(function (o) { up += DEF[o.type].upkeep || 0; });
    S.coins -= up;
    if (has('curia')) S.fame = Math.min(100, S.fame + 2);
    var msg = L(V.day) + ' ' + (S.day - 1) + ' · ' + L(V.income) + ' +' + todayIncome + ' · ' + L(V.upkeep) + ' −' + up;
    // something different can happen each day
    var r = Math.random(); S.event = S.day < 3 ? null : r < 0.14 ? 'rain' : r < 0.3 ? 'feast' : r < 0.38 ? 'athlete' : r < 0.45 ? 'tax' : null;
    if (S.event === 'athlete') S.fame = Math.min(100, S.fame + 4);
    if (S.event === 'tax') { var tax = Math.min(400, Math.max(0, Math.floor(S.coins * 0.04))); S.coins -= tax; msg += '<br>📜 ' + L(V.evTax) + ' −' + tax; }
    else if (S.event) msg += '<br>' + EVI[S.event] + ' ' + L(V[{ rain: 'evRain', feast: 'evFeast', athlete: 'evAthlete' }[S.event]]);
    toast(msg); toastT = S.event ? 6 : 3.2;
    todayIncome = 0;
  }
  var EVI = { rain: '🌧️', feast: '🎉', athlete: '🏅', tax: '📜' };
  function checkGoals() {
    var rk = rankOf(S); if (rk > (S.rank || 1)) { S.rank = rk; toast('🏅 ' + L(V.newRank) + ': ' + L(FV.RANKS[rk - 1])); toastT = 6; buildTools(); renderGoals(); }
    var st = { land: S.land || 0, totalVisitors: S.totalVisitors, coins: S.coins, fame: S.fame, day: S.day, showCount: S.objects.filter(function (o) { return DEF[o.type].kind === 'show'; }).length };
    FV.GOALS.forEach(function (g) { if (!S.goals[g.id] && g.test(st)) { S.goals[g.id] = 1; toast('🌿 ' + L(g)); renderGoals(); } });
  }

  // ---------- rendering ----------
  var cv, ctx, dpr = 1, cam = { x: 0, y: N * TH / 2, z: 1 }, ground = null, groundDirty = true, hover = null;
  var GPAD = 60, GOX = N * TW / 2 + GPAD, GOY = GPAD;
  function buildGround() {
    var p = A.PAL[S.setting], w = N * TW + GPAD * 2, h = N * TH + GPAD * 2 + 30;
    ground = ground || D.createElement('canvas'); ground.width = w; ground.height = h;
    var c = ground.getContext('2d'); c.clearRect(0, 0, w, h); c.save(); c.translate(GOX, GOY);
    // diorama sides
    var L0 = A.P(0, N, 0), B0 = A.P(N, N, 0), R0 = A.P(N, 0, 0);
    A.poly(c, [L0, B0, [B0[0], B0[1] + 22], [L0[0], L0[1] + 22]], '#9c7b52'); A.poly(c, [B0, R0, [R0[0], R0[1] + 22], [B0[0], B0[1] + 22]], '#7e623f');
    c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(L0[0], L0[1] + 10, B0[0] - L0[0], 2);
    var r = A.mulberry(3);
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var i = idx(x, y), pts = [A.P(x, y), A.P(x + 1, y), A.P(x + 1, y + 1), A.P(x, y + 1)];
      if (pathG[i]) {
        A.poly(c, pts, p.path);
        for (var k = 0; k < 4; k++) { var q = A.P(x + 0.15 + r() * 0.7, y + 0.15 + r() * 0.7); c.fillStyle = A.shade(p.path, (r() - 0.5) * 0.3); c.fillRect(q[0] - 2, q[1] - 1, 4 + r() * 3, 2); }
        c.strokeStyle = p.pathD; c.lineWidth = 1.2;
        [[0, -1, 0, 1], [1, 0, 1, 2], [0, 1, 2, 3], [-1, 0, 3, 0]].forEach(function (e) {
          var nx = x + e[0], ny = y + e[1];
          if (!inb(nx, ny) || !pathG[idx(nx, ny)]) { c.beginPath(); c.moveTo(pts[e[2]][0], pts[e[2]][1]); c.lineTo(pts[e[3]][0], pts[e[3]][1]); c.stroke(); }
        });
      } else {
        var gcol = p.grass[(x * 7 + y * 13 + ((x * y) % 5)) % p.grass.length];
        if (!inb(x, y)) gcol = A.shade(gcol, -0.3 - ((x * 5 + y * 3) % 3) * 0.04); // land you do not hold yet
        A.poly(c, pts, gcol);
        if (r() < 0.35) { var t = A.P(x + r(), y + r()); c.fillStyle = A.shade(gcol, -0.15); c.fillRect(t[0], t[1] - 3, 1, 3); c.fillRect(t[0] + 2, t[1] - 4, 1, 4); }
      }
    }
    // boundary stones around the land you hold
    var bd = LAND[S.land || 0], cs = [A.P(bd[0], bd[1]), A.P(bd[2] + 1, bd[1]), A.P(bd[2] + 1, bd[3] + 1), A.P(bd[0], bd[3] + 1)];
    if ((S.land || 0) < 3) { c.setLineDash([10, 6]); A.poly(c, cs, null, 'rgba(255,248,220,.85)', 2.5); c.setLineDash([]); }
    c.restore(); groundDirty = false;
  }
  function worldToScreen(wx, wy) { return [(wx - cam.x) * cam.z + cv.clientWidth / 2, (wy - cam.y) * cam.z + cv.clientHeight / 2]; }
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
    var s = A.sprite(o.type, o.w, o.h, S.setting, o.seed), p = A.P(o.x, o.y, 0);
    ctx.drawImage(s.cv, p[0] - s.ox, p[1] - s.oy, s.w, s.h);
  }
  function drawVisitor(v, t) {
    var p0 = A.P(v.x + 0.5, v.y + 0.5, 0), bob = v.path.length ? Math.abs(Math.sin(t * 9 + v.id)) * 1.6 : 0;
    ctx.save(); ctx.translate(p0[0], p0[1]); ctx.scale(1.3, 1.3); var p = [0, 0];
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(p[0], p[1], 5, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = v.tunic; ctx.beginPath(); ctx.moveTo(p[0] - 4, p[1] - 2 - bob); ctx.lineTo(p[0] - 3, p[1] - 13 - bob); ctx.lineTo(p[0] + 3, p[1] - 13 - bob); ctx.lineTo(p[0] + 4, p[1] - 2 - bob); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.fillStyle = '#c69063'; ctx.beginPath(); ctx.arc(p[0], p[1] - 16 - bob, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2a1e'; ctx.beginPath(); ctx.arc(p[0], p[1] - 17 - bob, 3.2, Math.PI, 0); ctx.fill();
    if (sel && sel.v === v) { ctx.strokeStyle = '#f3dfa3'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(p[0], p[1], 8, 3.5, 0, 0, Math.PI * 2); ctx.stroke(); }
    if (v.bubble) {
      var bx = p[0] + 6, by = p[1] - 34;
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx - 9, by - 9, 18, 16, 6) : ctx.rect(bx - 9, by - 9, 18, 16); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - 4, by + 7); ctx.lineTo(bx - 7, by + 11); ctx.lineTo(bx, by + 7); ctx.fill();
      ctx.font = '11px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText(v.bubble.icon, bx, by - 1);
    }
    ctx.restore();
  }
  function drawLive(o, t) { // small animations on top of sprites
    var p;
    if (o.type === 'hippodrome' && o.inside.length) {
      for (var k = 0; k < 3; k++) {
        var a = t * 0.9 + k * 2.1, rx = o.w / 2 - 0.8, ry = o.h / 2 - 0.62;
        p = A.P(o.x + o.w / 2 + Math.cos(a) * rx, o.y + o.h / 2 + Math.sin(a) * ry, 3);
        ctx.fillStyle = ['#b44b3a', '#2f5f93', '#6f8a47'][k]; ctx.beginPath(); ctx.ellipse(p[0], p[1], 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6b4a2c'; ctx.fillRect(p[0] - 3, p[1] - 5, 2, 3); ctx.fillRect(p[0] + 1, p[1] - 5, 2, 3);
      }
    }
    if (o.type === 'fountain') {
      p = A.P(o.x + 0.5, o.y + 0.5, 30); ctx.strokeStyle = 'rgba(210,235,255,.85)'; ctx.lineWidth = 1.2;
      for (var j = 0; j < 4; j++) { var ph = (t * 1.5 + j / 4) % 1; ctx.beginPath(); ctx.arc(p[0] + (j - 1.5) * 3, p[1] + ph * 18, 1 + ph * 1.5, 0, Math.PI * 2); ctx.stroke(); }
    }
    if (o.type === 'baths' && o.inside.length) {
      p = A.P(o.x + o.w / 2, o.y + o.h / 2, 60); ctx.fillStyle = 'rgba(255,255,255,.35)';
      for (var s2 = 0; s2 < 3; s2++) { var ph2 = (t * 0.4 + s2 / 3) % 1; ctx.beginPath(); ctx.arc(p[0] + Math.sin(ph2 * 6 + s2) * 5, p[1] - ph2 * 22, 3 + ph2 * 4, 0, Math.PI * 2); ctx.fill(); }
    }
    if ((o.type === 'theater' || o.type === 'odeum' || o.type === 'temple' || o.type === 'palaestra') && o.inside.length) {
      p = A.P(o.x + o.w / 2, o.y + o.h / 2, 0); var n = Math.min(10, o.inside.length);
      for (var q = 0; q < n; q++) { var aa = Math.PI + (q + 0.5) / n * Math.PI, rr = Math.min(o.w, o.h) * 0.33; var pp = A.P(o.x + o.w / 2 + 0.25 + Math.cos(aa) * rr, o.y + o.h / 2 + 0.25 + Math.sin(aa) * rr, o.type === 'theater' ? 24 : 4); ctx.fillStyle = TUNICS[q % TUNICS.length]; ctx.fillRect(pp[0] - 1.5, pp[1] - 4, 3, 4); }
    }
    if (!o.open) { p = A.P(o.x + o.w / 2, o.y + o.h / 2, 30); ctx.font = '16px system-ui'; ctx.textAlign = 'center'; ctx.fillText('⛔', p[0], p[1]); }
  }
  function render(t) {
    if (groundDirty) buildGround();
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) resize(); // the stage changed size (phone toolbars, rotation, late layout)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var sky = ctx.createLinearGradient(0, 0, 0, h), dayf = S.time / DAY;
    var warm = Math.max(0, (dayf - 0.75) * 4);
    sky.addColorStop(0, S.setting === 'rome' ? '#e9dcc0' : '#dfe9ef'); sky.addColorStop(1, S.setting === 'rome' ? '#f6ecd8' : '#f3f1e8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    ctx.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, dpr * (w / 2 - cam.x * cam.z), dpr * (h / 2 - cam.y * cam.z));
    ctx.drawImage(ground, -GOX, -GOY);
    // hover highlight / ghost
    if (hover && tool) {
      var d = DEF[tool] || { size: [1, 1] }, hw = d.size[0], hh = d.size[1], ok = tool === 'demolish' || tool === 'look' || (tool === 'path' ? canPath(hover.x, hover.y) : fits(hover.x, hover.y, hw, hh));
      A.poly(ctx, [A.P(hover.x, hover.y), A.P(hover.x + hw, hover.y), A.P(hover.x + hw, hover.y + hh), A.P(hover.x, hover.y + hh)], ok ? 'rgba(255,255,255,.28)' : 'rgba(200,40,40,.3)', ok ? 'rgba(255,255,255,.8)' : 'rgba(200,40,40,.8)', 1.5);
    }
    // depth-sorted objects and visitors
    var items = [];
    S.objects.forEach(function (o) { items.push({ d: o.x + o.w - 1 + o.y + o.h - 1 + 0.5, o: o }); });
    visitors.forEach(function (v) { if (v.state !== 'inside') items.push({ d: v.x + v.y + 0.6, v: v }); });
    items.push({ d: GATE.x + GATE.y + 0.5, g: 1 });
    if (hover && DEF[tool] && tool !== 'path' && fits(hover.x, hover.y, DEF[tool].size[0], DEF[tool].size[1])) items.push({ d: hover.x + hover.y + DEF[tool].size[0] + DEF[tool].size[1], ghost: 1 });
    items.sort(function (a, b) { return a.d - b.d; });
    items.forEach(function (it) {
      if (it.o) { drawSprite(it.o); drawLive(it.o, t); if (sel && sel.o === it.o) { ctx.strokeStyle = '#f3dfa3'; ctx.lineWidth = 2; A.poly(ctx, [A.P(it.o.x, it.o.y), A.P(it.o.x + it.o.w, it.o.y), A.P(it.o.x + it.o.w, it.o.y + it.o.h), A.P(it.o.x, it.o.y + it.o.h)], null, '#f3dfa3', 2); } }
      else if (it.v) drawVisitor(it.v, t);
      else if (it.g) drawSprite({ type: 'gate', x: GATE.x, y: GATE.y, w: 1, h: 1 });
      else if (it.ghost) { ctx.globalAlpha = 0.6; drawSprite({ type: tool, x: hover.x, y: hover.y, w: DEF[tool].size[0], h: DEF[tool].size[1], seed: 5 }); ctx.globalAlpha = 1; }
    });
    if (warm > 0) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = 'rgba(255,140,60,' + (warm * 0.12).toFixed(3) + ')'; ctx.fillRect(0, 0, w, h); }
  }

  // ---------- tools & input ----------
  var tool = 'look', sel = null;
  function canPath(x, y) { return inb(x, y) && !pathG[idx(x, y)] && (!occ[idx(x, y)] || (objById[occ[idx(x, y)]] && objById[occ[idx(x, y)]].wild)); }
  function placePath(x, y) {
    if (inb(x, y) && objById[occ[idx(x, y)]] && objById[occ[idx(x, y)]].wild) clearWild(x, y, 1, 1);
    if (!canPath(x, y)) return false;
    if (S.coins < DEF.path.cost) { toast(L(V.noMoney)); return false; }
    S.coins -= DEF.path.cost; S.paths.push(idx(x, y)); pathG[idx(x, y)] = 1; groundDirty = true; return true;
  }
  function clearWild(x, y, w, h) { // wild trees are cleared automatically when you build over them
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
    S.coins -= LANDCOST[lv]; S.campaign = DAY * 0.5; toast('⚔️ ' + L(V.marched)); toastT = 5;
  }
  function place(type, x, y) {
    var d = DEF[type];
    if ((d.rank || 1) > (S.rank || 1)) { toast('🔒 ' + L(V.locked)); return; }
    if (inb(x, y) && inb(x + d.size[0] - 1, y + d.size[1] - 1)) clearWild(x, y, d.size[0], d.size[1]);
    if (!fits(x, y, d.size[0], d.size[1])) { toast(L(V.blocked)); return; }
    if (S.coins < d.cost) { toast(L(V.noMoney)); return; }
    var o = { type: type, x: x, y: y, seed: Math.floor(Math.random() * 999) };
    if (d.kind !== 'decor' && !access({ x: x, y: y, w: d.size[0], h: d.size[1] }).length) { toast(L(V.needPath)); return; }
    S.coins -= d.cost; S.objects.push(o); rebuild(); select({ o: objById[o.id] });
    puff(x + d.size[0] / 2, y + d.size[1] / 2);
  }
  function demolish(x, y) {
    if (!inb(x, y)) return;
    var i = idx(x, y), o = objById[occ[i]];
    if (o) {
      o.inside.slice().forEach(function (id) { var v = visitors.find(function (q) { return q.id === id; }); if (v) { v.state = 'walk'; v.target = null; } });
      S.objects.splice(S.objects.indexOf(o), 1); S.coins += Math.floor((DEF[o.type].cost || 0) * 0.5); rebuild(); if (sel && sel.o === o) select(null); return;
    }
    if (pathG[i] === 1) { S.paths.splice(S.paths.indexOf(i), 1); pathG[i] = 0; S.coins += 5; groundDirty = true; }
  }
  var puffs = [];
  function puff(x, y) { puffs.push({ x: x, y: y, t: 0 }); }

  var pointers = {}, drag = null, pinch = null;
  function bindInput() {
    cv.addEventListener('pointerdown', function (e) {
      cv.setPointerCapture(e.pointerId); pointers[e.pointerId] = { x: e.offsetX, y: e.offsetY };
      var ids = Object.keys(pointers);
      if (ids.length === 2) { var a = pointers[ids[0]], b = pointers[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: cam.z }; drag = null; return; }
      drag = { x: e.offsetX, y: e.offsetY, cx: cam.x, cy: cam.y, moved: false, button: e.button, painting: tool === 'path' && e.button === 0 };
      if (drag.painting) { var tt = screenToTile(e.offsetX, e.offsetY); placePath(tt.x, tt.y); }
    });
    cv.addEventListener('pointermove', function (e) {
      if (pointers[e.pointerId]) pointers[e.pointerId] = { x: e.offsetX, y: e.offsetY };
      var t = screenToTile(e.offsetX, e.offsetY); hover = inb(t.x, t.y) ? t : null;
      var ids = Object.keys(pointers);
      if (pinch && ids.length === 2) { var a = pointers[ids[0]], b = pointers[ids[1]]; cam.z = clampZ(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d); return; }
      if (!drag) return;
      var dx = e.offsetX - drag.x, dy = e.offsetY - drag.y;
      if (Math.hypot(dx, dy) > 6) drag.moved = true;
      if (drag.painting) { if (hover) placePath(hover.x, hover.y); return; }
      if (drag.moved) { cam.x = drag.cx - dx / cam.z; cam.y = drag.cy - dy / cam.z; clampCam(); }
    });
    function up(e) {
      delete pointers[e.pointerId];
      if (pinch) { if (Object.keys(pointers).length < 2) pinch = null; drag = null; return; }
      if (drag && !drag.moved && !drag.painting && drag.button === 0) click(e.offsetX, e.offsetY);
      drag = null;
    }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', function () { hover = null; });
    cv.addEventListener('wheel', function (e) { e.preventDefault(); cam.z = clampZ(cam.z * (e.deltaY < 0 ? 1.12 : 0.89)); }, { passive: false });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    D.addEventListener('keydown', function (e) {
      if (/INPUT|SELECT/.test(e.target.tagName) || !S) return;
      if (e.key === 'Escape') { setTool('look'); select(null); }
      if (e.code === 'Space') { e.preventDefault(); setSpeed(speed ? 0 : 1); }
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
    if (tool === 'path') return;
    place(tool, t.x, t.y);
  }

  // ---------- UI ----------
  var $ = function (s, r) { return (r || root).querySelector(s); };
  function shell() {
    root.innerHTML =
      '<div class="f-top">' +
      '<div class="f-brand" id="f-brand"></div>' +
      '<div class="f-stats"><span class="st" id="st-coins"></span><span class="st" id="st-vis"></span><span class="st" id="st-fame"></span><span class="st" id="st-day"></span></div>' +
      '<div class="f-speed" id="f-speed"></div>' +
      '<div class="f-langs" id="f-langs"></div>' +
      '<button class="f-btn" id="f-helpb" type="button" aria-label="Help" title="How to play">?</button>' +
      '<button class="f-btn" id="f-menu" type="button" aria-label="Menu" title="Menu: choose Greece or Rome">☰</button>' +
      '</div>' +
      '<div class="f-main"><div class="f-tools" id="f-tools"></div>' +
      '<div class="f-stage"><canvas id="f-cv" aria-label="Festival grounds"></canvas><div class="f-toast" id="f-toast" aria-live="polite"></div><div class="f-info" id="f-info" hidden></div>' +
      '<div class="f-zoom"><button class="f-btn" id="z-in" type="button" aria-label="Zoom in">＋</button><button class="f-btn" id="z-out" type="button" aria-label="Zoom out">－</button></div></div>' +
      '<aside class="f-side" id="f-side"><h3 id="f-th"></h3><ol class="f-feed" id="f-feed"></ol><h3 id="f-gh"></h3><ul class="f-goals" id="f-goals"></ul><p class="f-note" id="f-note"></p></aside></div>' +
      '<div class="f-start" id="f-start"></div><div class="f-help" id="f-help" hidden></div>';
    cv = $('#f-cv'); ctx = cv.getContext('2d');
    W.addEventListener('resize', resize); resize(); bindInput();
    $('#z-in').onclick = function () { cam.z = clampZ(cam.z * 1.2); };
    $('#z-out').onclick = function () { cam.z = clampZ(cam.z / 1.2); };
    $('#f-menu').onclick = function () { saveGame(); startScreen(); };
    $('#f-helpb').onclick = openHelp;
  }
  function labels() {
    $('#f-brand').innerHTML = (S.setting === 'rome' ? '🏛️ ' : '🏺 ') + '<span class="f-bt">Ancient Festival Tycoon</span>';
    $('#f-speed').innerHTML = [['0', '❚❚', V.pause], ['1', '▶', V.slow], ['3', '▶▶', V.fast]].map(function (s) {
      return '<button type="button" class="f-btn sp' + (String(speed) === s[0] ? ' on' : '') + '" data-sp="' + s[0] + '" title="' + (s[2].e) + '">' + s[1] + '</button>';
    }).join('');
    Array.prototype.forEach.call(root.querySelectorAll('[data-sp]'), function (b) { b.onclick = function () { setSpeed(+b.dataset.sp); }; });
    $('#f-langs').innerHTML = [S.setting === 'rome' ? ['n', 'La', 'Latin'] : ['n', 'Ελ', 'Greek'], ['e', 'En', 'English']].map(function (k) {
      return '<label class="lt lt-' + k[0] + '" title="' + k[2] + '"><input type="checkbox" data-lang="' + k[0] + '"' + (show[k[0]] ? ' checked' : '') + '>' + k[1] + '</label>';
    }).join('');
    Array.prototype.forEach.call(root.querySelectorAll('[data-lang]'), function (c) {
      c.onchange = function () {
        show[c.dataset.lang] = c.checked;
        if (!show.n && !show.e) { show[c.dataset.lang === 'n' ? 'e' : 'n'] = true; }
        saveLangs(); labels(); buildTools(); renderGoals(); feedDirty = true; if (sel) select(sel);
      };
    });
    $('#f-th').innerHTML = L(V.thoughts); $('#f-gh').innerHTML = L(V.goals); $('#f-note').innerHTML = '💾 ' + L(V.saved);
  }
  function buildTools() {
    var h = '<div class="tg"><button type="button" class="tool' + (tool === 'look' ? ' on' : '') + '" data-t="look"><span class="ti">🔍</span>' + L(V.look) + '</button>' +
      '<button type="button" class="tool' + (tool === 'demolish' ? ' on' : '') + '" data-t="demolish"><span class="ti">⛏️</span>' + L(V.demolish) + '</button></div>';
    GROUPS.forEach(function (g) {
      h += '<div class="tg"><h4>' + L(V[g]) + '</h4>';
      Object.keys(DEF).forEach(function (k) {
        var d = DEF[k]; if (d.group !== g) return;
        var lock = (d.rank || 1) > (S.rank || 1);
        h += '<button type="button" class="tool' + (tool === k ? ' on' : '') + (lock ? ' lock' : '') + '" data-t="' + k + '"' + (lock ? ' title="Unlocks at rank ' + d.rank + ': ' + FV.RANKS[d.rank - 1].e + '"' : '') + '>' +
          (k === 'path' ? '<span class="ti">🟫</span>' : '<canvas width="56" height="44" data-icon="' + k + '"></canvas>') +
          '<span class="tn">' + L(B[k]) + '</span><span class="tc' + (lock ? ' lk' : '') + '">' + (lock ? '🔒 ' + d.rank : d.cost) + '</span></button>';
      });
      if (g === 'gCity' && (S.land || 0) < 3) h += '<button type="button" class="tool act' + ((S.rank || 1) < 3 ? ' lock' : '') + '" id="f-expand"><span class="ti">⚔️</span><span class="tn">' + L(V.expand) + '</span><span class="tc' + ((S.rank || 1) < 3 ? ' lk' : '') + '">' + ((S.rank || 1) < 3 ? '🔒 3' : LANDCOST[S.land || 0]) + '</span></button>';
      h += '</div>';
    });
    $('#f-tools').innerHTML = h;
    Array.prototype.forEach.call(root.querySelectorAll('[data-icon]'), function (c) { var d = DEF[c.dataset.icon]; A.icon(c, c.dataset.icon, d.size[0], d.size[1], S.setting); });
    Array.prototype.forEach.call(root.querySelectorAll('.tool'), function (b) { b.onclick = function () { if (b.id === 'f-expand') return expand(); if (b.classList.contains('lock')) return toast('🔒 ' + L(V.locked) + ' <span class="le">' + b.title + '</span>'); setTool(b.dataset.t); }; });
  }
  function setTool(t) {
    tool = t; Array.prototype.forEach.call(root.querySelectorAll('.tool'), function (b) { b.classList.toggle('on', !!b.dataset.t && b.dataset.t === t); });
    if (t !== 'look') select(null);
  }
  function setSpeed(s) { speed = s; labels(); }
  function select(s) {
    sel = s; var box = $('#f-info');
    if (!s) { box.hidden = true; return; }
    box.hidden = false; updateInfo();
  }
  function bar(v, bad) { var c = bad ? (v > 70 ? '#b44b3a' : v > 45 ? '#c9a24a' : '#6f8a47') : (v < 30 ? '#b44b3a' : v < 55 ? '#c9a24a' : '#6f8a47'); return '<span class="bar"><i style="width:' + Math.round(v) + '%;background:' + c + '"></i></span>'; }
  function updateInfo() {
    if (!sel) return; var box = $('#f-info'), h = '<button class="f-x" type="button" aria-label="Close">×</button>';
    if (sel.v) {
      var v = sel.v; if (visitors.indexOf(v) < 0) return select(null);
      var last = feed.find(function (f) { return f.vid === v.id; });
      h += '<div class="ih"><b class="nm">' + v.name + '</b></div>' + (last ? '<div class="iq">' + last.icon + ' ' + L(last.t) + '</div>' : '') +
        '<dl class="needs"><dt>' + L(V.joy) + '</dt><dd>' + bar(v.happy) + '</dd><dt>' + L(V.hunger) + '</dt><dd>' + bar(v.needs.hunger, 1) + '</dd>' +
        '<dt>' + L(V.thirst) + '</dt><dd>' + bar(v.needs.thirst, 1) + '</dd><dt>' + L(V.energy) + '</dt><dd>' + bar(v.needs.energy) + '</dd>' +
        '<dt>' + L(V.fun) + '</dt><dd>' + bar(v.needs.fun) + '</dd><dt>' + L(V.toilet) + '</dt><dd>' + bar(v.needs.toilet, 1) + '</dd>' +
        '<dt>' + L(V.purse) + '</dt><dd>🪙 ' + v.money + '</dd></dl>';
    } else {
      var o = sel.o, d = DEF[o.type];
      if (!objById[o.id]) return select(null);
      h += '<div class="ih"><canvas width="64" height="50" id="info-ic"></canvas><div>' + L(B[o.type], 'big') + '</div></div>';
      if (d.kind === 'civic') h += '<dl class="needs"><dt>' + L(V.upkeep) + '</dt><dd>🪙 ' + d.upkeep + '</dd></dl><p class="le">' + (o.type === 'curia' ? 'The council adds 2 fame every day and is needed for the later campaigns.' : 'Soldiers camp here. With a camp you can send them out to win more land.') + '</p>';
      else if (d.kind !== 'decor') {
        h += '<dl class="needs"><dt>' + L(V.price) + '</dt><dd><input type="range" min="0" max="30" step="1" value="' + o.price + '" id="i-price"> <b id="i-pv">' + (o.price || L(V.free)) + '</b></dd>' +
          '<dt>' + L(V.inside) + '</dt><dd>' + o.inside.length + ' / ' + d.cap + '</dd><dt>' + L(V.served) + '</dt><dd>' + o.served + '</dd>' +
          '<dt>' + L(V.income) + '</dt><dd>🪙 ' + o.income + '</dd><dt>' + L(V.upkeep) + '</dt><dd>🪙 ' + (d.upkeep || 0) + '</dd></dl>' +
          '<button type="button" class="f-btn wide" id="i-open">' + (o.open ? '⛔ ' : '✅ ') + L(V.toggleOpen) + '</button>';
      }
    }
    if (box.dataset.sig !== sigOf()) {
      box.innerHTML = h; box.dataset.sig = sigOf();
      $('.f-x', box).onclick = function () { select(null); };
      if (sel.o) {
        var ic = $('#info-ic'); if (ic) A.icon(ic, sel.o.type, sel.o.w, sel.o.h, S.setting);
        var pr = $('#i-price'); if (pr) pr.oninput = function () { sel.o.price = +pr.value; $('#i-pv').innerHTML = sel.o.price || L(V.free); };
        var op = $('#i-open'); if (op) op.onclick = function () { sel.o.open = !sel.o.open; box.dataset.sig = ''; updateInfo(); };
      }
    } else if (sel.v) { box.innerHTML = h; $('.f-x', box).onclick = function () { select(null); }; }
    else if (DEF[sel.o.type].kind !== 'civic') { var dd = box.querySelectorAll('.needs dd'); if (dd[1]) dd[1].textContent = sel.o.inside.length + ' / ' + DEF[sel.o.type].cap; if (dd[2]) dd[2].textContent = sel.o.served; if (dd[3]) dd[3].textContent = '🪙 ' + sel.o.income; }
  }
  function sigOf() { return sel ? (sel.v ? 'v' + sel.v.id : 'o' + sel.o.id + sel.o.open) + JSON.stringify(show) : ''; }
  function renderFeed() {
    if (!feedDirty) return; feedDirty = false;
    $('#f-feed').innerHTML = feed.slice(0, 18).map(function (f) {
      return '<li><span class="fi">' + f.icon + '</span><div><small class="fn">' + f.v + (f.where ? ' · ' + L(f.where, 'inline') : '') + '</small>' + L(f.t, 'q') + '</div></li>';
    }).join('');
  }
  function renderGoals() {
    if (!S) return;
    var rk = S.rank || 1, nx = FV.RANKS[rk];
    $('#f-goals').innerHTML = '<li class="won">🏅 ' + L(V.rank, 'inline') + ' ' + rk + ': ' + L(FV.RANKS[rk - 1], 'inline') + (nx ? '<br><small class="le">Next: ' + nx.e + ' at ' + nx.need + '</small>' : '') + '</li>' + FV.GOALS.map(function (g) { return '<li class="' + (S.goals[g.id] ? 'won' : '') + '">' + (S.goals[g.id] ? '🌿' : '○') + ' ' + L(g) + '</li>'; }).join('');
  }
  function renderStats() {
    var avg = visitors.length ? visitors.reduce(function (a, v) { return a + v.happy; }, 0) / visitors.length : 0;
    $('#st-coins').innerHTML = '🪙 <b' + (S.coins < 0 ? ' class="neg"' : '') + '>' + Math.floor(S.coins) + '</b> ' + L(V.coins, 'inline');
    $('#st-vis').innerHTML = '👥 <b>' + visitors.length + '</b> ' + L(V.visitors, 'inline');
    $('#st-fame').innerHTML = '🏅 <b>' + (S.rank || 1) + '</b> ⭐ <b>' + Math.round(S.fame) + '</b> ' + L(V.fame, 'inline') + (visitors.length ? ' · 😊 <b>' + Math.round(avg) + '</b>' : '');
    $('#st-day').innerHTML = (S.event ? EVI[S.event] : '☀️') + ' ' + L(V.day, 'inline') + ' <b>' + S.day + '</b><span class="dayp"><i style="width:' + (S.time / DAY * 100).toFixed(0) + '%"></i></span>';
  }
  var toastT = 0;
  function toast(html) { var t = $('#f-toast'); t.innerHTML = html; t.classList.add('on'); toastT = 3.2; }

  // ---------- help ----------
  var helpPrevSpeed = 1;
  function openHelp() {
    helpPrevSpeed = speed; speed = 0; var h = $('#f-help');
    function row(o) { return '<tr><td class="lg">' + (o.g || '') + '</td><td class="ll">' + (o.l || '') + '</td><td>' + (o.e || '') + '</td></tr>'; }
    var bl = Object.keys(DEF).filter(function (k) { return DEF[k].group; }).map(function (k) {
      var d = DEF[k], does = [];
      if (d.fun) does.push(ICON.fun + ' fun'); if (d.hunger) does.push(ICON.hunger + ' food'); if (d.thirst) does.push(ICON.thirst + ' drink');
      if (d.energy > 0) does.push(ICON.energy + ' rest'); if (d.toilet) does.push(ICON.toilet + ' bathroom'); if (d.decor) does.push(ICON.pretty + ' beauty nearby');
      if (k === 'path') does.push('visitors walk on paths');
      return '<tr><td class="lg">' + B[k].g + '</td><td class="ll">' + B[k].l + '</td><td>' + B[k].e + '</td><td>🪙 ' + d.cost + '</td><td>' + d.size[0] + '×' + d.size[1] + '</td><td>' + does.join(', ') + '</td></tr>';
    }).join('');
    h.innerHTML = '<button type="button" class="f-btn close" id="help-x">✕ Close</button>' +
      '<h2>How to play</h2>' +
      '<ol><li>Pick <b>Greece</b> or <b>Rome</b> on the start screen (☰ brings it back any time).</li>' +
      '<li>Choose the <b>path</b> tool and drag across the grass to lay paths from the entrance gate. Visitors only walk on paths.</li>' +
      '<li>Pick a building from the left panel and click the map to place it. Every building (except scenery) must <b>touch a path</b>. Trees in the way are cleared automatically.</li>' +
      '<li>Visitors pay the entrance fee, then look for what they need. Keep them fed, watered, rested and entertained, and give them latrines.</li>' +
      '<li>Use the <b>🔍 Inspect</b> tool to click a building (set its price, open or close it) or a visitor (see their needs and last thought).</li>' +
      '<li>Happy visitors raise your <b>fame</b> (⭐), which brings more visitors. Each day, buildings cost upkeep, so watch your coins.</li></ol>' +
      '<h3>Controls</h3><ul><li><b>Move:</b> drag the map (on a phone, drag with one finger while Inspect is selected).</li><li><b>Zoom:</b> mouse wheel, pinch, or the ＋/－ buttons.</li>' +
      '<li><b>Speed:</b> ❚❚ pause, ▶ normal, ▶▶ fast. Space bar pauses too.</li><li><b>Languages:</b> Greece is played in Greek and Rome in Latin; the two switches at the top turn that language and the English on or off.</li><li><b>Ranks:</b> as more visitors come and your fame grows you rise from citizen to market overseer, magistrate and general. Each rank unlocks buildings marked 🔒.</li><li><b>More land:</b> from rank 3, build an army camp and press ⚔️ to send the soldiers out. Half a day later the boundary moves outward. Later campaigns also need a council house.</li><li><b>Each day is different:</b> rain keeps people home, feast days bring crowds, a famous athlete lifts your fame, and now and then the tax collector calls. Greek is blue, Latin is red, English is small and grey.</li>' +
      '<li><b>Esc</b> returns to the Inspect tool.</li></ul>' +
      '<h3>Visitor needs</h3><p>' + ICON.hunger + ' hunger → bread stall · ' + ICON.thirst + ' thirst → tavern or fountain · ' + ICON.toilet + ' bathroom → latrine or baths · ' + ICON.energy + ' tiredness → bench or baths · ' + ICON.fun + ' boredom → attractions. If a price is higher than a visitor thinks fair, they walk away. Scenery (' + ICON.pretty + ') near paths makes visitors happier.</p>' +
      '<h3>Buildings</h3><table><thead><tr><th>Greek</th><th>Latin</th><th>English</th><th>Cost</th><th>Size</th><th>Gives</th></tr></thead><tbody>' + bl + '</tbody></table>' +
      '<h3>Word list: what visitors say</h3><table><thead><tr><th>Greek</th><th>Latin</th><th>English</th></tr></thead><tbody>' + Object.keys(T).map(function (k) { return row(T[k]); }).join('') + '</tbody></table>' +
      '<h3>Word list: buttons and labels</h3><table><thead><tr><th>Greek</th><th>Latin</th><th>English</th></tr></thead><tbody>' + Object.keys(V).map(function (k) { return row(V[k]); }).join('') + '</tbody></table>' +
      '<h3>Saving</h3><p>There is no account. Your festival saves automatically in this browser only (one for Greece, one for Rome). Clearing browser data or using a private window starts over.</p>';
    h.hidden = false; h.scrollTop = 0;
    $('#help-x').onclick = function () { h.hidden = true; speed = helpPrevSpeed; if (S) labels(); };
  }

  // ---------- start screen & saving ----------
  function saveKey(s) { return 'panegyris-v1-' + s; }
  function saveGame() {
    if (!S) return;
    var o = JSON.parse(JSON.stringify(S, function (k, v) { return k === 'inside' ? undefined : v; }));
    try { W.localStorage.setItem(saveKey(S.setting), JSON.stringify(o)); } catch (e) { }
  }
  function loadGame(s) {
    var o; try { o = JSON.parse(W.localStorage.getItem(saveKey(s))); } catch (e) { return null; }
    if (o && !o.v) { // a festival saved on the old 28-tile map: move it onto the middle plot of the bigger one
      o.paths = o.paths.map(function (i) { return ((i / 28 | 0) + 16) * N + (i % 28) + 8; });
      o.objects.forEach(function (q) { q.x += 8; q.y += 16; });
      var r = A.mulberry(21); for (var i = 0; i < 45; i++) { var tx = Math.floor(r() * N), ty = Math.floor(r() * N); if (tx < 8 || tx > 35 || ty < 16) o.objects.push({ type: r() < 0.6 ? 'olive' : 'cypress', x: tx, y: ty, seed: Math.floor(r() * 1000), wild: 1 }); }
      o.v = 2; o.land = 0; o.rank = 1;
    }
    return o;
  }
  function saveLangs() { try { W.localStorage.setItem('panegyris-langs', JSON.stringify(show)); } catch (e) { } }
  (function () { try { var l = JSON.parse(W.localStorage.getItem('panegyris-langs')); if (l && ('n' in l) && (l.n || l.e)) show = { n: !!l.n, e: !!l.e }; } catch (e) { } })();
  function startScreen() {
    speed = 0; var st = $('#f-start'); st.hidden = false;
    var card = function (s, emoji) {
      var sv = loadGame(s); forceLang = s === 'rome' ? 'l' : 'g';
      var h = '<div class="sc sc-' + s + '"><div class="se">' + emoji + '</div>' + L(V[s], 'big') +
        '<button type="button" class="f-btn prim" data-new="' + s + '">' + L(V.newGame) + '</button>' +
        (sv ? '<button type="button" class="f-btn" data-go="' + s + '">' + L(V.resume) + ' · ' + L(V.day, 'inline') + ' ' + sv.day + '</button>' : '') + '</div>';
      forceLang = null; return h;
    };
    st.innerHTML = '<div class="sbox"><h2>' + 'Ancient Festival Tycoon' + '</h2>' +
      '<div class="scs">' + card('greece', '🏺') + card('rome', '🏛️') + '</div>' +
      '<p class="sp">Greece is played in Greek and Rome in Latin.</p><div class="slang"><span id="s-langs"></span></div>' +
      '<p><button type="button" class="f-btn" id="s-help">? How to play</button></p>' +
      '<p class="snote">No account and nothing uploaded: your festival is saved only in this browser on this device. Clearing browser data or using a private window starts over.</p></div>';
    $('#s-langs').innerHTML = [['n', 'Show the Greek or Latin'], ['e', 'Show English']].map(function (k) {
      return '<label class="lt lt-' + k[0] + '"><input type="checkbox" data-sl="' + k[0] + '"' + (show[k[0]] ? ' checked' : '') + '> ' + k[1] + '</label>';
    }).join('');
    Array.prototype.forEach.call(st.querySelectorAll('[data-sl]'), function (c) { c.onchange = function () { show[c.dataset.sl] = c.checked; if (!show.n && !show.e) { show[c.dataset.sl === 'n' ? 'e' : 'n'] = true; } saveLangs(); startScreen(); }; });
    $('#s-help').onclick = openHelp;
    Array.prototype.forEach.call(st.querySelectorAll('[data-new]'), function (b) { b.onclick = function () { begin(newState(b.dataset.new)); }; });
    Array.prototype.forEach.call(st.querySelectorAll('[data-go]'), function (b) { b.onclick = function () { begin(loadGame(b.dataset.go)); }; });
  }
  function begin(state) {
    S = state; visitors = []; feed = []; sel = null; todayIncome = 0; simClock = 0;
    rebuild(); $('#f-start').hidden = true; setTool('look'); speed = 1;
    var c0 = A.P(GATE.x, N - 9, 0); cam = { x: c0[0], y: c0[1], z: W.innerWidth < 700 ? 0.85 : 1.05 };
    labels(); buildTools(); renderGoals(); feedDirty = true; root.classList.toggle('rome', S.setting === 'rome');
  }

  // ---------- main loop ----------
  var lastT = 0, uiAcc = 0, goalAcc = 0;
  function frame(ts) {
    var t = ts / 1000, real = Math.min(0.1, t - (lastT || t)); lastT = t;
    if (S) {
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
  W.__fest = { get S() { return S; }, get visitors() { return visitors; }, place: place, placePath: placePath, begin: begin, newState: newState, setSpeed: setSpeed, step: step };
})(window, document);

/* Being an Adult 101: step ticks and the skills checklist (this browser only), printing, and the small calculators. */
(function (W, D) {
  'use strict';
  var $ = function (id) { return D.getElementById(id); };
  var KEY = 'trb-adult-v1', st = { done: {}, learned: {} };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) { st.done = sv.done || {}; st.learned = sv.learned || {}; } } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function cnt(o) { var c = 0; for (var k in o) if (o[k]) c++; return c; }

  // ---------- hub: progress on cards, skills checklist ----------
  D.querySelectorAll('.os-card[data-skill]').forEach(function (a) {
    var c = cnt(st.done[a.dataset.skill] || {}), p = a.querySelector('.os-prog');
    if (st.learned[a.dataset.skill]) { p.hidden = false; p.textContent = '✓ Learned'; }
    else if (c) { p.hidden = false; p.textContent = c + ' of ' + a.dataset.n + ' steps done'; }
  });
  D.querySelectorAll('[data-learned]').forEach(function (b) {
    b.checked = !!st.learned[b.dataset.learned];
    b.addEventListener('change', function () { if (b.checked) st.learned[b.dataset.learned] = 1; else delete st.learned[b.dataset.learned]; save(); });
  });
  function printAs(cls) { D.body.classList.add(cls); W.print(); setTimeout(function () { D.body.classList.remove(cls); }, 600); }
  if ($('ad-print-list')) $('ad-print-list').addEventListener('click', function () { printAs('ad-printing-list'); });
  if ($('ad-print')) $('ad-print').addEventListener('click', function () { printAs('ad-printing-check'); });

  // ---------- guide: step ticks ----------
  var root = $('os-skill');
  if (root) {
    var key = root.dataset.skill, mine = st.done[key] || (st.done[key] = {});
    root.querySelectorAll('.os-steps input').forEach(function (b) {
      b.checked = !!mine[b.dataset.i]; b.closest('li').classList.toggle('ticked', b.checked);
      b.addEventListener('change', function () { if (b.checked) mine[b.dataset.i] = 1; else delete mine[b.dataset.i]; save(); b.closest('li').classList.toggle('ticked', b.checked); });
    });
  }

  // ---------- calculators ----------
  var box = $('ad-calc'); if (!box) return;
  function num(x, d) { return (+x || 0).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function usd(x) { var neg = x < 0; return (neg ? '−$' : '$') + num(Math.abs(x), 2); }
  function n1(x) { return num(x, Math.round(x) === x ? 0 : 1); }
  function pct(x, d) { return num(x, d === undefined ? 1 : d) + '%'; }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function nice(d) { return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }); }
  function parseDate(s) { var p = String(s || '').split('-'); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null; }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function bar(p, mark) { return '<div class="ad-barv"><span style="width:' + Math.max(0, Math.min(100, p)) + '%"></span>' + (mark ? '<i style="left:' + mark + '%"></i>' : '') + '</div>'; }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var BR26 = [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [640600, 0.35], [Infinity, 0.37]];

  var C = {
    'reset-a-breaker': { t: 'Circuit load calculator', p: 'Add up what runs on one circuit. Find the watts on each appliance’s label.',
      f: [{ id: 'amps', l: 'Breaker size', type: 'sel', o: [['15', '15 amps'], ['20', '20 amps']], v: '15' },
        { id: 'apps', type: 'rows', l: 'Running at the same time', cols: [{ id: 'name', l: 'Appliance', type: 'text' }, { id: 'w', l: 'Watts', type: 'num' }], v: [['Space heater', 1500], ['Microwave', 1000], ['', ''], ['', '']] }],
      o: function (v) {
        var w = v.apps.reduce(function (a, r) { return a + (+r.w || 0); }, 0), a = w / 120, lim = 120 * v.amps;
        return '<p>Total: <b>' + num(w) + ' watts</b> ÷ 120 volts = <span class="big">' + num(a, 1) + ' amps</span></p><p>A ' + v.amps + '-amp circuit can carry 120 × ' + v.amps + ' = ' + num(lim) + ' watts.</p>' +
          (a > v.amps ? '<p class="warn">That’s more than the circuit can carry, so the breaker would trip. Move something to a different circuit.</p>' : '<p class="ok">That’s within the circuit’s limit.</p>') + '<p class="ad-note">Uses 120 volts, the standard for regular U.S. outlets.</p>';
      } },
    'shut-off-the-water': { t: 'Water pressure from height', p: 'Each foot of water above you adds about 0.433 psi.',
      f: [{ id: 'h', l: 'Height of the water above the faucet (feet)', type: 'num', v: 115 }, { id: 'p', l: 'Or: pressure you want (psi)', type: 'num', v: 60 }],
      o: function (v) { return '<p>' + num(v.h) + ' feet × 0.433 = <span class="big">' + num(v.h * 0.433, 1) + ' psi</span></p><p>For ' + num(v.p) + ' psi you’d need about ' + num(v.p / 0.433) + ' feet of water: ' + num(v.p) + ' ÷ 0.433.</p>'; } },
    'fix-a-running-toilet': { t: 'What a leak costs', p: 'Find the price of water on your water bill, often given per 1,000 gallons.',
      f: [{ id: 'g', l: 'Gallons leaked per day (a guess)', type: 'num', v: 25 }, { id: 'c', l: 'Price per 1,000 gallons ($)', type: 'num', v: 5 }],
      o: function (v) { var m = v.g * 30, y = v.g * 365; return '<p>Per month: <b>' + num(m) + ' gallons</b>, about ' + usd(m / 1000 * v.c) + '</p><p>Per year: <span class="big">' + num(y) + ' gallons</span>, about ' + usd(y / 1000 * v.c) + '</p>'; } },
    'test-smoke-and-co-alarms': { t: 'When to replace a smoke alarm', p: 'The date it was made is printed on the back.',
      f: [{ id: 'y', l: 'Year the smoke alarm was made', type: 'num', v: today.getFullYear() - 8 }],
      o: function (v) { var r = Math.round(v.y) + 10; return '<p>Replace it by <span class="big">' + r + '</span>: ' + Math.round(v.y) + ' + 10.</p>' + (r <= today.getFullYear() ? '<p class="warn">It’s due now. Replace it.</p>' : '<p class="ok">' + (r - today.getFullYear()) + ' year' + (r - today.getFullYear() === 1 ? '' : 's') + ' to go.</p>') + '<p class="ad-note">For CO alarms, use the replacement time in the alarm’s manual.</p>'; } },
    'change-an-air-filter': { t: 'Next filter change and savings', p: 'Use the interval on your filter’s package.',
      f: [{ id: 'd', l: 'Date you changed it', type: 'date', v: iso(today) }, { id: 'n', l: 'Change every (days)', type: 'num', v: 90 }, { id: 'c', l: 'Monthly cooling cost ($)', type: 'num', v: 100 }],
      o: function (v) { var d = parseDate(v.d); return (d ? '<p>Next change: <span class="big">' + nice(addDays(d, Math.round(v.n))) + '</span></p>' : '') + '<p>A clean filter can cut an air conditioner’s energy use by 5% to 15%: about ' + usd(v.c * 0.05) + ' to ' + usd(v.c * 0.15) + ' a month.</p>'; } },
    'hang-a-picture': { t: 'Where the hook goes', p: 'Measure in inches. Pull the wire tight before you measure it.',
      f: [{ id: 'top', l: 'Height you want for the top of the frame', type: 'num', v: 64 }, { id: 'wire', l: 'Tight wire to top of frame', type: 'num', v: 4 }, { id: 'wall', l: 'Wall width', type: 'num', v: 120 }, { id: 'pic', l: 'Picture width', type: 'num', v: 24 }, { id: 'sp', l: 'Two hooks? Space between them (0 = one hook)', type: 'num', v: 0 }],
      o: function (v) { var c = v.wall / 2; return '<p>Hook height: ' + n1(v.top) + ' − ' + n1(v.wire) + ' = <span class="big">' + n1(v.top - v.wire) + ' inches</span> from the floor</p><p>To center it, measure ' + n1(c) + ' inches from the left end of the wall. The frame’s left edge lands at ' + n1(c - v.pic / 2) + ' inches.</p>' + (v.sp > 0 ? '<p>Two hooks: at ' + n1(c - v.sp / 2) + ' and ' + n1(c + v.sp / 2) + ' inches from the left end.</p>' : ''); } },
    'check-tires': { t: 'Tire pressure and temperature', p: 'An estimate using about 1 psi for every 10 degrees. Always set pressure cold, to the number on the door label.',
      f: [{ id: 'p', l: 'Cold reading (psi)', type: 'num', v: 35 }, { id: 't1', l: 'Temperature when measured (°F)', type: 'num', v: 70 }, { id: 't2', l: 'New temperature (°F)', type: 'num', v: 40 }],
      o: function (v) { var e = v.p + (v.t2 - v.t1) / 10; return '<p>Estimated pressure: <span class="big">' + num(e, 1) + ' psi</span></p><p>A change of ' + num(Math.abs(v.t2 - v.t1)) + ' degrees moves it about ' + num(Math.abs(v.t2 - v.t1) / 10, 1) + ' psi.</p>'; } },
    'change-a-flat-tire': { t: 'Lug wrench torque', p: 'Torque = how hard you push × how far your hand is from the nut.',
      f: [{ id: 'f', l: 'Push (pounds)', type: 'num', v: 50 }, { id: 'in', l: 'Hand to nut (inches)', type: 'num', v: 14 }, { id: 'tq', l: 'Torque in your manual (pound-feet)', type: 'num', v: 80 }],
      o: function (v) { var ft = v.in / 12; return '<p>' + num(v.f) + ' pounds × ' + num(ft, 2) + ' feet = <span class="big">' + num(v.f * ft) + ' pound-feet</span></p>' + (ft > 0 ? '<p>To reach ' + num(v.tq) + ' pound-feet with this wrench, you’d push about ' + num(v.tq / ft) + ' pounds. A longer handle needs less push.</p>' : ''); } },
    'change-your-oil': { t: 'Next oil change', p: 'Use the interval in your owner’s manual.',
      f: [{ id: 'odo', l: 'Odometer now (miles)', type: 'num', v: 45000 }, { id: 'mi', l: 'Change every (miles)', type: 'num', v: 7500 }, { id: 'mo', l: 'Or every (months)', type: 'num', v: 6 }],
      o: function (v) { var d = new Date(today.getTime()); d.setMonth(d.getMonth() + Math.round(v.mo)); return '<p>Next change at <span class="big">' + num(v.odo + v.mi) + ' miles</span></p>' + (v.mo > 0 ? '<p>or by ' + nice(d) + ', whichever comes first if your manual gives both.</p>' : ''); } },
    'read-a-paycheck': { t: 'Social Security and Medicare estimate', p: 'Estimate only: it leaves out income tax and other deductions. 2026 figures.',
      f: [{ id: 'g', l: 'Gross pay this paycheck ($)', type: 'num', v: 1000 }, { id: 'ytd', l: 'Wages so far this year, before this check ($)', type: 'num', v: 0 }],
      o: function (v) {
        var ssBase = Math.max(0, Math.min(v.g, 184500 - v.ytd)), ss = ssBase * 0.062, med = v.g * 0.0145, add = Math.max(0, v.ytd + v.g - Math.max(200000, v.ytd)) * 0.009, t = ss + med + add;
        return '<table><tr><td>Social Security (6.2%)</td><td class="r">' + usd(ss) + '</td></tr><tr><td>Medicare (1.45%)</td><td class="r">' + usd(med) + '</td></tr>' + (add ? '<tr><td>Additional Medicare (0.9%)</td><td class="r">' + usd(add) + '</td></tr>' : '') + '<tr><th>Total FICA</th><th class="r">' + usd(t) + '</th></tr><tr><th>Gross minus FICA</th><th class="r">' + usd(v.g - t) + '</th></tr></table><p class="ad-note">Your real net pay will be lower because of federal and state income tax and any other deductions.</p>';
      } },
    'make-a-budget': { t: 'Monthly budget worksheet', p: 'Use take-home pay. Mark each line as a need, a want or savings.',
      f: [{ id: 'inc', l: 'Take-home pay per month ($)', type: 'num', v: 2000 },
        { id: 'r', type: 'rows', l: 'Spending and saving', cols: [{ id: 'n', l: 'What', type: 'text' }, { id: 'a', l: '$ a month', type: 'num' }, { id: 'k', l: 'Kind', type: 'sel', o: [['need', 'Need'], ['want', 'Want'], ['save', 'Savings']] }],
          v: [['Rent', 900, 'need'], ['Groceries', 300, 'need'], ['Transportation', 150, 'need'], ['Utilities', 100, 'need'], ['Phone', 50, 'need'], ['Savings', 200, 'save'], ['Fun and eating out', 300, 'want'], ['', '', 'want']] }],
      o: function (v) {
        var s = { need: 0, want: 0, save: 0 }; v.r.forEach(function (x) { s[x.k] += +x.a || 0; });
        var left = v.inc - s.need - s.want - s.save, P = function (x) { return v.inc ? x / v.inc * 100 : 0; };
        return [['need', 'Needs'], ['want', 'Wants'], ['save', 'Savings']].map(function (k) { return '<p>' + k[1] + ': <b>' + usd(s[k[0]]) + '</b> (' + pct(P(s[k[0]]), 0) + ' of income)</p>' + bar(P(s[k[0]])); }).join('') +
          '<p>Left over: <span class="big">' + usd(left) + '</span></p>' + (left < 0 ? '<p class="warn">You’re planning to spend more than you take home. Look at flexible spending first.</p>' : '');
      } },
    'use-a-bank-account': { t: 'Running balance', p: 'Each new balance is the last one plus money in, minus money out.',
      f: [{ id: 'b', l: 'Starting balance ($)', type: 'num', v: 250 },
        { id: 'r', type: 'rows', l: 'Transactions', cols: [{ id: 'n', l: 'What', type: 'text' }, { id: 'a', l: 'Amount ($)', type: 'num' }, { id: 'k', l: 'In or out', type: 'sel', o: [['in', 'In (+)'], ['out', 'Out (−)']] }],
          v: [['Paycheck', 833.5, 'in'], ['Groceries', 46.25, 'out'], ['ATM', 40, 'out'], ['Phone bill', 50, 'out'], ['ATM fee', 3, 'out'], ['', '', 'out']] }],
      o: function (v) {
        var b = v.b, rows = v.r.filter(function (x) { return +x.a; }).map(function (x) { b += (x.k === 'in' ? 1 : -1) * x.a; return '<tr><td>' + (x.n || '—') + '</td><td class="r">' + (x.k === 'in' ? '+' : '−') + usd(+x.a) + '</td><td class="r">' + usd(b) + '</td></tr>'; });
        return '<table><tr><th>Transaction</th><th class="r">Amount</th><th class="r">Balance</th></tr><tr><td>Start</td><td></td><td class="r">' + usd(v.b) + '</td></tr>' + rows.join('') + '</table><p>Balance now: <span class="big">' + usd(b) + '</span></p>' + (b < 0 ? '<p class="warn">That’s below zero, which can mean overdraft fees or declined payments.</p>' : '');
      } },
    'how-interest-works': { t: 'Compound interest and credit card payoff', p: 'Estimates for learning. Real accounts and cards have more details.',
      f: [{ type: 'h', l: 'Savings' }, { id: 'P', l: 'Starting amount ($)', type: 'num', v: 1000 }, { id: 'r', l: 'Yearly rate (%)', type: 'num', v: 5 }, { id: 'n', l: 'Compounded', type: 'sel', o: [['1', 'Yearly'], ['4', 'Quarterly'], ['12', 'Monthly'], ['365', 'Daily']], v: '12' }, { id: 't', l: 'Years', type: 'num', v: 10 }, { id: 'dep', l: 'Added each month ($)', type: 'num', v: 0 },
        { type: 'h', l: 'Credit card' }, { id: 'bal', l: 'Balance ($)', type: 'num', v: 1000 }, { id: 'apr', l: 'APR (%)', type: 'num', v: 24 }, { id: 'p1', l: 'Payment A per month ($)', type: 'num', v: 25 }, { id: 'p2', l: 'Payment B per month ($)', type: 'num', v: 100 }],
      o: function (v) {
        var r = v.r / 100, n = +v.n, A;
        if (v.dep > 0) { var mr = Math.pow(1 + r / n, n / 12) - 1, m = Math.round(v.t * 12); A = v.P; for (var i = 0; i < m; i++) A = A * (1 + mr) + v.dep; }
        else A = v.P * Math.pow(1 + r / n, n * v.t);
        var put = v.P + v.dep * Math.round(v.t * 12), simple = v.P * (1 + r * v.t), apy = (Math.pow(1 + r / n, n) - 1) * 100;
        function pay(p) {
          var b = v.bal, mo = 0, int = 0, mr2 = v.apr / 100 / 12;
          if (p <= b * mr2) return '<p class="warn">' + usd(p) + ' a month doesn’t cover the interest, so the balance would never go down.</p>';
          while (b > 0.005 && mo < 1200) { var i2 = b * mr2; int += i2; b = b + i2 - p; mo++; }
          return '<p>Paying ' + usd(p) + ' a month: <b>' + mo + ' months</b> (' + num(mo / 12, 1) + ' years), about <b>' + usd(int) + '</b> in interest.</p>';
        }
        return '<p>After ' + num(v.t) + ' years: <span class="big">' + usd(A) + '</span></p><p>You put in ' + usd(put) + '; interest earned ' + usd(A - put) + '.' + (v.dep > 0 ? '' : ' With simple interest you’d have ' + usd(simple) + '.') + ' APY: ' + pct(apy, 2) + '.</p><hr>' + pay(v.p1) + pay(v.p2);
      } },
    'credit-reports-and-scores': { t: 'Credit utilization', p: 'The share of your available credit that you’re using. It’s one of several things scores look at.',
      f: [{ id: 'r', type: 'rows', l: 'Cards', cols: [{ id: 'n', l: 'Card', type: 'text' }, { id: 'b', l: 'Balance ($)', type: 'num' }, { id: 'lim', l: 'Limit ($)', type: 'num' }], v: [['Card 1', 300, 1000], ['Card 2', 100, 500], ['', '', '']] }],
      o: function (v) {
        var tb = 0, tl = 0, out = v.r.filter(function (x) { return +x.lim; }).map(function (x) { tb += +x.b || 0; tl += +x.lim; var u = (+x.b || 0) / x.lim * 100; return '<p>' + (x.n || 'Card') + ': ' + pct(u, 0) + '</p>' + bar(u, 30); }).join('');
        var u = tl ? tb / tl * 100 : 0;
        return out + '<p>Overall: ' + usd(tb) + ' ÷ ' + usd(tl) + ' = <span class="big">' + pct(u, 0) + '</span></p>' + bar(u, 30) + '<p class="ad-note">The red mark is 30%, the level experts cited by the CFPB suggest staying under.</p>';
      } },
    'file-your-taxes': { t: 'How the brackets add up', p: 'Tax year 2026, single filer. A learning tool only: it leaves out credits, other income and other deductions.',
      f: [{ id: 'w', l: 'Wages for the year ($)', type: 'num', v: 40000 }, { id: 'dep', l: 'Someone can claim me as a dependent', type: 'chk', v: false }],
      o: function (v) {
        var sd = v.dep ? Math.min(16100, Math.max(1350, v.w + 450)) : 16100, ti = Math.max(0, v.w - sd), lo = 0, tax = 0, top = 0, rows = '';
        BR26.forEach(function (b) { if (ti > lo) { var part = Math.min(ti, b[0]) - lo, t = part * b[1]; tax += t; top = b[1]; rows += '<tr><td>' + pct(b[1] * 100, 0) + ' on ' + usd(part).replace('.00', '') + '</td><td class="r">' + usd(t) + '</td></tr>'; } lo = b[0]; });
        return '<p>Standard deduction: ' + usd(sd).replace('.00', '') + ' · Taxable income: <b>' + usd(ti).replace('.00', '') + '</b></p><table>' + rows + '<tr><th>Total tax</th><th class="r">' + usd(tax) + '</th></tr></table><p>Top (marginal) rate: <b>' + pct(top * 100, 0) + '</b> · Average rate: <span class="big">' + pct(v.w ? tax / v.w * 100 : 0) + '</span> of wages</p>';
      } },
    'insurance-basics': { t: 'Compare two deductibles', p: 'Made-up numbers to start; type in real quotes.',
      f: [{ id: 'pa', l: 'Plan A yearly premium ($)', type: 'num', v: 1200 }, { id: 'da', l: 'Plan A deductible ($)', type: 'num', v: 500 }, { id: 'pb', l: 'Plan B yearly premium ($)', type: 'num', v: 950 }, { id: 'db', l: 'Plan B deductible ($)', type: 'num', v: 1000 }, { id: 'k', l: 'Claims in a year', type: 'num', v: 1 }, { id: 's', l: 'Size of each claim ($)', type: 'num', v: 3000 }],
      o: function (v) {
        var a = v.pa + v.k * Math.min(v.da, v.s), b = v.pb + v.k * Math.min(v.db, v.s);
        return '<p>Plan A: <b>' + usd(a) + '</b> · Plan B: <b>' + usd(b) + '</b></p><p class="big">' + (a === b ? 'They cost the same.' : (a < b ? 'Plan A' : 'Plan B') + ' costs ' + usd(Math.abs(a - b)) + ' less this year.') + '</p><p class="ad-note">Each claim costs you the deductible, or the whole claim if it’s smaller.</p>';
      } },
    'safe-cooking-temperatures': { t: 'Safe temperature finder', p: 'USDA safe minimum internal temperatures.',
      f: [{ id: 'food', l: 'Food', type: 'sel', o: [['p', 'Poultry (chicken, turkey)'], ['g', 'Ground beef, pork, veal or lamb'], ['w', 'Steaks, roasts and chops'], ['f', 'Fish'], ['e', 'Egg dishes and casseroles with egg'], ['l', 'Leftovers and casseroles'], ['h', 'Raw ham']], v: 'p' }],
      o: function (v) {
        var T = { p: ['165 °F', '', 'The thickest part of the breast, and the innermost thigh and wing of a whole bird.'], g: ['160 °F', '', 'From the side into the center of a patty.'], w: ['145 °F', 'then rest 3 minutes', 'The thickest part, away from bone, fat and gristle.'], f: ['145 °F', '', 'The thickest part. Done fish is opaque and flakes with a fork.'], e: ['160 °F', '', 'The center, then a few other spots.'], l: ['165 °F', '', 'The center and a few other spots. Bring sauces, soups and gravy to a rolling boil.'], h: ['145 °F', 'then rest 3 minutes', 'The thickest part.'] }[v.food];
        return '<p>Cook to <span class="big">' + T[0] + '</span> ' + T[1] + '</p><p>Where: ' + T[2] + '</p>';
      } },
    'store-leftovers': { t: 'Leftover timer', p: 'When food came off the heat, and how long it can wait.',
      f: [{ id: 'tm', l: 'Time it came off the heat', type: 'time', v: ('0' + new Date().getHours()).slice(-2) + ':' + ('0' + new Date().getMinutes()).slice(-2) }, { id: 'd', l: 'Date cooked', type: 'date', v: iso(today) }, { id: 'hot', l: 'It’s above 90 °F where the food is', type: 'chk', v: false }],
      o: function (v) {
        var p = String(v.tm || '0:0').split(':'), d = new Date(), dd = parseDate(v.d); d.setHours(+p[0] + (v.hot ? 1 : 2), +p[1] || 0, 0, 0);
        return '<p>Refrigerate by <span class="big">' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + '</span></p>' + (dd ? '<p>Eat or freeze by <b>' + nice(addDays(dd, 4)) + '</b> (leftovers keep 3 to 4 days in the fridge; sooner is better).</p>' : '');
      } },
    'knife-basics': { t: 'Pressure: sharp edge vs dull edge', p: 'Pressure = force ÷ area. Made-up numbers to play with.',
      f: [{ id: 'f', l: 'Push (pounds)', type: 'num', v: 5 }, { id: 'a1', l: 'Sharp edge area (square inches)', type: 'num', v: 0.01, step: 'any' }, { id: 'a2', l: 'Dull edge area (square inches)', type: 'num', v: 0.1, step: 'any' }],
      o: function (v) { return '<p>Sharp: ' + num(v.f, 1) + ' ÷ ' + v.a1 + ' = <span class="big">' + num(v.a1 ? v.f / v.a1 : 0) + ' psi</span></p><p>Dull: ' + num(v.f, 1) + ' ÷ ' + v.a2 + ' = <b>' + num(v.a2 ? v.f / v.a2 : 0) + ' psi</b></p>' + (v.a1 && v.a2 ? '<p>The sharp edge presses ' + num(v.a2 / v.a1, 1) + ' times harder with the same push.</p>' : ''); } },
    'cook-three-staples': { t: 'How much water', p: 'From the rice and pasta steps. Check your package too.',
      f: [{ id: 'rc', l: 'Dry rice (cups)', type: 'num', v: 1, step: 'any' }, { id: 'rt', l: 'Kind of rice', type: 'sel', o: [['w', 'Long-grain white'], ['b', 'Brown']], v: 'w' }, { id: 'pl', l: 'Dry pasta (pounds)', type: 'num', v: 1, step: 'any' }],
      o: function (v) { var lo = v.rt === 'w' ? 1.75 : 2, hi = v.rt === 'w' ? 2 : 2.5; return '<p>Rice: <b>' + num(v.rc * lo, 2) + ' to ' + num(v.rc * hi, 2) + ' cups of water</b>, for about ' + num(v.rc * 3, 1) + ' cups of cooked rice.</p><p>Pasta: <span class="big">about ' + num(v.pl * 4, 1) + ' quarts of water</span></p>'; } },
    'rent-a-place': { t: 'Rent check', p: 'HUD calls a household cost burdened when housing, including utilities, takes more than 30% of income.',
      f: [{ id: 'inc', l: 'Monthly income ($)', type: 'num', v: 2000 }, { id: 'rent', l: 'Monthly rent ($)', type: 'num', v: 600 }, { id: 'ut', l: 'Utilities per month ($)', type: 'num', v: 100 }, { id: 'dep', l: 'Security deposit ($)', type: 'num', v: 600 }, { id: 'fee', l: 'Other move-in fees ($)', type: 'num', v: 0 }],
      o: function (v) { var t = v.rent + v.ut, p = v.inc ? t / v.inc * 100 : 0; return '<p>30% of income: <b>' + usd(v.inc * 0.3) + '</b> · Housing: <b>' + usd(t) + '</b></p><p>Housing takes <span class="big">' + pct(p, 0) + '</span> of income</p>' + bar(p, 30) + (p > 30 ? '<p class="warn">That’s over 30%.</p>' : '<p class="ok">That’s at or under 30%.</p>') + '<p>Cash to move in: first month ' + usd(v.rent) + ' + deposit ' + usd(v.dep) + ' + fees ' + usd(v.fee) + ' = <b>' + usd(v.rent + v.dep + v.fee) + '</b></p>'; } },
    'apply-for-a-job': { t: 'Weekly pay and hour limits', p: 'Gross pay = hourly wage × hours. Federal limits shown for ages 14 and 15; state rules may be stricter.',
      f: [{ id: 'w', l: 'Hourly wage ($)', type: 'num', v: 12, step: 'any' }, { id: 'h', l: 'Hours this week', type: 'num', v: 18 }, { id: 'age', l: 'Age', type: 'sel', o: [['y', '14 or 15'], ['t', '16 or 17'], ['a', '18 or older']], v: 'y' }, { id: 'sch', l: 'It’s a school week', type: 'chk', v: true }],
      o: function (v) { var lim = v.sch ? 18 : 40; return '<p>Gross pay: <span class="big">' + usd(v.w * v.h) + '</span> before taxes</p>' + (v.age === 'y' ? (v.h > lim ? '<p class="warn">Over the federal limit of ' + lim + ' hours in a ' + (v.sch ? 'school' : 'non-school') + ' week for 14- and 15-year-olds.</p>' : '<p class="ok">Within the federal limit of ' + lim + ' hours in a ' + (v.sch ? 'school' : 'non-school') + ' week.</p>') + '<p class="ad-note">Also no more than 3 hours on a school day or 8 on a non-school day.</p>' : ''); } },
    'register-to-vote': { t: 'Deadline countdown', p: 'Copy the dates from your state or local election office.',
      f: [{ id: 'reg', l: 'Registration deadline', type: 'date', v: '' }, { id: 'el', l: 'Election day', type: 'date', v: '' }],
      o: function (v) {
        function left(s, what) { var d = parseDate(s); if (!d) return ''; var n = Math.round((d - today) / 864e5); return '<p>' + what + ': <b>' + nice(d) + '</b>, ' + (n > 0 ? '<span class="big">' + n + ' day' + (n === 1 ? '' : 's') + '</span> from today' : n === 0 ? '<span class="big">today</span>' : n * -1 + ' days ago') + '</p>'; }
        return left(v.reg, 'Register by') + left(v.el, 'Election day') || '<p>Enter the dates to count down.</p>';
      } }
  };
  var spec = C[box.dataset.calc]; if (!spec) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function input(c, val, name) {
    if (c.type === 'sel') return '<select name="' + name + '">' + c.o.map(function (o) { return '<option value="' + o[0] + '"' + (String(val) === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
    if (c.type === 'chk') return '<input type="checkbox" name="' + name + '"' + (val ? ' checked' : '') + '>';
    var t = c.type === 'num' ? 'number' : c.type;
    return '<input type="' + t + '" name="' + name + '" value="' + esc(val) + '"' + (c.type === 'num' ? ' inputmode="decimal" step="' + (c.step || 'any') + '"' : '') + ' autocomplete="off">';
  }
  var html = '<h2>🧮 ' + spec.t + '</h2><p class="hs-small">' + spec.p + '</p><form class="ad-form" onsubmit="return false"><div class="ad-fields">';
  spec.f.forEach(function (f) {
    if (f.type === 'h') { html += '</div><h3>' + f.l + '</h3><div class="ad-fields">'; return; }
    if (f.type === 'rows') {
      html += '</div><table class="ad-rows"><caption class="hs-small" style="text-align:left">' + f.l + '</caption><tr>' + f.cols.map(function (c) { return '<th>' + c.l + '</th>'; }).join('') + '</tr>' +
        f.v.map(function (r, i) { return '<tr>' + f.cols.map(function (c, j) { return '<td>' + input(c, r[j] === undefined ? '' : r[j], f.id + '.' + i + '.' + c.id) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table><div class="ad-fields">';
      return;
    }
    html += '<label' + (f.type === 'chk' ? ' class="ad-chk"' : '') + '>' + (f.type === 'chk' ? input(f, f.v, f.id) + ' ' + f.l : f.l + input(f, f.v, f.id)) + '</label>';
  });
  html += '</div></form><div class="ad-out" aria-live="polite"></div>';
  box.innerHTML = html; box.hidden = false;
  var form = box.querySelector('form'), out = box.querySelector('.ad-out');
  function read() {
    var v = {};
    spec.f.forEach(function (f) {
      if (f.type === 'h') return;
      if (f.type === 'rows') { v[f.id] = f.v.map(function (_, i) { var r = {}; f.cols.forEach(function (c) { var el = form.elements[f.id + '.' + i + '.' + c.id]; r[c.id] = c.type === 'num' ? (parseFloat(el.value) || 0) : el.value; }); return r; }); return; }
      var el = form.elements[f.id];
      v[f.id] = f.type === 'num' ? (parseFloat(el.value) || 0) : f.type === 'chk' ? el.checked : el.value;
    });
    return v;
  }
  function run() { try { out.innerHTML = spec.o(read()); } catch (e) { out.textContent = ''; } }
  form.addEventListener('input', run); form.addEventListener('change', run); run();
})(window, document);

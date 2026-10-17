/* Economics Ladder generators: Microeconomics (course key micro).
   One generator per topic in data/economics/topics/micro.json, registered with MathLadder.gen.
   Built from the source parts in the course builder's work dir (gen/*.js, concatenated in order).

   Conventions (see the ladder overview): price on the vertical axis, quantity across; demand Qd = a − bP and supply
   Qs = c + dP (inverse forms said out loud); price elasticity of demand reported as a positive number with the midpoint
   method; income and cross-price elasticities keep their signs. Money answers carry unit 'dollars' (learners may type
   $7.50, 7.5 or 7.50). Every problem also carries `chk`: the setup in machine-readable form, so the course's node test
   recomputes each answer by an independent route (the kit's MathLadder.econ models, brute-force search over tables,
   numeric integration). The runner ignores it. Problems are self-contained: no other file is needed at run time. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, Q = ML.Q, U = ML.util, M = Math;
  // promote long inline math ($...$) to display math ($$...$$): inline math never wraps, so long pieces widen phone pages
  function wideMath(s, limit) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    limit = limit || 30;
    var out = '', i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c === '\\' && s[i + 1] === '$') { out += '\\$'; i += 2; continue; }
      if (c === '$' && s[i + 1] === '$') { var j = s.indexOf('$$', i + 2); if (j < 0) { out += s.slice(i); break; } out += s.slice(i, j + 2); i = j + 2; continue; }
      if (c === '$') {
        var k = i + 1; while (k < n && !(s[k] === '$' && s[k - 1] !== '\\')) k++;
        if (k >= n) { out += s.slice(i); break; }
        var tex = s.slice(i + 1, k);
        var vis = tex.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\(left|right|displaystyle|dfrac|frac|tfrac|big|Big|bigg|Bigg|bigl|bigr|mathrm|operatorname|lvert|rvert)\b/g, '').replace(/\\(ln|log|exp)\b/g, 'xxx').replace(/\\\$/g, '$').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}\s^_]/g, '').length;
        if (vis > limit) { out += '$$' + tex + '$$'; i = k + 1; if (s[i] === '.' || s[i] === ',') i++; continue; }
        out += '$' + tex + '$';
        i = k + 1; continue;
      }
      out += c; i++;
    }
    return out;
  }
  // "a $8" -> "an $8" (numbers read aloud starting with a vowel sound: 8…, 11, 18, 80…)
  function article(s) { return typeof s !== 'string' ? s : s.replace(/(^|[\s(>])(A|a) ((?:\\\$)?(?:8|1[18](?![\d.,])))/g, '$1$2n $3'); }
  // register a generator; long inline math in the question and steps becomes display math (it scrolls on phones)
  function G(id, fn) {
    ML.gen(id, function (R, ctx) {
      var pr = fn(R, ctx);
      if (pr && typeof pr === 'object') {
        pr.q = wideMath(article(pr.q)); if (Array.isArray(pr.steps)) pr.steps = pr.steps.map(function (x) { return wideMath(article(x)); }); if (pr.hint) pr.hint = wideMath(pr.hint);
        if (pr.a && pr.a.t === 'mc') pr.a.choices = pr.a.choices.map(function (x) { return wideMath(x, 40); });
      }
      return pr;
    });
  }

  // ------------------------------------------------------------------ numbers
  function lv(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function fix(x) { return Number(Number(x).toPrecision(12)) + 0; }
  function isInt(x) { return M.abs(x - M.round(x)) < 1e-9; }
  // a plain string for an exact value: 7.5 -> "7.5", 1/3 -> "1/3" (small denominators), 12 -> "12"
  function plain(x) {
    if (x instanceof Q) return x.toPlain();
    x = fix(x); var s = String(x); if (!/\.\d{5,}/.test(s) && !/e/.test(s)) return s;
    for (var d = 2; d <= 400; d++) { var n = M.round(x * d); if (M.abs(n / d - x) < 1e-9 * M.max(1, M.abs(x))) return Q(n, d).toPlain(); }
    return String(x);
  }
  // TeX for a number: exact fractions as \frac, decimals without float noise, thousands commas
  function nx(x) {
    if (x instanceof Q) return x.isInt() ? T.commas(x.toNumber()) : x.toTex();
    x = fix(x); if (/\.\d{5,}/.test(String(x))) { var p = plain(x); if (p.indexOf('/') > 0) return Q.from(p).toTex(); }
    return M.abs(x) >= 1000 ? T.commas(x) : T.num(x);
  }
  // a number for plain text: a decimal when it terminates, else a fraction in math ($\frac{31}{3}$)
  function dn(x) { var q = x instanceof Q ? x : Q.from(plain(x)); return q.isTerminating() ? T.num(q.toNumber()) : '$' + q.toTex() + '$'; }
  function d2(x) { return T.dec(fix(x), 2); }                  // 0.5 -> "0.50"
  function money(x) { return T.money(fix(x)); }               // "\$7.50", "\$12", "\$1,250" (text or math)
  function pct(x) { return T.pct(fix(x)); }                   // "25\%" (text or math)
  function cash(x) { x = fix(x); return isInt(x) ? String(M.round(x)) : x.toFixed(2); } // answer value for money
  function plural(n, one, many) { return (fix(n) === 1 ? one : (many || one + 's')); }
  function cnt(n, one, many) { return nx(n) + ' ' + plural(n, one, many); }   // "3 pizzas", "1 pizza"
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  // ------------------------------------------------------------------ answers and problems
  function exact(x, extra) { var a = { t: 'num', v: plain(x) }; if (extra) for (var k in extra) a[k] = extra[k]; return a; }
  function dollars(x) { return { t: 'num', v: cash(x) }; }
  function near(x, tol) { return { t: 'num', v: plain(x), tol: tol || 0.01 }; }
  // an exact fraction answer n/d; non-terminating values also accept a decimal rounded to two places
  function ratioAns(n, d) { var q = Q(n, d), a = { t: 'num', v: q.toPlain() }; if (!q.isTerminating() || q.toDec(6).replace(/0+$/, '').split('.')[1] && q.toDec(6).replace(/0+$/, '').split('.')[1].length > 2) a.tol = 0.006; return a; }
  function percent(x, tol) { var a = { t: 'num', v: plain(x), pct: true }; if (tol) a.tol = tol; return a; }
  function mc(correct, wrongs, k) { return U.mc(correct, wrongs, k || 4); }
  function shuf(choices, v) { return { t: 'mc', choices: choices, v: v }; }   // shuffled at display
  function keep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  // P(q, a, steps, hint, unit, chk, viz)
  function P(q, a, steps, hint, unit, chk, viz) {
    var p = { q: q, a: a, steps: steps };
    if (hint) p.hint = hint;
    if (unit && (a.t === 'num') && !a.pct) p.unit = unit;
    if (chk) p.chk = chk;
    if (viz) p.viz = viz;
    return p;
  }
  // an HTML table for a question (styled by math.css; scrolls sideways inside the card if wide)
  function htmlTable(head, rows, caption) {
    return '<div class="mlp-table-wrap"><table class="mlp-table">' + (caption ? '<caption>' + caption + '</caption>' : '') + '<tr>' + head.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr>' +
      rows.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div>';
  }
  function frac(n, d) { return T.frac(n, d); }
  function dfr(a, b) { return '\\dfrac{' + a + '}{' + b + '}'; }
  // a linear demand "Q_d = 20 - 2P" and supply "Q_s = -4 + 2P" as TeX (v: the price letter)
  function qdTex(a, b, v) { return 'Q_d = ' + T.terms([[a, ''], [-b, v || 'P']]); }
  function qsTex(c, d, v) { return 'Q_s = ' + T.terms([[c, ''], [d, v || 'P']]); }
  // pick k different items from a bank by level: items carry lv (1 easy … 3 hard); level L draws from items with lv <= L
  function bank(R, ctx, list) { var L = ctx && ctx.level || 1, pool = list.filter(function (x) { return (x.lv || 1) <= L; }); var hard = pool.filter(function (x) { return (x.lv || 1) === L; }); return R.chance(0.6) && hard.length ? R.pick(hard) : R.pick(pool); }

  // =================================================================== Unit 1: Scarcity and Choice
  var FACTORS = ['Land', 'Labor', 'Capital', 'Entrepreneurship'];
  var FACTOR_WHY = [
    'Natural resources, wherever they are found, count as land.',
    'Human effort and skill, paid or not, is labor.',
    'Capital means tools, machines and buildings made to produce other goods and services.',
    'Entrepreneurship is organizing land, labor and capital into a business and taking the risk.'
  ];
  var FACTOR_ITEMS = [
    { s: 'crude oil still in the ground, owned by an oil company', f: 0 }, { s: 'the soil of a wheat farm', f: 0 },
    { s: 'the fish in a lake that a fishing crew harvests', f: 0 }, { s: 'standing timber in a forest a lumber mill will cut', f: 0 },
    { s: 'the river water a farm uses for irrigation', f: 0 }, { s: 'the wind that turns a wind farm’s turbines', f: 0, lv: 2 },
    { s: 'iron ore in a mine', f: 0 },
    { s: 'the hours a nurse works at a hospital', f: 1 }, { s: 'a cashier’s work at a grocery store', f: 1 },
    { s: 'a programmer writing code for a software company', f: 1 }, { s: 'a truck driver’s driving for a delivery firm', f: 1 },
    { s: 'the skills a welder learned in trade school, used on the job', f: 1, lv: 3 }, { s: 'a teacher’s time in the classroom', f: 1 },
    { s: 'a delivery van owned by a bakery', f: 2 }, { s: 'the oven in a pizza shop', f: 2 }, { s: 'a factory building', f: 2 },
    { s: 'a tractor on a farm', f: 2 }, { s: 'a laptop a graphic designer uses for client work', f: 2, lv: 2 },
    { s: 'a forklift in a warehouse', f: 2 }, { s: 'a cash register in a shop', f: 2, lv: 2 },
    { s: 'the owner who risked her savings to open a café and decides what it sells', f: 3 },
    { s: 'a founder who brings together workers, equipment and space to launch a new product', f: 3 },
    { s: 'a person who spots an unmet need and starts a business to fill it, knowing it may fail', f: 3, lv: 2 }
  ];
  var SCARCITY_TF = [
    { s: 'In economics, the money a business keeps in its bank account counts as capital, one of the factors of production.', v: false, why: 'Capital means physical tools, machines and buildings. Money buys resources but does not itself produce anything.', lv: 2 },
    { s: 'A very rich country does not face scarcity.', v: false, why: 'Scarcity is the gap between wants and resources. Even a rich country has limited land, labor and time, and must choose how to use them.' },
    { s: 'Scarcity means that wants are greater than the resources available to satisfy them.', v: true, why: 'That is the definition: limited resources, unlimited wants.' },
    { s: 'In economics, scarcity and a shortage mean the same thing.', v: false, why: 'A shortage happens in one market when the price is below equilibrium. Scarcity is always present, for every good that has other uses.', lv: 2 },
    { s: 'Time is a scarce resource even for people with plenty of money.', v: true, why: 'Everyone has 24 hours a day, so using time one way means not using it another.' },
    { s: 'A delivery van used by a bakery is an example of capital.', v: true, why: 'The van is a tool made to produce a service, delivery.' },
    { s: 'Shares of stock that a family owns are capital in the sense economists use for the factors of production.', v: false, why: 'Stocks are financial assets, claims on a firm. Capital as a factor means the physical equipment and buildings themselves.', lv: 3 },
    { s: 'Natural resources such as oil, timber and fish are counted as land.', v: true, why: 'Land covers every natural resource, not only the ground.' }
  ];
  G('micro.scarcity-resources', function (R, ctx) {
    var L = ctx.level || 1;
    if (L >= 2 && R.chance(0.35)) {
      var t = bank(R, ctx, SCARCITY_TF);
      return P('True or false: ' + t.s, tf(t.v), [t.why, t.v ? 'So the statement is <b>true</b>.' : 'So the statement is <b>false</b>.'],
        'Think about the economist’s meaning of the words, not the everyday one.', null, { kind: 'tf', item: t.s, v: t.v });
    }
    if (L === 3 && R.chance(0.4)) {
      var cap0 = R.pick(['a forklift in a warehouse', 'a bakery’s delivery van', 'the oven in a pizza shop', 'a factory building']);
      var wr = R.sample(['50,000 dollars in a company’s savings account', 'shares of stock in a car company', 'a government bond a firm owns', 'a bank loan a store has taken out'], 3);
      return P('Which of these is <b>capital</b> in the sense economists use for the factors of production?', mc(cap(cap0), wr.map(cap)),
        ['Capital means tools, machines and buildings that are used to produce other goods and services.', cap(cap0) + ' is used to produce something, so it is capital.', 'Money, stocks, bonds and loans are financial assets: they can buy capital, but they are not capital themselves.'],
        'Ask which item could be used directly to make a good or a service.', null, { kind: 'capital', answer: cap0 });
    }
    if (R.chance(0.45)) {
      var want = R.int(0, 3), picks = [0, 1, 2, 3].map(function (f) { return R.pick(FACTOR_ITEMS.filter(function (x) { return x.f === f && (x.lv || 1) <= L; })); });
      return P('Which of these is an example of <b>' + FACTORS[want].toLowerCase() + '</b> as a factor of production?', mc(cap(picks[want].s), picks.filter(function (x, i) { return i !== want; }).map(function (x) { return cap(x.s); })),
        [FACTOR_WHY[want], cap(picks[want].s) + ' fits: it is <b>' + FACTORS[want].toLowerCase() + '</b>.', 'The others: ' + picks.filter(function (x, i) { return i !== want; }).map(function (x) { return x.s + ' (' + FACTORS[x.f].toLowerCase() + ')'; }).join('; ') + '.'],
        'Natural resource, human effort, a tool built to produce, or the person who organizes and takes the risk?', null, { kind: 'which', want: want, answer: picks[want].s, items: picks.map(function (x) { return [x.s, x.f]; }) });
    }
    var it = bank(R, ctx, FACTOR_ITEMS);
    return P('Which factor of production is ' + it.s + '?', keep(FACTORS.slice(), it.f),
      [FACTOR_WHY[it.f], cap(it.s) + ' is <b>' + FACTORS[it.f].toLowerCase() + '</b>.'],
      'Natural resource, human effort, a tool built to produce, or the person who organizes and takes the risk?', null, { kind: 'factor', item: it.s, f: it.f });
  });

  var JOBS = [['work a shift at the grocery store', 'babysit for the neighbors', 'tutor a younger student', 'mow lawns', 'help at a car wash', 'walk dogs']];
  G('micro.opportunity-cost', function (R, ctx) {
    var L = ctx.level || 1, who = R.pick(['Jen', 'Omar', 'Priya', 'Leo', 'Ana', 'Sam', 'Kai', 'Mia']);
    var shape = L === 1 ? 'best' : R.pick(L === 2 ? ['best', 'time', 'time'] : ['best', 'time', 'mixed']);
    if (shape === 'best') {
      var n = L === 1 ? 2 : 3, acts = R.sample(JOBS[0], n), vals = [];
      while (vals.length < n) { var v = R.int(3, 18) * 5; if (vals.indexOf(v) < 0) vals.push(v); }
      var free = R.pick([['go to a free concert in the park', 'concert'], ['spend the afternoon at the beach', 'beach'], ['play in a pickup soccer game', 'soccer game'], ['visit a free museum', 'museum']]);
      var best = M.max.apply(null, vals), sum = vals.reduce(function (a, b) { return a + b; }, 0);
      var opts = acts.map(function (a, i) { return a + ' for ' + money(vals[i]); });
      return P('On Saturday afternoon ' + who + ' could ' + U.list(opts).replace(' and ', ' or ') + '. Each would take the whole afternoon. ' + who + ' decides to ' + free[0] + ' instead. What is the opportunity cost of that choice?',
        dollars(best),
        ['The alternatives given up: ' + U.list(opts) + '.', who + ' could have done only one of them in the same afternoon, so only the best one counts.', 'The best alternative is worth ' + money(best) + '. The ' + free[1] + ' costs no money, so nothing else is added.', 'Opportunity cost: <b>' + money(best) + '</b> (not the total of every alternative, ' + money(sum) + ').'],
        'Only the single best alternative counts.', 'dollars', { kind: 'best', vals: vals, cashCost: 0, hours: 0, wage: 0 });
    }
    if (shape === 'time') {
      var ev = R.pick([['concert ticket', 'the concert'], ['ticket to a basketball game', 'the game'], ['theme park pass', 'the theme park trip'], ['cooking class fee', 'the class']]);
      var price = R.int(4, 16) * 5, hrs = R.int(2, 6), wage = R.pick([10, 11, 12, 13, 14, 15, 16, 18, 20]);
      var tot = price + hrs * wage;
      return P(who + ' pays ' + money(price) + ' for a ' + ev[0] + '. Going to ' + ev[1] + ' takes ' + cnt(hrs, 'hour') + ' that ' + who + ' could otherwise spend working at ' + money(wage) + ' an hour. What is the opportunity cost of going?',
        dollars(tot),
        ['Money given up: the ' + money(price) + ' ' + ev[0] + ', which could have bought something else.', 'Time given up: ' + cnt(hrs, 'hour') + ' of work, worth $' + hrs + ' \\times ' + money(wage) + ' = ' + money(hrs * wage) + '$.', 'Total: $' + money(price) + ' + ' + money(hrs * wage) + ' = ' + money(tot) + '$.'],
        'Count the money spent and the earnings given up.', 'dollars', { kind: 'time', vals: [], cashCost: price, hours: hrs, wage: wage });
    }
    // mixed: a free activity, but the hours could be spent at the better of two jobs
    var hrs2 = R.int(2, 5), w1 = R.int(9, 15), w2 = R.intNot(9, 18, w1), fee = R.int(1, 6) * 5;
    var bw = M.max(w1, w2), tot2 = fee + hrs2 * bw;
    return P('A ' + cnt(hrs2, 'hour') + ' volunteer trip has a ' + money(fee) + ' sign-up fee. In those hours ' + who + ' could instead work at a café for ' + money(w1) + ' an hour or at a hardware store for ' + money(w2) + ' an hour (not both). What is the opportunity cost of the trip?',
      dollars(tot2),
      ['The fee is money given up: ' + money(fee) + '.', 'In the same hours ' + who + ' could hold only one job, so count the better one: ' + money(bw) + ' an hour.', 'Earnings given up: $' + hrs2 + ' \\times ' + money(bw) + ' = ' + money(hrs2 * bw) + '$.', 'Total: $' + money(fee) + ' + ' + money(hrs2 * bw) + ' = ' + money(tot2) + '$.'],
      'Add the fee to the earnings from the best job given up.', 'dollars', { kind: 'time', vals: [], cashCost: fee, hours: hrs2, wage: bw, wages: [w1, w2] });
  });

  var POS = [
    { s: 'When the price of gasoline rises, people buy less gasoline, other things equal.' },
    { s: 'The unemployment rate was higher in 2010 than in 2007.' },
    { s: 'A tax on sugary drinks would reduce the amount of soda people buy.' },
    { s: 'If a city caps rents below the market rate, there will be a shortage of apartments.' },
    { s: 'College graduates earn more on average than people with only a high school diploma.' },
    { s: 'Countries that trade more with other countries tend to have higher incomes.', lv: 2 },
    { s: 'Raising the minimum wage to 30 dollars an hour would end all poverty.', lv: 2, note: 'It is almost surely false, but it is a claim evidence can test.' },
    { s: 'Printing more money always lowers prices.', lv: 2, note: 'It is false, but it is still a testable claim.' },
    { s: 'Economists estimate that a 10 percent rise in cigarette prices reduces smoking by a few percent.', lv: 3 },
    { s: 'If tuition falls, more students will enroll in college.', lv: 1 }
  ];
  var NORM = [
    { s: 'The government should raise the minimum wage.' }, { s: 'Gasoline taxes are too high.' },
    { s: 'It is unfair that some people earn a hundred times more than others.' },
    { s: 'Reducing unemployment is more important than reducing inflation.', lv: 2 },
    { s: 'The city ought to spend more on parks and less on roads.' }, { s: 'Everyone deserves free health care.' },
    { s: 'The income tax rate on the highest earners should be 50 percent.', lv: 2, note: 'A number does not make it positive.' },
    { s: 'A 5 percent unemployment rate is too high to accept.', lv: 3, note: '"Too high to accept" is a judgment, even with a number in it.' },
    { s: 'Schools should not sell soda to students.', lv: 1 },
    { s: 'Protecting local jobs is worth paying higher prices for imported goods.', lv: 3 }
  ];
  G('micro.positive-normative', function (R, ctx) {
    var L = ctx.level || 1;
    if (R.chance(L === 1 ? 0.4 : 0.55)) {
      var wantN = R.coin(), one = bank(R, ctx, wantN ? NORM : POS), others = R.sample((wantN ? POS : NORM).filter(function (x) { return (x.lv || 1) <= L; }), 3);
      return P('Which statement is <b>' + (wantN ? 'normative' : 'positive') + '</b>?', mc(one.s, others.map(function (x) { return x.s; })),
        ['A positive statement can be tested with evidence; a normative one says what ought to be.', '“' + one.s + '” ' + (wantN ? 'is a value judgment.' : 'can be checked against data.') + (one.note ? ' ' + one.note : ''), 'Each of the others ' + (wantN ? 'makes a claim data could check.' : 'rests on a judgment about what is good or fair.')],
        'Look for words like should, ought, fair, too much, deserves.', null, { kind: 'pick', want: wantN ? 'N' : 'P', s: one.s });
    }
    var isN = R.coin(), st = bank(R, ctx, isN ? NORM : POS);
    return P('Is this statement positive or normative?<br>“' + st.s + '”', keep(['Positive', 'Normative'], isN ? 1 : 0),
      [isN ? 'It says what ought to be, a judgment about values.' : 'It describes how the world works, so evidence can check it.', (st.note ? st.note + ' ' : '') + 'It is <b>' + (isN ? 'normative' : 'positive') + '</b>.'],
      'Could data, at least in principle, prove it false?', null, { kind: 'one', s: st.s, v: isN ? 'N' : 'P' });
  });

  var SYS = ['Market economy', 'Command economy', 'Traditional economy', 'Mixed economy'];
  var SYS_ITEMS = [
    { s: 'Prices set by buyers and sellers decide what gets made, and businesses keep their profits.', f: 0 },
    { s: 'A bakery adds a new kind of bagel after customers line up for it.', f: 0 },
    { s: 'A central planning office sets how many shoes each factory must produce this year.', f: 1 },
    { s: 'The state assigns university graduates to jobs.', f: 1 },
    { s: 'Families farm the same plots their grandparents farmed, and the harvest is shared by custom.', f: 2 },
    { s: 'Children learn their parents’ trade and pass it on in the same way.', f: 2 },
    { s: 'Most goods are bought and sold in markets, while the government runs schools, courts and a pension system and taxes incomes.', f: 3, lv: 2 },
    { s: 'A central plan sets output targets, but families may sell vegetables from their own plots at whatever price they can get.', f: 3, lv: 2 },
    { s: 'Wages for nurses rise when hospitals compete to hire them.', f: 0, lv: 2 },
    { s: 'Government officials, not prices, decide how much steel goes to car factories and how much to tractors.', f: 1, lv: 2 }
  ];
  var SYS_TF = [
    { s: 'The United States is a pure market economy.', v: false, why: 'Government plays large roles (schools, courts, roads, regulation, taxes and transfers), so it is a mixed economy that leans toward markets.' },
    { s: 'In a market economy, prices help answer the question of what to produce.', v: true, why: 'Rising prices signal that buyers value a good more and reward sellers for making more.' },
    { s: 'Every modern economy mixes market decisions and government decisions.', v: true, why: 'No real economy is purely market or purely command; they differ in the balance.' },
    { s: 'In a command economy, consumers’ spending decides what gets produced.', v: false, why: 'In a command economy planners decide what is produced; in a market economy spending does.' }
  ];
  G('micro.economic-systems', function (R, ctx) {
    var L = ctx.level || 1;
    if (L >= 2 && R.chance(0.3)) {
      var t = R.pick(SYS_TF);
      return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Real economies are rarely pure.', null, { kind: 'tf', s: t.s, v: t.v });
    }
    if (R.chance(0.45)) {
      var w = R.int(0, 2), pk = [0, 1, 2].map(function (f) { return R.pick(SYS_ITEMS.filter(function (x) { return x.f === f && (x.lv || 1) <= L; })); });
      return P('Which of these describes a decision in a <b>' + SYS[w].toLowerCase() + '</b>?', mc(pk[w].s, pk.filter(function (x, i) { return i !== w; }).map(function (x) { return x.s; }), 3),
        [['In a market economy, buyers and sellers decide through prices and profits.', 'In a command economy, government planners decide.', 'In a traditional economy, custom and habit decide.'][w], '“' + pk[w].s + '” fits.', 'The others are ' + pk.filter(function (x, i) { return i !== w; }).map(function (x) { return SYS[x.f].toLowerCase().replace(' economy', '') + ' decisions'; }).join(' and ') + '.'],
        'Who decides: prices and profits, planners, or custom?', null, { kind: 'which', want: w, answer: pk[w].s, items: pk.map(function (x) { return [x.s, x.f]; }) });
    }
    var it = bank(R, ctx, SYS_ITEMS), ch = L === 1 ? SYS.slice(0, 3) : SYS.slice();
    if (L === 1 && it.f === 3) it = SYS_ITEMS[0];
    var reason = ['Buyers and sellers, guided by prices and profits, make the decision.', 'Government planners make the decision.', 'Custom and tradition make the decision.', 'Markets and government each answer part of the questions.'][it.f];
    return P('Which kind of economic system does this describe?<br>“' + it.s + '”', keep(ch, it.f), [reason, 'That describes a <b>' + SYS[it.f].toLowerCase() + '</b>.'],
      'Who decides: prices and profits, planners, or custom?', null, { kind: 'sys', s: it.s, f: it.f });
  });

  var BUDGET_GOODS = [['burger', 'burgers', 'movie ticket', 'movie tickets', [4, 9], [8, 15]], ['book', 'books', 'song download', 'song downloads', [6, 15], [1, 3]], ['bus ride', 'bus rides', 'snack', 'snacks', [2, 4], [1, 5]],
    ['pizza', 'pizzas', 'game rental', 'game rentals', [8, 15], [3, 8]], ['notebook', 'notebooks', 'pen', 'pens', [2, 6], [1, 3]], ['coffee', 'coffees', 'muffin', 'muffins', [2, 6], [2, 5]], ['T-shirt', 'T-shirts', 'pair of socks', 'pairs of socks', [8, 20], [2, 6]],
    ['concert ticket', 'concert tickets', 'pizza', 'pizzas', [20, 45], [8, 15]], ['gallon of gas', 'gallons of gas', 'car wash', 'car washes', [3, 5], [8, 15]]];
  G('micro.budget-constraint', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(BUDGET_GOODS), who = R.pick(['Lia', 'Marcus', 'Noor', 'Theo', 'Rosa', 'Dev']);
    var px, py;
    var tries = 0;
    do { px = R.int(g[4][0], g[4][1]); py = R.int(g[5][0], g[5][1]); tries++; } while ((px === py || U.lcm(px, py) > 150 || (L >= 2 && (px % py === 0 || py % px === 0) && R.coin())) && tries < 80);
    if (px === py) py = px + 1;
    var lcm = U.lcm(px, py), I = lcm * R.int(1, M.max(1, M.floor(180 / lcm))); if (I < 20) I = lcm * M.ceil(20 / lcm);
    if (I / M.max(px, py) < 2) I *= 2;
    var X = I / px, Y = I / py;
    var setup = who + ' has ' + money(I) + ' to spend on ' + g[1] + ' (' + money(px) + ' each) and ' + g[3] + ' (' + money(py) + ' each).';
    var viz = { name: 'ec-choice', opts: { budgetOnly: true, income: I, prices: [px, py], goods: [cap(g[1]), cap(g[3])], bundle: [0, Y], quiet: true, interactive: false } };
    var chk = { I: I, px: px, py: py };
    var shape = R.pick(L === 1 ? ['xint', 'yint', 'oc'] : L === 2 ? ['oc', 'slope', 'rest', 'xint', 'afford'] : ['oc', 'slope', 'rest', 'afford', 'newprice']);
    if (shape === 'xint' || shape === 'yint') {
      var isX = shape === 'xint', mx = isX ? X : Y, pr = isX ? px : py, nm = isX ? g : [g[2], g[3]];
      chk.kind = shape;
      return P(setup + ' What is the most ' + (isX ? g[1] : g[3]) + ' ' + who + ' can buy?', exact(mx),
        ['Spend the whole budget on ' + (isX ? g[1] : g[3]) + ': $' + nx(I) + ' \\div ' + nx(pr) + ' = ' + nx(mx) + '$.', 'That is the ' + (isX ? 'horizontal' : 'vertical') + ' intercept of the budget line: <b>' + cnt(mx, nm[0], nm[1]) + '</b>.', 'Check: $' + nx(mx) + ' \\times ' + money(pr) + ' = ' + money(I) + '$.'],
        'Divide the income by that good’s price.', isX ? g[1] : g[3], chk);
    }
    function gen_oc() {
      var flip = L >= 2 && R.coin(), num = flip ? py : px, den = flip ? px : py, a = flip ? [g[2], g[1]] : [g[0], g[3]];
      chk.kind = flip ? 'ocy' : 'ocx';
      return P(setup + ' What is the opportunity cost of one ' + a[0] + ', measured in ' + a[1] + '?', ratioAns(num, den),
        ['One ' + a[0] + ' costs ' + money(num) + '.', 'That money would buy $' + nx(num) + ' \\div ' + nx(den) + ' = ' + T.frac(num, den) + '$ ' + a[1] + '.', 'So one ' + a[0] + ' costs <b>$' + T.frac(num, den) + '$ ' + a[1] + '</b>: the price of what you buy over the price of what you give up.'],
        'How many of the other good could the price of one ' + a[0] + ' buy?', a[1], chk, viz);
    }
    if (shape === 'oc') return gen_oc();
    if (shape === 'slope') {
      chk.kind = 'slope';
      return P(setup + ' Graph the budget line with ' + g[1] + ' on the horizontal axis and ' + g[3] + ' on the vertical axis. What is its slope?', ratioAns(-px, py),
        ['Intercepts: ' + cnt(X, g[0], g[1]) + ' on the horizontal axis and ' + cnt(Y, g[2], g[3]) + ' on the vertical axis.', 'Slope $= \\dfrac{\\text{rise}}{\\text{run}} = \\dfrac{0 - ' + nx(Y) + '}{' + nx(X) + ' - 0} = ' + T.frac(-Y, X) + '$.', 'That equals $-\\dfrac{P_x}{P_y} = ' + T.frac(-px, py) + '$: each extra ' + g[0] + ' costs $' + T.frac(px, py) + '$ ' + g[3] + '.'],
        'Find both intercepts, then rise over run. The line slopes down.', null, chk, viz);
    }
    if (shape === 'rest') {
      var stepx = py / U.gcd(px, py), ks = []; for (var kk = 1; stepx * kk < X; kk++) ks.push(stepx * kk);
      if (!ks.length) { shape = 'oc'; return gen_oc(); }
      var x0 = R.pick(ks), left = I - px * x0, y0;
      y0 = left / py; chk.kind = 'rest'; chk.x = x0;
      return P(setup + ' If ' + who + ' buys ' + cnt(x0, g[0], g[1]) + ' and spends the rest of the money on ' + g[3] + ', how many ' + g[3] + ' can ' + who + ' buy?', exact(y0),
        [cnt(x0, g[0], g[1]) + ' cost $' + x0 + ' \\times ' + money(px) + ' = ' + money(px * x0) + '$.', 'Money left: $' + money(I) + ' - ' + money(px * x0) + ' = ' + money(left) + '$.', money(left) + ' buys $' + nx(left) + ' \\div ' + nx(py) + ' = ' + nx(y0) + '$ ' + g[3] + '.', 'Check: $' + nx(px) + '(' + x0 + ') + ' + nx(py) + '(' + nx(y0) + ') = ' + nx(I) + '$.'],
        'Subtract what the ' + g[1] + ' cost, then divide by the other price.', g[3], chk);
    }
    if (shape === 'afford') {
      var kind = R.pick(['on', 'in', 'out']), bx, by, cost, found = false;
      for (var t = 0; t < 200 && !found; t++) { bx = R.int(1, M.max(1, X - 1)); by = R.int(1, M.max(1, Y - 1)); cost = px * bx + py * by; found = (kind === 'on' && cost === I) || (kind === 'in' && cost < I && cost > I * 0.6) || (kind === 'out' && cost > I && cost < I * 1.4); }
      if (!found) { kind = 'out'; bx = M.max(1, M.ceil(X / 2)); by = M.max(1, M.ceil(Y / 2) + 1); cost = px * bx + py * by; }
      var res = cost === I ? 0 : cost < I ? 1 : 2;
      chk.kind = 'afford'; chk.bundle = [bx, by];
      var choices = ['Affordable, and it uses the whole budget (on the line)', 'Affordable, with money left over (inside the line)', 'Not affordable (outside the line)'];
      return P(setup + ' Can ' + who + ' buy ' + cnt(bx, g[0], g[1]) + ' and ' + cnt(by, g[2], g[3]) + '?', keep(choices, res),
        ['Cost of the bundle: $' + nx(bx) + '(' + money(px) + ') + ' + nx(by) + '(' + money(py) + ') = ' + money(px * bx) + ' + ' + money(py * by) + ' = ' + money(cost) + '$.', 'Compare with the budget of ' + money(I) + ': ' + (res === 0 ? 'exactly equal.' : res === 1 ? 'less, so ' + money(I - cost) + ' is left.' : 'more, by ' + money(cost - I) + '.'), '<b>' + choices[res] + '</b>.'],
        'Multiply each quantity by its price and add.', null, chk);
    }
    // newprice: the price of x changes; the new horizontal intercept
    var cands = [px * 2, px / 2, px - 2, px - 1, px + 1, px + 2, px + 3].filter(function (v) { return v > 0 && v !== px && isInt(I / v) && isInt(v * 2); });
    if (!cands.length) { chk.kind = 'xint'; return P(setup + ' What is the most ' + g[1] + ' ' + who + ' can buy?', exact(X), ['Spend everything on ' + g[1] + ': $' + nx(I) + ' \\div ' + nx(px) + ' = ' + nx(X) + '$.'], 'Divide the income by the price.', g[1], chk, viz); }
    var npx = R.pick(cands);
    chk.kind = 'newprice'; chk.npx = npx;
    return P(setup + ' The price of a ' + g[0] + ' changes to ' + money(npx) + '. What is the new most ' + g[1] + ' ' + who + ' can buy? (The vertical intercept stays at ' + cnt(Y, g[2], g[3]) + '.)', exact(I / npx),
      ['Only the price of ' + g[1] + ' changed, so the line pivots around the vertical intercept.', 'New horizontal intercept: $' + nx(I) + ' \\div ' + nx(npx) + ' = ' + nx(I / npx) + '$ ' + g[1] + ' (it was ' + nx(X) + ').'],
      'Divide the income by the new price.', g[1], chk);
  });

  // =================================================================== Unit 2: Production Possibilities and Trade
  var PPC_GOODS = [['robots', 'tons of wheat', 'robot', 'ton of wheat'], ['computers', 'tons of rice', 'computer', 'ton of rice'], ['cars', 'tons of corn', 'car', 'ton of corn'],
    ['tablets', 'bushels of apples', 'tablet', 'bushel of apples'], ['tractors', 'bolts of cloth', 'tractor', 'bolt of cloth'], ['bikes', 'crates of oranges', 'bike', 'crate of oranges']];
  // a bowed-out PPC table: x in equal steps, y falling by growing amounts
  function ppcTable(R, n) {
    var dx = R.pick([5, 10, 20]), drops = [], d = R.int(1, 3) * 5;
    for (var i = 0; i < n; i++) { drops.push(d); d += R.int(1, 3) * 5; }
    var Y = drops.reduce(function (a, b) { return a + b; }, 0), rows = [[0, Y]], y = Y;
    for (i = 0; i < n; i++) { y -= drops[i]; rows.push([(i + 1) * dx, y]); }
    return rows;
  }
  function ppcMaxY(rows, x) { for (var i = 1; i < rows.length; i++) if (x <= rows[i][0] + 1e-9) { var a = rows[i - 1], b = rows[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return -Infinity; }
  function tableText(rows, g) { return htmlTable(['Point', cap(g[0]), cap(g[1])], rows.map(function (r, i) { return ['ABCDEFG'[i], r[0], r[1]]; })); }
  var PPC_STATUS = ['Efficient: it is on the curve', 'Possible but inefficient: some resources are idle or misused', 'Not attainable with current resources and technology'];

  G('micro.ppc', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(PPC_GOODS);
    if (L >= 2 && R.chance(0.25)) {
      var t = R.pick([
        { s: 'A point inside the production possibilities curve cannot be produced.', v: false, why: 'Points inside the curve can be produced; they are inefficient because some resources are idle or misused.' },
        { s: 'A point outside the production possibilities curve cannot be produced with the economy’s current resources and technology.', v: true, why: 'That is what the curve marks: the most the economy can make right now.' },
        { s: 'Every point on a production possibilities curve is efficient.', v: true, why: 'On the curve, more of one good requires less of the other: no resources are wasted.' },
        { s: 'The production possibilities curve shows the combination of goods people want most.', v: false, why: 'The curve shows what can be produced. People’s wants decide which point on it is chosen, not where the curve is.' },
        { s: 'Moving from a point inside the curve to a point on it can give the economy more of both goods.', v: true, why: 'Inside the curve some resources are idle; putting them to work can raise both outputs.' }
      ]);
      return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Inside means wasteful, outside means out of reach for now.', null, { kind: 'tf', v: t.v, s: t.s });
    }
    var linear = L === 1 || R.coin(), rows, X, Y, pt, status = R.int(0, 2), xq, yq;
    if (linear) {
      X = R.pick([20, 40, 60, 80]); Y = R.pick([40, 60, 80, 100, 120, 160, 200]);
      rows = null;
      var frac0 = R.pick([0.25, 0.5, 0.75]);
      xq = X * frac0; var ymax = Y * (1 - frac0);
      yq = status === 0 ? ymax : status === 1 ? ymax - R.pick([0.2, 0.4]) * ymax : ymax + R.pick([0.2, 0.4]) * Y * 0.5;
      yq = M.round(yq);
      if (status === 1 && yq >= ymax) yq = ymax - 1; if (status === 2 && yq <= ymax) yq = ymax + 1;
      var line = 'The economy can make at most ' + nx(X) + ' ' + g[0] + ' (and no ' + g[1].replace(/^tons of |^bushels of |^bolts of |^crates of /, '') + ') or at most ' + nx(Y) + ' ' + g[1] + ' (and no ' + g[0] + '), and its production possibilities curve is a straight line between those points.';
      return P(line + ' Which describes producing ' + nx(xq) + ' ' + g[0] + ' and ' + nx(yq) + ' ' + g[1] + '?', keep(PPC_STATUS.slice(), status),
        ['Along the straight line, each ' + g[2] + ' costs $' + nx(Y) + ' \\div ' + nx(X) + ' = ' + nx(Y / X) + '$ ' + g[1] + '.', 'With ' + nx(xq) + ' ' + g[0] + ', the most possible is $' + nx(Y) + ' - ' + nx(Y / X) + ' \\times ' + nx(xq) + ' = ' + nx(ymax) + '$ ' + g[1] + '.',
          nx(yq) + (status === 0 ? ' equals that: the point is on the curve, <b>efficient</b>.' : status === 1 ? ' is less: the point is inside the curve, <b>possible but inefficient</b>.' : ' is more: the point is outside the curve, <b>not attainable</b> for now.')],
        'Find the most ' + g[1] + ' possible with that many ' + g[0] + ', then compare.', null,
        { kind: 'classify', rows: [[0, Y], [X, 0]], x: xq, y: yq, status: status },
        { name: 'ec-ppc', opts: { goods: [cap(g[0]), cap(g[1])], shape: 'linear', max: [X, Y], quiet: true, interactive: false, marks: [{ label: 'A', x: xq, y: yq }] } });
    }
    rows = ppcTable(R, 4); var i = R.int(1, 3), r = rows[i];
    xq = r[0]; yq = status === 0 ? r[1] : status === 1 ? r[1] - R.int(1, 3) * 5 : r[1] + R.int(1, 2) * 5;
    if (yq < 0) { yq = r[1]; status = 0; }
    if (status === 2 && yq > rows[0][1] + 5) yq = r[1] + 5;
    return P('An economy’s production possibilities are shown in the table.' + tableText(rows, g) + 'Which describes producing ' + nx(xq) + ' ' + g[0] + ' and ' + nx(yq) + ' ' + g[1] + '?', keep(PPC_STATUS.slice(), status),
      ['With ' + nx(xq) + ' ' + g[0] + ', the most the economy can make is ' + nx(r[1]) + ' ' + g[1] + ' (point ' + 'ABCDEFG'[i] + ').',
        nx(yq) + (status === 0 ? ' equals that: <b>efficient</b>, on the curve.' : status === 1 ? ' is less than ' + nx(r[1]) + ': inside the curve, <b>possible but inefficient</b>.' : ' is more than ' + nx(r[1]) + ': outside the curve, <b>not attainable</b> for now.')],
      'Find the row with the same number of ' + g[0] + ', then compare the other good.', null, { kind: 'classify', rows: rows, x: xq, y: yq, status: status });
  });

  G('micro.ppc-opportunity-cost', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(PPC_GOODS), shape = L === 1 ? R.pick(['lin', 'lin', 'step']) : R.pick(L === 2 ? ['lin', 'step', 'step', 'trend'] : ['lin', 'step', 'trend', 'total']);
    if (shape === 'lin') {
      var X = R.pick([10, 20, 25, 30, 40, 50, 60]), Y = R.pick([30, 40, 60, 80, 100, 120, 150, 200]); if (X === Y) Y += 10;
      var flip = L >= 2 && R.coin(), num = flip ? X : Y, den = flip ? Y : X, of = flip ? g[3] : g[2], inU = flip ? g[0] : g[1];
      return P('A country can make at most ' + nx(X) + ' ' + g[0] + ' or at most ' + nx(Y) + ' ' + g[1] + ', or any combination on the straight-line PPC between them. What is the opportunity cost of one ' + of + ', in ' + inU + '?', ratioAns(num, den),
        ['Going from all ' + (flip ? g[0] : g[1]).replace(/^tons of |^bushels of |^bolts of |^crates of /, '') + ' to all ' + (flip ? g[1] : g[0]).replace(/^tons of |^bushels of |^bolts of |^crates of /, '') + ' gains ' + nx(den) + ' ' + (flip ? g[1] : g[0]) + ' and gives up ' + nx(num) + ' ' + inU + '.', 'Per unit: $\\dfrac{' + nx(num) + '}{' + nx(den) + '} = ' + T.frac(num, den) + '$ ' + inU + ' for each ' + of + '.', 'The line is straight, so this cost is the same everywhere on it.'],
        'Divide what is given up by what is gained. The good you give up goes on top.', inU, { kind: 'lin', X: X, Y: Y, of: flip ? 'y' : 'x' },
        { name: 'ec-ppc', opts: { goods: [cap(g[0]), cap(g[1])], shape: 'linear', max: [X, Y], quiet: true, interactive: false, point: null } });
    }
    var rows = ppcTable(R, 4);
    if (shape === 'step') {
      var i = R.int(0, 3), a = rows[i], b = rows[i + 1], dx = b[0] - a[0], dy = a[1] - b[1];
      return P('An economy’s production possibilities are shown in the table.' + tableText(rows, g) + 'Moving from point ' + 'ABCDE'[i] + ' to point ' + 'ABCDE'[i + 1] + ', what is the opportunity cost of <b>each</b> extra ' + g[2] + ', in ' + g[1] + '?', ratioAns(dy, dx),
        ['From ' + 'ABCDE'[i] + ' to ' + 'ABCDE'[i + 1] + ': ' + g[0] + ' rise by $' + b[0] + ' - ' + a[0] + ' = ' + dx + '$ and ' + g[1] + ' fall by $' + a[1] + ' - ' + b[1] + ' = ' + dy + '$.', 'Per ' + g[2] + ': $\\dfrac{' + dy + '}{' + dx + '} = ' + nx(Q(dy, dx)) + '$ ' + g[1] + '.'],
        'Amount of the other good given up, divided by the number of extra units gained.', g[1], { kind: 'step', rows: rows, i: i },
        { name: 'ec-ppc', opts: { goods: [cap(g[0]), cap(g[1])], points: rows, quiet: true, interactive: false } });
    }
    if (shape === 'total') {
      var j = R.int(0, 2), k = j + 2, c0 = rows[j], c1 = rows[k];
      return P('An economy’s production possibilities are shown in the table.' + tableText(rows, g) + 'The economy moves from point ' + 'ABCDE'[j] + ' to point ' + 'ABCDE'[k] + '. In total, how many ' + g[1] + ' does it give up to get the extra ' + g[0] + '?', exact(c0[1] - c1[1]),
        [cap(g[1]) + ' fall from ' + c0[1] + ' to ' + c1[1] + ': $' + c0[1] + ' - ' + c1[1] + ' = ' + (c0[1] - c1[1]) + '$.', 'That is the opportunity cost of the extra $' + (c1[0] - c0[0]) + '$ ' + g[0] + '.'],
        'Subtract the amounts of the other good at the two points.', g[1], { kind: 'total', rows: rows, j: j, k: k });
    }
    // trend: constant, increasing or decreasing?
    var lin = R.coin(), rr = lin ? (function () { var dx2 = R.pick([5, 10]), dy2 = R.int(2, 6) * 5, n = 4, out = []; for (var q = 0; q <= n; q++) out.push([q * dx2, (n - q) * dy2]); return out; })() : rows;
    var ch = ['It stays the same (constant opportunity cost)', 'It rises as more ' + g[0] + ' are made (increasing opportunity cost)', 'It falls as more ' + g[0] + ' are made (decreasing opportunity cost)'];
    var drops = rr.slice(1).map(function (r2, q) { return rr[q][1] - r2[1]; });
    return P('An economy’s production possibilities are shown in the table.' + tableText(rr, g) + 'As the economy makes more ' + g[0] + ', what happens to the opportunity cost of each extra ' + g[2] + '?', keep(ch, lin ? 0 : 1),
      ['Each step adds the same number of ' + g[0] + '. The ' + g[1] + ' given up at each step: ' + drops.join(', ') + '.', lin ? 'The amounts are equal: a constant cost, and a straight-line PPC.' : 'The amounts grow: each extra ' + g[2] + ' costs more. Resources are not equally suited to both goods, so the PPC bows out.'],
      'Compare how much of the other good is lost at each equal step.', null, { kind: 'trend', rows: rr, v: lin ? 0 : 1 });
  });

  var SHIFT_CH = ['The whole curve shifts outward', 'The whole curve shifts inward', 'Only the curve’s X end moves outward', 'Only the curve’s Y end moves outward', 'The economy moves from inside the curve toward it; the curve does not shift', 'The economy moves along the curve; the curve does not shift'];
  var SHIFT_EV = [
    { s: 'A recession ends and laid-off workers are hired back.', v: 4 },
    { s: 'Factories that sat idle during a slump start running again.', v: 4 },
    { s: 'A wave of immigration adds many workers to the labor force.', v: 0 },
    { s: 'Better schooling raises the skills of the whole workforce.', v: 0 },
    { s: 'Large new deposits of a mineral used in making both goods are discovered.', v: 0, lv: 2 },
    { s: 'A hurricane destroys roads, factories and farm equipment.', v: 1 },
    { s: 'A new invention makes {X1} factories far more productive, with no change in making {Y}.', v: 2 },
    { s: 'A new technology raises {Y} output, with no change in making {XP}.', v: 3 },
    { s: 'The country decides to make more {XP} and less {Y}, still using all of its resources.', v: 5, lv: 2 },
    { s: 'Years of investment in new machines add to the capital stock used in both industries.', v: 0, lv: 2 },
    { s: 'A disease outbreak keeps many workers out of work for months, without any lasting loss of workers or equipment.', v: 4, lv: 3 }
  ];
  G('micro.ppc-shifts', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(PPC_GOODS), ev = bank(R, ctx, SHIFT_EV), X = cap(g[0]), Y = g[1].replace(/^tons of |^bushels of |^bolts of |^crates of /, '');
    var fill = function (s) { return s.replace(/\{X1\}/g, g[2]).replace(/\{XP\}/g, g[0]).replace(/\{Y\}/g, Y); };
    var ch = SHIFT_CH.map(function (c) { return c.replace('X end', 'end on the ' + g[0] + ' axis').replace('Y end', 'end on the ' + Y + ' axis'); });
    var why = ['More resources or better technology for both goods raise the most the economy can make: the curve shifts out.', 'Resources were destroyed, so the most the economy can make falls: the curve shifts in.', 'Better technology for ' + g[0] + ' only: the ' + g[0] + ' intercept moves out, the other stays.', 'Better technology for ' + Y + ' only: the ' + Y + ' intercept moves out, the other stays.', 'The resources were already there, just idle. Using them moves the point toward the curve; the most the economy could make has not changed.', 'Same resources, same technology, all in use: the economy picks a different point on the same curve.'][ev.v];
    var pick = [ev.v].concat(R.sample([0, 1, 2, 3, 4, 5].filter(function (x) { return x !== ev.v; }), 3));
    return P('An economy makes ' + g[0] + ' and ' + g[1] + '. ' + fill(ev.s) + ' What happens on its production possibilities graph?', mc(ch[ev.v], pick.slice(1).map(function (x) { return ch[x]; })),
      [why, '<b>' + ch[ev.v] + '</b>.'], 'Did the economy gain or lose resources or technology, or only change how many of them it uses?', null, { kind: 'shift', v: ev.v, s: ev.s });
  });

  var TRADE_P = [['Ana', 'Ben'], ['Kofi', 'Lena'], ['Mexico', 'Canada'], ['Country X', 'Country Y'], ['Ruth', 'Sam'], ['India', 'Brazil']];
  var TRADE_G = [['bread', 'shirts', 'loaf of bread', 'shirt', 'loaves', 'shirts'], ['corn', 'bikes', 'bushel of corn', 'bike', 'bushels', 'bikes'], ['cheese', 'wine', 'pound of cheese', 'bottle of wine', 'pounds', 'bottles of wine'],
    ['fish', 'coconuts', 'fish', 'coconut', 'fish', 'coconuts'], ['phones', 'shoes', 'phone', 'pair of shoes', 'phones', 'pairs of shoes']];
  // two producers whose opportunity costs differ; output table out[i] = [max of good 1, max of good 2] per period
  function tradeSetup(R, input) {
    var t, oc0, oc1, tries = 0;
    do {
      if (input) t = [[R.int(1, 6), R.int(1, 6)], [R.int(1, 6), R.int(1, 6)]];
      else t = [[R.int(2, 12), R.int(2, 12)], [R.int(2, 12), R.int(2, 12)]];
      oc0 = input ? t[0][0] / t[0][1] : t[0][1] / t[0][0]; oc1 = input ? t[1][0] / t[1][1] : t[1][1] / t[1][0];
      tries++;
    } while ((M.abs(oc0 - oc1) < 1e-9 || t[0][0] === t[1][0] || t[0][1] === t[1][1]) && tries < 100);
    return { t: t, oc: [oc0, oc1] };
  }
  function ocQ(st, i, input, good) { // opportunity cost of one unit of good (0 or 1) for producer i, as Q
    var r = st.t[i]; if (input) return good === 0 ? Q(r[0], r[1]) : Q(r[1], r[0]); return good === 0 ? Q(r[1], r[0]) : Q(r[0], r[1]);
  }
  function tradeTable(st, pn, gd, input) {
    var hd = input ? ['Hours per ' + gd[2], 'Hours per ' + gd[3]] : [cap(gd[4]) + ' of ' + gd[0] + ' per day', cap(gd[5]) + ' per day'];
    if (!input && gd[0] === gd[4]) hd[0] = cap(gd[0]) + ' per day';
    return htmlTable(['', hd[0], hd[1]], [0, 1].map(function (i) { return [pn[i], st.t[i][0], st.t[i][1]]; }));
  }
  G('micro.comparative-advantage', function (R, ctx) {
    var L = ctx.level || 1, pn = R.pick(TRADE_P), gd = R.pick(TRADE_G), input = L === 3 ? R.chance(0.6) : L === 2 ? R.chance(0.3) : false;
    var st = tradeSetup(R, input), good = R.int(0, 1), gname = good === 0 ? gd[0] : gd[1], unitOne = good === 0 ? gd[2] : gd[3], otherPl = good === 0 ? gd[5] : gd[4] + (gd[0] === gd[4] ? '' : ' of ' + gd[0]);
    var lead = input ? 'The table shows how many hours of labor each needs to make one unit.' : 'The table shows how much each can make in a day (making only that good).';
    var intro = pn[0] + ' and ' + pn[1] + ' can make ' + gd[0] + ' and ' + gd[1] + '. ' + lead + tradeTable(st, pn, gd, input);
    var oc = [ocQ(st, 0, input, good), ocQ(st, 1, input, good)], winner = oc[0].lt(oc[1]) ? 0 : 1;
    var ocSteps = [0, 1].map(function (i) {
      var r = st.t[i];
      if (input) return pn[i] + ': the ' + r[good] + ' hours for one ' + unitOne + ' could make $' + r[good] + ' \\div ' + r[1 - good] + ' = ' + oc[i].toTex() + '$ ' + otherPl + '.';
      return pn[i] + ': making ' + r[good] + ' ' + (good === 0 ? gd[4] : gd[5]) + ' means giving up ' + r[1 - good] + ' ' + otherPl + ', so one costs $\\dfrac{' + r[1 - good] + '}{' + r[good] + '} = ' + oc[i].toTex() + '$ ' + otherPl + '.';
    });
    var shape = L === 1 ? R.pick(['oc', 'ca', 'abs']) : R.pick(['oc', 'ca', 'ca', 'abs']);
    if (shape === 'oc') {
      var who = R.int(0, 1);
      return P(intro + 'What is ' + pn[who] + '’s opportunity cost of one ' + unitOne + ', in ' + otherPl + '?', ratioAns(oc[who].num(), oc[who].den()), [ocSteps[who]].concat(input ? ['In an input table, the hours spent on one unit are measured against the hours one unit of the other good takes.'] : []),
        input ? 'How many units of the other good could the same hours have made?' : 'Divide what is given up by what is made.', otherPl, { kind: 'oc', t: st.t, input: input, who: who, good: good });
    }
    if (shape === 'ca') {
      return P(intro + 'Who has the <b>comparative</b> advantage in ' + gname + '?', keep([pn[0], pn[1], 'Neither: they have the same opportunity cost'], winner),
        ocSteps.concat(['The lower opportunity cost wins: <b>' + pn[winner] + '</b> has the comparative advantage in ' + gname + '.']),
        'Compare opportunity costs, not amounts.', null, { kind: 'ca', t: st.t, input: input, good: good, v: winner });
    }
    var r0 = st.t[0][good], r1 = st.t[1][good], absW = input ? (r0 < r1 ? 0 : 1) : (r0 > r1 ? 0 : 1);
    return P(intro + 'Who has the <b>absolute</b> advantage in ' + gname + '?', keep([pn[0], pn[1], 'Neither: they are equally productive'], absW),
      [input ? 'In an input table a <b>smaller</b> number is better: fewer hours per unit.' : 'In an output table a bigger number is better: more per day.', pn[0] + ': ' + r0 + ', ' + pn[1] + ': ' + r1 + '. <b>' + pn[absW] + '</b> has the absolute advantage in ' + gname + '.'],
      input ? 'Who needs fewer hours?' : 'Who makes more in a day?', null, { kind: 'abs', t: st.t, input: input, good: good, v: absW });
  });

  G('micro.gains-from-trade', function (R, ctx) {
    var L = ctx.level || 1, pn = R.pick(TRADE_P), gd = R.pick(TRADE_G);
    var st, oc, tries = 0;
    do { st = tradeSetup(R, false); oc = [ocQ(st, 0, false, 0), ocQ(st, 1, false, 0)]; tries++; } while ((oc[0].sub(oc[1]).abs().lt(Q(1, 4)) || !oc[0].isTerminating() || !oc[1].isTerminating()) && tries < 200);
    var lo = Q.min(oc[0], oc[1]), hi = Q.max(oc[0], oc[1]), xs = oc[0].lt(oc[1]) ? 0 : 1, ys = 1 - xs;
    var intro = pn[0] + ' and ' + pn[1] + ' can make ' + gd[0] + ' and ' + gd[1] + '. The table shows how much each can make in a day (making only that good).' + tradeTable(st, pn, gd, false);
    var unit2 = gd[5], one1 = gd[2];
    var ocLines = [0, 1].map(function (i) { return pn[i] + ': one ' + one1 + ' costs $' + oc[i].toTex() + '$ ' + unit2 + '.'; });
    var shape = L === 1 ? R.pick(['terms', 'bound']) : R.pick(['terms', 'bound', 'consume', 'total']);
    if (shape === 'total' && !(st.t[xs][0] > st.t[ys][0] && st.t[ys][1] > st.t[xs][1])) shape = 'consume';
    if (shape === 'terms') {
      var mid = lo.add(hi).div(2), good = mid, bads = [lo.div(2), hi.mul(2), hi.add(lo)].filter(function (b) { return !b.eq(good); });
      var fmtT = function (q) { return '$' + q.toTex() + '$ ' + unit2 + ' per ' + one1; };
      return P(intro + 'Which terms of trade would let <b>both</b> gain if they specialize and trade ' + gd[0] + ' for ' + gd[1] + '?', mc(fmtT(good), bads.slice(0, 3).map(fmtT)),
        ocLines.concat(['Both gain only when the price of a ' + one1 + ' lies between $' + lo.toTex() + '$ and $' + hi.toTex() + '$ ' + unit2 + '.', '$' + good.toTex() + '$ is in that band; the others are outside it, so one side would refuse.']),
        'Find each producer’s opportunity cost of one ' + one1 + '. The price must lie between them.', null, { kind: 'terms', t: st.t, good: good.toPlain(), lo: lo.toPlain(), hi: hi.toPlain() });
    }
    if (shape === 'bound') {
      var seller = R.coin(), who = seller ? xs : ys;
      return P(intro + 'They will specialize and trade ' + gd[0] + ' for ' + gd[1] + '. ' + (seller ? 'What is the <b>lowest</b> number of ' + unit2 + ' per ' + one1 + ' that ' + pn[xs] + ' would accept for selling ' + gd[0] + '?' : 'What is the <b>highest</b> number of ' + unit2 + ' per ' + one1 + ' that ' + pn[ys] + ' would pay to buy ' + gd[0] + '?'),
        ratioAns(oc[who].num(), oc[who].den()),
        ocLines.concat([seller ? pn[xs] + ' has the comparative advantage in ' + gd[0] + ' and will sell them. Selling for less than $' + oc[xs].toTex() + '$ ' + unit2 + ' would be worse than making ' + gd[1] + ' directly.' : pn[ys] + ' will buy ' + gd[0] + '. Paying more than $' + oc[ys].toTex() + '$ ' + unit2 + ' would be worse than making them directly.', 'So the limit is <b>$' + oc[who].toTex() + '$</b> ' + unit2 + ' per ' + one1 + ', ' + pn[who] + '’s own opportunity cost.']),
        'Each side compares the price with its own opportunity cost.', unit2, { kind: 'bound', t: st.t, who: who });
    }
    if (shape === 'consume') {
      var mid2 = lo.add(hi).div(2), mx = st.t[xs][0], k = M.max(1, M.round(mx / R.pick([2, 3]))), get = mid2.mul(k);
      return P(intro + pn[xs] + ' specializes in ' + gd[0] + ' and trades ' + k + ' ' + (k === 1 ? one1 : gd[4] + (gd[0] === gd[4] ? '' : ' of ' + gd[0])) + ' to ' + pn[ys] + ' at $' + mid2.toTex() + '$ ' + unit2 + ' each. How many ' + unit2 + ' does ' + pn[xs] + ' get?', exact(get),
        ['The price is $' + mid2.toTex() + '$ ' + unit2 + ' per ' + one1 + '.', 'For ' + k + ': $' + k + ' \\times ' + mid2.toTex() + ' = ' + get.toTex() + '$ ' + unit2 + '.', 'If ' + pn[xs] + ' had used that time to make ' + gd[1] + ' instead, it would have made only $' + k + ' \\times ' + oc[xs].toTex() + ' = ' + oc[xs].mul(k).toTex() + '$ ' + unit2 + ', so trading gives more.'],
        'Multiply the number traded by the price per unit.', unit2, { kind: 'consume', t: st.t, k: k, price: mid2.toPlain(), xs: xs });
    }
    // total output gain from specializing, compared with each splitting the day in half
    var before1 = Q(st.t[0][0] + st.t[1][0], 2), before2 = Q(st.t[0][1] + st.t[1][1], 2);
    var after1 = st.t[xs][0], after2 = st.t[ys][1], ask1 = R.coin();
    var gain = ask1 ? Q(after1).sub(before1) : Q(after2).sub(before2);
    return P(intro + 'Before trade, each spends half the day on each good. Then ' + pn[xs] + ' makes only ' + gd[0] + ' and ' + pn[ys] + ' makes only ' + gd[1] + '. By how much does total production of ' + (ask1 ? gd[0] : gd[1]) + ' rise?', exact(gain),
      ['Before: half of each maximum: $\\tfrac{1}{2}(' + st.t[0][0] + ' + ' + st.t[1][0] + ') = ' + before1.toTex() + '$ ' + gd[4] + ' and $\\tfrac{1}{2}(' + st.t[0][1] + ' + ' + st.t[1][1] + ') = ' + before2.toTex() + '$ ' + gd[5] + '.',
        'After: ' + pn[xs] + ' makes ' + after1 + ' ' + gd[4] + ' and ' + pn[ys] + ' makes ' + after2 + ' ' + gd[5] + '.', 'Change in ' + (ask1 ? gd[0] : gd[1]) + ': $' + (ask1 ? after1 + ' - ' + before1.toTex() : after2 + ' - ' + before2.toTex()) + ' = ' + gain.toTex() + '$.'],
      'Add up both producers’ output before and after.', ask1 ? gd[4] : gd[5], { kind: 'total', t: st.t, xs: xs, ask1: ask1 });
  });

  // =================================================================== Unit 3: Thinking at the Margin
  function cumsum(a) { var s = 0; return a.map(function (v) { s += v; return s; }); }
  var MB_CTX = [
    { what: 'hours a food truck stays open at a festival', unit: 'hour', units: 'hours', head: 'Hours open' },
    { what: 'extra workers a farm hires for the harvest weekend', unit: 'worker', units: 'workers', head: 'Workers' },
    { what: 'batches of cookies a bake sale makes', unit: 'batch', units: 'batches', head: 'Batches' },
    { what: 'hours a tutor works on Saturday', unit: 'hour', units: 'hours', head: 'Hours' },
    { what: 'ads a shop runs this month', unit: 'ad', units: 'ads', head: 'Ads' }
  ];
  // MB falling and MC rising with no ties; best = last unit with MB > MC
  function mbmc(R, n) {
    var best = R.int(2, n - 2), mb = [], mc = [], i;
    for (var t = 0; t < 200; t++) {
      mb = []; mc = []; var b = R.int(16, 30), c = R.int(2, 8);
      for (i = 0; i < n; i++) { mb.push(b); mc.push(c); b -= R.int(2, 6); c += R.int(2, 6); if (b < 1) b = 1; }
      var ok = true, last = 0; for (i = 0; i < n; i++) { if (mb[i] === mc[i]) ok = false; if (mb[i] > mc[i]) { if (last !== i) ok = false; last = i + 1; } }
      if (ok && last === best) break;
    }
    return { mb: mb, mc: mc, best: last };
  }
  G('micro.marginal-analysis', function (R, ctx) {
    var L = ctx.level || 1, cx = R.pick(MB_CTX), n = 6, s = mbmc(R, n), TB = cumsum(s.mb), TC = cumsum(s.mc), NB = TB.map(function (v, i) { return v - TC[i]; });
    var rows = [[0, money(0), money(0)]].concat(TB.map(function (v, i) { return [i + 1, money(v), money(TC[i])]; }));
    var tbl = htmlTable([cx.head, 'Total benefit', 'Total cost'], rows), best = s.best;
    var intro = 'The table shows the total benefit and total cost of different numbers of ' + cx.what + '.' + tbl;
    var mline = s.mb.map(function (v, i) { return (i + 1) + ': MB ' + money(v) + ', MC ' + money(s.mc[i]); }).join('; ');
    var shape = L === 1 ? R.pick(['best', 'marg']) : R.pick(['best', 'best', 'net', 'marg', 'sunk']);
    if (shape === 'marg') {
      var k = R.int(2, n), isB = R.coin();
      return P(intro + 'What is the marginal ' + (isB ? 'benefit' : 'cost') + ' of ' + cx.unit + ' ' + k + '?', dollars(isB ? s.mb[k - 1] : s.mc[k - 1]),
        ['Marginal ' + (isB ? 'benefit' : 'cost') + ' is the change in the total from one more unit.', 'From ' + (k - 1) + ' to ' + k + ': $' + money(isB ? TB[k - 1] : TC[k - 1]) + ' - ' + money(k - 1 ? (isB ? TB[k - 2] : TC[k - 2]) : 0) + ' = ' + money(isB ? s.mb[k - 1] : s.mc[k - 1]) + '$.'],
        'Subtract the total for ' + (k - 1) + ' from the total for ' + k + '.', 'dollars', { kind: 'marg', tb: TB, tc: TC, k: k, isB: isB });
    }
    if (shape === 'sunk') {
      var sunk = R.int(2, 10) * 10;
      return P('Before deciding, the business already spent ' + money(sunk) + ' on a permit it can’t get back. ' + intro + 'How many ' + cx.units + ' should it choose?', exact(best),
        ['The ' + money(sunk) + ' is sunk: it is spent whatever the choice, so it is left out.', 'Marginal values (' + cx.unit + ' number: MB, MC): ' + mline + '.', 'Keep going while MB is at least MC. That holds through ' + cx.unit + ' ' + best + ' and fails at ' + cx.unit + ' ' + (best + 1) + '.', 'Best choice: <b>' + best + '</b>, the same as with no permit at all.'],
        'Find each unit’s MB and MC from the changes in the totals. The permit doesn’t change any of them.', cx.units, { kind: 'best', tb: TB, tc: TC });
    }
    if (shape === 'net') {
      return P(intro + 'What is the largest net benefit (total benefit minus total cost) the business can get?', dollars(NB[best - 1]),
        ['Marginal values (' + cx.unit + ' number: MB, MC): ' + mline + '.', 'Keep going while MB is at least MC: through ' + cx.unit + ' ' + best + '.', 'Net benefit there: $' + money(TB[best - 1]) + ' - ' + money(TC[best - 1]) + ' = ' + money(NB[best - 1]) + '$.'],
        'Find the best quantity first, then subtract the totals.', 'dollars', { kind: 'net', tb: TB, tc: TC });
    }
    return P(intro + 'How many ' + cx.units + ' give the largest net benefit?', exact(best),
      ['Find each unit’s marginal benefit and marginal cost as the change in the totals: ' + mline + '.', 'Keep going while MB is at least MC. That holds through ' + cx.unit + ' ' + best + '; at ' + cx.unit + ' ' + (best + 1) + ', MB (' + money(s.mb[best]) + ') is less than MC (' + money(s.mc[best]) + ').', 'Net benefit at ' + best + ': $' + money(TB[best - 1]) + ' - ' + money(TC[best - 1]) + ' = ' + money(NB[best - 1]) + '$, the largest in the table.'],
      'Compare MB and MC one unit at a time.', cx.units, { kind: 'best', tb: TB, tc: TC });
  });

  var MU_GOODS = [['slices of pizza', 'slice'], ['tacos', 'taco'], ['songs from a new album', 'song'], ['scoops of ice cream', 'scoop'], ['hours of video games', 'hour'], ['cups of coffee', 'cup']];
  G('micro.marginal-utility', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(MU_GOODS), n = 6, mu = [], v = R.int(14, 30);
    var negAt = L === 1 ? -1 : R.pick([-1, 5, 6]);
    for (var i = 0; i < n; i++) { mu.push(v); v -= R.int(2, 6); if (v < 1) v = R.int(1, 2); }
    for (i = 1; i < n; i++) if (mu[i] >= mu[i - 1]) mu[i] = mu[i - 1] - 1;
    if (negAt > 0) { mu[negAt - 1] = -R.int(1, 4); for (i = negAt; i < n; i++) mu[i] = mu[i - 1] - R.int(1, 3); }
    mu = mu.map(function (x) { return x === 0 ? -1 : x; });
    var tu = cumsum(mu), tbl = htmlTable(['Units', 'Total utility (utils)'], tu.map(function (t, i) { return [i + 1, t]; }));
    var shape = L === 1 ? R.pick(['mu', 'mu', 'tu']) : R.pick(['mu', 'tu', 'peak', 'tf']);
    if (shape === 'mu') {
      var k = R.int(2, n);
      return P('The table shows a student’s total utility from ' + g[0] + ' in one day.' + tbl + 'What is the marginal utility of ' + g[1] + ' number ' + k + '?', exact(mu[k - 1]),
        ['Marginal utility is the change in total utility from one more unit.', '$MU = ' + tu[k - 1] + ' - ' + T.p(tu[k - 2]) + ' = ' + mu[k - 1] + '$ utils.' + (mu[k - 1] < 0 ? ' It is negative: that ' + g[1] + ' made the student worse off.' : '')],
        'Subtract the total for one fewer unit.', 'utils', { kind: 'mu', tu: tu, k: k });
    }
    if (shape === 'tu') {
      var m = R.int(3, n), mus = mu.slice(0, m);
      return P('The marginal utility of each of the first ' + m + ' ' + g[0] + ' a student consumes is ' + U.list(mus.map(String)) + ' utils, in that order. What is the total utility of ' + m + ' ' + g[0] + '?', exact(tu[m - 1]),
        ['Total utility is the running sum of the marginal utilities.', '$' + T.terms(mus.map(function (x, j) { return [x, '']; })) + ' = ' + tu[m - 1] + '$ utils.'],
        'Add the marginal utilities.', 'utils', { kind: 'tu', mu: mus });
    }
    if (shape === 'peak') {
      var top = tu.indexOf(M.max.apply(null, tu)) + 1;
      return P('The table shows a student’s total utility from ' + g[0] + ' in one day.' + tbl + 'How many ' + g[0] + ' give the most total utility?', exact(top),
        ['Marginal utilities: ' + mu.join(', ') + '.', 'Total utility rises as long as marginal utility is positive.', top === n ? 'Every marginal utility is positive, so the total is highest at ' + n + '.' : 'The marginal utility of ' + g[1] + ' ' + (top + 1) + ' is negative, so the total is highest at <b>' + top + '</b>.'],
        'Where does marginal utility stop being positive?', g[0].split(' ')[0], { kind: 'peak', tu: tu });
    }
    var t = R.pick([
      { s: 'When marginal utility falls but is still positive, total utility rises.', v: true, why: 'Each unit still adds something, just less than the one before.' },
      { s: 'Total utility starts to fall as soon as marginal utility starts to fall.', v: false, why: 'Total utility falls only when marginal utility is negative. A smaller positive MU still raises the total.' },
      { s: 'Total utility is largest where marginal utility reaches zero.', v: true, why: 'Before that point each unit adds utility; after it, each unit takes some away.' },
      { s: 'Diminishing marginal utility means the total utility of a good falls the more you consume.', v: false, why: 'It means each extra unit adds less. The total keeps rising while MU is positive.' }
    ]);
    return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Total utility is the running sum of marginal utilities.', null, { kind: 'tf', s: t.s, v: t.v });
  });

  var UM_GOODS = [['pizza slices', 'pizza slice', 'books', 'book'], ['apples', 'apple', 'movies', 'movie'], ['tacos', 'taco', 'smoothies', 'smoothie'], ['songs', 'song', 'games', 'game'], ['bagels', 'bagel', 'juices', 'juice']];
  // MU-per-dollar ladders with a unique utility-maximizing bundle (checked by brute force)
  function umSetup(R) {
    for (var t = 0; t < 400; t++) {
      var px = R.int(1, 5), py = R.intNot(1, 5, px), xs = R.int(2, 4), ys = R.int(2, 4), v = R.int(5, 9);
      var rx = ladder(R, xs, v), ry = ladder(R, ys, v);
      var MUx = rx.map(function (r) { return r * px; }), MUy = ry.map(function (r) { return r * py; }), I = px * xs + py * ys;
      var TUx = [0].concat(cumsum(MUx)), TUy = [0].concat(cumsum(MUy)), best = null, bv = -1, ties = 0;
      for (var a = 0; a <= 6; a++) for (var b = 0; b <= 6; b++) if (px * a + py * b <= I) { var u = TUx[a] + TUy[b]; if (u > bv) { bv = u; best = [a, b]; ties = 0; } else if (u === bv) ties++; }
      if (best[0] === xs && best[1] === ys && !ties) return { px: px, py: py, MUx: MUx, MUy: MUy, I: I, xs: xs, ys: ys, v: v, rx: rx, ry: ry };
    }
    return null;
  }
  function ladder(R, pos, v) { // 6 strictly falling per-dollar values with v at 1-based position pos
    var above = R.sample(U.range(v + 1, v + 10), pos - 1).sort(function (a, b) { return b - a; }), below = R.sample(U.range(1, v - 1), M.min(6 - pos, v - 1)).sort(function (a, b) { return b - a; });
    while (below.length < 6 - pos) below.push(below.length ? below[below.length - 1] : 1);
    return above.concat([v], below.map(function (x, i) { return x; }));
  }
  G('micro.utility-maximizing-rule', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(UM_GOODS), s = umSetup(R); if (!s) s = { px: 1, py: 2, MUx: [10, 8, 6, 4, 2, 1], MUy: [24, 16, 12, 8, 4, 2], I: 9, xs: 3, ys: 3, v: 6, rx: [10, 8, 6, 4, 2, 1], ry: [12, 8, 6, 4, 2, 1] };
    // strictly falling MUs for the table (repeated low rungs are lowered)
    var tbl = htmlTable(['Units', 'MU of ' + g[0] + ' (' + money(s.px) + ' each)', 'MU of ' + g[2] + ' (' + money(s.py) + ' each)'], s.MUx.map(function (m, i) { return [i + 1, m, s.MUy[i]]; }));
    var intro = 'Ravi has ' + money(s.I) + ' to spend on ' + g[0] + ' and ' + g[2] + '. The table shows the marginal utility (utils) of each unit.' + tbl;
    var steps0 = ['Divide each MU by its price. ' + cap(g[0]) + ': ' + s.rx.join(', ') + ' utils per dollar. ' + cap(g[2]) + ': ' + s.ry.join(', ') + ' utils per dollar.',
      'Buy whichever unit gives more utility per dollar, until the money runs out. Both ratios reach ' + s.v + ' at ' + s.xs + ' ' + g[0] + ' and ' + s.ys + ' ' + g[2] + '.',
      'Cost: $' + s.xs + '(' + money(s.px) + ') + ' + s.ys + '(' + money(s.py) + ') = ' + money(s.I) + '$, the whole budget.'];
    var shape = L === 1 ? R.pick(['ratio', 'next']) : R.pick(['x', 'y', 'both', 'next', 'ratio']);
    var chk = { kind: shape, px: s.px, py: s.py, MUx: s.MUx, MUy: s.MUy, I: s.I };
    if (shape === 'ratio') {
      var k = R.int(1, 4), isX = R.coin(), mu0 = isX ? s.MUx[k - 1] : s.MUy[k - 1], pr = isX ? s.px : s.py;
      chk.k = k; chk.isX = isX;
      return P(intro + 'What is the marginal utility per dollar of ' + (isX ? g[1] : g[3]) + ' number ' + k + '?', exact(Q(mu0, pr)),
        ['Divide the marginal utility by the price: $' + dfr(mu0, nx(pr)) + ' = ' + nx(Q(mu0, pr)) + '$ utils per dollar.'], 'MU divided by price.', 'utils per dollar', chk);
    }
    if (shape === 'next') {
      var a, b; do { a = R.int(0, 4); b = R.int(0, 4); } while (s.MUx[a] / s.px === s.MUy[b] / s.py);
      var rxa = s.MUx[a] / s.px, ryb = s.MUy[b] / s.py, xw = rxa > ryb;
      chk.a = a; chk.b = b;
      var ch = ['Another ' + g[1], 'Another ' + g[3]], wrongWhy = 'Another ' + g[1];
      return P(intro + 'Ravi has already bought ' + cnt(a, g[1], g[0]) + ' and ' + cnt(b, g[3], g[2]) + '. To get the most utility, which should his next purchase be?', keep(ch, xw ? 0 : 1),
        ['The next ' + g[1] + ' gives $' + dfr(s.MUx[a], nx(s.px)) + ' = ' + nx(Q(s.MUx[a], s.px)) + '$ utils per dollar.', 'The next ' + g[3] + ' gives $' + dfr(s.MUy[b], nx(s.py)) + ' = ' + nx(Q(s.MUy[b], s.py)) + '$ utils per dollar.', 'Buy the one with more utility per dollar: <b>another ' + (xw ? g[1] : g[3]) + '</b>' + ((xw ? s.MUx[a] < s.MUy[b] : s.MUy[b] < s.MUx[a]) ? ', even though its marginal utility alone is smaller.' : '.')],
        'Compare MU divided by price, not MU alone.', null, chk);
    }
    if (shape === 'both') return P(intro + 'Which bundle gives Ravi the most total utility?', { t: 'multi', parts: [{ label: cap(g[0]) + ':', a: exact(s.xs) }, { label: cap(g[2]) + ':', a: exact(s.ys) }] }, steps0, 'Keep buying the unit with the most utility per dollar.', null, chk);
    var isX2 = shape === 'x';
    return P(intro + 'To get the most total utility, how many ' + (isX2 ? g[0] : g[2]) + ' should he buy?', exact(isX2 ? s.xs : s.ys), steps0.concat(['So he buys <b>' + (isX2 ? s.xs + ' ' + g[0] : s.ys + ' ' + g[2]) + '</b>.']),
      'Divide each MU by its price, then buy the best value first.', isX2 ? g[0] : g[2], chk);
  });

  // =================================================================== Unit 4: Supply and Demand
  var SD_GOODS = [['coffee', 'cups of coffee', 'cup'], ['bicycles', 'bicycles', 'bicycle'], ['movie tickets', 'movie tickets', 'ticket'], ['pizza', 'pizzas', 'pizza'], ['sneakers', 'pairs of sneakers', 'pair'],
    ['strawberries', 'boxes of strawberries', 'box'], ['concert tickets', 'concert tickets', 'ticket'], ['phone cases', 'phone cases', 'case'], ['notebooks', 'notebooks', 'notebook'], ['tacos', 'tacos', 'taco']];
  // a linear market with whole-number equilibrium: Qd = a - bP, Qs = c + dP, supply starting at a positive price (c <= 0)
  function mkMarket(R, opt) {
    opt = opt || {};
    for (var t = 0; t < 200; t++) {
      var P = R.int(opt.pmin || 3, opt.pmax || 12), b = R.int(1, opt.bmax || 5), d = R.int(1, opt.dmax || 5), Qs = R.int(4, 12) * (opt.qmul || 1);
      var a = Qs + b * P, c = Qs - d * P;
      if (c <= 0 && a > 0 && (opt.ok ? opt.ok(a, b, c, d, P, Qs) : true)) return { a: a, b: b, c: c, d: d, P: P, Q: Qs };
    }
    return { a: 20, b: 2, c: -4, d: 2, P: 6, Q: 8 };
  }
  function mktViz(m, extra) { var o = { demand: { a: m.a, b: m.b }, supply: { c: m.c, d: m.d }, quiet: true, interactive: false, money: true }; if (extra) for (var k in extra) o[k] = extra[k]; return { name: 'ec-market', opts: o }; }

  G('micro.law-of-demand', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), shape = L === 1 ? R.pick(['qd', 'qd', 'sum']) : R.pick(['qd', 'rev', 'sum', 'tf']);
    var b = R.int(2, 10), P0 = R.int(2, 9), a = b * P0 + R.int(2, 12) * b;
    if (shape === 'qd') {
      var pq = R.int(1, M.floor(a / b) - 1);
      return P('Daily demand for ' + g[0] + ' in a town is $' + qdTex(a, b) + '$, with $P$ in dollars. What is the quantity demanded at a price of ' + money(pq) + '?', exact(a - b * pq),
        ['Substitute $P = ' + pq + '$: $Q_d = ' + a + ' - ' + b + '(' + pq + ') = ' + a + ' - ' + (b * pq) + ' = ' + (a - b * pq) + '$.'], 'Put the price into the equation.', g[1], { kind: 'qd', a: a, b: b, P: pq });
    }
    if (shape === 'rev') {
      var Pt = R.int(1, M.floor(a / b) - 1), qt = a - b * Pt;
      return P('Daily demand for ' + g[0] + ' is $' + qdTex(a, b) + '$, with $P$ in dollars. At what price is the quantity demanded ' + qt + '?', dollars(Pt),
        ['Set $' + a + ' - ' + b + 'P = ' + qt + '$.', 'Then $' + b + 'P = ' + (a - qt) + '$, so $P = ' + Pt + '$.', 'Check: $' + a + ' - ' + b + '(' + Pt + ') = ' + qt + '$.'], 'Set the equation equal to the quantity and solve for P.', 'dollars', { kind: 'rev', a: a, b: b, q: qt });
    }
    if (shape === 'sum') {
      var names = R.sample(['Ana', 'Ben', 'Cy', 'Dee', 'Eli', 'Fay'], 3), pr = R.int(2, 6), qs = names.map(function () { return R.int(0, 9); });
      var tot = qs.reduce(function (x, y) { return x + y; }, 0);
      return P('At a price of ' + money(pr) + ', ' + names[0] + ' wants ' + qs[0] + ' ' + g[1] + ', ' + names[1] + ' wants ' + qs[1] + ' and ' + names[2] + ' wants ' + qs[2] + '. If they are the only buyers, what is the market quantity demanded at ' + money(pr) + '?', exact(tot),
        ['Market demand adds every buyer’s quantity at the same price.', '$' + qs.join(' + ') + ' = ' + tot + '$.'], 'Add across buyers.', g[1], { kind: 'sum', qs: qs });
    }
    var t = R.pick([
      { s: 'When the price of a good falls, the demand for it increases.', v: false, why: 'A lower price raises the quantity demanded, a movement along the same curve. Demand, the whole curve, does not change.' },
      { s: 'The law of demand says that, other things equal, a higher price leads to a smaller quantity demanded.', v: true, why: 'That is the statement of the law.' },
      { s: 'A demand curve shows the quantity demanded at each possible price.', v: true, why: 'Demand is the whole relationship between price and quantity demanded.' },
      { s: '“Demand” and “quantity demanded” mean the same thing.', v: false, why: 'Quantity demanded is one amount at one price; demand is the whole schedule or curve.' }
    ]);
    return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Demand is the whole curve; quantity demanded is one point on it.', null, { kind: 'tf', s: t.s, v: t.v });
  });

  G('micro.demand-equations', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), b = R.pick([1, 2, 2, 4, 5, 10]), p0 = R.int(4, 15), a = b * p0;
    var shape = L === 1 ? R.pick(['pint', 'qint', 'slope']) : R.pick(['pint', 'slope', 'inverse', 'fromInv', 'qintInv']);
    var eq = '$' + qdTex(a, b) + '$';
    if (shape === 'pint') return P('Demand for ' + g[0] + ' is ' + eq + ', with $P$ in dollars. At what price does the quantity demanded fall to zero (the price intercept)?', dollars(p0),
      ['Set $Q_d = 0$: $0 = ' + a + ' - ' + (b === 1 ? '' : b) + 'P$.', '$P = ' + a + ' \\div ' + b + ' = ' + p0 + '$.'], 'Set the quantity to zero and solve for P.', 'dollars', { kind: 'pint', a: a, b: b });
    if (shape === 'qint') return P('Demand for ' + g[0] + ' is ' + eq + ', with $P$ in dollars. What is the quantity demanded at a price of zero (the quantity intercept)?', exact(a),
      ['Set $P = 0$: $Q_d = ' + a + ' - 0 = ' + a + '$.'], 'Set the price to zero.', g[1], { kind: 'qint', a: a, b: b });
    if (shape === 'slope') return P('Demand for ' + g[0] + ' is ' + eq + '. Graphed with price on the vertical axis and quantity on the horizontal axis, what is the slope of the demand curve?', ratioAns(-1, b),
      ['Intercepts: quantity ' + a + ' (at $P = 0$) and price ' + p0 + ' (at $Q = 0$).', 'Slope $= \\dfrac{\\text{rise}}{\\text{run}} = \\dfrac{0 - ' + p0 + '}{' + a + ' - 0} = ' + T.frac(-1, b) + '$.', 'It is $-\\dfrac{1}{b}$' + (b === 1 ? '' : ', not $-' + b + '$') + ': price is on the vertical axis.'],
      'Find both intercepts, then compute rise over run with price as the rise.', null, { kind: 'slope', a: a, b: b });
    if (shape === 'inverse') {
      var v = b === 1 ? p0 + ' - Q' : p0 + ' - Q/' + b;
      return P('Demand for ' + g[0] + ' is ' + eq + '. Write the inverse demand: price in terms of quantity. $P =$', { t: 'expr', v: v, vars: ['Q'] },
        ['Start from $Q = ' + a + ' - ' + (b === 1 ? '' : b) + 'P$.', 'Move the price term: $' + (b === 1 ? '' : b) + 'P = ' + a + ' - Q$.', b === 1 ? 'So $P = ' + p0 + ' - Q$.' : 'Divide by ' + b + ': $P = ' + p0 + ' - \\dfrac{Q}{' + b + '}$.'],
        'Solve the equation for P.', null, { kind: 'inverse', a: a, b: b });
    }
    // from an inverse form P = p0 - sQ
    var s = R.pick([Q(1, 2), Q(1, 4), Q(1), Q(2), Q(1, 5)]), pp = R.int(6, 20), qmax = Q(pp).div(s);
    if (!qmax.isInt()) { s = Q(1, 2); }
    qmax = Q(pp).div(s);
    var invTex = 'P = ' + pp + ' - ' + (s.eq(1) ? '' : s.isInt() ? s.toTex() : T.num(s.toNumber())) + 'Q';
    if (shape === 'qintInv') return P('Inverse demand for ' + g[0] + ' is $' + invTex + '$, with $P$ in dollars. What is the quantity demanded when the price is zero?', exact(qmax),
      ['Set $P = 0$: $0 = ' + pp + ' - ' + (s.eq(1) ? '' : T.num(s.toNumber())) + 'Q$.', '$Q = ' + pp + ' \\div ' + T.num(s.toNumber()) + ' = ' + qmax.toTex() + '$.'], 'Set the price to zero and solve for Q.', g[1], { kind: 'qintInv', pp: pp, s: s.toPlain() });
    var Pa = R.int(1, pp - 1), qa = Q(pp - Pa).div(s); if (!qa.isInt()) { Pa = pp - s.mul(R.int(1, qmax.num() - 1)).toNumber(); qa = Q(pp - Pa).div(s); }
    return P('Inverse demand for ' + g[0] + ' is $' + invTex + '$, with $P$ in dollars. What quantity is demanded at a price of ' + money(Pa) + '?', exact(qa),
      ['Set $' + Pa + ' = ' + pp + ' - ' + (s.eq(1) ? '' : T.num(s.toNumber())) + 'Q$.', '$' + (s.eq(1) ? '' : T.num(s.toNumber())) + 'Q = ' + (pp - Pa) + '$, so $Q = ' + qa.toTex() + '$.', 'Equivalently, $Q_d = ' + qmax.toTex() + ' - ' + (s.inv().eq(1) ? '' : s.inv().toTex()) + 'P$, and $' + qmax.toTex() + ' - ' + s.inv().toTex() + '(' + Pa + ') = ' + qa.toTex() + '$.'],
      'Put the price in and solve for Q, or rewrite as Q in terms of P first.', g[1], { kind: 'fromInv', pp: pp, s: s.toPlain(), P: Pa });
  });

  var MOVE_CH = ['An increase in quantity demanded (a movement along the demand curve)', 'A decrease in quantity demanded (a movement along the demand curve)', 'An increase in demand (the demand curve shifts right)', 'A decrease in demand (the demand curve shifts left)'];
  var D_EVENTS = [
    { s: 'The price of {G} falls.', v: 0 }, { s: 'The price of {G} rises.', v: 1 }, { s: 'Stores cut the price of {G} for a holiday sale.', v: 0, lv: 2 }, { s: 'Sellers raise the price of {G} by 20 percent.', v: 1, lv: 2 },
    { s: 'A popular study reports that {G} are great for your health.', v: 2 }, { s: 'Incomes in the town rise, and {G} are a normal good.', v: 2 }, { s: 'Many new families move to the town.', v: 2 },
    { s: 'Buyers expect the price of {G} to jump next month.', v: 2, lv: 2 }, { s: 'A news story turns buyers against {G}.', v: 3 }, { s: 'Incomes fall, and {G} are a normal good.', v: 3 },
    { s: 'Incomes rise, and for these buyers {G} are an inferior good.', v: 3, lv: 3 }, { s: 'The price of a close substitute for {G} falls.', v: 3, lv: 2 }, { s: 'The price of a good used together with {G} rises.', v: 3, lv: 2 },
    { s: 'The price of a close substitute for {G} rises.', v: 2, lv: 2 }, { s: 'Buyers expect the price of {G} to fall soon.', v: 3, lv: 3 }
  ];
  var MV_WHY = ['The good’s own price changed: buyers move along the same curve to a larger quantity.', 'The good’s own price changed: buyers move along the same curve to a smaller quantity.', 'Something other than the good’s own price makes buyers want more at every price: the curve shifts right.', 'Something other than the good’s own price makes buyers want less at every price: the curve shifts left.'];
  G('micro.demand-shift-vs-movement', function (R, ctx) {
    var g = R.pick(SD_GOODS), ev = bank(R, ctx, D_EVENTS), nm = g[0];
    var s = ev.s.replace(/\{G\}/g, nm).replace(/ are (great|a normal|an inferior)/, function (m0, w) { return /s$/.test(nm) ? ' are ' + w : ' is ' + w; });
    return P('In the market for ' + nm + ': ' + s + ' Which describes the effect on the demand side?', keep(MOVE_CH.slice(), ev.v), [MV_WHY[ev.v], '<b>' + MOVE_CH[ev.v] + '</b>.'],
      'Is the thing that changed this good’s own price?', null, { kind: 'move', s: ev.s, v: ev.v });
  });

  var SHIFT3 = ['Demand increases (the curve shifts right)', 'Demand decreases (the curve shifts left)', 'Demand does not shift; only the quantity demanded changes'];
  G('micro.demand-shifters', function (R, ctx) {
    var L = ctx.level || 1, ev = bank(R, ctx, D_EVENTS), g = R.pick(SD_GOODS), nm = g[0];
    if (L >= 2 && R.chance(0.3)) { // normal or inferior from data
      var inc = R.coin(), more = R.coin(), good = R.pick(['bus trips', 'store-brand cereal', 'restaurant meals', 'new cars', 'used textbooks', 'vacations']);
      var normal = inc === more, ch = ['A normal good', 'An inferior good'];
      return P('When incomes in a city ' + (inc ? 'rose' : 'fell') + ', with prices unchanged, people bought ' + (more ? 'more' : 'fewer') + ' ' + good + ' at every price. For these buyers, ' + good + ' are…', keep(ch, normal ? 0 : 1),
        ['Income and demand moved in the ' + (normal ? 'same' : 'opposite') + ' direction.', normal ? 'Demand rises with income for a <b>normal good</b>.' : 'Demand falls as income rises (or rises as income falls) for an <b>inferior good</b>. That says nothing about quality.'],
        'Did demand move with income or against it?', null, { kind: 'normal', inc: inc, more: more });
    }
    var s = ev.s.replace(/\{G\}/g, nm).replace(/ are (great|a normal|an inferior)/, function (m0, w) { return /s$/.test(nm) ? ' are ' + w : ' is ' + w; });
    var v = ev.v < 2 ? 2 : ev.v - 2;
    return P('In the market for ' + nm + ': ' + s + ' What happens to the demand for ' + nm + '?', keep(SHIFT3.slice(), v), [MV_WHY[ev.v], '<b>' + SHIFT3[v] + '</b>.'],
      'Tastes, income, related goods, expectations and the number of buyers shift demand. The good’s own price does not.', null, { kind: 'shift', s: ev.s, v: v });
  });

  var SUBS = [['coffee', 'tea'], ['butter', 'margarine'], ['movie tickets', 'streaming subscriptions'], ['bus rides', 'train rides'], ['beef', 'chicken'], ['printed books', 'e-books'], ['taxi rides', 'ride-share trips'],
    ['apples', 'pears'], ['plane tickets', 'train tickets'], ['jeans', 'khakis'], ['bottled water', 'sports drinks'], ['pencils', 'pens'], ['paper towels', 'cloth rags']];
  var COMPS = [['coffee', 'coffee filters'], ['cars', 'gasoline'], ['printers', 'ink cartridges'], ['hot dogs', 'hot dog buns'], ['phones', 'phone cases'], ['tennis rackets', 'tennis balls'], ['game consoles', 'video games'],
    ['skis', 'ski lift tickets'], ['cameras', 'memory cards'], ['peanut butter', 'jelly'], ['grills', 'charcoal'], ['bicycles', 'bike helmets'], ['movie tickets', 'theater popcorn']];
  var SC_CH = ['Demand for B increases (shifts right)', 'Demand for B decreases (shifts left)', 'Only the quantity demanded of B changes; demand for B does not shift', 'Nothing happens in the market for B'];
  G('micro.substitutes-complements', function (R, ctx) {
    var L = ctx.level || 1, isSub = R.coin(), pr = R.pick(isSub ? SUBS : COMPS), up = R.coin(), A = pr[0], B = pr[1];
    var shape = L === 1 ? R.pick(['effect', 'effect', 'classify']) : R.pick(['effect', 'classify', 'own']);
    if (shape === 'classify') {
      var fell = R.coin(), rose = isSub ? !fell : fell;
      return P('When the price of ' + A + ' ' + (fell ? 'fell' : 'rose') + ', people bought ' + (rose ? 'more' : 'fewer') + ' ' + B + ' at every price of ' + B + '. Are ' + A + ' and ' + B + ' substitutes or complements?', keep(['Substitutes', 'Complements'], isSub ? 0 : 1),
        ['The price of ' + A + ' and the demand for ' + B + ' moved in the ' + (isSub ? 'same' : 'opposite') + ' direction.', isSub ? 'Substitutes: pricier ' + A + ' send buyers to ' + B + ', cheaper ' + A + ' pull them away.' : 'Complements: they are used together, so cheaper ' + A + ' raise the demand for ' + B + ' and pricier ' + A + ' lower it.', '<b>' + (isSub ? 'Substitutes' : 'Complements') + '</b>.'],
        'Did the price of one and the demand for the other move together or in opposite directions?', null, { kind: 'classify', sub: isSub });
    }
    if (shape === 'own') {
      var ch2 = ['The quantity demanded of ' + A + ' ' + (up ? 'falls' : 'rises') + ' (a movement along its demand curve)', 'The demand for ' + A + ' shifts ' + (up ? 'left' : 'right'), 'The demand for ' + A + ' shifts ' + (up ? 'right' : 'left'), 'Nothing happens in the market for ' + A];
      return P('The price of ' + A + ' ' + (up ? 'rises' : 'falls') + '. ' + cap(B) + ' are ' + (isSub ? 'a substitute' : 'a complement') + ' for ' + A + '. What happens in the market for <b>' + A + '</b> itself?', shuf(ch2, 0),
        ['In the ' + A + ' market, ' + A + '’ own price changed: buyers move along the demand curve for ' + A + '.', 'The curve that shifts is the one for ' + B + ', in the other market.'],
        'In its own market, a good’s price moves you along the curve.', null, { kind: 'own' });
    }
    var v = (isSub === up) ? 0 : 1, ch = SC_CH.map(function (c) { return c.replace(/\bB\b/g, B); });
    return P('The price of ' + A + ' ' + (up ? 'rises' : 'falls') + '. ' + cap(B) + ' are ' + (isSub ? 'a substitute' : 'a complement') + ' for ' + A + '. What happens in the market for ' + B + '?', keep(ch, v),
      [isSub ? (up ? 'Pricier ' + A + ' send some buyers to ' + B + '.' : 'Cheaper ' + A + ' pull some buyers away from ' + B + '.') : (up ? 'Pricier ' + A + ' mean fewer ' + A + ' are bought, so fewer ' + B + ' are needed.' : 'Cheaper ' + A + ' mean more ' + A + ' are bought, so more ' + B + ' are needed.'),
        'That changes how many ' + B + ' people want at every price of ' + B + ': a shift. <b>' + ch[v] + '</b>.'],
      'Substitutes: the other demand moves the same way as the price. Complements: the opposite way.', null, { kind: 'effect', sub: isSub, up: up });
  });

  G('micro.law-of-supply', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), d = R.int(2, 8), pmin = R.int(1, 5), c = -d * pmin;
    var shape = L === 1 ? R.pick(['qs', 'qs', 'sum']) : R.pick(['qs', 'min', 'rev', 'sum', 'tf']);
    var eq = '$' + qsTex(c, d) + '$';
    if (shape === 'qs') { var P0 = R.int(pmin + 1, pmin + 10); return P('The supply of ' + g[0] + ' is ' + eq + ', with $P$ in dollars. What is the quantity supplied at ' + money(P0) + '?', exact(c + d * P0),
      ['$Q_s = ' + c + ' + ' + d + '(' + P0 + ') = ' + c + ' + ' + (d * P0) + ' = ' + (c + d * P0) + '$.'], 'Put the price into the supply equation.', g[1], { kind: 'qs', c: c, d: d, P: P0 }); }
    if (shape === 'min') return P('The supply of ' + g[0] + ' is ' + eq + ', with $P$ in dollars. Below what price will no one offer any for sale?', dollars(pmin),
      ['Set $Q_s = 0$: $0 = ' + c + ' + ' + d + 'P$.', '$P = ' + (-c) + ' \\div ' + d + ' = ' + pmin + '$. Below that price the formula gives a negative quantity: nothing is offered.'], 'Set quantity supplied to zero.', 'dollars', { kind: 'min', c: c, d: d });
    if (shape === 'rev') { var P1 = R.int(pmin + 1, pmin + 10), q1 = c + d * P1; return P('The supply of ' + g[0] + ' is ' + eq + ', with $P$ in dollars. At what price do sellers offer ' + q1 + ' units?', dollars(P1),
      ['$' + q1 + ' = ' + c + ' + ' + d + 'P$, so $' + d + 'P = ' + (q1 - c) + '$ and $P = ' + P1 + '$.'], 'Set the equation equal to the quantity and solve.', 'dollars', { kind: 'rev', c: c, d: d, q: q1 }); }
    if (shape === 'sum') {
      var names = R.sample(['Farm A', 'Farm B', 'Farm C', 'Farm D'], 3), pr = R.int(3, 8), qs = names.map(function () { return R.int(0, 20); }), tot = qs.reduce(function (x, y) { return x + y; }, 0);
      return P('At a price of ' + money(pr) + ', ' + names[0] + ' would sell ' + qs[0] + ' crates of peaches, ' + names[1] + ' ' + qs[1] + ' and ' + names[2] + ' ' + qs[2] + '. If they are the only sellers, what is the market quantity supplied?', exact(tot),
        ['Market supply adds every seller’s quantity at the same price: $' + qs.join(' + ') + ' = ' + tot + '$.'], 'Add across sellers.', 'crates', { kind: 'sum', qs: qs });
    }
    var t = R.pick([
      { s: 'A higher price for a good increases the supply of that good.', v: false, why: 'A higher price increases the quantity supplied: a movement along the supply curve. Supply itself does not shift.' },
      { s: 'Supply curves usually slope upward because producing more usually raises the cost of each extra unit.', v: true, why: 'Rising marginal cost means sellers need a higher price to make more.' },
      { s: 'The law of supply says that, other things equal, a higher price leads to a larger quantity supplied.', v: true, why: 'That is the statement of the law.' },
      { s: 'When the price of a good falls, its supply curve shifts left.', v: false, why: 'A change in the good’s own price moves sellers along the curve; it does not shift it.' }
    ]);
    return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Own price: a movement. Anything else: a shift.', null, { kind: 'tf', s: t.s, v: t.v });
  });

  var S_EVENTS = [
    { s: 'A new machine cuts the cost of making {G}.', v: 0 }, { s: 'The price of a key input used to make {G} falls.', v: 0 }, { s: 'Several new firms start selling {G}.', v: 0 },
    { s: 'The government pays producers of {G} a subsidy for each unit.', v: 0, lv: 2 }, { s: 'Wages of the workers who make {G} rise.', v: 1 }, { s: 'The price of a key input used to make {G} rises.', v: 1 },
    { s: 'The government puts a new tax on each unit of {G} sold by producers.', v: 1, lv: 2 }, { s: 'Several sellers of {G} go out of business.', v: 1 },
    { s: 'Sellers expect the price of {G} to be much higher next month and hold some back.', v: 1, lv: 3 }, { s: 'The price of {G} rises.', v: 2 }, { s: 'The price of {G} falls.', v: 2, lv: 2 },
    { s: 'Incomes rise, and buyers want more {G} at every price.', v: 3, lv: 2 }, { s: 'A popular new study makes buyers want more {G}.', v: 3, lv: 3 }
  ];
  var SUP_CH = ['Supply increases (the curve shifts right)', 'Supply decreases (the curve shifts left)', 'Supply does not shift; only the quantity supplied changes', 'Supply does not shift; the demand curve shifts instead'];
  var SUP_WHY = ['Each unit costs less to provide, or there are more sellers: more is offered at every price.', 'Each unit costs more to provide, or there are fewer sellers (or they hold back): less is offered at every price.', 'The good’s own price changed: sellers move along the same supply curve.', 'This changes buyers’ plans, not sellers’: it shifts demand, and sellers then move along their supply curve.'];
  G('micro.supply-shifters', function (R, ctx) {
    var ev = bank(R, ctx, S_EVENTS), g = R.pick(SD_GOODS), s = ev.s.replace(/\{G\}/g, g[0]);
    return P('In the market for ' + g[0] + ': ' + s + ' What happens to the supply of ' + g[0] + '?', keep(SUP_CH.slice(), ev.v), [SUP_WHY[ev.v], '<b>' + SUP_CH[ev.v] + '</b>.' + (ev.v === 1 ? ' On a graph the curve moves up and to the left: that is a decrease.' : '')],
      'Input prices, technology, taxes and subsidies, expectations and the number of sellers shift supply.', null, { kind: 'sup', s: ev.s, v: ev.v });
  });

  G('micro.market-equilibrium', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), m = mkMarket(R), shape = L === 1 ? R.pick(['both', 'P', 'Q']) : L === 2 ? R.pick(['both', 'P', 'Q', 'both']) : R.pick(['both', 'inv', 'inv']);
    var intro = 'In the market for ' + g[0] + ', demand is $' + qdTex(m.a, m.b) + '$ and supply is $' + qsTex(m.c, m.d) + '$, with $P$ in dollars.';
    var steps = ['Set quantity demanded equal to quantity supplied: $' + T.terms([[m.a, ''], [-m.b, 'P']]) + ' = ' + T.terms([[m.c, ''], [m.d, 'P']]) + '$.', 'Collect terms: $' + (m.a - m.c) + ' = ' + (m.b + m.d) + 'P$, so $P^* = ' + m.P + '$.', 'Quantity: $Q_d = ' + m.a + ' - ' + m.b + '(' + m.P + ') = ' + m.Q + '$. Check with supply: $' + m.c + ' + ' + m.d + '(' + m.P + ') = ' + m.Q + '$.'];
    var chk = { kind: shape, a: m.a, b: m.b, c: m.c, d: m.d };
    if (shape === 'P') return P(intro + ' What is the equilibrium price?', dollars(m.P), steps.slice(0, 2), 'Set the two quantities equal and solve for P.', 'dollars', chk);
    if (shape === 'Q') return P(intro + ' What is the equilibrium quantity?', exact(m.Q), steps.concat(['The equilibrium quantity is <b>' + m.Q + '</b>, not the price.']), 'Find the price first, then put it into either equation.', g[1], chk);
    if (shape === 'inv') {
      // inverse forms with whole-number slopes: P = p0 - sQ, P = q0 + tQ
      var s = R.int(1, 4), t2 = R.int(1, 4), Qe = R.int(3, 12), Pe = R.int(Qe * t2 + 2, Qe * t2 + 15), p0 = Pe + s * Qe, q0 = Pe - t2 * Qe;
      chk = { kind: 'inv', p0: p0, s: s, q0: q0, t: t2 };
      return P('In the market for ' + g[0] + ', inverse demand is $P = ' + T.terms([[p0, ''], [-s, 'Q']]) + '$ and inverse supply is $P = ' + T.terms([[q0, ''], [t2, 'Q']]) + '$, with $P$ in dollars. Find the equilibrium.', { t: 'multi', parts: [{ label: 'Price $P^* =$', a: dollars(Pe), unit: 'dollars' }, { label: 'Quantity $Q^* =$', a: exact(Qe) }] },
        ['Each equation gives a price, so set them equal: $' + T.terms([[p0, ''], [-s, 'Q']]) + ' = ' + T.terms([[q0, ''], [t2, 'Q']]) + '$.', '$' + (p0 - q0) + ' = ' + (s + t2) + 'Q$, so $Q^* = ' + Qe + '$.', '$P^* = ' + p0 + ' - ' + s + '(' + Qe + ') = ' + Pe + '$. Check: $' + q0 + ' + ' + t2 + '(' + Qe + ') = ' + Pe + '$.'],
        'Set the two prices equal and solve for Q first.', null, chk);
    }
    return P(intro + ' Find the equilibrium price and quantity.', { t: 'multi', parts: [{ label: 'Price $P^* =$', a: dollars(m.P), unit: 'dollars' }, { label: 'Quantity $Q^* =$', a: exact(m.Q) }] }, steps,
      'Set the two quantities equal, solve for P, then find Q.', null, chk, L === 1 ? null : null);
  });

  G('micro.shortage-surplus', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), m = mkMarket(R, { pmin: 4, ok: function (a, b, c, d, P, Q0) { return Q0 > b && Q0 > d; } }), below = R.coin();
    var lows = [], highs = [], x;
    for (x = m.P - 4; x < m.P; x++) if (x >= 1 && m.c + m.d * x > 0) lows.push(x);
    for (x = m.P + 1; x <= m.P + 4; x++) if (m.a - m.b * x > 0) highs.push(x);
    if (!highs.length) below = true; if (!lows.length) below = false;
    var Pp = R.pick(below ? lows : highs);
    var qd = m.a - m.b * Pp, qs = m.c + m.d * Pp;
    var gap = M.abs(qd - qs), intro = 'In the market for ' + g[0] + ', demand is $' + qdTex(m.a, m.b) + '$ and supply is $' + qsTex(m.c, m.d) + '$, with $P$ in dollars. The price is ' + money(Pp) + '.';
    var steps = ['At ' + money(Pp) + ': $Q_d = ' + m.a + ' - ' + m.b + '(' + Pp + ') = ' + qd + '$ and $Q_s = ' + T.terms([[m.c, ''], [m.d, '(' + Pp + ')']]) + ' = ' + qs + '$.',
      qd > qs ? 'Buyers want more than sellers offer: a <b>shortage</b> of $' + qd + ' - ' + qs + ' = ' + gap + '$. Buyers bid the price up.' : 'Sellers offer more than buyers want: a <b>surplus</b> of $' + qs + ' - ' + qd + ' = ' + gap + '$. Sellers cut the price.'];
    var chk = { a: m.a, b: m.b, c: m.c, d: m.d, P: Pp };
    if (L >= 2 && R.coin()) {
      chk.kind = 'mc';
      var ch = ['A shortage of ' + gap + ' units, and the price tends to rise', 'A surplus of ' + gap + ' units, and the price tends to fall', 'A shortage of ' + gap + ' units, and the price tends to fall', 'A surplus of ' + gap + ' units, and the price tends to rise'];
      return P(intro + ' What is the situation in this market?', keep(ch, qd > qs ? 0 : 1), steps, 'Compute both quantities at this price, then compare.', null, chk);
    }
    chk.kind = 'gap';
    return P(intro + ' At this price there is a ' + (qd > qs ? 'shortage' : 'surplus') + '. How many units is it?', exact(gap), steps, 'Find quantity demanded and quantity supplied at this price, then subtract.', 'units', chk,
      mktViz(m, { price: Pp }));
  });

  var PQ_CH = ['Price rises and quantity rises', 'Price rises and quantity falls', 'Price falls and quantity rises', 'Price falls and quantity falls'];
  var EQ_EVENTS = [
    { s: 'Incomes rise, and {G} are a normal good.', c: 'D', dir: 1 }, { s: 'A popular study praises {G}.', c: 'D', dir: 1 }, { s: 'The price of a substitute for {G} rises.', c: 'D', dir: 1 },
    { s: 'The price of a complement of {G} rises.', c: 'D', dir: -1 }, { s: 'Many buyers move out of the area.', c: 'D', dir: -1 }, { s: 'Buyers expect {G} to get cheaper soon.', c: 'D', dir: -1, lv: 2 },
    { s: 'A new technology cuts the cost of making {G}.', c: 'S', dir: 1 }, { s: 'Many new sellers of {G} enter the market.', c: 'S', dir: 1 }, { s: 'The price of an input used to make {G} rises.', c: 'S', dir: -1 },
    { s: 'A new per-unit tax is placed on producers of {G}.', c: 'S', dir: -1, lv: 2 }, { s: 'Incomes rise, and {G} are an inferior good for most buyers.', c: 'D', dir: -1, lv: 3 }, { s: 'The government pays producers of {G} a per-unit subsidy.', c: 'S', dir: 1, lv: 2 }
  ];
  function evText(s, nm) { return s.replace(/\{G\}/g, nm).replace(/ are (a normal|an inferior)/, function (m0, w) { return /s$/.test(nm) ? ' are ' + w : ' is ' + w; }); }
  function pqIndex(c, dir) { return c === 'D' ? (dir > 0 ? 0 : 3) : (dir > 0 ? 2 : 1); }
  G('micro.equilibrium-changes', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), nm = g[0], shape = L === 1 ? 'mc' : R.pick(['mc', 'mc', 'num', 'graph']);
    if (shape === 'mc') {
      var ev = bank(R, ctx, EQ_EVENTS), v = pqIndex(ev.c, ev.dir);
      return P('In the market for ' + nm + ': ' + evText(ev.s, nm) + ' What happens to the equilibrium price and quantity of ' + nm + '?', keep(PQ_CH.slice(), v),
        ['This shifts <b>' + (ev.c === 'D' ? 'demand' : 'supply') + '</b> ' + (ev.dir > 0 ? 'right (an increase)' : 'left (a decrease)') + '.', ev.c === 'D' ? (ev.dir > 0 ? 'At the old price there is a shortage, so the price rises and sellers move up along supply.' : 'At the old price there is a surplus, so the price falls and sellers move down along supply.') : (ev.dir > 0 ? 'At the old price there is a surplus, so the price falls and buyers move down along demand to a larger quantity.' : 'At the old price there is a shortage, so the price rises and buyers move up along demand to a smaller quantity.'), '<b>' + PQ_CH[v] + '</b>.'],
        'Which curve shifts, and which way? The other curve stays put.', null, { kind: 'mc', c: ev.c, dir: ev.dir, s: ev.s });
    }
    var m = mkMarket(R, { qmul: 2, bmax: 4, dmax: 4 }), cv = R.pick(['D', 'S']), dir = R.sign(), sz = (m.b + m.d) * (shape === 'graph' ? R.int(2, 3) : R.int(1, 2));
    if (dir < 0 && (cv === 'D' ? m.Q - m.b * (sz / (m.b + m.d)) : m.Q - m.d * (sz / (m.b + m.d))) < 2) dir = 1;
    var a2 = cv === 'D' ? m.a + dir * sz : m.a, c2 = cv === 'S' ? m.c + dir * sz : m.c;
    var P2 = Q(a2 - c2, m.b + m.d), Q2 = Q(a2).sub(P2.mul(m.b));
    if (shape === 'graph') {
      var e1 = { q: Q2.toNumber(), p: P2.toNumber() }, e0 = { q: m.Q, p: m.P };
      // A = new equilibrium; B = the new curve at the old price; C = old equilibrium; D = the OLD shifted curve at the new price
      var shiftedQAtOld = cv === 'D' ? a2 - m.b * m.P : c2 + m.d * m.P, oldAtNew = cv === 'D' ? m.a - m.b * e1.p : m.c + m.d * e1.p;
      if (oldAtNew < 1) oldAtNew = cv === 'D' ? a2 - m.b * (e1.p + (e1.p - m.P)) : c2 + m.d * (e1.p + (e1.p - m.P));
      var pts = [{ x: e1.q, y: e1.p }, { x: shiftedQAtOld, y: m.P }, { x: e0.q, y: e0.p }, { x: oldAtNew, y: oldAtNew === (cv === 'D' ? m.a - m.b * e1.p : m.c + m.d * e1.p) ? e1.p : e1.p + (e1.p - m.P) }];
      var labels = R.shuffle(['A', 'B', 'C', 'D']), marks = pts.map(function (pt, i) { return { label: labels[i], x: fix(pt.x), y: fix(pt.y) }; });
      var sh = {}; sh[cv] = dir * sz;
      var choices = ['A', 'B', 'C', 'D'], right = choices.indexOf(labels[0]);
      return P('The graph shows the market for ' + nm + ' after ' + (cv === 'D' ? 'demand' : 'supply') + ' ' + (dir > 0 ? 'increased' : 'decreased') + ' (the dashed curve is the old one). Which point is the <b>new</b> equilibrium?', keep(choices, right),
        ['The new equilibrium is where the <b>new</b> ' + (cv === 'D' ? 'demand' : 'supply') + ' curve crosses the curve that did not move.', 'That is point ' + labels[0] + '. Point ' + labels[2] + ' is the old equilibrium, and point ' + labels[1] + ' is on the new curve at the old price, where there is a ' + ((cv === 'D') === (dir > 0) ? 'shortage' : 'surplus') + ' before the price adjusts.'],
        'Find where the new curve crosses the curve that stayed put.', null, { kind: 'graph', a: a2, b: m.b, c: c2, d: m.d, pt: pts[0] }, mktViz(m, { shift: sh, step: 2, show: [], marks: marks }));
    }
    var askP = R.coin();
    return P('In the market for ' + nm + ', demand is $' + qdTex(m.a, m.b) + '$ and supply is $' + qsTex(m.c, m.d) + '$ ($P$ in dollars), so the equilibrium is ' + money(m.P) + ' and ' + m.Q + ' units. Then ' + (cv === 'D' ? 'demand' : 'supply') + ' ' + (dir > 0 ? 'increases' : 'decreases') + ' by ' + sz + ' units at every price. What is the new equilibrium ' + (askP ? 'price' : 'quantity') + '?',
      askP ? { t: 'num', v: cash(P2.toNumber()) } : exact(Q2),
      ['New ' + (cv === 'D' ? 'demand: $' + qdTex(a2, m.b) : 'supply: $' + qsTex(c2, m.d)) + '$.', 'Set them equal: $' + T.terms([[a2, ''], [-m.b, 'P']]) + ' = ' + T.terms([[c2, ''], [m.d, 'P']]) + '$, so $' + (a2 - c2) + ' = ' + (m.b + m.d) + 'P$ and $P = ' + nx(P2) + '$.', 'Quantity: $' + a2 + ' - ' + m.b + '(' + nx(P2) + ') = ' + nx(Q2) + '$.', 'Price ' + (P2.toNumber() > m.P ? 'rose' : 'fell') + ' and quantity ' + (Q2.toNumber() > m.Q ? 'rose' : 'fell') + ', as the shift predicts.'],
      'Write the new equation, then set demand equal to supply again.', askP ? 'dollars' : 'units', { kind: 'num', a: a2, b: m.b, c: c2, d: m.d, askP: askP });
  });

  var DS_CH = ['Quantity rises; the change in price is ambiguous', 'Quantity falls; the change in price is ambiguous', 'Price rises; the change in quantity is ambiguous', 'Price falls; the change in quantity is ambiguous', 'Price rises and quantity rises', 'Price falls and quantity rises', 'Price rises and quantity falls', 'Price falls and quantity falls'];
  function dsIndex(dD, dS) { return dD > 0 && dS > 0 ? 0 : dD < 0 && dS < 0 ? 1 : dD > 0 && dS < 0 ? 2 : 3; }
  G('micro.double-shifts', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), nm = g[0], shape = L === 1 ? 'mc' : R.pick(['mc', 'mc', 'num']);
    if (shape === 'mc') {
      var evD = R.pick(EQ_EVENTS.filter(function (e) { return e.c === 'D' && (e.lv || 1) <= L; })), evS = R.pick(EQ_EVENTS.filter(function (e) { return e.c === 'S' && (e.lv || 1) <= L; }));
      var v = dsIndex(evD.dir, evS.dir), certainP = v >= 2;
      // distractors: the "definite" misconceptions for the ambiguous variable, and another pattern
      var defs = v === 0 ? [4, 5] : v === 1 ? [6, 7] : v === 2 ? [4, 6] : [5, 7], other = [0, 1, 2, 3].filter(function (x) { return x !== v; });
      var wrong = defs.concat([R.pick(other)]);
      return P('In the market for ' + nm + ', two things happen at once: ' + evText(evD.s, nm).replace(/\.$/, '') + ', and ' + evText(evS.s, nm).charAt(0).toLowerCase() + evText(evS.s, nm).slice(1) + ' What happens to the equilibrium?', mc(DS_CH[v], wrong.map(function (i) { return DS_CH[i]; })),
        ['First event: demand shifts ' + (evD.dir > 0 ? 'right: P↑, Q↑.' : 'left: P↓, Q↓.'), 'Second event: supply shifts ' + (evS.dir > 0 ? 'right: P↓, Q↑.' : 'left: P↑, Q↓.'), (certainP ? 'The price arrows agree, so the price surely ' + (v === 2 ? 'rises' : 'falls') + '; the quantity arrows disagree.' : 'The quantity arrows agree, so quantity surely ' + (v === 0 ? 'rises' : 'falls') + '; the price arrows disagree.') + ' <b>' + DS_CH[v] + '</b>: it depends on which shift is larger.'],
        'Work out each shift alone, then see which arrows agree.', null, { kind: 'mc', dD: evD.dir, dS: evS.dir });
    }
    var m = mkMarket(R, { qmul: 2, bmax: 4, dmax: 4 }), dD, dS, tries = 0;
    do { var dP = R.pick([-2, -1, 1, 2]); dS = R.sign() * R.int(1, 5) * 2; dD = dS + (m.b + m.d) * dP; tries++; }
    while ((dD === 0 || M.abs(dD) > 24 || m.Q + (dD * m.d + dS * m.b) / (m.b + m.d) < 2 || m.P + dP < 1) && tries < 100);
    var a2 = m.a + dD, c2 = m.c + dS, P2 = Q(a2 - c2, m.b + m.d), Q2 = Q(a2).sub(P2.mul(m.b)), askP = R.coin();
    return P('In the market for ' + nm + ', demand is $' + qdTex(m.a, m.b) + '$ and supply is $' + qsTex(m.c, m.d) + '$ ($P$ in dollars). Demand ' + (dD > 0 ? 'increases' : 'decreases') + ' by ' + M.abs(dD) + ' units at every price, and at the same time supply ' + (dS > 0 ? 'increases' : 'decreases') + ' by ' + M.abs(dS) + ' units at every price. What is the new equilibrium ' + (askP ? 'price' : 'quantity') + '?',
      askP ? { t: 'num', v: cash(P2.toNumber()) } : exact(Q2),
      ['New curves: $' + qdTex(a2, m.b) + '$ and $' + qsTex(c2, m.d) + '$.', 'Set them equal: $' + (a2 - c2) + ' = ' + (m.b + m.d) + 'P$, so $P = ' + nx(P2) + '$ (it was ' + m.P + ').', 'Quantity: $' + a2 + ' - ' + m.b + '(' + nx(P2) + ') = ' + nx(Q2) + '$ (it was ' + m.Q + ').', 'With the sizes known, the ambiguous variable has a definite answer.'],
      'Shift both equations, then solve again.', askP ? 'dollars' : 'units', { kind: 'num', a: a2, b: m.b, c: c2, d: m.d, askP: askP });
  });

  // =================================================================== Unit 5: Elasticity
  // value pairs whose midpoint percent change is a round number: [low, high, percent]
  var P_PAIRS = [[4, 6, 40], [9, 11, 20], [8, 12, 40], [3, 5, 50], [19, 21, 10], [7, 9, 25], [15, 25, 50], [18, 22, 20], [2, 3, 40], [45, 55, 20], [1.5, 2.5, 50], [0.9, 1.1, 20], [3.5, 4.5, 25], [14, 18, 25], [12, 18, 40], [2, 6, 100]];
  var Q_PAIRS = [[90, 110, 20], [80, 120, 40], [60, 100, 50], [70, 130, 60], [30, 50, 50], [45, 55, 20], [95, 105, 10], [40, 60, 40], [35, 65, 60], [20, 60, 100], [150, 250, 50], [180, 220, 20], [900, 1100, 20], [75, 125, 50], [140, 260, 60], [350, 450, 25], [700, 900, 25], [190, 210, 10], [400, 600, 40], [24, 36, 40]];
  var EL_GOODS = [['a muffin', 'muffins'], ['a movie ticket', 'tickets'], ['a bus pass', 'passes'], ['a phone case', 'cases'], ['a gallon of milk', 'gallons'], ['a haircut', 'haircuts'], ['a slice of pizza', 'slices'], ['a concert ticket', 'tickets'], ['a box of cereal', 'boxes']];
  function midPct(lo, hi) { return Q.from(hi).sub(Q.from(lo)).div(Q.from(hi).add(Q.from(lo)).div(2)).mul(100); }
  function pctTxt(q) { return nx(q.isInt() ? q : Q.from(q.toDec(1))) + '\\%'; }
  function elasticPair(R, opts) {
    for (var t = 0; t < 300; t++) {
      var pp = R.pick(P_PAIRS), qp = R.pick(Q_PAIRS), e = Q(qp[2], pp[2]);
      if (opts && opts.want === 'elastic' && !e.gt(1)) continue; if (opts && opts.want === 'inelastic' && !e.lt(1)) continue; if (opts && opts.want === 'unit' && !e.eq(1)) continue;
      if (e.toNumber() > 5 || e.toNumber() < 0.1) continue;
      return { pp: pp, qp: qp, e: e };
    }
    return { pp: [4, 6, 40], qp: [60, 100, 50], e: Q(5, 4) };
  }
  function elClass(e) { return e.gt(1) ? 0 : e.lt(1) ? 1 : 2; }
  var EL_CH = ['Elastic', 'Inelastic', 'Unit elastic'];

  G('micro.price-elasticity-demand', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(EL_GOODS), shape = L === 1 ? R.pick(['e', 'e', 'class']) : R.pick(['e', 'e', 'class', 'predict', 'pct']);
    var want = shape === 'class' ? R.pick(['elastic', 'inelastic', 'unit', 'elastic', 'inelastic']) : null, s = elasticPair(R, want ? { want: want } : null);
    var up = R.coin(), P1 = up ? s.pp[0] : s.pp[1], P2 = up ? s.pp[1] : s.pp[0], Q1 = up ? s.qp[1] : s.qp[0], Q2 = up ? s.qp[0] : s.qp[1];
    var who = R.pick(['a café', 'a store', 'a theater', 'a food truck', 'a barber shop']);
    var q = 'When the price of ' + g[0] + ' at ' + who + ' ' + (up ? 'rises' : 'falls') + ' from ' + money(P1) + ' to ' + money(P2) + ', the number sold each week ' + (up ? 'falls' : 'rises') + ' from ' + T.commas(Q1) + ' to ' + T.commas(Q2) + '.';
    var dq = midPct(M.min(Q1, Q2), M.max(Q1, Q2)), dp = midPct(M.min(P1, P2), M.max(P1, P2));
    var steps = ['$\\%\\Delta Q = \\dfrac{' + nx(Q2) + ' - ' + nx(Q1) + '}{(' + nx(Q1) + ' + ' + nx(Q2) + ')/2} = ' + (up ? '-' : '') + pctTxt(dq) + '$.',
      '$\\%\\Delta P = \\dfrac{' + nx(P2) + ' - ' + nx(P1) + '}{(' + nx(P1) + ' + ' + nx(P2) + ')/2} = ' + (up ? '' : '-') + pctTxt(dp) + '$.',
      '$E_d = \\left|\\dfrac{' + (up ? '-' : '') + pctTxt(dq) + '}{' + (up ? '' : '-') + pctTxt(dp) + '}\\right| = ' + nx(s.e) + '$: ' + ['elastic', 'inelastic', 'unit elastic'][elClass(s.e)] + '.'];
    var chk = { P1: P1, P2: P2, Q1: Q1, Q2: Q2, kind: shape };
    if (shape === 'class') return P(q + ' Using the midpoint method, is demand elastic, inelastic or unit elastic over this range?', keep(EL_CH.slice(), elClass(s.e)), steps, 'Compute both percent changes with midpoints, then divide quantity by price.', null, chk);
    if (shape === 'pct') return P(q + ' Using the midpoint method, what is the percent change in quantity demanded? (Give the size, as a positive percent.)', percent(dq.toNumber(), 0.06), steps.slice(0, 1).concat(['Its size is <b>$' + pctTxt(dq) + '$</b>.']), 'Divide the change by the average of the two quantities.', '%', chk);
    if (shape === 'predict') {
      var Ed = R.pick([Q(1, 2), Q(3, 2), Q(2), Q(4, 5), Q(5, 2), Q(1, 4), Q(6, 5)]), pc = R.pick([2, 4, 5, 10, 20]), res = Ed.mul(pc);
      chk = { kind: 'predict', E: Ed.toPlain(), pc: pc };
      return P('The price elasticity of demand for ' + g[1] + ' is ' + dn(Ed) + '. If the price rises by ' + pc + '%, by about what percent does the quantity demanded fall?', percent(res.toNumber()),
        ['$\\%\\Delta Q \\approx E_d \\times \\%\\Delta P = ' + nx(Ed) + ' \\times ' + pc + '\\% = ' + nx(res) + '\\%$.', 'Quantity demanded falls by about ' + dn(res) + '%.'], 'Elasticity times the percent change in price.', '%', chk);
    }
    return P(q + ' Using the midpoint method, what is the price elasticity of demand? (Give it as a positive number.)', { t: 'num', v: s.e.toPlain(), tol: 0.01 }, steps, 'Percent change in quantity over percent change in price, each on its average.', null, chk);
  });

  var DET_PAIRS = [
    ['gasoline over one week', 'gasoline over five years', 1, 'With five years, drivers can buy efficient cars, carpool or move closer to work.'],
    ['one brand of bottled water', 'water in general', 0, 'Other brands are close substitutes for one brand; there is no substitute for water.'],
    ['insulin for people with diabetes', 'tickets to a pop concert', 1, 'Concert tickets are a luxury with many alternatives; insulin is a necessity with no close substitute.'],
    ['salt', 'a new car', 1, 'A car takes a large share of the budget, so buyers shop around and wait; salt costs very little.'],
    ['electricity this month', 'electricity over ten years', 1, 'Over ten years, people can buy efficient appliances and insulate their homes.'],
    ['one gas station’s gasoline', 'all gasoline in a city', 0, 'Drivers can switch to the station across the street, but not away from gasoline itself as easily.'],
    ['cigarettes for regular smokers', 'restaurant desserts', 1, 'Desserts are easy to skip; habit makes cigarette demand inelastic.'],
    ['a vacation cruise', 'tap water at home', 0, 'A cruise is a luxury with many substitutes; tap water is a necessity.'],
    ['textbooks required for a course', 'novels for fun reading', 1, 'A required book has no substitute for that course; there are many novels to choose from.'],
    ['a particular brand of running shoes', 'shoes in general', 0, 'Other brands are close substitutes for one brand; people still need shoes.'],
    ['heating oil this winter', 'heating oil over the next decade', 1, 'Over a decade, homeowners can switch furnaces or insulate.'],
    ['airline tickets for vacations', 'airline tickets for urgent business trips', 0, 'Vacationers can change dates, destinations or drive; urgent travelers cannot.'],
    ['a family’s rent', 'a family’s toothpaste', 0, 'Rent is a large share of the budget, so a rise pushes families to look hard for cheaper housing.'],
    ['prescription heart medicine', 'movie theater popcorn', 1, 'Popcorn is easy to skip; necessary medicine has no close substitute.'],
    ['tomatoes from one farm stand', 'all fresh vegetables', 0, 'Shoppers can buy the same tomatoes from the next stand.']
  ];
  G('micro.elasticity-determinants', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['pair', 'class']) : R.pick(['pair', 'class', 'line', 'tf']);
    if (shape === 'pair') {
      var d = R.pick(DET_PAIRS), flip = R.coin(), ch = flip ? [d[1], d[0]] : [d[0], d[1]], v = flip ? 1 - d[2] : d[2];
      return P('Which has the more elastic demand?', keep(ch.map(cap), v), [d[3], '<b>' + cap(ch[v]) + '</b>.'], 'Think about substitutes, necessity, budget share and time to adjust.', null, { kind: 'pair', ans: d[d[2]] });
    }
    if (shape === 'class') {
      var e = R.pick([Q(1, 5), Q(1, 2), Q(3, 4), Q(1), Q(5, 4), Q(2), Q(3), Q(0), Q(9, 10), Q(13, 10), Q(2, 5), Q(3, 5), Q(11, 10), Q(5, 2), Q(4), Q(1, 10), Q(7, 4)]), ch2 = ['Elastic', 'Inelastic', 'Unit elastic', 'Perfectly inelastic'];
      var cls = e.isZero() ? 3 : elClass(e);
      return P('The price elasticity of demand for a good is ' + dn(e) + '. How is its demand described?', keep(ch2, cls),
        [e.isZero() ? 'Zero: quantity demanded does not respond to price at all.' : e.gt(1) ? 'Greater than 1: quantity responds more than proportionally to price.' : e.lt(1) ? 'Less than 1: quantity responds less than proportionally.' : 'Exactly 1: proportional response.', '<b>' + ch2[cls] + '</b>.'],
        'Compare the number with 1.', null, { kind: 'class', e: e.toPlain() });
    }
    if (shape === 'line') {
      var p0 = R.pick([10, 12, 16, 20, 24, 30]), b = R.pick([1, 2, 4, 5]), a = b * p0, mid = p0 / 2, high = R.coin(), pr = high ? R.int(M.ceil(mid + 1), p0 - 1) : R.int(1, M.floor(mid - 1));
      return P('Demand is $' + qdTex(a, b) + '$, a straight line. Near a price of ' + money(pr) + ', is demand elastic or inelastic?', keep(['Elastic', 'Inelastic'], high ? 0 : 1),
        ['The line runs from a price of ' + money(p0) + ' (no sales) down to ' + a + ' units at a price of zero. Its midpoint is at ' + money(mid) + '.', 'Above the midpoint demand is elastic; below it, inelastic.', money(pr) + ' is ' + (high ? 'above' : 'below') + ' ' + money(mid) + ': <b>' + (high ? 'elastic' : 'inelastic') + '</b>.'],
        'Where is the price compared with the middle of the line?', null, { kind: 'line', a: a, b: b, P: pr });
    }
    var t = R.pick([
      { s: 'Along a straight-line demand curve, the price elasticity of demand is the same at every point.', v: false, why: 'The slope is the same everywhere, but elasticity uses percent changes: demand is elastic at high prices and inelastic at low prices.' },
      { s: 'A steeper demand curve is always less elastic than a flatter one.', v: false, why: 'Steepness depends on the units of the axes, and elasticity changes along a line. Comparing at the same point, a steeper line is less elastic, but steepness alone does not give the elasticity.' },
      { s: 'Demand for a good with many close substitutes tends to be elastic.', v: true, why: 'When the price rises, buyers can switch easily.' },
      { s: 'Demand usually becomes more elastic as buyers have more time to adjust.', v: true, why: 'With time, buyers find substitutes and change habits.' },
      { s: 'A good that takes a tiny share of the budget tends to have elastic demand.', v: false, why: 'A small budget share makes demand less elastic: a price change hardly matters to the buyer.' }
    ]);
    return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Slope and elasticity are different things.', null, { kind: 'tf', s: t.s, v: t.v });
  });

  var TR_CH = ['Total revenue rises', 'Total revenue falls', 'Total revenue stays the same'];
  G('micro.total-revenue-test', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['rule', 'calc']) : R.pick(['rule', 'calc', 'calc', 'max', 'maxtr']);
    if (shape === 'rule') {
      var cls = R.int(0, 2), up = R.coin(), e = cls === 0 ? R.pick(['1.8', '2.5', '1.4', '3']) : cls === 1 ? R.pick(['0.3', '0.6', '0.2', '0.75']) : '1';
      var v = cls === 2 ? 2 : (cls === 1) === up ? 0 : 1;
      return P('The price elasticity of demand for a product is ' + e + '. If the seller ' + (up ? 'raises' : 'lowers') + ' the price a little, what happens to total revenue?', keep(TR_CH.slice(), v),
        [cls === 0 ? 'Elastic: quantity changes by a larger percent than price, so the quantity effect wins.' : cls === 1 ? 'Inelastic: quantity changes by a smaller percent than price, so the price effect wins.' : 'Unit elastic: the two effects cancel.', '<b>' + TR_CH[v] + '</b>.'],
        'Is demand elastic or inelastic? Which effect is bigger?', null, { kind: 'rule', e: +e, up: up });
    }
    if (shape === 'calc') {
      var s = elasticPair(R, { want: R.pick(['elastic', 'inelastic', 'elastic', 'inelastic', 'unit']) }), up2 = R.coin();
      var P1 = up2 ? s.pp[0] : s.pp[1], P2 = up2 ? s.pp[1] : s.pp[0], Q1 = up2 ? s.qp[1] : s.qp[0], Q2 = up2 ? s.qp[0] : s.qp[1];
      var tr1 = P1 * Q1, tr2 = P2 * Q2, cls2 = M.abs(tr1 - tr2) < 1e-9 ? 2 : (tr2 > tr1) === up2 ? 1 : 0;
      return P('A seller ' + (up2 ? 'raises' : 'cuts') + ' the price from ' + money(P1) + ' to ' + money(P2) + ', and weekly sales go from ' + T.commas(Q1) + ' to ' + T.commas(Q2) + ' units. Using the total revenue test, is demand elastic, inelastic or unit elastic over this range?', keep(EL_CH.slice(), cls2),
        ['Total revenue before: $' + money(P1) + ' \\times ' + T.commas(Q1) + ' = ' + money(fix(tr1)) + '$. After: $' + money(P2) + ' \\times ' + T.commas(Q2) + ' = ' + money(fix(tr2)) + '$.',
          'The price ' + (up2 ? 'rose' : 'fell') + ' and revenue ' + (cls2 === 2 ? 'did not change: <b>unit elastic</b>.' : (tr2 > tr1 ? 'rose' : 'fell') + (cls2 === 1 ? ', in the same direction as the price: <b>inelastic</b>.' : ', in the opposite direction: <b>elastic</b>.'))],
        'Compare P × Q before and after.', null, { kind: 'calc', P1: P1, P2: P2, Q1: Q1, Q2: Q2 });
    }
    var b = R.pick([1, 2, 4, 5, 10]), p0 = R.pick([8, 10, 12, 16, 20, 24, 30, 40]), a = b * p0, pm = p0 / 2, qm = a / 2;
    if (shape === 'max') return P('Demand is $' + qdTex(a, b) + '$, with $P$ in dollars. What price maximizes total revenue?', dollars(pm),
      ['The demand line meets the price axis at ' + money(p0) + ' and the quantity axis at ' + a + '.', 'Total revenue is largest at the midpoint, where demand is unit elastic: $P = ' + p0 + ' \\div 2 = ' + nx(pm) + '$.', 'Check: $TR = ' + nx(pm) + ' \\times ' + nx(qm) + ' = ' + nx(pm * qm) + '$, and a price ' + (pm >= 2 ? 'a dollar higher or lower gives less' : 'a little higher or lower gives less') + '.'],
      'Revenue peaks halfway down a straight-line demand curve.', 'dollars', { kind: 'max', a: a, b: b });
    return P('Demand is $' + qdTex(a, b) + '$, with $P$ in dollars. What is the largest total revenue the seller can earn?', dollars(pm * qm),
      ['Revenue peaks at the midpoint of the line: $P = ' + nx(pm) + '$ and $Q = ' + a + ' - ' + b + '(' + nx(pm) + ') = ' + nx(qm) + '$.', '$TR = ' + money(pm) + ' \\times ' + nx(qm) + ' = ' + money(pm * qm) + '$.'],
      'Find the midpoint price first.', 'dollars', { kind: 'maxtr', a: a, b: b });
  });

  var SUP_GOODS = [['strawberries', 'boxes'], ['apartments for rent', 'apartments'], ['wooden chairs', 'chairs'], ['bus rides', 'rides'], ['T-shirts', 'shirts'], ['tomatoes', 'crates']];
  G('micro.price-elasticity-supply', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['e', 'e', 'graph']) : R.pick(['e', 'class', 'graph', 'time']);
    if (shape === 'graph') {
      var ch = ['A vertical supply curve', 'A horizontal supply curve', 'An upward-sloping line through the origin', 'An upward-sloping line that starts on the price axis'], want = R.pick([0, 1]);
      return P('Which supply curve is <b>perfectly ' + (want === 0 ? 'inelastic' : 'elastic') + '</b>?', keep(ch, want),
        [want === 0 ? 'Perfectly inelastic means the quantity supplied does not change at all when the price changes.' : 'Perfectly elastic means sellers will offer any quantity at one price, and none below it.', want === 0 ? 'Same quantity at every price: a <b>vertical</b> line (elasticity 0).' : 'One price for every quantity: a <b>horizontal</b> line.', 'Any straight supply line through the origin has elasticity exactly 1.'],
        'Inelastic means quantity does not respond.', null, { kind: 'graph', want: want });
    }
    if (shape === 'time') {
      var gd = R.pick(['apartments in a city', 'pear trees bearing fruit', 'trained nurses', 'electric power from new plants']);
      return P('The price of ' + gd + ' rises sharply and stays high. How does the price elasticity of supply in the first month compare with the elasticity over ten years?', shuf(['More elastic over ten years', 'More elastic in the first month', 'The same in both'], 0),
        ['In the first month, sellers can only use what already exists.', 'Over ten years, they can build, plant, train or invest, so quantity supplied can respond much more: supply is <b>more elastic over ten years</b>.'],
        'What can sellers do with more time?', null, { kind: 'time' });
    }
    var g = R.pick(SUP_GOODS), s = elasticPair(R), P1 = s.pp[0], P2 = s.pp[1], Q1 = s.qp[0], Q2 = s.qp[1];
    var dq = midPct(Q1, Q2), dp = midPct(P1, P2);
    var steps = ['$\\%\\Delta Q_s = \\dfrac{' + nx(Q2) + ' - ' + nx(Q1) + '}{(' + nx(Q1) + ' + ' + nx(Q2) + ')/2} = ' + pctTxt(dq) + '$.', '$\\%\\Delta P = \\dfrac{' + nx(P2) + ' - ' + nx(P1) + '}{(' + nx(P1) + ' + ' + nx(P2) + ')/2} = ' + pctTxt(dp) + '$.', '$E_s = \\dfrac{' + pctTxt(dq) + '}{' + pctTxt(dp) + '} = ' + nx(s.e) + '$, positive because price and quantity supplied move together.'];
    var q = 'When the price of ' + g[0] + ' rises from ' + money(P1) + ' to ' + money(P2) + ', sellers offer ' + T.commas(Q2) + ' ' + g[1] + ' instead of ' + T.commas(Q1) + '.';
    if (shape === 'class') return P(q + ' Is supply elastic, inelastic or unit elastic over this range (midpoint method)?', keep(EL_CH.slice(), elClass(s.e)), steps.concat(['<b>' + EL_CH[elClass(s.e)] + '</b>.']), 'Compute E_s and compare with 1.', null, { kind: 'class', P1: P1, P2: P2, Q1: Q1, Q2: Q2 });
    return P(q + ' Using the midpoint method, what is the price elasticity of supply?', { t: 'num', v: s.e.toPlain(), tol: 0.01 }, steps, 'Percent change in quantity supplied over percent change in price.', null, { kind: 'e', P1: P1, P2: P2, Q1: Q1, Q2: Q2 });
  });

  var INC_GOODS = [['restaurant meals', 0], ['long-distance bus trips', 1], ['fresh fruit', 0], ['store-brand pasta', 1], ['vacations', 0], ['used clothing', 1], ['concert tickets', 0], ['instant noodles', 1]];
  var CROSS = [['tea', 'coffee', 1], ['coffee filters', 'coffee', 0], ['e-books', 'printed books', 1], ['gasoline', 'cars', 0], ['ink cartridges', 'printers', 0], ['chicken', 'beef', 1], ['train tickets', 'plane tickets', 1], ['hot dog buns', 'hot dogs', 0]];
  G('micro.income-cross-elasticity', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['incPct', 'crossPct']) : R.pick(['incPct', 'crossPct', 'incMid', 'classify']);
    if (shape === 'incPct' || shape === 'incMid') {
      var gd = R.pick(INC_GOODS), inf = gd[1] === 1, ip = R.pick([5, 10, 20, 25, 40]), e = inf ? R.pick([Q(-1, 2), Q(-1, 4), Q(-4, 5), Q(-6, 5)]) : R.pick([Q(1, 2), Q(3, 2), Q(4, 5), Q(2), Q(6, 5), Q(1, 4)]);
      if (shape === 'incMid') {
        var pr = R.pick([[40, 60], [45, 55], [30, 50], [36, 44], [80, 120]]), qq = inf ? R.pick([[110, 90], [120, 80], [105, 95], [130, 70]]) : R.pick([[90, 110], [80, 120], [95, 105], [70, 130], [60, 100]]);
        var dI = midPct(pr[0], pr[1]), dQ = Q(qq[1] - qq[0]).div(Q(qq[0] + qq[1], 2)).mul(100), ee = dQ.div(dI);
        return P('When average income in a town rises from ' + money(pr[0] * 1000) + ' to ' + money(pr[1] * 1000) + ', monthly purchases of ' + gd[0] + ' go from ' + qq[0] + ' to ' + qq[1] + ' (thousands). Using the midpoint method, what is the income elasticity of demand? Keep the sign; round to two decimal places if needed.', { t: 'num', v: ee.toPlain(), tol: 0.006 },
          ['$\\%\\Delta Q = \\dfrac{' + qq[1] + ' - ' + qq[0] + '}{' + nx(Q(qq[0] + qq[1], 2)) + '} = ' + pctTxt(dQ) + '$.', '$\\%\\Delta \\text{income} = \\dfrac{' + (pr[1] - pr[0]) + '}{' + nx(Q(pr[0] + pr[1], 2)) + '} = ' + pctTxt(dI) + '$ (in thousands of dollars).', 'Income elasticity $= ' + nx(Q.from(ee.toDec(2))) + '$: ' + (ee.lt(0) ? 'negative, an <b>inferior good</b>.' : ee.gt(1) ? 'above 1, a normal good and a luxury.' : 'between 0 and 1, a normal good and a necessity.')],
          'Percent change in quantity over percent change in income. Keep the signs.', null, { kind: 'incMid', I: pr, Q: qq });
      }
      var qp = e.mul(ip);
      return P('When incomes rise by ' + ip + '%, the quantity of ' + gd[0] + ' demanded ' + (qp.lt(0) ? 'falls' : 'rises') + ' by ' + dn(qp.abs()) + '%, with prices unchanged. What is the income elasticity of demand? (Keep the sign.)', exact(e),
        ['Income elasticity $= \\dfrac{\\%\\Delta Q}{\\%\\Delta \\text{income}} = \\dfrac{' + nx(qp) + '\\%}{' + ip + '\\%} = ' + nx(e) + '$.', e.lt(0) ? 'Negative: ' + gd[0] + ' are an <b>inferior good</b> for these buyers.' : e.gt(1) ? 'Above 1: a normal good, and a luxury.' : 'Between 0 and 1: a normal good, and a necessity.'],
        'Divide, and keep the minus sign if quantity fell.', null, { kind: 'incPct', qp: qp.toPlain(), ip: ip });
    }
    if (shape === 'crossPct') {
      var cr = R.pick(CROSS), sub = cr[2] === 1, pp = R.pick([5, 10, 20, 25]), ec = sub ? R.pick([Q(1, 2), Q(3, 2), Q(4, 5), Q(1, 4), Q(2)]) : R.pick([Q(-1, 2), Q(-3, 2), Q(-4, 5), Q(-6, 5), Q(-2)]), qc = ec.mul(pp);
      return P('The price of ' + cr[1] + ' rises by ' + pp + '%, and the quantity of ' + cr[0] + ' demanded ' + (qc.lt(0) ? 'falls' : 'rises') + ' by ' + dn(qc.abs()) + '%. What is the cross-price elasticity of demand for ' + cr[0] + ' with respect to the price of ' + cr[1] + '? (Keep the sign.)', exact(ec),
        ['Cross-price elasticity $= \\dfrac{\\%\\Delta Q_{\\text{' + cr[0] + '}}}{\\%\\Delta P_{\\text{' + cr[1] + '}}} = \\dfrac{' + nx(qc) + '\\%}{' + pp + '\\%} = ' + nx(ec) + '$.', sub ? 'Positive: <b>substitutes</b>.' : 'Negative: <b>complements</b>.'],
        'Divide the percent change in one good’s quantity by the percent change in the other good’s price.', null, { kind: 'crossPct', qc: qc.toPlain(), pp: pp });
    }
    var isInc = R.coin(), val = R.pick([Q(-3, 5), Q(-6, 5), Q(1, 5), Q(4, 5), Q(3, 2), Q(5, 2), Q(-1, 4)]);
    var ch = isInc ? ['A normal good and a necessity', 'A normal good and a luxury', 'An inferior good'] : ['Substitutes', 'Complements'];
    var v = isInc ? (val.lt(0) ? 2 : val.gt(1) ? 1 : 0) : (val.lt(0) ? 1 : 0);
    return P(isInc ? 'A good’s income elasticity of demand is ' + dn(val) + '. How is it classified?' : 'The cross-price elasticity of demand between two goods is ' + dn(val) + '. How are they related?', keep(ch, v),
      [isInc ? (val.lt(0) ? 'Negative: buyers want less as their income rises.' : val.gt(1) ? 'Positive and above 1: demand grows faster than income.' : 'Positive and below 1: demand grows, but more slowly than income.') : (val.lt(0) ? 'Negative: a higher price for one lowers demand for the other.' : 'Positive: a higher price for one raises demand for the other.'), '<b>' + ch[v] + '</b>.'],
      'The sign carries the meaning.', null, { kind: 'classify', isInc: isInc, val: val.toPlain() });
  });

  // =================================================================== Unit 6: Efficiency and Government in Markets
  // exact market math with ML.Q: demand Qd = a - bP, supply Qs = c + dP (c <= 0)
  function qq(x) { return Q.from(x); }
  function mAns(q) { q = qq(q); return q.isTerminating() && /^-?\d+(\.\d{1,2})?$/.test(q.toDec(6).replace(/0+$/, '').replace(/\.$/, '')) ? { t: 'num', v: q.toDec(2).replace(/\.00$/, '') } : { t: 'num', v: q.toPlain(), tol: 0.006 }; }
  function mTex(q) { q = qq(q); return '\\$' + (q.isInt() ? T.commas(q.toNumber()) : q.isTerminating() ? q.toDec(2) : q.toTex()); }
  function nTex(q) { q = qq(q); return q.isInt() ? T.commas(q.toNumber()) : q.isTerminating() ? T.num(q.toNumber()) : q.toTex(); }
  function eqQ(m) { var P = Q(m.a - m.c, m.b + m.d); return { P: P, Q: Q(m.a).sub(P.mul(m.b)) }; }
  function choke(m) { return Q(m.a, m.b); }            // demand's price intercept
  function sMin(m) { return Q(-m.c, m.d); }             // supply's price intercept
  function invD(m, q) { return Q(m.a).sub(qq(q)).div(m.b); }   // demand price at quantity q
  function invS(m, q) { return qq(q).sub(m.c).div(m.d); }      // supply price at quantity q
  function terminating() { for (var i = 0; i < arguments.length; i++) { var q = qq(arguments[i]); if (!q.isTerminating() || q.toDec(6).replace(/0+$/, '').split('.')[1] && q.toDec(6).replace(/0+$/, '').split('.')[1].length > 2) return false; } return true; }
  function polMarket(R, opt) { return mkMarket(R, { qmul: 2, bmax: (opt && opt.bmax) || 3, dmax: (opt && opt.dmax) || 3, pmin: 4, ok: function (a, b, c, d, P0, Q0) { return c < 0 && (!opt || !opt.ok || opt.ok({ a: a, b: b, c: c, d: d })); } }); }
  function sdIntro(m, g) { return 'In the market for ' + g + ', demand is $' + qdTex(m.a, m.b) + '$ and supply is $' + qsTex(m.c, m.d) + '$, with $P$ in dollars'; }
  function invForms(m) { return 'In price form, demand is $P = ' + nTex(choke(m)) + ' - ' + (m.b === 1 ? '' : T.frac(1, m.b)) + 'Q$ and supply is $P = ' + (m.c === 0 ? '' : nTex(sMin(m)) + ' + ') + (m.d === 1 ? '' : T.frac(1, m.d)) + 'Q$.'; }

  G('micro.consumer-producer-surplus', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['wtp', 'cost', 'eq']) : R.pick(['wtp', 'cost', 'eq', 'eq', 'at']);
    if (shape === 'wtp' || shape === 'cost') {
      var isB = shape === 'wtp', n = R.int(5, 6), vals = R.sample(U.range(2, 15), n).sort(function (x, y) { return isB ? y - x : x - y; }), price = R.int(4, 10);
      var who = vals.filter(function (v) { return isB ? v >= price : v <= price; }), sur = who.reduce(function (s, v) { return s + (isB ? v - price : price - v); }, 0);
      if (!who.length) { price = vals[2]; who = vals.filter(function (v) { return isB ? v >= price : v <= price; }); sur = who.reduce(function (s, v) { return s + (isB ? v - price : price - v); }, 0); }
      var thing = R.pick(['a concert ticket', 'a used bike', 'a phone repair', 'a painting class']);
      return P((isB ? n + ' buyers would each pay at most ' : n + ' sellers would each accept at least ') + U.list(vals.map(function (v) { return money(v); })) + ' for ' + thing + ' (one each). The market price is ' + money(price) + '. What is ' + (isB ? 'consumer' : 'producer') + ' surplus?', dollars(sur),
        [(isB ? 'Only buyers willing to pay at least ' : 'Only sellers who accept at most ') + money(price) + ' trade: ' + U.list(who.map(function (v) { return money(v); })) + '.', 'Each gains ' + (isB ? 'what they would pay minus the price' : 'the price minus the least they would accept') + ': ' + who.map(function (v) { return money(isB ? v - price : price - v); }).join(' + ') + ' = ' + money(sur) + '.'],
        isB ? 'Add up willingness to pay minus price for each buyer who buys.' : 'Add up price minus each trading seller’s minimum.', 'dollars', { kind: shape, vals: vals, price: price });
    }
    var g = R.pick(SD_GOODS), m, e;
    for (var t = 0; t < 50; t++) { m = polMarket(R); e = eqQ(m); if (terminating(e.Q.mul(e.Q).div(2 * m.b), e.Q.mul(e.Q).div(2 * m.d))) break; }
    var cs = choke(m).sub(e.P).mul(e.Q).div(2), ps = e.P.sub(sMin(m)).mul(e.Q).div(2);
    var intro = sdIntro(m, g[0]) + '. The equilibrium is ' + mTex(e.P) + ' and ' + nTex(e.Q) + ' units.';
    if (shape === 'eq') {
      var isC = R.coin();
      return P(intro + ' What is ' + (isC ? 'consumer' : 'producer') + ' surplus?', mAns(isC ? cs : ps),
        [isC ? 'Demand meets the price axis where $Q_d = 0$: $P = ' + m.a + ' \\div ' + m.b + ' = ' + nTex(choke(m)) + '$.' : 'Supply meets the price axis where $Q_s = 0$: $P = ' + (-m.c) + ' \\div ' + m.d + ' = ' + nTex(sMin(m)) + '$.',
          isC ? '$CS = \\tfrac{1}{2} \\times ' + nTex(e.Q) + ' \\times (' + nTex(choke(m)) + ' - ' + nTex(e.P) + ') = ' + mTex(cs) + '$.' : '$PS = \\tfrac{1}{2} \\times ' + nTex(e.Q) + ' \\times (' + nTex(e.P) + ' - ' + nTex(sMin(m)) + ') = ' + mTex(ps) + '$.'],
        isC ? 'A triangle below demand and above the price.' : 'A triangle above supply and below the price.', 'dollars', { kind: isC ? 'cs' : 'ps', a: m.a, b: m.b, c: m.c, d: m.d }, mktViz(m, { show: ['eq'] }));
    }
    // consumer surplus at a price set above equilibrium (quantity is what buyers want)
    var pr = e.P.add(R.int(1, 2)); if (!choke(m).gt(pr)) pr = e.P;
    var qb = Q(m.a).sub(pr.mul(m.b)), csAt = choke(m).sub(pr).mul(qb).div(2);
    return P(sdIntro(m, g[0]) + '. Suppose the price is ' + mTex(pr) + ' and buyers get every unit they want at that price. What is consumer surplus?', mAns(csAt),
      ['At ' + mTex(pr) + ', buyers want $Q_d = ' + m.a + ' - ' + m.b + '(' + nTex(pr) + ') = ' + nTex(qb) + '$.', 'Demand meets the price axis at ' + mTex(choke(m)) + '.', '$CS = \\tfrac{1}{2} \\times ' + nTex(qb) + ' \\times (' + nTex(choke(m)) + ' - ' + nTex(pr) + ') = ' + mTex(csAt) + '$.'],
      'Find the quantity at that price, then the triangle above it.', 'dollars', { kind: 'csAt', a: m.a, b: m.b, c: m.c, d: m.d, P: pr.toPlain() });
  });

  G('micro.deadweight-loss', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), m, e, q, gap, dwl;
    var shape = L === 1 ? 'under' : R.pick(['under', 'over', 'ts', 'tsAt']);
    for (var t = 0; t < 80; t++) {
      m = polMarket(R); e = eqQ(m);
      var dq = R.pick([2, 4, 1, 3]); q = shape === 'over' ? e.Q.add(dq) : e.Q.sub(dq);
      if (!q.gt(0)) continue;
      gap = invD(m, q).sub(invS(m, q)).abs(); dwl = gap.mul(e.Q.sub(q).abs()).div(2);
      if (terminating(dwl, invD(m, q), invS(m, q), choke(m).sub(sMin(m)).mul(e.Q).div(2))) break;
    }
    var intro = sdIntro(m, g[0]) + ', so the equilibrium is ' + mTex(e.P) + ' and ' + nTex(e.Q) + ' units. ' + invForms(m);
    var chk = { kind: shape, a: m.a, b: m.b, c: m.c, d: m.d, q: q.toPlain() };
    if (shape === 'ts' || shape === 'tsAt') {
      var at = shape === 'tsAt' ? q : e.Q, ts = shape === 'tsAt' ? choke(m).sub(sMin(m)).mul(e.Q).div(2).sub(dwl) : choke(m).sub(sMin(m)).mul(e.Q).div(2);
      return P(intro + (shape === 'tsAt' ? ' A rule limits sales to ' + nTex(q) + ' units. What is total surplus?' : ' What is total surplus at the equilibrium?'), mAns(ts),
        ['At equilibrium, total surplus is the triangle between demand and supply: $\\tfrac{1}{2} \\times ' + nTex(e.Q) + ' \\times (' + nTex(choke(m)) + ' - ' + nTex(sMin(m)) + ') = ' + mTex(choke(m).sub(sMin(m)).mul(e.Q).div(2)) + '$.'].concat(shape === 'tsAt' ? ['At ' + nTex(q) + ' units the gap between the curves is $' + nTex(invD(m, q)) + ' - ' + nTex(invS(m, q)) + ' = ' + nTex(gap) + '$, so the deadweight loss is $\\tfrac{1}{2} \\times ' + nTex(gap) + ' \\times ' + nTex(e.Q.sub(q)) + ' = ' + mTex(dwl) + '$.', 'Total surplus: $' + mTex(choke(m).sub(sMin(m)).mul(e.Q).div(2)) + ' - ' + mTex(dwl) + ' = ' + mTex(ts) + '$.'] : []),
        'Total surplus is the area between demand and supply, out to the quantity traded.', 'dollars', chk);
    }
    return P(intro + ' Suppose exactly ' + nTex(q) + ' units are traded. What is the deadweight loss?', mAns(dwl),
      ['At ' + nTex(q) + ' units, demand’s height is ' + mTex(invD(m, q)) + ' and supply’s height is ' + mTex(invS(m, q)) + '.', 'The gap is ' + mTex(gap) + ', and the units ' + (shape === 'over' ? 'beyond' : 'missing from') + ' equilibrium number $' + nTex(e.Q.sub(q).abs()) + '$.', '$DWL = \\tfrac{1}{2} \\times ' + nTex(gap) + ' \\times ' + nTex(e.Q.sub(q).abs()) + ' = ' + mTex(dwl) + '$.'],
      'The triangle between the curves, from the traded quantity to the equilibrium quantity.', 'dollars', chk, mktViz(m, { show: ['eq', 'dwl'], quantity: q.toNumber() }));
  });

  G('micro.price-controls', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), isC = R.coin(), m, e, lvl, binding, shape;
    shape = L === 1 ? R.pick(['bind', 'gap']) : R.pick(['bind', 'gap', 'qty', 'dwl']);
    for (var t = 0; t < 80; t++) {
      m = polMarket(R); e = eqQ(m); binding = shape === 'bind' ? R.coin() : true;
      var dp = R.int(1, 3); lvl = isC ? (binding ? e.P.sub(dp) : e.P.add(dp)) : (binding ? e.P.add(dp) : e.P.sub(dp));
      if (!lvl.gt(sMin(m)) || !choke(m).gt(lvl)) continue;
      var qd = Q(m.a).sub(lvl.mul(m.b)), qs = lvl.mul(m.d).add(m.c), qt = isC ? qs : qd;
      if (qt.gt(0) && terminating(invD(m, qt), invS(m, qt), invD(m, qt).sub(invS(m, qt)).mul(e.Q.sub(qt)).div(2))) break;
    }
    var nm = isC ? 'price ceiling' : 'price floor', intro = sdIntro(m, g[0]) + ', so the equilibrium is ' + mTex(e.P) + ' and ' + nTex(e.Q) + ' units. The government sets a ' + nm + ' of ' + mTex(lvl) + '.';
    var chk = { kind: shape, ceiling: isC, a: m.a, b: m.b, c: m.c, d: m.d, lvl: lvl.toPlain() };
    if (shape === 'bind') {
      return P(intro + ' Is it binding?', keep(['Binding: it changes the market', 'Not binding: the market stays at equilibrium'], binding ? 0 : 1),
        [isC ? 'A ceiling is a maximum. It binds only if it is below the equilibrium price.' : 'A floor is a minimum. It binds only if it is above the equilibrium price.', mTex(lvl) + ' is ' + (lvl.gt(e.P) ? 'above' : 'below') + ' ' + mTex(e.P) + ', so it is <b>' + (binding ? 'binding' : 'not binding') + '</b>.'],
        'Compare the legal price with the equilibrium price.', null, chk);
    }
    var qd2 = Q(m.a).sub(lvl.mul(m.b)), qs2 = lvl.mul(m.d).add(m.c), qt2 = isC ? qs2 : qd2, gap = qd2.sub(qs2).abs();
    var s0 = 'At ' + mTex(lvl) + ': $Q_d = ' + m.a + ' - ' + m.b + '(' + nTex(lvl) + ') = ' + nTex(qd2) + '$ and $Q_s = ' + T.terms([[m.c, ''], [m.d, '(' + nTex(lvl) + ')']]) + ' = ' + nTex(qs2) + '$.';
    if (shape === 'gap') return P(intro + ' How large is the ' + (isC ? 'shortage' : 'surplus') + '?', exact(gap),
      [isC ? 'The ceiling is below equilibrium, so it binds.' : 'The floor is above equilibrium, so it binds.', s0, (isC ? 'Shortage' : 'Surplus') + ': $' + (isC ? nTex(qd2) + ' - ' + nTex(qs2) : nTex(qs2) + ' - ' + nTex(qd2)) + ' = ' + nTex(gap) + '$ units.'],
      'Find both quantities at the legal price.', 'units', chk);
    if (shape === 'qty') return P(intro + ' How many units are actually traded?', exact(qt2),
      [s0, isC ? 'Buyers can’t buy more than sellers offer, so the quantity traded is the quantity supplied: <b>' + nTex(qt2) + '</b>.' : 'Sellers can’t sell more than buyers want, so the quantity traded is the quantity demanded: <b>' + nTex(qt2) + '</b>.'],
      'The smaller side of the market decides how much is traded.', 'units', chk);
    var dwl = invD(m, qt2).sub(invS(m, qt2)).mul(e.Q.sub(qt2)).div(2);
    return P(intro + ' What is the deadweight loss?', mAns(dwl),
      [s0, 'Quantity traded: ' + nTex(qt2) + ' (the smaller side).', 'At ' + nTex(qt2) + ' units, buyers would pay ' + mTex(invD(m, qt2)) + ' and sellers’ cost is ' + mTex(invS(m, qt2)) + '.', '$DWL = \\tfrac{1}{2} \\times (' + nTex(invD(m, qt2)) + ' - ' + nTex(invS(m, qt2)) + ') \\times (' + nTex(e.Q) + ' - ' + nTex(qt2) + ') = ' + mTex(dwl) + '$.'],
      'Find the quantity traded, then the triangle between the curves back to equilibrium.', 'dollars', chk);
  });

  function taxEq(m, t) { var Pb = Q(m.a - m.c + m.d * t, m.b + m.d); return { Pb: Pb, Ps: Pb.sub(t), Q: Q(m.a).sub(Pb.mul(m.b)) }; }
  function subEq(m, s) { var Pb = Q(m.a - m.c - m.d * s, m.b + m.d); return { Pb: Pb, Ps: Pb.add(s), Q: Q(m.a).sub(Pb.mul(m.b)) }; }
  function taxSetup(R, opt) {
    for (var i = 0; i < 200; i++) {
      var m = polMarket(R, opt), e = eqQ(m), t = R.int(1, M.max(1, M.min(5, e.P.toNumber() - 2))), r = opt && opt.sub ? subEq(m, t) : taxEq(m, t);
      if (r.Q.gt(0) && r.Pb.gt(0) && r.Q.mul(2).isInt() && terminating(r.Pb, r.Ps, r.Q, r.Q.mul(t), e.Q.sub(r.Q).abs().mul(t).div(2)) && (!opt || !opt.ok || opt.ok(m, e, r, t))) return { m: m, e: e, t: t, r: r };
    }
    var m0 = { a: 20, b: 2, c: -4, d: 2 }; return { m: m0, e: eqQ(m0), t: 3, r: opt && opt.sub ? subEq(m0, 3) : taxEq(m0, 3) };
  }
  G('micro.excise-tax', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), s = taxSetup(R), m = s.m, e = s.e, t = s.t, r = s.r, onB = L >= 2 && R.chance(0.3);
    var ask = L === 1 ? R.pick(['Q', 'Pb', 'rev']) : R.pick(['Q', 'Pb', 'Ps', 'rev', 'dwl', 'multi']);
    var intro = sdIntro(m, g[0]) + ' (equilibrium ' + mTex(e.P) + ' and ' + nTex(e.Q) + ' units). The government puts a tax of ' + money(t) + ' per unit on ' + g[0] + ', collected from ' + (onB ? 'buyers at the register' : 'sellers') + '.';
    var steps = [onB ? 'Buyers now pay the sellers’ price plus the tax: $P_b = P_s + ' + t + '$. Write demand in terms of $P_s$ and set it equal to supply.' : 'Sellers keep the buyers’ price minus the tax: $P_s = P_b - ' + t + '$.',
      'Solve $' + T.terms([[m.a, ''], [-m.b, 'P_b']]) + ' = ' + T.terms([[m.c, ''], [m.d, '(P_b - ' + t + ')']]) + '$: $P_b = ' + mTex(r.Pb) + '$ and $P_s = ' + mTex(r.Ps) + '$.',
      'Quantity: $Q_t = ' + m.a + ' - ' + m.b + '(' + nTex(r.Pb) + ') = ' + nTex(r.Q) + '$ (down from ' + nTex(e.Q) + ').'];
    var rev = r.Q.mul(t), dwl = e.Q.sub(r.Q).mul(t).div(2), chk = { kind: ask, a: m.a, b: m.b, c: m.c, d: m.d, t: t };
    if (ask === 'multi') return P(intro + ' Find the price buyers pay and the price sellers keep.', { t: 'multi', parts: [{ label: '$P_b =$', a: mAns(r.Pb), unit: 'dollars' }, { label: '$P_s =$', a: mAns(r.Ps), unit: 'dollars' }] }, steps.slice(0, 2).concat(['Check: $' + nTex(r.Pb) + ' - ' + nTex(r.Ps) + ' = ' + t + '$, the tax.']), 'The two prices differ by exactly the tax.', null, chk);
    var map = { Q: ['How many units are sold after the tax?', exact(r.Q), 'units', []], Pb: ['What price do buyers pay?', mAns(r.Pb), 'dollars', []], Ps: ['What price do sellers keep?', mAns(r.Ps), 'dollars', []],
      rev: ['How much tax revenue does the government collect?', mAns(rev), 'dollars', ['Revenue: $' + t + ' \\times ' + nTex(r.Q) + ' = ' + mTex(rev) + '$, using the quantity <b>after</b> the tax.']],
      dwl: ['What is the deadweight loss of the tax?', mAns(dwl), 'dollars', ['$DWL = \\tfrac{1}{2} \\times ' + t + ' \\times (' + nTex(e.Q) + ' - ' + nTex(r.Q) + ') = ' + mTex(dwl) + '$.']] }[ask];
    return P(intro + ' ' + map[0], map[1], steps.concat(map[3]), 'Find P_b first: the price buyers pay must leave sellers with P_b minus the tax.', map[2], chk);
  });

  G('micro.tax-incidence', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), shape = L === 1 ? R.pick(['share', 'who']) : R.pick(['share', 'who', 'frac', 'legal']);
    if (shape === 'who') {
      var inelD = R.coin(), eD = inelD ? R.pick(['0.2', '0.3', '0.5']) : R.pick(['1.5', '2', '3']), eS = inelD ? R.pick(['1.2', '2', '2.5']) : R.pick(['0.2', '0.4', '0.6']);
      var gd = inelD ? R.pick(['gasoline in the short run', 'cigarettes', 'insulin', 'electricity']) : R.pick(['one brand of soda', 'beach rentals', 'fresh-cut flowers', 'hotel rooms in a tourist town']);
      return P('At the current equilibrium in the market for ' + gd + ', the price elasticity of demand is ' + eD + ' and the price elasticity of supply is ' + eS + '. A per-unit tax is placed on sellers. Who bears more of the tax?', keep(['Buyers', 'Sellers', 'They always split it equally', 'Sellers, because they pay it to the government'], inelD ? 0 : 1),
        ['The less elastic side bears more of a tax.', (inelD ? 'Demand (' + eD + ') is less elastic than supply (' + eS + '), so <b>buyers</b> bear more.' : 'Supply (' + eS + ') is less elastic than demand (' + eD + '), so <b>sellers</b> bear more.') + ' Who sends the money to the government doesn’t decide it.'],
        'Which side responds less to price?', null, { kind: 'who', eD: +eD, eS: +eS });
    }
    if (shape === 'legal') {
      var payer = R.pick(['sellers', 'buyers']);
      return P('A \\$2 tax per unit is collected from ' + payer + '. Later the law is changed so the same tax is collected from the ' + (payer === 'sellers' ? 'buyers' : 'sellers') + ' instead. What happens to the price buyers pay (including the tax) and the price sellers keep?', shuf(['Both stay the same', 'Buyers pay more and sellers keep more', 'Buyers pay less and sellers keep less', 'Buyers pay \\$2 more than before'], 0),
        ['Either way, the tax drives the same \\$2 wedge between what buyers pay and what sellers keep.', 'The market lands on the same quantity and the same two prices: <b>nothing changes</b> except who sends the check.'],
        'Does the size of the wedge change?', null, { kind: 'legal' });
    }
    var s = taxSetup(R, { ok: function (m) { return m.b !== m.d; } }), m = s.m, e = s.e, t = s.t, r = s.r, bShare = r.Pb.sub(e.P), sShare = e.P.sub(r.Ps);
    var intro = sdIntro(m, g[0]) + '. A tax of ' + money(t) + ' per unit is collected from sellers.';
    var steps = ['Before the tax: $P^* = ' + mTex(e.P) + '$.', 'With the tax: solve $' + T.terms([[m.a, ''], [-m.b, 'P_b']]) + ' = ' + T.terms([[m.c, ''], [m.d, '(P_b - ' + t + ')']]) + '$, so $P_b = ' + mTex(r.Pb) + '$ and $P_s = ' + mTex(r.Ps) + '$.',
      'Buyers bear $' + nTex(r.Pb) + ' - ' + nTex(e.P) + ' = ' + mTex(bShare) + '$ per unit; sellers bear $' + nTex(e.P) + ' - ' + nTex(r.Ps) + ' = ' + mTex(sShare) + '$.'];
    var askB = R.coin();
    if (shape === 'frac') return P(intro + ' What fraction of the tax do ' + (askB ? 'buyers' : 'sellers') + ' bear? (A fraction or a decimal.)', ratioAns(qq(askB ? bShare : sShare).div(t).num(), qq(askB ? bShare : sShare).div(t).den()),
      steps.concat(['Fraction for ' + (askB ? 'buyers' : 'sellers') + ': $' + mTex(askB ? bShare : sShare) + ' \\div \\$' + t + ' = ' + nTex(qq(askB ? bShare : sShare).div(t)) + '$.']), 'Compare each side’s new price with the old equilibrium price.', null, { kind: 'frac', askB: askB, a: m.a, b: m.b, c: m.c, d: m.d, t: t });
    return P(intro + ' By how much per unit does the price ' + (askB ? 'buyers pay rise' : 'sellers keep fall') + '?', mAns(askB ? bShare : sShare), steps, 'Find the new price, then compare it with the old equilibrium price.', 'dollars', { kind: 'share', askB: askB, a: m.a, b: m.b, c: m.c, d: m.d, t: t });
  });

  G('micro.subsidies', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), s = taxSetup(R, { sub: true }), m = s.m, e = s.e, sv = s.t, r = s.r;
    var ask = L === 1 ? R.pick(['Q', 'Pb', 'cost']) : R.pick(['Q', 'Pb', 'Ps', 'cost', 'dwl', 'tf']);
    if (ask === 'tf') {
      var t0 = R.pick([
        { s: 'In a market with no spillovers, a per-unit subsidy raises total surplus because buyers and sellers both gain.', v: false, why: 'Their gains together are smaller than the cost to taxpayers, so total surplus falls by a deadweight loss.' },
        { s: 'A per-unit subsidy lowers the price buyers pay and raises the price sellers receive.', v: true, why: 'The subsidy fills the gap: sellers receive the buyers’ price plus the subsidy.' },
        { s: 'A per-unit subsidy leads to more than the efficient quantity in a market with no spillovers.', v: true, why: 'The extra units cost more to make than buyers value them.' },
        { s: 'The cost of a subsidy to taxpayers equals the subsidy times the quantity sold before the subsidy.', v: false, why: 'The government pays for every unit sold with the subsidy, which is more than before.' }]);
      return P('True or false: ' + t0.s, tf(t0.v), [t0.why, 'So the statement is <b>' + (t0.v ? 'true' : 'false') + '</b>.'], 'Count the taxpayers too.', null, { kind: 'tf', s: t0.s, v: t0.v });
    }
    var intro = sdIntro(m, g[0]) + ' (equilibrium ' + mTex(e.P) + ' and ' + nTex(e.Q) + ' units). The government pays sellers a subsidy of ' + money(sv) + ' per unit.';
    var steps = ['Sellers receive the buyers’ price plus the subsidy: $P_s = P_b + ' + sv + '$.', 'Solve $' + T.terms([[m.a, ''], [-m.b, 'P_b']]) + ' = ' + T.terms([[m.c, ''], [m.d, '(P_b + ' + sv + ')']]) + '$: $P_b = ' + mTex(r.Pb) + '$ and $P_s = ' + mTex(r.Ps) + '$.', 'Quantity: $' + m.a + ' - ' + m.b + '(' + nTex(r.Pb) + ') = ' + nTex(r.Q) + '$ (up from ' + nTex(e.Q) + ').'];
    var cost = r.Q.mul(sv), dwl = r.Q.sub(e.Q).mul(sv).div(2), chk = { kind: ask, a: m.a, b: m.b, c: m.c, d: m.d, s: sv };
    var map = { Q: ['How many units are sold with the subsidy?', exact(r.Q), 'units', []], Pb: ['What price do buyers pay?', mAns(r.Pb), 'dollars', []], Ps: ['What price do sellers receive, including the subsidy?', mAns(r.Ps), 'dollars', []],
      cost: ['What does the subsidy cost taxpayers?', mAns(cost), 'dollars', ['Cost: $' + sv + ' \\times ' + nTex(r.Q) + ' = ' + mTex(cost) + '$, on every unit sold with the subsidy.']],
      dwl: ['What is the deadweight loss?', mAns(dwl), 'dollars', ['$DWL = \\tfrac{1}{2} \\times ' + sv + ' \\times (' + nTex(r.Q) + ' - ' + nTex(e.Q) + ') = ' + mTex(dwl) + '$: the extra units cost more to make than buyers value them.']] }[ask];
    return P(intro + ' ' + map[0], map[1], steps.concat(map[3]), 'The two prices differ by exactly the subsidy.', map[2], chk);
  });

  G('micro.world-price', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), m, e, pw, imp, w, below;
    for (var t = 0; t < 100; t++) {
      m = polMarket(R); e = eqQ(m); below = L === 1 ? true : R.chance(0.65); pw = below ? e.P.sub(R.int(1, 3)) : e.P.add(R.int(1, 3));
      if (!pw.gt(sMin(m)) || !choke(m).gt(pw)) continue;
      var qd = Q(m.a).sub(pw.mul(m.b)), qs = pw.mul(m.d).add(m.c);
      w = { qd: qd, qs: qs, cs0: choke(m).sub(e.P).mul(e.Q).div(2), ps0: e.P.sub(sMin(m)).mul(e.Q).div(2), cs1: choke(m).sub(pw).mul(qd).div(2), ps1: pw.sub(sMin(m)).mul(qs).div(2) };
      if (terminating(w.cs0, w.ps0, w.cs1, w.ps1)) break;
    }
    var shape = L === 1 ? 'trade' : R.pick(['trade', 'dcs', 'dps', 'net']);
    var intro = sdIntro(m, g[0]) + '. Without trade the equilibrium is ' + mTex(e.P) + ' and ' + nTex(e.Q) + ' units. The country opens to trade at a world price of ' + mTex(pw) + '.';
    var s0 = 'At ' + mTex(pw) + ': $Q_d = ' + nTex(w.qd) + '$ and $Q_s = ' + nTex(w.qs) + '$.';
    var chk = { kind: shape, a: m.a, b: m.b, c: m.c, d: m.d, pw: pw.toPlain() };
    if (shape === 'trade') return P(intro + ' How many units does it ' + (below ? 'import' : 'export') + '?', exact(w.qd.sub(w.qs).abs()),
      [s0, below ? 'Buyers want more than domestic firms make: the gap is imported, $' + nTex(w.qd) + ' - ' + nTex(w.qs) + ' = ' + nTex(w.qd.sub(w.qs)) + '$.' : 'Domestic firms make more than buyers at home want: the rest is exported, $' + nTex(w.qs) + ' - ' + nTex(w.qd) + ' = ' + nTex(w.qs.sub(w.qd)) + '$.'],
      'Compare quantity demanded and quantity supplied at the world price.', 'units', chk);
    var dcs = w.cs1.sub(w.cs0), dps = w.ps1.sub(w.ps0), net = dcs.add(dps);
    var steps = ['Before trade: $CS = ' + mTex(w.cs0) + '$ and $PS = ' + mTex(w.ps0) + '$.', s0, 'After: $CS = \\tfrac{1}{2} \\times ' + nTex(w.qd) + ' \\times (' + nTex(choke(m)) + ' - ' + nTex(pw) + ') = ' + mTex(w.cs1) + '$ and $PS = \\tfrac{1}{2} \\times ' + nTex(w.qs) + ' \\times (' + nTex(pw) + ' - ' + nTex(sMin(m)) + ') = ' + mTex(w.ps1) + '$.'];
    if (shape === 'dcs') return P(intro + ' By how much does consumer surplus change? (Enter a negative number for a loss.)', mAns(dcs), steps.concat(['Change in consumer surplus: $' + mTex(w.cs1) + ' - ' + mTex(w.cs0) + ' = ' + mTex(dcs) + '$.']), 'Compute consumer surplus before and after.', 'dollars', chk);
    if (shape === 'dps') return P(intro + ' By how much does producer surplus change? (Enter a negative number for a loss.)', mAns(dps), steps.concat(['Change in producer surplus: $' + mTex(w.ps1) + ' - ' + mTex(w.ps0) + ' = ' + mTex(dps) + '$.']), 'Compute producer surplus before and after.', 'dollars', chk);
    return P(intro + ' By how much does total surplus (consumers plus producers) rise?', mAns(net), steps.concat(['Change: $(' + mTex(w.cs1) + ' + ' + mTex(w.ps1) + ') - (' + mTex(w.cs0) + ' + ' + mTex(w.ps0) + ') = ' + mTex(net) + '$, a gain: the winners gain more than the losers lose.']), 'Add consumer and producer surplus before and after.', 'dollars', chk);
  });

  G('micro.tariffs-quotas', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(SD_GOODS), m, e, pw, tf2, x;
    for (var t = 0; t < 120; t++) {
      m = polMarket(R); e = eqQ(m); pw = e.P.sub(R.int(2, 4)); tf2 = R.int(1, 2);
      if (!pw.gt(sMin(m)) || !pw.add(tf2).lt(e.P)) continue;
      var p1 = pw.add(tf2);
      x = { qd0: Q(m.a).sub(pw.mul(m.b)), qs0: pw.mul(m.d).add(m.c), qd1: Q(m.a).sub(p1.mul(m.b)), qs1: p1.mul(m.d).add(m.c), p1: p1 };
      x.imp0 = x.qd0.sub(x.qs0); x.imp1 = x.qd1.sub(x.qs1); x.rev = x.imp1.mul(tf2); x.dwl = x.qs1.sub(x.qs0).mul(tf2).div(2).add(x.qd0.sub(x.qd1).mul(tf2).div(2));
      if (x.qs0.gt(0) && terminating(x.dwl)) break;
    }
    var shape = L === 1 ? R.pick(['price', 'imports']) : R.pick(['imports', 'rev', 'dwl', 'quota', 'who']);
    var intro = sdIntro(m, g[0]) + '. The country imports at a world price of ' + mTex(pw) + '.';
    var chk = { kind: shape, a: m.a, b: m.b, c: m.c, d: m.d, pw: pw.toPlain(), t: tf2 };
    var s0 = 'With the tariff, the domestic price rises to $' + nTex(pw) + ' + ' + tf2 + ' = ' + mTex(x.p1) + '$.', s1 = 'Before: imports $= ' + nTex(x.qd0) + ' - ' + nTex(x.qs0) + ' = ' + nTex(x.imp0) + '$. After: $Q_d = ' + nTex(x.qd1) + '$, $Q_s = ' + nTex(x.qs1) + '$, imports $= ' + nTex(x.imp1) + '$.';
    if (shape === 'price') return P(intro + ' It adds a tariff of ' + money(tf2) + ' per imported unit. What is the new domestic price?', mAns(x.p1), [s0, 'Foreign sellers need the world price plus the tariff, so domestic buyers pay ' + mTex(x.p1) + ' (for domestic and imported units alike).'], 'World price plus the tariff.', 'dollars', chk);
    if (shape === 'imports') return P(intro + ' It adds a tariff of ' + money(tf2) + ' per imported unit. How many units are imported after the tariff?', exact(x.imp1), [s0, s1], 'Find quantity demanded and quantity supplied at the new price.', 'units', chk);
    if (shape === 'rev') return P(intro + ' It adds a tariff of ' + money(tf2) + ' per imported unit. How much tariff revenue does the government collect?', mAns(x.rev), [s0, s1, 'Revenue: $' + tf2 + ' \\times ' + nTex(x.imp1) + ' = ' + mTex(x.rev) + '$, on imports after the tariff.'], 'Tariff times the new quantity of imports.', 'dollars', chk);
    if (shape === 'dwl') return P(intro + ' It adds a tariff of ' + money(tf2) + ' per imported unit. What is the total deadweight loss?', mAns(x.dwl),
      [s0, s1, 'Production triangle: $\\tfrac{1}{2} \\times ' + tf2 + ' \\times (' + nTex(x.qs1) + ' - ' + nTex(x.qs0) + ') = ' + mTex(x.qs1.sub(x.qs0).mul(tf2).div(2)) + '$.', 'Consumption triangle: $\\tfrac{1}{2} \\times ' + tf2 + ' \\times (' + nTex(x.qd0) + ' - ' + nTex(x.qd1) + ') = ' + mTex(x.qd0.sub(x.qd1).mul(tf2).div(2)) + '$.', 'Total: ' + mTex(x.dwl) + '.'],
      'Two triangles: extra domestic production and lost consumption.', 'dollars', chk);
    if (shape === 'quota') return P(intro + ' Instead of a tariff, it limits imports to ' + nTex(x.imp1) + ' units. What is the new domestic price?', mAns(x.p1),
      ['Imports are $Q_d - Q_s = (' + qdTex(m.a, m.b).replace('Q_d = ', '') + ') - (' + qsTex(m.c, m.d).replace('Q_s = ', '') + ') = ' + T.terms([[m.a - m.c, ''], [-(m.b + m.d), 'P']]) + '$.', 'Set that equal to ' + nTex(x.imp1) + ': $P = ' + mTex(x.p1) + '$.', 'The same price as a ' + money(tf2) + ' tariff, but the ' + mTex(x.rev) + ' rectangle goes to license holders.'],
      'Find the price at which imports equal the quota.', 'dollars', chk);
    var ch = ['Holders of the import licenses', 'The government', 'Foreign governments', 'Domestic consumers'];
    return P('A country replaces a tariff with an import quota that allows the same quantity of imports, so the domestic price is the same. Who receives the money that used to be tariff revenue (the price gap times the imports)?', shuf(ch, 0),
      ['The domestic price is above the world price, so whoever is allowed to import buys at the world price and sells at the domestic price.', 'That gain, the <b>quota rent</b>, goes to the license holders, not to the government.'],
      'Who gets to buy at the world price and sell at the higher domestic price?', null, { kind: 'who' });
  });

  // =================================================================== Unit 7: Production and Costs
  var BIZ = [['café', 'Rosa'], ['repair shop', 'Jin'], ['bakery', 'Amara'], ['bike shop', 'Theo'], ['dog-grooming business', 'Lena'], ['food truck', 'Marco']];
  G('micro.economic-profit', function (R, ctx) {
    var L = ctx.level || 1, b = R.pick(BIZ), rev = R.int(12, 30) * 10000, exp = R.int(5, M.floor(rev / 10000) - 3) * 10000, sal = R.int(3, 8) * 10000;
    var sav = R.int(2, 10) * 10000, rate = R.pick([2, 3, 4, 5, 6]), useSav = L >= 2 && R.coin(), imp = sal + (useSav ? sav * rate / 100 : 0);
    var acc = rev - exp, eco = acc - imp, shape = L === 1 ? R.pick(['acc', 'eco']) : R.pick(['acc', 'eco', 'eco', 'stay', 'tf']);
    var intro = b[1] + '’s ' + b[0] + ' brings in ' + money(rev) + ' in revenue a year and pays ' + money(exp) + ' for staff, rent and supplies. To run it, ' + b[1] + ' gave up a job paying ' + money(sal) + ' a year' + (useSav ? ' and put ' + money(sav) + ' of savings into the business instead of an account paying ' + rate + '% a year' : '') + '.';
    var steps = ['Accounting profit: $' + money(rev) + ' - ' + money(exp) + ' = ' + money(acc) + '$.', 'Implicit costs: ' + (useSav ? '$' + money(sal) + ' + 0.0' + rate + ' \\times ' + money(sav) + ' = ' + money(sal) + ' + ' + money(sav * rate / 100) + ' = ' + money(imp) + '$.' : 'the ' + money(sal) + ' salary given up.'), 'Economic profit: $' + money(acc) + ' - ' + money(imp) + ' = ' + money(eco) + '$.'];
    var chk = { kind: shape, rev: rev, exp: exp, sal: sal, sav: useSav ? sav : 0, rate: rate };
    if (shape === 'acc') return P(intro + ' What is the accounting profit?', dollars(acc), steps.slice(0, 1), 'Revenue minus explicit costs only.', 'dollars', chk);
    if (shape === 'eco') return P(intro + ' What is the economic profit? (Enter a negative number for a loss.)', dollars(eco), steps, 'Subtract implicit costs too.', 'dollars', chk);
    if (shape === 'stay') {
      var ch = ['Yes: the business earns more than the owner’s best alternative', 'No: the owner would do better in the best alternative', 'It makes no difference: the business earns exactly a normal profit'];
      var v = eco > 0 ? 0 : eco < 0 ? 1 : 2;
      return P(intro + ' Judged by economic profit, is the ' + b[0] + ' the best use of ' + b[1] + '’s time and money?', keep(ch, v), steps.concat([eco > 0 ? 'Positive economic profit: better than the next best option.' : eco < 0 ? 'Negative economic profit: the next best option pays more, even though accounting profit is ' + (acc > 0 ? 'positive' : 'what it is') + '.' : 'Zero economic profit: exactly as good as the next best option.']),
        'Compare accounting profit with all the implicit costs.', null, chk);
    }
    var t = R.pick([
      { s: 'A firm earning zero economic profit is losing money and should close.', v: false, why: 'Zero economic profit covers every cost, including a normal return on the owner’s time and money.' },
      { s: 'Economic profit is always less than or equal to accounting profit.', v: true, why: 'Economic profit subtracts implicit costs as well, and implicit costs are never negative.' },
      { s: 'The salary an owner gives up to run her own business is an explicit cost.', v: false, why: 'No one is paid it: it is an implicit cost, an opportunity cost of her time.' },
      { s: 'Rent a firm pays to a landlord is an explicit cost.', v: true, why: 'It is a payment to someone else.' }
    ]);
    return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Explicit costs are paid to others; implicit costs are opportunity costs.', null, { kind: 'tf', s: t.s, v: t.v });
  });

  // a short-run production table: MP rises for the first one or two workers, then falls (sometimes to negative)
  function prodTable(R, neg) {
    for (var t = 0; t < 300; t++) {
      var mp = [R.int(4, 10)], up = R.int(1, 2), i;
      for (i = 0; i < up; i++) mp.push(mp[mp.length - 1] + R.int(2, 6));
      while (mp.length < 7) mp.push(mp[mp.length - 1] - R.int(2, 5));
      var ok = true; for (i = 1; i < mp.length; i++) if (i <= up ? !(mp[i] > mp[i - 1]) : !(mp[i] < mp[i - 1])) ok = false;
      var hasNeg = mp.some(function (v) { return v < 0; });
      if (ok && (neg ? hasNeg && mp[mp.length - 2] >= 0 : mp[mp.length - 1] > 0)) return mp;
    }
    return neg ? [6, 12, 10, 7, 3, 0, -3] : [6, 12, 10, 8, 5, 3, 1];
  }
  G('micro.production-function', function (R, ctx) {
    var L = ctx.level || 1, mp = prodTable(R, L === 3), tp = cumsum(mp), n = mp.length, tbl = htmlTable(['Workers', 'Total product'], [[0, 0]].concat(tp.map(function (v, i) { return [i + 1, v]; })));
    var peak = 0; mp.forEach(function (v, i) { if (v > mp[peak]) peak = i; });
    var shape = L === 1 ? R.pick(['mp', 'ap']) : R.pick(['mp', 'ap', 'dim', 'tp', 'neg']);
    if (shape === 'neg' && !mp.some(function (v) { return v < 0; })) shape = 'dim';
    var intro = 'A bakery with one oven hires workers. The table shows its output (loaves per hour).' + tbl, chk = { kind: shape, tp: tp };
    if (shape === 'mp') { var k = R.int(2, n); chk.k = k; return P(intro + 'What is the marginal product of worker ' + k + '?', exact(mp[k - 1]), ['$MP = ' + tp[k - 1] + ' - ' + tp[k - 2] + ' = ' + mp[k - 1] + '$ loaves.'], 'Change in total product from adding that worker.', 'loaves', chk); }
    if (shape === 'ap') { var k2 = R.int(2, n), ap = Q(tp[k2 - 1], k2); chk.k = k2; return P(intro + 'What is the average product of ' + k2 + ' workers? (Round to two decimal places if needed.)', ap.isTerminating() ? exact(ap) : near(ap, 0.006), ['$AP = TP \\div L = ' + tp[k2 - 1] + ' \\div ' + k2 + ' = ' + (ap.isTerminating() ? nx(ap) : '\\approx ' + T.num(+ap.toDec(2))) + '$ loaves per worker.'], 'Total product divided by the number of workers.', 'loaves', chk); }
    if (shape === 'tp') { var m = R.int(3, 5); chk.mps = mp.slice(0, m); return P('The marginal products of a bakery’s first ' + m + ' workers are ' + U.list(mp.slice(0, m).map(String)) + ' loaves per hour. What is total product with ' + m + ' workers?', exact(tp[m - 1]), ['Total product adds up the marginal products: $' + mp.slice(0, m).join(' + ') + ' = ' + tp[m - 1] + '$.'], 'Add the marginal products.', 'loaves', chk); }
    if (shape === 'neg') { var first = mp.findIndex(function (v) { return v < 0; }) + 1; return P(intro + 'Which worker is the first one whose hiring makes total product <b>fall</b>?', exact(first), ['Marginal products: ' + mp.join(', ') + '.', 'Total product falls when marginal product is negative: first at worker <b>' + first + '</b>. Diminishing returns began much earlier, at worker ' + (peak + 2) + '.'], 'Look for the first negative marginal product.', null, chk); }
    return P(intro + 'With which worker do diminishing marginal returns begin (the first worker whose marginal product is smaller than the one before)?', exact(peak + 2),
      ['Marginal products: ' + mp.join(', ') + '.', 'MP is highest at worker ' + (peak + 1) + ' and smaller from worker <b>' + (peak + 2) + '</b> on: diminishing marginal returns.'], 'Compute each marginal product and find where it starts to shrink.', null, chk);
  });

  // a cost table: FC, then MC falling a little then rising; integers
  function costTable(R) {
    var F = R.int(2, 8) * 10, mc = [R.int(14, 24)]; mc.push(mc[0] - R.int(3, 8)); mc.push(mc[1] - R.int(0, 3)); if (mc[2] < 2) mc[2] = 2;
    while (mc.length < 6) mc.push(mc[mc.length - 1] + R.int(3, 10));
    var tc = [F].concat(cumsum(mc).map(function (v) { return v + F; }));
    return { F: F, mc: mc, tc: tc };
  }
  function costHtml(ct) { return htmlTable(['Quantity', 'Total cost'], ct.tc.map(function (v, i) { return [i, money(v)]; })); }
  G('micro.short-run-costs', function (R, ctx) {
    var L = ctx.level || 1, ct = costTable(R), shape = L === 1 ? R.pick(['fc', 'mc', 'vc']) : R.pick(['mc', 'vc', 'atc', 'avc', 'afc', 'fc']);
    var q = R.int(2, 6), intro = 'A small workshop’s short-run total cost is shown in the table.' + costHtml(ct), chk = { kind: shape, tc: ct.tc, q: q };
    var vc = ct.tc[q] - ct.F;
    if (shape === 'fc') return P(intro + 'What is the fixed cost?', dollars(ct.F), ['Fixed cost is the cost at zero output: ' + money(ct.F) + '.'], 'What does it cost to produce nothing?', 'dollars', chk);
    if (shape === 'mc') return P(intro + 'What is the marginal cost of unit ' + q + '?', dollars(ct.tc[q] - ct.tc[q - 1]), ['$MC = TC(' + q + ') - TC(' + (q - 1) + ') = ' + money(ct.tc[q]) + ' - ' + money(ct.tc[q - 1]) + ' = ' + money(ct.tc[q] - ct.tc[q - 1]) + '$.'], 'A difference between two rows, not a division.', 'dollars', chk);
    if (shape === 'vc') return P(intro + 'What is the variable cost of producing ' + q + ' units?', dollars(vc), ['Fixed cost is ' + money(ct.F) + ' (the cost at zero).', '$VC = TC - FC = ' + money(ct.tc[q]) + ' - ' + money(ct.F) + ' = ' + money(vc) + '$.'], 'Subtract the fixed cost.', 'dollars', chk);
    var val = shape === 'atc' ? Q(ct.tc[q], q) : shape === 'avc' ? Q(vc, q) : Q(ct.F, q), nm = { atc: 'average total cost', avc: 'average variable cost', afc: 'average fixed cost' }[shape];
    var top = shape === 'atc' ? ct.tc[q] : shape === 'avc' ? vc : ct.F;
    return P(intro + 'What is the ' + nm + ' of ' + q + ' units? (Round to the nearest cent if needed.)', mAns(val),
      (shape === 'atc' ? [] : ['Fixed cost is ' + money(ct.F) + '.' + (shape === 'avc' ? ' $VC = ' + money(ct.tc[q]) + ' - ' + money(ct.F) + ' = ' + money(vc) + '$.' : '')]).concat(['$' + { atc: 'ATC', avc: 'AVC', afc: 'AFC' }[shape] + ' = ' + money(top) + ' \\div ' + q + ' = ' + mTex(val) + '$' + (val.isTerminating() ? '.' : ', about ' + money(+val.toDec(2)) + '.')]),
      'Divide the right total by the quantity.', 'dollars', chk);
  });

  G('micro.cost-curves', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['rule', 'grade']) : R.pick(['rule', 'minatc', 'minavc', 'tf', 'grade']);
    if (shape === 'rule') {
      var below = R.coin(), avg = R.pick(['average total cost', 'average variable cost']), ch = ['It is falling', 'It is rising', 'It is at its minimum'];
      return P('At the current output, marginal cost is ' + (below ? 'below' : 'above') + ' ' + avg + '. What is happening to ' + avg + ' as output increases?', keep(ch, below ? 0 : 1),
        ['Each new unit’s cost pulls the average toward it.', below ? 'MC below the average pulls it <b>down</b>.' : 'MC above the average pulls it <b>up</b>.'], 'Think of a test score below or above your average.', null, { kind: 'rule', below: below });
    }
    if (shape === 'grade') {
      var n = R.int(3, 6), avg0 = R.int(70, 88), sc = avg0 + R.pick([-12, -8, -5, 5, 8, 12]), nw = Q(avg0 * n + sc, n + 1);
      return P('A student’s average over ' + n + ' tests is ' + avg0 + '. The next test scores ' + sc + '. What is the new average? (Round to two decimal places if needed.)', nw.isTerminating() ? exact(nw) : near(nw, 0.006),
        ['Total so far: $' + n + ' \\times ' + avg0 + ' = ' + (n * avg0) + '$.', 'New average: $(' + (n * avg0) + ' + ' + sc + ') \\div ' + (n + 1) + ' = ' + (nw.isTerminating() ? nx(nw) : '\\approx ' + T.num(+nw.toDec(2))) + '$.', 'The new score is ' + (sc < avg0 ? 'below' : 'above') + ' the average, so it pulls the average ' + (sc < avg0 ? 'down' : 'up') + ': the same reason MC pulls ATC.'],
        'Find the old total, add the new score, divide by the new count.', null, { kind: 'grade', n: n, avg: avg0, sc: sc });
    }
    if (shape === 'tf') {
      var t = R.pick([
        { s: 'Marginal cost crosses average total cost at the lowest point of the marginal cost curve.', v: false, why: 'It crosses at the lowest point of ATC; MC is already rising there.' },
        { s: 'Marginal cost crosses average variable cost at the lowest point of average variable cost.', v: true, why: 'While MC is below AVC it pulls AVC down; once above, it pulls AVC up.' },
        { s: 'Average fixed cost falls as output rises.', v: true, why: 'The same fixed cost is spread over more units.' },
        { s: 'The vertical gap between ATC and AVC gets larger as output rises.', v: false, why: 'The gap is AFC, which shrinks as output rises.' }]);
      return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Averages follow the marginal value.', null, { kind: 'tf', s: t.s, v: t.v });
    }
    var ct, avgs, best, tries = 0, isATC = shape === 'minatc';
    do { ct = costTable(R); avgs = ct.tc.slice(1).map(function (v, i) { return (isATC ? v : v - ct.F) / (i + 1); }); best = 0; avgs.forEach(function (v, i) { if (v < avgs[best] - 1e-9) best = i; }); tries++; }
    while ((avgs.filter(function (v) { return M.abs(v - avgs[best]) < 1e-9; }).length > 1 || best === 0 || best === 5) && tries < 200);
    return P('A firm’s short-run total cost is shown in the table.' + costHtml(ct) + 'At what quantity is ' + (isATC ? 'average total cost' : 'average variable cost') + ' lowest?', exact(best + 1),
      [(isATC ? 'ATC = TC ÷ q: ' : 'AVC = (TC − ' + money(ct.F) + ') ÷ q: ') + avgs.map(function (v) { return money(Math.round(v * 100) / 100); }).join(', ') + '.', 'The lowest is at q = ' + (best + 1) + '.', 'Check with marginal cost: MC of unit ' + (best + 1) + ' is ' + money(ct.mc[best]) + ' and of unit ' + (best + 2) + ' is ' + money(ct.mc[best + 1]) + '. MC passes from below the average to above it here.'],
      'Compute the average at each quantity, or look for where MC rises above the average.', 'units', { kind: shape, tc: ct.tc });
  });

  var SHIFT_COST = [
    { s: 'The city raises the yearly license fee for the business.', f: true }, { s: 'The landlord raises the monthly rent on the shop.', f: true }, { s: 'The government charges the business a lump-sum tax that does not depend on output.', f: true },
    { s: 'The owner buys a more expensive insurance policy with a fixed yearly premium.', f: true, lv: 2 }, { s: 'Wages of the workers who make the product rise.', f: false }, { s: 'The price of the raw materials used in each unit rises.', f: false },
    { s: 'The government adds a tax on each unit sold.', f: false, lv: 2 }, { s: 'Electricity used to run the machines for each unit gets more expensive.', f: false, lv: 2 }
  ];
  G('micro.cost-shifts', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? 'which' : R.pick(['which', 'which', 'output', 'atc', 'mc']);
    if (shape === 'which' || shape === 'output') {
      var ev = bank(R, ctx, SHIFT_COST), up = true;
      if (shape === 'output') {
        var ch2 = ['It does not change', 'It rises', 'It falls'];
        return P('A price-taking firm is producing where price equals marginal cost. ' + ev.s + ' In the short run, what happens to the quantity that maximizes its profit?', keep(ch2, ev.f ? 0 : 2),
          [ev.f ? 'This is a fixed cost: it does not change the cost of one more unit, so MC does not move.' : 'This raises the cost of every unit, so MC shifts up.', ev.f ? 'With MC unchanged, the quantity where P = MC is <b>unchanged</b> (profit falls, but output does not).' : 'At the same price, MC now meets it at a smaller quantity: output <b>falls</b>.'],
          'Does this cost change the cost of the next unit?', null, { kind: 'output', f: ev.f });
      }
      var ch = ['Only ATC and AFC shift up; MC and AVC do not move', 'MC, AVC and ATC all shift up', 'Only MC shifts up', 'No cost curve moves'];
      return P('A firm faces this change: ' + ev.s + ' Which cost curves shift?', keep(ch, ev.f ? 0 : 1),
        [ev.f ? 'This cost is the same whatever the output: a <b>fixed cost</b>.' : 'This cost grows with each unit made: a <b>variable cost</b>.', ev.f ? 'It raises total cost by the same amount at every quantity, so the cost of one more unit (MC) and AVC are unchanged; spread over the units, ATC and AFC rise.' : 'It raises the cost of each unit, so MC and AVC rise, and ATC with them.'],
        'Does the cost depend on how many units are made?', null, { kind: 'which', f: ev.f });
    }
    var q = R.pick([10, 20, 25, 40, 50, 100, 200]), atc0 = R.int(8, 30), dF = R.pick([50, 100, 200, 250, 400, 500, 1000]), mc0 = R.int(5, 30), tax = R.pick([0.5, 1, 1.5, 2, 3]);
    if (shape === 'atc') { var add = Q(dF, q); return P('At ' + q + ' units, a firm’s average total cost is ' + money(atc0) + '. Its yearly license fee rises by ' + money(dF) + ', and it still makes ' + q + ' units. What is its new average total cost?', mAns(add.add(atc0)),
      ['The fee is a fixed cost, spread over ' + q + ' units: $' + money(dF) + ' \\div ' + q + ' = ' + mTex(add) + '$ per unit.', 'New ATC: $' + money(atc0) + ' + ' + mTex(add) + ' = ' + mTex(add.add(atc0)) + '$. (MC and AVC are unchanged.)'], 'Spread the extra fixed cost over the units.', 'dollars', { kind: 'atc', atc: atc0, dF: dF, q: q }); }
    return P('A firm’s marginal cost at its current output is ' + money(mc0) + '. The government adds a tax of ' + money(tax) + ' on each unit it sells. What is its new marginal cost at that output?', mAns(Q.from(mc0).add(Q.from(tax))),
      ['A per-unit tax adds ' + money(tax) + ' to the cost of every unit, including the next one.', 'New MC: $' + money(mc0) + ' + ' + money(tax) + ' = ' + money(mc0 + tax) + '$.'], 'A per-unit tax is a variable cost.', 'dollars', { kind: 'mc', mc: mc0, tax: tax });
  });

  G('micro.long-run-costs', function (R, ctx) {
    var L = ctx.level || 1, base = R.pick([1000, 100, 500, 2000]);
    // LRATC: falling, flat over 2 outputs, then rising
    var a = [R.int(12, 20)]; a.push(a[0] - R.int(2, 4)); a.push(a[1] - R.int(1, 3)); var flat = a[2]; a.push(flat); a.push(flat + R.int(1, 3)); a.push(a[4] + R.int(1, 3));
    var outs = a.map(function (v, i) { return base * (i + 1); }), tcs = a.map(function (v, i) { return v * outs[i]; });
    var tbl = htmlTable(['Output', 'Long-run total cost'], outs.map(function (o, i) { return [T.commas(o), money(tcs[i])]; }));
    var shape = L === 1 ? R.pick(['lratc', 'range']) : R.pick(['lratc', 'range', 'mes', 'tf']);
    var avgLine = 'LRATC = total cost ÷ output: ' + a.map(function (v) { return money(v); }).join(', ') + '.';
    if (shape === 'lratc') { var k = R.int(0, 5); return P('A firm’s long-run total cost at different outputs is shown.' + tbl + 'What is the long-run average total cost at ' + T.commas(outs[k]) + ' units?', dollars(a[k]), ['$' + money(tcs[k]) + ' \\div ' + T.commas(outs[k]) + ' = ' + money(a[k]) + '$ per unit.'], 'Divide total cost by output.', 'dollars', { kind: 'lratc', outs: outs, tcs: tcs, k: k }); }
    if (shape === 'mes') return P('A firm’s long-run total cost at different outputs is shown.' + tbl + 'What is the minimum efficient scale (the smallest output with the lowest average cost)?', exact(outs[2]), [avgLine, 'The lowest LRATC, ' + money(flat) + ', is first reached at ' + T.commas(outs[2]) + ' units.'], 'Compute LRATC at each output and find where it first hits its minimum.', 'units', { kind: 'mes', outs: outs, tcs: tcs });
    if (shape === 'range') {
      var r = R.int(0, 2), seg = [[0, 1], [2, 3], [4, 5]][r], ch = ['Economies of scale', 'Constant returns to scale', 'Diseconomies of scale'];
      return P('A firm’s long-run total cost at different outputs is shown.' + tbl + 'As output grows from ' + T.commas(outs[seg[0]]) + ' to ' + T.commas(outs[seg[1]]) + ', what does the firm experience?', keep(ch, r),
        [avgLine, 'From ' + T.commas(outs[seg[0]]) + ' to ' + T.commas(outs[seg[1]]) + ', LRATC goes from ' + money(a[seg[0]]) + ' to ' + money(a[seg[1]]) + ': ' + ['falling, so <b>economies of scale</b>.', 'flat, so <b>constant returns to scale</b>.', 'rising, so <b>diseconomies of scale</b>.'][r]],
        'Compute average cost at both outputs and compare.', null, { kind: 'range', outs: outs, tcs: tcs, seg: seg });
    }
    var t = R.pick([
      { s: 'Diseconomies of scale happen because a firm adds workers to a fixed factory.', v: false, why: 'That describes diminishing marginal returns, a short-run idea. Diseconomies of scale are about the whole firm growing in the long run, when nothing is fixed.' },
      { s: 'In the long run, a firm can change the size of its plant.', v: true, why: 'In the long run every input is variable.' },
      { s: 'Economies of scale mean long-run average cost falls as the firm grows.', v: true, why: 'That is the definition.' },
      { s: 'The long-run average cost curve is the highest of the short-run ATC curves at each output.', v: false, why: 'It is the lowest: for each output, the firm picks the plant size with the lowest ATC.' }]);
    return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Long run: every input can change.', null, { kind: 'tf', s: t.s, v: t.v });
  });

  // =================================================================== Unit 8: Perfect Competition
  var PT_GOODS = [['wheat', 'bushels', 'bushel'], ['corn', 'bushels', 'bushel'], ['eggs', 'dozen eggs', 'dozen'], ['tomatoes', 'crates', 'crate'], ['milk', 'gallons', 'gallon'], ['potatoes', 'sacks', 'sack']];
  G('micro.price-takers', function (R, ctx) {
    var L = ctx.level || 1, g = R.pick(PT_GOODS), pr = R.pick([2, 3, 4, 5, 6, 8, 2.5, 3.5, 4.5]), q = R.int(2, 40) * 100, shape = L === 1 ? R.pick(['tr', 'mr']) : R.pick(['tr', 'mr', 'curve', 'tf', 'ar']);
    var intro = 'A farm sells ' + g[0] + ' in a perfectly competitive market where the price is ' + money(pr) + ' per ' + g[2] + '.';
    if (shape === 'tr') return P(intro + ' What is its total revenue from selling ' + T.commas(q) + ' ' + g[1] + '?', dollars(pr * q), ['$TR = P \\times q = ' + money(pr) + ' \\times ' + T.commas(q) + ' = ' + money(pr * q) + '$.'], 'Price times quantity.', 'dollars', { kind: 'tr', P: pr, q: q });
    if (shape === 'mr' || shape === 'ar') return P(intro + ' It is selling ' + T.commas(q) + ' ' + g[1] + '. What is its ' + (shape === 'mr' ? 'marginal revenue from one more ' + g[2] : 'average revenue') + '?', dollars(pr),
      [shape === 'mr' ? 'A price taker can sell one more ' + g[2] + ' at the market price without lowering the price on the others.' : 'Average revenue is $TR \\div q = (P \\times q) \\div q = P$.', 'So it is <b>' + money(pr) + '</b>: for a price taker, $P = MR = AR$.'], 'The firm is a price taker.', 'dollars', { kind: shape, P: pr });
    if (shape === 'curve') {
      var ch = ['A horizontal line at the market price', 'A downward-sloping line, like the market demand curve', 'A vertical line at its current output', 'An upward-sloping line'];
      return P('In a perfectly competitive market, what does the demand curve facing <b>one</b> firm look like?', shuf(ch, 0), ['One firm’s output is too small to move the market price; at any higher price, buyers go to identical sellers.', 'So the firm can sell all it wants at the market price: its demand curve is <b>horizontal</b> ($P = MR$).'], 'Could one small farm change the market price?', null, { kind: 'curve' });
    }
    var t = R.pick([
      { s: 'A perfectly competitive firm can raise its price a little and still sell most of its output.', v: false, why: 'Buyers can get an identical product from many other sellers at the market price, so it would sell nothing.' },
      { s: 'For a price-taking firm, marginal revenue equals the market price.', v: true, why: 'Each extra unit sells at the market price without lowering the price of the others.' },
      { s: 'Because market demand slopes down, each perfectly competitive firm faces a downward-sloping demand curve.', v: false, why: 'The market curve slopes down, but one small firm faces a flat line at the market price.' },
      { s: 'In perfect competition, firms sell products that buyers see as identical.', v: true, why: 'That is one of the conditions of perfect competition.' }]);
    return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Think of one farm among thousands.', null, { kind: 'tf', s: t.s, v: t.v });
  });

  // a cost table plus a price with a unique profit-maximizing quantity (no unit with MC exactly equal to P)
  function priceTable(R) {
    for (var t = 0; t < 300; t++) {
      var ct = costTable(R), P0 = R.int(M.min.apply(null, ct.mc) + 2, ct.mc[5] - 1);
      if (ct.mc.indexOf(P0) >= 0) continue;
      var prof = ct.tc.map(function (c, q) { return P0 * q - c; }), best = 0; prof.forEach(function (v, q) { if (v > prof[best]) best = q; });
      if (prof.filter(function (v) { return v === prof[best]; }).length > 1 || best < 2) continue;
      return { ct: ct, P: P0, prof: prof, q: best };
    }
    var c0 = { F: 30, mc: [20, 12, 10, 12, 26, 34], tc: [30, 50, 62, 72, 84, 110, 144] }; return { ct: c0, P: 28, prof: c0.tc.map(function (c, q) { return 28 * q - c; }), q: 5 };
  }
  G('micro.profit-maximizing-output', function (R, ctx) {
    var L = ctx.level || 1, s = priceTable(R), ct = s.ct, shape = L === 1 ? 'q' : R.pick(['q', 'q', 'profit', 'why', 'rule']);
    var tbl = htmlTable(['Quantity', 'Total cost'], ct.tc.map(function (v, i) { return [i, money(v)]; }));
    var intro = 'A price-taking firm sells at a market price of ' + money(s.P) + '. Its total cost is shown.' + tbl;
    var mcLine = 'Marginal costs of units 1 to 6: ' + ct.mc.map(function (v) { return money(v); }).join(', ') + '.';
    var chk = { kind: shape, tc: ct.tc, P: s.P };
    if (shape === 'rule') {
      var ch = ['Where marginal revenue equals marginal cost', 'Where total revenue is largest', 'Where average total cost is lowest', 'Where profit per unit is largest'];
      return P('Where does a firm produce to maximize its total profit?', shuf(ch, 0), ['Each unit adds MR − MC to profit, so keep producing while MR ≥ MC and stop where they meet.', 'Revenue keeps rising with more output, and profit per unit is highest at the bottom of ATC, but neither maximizes <b>total</b> profit.'], 'Think one unit at a time.', null, { kind: 'rule' });
    }
    if (shape === 'why') {
      var k = s.q + 1;
      return P(intro + 'The firm’s best output is ' + s.q + ' units. Why doesn’t it make unit ' + k + '?', keep(['Unit ' + k + ' costs ' + money(ct.mc[k - 1]) + ' to make but brings in only ' + money(s.P), 'Total revenue would fall', 'Average total cost would be higher than the price', 'The market price would fall'], 0),
        [mcLine, 'Unit ' + k + ' adds ' + money(s.P) + ' of revenue and ' + money(ct.mc[k - 1]) + ' of cost, so it would lower profit by ' + money(ct.mc[k - 1] - s.P) + '.'], 'Compare that unit’s marginal cost with the price.', null, { kind: 'why', k: k, tc: ct.tc, P: s.P });
    }
    if (shape === 'profit') return P(intro + 'What is the firm’s largest possible profit?', dollars(s.prof[s.q]), [mcLine, 'Produce every unit with MC below ' + money(s.P) + ': ' + s.q + ' units.', 'Profit: $' + s.P + ' \\times ' + s.q + ' - ' + money(ct.tc[s.q]) + ' = ' + money(s.prof[s.q]) + '$.'], 'Find the best quantity with MR = MC, then compute TR − TC.', 'dollars', chk);
    return P(intro + 'How many units maximize its profit?', exact(s.q), [mcLine, 'MR is the price, ' + money(s.P) + '. Units 1 to ' + s.q + ' each add more revenue than cost; unit ' + (s.q + 1) + ' costs ' + money(ct.mc[s.q]) + ', more than ' + money(s.P) + '.', 'Produce <b>' + s.q + '</b> units. Profit there: ' + money(s.prof[s.q]) + '.'],
      'Compare the price with each unit’s marginal cost.', 'units', chk);
  });

  G('micro.profit-and-loss', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? 'calc' : R.pick(['calc', 'calc', 'class', 'table']);
    if (shape === 'table') {
      var s = priceTable(R), tbl = htmlTable(['Quantity', 'Total cost'], s.ct.tc.map(function (v, i) { return [i, money(v)]; })), atc = Q(s.ct.tc[s.q], s.q);
      return P('A price-taking firm sells at ' + money(s.P) + '. Its total cost is shown.' + tbl + 'It produces its profit-maximizing output. What is its profit? (Enter a negative number for a loss.)', dollars(s.prof[s.q]),
        ['Marginal costs: ' + s.ct.mc.map(function (v) { return money(v); }).join(', ') + '. The best output is ' + s.q + ' (the last unit with MC below the price).', 'At ' + s.q + ' units, $ATC = ' + money(s.ct.tc[s.q]) + ' \\div ' + s.q + ' = ' + mTex(atc) + '$.', 'Profit: $(P - ATC) \\times q = (' + s.P + ' - ' + nTex(atc) + ') \\times ' + s.q + ' = ' + money(s.prof[s.q]) + '$.'],
        'Find the best quantity, then (P − ATC) × q.', 'dollars', { kind: 'table', tc: s.ct.tc, P: s.P });
    }
    var q = R.int(4, 30), pr = R.int(8, 40), atc = pr + R.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), mc = pr, prof = (pr - atc) * q;
    if (shape === 'class') {
      var atc2 = pr + R.pick([-3, -2, 0, 2, 3]), ch = ['An economic profit', 'An economic loss', 'Zero economic profit (it breaks even)'], v = pr > atc2 ? 0 : pr < atc2 ? 1 : 2;
      return P('A price-taking firm produces where P = MC. The price is ' + money(pr) + ' and its average total cost at that output is ' + money(atc2) + '. What is it earning?', keep(ch, v),
        ['Profit per unit is $P - ATC = ' + money(pr) + ' - ' + money(atc2) + ' = ' + money(pr - atc2) + '$.', '<b>' + ch[v] + '</b>.'], 'Compare price with average total cost.', null, { kind: 'class', P: pr, atc: atc2 });
    }
    return P('A price-taking firm sells ' + q + ' units at ' + money(pr) + ' each. At that output its marginal cost is ' + money(mc) + ' and its average total cost is ' + money(atc) + '. What is its profit? (Enter a negative number for a loss.)', dollars(prof),
      ['Profit per unit is price minus <b>average</b> total cost: $' + money(pr) + ' - ' + money(atc) + ' = ' + money(pr - atc) + '$.', 'Profit: $' + money(pr - atc) + ' \\times ' + q + ' = ' + money(prof) + '$.', 'Marginal cost is not used: it equals the price at this output, so $P - MC$ would always be zero.'],
      'Profit = (P − ATC) × q.', 'dollars', { kind: 'calc', P: pr, atc: atc, q: q });
  });

  G('micro.shutdown-rule', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['decide', 'compare']) : R.pick(['decide', 'compare', 'price', 'loss']);
    if (shape === 'decide') {
      var avc = R.int(6, 20), atc = avc + R.int(3, 10), zone = R.int(0, 2), pr = zone === 0 ? atc + R.int(1, 5) : zone === 1 ? R.int(avc + 1, atc - 1) : R.int(M.max(1, avc - 5), avc - 1);
      var ch = ['Produce, earning an economic profit', 'Keep producing in the short run, at a loss', 'Shut down in the short run'];
      return P('A competitive firm’s minimum average variable cost is ' + money(avc) + ' and its minimum average total cost is ' + money(atc) + '. The market price is ' + money(pr) + '. What should it do in the short run?', keep(ch, zone),
        [zone === 0 ? 'The price is above minimum ATC, so it can earn a profit.' : zone === 1 ? 'The price is below minimum ATC (a loss) but above minimum AVC: revenue covers the variable costs and helps pay the fixed costs.' : 'The price is below minimum AVC: every unit loses money on top of the fixed costs.', '<b>' + ch[zone] + '</b>.'],
        'Compare the price with minimum AVC (shutdown) and minimum ATC (break-even).', null, { kind: 'decide', avc: avc, atc: atc, P: pr });
    }
    if (shape === 'price') {
      var ct = costTable(R), avcs = ct.tc.slice(1).map(function (v, i) { return Q(v - ct.F, i + 1); }), mn = avcs.reduce(function (a, b) { return b.lt(a) ? b : a; });
      return P('A firm’s short-run total cost is shown.' + htmlTable(['Quantity', 'Total cost'], ct.tc.map(function (v, i) { return [i, money(v)]; })) + 'Below what price should it shut down in the short run? (Round to the nearest cent if needed.)', mAns(mn),
        ['The shutdown price is the minimum of AVC. Fixed cost is ' + money(ct.F) + '.', 'AVC = (TC − FC) ÷ q: ' + avcs.map(function (a) { return money(+a.toDec(2)); }).join(', ') + '.', 'The minimum is $' + mTex(mn) + '$' + (mn.isTerminating() ? '.' : ', about ' + money(+mn.toDec(2)) + '.')], 'Find average variable cost at each quantity.', 'dollars', { kind: 'price', tc: ct.tc });
    }
    var F = R.int(5, 30) * 10, vc = R.int(10, 60) * 10, tr = vc + R.pick([-1, 1]) * R.int(1, M.floor(F / 10) - 1) * 10;
    var lossP = tr - vc - F, lossS = -F;
    if (shape === 'loss') return P('A firm has fixed costs of ' + money(F) + '. At its best output it would earn ' + money(tr) + ' in revenue and pay ' + money(vc) + ' in variable costs. What is its profit if it produces? (Enter a negative number for a loss.)', dollars(lossP),
      ['Profit $= TR - VC - FC = ' + money(tr) + ' - ' + money(vc) + ' - ' + money(F) + ' = ' + money(lossP) + '$.', 'If it shut down instead, it would lose its fixed cost, ' + money(F) + '.'], 'Subtract variable and fixed costs.', 'dollars', { kind: 'loss', F: F, vc: vc, tr: tr });
    var ch2 = ['Produce: the loss is smaller than its fixed cost', 'Shut down: the loss from producing is bigger than its fixed cost'], v2 = lossP > lossS ? 0 : 1;
    return P('A firm has fixed costs of ' + money(F) + '. At its best output it would earn ' + money(tr) + ' in revenue and pay ' + money(vc) + ' in variable costs. In the short run, should it produce or shut down?', keep(ch2, v2),
      ['If it produces: $' + money(tr) + ' - ' + money(vc) + ' - ' + money(F) + ' = ' + money(lossP) + '$.', 'If it shuts down: it still pays ' + money(F) + ', so profit is ' + money(lossS) + '.', v2 === 0 ? 'Revenue covers variable cost, so producing loses less: <b>produce</b>.' : 'Revenue does not even cover variable cost, so producing loses more: <b>shut down</b>.'],
      'Does revenue cover the variable costs?', null, { kind: 'compare', F: F, vc: vc, tr: tr });
  });

  G('micro.long-run-competition', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['price', 'seq']) : R.pick(['price', 'firms', 'firms', 'seq', 'tf']);
    var minAtc = R.int(8, 30), qf = R.pick([10, 20, 25, 50, 100]), b = R.pick([10, 20, 25, 50]), n = R.int(20, 200);
    if (shape === 'price') return P('In a perfectly competitive industry, every firm has the same costs, and average total cost is lowest at ' + qf + ' units, where it equals ' + money(minAtc) + '. What is the market price in long-run equilibrium?', dollars(minAtc),
      ['Entry and exit continue until each firm earns zero economic profit.', 'That happens when the price equals the lowest ATC: <b>' + money(minAtc) + '</b>, with each firm making ' + qf + ' units.'], 'Where does entry and exit stop?', 'dollars', { kind: 'price', minAtc: minAtc });
    if (shape === 'firms') {
      var a = n * qf + b * minAtc;
      return P('In a perfectly competitive industry, each firm’s average total cost is lowest at ' + qf + ' units, where it equals ' + money(minAtc) + '. Market demand is $' + qdTex(a, b) + '$. How many firms are there in long-run equilibrium?', exact(n),
        ['Long run: $P = \\min ATC = ' + money(minAtc) + '$.', 'Market quantity: $Q_d = ' + a + ' - ' + b + '(' + minAtc + ') = ' + (n * qf) + '$.', 'Each firm makes ' + qf + ' units, so there are $' + (n * qf) + ' \\div ' + qf + ' = ' + n + '$ firms.'], 'Find the long-run price, the market quantity, then divide by one firm’s output.', 'firms', { kind: 'firms', a: a, b: b, minAtc: minAtc, qf: qf });
    }
    if (shape === 'seq') {
      var prof = R.coin(), ch = prof ? ['Firms enter, market supply shifts right, and the price falls toward minimum ATC', 'Firms exit, market supply shifts left, and the price rises', 'Each firm’s cost curves shift up until profit is zero', 'Market demand shifts left until profit is zero'] : ['Firms exit, market supply shifts left, and the price rises toward minimum ATC', 'Firms enter, market supply shifts right, and the price falls', 'Each firm’s cost curves shift down until the loss disappears', 'Market demand shifts right until the loss disappears'];
      return P('Firms in a perfectly competitive industry are earning economic ' + (prof ? 'profits' : 'losses') + '. What happens in the long run?', shuf(ch, 0),
        [prof ? 'Profits mean this industry pays more than other uses of the same resources, so new firms come in.' : 'Losses mean the owners could do better elsewhere, so some firms leave.', 'Entry or exit shifts the <b>market</b> supply curve; the firms’ cost curves stay put. It continues until the price is back at minimum ATC.'],
        'Which curve moves when the number of firms changes?', null, { kind: 'seq', prof: prof });
    }
    var t = R.pick([
      { s: 'In long-run competitive equilibrium, firms earn zero economic profit, so their owners earn nothing.', v: false, why: 'Zero economic profit includes a normal return: owners earn what their resources would earn elsewhere.' },
      { s: 'When new firms enter a competitive industry, the market supply curve shifts right.', v: true, why: 'More firms offer more at every price.' },
      { s: 'When new firms enter, each existing firm’s cost curves shift down.', v: false, why: 'Entry changes the number of firms, not each firm’s costs.' },
      { s: 'In long-run equilibrium, the price equals the minimum of average total cost.', v: true, why: 'Entry and exit stop only when economic profit is zero at the best output.' }]);
    return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Entry and exit move the market, not the firm’s costs.', null, { kind: 'tf', s: t.s, v: t.v });
  });

  G('micro.efficiency', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['class', 'def']) : R.pick(['class', 'class', 'def', 'tf']);
    if (shape === 'def') {
      var al = R.coin(), ch = ['Price equals marginal cost', 'Production at the lowest average total cost', 'Price equals average total cost', 'Total revenue is as large as possible'];
      return P('Which condition describes <b>' + (al ? 'allocative' : 'productive') + '</b> efficiency?', keep(ch, al ? 0 : 1),
        [al ? 'Allocative efficiency: the value of the last unit to buyers (the price) equals its cost (MC), so the right amount is made.' : 'Productive efficiency: goods are made at the lowest possible cost per unit, the minimum of ATC.'], 'Allocative: the right amount. Productive: the cheapest way.', null, { kind: 'def', al: al });
    }
    if (shape === 'tf') {
      var t = R.pick([
        { s: 'An allocatively efficient outcome is always a fair one.', v: false, why: 'Efficiency is about the size of the total gain, not how it is shared.' },
        { s: 'In long-run equilibrium, a perfectly competitive firm is both allocatively and productively efficient.', v: true, why: 'It sets P = MC, and entry and exit push P to minimum ATC.' },
        { s: 'If price is above marginal cost, society would gain from producing more of the good.', v: true, why: 'Buyers value one more unit more than it costs to make.' },
        { s: 'Productive efficiency means price equals marginal cost.', v: false, why: 'That is allocative efficiency. Productive efficiency means producing at minimum ATC.' }]);
      return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Keep the two conditions apart.', null, { kind: 'tf', s: t.s, v: t.v });
    }
    var pr = R.int(10, 40), alloc = R.coin(), prod = R.coin(), mc = alloc ? pr : pr + R.pick([-4, -3, -2, 2, 3, 4]), minA = R.int(8, 35), atc = prod ? minA : minA + R.int(1, 5);
    var ch2 = ['Both allocatively and productively efficient', 'Allocatively efficient only', 'Productively efficient only', 'Neither'], v = alloc && prod ? 0 : alloc ? 1 : prod ? 2 : 3;
    return P('At a firm’s current output, the price is ' + money(pr) + ', marginal cost is ' + money(mc) + ' and average total cost is ' + money(atc) + '. The lowest possible average total cost is ' + money(minA) + '. Which describes the outcome?', keep(ch2, v),
      ['Allocative efficiency needs $P = MC$: ' + money(pr) + (alloc ? ' = ' : ' ≠ ') + money(mc) + '.', 'Productive efficiency needs ATC at its minimum: ' + money(atc) + (prod ? ' = ' : ' > ') + money(minA) + '.', '<b>' + ch2[v] + '</b>.'],
      'Check P against MC, then ATC against its minimum.', null, { kind: 'class', P: pr, mc: mc, atc: atc, minA: minA });
  });

  // =================================================================== Unit 9: Imperfect Competition
  var BARRIERS = ['Economies of scale', 'Legal protection (patents, copyrights, licenses)', 'Control of a key resource', 'Network effects'];
  var BARRIER_ITEMS = [
    { s: 'A drug company holds a patent on a new medicine.', v: 1 }, { s: 'An author holds the copyright on a best-selling novel.', v: 1 }, { s: 'A city grants one company the only license to run buses downtown.', v: 1 },
    { s: 'One set of water pipes can serve a whole town more cheaply than two competing sets.', v: 0 }, { s: 'A rail line between two cities would cost billions to duplicate, and one line can carry all the traffic.', v: 0, lv: 2 },
    { s: 'A firm owns the only known deposits of a rare mineral used in its product.', v: 2 }, { s: 'A company owns every spring that feeds the only source of a famous mineral water.', v: 2, lv: 2 },
    { s: 'Everyone uses the same messaging app because all their friends are on it.', v: 3 }, { s: 'A game console has the most games because it has the most players, and the most players because it has the most games.', v: 3, lv: 2 },
    { s: 'An online marketplace attracts the most sellers because it has the most buyers.', v: 3, lv: 3 }, { s: 'A power company spreads the huge cost of its plant over a whole region, so its average cost keeps falling as it serves more customers.', v: 0, lv: 2 }
  ];
  G('micro.monopoly-sources', function (R, ctx) {
    var L = ctx.level || 1;
    if (L >= 2 && R.chance(0.35)) {
      var t = R.pick([
        { s: 'Because a monopoly is the only seller, it can charge any price and still sell as much as it wants.', v: false, why: 'A monopoly faces the market demand curve: a higher price means buyers buy less.' },
        { s: 'Without barriers to entry, a monopoly’s profits would attract new competitors.', v: true, why: 'Profits invite entry unless something keeps rivals out.' },
        { s: 'A patent gives an inventor a temporary legal monopoly.', v: true, why: 'It bars others from making the invention for a limited period.' },
        { s: 'A natural monopoly happens when average cost keeps falling across the whole range of market demand.', v: true, why: 'Then one firm can serve the market more cheaply than two or more.' }]);
      return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'A monopoly is still limited by demand.', null, { kind: 'tf', s: t.s, v: t.v });
    }
    if (R.chance(0.5)) {
      var want = R.int(0, 3), picks = [0, 1, 2, 3].map(function (f) { return R.pick(BARRIER_ITEMS.filter(function (x) { return x.v === f && (x.lv || 1) <= L; })); });
      return P('Which of these monopolies is protected mainly by <b>' + BARRIERS[want].toLowerCase().replace(/ \(.*\)/, '') + '</b>?', mc(picks[want].s, picks.filter(function (x, i) { return i !== want; }).map(function (x) { return x.s; })),
        ['“' + picks[want].s + '” fits: ' + ['one firm serves the market at the lowest average cost.', 'the law keeps others out.', 'rivals can’t get a key input.', 'the product is worth more because so many others use it.'][want], 'The others: ' + picks.filter(function (x, i) { return i !== want; }).map(function (x) { return BARRIERS[x.v].toLowerCase().replace(/ \(.*\)/, ''); }).join('; ') + '.'],
        'Is it cost, the law, a scarce input, or the number of other users?', null, { kind: 'which', want: want, answer: picks[want].s, items: picks.map(function (x) { return [x.s, x.v]; }) });
    }
    var it = bank(R, ctx, BARRIER_ITEMS);
    return P('What barrier to entry protects this monopoly?<br>“' + it.s + '”', keep(BARRIERS.slice(), it.v),
      [['One firm can serve the market at a lower average cost than several could.', 'The law keeps others from copying or entering.', 'Rivals can’t get an input they would need.', 'The product is worth more because so many others use it.'][it.v], '<b>' + BARRIERS[it.v] + '</b>.'],
      'Is it cost, the law, a scarce input, or the number of other users?', null, { kind: 'barrier', s: it.s, v: it.v });
  });

  function demandSched(R) { var p0 = R.int(10, 20), s = R.pick([1, 1, 2]); return { p0: p0, s: s, P: function (q) { return p0 - s * q; } }; }
  G('micro.monopoly-marginal-revenue', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['table', 'table', 'why']) : R.pick(['table', 'linear', 'zero', 'why', 'linear']);
    if (shape === 'why') {
      var ch = ['To sell one more unit, it must lower the price on all the units it sells', 'Its marginal cost rises as it produces more', 'The government limits its price', 'Buyers pay less for later units because of diminishing marginal utility'];
      return P('Why is a single-price monopolist’s marginal revenue less than its price?', shuf(ch, 0), ['A monopolist faces downward-sloping demand. To sell one more unit it must cut the price, and the lower price applies to every unit, not just the extra one.', 'So MR = (price of the new unit) − (revenue lost on the earlier units), which is less than the price.'],
        'What happens to the price of the units it was already selling?', null, { kind: 'why' });
    }
    var d = demandSched(R);
    if (shape === 'table') {
      var n = 6, rows = []; for (var q = 1; q <= n; q++) rows.push([q, money(d.P(q))]);
      var k = R.int(2, M.min(n, M.floor((d.p0 - 1) / d.s))), tr = function (q) { return q * d.P(q); }, mr = tr(k) - tr(k - 1);
      return P('A monopolist faces the demand schedule below (it charges one price to all buyers).' + htmlTable(['Quantity', 'Price'], rows) + 'What is the marginal revenue of unit ' + k + '?', dollars(mr),
        ['$TR(' + k + ') = ' + k + ' \\times ' + money(d.P(k)) + ' = ' + money(tr(k)) + '$ and $TR(' + (k - 1) + ') = ' + (k - 1) + ' \\times ' + money(d.P(k - 1)) + ' = ' + money(tr(k - 1)) + '$.', '$MR = ' + money(tr(k)) + ' - ' + money(tr(k - 1)) + ' = ' + money(mr) + '$, less than the price of ' + money(d.P(k)) + ': the first ' + (k - 1) + ' units now sell for ' + money(d.s) + ' less each.'],
        'Find total revenue at both quantities and subtract.', 'dollars', { kind: 'table', p0: d.p0, s: d.s, k: k });
    }
    var bb = R.pick([0.5, 1, 2, 3]), aa = bb * R.int(8, 20), qmax = aa / bb;
    var dTex = 'P = ' + nx(aa) + ' - ' + (bb === 1 ? '' : nx(bb)) + 'Q';
    if (shape === 'zero') return P('A monopolist faces demand $' + dTex + '$. At what quantity is its marginal revenue zero?', exact(qmax / 2),
      ['$MR = ' + T.terms([[aa, ''], [-2 * bb, 'Q']]) + '$ (same intercept, twice the slope).', 'Set $MR = 0$: $Q = ' + nx(aa) + ' \\div ' + nx(2 * bb) + ' = ' + nx(qmax / 2) + '$, halfway to where demand meets the quantity axis (' + nx(qmax) + ').'], 'Write MR with twice the slope, then set it to zero.', 'units', { kind: 'zero', a: aa, b: bb });
    var qq0 = R.int(1, M.floor(qmax / 2) - 1);
    return P('A monopolist faces demand $' + dTex + '$. What is its marginal revenue at $Q = ' + qq0 + '$?', dollars(aa - 2 * bb * qq0),
      ['For linear demand $P = a - bQ$, $MR = a - 2bQ$: here $MR = ' + T.terms([[aa, ''], [-2 * bb, 'Q']]) + '$.', 'At $Q = ' + qq0 + '$: $MR = ' + nx(aa) + ' - ' + nx(2 * bb * qq0) + ' = ' + money(aa - 2 * bb * qq0) + '$, while the price is ' + money(aa - bb * qq0) + '.'],
      'Same intercept as demand, twice the slope.', 'dollars', { kind: 'linear', a: aa, b: bb, q: qq0 });
  });

  // a monopoly with linear demand P = p0 - sQ and MC = m0 + m1 Q, whole-number answers
  function monoSetup(R, opt) {
    for (var t = 0; t < 300; t++) {
      var s = R.pick([1, 1, 2, 0.5]), m1 = opt && opt.flat ? 0 : R.pick([0, 0, 1, 2]), m0 = R.int(2, 10), Qm = R.int(3, 12), p0 = m0 + (2 * s + m1) * Qm;
      if (!isInt(p0) || p0 > 60) continue;
      var Pm = p0 - s * Qm, Qc = (p0 - m0) / (s + m1), Pc = p0 - s * Qc;
      if (!isInt(Pm * 2) || !isInt(Qc * 2) || !isInt(Pc * 2)) continue;
      return { p0: p0, s: s, m0: m0, m1: m1, Qm: Qm, Pm: Pm, Qc: Qc, Pc: Pc };
    }
    return { p0: 20, s: 1, m0: 4, m1: 0, Qm: 8, Pm: 12, Qc: 16, Pc: 4 };
  }
  function monoIntro(m) { return 'A monopolist faces demand $P = ' + nx(m.p0) + ' - ' + (m.s === 1 ? '' : nx(m.s)) + 'Q$ and has marginal cost $MC = ' + (m.m1 ? T.terms([[m.m0, ''], [m.m1, 'Q']]) : nx(m.m0)) + '$ (dollars).'; }
  function monoSteps(m) { return ['$MR = ' + T.terms([[m.p0, ''], [-2 * m.s, 'Q']]) + '$.', 'Set $MR = MC$: $' + T.terms([[m.p0, ''], [-2 * m.s, 'Q']]) + ' = ' + (m.m1 ? T.terms([[m.m0, ''], [m.m1, 'Q']]) : nx(m.m0)) + '$, so $Q = ' + nx(m.Qm) + '$.', 'Price from the demand curve: $P = ' + nx(m.p0) + ' - ' + (m.s === 1 ? '' : nx(m.s) + ' \\times ') + nx(m.Qm) + ' = ' + money(m.Pm) + '$.']; }
  function monoViz(m, show) { return { name: 'ec-monopoly', opts: { demand: { p0: m.p0, s: m.s }, mc: { m0: m.m0, m1: m.m1 }, show: show || [], quiet: true, interactive: false } }; }
  G('micro.monopoly-price-output', function (R, ctx) {
    var L = ctx.level || 1, m = monoSetup(R, { flat: L === 1 }), shape = L === 1 ? R.pick(['q', 'p']) : R.pick(['q', 'p', 'profit', 'wrong', 'p']);
    var chk = { kind: shape, p0: m.p0, s: m.s, m0: m.m0, m1: m.m1 };
    if (shape === 'q') return P(monoIntro(m) + ' What quantity maximizes its profit?', exact(m.Qm), monoSteps(m).slice(0, 2), 'Set marginal revenue equal to marginal cost.', 'units', chk);
    if (shape === 'p') return P(monoIntro(m) + ' What price does it charge?', dollars(m.Pm), monoSteps(m).concat(['The price comes from the <b>demand</b> curve, not from MR or MC.']), 'Find the quantity with MR = MC, then go up to the demand curve.', 'dollars', chk);
    if (shape === 'wrong') {
      var mcq = m.m0 + m.m1 * m.Qm, ch = [money(m.Pm), money(mcq), money(m.p0 - m.s * m.Qc), money(m.p0)].filter(function (x, i, a) { return a.indexOf(x) === i; });
      return P(monoIntro(m) + ' Its profit-maximizing quantity is ' + nx(m.Qm) + ' units, where MR and MC both equal ' + money(mcq) + '. What price does it charge?', mc(ch[0], ch.slice(1)),
        ['Marginal revenue and marginal cost tell it <b>how many</b> to sell.', 'The price is what buyers will pay for that many: the height of the demand curve, $' + nx(m.p0) + ' - ' + (m.s === 1 ? '' : nx(m.s) + ' \\times ') + nx(m.Qm) + ' = ' + money(m.Pm) + '$.'], 'Go up to the demand curve.', null, { kind: 'wrong', p0: m.p0, s: m.s, m0: m.m0, m1: m.m1 });
    }
    var F = R.pick([0, 0, 10, 20, 30, 50]), vc = m.m0 * m.Qm + m.m1 * m.Qm * m.Qm / 2, prof = m.Pm * m.Qm - vc - F;
    chk.F = F;
    return P(monoIntro(m) + (F ? ' It also has a fixed cost of ' + money(F) + '.' : ' It has no fixed cost.') + ' What is its maximum profit?', mAns(Q.from(prof)),
      monoSteps(m).concat(['Total cost at ' + nx(m.Qm) + ' units: ' + (m.m1 ? 'variable cost is the area under MC, $' + nx(m.m0) + ' \\times ' + nx(m.Qm) + ' + \\tfrac{1}{2} \\times ' + nx(m.m1) + ' \\times ' + nx(m.Qm) + '^2 = ' + money(vc) + '$' : '$' + nx(m.m0) + ' \\times ' + nx(m.Qm) + ' = ' + money(vc) + '$') + (F ? ', plus ' + money(F) + ' fixed.' : '.'), 'Profit: $' + money(m.Pm * m.Qm) + ' - ' + money(vc + F) + ' = ' + money(prof) + '$.']),
      'Find Q and P first, then subtract total cost from total revenue.', 'dollars', chk);
  });

  G('micro.monopoly-inefficiency', function (R, ctx) {
    var L = ctx.level || 1, m = monoSetup(R, { flat: L < 3 }), shape = L === 1 ? R.pick(['qc', 'dwl']) : R.pick(['qc', 'dwl', 'dwl', 'cs', 'tf']);
    var mcAtQm = m.m0 + m.m1 * m.Qm, dwl = (m.Pm - mcAtQm) * (m.Qc - m.Qm) / 2, chk = { kind: shape, p0: m.p0, s: m.s, m0: m.m0, m1: m.m1 };
    var steps = monoSteps(m).concat(['A competitive market would produce where $P = MC$: $' + nx(m.p0) + ' - ' + (m.s === 1 ? '' : nx(m.s)) + 'Q = ' + (m.m1 ? T.terms([[m.m0, ''], [m.m1, 'Q']]) : nx(m.m0)) + '$, so $Q_c = ' + nx(m.Qc) + '$.']);
    if (shape === 'tf') {
      var t = R.pick([
        { s: 'The deadweight loss of monopoly equals the monopolist’s profit.', v: false, why: 'Most of the profit is surplus moved from consumers to the firm. The deadweight loss is the triangle of trades that never happen.' },
        { s: 'At the monopoly’s output, price is greater than marginal cost.', v: true, why: 'MR = MC and MR is below the price, so P > MC: buyers value one more unit more than it costs.' },
        { s: 'A monopoly produces more than a competitive market with the same costs would.', v: false, why: 'It produces less, stopping where MR = MC instead of P = MC.' }]);
      return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Transfers are not losses.', null, { kind: 'tf', s: t.s, v: t.v });
    }
    if (shape === 'qc') return P(monoIntro(m) + ' How many units would be traded if this market were perfectly competitive, with the same costs?', exact(m.Qc), steps.slice(3), 'Competitive output is where demand meets MC.', 'units', chk);
    if (shape === 'cs') {
      var csM = m.s * m.Qm * m.Qm / 2, csC = m.s * m.Qc * m.Qc / 2;
      return P(monoIntro(m) + ' How much smaller is consumer surplus under the monopoly than under perfect competition with the same costs?', mAns(Q.from(csC - csM)),
        steps.concat(['Competitive price: ' + money(m.Pc) + '. $CS_c = \\tfrac{1}{2} \\times ' + nx(m.Qc) + ' \\times (' + nx(m.p0) + ' - ' + nx(m.Pc) + ') = ' + money(csC) + '$.', 'Monopoly: $CS_m = \\tfrac{1}{2} \\times ' + nx(m.Qm) + ' \\times (' + nx(m.p0) + ' - ' + nx(m.Pm) + ') = ' + money(csM) + '$.', 'Difference: ' + money(csC - csM) + ', part to the monopoly as profit, part lost.']),
        'Compute consumer surplus both ways.', 'dollars', chk);
    }
    return P(monoIntro(m) + ' What is the deadweight loss from monopoly?', mAns(Q.from(dwl)),
      steps.concat(['At ' + nx(m.Qm) + ' units the price is ' + money(m.Pm) + ' and MC is ' + money(mcAtQm) + '.', '$DWL = \\tfrac{1}{2} \\times (' + nx(m.Pm) + ' - ' + nx(mcAtQm) + ') \\times (' + nx(m.Qc) + ' - ' + nx(m.Qm) + ') = ' + money(dwl) + '$.']),
      'The triangle between demand and MC, from the monopoly quantity to the competitive quantity.', 'dollars', chk);
  });

  G('micro.natural-monopoly', function (R, ctx) {
    var L = ctx.level || 1, r1 = R.int(2, 6), r2 = r1 + R.int(4, 12), m0 = R.int(2, 8), p0 = m0 + r1 + r2, F = r1 * r2;
    var shape = L === 1 ? R.pick(['mcq', 'mcloss']) : R.pick(['mcq', 'mcloss', 'atcp', 'atcq', 'unreg', 'why']);
    var intro = 'A utility faces demand $P = ' + p0 + ' - Q$, has a constant marginal cost of ' + money(m0) + ' and a fixed cost of ' + money(F) + '.';
    var chk = { kind: shape, p0: p0, m0: m0, F: F };
    if (shape === 'why') {
      var ch = ['With average cost falling, MC is below ATC, so a price equal to MC cannot cover average cost', 'At P = MC, the firm sells too little', 'A P = MC rule makes demand inelastic', 'At P = MC, marginal cost is above average total cost'];
      return P('Why does a natural monopoly lose money if regulators set its price equal to marginal cost?', shuf(ch, 0), ['In a natural monopoly ATC falls over the whole market, which means each extra unit costs less than the average: MC < ATC.', 'A price equal to MC is below ATC, so revenue does not cover total cost. With constant MC the loss is exactly the fixed cost.'],
        'Compare MC and ATC when average cost is falling.', null, chk);
    }
    if (shape === 'mcq') return P(intro + ' Regulators require $P = MC$. How many units does it sell?', exact(p0 - m0), ['$P = MC$: $' + p0 + ' - Q = ' + m0 + '$, so $Q = ' + (p0 - m0) + '$.'], 'Set the demand price equal to MC.', 'units', chk);
    if (shape === 'mcloss') return P(intro + ' Regulators require $P = MC$. What is its profit? (Enter a negative number for a loss.)', dollars(-F),
      ['$P = MC = ' + money(m0) + '$, so $Q = ' + (p0 - m0) + '$.', 'Revenue covers the marginal cost of every unit but nothing toward the fixed cost.', 'Profit: $' + money(m0 * (p0 - m0)) + ' - (' + money(m0 * (p0 - m0)) + ' + ' + money(F) + ') = -' + money(F) + '$.'], 'Revenue minus variable cost minus fixed cost.', 'dollars', chk);
    if (shape === 'unreg') { var qm = (p0 - m0) / 2; if (!isInt(qm * 2)) qm = M.round(qm); var pm = p0 - qm, pr = (pm - m0) * qm - F;
      return P(intro + ' If it is unregulated, what price does it charge?', dollars(pm), ['$MR = ' + p0 + ' - 2Q = ' + m0 + '$, so $Q = ' + nx(qm) + '$.', 'Price from demand: $' + p0 + ' - ' + nx(qm) + ' = ' + money(pm) + '$. (Its profit would be ' + money(pr) + '.)'], 'MR = MC, then the demand curve.', 'dollars', chk); }
    var steps = ['$ATC = \\dfrac{' + F + '}{Q} + ' + m0 + '$. Set the demand price equal to ATC: $' + p0 + ' - Q = \\dfrac{' + F + '}{Q} + ' + m0 + '$.', 'Multiply by $Q$: $Q^2 - ' + (r1 + r2) + 'Q + ' + F + ' = 0$, so $(Q - ' + r1 + ')(Q - ' + r2 + ') = 0$.', 'Regulators pick the larger root, $Q = ' + r2 + '$ (more output at a lower price): $P = ' + p0 + ' - ' + r2 + ' = ' + money(p0 - r2) + '$.', 'Check: $ATC = ' + F + ' / ' + r2 + ' + ' + m0 + ' = ' + nx(Q(F, r2).add(m0)) + '$, equal to the price.'];
    if (shape === 'atcq') return P(intro + ' Regulators require $P = ATC$ (average-cost pricing) and choose the larger output where that holds. How many units does it sell?', exact(r2), steps, 'Set demand equal to ATC and solve the quadratic.', 'units', chk);
    return P(intro + ' Regulators require $P = ATC$ (average-cost pricing) and choose the larger output where that holds. What price does it charge?', dollars(p0 - r2), steps, 'Set demand equal to ATC and solve the quadratic.', 'dollars', chk);
  });

  G('micro.price-discrimination', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['cond', 'group']) : R.pick(['group', 'group', 'perfect', 'cond', 'which', 'perfectQ']);
    if (shape === 'cond') {
      var ch = ['The seller can stop buyers from reselling to each other', 'The seller has no market power', 'Every buyer has the same willingness to pay', 'The good costs more to provide to some buyers'];
      return P('Which of these does a seller need in order to price discriminate?', shuf(ch, 0), ['Price discrimination needs market power, a way to sort buyers by willingness to pay, and a way to prevent resale.', 'Without blocking resale, low-price buyers would resell to high-price buyers. (Price gaps that reflect cost differences are not discrimination.)'], 'What would make the scheme fall apart?', null, { kind: 'cond' });
    }
    var mcv = R.int(1, 6);
    if (shape === 'group' || shape === 'which') {
      var A1 = mcv + 2 * R.int(3, 8), B1 = mcv + 2 * R.int(1, 3); if (A1 === B1) A1 += 2;
      var qa = (A1 - mcv) / 2, qb = (B1 - mcv) / 2, pa = A1 - qa, pb = B1 - qb, grp = R.pick([['adults', 'students'], ['business travelers', 'vacationers'], ['weekday customers', 'seniors']]);
      var intro = 'A seller with a constant marginal cost of ' + money(mcv) + ' can charge two groups different prices and prevent resale. Demand from ' + grp[0] + ' is $P = ' + A1 + ' - Q$; demand from ' + grp[1] + ' is $P = ' + B1 + ' - Q$.';
      if (shape === 'which') return P(intro + ' Which group pays the higher price?', keep([cap(grp[0]), cap(grp[1]), 'Both pay the same price'], 0),
        [cap(grp[0]) + ': $MR = ' + A1 + ' - 2Q = ' + mcv + '$, $Q = ' + nx(qa) + '$, $P = ' + money(pa) + '$.', cap(grp[1]) + ': $MR = ' + B1 + ' - 2Q = ' + mcv + '$, $Q = ' + nx(qb) + '$, $P = ' + money(pb) + '$.', cap(grp[0]) + ' pay more: at these prices their demand is less elastic.'],
        'Set MR = MC separately in each group.', null, { kind: 'which', A: A1, B: B1, mc: mcv });
      var askA = R.coin();
      return P(intro + ' What price do ' + (askA ? grp[0] : grp[1]) + ' pay?', dollars(askA ? pa : pb),
        ['Treat each group as its own market and set $MR = MC$ there.', askA ? cap(grp[0]) + ': $MR = ' + A1 + ' - 2Q = ' + mcv + '$, so $Q = ' + nx(qa) + '$ and $P = ' + A1 + ' - ' + nx(qa) + ' = ' + money(pa) + '$.' : cap(grp[1]) + ': $MR = ' + B1 + ' - 2Q = ' + mcv + '$, so $Q = ' + nx(qb) + '$ and $P = ' + B1 + ' - ' + nx(qb) + ' = ' + money(pb) + '$.'],
        'MR = MC in that group, then its demand curve for the price.', 'dollars', { kind: 'group', A: A1, B: B1, mc: mcv, askA: askA });
    }
    var p0 = mcv + R.int(6, 20), qc = p0 - mcv, prof = qc * qc / 2;
    if (shape === 'perfectQ') return P('A seller faces demand $P = ' + p0 + ' - Q$ with a constant marginal cost of ' + money(mcv) + '. It can charge each buyer exactly their willingness to pay (perfect price discrimination). How many units does it sell?', exact(qc),
      ['Each sale no longer lowers the price of other sales, so marginal revenue equals the price.', 'It sells until $P = MC$: $' + p0 + ' - Q = ' + mcv + '$, so $Q = ' + qc + '$, the competitive quantity.'], 'With perfect discrimination, MR follows the demand curve.', 'units', { kind: 'perfectQ', p0: p0, mc: mcv });
    return P('A seller faces demand $P = ' + p0 + ' - Q$ with a constant marginal cost of ' + money(mcv) + ' and no fixed cost. It can charge each buyer exactly their willingness to pay. What is its profit?', dollars(prof),
      ['It sells until $P = MC$: $Q = ' + qc + '$.', 'Each buyer pays their full willingness to pay, so profit is the whole area between demand and MC: $\\tfrac{1}{2} \\times ' + qc + ' \\times (' + p0 + ' - ' + mcv + ') = ' + money(prof) + '$.', 'Consumer surplus is zero, and so is the deadweight loss.'],
      'Profit is the triangle between demand and marginal cost.', 'dollars', { kind: 'perfect', p0: p0, mc: mcv });
  });

  G('micro.monopolistic-competition', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['lr', 'sr']) : R.pick(['lr', 'sr', 'sr', 'tf', 'entry']);
    if (shape === 'sr') {
      var mcv = R.int(2, 8), qv = R.int(3, 10), p0 = mcv + 2 * qv, pr = p0 - qv, atc = pr - R.pick([-2, -1, 1, 2, 3]), prof = (pr - atc) * qv;
      return P('A restaurant in a monopolistically competitive market faces demand $P = ' + p0 + ' - Q$ (Q in meals an hour) and has a constant marginal cost of ' + money(mcv) + '. At its profit-maximizing output, its average total cost is ' + money(atc) + '. What is its hourly profit? (Enter a negative number for a loss.)', dollars(prof),
        ['$MR = ' + p0 + ' - 2Q = ' + mcv + '$, so $Q = ' + qv + '$.', 'Price from demand: $' + p0 + ' - ' + qv + ' = ' + money(pr) + '$.', 'Profit: $(' + pr + ' - ' + atc + ') \\times ' + qv + ' = ' + money(prof) + '$.'], 'Like a monopoly in the short run: MR = MC, then the demand curve.', 'dollars', { kind: 'sr', p0: p0, mc: mcv, atc: atc });
    }
    if (shape === 'entry') {
      var ch2 = ['New firms enter, and each firm’s demand curve shifts left until profit is zero', 'Firms leave, and each firm’s demand curve shifts right', 'Each firm keeps its profit, because its product is different', 'The government sets the price equal to ATC'];
      return P('Firms in a monopolistically competitive market are earning economic profits. What happens in the long run?', shuf(ch2, 0), ['Entry is free, so profits attract new firms with similar products.', 'Each newcomer takes some customers: each firm’s demand shifts left until it just touches ATC, and economic profit is zero.'], 'Can new firms enter?', null, { kind: 'entry' });
    }
    if (shape === 'lr') {
      var ch = ['P = ATC and P > MC, with output below minimum ATC', 'P = MC = minimum ATC', 'P > ATC, with positive economic profit', 'P < ATC, with economic losses'];
      return P('Which describes a monopolistically competitive firm in long-run equilibrium?', shuf(ch, 0), ['Free entry drives economic profit to zero: $P = ATC$.', 'The firm still faces downward-sloping demand, so $P > MR = MC$, and the tangency with ATC is on its falling part: output is below the minimum of ATC (excess capacity).'], 'Zero profit, but demand still slopes down.', null, { kind: 'lr' });
    }
    var t = R.pick([
      { s: 'In the long run, monopolistically competitive firms earn economic profits because each sells a different product.', v: false, why: 'Free entry pulls each firm’s demand in until economic profit is zero.' },
      { s: 'A monopolistically competitive firm faces a downward-sloping demand curve.', v: true, why: 'Its product is a little different from rivals’, so it can raise its price a bit without losing every customer.' },
      { s: 'In long-run equilibrium, a monopolistically competitive firm produces at the minimum of its average total cost.', v: false, why: 'Its demand curve touches ATC on the falling part, so it produces less than that: excess capacity.' },
      { s: 'In long-run equilibrium, a monopolistically competitive firm’s price is above its marginal cost.', v: true, why: 'Demand slopes down, so P > MR = MC.' }]);
    return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Free entry, but differentiated products.', null, { kind: 'tf', s: t.s, v: t.v });
  });

  var GAME_SETS = [
    { players: ['Firm A', 'Firm B'], rows: ['High price', 'Low price'], cols: ['High price', 'Low price'] },
    { players: ['Firm A', 'Firm B'], rows: ['Advertise', 'Don’t advertise'], cols: ['Advertise', 'Don’t advertise'] },
    { players: ['Cafe A', 'Cafe B'], rows: ['Open early', 'Open late'], cols: ['Open early', 'Open late'] },
    { players: ['Airline A', 'Airline B'], rows: ['Add flights', 'Keep schedule'], cols: ['Add flights', 'Keep schedule'] },
    { players: ['Rosa', 'Sam'], rows: ['Up', 'Down'], cols: ['Left', 'Right'] }
  ];
  function randGame(R) { var g = [[[0, 0], [0, 0]], [[0, 0], [0, 0]]], vals; for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) g[i][j] = [R.int(0, 9), R.int(0, 9)]; return g; }
  function gameInfo(P2) { // independent of the kit: best responses by direct comparison (strict)
    var domR = P2[0][0][0] > P2[1][0][0] && P2[0][1][0] > P2[1][1][0] ? 0 : P2[1][0][0] > P2[0][0][0] && P2[1][1][0] > P2[0][1][0] ? 1 : -1;
    var domC = P2[0][0][1] > P2[0][1][1] && P2[1][0][1] > P2[1][1][1] ? 0 : P2[0][1][1] > P2[0][0][1] && P2[1][1][1] > P2[1][0][1] ? 1 : -1;
    var ne = []; for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) if (P2[i][j][0] >= P2[1 - i][j][0] && P2[i][j][1] >= P2[i][1 - j][1]) ne.push([i, j]);
    return { domR: domR, domC: domC, ne: ne };
  }
  function noTies(P2) { for (var j = 0; j < 2; j++) if (P2[0][j][0] === P2[1][j][0]) return false; for (var i = 0; i < 2; i++) if (P2[i][0][1] === P2[i][1][1]) return false; return true; }
  function cellText(gs, i, j) { return '(' + gs.rows[i] + ', ' + gs.cols[j] + ')'; }
  G('micro.dominant-strategies', function (R, ctx) {
    var L = ctx.level || 1, gs = R.pick(GAME_SETS), P2, info, rowSide = L === 1 ? true : R.coin(), want = R.pick(['dom', 'dom', 'none']), tries = 0;
    do { P2 = randGame(R); info = gameInfo(P2); tries++; } while ((!noTies(P2) || ((rowSide ? info.domR : info.domC) >= 0) !== (want === 'dom')) && tries < 500);
    var who = rowSide ? 0 : 1, dom = rowSide ? info.domR : info.domC, opts = rowSide ? gs.rows : gs.cols, otherOpts = rowSide ? gs.cols : gs.rows;
    var ch = opts.slice().concat(['Neither: ' + gs.players[who] + ' has no dominant strategy']), v = dom >= 0 ? dom : 2;
    var steps = otherOpts.map(function (o2, k) {
      var a = rowSide ? P2[0][k][0] : P2[k][0][1], b = rowSide ? P2[1][k][0] : P2[k][1][1];
      return 'If ' + gs.players[1 - who] + ' plays ' + o2 + ': ' + gs.players[who] + ' gets ' + a + ' from ' + opts[0] + ' and ' + b + ' from ' + opts[1] + ', so ' + (a > b ? opts[0] : opts[1]) + ' is better.';
    });
    return P(gs.players[0] + ' chooses a row and ' + gs.players[1] + ' a column. Each cell shows (' + gs.players[0] + '’s payoff, ' + gs.players[1] + '’s payoff). Does <b>' + gs.players[who] + '</b> have a dominant strategy? If so, which?', keep(ch, v),
      steps.concat([dom >= 0 ? 'The same choice wins both times: <b>' + opts[dom] + '</b> is dominant for ' + gs.players[who] + '.' : 'The best choice depends on what ' + gs.players[1 - who] + ' does: <b>no dominant strategy</b>.']),
      'Compare only ' + gs.players[who] + '’s own payoffs, one choice of the other player at a time.', null, { kind: 'dom', P: P2, row: rowSide },
      { name: 'ec-payoff', opts: { players: gs.players, rows: gs.rows, cols: gs.cols, payoffs: P2, quiet: true, interactive: false, underline: false } });
  });

  G('micro.nash-equilibrium', function (R, ctx) {
    var L = ctx.level || 1, gs = R.pick(GAME_SETS), P2, info, want = L === 1 ? 1 : R.pick([1, 1, 2, 0]), tries = 0;
    do { P2 = randGame(R); info = gameInfo(P2); tries++; } while ((!noTies(P2) || info.ne.length !== want) && tries < 800);
    var brSteps = [0, 1].map(function (j) { var b = P2[0][j][0] > P2[1][j][0] ? 0 : 1; return 'If ' + gs.players[1] + ' plays ' + gs.cols[j] + ', ' + gs.players[0] + '’s best response is ' + gs.rows[b] + ' (' + P2[b][j][0] + ' > ' + P2[1 - b][j][0] + ').'; })
      .concat([0, 1].map(function (i) { var b = P2[i][0][1] > P2[i][1][1] ? 0 : 1; return 'If ' + gs.players[0] + ' plays ' + gs.rows[i] + ', ' + gs.players[1] + '’s best response is ' + gs.cols[b] + ' (' + P2[i][b][1] + ' > ' + P2[i][1 - b][1] + ').'; }));
    var viz = { name: 'ec-payoff', opts: { players: gs.players, rows: gs.rows, cols: gs.cols, payoffs: P2, quiet: true, interactive: false, underline: false } };
    var intro = gs.players[0] + ' chooses a row and ' + gs.players[1] + ' a column. Each cell shows (' + gs.players[0] + '’s payoff, ' + gs.players[1] + '’s payoff).';
    if (want === 2 || (L === 3 && R.chance(0.3))) return P(intro + ' How many Nash equilibria (in pure strategies) does this game have?', exact(info.ne.length),
      brSteps.concat(['Cells where both players are playing a best response: ' + (info.ne.length ? info.ne.map(function (c) { return cellText(gs, c[0], c[1]); }).join(' and ') : 'none') + '. That makes <b>' + info.ne.length + '</b>.']),
      'Mark each player’s best responses; count the cells with both marked.', null, { kind: 'count', P: P2 }, viz);
    var cells = [[0, 0], [0, 1], [1, 0], [1, 1]], ch = cells.map(function (c) { return cellText(gs, c[0], c[1]); }).concat(['There is no Nash equilibrium in pure strategies']);
    var v = info.ne.length === 1 ? info.ne[0][0] * 2 + info.ne[0][1] : 4;
    return P(intro + ' Which outcome is a Nash equilibrium?', keep(ch, v),
      brSteps.concat([info.ne.length ? 'Only ' + cellText(gs, info.ne[0][0], info.ne[0][1]) + ' has both players at a best response: neither can do better by switching alone.' : 'No cell has both players at a best response: in every cell, someone wants to switch.']),
      'Mark each player’s best response to each choice of the other; look for a cell with both marked.', null, { kind: 'which', P: P2 }, viz);
  });

  // =================================================================== Unit 10: Factor Markets
  var FIRMS_L = [['bakery', 'loaves', 'loaf'], ['car wash', 'washes', 'wash'], ['print shop', 'posters', 'poster'], ['farm', 'crates of berries', 'crate'], ['furniture shop', 'chairs', 'chair']];
  function mrpSetup(R) {
    for (var t = 0; t < 300; t++) {
      var mp = prodTable(R, false).slice(0, 6), pr = R.pick([2, 3, 4, 5, 6, 8, 10]), mrp = mp.map(function (v) { return v * pr; });
      var w = R.int(2, 12) * 5; if (mrp.indexOf(w) >= 0) continue;
      var hired = 0; for (var i = 0; i < mrp.length; i++) { if (mrp[i] >= w) hired = i + 1; else if (i >= 1 && mrp[i] < w) break; }
      // the firm hires through the last worker (past the rising part) whose MRP covers the wage
      var last = 0; mrp.forEach(function (v, i) { if (v >= w) last = i + 1; });
      if (last < 2 || last > 5 || hired !== last || mrp.slice(0, last).some(function (v) { return v < w; })) continue;
      return { mp: mp, tp: cumsum(mp), P: pr, mrp: mrp, w: w, hire: last };
    }
    return { mp: [10, 14, 12, 8, 4, 2], tp: [10, 24, 36, 44, 48, 50], P: 5, mrp: [50, 70, 60, 40, 20, 10], w: 30, hire: 4 };
  }
  G('micro.marginal-revenue-product', function (R, ctx) {
    var L = ctx.level || 1, f = R.pick(FIRMS_L), s = mrpSetup(R), shape = L === 1 ? R.pick(['mrp', 'hire']) : R.pick(['mrp', 'hire', 'hire', 'wage', 'tf']);
    var tbl = htmlTable(['Workers', 'Total product (' + f[1] + ' a day)'], [[0, 0]].concat(s.tp.map(function (v, i) { return [i + 1, v]; })));
    var intro = 'A ' + f[0] + ' sells in a competitive market at ' + money(s.P) + ' per ' + f[2] + ' and hires workers in a competitive labor market.' + tbl;
    var mrpLine = 'MRP = MP × price: ' + s.mrp.map(function (v) { return money(v); }).join(', ') + '.', chk = { kind: shape, tp: s.tp, P: s.P, w: s.w };
    if (shape === 'mrp') { var k = R.int(2, 6); chk.k = k; return P(intro + 'What is the marginal revenue product of worker ' + k + '?', dollars(s.mrp[k - 1]), ['$MP = ' + s.tp[k - 1] + ' - ' + s.tp[k - 2] + ' = ' + s.mp[k - 1] + '$ ' + f[1] + '.', '$MRP = ' + s.mp[k - 1] + ' \\times ' + money(s.P) + ' = ' + money(s.mrp[k - 1]) + '$.'], 'Marginal product times the price of the output.', 'dollars', chk); }
    if (shape === 'tf') {
      var t = R.pick([
        { s: 'A firm should hire another worker whenever that worker’s marginal product is greater than the wage.', v: false, why: 'Marginal product is in units of output and the wage is in dollars. Compare the wage with MRP, marginal product times price.' },
        { s: 'A firm’s demand for labor is derived from the demand for the product the workers make.', v: true, why: 'MRP depends on the product’s price, which depends on demand for the product.' },
        { s: 'When the wage rises, a firm’s labor demand curve shifts left.', v: false, why: 'A wage change is a movement along the labor demand (MRP) curve: the firm hires fewer workers on the same curve.' }]);
      return P('True or false: ' + t.s, tf(t.v), [t.why, 'So the statement is <b>' + (t.v ? 'true' : 'false') + '</b>.'], 'Compare dollars with dollars.', null, { kind: 'tf', s: t.s, v: t.v });
    }
    if (shape === 'wage') {
      var k2 = R.int(2, 5); chk.k = k2;
      return P(intro + 'What is the highest daily wage at which the ' + f[0] + ' would still hire ' + k2 + ' workers?', dollars(s.mrp[k2 - 1]), [mrpLine, 'The ' + U.ordinal(k2) + ' worker is hired only if the wage is at most that worker’s MRP: <b>' + money(s.mrp[k2 - 1]) + '</b>.'], 'The last worker hired must cover the wage.', 'dollars', chk);
    }
    return P(intro + 'The wage is ' + money(s.w) + ' a day. How many workers should it hire?', exact(s.hire), [mrpLine, 'Hire every worker whose MRP is at least the wage of ' + money(s.w) + ': workers 1 to ' + s.hire + '. Worker ' + (s.hire + 1) + ' brings in only ' + money(s.mrp[s.hire]) + '.'], 'Compare each worker’s MRP (in dollars) with the wage.', 'workers', chk);
  });

  var LAB_JOBS = [['bakers', 'bread', 'bakeries', 'cooks in restaurants', 'ovens'], ['nurses', 'hospital care', 'hospitals', 'medical lab technicians', 'patient-monitoring systems'],
    ['programmers', 'software', 'software firms', 'data analysts', 'computers'], ['truck drivers', 'shipping', 'trucking firms', 'delivery van drivers', 'trucks'], ['carpenters', 'new houses', 'builders', 'electricians', 'power tools']];
  var LAB_EV = [
    { s: 'The price of {P} rises.', c: 'D', dir: 1 }, { s: 'Better {T} make each of the {W} more productive.', c: 'D', dir: 1, lv: 2 },
    { s: 'Demand for {P} falls.', c: 'D', dir: -1 }, { s: 'A machine that can do the {W}’ work gets much cheaper.', c: 'D', dir: -1, lv: 2 },
    { s: 'Many people move to the region looking for jobs as {W}.', c: 'S', dir: 1 }, { s: 'Pay for {O}, a similar job, rises sharply.', c: 'S', dir: -1, lv: 2 },
    { s: 'A new law requires {W} to complete a two-year license.', c: 'S', dir: -1, lv: 2 }, { s: '{E} start offering paid vacations and better hours, making the job more attractive.', c: 'S', dir: 1, lv: 3 },
    { s: 'The price of {P} falls.', c: 'D', dir: -1 }, { s: 'Pay for {O}, a similar job, falls.', c: 'S', dir: 1, lv: 3 }
  ];
  var WL_CH = ['The wage rises and employment rises', 'The wage rises and employment falls', 'The wage falls and employment rises', 'The wage falls and employment falls'];
  G('micro.factor-market-shifts', function (R, ctx) {
    var L = ctx.level || 1, ev = bank(R, ctx, LAB_EV), jb = R.pick(LAB_JOBS), shape = L === 1 ? 'curve' : R.pick(['curve', 'outcome', 'outcome', 'move']);
    var es = ev.s.replace(/\{W\}/g, jb[0]).replace(/\{P\}/g, jb[1]).replace(/\{E\}/g, cap(jb[2])).replace(/\{O\}/g, jb[3]).replace(/\{T\}/g, jb[4]);
    if (shape === 'move') {
      var ch0 = ['A movement along the labor demand curve', 'A shift of the labor demand curve to the left', 'A shift of the labor demand curve to the right', 'A shift of the labor supply curve'];
      return P('A minimum wage law raises the wage ' + jb[2] + ' must pay. They respond by hiring fewer ' + jb[0] + '. On their labor demand curve, this is…', shuf(ch0, 0), ['The wage is the price on the vertical axis of the labor market.', 'A change in the wage moves firms <b>along</b> their labor demand (MRP) curve; nothing that shifts MRP has changed.'], 'Is the wage itself the thing that changed?', null, { kind: 'move' });
    }
    var ch = ['Labor demand shifts right', 'Labor demand shifts left', 'Labor supply shifts right', 'Labor supply shifts left'], v = (ev.c === 'D' ? 0 : 2) + (ev.dir > 0 ? 0 : 1);
    var why = ev.c === 'D' ? 'This changes the marginal revenue product of ' + jb[0] + ' (MP × price), so it shifts labor <b>demand</b> ' + (ev.dir > 0 ? 'right' : 'left') + '.' : 'This changes how many people want to work as ' + jb[0] + ' at each wage, so it shifts labor <b>supply</b> ' + (ev.dir > 0 ? 'right' : 'left') + '.';
    if (shape === 'curve') return P('In the labor market for ' + jb[0] + ': ' + es + ' Which curve shifts, and which way?', keep(ch, v), [why], 'Does it change what a worker is worth to the employer, or how many people want the job?', null, { kind: 'curve', c: ev.c, dir: ev.dir, s: ev.s });
    var w = ev.c === 'D' ? (ev.dir > 0 ? 0 : 3) : (ev.dir > 0 ? 2 : 1);
    return P('In the labor market for ' + jb[0] + ': ' + es + ' What happens to their wage and employment?', keep(WL_CH.slice(), w), [why, ev.c === 'D' ? (ev.dir > 0 ? 'Demand up: wage and employment both rise.' : 'Demand down: wage and employment both fall.') : (ev.dir > 0 ? 'Supply up: the wage falls and employment rises.' : 'Supply down: the wage rises and employment falls.')], 'Which curve shifts? Then read the new crossing.', null, { kind: 'outcome', c: ev.c, dir: ev.dir, s: ev.s });
  });

  // least-cost: MP ladders for labor and capital with prices; a unique cheapest way to spend a budget (greedy = brute force)
  function lcSetup(R) {
    for (var t = 0; t < 400; t++) {
      var w = R.pick([10, 15, 20, 25]), r = R.pick([20, 30, 40, 50]); if (w === r) continue;
      var xs = R.int(2, 4), ks = R.int(2, 4), v = R.pick([1, 2, 3]);
      var rl = ladder(R, xs, v + 4), rk = ladder(R, ks, v + 4); // MP per dollar ladders (scaled), common value at the optimum
      var MPL = rl.map(function (x) { return x * w / 5; }), MPK = rk.map(function (x) { return x * r / 5; });
      if (MPL.some(function (x) { return !isInt(x); }) || MPK.some(function (x) { return !isInt(x); })) continue;
      var B = w * xs + r * ks, TPL = [0].concat(cumsum(MPL)), TPK = [0].concat(cumsum(MPK)), best = null, bv = -1, ties = 0;
      for (var a = 0; a <= 6; a++) for (var b = 0; b <= 6; b++) if (w * a + r * b <= B) { var out = TPL[a] + TPK[b]; if (out > bv) { bv = out; best = [a, b]; ties = 0; } else if (out === bv) ties++; }
      if (best[0] === xs && best[1] === ks && !ties) return { w: w, r: r, MPL: MPL, MPK: MPK, B: B, L: xs, K: ks };
    }
    return null;
  }
  G('micro.least-cost-rule', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['which', 'ratio']) : R.pick(['which', 'ratio', 'mix', 'mix', 'profit']);
    if (shape === 'which' || shape === 'ratio') {
      var w = R.pick([10, 12, 15, 20, 25, 30]), r = R.pick([20, 30, 40, 50, 60, 80]), mpl, mpk, tries = 0;
      do { mpl = R.int(2, 12) * 5; mpk = R.int(2, 16) * 5; tries++; } while (mpl * r === mpk * w && tries < 50);
      var rl = Q(mpl, w), rk = Q(mpk, r), moreL = rl.gt(rk);
      if (shape === 'ratio') { var isL = R.coin(); return P('A worker costs ' + money(w) + ' a day and a machine rents for ' + money(r) + ' a day. The last worker hired adds ' + mpl + ' units a day, and the last machine adds ' + mpk + ' units. What is the marginal product per dollar of ' + (isL ? 'labor' : 'capital') + '?', exact(isL ? rl : rk),
        ['$' + (isL ? dfr(mpl, w) : dfr(mpk, r)) + ' = ' + nx(isL ? rl : rk) + '$ units per dollar.'], 'Marginal product divided by the input’s price.', 'units per dollar', { kind: 'ratio', mpl: mpl, w: w, mpk: mpk, r: r, isL: isL }); }
      var ch = ['Use more labor and less capital', 'Use more capital and less labor', 'Keep the same mix: it is already the least-cost mix', 'Use more of whichever input has the larger marginal product'];
      return P('A worker costs ' + money(w) + ' a day and a machine rents for ' + money(r) + ' a day. The last worker hired adds ' + mpl + ' units a day, and the last machine adds ' + mpk + ' units. To make the same output at lower cost, what should the firm do?', keep(ch, moreL ? 0 : 1),
        ['Labor: $' + dfr(mpl, w) + ' = ' + nx(rl) + '$ units per dollar. Capital: $' + dfr(mpk, r) + ' = ' + nx(rk) + '$ units per dollar.', 'A dollar does more on ' + (moreL ? 'labor' : 'capital') + ', so shift spending toward it: <b>' + ch[moreL ? 0 : 1].toLowerCase() + '</b>' + ((moreL ? mpl < mpk : mpk < mpl) ? ', even though its marginal product alone is smaller.' : '.')],
        'Compare marginal product per dollar, not marginal product alone.', null, { kind: 'which', mpl: mpl, w: w, mpk: mpk, r: r });
    }
    if (shape === 'profit') {
      var pr = R.pick([2, 3, 4, 5]), w2 = R.pick([10, 12, 15, 20, 24, 30]), r2 = R.pick([20, 30, 40, 60]), okL = R.coin(), okK = okL ? R.coin() : true;
      var mpl2 = okL ? w2 / pr : w2 / pr + R.pick([-2, 2]), mpk2 = okK ? r2 / pr : r2 / pr + R.pick([-3, 3]);
      if (!isInt(mpl2) || !isInt(mpk2) || mpl2 <= 0 || mpk2 <= 0) { mpl2 = w2 / pr; mpk2 = r2 / pr; okL = okK = true; if (!isInt(mpl2) || !isInt(mpk2)) { pr = 2; w2 = 20; r2 = 40; mpl2 = 10; mpk2 = 20; } }
      var both = mpl2 * pr === w2 && mpk2 * pr === r2, lc = mpl2 * r2 === mpk2 * w2, ch2 = ['Least-cost mix and maximizing profit', 'Least-cost mix, but not maximizing profit', 'Not the least-cost mix'], v2 = both ? 0 : lc ? 1 : 2;
      return P('A firm sells its output at ' + money(pr) + ' a unit. The last worker adds ' + mpl2 + ' units and costs ' + money(w2) + '; the last machine adds ' + mpk2 + ' units and costs ' + money(r2) + '. Which describes the firm?', keep(ch2, v2),
        ['Least-cost test: $' + dfr(mpl2, w2) + '$ vs $' + dfr(mpk2, r2) + '$: ' + (lc ? 'equal.' : 'not equal.'), 'Profit test: $MRP_L = ' + mpl2 + ' \\times ' + pr + ' = ' + money(mpl2 * pr) + '$ vs $w = ' + money(w2) + '$; $MRP_K = ' + mpk2 + ' \\times ' + pr + ' = ' + money(mpk2 * pr) + '$ vs $r = ' + money(r2) + '$.', '<b>' + ch2[v2] + '</b>.'],
        'Least cost needs equal MP per dollar; profit needs each MRP equal to its price.', null, { kind: 'profit', P: pr, mpl: mpl2, w: w2, mpk: mpk2, r: r2 });
    }
    var s = lcSetup(R); if (!s) s = { w: 10, r: 20, MPL: [40, 30, 20, 10, 8, 6], MPK: [80, 60, 40, 20, 16, 12], B: 70, L: 3, K: 2 };
    var tbl = htmlTable(['Units', 'MP of workers (' + money(s.w) + ' each)', 'MP of machines (' + money(s.r) + ' each)'], s.MPL.map(function (m, i) { return [i + 1, m, s.MPK[i]]; }));
    var askL = R.coin();
    return P('A firm has ' + money(s.B) + ' a day to spend on workers and machines. The table shows the marginal product of each one.' + tbl + 'To make the most output with that budget, how many ' + (askL ? 'workers' : 'machines') + ' should it use?', exact(askL ? s.L : s.K),
      ['MP per dollar: workers ' + s.MPL.map(function (m) { return dn(Q(m, s.w)); }).join(', ') + '; machines ' + s.MPK.map(function (m) { return dn(Q(m, s.r)); }).join(', ') + '.', 'Spend each next dollar where it adds more output, until the budget is gone: ' + s.L + ' workers and ' + s.K + ' machines, costing $' + s.L + '(' + money(s.w) + ') + ' + s.K + '(' + money(s.r) + ') = ' + money(s.B) + '$.', 'There both inputs add ' + dn(Q(s.MPL[s.L - 1], s.w)) + ' units per dollar at the margin.'],
      'Divide each MP by its price, then buy the best value first.', askL ? 'workers' : 'machines', { kind: 'mix', w: s.w, r: s.r, MPL: s.MPL, MPK: s.MPK, B: s.B, askL: askL });
  });

  G('micro.monopsony', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['L', 'w']) : R.pick(['L', 'w', 'comp', 'mfc', 'wrong', 'minw']);
    if (shape === 'mfc') {
      var n = R.int(3, 9), w0 = R.int(10, 18), dw = R.pick([1, 2]), c0 = n * w0, c1 = (n + 1) * (w0 + dw);
      return P('An employer that is the only buyer of labor in town can hire ' + n + ' workers at ' + money(w0) + ' an hour, or ' + (n + 1) + ' workers at ' + money(w0 + dw) + ' an hour (it must pay everyone the same wage). What is the marginal factor cost of worker ' + (n + 1) + '?', dollars(c1 - c0),
        ['Labor cost with ' + n + ' workers: $' + n + ' \\times ' + money(w0) + ' = ' + money(c0) + '$. With ' + (n + 1) + ': $' + (n + 1) + ' \\times ' + money(w0 + dw) + ' = ' + money(c1) + '$.', '$MFC = ' + money(c1) + ' - ' + money(c0) + ' = ' + money(c1 - c0) + '$, more than the ' + money(w0 + dw) + ' wage: everyone’s pay went up.'], 'Total labor cost with one more worker, minus total labor cost before.', 'dollars', { kind: 'mfc', n: n, w0: w0, dw: dw });
    }
    // linear model with whole-number answers: supply w = a + sL, MRP = b - mL
    var s, m, a0, b0, Lm, tries = 0;
    do { s = R.pick([1, 0.5, 2]); m = R.pick([1, 0.5, 2]); Lm = R.int(4, 16); a0 = R.int(4, 12); b0 = a0 + (2 * s + m) * Lm; tries++; } while ((!isInt(b0) || !isInt(a0 + s * Lm) || !isInt((b0 - a0) / (s + m) * 2)) && tries < 100);
    var wm = a0 + s * Lm, Lc = (b0 - a0) / (s + m), wc = a0 + s * Lc;
    var intro = 'A monopsony employer faces labor supply $w = ' + T.terms([[a0, ''], [s, 'L']]) + '$ (dollars an hour), and workers’ marginal revenue product is $MRP = ' + T.terms([[b0, ''], [-m, 'L']]) + '$.';
    var steps = ['$MFC = ' + T.terms([[a0, ''], [2 * s, 'L']]) + '$ (twice the slope of supply).', 'Hire where $MRP = MFC$: $' + T.terms([[b0, ''], [-m, 'L']]) + ' = ' + T.terms([[a0, ''], [2 * s, 'L']]) + '$, so $L = ' + nx(Lm) + '$.', 'Wage from the <b>supply</b> curve: $w = ' + a0 + ' + ' + (s === 1 ? '' : nx(s) + ' \\times ') + nx(Lm) + ' = ' + money(wm) + '$.'];
    var chk = { kind: shape, w0: a0, s: s, a: b0, b: m };
    if (shape === 'L') return P(intro + ' How many workers does it hire?', exact(Lm), steps.slice(0, 2), 'Set MRP equal to the marginal factor cost, not the wage.', 'workers', chk);
    if (shape === 'w') return P(intro + ' What wage does it pay?', dollars(wm), steps, 'Hire where MRP = MFC, then read the wage from the supply curve.', 'dollars', chk);
    if (shape === 'wrong') { var mfcAt = a0 + 2 * s * Lm, ch = [money(wm), money(mfcAt), money(b0 - m * Lm === mfcAt ? wc : b0 - m * Lm), money(wc)].filter(function (x, i, aa) { return aa.indexOf(x) === i; });
      return P(intro + ' It hires ' + nx(Lm) + ' workers, where MRP and MFC both equal ' + money(mfcAt) + '. What wage does it pay?', mc(ch[0], ch.slice(1)), steps.slice(2).concat(['MFC is what the last worker costs the firm, not what each worker is paid.']), 'The wage is on the supply curve.', null, chk); }
    if (shape === 'minw') {
      var ch2 = ['Employment rises', 'Employment falls', 'Employment does not change'];
      var mw = M.round((wm + wc) / 2 * 2) / 2; if (!(mw > wm && mw < wc)) mw = wm + (wc - wm) / 2;
      return P(intro + ' Without a minimum wage it hires ' + nx(Lm) + ' workers at ' + money(wm) + '. In this model, a minimum wage of ' + money(mw) + ' (between that wage and the competitive wage of ' + money(wc) + ') is set. What happens to employment?', shuf(ch2, 0),
        ['With a wage floor, the employer can hire more workers without raising pay for everyone, until the supply curve reaches the floor: MFC is flat at ' + money(mw) + ' up to $L = ' + nx((mw - a0) / s) + '$.', 'MRP is above ' + money(mw) + ' there, so it hires all ' + nx((mw - a0) / s) + ' workers willing to work at that wage: <b>employment rises</b> in this model. (How real minimum wages affect jobs is studied and debated.)'],
        'With a floor, hiring one more no longer raises everyone’s pay.', null, { kind: 'minw', w0: a0, s: s, a: b0, b: m, mw: mw });
    }
    return P(intro + ' How many more workers would be hired if this labor market were competitive?', exact(Lc - Lm), steps.slice(0, 2).concat(['Competitive: set MRP equal to labor supply, $' + T.terms([[b0, ''], [-m, 'L']]) + ' = ' + T.terms([[a0, ''], [s, 'L']]) + '$, so $L = ' + nx(Lc) + '$.', 'Difference: $' + nx(Lc) + ' - ' + nx(Lm) + ' = ' + nx(Lc - Lm) + '$.']),
      'Competitive employment is where MRP meets the supply curve.', 'workers', chk);
  });

  // =================================================================== Unit 11: Market Failure and the Role of Government
  // externality markets in price form: demand P = a - bQ, private supply P = c + dQ, constant external cost/benefit k
  function extSetup(R, opt) {
    for (var t = 0; t < 300; t++) {
      var b = R.pick([1, 1, 2, 0.5]), d = R.pick([1, 1, 2, 0.5]), Qe = R.int(4, 14), k = R.int(2, 10), dq = k / (b + d);
      var Qm = opt.neg ? Qe + dq : Qe - dq; if (!isInt(Qm * 2) || Qm <= 0) continue;
      var c = R.int(1, 8), a = opt.neg ? c + k + (b + d) * Qe : c - k + (b + d) * Qe; if (!isInt(a) || a <= c + 2) continue;
      var Pm = a - b * Qm, dwl = k * M.abs(Qm - Qe) / 2;
      if (!isInt(Pm * 2) || !isInt(dwl * 4)) continue;
      return { a: a, b: b, c: c, d: d, k: k, Qe: Qe, Qm: Qm, Pm: Pm, dwl: dwl };
    }
    return opt.neg ? { a: 20, b: 1, c: 2, d: 1, k: 4, Qe: 7, Qm: 9, Pm: 11, dwl: 4 } : { a: 40, b: 1, c: 10, d: 1, k: 10, Qe: 20, Qm: 15, Pm: 25, dwl: 25 };
  }
  function lin(a, s, v) { return T.terms([[a, ''], [s, v || 'Q']]); }
  var NEG_GOODS = [['a chemical plant’s output', 'the river downstream'], ['electricity from a coal plant', 'people who breathe the smoke'], ['late-night concerts', 'neighbors who lose sleep'], ['trucking on a busy road', 'drivers stuck in traffic and nearby residents'], ['leaf blowing', 'neighbors bothered by the noise']];
  var POS_GOODS = [['flu shots', 'people who would otherwise catch the flu'], ['college courses', 'employers and neighbors who gain from a more skilled community'], ['home gardens', 'neighbors who enjoy the view'], ['bike helmets for kids', 'families who would bear the medical costs'], ['tutoring', 'classmates who learn from better-prepared peers']];
  G('micro.negative-externalities', function (R, ctx) {
    var L = ctx.level || 1, e = extSetup(R, { neg: true }), gd = R.pick(NEG_GOODS), shape = L === 1 ? R.pick(['qm', 'qe']) : R.pick(['qm', 'qe', 'dwl', 'dwl', 'side', 'ext']);
    var intro = 'Demand for ' + gd[0] + ' is $P = ' + lin(e.a, -e.b) + '$ and the private marginal cost (supply) is $MPC = ' + lin(e.c, e.d) + '$, in dollars. Each unit also causes ' + money(e.k) + ' of harm to ' + gd[1] + '.';
    var steps = ['Market: demand meets private cost, $' + lin(e.a, -e.b) + ' = ' + lin(e.c, e.d) + '$, so $Q_m = ' + nx(e.Qm) + '$.', 'Social cost: $MSC = ' + lin(e.c + e.k, e.d) + '$. Efficient: $' + lin(e.a, -e.b) + ' = ' + lin(e.c + e.k, e.d) + '$, so $Q_e = ' + nx(e.Qe) + '$.'];
    var chk = { kind: shape, a: e.a, b: e.b, c: e.c, d: e.d, k: e.k };
    if (shape === 'side') {
      var ch = ['The market produces more than the efficient amount', 'The market produces less than the efficient amount', 'The market produces exactly the efficient amount'];
      return P('A factory’s production causes pollution that harms its neighbors, and the factory does not pay for the harm. Compared with the efficient quantity, what does the market produce?', shuf(ch, 0), ['The harm is a cost the seller ignores, so production looks cheaper than it is.', 'The market keeps producing units whose full social cost is above their value to buyers: <b>too much</b>.'], 'An ignored cost makes something look cheaper than it is.', null, { kind: 'side' });
    }
    if (shape === 'qm') return P(intro + ' How many units does the market produce?', exact(e.Qm), steps.slice(0, 1), 'The market ignores the harm: set demand equal to private cost.', 'units', chk);
    if (shape === 'qe') return P(intro + ' What is the efficient quantity?', exact(e.Qe), steps, 'Add the harm to private cost, then set it equal to demand.', 'units', chk);
    if (shape === 'ext') return P(intro + ' What is the total external cost at the market quantity?', dollars(e.k * e.Qm), steps.slice(0, 1).concat(['External cost: $' + money(e.k) + ' \\times ' + nx(e.Qm) + ' = ' + money(e.k * e.Qm) + '$, borne by people outside the trade.']), 'Harm per unit times the number of units.', 'dollars', chk);
    return P(intro + ' What is the deadweight loss of the market outcome?', dollars(e.dwl), steps.concat(['At $Q_m = ' + nx(e.Qm) + '$, MSC is above demand by the external cost, ' + money(e.k) + '.', '$DWL = \\tfrac{1}{2} \\times ' + e.k + ' \\times (' + nx(e.Qm) + ' - ' + nx(e.Qe) + ') = ' + money(e.dwl) + '$.']),
      'The triangle between MSC and demand, from the efficient quantity out to the market quantity.', 'dollars', chk);
  });

  G('micro.positive-externalities', function (R, ctx) {
    var L = ctx.level || 1, e = extSetup(R, { neg: false }), gd = R.pick(POS_GOODS), shape = L === 1 ? R.pick(['qm', 'qe']) : R.pick(['qm', 'qe', 'dwl', 'dwl', 'side']);
    var intro = 'Private demand for ' + gd[0] + ' is $P = ' + lin(e.a, -e.b) + '$ and supply is $P = ' + lin(e.c, e.d) + '$, in dollars. Each unit also gives ' + money(e.k) + ' of benefit to ' + gd[1] + '.';
    var steps = ['Market: private demand meets supply, $' + lin(e.a, -e.b) + ' = ' + lin(e.c, e.d) + '$, so $Q_m = ' + nx(e.Qm) + '$.', 'Social benefit: $MSB = ' + lin(e.a + e.k, -e.b) + '$. Efficient: $' + lin(e.a + e.k, -e.b) + ' = ' + lin(e.c, e.d) + '$, so $Q_e = ' + nx(e.Qe) + '$.'];
    var chk = { kind: shape, a: e.a, b: e.b, c: e.c, d: e.d, k: e.k };
    if (shape === 'side') {
      var ch = ['It lies above the demand curve', 'It lies below the demand curve', 'It lies above the supply curve, on the cost side', 'It is the same as the demand curve'];
      return P('Getting a flu shot also protects the people around you. On a graph of the market for flu shots, where is the marginal social benefit curve?', shuf(ch, 0), ['The spillover comes from people <b>using</b> the good, so it belongs on the benefit side.', 'Social benefit is private benefit plus the benefit to others: the MSB curve lies <b>above</b> demand.'], 'Does the spillover come from using the good or from producing it?', null, { kind: 'side' });
    }
    if (shape === 'qm') return P(intro + ' How many units does the market produce?', exact(e.Qm), steps.slice(0, 1), 'Buyers count only their own benefit.', 'units', chk);
    if (shape === 'qe') return P(intro + ' What is the efficient quantity?', exact(e.Qe), steps, 'Add the external benefit to private demand.', 'units', chk);
    return P(intro + ' What is the deadweight loss of the market outcome?', dollars(e.dwl), steps.concat(['At $Q_m = ' + nx(e.Qm) + '$, MSB is above supply by the external benefit, ' + money(e.k) + '.', '$DWL = \\tfrac{1}{2} \\times ' + e.k + ' \\times (' + nx(e.Qe) + ' - ' + nx(e.Qm) + ') = ' + money(e.dwl) + '$: units worth more to society than they cost, never produced.']),
      'The triangle between MSB and supply, from the market quantity up to the efficient quantity.', 'dollars', chk);
  });

  G('micro.externality-policy', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['tax', 'zero']) : R.pick(['tax', 'taxRising', 'subsidy', 'abate', 'zero', 'permits']);
    if (shape === 'zero') {
      var ch = ['Where the marginal benefit of cutting pollution equals the marginal cost of cutting it', 'Zero pollution', 'Wherever the market leaves it', 'Where the total cost of cleanup is lowest'];
      return P('What is the efficient amount of pollution?', shuf(ch, 0), ['The first units of cleanup are cheap and prevent a lot of harm; the last units cost a great deal and prevent little.', 'Cut pollution until the next unit of cleanup costs as much as the harm it prevents. That is usually <b>not zero</b> pollution.'], 'Think one unit of cleanup at a time.', null, { kind: 'zero' });
    }
    if (shape === 'permits') {
      var ch2 = ['Firms that can cut pollution cheaply do more of the cutting and sell spare permits', 'Every firm must cut pollution by the same amount', 'The government sets each firm’s output', 'Pollution falls to zero'];
      return P('Under a cap-and-trade system, the government issues a fixed number of tradable pollution permits. Why can this reach the cap at a lower total cost than requiring every firm to cut the same amount?', shuf(ch2, 0), ['A permit is worth the same to every firm that holds one.', 'Firms whose cleanup is cheap cut more and sell permits; firms whose cleanup is expensive buy them. The total cut is the same, but it is done where it costs least.'], 'Who will choose to cut, and who will buy permits?', null, { kind: 'permits' });
    }
    if (shape === 'abate') {
      var p0 = R.pick([60, 80, 90, 100, 120]), s1 = R.pick([0.5, 1, 1.5, 2]), m1 = R.pick([0.5, 1, 1.5, 2]), x = p0 / (s1 + m1);
      if (!isInt(x) || x >= 100) { s1 = 1; m1 = 1; x = p0 / 2; }
      return P('The marginal benefit of cutting pollution is $MB = ' + lin(p0, -s1, 'x') + '$ and the marginal cost of cutting it is $MC = ' + (m1 === 1 ? '' : nx(m1)) + 'x$, in dollars, where $x$ is the percent of pollution removed. What percent is efficient?', percent(x),
        ['Set $MB = MC$: $' + lin(p0, -s1, 'x') + ' = ' + (m1 === 1 ? '' : nx(m1)) + 'x$.', '$' + p0 + ' = ' + (s1 + m1 === 1 ? '' : nx(s1 + m1)) + 'x$, so $x = ' + nx(x) + '\\%$, not 100%.'], 'Set the marginal benefit of cleanup equal to its marginal cost.', null, { kind: 'abate', p0: p0, s: s1, m: m1 });
    }
    if (shape === 'taxRising') {
      // MEC = k0 + k1 Q rises with Q; tax = MEC at the efficient quantity
      for (var t = 0; t < 200; t++) {
        var a = R.int(20, 40), c = R.int(1, 6), k0 = R.int(0, 3), k1 = R.pick([0.5, 1]), Qe = (a - c - k0) / (2 + k1), tax = k0 + k1 * Qe, Qm = (a - c) / 2;
        if (isInt(Qe) && isInt(tax * 2)) break;
      }
      return P('Demand is $P = ' + lin(a, -1) + '$, private marginal cost is $MPC = ' + lin(c, 1) + '$, and the marginal external cost rises with output: $MEC = ' + (k0 ? lin(k0, k1) : (k1 === 1 ? '' : nx(k1)) + 'Q') + '$ (dollars). What per-unit tax moves the market to the efficient quantity?', dollars(tax),
        ['$MSC = MPC + MEC = ' + lin(c + k0, 1 + k1) + '$. Efficient: $' + lin(a, -1) + ' = ' + lin(c + k0, 1 + k1) + '$, so $Q_e = ' + nx(Qe) + '$.', 'The tax should equal the marginal external cost <b>at the efficient quantity</b>: $MEC(' + nx(Qe) + ') = ' + money(tax) + '$.', 'Check: with the tax, supply is $P = ' + lin(c + tax, 1) + '$, which meets demand at $Q = ' + nx(Qe) + '$. (The harm at the market quantity, ' + money(k0 + k1 * Qm) + ', would be too high a tax.)'],
        'Find the efficient quantity, then the harm at that quantity.', 'dollars', { kind: 'taxRising', a: a, c: c, k0: k0, k1: k1 });
    }
    var isTax = shape === 'tax', e = extSetup(R, { neg: isTax });
    return P((isTax ? 'Demand is $P = ' + lin(e.a, -e.b) + '$ and private marginal cost is $MPC = ' + lin(e.c, e.d) + '$, and each unit causes ' + money(e.k) + ' of harm to bystanders.' : 'Private demand is $P = ' + lin(e.a, -e.b) + '$ and supply is $P = ' + lin(e.c, e.d) + '$, and each unit gives ' + money(e.k) + ' of benefit to bystanders.') + ' What per-unit ' + (isTax ? 'tax' : 'subsidy') + ' would move the market to the efficient quantity?', dollars(e.k),
      ['Efficient quantity: ' + (isTax ? '$' + lin(e.a, -e.b) + ' = ' + lin(e.c + e.k, e.d) + '$' : '$' + lin(e.a + e.k, -e.b) + ' = ' + lin(e.c, e.d) + '$') + ', so $Q_e = ' + nx(e.Qe) + '$.', 'A ' + (isTax ? 'tax' : 'subsidy') + ' equal to the external ' + (isTax ? 'cost' : 'benefit') + ', ' + money(e.k) + ', makes ' + (isTax ? 'sellers count the harm' : 'buyers count the spillover') + ', so the market lands on ' + nx(e.Qe) + '.'],
      'Set it equal to the external ' + (isTax ? 'cost' : 'benefit') + ' per unit.', 'dollars', { kind: shape, a: e.a, b: e.b, c: e.c, d: e.d, k: e.k });
  });

  var GOOD_TYPES = ['Private good', 'Club good', 'Common resource', 'Public good'];
  var GOOD_ITEMS = [
    { s: 'a sandwich', v: 0 }, { s: 'a pair of jeans', v: 0 }, { s: 'a cup of coffee at a café', v: 0 }, { s: 'a seat in a public school classroom', v: 0, lv: 2 }, { s: 'a used car', v: 0 },
    { s: 'a streaming video service', v: 1 }, { s: 'a members-only gym that is rarely crowded', v: 1, lv: 2 }, { s: 'a toll road with little traffic', v: 1, lv: 2 }, { s: 'cable television', v: 1 },
    { s: 'fish in the open ocean', v: 2 }, { s: 'a pond where anyone may fish', v: 2 }, { s: 'grass on a village common where anyone may graze animals', v: 2, lv: 2 }, { s: 'wood in a forest anyone may cut', v: 2 }, { s: 'a free road jammed with traffic at rush hour', v: 2, lv: 3 },
    { s: 'national defense', v: 3 }, { s: 'a lighthouse’s light', v: 3 }, { s: 'a fireworks show seen across town', v: 3 }, { s: 'flood-control levees that protect a whole town', v: 3, lv: 2 }, { s: 'the results of basic scientific research published for all', v: 3, lv: 3 }
  ];
  var TYPE_WHY = ['Rival and excludable.', 'Excludable but not rival: nonpayers can be kept out, but one more user takes nothing from others.', 'Rival but not excludable: anyone can use it, but what one person takes is gone for others.', 'Neither rival nor excludable: everyone benefits at once, and no one can be kept out.'];
  G('micro.types-of-goods', function (R, ctx) {
    var L = ctx.level || 1, it = bank(R, ctx, GOOD_ITEMS), shape = L === 1 ? R.pick(['type', 'type', 'which']) : R.pick(['type', 'which', 'q']);
    if (shape === 'which') {
      var want = R.int(0, 3), picks = [0, 1, 2, 3].map(function (f) { return R.pick(GOOD_ITEMS.filter(function (x) { return x.v === f && (x.lv || 1) <= L; })); });
      return P('Which of these is a <b>' + GOOD_TYPES[want].toLowerCase() + '</b>?', mc(cap(picks[want].s), picks.filter(function (x, i) { return i !== want; }).map(function (x) { return cap(x.s); })),
        [TYPE_WHY[want], cap(picks[want].s) + ' fits.', 'The others: ' + picks.filter(function (x, i) { return i !== want; }).map(function (x) { return x.s + ' (' + GOOD_TYPES[x.v].toLowerCase() + ')'; }).join('; ') + '.'],
        'Ask two questions: can nonpayers be kept out? Does one person’s use leave less for others?', null, { kind: 'which', want: want, answer: picks[want].s, items: picks.map(function (x) { return [x.s, x.v]; }) });
    }
    if (shape === 'q') {
      var askR = R.coin(), yes = askR ? (it.v === 0 || it.v === 2) : (it.v === 0 || it.v === 1);
      return P('Is ' + it.s + ' ' + (askR ? '<b>rival</b> (one person’s use leaves less for others)' : '<b>excludable</b> (people who don’t pay can be kept from using it)') + '?', keep(['Yes', 'No'], yes ? 0 : 1),
        [cap(it.s) + ' is a ' + GOOD_TYPES[it.v].toLowerCase() + ': ' + TYPE_WHY[it.v].charAt(0).toLowerCase() + TYPE_WHY[it.v].slice(1), 'So the answer is <b>' + (yes ? 'yes' : 'no') + '</b>.'], askR ? 'Does using it use it up for others?' : 'Can nonpayers be kept out?', null, { kind: 'q', s: it.s, v: it.v, askR: askR });
    }
    return P('What kind of good is ' + it.s + '?', keep(GOOD_TYPES.slice(), it.v), [TYPE_WHY[it.v], cap(it.s) + ' is a <b>' + GOOD_TYPES[it.v].toLowerCase() + '</b>.' + (it.v === 0 && /school/.test(it.s) ? ' Government provides it, but that doesn’t make it a public good.' : '')],
      'Can nonpayers be kept out? Does one person’s use leave less for others?', null, { kind: 'type', s: it.s, v: it.v });
  });

  G('micro.public-goods', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['total', 'yes']) : R.pick(['total', 'yes', 'units', 'units', 'free']);
    if (shape === 'free') {
      var ch = ['Each person can enjoy the good without paying, so few pay and sellers can’t cover the cost', 'Public goods always cost more than they are worth', 'People do not value public goods', 'Public goods are rival, so they run out'];
      return P('Why do private markets tend to supply too little of a public good?', shuf(ch, 0), ['No one can be kept from using a public good, so each person can free ride on others’ payments.', 'Sellers can’t collect enough to cover the cost, even when the total benefit to everyone is larger than the cost.'], 'What happens when nonpayers can’t be kept out?', null, { kind: 'free' });
    }
    if (shape === 'units') {
      var n = 4, mbA = [], mbB = [], cst = R.pick([30, 40, 50, 60]), a0 = R.int(25, 45), b0 = R.int(20, 40);
      for (var i = 0; i < n; i++) { mbA.push(M.max(0, a0 - i * R.int(6, 10))); mbB.push(M.max(0, b0 - i * R.int(5, 9))); }
      for (i = 1; i < n; i++) { if (mbA[i] >= mbA[i - 1]) mbA[i] = M.max(0, mbA[i - 1] - 5); if (mbB[i] >= mbB[i - 1]) mbB[i] = M.max(0, mbB[i - 1] - 5); }
      var sum = mbA.map(function (v, j) { return v + mbB[j]; }), units = 0; sum.forEach(function (v, j) { if (v >= cst && units === j) units = j + 1; });
      if (sum.indexOf(cst) >= 0) cst += 1;
      units = 0; sum.forEach(function (v, j) { if (v >= cst && units === j) units = j + 1; });
      var tbl = htmlTable(['Unit', 'Group A’s marginal benefit', 'Group B’s marginal benefit'], mbA.map(function (v, j) { return [j + 1, money(v), money(mbB[j])]; }));
      return P('A town is deciding how many lights to put along a park path. Both groups of residents use every light. Each light costs ' + money(cst) + '.' + tbl + 'How many lights should it install?', exact(units),
        ['Everyone uses every light, so add the marginal benefits for each unit: ' + sum.map(function (v) { return money(v); }).join(', ') + '.', 'Install each light whose total benefit is at least ' + money(cst) + ': <b>' + units + '</b>.'],
        'For a public good, add everyone’s marginal benefits, then compare with the cost.', 'lights', { kind: 'units', mbA: mbA, mbB: mbB, cost: cst });
    }
    var k = R.int(3, 5), vals = []; while (vals.length < k) { var v0 = R.int(2, 12) * 5; if (vals.indexOf(v0) < 0) vals.push(v0); }
    var tot = vals.reduce(function (a2, b2) { return a2 + b2; }, 0), worth = R.coin(), cost = worth ? tot - R.int(1, 4) * 5 : tot + R.int(1, 4) * 5;
    if (cost <= M.max.apply(null, vals)) cost = M.max.apply(null, vals) + 5; var build = tot >= cost;
    var intro = 'A street of ' + k + ' homes is considering a shared security camera. The households value it at ' + U.list(vals.map(function (v) { return money(v); })) + '. It costs ' + money(cost) + '.';
    if (shape === 'total') return P(intro + ' What is the total benefit to the street?', dollars(tot), ['Everyone on the street benefits at once, so add the values: ' + vals.map(function (v) { return money(v); }).join(' + ') + ' = ' + money(tot) + '.'], 'Add everyone’s benefit.', 'dollars', { kind: 'total', vals: vals });
    return P(intro + ' Is it worth providing?', keep(['Yes: the total benefit is at least the cost', 'No: the total benefit is less than the cost', 'No: no single household values it at the full cost'], build ? 0 : 1),
      ['Total benefit: ' + money(tot) + ', against a cost of ' + money(cost) + '.', build ? 'Worth it, even though no single household would pay ' + money(cost) + ' alone.' : 'Not worth it: even together, the benefits fall short.'],
      'Compare the sum of everyone’s benefits with the cost.', null, { kind: 'yes', vals: vals, cost: cost });
  });

  G('micro.income-inequality', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['cum', 'top', 'read']) : R.pick(['cum', 'top', 'gini', 'compare', 'read']);
    function shares5() { for (var t = 0; t < 200; t++) { var s = [R.int(2, 6)]; for (var i = 1; i < 4; i++) s.push(s[i - 1] + R.int(3, 8)); var top = 100 - s.reduce(function (a, b) { return a + b; }, 0); if (top > s[3] + 2) { s.push(top); return s; } } return [4, 9, 15, 23, 49]; }
    var sh = shares5(), cumS = cumsum(sh), tbl = htmlTable(['Quintile (poorest first)', 'First', 'Second', 'Third', 'Fourth', 'Fifth'], [['Share of income'].concat(sh.map(function (v) { return v + '%'; }))]);
    var intro = 'The table shows the share of a country’s income going to each fifth of households.' + tbl;
    if (shape === 'cum') { var k = R.int(2, 4); return P(intro + 'What share of income goes to the bottom ' + (k * 20) + '% of households?', percent(cumS[k - 1]), ['Add the first ' + k + ' shares: $' + sh.slice(0, k).join(' + ') + ' = ' + cumS[k - 1] + '\\%$.', 'On the Lorenz curve, that is the point at ' + (k * 20) + '% of households.'], 'Cumulative shares add up from the bottom.', null, { kind: 'cum', sh: sh, k: k }); }
    if (shape === 'top') return P(intro + 'How many times larger is the top fifth’s share than the bottom fifth’s? (Round to one decimal place if needed.)', near(Q(sh[4], sh[0]), 0.06), ['$' + sh[4] + ' \\div ' + sh[0] + ' \\approx ' + T.num(+(sh[4] / sh[0]).toFixed(2)) + '$.'], 'Divide the top share by the bottom share.', null, { kind: 'top', sh: sh });
    if (shape === 'read') {
      var ch = ['Farther from the diagonal means less equal, and a higher Gini coefficient means less equal', 'Farther from the diagonal means more equal, and a higher Gini coefficient means more equal', 'Farther from the diagonal means less equal, and a higher Gini coefficient means more equal', 'Farther from the diagonal means more equal, and a higher Gini coefficient means less equal'];
      return P('How do you read a Lorenz curve and the Gini coefficient?', shuf(ch, 0), ['The diagonal is perfect equality: each fifth of households gets a fifth of income.', 'The more the curve sags away from it, the bigger the area between them, and the Gini coefficient (that area’s share) is larger. Both mean <b>less equal</b>.'], 'Where is perfect equality on the graph?', null, { kind: 'read' }, { name: 'ec-lorenz', opts: { shares: sh, quiet: true, interactive: false } });
    }
    var B = 0, c0 = [0].concat(cumS); for (var i = 0; i < 5; i++) B += (c0[i] + c0[i + 1]) / 2 * 0.2 / 100; var gini = 1 - 2 * B;
    if (shape === 'gini') return P(intro + 'Estimate the Gini coefficient using trapezoids under the Lorenz curve. (Give a decimal between 0 and 1, to two places.)', { t: 'num', v: plain(Q.from(gini.toFixed(6))), tol: 0.006 },
      ['Cumulative shares: 0, ' + cumS.map(function (v) { return (v / 100).toFixed(2); }).join(', ') + '.', 'Area under the curve: $B = 0.2 \\times \\tfrac{1}{2}[' + [0, 1, 2, 3, 4].map(function (j) { return '(' + (c0[j] / 100).toFixed(2) + ' + ' + (c0[j + 1] / 100).toFixed(2) + ')'; }).join(' + ') + '] = ' + B.toFixed(3) + '$.', '$\\text{Gini} = 1 - 2B = ' + gini.toFixed(3) + '$, about ' + gini.toFixed(2) + '.'],
      'Gini = 1 − 2 × (area under the Lorenz curve).', null, { kind: 'gini', sh: sh });
    var sh2 = shares5(), B2 = 0, c2 = [0].concat(cumsum(sh2)); for (i = 0; i < 5; i++) B2 += (c2[i] + c2[i + 1]) / 2 * 0.2 / 100; var g2 = 1 - 2 * B2;
    if (M.abs(g2 - gini) < 0.02) { sh2 = [2, 5, 10, 18, 65]; B2 = 0; c2 = [0].concat(cumsum(sh2)); for (i = 0; i < 5; i++) B2 += (c2[i] + c2[i + 1]) / 2 * 0.2 / 100; g2 = 1 - 2 * B2; if (M.abs(g2 - gini) < 0.02) { sh2 = [7, 13, 18, 24, 38]; B2 = 0; c2 = [0].concat(cumsum(sh2)); for (i = 0; i < 5; i++) B2 += (c2[i] + c2[i + 1]) / 2 * 0.2 / 100; g2 = 1 - 2 * B2; } }
    return P('Income shares by fifth (poorest first) are ' + sh.join('%, ') + '% in Country A and ' + sh2.join('%, ') + '% in Country B. Their Gini coefficients are ' + (R.coin() ? gini.toFixed(2) + ' and ' + g2.toFixed(2) : g2.toFixed(2) + ' and ' + gini.toFixed(2)) + ', in some order. Which country has the more equal distribution?', keep(['Country A', 'Country B'], gini < g2 ? 0 : 1),
      ['Gini for A: ' + gini.toFixed(2) + '; for B: ' + g2.toFixed(2) + ' (each is $1 - 2B$, with B the area under the Lorenz curve).', 'The lower Gini, with a Lorenz curve closer to the diagonal, is <b>more equal</b>: Country ' + (gini < g2 ? 'A' : 'B') + '.'],
      'Lower Gini, more equal.', null, { kind: 'compare', sh: sh, sh2: sh2 }, { name: 'ec-lorenz', opts: { shares: sh, compare: sh2, labels: ['Country A', 'Country B'], quiet: true, interactive: false } });
  });

})(window.MathLadder);

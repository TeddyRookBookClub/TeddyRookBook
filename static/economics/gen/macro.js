/* Economics Ladder: Macroeconomics (macro) problem generators, one per topic of data/economics/topics/macro.json.
   Built from /tmp/work_macro/gen/*.js by build_gen.js. Problems are our own, with made-up round numbers.
   Conventions (overview): GDP = C + I + G + NX; real interest rate ≈ nominal − inflation; spending multiplier 1/(1 − MPC);
   tax multiplier −MPC/MPS; money multiplier 1/rr on excess reserves; exchange rates always with their units; AP sign
   convention for the balance of payments (a net inflow of foreign capital is a financial account surplus). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, T = ML.T, U = ML.util;

  // ---------- helpers (local to this file) ----------
  function S(v) { return String(U.fix(v)); }                       // exact answer string, no float noise
  function cm(x) { return T.commas(U.fix(x)); }                     // 12,500 (text or math)
  function $(x) { return T.money(U.fix(x)); }                       // \$12,500 or \$17.50
  function bn(x) { return '\\$' + cm(x) + ' billion'; }           // \$400 billion, \$1.5 billion (no cents)
  function tn(x) { return '\\$' + cm(x) + ' trillion'; }          // \$1.8 trillion
  function pc(x) { return cm(x) + '%'; }                             // 4.5% in text
  function lvl(ctx) { return (ctx && ctx.level) || 1; }
  function r2(x) { return U.round(x, 2); }
  function r1(x) { return U.round(x, 1); }
  function choose(R, ctx, shapes) { // shapes: [[minLevel, fn], …]: pick one allowed at this level
    var L = lvl(ctx), ok = shapes.filter(function (s) { return s[0] <= L && (s[2] == null || L <= s[2]); });
    return R.pick(ok)[1];
  }
  function mc(q, right, wrongs, steps, hint, o) {
    o = o || {};
    var p = { q: q, a: U.mc(right, wrongs, o.k || 4), steps: steps, hint: hint };
    if (o.keep) p.a.keep = true;
    if (o.viz) p.viz = o.viz;
    return p;
  }
  function num(q, v, steps, hint, o) {
    o = o || {};
    var a = { t: 'num', v: S(v) };
    if (o.pct) a.pct = true;
    if (o.tol != null) a.tol = o.tol;
    if (o.rtol != null) a.rtol = o.rtol;
    var p = { q: q, a: a, steps: steps, hint: hint };
    if (o.unit) p.unit = o.unit;                                   // percents (pct) carry no unit: "5" and "5%" are both right
    if (o.viz) p.viz = o.viz;
    return p;
  }
  function tf(q, v, steps, hint) { return { q: q, a: { t: 'tf', v: !!v }, steps: steps, hint: hint }; }
  // pick one item from a pool of { t: text, …answer fields } avoiding the same text twice in a row is not needed (seeded)
  function item(R, pool) { return R.pick(pool); }
  function others(list, right) { return list.filter(function (x) { return x !== right; }); }
  var UB = 'billion';


  // =====================================================================================================
  // Unit 1: Measuring the Economy
  // =====================================================================================================

  var CF = { pm: 'Product market: money from households to firms', pg: 'Product market: goods and services from firms to households', fm: 'Factor market: income (wages, rent, interest, profit) from firms to households', fr: 'Factor market: resources (labor, land, capital) from households to firms', bad1: 'Product market: money from firms to households', bad2: 'Factor market: money from households to firms' };
  G('macro.circular-flow', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var it = R.pick([
          ['A family pays a grocery store \\$120 for a week of food. Which flow is the \\$120?', 'pm', 'Paying for a product is spending in the product market; the money goes from the household to the firm.'],
          ['A bakery hands a customer a loaf of bread. Which flow is the bread?', 'pg', 'Bread is a finished product sold in the product market; it goes from the firm to the household.'],
          ['A software company pays its programmers their monthly salaries. Which flow are the salaries?', 'fm', 'Firms buy labor in the factor market, so the salary is income paid from the firm to households.'],
          ['A nurse works a 12-hour shift at a hospital. Which flow is her work?', 'fr', 'Labor is a resource. Households sell it to firms in the factor (resource) market.'],
          ['A family rents its farmland to a farm business. Which flow is the use of the land?', 'fr', 'Land is a resource. The household sells its use to a firm in the factor market.'],
          ['A farm business pays a family rent for its land. Which flow is the rent?', 'fm', 'Rent is the income a household earns by selling the use of land in the factor market.'],
          ['A student pays a gym for a membership. Which flow is the payment?', 'pm', 'A gym membership is a service, bought in the product market with money from the household.'],
          ['A car maker delivers a new car to a buyer. Which flow is the car?', 'pg', 'The car is a product, so it moves from the firm to the household in the product market.']
        ]);
        var right = CF[it[1]], wr = others([CF.pm, CF.pg, CF.fm, CF.fr, CF.bad1, CF.bad2], right);
        return mc(it[0], right, R.shuffle(wr), [it[2], 'Rule of thumb: households sell resources and buy products; firms buy resources and sell products. Money always flows the opposite way to the goods or resources it pays for.'], 'Ask two things: is a product or a resource being traded, and is this the money or the thing itself?');
      }],
      [1, function () {
        var it = R.pick([
          ['In the product market, who are the buyers?', 'Households', 'Households buy goods and services from firms in the product market.'],
          ['In the product market, who are the sellers?', 'Firms', 'Firms sell the goods and services they make in the product market.'],
          ['In the factor (resource) market, who are the sellers?', 'Households', 'Households own the resources (their labor, land and savings) and sell their use to firms.'],
          ['In the factor (resource) market, who are the buyers?', 'Firms', 'Firms hire labor, rent land and borrow capital in the factor market.']
        ]);
        return mc(it[0], it[1], R.shuffle(others(['Households', 'Firms', 'The government', 'Banks'], it[1])), [it[2], 'In the simple circular flow the two sides swap roles between the two markets.'], 'Think about who owns labor and land, and who makes the products.');
      }],
      [1, function () {
        var it = R.pick([
          ['True or false: when a household spends \\$100 at a store, that \\$100 leaves the economy.', false, 'False. The \\$100 becomes the store’s revenue, and the store pays it out as wages, rent, interest and profit, which are households’ incomes. Spending is someone’s income.'],
          ['True or false: households are the sellers in the factor (resource) market.', true, 'True. Households own labor, land and capital and sell their use to firms.'],
          ['True or false: firms are the buyers in the product market.', false, 'False. In the simple circular flow, households buy goods and services; firms sell them.'],
          ['True or false: in the circular flow, money and goods move in opposite directions.', true, 'True. Goods and resources go one way around the loop; the payments for them go the other way.']
        ]);
        return tf(it[0], it[1], [it[2]], 'Follow one dollar around the loop.');
      }, 2],
      [2, function () {
        var Y = R.pick([400, 500, 600, 800, 1000, 1200]), Tx = R.pick([40, 50, 60, 80, 100]), Sv = R.pick([20, 30, 40, 50, 60]), C = Y - Tx - Sv;
        return num('In a simple economy with a government, households earn ' + bn(Y) + ' of income. They pay ' + bn(Tx) + ' in taxes and spend ' + bn(C) + ' on goods and services. How much do they save, in billions of dollars?', Sv,
          ['Income can only be spent, paid in taxes or saved: $Y = C + S + T$.', 'Saving $= Y - C - T = ' + Y + ' - ' + C + ' - ' + Tx + ' = ' + Sv + '$ billion dollars.', 'Saving is a leakage from the loop of spending; it comes back as investment when banks lend it to firms.'], 'Income is split three ways: consumption, saving and taxes.', { unit: UB });
      }],
      [3, function () {
        var S1 = R.pick([60, 80, 100]), T1 = R.pick([100, 120, 150]), M1 = R.pick([50, 70, 90]), I1 = R.pick([70, 90, 110]), G1 = R.pick([110, 130, 150]), X1 = R.pick([40, 60, 80]);
        var L = S1 + T1 + M1, J = I1 + G1 + X1;
        if (L === J) { X1 += 20; J += 20; }
        var right = J > L ? 'Total spending will grow, because injections are larger than leakages' : 'Total spending will shrink, because leakages are larger than injections';
        return mc('In one year, households save ' + bn(S1) + ', pay ' + bn(T1) + ' in taxes and buy ' + bn(M1) + ' of imports. Firms invest ' + bn(I1) + ', the government buys ' + bn(G1) + ' of goods and services, and foreigners buy ' + bn(X1) + ' of exports. What happens to the flow of spending?', right,
          ['Total spending will grow, because injections are larger than leakages', 'Total spending will shrink, because leakages are larger than injections', 'Total spending stays the same, because money cannot leave the loop', 'Total spending stays the same, because saving always equals investment'].filter(function (x) { return x !== right; }),
          ['Leakages (money that leaves the loop of spending on domestic output): saving + taxes + imports $= ' + S1 + ' + ' + T1 + ' + ' + M1 + ' = ' + L + '$.', 'Injections (spending that enters the loop from outside households): investment + government purchases + exports $= ' + I1 + ' + ' + G1 + ' + ' + X1 + ' = ' + J + '$.', J > L ? 'Injections exceed leakages by ' + (J - L) + ', so spending, and with it income, tends to rise.' : 'Leakages exceed injections by ' + (L - J) + ', so spending, and with it income, tends to fall.'], 'Add the three leakages and the three injections, then compare.');
      }]
    ])();
  });

  var GDP_ITEMS = [
    // [text, code, why]  codes: in, int (intermediate), old (earlier year), fin (financial or transfer), non (nonmarket), abr (abroad)
    ['A new car built in Ohio this year and sold to a family', 'in', 'A final good produced in the U.S. this year.'],
    ['A haircut at a local barbershop', 'in', 'A final service produced this year.'],
    ['A new house built this year', 'in', 'New homes count, as residential investment.'],
    ['A city pays a company to repave a road this year', 'in', 'Government purchases of newly produced services count.'],
    ['A doctor’s checkup paid for by a patient', 'in', 'A final service produced this year.'],
    ['Flour that a bakery buys to make bread', 'int', 'The flour’s value is already inside the price of the bread.'],
    ['Steel that an automaker buys to build cars', 'int', 'The steel’s value is already counted in the price of the cars.'],
    ['Tires a bicycle maker buys to put on new bikes', 'int', 'The tires are counted in the price of the finished bikes.'],
    ['A used car sold by one neighbor to another', 'old', 'The car was produced, and counted, in an earlier year.'],
    ['A house built in 1995 that sells again this year', 'old', 'The house was counted in 1995, when it was built.'],
    ['Shares of a company’s stock bought for \\$5,000', 'fin', 'Buying stock trades ownership of existing assets; nothing new is produced.'],
    ['A government bond bought by a family', 'fin', 'A bond is a loan, a financial transaction, not new production.'],
    ['Social Security checks paid to retirees', 'fin', 'A transfer payment: nothing is produced in return.'],
    ['Unemployment benefits paid to laid-off workers', 'fin', 'A transfer payment: no good or service is bought.'],
    ['A parent cooking dinner for the family at home', 'non', 'No market transaction, so GDP leaves it out.'],
    ['Mowing your own lawn on Saturday', 'non', 'Unpaid work at home is not a market transaction.'],
    ['Sneakers made in a U.S.-owned factory in Vietnam', 'abr', 'Produced in Vietnam, so they count in Vietnam’s GDP, not in U.S. GDP.'],
    ['A pizza a family buys at a restaurant in Denver', 'in', 'A final good (a meal served) produced in the U.S. this year.'],
    ['A new laptop made in Texas this year and sold to a student', 'in', 'A final good produced in the U.S. this year.'],
    ['A piano lesson a child takes from a paid teacher', 'in', 'A final service, bought in the market and produced this year.'],
    ['A town buys a new fire truck built this year in Wisconsin', 'in', 'Government purchases of newly produced goods count.'],
    ['Lumber a builder buys to frame a new house', 'int', 'The lumber’s value is already inside the price of the new house.'],
    ['Cocoa beans a candy maker buys to make chocolate bars', 'int', 'The cocoa is counted in the price of the chocolate bars.'],
    ['Paint an auto body shop buys to repaint customers’ cars', 'int', 'The paint is used up in the shop’s service, whose price includes it.'],
    ['A 1960s guitar sold at a garage sale', 'old', 'The guitar was produced, and counted, decades ago.'],
    ['A used textbook a student buys from another student', 'old', 'The book was produced, and counted, when it was new.'],
    ['A gift of \\$100 from a grandparent to a grandchild', 'fin', 'A gift is a transfer: nothing is produced in return.'],
    ['Money a family deposits in a savings account', 'fin', 'Saving moves money into a bank; nothing new is produced.'],
    ['Painting your own bedroom on a weekend', 'non', 'Unpaid work at home is not a market transaction.'],
    ['A neighbor watching your dog for free as a favor', 'non', 'No payment, no market transaction, so GDP leaves it out.'],
    ['Coffee grown and roasted in Colombia this year', 'abr', 'Produced in Colombia, so it counts in Colombia’s GDP, not in U.S. GDP.'],
    ['Phones assembled in China for a U.S. company', 'abr', 'Produced in China, so they count in China’s GDP; GDP counts where things are made.']
  ];
  var GDP_TRICKY = [
    ['A dealer’s \\$600 commission for selling a used car', 'in', 'The dealer’s service of selling the car was produced this year; the used car itself is not counted.'],
    ['A broker’s fee for arranging a stock sale', 'in', 'The broker’s service is new production; the stock itself is not.'],
    ['Laptops made in Texas this year that are still unsold in a warehouse on December 31', 'in', 'They count this year as an addition to inventories (investment).'],
    ['Cars made in Kentucky at a Japanese-owned factory', 'in', 'GDP counts production inside the country, whoever owns the factory.'],
    ['A real estate agent’s commission on the sale of a 30-year-old house', 'in', 'The agent’s service is produced now, even though the house is old.']
  ];
  var GDP_REASON = { in: 'Counted in this year’s U.S. GDP', int: 'Not counted: an intermediate good', old: 'Not counted: it was produced in an earlier year', fin: 'Not counted: a financial transaction or transfer payment', non: 'Not counted: not a market transaction', abr: 'Not counted: not produced in the U.S.' };
  G('macro.gdp-definition', function (R, ctx) {
    var L = lvl(ctx);
    return choose(R, ctx, [
      [1, function () {
        var it = R.pick(L >= 3 ? GDP_TRICKY.concat(GDP_ITEMS) : GDP_ITEMS), yes = it[1] === 'in';
        return tf('True or false: this is counted in this year’s U.S. GDP. ' + it[0] + '.', yes, [(yes ? 'True. ' : 'False. ') + it[2], 'GDP is the market value of all final goods and services produced within a country in a given period.'], 'Check each word of the definition: market value, final, produced this period, within the country.');
      }, 2],
      [1, function () {
        var it = R.pick(L >= 3 ? GDP_TRICKY.concat(GDP_ITEMS) : GDP_ITEMS), right = GDP_REASON[it[1]];
        var wr = R.shuffle(Object.keys(GDP_REASON).map(function (k) { return GDP_REASON[k]; }).filter(function (x) { return x !== right; }));
        return mc('How does GDP treat this? ' + it[0] + '.', right, wr, [it[2], 'GDP is the market value of all final goods and services produced within a country in a given period.'], 'Was something new produced, in this country, this year, and sold to its final user?');
      }],
      [3, function () {
        var car = R.pick([24000, 28000, 30000, 32000]), used = R.pick([6000, 8000, 9000]), com = R.pick([400, 500, 600, 800]), stock = R.pick([2000, 3000, 5000]), tires = R.pick([600, 800, 1000]);
        var tot = car + com;
        return num('In one year: a family buys a new car built that year for ' + $(car) + ' (its price includes ' + $(tires) + ' of tires the carmaker bought), a dealer sells a used car for ' + $(used) + ' and keeps a ' + $(com) + ' commission, and a neighbor buys ' + $(stock) + ' of stock. By how many dollars do these add to GDP?', tot,
          ['New car: ' + $(car) + ' counts. The ' + $(tires) + ' of tires are an intermediate good, already inside that price.', 'Used car: the car was counted when it was made, so the ' + $(used) + ' does not count, but the dealer’s ' + $(com) + ' commission is a new service and does.', 'Stock: a financial transaction, not production, so ' + $(stock) + ' does not count.', 'Total: $' + cm(car) + ' + ' + cm(com) + ' = ' + cm(tot) + '$ dollars.'], 'Count only what was newly produced and sold to its final user.', { unit: 'dollars' });
      }]
    ])();
  });

  var GX = {
    C: ['A family buys a new washing machine', 'A student pays for a streaming subscription', 'A retiree pays for a dental cleaning', 'A household buys groceries'],
    I: ['A bakery buys a new oven', 'A family buys a newly built house', 'A trucking company buys new trucks', 'A store adds unsold jackets to its inventory at year’s end'],
    G: ['A state government pays teachers’ salaries', 'The federal government buys new fighter jets', 'A town buys a new fire engine', 'A county hires a firm to build a bridge'],
    X: ['A German company buys tractors made in Iowa', 'Japanese tourists pay for hotel rooms in Hawaii', 'A Canadian family buys a car made in Michigan'],
    M: ['An American family buys a television made in South Korea', 'A U.S. café buys coffee beans from Colombia', 'An American tourist pays for meals in Italy'],
    N: ['A family buys shares of stock', 'The government sends Social Security checks to retirees', 'A family buys a used car from a neighbor', 'A family buys a government bond']
  };
  var GXL = { C: 'Consumption (C)', I: 'Investment (I)', G: 'Government purchases (G)', X: 'Net exports: an export, added', M: 'Net exports: an import, subtracted', N: 'Not part of GDP' };
  var GXW = { C: 'Spending by households on goods and services is consumption.', I: 'Investment means new capital goods, new homes and additions to inventories.', G: 'Spending by government on goods and services (not transfers) is G.', X: 'Goods made here and sold abroad are exports, part of net exports.', M: 'Imports are subtracted in NX because their value was already counted in C, I or G; that removes what was not made here.', N: 'It buys no newly produced good or service (a financial asset, a transfer or a used good).' };
  G('macro.gdp-expenditure', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var C = R.pick([600, 650, 700, 720, 800]), I = R.pick([150, 160, 180, 200]), Gv = R.pick([180, 200, 220, 250]), X = R.pick([90, 100, 120, 140]), M = R.pick([110, 130, 150, 160]);
        var Y = C + I + Gv + X - M;
        return num('An economy has consumption ' + bn(C) + ', investment ' + bn(I) + ', government purchases ' + bn(Gv) + ', exports ' + bn(X) + ' and imports ' + bn(M) + '. What is GDP, in billions of dollars?', Y,
          ['Net exports: $NX = X - M = ' + X + ' - ' + M + ' = ' + (X - M) + '$.', '$GDP = C + I + G + NX = ' + C + ' + ' + I + ' + ' + Gv + T.signed(X - M) + ' = ' + Y + '$ billion dollars.'], 'Subtract imports; add the other four.', { unit: UB });
      }, 2],
      [2, function () {
        var C = R.pick([500, 550, 600, 650]), eq = R.pick([60, 70, 80, 90]), home = R.pick([40, 50, 60]), inv = R.pick([10, 15, 20, -10]), Gv = R.pick([150, 160, 180]), tr = R.pick([90, 100, 120]), st = R.pick([30, 40, 50]), X = R.pick([70, 80, 90]), M = R.pick([90, 100, 110]);
        var I = eq + home + inv, Y = C + I + Gv + X - M;
        return num('Use these figures, in billions of dollars, to find GDP: consumer spending ' + C + '; business purchases of new equipment ' + eq + '; new homes built ' + home + '; change in business inventories ' + (inv < 0 ? '−' + (-inv) : '+' + inv) + '; government purchases of goods and services ' + Gv + '; government transfer payments ' + tr + '; purchases of stocks and bonds ' + st + '; exports ' + X + '; imports ' + M + '.', Y,
          ['Investment is new equipment + new homes + the change in inventories: $' + eq + ' + ' + home + T.signed(inv) + ' = ' + I + '$.', 'Leave out transfer payments (' + tr + ') and purchases of stocks and bonds (' + st + '): neither pays for new production.', '$GDP = C + I + G + (X - M) = ' + C + ' + ' + I + ' + ' + Gv + ' + (' + X + ' - ' + M + ') = ' + Y + '$ billion dollars.'], 'Not every dollar spent buys new production. Which items are transfers or financial?', { unit: UB });
      }],
      [1, function () {
        var k = R.pick(['C', 'I', 'G', 'X', 'M', 'N']), it = R.pick(GX[k]), right = GXL[k];
        return mc('In GDP = C + I + G + NX, where does this belong? ' + it + '.', right, R.shuffle(others(['Consumption (C)', 'Investment (I)', 'Government purchases (G)', 'Net exports: an export, added', 'Net exports: an import, subtracted', 'Not part of GDP'], right)), [GXW[k]], 'Who is buying, and is it a newly produced good or service?');
      }],
      [3, function () {
        var C = R.pick([700, 750, 800]), I = R.pick([150, 180, 200]), Gv = R.pick([200, 220, 240]), X = R.pick([100, 120]), M = R.pick([140, 160, 180]), Y = C + I + Gv + X - M;
        var ask = R.pick(['C', 'M']);
        if (ask === 'C') return num('GDP is ' + bn(Y) + '. Investment is ' + bn(I) + ', government purchases ' + bn(Gv) + ', exports ' + bn(X) + ' and imports ' + bn(M) + '. What is consumption, in billions of dollars?', C,
          ['Start from $GDP = C + I + G + (X - M)$.', 'Net exports: $' + X + ' - ' + M + ' = ' + (X - M) + '$.', '$C = GDP - I - G - NX = ' + Y + ' - ' + I + ' - ' + Gv + ' - (' + (X - M) + ') = ' + C + '$ billion dollars.'], 'Rearrange the GDP identity to solve for C.', { unit: UB });
        return num('GDP is ' + bn(Y) + '. Consumption is ' + bn(C) + ', investment ' + bn(I) + ', government purchases ' + bn(Gv) + ' and exports ' + bn(X) + '. What are imports, in billions of dollars?', M,
          ['From $GDP = C + I + G + X - M$: $M = C + I + G + X - GDP$.', '$M = ' + C + ' + ' + I + ' + ' + Gv + ' + ' + X + ' - ' + Y + ' = ' + M + '$ billion dollars.'], 'Imports are subtracted, so move them to the other side.', { unit: UB });
      }]
    ])();
  });

  var CHAINS = [
    [['farmer', 'wheat'], ['miller', 'flour'], ['baker', 'bread'], ['grocer', 'bread (to shoppers)']],
    [['logger', 'logs'], ['sawmill', 'lumber'], ['furniture maker', 'tables'], ['furniture store', 'tables (to families)']],
    [['cotton farmer', 'cotton'], ['spinner', 'yarn'], ['weaver', 'cloth'], ['tailor', 'shirts (to customers)']],
    [['mine', 'iron ore'], ['steel mill', 'steel'], ['bike maker', 'bikes'], ['bike shop', 'bikes (to riders)']]
  ];
  function chain(R, n) {
    var ch = R.pick(CHAINS).slice(0, n), sales = [], s = 0;
    ch.forEach(function () { s += R.pick([10, 15, 20, 25, 30, 40]); sales.push(s); });
    return ch.map(function (st, i) { return { name: st[0], what: st[1], sale: sales[i], va: sales[i] - (i ? sales[i - 1] : 0) }; });
  }
  function chainText(st) { return st.map(function (x, i) { return 'the ' + x.name + ' sells ' + x.what + ' to ' + (i < st.length - 1 ? 'the ' + st[i + 1].name : 'the final buyers') + ' for ' + $(x.sale); }).join('; '); }
  G('macro.value-added', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var st = chain(R, R.pick([3, 4])), i = R.int(1, st.length - 1), x = st[i];
        return num('In a production chain, ' + chainText(st) + '. What is the value added by the ' + x.name + ', in dollars?', x.va,
          ['Value added = what a stage sells its output for − what it paid the stage before for inputs.', 'The ' + x.name + ' sells for ' + $(x.sale) + ' and paid ' + $(st[i - 1].sale) + ' to the ' + st[i - 1].name + '.', 'Value added $= ' + x.sale + ' - ' + st[i - 1].sale + ' = ' + x.va + '$ dollars.'], 'Subtract the cost of the inputs bought from the stage before.', { unit: 'dollars' });
      }],
      [1, function () {
        var st = chain(R, 4), sum = st.reduce(function (a, s) { return a + s.sale; }, 0), fin = st[3].sale;
        return num('In a production chain, ' + chainText(st) + '. By how many dollars does this chain add to GDP?', fin,
          ['Add each stage’s value added: ' + st.map(function (s) { return '$' + s.va + '$'; }).join(', ') + '.', 'Sum: $' + st.map(function (s) { return s.va; }).join(' + ') + ' = ' + fin + '$ dollars, the price of the final product.', 'Adding every sale ($' + sum + '$ dollars) would count the earlier stages’ output again inside each later price.'], 'GDP counts final goods only. Value added adds up to the final price.', { unit: 'dollars' });
      }],
      [2, function () {
        var sales = R.pick([200, 250, 300, 400, 500]) * 1000, mat = R.pick([60, 80, 100, 120]) * 1000, w = R.pick([50, 60, 70, 80]) * 1000, rent = R.pick([10, 15, 20]) * 1000, intr = R.pick([5, 10]) * 1000;
        var prof = sales - mat - w - rent - intr; if (prof <= 0) { sales += 100000; prof += 100000; }
        var va = sales - mat, ask = R.pick(['va', 'profit']);
        var stp = ['Value added = sales − purchased materials $= ' + cm(sales) + ' - ' + cm(mat) + ' = ' + cm(va) + '$ dollars.', 'That value is paid out as incomes: wages + rent + interest + profit. So profit $= ' + cm(va) + ' - ' + cm(w) + ' - ' + cm(rent) + ' - ' + cm(intr) + ' = ' + cm(prof) + '$ dollars.', 'Check: $' + cm(w) + ' + ' + cm(rent) + ' + ' + cm(intr) + ' + ' + cm(prof) + ' = ' + cm(va) + '$, the same total: the income approach and the value-added approach agree.'];
        return num('A furniture workshop sells ' + $(sales) + ' of tables in a year. It buys ' + $(mat) + ' of lumber and hardware from other firms, pays ' + $(w) + ' in wages, ' + $(rent) + ' in rent and ' + $(intr) + ' in interest, and keeps the rest as profit. What is its ' + (ask === 'va' ? 'value added' : 'profit') + ', in dollars?', ask === 'va' ? va : prof, ask === 'va' ? stp.slice(0, 1).concat(['The wages, rent and interest are not subtracted: they are part of the value the workshop adds, paid to the people who supplied labor, land and capital.']) : stp, ask === 'va' ? 'Only purchases from other firms are subtracted.' : 'Profit is what is left of sales after paying for materials, labor, land and borrowed money.', { unit: 'dollars' });
      }],
      [3, function () {
        var st = chain(R, 4), i = R.int(1, 3);
        return num('Along a production chain (' + st.map(function (s) { return s.name; }).join(' → ') + '), the value added at each stage is ' + st.map(function (s) { return $(s.va); }).join(', ') + ', in that order. For how much does the ' + st[i].name + ' sell its ' + st[i].what.replace(/ \(.*\)/, '') + '?', st[i].sale,
          ['Each stage’s sale price = what it paid the stage before + its own value added.', 'So the price at a stage is the running total of value added up to it.', '$' + st.slice(0, i + 1).map(function (s) { return s.va; }).join(' + ') + ' = ' + st[i].sale + '$ dollars.'], 'Add the value added at every stage up to and including this one.', { unit: 'dollars' });
      }]
    ])();
  });

  G('macro.gdp-limits', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var per = R.int(2, 18) * 5000, pop = R.pick([2, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80]), Y = per * pop * 1e6;
        var yTxt = Y >= 1e12 ? tn(Y / 1e12) : bn(Y / 1e9), e = Math.floor(Math.log10(Y) + 1e-9), m = U.fix(Y / Math.pow(10, e)), pe = Math.floor(Math.log10(pop * 1e6) + 1e-9), pm = U.fix(pop * 1e6 / Math.pow(10, pe));
        return num('A country’s GDP is ' + yTxt + ' and its population is ' + cm(pop) + ' million. What is its GDP per person, in dollars?', per,
          ['GDP per person = GDP ÷ population.', 'In scientific notation: $GDP = ' + T.num(m) + ' \\times 10^{' + e + '}$ dollars and population $= ' + T.num(pm) + ' \\times 10^{' + pe + '}$ people.', '$\\dfrac{' + T.num(m) + '}{' + T.num(pm) + '} \\times 10^{' + e + ' - ' + pe + '} = ' + T.num(U.fix(m / pm)) + ' \\times 10^{' + (e - pe) + '} = ' + cm(per) + '$ dollars per person.'], 'Divide GDP by the number of people. Watch the powers of ten: a trillion is 10^12 and a million is 10^6.', { unit: 'dollars' });
      }],
      [2, function () {
        var pa = R.pick([30000, 40000, 50000]), pb = pa + R.pick([10000, 20000, 30000]), popA = R.pick([100, 200, 300]), popB = R.pick([10, 20, 25]);
        var YA = pa * popA / 1000, YB = pb * popB / 1000, nm = R.coin() ? ['A', 'B'] : ['B', 'A']; // nm[0] is the big economy
        var right = nm[1] + ' has the higher GDP per person, even though ' + nm[0] + '’s economy is larger';
        var first = nm[0] === 'A' ? 'Country A has GDP of ' + bn(YA) + ' and ' + popA + ' million people. Country B has GDP of ' + bn(YB) + ' and ' + popB + ' million people.' : 'Country A has GDP of ' + bn(YB) + ' and ' + popB + ' million people. Country B has GDP of ' + bn(YA) + ' and ' + popA + ' million people.';
        return mc(first + ' Which statement is true?', right,
          [nm[0] + ' has the higher GDP per person, because its GDP is larger', 'The two have the same GDP per person', 'You cannot compare them without knowing their prices'],
          ['GDP per person in ' + nm[0] + ': $' + cm(YA) + '$ billion ÷ $' + popA + '$ million $= ' + cm(pa) + '$ dollars.', 'GDP per person in ' + nm[1] + ': $' + cm(YB) + '$ billion ÷ $' + popB + '$ million $= ' + cm(pb) + '$ dollars.', nm[0] + ' produces more in total, but ' + nm[1] + ' produces more per person: total GDP mostly tells you how big a country is.'], 'Divide each GDP by its population before comparing living standards.');
      }],
      [2, function () {
        var it = R.pick([
          ['A parent stays home to care for a young child instead of paying for day care.', 'Unpaid work at home is not a market transaction, so GDP leaves it out.'],
          ['Workers produce the same output in a 35-hour week instead of a 40-hour week.', 'GDP is unchanged, but people gain five hours of leisure each week.'],
          ['Factories pollute less, so the air in a city gets cleaner, with no change in output.', 'GDP does not subtract environmental damage or add cleaner air.'],
          ['Neighbors volunteer to rebuild a park.', 'Volunteer work is unpaid, so it is not counted.']
        ]);
        return mc('Which of these could make people better off without raising measured GDP?', it[0],
          R.sample(['A company builds a new factory', 'A family buys a new car', 'A city hires more teachers', 'Exports of wheat rise', 'A hospital buys new medical scanners'], 3),
          [it[1], 'The other choices are market purchases of new goods and services, which GDP counts.'], 'Look for the choice with no market purchase.');
      }],
      [3, function () {
        var gy = R.pick([2, 3, 4, 5]), gp = R.pick([0.5, 1, 1.5, 2]); if (gp >= gy) gp = 1;
        var exact = U.round((((1 + gy / 100) / (1 + gp / 100)) - 1) * 100, 2), apx = U.fix(gy - gp);
        return num('Real GDP grows ' + pc(gy) + ' in a year while the population grows ' + pc(gp) + '. About what is the growth rate of real GDP per person?', apx,
          ['GDP per person = GDP ÷ population, so its growth rate is about the growth of GDP minus the growth of population.', '$' + gy + '\\% - ' + gp + '\\% = ' + T.num(apx) + '\\%$.', 'Exactly: $\\dfrac{1 + ' + T.num(gy / 100) + '}{1 + ' + T.num(gp / 100) + '} - 1 \\approx ' + T.num(exact) + '\\%$, very close.'], 'Growth rates of a ratio subtract (approximately).', { pct: true, tol: 0.1 });
      }]
    ])();
  });

  var GOODS2 = [['pizzas', 'books'], ['apples', 'haircuts'], ['bikes', 'phones'], ['shirts', 'movie tickets']];
  function twoGoods(R) {
    var nm = R.pick(GOODS2);
    for (var t = 0; t < 50; t++) {
      var p1 = R.pick([2, 4, 5, 10]), p2 = R.pick([10, 15, 20, 25]), q1 = R.pick([100, 200, 300]), q2 = R.pick([20, 40, 50]);
      var P1 = p1 + R.pick([1, 2]), P2 = p2 + R.pick([0, 5]), Q1 = q1 + R.pick([0, 50, 100]), Q2 = q2 + R.pick([0, 10]);
      var R1 = p1 * q1 + p2 * q2, R2 = p1 * Q1 + p2 * Q2, N2 = P1 * Q1 + P2 * Q2;
      if (R2 > R1 && N2 > R2) return { nm: nm, p: [p1, p2], P: [P1, P2], q: [q1, q2], Q: [Q1, Q2], R1: R1, R2: R2, N2: N2 };
    }
    return { nm: nm, p: [4, 10], P: [5, 10], q: [100, 20], Q: [150, 20], R1: 600, R2: 800, N2: 950 };
  }
  function goodsTable(g, y1, y2) {
    var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    return '<div class="mlp-table-wrap"><table class="mlp-table"><thead><tr><th></th><th>' + y1 + '</th><th>' + y2 + '</th></tr></thead><tbody>' +
      [0, 1].map(function (i) { return '<tr><th>' + cap(g.nm[i]) + ': price</th><td>' + $(g.p[i]) + '</td><td>' + $(g.P[i]) + '</td></tr><tr><th>' + cap(g.nm[i]) + ': quantity</th><td>' + cm(g.q[i]) + '</td><td>' + cm(g.Q[i]) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  G('macro.real-gdp', function (R, ctx) {
    var y1 = R.pick([2020, 2021, 2022, 2023]), y2 = y1 + 1, g = twoGoods(R);
    var intro = 'An economy makes only ' + g.nm[0] + ' and ' + g.nm[1] + '. ' + goodsTable(g, y1, y2);
    return choose(R, ctx, [
      [1, function () {
        return num(intro + 'What is nominal GDP in ' + y2 + ', in dollars?', g.N2,
          ['Nominal GDP uses each year’s own prices: ' + y2 + ' prices times ' + y2 + ' quantities.', '$' + g.P[0] + ' \\times ' + g.Q[0] + ' + ' + g.P[1] + ' \\times ' + g.Q[1] + ' = ' + cm(g.P[0] * g.Q[0]) + ' + ' + cm(g.P[1] * g.Q[1]) + ' = ' + cm(g.N2) + '$ dollars.'], 'Multiply each good’s price by its quantity, both from the same year, and add.', { unit: 'dollars' });
      }],
      [1, function () {
        return num(intro + 'Using ' + y1 + ' as the base year, what is real GDP in ' + y2 + ', in dollars?', g.R2,
          ['Real GDP values this year’s quantities at base-year prices.', y2 + ' quantities at ' + y1 + ' prices: $' + g.p[0] + ' \\times ' + g.Q[0] + ' + ' + g.p[1] + ' \\times ' + g.Q[1] + ' = ' + cm(g.p[0] * g.Q[0]) + ' + ' + cm(g.p[1] * g.Q[1]) + ' = ' + cm(g.R2) + '$ dollars.', 'Nominal GDP in ' + y2 + ' is $' + cm(g.N2) + '$; the difference is only higher prices.'], 'Use the ' + y2 + ' quantities, but the ' + y1 + ' prices.', { unit: 'dollars' });
      }],
      [2, function () {
        var gr = U.round((g.R2 / g.R1 - 1) * 100, 1);
        return num(intro + 'With ' + y1 + ' as the base year, by what percent did real GDP grow from ' + y1 + ' to ' + y2 + '? Round to one decimal place.', gr,
          ['Real GDP in ' + y1 + ' (base year, so nominal = real): $' + g.p[0] + ' \\times ' + g.q[0] + ' + ' + g.p[1] + ' \\times ' + g.q[1] + ' = ' + cm(g.R1) + '$.', 'Real GDP in ' + y2 + ' at ' + y1 + ' prices: $' + cm(g.R2) + '$.', 'Growth $= \\dfrac{' + cm(g.R2) + ' - ' + cm(g.R1) + '}{' + cm(g.R1) + '} \\times 100 \\approx ' + T.num(gr) + '\\%$.'], 'Compare real GDP in the two years, both valued at ' + y1 + ' prices.', { pct: true, tol: 0.06 });
      }],
      [2, function () {
        var gn = R.pick([5, 6, 7, 8]), inf = R.pick([2, 3, 4]); var gr = gn - inf;
        var right = 'Real output grew by about ' + gr + '%; the rest of the rise is higher prices';
        return mc('Nominal GDP rose ' + gn + '% in a year, while the overall price level rose ' + inf + '%. Which statement is best?', right,
          ['Real output grew by about ' + gn + '%', 'Real output grew by about ' + (gn + inf) + '%', 'Real output fell, because prices rose', right],
          ['Nominal GDP can rise because more is produced or because prices are higher.', 'Real growth ≈ nominal growth − inflation $= ' + gn + '\\% - ' + inf + '\\% = ' + gr + '\\%$.'], 'Take the price increase out of the nominal growth.');
      }, 3]
    ])();
  });

  G('macro.gdp-deflator', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var Rl = R.int(3, 30) * 100, D = R.int(101, 130), N = Rl * D / 100;
        return num('Nominal GDP is ' + bn(N) + ' and real GDP is ' + bn(Rl) + '. What is the GDP deflator?', D,
          ['GDP deflator $= \\dfrac{\\text{nominal GDP}}{\\text{real GDP}} \\times 100$.', '$\\dfrac{' + cm(N) + '}{' + cm(Rl) + '} \\times 100 = ' + T.num(U.fix(N / Rl)) + ' \\times 100 = ' + D + '$.', 'Prices are ' + (D - 100) + '% higher than in the base year.'], 'Nominal on top, real on the bottom, then times 100.');
      }],
      [2, function () {
        var Rl = R.pick([400, 500, 600, 800, 1000, 1500]), D = R.pick([105, 110, 115, 120, 125, 150]), N = Rl * D / 100;
        return num('Nominal GDP is ' + bn(N) + ' and the GDP deflator is ' + D + '. What is real GDP, in billions of dollars?', Rl,
          ['Real GDP $= \\dfrac{\\text{nominal GDP}}{\\text{deflator}/100}$.', '$\\dfrac{' + cm(N) + '}{' + T.num(D / 100) + '} = ' + cm(Rl) + '$ billion dollars.', 'Real GDP is smaller than nominal because prices are above their base-year level.'], 'Divide by the deflator over 100.', { unit: UB });
      }],
      [2, function () {
        var Rl = R.pick([400, 500, 600, 800, 1000]), D = R.pick([90, 95, 105, 110, 120]), N = Rl * D / 100;
        return num('Real GDP is ' + bn(Rl) + ' and the GDP deflator is ' + D + '. What is nominal GDP, in billions of dollars?', N,
          ['From deflator $= \\dfrac{N}{R} \\times 100$: $N = R \\times \\dfrac{\\text{deflator}}{100}$.', '$' + cm(Rl) + ' \\times ' + T.num(D / 100) + ' = ' + cm(N) + '$ billion dollars.', D < 100 ? 'A deflator below 100 means prices are lower than in the base year, so nominal GDP is below real GDP.' : 'Prices are higher than in the base year, so nominal GDP is above real GDP.'], 'Multiply real GDP by the deflator over 100.', { unit: UB });
      }],
      [3, function () {
        var D1 = R.pick([100, 110, 120, 125, 140, 150, 160, 200]), g = R.pick([2, 3, 4, 5, 6, 8, 10]); var D2 = U.fix(D1 * (1 + g / 100));
        return num('The GDP deflator is ' + T.num(D1) + ' in one year and ' + T.num(D2) + ' the next. What was the inflation rate, measured by the deflator?', g,
          ['Inflation is the percent change in the price index.', '$\\dfrac{' + T.num(D2) + ' - ' + T.num(D1) + '}{' + T.num(D1) + '} \\times 100 = ' + g + '\\%$.'], 'Percent change: new minus old, over old.', { pct: true });
      }],
      [1, function () {
        return tf('True or false: in the base year, the GDP deflator equals 100.', true, ['True. In the base year, real GDP uses that year’s own prices, so nominal GDP = real GDP and the ratio times 100 is 100.'], 'Compare nominal and real GDP in the base year.');
      }, 1]
    ])();
  });


  // =====================================================================================================
  // Unit 2: Unemployment, Inflation and the Business Cycle
  // =====================================================================================================

  var LF_PEOPLE = [
    ['works 10 hours a week at a café and would like more hours', 'Employed', 'Anyone who did any work for pay counts as employed, part-time included.'],
    ['works full time as a bus driver', 'Employed', 'Working for pay counts as employed.'],
    ['works 20 unpaid hours a week in the family’s store', 'Employed', 'The Bureau of Labor Statistics counts unpaid work of 15 hours or more in a family business as employment.'],
    ['lost her job last month and has applied for five jobs since', 'Unemployed', 'No job, available, and looked for work in the past four weeks: unemployed.'],
    ['was laid off temporarily and expects to be called back to the factory next month', 'Unemployed', 'People on temporary layoff waiting to be recalled count as unemployed even if they are not searching.'],
    ['just finished school, has no job, and has been sending out applications this week', 'Unemployed', 'No job and actively looking: unemployed.'],
    ['retired at 66 and is not looking for work', 'Not in the labor force', 'Retirees who are not looking for work are outside the labor force.'],
    ['is a full-time student who is not working and not looking for a job', 'Not in the labor force', 'Students who are not working or looking are outside the labor force.'],
    ['wants a job but stopped looking six months ago, believing none are available', 'Not in the labor force', 'A discouraged worker has not looked in the past four weeks, so he is not counted as unemployed.'],
    ['stays home to care for her children and is not looking for paid work', 'Not in the labor force', 'Not working for pay and not looking: outside the labor force.']
  ];
  G('macro.labor-force', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var who = R.pick(['Maya', 'Luis', 'Grace', 'Omar', 'Ana', 'Ben', 'Kenji', 'Rosa']), it = R.pick(LF_PEOPLE);
        return mc(who + ' ' + it[0] + '. How does the official survey count ' + who + '?', it[1], others(['Employed', 'Unemployed', 'Not in the labor force'], it[1]), [it[2], 'Unemployed means: no job, available for work, and looked for work in the past four weeks (or on temporary layoff).'], 'Did this person work for pay? If not, did they look for work in the past four weeks?', { keep: true });
      }],
      [1, function () {
        var E = R.pick([120, 140, 150, 160, 180]), Un = R.pick([6, 8, 9, 10, 12]), ret = R.pick([30, 40, 45]), stu = R.pick([12, 15, 20]), dis = R.pick([1, 2, 3]), home = R.pick([8, 10, 12]);
        return num('In a country (all counts in millions of adults): ' + E + ' have jobs, ' + Un + ' have no job and are looking for one, ' + ret + ' are retired, ' + stu + ' are full-time students not looking for work, ' + home + ' care for family at home and ' + dis + ' want a job but have stopped looking. How big is the labor force, in millions?', E + Un,
          ['The labor force is everyone employed plus everyone unemployed (no job and looking).', '$' + E + ' + ' + Un + ' = ' + (E + Un) + '$ million.', 'Retirees, students, people caring for family at home and discouraged workers are not in the labor force.'], 'Only two of the groups count.', { unit: 'million' });
      }],
      [2, function () {
        var E = R.pick([140, 150, 160]), Un = R.pick([7, 8, 10]), out = R.pick([60, 70, 80, 90]), pop = E + Un + out;
        return num('A country has ' + pop + ' million adults (16 and older, not in an institution). ' + E + ' million are employed and ' + Un + ' million are unemployed. How many adults, in millions, are not in the labor force?', out,
          ['Labor force = employed + unemployed $= ' + E + ' + ' + Un + ' = ' + (E + Un) + '$ million.', 'Not in the labor force = adults − labor force $= ' + pop + ' - ' + (E + Un) + ' = ' + out + '$ million.'], 'First find the labor force.', { unit: 'million' });
      }],
      [2, function () {
        var it = R.pick([['A discouraged worker who has stopped looking for work is counted as unemployed.', false, 'False. Without a search in the past four weeks, a discouraged worker is outside the labor force.'], ['A person working part time who wants full-time work is counted as employed.', true, 'True. Any paid work counts; such a person is "underemployed", but still employed in the official count.'], ['Every adult without a job is unemployed.', false, 'False. Only those available and looking (or on temporary layoff) are unemployed; retirees and students who are not looking are outside the labor force.'], ['A person on temporary layoff who expects to be recalled is counted as unemployed.', true, 'True. The survey counts people on temporary layoff as unemployed.']]);
        return tf('True or false: ' + it[0], it[1], [it[2]], 'Use the survey’s definitions, not everyday meanings.');
      }, 2]
    ])();
  });

  G('macro.unemployment-rate', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var LF, u, t = 0; do { LF = R.int(5, 90) * 10; u = R.int(3, 15); t++; } while ((LF * u) % 100 && t < 60);
        if ((LF * u) % 100) { LF = 100; u = R.int(3, 12); }
        var Un = LF * u / 100, E = LF - Un, unit = R.pick(['million', 'million', 'thousand']);
        return num(cm(E) + ' ' + unit + ' people are employed and ' + cm(Un) + ' ' + unit + ' are unemployed. What is the unemployment rate?', u,
          ['Labor force $= ' + cm(E) + ' + ' + cm(Un) + ' = ' + LF + '$ ' + unit + '.', 'Unemployment rate $= \\dfrac{\\text{unemployed}}{\\text{labor force}} \\times 100 = \\dfrac{' + cm(Un) + '}{' + LF + '} \\times 100 = ' + u + '\\%$.'], 'Divide the unemployed by the labor force (employed + unemployed).', { pct: true });
      }],
      [2, function () {
        var LF = R.pick([100, 120, 150, 160, 200]), u = R.pick([4, 5, 6, 8, 10]), Un = LF * u / 100, E = LF - Un, out = R.pick([50, 60, 80, 100]), pop = LF + out;
        return num('A country has ' + pop + ' million adults: ' + cm(E) + ' million employed, ' + cm(Un) + ' million unemployed and the rest not in the labor force. What is the unemployment rate?', u,
          ['Labor force $= ' + cm(E) + ' + ' + cm(Un) + ' = ' + LF + '$ million (not the ' + pop + ' million adults).', 'Unemployment rate $= \\dfrac{' + cm(Un) + '}{' + LF + '} \\times 100 = ' + u + '\\%$.', 'Dividing by all adults would give $' + T.num(r1(Un / pop * 100)) + '\\%$, which is wrong.'], 'The denominator is the labor force, not the whole adult population.', { pct: true, viz: { name: 'ec-laborforce', opts: { counts: { employed: E, unemployed: Un, students: Math.round(out * 0.3), retired: out - Math.round(out * 0.3) - Math.round(out * 0.15) - 2, caregivers: Math.round(out * 0.15), discouraged: 2 }, perIcon: LF >= 150 ? 10 : 5, scenarios: false, quiet: true, interactive: false } } });
      }],
      [2, function () {
        var LF = R.pick([100, 125, 150, 200, 250]), pop = LF + R.pick([50, 75, 100]), p = U.round(LF / pop * 100, 1);
        return num('A country has ' + pop + ' million adults, and its labor force is ' + LF + ' million. What is its labor force participation rate? Round to one decimal place if needed.', p,
          ['Participation rate $= \\dfrac{\\text{labor force}}{\\text{adult population}} \\times 100$.', '$\\dfrac{' + LF + '}{' + pop + '} \\times 100 \\approx ' + T.num(p) + '\\%$.'], 'Labor force over adults.', { pct: true, tol: 0.06 });
      }],
      [2, function () {
        var LF = R.pick([80, 100, 120, 150, 200]), u = R.pick([4, 5, 6, 7, 8]), Un = LF * u / 100;
        return num('The labor force is ' + LF + ' million and the unemployment rate is ' + u + '%. How many people are unemployed, in millions?', Un,
          ['Unemployed = rate × labor force.', '$' + T.num(u / 100) + ' \\times ' + LF + ' = ' + T.num(Un) + '$ million.'], 'Turn the percent into a decimal and multiply.', { unit: 'million' });
      }],
      [3, function () {
        var E = R.pick([90, 92, 94, 95]), Un = 100 - E, d = R.pick([1, 2]), nu = U.round((Un - d) / (100 - d) * 100, 1);
        return num('There are ' + E + ' million employed and ' + Un + ' million unemployed workers. Then ' + d + ' million of the unemployed give up looking for work. What is the new unemployment rate? Round to one decimal place.', nu,
          ['Before: $\\dfrac{' + Un + '}{' + (E + Un) + '} = ' + Un + '\\%$.', 'Discouraged workers leave the labor force: unemployed $= ' + Un + ' - ' + d + ' = ' + (Un - d) + '$ million, labor force $= ' + (E + Un) + ' - ' + d + ' = ' + (E + Un - d) + '$ million.', 'New rate $= \\dfrac{' + (Un - d) + '}{' + (E + Un - d) + '} \\times 100 \\approx ' + T.num(nu) + '\\%$.', 'The rate fell, yet no one found a job.'], 'People who stop looking leave both the top and the bottom of the fraction.', { pct: true, tol: 0.06 });
      }]
    ])();
  });

  var UTYPES = {
    Frictional: ['A nurse quits her job to move to a new city and is interviewing at hospitals there.', 'A new college graduate is searching for his first job.', 'A programmer left a job she disliked and is looking for a better fit.', 'A teacher moves across the state with his family and is applying to schools near the new home.', 'An accountant turns down two offers while waiting for one that pays better.', 'A worker quits to look for a job closer to home and is going to interviews.'],
    Structural: ['A typesetter’s skills are no longer needed after printing went digital.', 'A cashier is replaced by self-checkout machines and needs new training to find work.', 'A factory moves overseas, and the machine operators lack the skills that local employers want.', 'Coal mines in a region close, and the jobs that are open there need different skills.', 'Travel agents lose work as people book trips online, and the open jobs need computer skills they lack.', 'A film-camera repair technician finds that almost no one uses film cameras anymore.'],
    Cyclical: ['A construction worker is laid off when home building drops during a recession.', 'A car plant cuts a shift because sales fell in a recession.', 'A restaurant lets servers go when diners cut back during an economic downturn.', 'A furniture maker lays off workers as spending falls across the economy.', 'A hotel lays off staff as business travel drops in a nationwide recession.', 'A steel mill cuts jobs as orders from carmakers fall during a slump.']
  };
  G('macro.types-unemployment', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var k = R.pick(['Frictional', 'Structural', 'Cyclical']), it = R.pick(UTYPES[k]);
        var why = { Frictional: 'The worker is between jobs while searching for a good match: frictional.', Structural: 'The worker’s skills (or location) no longer match the jobs available: structural. A recovery alone would not bring this job back.', Cyclical: 'The job loss comes from a fall in spending across the whole economy: cyclical.' };
        return mc(it + ' What type of unemployment is this?', k, others(['Frictional', 'Structural', 'Cyclical'], k), [why[k], 'Frictional + structural unemployment make up the natural rate; cyclical unemployment rises in recessions.'], 'Ask why the job is missing: searching, a skills mismatch, or a slump in spending?', { keep: true });
      }],
      [2, function () {
        var f = R.pick([1, 1.2, 1.5, 1.8, 2, 2.5, 3]), s = R.pick([1.5, 2, 2.2, 2.5, 3]), nat = U.fix(f + s);
        return num('Frictional unemployment is ' + f + '% and structural unemployment is ' + s + '%. What is the natural rate of unemployment?', nat,
          ['The natural rate is the unemployment that remains at full employment: frictional + structural.', '$' + f + '\\% + ' + s + '\\% = ' + T.num(nat) + '\\%$.'], 'Which two types make up the natural rate?', { pct: true });
      }],
      [2, function () {
        var f = R.pick([1.5, 1.8, 2, 2.5]), s = R.pick([1.5, 2, 2.5, 3]), cy = R.pick([0.5, 1, 1.5, 2, 3, 4]), act = U.fix(f + s + cy);
        return num('The unemployment rate is ' + act + '%. Frictional unemployment is ' + f + '% and structural unemployment is ' + s + '%. What is the cyclical unemployment rate?', cy,
          ['Natural rate $= ' + f + '\\% + ' + s + '\\% = ' + T.num(U.fix(f + s)) + '\\%$.', 'Cyclical = actual − natural $= ' + act + '\\% - ' + T.num(U.fix(f + s)) + '\\% = ' + T.num(cy) + '\\%$.', 'Cyclical unemployment is the part caused by a weak economy.'], 'Subtract the natural rate from the actual rate.', { pct: true });
      }],
      [1, function () {
        return tf('True or false: at full employment, the unemployment rate is 0%.', false, ['False. Even at full employment some people are between jobs (frictional) or need new skills (structural). Full employment means cyclical unemployment is zero; the rate equals the natural rate, which is above 0.'], 'Which types of unemployment exist even in a healthy economy?');
      }, 2]
    ])();
  });

  var BASKETS = [[['Bread (loaves)', 2, 3], ['Gasoline (gallons)', 3, 10], ['Haircuts', 20, 1]], [['Apples (pounds)', 2, 5], ['Bus rides', 2, 10], ['Movie tickets', 10, 2]], [['Milk (gallons)', 4, 5], ['Notebooks', 2, 10], ['Phone plan (months)', 40, 1]]];
  function basket(R) { // returns goods with base and current prices so the index is a whole number
    for (var t = 0; t < 200; t++) {
      var b = R.pick(BASKETS), goods = b.map(function (g) { return { name: g[0], q: g[2], p0: g[1], p1: U.fix(g[1] + R.pick([0, 0.5, 1, 2, 5])) }; });
      var c0 = goods.reduce(function (s, g) { return s + g.q * g.p0; }, 0), c1 = goods.reduce(function (s, g) { return s + U.fix(g.q * g.p1); }, 0);
      c1 = U.fix(c1); var ix = U.fix(c1 / c0 * 100);
      if (ix > 100 && Math.abs(ix * 10 - Math.round(ix * 10)) < 1e-9 && ix < 160) return { goods: goods, c0: c0, c1: c1, ix: ix };
    }
    return null;
  }
  function basketTable(bk, y0, y1) {
    return '<div class="mlp-table-wrap"><table class="mlp-table"><thead><tr><th>Item</th><th>Quantity</th><th>' + y0 + ' price</th><th>' + y1 + ' price</th></tr></thead><tbody>' + bk.goods.map(function (g) { return '<tr><th>' + g.name + '</th><td>' + g.q + '</td><td>' + $(g.p0) + '</td><td>' + $(g.p1) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  G('macro.price-index', function (R, ctx) {
    var y0 = R.pick([2018, 2019, 2020, 2021]), y1 = y0 + R.pick([1, 2, 3]);
    return choose(R, ctx, [
      [1, function () {
        var bk = basket(R);
        return num('A basket of goods costs ' + $(bk.c0) + ' in ' + y0 + ', the base year, and ' + $(bk.c1) + ' in ' + y1 + '. What is the price index for ' + y1 + '?', bk.ix,
          ['Index $= \\dfrac{\\text{cost of the basket this year}}{\\text{cost in the base year}} \\times 100$.', '$\\dfrac{' + T.num(bk.c1) + '}{' + T.num(bk.c0) + '} \\times 100 = ' + T.num(bk.ix) + '$.', 'Prices are ' + T.num(U.fix(bk.ix - 100)) + '% higher than in the base year.'], 'This year’s cost over the base year’s cost, times 100.');
      }],
      [2, function () {
        var bk = basket(R);
        return num('A typical family buys this basket. ' + basketTable(bk, y0, y1) + 'With ' + y0 + ' as the base year, what is the price index for ' + y1 + '?', bk.ix,
          ['Cost in ' + y0 + ': ' + bk.goods.map(function (g) { return '$' + g.q + ' \\times ' + T.num(g.p0) + '$'; }).join(' + ') + ' $= ' + T.num(bk.c0) + '$ dollars.', 'Cost in ' + y1 + ' (same quantities): ' + bk.goods.map(function (g) { return '$' + g.q + ' \\times ' + T.num(g.p1) + '$'; }).join(' + ') + ' $= ' + T.num(bk.c1) + '$ dollars.', 'Index $= \\dfrac{' + T.num(bk.c1) + '}{' + T.num(bk.c0) + '} \\times 100 = ' + T.num(bk.ix) + '$.'], 'Keep the quantities fixed; only the prices change.');
      }],
      [1, function () {
        var ix = R.pick([108, 112, 115, 120, 125, 130, 140, 150, 96]);
        return num('The consumer price index is ' + ix + ' (base period = 100). By what percent are prices ' + (ix >= 100 ? 'higher' : 'lower') + ' than in the base period?', Math.abs(ix - 100),
          ['An index compares prices with the base period, which is set to 100.', '$' + ix + ' - 100 = ' + (ix - 100) + '$, so prices are ' + Math.abs(ix - 100) + '% ' + (ix >= 100 ? 'higher' : 'lower') + '.', 'An index of ' + ix + ' is not a price of \\$' + ix + ': it has no dollar units.'], 'Compare the index with 100.', { pct: true });
      }],
      [3, function () {
        var a = R.pick([80, 100, 120, 125]), b = R.pick([110, 120, 150, 160, 200]); if (b <= a) b = a + 40;
        var v = U.round(b / a * 100, 1);
        return num('A price index is ' + a + ' in ' + y0 + ' and ' + b + ' in ' + y1 + '. If the base year is changed to ' + y0 + ' (so ' + y0 + ' = 100), what is the index for ' + y1 + '? Round to one decimal place if needed.', v,
          ['Changing the base divides every value by the new base year’s value and multiplies by 100.', '$\\dfrac{' + b + '}{' + a + '} \\times 100 \\approx ' + T.num(v) + '$.'], 'The new base year’s value becomes 100.', { tol: 0.06 });
      }],
      [2, function () {
        var right = 'It tends to overstate inflation, because people switch to cheaper goods and quality improves';
        return mc('How does the consumer price index, with its fixed basket, tend to measure changes in the cost of living?', right,
          ['It tends to understate inflation, because it leaves out new products', 'It measures the cost of living exactly, because the basket is fixed', 'It tends to understate inflation, because people buy more as prices rise'],
          ['Substitution bias: when one price jumps, people buy less of it and more of something cheaper, but a fixed basket assumes they keep buying the same amounts.', 'Quality and new goods: a product that gets better at the same price is a better deal, which the index can miss.', 'Both make the index rise a little faster than the true cost of living.'], 'What do people do when one good gets expensive?');
      }]
    ])();
  });

  G('macro.inflation-rate', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var a, g, t = 0; do { a = R.int(20, 60) * 5; g = R.int(1, 12); t++; } while ((a * g) % 10 && t < 60);
        if ((a * g) % 10) { a = 100; g = R.int(1, 12); }
        var b = U.fix(a * (1 + g / 100));
        return num('The consumer price index rose from ' + T.num(a) + ' to ' + T.num(b) + ' in one year. What was the inflation rate?', g,
          ['Inflation rate $= \\dfrac{\\text{new} - \\text{old}}{\\text{old}} \\times 100$.', '$\\dfrac{' + T.num(b) + ' - ' + T.num(a) + '}{' + T.num(a) + '} \\times 100 = \\dfrac{' + T.num(U.fix(b - a)) + '}{' + T.num(a) + '} \\times 100 = ' + g + '\\%$.'], 'Percent change: divide the change by the starting value.', { pct: true });
      }],
      [2, function () {
        var a = R.pick([120, 125, 150, 160, 200]), g = R.pick([-2, -1, 2, 4, 5, 6]), b = U.fix(a * (1 + g / 100));
        return num('A price index goes from ' + T.num(a) + ' one year to ' + T.num(b) + ' the next. What is the inflation rate? (Use a negative number if prices fell.)', g,
          ['$\\dfrac{' + T.num(b) + ' - ' + T.num(a) + '}{' + T.num(a) + '} \\times 100 = ' + T.num(g) + '\\%$.', g < 0 ? 'A negative inflation rate means the price level fell: deflation.' : 'The price level rose: inflation.'], 'Keep the sign of the change.', { pct: true });
      }],
      [2, function () {
        var i0 = 100, i1 = R.pick([104, 105, 106]), g2 = R.pick(['dis', 'def', 'acc']), i2 = g2 === 'dis' ? i1 + 2 : g2 === 'def' ? i1 - 2 : i1 + 8;
        var inf1 = (i1 - i0), inf2 = U.round((i2 - i1) / i1 * 100, 1);
        var right = g2 === 'dis' ? 'Disinflation: prices still rose, but more slowly' : g2 === 'def' ? 'Deflation: the price level fell' : 'Inflation sped up: prices rose faster';
        return mc('The CPI was 100 in year 1, ' + i1 + ' in year 2 and ' + i2 + ' in year 3. Which describes year 3?', right,
          ['Disinflation: prices still rose, but more slowly', 'Deflation: the price level fell', 'Inflation sped up: prices rose faster', 'Prices did not change'].filter(function (x) { return x !== right; }),
          ['Year 2 inflation: $\\dfrac{' + i1 + ' - 100}{100} \\times 100 = ' + inf1 + '\\%$.', 'Year 3 inflation: $\\dfrac{' + i2 + ' - ' + i1 + '}{' + i1 + '} \\times 100 \\approx ' + T.num(inf2) + '\\%$.', g2 === 'dis' ? 'The rate fell but stayed above zero: the price level still rose. That is disinflation, not deflation.' : g2 === 'def' ? 'The index fell, so the inflation rate is negative: deflation.' : 'The rate rose from ' + inf1 + '% to about ' + T.num(inf2) + '%.'], 'Find each year’s inflation rate, then compare them.');
      }],
      [3, function () {
        var a = R.pick([100, 120, 150, 200, 250]), g = R.pick([2, 3, 4, 5, 6, 10]), b = U.fix(a * (1 + g / 100));
        return num('The price index is ' + T.num(a) + ' this year. If inflation next year is ' + g + '%, what will the index be?', b,
          ['Next year’s index = this year’s × (1 + inflation rate).', '$' + T.num(a) + ' \\times ' + T.num(U.fix(1 + g / 100)) + ' = ' + T.num(b) + '$.'], 'Grow the index by the inflation rate.');
      }]
    ])();
  });

  G('macro.real-values', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var ix = R.int(21, 50) * 5, real = R.int(18, 90) * 1000, nom = real * ix / 100;
        return num('A worker earns ' + $(nom) + ' this year. The price index is ' + ix + ' (base year = 100). What is the salary in base-year dollars?', real,
          ['Real value $= \\dfrac{\\text{nominal value}}{\\text{index}/100}$.', '$\\dfrac{' + cm(nom) + '}{' + T.num(ix / 100) + '} = ' + cm(real) + '$ dollars.', 'Prices are ' + (ix - 100) + '% higher than in the base year, so each dollar buys less.'], 'Divide by the index over 100; do not multiply.', { unit: 'dollars' });
      }],
      [2, function () {
        var pr = R.pick([[1980, 80, 2020, 260], [1990, 130, 2020, 260], [2000, 170, 2020, 255], [1975, 50, 2015, 240], [1985, 105, 2025, 315]]), amt = R.pick([2, 4, 5, 10, 20]);
        var v = U.fix(amt * pr[3] / pr[1]);
        return num('A movie ticket cost ' + $(amt) + ' in ' + pr[0] + ', when the price index was ' + pr[1] + '. The index is ' + pr[3] + ' in ' + pr[2] + '. What is the ' + pr[0] + ' price in ' + pr[2] + ' dollars? Round to the nearest cent.', U.round(v, 2),
          ['To move an amount from one year’s dollars to another’s, multiply by the ratio of the indexes: $\\text{amount} \\times \\dfrac{\\text{index}_{' + pr[2] + '}}{\\text{index}_{' + pr[0] + '}}$.', '$' + T.num(amt) + ' \\times \\dfrac{' + pr[3] + '}{' + pr[1] + '} \\approx ' + T.num(U.round(v, 2)) + '$ dollars.'], 'Prices rose between the years, so the old price is worth more of today’s dollars.', { unit: 'dollars', tol: 0.011 });
      }],
      [2, function () {
        var w1 = R.pick([10, 12, 15, 16, 20]), i1 = 100, i2 = R.pick([120, 125, 150]), w2 = U.fix(w1 * R.pick([1.1, 1.2, 1.25, 1.3, 1.4, 1.5, 1.6]));
        var real2 = U.fix(w2 / (i2 / 100)), right = real2 > w1 + 1e-9 ? 'The real wage rose' : real2 < w1 - 1e-9 ? 'The real wage fell' : 'The real wage did not change';
        return mc('A worker’s hourly wage went from ' + $(w1) + ' (price index ' + i1 + ') to ' + $(w2) + ' (price index ' + i2 + '). What happened to the real wage?', right, others(['The real wage rose', 'The real wage fell', 'The real wage did not change'], right),
          ['Put the new wage in the old year’s dollars: $\\dfrac{' + T.num(w2) + '}{' + T.num(i2 / 100) + '} = ' + T.num(r2(real2)) + '$ dollars.', 'Compare with ' + $(w1) + ': ' + (right === 'The real wage rose' ? 'more buying power.' : right === 'The real wage fell' ? 'less buying power, even though the paycheck number grew.' : 'the same buying power.')], 'Remove the price rise before you compare.', { keep: true });
      }],
      [3, function () {
        var gw = R.pick([3, 4, 5, 6, 8]), inf = R.pick([2, 3, 4, 5, 6, 7]); if (gw === inf) inf = gw + 2;
        return num('Nominal wages rise ' + gw + '% this year and prices rise ' + inf + '%. About how much does the real wage change? (Use a negative number for a fall.)', U.fix(gw - inf),
          ['Real wage growth ≈ nominal wage growth − inflation.', '$' + gw + '\\% - ' + inf + '\\% = ' + T.num(U.fix(gw - inf)) + '\\%$.'], 'Subtract the inflation rate from the raise.', { pct: true, tol: 0.35 });
      }]
    ])();
  });

  var INF_WHO = [
    ['A family with a fixed-rate mortgage at 4%', 'Gains', 'They repay with dollars that buy less than expected, so the real cost of the loan falls.'],
    ['A bank that made fixed-rate loans at 5%', 'Loses', 'The dollars it gets back buy less than it planned on, so its real return falls.'],
    ['A retiree with a pension fixed at \\$2,000 a month, not adjusted for inflation', 'Loses', 'The same dollars buy less each month.'],
    ['A saver holding cash in a drawer', 'Loses', 'Cash earns no interest, and each dollar buys less.'],
    ['A worker whose contract raises pay automatically with the price level', 'About the same', 'Pay rises with prices, so buying power is roughly protected.'],
    ['A student who borrowed at a fixed rate of 6%', 'Gains', 'She repays in dollars worth less than expected.']
  ];
  G('macro.costs-of-inflation', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var it = R.pick(INF_WHO);
        return mc('Inflation turns out much higher than anyone expected. How does this affect: ' + it[0].charAt(0).toLowerCase() + it[0].slice(1) + '?', it[1], others(['Gains', 'Loses', 'About the same'], it[1]), [it[2], 'Unexpected inflation moves buying power from lenders to borrowers and hurts people whose incomes or savings are fixed in dollars.'], 'Is this person paid back, or paying back, in fixed dollars?', { keep: true });
      }],
      [1, function () {
        var it = R.pick([['A restaurant reprints its menus every few months to update prices.', 'Menu costs'], ['People make extra trips to the bank so they hold less cash that loses value.', 'Shoe-leather costs'], ['A business has trouble telling whether its rising profits are real or just higher prices.', 'Confusion about the unit of account'], ['A store pays workers to put new price tags on shelves each week.', 'Menu costs']]);
        var why = { 'Menu costs': 'Menu costs are the costs of changing posted prices.', 'Shoe-leather costs': 'Shoe-leather costs are the time and effort spent holding less cash (the name comes from wearing out shoes walking to the bank).', 'Confusion about the unit of account': 'When the dollar’s value keeps changing, prices and profits are harder to compare over time.' };
        return mc(it[0] + ' Which cost of inflation is this?', it[1], others(['Menu costs', 'Shoe-leather costs', 'Confusion about the unit of account', 'Lower real GDP'], it[1]), [why[it[1]], 'These costs come with inflation even when it is expected.'], 'Is the cost about changing prices, about holding cash, or about measuring value?');
      }, 2],
      [2, function () {
        var i = R.pick([5, 6, 7, 8]), pe = R.pick([2, 3]), pa = pe + R.pick([2, 3, 4]), rr = i - pa, re = i - pe;
        return num('A bank lends at a fixed ' + i + '% nominal rate, expecting ' + pe + '% inflation. Inflation turns out to be ' + pa + '%. About what real interest rate does the bank actually earn? (Use a negative number if needed.)', rr,
          ['Real rate ≈ nominal rate − inflation.', 'Expected: $' + i + '\\% - ' + pe + '\\% = ' + re + '\\%$. Actual: $' + i + '\\% - ' + pa + '\\% = ' + rr + '\\%$.', 'The surprise inflation moved ' + (re - rr) + ' percentage points of real return from the bank (the lender) to the borrower.'], 'Use the inflation that actually happened.', { pct: true, tol: 0.2 });
      }],
      [3, function () {
        var gw = R.pick([4, 5, 6, 8]), inf = gw;
        return tf('Prices rise ' + inf + '% this year and so do all wages, by ' + gw + '%. True or false: workers’ buying power falls by ' + inf + '%.', false, ['False. If wages rise as fast as prices, the real wage is unchanged: real wage growth ≈ $' + gw + '\\% - ' + inf + '\\% = 0$.', 'Inflation does not make everyone poorer by the inflation rate; what matters is whether incomes keep up.'], 'Compare the growth of wages with the growth of prices.');
      }]
    ])();
  });

  var CYCLES = [
    [100, 103, 106, 108, 106, 103, 105, 109, 113],
    [200, 206, 211, 214, 210, 207, 212, 218, 223],
    [100, 102, 105, 107, 109, 106, 104, 107, 111],
    [150, 154, 157, 155, 151, 149, 153, 158, 162]
  ];
  function phaseAt(s, i) {
    if (i > 0 && i < s.length - 1) { if (s[i] > s[i - 1] && s[i] > s[i + 1]) return 'Peak'; if (s[i] < s[i - 1] && s[i] < s[i + 1]) return 'Trough'; }
    var up = i < s.length - 1 ? s[i + 1] > s[i] : s[i] > s[i - 1];
    return up ? 'Expansion' : 'Contraction';
  }
  G('macro.business-cycle', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var s = R.pick(CYCLES), i = R.int(1, s.length - 2), ph = phaseAt(s, i), lbl = 'ABCDEFGHI';
        var marks = s.map(function (v, j) { return { label: lbl[j], x: j, y: v }; });
        var stp = ph === 'Peak' ? 'At ' + lbl[i] + ' real GDP is higher than in the periods just before and after it: a peak, where an expansion ends.' : ph === 'Trough' ? 'At ' + lbl[i] + ' real GDP is lower than just before and after: a trough, where a contraction ends.' : ph === 'Expansion' ? 'Real GDP is rising from ' + lbl[i] + ' to ' + lbl[i + 1] + ': an expansion.' : 'Real GDP is falling from ' + lbl[i] + ' to ' + lbl[i + 1] + ': a contraction.';
        return mc('The graph shows real GDP over several years, with points A to ' + lbl[s.length - 1] + '. Which phase of the business cycle is the economy in at point ' + lbl[i] + '?', ph, others(['Expansion', 'Peak', 'Contraction', 'Trough'], ph), [stp, 'Order of the phases: expansion → peak → contraction → trough → expansion.'], 'Is real GDP rising or falling around this point, or does it turn here?', { keep: true, viz: { name: 'ec-cycle', opts: { series: s, show: ['trend'], marks: marks, quiet: true, interactive: false, xLabel: 'Year', yLabel: 'Real GDP' } } });
      }],
      [2, function () {
        var s = R.pick(CYCLES), tr = 0; for (var j = 1; j < s.length - 1; j++) if (s[j] < s[j - 1] && s[j] < s[j + 1]) tr = j;
        var tab = '<div class="mlp-table-wrap"><table class="mlp-table"><thead><tr><th>Year</th><th>Real GDP</th></tr></thead><tbody>' + s.map(function (v, j) { return '<tr><td>' + (j + 1) + '</td><td>' + v + '</td></tr>'; }).join('') + '</tbody></table></div>';
        return num('Real GDP (in billions of base-year dollars) for nine years: ' + tab + 'In which year was the trough of the recession?', tr + 1,
          ['A trough is the lowest point of a contraction: real GDP is lower than in the year before and the year after.', 'Real GDP falls until year ' + (tr + 1) + ' (' + s[tr] + ') and rises after it, so year ' + (tr + 1) + ' is the trough.'], 'Find where real GDP stops falling and starts rising.');
      }],
      [2, function () {
        var g1 = R.pick([3, 3.5, 4]), g2 = R.pick([0.5, 1, 1.5]);
        return mc('Real GDP grew ' + g1 + '% last year and ' + g2 + '% this year. Which phase is the economy in this year?', 'Expansion: real GDP is still rising, just more slowly',
          ['Contraction: growth slowed down', 'Trough: growth hit its lowest point', 'Recession: growth fell by more than half'],
          ['A contraction means real GDP falls. Here it still rose ' + g2 + '%.', 'Slower growth is still growth, so the economy is in an expansion.'], 'Did real output go down, or just grow more slowly?');
      }],
      [3, function () {
        var Yp = R.pick([400, 500, 800, 1000]), gp = R.pick([-5, -4, -3, -2, 2, 3]), Y = U.fix(Yp * (1 + gp / 100));
        return num('Potential real GDP is ' + bn(Yp) + ' and actual real GDP is ' + bn(Y) + '. What is the output gap as a percent of potential output? (Negative if output is below potential.)', gp,
          ['Output gap $= \\dfrac{\\text{actual} - \\text{potential}}{\\text{potential}} \\times 100$.', '$\\dfrac{' + T.num(Y) + ' - ' + Yp + '}{' + Yp + '} \\times 100 = ' + gp + '\\%$.', gp < 0 ? 'Output is below potential: a recessionary gap.' : 'Output is above potential for now: an inflationary gap.'], 'Actual minus potential, over potential.', { pct: true });
      }]
    ])();
  });


  // =====================================================================================================
  // Unit 3: Aggregate Demand and Aggregate Supply
  // =====================================================================================================

  var ADE = {
    w: ['The price level falls, so the money in people’s bank accounts buys more. Feeling richer, they spend more.', 'The price level rises, so people’s savings buy less, and they cut back on spending.', 'With lower prices, a family’s \\$10,000 of savings stretches further, so they buy a new sofa.'],
    i: ['The price level falls, so people need less money for their purchases. They lend out the extra, interest rates fall, and firms borrow to invest more.', 'The price level rises, so people need more money to buy the same things. Interest rates rise and businesses delay new projects.', 'Higher prices push up the demand for money and so interest rates, and fewer families take out car loans.'],
    x: ['The U.S. price level falls while prices abroad stay the same, so foreigners buy more U.S. goods.', 'The U.S. price level rises, so Americans buy more imported goods and foreigners buy fewer U.S. exports.', 'U.S. goods get cheaper relative to foreign goods, and exports rise.']
  };
  var ADEN = { w: 'The wealth effect', i: 'The interest-rate effect', x: 'The exchange-rate (foreign purchases) effect' };
  G('macro.aggregate-demand', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var k = R.pick(['w', 'i', 'x']), it = R.pick(ADE[k]), right = ADEN[k];
        return mc(it + ' Which reason for the downward slope of aggregate demand is this?', right, others([ADEN.w, ADEN.i, ADEN.x, 'The substitution effect between two goods'], right),
          [{ w: 'A change in the price level changes the buying power of people’s money and savings: the wealth (real balances) effect.', i: 'A change in the price level changes how much money people need, which moves interest rates and interest-sensitive spending: the interest-rate effect.', x: 'A change in our price level changes the price of our goods next to foreign goods, which moves net exports: the exchange-rate effect.' }[k], 'All three are movements along AD caused by a change in the price level.'], 'Is the story about wealth, interest rates or foreign buyers?');
      }],
      [1, function () {
        var up = R.coin(), right = up ? 'A movement up along AD: the quantity of real GDP demanded falls' : 'A movement down along AD: the quantity of real GDP demanded rises';
        return mc('The price level ' + (up ? 'rises' : 'falls') + ', and nothing else changes. What happens in the AD–AS graph?', right,
          [up ? 'AD shifts left' : 'AD shifts right', up ? 'AD shifts right' : 'AD shifts left', up ? 'A movement down along AD: the quantity of real GDP demanded rises' : 'A movement up along AD: the quantity of real GDP demanded falls'],
          ['The price level is on the vertical axis, so a change in it moves the economy along the AD curve.', 'Through the wealth, interest-rate and exchange-rate effects, a ' + (up ? 'higher' : 'lower') + ' price level means ' + (up ? 'less' : 'more') + ' real GDP demanded.'], 'A change in the variable on the axis moves you along the curve.');
      }],
      [2, function () {
        var right = 'When the whole price level rises there is no cheaper domestic good to switch to, so the reason must be wealth, interest rates or foreign trade';
        return mc('Why can’t the downward slope of aggregate demand be explained the way the slope of demand for one good is?', right,
          ['It can: people switch to cheaper goods when the price level rises', 'Because aggregate demand is vertical in the long run', 'Because people always buy the same amount of real GDP'],
          ['For one good, a higher price makes buyers switch to other, now relatively cheaper goods.', 'When the price level rises, nearly all domestic prices rise together, so that switch is not available.', 'AD slopes down because of the wealth, interest-rate and exchange-rate effects.'], 'What could people switch to if every domestic price rises?');
      }],
      [3, function () {
        var a = R.pick([20, 24, 30, 36]), b = R.pick([0.05, 0.1]), P1 = R.pick([100, 110, 120]), dP = R.pick([10, 20, 30]), P2 = P1 + dP, Y1 = U.fix(a - b * P1), Y2 = U.fix(a - b * P2);
        return num('Along an aggregate demand curve, real GDP demanded is $Y = ' + a + ' - ' + T.num(b) + 'P$ (trillions of dollars), where $P$ is the price level. The price level rises from ' + P1 + ' to ' + P2 + '. By how much does real GDP demanded change, in trillions of dollars? (Negative for a fall.)', U.fix(Y2 - Y1),
          ['At $P = ' + P1 + '$: $Y = ' + a + ' - ' + T.num(b) + ' \\times ' + P1 + ' = ' + T.num(Y1) + '$.', 'At $P = ' + P2 + '$: $Y = ' + a + ' - ' + T.num(b) + ' \\times ' + P2 + ' = ' + T.num(Y2) + '$.', 'Change $= ' + T.num(Y2) + ' - ' + T.num(Y1) + ' = ' + T.num(U.fix(Y2 - Y1)) + '$ trillion: a movement along AD, not a shift.'], 'Plug in both price levels.', { unit: 'trillion' });
      }]
    ])();
  });

  var ADS = [
    ['Consumer confidence rises sharply.', 'AD shifts right', 'Consumption rises at every price level.'],
    ['Stock prices jump, making households wealthier.', 'AD shifts right', 'Richer households consume more at every price level.'],
    ['The government increases its purchases of goods and services.', 'AD shifts right', 'G is part of aggregate demand.'],
    ['The government cuts income taxes.', 'AD shifts right', 'Higher after-tax income raises consumption.'],
    ['Businesses expect strong sales next year and order new equipment.', 'AD shifts right', 'Investment spending rises.'],
    ['Incomes in the country’s trading partners rise.', 'AD shifts right', 'Foreigners buy more exports, so net exports rise.'],
    ['Households become pessimistic about their jobs and cut spending.', 'AD shifts left', 'Consumption falls at every price level.'],
    ['The government raises taxes.', 'AD shifts left', 'Lower after-tax income reduces consumption.'],
    ['Firms expect weak sales and cancel plans for new factories.', 'AD shifts left', 'Investment spending falls.'],
    ['A recession abroad cuts foreign demand for the country’s goods.', 'AD shifts left', 'Exports fall, so net exports fall.'],
    ['The government cuts its spending on roads and defense.', 'AD shifts left', 'G falls.'],
    ['The overall price level rises.', 'A movement along AD, not a shift', 'A change in the price level moves the economy along AD.'],
    ['The overall price level falls.', 'A movement along AD, not a shift', 'A change in the price level moves the economy along AD.'],
    ['Oil prices rise sharply, raising firms’ costs.', 'AD does not shift (SRAS shifts)', 'Input costs are a supply-side shifter.'],
    ['Nominal wages rise across the economy.', 'AD does not shift (SRAS shifts)', 'Wages are a cost of production, a supply-side shifter.']
  ];
  G('macro.ad-shifters', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var dir = R.pick(['AD shifts right', 'AD shifts left']), right = R.pick(ADS.filter(function (x) { return x[1] === dir; }));
        var wr = R.sample(ADS.filter(function (x) { return x[1] !== dir; }), 3);
        return mc('Which of these events would make aggregate demand ' + (dir === 'AD shifts right' ? 'increase (shift right)' : 'decrease (shift left)') + '?', right[0].replace(/\.$/, ''), wr.map(function (x) { return x[0].replace(/\.$/, ''); }),
          [right[0].replace(/\.$/, '') + ': ' + right[2].charAt(0).toLowerCase() + right[2].slice(1)].concat(wr.map(function (x) { return x[0].replace(/\.$/, '') + ': ' + x[1].charAt(0).toLowerCase() + x[1].slice(1) + '.'; })), 'AD shifts when C, I, G or NX changes at every price level; a price-level change is a movement along AD.');
      }],
      [1, function () {
        var it = R.pick(ADS);
        return mc(it[0] + ' What happens to aggregate demand?', it[1], others(['AD shifts right', 'AD shifts left', 'A movement along AD, not a shift', 'AD does not shift (SRAS shifts)'], it[1]), [it[2], 'AD shifts only when spending (C, I, G or NX) changes at every price level.'], 'Does this change spending at every price level, or is it the price level itself?', { keep: true });
      }],
      [2, function () {
        var it = R.pick([['A tax cut leaves families with more income to spend.', 'Consumption (C)'], ['A drop in interest rates leads firms to build new warehouses.', 'Investment (I)'], ['Congress funds new bridges and highways.', 'Government purchases (G)'], ['Foreign incomes rise, so foreigners buy more of our goods.', 'Net exports (NX)'], ['Households feel richer after home prices rise.', 'Consumption (C)'], ['The dollar depreciates, making U.S. goods cheaper abroad.', 'Net exports (NX)']]);
        return mc(it[0] + ' Which component of aggregate demand changes first?', it[1], others(['Consumption (C)', 'Investment (I)', 'Government purchases (G)', 'Net exports (NX)'], it[1]), ['Aggregate demand = C + I + G + NX. ' + it[1] + ' changes, so AD shifts.'], 'Who changes their spending?', { keep: true });
      }]
    ])();
  });

  var MPCS = [0.5, 0.6, 0.75, 0.8, 0.9];
  G('macro.mpc-mps', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var mpc = R.pick([0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95]), dY = R.int(1, 30) * 100, dC = U.fix(mpc * dY);
        return num('When a household’s income rises by ' + $(dY) + ', its spending rises by ' + $(dC) + '. What is its marginal propensity to consume (MPC)?', mpc,
          ['MPC $= \\dfrac{\\Delta C}{\\Delta Y}$: the share of each extra dollar of income that is spent.', '$\\dfrac{' + T.num(dC) + '}{' + T.num(dY) + '} = ' + T.num(mpc) + '$.'], 'Change in spending over change in income.');
      }],
      [1, function () {
        var mpc = R.pick([0.55, 0.6, 0.65, 0.7, 0.72, 0.75, 0.78, 0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.95]), back = R.coin();
        if (back) return num('The MPS is ' + T.num(U.fix(1 - mpc)) + '. What is the marginal propensity to consume (MPC)?', mpc,
          ['Each extra dollar of income is either spent or saved, so MPC + MPS = 1.', 'MPC $= 1 - ' + T.num(U.fix(1 - mpc)) + ' = ' + T.num(mpc) + '$.'], 'Spent plus saved is the whole dollar.');
        return num('The MPC is ' + T.num(mpc) + '. What is the marginal propensity to save (MPS)?', U.fix(1 - mpc),
          ['Each extra dollar of income is either spent or saved, so MPC + MPS = 1.', 'MPS $= 1 - ' + T.num(mpc) + ' = ' + T.num(U.fix(1 - mpc)) + '$.'], 'Spent plus saved is the whole dollar.');
      }],
      [2, function () {
        var mpc = R.pick(MPCS), dY = R.pick([200, 400, 500, 1000, 2000]), ask = R.pick(['C', 'S']), v = ask === 'C' ? U.fix(mpc * dY) : U.fix((1 - mpc) * dY);
        return num('The MPC is ' + T.num(mpc) + '. Disposable income rises by ' + bn(dY) + '. By how much does ' + (ask === 'C' ? 'consumption' : 'saving') + ' rise, in billions of dollars?', v,
          [ask === 'C' ? '$\\Delta C = MPC \\times \\Delta Y = ' + T.num(mpc) + ' \\times ' + dY + ' = ' + T.num(v) + '$.' : 'MPS $= 1 - ' + T.num(mpc) + ' = ' + T.num(U.fix(1 - mpc)) + '$.', ask === 'C' ? 'The rest, $' + T.num(U.fix(dY - v)) + '$ billion, is saved.' : '$\\Delta S = MPS \\times \\Delta Y = ' + T.num(U.fix(1 - mpc)) + ' \\times ' + dY + ' = ' + T.num(v) + '$ billion dollars.'], ask === 'C' ? 'Multiply the change in income by the MPC.' : 'Find the MPS first.', { unit: UB });
      }],
      [2, function () {
        var mpc = R.pick([0.6, 0.75, 0.8, 0.9]), Y1 = R.pick([400, 500, 600, 800]), C1 = U.fix(Y1 * R.pick([0.85, 0.9, 0.95])), dY = R.pick([100, 200]), Y2 = Y1 + dY, C2 = U.fix(C1 + mpc * dY);
        var tab = '<div class="mlp-table-wrap"><table class="mlp-table"><thead><tr><th>Disposable income</th><th>Consumption</th></tr></thead><tbody><tr><td>' + $(Y1) + '</td><td>' + $(C1) + '</td></tr><tr><td>' + $(Y2) + '</td><td>' + $(C2) + '</td></tr></tbody></table></div>';
        return num('A household’s weekly spending at two income levels: ' + tab + 'What is its marginal propensity to consume?', mpc,
          ['Use the changes, not the totals: $\\Delta Y = ' + Y2 + ' - ' + Y1 + ' = ' + dY + '$ and $\\Delta C = ' + T.num(C2) + ' - ' + T.num(C1) + ' = ' + T.num(U.fix(C2 - C1)) + '$.', 'MPC $= \\dfrac{' + T.num(U.fix(C2 - C1)) + '}{' + dY + '} = ' + T.num(mpc) + '$.', 'Total spending over total income ($' + T.num(C2) + ' \\div ' + Y2 + '$) is the average propensity to consume, a different number.'], 'Marginal means the change: divide the change in consumption by the change in income.');
      }]
    ])();
  });

  function kOf(mpc) { return U.fix(1 / (1 - mpc)); }
  G('macro.spending-multiplier', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var mpc = R.pick([0.5, 0.6, 0.75, 0.8, 0.875, 0.9, 0.95]), mps = U.fix(1 - mpc), form = R.int(0, 3), k = kOf(mpc);
        if (form === 1) return num('The marginal propensity to save is ' + T.num(mps) + '. What is the spending multiplier?', k,
          ['Spending multiplier $= \\dfrac{1}{MPS}$.', '$\\dfrac{1}{' + T.num(mps) + '} = ' + T.num(k) + '$.'], 'One over the MPS.');
        if (form === 2) return num('The spending multiplier is ' + T.num(k) + '. What is the marginal propensity to consume (MPC)?', mpc,
          ['Work backward: multiplier $= \\dfrac{1}{MPS}$, so $MPS = \\dfrac{1}{' + T.num(k) + '} = ' + T.num(mps) + '$.', '$MPC = 1 - MPS = 1 - ' + T.num(mps) + ' = ' + T.num(mpc) + '$.'], 'First find the MPS from the multiplier.');
        if (form === 3) return num('The spending multiplier is ' + T.num(k) + '. What is the marginal propensity to save (MPS)?', mps,
          ['Multiplier $= \\dfrac{1}{MPS}$, so $MPS = \\dfrac{1}{' + T.num(k) + '} = ' + T.num(mps) + '$.'], 'Turn the multiplier formula around.');
        return num('The marginal propensity to consume is ' + T.num(mpc) + '. What is the spending multiplier?', kOf(mpc),
          ['Spending multiplier $= \\dfrac{1}{1 - MPC} = \\dfrac{1}{MPS}$.', '$\\dfrac{1}{1 - ' + T.num(mpc) + '} = \\dfrac{1}{' + T.num(U.fix(1 - mpc)) + '} = ' + T.num(kOf(mpc)) + '$.'], 'Divide 1 by the MPS, not by the MPC.');
      }],
      [1, function () {
        var mpc = R.pick(MPCS), dG = R.pick([10, 20, 40, 50, 100]), what = R.pick(['government purchases rise', 'businesses increase investment spending', 'exports rise']), dY = U.fix(kOf(mpc) * dG);
        return num('The MPC is ' + T.num(mpc) + ' and ' + what + ' by ' + bn(dG) + '. If the price level stays the same, by how much does real GDP rise, in billions of dollars?', dY,
          ['Multiplier $= \\dfrac{1}{1 - ' + T.num(mpc) + '} = ' + T.num(kOf(mpc)) + '$.', '$\\Delta GDP = ' + T.num(kOf(mpc)) + ' \\times ' + dG + ' = ' + T.num(dY) + '$ billion dollars.', 'The first ' + bn(dG) + ' becomes income, ' + T.num(mpc) + ' of which is spent again, and so on.'], 'Find the multiplier, then multiply.', { unit: UB, viz: { name: 'ec-multiplier', opts: { mode: 'spending', first: dG, mpc: mpc, rounds: 10, quiet: true, interactive: false } } });
      }],
      [2, function () {
        var mps = R.pick([0.1, 0.2, 0.25, 0.4, 0.5]), dI = R.pick([20, 30, 40, 60]), dY = U.fix(dI / mps);
        return num('The MPS is ' + T.num(mps) + '. Investment spending falls by ' + bn(dI) + '. By how much does real GDP change, in billions of dollars? (Negative for a fall.)', -dY,
          ['Multiplier $= \\dfrac{1}{MPS} = \\dfrac{1}{' + T.num(mps) + '} = ' + T.num(U.fix(1 / mps)) + '$.', '$\\Delta GDP = ' + T.num(U.fix(1 / mps)) + ' \\times (-' + dI + ') = -' + T.num(dY) + '$ billion dollars.', 'The multiplier works in both directions: lost spending is lost income, which cuts spending again.'], 'The multiplier is 1/MPS here.', { unit: UB });
      }],
      [3, function () {
        var mpc = R.pick(MPCS), dY = R.pick([100, 200, 300, 400, 600]) * (1 - mpc) * 10 / 10, k = kOf(mpc), dG = U.fix(dY / k); dY = U.fix(dY);
        if (Math.abs(dG - Math.round(dG * 10) / 10) > 1e-9) { dG = R.pick([10, 20, 30]); dY = U.fix(dG * k); }
        var ask = R.pick(['G', 'mpc']);
        if (ask === 'G') return num('The MPC is ' + T.num(mpc) + '. Policymakers want real GDP to rise by ' + bn(dY) + ' with the price level unchanged. By how much should government purchases rise, in billions of dollars?', dG,
          ['Multiplier $= \\dfrac{1}{1 - ' + T.num(mpc) + '} = ' + T.num(k) + '$.', 'Needed change $= \\dfrac{\\Delta GDP}{\\text{multiplier}} = \\dfrac{' + T.num(dY) + '}{' + T.num(k) + '} = ' + T.num(dG) + '$ billion dollars.'], 'Work backward: divide by the multiplier.', { unit: UB });
        return num('A ' + bn(dG) + ' rise in government purchases raises real GDP by ' + bn(dY) + ', with the price level unchanged. What is the MPC?', mpc,
          ['Multiplier $= \\dfrac{' + T.num(dY) + '}{' + T.num(dG) + '} = ' + T.num(k) + '$.', '$\\dfrac{1}{1 - MPC} = ' + T.num(k) + '$, so $MPS = 1 - MPC = \\dfrac{1}{' + T.num(k) + '} = ' + T.num(U.fix(1 - mpc)) + '$.', 'MPC $= ' + T.num(mpc) + '$.'], 'Find the multiplier first, then solve 1/(1 − MPC) = multiplier.');
      }]
    ])();
  });

  G('macro.tax-multiplier', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var mpc = R.pick(MPCS), tm = U.fix(mpc / (1 - mpc));
        return num('The MPC is ' + T.num(mpc) + '. What is the tax multiplier? (It is negative: a tax increase lowers GDP.)', -tm,
          ['Tax multiplier $= -\\dfrac{MPC}{MPS} = -\\dfrac{' + T.num(mpc) + '}{' + T.num(U.fix(1 - mpc)) + '} = -' + T.num(tm) + '$.', 'It is one smaller in size than the spending multiplier ($' + T.num(kOf(mpc)) + '$), because the first round of a tax change is only MPC times the tax.'], 'MPC over MPS, with a minus sign.');
      }],
      [1, function () {
        var mpc = R.pick(MPCS), dT = R.int(2, 40) * 5, up = R.coin(), tm = U.fix(mpc / (1 - mpc)), dY = U.fix((up ? -1 : 1) * tm * dT);
        return num('The MPC is ' + T.num(mpc) + '. Taxes are ' + (up ? 'raised' : 'cut') + ' by ' + bn(dT) + '. With the price level unchanged, by how much does real GDP change, in billions of dollars? (Negative for a fall.)', dY,
          ['Tax multiplier $= -\\dfrac{' + T.num(mpc) + '}{' + T.num(U.fix(1 - mpc)) + '} = -' + T.num(tm) + '$.', 'Change in taxes: $\\Delta T = ' + (up ? '' : '-') + dT + '$.', '$\\Delta GDP = -' + T.num(tm) + ' \\times ' + T.p(up ? dT : -dT) + ' = ' + T.num(dY) + '$ billion dollars.', up ? 'A tax increase lowers spending and GDP.' : 'Households spend ' + T.num(mpc) + ' of the tax cut in the first round and save the rest, so the effect is smaller than a spending increase of the same size.'], 'Use MPC/MPS, not 1/MPS, and watch the direction.', { unit: UB, viz: up ? null : { name: 'ec-multiplier', opts: { mode: 'tax', first: dT, mpc: mpc, rounds: 10, quiet: true, interactive: false } } });
      }],
      [2, function () {
        var mpc = R.pick(MPCS), x = R.pick([10, 20, 25, 30, 40, 50, 60, 80, 100, 150]), k = kOf(mpc), tm = U.fix(mpc / (1 - mpc));
        return num('The MPC is ' + T.num(mpc) + '. Option A raises government purchases by ' + bn(x) + '. Option B cuts taxes by ' + bn(x) + '. With the price level unchanged, how much more does real GDP rise under option A, in billions of dollars?', x,
          ['Option A: $' + T.num(k) + ' \\times ' + x + ' = ' + T.num(U.fix(k * x)) + '$.', 'Option B: $' + T.num(tm) + ' \\times ' + x + ' = ' + T.num(U.fix(tm * x)) + '$.', 'Difference: $' + T.num(U.fix(k * x)) + ' - ' + T.num(U.fix(tm * x)) + ' = ' + x + '$ billion dollars, exactly the first round that the government spends directly but households partly save.'], 'Find each change, then subtract.', { unit: UB });
      }],
      [3, function () {
        var mpc = R.pick(MPCS), x = R.pick([10, 20, 25, 30, 40, 50, 60, 80, 100, 120]), k = kOf(mpc), tm = U.fix(mpc / (1 - mpc));
        var kind = R.pick(['bb', 'tr']);
        if (kind === 'bb') return num('The MPC is ' + T.num(mpc) + '. The government raises its purchases by ' + bn(x) + ' and raises taxes by ' + bn(x) + ' to pay for them. With the price level unchanged, by how much does real GDP change, in billions of dollars?', x,
          ['Spending: $+' + T.num(k) + ' \\times ' + x + ' = +' + T.num(U.fix(k * x)) + '$.', 'Taxes: $-' + T.num(tm) + ' \\times ' + x + ' = -' + T.num(U.fix(tm * x)) + '$.', 'Net: $' + T.num(U.fix(k * x - tm * x)) + '$ billion dollars. The balanced-budget multiplier is 1.'], 'Add the effect of the spending and the effect of the tax.', { unit: UB });
        return num('The MPC is ' + T.num(mpc) + '. The government raises transfer payments (such as unemployment benefits) by ' + bn(x) + '. With the price level unchanged, by how much does real GDP rise, in billions of dollars?', U.fix(tm * x),
          ['Transfers are not purchases of goods and services. They work like a tax cut: households spend MPC of them in the first round.', 'Transfer multiplier $= \\dfrac{MPC}{MPS} = ' + T.num(tm) + '$.', '$' + T.num(tm) + ' \\times ' + x + ' = ' + T.num(U.fix(tm * x)) + '$ billion dollars.'], 'Do transfers buy anything directly, or do they become income first?', { unit: UB });
      }]
    ])();
  });

  var SRS = [
    ['Oil prices fall sharply.', 'SRAS shifts right', 'A key input is cheaper, so firms produce more at every price level.'],
    ['Nominal wages fall across the economy.', 'SRAS shifts right', 'Lower labor costs raise output at every price level.'],
    ['A new technology raises productivity in many industries.', 'SRAS shifts right', 'Each worker produces more, so costs per unit fall.'],
    ['The government gives firms a subsidy for every unit they produce.', 'SRAS shifts right', 'A subsidy lowers firms’ costs.'],
    ['An unusually good harvest lowers food costs for restaurants and food makers.', 'SRAS shifts right', 'Lower input costs.'],
    ['Oil prices rise sharply.', 'SRAS shifts left', 'Higher input costs: firms produce less at every price level (the curve moves up and to the left, a decrease).'],
    ['Nominal wages rise across the economy.', 'SRAS shifts left', 'Higher labor costs reduce output at every price level.'],
    ['A drought raises the cost of crops used by many firms.', 'SRAS shifts left', 'Higher input costs.'],
    ['New regulations raise firms’ costs of production.', 'SRAS shifts left', 'Higher costs per unit.'],
    ['Workers expect higher inflation and negotiate higher wages.', 'SRAS shifts left', 'Expected inflation raises wages, a cost of production.'],
    ['The price level rises while wages and other input prices stay fixed.', 'A movement along SRAS', 'With input prices sticky, a higher price level makes production more profitable: firms move up along SRAS.'],
    ['The government increases its purchases of goods and services.', 'SRAS does not shift (AD shifts)', 'Spending changes are demand-side shifters.'],
    ['Consumer confidence falls.', 'SRAS does not shift (AD shifts)', 'Consumption is part of aggregate demand.']
  ];
  G('macro.sras', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var dir = R.pick(['SRAS shifts right', 'SRAS shifts left']), right = R.pick(SRS.filter(function (x) { return x[1] === dir; }));
        var wr = R.sample(SRS.filter(function (x) { return x[1] !== dir; }), 3);
        return mc('Which of these events would ' + (dir === 'SRAS shifts right' ? 'increase short-run aggregate supply (shift it right)' : 'decrease short-run aggregate supply (shift it left)') + '?', right[0].replace(/\.$/, ''), wr.map(function (x) { return x[0].replace(/\.$/, ''); }),
          [right[0].replace(/\.$/, '') + ': ' + right[2].charAt(0).toLowerCase() + right[2].slice(1)].concat(wr.map(function (x) { return x[0].replace(/\.$/, '') + ': ' + x[1].charAt(0).toLowerCase() + x[1].slice(1) + '.'; })), 'SRAS shifts with production costs: wages, energy and other inputs, productivity, taxes and subsidies on firms.');
      }],
      [1, function () {
        var it = R.pick(SRS);
        return mc(it[0] + ' What happens to short-run aggregate supply?', it[1], others(['SRAS shifts right', 'SRAS shifts left', 'A movement along SRAS', 'SRAS does not shift (AD shifts)'], it[1]), [it[2], 'SRAS shifts with input prices (wages, oil), productivity, business taxes and subsidies, and supply shocks.'], 'Does this change firms’ costs at every price level?', { keep: true });
      }],
      [2, function () {
        var right = 'A decrease in SRAS: at every price level firms supply less output';
        return mc('Higher energy costs move the SRAS curve up and to the left. What should this be called?', right,
          ['An increase in SRAS, because the curve moved up', 'A movement along SRAS, because prices rose', 'An increase in aggregate demand'],
          ['When costs rise, firms need a higher price level to produce any given output, so the curve moves up; that is the same as moving left.', 'Read a supply shift horizontally: at each price level, output is lower. That is a decrease in SRAS.'], 'At a given price level, do firms produce more or less?');
      }],
      [2, function () {
        var right = 'Some input prices, especially wages, are slow to change, so a higher price level raises firms’ profits on extra output';
        return mc('Why does short-run aggregate supply slope upward?', right,
          ['A higher price level makes people richer, so they buy more', 'Higher prices let firms hire workers for less', 'The economy can always produce more if prices are high enough, forever'],
          ['In the short run, nominal wages and other costs are set in contracts and adjust slowly (they are “sticky”).', 'If output prices rise while costs stay put, producing more becomes profitable, so firms supply more output.', 'In the long run, costs catch up, which is why the long-run curve is vertical.'], 'What happens to profits if output prices rise but costs do not?');
      }]
    ])();
  });

  var LRS = [
    ['A country’s firms build many new factories and machines.', 'LRAS shifts right', 'More physical capital raises potential output.'],
    ['A breakthrough technology raises output per worker.', 'LRAS shifts right', 'Better technology raises potential output.'],
    ['Immigration and population growth enlarge the labor force.', 'LRAS shifts right', 'More workers raise potential output.'],
    ['Better schools and training raise workers’ skills.', 'LRAS shifts right', 'More human capital raises potential output.'],
    ['A war destroys much of a country’s capital stock.', 'LRAS shifts left', 'Less capital lowers potential output.'],
    ['A natural disaster permanently destroys farmland and factories.', 'LRAS shifts left', 'Fewer resources lower potential output.'],
    ['The price level rises.', 'LRAS does not shift', 'LRAS is vertical: potential output does not depend on the price level.'],
    ['Government purchases increase.', 'LRAS does not shift', 'Spending shifts AD; it does not by itself change the economy’s capacity.'],
    ['Nominal wages rise.', 'LRAS does not shift', 'Wage changes shift SRAS, not potential output.'],
    ['Consumer confidence falls.', 'LRAS does not shift', 'A demand change does not change capacity.']
  ];
  G('macro.lras', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var dir = R.pick(['LRAS shifts right', 'LRAS shifts left']), right = R.pick(LRS.filter(function (x) { return x[1] === dir; })), wr = R.sample(LRS.filter(function (x) { return x[1] !== dir; }), 3);
        return mc('Which of these would shift long-run aggregate supply ' + (dir === 'LRAS shifts right' ? 'to the right' : 'to the left') + '?', right[0].replace(/\.$/, ''), wr.map(function (x) { return x[0].replace(/\.$/, ''); }),
          [right[0].replace(/\.$/, '') + ': ' + right[2].charAt(0).toLowerCase() + right[2].slice(1), 'The others change the price level, spending or costs, which do not change potential output.'], 'Only changes in resources, technology or institutions move LRAS.');
      }],
      [1, function () {
        var it = R.pick(LRS);
        return mc(it[0] + ' What happens to long-run aggregate supply?', it[1], others(['LRAS shifts right', 'LRAS shifts left', 'LRAS does not shift'], it[1]), [it[2], 'LRAS sits at full-employment (potential) output, which depends on resources, technology and institutions.'], 'Does this change how much the economy can produce when its resources are fully employed?', { keep: true });
      }],
      [2, function () {
        var Yf = R.pick([8, 10, 12, 14, 15, 16, 18, 20, 22, 24, 25, 30]), d = R.pick([0.5, 1, 1.5, 2, 3]);
        return num('Full-employment output is ' + tn(Yf) + '. Aggregate demand rises, and for a while real GDP climbs to ' + tn(Yf + d) + '. Once wages and other input prices fully adjust, what will real GDP be, in trillions of dollars?', Yf,
          ['In the long run, output returns to full-employment output, where LRAS sits.', 'Higher demand raises the price level for good, but real GDP goes back to $' + Yf + '$ trillion dollars.'], 'Where is LRAS?', { unit: 'trillion' });
      }],
      [2, function () {
        var right = 'It is vertical at full-employment output, because in the long run all prices and wages adjust';
        return mc('What is the shape of long-run aggregate supply, and why?', right,
          ['It slopes upward, because higher prices make firms produce more', 'It is horizontal, because firms produce whatever is demanded', 'It slopes downward, because higher prices reduce spending'],
          ['When wages and other input prices have fully caught up with the price level, a higher price level gives firms no reason to produce more.', 'So output is set by resources and technology: potential output. On a PPC, it is a point on the curve.'], 'What happens to costs in the long run when prices rise?');
      }],
      [3, function () {
        var right = 'A point on the production possibilities curve';
        return mc('Producing at full-employment output on LRAS matches which point on a production possibilities curve (PPC)?', right,
          ['A point inside the curve', 'A point outside the curve', 'The point where the curve meets an axis'],
          ['Full-employment output uses all resources efficiently (with only the natural rate of unemployment), which is a point on the PPC.', 'A recessionary gap is like a point inside the curve; economic growth moves the whole curve, and LRAS, outward.'], 'Which PPC points use every resource fully?');
      }]
    ])();
  });

  function adasLin(R) { // AD: P = a − bY, SRAS: P = c + dY with a whole-number equilibrium
    var b = R.pick([5, 10, 4]), d = R.pick([2, 4, 5]), Y = R.pick([8, 10, 12, 14, 16]), P = R.pick([120, 130, 140]);
    return { a: P + b * Y, b: b, c: P - d * Y, d: d, Y: Y, P: P };
  }
  function linTex(m) { return '$\\text{AD: } P = ' + m.a + ' - ' + m.b + 'Y$ and $\\text{SRAS: } P = ' + m.c + ' + ' + m.d + 'Y$'; }
  G('macro.ad-as-equilibrium', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var Yf = R.pick([15, 18, 20, 22]), d = R.pick([-3, -2, -1, 1, 2, 3]), Y = Yf + d, right = d < 0 ? 'A recessionary gap' : 'An inflationary gap';
        return mc('Short-run equilibrium real GDP is ' + tn(Y) + ', and full-employment output is ' + tn(Yf) + '. What kind of output gap is this?', right, others(['A recessionary gap', 'An inflationary gap', 'No gap: the economy is at full employment'], right).concat(['A recessionary gap, because output is above potential']),
          ['Compare equilibrium output with full-employment output (LRAS).', d < 0 ? 'Output is below potential: a recessionary gap, with unemployment above its natural rate.' : 'Output is above potential: an inflationary gap, with unemployment below its natural rate and upward pressure on wages and prices.'], 'Is output below or above the LRAS line?', { viz: { name: 'ec-adas', opts: { yf: 10, ad: { shift: d < 0 ? -2.5 : 2.5 }, quiet: true, interactive: false, show: ['lras'] } } });
      }],
      [2, function () {
        var Yf = R.pick([400, 500, 800, 1000]), gap = R.pick([-60, -40, -20, 20, 40, 50]), Y = Yf + gap;
        return num('Full-employment output is ' + bn(Yf) + ' and real GDP is ' + bn(Y) + '. How large is the output gap, in billions of dollars? (Negative if output is below full employment.)', gap,
          ['Output gap = actual real GDP − full-employment output.', '$' + Y + ' - ' + Yf + ' = ' + gap + '$ billion dollars: ' + (gap < 0 ? 'a recessionary gap.' : 'an inflationary gap.')], 'Actual minus potential.', { unit: UB });
      }],
      [2, function () {
        var rec = R.coin(), right = rec ? 'Above the natural rate' : 'Below the natural rate';
        return mc('The economy has ' + (rec ? 'a recessionary' : 'an inflationary') + ' gap. Where is the unemployment rate compared with the natural rate?', right, others(['Above the natural rate', 'Below the natural rate', 'Equal to the natural rate', 'Zero'], right),
          [rec ? 'Output below potential means fewer workers are needed: cyclical unemployment pushes the rate above the natural rate.' : 'Output above potential means firms are hiring hard: the rate falls below the natural rate for a while.'], 'More output needs more workers.', { keep: true });
      }],
      [3, function () {
        var m = adasLin(R), Yf = m.Y + R.pick([-2, -1, 1, 2]);
        return num('With real GDP $Y$ in trillions of dollars, ' + linTex(m) + '. Full-employment output is ' + tn(Yf) + '. What is equilibrium real GDP, in trillions of dollars?', m.Y,
          ['Set AD equal to SRAS: $' + m.a + ' - ' + m.b + 'Y = ' + m.c + ' + ' + m.d + 'Y$.', '$' + (m.a - m.c) + ' = ' + (m.b + m.d) + 'Y$, so $Y = ' + m.Y + '$ trillion; then $P = ' + m.a + ' - ' + m.b + ' \\times ' + m.Y + ' = ' + m.P + '$.', 'Compared with full employment (' + Yf + '): ' + (m.Y < Yf ? 'a recessionary gap of ' + (Yf - m.Y) + ' trillion.' : 'an inflationary gap of ' + (m.Y - Yf) + ' trillion.')], 'Set the two equations equal and solve for Y.', { unit: 'trillion' });
      }]
    ])();
  });

  var SHOCKS = [
    ['Consumer confidence rises.', 'AD', 1], ['Government purchases increase.', 'AD', 1], ['Exports rise as foreign economies boom.', 'AD', 1],
    ['Households cut spending after a stock market crash.', 'AD', -1], ['Taxes are raised.', 'AD', -1], ['Business investment falls.', 'AD', -1],
    ['Oil prices jump.', 'SRAS', -1], ['A drought raises food and input costs.', 'SRAS', -1], ['Nominal wages rise across the economy.', 'SRAS', -1],
    ['Oil prices fall.', 'SRAS', 1], ['A productivity boom lowers firms’ costs.', 'SRAS', 1]
  ];
  var PY = { '1AD': 'Price level rises, real GDP rises', '-1AD': 'Price level falls, real GDP falls', '-1SRAS': 'Price level rises, real GDP falls', '1SRAS': 'Price level falls, real GDP rises' };
  G('macro.ad-as-shocks', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var key = R.pick(['1AD', '-1AD', '-1SRAS', '1SRAS']), right = R.pick(SHOCKS.filter(function (x) { return x[2] + x[1] === key; })), wr = R.sample(SHOCKS.filter(function (x) { return x[2] + x[1] !== key; }), 3);
        return mc('Starting from long-run equilibrium, which event would make the ' + PY[key].toLowerCase().replace('price level rises, real gdp rises', 'price level and real GDP both rise').replace('price level falls, real gdp falls', 'price level and real GDP both fall').replace('price level rises, real gdp falls', 'price level rise while real GDP falls').replace('price level falls, real gdp rises', 'price level fall while real GDP rises') + ' in the short run?', right[0].replace(/\.$/, ''), wr.map(function (x) { return x[0].replace(/\.$/, ''); }),
          [right[0].replace(/\.$/, '') + ': ' + right[1] + ' shifts ' + (right[2] > 0 ? 'right' : 'left') + '.', 'Demand shocks move the price level and output the same way; supply shocks move them in opposite directions.'], 'Decide which curve each event shifts, and which way.');
      }],
      [1, function () {
        var a = R.pick(SHOCKS), b = R.pick(SHOCKS.filter(function (x) { return x[1] !== a[1]; })), sh = R.pick([a, b]);
        var right = PY[sh[2] + sh[1]], cur = sh[1] === 'AD' ? 'AD' : 'SRAS';
        var prompt = 'Starting from long-run equilibrium, ' + sh[0].charAt(0).toLowerCase() + sh[0].slice(1, -1) + '. In the short run, which way do the price level and real GDP move?';
        return mc(prompt, right, others([PY['1AD'], PY['-1AD'], PY['-1SRAS'], PY['1SRAS']], right), [cur + ' shifts ' + (sh[2] > 0 ? 'right' : 'left') + '.', 'The new short-run equilibrium is where the shifted curve crosses the other one: ' + right.toLowerCase() + '.'], 'Sketch the shift and read the new crossing point.', { keep: true });
      }, 2],
      [1, function () {
        var it = R.pick(SHOCKS), right = PY[it[2] + it[1]];
        return mc(it[0] + ' Starting from long-run equilibrium, what happens in the short run?', right, others([PY['1AD'], PY['-1AD'], PY['-1SRAS'], PY['1SRAS']], right),
          [it[1] + ' shifts ' + (it[2] > 0 ? 'right' : 'left') + '.', it[1] === 'AD' ? 'A demand shock moves the price level and output in the same direction.' : 'A supply shock moves the price level and output in opposite directions.' + (it[2] < 0 ? ' Rising prices with falling output is stagflation.' : '')], 'First decide which curve shifts, and which way.', { keep: true, viz: { name: 'ec-adas', opts: { yf: 10, quiet: true, interactive: false } } });
      }],
      [2, function () {
        var right = 'A negative supply shock, such as a sharp rise in oil prices';
        return mc('Which event is most likely to cause stagflation (a rising price level with falling output)?', right,
          ['A fall in consumer confidence', 'An increase in government purchases', 'A rise in productivity'],
          ['Stagflation needs the price level and output to move in opposite directions, the sign of a supply shock.', 'A leftward shift of SRAS raises the price level and lowers real GDP.', 'Demand shocks move both the same way; a productivity rise lowers prices and raises output.'], 'Which curve’s shift moves P and Y in opposite directions?');
      }],
      [3, function () {
        var m = adasLin(R), dir = R.pick([1, -1]), k = (m.b + m.d) * R.pick([1, 2]), shock = R.pick(['AD', 'SRAS']), a2 = m.a, c2 = m.c;
        if (shock === 'AD') a2 = m.a + dir * k; else c2 = m.c - dir * k;
        var Y2 = (a2 - c2) / (m.b + m.d), P2 = a2 - m.b * Y2, ask = R.pick(['Y', 'P']);
        var newEq = shock === 'AD' ? '$P = ' + a2 + ' - ' + m.b + 'Y$' : '$P = ' + c2 + ' + ' + m.d + 'Y$';
        return num('With real GDP $Y$ in trillions of dollars, ' + linTex(m) + ', so equilibrium is $Y = ' + m.Y + '$, $P = ' + m.P + '$. A ' + (shock === 'AD' ? 'demand' : 'supply') + ' shock moves ' + shock + ' to ' + newEq + '. What is the new equilibrium ' + (ask === 'Y' ? 'real GDP, in trillions of dollars' : 'price level') + '?', ask === 'Y' ? Y2 : P2,
          ['Set the new curves equal: $' + a2 + ' - ' + m.b + 'Y = ' + c2 + ' + ' + m.d + 'Y$.', '$' + (a2 - c2) + ' = ' + (m.b + m.d) + 'Y$, so $Y = ' + Y2 + '$ and $P = ' + a2 + ' - ' + m.b + ' \\times ' + Y2 + ' = ' + P2 + '$.', 'Real GDP went from ' + m.Y + ' to ' + Y2 + ' and the price level from ' + m.P + ' to ' + P2 + (shock === 'AD' ? ': a demand shock moves both the same way.' : ': a supply shock moves them in opposite directions.')], 'Solve the new pair of equations.', ask === 'Y' ? { unit: 'trillion' } : {});
      }]
    ])();
  });

  G('macro.self-adjustment', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var rec = R.coin(), part = R.int(0, 4), gapTxt = 'The economy is in ' + (rec ? 'a recessionary' : 'an inflationary') + ' gap, and the government and central bank do nothing. ';
        var vz = { viz: { name: 'ec-adas', opts: { mode: 'adjust', start: rec ? 'recession' : 'inflation', step: 1, quiet: true, interactive: false } } };
        var why = [rec ? 'With output below potential, unemployment is high, so over time nominal wages and other input prices fall.' : 'With output above potential, labor is scarce, so over time nominal wages and other input prices rise.', 'Changing costs shift SRAS ' + (rec ? 'right' : 'left') + ' until it meets AD on LRAS, at full-employment output and a ' + (rec ? 'lower' : 'higher') + ' price level.'];
        if (part === 1) return mc(gapTxt + 'Over time, what happens to nominal wages?', rec ? 'They fall' : 'They rise', rec ? ['They rise', 'They stay the same forever'] : ['They fall', 'They stay the same forever'], why, 'Is labor scarce or plentiful in this gap?', vz);
        if (part === 2) return mc(gapTxt + 'Which curve shifts as the economy corrects itself?', rec ? 'SRAS shifts right' : 'SRAS shifts left', rec ? ['SRAS shifts left', 'LRAS shifts left', 'AD shifts right'] : ['SRAS shifts right', 'LRAS shifts right', 'AD shifts left'], why, 'Self-correction works through wages and SRAS.', vz);
        if (part === 3) return mc(gapTxt + 'In the long run, where does the price level end up, compared with today?', rec ? 'Lower' : 'Higher', rec ? ['Higher', 'The same'] : ['Lower', 'The same'], why, 'Follow SRAS to its new crossing with AD.', vz);
        if (part === 4) return mc(gapTxt + 'In the long run, where does real GDP end up?', 'At full-employment (potential) output', [rec ? 'Below potential, where it is now' : 'Above potential, where it is now', 'At zero growth forever', rec ? 'Far above potential' : 'Far below potential'], why, 'The long-run equilibrium is on LRAS.', vz);
        var right = rec ? 'Nominal wages fall, SRAS shifts right, and output returns to full employment at a lower price level' : 'Nominal wages rise, SRAS shifts left, and output returns to full employment at a higher price level';
        return mc('The economy is in ' + (rec ? 'a recessionary' : 'an inflationary') + ' gap, and the government and central bank do nothing. What happens in the long run?', right,
          [rec ? 'Nominal wages rise, SRAS shifts left, and output returns to full employment at a higher price level' : 'Nominal wages fall, SRAS shifts right, and output returns to full employment at a lower price level', rec ? 'LRAS shifts left to meet the lower output' : 'LRAS shifts right to meet the higher output', rec ? 'AD shifts right by itself until the gap closes' : 'AD shifts left by itself until the gap closes'],
          [rec ? 'With output below potential, unemployment is high, so over time nominal wages and other input prices fall.' : 'With output above potential, labor is scarce, so over time nominal wages and other input prices rise.', 'Changing costs shift SRAS ' + (rec ? 'right' : 'left') + ' until it meets AD on LRAS.', 'LRAS does not move: the economy’s capacity has not changed.'], 'Self-correction works through wages and SRAS.', { viz: { name: 'ec-adas', opts: { mode: 'adjust', start: rec ? 'recession' : 'inflation', step: 1, quiet: true, interactive: false } } });
      }],
      [2, function () {
        var Yf = R.pick([10, 12, 15, 20]), b = R.pick([4, 5, 10]), PL = R.pick([90, 100, 110, 120]), a = PL + b * Yf, gap = R.pick([-2, -1, 1, 2]), Ys = Yf + gap, Ps = a - b * Ys;
        return num('Aggregate demand is $P = ' + a + ' - ' + b + 'Y$ (real GDP $Y$ in trillions of dollars) and full-employment output is ' + Yf + ' trillion. Today SRAS crosses AD at $Y = ' + Ys + '$, $P = ' + Ps + '$. If AD stays put and wages adjust fully, what will the price level be in the long run?', PL,
          ['In the long run the economy ends up where AD meets LRAS, at $Y = ' + Yf + '$.', '$P = ' + a + ' - ' + b + ' \\times ' + Yf + ' = ' + PL + '$.', gap < 0 ? 'The price level falls from ' + Ps + ' to ' + PL + ' as falling wages shift SRAS right.' : 'The price level rises from ' + Ps + ' to ' + PL + ' as rising wages shift SRAS left.'], 'Plug full-employment output into AD.');
      }],
      [2, function () {
        var right = 'How quickly wages and prices adjust, and so whether policy should step in';
        return mc('Most economists agree that, in the model, wages and prices eventually adjust and close an output gap. What do they debate?', right,
          ['Whether LRAS is vertical in the long run', 'Whether demand shocks change the price level', 'Whether the price level is on the vertical axis'],
          ['Wages can be slow to fall: contracts, fairness concerns and minimum wages all slow the adjustment.', 'If adjustment takes years, many economists favor using fiscal or monetary policy to help; others think policy often arrives late or causes problems of its own.'], 'Think about time: months or years?');
      }, 3],
      [3, function () {
        var Yf = R.pick([10, 12, 15]), b = R.pick([5, 10]), d = R.pick([2, 4, 5]), PL = R.pick([100, 110, 120]), a = PL + b * Yf, gap = R.pick([-2, 2]), Ys = Yf + gap, Ps = a - b * Ys, c = Ps - d * Ys, c2 = PL - d * Yf;
        return num('AD is $P = ' + a + ' - ' + b + 'Y$ and SRAS is $P = ' + c + ' + ' + d + 'Y$ (real GDP $Y$ in trillions), so short-run output is ' + Ys + ' trillion. Full-employment output is ' + Yf + ' trillion. As wages adjust, SRAS moves to $P = k + ' + d + 'Y$ until output is back at full employment. What is $k$?', c2,
          ['Long-run equilibrium: AD meets LRAS at $Y = ' + Yf + '$, so $P = ' + a + ' - ' + b + ' \\times ' + Yf + ' = ' + PL + '$.', 'The new SRAS must pass through $(' + Yf + ', ' + PL + ')$: $' + PL + ' = k + ' + d + ' \\times ' + Yf + '$.', '$k = ' + PL + ' - ' + (d * Yf) + ' = ' + c2 + '$ (it was ' + c + ': SRAS shifted ' + (c2 < c ? 'down and to the right, an increase' : 'up and to the left, a decrease') + ').'], 'Find the long-run point first, then make SRAS pass through it.');
      }]
    ])();
  });


  // =====================================================================================================
  // Unit 4: Fiscal Policy
  // =====================================================================================================

  G('macro.fiscal-policy', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var rec = R.coin(), right = rec ? 'Increase government purchases or cut taxes' : 'Cut government purchases or raise taxes';
        return mc('The economy has ' + (rec ? 'a recessionary gap: output is below full employment and unemployment is high' : 'an inflationary gap: output is above full employment and prices are rising fast') + '. Which fiscal policy would close the gap?', right,
          [rec ? 'Cut government purchases or raise taxes' : 'Increase government purchases or cut taxes', rec ? 'Raise taxes to balance the budget first' : 'Raise transfer payments to households', 'Sell government bonds to banks to raise interest rates'],
          [rec ? 'A recessionary gap needs more spending: expansionary fiscal policy (higher G, lower taxes or higher transfers) shifts AD right.' : 'An inflationary gap needs less spending: contractionary fiscal policy (lower G, higher taxes or lower transfers) shifts AD left.', 'Selling bonds to raise interest rates would be a monetary policy tool, not fiscal policy.'], 'Which way must AD move to reach full employment?');
      }],
      [1, function () {
        var it = R.pick([['Congress raises spending on highways.', 'Expansionary'], ['The government cuts income tax rates.', 'Expansionary'], ['The government increases unemployment benefits.', 'Expansionary'], ['The government cuts military purchases.', 'Contractionary'], ['Congress raises income tax rates.', 'Contractionary'], ['The government reduces transfer payments.', 'Contractionary']]);
        return mc(it[0] + ' What kind of fiscal policy is this?', it[1], others(['Expansionary', 'Contractionary', 'Monetary policy, not fiscal policy'], it[1]), [it[1] === 'Expansionary' ? 'It raises spending or households’ after-tax income, so AD shifts right.' : 'It lowers spending or households’ after-tax income, so AD shifts left.'], 'Does it push spending up or down?', { keep: true });
      }],
      [2, function () {
        var exp = R.coin(), right = exp ? 'Real GDP rises, the price level rises, unemployment falls' : 'Real GDP falls, the price level falls, unemployment rises';
        return mc('Starting from ' + (exp ? 'a recessionary' : 'an inflationary') + ' gap, the government ' + (exp ? 'raises its purchases' : 'raises taxes') + '. What happens in the short run?', right,
          ['Real GDP rises, the price level rises, unemployment falls', 'Real GDP falls, the price level falls, unemployment rises', 'Real GDP rises, the price level falls, unemployment falls', 'Real GDP falls, the price level rises, unemployment rises'].filter(function (x) { return x !== right; }),
          ['AD shifts ' + (exp ? 'right' : 'left') + ' along an upward-sloping SRAS.', exp ? 'Output and the price level both rise; more output needs more workers, so unemployment falls.' : 'Output and the price level both fall; less output needs fewer workers, so unemployment rises.'], 'Fiscal policy shifts AD; read the new equilibrium.', { viz: { name: 'ec-adas', opts: { mode: 'policy', start: exp ? 'recession' : 'inflation', quiet: true, interactive: false } } });
      }],
      [2, function () {
        var right = 'Social Security payments to retirees';
        return mc('Which of these is NOT part of government purchases (G) in GDP, though it is still a fiscal policy tool?', right,
          ['Salaries of public school teachers', 'New equipment for the Army', 'A contract to build a highway bridge'],
          ['Social Security payments are transfer payments: the government buys no good or service in return.', 'Transfers raise households’ income, so they work like a tax cut: only part of them is spent in the first round.'], 'Which one buys no good or service?');
      }, 3]
    ])();
  });

  function fiscalNums(R) { // MPC with spending multiplier k and tax multiplier m; gap divisible by both
    var mpc = R.pick([0.5, 0.6, 0.75, 0.8, 0.9]), k = kOf(mpc), m = U.fix(mpc / (1 - mpc));
    var unit = { 0.5: 2, 0.6: 15, 0.75: 12, 0.8: 20, 0.9: 90 }[mpc], gap = unit * (mpc === 0.9 ? R.int(1, 10) : mpc === 0.75 ? R.int(2, 25) : mpc === 0.8 ? R.int(2, 15) : mpc === 0.6 ? R.int(2, 20) : R.int(2, 50) * 5);
    return { mpc: mpc, k: k, m: m, gap: gap };
  }
  G('macro.fiscal-policy-size', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var f = fiscalNums(R), rec = R.coin(), dG = U.fix(f.gap / f.k);
        return num('The economy has ' + (rec ? 'a recessionary' : 'an inflationary') + ' gap of ' + bn(f.gap) + ' and the MPC is ' + T.num(f.mpc) + '. Assuming the price level stays about the same, by how much should government purchases ' + (rec ? 'rise' : 'fall') + ', in billions of dollars?', dG,
          ['Spending multiplier $= \\dfrac{1}{1 - ' + T.num(f.mpc) + '} = ' + T.num(f.k) + '$.', 'Needed change in G $= \\dfrac{\\text{gap}}{\\text{multiplier}} = \\dfrac{' + f.gap + '}{' + T.num(f.k) + '} = ' + T.num(dG) + '$ billion dollars.', 'Check: $' + T.num(dG) + ' \\times ' + T.num(f.k) + ' = ' + f.gap + '$. Changing G by the whole gap would overshoot.'], 'The multiplier does most of the work: divide the gap by it.', { unit: UB, viz: { name: 'ec-multiplier', opts: { mode: 'spending', first: dG, mpc: f.mpc, rounds: 10, quiet: true, interactive: false } } });
      }],
      [2, function () {
        var f = fiscalNums(R), rec = R.coin(), dT = U.fix(f.gap / f.m);
        return num('The economy has ' + (rec ? 'a recessionary' : 'an inflationary') + ' gap of ' + bn(f.gap) + ' and the MPC is ' + T.num(f.mpc) + '. Using taxes alone, and assuming the price level stays about the same, by how much should taxes be ' + (rec ? 'cut' : 'raised') + ', in billions of dollars?', dT,
          ['Tax multiplier (size) $= \\dfrac{MPC}{MPS} = \\dfrac{' + T.num(f.mpc) + '}{' + T.num(U.fix(1 - f.mpc)) + '} = ' + T.num(f.m) + '$.', 'Tax change $= \\dfrac{' + f.gap + '}{' + T.num(f.m) + '} = ' + T.num(dT) + '$ billion dollars, a ' + (rec ? 'cut' : 'rise') + '.', 'That is more than the ' + T.num(U.fix(f.gap / f.k)) + ' billion change in G that would do the same job, because part of a tax change is ' + (rec ? 'saved' : 'paid out of saving') + ' rather than spent.'], 'Use the tax multiplier MPC/MPS, not the spending multiplier.', { unit: UB });
      }],
      [3, function () {
        var f = fiscalNums(R), dG = U.fix(f.gap / f.k), dT = U.fix(f.gap / f.m);
        return num('A recessionary gap is ' + bn(f.gap) + ' and the MPC is ' + T.num(f.mpc) + '. Closing it with a tax cut takes a larger change than closing it with more government purchases. How much larger, in billions of dollars?', U.fix(dT - dG),
          ['Change in G needed: $\\dfrac{' + f.gap + '}{' + T.num(f.k) + '} = ' + T.num(dG) + '$.', 'Tax cut needed: $\\dfrac{' + f.gap + '}{' + T.num(f.m) + '} = ' + T.num(dT) + '$.', 'Difference: $' + T.num(dT) + ' - ' + T.num(dG) + ' = ' + T.num(U.fix(dT - dG)) + '$ billion dollars.'], 'Work out both changes, then subtract.', { unit: UB });
      }],
      [3, function () {
        var f = fiscalNums(R), dTr = U.fix(f.gap / f.m);
        return num('A recessionary gap is ' + bn(f.gap) + ' and the MPC is ' + T.num(f.mpc) + '. By how much should transfer payments rise to close it, assuming the price level stays about the same, in billions of dollars?', dTr,
          ['Transfers work like a tax cut: households spend MPC of each dollar in the first round, so the multiplier is $\\dfrac{MPC}{MPS} = ' + T.num(f.m) + '$.', '$\\dfrac{' + f.gap + '}{' + T.num(f.m) + '} = ' + T.num(dTr) + '$ billion dollars.'], 'Which multiplier fits transfers?', { unit: UB });
      }]
    ])();
  });

  var BRK = [[[0, 0.1], [20000, 0.2], [60000, 0.3]], [[0, 0.1], [10000, 0.15], [40000, 0.25]], [[0, 0], [10000, 0.1], [50000, 0.2], [100000, 0.3]], [[0, 0.1], [30000, 0.2], [80000, 0.35]]];
  function brTax(br, x) { var t = 0; for (var i = 0; i < br.length; i++) { var lo = br[i][0], hi = i + 1 < br.length ? br[i + 1][0] : Infinity; if (x > lo) t += (Math.min(x, hi) - lo) * br[i][1]; } return U.fix(t); }
  function brMarg(br, x) { var m = 0; br.forEach(function (b) { if (x >= b[0]) m = b[1]; }); return m; }
  function brText(br) { return br.map(function (b, i) { var hi = i + 1 < br.length ? br[i + 1][0] : null; return (b[1] * 100) + '% on income ' + (hi == null ? 'above ' + $(b[0]) : (b[0] ? 'from ' + $(b[0]) + ' ' : 'up to ') + (b[0] ? 'to ' : '') + $(hi)); }).join('; '); }
  G('macro.tax-structures', function (R, ctx) {
    var br = R.pick(BRK), x = R.int(5, 30) * 5000;
    var slices = br.map(function (b, i) { var lo = b[0], hi = i + 1 < br.length ? br[i + 1][0] : Infinity, amt = Math.max(0, Math.min(x, hi) - lo); return { lo: lo, hi: hi, r: b[1], amt: amt, tax: U.fix(amt * b[1]) }; }).filter(function (s) { return s.amt > 0; });
    var tax = brTax(br, x), stp = slices.map(function (s) { return '$' + T.num(s.r * 100) + '\\%$ of ' + $(s.amt) + ' (income ' + (s.lo ? 'above ' + $(s.lo) : 'up to ' + $(Math.min(x, s.hi))) + (s.lo && s.hi < Infinity && x > s.hi ? ' up to ' + $(s.hi) : '') + ') $= ' + cm(s.tax) + '$'; });
    var vz = { name: 'ec-taxbrackets', opts: { brackets: br, income: x, max: Math.max(150000, x * 1.2), quiet: true, interactive: false } };
    return choose(R, ctx, [
      [1, function () {
        return num('A made-up income tax has these brackets: ' + brText(br) + '. How much tax does someone with income of ' + $(x) + ' pay, in dollars?', tax,
          ['Each rate applies only to the income inside its bracket.'].concat(stp).concat(['Total tax $= ' + slices.map(function (s) { return cm(s.tax); }).join(' + ') + ' = ' + cm(tax) + '$ dollars.']), 'Fill the brackets from the bottom; tax each slice at its own rate.', { unit: 'dollars', viz: vz });
      }],
      [1, function () {
        var m = brMarg(br, x);
        return num('A made-up income tax has these brackets: ' + brText(br) + '. What is the marginal tax rate for someone with income of ' + $(x) + '?', m * 100,
          ['The marginal rate is the rate on the next dollar earned: the rate of the bracket that income of ' + $(x) + ' reaches.', 'That bracket’s rate is $' + T.num(m * 100) + '\\%$.'], 'Which bracket is the last dollar in?', { pct: true });
      }],
      [2, function () {
        var avg = U.round(tax / x * 100, 1);
        return num('A made-up income tax has these brackets: ' + brText(br) + '. What is the average tax rate for someone with income of ' + $(x) + '? Round to one decimal place.', avg,
          ['First the tax: ' + stp.join('; ') + '; total ' + $(tax) + '.', 'Average rate $= \\dfrac{\\text{tax}}{\\text{income}} \\times 100 = \\dfrac{' + cm(tax) + '}{' + cm(x) + '} \\times 100 \\approx ' + T.num(avg) + '\\%$.', 'It is below the marginal rate of $' + T.num(brMarg(br, x) * 100) + '\\%$, because the lower brackets are taxed at lower rates.'], 'Find the total tax, then divide by income.', { pct: true, tol: 0.06 });
      }],
      [3, function () {
        var th = br[R.int(1, br.length - 1)][0], x0 = th - R.pick([1000, 2000]), x1 = th + R.pick([1000, 3000, 5000]);
        var t0 = brTax(br, x0), t1 = brTax(br, x1), keep = U.fix((x1 - t1) - (x0 - t0));
        return num('A made-up income tax has these brackets: ' + brText(br) + '. A worker’s income rises from ' + $(x0) + ' to ' + $(x1) + ', crossing into a higher bracket. By how many dollars does the worker’s after-tax income rise?', keep,
          ['Tax at ' + $(x0) + ': ' + $(t0) + '; after-tax income $= ' + cm(U.fix(x0 - t0)) + '$.', 'Tax at ' + $(x1) + ': ' + $(t1) + '; after-tax income $= ' + cm(U.fix(x1 - t1)) + '$.', 'After-tax income rises by $' + cm(keep) + '$ dollars. Only the dollars above the bracket line face the higher rate, so a raise never lowers take-home pay under bracket rates.'], 'Work out the tax at both incomes.', { unit: 'dollars' });
      }],
      [2, function () {
        var kind = R.pick(['Progressive', 'Regressive', 'Proportional']), inc = [20000, 50000, 100000];
        var rates = kind === 'Progressive' ? [0.05, 0.12, 0.2] : kind === 'Regressive' ? [0.08, 0.05, 0.03] : [0.1, 0.1, 0.1], taxes = inc.map(function (v, i) { return U.fix(v * rates[i]); });
        var tab = '<div class="mlp-table-wrap"><table class="mlp-table"><thead><tr><th>Income</th><th>Tax paid</th></tr></thead><tbody>' + inc.map(function (v, i) { return '<tr><td>' + $(v) + '</td><td>' + $(taxes[i]) + '</td></tr>'; }).join('') + '</tbody></table></div>';
        return mc('A tax takes these amounts from three households: ' + tab + 'What kind of tax is it?', kind, others(['Progressive', 'Regressive', 'Proportional'], kind),
          ['Average rates: ' + inc.map(function (v, i) { return '$' + cm(taxes[i]) + ' \\div ' + cm(v) + ' = ' + T.num(rates[i] * 100) + '\\%$'; }).join(', ') + '.', kind === 'Progressive' ? 'The average rate rises with income: progressive.' : kind === 'Regressive' ? 'The average rate falls as income rises: regressive, even though richer households pay more dollars.' : 'The same rate at every income: proportional.'], 'Compare the average tax rate, not the dollars paid.', { keep: true });
      }]
    ])();
  });

  var STAB = [
    ['Unemployment insurance payments rise as more workers lose their jobs in a recession.', 'Automatic stabilizer'],
    ['Income tax collections fall as incomes drop in a recession, with no change in tax law.', 'Automatic stabilizer'],
    ['More families qualify for food assistance (SNAP) when their incomes fall.', 'Automatic stabilizer'],
    ['Income tax collections rise faster than incomes in a boom, with no change in tax law.', 'Automatic stabilizer'],
    ['Congress passes a new law sending one-time rebate checks to households during a recession.', 'Discretionary fiscal policy'],
    ['Congress approves a new highway program to create jobs in a slump.', 'Discretionary fiscal policy'],
    ['Lawmakers vote to cut income tax rates to fight a recession.', 'Discretionary fiscal policy'],
    ['The central bank lowers interest rates during a recession.', 'Not fiscal policy (monetary policy)']
  ];
  G('macro.automatic-stabilizers', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var right = R.pick(STAB.filter(function (x) { return x[1] === 'Automatic stabilizer'; })), wr = R.sample(STAB.filter(function (x) { return x[1] !== 'Automatic stabilizer'; }), 3);
        return mc('Which of these is an automatic stabilizer?', right[0].replace(/\.$/, ''), wr.map(function (x) { return x[0].replace(/\.$/, ''); }),
          ['Automatic stabilizers are parts of existing tax and spending law that push the budget toward a deficit in a slump and toward a surplus in a boom, with no new decision.', 'The others need a new law (discretionary fiscal policy) or come from the central bank (monetary policy).'], 'Look for the one that happens with no new vote.');
      }],
      [1, function () {
        var it = R.pick(STAB);
        return mc(it[0] + ' How would you classify this?', it[1], others(['Automatic stabilizer', 'Discretionary fiscal policy', 'Not fiscal policy (monetary policy)'], it[1]),
          [it[1] === 'Automatic stabilizer' ? 'It happens under existing law as incomes change, with no new vote: an automatic stabilizer.' : it[1] === 'Discretionary fiscal policy' ? 'It needs a new decision by lawmakers: discretionary fiscal policy, even though it fights a recession.' : 'Interest rates are set by the central bank: monetary policy.'], 'Did anyone have to pass a new law?', { keep: true });
      }],
      [2, function () {
        var right = 'It grows, because tax revenue falls and spending on programs like unemployment insurance rises';
        return mc('In a recession, with no new laws passed, what happens to the government’s budget deficit?', right,
          ['It shrinks, because people need less help', 'It stays the same, because no laws changed', 'It grows only if Congress passes a stimulus bill'],
          ['Automatic stabilizers work through the budget: falling incomes mean less income tax, and more people qualify for unemployment insurance and food assistance.', 'Both push the deficit up, which cushions the fall in spending.'], 'What happens to tax collections and benefit payments when incomes fall?');
      }],
      [3, function () {
        var T0 = R.pick([3000, 3200, 3500]), dT = R.pick([100, 150, 200, 250]), S0 = R.pick([3600, 3800, 4000]), dS = R.pick([50, 80, 100, 120]);
        var d0 = S0 - T0, d1 = (S0 + dS) - (T0 - dT);
        return num('Before a recession, a government collects ' + bn(T0) + ' in taxes and spends ' + bn(S0) + '. In the recession, with no new laws, tax revenue falls by ' + bn(dT) + ' and spending on unemployment insurance and other programs rises by ' + bn(dS) + '. What is the new deficit, in billions of dollars?', d1,
          ['Old deficit $= ' + S0 + ' - ' + T0 + ' = ' + d0 + '$.', 'New spending $= ' + S0 + ' + ' + dS + ' = ' + (S0 + dS) + '$; new revenue $= ' + T0 + ' - ' + dT + ' = ' + (T0 - dT) + '$.', 'New deficit $= ' + (S0 + dS) + ' - ' + (T0 - dT) + ' = ' + d1 + '$ billion dollars: the automatic stabilizers added ' + (d1 - d0) + ' billion.'], 'Deficit = spending − revenue, before and after.', { unit: UB });
      }]
    ])();
  });

  G('macro.deficits-debt', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var Tx = R.int(20, 50) * 100, Sp = Tx + R.pick([-1, 1, 1, 1]) * R.int(1, 24) * 50, d = Sp - Tx;
        return num('A government collects ' + bn(Tx) + ' in revenue and spends ' + bn(Sp) + ' (purchases, transfers and interest) in a year. What is its budget balance, in billions of dollars? (Negative for a deficit, positive for a surplus.)', -d,
          ['Budget balance = revenue − spending.', '$' + Tx + ' - ' + Sp + ' = ' + (-d) + '$ billion dollars: ' + (d > 0 ? 'a deficit of ' + d + ' billion.' : 'a surplus of ' + (-d) + ' billion.')], 'Revenue minus spending.', { unit: UB });
      }],
      [2, function () {
        var D0 = R.pick([5000, 8000, 10000, 12000]), ds = [R.pick([400, 500, 600]), R.pick([300, 350, 450]), R.pick([-100, 200, 250])], D3 = D0 + ds[0] + ds[1] + ds[2];
        return num('At the start of year 1 the national debt is ' + bn(D0) + '. The government runs deficits of ' + bn(ds[0]) + ' in year 1 and ' + bn(ds[1]) + ' in year 2, and ' + (ds[2] < 0 ? 'a surplus of ' + bn(-ds[2]) : 'a deficit of ' + bn(ds[2])) + ' in year 3. What is the debt at the end of year 3, in billions of dollars?', D3,
          ['The debt is the running total: each deficit adds to it and each surplus subtracts.', '$' + D0 + ' + ' + ds[0] + ' + ' + ds[1] + T.signed(ds[2]) + ' = ' + D3 + '$ billion dollars.'], 'Add the deficits; subtract a surplus.', { unit: UB });
      }],
      [2, function () {
        var a = R.pick([800, 700, 600]), b = a - R.pick([200, 300]);
        var right = 'It still rises, by ' + bn(b) + ', because any deficit adds to the debt';
        return mc('Last year the deficit was ' + bn(a) + '; this year it is ' + bn(b) + '. What happens to the national debt this year?', right,
          ['It falls by ' + bn(a - b) + ', because the deficit shrank', 'It falls by ' + bn(b), 'It stays the same, because the deficit improved'],
          ['The deficit is a flow (one year’s shortfall); the debt is a stock (the total owed).', 'A smaller deficit still adds to the debt, just less than before. The debt falls only with a surplus.'], 'Is there still a shortfall this year?');
      }],
      [3, function () {
        var Y = R.int(10, 40) * 1000, r = R.int(6, 30) * 5, D = Y * r / 100;
        return num('The national debt is ' + bn(D) + ' and GDP is ' + bn(Y) + '. What is the debt-to-GDP ratio, as a percent?', r,
          ['Debt-to-GDP $= \\dfrac{\\text{debt}}{\\text{GDP}} \\times 100$.', '$\\dfrac{' + cm(D) + '}{' + cm(Y) + '} \\times 100 = ' + r + '\\%$.', 'Comparing the debt with the size of the economy shows how heavy it is to carry.'], 'Divide the debt by GDP.', { pct: true });
      }],
      [1, function () {
        var it = R.pick([['The national debt', 'A stock: an amount at a point in time'], ['The budget deficit', 'A flow: an amount per year'], ['A budget surplus', 'A flow: an amount per year']]);
        return mc('Is this a stock or a flow? ' + it[0] + '.', it[1], others(['A stock: an amount at a point in time', 'A flow: an amount per year'], it[1]), ['A deficit or surplus is measured over a year (a flow); the debt is what is owed at a moment (a stock). Deficits flow into the stock of debt, like water into a bathtub.'], 'Is it measured at a moment or over a period?', { keep: true });
      }, 2]
    ])();
  });


  // =====================================================================================================
  // Unit 5: Money, Banks and the Central Bank
  // =====================================================================================================

  G('macro.financial-assets', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var F = R.pick([1000, 2000, 5000, 10000, 20000]), cr = R.int(2, 18) / 2, C = U.fix(F * cr / 100);
        return num('A bond with a face value of ' + $(F) + ' has a coupon rate of ' + cr + '%. How much interest does it pay each year, in dollars?', C,
          ['Coupon payment = face value × coupon rate.', '$' + cm(F) + ' \\times ' + T.num(cr / 100) + ' = ' + cm(C) + '$ dollars a year, fixed for the life of the bond.'], 'Take the coupon rate of the face value.', { unit: 'dollars' });
      }],
      [1, function () {
        var up = R.coin(), right = up ? 'They fall' : 'They rise';
        return mc('Market interest rates ' + (up ? 'rise' : 'fall') + '. What happens to the prices of bonds that were issued earlier at fixed coupon rates?', right, others(['They rise', 'They fall', 'They stay at face value'], right),
          [up ? 'New bonds now pay more. No one will pay full price for an old bond with a lower fixed payment, so its price drops until its yield matches the market rate.' : 'New bonds now pay less, so an old bond with a higher fixed payment is worth more: buyers bid its price up.', 'Bond prices and market interest rates move in opposite directions.'], 'Would you pay full price for an old bond paying less than new ones?', { keep: true, viz: { name: 'ec-bond', opts: { face: 1000, coupon: 0.05, years: 5, rate: up ? 0.07 : 0.03, quiet: true, interactive: false } } });
      }],
      [2, function () {
        var P = R.pick([200, 500, 800, 1000, 2000, 4000, 5000]), r = R.pick([2, 3, 4, 5, 6, 8, 10, 20, 25]), X = U.fix(P * (1 + r / 100));
        return num('A bond pays ' + $(X) + ' one year from now and nothing else. If the market interest rate is ' + r + '%, what is the most a buyer would pay for it today, in dollars?', P,
          ['Today’s price is the amount that would grow to ' + $(X) + ' in a year at ' + r + '%: price × (1 + rate) = payment.', 'Price $= \\dfrac{' + cm(X) + '}{' + T.num(U.fix(1 + r / 100)) + '} = ' + cm(P) + '$ dollars.'], 'Divide the payment by 1 plus the interest rate.', { unit: 'dollars' });
      }],
      [2, function () {
        var C = R.pick([20, 30, 40, 50, 60, 80, 100, 120]), r1 = R.pick([2, 4, 5]), r2 = R.pick([8, 10]), P1 = U.fix(C / (r1 / 100)), P2 = U.fix(C / (r2 / 100));
        return num('A bond pays ' + $(C) + ' a year forever (a perpetuity), so its price is the payment divided by the market interest rate. The market rate rises from ' + r1 + '% to ' + r2 + '%. What is the bond’s new price, in dollars?', P2,
          ['At ' + r1 + '%: $\\dfrac{' + C + '}{' + T.num(r1 / 100) + '} = ' + cm(P1) + '$ dollars.', 'At ' + r2 + '%: $\\dfrac{' + C + '}{' + T.num(r2 / 100) + '} = ' + cm(P2) + '$ dollars.', 'The rate rose and the price fell, from ' + $(P1) + ' to ' + $(P2) + '.'], 'Price = payment ÷ rate, with the rate as a decimal.', { unit: 'dollars' });
      }],
      [3, function () {
        var P = R.pick([800, 900, 950, 960, 1000]), y = R.pick([4, 5, 10, 20, 25]), X = U.fix(P * (1 + y / 100));
        if (Math.abs(X - Math.round(X)) > 1e-9) { P = 1000; X = U.fix(1000 * (1 + y / 100)); }
        return num('You buy a bond for ' + $(P) + ' that will pay you ' + $(X) + ' one year from now. What is your yield (rate of return) for the year?', y,
          ['Yield $= \\dfrac{\\text{payment} - \\text{price}}{\\text{price}} \\times 100$.', '$\\dfrac{' + cm(X) + ' - ' + cm(P) + '}{' + cm(P) + '} \\times 100 = ' + y + '\\%$.', 'The less you pay for the same payment, the higher your yield: a lower bond price means a higher interest rate.'], 'Gain over price.', { pct: true });
      }],
      [1, function () {
        var it = R.pick([['Buying a company’s stock makes you a part owner of the company.', true, 'True. A share of stock is a share of ownership.'], ['Buying a company’s bond makes you a part owner of the company.', false, 'False. A bond is a loan to the issuer; you are a lender, not an owner.'], ['A bond’s coupon payment changes when market interest rates change.', false, 'False. The coupon is fixed when the bond is issued; it is the bond’s price that changes.']]);
        return tf('True or false: ' + it[0], it[1], [it[2]], 'Owner or lender?');
      }, 2]
    ])();
  });

  G('macro.real-interest-rate', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var i = R.int(6, 24) / 2, p = R.int(1, Math.min(10, 2 * i - 2)) / 2, r = U.fix(i - p);
        return num('A savings account pays ' + i + '% interest, and inflation is ' + p + '%. About what is the real interest rate?', r,
          ['Real interest rate ≈ nominal interest rate − inflation rate.', '$' + i + '\\% - ' + p + '\\% = ' + r + '\\%$.', 'Your money grows ' + i + '%, but prices grow ' + p + '%, so your buying power grows only about ' + r + '%.'], 'Subtract inflation from the nominal rate.', { pct: true, tol: 0.35 });
      }],
      [2, function () {
        var r = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]), p = R.pick([1.5, 2, 2.5, 3, 4, 5]), i = U.fix(r + p);
        return num('A lender wants to earn a real return of ' + r + '% and expects inflation of ' + p + '%. About what nominal interest rate should the lender charge?', i,
          ['Nominal ≈ real + expected inflation.', '$' + r + '\\% + ' + p + '\\% = ' + i + '\\%$.'], 'Add expected inflation to the real rate the lender wants.', { pct: true, tol: 0.3 });
      }],
      [2, function () {
        var i = R.pick([0.5, 1, 1.5, 2, 3]), p = R.pick([3.5, 4, 4.5, 5, 6]), r = U.fix(i - p);
        return num('A bank pays ' + i + '% on savings while inflation runs at ' + p + '%. About what is the real interest rate? (Use a negative number if needed.)', r,
          ['$' + i + '\\% - ' + p + '\\% = ' + r + '\\%$.', 'The real rate is negative: savers lose buying power even though their dollar balance grows.'], 'Nominal minus inflation; the result can be below zero.', { pct: true, tol: 0.4 });
      }],
      [3, function () {
        var i = R.pick([6, 7, 8]), pe = R.pick([2, 3]), pa = R.pick([1, 5, 6]); if (pa === pe) pa = pe + 3;
        var right = pa > pe ? 'The borrower: the real interest rate turned out lower than expected' : 'The lender: the real interest rate turned out higher than expected';
        return mc('A loan is made at a fixed ' + i + '% nominal rate when both sides expect ' + pe + '% inflation. Inflation turns out to be ' + pa + '%. Who gains?', right,
          [pa > pe ? 'The lender: the real interest rate turned out higher than expected' : 'The borrower: the real interest rate turned out lower than expected', 'Neither: the nominal rate was fixed in advance', 'Both: higher prices raise everyone’s income'],
          ['Expected real rate: $' + i + '\\% - ' + pe + '\\% = ' + (i - pe) + '\\%$.', 'Actual real rate: $' + i + '\\% - ' + pa + '\\% = ' + (i - pa) + '\\%$.', pa > pe ? 'The borrower repays with dollars that buy less than planned.' : 'The lender is repaid with dollars that buy more than planned.'], 'Compare the real rate expected with the real rate that happened.');
      }],
      [1, function () {
        var i = R.pick([5, 6]), p = R.pick([2, 3]);
        return tf('You lend money at ' + i + '% interest for a year while prices rise ' + p + '%. True or false: your buying power grows by about ' + i + '%.', false, ['False. Your dollars grow ' + i + '%, but each dollar buys about ' + p + '% less, so your buying power grows by about $' + i + '\\% - ' + p + '\\% = ' + (i - p) + '\\%$.'], 'What do prices do to each dollar you get back?');
      }, 2]
    ])();
  });

  var MFN = [
    ['You pay for groceries with a \\$20 bill.', 'Medium of exchange'],
    ['A plumber accepts dollars for fixing a leak, knowing she can spend them anywhere.', 'Medium of exchange'],
    ['A menu lists every dish’s price in dollars.', 'Unit of account'],
    ['You compare two job offers by their salaries in dollars.', 'Unit of account'],
    ['A store tracks its profits and losses in dollars.', 'Unit of account'],
    ['You keep \\$200 in a drawer to spend next month.', 'Store of value'],
    ['A teenager saves birthday money in a bank account for a future bike.', 'Store of value'],
    ['A farmer sells eggs for dollars instead of trading them directly for shoes.', 'Medium of exchange'],
    ['A car dealer quotes the price of every car in dollars so buyers can compare them.', 'Unit of account'],
    ['A family sets aside \\$50 a week in a savings account for a vacation next summer.', 'Store of value'],
    ['A city reports its budget in dollars.', 'Unit of account'],
    ['A babysitter is paid in cash and uses it to buy a concert ticket.', 'Medium of exchange']
  ];
  G('macro.money-functions', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var f = R.pick(['Medium of exchange', 'Unit of account', 'Store of value']), right = R.pick(MFN.filter(function (x) { return x[1] === f; }));
        var wr = R.sample(MFN.filter(function (x) { return x[1] !== f; }), 3);
        return mc('Which example shows money working as a ' + f.toLowerCase() + '?', right[0].replace(/\.$/, ''), wr.map(function (x) { return x[0].replace(/\.$/, ''); }),
          [right[0].replace(/\.$/, '') + ': ' + f.toLowerCase() + '.'].concat(wr.map(function (x) { return x[0].replace(/\.$/, '') + ': ' + x[1].toLowerCase() + '.'; })), 'Spent, measured with, or kept for later?');
      }],
      [2, function () {
        var n = R.pick([4, 5, 6, 8, 10, 12, 20]), pairs = n * (n - 1) / 2;
        return num('A village trades ' + n + ' different goods by barter, with no money. To know every exchange rate, people need a price for each pair of goods (how many fish for a basket of eggs, and so on). How many prices is that?', pairs,
          ['Each of the ' + n + ' goods pairs with each of the other ' + (n - 1) + ', and each pair is counted twice that way.', 'Number of pairs $= \dfrac{' + n + ' \times ' + (n - 1) + '}{2} = ' + pairs + '$.', 'With money as a unit of account, only ' + n + ' prices are needed, one for each good in dollars.'], 'Count the pairs of goods.');
      }, 3],
      [1, function () {
        var it = R.pick(MFN);
        return mc(it[0] + ' Which function of money is this?', it[1], others(['Medium of exchange', 'Unit of account', 'Store of value'], it[1]),
          [{ 'Medium of exchange': 'Money is accepted in trade for goods and services, so no one has to find a barter partner who wants what they have.', 'Unit of account': 'Money is the common measuring stick for prices and values.', 'Store of value': 'Money holds buying power over time, so you can earn now and spend later.' }[it[1]]], 'Is money being spent, used to measure, or kept for later?', { keep: true });
      }],
      [1, function () {
        var it = R.pick([['A credit card is a form of money.', false, 'False. A credit card is a way to borrow. The purchase is paid with the bank’s money, and you later repay that loan with money from your account.'], ['To work as money, currency must be backed by gold.', false, 'False. U.S. dollars are fiat money: valuable because people accept them in trade and the government accepts them for taxes, not because they can be swapped for gold.'], ['A checking account balance (demand deposit) counts as money.', true, 'True. You can spend it directly with a debit card or check, so it is part of M1.'], ['Shares of stock are money.', false, 'False. Stocks are assets that can be sold for money, but they are not generally accepted in payment.']]);
        return tf('True or false: ' + it[0], it[1], [it[2]], 'Can you spend it directly at a store?');
      }],
      [2, function () {
        var it = R.pick([['Gold coins used in trade', 'Commodity money: it has value as a good in itself'], ['Cigarettes used as currency in a prison camp', 'Commodity money: it has value as a good in itself'], ['U.S. dollar bills', 'Fiat money: valuable because it is accepted, not because of what it is made of'], ['Euro coins and notes', 'Fiat money: valuable because it is accepted, not because of what it is made of']]);
        return mc('What kind of money is this? ' + it[0] + '.', it[1], others(['Commodity money: it has value as a good in itself', 'Fiat money: valuable because it is accepted, not because of what it is made of', 'Not money: it is a financial asset'], it[1]), ['Commodity money is a good that is also used as money; fiat money has little value as a material, and works because people trust that others will accept it.'], 'Would it be worth much if no one used it as money?', { keep: true });
      }]
    ])();
  });

  var MS_ITEMS = [
    ['Currency (bills and coins) held by the public', 'In M1 (and so also in M2)'],
    ['Checking account balances (demand deposits)', 'In M1 (and so also in M2)'],
    ['Savings deposits', 'In M1 (and so also in M2)'],
    ['Small time deposits (CDs under \\$100,000)', 'In M2 but not M1'],
    ['Retail money market mutual fund balances', 'In M2 but not M1'],
    ['Shares of stock', 'In neither'],
    ['Government bonds held by a family', 'In neither'],
    ['The unused credit limit on a credit card', 'In neither'],
    ['A \\$20 bill in your wallet', 'In M1 (and so also in M2)'],
    ['Coins saved in a piggy bank at home', 'In M1 (and so also in M2)'],
    ['A money market deposit account at a bank (a kind of savings deposit)', 'In M1 (and so also in M2)'],
    ['A \\$5,000 six-month certificate of deposit (CD)', 'In M2 but not M1'],
    ['A family’s house', 'In neither'],
    ['Shares of a stock mutual fund', 'In neither']
  ];
  G('macro.money-supply-measures', function (R, ctx) {
    var cur = R.pick([2000, 2200, 2300, 2500]), dd = R.pick([3000, 4000, 5000]), sav = R.pick([9000, 10000, 12000]), td = R.pick([500, 800, 1000]), mmf = R.pick([1000, 1200, 1500]), st = R.pick([20000, 30000, 40000]), cl = R.pick([4000, 5000]);
    var M1 = cur + dd + sav, M2 = M1 + td + mmf;
    var list = 'currency held by the public ' + cm(cur) + '; checking deposits ' + cm(dd) + '; savings deposits ' + cm(sav) + '; small time deposits ' + cm(td) + '; retail money market funds ' + cm(mmf) + '; stocks held by households ' + cm(st) + '; unused credit card limits ' + cm(cl);
    return choose(R, ctx, [
      [1, function () {
        var it = R.pick(MS_ITEMS);
        return mc('Using the Federal Reserve’s current definitions, where does this belong? ' + it[0] + '.', it[1], others(['In M1 (and so also in M2)', 'In M2 but not M1', 'In neither'], it[1]),
          ['M1: currency held by the public, checking deposits and other liquid deposits, which since May 2020 include savings deposits.', 'M2: everything in M1 plus small time deposits and retail money market funds.', 'Stocks, bonds and credit limits are not money.'], 'How quickly can it be spent?', { keep: true });
      }],
      [2, function () {
        return num('In billions of dollars: ' + list + '. Using the Federal Reserve’s current definitions, what is M1, in billions of dollars?', M1,
          ['M1 = currency held by the public + checking deposits + savings and other liquid deposits.', '$' + cm(cur) + ' + ' + cm(dd) + ' + ' + cm(sav) + ' = ' + cm(M1) + '$ billion dollars.', 'Time deposits and money market funds are in M2 only; stocks and credit limits are not money. (Books written before 2020 put savings deposits in M2 only.)'], 'Count only what can be spent right away.', { unit: UB });
      }],
      [2, function () {
        return num('In billions of dollars: ' + list + '. Using the Federal Reserve’s current definitions, what is M2, in billions of dollars?', M2,
          ['M1 $= ' + cm(cur) + ' + ' + cm(dd) + ' + ' + cm(sav) + ' = ' + cm(M1) + '$.', 'M2 = M1 + small time deposits + retail money market funds $= ' + cm(M1) + ' + ' + cm(td) + ' + ' + cm(mmf) + ' = ' + cm(M2) + '$ billion dollars.', 'M2 contains M1; stocks and credit limits are in neither.'], 'Start from M1, then add the less liquid parts.', { unit: UB });
      }],
      [1, function () {
        return tf('True or false: M2 includes everything in M1.', true, ['True. M2 is M1 plus less liquid forms of money, such as small time deposits and retail money market funds. They are nested, not separate pools.'], 'Is M2 a separate pool or a bigger circle?');
      }, 2]
    ])();
  });

  function tbl(rows) { return '<div class="mlp-table-wrap"><table class="mlp-table"><thead><tr><th>Assets</th><th></th><th>Liabilities and owners’ equity</th><th></th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>'; }).join('') + '</tbody></table></div>'; }
  G('macro.bank-balance-sheets', function (R, ctx) {
    var rr = R.pick([0.05, 0.1, 0.2, 0.25]), D = R.pick([1000, 2000, 5000, 10000]) * 10, req = U.fix(rr * D), Rv = U.fix(req + R.pick([1000, 2000, 3000, 5000])), Lo = U.fix(D * 0.6), Se = U.fix(D * 0.25), E = U.fix(Rv + Lo + Se - D);
    while (E <= 0) { Se += 5000; E = U.fix(Rv + Lo + Se - D); }
    var sheet = tbl([['Reserves', $(Rv), 'Demand deposits', $(D)], ['Loans', $(Lo), 'Owners’ equity', '?'], ['Securities', $(Se), '', '']]);
    return choose(R, ctx, [
      [1, function () {
        return num('A bank has ' + $(D) + ' of demand deposits. The reserve requirement is ' + T.num(rr * 100) + '%. What are its required reserves, in dollars?', req,
          ['Required reserves = reserve ratio × demand deposits.', '$' + T.num(rr) + ' \\times ' + cm(D) + ' = ' + cm(req) + '$ dollars.', '(The Federal Reserve set reserve requirements to zero in March 2020; problems like this use a made-up ratio to show how the model works.)'], 'Multiply deposits by the reserve ratio.', { unit: 'dollars' });
      }],
      [1, function () {
        var ER = U.fix(Rv - req);
        return num('A bank holds ' + $(Rv) + ' in reserves and has ' + $(D) + ' of demand deposits. The reserve requirement is ' + T.num(rr * 100) + '%. What are its excess reserves, in dollars?', ER,
          ['Required reserves $= ' + T.num(rr) + ' \\times ' + cm(D) + ' = ' + cm(req) + '$.', 'Excess reserves = total reserves − required reserves $= ' + cm(Rv) + ' - ' + cm(req) + ' = ' + cm(ER) + '$ dollars.'], 'Find required reserves first.', { unit: 'dollars' });
      }],
      [2, function () {
        return num('Here is a bank’s balance sheet. ' + sheet + 'What is the owners’ equity, in dollars?', E,
          ['Assets = liabilities + owners’ equity, so equity = assets − liabilities.', 'Assets $= ' + cm(Rv) + ' + ' + cm(Lo) + ' + ' + cm(Se) + ' = ' + cm(U.fix(Rv + Lo + Se)) + '$.', 'Equity $= ' + cm(U.fix(Rv + Lo + Se)) + ' - ' + cm(D) + ' = ' + cm(E) + '$ dollars.'], 'Both sides of a balance sheet must be equal.', { unit: 'dollars' });
      }],
      [3, function () {
        var dep = R.pick([1000, 2000, 5000]), req2 = U.fix(rr * (D + dep)), ER2 = U.fix(Rv + dep - req2);
        return num('A bank holds ' + $(Rv) + ' in reserves against ' + $(D) + ' of demand deposits, with a ' + T.num(rr * 100) + '% reserve requirement. A customer deposits ' + $(dep) + ' in cash. What are the bank’s excess reserves now, in dollars?', ER2,
          ['The deposit adds ' + $(dep) + ' to both reserves (an asset) and deposits (a liability): reserves $= ' + cm(U.fix(Rv + dep)) + '$, deposits $= ' + cm(D + dep) + '$.', 'Required reserves $= ' + T.num(rr) + ' \\times ' + cm(D + dep) + ' = ' + cm(req2) + '$.', 'Excess reserves $= ' + cm(U.fix(Rv + dep)) + ' - ' + cm(req2) + ' = ' + cm(ER2) + '$ dollars. They rose by ' + $(U.fix(dep * (1 - rr))) + ', the part of the deposit the bank need not hold.'], 'Update both sides of the T-account, then recompute required reserves.', { unit: 'dollars' });
      }],
      [1, function () {
        var right = 'A liability, because the bank owes that money to the depositor';
        return mc('On a bank’s balance sheet, how is a customer’s checking deposit recorded?', right, ['An asset, because the bank holds the money', 'Owners’ equity, because it belongs to the bank', 'It is not recorded, because it is the customer’s money'],
          ['The bank must pay the deposit back on demand, so it is a liability. The cash or reserves the bank holds because of it are the matching asset.'], 'Who does the money belong to?');
      }, 2]
    ])();
  });

  G('macro.money-creation', function (R, ctx) {
    var rr = R.pick([0.1, 0.2, 0.25, 0.05, 0.125, 0.04]), mm = U.fix(1 / rr);
    return choose(R, ctx, [
      [1, function () {
        return num('The reserve requirement is ' + T.num(rr * 100) + '%. What is the simple money multiplier?', mm,
          ['Money multiplier $= \\dfrac{1}{\\text{reserve ratio}} = \\dfrac{1}{' + T.num(rr) + '} = ' + T.num(mm) + '$.'], 'One over the reserve ratio.');
      }],
      [1, function () {
        var D = R.int(1, 40) * 1000, ER = U.fix(D * (1 - rr));
        return num('With a reserve requirement of ' + T.num(rr * 100) + '%, a customer deposits ' + $(D) + ' in cash in a bank that had no excess reserves. How much can this bank lend out, at most, in dollars?', ER,
          ['The bank must keep $' + T.num(rr) + ' \\times ' + cm(D) + ' = ' + cm(U.fix(rr * D)) + '$ as required reserves.', 'It can lend its excess reserves: $' + cm(D) + ' - ' + cm(U.fix(rr * D)) + ' = ' + cm(ER) + '$ dollars.', 'One bank can lend only its excess reserves; the multiplier is about the whole banking system.'], 'A single bank lends its excess reserves.', { unit: 'dollars' });
      }],
      [2, function () {
        var D = R.pick([1000, 2000, 4000, 5000, 8000, 10000, 20000]), ER = U.fix(D * (1 - rr)), dM = U.fix(ER * mm);
        return num('With a reserve requirement of ' + T.num(rr * 100) + '%, someone deposits ' + $(D) + ' of cash in a bank. If every bank lends all its excess reserves and all loans are redeposited, by how much can the money supply grow at most, in dollars?', dM,
          ['The deposit itself does not change the money supply: ' + $(D) + ' of currency became ' + $(D) + ' of deposits.', 'Excess reserves created: $' + cm(D) + ' \\times (1 - ' + T.num(rr) + ') = ' + cm(ER) + '$.', 'Maximum new money $= ' + cm(ER) + ' \\times \\dfrac{1}{' + T.num(rr) + '} = ' + cm(dM) + '$ dollars.'], 'Apply the multiplier to the excess reserves, not to the whole deposit.', { unit: 'dollars', viz: { name: 'ec-multiplier', opts: { mode: 'bank', first: ER, rr: rr, rounds: 10, quiet: true, interactive: false } } });
      }],
      [2, function () {
        var B = R.pick([1, 2, 3, 4, 5, 8, 10, 20]) * 1000000, dM = U.fix(B * mm);
        return num('The central bank buys ' + $(B) + ' of government bonds from commercial banks, paying with new reserves. The reserve requirement is ' + T.num(rr * 100) + '%. By how much can the money supply grow at most, in dollars?', dM,
          ['The banks swap bonds for reserves. No deposits change, so all ' + $(B) + ' are excess reserves.', 'Maximum change in the money supply $= ' + cm(B) + ' \\times \\dfrac{1}{' + T.num(rr) + '} = ' + cm(dM) + '$ dollars.'], 'Are any of the new reserves required reserves?', { unit: 'dollars' });
      }],
      [3, function () {
        var D = R.pick([1000, 2000, 4000, 5000, 8000, 10000, 20000]), ask = R.pick(['dep', 'loans']), v = ask === 'dep' ? U.fix(D * mm) : U.fix(D * (1 - rr) * mm);
        return num('With a reserve requirement of ' + T.num(rr * 100) + '%, someone deposits ' + $(D) + ' of cash. If every bank lends all its excess reserves and all loans are redeposited, what is the maximum total change in ' + (ask === 'dep' ? 'demand deposits in the banking system (counting the first deposit)' : 'loans in the banking system') + ', in dollars?', v,
          ['Excess reserves from the deposit: $' + cm(U.fix(D * (1 - rr))) + '$; maximum new loans $= ' + cm(U.fix(D * (1 - rr))) + ' \\times ' + T.num(mm) + ' = ' + cm(U.fix(D * (1 - rr) * mm)) + '$.', 'Deposits include the original ' + $(D) + ' plus every redeposited loan: $' + cm(D) + ' + ' + cm(U.fix(D * (1 - rr) * mm)) + ' = ' + cm(U.fix(D * mm)) + '$ (that is $' + cm(D) + ' \\times ' + T.num(mm) + '$).', ask === 'dep' ? 'Maximum change in deposits: $' + cm(v) + '$ dollars.' : 'Maximum change in loans: $' + cm(v) + '$ dollars, which is also the most the money supply can grow.'], ask === 'dep' ? 'Deposits count the first deposit too.' : 'Loans start from the excess reserves.', { unit: 'dollars' });
      }],
      [3, function () {
        var B = R.pick([1, 2, 3, 4, 5, 6, 8, 10]) * 1000000, dM = U.fix(B * mm);
        return num('The central bank buys ' + $(B) + ' of bonds from a member of the public, who deposits the payment in a bank. The reserve requirement is ' + T.num(rr * 100) + '%. By how much can the money supply grow at most, in dollars?', dM,
          ['The seller gave up a bond, not money, so the new ' + $(B) + ' deposit is new money right away.', 'The bank keeps $' + cm(U.fix(B * rr)) + '$ and has $' + cm(U.fix(B * (1 - rr))) + '$ of excess reserves, which can add $' + cm(U.fix(B * (1 - rr))) + ' \\times ' + T.num(mm) + ' = ' + cm(U.fix(B * (1 - rr) * mm)) + '$.', 'Total: $' + cm(B) + ' + ' + cm(U.fix(B * (1 - rr) * mm)) + ' = ' + cm(dM) + '$ dollars (the same as $' + cm(B) + ' \\times ' + T.num(mm) + '$).'], 'The first deposit is new money here, unlike a cash deposit.', { unit: 'dollars' });
      }]
    ])();
  });

  var MMEV = [
    ['The central bank buys government bonds.', 'MS', 1], ['The central bank sells government bonds.', 'MS', -1],
    ['The price level rises, so people need more money for their purchases.', 'MD', 1], ['Real GDP falls, so people make fewer purchases.', 'MD', -1],
    ['Real GDP rises, so people make more purchases.', 'MD', 1], ['The price level falls.', 'MD', -1],
    ['The central bank lowers the reserve requirement.', 'MS', 1], ['The central bank raises the reserve requirement.', 'MS', -1],
    ['The central bank lowers the discount rate, and banks borrow more reserves.', 'MS', 1], ['The central bank raises the discount rate, and banks borrow fewer reserves.', 'MS', -1],
    ['Holiday shopping season arrives, and people want more money on hand for purchases.', 'MD', 1],
    ['Paying by card becomes easier, so people carry less money for everyday purchases.', 'MD', -1]
  ];
  G('macro.money-market', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var it = R.pick(MMEV), up = (it[1] === 'MS' ? -it[2] : it[2]) > 0, right = up ? 'The nominal interest rate rises' : 'The nominal interest rate falls';
        if (R.chance(0.45)) { // the same event: which curve moves, and which way
          var cv = (it[1] === 'MS' ? 'Money supply' : 'Money demand') + ' shifts ' + (it[2] > 0 ? 'right' : 'left');
          return mc(it[0] + ' What happens in the money market?', cv, others(['Money supply shifts right', 'Money supply shifts left', 'Money demand shifts right', 'Money demand shifts left'], cv),
            [it[1] === 'MS' ? 'The central bank’s actions change the quantity of money, so the vertical money supply curve moves ' + (it[2] > 0 ? 'right.' : 'left.') : 'Prices and real GDP change how much money people want to hold, so money demand moves ' + (it[2] > 0 ? 'right.' : 'left.'), 'So the nominal interest rate ' + (up ? 'rises.' : 'falls.')], 'Is it the central bank, or the public’s wish to hold money?', { keep: true });
        }
        return mc(it[0] + ' What happens to the nominal interest rate in the money market?', right, others(['The nominal interest rate rises', 'The nominal interest rate falls', 'The nominal interest rate does not change'], right),
          [it[1] === 'MS' ? 'The vertical money supply shifts ' + (it[2] > 0 ? 'right' : 'left') + '. People move along money demand until they hold the new amount, which takes a ' + (up ? 'higher' : 'lower') + ' rate.' : 'Money demand shifts ' + (it[2] > 0 ? 'right' : 'left') + '. With the money supply fixed by the central bank, the rate ' + (up ? 'rises' : 'falls') + '.'], 'Which curve shifts, and which way?', { keep: true, viz: { name: 'ec-moneymarket', opts: { quiet: true, interactive: false } } });
      }],
      [2, function () {
        var it = R.pick(MMEV.concat([['The nominal interest rate rises (nothing else changes).', 'move', 0]]));
        var right = it[1] === 'move' ? 'A movement along money demand: people hold less money' : (it[1] === 'MS' ? 'Money supply' : 'Money demand') + ' shifts ' + (it[2] > 0 ? 'right' : 'left');
        return mc(it[0] + ' What happens in the money market graph?', right, others(['Money supply shifts right', 'Money supply shifts left', 'Money demand shifts right', 'Money demand shifts left', 'A movement along money demand: people hold less money'], right).slice(0, 3),
          [it[1] === 'move' ? 'The interest rate is on the vertical axis. A change in it is a movement along money demand: a higher rate makes holding money (instead of bonds) more costly, so people hold less.' : it[1] === 'MS' ? 'Central bank bond trades change the money supply, which is vertical.' : 'The price level and real GDP change how much money people want at every interest rate, so money demand shifts.'], 'Is the change on an axis, or is it something that changes demand or supply at every rate?');
      }],
      [3, function () {
        var a = R.pick([8, 9, 10, 12]), k = R.pick([50, 100]), M0 = k * R.pick([2, 3, 4]), dM = k * R.pick([1, -1]), i0 = U.fix(a - M0 / k), i1 = U.fix(a - (M0 + dM) / k);
        return num('Money demand is $i = ' + a + ' - \\dfrac{M}{' + k + '}$, where $i$ is the nominal interest rate in percent and $M$ is the quantity of money in billions of dollars. The central bank ' + (dM > 0 ? 'raises' : 'lowers') + ' the money supply from ' + M0 + ' to ' + (M0 + dM) + ' billion. What is the new interest rate?', i1,
          ['The money supply is vertical at the quantity the central bank sets, so plug it into money demand.', 'Before: $i = ' + a + ' - \\dfrac{' + M0 + '}{' + k + '} = ' + i0 + '\\%$.', 'After: $i = ' + a + ' - \\dfrac{' + (M0 + dM) + '}{' + k + '} = ' + i1 + '\\%$.'], 'Substitute the new money supply into the money demand equation.', { pct: true });
      }]
    ])();
  });

  var TOOLS = [
    ['buy government bonds', 'Expansionary'], ['sell government bonds', 'Contractionary'],
    ['lower the discount rate', 'Expansionary'], ['raise the discount rate', 'Contractionary'],
    ['lower the reserve requirement', 'Expansionary'], ['raise the reserve requirement', 'Contractionary'],
    ['lower the interest rate it pays on reserve balances', 'Expansionary'], ['raise the interest rate it pays on reserve balances', 'Contractionary']
  ];
  G('macro.fed-tools', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var it = R.pick(TOOLS);
        return mc('The central bank decides to ' + it[0] + '. Is this expansionary or contractionary monetary policy?', it[1], others(['Expansionary', 'Contractionary'], it[1]).concat(['Fiscal policy']),
          [{ 'buy government bonds': 'Buying bonds pays banks with new reserves, so they can lend more.', 'sell government bonds': 'Selling bonds takes reserves out of banks, so they lend less.', 'lower the discount rate': 'Cheaper borrowing from the central bank encourages lending.', 'raise the discount rate': 'Costlier borrowing from the central bank discourages lending.', 'lower the reserve requirement': 'Banks must hold less, so more of their reserves are excess and can be lent.', 'raise the reserve requirement': 'Banks must hold more, so less can be lent.', 'lower the interest rate it pays on reserve balances': 'Banks earn less by leaving money at the central bank, so other short-term rates fall and lending is more attractive.', 'raise the interest rate it pays on reserve balances': 'Banks earn more on reserves, which pulls other short-term rates up.' }[it[0]], it[1] + ' policy ' + (it[1] === 'Expansionary' ? 'lowers interest rates and shifts AD right.' : 'raises interest rates and shifts AD left.')], 'Does it make loans cheaper and easier, or costlier and harder?', { keep: true });
      }],
      [2, function () {
        var inf = R.coin(), right = inf ? 'Sell government bonds' : 'Buy government bonds';
        return mc('The economy has ' + (inf ? 'an inflationary' : 'a recessionary') + ' gap. Which open market operation fits?', right, others(['Buy government bonds', 'Sell government bonds', 'Raise government purchases', 'Cut taxes'], right),
          [inf ? 'To fight inflation the central bank wants higher interest rates: selling bonds drains reserves and money.' : 'To fight a recession the central bank wants lower interest rates: buying bonds adds reserves and money.', 'Raising purchases and cutting taxes are fiscal policy, chosen by Congress and the President.'], 'Buying bonds adds money; selling bonds removes it.');
      }],
      [2, function () {
        var right = 'Bank reserves rise, so banks can lend more';
        return mc('The central bank buys ' + $(R.pick([1, 2, 5]) * 1000000) + ' of bonds from a commercial bank. What happens to that bank’s balance sheet?', right,
          ['Bank reserves fall, so banks must lend less', 'The bank’s deposits rise by the amount of the purchase', 'Nothing: the bank just swaps one bond for another'],
          ['The bank gives up a bond (an asset) and gets reserves (another asset) of the same value, all of them excess reserves.', 'More excess reserves mean more lending: buying bonds is expansionary.'], 'What does the central bank pay with?');
      }, 3],
      [3, function () {
        var rr = R.pick([0.1, 0.2, 0.25]), B = R.pick([1, 2, 3, 5]) * 1000000, sell = R.coin(), dM = U.fix(B / rr) * (sell ? -1 : 1);
        return num('The reserve requirement is ' + T.num(rr * 100) + '% and banks lend all their excess reserves. The central bank ' + (sell ? 'sells' : 'buys') + ' ' + $(B) + ' of bonds ' + (sell ? 'to' : 'from') + ' banks. What is the largest possible change in the money supply, in dollars? (Negative for a decrease.)', dM,
          [(sell ? 'Banks pay with reserves, so excess reserves fall by ' : 'Banks receive new reserves, so excess reserves rise by ') + $(B) + '.', 'Change $= ' + (sell ? '-' : '') + cm(B) + ' \\times \\dfrac{1}{' + T.num(rr) + '} = ' + cm(dM) + '$ dollars.'], 'Use the money multiplier on the change in excess reserves.', { unit: 'dollars' });
      }]
    ])();
  });

  G('macro.ample-reserves', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var up = R.coin(), right = up ? 'Raise the interest rate it pays on reserve balances (IORB)' : 'Lower the interest rate it pays on reserve balances (IORB)';
        return mc('Banks hold ample reserves. The Federal Reserve wants to ' + (up ? 'raise' : 'lower') + ' the federal funds rate. What is its main tool?', right,
          [up ? 'Sell a small amount of bonds to make reserves scarce' : 'Buy a small amount of bonds to add reserves', up ? 'Raise the reserve requirement' : 'Lower the reserve requirement', up ? 'Lower the interest rate it pays on reserve balances (IORB)' : 'Raise the interest rate it pays on reserve balances (IORB)'],
          ['With ample reserves, supply crosses reserve demand where demand is flat, so small open market operations barely move the rate.', 'Banks won’t lend reserves overnight for much less than they can earn by leaving them at the Fed, so moving IORB (along with the overnight reverse repo rate) moves the federal funds rate.'], 'In the ample-reserves picture, which part of the graph moves the rate?', { viz: { name: 'ec-moneymarket', opts: { mode: 'reserves', ample: true, quiet: true, interactive: false } } });
      }],
      [2, function () {
        var amp = R.coin(), right = amp ? 'The federal funds rate barely changes' : 'The federal funds rate falls';
        return mc('Reserves are ' + (amp ? 'ample' : 'limited (scarce)') + '. The central bank buys a modest amount of bonds, adding reserves, and leaves its administered rates unchanged. What happens to the federal funds rate?', right, others(['The federal funds rate barely changes', 'The federal funds rate falls', 'The federal funds rate rises'], right),
          [amp ? 'Reserve supply crosses demand on its flat part, near IORB: a little more supply hardly moves the rate.' : 'Reserve supply crosses demand on its steep part, so more reserves push the rate down. This is the classic textbook picture.'], 'Where does supply cross the reserve demand curve?', { keep: true, viz: { name: 'ec-moneymarket', opts: { mode: 'reserves', ample: amp, quiet: true, interactive: false } } });
      }],
      [1, function () {
        var a = R.pick([3.9, 4.15, 4.4, 5.15, 5.4]), d = R.pick([0.25, 0.5, -0.25, -0.5]), b = U.fix(a + d);
        return num('The Fed changes the interest rate on reserve balances from ' + T.num(a) + '% to ' + T.num(b) + '%. By how many basis points did it change? (One basis point is 0.01 percentage point; negative for a cut.)', U.fix(d * 100),
          ['Change $= ' + T.num(b) + ' - ' + T.num(a) + ' = ' + T.num(d) + '$ percentage point.', 'In basis points: $' + T.num(d) + ' \\times 100 = ' + T.num(U.fix(d * 100)) + '$.'], '100 basis points make one percentage point.', { unit: 'basis points' });
      }, 2],
      [2, function () {
        var iorb = R.pick([4.4, 4.65, 3.9]), offer = U.fix(iorb - R.pick([0.1, 0.2, 0.25]));
        var right = 'Keep the reserves at the Fed, because IORB pays more with no risk';
        return mc('A bank can earn ' + T.num(iorb) + '% on reserves left at the Fed. Another bank offers to borrow its reserves overnight at ' + T.num(offer) + '%. What would the first bank do?', right,
          ['Lend them, because any interest is better than none', 'Lend them, because the federal funds rate is set by law', 'Cut its lending to households to hold more reserves'],
          ['A bank compares the rate it is offered with what the Fed pays: ' + T.num(iorb) + '% risk-free beats ' + T.num(offer) + '%.', 'This is why IORB helps steer the federal funds rate when reserves are ample. (The rate can sit a little below IORB because some lenders in that market, such as government-sponsored enterprises, cannot earn IORB.)'], 'Compare the two returns.');
      }],
      [3, function () {
        var right = 'Since 2008 reserves have been plentiful, so the Fed sets administered rates (IORB and the overnight reverse repo rate) to keep the federal funds rate in its target range';
        return mc('Which statement best describes how the Federal Reserve implements monetary policy today?', right,
          ['Each day it buys or sells just enough bonds to make reserves scarce, so the federal funds rate hits its target', 'It changes the reserve requirement, currently 10% on checking deposits, to move the federal funds rate', 'It sets every interest rate in the economy directly, including mortgage rates'],
          ['The Fed has operated with ample reserves since the 2008 financial crisis and paid interest on reserves since then (IORB since July 2021).', 'Reserve requirements have been zero since March 2020.', 'Other rates, like mortgage rates, are set in markets; they respond to the Fed’s policy but are not set by it.'], 'Think about what changed after 2008.');
      }]
    ])();
  });

  G('macro.monetary-policy', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var exp = R.coin();
        var right = exp ? 'Buy bonds → money supply rises → interest rates fall → investment and consumption rise → AD shifts right → real GDP and the price level rise' : 'Sell bonds → money supply falls → interest rates rise → investment and consumption fall → AD shifts left → real GDP and the price level fall';
        var wr = exp ? ['Buy bonds → interest rates rise → investment rises → AD shifts right → real GDP rises', 'Buy bonds → AD shifts right → interest rates fall → money supply rises → investment rises', 'Buy bonds → money supply rises → interest rates fall → SRAS shifts right → the price level falls'] : ['Sell bonds → interest rates fall → investment falls → AD shifts left → real GDP falls', 'Sell bonds → AD shifts left → interest rates rise → money supply falls → investment falls', 'Sell bonds → money supply falls → interest rates rise → SRAS shifts left → the price level rises'];
        return mc('Which chain correctly shows how ' + (exp ? 'expansionary' : 'contractionary') + ' monetary policy works?', right, wr,
          ['Money market first: the money supply changes and the interest rate moves the other way.', 'Interest-sensitive spending (investment, home and car purchases) responds, which shifts AD.', 'AD moves along SRAS, changing real GDP and the price level in the same direction.'], 'Start in the money market; end with AD.', { viz: { name: 'ec-moneymarket', opts: { mode: 'chain', direction: exp ? 'expansionary' : 'contractionary', step: 0, quiet: true, interactive: false } } });
      }],
      [1, function () {
        var exp = R.coin(), v = R.pick(['interest', 'invest', 'gdp', 'unemp']);
        var ans = { interest: exp ? 'Falls' : 'Rises', invest: exp ? 'Rises' : 'Falls', gdp: exp ? 'Rises' : 'Falls', unemp: exp ? 'Falls' : 'Rises' }[v], name = { interest: 'the nominal interest rate', invest: 'investment spending', gdp: 'real GDP', unemp: 'the unemployment rate' }[v];
        return mc('The central bank ' + (exp ? 'buys' : 'sells') + ' government bonds. In the short run, what happens to ' + name + '?', ans, others(['Rises', 'Falls', 'Does not change'], ans),
          ['The money supply ' + (exp ? 'rises' : 'falls') + ', so interest rates ' + (exp ? 'fall' : 'rise') + '.', 'Investment ' + (exp ? 'rises' : 'falls') + ', AD shifts ' + (exp ? 'right' : 'left') + ', real GDP ' + (exp ? 'rises' : 'falls') + ' and unemployment ' + (exp ? 'falls' : 'rises') + '.'], 'Follow the chain from bonds to AD.', { keep: true });
      }],
      [2, function () {
        var right = 'No. Mortgage rates are set in markets; they usually follow the central bank’s moves, but not one for one';
        return mc('The Federal Reserve lowers its target for the federal funds rate. Does it set the interest rate on new 30-year mortgages?', right,
          ['Yes. The Fed sets all interest rates, including mortgage rates', 'Yes. Mortgage rates always fall by exactly the same amount', 'No. Mortgage rates are fixed by Congress'],
          ['The Fed steers a very short-term rate: the overnight rate banks charge one another.', 'Longer-term rates such as mortgage rates depend on expected future short-term rates, inflation and risk, so they move with the Fed’s policy but not one for one.'], 'Which rate does the Fed target?');
      }],
      [3, function () {
        var b = R.pick([10, 20, 25, 40]), i1 = R.pick([5, 6, 7]), di = R.pick([1, 2]), i2 = i1 - di, a = b * i1 + R.pick([100, 200, 300]), mpc = R.pick([0.5, 0.75, 0.8]), k = kOf(mpc);
        var I1 = a - b * i1, I2 = a - b * i2, dI = I2 - I1, dAD = U.fix(k * dI);
        return num('Investment demand is $I = ' + a + ' - ' + b + 'i$ (billions of dollars, with $i$ the interest rate in percent). The central bank lowers the interest rate from ' + i1 + '% to ' + i2 + '%. With an MPC of ' + T.num(mpc) + ', by how much does aggregate demand shift right at each price level, in billions of dollars?', dAD,
          ['Investment at ' + i1 + '%: $' + a + ' - ' + b + ' \\times ' + i1 + ' = ' + I1 + '$; at ' + i2 + '%: $' + a + ' - ' + b + ' \\times ' + i2 + ' = ' + I2 + '$.', 'Investment rises by $' + dI + '$ billion.', 'Spending multiplier $= \\dfrac{1}{1 - ' + T.num(mpc) + '} = ' + T.num(k) + '$, so AD shifts by $' + T.num(k) + ' \\times ' + dI + ' = ' + T.num(dAD) + '$ billion dollars.'], 'Find the change in investment, then multiply.', { unit: UB });
      }]
    ])();
  });

  var LFEV = [
    ['The government runs a larger budget deficit and borrows to pay for it.', 'Demand for loanable funds increases', 'rises'],
    ['Households decide to save more of their incomes.', 'Supply of loanable funds increases', 'falls'],
    ['A new investment tax credit makes business projects more profitable.', 'Demand for loanable funds increases', 'rises'],
    ['Foreign savers send more funds into the country.', 'Supply of loanable funds increases', 'falls'],
    ['Households save less as they spend more on consumption.', 'Supply of loanable funds decreases', 'rises'],
    ['Firms become pessimistic and cancel plans for new factories.', 'Demand for loanable funds decreases', 'falls'],
    ['The government runs a budget surplus and pays down debt.', 'Demand for loanable funds decreases', 'falls'],
    ['New technology makes many business investments look more profitable.', 'Demand for loanable funds increases', 'rises'],
    ['A new tax break on savings accounts encourages households to save.', 'Supply of loanable funds increases', 'falls'],
    ['Foreign investors pull their funds out of the country.', 'Supply of loanable funds decreases', 'rises']
  ];
  G('macro.loanable-funds', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var dir = R.pick(['rises', 'falls']), right = R.pick(LFEV.filter(function (x) { return x[2] === dir; })), wr = R.sample(LFEV.filter(function (x) { return x[2] !== dir; }), 3);
        return mc('Which of these events would make the real interest rate ' + (dir === 'rises' ? 'rise' : 'fall') + ' in the loanable funds market?', right[0].replace(/\.$/, ''), wr.map(function (x) { return x[0].replace(/\.$/, ''); }),
          [right[0].replace(/\.$/, '') + ': ' + right[1].toLowerCase() + ', so the rate ' + dir + '.'].concat(wr.map(function (x) { return x[0].replace(/\.$/, '') + ': ' + x[1].toLowerCase() + ', so the rate ' + x[2] + '.'; })), 'More borrowing or less saving pushes the rate up; less borrowing or more saving pulls it down.');
      }, 2],
      [1, function () {
        var it = R.pick(LFEV);
        return mc(it[0] + ' What happens in the loanable funds market?', it[1], others(['Demand for loanable funds increases', 'Demand for loanable funds decreases', 'Supply of loanable funds increases', 'Supply of loanable funds decreases'], it[1]),
          ['Saving (by households, and by foreigners lending here) supplies loanable funds; borrowing for investment, and by the government, demands them.', 'So the real interest rate ' + it[2] + '.'], 'Is this about saving (supply) or borrowing (demand)?', { keep: true, viz: { name: 'ec-loanable', opts: { quiet: true, interactive: false } } });
      }],
      [1, function () {
        var it = R.pick(LFEV), right = 'The real interest rate ' + it[2];
        return mc(it[0] + ' What happens to the real interest rate?', right, others(['The real interest rate rises', 'The real interest rate falls', 'The real interest rate does not change'], right), [it[1] + ', so the real interest rate ' + it[2] + '.'], 'Shift the right curve and read the new rate.', { keep: true });
      }, 2],
      [2, function () {
        var right = 'The loanable funds market sets the real rate from saving and borrowing; the money market sets the nominal rate from money supply and money demand';
        return mc('How do the loanable funds market and the money market differ?', right,
          ['They are the same market drawn two ways', 'The loanable funds market sets the nominal rate; the money market sets the real rate', 'The central bank sets the supply curve in both'],
          ['Loanable funds: supply is saving, demand is borrowing, and the price is the real interest rate.', 'Money market: supply is set by the central bank, demand comes from people wanting to hold money, and the price is the nominal interest rate.'], 'What is on each vertical axis?');
      }],
      [3, function () {
        var s = R.pick([0.01, 0.02]), r = R.pick([3, 4, 5, 6]), Q = R.pick([100, 200, 300, 400, 500].filter(function (q) { return r - s * q >= 1; })), a = U.fix(r - s * Q), cc = U.fix(r + s * Q);
        var ask = R.pick(['r', 'Q']);
        return num('In billions of dollars, the supply of loanable funds is $r = ' + T.num(a) + ' + ' + T.num(s) + 'Q$ and the demand is $r = ' + T.num(cc) + ' - ' + T.num(s) + 'Q$, where $r$ is the real interest rate in percent. What is the equilibrium ' + (ask === 'r' ? 'real interest rate' : 'quantity of loanable funds, in billions of dollars') + '?', ask === 'r' ? r : Q,
          ['Set supply equal to demand: $' + T.num(a) + ' + ' + T.num(s) + 'Q = ' + T.num(cc) + ' - ' + T.num(s) + 'Q$.', '$' + T.num(U.fix(2 * s)) + 'Q = ' + T.num(U.fix(cc - a)) + '$, so $Q = ' + Q + '$ billion.', '$r = ' + T.num(a) + ' + ' + T.num(s) + ' \\times ' + Q + ' = ' + r + '\\%$.'], 'Set the two equations equal and solve.', ask === 'r' ? { pct: true } : { unit: UB });
      }]
    ])();
  });


  // =====================================================================================================
  // Unit 6: Policy in the Long Run
  // =====================================================================================================

  var MIX = { // [fiscal, monetary] -> effects on Y, P, i  (1 up, -1 down, 0 cannot be determined)
    '1,1': { Y: 1, P: 1, i: 0, u: -1 }, '1,-1': { Y: 0, P: 0, i: 1, u: 0 }, '-1,1': { Y: 0, P: 0, i: -1, u: 0 }, '-1,-1': { Y: -1, P: -1, i: 0, u: 1 }
  };
  var FTXT = { 1: ['the government raises its purchases', 'the government cuts taxes', 'the government raises transfer payments', 'Congress funds a large new highway program'], '-1': ['the government cuts its purchases', 'the government raises taxes', 'the government cuts transfer payments', 'Congress cancels planned military purchases'] };
  var MTXT = { 1: ['the central bank buys government bonds', 'the central bank lowers its policy interest rate', 'the central bank lowers the discount rate'], '-1': ['the central bank sells government bonds', 'the central bank raises its policy interest rate', 'the central bank raises the discount rate'] };
  var VN = { Y: 'real GDP', P: 'the price level', i: 'the nominal interest rate', u: 'the unemployment rate' };
  function eff(v, d) { return d > 0 ? 'rises' : 'falls'; }
  G('macro.policy-mix', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var f = R.pick([1, -1]), m = R.pick([1, -1]), v = R.pick(['Y', 'P', 'i', 'u']), d = MIX[f + ',' + m][v];
        var right = d > 0 ? 'It increases' : d < 0 ? 'It decreases' : 'It cannot be determined without knowing the sizes of the two policies';
        var fiscalI = f > 0 ? 'raises' : 'lowers', monetaryI = m > 0 ? 'lowers' : 'raises';
        var fiscalAD = f > 0 ? 'right' : 'left', monetaryAD = m > 0 ? 'right' : 'left';
        var st = v === 'i' ? ['Fiscal policy: ' + (f > 0 ? 'more' : 'less') + ' spending ' + fiscalI + ' money demand (and borrowing), which ' + fiscalI + ' the interest rate.', 'Monetary policy: the central bank ' + (m > 0 ? 'adds' : 'drains') + ' money, which ' + monetaryI + ' the interest rate.', d === 0 ? 'The two push the interest rate in opposite directions, so the result depends on their sizes.' : 'Both push the rate the same way, so it ' + eff(v, d) + '.']
          : ['Fiscal policy shifts AD ' + fiscalAD + '; monetary policy shifts AD ' + monetaryAD + '.', d === 0 ? 'The shifts go opposite ways, so whether AD ends up right or left, and so what happens to ' + VN[v] + ', depends on which is bigger.' : 'Both shift AD ' + fiscalAD + ', so ' + VN[v] + ' ' + eff(v, d) + '.'];
        return mc('In the same year, ' + R.pick(FTXT[f]) + ' and ' + R.pick(MTXT[m]) + '. In the short run, what happens to ' + VN[v] + '?', right, others(['It increases', 'It decreases', 'It cannot be determined without knowing the sizes of the two policies'], right), st, 'Work out each policy’s effect on its own, then combine. Opposite pushes mean “it depends”.', { keep: true });
      }],
      [2, function () {
        var want = R.pick([['raise real GDP without raising interest rates', 'Expansionary fiscal policy together with expansionary monetary policy'], ['lower the price level and lower interest rates', 'Contractionary fiscal policy together with expansionary monetary policy'], ['raise interest rates while keeping output from changing much', 'Expansionary fiscal policy together with contractionary monetary policy']]);
        return mc('Policymakers want to ' + want[0] + '. Which combination is most likely to do it?', want[1], others(['Expansionary fiscal policy together with expansionary monetary policy', 'Contractionary fiscal policy together with expansionary monetary policy', 'Expansionary fiscal policy together with contractionary monetary policy', 'Contractionary fiscal policy together with contractionary monetary policy'], want[1]),
          ['Fiscal expansion raises AD and pushes interest rates up; monetary expansion raises AD and pushes interest rates down.', 'Pair them so the goal’s variables move the way you want, and let the uncertain one be the variable you do not mind about.'], 'List each policy’s effects on AD and on interest rates.', { keep: true });
      }, 3],
      [3, function () {
        var gap = R.pick([60, 80, 100, 120, 150, 160, 200]), mpc = R.pick([0.5, 0.75, 0.8]), k = kOf(mpc), dG = R.pick([5, 10, 15, 20, 25]), mon = U.fix(gap - k * dG);
        if (mon <= 0) { dG = 10; mon = U.fix(gap - k * dG); }
        return num('A recessionary gap is ' + bn(gap) + ' and the MPC is ' + T.num(mpc) + '. Government purchases rise by ' + bn(dG) + '. With the price level about unchanged, by how much more must monetary policy shift AD to close the gap, in billions of dollars?', mon,
          ['Fiscal policy shifts AD by $' + T.num(k) + ' \\times ' + dG + ' = ' + T.num(U.fix(k * dG)) + '$.', 'Remaining gap: $' + gap + ' - ' + T.num(U.fix(k * dG)) + ' = ' + T.num(mon) + '$ billion dollars, which monetary policy must cover.'], 'Find how much of the gap the fiscal change closes.', { unit: UB });
      }]
    ])();
  });

  var PCEV = [
    ['Aggregate demand increases.', 'A movement up and to the left along the SRPC'],
    ['Government purchases rise, pushing output above its usual level.', 'A movement up and to the left along the SRPC'],
    ['Aggregate demand falls as consumers cut back.', 'A movement down and to the right along the SRPC'],
    ['The central bank raises interest rates and spending slows.', 'A movement down and to the right along the SRPC'],
    ['Oil prices jump (a negative supply shock).', 'The SRPC shifts up and to the right'],
    ['People come to expect higher inflation.', 'The SRPC shifts up and to the right'],
    ['A fall in energy prices lowers firms’ costs.', 'The SRPC shifts down and to the left'],
    ['People come to expect lower inflation.', 'The SRPC shifts down and to the left'],
    ['Consumer confidence rises, and households spend more.', 'A movement up and to the left along the SRPC'],
    ['A tax cut leaves households more to spend, and they spend it.', 'A movement up and to the left along the SRPC'],
    ['Exports fall because major trading partners are in recession.', 'A movement down and to the right along the SRPC'],
    ['Businesses cut back on investment because they expect weak sales.', 'A movement down and to the right along the SRPC'],
    ['A drought raises food and input costs across the economy (a negative supply shock).', 'The SRPC shifts up and to the right'],
    ['New technology lowers production costs across many industries (a positive supply shock).', 'The SRPC shifts down and to the left']
  ];
  G('macro.short-run-phillips', function (R, ctx) {
    return choose(R, ctx, [
      [2, function () {
        var pe = R.pick([2, 3]), b = R.pick([0.5, 1, 2]), un = R.pick([4, 5, 6]), du = R.pick([-2, -1, 1, 2]), u = un + du, pi = U.fix(pe - b * du);
        return num('The short-run Phillips curve is $\\pi = ' + pe + ' - ' + T.num(b) + '(u - ' + un + ')$, with inflation $\\pi$ and unemployment $u$ in percent. What unemployment rate goes with ' + T.num(pi) + '% inflation?', u,
          ['Set $\\pi = ' + T.num(pi) + '$: $' + T.num(pi) + ' = ' + pe + ' - ' + T.num(b) + '(u - ' + un + ')$.', '$' + T.num(b) + '(u - ' + un + ') = ' + T.num(U.fix(pe - pi)) + '$, so $u - ' + un + ' = ' + T.num(du) + '$ and $u = ' + u + '\\%$.'], 'Solve the equation for u.', { pct: true });
      }],
      [1, function () {
        var it = R.pick(PCEV);
        if (R.chance(0.4)) { // the same event: a movement along the curve, or a shift of it?
          var mv = /movement/.test(it[1]) ? 'A movement along the SRPC' : 'A shift of the SRPC';
          return mc(it[0] + ' Is this a movement along the short-run Phillips curve (SRPC) or a shift of it?', mv, others(['A movement along the SRPC', 'A shift of the SRPC'], mv),
            [/movement/.test(it[1]) ? 'A change in aggregate demand moves the economy along SRAS, and so along the SRPC.' : 'Supply shocks and changes in expected inflation shift the SRPC itself.'], 'Demand changes move along the curve; supply shocks and expectations shift it.', { keep: true });
        }
        return mc(it[0] + ' What happens on the short-run Phillips curve (SRPC)?', it[1], others(['A movement up and to the left along the SRPC', 'A movement down and to the right along the SRPC', 'The SRPC shifts up and to the right', 'The SRPC shifts down and to the left'], it[1]),
          [/movement/.test(it[1]) ? 'A shift of AD moves the economy along SRAS, and so along the SRPC: ' + (/up/.test(it[1]) ? 'more output, lower unemployment, higher inflation.' : 'less output, higher unemployment, lower inflation.') : 'Supply shocks and changes in expected inflation shift the SRPC itself: ' + (/up/.test(it[1]) ? 'higher inflation at every unemployment rate.' : 'lower inflation at every unemployment rate.')], 'Demand changes move along the curve; supply shocks and expectations shift it.', { keep: true, viz: { name: 'ec-phillips', opts: { mode: 'short', quiet: true, interactive: false } } });
      }],
      [2, function () {
        var pe = R.pick([2, 3]), b = R.pick([0.5, 1, 1.5, 2]), un = R.pick([4, 5]), u = un + R.pick([-2, -1, 1, 2]), pi = U.fix(pe - b * (u - un));
        return num('The short-run Phillips curve is $\\pi = ' + pe + ' - ' + T.num(b) + '(u - ' + un + ')$, with inflation $\\pi$ and unemployment $u$ in percent. What is inflation when unemployment is ' + u + '%?', pi,
          ['Substitute $u = ' + u + '$: $\\pi = ' + pe + ' - ' + T.num(b) + ' \\times ' + T.p(u - un) + '$.', '$\\pi = ' + T.num(pi) + '\\%$.', u < un ? 'Unemployment below the natural rate (' + un + '%) comes with inflation above the expected ' + pe + '%.' : 'Unemployment above the natural rate comes with inflation below the expected ' + pe + '%.'], 'Plug in the unemployment rate.', { pct: true });
      }],
      [2, function () {
        var right = 'Unemployment falls and inflation rises: a move up along the SRPC';
        return mc('Aggregate demand shifts right along an upward-sloping SRAS. What happens on the Phillips curve graph?', right,
          ['Unemployment rises and inflation rises: the SRPC shifts right', 'Unemployment falls and inflation falls: a move down along the SRPC', 'Nothing: the Phillips curve only shows long-run changes'],
          ['More output needs more workers, so unemployment falls.', 'The price level rises faster than expected, so inflation rises.', 'Lower unemployment with higher inflation is a movement up and to the left along the same SRPC.'], 'Translate output into unemployment, and the price level into inflation.', { viz: { name: 'ec-phillips', opts: { mode: 'linked', quiet: true, interactive: false } } });
      }, 3]
    ])();
  });

  G('macro.long-run-phillips', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var lr = R.int(0, 5), vzl = { viz: { name: 'ec-phillips', opts: { mode: 'long', step: 5, quiet: true, interactive: false } } };
        if (lr === 1) return mc('What is the shape of the long-run Phillips curve?', 'A vertical line at the natural rate of unemployment', ['A downward-sloping curve, like the short-run curve', 'A horizontal line at the expected inflation rate', 'An upward-sloping line'], ['In the long run, unemployment returns to the natural rate whatever the inflation rate, so the curve is vertical there.'], 'In the long run, does inflation change unemployment?');
        if (lr === 2) return mc('In the long run, can a government keep unemployment below its natural rate by accepting higher inflation?', 'No: once people expect the higher inflation, unemployment returns to the natural rate', ['Yes, as long as inflation stays high', 'Yes, but only if inflation is falling', 'No, because inflation always lowers the natural rate'], ['Surprise inflation can lower unemployment only for a while. Expectations catch up, the SRPC shifts up, and unemployment goes back to the natural rate.'], 'What happens when expectations catch up?');
        if (lr === 3) return mc('The natural rate of unemployment falls (for example, job matching improves). What happens to the long-run Phillips curve?', 'It shifts left', ['It shifts right', 'It does not move', 'It becomes horizontal'], ['The long-run curve sits at the natural rate of unemployment, so a lower natural rate moves it left.'], 'Where does the long-run curve sit?');
        if (lr === 4) return mc('The natural rate of unemployment rises. What happens to the long-run Phillips curve?', 'It shifts right', ['It shifts left', 'It does not move', 'It becomes horizontal'], ['The long-run curve sits at the natural rate of unemployment, so a higher natural rate moves it right.'], 'Where does the long-run curve sit?');
        if (lr === 5) return mc('Expected inflation rises from 2% to 4%, and the natural rate of unemployment does not change. What happens to the long-run Phillips curve?', 'It does not move', ['It shifts right', 'It shifts left', 'It shifts up by 2 points'], ['Expected inflation shifts the short-run curve. The long-run curve stays at the natural rate of unemployment.'], 'Which curve do expectations shift?', vzl);
        var right = 'Unemployment returns to the natural rate, and inflation stays higher';
        return mc('The government keeps pushing aggregate demand up, year after year, to hold unemployment below its natural rate. Once people come to expect the higher inflation, what happens if it stops?', right,
          ['Unemployment stays low for good, and inflation returns to its old level', 'Unemployment and inflation both return to their old levels', 'Unemployment rises above the natural rate forever'],
          ['Each year inflation runs above what people expected, so expected inflation keeps catching up and the SRPC keeps shifting up.', 'In the long run unemployment goes back to the natural rate at whatever inflation rate people now expect: the long-run Phillips curve is vertical.'], 'What does the long-run Phillips curve look like?', { viz: { name: 'ec-phillips', opts: { mode: 'long', step: 5, quiet: true, interactive: false } } });
      }],
      [2, function () {
        var un = R.pick([3.5, 4, 4.5, 5, 5.5, 6]), pi = R.pick([1, 2, 3, 4, 6, 8, 10]);
        return num('The natural rate of unemployment is ' + un + '%. Inflation has been steady at ' + pi + '% for years, and everyone expects it to continue. Where is the economy on the long-run Phillips curve: what is the unemployment rate?', un,
          ['When inflation equals expected inflation, the economy is on its long-run Phillips curve.', 'The long-run curve is vertical at the natural rate, so unemployment is ' + un + '%, whatever the steady inflation rate.'], 'Steady, expected inflation puts the economy on the vertical curve.', { pct: true });
      }],
      [2, function () {
        var pe = R.pick([1, 2, 3, 4]), b = R.pick([1, 0.5, 2]), un = R.pick([4, 5, 6]), u1 = un - R.pick([1, 2]), p1 = U.fix(pe + b * (un - u1)), p2 = U.fix(p1 + b * (un - u1));
        return num('The short-run Phillips curve is $\\pi = \\pi^e - ' + T.num(b) + '(u - ' + un + ')$, where $\\pi^e$ is expected inflation, now ' + pe + '%. Policy holds unemployment at ' + u1 + '% this year and next. If people expect each year’s inflation to equal last year’s, what will inflation be next year?', p2,
          ['This year: $\\pi = ' + pe + ' - ' + T.num(b) + '(' + u1 + ' - ' + un + ') = ' + T.num(p1) + '\\%$.', 'Next year people expect $' + T.num(p1) + '\\%$, so $\\pi = ' + T.num(p1) + ' - ' + T.num(b) + '(' + u1 + ' - ' + un + ') = ' + T.num(p2) + '\\%$.', 'Holding unemployment below the natural rate takes ever-rising inflation; the low unemployment cannot last at a steady inflation rate.'], 'Work out this year, then update expected inflation for next year.', { pct: true });
      }],
      [3, function () {
        var it = R.pick([['Job-search websites help workers and employers find each other faster, lowering frictional unemployment.', 'The LRPC shifts left'], ['A wave of automation leaves many workers with skills employers no longer need, raising structural unemployment.', 'The LRPC shifts right'], ['People come to expect higher inflation.', 'The LRPC does not shift; the SRPC shifts up'], ['Aggregate demand rises.', 'The LRPC does not shift; the economy moves along the SRPC']]);
        return mc(it[0] + ' What happens to the long-run Phillips curve (LRPC)?', it[1], others(['The LRPC shifts left', 'The LRPC shifts right', 'The LRPC does not shift; the SRPC shifts up', 'The LRPC does not shift; the economy moves along the SRPC'], it[1]),
          ['The LRPC is vertical at the natural rate of unemployment, so only a change in the natural rate (frictional or structural unemployment) moves it.', it[1]], 'Does this change the natural rate of unemployment?', { keep: true });
      }]
    ])();
  });

  G('macro.quantity-theory', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var M = R.int(10, 80) * 100, V = R.int(2, 9), PY = M * V;
        return num('The money supply is ' + bn(M) + ' and nominal GDP ($P \\times Y$) is ' + bn(PY) + '. What is the velocity of money?', V,
          ['From $MV = PY$: $V = \\dfrac{PY}{M}$.', '$V = \\dfrac{' + cm(PY) + '}{' + cm(M) + '} = ' + V + '$: each dollar is spent on final goods and services ' + V + ' times a year on average.'], 'Velocity is nominal GDP divided by the money supply.');
      }],
      [2, function () {
        var M = R.pick([1000, 2000, 3000]), V = R.pick([4, 5, 6]), Y = R.pick([4000, 5000, 8000, 10000]), P = U.fix(M * V / Y);
        if (Math.abs(P * 100 - Math.round(P * 100)) > 1e-9) { Y = M * V / 2; P = 2; }
        return num('In a small economy, $M = ' + cm(M) + '$, $V = ' + V + '$ and real output $Y = ' + cm(Y) + '$ units. What is the price level $P$ (dollars per unit of output)?', P,
          ['$MV = PY$, so $P = \\dfrac{MV}{Y}$.', '$P = \\dfrac{' + cm(M) + ' \\times ' + V + '}{' + cm(Y) + '} = ' + T.num(P) + '$.'], 'Solve the equation of exchange for P.');
      }],
      [2, function () {
        var gM = R.pick([4, 5, 6, 8, 10, 12]), gY = R.pick([2, 3]), gV = R.pick([0, 0, 1, -1]), pi = gM + gV - gY;
        return num('Over many years, the money supply grows ' + gM + '% a year, ' + (gV === 0 ? 'velocity is constant' : 'velocity ' + (gV > 0 ? 'rises' : 'falls') + ' ' + Math.abs(gV) + '% a year') + ', and real GDP grows ' + gY + '% a year. About what is the inflation rate?', pi,
          ['In growth rates, $MV = PY$ becomes: money growth + velocity growth ≈ inflation + real growth.', 'Inflation $\\approx ' + gM + ' + ' + T.p(gV) + ' - ' + gY + ' = ' + pi + '\\%$.'], 'Use the growth-rate form of MV = PY.', { pct: true, tol: 0.4 });
      }],
      [1, function () {
        var k = R.pick([2, 3]), right = k === 2 ? 'The price level doubles' : 'The price level triples';
        return mc('In the long run, velocity and real output are fixed. The central bank makes the money supply ' + (k === 2 ? 'twice' : 'three times') + ' as large. What happens?', right,
          ['Real GDP ' + (k === 2 ? 'doubles' : 'triples'), 'Nothing: money does not affect prices', 'Velocity ' + (k === 2 ? 'doubles' : 'triples')],
          ['With $V$ and $Y$ fixed, $MV = PY$ means $P$ must change in proportion to $M$.', 'More money does not make the country richer in the long run: it raises prices (money is neutral in the long run).'], 'Which variable is left free to change?');
      }, 2],
      [3, function () {
        var right = 'How stable velocity is, so how closely money growth tracks inflation from year to year';
        return mc('Economists broadly agree that sustained, rapid money growth causes high inflation. Which part of the quantity theory is debated?', right,
          ['Whether MV = PY holds as an identity', 'Whether very high inflation has ever followed rapid money growth', 'Whether real GDP is measured in base-year prices'],
          ['$MV = PY$ is true by definition, because $V$ is defined as $PY/M$.', 'The debate is whether $V$ is stable enough for money growth to predict inflation over shorter periods; in some decades velocity has swung a lot.'], 'Which variable has to be steady for the theory to predict well?');
      }]
    ])();
  });

  G('macro.crowding-out', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var more = R.chance(0.65), part = R.int(0, 3);
        if (part > 0 || !more) {
          var ev = more ? 'The government borrows more to pay for a larger budget deficit.' : 'The government cuts its budget deficit, so it borrows less.';
          var why = [more ? 'The government competes with firms for the available saving, so demand for loanable funds shifts right and the real interest rate rises.' : 'With less government borrowing, demand for loanable funds shifts left and the real interest rate falls.', more ? 'At the higher rate, firms borrow less for investment: crowding out.' : 'At the lower rate, firms borrow more for investment (sometimes called crowding in).'];
          var vz = { viz: { name: 'ec-loanable', opts: { quiet: true, interactive: false } } };
          if (part === 2) return mc(ev + ' In the loanable funds model, what happens to the real interest rate?', more ? 'It rises' : 'It falls', more ? ['It falls', 'It does not change'] : ['It rises', 'It does not change'], why, 'Is the government borrowing more or less?', vz);
          if (part === 3) return mc(ev + ' What happens to private investment spending?', more ? 'It falls' : 'It rises', more ? ['It rises', 'It does not change'] : ['It falls', 'It does not change'], why, 'Follow the real interest rate to investment.', vz);
          return mc(ev + ' Using the loanable funds model in which the government is a borrower, what happens?', more ? 'Demand for loanable funds increases, and the real interest rate rises' : 'Demand for loanable funds decreases, and the real interest rate falls',
            more ? ['Supply of loanable funds increases, and the real interest rate falls', 'Demand for loanable funds decreases, and the real interest rate falls'] : ['Demand for loanable funds increases, and the real interest rate rises', 'Supply of loanable funds decreases, and the real interest rate rises'], why, 'Is the government borrowing more or less?', vz);
        }
        var right = 'Demand for loanable funds increases, and the real interest rate rises';
        return mc('The government borrows to pay for a larger budget deficit. Using the loanable funds model in which the government is a borrower, what happens?', right,
          ['Supply of loanable funds increases, and the real interest rate falls', 'Demand for loanable funds decreases, and the real interest rate falls', 'Nothing changes, because the government borrows from itself'],
          ['The government competes with firms for the available saving, so demand for loanable funds shifts right.', 'The real interest rate rises, and firms borrow less for investment: crowding out. (Some textbooks show the same event as a fall in public saving, a leftward shift of supply; the rate rises either way.)'], 'Is the government lending or borrowing?', { viz: { name: 'ec-loanable', opts: { quiet: true, interactive: false } } });
      }],
      [2, function () {
        var s = R.pick([0.01, 0.02]), X = R.pick([100, 200]), r = R.pick([3, 4, 5]), Q = R.pick([100, 200, 300, 400].filter(function (q) { return r - s * q >= 0.5; }));
        var a = U.fix(r - s * Q), cc = U.fix(r + s * Q);
        var r1 = U.fix(r + s * X / 2), Q1 = U.fix(Q + X / 2), Ipriv = U.fix(Q - X / 2), ask = R.pick(['r', 'out']);
        var stp = ['New demand: $r = ' + T.num(cc) + ' - ' + T.num(s) + '(Q - ' + X + ') = ' + T.num(U.fix(cc + s * X)) + ' - ' + T.num(s) + 'Q$.', 'Equilibrium: $' + T.num(a) + ' + ' + T.num(s) + 'Q = ' + T.num(U.fix(cc + s * X)) + ' - ' + T.num(s) + 'Q$, so $Q = ' + T.num(Q1) + '$ and $r = ' + T.num(r1) + '\\%$.', 'Private borrowing at $' + T.num(r1) + '\\%$ (old demand curve): $' + T.num(cc) + ' - ' + T.num(s) + 'Q = ' + T.num(r1) + '$ gives $Q = ' + T.num(Ipriv) + '$, down from ' + Q + ': crowded out $= ' + T.num(U.fix(Q - Ipriv)) + '$ billion.'];
        return num('In billions of dollars, loanable funds supply is $r = ' + T.num(a) + ' + ' + T.num(s) + 'Q$ and private demand is $r = ' + T.num(cc) + ' - ' + T.num(s) + 'Q$, so $r = ' + r + '\\%$ and $Q = ' + Q + '$. The government now borrows ' + bn(X) + ' at every interest rate, shifting demand right by ' + X + '. ' + (ask === 'r' ? 'What is the new real interest rate?' : 'By how much does private borrowing for investment fall, in billions of dollars?'), ask === 'r' ? r1 : U.fix(Q - Ipriv), stp, 'Shift demand right by the government’s borrowing, then find the new rate.', ask === 'r' ? { pct: true } : { unit: UB });
      }],
      [2, function () {
        var right = 'Private investment falls, so less capital is built and long-run growth may be slower';
        return mc('Government borrowing raises the real interest rate. What is the main long-run worry?', right,
          ['Private investment rises, so the economy grows too fast', 'The money supply shrinks, causing deflation', 'Exports rise, causing a trade surplus'],
          ['A higher real interest rate makes business projects costlier, so private investment falls (crowding out).', 'Less investment means a smaller capital stock later, which can slow the growth of potential output. How large this effect is, especially when many resources are idle in a recession, is debated.'], 'What does a higher interest rate do to business borrowing?');
      }],
      [3, function () {
        var right = 'When the economy is in a deep recession with idle resources and plenty of unused saving';
        return mc('When do many economists expect crowding out from government borrowing to be smallest?', right,
          ['When the economy is at full employment and saving is scarce', 'When the government borrows to cut taxes in a boom', 'Crowding out is always exactly one dollar of investment per dollar borrowed'],
          ['With idle resources and weak demand for loans, extra government borrowing raises interest rates little, so it pushes out little private investment.', 'Near full employment, the same borrowing competes harder for scarce saving. The size of crowding out in practice is debated.'], 'When is saving plentiful compared with borrowing?');
      }]
    ])();
  });

  var SCH = [
    ['Wages and prices adjust quickly, so the economy returns to full employment on its own; active policy is rarely needed.', 'Classical'],
    ['Wages and prices are sticky, so recessions can drag on; changes in government spending and taxes can help restore full employment.', 'Keynesian'],
    ['Inflation comes from money growing too fast, so the central bank should let the money supply grow at a steady, predictable rate.', 'Monetarist'],
    ['People form expectations using all available information, so predictable policy changes have little lasting effect on output.', 'New classical (rational expectations)'],
    ['Prices and wages are sticky because of menu costs and contracts, so monetary policy can affect output in the short run.', 'New Keynesian']
  ];
  var AGREE = [
    ['In the long run, faster money growth leads to higher inflation, not more output.', 'Broad agreement'],
    ['Over the long run, living standards rise mainly through productivity growth.', 'Broad agreement'],
    ['In the short run, a big fall in aggregate demand can lower output and raise unemployment.', 'Broad agreement'],
    ['Sustained high inflation happens when money grows much faster than output.', 'Broad agreement'],
    ['How large the multiplier on government spending is in practice.', 'Still debated'],
    ['How quickly wages adjust after a recession begins.', 'Still debated'],
    ['How much government borrowing crowds out private investment.', 'Still debated'],
    ['Whether the central bank should follow a fixed rule or decide case by case.', 'Still debated'],
    ['How actively governments should use policy to smooth the business cycle.', 'Still debated']
  ];
  G('macro.schools-of-thought', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var it = R.pick(SCH);
        return mc('Which school of thought is most closely linked to this view? “' + it[0] + '”', it[1], R.shuffle(others(SCH.map(function (x) { return x[1]; }), it[1])),
          [{ Classical: 'Classical economists stress flexible prices and self-correcting markets.', Keynesian: 'Keynesians stress sticky wages and prices and a role for fiscal policy in fighting recessions.', Monetarist: 'Monetarists, led by Milton Friedman, stress money growth as the cause of inflation and favor steady rules.', 'New classical (rational expectations)': 'New classical economists stress rational expectations, which limit what predictable policy can do.', 'New Keynesian': 'New Keynesians build sticky prices from firms’ and workers’ choices, so policy matters in the short run.' }[it[1]], 'Each school is a lens; most economists today borrow from several.'], 'Look for the key idea: flexible prices, sticky prices, money growth or expectations?');
      }],
      [1, function () {
        var it = R.pick(AGREE);
        return mc('Is this a point of broad agreement among economists, or still debated? “' + it[0] + '”', it[1], others(['Broad agreement', 'Still debated'], it[1]),
          [it[1] === 'Broad agreement' ? 'Economists from different schools accept this; the evidence across many countries and decades supports it.' : 'Careful studies reach different answers, and economists weigh the evidence differently.', 'Telling the agreed parts from the debated parts is part of thinking like an economist.'], 'Would economists of every school sign this?', { keep: true });
      }],
      [2, function () {
        var right = 'They agree on much, such as long-run money neutrality, and differ mainly on how fast markets adjust and how active policy should be';
        return mc('Which statement best describes how schools of macroeconomic thought relate today?', right,
          ['One school has been proven right and the others wrong', 'They disagree about everything, so economics has no settled findings', 'They differ only in the names they use for the same ideas'],
          ['Modern macroeconomics blends ideas from several schools.', 'The main splits are about the speed of adjustment (how sticky wages and prices are) and how much, and how actively, policy should respond.'], 'Think about agreement and disagreement together.');
      }]
    ])();
  });


  // =====================================================================================================
  // Unit 7: Economic Growth
  // =====================================================================================================

  G('macro.productivity', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var h = R.pick([20, 50, 100, 150, 200, 250, 300, 400]), p = R.pick([25, 30, 40, 45, 50, 60, 64, 75, 80, 90]), Y = h * p;
        return num('A country produces ' + bn(Y) + ' of real GDP with ' + h + ' billion hours of work in a year. What is its labor productivity, in dollars of output per hour?', p,
          ['Labor productivity = real output ÷ hours worked.', '$\\dfrac{' + cm(Y) + '\\text{ billion}}{' + h + '\\text{ billion hours}} = ' + p + '$ dollars per hour.'], 'Output per hour of work.', { unit: 'dollars per hour' });
      }],
      [2, function () {
        var gp = R.pick([0.5, 1, 1.2, 1.5, 1.8, 2, 2.5, 3]), gh = R.pick([-0.5, 0.2, 0.5, 0.8, 1, 1.5]), gy = U.fix(gp + gh);
        return num('Labor productivity grows ' + gp + '% a year and total hours worked grow ' + gh + '% a year. About how fast does real GDP grow?', gy,
          ['Real GDP = productivity × hours, so its growth rate ≈ productivity growth + hours growth.', '$' + T.num(gp) + '\\%' + (gh < 0 ? ' - ' + T.num(-gh) : ' + ' + T.num(gh)) + '\\% = ' + T.num(gy) + '\\%$.', 'Only the productivity part raises output per hour, which is what lifts living standards over time.'], 'Growth rates of a product add (approximately).', { pct: true, tol: 0.1 });
      }],
      [2, function () {
        var h1 = R.pick([50, 100, 200, 300]), p1 = R.pick([40, 50, 60, 80]), Y1 = h1 * p1, p2 = p1 + R.pick([1, 2, 3, 4, 5, 6, 10]), h2 = h1, Y2 = h2 * p2, g = U.round((p2 / p1 - 1) * 100, 1);
        return num('Last year a country produced ' + bn(Y1) + ' in ' + h1 + ' billion hours. This year it produced ' + bn(Y2) + ' in the same number of hours. By what percent did labor productivity grow? Round to one decimal place if needed.', g,
          ['Productivity last year: $' + cm(Y1) + ' \\div ' + h1 + ' = ' + p1 + '$ dollars per hour; this year: $' + cm(Y2) + ' \\div ' + h2 + ' = ' + p2 + '$.', 'Growth $= \\dfrac{' + p2 + ' - ' + p1 + '}{' + p1 + '} \\times 100 \\approx ' + T.num(g) + '\\%$.'], 'Find output per hour in each year first.', { pct: true, tol: 0.06 });
      }],
      [1, function () {
        var it = R.pick([['A delivery company buys faster trucks and better routing software.', 'Physical capital'], ['Workers take a training course that teaches them a new welding technique.', 'Human capital'], ['A new medical test makes diagnoses faster and cheaper for every clinic.', 'Technology'], ['A factory installs robots on its assembly line.', 'Physical capital'], ['More students finish college and enter skilled jobs.', 'Human capital'], ['Engineers invent a cheaper way to make solar panels.', 'Technology']]);
        return mc(it[0] + ' Which source of productivity growth is this mainly?', it[1], others(['Physical capital', 'Human capital', 'Technology', 'More hours of work'], it[1]),
          [{ 'Physical capital': 'More or better machines, buildings and equipment per worker.', 'Human capital': 'More skills, knowledge and education per worker.', Technology: 'Better ways of turning inputs into output, often new ideas that many firms can use.' }[it[1]], 'Working longer hours raises output, but not output per hour.'], 'Machines, skills or ideas?', { keep: true });
      }],
      [3, function () {
        var hA = R.pick([30, 35]), pA = R.pick([40, 50]), hB = hA + R.pick([5, 10]), pB = pA - R.pick([10, 15]);
        var yA = hA * pA, yB = hB * pB, right = yA > yB ? 'A produces more per worker each week, because its output per hour is much higher' : yA < yB ? 'B produces more per worker each week, but only by working more hours; A produces more per hour' : 'They produce the same per worker each week, but A does it in fewer hours';
        return mc('In country A people work ' + hA + ' hours a week and produce ' + $(pA) + ' per hour. In country B people work ' + hB + ' hours a week and produce ' + $(pB) + ' per hour. Which statement is true?', right,
          ['B is more productive, because people work more hours', 'A and B are equally productive', yA > yB ? 'B produces more per worker each week, because it works more hours' : 'A produces more per worker each week, because its output per hour is higher'],
          ['Weekly output per worker: A $' + hA + ' \\times ' + pA + ' = ' + yA + '$ dollars, B $' + hB + ' \\times ' + pB + ' = ' + yB + '$ dollars.', 'Productivity is output per hour: A ' + $(pA) + ', B ' + $(pB) + '. A is more productive and also enjoys more leisure.'], 'Compute output per worker per week, and compare output per hour separately.');
      }]
    ])();
  });

  G('macro.rule-of-70', function (R, ctx) {
    return choose(R, ctx, [
      [2, function () {
        var g = R.pick([1, 1.4, 2, 2.5, 3.5, 5, 7, 10]), k = R.pick([2, 3]), t = U.fix(k * 70 / g), f = Math.pow(2, k);
        return num('A city’s population grows ' + T.num(g) + '% a year. Using the rule of 70, about how many years until it is ' + f + ' times as large?', t,
          ['Doubling time ≈ $\\dfrac{70}{' + T.num(g) + '} = ' + T.num(U.fix(70 / g)) + '$ years.', 'Growing ' + f + ' times means ' + k + ' doublings ($2^{' + k + '} = ' + f + '$): $' + k + ' \\times ' + T.num(U.fix(70 / g)) + ' = ' + T.num(t) + '$ years.'], 'How many doublings make it ' + f + ' times as large?', { unit: 'years' });
      }],
      [1, function () {
        var P = R.int(1, 40) * 1000, g = R.pick([2, 3.5, 5, 7, 10, 14]), d = U.fix(70 / g), n = R.pick([1, 2, 3]), yrs = U.fix(d * n), v = P * Math.pow(2, n);
        return num('Income per person is ' + $(P) + ' and grows ' + g + '% a year. Using the rule of 70, about what will it be after ' + T.num(yrs) + ' years, in dollars?', v,
          ['Doubling time ≈ $\\dfrac{70}{' + g + '} = ' + T.num(d) + '$ years, so ' + T.num(yrs) + ' years is ' + n + ' doubling' + (n > 1 ? 's' : '') + '.', '$' + cm(P) + ' \\times 2^{' + n + '} = ' + cm(v) + '$ dollars.'], 'Count the doublings.', { unit: 'dollars' });
      }],
      [1, function () {
        var g = R.pick([0.5, 1, 1.4, 2, 2.5, 3.5, 4, 5, 7, 10, 14]), t = U.fix(70 / g);
        return num('Real GDP per person grows ' + g + '% a year. Using the rule of 70, about how many years will it take to double?', t,
          ['Rule of 70: doubling time ≈ $\\dfrac{70}{\\text{growth rate in percent}}$.', '$\\dfrac{70}{' + T.num(g) + '} = ' + T.num(t) + '$ years.'], 'Divide 70 by the growth rate (as a percent, not a decimal).', { unit: 'years' });
      }],
      [2, function () {
        var t = R.pick([5, 7, 10, 14, 20, 25, 28, 35, 50, 70, 140]), g = U.fix(70 / t);
        return num('A country wants its income per person to double in ' + t + ' years. Using the rule of 70, about what yearly growth rate does it need?', g,
          ['From doubling time ≈ 70 ÷ g: $g \\approx \\dfrac{70}{\\text{doubling time}}$.', '$\\dfrac{70}{' + t + '} = ' + T.num(g) + '\\%$ a year.'], 'Turn the rule around: divide 70 by the years.', { pct: true });
      }],
      [2, function () {
        var g = R.pick([1, 2, 3.5, 5, 7, 10, 14]), d = U.fix(70 / g), n = R.pick([2, 3, 4]), years = d * n, mult = Math.pow(2, n);
        return num('An economy grows ' + g + '% a year. Using the rule of 70, about how many times larger will it be after ' + T.num(years) + ' years?', mult,
          ['Doubling time ≈ $\\dfrac{70}{' + T.num(g) + '} = ' + T.num(d) + '$ years.', T.num(years) + ' years is ' + n + ' doublings: $2^{' + n + '} = ' + mult + '$.', 'Growth compounds: each doubling builds on the last.'], 'Count the doublings, then multiply by 2 that many times.');
      }],
      [3, function () {
        var gA = R.pick([1, 2]), gB = gA * 2, years = 70, mA = Math.pow(2, years * gA / 70), mB = Math.pow(2, years * gB / 70);
        return num('Two countries start with the same income per person. A grows ' + gA + '% a year and B grows ' + gB + '% a year. Using the rule of 70, after 70 years B’s income per person is about how many times A’s?', U.fix(mB / mA),
          ['A doubles every $\\dfrac{70}{' + gA + '} = ' + (70 / gA) + '$ years: ' + (70 * gA / 70) + ' doubling' + (gA > 1 ? 's' : '') + ' in 70 years, a factor of ' + mA + '.', 'B doubles every $\\dfrac{70}{' + gB + '} = ' + (70 / gB) + '$ years: ' + (gB) + ' doublings, a factor of ' + mB + '.', 'Ratio: $\\dfrac{' + mB + '}{' + mA + '} = ' + U.fix(mB / mA) + '$. A small gap in growth rates becomes a big gap in living standards.'], 'Find each country’s growth factor first.');
      }],
      [1, function () {
        var g = R.pick([5, 10]), base = 100, add = base * Math.pow(1 + g / 100, 20), lin = base + 20 * base * g / 100;
        var right = 'More than ' + $(lin) + ', because each year’s growth builds on the last';
        return mc('An investment of ' + $(base) + ' grows ' + g + '% a year for 20 years. How much is it worth then?', right,
          ['Exactly ' + $(lin) + ', adding ' + $(base * g / 100) + ' each year', 'Less than ' + $(lin) + ', because growth slows over time', 'Exactly ' + $(base * 2) + ', because it doubles once'],
          ['Adding ' + $(base * g / 100) + ' a year would give ' + $(lin) + ', but growth compounds: year two adds ' + g + '% of the bigger amount.', 'With compounding it reaches about ' + $(Math.round(add)) + '.'], 'Does each year add the same amount, or the same percent?');
      }, 2]
    ])();
  });

  var GP = [
    ['Government funding for basic scientific research', 'Shifts LRAS right (raises potential output)'],
    ['Better schools and job-training programs', 'Shifts LRAS right (raises potential output)'],
    ['Stronger protection of property rights and patents', 'Shifts LRAS right (raises potential output)'],
    ['A larger labor force through population growth or immigration', 'Shifts LRAS right (raises potential output)'],
    ['A one-time tax rebate that households spend on consumer goods', 'Shifts only AD'],
    ['A rise in consumer confidence', 'Shifts only AD'],
    ['Lower interest rates that raise spending on cars and appliances', 'Shifts only AD'],
    ['Building new highways, ports and broadband networks', 'Shifts AD now and LRAS later'],
    ['A tax credit that encourages firms to buy new equipment', 'Shifts AD now and LRAS later'],
    ['Public funding for new power plants and water systems', 'Shifts AD now and LRAS later'],
    ['Faster approval of new patents for useful inventions', 'Shifts LRAS right (raises potential output)'],
    ['Programs that help workers learn the skills employers need', 'Shifts LRAS right (raises potential output)'],
    ['A rise in household wealth after a stock market boom', 'Shifts only AD'],
    ['A temporary increase in government purchases of office supplies', 'Shifts only AD']
  ];
  G('macro.growth-policy', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var it = R.pick(GP);
        return mc(it[0] + '. In the AD–AS model, what does this mainly do?', it[1], others(['Shifts LRAS right (raises potential output)', 'Shifts only AD', 'Shifts AD now and LRAS later'], it[1]),
          [{ 'Shifts LRAS right (raises potential output)': 'It adds to capital, skills, technology or the labor force, so the economy can produce more: LRAS and the PPC shift out.', 'Shifts only AD': 'It raises spending but adds nothing to the economy’s capacity, so potential output is unchanged.', 'Shifts AD now and LRAS later': 'The spending raises AD today, and the new capital it builds raises potential output later.' }[it[1]]], 'Does it add to the economy’s capacity to produce?', { keep: true });
      }],
      [2, function () {
        var right = R.pick(GP.filter(function (x) { return x[1] !== 'Shifts only AD'; })), wr = R.sample(GP.filter(function (x) { return x[1] === 'Shifts only AD'; }), 3);
        return mc('Which policy is most likely to raise long-run economic growth?', right[0], wr.map(function (x) { return x[0]; }),
          [right[0] + ': ' + right[1].toLowerCase() + '.', 'The others raise spending for a while but leave the economy’s capacity unchanged.'], 'Look for more capital, skills, technology or workers.');
      }],
      [3, function () {
        var gp = R.pick([1, 1.5, 2]), gl = R.pick([0.5, 1]), g = U.fix(gp + gl);
        return num('Policies raise labor productivity growth to ' + gp + '% a year, and the labor force (and hours worked) grows ' + gl + '% a year. About how fast does potential output grow?', g,
          ['Potential output = output per hour × hours, so its growth ≈ productivity growth + hours growth.', '$' + gp + '\\% + ' + gl + '\\% = ' + T.num(g) + '\\%$: LRAS shifts right by about that much each year.'], 'Add the two growth rates.', { pct: true, tol: 0.1 });
      }]
    ])();
  });

  // =====================================================================================================
  // Unit 8: The Open Economy
  // =====================================================================================================

  var BOPI = [
    ['A U.S. farm sells soybeans to a buyer in China.', 'Current account'],
    ['An American family buys a car made in Germany.', 'Current account'],
    ['An American investor receives dividends from shares of a Japanese company.', 'Current account'],
    ['A worker in the U.S. sends money to her family in Mexico.', 'Current account'],
    ['A Japanese bank buys U.S. Treasury bonds.', 'Financial account'],
    ['An American buys shares of a British company.', 'Financial account'],
    ['A U.S. company builds a new factory in Brazil.', 'Financial account'],
    ['A German firm buys an office building in Chicago.', 'Financial account'],
    ['A U.S. software company sells licenses to customers in India.', 'Current account'],
    ['An American tourist pays for a hotel in Paris.', 'Current account'],
    ['A U.S. company pays interest to foreign holders of its bonds.', 'Current account'],
    ['A Canadian pension fund buys shares of a U.S. company.', 'Financial account'],
    ['An American opens a bank account in Switzerland and deposits money in it.', 'Financial account']
  ];
  G('macro.balance-of-payments', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var it = R.pick(BOPI);
        return mc('In the U.S. balance of payments, where is this recorded? ' + it[0], it[1], others(['Current account', 'Financial account'], it[1]).concat(['Not recorded: it is not a trade']),
          [it[1] === 'Current account' ? 'The current account records trade in goods and services, income from investments abroad, and transfers.' : 'The financial account records purchases of financial and real assets across borders: stocks, bonds, factories, buildings.'], 'Is something produced, earned or given, or is an asset bought?', { keep: true });
      }],
      [2, function () {
        var X = R.pick([1500, 2000, 2400, 2500, 3000]), M = X + R.pick([-100, 200, 400, 600, 800]), inc = R.pick([100, 150, 200, -50]), tr = -R.pick([50, 100, 150]), CA = X - M + inc + tr;
        return num('In billions of dollars: exports of goods and services ' + cm(X) + ', imports of goods and services ' + cm(M) + ', net income from investments abroad ' + (inc < 0 ? '−' + (-inc) : '+' + inc) + ', net transfers ' + (tr < 0 ? '−' + (-tr) : '+' + tr) + '. What is the current account balance, in billions of dollars? (Negative for a deficit.)', CA,
          ['Trade balance $= ' + cm(X) + ' - ' + cm(M) + ' = ' + (X - M) + '$.', 'Current account $= ' + (X - M) + T.signed(inc) + T.signed(tr) + ' = ' + CA + '$ billion dollars.'], 'Add the trade balance, net income and net transfers.', { unit: UB });
      }],
      [2, function () {
        var CA = -R.pick([150, 200, 300, 400, 500, 600, 750, 800, 900]), KA = R.pick([0, 0, -5, 5, -10]), FA = -CA - KA;
        return num('A country’s current account balance is ' + bn(CA).replace('\\$-', '−\\$') + (KA ? ' and its capital account balance is ' + (KA < 0 ? '−' : '') + bn(Math.abs(KA)) : ' and its capital account is about zero') + '. Using the convention that a net inflow of foreign capital is a financial account surplus, what is the financial account balance, in billions of dollars?', FA,
          ['The accounts must sum to zero: current + capital + financial = 0.', 'Financial account $= -(' + CA + T.signed(KA) + ') = ' + FA + '$ billion dollars, a surplus.', 'The country pays for its extra imports by selling assets to foreigners (or borrowing from them): a net inflow of foreign capital.'], 'The balance of payments always balances.', { unit: UB });
      }],
      [2, function () {
        var right = 'Foreigners use the dollars they earn to buy U.S. assets, so the financial account shows a matching surplus';
        return mc('The United States runs a trade deficit. Which statement is true?', right,
          ['Money drains out of the country and is gone for good', 'The financial account must also show a deficit', 'The country must be producing less than last year'],
          ['When Americans buy more abroad than they sell, foreigners end up holding the extra dollars.', 'They use them to buy U.S. stocks, bonds and other assets: a capital inflow, recorded as a financial account surplus that offsets the current account deficit.'], 'What do foreigners do with the dollars they receive?');
      }, 3]
    ])();
  });

  var FXP = [['yen', 'dollar', '¥', [100, 110, 120, 125, 130, 140, 150, 160]], ['euros', 'dollar', '€', [0.8, 0.9, 1.1, 1.2]], ['pesos', 'dollar', 'MX$', [16, 18, 20, 25]], ['Canadian dollars', 'U.S. dollar', 'C$', [1.25, 1.3, 1.4, 1.5]]];
  G('macro.exchange-rates', function (R, ctx) {
    var fx = R.pick(FXP);
    return choose(R, ctx, [
      [1, function () {
        var e = R.pick(fx[3]), amt = R.pick([20, 50, 100, 200, 500]), v = U.fix(amt * e);
        return num('The exchange rate is ' + T.num(e) + ' ' + fx[0] + ' per ' + fx[1] + '. How many ' + fx[0] + ' do you get for ' + $(amt) + '?', v,
          ['Multiply dollars by ' + fx[0] + ' per dollar; the dollars cancel.', '$' + amt + ' \\times ' + T.num(e) + ' = ' + cm(v) + '$ ' + fx[0] + '.'], 'Check the units: dollars × (' + fx[0] + ' per dollar) = ' + fx[0] + '.', { unit: fx[0] });
      }],
      [2, function () {
        var e = R.pick([0.8, 1.25, 0.5, 2, 1.6, 0.625, 1.1, 0.9]), inv = U.round(1 / e, 2), exact = Math.abs(1 / e - inv) < 1e-9;
        return num('One dollar buys ' + T.num(e) + ' euros. How many dollars does one euro buy?' + (exact ? '' : ' Round to two decimal places.'), inv,
          ['The two exchange rates are reciprocals: dollars per euro $= \\dfrac{1}{\\text{euros per dollar}}$.', '$\\dfrac{1}{' + T.num(e) + '} ' + (exact ? '= ' : '\\approx ') + T.num(inv) + '$ dollars per euro.'], 'Flip the rate.', { unit: 'dollars per euro', tol: exact ? null : 0.006 });
      }],
      [1, function () {
        var a = R.pick(fx[3]), b = R.pick(fx[3].filter(function (x) { return x !== a; })), up = b > a, right = up ? 'The ' + fx[1] + ' appreciated' : 'The ' + fx[1] + ' depreciated';
        return mc('The exchange rate moves from ' + T.num(a) + ' to ' + T.num(b) + ' ' + fx[0] + ' per ' + fx[1] + '. What happened?', right, others(['The ' + fx[1] + ' appreciated', 'The ' + fx[1] + ' depreciated', 'Neither currency changed value'], right),
          ['Read the units: the number is how many ' + fx[0] + ' one ' + fx[1] + ' buys.', up ? 'A ' + fx[1] + ' now buys more ' + fx[0] + ', so the ' + fx[1] + ' appreciated and the other currency depreciated.' : 'A ' + fx[1] + ' now buys fewer ' + fx[0] + ', so the ' + fx[1] + ' depreciated and the other currency appreciated.'], 'Does one ' + fx[1] + ' buy more or less than before?', { keep: true });
      }],
      [3, function () {
        var pr = R.pick([[100, 125], [120, 150], [80, 100], [125, 100], [150, 120], [100, 80]]), a = pr[0], b = pr[1], ask = R.pick(['yen', 'dollar']);
        var dUp = U.fix((b / a - 1) * 100), yUp = U.fix((a / b - 1) * 100), v = ask === 'dollar' ? dUp : yUp;
        return num('The exchange rate goes from ' + a + ' to ' + b + ' yen per dollar. By what percent did the ' + ask + '’s value change? (Positive for an appreciation, negative for a depreciation.)', v,
          ask === 'dollar' ? ['The dollar’s price in yen went from ' + a + ' to ' + b + '.', '$\\dfrac{' + b + ' - ' + a + '}{' + a + '} \\times 100 = ' + T.num(dUp) + '\\%$.'] : ['The yen’s price in dollars is the reciprocal: $\\dfrac{1}{' + a + '}$ before, $\\dfrac{1}{' + b + '}$ after.', 'Percent change $= \\dfrac{1/' + b + ' - 1/' + a + '}{1/' + a + '} \\times 100 = \\left(\\dfrac{' + a + '}{' + b + '} - 1\\right) \\times 100 = ' + T.num(yUp) + '\\%$.', 'The dollar changed by $' + T.num(dUp) + '\\%$: the two changes are not the same size.'], ask === 'dollar' ? 'Percent change in yen per dollar.' : 'Work with the yen’s own price: dollars per yen.', { pct: true });
      }],
      [2, function () {
        var e = R.pick([1.1, 1.2, 1.25, 1.5]), p = R.pick([20, 40, 50, 80, 100]), v = U.fix(p * e);
        return num('One euro costs ' + $(e) + '. A handbag sells for ' + p + ' euros in Italy. What does it cost in dollars?', v,
          ['Multiply euros by dollars per euro.', '$' + p + ' \\times ' + T.num(e) + ' = ' + T.num(v) + '$ dollars.'], 'Use the rate in dollars per euro.', { unit: 'dollars' });
      }]
    ])();
  });

  var FXM = [
    ['A Japanese company buys U.S. Treasury bonds.', 'Demand for dollars'],
    ['European tourists visit New York.', 'Demand for dollars'],
    ['A British store imports blue jeans made in the United States.', 'Demand for dollars'],
    ['An American buys a car made in Germany.', 'Supply of dollars'],
    ['An American family vacations in Mexico.', 'Supply of dollars'],
    ['A U.S. pension fund buys shares of a French company.', 'Supply of dollars'],
    ['A Korean student pays tuition to a U.S. university.', 'Demand for dollars'],
    ['A Brazilian company builds a factory in Texas.', 'Demand for dollars'],
    ['A U.S. coffee shop buys beans from Colombia.', 'Supply of dollars'],
    ['A U.S. company builds a factory in Vietnam.', 'Supply of dollars'],
    ['A Canadian buys a U.S. company’s bonds.', 'Demand for dollars'],
    ['An American buys a Swiss watch.', 'Supply of dollars']
  ];
  G('macro.forex-market', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var side = R.pick(['Demand for dollars', 'Supply of dollars']), right = R.pick(FXM.filter(function (x) { return x[1] === side; })), wr = R.sample(FXM.filter(function (x) { return x[1] !== side; }), 3);
        return mc('Which of these adds to the ' + side.toLowerCase() + ' in the foreign exchange market?', right[0].replace(/\.$/, ''), wr.map(function (x) { return x[0].replace(/\.$/, ''); }),
          [right[0].replace(/\.$/, '') + ': ' + (side === 'Demand for dollars' ? 'someone abroad needs dollars to buy U.S. goods, services or assets.' : 'an American sells dollars to buy foreign currency.'), 'The others add to the ' + (side === 'Demand for dollars' ? 'supply' : 'demand') + ' instead.'], 'Who has to swap currencies, and which way?');
      }],
      [2, function () {
        var e = R.pick([0.8, 0.9, 1.1, 1.2]), b = R.pick([50, 100, 200]), Q = R.pick([40, 50, 60, 80]), a = U.fix(Q + b * e), cc = U.fix(Q - b * e), e1 = U.fix(e + R.pick([-0.1, 0.1, 0.2, -0.2])), qd = U.fix(a - b * e1), qs = U.fix(cc + b * e1), gap = U.fix(Math.abs(qd - qs));
        return num('In the market for dollars, demand is $Q_D = ' + T.num(a) + ' - ' + b + 'e$ and supply is $Q_S = ' + T.num(cc) + ' + ' + b + 'e$ (billions of dollars a day; $e$ in euros per dollar). At $e = ' + T.num(e1) + '$, how big is the ' + (qd > qs ? 'shortage' : 'surplus') + ' of dollars, in billions?', gap,
          ['At $e = ' + T.num(e1) + '$: $Q_D = ' + T.num(a) + ' - ' + b + ' \\times ' + T.num(e1) + ' = ' + T.num(qd) + '$ and $Q_S = ' + T.num(cc) + ' + ' + b + ' \\times ' + T.num(e1) + ' = ' + T.num(qs) + '$.', (qd > qs ? 'Shortage' : 'Surplus') + ' $= ' + T.num(gap) + '$ billion dollars, so the dollar will ' + (qd > qs ? 'appreciate toward ' : 'depreciate toward ') + T.num(e) + ' euros.'], 'Plug the exchange rate into both equations.', { unit: UB });
      }, 3],
      [1, function () {
        var it = R.pick(FXM);
        return mc(it[0] + ' In the foreign exchange market for dollars, what does this add to?', it[1], ['Demand for dollars', 'Supply of dollars', 'Neither'].filter(function (x) { return x !== it[1]; }),
          [it[1] === 'Demand for dollars' ? 'Foreigners must get dollars to buy U.S. goods, services or assets, so they demand dollars.' : 'Americans must sell dollars to get foreign currency to buy foreign goods, services or assets, so they supply dollars.'], 'Who needs to swap currencies, and which way?', { keep: true });
      }],
      [2, function () {
        var it = R.pick([['Europeans want more U.S. goods, so the demand for dollars rises.', 'The supply of euros increases'], ['Americans want more European goods, so the supply of dollars rises.', 'The demand for euros increases'], ['Europeans want fewer U.S. assets, so the demand for dollars falls.', 'The supply of euros decreases'], ['Americans buy fewer European goods, so the supply of dollars falls.', 'The demand for euros decreases']]);
        return mc(it[0] + ' What happens in the mirror market for euros?', it[1], others(['The supply of euros increases', 'The supply of euros decreases', 'The demand for euros increases', 'The demand for euros decreases'], it[1]),
          ['Every trade of currencies has two sides. To buy dollars, Europeans must sell (supply) euros; to buy euros, Americans must sell (supply) dollars.', 'So demand for dollars is supply of euros, and supply of dollars is demand for euros.'], 'To get dollars, what must a European give up?', { keep: true, viz: { name: 'ec-forex', opts: { quiet: true, interactive: false } } });
      }],
      [3, function () {
        var e = R.pick([0.8, 0.85, 0.9, 0.95, 1.05, 1.1, 1.2]), b = R.pick([50, 100, 200]), Q = R.pick([40, 50, 60, 80, 100]), a = U.fix(Q + b * e), cc = U.fix(Q - b * e);
        return num('In the market for dollars (quantities in billions of dollars a day), demand is $Q_D = ' + T.num(a) + ' - ' + b + 'e$ and supply is $Q_S = ' + T.num(cc) + ' + ' + b + 'e$, where $e$ is the price of a dollar in euros. What is the equilibrium exchange rate, in euros per dollar?', e,
          ['Set $Q_D = Q_S$: $' + T.num(a) + ' - ' + b + 'e = ' + T.num(cc) + ' + ' + b + 'e$.', '$' + T.num(U.fix(a - cc)) + ' = ' + (2 * b) + 'e$, so $e = ' + T.num(e) + '$ euros per dollar.', 'Check: $Q = ' + T.num(a) + ' - ' + b + ' \\times ' + T.num(e) + ' = ' + Q + '$ billion dollars a day.'], 'Set demand equal to supply and solve for e.', { unit: 'euros per dollar' });
      }]
    ])();
  });

  var FXS = [
    ['U.S. real interest rates rise compared with Europe’s.', 'Demand for dollars rises; the dollar appreciates', 'European savers want higher-paying U.S. assets, so they need dollars.'],
    ['Incomes in Europe rise.', 'Demand for dollars rises; the dollar appreciates', 'Europeans buy more U.S. goods, which takes dollars.'],
    ['European tastes shift toward U.S.-made goods.', 'Demand for dollars rises; the dollar appreciates', 'More European purchases of U.S. goods mean more demand for dollars.'],
    ['Incomes in the United States rise.', 'Supply of dollars rises; the dollar depreciates', 'Americans buy more imports, selling dollars to get foreign currency.'],
    ['Inflation in the U.S. rises faster than in Europe.', 'The dollar depreciates', 'U.S. goods get pricier: Europeans want fewer dollars and Americans supply more dollars to buy cheaper European goods.'],
    ['European interest rates rise compared with U.S. rates.', 'Supply of dollars rises; the dollar depreciates', 'American savers buy European assets, selling dollars for euros.'],
    ['Americans want more European goods.', 'Supply of dollars rises; the dollar depreciates', 'Americans sell dollars to buy euros.'],
    ['Inflation in Europe rises faster than in the United States.', 'The dollar appreciates', 'European goods get pricier, so Europeans buy more U.S. goods and Americans buy fewer European goods.'],
    ['Investors expect the dollar to rise in value soon.', 'Demand for dollars rises; the dollar appreciates', 'Investors buy dollars now to profit later, raising demand for dollars.'],
    ['A recession in Europe cuts European incomes.', 'Demand for dollars falls; the dollar depreciates', 'Europeans buy fewer U.S. goods, so they demand fewer dollars.'],
    ['U.S. real interest rates fall compared with Europe’s.', 'Demand for dollars falls; the dollar depreciates', 'U.S. assets pay less, so foreign savers want fewer dollars.'],
    ['Americans’ tastes shift toward European cars and wine.', 'Supply of dollars rises; the dollar depreciates', 'Americans sell dollars to buy euros for European goods.']
  ];
  G('macro.forex-shifts', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var appr = R.coin(), right = R.pick(FXS.filter(function (x) { return /appreciates/.test(x[1]) === appr; })), wr = R.sample(FXS.filter(function (x) { return /appreciates/.test(x[1]) !== appr; }), 3);
        return mc('Which of these would tend to make the dollar ' + (appr ? 'appreciate' : 'depreciate') + ' against the euro?', right[0].replace(/\.$/, ''), wr.map(function (x) { return x[0].replace(/\.$/, ''); }),
          [right[0].replace(/\.$/, '') + ': ' + right[2].charAt(0).toLowerCase() + right[2].slice(1), 'The others push the dollar the other way.'], 'Ask who wants more dollars, or who wants to sell more dollars.');
      }],
      [1, function () {
        var it = R.pick(FXS), appr = /appreciates/.test(it[1]), right = appr ? 'The dollar appreciates against the euro' : 'The dollar depreciates against the euro';
        return mc(it[0] + ' What happens to the value of the dollar against the euro?', right, others(['The dollar appreciates against the euro', 'The dollar depreciates against the euro', 'Nothing: exchange rates are fixed by governments'], right),
          [it[2], it[1] + '.'], 'Who wants more dollars, or who wants to sell more dollars?', { keep: true, viz: { name: 'ec-forex', opts: { quiet: true, interactive: false } } });
      }],
      [2, function () {
        var it = R.pick(FXS), appr = /appreciates/.test(it[1]), right = appr ? 'The euro depreciates' : 'The euro appreciates';
        return mc(it[0] + ' What happens to the euro’s value against the dollar?', right, others(['The euro appreciates', 'The euro depreciates', 'The euro does not change'], right),
          [it[2], 'So the dollar ' + (appr ? 'appreciates' : 'depreciates') + '. In the mirror market, the euro moves the opposite way: it ' + (appr ? 'depreciates' : 'appreciates') + '.'], 'Find what happens to the dollar, then flip it.', { keep: true });
      }],
      [2, function () {
        var right = 'It tends to depreciate, because U.S. goods become more expensive compared with foreign goods';
        return mc('Inflation in the United States is much higher than in its trading partners for several years. What tends to happen to the dollar?', right,
          ['It tends to appreciate, because prices in dollars are higher', 'It does not change, because inflation affects only domestic prices', 'It tends to appreciate, because higher inflation always raises interest rates'],
          ['Higher U.S. prices make U.S. goods less attractive to foreigners (less demand for dollars) and foreign goods more attractive to Americans (more supply of dollars).', 'Both push the dollar down.'], 'What happens to the appeal of U.S. goods?');
      }],
      [3, function () {
        var e = R.pick([0.8, 0.85, 0.9, 1.0, 1.1, 1.2]), b = 100, Q = R.pick([50, 60, 80, 100]), a = U.fix(Q + b * e), cc = U.fix(Q - b * e), dD = R.pick([10, -10, 20, -20, 30, 40, -40]), e2 = U.fix(e + dD / (2 * b));
        return num('In the market for dollars, demand is $Q_D = ' + T.num(a) + ' - ' + b + 'e$ and supply is $Q_S = ' + T.num(cc) + ' + ' + b + 'e$ ($e$ in euros per dollar, quantities in billions of dollars a day), so $e = ' + T.num(e) + '$. ' + (dD > 0 ? 'U.S. interest rates rise, and demand for dollars increases by ' + dD : 'U.S. assets become less attractive, and demand for dollars falls by ' + (-dD)) + ' billion at every exchange rate. What is the new exchange rate, in euros per dollar?', e2,
          ['New demand: $Q_D = ' + T.num(U.fix(a + dD)) + ' - ' + b + 'e$.', 'Set equal to supply: $' + T.num(U.fix(a + dD)) + ' - ' + b + 'e = ' + T.num(cc) + ' + ' + b + 'e$, so $e = \\dfrac{' + T.num(U.fix(a + dD - cc)) + '}{' + (2 * b) + '} = ' + T.num(e2) + '$.', 'The dollar ' + (dD > 0 ? 'appreciated' : 'depreciated') + ' from ' + T.num(e) + ' to ' + T.num(e2) + ' euros per dollar.'], 'Shift demand, then solve again.', { unit: 'euros per dollar' });
      }]
    ])();
  });

  G('macro.net-exports-exchange', function (R, ctx) {
    return choose(R, ctx, [
      [1, function () {
        var p = R.pick([20, 30, 40, 50, 60, 80, 100, 150]), e1 = R.pick([0.8, 0.85, 0.9]), e2 = R.pick([1.05, 1.1, 1.2]), up = R.coin(), a = up ? e1 : e2, b = up ? e2 : e1, v = U.fix(p * b);
        return num('A pair of U.S.-made boots costs ' + $(p) + '. The exchange rate moves from ' + T.num(a) + ' to ' + T.num(b) + ' euros per dollar. What do the boots now cost a buyer in Europe, in euros?', v,
          ['Price in euros = price in dollars × euros per dollar.', 'Before: $' + p + ' \\times ' + T.num(a) + ' = ' + T.num(U.fix(p * a)) + '$ euros. Now: $' + p + ' \\times ' + T.num(b) + ' = ' + T.num(v) + '$ euros.', up ? 'The dollar appreciated, so U.S. goods got dearer abroad: exports tend to fall.' : 'The dollar depreciated, so U.S. goods got cheaper abroad: exports tend to rise.'], 'Convert the dollar price at the new rate.', { unit: 'euros' });
      }],
      [1, function () {
        var up = R.coin(), v = R.pick(['X', 'M', 'NX', 'AD']);
        var ans = { X: up ? 'Falls' : 'Rises', M: up ? 'Rises' : 'Falls', NX: up ? 'Falls' : 'Rises', AD: up ? 'Falls' : 'Rises' }[v], name = { X: 'U.S. exports', M: 'U.S. imports', NX: 'U.S. net exports', AD: 'U.S. aggregate demand' }[v];
        return mc('The dollar ' + (up ? 'appreciates' : 'depreciates') + ' against other currencies. What happens to ' + name + '?', ans, others(['Rises', 'Falls', 'Does not change'], ans),
          ['A ' + (up ? 'stronger' : 'weaker') + ' dollar makes U.S. goods ' + (up ? 'dearer' : 'cheaper') + ' for foreigners and foreign goods ' + (up ? 'cheaper' : 'dearer') + ' for Americans.', 'Exports ' + (up ? 'fall' : 'rise') + ', imports ' + (up ? 'rise' : 'fall') + ', so net exports ' + (up ? 'fall' : 'rise') + ' and AD shifts ' + (up ? 'left' : 'right') + '.'], 'What does the exchange rate do to prices across borders?', { keep: true });
      }],
      [2, function () {
        var v = R.pick([20, 40, 50, 80, 100, 120, 200]), e = R.pick([1.2, 1.5, 0.75, 0.6, 1.25, 0.8, 0.9]), p = U.fix(v * e);
        return num('A camera made in Germany costs ' + p + ' euros. One dollar buys ' + T.num(e) + ' euros. What does the camera cost an American, in dollars?', v,
          ['Dollars = euros ÷ (euros per dollar).', '$\\dfrac{' + p + '}{' + T.num(e) + '} = ' + T.num(v) + '$ dollars.'], 'Divide euros by euros per dollar.', { unit: 'dollars' });
      }],
      [2, function () {
        var right = 'Exporters and the firms that compete with imports';
        return mc('The dollar appreciates sharply. Which group in the United States is most likely to be hurt?', right,
          ['American tourists traveling abroad', 'American stores that sell imported goods', 'American families buying imported goods'],
          ['A strong dollar makes U.S. goods dearer abroad and imports cheaper at home, so exporters and firms competing with imports lose sales.', 'Tourists, importers and buyers of imports gain. A strong currency is not good or bad for everyone: it helps some groups and hurts others.'], 'Who sells U.S. goods priced in dollars to foreigners?', { viz: { name: 'ec-forex', opts: { nx: true, quiet: true, interactive: false } } });
      }, 3]
    ])();
  });

  G('macro.capital-flows', function (R, ctx) {
    return choose(R, ctx, [
      [2, function () {
        var r1 = R.pick([2, 3, 4, 5]), r2 = r1 + R.pick([0.5, 1, 1.5, 2]), amt = R.pick([1000, 5000, 10000, 50000, 100000]), diff = U.fix(amt * (r2 - r1) / 100), home = R.coin();
        return num('A saver with ' + $(amt) + ' can earn ' + T.num(home ? r2 : r1) + '% a year on U.S. bonds or ' + T.num(home ? r1 : r2) + '% on similar European bonds. Ignoring exchange-rate changes and risk, how many more dollars of interest a year does the better choice pay?', diff,
          ['U.S.: $' + cm(amt) + ' \\times ' + T.num((home ? r2 : r1) / 100) + ' = ' + cm(U.fix(amt * (home ? r2 : r1) / 100)) + '$; Europe: $' + cm(amt) + ' \\times ' + T.num((home ? r1 : r2) / 100) + ' = ' + cm(U.fix(amt * (home ? r1 : r2) / 100)) + '$.', 'Difference: ' + $(diff) + ' a year. Savers move funds toward the higher return, so financial capital flows ' + (home ? 'into the United States, raising demand for dollars.' : 'toward Europe, raising the supply of dollars as savers swap them for euros.')], 'Work out the interest each choice pays.', { unit: 'dollars' });
      }],
      [1, function () {
        var up = R.coin(), part = R.int(0, 3);
        if (part > 0) {
          var cause = R.coin() ? 'The real interest rate in the United States ' + (up ? 'rises' : 'falls') + ' compared with other countries.' : 'Investors around the world come to see U.S. assets as ' + (up ? 'safer' : 'riskier') + ' than before, with returns unchanged.';
          var why = [up ? 'U.S. assets become more attractive, so foreign savers buy them. To buy them, they first buy dollars.' : 'U.S. assets become less attractive, so savers move funds abroad and sell dollars for foreign currency.', 'Demand for dollars ' + (up ? 'rises' : 'falls') + ', so the dollar ' + (up ? 'appreciates' : 'depreciates') + '.'];
          var vzf = { keep: true, viz: { name: 'ec-forex', opts: { quiet: true, interactive: false } } };
          if (part === 1) return mc(cause + ' Which way does financial capital flow?', up ? 'Into the United States' : 'Out of the United States', up ? ['Out of the United States', 'It does not move'] : ['Into the United States', 'It does not move'], why, 'Where do savers want to put their money?', vzf);
          if (part === 2) return mc(cause + ' What happens to the value of the dollar?', up ? 'It appreciates' : 'It depreciates', up ? ['It depreciates', 'It does not change'] : ['It appreciates', 'It does not change'], why, 'Follow the demand for dollars.', vzf);
          return mc(cause + ' What happens to the demand for dollars in the foreign exchange market?', up ? 'It increases' : 'It decreases', up ? ['It decreases', 'It does not change'] : ['It increases', 'It does not change'], why, 'To buy U.S. assets, investors need dollars.', vzf);
        }
        var right = up ? 'Foreign financial capital flows in, demand for dollars rises, and the dollar appreciates' : 'Financial capital flows out, demand for dollars falls, and the dollar depreciates';
        return mc('The real interest rate in the United States ' + (up ? 'rises' : 'falls') + ' compared with other countries. What happens?', right,
          [up ? 'Borrowing costs more, so the dollar depreciates' : 'Borrowing costs less, so the dollar appreciates', up ? 'Foreign capital flows out, and the dollar depreciates' : 'Foreign capital flows in, and the dollar appreciates', 'Nothing: interest rates do not affect exchange rates'],
          [up ? 'Higher returns draw foreign savers to U.S. assets. To buy them, they must first buy dollars.' : 'Lower returns send savers to foreign assets, so they sell dollars to buy foreign currency.', 'So the dollar ' + (up ? 'appreciates' : 'depreciates') + '.'], 'Where do savers want to put their money?', { keep: true, viz: { name: 'ec-forex', opts: { quiet: true, interactive: false } } });
      }],
      [2, function () {
        var right = 'Real interest rate rises → foreign capital flows in → dollar appreciates → net exports fall';
        return mc('The U.S. government runs a larger budget deficit and borrows more. Which chain shows the likely effects?', right,
          ['Real interest rate falls → capital flows out → dollar depreciates → net exports rise', 'Real interest rate rises → capital flows out → dollar depreciates → net exports rise', 'Real interest rate rises → foreign capital flows in → dollar depreciates → net exports rise'],
          ['More government borrowing raises demand for loanable funds, so the real interest rate rises.', 'Higher U.S. returns draw in foreign capital, raising demand for dollars: the dollar appreciates.', 'A stronger dollar makes exports dearer and imports cheaper, so net exports fall.'], 'Start in the loanable funds market and end with net exports.', { viz: { name: 'ec-loanable', opts: { quiet: true, interactive: false } } });
      }],
      [2, function () {
        var right = 'The supply of loanable funds increases, so the real interest rate falls';
        return mc('Foreign savers send a large new flow of funds into a country. In that country’s loanable funds market, what happens?', right,
          ['The demand for loanable funds increases, so the real interest rate rises', 'The supply of loanable funds decreases, so the real interest rate rises', 'Nothing: foreign funds are not part of the market'],
          ['Foreign saving adds to the funds available to lend: supply shifts right.', 'The real interest rate falls and domestic investment rises.'], 'Are foreigners lending or borrowing here?');
      }],
      [3, function () {
        var s = R.pick([0.01, 0.02, 0.005]), r = R.pick([3, 4, 5, 6]), Q = R.pick([100, 200, 300, 400].filter(function (q) { return r - s * q >= 1; })), X = R.pick([40, 100, 200]), a = U.fix(r - s * Q), cc = U.fix(r + s * Q), r1 = U.fix(r - s * X / 2), Q1 = U.fix(Q + X / 2);
        return num('In billions of dollars, loanable funds supply is $r = ' + T.num(a) + ' + ' + T.num(s) + 'Q$ and demand is $r = ' + T.num(cc) + ' - ' + T.num(s) + 'Q$, so $r = ' + r + '\\%$. Foreign savers now lend an extra ' + bn(X) + ' at every interest rate, shifting supply right by ' + X + '. What is the new real interest rate?', r1,
          ['New supply: $r = ' + T.num(a) + ' + ' + T.num(s) + '(Q - ' + X + ') = ' + T.num(U.fix(a - s * X)) + ' + ' + T.num(s) + 'Q$.', 'Set equal to demand: $' + T.num(U.fix(a - s * X)) + ' + ' + T.num(s) + 'Q = ' + T.num(cc) + ' - ' + T.num(s) + 'Q$, so $Q = ' + T.num(Q1) + '$.', '$r = ' + T.num(cc) + ' - ' + T.num(s) + ' \\times ' + T.num(Q1) + ' = ' + T.num(r1) + '\\%$: the inflow lowers the real interest rate.'], 'Shift supply right by the inflow and solve again.', { pct: true });
      }]
    ])();
  });

  G('macro.saving-investment-identity', function (R, ctx) {
    var sp = R.int(16, 32) * 100, tg = -R.int(1, 8) * 100, inv = R.int(16, 28) * 100, nx = sp + tg - inv;
    var vz = { name: 'ec-loanable', opts: { mode: 'identity', values: { sp: sp / 100, tg: tg / 100, i: inv / 100 }, quiet: true, interactive: false } };
    return choose(R, ctx, [
      [1, function () {
        return num('In billions of dollars: private saving ' + cm(sp) + ', government budget balance (T − G) ' + (tg < 0 ? '−' + (-tg) : tg) + ', investment ' + cm(inv) + '. Using $S_{private} + (T - G) = I + NX$, what are net exports, in billions of dollars? (Negative for a trade deficit.)', nx,
          ['$NX = S_{private} + (T - G) - I$.', '$NX = ' + cm(sp) + ' + (' + tg + ') - ' + cm(inv) + ' = ' + nx + '$ billion dollars.', nx < 0 ? 'National saving falls short of investment, so the country borrows the difference from abroad and runs a trade deficit.' : 'National saving exceeds investment, so the country lends abroad and runs a trade surplus.'], 'Rearrange the identity for NX.', { unit: UB, viz: vz });
      }],
      [2, function () {
        var ask = R.pick(['I', 'sp']);
        if (ask === 'I') return num('In billions of dollars: private saving ' + cm(sp) + ', government budget balance ' + (tg < 0 ? '−' + (-tg) : tg) + ', net exports ' + (nx < 0 ? '−' + (-nx) : nx) + '. What is domestic investment, in billions of dollars?', inv,
          ['$I = S_{private} + (T - G) - NX$.', '$I = ' + cm(sp) + ' + (' + tg + ') - (' + nx + ') = ' + cm(inv) + '$ billion dollars.', 'Investment can exceed national saving only if foreign saving fills the gap (negative NX).'], 'Solve the identity for I.', { unit: UB });
        return num('In billions of dollars: government budget balance ' + (tg < 0 ? '−' + (-tg) : tg) + ', investment ' + cm(inv) + ', net exports ' + (nx < 0 ? '−' + (-nx) : nx) + '. What is private saving, in billions of dollars?', sp,
          ['$S_{private} = I + NX - (T - G)$.', '$S_{private} = ' + cm(inv) + ' + (' + nx + ') - (' + tg + ') = ' + cm(sp) + '$ billion dollars.'], 'Solve the identity for private saving.', { unit: UB });
      }],
      [2, function () {
        var d = R.pick([100, 200, 300]);
        return num('The government’s budget deficit grows by ' + bn(d) + '. If private saving and investment do not change, by how much do net exports change, in billions of dollars? (Negative for a fall.)', -d,
          ['From $NX = S_{private} + (T - G) - I$: with $S_{private}$ and $I$ fixed, $NX$ changes one-for-one with $(T - G)$.', 'The budget balance falls by ' + d + ', so $NX$ changes by $-' + d + '$ billion dollars.', 'In practice saving and investment also respond, so the trade balance need not move one-for-one; the identity says something else must give.'], 'Hold the other terms fixed in the identity.', { unit: UB });
      }],
      [3, function () {
        var right = 'The identity says the trade deficit can shrink only if private saving rises, investment falls, or the government budget balance improves';
        return mc('A country has a large trade deficit. A tariff is proposed to close it. What does the saving–investment identity imply?', right,
          ['The tariff must close the trade deficit, because imports fall', 'The trade deficit is unrelated to saving and investment', 'The trade deficit shows the country is losing money it can never get back'],
          ['$S_{private} + (T - G) = I + NX$ always holds, so $NX = S_{private} + (T - G) - I$.', 'If a tariff cuts imports but saving, investment and the budget balance stay the same, something else must offset it: for example the currency appreciates and exports fall. (Economists broadly agree that tariffs raise domestic prices; their effect on the overall trade balance runs through saving and investment.)'], 'Which terms must change for NX to change?');
      }]
    ])();
  });

})(window.MathLadder);

/* ---- widen_hum: more questions from the lesson's own tables -----------------------------------------------------
   Each topic listed below also asks about the facts in its lesson's tables (copied here from the lesson, so the
   answers are the lesson's own). Forms, by level:
     match   "Which museum is in Turin?": the right cell and others from the same column (3 choices at level 1, 4 above)
     pairs   lines "A → B": which pairing is right (level 2), or which one is wrong (level 3)
     sort    a comparison table: which column does this cell describe (levels 1-2), or choose all for one column (level 3)
   How often: about a third to a half of the draws, more when the topic's own questions are few at that level.
   Generated by /tmp/work_widen_widen_hum/tabbuild.js from data/<ladder>/lessons/<course>.json. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var TABS = [{"k":"macro.types-unemployment#x","x":[{"f":"unemp"},{"f":"unemp"},{"q":"A worker's job will not come back even when spending recovers, because the work is now done by machines. What kind of unemployment is this?","a":"Structural","w":["Frictional","Cyclical","Not unemployment at all"],"s":["Ask: would this job return if spending recovered? No.","So it is structural."]},{"q":"Which kinds of unemployment make up the natural rate?","a":"Frictional and structural","w":["Cyclical only","Frictional and cyclical","All three kinds"],"s":["Natural rate = frictional + structural.","At full employment, cyclical unemployment is zero."]},{"q":"What does \"full employment\" mean?","a":"Unemployment equals the natural rate, with no cyclical unemployment","w":["Unemployment is 0%","Everyone has two jobs","Unemployment is above the natural rate"],"s":["Some frictional and structural unemployment is normal.","Full employment means only cyclical unemployment is gone."]},{"lv":2,"q":"Why is some frictional unemployment normal and even healthy?","a":"It means people are searching for better matches","w":["It means the economy is in a recession","It means wages are too high","It means machines replaced workers"],"s":["People quit to find better jobs, and graduates look for first jobs.","Searching takes time."]},{"tf":false,"q":"True or false: a strong economy brings structural unemployment down to zero.","s":["Structural unemployment does not go away when the economy is strong.","It may need retraining or moving."]}]},
    {"k":"macro.gdp-deflator#x","x":[{"f":"deflator"},{"f":"deflator"},{"q":"In the base year, what is the GDP deflator?","a":"100","w":["0","1","1,000"],"s":["In the base year, nominal and real GDP are equal.","So the deflator is exactly 100."]},{"q":"The GDP deflator is 115. What does it mean?","a":"Prices of the economy's output are 15% higher than in the base year","w":["Real GDP is \\$115 billion","Output is 15% higher than in the base year","Prices are 115% lower than in the base year"],"s":["Subtract 100 to get the percent change in prices since the base year."]},{"lv":2,"tf":true,"q":"True or false: in years after the base year, when prices have risen, nominal GDP is bigger than real GDP.","s":["Nominal GDP uses current prices; real GDP uses base-year prices.","If prices rose, nominal is bigger, and the deflator is above 100."]}]},
    {"k":"macro.price-index#x","x":[{"f":"index"},{"f":"infl"},{"q":"Which agency publishes the consumer price index (CPI)?","a":"The Bureau of Labor Statistics","w":["The Federal Reserve","Congress","The Treasury Department"],"s":["The CPI comes from the Bureau of Labor Statistics.","It uses a basket bought by urban households."]},{"q":"An index of 120 means what?","a":"The same basket costs 20% more than in the base period","w":["The basket costs \\$120","Prices fell by 20%","The basket is 120 items"],"s":["Subtract 100 from the index to get the percent change since the base period.","An index has no dollar units."]},{"lv":2,"q":"Why does a price index hold the basket fixed?","a":"So that only price changes can change its cost","w":["So that it measures changes in quantity","Because people never change what they buy","To make the index equal \\$100"],"s":["With a fixed basket, the index measures price changes alone."]}]},
    {"k":"macro.tax-multiplier#x","x":[{"f":"taxm"},{"f":"taxm"},{"q":"With an MPC of 0.8, what is the tax multiplier?","a":"−4","w":["−5","5","4"],"s":["Tax multiplier = −MPC ÷ MPS = −0.8 ÷ 0.2 = −4.","Its size is one less than the spending multiplier, 5."]},{"q":"With an MPC of 0.75, what is the tax multiplier?","a":"−3","w":["−4","4","3"],"s":["−0.75 ÷ 0.25 = −3.","The spending multiplier would be 4."]},{"q":"With an MPC of 0.9, what is the tax multiplier?","a":"−9","w":["−10","10","9"],"s":["−0.9 ÷ 0.1 = −9.","The spending multiplier would be 10."]},{"lv":2,"q":"Why is the tax multiplier smaller in size than the spending multiplier?","a":"Households save part of a tax cut before any spending happens","w":["Taxes are always smaller than spending","The government saves part of its purchases","Tax cuts raise interest rates"],"s":["With MPC 0.8, a \\$100 tax cut starts with only \\$80 of spending.","After that the rounds are the same."]},{"lv":2,"q":"What is the balanced-budget multiplier: a change in G matched by an equal change in taxes?","a":"1","w":["0","The same as the spending multiplier","−1"],"s":["The spending multiplier and the tax multiplier differ by exactly one.","So an equal rise in G and taxes raises GDP by the same amount: a multiplier of 1."]}]},
    {"k":"macro.money-supply-measures#x","x":[{"f":"money"},{"f":"money"},{"f":"money"}]},
    {"k":"macro.bank-balance-sheets#x","x":[{"f":"reserves"},{"f":"reserves"},{"q":"To a bank, what is a customer's deposit?","a":"A liability: money the bank owes the depositor","w":["An asset the bank owns","Owners' equity","A loan the bank made"],"s":["The bank owes the depositor the money on demand.","The matching asset is the cash or reserves it holds."]},{"q":"On a bank's balance sheet, assets always equal what?","a":"Liabilities plus owners' equity","w":["Deposits only","Loans plus reserves","Zero"],"s":["Assets = liabilities + owners' equity.","That is why a T-account balances."]},{"lv":2,"q":"A customer deposits \\$100 in cash. What happens to the bank's T-account?","a":"Reserves (an asset) and deposits (a liability) both rise by \\$100","w":["Only assets rise by \\$100","Loans rise and deposits fall","Owners' equity rises by \\$100"],"s":["The cash is a new reserve: an asset.","The bank owes the customer \\$100: a liability."]}]},
    {"k":"macro.money-creation#x","x":[{"f":"mmult"},{"f":"mmult"},{"q":"With a reserve requirement of 10%, what is the simple money multiplier?","a":"10","w":["0.1","1","100"],"s":["Money multiplier = 1 ÷ reserve ratio = 1 ÷ 0.1 = 10."]},{"q":"With a reserve requirement of 25%, what is the simple money multiplier?","a":"4","w":["0.25","25","2.5"],"s":["1 ÷ 0.25 = 4."]}]},
    {"k":"macro.real-interest-rate#x","x":[{"f":"rir"},{"f":"rir"},{"f":"rir"}]},
    {"k":"macro.deficits-debt#x","x":[{"f":"debt"},{"f":"debt"},{"q":"What is the difference between the deficit and the debt?","a":"The deficit is one year's shortfall; the debt is the total owed","w":["They are the same thing","The debt is one year's shortfall; the deficit is the total owed","The deficit is what other countries owe us"],"s":["The deficit is a flow, per year.","The debt is a stock: the running total."]}]},
    {"k":"macro.financial-assets#x","x":[{"f":"bondpv"},{"f":"bondpv"},{"q":"What is a bond?","a":"A loan to a government or company, which pays fixed interest and the face value at maturity","w":["A share of ownership in a company","A kind of bank deposit insured by the government","Money printed by the central bank"],"s":["A bond is a loan.","A stock is a share of ownership."]},{"q":"What is a stock?","a":"A share of ownership in a company","w":["A loan to a company","A government promise to pay","A savings deposit"],"s":["Buying stock makes you a part owner.","Buying a bond makes you a lender."]},{"q":"Market interest rates fall. What happens to the prices of existing bonds?","a":"They rise","w":["They fall","They stay at face value","They become zero"],"s":["Old bonds pay fixed coupons.","When new bonds pay less, old ones become worth more."]},{"lv":2,"q":"Your bond pays 5% on \\$1,000. New bonds now pay 7%. Why will no one pay \\$1,000 for yours?","a":"For \\$1,000 they could get \\$70 a year from a new bond instead of \\$50","w":["Bonds lose value every year by law","Your bond is now a stock","The 7% is paid only to banks"],"s":["Your bond's price must drop until its \\$50 a year is as good a deal as a new bond."]}]},
    {"k":"macro.balance-of-payments#x","x":[{"f":"ca"},{"f":"fa"},{"q":"An American buys shares of a German company. In which U.S. account is this recorded?","a":"Financial account","w":["Current account","Not recorded: it is not a trade"],"s":["Purchases of assets across borders go in the financial account."]},{"q":"An American family sends money to relatives abroad. In which U.S. account is this recorded?","a":"Current account","w":["Financial account","Not recorded: it is not a trade"],"s":["Transfers, like money sent home to family, are in the current account."]},{"q":"A U.S. company sells software to a buyer in Japan. In which U.S. account is this recorded?","a":"Current account","w":["Financial account","Not recorded: it is not a trade"],"s":["Trade in goods and services is in the current account."]},{"q":"A Canadian firm buys an office building in Chicago. In which U.S. account is this recorded?","a":"Financial account","w":["Current account","Not recorded: it is not a trade"],"s":["Buying real assets across borders goes in the financial account."]},{"lv":2,"q":"If Americans buy \\$100 more goods from abroad than they sell, what usually happens to those extra dollars?","a":"Foreigners use them to buy U.S. assets, a financial account surplus","w":["They disappear from the economy","The Federal Reserve burns them","They are always spent on U.S. goods the same year"],"s":["A current account deficit is matched by a financial account surplus."]}]},
    {"k":"macro.fed-tools#x","x":[{"q":"To fight a recession, what does the central bank do with government bonds?","a":"Buy them","w":["Sell them","Print more of them","Nothing: bonds are fiscal policy"],"s":["Buying bonds adds reserves and money: expansionary."]},{"q":"To fight inflation, what does the central bank do with government bonds?","a":"Sell them","w":["Buy them","Give them away","Nothing: bonds are fiscal policy"],"s":["Selling bonds drains reserves: contractionary."]},{"q":"To fight a recession, what does the central bank do with the discount rate?","a":"Lower it","w":["Raise it","Leave it, since only Congress can change it","Set it equal to the inflation rate"],"s":["A lower discount rate makes it cheaper for banks to borrow reserves."]},{"q":"To fight inflation, what does the central bank do with the discount rate?","a":"Raise it","w":["Lower it","Leave it, since only Congress can change it","Set it to zero"],"s":["A higher discount rate makes borrowing reserves dearer: contractionary."]},{"q":"To fight a recession, what does the central bank do with the reserve requirement?","a":"Lower it","w":["Raise it","Abolish all banks","Nothing: it is fiscal policy"],"s":["A lower requirement turns required reserves into excess reserves banks can lend."]},{"q":"To fight inflation, what does the central bank do with the interest it pays on reserve balances?","a":"Raise it","w":["Lower it","Pay it to households","Nothing: it does not matter"],"s":["A higher IORB makes keeping money at the Fed more attractive than lending it.","That pulls short-term rates up: contractionary."]},{"q":"What is the discount rate?","a":"The rate the central bank charges banks for loans","w":["The rate banks pay savers","The tax rate on bonds","The rate of inflation"],"s":["The discount rate is what the Fed charges banks."]},{"lv":2,"q":"How does the Fed pay for bonds it buys from a bank?","a":"By adding reserves to the bank's account at the Fed","w":["With tax money","By borrowing from Congress","With gold"],"s":["The Fed creates new reserves to pay.","So \"buy\" means more money."]}]},
    {"k":"macro.monetary-policy#x","x":[{"q":"Put the chain of expansionary monetary policy in order.","a":"Buy bonds → interest rates fall → investment rises → AD shifts right","w":["Buy bonds → interest rates rise → investment falls → AD shifts left","Interest rates fall → buy bonds → AD shifts right → investment rises","AD shifts right → investment rises → interest rates fall → buy bonds"],"s":["Start in the money market and end with AD."]},{"q":"Contractionary monetary policy raises interest rates. What happens to investment?","a":"It falls","w":["It rises","It does not change","It doubles"],"s":["Higher rates make borrowing for new factories and homes dearer."]},{"q":"Expansionary monetary policy shifts AD right. What happens to real GDP and unemployment in the short run?","a":"Real GDP rises; unemployment falls","w":["Real GDP falls; unemployment rises","Both rise","Both fall"],"s":["More spending means more output and more hiring."]},{"lv":2,"q":"Which interest rate does the Fed set directly?","a":"A short-term policy rate; other rates respond","w":["Every interest rate, mortgage rates included","Only mortgage rates","Only credit card rates"],"s":["The Fed sets a short-term policy rate.","Other rates, such as mortgage rates, respond to it."]},{"lv":2,"q":"In the monetary policy chain, which two links are shifts of curves?","a":"The money supply in the money market, and AD","w":["Money demand and investment demand","Investment demand and SRAS","LRAS and the money supply"],"s":["The money supply shifts, and AD shifts.","The others are movements along curves."]}]},
    {"k":"macro.crowding-out#x","x":[{"q":"The government borrows more. What happens to the demand for loanable funds?","a":"It rises","w":["It falls","It does not change","The supply rises instead"],"s":["Government borrowing adds to demand for loanable funds."]},{"q":"The government borrows more. What happens to the real interest rate?","a":"It rises","w":["It falls","It stays the same","It becomes zero"],"s":["More demand for a limited pool of saving pushes the rate up."]},{"q":"What is crowding out?","a":"Higher interest rates from government borrowing reduce private investment","w":["Too many people in a city","Imports replacing domestic goods","The Fed buying too many bonds"],"s":["At the higher rate, some private projects no longer pay."]},{"lv":2,"q":"Why might crowding out be small in a deep recession?","a":"With idle resources and weak demand for loans, rates may rise little","w":["Because the government cannot borrow in a recession","Because saving falls to zero","Because investment always rises in a recession"],"s":["Near full employment, borrowing competes harder for scarce saving.","The size of crowding out in practice is debated."]}]},
    {"k":"macro.growth-policy#x","x":[{"q":"Funding basic research shifts which curve?","a":"LRAS to the right","w":["AD only","LRAS to the left","Neither"],"s":["Research adds new ideas: more capacity to produce."]},{"q":"A one-time tax rebate spent on consumer goods shifts which curve?","a":"AD only, for a while","w":["LRAS to the right","LRAS to the left","The PPC outward"],"s":["It raises demand but leaves the economy with the same machines, skills and ideas."]},{"q":"Which of these raises potential output?","a":"Better schooling and job training","w":["A one-time gift card for every family","Printing more money","A higher price level"],"s":["Human capital adds to the economy's capacity: LRAS shifts right."]},{"q":"Building a new port does what?","a":"Raises AD while it is built, and LRAS once it is finished","w":["Only raises AD","Only lowers LRAS","Nothing at all"],"s":["The construction spending raises AD now.","The finished port lets firms produce and ship more later."]},{"lv":2,"q":"What do economists debate about growth policy?","a":"Which particular policies deliver growth best, and at what cost","w":["Whether capital and skills matter at all","Whether real GDP can ever grow","Whether technology exists"],"s":["Economists broadly agree on the sources of growth.","They debate which policies deliver them best."]}]},
    {"k":"macro.capital-flows#x","x":[{"q":"U.S. real interest rates rise compared with other countries. What happens to the dollar?","a":"It appreciates","w":["It depreciates","It does not change","It is replaced"],"s":["Foreign savers want U.S. assets and must buy dollars first."]},{"q":"A country's real interest rate falls. Which way does financial capital flow?","a":"Out of the country","w":["Into the country","Nowhere","Only into its stock market"],"s":["Savers look for better returns elsewhere.","The currency depreciates."]},{"q":"Foreign savers want to buy U.S. bonds. What must they buy first?","a":"Dollars","w":["Euros","Gold","U.S. goods"],"s":["To buy U.S. assets, they need dollars.","So demand for dollars rises."]},{"lv":2,"q":"A capital inflow adds to which part of the loanable funds market?","a":"The supply of loanable funds","w":["The demand for loanable funds","Neither","The money supply set by the Fed"],"s":["Foreign saving adds to supply.","That keeps the rate from rising as much as it otherwise would."]},{"lv":3,"q":"Put the classic chain in order for a U.S. budget deficit.","a":"Real rate rises → capital flows in → dollar appreciates → net exports fall","w":["Dollar appreciates → real rate rises → net exports rise → capital flows out","Capital flows out → dollar depreciates → net exports rise → real rate falls","Net exports fall → real rate rises → capital flows in → dollar depreciates"],"s":["The government borrows more, so the real rate rises.","Foreign capital flows in, the dollar appreciates, and net exports fall."]}]},
    {"k":"macro.business-cycle#x","x":[{"q":"Which phase of the business cycle is the high point?","a":"Peak","w":["Trough","Expansion","Contraction"],"s":["The four phases: expansion, peak, contraction, trough."]},{"q":"Which phase of the business cycle is the low point?","a":"Trough","w":["Peak","Expansion","Contraction"],"s":["The trough is the low point, before expansion begins again."]},{"q":"Real GDP grew 3% last year and 1% this year. Which phase is the economy in?","a":"Expansion: real GDP is still rising","w":["Contraction","A recession","Trough"],"s":["Slower growth is still growth.","A contraction means real GDP is falling."]},{"q":"Real GDP is falling. Which phase is this?","a":"Contraction","w":["Expansion","Peak","Trough"],"s":["A contraction is a fall in real GDP.","A large, lasting one is a recession."]},{"lv":2,"q":"What is potential output?","a":"What the economy can produce with its resources fully employed","w":["The most it could ever produce","Last year's real GDP","Nominal GDP"],"s":["Output can run above potential for a while, with overtime and extra shifts."]}]},
    {"k":"macro.ad-as-equilibrium#x","x":[{"q":"Short-run equilibrium output is to the left of LRAS. What kind of gap is this?","a":"A recessionary gap","w":["An inflationary gap","No gap","A trade gap"],"s":["Left of LRAS means less output and more unemployment."]},{"q":"Short-run equilibrium output is to the right of LRAS. What kind of gap is this?","a":"An inflationary gap","w":["A recessionary gap","No gap","A budget gap"],"s":["Right of LRAS means overheating: output above potential."]},{"q":"Where is long-run equilibrium?","a":"Where AD, SRAS and LRAS all meet","w":["Where AD meets SRAS anywhere","Where LRAS meets the price axis","Where AD is vertical"],"s":["In the long run, all three curves meet."]},{"lv":2,"q":"In an inflationary gap, how does unemployment compare with the natural rate?","a":"It is below the natural rate","w":["It is above the natural rate","It equals the natural rate","It is zero"],"s":["Firms run overtime and labor is scarce."]},{"lv":2,"q":"In a recessionary gap, how does unemployment compare with the natural rate?","a":"It is above the natural rate","w":["It is below the natural rate","It equals the natural rate","It is zero"],"s":["Workers are idle; cyclical unemployment is high."]}]},
    {"k":"macro.policy-mix#x","x":[{"q":"Fiscal expansion and monetary expansion together. What happens to real GDP?","a":"It rises","w":["It falls","Indeterminate","It stays the same"],"s":["Both shift AD right, so output rises for sure."]},{"q":"Fiscal expansion and monetary expansion together. What happens to the interest rate?","a":"Indeterminate: one pushes it up, the other down","w":["It rises","It falls","It stays the same for sure"],"s":["Fiscal expansion tends to raise rates; monetary expansion lowers them.","Without sizes, the direction is indeterminate."]},{"q":"Fiscal contraction and monetary contraction together. What happens to the price level?","a":"It falls (or rises less)","w":["It rises","Indeterminate","It doubles"],"s":["Both shift AD left, so the price level falls."]},{"lv":2,"q":"Fiscal contraction with monetary expansion. What happens to the interest rate?","a":"It falls","w":["It rises","Indeterminate","It stays the same"],"s":["Fiscal contraction tends to lower rates; monetary expansion lowers them too.","Both push the same way."]},{"lv":2,"q":"Fiscal expansion with monetary contraction. What happens to the interest rate?","a":"It rises","w":["It falls","Indeterminate","It stays the same"],"s":["Both push the interest rate up.","But real GDP is indeterminate."]},{"lv":2,"q":"Fiscal expansion with monetary contraction. What happens to real GDP?","a":"Indeterminate: it depends on which effect is larger","w":["It rises","It falls","It stays the same for sure"],"s":["One shifts AD right, the other left."]}]},
    {"k":"macro.costs-of-inflation#x","x":[{"q":"Unexpected inflation helps whom?","a":"Borrowers","w":["Lenders","People with fixed incomes","Savers holding cash"],"s":["The dollars repaid buy less than planned, so the borrower gains."]},{"q":"What are menu costs?","a":"The costs of changing posted prices","w":["The price of meals out","Costs of holding less cash","Taxes on food"],"s":["Reprinting menus and price tags takes time and money."]},{"q":"What are shoe-leather costs?","a":"The effort spent holding less cash","w":["The cost of new shoes","The cost of changing prices","Higher taxes"],"s":["When inflation is high, people make extra trips to the bank to hold less cash."]},{"lv":2,"q":"Wages rise 4% and prices rise 4%. What happens to a worker's buying power?","a":"It stays about the same","w":["It falls by 4%","It rises by 8%","It falls by 8%"],"s":["Real income depends on wages compared with prices."]}]}];
  var FUNS = {
    unemp: function (R) { // natural rate = frictional + structural; actual = natural + cyclical (lesson: Types of Unemployment)
      var f = R.int(8, 30) / 10, s = R.int(10, 35) / 10, c = R.int(0, 40) / 10, nat = Math.round((f + s) * 10) / 10, act = Math.round((nat + c) * 10) / 10, k = R.int(0, 2);
      if (k === 0) return { q: 'Frictional unemployment is ' + f + '% and structural unemployment is ' + s + '%. What is the natural rate of unemployment?', num: nat, pct: true, tol: 0.05,
        s: ['Natural rate = frictional + structural.', f + '% + ' + s + '% = ' + nat + '%.'], h: 'Cyclical unemployment is not part of the natural rate.' };
      if (k === 1) return { q: 'Frictional unemployment is ' + f + '%, structural unemployment is ' + s + '% and cyclical unemployment is ' + c + '%. What is the actual unemployment rate?', num: act, pct: true, tol: 0.05,
        s: ['Actual rate = frictional + structural + cyclical.', f + '% + ' + s + '% + ' + c + '% = ' + act + '%.'], h: 'Add all three kinds.' };
      return { q: 'The unemployment rate is ' + act + '%. The natural rate is ' + nat + '%. What is the cyclical unemployment rate?', num: c, pct: true, tol: 0.05,
        s: ['Cyclical = actual − natural.', act + '% − ' + nat + '% = ' + c + '%.'], h: 'Take away the natural rate.' };
    },
    deflator: function (R) { // deflator = nominal / real × 100
      var real = R.int(4, 60) * 100, d = R.int(90, 140), nom = real * d / 100, k = R.int(0, 1);
      if (k === 0) return { q: 'Nominal GDP is \\$' + nom.toLocaleString('en-US') + ' billion and real GDP is \\$' + real.toLocaleString('en-US') + ' billion. What is the GDP deflator?', num: d,
        s: ['GDP deflator = nominal GDP ÷ real GDP × 100.', nom.toLocaleString('en-US') + ' ÷ ' + real.toLocaleString('en-US') + ' × 100 = ' + d + '.'], h: 'Nominal over real, times 100.' };
      return { q: 'Nominal GDP is \\$' + nom.toLocaleString('en-US') + ' billion and the GDP deflator is ' + d + '. What is real GDP, in billions of dollars?', num: real, unit: 'billion',
        s: ['Real GDP = nominal GDP ÷ (deflator ÷ 100).', nom.toLocaleString('en-US') + ' ÷ ' + (d / 100) + ' = ' + real.toLocaleString('en-US') + '.'], h: 'Divide nominal GDP by the deflator over 100.' };
    },
    index: function (R) { // index = cost now / cost in base × 100; percent change from the index
      var base = R.int(4, 40) * 25, g = R.int(-4, 40), now = base * (100 + g) / 100;
      if (now !== Math.round(now * 100) / 100 || g === 0) { g = 20; now = base * 1.2; }
      var ix = 100 + g, k = R.int(0, 1);
      if (k === 0) return { q: 'A fixed basket of goods cost \\$' + base.toLocaleString('en-US') + ' in the base year and costs \\$' + T2(now) + ' this year. What is the price index this year?', num: ix,
        s: ['Index = cost this year ÷ cost in the base year × 100.', T2(now) + ' ÷ ' + base + ' × 100 = ' + ix + '.'], h: 'This year over the base year, times 100.' };
      return { q: 'The price index is ' + ix + ' (base year = 100). By what percent have prices changed since the base year? (Use a negative number for a fall.)', num: g, pct: true,
        s: ['Percent change since the base year = index − 100.', ix + ' − 100 = ' + g + '%.'], h: 'Subtract 100.' };
      function T2(x) { return Number.isInteger(x) ? x.toLocaleString('en-US') : x.toFixed(2); }
    },
    infl: function (R) { // inflation between two index values, chosen so the rate is a whole number
      var a = R.pick([100, 110, 120, 125, 150, 160, 200, 250]), g = R.int(1, 12), b = a * (100 + g) / 100;
      if (b !== Math.round(b * 10) / 10) { a = 200; b = 200 + 2 * g; }
      return { q: 'The CPI was ' + a + ' last year and is ' + b + ' this year. What was the inflation rate?', num: g, pct: true, tol: 0.05,
        s: ['Inflation rate = (new − old) ÷ old × 100.', '(' + b + ' − ' + a + ') ÷ ' + a + ' × 100 = ' + g + '%.'], h: 'Change divided by the starting value.' };
    },
    taxm: function (R) { // tax multiplier −MPC/MPS
      var mpc = R.pick([0.5, 0.6, 0.75, 0.8, 0.9]), tm = Math.round(mpc / (1 - mpc) * 100) / 100, dT = R.int(2, 50) * 4, cut = R.coin(), dY = Math.round(tm * dT * 100) / 100 * (cut ? 1 : -1);
      return { q: 'The MPC is ' + mpc + '. The government ' + (cut ? 'cuts' : 'raises') + ' taxes by \\$' + dT + ' billion. By how much does real GDP change, in billions of dollars, if the price level does not change? (Use a negative number for a fall.)', num: dY, unit: 'billion',
        s: ['Tax multiplier = −MPC ÷ MPS = −' + mpc + ' ÷ ' + Math.round((1 - mpc) * 100) / 100 + ' = −' + tm + '.', 'Change in GDP = ' + (cut ? '' : '−') + tm + ' × ' + dT + ' = ' + (dY < 0 ? '−' + (-dY) : dY) + ' billion.'], h: 'Find MPC ÷ MPS, then mind the sign.' };
    },
    money: function (R) { // M1 and M2 under the Fed's definitions since May 2020
      var cur = R.int(15, 30) * 100, dd = R.int(20, 60) * 100, sav = R.int(80, 130) * 100, td = R.int(4, 15) * 100, mmf = R.int(8, 20) * 100, st = R.int(20, 40) * 1000, m2 = R.coin();
      var M1 = cur + dd + sav, M2 = M1 + td + mmf, f = function (x) { return x.toLocaleString('en-US'); };
      return { q: 'In billions of dollars: currency held by the public ' + f(cur) + '; checking deposits ' + f(dd) + '; savings deposits ' + f(sav) + '; small time deposits ' + f(td) + '; retail money market funds ' + f(mmf) + '; stocks held by households ' + f(st) + '. Using the Federal Reserve’s current definitions, what is ' + (m2 ? 'M2' : 'M1') + ', in billions of dollars?', num: m2 ? M2 : M1, unit: 'billion',
        s: ['M1 = currency + checking deposits + savings deposits = ' + f(M1) + '.', m2 ? 'M2 = M1 + small time deposits + retail money market funds = ' + f(M2) + '.' : 'Time deposits and money market funds are in M2 only; stocks are in neither.'], h: m2 ? 'M2 is M1 plus the less liquid kinds.' : 'Only the most liquid kinds count in M1.' };
    },
    reserves: function (R) { // required and excess reserves
      var rr = R.pick([5, 10, 12.5, 20, 25]), D = R.int(4, 80) * 1000, req = D * rr / 100, Rv = req + R.int(1, 20) * 500, ask = R.coin();
      return ask ? { q: 'A bank has \\$' + D.toLocaleString('en-US') + ' of demand deposits. The reserve requirement is ' + rr + '%. What are its required reserves, in dollars?', num: req, unit: 'dollars',
          s: ['Required reserves = reserve ratio × deposits.', rr + '% × ' + D.toLocaleString('en-US') + ' = ' + req.toLocaleString('en-US') + '.'], h: 'Take the reserve ratio of the deposits.' }
        : { q: 'A bank holds \\$' + Rv.toLocaleString('en-US') + ' in reserves against \\$' + D.toLocaleString('en-US') + ' of demand deposits. The reserve requirement is ' + rr + '%. What are its excess reserves, in dollars?', num: Rv - req, unit: 'dollars',
          s: ['Required reserves = ' + rr + '% × ' + D.toLocaleString('en-US') + ' = ' + req.toLocaleString('en-US') + '.', 'Excess = ' + Rv.toLocaleString('en-US') + ' − ' + req.toLocaleString('en-US') + ' = ' + (Rv - req).toLocaleString('en-US') + '.'], h: 'Find the required reserves first.' };
    },
    mmult: function (R) { // simple money multiplier 1/rr on excess reserves
      var rr = R.pick([5, 10, 20, 25]), ER = R.int(1, 60) * 1000, dM = ER * 100 / rr;
      return { q: 'The reserve requirement is ' + rr + '%. The banking system gets \\$' + ER.toLocaleString('en-US') + ' of new excess reserves. With the simple money multiplier, what is the most the money supply can grow, in dollars?', num: dM, unit: 'dollars',
        s: ['Money multiplier = 1 ÷ ' + (rr / 100) + ' = ' + (100 / rr) + '.', ER.toLocaleString('en-US') + ' × ' + (100 / rr) + ' = ' + dM.toLocaleString('en-US') + '.'], h: 'Multiply the excess reserves by 1 ÷ the reserve ratio.' };
    },
    ca: function (R) { // current account = trade balance + net income + net transfers
      var X = R.int(12, 32) * 100, M = X + R.int(-4, 10) * 50, inc = R.int(-3, 6) * 25, tr = -R.int(1, 6) * 25, CA = X - M + inc + tr;
      var sg = function (x) { return (x < 0 ? '−' : '+') + Math.abs(x); };
      return { q: 'In billions of dollars: exports of goods and services ' + X.toLocaleString('en-US') + ', imports of goods and services ' + M.toLocaleString('en-US') + ', net income from investments abroad ' + sg(inc) + ', net transfers ' + sg(tr) + '. What is the current account balance, in billions of dollars?', num: CA, unit: 'billion',
        s: ['Trade balance = ' + X + ' − ' + M + ' = ' + (X - M < 0 ? '−' + (M - X) : X - M) + '.', 'Current account = ' + (X - M < 0 ? '−' + (M - X) : X - M) + ' ' + sg(inc) + ' ' + sg(tr) + ' = ' + (CA < 0 ? '−' + (-CA) : CA) + '.'], h: 'Add the trade balance, net income and net transfers.' };
    },
    fa: function (R) { // the financial account offsets the current account (no capital account, no discrepancy)
      var ca = R.int(-30, 30) * 25; if (ca === 0) ca = -250;
      return { q: 'A country\'s current account balance is ' + (ca < 0 ? '−' : '') + '\\$' + Math.abs(ca) + ' billion. Its capital account is zero and there is no statistical discrepancy. What is its financial account balance, in billions of dollars? (Use the course\'s convention: a net inflow of foreign capital is a surplus.)', num: -ca, unit: 'billion',
        s: ['Current account + capital account + financial account = 0.', 'So the financial account = ' + (ca < 0 ? '+' + (-ca) : '−' + ca) + '.'], h: 'The accounts must offset each other.' };
    },
    rir: function (R) { // real ≈ nominal − inflation, any of the three
      var r = R.int(-4, 12) / 2, p = R.int(1, 16) / 2, i = r + p, k = R.int(0, 2), m = function (x) { return x < 0 ? '−' + (-x) : String(x); };
      if (i <= 0) { i = p + 2; r = 2; }
      if (k === 0) return { q: 'A loan charges a nominal interest rate of ' + i + '% and inflation is ' + p + '%. About what is the real interest rate? (Use a negative number if it is below zero.)', num: r, pct: true, tol: 0.05, s: ['Real ≈ nominal − inflation.', i + '% − ' + p + '% = ' + m(r) + '%.'], h: 'Subtract inflation.' };
      if (k === 1) return { q: 'A lender wants a real return of ' + m(r) + '% and expects inflation of ' + p + '%. About what nominal interest rate should it charge?', num: i, pct: true, tol: 0.05, s: ['Nominal ≈ real + expected inflation.', m(r) + '% + ' + p + '% = ' + i + '%.'], h: 'Add expected inflation.' };
      return { q: 'A bond pays a nominal rate of ' + i + '%, and its real rate turned out to be about ' + m(r) + '%. About what was inflation?', num: p, pct: true, tol: 0.05, s: ['Inflation ≈ nominal − real.', i + '% − (' + m(r) + '%) = ' + p + '%.'], h: 'Nominal minus real.' };
    },
    bondpv: function (R) { // a one-year payment A is worth A/(1+r) today
      var r = R.pick([2, 4, 5, 8, 10, 20, 25]), P = R.int(4, 40) * 25, A = P * (100 + r) / 100;
      return { q: 'A bond pays \\$' + A.toLocaleString('en-US') + ' one year from now and nothing else. The market interest rate is ' + r + '%. What is its price today, in dollars?', num: P, unit: 'dollars',
        s: ['Price = payment ÷ (1 + r).', A.toLocaleString('en-US') + ' ÷ ' + (1 + r / 100) + ' = ' + P.toLocaleString('en-US') + '.'], h: 'Divide by 1 plus the interest rate.' };
    },
    debt: function (R) { // the debt as a running total
      var D0 = R.int(40, 160) * 100, a = R.int(2, 16) * 50, b = R.int(-4, 16) * 50; if (b === 0) b = 100;
      return { q: 'The national debt is \\$' + D0.toLocaleString('en-US') + ' billion. This year the government runs a deficit of \\$' + a + ' billion; next year it runs ' + (b < 0 ? 'a surplus' : 'a deficit') + ' of \\$' + Math.abs(b) + ' billion. What will the debt be after both years, in billions of dollars?', num: D0 + a + b, unit: 'billion',
        s: ['Each deficit adds to the debt; a surplus subtracts.', D0 + ' + ' + a + (b < 0 ? ' − ' + (-b) : ' + ' + b) + ' = ' + (D0 + a + b) + '.'], h: 'Keep a running total.' };
    }
  };
  function plain(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }
  function txt(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function low(s) { return txt(s).toLowerCase().replace(/[.;:,]+$/, ''); }
  function big(x) { return String(x).replace(/<span class="(sc-b|eg-cop|eg-h)">/g, '<span class="$1" style="font-size:1.6em;line-height:1">'); }
  function fill(t, x) { x = big(x); return t.replace('{a:l}', String(x).replace(/^[A-Z](?=[a-z])/, function (c) { return c.toLowerCase(); })).replace('{a}', x); }
  function dot(s) { s = String(s); return /[.!?…"”’)]$/.test(txt(s)) ? s : s + '.'; }
  function sameRow(t, i, a) { return t.r.filter(function (r) { return low(r[a]) === low(t.r[i][a]); }); }
  function partnerSteps(t, tp, right, shown) { // what each wrong choice goes with
    var out = [];
    shown.forEach(function (c) {
      if (low(c) === low(right)) return;
      var rows = t.r.filter(function (r) { return low(r[tp[1]]) === low(c); });
      if (rows.length === 1 && txt(rows[0][tp[0]]).length <= 90) out.push(dot(c + ': that goes with ' + rows[0][tp[0]]));
    });
    return out.slice(0, 3);
  }
  // match: ask for column b from a cell of column a
  function match(R, t, tp, L) {
    var a = tp[0], b = tp[1], ok = t.r.map(function (_, i) { return i; }).filter(function (i) { return t.r[i][a] && t.r[i][b] && txt(t.r[i][b]).length <= 130; });
    if (!ok.length) return null;
    var i = R.pick(ok), right = t.r[i][b], seen = {};
    seen[low(right)] = 1;
    var bad = {}; sameRow(t, i, a).forEach(function (r) { bad[low(r[b])] = 1; }); // never a choice that is also right
    var pool = []; t.r.forEach(function (r) { var k = low(r[b]); if (r[b] && !seen[k] && !bad[k] && txt(r[b]).length <= 130) { seen[k] = 1; pool.push(r[b]); } });
    var k = Math.min(L === 1 ? 3 : 4, pool.length + 1); if (k < 3) return null;
    var wrongs = R.shuffle(pool).slice(0, k - 1), choices = [right].concat(wrongs);
    return { q: fill(tp[2], t.r[i][a]), a: { t: 'mc', choices: choices, v: 0 },
      steps: [dot(t.r[i][a] + ' → ' + right), ].concat(partnerSteps(t, tp, right, choices)),
      hint: tp[3] || 'Think back to the lesson’s table' + (t.cap ? ' (' + t.cap.replace(/\.$/, '') + ')' : '') + '.', wh: [t.k, 'm', a, b, i, txt(t.r[i][a])] };
  }
  // pairs: three or four lines "a → b"; one right (level 2) or one wrong (level 3)
  function pairs(R, t, tp, L) {
    var a = tp[0], b = tp[1], ok = t.r.map(function (_, i) { return i; }).filter(function (i) { return t.r[i][a] && t.r[i][b] && txt(t.r[i][a]).length <= 70 && txt(t.r[i][b]).length <= 70; });
    var uniq = {}; ok = ok.filter(function (i) { var k = low(t.r[i][a]); if (uniq[k]) return false; uniq[k] = 1; return true; });
    var n = Math.min(4, ok.length); if (n < 3) return null;
    var rows = R.shuffle(ok).slice(0, n), wrongOne = L >= 3, target = R.int(0, n - 1), lines = [], steps = [];
    for (var j = 0; j < n; j++) {
      var i = rows[j], right = wrongOne ? j !== target : j === target, ans = t.r[i][b];
      if (!right) {
        var good = {}; sameRow(t, i, a).forEach(function (r) { good[low(r[b])] = 1; });
        var ws = []; t.r.forEach(function (r) { if (r[b] && !good[low(r[b])] && txt(r[b]).length <= 70 && ws.map(low).indexOf(low(r[b])) < 0) ws.push(r[b]); });
        if (!ws.length) return null;
        ans = R.pick(ws);
      }
      lines.push(t.r[i][a] + ' → ' + ans);
      steps.push(dot(t.r[i][a] + ' → ' + t.r[i][b] + (right ? ': right' : ', not ' + ans)));
    }
    var what = tp[4] ? ' Each line pairs ' + tp[4] + '.' : '';
    return { q: (wrongOne ? 'Exactly one of these pairings is <b>wrong</b>. Which one?' : 'Exactly one of these pairings is right. Which one?') + what,
      a: { t: 'mc', choices: lines, v: target }, steps: steps, hint: 'Check each line on its own against what you learned.', wh: [t.k, wrongOne ? 'pw' : 'pr', a, b] };
  }
  // sort: which column of a comparison table does a cell belong to
  function sortQ(R, t, L) {
    var cols = t.h.map(function (_, j) { return j; }).filter(function (j) { return j >= (t.na ? 0 : 1) && txt(t.h[j]); });
    if (cols.length < 2) return null;
    var cells = [];
    t.r.forEach(function (r, i) { cols.forEach(function (j) {
      if (!r[j] || (!t.na && !txt(r[0]))) return;
      var dup = cols.some(function (j2) { return j2 !== j && r[j2] && (low(r[j2]) === low(r[j]) || low(r[j2]).indexOf(low(r[j])) >= 0 || low(r[j]).indexOf(low(r[j2])) >= 0); });
      if (!dup && txt(r[j]).length <= 140) cells.push([i, j]);
    }); });
    if (cells.length < 2) return null;
    var heads = cols.map(function (j) { return t.h[j]; });
    if (L >= 3 && cells.length >= 5) {
      var j0 = R.pick(cols), pick = R.shuffle(cells).slice(0, Math.min(5, cells.length));
      var hits = pick.filter(function (c) { return c[1] === j0; }).length;
      if (hits >= 1 && hits < pick.length) {
        var ch = pick.map(function (c) { return lab(t, c); });
        var v = pick.map(function (c, k) { return c[1] === j0 ? k : -1; }).filter(function (k) { return k >= 0; });
        return { q: fill(t.all, t.h[j0]), a: { t: 'mc', choices: ch, v: v },
          steps: pick.map(function (c) { return dot(lab(t, c) + ' (' + t.h[c[1]] + ')'); }),
          hint: 'Go through them one at a time.', wh: [t.k, 'sa', j0, pick] };
      }
    }
    var c = R.pick(cells);
    return { q: t.one + (t.na ? (/^["“]/.test(txt(t.r[c[0]][c[1]])) ? '<br>' + t.r[c[0]][c[1]] : '<br>“' + t.r[c[0]][c[1]] + '”') : '<br>' + asp(t.r[c[0]][0]) + t.r[c[0]][c[1]]), a: { t: 'mc', choices: heads.slice(), v: cols.indexOf(c[1]) },
      steps: t.na ? [dot('That is ' + t.h[c[1]].replace(/^./, function (x) { return x.toLowerCase(); }))] : [dot(txt(t.r[c[0]][0]) + ' for ' + t.h[c[1]] + ': ' + t.r[c[0]][c[1]])].concat(cols.filter(function (j) { return j !== c[1] && t.r[c[0]][j]; }).map(function (j) { return dot('For ' + t.h[j] + ': ' + t.r[c[0]][j]); })),
      hint: 'Think back to the lesson’s comparison' + (t.cap ? ' (' + t.cap.replace(/\.$/, '') + ')' : '') + '.', wh: [t.k, 's', c[0], c[1]] };
  }
  function asp(x) { return '<b>' + x + (/\?$/.test(txt(x)) ? '' : ':') + '</b> '; }
  function lab(t, c) { return t.na ? t.r[c[0]][c[1]] : asp(t.r[c[0]][0]) + t.r[c[0]][c[1]]; }
  // extra bank items: { q, a, w: [wrong answers, more than are shown], s: [steps], h: hint, lv } or { q, tf: true|false, s, lv }
  function extra(R, t, L) {
    var its = t.x.filter(function (it) { return (it.lv || 1) <= L; }); if (!its.length) return null;
    var it = R.pick(its), p;
    if (it.f) { it = FUNS[it.f](R, L); if (!it) return null; }
    if (it.num !== undefined) {
      p = { q: it.q, a: { t: 'num', v: String(it.num) }, steps: it.s.slice() };
      if (Number.isInteger(it.num) && !it.unit && !it.pct) p.a.form = 'int';
      if (it.pct) p.a.pct = true;
      if (it.tol != null) p.a.tol = it.tol;
      if (it.unit) p.unit = it.unit;
    }
    else if (it.tf !== undefined) p = { q: it.q, a: { t: 'tf', v: it.tf }, steps: it.s.slice() };
    else {
      var k = Math.min(L === 1 ? 3 : 4, it.w.length + 1);
      p = { q: it.q, a: { t: 'mc', choices: [it.a].concat(R.shuffle(it.w).slice(0, k - 1)), v: 0 }, steps: it.s.slice() };
    }
    p.hint = it.h || 'Think back to the lesson.';
    p.wh = [t.k, 'x', its.indexOf(it) >= 0 ? t.x.indexOf(it) : -1];
    return FUNS.__wrap ? FUNS.__wrap(p, L) : p;
  }
  function make(R, list, L) {
    for (var tries = 0; tries < 8; tries++) {
      var t = R.pick(list), p = null;
      if (t.x) p = extra(R, t, L);
      else if (t.one) p = sortQ(R, t, L);
      else {
        var tps = t.m.filter(function (tp) { return (tp[5] || 1) <= L; }); if (!tps.length) continue;
        var tp = R.pick(tps);
        p = L >= 2 && tp[4] && R.chance(0.35) ? pairs(R, t, tp, L) : match(R, t, tp, L);
      }
      if (p) {
        // ladder pages show choices as plain text (only $…$ math is rendered), so choices carry no tags
        if (p.a.t === 'mc') { p.a.choices = p.a.choices.map(plain); var seen = {}; if (p.a.choices.some(function (c) { var k = seen[c]; seen[c] = 1; return k; })) continue; }
        p.nowiden = true; return p;
      }
    }
    return null;
  }
  var BY = {}; TABS.forEach(function (t) { var id = t.k.split('#')[0].split('@')[0]; (BY[id] = BY[id] || []).push(t); });
  var VAR = {};
  function baseCount(id, base, L) { // different questions (ignoring the order of choices) from 40 fixed seeds
    var key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 24; s++) {
        try { var p = base(ML.rand(id + '#whv#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; } } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key];
  }
  function extCount(id, L) { // different table questions from 40 fixed seeds
    var key = id + '|x|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 24; s++) {
        var p = make(ML.rand(id + '#whx#' + s + '#' + L), BY[id], L); if (!p) continue;
        var k = p.q + '|' + JSON.stringify(p.a.choices ? p.a.choices.slice().sort() : p.a.v);
        if (!seen[k]) { seen[k] = 1; n++; }
      }
      VAR[key] = n;
    }
    return VAR[key];
  }
  Object.keys(BY).forEach(function (id) {
    var base = ML.getGen(id); if (!base || base._wh) return;
    var fn = function (R, ctx) {
      var L = (ctx && ctx.level) || 1, n = baseCount(id, base, L), x = extCount(id, L), share = Math.max(0.15, Math.min(0.5, x / (x + n + 1)));
      if (R.chance(share)) { var p = make(R, BY[id], L); if (p) return p; }
      return base(R, ctx);
    };
    fn._wh = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
/* ---- end widen_hum ---- */

/* ---- widen: more forms of the same questions (so practice repeats less) ----------------------------------------
   Every topic of this course keeps its own problems, and some draws are turned into other forms of the same skill,
   built only from the topic's own problems (so their answers stay the ones the topic already checks):
     check   "Ava chose X. Is Ava right?" (Yes or No) from a one-answer multiple-choice problem
     pairs   two or three lines "question → answer"; which line is right (or, at level 3, which one is wrong)
     tfpick  "Which sentence is true?" (or false) from three of the topic's true-or-false sentences
   Questions whose answer depends on the other choices (first, best, most, not …) show the choices in the check form
   and never go into pairs. Mix per level: CFG.mix[level] = [check, pairs, tfpick] shares; the rest stays as it was. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var CFG = {"prefix":"macro.","only":["circular-flow","gdp-definition","gdp-limits","gdp-deflator","labor-force","unemployment-rate","types-unemployment","price-index","inflation-rate","real-values","costs-of-inflation","business-cycle","aggregate-demand","ad-shifters","mpc-mps","spending-multiplier","tax-multiplier","sras","lras","ad-as-equilibrium","ad-as-shocks","self-adjustment","fiscal-policy","fiscal-policy-size","tax-structures","automatic-stabilizers","deficits-debt","financial-assets","real-interest-rate","money-functions","money-supply-measures","bank-balance-sheets","money-creation","money-market","fed-tools","ample-reserves","monetary-policy","loanable-funds","policy-mix","short-run-phillips","long-run-phillips","quantity-theory","crowding-out","schools-of-thought","productivity","rule-of-70","growth-policy","balance-of-payments","exchange-rates","forex-market","forex-shifts","net-exports-exchange","capital-flows","saving-investment-identity"]};
  var NAMES = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Finn', 'Gus', 'Hana', 'Ivy', 'Jude', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Pia',
    'Quinn', 'Rosa', 'Sam', 'Tess', 'Uma', 'Vic', 'Wren', 'Zoe', 'Ada', 'Leo', 'Mia', 'Theo', 'June', 'Max'];
  var REL = /\b(first|last|earliest|latest|earlier|later|before|after|older|oldest|newer|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|look|read|here|example|examples|likely|probably|mainly|main|usually|typically|other|another|which one|each|order|then|next)\b|n['’]t\b/i;
  // pairs judge each line on its own, so only questions whose answer depends on the other choices are left out
  var RELP = /\b(first|last|earliest|latest|oldest|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|which one|other|another|rank|order|more|less|fewer)\b|n['’]t\b|\w+est\b/i;
  var REF = /\b(this|these|those|shown|picture|map|table|chart|graph|diagram|passage|scene|story|above|below|here|following)\b/i;
  var BADCH = /\b(all|none|both|neither) of\b|\b(above|below)\b|^(both|neither|all|none)\b|\bchoice\b|\boption\b/i;
  function strip(s) { return String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function plainish(s) { return !/<(?!\/?(b|i|em|strong)\b)[^>]*>/.test(String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1')); }
  function add(q, html) { // inside a read-aloud big span when there is one
    var m = /<span class="[\w-]*big">/.exec(q);
    if (m) { var k = q.lastIndexOf('</span>'); if (k > m.index) return q.slice(0, k) + '<br>' + html.replace(/<\/p>\s*<p[^>]*>/g, '<br>').replace(/<\/?p[^>]*>/g, '') + q.slice(k); }
    return q + html;
  }
  function single(p) {
    return p && p.a && p.a.t === 'mc' && !Array.isArray(p.a.v) && Array.isArray(p.a.choices) && p.a.choices.length >= 2 &&
      !p.a.choices.some(function (c) { return BADCH.test(strip(c)); });
  }
  function hash(t) { var h = 7; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; }
  function nameFor(q, key) { // the same claim always gets the same name, so a name alone never makes a "new" problem
    var t = strip(q), ok = NAMES.filter(function (n) { return t.indexOf(n) < 0 && String(key).indexOf(n) < 0; });
    return (ok.length ? ok : NAMES)[hash(t + '|' + key) % (ok.length || NAMES.length)];
  }
  function dot(s) { s = String(s); return /[.!?…"”')\]]\s*(<\/b>)?$/.test(strip(s)) || /\$$/.test(s) ? s : s + '.'; }
  function optList(ch) { return '<p class="wd-opts">The choices were:<br>' + ch.map(function (c) { return '• ' + c; }).join('<br>') + '</p>'; }
  function copyP(p, q, a, steps) { var o = {}; for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) o[k] = p[k]; o.q = q; o.a = a; o.steps = steps; delete o.choices; return o; }

  // check: show one choice (the right one half the time) and ask whether it is right
  function check(p, R) {
    var ch = p.a.choices, v = p.a.v, idx = ch.map(function (_, i) { return i; }), others = idx.filter(function (i) { return i !== v; });
    var i = R.chance(0.5) ? v : R.pick(others), ok = i === v, nm = nameFor(p.q, ch[i]), letters = ch.every(function (c) { return /^[A-Z]$/.test(String(c)); });
    var stem = strip(p.q), html = '';
    if (!letters && (REL.test(stem) || ch.length > 4 || CFG.listAll)) {
      var shown = p.a.keep ? ch.slice() : R.shuffle(ch);
      html += optList(shown);
    }
    html += '<p class="wd-check">' + nm + ' chose: <b>' + ch[i] + '</b>' + (/[.!?…"”]$/.test(strip(ch[i])) ? '' : '.') + ' Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes. ' + dot(ch[v]) + ' is the right answer.' : 'No. The right answer is: ' + dot(ch[v]);
    if (ok) first = 'Yes, that is the right answer.';
    return copyP(p, add(p.q, html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [first].concat(p.steps || []));
  }
  // check for "choose all": the whole list is shown, and one learner's picks; right only if exactly the right ones
  function checkAll(p, R) {
    var ch = p.a.choices, v = p.a.v.slice().sort(), n = ch.length, pick;
    if (R.chance(0.45)) pick = v.slice();
    else {
      var t = 0; do { var j = R.int(0, n - 1), s = v.slice(), k = s.indexOf(j); if (k >= 0) s.splice(k, 1); else s.push(j); if (R.chance(0.3)) { var j2 = R.int(0, n - 1), k2 = s.indexOf(j2); if (k2 >= 0) s.splice(k2, 1); else s.push(j2); } pick = s.sort(); t++; }
      while (t < 20 && (!pick.length || pick.join() === v.join()));
      if (!pick.length || pick.join() === v.join()) return null;
    }
    var ok = pick.join() === v.join(), nm = nameFor(p.q, pick.join());
    var html = optList(ch) + '<p class="wd-check">' + nm + ' chose ' +
      (pick.length === 1 ? 'only: <b>' + ch[pick[0]] + '</b>' : 'these: <b>' + pick.map(function (i) { return ch[i]; }).join('</b>; <b>') + '</b>') + '. Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes, those are exactly the right ones.' : 'No. The right ones are: ' + v.map(function (i) { return ch[i]; }).join('; ');
    return copyP(p, add(p.q.replace(/\s*(Choose|Select|Pick) (all|every)[^.?!<]*[.?!]?/i, ''), html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [dot(first)].concat(p.steps || []));
  }

  // items for pairs: one-answer questions that stand on their own (no picture, no passage, no "first/best/…")
  function pairItem(p) {
    if (!single(p) || p.viz) return null;
    var max = CFG.maxStem || 120, maxA = CFG.maxAns || 70, a = strip(p.a.choices[p.a.v]), stem, group = '';
    // "prompt<br><b>thing</b>" or "prompt<blockquote>thing</blockquote>": a line is "thing → answer", lines share the prompt
    var q0 = p.q.replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1').trim();
    var m = /^([^<]{6,140}?)\s*(?:<br>\s*<b>([^<]{3,140})<\/b>|<blockquote>([^<]{3,140})<\/blockquote>)\s*$/.exec(q0);
    if (m) { group = m[1].trim(); stem = (m[2] || m[3]).trim(); if (RELP.test(group.replace(/\b(this|these)\b/gi, ''))) return null; }
    else {
      if (!plainish(p.q)) return null;
      stem = strip(p.q); if (RELP.test(stem)) return null;
    }
    if (stem.length > max || stem.length < 3 || a.length > maxA || /^[A-Z]$/.test(a) || /\$/.test(stem + a + group)) return null;
    var w = p.a.choices.filter(function (_, i) { return i !== p.a.v; }).map(strip).filter(function (x) { return x.length <= maxA && x !== a; });
    if (!w.length) return null;
    return { stem: stem.replace(/\s*(Choose one|Pick one)\.?$/i, ''), a: a, w: w, why: (p.steps || [])[0] || '', group: group };
  }
  function tfItem(p) {
    if (!p || !p.a || p.a.t !== 'tf' || p.viz || !plainish(p.q)) return null;
    var s = strip(p.q).replace(/^(True or false\?|True or false:)\s*/i, '').replace(/\s*(True or false\?|Is this true or false\?|Is it true or false\?)$/i, '').trim();
    if (s.length < 8 || s.length > (CFG.maxStem || 120) + 20 || REF.test(s) || /\?$/.test(s) || /\$/.test(s)) return null;
    return { s: s, v: p.a.v, why: (p.steps || [])[0] || '' };
  }
  function harvest(base, R, ctx, make, n, distinct) {
    var out = [], keys = {};
    for (var t = 0; t < 24 && out.length < n; t++) {
      // at level 3, lines may come from level 2 questions too: three lines with one wrong is the harder form
      var c2 = ctx && ctx.level >= 3 && (t % 2) ? Object.assign({}, ctx, { level: 2 }) : ctx;
      var p; try { p = base(ML.rand(R.int(1, 2e9)), c2); } catch (e) { continue; }
      var it = make(p); if (!it) continue;
      if (out.length && it.group !== undefined && it.group !== out[0].group) continue;
      var k = distinct(it); if (k.some(function (x) { return keys[x]; })) continue;
      k.forEach(function (x) { keys[x] = 1; }); out.push(it);
    }
    return out;
  }
  function pairs(base, R, ctx, n, wrongOne) {
    var its = harvest(base, R, ctx, pairItem, n, function (it) { return it.group ? ['s:' + it.stem] : ['s:' + it.stem, 'a:' + it.a]; });
    if (its.length < n) return null;
    var answers = its.map(function (it) { return it.a; }), used = {};
    var target = R.int(0, n - 1), lines = [], steps = [];
    for (var i = 0; i < n; i++) {
      var it = its[i], right = wrongOne ? i !== target : i === target, ans = it.a;
      if (!right) {
        var ws = it.w.filter(function (x) { return (its[0].group || answers.indexOf(x) < 0) && !used[x]; });
        if (!ws.length) return null;
        ans = R.pick(ws); if (!its[0].group) used[ans] = 1;
      }
      lines.push(it.stem + ' → ' + ans); // plain text: ladder pages show choices as text
      steps.push(it.group ? dot(it.stem) + ' Answer: ' + it.a + (right ? '.' : ', not ' + ans + '.') : it.stem + ' The answer is ' + it.a + (right ? '.' : ', not ' + ans + '.'));
    }
    var g = its[0].group, q = g ? '<p class="wd-group">The question for every line: <i>' + g + '</i></p>' + (wrongOne ? 'One line has the <b>wrong</b> answer. Which line is it?' : n === 2 ? 'Which line has the <b>right</b> answer?' : 'Only one line has the right answer. Which line is it?') : wrongOne ? 'Each line is a question and an answer. One answer is <b>wrong</b>. Which line is it?'
      : (n === 2 ? 'Each line is a question and an answer. Which line has the <b>right</b> answer?' : 'Each line is a question and an answer. Only one answer is right. Which line is it?');
    if (its[target].why) steps.push(its[target].why);
    return { q: q, a: { t: 'mc', choices: lines, v: target }, steps: steps, hint: 'Check each line on its own. Does the answer fit the question?' };
  }
  function tfpick(base, R, ctx, wantFalse) {
    var its = harvest(base, R, ctx, tfItem, 6, function (it) { return ['s:' + it.s]; });
    var T = its.filter(function (x) { return x.v; }), F = its.filter(function (x) { return !x.v; });
    var odd = wantFalse ? F : T, rest = wantFalse ? T : F;
    if (!odd.length || rest.length < 2) return null;
    var pick = [odd[0], rest[0], rest[1]], order = R.shuffle([0, 1, 2]), choices = order.map(function (i) { return pick[i].s; });
    var steps = pick.map(function (x) { return x.s + ' ' + (x.v ? 'True.' : 'False.'); });
    if (odd[0].why) steps.push(odd[0].why);
    return { q: wantFalse ? 'Which sentence is <b>false</b>?' : 'Which sentence is <b>true</b>?', a: { t: 'mc', choices: choices, v: order.indexOf(0) }, steps: steps,
      hint: 'Decide about each sentence on its own.' };
  }
  var MIX = CFG.mix || { 1: [0.38, 0.25, 0.04], 2: [0.27, 0.3, 0.1], 3: [0.17, 0.4, 0.15] };
  function wrap(id, base) {
    var fn = function (R, ctx) {
      var lv = ctx && ctx.level || 1, p = base(R, ctx), m = MIX[lv] || MIX[3], r = R.next();
      if (p.nowiden || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf') || (CFG.skip && CFG.skip.indexOf(id) >= 0)) return p; // typed answers stay as they are
      var form = r < m[0] ? 0 : r < m[0] + m[1] ? 1 : r < m[0] + m[1] + m[2] ? 2 : -1;
      if (form < 0) return p;
      var tries = [form, (form + 1) % 3, (form + 2) % 3].filter(function (f) { return m[f] > 0; });
      for (var t = 0; t < tries.length; t++) {
        var f = tries[t], alt = null;
        if (f === 0) alt = single(p) ? check(p, R) : (p.a && p.a.t === 'mc' && Array.isArray(p.a.v) && !p.viz ? checkAll(p, R) : null);
        else if (f === 1) alt = pairs(base, R, ctx, lv === 1 ? 2 : 3, lv >= 3 && R.chance(0.6));
        else alt = tfpick(base, R, ctx, R.chance(0.4));
        if (alt) return alt;
      }
      return p;
    };
    fn.widened = true;
    return fn;
  }
  ML.genIds().forEach(function (id) {
    if (id.indexOf(CFG.prefix) !== 0 || (CFG.only && CFG.only.indexOf(id.slice(CFG.prefix.length)) < 0)) return;
    var g = ML.getGen(id); if (g && !g.widened) ML.gen(id, wrap(id, g));
  });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
/* ---- end widen ---- */

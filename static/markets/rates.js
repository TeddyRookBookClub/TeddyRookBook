/* Treasuries page: live yield curve, rate history (FRED) and auction results (Fiscal Data). */
(function (W, D) {
  'use strict';
  var $ = function (s) { return D.querySelector(s); };
  var esc = MK.esc;
  function bp(x) { return x == null || !isFinite(x) ? '–' : (x > 0 ? '+' : '') + Math.round(x * 100); }
  function pct(v) { return v == null ? '–' : v.toFixed(2) + '%'; }
  function bn(v) { return v == null ? '–' : '$' + (v / 1e9).toFixed(v >= 1e11 ? 0 : 1) + 'B'; }

  // ---------- yield curve ----------
  var T = TSY.TENORS, POS = {}; T.forEach(function (t, i) { POS[t] = i; });
  var LABEL = { '1 Mo': '1M', '1.5 Month': '6W', '2 Mo': '2M', '3 Mo': '3M', '4 Mo': '4M', '6 Mo': '6M', '1 Yr': '1Y', '2 Yr': '2Y', '3 Yr': '3Y', '5 Yr': '5Y', '7 Yr': '7Y', '10 Yr': '10Y', '20 Yr': '20Y', '30 Yr': '30Y' };
  var curveChart = new MChart($('#yc'), { xType: 'num', noZoom: true, xTicks: T.map(function (t, i) { return [i, LABEL[t]]; }), xLabel: function (i) { return T[Math.round(i)] ? T[Math.round(i)].replace('Mo', 'Month').replace('Yr', 'Year') : ''; }, fmtLeft: function (v) { return v.toFixed(2) + '%'; } });
  var ROWS = [];
  function closest(date) { // last row on or before date
    var best = null; ROWS.forEach(function (r) { if (r.date <= date) best = r; }); return best;
  }
  function ago(days) { var d = new Date(Date.parse(ROWS[ROWS.length - 1].date) - days * 864e5); return d.toISOString().slice(0, 10); }
  function drawCurve() {
    if (!ROWS.length) return;
    var last = ROWS[ROWS.length - 1];
    var picks = [['Latest (' + last.date + ')', last, '#1f6fb2', 2.6]];
    [['1 week ago', 7, '#b8862a'], ['1 month ago', 30, '#7b4fa0'], ['1 year ago', 365, '#c0392b']].forEach(function (c) { if ($('#yc-' + c[1]).checked) { var r = closest(ago(c[1])); if (r) picks.push([c[0] + ' (' + r.date + ')', r, c[2], 1.6]); } });
    var cd = $('#yc-date').value; if (cd) { var rr = closest(cd); if (rr) picks.push(['Chosen date (' + rr.date + ')', rr, '#2e8b57', 1.6]); }
    curveChart.set(picks.map(function (p) {
      return { name: p[0], color: p[2], width: p[3], dots: true, fmt: function (v) { return v.toFixed(2) + '%'; }, pts: T.filter(function (t) { return p[1][t] != null; }).map(function (t) { return [POS[t], p[1][t]]; }) };
    }));
    // table of latest yields and changes
    var cmp = [['1D', 1], ['1W', 7], ['1M', 30], ['YTD', null], ['1Y', 365]];
    var ytd = closest((+last.date.slice(0, 4) - 1) + '-12-31');
    $('#yc-table').innerHTML = '<thead><tr><th>Maturity</th><th class="num">Yield</th>' + cmp.map(function (c) { return '<th class="num">' + c[0] + ' (bp)</th>'; }).join('') + '</tr></thead><tbody>' +
      T.filter(function (t) { return last[t] != null; }).map(function (t) {
        return '<tr><td>' + t.replace('Mo', 'month').replace('Yr', 'year').replace('1.5 Month', '6 week') + '</td><td class="num"><b>' + last[t].toFixed(2) + '%</b></td>' + cmp.map(function (c) {
          var r = c[1] == null ? ytd : c[1] === 1 ? ROWS[ROWS.length - 2] : closest(ago(c[1])); var d = r && r[t] != null ? last[t] - r[t] : null;
          return '<td class="num ' + (d > 0 ? 'up' : d < 0 ? 'down' : '') + '">' + bp(d) + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody>';
    var s2 = last['10 Yr'] - last['2 Yr'], s3 = last['10 Yr'] - last['3 Mo'];
    $('#yc-sum').innerHTML = '10y − 2y: <b class="' + (s2 < 0 ? 'down' : 'up') + '">' + bp(s2) + ' bp</b> · 10y − 3m: <b class="' + (s3 < 0 ? 'down' : 'up') + '">' + bp(s3) + ' bp</b>' + (s2 < 0 || s3 < 0 ? ' · the curve is <b>inverted</b> (short rates above long rates), which has preceded most U.S. recessions.' : ' · the curve slopes upward (normal).');
  }
  var y = new Date().getFullYear();
  TSY.curves([y - 1, y]).then(function (rows) {
    ROWS = rows.filter(function (r) { return r['10 Yr'] != null; });
    if (!ROWS.length) throw new Error('no data returned');
    drawCurve();
    $('#yc-date').max = ROWS[ROWS.length - 1].date;
  }).catch(function (e) { $('#yc-sum').textContent = 'Could not load the Treasury yield curve (' + e.message + ').'; });
  ['yc-7', 'yc-30', 'yc-365'].forEach(function (id) { $('#' + id).addEventListener('change', drawCurve); });
  $('#yc-date').addEventListener('change', function () {
    var v = this.value; if (!v) return drawCurve();
    var yy = +v.slice(0, 4);
    if (ROWS.length && v < ROWS[0].date) TSY.curveYear(yy).then(function (rows) { ROWS = rows.concat(ROWS).filter(function (r, i, a) { return r['10 Yr'] != null && (!i || a[i - 1].date !== r.date); }).sort(function (a, b) { return a.date < b.date ? -1 : 1; }); drawCurve(); });
    else drawCurve();
  });

  // ---------- history (FRED) ----------
  var hChart = new MChart($('#hist'), {}), sChart = new MChart($('#spr'), {}), REC = [];
  var HSETS = { main: [['DFF', 'Fed funds'], ['DGS3MO', '3-month'], ['DGS2', '2-year'], ['DGS10', '10-year'], ['DGS30', '30-year']], real: [['DGS10', '10-year nominal'], ['DFII10', '10-year real (TIPS)'], ['T10YIE', '10-year breakeven inflation']], mort: [['MORTGAGE30US', '30-yr mortgage'], ['DGS10', '10-year Treasury']] };
  var hset = 'main', hyrs = 20;
  function drawHist() {
    var set = HSETS[hset], x0 = hyrs ? Date.now() - hyrs * MK.YEAR : null;
    Promise.all(set.map(function (s) { return MK.fred(s[0]).catch(function () { return null; }); })).then(function (all) {
      hChart.set(set.map(function (s, i) { return all[i] && { name: s[1], pts: all[i], color: MK.PALETTE[i], fmt: function (v) { return v.toFixed(2) + '%'; } }; }).filter(Boolean), { x0: x0, shade: REC, fmtLeft: function (v) { return v + '%'; } });
    });
    Promise.all(['T10Y2Y', 'T10Y3M'].map(function (id) { return MK.fred(id).catch(function () { return null; }); })).then(function (a) {
      sChart.set([a[0] && { name: '10y − 2y', pts: a[0], color: MK.PALETTE[0], fmt: function (v) { return v.toFixed(2) + ' pts'; } }, a[1] && { name: '10y − 3m', pts: a[1], color: MK.PALETTE[1], fmt: function (v) { return v.toFixed(2) + ' pts'; } }].filter(Boolean),
        { x0: x0, shade: REC, refLines: [{ y: 0, label: 'inverted below 0', include: true, color: '#c0392b' }] });
    });
  }
  MK.recessions().then(function (r) { REC = r; drawHist(); });
  $('#h-set').addEventListener('change', function () { hset = this.value; drawHist(); });
  $('#h-yrs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; hyrs = +b.dataset.y; Array.prototype.forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); }); drawHist(); });

  // ---------- auctions ----------
  var AUC = [], CURVE = {};
  function curveOn(date) { // same-day par yield curve row
    if (CURVE[date]) return CURVE[date];
    for (var i = ROWS.length - 1; i >= 0; i--) if (ROWS[i].date === date) return (CURVE[date] = ROWS[i]);
    return null;
  }
  function verdict(r) {
    var score = 0;
    if (r.btcAvg != null) score += r.bid_to_cover_ratio - r.btcAvg > 0.08 ? 1 : r.bid_to_cover_ratio - r.btcAvg < -0.08 ? -1 : 0;
    if (r.vsMkt != null) score += r.vsMkt <= -0.01 ? 1 : r.vsMkt >= 0.015 ? -1 : 0;
    return score >= 1 ? '<span class="tag good">Strong</span>' : score <= -1 ? '<span class="tag bad">Weak</span>' : '<span class="tag">Average</span>';
  }
  function enrich() {
    var byTerm = {};
    AUC.slice().reverse().forEach(function (r) { // oldest first
      if (!r.done) return;
      var k = r.kind + '|' + r.term, h = byTerm[k] || (byTerm[k] = []);
      var prev = h.slice(-6);
      r.btcAvg = prev.length >= 2 ? prev.reduce(function (s, x) { return s + x.bid_to_cover_ratio; }, 0) / prev.length : null;
      r.prevY = prev.length ? prev[prev.length - 1].y : null;
      var comp = r.comp_accepted || r.total_accepted;
      r.ind = comp ? r.indirect_bidder_accepted / comp * 100 : null; r.dir = comp ? r.direct_bidder_accepted / comp * 100 : null; r.dlr = comp ? r.primary_dealer_accepted / comp * 100 : null;
      var ten = TSY.tenorFor(r.term), c = curveOn(r.auction_date);
      r.vsMkt = r.kind !== 'TIPS' && r.kind !== 'FRN' && ten && c && c[ten] != null && r.y != null ? r.y - c[ten] : null;
      h.push(r);
    });
  }
  function drawAuctions() {
    var kind = $('#a-kind').value, term = $('#a-term').value;
    var rows = AUC.filter(function (r) { return r.done && (kind === 'All' || r.kind === kind) && (!term || r.term === term); }).slice(0, 150);
    $('#auc tbody').innerHTML = rows.map(function (r) {
      var over = r.total_tendered - r.offering_amt;
      return '<tr><td>' + r.auction_date + '</td><td><b>' + esc(r.term) + '</b> ' + esc(r.kind) + (r.reopening === 'Yes' ? ' <span class="tag" title="Reopening: more of an existing issue">reopen</span>' : '') + '</td>' +
        '<td class="num">' + bn(r.offering_amt) + '</td><td class="num">' + bn(r.total_tendered) + '</td><td class="num">' + bn(over) + '</td>' +
        '<td class="num"><b>' + (r.bid_to_cover_ratio != null ? r.bid_to_cover_ratio.toFixed(2) : '–') + '</b>' + (r.btcAvg != null ? ' <small class="' + (r.bid_to_cover_ratio >= r.btcAvg ? 'up' : 'down') + '">' + (r.bid_to_cover_ratio >= r.btcAvg ? '▲' : '▼') + ' vs ' + r.btcAvg.toFixed(2) + '</small>' : '') + '</td>' +
        '<td class="num">' + pct(r.y) + (r.prevY != null ? ' <small class="muted">prev ' + r.prevY.toFixed(3) + '</small>' : '') + '</td>' +
        '<td class="num ' + (r.vsMkt > 0.005 ? 'down' : r.vsMkt < -0.005 ? 'up' : '') + '">' + (r.vsMkt == null ? '–' : bp(r.vsMkt)) + '</td>' +
        '<td class="num">' + (r.ind != null ? r.ind.toFixed(0) + '%' : '–') + '</td><td class="num">' + (r.dir != null ? r.dir.toFixed(0) + '%' : '–') + '</td><td class="num">' + (r.dlr != null ? r.dlr.toFixed(0) + '%' : '–') + '</td>' +
        '<td>' + verdict(r) + '</td></tr>';
    }).join('') || '<tr><td colspan="12">No auctions match.</td></tr>';
    // history chart for one term
    var chosen = term || (rows[0] && rows[0].term), k = rows[0] && rows[0].kind;
    var hist = AUC.filter(function (r) { return r.done && r.term === chosen && (kind === 'All' ? r.kind === k : r.kind === kind); }).reverse();
    $('#a-title').textContent = chosen ? chosen + ' ' + (kind === 'All' ? k : kind) + ' auctions' : '';
    aChart.set(hist.length ? [{ name: 'Bid-to-cover', pts: hist.map(function (r) { return [Date.parse(r.auction_date), r.bid_to_cover_ratio]; }), color: MK.PALETTE[0], dots: true, fmt: function (v) { return v.toFixed(2) + 'x'; } },
      { name: 'High yield / rate', pts: hist.filter(function (r) { return r.y != null; }).map(function (r) { return [Date.parse(r.auction_date), r.y]; }), color: MK.PALETTE[1], axis: 'right', dots: true, fmt: function (v) { return v.toFixed(3) + '%'; } }] : [], { fmtRight: function (v) { return v.toFixed(2) + '%'; } });
  }
  var aChart = new MChart($('#auc-chart'), { emptyText: 'Pick a security to see its auction history' });
  function terms() {
    var kind = $('#a-kind').value, seen = {};
    var list = AUC.filter(function (r) { return r.done && (kind === 'All' || r.kind === kind); }).map(function (r) { return r.term; }).filter(function (t) { if (seen[t]) return false; seen[t] = 1; return true; });
    var order = function (t) { var m = /([\d.]+)\s*(\w+)/.exec(t) || [0, 0, '']; return +m[1] * ({ Day: 1, Week: 7, Month: 30, Year: 365 })[m[2]] || 0; };
    list.sort(function (a, b) { return order(a) - order(b); });
    $('#a-term').innerHTML = '<option value="">All maturities</option>' + list.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('');
  }
  $('#a-kind').addEventListener('change', function () { terms(); drawAuctions(); });
  $('#a-term').addEventListener('change', drawAuctions);
  Promise.all([TSY.auctions(TSY.daysAgo(540)), TSY.curves([y - 2, y - 1, y]).then(function (r) { ROWS = ROWS.length ? ROWS : r; return r; })]).then(function (res) {
    var all = res[1]; all.forEach(function (r) { CURVE[r.date] = r; });
    AUC = res[0]; enrich(); terms(); drawAuctions();
    var next = AUC.filter(function (r) { return !r.done; }).reverse();
    $('#a-next').innerHTML = next.length ? 'Announced next: ' + next.slice(0, 6).map(function (r) { return '<b>' + esc(r.term) + ' ' + esc(r.kind) + '</b> ' + r.auction_date.slice(5) + (r.offering_amt ? ' (' + bn(r.offering_amt) + ')' : ''); }).join(' · ') : '';
  }).catch(function (e) { $('#auc tbody').innerHTML = '<tr><td colspan="12">Could not reach the Treasury API (' + esc(e.message) + ').</td></tr>'; });
})(window, document);

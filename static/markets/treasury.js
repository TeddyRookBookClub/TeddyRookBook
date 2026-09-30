/* Live Treasury data: auctions (Fiscal Data API) and the daily par yield curve (home.treasury.gov). Both allow browser access. */
(function (W) {
  'use strict';
  var FD = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/';
  function num(x) { return x == null || x === 'null' || x === '' ? null : +x; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function daysAgo(n) { var d = new Date(Date.now() - n * 864e5); return d.toISOString().slice(0, 10); }
  var FIELDS = ['cusip', 'security_type', 'security_term', 'original_security_term', 'auction_date', 'issue_date', 'maturity_date', 'offering_amt', 'total_tendered', 'total_accepted',
    'comp_accepted', 'comp_tendered', 'bid_to_cover_ratio', 'high_yield', 'avg_med_yield', 'low_yield', 'high_discnt_rate', 'high_investment_rate', 'avg_med_discnt_rate', 'int_rate', 'high_price', 'allocation_pctage',
    'direct_bidder_accepted', 'indirect_bidder_accepted', 'primary_dealer_accepted', 'soma_accepted', 'noncomp_accepted', 'reopening', 'inflation_index_security', 'floating_rate', 'cash_management_bill_cmb',
    'announcemt_date', 'pdf_filenm_comp_results', 'high_discnt_margin'];
  function page(base, n, all) {
    n = n || 1;
    return fetch(base + '&page[number]=' + n + '&page[size]=500').then(function (r) { if (!r.ok) throw new Error('Treasury API ' + r.status); return r.json(); }).then(function (j) {
      all = (all || []).concat(j.data || []);
      var pages = j.meta && j.meta['total-pages'] || 1;
      if (n < pages && n < 8) return page(base, n + 1, all);
      return all;
    });
  }
  function clean(r) {
    var o = {};
    FIELDS.forEach(function (k) { o[k] = r[k] === 'null' ? null : r[k]; });
    ['offering_amt', 'total_tendered', 'total_accepted', 'comp_accepted', 'comp_tendered', 'bid_to_cover_ratio', 'high_yield', 'avg_med_yield', 'low_yield', 'high_discnt_rate', 'high_investment_rate', 'avg_med_discnt_rate', 'int_rate', 'high_price', 'allocation_pctage',
      'direct_bidder_accepted', 'indirect_bidder_accepted', 'primary_dealer_accepted', 'soma_accepted', 'noncomp_accepted', 'high_discnt_margin'].forEach(function (k) { o[k] = num(o[k]); });
    o.kind = o.inflation_index_security === 'Yes' ? 'TIPS' : o.floating_rate === 'Yes' ? 'FRN' : o.cash_management_bill_cmb === 'Yes' ? 'CMB' : o.security_type;
    // bills are often reopenings of longer bills, so use the term actually auctioned; for notes and bonds the
    // original term ("10 Year") is the familiar name even for reopenings ("9-Year 10-Month")
    o.term = ((o.security_type === 'Bill' ? o.security_term : o.original_security_term) || o.security_term || '').replace(/-/g, ' ');
    // yield used for comparisons: coupon securities -> high yield; bills -> investment (bond-equivalent) rate
    o.y = o.high_yield != null ? o.high_yield : o.high_investment_rate;
    o.done = o.bid_to_cover_ratio != null;
    return o;
  }
  // Results of auctions held since `since` (YYYY-MM-DD), newest first. Includes announced-but-not-yet-held ones.
  function auctions(since) {
    var url = FD + 'auctions_query?fields=' + FIELDS.join(',') + '&filter=auction_date:gte:' + (since || daysAgo(400)) + '&sort=-auction_date';
    return page(url).then(function (rows) { return rows.map(clean); });
  }
  function upcoming() {
    return fetch(FD + 'upcoming_auctions?filter=auction_date:gte:' + today() + '&sort=auction_date&page[size]=100').then(function (r) { return r.json(); })
      .then(function (j) { return (j.data || []).map(function (r) { return { cusip: r.cusip, type: r.security_type, term: r.security_term, reopening: r.reopening, offering_amt: num(r.offering_amt), announced: r.announcemt_date, auction_date: r.auction_date, issue_date: r.issue_date }; }); });
  }
  // Daily par yield curve for a year: [{date, '1 Mo': 4.1, ...}]
  var TENORS = ['1 Mo', '1.5 Month', '2 Mo', '3 Mo', '4 Mo', '6 Mo', '1 Yr', '2 Yr', '3 Yr', '5 Yr', '7 Yr', '10 Yr', '20 Yr', '30 Yr'];
  var YEARS_OF = { '1 Mo': 1 / 12, '1.5 Month': 1.5 / 12, '2 Mo': 2 / 12, '3 Mo': 0.25, '4 Mo': 4 / 12, '6 Mo': 0.5, '1 Yr': 1, '2 Yr': 2, '3 Yr': 3, '5 Yr': 5, '7 Yr': 7, '10 Yr': 10, '20 Yr': 20, '30 Yr': 30 };
  var curveCache = {};
  function curveYear(y) {
    if (!curveCache[y]) curveCache[y] = fetch('https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/' + y + '/all?type=daily_treasury_yield_curve&field_tdr_date_value=' + y + '&page&_format=csv')
      .then(function (r) { if (!r.ok) throw new Error('Treasury ' + r.status); return r.text(); })
      .then(function (txt) {
        var lines = txt.trim().split(/\r?\n/), head = lines[0].split(',').map(function (h) { return h.replace(/"/g, '').trim(); });
        return lines.slice(1).map(function (l) {
          var c = l.split(','), m = c[0].split('/'), row = { date: m[2] + '-' + m[0] + '-' + m[1] };
          head.forEach(function (h, i) { if (i && c[i] !== '' && c[i] != null) row[h] = +c[i]; });
          return row;
        }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      });
    return curveCache[y];
  }
  function curves(years) { return Promise.all(years.map(function (y) { return curveYear(y).catch(function () { return []; }); })).then(function (a) { return [].concat.apply([], a).sort(function (x, y) { return x.date < y.date ? -1 : 1; }); }); }
  // map an auctioned term (e.g. "10 Year", "13 Week") to the closest curve tenor
  function tenorFor(term) {
    var m = /([\d.]+)\s*(Week|Month|Year|Day)/i.exec(term || ''); if (!m) return null;
    var yrs = +m[1] * ({ week: 7 / 365, month: 1 / 12, year: 1, day: 1 / 365 })[m[2].toLowerCase()];
    var best = null, bd = 1e9; TENORS.forEach(function (t) { var d = Math.abs(YEARS_OF[t] - yrs); if (d < bd) { bd = d; best = t; } });
    return bd <= Math.max(0.05, yrs * 0.15) ? best : null;
  }
  W.TSY = { auctions: auctions, upcoming: upcoming, curveYear: curveYear, curves: curves, TENORS: TENORS, YEARS_OF: YEARS_OF, tenorFor: tenorFor, today: today, daysAgo: daysAgo };
})(window);

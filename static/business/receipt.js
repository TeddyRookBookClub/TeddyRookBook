/* Your tax receipt: split an income-tax amount in proportion to federal spending, with live drill-down.
   Data: USAspending.gov Spending Explorer API (obligations by budget function > subfunction > federal account >
   program activity) and Treasury FiscalData (Monthly Treasury Statement year-end receipts and outlays). */
(function (W, D) {
  'use strict';
  var API = 'https://api.usaspending.gov/api/v2/spending/';
  var MTS = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_1';
  var FIRST = 2017, KEY = 'trb-taxreceipt-v1';
  var $ = function (s) { return D.querySelector(s); };
  var LEVELS = ['budget_function', 'budget_subfunction', 'federal_account', 'program_activity'];
  var cache = {};
  function post(body) {
    var k = JSON.stringify(body);
    if (!cache[k]) cache[k] = fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: k }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    return cache[k];
  }
  function money(v) { return '$' + (Math.round(v * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function big(v) { var a = Math.abs(v); return a >= 1e12 ? '$' + (v / 1e12).toFixed(2) + ' trillion' : a >= 1e9 ? '$' + (v / 1e9).toFixed(1) + ' billion' : '$' + Math.round(v / 1e6) + ' million'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nice(name) { // program activities come in capitals
    if (name && name === name.toUpperCase() && /[A-Z]{4}/.test(name)) return name.toLowerCase().replace(/(^|[\s\-\/(])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }).replace(/\b(And|Of|For|The|To|In|On|With|Or|A|An)\b/g, function (w) { return w.toLowerCase(); }).replace(/^./, function (c) { return c.toUpperCase(); });
    return name || 'Unnamed';
  }
  // the last fiscal year whose full-year data is out: a fiscal year ends Sept 30 and the year-end reports appear about seven weeks later
  var latestFY = (function () { var d = new Date(), y = d.getFullYear(); return d >= new Date(y, 10, 20) ? y : y - 1; })();
  var st = { amt: 10000, fy: latestFY, ss: true };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) st = Object.assign(st, sv); } catch (e) { }
  var sel = $('#tr-fy');
  for (var y = latestFY; y >= FIRST; y--) { var o = D.createElement('option'); o.value = y; o.textContent = y + ' (federal fiscal year Oct ' + (y - 1) + '–Sep ' + y + ')'; sel.appendChild(o); }
  if (st.fy < FIRST || st.fy > latestFY) st.fy = latestFY;
  $('#tr-amt').value = st.amt; sel.value = st.fy; $('#tr-ss').checked = st.ss;
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }

  // a node: {name, code, id, level, filters, amount (government $), share (your $), children}
  var root = null, gen = 0;
  function load(node) { // fetch children of node (or the top level when node is root)
    var level = node.level + 1, f = Object.assign({ fy: String(st.fy), period: '12' }, node.filters || {});
    return post({ type: LEVELS[level], filters: f }).then(function (res) {
      var rows = (res.results || []).filter(function (r) { return r.amount > 0 && r.code != null && r.name !== 'Governmental Receipts'; });
      if (level === 0 && !st.ss) rows = rows.filter(function (r) { return r.code !== '570' && r.code !== '650'; });
      var sum = rows.reduce(function (s, r) { return s + r.amount; }, 0);
      node.children = rows.sort(function (a, b) { return b.amount - a.amount; }).map(function (r) {
        var nf = Object.assign({}, node.filters || {}); nf[LEVELS[level]] = LEVELS[level] === 'federal_account' ? r.id : r.code;
        return { name: nice(r.name), code: r.code, level: level, filters: nf, amount: r.amount, share: node.share * r.amount / sum, children: null, open: false };
      });
      node.govTotal = sum;
      return node;
    });
  }
  function lineHTML(n, path) {
    var can = n.level < LEVELS.length - 1;
    var h = '<li class="tr-li lv' + n.level + (n.open ? ' open' : '') + '" data-p="' + path + '">' +
      '<button type="button" class="tr-line"' + (can ? ' aria-expanded="' + (n.open ? 'true' : 'false') + '"' : ' disabled') + '>' +
      '<span class="tr-n">' + (can ? '<i>' + (n.open ? '−' : '+') + '</i>' : '') + esc(n.name) + '</span><span class="tr-d"></span><span class="tr-a">' + money(n.share) + '</span></button>' +
      '<span class="tr-bar" style="--w:' + Math.max(0.5, 100 * n.share / root.share).toFixed(2) + '%"></span>';
    if (n.open) {
      if (n.loading) h += '<ul><li class="tr-msg">Loading…</li></ul>';
      else if (n.err) h += '<ul><li class="tr-msg">Couldn’t load this. <button type="button" class="tr-retry" data-p="' + path + '">Try again</button></li></ul>';
      else if (n.children) {
        var show = n.showAll ? n.children : n.children.slice(0, 12), rest = n.children.slice(show.length);
        h += '<ul>' + show.map(function (c, i) { return lineHTML(c, path + '.' + n.children.indexOf(c)); }).join('');
        if (rest.length) h += '<li class="tr-more"><button type="button" data-more="' + path + '">+ ' + rest.length + ' more (' + money(rest.reduce(function (s, c) { return s + c.share; }, 0)) + ')</button></li>';
        if (!n.children.length) h += '<li class="tr-msg">No further detail reported.</li>';
        h += '</ul>';
      }
    }
    return h + '</li>';
  }
  function nodeAt(path) { var n = root; path.split('.').slice(1).forEach(function (i) { n = n.children[+i]; }); return n; }
  function render() {
    $('#tr-meta').textContent = 'Fiscal year ' + st.fy + ' · Income tax paid ' + money(st.amt) + (st.ss ? '' : ' · excluding Social Security & Medicare');
    $('#tr-total').textContent = money(st.amt);
    if (!root || !root.children) return;
    $('#tr-lines').innerHTML = root.children.map(function (c, i) { return lineHTML(c, 'r.' + i); }).join('');
  }
  function start() {
    var my = ++gen;
    st.amt = Math.max(0, +$('#tr-amt').value || 0); st.fy = +sel.value; st.ss = $('#tr-ss').checked; save();
    root = { level: -1, share: st.amt, filters: {}, children: null };
    $('#tr-lines').innerHTML = '<li class="tr-msg">Loading spending data for ' + st.fy + '…</li>';
    render();
    load(root).then(function () { if (my === gen) render(); }).catch(function () { if (my === gen) $('#tr-lines').innerHTML = '<li class="tr-msg">Couldn’t reach USAspending.gov just now. Check your connection and try again in a moment.</li>'; });
    borrow(st.fy, my);
  }
  function borrow(fy, my) {
    var el = $('#tr-borrow'); el.textContent = '';
    fetch(MTS + '?filter=record_calendar_month:eq:09,record_fiscal_year:eq:' + fy + '&page[size]=60').then(function (r) { return r.json(); }).then(function (j) {
      var head = (j.data || []).filter(function (x) { return x.classification_desc === 'FY ' + fy; })[0]; if (!head) return;
      var ytd = j.data.filter(function (x) { return x.parent_id === head.classification_id && x.classification_desc === 'Year-to-Date'; })[0]; if (!ytd || my !== gen) return;
      var rc = +ytd.current_month_gross_rcpt_amt, ou = +ytd.current_month_gross_outly_amt, df = ou - rc;
      el.innerHTML = 'In fiscal ' + fy + ' the government took in <b>' + big(rc) + '</b> and spent <b>' + big(ou) + '</b>' + (df > 0 ? ', so it borrowed <b>' + big(df) + '</b>, about ' + Math.round(100 * df / ou) + '¢ of every dollar it spent. For each $1 of tax, about ' + money(ou / rc) + ' was spent: your ' + money(st.amt) + ' went along with about <b>' + money(st.amt * df / rc) + '</b> of borrowed money.' : '.');
    }).catch(function () { });
  }
  $('#tr-lines').addEventListener('click', function (e) {
    var more = e.target.closest('[data-more]'); if (more) { nodeAt(more.dataset.more).showAll = true; render(); return; }
    var b = e.target.closest('.tr-line,.tr-retry'); if (!b || b.disabled) return;
    var path = (b.dataset.p || b.closest('.tr-li').dataset.p), n = nodeAt(path);
    if (b.classList.contains('tr-line') && n.open) { n.open = false; render(); return; }
    n.open = true; n.err = false;
    if (!n.children) { n.loading = true; render(); load(n).then(function () { n.loading = false; render(); }).catch(function () { n.loading = false; n.err = true; render(); }); }
    else render();
  });
  $('#tr-collapse').addEventListener('click', function () { (function walk(n) { (n.children || []).forEach(function (c) { c.open = false; walk(c); }); })(root || {}); render(); });
  var t = 0;
  $('#tr-amt').addEventListener('input', function () { // amount changes just rescale; no refetch
    st.amt = Math.max(0, +this.value || 0); save();
    if (!root || !root.children) return;
    var k = st.amt / (root.share || 1); root.share = st.amt;
    (function walk(n) { (n.children || []).forEach(function (c) { c.share *= k; walk(c); }); })(root);
    render(); clearTimeout(t); t = setTimeout(function () { borrow(st.fy, gen); }, 300);
  });
  sel.addEventListener('change', start); $('#tr-ss').addEventListener('change', start);

  // ---- picture ----
  function visibleLines() { var out = []; (function walk(n, d) { (n.children || []).forEach(function (c, i) { if (!n.showAll && i >= 12 && d > 0) return; out.push([d, c.name, c.share]); if (c.open && c.children) walk(c, d + 1); }); })(root, 0); return out; }
  function picture() {
    var lines = visibleLines(), S = 2, Wd = 900, pad = 50, mono = '"Courier New", ui-monospace, Menlo, monospace', g;
    var cv = D.createElement('canvas'); g = cv.getContext('2d');
    g.font = '400 22px ' + mono; var cw = g.measureText('M').width, cols = Math.floor((Wd - 2 * pad) / cw);
    var rows = [];
    function center(t, o) { rows.push(Object.assign({ t: t, center: true }, o || {})); }
    center('UNITED STATES GOVERNMENT', { bold: true, size: 30 }); center('Your share of federal spending', { size: 22 }); $('#tr-meta').textContent.split(' · ').forEach(function (m) { center(m, { size: 18 }); }); rows.push({ dash: true });
    lines.forEach(function (l) {
      var ind = '  '.repeat(l[0]), amt = money(l[2]), room = cols - amt.length - 1 - ind.length, name = l[1];
      var parts = []; while (name.length > room) { var cut = name.lastIndexOf(' ', room); if (cut < 8) cut = room; parts.push(name.slice(0, cut)); name = name.slice(cut).trim(); } parts.push(name);
      parts.forEach(function (p, j) { var last = j === parts.length - 1; rows.push({ t: ind + (j ? '  ' : '') + p + (last ? ' ' + '.'.repeat(Math.max(1, cols - ind.length - (j ? 2 : 0) - p.length - amt.length - 1)) + amt : ''), bold: l[0] === 0 }); });
    });
    rows.push({ dash: true }); rows.push({ t: 'TOTAL' + ' '.repeat(Math.max(1, cols - 5 - money(st.amt).length)) + money(st.amt), bold: true });
    var bt = $('#tr-borrow').textContent; if (bt) { rows.push({ gap: 8 }); var words = bt.split(' '), cur = ''; words.forEach(function (w) { if ((cur + ' ' + w).length > cols + 6) { rows.push({ t: cur, size: 18 }); cur = w; } else cur = cur ? cur + ' ' + w : w; }); if (cur) rows.push({ t: cur, size: 18 }); }
    rows.push({ dash: true }); center('THANK YOU, TAXPAYER', { bold: true }); center('teddyrookbook.com/business/tax-receipt', { size: 16 });
    var H = pad * 2 + rows.reduce(function (s, r) { return s + (r.dash ? 30 : r.gap || (r.size || 22) * 1.45); }, 0);
    cv.width = Wd * S; cv.height = Math.ceil(H) * S; g.scale(S, S);
    g.fillStyle = '#fffdf6'; g.fillRect(0, 0, Wd, H); g.fillStyle = '#1d1d1d'; g.textBaseline = 'top';
    var y = pad;
    rows.forEach(function (r) {
      if (r.dash) { g.font = '400 22px ' + mono; g.fillText('-'.repeat(cols), pad, y + 4); y += 30; return; }
      if (r.gap) { y += r.gap; return; }
      var sz = r.size || 22; g.font = (r.bold ? '700 ' : '400 ') + sz + 'px ' + mono;
      if (r.center) { g.textAlign = 'center'; g.fillText(r.t, Wd / 2, y); g.textAlign = 'left'; } else g.fillText(r.t, pad, y);
      y += sz * 1.45;
    });
    return cv;
  }
  var pv = null, pvFile = null;
  function canShare() { try { return matchMedia('(pointer: coarse)').matches && navigator.canShare && navigator.canShare({ files: [new File([new Blob(['x'])], 'x.png', { type: 'image/png' })] }); } catch (e) { return false; } }
  function dl(f) { var a = D.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
  $('#tr-pic').addEventListener('click', function () {
    if (!root || !root.children) return;
    if (!pv) {
      pv = D.createElement('div'); pv.className = 'tr-pv'; pv.hidden = true;
      pv.innerHTML = '<div class="tr-pv-in" role="dialog" aria-label="Save the receipt as a picture"><div class="tr-pv-img"><img alt="Preview of the receipt picture"></div><p class="bz-small tr-pv-note"></p><div class="tr-pv-btns"><button type="button" class="bz-btn" id="tr-pv-share" hidden>📲 Save to Photos / Share</button><button type="button" class="bz-btn" id="tr-pv-dl">⬇ Download picture</button><button type="button" class="bz-btn ghost" id="tr-pv-x">Close</button></div></div>';
      $('.tr').appendChild(pv);
      pv.addEventListener('click', function (e) { if (e.target === pv || e.target.id === 'tr-pv-x') pv.hidden = true; });
      $('#tr-pv-share').addEventListener('click', function () { if (pvFile) navigator.share({ files: [pvFile], title: 'My tax receipt' }).catch(function (e) { if (e && e.name !== 'AbortError') dl(pvFile); }); });
      $('#tr-pv-dl').addEventListener('click', function () { if (pvFile) dl(pvFile); });
      if (canShare()) { $('#tr-pv-share').hidden = false; $('#tr-pv-dl').className = 'bz-btn ghost'; $('#tr-pv-dl').textContent = '⬇ Download file'; }
      D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pv) pv.hidden = true; });
    }
    var cv = picture(); pv.querySelector('img').src = cv.toDataURL('image/png'); pvFile = null;
    cv.toBlob(function (b) { pvFile = new File([b], 'tax-receipt-' + st.fy + '.png', { type: 'image/png' }); }, 'image/png');
    pv.querySelector('.tr-pv-note').textContent = canShare() ? 'Tap “Save to Photos / Share”, then “Save Image”. Open any lines first to include their detail.' : 'The picture shows the lines that are open on the receipt. Open any you want included first.';
    pv.hidden = false;
  });
  start();
})(window, document);

/* The Harvard Classics, fifteen minutes a day: the export core. One file shared by the export page (export.js), its
   print layout (print.js); it also runs in node for tests.
   Plain JavaScript, no libraries. In the browser it is window.HCBook; in Node, require() it.

   text()    a reading's blocks (data/harvard/days/MM-DD.json, schema v2) as HTML, by the same rules as
             layouts/partials/harvard-classics/text.html and inline.html. Mode "web" reproduces the day page markup
             exactly (the tests compare it with the built pages); mode "book" is well-formed XHTML for the EPUB and the
             print layout, with the footnotes and page numbers as options.
   plain()   the same reading as plain text.
   dayBook() one day (date, title, introduction, the guide's notes, readings) as book XHTML.
   epub()    a whole EPUB 3 book with an EPUB 2 NCX, as a list of files; zip() packs them (CRC-32; deflated when a
             deflate function is given, else stored; the mimetype always comes first, stored).
   cover()   draws the cover on a canvas 2D context.
   A day record is the day page's data: {id, month, day, slug, title, intro[], notes[], status, words, minutes,
   readings: [{volume, start, end, author, work, title, boundary {start, end}, words, scan, text[]}]}; record() makes
   one from guide.json and a day file, and Hugo writes the same shape to /harvard-classics/text/MM.json. */
(function (root, make) {
  if (typeof module === 'object' && module.exports) module.exports = make(); else root.HCBook = make();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MLEN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var ALL = [], POS = {};
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  for (var mm = 1; mm <= 12; mm++) for (var dd = 1; dd <= MLEN[mm - 1]; dd++) { POS[pad(mm) + '-' + pad(dd)] = ALL.length; ALL.push(pad(mm) + '-' + pad(dd)); }
  function monthOf(id) { return +id.slice(0, 2); }
  function dateName(id) { return MONTHS[monthOf(id) - 1] + ' ' + (+id.slice(3)); }
  function fileId(id) { return id.replace('-', ''); }

  /* ── selections ───────────────────────────────────────────────────────────────────────────────────────────────
     A selection is a list of day ids. In URLs it travels as a 366-bit set in base64url (62 characters). */
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function encodeSel(ids) {
    var b = [], i, s = '';
    for (i = 0; i < 46; i++) b.push(0);
    ids.forEach(function (id) { var p = POS[id]; if (p != null) b[p >> 3] |= 1 << (p & 7); });
    for (i = 0; i < 46; i += 3) {
      var n = (b[i] << 16) | ((b[i + 1] || 0) << 8) | (b[i + 2] || 0);
      s += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (i + 1 < 46 ? B64[(n >> 6) & 63] : '') + (i + 2 < 46 ? B64[n & 63] : '');
    }
    return s;
  }
  function decodeSel(s) {
    var bits = [], out = [], i, j;
    s = String(s || '').replace(/[^A-Za-z0-9_-]/g, '');
    for (i = 0; i < s.length; i++) { var v = B64.indexOf(s[i]); for (j = 5; j >= 0; j--) bits.push((v >> j) & 1); }
    var bytes = [];
    for (i = 0; i + 8 <= bits.length; i += 8) { var x = 0; for (j = 0; j < 8; j++) x = (x << 1) | bits[i + j]; bytes.push(x); }
    ALL.forEach(function (id, p) { if ((bytes[p >> 3] || 0) & (1 << (p & 7))) out.push(id); });
    return out;
  }
  // calendar order, starting at `start` when given (a range or "the next 30 days" that runs past December 31)
  function order(ids, start) {
    var s = start != null && POS[start] != null ? POS[start] : 0, seen = {};
    return ids.filter(function (id) { if (POS[id] == null || seen[id]) return false; seen[id] = 1; return true; })
      .sort(function (a, b) { return ((POS[a] - s + 366) % 366) - ((POS[b] - s + 366) % 366); });
  }
  // a short name for a selection: "March", "January–March", "March 3", "March 3–9", "March 28 – April 3", or null
  function rangeName(ids) {
    if (!ids.length) return null;
    if (ids.length === 366) return 'The Whole Year';
    if (ids.length === 1) return dateName(ids[0]);
    var byM = {}, months = [];
    ids.forEach(function (id) { var m = monthOf(id); if (!byM[m]) { byM[m] = 0; months.push(m); } byM[m]++; });
    var full = months.every(function (m) { return byM[m] === MLEN[m - 1]; });
    var run = true;
    for (var i = 1; i < ids.length; i++) if ((POS[ids[i]] - POS[ids[i - 1]] + 366) % 366 !== 1) run = false;
    if (full) {
      var consec = true;
      for (i = 1; i < months.length; i++) if ((months[i] - months[i - 1] + 12) % 12 !== 1) consec = false;
      if (months.length === 1) return MONTHS[months[0] - 1];
      if (consec) return MONTHS[months[0] - 1] + '–' + MONTHS[months[months.length - 1] - 1];
      if (months.length <= 3) return months.slice(0, -1).map(function (m) { return MONTHS[m - 1]; }).join(', ') + ' and ' + MONTHS[months[months.length - 1] - 1];
      return null;
    }
    if (run) {
      var a = ids[0], b = ids[ids.length - 1];
      return monthOf(a) === monthOf(b) && POS[b] > POS[a] ? dateName(a) + '–' + (+b.slice(3)) : dateName(a) + ' – ' + dateName(b);
    }
    return null;
  }
  /* the line under a title: the dates when the subtitle doesn't already say them, and the count:
     "March 1 – March 31 · 31 readings", "1 reading", "William Shakespeare · March 1 – … · 9 readings" (with range set) */
  function rangeLine(title, range, ids) {
    var sub = titleParts(title).sub, span = spanName(ids), count = plural(ids.length, 'reading');
    var parts = [];
    if (range && range !== sub && !/^\d+ Readings?$/.test(range)) parts.push(range);
    if (span && span !== sub && span !== range && !(/\d/.test(sub) && rangeName(ids) === sub)) parts.push(span);
    parts.push(count);
    return parts.join(' · ');
  }
  function spanName(ids) { return ids.length > 1 ? dateName(ids[0]) + ' – ' + dateName(ids[ids.length - 1]) : ids.length ? dateName(ids[0]) : ''; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  // reading time from minutes: "25 minutes", "about 3 hours", "about 111 hours"
  function timeName(min) {
    if (min < 60) return plural(min, 'minute');
    var h = Math.floor(min / 60), m = Math.round((min - h * 60) / 5) * 5;
    if (m === 60) { h++; m = 0; }
    if (h >= 10 || !m) return 'about ' + plural(h, 'hour');
    return 'about ' + plural(h, 'hour') + ' ' + m + ' minutes';
  }

  /* ── text ─────────────────────────────────────────────────────────────────────────────────────────────────── */
  var ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&#34;' };
  // Hugo's htmlEscape (Go's html.EscapeString), so "web" output matches the day pages byte for byte
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>'"]/g, function (c) { return ENT[c]; }); }
  // characters XML 1.0 does not allow (none in the data today; raw OCR could bring one in)
  var BADXML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
  function xml(s) { return esc(String(s == null ? '' : s).replace(BADXML, '$1')); }
  // <i> tags that a proofreader left unclosed (or closed twice) would break the XHTML: drop stray closes, close the rest
  function balance(h) {
    var depth = 0;
    h = h.replace(/<\/?i>/g, function (t) { if (t === '<i>') { depth++; return t; } if (depth) { depth--; return t; } return ''; });
    while (depth-- > 0) h += '</i>';
    return h;
  }
  var FNRE = /\[\^[^\]\t\n\f\r ]{1,6}\]/g;
  /* One string of text (inline.html): escape it, keep <i>…</i>, and turn [^N] into a link to footnote N of the
     reading. Marks like "*" start over on every printed page, so the k-th [^*] goes to the k-th "*" note.
     st: the reading's footnote state (null inside the notes themselves); o: the options of text(). */
  function inline(s, st, o) {
    var web = o.mode === 'web';
    var h = (web ? esc(s || '') : xml(s || '')).split('&lt;i&gt;').join('<i>').split('&lt;/i&gt;').join('</i>');
    if (!web) h = balance(h);
    if (!st) return h;
    return h.replace(FNRE, function (mk) {
      var m = mk.slice(2, -1), list = st.q[m] || [], c = st.c[m] || 0, k = 0;
      if (c < list.length) k = list[c]; else if (list.length) k = list[list.length - 1];
      st.c[m] = c + 1;
      if (!web && !o.notes) return '';
      var cls = web ? 'hc-fr' : 'fr';
      if (!k) return '<sup class="' + cls + '">' + m + '</sup>';
      var ref = '';
      if (!st.r[k]) { ref = ' id="fnr-' + o.pre + '-' + k + '"'; st.r[k] = true; }
      if (web) return '<sup class="hc-fr"><a href="#fn-' + o.pre + '-' + k + '"' + ref + ' aria-label="Note ' + m + '">' + m + '</a></sup>';
      return '<sup class="fr"><a href="#fn-' + o.pre + '-' + k + '"' + ref + (o.epub ? ' epub:type="noteref" role="doc-noteref"' : '') + '>' + m + '</a></sup>';
    });
  }
  function untag(s) { return String(s || '').replace(/<\/?i>/g, ''); }
  function noteState(blocks) {
    var st = { q: {}, c: {}, r: {} }, k = 0;
    (blocks || []).forEach(function (b) {
      if (b.t === 'footnotes') (b.items || []).forEach(function (it) { k++; var m = String(it.n); (st.q[m] = st.q[m] || []).push(k); });
    });
    return st;
  }
  function vIndent(i) { var n = Math.round(+i || 0); return n > 0 ? Math.min(n, 26) : 0; }

  /* A reading's text as HTML. o: {pre: "01-03-1", endnote: the reading's boundary.end sentence, mode: "web"|"book",
     and for "book": notes (footnotes at the end of the reading), pages (the volume's page numbers and the page notes),
     epub (EPUB semantics), htag: "h" for real headings (EPUB) or "p" (print, so the PDF outline lists only the days)}. */
  function text(blocks, o) {
    var web = o.mode === 'web', st = noteState(blocks), out = '', fk = 0, last = '', endnote = '';
    var I = function (s) { return inline(s, st, o); };
    if (o.endnote) endnote = web ? '<p class="hc-bound">' + esc(o.endnote) + '</p>\n' : o.pages ? '<p class="bound">' + xml(o.endnote) + '</p>\n' : '';
    (blocks || []).forEach(function (b) {
      var t = b.t, pm = '';
      if (b.pg) {
        var pg = String(b.pg);
        if (pg !== last) {
          last = pg;
          if (web) pm = '<span class="hc-pg" aria-hidden="true" title="Page ' + esc(pg) + ' of the volume">' + esc(pg) + '</span>';
          else if (o.pages) pm = o.epub ? '<span class="pg" title="Page ' + xml(pg) + ' of the volume">[p.\u00a0' + xml(pg) + ']</span>' : '<span class="pg" aria-hidden="true" title="Page ' + xml(pg) + ' of the volume">' + xml(pg) + '</span>';
        }
      }
      if (t === 'p') out += '<p>' + pm + I(b.s) + '</p>\n';
      else if (t === 'heading') {
        var lv = Math.floor(+b.level || 2) + 1;
        if (lv < 3) lv = 3;
        if (lv > 5) lv = 5;
        if (web) out += '<h' + lv + ' class="hc-h">' + pm + I(b.s) + '</h' + lv + '>\n';
        else if (o.htag === 'p') out += '<p class="h h' + lv + '">' + pm + I(b.s) + '</p>\n';
        else out += '<h' + lv + ' class="h">' + pm + I(b.s) + '</h' + lv + '>\n';
      } else if (t === 'quote') out += web ? '<blockquote class="hc-q"><p>' + pm + I(b.s) + '</p></blockquote>\n' : '<blockquote class="q"><p>' + pm + I(b.s) + '</p></blockquote>\n';
      else if (t === 'verse') {
        var lines = b.lines || [];
        if (web) {
          out += '<div class="hc-verse">' + pm + lines.map(function (l) {
            var i = +(l.i || 0);
            return '<span class="hc-vl"' + (i > 0 ? ' style="--i:' + i + '"' : '') + '>' + I(l.s) + '</span>';
          }).join('') + '</div>\n';
        } else {
          out += '<p class="verse' + (lines.length <= 6 ? ' short' : '') + '">' + lines.map(function (l, j) {
            var n = vIndent(l.i);
            return '<span class="l' + (n ? ' i' + n : '') + '">' + (j ? '' : pm) + I(l.s) + '</span>';
          }).join('<br/>') + '</p>\n';
        }
      } else if (t === 'speaker') out += '<p class="' + (web ? 'hc-sp' : 'sp') + '">' + pm + I(b.s) + '</p>\n';
      else if (t === 'stage') out += '<p class="' + (web ? 'hc-st' : 'st') + '">' + pm + I(b.s) + '</p>\n';
      else if (t === 'break') out += web ? '<hr class="hc-br">\n' : '<hr class="br"/>\n';
      else if (t === 'footnotes') {
        out += endnote; endnote = '';
        var li = '';
        (b.items || []).forEach(function (it) {
          fk++;
          var n = String(it.n), body = inline(it.s, null, o);
          if (web) {
            var back = st.r[fk] ? ' <a class="hc-fb" href="#fnr-' + o.pre + '-' + fk + '" aria-label="Back to the text">↩</a>' : '';
            var fp = it.page ? ' <span class="hc-fpg">(page ' + esc(String(it.page)) + ')</span>' : '';
            li += '<li id="fn-' + o.pre + '-' + fk + '"><span class="hc-fm">' + esc(n) + '</span> ' + body + fp + back + '</li>';
          } else {
            var mark = st.r[fk] ? '<a href="#fnr-' + o.pre + '-' + fk + '"' + (o.epub ? ' role="doc-backlink"' : '') + '>' + xml(n) + '</a>' : xml(n);
            var fpb = o.pages && it.page ? ' <span class="fpg">(page ' + xml(String(it.page)) + ')</span>' : '';
            li += '<li id="fn-' + o.pre + '-' + fk + '"' + (o.epub ? ' epub:type="endnote" role="doc-endnote"' : '') + '><p><span class="fm">' + mark + '</span> ' + body + fpb + '</p></li>';
          }
        });
        if (web) out += '<aside class="hc-fns" aria-label="Notes"><p class="hc-fnh">Notes</p><ol>' + li + '</ol></aside>\n';
        else if (o.notes && li) out += '<section class="notes"' + (o.epub ? ' epub:type="endnotes" role="doc-endnotes" aria-label="Notes"' : '') + '><p class="notes-h">Notes</p><ol>' + li + '</ol></section>\n';
      } else if (b.s) out += '<p>' + pm + I(b.s) + '</p>\n';
    });
    return out + endnote;
  }

  /* The same reading as plain text: paragraphs separated by blank lines, verse line by line (two spaces per em of
     indent), notes as [N] with the list at the end. o: {notes, pages, endnote}. Returns a string without a final
     newline. */
  function plain(blocks, o) {
    var st = noteState(blocks), out = [], last = '', endnote = o.pages ? o.endnote || '' : '';
    var P = function (s) {
      return untag(String(s || '').replace(FNRE, function (mk) {
        var m = mk.slice(2, -1), list = st.q[m] || [], c = st.c[m] || 0;
        st.c[m] = c + 1;
        return o.notes ? '[' + m + ']' : '';
      }));
    };
    (blocks || []).forEach(function (b) {
      var pm = '';
      if (b.pg && String(b.pg) !== last) { last = String(b.pg); if (o.pages) pm = '[p. ' + last + '] '; }
      var t = b.t;
      if (t === 'p') out.push(pm + P(b.s));
      else if (t === 'heading') out.push(pm + P(b.s));
      else if (t === 'quote') out.push('    ' + pm + P(b.s));
      else if (t === 'verse') out.push((b.lines || []).map(function (l, j) { return '    ' + new Array(vIndent(l.i) * 2 + 1).join(' ') + (j ? '' : pm) + P(l.s); }).join('\n'));
      else if (t === 'speaker') out.push(pm + P(b.s));
      else if (t === 'stage') out.push('    ' + pm + P(b.s));
      else if (t === 'break') out.push('*       *       *');
      else if (t === 'footnotes') {
        if (endnote) { out.push('(' + endnote + ')'); endnote = ''; }
        if (o.notes) {
          var ls = (b.items || []).map(function (it) { return '[' + it.n + '] ' + untag(it.s) + (o.pages && it.page ? ' (page ' + it.page + ')' : ''); });
          if (ls.length) out.push('Notes\n\n' + ls.join('\n'));
        }
      } else if (b.s) out.push(pm + P(b.s));
    });
    if (endnote) out.push('(' + endnote + ')');
    return out.join('\n\n');
  }

  /* ── a day as a book page ─────────────────────────────────────────────────────────────────────────────────── */
  function pagesName(r) { return String(r.start) === String(r.end) ? 'page ' + r.start : 'pages ' + r.start + '–' + r.end; }
  function readingTitle(r) { return r.title || r.work || ''; }
  /* o: {intro, gnotes (the guide's notes), notes (footnotes), pages, epub, print}. Print: the date and title are an h2
     (the month is the h1), the work's title a paragraph; EPUB: h1, h2 and the reading's own headings h3–h5. */
  function dayBook(day, o) {
    var date = dateName(day.id), ep = !!o.epub, h = '';
    var dh = ep ? 'h1' : 'h2';
    h += '<header class="dh"><' + dh + ' class="dt"><span class="dd">' + xml(date) + '</span><span class="sep">: </span><span class="dn">' + xml(day.title) + '</span></' + dh + '></header>\n';
    var intro = o.intro ? (day.intro || []) : [], gn = o.gnotes ? (day.notes || []) : [];
    if (intro.length || gn.length) {
      h += '<div class="intro"' + (ep ? ' epub:type="preamble"' : '') + '>';
      intro.forEach(function (p) { h += '<p>' + inline(p, null, { mode: 'book' }) + '</p>'; });
      gn.forEach(function (n) { h += '<p class="gn">(' + inline(n, null, { mode: 'book' }) + ')</p>'; });
      h += '</div>\n';
    }
    if (day.status && day.status !== 'proofread') h += '<p class="raw">This text was read by machine from the scans and hasn’t been proofread yet, so a word here and there may be wrong.</p>\n';
    (day.readings || []).forEach(function (r, ri) {
      var pre = day.id + '-' + (ri + 1), b = r.boundary || {};
      h += '<section class="reading">\n<header class="rh">' + (ep ? '<h2 class="rt">' : '<p class="rt">') + xml(readingTitle(r)) + (ep ? '</h2>' : '</p>') + (r.author ? '<p class="by">' + xml(r.author) + '</p>' : '') + '</header>\n';
      if (o.pages && b.start) h += '<p class="bound">' + xml(b.start) + '</p>\n';
      h += '<div class="text">\n' + text(r.text, { pre: pre, endnote: b.end || '', mode: 'book', notes: o.notes, pages: o.pages, epub: ep, htag: ep ? 'h' : 'p' }) + '</div>\n';
      h += '<p class="src">From Volume ' + xml(r.volume) + ', ' + pagesName(r) + (o.pages && r.scan ? ' · <a href="' + xml(r.scan) + '">the scanned page</a>' : '') + '</p>\n</section>\n';
    });
    return h;
  }
  function dayPlain(day, o) {
    var out = [dateName(day.id).toUpperCase(), day.title].join('\n');
    var intro = o.intro ? (day.intro || []) : [], gn = o.gnotes ? (day.notes || []) : [];
    if (intro.length) out += '\n\n' + intro.map(untag).join('\n\n');
    if (gn.length) out += '\n\n' + gn.map(function (n) { return '(' + untag(n) + ')'; }).join('\n');
    (day.readings || []).forEach(function (r) {
      var b = r.boundary || {};
      out += '\n\n\n' + readingTitle(r).toUpperCase() + (r.author ? '\n' + r.author : '');
      if (o.pages && b.start) out += '\n\n(' + b.start + ')';
      out += '\n\n' + plain(r.text, { notes: o.notes, pages: o.pages, endnote: b.end || '' });
      out += '\n\n(From Volume ' + r.volume + ', ' + pagesName(r) + (o.pages && r.scan ? ': ' + r.scan : '') + ')';
    });
    return out;
  }

  // a day record from guide.json's day and the day file (the same fields Hugo writes to text/MM.json)
  function record(g, t) {
    t = t || {};
    return {
      id: g.id, month: g.month, day: g.day, slug: g.slug, title: g.title, intro: g.intro || [], notes: g.notes || [],
      status: t.status || '', words: t.words || 0, minutes: t.minutes || 0,
      readings: (t.readings || []).map(function (r) {
        return { volume: r.volume, start: r.start, end: r.end, author: r.author || '', work: r.work || '', title: r.title || '',
          boundary: { start: (r.boundary || {}).start || '', end: (r.boundary || {}).end || '' }, words: r.words || 0,
          scan: (r.scan || {}).url || '', text: r.text || [] };
      })
    };
  }

  /* ── EPUB ─────────────────────────────────────────────────────────────────────────────────────────────────── */
  var CSS = [
    '/* Fifteen Minutes a Day: a light stylesheet that leaves the font, size and colors to the reader. */',
    'body{margin:0 4%;}',
    'p{margin:0;text-indent:1.4em;}',
    'h1,h2,h3,h4,h5{font-weight:normal;text-align:center;line-height:1.3;page-break-after:avoid;break-after:avoid;}',
    'a{text-decoration:none;}',
    '.dh{margin:2em 0 1.6em;text-align:center;}',
    '.dt{font-size:1.45em;margin:0;}',
    '.dd{display:block;font-size:.62em;letter-spacing:.14em;text-transform:uppercase;margin-bottom:.5em;}',
    '.dn{display:block;}',
    '.sep{display:none;}',
    '.intro{margin:0 1.2em 1.8em;font-style:italic;}',
    '.intro p{text-indent:0;margin:0 0 .6em;}',
    '.intro i{font-style:normal;}',
    '.intro p.gn{font-size:.92em;text-align:center;}',
    '.raw{font-size:.85em;text-indent:0;margin:0 0 1.2em;text-align:center;}',
    '.reading{margin:0 0 2em;}',
    '.rh{text-align:center;margin:0 0 1.4em;}',
    '.rt{font-size:1.05em;font-variant:small-caps;letter-spacing:.06em;margin:0;}',
    '.by{text-indent:0;font-style:italic;margin:.2em 0 0;}',
    '.text h3,.text h4,.text h5{margin:1.4em 0 .8em;}',
    '.text h3{font-size:1.05em;letter-spacing:.06em;}',
    '.text h4{font-size:1em;letter-spacing:.04em;}',
    '.text h5{font-size:.95em;font-style:italic;}',
    '.text>p:first-child,.text h3+p,.text h4+p,.text h5+p,.text hr+p,.text blockquote+p,.text p.verse+p,.text p.sp+p,.text p.st+p,.text p.bound+p{text-indent:0;}',
    'blockquote.q{margin:.8em 1.5em;font-size:.94em;}',
    'blockquote.q p{text-indent:0;}',
    'p.verse{text-indent:0;margin:.8em 0 .8em 1em;text-align:left;}',
    'p.verse br{display:none;}',
    'span.l{display:block;padding-left:1.6em;text-indent:-1.6em;}',
    (function () { var s = ''; for (var n = 1; n <= 26; n++) s += 'span.i' + n + '{padding-left:' + (1.6 + Math.min(n, 10)) + 'em;}'; return s; })(),
    'p.sp+p.verse{margin-top:.15em;}',
    'p.sp{text-indent:0;margin:.9em 0 .1em;font-variant:small-caps;letter-spacing:.06em;text-align:left;}',
    'p.st{text-indent:0;margin:.5em 0 .5em 2em;font-style:italic;text-align:left;}',
    'hr.br{border:0;border-top:1px solid;width:20%;margin:1.4em auto;}',
    'sup.fr{font-size:.7em;line-height:0;vertical-align:super;}',
    '.notes{margin:2em 0 0;font-size:.88em;border-top:1px solid;padding-top:.6em;}',
    '.notes-h{text-indent:0;font-variant:small-caps;letter-spacing:.08em;margin:0 0 .4em;}',
    '.notes ol{list-style:none;margin:0;padding:0;}',
    '.notes li{margin:0 0 .4em;}',
    '.notes li p{text-indent:0;}',
    '.fm{font-weight:bold;margin-right:.3em;}',
    '.bound{text-indent:0;font-style:italic;font-size:.88em;text-align:center;margin:.8em 0;}',
    '.src{text-indent:0;font-size:.85em;font-style:italic;text-align:right;margin:1.2em 0 0;}',
    '.pg{font-size:.7em;font-style:normal;vertical-align:super;line-height:0;margin:0 .2em;}',
    '.fpg{font-size:.9em;}',
    '.month{text-align:center;margin-top:20%;}',
    '.month h1{font-size:2em;letter-spacing:.06em;margin:0 0 1.4em;}',
    '.epigraph{display:inline-block;text-align:left;font-style:italic;margin:0 auto;}',
    '.epigraph p{text-indent:0;}',
    '.epigraph p.by{text-align:right;font-style:normal;font-size:.85em;margin-top:.8em;}',
    '.tp{text-align:center;margin-top:12%;}',
    '.tp p{text-indent:0;}',
    '.tp-eye{letter-spacing:.18em;text-transform:uppercase;font-size:.8em;margin:0 0 1.2em;}',
    '.tp h1{font-size:2.2em;margin:0 0 .3em;}',
    '.tp-sub{font-size:1.3em;font-style:italic;margin:0 0 2.4em;}',
    '.tp-range{margin:0 0 .3em;}',
    '.tp-by{margin:2.4em 0 .3em;}',
    '.tp-pub{margin-top:3em;letter-spacing:.14em;text-transform:uppercase;font-size:.8em;}',
    'nav ol{list-style:none;margin:0;padding:0;}',
    'nav ol ol{margin:0 0 .8em 1.2em;}',
    'nav li{margin:.2em 0;}',
    'nav h1{font-size:1.5em;margin:1em 0;}',
    '.about p{text-indent:0;margin:0 0 .8em;}',
    '.about h1{font-size:1.4em;margin:1em 0;}'
  ].join('\n') + '\n';

  function xhtml(title, body, bodyType) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">\n' +
      '<head>\n<meta charset="utf-8"/>\n<title>' + xml(title) + '</title>\n<link rel="stylesheet" type="text/css" href="style.css"/>\n</head>\n' +
      '<body' + (bodyType ? ' epub:type="' + bodyType + '"' : '') + '>\n' + body + '</body>\n</html>\n';
  }
  // split a title "Fifteen Minutes a Day: March" into {main, sub}
  function titleParts(title) {
    var t = String(title || '').trim() || 'Fifteen Minutes a Day', m = /^(Fifteen Minutes a Day)\s*[:—–-]\s*(.+)$/i.exec(t);
    return m ? { main: m[1], sub: m[2] } : { main: t, sub: '' };
  }
  function editionNote(o) {
    var y = o.guideYear || 1930;
    return 'The readings follow <i>Fifteen Minutes a Day: The Reading Guide</i> (P. F. Collier &amp; Son, ' + y + ' edition)' +
      (o.intro ? ', with its introductions' : '') + '. The texts are from <i>The Harvard Classics</i>, edited by Charles W. Eliot (P. F. Collier &amp; Son, 1909–1910), as printed in the volumes scanned at the Internet Archive and proofread against the page images. Both are in the public domain in the United States.';
  }

  /* days: day records in reading order. o: {title, id ("urn:uuid:…"), date ("2026-10-25"), modified (ISO, seconds,
     "Z"), cover (Uint8Array, JPEG) or null, intro, gnotes, notes, pages, front (title page and contents), openers (a
     page for each month with the guide's verses), months (guide.json months), guideYear, site ("teddyrookbook.com"),
     range (the selection's dates in words), url (the export page)}. Returns [{name, data}] in zip order. */
  function epub(days, o) {
    var tp = titleParts(o.title), bookTitle = String(o.title || '').trim() || 'Fifteen Minutes a Day';
    var docs = [], man = [], spine = [];
    var add = function (name, data, id, type, props, linear) {
      docs.push({ name: 'OEBPS/' + name, data: data });
      man.push('<item id="' + id + '" href="' + name + '" media-type="' + type + '"' + (props ? ' properties="' + props + '"' : '') + '/>');
      if (linear) spine.push('<itemref idref="' + id + '"/>');
    };
    var dopt = { intro: o.intro, gnotes: o.gnotes, notes: o.notes, pages: o.pages, epub: true };
    var nWords = 0, nMin = 0; days.forEach(function (d) { nWords += d.words || 0; nMin += d.minutes || 0; });
    var dayIds = days.map(function (d) { return d.id; }), span = spanName(dayIds), count = plural(days.length, 'reading');
    var rline = rangeLine(o.title, o.range, dayIds);
    var groups = [], gi = {};
    days.forEach(function (d) { var m = monthOf(d.id); if (!(m in gi)) { gi[m] = groups.length; groups.push({ m: m, days: [] }); } groups[gi[m]].days.push(d); });
    var firstText = o.openers ? 'm' + pad(groups[0].m) + '.xhtml' : 'd' + fileId(days[0].id) + '.xhtml';

    add('style.css', CSS, 'css', 'text/css');
    if (o.cover) add('cover.jpg', o.cover, 'cover-image', 'image/jpeg', 'cover-image');
    if (o.front) {
      add('title.xhtml', xhtml(bookTitle, '<section class="tp" epub:type="titlepage">\n<p class="tp-eye">The Harvard Classics</p>\n<h1>' + xml(tp.main) + '</h1>\n' +
        '<p class="tp-sub">' + xml(tp.sub || 'A reading for every day') + '</p>\n' +
        '<p class="tp-range">' + xml(rline) + '</p>\n<p class="tp-range">' + xml(commas(nWords)) + ' words, ' + xml(timeName(nMin)) + ' of reading</p>\n' +
        '<p class="tp-by">Chosen by Charles W. Eliot</p>\n<p>' + (o.intro ? 'with the introductions from' : 'from') + ' <i>Fifteen Minutes a Day: The Reading Guide</i></p>\n<p class="tp-pub">Teddy Rook Book</p>\n</section>\n', 'frontmatter'),
        'title', 'application/xhtml+xml', '', true);
    }
    // the contents (nav) and the NCX, by month, then day; the nav is in the reading order only with the title page
    var navOl = '', ncx = '', po = 0;
    man.push('<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>');
    if (o.front) spine.push('<itemref idref="nav"/>');
    groups.forEach(function (g) {
      var mname = MONTHS[g.m - 1], mfile = 'm' + pad(g.m) + '.xhtml', first = 'd' + fileId(g.days[0].id) + '.xhtml';
      if (o.openers) {
        var mo = (o.months || [])[g.m - 1] || {}, ep = mo.epigraph || [];
        add(mfile, xhtml(mname, '<section class="month" epub:type="part">\n<h1>' + xml(mname) + '</h1>\n' + (ep.length ? '<div class="epigraph" epub:type="epigraph"><p class="verse">' +
          ep.map(function (l) { return '<span class="l">' + xml(l) + '</span>'; }).join('<br/>') + '</p>' + (mo.by ? '<p class="by">' + xml(mo.by) + '</p>' : '') + '</div>\n' : '') + '</section>\n', 'bodymatter'),
          'm' + pad(g.m), 'application/xhtml+xml', '', true);
      }
      var mhref = o.openers ? mfile : first + '#top';
      navOl += '<li><a href="' + mhref + '">' + xml(mname) + '</a>\n<ol>\n';
      ncx += '<navPoint id="np-m' + pad(g.m) + '" playOrder="' + (++po) + '"><navLabel><text>' + xml(mname) + '</text></navLabel><content src="' + mhref + '"/>\n';
      g.days.forEach(function (d) {
        var f = 'd' + fileId(d.id) + '.xhtml', label = dateName(d.id) + ': ' + d.title;
        add(f, xhtml(label, '<section class="day" epub:type="chapter" id="top">\n' + dayBook(d, dopt) + '</section>\n', 'bodymatter'), 'd' + fileId(d.id), 'application/xhtml+xml', '', true);
        navOl += '<li><a href="' + f + '">' + xml(label) + '</a></li>\n';
        ncx += '<navPoint id="np-d' + fileId(d.id) + '" playOrder="' + (++po) + '"><navLabel><text>' + xml(label) + '</text></navLabel><content src="' + f + '"/></navPoint>\n';
      });
      navOl += '</ol>\n</li>\n';
      ncx += '</navPoint>\n';
    });
    var about = '<section class="about" epub:type="colophon">\n<h1>About this book</h1>\n<p>' + editionNote(o) + '</p>\n' +
      '<p>This book holds ' + xml(count) + (days.length > 1 ? ', ' + xml(span.replace(' – ', ' to ')) : ', ' + xml(span)) + '. ' + (o.notes ? 'The footnotes of the volumes come at the end of each reading.' : 'The footnotes of the volumes are left out.') +
      (o.pages ? ' The small bracketed numbers are the page numbers of the volumes, so you can follow along in your own set.' : '') + '</p>\n' +
      '<p>Prepared by Teddy Rook Book' + (o.url ? ', where every day’s reading is also on the web: <a href="' + xml(o.url) + '">' + xml(o.url.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a>' : '') + '. Made ' + xml(longDate(o.date)) + '.</p>\n</section>\n';
    add('about.xhtml', xhtml('About this book', about, 'backmatter'), 'about', 'application/xhtml+xml', '', true);
    navOl += '<li><a href="about.xhtml">About this book</a></li>\n';
    ncx += '<navPoint id="np-about" playOrder="' + (++po) + '"><navLabel><text>About this book</text></navLabel><content src="about.xhtml"/></navPoint>\n';

    var nav = xhtml('Contents', '<nav epub:type="toc" id="toc" role="doc-toc">\n<h1>Contents</h1>\n<ol>\n' + navOl + '</ol>\n</nav>\n' +
      '<nav epub:type="landmarks" id="landmarks" hidden="hidden">\n<h2>Landmarks</h2>\n<ol>\n' + (o.front ? '<li><a epub:type="titlepage" href="title.xhtml">Title page</a></li>\n' : '') +
      '<li><a epub:type="toc" href="nav.xhtml#toc">Contents</a></li>\n<li><a epub:type="bodymatter" href="' + firstText + '">The readings</a></li>\n</ol>\n</nav>\n', 'frontmatter');
    var ncxDoc = '<?xml version="1.0" encoding="UTF-8"?>\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en">\n<head>\n<meta name="dtb:uid" content="' + xml(o.id) + '"/>\n<meta name="dtb:depth" content="2"/>\n<meta name="dtb:totalPageCount" content="0"/>\n<meta name="dtb:maxPageNumber" content="0"/>\n</head>\n' +
      '<docTitle><text>' + xml(bookTitle) + '</text></docTitle>\n<docAuthor><text>Charles W. Eliot, editor</text></docAuthor>\n<navMap>\n' + ncx + '</navMap>\n</ncx>\n';
    man.push('<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>');
    var gy = o.guideYear || 1930;
    var desc = 'Readings from the Harvard Classics, one for each day, as laid out in Fifteen Minutes a Day: The Reading Guide (' + gy + ')' + (o.intro ? ', with the guide’s introductions' : '') + '. ' + rline + '. Texts from The Harvard Classics, edited by Charles W. Eliot (P. F. Collier & Son, 1909–1910). Prepared by Teddy Rook Book.';
    var opf = '<?xml version="1.0" encoding="UTF-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="en">\n' +
      '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n<dc:identifier id="bookid">' + xml(o.id) + '</dc:identifier>\n' +
      '<dc:title id="title">' + xml(bookTitle) + '</dc:title>\n<meta refines="#title" property="title-type">main</meta>\n' +
      '<dc:creator id="editor">Charles W. Eliot, editor</dc:creator>\n<meta refines="#editor" property="role" scheme="marc:relators">edt</meta>\n<meta refines="#editor" property="file-as">Eliot, Charles W.</meta>\n' +
      '<dc:publisher>Teddy Rook Book</dc:publisher>\n<dc:date>' + xml(o.date) + '</dc:date>\n<dc:language>en</dc:language>\n<dc:subject>Classics</dc:subject>\n' +
      '<dc:description>' + xml(desc) + '</dc:description>\n<dc:rights>The texts and the Reading Guide are in the public domain in the United States.</dc:rights>\n' +
      '<dc:source>The Harvard Classics (P. F. Collier &amp; Son, 1909–1910) and Fifteen Minutes a Day: The Reading Guide (' + gy + '), scanned at the Internet Archive</dc:source>\n' +
      '<meta property="dcterms:modified">' + xml(o.modified) + '</meta>\n' + (o.cover ? '<meta name="cover" content="cover-image"/>\n' : '') + '</metadata>\n' +
      '<manifest>\n' + man.join('\n') + '\n</manifest>\n<spine toc="ncx">\n' + spine.join('\n') + '\n</spine>\n' +
      '<guide>\n' + (o.front ? '<reference type="title-page" title="Title page" href="title.xhtml"/>\n' : '') + '<reference type="toc" title="Contents" href="nav.xhtml"/>\n<reference type="text" title="The readings" href="' + firstText + '"/>\n</guide>\n</package>\n';
    return [
      { name: 'mimetype', data: 'application/epub+zip' },
      { name: 'META-INF/container.xml', data: '<?xml version="1.0" encoding="UTF-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n<rootfiles>\n<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n</rootfiles>\n</container>\n' },
      { name: 'OEBPS/content.opf', data: opf },
      { name: 'OEBPS/nav.xhtml', data: nav },
      { name: 'OEBPS/toc.ncx', data: ncxDoc }
    ].concat(docs);
  }
  function longDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? MONTHS[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1] : String(iso || ''); }

  /* ── ZIP (OCF) ────────────────────────────────────────────────────────────────────────────────────────────── */
  var CRC = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { var c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function utf8(s) { return new TextEncoder().encode(s); }
  /* files: [{name, data (string or Uint8Array)}]; deflate: optional async or sync function (Uint8Array → raw DEFLATE
     Uint8Array); date: a Date for the entries' time stamps. The first file (mimetype) is always stored. */
  async function zip(files, deflate, date) {
    date = date || new Date();
    var dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
    var dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    var parts = [], central = [], offset = 0;
    for (var i = 0; i < files.length; i++) {
      var f = files[i], name = utf8(f.name), raw = typeof f.data === 'string' ? utf8(f.data) : f.data, crc = crc32(raw), method = 0, body = raw;
      if (deflate && i > 0 && !/\.(jpe?g|png|gif)$/i.test(f.name)) {
        var c = await deflate(raw);
        if (c && c.length < raw.length) { method = 8; body = c; }
      }
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, method ? 20 : 10, true); lh.setUint16(6, 0, true); lh.setUint16(8, method, true);
      lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true); lh.setUint32(14, crc, true); lh.setUint32(18, body.length, true);
      lh.setUint32(22, raw.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, body);
      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, method ? 20 : 10, true); ch.setUint16(8, 0, true); ch.setUint16(10, method, true);
      ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true); ch.setUint32(16, crc, true); ch.setUint32(20, body.length, true); ch.setUint32(24, raw.length, true);
      ch.setUint16(28, name.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true); ch.setUint16(34, 0, true); ch.setUint16(36, 0, true);
      ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + body.length;
    }
    var csize = 0; central.forEach(function (p) { csize += p.length; });
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(4, 0, true); end.setUint16(6, 0, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, csize, true); end.setUint32(16, offset, true); end.setUint16(20, 0, true);
    var all = parts.concat(central, [new Uint8Array(end.buffer)]), len = 0, pos = 0;
    all.forEach(function (p) { len += p.length; });
    var out = new Uint8Array(len);
    all.forEach(function (p) { out.set(p, pos); pos += p.length; });
    return out;
  }
  // the browser's own raw DEFLATE (CompressionStream), or null where there is none (the EPUB is then stored)
  function browserDeflate() {
    if (typeof CompressionStream === 'undefined' || typeof Response === 'undefined') return null;
    try { new CompressionStream('deflate-raw'); } catch (e) { return null; }
    return function (u8) {
      var cs = new CompressionStream('deflate-raw'), w = cs.writable.getWriter();
      w.write(u8); w.close();
      return new Response(cs.readable).arrayBuffer().then(function (b) { return new Uint8Array(b); });
    };
  }

  /* ── plain text and the reading plan ──────────────────────────────────────────────────────────────────────── */
  function bookText(days, o) {
    var rule = '\n\n\n* * * * *\n\n\n', out = [];
    if (o.front) {
      var head = [String(o.title || 'Fifteen Minutes a Day').toUpperCase(), 'Readings from the Harvard Classics, chosen by Charles W. Eliot', rangeLine(o.title, o.range, days.map(function (d) { return d.id; })), '', editionNote(o).replace(/<\/?i>/g, '').replace(/&amp;/g, '&'), '', 'Teddy Rook Book' + (o.url ? ' · ' + o.url : '')];
      if (days.length > 1) head.push('', 'CONTENTS', '', days.map(function (d) { return dateName(d.id) + ': ' + d.title; }).join('\n'));
      out.push(head.join('\n'));
    }
    var lastM = 0;
    days.forEach(function (d) {
      var m = monthOf(d.id), s = '';
      if (o.openers && m !== lastM) {
        var mo = (o.months || [])[m - 1] || {};
        s += MONTHS[m - 1].toUpperCase() + '\n\n' + (mo.epigraph || []).map(function (l) { return '    ' + l; }).join('\n') + (mo.by ? '\n                    ' + mo.by : '') + rule;
      }
      lastM = m;
      out.push(s + dayPlain(d, o));
    });
    return '﻿' + out.join(rule) + '\n';
  }
  function planText(days, o) {
    var mins = 0; days.forEach(function (d) { mins += d.minutes || 0; });
    var out = ['READING PLAN', o.title || 'Fifteen Minutes a Day', rangeLine(o.title, o.range, days.map(function (d) { return d.id; })) + ', ' + timeName(mins) + ' of reading', 'Tick each day as you read it.'];
    var lastM = 0;
    days.forEach(function (d) {
      var m = monthOf(d.id);
      if (m !== lastM) { out.push('', MONTHS[m - 1].toUpperCase()); lastM = m; }
      var w = (d.readings || []).map(function (r) { return (r.author ? r.author + ', ' : '') + readingTitle(r); }).join('; ');
      out.push('[ ] ' + dateName(d.id) + ' — ' + d.title + ' — ' + w + (d.minutes ? ' (' + d.minutes + ' min)' : ''));
    });
    return '﻿' + out.join('\n') + '\n';
  }

  /* ── the cover ────────────────────────────────────────────────────────────────────────────────────────────── */
  /* ctx: a canvas 2D context of W × H (1600 × 2560 for e-readers); o: {title, range, count, vols (volume numbers in the
     selection), font (CSS family list)}. The look of the section's front page: Harvard green, gilt rules, and the
     fifty red volumes on two shelves, the ones the readings come from brighter. */
  function cover(ctx, W, H, o) {
    var u = W / 1600, F = o.font || '"HC Book", "TeX Gyre Pagella", "Palatino Linotype", Palatino, Georgia, serif', tp = titleParts(o.title);
    var gold = '#e2c675', goldD = '#b8973f', cream = '#f6efd9';
    var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#004225'); g.addColorStop(1, '#00562f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // a soft light on the cloth
    var rg = ctx.createRadialGradient(W * 0.45, H * 0.3, 0, W * 0.45, H * 0.3, H * 0.8);
    rg.addColorStop(0, 'rgba(255,255,255,.07)'); rg.addColorStop(1, 'rgba(0,0,0,.18)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    // gilt frame: a heavy rule and a fine one
    ctx.strokeStyle = gold; ctx.lineWidth = 10 * u; ctx.strokeRect(70 * u, 70 * u, W - 140 * u, H - 140 * u);
    ctx.lineWidth = 3 * u; ctx.strokeRect(100 * u, 100 * u, W - 200 * u, H - 200 * u);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    var spaced = function (s, x, yy, px, sp, color, style) {
      ctx.font = (style || '') + ' ' + px + 'px ' + F; ctx.fillStyle = color;
      var chars = s.split(''), w = 0, i; for (i = 0; i < chars.length; i++) w += ctx.measureText(chars[i]).width + (i < chars.length - 1 ? sp : 0);
      var cx = x - w / 2; ctx.textAlign = 'left';
      for (i = 0; i < chars.length; i++) { ctx.fillText(chars[i], cx, yy); cx += ctx.measureText(chars[i]).width + sp; }
      ctx.textAlign = 'center';
    };
    var wrap = function (s, px, maxW, style) {
      ctx.font = (style || '') + ' ' + px + 'px ' + F;
      var words = s.split(/\s+/), lines = [], cur = '';
      words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
      if (cur) lines.push(cur);
      return lines;
    };
    var fit = function (s, px, maxW, maxLines, style) { var lines; do { lines = wrap(s, px, maxW, style); if (lines.length <= maxLines) break; px *= 0.92; } while (px > 40 * u); return { lines: lines, px: px }; };
    spaced('THE HARVARD CLASSICS', W / 2, 300 * u, 50 * u, 14 * u, gold);
    // title
    var main = tp.main === 'Fifteen Minutes a Day' ? 'Fifteen Minutes a Day' : tp.main;
    var T = fit(main, 190 * u, W - 360 * u, 3);
    if (main === 'Fifteen Minutes a Day' && T.lines.length !== 2) T = { lines: ['Fifteen Minutes', 'a Day'], px: 190 * u };
    var ty = 560 * u;
    ctx.fillStyle = cream; ctx.font = T.px + 'px ' + F;
    T.lines.forEach(function (l) { ctx.fillText(l, W / 2, ty); ty += T.px * 1.08; });
    // ornament rule
    ty += 10 * u;
    ctx.strokeStyle = gold; ctx.lineWidth = 3 * u;
    ctx.beginPath(); ctx.moveTo(W / 2 - 260 * u, ty); ctx.lineTo(W / 2 - 40 * u, ty); ctx.moveTo(W / 2 + 40 * u, ty); ctx.lineTo(W / 2 + 260 * u, ty); ctx.stroke();
    ctx.save(); ctx.translate(W / 2, ty); ctx.rotate(Math.PI / 4); ctx.fillStyle = gold; ctx.fillRect(-14 * u, -14 * u, 28 * u, 28 * u); ctx.restore();
    // the range (subtitle)
    var sub = tp.sub || o.range || '';
    ty += 150 * u;
    if (sub) {
      var S = fit(sub, 104 * u, W - 380 * u, 2, 'italic');
      ctx.fillStyle = gold; ctx.font = 'italic ' + S.px + 'px ' + F;
      S.lines.forEach(function (l) { ctx.fillText(l, W / 2, ty); ty += S.px * 1.15; });
    }
    if (o.count) { ctx.fillStyle = cream; ctx.font = 52 * u + 'px ' + F; ctx.fillText(o.count, W / 2, ty + 10 * u); }
    // two shelves of 25 volumes
    var vols = {}; (o.vols || []).forEach(function (v) { vols[+v] = 1; });
    var any = (o.vols || []).length > 0, shelfW = W - 420 * u, bw = shelfW / 25, sh = 250 * u;
    [1590 * u, 1920 * u].forEach(function (base, row) {
      var x0 = (W - shelfW) / 2;
      for (var i = 0; i < 25; i++) {
        var n = row * 25 + i + 1, x = x0 + i * bw + 2 * u, w = bw - 4 * u, lit = !any || vols[n];
        var reds = ['#7a2230', '#6b1f2a', '#742132', '#621c27', '#6f1e2c'];
        ctx.fillStyle = lit ? reds[n % reds.length] : '#3c2a22';
        ctx.fillRect(x, base - sh, w, sh);
        var sg = ctx.createLinearGradient(x, 0, x + w, 0);
        sg.addColorStop(0, 'rgba(0,0,0,.32)'); sg.addColorStop(0.38, 'rgba(255,255,255,.12)'); sg.addColorStop(1, 'rgba(0,0,0,.28)');
        ctx.fillStyle = sg; ctx.fillRect(x, base - sh, w, sh);
        ctx.fillStyle = lit ? '#d6b260' : '#6d5a3a';
        [0.06, 0.1, 0.875, 0.91].forEach(function (f) { ctx.fillRect(x, base - sh + f * sh, w, 0.014 * sh); });
        ctx.fillStyle = lit ? 'rgba(20,8,8,.45)' : 'rgba(0,0,0,.3)'; ctx.fillRect(x + w * 0.12, base - sh + 0.19 * sh, w * 0.76, 0.15 * sh);
        ctx.fillStyle = lit ? '#efd58a' : '#8a7550'; ctx.font = 'bold ' + 22 * u + 'px ' + F; ctx.fillText(String(n), x + w / 2, base - sh + 0.3 * sh);
      }
      ctx.fillStyle = '#3d2a14'; ctx.fillRect(x0 - 16 * u, base, shelfW + 32 * u, 22 * u);
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(x0 - 16 * u, base + 22 * u, shelfW + 32 * u, 10 * u);
      void row;
    });
    ctx.fillStyle = cream; ctx.font = 'italic ' + 54 * u + 'px ' + F;
    ctx.fillText('Chosen by Charles W. Eliot', W / 2, 2175 * u);
    ctx.fillStyle = gold; ctx.font = 40 * u + 'px ' + F;
    ctx.fillText('from the Five Foot Shelf of Books', W / 2, 2240 * u);
    spaced('TEDDY ROOK BOOK', W / 2, 2370 * u, 40 * u, 12 * u, goldD);
  }

  return {
    MONTHS: MONTHS, MLEN: MLEN, ALL: ALL, POS: POS, pad: pad, monthOf: monthOf, dateName: dateName, fileId: fileId,
    encodeSel: encodeSel, decodeSel: decodeSel, order: order, rangeName: rangeName, spanName: spanName, plural: plural, commas: commas, timeName: timeName,
    esc: esc, xml: xml, inline: inline, text: text, plain: plain, dayBook: dayBook, dayPlain: dayPlain, record: record, readingTitle: readingTitle,
    pagesName: pagesName, titleParts: titleParts, rangeLine: rangeLine, editionNote: editionNote, longDate: longDate,
    epub: epub, CSS: CSS, zip: zip, crc32: crc32, utf8: utf8, browserDeflate: browserDeflate, bookText: bookText, planText: planText, cover: cover
  };
});

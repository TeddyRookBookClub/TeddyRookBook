/* Case builder model (no DOM). A case:
   {id, name, fmt, side, resolution, useVC, value, criterion, framework, intro, defs:[{term,def,src}],
    contentions:[{id, tag, cards:[{id, claim, warrant, evidence, cite, impact}]}], conclusion, made, updated}
   Used by case.js and the Node tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DebateCaseCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var n = 0;
  function id(p) { return (p || 'k') + Date.now().toString(36) + (n++).toString(36) + Math.random().toString(36).slice(2, 5); }
  var CARD = ['claim', 'warrant', 'evidence', 'cite', 'impact'];
  var LABEL = { claim: 'Claim', warrant: 'Warrant', evidence: 'Evidence', cite: 'Source', impact: 'Impact' };

  function card() { return { id: id('k'), claim: '', warrant: '', evidence: '', cite: '', impact: '' }; }
  function contention(tag) { return { id: id('c'), tag: tag || '', cards: [card()] }; }
  function make(o) {
    o = o || {};
    var t = Date.now();
    return {
      id: id('case'), name: o.name || 'My case', fmt: o.fmt || '', side: o.side || '', resolution: o.resolution || '',
      useVC: o.useVC != null ? !!o.useVC : /^(ld|lincoln)/i.test(o.fmt || ''), value: '', criterion: '', framework: '',
      intro: '', defs: [], contentions: [contention('')], conclusion: '', made: t, updated: t
    };
  }
  function move(list, i, d) {
    var j = i + d;
    if (i < 0 || j < 0 || i >= list.length || j >= list.length) return false;
    var x = list[i]; list[i] = list[j]; list[j] = x;
    return true;
  }
  function words(s) { s = String(s || '').trim(); return s ? s.split(/\s+/).length : 0; }
  // every word that would be read aloud (not the source line, which debaters usually say briefly)
  function wordCount(c) {
    var w = words(c.intro) + words(c.conclusion) + words(c.resolution);
    if (c.useVC) w += words(c.value) + words(c.criterion) + words(c.framework) + (c.value ? 4 : 0) + (c.criterion ? 4 : 0);
    (c.defs || []).forEach(function (d) { w += words(d.term) + words(d.def); });
    (c.contentions || []).forEach(function (k, i) {
      w += words(k.tag) + 2;
      (k.cards || []).forEach(function (cd) { w += words(cd.claim) + words(cd.warrant) + words(cd.evidence) + words(cd.impact) + Math.min(8, words(cd.cite)); });
    });
    return w;
  }
  // seconds to read at a pace (words a minute)
  function readSec(c, wpm) { return Math.round(wordCount(c) / (wpm || 150) * 60); }
  // fields still empty, as a short checklist
  function gaps(c) {
    var g = [];
    if (!String(c.resolution).trim()) g.push('the resolution');
    if (c.useVC && !String(c.value).trim()) g.push('a value');
    if (c.useVC && !String(c.criterion).trim()) g.push('a criterion');
    (c.contentions || []).forEach(function (k, i) {
      if (!String(k.tag).trim()) g.push('a tag for contention ' + (i + 1));
      (k.cards || []).forEach(function (cd, j) {
        var miss = ['claim', 'warrant', 'evidence', 'impact'].filter(function (f) { return !String(cd[f] || '').trim(); });
        if (String(cd.evidence || '').trim() && !String(cd.cite || '').trim()) miss.push('source');
        if (miss.length) g.push('contention ' + (i + 1) + ', point ' + (j + 1) + ': ' + miss.join(', '));
      });
    });
    return g;
  }
  function roman(i) { return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i] || String(i + 1); }
  function letter(j) { return String.fromCharCode(65 + (j % 26)); }

  function toText(c, fmtName) {
    var L = [];
    function line(s) { L.push(s); }
    function block(label, s) { s = String(s || '').trim(); if (s) line((label ? label + ': ' : '') + s); }
    line(c.name + (fmtName ? ' (' + fmtName + (c.side ? ', ' + c.side : '') + ')' : (c.side ? ' (' + c.side + ')' : '')));
    line(new Array(Math.min(60, c.name.length + 1)).join('='));
    block('Resolution', c.resolution);
    line('');
    if (String(c.intro || '').trim()) { line(String(c.intro).trim()); line(''); }
    if ((c.defs || []).some(function (d) { return d.term || d.def; })) {
      line('DEFINITIONS');
      c.defs.forEach(function (d) { if (d.term || d.def) line('- ' + (d.term || '') + ': ' + (d.def || '') + (d.src ? ' (' + d.src + ')' : '')); });
      line('');
    }
    if (c.useVC && (c.value || c.criterion || c.framework)) {
      line('FRAMEWORK');
      block('Value', c.value); block('Criterion', c.criterion); block('', c.framework);
      line('');
    }
    (c.contentions || []).forEach(function (k, i) {
      line('CONTENTION ' + (i + 1) + (k.tag ? ': ' + k.tag : ''));
      (k.cards || []).forEach(function (cd, j) {
        if (!CARD.some(function (f) { return String(cd[f] || '').trim(); })) return;
        line('  ' + letter(j) + '.');
        CARD.forEach(function (f) {
          var v = String(cd[f] || '').trim();
          if (!v) return;
          if (f === 'evidence') v = '"' + v.replace(/^"|"$/g, '') + '"';
          line('     ' + LABEL[f] + ': ' + v.replace(/\n+/g, '\n       '));
        });
      });
      line('');
    });
    if (String(c.conclusion || '').trim()) { line('CONCLUSION'); line(String(c.conclusion).trim()); line(''); }
    return L.join('\n').replace(/\n{3,}/g, '\n\n');
  }

  function str(v, max) { return String(v == null ? '' : v).slice(0, max || 20000); }
  // a case read from a file, checked field by field; null if it isn't one
  function clean(o) {
    if (!o || typeof o !== 'object' || !Array.isArray(o.contentions)) return null;
    var c = {
      id: str(o.id || id('case'), 80), name: str(o.name || 'Imported case', 200), fmt: str(o.fmt, 40), side: str(o.side, 80), resolution: str(o.resolution, 1000),
      useVC: !!o.useVC, value: str(o.value, 500), criterion: str(o.criterion, 500), framework: str(o.framework), intro: str(o.intro), conclusion: str(o.conclusion),
      defs: (Array.isArray(o.defs) ? o.defs : []).filter(function (d) { return d && typeof d === 'object'; }).slice(0, 50).map(function (d) { return { term: str(d.term, 200), def: str(d.def, 3000), src: str(d.src, 1000) }; }),
      contentions: o.contentions.filter(function (k) { return k && typeof k === 'object'; }).slice(0, 20).map(function (k) {
        return { id: str(k.id || id('c'), 80), tag: str(k.tag, 500), cards: (Array.isArray(k.cards) ? k.cards : []).filter(function (cd) { return cd && typeof cd === 'object'; }).slice(0, 30).map(function (cd) {
          var r = { id: str(cd.id || id('k'), 80) }; CARD.forEach(function (f) { r[f] = str(cd[f]); }); return r;
        }) };
      }),
      made: +o.made || Date.now(), updated: +o.updated || Date.now()
    };
    return c;
  }

  return { make: make, card: card, contention: contention, move: move, wordCount: wordCount, readSec: readSec, gaps: gaps, toText: toText, clean: clean, CARD: CARD, LABEL: LABEL, roman: roman, letter: letter };
});

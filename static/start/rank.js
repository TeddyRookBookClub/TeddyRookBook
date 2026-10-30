/* "Find what's for you": ranks the sections in data/start.yaml for a set of answers.
   Works in the browser (window.TRBStart) and in Node (module.exports) for the tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TRBStart = factory();
})(this, function () {
  function has(list, x) { return (list || []).indexOf(x) >= 0; }
  function both(a, b) { return (a || []).filter(function (x) { return has(b, x); }); }
  function byKey(list) { var o = {}; (list || []).forEach(function (x) { o[String(x.key)] = x; }); return o; }
  function listWords(xs) { return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]; }

  // answers: {who, ages: [band keys], goals: [], subjects: [], time: minutes}
  function rank(data, answers, opts) {
    var a = answers || {}, max = (opts && opts.max) || 8, min = (opts && opts.min) || 6;
    var AGES = byKey(data.ages), GOALS = byKey(data.goals), SUBS = byKey(data.subjects);
    var bands = (a.ages || []).map(function (k) { return AGES[k]; }).filter(Boolean);
    if (!bands.length && a.who === 'self') bands = [AGES.adult].filter(Boolean);
    var goals = a.goals || [], subs = a.subjects || [], time = +a.time || 0, who = a.who || '';
        var kids = bands.some(function (b) { return b.max <= 18; }) || (!bands.length && who && who !== 'self');

    var out = [];
    (data.sections || []).forEach(function (s, i) {
      var sa = s.ages || [0, 99];
      var fit = bands.filter(function (b) { return b.min <= sa[1] && b.max >= sa[0]; });
      if (bands.length && !fit.length) return; // too young or too old for everyone chosen
      var sh = both(s.subjects, subs), gh = both(s.goals, goals);
      // "one subject" only counts when the section teaches a subject that was picked (or none was picked)
      if (has(gh, 'subject') && subs.length && !sh.length) gh = gh.filter(function (g) { return g !== 'subject'; });
      // goals chosen: the section must serve one of them; only subjects chosen: it must teach one of them
      if (goals.length ? !gh.length : (subs.length && !sh.length)) return;
      // a goal scores 6 when it is the section's main goal (listed first), 4 otherwise
      var gp = 0; gh.forEach(function (g) { gp += s.goals[0] === g ? 6 : 4; });
      var sc = gp + 4 * sh.length + (+s.weight || 0) + 2 * Math.max(0, fit.length - 1); // suits more of the ages chosen
      if (who && s['for']) sc += has(s['for'], who) ? 1 : -4;
      if (time && (+s.mins || 0) > time) sc -= 3;
      if (time >= 120 && has(s.goals, 'homeschool') && has(goals, 'homeschool')) sc += 1;
      out.push({ s: s, i: i, score: sc, fit: fit, gh: gh, sh: sh });
    });
    out.sort(function (x, y) { return y.score - x.score || x.i - y.i; });
    var picked = out.slice(0, max);
    // too few matches: add the best general starting places that fit the ages
    if (picked.length < min) {
      var seen = {}; picked.forEach(function (r) { seen[r.s.key] = 1; });
      var extra = (data.sections || []).map(function (s, i) {
        var sa = s.ages || [0, 99];
        var fit = bands.filter(function (b) { return b.min <= sa[1] && b.max >= sa[0]; });
        return { s: s, i: i, fit: fit, gh: [], sh: [], extra: true, score: (+s.weight || 0) + (who && s['for'] ? (has(s['for'], who) ? 1 : -4) : 0) };
      }).filter(function (r) { return !seen[r.s.key] && (!bands.length || r.fit.length); });
      extra.sort(function (x, y) { return y.score - x.score || x.i - y.i; });
      picked = picked.concat(extra.slice(0, min - picked.length));
    }
    return picked.map(function (r) { return card(data, r, bands, kids, who, GOALS, SUBS); });
  }

  function card(data, r, bands, kids, who, GOALS, SUBS) {
    var s = r.s, sa = s.ages || [0, 99], rows = s.start || [{ to: 99, url: s.url, label: s.name }];
    function rowFor(age) { for (var j = 0; j < rows.length; j++) if (age <= rows[j].to) return rows[j]; return rows[rows.length - 1]; }
    var starts = [], byUrl = {};
    var use = r.fit.length ? r.fit : [];
    if (use.length) use.forEach(function (b) {
      var row = rowFor(Math.max(b.min, sa[0]));
      if (!byUrl[row.url]) { byUrl[row.url] = { url: row.url, label: row.label, ages: [] }; starts.push(byUrl[row.url]); }
      byUrl[row.url].ages.push(b.label);
    });
    else { var last = rows[rows.length - 1]; starts.push({ url: last.url, label: last.label, ages: [] }); }
    if (starts.length < 2) starts.forEach(function (x) { x.ages = []; });
    var because = [];
    r.sh.forEach(function (k) { if (SUBS[k]) because.push(SUBS[k].label.toLowerCase()); });
    r.gh.forEach(function (k) { if (GOALS[k] && k !== 'subject') because.push(GOALS[k].label.toLowerCase()); });
    var fitTxt = r.fit.length ? 'ages ' + listWords(r.fit.map(function (b) { return b.label.toLowerCase(); })) : '';
    if (r.fit.length === 1 && r.fit[0].key === 'adult') fitTxt = 'adults';
    var fits = because.length ? 'Fits: ' + because.join(' · ') + (fitTxt ? ' · ' + fitTxt : '')
      : r.extra ? 'A good first stop' + (fitTxt ? ' for ' + fitTxt : '') : (fitTxt ? 'Fits: ' + fitTxt : '');
    return {
      key: s.key, name: s.name, icon: s.icon, url: s.url, why: s.why, fits: fits, starts: starts,
      plan: !!(s.planner && kids && who !== 'self' && sa[0] <= 18) ? (data.planner || '/homeschool/planner/') : '',
      score: r.score
    };
  }

  return { rank: rank };
});

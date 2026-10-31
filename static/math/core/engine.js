/* Math Ladder engine: window.MathLadder.engine ("ML.engine"). The learning model of the spec, section 4 ("the climb"):
   progress, mastery, XP and the daily goal, spaced review, echo credit, what to do next, checkpoints, placement, save codes.
   Pure logic plus localStorage (key 'trb-math-v1'); no DOM. Also loads in Node (module.exports) for the tests.

   STATE   { v: 1, t: { <topic id>: rec }, xp: { <day>: points }, goal: 40, cur: <course key> | null,
             cp: topics passed since the last checkpoint, rp: [recently passed ids, newest last], lu: unit of the last new topic,
             pl: { d: day, c: start, k: known count } | null (the last placement), d0: first day }
           rec = { s: 0 unseen | 1 learning | 2 passed, p: right answers this lesson, st: streak (unhinted right answers in a row),
                   n: answers, c: right answers, iv: review step 0…6, due: day, last: day, lap: lapses,
                   pz: day the topic was paused (only while paused; the one field added to the spec's record) }
           A day is a local calendar day counted from 2020-01-01 (day 0).
   GRAPH   E.setGraph(g)            g = { partial?: true, courses: [{ key, slug, title, short, band, grade, icon, color, after, url, ladder? }],
                                          topics: [{ id, course, unit, title, short, url, prereqs, xp, soon? }] }   topics in teaching order;
                                    a partial graph is fine (a topic page passes only the topics it shows).
           E.loadGraph(url?)        Promise: fetches the site's /math/graph.json once (url: the argument, else "graph" in <script id="ml-cfg">).
           E.graph()                { T: {id: topic}, C: {key: course}, order: [course keys], byCourse: {key: [ids]}, kids: {id: [ids]}, chain }
   READ    E.rec(id)                a copy of the record (all zeros when unseen)
           E.status(id, ctx?)       'passed' | 'due' (passed, review due today) | 'learning' | 'paused' | 'ready' (prereqs met) | 'locked' | 'new' (no graph); ctx = the course the learner looks from
           E.isPassed(id)  E.due()  (ids due today, most overdue first)  E.dueCount()  E.dueBy(days) → [{ id, due }]
           E.courseProgress(key)    { total, passed, learning, due, pct }      E.frontier(key) → ids ready to learn
           E.weakestPrereq(id)      the direct prerequisite most in need of practice, or null
           E.ready(id)  (all prerequisites met)   E.met(p, forCourse)   E.courseNext(key) → { id, reason, for? } the next topic to learn in a course
           E.nextCourses(key)       courses that normally come after key
   LEARN   E.startLearn(id)         begins a sitting (misses this sitting = 0); the topic turns "learning" at its first answer
           E.learnAnswer(id, ok, { hint }) → { xp, passed, paused, weak, p, st, need, extra }
                                    pass = 3 right answers, the last 2 in a row; a hinted right answer counts toward the 3 but breaks
                                    the streak; 4 misses in one sitting pause the topic for the day (weak = its weakest prerequisite,
                                    whose review, if it is passed, becomes due today).
                                    On a passed topic it is extra practice (extra: true): XP only, the schedule does not change.
           E.climb(id)              { p, st, need (right answers still needed, at least), passed }
   REVIEW  E.reviewSet(ids?)        up to 6 problems, 2 per topic (so up to 3 topics), interleaved: [{ id, k: 0 | 1 }]
           E.reviewAnswer(id, ok)   → { xp, done, right, step, due } (after the topic's second answer the schedule moves:
                                    2 right → next step, 1 → same step due in half the time, 0 → step 0 tomorrow + its weakest prerequisite due today)
   QUIZ    E.checkpointSet()        6 problems from recently passed topics (ids, interleaved)
           E.quizAnswer(id, ok)     → { xp } (2 per right answer; a miss brings that topic's review to tomorrow)   E.checkpointDone()
   MET     A prerequisite is met when it is passed, or when it is in an earlier course (ladder order) than the topic that needs it
           and the learner hasn't started it without passing it: earlier courses count as known until shown otherwise.
           So a learner who starts at Grade 5 isn't sent back to Kindergarten; a started-but-unpassed earlier topic is taught first.
   NEXT    E.next()                 { type: 'review', items } | { type: 'checkpoint', items } | { type: 'learn', id, reason: 'next' | 'continue' | 'prereq' | 'retry', for? }
                                    | { type: 'done', course, next: [keys] } | { type: 'start' }   (spec section 4, "What next")
           E.setFilter(fn)          fn(id) → false for topics that cannot be practiced yet (no generator); next() skips them
   XP      E.addXP(n)  E.xpToday()  E.xpOn(day)  E.xpByDay(n) → [{ day, xp }] (oldest first)  E.totalXP()  E.goal()  E.setGoal(n)  E.streak()
   COURSE  E.course()  E.setCourse(key)
   PLACE   E.placement({ start: course key | 'auto', canAsk(id), max: 30 }) → session:
             .next() → topic id to ask, or null when finished     .answer(id, ok)  (ok false also for "I haven't learned this")
             .skip(id) → that question can't be shown (no generator): pick another
             .progress() → { asked, max, frac, stage }          .result() → { course, window, known, unknown, guessed, asked }
             .apply() → commits: known window topics passed at step 1 (due in about 3 days, at most 8 a day); current course =
                        the first course with an unknown topic (earlier courses need no records, see MET above)
   SAVE    E.exportCode() → Promise('ML1.' + base64url(deflate-raw(JSON)); plain JSON when CompressionStream is missing)
           E.readCode(code) → Promise({ ok, state, info: { passed, xp, days }, msg })    E.replace(state)    E.reset()
           E.exportJSON() → string
   MISC    E.on(fn)  (fn(state) after every change, also from another tab)   E.today()   E.dateOf(day)   E.STEPS   E.KEY
           E.create({ storage, clock }) → a separate engine (tests)   E.setClock(fn)   E.damaged() → true if stored data was unreadable
   LADDERS (ladders_spec.md: Math, Physics, Chemistry, Economics, Earth & Space on one engine, ONE shared progress)
           Every course in the graph may carry `ladder` (default 'math'); topic ids are unique across ladders, so one state
           holds them all. XP, the daily goal and the streak are shared. Each ladder remembers its own current course: math's
           stays in `cur` (unchanged for existing learners), the others in `cl: { <ladder>: course key }`; placement is per
           ladder (math's in `pl`, the others in `pls: { <ladder>: { d, c, k } }`). These fields appear only once used, so a
           Math-only learner's saved state keeps exactly the shape it had.
           E.setLadder(key)  E.ladder()   the ladder this page works in (default 'math'); ui.js sets it from <script id="ml-cfg">
           E.ladderOf(courseKey)   E.ladders() → ladder keys in graph order   E.course(ladder?)  E.setCourse(key) (that course's ladder)
           E.placed(ladder?) → the ladder's last placement { d, c, k } or null
           Scope: next(), due(), dueCount(), reviewSet() and checkpointSet() work on the active ladder's topics plus topics from
           other ladders that were learned (or placed) from it (rec.o = that ladder: a math skill a physics topic sent the learner
           back to comes back for review on the Physics page). E.dueAll() / E.dueCountAll() count every ladder.
           Cross-ladder MET: a prerequisite from ANOTHER ladder counts as known (until shown otherwise) when its course is
           reachable through `after` from the course that needs it (phys1 after alg1 → Algebra 1 and everything below it) and
           the learner isn't currently working at or below it in its own ladder (Math's current course is Algebra 1 → Algebra 1
           topics aren't assumed). Otherwise next() teaches it first: { type: 'learn', reason: 'prereq', id, for, ladder }.
   OUTSIDE PRACTICE (stable API for sections such as Test Prep; see also runner.js "API FOR OTHER SECTIONS")
           E.recordResult(id, ok, { xp }) → { xp, … }   an answer given outside the ladders, counted like a review answer: on a
                                    passed topic it joins the same 2-answer review tally as reviewAnswer (2 answers move the
                                    schedule) and a miss brings its review to tomorrow at the latest; on a topic not passed it
                                    counts toward its totals and XP only. XP = the topic's xp per right answer (xp: false: none).
           E.addReview(ids) → { review: [ids], learn: [ids] }   passed topics become due today; topics not passed join a short
                                    "focus" list (state field fq) that next() teaches first, on the topic's own ladder
                                    ({ type: 'learn', reason: 'focus' }); a topic leaves the list when it is passed.
   READINGS OF THE SPEC (where it left room)
   - A review set is 6 problems at 2 per topic, so it covers up to 3 topics (most overdue first, preferring topics that aren't
     direct prerequisites of each other); never two in a row from the same topic when avoidable.
   - "A prerequisite from an earlier course is missing" = started and not passed (see MET); untouched earlier courses count as known.
   - Placement checks the chosen course plus every course in its `after` list; if all of the lowest course's first topics come out
     unknown and questions remain, it looks one course lower (up to 3 times). "Not sure" first binary-searches the main line of the
     ladder with one probe topic per course. Undecided topics at the end are classified by the teaching-order cut that best
     separates the decided ones. Known topics' first reviews are spread out, at most 8 a day.
   - The record gains one field, pz (paused day). Checkpoint misses bring that topic's review to tomorrow.                         */
(function (root, factory) {
  var E = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = E;
  if (root && root.document) { var ML = root.MathLadder = root.MathLadder || {}; ML.engine = E; }
})(typeof window !== 'undefined' ? window : globalThis, function (W) {
  'use strict';
  var KEY = 'trb-math-v1', STEPS = [1, 3, 7, 16, 35, 75, 150], EPOCH = Date.UTC(2020, 0, 1);
  var ID_RE = /^[a-z0-9][\w-]{0,15}\.[\w.-]{1,80}$/i, CK_RE = /^[a-z0-9][\w-]{0,15}$/i;
  var PASS_RIGHT = 3, PASS_STREAK = 2, PAUSE_MISSES = 4, PASS_BONUS = 5, QUIZ_XP = 2, CHECK_EVERY = 8, SET_SIZE = 6, PER_TOPIC = 2, QUIZ_SIZE = 6;

  function realDay(d) { d = d || new Date(); return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCH) / 864e5); }
  function dateOf(day) { var u = new Date(EPOCH + day * 864e5); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); }
  function int(v, lo, hi, d) { v = Math.floor(+v); if (!isFinite(v)) return d; return Math.max(lo, Math.min(hi, v)); }
  function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  function make(opt) {
    opt = opt || {};
    var store = opt.storage !== undefined ? opt.storage : (function () { try { return W.localStorage; } catch (e) { return null; } })();
    var clock = opt.clock || realDay, S, broken = false, fns = [], sit = {}, rv = {}, filter = null, act = 'math';
    var G = { T: {}, C: {}, order: [], byCourse: {}, kids: {}, chain: [], idx: {}, chains: {}, anc: {}, ladders: [] };
    var LK_RE = /^[a-z][a-z0-9-]{0,20}$/;
    function today() { return clock(); }

    /* ---------- state: load, clean, save ---------- */
    function blank() { return { v: 1, t: {}, xp: {}, goal: 40, cur: null, cp: 0, rp: [], lu: null, pl: null, d0: today() }; }
    function cleanRec(r) {
      if (!r || typeof r !== 'object' || Array.isArray(r)) return null;
      var x = { s: int(r.s, 0, 2, 0), p: int(r.p, 0, 9999, 0), st: int(r.st, 0, 9999, 0), n: int(r.n, 0, 1e7, 0), c: int(r.c, 0, 1e7, 0), iv: int(r.iv, 0, 6, 0), due: int(r.due, 0, 1e6, 0), last: int(r.last, 0, 1e6, 0), lap: int(r.lap, 0, 1e5, 0) };
      if (x.c > x.n) x.n = x.c;
      if (r.pz && x.s === 1) x.pz = int(r.pz, 0, 1e6, 0);
      if (typeof r.o === 'string' && LK_RE.test(r.o)) x.o = r.o; // learned from another ladder's page
      if (x.s === 2 && !x.due) x.due = today() + 1;
      return x;
    }
    function clean(o) {
      if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
      var s = blank(), k;
      if (o.t && typeof o.t === 'object' && !Array.isArray(o.t)) for (k in o.t) if (own(o.t, k) && ID_RE.test(k)) { var r = cleanRec(o.t[k]); if (r) s.t[k] = r; }
      if (o.xp && typeof o.xp === 'object' && !Array.isArray(o.xp)) for (k in o.xp) if (own(o.xp, k) && /^\d{1,6}$/.test(k)) { var v = int(o.xp[k], 0, 1e5, 0); if (v) s.xp[k] = v; }
      s.goal = int(o.goal, 5, 500, 40);
      s.cur = typeof o.cur === 'string' && CK_RE.test(o.cur) ? o.cur : null;
      s.cp = int(o.cp, 0, 1000, 0);
      s.rp = Array.isArray(o.rp) ? o.rp.filter(function (x) { return typeof x === 'string' && ID_RE.test(x); }).slice(-24) : [];
      s.lu = typeof o.lu === 'string' && o.lu.length < 120 ? o.lu : null;
      if (o.pl && typeof o.pl === 'object') s.pl = { d: int(o.pl.d, 0, 1e6, 0), c: typeof o.pl.c === 'string' ? o.pl.c.slice(0, 20) : '', k: int(o.pl.k, 0, 1e5, 0) };
      s.d0 = int(o.d0, 0, 1e6, today());
      // other ladders (only present once used): current course and last placement per ladder; the focus list
      if (o.cl && typeof o.cl === 'object' && !Array.isArray(o.cl)) for (k in o.cl) if (own(o.cl, k) && LK_RE.test(k) && k !== 'math' && typeof o.cl[k] === 'string' && CK_RE.test(o.cl[k])) (s.cl = s.cl || {})[k] = o.cl[k];
      if (o.pls && typeof o.pls === 'object' && !Array.isArray(o.pls)) for (k in o.pls) if (own(o.pls, k) && LK_RE.test(k) && o.pls[k] && typeof o.pls[k] === 'object') (s.pls = s.pls || {})[k] = { d: int(o.pls[k].d, 0, 1e6, 0), c: typeof o.pls[k].c === 'string' ? o.pls[k].c.slice(0, 20) : '', k: int(o.pls[k].k, 0, 1e5, 0) };
      if (Array.isArray(o.fq)) { var fq = o.fq.filter(function (x, i, a) { return typeof x === 'string' && ID_RE.test(x) && a.indexOf(x) === i; }).slice(-40); if (fq.length) s.fq = fq; }
      return s;
    }
    function load() {
      var raw = null; broken = false;
      try { raw = store ? store.getItem(KEY) : null; } catch (e) { raw = null; }
      if (!raw) return blank();
      var o; try { o = JSON.parse(raw); } catch (e) { broken = true; return blank(); }
      var s = clean(o); if (!s) { broken = true; return blank(); }
      return s;
    }
    function trimXP() { var d = today(), k; for (k in S.xp) if (+k < d - 400) delete S.xp[k]; }
    function save() {
      trimXP();
      try { if (store) store.setItem(KEY, JSON.stringify(S)); broken = false; } catch (e) { /* full or blocked: keep going in memory */ }
      if (!opt.storage) { try { if (W.TRB && W.TRB.markActivity) W.TRB.markActivity(); } catch (e) { } } // a session for the backup reminder (js/backup.js)
      emit();
    }
    function emit() { fns.slice().forEach(function (f) { try { f(S); } catch (e) { if (W.console) W.console.error(e); } }); }
    S = load();
    if (!opt.storage && W && W.addEventListener) try { W.addEventListener('storage', function (e) { if (e.key === KEY || e.key === null) { S = load(); emit(); } }); } catch (e) { }

    function rec(id, create) {
      var r = own(S.t, id) ? S.t[id] : null;
      if (!r) { r = { s: 0, p: 0, st: 0, n: 0, c: 0, iv: 0, due: 0, last: 0, lap: 0 }; if (create) S.t[id] = r; }
      return r;
    }
    function copy(r) { var o = {}; for (var k in r) o[k] = r[k]; return o; }

    /* ---------- graph ---------- */
    function setGraph(g) {
      var N = { T: {}, C: {}, order: [], byCourse: {}, kids: {}, chain: [], idx: {}, chains: {}, anc: {}, ladders: [] };
      ((g && g.courses) || []).forEach(function (c) { if (c && c.key && !N.C[c.key]) { N.C[c.key] = c; N.order.push(c.key); N.byCourse[c.key] = []; } });
      ((g && g.topics) || []).forEach(function (t, i) {
        if (!t || !t.id || N.T[t.id]) return;
        var c = t.course || t.id.split('.')[0];
        N.T[t.id] = { id: t.id, course: c, unit: t.unit || '', title: t.title || t.id, short: t.short || '', url: t.url || '', prereqs: (t.prereqs || []).slice(), xp: int(t.xp, 1, 3, 2), i: i };
        if (t.soon) N.T[t.id].soon = true; // no lesson or generator yet ("Being written"): pages skip it in practice
        (N.byCourse[c] = N.byCourse[c] || []).push(t.id);
        if (!N.C[c]) { N.C[c] = { key: c, after: [] }; N.order.push(c); }
      });
      Object.keys(N.T).forEach(function (id) { // a full graph drops prerequisites it doesn't have (a course not written yet); a partial one keeps them
        var t = N.T[id]; t.prereqs = t.prereqs.filter(function (p) { return p !== id && (N.T[p] || (g && g.partial)); });
        t.prereqs.forEach(function (p) { (N.kids[p] = N.kids[p] || []).push(id); });
      });
      N.order.forEach(function (k, i) { N.idx[k] = i; var L = N.C[k].ladder || 'math'; if (N.ladders.indexOf(L) < 0) N.ladders.push(L); });
      // the main line of each ladder: from its bottom, always the first course (in ladder order) of the same ladder that
      // names the current one in `after`
      N.ladders.forEach(function (L) {
        var mine = N.order.filter(function (k) { return (N.C[k].ladder || 'math') === L; }), cur = mine[0], seen = {}, ch = [];
        while (cur && !seen[cur]) { seen[cur] = 1; ch.push(cur); cur = mine.filter(function (k) { return (N.C[k].after || []).indexOf(cur) >= 0; })[0]; }
        N.chains[L] = ch;
      });
      N.chain = N.chains[N.ladders[0]] || [];
      // every course reachable through `after` (across ladders): the courses that count as "earlier" for cross-ladder prerequisites
      function anc(k, stack) {
        if (N.anc[k]) return N.anc[k];
        var out = {}; stack[k] = 1;
        ((N.C[k] && N.C[k].after) || []).forEach(function (a) { if (stack[a] || !N.C[a]) return; out[a] = 1; var x = anc(a, stack); for (var y in x) out[y] = 1; });
        delete stack[k]; return (N.anc[k] = out);
      }
      N.order.forEach(function (k) { anc(k, {}); });
      G = N; return E;
    }
    var graphP = null;
    function loadGraph(url) {
      if (graphP) return graphP;
      if (!url) try { url = (W.MathLadder && W.MathLadder.cfg && W.MathLadder.cfg.graph) || JSON.parse(W.document.getElementById('ml-cfg').textContent).graph; } catch (e) { }
      if (!url || !W.fetch) return Promise.reject(new Error('no graph url'));
      graphP = W.fetch(url).then(function (r) { if (!r.ok) throw new Error('graph ' + r.status); return r.json(); }).then(function (g) { setGraph(g); emit(); return G; });
      graphP.catch(function () { graphP = null; });
      return graphP;
    }
    function ladderOf(c) { return (G.C[c] && G.C[c].ladder) || 'math'; }
    function topicLadder(id) { return ladderOf(courseOf(id)); }
    function curOf(L) { L = L || act; return L === 'math' ? S.cur : (S.cl && S.cl[L]) || null; }
    function setCur(L, k) {
      if (L === 'math') { S.cur = k || null; return; }
      if (k) { S.cl = S.cl || {}; S.cl[L] = k; } else if (S.cl) { delete S.cl[L]; if (!Object.keys(S.cl).length) delete S.cl; }
    }
    function inScope(id) { if (topicLadder(id) === act) return true; var r = own(S.t, id) ? S.t[id] : null; return !!(r && r.o === act); }
    // is course c "earlier" than course f? Same ladder: lower on the ladder. Another ladder: reachable through f's `after`
    // and not at or above the learner's current course in c's own ladder.
    function earlier(c, f) {
      if (!c || !f || c === f || G.idx[c] === undefined || G.idx[f] === undefined) return false;
      var Lc = ladderOf(c);
      if (Lc === ladderOf(f)) return G.idx[c] < G.idx[f];
      if (!G.anc[f] || !G.anc[f][c]) return false;
      var cu = curOf(Lc);
      return !(cu && G.idx[cu] !== undefined && ladderOf(cu) === Lc && G.idx[c] >= G.idx[cu]);
    }
    function topicXP(id) { return G.T[id] ? G.T[id].xp : 2; }
    function prereqs(id) { return G.T[id] ? G.T[id].prereqs : []; }
    function passed(id) { var r = own(S.t, id) ? S.t[id] : null; return !!r && r.s === 2; }
    function ok4(id) { return !filter || filter(id) !== false; }
    function courseOf(id) { return G.T[id] ? G.T[id].course : String(id).split('.')[0]; }
    // A prerequisite counts as met when it is passed, or when it belongs to an EARLIER course (on the ladder) than `forCourse`
    // and the learner hasn't started it without passing it: earlier courses are assumed known until shown otherwise.
    function sat(p, forCourse) {
      if (passed(p)) return true;
      if (!earlier(courseOf(p), forCourse)) return false;
      var r = own(S.t, p) ? S.t[p] : null; return !r || r.s === 0;
    }
    function ready(id, ctx) { // ctx: a later course the learner is looking from (its earlier courses count as known)
      var c = courseOf(id); if (ctx && earlier(c, ctx)) c = ctx;
      return prereqs(id).every(function (p) { return sat(p, c); });
    }
    function ancestors(id, out) { out = out || {}; prereqs(id).forEach(function (p) { if (!out[p]) { out[p] = 1; ancestors(p, out); } }); return out; }
    function descendants(id, out) { out = out || {}; (G.kids[id] || []).forEach(function (k) { if (!out[k]) { out[k] = 1; descendants(k, out); } }); return out; }

    /* ---------- reading ---------- */
    function status(id, ctx) {
      var r = own(S.t, id) ? S.t[id] : null, d = today();
      if (r && r.s === 2) return r.due <= d ? 'due' : 'passed';
      if (r && r.s === 1) return r.pz === d ? 'paused' : 'learning';
      if (!G.T[id]) return 'new';
      return ready(id, ctx) ? 'ready' : 'locked';
    }
    function dueAll(d, all) { // the active ladder's reviews due (all: every ladder's)
      d = d === undefined ? today() : d;
      var out = [];
      for (var id in S.t) if (own(S.t, id)) { var r = S.t[id]; if (r.s === 2 && r.due <= d && G.T[id] && ok4(id) && (all || inScope(id))) out.push(id); }
      out.sort(function (a, b) { return S.t[a].due - S.t[b].due || S.t[a].iv - S.t[b].iv || G.T[a].i - G.T[b].i; });
      return out;
    }
    function dueBy(days) {
      var d = today() + (days || 0), out = [];
      for (var id in S.t) if (own(S.t, id)) { var r = S.t[id]; if (r.s === 2 && r.due <= d) out.push({ id: id, due: r.due }); }
      return out.sort(function (a, b) { return a.due - b.due; });
    }
    function courseProgress(key) {
      var ids = G.byCourse[key] || [], o = { total: ids.length, passed: 0, learning: 0, due: 0, pct: 0 }, d = today();
      ids.forEach(function (id) { var r = own(S.t, id) ? S.t[id] : null; if (!r) return; if (r.s === 2) { o.passed++; if (r.due <= d) o.due++; } else if (r.s === 1) o.learning++; });
      o.pct = o.total ? Math.round(100 * o.passed / o.total) : 0; return o;
    }
    function frontier(key) { return (G.byCourse[key] || []).filter(function (id) { return !passed(id) && ready(id); }); }
    function weakestPrereq(id) {
      var best = null, bs = Infinity;
      prereqs(id).forEach(function (p) {
        var r = own(S.t, p) ? S.t[p] : null, sc;
        if (!sat(p, courseOf(id))) sc = -1e6 + (G.T[p] ? G.T[p].i : 0) * 1e-3; // not met: weakest of all (the earliest first)
        else if (!r || r.s !== 2) sc = 1e5; // assumed known from an earlier course: no evidence either way
        else sc = r.iv * 10 + (r.n ? 10 * r.c / r.n : 10) - r.lap * 5 - Math.max(0, today() - r.due) * 0.1;
        if (sc < bs) { bs = sc; best = p; }
      });
      return best;
    }
    function nextCourses(key, same) { // same: only courses of key's own ladder
      return G.order.filter(function (k) { return (G.C[k].after || []).indexOf(key) >= 0 && (!same || ladderOf(k) === ladderOf(key)); });
    }

    /* ---------- XP ---------- */
    function addXP(n) { n = int(n, 0, 1000, 0); if (!n) return 0; var d = String(today()); S.xp[d] = (S.xp[d] || 0) + n; return n; }
    function xpOn(day) { return S.xp[String(day)] || 0; }
    function xpByDay(n) { var d = today(), out = []; for (var i = n - 1; i >= 0; i--) out.push({ day: d - i, xp: xpOn(d - i) }); return out; }
    function totalXP() { var s = 0; for (var k in S.xp) if (own(S.xp, k)) s += S.xp[k]; return s; }
    function streak() { var d = today(), n = 0; if (!xpOn(d)) d--; while (xpOn(d) > 0) { n++; d--; } return n; }

    /* ---------- echo credit ---------- */
    function echo(id) {
      var d = today(), out = [];
      prereqs(id).forEach(function (p) {
        var r = own(S.t, p) ? S.t[p] : null; if (!r || r.s !== 2) return;
        var h = Math.ceil(STEPS[r.iv] / 2);
        if (r.due < d + h) { r.due = Math.max(r.due, d) + h; out.push(p); }
      });
      return out;
    }

    /* ---------- learning a topic (the climb) ---------- */
    function startLearn(id) { sit[id] = 0; return copy(rec(id)); } // a new sitting; the topic becomes "learning" at its first answer
    function climb(id) {
      var r = rec(id), need = r.s === 2 ? 0 : Math.max(PASS_RIGHT - r.p, PASS_STREAK - r.st, 0);
      return { p: r.p, st: r.st, need: need, passed: r.s === 2 };
    }
    function pass(id, r, d) {
      r.s = 2; r.iv = 0; r.due = d + 1; delete r.pz; unfocus(id);
      S.cp++; S.rp = S.rp.filter(function (x) { return x !== id; }); S.rp.push(id); if (S.rp.length > 24) S.rp = S.rp.slice(-24);
      return echo(id);
    }
    function learnAnswer(id, ok, o) {
      o = o || {}; var r = rec(id, true), d = today(), res = { xp: 0, passed: false, paused: false, extra: false };
      r.n++; r.last = d; if (ok) r.c++;
      if (r.s === 2) { res.extra = true; if (ok) res.xp = addXP(topicXP(id)); }
      else {
        if (r.s === 0) {
          r.s = 1; r.p = 0; r.st = 0;
          if (G.T[id]) { S.lu = G.T[id].course + '/' + G.T[id].unit; var L = ladderOf(G.T[id].course); if (L === act) { if (!curOf(L)) setCur(L, G.T[id].course); } else r.o = act; }
        }
        if (ok) { r.p++; r.st = o.hint ? 0 : r.st + 1; res.xp = addXP(topicXP(id)); }
        else { r.st = 0; sit[id] = (sit[id] || 0) + 1; }
        if (r.p >= PASS_RIGHT && r.st >= PASS_STREAK) { res.passed = true; res.echo = pass(id, r, d); res.xp += addXP(PASS_BONUS); sit[id] = 0; }
        else if (!ok && sit[id] >= PAUSE_MISSES) {
          r.pz = d; res.paused = true; sit[id] = 0; res.weak = weakestPrereq(id);
          var w = res.weak && own(S.t, res.weak) ? S.t[res.weak] : null; if (w && w.s === 2 && w.due > d) w.due = d; // bring the weak prerequisite back today
        }
      }
      var c = climb(id); res.p = c.p; res.st = c.st; res.need = c.need;
      save(); return res;
    }

    /* ---------- spaced review ---------- */
    function interleave(groups) { // groups: [[a, a], [b, b], [c]] → no two in a row from the same group when possible
      var out = [], left = groups.map(function (g) { return g.slice(); }), last = null;
      while (left.some(function (g) { return g.length; })) {
        // take from the group with the most left that isn't the last one used (ties: the original order)
        var best = -1;
        left.forEach(function (g, i) { if (g.length && i !== last && (best < 0 || g.length > left[best].length)) best = i; });
        if (best < 0) best = last;
        out.push(left[best].shift()); last = best;
      }
      return out;
    }
    function reviewSet(ids) {
      // most overdue first; prefer topics that aren't direct prerequisites of each other (echo credit would move one mid-set)
      var all = ids || dueAll(), n = Math.floor(SET_SIZE / PER_TOPIC), pick = [];
      function near(a, b) { return prereqs(a).indexOf(b) >= 0 || prereqs(b).indexOf(a) >= 0; }
      all.forEach(function (id) { if (pick.length < n && !pick.some(function (p) { return near(p, id); })) pick.push(id); });
      all.forEach(function (id) { if (pick.length < n && pick.indexOf(id) < 0) pick.push(id); });
      ids = pick;
      var groups = ids.map(function (id) { var g = []; for (var k = 0; k < PER_TOPIC; k++) g.push({ id: id, k: k }); return g; });
      return interleave(groups);
    }
    function reviewAnswer(id, ok) {
      var r = rec(id, true), d = today(), res = { xp: 0, done: false };
      r.n++; if (ok) { r.c++; res.xp = addXP(topicXP(id)); } r.last = d;
      var tl = rv[id] = rv[id] || { a: 0, r: 0 }; tl.a++; if (ok) tl.r++;
      if (tl.a >= PER_TOPIC) { delete rv[id]; res.done = true; res.right = tl.r; var o = reviewDone(id, tl.r, true); res.step = o.step; res.due = o.due; res.weak = o.weak; res.echo = o.echo; }
      save(); return res;
    }
    function reviewDone(id, right, nosave) {
      var r = rec(id, true), d = today(), out = {};
      if (r.s !== 2) { r.s = 2; r.iv = 0; } // a review of a topic that was not passed (e.g. data from an old version): treat as passed
      delete r.pz;
      if (right >= PER_TOPIC) { r.iv = Math.min(STEPS.length - 1, r.iv + 1); r.due = d + STEPS[r.iv]; out.echo = echo(id); }
      else if (right >= 1) { r.due = d + Math.max(1, Math.round(STEPS[r.iv] / 2)); }
      else {
        r.iv = 0; r.due = d + 1; r.lap++;
        var w = out.weak = weakestPrereq(id), wr = w && own(S.t, w) ? S.t[w] : null;
        if (wr && wr.s === 2 && wr.due > d) wr.due = d;
      }
      r.last = d; out.step = r.iv; out.due = r.due;
      if (!nosave) save(); return out;
    }

    /* ---------- checkpoints ---------- */
    function checkpointSet() {
      var pool = S.rp.filter(function (id) { return G.T[id] && passed(id) && ok4(id) && inScope(id); }).slice(-Math.max(CHECK_EVERY, 12)).reverse();
      if (!pool.length) return [];
      var pick = pool.slice(0, QUIZ_SIZE), items = [], i = 0;
      while (items.length < QUIZ_SIZE) { items.push(pick[i % pick.length]); i++; }
      // mix: alternate units where possible, and never the same topic twice in a row
      function groupBy(f) { var m = {}, ks = []; items.forEach(function (id) { var k = f(id); if (!m[k]) { m[k] = []; ks.push(k); } m[k].push(id); }); return ks.map(function (k) { return m[k]; }); }
      var units = groupBy(function (id) { return G.T[id].course + '/' + G.T[id].unit; });
      var mixed = units.length > 1 ? interleave(units) : interleave(groupBy(function (id) { return id; }));
      for (var j = 1; j < mixed.length; j++) if (mixed[j] === mixed[j - 1]) mixed = interleave(groupBy(function (id) { return id; }));
      return mixed;
    }
    function quizAnswer(id, ok) {
      var r = rec(id, true), d = today(), res = { xp: 0 };
      r.n++; r.last = d; if (ok) { r.c++; res.xp = addXP(QUIZ_XP); } else if (r.s === 2 && r.due > d + 1) r.due = d + 1;
      save(); return res;
    }
    function checkpointDone() { S.cp = 0; save(); }

    /* ---------- what next ---------- */
    function frontierAncestor(id, seen) { // earliest unmet ancestor of id whose own prerequisites are all met
      var best = null, c0 = courseOf(id);
      prereqs(id).forEach(function (p) {
        if (sat(p, c0) || seen[p] || !G.T[p]) return; seen[p] = 1;
        var c = ready(p) ? p : frontierAncestor(p, seen);
        if (c && (!best || G.T[c].i < G.T[best].i)) best = c;
      });
      return best;
    }
    function learnCandidates(key, allowPaused) {
      var d = today(), out = [], have = {};
      (G.byCourse[key] || []).forEach(function (id) {
        if (passed(id)) return;
        var r = own(S.t, id) ? S.t[id] : null, ps = prereqs(id);
        if (ready(id)) { if (have[id] || !ok4(id) || (!allowPaused && r && r.pz === d)) return; have[id] = 1; out.push({ id: id, reason: r && r.s === 1 ? (r.pz === d ? 'retry' : 'continue') : 'next' }); return; }
        // missing prerequisites only from other courses: teach the missing one first
        if (ps.every(function (p) { return sat(p, key) || !G.T[p] || G.T[p].course !== key; })) {
          var a = frontierAncestor(id, {}); if (!a || have[a] || !ok4(a)) return;
          var ra = own(S.t, a) ? S.t[a] : null; if (!allowPaused && ra && ra.pz === d) return;
          have[a] = 1; out.push({ id: a, reason: 'prereq', for: id });
        }
      });
      return out;
    }
    function focusCandidates(allowPaused) { // topics added from outside practice (addReview), on their own ladder
      var d = today(), out = [], have = {};
      (S.fq || []).forEach(function (id) {
        if (!G.T[id] || passed(id) || topicLadder(id) !== act) return;
        var r = own(S.t, id) ? S.t[id] : null, a = id, why = 'focus';
        if (!ready(id)) { a = frontierAncestor(id, {}); why = 'prereq'; }
        if (!a || have[a] || !ok4(a)) return;
        var ra = own(S.t, a) ? S.t[a] : null; if (!allowPaused && ra && ra.pz === d) return;
        have[a] = 1; out.push(why === 'focus' ? { id: a, reason: 'focus' } : { id: a, reason: 'prereq', 'for': id });
      });
      return out;
    }
    function pickLearn(allowPaused) {
      var f = focusCandidates(allowPaused);
      if (f.length) { var o0 = { type: 'learn', id: f[0].id, reason: f[0].reason }; if (f[0].for) o0.for = f[0].for; if (topicLadder(o0.id) !== act) o0.ladder = topicLadder(o0.id); return o0; }
      var cur = curOf(act);
      if (!cur || !G.byCourse[cur]) return null;
      var c = learnCandidates(cur, allowPaused); if (!c.length) return null;
      var first = c[0];
      if (first.reason === 'next' && S.lu) { // interleaving: alternate units when another new topic is available
        var u = function (x) { return G.T[x.id].course + '/' + G.T[x.id].unit; };
        if (u(first) === S.lu) for (var i = 1; i < c.length; i++) if (c[i].reason === 'next' && u(c[i]) !== S.lu) { first = c[i]; break; }
      }
      var o = { type: 'learn', id: first.id, reason: allowPaused && first.reason !== 'prereq' ? 'retry' : first.reason };
      if (first.for) o.for = first.for;
      if (topicLadder(first.id) !== act) o.ladder = topicLadder(first.id); // a skill from another ladder: say which
      return o;
    }
    function next() {
      var due = dueAll();
      if (due.length >= 3) return { type: 'review', items: reviewSet(due) };
      if (S.cp >= CHECK_EVERY) { var q = checkpointSet(); if (q.length) return { type: 'checkpoint', items: q }; }
      var L = pickLearn(false); if (L) return L;
      if (due.length) return { type: 'review', items: reviewSet(due) };
      L = pickLearn(true); if (L) return L;
      var cur = curOf(act);
      if (!cur || !G.byCourse[cur]) return { type: 'start' };
      var soon = G.byCourse[cur].some(function (id) { return !passed(id) && !ok4(id); });
      return { type: 'done', course: cur, next: nextCourses(cur, true), soon: soon };
    }

    /* ---------- outside practice (Test Prep and other sections) ---------- */
    function unfocus(id) { if (S.fq) { S.fq = S.fq.filter(function (x) { return x !== id; }); if (!S.fq.length) delete S.fq; } }
    function recordResult(id, ok, o) {
      o = o || {}; var r = rec(id, true), d = today(), res;
      if (r.s === 2) {
        var x0 = S.xp[String(d)] || 0;
        res = reviewAnswer(id, ok); // counts like a review answer (the same 2-answer tally); saves
        if (o.xp === false && res.xp) { S.xp[String(d)] = x0; if (!x0) delete S.xp[String(d)]; res.xp = 0; }
        if (!ok && !res.done && r.due > d + 1) { r.due = d + 1; save(); }
        return res;
      }
      res = { xp: 0, done: false };
      r.n++; r.last = d; if (ok) { r.c++; if (o.xp !== false) res.xp = addXP(topicXP(id)); }
      save(); return res;
    }
    function addReview(ids) {
      var d = today(), out = { review: [], learn: [] };
      (ids || []).forEach(function (id) {
        if (typeof id !== 'string' || !ID_RE.test(id)) return;
        var r = own(S.t, id) ? S.t[id] : null;
        if (r && r.s === 2) { if (r.due > d) r.due = d; out.review.push(id); return; }
        S.fq = (S.fq || []).filter(function (x) { return x !== id; }); S.fq.push(id); if (S.fq.length > 40) S.fq = S.fq.slice(-40);
        out.learn.push(id);
      });
      save(); return out;
    }

    /* ---------- placement ("Find your rung") ---------- */
    function placement(po) {
      po = po || {};
      var max = po.max || 30, ask0 = po.canAsk || function () { return true; }, noAsk = {};
      function canAsk(id) { return !noAsk[id] && ask0(id) !== false; }
      var K = {}, U = {}, asked = 0, log = [], stage, win = [], winSet = {}, xw = {}, pending = null, extended = 0;
      var PL = po.ladder || (po.start && G.C[po.start] ? ladderOf(po.start) : act); // placement is per ladder
      var mine = G.order.filter(function (k) { return ladderOf(k) === PL; });
      var chain = (G.chains[PL] || []).slice(), lo = -1, hi = chain.length - 1;
      function same(k) { return ladderOf(k) === PL; }
      // prerequisites from other ladders that block the window's topics (not passed and not assumed known) join the check,
      // so a right answer can show them known
      function addBlocking(ids) {
        ids.forEach(function (id) { prereqs(id).forEach(function (p) { if (G.T[p] && !same(courseOf(p)) && !passed(p) && !sat(p, courseOf(id))) { xw[p] = 1; winSet[p] = 1; } }); });
      }
      function decided(id) { return K[id] || U[id]; }
      function markK(id) { if (U[id]) return; K[id] = 1; Object.keys(ancestors(id)).forEach(function (a) { if (!U[a]) K[a] = 1; }); }
      function markU(id) { if (K[id]) return; U[id] = 1; Object.keys(descendants(id)).forEach(function (a) { if (!K[a]) U[a] = 1; }); }
      function setWindow(key) {
        var ks = [key].concat(((G.C[key] && G.C[key].after) || []).filter(function (k) { return G.byCourse[k] && same(k); }));
        ks.sort(function (a, b) { return G.idx[a] - G.idx[b]; });
        win = ks; winSet = {}; xw = {}; ks.forEach(function (k) { (G.byCourse[k] || []).forEach(function (id) { winSet[id] = 1; }); });
        addBlocking(Object.keys(winSet));
      }
      function winIds() { return Object.keys(winSet).sort(function (a, b) { return G.T[a].i - G.T[b].i; }); }
      function probe(key) { // a topic that stands for "knows most of this course": the most in-course ancestors in its first 80%
        var ids = (G.byCourse[key] || []).filter(canAsk), best = null, bs = -1, lim = Math.ceil((G.byCourse[key] || []).length * 0.8);
        ids.forEach(function (id) {
          if ((G.byCourse[key] || []).indexOf(id) >= lim && best) return;
          var n = Object.keys(ancestors(id)).filter(function (a) { return G.T[a] && G.T[a].course === key; }).length;
          if (n > bs) { bs = n; best = id; }
        });
        return best;
      }
      if (po.start && po.start !== 'auto' && G.byCourse[po.start]) { stage = 'fine'; setWindow(po.start); }
      else { stage = 'coarse'; chain = chain.filter(function (k) { return probe(k); }); hi = chain.length - 1; if (hi < 0) { stage = 'fine'; setWindow(mine[0] || G.order[0]); } }
      function finishCoarse() {
        stage = 'fine';
        var k = chain[Math.min(lo + 1, chain.length - 1)] || mine[0] || G.order[0];
        setWindow(k);
      }
      function pickFine() {
        var ids = winIds().filter(function (id) { return !decided(id); });
        var best = null, bs = -1, bt = -1;
        // undecided relatives inside the window
        ids.forEach(function (id) {
          if (!canAsk(id)) return;
          var a = 1, b = 1, x;
          var an = ancestors(id); for (x in an) if (winSet[x] && !decided(x)) a++;
          var de = descendants(id); for (x in de) if (winSet[x] && !decided(x)) b++;
          var sc = Math.min(a, b), tot = a + b;
          if (sc > bs || (sc === bs && tot > bt)) { bs = sc; bt = tot; best = id; }
        });
        return best;
      }
      function tryExtend() { // everything decided early and the lowest course's first topics are unknown: look one course lower
        if (extended >= 3 || asked >= max) return false;
        var low = win[0], ids = G.byCourse[low] || [], roots = ids.filter(function (id) { return !prereqs(id).some(function (p) { return G.T[p] && G.T[p].course === low; }); });
        if (!roots.length || !roots.every(function (id) { return U[id]; })) return false;
        var below = ((G.C[low] && G.C[low].after) || []).filter(function (k) { return G.byCourse[k] && win.indexOf(k) < 0 && same(k); });
        if (!below.length) return false;
        extended++; win = below.concat(win); below.forEach(function (k) { G.byCourse[k].forEach(function (id) { winSet[id] = 1; }); });
        addBlocking(below.reduce(function (a, k) { return a.concat(G.byCourse[k]); }, []));
        return true;
      }
      var S2 = {
        next: function () {
          if (pending) return pending;
          if (asked >= max) return null;
          while (stage === 'coarse') { // binary search up the main line of the ladder, one probe topic per course
            if (lo >= hi) { finishCoarse(); break; }
            var mid = (lo + hi + 1) >> 1, p = probe(chain[mid]);
            if (!p || K[p]) { lo = mid; continue; }
            if (U[p]) { hi = mid - 1; continue; }
            pending = p; return p;
          }
          var id = pickFine();
          if (!id && tryExtend()) id = pickFine();
          pending = id; return id;
        },
        answer: function (id, ok) {
          if (!id) return;
          asked++; log.push({ id: id, ok: !!ok, stage: stage });
          if (ok) markK(id); else markU(id);
          if (stage === 'coarse') {
            var mid = chain.indexOf(G.T[id].course);
            if (mid >= 0) { if (ok) lo = Math.max(lo, mid); else hi = Math.min(hi, mid - 1); }
            if (lo >= hi) finishCoarse();
          }
          pending = null;
        },
        skip: function (id) { noAsk[id] = 1; if (pending === id) pending = null; }, // a question that couldn't be shown: ask something else
        progress: function () {
          var ids = stage === 'fine' ? winIds() : [], d = ids.filter(decided).length;
          var f = stage === 'coarse' ? asked / max : Math.max(asked / max, ids.length ? d / ids.length : 0);
          return { asked: asked, max: max, frac: Math.min(1, f), stage: stage, decided: d, total: ids.length };
        },
        result: function () {
          var ids = winIds(), guess = {}, idxs = ids.map(function (id) { return G.T[id].i; });
          // undecided topics: the teaching-order cut that best separates the decided ones
          var und = ids.filter(function (id) { return !decided(id) && !xw[id]; }); // other ladders' skills: only what an answer showed
          if (und.length) {
            var bestCut = -Infinity, bestErr = Infinity, cuts = [-Infinity].concat(idxs.map(function (i) { return i + 0.5; }));
            cuts.forEach(function (cut) {
              var err = 0; ids.forEach(function (id) { if (!decided(id)) return; var kn = G.T[id].i < cut; if (kn !== !!K[id]) err++; });
              if (err < bestErr) { bestErr = err; bestCut = cut; }
            });
            und.forEach(function (id) { guess[id] = G.T[id].i < bestCut; });
            // keep the guesses consistent with the graph: a guessed-known topic's undecided ancestors are known too
            und.forEach(function (id) { if (guess[id]) Object.keys(ancestors(id)).forEach(function (a) { if (own(guess, a)) guess[a] = true; }); });
          }
          var known = [], unknown = [];
          ids.forEach(function (id) { var k = decided(id) ? !!K[id] : !!guess[id]; (k ? known : unknown).push(id); });
          // the starting course: the first course in the window (ladder order) with an unknown topic, else the one after
          var course = null;
          win.forEach(function (k) { if (!course && (G.byCourse[k] || []).some(function (id) { return unknown.indexOf(id) >= 0; })) course = k; });
          if (!course) { var top = win[win.length - 1], nx = nextCourses(top, true).filter(function (k) { return chain.indexOf(k) >= 0 || (G.chains[PL] || []).indexOf(k) >= 0; }); course = nx[0] || nextCourses(top, true)[0] || top; }
          return { course: course, window: win.slice(), known: known, unknown: unknown, guessed: und.length, asked: asked, log: log.slice(), K: K, ladder: PL, other: Object.keys(xw) };
        },
        apply: function () {
          var res = S2.result(), d = today(), kn = {}, n = 0;
          res.known.forEach(function (id) { kn[id] = 1; });
          // topics in earlier courses need no records: next() and status() treat untouched earlier-course topics as known
          res.known.forEach(function (id) {
            if (passed(id)) return;
            var r = rec(id, true); r.s = 2; r.iv = 1; r.due = d + STEPS[1] + Math.floor(n / 8); r.p = 0; r.st = 0; delete r.pz; n++;
            if (!same(courseOf(id))) r.o = PL; unfocus(id);
          });
          setCur(PL, res.course);
          var plr = { d: d, c: po.start || 'auto', k: res.known.length };
          if (PL === 'math') S.pl = plr; else { S.pls = S.pls || {}; S.pls[PL] = plr; }
          save(); return res;
        }
      };
      return S2;
    }

    /* ---------- save codes ---------- */
    function b64u(bytes) { var s = '', CH = 0x8000; for (var i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
    function unb64u(str) { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; var s = atob(str), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
    function pipe(bytes, T) { return new Response(new Blob([bytes]).stream().pipeThrough(T)).arrayBuffer().then(function (ab) { return new Uint8Array(ab); }); }
    function exportJSON() { return JSON.stringify(S); }
    function exportCode() {
      var bytes = new TextEncoder().encode(exportJSON());
      var z = typeof CompressionStream !== 'undefined' && typeof Response !== 'undefined' && typeof Blob !== 'undefined';
      return (z ? pipe(bytes, new CompressionStream('deflate-raw')).catch(function () { return bytes; }) : Promise.resolve(bytes)).then(function (b) { return 'ML1.' + b64u(b); });
    }
    function summary(s) {
      var p = 0, k; for (k in s.t) if (own(s.t, k) && s.t[k].s === 2) p++;
      var x = 0, days = 0; for (k in s.xp) if (own(s.xp, k)) { x += s.xp[k]; days++; }
      return { passed: p, xp: x, days: days, cur: s.cur };
    }
    function readCode(code) {
      var bad = function (m) { return { ok: false, msg: m }; };
      code = String(code || '').replace(/\s+/g, '');
      if (!code) return Promise.resolve(bad('Paste a save code first.'));
      if (code.slice(0, 4) !== 'ML1.') return Promise.resolve(bad('That doesn’t look like a Math Ladder save code. It should start with ML1.'));
      var bytes; try { bytes = unb64u(code.slice(4)); } catch (e) { return Promise.resolve(bad('That code has characters that don’t belong in it. Check that you copied all of it.')); }
      function parse(b) { var o = JSON.parse(new TextDecoder().decode(b)); var s = clean(o); if (!s || o.v !== 1) throw new Error('shape'); return s; }
      var p;
      if (bytes[0] === 0x7b) p = Promise.resolve().then(function () { return parse(bytes); });
      else p = Promise.reject(new Error('z'));
      return p.catch(function () {
        if (typeof DecompressionStream === 'undefined') throw new Error('nozip');
        return pipe(bytes, new DecompressionStream('deflate-raw')).then(parse);
      }).then(function (s) { return { ok: true, state: s, info: summary(s) }; }, function (e) {
        return bad(e && e.message === 'nozip' ? 'This browser can’t open compressed codes. Try a recent Chrome, Edge, Firefox or Safari.' : 'That code looks incomplete or damaged. Check that you copied all of it.');
      });
    }
    function replace(st) { var s = clean(st); if (!s) return false; S = s; sit = {}; rv = {}; save(); return true; }
    function reset() { S = blank(); sit = {}; rv = {}; try { if (store) store.removeItem(KEY); } catch (e) { } emit(); }

    var E = {
      KEY: KEY, STEPS: STEPS.slice(), create: make,
      today: today, dateOf: dateOf, setClock: function (f) { clock = f || realDay; return E; },
      state: function () { return S; }, damaged: function () { return broken; }, reload: function () { S = load(); emit(); return S; },
      setGraph: setGraph, loadGraph: loadGraph, graph: function () { return G; }, setFilter: function (f) { filter = f || null; return E; },
      rec: function (id) { return copy(rec(id)); }, status: status, isPassed: passed,
      due: function () { return dueAll(); }, dueCount: function () { return dueAll().length; }, dueBy: dueBy,
      dueAll: function () { return dueAll(undefined, true); }, dueCountAll: function () { return dueAll(undefined, true).length; },
      setLadder: function (k) { act = typeof k === 'string' && LK_RE.test(k) ? k : 'math'; return E; }, ladder: function () { return act; },
      ladderOf: ladderOf, ladders: function () { return G.ladders.slice(); }, inScope: inScope,
      placed: function (L) { L = L || act; return L === 'math' ? S.pl : (S.pls && S.pls[L]) || null; },
      recordResult: recordResult, addReview: addReview, focusList: function () { return (S.fq || []).slice(); },
      courseProgress: courseProgress, frontier: frontier, ready: ready, met: sat,
      courseNext: function (key) { return learnCandidates(key, true)[0] || null; }, weakestPrereq: weakestPrereq, nextCourses: nextCourses,
      ancestors: function (id) { return Object.keys(ancestors(id)); }, descendants: function (id) { return Object.keys(descendants(id)); },
      startLearn: startLearn, learnAnswer: learnAnswer, climb: climb,
      reviewSet: reviewSet, reviewAnswer: reviewAnswer, reviewDone: function (id, right) { return reviewDone(id, right); },
      checkpointSet: checkpointSet, quizAnswer: quizAnswer, checkpointDone: checkpointDone, checkpointDueIn: function () { return Math.max(0, CHECK_EVERY - S.cp); },
      next: next,
      addXP: function (n) { var x = addXP(n); save(); return x; }, xpToday: function () { return xpOn(today()); }, xpOn: xpOn, xpByDay: xpByDay, totalXP: totalXP,
      goal: function () { return S.goal; }, setGoal: function (n) { S.goal = int(n, 5, 500, 40); save(); return S.goal; }, streak: streak,
      course: function (L) { return curOf(L); },
      setCourse: function (k) { k = typeof k === 'string' && CK_RE.test(k) ? k : null; var L = k && G.C[k] ? ladderOf(k) : act; setCur(L, k); save(); return curOf(L); },
      placement: placement,
      exportCode: exportCode, exportJSON: exportJSON, readCode: readCode, replace: replace, reset: reset,
      on: function (f) { fns.push(f); return function () { fns = fns.filter(function (g) { return g !== f; }); }; }
    };
    return E;
  }
  return make();
});

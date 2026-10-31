#!/usr/bin/env node
/* Backup reminders (static/js/backup.js) and the parts of static/js/profiles.js they lean on.

   node scripts/backup/test-backup.js

   1. The reminder: no nudge in the first 3 days, before 5 sessions, before a week since the last backup (or the first
      visit), while snoozed, after "Don't ask again", or with no progress; saves within an hour are one session;
      saving a backup starts the count again; a damaged key reads as empty.
   2. profiles.js: hasProgress() (ignores settings and empty saves; sees other learners' saves and household plans);
      trb-backup-v1 is device-wide and never goes into a family file or comes back from one; old one-learner progress
      files and family files still import.                                                       Exit status 1 on any failure. */
'use strict';
var path = require('path');
var ROOT = path.resolve(__dirname, '..', '..');
var BK = require(path.join(ROOT, 'static/js/backup.js')), PFM = require(path.join(ROOT, 'static/js/profiles.js'));
var fails = 0, runs = 0;
function ok(c, msg) { runs++; if (!c) { fails++; console.log('FAIL ' + msg); } }
function mem() {
  var d = {};
  return { getItem: function (k) { return Object.prototype.hasOwnProperty.call(d, k) ? d[k] : null; }, setItem: function (k, v) { d[k] = String(v); },
    removeItem: function (k) { delete d[k]; }, key: function (i) { return Object.keys(d)[i]; }, get length() { return Object.keys(d).length; }, _d: d };
}
var DAY = BK.DAY, H = 36e5, T0 = Date.UTC(2026, 0, 5, 9);

// ---------- 1. the reminder ----------
function setup(progress) {
  var s = mem(), t = { now: T0 }, p = { v: progress !== false };
  var b = BK.create(s, function () { return t.now; }, function () { return p.v; });
  return { s: s, t: t, p: p, b: b, sessions: function (n) { for (var i = 0; i < n; i++) { t.now += 2 * H; b.mark(); } } };
}
(function () {
  var x = setup();
  x.b.seen(); ok(x.b.state().first === T0, 'first visit remembered');
  ok(!x.b.due(), 'nothing due on the first visit');
  x.sessions(8); ok(x.b.state().n === 8, '8 sessions counted (' + x.b.state().n + ')');
  ok(!x.b.due(), 'first days: 8 sessions in 16 hours, no nudge');
  x.t.now = T0 + 4 * DAY; ok(!x.b.due(), 'day 4: past the first days but not a week yet');
  x.t.now = T0 + 7 * DAY; ok(x.b.due(), 'a week and 8 sessions: nudge');
  x.p.v = false; ok(!x.b.due(), 'no progress: no nudge'); x.p.v = true;
  // snooze
  x.b.snooze(); ok(!x.b.due(), 'remind me later: not now');
  x.t.now += 2 * DAY; ok(!x.b.due(), 'remind me later: not after 2 days');
  x.t.now += 1 * DAY + 1; ok(x.b.due(), 'remind me later: back after 3 days');
  // save resets
  x.b.saved(); var st = x.b.state(); ok(st.n === 0 && st.last === x.t.now && !st.snooze, 'save: count 0, last = now, snooze cleared');
  ok(!x.b.due(), 'just saved: no nudge');
  x.t.now += 8 * DAY; ok(!x.b.due(), 'a week after saving but no sessions: no nudge');
  x.sessions(4); ok(!x.b.due(), '4 sessions: not yet');
  x.sessions(1); ok(x.b.due(), '5 sessions and a week: nudge');
  // whichever comes later: 5 sessions soon after the save wait for the week
  x.b.saved(); x.sessions(6); ok(!x.b.due(), '6 sessions in 12 hours after a save: wait for the week');
  x.t.now += 7 * DAY; ok(x.b.due(), '...then nudge after the week');
  // never
  x.b.never(); ok(!x.b.due(), "don't ask again: no nudge"); x.t.now += 400 * DAY; x.sessions(50); ok(!x.b.due(), "don't ask again: still none a year later");
  x.b.saved(); ok(x.b.state().never === true, 'saving a file keeps "don\'t ask again"');
})();
(function () { // one session per hour
  var x = setup(); x.b.seen();
  for (var i = 0; i < 30; i++) { x.t.now += 60000; x.b.mark(); }
  ok(x.b.state().n === 1, '30 saves in 30 minutes = 1 session (' + x.b.state().n + ')');
  x.t.now += H; x.b.mark(); ok(x.b.state().n === 2, 'an hour later = a second session');
})();
(function () { // first activity also records the first visit; damaged key; no storage
  var x = setup(); x.b.mark(); ok(x.b.state().first === T0 && x.b.state().n === 1, 'mark() on a new device sets first');
  x.s.setItem(BK.KEY, '{not json'); ok(x.b.state().n === 0 && !x.b.due(), 'damaged key reads as empty');
  x.b.mark(); ok(x.b.state().first > 0, 'damaged key is written again');
  var nob = BK.create(null, function () { return T0; }, function () { return true; });
  var threw = false; try { nob.mark(); nob.saved(); nob.snooze(); nob.never(); nob.due(); nob.seen(); } catch (e) { threw = true; }
  ok(!threw, 'no storage: nothing throws');
  var x2 = setup(false); x2.b.seen(); x2.sessions(10); x2.t.now += 30 * DAY; ok(!x2.b.due(), 'no progress after a month and 10 sessions: no nudge');
})();

// ---------- 2. profiles.js ----------
(function () {
  ok(PFM.SHARED.indexOf('trb-backup-v1') >= 0 && !PFM.isProfileKey('trb-backup-v1'), 'trb-backup-v1 is device-wide');
  var s = mem(), PF = PFM.create(s);
  ok(!PF.hasProgress(), 'empty browser: no progress');
  s.setItem('trb-fs', '1.2'); s.setItem('trb-units', 'metric'); s.setItem('trb-backup-v1', JSON.stringify({ v: 1, first: T0, n: 3 }));
  s.setItem('trb-fest-prefs', '{"n":true,"e":true,"ent":false,"x":1}'); s.setItem('trb-math-v1', '{"v":1,"t":{},"xp":{},"goal":40,"cur":null}');
  ok(!PF.hasProgress(), 'settings, the backup key and an empty ladder save are not progress');
  s.setItem('trb-math-v1', '{"v":1,"t":{"m.add1":{"s":2,"n":4}},"xp":{}}'); ok(PF.hasProgress(), 'a ladder topic is progress');
  s.removeItem('trb-math-v1'); s.setItem('trb-family-v1', '{"v":1,"units":[{"key":"egypt"}]}'); ok(PF.hasProgress(), 'a Family Study plan is progress');
  s.removeItem('trb-family-v1');
  // another learner's saves count
  PF.add({ name: 'Anna' }, 'Me'); var anna = PF.list()[1].id; PF.setKey(anna, 'trb-homeschool-v1', '{"done":{"rays1":{"1":1,"2":1}}}');
  ok(PF.hasProgress(), "another learner's lessons are progress");
  var f = PF.exportData(null, true);
  ok(f.shared && !('trb-backup-v1' in f.shared) && f.shared['trb-fs'] === '1.2', 'family file leaves out trb-backup-v1');
  ok(f.profiles.length === 2 && f.profiles[1].data['trb-homeschool-v1'], 'family file holds both learners');
  // import into a fresh browser, with a backup key in the file's shared part
  var s2 = mem(), P2 = PFM.create(s2); f.shared['trb-backup-v1'] = '{"never":true}';
  var r = P2.importData(f, { replace: function () { return false; }, shared: function () { return true; }, firstName: 'Me' });
  ok(r.ok && r.added.length === 2 && s2.getItem('trb-backup-v1') == null, 'family file imports; a backup key in it is ignored');
  // old one-learner progress file ({ site, saved, data })
  var s3 = mem(), P3 = PFM.create(s3);
  var old = { site: 'teddyrookbook.com', saved: '2025-03-01T10:00:00.000Z', data: { 'trb-words-v1': '{"w":{"g|λόγος":{"l":"g","f":"λόγος"}}}', 'trb-fs': '1.1', 'pref-theme': 'dark' } };
  var r3 = P3.importData(old, { name: 'Ben', firstName: 'Me' });
  ok(r3.ok && r3.added[0] === 'Ben' && P3.getKey(P3.list()[1].id, 'trb-words-v1'), 'old progress files still import');
})();

console.log((fails ? fails + ' of ' + runs + ' checks failed' : 'all ' + runs + ' checks passed') + ' (backup reminders)');
process.exit(fails ? 1 : 0);

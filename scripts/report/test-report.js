#!/usr/bin/env node
/* "Report a problem" (static/js/report.js).

   node scripts/report/test-report.js [build dir]

   1. The details builder: the page, date, device, theme and section; a problem's topic, level, seed, mode, question and
      answers; the expected answer only once the card has shown it; long text cut short; tags stripped.
   2. Privacy: whatever else is passed (learner names, progress, XP, profile data, settings), it never reaches the text;
      page facts with personal-looking labels are dropped; personal-looking query parameters and the #hash leave the address.
   3. The channel: data/report.yaml as shipped is X (@teddyrookbook, the profile link); "email" with an address gives a
      mailto with the details; "email" with no address stays on X; x_id opens the message box with the text.
   4. With a build dir: every page's report.js tag carries the YAML's setting.                Exit status 1 on any failure. */
'use strict';
var fs = require('fs'), path = require('path');
var ROOT = path.resolve(__dirname, '..', '..');
var R = require(path.join(ROOT, 'static/js/report.js'));
var fails = 0, runs = 0;
function ok(c, msg) { runs++; if (!c) { fails++; console.log('FAIL ' + msg); } }
function has(s, x) { return String(s).indexOf(x) >= 0; }

// the flat YAML of data/report.yaml (key: value  # comment)
function yaml(src) {
  var o = {};
  String(src).split('\n').forEach(function (line) {
    var m = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line); if (!m) return;
    var v = m[2].trim();
    if (/^"/.test(v)) v = (/^"((?:[^"\\]|\\.)*)"/.exec(v) || [, ''])[1];
    else if (/^'/.test(v)) v = (/^'([^']*)'/.exec(v) || [, ''])[1];
    else v = v.replace(/\s+#.*$/, '').trim();
    o[m[1]] = v;
  });
  return o;
}

// 1. the builder
var page = { reason: 'wrong', note: 'The <b>answer</b> should be 12.', title: 'Add within 1000', url: 'https://teddyrookbook.com/math/g3/add/?topic=g3.add#practice',
  date: '2026-10-30', device: 'phone', theme: 'dark', kind: 'Math Ladder topic' };
var t = R.build(page);
ok(has(t, 'What’s wrong: Wrong answer'), 'reason label');
ok(has(t, 'Note: The answer should be 12.'), 'note, tags stripped');
ok(has(t, 'Page: Add within 1000'), 'title');
ok(has(t, 'Address: https://teddyrookbook.com/math/g3/add/?topic=g3.add') && !has(t, '#practice'), 'address without hash');
ok(has(t, 'Date: 2026-10-30'), 'date');
ok(has(t, 'Device: phone · Theme: dark'), 'device and theme');
ok(has(t, 'Section: Math Ladder topic'), 'section');
ok(!has(t, 'Topic:'), 'no problem lines on a page report');
ok(has(R.build({}), 'What’s wrong: (not chosen)') && has(R.build({}), 'Device: computer · Theme: light'), 'defaults');
ok(/Date: \d{4}-\d\d-\d\d/.test(R.build({})), 'date filled in');
var pr = { topic: 'g3.add-within-1000', topicTitle: 'Add within 1000', level: 2, seed: 482913, mode: 'learn', question: 'What is $345 + 278$?', answered: true, given: '613', expected: '623' };
t = R.build(Object.assign({}, page, { problem: pr }));
ok(has(t, 'Topic: g3.add-within-1000 (Add within 1000)'), 'topic');
ok(has(t, 'Level: 2 · Seed: 482913 · Mode: learn'), 'level, seed, mode');
ok(has(t, 'Question: What is $345 + 278$?'), 'question keeps its math');
ok(has(t, 'Answer given: 613') && has(t, 'Expected answer: 623'), 'answers');
t = R.build({ problem: Object.assign({}, pr, { answered: false, given: '', expected: '' }) });
ok(has(t, 'Answer given: (not answered yet)') && !has(t, 'Expected answer'), 'unanswered: no expected answer');
t = R.build({ problem: Object.assign({}, pr, { expected: '' }) });
ok(!has(t, 'Expected answer'), 'expected answer only when the card showed it');
t = R.build({ problem: Object.assign({}, pr, { question: new Array(2000).join('x') }) });
ok(t.length < 1500 && has(t, '…'), 'long question cut short');
ok(R.device(390, 844) === 'phone' && R.device(1280, 800) === 'computer' && R.device(0, 0) === 'computer', 'device type');

// 2. privacy
var leak = Object.assign({}, page, {
  name: 'Ann Smith', learner: 'Ann Smith', learners: ['Ann Smith', 'Ben'], profile: { name: 'Ann Smith', age: 9 }, progress: { 'g3.add': { p: 3 } },
  xp: 1234, streak: 7, kids: [{ name: 'Ann Smith' }], storage: 'trb-ml-v1', email: 'me@example.com',
  problem: Object.assign({}, pr, { learner: 'Ann Smith', xp: 99, progress: 'passed 3' }),
  extra: { 'Unit': 'Ancient Egypt', 'Unit seed': 41, 'Child name': 'Ann Smith', 'Learner': 'Ben', 'Progress': '80%', 'XP': 50, 'Profile': 'p1', 'Kids': ['Ann Smith'] }
});
t = R.build(leak);
['Ann', 'Smith', 'Ben', '1234', 'trb-ml-v1', 'me@example.com', '80%', 'passed 3', 'p1', 'Streak', 'XP'].forEach(function (w) { ok(!has(t, w), 'never includes ' + w); });
ok(has(t, 'Unit: Ancient Egypt') && has(t, 'Unit seed: 41'), 'harmless page facts kept');
ok(R.cleanUrl('https://teddyrookbook.com/homeschool/planner/?name=Ann&kid=Ben&learner=x&profile=p1&topic=g3.add#k') === 'https://teddyrookbook.com/homeschool/planner/?topic=g3.add', 'personal query parameters dropped');
ok(!/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(fs.readFileSync(path.join(ROOT, 'static/js/report.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')), 'no storage reads and no network calls in report.js');

// 3. the channel, from the YAML
var shipped = yaml(fs.readFileSync(path.join(ROOT, 'data/report.yaml'), 'utf8'));
ok(shipped.channel === 'x' && shipped.x_handle === 'teddyrookbook' && shipped.email === '', 'shipped YAML: x, teddyrookbook, no email');
ok(R.channel(shipped) === 'x', 'shipped: X');
ok(R.xUrl(shipped, 'hi') === 'https://x.com/teddyrookbook', 'X without x_id: the profile');
ok(R.xUrl({ x_handle: '@teddyrookbook', x_id: '12345' }, 'a b') === 'https://x.com/messages/compose?recipient_id=12345&text=a%20b', 'X with x_id: the message box with the text');
var em = yaml('channel: email            # x | email\nx_handle: teddyrookbook\nemail: "reports@teddyrookbook.com"  # forwarding\n');
ok(em.email === 'reports@teddyrookbook.com', 'yaml parse with quotes and comment');
ok(R.channel(em) === 'email', 'email with an address: email');
ok(R.channel(yaml('channel: email\nemail: ""\n')) === 'x', 'email with no address: stays on X');
ok(R.channel(yaml('channel: email\nemail: not-an-address\n')) === 'x', 'email with a bad address: stays on X');
ok(R.channel(yaml('channel: EMAIL\nemail: a@b.co\n')) === 'email', 'channel case-insensitive');
var body = R.build(Object.assign({}, page, { problem: pr })), m = R.mailto(em, R.subject(page), body);
ok(m.indexOf('mailto:reports@teddyrookbook.com?subject=') === 0, 'mailto address');
ok(decodeURIComponent(m.split('&body=')[1]) === body, 'mailto body is the same details');
ok(has(decodeURIComponent(m.split('&body=')[0]), 'Problem report: Wrong answer · Add within 1000'), 'mailto subject');
ok(R.mailto(em, 's', new Array(5000).join('y')).length < 2400, 'mailto kept short');

// 4. the build
var dir = process.argv[2];
if (dir) {
  var n = 0, bad = 0, cfg = null;
  (function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
      var p = path.join(d, e.name);
      if (e.isDirectory()) return walk(p);
      if (!/\.html$/.test(e.name)) return;
      var s = fs.readFileSync(p, 'utf8'), mm = /<script src="[^"]*js\/report\.js[^"]*" data-report="([^"]*)"/.exec(s);
      if (!mm) return; n++;
      try { var c = JSON.parse(mm[1].replace(/&#34;|&quot;/g, '"').replace(/&amp;/g, '&')); cfg = c; if (c.channel !== shipped.channel || c.x_handle !== shipped.x_handle || c.email !== shipped.email) bad++; } catch (er) { bad++; }
    });
  })(path.resolve(dir));
  ok(n > 100, 'report.js on the built pages (' + n + ')');
  ok(!bad, 'every tag carries the YAML setting (' + bad + ' wrong)');
}

console.log((fails ? 'FAILED ' + fails : 'OK') + ' (' + runs + ' checks)');
process.exit(fails ? 1 : 0);

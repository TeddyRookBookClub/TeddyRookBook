/* Backup and restore of everything the debate tools save (TRBDebate key trb-debate-v1). */
(function () {
  'use strict';
  var D = window.TRBDebate;
  var b = document.getElementById('dbx-backup'), r = document.getElementById('dbx-restore'), msg = document.getElementById('dbx-msg');
  if (!b || !r) return;
  b.addEventListener('click', function () {
    var d = D.load();
    D.download('teddy-rook-debate-backup-' + D.stamp() + '.json', JSON.stringify({ kind: 'trb-debate-backup', v: 1, saved: new Date().toISOString(), data: d }, null, 1), 'application/json');
    D.say(msg, 'Backup saved to your downloads.');
  });
  r.addEventListener('click', function () {
    D.pickFile('.json,application/json', function (text) {
      var o;
      try { o = JSON.parse(text); } catch (e) { D.say(msg, 'That file isn’t a backup this page can read.'); return; }
      var data = o && o.kind === 'trb-debate-backup' ? o.data : null;
      if (!data || typeof data !== 'object') { D.say(msg, 'That file isn’t a debate tools backup.'); return; }
      var cur = D.load();
      // merge: keep what's here, add flows and cases from the file that aren't here yet
      ['flows', 'cases'].forEach(function (k) {
        var have = {}; (cur[k] || []).forEach(function (x) { have[x.id] = 1; });
        cur[k] = (cur[k] || []).concat((data[k] || []).filter(function (x) { return x && x.id && !have[x.id]; }));
      });
      ['timer', 'drills', 'ballots', 'ui'].forEach(function (k) { if (data[k] && !cur[k]) cur[k] = data[k]; });
      D.say(msg, D.save() ? 'Backup loaded: ' + (data.flows || []).length + ' flows and ' + (data.cases || []).length + ' cases.' : 'This browser isn’t letting the page save, so the backup couldn’t be loaded.');
    });
  });
})();

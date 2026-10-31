/* Backup reminders: a gentle, occasional nudge to save the family's progress to a file. No accounts, nothing sent anywhere.
   Loaded (deferred) on every page after profiles.js. Embeds don't load it.

   WHAT IT KEEPS  one device-wide key, 'trb-backup-v1' (listed with the shared keys in profiles.js, never put in a file):
     { v: 1, first: <ms, first page seen>, last: <ms, last family backup file saved, 0 = never>, n: <sessions since then>,
       at: <ms, last session counted>, snooze: <ms, don't ask before this>, never: <true after "Don't ask again"> }
   A SESSION  counts when real work is saved: a practice answer (the ladder engine), a lesson ticked done (homeschool pages),
     a planner or Family Study change, words met in a game, or a game save. Those places call TRB.markActivity().
     Saves less than an hour after the last counted one belong to the same session.
   THE NUDGE  shows when there is work worth saving (TRBProfiles.hasProgress()), at least 5 sessions since the last backup
     AND at least a week since the last backup (or since the first visit), never in the first 3 days, not while snoozed
     ("Remind me later" = 3 days), never after "Don't ask again". Not on /embed/, print views or game pages.
     It sits in the page flow above the footer: no overlay, nothing covered.
   Saving any family file (here, on My Progress or from the learner menu) calls TRB.backupSaved(): the count starts again.

   API  window.TRB.markActivity()  TRB.backupSaved(when?)  TRB.backup = { state(), due(), snooze(), never(), saveFile() }
        module.exports = { create(storage, now(), hasProgress()), DAY, rules }   (Node tests: scripts/backup/test-backup.js) */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  var W = root, PF = W.TRBProfiles;
  var B = api.create(function () { try { return W.localStorage; } catch (e) { return null; } }(), function () { return Date.now(); },
    function () { return !!(PF && PF.hasProgress && PF.hasProgress()); });
  var T = W.TRB = W.TRB || {};
  T.markActivity = B.mark; T.backupSaved = B.saved; T.backup = B;
  api.ui(W, W.document, B, PF);
})(this, function () {
  'use strict';
  var KEY = 'trb-backup-v1', HOUR = 36e5, DAY = 864e5;
  var rules = { sessions: 5, wait: 7 * DAY, firstDays: 3 * DAY, snooze: 3 * DAY, gap: HOUR };

  function create(store, now, hasProgress) {
    function read() {
      var o = null; try { o = JSON.parse(store.getItem(KEY)); } catch (e) { }
      if (!o || typeof o !== 'object') o = {};
      function n(v) { v = +v; return isFinite(v) && v > 0 ? v : 0; }
      return { v: 1, first: n(o.first), last: n(o.last), n: Math.floor(n(o.n)), at: n(o.at), snooze: n(o.snooze), never: o.never === true };
    }
    function write(s) { try { store.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }
    var B = {
      state: read,
      // first visit: remembered once, so the nudge waits through a new visitor's first days
      seen: function () { var s = read(); if (!s.first) { s.first = now(); write(s); } return s; },
      mark: function () {
        var s = read(), t = now(), fresh = !s.first; if (fresh) s.first = t;
        if (!s.at || t - s.at >= rules.gap || t < s.at) { s.n++; s.at = t; write(s); return true; }
        if (fresh) write(s);
        return false;
      },
      saved: function (when) { var s = read(), t = +when > 0 ? +when : now(); if (!s.first) s.first = t; s.last = t; s.n = 0; s.snooze = 0; write(s); },
      due: function () {
        var s = read(), t = now();
        if (s.never || !s.first) return false;
        if (t - s.first < rules.firstDays) return false;
        if (s.snooze && t < s.snooze) return false;
        if (s.n < rules.sessions) return false;
        if (t - (s.last || s.first) < rules.wait) return false;
        return !!hasProgress();
      },
      snooze: function () { var s = read(); s.snooze = now() + rules.snooze; write(s); },
      never: function () { var s = read(); s.never = true; write(s); },
      ask: function () { var s = read(); s.never = false; s.snooze = 0; write(s); }
    };
    return B;
  }

  /* ---------- the card ---------- */
  function ui(W, D, B, PF) {
    if (!D) return;
    function download() {
      var UI = W.TRBProfilesUI;
      if (UI && UI.saveFile) { UI.saveFile(null, true); return true; } // the same family file as My Progress (it calls backupSaved)
      if (!PF || !PF.exportData) return false;
      var o = PF.exportData(null, true); if (!o.profiles.length) return false;
      var a = D.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(o)], { type: 'application/json' }));
      a.download = 'teddy-rook-family-' + o.saved.slice(0, 10) + '.json'; D.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      B.saved(); return true;
    }
    B.saveFile = download;
    try { B.seen(); } catch (e) { }
    var path = (W.location && W.location.pathname) || '/';
    if (/^\/embed\//.test(path) || /\/print\/$/.test(path) || /[?&]print\b/.test(W.location.search || '') || /^\/games\/[^/]+\//.test(path)) return;
    try { if (W.self !== W.top) return; } catch (e) { return; }
    function start() {
      if (D.querySelector('.trb-bk') || !B.due()) return;
      var css = D.createElement('style');
      css.textContent = '.trb-bk{position:relative;box-sizing:border-box;max-width:680px;margin:1.6rem auto 1rem;padding:.85rem 2.6rem .8rem 1rem;background:var(--entry);color:var(--primary);border:1px solid var(--border);border-left:4px solid #b8963e;border-radius:12px;font:15px/1.45 system-ui,sans-serif}' +
        '.trb-bk-wrap{padding:0 16px}.trb-bk p{margin:0 0 .5rem}.trb-bk b{font-weight:700;color:#004225}[data-theme=dark] .trb-bk b{color:#6cc79a}' +
        '.trb-bk-btns{display:flex;flex-wrap:wrap;gap:.45rem;margin:.55rem 0 .4rem}.trb-bk button{font:inherit;font-size:.9rem;padding:.4rem .8rem;border-radius:9px;border:1px solid var(--border);background:var(--theme);color:var(--primary);cursor:pointer}' +
        '.trb-bk button:hover{border-color:#00562f}.trb-bk .pri{background:#004225;border-color:#004225;color:#fff;font-weight:600}[data-theme=dark] .trb-bk .pri{background:#6cc79a;border-color:#6cc79a;color:#0b1a13}' +
        '.trb-bk button:focus-visible{outline:2px solid #b8963e;outline-offset:2px}.trb-bk .x{position:absolute;top:.4rem;right:.4rem;width:2rem;height:2rem;padding:0;border:0;background:none;font-size:1.3rem;line-height:1;color:var(--secondary)}' +
        '.trb-bk .hint{font-size:.83rem;color:var(--secondary);margin:0}.trb-bk .hint a{color:inherit}@media print{.trb-bk-wrap{display:none}}';
      D.head.appendChild(css);
      var wrap = D.createElement('div'); wrap.className = 'trb-bk-wrap';
      wrap.innerHTML = '<section class="trb-bk" aria-labelledby="trb-bk-h"><p id="trb-bk-h"><b>Save a backup of your family’s progress?</b> It stays on this device unless you save it.</p>' +
        '<div class="trb-bk-btns"><button type="button" class="pri" data-k="save">Save backup file</button><button type="button" data-k="later">Remind me later</button><button type="button" data-k="never">Don’t ask again</button></div>' +
        '<p class="hint">On an iPhone or iPad, the file goes to the Files app, in Downloads. <a href="/progress/#backup">How backups work</a></p>' +
        '<button type="button" class="x" data-k="later" aria-label="Close and remind me later">×</button></section>';
      var foot = D.querySelector('body > footer, footer.footer');
      if (foot && foot.parentNode) foot.parentNode.insertBefore(wrap, foot); else D.body.appendChild(wrap);
      var box = wrap.firstChild;
      function done(text) {
        box.innerHTML = '<p role="status" tabindex="-1">' + text + '</p>'; box.style.paddingRight = '1rem'; box.firstChild.focus({ preventScroll: true });
        setTimeout(function () { wrap.remove(); }, 6000);
      }
      box.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]'); if (!b) return;
        var k = b.dataset.k;
        if (k === 'save') { if (download()) done('Saved. Keep the file somewhere safe, such as email, a cloud drive or another device.'); else done('There was nothing to save.'); }
        else if (k === 'later') { B.snooze(); done('All right. We’ll ask again in a few days.'); }
        else if (k === 'never') { B.never(); done('We won’t ask again. You can save a backup any time on <a href="/progress/#backup">My Progress</a>.'); }
      });
      box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { B.snooze(); wrap.remove(); } });
    }
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
  }

  return { create: create, ui: ui, rules: rules, DAY: DAY, KEY: KEY };
});

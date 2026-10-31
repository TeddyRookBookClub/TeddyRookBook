/* Learner profiles: several learners in one browser, with no accounts and nothing sent anywhere.
   Loaded (not deferred) from the head on every page, so a pending switch happens before any other script reads its save.

   HOW IT WORKS
   Every page keeps its saves in localStorage under keys named trb-*. The ACTIVE learner's saves stay in those normal keys,
   so every page works exactly as before. The other learners' saves wait in the reserved key 'trb-profiles-v1':
     { v: 1, cur: <active id>, list: [{ id, name, age, icon }], slots: { <id>: { <key>: <saved string> } },
       pending?: <id to switch to on the next page load>, drop?: <id to delete after that switch> }
   Switching: the menu sets `pending` and reloads. On the next load (here, before other scripts run) the active learner's
   per-learner keys are copied into its slot and removed, the chosen learner's slot is written back to the normal keys,
   and `cur` changes. Doing it on load means a page that saves as it closes still saves into the learner it belongs to.
   No registry (the usual case) = no profiles: nothing here touches storage, and the site behaves exactly as before.
   The first "Add a learner" turns the data already saved into the first profile ("Me" unless renamed), so nothing is lost.

   WHICH KEYS ARE PER LEARNER
   Every key starting with "trb-" is per learner, except the device-wide ones in SHARED below; plus the keys in EXTRA
   (older saves without the trb- prefix). A new trb- key added later is per learner by default (no mixing of children's work).
   SHARED (device-wide, never swapped):
     trb-profiles-v1     this registry
     trb-fs              text size (the Aa button)
     trb-units           US / metric / both
     trb-planner-v1      the lesson planner: one family plan that holds every child (each child can be linked to a learner)
     trb-planner-days    a short digest of upcoming planned lessons, written by the planner for the "What's next" card
     trb-placement-v1    a one-time hand-off from the placement check to the planner
     trb-family-v1       Family Study units (a household plan; the planner reads it for the "Family study" subject)
     trb-meals-v1        the meal planner (a household plan)        trb-meals-setup  its setup panel open or closed
     trb-garden-v1       the garden planner (a household plan)
     trb-art-gallery     the art gallery's filter                   trb-daily-bank, trb-daily-cross  Daily Word Puzzle display
     trb-backup-v1       backup reminders (static/js/backup.js): last family backup file, sessions since, snooze. Covers the
                         whole family, so it is device-wide; never written into a file or read back from one
   Not trb- and not swapped (device preferences): pref-theme (light/dark), mk-* (markets dashboards),
   teut-en, teut-speed (game settings). The search box and the video "more" links store nothing.
   EXTRA (per learner although not trb-): tt-v1 (Time Thief cases).

   API  window.TRBProfiles (also module.exports in Node, for the tests)
     on()                 true when profiles are in use      damaged()  true when the registry can't be read (left untouched)
     list()  active()     the learners; active() is the current one (or null)
     label(p)             "Anna (age 9)"
     add({ name, age, icon }, firstName?) → { ok, profile, why }   (the first add also creates the default profile)
     update(id, { name, age, icon })  remove(id)  (remove of the active learner switches to another first, via pending)
     requestSwitch(id)    sets pending; the caller reloads the page       switchNow(id)  swaps at once (load time, tests)
     snapshot(id)         { key: string } of that learner's saves         getKey(id, k)  setKey(id, k, v)  per-learner read/write
     exportData(ids, withShared)  importData(obj, { replace: fn(name) → bool, name })   isProfileKey(k)   size()
     hasProgress()        true when this browser holds work worth a backup (any learner's saves, or a household plan)
     create(storage)      a separate instance (tests)
   Every storage call is wrapped in try/catch. A full storage gives { ok: false, why: 'full' } and nothing is half-written. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.TRBProfiles = api.create(function () { try { return root.localStorage; } catch (e) { return null; } }());
    root.TRBProfiles.create = api.create; root.TRBProfiles.SHARED = api.SHARED; root.TRBProfiles.EXTRA = api.EXTRA;
    root.TRBProfiles.boot(root);
  }
})(this, function () {
  'use strict';
  var REG = 'trb-profiles-v1', BK = 'trb-backup-v1';
  var SHARED = ['trb-profiles-v1', 'trb-fs', 'trb-units', 'trb-planner-v1', 'trb-planner-days', 'trb-placement-v1',
    'trb-family-v1', 'trb-meals-v1', 'trb-meals-setup', 'trb-garden-v1', 'trb-art-gallery', 'trb-daily-bank', 'trb-daily-cross', 'trb-backup-v1'];
  var EXTRA = ['tt-v1'];
  var ICONS = ['🦊', '🐻', '🦉', '🐢', '🐬', '🦁', '🐝', '🐧', '🦋', '🐞', '🌻', '🚀', '⭐', '📚', '🎨', '🧩'];
  function isProfileKey(k) { k = String(k); return (k.indexOf('trb-') === 0 && SHARED.indexOf(k) < 0) || EXTRA.indexOf(k) >= 0; }
  function isFull(e) { return !!e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014 || /quota/i.test(e.message || '')); }
  // work worth keeping: not a settings key, not an empty save (a ladder save with no topics yet)
  var PLANS = ['trb-planner-v1', 'trb-family-v1', 'trb-meals-v1', 'trb-garden-v1'];
  function worth(k, v) { return typeof v === 'string' && v.length >= 24 && !/-(prefs|sound|setup|speed|en)$/.test(k) && !(k === 'trb-math-v1' && /"t":\{\}/.test(v)); }
  function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function clean(s, n) { return String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n); }

  function create(store) {
    var broken = false;
    function sget(k) { try { return store ? store.getItem(k) : null; } catch (e) { return null; } }
    function sset(k, v) { if (!store) throw new Error('no storage'); store.setItem(k, v); }
    function sdel(k) { try { if (store) store.removeItem(k); } catch (e) { } }
    function keys() { var out = []; try { for (var i = 0; store && i < store.length; i++) { var k = store.key(i); if (k != null) out.push(k); } } catch (e) { } return out; }
    function liveKeys() { return keys().filter(isProfileKey); }
    function liveData() { var o = {}; liveKeys().forEach(function (k) { var v = sget(k); if (v != null) o[k] = v; }); return o; }

    function valid(r) {
      if (!r || typeof r !== 'object' || r.v !== 1 || !Array.isArray(r.list) || !r.list.length || typeof r.slots !== 'object' || !r.slots) return false;
      var ids = {};
      for (var i = 0; i < r.list.length; i++) { var p = r.list[i]; if (!p || typeof p.id !== 'string' || ids[p.id]) return false; ids[p.id] = 1; }
      return !!ids[r.cur];
    }
    function load() {
      var raw = sget(REG); broken = false;
      if (raw == null) return null;
      try { var r = JSON.parse(raw); if (valid(r)) return r; } catch (e) { }
      broken = true; return null;
    }
    function save(r) { try { sset(REG, JSON.stringify(r)); return { ok: true }; } catch (e) { return { ok: false, why: isFull(e) ? 'full' : 'error' }; } }
    function byId(r, id) { for (var i = 0; r && i < r.list.length; i++) if (r.list[i].id === id) return r.list[i]; return null; }
    function newId(r) { var n = 1; while (byId(r, 'p' + n)) n++; return 'p' + n; }
    function copyP(p) { return p ? { id: p.id, name: p.name, age: p.age || '', icon: p.icon || '' } : null; }
    function strings(o) { var out = {}; if (o && typeof o === 'object') for (var k in o) if (own(o, k) && typeof o[k] === 'string' && isProfileKey(k)) out[k] = o[k]; return out; }

    // write `data` as the live per-learner keys, replacing what is there; on failure put `back` back
    function writeLive(data, back) {
      liveKeys().forEach(sdel);
      var done = [];
      try { for (var k in data) if (own(data, k)) { sset(k, data[k]); done.push(k); } return { ok: true }; }
      catch (e) {
        done.forEach(sdel);
        if (back) for (var b in back) if (own(back, b)) { try { sset(b, back[b]); } catch (e2) { } }
        return { ok: false, why: isFull(e) ? 'full' : 'error' };
      }
    }

    function switchNow(to) {
      var r = load(); if (!r) return { ok: false, why: broken ? 'damaged' : 'off' };
      var drop = r.drop; delete r.pending; delete r.drop;
      if (!byId(r, to)) { save(r); return { ok: false, why: 'missing' }; }
      if (to === r.cur) { if (drop && drop !== r.cur) dropSlot(r, drop); return save(r); }
      var from = r.cur, cur = liveData(), next = strings(r.slots[to]);
      var orig = JSON.parse(JSON.stringify(r));
      r.slots[from] = cur; delete r.slots[to]; r.cur = to;
      if (drop === from) dropSlot(r, from);
      Object.keys(cur).forEach(sdel); // free the space first
      var s1 = save(r);
      if (!s1.ok) { for (var k in cur) { try { sset(k, cur[k]); } catch (e) { } } save(orig); return s1; }
      var s2 = writeLive(next, null);
      if (!s2.ok) { // put everything back as it was
        try { sset(REG, JSON.stringify(orig)); } catch (e) { }
        for (var k2 in cur) { try { sset(k2, cur[k2]); } catch (e) { } }
        return s2;
      }
      return { ok: true, from: from, to: to };
    }
    function dropSlot(r, id) { r.list = r.list.filter(function (p) { return p.id !== id; }); delete r.slots[id]; }

    var api = {
      REG: REG, SHARED: SHARED.slice(), EXTRA: EXTRA.slice(), ICONS: ICONS.slice(), isProfileKey: isProfileKey,
      on: function () { return !!load(); },
      damaged: function () { load(); return broken; },
      raw: function () { return sget(REG); },
      forget: function () { sdel(REG); broken = false; },
      list: function () { var r = load(); return r ? r.list.map(copyP) : []; },
      active: function () { var r = load(); return r ? copyP(byId(r, r.cur)) : null; },
      get: function (id) { return copyP(byId(load(), id)); },
      label: function (p) { if (!p) return ''; var a = String(p.age || '').trim(); return p.name + (a ? ' (' + (/^\d+$/.test(a) ? 'age ' + a : a) + ')' : ''); },
      add: function (o, firstName) {
        o = o || {}; var name = clean(o.name, 30); if (!name) return { ok: false, why: 'name' };
        var r = load(); if (broken) return { ok: false, why: 'damaged' };
        if (!r) r = { v: 1, cur: 'p1', list: [{ id: 'p1', name: clean(firstName, 30) || 'Me', age: '', icon: '🦉' }], slots: {} };
        if (r.list.length >= 12) return { ok: false, why: 'many' };
        var p = { id: newId(r), name: name, age: clean(o.age, 20), icon: ICONS.indexOf(o.icon) >= 0 ? o.icon : ICONS.filter(function (ic) { return !r.list.some(function (q) { return q.icon === ic; }); })[0] || ICONS[0] };
        r.list.push(p); r.slots[p.id] = {};
        var s = save(r); if (!s.ok) return s;
        return { ok: true, profile: copyP(p) };
      },
      update: function (id, o) {
        var r = load(), p = byId(r, id); if (!p) return { ok: false, why: 'missing' };
        if (o.name != null) { var n = clean(o.name, 30); if (!n) return { ok: false, why: 'name' }; p.name = n; }
        if (o.age != null) p.age = clean(o.age, 20);
        if (o.icon != null && ICONS.indexOf(o.icon) >= 0) p.icon = o.icon;
        return save(r);
      },
      // delete: another learner at once; the active learner via a switch on the next load (returns { ok, reload: true })
      remove: function (id) {
        var r = load(), p = byId(r, id); if (!p) return { ok: false, why: 'missing' };
        if (r.list.length === 1) { // the last learner: keep the saves in the normal keys, stop using profiles
          sdel(REG); return { ok: true, off: true };
        }
        if (id !== r.cur) { dropSlot(r, id); return save(r); }
        r.pending = r.list.filter(function (q) { return q.id !== id; })[0].id; r.drop = id;
        var s = save(r); s.reload = true; return s;
      },
      requestSwitch: function (id) {
        var r = load(); if (!r || !byId(r, id)) return { ok: false, why: 'missing' };
        if (id === r.cur) return { ok: true, same: true };
        r.pending = id; return save(r);
      },
      switchNow: switchNow,
      snapshot: function (id) { var r = load(); if (!r) return liveData(); return id === r.cur ? liveData() : strings(r.slots[id]); },
      getKey: function (id, k) {
        var r = load(); if (!r || !id || id === r.cur || !byId(r, id)) return sget(k);
        var s = r.slots[id] || {}; return own(s, k) && typeof s[k] === 'string' ? s[k] : null;
      },
      setKey: function (id, k, v) {
        var r = load();
        try {
          if (!r || !id || id === r.cur || !byId(r, id)) { if (v == null) sdel(k); else sset(k, v); return { ok: true }; }
        } catch (e) { return { ok: false, why: isFull(e) ? 'full' : 'error' }; }
        if (!isProfileKey(k)) return { ok: false, why: 'shared' };
        r.slots[id] = r.slots[id] || {}; if (v == null) delete r.slots[id][k]; else r.slots[id][k] = String(v);
        return save(r);
      },
      hasProgress: function () {
        var r = load(), slots = r ? Object.keys(r.slots).map(function (id) { return strings(r.slots[id]); }) : [];
        return liveKeys().some(function (k) { return worth(k, sget(k)); }) || PLANS.some(function (k) { return worth(k, sget(k)); }) ||
          slots.some(function (o) { return Object.keys(o).some(function (k) { return worth(k, o[k]); }); });
      },
      size: function () { var n = 0; keys().forEach(function (k) { n += k.length + (sget(k) || '').length; }); return n * 2; },
      exportData: function (ids, withShared) {
        var r = load(), out = { site: 'teddyrookbook.com', kind: 'trb-profiles', v: 1, saved: new Date().toISOString(), profiles: [] };
        var list = r ? r.list : [{ id: '', name: 'Me', age: '', icon: '' }];
        list.forEach(function (p) { if (!ids || ids.indexOf(p.id) >= 0) out.profiles.push({ name: p.name, age: p.age || '', icon: p.icon || '', data: api.snapshot(p.id) }); });
        if (withShared) { out.shared = {}; keys().forEach(function (k) { if (k !== REG && k !== BK && k.indexOf('trb-') === 0 && !isProfileKey(k)) { var v = sget(k); if (v != null) out.shared[k] = v; } }); }
        return out;
      },
      // import learners from a file object. A learner whose name is already here: replaced if opt.replace(name) says so,
      // otherwise added as a new learner. An old "progress" file ({ site, data }) becomes one learner named opt.name.
      importData: function (o, opt) {
        opt = opt || {};
        if (!o || o.site !== 'teddyrookbook.com') return { ok: false, why: 'file' };
        var items = [];
        if (o.kind === 'trb-profiles' && Array.isArray(o.profiles)) items = o.profiles.filter(function (p) { return p && typeof p.data === 'object'; });
        else if (o.data && typeof o.data === 'object') items = [{ name: opt.name || 'Learner', age: '', icon: '', data: o.data }];
        if (!items.length) return { ok: false, why: 'file' };
        var added = [], replaced = [];
        for (var i = 0; i < items.length; i++) {
          var it = items[i], name = clean(it.name, 30) || 'Learner', data = strings(it.data), r = load();
          var same = r ? r.list.filter(function (p) { return p.name.toLowerCase() === name.toLowerCase(); })[0] : null;
          if (same && opt.replace && opt.replace(name)) {
            if (same.id === r.cur) { var back = liveData(), w = writeLive(data, back); if (!w.ok) return w; }
            else { r.slots[same.id] = data; var s0 = save(r); if (!s0.ok) return s0; }
            replaced.push(name); continue;
          }
          var a = api.add({ name: name, age: it.age, icon: it.icon }, opt.firstName); if (!a.ok) return a;
          r = load(); r.slots[a.profile.id] = data; var s1 = save(r);
          if (!s1.ok) { api.remove(a.profile.id); return s1; }
          added.push(name);
        }
        var sh = 0;
        if (o.shared && typeof o.shared === 'object' && opt.shared && opt.shared()) {
          for (var k in o.shared) if (own(o.shared, k) && typeof o.shared[k] === 'string' && k !== REG && k !== BK && k.indexOf('trb-') === 0 && !isProfileKey(k)) {
            try { sset(k, o.shared[k]); sh++; } catch (e) { return { ok: false, why: isFull(e) ? 'full' : 'error', added: added, replaced: replaced }; }
          }
        }
        return { ok: true, added: added, replaced: replaced, shared: sh };
      },
      // on page load: finish a pending switch, keep other tabs in step, and load the menu when profiles are in use
      boot: function (W) {
        var r = load(), msg = '';
        if (r && r.pending) {
          var res = switchNow(r.pending);
          if (!res.ok) msg = res.why === 'full' ? 'full' : 'error';
        }
        if (msg) { try { W.sessionStorage.setItem('trb-profiles-msg', msg); } catch (e) { } }
        if (!W || !W.document) return;
        var cur = (load() || {}).cur || null;
        try {
          W.addEventListener('storage', function (e) {
            if (e.key !== REG && e.key !== null) return;
            var now = (load() || {}).cur || null;
            if (now !== cur) W.location.reload(); // another tab switched learner: show this one's work, not a stale copy
          });
        } catch (e) { }
        var path = (W.location && W.location.pathname) || '';
        if (load() || broken || /\/progress\/$/.test(path)) {
          var s = W.document.createElement('script'), me = W.document.currentScript;
          s.src = (me && me.getAttribute('data-ui')) || '/js/profiles-ui.js';
          W.document.head.appendChild(s);
        }
      }
    };
    return api;
  }
  return { create: create, SHARED: SHARED, EXTRA: EXTRA, isProfileKey: isProfileKey };
});

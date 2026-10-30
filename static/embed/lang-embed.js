/* Language embeds (/embed/lang-word/, /embed/lang-drill/): shared helpers on window.TRBLang.
   - opts(): ?lang=grc|lat (default grc) and ?set=gospels|classical (default gospels), checked against the allowed values.
   - day(): days since 1970-01-01 in the visitor's own calendar, so a day's pick is the same for everyone on that date.
   - sources(set): shows only the "Sources and credits" list for this variant (layouts/_partials/embed/sources.html).
   - get(file): one data file from /embed/lang/ (built by scripts/embed/build-lang-embeds.py; never the ESV).
   Stores nothing. */
(function (W, D) {
  'use strict';
  var q; try { q = new URLSearchParams(W.location.search); } catch (e) { q = { get: function () { return null; } }; }
  function opt(name, allowed, def) { var v = String(q.get(name) || '').toLowerCase(); return allowed.indexOf(v) >= 0 ? v : def; }
  var base = (D.querySelector('meta[name="emb-lang-base"]') || {}).content || '/embed/lang/';
  W.TRBLang = {
    opts: function () { return { lang: opt('lang', ['grc', 'lat'], 'grc'), set: opt('set', ['gospels', 'classical'], 'gospels') }; },
    day: function () { var d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); },
    today: function () { return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); },
    sources: function (set) {
      var lists = D.querySelectorAll('.emb-srclist');
      for (var i = 0; i < lists.length; i++) lists[i].hidden = lists.length > 1 && lists[i].getAttribute('data-set') !== set;
    },
    get: function (file) {
      return fetch(base + file).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    }
  };
})(window, document);

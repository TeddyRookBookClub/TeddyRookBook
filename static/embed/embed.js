/* Embeds (/embed/…): runs in the <head> of every embed page, before it paints.
   - Theme: ?theme=light | dark | auto (auto, the default, follows the visitor's device and changes with it).
   - Storage: checks once whether this frame may use localStorage (a browser keeps a framed page's storage apart from the
     same site opened in its own tab, and some block it in frames altogether). Pages read TRBEmbed.canSave; when it is
     false the bottom note says progress lasts only while the page is open. Nothing else is stored by this file.
   - TRBEmbed.open(url): points the "Open on Teddy Rook Book" link at the same thing on the full site.
   No tracking, no requests to other sites. */
(function (W, D) {
  'use strict';
  var q; try { q = new URLSearchParams(W.location.search); } catch (e) { q = { get: function () { return null; } }; }
  var want = String(q.get('theme') || 'auto').toLowerCase(), mq = null;
  try { mq = W.matchMedia('(prefers-color-scheme: dark)'); } catch (e) { }
  function apply() {
    var dark = want === 'dark' || (want !== 'light' && !!(mq && mq.matches));
    D.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
  apply();
  if (want !== 'light' && want !== 'dark' && mq) { try { mq.addEventListener('change', apply); } catch (e) { try { mq.addListener(apply); } catch (e2) { } } }

  // ?preview=1 (the live previews on /developers/, which run on this site itself): keep everything in memory, so trying a
  // preview never touches the visitor's own progress on the site. Not part of the documented addresses.
  var preview = q.get('preview') === '1';
  if (preview) {
    try {
      var mem = {}, fake = {
        getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
        setItem: function (k, v) { mem[k] = String(v); }, removeItem: function (k) { delete mem[k]; },
        clear: function () { mem = {}; }, key: function (i) { return Object.keys(mem)[i] || null; }
      };
      Object.defineProperty(fake, 'length', { get: function () { return Object.keys(mem).length; } });
      Object.defineProperty(W, 'localStorage', { configurable: true, get: function () { return fake; } });
    } catch (e) { }
  }
  var canSave = false;
  if (!preview) try { var k = 'trb-embed-test', s = W.localStorage; s.setItem(k, '1'); canSave = s.getItem(k) === '1'; s.removeItem(k); } catch (e) { canSave = false; }

  var E = W.TRBEmbed = {
    canSave: canSave,
    framed: (function () { try { return W.self !== W.top; } catch (e) { return true; } })(),
    open: function (url) { var a = D.getElementById('emb-open'); if (a && url) a.href = new URL(url, W.location.href).href; }
  };
  D.addEventListener('DOMContentLoaded', function () {
    var n = D.getElementById('emb-save'); if (!n) return;
    n.textContent = preview ? 'A preview: nothing is saved.' : canSave ?(E.framed ? 'Progress is saved in this browser, for this frame only.' : 'Progress is saved in this browser.')
      : 'This frame can’t save progress, so it lasts while the page is open.';
  });
})(window, document);

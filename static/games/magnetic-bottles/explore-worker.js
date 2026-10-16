/* Magnetic Bottles: the Web Worker that does the heavy numbers for "What each setting does" and "Find a better bottle",
   so the page never stalls. It loads physics.js and explore.js (their addresses arrive in the first message) and runs the
   jobs in explore.js, sending results back in small batches. */
(function () {
  'use strict';
  var R = null, queue = [];
  self.onmessage = function (e) {
    var d = e.data;
    if (d.init) {
      importScripts.apply(self, d.init);
      R = self.MBExplore.runner(function (list) { self.postMessage(list); }, 40);
      queue.forEach(handle); queue = [];
      return;
    }
    if (!R) queue.push(d); else handle(d);
  };
  function handle(d) { if (d.cancel) R.cancel(d.cancel); else R.start(d.ch, d.id, d.type, d.args); }
})();

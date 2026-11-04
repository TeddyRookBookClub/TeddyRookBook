/* gb-euclid-primes: Euclid's proof that the primes never run out, one of the two proofs Hardy chose to show what
   beautiful mathematics looks like. Pick any finite list of primes; multiply them and add 1. The new number leaves
   remainder 1 when divided by every prime on the list, so its prime factors are all new primes. Our own design.
   opts: pick: [2, 3, 5]. */
(function () {
  var V = ML.viz; if (!V) return;
  var PR = [2, 3, 5, 7, 11, 13, 17, 19, 23];
  function factor(n) { var f = [], d = 2; while (n > 1 && d * d <= n) { while (n % d === 0) { f.push(d); n /= d; } d++; } if (n > 1) f.push(n); return f; }
  V.register('gb-euclid-primes', function (el, o) {
    o = o || {};
    var on = {}; (o.pick || [2, 3, 5]).forEach(function (p) { on[p] = true; });
    var box = V.el('div', 'gb-ep'); el.appendChild(box);
    box.appendChild(V.el('p', 'gb-ep-task', 'Choose the primes on your list (pretend they are <b>all</b> the primes there are):'));
    var row = V.el('div', 'gb-ep-row'); box.appendChild(row);
    var btns = PR.map(function (p) {
      var b = V.el('button', 'gb-ep-b', String(p)); b.type = 'button';
      b.addEventListener('click', function () { on[p] = !on[p]; if (!Object.keys(on).some(function (k) { return on[k]; })) on[p] = true; show(); });
      row.appendChild(b); return b;
    });
    var res = V.el('div', 'gb-ep-res'); box.appendChild(res);
    function show() {
      var list = PR.filter(function (p) { return on[p]; }), prod = list.reduce(function (a, b) { return a * b; }, 1), N = prod + 1, f = factor(N);
      btns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(!!on[PR[i]])); });
      var uniq = f.filter(function (x, i) { return f.indexOf(x) === i; });
      res.innerHTML = '<p><b>Multiply and add 1:</b> ' + list.join(' × ') + ' + 1 = <b>' + N.toLocaleString('en-US') + '</b></p>' +
        '<p><b>Divide by each prime on the list:</b> the remainder is always 1 (' + list.slice(0, 4).map(function (p) { return N.toLocaleString('en-US') + ' ÷ ' + p + ' leaves ' + (N % p); }).join('; ') + (list.length > 4 ? '; …' : '') + ').</p>' +
        '<p><b>Its prime factors:</b> ' + (f.length === 1 ? N.toLocaleString('en-US') + ' is itself prime' : f.join(' × ')) + '. ' +
        'New primes, not on the list: <b>' + uniq.join(', ') + '</b>.</p>' +
        '<p class="gb-ep-end">So no finite list holds every prime. Notice that the new number is not always prime itself (try 2, 3, 5, 7, 11, 13); it only has to have a prime factor that the list missed.</p>';
    }
    show();
    return {};
  });
})();

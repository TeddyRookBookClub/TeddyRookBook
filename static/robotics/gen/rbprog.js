/* Robotics Ladder: generators for Programming Robots (course key rbprog), 5 topics. Code is shown in <code> blocks
   (never typeset), Python for the Raspberry Pi topics and C for the microcontroller ones. */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  function fx(x) { return +(+x).toPrecision(12); }
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  function tv(x) { x = fx(x); return Math.abs(x) >= 1000 ? T.commas(x) : String(x); }
  function A(x, n, rtol) { return { t: 'num', v: String(sg(x, n || 3)), rtol: rtol || 0.02 }; }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  function code(lines) { return '<pre class="rb-code" style="overflow-x:auto;max-width:100%;padding:.5rem .7rem;border-radius:8px;background:rgba(127,127,127,.12)"><code>' + lines.join('\n').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code></pre>'; }

  // ---------- rbprog.trace-code
  G('rbprog.trace-code', function (R, ctx) {
    var kind = by(ctx, R.pick(['sum', 'count']), R.pick(['sum', 'while', 'count']), R.pick(['while', 'sum2', 'count']));
    if (kind === 'sum' || kind === 'sum2') {
      var a = R.int(0, 4), b = a + R.int(3, 7), st = kind === 'sum2' ? R.int(2, 3) : 1, tot = 0, seq = [];
      for (var i = a; i < b; i += st) { tot += i; seq.push(i); }
      return {
        q: 'What does this Python program print?' + code(['total = 0', 'for i in range(' + a + ', ' + b + (st > 1 ? ', ' + st : '') + '):', '    total = total + i', 'print(total)']),
        a: AX(tot), steps: ['range(' + a + ', ' + b + (st > 1 ? ', ' + st : '') + ') gives ' + seq.join(', ') + ' (it stops before ' + b + ').', 'Add them: $' + seq.join(' + ') + ' = ' + tot + '$.'],
        hint: 'range stops before its second number.'
      };
    }
    if (kind === 'while') {
      var x = R.int(1, 5), m = R.pick([2, 3]), lim = R.int(20, 120), n = 0, xs = [x];
      while (x < lim) { x *= m; n++; xs.push(x); }
      var askN = R.coin();
      return {
        q: (askN ? 'How many times does the loop body run?' : 'What is the value of x when the loop ends?') + code(['x = ' + xs[0], 'while x < ' + lim + ':', '    x = x * ' + m]),
        a: AX(askN ? n : x), steps: ['Write each value: ' + xs.join(', ') + '.', 'The loop stops when x is no longer less than ' + lim + ', after ' + n + ' passes, with x = ' + x + '.']
      };
    }
    var th = R.int(20, 60), rd = R.ints(R.int(5, 8), 5, 95), c = rd.filter(function (v) { return v > th; }).length;
    return {
      q: 'A distance sensor gave these readings. What does the program print?' + code(['readings = [' + rd.join(', ') + ']', 'far = 0', 'for r in readings:', '    if r > ' + th + ':', '        far = far + 1', 'print(far)']),
      a: AX(c), steps: ['Count the readings greater than ' + th + ' (not equal): ' + (rd.filter(function (v) { return v > th; }).join(', ') || 'none') + '.', 'That is ' + c + '.']
    };
  });

  // ---------- rbprog.sensor-decisions
  G('rbprog.sensor-decisions', function (R, ctx) {
    var kind = by(ctx, 'ok', R.pick(['ok', 'bug']), R.pick(['bug', 'ok']));
    var a = R.int(2, 6) * 5, b = a + R.int(2, 8) * 5, d = R.int(1, 30) * 3;
    var acts = ['stop()', 'slow()', 'go()', 'turn()'];
    if (kind === 'ok') {
      var right = d < a ? 'stop()' : d < b ? 'slow()' : 'go()';
      return {
        q: 'The distance sensor reads $' + d + '$ cm. Which function runs?' + code(['if d < ' + a + ':', '    stop()', 'elif d < ' + b + ':', '    slow()', 'else:', '    go()']),
        a: MC(right, acts), steps: ['Python checks the tests from the top and runs the first one that is true.', d < a ? d + ' < ' + a + ' is true, so stop() runs.' : d < b ? d + ' < ' + a + ' is false; ' + d + ' < ' + b + ' is true, so slow() runs.' : 'Both tests are false, so the else part runs: go().']
      };
    }
    d = R.int(1, a - 1);
    return {
      q: 'Someone wrote the tests in this order. The sensor reads $' + d + '$ cm, very close. Which function runs?' + code(['if d < ' + b + ':', '    slow()', 'elif d < ' + a + ':', '    stop()', 'else:', '    go()']),
      a: MC('slow()', acts), steps: [d + ' < ' + b + ' is already true, so slow() runs and the elif is never checked.', 'With this order the robot can never stop. Put the narrow test, d < ' + a + ', first.']
    };
  });

  // ---------- rbprog.state-machines
  var RULES = { WAIT: { button: 'DRIVE' }, DRIVE: { obstacle: 'AVOID', arrived: 'WAIT' }, AVOID: { clear: 'DRIVE' } };
  var INPUTS = ['button', 'obstacle', 'clear', 'arrived'];
  G('rbprog.state-machines', function (R, ctx) {
    var kind = by(ctx, 'final', R.pick(['final', 'count']), R.pick(['count', 'final']));
    var n = by(ctx, R.int(3, 4), R.int(4, 6), R.int(5, 7)), seq = [], s = 'WAIT', hist = ['WAIT'], av = 0;
    for (var i = 0; i < n; i++) { var inp = R.pick(INPUTS); seq.push(inp); var nx = RULES[s][inp] || s; if (nx === 'AVOID' && s !== 'AVOID') av++; s = nx; hist.push(s); }
    var rules = 'Rules: WAIT goes to DRIVE on <i>button</i>. DRIVE goes to AVOID on <i>obstacle</i> and to WAIT on <i>arrived</i>. AVOID goes back to DRIVE on <i>clear</i>. Any other input leaves the state as it is.';
    if (kind === 'final') return {
      q: 'A delivery robot starts in WAIT. ' + rules + ' The inputs come in this order: <b>' + seq.join(', ') + '</b>. Which state is it in at the end?',
      a: MC(s, ['WAIT', 'DRIVE', 'AVOID']), steps: ['Follow one input at a time: ' + hist.join(' → ') + '.', 'It ends in ' + s + '.']
    };
    return {
      q: 'A delivery robot starts in WAIT. ' + rules + ' The inputs: <b>' + seq.join(', ') + '</b>. How many times does it go into AVOID?',
      a: AX(av), steps: ['The states in order: ' + hist.join(' → ') + '.', 'Count the moves into AVOID: ' + av + '.']
    };
  });

  // ---------- rbprog.loop-timing
  G('rbprog.loop-timing', function (R, ctx) {
    var kind = by(ctx, R.pick(['period', 'count']), R.pick(['period', 'spare', 'max']), R.pick(['spare', 'max', 'count']));
    var f = R.pick([10, 20, 25, 40, 50, 100, 200, 250, 500, 1000]);
    if (kind === 'period') return {
      q: 'A control loop runs at $' + f + '\\ \\text{Hz}$. How long is one pass, in milliseconds?',
      a: AX(1000 / f), unit: 'ms', steps: ['Period $= \\dfrac{1}{f} = \\dfrac{1}{' + f + '}\\ \\text{s}$.', '$= \\dfrac{1000}{' + f + '}\\ \\text{ms} = ' + fx(1000 / f) + '\\ \\text{ms}$.']
    };
    if (kind === 'count') { var t = R.int(2, 30); return {
      q: 'A loop runs at $' + f + '\\ \\text{Hz}$ for $' + t + '$ seconds. How many passes is that?',
      a: AX(f * t), steps: ['$' + f + ' \\times ' + t + ' = ' + tv(f * t) + '$ passes.']
    }; }
    if (kind === 'spare') { f = R.pick([10, 20, 25, 40, 50, 100]); var per = 1000 / f, w = sg(per * R.int(2, 8) / 10, 2); return {
      q: 'A loop runs at $' + f + '\\ \\text{Hz}$. Reading the sensors and computing the command take $' + w + '\\ \\text{ms}$. How many milliseconds are left to wait in each pass?',
      a: A(per - w, 3), unit: 'ms', steps: ['One pass lasts $\\dfrac{1000}{' + f + '} = ' + fx(per) + '\\ \\text{ms}$.', 'Left over: $' + fx(per) + ' - ' + w + ' = ' + fx(per - w) + '\\ \\text{ms}$. If the work ever takes longer than the period, the loop falls behind.']
    }; }
    var wk = R.pick([0.5, 1, 2, 2.5, 4, 5, 8, 10, 12.5, 20]);
    return {
      q: 'One pass of a loop takes $' + wk + '\\ \\text{ms}$ of work and no waiting. What is the fastest rate it can run, in hertz?',
      a: A(1000 / wk, 3), unit: 'Hz', steps: ['$f = \\dfrac{1}{T} = \\dfrac{1000}{' + wk + '}\\ \\text{Hz} = ' + tv(sg(1000 / wk, 4)) + '\\ \\text{Hz}$.']
    };
  });

  // ---------- rbprog.integers-and-bits
  G('rbprog.integers-and-bits', function (R, ctx) {
    var kind = by(ctx, R.pick(['add', 'set']), R.pick(['add', 'sub', 'set', 'clear']), R.pick(['sub', 'clear', 'test', 'add']));
    if (kind === 'add' || kind === 'sub') {
      var a = kind === 'add' ? R.int(200, 255) : R.int(0, 40), b = kind === 'add' ? R.int(10, 90) : R.int(41, 120), r = kind === 'add' ? (a + b) % 256 : ((a - b) % 256 + 256) % 256;
      return {
        q: 'In C on a microcontroller: <code>uint8_t x = ' + a + '; x = x ' + (kind === 'add' ? '+' : '-') + ' ' + b + ';</code> A uint8_t holds 0 to 255 and wraps around. What is x now?',
        a: AX(r), steps: [kind === 'add' ? '$' + a + ' + ' + b + ' = ' + (a + b) + '$, which is too big for 8 bits.' : '$' + a + ' - ' + b + ' = ' + (a - b) + '$, which is below 0.', 'Wrap by 256: $' + (a + (kind === 'add' ? b : -b)) + (kind === 'add' ? ' - 256' : ' + 256') + ' = ' + r + '$.']
      };
    }
    var v = R.int(0, 255), n = R.int(0, 7), m = 1 << n;
    if (kind === 'set') return {
      q: '<code>uint8_t reg = ' + v + '; reg = reg | (1 &lt;&lt; ' + n + ');</code> What is reg now (in decimal)?',
      a: AX(v | m), steps: ['$1 \\ll ' + n + ' = ' + m + '$, which is bit ' + n + '.', 'OR turns that bit on and leaves the rest: ' + v + ' in binary is ' + v.toString(2).padStart(8, '0') + '; with bit ' + n + ' set it is ' + (v | m).toString(2).padStart(8, '0') + ' = ' + (v | m) + '.']
    };
    if (kind === 'clear') return {
      q: '<code>uint8_t reg = ' + v + '; reg = reg &amp; ~(1 &lt;&lt; ' + n + ');</code> What is reg now (in decimal)?',
      a: AX(v & ~m & 255), steps: ['$\\sim(1 \\ll ' + n + ')$ has every bit on except bit ' + n + '.', 'AND keeps every bit except bit ' + n + ': ' + v.toString(2).padStart(8, '0') + ' becomes ' + (v & ~m & 255).toString(2).padStart(8, '0') + ' = ' + (v & ~m & 255) + '.']
    };
    return {
      q: '<code>uint8_t reg = ' + v + ';</code> What is <code>(reg &gt;&gt; ' + n + ') &amp; 1</code>? (It tests bit ' + n + '.)',
      a: AX((v >> n) & 1), steps: [v + ' in binary is ' + v.toString(2).padStart(8, '0') + ' (bit 0 is on the right).', 'Bit ' + n + ' is ' + ((v >> n) & 1) + '.']
    };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));

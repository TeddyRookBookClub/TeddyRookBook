/* Robotics Ladder: generators for Robot Vision (course key rbvision), 4 topics.
   Image memory (width × height × channels bytes), a redness score r − (g + b)/2 compared with a threshold, the center
   column of the pixels that pass and the steering error from the image center, and the pinhole model h = f H / Z. */
(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  function fx(x) { return +(+x).toPrecision(12); }
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  function tv(x) { x = fx(x); return Math.abs(x) >= 1000 ? T.commas(x) : String(x); }
  function A(x, n, rtol) { return { t: 'num', v: String(sg(x, n || 3)), rtol: rtol || 0.02 }; }
  function AT(x, tol) { return { t: 'num', v: String(sg(x, 3)), tol: tol }; }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  var SIZES = [[160, 120], [320, 240], [640, 480], [800, 600], [1280, 720], [1920, 1080], [96, 96], [128, 64]];

  // ---------- rbvision.pixels
  G('rbvision.pixels', function (R, ctx) {
    var kind = by(ctx, R.pick(['count', 'bytes']), R.pick(['bytes', 'gray']), R.pick(['rate', 'bytes', 'bits']));
    var sz = R.coin() ? R.pick(SIZES) : [R.int(4, 40) * 16, R.int(3, 30) * 16], w = sz[0], h = sz[1], n = w * h;
    if (kind === 'count') return {
      q: 'A camera image is $' + w + '$ pixels wide and $' + h + '$ pixels tall. How many pixels is that?',
      a: AX(n), steps: ['$' + w + ' \\times ' + h + ' = ' + tv(n) + '$ pixels.']
    };
    if (kind === 'bytes') return {
      q: 'A color image stores three bytes per pixel (red, green, blue). How many bytes is one $' + w + ' \\times ' + h + '$ frame?',
      a: AX(3 * n), unit: 'bytes', steps: ['Pixels: $' + w + ' \\times ' + h + ' = ' + tv(n) + '$.', 'Times 3 bytes: $' + tv(3 * n) + '$ bytes.'],
      hint: 'Do not forget the three color channels.'
    };
    if (kind === 'gray') return {
      q: 'A grayscale image stores one byte per pixel; a color image stores three. How many bytes are saved per $' + w + ' \\times ' + h + '$ frame by using grayscale?',
      a: AX(2 * n), unit: 'bytes', steps: ['Color: $3 \\times ' + tv(n) + ' = ' + tv(3 * n) + '$. Gray: $' + tv(n) + '$.', 'Saved: $' + tv(2 * n) + '$ bytes, two thirds of the color frame.']
    };
    if (kind === 'bits') { var b = R.pick([1, 4, 8, 10, 12, 16]); return {
      q: 'A depth camera stores each pixel in $' + b + '$ bits. How many different values can one pixel hold?',
      a: AX(Math.pow(2, b)), steps: ['$' + b + '$ bits give $2^{' + b + '} = ' + tv(Math.pow(2, b)) + '$ values (from 0 to ' + tv(Math.pow(2, b) - 1) + ').']
    }; }
    var fps = R.pick([10, 15, 20, 30, 60]);
    return {
      q: 'A camera sends $' + w + ' \\times ' + h + '$ color frames (3 bytes per pixel) at $' + fps + '$ frames per second, with no compression. How many megabytes per second is that? (1 MB = 1,000,000 bytes)',
      a: A(3 * n * fps / 1e6, 3), unit: 'MB/s', steps: ['One frame: $3 \\times ' + tv(n) + ' = ' + tv(3 * n) + '$ bytes.', 'Per second: $' + tv(3 * n) + ' \\times ' + fps + ' = ' + tv(3 * n * fps) + '$ bytes, about $' + sg(3 * n * fps / 1e6, 3) + '$ MB/s. That is why robots shrink or compress images.']
    };
  });

  function rgb(R, red) {
    if (red) { var r = R.int(150, 255); return [r, R.int(10, Math.min(120, r - 60)), R.int(10, Math.min(120, r - 60))]; }
    return R.pick([[R.int(10, 90), R.int(120, 230), R.int(20, 110)], [R.int(20, 90), R.int(20, 120), R.int(140, 240)], [R.int(170, 250), R.int(160, 240), R.int(150, 230)], [R.int(140, 230), R.int(80, 140), R.int(50, 120)], [R.int(20, 60), R.int(20, 60), R.int(20, 60)]]);
  }
  function score(p) { return p[0] - (p[1] + p[2]) / 2; }

  // ---------- rbvision.color-threshold
  G('rbvision.color-threshold', function (R, ctx) {
    var kind = by(ctx, 'score', R.pick(['score', 'pass']), R.pick(['pass', 'count']));
    var Tt = R.pick([40, 50, 60, 70, 80]);
    if (kind === 'score') { var p = rgb(R, R.coin()); return {
      q: 'A pixel has red $' + p[0] + '$, green $' + p[1] + '$ and blue $' + p[2] + '$. What is its redness score, $r - \\dfrac{g + b}{2}$?',
      a: AX(score(p)), steps: ['$\\dfrac{' + p[1] + ' + ' + p[2] + '}{2} = ' + fx((p[1] + p[2]) / 2) + '$.', '$' + p[0] + ' - ' + fx((p[1] + p[2]) / 2) + ' = ' + fx(score(p)) + '$.']
    }; }
    if (kind === 'pass') { var q = rgb(R, R.coin()), sc = score(q); return {
      q: 'The robot keeps pixels whose redness $r - \\dfrac{g + b}{2}$ is greater than $' + Tt + '$. Does the pixel $(' + q.join(',\\ ') + ')$ pass?',
      a: { t: 'tf', v: sc > Tt }, steps: ['Score: $' + q[0] + ' - \\dfrac{' + q[1] + ' + ' + q[2] + '}{2} = ' + fx(sc) + '$.', fx(sc) + (sc > Tt ? ' is greater than ' + Tt + ', so it passes.' : ' is not greater than ' + Tt + ', so it does not pass.')]
    }; }
    var ps = [], k, c = 0; for (k = 0; k < 5; k++) { ps.push(rgb(R, R.coin())); if (score(ps[k]) > Tt) c++; }
    return {
      q: 'Threshold: keep pixels with $r - \\dfrac{g + b}{2} > ' + Tt + '$. How many of these five pixels pass? ' + ps.map(function (p) { return '$(' + p.join(',\\ ') + ')$'; }).join(', '),
      a: AX(c), steps: ps.map(function (p) { return '$(' + p.join(',\\ ') + ')$: score $' + fx(score(p)) + '$' + (score(p) > Tt ? ', passes.' : ', no.'); }).concat(['$' + c + '$ pass.'])
    };
  });

  // ---------- rbvision.centroid-steering
  G('rbvision.centroid-steering', function (R, ctx) {
    var kind = by(ctx, 'center', R.pick(['center', 'err']), R.pick(['err', 'cmd', 'dir']));
    var W = R.pick([160, 320, 640]), n = R.int(3, 5), cols = [], base = R.int(10, W - 60), i;
    for (i = 0; i < n; i++) cols.push(base + R.int(0, 40));
    var sum = cols.reduce(function (a, b) { return a + b; }, 0), cx = sum / n, e = cx - W / 2;
    if (kind === 'center') return {
      q: 'The pixels that passed the threshold are in columns $' + cols.join(',\\ ') + '$. What is the average column, the target\'s center?',
      a: AT(cx, 0.05), steps: ['Sum: $' + cols.join(' + ') + ' = ' + sum + '$.', 'Divide by $' + n + '$: $' + sg(cx, 5) + '$.']
    };
    if (kind === 'err') { var c0 = R.int(0, W); return {
      q: 'An image is $' + W + '$ pixels wide. The target\'s center is at column $' + c0 + '$. What is the steering error, center column minus the image\'s middle column $' + W / 2 + '$?',
      a: AX(c0 - W / 2), unit: 'px', steps: ['$' + c0 + ' - ' + W / 2 + ' = ' + (c0 - W / 2) + '$ pixels.', c0 > W / 2 ? 'Positive: the target is right of center.' : c0 < W / 2 ? 'Negative: the target is left of center.' : 'Zero: dead ahead.']
    }; }
    if (kind === 'dir') { var c1 = R.int(0, W); if (c1 === W / 2) c1 += 7; return {
      q: 'Image width $' + W + '$; the target\'s center is at column $' + c1 + '$ (column 0 is the left edge). Which way should the robot turn to face it?',
      a: MC(c1 > W / 2 ? 'Right' : 'Left', ['Left', 'Right', 'Straight ahead']), steps: ['The middle column is $' + W / 2 + '$.', c1 > W / 2 ? 'The target is right of the middle, so turn right.' : 'The target is left of the middle, so turn left.']
    }; }
    var kp = R.pick([0.002, 0.005, 0.01, 0.02]), c2 = R.int(0, W), e2 = c2 - W / 2;
    return {
      q: 'Image width $' + W + '$; target center at column $' + c2 + '$. The steering command is $u = -K_p \\times \\text{error}$ in radians per second (positive turns left), with $K_p = ' + kp + '$. What is $u$?',
      a: AT(-kp * e2, 0.005), unit: 'rad/s', steps: ['Error: $' + c2 + ' - ' + W / 2 + ' = ' + e2 + '$ pixels.', '$u = -' + kp + ' \\times ' + (e2 < 0 ? '(' + e2 + ')' : e2) + ' = ' + fx(-kp * e2) + '\\ \\text{rad/s}$. ' + (e2 > 0 ? 'Negative: turn right, toward the target.' : e2 < 0 ? 'Positive: turn left, toward the target.' : 'Zero: keep going straight.')]
    };
  });

  // ---------- rbvision.pinhole-camera
  G('rbvision.pinhole-camera', function (R, ctx) {
    var kind = by(ctx, 'h', R.pick(['h', 'Z']), R.pick(['Z', 'H']));
    var f = R.pick([300, 400, 500, 600, 800, 1000]), H = R.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5, 1, 1.5, 1.8]), Z = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 8, 10]), h = f * H / Z;
    if (kind === 'h') return {
      q: 'A camera\'s focal length is $f = ' + f + '$ pixels. An object $' + H + '\\ \\text{m}$ tall stands $' + Z + '\\ \\text{m}$ away. How tall is it in the image, in pixels?',
      a: A(h, 3), unit: 'px', steps: ['$h = \\dfrac{f\\,H}{Z} = \\dfrac{' + f + ' \\times ' + H + '}{' + Z + '} \\approx ' + sg(h, 3) + '$ pixels.']
    };
    var hp = Math.max(4, Math.round(h));
    if (kind === 'Z') return {
      q: 'A ball $' + H + '\\ \\text{m}$ across looks $' + hp + '$ pixels across to a camera with $f = ' + f + '$ pixels. How far away is it, in meters?',
      a: A(f * H / hp, 3), unit: 'm', steps: ['Turn $h = fH/Z$ around: $Z = \\dfrac{f\\,H}{h}$.', '$Z = \\dfrac{' + f + ' \\times ' + H + '}{' + hp + '} \\approx ' + sg(f * H / hp, 3) + '\\ \\text{m}$.']
    };
    return {
      q: 'A camera with $f = ' + f + '$ pixels sees a door $' + Z + '\\ \\text{m}$ away; the door is $' + hp + '$ pixels tall in the image. How tall is the real door, in meters?',
      a: A(hp * Z / f, 3), unit: 'm', steps: ['$H = \\dfrac{h\\,Z}{f} = \\dfrac{' + hp + ' \\times ' + Z + '}{' + f + '} \\approx ' + sg(hp * Z / f, 3) + '\\ \\text{m}$.']
    };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));

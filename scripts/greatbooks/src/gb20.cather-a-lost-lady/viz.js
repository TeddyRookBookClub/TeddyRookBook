/* gb-cather-sweetwater: Niel's years in Sweet Water, as the pioneer age fades (our own drawing and summaries). A small prairie
   scene above the cards: the marsh shrinks and fields spread as you step forward. Uses ML.gb20kit. */
ML.viz.register('gb-cather-sweetwater', function (el, opts, V) {
  var K = ML.gb20kit, W = 400, H = 120;
  var steps = [
    { t: 'The boys\' picnic', s: 'Niel about twelve', marsh: 1, html: 'Town boys picnic in the Captain\'s meadow by the marsh. Ivy Peters hurts a woodpecker for fun; Niel falls from a tree trying to help it and is cared for by Mrs. Forrester.' },
    { t: 'The bank fails', s: 'a promise kept', marsh: 0.9, html: 'A Denver bank the Captain helped found collapses. He gives up his fortune so that its working-people depositors are paid back in full.' },
    { t: 'The Captain declines', s: 'strokes', marsh: 0.75, html: 'The Captain, now poor and ill, sits in his garden by his sundial. Niel, reading law in town, helps the Forresters and grows close to them.' },
    { t: 'Disillusion', s: 'Niel learns more', marsh: 0.6, html: 'Niel discovers that Mrs. Forrester is not the flawless lady he imagined; she has had a secret romance. He feels betrayed by his own ideal.' },
    { t: 'Ivy Peters', s: 'a new age', marsh: 0.15, html: 'After the Captain\'s death, Mrs. Forrester relies on Ivy Peters, now a sharp lawyer. He drains the marsh for wheat fields. Niel leaves Sweet Water.' },
    { t: 'Years later', s: 'news from far away', marsh: 0, html: 'Niel hears that Mrs. Forrester married a wealthy Englishman in South America and was cared for until she died. He is glad, in the end, to have known her.' }
  ];
  var F = K.frame(el, W, H, 'The Captain\'s marsh and meadow at Sweet Water, changing over the years'), sv = F.svg, ro = V.readout(el), cur = 0;
  function draw() {
    K.clear(sv);
    var st = steps[cur];
    K.S('rect', { x: 0, y: 0, width: W, height: H, 'class': 'gb20-paperbg' }, sv);
    K.S('rect', { x: 0, y: 70, width: W, height: 50, 'class': 'gb20-land' }, sv);
    var mw = 260 * st.marsh;
    if (mw > 2) K.S('ellipse', { cx: 140, cy: 92, rx: mw / 2, ry: 12, 'class': 'gb20-lake' }, sv);
    for (var i = 0; i < Math.round((1 - st.marsh) * 12); i++) K.S('line', { x1: 20 + i * 22, y1: 104, x2: 30 + i * 22, y2: 82, 'class': 'gbl-wheat' }, sv);
    K.S('path', { d: 'M300,70 L300,48 L330,32 L360,48 L360,70 Z', 'class': 'gbl-house' }, sv);
    K.S('line', { x1: 0, y1: 116, x2: W, y2: 116, 'class': 'gbl-rail' }, sv);
    for (var j = 0; j < 20; j++) K.S('line', { x1: j * 20 + 4, y1: 112, x2: j * 20 + 4, y2: 120, 'class': 'gbl-rail' }, sv);
    K.T(sv, W / 2, 16, (cur + 1) + '. ' + st.t + ' (' + st.s + ')', 'gb20-t gb20-halo');
    ro.set('<b>' + (cur + 1) + '. ' + st.t + '.</b> ' + st.html);
  }
  V.button(F.ctl, '← Back', function () { cur = Math.max(0, cur - 1); draw(); });
  V.button(F.ctl, 'Next →', function () { cur = Math.min(steps.length - 1, cur + 1); draw(); });
  draw();
});

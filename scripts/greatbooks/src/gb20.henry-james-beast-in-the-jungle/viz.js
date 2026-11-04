/* gb-james-waiting: John Marcher's years of waiting, with a beast that creeps closer each step (our own drawing and summaries). */
ML.viz.register('gb-james-waiting', function (el, opts, V) {
  var K = ML.gb20kit, W = 400, H = 170;
  var steps = [
    { t: 'In Italy', s: 'ten years before', html: 'Near Naples, the young Marcher tells May Bartram his secret: he feels sure that something rare and strange, perhaps terrible, is waiting to happen to him.' },
    { t: 'Weatherend', s: 'they meet again', html: 'At a country house, May reminds him of what he told her. She asks if it has happened yet. It hasn\'t, and she offers to watch and wait with him.' },
    { t: 'The waiting years', s: 'visits, gifts, the theater', html: 'They become close companions. Marcher thinks it would be wrong to ask a woman to share his fate, so he never asks May to marry him.' },
    { t: 'May\'s illness', s: '"It has come"', html: 'May grows ill. She hints that she knows what his fate is, and later tells him that it has already happened, and he did not notice.' },
    { t: 'Alone', s: 'after May\'s death', html: 'May dies. Marcher, a mere friend in the eyes of her family, has no special place among the mourners. He travels, but nothing happens.' },
    { t: 'The grave', s: 'the beast springs', html: 'At May\'s grave he sees a stranger\'s face full of grief. He understands at last: his fate was to be the man to whom nothing happened, because he never loved. May was his chance.' }
  ];
  var F = K.frame(el, W, H, 'Marcher\'s waiting, step by step, with the beast creeping closer'), sv = F.svg, ro = V.readout(el), cur = 0;
  function draw() {
    K.clear(sv);
    K.S('rect', { x: 0, y: 0, width: W, height: H, 'class': 'gb20-paperbg' }, sv);
    for (var i = 0; i < 9; i++) { var gx = 20 + i * 46; K.S('path', { d: 'M' + gx + ',' + (H - 40) + ' q 8,-38 16,-50 q -2,20 4,50 Z', 'class': 'gb20-land' }, sv); }
    K.S('line', { x1: 10, y1: H - 40, x2: W - 10, y2: H - 40, 'class': 'gb20-ink' }, sv);
    K.person(sv, 340, H - 64, 1.4, 'gb20-robe');
    var bx = 30 + cur * 48, by = H - 50;
    var g = K.S('g', { 'class': 'gbl-beast' }, sv);
    K.S('ellipse', { cx: bx, cy: by, rx: 26, ry: 11 }, g);
    K.S('circle', { cx: bx + 26, cy: by - 6, r: 9 }, g);
    K.S('path', { d: 'M' + (bx - 26) + ',' + by + ' q -14,-4 -18,-14', 'class': 'gbl-tail' }, sv);
    K.S('circle', { cx: bx + 29, cy: by - 9, r: 1.8, 'class': 'gbl-eye' }, sv);
    K.T(sv, W / 2, 18, (cur + 1) + '. ' + steps[cur].t + ' (' + steps[cur].s + ')', 'gb20-t gb20-halo');
    if (cur === steps.length - 1) K.T(sv, 250, 52, 'The beast was a life never lived.', 'gb20-s gb20-halo');
    ro.set('<b>' + (cur + 1) + '. ' + steps[cur].t + '.</b> ' + steps[cur].html);
  }
  V.button(F.ctl, '← Back', function () { cur = Math.max(0, cur - 1); draw(); });
  V.button(F.ctl, 'Next →', function () { cur = Math.min(steps.length - 1, cur + 1); draw(); });
  draw();
});

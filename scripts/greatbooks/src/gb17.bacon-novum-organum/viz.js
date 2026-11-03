/* gb-tables: Bacon's tables at work, on his own example: what is heat?
   Pick instances one at a time. Each goes into the table of things that are hot (presence) or of look-alikes that are
   not hot (absence). Every guess about heat that an instance contradicts is struck out (Bacon's "exclusion").
   The guess left standing is the one Bacon reached in Book II: heat is a kind of motion of the small parts of bodies.
   (The instances are Bacon's own kinds of example, in our words.) opts: quiet: true hides the summary line. */
(function () {
  var V = ML.viz; if (!V) return;
  var GUESS = [
    ['light', 'Heat is a kind of light or brightness'],
    ['sky', 'Heat comes from the sun and the heavens'],
    ['fire', 'Heat is a special fiery stuff inside things'],
    ['thin', 'Heat belongs to thin, airy things'],
    ['motion', 'Heat is a motion of the small parts of a body']
  ];
  // [label, hot?, guesses this instance rules out, why]
  var INST = [
    ['Sunlight at noon', true, [], 'Hot and bright, from the sky: it fits most guesses, so it rules out none.'],
    ['Moonlight', false, ['light', 'sky'], 'Bright and from the sky, but not hot: so heat is not just light, and not just whatever comes from the heavens.'],
    ['Boiling water', true, ['light', 'thin'], 'Hot but not bright, and water is not thin like air: strike out light and thinness. (It does bubble and churn.)'],
    ['Hands rubbed together', true, ['sky', 'fire'], 'Heat made by rubbing alone, with no fire and nothing from the sky: strike those out. Rubbing is a motion.'],
    ['A glow-worm', false, ['light'], 'It shines but is not hot: light alone is not heat.'],
    ['A red-hot iron bar', true, ['thin'], 'Iron is dense and heavy, yet very hot: heat does not need thin, airy stuff.'],
    ['Quicklime splashed with water', true, ['sky', 'fire'], 'It grows hot with no flame and no sunshine: strike out the sky and the fiery stuff.'],
    ['A horse after a hard gallop', true, ['sky', 'fire'], 'Hot from hard work and motion, not from fire or the sun.'],
    ['Air in a cool cellar', false, ['thin'], 'Thin and airy, but cool: another strike against thinness.']
  ];
  V.register('gb-tables', function (el, o) {
    o = o || {};
    var used = {}, out_ = {};
    el.classList.add('gb-tab');
    var top = V.el('p', 'gb-tab-task', 'Choose an instance. Watch which guesses about heat survive.'); el.appendChild(top);
    var pick = V.el('div', 'gb-tab-pick'); el.appendChild(pick);
    var grid = V.el('div', 'gb-tab-grid'); el.appendChild(grid);
    var pres = V.el('div', 'gb-tab-col', '<h4>Table of presence: hot</h4><ul></ul>'), abs = V.el('div', 'gb-tab-col', '<h4>Table of absence: looks alike, not hot</h4><ul></ul>');
    var gl = V.el('div', 'gb-tab-col gb-tab-guess', '<h4>Guesses about heat</h4><ul></ul>');
    grid.appendChild(pres); grid.appendChild(abs); grid.appendChild(gl);
    var why = V.readout(el);
    var sum = V.el('p', 'gb-tab-sum'); sum.setAttribute('aria-live', 'polite'); el.appendChild(sum); if (o.quiet) sum.hidden = true;
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.button(ctl, 'Start over', function () { used = {}; out_ = {}; why.set(''); render(); });
    function render() {
      pick.innerHTML = '';
      INST.forEach(function (it, i) {
        var b = V.el('button', 'ml-btn', it[0]); b.type = 'button'; b.disabled = !!used[i];
        b.addEventListener('click', function () { used[i] = 1; it[2].forEach(function (g) { if (!out_[g]) out_[g] = it[0]; }); why.set('<b>' + it[0] + ':</b> ' + it[3]); render(); });
        pick.appendChild(b);
      });
      var pu = pres.querySelector('ul'), au = abs.querySelector('ul'), gu = gl.querySelector('ul'); pu.innerHTML = au.innerHTML = gu.innerHTML = '';
      INST.forEach(function (it, i) { if (!used[i]) return; var li = V.el('li', '', it[0]); (it[1] ? pu : au).appendChild(li); });
      GUESS.forEach(function (g) { var li = V.el('li', out_[g[0]] ? 'gb-tab-x' : 'gb-tab-ok', (out_[g[0]] ? '<s>' + g[1] + '</s> <span class="gb-tab-by">(ruled out by ' + out_[g[0]].toLowerCase() + ')</span>' : g[1])); gu.appendChild(li); });
      var left = GUESS.filter(function (g) { return !out_[g[0]]; });
      sum.innerHTML = left.length === 1 ? 'One guess is left: <b>' + left[0][1].toLowerCase() + '</b>. Bacon called this his “first vintage”: a first harvest, to be tested further. Later physics agreed in a broad way: heat is the motion of atoms and molecules.' :
        left.length + ' guesses still stand. Try more instances, especially look-alikes that are not hot.';
    }
    render();
    return {};
  });
})();

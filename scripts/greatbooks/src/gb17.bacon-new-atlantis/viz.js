/* gb-salomon: the Fellows of Salomon's House (Bacon, New Atlantis), drawn as a research cycle.
   Nine teams in Bacon's order, with how many Fellows each has. Click (or Tab and Enter) a team to read its job in our
   words, Bacon's own name for it, and a rough modern counterpart. "Follow a discovery" steps an idea around the cycle.
   opts: quiet: true hides the detail line. */
(function () {
  var V = ML.viz; if (!V) return;
  var T = [
    ['Merchants of Light', 12, 'Sail abroad in secret, under other nations’ names, and bring home books, abstracts and patterns of experiments.', 'scientists who visit other labs and conferences, and bring back the latest journals'],
    ['Depredators', 3, 'Collect the experiments already written in all books.', 'librarians and reviewers who search the published literature'],
    ['Mystery-men', 3, 'Collect the experiments of the crafts and trades (a “mystery” was an old word for a craft), and of practices not yet written down.', 'researchers who learn from industry, farmers and craftspeople'],
    ['Pioneers or Miners', 3, 'Try new experiments of their own choosing.', 'exploratory or “blue-sky” research'],
    ['Compilers', 3, 'Arrange all the experiments so far into titles and tables, so patterns can be seen.', 'data scientists and the people who build databases'],
    ['Dowry-men or Benefactors', 3, 'Look through the results for things useful in life and work.', 'engineers and applied researchers'],
    ['Lamps', 3, 'After meetings of the whole house, plan new and deeper experiments.', 'scientists who design the next experiment, or review grant proposals'],
    ['Inoculators', 3, 'Carry out the experiments the Lamps planned, and report them.', 'the lab teams who run the experiments'],
    ['Interpreters of Nature', 3, 'Raise the discoveries into general observations, axioms and laws.', 'theorists who find the general law']
  ];
  V.register('gb-salomon', function (el, o) {
    o = o || {};
    var cur = -1;
    el.classList.add('gb-sal');
    var head = V.el('p', 'gb-sal-task', 'The Fellows of Salomon’s House: <b>36</b> in all, plus apprentices and helpers. Choose a team.'); el.appendChild(head);
    var ring = V.el('ol', 'gb-sal-ring'); el.appendChild(ring);
    var btns = T.map(function (t, i) {
      var li = V.el('li'), b = V.el('button', 'gb-sal-b', '<span class="gb-sal-n">' + t[1] + '</span> ' + t[0]); b.type = 'button';
      b.addEventListener('click', function () { show(i); }); li.appendChild(b); ring.appendChild(li); return b;
    });
    var det = V.el('div', 'gb-sal-det'); det.setAttribute('aria-live', 'polite'); el.appendChild(det); if (o.quiet) det.hidden = true;
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.button(ctl, 'Follow a discovery', function () { show((cur + 1) % T.length, true); });
    var STORY = ['A Merchant of Light brings home a report of a new kind of glass lens.', 'The Depredators find older books on lenses and burning-glasses.', 'The Mystery-men visit spectacle-makers and glass-grinders.', 'The Pioneers grind lenses of new shapes and try them.', 'The Compilers make a table: lens shape against how much it magnifies.', 'The Benefactors see a use: a better glass for seeing far-off ships.', 'The Lamps plan a sharper test: two lenses in a tube, at many spacings.', 'The Inoculators build the tubes, test them and report.', 'The Interpreters of Nature find the general rule linking the lenses and the magnifying power.'];
    function show(i, story) {
      cur = i; btns.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === i)); });
      var t = T[i];
      det.innerHTML = '<p><b>' + t[0] + '</b> (' + t[1] + ' Fellows): ' + t[2] + '</p><p class="gb-sal-mod">Today, roughly: ' + t[3] + '.</p>' + (story ? '<p class="gb-sal-story">Step ' + (i + 1) + ' of 9: ' + STORY[i] + '</p>' : '');
    }
    det.innerHTML = '<p>Bacon lists the teams in this order. It is a loop: what the Interpreters conclude becomes the starting point for new journeys and experiments.</p>';
    return {};
  });
})();

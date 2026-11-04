/* gbrome.epictetus-discourses: visual gb-up-to-us (gbe3, our own design). Sort cards into "up to me" and "not up to me",
   following the first line of Epictetus's Handbook, then check. A new set each round. */
var CARDS = [
  ['What I think about the rain', 1, 'Your opinion is your own act.'], ['Whether it rains on my birthday', 0, 'The weather is not up to you.'],
  ['Whether I try my best in the game', 1, 'Effort is your own choice.'], ['Whether my team wins', 0, 'The other players and luck have a say.'],
  ['How I treat my little brother', 1, 'Your actions toward others are yours.'], ['What my classmates think of me', 0, 'Reputation is in other people’s minds.'],
  ['Whether I tell the truth', 1, 'Honesty is a choice.'], ['Whether I catch a cold', 0, 'Epictetus counts the body among things not fully up to us.'],
  ['Whether I am kind when I lose', 1, 'How you respond is yours.'], ['Whether the bus is late', 0, 'Other people and events decide that.'],
  ['What I want most', 1, 'Desire is one of the things Epictetus lists as ours.'], ['How rich my family is', 0, 'Property is on his list of things not up to us.'],
  ['Whether I say sorry', 1, 'An action you choose.'], ['Whether my friend forgives me', 0, 'That is your friend’s choice.'],
  ['What I choose to read', 1, 'Your choice.'], ['Whether I get picked for a prize', 0, 'Offices and honors are on his list of things not up to us.']
];
ML.viz.register('gb-up-to-us', function (el, opts, V) {
  var n = opts.n || 6, set = [], ans = {}, checked = false, seed = 1;
  var stage = document.createElement('div'); stage.className = 'gb-stage gbu'; el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var ro = V.readout(el);
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  function deal() {
    var ups = CARDS.filter(function (c) { return c[1]; }), nots = CARDS.filter(function (c) { return !c[1]; });
    function take(a, k) { a = a.slice(); var o = []; while (o.length < k && a.length) o.push(a.splice(Math.floor(rnd() * a.length), 1)[0]); return o; }
    set = take(ups, n / 2).concat(take(nots, n / 2)); set.sort(function () { return rnd() - 0.5; }); ans = {}; checked = false; draw();
  }
  function draw() {
    var h = '<ul class="gbu-list">';
    set.forEach(function (c, i) {
      var a = ans[i], ok = checked && a != null ? (a === c[1]) : null;
      h += '<li class="gbu-card' + (ok === true ? ' ok' : ok === false ? ' bad' : '') + '"><span class="gbu-t">' + c[0] + '</span><span class="gbu-b" role="group" aria-label="' + c[0] + '">' +
        '<button type="button" data-i="' + i + '" data-v="1" aria-pressed="' + (a === 1) + '">Up to me</button><button type="button" data-i="' + i + '" data-v="0" aria-pressed="' + (a === 0) + '">Not up to me</button></span>' +
        (checked ? '<small class="gbu-why">' + (ok ? '✓ ' : ok === false ? '✗ ' : '') + c[2] + '</small>' : '') + '</li>';
    });
    stage.innerHTML = h + '</ul>';
    Array.prototype.forEach.call(stage.querySelectorAll('button'), function (b) { b.addEventListener('click', function () { ans[+b.getAttribute('data-i')] = +b.getAttribute('data-v'); if (checked) checked = false; draw(); }); });
    var done = Object.keys(ans).length;
    if (!checked) ro.set('Sorted <b>' + done + '</b> of ' + set.length + '. Epictetus: “Of things some are in our power, and others are not.”');
    else { var right = set.filter(function (c, i) { return ans[i] === c[1]; }).length; ro.set('<b>' + right + ' of ' + set.length + '</b> match Epictetus. What is up to us is our own acts: opinion, desire, aversion, choice. Body, property, reputation and offices are not.'); }
  }
  V.button(ctl, 'Check', function () { checked = true; draw(); }, 'pri');
  V.button(ctl, 'New cards', function () { deal(); });
  deal();
});

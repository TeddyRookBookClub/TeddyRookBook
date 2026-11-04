/* gb-kierkegaard-stages: the figures of Fear and Trembling, set on the "stages of life" Kierkegaard sketched across his books
   (our own summaries; uses ML.gb19kit). */
ML.viz.register('gb-kierkegaard-stages', function (el, opts, V) {
  ML.gb19kit.cards(el, V, { label: 'Kierkegaard\'s stages and the figures of Fear and Trembling', layout: 'stairs', h: 250, title: 'Higher steps ask more of a person, as Kierkegaard\'s writers describe them', items: [
    { t: 'The aesthetic life', s: 'living for interest and pleasure', html: 'In <i>Either/Or</i> (1843) Kierkegaard pictures a person who lives for what is interesting, new or beautiful, and avoids lasting commitment. He thought such a life ends in boredom and despair.' },
    { t: 'The ethical life', s: 'duty, marriage, the tragic hero', html: 'The ethical person takes on duties and keeps them. In <i>Fear and Trembling</i> the "tragic hero," such as King Agamemnon in the Greek story, gives up what he loves for a higher duty that everyone can understand: his people.' },
    { t: 'Infinite resignation', s: 'letting go of what you love', html: 'The "knight of infinite resignation" gives up what he loves most and makes peace with the loss. The book\'s narrator says he can understand this, and could do it himself.' },
    { t: 'Faith', s: 'the knight of faith', html: 'The "knight of faith" gives everything up and, at the same time, trusts that he will receive it back, "by virtue of the absurd." The narrator says he cannot understand this, only admire it. Kierkegaard adds that a knight of faith might look like an ordinary shopkeeper.' }
  ] });
});

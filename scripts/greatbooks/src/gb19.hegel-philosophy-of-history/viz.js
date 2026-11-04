/* gb-hegel-history: Hegel's four "worlds" of history, as he told it in his Berlin lectures (our summaries; uses ML.gb19kit). */
ML.viz.register('gb-hegel-history', function (el, opts, V) {
  ML.gb19kit.cards(el, V, { label: 'Hegel\'s stages of world history', layout: opts.layout || 'row', h: (opts.layout || 'row') === 'row' ? 190 : undefined, title: 'History as the growth of freedom, in Hegel\'s telling', items: [
    { t: 'The Oriental world', s: 'one is free', html: 'Hegel\'s first stage is the ancient empires of China, India and Persia. In his view only the ruler was free there. Modern historians reject this picture of Asia as unchanging and unfree; it shows how little Europeans of his day knew of Asian history and thought.' },
    { t: 'The Greek world', s: 'some are free', html: 'In the Greek city, Hegel says, citizens felt at one with their laws, as a beautiful harmony. But the Greeks kept slaves, so only some were free.' },
    { t: 'The Roman world', s: 'law and the person', html: 'Rome brought law, the legal person and property rights, but also harsh power. Hegel sees in Rome the inward turn of the person, and the rise of Christianity.' },
    { t: 'The Germanic world', s: 'all are free', html: 'Hegel\'s last stage is Christian Europe, from the Reformation to his own day. He believed it had learned that every human being, as human, is free, even if that truth was still being worked out in its laws. Critics have called this ending self-flattering to Hegel\'s own time and place.' }
  ] });
});

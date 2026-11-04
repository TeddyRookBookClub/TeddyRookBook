/* gb-mann-venice: the five chapters of Death in Venice, from discipline to collapse (our own summaries, no detail). Uses ML.gb20kit.cards. */
ML.viz.register('gb-mann-venice', function (el, opts, V) {
  ML.gb20kit.cards(el, V, { label: 'The five chapters of Death in Venice', layout: 'col', title: 'From self-command to collapse', items: [
    { t: 'Munich', s: 'a sudden restlessness', html: 'On a walk, the tired writer Aschenbach sees a strange red-haired traveler by a cemetery and feels an unexpected urge to travel far away.' },
    { t: 'The writer', s: 'a life of discipline', html: 'We learn his history: a famous author, honored for books about heroes who endure, who has ruled himself all his life by work and will.' },
    { t: 'Arrival', s: 'Venice by sea', html: 'He sails into Venice, takes a gondola to the Lido, and settles at a beach hotel. He tries to leave once, then gladly returns.' },
    { t: 'Holiday', s: 'beauty and idleness', html: 'Day after day in the sun, he lets his discipline go. His admiration for a beautiful Polish boy at the hotel grows into an unhealthy obsession, though he never speaks to him.' },
    { t: 'The plague', s: 'a secret and a choice', html: 'Cholera spreads and the city hides it. Aschenbach learns the truth but warns no one and does not leave. He grows ill and dies on the beach.' }
  ] });
});

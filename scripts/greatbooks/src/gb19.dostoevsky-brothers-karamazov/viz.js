/* gb-karamazov-family: the Karamazovs and those around them (our own summaries; uses ML.gb19kit.net). */
ML.viz.register('gb-karamazov-family', function (el, opts, V) {
  ML.gb19kit.net(el, V, { label: 'The Karamazov family and the people around them', w: 400, h: 315, hint: 'Tap a name. Gold lines are family; others show the main ties.', nodes: [
    { id: 'fy', x: 200, y: 40, t: 'Fyodor Karamazov', s: 'the father', html: 'A greedy, mocking landowner who neglected all his sons. His murder is the mystery at the center of the novel.' },
    { id: 'dm', x: 70, y: 125, t: 'Dmitri (Mitya)', s: 'eldest son, a soldier', html: 'Passionate, reckless and generous, he quarrels with his father over money and love, and is accused of the murder. In prison he finds a new sense of guilt and hope.' },
    { id: 'iv', x: 200, y: 125, t: 'Ivan', s: 'second son, a thinker', html: 'A brilliant, proud intellectual who cannot accept a world with so much suffering, and who tells Alyosha the story of the Grand Inquisitor.' },
    { id: 'al', x: 330, y: 125, t: 'Alyosha', s: 'youngest son', html: 'Gentle and loving, a novice at the monastery under the elder Zosima. The narrator calls him the hero of the book.' },
    { id: 'sm', x: 200, y: 215, t: 'Smerdyakov', s: 'the servant', html: 'The household cook, rumored to be Fyodor\'s unacknowledged son. He has taken Ivan\'s idea that "everything is lawful" in a dangerous direction.' },
    { id: 'zo', x: 345, y: 40, t: 'Father Zosima', s: 'the elder', html: 'A wise, loving monk who teaches that each person is responsible to all, and sends Alyosha out into the world.' },
    { id: 'gr', x: 65, y: 215, t: 'Grushenka', s: 'a proud young woman', html: 'Both Fyodor and Dmitri want her; in the end she stands by Dmitri.' },
    { id: 'ka', x: 200, y: 290, t: 'Katerina Ivanovna', s: 'Dmitri\'s fiancée', html: 'Proud and wounded, she is torn between Dmitri and Ivan, and her testimony at the trial is decisive.' },
    { id: 'il', x: 330, y: 215, t: 'Ilyusha and the boys', s: 'schoolboys', html: 'A sick, poor boy and his schoolmates, whom Alyosha befriends. The novel ends with Alyosha speaking to the boys at Ilyusha\'s stone.' }
  ], edges: [
    { a: 'fy', b: 'dm', cls: 'gb19-eg' }, { a: 'fy', b: 'iv', cls: 'gb19-eg' }, { a: 'fy', b: 'al', cls: 'gb19-eg' },
    { a: 'fy', b: 'sm', t: 'rumored son', cls: 'gb19-eg gb19-dash' },
    { a: 'iv', b: 'sm', t: 'ideas taken up', cls: 'gb19-ea gb19-dash' },
    { a: 'al', b: 'zo', t: 'his teacher', cls: 'gb19-ea' },
    { a: 'dm', b: 'gr', t: 'love', cls: 'gb19-ea' },
    { a: 'dm', b: 'ka', t: 'engaged', cls: 'gb19-dash', dy: 50 },
    { a: 'al', b: 'il', t: 'friend', cls: 'gb19-ea' }
  ] });
});

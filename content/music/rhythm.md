---
title: "Two-Hand Rhythm Trainer"
linkTitle: "Rhythm trainer"
description: "Tap two pads, one for each hand: together, alternating, one hand twice as fast, then 3 against 2, 4 against 3 and more, with a timeline, guide sounds and a score in milliseconds."
lead: "Tap a different rhythm with each hand. Start with both hands together and work up to 3 against 2, 4 against 3 and beyond, with a moving timeline, guide sounds you can fade out, and a score for your timing."
eyebrow: "Music · Practice tools"
icon: "🥁"
weight: 50
layout: rhythm
scripts: ["music/rhythm/core.js", "music/rhythm/sound.js", "music/rhythm/ui.js", "music/rhythm/trainer.js"]
styles: ["music/rhythm/rhythm.css"]
---

## Why practice your hands apart

Most music asks your two hands to do different things at the same time. On the piano, one hand plays the tune while the other keeps a steady accompaniment. Drummers keep a beat with one hand and play a pattern with the other. Guitarists strum with one hand and change chords with the other.

Tapping takes the instrument away and leaves only the timing. With nothing else to think about, you can feel how the two hands fit together, hear where they line up, and learn to keep one hand steady while the other does something new. When you come back to the instrument, that part of the job is already familiar.

## How to practice

1. **Go in order.** The exercises run from easy to hard. Move on when you can play one at about 85% or better.
2. **Start slow.** A slow tempo you can play well teaches more than a fast one you can't. Speed comes later, a few BPM at a time.
3. **Say it out loud.** Count the beats ("1, 2, 3, 4") or say the sentence under the timeline. Saying the rhythm helps your hands find it.
4. **Hands alone first.** If a pattern won't come, tap only one hand for a few cycles, then only the other, then put them together.
5. **Turn the guide down.** The guide sounds show you where each hand goes. When you feel the pattern, lower them or tick "Fade the guide as I get it right", and keep the rhythm yourself.
6. **Swap hands.** Every pattern can be played the other way around. Your weaker hand gets the practice it needs.

## Cross-rhythms: 3 against 2 and friends

A cross-rhythm (or polyrhythm) means two even pulses at once that don't divide into each other: three evenly spaced taps in one hand while the other makes two, in the same amount of time.

The trick is to find a grid that both fit. For 3 against 2, split the cycle into 6 equal steps. Three taps land every 2 steps (on steps 1, 3 and 5) and two taps land every 3 steps (on steps 1 and 4). Six is the smallest number that both 3 and 2 divide into evenly: their **least common multiple**. Read along the grid: both hands, then the hand playing three, then the hand playing two, then the three again. Many teachers say it as "**nice** cup of tea".

The same idea works for any pair. 4 against 3 lives on a grid of 12 steps ("pass the golden butter"), and 5 against 4 on a grid of 20. The panel called "The math" draws the grid for whichever exercise you choose, and in free mode you can try any pair from 1 to 9.

## How the score works

Each tap is matched with the nearest target for that hand. The difference in milliseconds (thousandths of a second) is your timing for that note:

- within 30 ms counts as **on time**,
- within 60 ms as **close**,
- farther away, as long as it's nearer to that note than to the next one, as **early** or **late**.

The percentage gives full credit for on-time taps and partial credit for the others. Missed notes earn nothing, and extra taps take a little away. Accents are for your ear: the score counts timing only.

If you use Bluetooth headphones, measure your delay first (in "Delay and headphones" above), or every tap will look late.

Want a plain click to practice with? Use the [metronome](/music/metronome/).

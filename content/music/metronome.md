---
title: "Metronome"
description: "A steady, precise metronome from 20 to 300 BPM, with time signatures, accents, subdivisions, a speed trainer and silent bars that teach you to keep time on your own."
lead: "A steady click to practice with. A speed trainer raises the tempo a little at a time, and silent bars teach you to keep the beat yourself."
eyebrow: "Music · Practice tools"
icon: "⏱️"
weight: 40
layout: metronome
scripts: ["music/rhythm/core.js", "music/rhythm/sound.js", "music/rhythm/ui.js", "music/rhythm/metronome.js"]
styles: ["music/rhythm/rhythm.css"]
---

## What the numbers mean

**BPM** means beats per minute. At 60 BPM you hear one click every second. At 120 BPM you hear two clicks every second.

The **beat** is the note value the tempo counts. In 2/4, 3/4 and 4/4 the beat is a quarter note. In 6/8, 9/8 and 12/8 most music is felt in groups of three eighth notes, so the metronome counts one dotted quarter note per group (you can switch it to count every eighth note instead). In 5/8 and 7/8 it counts every eighth note and leans a little on the first note of each group, such as 2 + 2 + 3.

A tempo printed in music, such as ♩ = 100, means 100 quarter-note beats per minute. Older editions write **M.M.** ♩ = 100. M.M. stands for Maelzel's Metronome, after Johann Maelzel, who patented a clockwork metronome in 1815.

## How to practice with a metronome

1. **Start slow.** Pick a tempo at which you can play the passage right every time, even if it feels too easy.
2. **Count out loud.** Say "1, 2, 3, 4" with the clicks. If the notes are shorter than the beat, turn on a subdivision and say "1 and 2 and" or "1-trip-let".
3. **Lock in.** Try to make the click disappear under your note, so you hear one sound instead of two.
4. **Speed up in small steps.** Two to five BPM at a time is plenty. The speed trainer does this for you: for example, add 4 BPM every 8 bars.
5. **Back off when it falls apart.** Go back to the last tempo where it was clean, play it there a few times, and climb again.
6. **Build your own clock.** Turn on silent bars. When the click drops out, keep counting and keep playing. When it comes back, you hear at once whether you rushed or dragged.

## Accents and subdivisions

The first beat of each bar is accented: it has a higher, stronger click, so you always know where "1" is. You can move the accent, add more, make beats soft, or silence some beats entirely. Some players silence beats 1 and 3 and keep only 2 and 4, the backbeat of jazz and pop.

Subdivisions split each beat into smaller, quieter clicks: two for eighth notes, three for triplets, four for sixteenth notes. They help you place short notes evenly.

## How this metronome keeps time

Your browser's audio system has its own very precise clock. This page plans every click a tenth of a second ahead and hands it to that clock, so the beat stays steady even when the page is busy or you switch to another tab. The beat dots follow the same clock, so what you see matches what you hear.

Want to train two hands at once? Try the [two-hand rhythm trainer](/music/rhythm/).

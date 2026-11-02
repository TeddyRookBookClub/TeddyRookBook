---
title: "A sound built from harmonics"
short: "Fourier"
sets: [music, math, patterns]
weight: 210
teaser: "Every steady musical tone is a stack of simple waves at 1, 2, 3, 4 … times its pitch. Change the stack and the same note turns into a flute, a clarinet or a buzz."
golinks:
  - { url: "/math/differential-equations/fourier-series/", why: "how to find the amounts of each harmonic" }
  - { url: "/math/differential-equations/sine-cosine-series/", why: "sine and cosine series" }
  - { url: "/math/gallery/fourier-epicycles/", why: "Fourier circles drawing any shape (Math Gallery)" }
  - { url: "/physics/waves-optics-modern-physics/standing-wave-math/", why: "standing waves as two traveling waves" }
  - { url: "/physics/physics-2/standing-waves-pipes/", why: "why a clarinet favors odd harmonics" }
  - { url: "/physics/waves-optics-modern-physics/beats/", why: "what you hear when two waves nearly match" }
  - { url: "/music/tuner/", why: "see the pitch of your own instrument" }
credits:
  - { name: "Fourier series (Grokipedia)", url: "https://grokipedia.com/page/Fourier_series", what: "Fourier's 1807 work and the idea of the series" }
  - { name: "Overtone (Grokipedia)", url: "https://grokipedia.com/page/Overtone", what: "harmonics and timbre" }
  - { name: "Standing wave (Grokipedia)", url: "https://grokipedia.com/page/Standing_wave", what: "nodes and antinodes" }
  - { name: "ISO 16:1975, Acoustics: Standard tuning frequency", url: "https://www.iso.org/standard/3601.html", what: "A = 440 Hz as the standard pitch" }
---
### Building a wave from harmonics

In 1807 the French mathematician Joseph Fourier made a bold claim while studying how heat spreads: any repeating pattern, however jagged, can be built by adding up simple sine waves whose frequencies are whole-number multiples of one base frequency. Mathematicians argued about it for decades, but it holds for every wave a musician cares about.

For sound this is the harmonic series again. A note's pitch is set by the base frequency. Its color, or **timbre**, is set by how much of each harmonic is in the mix:

$$y(t) = a_1 \sin(\omega t) + a_2 \sin(2\omega t) + a_3 \sin(3\omega t) + \cdots$$

A pure tone has only $a_1$. A clarinet's low notes lean on the odd harmonics (1, 3, 5 …), which gives them their hollow sound. A bowed violin string has all of them, falling off roughly like $1/n$, which sounds bright and buzzy. The pattern of the wave on the screen and the sound in your ear are two views of the same list of numbers.

[[viz:tri-fourier|Drag the bars to set how much of each harmonic goes in, or start from a preset. The faint curves are the harmonics; the bold curve is their sum. Then listen: same pitch, different sound.]]

> **Myth vs fact.** Some websites claim that tuning to A = 432 Hz is "natural" or healing, or that special "Solfeggio frequencies" repair the body. There is no good evidence for either. The usual standard, A = 440 Hz, was agreed for convenience so that orchestras and instrument makers match (it became an international standard, ISO 16, in 1975). Any choice of A works musically; what makes notes blend is the ratios between them, not one magic number.

### Standing waves are patterns in time and space

Each harmonic is a **standing wave**: a shape that stays in place and simply swells up and down. On a string the shapes are sine curves with 1, 2, 3 … loops. On a drum or a plate they become the patterns you can see elsewhere on this page. The same idea, splitting a complicated motion into simple standing patterns, runs through all four corners of the diagram.

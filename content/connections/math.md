---
title: "Times tables on a circle"
short: "Number and shape"
sets: [math]
weight: 20
teaser: "Put numbers around a circle, join each one to its double, and a heart shape appears. The math is clock arithmetic."
golinks:
  - { url: "/math/number-theory/modular-arithmetic/", why: "counting around a circle: arithmetic mod n" }
  - { url: "/math/precalculus/polar-graphs/", why: "the cardioid as a polar graph" }
  - { url: "/math/precalculus/unit-circle-sine-cosine/", why: "placing points evenly on a circle" }
  - { url: "/math/gallery/fourier-epicycles/", why: "more curves drawn by circles" }
credits:
  - { name: "Cardioid (Grokipedia)", url: "https://grokipedia.com/page/Cardioid", what: "the heart-shaped curve and how it arises as an envelope of lines" }
  - { name: "Nephroid (Grokipedia)", url: "https://grokipedia.com/page/Nephroid", what: "the two-cusped curve from the 3 times table" }
  - { name: "Epicycloid (Grokipedia)", url: "https://grokipedia.com/page/Epicycloid", what: "the family of curves with k − 1 points" }
  - { name: "Modular arithmetic (Grokipedia)", url: "https://grokipedia.com/page/Modular_arithmetic", what: "counting around a circle" }
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
---
### Curves hiding in a times table

Space 200 points evenly around a circle and number them 0 to 199. Now join each point to its double: 1 to 2, 2 to 4, 3 to 6, and so on. When the numbers pass 199, keep counting around the circle, so 150 joins 300, which is point 100. That is **clock arithmetic**, or arithmetic mod 200.

No single line is curved, but together they outline a smooth heart-shaped curve called a **cardioid**. The 3 times table outlines a **nephroid** with two points. In general the $k$ times table makes a curve with $k - 1$ points, all of the same family (epicycloids, the paths traced by a point on a wheel rolling around another wheel).

[[viz:ma-times|Slide the times table, or press Play to sweep through them. Try 2, 3, 21, 34 and 51 with 200 points.]]

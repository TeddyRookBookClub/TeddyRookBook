---
title: "Mapping the Ocean Floor with Gravity"
description: "Explore our own maps of the seafloor made from the SWOT satellite's gravity data: zoom into seamounts, trenches and abyssal hills, compare the new map with the older one, draw a profile, and see how a bump on the sea surface reveals a mountain below."
type: oceanfloor
eyebrow: "Earth & Space · Oceans"
lede: "Most of the ocean floor has never been seen by a ship. But every undersea mountain tugs on the water above it and raises a tiny bump on the sea surface. A satellite called SWOT measures those bumps so precisely that scientists can map the seafloor from space. The maps on this page are our own, drawn in your browser from the published data."
# The tour: one stop per featured region (ids match regions in static/earth/ocean-floor/manifest.json, made by
# scripts/ocean/make-tiles.py, which also sets each stop's view).
tour:
  - id: hawaii
    title: "The Hawaiian–Emperor bend"
    text: "The Pacific Plate has drifted over a hot spot for tens of millions of years, leaving a trail of volcanoes. The Emperor chain runs north; the Hawaiian chain heads east-southeast toward Hawaii. The bend formed roughly 50 million years ago. Scientists still discuss how much of it came from the plate changing direction and how much from the hot spot itself drifting."
  - id: atlantic
    title: "Mid-Atlantic Ridge and fracture zones"
    text: "Near the equator, the ridge where South America and Africa pull apart is broken into short pieces. Long east–west fracture zones, such as the St. Paul and Romanche fracture zones, offset the pieces. Look for the crisp lines that cross the whole ocean."
  - id: mariana
    title: "The Mariana Trench"
    text: "Here the Pacific Plate dives under the Philippine Sea Plate. The deep trench is missing mass, so it shows as a dark curve. Its deepest point, the Challenger Deep, is nearly 11,000 meters down, near 11.4° N, 142.6° E. Seamounts on the Pacific side are slowly carried toward the trench."
  - id: epr
    title: "East Pacific Rise abyssal hills"
    text: "The East Pacific Rise is one of the fastest-spreading ridges on Earth. New seafloor forms with long, low hills a few kilometers wide that line up with the ridge. Their direction records how the plates moved. The lines that cut across them are fracture zones."
  - id: weddell
    title: "The Weddell Sea"
    text: "Sea ice covers this part of the Southern Ocean for much of the year, which makes ship surveys hard. The curving lines in the gravity record how the seafloor spread as Antarctica and South America moved apart, starting more than 100 million years ago. The ice shelves are shown in tan, like land."
  - id: seir
    title: "Southeast Indian Ridge"
    text: "In the southern Indian Ocean, Australia and Antarctica are moving apart. SWOT shows the fine grain of abyssal hills here, a texture older satellite maps could barely see. NASA's visualization of the SWOT data visits this area too."
  - id: peru
    title: "Small seamounts west of Peru"
    text: "South of the Galápagos Islands, the map is dotted with small seamounts, many under a kilometer tall. Before SWOT, most of the smallest ones had never been charted. Zoom in and count the bright dots."
  - id: argentina
    title: "The Argentine margin"
    text: "Off Argentina, a wide, flat continental shelf drops to the deep Argentine Basin. Gravity shows structure hidden under the flat shelf, and channels cut into the shelf's edge that carry sediment down to the deep basin."
# Ready-made profiles (for keyboard users and quick looks): [lon, lat] start and end.
profiles:
  - { name: "Across the Mariana Trench", a: [140.5, 13.2], b: [149.0, 10.6] }
  - { name: "Along the Emperor seamounts", a: [170.2, 39.5], b: [172.6, 30.5] }
  - { name: "Across the East Pacific Rise", a: [-118.5, -15.0], b: [-105.5, -15.0] }
  - { name: "Across the Argentine margin", a: [-64.0, -45.5], b: [-52.0, -42.0] }
---
## Why most of the seafloor is still unmapped

Light fades out within a few hundred meters of seawater, and radar can't get through the water at all. So a satellite can't photograph the bottom of the deep ocean. To measure depth, a ship sends pulses of sound straight down and times the echoes. This is sonar. It works well, but a ship maps only a narrow strip as it goes, and the ocean is huge. Ships with sonar have mapped only about a quarter of the seafloor in detail.

For the rest, scientists use a trick: they let gravity do the looking.

## How gravity shows the seafloor

Rock is almost three times as dense as seawater. An undersea mountain, called a **seamount**, adds extra mass, and that mass pulls a little harder on the water around it. Water piles up over the seamount, so the sea surface stands a few centimeters higher there. Over a deep trench, the surface dips.

Average out the waves, tides and currents, and the shape of the sea surface becomes a map of gravity. The map on this page shows the **vertical gravity gradient** (VGG). It tells how quickly gravity changes as you go up or down. It shows edges and small features very sharply, which makes it the best gravity map for spotting seamounts, ridges and hills.

[[of:how]]

## What SWOT is

SWOT stands for **Surface Water and Ocean Topography**. It is a satellite mission of NASA and CNES, the French space agency, with help from the Canadian Space Agency and the UK Space Agency. It launched in December 2022. Its main job is to measure the height of water in oceans, lakes and rivers.

Older satellites measured sea height along a thin line straight below them. SWOT's main instrument, **KaRIn** (the Ka-band Radar Interferometer), has two radar antennas 10 meters apart, at the ends of a mast. The radar echo from each spot on the sea reaches the two antennas along slightly different paths. Comparing the two signals (this is called interferometry) gives the height of the sea surface across a wide swath: a strip about 50 kilometers wide on each side of the satellite's track, with a narrow gap right below it. SWOT covers about 90 percent of the globe every 21 days and measures height to within about a centimeter.

Because it sees a whole swath at once, SWOT measures the slope of the sea surface in every direction, not just along one line. In 2024, Yao Yu, David Sandwell and Gérald Dibarboure showed that one year of SWOT data reveals more detail in marine gravity than 30 years of the older satellites, down to features about 8 kilometers across.

[[of:compare]]

## What the new maps reveal

- **Many more seamounts.** Earlier satellites could find seamounts taller than about a kilometer. SWOT can find ones less than half that tall. The number of known seamounts could grow from about 44,000 to about 100,000. Seamounts matter to life: currents bring nutrients up their slopes, and fish and corals gather there.
- **Abyssal hills.** These are the most common landform on the ocean floor. They cover about 70 percent of the ocean floor. Each is only a few kilometers wide, and they form in long parallel bands where plates spread apart. Before SWOT, they had been mapped only by ships. Now they can be traced across whole oceans.
- **The history of the plates.** The direction of abyssal hills and fracture zones records how plates moved over millions of years. SWOT also shows structures buried under sediment on continental margins and old spreading ridges in ice-covered seas.

## What the maps are good for

- **Navigation.** Ships and submarines use seafloor maps, and so do the crews who lay communication cables on the bottom.
- **Ocean mixing.** Tides and deep currents flowing over rough seafloor stir the deep ocean. That mixing moves heat and nutrients around. Researchers still don't fully understand how abyssal hills affect it, and better maps help.
- **Plate tectonics.** The new maps let geologists reconstruct how the ocean basins opened, piece by piece.

## What gravity maps can't tell you

A gravity map shows **where** a feature is and its shape. It does not measure depth directly. To turn gravity into depth, scientists must assume how dense the rock is and how much soft sediment covers it, and those guesses can be off. Gravity also blurs: the deeper a feature lies, the weaker and wider its pull at the surface, so the smallest features are lost. For exact depths, and for the charts ships rely on, sonar from ships is still needed. The best maps combine both: gravity fills the gaps between ship tracks, and sonar pins down the depths.

## Reading the map

- **Bright** (or red, on the diverging scale) means gravity is stronger than average and grows fast as you go down: extra mass close by, such as a seamount or ridge.
- **Dark** (or blue) means missing mass, such as a trench or a valley.
- A ring of dark around a bright seamount is normal. It comes from the way gravity's gradient changes sign a short way off to the side.
- **Tan** areas are land or ice shelves, which this map leaves out.
- The units are **Eötvös** (E), named after the Hungarian physicist Loránd Eötvös. One Eötvös is 10⁻⁹ per second squared. In everyday terms: if gravity grew stronger by one billionth of a meter per second squared for every meter you went down, that would be 1 E. Earth's normal gravity changes by about 3,086 E. The map shows only the small differences on top of that, usually tens of E and up to a few hundred over big seamounts.
- The **gravity anomaly** layer, in milligals (mGal), shows gravity itself rather than its gradient. It is smoother, and good for big features. One milligal is a hundred-thousandth of a meter per second squared, about a millionth of normal gravity.

## Watch NASA's video

NASA's Scientific Visualization Studio made a striking flyover of the SWOT gravity map: [Surface Water and Ocean Topography (SWOT) Vertical Gravity Gradient](https://svs.gsfc.nasa.gov/5519), visualized by Greg Shirah with scientists David Sandwell and Yao Yu. It inspired this page. We link to it rather than copy it. The maps here are our own renderings of the published data.

## About these maps

The maps, profiles and animation on this page are our own renderings, made from the published gravity grids. We cut the grids into small tiles that store the data values, not pictures, and your browser colors them. The world view is coarse, and eight featured regions have full detail. The values you see when you hover have been rounded slightly, by less than 1 E for small values.

- **SWOT gravity, version SWOT_06** (September 2026): vertical gravity gradient and free-air gravity anomaly, from the [Scripps Institution of Oceanography data folder](https://topex.ucsd.edu/pub/global_grav_1min_SWOT/). It uses three years of SWOT data.
- **The older map, V33**: the IGPP vertical gravity gradient, version 33, from nadir altimeters only, as served by the [Generic Mapping Tools](https://www.generic-mapping-tools.org/remote-datasets/earth-vgg.html).
- **Land and ice shelves**: Natural Earth.

If you use these data, please cite the publications the data's authors ask for:

- Yu, Y., Sandwell, D. T., & Dibarboure, G. (2024). Abyssal marine tectonics from the SWOT mission. *Science*, 386(6727), 1251–1256. [doi:10.1126/science.ads4472](https://doi.org/10.1126/science.ads4472)
- Sandwell, D. T., Harper, H., Tozer, B., & Smith, W. H. (2021). Gravity field recovery from geodetic altimeter missions. *Advances in Space Research*, 68(2), 1059–1072. [doi:10.1016/j.asr.2019.09.011](https://doi.org/10.1016/j.asr.2019.09.011)

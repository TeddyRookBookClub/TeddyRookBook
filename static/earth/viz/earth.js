/* Earth & Space Ladder: the visual kit (window.MathLadder.viz names starting with es-). Needs math/viz/core.js.
 *
 * Embed:  <div class="ml-viz" data-viz="es-earth-sun" data-opts='{"mode":"seasons","lat":40}' aria-label="…"></div>
 * Every visual is vanilla JS drawn on a canvas, follows the light and dark themes, works with mouse, touch and keyboard
 * (focus the picture, then use the arrow keys; Shift for bigger steps), fits a 360-px-wide phone, gives the canvas an
 * aria-label that describes what it shows plus a live text line, and never animates by itself when the visitor prefers
 * reduced motion (a Play button starts any motion).
 *
 * Options every visual takes:
 *   mode: which picture, for visuals with several; modes: true (tabs for all of them) or a list of mode names (tabs for those)
 *   quiet: true (or readout: false): hides the numbers, names and verdicts a problem might ask for (each visual lists what)
 *   lock: true: no dragging and no controls (a fixed figure)
 *   letters: true (or blank: true): lettered markers instead of names, for labeling problems
 *   task: a line of instructions shown above the picture; label: the visual's accessible name; height: fixed canvas height (px)
 *   play: false: never start an animation, even when motion is allowed
 *
 * The models behind the pictures are exposed as window.MathLadder.earthModels (Sun position, insolation, PREM interior,
 * seismic rays, U.S. Standard Atmosphere, Magnus humidity, parcel lifting, blackbody radiation, a two-box climate model,
 * Köppen classes, a simple carbon model and more) so problem generators and tests can use the same numbers.
 * Data notes: values were entered by hand and rounded (the source sites could not be reached while building); the
 * ice-core curve is a sketch and the satellite sea-level curve is a smooth fit, and both say so on screen.
 *
 * The visuals and their own options (in the order of the course list):
 *
 * es-earth-sun: Earth and Sun.
 *     opts:
 *     mode: 'globe' | 'orbit' | 'beam' | 'milankovitch'       modes: true or a list to show tabs
 *     date: 'MM-DD' (default '06-21'); utc: hours (default 12); lat, lon: a latitude and longitude to report on
 *     points: [{lat, lon, label}]   marked places (label 'A', 'B' … or a name)
 *     grid: 15 | 30 (globe grid spacing, default 30); tz: true (15° time-zone bands with local solar time)
 *     terminator: true (day and night on the globe; default true); subsolar: true (mark where the Sun is overhead)
 *     compare: [lat1, lat2] (beam: two places side by side at noon on the date)
 *     ecc, tilt, prec (milankovitch: eccentricity 0–0.06, tilt 22.1–24.5°, prec = day of the year Earth is closest to the Sun)
 *     exaggerate: true (orbit: stretch the orbit's shape so it shows; labeled as stretched)
 *     play: false to stop the globe from turning on its own
 *     quiet: hides coordinates, Sun height, day length, energy per m² and point coordinates (keeps the grid and letters)
 *     lock: no turning, dragging or sliders
 *
 * es-moon: Sun, Earth and Moon.
 *     opts:
 *     mode: 'phases' | 'eclipse' | 'tides'      modes: true or a list for tabs
 *     angle: the Moon's angle from the Sun as seen from Earth (0 = new, 90 = first quarter, 180 = full), or day: 0–29.5
 *     shadow: true (phases: draw Earth's shadow); names: true (phases: names around the orbit); rise: true (rise and set times)
 *     hemisphere: 'N' | 'S' (how the Moon looks; default 'N')
 *     date: 'MM-DD' (eclipse: the date); node: 'MM-DD' (eclipse: a date when the Sun lines up with the Moon's nodes; default '04-08')
 *     tilt3x: true (eclipse: draw the 5.1° tilt three times bigger; default true)
 *     sun: true (tides: add the Sun's tide); sunAngle: degrees between the Sun's and Moon's directions; town: start angle
 *     quiet: hides the phase name, lit fraction, times, tide range and eclipse type; lock: no dragging or sliders
 *
 * es-scale: Scale of Space.
 *     opts:
 *     mode: 'ladder' | 'model' | 'planets'      modes: true or a list for tabs
 *     from, to: zoom range for the ladder, as powers of ten in meters (default 7 to 22.5); zoom: starting power (default 7.2)
 *     letters: true (ladder: objects named by letters, for ordering problems)
 *     sunSize: the model Sun's diameter in meters (default 1); inner: true (model: zoom on the inner planets)
 *     highlight: a planet's name; fields: list of columns from 'd', 'au', 'yr', 'day', 'g', 't'; sort: a field
 *     hide: a field to hide (planets: its numbers and bars), for "which planet is hottest?"
 *     quiet: hides the numbers a problem asks for (model distances and sizes, light times, the hidden field); lock
 *
 * es-interior: Inside Earth.
 *     opts:
 *     mode: 'layers' | 'geotherm' | 'rays'      modes: true or a list for tabs
 *     scheme: 'composition' (crust, mantle, outer core, inner core) | 'mechanical' (lithosphere, asthenosphere, lower mantle …)
 *     probe: depth in km (layers: the probe's starting depth); stretchCrust: true (draw the crust 10× thicker, labeled)
 *     maxDepth: km (geotherm: 200 shows melting; 6371 shows the whole Earth's temperature against a straight-line guess)
 *     path: 'decompression' | 'flux' | 'heating' or [[T, depth], …] (geotherm: a rock's path); solidus: 'dry' | 'wet' | 'both'
 *     zones: true (geotherm: the pressure–temperature panel with metamorphic settings); index: true (Barrovian index minerals)
 *     rays: 'P' | 'S' | 'both'; stations: [angles in degrees from the quake]; lehmann: true (show waves through the inner core)
 *     letters: true (letter the layers or zones for labeling)
 *     quiet: hides layer names, probe readouts and shadow-zone angles; lock
 *
 * es-density: Density, Floating and Convection.
 *     opts:
 *     mode: 'float' | 'column' | 'isostasy' | 'convection'      modes: true or a list for tabs
 *     fluid: 'fresh' | 'salt' | 'oil' | 'syrup' | 'mantle'; blocks: [{mat, size (cm, edge of a cube)}]; rhoBlock, rhoFluid (custom g/cm³)
 *     height: mountain height (km); rhoCrust, rhoMantle (g/cm³, default 2.7 and 3.3); ice: thickness of an ice sheet (km)
 *     scenario: 'pot' | 'mantle' | 'seabreeze' | 'ocean'; time: 'day' | 'night' (sea breeze)
 *     quiet: hides densities, the floating fraction, root depth and arrow labels; lock
 *
 * es-topo: Topographic Map.
 *     opts:
 *     terrain: 'hill' | 'saddle' | 'valley' | 'cliff' | 'crater' | 'random' (with seed); seed: a number for random terrain
 *     interval: contour interval (m, or ft with units 'ft'; default 20 m); units: 'm' | 'ft'
 *     view3d: true (show the tilted 3-D view; default true); profile: [[x1, y1], [x2, y2]] (fractions 0–1 of the map; draggable)
 *     points: [{x, y, label}] (fractions of the map, 0–1, y down); stream: true (draw the stream where the terrain has one)
 *     scale: map width in km (default 2.4) or '1:24000'
 *     quiet: hides point elevations, the gradient readout and every contour label except two index contours; lock
 *
 * es-minerals: Mineral Lab.
 *     opts:
 *     mode: 'bench' | 'silicates'      modes: true or a list for tabs
 *     mineral: a name ('quartz', 'calcite', …) or unknown: true with seed (a random mineral, name hidden until revealed)
 *     tests: list of tests offered: 'nail2' (fingernail), 'coin', 'nail', 'glass', 'streak', 'luster', 'break', 'magnet', 'acid', 'sg'
 *     table: true (an identification table that narrows as tests are done)
 *     structure: 'isolated' | 'chain' | 'double' | 'sheet' | 'framework' (silicates); charge, ratio: true to show them
 *     quiet: hides the mineral's name, the ratio, the charge and the table matches; lock: results shown, no testing
 *
 * es-rock-cycle: Rock Cycle.
 *     opts:
 *     start: 'igneous' | 'sedimentary' | 'metamorphic' | 'magma' | 'sediment' (where the rock token starts; default 'igneous')
 *     paths: 'all' (every process, including shortcuts) | 'simple' (the one loop many books show)
 *     labels: true (process names on the arrows; default true); blank: true (arrows lettered A, B, C … instead)
 *     highlight: an arrow id ('cool', 'weather-i', 'weather-s', 'weather-m', 'deposit', 'meta-i', 'meta-s', 'melt-i', 'melt-s', 'melt-m')
 *     quiet: hides rock and process names; lock: no moving the token
 *
 * es-igneous: Cooling Magma.
 *     opts:
 *     mode: 'cool' | 'bowen' | 'silica'      modes: true or a list for tabs
 *     setting: 'pluton' | 'dike' | 'lava' | 'water' (deep pluton, shallow dike, lava on land, lava in water); rate: 0–4 (cooling rate index)
 *     twoStage: true (slow, then fast: porphyritic); gas: true (bubbles: vesicular)
 *     temp: °C (bowen, 600–1300); goldich: true (bowen: show weathering order instead)
 *     silica: % SiO₂ (silica mode, 40–77)
 *     quiet: hides the texture name, mineral names, class name and readouts; lock
 *
 * es-rock-key: Rock Identification Keys.
 *     opts:
 *     mode: 'igneous' | 'sedimentary' | 'metamorphic'      modes: true or a list for tabs
 *     highlight: a rock name (its cell is marked); sample: a rock name (draw only that hand sample, for "name this rock")
 *     blank: true (hide the names in the grid); quiet: hides every name; lock
 *
 * es-weathering: Weathering and Soil.
 *     opts:
 *     mode: 'cube' | 'factors' | 'soil'      modes: true or a list for tabs
 *     cuts: cuts through each edge (0–4; 1 cut halves each edge into 8 cubes); size: the starting cube's edge (cm, default 2)
 *     climate: 'cold-dry' | 'cold-wet' | 'warm-wet' | 'hot-dry'; rock: 'granite' | 'limestone' | 'sandstone'
 *     process: 'frost' | 'roots' | 'abrasion' | 'rusting' | 'dissolving' | 'clay'
 *     time: years (soil: age of the soil; default 10,000); horizons: list of horizons to show (default all)
 *     blank: true (letters on horizons or processes); quiet: hides surface areas, ratios, process kinds and horizon names; lock
 *
 * es-sediment: Moving Sediment.
 *     opts:
 *     mode: 'hjulstrom' | 'stream' | 'grains' | 'structures'      modes: true or a list for tabs
 *     point: {d (mm), v (cm/s)} (hjulstrom: the draggable grain); phi: true (show phi values on the size axis)
 *     flow: river speed entering the lake (stream, cm/s, default 60); distance: km traveled (grains, 0–200)
 *     structure: 'crossbed' | 'wave-ripples' | 'current-ripples' | 'mudcracks' | 'graded'; flip: true (draw the layer upside down)
 *     quiet: hides field names, phi values and current arrows; lock
 *
 * es-landscape: Shaping the Land.
 *     opts:
 *     mode: 'river' | 'glacier' | 'slope' | 'wind'      modes: true or a list for tabs
 *     time: 0–1 (river: how far the meander has grown toward an oxbow); station: {width (m), depth (m), speed (m/s)} for the gauging station
 *     balance: glacier mass balance (m of water a year, −3 to +3)
 *     angle, frictionAngle (degrees, slope); wet: 0–1 (how much of the soil is filled with water)
 *     blank: true (letters on landforms); quiet: hides discharge, factor of safety, terminus position and landform names; lock
 *
 * es-strata: Rock Layers.
 *     opts:
 *     mode: 'section' | 'correlate'      modes: true or a list for tabs
 *     events: [{t: 'deposit', rock, fossil, thick}, {t: 'tilt', deg}, {t: 'fold', amp, wave}, {t: 'erode', depth},
 *     {t: 'fault', x, dip, dipDir: 'left'|'right', kind: 'normal'|'reverse', slip}, {t: 'intrude', kind: 'dike'|'sill'|'pluton', x, age},
 *     {t: 'lava'}, …] oldest first. Rocks: sandstone, shale, siltstone, limestone, conglomerate, coal, ash.
 *     x runs 0 to 2 across the section; heights 0 to 1. Ash beds and intrusions may carry age (million years).
 *     seed, steps: a random history for generators (the same seed gives the same history)
 *     letters: true (letter the layers, intrusions, faults and unconformities, in a shuffled order); replay: true (step through events)
 *     ages: true (show the ages of dated beds); columns: correlate data [[{rock, thick, fossil, key}], …] bottom to top
 *     quiet: hides the event list, rock names and the order; lock
 *
 * es-halflife: Radioactive Clock.
 *     opts:
 *     isotope: 'C-14' | 'K-40' | 'U-238' | 'U-235' | 'Rb-87' (default 'C-14'); n: 100 | 400 atoms
 *     time: in half-lives (default 0) or years: a time in years
 *     graph: true (default); ratio: true (daughter-to-parent readout; default true); random: true (atoms decay one by one at random)
 *     seed: the same seed gives the same atoms
 *     quiet: hides the fraction left, the ratio and the age; lock
 *
 * es-deep-time: Deep Time.
 *     opts:
 *     analogy: 'year' | 'day' | 'field' | 'none' (Earth's history squeezed into one calendar year, one day or a 100 m field)
 *     zoom: [from, to] in million years ago (default [4540, 0]); events: list of ids or [{name, ma}]; dates: true (show dates)
 *     rate: {perYear, years, unit} (e.g. {perYear: 0.3, years: 5e6, unit: 'mm'}); letters: true (events lettered)
 *     quiet: hides dates, analogy times and rate results; lock
 *
 * es-plates: Plate Map.
 *     opts:
 *     mode: 'map' | 'pangaea' | 'hotspot' | 'gps'      modes: true or a list for tabs
 *     show: list from 'boundaries', 'arrows', 'quakes', 'volcanoes', 'names' (map; default boundaries, arrows, names)
 *     letters: true (letter some boundaries for "what kind is B?"); age: million years ago (pangaea, 0–250, default 250)
 *     evidence: list from 'Mesosaurus', 'Glossopteris', 'Lystrosaurus', 'Cynognathus', 'mountains', 'ice' (pangaea; default all)
 *     speed: plate speed (hotspot, cm/yr); islands: [{name, km, ma}] (hotspot; default the Hawaiian–Emperor chain)
 *     stations: [{name, x, y (km), ve, vn (mm/yr)}]; pair: [i, j] (gps)
 *     quiet: hides rates, ages, boundary types and vector readouts; lock
 *
 * es-boundary: Plate Boundary Cross-Sections.
 *     opts:
 *     type: 'ridge' | 'rift' | 'ocean-ocean' | 'ocean-continent' | 'collision' | 'transform'      modes: true for tabs
 *     time: million years (ridge with stripes: how long it has spread, 0–6); speed: half spreading rate (cm/yr, default 2.5)
 *     stripes: true (ridge: magnetic stripes); ages: true (ridge: age colors and a ruler); quakes: true (earthquake foci)
 *     quakeList: [{km, depth}] (distance from the trench and depth, km); melt: true (where rock melts); forces: true (slab pull, ridge push)
 *     dip: slab dip (degrees, default 35); letters: true (letter the features)
 *     quiet: hides rates, ages, dip, boundary and feature names; lock
 *
 * es-structures: Folds and Faults.
 *     opts:
 *     mode: 'fault' | 'rebound' | 'fold' | 'strikedip' | 'stress'      modes: true or a list for tabs
 *     type: fault: 'normal' | 'reverse' | 'thrust' | 'right-lateral' | 'left-lateral'; fold: 'anticline' | 'syncline' | 'dome' | 'basin' | 'plunging'
 *     slip: m (fault, 0–100 m in the drawing's units); erosion: 0–1 (fold: how deep the top is worn down)
 *     strike: degrees from north (strikedip, default 0 = N–S); dip: degrees (default 30); distance: m to the well (strikedip, default 200)
 *     rate: mm/yr (rebound, default 35); slipPerQuake: m (rebound, default 4); years: years since the last quake (rebound)
 *     stress: 'shallow' | 'deep' (stress mode)
 *     letters: true (letter the blocks or features); quiet: hides type names, depth, recurrence and wall labels; lock
 *
 * es-seismic: Seismic Waves.
 *     opts:
 *     mode: 'waves' | 'seismograms' | 'locate' | 'magnitude' | 'intensity'      modes: true or a list for tabs
 *     vp, vs: wave speeds (km/s, default 6 and 3.5); stations: seismograms [{name, distance (km)}] or locate [{x, y (km), lag (s)}]
 *     circles: true (locate: draw the circles); M1, M2: magnitudes (default 5 and 7); area: fault area (km²); slip: m (moment magnitude)
 *     blocks: true (magnitude: energy as blocks); basin: true (intensity: a soft-sediment basin); letters: true (lettered points)
 *     quiet: hides lag, distance, ratios, Mw and intensity values; lock
 *
 * es-volcano: Volcanoes.
 *     opts:
 *     type: 'shield' | 'cinder' | 'composite' | 'dome' | 'caldera' (default 'composite'); modes: true for tabs (volcano, VEI, hazards, monitoring)
 *     mode: 'volcano' | 'vei' | 'hazards' | 'monitor'
 *     silica: % (default by type); gas: 0–1; vei: 0–8; wind: direction the wind blows toward ('east', 'west', …) for ash
 *     monitor: {tilt: [...], so2: [...], quakes: [...]} series over 12 months (default: a volcano waking up)
 *     letters: true (lettered towns or features); quiet: hides the type name, VEI, eruption style and hazard names; lock
 *
 * es-water: Water Cycle and Groundwater.
 *     opts:
 *     mode: 'cycle' | 'groundwater'      modes: true or a list for tabs
 *     flux: true (moving water parcels on the arrows; default true); reservoirs: true (bars of where the water is; default true)
 *     drivers: true (color the processes powered by sunlight and by gravity); blank: true (letters on the arrows and parts)
 *     pump: pumping rate of well A, 0–1 (groundwater); wells: [{x (0–1 across 1,000 m), depth (0–1 of the sand), head (m, to override the reading)}] (A pumps, B watches);
 *     K: hydraulic conductivity (m/day, default 20); darcy: true (the K slider; default true). Gradient and Q come from the heads at wells A and B.
 *     quiet: hides names, percentages, the gradient and Q; lock
 *
 * es-ocean: Ocean Circulation.
 *     opts:
 *     mode: 'currents' | 'density' | 'conveyor' | 'enso'      modes: true or a list for tabs
 *     highlight: a current's name; winds: true (prevailing winds over the currents map); letters: true (lettered currents)
 *     T1, S1, T2, S2: temperatures (°C) and salinities (g/kg) of two water samples (density mode)
 *     state: 'neutral' | 'elnino' | 'lanina'; anomaly: Niño 3.4 anomaly (°C)
 *     quiet: hides current names, densities and the state label; lock
 *
 * es-atmosphere: The Atmosphere (U.S. Standard Atmosphere 1976).
 *     opts:
 *     probe: height in km (default 11); logP: true (pressure on a log axis); pie: true (gases in dry air; default true)
 *     markers: true (Everest, airliners, weather balloons, auroras; default true); units: 'hPa' | 'inHg' | 'kPa'
 *     letters: true (letter the layers); quiet: hides layer names and probe readouts; lock
 *
 * es-humidity: Humidity and Dew Point (Magnus formula, saturation over water).
 *     opts:
 *     T: air temperature; Td: dew point (or RH: relative humidity %); units: 'C' | 'F' (default 'C')
 *     compare: [{T, RH}] (a second sample to compare); cycle: true (a day–night run at constant vapor)
 *     quiet: hides RH, dew point and vapor values; lock
 *
 * es-parcel: Rising Air Parcel.
 *     opts:
 *     mode: 'lift' | 'mountain'      modes: true for tabs
 *     T0, Td0: temperature and dew point at the ground (°C); env: the surrounding air as [[height km, T °C], …] points, or a list of lapse rates (°C/km) for successive 1-km layers
 *     from the ground temperature (default 6.5 °C/km); its points can be dragged sideways
 *     peak: mountain top (km, mountain mode, default 3); at: where the air starts along the path (0 windward foot … 1 lee foot); lift: how high to lift the parcel (km, default 6)
 *     rates: {dry, moist, dew} °C/km to match a problem (e.g. {dry: 10, moist: 6, dew: 2}); default: dry 9.8, the rest computed
 *     show: list from 'dry', 'moist', 'dew', 'env' (lines to draw; default all)
 *     quiet: hides the cloud-base height, parcel temperatures and the verdict; lock
 *
 * es-energy: Earth's Energy.
 *     opts:
 *     mode: 'spectrum' | 'budget' | 'layer' | 'forcing'      modes: true or a list for tabs
 *     temps: list of temperatures in K (spectrum; default [5772, 288]); wien: true (mark the peaks); bands: true (absorption bands)
 *     albedo: 0–1 (budget, default 0.30); S: solar constant (W/m², default 1361); eps: 0–1 (layer: absorptivity, default 0.78)
 *     forcing: 'co2x2' | 'volcano' | 'solar' or a number of W/m²; feedbacks: list from 'vapor', 'ice', 'clouds' (switched on)
 *     quiet: hides temperatures, peak wavelengths and flux values; lock
 *
 * es-wind: Wind and Its Forces.
 *     opts:
 *     mode: 'isobars' | 'turntable' | 'global'      modes: true or a list for tabs
 *     hemisphere: 'N' | 'S'; lat: latitude (0–80, default 45); spacing: isobar spacing factor (0.5 close … 2 far, default 1)
 *     friction: true (near the ground; default false = aloft); release: {x, y} start of the parcel (fractions 0–1, y down; on tall phone screens the high sits above the low)
 *     forces: true (draw the force arrows; default true); letters: true (four lettered candidate wind arrows at a point instead of
 *     a parcel; seed shuffles them; answer: the surface wind with friction, the wind along the isobars without)
 *     spin: 'ccw' | 'cw' (turntable); month: 1–12 (global: shifts the rain belt); jets: true (global: the jet streams on a polar
 *     map; default true); waves: number of troughs in the polar jet (default 4)
 *     quiet: hides wind speeds, force names, belt names and jet labels; lock
 *
 * es-weather-map: Weather Maps.
 *     opts:
 *     mode: 'station' | 'map' | 'section' | 'meteogram' | 'cyclone'      modes: true or a list for tabs
 *     station: {T, Td, p (hPa), tend (hPa in 3 h), dir (from, degrees), kt, cover (eighths 0–8, 9 hidden), wx ('none' | 'rain' |
 *     'drizzle' | 'snow' | 'showers' | 'thunderstorm' | 'fog' | 'haze' | 'freezing')}
 *     units: 'F' (°F, inches; default, as on U.S. maps) | 'C' (°C, mm). Wind is always in knots.
 *     front: 'cold' | 'warm' | 'occluded' | 'stationary' (section; meteogram uses cold or warm); hours: the map's time step in hours
 *     (map, 0–48) or the meteogram's length (24–72); stage: 1–6 (cyclone)
 *     letters: true (lettered points A–C on the map, letters on the section); quiet: hides decoded values, front names and stage names; lock
 *
 * es-clouds: Clouds and Precipitation.
 *     opts:
 *     mode: 'atlas' | 'growth' | 'ptype'      modes: true or a list for tabs
 *     highlight: a cloud name (atlas); blank: true (letters instead of names); warmFront: true (the clouds ahead of a warm front)
 *     r1, r2: droplet and drop radii in μm (growth; default 10 and 1000); process: 'warm' | 'cold' (growth); updraft: m/s (growth)
 *     profile: [[height m, T °C], …] from cloud base (3,000 m) to the ground (ptype; points draggable)
 *     quiet: hides cloud names, the droplet count and the outcome; lock
 *
 * es-storms: Storms.
 *     opts:
 *     mode: 'thunderstorm' | 'supercell' | 'hurricane'      modes: true or a list for tabs
 *     stage: 'cumulus' | 'mature' | 'dissipating' or time: minutes 0–60 (thunderstorm); delay: seconds from flash to thunder (1–45)
 *     shear: 0–1 (supercell: how much the wind changes with height); ef: 0–5 (row to highlight) or wind: mph (rated on the EF scale,
 *     supercell; on the Saffir–Simpson scale, hurricane); category: 1–5 (hurricane); surge: storm surge (m, or ft with units 'ft')
 *     hemisphere: 'N' | 'S' (hurricane spin); letters: true; quiet: hides the stage, category, EF rating and distance; lock
 *
 * es-climate-data: Climate Data.
 *     opts:
 *     mode: 'climograph' | 'series' | 'anomaly'      modes: true or a list for tabs
 *     city: one of singapore, miami, mumbai, darwin, phoenix, cairo, lima, denver, rome, seattle, capetown, london, sydney, chicago,
 *     moscow, fairbanks, yakutsk, utqiagvik; or data: {temp: [12 °C], precip: [12 mm], name}
 *     units: 'metric' | 'us'; koppen: true (the step-by-step classification; default true)
 *     preset: 'temperature' | 'co2' | 'sealevel' | 'seaice' | 'icecore' (series); baseline: [y1, y2] (temperature); window: running
 *     mean in years (0 = off); trend: true; range: [y1, y2] (the trend and zoom range); season: true (CO₂ seasonal cycle);
 *     projections: true (IPCC AR6 warming by 2081–2100)
 *     year: the year for the anomaly mode (default 2024)
 *     quiet: hides the climate class, the city name, the trend slope and the anomaly values; lock
 *     Data notes: the climographs are rounded normals for teaching; the records were entered by hand, rounded (see the models).
 *
 * es-carbon: Carbon Cycle.
 *     opts:
 *     emissions: GtC per year (fossil fuels plus land use; default 11.3); years: how long to run (default 30); airborne: a fixed share
 *     that stays in the air (0–1, to match a problem; default: the simple model decides, about 0.45 today)
 *     fast: true (the fast cycle; default true); slow: true (the slow cycle; default true); highlight: a reservoir (air, plants, soils,
 *     surface, deep, fossil, rocks) or flux (photo, resp, oceanIn, oceanOut, mixing, fossil, landUse, volcano, weathering, burial)
 *     blank: true (letters on the fluxes); quiet: hides ppm, fractions and flux values; lock
 *
 * es-chance: Chance and Recurrence.
 *     opts:
 *     mode: 'record' | 'odds' | 'ensemble'      modes: true or a list for tabs
 *     data: [{year, value}] (record; default: a made-up river with seed); level: a flow to rate (record); seed
 *     p: yearly chance (odds) or T: recurrence interval in years; n: years; trials: how many n-year stretches to simulate (default 200)
 *     members: ensemble size (default 30); lead: forecast day to read (default 5); spread: how different the starts are (default 1)
 *     quiet: hides computed intervals and probabilities; lock
 */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math, PI = M.PI, TAU = 2 * PI, RAD = PI / 180, DEG = 180 / PI;

  // ---------- small helpers (also used by the models below) ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function num(v, d) { var x = typeof v === 'number' ? v : parseFloat(v); return isFinite(x) ? x : d; }
  function opt(o, d) { var r = {}, k; for (k in d) r[k] = d[k]; for (k in o) if (o[k] !== undefined && o[k] !== null) r[k] = o[k]; return r; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rng(seed) { // mulberry32: the same seed always gives the same sequence (seed 0 or missing: random)
    var a = (seed >>> 0) || (M.random() * 4294967296 >>> 0);
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = M.imul(t ^ t >>> 15, t | 1); t ^= t + M.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function hashStr(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = M.imul(h, 16777619); } return h >>> 0; }
  function interp(tab, x) { // tab: [[x, y], ...] sorted by x; linear inside, clamped outside
    if (x <= tab[0][0]) return tab[0][1]; var n = tab.length; if (x >= tab[n - 1][0]) return tab[n - 1][1];
    for (var i = 1; i < n; i++) if (x <= tab[i][0]) { var a = tab[i - 1], b = tab[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); }
    return tab[n - 1][1];
  }
  function interpLog(tab, x) { // like interp but the y values change exponentially between points (pressures)
    if (x <= tab[0][0]) return tab[0][1]; var n = tab.length; if (x >= tab[n - 1][0]) return tab[n - 1][1];
    for (var i = 1; i < n; i++) if (x <= tab[i][0]) { var a = tab[i - 1], b = tab[i], t = (x - a[0]) / (b[0] - a[0]); return a[1] * M.pow(b[1] / a[1], t); }
    return tab[n - 1][1];
  }
  function wrap180(a) { a = ((a + 180) % 360 + 360) % 360 - 180; return a; }
  function wrap360(a) { return ((a % 360) + 360) % 360; }

  /* ================= the science models (pure functions, no drawing) =================
     Exposed as MathLadder.earthModels so tests (and anyone checking a picture) can call them.
     Units: SI unless the name says otherwise; temperatures in °C unless the name ends in K. */
  var EM = ML.earthModels = {};
  EM.S0 = 1361;                  // solar constant, W/m² (NASA, TSI at 1 AU)
  EM.SIGMA = 5.670374419e-8;     // Stefan–Boltzmann constant, W m⁻² K⁻⁴
  EM.WIEN = 2898;                // Wien's constant, μm·K
  EM.TILT = 23.44;               // Earth's axial tilt today, degrees
  EM.AU = 149597870.7;           // km
  EM.LY = 9.4607e12;             // km in a light-year
  EM.C = 299792.458;             // km/s
  EM.R_EARTH = 6371;             // mean radius, km
  EM.G = 9.8;                    // m/s² near Earth's surface (ladder convention)

  // ---------- dates ----------
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  EM.months = MONTHS;
  EM.doy = function (mmdd, year) { // 'MM-DD' -> day of the year (Jan 1 = 1); a non-leap year by default
    var p = String(mmdd || '03-20').split(/[-\/ ]/), y = year || 2025, m = clamp(parseInt(p[0], 10) || 1, 1, 12), d = clamp(parseInt(p[1], 10) || 1, 1, 31);
    return M.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5) + 1;
  };
  EM.dateOf = function (doy, year) { var y = year || 2025, t = new Date(Date.UTC(y, 0, 1) + (M.round(doy) - 1) * 864e5); return { m: t.getUTCMonth() + 1, d: t.getUTCDate() }; };
  EM.dateStr = function (doy, short) { var q = EM.dateOf(doy); return (short ? MON3 : MONTHS)[q.m - 1] + ' ' + q.d; };

  /* ---------- the Sun's position ----------
     Low-precision formulas of the Astronomical Almanac (good to about 0.01° in 1950–2050).
     doy: day of the year; utc: hours (default noon); year: default 2025.
     Returns dec (declination, °), lam (the Sun's ecliptic longitude, °; 0 at the March equinox), R (distance, AU),
     eot (equation of time, minutes; sundial minus clock), lon (longitude of the subsolar point, ° east). */
  EM.sun = function (doy, utc, year) {
    var y = year || 2025, u = utc == null ? 12 : utc;
    var n = (Date.UTC(y, 0, 1) - Date.UTC(2000, 0, 1, 12)) / 864e5 + (doy - 1) + u / 24;
    var L = wrap360(280.460 + 0.9856474 * n), g = wrap360(357.528 + 0.9856003 * n) * RAD;
    var lam = (L + 1.915 * M.sin(g) + 0.020 * M.sin(2 * g)) * RAD, eps = (23.439 - 4e-7 * n) * RAD;
    var dec = M.asin(M.sin(eps) * M.sin(lam)), ra = wrap360(M.atan2(M.cos(eps) * M.sin(lam), M.cos(lam)) * DEG);
    var eotDeg = wrap180(L - ra);
    return { dec: dec * DEG, lam: wrap360(lam * DEG), R: 1.00014 - 0.01671 * M.cos(g) - 0.00014 * M.cos(2 * g), eot: eotDeg * 4, lon: wrap180(-15 * (u - 12) - eotDeg), g: g * DEG };
  };
  // noon Sun height (degrees above a flat horizon); negative: the Sun stays down all day
  EM.noonAlt = function (lat, dec) { return 90 - M.abs(lat - dec); };
  // hours of daylight: from sunrise to sunset of the Sun's center on a flat horizon, ignoring the bending of light by air
  EM.dayLength = function (lat, dec) { var c = -M.tan(lat * RAD) * M.tan(dec * RAD); if (!(c > -1)) return c <= -1 ? 24 : 12; if (c >= 1) return 0; return 2 * M.acos(c) * DEG / 15; };
  // Sun height (°) at latitude lat, declination dec, hour angle h (degrees from local solar noon)
  EM.sunAlt = function (lat, dec, h) { var f = lat * RAD, d = dec * RAD; return M.asin(M.sin(f) * M.sin(d) + M.cos(f) * M.cos(d) * M.cos(h * RAD)) * DEG; };
  // daily mean sunlight on flat ground at the top of the atmosphere (W/m²); R: Earth–Sun distance in AU (or in units of the orbit's semi-major axis)
  EM.dailyInsol = function (lat, dec, R, S) {
    S = S || EM.S0; var f = lat * RAD, d = dec * RAD, c = -M.tan(f) * M.tan(d), h0 = c <= -1 ? PI : c >= 1 ? 0 : M.acos(c);
    if (!isFinite(c)) h0 = PI / 2;
    return M.max(0, S / PI / (R * R) * (h0 * M.sin(f) * M.sin(d) + M.cos(f) * M.cos(d) * M.sin(h0)));
  };
  /* Milankovitch: daily mean sunshine at latitude lat on the day when the Sun's longitude is lam (90 = June solstice)
     for an orbit of eccentricity ecc, tilt (°), and perihelion when the Sun's longitude is periLam (today about 283°, early January). */
  EM.milank = function (ecc, tilt, periLam, lat, lam) {
    lam = lam == null ? 90 : lam; lat = lat == null ? 65 : lat;
    var dec = M.asin(M.sin(tilt * RAD) * M.sin(lam * RAD)) * DEG, R = (1 - ecc * ecc) / (1 + ecc * M.cos((lam - periLam) * RAD));
    return EM.dailyInsol(lat, dec, R);
  };
  EM.ECC_NOW = 0.0167; EM.PERI_NOW = 283;
  // Earth–Sun distance (million km) on a day of the year
  EM.sunDistMkm = function (doy) { return EM.sun(doy).R * EM.AU / 1e6; };
  // sunlight per square meter of ground for a Sun height h (°), above the air (S) or any beam strength
  EM.beam = function (h, S) { return (S || EM.S0) * M.max(0, M.sin(h * RAD)); };

  /* ---------- the Moon ---------- */
  EM.SYNODIC = 29.530589;   // days from new moon to new moon
  EM.MOON_INC = 5.145;      // tilt of the Moon's orbit to Earth's, degrees
  EM.PHASES = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full moon', 'waning gibbous', 'third quarter', 'waning crescent'];
  /* a: the Moon's angle from the Sun as seen from Earth (elongation), 0 = new, 90 = first quarter, 180 = full.
     rise and set: rough local times in hours (the Moon rises about 50 minutes later each day). */
  EM.moonPhase = function (a) {
    a = wrap360(a); var i = M.round(a / 45) % 8;
    return { a: a, lit: (1 - M.cos(a * RAD)) / 2, age: a / 360 * EM.SYNODIC, name: EM.PHASES[i], idx: i, rise: (6 + a / 15) % 24, set: (18 + a / 15) % 24, waxing: a > 0 && a < 180 };
  };
  // the Moon's height above or below the plane of Earth's orbit (ecliptic latitude, °), from its longitude and the node's
  EM.moonLat = function (moonLon, nodeLon) { return M.asin(M.sin(EM.MOON_INC * RAD) * M.sin((moonLon - nodeLon) * RAD)) * DEG; };
  /* eclipse at a new moon (full = false) or full moon (full = true) when the Sun's longitude is sunLon.
     Limits for average distances: solar if |β| < 1.47° (seen from somewhere on Earth); lunar (umbral) if |β| < 0.96°,
     penumbral only if |β| < 1.50°. */
  EM.eclipse = function (sunLon, nodeLon, full) {
    var b = EM.moonLat(sunLon + (full ? 180 : 0), nodeLon), ab = M.abs(b);
    return { beta: b, kind: full ? (ab < 0.96 ? 'lunar' : ab < 1.5 ? 'penumbral' : 'none') : (ab < 1.47 ? 'solar' : 'none') };
  };
  /* equilibrium tide: height (relative units) at a town whose angle from the Moon's direction is th0 at t = 0 (hours),
     with the Sun sunAngle degrees from the Moon's direction. The Moon's pull makes two bulges; the Sun's is 0.46 as strong.
     Earth turns 14.49° an hour relative to the Moon (one lunar day = 24.84 h) and 15° an hour relative to the Sun. */
  EM.SUN_TIDE = 0.46; EM.LUNAR_DAY = 24.84;
  EM.tide = function (t, th0, sunAngle, withSun) {
    var thm = (th0 + 360 / EM.LUNAR_DAY * t) * RAD, ths = (th0 - (sunAngle || 0) + 15 * t) * RAD;
    return M.cos(2 * thm) + (withSun === false ? 0 : EM.SUN_TIDE * M.cos(2 * ths));
  };

  /* ---------- the planets (NASA planetary fact sheets, rounded) ----------
     d: equatorial diameter (km); au: mean distance from the Sun (AU); yr: orbital period (Earth years);
     day: length of a solar day (hours; Mercury and Venus: their very long solar days); g: surface gravity (Earth = 1);
     t: mean temperature (°C); kind: rocky, giant or dwarf. Dwarf planets: values NASA lists; others left blank (null). */
  EM.PLANETS = [
    { n: 'Mercury', d: 4879, au: 0.387, yr: 0.241, day: 4222.6, g: 0.38, t: 167, kind: 'rocky', col: '#9a8f86' },
    { n: 'Venus', d: 12104, au: 0.723, yr: 0.615, day: 2802.0, g: 0.90, t: 464, kind: 'rocky', col: '#e3c07a' },
    { n: 'Earth', d: 12756, au: 1.000, yr: 1.000, day: 24.0, g: 1.00, t: 15, kind: 'rocky', col: '#4a90d9' },
    { n: 'Mars', d: 6792, au: 1.524, yr: 1.881, day: 24.7, g: 0.38, t: -65, kind: 'rocky', col: '#d0603a' },
    { n: 'Jupiter', d: 142984, au: 5.20, yr: 11.86, day: 9.9, g: 2.36, t: -110, kind: 'giant', col: '#d8b48a' },
    { n: 'Saturn', d: 120536, au: 9.57, yr: 29.45, day: 10.7, g: 0.92, t: -140, kind: 'giant', col: '#e6d29a' },
    { n: 'Uranus', d: 51118, au: 19.17, yr: 84.02, day: 17.2, g: 0.89, t: -195, kind: 'giant', col: '#9fd8e0' },
    { n: 'Neptune', d: 49528, au: 30.18, yr: 164.8, day: 16.1, g: 1.12, t: -200, kind: 'giant', col: '#5b7fe0' },
    { n: 'Ceres', d: 939, au: 2.77, yr: 4.60, day: 9.1, g: null, t: null, kind: 'dwarf', col: '#a0968c' },
    { n: 'Pluto', d: 2376, au: 39.48, yr: 248.0, day: 153.3, g: 0.06, t: -225, kind: 'dwarf', col: '#c9b8a6' },
    { n: 'Eris', d: 2326, au: 67.9, yr: 559, day: null, g: null, t: null, kind: 'dwarf', col: '#d9d4cf' }
  ];
  EM.SUN_D = 1392700; EM.MOON_D = 3475; EM.MOON_DIST = 384400;
  // light-travel time for a distance in km, as words
  EM.lightTime = function (km) {
    var s = km / EM.C; if (s < 60) return { v: s, u: 'seconds' }; if (s < 3600) return { v: s / 60, u: 'minutes' };
    if (s < 86400 * 2) return { v: s / 3600, u: 'hours' }; if (s < 86400 * 365.25 * 2) return { v: s / 86400, u: 'days' };
    return { v: s / (86400 * 365.25), u: 'years' };
  };

  /* ---------- inside Earth: PREM (Dziewonski and Anderson 1981) density, with gravity and pressure integrated from it ----------
     Densities in g/cm³ as functions of x = r/6371 km. Pressure from dP/dr = −ρg, g from the mass inside r. */
  function premRho(r) {
    var x = r / 6371;
    if (r < 1221.5) return 13.0885 - 8.8381 * x * x;
    if (r < 3480) return 12.5815 - 1.2638 * x - 3.6426 * x * x - 5.5281 * x * x * x;
    if (r < 5701) return 7.9565 - 6.4761 * x + 5.5283 * x * x - 3.0807 * x * x * x;
    if (r < 5771) return 5.3197 - 1.4836 * x;
    if (r < 5971) return 11.2494 - 8.0298 * x;
    if (r < 6151) return 7.1089 - 3.8045 * x;
    if (r < 6346.6) return 2.6910 + 0.6924 * x;
    if (r < 6356) return 2.900;
    return 2.600; // PREM's top 3 km is ocean; the ladder shows continental crust here
  }
  EM.premRho = premRho;
  var PREM = (function () { // tables every 1 km of depth: g (m/s²), P (GPa)
    var N = 6371, mass = new Float64Array(N + 1), G = 6.674e-11, dr = 1000, i, r;
    for (i = 1; i <= N; i++) { r = (i - 0.5) * dr; mass[i] = mass[i - 1] + 4 * PI * r * r * premRho(r / 1000) * 1000 * dr; }
    var g = new Float64Array(N + 1), P = new Float64Array(N + 1);
    for (i = 1; i <= N; i++) g[i] = G * mass[i] / M.pow(i * dr, 2);
    for (i = N - 1; i >= 0; i--) { r = (i + 0.5) * dr; var gm = (g[i] + g[i + 1]) / 2; P[i] = P[i + 1] + premRho(r / 1000) * 1000 * gm * dr; }
    return { g: g, P: P, mass: mass[N] };
  })();
  EM.earthMass = PREM.mass;
  EM.pressureGPa = function (depth) { var i = clamp(M.round(6371 - depth), 0, 6371); return PREM.P[i] / 1e9; };
  EM.gravity = function (depth) { var i = clamp(M.round(6371 - depth), 0, 6371); return PREM.g[i]; };
  EM.density = function (depth) { return premRho(6371 - depth - 1e-6); };
  // Layers by depth (km). Composition: crust, mantle, outer core, inner core. Mechanical: lithosphere ... inner core.
  EM.LAYERS = {
    composition: [['crust', 0, 35], ['mantle', 35, 2891], ['outer core', 2891, 5150], ['inner core', 5150, 6371]],
    mechanical: [['lithosphere', 0, 100], ['asthenosphere', 100, 350], ['lower mantle', 350, 2891], ['outer core', 2891, 5150], ['inner core', 5150, 6371]]
  };
  // temperature estimates (°C) by depth (km): rounded values from textbook geotherms; uncertain by hundreds of degrees deep down
  EM.TEMP = [[0, 15], [35, 550], [100, 1300], [410, 1500], [660, 1650], [2700, 2500], [2891, 3700], [5150, 5400], [6371, 5500]];
  EM.tempAt = function (depth) { return interp(EM.TEMP, depth); };
  EM.stateAt = function (depth) { return depth >= 2891 && depth < 5150 ? 'liquid' : 'solid'; };
  // melting of mantle rock (peridotite). Dry solidus: Hirschmann (2000) fit, T(°C) = −5.104P² + 132.899P + 1120.661, P in GPa.
  EM.solidusDry = function (P) { return -5.104 * P * P + 132.899 * P + 1120.661; };
  // with water (water-saturated peridotite): an approximate curve through laboratory results, several hundred degrees lower
  EM.solidusWet = function (P) { return interp([[0, 1050], [0.5, 1020], [1, 1000], [2, 900], [3, 820], [4, 800], [6, 820]], P); };
  // mantle rock rising under a ridge follows an adiabat: potential temperature about 1350 °C, rising about 0.4 °C per km
  EM.adiabat = function (z) { return 1350 + 0.4 * z; };
  // a typical stable continental geotherm (°C at depth z km), meeting the adiabat near 150 km
  EM.geothermCont = function (z) { return M.min(EM.adiabat(z), interp([[0, 15], [10, 250], [20, 430], [35, 600], [50, 750], [75, 950], [100, 1150], [125, 1300], [150, 1420]], z)); };
  // under a mid-ocean ridge: hot rock comes close to the surface
  EM.geothermRidge = function (z) { return z >= 10 ? EM.adiabat(z) : M.min(EM.adiabat(z), interp([[0, 15], [3, 600], [6, 1150], [10, EM.adiabat(10)]], z)); };
  // pressure (GPa) in the upper 200 km: rock of about 2.8 g/cm³ in the crust and 3.3 below 35 km
  EM.pressureShallow = function (z) { return z <= 35 ? 2.8 * 9.8 * z / 1000 : (2.8 * 9.8 * 35 + 3.3 * 9.8 * (z - 35)) / 1000; };
  EM.depthAtP = function (P) { var a = 2.8 * 9.8 * 35 / 1000; return P <= a ? P * 1000 / (2.8 * 9.8) : 35 + (P - a) * 1000 / (3.3 * 9.8); };
  // index minerals of a Barrovian (regional) metamorphic path: appearance temperatures (°C, rounded)
  EM.INDEX = [['chlorite', 300], ['biotite', 420], ['garnet', 480], ['staurolite', 560], ['kyanite', 620], ['sillimanite', 680]];

  /* ---------- seismic rays through a layered Earth ----------
     P and S speeds (km/s) from PREM, rounded, as (depth km, speed) points; a repeated depth is a jump. */
  var VP = [[0, 5.8], [15, 5.8], [15, 6.8], [24.4, 6.8], [24.4, 8.11], [80, 8.08], [220, 7.99], [220, 8.56], [400, 8.91], [400, 9.13], [600, 10.16], [670, 10.27], [670, 10.75], [771, 11.07], [2741, 13.68], [2891, 13.72], [2891, 8.06], [5150, 10.36], [5150, 11.03], [6371, 11.26]];
  var VS = [[0, 3.2], [15, 3.2], [15, 3.9], [24.4, 3.9], [24.4, 4.49], [80, 4.47], [220, 4.42], [220, 4.64], [400, 4.93], [400, 5.07], [600, 5.52], [670, 5.57], [670, 5.95], [771, 6.24], [2741, 7.27], [2891, 7.26], [2891, 0], [5150, 0], [5150, 3.50], [6371, 3.67]];
  function vAt(tab, depth) { // speed just below depth (a jump takes the deeper value)
    for (var i = 1; i < tab.length; i++) if (depth < tab[i][0] || (i === tab.length - 1)) { var a = tab[i - 1], b = tab[i]; if (b[0] === a[0]) continue; return a[1] + (b[1] - a[1]) * (depth - a[0]) / (b[0] - a[0]); }
    return tab[tab.length - 1][1];
  }
  EM.vp = function (depth) { return vAt(VP, depth); };
  EM.vs = function (depth) { return vAt(VS, depth); };
  /* trace a ray from a source at the surface leaving at angle i0 (degrees from straight down).
     Ray parameter p = r·sin(i)/v stays the same along the ray (Snell's law in a sphere). Earth is cut into 2 km shells of
     constant speed; inside a shell the ray is straight, so the angle it sweeps is exact. S rays stop at the liquid outer core.
     Returns {pts: [[r, θ], ...] (θ in radians from the source), dist (degrees), stop (true if it died in the core), core (entered the core)} */
  EM.ray = function (i0, wave) {
    var tab = wave === 'S' ? VS : VP, R = 6371, v0 = vAt(tab, 0.01), p = R * M.sin(i0 * RAD) / v0, dr = 2;
    var pts = [[R, 0]], th = 0, r = R, stop = false, core = false, turned = false; dr = 1;
    while (r > dr * 0.5) {
      var rb = r - dr, v = vAt(tab, R - (r - dr / 2));
      if (v <= 0) { stop = true; break; }
      if (rb < 3480) core = true;
      var b = p * v;
      if (b >= r) { turned = true; break; }
      if (b > rb) { th += M.acos(b / r); pts.push([b, th]); turned = true; break; }
      th += M.acos(b / r) - M.acos(b / rb); r = rb; pts.push([r, th]);
    }
    if (stop) return { pts: pts, dist: null, stop: true, core: true };
    if (!turned) { // straight through the center
      var n0 = pts.length; for (var j = n0 - 2; j >= 0; j--) pts.push([pts[j][0], 2 * th + 0 - pts[j][1] + 0]);
      return { pts: pts, dist: (2 * th) * DEG, stop: false, core: core };
    }
    var half = th, n = pts.length;
    for (var k = n - 2; k >= 0; k--) pts.push([pts[k][0], 2 * half - pts[k][1]]);
    return { pts: pts, dist: 2 * half * DEG, stop: false, core: core };
  };
  EM.SHADOW = { s: 103, p1: 103, p2: 142 }; // textbook shadow-zone edges (degrees from the quake)

  /* ---------- density, floating and isostasy ---------- */
  EM.MATS = { // g/cm³, rounded
    cork: 0.24, pine: 0.50, oak: 0.75, wax: 0.90, ice: 0.917, plastic: 0.95, pumice: 0.6, rubber: 1.2, granite: 2.7, aluminum: 2.70, basalt: 3.0, iron: 7.87, lead: 11.3, gold: 19.3, steel: 7.85, brick: 1.9
  };
  EM.FLUIDS = { fresh: 1.000, salt: 1.025, oil: 0.92, syrup: 1.37, mantle: 3.3 };
  EM.floatFrac = function (rb, rf) { return rb / rf; }; // fraction under the surface when rb < rf
  EM.airyRoot = function (h, rc, rm) { return h * rc / (rm - rc); };       // Airy isostasy: root under a range of height h
  EM.iceSink = function (H, rIce, rm) { return H * rIce / rm; };          // land pushed down under ice H thick, when balanced

  /* ---------- moving sediment ----------
     Hjulström-style curves (after Hjulström 1935, for water about 1 m deep), mean flow speed in cm/s, grain size d in mm.
     erode: speed that lifts loose grains of that size (cohesive clay and silt need more); deposit: below it, moving grains settle.
     The real boundaries are bands, not lines. */
  EM.hjulErode = function (d) { var f = 20 * M.pow(0.2 / d, 0.45), c = 30 * M.sqrt(d); return M.sqrt(f * f + c * c); };
  EM.hjulDeposit = function (d) { return M.min(0.7 * EM.hjulErode(d), 9 * M.pow(d, 0.9)); };
  EM.hjulField = function (d, v) { return v >= EM.hjulErode(d) ? 'eroded' : v < EM.hjulDeposit(d) ? 'deposited' : 'carried'; };
  EM.phi = function (d) { return -M.log(d) / M.LN2; };
  EM.SIZES = [['clay', 0, 1 / 256], ['silt', 1 / 256, 1 / 16], ['sand', 1 / 16, 2], ['granules', 2, 4], ['pebbles', 4, 64], ['cobbles', 64, 256], ['boulders', 256, 1e9]]; // Wentworth, mm
  EM.sizeClass = function (d) { for (var i = 0; i < EM.SIZES.length; i++) if (d < EM.SIZES[i][2]) return EM.SIZES[i][0]; return 'boulders'; };

  /* ---------- weathering: a cube cut into smaller cubes ----------
     cuts: cuts through each edge (1 cut halves every edge: 8 cubes). Total area grows in proportion to pieces per edge. */
  EM.cube = function (side, cuts) { var k = cuts + 1, s = side / k; return { pieces: k * k * k, side: s, area: 6 * side * side * k, ratio: k, area0: 6 * side * side }; };

  /* ---------- radioactive clocks ---------- */
  EM.ISOTOPES = {
    'C-14': { p: 'carbon-14', d: 'nitrogen-14', h: 5730, unit: 'years', range: 'up to about 50,000 years, once-living things' },
    'K-40': { p: 'potassium-40', d: 'argon-40', h: 1.25e9, unit: 'years', range: 'about 100,000 years to the age of Earth; volcanic rock' },
    'U-238': { p: 'uranium-238', d: 'lead-206', h: 4.47e9, unit: 'years', range: 'about 1 million years to the age of Earth; zircon crystals' },
    'U-235': { p: 'uranium-235', d: 'lead-207', h: 7.04e8, unit: 'years', range: 'about 1 million years to the age of Earth; zircon crystals' },
    'Rb-87': { p: 'rubidium-87', d: 'strontium-87', h: 4.88e10, unit: 'years', range: 'about 10 million years and older; old igneous and metamorphic rock' }
  };
  EM.left = function (halfLives) { return M.pow(0.5, halfLives); };
  EM.ageFromRatio = function (DP, h) { return h * M.log(1 + DP) / M.LN2; }; // assumes no daughter atoms at the start

  /* ---------- deep time (International Chronostratigraphic Chart, rounded; Ma = million years ago) ---------- */
  EM.EARTH_MA = 4540;
  EM.analogy = function (ma, kind) { // where an event falls if all of Earth's history were one year, one day or a 100 m field
    var f = 1 - ma / EM.EARTH_MA;
    if (kind === 'day') { var s = f * 86400; return { f: f, h: M.floor(s / 3600), m: M.floor(s % 3600 / 60), s: s % 60, before: (1 - f) * 86400 }; }
    if (kind === 'field') return { f: f, m: f * 100, left: (1 - f) * 100 };
    var days = f * 365, d0 = M.floor(days), q = EM.dateOf(d0 + 1), secs = (days - d0) * 86400;
    return { f: f, month: q.m, day: q.d, h: M.floor(secs / 3600), min: M.floor(secs % 3600 / 60), before: (1 - f) * 365 * 86400 };
  };

  /* ---------- plates ---------- */
  // rate at which the distance between two stations changes (mm/yr; + opening, − closing) and the sideways part
  EM.relMotion = function (a, b) { // a, b: {x, y (km east and north), ve, vn (mm/yr)}
    var dx = b.x - a.x, dy = b.y - a.y, L = M.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, rx = b.ve - a.ve, ry = b.vn - a.vn;
    return { ve: rx, vn: ry, speed: M.hypot(rx, ry), along: rx * ux + ry * uy, across: -rx * uy + ry * ux };
  };
  /* geomagnetic polarity time scale (Ma), normal intervals since 6 Ma (Brunhes, Jaramillo, Olduvai, Gauss with
     Kaena and Mammoth reversed, then the Gilbert's normal subchrons); rounded from the Geologic Time Scale 2012/2020. */
  EM.NORMAL = [[0, 0.773], [0.988, 1.072], [1.775, 1.934], [2.595, 3.032], [3.116, 3.207], [3.330, 3.596], [4.187, 4.300], [4.493, 4.631], [4.799, 4.896], [4.997, 5.235]];
  EM.polarity = function (ma) { for (var i = 0; i < EM.NORMAL.length; i++) if (ma >= EM.NORMAL[i][0] && ma < EM.NORMAL[i][1]) return 1; return -1; };

  /* ---------- earthquakes ---------- */
  EM.spDistance = function (lag, vp, vs) { vp = vp || 6; vs = vs || 3.5; return lag * vp * vs / (vp - vs); }; // km
  EM.ampRatio = function (dM) { return M.pow(10, dM); };
  EM.energyRatio = function (dM) { return M.pow(10, 1.5 * dM); };
  EM.moment = function (areaKm2, slipM, mu) { return (mu || 3e10) * areaKm2 * 1e6 * slipM; }; // N·m
  EM.mw = function (M0) { return 2 / 3 * (M.log10(M0) - 9.1); };
  // a simple shaking model for the intensity map (Modified Mercalli): stronger for bigger quakes, weaker with distance,
  // about one step stronger on soft sediment. Illustration only: real maps come from recordings and reports.
  EM.mmi = function (Mag, km, soft) { var r = M.sqrt(km * km + 100); return clamp(1.5 * Mag - 3 * M.log10(r) + 1.5 + (soft ? 1 : 0), 1, 12); };
  EM.ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  /* ---------- volcanoes ---------- */
  EM.VEI = [ // volume of material thrown out (m³): lower bound of each step
    { v: 0, lo: 0, txt: 'less than 10,000 m³', ex: 'gentle lava eruptions, such as most at Kīlauea, Hawaiʻi' },
    { v: 1, lo: 1e4, txt: '10,000 m³ or more', ex: 'small explosions, such as Stromboli, Italy' },
    { v: 2, lo: 1e6, txt: '1,000,000 m³ or more', ex: 'moderate explosions' },
    { v: 3, lo: 1e7, txt: '10 million m³ or more', ex: 'Nevado del Ruiz, Colombia, 1985' },
    { v: 4, lo: 1e8, txt: '0.1 km³ or more', ex: 'Eyjafjallajökull, Iceland, 2010' },
    { v: 5, lo: 1e9, txt: '1 km³ or more', ex: 'Mount St. Helens, Washington, 1980' },
    { v: 6, lo: 1e10, txt: '10 km³ or more', ex: 'Pinatubo, Philippines, 1991; Krakatau, Indonesia, 1883' },
    { v: 7, lo: 1e11, txt: '100 km³ or more', ex: 'Tambora, Indonesia, 1815' },
    { v: 8, lo: 1e12, txt: '1,000 km³ or more', ex: 'Yellowstone, about 2.1 million years ago; Toba, about 74,000 years ago' }
  ];

  /* ---------- water ---------- */
  // where Earth's water is (USGS Water Science School, from Gleick 1996): % of all water and % of fresh water
  EM.WATER = [
    { n: 'Oceans', all: 96.54, fresh: null, res: 'about 3,000 years' },
    { n: 'Ice caps, glaciers and permanent snow', all: 1.74, fresh: 68.7, res: 'hundreds to hundreds of thousands of years' },
    { n: 'Groundwater', all: 1.69, fresh: 30.1, res: 'days to over 10,000 years' },
    { n: 'Ground ice and permafrost', all: 0.022, fresh: 0.86, res: 'thousands of years' },
    { n: 'Lakes', all: 0.013, fresh: 0.26, res: 'about 10 to 100 years' },
    { n: 'Soil moisture', all: 0.001, fresh: 0.05, res: 'weeks to months' },
    { n: 'Atmosphere', all: 0.001, fresh: 0.04, res: 'about 9 days' },
    { n: 'Swamps and marshes', all: 0.0008, fresh: 0.03, res: 'years' },
    { n: 'Rivers', all: 0.0002, fresh: 0.006, res: 'weeks to months' },
    { n: 'Living things', all: 0.0001, fresh: 0.003, res: 'about a week' }
  ];
  EM.darcy = function (K, A, dh, L) { return K * A * dh / L; }; // m³/day when K in m/day, A in m², dh and L in m
  EM.SOILS = { gravel: { por: 30, K: 300 }, sand: { por: 35, K: 20 }, clay: { por: 50, K: 1e-4 } }; // typical porosity (%) and K (m/day)

  /* ---------- seawater: density at the surface from UNESCO EOS-80 (kg/m³; T in °C, S in g/kg) ---------- */
  EM.seawater = function (T, S) {
    var rw = 999.842594 + 6.793952e-2 * T - 9.095290e-3 * T * T + 1.001685e-4 * T * T * T - 1.120083e-6 * T * T * T * T + 6.536332e-9 * M.pow(T, 5);
    var A = 8.24493e-1 - 4.0899e-3 * T + 7.6438e-5 * T * T - 8.2467e-7 * T * T * T + 5.3875e-9 * T * T * T * T;
    var B = -5.72466e-3 + 1.0227e-4 * T - 1.6546e-6 * T * T, C = 4.8314e-4;
    return rw + A * S + B * M.pow(S, 1.5) + C * S * S;
  };

  /* ---------- the atmosphere: U.S. Standard Atmosphere 1976 ----------
     Below 86 km: layers of constant lapse rate in geopotential height, hydrostatic pressure. Above: tabulated values. */
  var US76 = [[0, 288.15, -6.5], [11, 216.65, 0], [20, 216.65, 1.0], [32, 228.65, 2.8], [47, 270.65, 0], [51, 270.65, -2.8], [71, 214.65, -2.0], [84.852, 186.946, 0]];
  var US76P = [101325]; (function () { var g0 = 9.80665, Mm = 0.0289644, Rs = 8.3144598; for (var i = 1; i < US76.length; i++) { var a = US76[i - 1], dh = (US76[i][0] - a[0]) * 1000, L = a[2] / 1000, P0 = US76P[i - 1]; US76P.push(L === 0 ? P0 * M.exp(-g0 * Mm * dh / (Rs * a[1])) : P0 * M.pow(a[1] / (a[1] + L * dh), g0 * Mm / (Rs * L))); } })();
  var UPPER = [[86, 186.87, 0.3734], [90, 186.87, 0.1836], [100, 195.08, 0.03201], [110, 240.0, 0.007104], [120, 360.0, 0.002538]];
  EM.atm = function (z) { // z: geometric height in km -> {T (K), P (Pa), rho (kg/m³)}
    var T, P;
    if (z < 86) {
      var h = 6356.766 * z / (6356.766 + z), i = US76.length - 1; while (i > 0 && h < US76[i][0]) i--;
      var a = US76[i], dh = (h - a[0]) * 1000, L = a[2] / 1000, g0 = 9.80665, Mm = 0.0289644, Rs = 8.3144598;
      T = a[1] + L * dh; P = L === 0 ? US76P[i] * M.exp(-g0 * Mm * dh / (Rs * a[1])) : US76P[i] * M.pow(a[1] / T, g0 * Mm / (Rs * L));
    } else { T = interp(UPPER.map(function (r) { return [r[0], r[1]]; }), z); P = interpLog(UPPER.map(function (r) { return [r[0], r[2]]; }), z); }
    return { T: T, P: P, rho: P * 0.0289644 / (8.3144598 * T) };
  };
  EM.ATM_LAYERS = [['troposphere', 0, 11], ['stratosphere', 11, 50], ['mesosphere', 50, 85], ['thermosphere', 85, 120]];
  EM.AIR = [['nitrogen', 78.08], ['oxygen', 20.95], ['argon', 0.93], ['carbon dioxide', 0.04]]; // % of dry air
  EM.INHG = 33.8639; // hPa per inch of mercury
  EM.MMHG = 1.33322; // hPa per mm of mercury

  /* ---------- water vapor (Magnus formula with Bolton's 1980 constants, over liquid water) ---------- */
  EM.esat = function (T) { return 6.112 * M.exp(17.67 * T / (T + 243.5)); };                      // hPa
  EM.dewpoint = function (e) { var l = M.log(e / 6.112); return 243.5 * l / (17.67 - l); };       // °C from vapor pressure (hPa)
  EM.rh = function (T, Td) { return 100 * EM.esat(Td) / EM.esat(T); };
  EM.cToF = function (c) { return c * 9 / 5 + 32; }; EM.fToC = function (f) { return (f - 32) * 5 / 9; };

  /* ---------- rising air ---------- */
  EM.pAt = function (zkm) { return 1013.25 * M.pow(1 - 2.25577e-5 * zkm * 1000, 5.25588); }; // standard pressure, hPa
  EM.moistLapse = function (T, p) { // saturated (moist) adiabatic lapse rate, °C per km, at T (°C) and p (hPa)
    var Tk = T + 273.15, es = EM.esat(T), rs = 0.622 * es / (p - es), L = 2.501e6 - 2370 * T, Rd = 287.04, cp = 1004.7, g = 9.80665;
    return 1000 * g * (1 + L * rs / (Rd * Tk)) / (cp + L * L * rs * 0.622 / (Rd * Tk * Tk));
  };
  /* parcel lifted from the ground (T0, Td0 in °C) to ztop km. rates: {dry, moist, dew} in °C/km to use fixed values
     (as a problem states them); without them: dry 9.8, the dew point from the parcel's fixed mixing ratio, moist computed.
     Returns {z[], T[], Td[], lcl (km), Tlcl} sampled every dz km. */
  EM.parcel = function (T0, Td0, ztop, rates, dz) {
    dz = dz || 0.02; var Z = [], T = [], Td = [], t = T0, lcl = null, e0 = EM.esat(Td0), p0 = EM.pAt(0), td = Td0, sat = Td0 >= T0, gap0 = T0 - Td0, n = M.round(ztop / dz);
    var dry = rates && rates.dry != null ? rates.dry : 9.8;
    for (var i = 0; i <= n; i++) {
      var z = i * dz, p = EM.pAt(z);
      if (!sat) {
        td = rates && rates.dew != null ? Td0 - rates.dew * z : EM.dewpoint(e0 * p / p0);
        if (t <= td + 1e-12) { // crossed the dew point during the last step: find where, then continue moist from there
          var gap = t - td, f = gap0 / (gap0 - gap), zl = z - dz + f * dz, Tl = T[T.length - 1] - dry * (zl - (z - dz));
          sat = true; lcl = zl; t = Tl - (rates && rates.moist != null ? rates.moist : EM.moistLapse(Tl, EM.pAt(zl))) * (z - zl);
        } else gap0 = t - td;
      }
      if (sat) td = t;
      Z.push(z); T.push(t); Td.push(td);
      var G = sat ? (rates && rates.moist != null ? rates.moist : EM.moistLapse(t, p)) : dry;
      t -= G * dz;
    }
    if (lcl === null && sat) lcl = 0;
    return { z: Z, T: T, Td: Td, lcl: lcl, Tlcl: lcl == null ? null : interp(Z.map(function (zz, i) { return [zz, T[i]]; }), lcl) };
  };
  EM.lclEspy = function (T, Td) { return 0.125 * (T - Td); }; // km, about 125 m per °C of spread

  /* ---------- radiation and Earth's energy ---------- */
  EM.planck = function (lamUm, TK) { // spectral radiance per wavelength, W m⁻² sr⁻¹ μm⁻¹
    var h = 6.62607015e-34, c = 299792458, k = 1.380649e-23, l = lamUm * 1e-6, x = h * c / (l * k * TK);
    if (x > 700) return 0; return 2 * h * c * c / M.pow(l, 5) / (M.exp(x) - 1) * 1e-6;
  };
  EM.wienPeak = function (TK) { return EM.WIEN / TK; };  // μm
  EM.sigmaT4 = function (TK) { return EM.SIGMA * M.pow(TK, 4); };
  EM.Te = function (S, albedo) { return M.pow((S || EM.S0) * (1 - albedo) / (4 * EM.SIGMA), 0.25); }; // K
  EM.Ts1 = function (Te, eps) { return Te * M.pow(2 / (2 - eps), 0.25); }; // one-layer greenhouse
  EM.co2Forcing = function (C, C0) { return 5.35 * M.log(C / (C0 || 280)); }; // W/m²
  /* feedback parameters (W m⁻² K⁻¹), IPCC AR6 best estimates: Planck −3.22, water vapor + lapse rate +1.30, surface albedo
     (ice and snow) +0.35, clouds +0.42 (very likely −0.10 to +0.94). Warming at balance = forcing / −(sum). */
  EM.FEEDBACK = { planck: -3.22, vapor: 1.30, ice: 0.35, clouds: 0.42 };
  /* two-box climate model (after Held et al. 2010): an upper ocean (heat capacity 8 W yr m⁻² K⁻¹) and a deep ocean (100),
     exchanging 0.7 W m⁻² K⁻¹ per degree of difference. F(t) forcing in W/m², lam = −(sum of feedbacks). Yearly steps. */
  EM.twoBox = function (F, years, lam, dt) {
    dt = dt || 0.1; var C = 8, C0 = 100, g = 0.7, T = 0, T0 = 0, out = [[0, 0]];
    for (var t = dt; t <= years + 1e-9; t += dt) { var f = F(t); var dT = (f - lam * T - g * (T - T0)) / C, dT0 = g * (T - T0) / C0; T += dT * dt; T0 += dT0 * dt; if (M.abs(t - M.round(t)) < dt / 2) out.push([M.round(t), T]); }
    return out;
  };

  /* ---------- wind ---------- */
  EM.OMEGA = 7.292e-5;
  EM.coriolisF = function (lat) { return 2 * EM.OMEGA * M.sin(lat * RAD); };
  EM.geostrophic = function (dpHpa, km, lat, rho) { var f = M.abs(EM.coriolisF(lat)); return f < 1e-9 ? Infinity : dpHpa * 100 / ((rho || 1.2) * f * km * 1000); }; // m/s

  /* ---------- station models ---------- */
  EM.pcode = function (hPa) { var t = M.round(hPa * 10) % 1000; return ('00' + t).slice(-3); };
  EM.pdecode = function (code) { var c = parseInt(code, 10); return c >= 500 ? 900 + c / 10 : 1000 + c / 10; };

  /* ---------- clouds and precipitation ---------- */
  // fall speed of water drops in still air near sea level (m/s) by diameter (mm): Gunn and Kinzer (1949); Stokes' law below 0.08 mm
  var GK = [[0.08, 0.17], [0.1, 0.27], [0.2, 0.72], [0.3, 1.17], [0.4, 1.62], [0.5, 2.06], [0.6, 2.47], [0.8, 3.27], [1.0, 4.03], [1.4, 5.17], [1.8, 6.09], [2.0, 6.49], [2.6, 7.57], [3.0, 8.06], [4.0, 8.83], [5.0, 9.09], [5.8, 9.17]];
  EM.fallSpeed = function (dmm) { if (dmm < 0.08) { var r = dmm / 2000; return 2 / 9 * 1000 * 9.8 * r * r / 1.81e-5; } return interp(GK, dmm); };
  EM.dropCount = function (r1, r2) { return M.pow(r2 / r1, 3); };
  /* precipitation type from a temperature profile [[height m, T °C], ...] from cloud base down to the ground.
     Simple rule of thumb: a flake melts fully when the warm layer's area above 0 °C passes 1,000 °C·m (partly from 200);
     a melted drop refreezes into sleet when the cold layer at the ground has more than 1,200 °C·m below 0 °C. */
  EM.ptype = function (prof) {
    var P = prof.slice().sort(function (a, b) { return b[0] - a[0]; }), warm = 0, coldBelow = 0, seenWarm = false;
    for (var i = 1; i < P.length; i++) {
      var a = P[i - 1], b = P[i], dz = a[0] - b[0], N = 20;
      for (var j = 0; j < N; j++) { var t = lerp(a[1], b[1], (j + 0.5) / N); if (t > 0) { warm += t * dz / N; seenWarm = true; } else if (seenWarm) coldBelow += -t * dz / N; }
    }
    var ground = P[P.length - 1][1], melt = warm >= 1000 ? 1 : warm <= 200 ? 0 : (warm - 200) / 800;
    var kind = melt === 0 ? (ground > 0 ? 'rain' : 'snow') : melt < 1 ? (ground > 0 ? 'rain' : coldBelow > 1200 ? 'sleet' : 'snow and sleet') : ground > 0 ? 'rain' : coldBelow > 1200 ? 'sleet' : 'freezing rain';
    if (melt === 0 && ground > 0) kind = ground > 3 ? 'rain' : 'snow'; // a shallow warm layer at the ground: wet snow that may still land as snow
    return { kind: kind, warm: warm, cold: coldBelow, melt: melt };
  };

  /* ---------- storms ---------- */
  EM.SOUND = 343; // m/s at 20 °C
  EM.EF = [[0, 65, 85], [1, 86, 110], [2, 111, 135], [3, 136, 165], [4, 166, 200], [5, 201, 999]]; // mph, 3-second gusts
  EM.SS = [[1, 74, 95], [2, 96, 110], [3, 111, 129], [4, 130, 156], [5, 157, 999]]; // mph, 1-minute sustained winds
  EM.ssCat = function (mph) { for (var i = EM.SS.length - 1; i >= 0; i--) if (mph >= EM.SS[i][1]) return EM.SS[i][0]; return 0; };
  EM.efOf = function (mph) { for (var i = EM.EF.length - 1; i >= 0; i--) if (mph >= EM.EF[i][1]) return EM.EF[i][0]; return -1; };

  /* ---------- climate: Köppen classes ----------
     Convention used here (Peel et al. 2007, with −3 °C between C and D): E if the warmest month is below 10 °C;
     otherwise B if the yearly precipitation is below the dryness threshold 20·(mean temp) + 280 mm when 70% or more falls in
     the summer half, + 140 when 30–70%, + 0 when under 30% (desert if under half the threshold); otherwise A if the coldest
     month is 18 °C or warmer; C if the coldest month is above −3 °C; else D. Summer is the warmer half of the year. */
  EM.koppen = function (T, P) {
    var s = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); }, MAT = s(T) / 12, MAP = s(P), Tw = M.max.apply(null, T), Tc = M.min.apply(null, T);
    var nhs = [3, 4, 5, 6, 7, 8], shs = [9, 10, 11, 0, 1, 2], sumN = s(nhs.map(function (i) { return T[i]; })), sumS = s(shs.map(function (i) { return T[i]; }));
    var summer = sumN >= sumS ? nhs : shs, winter = sumN >= sumS ? shs : nhs, Ps = s(summer.map(function (i) { return P[i]; })), share = MAP > 0 ? Ps / MAP : 0.5;
    var Pth = 20 * MAT + (share >= 0.7 ? 280 : share >= 0.3 ? 140 : 0), steps = [], code;
    var Psdry = M.min.apply(null, summer.map(function (i) { return P[i]; })), Pwdry = M.min.apply(null, winter.map(function (i) { return P[i]; }));
    var Pswet = M.max.apply(null, summer.map(function (i) { return P[i]; })), Pwwet = M.max.apply(null, winter.map(function (i) { return P[i]; }));
    var Pdry = M.min.apply(null, P), n10 = T.filter(function (t) { return t >= 10; }).length;
    function third() { return Tw >= 22 ? 'a' : n10 >= 4 ? 'b' : Tc < -38 ? 'd' : 'c'; }
    function second() { return (Psdry < 40 && Psdry < Pwwet / 3) ? 's' : (Pwdry < Pswet / 10) ? 'w' : 'f'; }
    steps.push({ q: 'Is the warmest month below 10 °C?', v: Tw < 10 });
    if (Tw < 10) { code = 'E' + (Tw >= 0 ? 'T' : 'F'); }
    else {
      steps.push({ q: 'Is the yearly precipitation below the dryness threshold?', v: MAP < Pth, pth: Pth });
      if (MAP < Pth) code = 'B' + (MAP < Pth / 2 ? 'W' : 'S') + (MAT >= 18 ? 'h' : 'k');
      else {
        steps.push({ q: 'Is the coldest month 18 °C or warmer?', v: Tc >= 18 });
        if (Tc >= 18) code = 'A' + (Pdry >= 60 ? 'f' : Pdry >= 100 - MAP / 25 ? 'm' : 'w');
        else { steps.push({ q: 'Is the coldest month warmer than −3 °C?', v: Tc > -3 }); code = (Tc > -3 ? 'C' : 'D') + second() + third(); }
      }
    }
    var NAMES = { A: 'tropical', B: 'dry', C: 'temperate', D: 'continental', E: 'polar' };
    return { code: code, group: code[0], name: NAMES[code[0]], MAT: MAT, MAP: MAP, Tw: Tw, Tc: Tc, Pth: Pth, share: share, steps: steps, south: sumS > sumN };
  };

  /* ---------- carbon ---------- */
  EM.PPM_GTC = 2.124; // GtC per ppm of CO₂
  /* carbon reservoirs (GtC) and yearly fluxes (GtC/yr), rounded. Reservoirs and gross fluxes after the IPCC carbon-cycle
     figures (AR5 WG1 Fig. 6.1, AR6 WG1 Fig. 5.12: photosynthesis about 123, respiration and fire about 119, ocean exchange
     about 80 in and 78 out, weathering 0.3, volcanoes 0.1, burial 0.2), the kind NASA and NOAA redraw; net human-era fluxes are
     2013–2022 averages from the Global Carbon Budget 2023 (fossil 9.6, land use 1.3, air 5.2, ocean 2.8, land 3.3). Rocks:
     tens of millions of GtC. Entered by hand; check the sources before quoting one value. */
  EM.CARBON = {
    res: { air: 890, plants: 450, soils: 1700, permafrost: 1400, surface: 900, deep: 37000, fossil: 1500 }, // fossil reserves about 1,000–2,000
    flux: { photo: 120, resp: 118, oceanIn: 80, oceanOut: 78, fossil: 10, landUse: 1.3, weathering: 0.3, volcano: 0.1, burial: 0.2, mixing: 90 },
    now: { year: 2023, ppm: 420, preppm: 280, ocean: 2.8, land: 3.3 } // pre-industrial about 280 ppm = 595 GtC
  };
  /* a simple carbon run: sinks grow in proportion to the extra carbon in the air (fitted so 300 GtC extra gives today's
     ocean 2.8 and land 3.3 GtC/yr). E(t): emissions GtC/yr. Or a fixed airborne fraction af. Returns yearly rows. */
  EM.carbonRun = function (E, years, af, C0) {
    var C = C0 || EM.CARBON.now.ppm * EM.PPM_GTC, pre = EM.CARBON.now.preppm * EM.PPM_GTC, ko = 2.8 / 300, kl = 3.3 / 300, out = [];
    for (var y = 0; y < years; y++) {
      var e = typeof E === 'function' ? E(y) : E, ex = M.max(0, C - pre), oc, la;
      if (af != null) { oc = e * (1 - af) * (ko / (ko + kl)); la = e * (1 - af) * (kl / (ko + kl)); } else { oc = ko * ex; la = kl * ex; }
      var grow = e - oc - la; C += grow; out.push({ y: y + 1, e: e, ocean: oc, land: la, air: grow, C: C, ppm: C / EM.PPM_GTC, af: e > 0 ? grow / e : null });
    }
    return out;
  };

  /* ---------- climate records (entered by hand, rounded; check the sources before quoting a single value) ---------- */
  // NASA GISTEMP v4 global annual mean surface temperature anomaly (°C, vs 1951–1980), 1880–2024
  EM.GISTEMP = { y0: 1880, v: [-.17, -.09, -.11, -.17, -.28, -.33, -.31, -.36, -.17, -.10, -.35, -.22, -.27, -.31, -.30, -.22, -.11, -.11, -.27, -.17,
    -.08, -.15, -.28, -.37, -.47, -.26, -.22, -.39, -.43, -.48, -.43, -.44, -.36, -.34, -.15, -.14, -.36, -.46, -.29, -.27,
    -.27, -.18, -.28, -.26, -.27, -.22, -.10, -.21, -.20, -.36, -.15, -.10, -.16, -.29, -.12, -.20, -.15, -.03, -.02, -.02,
    .13, .18, .06, .09, .20, .09, -.07, -.03, -.11, -.11, -.17, -.07, .01, .08, -.13, -.14, -.19, .05, .06, .03,
    -.03, .06, .03, .05, -.20, -.11, -.06, -.02, -.08, .05, .03, -.08, .01, .16, -.07, -.01, -.10, .18, .07, .16,
    .26, .32, .14, .31, .16, .12, .18, .32, .39, .27, .45, .40, .22, .23, .31, .45, .33, .46, .61, .38,
    .39, .54, .63, .62, .53, .68, .64, .66, .54, .65, .72, .61, .65, .68, .75, .90, 1.01, .92, .85, .98,
    1.01, .85, .89, 1.17, 1.28] };
  // NOAA Mauna Loa CO₂ annual means (ppm), 1959–2024
  EM.MLO = { y0: 1959, v: [316.0, 316.9, 317.6, 318.5, 319.0, 319.6, 320.0, 321.4, 322.2, 323.1, 324.6, 325.7, 326.3, 327.5, 329.7, 330.2, 331.1, 332.0, 333.8, 335.4,
    336.8, 338.8, 340.1, 341.5, 343.2, 344.9, 346.4, 347.6, 349.3, 351.7, 353.2, 354.5, 355.7, 356.5, 357.2, 359.0, 361.0, 362.7, 363.9, 366.8,
    368.5, 369.7, 371.3, 373.5, 376.0, 377.7, 380.0, 382.1, 384.0, 385.8, 387.6, 390.1, 391.9, 394.1, 396.7, 398.8, 401.0, 404.4, 406.8, 408.7,
    411.7, 414.2, 416.5, 418.6, 421.1, 424.6] };
  // the average seasonal cycle at Mauna Loa (ppm above or below the yearly mean, Jan–Dec, approximate): highest in May, lowest in Sep–Oct
  EM.MLO_SEASON = [0.0, 0.6, 1.3, 2.5, 3.0, 2.3, 0.8, -1.3, -3.0, -3.2, -2.0, -0.9];
  // NSIDC Arctic sea-ice extent, September monthly average (million km²), 1979–2024, rounded to 0.1
  EM.SEAICE = { y0: 1979, v: [7.1, 7.7, 7.1, 7.3, 7.4, 6.8, 6.7, 7.4, 7.3, 7.4, 7.0, 6.1, 6.5, 7.5, 6.4, 7.1, 6.1, 7.6, 6.7, 6.5,
    6.1, 6.3, 6.7, 5.8, 6.1, 6.0, 5.5, 5.9, 4.3, 4.7, 5.3, 4.9, 4.6, 3.6, 5.2, 5.2, 4.6, 4.5, 4.8, 4.8,
    4.4, 4.0, 5.0, 4.9, 4.4, 4.3] };
  // satellite-era global mean sea level: a smooth fit, not the measurements (about 10 cm of rise 1993–2023, rising faster now)
  EM.seaLevel = function (y) { var t = y - 1993; return 2.1 * t + 0.042 * t * t; }; // mm above 1993
  // a sketch drawn after the EPICA Dome C ice core: [thousand years ago, CO₂ ppm, Antarctic temperature change °C]; shape only
  EM.EPICA = [[0, 280, 0], [10, 265, 0], [18, 190, -8], [60, 210, -6], [110, 230, -4], [128, 285, 3], [140, 195, -9], [160, 190, -9], [200, 240, -4],
    [240, 270, 1], [260, 190, -8], [280, 220, -5], [325, 295, 2.5], [345, 200, -8], [380, 230, -5], [410, 285, 1.5], [430, 190, -9], [470, 220, -6],
    [500, 245, -2], [530, 200, -7], [580, 250, -1], [640, 190, -8], [670, 175, -9], [690, 255, -1], [720, 230, -4], [750, 190, -8], [790, 250, -1], [800, 200, -6]];
  // IPCC AR6 WG1 SPM Table SPM.1: warming 2081–2100 vs 1850–1900, best estimate and very likely range (°C)
  EM.SSP = [['SSP1-1.9', 1.4, 1.0, 1.8], ['SSP1-2.6', 1.8, 1.3, 2.4], ['SSP2-4.5', 2.7, 2.1, 3.5], ['SSP3-7.0', 3.6, 2.8, 4.6], ['SSP5-8.5', 4.4, 3.3, 5.7]];
  /* climographs: rounded monthly normals (about 1991–2020) for teaching; T in °C, P in mm. lat > 0 north. */
  EM.CITIES = {
    singapore: { n: 'Singapore', lat: 1.4, T: [26.5, 27, 27.5, 28, 28.5, 28.5, 28, 28, 27.5, 27.5, 27, 26.5], P: [220, 105, 170, 165, 165, 135, 155, 170, 155, 170, 255, 315] },
    miami: { n: 'Miami, USA', lat: 25.8, T: [20, 21, 22.5, 24.5, 26.5, 28, 29, 29, 28.5, 26.5, 24, 21.5], P: [45, 55, 65, 80, 150, 265, 185, 245, 260, 180, 80, 60] },
    mumbai: { n: 'Mumbai, India', lat: 19.1, T: [24.5, 25.5, 27.5, 29, 30, 29, 28, 27.5, 28, 29, 28.5, 26.5], P: [0, 0, 0, 0, 15, 525, 840, 525, 340, 90, 15, 5] },
    darwin: { n: 'Darwin, Australia', lat: -12.4, T: [28.5, 28.5, 28.5, 28.5, 27, 25.5, 25, 26, 27.5, 29, 29.5, 29], P: [420, 375, 315, 100, 20, 0, 0, 5, 15, 70, 140, 250] },
    phoenix: { n: 'Phoenix, USA', lat: 33.4, T: [14, 16, 19, 23, 28, 33.5, 35.5, 34.5, 31.5, 25.5, 18.5, 13], P: [20, 20, 20, 5, 5, 0, 25, 25, 15, 15, 15, 25] },
    cairo: { n: 'Cairo, Egypt', lat: 30.0, T: [14, 15, 18, 21, 25, 28, 28, 28, 27, 24, 19, 15], P: [5, 4, 4, 1, 0, 0, 0, 0, 0, 1, 3, 5] },
    lima: { n: 'Lima, Peru', lat: -12.0, T: [23, 23.5, 23, 21, 19, 17.5, 17, 16.5, 17, 18, 19.5, 21.5], P: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0] },
    denver: { n: 'Denver, USA', lat: 39.7, T: [0, 0, 5, 9, 14, 20, 23.5, 22.5, 18, 11, 4, -0.5], P: [10, 10, 25, 45, 55, 45, 55, 45, 30, 25, 15, 10] },
    rome: { n: 'Rome, Italy', lat: 41.8, T: [8, 9, 11, 14, 18, 22, 25, 25, 21, 17, 12, 9], P: [65, 70, 60, 75, 50, 30, 20, 35, 75, 110, 110, 80] },
    seattle: { n: 'Seattle, USA', lat: 47.4, T: [5.5, 6.5, 8, 10, 13.5, 16, 19, 19.5, 16.5, 11.5, 7.5, 5.5], P: [145, 95, 105, 80, 50, 35, 15, 20, 40, 95, 160, 135] },
    capetown: { n: 'Cape Town, South Africa', lat: -33.9, T: [21.5, 21.5, 20.5, 18, 16, 14, 13, 13.5, 14.5, 16.5, 18.5, 20.5], P: [15, 15, 20, 40, 70, 95, 85, 80, 45, 30, 15, 15] },
    london: { n: 'London, UK', lat: 51.5, T: [5.5, 6, 8, 10.5, 13.5, 16.5, 19, 18.5, 16, 12.5, 8.5, 6], P: [55, 40, 40, 45, 45, 45, 45, 55, 50, 65, 65, 55] },
    sydney: { n: 'Sydney, Australia', lat: -33.9, T: [23.5, 23.5, 22, 19.5, 16.5, 14, 13, 14, 16.5, 18.5, 20.5, 22], P: [90, 130, 130, 125, 95, 130, 75, 80, 65, 75, 85, 75] },
    chicago: { n: 'Chicago, USA', lat: 41.9, T: [-4, -2, 3, 9, 15, 21, 24, 23, 19, 12, 5, -1], P: [50, 50, 65, 95, 115, 105, 95, 110, 85, 90, 60, 55] },
    moscow: { n: 'Moscow, Russia', lat: 55.8, T: [-6, -6, -1, 6.5, 13, 17, 19, 17, 11.5, 5.5, -0.5, -4.5], P: [55, 45, 40, 35, 60, 75, 85, 80, 65, 70, 50, 50] },
    fairbanks: { n: 'Fairbanks, USA', lat: 64.8, T: [-22, -18, -11, 0, 9, 15, 17, 14, 8, -3, -15, -20], P: [15, 12, 8, 7, 15, 40, 55, 50, 30, 20, 18, 15] },
    yakutsk: { n: 'Yakutsk, Russia', lat: 62.0, T: [-38.5, -33.5, -20, -5, 7.5, 16.5, 19.5, 15, 6, -8, -27, -37.5], P: [10, 8, 6, 10, 20, 35, 40, 40, 25, 20, 15, 10] },
    utqiagvik: { n: 'Utqiaġvik (Barrow), USA', lat: 71.3, T: [-25, -27, -25, -17, -6, 2, 5, 4, 0, -8, -17, -23], P: [5, 4, 3, 4, 4, 8, 25, 25, 15, 10, 5, 4] }
  };
  // least-squares slope of [[x, y], …]
  EM.slope = function (pts) { var n = pts.length, sx = 0, sy = 0, sxx = 0, sxy = 0; pts.forEach(function (p) { sx += p[0]; sy += p[1]; sxx += p[0] * p[0]; sxy += p[0] * p[1]; }); var d = n * sxx - sx * sx; return d ? (n * sxy - sx * sy) / d : 0; };
  /* ---------- chance and recurrence ---------- */
  EM.recurrence = function (n, m) { return (n + 1) / m; };              // years, for rank m in n years of record
  EM.atLeastOne = function (p, n) { return 1 - M.pow(1 - p, n); };
  EM.lorenz = function (s, dt) { // one RK4 step of the Lorenz (1963) system, sigma 10, rho 28, beta 8/3
    function f(x) { return [10 * (x[1] - x[0]), x[0] * (28 - x[2]) - x[1], x[0] * x[1] - 8 / 3 * x[2]]; }
    var k1 = f(s), a = s.map(function (v, i) { return v + dt / 2 * k1[i]; }), k2 = f(a), b = s.map(function (v, i) { return v + dt / 2 * k2[i]; }), k3 = f(b), c = s.map(function (v, i) { return v + dt * k3[i]; }), k4 = f(c);
    return s.map(function (v, i) { return v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]); });
  };

  /* ================= the drawing kit (needs math/viz/core.js) ================= */
  var V = ML.viz;
  if (!V) { if (W.console) W.console.warn('earth/viz/earth.js: load math/viz/core.js first'); return; }
  var fm = V.fmt, mk = V.el, R = V.register;
  function isDark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function rgb(hex) { var v = parseInt(hex.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function rgba(hex, a) { if (hex.charAt(0) !== '#') return hex; var c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function mix(h1, h2, t) { var a = rgb(h1), b = rgb(h2); return 'rgb(' + M.round(lerp(a[0], b[0], t)) + ',' + M.round(lerp(a[1], b[1], t)) + ',' + M.round(lerp(a[2], b[2], t)) + ')'; }
  function mixHex(h1, h2, t) { var a = rgb(h1), b = rgb(h2), c = [0, 1, 2].map(function (i) { return M.round(lerp(a[i], b[i], t)); }); return '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1); }
  /* pal(): the theme's colors plus the ladder's own: rust accent, sky, sea, land, rock, space (always dark) … */
  function pal() {
    var k = V.colors(), d = isDark();
    k.dark = d;
    k.rust = d ? '#e8a07f' : '#9c4a2f'; k.rustSoft = d ? 'rgba(232,160,127,0.22)' : 'rgba(156,74,47,0.12)';
    k.acc = d ? '#6cc79a' : '#00562f'; k.racing = '#004225'; k.brass = '#b8963e';
    k.space = '#06111a'; k.space2 = '#0c1c2a'; k.spaceInk = '#dbe7ef'; k.spaceMuted = '#8fb3c6'; k.spaceLine = 'rgba(143,179,198,0.28)';
    k.sky = d ? '#1b2e40' : '#dcecf8'; k.sky2 = d ? '#132230' : '#f3f8fc';
    k.sea = d ? '#2d6c99' : '#4a8fc4'; k.seaDeep = d ? '#183f5e' : '#215f90'; k.seaSoft = d ? 'rgba(90,160,210,0.30)' : 'rgba(74,143,196,0.22)';
    k.land = d ? '#5c8a4c' : '#93b96f'; k.landDark = d ? '#3e6334' : '#6f9752'; k.landSoft = d ? '#33472c' : '#e4eed7';
    k.sand = d ? '#b89a62' : '#e6cc93'; k.soil = d ? '#7d5c40' : '#9d7653'; k.mud = d ? '#6b6150' : '#a39478';
    k.rock = d ? '#8c8277' : '#b0a597'; k.rockDark = d ? '#5d554e' : '#7f7469'; k.rockLight = d ? '#a99e92' : '#d3cabe';
    k.crust = d ? '#a9784f' : '#b9855b'; k.mantle = d ? '#c4643a' : '#d7773f'; k.mantleDeep = d ? '#a84c2c' : '#c1592c';
    k.ocore = d ? '#e3a43a' : '#efb043'; k.icore = d ? '#f2d57a' : '#f8dd84';
    k.ice = d ? '#cfe2ee' : '#f2f9fd'; k.snow = '#ffffff'; k.cloud = d ? '#c9d3db' : '#ffffff';
    k.magma = '#e8590c'; k.lava = '#ff6b2c'; k.hot = d ? '#ff8f5a' : '#e8590c'; k.cool = d ? '#74c0fc' : '#1c6fd6';
    k.plot = d ? '#122019' : '#ffffff'; k.plotLine = d ? '#2a3d32' : '#e4ebe6';
    k.halo = d ? 'rgba(20,33,26,0.85)' : 'rgba(255,255,255,0.88)';
    k.font = 'system-ui,-apple-system,"Segoe UI",sans-serif';
    return k;
  }
  // ---------- canvas drawing helpers (pixel coordinates) ----------
  function font(o) { return (o.italic ? 'italic ' : '') + (o.bold ? '700 ' : o.weight ? o.weight + ' ' : '600 ') + (o.size || 12) + 'px ' + (o.serif ? 'Georgia,serif' : o.mono ? 'ui-monospace,Menlo,Consolas,monospace' : 'system-ui,-apple-system,"Segoe UI",sans-serif'); }
  function txt(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = font(o); ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle';
    if (o.rot) { ctx.translate(x, y); ctx.rotate(o.rot); x = 0; y = 0; }
    if (o.halo) { ctx.lineWidth = o.haloW || 3.5; ctx.strokeStyle = o.halo; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillStyle = o.color || '#000'; ctx.fillText(s, x, y); ctx.restore();
  }
  function tw(ctx, s, o) { ctx.save(); ctx.font = font(o || {}); var w = ctx.measureText(s).width; ctx.restore(); return w; }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  function pill(ctx, s, x, y, o) { // a label on a soft background; o.align: center|left|right; returns its box
    o = o || {}; var k = o.k || pal(), sz = o.size || 12, w = tw(ctx, s, { size: sz, bold: o.bold }) + 12, h = sz + 8;
    var bx = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2, by = y - h / 2;
    if (o.clamp) { bx = clamp(bx, 2, o.clamp[0] - w - 2); by = clamp(by, 2, o.clamp[1] - h - 2); }
    ctx.save(); ctx.fillStyle = o.bg || k.halo; rrect(ctx, bx, by, w, h, h / 2); ctx.fill();
    if (o.border) { ctx.strokeStyle = o.border; ctx.lineWidth = 1.2; ctx.stroke(); }
    ctx.restore(); txt(ctx, s, bx + w / 2, by + h / 2 + 0.5, { size: sz, color: o.color || k.ink, align: 'center', bold: o.bold });
    return { x: bx, y: by, w: w, h: h };
  }
  function badge(ctx, s, x, y, o) { // a lettered marker (A, B, C …) for labeling problems
    o = o || {}; var k = o.k || pal(), r = o.r || 11;
    ctx.save(); ctx.fillStyle = k.dark ? '#2b2511' : '#fff8e3'; ctx.strokeStyle = '#b8963e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    txt(ctx, s, x, y + 0.5, { size: r * 1.15, bold: true, align: 'center', color: k.dark ? '#ffe7a3' : '#5b4410' });
  }
  function arrow(ctx, x1, y1, x2, y2, o) {
    o = o || {}; var a = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(o.head || 9, L * 0.6), w = o.w || 2;
    ctx.save(); ctx.strokeStyle = o.color || '#000'; ctx.fillStyle = o.color || '#000'; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash(o.dash || []);
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.7 * M.cos(a), y2 - hs * 0.7 * M.sin(a)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.42), y2 - hs * M.sin(a - 0.42)); ctx.lineTo(x2 - hs * M.cos(a + 0.42), y2 - hs * M.sin(a + 0.42)); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function arrowHead(ctx, x, y, ang, hs, col) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - hs * M.cos(ang - 0.42), y - hs * M.sin(ang - 0.42)); ctx.lineTo(x - hs * M.cos(ang + 0.42), y - hs * M.sin(ang + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore(); }
  function line(ctx, pts, o) {
    o = o || {}; if (!pts.length) return; ctx.save(); ctx.strokeStyle = o.color || '#000'; ctx.lineWidth = o.w || 1.5; ctx.setLineDash(o.dash || []); ctx.lineJoin = 'round'; ctx.lineCap = o.cap || 'round';
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); if (o.close) ctx.closePath(); ctx.stroke(); ctx.restore();
  }
  function poly(ctx, pts, fill, stroke, w) {
    if (!pts.length) return; ctx.save(); ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w || 1; ctx.lineJoin = 'round'; ctx.stroke(); } ctx.restore();
  }
  function circle(ctx, x, y, r, fill, stroke, w) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, M.max(0, r), 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w || 1; ctx.stroke(); } ctx.restore(); }
  function knob(ctx, x, y, col, r, k) { k = k || pal(); r = r || 8; circle(ctx, x, y, r + 3, k.halo); circle(ctx, x, y, r, k.bg, col, 3); circle(ctx, x, y, r * 0.4, col); }
  function focusRing(ctx, x, y, r) { ctx.save(); ctx.strokeStyle = '#b8963e'; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(x, y, r || 15, 0, TAU); ctx.stroke(); ctx.restore(); }
  function niceStep(span, n) { var raw = span / M.max(1, n || 5), m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }
  function nf(v, d) { // a number with thousands separators and a real minus sign
    if (!isFinite(v)) return '—'; var s = M.abs(v).toLocaleString('en-US', { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: 0 });
    return (v < 0 && s.replace(/[0.,]/g, '') !== '' ? '−' : '') + s;
  }
  function sig(v, n) { if (!v) return '0'; var p = M.pow(10, (n || 3) - 1 - M.floor(M.log10(M.abs(v)))); return nf(M.round(v * p) / p, M.max(0, M.ceil(M.log10(p)))); }
  var SUPD = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  function sup(n) { return String(n).split('').map(function (c) { return SUPD[c] || c; }).join(''); }
  function sci(v, d) { // 3.0 × 10⁸
    if (!v) return '0'; var e = M.floor(M.log10(M.abs(v))), m = v / M.pow(10, e); if (M.abs(m) >= 9.995 && d != null) { m /= 10; e++; }
    if (e >= -2 && e <= 5) return nf(v, d == null ? 2 : M.max(0, d - e));
    return fm(m, d == null ? 2 : d) + ' × 10' + sup(e);
  }
  function ordinalDate(q) { return EM.months[q.m - 1] + ' ' + q.d; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  /* labeler(ctx): draws text labels that do not overlap one another. put(s, x, y, o, tries) tries each vertical
     offset in tries (default [0]) and skips the label if all collide; o as for txt. reserve([x, y, w, h]) blocks an area. */
  function labeler(ctx) {
    var placed = [];
    function free(b) { return placed.every(function (q) { return b[0] + b[2] <= q[0] || q[0] + q[2] <= b[0] || b[1] + b[3] <= q[1] || q[1] + q[3] <= b[1]; }); }
    return {
      put: function (s, x, y, o, tries) {
        o = o || {}; var w = tw(ctx, s, o) + 6, h = (o.size || 12) + 4, al = o.align || 'left';
        var at = false;
        (tries || [0]).some(function (dy) { var yy = y + dy, bx = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x, b = [bx, yy - h / 2, w, h]; if (!free(b)) return false; placed.push(b); if (o.before) o.before(yy); txt(ctx, s, x, yy, o); at = yy; return true; });
        return at;
      },
      reserve: function (b) { placed.push(b); }
    };
  }
  /* chart(ctx, k, r, ax): a plot panel in rect r = {x, y, w, h} with axes ax.x and ax.y, each
     {min, max, log, step, ticks: [values], fmt(v), label, grid (default true)}. Returns {X(v), Y(v), ix(px), iy(py), r}. */
  function chart(ctx, k, r, ax, q) {
    q = q || {};
    function mp(a, p0, len, flip) {
      var lo = a.log ? M.log10(a.min) : a.min, hi = a.log ? M.log10(a.max) : a.max;
      return {
        f: function (v) { var t = ((a.log ? M.log10(M.max(v, 1e-300)) : v) - lo) / (hi - lo); return flip ? p0 + len - t * len : p0 + t * len; },
        inv: function (px) { var t = flip ? (p0 + len - px) / len : (px - p0) / len, u = lo + t * (hi - lo); return a.log ? M.pow(10, u) : u; }
      };
    }
    var mx = mp(ax.x, r.x, r.w, !!ax.x.flip), my = mp(ax.y, r.y, r.h, !ax.y.flip);
    function ticks(a, len) {
      if (a.ticks) return a.ticks;
      if (a.log) { var out = []; for (var e = M.floor(M.log10(a.min)); e <= M.ceil(M.log10(a.max)); e++) { var v = M.pow(10, e); if (v >= a.min * 0.999 && v <= a.max * 1.001) out.push(v); } return out; }
      var st = a.step || niceStep(a.max - a.min, M.max(2, M.floor(len / (a.space || 64)))), s = [];
      for (var v2 = M.ceil(a.min / st - 1e-9) * st; v2 <= a.max + st * 1e-9; v2 += st) s.push(+v2.toFixed(10)); return s;
    }
    ctx.save();
    if (q.bg !== false) { ctx.fillStyle = q.bg || k.plot; ctx.fillRect(r.x, r.y, r.w, r.h); }
    var tx = ticks(ax.x, r.w), ty = ticks(ax.y, r.h);
    ctx.lineWidth = 1;
    function minor(a, isX) {
      if (!a.log) return; ctx.strokeStyle = k.grid2 || k.grid; ctx.beginPath();
      for (var e = M.floor(M.log10(a.min)); e < M.ceil(M.log10(a.max)); e++) for (var j = 2; j < 10; j++) { var v = j * M.pow(10, e); if (v <= a.min || v >= a.max) continue; if (isX) { var px = M.round(mx.f(v)) + 0.5; ctx.moveTo(px, r.y); ctx.lineTo(px, r.y + r.h); } else { var py = M.round(my.f(v)) + 0.5; ctx.moveTo(r.x, py); ctx.lineTo(r.x + r.w, py); } }
      ctx.stroke();
    }
    if (ax.x.grid !== false) minor(ax.x, true); if (ax.y.grid !== false) minor(ax.y, false);
    ctx.strokeStyle = k.grid; ctx.beginPath();
    if (ax.x.grid !== false) tx.forEach(function (v) { var px = M.round(mx.f(v)) + 0.5; if (px > r.x + 1 && px < r.x + r.w - 1) { ctx.moveTo(px, r.y); ctx.lineTo(px, r.y + r.h); } });
    if (ax.y.grid !== false) ty.forEach(function (v) { var py = M.round(my.f(v)) + 0.5; if (py > r.y + 1 && py < r.y + r.h - 1) { ctx.moveTo(r.x, py); ctx.lineTo(r.x + r.w, py); } });
    ctx.stroke();
    ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.strokeRect(M.round(r.x) + 0.5, M.round(r.y) + 0.5, M.round(r.w), M.round(r.h));
    var f1 = function (a) { return a.fmt || (a.log ? function (v) { return v >= 1e4 || v < 1e-3 ? '10' + sup(M.round(M.log10(v))) : nf(v, 3); } : function (v) { return fm(v, 6); }); };
    if (ax.x.labels !== false) { var fx = f1(ax.x), lastX = -1e9; tx.forEach(function (v) { var px = mx.f(v); if (px < r.x - 1 || px > r.x + r.w + 1) return; var s = fx(v), w = tw(ctx, s, { size: 11 }); if (px - w / 2 < lastX + 4) return; lastX = px + w / 2; txt(ctx, s, px, r.y + r.h + 4, { size: 11, color: k.muted, align: 'center', base: 'top', weight: 500 }); }); }
    if (ax.y.labels !== false) { var fy = f1(ax.y), side = ax.y.right; ty.forEach(function (v) { var py = my.f(v); if (py < r.y - 1 || py > r.y + r.h + 1) return; txt(ctx, fy(v), side ? r.x + r.w + 5 : r.x - 5, py, { size: 11, color: k.muted, align: side ? 'left' : 'right', weight: 500 }); }); }
    if (ax.x.label) txt(ctx, ax.x.label, r.x + r.w / 2, r.y + r.h + 20, { size: 12, color: k.ink, align: 'center', base: 'top' });
    if (ax.y.label) { if (ax.y.labelTop) txt(ctx, ax.y.label, r.x, r.y - 8, { size: 12, color: k.ink, align: 'left', base: 'bottom' }); else txt(ctx, ax.y.label, r.x - (ax.y.lpad || 38), r.y + r.h / 2, { size: 12, color: k.ink, align: 'center', rot: -PI / 2 }); }
    ctx.restore();
    return { X: mx.f, Y: my.f, ix: mx.inv, iy: my.inv, r: r, clip: function () { ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); }, unclip: function () { ctx.restore(); } };
  }

  /* ---------- seeded value noise (for terrain, rock textures) ---------- */
  function noise2(seed) {
    var r = rng(seed || 1), P = new Uint8Array(512), G = new Float32Array(256);
    for (var i = 0; i < 256; i++) { P[i] = i; G[i] = r(); }
    for (i = 255; i > 0; i--) { var j = M.floor(r() * (i + 1)), t = P[i]; P[i] = P[j]; P[j] = t; }
    for (i = 0; i < 256; i++) P[i + 256] = P[i];
    function v(x, y) { return G[P[(P[x & 255] + y) & 511]]; }
    function sm(t) { return t * t * (3 - 2 * t); }
    return function (x, y) { var xi = M.floor(x), yi = M.floor(y), fx = sm(x - xi), fy = sm(y - yi); return lerp(lerp(v(xi, yi), v(xi + 1, yi), fx), lerp(v(xi, yi + 1), v(xi + 1, yi + 1), fx), fy); };
  }
  function fbm(n, x, y, oct) { var s = 0, a = 0.5, f = 1, t = 0; for (var i = 0; i < (oct || 4); i++) { s += a * n(x * f, y * f); t += a; a *= 0.5; f *= 2; } return s / t; }

  /* ================= frame(el, o, title, q): the shell every es- visual is built in =================
     Adds: optional task line, mode tabs (o.modes), the canvas box, a control row, stat tiles, a hint line and a live
     readout. Handles quiet (hide the giveaway numbers and names), lock (no dragging, no controls), redraw on resize and
     theme change, one drag handler and one key handler per mode, animation loops that stop when the mode changes. */
  function frame(el, o, title, q) {
    q = q || {};
    el.classList.add('esv'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || title);
    var F = { o: o, el: el, title: title, quiet: !!(o.quiet || o.readout === false), lock: !!o.lock, letters: !!(o.letters || o.blank), loops: [] };
    if (o.task) { F.task = mk('p', 'esv-task', o.task); el.appendChild(F.task); }
    F.tabs = mk('div', 'esv-tabs'); F.tabs.hidden = true; el.appendChild(F.tabs);
    F.box = mk('div', 'esv-box'); el.appendChild(F.box);
    var qq = { aspect: q.aspect || 1.6, min: q.min || 240, max: q.max || 500 }, narrow = q.narrow || 1.0;
    F.c = V.canvas(F.box, qq); F.cv = F.c.cv; F.ctx = F.c.ctx;
    F.cv.setAttribute('role', 'img');
    var hintId = V.uid('esh');
    F.hintEl = mk('p', 'esv-hint'); F.hintEl.id = hintId; F.hintEl.hidden = true;
    F.legendEl = mk('div', 'esv-legend'); F.legendEl.hidden = true; el.appendChild(F.legendEl);
    F.ctl = mk('div', 'ml-ctl esv-ctl'); el.appendChild(F.ctl);
    F.statsEl = mk('div', 'esv-stats'); F.statsEl.hidden = true; el.appendChild(F.statsEl);
    el.appendChild(F.hintEl);
    F.out = V.readout(el); F.out.el.classList.add('esv-out');
    if (F.lock) F.ctl.hidden = true;
    function adj() { var w = F.box.clientWidth || 300; var nh = o.height ? +o.height : (w < 560 ? M.round(M.min(qq.max * 1.12, M.max(qq.min, w / narrow))) : 0); if (nh !== (qq.height || 0)) { qq.height = nh || undefined; F.c.fit(); } }
    F.size = function (s) { qq.aspect = s.aspect || 1.6; qq.min = s.min || 240; qq.max = s.max || 500; narrow = s.narrow || 1.0; adj(); F.c.fit(); };
    F.w = function () { return F.c.w; }; F.h = function () { return F.c.h; };
    F.draw = function () { };
    var raf = 0;
    F.redraw = function () { try { F.draw(); } catch (e) { if (W.console) W.console.error(e); } };
    F.later = function () { if (raf) return; raf = W.requestAnimationFrame(function () { raf = 0; F.redraw(); }); };
    F.c.onResize(function () { adj(); F.redraw(); }); V.onTheme(F.redraw);
    // pointer: one handler set per mode; touch scrolling stays on unless the mode drags
    var dh = null;
    V.drag(F.cv, {
      hit: function (x, y) { return dh && !F.lock ? dh.hit(x, y) : null; },
      start: function (h, x, y, e) { if (dh && dh.start) dh.start(h, x, y, e); },
      move: function (h, x, y, e) { if (dh) dh.move(h, x, y, e); },
      end: function (h, e) { if (dh && dh.end) dh.end(h, e); }
    });
    F.cv.style.touchAction = 'pan-y';
    F.drag = function (h) { dh = h; F.cv.style.touchAction = h && !F.lock ? (h.touch || 'none') : 'pan-y'; };
    var kh = null, focused = false;
    F.cv.addEventListener('keydown', function (e) { if (kh && !F.lock && kh(e)) e.preventDefault(); });
    F.cv.addEventListener('focus', function () { focused = true; F.redraw(); });
    F.cv.addEventListener('blur', function () { focused = false; F.redraw(); });
    F.focused = function () { return focused && !F.lock; };
    F.keys = function (fn, hint) { kh = fn; F.cv.tabIndex = fn && !F.lock ? 0 : -1; if (fn && !F.lock) F.cv.setAttribute('aria-describedby', hintId); else F.cv.removeAttribute('aria-describedby'); if (hint != null) F.hint(hint); };
    F.hint = function (s) { F.hintEl.textContent = s || ''; F.hintEl.hidden = !s || F.lock; };
    F.alt = function (s) { F.cv.setAttribute('aria-label', s); };
    F.say = function (html, words) { if (F.quiet && words == null) { F.out.el.hidden = true; return; } F.out.el.hidden = false; F.out.set(F.quiet ? words : html); };
    /* stat tiles: F.tiles([{k, label, secret}]) → setter t.k(value text); secret tiles hide in quiet mode */
    F.tiles = function (defs) {
      F.statsEl.innerHTML = ''; var T = {}, any = false;
      defs.forEach(function (d) {
        var box = mk('div', 'esv-stat'), lab = mk('span', '', d.label), val = mk('b', '', '—'); box.appendChild(lab); box.appendChild(val);
        if (d.secret && F.quiet) box.hidden = true; else any = true;
        F.statsEl.appendChild(box); T[d.k] = function (v) { val.innerHTML = v; }; T[d.k].box = box; T[d.k].label = function (s) { lab.innerHTML = s; };
      });
      F.statsEl.hidden = !any; return T;
    };
    F.legend = function (items) { F.legendEl.innerHTML = items.map(function (it) { return '<span><i style="--c:' + it.c + '"' + (it.line ? ' class="ln"' : it.dash ? ' class="dash"' : '') + '></i>' + it.t + '</span>'; }).join(''); F.legendEl.hidden = !items.length; };
    F.row = function (cls) { var r = mk('div', 'ml-ctl esv-ctl' + (cls ? ' ' + cls : '')); el.insertBefore(r, F.statsEl); if (F.lock) r.hidden = true; F._rows.push(r); return r; };
    F._rows = [];
    F.anim = function (fn) { var lp = V.loop(el, fn); F.loops.push(lp); return lp; };
    /* player(parent, step, q): a Play/Pause button; step(dt) returns false to stop. q.auto starts it unless the visitor
       prefers less motion (or o.play === false, or lock). q.reset() runs before a fresh start. */
    F.player = function (parent, step, pq) {
      pq = pq || {}; var lp = null, b = V.button(parent, '▶ ' + (pq.label || 'Play'), function () { if (lp) stop(); else start(); }, 'pri');
      function set(on) { b.textContent = on ? '❚❚ Pause' : '▶ ' + (pq.label || 'Play'); b.setAttribute('aria-pressed', String(on)); }
      function start() { if (pq.reset) pq.reset(); lp = V.loop(el, function (dt) { if (step(dt) === false) stop(); }); F.loops.push(lp); set(true); }
      function stop() { if (lp) { lp.stop(); lp = null; } set(false); if (pq.stopped) pq.stopped(); }
      set(false);
      if (pq.auto && !V.reduced && o.play !== false && !F.lock) start();
      return { start: start, stop: stop, running: function () { return !!lp; }, btn: b };
    };
    F.reset = function () {
      F.loops.forEach(function (l) { l.stop(); }); F.loops = []; dh = null; kh = null; F.cv.tabIndex = -1; F.cv.style.touchAction = 'pan-y';
      F.ctl.innerHTML = ''; F._rows.forEach(function (r) { r.remove(); }); F._rows = []; F.statsEl.innerHTML = ''; F.statsEl.hidden = true;
      F.legendEl.innerHTML = ''; F.legendEl.hidden = true; F.hint(''); F.out.set(''); F.out.el.hidden = F.quiet; F.draw = function () { };
    };
    /* modes(map, names, first): o.mode picks the picture; o.modes (true or a list) shows tabs to switch */
    F.modes = function (map, names, first) {
      var keys = Object.keys(map), cur = map[o.mode] ? o.mode : (first || keys[0]);
      var list = Array.isArray(o.modes) ? o.modes.filter(function (m) { return map[m]; }) : o.modes ? keys : [];
      function go(m) { F.reset(); cur = m; F.mode = m; map[m](F, o); adj(); F.c.fit(); F.redraw(); }
      if (list.length > 1 && !F.lock) { F.tabs.hidden = false; V.seg(F.tabs, { label: 'Choose a picture', items: list.map(function (m) { return [m, names[m] || m]; }), value: cur, change: go }); }
      go(cur);
      return { destroy: F.reset, mode: function () { return cur; } };
    };
    F.k = pal;
    F.clear = function (bg) { var k = pal(), ctx = F.ctx; ctx.save(); ctx.setTransform(F.c.dpr, 0, 0, F.c.dpr, 0, 0); ctx.fillStyle = bg || k.bg; ctx.fillRect(0, 0, F.c.w, F.c.h); ctx.restore(); return k; };
    return F;
  }
  // a checkbox
  function check(parent, text, on, fn) { var l = mk('label', 'esv-chk'), i = D.createElement('input'); i.type = 'checkbox'; i.checked = !!on; l.appendChild(i); l.appendChild(D.createTextNode(' ' + text)); i.addEventListener('change', function () { fn(i.checked); }); parent.appendChild(l); return i; }
  // a select menu
  function select(parent, label, items, value, fn) {
    var l = mk('label', 'esv-sel'), s = mk('span', '', label), sel = D.createElement('select');
    items.forEach(function (it) { var op = D.createElement('option'); op.value = it[0]; op.textContent = it[1]; sel.appendChild(op); }); sel.value = value;
    sel.addEventListener('change', function () { fn(sel.value); }); l.appendChild(s); l.appendChild(sel); parent.appendChild(l); return sel;
  }
  // arrow keys -> [dx, dy] (screen directions; up is −1)
  function arrowKey(e) { return { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key] || null; }
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /* ================= a small world map (drawn from memory of the coastlines, simplified to a few degrees) =================
     Continents as [lon, lat, lon, lat, …] outlines; good enough for schematic maps of plates, currents and globes. */
  var LAND = {
    namerica: [-168, 65.6, -166.5, 68.3, -156.8, 71.3, -141, 69.6, -135, 69, -128, 70, -115, 68.5, -110, 68, -96, 67.5, -94, 70, -85, 69.5, -82, 66.5, -87, 64.2, -94, 61, -94, 58.8, -92, 57, -86, 55.4, -82, 55, -80, 51.5, -79, 54.5, -77, 60, -78, 62.5, -73, 62, -65, 60.4, -61.5, 56.5, -56, 52, -59, 50.3, -66.5, 50.2, -64.2, 48.8, -60, 46, -66, 43.5, -70.2, 43.6, -70, 41.7, -74, 40.5, -76, 37, -75.5, 35.3, -78, 33.8, -81, 32, -80.6, 28.5, -80.1, 26, -81, 25.1, -82.6, 27.5, -84, 30, -86.5, 30.4, -89.2, 29.2, -90.5, 29.3, -94, 29.6, -97.3, 27.8, -97.5, 25.5, -97.8, 22.3, -96.2, 19.2, -94.5, 18.2, -91.5, 18.6, -90.4, 21, -87, 21.5, -88, 18.5, -88.5, 16, -84, 15.8, -83.3, 14.5, -83.6, 11, -81.7, 9.1, -79.5, 9.5, -77.4, 8.6, -78.2, 8.3, -79.5, 8.9, -80.3, 7.4, -83, 8.2, -85.7, 10, -87.5, 13, -91.5, 14, -94, 16, -96.5, 15.7, -99.9, 16.8, -105.2, 20.4, -106.4, 23.2, -109, 26, -110.9, 27.9, -112.6, 29.8, -114.7, 31.7, -113, 29, -112, 26.5, -110.3, 24.1, -109.9, 22.9, -112, 24.8, -115.1, 27.9, -116.6, 31.8, -117.2, 32.7, -118.5, 34, -120.6, 34.6, -122.5, 37.7, -124.2, 40.4, -124.5, 43, -124, 46.2, -124.7, 48.4, -123, 49, -127.5, 51, -130.5, 54.5, -133, 57, -136.5, 58.5, -139.7, 59.5, -146, 60.8, -151.5, 59.2, -154, 57.5, -158.5, 56, -164, 54.6, -161, 58.5, -165, 60.5, -165, 62.5, -165.4, 64.5, -168, 65.6],
    greenland: [-73, 78.5, -60, 82, -40, 83.5, -20, 82, -12, 81, -18, 77, -20, 74, -22, 70.5, -32, 68, -40, 65, -43.9, 59.8, -48, 61, -52, 65, -54, 68, -55, 70.5, -58, 75.5, -66, 76.5, -73, 78.5],
    baffin: [-65, 62, -71, 62.8, -78, 64.5, -82, 66.5, -89, 70.5, -82, 73.5, -73, 72, -68, 70.5, -62, 67, -65, 62],
    ellesmere: [-75, 76.5, -88, 77.5, -92, 80, -80, 82.5, -62, 82.5, -70, 79, -75, 76.5],
    victoria: [-118, 69.5, -102, 68.8, -101, 70.5, -105, 73.2, -115, 73.2, -119, 71.5, -118, 69.5],
    newfoundland: [-59.3, 47.6, -56, 51.6, -53, 48.5, -52.7, 47.5, -53.6, 46.6, -56, 47.6, -59.3, 47.6],
    cuba: [-84.9, 21.9, -82, 23.2, -77.5, 21.8, -74.2, 20.2, -77.7, 19.9, -80, 21.6, -84.9, 21.9],
    hispaniola: [-74.4, 18.5, -72.8, 19.9, -69.9, 19.6, -68.4, 18.5, -71, 17.6, -74.4, 18.5],
    samerica: [-77.4, 8.6, -75.5, 10.5, -74, 11.3, -71.6, 12.4, -71.5, 10.8, -68, 10.5, -64, 10.6, -61.5, 10.2, -60, 8.5, -57.5, 6, -54, 5.8, -51.5, 4.4, -50, 1.8, -48.5, -1.4, -44.5, -2.5, -41, -2.9, -38.5, -3.7, -35.2, -5.5, -34.9, -8.05, -37, -11, -38.5, -13, -39, -17.8, -40.3, -20.3, -42, -23, -43.2, -22.9, -46.3, -24, -48.5, -26.5, -48.6, -28.5, -50.5, -31, -53.4, -33.7, -56.2, -34.9, -57.3, -35.8, -56.7, -36.3, -57.5, -38.2, -62.3, -38.7, -62.5, -40.5, -65, -41, -63.5, -42.5, -65, -45, -65.8, -47.7, -68.3, -50.2, -69, -51.6, -68.4, -52.4, -68.5, -53.5, -66.5, -54.6, -67.3, -55.9, -71, -55, -74.5, -52.5, -75.5, -48.5, -74, -46, -74, -43, -73.5, -41, -73.4, -37.5, -72.5, -35.5, -71.6, -33, -71.5, -30, -70.5, -27, -70.3, -23.6, -70.2, -18.5, -71.5, -17.2, -75.5, -14.8, -76.3, -13.3, -77.2, -12, -79, -8.2, -81.3, -4.7, -80.3, -3.4, -80.9, -2.2, -80.1, 0.8, -78.8, 1.8, -77, 3.9, -77.5, 7, -77.4, 8.6],
    africa: [-5.9, 35.8, -2, 35.1, 3, 36.8, 9.9, 37.3, 11, 37, 10.1, 33.9, 11.5, 33.1, 15.2, 32.4, 19, 30.3, 20, 32, 23, 32.6, 25.2, 31.6, 29.9, 31.2, 32.3, 31.3, 32.6, 29.9, 35.5, 24, 37.2, 19.6, 39.7, 15.6, 43.1, 11.6, 44.5, 10.4, 51.2, 11.8, 50, 8, 48, 4.5, 45.3, 2, 42.5, -0.5, 39.7, -4, 39.3, -6.8, 40.5, -10.5, 40.7, -14.5, 36.9, -17.9, 34.8, -19.8, 35.5, -24, 32.6, -26, 32.4, -28.6, 31, -29.9, 27.9, -33, 25.6, -34, 20, -34.8, 18.4, -34.3, 18.5, -33.9, 17.9, -32.5, 16.5, -28.6, 15.2, -26.6, 14.5, -22.9, 11.75, -17.25, 12.3, -13.5, 13.2, -8.8, 12.3, -6, 11.8, -4.8, 8.7, -0.6, 9.5, 2.5, 9.6, 4, 8.5, 4.6, 6.1, 4.3, 3.4, 6.4, -0.2, 5.6, -4, 5.3, -7.7, 4.4, -10.8, 6.4, -13.2, 8.5, -15, 10.8, -16.8, 12.3, -17.5, 14.7, -16.2, 19.4, -17.05, 20.8, -14.5, 26.1, -12.9, 27.9, -9.6, 30.4, -9.3, 32.5, -7.6, 33.6, -6.3, 35, -5.9, 35.8],
    madagascar: [49.3, -12, 50.5, -15.5, 49.4, -18, 48, -22, 47.1, -25, 45.2, -25.6, 43.7, -23.2, 44, -20, 44.3, -16.2, 47.3, -13.5, 49.3, -12],
    eurasia: [-5.6, 36, -2.2, 36.7, 0.2, 38.7, -0.4, 39.5, 0.9, 40.8, 3.2, 41.9, 3.1, 43, 4.5, 43.4, 7.3, 43.7, 8.9, 44.4, 10.3, 43.5, 12.2, 41.8, 14.2, 40.8, 15.6, 40, 15.6, 38, 16.6, 38.5, 17.2, 39, 16.9, 40.4, 18.5, 40.1, 16.9, 41.1, 15.6, 41.9, 14, 42.6, 12.4, 44.3, 12.3, 45.4, 13.7, 45.6, 15, 44.5, 16.4, 43.5, 18.1, 42.6, 19.4, 41.9, 19.5, 40.4, 20.6, 38.9, 21.2, 37, 22.5, 36.4, 23.2, 37.9, 24, 38.2, 22.9, 40.6, 24, 40.7, 26, 40.8, 26.2, 40, 27, 38.4, 27.3, 37, 28.5, 36.7, 30.6, 36.8, 32.5, 36.1, 34.6, 36.8, 36.1, 36.6, 35.8, 35.5, 35.5, 33.9, 34.9, 32.5, 34.5, 31.5, 32.4, 31.2, 32.6, 29.9, 34.25, 27.7, 34.9, 29.5, 36.5, 26, 39.2, 21.5, 42.55, 16.9, 43.4, 12.7, 45, 12.8, 49.1, 14.5, 52.2, 15.9, 54.1, 17, 57.8, 18.9, 59.8, 22.5, 58.5, 23.6, 56.4, 26.4, 55.3, 25.3, 52, 24, 51.6, 26.1, 50.2, 26.2, 48.8, 27.7, 48, 29.3, 48.8, 30.3, 50.8, 28.9, 54, 26.6, 56.3, 27.2, 57.3, 25.8, 62.3, 25.1, 66.6, 25.4, 67, 24.8, 68.5, 23.5, 70, 22.8, 69, 22.3, 70.4, 20.9, 72.6, 21.5, 72.8, 19, 73.8, 15.5, 74.8, 12.9, 75.8, 11.2, 76.3, 9.9, 77.5, 8.1, 78.1, 8.8, 79.9, 10.3, 80.3, 13.1, 80.2, 15.5, 82.2, 16.9, 83.3, 17.7, 85.9, 19.8, 87, 21.5, 89, 21.8, 91.8, 22.3, 92.3, 20.7, 94.2, 16, 96.2, 16.8, 97.6, 16.5, 98.3, 13, 98.4, 10.5, 98.3, 7.9, 100.4, 5.4, 101.3, 2.9, 103.8, 1.3, 104.2, 1.4, 103.3, 3.8, 102.2, 6.1, 100.6, 7.2, 99.2, 9.2, 99.9, 12.6, 100.5, 13.5, 101, 12.7, 102.5, 12, 103, 11, 104.8, 10.4, 105.1, 8.6, 106.7, 10.3, 109.4, 12.9, 108.9, 15.3, 108.2, 16.1, 106.6, 17.7, 105.8, 19, 106.7, 20.7, 108, 21.5, 109.1, 21.5, 110.4, 20.3, 110.5, 21.2, 113.3, 22.2, 114.2, 22.3, 116.7, 23.4, 119.6, 26, 120.7, 28, 121.8, 31.2, 120.9, 32.6, 119.4, 34.7, 120.3, 36, 122.5, 37.4, 120, 37.5, 118.7, 38, 117.7, 38.9, 119.6, 39.9, 121.5, 40.8, 121.6, 38.9, 124.3, 39.9, 125.3, 37.7, 126.6, 37.4, 126.3, 34.6, 127.7, 34.7, 129, 35.1, 129.4, 36, 128.6, 38.4, 129.8, 41.8, 131.9, 43.1, 135.2, 43.9, 138.2, 46.6, 140.5, 48.9, 140.4, 51.5, 141.4, 53.3, 137.7, 54, 135.1, 54.7, 140.9, 58.6, 143.2, 59.4, 148.2, 59.4, 150.8, 59.6, 154.2, 59.2, 156, 61.8, 160.5, 61.5, 163.5, 61.3, 158, 58, 156.6, 51, 158.6, 53, 160, 54.5, 163, 56.4, 162.5, 57.8, 163.4, 59.8, 166.2, 60.4, 170, 60, 174, 61.8, 177.5, 62.5, 179, 64.7, 180, 65, 180, 68.9, 176, 69.8, 170, 70, 161, 69.6, 152, 70.9, 140, 72.5, 130.5, 71, 126.5, 73.2, 113, 73.7, 106, 73, 104.3, 77.7, 96, 76.1, 87, 74.5, 80.5, 73.5, 80.5, 72.4, 75, 72.8, 70, 73.4, 66.5, 70.8, 60.5, 68.9, 54, 68.6, 44, 68, 40.4, 64.5, 34.8, 64.5, 32.7, 67.1, 41, 67.8, 40.1, 67.8, 33.1, 69, 28.5, 70.9, 25.8, 71.2, 18.9, 69.7, 14.5, 68.2, 12.5, 66, 10.4, 63.4, 5.6, 62.3, 5.3, 60.4, 5.6, 58.9, 7, 58, 10.7, 59.9, 11.3, 58.9, 11.8, 57.7, 12.9, 55.6, 14.2, 55.4, 16.5, 56.5, 16.4, 57.9, 18.1, 59.3, 17.2, 61, 17.4, 62.4, 21, 64.5, 22.2, 65.6, 25.4, 65, 21.6, 63.1, 21.5, 61.5, 22.3, 60.4, 24.9, 60.2, 28.7, 60.7, 30.3, 59.9, 28, 59.5, 24.8, 59.4, 23.5, 58.9, 24.1, 57, 22, 57.6, 21, 56.8, 21.1, 55.7, 20.5, 54.9, 18.6, 54.4, 14.5, 53.9, 12, 54.2, 10.9, 54, 10.6, 57.7, 8.6, 57.1, 8.1, 55.5, 9, 53.9, 7, 53.5, 4.8, 52.9, 4.3, 52, 3.5, 51.4, 1.85, 50.95, 0.1, 49.5, -1.6, 49.6, -1.9, 48.6, -4.5, 48.4, -2.2, 47.2, -1.2, 45.8, -1.5, 43.5, -3.8, 43.5, -7.9, 43.8, -9.3, 43, -8.8, 42.2, -8.7, 40.6, -9.5, 38.8, -8.9, 37, -7.4, 37.2, -6.3, 36.5, -5.6, 36],
    chukotka: [-180, 65, -172.5, 64.4, -169.7, 66.1, -171.5, 67, -175, 67.7, -180, 68.9],
    britain: [-5.7, 50.1, -3, 50.6, 1.3, 51.1, 1.7, 52.6, 0.3, 53.5, -1.6, 55.6, -2, 57.1, -3.1, 58.6, -5, 58.6, -5.8, 57.5, -5.6, 56, -4.9, 55, -3.4, 54.5, -3, 53.4, -4.6, 52.8, -5.2, 51.7, -3.3, 51.4, -4.2, 51.2, -5.7, 50.1],
    ireland: [-6, 52.2, -6.2, 53.4, -5.6, 54.6, -7.3, 55.4, -10, 54.2, -9.5, 53.3, -10.4, 51.8, -8.5, 51.6, -6, 52.2],
    iceland: [-22.5, 64, -24, 65.5, -22, 66.4, -18, 66.2, -14.6, 66.3, -13.5, 65.2, -14.5, 64.3, -18, 63.4, -22.5, 64],
    svalbard: [11, 78.5, 17, 80, 27, 80.2, 22, 77.5, 16.5, 76.6, 13, 78.1, 11, 78.5],
    novaya: [51.5, 71.5, 55.5, 73, 58, 75.4, 68.5, 77, 66, 76.3, 60, 74.2, 57, 71.7, 53.6, 70.6, 51.5, 71.5],
    japan: [129.7, 33.2, 130.2, 31.2, 131.4, 31.4, 132, 33, 132.5, 32.8, 134.7, 33.8, 135.1, 34.6, 136.9, 34.3, 138.8, 34.6, 140, 35.1, 140.8, 35.7, 141, 38.3, 142, 39.5, 141.4, 41.4, 140, 40.6, 139.8, 38.3, 137, 37, 136.7, 36, 133, 35.5, 131, 34.4, 129.8, 33.6, 129.7, 33.2],
    hokkaido: [140, 42, 141.4, 41.7, 143.2, 42, 145.6, 43.3, 145.3, 44.3, 141.9, 45.5, 141.3, 43.2, 140, 42],
    sakhalin: [142, 46, 143, 46.6, 143.3, 49.3, 143, 51.5, 142.7, 54.3, 142, 53.5, 141.8, 50, 142, 46],
    taiwan: [120.1, 23, 120.8, 21.9, 121.9, 24.9, 121.5, 25.3, 120.1, 23],
    hainan: [108.6, 19.2, 110, 18.2, 111, 19.6, 110.3, 20.1, 108.6, 19.2],
    srilanka: [79.8, 6, 80.6, 5.9, 81.9, 7.4, 80.2, 9.8, 79.8, 7, 79.8, 6],
    luzon: [120.6, 18.5, 122.2, 18.5, 121.6, 16, 124.2, 13, 123, 13.3, 120.6, 14, 119.8, 16.2, 120.6, 18.5],
    mindanao: [122, 7, 125.5, 9.8, 126.6, 7.3, 125.3, 5.6, 124, 6.4, 122, 7],
    sumatra: [95.3, 5.6, 97.5, 5.2, 100.4, 2.4, 103.8, -1, 106, -3.2, 105.8, -5.8, 104.6, -5.9, 102.3, -4, 100.4, -1, 98.7, 1.7, 96, 4, 95.3, 5.6],
    java: [105.2, -6.8, 106.8, -6, 108.6, -6.7, 110.4, -6.9, 112.7, -7.2, 114.4, -7.8, 114.6, -8.7, 111, -8.2, 108, -7.8, 106.4, -7.4, 105.2, -6.8],
    borneo: [109, 1.5, 109.6, 2.1, 111, 2, 113, 3.2, 115.4, 5.3, 116.8, 7, 119.3, 5.3, 118, 4.3, 117.7, 1, 116.4, -2, 116, -3.8, 114.6, -3.5, 111.6, -3, 110.1, -2, 109, 0, 109, 1.5],
    sulawesi: [119, -3.5, 118.8, -0.8, 120, 0.5, 124.5, 1.4, 121, 0.7, 121.5, -1, 123.4, -0.9, 121.4, -1.9, 122.8, -4.6, 120.6, -2.7, 120.4, -5.6, 119.4, -5.4, 119, -3.5],
    newguinea: [131, -1.4, 132, -0.4, 134, -0.9, 137, -1.6, 141, -2.6, 145.8, -4.9, 147.5, -6.1, 150, -10.4, 147, -10.1, 146, -8, 143.4, -9, 141, -9.1, 138, -8.4, 137.6, -5.2, 134.6, -4, 132.1, -2.9, 131, -1.4],
    australia: [142.5, -10.7, 143.5, -14.2, 145.3, -16, 145.8, -16.9, 146.9, -19.3, 149.2, -21.1, 150.8, -23.4, 153.1, -25.9, 153.6, -28.6, 153, -31.5, 151.3, -33.9, 150.2, -36, 149.9, -37.6, 146.4, -39.1, 145, -38.3, 141.6, -38.4, 139.8, -37.3, 138.5, -35.6, 138.1, -34, 137, -35.6, 135.9, -34.9, 134.2, -32.8, 131.2, -31.5, 126, -32.3, 123.6, -33.9, 121.9, -33.9, 118, -35.1, 115, -34.3, 115.8, -32, 114.6, -28.8, 113.5, -26, 113.7, -22.6, 114.1, -21.8, 116.8, -20.6, 118.6, -20.3, 121, -19.5, 122.2, -18, 123.6, -16.4, 125, -15, 126.9, -13.9, 128.1, -15, 129.6, -14.9, 130.8, -12.4, 132.6, -11.5, 135.9, -12, 136.8, -12.2, 135.5, -14.8, 137, -16, 139.3, -17.5, 140.8, -17.5, 141.5, -15, 141.6, -12.6, 142.5, -10.7],
    tasmania: [144.6, -40.7, 148.3, -40.9, 148, -43.2, 146.8, -43.6, 145.2, -42.2, 144.6, -40.7],
    nzNorth: [172.7, -34.4, 174.8, -36.8, 175.9, -37.5, 178.5, -37.7, 176.9, -39.5, 175.2, -41.6, 174.8, -41.3, 173.8, -39.3, 174.6, -37, 173, -35.2, 172.7, -34.4],
    nzSouth: [172.7, -40.5, 174.3, -41.7, 173, -43, 172.8, -43.8, 171.2, -44.4, 170.7, -45.9, 168.4, -46.6, 166.5, -45.8, 168.2, -44, 170.6, -42.7, 171.2, -42.4, 172.1, -41, 172.7, -40.5],
    antarctica: [-180, -78, -160, -77.5, -150, -76.5, -140, -75, -120, -73.5, -100, -73, -80, -73, -75, -71, -68, -67.5, -63, -64.5, -57, -63.3, -58, -64.5, -61, -68, -63, -72, -61, -75, -60, -77, -50, -78, -36, -78, -30, -76, -20, -73.5, -10, -71, 0, -70, 20, -70, 40, -68.5, 55, -66.5, 70, -68, 72, -70, 80, -67, 90, -66.5, 110, -66, 130, -66, 140, -66.5, 160, -70.5, 170, -72, 165, -77.5, 170, -78, 180, -78, 180, -90, -180, -90]
  };
  /* plate boundaries (schematic): type d = divergent, c = convergent, t = transform; a convergent line's teeth go on
     the side given by `over` (+1 left of the drawing direction, −1 right): the overriding plate. */
  var BOUNDS = [
    { t: 'd', n: 'Mid-Atlantic Ridge', p: [125, 79.5, 60, 86, 10, 84, 2, 81, 8, 78.5, 7, 74.5, 0, 72.5, -9, 71, -17, 66.5, -18, 64, -24, 63, -30, 59, -34, 54, -35, 52.5, -29, 50, -28, 45, -28, 38.5, -33, 35, -40, 27, -45, 22, -46, 15, -45, 10, -38, 7, -30, 3, -25, 0.5, -18, 0, -13, -1, -14, -5, -13, -10, -14, -15, -13.5, -20, -13, -27, -14, -33, -16, -38, -17, -45, -12, -52, -1, -54.5] },
    { t: 'd', n: 'East Pacific Rise', p: [-108.5, 23, -106.5, 19, -104.5, 15, -103, 10, -104, 5, -102, 2.2, -102, 0, -105, -5, -108, -10, -111, -15, -113, -20, -112, -25, -112, -30, -111, -35, -113, -40, -116, -45, -115.5, -50, -117.5, -55, -120, -56, -130, -57, -140, -59, -150, -62.5, -160, -64, -170, -64.5, -180, -63.5] },
    { t: 'd', p: [180, -63.5, 170, -62, 161, -61] },
    { t: 'd', n: 'Galápagos Rift', p: [-102, 2.2, -95, 2, -86, 1.5, -83, 2] },
    { t: 'd', n: 'Chile Rise', p: [-111, -35, -100, -38, -95, -40, -87, -42, -80, -44, -75.5, -46.5] },
    { t: 'd', n: 'Juan de Fuca Ridge', p: [-127, 40.5, -127.5, 42, -129, 45, -130.5, 48, -130, 50.5] },
    { t: 'd', n: 'Southwest Indian Ridge', p: [-1, -54.5, 10, -54, 20, -52.5, 30, -45, 40, -43, 50, -38, 60, -32, 68, -26, 70, -25.5] },
    { t: 'd', n: 'Central Indian Ridge', p: [70, -25.5, 67, -19, 66, -10, 68, -5, 66, 0, 60, 5, 57, 13, 51, 14, 45, 12, 43.5, 12.5] },
    { t: 'd', n: 'Red Sea', p: [43.5, 12.5, 40, 16, 38, 20, 36, 24, 34.5, 28] },
    { t: 'd', n: 'Southeast Indian Ridge', p: [70, -25.5, 78, -32, 82, -38, 90, -42, 100, -48, 110, -50, 120, -50, 130, -51, 140, -53, 150, -58, 161, -61] },
    { t: 'd', n: 'East African Rift', p: [42, 11.5, 40, 8, 38, 5, 36.5, 1, 36, -3, 35, -8, 34.5, -12], rift: true },
    { t: 'c', n: 'Aleutian Trench', over: 1, p: [-146, 60, -150, 56.5, -160, 54, -170, 51.5, -180, 50.5] },
    { t: 'c', over: 1, p: [180, 50.5, 175, 50.8, 165, 54.5] },
    { t: 'c', n: 'Kuril–Japan Trench', over: 1, p: [163, 55, 161, 53, 158, 50.5, 154, 47, 150, 44, 146, 42, 144, 40, 143.5, 37, 142, 34] },
    { t: 'c', n: 'Mariana Trench', over: 1, p: [142, 34, 142, 33, 142.5, 28, 143, 24, 144.5, 20, 147, 15, 146, 12, 143, 11, 139.5, 10.5] },
    { t: 'c', over: -1, p: [138, 34, 135, 33, 132, 31, 131, 30, 128, 27, 124, 24, 122, 23.5] },
    { t: 'c', over: 1, p: [126.5, 13.5, 127, 8, 126.5, 4] },
    { t: 'c', n: 'Java (Sunda) Trench', over: -1, p: [93, 13, 93, 7, 94.5, 3, 97, 0, 100, -4.5, 104, -8, 110, -10.3, 116, -11, 121, -10.8, 127, -9, 131, -7, 133, -5] },
    { t: 'c', over: -1, p: [146, -6, 152, -7, 156, -8.5, 161, -11, 166, -11, 167, -15, 168.5, -20, 170, -22] },
    { t: 'c', n: 'Tonga–Kermadec Trench', over: 1, p: [-173, -15, -173, -20, -175, -25, -177, -30, -178.5, -35, -179.5, -38, -180, -39] },
    { t: 'c', over: 1, p: [180, -39, 178.5, -40, 176.5, -42, 174, -41.5] },
    { t: 't', n: 'Alpine Fault', p: [174, -41.5, 171, -43, 168, -45.5, 165.5, -48] },
    { t: 'c', n: 'Middle America Trench', over: -1, p: [-105.5, 19.5, -101, 17, -97, 15.5, -93, 14, -90, 13, -87, 11.5, -85, 9.5, -83, 7.8] },
    { t: 't', p: [-83, 7.8, -82.7, 2, -83, 2] },
    { t: 'c', n: 'Peru–Chile Trench', over: -1, p: [-79, 2, -80.5, -3, -81, -6, -79, -10, -77, -13, -73, -17, -71.5, -20, -71.5, -25, -72, -30, -73, -35, -74.5, -40, -75.5, -45, -75.5, -46.5, -76, -50, -75.5, -53] },
    { t: 'c', over: 1, p: [-60, 18, -59, 15, -60, 12, -62, 11] },
    { t: 't', p: [-89, 15.5, -84, 17.5, -80, 19, -75, 19.7, -70, 19.8, -66, 19.5, -62, 18.5, -60, 18] },
    { t: 't', p: [-82, 10, -77, 11, -72, 11, -66, 11, -62, 11] },
    { t: 'c', over: 1, p: [-26, -56, -26.5, -58, -27.5, -60] },
    { t: 't', p: [-27.5, -60, -35, -60.5, -45, -61, -55, -61, -63, -60] },
    { t: 't', p: [-26, -56, -35, -54.5, -45, -53, -55, -54, -65, -55.5] },
    { t: 'c', n: 'Cascadia', over: -1, p: [-124.5, 40.5, -125, 43, -125, 46, -126, 48.5, -128, 50.5] },
    { t: 't', n: 'San Andreas Fault', p: [-124.3, 40.3, -122.5, 37.7, -120.5, 35.5, -118.5, 34.5, -116, 33.3, -114.7, 31.5, -108.5, 23] },
    { t: 't', p: [-130.5, 51, -132.5, 53.5, -135, 56.5, -137.5, 58.5, -146, 60] },
    { t: 'c', n: 'Mediterranean', over: 1, p: [-20, 37, -12, 36.5, -6, 36, 0, 36.5, 5, 37, 10, 38, 14, 38.3, 16, 38.8, 20.5, 38, 22, 36, 25, 34.5, 28, 35.5] },
    { t: 'c', n: 'Zagros–Himalaya', coll: true, over: 1, p: [36, 37, 42, 37.5, 46, 34, 50, 30, 56.5, 27, 57, 25.5, 62, 25, 66, 25, 66, 26, 68, 29, 70, 33, 73, 35.5, 77, 34.5, 80, 30.5, 84, 28, 88, 27, 92, 27.5, 95, 28, 97, 25, 95, 20, 94, 16, 93, 13] },
    { t: 't', n: 'Dead Sea Fault', p: [34.5, 28, 35, 29.5, 35.5, 32, 36, 34.5, 36.5, 36.5] },
    { t: 't', n: 'North Anatolian Fault', p: [26.5, 40.5, 30, 40.7, 33, 41, 37, 40.3, 41, 39.5] }
  ];
  var PLATES = [['Pacific', -150, 5], ['North American', -100, 50], ['South American', -55, -15], ['Eurasian', 85, 55], ['African', 18, 5], ['Antarctic', 40, -72], ['Australian', 130, -25], ['Nazca', -90, -20], ['Cocos', -96, 8], ['Caribbean', -75, 15], ['Philippine Sea', 133, 18], ['Arabian', 46, 22], ['Indian', 78, 12], ['Juan de Fuca', -129, 46], ['Scotia', -45, -58]];
  // relative motion arrows at boundaries: [lon, lat, direction (° from east, counterclockwise), rate (cm/yr), pair]
  // relative motion at boundaries: [lon, lat, direction (° from east, counterclockwise), rate (cm/yr), what happens, kind: apart | push | slide]
  var MOTIONS = [[-30, 40, 0, 2.5, 'North America and Africa pull apart', 'apart'], [-14, -25, 0, 3.5, 'South America and Africa pull apart', 'apart'], [-112, -30, 0, 15, 'Pacific and Nazca plates pull apart', 'apart'], [-84, -25, 0, 7, 'Nazca Plate sinks under South America', 'push'], [-123, 36.5, 135, 5, 'Pacific and North American plates slide past', 'slide'], [84, 22, 90, 4.5, 'India pushes into Eurasia', 'push'], [-168, -24, 180, 20, 'Pacific Plate sinks at the Tonga Trench (one of the fastest)', 'push'], [150, 37, 180, 8.5, 'Pacific Plate sinks under Japan', 'push'], [45, -40, 60, 1.4, 'Africa and Antarctica pull apart slowly', 'apart'], [115, -50, 90, 7, 'Australia and Antarctica pull apart', 'apart']];
  // hot spots (lon, lat, name)
  var HOTSPOTS = [[-155.3, 19.4, 'Hawaiʻi'], [-18, 64.5, 'Iceland'], [-110.5, 44.4, 'Yellowstone'], [-91, -0.5, 'Galápagos'], [55.7, -21.2, 'Réunion']];

  /* ocean surface currents (schematic): w = 1 warm, 0 cool */
  var CURRENTS = [
    { n: 'Gulf Stream', w: 1, p: [-81, 25, -80, 30, -75, 35, -65, 39, -50, 42] },
    { n: 'North Atlantic Drift', w: 1, p: [-48, 43, -30, 50, -15, 55, -5, 60, 5, 65, 15, 70] },
    { n: 'Canary', w: 0, p: [-14, 40, -16, 30, -18, 22, -20, 15] },
    { n: 'North Equatorial (Atlantic)', w: 1, p: [-22, 14, -40, 14, -58, 15, -72, 16, -84, 20] },
    { n: 'Labrador', w: 0, p: [-62, 63, -56, 56, -52, 50, -51, 45] },
    { n: 'South Equatorial (Atlantic)', w: 1, p: [8, -3, -10, -4, -25, -6, -34, -8] },
    { n: 'Brazil', w: 1, p: [-36, -11, -40, -21, -47, -30, -52, -38] },
    { n: 'Benguela', w: 0, p: [16, -34, 13, -26, 11, -18, 8, -8] },
    { n: 'Falkland', w: 0, p: [-66, -52, -60, -45, -56, -38] },
    { n: 'Kuroshio', w: 1, p: [123, 22, 126, 27, 132, 32, 140, 35, 150, 38] },
    { n: 'North Pacific', w: 1, p: [152, 41, 170, 43, -170, 44, -150, 45, -132, 46] },
    { n: 'California', w: 0, p: [-128, 45, -125, 38, -120, 30, -115, 23, -112, 17] },
    { n: 'North Equatorial (Pacific)', w: 1, p: [-112, 14, -140, 13, -170, 13, 160, 14, 135, 15, 125, 17] },
    { n: 'Oyashio', w: 0, p: [165, 55, 156, 48, 147, 42] },
    { n: 'Alaska', w: 1, p: [-140, 50, -137, 55, -145, 59, -155, 57, -165, 53] },
    { n: 'South Equatorial (Pacific)', w: 1, p: [-82, -4, -110, -5, -140, -6, -170, -8, 165, -11, 155, -14] },
    { n: 'East Australian', w: 1, p: [154, -15, 155, -24, 154, -32, 156, -38] },
    { n: 'Humboldt (Peru)', w: 0, p: [-78, -42, -75, -32, -76, -22, -80, -10, -83, -3] },
    { n: 'Antarctic Circumpolar', w: 0, p: [-180, -56, -150, -58, -120, -57, -90, -57, -70, -58, -40, -52, -10, -48, 20, -46, 50, -47, 80, -48, 110, -50, 140, -53, 170, -56, 180, -56] },
    { n: 'Agulhas', w: 1, p: [41, -18, 36, -27, 30, -33, 22, -37] },
    { n: 'West Australian', w: 0, p: [113, -34, 111, -27, 108, -20, 100, -15] },
    { n: 'South Equatorial (Indian)', w: 1, p: [100, -13, 85, -13, 70, -13, 55, -14, 48, -15] }
  ];
  var GYRES = [[-40, 30, 1, 'North Atlantic Gyre'], [-15, -28, -1, 'South Atlantic Gyre'], [-155, 30, 1, 'North Pacific Gyre'], [-115, -30, -1, 'South Pacific Gyre'], [80, -28, -1, 'Indian Ocean Gyre']];

  /* map projections. eq(r): equirectangular into rect r = {x, y, w, h} covering lon −180…180 and lat lat1…lat0 */
  function eqProj(r, lat0, lat1, lon0) {
    lat0 = lat0 == null ? 84 : lat0; lat1 = lat1 == null ? -70 : lat1; lon0 = lon0 || 0;
    var sx = r.w / 360, sy = r.h / (lat0 - lat1);
    return { r: r, X: function (lon) { return r.x + (wrap180(lon - lon0) + 180) * sx; }, Y: function (lat) { return r.y + (lat0 - lat) * sy; }, lon: function (px) { return wrap180((px - r.x) / sx - 180 + lon0); }, lat: function (py) { return lat0 - (py - r.y) / sy; }, sx: sx, sy: sy, lon0: lon0 };
  }
  // draw the land on an equirectangular map (outlines that cross the map's edge are split there)
  function drawLand(ctx, P, fill, stroke, keys) {
    ctx.save(); ctx.beginPath(); ctx.rect(P.r.x, P.r.y, P.r.w, P.r.h); ctx.clip();
    (keys || Object.keys(LAND)).forEach(function (key) {
      var a = LAND[key]; [-360, 0, 360].forEach(function (sh) {
        ctx.beginPath();
        for (var i = 0; i < a.length; i += 2) { var x = P.r.x + (a[i] - P.lon0 + sh + 180) * P.sx, y = P.Y(a[i + 1]); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
        ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.8; ctx.stroke(); }
      });
    });
    ctx.restore();
  }
  // a polyline in lon/lat on an equirectangular map, split where it jumps across the dateline
  function mapPath(ctx, P, a) {
    var pts = []; for (var i = 0; i < a.length; i += 2) pts.push([P.X(a[i]), P.Y(a[i + 1])]);
    var segs = [[pts[0]]]; for (i = 1; i < pts.length; i++) { if (M.abs(pts[i][0] - pts[i - 1][0]) > P.r.w / 2) segs.push([]); segs[segs.length - 1].push(pts[i]); }
    return segs;
  }
  /* orthographic globe: center (lon0, lat0), radius rr px at (cx, cy). p(lon, lat) -> [x, y, z] with z > 0 on the near side. */
  function globeProj(lon0, lat0, cx, cy, rr) {
    var cl = M.cos(lat0 * RAD), sl = M.sin(lat0 * RAD);
    return {
      p: function (lon, lat) { var la = lat * RAD, lo = (lon - lon0) * RAD, x = M.cos(la) * M.sin(lo), y = M.sin(la) * cl - M.cos(la) * M.cos(lo) * sl, z = M.sin(la) * sl + M.cos(la) * M.cos(lo) * cl; return [cx + rr * x, cy - rr * y, z]; },
      inv: function (px, py) { var x = (px - cx) / rr, y = (cy - py) / rr, rho = M.hypot(x, y); if (rho > 1) return null; var c = M.asin(rho), sc = M.sin(c), cc = M.cos(c); var lat = rho ? M.asin(cc * sl + y * sc * cl / rho) : lat0 * RAD; var lon = lon0 * RAD + M.atan2(x * sc, rho * cc * cl - y * sc * sl); return [wrap180(lon * DEG), lat * DEG]; },
      cx: cx, cy: cy, r: rr
    };
  }
  // draw land on a globe: points on the far side are pulled to the rim, which keeps filled shapes closed and tidy
  function globeLand(ctx, G, fill, stroke) {
    Object.keys(LAND).forEach(function (key) {
      var a = LAND[key], pts = [], vis = 0;
      for (var i = 0; i < a.length; i += 2) {
        var j = (i + 2) % a.length, n = M.max(1, M.ceil(M.hypot(wrap180(a[j] - a[i]), a[j + 1] - a[i + 1]) / 3));
        if (key === 'antarctica' && (a[i + 1] === -90 || a[j + 1] === -90)) n = M.max(n, 30);
        for (var s = 0; s < n; s++) { var t = s / n, lo = a[i] + wrap180(a[j] - a[i]) * t, la = a[i + 1] + (a[j + 1] - a[i + 1]) * t, q = G.p(lo, la); if (q[2] < 0) { var dx = q[0] - G.cx, dy = q[1] - G.cy, d = M.hypot(dx, dy) || 1; q = [G.cx + dx / d * G.r, G.cy + dy / d * G.r, 0]; } else vis++; pts.push(q); }
      }
      if (!vis) return;
      ctx.beginPath(); pts.forEach(function (q, i) { if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.8; ctx.stroke(); }
    });
  }
  // a line of constant latitude or longitude on the globe (only the near side)
  function globeLine(ctx, G, pts, o) {
    ctx.save(); ctx.strokeStyle = o.color; ctx.lineWidth = o.w || 1; ctx.setLineDash(o.dash || []); ctx.beginPath(); var pen = false;
    pts.forEach(function (ll) { var q = G.p(ll[0], ll[1]); if (q[2] > 0) { if (pen) ctx.lineTo(q[0], q[1]); else { ctx.moveTo(q[0], q[1]); pen = true; } } else pen = false; });
    ctx.stroke(); ctx.restore();
  }

  // ---------- shared bits for space scenes ----------
  function latStr(v, d) { var a = M.abs(v); return (d == null ? fm(a, 1) : fm(a, d)) + '°' + (a < 1e-9 ? '' : v > 0 ? ' N' : ' S'); }
  function lonStr(v, d) { v = wrap180(v); var a = M.abs(v); return (d == null ? fm(a, 1) : fm(a, d)) + '°' + (a < 1e-9 || a > 179.999 ? '' : v > 0 ? ' E' : ' W'); }
  function hm(hours) { hours = ((hours % 24) + 24) % 24; var h = M.floor(hours), m = M.round((hours - h) * 60); if (m === 60) { h = (h + 1) % 24; m = 0; } return h + ':' + (m < 10 ? '0' : '') + m; }
  function hmWords(hours) { var h = M.floor(hours), m = M.round((hours - h) * 60); if (m === 60) { h++; m = 0; } return h + ' h ' + m + ' min'; }
  function clock12(hours) { hours = ((hours % 24) + 24) % 24; var h = M.floor(hours), m = M.round((hours - h) * 60); if (m === 60) { h = (h + 1) % 24; m = 0; } var ap = h < 12 ? 'am' : 'pm', h12 = h % 12 === 0 ? 12 : h % 12; return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + ap; }
  function stars(ctx, w, h, seed, n) { var r = rng(seed || 7); ctx.save(); for (var i = 0; i < (n || 80); i++) { var x = r() * w, y = r() * h, s = r(); ctx.fillStyle = 'rgba(219,231,239,' + (0.25 + 0.55 * s * s) + ')'; ctx.fillRect(x, y, s > 0.9 ? 1.6 : 1, s > 0.9 ? 1.6 : 1); } ctx.restore(); }
  function spaceBg(F) { var ctx = F.ctx, w = F.c.w, h = F.c.h, k = pal(); var g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#081624'); g.addColorStop(1, k.space); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); stars(ctx, w, h, 11, M.round(w * h / 2600)); return k; }
  function sunGlow(ctx, x, y, r) { var g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2); g.addColorStop(0, 'rgba(255,236,170,1)'); g.addColorStop(0.28, 'rgba(255,214,110,0.95)'); g.addColorStop(0.36, 'rgba(255,196,80,0.45)'); g.addColorStop(1, 'rgba(255,190,80,0)'); ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, TAU); ctx.fill(); ctx.restore(); circle(ctx, x, y, r, '#ffe28a'); }
  // a small lit sphere: lit half toward angle `toSun` (radians, screen); night side shaded
  function litBall(ctx, x, y, r, toSun, col, night) {
    circle(ctx, x, y, r, night || '#1a2633');
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, toSun - PI / 2, toSun + PI / 2); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  }
  var OFF = null; function offCanvas(n) { if (!OFF) OFF = D.createElement('canvas'); if (OFF.width !== n) { OFF.width = n; OFF.height = n; } return OFF; }

  /* es-earth-sun: Earth and Sun.
     opts:
       mode: 'globe' | 'orbit' | 'beam' | 'milankovitch'       modes: true or a list to show tabs
       date: 'MM-DD' (default '06-21'); utc: hours (default 12); lat, lon: a latitude and longitude to report on
       points: [{lat, lon, label}]   marked places (label 'A', 'B' … or a name)
       grid: 15 | 30 (globe grid spacing, default 30); tz: true (15° time-zone bands with local solar time)
       terminator: true (day and night on the globe; default true); subsolar: true (mark where the Sun is overhead)
       compare: [lat1, lat2] (beam: two places side by side at noon on the date)
       ecc, tilt, prec (milankovitch: eccentricity 0–0.06, tilt 22.1–24.5°, prec = day of the year Earth is closest to the Sun)
       exaggerate: true (orbit: stretch the orbit's shape so it shows; labeled as stretched)
       play: false to stop the globe from turning on its own
       quiet: hides coordinates, Sun height, day length, energy per m² and point coordinates (keeps the grid and letters)
       lock: no turning, dragging or sliders */
  R('es-earth-sun', function (el, o) {
    var F = frame(el, o, 'Earth and Sun', { aspect: 1.45, max: 460 });
    var S = { doy: EM.doy(o.date || '06-21'), utc: num(o.utc, 12), lat: num(o.lat, 40), lon: o.lon != null ? num(o.lon, 0) : null };
    return F.modes({ globe: globe, orbit: orbit, beam: beam, milankovitch: milank }, { globe: 'Globe', orbit: 'Orbit and seasons', beam: 'Spreading sunlight', milankovitch: 'Orbital cycles' });

    function dateSlider(parent, fn) {
      return V.slider(parent, { label: 'Date', min: 1, max: 365, step: 1, value: S.doy, fmt: function (v) { return EM.dateStr(v); }, input: function (v) { S.doy = v; fn(); } });
    }

    // ---------------- globe ----------------
    function globe(F) {
      F.size({ aspect: 1.45, max: 460, narrow: 1.0 });
      var grid = o.grid === 15 ? 15 : 30, term = o.terminator !== false, pts = (o.points || []).map(function (p, i) { return { lat: num(p.lat, 0), lon: num(p.lon, 0), label: p.label != null ? String(p.label) : LETTERS[i] }; });
      var sun = EM.sun(S.doy, S.utc), view = { lat0: o.viewLat != null ? num(o.viewLat, 20) : (pts.length ? clamp(pts[0].lat * 0.6, -50, 50) : 20) };
      var off = o.lon != null ? num(o.lon, 0) - sun.lon : (pts.length ? pts[0].lon - sun.lon : 50);
      if (!term) off = (o.lon != null ? num(o.lon, 0) : pts.length ? pts[0].lon : 0) - sun.lon;
      var probe = null, G = null, down = null;
      function center() { return wrap180(sun.lon + off); }
      var T = F.tiles([{ k: 'sun', label: 'Sun straight overhead at', secret: true }, { k: 'probe', label: 'Tapped spot', secret: true }, { k: 'local', label: 'Local solar time there', secret: true }]);
      if (term) {
        dateSlider(F.ctl, upd);
        var ts = V.slider(F.ctl, { label: 'Time (UTC)', min: 0, max: 24, step: 0.25, value: S.utc, fmt: function (v) { return hm(v) + ' UTC'; }, input: function (v) { S.utc = v; upd(); } });
        var row = F.row(); var pl = F.player(row, function (dt) { S.utc = (S.utc + dt * 1.6) % 24; ts.set(S.utc); upd(); }, { label: 'Turn Earth', auto: o.play === true });
        V.button(row, 'Look at the North Pole', function () { view.lat0 = 70; F.redraw(); });
        V.button(row, 'Look from the side', function () { view.lat0 = 15; F.redraw(); });
      }
      function upd() { sun = EM.sun(S.doy, S.utc); F.redraw(); }
      F.drag({
        hit: function (x, y) { return G && M.hypot(x - G.cx, y - G.cy) < G.r + 6 ? 'g' : null; },
        start: function (h, x, y) { down = [x, y, off, view.lat0, x, y]; },
        move: function (h, x, y) { if (!down) return; var d = 90 / G.r; off = down[2] - (x - down[0]) * d; view.lat0 = clamp(down[3] + (y - down[1]) * d, -85, 85); down[4] = x; down[5] = y; F.redraw(); },
        end: function () { if (down && M.hypot(down[4] - down[0], down[5] - down[1]) < 5) { var ll = G.inv(down[0], down[1]); if (ll) { probe = ll; F.redraw(); } } down = null; }
      });
      F.keys(function (e) {
        var a = arrowKey(e); if (!a) return false; off += a[0] * 10; view.lat0 = clamp(view.lat0 - a[1] * 10, -85, 85); F.redraw(); return true;
      }, F.lock ? '' : 'Drag the globe to turn it (or focus it and use the arrow keys).' + (F.quiet ? '' : ' Tap a spot to read its latitude and longitude.') + (term ? ' The Sun stays put while Earth turns.' : ''));
      F.draw = function () {
        var k = spaceBg(F), ctx = F.ctx, w = F.c.w, h = F.c.h, rr = M.min(w, h) * 0.42, cx = w / 2, cy = h / 2 + 4;
        G = globeProj(center(), view.lat0, cx, cy, rr);
        // the Sun's direction in view coordinates
        var la = sun.dec * RAD, lo = (sun.lon - center()) * RAD, cl = M.cos(view.lat0 * RAD), sl = M.sin(view.lat0 * RAD);
        var sx = M.cos(la) * M.sin(lo), sy = M.sin(la) * cl - M.cos(la) * M.cos(lo) * sl, sz = M.sin(la) * sl + M.cos(la) * M.cos(lo) * cl;
        if (term) { // the Sun, far away in its direction, and parallel rays
          var sd = M.hypot(sx, sy); if (sd > 0.25) { var ex = cx + sx / sd * M.min(w, h) * 0.72, ey = cy - sy / sd * M.min(w, h) * 0.72; ex = clamp(ex, 18, w - 18); ey = clamp(ey, 18, h - 18); sunGlow(ctx, ex, ey, 11); }
        }
        var gr = ctx.createRadialGradient(cx - rr * 0.3, cy - rr * 0.35, rr * 0.1, cx, cy, rr); gr.addColorStop(0, '#5aa2d8'); gr.addColorStop(1, '#1f5585');
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.fillStyle = gr; ctx.fill(); ctx.clip();
        globeLand(ctx, G, '#8fb46e', 'rgba(40,70,30,0.6)');
        if (o.tz) for (var b = -180; b < 180; b += 15) { if (((b + 180) / 15) % 2) { var poly2 = []; for (var t = -88; t <= 88; t += 4) poly2.push([b, t]); for (t = 88; t >= -88; t -= 4) poly2.push([b + 15, t]); ctx.beginPath(); var vis = false; poly2.forEach(function (ll, i) { var q = G.p(ll[0], ll[1]); if (q[2] > 0) vis = true; if (q[2] < 0) { var dx = q[0] - cx, dy = q[1] - cy, d = M.hypot(dx, dy) || 1; q = [cx + dx / d * rr, cy + dy / d * rr]; } if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); if (vis) { ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill(); } } }
        // grid
        var gcol = 'rgba(255,255,255,0.42)';
        for (var lat = -90 + grid; lat < 90; lat += grid) { var ps = []; for (var lo2 = -180; lo2 <= 180; lo2 += 3) ps.push([lo2, lat]); globeLine(ctx, G, ps, { color: gcol, w: 1 }); }
        for (var lon = -180; lon < 180; lon += grid) { ps = []; for (var la2 = -90; la2 <= 90; la2 += 3) ps.push([lon, la2]); globeLine(ctx, G, ps, { color: gcol, w: 1 }); }
        function circ(latc, col, wdt, dash) { var p2 = []; for (var l = -180; l <= 180; l += 2) p2.push([l, latc]); globeLine(ctx, G, p2, { color: col, w: wdt, dash: dash }); }
        circ(0, '#ffd479', 2.4); circ(EM.TILT, 'rgba(255,212,121,0.9)', 1.4, [6, 4]); circ(-EM.TILT, 'rgba(255,212,121,0.9)', 1.4, [6, 4]); circ(90 - EM.TILT, 'rgba(160,220,255,0.95)', 1.4, [6, 4]); circ(EM.TILT - 90, 'rgba(160,220,255,0.95)', 1.4, [6, 4]);
        var pm = []; for (var l3 = -90; l3 <= 90; l3 += 2) pm.push([0, l3]); globeLine(ctx, G, pm, { color: '#f9a8d4', w: 2.2 });
        if (term) { // night: shade every point whose Sun is below the horizon, with a soft twilight band
          var n = M.min(220, M.max(90, M.round(rr * 2 * M.min(1.5, F.c.dpr) / 1.6))), oc = offCanvas(n), octx = oc.getContext('2d'), img = octx.createImageData(n, n), d = img.data;
          for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) { var x = (i + 0.5) / n * 2 - 1, y = 1 - (j + 0.5) / n * 2, rho = x * x + y * y, p = (j * n + i) * 4; if (rho > 1.02) { d[p + 3] = 0; continue; } var z = M.sqrt(M.max(0, 1 - rho)), cz = x * sx + y * sy + z * sz, a = clamp((0.07 - cz) / 0.14, 0, 1); d[p] = 4; d[p + 1] = 10; d[p + 2] = 24; d[p + 3] = M.round(a * 196); }
          octx.putImageData(img, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(oc, cx - rr, cy - rr, 2 * rr, 2 * rr);
        }
        ctx.restore();
        // rim
        var rim = ctx.createRadialGradient(cx, cy, rr * 0.86, cx, cy, rr * 1.06); rim.addColorStop(0, 'rgba(120,190,255,0)'); rim.addColorStop(0.7, 'rgba(120,190,255,0.25)'); rim.addColorStop(1, 'rgba(120,190,255,0)'); ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(cx, cy, rr * 1.06, 0, TAU); ctx.fill();
        // labels for the special lines (on the near side, at the left edge of the disk)
        // labels: the grid's degrees and the special lines stay in quiet mode (reading them is the skill); lineNames: false hides the names
        if (o.lineNames !== false) {
          var labs = [[0, 'Equator', '#ffd479'], [EM.TILT, 'Tropic of Cancer', '#ffd479'], [-EM.TILT, 'Tropic of Capricorn', '#ffd479'], [90 - EM.TILT, 'Arctic Circle', '#a0dcff'], [EM.TILT - 90, 'Antarctic Circle', '#a0dcff']];
          labs.forEach(function (L) { var best = null; for (var l4 = -180; l4 <= 180; l4 += 2) { var q = G.p(l4, L[0]); if (q[2] > 0.25 && (!best || q[0] < best[0])) best = q; } if (best) txt(ctx, L[1], best[0] + 4, best[1] - 7, { size: 11, color: L[2], halo: 'rgba(6,17,26,0.75)' }); });
          var pq = null; for (var l5 = -60; l5 <= 60; l5 += 2) { var q5 = G.p(0, l5); if (q5[2] > 0.3 && (!pq || q5[1] > pq[1])) pq = q5; } if (pq) txt(ctx, 'Prime meridian', pq[0] + 5, pq[1] - 4, { size: 11, color: '#f9a8d4', halo: 'rgba(6,17,26,0.75)' });
        }
        if (o.gridLabels !== false) {
          var cl0 = M.round(center() / grid) * grid;
          for (var lg = -90 + grid; lg < 90; lg += grid) { if (lg === 0) continue; var q6 = G.p(cl0 + grid / 2, lg); if (q6[2] > 0.2) txt(ctx, M.abs(lg) + '°' + (lg > 0 ? 'N' : 'S'), q6[0], q6[1] - 1, { size: 10, color: '#fff', align: 'center', halo: 'rgba(6,17,26,0.7)' }); }
          for (var lm = -180 + grid; lm <= 180; lm += grid) { var q8 = G.p(lm, -grid / 2 + (view.lat0 > 40 ? grid : 0)); if (q8[2] > 0.35) txt(ctx, (lm === 0 ? '0°' : M.abs(lm) + '°' + (lm === 180 ? '' : lm > 0 ? 'E' : 'W')), q8[0], q8[1], { size: 10, color: '#fff', align: 'center', halo: 'rgba(6,17,26,0.7)' }); }
        }
        if (o.tz && !F.quiet) for (var b2 = -180; b2 < 180; b2 += 15) { var mid = b2 + 7.5, q7 = G.p(mid, 0); if (q7[2] > 0.3) txt(ctx, hm(S.utc + mid / 15), q7[0], q7[1] + 12, { size: 10, color: '#fff', align: 'center', halo: 'rgba(6,17,26,0.7)' }); }
        if (term && o.subsolar !== false) { var qs = G.p(sun.lon, sun.dec); if (qs[2] > 0) { circle(ctx, qs[0], qs[1], 7, 'rgba(255,214,110,0.35)'); circle(ctx, qs[0], qs[1], 3.5, '#ffe28a', '#7a5a10', 1); } }
        pts.forEach(function (p) { var q = G.p(p.lon, p.lat); if (q[2] <= 0) return; circle(ctx, q[0], q[1], 4.5, '#ff6b6b', '#fff', 1.5); if (p.label.length <= 2) badge(ctx, p.label, q[0] + 13, q[1] - 13, { k: k, r: 10 }); else pill(ctx, p.label, q[0] + 8, q[1] - 14, { align: 'left', size: 11, k: k }); if (!F.quiet && o.coords !== false) txt(ctx, latStr(p.lat, 0) + ', ' + lonStr(p.lon, 0), q[0] + 8, q[1] + 12, { size: 10, color: '#fff', halo: 'rgba(6,17,26,0.8)' }); });
        if (probe && !F.quiet) { var qp = G.p(probe[0], probe[1]); if (qp[2] > 0) { circle(ctx, qp[0], qp[1], 5, null, '#ffd479', 2); } }
        if (F.focused()) focusRing(ctx, cx, cy, rr + 6);
        if (term && !F.quiet) txt(ctx, EM.dateStr(S.doy) + ' · ' + hm(S.utc) + ' UTC', 10, 14, { size: 12, color: '#dbe7ef' });
        if (!F.quiet) txt(ctx, 'Grid every ' + grid + '°', w - 10, h - 12, { size: 11, color: '#8fb3c6', align: 'right' });
        T.sun(latStr(sun.dec, 1) + ', ' + lonStr(sun.lon, 1));
        if (probe) { T.probe(latStr(probe[1], 0) + ', ' + lonStr(probe[0], 0)); T.local(hm(S.utc + probe[0] / 15 + sun.eot / 60)); } else { T.probe('tap the globe'); T.local('—'); }
        if (!term) { T.sun.box.hidden = true; T.local.box.hidden = true; }
        var desc = 'A globe of Earth with lines of latitude and longitude every ' + grid + ' degrees, the equator, the tropics, the polar circles and the prime meridian' + (term ? '. Sunlight lights one half; the other half is in night' : '') + (pts.length ? '. Marked places: ' + pts.map(function (p) { return p.label + (F.quiet ? '' : ' at ' + latStr(p.lat, 0) + ', ' + lonStr(p.lon, 0)); }).join('; ') : '') + '.';
        F.alt(desc);
        if (term) {
          var lat0 = S.lat;
          F.say('On ' + EM.dateStr(S.doy) + ' the Sun is straight overhead at <b>' + latStr(sun.dec, 1) + '</b>. At ' + latStr(lat0, 0) + ' the day lasts <b>' + hmWords(EM.dayLength(lat0, sun.dec)) + '</b> and the noon Sun stands <b>' + fm(M.max(0, EM.noonAlt(lat0, sun.dec)), 1) + '°</b> high. Earth turns toward the east once a day, so the Sun seems to cross the sky from east to west.', 'Earth turns toward the east once a day; the half facing the Sun has day.');
        } else F.say(pts.length ? 'Latitude runs north and south of the equator (0° to 90°). Longitude runs east and west of the prime meridian (0° to 180°).' : 'Lines of latitude circle Earth parallel to the equator and never meet. Lines of longitude run from pole to pole and meet at the poles.', 'Latitude: north or south of the equator. Longitude: east or west of the prime meridian.');
      };
    }

    // ---------------- orbit ----------------
    function orbit(F) {
      F.size({ aspect: 1.75, max: 440, narrow: 0.78 });
      var ex = !!o.exaggerate, T = F.tiles([{ k: 'dist', label: 'Distance to the Sun', secret: true }, { k: 'noon', label: 'Noon Sun height', secret: true }, { k: 'day', label: 'Length of daylight', secret: true }, { k: 'season', label: 'Season', secret: true }]);
      dateSlider(F.ctl, function () { F.redraw(); });
      var ls = V.slider(F.ctl, { label: 'Latitude', min: -90, max: 90, step: 1, value: S.lat, fmt: function (v) { return latStr(v, 0); }, input: function (v) { S.lat = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { S.doy = S.doy + dt * 30; if (S.doy > 365) S.doy -= 365; F.redraw(); }, { label: 'Run the year' });
      check(row, 'Stretch the orbit’s shape', ex, function (v) { ex = v; F.redraw(); });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; if (a[0]) S.doy = ((S.doy - 1 + a[0] * (e.shiftKey ? 30 : 5)) % 365 + 365) % 365 + 1; if (a[1]) { S.lat = clamp(S.lat - a[1] * 5, -90, 90); ls.set(S.lat); } F.redraw(); return true; }, 'Arrow keys: left and right change the date, up and down the latitude.');
      F.draw = function () {
        var k = spaceBg(F), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560;
        var ow = wide ? w * 0.6 : w, oh = wide ? h : h * 0.56, ocx = ow / 2, ocy = oh / 2 + 6, view = 0.36, A = M.min(ow * 0.42, (oh / 2 - 46) / view);
        var e = ex ? 0.45 : EM.ECC_NOW, sun0 = EM.sun(S.doy);
        // positions: heliocentric longitude L of Earth; screen angle u = L − 270 (June solstice at the right)
        function pos(L, rr) { var u = (L - 270) * RAD; return [ocx + A * rr * M.cos(u), ocy + A * rr * M.sin(u) * view]; }
        function rAt(L) { return (1 - e * e) / (1 + e * M.cos((L - 102.9) * RAD)); }
        // orbit path
        ctx.save(); ctx.strokeStyle = 'rgba(143,179,198,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath();
        for (var L = 0; L <= 360; L += 2) { var q = pos(L, rAt(L)); if (L) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }
        ctx.stroke(); ctx.restore();
        // the Sun at the focus
        sunGlow(ctx, ocx, ocy, M.max(9, A * 0.07));
        // marked days
        var marks = [['03-20', 'March equinox'], ['06-21', 'June solstice'], ['09-22', 'September equinox'], ['12-21', 'December solstice'], ['01-03', 'Closest (perihelion)'], ['07-04', 'Farthest (aphelion)']];
        marks.forEach(function (m, i) {
          var dd = EM.doy(m[0]), s = EM.sun(dd), Lm = s.lam + 180, q = pos(Lm, rAt(Lm)), peri = i >= 4;
          circle(ctx, q[0], q[1], 3, peri ? '#f9a8d4' : '#ffd479');
          if (peri && F.quiet) return;
          var lab = peri ? m[1] + ', ' + EM.dateStr(dd, true) : m[1], side = q[1] < ocy - 5 ? -1 : q[1] > ocy + 5 ? 1 : (peri ? -1 : 1);
          var tw2 = tw(ctx, lab, { size: 10.5 }), lx = clamp(q[0], tw2 / 2 + 4, ow - tw2 / 2 - 4);
          txt(ctx, lab, lx, q[1] + side * (peri ? 12 : 13), { size: 10.5, color: peri ? '#f9a8d4' : '#dbe7ef', align: 'center', halo: 'rgba(6,17,26,0.75)' });
        });
        // Earth
        var Le = sun0.lam + 180, qe = pos(Le, rAt(Le)), toSun = M.atan2(ocy - qe[1], ocx - qe[0]), er = M.max(8, A * 0.065);
        litBall(ctx, qe[0], qe[1], er, toSun, '#5aa2d8', '#16314a');
        // axis: always tilted toward the left of the picture (toward the June-solstice side of the Sun)
        var tl = EM.TILT * RAD, ax = -M.sin(tl), ay = -M.cos(tl);
        line(ctx, [[qe[0] - ax * er * 1.9, qe[1] - ay * er * 1.9], [qe[0] + ax * er * 1.9, qe[1] + ay * er * 1.9]], { color: '#fff', w: 1.8 });
        txt(ctx, 'N', qe[0] + ax * er * 2.3, qe[1] + ay * er * 2.3, { size: 10, color: '#fff', align: 'center', bold: true });
        if (ex) txt(ctx, 'Orbit shape stretched to show it; the real orbit is nearly a circle', 10, oh - 12, { size: 11, color: '#ffd479' });
        else if (!F.quiet) txt(ctx, 'True shape: nearly a circle (Sun 2.5 million km off center)', 10, oh - 12, { size: 11, color: '#8fb3c6' });
        txt(ctx, EM.dateStr(S.doy), 10, 14, { size: 13, color: '#dbe7ef', bold: true });
        // side view of Earth on this date: sunlight from the left
        var px = wide ? ow : 0, py = wide ? 0 : oh, pw = wide ? w - ow : w, ph = wide ? h : h - oh;
        ctx.save(); ctx.fillStyle = 'rgba(12,28,42,0.85)'; rrect(ctx, px + 8, py + 8, pw - 16, ph - 16, 12); ctx.fill(); ctx.restore();
        var dec = sun0.dec, cx2 = px + pw * 0.58, cy2 = py + ph * 0.54, r2 = M.min(pw * 0.3, ph * 0.33);
        txt(ctx, 'Earth seen from the side', px + 18, py + 24, { size: 12, color: '#dbe7ef', bold: true });
        for (var ry = -3; ry <= 3; ry++) arrow(ctx, px + 16, cy2 + ry * r2 * 0.32, cx2 - r2 - 6, cy2 + ry * r2 * 0.32, { color: 'rgba(255,214,110,0.55)', w: 1.2, head: 6 });
        txt(ctx, 'Sunlight', px + 18, py + 42, { size: 11, color: '#ffd479' });
        // Earth: day half on the left
        circle(ctx, cx2, cy2, r2, '#16314a'); ctx.save(); ctx.beginPath(); ctx.arc(cx2, cy2, r2, PI / 2, PI * 1.5); ctx.closePath(); ctx.fillStyle = '#5aa2d8'; ctx.fill(); ctx.restore();
        // axis tilted toward the Sun by the declination (the Sun's latitude)
        var tilt = dec * RAD, axx = -M.sin(tilt), axy = -M.cos(tilt);
        line(ctx, [[cx2 - axx * r2 * 1.25, cy2 - axy * r2 * 1.25], [cx2 + axx * r2 * 1.25, cy2 + axy * r2 * 1.25]], { color: '#fff', w: 1.6 });
        txt(ctx, 'N', cx2 + axx * r2 * 1.38, cy2 + axy * r2 * 1.38, { size: 10, color: '#fff', bold: true, align: 'center' });
        // equator and the chosen latitude as seen edge-on: a line across the disk, lit where it faces the Sun
        function latLine(phi, col, lw) {
          var f = phi * RAD, pts2 = [], lit = [];
          for (var H = 0; H <= 360; H += 3) {
            var hr = H * RAD, x0 = M.cos(f) * M.cos(hr), z0 = M.sin(f), y0 = M.cos(f) * M.sin(hr);
            var xs = x0 * M.cos(tilt) + z0 * M.sin(tilt), zs = -x0 * M.sin(tilt) + z0 * M.cos(tilt); // xs toward the Sun
            if (y0 < 0) continue; // front half only (an edge-on circle is a line)
            pts2.push([cx2 - xs * r2, cy2 - zs * r2, xs > 0]);
          }
          pts2.sort(function (a, b) { return a[0] - b[0]; });
          line(ctx, pts2.map(function (p) { return [p[0], p[1]]; }), { color: 'rgba(255,255,255,0.35)', w: lw });
          line(ctx, pts2.filter(function (p) { return p[2]; }).map(function (p) { return [p[0], p[1]]; }), { color: col, w: lw + 0.6 });
          return pts2;
        }
        latLine(0, '#ffd479', 1.5);
        var lp = latLine(S.lat, '#ff8787', 2.2);
        if (lp.length && !F.quiet) txt(ctx, latStr(S.lat, 0), lp[lp.length - 1][0] + 6, lp[lp.length - 1][1], { size: 11, color: '#ff8787', halo: 'rgba(6,17,26,0.7)' });
        var hgt = EM.noonAlt(S.lat, dec), dl = EM.dayLength(S.lat, dec), dist = sun0.R * EM.AU / 1e6;
        var north = S.lat >= 0, mon = EM.dateOf(S.doy).m, d2 = EM.dateOf(S.doy).d, md = mon * 100 + d2;
        var nseason = md >= 321 && md < 621 ? 'spring' : md >= 621 && md < 922 ? 'summer' : md >= 922 && md < 1221 ? 'fall' : 'winter';
        var opp = { spring: 'fall', summer: 'winter', fall: 'spring', winter: 'summer' }, season = M.abs(S.lat) < 23.44 ? 'tropics: little change' : north ? nseason : opp[nseason];
        T.dist(nf(dist, 1) + ' million km'); T.noon(hgt > 0 ? fm(hgt, 1) + '°' : 'below the horizon'); T.day(hmWords(dl)); T.season(season);
        T.noon.label('Noon Sun height at ' + latStr(S.lat, 0)); T.day.label('Daylight at ' + latStr(S.lat, 0));
        F.alt('Earth on its orbit around the Sun on ' + EM.dateStr(S.doy) + '. Earth’s axis is tilted 23.4 degrees and always points the same way in space. A side view shows the ' + (dec > 0.5 ? 'Northern' : dec < -0.5 ? 'Southern' : 'neither') + ' Hemisphere tipped toward the Sun.');
        F.say('Earth is <b>' + nf(dist, 1) + ' million km</b> from the Sun, ' + (dist < 149.6 ? 'closer than average' : 'farther than average') + ', yet the seasons come from the tilt: the axis always points the same way, so the ' + (dec >= 0 ? 'Northern' : 'Southern') + ' Hemisphere is tipped toward the Sun now. At ' + latStr(S.lat, 0) + ' the noon Sun is ' + (hgt > 0 ? '<b>' + fm(hgt, 1) + '°</b> high' : 'below the horizon') + ' and daylight lasts <b>' + hmWords(dl) + '</b>.', 'The seasons come from the tilt of Earth’s axis, not from the distance to the Sun.');
      };
    }

    // ---------------- beam ----------------
    function beam(F) {
      var cmp = Array.isArray(o.compare) && o.compare.length >= 2 ? [num(o.compare[0], 0), num(o.compare[1], 60)] : null;
      F.size({ aspect: cmp ? 1.9 : 1.6, max: 400, narrow: cmp ? 0.85 : 1.15 });
      var alt = num(o.angle, 45), T = F.tiles(cmp ? [{ k: 'a', label: 'Place A', secret: true }, { k: 'b', label: 'Place B', secret: true }] : [{ k: 'h', label: 'Sun height', secret: true }, { k: 'len', label: 'Lit strip', secret: true }, { k: 'e', label: 'Sunlight per m²', secret: true }]);
      if (cmp) {
        dateSlider(F.ctl, function () { F.redraw(); });
        V.slider(F.ctl, { label: 'Latitude A', min: -90, max: 90, step: 1, value: cmp[0], fmt: function (v) { return latStr(v, 0); }, input: function (v) { cmp[0] = v; F.redraw(); } });
        V.slider(F.ctl, { label: 'Latitude B', min: -90, max: 90, step: 1, value: cmp[1], fmt: function (v) { return latStr(v, 0); }, input: function (v) { cmp[1] = v; F.redraw(); } });
      } else {
        var sl = V.slider(F.ctl, { label: 'Sun height', min: 5, max: 90, step: 1, value: alt, fmt: function (v) { return fm(v, 0) + '°'; }, input: function (v) { alt = v; F.redraw(); } });
        F.keys(function (e) { var a = arrowKey(e); if (!a) return false; alt = clamp(alt - a[1] * 5 + a[0] * 1, 5, 90); sl.set(alt); F.redraw(); return true; }, 'Up and down arrow keys change the Sun’s height.');
      }
      function panel(ctx, k, x0, y0, pw, ph, h, name) {
        var gy = y0 + ph - 34, W0 = M.min(pw * 0.2, 70), mPx = W0; // the beam is 1 m wide: mPx pixels per meter
        ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, pw, ph); ctx.clip();
        var sky = ctx.createLinearGradient(0, y0, 0, gy); sky.addColorStop(0, k.sky2); sky.addColorStop(1, k.sky); ctx.fillStyle = sky; ctx.fillRect(x0, y0, pw, gy - y0);
        ctx.fillStyle = k.land; ctx.fillRect(x0, gy, pw, ph - (gy - y0));
        // 1 m squares on the ground
        var gx0 = x0 + pw * 0.5; for (var i = -12; i <= 12; i++) { var xx = gx0 + i * mPx; line(ctx, [[xx, gy], [xx, gy + 8]], { color: k.landDark, w: 1 }); }
        if (!F.quiet || true) txt(ctx, 'ground marked every 1 m', x0 + pw - 8, y0 + ph - 8, { size: 10.5, color: k.dark ? '#d8e6cf' : '#2f4a22', align: 'right', base: 'bottom' });
        if (h > 0) {
          var hr = h * RAD, L = 1 / M.sin(hr), dx = M.cos(hr), dy = M.sin(hr), half = L * mPx / 2, xa = gx0 - half, xb = gx0 + half, far = M.max(pw, ph) * 1.6;
          // beam: a band of parallel rays ending on the strip
          var pa = [xa - dx * far, gy - dy * far], pb = [xb - dx * far, gy - dy * far];
          poly(ctx, [pa, [xa, gy], [xb, gy], pb], 'rgba(255,200,60,0.30)');
          for (var r2 = 0; r2 <= 4; r2++) { var xr = lerp(xa, xb, r2 / 4); arrow(ctx, xr - dx * far * 0.5, gy - dy * far * 0.5, xr, gy, { color: 'rgba(214,150,20,0.9)', w: 1.4, head: 7 }); }
          line(ctx, [[xa, gy + 1.5], [xb, gy + 1.5]], { color: '#e8590c', w: 5, cap: 'butt' });
          // beam width marker (1 m, across the beam)
          var Dm = M.max(40, M.min((gy - y0 - 40) / M.max(dy, 0.05) * 0.62, ((xa + xb) / 2 - x0 - 40) / M.max(dx, 0.05))), mx = (xa + xb) / 2 - dx * Dm, my = gy - dy * Dm, nx = -dy, ny = dx;
          line(ctx, [[mx - nx * mPx / 2 - dx * 0, my - ny * mPx / 2], [mx + nx * mPx / 2, my + ny * mPx / 2]], { color: k.ink, w: 1.6 });
          if (!F.quiet) { txt(ctx, 'beam 1 m wide', mx - nx * mPx / 2 + 8, my - ny * mPx / 2 - 6, { size: 11, color: k.ink, halo: k.halo }); txt(ctx, 'lit strip ' + fm(L, 2) + ' m', (xa + xb) / 2, gy + 20, { size: 12, color: k.dark ? '#ffd8b5' : '#7a2e0b', align: 'center', bold: true }); }
          // angle arc
          ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(xa, gy, 26, PI, PI + hr); ctx.stroke(); ctx.restore();
          if (!F.quiet) txt(ctx, fm(h, 0) + '°', xa - 30 - 8, gy - 12, { size: 12, color: k.ink, align: 'right', halo: k.halo });
        } else txt(ctx, 'The Sun is below the horizon at noon', x0 + pw / 2, y0 + ph / 2, { size: 13, color: k.ink, align: 'center' });
        if (name) txt(ctx, name, x0 + 10, y0 + 16, { size: 13, color: k.ink, bold: true });
        ctx.restore();
      }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h;
        if (cmp) {
          var dec = EM.sun(S.doy).dec, ha = EM.noonAlt(cmp[0], dec), hb = EM.noonAlt(cmp[1], dec), wide = w >= 520;
          if (wide) { panel(ctx, k, 0, 0, w / 2 - 3, h, ha, 'A: ' + (F.quiet ? '' : latStr(cmp[0], 0))); panel(ctx, k, w / 2 + 3, 0, w / 2 - 3, h, hb, 'B: ' + (F.quiet ? '' : latStr(cmp[1], 0))); }
          else { panel(ctx, k, 0, 0, w, h / 2 - 3, ha, 'A: ' + (F.quiet ? '' : latStr(cmp[0], 0))); panel(ctx, k, 0, h / 2 + 3, w, h / 2 - 3, hb, 'B: ' + (F.quiet ? '' : latStr(cmp[1], 0))); }
          function desc(lat, hh) { return hh > 0 ? 'noon Sun ' + fm(hh, 0) + '°, ' + nf(EM.beam(hh)) + ' W per m²' : 'Sun below the horizon'; }
          T.a(desc(cmp[0], ha)); T.b(desc(cmp[1], hb)); T.a.label('A: ' + latStr(cmp[0], 0) + ' at noon'); T.b.label('B: ' + latStr(cmp[1], 0) + ' at noon');
          F.alt('Two beams of sunlight of the same width at noon on ' + EM.dateStr(S.doy) + '. Place A ' + (F.quiet ? '' : '(' + latStr(cmp[0], 0) + ') ') + 'and place B' + (F.quiet ? '' : ' (' + latStr(cmp[1], 0) + ')') + '. The lower the Sun, the longer the lit strip, so each square meter gets less.');
          F.say('The same beam spreads over a longer strip where the Sun is lower. At A each square meter gets <b>' + (ha > 0 ? nf(EM.beam(ha)) : 0) + ' W</b>, at B <b>' + (hb > 0 ? nf(EM.beam(hb)) : 0) + ' W</b> (sunlight above the air, 1,361 W/m² straight on).', 'The lower the Sun, the more ground the same beam spreads over.');
        } else {
          panel(ctx, k, 0, 0, w, h, alt, '');
          var L2 = 1 / M.sin(alt * RAD);
          T.h(fm(alt, 0) + '°'); T.len(fm(L2, 2) + ' m'); T.e(nf(EM.beam(alt)) + ' W');
          F.alt('A beam of sunlight 1 meter wide hits flat ground with the Sun ' + (F.quiet ? '' : fm(alt, 0) + ' degrees ') + 'above the horizon. The lit strip on the ground is longer than the beam is wide when the Sun is low.');
          F.say('A beam 1 m wide lights a strip <b>' + fm(L2, 2) + ' m</b> long (1 ÷ sin ' + fm(alt, 0) + '°), so each square meter gets <b>' + nf(EM.beam(alt)) + ' W</b>, which is 1,361 W × sin ' + fm(alt, 0) + '°. Low sunlight crosses more air too, but the spreading is the bigger effect.', 'The same beam spreads over more ground when the Sun is low.');
        }
      };
    }

    // ---------------- milankovitch ----------------
    function milank(F) {
      F.size({ aspect: 1.75, max: 420, narrow: 0.82 });
      var P = { ecc: clamp(num(o.ecc, EM.ECC_NOW), 0, 0.06), tilt: clamp(num(o.tilt, EM.TILT), 22.1, 24.5), prec: o.prec != null ? num(o.prec, 3) : 3 };
      var T = F.tiles([{ k: 'q', label: 'June sunshine at 65° N', secret: true }, { k: 'now', label: 'Today’s orbit gives', secret: false }]);
      V.slider(F.ctl, { label: 'Eccentricity (cycle about 100,000 years)', min: 0, max: 0.06, step: 0.001, value: P.ecc, fmt: function (v) { return fm(v, 3); }, input: function (v) { P.ecc = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Tilt (cycle about 41,000 years)', min: 22.1, max: 24.5, step: 0.01, value: P.tilt, fmt: function (v) { return fm(v, 2) + '°'; }, input: function (v) { P.tilt = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Closest to the Sun on (cycle about 23,000 years)', min: 1, max: 365, step: 1, value: P.prec, fmt: function (v) { return EM.dateStr(v); }, input: function (v) { P.prec = v; F.redraw(); } });
      var row = F.row(); V.button(row, 'Today’s orbit', function () { P.ecc = EM.ECC_NOW; P.tilt = EM.TILT; P.prec = 3; F.reset(); milank(F); F.redraw(); });
      var qNow = EM.milank(EM.ECC_NOW, EM.TILT, EM.PERI_NOW, 65, 90);
      F.draw = function () {
        var k = spaceBg(F), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560;
        var periLam = EM.sun(P.prec).lam, q = EM.milank(P.ecc, P.tilt, periLam, 65, 90);
        // orbit (true shape; e ≤ 0.06 is still close to a circle)
        var ow = wide ? w * 0.42 : w * 0.5, oh = wide ? h : h * 0.55, cx = ow / 2, cy = oh / 2 + 8, A = M.min(ow, oh * 1.4) * 0.36, e = P.ecc;
        var Lp = periLam + 180; // Earth's heliocentric longitude at perihelion
        function opos(L) { var r = (1 - e * e) / (1 + e * M.cos((L - Lp) * RAD)), u = (L - 270) * RAD; return [cx + A * r * M.cos(u), cy + A * r * M.sin(u) * 0.5]; }
        ctx.save(); ctx.strokeStyle = 'rgba(143,179,198,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath();
        for (var t = 0; t <= 360; t += 3) { var qq = opos(t); if (t) ctx.lineTo(qq[0], qq[1]); else ctx.moveTo(qq[0], qq[1]); }
        ctx.stroke(); ctx.restore();
        sunGlow(ctx, cx, cy, 8);
        var qp = opos(Lp); circle(ctx, qp[0], qp[1], 4, '#f9a8d4');
        txt(ctx, 'closest', qp[0], qp[1] + (qp[1] > cy ? 14 : -12), { size: 10.5, color: '#f9a8d4', align: 'center', halo: 'rgba(6,17,26,0.7)' });
        var js = opos(270); circle(ctx, js[0], js[1], 4, '#ffd479'); txt(ctx, 'June', js[0] + 8, js[1], { size: 10.5, color: '#ffd479' });
        txt(ctx, 'Orbit (true shape)', 12, 18, { size: 12, color: '#dbe7ef', bold: true });
        // tilt picture
        var tx = wide ? ow + (w - ow) * 0.22 : ow + (w - ow) * 0.5, ty = wide ? h * 0.32 : oh * 0.5, tr2 = M.min(w, h) * 0.1;
        circle(ctx, tx, ty, tr2, '#3d7fb5'); var ta = P.tilt * RAD;
        line(ctx, [[tx + M.sin(ta) * tr2 * 1.6, ty - M.cos(ta) * tr2 * 1.6], [tx - M.sin(ta) * tr2 * 1.6, ty + M.cos(ta) * tr2 * 1.6]], { color: '#fff', w: 2 });
        line(ctx, [[tx, ty - tr2 * 1.6], [tx, ty + tr2 * 1.6]], { color: 'rgba(255,255,255,0.4)', w: 1, dash: [3, 3] });
        txt(ctx, 'Tilt ' + fm(P.tilt, 2) + '°', tx, ty + tr2 * 1.6 + 14, { size: 11.5, color: '#dbe7ef', align: 'center' });
        // the bar: June (solstice) daily sunshine at 65° N
        var bx = wide ? ow + (w - ow) * 0.45 : 16, by = wide ? 36 : oh + 20, bw = wide ? (w - ow) * 0.5 : w - 32, bh = wide ? h - 80 : h - oh - 64;
        var lo = 400, hi = 600, bar = chart(ctx, k, wide ? { x: bx + 34, y: by + 8, w: 34, h: bh - 8 } : { x: bx, y: by + 12, w: bw, h: 26 }, wide ? { x: { min: 0, max: 1, labels: false, grid: false }, y: { min: lo, max: hi, step: 50, grid: false, fmt: function (v) { return v; } } } : { x: { min: lo, max: hi, step: 50, grid: false, fmt: function (v) { return v; } }, y: { min: 0, max: 1, labels: false, grid: false } }, { bg: '#0f2232' });
        if (wide) { ctx.fillStyle = '#ffb347'; ctx.fillRect(bar.r.x + 3, bar.Y(q), bar.r.w - 6, bar.r.y + bar.r.h - bar.Y(q)); line(ctx, [[bar.r.x - 6, bar.Y(qNow)], [bar.r.x + bar.r.w + 6, bar.Y(qNow)]], { color: '#fff', w: 1.5, dash: [4, 3] }); if (!F.quiet) txt(ctx, 'today', bar.r.x + bar.r.w + 9, bar.Y(qNow), { size: 10.5, color: '#fff' }); txt(ctx, 'June sunshine at 65° N', bar.r.x + bar.r.w / 2, by - 14, { size: 11.5, color: '#dbe7ef', align: 'center', bold: true }); txt(ctx, 'W/m²', bar.r.x - 6, bar.r.y + bar.r.h + 14, { size: 10, color: '#8fb3c6', align: 'right' }); }
        else { ctx.fillStyle = '#ffb347'; ctx.fillRect(bar.r.x, bar.r.y + 3, bar.X(q) - bar.r.x, bar.r.h - 6); line(ctx, [[bar.X(qNow), bar.r.y - 5], [bar.X(qNow), bar.r.y + bar.r.h + 5]], { color: '#fff', w: 1.5, dash: [4, 3] }); txt(ctx, 'June sunshine at 65° N (W/m²)', bx, by - 2, { size: 11.5, color: '#dbe7ef', bold: true }); }
        T.q(nf(q) + ' W/m²'); T.now(nf(qNow) + ' W/m²');
        F.alt('Orbital cycles: an orbit of eccentricity ' + fm(P.ecc, 3) + ', a tilt of ' + fm(P.tilt, 2) + ' degrees, and Earth closest to the Sun on ' + EM.dateStr(P.prec) + '. A bar shows the June sunshine at 65 degrees north.');
        F.say('Daily June sunshine at 65° N (top of the air): <b>' + nf(q) + ' W/m²</b> (today’s orbit: ' + nf(qNow) + '). More tilt and a June close to the Sun make northern summers sunnier, which can melt ice sheets; these cycles act over tens of thousands of years, far too slowly to explain the warming of the last century.', 'More tilt, or being closest to the Sun in June, gives sunnier northern summers.');
      };
    }
  });

  // the Moon's face as seen from Earth: lit fraction from the elongation a; the lit side is on the right while waxing
  // (Northern Hemisphere view); flip mirrors it for the Southern Hemisphere
  function moonFace(ctx, x, y, r, a, flip, k) {
    var ar = wrap360(a) * RAD, waxing = M.sin(ar) >= 0, c = M.cos(ar); // c = 1 new, −1 full
    circle(ctx, x, y, r, '#2a3340');
    ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
    ctx.beginPath(); var s = waxing ? 1 : -1;
    // lit limb: half circle on the lit side
    ctx.arc(0, 0, r, -PI / 2, PI / 2, s < 0);
    // terminator: half ellipse with x-radius r*|c|; bulges toward the lit side when gibbous
    ctx.ellipse(0, 0, r * M.abs(c), r, 0, PI / 2, -PI / 2, (c > 0) === (s > 0));
    ctx.closePath(); ctx.fillStyle = '#f1eadb'; ctx.fill();
    ctx.restore();
    // a few soft maria
    ctx.save(); ctx.globalAlpha = 0.16; circle(ctx, x - r * 0.25, y - r * 0.2, r * 0.22, '#6b6457'); circle(ctx, x + r * 0.2, y + r * 0.25, r * 0.16, '#6b6457'); circle(ctx, x + r * 0.05, y - r * 0.38, r * 0.12, '#6b6457'); ctx.restore();
    circle(ctx, x, y, r, null, 'rgba(255,255,255,0.25)', 1);
  }

  /* es-moon: Sun, Earth and Moon.
     opts:
       mode: 'phases' | 'eclipse' | 'tides'      modes: true or a list for tabs
       angle: the Moon's angle from the Sun as seen from Earth (0 = new, 90 = first quarter, 180 = full), or day: 0–29.5
       shadow: true (phases: draw Earth's shadow); names: true (phases: names around the orbit); rise: true (rise and set times)
       hemisphere: 'N' | 'S' (how the Moon looks; default 'N')
       date: 'MM-DD' (eclipse: the date); node: 'MM-DD' (eclipse: a date when the Sun lines up with the Moon's nodes; default '04-08')
       tilt3x: true (eclipse: draw the 5.1° tilt three times bigger; default true)
       sun: true (tides: add the Sun's tide); sunAngle: degrees between the Sun's and Moon's directions; town: start angle
       quiet: hides the phase name, lit fraction, times, tide range and eclipse type; lock: no dragging or sliders */
  R('es-moon', function (el, o) {
    var F = frame(el, o, 'Sun, Earth and Moon', { aspect: 1.5, max: 460 });
    var S = { a: o.day != null ? num(o.day, 0) / EM.SYNODIC * 360 : num(o.angle, 45) };
    var flip = String(o.hemisphere || 'N').toUpperCase() === 'S';
    return F.modes({ phases: phases, eclipse: eclipse, tides: tides }, { phases: 'Phases', eclipse: 'Eclipses', tides: 'Tides' });

    // ---------------- phases ----------------
    function phases(F) {
      F.size({ aspect: 1.5, max: 460, narrow: 0.95 });
      var shadow = !!o.shadow, names = !!o.names, rise = o.rise !== false, geo = null;
      var T = F.tiles([{ k: 'name', label: 'Phase', secret: true }, { k: 'lit', label: 'Lit fraction seen from Earth', secret: true }, { k: 'age', label: 'Days since new moon', secret: true }].concat(rise ? [{ k: 'rise', label: 'Rises and sets about', secret: true }] : []));
      var ms = V.slider(F.ctl, { label: 'Days since new moon', min: 0, max: EM.SYNODIC, step: 0.1, value: S.a / 360 * EM.SYNODIC, fmt: function (v) { return fm(v, 1); }, input: function (v) { S.a = v / EM.SYNODIC * 360; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { S.a = (S.a + dt * 36) % 360; ms.set(S.a / 360 * EM.SYNODIC); F.redraw(); }, { label: 'Run a month' });
      check(row, 'Earth’s shadow', shadow, function (v) { shadow = v; F.redraw(); });
      check(row, 'Phase names', names, function (v) { names = v; F.redraw(); });
      F.drag({
        hit: function (x, y) { if (!geo) return null; var mx = geo.cx + geo.R * M.cos(S.a * RAD), my = geo.cy - geo.R * M.sin(S.a * RAD); return M.hypot(x - mx, y - my) < 26 || M.abs(M.hypot(x - geo.cx, y - geo.cy) - geo.R) < 18 ? 'm' : null; },
        move: function (h, x, y) { S.a = wrap360(M.atan2(geo.cy - y, x - geo.cx) * DEG); ms.set(S.a / 360 * EM.SYNODIC); F.redraw(); }
      });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; S.a = wrap360(S.a + (a[0] || -a[1]) * (e.shiftKey ? 45 : 5)); ms.set(S.a / 360 * EM.SYNODIC); F.redraw(); return true; }, 'Drag the Moon around its orbit, or focus the picture and use the arrow keys (Shift for bigger steps).');
      F.draw = function () {
        var k = spaceBg(F), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560;
        var vw = wide ? w * 0.66 : w, vh = wide ? h : h * 0.68, cx = vw * 0.5, cy = vh * 0.5, Rr = M.min(vw * 0.36, vh * 0.38), er = M.max(14, Rr * 0.16);
        geo = { cx: cx, cy: cy, R: Rr };
        // sunlight from the right
        for (var i = -4; i <= 4; i++) { var yy = cy + i * vh * 0.11; arrow(ctx, vw - 6, yy, vw - 60, yy, { color: 'rgba(255,214,110,0.6)', w: 1.4, head: 7 }); }
        txt(ctx, 'Sunlight', vw - 10, 16, { size: 11.5, color: '#ffd479', align: 'right' });
        if (shadow) { // Earth's shadow points away from the Sun
          var g = ctx.createLinearGradient(cx, 0, 0, 0); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0.25)');
          poly(ctx, [[cx, cy - er], [cx - Rr * 1.25, cy - er * 0.55], [cx - Rr * 1.25, cy + er * 0.55], [cx, cy + er]], g);
          if (!F.quiet) txt(ctx, 'Earth’s shadow', cx - Rr * 0.62, cy - er * 0.85 - 6, { size: 10.5, color: '#8fb3c6', align: 'center' });
        }
        ctx.save(); ctx.strokeStyle = 'rgba(143,179,198,0.45)'; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.arc(cx, cy, Rr, 0, TAU); ctx.stroke(); ctx.restore();
        // Earth from above the North Pole: day on the right
        litBall(ctx, cx, cy, er, 0, '#5aa2d8', '#16314a'); circle(ctx, cx, cy, 2.5, '#fff');
        if (!F.quiet) txt(ctx, 'North Pole', cx, cy + er + 11, { size: 10, color: '#8fb3c6', align: 'center' });
        // turning arrows
        ctx.save(); ctx.strokeStyle = 'rgba(219,231,239,0.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, Rr + 16, -2.2, -1.2); ctx.stroke(); ctx.restore();
        var ta = -1.2; arrow(ctx, cx + (Rr + 16) * M.cos(ta - 0.05), cy + (Rr + 16) * M.sin(ta - 0.05), cx + (Rr + 16) * M.cos(ta), cy + (Rr + 16) * M.sin(ta), { color: 'rgba(219,231,239,0.6)', head: 7 });
        if (names) for (var j = 0; j < 8; j++) { var an = j * 45 * RAD, lx = cx + (Rr + 34) * M.cos(an), ly = cy - (Rr + 30) * M.sin(an); txt(ctx, F.quiet ? LETTERS[j] : EM.PHASES[j], clamp(lx, 40, vw - 40), clamp(ly, 10, vh - 10), { size: 10.5, color: '#dbe7ef', align: 'center', halo: 'rgba(6,17,26,0.8)' }); }
        // the Moon: always half lit (the half facing the Sun)
        var mx = cx + Rr * M.cos(S.a * RAD), my = cy - Rr * M.sin(S.a * RAD), mr = M.max(9, er * 0.55);
        line(ctx, [[cx, cy], [mx, my]], { color: 'rgba(255,255,255,0.25)', w: 1, dash: [3, 4] });
        litBall(ctx, mx, my, mr, 0, '#f1eadb', '#39424e');
        if (F.focused()) focusRing(ctx, mx, my, mr + 8);
        // what we see from Earth
        var ix = wide ? vw + (w - vw) / 2 : w / 2, iy = wide ? h * 0.42 : vh + (h - vh) * 0.47, ir = wide ? M.min((w - vw) * 0.3, h * 0.2) : M.min((h - vh) * 0.27, w * 0.15);
        if (!wide) { ctx.save(); ctx.fillStyle = 'rgba(12,28,42,0.9)'; ctx.fillRect(0, vh, w, h - vh); ctx.restore(); }
        else { ctx.save(); ctx.fillStyle = 'rgba(12,28,42,0.9)'; rrect(ctx, vw + 4, 8, w - vw - 12, h - 16, 12); ctx.fill(); ctx.restore(); }
        moonFace(ctx, ix, iy, ir, S.a, flip, k);
        txt(ctx, 'Seen from Earth' + (flip ? ' (Southern Hemisphere)' : ''), ix, wide ? iy - ir - 18 : iy - ir - 10, { size: 11.5, color: '#dbe7ef', align: 'center', bold: true });
        var ph = EM.moonPhase(S.a);
        if (!F.quiet) txt(ctx, ph.name, ix, iy + ir + 18, { size: 13, color: '#ffd479', align: 'center', bold: true });
        T.name(ph.name); T.lit(fm(ph.lit * 100, 0) + '%'); T.age(fm(ph.age, 1) + ' days'); if (rise) T.rise(clock12(ph.rise) + ' / ' + clock12(ph.set));
        var inSh = M.abs(wrap180(S.a - 180)) < 4;
        F.alt('View from above Earth’s North Pole with sunlight from the right. The Moon is ' + (F.quiet ? 'at a marked spot on its orbit' : fm(S.a, 0) + ' degrees around its orbit from the new-moon position') + '; half of it is always lit by the Sun. An inset shows how it looks from Earth' + (F.quiet ? '.' : ': ' + ph.name + ', ' + fm(ph.lit * 100, 0) + ' percent lit.'));
        F.say('The Moon is always half lit by the Sun. From Earth we see part of the lit half: <b>' + ph.name + '</b>, <b>' + fm(ph.lit * 100, 0) + '%</b> of the face lit, <b>' + fm(ph.age, 1) + '</b> days after new moon' + (rise ? '; it rises about <b>' + clock12(ph.rise) + '</b> and sets about <b>' + clock12(ph.set) + '</b>' : '') + '.' + (shadow ? (inSh ? ' Seen from above it looks as if the Moon is in Earth’s shadow, but the Moon’s orbit is tilted, so most full moons pass above or below the shadow (see the eclipse picture).' : ' Earth’s shadow points away from the Sun and misses the Moon: the shadow does not make the phases.') : ''), 'The Moon is always half lit; we see different amounts of the lit half as it goes around Earth.');
      };
    }

    // ---------------- eclipse ----------------
    function eclipse(F) {
      F.size({ aspect: 1.7, max: 440, narrow: 0.72 });
      var E = { doy: EM.doy(o.date || '04-08'), age: S.a / 360 * EM.SYNODIC }, nodeLon = EM.sun(EM.doy(o.node || '04-08')).lam, big = o.tilt3x !== false;
      var T = F.tiles([{ k: 'beta', label: 'Moon above or below Earth’s orbit', secret: true }, { k: 'kind', label: 'Eclipse?', secret: true }]);
      V.slider(F.ctl, { label: 'Date', min: 1, max: 365, step: 1, value: E.doy, fmt: function (v) { return EM.dateStr(v); }, input: function (v) { E.doy = v; F.redraw(); } });
      var as = V.slider(F.ctl, { label: 'Days since new moon', min: 0, max: EM.SYNODIC, step: 0.1, value: E.age, fmt: function (v) { return fm(v, 1); }, input: function (v) { E.age = v; F.redraw(); } });
      var row = F.row(); V.button(row, 'New moon', function () { E.age = 0; as.set(0); F.redraw(); }); V.button(row, 'Full moon', function () { E.age = EM.SYNODIC / 2; as.set(E.age); F.redraw(); });
      check(row, 'Draw the tilt 3× bigger', big, function (v) { big = v; F.redraw(); });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; if (a[0]) { E.doy = ((E.doy - 1 + a[0] * 5) % 365 + 365) % 365 + 1; } else { E.age = clamp(E.age - a[1] * 0.5, 0, EM.SYNODIC); as.set(E.age); } F.redraw(); return true; }, 'Arrow keys: left and right change the date, up and down the Moon’s age.');
      F.draw = function () {
        var k = spaceBg(F), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560;
        var lam = EM.sun(E.doy).lam, el2 = E.age / EM.SYNODIC * 360, moonLon = lam + el2, beta = EM.moonLat(moonLon, nodeLon);
        var newish = M.abs(wrap180(el2)) < 12, fullish = M.abs(wrap180(el2 - 180)) < 12, ec = newish ? EM.eclipse(lam, nodeLon, false) : fullish ? EM.eclipse(lam, nodeLon, true) : { kind: 'none', beta: beta };
        // top view: Sun at center, Earth's orbit, the Moon's orbit (enlarged) with its line of nodes, always pointing the same way
        var tw2 = wide ? w * 0.44 : w, th = wide ? h : h * 0.5, cx = tw2 / 2, cy = th / 2 + 8, A = M.min(tw2, th) * 0.34;
        txt(ctx, 'From above (not to scale)', 12, 16, { size: 11.5, color: '#dbe7ef', bold: true });
        // eclipse seasons: Earth's orbit where the line of nodes points near the Sun
        ctx.save(); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(255,179,71,0.35)';
        [0, 180].forEach(function (off) { var c0 = (nodeLon + off + 180 - 90) * RAD; ctx.beginPath(); ctx.arc(cx, cy, A, -(c0 + 17 * RAD), -(c0 - 17 * RAD)); ctx.stroke(); });
        ctx.restore();
        ctx.save(); ctx.strokeStyle = 'rgba(143,179,198,0.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, A, 0, TAU); ctx.stroke(); ctx.restore();
        sunGlow(ctx, cx, cy, 8);
        var ea = (lam + 180 - 90) * RAD, ex = cx + A * M.cos(ea), ey = cy - A * M.sin(ea), mr = A * 0.3;
        // Moon's orbit around Earth: solid half above Earth's orbital plane, dashed half below; line of nodes fixed in direction
        for (var t = 0; t < 360; t += 6) { var l1 = (t - 90) * RAD, l2 = (t + 6 - 90) * RAD, above = M.sin((t + 3 - nodeLon) * RAD) > 0; line(ctx, [[ex + mr * M.cos(l1), ey - mr * M.sin(l1)], [ex + mr * M.cos(l2), ey - mr * M.sin(l2)]], { color: above ? '#dbe7ef' : 'rgba(219,231,239,0.45)', w: above ? 1.8 : 1.2, dash: above ? [] : [3, 3] }); }
        var na = (nodeLon - 90) * RAD; line(ctx, [[ex - mr * 1.25 * M.cos(na), ey + mr * 1.25 * M.sin(na)], [ex + mr * 1.25 * M.cos(na), ey - mr * 1.25 * M.sin(na)]], { color: '#f9a8d4', w: 1.5, dash: [5, 3] });
        litBall(ctx, ex, ey, 7, M.atan2(cy - ey, cx - ex), '#5aa2d8', '#16314a');
        var ml = (moonLon - 90) * RAD, mx = ex + mr * M.cos(ml), my = ey - mr * M.sin(ml); litBall(ctx, mx, my, 4.5, M.atan2(cy - my, cx - mx), '#f1eadb', '#39424e');
        if (!F.quiet) txt(ctx, 'line of nodes', ex + mr * 1.3 * M.cos(na), ey - mr * 1.3 * M.sin(na) - 8, { size: 10, color: '#f9a8d4', align: 'center', halo: 'rgba(6,17,26,0.8)' });
        txt(ctx, 'Shaded arcs: eclipse seasons', 12, th - 10, { size: 10.5, color: '#ffb347' });
        // side view along the Sun–Earth line
        var sx0 = wide ? tw2 : 0, sy0 = wide ? 0 : th, sw = wide ? w - tw2 : w, sh = wide ? h : h - th;
        ctx.save(); ctx.fillStyle = 'rgba(12,28,42,0.9)'; rrect(ctx, sx0 + 6, sy0 + 6, sw - 12, sh - 12, 12); ctx.fill(); ctx.restore();
        txt(ctx, 'From the side', sx0 + 18, sy0 + 22, { size: 11.5, color: '#dbe7ef', bold: true });
        var midY = sy0 + sh * 0.55, sunX = sx0 + 34, earthX = sx0 + sw * 0.6, Rm = M.min(sw * 0.3, 150), scale = big ? 3 : 1;
        sunGlow(ctx, sunX, midY, 14);
        line(ctx, [[sunX, midY], [sx0 + sw - 14, midY]], { color: 'rgba(255,214,110,0.35)', w: 1, dash: [4, 4] });
        if (!F.quiet) txt(ctx, 'plane of Earth’s orbit', sunX + 22, midY + 14, { size: 10, color: '#ffd479' });
        // Earth's shadow (to the right): umbra narrowing, penumbra widening
        var er2 = 10; poly(ctx, [[earthX, midY - er2], [sx0 + sw - 10, midY - er2 * 1.7], [sx0 + sw - 10, midY + er2 * 1.7], [earthX, midY + er2]], 'rgba(0,0,0,0.25)');
        poly(ctx, [[earthX, midY - er2], [earthX + Rm * 1.15, midY - er2 * 0.5], [earthX + Rm * 1.15, midY + er2 * 0.5], [earthX, midY + er2]], 'rgba(0,0,0,0.55)');
        litBall(ctx, earthX, midY, er2, PI, '#5aa2d8', '#16314a');
        // the Moon's orbit seen edge-on, tilted; heights scaled so 1° of latitude = Rm·sin(1°)·scale
        // the Moon's orbit seen from the side: x = −cos(elongation), height = sin(tilt)·sin(elongation + Sun − node): a thin ellipse
        ctx.save(); ctx.strokeStyle = 'rgba(219,231,239,0.75)'; ctx.lineWidth = 1.4; ctx.beginPath();
        for (var e3 = 0; e3 <= 360; e3 += 4) { var xx3 = earthX - Rm * M.cos(e3 * RAD), yy3 = midY - M.sin(EM.MOON_INC * RAD) * M.sin((e3 + lam - nodeLon) * RAD) * Rm * scale; if (e3) ctx.lineTo(xx3, yy3); else ctx.moveTo(xx3, yy3); }
        ctx.stroke(); ctx.restore();
        if (!F.quiet) txt(ctx, 'Moon\u2019s orbit, tilted ' + (big ? '5.1° (drawn 3× bigger)' : '5.1°'), earthX, midY - M.sin(EM.MOON_INC * RAD) * Rm * scale - 14, { size: 10, color: '#dbe7ef', align: 'center' });
        // Moon position along its orbit as seen from the side: x by cos(elongation), height by latitude
        var mxs = earthX - Rm * M.cos(el2 * RAD), mys = midY - M.sin(beta * RAD) * Rm * scale;
        litBall(ctx, mxs, mys, 6, PI, '#f1eadb', '#39424e');
        if (newish && ec.kind === 'solar') { poly(ctx, [[mxs, mys - 6], [earthX, midY - 2], [earthX, midY + 2], [mxs, mys + 6]], 'rgba(0,0,0,0.6)'); }
        var kindTxt = ec.kind === 'solar' ? 'A solar eclipse: the Moon’s shadow falls on Earth' : ec.kind === 'lunar' ? 'A lunar eclipse: the Moon passes into Earth’s shadow' : ec.kind === 'penumbral' ? 'Only a faint penumbral lunar eclipse' : newish ? 'New moon, but the Moon passes ' + (beta > 0 ? 'above' : 'below') + ' the Sun: no eclipse' : fullish ? 'Full moon, but the Moon passes ' + (beta > 0 ? 'above' : 'below') + ' Earth’s shadow: no eclipse' : 'No eclipse at this phase';
        if (!F.quiet) txt(ctx, kindTxt, sx0 + sw / 2, sy0 + sh - 22, { size: 12, color: ec.kind === 'none' ? '#dbe7ef' : '#ffb347', align: 'center', bold: true });
        T.beta(fm(M.abs(beta), 2) + '° ' + (beta >= 0 ? 'above' : 'below')); T.kind(ec.kind === 'none' ? 'no' : ec.kind === 'penumbral' ? 'faint (penumbral)' : ec.kind + ' eclipse');
        F.alt('Eclipse geometry on ' + EM.dateStr(E.doy) + ', ' + fm(E.age, 1) + ' days after new moon. The Moon’s orbit is tilted about 5 degrees to Earth’s, so most new and full moons pass above or below the line from the Sun to Earth.' + (F.quiet ? '' : ' ' + kindTxt + '.'));
        F.say('The Moon’s orbit is tilted 5.1°, and its line of nodes keeps pointing the same way while Earth circles the Sun. Only when the nodes line up with the Sun (the eclipse seasons, about every 6 months) can a new moon make a solar eclipse or a full moon a lunar one. Now the Moon is <b>' + fm(M.abs(beta), 2) + '° ' + (beta >= 0 ? 'above' : 'below') + '</b> Earth’s orbital plane.', 'Most new and full moons pass above or below the Sun–Earth line, so there is no eclipse.');
      };
    }

    // ---------------- tides ----------------
    function tides(F) {
      F.size({ aspect: 1.3, max: 520, narrow: 0.78 });
      var P = { t: 0, sun: !!o.sun, sa: num(o.sunAngle, 0), th0: num(o.town, 0) };
      var T = F.tiles([{ k: 'next', label: 'High tides come every', secret: false }, { k: 'kind', label: 'Tide type', secret: true }, { k: 'range', label: 'Tide range (relative)', secret: true }]);
      var ts = V.slider(F.ctl, { label: 'Time', min: 0, max: 48, step: 0.1, value: 0, fmt: function (v) { return fm(v, 1) + ' h'; }, input: function (v) { P.t = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { P.t = P.t + dt * 4; if (P.t > 48) P.t = 0; ts.set(P.t); F.redraw(); }, { label: 'Turn Earth' });
      var sc = check(row, 'Add the Sun’s tide', P.sun, function (v) { P.sun = v; F.redraw(); });
      var ss = V.slider(F.ctl, { label: 'Angle between Sun and Moon', min: 0, max: 180, step: 5, value: P.sa, fmt: function (v) { return fm(v, 0) + '°'; }, input: function (v) { P.sa = v; F.redraw(); } });
      V.button(row, 'Lined up', function () { P.sa = 0; ss.set(0); P.sun = true; sc.checked = true; F.redraw(); });
      V.button(row, 'At right angles', function () { P.sa = 90; ss.set(90); P.sun = true; sc.checked = true; F.redraw(); });
      F.keys(function (e) { var a = arrowKey(e); if (!a || !a[0]) return false; P.t = clamp(P.t + a[0] * 0.5, 0, 48); ts.set(P.t); F.redraw(); return true; }, 'Left and right arrow keys step the time.');
      F.draw = function () {
        var k = spaceBg(F), ctx = F.ctx, w = F.c.w, h = F.c.h, gh = M.max(130, h * 0.34), vh = h - gh, cx = w * 0.42, cy = vh / 2 + 4, er = M.min(w * 0.17, vh * 0.3), amp = er * 0.22;
        var sa = P.sa + 0.508 * P.t, useS = P.sun; // the Sun's direction drifts 12.2° a day relative to the Moon
        // the Moon (right) and the Sun's direction
        var mx = M.min(w - 70, cx + er * 2.6), mr = M.max(8, er * 0.27);
        litBall(ctx, mx, cy, mr, -sa * RAD, '#f1eadb', '#39424e'); if (!F.quiet || true) txt(ctx, 'Moon', mx, cy + mr + 12, { size: 11, color: '#dbe7ef', align: 'center' });
        if (useS) { // the Sun is far away: put it at the picture's edge in its direction
          var ca = M.cos(sa * RAD), sn = -M.sin(sa * RAD), tmax = 1e9; if (ca > 1e-6) tmax = M.min(tmax, (w - 22 - cx) / ca); if (ca < -1e-6) tmax = M.min(tmax, (22 - cx) / ca); if (sn > 1e-6) tmax = M.min(tmax, (vh - 30 - cy) / sn); if (sn < -1e-6) tmax = M.min(tmax, (22 - cy) / sn);
          var bx = cx + ca * tmax, by = cy + sn * tmax; sunGlow(ctx, bx, by, 9); txt(ctx, 'Sun (far away)', clamp(bx, 50, w - 50), by + (by > cy ? -20 : 22), { size: 10.5, color: '#ffd479', align: 'center' });
        }
        // ocean with bulges (exaggerated), then land disk
        ctx.save(); ctx.beginPath();
        for (var th = 0; th <= 360; th += 3) { var rr = er + amp * (0.6 + 0.4 * (M.cos(2 * th * RAD) + (useS ? EM.SUN_TIDE * M.cos(2 * (th - sa) * RAD) : 0))); var x = cx + rr * M.cos(th * RAD), y = cy - rr * M.sin(th * RAD); if (th) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
        ctx.closePath(); ctx.fillStyle = 'rgba(74,143,196,0.85)'; ctx.fill(); ctx.restore();
        circle(ctx, cx, cy, er * 0.86, '#7aa65a'); circle(ctx, cx, cy, 3, '#fff');
        // the town rides around with Earth's spin (counterclockwise seen from above the North Pole)
        var tth = P.th0 + 360 / EM.LUNAR_DAY * P.t, tx = cx + er * 0.86 * M.cos(tth * RAD), ty = cy - er * 0.86 * M.sin(tth * RAD);
        circle(ctx, tx, ty, 5.5, '#ff6b6b', '#fff', 2); txt(ctx, 'town', tx + 9 * M.cos(tth * RAD), ty - 9 * M.sin(tth * RAD), { size: 10.5, color: '#fff', align: M.cos(tth * RAD) >= 0 ? 'left' : 'right', halo: 'rgba(6,17,26,0.8)' });
        txt(ctx, 'Bulges drawn far taller than real (about 1 m)', 10, 14, { size: 10.5, color: '#8fb3c6' });
        // graph: tide height at the town over 48 hours
        var gr = chart(ctx, k, { x: 44, y: vh + 18, w: w - 58, h: gh - 44 }, { x: { min: 0, max: 48, step: 6, fmt: function (v) { return v + ' h'; } }, y: { min: -1.6, max: 1.6, step: 1, labels: false } }, { bg: '#0f2232' });
        ctx.save(); ctx.strokeStyle = '#74c0fc'; ctx.lineWidth = 2; ctx.beginPath();
        var highs = [], prev = null, pp = null;
        for (var t = 0; t <= 48.0001; t += 0.02) { var v = EM.tide(t, P.th0, P.sa, useS); var px = gr.X(t), py = gr.Y(v); if (t) ctx.lineTo(px, py); else ctx.moveTo(px, py); if (pp !== null && prev !== null && prev > pp && prev >= v) { var dd = (pp - v) / (2 * (pp - 2 * prev + v)); highs.push([t - 0.02 + dd * 0.02, prev]); } pp = prev; prev = v; }
        ctx.stroke(); ctx.restore();
        txt(ctx, 'high', gr.r.x - 6, gr.Y(1.1), { size: 10, color: '#8fb3c6', align: 'right' }); txt(ctx, 'low', gr.r.x - 6, gr.Y(-1.1), { size: 10, color: '#8fb3c6', align: 'right' });
        if (!F.quiet) highs.forEach(function (hh) { circle(ctx, gr.X(hh[0]), gr.Y(hh[1]), 3, '#ffd479'); txt(ctx, fm(hh[0], 1) + ' h', gr.X(hh[0]), gr.Y(hh[1]) - 9, { size: 10, color: '#ffd479', align: 'center' }); });
        var cur = EM.tide(P.t, P.th0, P.sa, useS); knob(ctx, gr.X(P.t), gr.Y(cur), '#ff6b6b', 5, k);
        txt(ctx, 'Tide height at the town', gr.r.x + 6, gr.r.y + 10, { size: 11, color: '#dbe7ef', bold: true });
        var rng2 = 0; for (t = 0; t < 26; t += 0.05) rng2 = M.max(rng2, EM.tide(t, 0, P.sa, useS)); var kind = !useS ? 'Moon only' : M.abs(M.sin(P.sa * RAD)) < 0.26 ? 'spring tide' : M.abs(M.cos(P.sa * RAD)) < 0.26 ? 'neap tide' : 'between spring and neap';
        T.next('12 h 25 min'); T.kind(kind); T.range(fm(2 * rng2, 2) + (useS ? ' (Moon alone: 2)' : ''));
        F.alt('Earth seen from above the North Pole with two ocean bulges, one facing the Moon and one on the far side' + (useS ? ', and the Sun ' + (F.quiet ? 'at a marked angle' : fm(P.sa, 0) + ' degrees from the Moon’s direction') : '') + '. A town turns with Earth through both bulges each day. A graph shows two high tides and two low tides a day.');
        F.say('The town passes through <b>two</b> bulges as Earth turns, so it gets two high tides about <b>12 h 25 min</b> apart (the Moon moves ahead a little each day).' + (useS ? (kind === 'spring tide' ? ' With the Sun and Moon lined up, their bulges add: a <b>spring tide</b>, the biggest range.' : kind === 'neap tide' ? ' With the Sun at right angles, its bulges partly fill the Moon’s lows: a <b>neap tide</b>, the smallest range.' : '') : ''), 'Two bulges mean two high tides a day.');
      };
    }
  });

  /* es-scale: Scale of Space.
     opts:
       mode: 'ladder' | 'model' | 'planets'      modes: true or a list for tabs
       from, to: zoom range for the ladder, as powers of ten in meters (default 7 to 22.5); zoom: starting power (default 7.2)
       letters: true (ladder: objects named by letters, for ordering problems)
       sunSize: the model Sun's diameter in meters (default 1); inner: true (model: zoom on the inner planets)
       highlight: a planet's name; fields: list of columns from 'd', 'au', 'yr', 'day', 'g', 't'; sort: a field
       hide: a field to hide (planets: its numbers and bars), for "which planet is hottest?"
       quiet: hides the numbers a problem asks for (model distances and sizes, light times, the hidden field); lock */
  R('es-scale', function (el, o) {
    var F = frame(el, o, 'Scale of space', { aspect: 1.6, max: 460 });
    return F.modes({ ladder: ladder, model: model, planets: planets }, { ladder: 'Zoom out', model: 'Scale model', planets: 'The planets' });

    function distWords(m) { // a distance in meters, in the friendliest unit
      var km = m / 1000; if (km < 1e6) return nf(km, 0) + ' km'; if (km < EM.AU * 0.5) return nf(km / 1e6, 2) + ' million km';
      if (km < EM.LY * 0.05) return fm(km / EM.AU, km / EM.AU < 10 ? 2 : 1) + ' AU'; return nf(km / EM.LY, km / EM.LY < 10 ? 2 : 0) + ' light-years';
    }
    function lightWords(m) { var q = EM.lightTime(m / 1000); return fm(q.v, q.v < 10 ? 2 : q.v < 100 ? 1 : 0).replace(/^(\d+)(\d{3})/, '$1,$2') + ' ' + q.u; }

    // ---------------- ladder ----------------
    function ladder(F) {
      F.size({ aspect: 1.5, max: 460, narrow: 0.95 });
      var lo = num(o.from, 7), hi = num(o.to, 22.6), z = clamp(num(o.zoom, 7.2), lo, hi), LT = !!o.letters;
      var T = F.tiles([{ k: 'w', label: 'Width of this view', secret: true }, { k: 'lt', label: 'Light crosses it in', secret: true }]);
      var zs = V.slider(F.ctl, { label: 'Zoom out', min: lo, max: hi, step: 0.02, value: z, fmt: function (v) { return '10' + sup(M.floor(v)) + ' m'; }, input: function (v) { z = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { z += dt * 0.9; if (z >= hi) { z = hi; zs.set(z); F.redraw(); return false; } zs.set(z); F.redraw(); }, { label: 'Fly out', reset: function () { if (z >= hi - 0.01) z = lo; } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; z = clamp(z + (a[0] || -a[1]) * 0.1, lo, hi); zs.set(z); F.redraw(); return true; }, 'Arrow keys zoom in and out.');
      // objects: [name, x (m from the Sun or Earth), radius (m) or ring radius, kind]
      var LY = EM.LY * 1000, AUm = EM.AU * 1000;
      F.draw = function () {
        var k = spaceBg(F), ctx = F.ctx, w = F.c.w, h = F.c.h, W0 = M.pow(10, z), s = w / W0, cx = w / 2, cy = h / 2;
        // the center: Earth when zoomed in, the Sun for the solar system and stars, the galaxy's center beyond
        var frame0 = z < 11.3 ? 'earth' : z < 19.6 ? 'sun' : 'galaxy', oxE = 0, oxS = 0;
        if (frame0 === 'earth') oxS = -AUm; else if (frame0 === 'sun') oxE = AUm; // Earth's position relative to the center
        var gal = 26000 * LY; // the Sun is about 26,000 light-years from the center of the Milky Way
        function X(m) { return cx + m * s; }
        var items = [], li = 0;
        function lab(name, x, y, val) { items.push([name, x, y, val]); }
        if (frame0 !== 'galaxy') {
          // the Sun and planets' orbits
          var sx = X(oxS);
          if (frame0 === 'sun') EM.PLANETS.slice(0, 8).forEach(function (p) { var r = p.au * AUm * s; if (r > 3 && r < w * 4) { ctx.save(); ctx.strokeStyle = 'rgba(143,179,198,0.4)'; ctx.beginPath(); ctx.arc(sx, cy, r, 0, TAU); ctx.stroke(); ctx.restore(); if (r < w * 0.48 && r > 40 && (p.n === 'Earth' || p.n === 'Jupiter' || p.n === 'Neptune' || p.n === 'Mars' && r > 60)) lab(p.n + '’s orbit', sx + r * 0.7071, cy - r * 0.7071, (p.n === 'Earth' ? '1 AU, light takes 8.3 minutes' : p.n === 'Neptune' ? '30 AU, light takes 4.2 hours' : fm(p.au, 1) + ' AU')); } });
          var sr = M.max(2, EM.SUN_D * 500 * s); if (sx > -sr && sx < w + sr) { if (sr > 6) { circle(ctx, sx, cy, sr, '#ffd36b'); circle(ctx, sx, cy, sr * 1.04, null, 'rgba(255,200,90,0.5)', 2); } else sunGlow(ctx, sx, cy, 3); if (sr > 9) lab('Sun', sx, cy - sr - 10, '1.39 million km across'); }
          // Earth and the Moon's orbit
          var ex = X(oxE), er = M.max(1.5, 6371e3 * s);
          if (ex > -er && ex < w + er) {
            var mo = EM.MOON_DIST * 1000 * s;
            if (mo > 4 && mo < w * 3) { ctx.save(); ctx.strokeStyle = 'rgba(219,231,239,0.4)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(ex, cy, mo, 0, TAU); ctx.stroke(); ctx.restore(); circle(ctx, ex + mo, cy, M.max(1.5, 1737e3 * s), '#d9d2c3'); if (mo > 30 && mo < w * 0.6) lab('Moon’s orbit', ex + mo * 0.7071, cy - mo * 0.7071, '384,400 km, light takes 1.3 seconds'); }
            if (er > 3) { var g = ctx.createRadialGradient(ex - er * 0.3, cy - er * 0.3, er * 0.1, ex, cy, er); g.addColorStop(0, '#6db3e8'); g.addColorStop(1, '#1f5585'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, cy, er, 0, TAU); ctx.fill(); }
            else circle(ctx, ex, cy, 2, '#6db3e8');
            if (frame0 === 'earth') lab('Earth', ex, cy - er - 8, '12,742 km across');
          }
        }
        // nearby stars: Proxima Centauri 4.24 ly, plus a few placed at their real distances in different directions
        var starsN = [['Proxima Centauri', 4.24, 0.6], ['Sirius', 8.6, 2.4], ['Vega', 25, 4.2], ['Betelgeuse', 550, 5.4]];
        if (frame0 === 'sun') starsN.forEach(function (st) { var d = st[1] * LY * s; if (d < w * 0.7 && d > 6) { var x = cx + d * M.cos(st[2]), y = cy - d * M.sin(st[2]); circle(ctx, x, y, 2.6, '#fff'); lab(st[0], x, y - 10, nf(st[1], st[1] < 10 ? 2 : 0) + ' light-years'); } });
        if (z > 19) { // the Milky Way: a disk about 100,000 light-years across, the Sun 26,000 from its center
          var gx = frame0 === 'galaxy' ? cx : X(-gal), gr2 = 50000 * LY * s;
          if (gr2 > 8) { var gg = ctx.createRadialGradient(gx, cy, 0, gx, cy, gr2); gg.addColorStop(0, 'rgba(255,240,200,0.9)'); gg.addColorStop(0.15, 'rgba(230,220,255,0.45)'); gg.addColorStop(1, 'rgba(160,180,255,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(gx, cy, gr2, 0, TAU); ctx.fill();
            ctx.save(); ctx.strokeStyle = 'rgba(200,210,255,0.35)'; ctx.lineWidth = M.max(1, gr2 * 0.05); for (var arm = 0; arm < 4; arm++) { ctx.beginPath(); for (var tt = 0.1; tt < 3.4; tt += 0.05) { var rr2 = gr2 * 0.12 * M.exp(0.6 * tt), aa = tt + arm * PI / 2; if (rr2 > gr2) break; var px = gx + rr2 * M.cos(aa), py = cy + rr2 * M.sin(aa) * 0.9; if (tt > 0.1) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke(); } ctx.restore();
            if (frame0 === 'galaxy' && gr2 > 30) { var sunX = gx + 26000 * LY * s * M.cos(1.1), sunY = cy + 26000 * LY * s * M.sin(1.1) * 0.9; circle(ctx, sunX, sunY, 3, '#ffd479'); txt(ctx, 'the Sun is here', sunX + 6, sunY + 2, { size: 10.5, color: '#ffd479' }); lab('Milky Way', gx, cy - gr2 - 6 > 14 ? cy - gr2 - 6 : 18, 'about 100,000 light-years across'); }
          }
          if (z > 21.5) { var ax2 = gx + 2.5e6 * LY * s * 0.8, ay2 = cy - 2.5e6 * LY * s * 0.6, ar = 110000 * LY * s; if (ax2 < w + ar) { ctx.save(); ctx.translate(ax2, ay2); ctx.rotate(-0.6); var ga = ctx.createRadialGradient(0, 0, 0, 0, 0, M.max(4, ar)); ga.addColorStop(0, 'rgba(255,240,210,0.9)'); ga.addColorStop(1, 'rgba(200,190,255,0)'); ctx.fillStyle = ga; ctx.beginPath(); ctx.ellipse(0, 0, M.max(4, ar), M.max(2, ar * 0.35), 0, 0, TAU); ctx.fill(); ctx.restore(); lab('Andromeda Galaxy', ax2, ay2 - M.max(10, ar * 0.4), 'about 2.5 million light-years away'); } }
        }
        var placed = [];
        items.forEach(function (it) {
          li++; var nm = LT ? LETTERS[li - 1] : it[0], xx = clamp(it[1], 60, w - 60), y0 = clamp(it[2], 16, h - 44), bw = LT ? 24 : M.max(tw(ctx, nm, { size: 12, bold: true }), F.quiet ? 0 : tw(ctx, it[3], { size: 10.5 })) + 8, bh = LT ? 24 : F.quiet ? 16 : 30, yy = null;
          [0, 30, -30, 60].some(function (dy) { var y = clamp(y0 + dy, 16, h - 44), r0 = [xx - bw / 2, y - bh / 2, bw, bh]; if (placed.every(function (q) { return r0[0] + r0[2] < q[0] || q[0] + q[2] < r0[0] || r0[1] + r0[3] < q[1] || q[1] + q[3] < r0[1]; })) { yy = y; placed.push(r0); return true; } return false; });
          if (yy === null) return;
          if (LT) badge(ctx, nm, xx, yy, { k: k }); else { txt(ctx, nm, xx, yy - 7, { size: 12, color: '#fff', bold: true, align: 'center', halo: 'rgba(6,17,26,0.85)' }); if (!F.quiet) txt(ctx, it[3], xx, yy + 8, { size: 10.5, color: '#8fb3c6', align: 'center', halo: 'rgba(6,17,26,0.85)' }); }
        });
        // scale bar: a round number of km, AU or light-years about a fifth of the width
        var target = W0 * 0.22, units = [[1000, 'km'], [AUm, 'AU'], [LY, 'light-years']], u = target < AUm * 0.02 ? units[0] : target < LY * 0.05 ? units[1] : units[2], v = target / u[0], p10 = M.pow(10, M.floor(M.log10(v))), nice = v / p10 >= 5 ? 5 * p10 : v / p10 >= 2 ? 2 * p10 : p10, bl = nice * u[0] * s;
        line(ctx, [[14, h - 16], [14 + bl, h - 16]], { color: '#dbe7ef', w: 2 }); line(ctx, [[14, h - 21], [14, h - 11]], { color: '#dbe7ef', w: 2 }); line(ctx, [[14 + bl, h - 21], [14 + bl, h - 11]], { color: '#dbe7ef', w: 2 });
        txt(ctx, nf(nice, nice < 1 ? 2 : 0) + ' ' + u[1], 18 + bl, h - 16, { size: 11.5, color: '#dbe7ef' });
        T.w(distWords(W0)); T.lt(lightWords(W0));
        F.alt('A view of space ' + distWords(W0) + ' wide, drawn to scale. Zoom out from Earth to the Moon’s orbit, the Sun and planets, the nearest stars and the Milky Way.');
        F.say('This view is <b>' + distWords(W0) + '</b> wide; light would cross it in <b>' + lightWords(W0) + '</b>. A light-year is a distance: how far light goes in a year, 9.46 trillion km.', 'Everything here is drawn to scale.');
      };
    }

    // ---------------- model ----------------
    function model(F) {
      F.size({ aspect: 1.55, max: 460, narrow: 0.8 });
      var P = { sun: num(o.sunSize, 1), inner: !!o.inner }, sel = o.highlight || 'Earth';
      var T = F.tiles([{ k: 'd', label: sel + '’s model size', secret: true }, { k: 'x', label: sel + '’s distance from the model Sun', secret: true }, { k: 'n', label: 'Neptune’s distance', secret: true }]);
      V.slider(F.ctl, { label: 'Model Sun’s diameter', min: 0.05, max: 3, step: 0.05, value: P.sun, fmt: function (v) { return v < 1 ? fm(v * 100, 0) + ' cm' : fm(v, 2) + ' m'; }, input: function (v) { P.sun = v; F.redraw(); } });
      select(F.ctl, 'Planet', EM.PLANETS.slice(0, 8).map(function (p) { return [p.n, p.n]; }), sel, function (v) { sel = v; T.d.label(sel + '’s model size'); T.x.label(sel + '’s distance from the model Sun'); F.redraw(); });
      check(F.ctl, 'Zoom on the inner planets', P.inner, function (v) { P.inner = v; F.redraw(); });
      function len(m) { return m >= 1000 ? fm(m / 1000, 2) + ' km' : m >= 1 ? fm(m, 1) + ' m' : m >= 0.01 ? fm(m * 100, 1) + ' cm' : fm(m * 1000, 1) + ' mm'; }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, f = P.sun / EM.SUN_D; // model meters per real km
        // sizes to scale
        var top = 30, hs = h * 0.44, S0 = hs * 0.9, sunR = S0 * 1.4; // the Sun drawn so its edge shows
        txt(ctx, 'Sizes to the same scale', 12, 16, { size: 12, color: k.ink, bold: true });
        ctx.save(); ctx.beginPath(); ctx.rect(0, 26, w, hs); ctx.clip();
        circle(ctx, -sunR + w * 0.16, top + hs / 2, sunR, '#ffcf5a', '#e8a33a', 2); ctx.restore();
        var pxPerKm = (sunR * 2) / EM.SUN_D, x0 = w * 0.16 + 14, xx = x0;
        var LB = labeler(ctx);
        EM.PLANETS.slice(0, 8).forEach(function (p, i) { var r = M.max(0.8, p.d / 2 * pxPerKm); xx += r; circle(ctx, xx, top + hs / 2, r, p.col, p.n === sel ? k.rust : null, 2); var off = M.max(r, 4) + 10; LB.put(p.n, xx, top + hs / 2 + (i % 2 ? -off : off), { size: 10.5, color: p.n === sel ? k.rust : k.muted, align: 'center', bold: p.n === sel }, i % 2 ? [0, -14] : [0, 14]); xx += r + M.max(6, r * 0.25); });
        txt(ctx, 'Sun', w * 0.16 - 26, top + 10, { size: 11, color: k.dark ? '#ffd479' : '#8a5a00', align: 'right' });
        // distances to scale
        var dy = top + hs + 30, dh = h - dy - 10, maxAU = P.inner ? 1.7 : 31, L = w - 40, s2 = L / maxAU;
        txt(ctx, 'Distances to the same scale' + (P.inner ? ' (inner planets)' : '') + ': planets drawn much bigger than scale', 12, dy - 10, { size: 12, color: k.ink, bold: true });
        var ly = dy + dh * 0.5; line(ctx, [[20, ly], [20 + L, ly]], { color: k.grid, w: 2 }); circle(ctx, 20, ly, 7, '#ffcf5a');
        var LD = labeler(ctx), order = EM.PLANETS.slice(0, 8).map(function (p, i) { return [p, i]; }).sort(function (a, b) { return (b[0].n === sel) - (a[0].n === sel); });
        order.forEach(function (pi) { var p = pi[0], i = pi[1]; if (p.au > maxAU) return; var x = 20 + p.au * s2; circle(ctx, x, ly, p.n === sel ? 6 : 4, p.col, p.n === sel ? k.rust : k.bg, 2); var lab = p.n + (!F.quiet && (p.n === sel || p.au > 4) ? ': ' + len(p.au * EM.AU * f) : ''); LD.put(lab, x, ly + 16, { size: 10.5, color: p.n === sel ? k.rust : k.muted, align: 'center', bold: p.n === sel }, [0, -32, 16, -48]); });
        if (!P.inner) txt(ctx, 'Crowded near the Sun? Check “Zoom on the inner planets”.', 20, h - 14, { size: 10.5, color: k.muted });
        var sp = EM.PLANETS.filter(function (p) { return p.n === sel; })[0];
        T.d(len(sp.d * f)); T.x(len(sp.au * EM.AU * f)); T.n(len(30.18 * EM.AU * f));
        F.alt('A scale model of the solar system with a Sun ' + len(P.sun) + ' across. Sizes are drawn to one scale and distances to another; at the scale of the sizes, the distances would not fit.');
        F.say('With a Sun <b>' + len(P.sun) + '</b> across, ' + sel + ' is <b>' + len(sp.d * f) + '</b> across and <b>' + len(sp.au * EM.AU * f) + '</b> away; Neptune is <b>' + len(30.18 * EM.AU * f) + '</b> away. Book pictures squeeze the planets close together; the real solar system is mostly empty space.', 'The planets are tiny and very far apart compared with the Sun.');
      };
    }

    // ---------------- planets ----------------
    function planets(F) {
      F.size({ aspect: 2.1, max: 300, narrow: 1.15 });
      var COLS = { d: ['Diameter', 'km', function (v) { return nf(v); }], au: ['Distance', 'AU', function (v) { return fm(v, v < 10 ? 2 : 1); }], yr: ['Year', 'Earth years', function (v) { return fm(v, v < 10 ? 2 : 1); }], day: ['Day', 'hours', function (v) { return nf(v, 1); }], g: ['Gravity', 'Earth = 1', function (v) { return fm(v, 2); }], t: ['Mean temperature', '°C', function (v) { return nf(v); }] };
      var fields = (o.fields || ['d', 'au', 'yr', 'day', 'g', 't']).filter(function (f) { return COLS[f]; }), hide = o.hide || (F.quiet && o.field) || null, sortK = o.sort || 'au', bar = o.bar || (hide && hide !== 't' ? 'd' : fields.indexOf('t') >= 0 && hide !== 't' ? 't' : fields[0]), hl = o.highlight || null, dwarfs = o.dwarfs !== false;
      var wrap = mk('div', 'esv-tbl'); wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', 'Table of the planets'); wrap.tabIndex = 0; F.el.insertBefore(wrap, F.statsEl);
      F._rows.push(wrap);
      var seg = V.seg(F.ctl, { label: 'Bars show', items: fields.filter(function (f) { return f !== hide; }).map(function (f) { return [f, COLS[f][0]]; }), value: bar, change: function (v) { bar = v; F.redraw(); } });
      function rows() { var list = EM.PLANETS.filter(function (p) { return dwarfs || p.kind !== 'dwarf'; }).slice(); list.sort(function (a, b) { var x = a[sortK], y = b[sortK]; if (x == null) return 1; if (y == null) return -1; return x - y; }); return list; }
      function table() {
        var h = '<table><thead><tr><th scope="col">Planet</th>' + fields.map(function (f) { return '<th scope="col"><button type="button" data-k="' + f + '" aria-label="Sort by ' + COLS[f][0] + '">' + COLS[f][0] + (sortK === f ? ' ▲' : '') + '<br><small>' + COLS[f][1] + '</small></button></th>'; }).join('') + '</tr></thead><tbody>';
        var group = sortK === 'au';
        if (group) h += '<tr><td class="grp" colspan="' + (fields.length + 1) + '">Rocky inner planets</td></tr>';
        rows().forEach(function (p, i, arr) {
          if (group && p.n === 'Jupiter') h += '<tr><td class="grp" colspan="' + (fields.length + 1) + '">Giant outer planets</td></tr>';
          if (group && p.n === 'Pluto') h += '<tr><td class="grp" colspan="' + (fields.length + 1) + '">Kuiper belt: dwarf planets</td></tr>';
          if (group && p.n === 'Ceres') h += '<tr><td class="grp" colspan="' + (fields.length + 1) + '">Dwarf planet in the asteroid belt</td></tr>';
          h += '<tr' + (p.n === hl ? ' class="hi"' : '') + '><th scope="row">' + p.n + '</th>' + fields.map(function (f) { return '<td>' + (f === hide ? '?' : p[f] == null ? '—' : COLS[f][2](p[f])) + '</td>'; }).join('') + '</tr>';
        });
        wrap.innerHTML = h + '</tbody></table>';
        [].forEach.call(wrap.querySelectorAll('th button'), function (b) { b.addEventListener('click', function () { sortK = b.dataset.k; table(); F.redraw(); var nb = wrap.querySelector('th button[data-k="' + sortK + '"]'); if (nb) nb.focus(); }); });
      }
      table();
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, list = rows().filter(function (p) { return p[bar] != null; }), n = list.length;
        var lg = bar === 'd' || bar === 'au' || bar === 'yr' || bar === 'day', vals = list.map(function (p) { return p[bar]; }), mn = M.min.apply(null, vals), mx = M.max.apply(null, vals);
        var r = { x: 92, y: 26, w: w - 108, h: h - 46 }, rowH = r.h / n;
        var ax = lg ? { min: M.pow(10, M.floor(M.log10(mn))), max: M.pow(10, M.ceil(M.log10(mx))), log: true } : bar === 't' ? { min: -250, max: 500, step: 125 } : { min: 0, max: M.ceil(mx * 2) / 2 };
        var c = chart(ctx, k, r, { x: ax, y: { min: 0, max: 1, labels: false, grid: false } }, { bg: k.plot });
        list.forEach(function (p, i) {
          var y = r.y + i * rowH + rowH * 0.18, bh = rowH * 0.64, x0 = bar === 't' ? c.X(0) : r.x, x1 = c.X(p[bar]);
          txt(ctx, p.n, r.x - 6, y + bh / 2, { size: 11, color: p.n === hl ? k.rust : k.ink, align: 'right', bold: p.n === hl });
          ctx.fillStyle = p.n === hl ? k.rust : p.kind === 'rocky' ? k.orange : p.kind === 'giant' ? k.blue : k.muted; ctx.fillRect(M.min(x0, x1), y, M.max(1.5, M.abs(x1 - x0)), bh);
          if (!F.quiet || bar !== o.field) txt(ctx, COLS[bar][2](p[bar]), M.max(x0, x1) + 4, y + bh / 2, { size: 10, color: k.muted });
        });
        txt(ctx, COLS[bar][0] + ' (' + COLS[bar][1] + (lg ? ', log scale' : '') + ')', r.x, 12, { size: 11.5, color: k.ink, bold: true });
        F.alt('Bar chart of the planets’ ' + COLS[bar][0].toLowerCase() + ', with a table of diameter, distance, year, day, gravity and temperature below.');
        F.say('Data rounded from NASA’s planetary fact sheets. Sort the table by any column.' + (hide === 't' ? '' : ' Venus, not Mercury, is the hottest planet: its thick carbon dioxide air traps heat.'), 'Sort the table by any column.');
      };
    }
  });

  /* es-interior: Inside Earth.
     opts:
       mode: 'layers' | 'geotherm' | 'rays'      modes: true or a list for tabs
       scheme: 'composition' (crust, mantle, outer core, inner core) | 'mechanical' (lithosphere, asthenosphere, lower mantle …)
       probe: depth in km (layers: the probe's starting depth); stretchCrust: true (draw the crust 10× thicker, labeled)
       maxDepth: km (geotherm: 200 shows melting; 6371 shows the whole Earth's temperature against a straight-line guess)
       path: 'decompression' | 'flux' | 'heating' or [[T, depth], …] (geotherm: a rock's path); solidus: 'dry' | 'wet' | 'both'
       zones: true (geotherm: the pressure–temperature panel with metamorphic settings); index: true (Barrovian index minerals)
       rays: 'P' | 'S' | 'both'; stations: [angles in degrees from the quake]; lehmann: true (show waves through the inner core)
       letters: true (letter the layers or zones for labeling)
       quiet: hides layer names, probe readouts and shadow-zone angles; lock */
  var LAYER_COL = { crust: 'crust', mantle: 'mantle', 'outer core': 'ocore', 'inner core': 'icore', lithosphere: 'crust', asthenosphere: 'mantle', 'lower mantle': 'mantleDeep' };
  R('es-interior', function (el, o) {
    var F = frame(el, o, 'Inside Earth', { aspect: 1.55, max: 480 });
    return F.modes({ layers: layers, geotherm: geotherm, rays: rays }, { layers: 'Layers', geotherm: 'Heat and melting', rays: 'Seismic waves' });

    // ---------------- layers ----------------
    function layers(F) {
      F.size({ aspect: 1.55, max: 480, narrow: 0.9 });
      var scheme = o.scheme === 'mechanical' ? 'mechanical' : 'composition', d = clamp(num(o.probe, 1500), 0, 6371), stretch = !!o.stretchCrust, geo = null, LT = F.letters;
      var T = F.tiles([{ k: 'layer', label: 'Layer', secret: true }, { k: 'depth', label: 'Depth', secret: true }, { k: 'temp', label: 'Temperature (estimate)', secret: true }, { k: 'p', label: 'Pressure', secret: true }, { k: 'rho', label: 'Density', secret: true }, { k: 'st', label: 'Solid or liquid', secret: true }]);
      if (!F.quiet) V.seg(F.ctl, { label: 'Layers by', items: [['composition', 'What it’s made of'], ['mechanical', 'How it moves']], value: scheme, change: function (v) { scheme = v; F.redraw(); } });
      var ds = V.slider(F.ctl, { label: 'Probe depth', min: 0, max: 6371, step: 1, value: d, fmt: function (v) { return nf(v) + ' km'; }, input: function (v) { d = v; F.redraw(); } });
      check(F.ctl, 'Stretch the crust 10×', stretch, function (v) { stretch = v; F.redraw(); });
      // radius on screen for a depth: the crust (top 35 km) drawn 10× thicker when stretched
      function rad(dep, R0) { if (!stretch) return R0 * (6371 - dep) / 6371; var c = 35, cs = 350, top = 6371 + (cs - c); return R0 * (dep <= c ? (top - dep * cs / c) / top : (6371 - dep) / top); }
      function depAt(rr, R0) { if (!stretch) return 6371 - rr / R0 * 6371; var c = 35, cs = 350, top = 6371 + (cs - c), x = rr / R0 * top; return x >= 6371 - c ? (top - x) * c / cs : 6371 - x; }
      F.drag({ hit: function (x, y) { if (!geo) return null; var r = M.hypot(x - geo.cx, y - geo.cy), a = M.atan2(x - geo.cx, geo.cy - y); return r <= geo.R + 10 && M.abs(a) < geo.half + 0.12 ? 'p' : null; }, move: function (h, x, y) { var r = clamp(M.hypot(x - geo.cx, y - geo.cy), 0, geo.R); d = clamp(M.round(depAt(r, geo.R)), 0, 6371); ds.set(d); F.redraw(); } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; d = clamp(d + (a[1] || a[0]) * (e.shiftKey ? 500 : d < 100 ? 5 : 50), 0, 6371); ds.set(d); F.redraw(); return true; }, 'Drag the probe into Earth (or use the arrow keys) to read depth, temperature, pressure and density.');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, half = 42 * RAD, R0 = wide ? M.min(h - 34, (w * 0.62) / (2 * M.sin(half)) ) : M.min(h - 30, (w - 16) / (2 * M.sin(half)));
        var cx = wide ? w * 0.36 : w / 2, cy = 14 + R0, L = EM.LAYERS[scheme];
        geo = { cx: cx, cy: cy, R: R0, half: half };
        ctx.save(); var sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, k.sky2); sky.addColorStop(1, k.bg); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h); ctx.restore();
        // wedge, drawn from the outside in
        L.forEach(function (ly, i) {
          var r1 = rad(ly[1], R0), col = k[LAYER_COL[ly[0]]] || k.rock;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r1, -PI / 2 - half, -PI / 2 + half); ctx.closePath();
          var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r1); g.addColorStop(0, mixHex(col, '#ffffff', 0.1)); g.addColorStop(1, col); ctx.fillStyle = g; ctx.fill();
          ctx.strokeStyle = k.dark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.2; ctx.stroke();
        });
        if (scheme === 'mechanical') { var rc = rad(35, R0); ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = k.dark ? '#ffe8c0' : '#5b3a1e'; ctx.beginPath(); ctx.arc(cx, cy, rc, -PI / 2 - half, -PI / 2 + half); ctx.stroke(); ctx.restore(); }
        // a thin blue ocean and green land on the surface
        ctx.save(); ctx.lineWidth = 3; ctx.strokeStyle = k.land; ctx.beginPath(); ctx.arc(cx, cy, R0, -PI / 2 - half, -PI / 2 - half * 0.2); ctx.stroke(); ctx.strokeStyle = k.sea; ctx.beginPath(); ctx.arc(cx, cy, R0, -PI / 2 - half * 0.2, -PI / 2 + half); ctx.stroke(); ctx.restore();
        // labels at the middle of each layer, along the right edge of the wedge
        var LB = labeler(ctx);
        L.forEach(function (ly, i) {
          var mid = (ly[1] + ly[2]) / 2, rr = (rad(ly[1], R0) + rad(ly[2], R0)) / 2, ang = -PI / 2 + half * 0.55, x = cx + rr * M.cos(ang), y = cy + rr * M.sin(ang);
          if (ly[0] === 'crust' || ly[0] === 'lithosphere') { rr = rad(ly[1], R0); x = cx + rr * M.cos(-PI / 2 + half * 0.3); y = cy + rr * M.sin(-PI / 2 + half * 0.3) + 10; }
          if (ly[0] === 'asthenosphere') { rr = (rad(100, R0) + rad(350, R0)) / 2; x = cx + rr * M.cos(-PI / 2 + half * 0.7); y = cy + rr * M.sin(-PI / 2 + half * 0.7); }
          if (LT) badge(ctx, LETTERS[i], x, y, { k: k });
          else if (!F.quiet) pill(ctx, ly[0], x, y, { k: k, size: 12, bold: true, bg: k.dark ? 'rgba(20,12,6,0.72)' : 'rgba(255,255,255,0.82)' });
        });
        if (stretch) txt(ctx, 'Crust drawn 10× thicker', cx - R0 * M.sin(half) + 4, cy - R0 * M.cos(half) + 22, { size: 10.5, color: k.ink, halo: k.halo });
        // probe
        var pr = rad(d, R0), px = cx, py = cy - pr;
        line(ctx, [[cx, cy - R0 - 8], [px, py]], { color: k.ink, w: 2 });
        knob(ctx, px, py, k.rust, 7, k); if (F.focused()) focusRing(ctx, px, py, 14);
        // depth scale on the right
        if (wide) {
          var sx = w * 0.74, top = 24, bot = h - 20, S2 = function (dep) { return top + (bot - top) * dep / 6371; };
          line(ctx, [[sx, top], [sx, bot]], { color: k.axis, w: 1.5 });
          [0, 1000, 2000, 2891, 4000, 5150, 6371].forEach(function (v) { line(ctx, [[sx - 4, S2(v)], [sx + 4, S2(v)]], { color: k.axis, w: 1.2 }); txt(ctx, nf(v) + ' km', sx + 8, S2(v), { size: 10.5, color: k.muted }); });
          L.forEach(function (ly) { var c2 = k[LAYER_COL[ly[0]]] || k.rock; ctx.fillStyle = c2; ctx.fillRect(sx - 14, S2(ly[1]), 8, M.max(1.5, S2(ly[2]) - S2(ly[1]))); });
          circle(ctx, sx, S2(d), 5, k.rust, k.bg, 2);
          txt(ctx, 'Depth', sx, top - 12, { size: 11, color: k.ink, bold: true, align: 'center' });
        }
        var lay = L.filter(function (l) { return d >= l[1] && d <= l[2]; })[0] || L[L.length - 1], Tt = EM.tempAt(d), P = EM.pressureGPa(d), rho = EM.density(d), st = EM.stateAt(d);
        T.layer(lay[0]); T.depth(nf(d) + ' km'); T.temp('about ' + nf(M.round(Tt / 50) * 50) + ' °C'); T.p(P < 1 ? fm(P * 10000, 0) + ' bar (' + fm(P, 2) + ' GPa)' : nf(P, P < 10 ? 1 : 0) + ' GPa'); T.rho(fm(rho, 2) + ' g/cm³'); T.st(st === 'liquid' ? 'liquid' : lay[0] === 'asthenosphere' ? 'solid, but soft and slowly flowing' : 'solid');
        F.alt('A wedge cut from the surface to the center of Earth showing its layers' + (F.quiet ? '' : ': ' + L.map(function (l) { return l[0]; }).join(', ')) + '. A probe sits at ' + (F.quiet ? 'a marked depth' : nf(d) + ' km') + '.');
        F.say('At <b>' + nf(d) + ' km</b> (' + lay[0] + '): about <b>' + nf(M.round(Tt / 50) * 50) + ' °C</b>, <b>' + (P < 1 ? fm(P, 2) : nf(P, P < 10 ? 1 : 0)) + ' GPa</b> (about ' + (P * 9869 >= 1e6 ? fm(P * 9869 / 1e6, 1) + ' million' : nf(M.round(P * 9869 / 100) * 100)) + ' times the air pressure at sea level), <b>' + fm(rho, 2) + ' g/cm³</b>, ' + (st === 'liquid' ? '<b>liquid</b> iron and nickel.' : '<b>solid</b>' + (d >= 35 && d < 2891 ? ' rock that creeps very slowly over millions of years (the mantle is not a sea of magma).' : '.')) + ' Densities and pressures from PREM; deep temperatures are estimates.', 'Each layer differs in what it is made of or in how it moves.');
      };
    }

    // ---------------- geotherm ----------------
    function geotherm(F) {
      F.size({ aspect: 1.45, max: 480, narrow: 0.85 });
      var view = o.zones ? 'zones' : num(o.maxDepth, 200) > 300 ? 'whole' : 'melt', sol = o.solidus || 'both', idx = o.index !== false;
      var preset = typeof o.path === 'string' ? o.path : Array.isArray(o.path) ? 'custom' : 'decompression', rock = null, prog = 0, LT = F.letters;
      var PRE = { decompression: { start: [EM.adiabat(150), 150], label: 'Rock rising under a ridge' }, flux: { start: [1150, 100], label: 'Rock above a sinking slab gets water' }, heating: { start: [900, 30], label: 'Rock heated by hot magma nearby' } };
      function reset() { prog = 0; if (preset === 'custom') rock = [num(o.path[0][0], 1000), num(o.path[0][1], 50)]; else rock = PRE[preset].start.slice(); }
      reset();
      var T = F.tiles(view === 'melt' ? [{ k: 'r', label: 'Rock', secret: true }, { k: 'st', label: 'State', secret: true }, { k: 'm', label: 'Melting begins', secret: true }] : view === 'whole' ? [{ k: 'c', label: 'Center (estimate)', secret: true }, { k: 'g', label: '25 °C/km all the way down', secret: true }] : []);
      if (!F.lock) V.seg(F.ctl, { label: 'Picture', items: [['melt', 'Melting'], ['whole', 'Whole Earth'], ['zones', 'Metamorphism']], value: view, change: function (v) { view = v; F.reset(); o.zones = v === 'zones'; o.maxDepth = v === 'whole' ? 6371 : 200; geotherm(F); F.redraw(); } });
      var water = 0, pl = null;
      if (view === 'melt') {
        var row = F.row(); V.seg(row, { label: 'Path', items: [['decompression', 'Rising rock'], ['flux', 'Adding water'], ['heating', 'Heating']], value: preset === 'custom' ? '' : preset, change: function (v) { preset = v; reset(); water = 0; if (pl) pl.stop(); F.redraw(); } });
        pl = F.player(row, function (dt) { prog = M.min(1, prog + dt * 0.25); step(); F.redraw(); if (prog >= 1) return false; }, { label: 'Run', reset: function () { if (prog >= 1) { reset(); water = 0; } } });
      }
      function step() { // move the rock along its preset path
        if (preset === 'decompression') { var z = lerp(150, 25, prog); rock = [EM.adiabat(z), z]; }
        else if (preset === 'heating') rock = [lerp(900, 1350, prog), 30];
        else if (preset === 'flux') water = prog;
      }
      var geo = null;
      F.drag(view === 'melt' ? { hit: function (x, y) { return geo && M.hypot(x - geo.X(rock[0]), y - geo.Y(rock[1])) < 22 ? 'r' : null; }, move: function (h, x, y) { rock = [clamp(geo.ix(x), 0, 1800), clamp(geo.iy(y), 0, 200)]; F.redraw(); } } : null);
      F.keys(view === 'melt' ? function (e) { var a = arrowKey(e); if (!a) return false; rock = [clamp(rock[0] + a[0] * 20, 0, 1800), clamp(rock[1] + a[1] * 5, 0, 200)]; F.redraw(); return true; } : null, view === 'melt' ? 'Drag the rock (or use the arrow keys) to see where it melts. Run plays the chosen path.' : '');
      function wetNow(P) { return lerp(EM.solidusDry(P), EM.solidusWet(P), water); }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, r = { x: 58, y: 34, w: w - 58 - (view === 'zones' ? 16 : 56), h: h - 34 - 40 };
        if (view === 'melt') {
          var c = chart(ctx, k, r, { x: { min: 0, max: 1800, step: 300, label: 'Temperature (°C)', fmt: function (v) { return nf(v); } }, y: { min: 0, max: 200, step: 25, flip: true, label: 'Depth (km)', fmt: function (v) { return v; } } });
          geo = c;
          // right axis: pressure
          [0, 1, 2, 3, 4, 5, 6].forEach(function (P) { var z = EM.depthAtP(P); if (z <= 200) txt(ctx, P + ' GPa', r.x + r.w + 5, c.Y(z), { size: 10.5, color: k.muted }); });
          c.clip();
          // partly molten region (right of the dry solidus)
          ctx.beginPath(); for (var z = 0; z <= 200; z += 2) { var x = c.X(EM.solidusDry(EM.pressureShallow(z))); if (z) ctx.lineTo(x, c.Y(z)); else ctx.moveTo(x, c.Y(z)); } ctx.lineTo(r.x + r.w, c.Y(200)); ctx.lineTo(r.x + r.w, c.Y(0)); ctx.closePath(); ctx.fillStyle = k.dark ? 'rgba(255,107,44,0.16)' : 'rgba(232,89,12,0.10)'; ctx.fill();
          function curve(f, col, wd, dash) { var pts = []; for (var z2 = 0; z2 <= 200; z2 += 1) pts.push([c.X(f(z2)), c.Y(z2)]); line(ctx, pts, { color: col, w: wd, dash: dash }); }
          curve(EM.geothermCont, k.rust, 2.6); curve(EM.geothermRidge, k.orange, 2, [6, 4]);
          if (sol !== 'wet') curve(function (z) { return EM.solidusDry(EM.pressureShallow(z)); }, k.red, 2.4);
          if (sol !== 'dry') curve(function (z) { return EM.solidusWet(EM.pressureShallow(z)); }, k.blue, 2.2, [5, 4]);
          if (water > 0 && water < 1) curve(function (z) { return wetNow(EM.pressureShallow(z)); }, k.purple, 2, [2, 3]);
          c.unclip();
          var LB = labeler(ctx);
          if (!F.quiet) {
            LB.put('melting starts (dry rock)', c.X(EM.solidusDry(EM.pressureShallow(185))) - 8, c.Y(185), { size: 11, color: k.red, align: 'right', halo: k.halo }, [0, -14]);
            if (sol !== 'dry') LB.put('melting starts (with water)', c.X(EM.solidusWet(EM.pressureShallow(110))) - 6, c.Y(110), { size: 11, color: k.blue, align: 'right', halo: k.halo }, [0, 14]);
            LB.put('under a continent', c.X(EM.geothermCont(55)) - 6, c.Y(55), { size: 11, color: k.rust, align: 'right', halo: k.halo }, [0, 14, -14]);
            LB.put('under a ridge', c.X(EM.geothermRidge(5)) + 8, c.Y(5) + 8, { size: 11, color: k.orange, halo: k.halo }, [0, 14]);
            LB.put('partly molten', r.x + r.w - 8, c.Y(15), { size: 11, color: k.dark ? '#ffb38a' : '#a3410a', align: 'right' });
          }
          // the rock
          var Pn = EM.pressureShallow(rock[1]), melts = rock[0] >= wetNow(Pn) - 0.5;
          if (preset !== 'custom' && !F.quiet) txt(ctx, PRE[preset] ? PRE[preset].label : '', r.x + 8, r.y + r.h - 12, { size: 11.5, color: k.ink, bold: true, halo: k.halo });
          knob(ctx, c.X(rock[0]), c.Y(rock[1]), melts ? k.red : k.ink, 7, k); if (F.focused()) focusRing(ctx, c.X(rock[0]), c.Y(rock[1]), 14);
          // where melting begins on this path
          var mtxt = '—';
          if (preset === 'decompression') { for (var zz = 150; zz > 0; zz -= 0.5) if (EM.adiabat(zz) >= EM.solidusDry(EM.pressureShallow(zz))) { mtxt = 'about ' + M.round(zz / 5) * 5 + ' km deep'; break; } }
          else if (preset === 'heating') mtxt = 'about ' + nf(M.round(EM.solidusDry(EM.pressureShallow(30)) / 10) * 10) + ' °C';
          else if (preset === 'flux') mtxt = 'once enough water lowers the melting point';
          T.r(nf(rock[0]) + ' °C at ' + nf(rock[1]) + ' km'); T.st(melts ? 'partly melting' : 'solid'); T.m(mtxt);
          F.alt('Temperature against depth to 200 km: Earth’s temperature under a continent and under a ridge, and the temperatures where mantle rock starts to melt, dry and with water. A rock marker ' + (F.quiet ? 'is placed on the chart.' : 'sits at ' + nf(rock[0]) + ' degrees C and ' + nf(rock[1]) + ' km: ' + (melts ? 'partly melting.' : 'solid.')));
          F.say('Rock melts when it is hotter than its melting curve. Three ways to get there: <b>rising</b> (the pressure drops, so the melting point falls, as under ridges and hot spots), <b>adding water</b> (which lowers the melting point by hundreds of degrees, as above sinking slabs), or <b>heating</b>. Right now the rock is <b>' + (melts ? 'partly melting' : 'solid') + '</b>.', 'Rock melts by rising, by adding water, or by heating.');
        } else if (view === 'whole') {
          var cw = chart(ctx, k, r, { x: { min: 0, max: 8000, step: 2000, label: 'Temperature (°C)', fmt: function (v) { return nf(v); } }, y: { min: 0, max: 6371, ticks: [0, 1000, 2000, 2891, 4000, 5150, 6371], flip: true, label: 'Depth (km)', fmt: function (v) { return nf(v); } } });
          // layer bands
          EM.LAYERS.composition.forEach(function (ly, i) { ctx.fillStyle = rgba(k[LAYER_COL[ly[0]]], 0.14); ctx.fillRect(r.x + 1, cw.Y(ly[1]), r.w - 2, cw.Y(ly[2]) - cw.Y(ly[1])); if (LT) badge(ctx, LETTERS[i], r.x + r.w - 18, (cw.Y(ly[1]) + cw.Y(ly[2])) / 2, { k: k }); else if (!F.quiet && ly[0] !== 'crust') txt(ctx, ly[0], r.x + r.w - 8, (cw.Y(ly[1]) + cw.Y(ly[2])) / 2, { size: 11, color: k.muted, align: 'right' }); });
          cw.clip();
          var pts2 = []; for (var dz = 0; dz <= 6371; dz += 20) pts2.push([cw.X(EM.tempAt(dz)), cw.Y(dz)]); line(ctx, pts2, { color: k.rust, w: 2.8 });
          line(ctx, [[cw.X(15), cw.Y(0)], [cw.X(15 + 25 * 6371), cw.Y(6371)]], { color: k.blue, w: 2, dash: [6, 4] });
          cw.unclip();
          if (!F.quiet) { txt(ctx, '25 °C per km all the way down', cw.X(15 + 25 * 300) + 8, cw.Y(300), { size: 11, color: k.blue, halo: k.halo }); txt(ctx, 'Earth’s estimated temperature', cw.X(EM.tempAt(4300)) + 8, cw.Y(4300), { size: 11, color: k.rust, halo: k.halo }); }
          T.c('about 5,000–6,000 °C'); T.g('about ' + nf(M.round((15 + 25 * 6371) / 1000) * 1000) + ' °C');
          F.alt('Temperature against depth for the whole Earth. The real temperature rises quickly in the crust and then slowly, reaching roughly 5,000 to 6,000 degrees C at the center; a straight line at 25 degrees per km would reach about 160,000 degrees.');
          F.say('Near the surface rock warms about <b>25 °C per km</b>, but that rate does not last. Kept all the way down it would give about <b>160,000 °C</b> at the center; the best estimates are about <b>5,000 to 6,000 °C</b>, near the temperature of the Sun’s surface.', 'The temperature rises fast near the surface and much more slowly deeper down.');
        } else {
          // metamorphic settings on a pressure–temperature panel (depth from about 2.8 g/cm³ rock)
          var cz = chart(ctx, k, r, { x: { min: 0, max: 900, step: 150, label: 'Temperature (°C)' }, y: { min: 0, max: 1.4, step: 0.2, flip: true, label: 'Pressure (GPa)', fmt: function (v) { return fm(v, 1); } } });
          [10, 20, 30, 40, 50].forEach(function (z) { var P = EM.pressureShallow(z); if (P <= 1.4) txt(ctx, z + ' km', r.x + r.w - 6, cz.Y(P) - 7, { size: 10, color: k.muted, align: 'right' }); });
          cz.clip();
          function zone(pts, col) { poly(ctx, pts.map(function (p) { return [cz.X(p[0]), cz.Y(p[1])]; }), col); }
          zone([[300, 0], [900, 0], [900, 0.25], [300, 0.12]], rgba(k.orange, 0.22));      // contact: hot, shallow
          zone([[250, 0.15], [700, 0.35], [900, 0.6], [900, 1.1], [600, 1.0], [250, 0.4]], rgba(k.green, 0.2)); // regional
          zone([[150, 0.6], [450, 0.9], [650, 1.4], [150, 1.4]], rgba(k.blue, 0.2));          // high pressure, low temperature
          if (idx) { // a Barrovian path: about 25 °C per km
            var bp = []; for (var Tq = 200; Tq <= 750; Tq += 10) bp.push([cz.X(Tq), cz.Y(EM.pressureShallow((Tq - 15) / 22))]); line(ctx, bp, { color: k.rust, w: 2.4 });
            EM.INDEX.forEach(function (m, i) { var x = cz.X(m[1]), y = cz.Y(EM.pressureShallow((m[1] - 15) / 22)); circle(ctx, x, y, 4, k.rust, k.bg, 1.5); if (LT) badge(ctx, LETTERS[i], x - 16, y - 12, { k: k, r: 9 }); else if (!F.quiet) txt(ctx, m[0], x - 7, y - 9, { size: 10.5, color: k.ink, align: 'right', halo: k.halo }); });
          }
          cz.unclip();
          if (!F.quiet && !LT) { txt(ctx, 'contact', cz.X(700), cz.Y(0.08), { size: 11.5, color: k.dark ? '#ffc078' : '#a3410a', bold: true, align: 'center' }); txt(ctx, 'regional', cz.X(760), cz.Y(0.78), { size: 11.5, color: k.dark ? '#8ce99a' : '#2b6b2b', bold: true, align: 'center' }); txt(ctx, 'high pressure (subduction)', cz.X(300), cz.Y(1.25), { size: 11.5, color: k.dark ? '#a5d8ff' : '#1c4f9c', bold: true, align: 'center' }); }
          else if (LT) { badge(ctx, 'X', cz.X(700), cz.Y(0.08)); badge(ctx, 'Y', cz.X(760), cz.Y(0.78)); badge(ctx, 'Z', cz.X(300), cz.Y(1.25)); }
          F.alt('Pressure against temperature with three settings of metamorphism: contact (hot and shallow), regional (hot and deep) and high pressure (cool and very deep)' + (idx ? ', and a path of rising grade with index minerals' + (F.quiet ? '' : ': ' + EM.INDEX.map(function (m) { return m[0]; }).join(', ')) : '') + '.');
          F.say('Metamorphism changes rock without melting it. <b>Contact</b>: rock baked beside hot magma, even near the surface. <b>Regional</b>: rock buried deep in growing mountains, squeezed and heated; minerals appear in order (' + EM.INDEX.map(function (m) { return m[0]; }).join(', ') + ') as the grade rises. <b>High pressure</b>: cool rock carried deep by a sinking slab.', 'Three settings: contact, regional and high pressure.');
        }
      };
    }

    // ---------------- rays ----------------
    function rays(F) {
      F.size({ aspect: 1.25, max: 560, narrow: 0.95 });
      var which = o.rays || 'both', stations = (o.stations || []).map(function (a) { return num(a, 60); }), leh = !!o.lehmann, probe = o.probe != null ? num(o.probe, 120) : (stations.length ? null : 120), geo = null;
      var cache = {};
      function fan(wave) {
        if (cache[wave]) return cache[wave]; var out = [];
        for (var i0 = 3; i0 < 88; i0 += i0 < 16 ? 0.9 : 3.2) { var r = EM.ray(i0, wave); out.push(r); }
        return (cache[wave] = out);
      }
      var T = F.tiles([{ k: 'at', label: 'Station', secret: true }, { k: 'gets', label: 'It records', secret: true }]);
      if (!F.quiet) V.seg(F.ctl, { label: 'Waves', items: [['P', 'P waves'], ['S', 'S waves'], ['both', 'Both']], value: which, change: function (v) { which = v; F.redraw(); } });
      check(F.ctl, 'Waves through the inner core', leh, function (v) { leh = v; F.redraw(); });
      if (probe != null) { var ps = V.slider(F.ctl, { label: 'Station angle from the quake', min: 0, max: 180, step: 1, value: probe, fmt: function (v) { return v + '°'; }, input: function (v) { probe = v; F.redraw(); } }); }
      F.drag(probe != null ? { hit: function (x, y) { if (!geo) return null; return M.abs(M.hypot(x - geo.cx, y - geo.cy) - geo.R) < 22 ? 'p' : null; }, move: function (h, x, y) { probe = M.round(M.abs(wrap180(M.atan2(x - geo.cx, geo.cy - y) * DEG))); if (ps) ps.set(probe); F.redraw(); } } : null);
      F.keys(probe != null ? function (e) { var a = arrowKey(e); if (!a) return false; probe = clamp(probe + (a[0] || -a[1]) * (e.shiftKey ? 10 : 1), 0, 180); if (ps) ps.set(probe); F.redraw(); return true; } : null, probe != null ? 'Drag the station around Earth’s surface (or use the arrow keys) to see which waves reach it.' : '');
      function records(a) { var P = a < 103 || a > 142, S = a < 103; return S ? 'P and S waves' : P ? 'P waves only (bent through the core)' : 'no direct P or S waves: the shadow zone' + (leh ? ' (only faint P waves through the inner core)' : ''); }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, Rr = M.min(w * 0.42, (h - 40) / 2), cx = w / 2, cy = h / 2 + 4, s = Rr / 6371;
        geo = { cx: cx, cy: cy, R: Rr };
        circle(ctx, cx, cy, Rr, k.mantle); circle(ctx, cx, cy, 3480 * s, k.ocore); circle(ctx, cx, cy, 1221 * s, k.icore);
        circle(ctx, cx, cy, Rr, null, k.dark ? '#d9c3a9' : '#7a5230', 2);
        
        function draw(r, col, wd, alpha) {
          [1, -1].forEach(function (sg) { ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.beginPath(); r.pts.forEach(function (p, i) { var x = cx + sg * p[0] * s * M.sin(p[1]), y = cy - p[0] * s * M.cos(p[1]); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke(); ctx.restore(); });
        }
        if (which !== 'S') fan('P').forEach(function (r) { var inner = r.pts.some(function (p) { return p[0] < 1221; }); if (inner && !leh) return; draw(r, k.blue, inner ? 1 : 1.4, inner ? 0.5 : 0.75); });
        if (which !== 'P') fan('S').forEach(function (r) { draw(r, k.red, 1.4, 0.7); });
        // shadow zones on the surface (both sides)
        function arcS(a1, a2, col, off) { [1, -1].forEach(function (sg) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'butt'; ctx.beginPath(); var A1 = -PI / 2 + sg * a1 * RAD, A2 = -PI / 2 + sg * a2 * RAD; ctx.arc(cx, cy, Rr + off, M.min(A1, A2), M.max(A1, A2)); ctx.stroke(); ctx.restore(); }); }
        if (which !== 'P') arcS(103, 180, rgba(k.red, 0.55), 6);
        if (which !== 'S') arcS(103, 142, rgba(k.blue, 0.65), 13);
        if (!F.quiet) {
          var L1 = -PI / 2 + 122 * RAD; if (which !== 'S') txt(ctx, 'P shadow zone', cx + (Rr + 22) * M.cos(L1), cy + (Rr + 22) * M.sin(L1), { size: 11, color: k.blue, align: 'left', bold: true, halo: k.halo });
          if (which !== 'S') txt(ctx, '103° to 142°', cx + (Rr + 22) * M.cos(L1), cy + (Rr + 22) * M.sin(L1) + 13, { size: 10.5, color: k.blue, align: 'left', halo: k.halo });
          var L2 = -PI / 2 - 150 * RAD; if (which !== 'P') { txt(ctx, 'S shadow zone', cx + (Rr + 22) * M.cos(L2), cy + (Rr + 22) * M.sin(L2), { size: 11, color: k.red, align: 'right', bold: true, halo: k.halo }); txt(ctx, 'beyond 103°', cx + (Rr + 22) * M.cos(L2), cy + (Rr + 22) * M.sin(L2) + 13, { size: 10.5, color: k.red, align: 'right', halo: k.halo }); }
        }
        if (!F.quiet) { var pb = k.dark ? 'rgba(20,12,6,0.75)' : 'rgba(255,255,255,0.85)'; pill(ctx, 'mantle (solid)', cx, cy - Rr * 0.6, { k: k, size: 11, bg: pb }); pill(ctx, 'outer core (liquid)', cx, cy - 3480 * s * 0.62, { k: k, size: 11, bg: pb }); pill(ctx, 'inner core (solid)', cx, cy, { k: k, size: 10.5, bg: pb }); }
        // the quake at the top
        var qx = cx, qy = cy - Rr; ctx.save(); ctx.fillStyle = '#ffd43b'; ctx.strokeStyle = '#7a5a00'; ctx.beginPath(); for (var i = 0; i < 10; i++) { var rr = i % 2 ? 4 : 10, an = -PI / 2 + i * PI / 5; ctx.lineTo(qx + rr * M.cos(an), qy + rr * M.sin(an)); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
        if (!F.quiet) txt(ctx, 'earthquake', qx + 14, qy - 6, { size: 11, color: k.ink, bold: true, halo: k.halo });
        stations.forEach(function (a, i) { var an = -PI / 2 + a * RAD, x = cx + Rr * M.cos(an), y = cy + Rr * M.sin(an); ctx.save(); ctx.fillStyle = k.ink; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x - 6, y + 3); ctx.lineTo(x + 6, y + 3); ctx.closePath(); ctx.translate(0, 0); ctx.fill(); ctx.restore(); badge(ctx, LETTERS[i], cx + (Rr + 26) * M.cos(an), cy + (Rr + 26) * M.sin(an), { k: k, r: 10 }); });
        if (probe != null) { var an2 = -PI / 2 + probe * RAD, x2 = cx + Rr * M.cos(an2), y2 = cy + Rr * M.sin(an2); knob(ctx, x2, y2, k.rust, 7, k); if (F.focused()) focusRing(ctx, x2, y2, 14); T.at(probe + '° from the quake'); T.gets(records(probe)); }
        else { T.at.box.hidden = true; T.gets.box.hidden = true; }
        F.alt('A slice through Earth with an earthquake at the top. ' + (which !== 'S' ? 'P waves (blue) bend through the mantle and the liquid outer core. ' : '') + (which !== 'P' ? 'S waves (red) cannot cross the liquid outer core. ' : '') + (F.quiet ? '' : 'S waves are missing beyond about 103 degrees from the quake, and direct P waves are missing from about 103 to 142 degrees.') + (stations.length ? ' Stations ' + stations.map(function (a, i) { return LETTERS[i]; }).join(', ') + ' are marked on the surface.' : ''));
        F.say('S waves cannot travel through liquid, so the liquid outer core stops them: no S waves arrive more than about <b>103°</b> from the quake. P waves slow down and bend as they enter the core, leaving a <b>P shadow zone from about 103° to 142°</b>. That is how the core was found, without drilling (the deepest hole reached only about 12 km).' + (probe != null ? ' A station <b>' + probe + '°</b> away records <b>' + records(probe) + '</b>.' : ''), 'S waves stop at the liquid outer core; P waves bend, leaving shadow zones.');
      };
    }
  });

  var MAT_COL = { cork: '#c8a06a', pine: '#d9b77a', oak: '#a8743e', wax: '#f3e6b3', ice: '#d6eef8', plastic: '#7cc4e8', pumice: '#cfc8bc', rubber: '#555b66', granite: '#b9b2ad', aluminum: '#c9ced4', basalt: '#4d4a48', iron: '#6f6a66', lead: '#7d8590', gold: '#e8c04a', steel: '#8b929a', brick: '#b5523b', nylon: '#e9e2cf' };
  var MAT_NAME = { cork: 'cork', pine: 'pine wood', oak: 'oak wood', wax: 'candle wax', ice: 'ice', plastic: 'plastic (polyethylene)', pumice: 'pumice', rubber: 'rubber', granite: 'granite', aluminum: 'aluminum', basalt: 'basalt', iron: 'iron', lead: 'lead', gold: 'gold', steel: 'steel', brick: 'brick', nylon: 'nylon' };
  var FLUID_COL = { fresh: '#7fc3ef', salt: '#5aa9de', oil: '#e8c95a', syrup: '#c7782a', mantle: '#d7773f' };
  var FLUID_NAME = { fresh: 'fresh water', salt: 'salt water', oil: 'vegetable oil', syrup: 'corn syrup', mantle: 'mantle rock (flows over millions of years)' };

  /* es-density: Density, Floating and Convection.
     opts:
       mode: 'float' | 'column' | 'isostasy' | 'convection'      modes: true or a list for tabs
       fluid: 'fresh' | 'salt' | 'oil' | 'syrup' | 'mantle'; blocks: [{mat, size (cm, edge of a cube)}]; rhoBlock, rhoFluid (custom g/cm³)
       height: mountain height (km); rhoCrust, rhoMantle (g/cm³, default 2.7 and 3.3); ice: thickness of an ice sheet (km)
       scenario: 'pot' | 'mantle' | 'seabreeze' | 'ocean'; time: 'day' | 'night' (sea breeze)
       quiet: hides densities, the floating fraction, root depth and arrow labels; lock */
  R('es-density', function (el, o) {
    var F = frame(el, o, 'Density, floating and convection', { aspect: 1.6, max: 460 });
    return F.modes({ float: floatM, column: column, isostasy: isostasy, convection: convection }, { float: 'Float or sink', column: 'Density column', isostasy: 'Floating crust', convection: 'Convection' });

    // ---------------- float ----------------
    function floatM(F) {
      F.size({ aspect: 1.6, max: 440, narrow: 1.0 });
      var fluid = EM.FLUIDS[o.fluid] ? o.fluid : 'fresh', rf = o.rhoFluid != null ? num(o.rhoFluid, 1) : EM.FLUIDS[fluid];
      var blocks = (o.blocks || (o.rhoBlock != null ? [{ mat: 'custom', size: 6, rho: num(o.rhoBlock, 0.5) }] : [{ mat: 'pine', size: 14 }, { mat: 'granite', size: 2.5 }, { mat: 'ice', size: 7 }])).map(function (b) { return { mat: b.mat, size: clamp(num(b.size, 5), 0.5, 20), rho: b.rho != null ? num(b.rho, 1) : EM.MATS[b.mat] || 1, y: null }; });
      var sel = 0, anim = null;
      var T = F.tiles([{ k: 'm', label: 'Mass', secret: true }, { k: 'v', label: 'Volume', secret: true }, { k: 'rho', label: 'Density', secret: true }, { k: 'f', label: 'Floats or sinks?', secret: true }]);
      if (o.rhoFluid == null) V.seg(F.ctl, { label: 'Liquid', items: [['fresh', 'Fresh water'], ['salt', 'Salt water'], ['oil', 'Oil'], ['syrup', 'Syrup']], value: fluid, change: function (v) { fluid = v; rf = EM.FLUIDS[v]; settle(); } });
      var bs = V.seg(F.ctl, { label: 'Block', items: blocks.map(function (b, i) { return [String(i), (F.quiet ? 'Block ' + LETTERS[i] : (MAT_NAME[b.mat] || 'block ' + LETTERS[i])) + ', ' + fm(b.size, 1) + ' cm']; }), value: '0', change: function (v) { sel = +v; F.redraw(); } });
      if (o.blocks == null && o.rhoBlock == null) {
        var row = F.row();
        select(row, 'Material', Object.keys(EM.MATS).map(function (m) { return [m, MAT_NAME[m]]; }), blocks[0].mat, function (v) { blocks[sel].mat = v; blocks[sel].rho = EM.MATS[v]; relabel(); settle(); });
        var ss = V.slider(row, { label: 'Edge of the cube', min: 1, max: 20, step: 0.5, value: blocks[0].size, fmt: function (v) { return fm(v, 1) + ' cm'; }, input: function (v) { blocks[sel].size = v; relabel(); settle(); } });
      }
      function relabel() { [].forEach.call(bs.el.querySelectorAll('button'), function (b, i) { b.textContent = (F.quiet ? 'Block ' + LETTERS[i] : MAT_NAME[blocks[i].mat]) + ', ' + fm(blocks[i].size, 1) + ' cm'; }); }
      function target(b, tank) { // the depth of the block's bottom below the surface (px), or resting on the floor
        var s = b.size * tank.ppc; return b.rho < rf ? { bottom: tank.surf + s * b.rho / rf, floats: true } : { bottom: tank.floor, floats: false };
      }
      function settle() { if (anim) anim.stop(); if (V.reduced) { blocks.forEach(function (b) { b.y = null; }); F.redraw(); return; } blocks.forEach(function (b) { b.y0 = b.y; b.t = 0; }); var t = 0; anim = F.anim(function (dt) { t += dt; blocks.forEach(function (b) { b.t = M.min(1, t / 0.9); }); F.redraw(); if (t > 0.9) { anim.stop(); anim = null; blocks.forEach(function (b) { b.y = null; b.y0 = null; }); } }); }
      F.keys(function (e) { var a = arrowKey(e); if (!a || !a[0]) return false; sel = (sel + a[0] + blocks.length) % blocks.length; bs.set(String(sel)); F.redraw(); return true; }, 'Pick a block with the buttons (or the left and right arrow keys).');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, tw2 = wide ? w * 0.64 : w, th = wide ? h : h * 0.62;
        var tank = { x: 16, y: 26, w: tw2 - 32, h: th - 40 }; tank.surf = tank.y + tank.h * 0.36; tank.floor = tank.y + tank.h; tank.ppc = M.min(tank.h * 0.6 / 20, tank.w / (blocks.length * 22));
        // tank
        ctx.fillStyle = rgba(FLUID_COL[fluid] || '#7fc3ef', k.dark ? 0.45 : 0.55); ctx.fillRect(tank.x, tank.surf, tank.w, tank.floor - tank.surf);
        line(ctx, [[tank.x, tank.y], [tank.x, tank.floor], [tank.x + tank.w, tank.floor], [tank.x + tank.w, tank.y]], { color: k.axis, w: 2.5 });
        txt(ctx, (F.quiet ? '' : (FLUID_NAME[fluid] || 'liquid') + ', ') + (F.quiet ? 'liquid' : fm(rf, 3) + ' g/cm³'), tank.x + 8, tank.floor - 12, { size: 11.5, color: k.ink, bold: true, halo: k.halo });
        blocks.forEach(function (b, i) {
          var s = b.size * tank.ppc, cxb = tank.x + tank.w * (i + 0.5) / blocks.length, tg = target(b, tank), bot = tg.bottom;
          if (b.y0 != null && b.t != null) { var from = b.y0 == null ? tank.y + s : b.y0; bot = lerp(from, tg.bottom, 1 - M.pow(1 - b.t, 3)); }
          b.y = bot;
          ctx.save(); ctx.fillStyle = MAT_COL[b.mat] || '#b0a090'; ctx.strokeStyle = i === sel ? k.rust : k.dark ? '#000' : 'rgba(0,0,0,0.45)'; ctx.lineWidth = i === sel ? 3 : 1.2; ctx.fillRect(cxb - s / 2, bot - s, s, s); ctx.strokeRect(cxb - s / 2, bot - s, s, s);
          // top face for a 3-D look
          ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(cxb - s / 2, bot - s); ctx.lineTo(cxb - s / 2 + s * 0.25, bot - s * 1.18); ctx.lineTo(cxb + s / 2 + s * 0.25, bot - s * 1.18); ctx.lineTo(cxb + s / 2, bot - s); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
          var nm = F.quiet ? LETTERS[i] : MAT_NAME[b.mat] || 'block ' + LETTERS[i];
          var ly2 = tg.floats ? M.min(bot - s * 1.18 - 10, tank.surf - 12) : bot - s * 1.18 - 10; if (F.quiet) badge(ctx, LETTERS[i], cxb, ly2 - 6, { k: k }); else txt(ctx, nm, cxb, ly2, { size: 11, color: k.ink, align: 'center', halo: k.halo, bold: i === sel });
          if (!F.quiet && tg.floats && b.y0 == null) var ut = fm(b.rho / rf * 100, 0) + '% under', utw = tw(ctx, ut, { size: 10.5 }), ux = cxb + s / 2 + 6 + utw > tw2 - 4 ? cxb - s / 2 - 6 : cxb + s / 2 + 6; txt(ctx, ut, ux, tank.surf + 10, { size: 10.5, color: k.ink, halo: k.halo, align: ux < cxb ? 'right' : 'left' });
        });
        // the surface line on top of the blocks
        line(ctx, [[tank.x, tank.surf], [tank.x + tank.w, tank.surf]], { color: rgba(k.blue, 0.8), w: 1.5 });
        // balance and measuring cylinder for the selected block
        var b = blocks[sel], vol = M.pow(b.size, 3), mass = vol * b.rho;
        var px = wide ? tw2 + 8 : 8, py = wide ? 20 : th + 6, pw = wide ? w - tw2 - 16 : w - 16, ph = wide ? h - 30 : h - th - 12;
        ctx.save(); ctx.fillStyle = k.panel; ctx.strokeStyle = k.grid; rrect(ctx, px, py, pw, ph, 12); ctx.fill(); ctx.stroke(); ctx.restore();
        var vert = wide, bx = vert ? px + pw / 2 : px + pw * 0.27, by = vert ? py + ph * 0.36 : py + ph * 0.62;
        // balance
        ctx.fillStyle = k.muted; ctx.fillRect(bx - 34, by, 68, 10); ctx.fillRect(bx - 4, by - 18, 8, 18); ctx.fillStyle = k.axis; ctx.fillRect(bx - 30, by - 22, 60, 4);
        var bs2 = M.min(40, b.size * 3 + 6); ctx.fillStyle = MAT_COL[b.mat] || '#b0a090'; ctx.fillRect(bx - bs2 / 2, by - 22 - bs2, bs2, bs2);
        ctx.fillStyle = '#1d2320'; rrect(ctx, bx - 32, by + 13, 64, 18, 4); ctx.fill(); txt(ctx, F.quiet ? '— g' : nf(mass, mass < 100 ? 1 : 0) + ' g', bx, by + 22, { size: 11, color: '#7CFC9a', align: 'center', mono: true });
        txt(ctx, 'Balance: mass', bx, by + 44, { size: 11, color: k.muted, align: 'center' });
        // measuring cylinder: pushed fully under, the block raises the water by its own volume
        var cx2 = vert ? px + pw / 2 : px + pw * 0.72, cw = M.min(44, pw * 0.22), ch = vert ? ph * 0.3 : ph * 0.6, cy2 = vert ? py + ph - 34 : py + ph * 0.82, l0 = 0.4, l1 = l0 + M.min(0.5, vol / 8000 * 0.5);
        ctx.fillStyle = rgba(k.blue, 0.35); ctx.fillRect(cx2 - cw / 2, cy2 - ch * l1, cw, ch * l1);
        line(ctx, [[cx2 - cw / 2 - 6, cy2 - ch * l0], [cx2 + cw / 2 + 6, cy2 - ch * l0]], { color: k.ink, w: 1, dash: [3, 3] });
        line(ctx, [[cx2 - cw / 2, cy2 - ch], [cx2 - cw / 2, cy2], [cx2 + cw / 2, cy2], [cx2 + cw / 2, cy2 - ch]], { color: k.axis, w: 2 });
        if (!F.quiet) txt(ctx, '+' + nf(vol, vol < 100 ? 1 : 0) + ' cm³', cx2 + cw / 2 + 6, cy2 - ch * (l0 + l1) / 2, { size: 10.5, color: k.ink });
        txt(ctx, 'Water rises by its volume', cx2, cy2 + 14, { size: 11, color: k.muted, align: 'center' });
        T.m(nf(mass, mass < 100 ? 1 : 0) + ' g'); T.v(nf(vol, vol < 100 ? 2 : 0) + ' cm³'); T.rho(fm(b.rho, 3) + ' g/cm³'); T.f(b.rho < rf ? 'floats, ' + fm(b.rho / rf * 100, 0) + '% under' : b.rho > rf ? 'sinks' : 'stays wherever it is put');
        F.alt('A tank of ' + (F.quiet ? 'liquid' : FLUID_NAME[fluid]) + ' with ' + blocks.length + ' blocks. ' + blocks.map(function (bb, i) { return (F.quiet ? 'Block ' + LETTERS[i] : MAT_NAME[bb.mat]) + (bb.rho < rf ? ' floats' : ' sinks'); }).join('; ') + '.');
        F.say('Density = mass ÷ volume: <b>' + nf(mass, 1) + ' g ÷ ' + nf(vol, 1) + ' cm³ = ' + fm(b.rho, 3) + ' g/cm³</b>. A block floats when it is less dense than the liquid, whatever its size, and sits with <b>' + fm(b.rho / rf * 100, 0) + '%</b> of itself under the surface (its density ÷ the liquid’s). A huge log floats while a small pebble sinks.', 'A block floats when it is less dense than the liquid, whatever its size.');
      };
      settle();
    }

    // ---------------- column ----------------
    function column(F) {
      F.size({ aspect: 1.35, max: 460, narrow: 1.0 });
      var LIQ = [['vegetable oil', 0.92, '#e8c95a'], ['water', 1.00, '#7fc3ef'], ['corn syrup', 1.37, '#c7782a']], OBJ = [['cork', 0.24], ['plastic', 0.95], ['nylon', 1.15], ['steel', 7.85]];
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, cx = w * 0.4, cw = M.min(w * 0.36, 200), top = 40, bot = h - 22, lh = (bot - top) / LIQ.length;
        LIQ.forEach(function (l, i) { ctx.fillStyle = rgba(l[2], k.dark ? 0.6 : 0.7); ctx.fillRect(cx - cw / 2, top + i * lh, cw, lh); if (!F.quiet) txt(ctx, l[0] + (F.quiet ? '' : ', ' + fm(l[1], 2) + ' g/cm³'), cx + cw / 2 + 12, top + i * lh + lh / 2, { size: 12, color: k.ink }); else badge(ctx, LETTERS[i], cx + cw / 2 + 20, top + i * lh + lh / 2, { k: k }); });
        line(ctx, [[cx - cw / 2, top - 16], [cx - cw / 2, bot], [cx + cw / 2, bot], [cx + cw / 2, top - 16]], { color: k.axis, w: 2.5 });
        OBJ.forEach(function (ob, j) {
          var x = cx - cw / 2 + cw * (j + 0.5) / OBJ.length, y, s = 16;
          var layer = -1; for (var i = 0; i < LIQ.length; i++) if (ob[1] >= LIQ[i][1]) layer = i; // sinks through every layer it is denser than
          if (layer === -1) y = top - 2; else if (layer === LIQ.length - 1) y = bot - s / 2 - 2; else y = top + (layer + 1) * lh;
          circle(ctx, x, y, s / 2 + 1, MAT_COL[ob[0]] || '#aaa', k.ink, 1.2);
          txt(ctx, F.quiet ? '' : ob[0], x, y - s / 2 - 8, { size: 10.5, color: k.ink, align: 'center', halo: k.halo });
        });
        F.alt('A tall jar with three liquid layers: vegetable oil on top, water in the middle, corn syrup at the bottom. Objects settle at the level of their own density.');
        F.say('Each liquid floats on the denser ones below it. An object sinks through every layer it is denser than and floats on the first one denser than itself: cork floats on the oil, polyethylene plastic (0.95) sits where oil meets water, nylon (1.15) on the syrup, steel at the bottom.', 'Each object settles where the liquid below it is denser than itself.');
      };
    }

    // ---------------- isostasy ----------------
    function isostasy(F) {
      F.size({ aspect: 1.6, max: 440, narrow: 0.9 });
      var P = { h: clamp(num(o.height, 4), 0, 8), rc: num(o.rhoCrust, 2.7), rm: num(o.rhoMantle, 3.3), ice: clamp(num(o.ice, 0), 0, 3), sink: 0, mode: o.ice != null ? 'ice' : 'mountain' }, rebound = null;
      P.sink = P.mode === 'ice' ? EM.iceSink(P.ice, 0.917, P.rm) : 0;
      var T = F.tiles(P.mode === 'mountain' ? [{ k: 'root', label: 'Root below the plains’ crust', secret: true }, { k: 'tot', label: 'Crust under the peak', secret: true }] : [{ k: 'sink', label: 'Land pushed down', secret: true }, { k: 'eq', label: 'When balanced', secret: true }]);
      if (P.mode === 'mountain') V.slider(F.ctl, { label: 'Mountain height', min: 0, max: 8, step: 0.1, value: P.h, fmt: function (v) { return fm(v, 1) + ' km'; }, input: function (v) { P.h = v; F.redraw(); } });
      else {
        var is = V.slider(F.ctl, { label: 'Ice sheet thickness', min: 0, max: 3, step: 0.1, value: P.ice, fmt: function (v) { return fm(v, 1) + ' km'; }, input: function (v) { P.ice = v; if (rebound) { rebound.stop(); rebound = null; } P.sink = EM.iceSink(P.ice, 0.917, P.rm); F.redraw(); } });
        var row = F.row(); V.button(row, 'Melt the ice', function () { var s0 = P.sink; P.ice = 0; is.set(0); if (rebound) rebound.stop(); var t = 0; if (V.reduced) { P.sink = 0; F.redraw(); return; } rebound = F.anim(function (dt) { t += dt; P.yrs = t * 3000; P.sink = s0 * M.exp(-P.yrs / 4500); F.redraw(); if (t > 8) { rebound.stop(); rebound = null; } }); });
      }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, top = 20, s = (h - top - 26) / 80, sea = top + 14 * s; // 1 km = s px vertically; 14 km of sky above sea level
        function Y(z) { return sea - z * s; } // z: km above sea level
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, Y(0));
        ctx.fillStyle = k.mantle; ctx.fillRect(0, Y(0), w, h - Y(0));
        var c0 = 35, cols = [], n = 5, cw = w / n;
        if (P.mode === 'mountain') {
          var root = EM.airyRoot(P.h, P.rc, P.rm);
          for (var i = 0; i < n; i++) { var hh = i === 2 ? P.h : i === 1 || i === 3 ? P.h * 0.45 : 0, rr = EM.airyRoot(hh, P.rc, P.rm); cols.push([i * cw, hh, -(c0 + rr)]); }
          cols.forEach(function (c, i) { ctx.fillStyle = mixHex(k.crust, '#000000', i % 2 ? 0.06 : 0); ctx.fillRect(c[0], Y(c[1]), cw + 1, Y(c[2]) - Y(c[1])); });
          // mountain shape on the middle columns
          ctx.fillStyle = k.landDark; ctx.beginPath(); ctx.moveTo(cw * 1, Y(0)); ctx.lineTo(cw * 1.5, Y(P.h * 0.45)); ctx.lineTo(cw * 2.5, Y(P.h)); ctx.lineTo(cw * 3.5, Y(P.h * 0.45)); ctx.lineTo(cw * 4, Y(0)); ctx.closePath(); ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
          line(ctx, [[0, Y(-c0 - root)], [w, Y(-c0 - root)]], { color: k.ink, w: 1.4, dash: [6, 4] });
          if (!F.quiet) txt(ctx, 'equal weight of rock above this line everywhere', 8, Y(-c0 - root) + 12, { size: 11, color: k.dark ? '#fff' : '#3a1a05', halo: k.halo });
          if (!F.quiet && root > 1) { arrow(ctx, cw * 2.5, Y(-c0), cw * 2.5, Y(-c0 - root), { color: '#fff', w: 2 }); txt(ctx, 'root ' + fm(root, 1) + ' km', cw * 2.5 + 8, Y(-c0 - root / 2), { size: 12, color: '#fff', bold: true, halo: 'rgba(60,20,0,0.6)' }); }
          if (!F.quiet) { txt(ctx, 'crust ' + fm(P.rc, 1) + ' g/cm³', 8, Y(-c0 / 2), { size: 11, color: '#fff', halo: 'rgba(60,20,0,0.5)' }); txt(ctx, 'mantle ' + fm(P.rm, 1) + ' g/cm³ (solid, flows very slowly)', 8, h - 12, { size: 11, color: '#fff', halo: 'rgba(60,20,0,0.5)' }); }
          T.root(fm(root, 1) + ' km'); T.tot(fm(c0 + P.h + root, 1) + ' km');
          F.alt('Blocks of crust floating on the mantle like ice on water. The middle block holds a mountain ' + (F.quiet ? '' : fm(P.h, 1) + ' km high ') + 'and has a deep root of crust beneath it.');
          F.say('Like an iceberg, a mountain range floats on the denser mantle with a thick root below it: root = height × ' + fm(P.rc, 1) + ' ÷ (' + fm(P.rm, 1) + ' − ' + fm(P.rc, 1) + ') = <b>' + fm(root, 1) + ' km</b> for a ' + fm(P.h, 1) + ' km range.', 'A high range is held up by a deep root of light crust, like an iceberg.');
        } else {
          var s1 = P.sink;
          for (i = 0; i < n; i++) { var under = i >= 1 && i <= 3; ctx.fillStyle = k.crust; ctx.fillRect(i * cw, Y(under ? -s1 : 0), cw + 1, Y(-c0 - (under ? s1 : 0)) - Y(under ? -s1 : 0)); }
          if (P.ice > 0) { ctx.fillStyle = k.ice; ctx.strokeStyle = k.blue; ctx.beginPath(); ctx.moveTo(cw, Y(-s1)); ctx.quadraticCurveTo(cw * 2.5, Y(P.ice * 2 - s1), cw * 4, Y(-s1)); ctx.closePath(); ctx.fill(); ctx.stroke(); if (!F.quiet) txt(ctx, 'ice sheet ' + fm(P.ice, 1) + ' km thick', cw * 2.5, Y(P.ice * 0.8 - s1), { size: 12, color: k.ink, align: 'center', bold: true }); }
          line(ctx, [[0, Y(0)], [w, Y(0)]], { color: k.ink, w: 1, dash: [3, 4] });
          if (!F.quiet && s1 > 0.01) txt(ctx, 'land pushed down ' + nf(s1 * 1000, 0) + ' m', cw * 2.5, Y(-s1) + 16, { size: 12, color: '#fff', align: 'center', bold: true, halo: 'rgba(60,20,0,0.6)' });
          if (P.yrs != null && rebound) txt(ctx, 'about ' + nf(M.round(P.yrs / 500) * 500) + ' years after the melt', w - 10, 16, { size: 12, color: k.ink, align: 'right', bold: true });
          T.sink(nf(s1 * 1000, 0) + ' m'); T.eq('thickness × 0.917 ÷ ' + fm(P.rm, 1));
          F.alt('A thick ice sheet presses the crust down into the mantle; when the ice melts, the land slowly rises back.');
          F.say('Ice ' + fm(P.ice, 1) + ' km thick pushes the land down about <b>' + nf(EM.iceSink(P.ice, 0.917, P.rm) * 1000, 0) + ' m</b> (ice thickness × 0.917 ÷ ' + fm(P.rm, 1) + ') once balanced. When it melts, the mantle flows back very slowly and the land rebounds over thousands of years; parts of Canada and Scandinavia are still rising today.', 'Ice pushes the land down; after it melts the land slowly rises again.');
        }
      };
    }

    // ---------------- convection ----------------
    function convection(F) {
      F.size({ aspect: 1.7, max: 400, narrow: 1.1 });
      var sc = ['pot', 'mantle', 'seabreeze', 'ocean'].indexOf(o.scenario) >= 0 ? o.scenario : 'pot', night = o.time === 'night', N = 260, pts = [], r = rng(5);
      for (var i = 0; i < N; i++) pts.push({ x: r(), z: r(), T: 0.5 });
      var T = F.tiles([{ k: 'hot', label: 'Warm fluid', secret: true }, { k: 'cold', label: 'Cool fluid', secret: true }]);
      if (!F.lock) V.seg(F.ctl, { label: 'Scenario', items: [['pot', 'A pot'], ['mantle', 'Mantle'], ['seabreeze', 'Sea breeze'], ['ocean', 'Ocean']], value: sc, change: function (v) { sc = v; warm(); F.redraw(); } });
      var tb = check(F.ctl, 'Night (sea breeze)', night, function (v) { night = v; warm(); F.redraw(); });
      var row = F.row(); var pl = F.player(row, function (dt) { stepP(dt); F.redraw(); }, { label: 'Run', auto: true });
      // velocity field: one or two cells from a stream function; x, z in 0..1 (z up)
      function vel(x, z) { // stream function sin(nπx)·sin(πz): n = 2 cells (rising in the middle) or 1 (rising at the right)
        var n = sc === 'pot' || sc === 'mantle' ? 2 : 1, dir = sc === 'seabreeze' && night ? -1 : 1;
        return [dir * M.sin(n * PI * x) * PI * M.cos(PI * z) * 0.07, -dir * n * PI * M.cos(n * PI * x) * M.sin(PI * z) * 0.07];
      }
      function stepP(dt) {
        pts.forEach(function (p) {
          var v = vel(p.x, p.z); p.x = clamp(p.x + v[0] * dt, 0.002, 0.998); p.z = clamp(p.z + v[1] * dt, 0.002, 0.998);
          // heating and cooling at the edges that drive the flow: the fluid there takes on that edge's temperature
          var src = null;
          if (sc === 'pot' || sc === 'mantle') src = p.z < 0.12 ? 1 : p.z > 0.88 ? 0 : null;
          else if (sc === 'seabreeze') src = p.z < 0.14 ? ((p.x > 0.5) !== night ? 1 : 0) : p.z > 0.86 ? 0.5 : null;
          else src = p.z > 0.86 ? (p.x < 0.2 ? 0 : 1) : null;
          if (src !== null) p.T += (src - p.T) * M.min(1, 2.2 * dt);
        });
      }
      function warm() { for (var s0 = 0; s0 < 160; s0++) stepP(0.08); }
      warm();
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, bx = 12, by = 30, bw = w - 24, bh = h - 64;
        function X(x) { return bx + x * bw; } function Z(z) { return by + bh - z * bh; }
        var bg = sc === 'seabreeze' ? k.sky : sc === 'mantle' ? rgba(k.mantle, 0.25) : rgba(k.blue, 0.12); ctx.fillStyle = bg; ctx.fillRect(bx, by, bw, bh);
        // boundaries and labels
        if (sc === 'pot' || sc === 'mantle') { ctx.fillStyle = sc === 'pot' ? '#e8590c' : k.ocore; ctx.fillRect(bx, by + bh, bw, 10); if (!F.quiet) txt(ctx, sc === 'pot' ? 'stove: heated from below' : 'hot core below', bx + bw / 2, by + bh + 20, { size: 11, color: k.ink, align: 'center' }); }
        if (sc === 'mantle') { ctx.fillStyle = k.crust; ctx.fillRect(bx, by - 14, bw / 2 - 3, 14); ctx.fillRect(bx + bw / 2 + 3, by - 14, bw / 2 - 3, 14); arrow(ctx, bx + bw * 0.35, by - 7, bx + bw * 0.15, by - 7, { color: '#fff', w: 2 }); arrow(ctx, bx + bw * 0.65, by - 7, bx + bw * 0.85, by - 7, { color: '#fff', w: 2 }); if (!F.quiet) txt(ctx, 'plates move apart where hot rock rises', bx + bw / 2, by - 20, { size: 11, color: k.ink, align: 'center' }); }
        if (sc === 'seabreeze') { ctx.fillStyle = k.sea; ctx.fillRect(bx, by + bh, bw / 2, 12); ctx.fillStyle = k.land; ctx.fillRect(bx + bw / 2, by + bh, bw / 2, 12); txt(ctx, 'sea', bx + bw * 0.25, by + bh + 22, { size: 11, color: k.ink, align: 'center' }); txt(ctx, 'land', bx + bw * 0.75, by + bh + 22, { size: 11, color: k.ink, align: 'center' }); var lowLand = !night; if (!F.quiet) { txt(ctx, lowLand ? 'L' : 'H', bx + bw * 0.75, by + bh - 14, { size: 18, color: lowLand ? k.red : k.blue, bold: true, align: 'center' }); txt(ctx, lowLand ? 'H' : 'L', bx + bw * 0.25, by + bh - 14, { size: 18, color: lowLand ? k.blue : k.red, bold: true, align: 'center' }); } txt(ctx, night ? 'Night: land cools faster than the sea' : 'Day: land warms faster than the sea', bx + 6, by + 12, { size: 11.5, color: k.ink, bold: true }); }
        if (sc === 'ocean') { ctx.fillStyle = k.ice; ctx.fillRect(bx, by - 8, bw * 0.18, 8); txt(ctx, 'near the pole: cold, salty water sinks', bx + 4, by - 16, { size: 11, color: k.ink }); txt(ctx, 'toward the equator', bx + bw - 4, by - 16, { size: 11, color: k.ink, align: 'right' }); }
        // flow arrows
        if (!F.quiet || sc !== 'seabreeze') for (var gx = 0.1; gx < 1; gx += 0.2) for (var gz = 0.2; gz < 0.9; gz += 0.3) { var v = vel(gx, gz), L = M.hypot(v[0], v[1]); if (L < 0.02) continue; arrow(ctx, X(gx), Z(gz), X(gx + v[0] * 0.5), Z(gz + v[1] * 0.5), { color: rgba(k.ink, 0.35), w: 1.5, head: 6 }); }
        // particles colored by temperature
        pts.forEach(function (p) { ctx.fillStyle = mix(k.cool, k.hot, p.T); ctx.beginPath(); ctx.arc(X(p.x), Z(p.z), 3, 0, TAU); ctx.fill(); });
        if (sc === 'seabreeze' && !F.quiet) { var dir = night ? -1 : 1; arrow(ctx, bx + bw * (0.5 - 0.15 * dir), by + bh - 34, bx + bw * (0.5 + 0.15 * dir), by + bh - 34, { color: k.ink, w: 3, head: 11 }); txt(ctx, night ? 'land breeze' : 'sea breeze', bx + bw / 2, by + bh - 50, { size: 12, color: k.ink, align: 'center', bold: true, halo: k.halo }); }
        T.hot('less dense: pushed up'); T.cold('more dense: sinks');
        F.alt('Convection: ' + { pot: 'water in a pot heated from below', mantle: 'the mantle under two plates', seabreeze: 'air over land and sea by ' + (night ? 'night' : 'day'), ocean: 'ocean water cooled near a pole' }[sc] + '. Warm fluid (red) rises and cool fluid (blue) sinks in a loop.');
        F.say('Warm fluid expands and becomes less dense; cooler, denser fluid sinks around it and pushes it up. Heat doesn’t "rise" by itself: gravity pulls the denser fluid down.' + (sc === 'seabreeze' ? (night ? ' At night the land cools faster, the air over the sea is warmer, and the surface wind blows from land to sea: a land breeze.' : ' By day the land warms faster, air rises over it, and cooler air from the sea flows in: a sea breeze, named for where it comes from.') : sc === 'ocean' ? ' Near the poles cold, salty water is the densest and sinks, then creeps along the ocean floor.' : sc === 'mantle' ? ' In the mantle the "fluid" is solid rock creeping a few centimeters a year.' : ''), 'Warm fluid is less dense and is pushed up; cool fluid sinks.');
      };
      if (V.reduced) tb.parentNode.title = 'Press Run to see the flow';
    }
  });

  /* marching squares: segments where the grid crosses `level`. G: {nx, ny, z: Float64Array (ny+1)*(nx+1) row-major}; returns [[x1, y1, x2, y2], ...] in grid units */
  function contourSegs(G, level) {
    var out = [], nx = G.nx, ny = G.ny, z = G.z, W1 = nx + 1;
    for (var j = 0; j < ny; j++) for (var i = 0; i < nx; i++) {
      var a = z[j * W1 + i], b = z[j * W1 + i + 1], c = z[(j + 1) * W1 + i + 1], d = z[(j + 1) * W1 + i];
      var idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0); if (idx === 0 || idx === 15) continue;
      var t = function (p, q) { return (level - p) / (q - p); };
      var top = [i + t(a, b), j], right = [i + 1, j + t(b, c)], bot = [i + t(d, c), j + 1], left = [i, j + t(a, d)];
      var cases = { 1: [[left, bot]], 2: [[bot, right]], 3: [[left, right]], 4: [[top, right]], 5: [[left, top], [bot, right]], 6: [[top, bot]], 7: [[left, top]], 8: [[left, top]], 9: [[top, bot]], 10: [[left, bot], [top, right]], 11: [[top, right]], 12: [[left, right]], 13: [[bot, right]], 14: [[left, bot]] };
      (cases[idx] || []).forEach(function (sgm) { out.push([sgm[0][0], sgm[0][1], sgm[1][0], sgm[1][1]]); });
    }
    return out;
  }

  /* es-topo: Topographic Map.
     opts:
       terrain: 'hill' | 'saddle' | 'valley' | 'cliff' | 'crater' | 'random' (with seed); seed: a number for random terrain
       interval: contour interval (m, or ft with units 'ft'; default 20 m); units: 'm' | 'ft'
       view3d: true (show the tilted 3-D view; default true); profile: [[x1, y1], [x2, y2]] (fractions 0–1 of the map; draggable)
       points: [{x, y, label}] (fractions of the map, 0–1, y down); stream: true (draw the stream where the terrain has one)
       scale: map width in km (default 2.4) or '1:24000'
       quiet: hides point elevations, the gradient readout and every contour label except two index contours; lock */
  R('es-topo', function (el, o) {
    var F = frame(el, o, 'Topographic map', { aspect: 1.5, max: 560 });
    var ft = o.units === 'ft', iv = num(o.interval, ft ? 50 : 20), kind = o.terrain || (o.seed ? 'random' : 'hill'), seed = num(o.seed, 7);
    var Wkm = typeof o.scale === 'number' ? o.scale : 2.4, Hkm = Wkm * 2 / 3, nx = 72, ny = 48, view3 = o.view3d !== false, stream = o.stream !== false;
    var prof = (o.profile || (o.terrain === 'valley' ? [[0.45, 0.12], [0.55, 0.88]] : [[0.12, 0.62], [0.88, 0.38]])).map(function (p) { return [clamp(num(p[0], 0.5), 0, 1), clamp(num(p[1], 0.5), 0, 1)]; });
    var pts = (o.points || []).map(function (p, i) { return { x: clamp(num(p.x, 0.5), 0, 1), y: clamp(num(p.y, 0.5), 0, 1), label: p.label != null ? String(p.label) : LETTERS[i] }; });
    var G = null, crater = null, streamPath = null, sel = 0, geo = null;
    function build() {
      var r = rng(seed), bumps = [], base = 30, tilt = [28, 12];
      if (kind === 'hill') bumps = [[0.5, 0.5, 0.2, 0.16, 300, 1]];
      else if (kind === 'saddle') bumps = [[0.3, 0.5, 0.14, 0.18, 260, 0], [0.72, 0.48, 0.14, 0.16, 300, 0]];
      else if (kind === 'cliff') bumps = [];
      else if (kind === 'crater') { bumps = [[0.5, 0.5, 0.28, 0.28, 160, 0]]; crater = [0.5, 0.5]; }
      else if (kind === 'valley') bumps = [];
      else for (var i = 0; i < 4 + M.floor(r() * 3); i++) bumps.push([0.12 + r() * 0.76, 0.12 + r() * 0.76, 0.08 + r() * 0.14, 0.08 + r() * 0.14, 90 + r() * 230, r() < 0.5 ? 1 : 0]);
      if (kind === 'random') tilt = [(r() - 0.5) * 120, (r() - 0.5) * 80];
      var noise = noise2(seed + 3);
      function h(x, y) { // x, y in 0..1 (y down); meters
        var z = base + tilt[0] * x + tilt[1] * y;
        bumps.forEach(function (b) { var dx = (x - b[0]) / b[2], dy = (y - b[1]) / b[3]; if (b[5] && dx > 0) dx *= 1.9; /* steeper on the east side */ z += b[4] * M.exp(-(dx * dx + dy * dy)); });
        if (kind === 'cliff') z = 60 + 40 * x + 160 / (1 + M.exp(-(y - 0.45) * 40)) + 30 * M.sin(x * 6);
        if (kind === 'valley') { var axis = 0.5 + 0.08 * M.sin(x * 5); z = 40 + 110 * x + 620 * M.pow(M.abs(y - axis), 1.1); }
        if (kind === 'crater') { var d = M.hypot(x - 0.5, (y - 0.5) * 1.5); z = 80 + 40 * x + 170 * M.exp(-M.pow((d - 0.2) / 0.08, 2)) - (d < 0.2 ? 90 * (1 - d / 0.2) : 0); }
        return z + 3 * (fbm(noise, x * 5, y * 5, 2) - 0.5);
      }
      var z = new Float64Array((nx + 1) * (ny + 1)), zmin = 1e9, zmax = -1e9;
      for (var j = 0; j <= ny; j++) for (var i2 = 0; i2 <= nx; i2++) { var v = h(i2 / nx, j / ny); z[j * (nx + 1) + i2] = v; zmin = M.min(zmin, v); zmax = M.max(zmax, v); }
      G = { nx: nx, ny: ny, z: z, zmin: zmin, zmax: zmax, h: h };
      streamPath = null;
      if (kind === 'valley' && stream) { streamPath = []; for (var sx = 0.98; sx >= 0.02; sx -= 0.01) { var ax = 0.5 + 0.08 * M.sin(sx * 5); streamPath.push([sx, ax]); } }
    }
    build();
    function elev(x, y) { return G.h(x, y); } // meters
    function show(m) { return ft ? nf(m * 3.28084, 0) + ' ft' : nf(m, 0) + ' m'; }
    var T = F.tiles([{ k: 'a', label: 'Elevation at A', secret: true }, { k: 'b', label: 'Elevation at B', secret: true }, { k: 'run', label: 'Distance A to B', secret: true }, { k: 'grad', label: 'Gradient', secret: true }]);
    if (!o.terrain && !o.seed && !F.lock) V.seg(F.ctl, { label: 'Terrain', items: [['hill', 'Hill'], ['saddle', 'Two hills'], ['valley', 'Valley'], ['cliff', 'Cliff'], ['crater', 'Crater'], ['random', 'Surprise me']], value: kind, change: function (v) { kind = v; if (v === 'random') seed = (seed * 7919 + 13) % 100000; build(); F.redraw(); } });
    check(F.ctl, '3-D view', view3, function (v) { view3 = v; F.redraw(); });
    var handles = [{ get: function () { return prof[0]; }, set: function (p) { prof[0] = p; } }, { get: function () { return prof[1]; }, set: function (p) { prof[1] = p; } }];
    F.drag({ hit: function (x, y) { if (!geo) return null; var best = null, bd = 24; handles.forEach(function (hh, i) { var p = hh.get(), d = M.hypot(geo.X(p[0]) - x, geo.Y(p[1]) - y); if (d < bd) { bd = d; best = i; } }); return best; }, start: function (i) { sel = i; }, move: function (i, x, y) { handles[i].set([clamp(geo.ix(x), 0, 1), clamp(geo.iy(y), 0, 1)]); F.redraw(); } });
    F.keys(function (e) { if (e.key === 'Enter' || e.key === 'n' || e.key === 'N') { sel = 1 - sel; F.redraw(); return true; } var a = arrowKey(e); if (!a) return false; var p = handles[sel].get(); handles[sel].set([clamp(p[0] + a[0] * 0.02, 0, 1), clamp(p[1] + a[1] * 0.02, 0, 1)]); F.redraw(); return true; }, 'Drag the ends of the profile line A–B (or use the arrow keys; Enter switches ends) to see the land’s shape along it.');
    F.draw = function () {
      var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 620;
      var profH = M.max(110, h * 0.26), mapW = wide && view3 ? w * 0.56 : w - 16, mapH = M.min((h - profH - (wide || !view3 ? 26 : h * 0.33)), mapW * Hkm / Wkm);
      mapW = mapH * Wkm / Hkm; var mx0 = 8, my0 = 8;
      geo = { X: function (x) { return mx0 + x * mapW; }, Y: function (y) { return my0 + y * mapH; }, ix: function (px) { return (px - mx0) / mapW; }, iy: function (py) { return (py - my0) / mapH; } };
      // map: paper with a soft elevation tint
      var steps = 12; for (var j = 0; j < ny; j++) for (var i = 0; i < nx; i++) { var zz = G.z[j * (nx + 1) + i], t = (zz - G.zmin) / (G.zmax - G.zmin + 1e-9); ctx.fillStyle = mix(k.dark ? '#24361f' : '#eef4e4', k.dark ? '#5a4a33' : '#e9d9b8', M.round(t * steps) / steps); ctx.fillRect(mx0 + i * mapW / nx, my0 + j * mapH / ny, mapW / nx + 0.6, mapH / ny + 0.6); }
      // contours
      var lo = M.ceil(G.zmin / (ft ? iv / 3.28084 : iv)), unitM = ft ? iv / 3.28084 : iv, labelsDone = 0, idxCount = 0;
      for (var L = lo; L * unitM <= G.zmax; L++) {
        var lev = L * unitM, isIdx = L % 5 === 0, segs = contourSegs(G, lev);
        ctx.save(); ctx.strokeStyle = k.dark ? '#c99a6a' : '#9c5a2b'; ctx.lineWidth = isIdx ? 2 : 1; ctx.beginPath();
        segs.forEach(function (s) { ctx.moveTo(mx0 + s[0] / nx * mapW, my0 + s[1] / ny * mapH); ctx.lineTo(mx0 + s[2] / nx * mapW, my0 + s[3] / ny * mapH); });
        ctx.stroke(); ctx.restore();
        // hachures on depression contours (inside a crater rim)
        if (crater) segs.forEach(function (s, si) { if (si % 3) return; var mxs = (s[0] + s[2]) / 2 / nx, mys = (s[1] + s[3]) / 2 / ny, d = M.hypot(mxs - crater[0], (mys - crater[1]) * 1.5); if (d > 0.19) return; var dx = crater[0] - mxs, dy = crater[1] - mys, dl = M.hypot(dx * mapW, dy * mapH) || 1; var px = mx0 + mxs * mapW, py = my0 + mys * mapH; line(ctx, [[px, py], [px + dx * mapW / dl * 5, py + dy * mapH / dl * 5]], { color: k.dark ? '#c99a6a' : '#9c5a2b', w: 1 }); });
        if (isIdx && segs.length) {
          idxCount++;
          var showLab = !F.quiet || idxCount <= 2;
          if (showLab) { var s0 = segs[M.floor(segs.length * (0.3 + 0.4 * ((L * 37) % 10) / 10))], lx = mx0 + (s0[0] + s0[2]) / 2 / nx * mapW, ly = my0 + (s0[1] + s0[3]) / 2 / ny * mapH; txt(ctx, ft ? nf(lev * 3.28084) : nf(lev), lx, ly, { size: 10.5, color: k.dark ? '#f0c89a' : '#7a3c12', align: 'center', halo: k.dark ? '#2b2a1c' : '#f3eedd', bold: true }); }
        }
      }
      if (streamPath) { line(ctx, streamPath.map(function (p) { return [geo.X(p[0]), geo.Y(p[1])]; }), { color: k.blue, w: 2.4 }); }
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.strokeRect(mx0 + 0.5, my0 + 0.5, mapW, mapH);
      // scale bar and interval
      var sb = Wkm >= 2 ? 1 : 0.5, sbp = sb / Wkm * mapW; line(ctx, [[mx0 + 10, my0 + mapH - 12], [mx0 + 10 + sbp, my0 + mapH - 12]], { color: k.ink, w: 3, cap: 'butt' }); txt(ctx, sb + ' km', mx0 + 14 + sbp, my0 + mapH - 12, { size: 11, color: k.ink, halo: k.halo });
      var ciS = (mapW < 360 ? 'Interval ' : 'Contour interval ') + iv + ' ' + (ft ? 'ft' : 'm'), ciW = tw(ctx, ciS, { size: 11, bold: true }); txt(ctx, ciS, mx0 + mapW - 8, my0 + mapH - (mx0 + mapW - 8 - ciW < mx0 + 60 + sbp ? 28 : 12), { size: 11, color: k.ink, align: 'right', halo: k.halo, bold: true });
      // profile line and points
      var A = prof[0], B = prof[1];
      line(ctx, [[geo.X(A[0]), geo.Y(A[1])], [geo.X(B[0]), geo.Y(B[1])]], { color: k.rust, w: 2.2, dash: [6, 4] });
      [A, B].forEach(function (p, i) { knob(ctx, geo.X(p[0]), geo.Y(p[1]), k.rust, 7, k); txt(ctx, i ? 'B' : 'A', geo.X(p[0]) + 10, geo.Y(p[1]) - 10, { size: 13, color: k.rust, bold: true, halo: k.halo }); if (F.focused() && sel === i) focusRing(ctx, geo.X(p[0]), geo.Y(p[1]), 14); });
      pts.forEach(function (p) { circle(ctx, geo.X(p.x), geo.Y(p.y), 4, k.ink); badge(ctx, p.label, geo.X(p.x) + 12, geo.Y(p.y) - 12, { k: k, r: 10 }); if (!F.quiet) txt(ctx, show(elev(p.x, p.y)), geo.X(p.x) + 8, geo.Y(p.y) + 10, { size: 10.5, color: k.ink, halo: k.halo }); });
      // 3-D view
      if (view3) {
        var vx0 = wide ? mx0 + mapW + 18 : 8, vy0 = wide ? 8 : my0 + mapH + 10, vw = wide ? w - vx0 - 8 : w - 16, vh = wide ? mapH : h - profH - mapH - 30;
        var zr = G.zmax - G.zmin + 1, vs = vh * 0.38 / zr, cs = M.max(60, M.min(vw - 8, 1.24 * vh - 32)), offx = (vw - cs) / 2;
        function P3(x, y, z) { return [vx0 + offx + (x + (1 - y) * 0.45) * cs * 0.69, vy0 + vh - 8 - (1 - y) * cs * 0.5 - (z - G.zmin) * vs]; }
        var stp = 2;
        for (var j3 = 0; j3 < ny; j3 += stp) for (var i3 = 0; i3 < nx; i3 += stp) {
          var x1 = i3 / nx, x2 = M.min(nx, i3 + stp) / nx, y1 = j3 / ny, y2 = M.min(ny, j3 + stp) / ny, W1 = nx + 1;
          var za = G.z[j3 * W1 + i3], zb = G.z[j3 * W1 + M.min(nx, i3 + stp)], zc = G.z[M.min(ny, j3 + stp) * W1 + M.min(nx, i3 + stp)], zd = G.z[M.min(ny, j3 + stp) * W1 + i3];
          var nxv = (za - zb + zd - zc) / 2 / ((x2 - x1) * Wkm * 1000), nyv = (za - zd + zb - zc) / 2 / ((y2 - y1) * Hkm * 1000), lit = clamp(0.62 + nxv * 1.6 + nyv * 1.2, 0.25, 1.05);
          var tt = ((za + zc) / 2 - G.zmin) / (G.zmax - G.zmin + 1e-9), base = mixHex(k.dark ? '#4f7a3f' : '#8fbf6a', k.dark ? '#9a7a52' : '#c9a876', tt);
          var c3 = rgb(base); ctx.fillStyle = 'rgb(' + M.round(c3[0] * lit) + ',' + M.round(c3[1] * lit) + ',' + M.round(c3[2] * lit) + ')';
          var q1 = P3(x1, y1, za), q2 = P3(x2, y1, zb), q3 = P3(x2, y2, zc), q4 = P3(x1, y2, zd);
          ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.lineTo(q3[0], q3[1]); ctx.lineTo(q4[0], q4[1]); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.6; ctx.stroke();
        }
        if (streamPath) line(ctx, streamPath.map(function (p) { var q = P3(p[0], p[1], elev(p[0], p[1]) + 2); return q; }), { color: k.blue, w: 2 });
        var la = P3(A[0], A[1], elev(A[0], A[1])), lb = P3(B[0], B[1], elev(B[0], B[1]));
        var pl = []; for (var t3 = 0; t3 <= 1.0001; t3 += 0.02) { var xx = lerp(A[0], B[0], t3), yy = lerp(A[1], B[1], t3); pl.push(P3(xx, yy, elev(xx, yy) + 3)); } line(ctx, pl, { color: k.rust, w: 2 });
        txt(ctx, 'A', la[0], la[1] - 10, { size: 12, color: k.rust, bold: true, align: 'center', halo: k.halo }); txt(ctx, 'B', lb[0], lb[1] - 10, { size: 12, color: k.rust, bold: true, align: 'center', halo: k.halo });
        txt(ctx, 'The same land in 3-D (heights stretched)', vx0 + 4, vy0 + 10, { size: 11, color: k.muted });
      }
      // profile
      var pr = { x: 52, y: h - profH + 14, w: w - 66, h: profH - 50 }, dist = M.hypot((B[0] - A[0]) * Wkm, (B[1] - A[1]) * Hkm);
      var zlo = M.floor(G.zmin / unitM) * unitM, zhi = M.ceil(G.zmax / unitM) * unitM;
      var pc = chart(ctx, k, pr, { x: { min: 0, max: M.max(0.1, dist), label: 'Distance from A (km)', fmt: function (v) { return fm(v, 2); } }, y: { min: zlo, max: zhi, step: unitM * M.max(1, M.round((zhi - zlo) / unitM / 4)), fmt: function (v) { return ft ? nf(v * 3.28084) : nf(v); }, labels: !F.quiet || true } });
      var pp = []; for (var t4 = 0; t4 <= 1.0001; t4 += 0.005) { var x4 = lerp(A[0], B[0], t4), y4 = lerp(A[1], B[1], t4); pp.push([pc.X(t4 * dist), pc.Y(elev(x4, y4))]); }
      ctx.save(); ctx.beginPath(); ctx.moveTo(pp[0][0], pr.y + pr.h); pp.forEach(function (q) { ctx.lineTo(q[0], q[1]); }); ctx.lineTo(pp[pp.length - 1][0], pr.y + pr.h); ctx.closePath(); ctx.fillStyle = rgba(k.land, 0.45); ctx.fill(); ctx.restore();
      line(ctx, pp, { color: k.rust, w: 2 });
      txt(ctx, 'Profile A–B (' + (ft ? 'ft' : 'm') + ')', pr.x, pr.y - 7, { size: 11.5, color: k.ink, bold: true });
      var za2 = elev(A[0], A[1]), zb2 = elev(B[0], B[1]), rise = zb2 - za2;
      T.a(show(za2)); T.b(show(zb2)); T.run(fm(dist, 2) + ' km'); T.grad(nf(M.abs(rise) / dist, 0) + (ft ? ' m/km (' + nf(M.abs(rise) * 3.28084 / (dist * 0.621371), 0) + ' ft/mi)' : ' m/km') + (rise >= 0 ? ' up' : ' down'));
      F.alt('A topographic map of ' + { hill: 'a hill', saddle: 'two hills with a saddle', valley: 'a valley with a stream', cliff: 'a cliff', crater: 'a crater', random: 'rolling land' }[kind] + ' with contour lines every ' + iv + ' ' + (ft ? 'feet' : 'meters') + (view3 ? ', a 3-D view' : '') + ', and an elevation profile along the line A–B.' + (pts.length ? ' Marked points: ' + pts.map(function (p) { return p.label; }).join(', ') + '.' : ''));
      F.say('Each contour line joins points of equal elevation, ' + iv + ' ' + (ft ? 'ft' : 'm') + ' apart. Where the lines crowd together the land is steep; where they spread out it is gentle.' + (kind === 'valley' ? ' Where a stream crosses the contours they bend into V’s that point upstream, uphill.' : '') + (kind === 'crater' ? ' Ticked contours (hachures) circle a hollow: the ticks point downhill into it.' : '') + ' From A to B the land ' + (rise >= 0 ? 'rises' : 'falls') + ' <b>' + show(M.abs(rise)) + '</b> over <b>' + fm(dist, 2) + ' km</b>: a gradient of <b>' + nf(M.abs(rise) / dist, 0) + ' m/km</b>.', 'Close contour lines mean steep ground; far-apart lines mean gentle ground.');
    };
    F.size({ aspect: 1.75, max: 600, narrow: 0.62 }); F.redraw();
    return { destroy: F.reset };
  });

  /* minerals for the bench: H hardness range, streak, luster, cleavage {n planes, ang text, kind}, mag, fizz, sg, col (display),
     colors (the colors it comes in), f formula, g group. Values from standard mineral tables (rounded). */
  var MINS = {
    quartz: { H: [7, 7], streak: 'none (harder than the plate)', sc: null, luster: 'glassy', cl: { n: 0, t: 'none: curved (conchoidal) fracture' }, mag: false, fizz: 'no', sg: 2.65, col: '#e9eef2', colors: 'colorless, white, pink, purple, smoky gray', f: 'SiO₂', g: 'silicate' },
    orthoclase: { H: [6, 6], streak: 'white', sc: '#f4f4f0', luster: 'glassy', cl: { n: 2, a: 90, t: '2 directions at 90°' }, mag: false, fizz: 'no', sg: 2.56, col: '#f0c3ae', colors: 'pink, white, gray', f: 'KAlSi₃O₈', g: 'silicate (feldspar)' },
    plagioclase: { H: [6, 6.5], streak: 'white', sc: '#f4f4f0', luster: 'glassy', cl: { n: 2, a: 86, t: '2 directions at about 90°, with fine parallel lines (striations)' }, mag: false, fizz: 'no', sg: 2.69, col: '#d8dde0', colors: 'white, gray, bluish gray', f: 'NaAlSi₃O₈ to CaAl₂Si₂O₈', g: 'silicate (feldspar)' },
    muscovite: { H: [2, 2.5], streak: 'white', sc: '#f4f4f0', luster: 'pearly', cl: { n: 1, t: '1 direction: peels into thin, clear sheets' }, mag: false, fizz: 'no', sg: 2.83, col: '#d8cfa8', colors: 'colorless, silvery, pale brown', f: 'KAl₂(AlSi₃O₁₀)(OH)₂', g: 'silicate (mica)' },
    biotite: { H: [2.5, 3], streak: 'white to gray', sc: '#e2e2de', luster: 'glassy to pearly', cl: { n: 1, t: '1 direction: peels into thin, dark sheets' }, mag: false, fizz: 'no', sg: 3.0, col: '#2b2420', colors: 'black, dark brown', f: 'K(Mg,Fe)₃(AlSi₃O₁₀)(OH)₂', g: 'silicate (mica)' },
    hornblende: { H: [5, 6], streak: 'pale gray-green', sc: '#cfd6cc', luster: 'glassy', cl: { n: 2, a: 56, t: '2 directions at about 56° and 124°' }, mag: false, fizz: 'no', sg: 3.2, col: '#1f2a22', colors: 'black, dark green', f: '(Ca,Na)₂(Mg,Fe,Al)₅(Al,Si)₈O₂₂(OH)₂', g: 'silicate (amphibole)' },
    augite: { H: [5.5, 6], streak: 'gray-green', sc: '#c8cfc6', luster: 'glassy', cl: { n: 2, a: 87, t: '2 directions at about 90° (87° and 93°)' }, mag: false, fizz: 'no', sg: 3.3, col: '#24302a', colors: 'dark green, black', f: '(Ca,Na)(Mg,Fe,Al)(Si,Al)₂O₆', g: 'silicate (pyroxene)' },
    olivine: { H: [6.5, 7], streak: 'white or none', sc: '#f4f4f0', luster: 'glassy', cl: { n: 0, t: 'none: curved fracture' }, mag: false, fizz: 'no', sg: 3.3, col: '#7f9a3a', colors: 'olive green, yellow-green', f: '(Mg,Fe)₂SiO₄', g: 'silicate' },
    garnet: { H: [6.5, 7.5], streak: 'none (harder than the plate)', sc: null, luster: 'glassy', cl: { n: 0, t: 'none: uneven fracture' }, mag: false, fizz: 'no', sg: 4.0, col: '#8a1e2a', colors: 'dark red, brown, green', f: 'Fe₃Al₂(SiO₄)₃ (one kind)', g: 'silicate' },
    talc: { H: [1, 1], streak: 'white', sc: '#f4f4f0', luster: 'pearly to greasy', cl: { n: 1, t: '1 direction; feels soapy' }, mag: false, fizz: 'no', sg: 2.75, col: '#cfd8c8', colors: 'white, pale green, gray', f: 'Mg₃Si₄O₁₀(OH)₂', g: 'silicate' },
    calcite: { H: [3, 3], streak: 'white', sc: '#f4f4f0', luster: 'glassy', cl: { n: 3, a: 75, t: '3 directions, not at 90°: breaks into rhombs' }, mag: false, fizz: 'fizzes strongly', sg: 2.71, col: '#f3efe4', colors: 'white, colorless, yellow, pink', f: 'CaCO₃', g: 'carbonate' },
    dolomite: { H: [3.5, 4], streak: 'white', sc: '#f4f4f0', luster: 'glassy to pearly', cl: { n: 3, a: 74, t: '3 directions, not at 90°: breaks into rhombs' }, mag: false, fizz: 'fizzes only when powdered', sg: 2.85, col: '#ead6cb', colors: 'white, pink, gray', f: 'CaMg(CO₃)₂', g: 'carbonate' },
    halite: { H: [2, 2.5], streak: 'white', sc: '#f4f4f0', luster: 'glassy', cl: { n: 3, a: 90, t: '3 directions at 90°: breaks into cubes' }, mag: false, fizz: 'no', sg: 2.16, col: '#eef3f6', colors: 'colorless, white', f: 'NaCl', g: 'halide' },
    fluorite: { H: [4, 4], streak: 'white', sc: '#f4f4f0', luster: 'glassy', cl: { n: 4, t: '4 directions: breaks into octahedrons' }, mag: false, fizz: 'no', sg: 3.18, col: '#9b7fd1', colors: 'purple, green, yellow, blue, colorless', f: 'CaF₂', g: 'halide' },
    gypsum: { H: [2, 2], streak: 'white', sc: '#f4f4f0', luster: 'glassy to silky', cl: { n: 1, t: '1 perfect direction (2 weaker)' }, mag: false, fizz: 'no', sg: 2.32, col: '#eeebe2', colors: 'white, colorless, gray', f: 'CaSO₄·2H₂O', g: 'sulfate' },
    apatite: { H: [5, 5], streak: 'white', sc: '#f4f4f0', luster: 'glassy', cl: { n: 0, t: 'poor: mostly uneven fracture' }, mag: false, fizz: 'no', sg: 3.19, col: '#6aa58a', colors: 'green, blue, brown', f: 'Ca₅(PO₄)₃(F,Cl,OH)', g: 'phosphate' },
    corundum: { H: [9, 9], streak: 'none (harder than the plate)', sc: null, luster: 'glassy to brilliant', cl: { n: 0, t: 'none: uneven fracture' }, mag: false, fizz: 'no', sg: 4.02, col: '#7c6f8a', colors: 'gray, brown, red (ruby), blue (sapphire)', f: 'Al₂O₃', g: 'oxide' },
    magnetite: { H: [5.5, 6.5], streak: 'black', sc: '#1a1a1a', luster: 'metallic', cl: { n: 0, t: 'none: uneven fracture' }, mag: true, fizz: 'no', sg: 5.18, col: '#2a2a2c', colors: 'black', f: 'Fe₃O₄', g: 'oxide' },
    hematite: { H: [5.5, 6.5], streak: 'reddish brown', sc: '#8a3b2a', luster: 'metallic to earthy', cl: { n: 0, t: 'none: uneven fracture' }, mag: false, fizz: 'no', sg: 5.26, col: '#6d5a58', colors: 'steel gray, red-brown', f: 'Fe₂O₃', g: 'oxide' },
    pyrite: { H: [6, 6.5], streak: 'greenish black', sc: '#2e3328', luster: 'metallic', cl: { n: 0, t: 'none: uneven fracture' }, mag: false, fizz: 'no', sg: 5.0, col: '#d9c25a', colors: 'brassy yellow', f: 'FeS₂', g: 'sulfide' },
    galena: { H: [2.5, 2.5], streak: 'lead gray', sc: '#5f6368', luster: 'metallic', cl: { n: 3, a: 90, t: '3 directions at 90°: breaks into cubes' }, mag: false, fizz: 'no', sg: 7.5, col: '#8a9099', colors: 'lead gray', f: 'PbS', g: 'sulfide' },
    graphite: { H: [1, 2], streak: 'gray-black', sc: '#3a3a3a', luster: 'metallic to dull', cl: { n: 1, t: '1 direction; feels greasy' }, mag: false, fizz: 'no', sg: 2.2, col: '#3d3f43', colors: 'black, steel gray', f: 'C', g: 'native element' }
  };
  var MOHS = [[1, 'talc'], [2, 'gypsum'], [3, 'calcite'], [4, 'fluorite'], [5, 'apatite'], [6, 'orthoclase'], [7, 'quartz'], [8, 'topaz'], [9, 'corundum'], [10, 'diamond']];
  var TOOLS = [['nail2', 'fingernail', 2.5], ['coin', 'copper coin', 3.5], ['nail', 'steel nail', 5.5], ['glass', 'glass plate', 5.5]];

  // a crystal-ish sample shape
  function sample(ctx, x, y, r, col, seed, broken) {
    var rr = rng(seed || 3), n = 7, pts = []; for (var i = 0; i < n; i++) { var a = i / n * TAU + rr() * 0.4, d = r * (0.75 + rr() * 0.3); pts.push([x + d * M.cos(a), y + d * M.sin(a) * 0.8]); }
    poly(ctx, pts, col, 'rgba(0,0,0,0.35)', 1.2);
    ctx.save(); ctx.globalAlpha = 0.28; poly(ctx, [pts[0], pts[1], pts[2], [x, y]], '#ffffff'); ctx.globalAlpha = 0.18; poly(ctx, [pts[4], pts[5], [x, y]], '#000000'); ctx.restore();
  }

  /* es-minerals: Mineral Lab.
     opts:
       mode: 'bench' | 'silicates'      modes: true or a list for tabs
       mineral: a name ('quartz', 'calcite', …) or unknown: true with seed (a random mineral, name hidden until revealed)
       tests: list of tests offered: 'nail2' (fingernail), 'coin', 'nail', 'glass', 'streak', 'luster', 'break', 'magnet', 'acid', 'sg'
       table: true (an identification table that narrows as tests are done)
       structure: 'isolated' | 'chain' | 'double' | 'sheet' | 'framework' (silicates); charge, ratio: true to show them
       quiet: hides the mineral's name, the ratio, the charge and the table matches; lock: results shown, no testing */
  R('es-minerals', function (el, o) {
    var F = frame(el, o, 'Mineral lab', { aspect: 1.7, max: 380 });
    return F.modes({ bench: bench, silicates: silicates }, { bench: 'Test a sample', silicates: 'Silicate structures' });

    function bench(F) {
      F.size({ aspect: 1.8, max: 360, narrow: 1.05 });
      var names = Object.keys(MINS), r0 = rng(num(o.seed, 0) || 0), unknown = !!o.unknown || !o.mineral, name = MINS[o.mineral] ? o.mineral : names[M.floor(r0() * names.length)], m = MINS[name];
      var hide = unknown || F.quiet, revealed = false, done = {}, last = null, t0 = 0, anim = null;
      var all = ['nail2', 'coin', 'nail', 'glass', 'streak', 'luster', 'break', 'magnet', 'acid', 'sg'], offered = (o.tests || all).filter(function (t) { return all.indexOf(t) >= 0; });
      var LABEL = { nail2: 'Scratch: fingernail', coin: 'Scratch: copper coin', nail: 'Scratch: steel nail', glass: 'Scratch glass with it', streak: 'Streak plate', luster: 'Luster', 'break': 'Break it', magnet: 'Magnet', acid: 'Drop of acid', sg: 'Weigh in air and water' };
      function result(t) {
        var H = m.H;
        function vs(tool) { return tool > H[1] ? 'yes' : tool < H[0] ? 'no' : 'hard to tell'; }
        if (t === 'nail2' || t === 'coin' || t === 'nail') { var tl = TOOLS.filter(function (q) { return q[0] === t; })[0], v = vs(tl[2]); return 'The ' + tl[1] + ' (' + tl[2] + ') ' + (v === 'yes' ? 'scratches it' : v === 'no' ? 'does not scratch it' : 'barely marks it: about the same hardness'); }
        if (t === 'glass') { var g = 5.5 < H[0] ? 'yes' : 5.5 > H[1] ? 'no' : 'hard to tell'; return g === 'yes' ? 'It scratches glass (5.5): harder than glass' : g === 'no' ? 'It does not scratch glass: softer than 5.5' : 'It barely scratches glass: about 5.5'; }
        if (t === 'streak') return 'Streak: ' + m.streak;
        if (t === 'luster') return 'Luster: ' + m.luster;
        if (t === 'break') return 'Cleavage: ' + m.cl.t;
        if (t === 'magnet') return m.mag ? 'A magnet sticks to it strongly' : 'Not magnetic';
        if (t === 'acid') return 'Dilute acid (virtual): ' + (m.fizz === 'no' ? 'no fizz' : m.fizz);
        if (t === 'sg') return 'Specific gravity ' + fm(m.sg, 2);
      }
      // the specific-gravity line in plain numbers: weight in air W, weight in water W − W/SG, SG = W ÷ (loss)
      function sgText() { var W2 = 100, inW = W2 - W2 / m.sg; return 'In air ' + fm(W2, 0) + ' g; in water ' + fm(inW, 1) + ' g; it lost ' + fm(W2 - inW, 1) + ' g, so its specific gravity is ' + fm(W2, 0) + ' ÷ ' + fm(W2 - inW, 1) + ' = ' + fm(m.sg, 2); }
      var nb = mk('ul', 'esv-steps'); nb.setAttribute('aria-live', 'polite'); F.el.insertBefore(nb, F.statsEl); F._rows.push(nb);
      var tbl = o.table ? mk('div', 'esv-tbl') : null; if (tbl) { tbl.setAttribute('role', 'region'); tbl.setAttribute('aria-label', 'Identification table'); tbl.tabIndex = 0; F.el.insertBefore(tbl, F.statsEl); F._rows.push(tbl); }
      var bts = mk('div', 'esv-btns'); F.ctl.appendChild(bts);
      offered.forEach(function (t) { V.button(bts, LABEL[t], function () { run(t); }); });
      if (unknown && !F.quiet) V.button(bts, 'Name it', function () { revealed = true; F.redraw(); notebook(); }, 'pri');
      if (!o.mineral && !o.unknown && !F.lock) { var row = F.row(); select(row, 'Sample', names.map(function (n) { return [n, n]; }), name, function (v) { name = v; m = MINS[v]; done = {}; last = null; unknown = false; hide = F.quiet; notebook(); F.redraw(); }); V.button(row, 'Mystery sample', function () { var r2 = rng(0); name = names[M.floor(r2() * names.length)]; m = MINS[name]; done = {}; last = null; unknown = true; hide = true; revealed = false; notebook(); F.redraw(); }); }
      function run(t) { done[t] = result(t); last = t; t0 = 0; notebook(); if (anim) anim.stop(); if (V.reduced) { t0 = 1; F.redraw(); return; } anim = F.anim(function (dt) { t0 = M.min(1, t0 + dt * 1.4); F.redraw(); if (t0 >= 1) { anim.stop(); anim = null; } }); }
      if (F.lock) offered.forEach(function (t) { done[t] = result(t); });
      function consistent(n) { // does mineral n match every result so far?
        var q = MINS[n], save = m; m = q; var ok = Object.keys(done).every(function (t) { return result(t) === done[t]; }); m = save; return ok; }
      function notebook() {
        var ks = Object.keys(done);
        nb.innerHTML = (ks.length ? ks.map(function (t) { return '<li class="yes">' + esc(t === 'sg' ? sgText() : done[t]) + '</li>'; }).join('') : '<li>Run a test to start the notebook.</li>') + ((!hide || revealed) ? '<li><b>' + esc(name) + '</b> (' + esc(m.f) + ', ' + esc(m.g) + '); comes in ' + esc(m.colors) + '.</li>' : '');
        if (tbl) {
          var cand = names.filter(consistent);
          tbl.innerHTML = '<table class="lft"><thead><tr><th>Mineral</th><th>Hardness</th><th>Streak</th><th>Luster</th><th>Cleavage</th></tr></thead><tbody>' + names.map(function (n) { var q = MINS[n], c = cand.indexOf(n) >= 0; return '<tr' + (c && ks.length && !F.quiet ? ' class="hi"' : '') + (ks.length && !c && !F.quiet ? ' style="opacity:.45"' : '') + '><td>' + n + '</td><td>' + (q.H[0] === q.H[1] ? q.H[0] : q.H[0] + '–' + q.H[1]) + '</td><td>' + esc(q.streak) + '</td><td>' + esc(q.luster) + '</td><td>' + esc(q.cl.n === 0 ? 'none' : q.cl.n + (q.cl.a ? ' at ' + q.cl.a + '°' : '')) + '</td></tr>'; }).join('') + '</tbody></table>';
        }
      }
      notebook();
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, bench2 = h - 60;
        ctx.fillStyle = k.dark ? '#2a241c' : '#efe6d6'; ctx.fillRect(0, 0, w, bench2); // bench top
        var sx = w * 0.22, sy = bench2 * 0.5, sr = M.min(w * 0.12, bench2 * 0.34);
        var broke = last === 'break';
        if (!broke) sample(ctx, sx, sy, sr, m.col, hashStr(name));
        else { // cleavage pieces or a curved fracture surface
          var n = m.cl.n, ang = (m.cl.a || 90) * RAD, s2 = sr * 0.55;
          if (n === 0) { sample(ctx, sx - s2 * 0.6, sy, sr * 0.7, m.col, 9); ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2; for (var c = 0; c < 4; c++) { ctx.beginPath(); ctx.arc(sx + s2 * 0.6, sy, s2 * (0.25 + c * 0.18), -1.2, 1.2); ctx.stroke(); } ctx.restore(); circle(ctx, sx + s2 * 0.6, sy, s2 * 0.9, null, 'rgba(0,0,0,0.3)'); }
          else if (n === 1) { for (var q = 0; q < 5; q++) { ctx.fillStyle = m.col; ctx.globalAlpha = 0.85; ctx.fillRect(sx - sr + q * 6, sy - s2 + q * 7, sr * 1.6, 5); ctx.globalAlpha = 1; } txt(ctx, 'thin sheets', sx, sy + sr * 0.9, { size: 11, color: k.ink, align: 'center' }); }
          else if (n === 4) { [-0.5, 0.55].forEach(function (off, jj) { var c3 = sx + off * sr * 1.1, L2 = s2 * (jj ? 0.7 : 0.9); poly(ctx, [[c3, sy - L2], [c3 + L2 * 0.8, sy], [c3, sy + L2], [c3 - L2 * 0.8, sy]], m.col, 'rgba(0,0,0,0.5)', 1.4); line(ctx, [[c3 - L2 * 0.8, sy], [c3 + L2 * 0.8, sy]], { color: 'rgba(0,0,0,0.35)', w: 1 }); }); txt(ctx, 'octahedrons (8 faces)', sx, sy + sr * 0.95, { size: 11, color: k.ink, align: 'center' }); }
          else { // flat pieces whose faces meet at the cleavage angle
            [-0.55, 0.6].forEach(function (off, jj) { var c3 = sx + off * sr * 1.15, L2 = s2 * (jj ? 0.75 : 1), dx = L2 * M.cos(ang), dy = L2 * M.sin(ang), p0 = [c3 - L2 / 2 - dx / 2, sy + dy / 2]; poly(ctx, [p0, [p0[0] + L2, p0[1]], [p0[0] + L2 + dx, p0[1] - dy], [p0[0] + dx, p0[1] - dy]], m.col, 'rgba(0,0,0,0.5)', 1.4); });
            if (!F.quiet && m.cl.a) txt(ctx, m.cl.a + '°' + (m.cl.a !== 90 ? ' and ' + (180 - m.cl.a) + '°' : ''), sx, sy + sr * 0.95, { size: 12, color: k.ink, align: 'center', bold: true });
          }
        }
        if (!hide || revealed) txt(ctx, name, sx, 18, { size: 14, color: k.ink, bold: true, align: 'center' }); else txt(ctx, 'Mystery sample', sx, 18, { size: 14, color: k.ink, bold: true, align: 'center' });
        // the result scene on the right
        var rx = w * 0.46, rw = w * 0.5, ry = 16, rh = bench2 - 26;
        ctx.save(); ctx.fillStyle = k.dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)'; rrect(ctx, rx, ry, rw, rh, 10); ctx.fill(); ctx.restore();
        var cx2 = rx + rw / 2, cy2 = ry + rh / 2, e = 1 - M.pow(1 - t0, 3);
        if (last === 'streak') { ctx.fillStyle = '#f7f5ef'; rrect(ctx, cx2 - rw * 0.35, cy2 - 22, rw * 0.7, 44, 4); ctx.fill(); ctx.strokeStyle = '#cfc8b8'; ctx.stroke(); if (m.sc) { ctx.fillStyle = m.sc; rrect(ctx, cx2 - rw * 0.28, cy2 - 6, rw * 0.56 * e, 12, 6); ctx.fill(); } else txt(ctx, 'no powder: it scratched the plate', cx2, cy2, { size: 11.5, color: '#5b5b5b', align: 'center' }); txt(ctx, 'unglazed porcelain plate', cx2, cy2 + 34, { size: 10.5, color: k.muted, align: 'center' }); }
        else if (last === 'acid') { sample(ctx, cx2, cy2 + 10, rh * 0.25, m.col, hashStr(name)); circle(ctx, cx2, cy2 - rh * 0.3 + e * rh * 0.15, 4, '#9fd3ff'); if (m.fizz !== 'no' && t0 > 0.6) { var rb = rng(4), nbub = m.fizz === 'fizzes strongly' ? 22 : 5; for (var b2 = 0; b2 < nbub; b2++) circle(ctx, cx2 + (rb() - 0.5) * rh * 0.4, cy2 - rb() * rh * 0.3 * t0, 1.5 + rb() * 2.5, null, k.ink, 1); } txt(ctx, 'virtual test only', cx2, ry + rh - 10, { size: 10.5, color: k.muted, align: 'center' }); }
        else if (last === 'magnet') { var mx = cx2 + 50 - (m.mag ? e * 34 : 0); sample(ctx, cx2 - 30, cy2, rh * 0.22, m.col, hashStr(name)); ctx.fillStyle = '#d6336c'; ctx.fillRect(mx, cy2 - 16, 20, 32); ctx.fillStyle = '#868e96'; ctx.fillRect(mx + 20, cy2 - 16, 20, 32); }
        else if (last === 'sg') { line(ctx, [[cx2, ry + 8], [cx2, cy2 - 10]], { color: k.ink, w: 1.5 }); rrect(ctx, cx2 - 14, cy2 - 30, 28, 26, 4); ctx.fillStyle = k.muted; ctx.fill(); line(ctx, [[cx2, cy2 - 4], [cx2, cy2 + 10 + e * 10]], { color: k.ink, w: 1 }); sample(ctx, cx2, cy2 + 22 + e * 10, rh * 0.12, m.col, 5); ctx.fillStyle = rgba(k.blue, 0.3 * e); ctx.fillRect(cx2 - 50, cy2 + 14, 100, rh / 2 - 18); txt(ctx, 'spring scale: weigh in air, then in water', cx2, ry + rh - 10, { size: 10.5, color: k.muted, align: 'center' }); }
        else if (last && last !== 'luster' && last !== 'break') { // scratch tests
          var tl = TOOLS.filter(function (q) { return q[0] === last; })[0], sc2 = last === 'glass';
          if (sc2) { ctx.fillStyle = 'rgba(180,220,240,0.55)'; rrect(ctx, cx2 - rw * 0.32, cy2 - 26, rw * 0.64, 52, 4); ctx.fill(); }
          else sample(ctx, cx2, cy2, rh * 0.28, m.col, hashStr(name));
          var ok = /scratches it|It scratches glass/.test(done[last]), barely = /barely/.test(done[last]);
          if (ok || barely) { ctx.save(); ctx.strokeStyle = sc2 ? '#ffffff' : 'rgba(255,255,255,0.85)'; ctx.lineWidth = barely ? 1 : 2.2; ctx.beginPath(); ctx.moveTo(cx2 - 40, cy2 - 6); ctx.lineTo(cx2 - 40 + 80 * e, cy2 + 6); ctx.stroke(); ctx.restore(); }
          txt(ctx, sc2 ? 'the sample drawn across glass' : tl[1] + ' drawn across the sample', cx2, ry + rh - 10, { size: 10.5, color: k.muted, align: 'center' });
        }
        else if (last === 'luster') { sample(ctx, cx2, cy2, rh * 0.3, m.col, hashStr(name)); if (/metallic|brilliant/.test(m.luster)) { ctx.save(); ctx.globalAlpha = 0.7; circle(ctx, cx2 - rh * 0.08, cy2 - rh * 0.08, rh * 0.06, '#ffffff'); ctx.restore(); } }
        if (last) { var lines = (last === 'sg' ? sgText() : done[last]); txt(ctx, lines.length > 52 ? lines.slice(0, 50) + '…' : lines, cx2, ry + 12, { size: 11.5, color: k.ink, align: 'center', bold: true }); }
        else txt(ctx, 'Pick a test below', cx2, cy2, { size: 12, color: k.muted, align: 'center' });
        // Mohs scale strip
        var my0 = bench2 + 10, mxs = 30, mw = w - 64; function MX(v) { return mxs + (v - 1) / 9 * mw; }
        line(ctx, [[mxs, my0 + 10], [mxs + mw, my0 + 10]], { color: k.axis, w: 2 });
        MOHS.forEach(function (q) { line(ctx, [[MX(q[0]), my0 + 5], [MX(q[0]), my0 + 15]], { color: k.axis, w: 1.5 }); txt(ctx, q[0] + (w > 520 ? ' ' + q[1] : ''), MX(q[0]), my0 + 24, { size: 10, color: k.muted, align: 'center' }); });
        TOOLS.slice(0, 3).forEach(function (t) { circle(ctx, MX(t[2]), my0 + 10, 3.5, k.rust); });
        if (w > 520) txt(ctx, 'fingernail 2.5 · copper 3.5 · glass and steel 5.5 · streak plate about 6.5', mxs, my0 + 40, { size: 10, color: k.rust }); else txt(ctx, 'tools: 2.5, 3.5, 5.5', mxs, my0 + 40, { size: 10, color: k.rust });
        txt(ctx, w > 520 ? 'Mohs scale: an order, not a measure (10 is not ten times 1)' : 'an order, not a measure', mxs + mw, my0 + 40, { size: 10, color: k.muted, align: 'right' });
        F.alt('A mineral sample on a lab bench' + (hide && !revealed ? '' : ': ' + name) + '. ' + (last ? (last === 'sg' ? sgText() : done[last]) + '.' : 'No test run yet.') + ' A Mohs hardness scale runs along the bottom.');
        F.say(hide && !revealed ? 'Use the results together. Color alone can fool you: one mineral can come in many colors, but its streak, hardness and cleavage stay the same.' : '<b>' + name + '</b>, ' + m.f + ' (' + m.g + '): hardness ' + (m.H[0] === m.H[1] ? m.H[0] : m.H[0] + '–' + m.H[1]) + ', streak ' + m.streak + ', ' + m.luster + ' luster, ' + m.cl.t + '. Comes in ' + m.colors + '.', 'Use the results together; color alone can fool you.');
      };
    }

    // ---------------- silicates ----------------
    function silicates(F) {
      F.size({ aspect: 1.75, max: 420, narrow: 0.9 });
      var st = ['isolated', 'chain', 'double', 'sheet', 'framework'].indexOf(o.structure) >= 0 ? o.structure : 'isolated', yaw = 0.6, pitch = 0.5, geo = null;
      var INFO = {
        isolated: { r: '1 : 4', u: 'SiO₄⁴⁻', c: '−4 per silicon', sh: 0, ex: 'olivine, garnet', cl: 'no cleavage: strong bonds in every direction' },
        chain: { r: '1 : 3', u: 'SiO₃²⁻ (in chains)', c: '−2 per silicon', sh: 2, ex: 'pyroxenes, such as augite', cl: '2 cleavages at about 90° (87° and 93°)' },
        double: { r: '4 : 11', u: 'Si₄O₁₁⁶⁻', c: '−6 per 4 silicons', sh: 2.5, ex: 'amphiboles, such as hornblende', cl: '2 cleavages at about 56° and 124° (often rounded to 60° and 120°)' },
        sheet: { r: '2 : 5', u: 'Si₂O₅²⁻', c: '−2 per 2 silicons', sh: 3, ex: 'micas (muscovite, biotite), clays, talc', cl: '1 perfect cleavage: peels into sheets' },
        framework: { r: '1 : 2', u: 'SiO₂', c: '0: no charge left', sh: 4, ex: 'quartz, feldspars', cl: 'quartz: none; feldspars: 2 at about 90°' }
      };
      var T = F.tiles([{ k: 'r', label: 'Si : O ratio', secret: true }, { k: 'c', label: 'Charge', secret: true }, { k: 'sh', label: 'Oxygens shared per tetrahedron', secret: true }, { k: 'ex', label: 'Examples', secret: true }]);
      if (!F.lock) V.seg(F.ctl, { label: 'Structure', items: [['isolated', 'Isolated'], ['chain', 'Single chain'], ['double', 'Double chain'], ['sheet', 'Sheet'], ['framework', 'Framework']], value: st, change: function (v) { st = v; F.redraw(); } });
      F.drag({ hit: function (x, y) { return geo && M.hypot(x - geo.cx, y - geo.cy) < geo.r * 1.4 ? 't' : null; }, start: function (hh, x, y) { geo.d = [x, y, yaw, pitch]; }, move: function (hh, x, y) { yaw = geo.d[2] + (x - geo.d[0]) * 0.012; pitch = clamp(geo.d[3] + (y - geo.d[1]) * 0.012, -1.4, 1.4); F.redraw(); } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; yaw += a[0] * 0.15; pitch = clamp(pitch + a[1] * 0.15, -1.4, 1.4); F.redraw(); return true; }, 'Drag the tetrahedron (or use the arrow keys) to turn it.');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, tw2 = wide ? w * 0.3 : w, th = wide ? h : h * 0.36;
        var OC = k.dark ? '#ff8787' : '#e03131', SC = k.dark ? '#74c0fc' : '#1971c2', SH = '#f59f00';
        // 3-D tetrahedron
        var cx = tw2 / 2, cy = th / 2 + 6, rr = M.min(tw2, th) * 0.3; geo = geo || {}; geo.cx = cx; geo.cy = cy; geo.r = rr;
        var V4 = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(function (v) { var x = v[0], y = v[1], z = v[2], c1 = M.cos(yaw), s1 = M.sin(yaw), x1 = x * c1 - z * s1, z1 = x * s1 + z * c1, c2 = M.cos(pitch), s2 = M.sin(pitch), y2 = y * c2 - z1 * s2, z2 = y * s2 + z1 * c2; return [cx + x1 * rr * 0.62, cy - y2 * rr * 0.62, z2]; });
        for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) line(ctx, [[V4[i][0], V4[i][1]], [V4[j][0], V4[j][1]]], { color: rgba(k.ink, 0.35), w: 1.2 });
        var items = V4.map(function (v) { return [v[2], v[0], v[1], 'O']; }).concat([[0, cx, cy, 'Si']]).sort(function (a, b) { return a[0] - b[0]; });
        items.forEach(function (it) { if (it[3] === 'Si') { line(ctx, V4.map(function (v) { return [v[0], v[1]]; }).reduce(function (acc, v) { acc.push([cx, cy], v); return acc; }, []), { color: rgba(k.ink, 0.25), w: 1 }); circle(ctx, cx, cy, rr * 0.13, SC, '#fff', 1.2); txt(ctx, 'Si', cx, cy, { size: 10, color: '#fff', bold: true, align: 'center' }); } else { var s3 = rr * (0.16 + 0.03 * it[0]); circle(ctx, it[1], it[2], s3, OC, '#fff', 1.2); txt(ctx, 'O', it[1], it[2], { size: 10, color: '#fff', bold: true, align: 'center' }); } });
        txt(ctx, 'One SiO₄ tetrahedron', cx, 14, { size: 11.5, color: k.ink, bold: true, align: 'center' });
        if (!F.quiet) txt(ctx, 'Si⁴⁺ + 4 O²⁻: +4 − 8 = −4', cx, th - 10, { size: 11, color: k.muted, align: 'center' });
        // top view of the linked tetrahedra on a honeycomb of silicon positions
        var ax = wide ? tw2 + 8 : 8, ay = wide ? 8 : th + 4, aw = wide ? w - tw2 - 16 : w - 16, ah = wide ? h - 16 : h - th - 10;
        ctx.save(); ctx.fillStyle = k.panel; rrect(ctx, ax, ay, aw, ah, 10); ctx.fill(); ctx.restore();
        var L = M.min(aw / 11, ah / 6.2), rowsAll = M.floor((ah - 20) / (1.5 * L)), cols = M.floor((aw - 20) / (L * 0.866)), x0 = ax + 10 + L * 0.5, y0 = ay + 18 + L * 0.5;
        function node(r, i) { return [x0 + i * 0.866 * L, y0 + r * 1.5 * L + (((i + r) % 2) ? 0.5 * L : 0)]; }
        var rows = st === 'chain' ? [M.floor(rowsAll / 2)] : st === 'double' ? [M.floor(rowsAll / 2) - 1, M.floor(rowsAll / 2)] : st === 'isolated' ? [] : Array.from({ length: rowsAll }, function (_, q) { return q; });
        var nodes = [];
        if (st === 'isolated') { for (var r2 = 0; r2 < rowsAll; r2 += 2) for (var i2 = (r2 / 2) % 2 ? 2 : 0; i2 < cols; i2 += 4) nodes.push([r2, i2]); }
        else rows.forEach(function (r3) { for (var i3 = 0; i3 < cols; i3++) nodes.push([r3, i3]); });
        function has(r, i) { return nodes.some(function (n) { return n[0] === r && n[1] === i; }); }
        nodes.forEach(function (n) {
          var r = n[0], i = n[1], p = node(r, i), down = ((i + r) % 2) === 1, nb = [[r, i - 1], [r, i + 1], [down ? r + 1 : r - 1, i]];
          var verts = nb.map(function (q) { var pq = node(q[0], q[1]); return [(p[0] + pq[0]) / 2, (p[1] + pq[1]) / 2, st !== 'isolated' && has(q[0], q[1])]; });
          poly(ctx, verts.map(function (v) { return [v[0], v[1]]; }), rgba(SC, 0.16), rgba(SC, 0.8), 1.2);
          verts.forEach(function (v) { circle(ctx, v[0], v[1], L * 0.11, v[2] ? SH : OC, k.bg, 1); });
          circle(ctx, p[0], p[1], L * 0.1, st === 'framework' ? SH : OC, '#fff', 1); // the top oxygen above the silicon
        });
        if (st === 'isolated') { var rq = rng(2); for (var c2 = 0; c2 < 9; c2++) { var cp = node(1 + M.floor(rq() * (rowsAll - 2)), 1 + M.floor(rq() * (cols - 2))); circle(ctx, cp[0] + L * 0.4, cp[1] + L * 0.3, L * 0.13, k.green); } }
        // legend
        var lgx = ax + 10, lgy = ay + ah - 12; circle(ctx, lgx + 4, lgy, 4, OC); txt(ctx, 'oxygen', lgx + 12, lgy, { size: 10.5, color: k.muted }); circle(ctx, lgx + 70, lgy, 4, SH); txt(ctx, 'shared oxygen', lgx + 78, lgy, { size: 10.5, color: k.muted }); if (st === 'isolated') { circle(ctx, lgx + 176, lgy, 4, k.green); txt(ctx, 'Mg²⁺ or Fe²⁺ between them', lgx + 184, lgy, { size: 10.5, color: k.muted }); }
        if (st === 'framework') txt(ctx, 'All four oxygens are shared, the top one with the layer above: a 3-D framework', ax + 10, ay + 10, { size: 10.5, color: k.ink, bold: true });
        else txt(ctx, 'Seen from above: each triangle is one tetrahedron', ax + 10, ay + 10, { size: 10.5, color: k.muted });
        var I = INFO[st]; T.r(I.r); T.c(I.u + ': ' + I.c); T.sh(String(I.sh) + (st === 'double' ? ' (2 or 3)' : '')); T.ex(I.ex);
        F.alt('A silicon–oxygen tetrahedron and a view from above of tetrahedra linked as ' + { isolated: 'isolated units', chain: 'a single chain', double: 'a double chain', sheet: 'a sheet', framework: 'a three-dimensional framework' }[st] + '.');
        F.say(F.quiet ? '' : 'Sharing oxygens links the tetrahedra and lowers the charge: <b>' + I.u + '</b>, Si : O = <b>' + I.r + '</b>, charge ' + I.c + '. Examples: ' + I.ex + '. Cleavage: ' + I.cl + '; the cleavage follows the weak bonds between the chains or sheets.', 'Sharing oxygens links the tetrahedra into chains, sheets or frameworks.');
      };
    }
  });

  /* ---------- hand-sample textures (seeded, so a rock always looks the same) ---------- */
  function rockTex(ctx, x, y, w, h, kind, seed, k) {
    var r = rng(seed || hashStr(kind)), T = ROCKTEX[kind] || ROCKTEX.granite;
    ctx.save(); rrect(ctx, x, y, w, h, M.min(10, w * 0.12)); ctx.clip();
    ctx.fillStyle = T.bg; ctx.fillRect(x, y, w, h);
    var area = w * h, i, j;
    if (T.layers) { var n = T.layers.n, lh = h / n; for (i = 0; i < n; i++) { ctx.fillStyle = T.layers.c[i % T.layers.c.length]; var wob = T.layers.wave || 0; ctx.beginPath(); ctx.moveTo(x, y + i * lh); for (j = 0; j <= 10; j++) ctx.lineTo(x + w * j / 10, y + i * lh + M.sin(j * 1.3 + i) * wob); ctx.lineTo(x + w, y + (i + 1) * lh + 1); ctx.lineTo(x, y + (i + 1) * lh + 1); ctx.closePath(); ctx.fill(); } }
    if (T.grains) { var gs = T.grains.size * w / 100, ng = M.round(area / (gs * gs) * 1.3); for (i = 0; i < ng; i++) { var gx = x + r() * w, gy = y + r() * h, s = gs * (0.5 + r() * 0.8), c = T.grains.c[M.floor(r() * T.grains.c.length)], pts = [], m = 5 + M.floor(r() * 3); for (j = 0; j < m; j++) { var a = j / m * TAU + r() * 0.5, d = s * (0.55 + r() * 0.45); pts.push([gx + d * M.cos(a), gy + d * M.sin(a)]); } poly(ctx, pts, c, T.grains.edge || null, 0.6); } }
    if (T.specks) { var ns = M.round(area / 18 * T.specks.d); for (i = 0; i < ns; i++) { ctx.fillStyle = T.specks.c[M.floor(r() * T.specks.c.length)]; var ss = T.specks.s * (0.5 + r()); ctx.fillRect(x + r() * w, y + r() * h, ss, ss); } }
    if (T.pheno) { var np = M.round(area / 900 * T.pheno.d); for (i = 0; i < np; i++) { var px = x + r() * w, py = y + r() * h, pl = T.pheno.s * w / 100 * (0.7 + r() * 0.6), an = r() * PI; ctx.save(); ctx.translate(px, py); ctx.rotate(an); ctx.fillStyle = T.pheno.c[M.floor(r() * T.pheno.c.length)]; ctx.fillRect(-pl / 2, -pl / 4, pl, pl / 2); ctx.restore(); } }
    if (T.clasts) { var cs = T.clasts.size * w / 100, nc = M.round(area / (cs * cs) * 0.7); for (i = 0; i < nc; i++) { var cx = x + r() * w, cy = y + r() * h, rr = cs * (0.4 + r() * 0.7), col = T.clasts.c[M.floor(r() * T.clasts.c.length)]; if (T.clasts.round) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * (0.6 + r() * 0.35), r() * PI, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.stroke(); } else { var p2 = []; for (j = 0; j < 4; j++) { var a2 = j / 4 * TAU + r() * 0.9; p2.push([cx + rr * M.cos(a2), cy + rr * M.sin(a2)]); } poly(ctx, p2, col, 'rgba(0,0,0,0.25)', 0.8); } } }
    if (T.shells) { var nsh = M.round(area / 700 * T.shells.d); for (i = 0; i < nsh; i++) { var sx = x + r() * w, sy = y + r() * h, sr = T.shells.s * w / 100 * (0.6 + r() * 0.6); ctx.save(); ctx.translate(sx, sy); ctx.rotate(r() * TAU); ctx.strokeStyle = T.shells.c; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(0, 0, sr, PI, TAU); ctx.closePath(); ctx.stroke(); for (j = 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sr * M.cos(PI + j * PI / 4), sr * M.sin(PI + j * PI / 4)); ctx.stroke(); } ctx.restore(); } }
    if (T.holes) { var nh = M.round(area / 160 * T.holes.d); for (i = 0; i < nh; i++) { var hx = x + r() * w, hy = y + r() * h, hr = T.holes.s * w / 100 * (0.4 + r() * 0.8); ctx.fillStyle = T.holes.c; ctx.beginPath(); ctx.ellipse(hx, hy, hr, hr * (0.6 + r() * 0.4), r() * PI, 0, TAU); ctx.fill(); } }
    if (T.foli) { ctx.strokeStyle = T.foli.c; ctx.lineWidth = T.foli.w; var nf2 = M.round(h / T.foli.gap); for (i = 0; i <= nf2; i++) { ctx.beginPath(); var yy = y + i * T.foli.gap; for (j = 0; j <= 20; j++) { var xx = x + w * j / 20; ctx.lineTo(xx, yy + T.foli.amp * M.sin(j * T.foli.f + i * 0.7)); } ctx.stroke(); } }
    if (T.cubes) { for (i = 0; i < 6; i++) { var bx = x + r() * w * 0.8, by = y + r() * h * 0.8, bs = w * (0.12 + r() * 0.12); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(bx, by, bs, bs); ctx.strokeStyle = 'rgba(150,170,180,0.8)'; ctx.strokeRect(bx, by, bs, bs); } }
    if (T.sheen) { var g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.45, 'rgba(255,255,255,' + T.sheen + ')'); g.addColorStop(0.55, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
    if (T.conch) { ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; for (i = 1; i < 4; i++) { ctx.beginPath(); ctx.arc(x + w * 0.3, y + h * 0.3, w * 0.15 * i, 0, PI / 2); ctx.stroke(); } }
    ctx.restore();
    rrect(ctx, x, y, w, h, M.min(10, w * 0.12)); ctx.strokeStyle = k.dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.stroke();
  }
  var ROCKTEX = {
    granite: { bg: '#d9c3b5', grains: { size: 9, c: ['#f0b8a0', '#f4ede6', '#c9c6c1', '#2b2725', '#e7a68c'] } },
    diorite: { bg: '#cfcfcf', grains: { size: 8, c: ['#f2f2f0', '#1f1f1f', '#e9e9e6', '#3a3a3a'] } },
    gabbro: { bg: '#4b4f4a', grains: { size: 8, c: ['#2a2d2a', '#6b706a', '#1c1e1c', '#8b938a'] } },
    peridotite: { bg: '#7f9a3a', grains: { size: 8, c: ['#8fae45', '#6d8a2c', '#a5bf5a', '#3e4a24'] } },
    rhyolite: { bg: '#d8b9ab', specks: { d: 0.5, s: 1.4, c: ['#b89383', '#efe0d6', '#8a6d62'] } },
    andesite: { bg: '#8d8f8c', specks: { d: 0.6, s: 1.3, c: ['#6d6f6c', '#a9aba7'] } },
    basalt: { bg: '#3a3b3c', specks: { d: 0.6, s: 1.2, c: ['#4d4e50', '#2a2b2c'] } },
    'porphyritic andesite': { bg: '#8d8f8c', specks: { d: 0.5, s: 1.3, c: ['#6d6f6c', '#a9aba7'] }, pheno: { d: 2.2, s: 9, c: ['#f4f4f0', '#ededE6', '#1f1f1f'] } },
    'porphyritic rhyolite': { bg: '#d8b9ab', specks: { d: 0.5, s: 1.3, c: ['#b89383', '#efe0d6'] }, pheno: { d: 2, s: 9, c: ['#f6e7dc', '#c9c6c1'] } },
    'porphyritic basalt': { bg: '#3a3b3c', specks: { d: 0.5, s: 1.2, c: ['#4d4e50'] }, pheno: { d: 1.8, s: 9, c: ['#8fae45', '#d8d8d2'] } },
    obsidian: { bg: '#141416', sheen: 0.35, conch: true },
    pumice: { bg: '#dcd9d2', holes: { d: 4, s: 2.2, c: '#9f9a90' } },
    scoria: { bg: '#6a3428', specks: { d: 0.5, s: 1.4, c: ['#7d4032', '#4a241c'] }, holes: { d: 1.2, s: 5, c: '#1c0f0c' } },
    conglomerate: { bg: '#b49a74', specks: { d: 0.6, s: 1.5, c: ['#9c8460', '#c7b08a'] }, clasts: { size: 11, round: true, c: ['#d9d2c6', '#8b7d6b', '#c2a27a', '#6f6a63', '#e6dccb'] } },
    breccia: { bg: '#a68c6a', specks: { d: 0.6, s: 1.5, c: ['#8f7656'] }, clasts: { size: 11, round: false, c: ['#d9d2c6', '#7d7368', '#c2a27a', '#5e5952'] } },
    'quartz sandstone': { bg: '#e2cf9e', specks: { d: 1.4, s: 1.7, c: ['#f4e7c3', '#c9b27a', '#efe0b8'] } },
    arkose: { bg: '#d9b28f', specks: { d: 1.4, s: 1.8, c: ['#f0c0a6', '#f4ede6', '#bf9670', '#e8a88c'] } },
    graywacke: { bg: '#6e6c66', specks: { d: 1.3, s: 1.8, c: ['#8c8a83', '#4f4d48', '#a8a59c'] } },
    siltstone: { bg: '#9d8a72', specks: { d: 0.8, s: 1, c: ['#8a7862', '#b09d84'] } },
    shale: { bg: '#4f4d4a', layers: { n: 14, c: ['#4f4d4a', '#5b5955', '#46443f'], wave: 0.6 } },
    mudstone: { bg: '#7b746b', specks: { d: 0.3, s: 1, c: ['#857e74'] } },
    limestone: { bg: '#cfccc2', specks: { d: 0.4, s: 1.2, c: ['#bdb9ad'] }, shells: { d: 0.8, s: 8, c: '#8a857a' } },
    chalk: { bg: '#f4f2ea', specks: { d: 0.2, s: 1, c: ['#e6e3d8'] } },
    coquina: { bg: '#d8c8a2', shells: { d: 3, s: 9, c: '#8f7a52' } },
    dolostone: { bg: '#d9c6b0', specks: { d: 0.6, s: 1.3, c: ['#c7b39a', '#e6d6c3'] } },
    'rock salt': { bg: '#e9eef1', cubes: true },
    'rock gypsum': { bg: '#efece4', foli: { c: 'rgba(190,180,160,0.7)', w: 1, gap: 4, amp: 0.4, f: 0.5 } },
    chert: { bg: '#7a5446', sheen: 0.18, conch: true },
    coal: { bg: '#1e1d1c', layers: { n: 8, c: ['#1e1d1c', '#2c2a28', '#141312'] }, sheen: 0.12 },
    slate: { bg: '#3f4549', foli: { c: 'rgba(120,130,135,0.6)', w: 0.8, gap: 5, amp: 0.2, f: 0.3 } },
    phyllite: { bg: '#5e6660', foli: { c: 'rgba(200,210,200,0.45)', w: 1.2, gap: 4, amp: 1.6, f: 1.4 }, sheen: 0.22 },
    schist: { bg: '#8a8a7e', foli: { c: 'rgba(230,225,200,0.7)', w: 1.6, gap: 5, amp: 2.5, f: 0.9 }, pheno: { d: 0.6, s: 6, c: ['#8a1e2a'] } },
    gneiss: { bg: '#cfc6be', layers: { n: 9, c: ['#e9e1d9', '#2e2b29', '#d8c9bd', '#454140'], wave: 3 } },
    marble: { bg: '#f1eee8', grains: { size: 6, c: ['#f7f5f0', '#e8e4dc', '#fbfaf6'], edge: 'rgba(160,150,140,0.35)' } },
    quartzite: { bg: '#e8d9cf', grains: { size: 5, c: ['#f2e6dd', '#e3cfc2', '#f7efe9'], edge: 'rgba(150,120,110,0.3)' }, sheen: 0.15 },
    hornfels: { bg: '#3d3a38', specks: { d: 0.4, s: 1, c: ['#4a4644'] } },
    anthracite: { bg: '#171717', sheen: 0.4, conch: true }
  };

  /* es-rock-cycle: Rock Cycle.
     opts:
       start: 'igneous' | 'sedimentary' | 'metamorphic' | 'magma' | 'sediment' (where the rock token starts; default 'igneous')
       paths: 'all' (every process, including shortcuts) | 'simple' (the one loop many books show)
       labels: true (process names on the arrows; default true); blank: true (arrows lettered A, B, C … instead)
       highlight: an arrow id ('cool', 'weather-i', 'weather-s', 'weather-m', 'deposit', 'meta-i', 'meta-s', 'melt-i', 'melt-s', 'melt-m')
       quiet: hides rock and process names; lock: no moving the token */
  var RC_NODES = { magma: ['Magma', 0.5, 0.86], igneous: ['Igneous rock', 0.13, 0.5], sediment: ['Sediment', 0.5, 0.12], sedimentary: ['Sedimentary rock', 0.87, 0.36], metamorphic: ['Metamorphic rock', 0.82, 0.78] };
  var RC_ARROWS = [
    ['cool', 'magma', 'igneous', 'cooling and crystallizing', 0.18, 1], ['weather-i', 'igneous', 'sediment', 'uplift, weathering and erosion', -0.18, 1], ['deposit', 'sediment', 'sedimentary', 'deposition, compaction and cementation', -0.15, 1],
    ['meta-s', 'sedimentary', 'metamorphic', 'heat and pressure', -0.2, 1], ['melt-m', 'metamorphic', 'magma', 'melting', -0.15, 1],
    ['weather-s', 'sedimentary', 'sediment', 'uplift, weathering and erosion', 0.12, 0], ['weather-m', 'metamorphic', 'sediment', 'uplift, weathering and erosion', 0.22, 0], ['meta-i', 'igneous', 'metamorphic', 'heat and pressure', 0.1, 0],
    ['melt-s', 'sedimentary', 'magma', 'melting', 0.12, 0], ['melt-i', 'igneous', 'magma', 'melting', 0.18, 0]
  ];
  R('es-rock-cycle', function (el, o) {
    var F = frame(el, o, 'The rock cycle', { aspect: 1.45, max: 520 });
    F.size({ aspect: 1.45, max: 520, narrow: 0.82 });
    var cur = RC_NODES[o.start] ? o.start : 'igneous', simple = o.paths === 'simple', blank = !!o.blank, names = o.labels !== false && !blank, hl = o.highlight || null, log = [cur], move = null, t = 1, geo = null;
    var arrows = RC_ARROWS.filter(function (a) { return !simple || a[5]; });
    var btnRow = mk('div', 'esv-btns'); F.ctl.appendChild(btnRow);
    var logEl = mk('p', 'esv-log'); F.el.insertBefore(logEl, F.statsEl); F._rows.push(logEl);
    if (!F.lock && !simple) check(F.ror = F.row(), 'Only the simple loop', false, function (v) { simple = v; arrows = RC_ARROWS.filter(function (a) { return !simple || a[5]; }); buttons(); F.redraw(); });
    function buttons() {
      btnRow.innerHTML = ''; if (F.lock) return;
      arrows.filter(function (a) { return a[1] === cur; }).forEach(function (a) { V.button(btnRow, (F.quiet || blank ? 'Arrow ' + LETTERS[arrows.indexOf(a)] : a[3].charAt(0).toUpperCase() + a[3].slice(1)) + ' →', function () { go(a); }); });
      V.button(btnRow, 'Start over', function () { log = [cur = RC_NODES[o.start] ? o.start : 'igneous']; t = 1; move = null; buttons(); F.redraw(); });
    }
    function go(a) { move = a; t = 0; log.push(a[3], a[2]); var lp = null; if (V.reduced) { t = 1; cur = a[2]; move = null; buttons(); F.redraw(); return; } lp = F.anim(function (dt) { t = M.min(1, t + dt * 0.9); F.redraw(); if (t >= 1) { lp.stop(); cur = a[2]; move = null; buttons(); F.redraw(); } }); }
    buttons();
    // node centers in px; kept away from the edges on narrow screens
    function NP(n, W2, H2) { var r = M.min(W2, H2) * 0.105; return [clamp(n[1] * W2, r * 1.3, W2 - r * 1.3), n[2] * H2]; }
    function ctrl(a, W2, H2) { var p = NP(RC_NODES[a[1]], W2, H2), q = NP(RC_NODES[a[2]], W2, H2), x1 = p[0], y1 = p[1], x2 = q[0], y2 = q[1], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1; return [x1, y1, mx - dy * a[4], my + dx * a[4], x2, y2]; }
    function bez(c, t2) { var u = 1 - t2; return [u * u * c[0] + 2 * u * t2 * c[2] + t2 * t2 * c[4], u * u * c[1] + 2 * u * t2 * c[3] + t2 * t2 * c[5]]; }
    F.draw = function () {
      var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, nr = M.min(w, h) * 0.105;
      ctx.fillStyle = k.dark ? '#18241d' : '#f7f3ea'; ctx.fillRect(0, 0, w, h);
      var LB = labeler(ctx);
      Object.keys(RC_NODES).forEach(function (nk) { var pp = NP(RC_NODES[nk], w, h); LB.reserve([pp[0] - nr * 1.2, pp[1] - nr * 0.9, nr * 2.4, nr * 1.8]); });
      arrows.forEach(function (a, i) {
        var c = ctrl(a, w, h), from = 0.2, to = 0.82, pts = []; for (var s = from; s <= to + 1e-9; s += 0.02) pts.push(bez(c, s));
        var on = hl === a[0] || (move && move[0] === a[0]), col = on ? k.rust : a[5] ? k.ink : k.muted;
        line(ctx, pts, { color: col, w: on ? 3.2 : a[5] ? 2.2 : 1.6, dash: a[5] ? [] : [6, 4] });
        var e1 = pts[pts.length - 3], e2 = pts[pts.length - 1]; arrowHead(ctx, e2[0], e2[1], M.atan2(e2[1] - e1[1], e2[0] - e1[0]), on ? 13 : 11, col);
        var mpt = bez(c, 0.5);
        if (blank || F.quiet) badge(ctx, LETTERS[i], mpt[0], mpt[1], { k: k });
        else if (names) { var lbl = w < 520 ? a[3].replace('uplift, ', '').replace('deposition, compaction and cementation', 'compaction and cementation') : a[3], lw1 = tw(ctx, lbl, { size: w < 520 ? 10 : 11 }); LB.put(lbl, clamp(mpt[0], lw1 / 2 + 3, w - lw1 / 2 - 3), mpt[1], { size: w < 520 ? 10 : 11, color: col, align: 'center', halo: k.dark ? '#18241d' : '#f7f3ea', haloW: 4 }, [0, 13, -13, 26, -26]); }
      });
      Object.keys(RC_NODES).forEach(function (nk) {
        var n = RC_NODES[nk], pp = NP(n, w, h), x = pp[0], y = pp[1], isCur = nk === cur && !move;
        ctx.save(); ctx.fillStyle = nk === 'magma' ? (k.dark ? '#5a2410' : '#ffd8c2') : nk === 'sediment' ? (k.dark ? '#4a3d22' : '#f3e3bd') : k.panel; ctx.strokeStyle = isCur ? k.rust : k.grid; ctx.lineWidth = isCur ? 3 : 1.5; rrect(ctx, x - nr * 1.15, y - nr * 0.8, nr * 2.3, nr * 1.6, 12); ctx.fill(); ctx.stroke(); ctx.restore();
        var tk = { magma: null, igneous: 'granite', sediment: null, sedimentary: 'quartz sandstone', metamorphic: 'gneiss' }[nk];
        if (tk) rockTex(ctx, x - nr * 0.5, y - nr * 0.62, nr, nr * 0.62, tk, 3, k);
        else if (nk === 'magma') { var g = ctx.createRadialGradient(x, y - nr * 0.3, 2, x, y - nr * 0.3, nr * 0.55); g.addColorStop(0, '#ffd43b'); g.addColorStop(1, '#e8590c'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y - nr * 0.3, nr * 0.55, nr * 0.32, 0, 0, TAU); ctx.fill(); }
        else { var r2 = rng(8); for (var q = 0; q < 26; q++) circle(ctx, x - nr * 0.5 + r2() * nr, y - nr * 0.55 + r2() * nr * 0.5, 1.5 + r2() * 2.5, ['#c2a27a', '#8b7d6b', '#e6dccb'][q % 3]); }
        var nm2 = F.quiet ? '?' : n[0]; if (w < 520 && nm2.indexOf(' ') > 0) { txt(ctx, nm2.split(' ')[0], x, y + nr * 0.28, { size: 10, color: k.ink, bold: true, align: 'center' }); txt(ctx, nm2.split(' ')[1], x, y + nr * 0.62, { size: 10, color: k.ink, bold: true, align: 'center' }); } else txt(ctx, nm2, x, y + nr * 0.42, { size: w < 520 ? 10.5 : 12, color: k.ink, bold: true, align: 'center' });
      });
      // the token
      var tp; if (move) tp = bez(ctrl(move, w, h), 0.2 + 0.6 * t); else { var cn = NP(RC_NODES[cur], w, h); tp = [cn[0] + nr * 1.0, cn[1] - nr * 0.7]; }
      circle(ctx, tp[0], tp[1], 9, '#ffd43b', '#7a5a00', 2); circle(ctx, tp[0] - 2.5, tp[1] - 2.5, 2.5, 'rgba(255,255,255,0.8)');
      logEl.innerHTML = 'Path: ' + log.map(function (s, i) { return i % 2 ? '<span>' + (F.quiet ? '…' : esc(s)) + '</span> → ' : '<b>' + (F.quiet ? '?' : esc(RC_NODES[s][0])) + '</b>' + (i < log.length - 1 ? ' → ' : ''); }).join('');
      F.alt('The rock cycle: magma, igneous rock, sediment, sedimentary rock and metamorphic rock, joined by arrows for ' + (F.quiet ? 'processes' : 'cooling, weathering and erosion, deposition and cementation, heat and pressure, and melting') + '. A token marks the current rock' + (F.quiet ? '.' : ': ' + RC_NODES[cur][0] + '.'));
      F.say('Rocks take many paths: igneous rock can be squeezed into metamorphic rock without ever becoming sediment, and metamorphic rock can be worn into sediment without melting. There is no fixed order. Move the token along any arrow.', 'There is no fixed order: rocks can take any path around the cycle.');
    };
    F.redraw();
    return { destroy: F.reset };
  });

  /* es-igneous: Cooling Magma.
     opts:
       mode: 'cool' | 'bowen' | 'silica'      modes: true or a list for tabs
       setting: 'pluton' | 'dike' | 'lava' | 'water' (deep pluton, shallow dike, lava on land, lava in water); rate: 0–4 (cooling rate index)
       twoStage: true (slow, then fast: porphyritic); gas: true (bubbles: vesicular)
       temp: °C (bowen, 600–1300); goldich: true (bowen: show weathering order instead)
       silica: % SiO₂ (silica mode, 40–77)
       quiet: hides the texture name, mineral names, class name and readouts; lock */
  var SETTINGS = { pluton: ['Deep pluton', 0.3], dike: ['Shallow dike', 1.5], lava: ['Lava on land', 2.6], water: ['Lava in water', 3.9] };
  var BOWEN_D = [['olivine', 1250], ['pyroxene', 1150], ['amphibole', 1000], ['biotite', 900]], BOWEN_C = [['Ca-rich plagioclase', 1250], ['Na-rich plagioclase', 950]], BOWEN_L = [['orthoclase (K-feldspar)', 750], ['muscovite', 700], ['quartz', 650]];
  R('es-igneous', function (el, o) {
    var F = frame(el, o, 'Cooling magma', { aspect: 1.6, max: 440 });
    return F.modes({ cool: cool, bowen: bowen, silica: silica }, { cool: 'Cooling and crystals', bowen: 'Bowen’s series', silica: 'Silica and magma' });

    function cool(F) {
      F.size({ aspect: 1.7, max: 400, narrow: 1.0 });
      var set = SETTINGS[o.setting] ? o.setting : 'pluton', rate = o.rate != null ? clamp(num(o.rate, 1), 0, 4) : SETTINGS[set][1], two = !!o.twoStage, gas = o.gas != null ? !!o.gas : false, prog = 1, crystals = null;
      var T = F.tiles([{ k: 'tex', label: 'Texture', secret: true }, { k: 'size', label: 'Typical crystal size', secret: true }, { k: 'time', label: 'Cools in about', secret: true }]);
      var seg = V.seg(F.ctl, { label: 'Setting', items: Object.keys(SETTINGS).map(function (s) { return [s, SETTINGS[s][0]]; }), value: set, change: function (v) { set = v; rate = SETTINGS[v][1]; rs.set(rate); grow(); } });
      var rs = V.slider(F.ctl, { label: 'Cooling rate', min: 0, max: 4, step: 0.1, value: rate, fmt: function (v) { return v < 1 ? 'very slow' : v < 2 ? 'slow' : v < 3 ? 'fast' : 'very fast'; }, input: function (v) { rate = v; grow(); } });
      var row = F.row(); check(row, 'Two stages: slow, then fast', two, function (v) { two = v; grow(); }); check(row, 'Gas bubbles', gas, function (v) { gas = v; grow(); });
      var pl = F.player(row, function (dt) { prog = M.min(1, prog + dt * 0.35); F.redraw(); if (prog >= 1) return false; }, { label: 'Cool it', reset: function () { prog = 0; } });
      var N = 110; // grid cells across a 20 mm view
      function grow() { // Johnson–Mehl style: nuclei appear at random times and grow at a fixed speed until the melt freezes
        var r = rng(17), cells = new Int32Array(N * N).fill(-1), tarr = new Float32Array(N * N).fill(9), nuc = [];
        function seed(n, t0, t1, big) { for (var i = 0; i < n; i++) { var th = r() * PI; nuc.push([r() * N, r() * N, t0 + r() * (t1 - t0), M.floor(r() * 6), big, M.cos(th), M.sin(th), 1 + r() * 1.2]); } }
        var Ts = 1; // the melt is solid at time 1
        if (two) { seed(7, 0, 0.1, true); } else seed(M.round(6 * M.pow(10, rate * 0.75)), 0, 0.4);
        var gr = rate < 3 ? 1 : M.max(0.1, 1 - (rate - 3) * 1.1), Gs = two ? 22 : N / M.sqrt(M.max(1, nuc.length)) * 1.3 * gr; // fast enough to fill the space unless the melt is quenched
        // spatial hash for speed
        var B = 10, bins = {}; nuc.forEach(function (n, i) { var key = M.floor(n[0] / B) + ',' + M.floor(n[1] / B); (bins[key] = bins[key] || []).push(i); });
        var reach = M.ceil(Gs * Ts / B) + 1;
        for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
          var best = 9, bi = -1, bx = M.floor(x / B), by = M.floor(y / B);
          for (var dy = -reach; dy <= reach; dy++) for (var dx = -reach; dx <= reach; dx++) { var lst = bins[(bx + dx) + ',' + (by + dy)]; if (!lst) continue; for (var q = 0; q < lst.length; q++) { var n = nuc[lst[q]], ddx = x - n[0], ddy = y - n[1], d = M.max(M.abs(ddx * n[5] + ddy * n[6]), M.abs(-ddx * n[6] + ddy * n[5]) * n[7]) * 1.15, ta = n[2] + d / Gs; /* blocky crystals: rectangles of random shape and angle */ if (ta < best) { best = ta; bi = lst[q]; } } }
          var stop = two ? 0.55 : Ts; if (best <= stop) { cells[y * N + x] = bi; tarr[y * N + x] = best; }
        }
        if (two) { // second stage: fast cooling fills the rest with tiny crystals
          var r3 = rng(29); for (var j = 0; j < N * N; j++) if (cells[j] < 0) { cells[j] = -10 - M.floor(r3() * 5); tarr[j] = 0.55 + r3() * 0.45; }
        }
        var holes = []; if (gas) { var r4 = rng(31); for (var hh = 0; hh < 14; hh++) holes.push([r4() * N, r4() * N, 2 + r4() * 6]); }
        var filled = 0, per = {}; for (j = 0; j < N * N; j++) { if (cells[j] !== -1) filled++; if (cells[j] >= 0) per[cells[j]] = (per[cells[j]] || 0) + 1; }
        var sizes = Object.keys(per).map(function (q) { return 2 * M.sqrt(per[q] / PI) * 20 / N; }), meanD = sizes.length ? sizes.reduce(function (a, b) { return a + b; }, 0) / sizes.length : 0;
        crystals = { cells: cells, t: tarr, nuc: nuc, holes: holes, frac: filled / (N * N), meanD: meanD };
        prog = 1; F.redraw();
      }
      var MIN = ['#f0b8a0', '#e7a68c', '#f4ede6', '#c9c6c1', '#d6d2cc', '#2b2725'];
      F.draw = function () {
        if (!crystals) return;
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, sz = M.min(h - 30, w * 0.5), x0 = 14, y0 = (h - sz) / 2 + 4, cs = sz / N;
        var tnow = prog * 1.0;
        ctx.save(); ctx.beginPath(); ctx.arc(x0 + sz / 2, y0 + sz / 2, sz / 2, 0, TAU); ctx.clip();
        ctx.fillStyle = prog < 1 ? '#ff8c42' : '#1e1e22'; ctx.fillRect(x0, y0, sz, sz); // melt (orange) or glass (black)
        for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) { var j = y * N + x, c = crystals.cells[j]; if (c === -1 || crystals.t[j] > tnow) continue; ctx.fillStyle = c <= -10 ? ['#b7aaa2', '#8d817a', '#cfc4bc', '#6f655f', '#a69890'][-10 - c] : MIN[crystals.nuc[c][3]]; ctx.fillRect(x0 + x * cs, y0 + y * cs, cs + 0.6, cs + 0.6); }
        // crystal edges
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.6; ctx.beginPath();
        for (y = 0; y < N - 1; y++) for (x = 0; x < N - 1; x++) { var a = crystals.cells[y * N + x]; if (a < 0 || crystals.t[y * N + x] > tnow) continue; if (a !== crystals.cells[y * N + x + 1] && crystals.cells[y * N + x + 1] >= 0) { ctx.moveTo(x0 + (x + 1) * cs, y0 + y * cs); ctx.lineTo(x0 + (x + 1) * cs, y0 + (y + 1) * cs); } if (a !== crystals.cells[(y + 1) * N + x] && crystals.cells[(y + 1) * N + x] >= 0) { ctx.moveTo(x0 + x * cs, y0 + (y + 1) * cs); ctx.lineTo(x0 + (x + 1) * cs, y0 + (y + 1) * cs); } }
        ctx.stroke();
        crystals.holes.forEach(function (hh) { circle(ctx, x0 + hh[0] * cs, y0 + hh[1] * cs, hh[2] * cs, k.dark ? '#0b0b0c' : '#f2efe8', 'rgba(0,0,0,0.4)', 1); });
        ctx.restore(); circle(ctx, x0 + sz / 2, y0 + sz / 2, sz / 2, null, k.axis, 1.5);
        line(ctx, [[x0 + 6, y0 + sz - 6], [x0 + 6 + sz / 4, y0 + sz - 6]], { color: '#fff', w: 3, cap: 'butt' }); txt(ctx, '5 mm', x0 + 10 + sz / 4, y0 + sz - 6, { size: 10.5, color: '#fff', halo: 'rgba(0,0,0,0.6)' });
        // the setting picture
        var px = x0 + sz + 20, pw = w - px - 10, ph = h - 20;
        ctx.save(); ctx.fillStyle = k.sky; ctx.fillRect(px, 10, pw, ph * 0.3); ctx.fillStyle = k.crust; ctx.fillRect(px, 10 + ph * 0.3, pw, ph * 0.7); ctx.restore();
        var spot = { pluton: [0.5, 0.82, 0.22], dike: [0.5, 0.55, 0.06], lava: [0.5, 0.31, 0.3], water: [0.5, 0.31, 0.3] }[set];
        if (set === 'water') { ctx.fillStyle = rgba(k.blue, 0.55); ctx.fillRect(px, 10, pw * 0.6, ph * 0.3); }
        ctx.fillStyle = '#e8590c'; if (set === 'dike') ctx.fillRect(px + pw * 0.47, 10 + ph * 0.32, pw * 0.06, ph * 0.5); else if (set === 'pluton') { ctx.beginPath(); ctx.ellipse(px + pw * 0.5, 10 + ph * 0.8, pw * 0.25, ph * 0.13, 0, 0, TAU); ctx.fill(); } else { ctx.beginPath(); ctx.ellipse(px + pw * 0.5, 10 + ph * 0.3, pw * 0.32, ph * 0.03, 0, 0, TAU); ctx.fill(); }
        if (!F.quiet) txt(ctx, SETTINGS[set][0], px + pw / 2, 10 + ph * 0.3 - 10, { size: 12, color: k.ink, align: 'center', bold: true, halo: k.halo });
        var dmm = crystals.meanD, glassy = !two && crystals.frac < 0.6;
        var tex = gas && (set === 'lava' || set === 'water' || rate > 2) ? (glassy ? 'vesicular, glassy (like pumice)' : 'vesicular (bubble holes)') : two ? 'porphyritic: big crystals in a fine background' : glassy ? 'glassy: no crystals had time to form' : dmm >= 1 ? 'coarse-grained (phaneritic)' : 'fine-grained (aphanitic)';
        T.tex(tex); T.size(glassy ? 'none' : two ? 'big ones about ' + fm(dmm, 0) + ' mm, the rest under 1 mm' : dmm >= 1 ? 'about ' + fm(dmm, dmm < 10 ? 1 : 0) + ' mm' : 'under 1 mm'); T.time(rate < 1 ? 'tens of thousands of years or more' : rate < 2 ? 'years to centuries' : rate < 3 ? 'days to years' : 'seconds to minutes');
        F.alt('A magnified slice of cooled magma, about 20 mm across' + (F.quiet ? '' : ': ' + tex) + '.');
        F.say('Crystals need time to grow. Slow cooling deep underground lets a few crystals grow large (<b>coarse-grained</b>, like granite); fast cooling at the surface starts many crystals that stay small (<b>fine-grained</b>, like basalt); lava chilled in seconds can freeze as <b>glass</b>. Now: <b>' + tex + '</b>.', 'Slow cooling makes big crystals; fast cooling makes small ones or glass.');
      };
      grow();
    }

    function bowen(F) {
      F.size({ aspect: 1.6, max: 420, narrow: 0.9 });
      var T0 = clamp(num(o.temp, 1300), 600, 1300), gold = !!o.goldich;
      var T = F.tiles([{ k: 't', label: 'Temperature', secret: false }, { k: 'melt', label: 'Silica in the remaining melt', secret: true }, { k: 'nw', label: 'Crystallizing now', secret: true }]);
      var ts = V.slider(F.ctl, { label: 'Temperature', min: 600, max: 1300, step: 10, value: T0, fmt: function (v) { return nf(v) + ' °C'; }, input: function (v) { T0 = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { T0 = M.max(600, T0 - dt * 120); ts.set(T0); F.redraw(); if (T0 <= 600) return false; }, { label: 'Cool the magma', reset: function () { if (T0 <= 600) T0 = 1300; } });
      check(row, 'Show weathering order (Goldich)', gold, function (v) { gold = v; F.redraw(); });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; T0 = clamp(T0 + (a[1] || -a[0]) * 20, 600, 1300); ts.set(T0); F.redraw(); return true; }, 'Arrow keys change the temperature.');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, top = 30, bot = h - 40;
        function Y(t) { return top + (1300 - t) / 700 * (bot - top); }
        // temperature axis
        line(ctx, [[46, top], [46, bot]], { color: k.axis, w: 1.5 }); [1300, 1100, 900, 700].forEach(function (t) { txt(ctx, nf(t) + '°', 40, Y(t), { size: 10.5, color: k.muted, align: 'right' }); line(ctx, [[46, Y(t)], [w - 10, Y(t)]], { color: k.grid, w: 1 }); });
        line(ctx, [[46, Y(T0)], [w - 10, Y(T0)]], { color: k.rust, w: 2, dash: [5, 4] });
        var lx = w * 0.3, rx = w * 0.72, mx = w * 0.51, LBL = labeler(ctx);
        function nodeAt(nm, x, t, on) { var y = Y(t); ctx.save(); ctx.fillStyle = on ? (k.dark ? '#3a2a14' : '#fff4dc') : k.panel; ctx.strokeStyle = on ? k.rust : k.grid; ctx.lineWidth = on ? 2.2 : 1.2; var tw2 = M.max(70, tw(ctx, nm, { size: 11.5, bold: true }) + 18); rrect(ctx, x - tw2 / 2, y - 13, tw2, 26, 13); ctx.fill(); ctx.stroke(); ctx.restore(); txt(ctx, F.quiet && !gold ? '?' : nm, x, y, { size: 11.5, color: on ? k.ink : k.muted, bold: on, align: 'center' }); }
        if (!gold) {
          BOWEN_D.forEach(function (m, i) { if (i) arrow(ctx, lx, Y(BOWEN_D[i - 1][1]) + 14, lx, Y(m[1]) - 15, { color: k.muted, w: 1.5, head: 7 }); });
          var pg = ctx.createLinearGradient(0, Y(1250), 0, Y(950)); pg.addColorStop(0, k.dark ? '#7d8a99' : '#9aa7b6'); pg.addColorStop(1, k.dark ? '#d9dde0' : '#eef1f3'); ctx.fillStyle = pg; ctx.fillRect(rx - 5, Y(1250) + 13, 10, Y(950) - Y(1250) - 26);
          if (T0 <= 1250 && T0 >= 950) { circle(ctx, rx, Y(T0), 6, k.rust, k.bg, 2); }
          BOWEN_D.forEach(function (m) { nodeAt(m[0], lx, m[1], T0 <= m[1]); }); BOWEN_C.forEach(function (m) { nodeAt(m[0], rx, m[1], T0 <= m[1]); });
          BOWEN_L.forEach(function (m) { nodeAt(m[0], mx, m[1], T0 <= m[1]); });
          if (!F.quiet) { txt(ctx, 'one mineral changes into the next', lx, top - 14, { size: 11, color: k.muted, align: 'center' }); txt(ctx, 'plagioclase changes gradually', rx, top - 14, { size: 11, color: k.muted, align: 'center' }); }
        } else {
          var order = [['olivine', 'weathers fastest'], ['pyroxene', ''], ['amphibole', ''], ['biotite', ''], ['orthoclase (K-feldspar)', ''], ['muscovite', ''], ['quartz', 'most stable at the surface']];
          order.forEach(function (m, i) { var y = top + i * (bot - top) / 6; nodeAt(m[0], w * 0.45, 1300 - i * 700 / 6, true); if (m[1]) txt(ctx, m[1], w * 0.45 + 90, y, { size: 11, color: k.rust }); });
          txt(ctx, 'Weathering at Earth’s surface: first to crystallize, first to break down', w * 0.45, top - 14, { size: 11, color: k.muted, align: 'center' });
        }
        var melt = interp([[600, 76], [650, 75], [700, 72], [900, 62], [1100, 54], [1300, 48]], T0), now = BOWEN_D.concat(BOWEN_L).filter(function (m) { return T0 <= m[1] && T0 > m[1] - 160; }).map(function (m) { return m[0]; }); if (T0 <= 1250 && T0 >= 860) now.push('plagioclase (more sodium as it cools)');
        T.t(nf(T0) + ' °C'); T.melt('about ' + fm(melt, 0) + '% SiO₂'); T.nw(now.length ? now.join(', ') : 'nothing yet');
        F.alt(gold ? 'The weathering order of common minerals: olivine weathers fastest and quartz is most stable at the surface, the reverse of the order they crystallize.' : 'Bowen’s reaction series at ' + nf(T0) + ' degrees C: minerals crystallize in order as magma cools' + (F.quiet ? '.' : '; so far: ' + BOWEN_D.concat(BOWEN_C, BOWEN_L).filter(function (m) { return T0 <= m[1]; }).map(function (m) { return m[0]; }).join(', ') + '.'));
        F.say(gold ? 'Minerals that crystallize at the highest temperatures are the least stable at Earth’s cool, wet surface: olivine weathers fastest; quartz, last to crystallize, lasts longest.' : 'As magma cools, minerals crystallize over a range of temperatures, not all at once, and the leftover melt grows richer in silica: about <b>' + fm(melt, 0) + '%</b> now. Temperatures are approximate.', 'Minerals crystallize in order as magma cools.');
      };
    }

    function silica(F) {
      F.size({ aspect: 1.8, max: 380, narrow: 1.0 });
      var si = clamp(num(o.silica, 50), 40, 77), flow = 0;
      var T = F.tiles([{ k: 'cls', label: 'Class', secret: true }, { k: 't', label: 'Typical eruption temperature', secret: true }, { k: 'v', label: 'Viscosity', secret: true }, { k: 'm', label: 'Common minerals', secret: true }]);
      var ss = V.slider(F.ctl, { label: 'Silica (SiO₂)', min: 40, max: 77, step: 0.5, value: si, fmt: function (v) { return fm(v, 1) + '%'; }, input: function (v) { si = v; F.redraw(); } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; si = clamp(si + (a[0] || -a[1]), 40, 77); ss.set(si); F.redraw(); return true; }, 'Arrow keys change the silica.');
      var row = F.row(); F.player(row, function (dt) { flow += dt; F.redraw(); }, { label: 'Pour it', auto: false });
      function cls(s) { return s < 45 ? ['ultramafic', 'about 1,400 °C or more (rare as lava today)', 'olivine, pyroxene', 'peridotite', '#3e4a24'] : s < 52 ? ['mafic', 'about 1,000–1,200 °C', 'pyroxene, calcium-rich plagioclase, some olivine', 'basalt and gabbro', '#2f3133'] : s < 63 ? ['intermediate', 'about 800–1,000 °C', 'amphibole, plagioclase, some biotite', 'andesite and diorite', '#7d7f7c'] : ['felsic', 'about 650–800 °C', 'quartz, K-feldspar, sodium-rich plagioclase, micas', 'rhyolite and granite', '#d8b9ab']; }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, c = cls(si);
        // scale bar
        var x0 = 20, x1 = w - 20, by = 30; function X(s) { return x0 + (s - 40) / 37 * (x1 - x0); }
        [[40, 45, '#3e4a24', 'ultramafic'], [45, 52, '#2f3133', 'mafic'], [52, 63, '#7d7f7c', 'intermediate'], [63, 77, '#d8b9ab', 'felsic']].forEach(function (b) { ctx.fillStyle = b[2]; ctx.fillRect(X(b[0]), by, X(b[1]) - X(b[0]), 22); if (!F.quiet) txt(ctx, b[3], (X(b[0]) + X(b[1])) / 2, by + 11, { size: 11, color: b[0] < 60 ? '#fff' : '#3a2a20', bold: true, align: 'center' }); });
        [40, 45, 52, 63, 77].forEach(function (s) { txt(ctx, s + '%', X(s), by + 34, { size: 10.5, color: k.muted, align: 'center' }); });
        var mk2 = X(si); poly(ctx, [[mk2, by - 2], [mk2 - 7, by - 12], [mk2 + 7, by - 12]], k.rust);
        txt(ctx, 'darker, hotter, runnier', x0, by - 16, { size: 10.5, color: k.muted }); txt(ctx, 'lighter, cooler, stickier', x1, by - 16, { size: 10.5, color: k.muted, align: 'right' });
        // a blob of magma flowing down a ramp: speed falls with viscosity
        var logv = interp([[40, 0.5], [45, 1], [50, 2], [55, 4], [60, 6], [65, 8], [70, 9.5], [77, 11]], si); // log10 viscosity in Pa·s, rough
        var ry = by + 70, rh = h - ry - 16, sp = M.pow(10, -logv / 3.2) * 0.9, run = M.min(1, (flow * sp) % 1.4);
        ctx.fillStyle = k.rockLight; ctx.beginPath(); ctx.moveTo(20, ry); ctx.lineTo(w - 20, ry + rh * 0.8); ctx.lineTo(w - 20, ry + rh); ctx.lineTo(20, ry + rh); ctx.closePath(); ctx.fill();
        var lx = 20 + (w - 60) * run, ly = ry + rh * 0.8 * run / 1 * (w - 60) / (w - 40);
        var g = ctx.createLinearGradient(20, 0, lx + 30, 0); g.addColorStop(0, '#ffd43b'); g.addColorStop(1, '#e8590c'); ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(20, ry - 4); ctx.lineTo(lx + 20, ry - 6 + (lx - 20) / (w - 40) * rh * 0.8); ctx.quadraticCurveTo(lx + 40, ry + (lx) / (w - 40) * rh * 0.8, lx + 14, ry + 10 + (lx) / (w - 40) * rh * 0.8); ctx.lineTo(20, ry + 14); ctx.closePath(); ctx.fill();
        txt(ctx, 'viscosity about 10' + sup(M.round(logv)) + ' Pa·s', w - 24, ry - 10, { size: 11, color: k.ink, align: 'right', bold: true });
        T.cls(c[0] + ' (' + c[3] + ')'); T.t(c[1]); T.v(logv < 3 ? 'runny' : logv < 7 ? 'thick' : 'very sticky'); T.m(c[2]);
        F.alt('A silica scale from 40 to 77 percent with magma classes' + (F.quiet ? '' : '; the marker is at ' + fm(si, 1) + ' percent: ' + c[0]) + '. A sample of lava flows down a slope, faster when it is runny.');
        F.say('More silica means stickier magma: silica builds chains and networks in the melt. Sticky, gas-rich felsic magma tends to explode; hot, runny basalt usually pours out gently, so the hottest lava is not the most explosive. At <b>' + fm(si, 1) + '%</b>: <b>' + c[0] + '</b>.', 'More silica: cooler, stickier magma that traps gas.');
      };
    }
  });

  /* es-rock-key: Rock Identification Keys.
     opts:
       mode: 'igneous' | 'sedimentary' | 'metamorphic'      modes: true or a list for tabs
       highlight: a rock name (its cell is marked); sample: a rock name (draw only that hand sample, for "name this rock")
       blank: true (hide the names in the grid); quiet: hides every name; lock */
  R('es-rock-key', function (el, o) {
    var F = frame(el, o, 'Rock identification', { aspect: 1.4, max: 560 });
    if (o.sample) { // one big hand sample
      F.size({ aspect: 1.9, max: 260, narrow: 1.4 });
      F.draw = function () { var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, sw = M.min(w * 0.6, h * 1.6); rockTex(ctx, (w - sw) / 2, 10, sw, h - 20, o.sample, 11, k); if (!F.quiet && !o.blank) txt(ctx, o.sample, w / 2, h - 8, { size: 13, color: k.ink, bold: true, align: 'center', halo: k.halo }); F.alt('A hand sample of rock' + (F.quiet ? '.' : ': ' + o.sample + '.')); };
      F.redraw(); return { destroy: F.reset };
    }
    return F.modes({ igneous: ign, sedimentary: sed, metamorphic: met }, { igneous: 'Igneous', sedimentary: 'Sedimentary', metamorphic: 'Metamorphic' });
    function nm(s) { return F.quiet || o.blank ? '?' : s; }
    function cell(ctx, k, x, y, w2, h2, rock, hl) {
      if (!rock) { txt(ctx, '—', x + w2 / 2, y + h2 / 2, { size: 12, color: k.muted, align: 'center' }); return; }
      var th = h2 - 18; rockTex(ctx, x + 3, y + 3, w2 - 6, th - 3, rock, 5, k);
      var lab = nm(rock), fs = w2 < 80 ? 9.5 : 11; if (tw(ctx, lab, { size: fs, bold: hl }) > w2 - 2 && lab.indexOf(' ') > 0) { var sp = lab.split(' '); txt(ctx, sp[0], x + w2 / 2, y + h2 - 15, { size: fs - 0.5, color: hl ? k.rust : k.ink, bold: hl, align: 'center' }); txt(ctx, sp.slice(1).join(' '), x + w2 / 2, y + h2 - 4, { size: fs - 0.5, color: hl ? k.rust : k.ink, bold: hl, align: 'center' }); } else txt(ctx, lab, x + w2 / 2, y + h2 - 8, { size: fs, color: hl ? k.rust : k.ink, bold: hl, align: 'center' });
      if (hl) { ctx.save(); ctx.strokeStyle = k.rust; ctx.lineWidth = 3; rrect(ctx, x, y, w2, h2, 8); ctx.stroke(); ctx.restore(); }
    }
    function ign(F) {
      F.size({ aspect: 1.25, max: 600, narrow: 0.82 });
      var cols = ['felsic', 'intermediate', 'mafic', 'ultramafic'], rows = [['coarse', ['granite', 'diorite', 'gabbro', 'peridotite']], ['fine', ['rhyolite', 'andesite', 'basalt', null]], ['porphyritic', ['porphyritic rhyolite', 'porphyritic andesite', 'porphyritic basalt', null]], ['glassy', ['obsidian', null, null, null]], ['vesicular', ['pumice', null, 'scoria', null]]];
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, lw = w < 520 ? 66 : 92, top = 34, cw = (w - lw - 8) / 4, ch = (h - top - 30) / 5;
        cols.forEach(function (c, i) { txt(ctx, c, lw + cw * (i + 0.5), top - 18, { size: w < 520 ? 10.5 : 12, color: k.ink, bold: true, align: 'center' }); });
        txt(ctx, 'light-colored ← composition → dark', lw + cw * 2, h - 12, { size: 11, color: k.muted, align: 'center' });
        rows.forEach(function (r, j) { txt(ctx, r[0], 6, top + ch * (j + 0.5), { size: w < 520 ? 10.5 : 12, color: k.ink, bold: true }); r[1].forEach(function (rock, i) { cell(ctx, k, lw + cw * i, top + ch * j, cw, ch, rock, o.highlight === rock); }); });
        F.alt('A grid of igneous rocks by texture (rows: coarse, fine, porphyritic, glassy, vesicular) and composition (columns: felsic, intermediate, mafic, ultramafic).');
        F.say('Texture tells where it cooled: coarse crystals deep underground, fine ones at the surface. Composition tells what it’s made of. Granite and rhyolite share a composition but cooled in different places, so color alone can’t name a rock.', 'Rows: texture. Columns: composition.');
      };
    }
    function sed(F) {
      F.size({ aspect: 1.25, max: 600, narrow: 0.75 });
      var clastic = [['over 2 mm, rounded', 'conglomerate'], ['over 2 mm, angular', 'breccia'], ['sand, mostly quartz', 'quartz sandstone'], ['sand with feldspar', 'arkose'], ['sand in dark mud', 'graywacke'], ['silt', 'siltstone'], ['clay, splits in layers', 'shale'], ['clay, blocky', 'mudstone']];
      var chem = [['calcite, often shells', 'limestone'], ['tiny calcite shells', 'chalk'], ['shell pieces', 'coquina'], ['dolomite', 'dolostone'], ['halite', 'rock salt'], ['gypsum', 'rock gypsum'], ['microscopic quartz', 'chert'], ['plant remains', 'coal']];
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, colW = wide ? (w - 24) / 2 : w - 16, rowsN = wide ? 8 : 16, rh = (h - 40) / rowsN;
        function block(list, x0, y0, title) { txt(ctx, title, x0, y0 - 12, { size: 12, color: k.ink, bold: true }); list.forEach(function (it, i) { var y = y0 + i * rh, sw = M.min(rh * 1.6, colW * 0.3); rockTex(ctx, x0, y + 2, sw, rh - 4, it[1], 6, k); txt(ctx, nm(it[1]), x0 + sw + 8, y + rh * 0.36, { size: 12, color: o.highlight === it[1] ? k.rust : k.ink, bold: true }); txt(ctx, it[0], x0 + sw + 8, y + rh * 0.72, { size: 10.5, color: k.muted }); }); }
        if (wide) { block(clastic, 8, 32, 'Clastic: by grain size'); block(chem, 16 + colW, 32, 'Chemical and biochemical: by what it’s made of'); }
        else { block(clastic, 8, 32, 'Clastic: by grain size'); block(chem, 8, 32 + 8 * rh + 18, 'Chemical and biochemical'); }
        F.alt('Sedimentary rocks: clastic rocks named by grain size and shape, and chemical and biochemical rocks named by what they are made of.');
        F.say('Clastic rocks are pieces of older rock, named by grain size (and shape: rounded conglomerate, angular breccia). Chemical and biochemical rocks form from dissolved minerals or from living things: most limestone is calcite from shells and skeletons, not cemented sand.', 'Clastic: by grain size. Chemical and biochemical: by makeup.');
      };
    }
    function met(F) {
      F.size({ aspect: 1.5, max: 520, narrow: 0.8 });
      var fol = ['slate', 'phyllite', 'schist', 'gneiss'], non = [['limestone', 'marble'], ['quartz sandstone', 'quartzite'], ['shale', 'hornfels'], ['coal', 'anthracite']];
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, top = 30, half = (h - top) * 0.4, sw = M.min((w - 40) / 5.4, half * 1.1);
        txt(ctx, 'Foliated: one parent, rising grade', 8, 14, { size: 12, color: k.ink, bold: true });
        var y1 = top + 8; rockTex(ctx, 8, y1, sw, sw * 0.7, 'shale', 6, k); txt(ctx, nm('shale'), 8 + sw / 2, y1 + sw * 0.7 + 12, { size: 11, color: k.muted, align: 'center' });
        fol.forEach(function (r, i) { var x = 8 + (i + 1) * (sw + (w - 16 - 5 * sw) / 4); arrow(ctx, x - (w - 16 - 5 * sw) / 4 + 4, y1 + sw * 0.35, x - 4, y1 + sw * 0.35, { color: k.rust, w: 2, head: 8 }); rockTex(ctx, x, y1, sw, sw * 0.7, r, 6, k); txt(ctx, nm(r), x + sw / 2, y1 + sw * 0.7 + 12, { size: 11.5, color: o.highlight === r ? k.rust : k.ink, bold: true, align: 'center' }); });
        txt(ctx, 'more heat and pressure: bigger mica crystals, then bands →', w - 8, y1 + sw * 0.7 + 30, { size: 10.5, color: k.rust, align: 'right' });
        var y2 = top + half + 26; txt(ctx, 'Non-foliated: from their parents', 8, y2 - 14, { size: 12, color: k.ink, bold: true });
        var colw = (w - 16) / 2, rowH = (h - y2 - 8) / 2, sw2 = M.min(colw * 0.34, rowH * 0.95);
        non.forEach(function (p, i) { var x = 8 + (i % 2) * colw, yy = y2 + 2 + M.floor(i / 2) * rowH, sh = M.min(sw2 * 0.62, rowH - 22); rockTex(ctx, x, yy, sw2, sh, p[0], 6, k); arrow(ctx, x + sw2 + 4, yy + sh / 2, x + colw - sw2 - 12, yy + sh / 2, { color: k.rust, w: 1.8, head: 8 }); rockTex(ctx, x + colw - sw2 - 8, yy, sw2, sh, p[1], 6, k); txt(ctx, nm(p[0]), x + sw2 / 2, yy + sh + 11, { size: 10.5, color: k.muted, align: 'center' }); txt(ctx, nm(p[1]), x + colw - sw2 / 2 - 8, yy + sh + 11, { size: 11.5, color: o.highlight === p[1] ? k.rust : k.ink, bold: true, align: 'center' }); if (!F.quiet && !o.blank && p[1] === 'hornfels') txt(ctx, 'baked by magma', (x + sw2 + x + colw - sw2) / 2 - 4, yy + sh / 2 - 10, { size: 10, color: k.muted, align: 'center' }); });
        F.alt('Metamorphic rocks: shale becomes slate, phyllite, schist and gneiss as the grade rises; limestone becomes marble, quartz sandstone becomes quartzite, shale baked by magma becomes hornfels, and coal becomes anthracite.');
        F.say('Slate, phyllite, schist and gneiss can all come from one shale, cooked to higher and higher grade. Quartzite breaks right through its grains, while sandstone breaks around them.', 'One parent rock, rising grade: slate, phyllite, schist, gneiss.');
      };
    }
  });

  // an isometric cube at (x, y) (top-front corner position), side s px; faces colored; fresh: fraction of each face still fresh (0..1)
  function isoCube(ctx, x, y, s, col, fresh, k) {
    var c = M.cos(PI / 6), sn = 0.5, top = [[x, y], [x + s * c, y - s * sn], [x, y - 2 * s * sn], [x - s * c, y - s * sn]], left = [[x - s * c, y - s * sn], [x, y], [x, y + s], [x - s * c, y + s - s * sn]], right = [[x, y], [x + s * c, y - s * sn], [x + s * c, y + s - s * sn], [x, y + s]];
    var rind = '#b5652f';
    [[top, 1.12], [left, 0.92], [right, 0.75]].forEach(function (fc) {
      var f = fc[0], L = fc[1], cr = rgb(col), cc = 'rgb(' + M.min(255, M.round(cr[0] * L)) + ',' + M.min(255, M.round(cr[1] * L)) + ',' + M.min(255, M.round(cr[2] * L)) + ')';
      if (fresh < 1) { poly(ctx, f, rind, null); if (fresh > 0) { var cx = (f[0][0] + f[2][0]) / 2, cy = (f[0][1] + f[2][1]) / 2; poly(ctx, f.map(function (p) { return [cx + (p[0] - cx) * fresh, cy + (p[1] - cy) * fresh]; }), cc, null); } }
      else poly(ctx, f, cc, null);
      poly(ctx, f, null, 'rgba(0,0,0,0.35)', 0.8);
    });
  }

  /* es-weathering: Weathering and Soil.
     opts:
       mode: 'cube' | 'factors' | 'soil'      modes: true or a list for tabs
       cuts: cuts through each edge (0–4; 1 cut halves each edge into 8 cubes); size: the starting cube's edge (cm, default 2)
       climate: 'cold-dry' | 'cold-wet' | 'warm-wet' | 'hot-dry'; rock: 'granite' | 'limestone' | 'sandstone'
       process: 'frost' | 'roots' | 'abrasion' | 'rusting' | 'dissolving' | 'clay'
       time: years (soil: age of the soil; default 10,000); horizons: list of horizons to show (default all)
       blank: true (letters on horizons or processes); quiet: hides surface areas, ratios, process kinds and horizon names; lock */
  R('es-weathering', function (el, o) {
    var F = frame(el, o, 'Weathering and soil', { aspect: 1.6, max: 440 });
    return F.modes({ cube: cube, factors: factors, soil: soil }, { cube: 'Surface area', factors: 'Kinds of weathering', soil: 'Soil' });

    function cube(F) {
      F.size({ aspect: 1.8, max: 380, narrow: 1.0 });
      var P = { cuts: clamp(M.round(num(o.cuts, 1)), 0, 4), side: num(o.size, 2), t: 0 };
      var T = F.tiles([{ k: 'n', label: 'Pieces', secret: true }, { k: 's', label: 'Edge of each piece', secret: true }, { k: 'a', label: 'Total surface area', secret: true }, { k: 'r', label: 'Compared with one cube', secret: true }]);
      var cs = V.slider(F.ctl, { label: 'Cuts through each edge', min: 0, max: 4, step: 1, value: P.cuts, fmt: function (v) { return v + (v === 1 ? ' cut' : ' cuts'); }, input: function (v) { P.cuts = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { P.t = M.min(1, P.t + dt * 0.18); F.redraw(); if (P.t >= 1) return false; }, { label: 'Weather them', reset: function () { if (P.t >= 1) P.t = 0; } });
      V.button(row, 'Start fresh', function () { P.t = 0; F.redraw(); });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; P.cuts = clamp(P.cuts + (a[0] || -a[1]), 0, 4); cs.set(P.cuts); F.redraw(); return true; }, 'Arrow keys change the number of cuts.');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, n = P.cuts + 1, q = EM.cube(P.side, P.cuts), rindCm = P.t * P.side * 0.24; // the weathered rind grows the same depth on every piece
        var S = M.min(w * 0.17, h * 0.34), col = '#9aa3ab';
        function fresh(side) { return M.max(0, (side - 2 * rindCm) / side); }
        // the whole cube
        isoCube(ctx, w * 0.22, h * 0.5 - S * 0.3, S, col, fresh(P.side), k);
        txt(ctx, 'One cube', w * 0.22, h - 16, { size: 12, color: k.ink, bold: true, align: 'center' });
        if (!F.quiet) txt(ctx, nf(q.area0, 1) + ' cm²', w * 0.22, h - 32, { size: 11, color: k.muted, align: 'center' });
        // the cut pieces, pulled apart a little
        var s2 = S / n, gap = s2 * (n > 1 ? 0.28 : 0), c = M.cos(PI / 6), bx = w * 0.66, by = h * 0.5 - S * 0.3;
        var span = (n - 1) * (s2 + gap); // draw from the bottom layer up, and from the back to the front
        for (var lz = 0; lz < n; lz++) for (var yi = 0; yi < n; yi++) for (var xi = 0; xi < n; xi++) {
          var dx = xi * (s2 + gap), dy = yi * (s2 + gap), dz = lz * (s2 + gap);
          isoCube(ctx, bx + (dx - dy) * c, by + (dx + dy) * 0.5 - dz - span * 0.5 + span * 0.5, s2, col, fresh(q.side), k);
        }
        txt(ctx, plural(q.pieces, 'piece'), bx, h - 16, { size: 12, color: k.ink, bold: true, align: 'center' });
        if (!F.quiet) txt(ctx, nf(q.area, 1) + ' cm² in all', bx, h - 32, { size: 11, color: k.muted, align: 'center' });
        // fresh rock left
        var v0 = M.pow(fresh(P.side), 3), v1 = M.pow(fresh(q.side), 3);
        if (P.t > 0) { txt(ctx, 'Fresh rock left: one cube ' + fm(v0 * 100, 0) + '%, the pieces ' + fm(v1 * 100, 0) + '%', w / 2, 14, { size: 12, color: k.rust, align: 'center', bold: true }); }
        T.n(nf(q.pieces)); T.s(fm(q.side, 3) + ' cm'); T.a(nf(q.area, 2) + ' cm²'); T.r(q.ratio + ' times as much');
        F.alt('A ' + fm(P.side, 1) + ' cm cube of rock and the same cube cut into ' + q.pieces + ' smaller cubes' + (F.quiet ? '.' : ', with ' + q.ratio + ' times the surface area.'));
        F.say('Cutting doesn’t change the amount of rock, but it exposes new faces: ' + q.pieces + ' pieces with ' + fm(q.side, 3) + ' cm edges have <b>' + nf(q.area, 2) + ' cm²</b> of surface, <b>' + q.ratio + '×</b> the ' + nf(q.area0, 1) + ' cm² of one cube. Chemical weathering works on surfaces, so smaller pieces weather faster.', 'Smaller pieces have more surface, so they weather faster.');
      };
    }

    function factors(F) {
      F.size({ aspect: 1.75, max: 400, narrow: 0.95 });
      var PR = { frost: ['Frost wedging', 'mechanical'], roots: ['Root wedging', 'mechanical'], abrasion: ['Abrasion', 'mechanical'], rusting: ['Rusting (oxidation)', 'chemical'], dissolving: ['Dissolving (acid in rain)', 'chemical'], clay: ['Feldspar turning to clay', 'chemical'] };
      var RATE = { frost: { 'cold-dry': 1, 'cold-wet': 3, 'warm-wet': 0, 'hot-dry': 0.2 }, roots: { 'cold-dry': 0.4, 'cold-wet': 1.5, 'warm-wet': 2.5, 'hot-dry': 0.4 }, abrasion: { 'cold-dry': 1.5, 'cold-wet': 1.5, 'warm-wet': 1.5, 'hot-dry': 2.5 }, rusting: { 'cold-dry': 0.3, 'cold-wet': 1, 'warm-wet': 3, 'hot-dry': 0.5 }, dissolving: { 'cold-dry': 0.3, 'cold-wet': 2, 'warm-wet': 3, 'hot-dry': 0.3 }, clay: { 'cold-dry': 0.2, 'cold-wet': 1, 'warm-wet': 3, 'hot-dry': 0.3 } };
      var ROCKF = { granite: { dissolving: 0.1, rusting: 0.7, clay: 1 }, limestone: { dissolving: 1, rusting: 0.2, clay: 0.1 }, sandstone: { dissolving: 0.1, rusting: 0.5, clay: 0.2 } };
      var P = { pr: PR[o.process] ? o.process : 'frost', cl: RATE.frost[o.climate] != null ? o.climate : 'cold-wet', rock: ROCKF[o.rock] ? o.rock : 'granite', t: 0 };
      var T = F.tiles([{ k: 'kind', label: 'Kind', secret: true }]);
      V.seg(F.ctl, { label: 'Process', items: Object.keys(PR).map(function (p, i) { return [p, F.quiet || o.blank ? 'Process ' + LETTERS[i] : PR[p][0]]; }), value: P.pr, change: function (v) { P.pr = v; P.t = 0; F.redraw(); } });
      var row = F.row(); V.seg(row, { label: 'Climate', items: [['cold-dry', 'Cold, dry'], ['cold-wet', 'Cold, wet'], ['warm-wet', 'Warm, wet'], ['hot-dry', 'Hot, dry']], value: P.cl, change: function (v) { P.cl = v; F.redraw(); } });
      V.seg(row, { label: 'Rock', items: [['granite', 'Granite'], ['limestone', 'Limestone'], ['sandstone', 'Sandstone']], value: P.rock, change: function (v) { P.rock = v; F.redraw(); } });
      var row2 = F.row(); F.player(row2, function (dt) { P.t = (P.t + dt * 0.25) % 1; F.redraw(); }, { label: 'Show it', auto: true });
      function rate(p) { return RATE[p][P.cl] * (ROCKF[P.rock][p] != null ? ROCKF[P.rock][p] : 1); }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, aw = wide ? w * 0.55 : w, ah = wide ? h : h * 0.58, cx = aw / 2, cy = ah * 0.55, t = V.reduced && P.t === 0 ? 0.7 : P.t;
        var rockCol = { granite: '#c9b3a6', limestone: '#cfccc2', sandstone: '#dcc58f' }[P.rock];
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, aw, ah * 0.35);
        if (P.cl.indexOf('cold') === 0) { var r = rng(3); for (var i = 0; i < 18; i++) circle(ctx, r() * aw, r() * ah * 0.33, 1.6, '#fff'); }
        rockTex(ctx, cx - aw * 0.32, cy - ah * 0.28, aw * 0.64, ah * 0.6, P.rock === 'granite' ? 'granite' : P.rock === 'limestone' ? 'limestone' : 'quartz sandstone', 4, k);
        if (P.pr === 'frost' || P.pr === 'roots') { // a crack that widens
          var wd = 3 + t * 14; poly(ctx, [[cx - wd, cy - ah * 0.28], [cx + wd, cy - ah * 0.28], [cx + 1, cy + ah * 0.18], [cx - 1, cy + ah * 0.18]], P.pr === 'frost' ? '#cfeaf8' : k.dark ? '#1b1410' : '#3b2a1e');
          if (P.pr === 'frost') { txt(ctx, t < 0.5 ? 'water fills the crack' : 'it freezes and expands about 9%', cx, cy + ah * 0.26, { size: 11.5, color: k.ink, align: 'center', bold: true, halo: k.halo }); }
          else { line(ctx, [[cx, cy - ah * 0.4], [cx, cy - ah * 0.28 + t * ah * 0.4]], { color: '#6b4f2a', w: 3 + t * 6 }); circle(ctx, cx - 10, cy - ah * 0.42, 9, k.green); circle(ctx, cx + 8, cy - ah * 0.45, 11, k.green); txt(ctx, 'a growing root pries the crack open', cx, cy + ah * 0.26, { size: 11.5, color: k.ink, align: 'center', bold: true, halo: k.halo }); }
        } else if (P.pr === 'abrasion') { var r2 = rng(9); for (var g = 0; g < 26; g++) { var gx = ((r2() + t * 2) % 1) * aw, gy = cy - ah * 0.25 + r2() * ah * 0.45; circle(ctx, gx, gy, 1.5 + r2() * 2, '#a08a64'); } txt(ctx, 'sand carried by wind or water grinds the surface', cx, cy + ah * 0.37, { size: 11.5, color: k.ink, align: 'center', bold: true, halo: k.halo }); }
        else if (P.pr === 'rusting') { ctx.save(); ctx.globalAlpha = 0.15 + t * 0.6; var r3 = rng(4); for (var s = 0; s < 40; s++) circle(ctx, cx - aw * 0.3 + r3() * aw * 0.6, cy - ah * 0.26 + r3() * ah * 0.56, 4 + r3() * 8, '#b5652f'); ctx.restore(); txt(ctx, 'iron in minerals reacts with oxygen and water', cx, cy + ah * 0.37, { size: 11.5, color: k.ink, align: 'center', bold: true, halo: k.halo }); }
        else if (P.pr === 'dissolving') { for (var d2 = 0; d2 < 8; d2++) { var dx2 = cx - aw * 0.25 + d2 * aw * 0.07; line(ctx, [[dx2, 8 + ((t * 120 + d2 * 17) % (ah * 0.25))], [dx2, 14 + ((t * 120 + d2 * 17) % (ah * 0.25))]], { color: k.blue, w: 1.6 }); } ctx.save(); ctx.globalAlpha = t; ctx.fillStyle = k.sky; for (var p2 = 0; p2 < 4; p2++) { ctx.beginPath(); ctx.ellipse(cx - aw * 0.2 + p2 * aw * 0.13, cy - ah * 0.28, 10 + p2 * 2, 6 + t * 12, 0, 0, PI); ctx.fill(); } ctx.restore(); txt(ctx, 'carbonic acid in rain dissolves calcite', cx, cy + ah * 0.37, { size: 11.5, color: k.ink, align: 'center', bold: true, halo: k.halo }); }
        else if (P.pr === 'clay') { ctx.save(); ctx.globalAlpha = t * 0.85; ctx.fillStyle = '#d9c6a5'; var r4 = rng(5); for (var c2 = 0; c2 < 30; c2++) { ctx.beginPath(); ctx.ellipse(cx - aw * 0.3 + r4() * aw * 0.6, cy - ah * 0.26 + r4() * ah * 0.56, 6 + r4() * 6, 4 + r4() * 3, r4() * 3, 0, TAU); ctx.fill(); } ctx.restore(); txt(ctx, 'water slowly changes feldspar into soft clay', cx, cy + ah * 0.37, { size: 11.5, color: k.ink, align: 'center', bold: true, halo: k.halo }); }
        if (!F.quiet) pill(ctx, PR[P.pr][1] === 'mechanical' ? 'Mechanical: breaks the rock, same minerals' : 'Chemical: changes the minerals', cx, 16, { k: k, size: 12, bold: true, color: PR[P.pr][1] === 'mechanical' ? k.blue : k.rust });
        // rate bars for this climate and rock
        var bx = wide ? aw + 14 : 14, by = wide ? 28 : ah + 26, bw = wide ? w - aw - 28 : w - 28, bh = wide ? h - 50 : h - ah - 36, keys = Object.keys(PR), rowH = bh / keys.length;
        txt(ctx, 'How fast here (' + { 'cold-dry': 'cold, dry', 'cold-wet': 'cold, wet', 'warm-wet': 'warm, wet', 'hot-dry': 'hot, dry' }[P.cl] + ', ' + P.rock + ')', bx, by - 12, { size: 11.5, color: k.ink, bold: true });
        keys.forEach(function (p, i) { var y = by + i * rowH, v = rate(p), lw = M.min(178, bw * 0.56); txt(ctx, F.quiet || o.blank ? 'Process ' + LETTERS[i] : PR[p][0], bx, y + rowH / 2, { size: 11, color: p === P.pr ? k.rust : k.ink, bold: p === P.pr }); ctx.fillStyle = rgba(PR[p][1] === 'mechanical' || F.quiet ? k.blue : k.rust, p === P.pr ? 0.85 : 0.45); ctx.fillRect(bx + lw, y + rowH * 0.25, (bw - lw) * v / 3, rowH * 0.5); });
        txt(ctx, 'slower → faster', bx + bw, by + bh + 8, { size: 10, color: k.muted, align: 'right' });
        T.kind(PR[P.pr][1] === 'mechanical' ? 'mechanical (physical)' : 'chemical');
        F.alt('Weathering: ' + (F.quiet ? 'a process' : PR[P.pr][0].toLowerCase()) + ' acting on ' + P.rock + ' in a ' + P.cl.replace('-', ', ') + ' climate, with bars for how fast each process works there.');
        F.say('Weathering breaks down rock where it sits; erosion carries the pieces away. Mechanical weathering breaks rock into smaller pieces of the same minerals; chemical weathering changes the minerals. Warm, wet climates speed chemical weathering; freezing and thawing with water speeds frost wedging.', 'Weathering breaks rock down in place; erosion carries it away.');
      };
    }

    function soil(F) {
      F.size({ aspect: 1.35, max: 480, narrow: 0.85 });
      var P = { yrs: clamp(num(o.time, 10000), 10, 100000), cl: ['dry', 'temperate', 'tropical'].indexOf(o.climate) >= 0 ? o.climate : 'temperate', life: 0.7, slope: 0.1 };
      var T = F.tiles([{ k: 'd', label: 'Soil depth', secret: true }]);
      var ys = V.slider(F.ctl, { label: 'Time', min: 1, max: 5, step: 0.05, value: M.log10(P.yrs), fmt: function (v) { return nf(M.round(M.pow(10, v) / (v > 3 ? 100 : 1)) * (v > 3 ? 100 : 1)) + ' years'; }, input: function (v) { P.yrs = M.pow(10, v); F.redraw(); } });
      V.seg(F.ctl, { label: 'Climate', items: [['dry', 'Dry'], ['temperate', 'Cool, wet forest'], ['tropical', 'Hot, wet']], value: P.cl, change: function (v) { P.cl = v; F.redraw(); } });
      var row = F.row(); V.slider(row, { label: 'Living things', min: 0, max: 1, step: 0.05, value: P.life, fmt: function (v) { return v < 0.3 ? 'few' : v < 0.7 ? 'some' : 'many'; }, input: function (v) { P.life = v; F.redraw(); } });
      V.slider(row, { label: 'Slope', min: 0, max: 1, step: 0.05, value: P.slope, fmt: function (v) { return v < 0.3 ? 'flat' : v < 0.7 ? 'gentle' : 'steep'; }, input: function (v) { P.slope = v; F.redraw(); } });
      var row2 = F.row(); F.player(row2, function (dt) { var lg = M.log10(P.yrs) + dt * 0.6; if (lg >= 5) { P.yrs = 1e5; ys.set(5); F.redraw(); return false; } P.yrs = M.pow(10, lg); ys.set(lg); F.redraw(); }, { label: 'Let time pass', reset: function () { if (P.yrs >= 99000) { P.yrs = 10; ys.set(1); } } });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, top = 40, x0 = M.max(48, w * 0.1), cw = w * 0.38;
        var age = M.log10(P.yrs), grow = clamp((age - 1) / 4, 0, 1), cf = { dry: 0.45, temperate: 1, tropical: 1.6 }[P.cl] * (1 - 0.6 * P.slope);
        var depth = 2.2 * grow * cf; // meters of soil above weathered rock, roughly
        var Om = P.cl === 'dry' ? 0.02 * grow : 0.1 * grow * P.life * (P.cl === 'tropical' ? 0.5 : 1), Am = 0.25 * grow * cf * (0.4 + P.life * 0.6), Em = P.cl === 'temperate' ? 0.2 * M.max(0, grow - 0.3) * cf : 0, Bm = M.max(0, depth - Om - Am - Em), Cm = 0.4 + 0.6 * grow * cf;
        var H = [['O', 'leaf litter and humus', Om, '#3b2a1a'], ['A', 'topsoil: dark, rich in humus', Am, '#4e3a28'], ['E', 'washed-out layer: pale', Em, '#c9b9a0'], ['B', P.cl === 'tropical' ? 'subsoil: red, rich in iron and clay' : P.cl === 'dry' ? 'subsoil: with calcite (caliche)' : 'subsoil: clay and iron washed in', Bm, P.cl === 'tropical' ? '#a8452a' : P.cl === 'dry' ? '#d8c3a0' : '#9a6a40'], ['C', 'weathered rock pieces', Cm, '#a39380']].filter(function (q) { return q[2] > 0.005 && (!o.horizons || o.horizons.indexOf(q[0]) >= 0); });
        var tot = H.reduce(function (a, q) { return a + q[2]; }, 0) + 0.6, s = (h - top - 16) / M.max(3.2, tot), y = top;
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, top);
        var r = rng(2); for (var g = 0; g < (P.cl === 'dry' ? 4 : 18) * (0.3 + P.life); g++) { var gx = x0 + r() * cw; line(ctx, [[gx, top], [gx + (r() - 0.5) * 4, top - 6 - r() * 10]], { color: k.green, w: 1.5 }); }
        if (P.life > 0.5 && P.cl !== 'dry') { line(ctx, [[x0 + cw * 0.75, top], [x0 + cw * 0.75, top - 30]], { color: '#6b4f2a', w: 4 }); circle(ctx, x0 + cw * 0.75, top - 34, 14, k.green); }
        var lastLab = -1e9;
        // depth ruler
        for (var dm = 0; dm <= tot; dm += 0.5) { var yy = top + dm * s; if (yy > h - 6) break; line(ctx, [[x0 - 8, yy], [x0 - 2, yy]], { color: k.axis, w: 1 }); txt(ctx, fm(dm, 1) + ' m', x0 - 10, yy, { size: 10, color: k.muted, align: 'right' }); }
        H.forEach(function (q, i) {
          var hh = q[2] * s; ctx.fillStyle = q[3]; ctx.fillRect(x0, y, cw, hh);
          if (q[0] === 'C') { var r5 = rng(6); for (var b = 0; b < 30; b++) { ctx.fillStyle = r5() < 0.5 ? '#8c7c6a' : '#b8aa98'; ctx.fillRect(x0 + r5() * cw, y + r5() * hh, 4 + r5() * 10, 3 + r5() * 7); } }
          var ly = M.max(y + hh / 2, lastLab + 30); lastLab = ly;
          if (o.blank || !F.quiet) line(ctx, [[x0 + cw, y + hh / 2], [x0 + cw + 10, ly]], { color: k.muted, w: 1 });
          if (o.blank) badge(ctx, LETTERS[i], x0 + cw + 24, ly, { k: k }); else if (!F.quiet) { txt(ctx, q[0] + ' horizon', x0 + cw + 14, ly - 7, { size: 12, color: k.ink, bold: true }); txt(ctx, q[1], x0 + cw + 14, ly + 8, { size: 10.5, color: k.muted }); }
          y += hh;
        });
        rockTex(ctx, x0, y, cw, h - y - 6, 'granite', 3, k); if (!F.quiet && !o.blank) txt(ctx, 'bedrock', x0 + cw + 12, y + (h - y) / 2, { size: 12, color: k.ink, bold: true });
        T.d('about ' + fm(M.max(0, depth), 1) + ' m');
        F.alt('A soil profile after ' + nf(P.yrs) + ' years in a ' + P.cl + ' climate' + (F.quiet ? '.' : ', with horizons ' + H.map(function (q) { return q[0]; }).join(', ') + ' above bedrock.'));
        F.say('Soil forms in place from rock, water, air and living things, slowly: a few centimeters can take centuries. After <b>' + nf(M.round(P.yrs)) + ' years</b> here the soil is about <b>' + fm(M.max(0, depth), 1) + ' m</b> deep. Climate, parent rock, living things, slope and time all shape it. (Depths are rough.)', 'Soil forms slowly from rock, water, air and living things.');
      };
    }
  });

  /* es-sediment: Moving Sediment.
     opts:
       mode: 'hjulstrom' | 'stream' | 'grains' | 'structures'      modes: true or a list for tabs
       point: {d (mm), v (cm/s)} (hjulstrom: the draggable grain); phi: true (show phi values on the size axis)
       flow: river speed entering the lake (stream, cm/s, default 60); distance: km traveled (grains, 0–200)
       structure: 'crossbed' | 'wave-ripples' | 'current-ripples' | 'mudcracks' | 'graded'; flip: true (draw the layer upside down)
       quiet: hides field names, phi values and current arrows; lock */
  R('es-sediment', function (el, o) {
    var F = frame(el, o, 'Moving sediment', { aspect: 1.5, max: 460 });
    return F.modes({ hjulstrom: hjul, stream: stream, grains: grains, structures: structs }, { hjulstrom: 'Erode, carry or drop', stream: 'River into a lake', grains: 'Grain size and shape', structures: 'Sedimentary structures' });

    function hjul(F) {
      F.size({ aspect: 1.45, max: 480, narrow: 0.95 });
      var p = o.point ? { d: clamp(num(o.point.d, 0.5), 0.001, 1000), v: clamp(num(o.point.v, 30), 0.1, 1000) } : { d: 0.05, v: 60 }, showPhi = !!o.phi, geo = null;
      var T = F.tiles([{ k: 'd', label: 'Grain size', secret: false }, { k: 'v', label: 'Flow speed', secret: false }, { k: 'f', label: 'The grain is', secret: true }]);
      check(F.ctl, 'Show phi values', showPhi, function (v) { showPhi = v; F.redraw(); });
      F.drag({ hit: function (x, y) { return geo && M.hypot(geo.X(p.d) - x, geo.Y(p.v) - y) < 22 ? 'p' : geo && x > geo.r.x && x < geo.r.x + geo.r.w && y > geo.r.y && y < geo.r.y + geo.r.h ? 'p' : null; }, move: function (h, x, y) { p.d = clamp(geo.ix(x), 0.001, 1000); p.v = clamp(geo.iy(y), 0.1, 1000); F.redraw(); } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; p.d = clamp(p.d * M.pow(10, a[0] * 0.1), 0.001, 1000); p.v = clamp(p.v * M.pow(10, -a[1] * 0.1), 0.1, 1000); F.redraw(); return true; }, 'Drag the grain (or use the arrow keys) to change its size and the flow speed.');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, r = { x: 62, y: 18, w: w - 76, h: h - 18 - (showPhi ? 84 : 70) };
        var c = chart(ctx, k, r, { x: { min: 0.001, max: 1000, log: true, fmt: function (v) { return v < 1 ? String(v) : nf(v); } }, y: { min: 0.1, max: 1000, log: true, label: 'Flow speed (cm/s)', lpad: 46, fmt: function (v) { return v < 1 ? String(v) : nf(v); } } });
        geo = c; c.clip();
        var top = [], mid = [], bot = [];
        for (var e = -3; e <= 3.0001; e += 0.02) { var d = M.pow(10, e); top.push([c.X(d), c.Y(EM.hjulErode(d))]); bot.push([c.X(d), c.Y(EM.hjulDeposit(d))]); }
        poly(ctx, [[r.x, r.y]].concat(top, [[r.x + r.w, r.y]]), rgba(k.red, 0.16));
        poly(ctx, top.concat(bot.slice().reverse()), rgba(k.gold, 0.16));
        poly(ctx, bot.concat([[r.x + r.w, r.y + r.h], [r.x, r.y + r.h]]), rgba(k.blue, 0.16));
        // the erosion line is really a band: draw it thick and soft
        line(ctx, top, { color: rgba(k.red, 0.3), w: 9 }); line(ctx, top, { color: k.red, w: 2 }); line(ctx, bot, { color: k.blue, w: 2 });
        c.unclip();
        if (!F.quiet) { txt(ctx, 'EROSION', c.X(0.003), c.Y(400), { size: 13, color: k.red, bold: true }); txt(ctx, 'TRANSPORT', c.X(0.004), c.Y(8), { size: 13, color: k.dark ? '#ffd479' : '#8a6a00', bold: true }); txt(ctx, 'DEPOSITION', c.X(20), c.Y(0.6), { size: 13, color: k.blue, bold: true }); }
        // size classes along the axis
        txt(ctx, 'Grain size (mm, log scale)', r.x + r.w / 2, h - 8, { size: 12, color: k.ink, align: 'center' });
        var cy = r.y + r.h + 26; EM.SIZES.forEach(function (sz, i) { var a = M.max(0.001, sz[1]), b = M.min(1000, sz[2]); if (b <= 0.001) return; var x1 = c.X(a), x2 = c.X(b); ctx.fillStyle = rgba(i % 2 ? k.rust : k.green, 0.18); ctx.fillRect(x1, cy - 7, x2 - x1, 14); var fs2 = tw(ctx, sz[0], { size: 10 }) <= x2 - x1 + 4 ? 10 : tw(ctx, sz[0], { size: 8.5 }) <= x2 - x1 + 2 ? 8.5 : 0; if (fs2) txt(ctx, sz[0], (x1 + x2) / 2, cy, { size: fs2, color: k.ink, align: 'center' }); });
        if (showPhi && !F.quiet) var lastPx = -1e9; [[0.001, 10], [1 / 256, 8], [1 / 16, 4], [1, 0], [4, -2], [64, -6], [256, -8]].forEach(function (q) { var sx = c.X(q[0]), ps = 'φ ' + fm(q[1], 0), pw2 = tw(ctx, ps, { size: 10 }); if (sx - pw2 / 2 < lastPx + 4) return; lastPx = sx + pw2 / 2; txt(ctx, ps, sx, cy + 15, { size: 10, color: k.muted, align: 'center' }); });
        knob(ctx, c.X(p.d), c.Y(p.v), k.rust, 7, k); if (F.focused()) focusRing(ctx, c.X(p.d), c.Y(p.v), 14);
        var fld = EM.hjulField(p.d, p.v);
        T.d(sig(p.d, 2) + ' mm (' + EM.sizeClass(p.d) + (showPhi ? ', φ = ' + fm(EM.phi(p.d), 1) : '') + ')'); T.v(sig(p.v, 2) + ' cm/s'); T.f(fld);
        F.alt('A diagram of grain size against flow speed, both on log scales, with fields for erosion, transport and deposition. ' + (F.quiet ? 'A grain is marked.' : 'A ' + sig(p.d, 2) + ' mm grain in water moving ' + sig(p.v, 2) + ' cm/s is ' + fld + '.'));
        F.say('Sand about 0.2–0.5 mm is the easiest to lift. Finer silt and clay stick together, so it takes faster water to erode them, yet once lifted they stay afloat in very slow water. Here the grain is <b>' + fld + '</b>. After Hjulström (1935), for water about 1 m deep; the real boundaries are fuzzy bands.', 'The smallest grains are not the easiest to lift: clay sticks together.');
      };
    }

    function stream(F) {
      F.size({ aspect: 1.9, max: 380, narrow: 1.0 });
      var P = { v0: clamp(num(o.flow, 60), 20, 300), t: 0 }, SZ = [[8, 'gravel', '#7d7368', 5], [1, 'coarse sand', '#c2a27a', 3.4], [0.2, 'fine sand', '#e0c690', 2.6], [0.02, 'silt', '#a89a86', 1.8], [0.003, 'clay', '#8b7f72', 1.3]];
      var T = F.tiles([{ k: 'v', label: 'River speed at the mouth', secret: false }]);
      var fs = V.slider(F.ctl, { label: 'Flow (flood)', min: 20, max: 300, step: 5, value: P.v0, fmt: function (v) { return v + ' cm/s'; }, input: function (v) { P.v0 = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { P.t += dt; F.redraw(); }, { label: 'Run the river', auto: true });
      // the water slows as it spreads into the lake: v = v0·e^(−x/λ) with λ = 1/8 of the lake; a grain drops where v falls below its settling speed
      function dropAt(d) { var vd = EM.hjulDeposit(d); return vd >= P.v0 ? 0 : M.min(1.05, M.log(P.v0 / vd) / 8); }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, lw = wide ? w * 0.66 : w, lh = wide ? h : h * 0.62;
        // side view: river on the left, lake to the right
        var wl = lh * 0.3, by = lh - 30, rx = lw * 0.18;
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, lw, wl); ctx.fillStyle = rgba(k.blue, 0.35); ctx.fillRect(rx, wl, lw - rx, by - wl);
        ctx.fillStyle = k.landDark; ctx.beginPath(); ctx.moveTo(0, wl - 10); ctx.lineTo(rx, wl + 6); ctx.lineTo(rx, by); ctx.lineTo(0, by); ctx.closePath(); ctx.fill();
        ctx.fillStyle = rgba(k.blue, 0.6); ctx.fillRect(0, wl - 14, rx, 8);
        ctx.fillStyle = k.mud; ctx.fillRect(0, by, lw, lh - by);
        // deposits: each size settles where the water has slowed below its deposition speed
        SZ.forEach(function (sz, i) { var x0 = rx + dropAt(sz[0]) * (lw - rx), x1 = i < SZ.length - 1 ? rx + dropAt(SZ[i + 1][0]) * (lw - rx) : lw; if (x1 <= x0) return; ctx.fillStyle = sz[2]; ctx.beginPath(); ctx.moveTo(x0, by); ctx.quadraticCurveTo((x0 + x1) / 2, by - 14 + i * 2, x1, by); ctx.closePath(); ctx.fill(); if (!F.quiet && x1 - x0 > 40) txt(ctx, sz[1], (x0 + x1) / 2, by + 12, { size: 10.5, color: '#fff', align: 'center', halo: 'rgba(0,0,0,0.4)' }); });
        // moving grains
        var r = rng(7); for (var g = 0; g < 70; g++) { var sz = SZ[g % SZ.length], end = dropAt(sz[0]), ph = (P.t * 0.25 + r()) % 1, xx = rx * 0.2 + ph * (rx * 0.8 + end * (lw - rx)), fx = (xx - rx) / (lw - rx), yy = fx < 0 ? wl - 10 : lerp(wl + 8, by - 3, M.min(1, M.max(0, fx) / M.max(0.02, end))); circle(ctx, xx, yy, sz[3] * 0.8, sz[2]); }
        if (!F.quiet) { arrow(ctx, 10, wl - 26, rx + 30, wl - 26, { color: k.blue, w: 2.2 }); txt(ctx, 'fast', 12, wl - 38, { size: 11, color: k.blue }); txt(ctx, 'slower and slower', lw - 10, wl + 14, { size: 11, color: k.blue, align: 'right' }); }
        txt(ctx, 'A river slows as it enters a lake: sorted layers', 8, 14, { size: 12, color: k.ink, bold: true });
        // the glacier: dumps everything together
        var gx = wide ? lw + 10 : 10, gy = wide ? 8 : lh + 8, gw = wide ? w - lw - 18 : w - 20, gh = wide ? h - 16 : h - lh - 16;
        ctx.save(); ctx.fillStyle = k.panel; rrect(ctx, gx, gy, gw, gh, 10); ctx.fill(); ctx.restore();
        poly(ctx, [[gx, gy + gh * 0.3], [gx + gw, gy + gh * 0.82], [gx + gw, gy + gh], [gx, gy + gh]], k.rockDark);
        poly(ctx, [[gx, gy + gh * 0.22], [gx + gw * 0.45, gy + gh * 0.5], [gx + gw * 0.55, gy + gh * 0.6], [gx + gw * 0.55, gy + gh * 0.62], [gx, gy + gh * 0.3]], k.ice, k.blue, 1.2);
        var r2 = rng(3); for (var q = 0; q < 80; q++) { var s2 = SZ[M.floor(r2() * SZ.length)], ux = 0.56 + r2() * 0.3, xq = gx + gw * ux, base2 = gy + gh * (0.3 + 0.52 * ux), hump = 26 * M.sin((ux - 0.56) / 0.3 * PI); circle(ctx, xq, base2 - r2() * hump - 3, s2[3] * (s2[0] > 1 ? 1.9 : 0.9), s2[2]); }
        txt(ctx, 'A melting glacier drops', gx + 8, gy + 14, { size: 11.5, color: k.ink, bold: true }); txt(ctx, 'everything together: unsorted', gx + 8, gy + 30, { size: 11.5, color: k.ink, bold: true });
        T.v(P.v0 + ' cm/s');
        F.alt('A river enters a lake and slows; gravel drops first near the mouth, then sand, silt and clay farther out. Beside it a melting glacier drops a jumble of all sizes.');
        F.say('Erosion doesn’t only destroy: every grain carried away is set down somewhere. As the river slows into the lake, the biggest grains drop first and the finest travel farthest, building <b>sorted</b> layers. A flood carries everything farther out. Ice can’t sort: a glacier drops boulders, sand and clay together.', 'Water sorts grains by size as it slows; ice drops them all together.');
      };
    }

    function grains(F) {
      F.size({ aspect: 1.7, max: 400, narrow: 0.9 });
      var dist = clamp(num(o.distance, 5), 0, 200);
      var T = F.tiles([{ k: 'r', label: 'Rounding', secret: true }, { k: 's', label: 'Sorting', secret: true }]);
      var ds = V.slider(F.ctl, { label: 'Distance carried by the river', min: 0, max: 200, step: 1, value: dist, fmt: function (v) { return v + ' km'; }, input: function (v) { dist = v; F.redraw(); } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; dist = clamp(dist + (a[0] || -a[1]) * 10, 0, 200); ds.set(dist); F.redraw(); return true; }, 'Arrow keys change how far the grains traveled.');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, tw2 = wide ? w * 0.42 : w;
        // Wentworth and phi table as a sieve stack
        var rows = [['boulders', '> 256 mm', '< −8'], ['cobbles', '64–256 mm', '−6 to −8'], ['pebbles', '4–64 mm', '−2 to −6'], ['granules', '2–4 mm', '−1 to −2'], ['sand', '1/16–2 mm', '4 to −1'], ['silt', '1/256–1/16 mm', '8 to 4'], ['clay', '< 1/256 mm', '> 8']];
        var rh = (h - 40) / rows.length * (wide ? 1 : 0.55), y0 = 30;
        txt(ctx, 'Size class', 10, 16, { size: 11.5, color: k.ink, bold: true }); txt(ctx, 'mm', tw2 * 0.48, 16, { size: 11.5, color: k.ink, bold: true }); if (!F.quiet) txt(ctx, 'phi (φ)', tw2 * 0.82, 16, { size: 11.5, color: k.ink, bold: true });
        rows.forEach(function (q, i) { var y = y0 + i * rh; ctx.fillStyle = i % 2 ? k.panel : rgba(k.rust, 0.06); ctx.fillRect(6, y, tw2 - 12, rh); txt(ctx, q[0], 12, y + rh / 2, { size: 11.5, color: k.ink }); txt(ctx, q[1], tw2 * 0.48, y + rh / 2, { size: 11, color: k.muted }); if (!F.quiet) txt(ctx, q[2], tw2 * 0.82, y + rh / 2, { size: 11, color: k.muted }); });
        if (!F.quiet) txt(ctx, 'φ = −log₂(size in mm): coarser grains get smaller φ', 8, y0 + rows.length * rh + 14, { size: 10.5, color: k.rust });
        // two trays: rounding and sorting after `dist` km
        var tx = wide ? tw2 + 10 : 8, ty = wide ? 10 : y0 + rows.length * rh + 26, tw3 = wide ? w - tw2 - 18 : w - 16, th = wide ? h - 20 : h - ty - 8;
        ctx.save(); ctx.fillStyle = k.panel; rrect(ctx, tx, ty, tw3, th, 10); ctx.fill(); ctx.restore();
        var round = clamp(dist / 120, 0, 1), sort = clamp(dist / 150, 0, 1), r = rng(12), n = 34;
        for (var i = 0; i < n; i++) {
          var gx = tx + 18 + r() * (tw3 - 36), gy = ty + 26 + r() * (th - 44), base = 8 * (1 + (r() - 0.5) * 2 * (1 - sort) * 0.9), sides = 4 + M.floor(r() * 3), pts = [];
          for (var j = 0; j < 24; j++) { var a = j / 24 * TAU, cn = M.pow(M.abs(M.cos(sides * a / 2)), 1 - round * 0.95), rr = base * (0.75 + 0.25 * cn) * (0.85 + 0.15 * M.sin(a * 3 + i)); pts.push([gx + rr * M.cos(a), gy + rr * M.sin(a) * 0.8]); }
          poly(ctx, pts, ['#c2a27a', '#d9c49a', '#a9916c', '#e3d3b0'][i % 4], 'rgba(0,0,0,0.3)', 0.8);
        }
        txt(ctx, 'Grains after ' + dist + ' km in a river', tx + 10, ty + 14, { size: 11.5, color: k.ink, bold: true });
        T.r(round < 0.25 ? 'angular' : round < 0.6 ? 'partly rounded' : 'well rounded'); T.s(sort < 0.3 ? 'poorly sorted (many sizes)' : sort < 0.7 ? 'moderately sorted' : 'well sorted (one size)');
        F.alt('Grain-size classes from boulders to clay with phi values, and a tray of grains after ' + dist + ' km of river travel.');
        F.say('The farther grains travel, the more their corners wear off (<b>rounding</b>) and the more alike in size they become (<b>sorting</b>). "Well sorted" means the grains in one sample are about the same size, not that they lie in separate layers.', 'Travel rounds grains and sorts them by size.');
      };
    }

    function structs(F) {
      F.size({ aspect: 1.8, max: 380, narrow: 1.1 });
      var st = ['crossbed', 'wave-ripples', 'current-ripples', 'mudcracks', 'graded'].indexOf(o.structure) >= 0 ? o.structure : 'crossbed', flip = !!o.flip, t = 0;
      var T = F.tiles([{ k: 'up', label: 'Way up', secret: true }, { k: 'cur', label: 'Current', secret: true }]);
      if (!F.lock) V.seg(F.ctl, { label: 'Structure', items: [['crossbed', 'Cross-beds'], ['current-ripples', 'Current ripples'], ['wave-ripples', 'Wave ripples'], ['mudcracks', 'Mud cracks'], ['graded', 'Graded bed']], value: st, change: function (v) { st = v; t = 0; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { t += dt * 0.3; F.redraw(); }, { label: 'Animate', auto: true });
      check(row, 'Turn the layer upside down', flip, function (v) { flip = v; F.redraw(); });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, y0 = 20, y1 = h - 20, tt = V.reduced && t === 0 ? 0.6 : t;
        ctx.save(); if (flip) { ctx.translate(0, h); ctx.scale(1, -1); }
        ctx.fillStyle = rgba(k.blue, 0.18); ctx.fillRect(0, y0, w, (y1 - y0) * 0.35);
        var sand = '#e0c690', sand2 = '#c9ad74';
        if (st === 'crossbed' || st === 'current-ripples') {
          var L = st === 'crossbed' ? w / 3 : w / 7, H = st === 'crossbed' ? (y1 - y0) * 0.28 : (y1 - y0) * 0.08, base = y1 - (st === 'crossbed' ? (y1 - y0) * 0.25 : (y1 - y0) * 0.3), sh = (tt * L * 0.5) % L;
          // older sets of cross-laminae below, cut by the base of the next set
          ctx.fillStyle = rgba(k.blue, 0.18); ctx.fillRect(0, y0, w, base - y0); ctx.fillStyle = sand2; ctx.fillRect(0, base, w, y1 - base);
          ctx.strokeStyle = 'rgba(90,70,40,0.6)'; ctx.lineWidth = 1; for (var xs = -w; xs < w * 2; xs += 10) { ctx.beginPath(); ctx.moveTo(xs, base); ctx.lineTo(xs + (y1 - base) * 1.4, y1); ctx.stroke(); }
          // the moving bedforms: gentle upstream side, steep downstream (lee) side
          ctx.fillStyle = sand; ctx.beginPath(); ctx.moveTo(0, base);
          for (var x = -L; x < w + L; x += L) { var xa = x + sh; ctx.lineTo(xa, base); ctx.lineTo(xa + L * 0.78, base - H); ctx.lineTo(xa + L, base); }
          ctx.lineTo(w, base); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(90,70,40,0.55)'; ctx.lineWidth = 1; for (x = -L; x < w + L; x += L) { var xa2 = x + sh; for (var dl = L * 0.08; dl < L * 0.95; dl += L * 0.12) { var tt2 = (L - dl) / L; ctx.beginPath(); ctx.moveTo(xa2 + L - dl, base); ctx.lineTo(xa2 + L - dl - 0.22 * L * tt2, base - H * tt2); ctx.stroke(); } } // foresets: old lee faces, parallel to today's
          if (!F.quiet) { arrow(ctx, w * 0.3, y0 + 18, w * 0.7, y0 + 18, { color: k.blue, w: 2.5 }); txt(ctx, 'current', w / 2, y0 + 32, { size: 12, color: k.blue, align: 'center', bold: true }); }
          T.cur(F.quiet ? '?' : 'left to right: the steep sides face downstream');
        } else if (st === 'wave-ripples') {
          var Lw = w / 8, Hw = (y1 - y0) * 0.07, bw = y1 - (y1 - y0) * 0.3, os = M.sin(tt * 6) * 10;
          ctx.fillStyle = sand; ctx.beginPath(); ctx.moveTo(0, y1); for (var x2 = 0; x2 <= w; x2 += 3) { var ph = (x2 % Lw) / Lw; ctx.lineTo(x2, bw - Hw * (1 - M.abs(ph * 2 - 1) * 2) * (ph < 0.5 ? 1 : 1)); } ctx.lineTo(w, y1); ctx.closePath(); ctx.fill();
          if (!F.quiet) { arrow(ctx, w / 2 - 40 + os, y0 + 20, w / 2 + 40 + os, y0 + 20, { color: k.blue, w: 2 }); arrow(ctx, w / 2 + 40 + os, y0 + 34, w / 2 - 40 + os, y0 + 34, { color: k.blue, w: 2 }); txt(ctx, 'water sloshes back and forth', w / 2, y0 + 50, { size: 12, color: k.blue, align: 'center', bold: true }); }
          T.cur('none: waves (symmetric crests)');
        } else if (st === 'mudcracks') {
          ctx.fillStyle = '#a3896a'; ctx.fillRect(0, y0 + (y1 - y0) * 0.35, w, (y1 - y0) * 0.65);
          var r = rng(5), cr = clamp(tt, 0, 1); ctx.strokeStyle = '#4a3a28'; ctx.lineWidth = 1 + cr * 4; for (var c = 0; c < 26; c++) { var cx = r() * w, cy = y0 + (y1 - y0) * (0.4 + r() * 0.55); ctx.beginPath(); ctx.moveTo(cx, cy); for (var s2 = 0; s2 < 3; s2++) ctx.lineTo(cx + (r() - 0.5) * 80 * cr, cy + (r() - 0.5) * 40 * cr); ctx.stroke(); }
          if (!F.quiet) txt(ctx, 'wet mud dries, shrinks and cracks into polygons; the edges curl up', w / 2, y0 + 16, { size: 12, color: k.ink, align: 'center', bold: true });
          T.cur('none: dried in air');
        } else {
          var g0 = y0 + (y1 - y0) * 0.3, n = 22, r3 = rng(8);
          ctx.fillStyle = '#b8a78c'; ctx.fillRect(0, g0, w, y1 - g0);
          for (var i = 0; i < 420; i++) { var gy = g0 + r3() * (y1 - g0), fr = (gy - g0) / (y1 - g0), sz = 1 + fr * fr * 7; circle(ctx, r3() * w, gy, sz * (0.6 + r3() * 0.5), ['#7d7368', '#9c8b72', '#c2a27a'][i % 3]); }
          if (!F.quiet) txt(ctx, 'a turbidity current: coarse grains settle first, fine ones last', w / 2, y0 + 16, { size: 12, color: k.ink, align: 'center', bold: true });
          T.cur('none: settling after an underwater flow');
        }
        ctx.restore();
        var wayUp = st === 'crossbed' || st === 'current-ripples' ? 'cross-laminae curve and flatten toward the bottom' : st === 'graded' ? 'coarse at the bottom, fine at the top' : st === 'mudcracks' ? 'cracks narrow downward' : 'ripple crests point up';
        T.up(flip ? 'this picture is upside down: ' + wayUp : 'right side up: ' + wayUp);
        if (F.quiet) T.up('?');
        F.alt('A sedimentary structure: ' + { crossbed: 'cross-beds left by migrating dunes', 'current-ripples': 'lopsided current ripples', 'wave-ripples': 'symmetric wave ripples', mudcracks: 'mud cracks', graded: 'a graded bed' }[st] + (flip ? ', shown upside down.' : '.'));
        F.say(st === 'wave-ripples' ? 'Waves slosh water back and forth, so wave ripples have even, symmetric crests and show no single current direction.' : st === 'current-ripples' || st === 'crossbed' ? 'A one-way current builds lopsided ripples and dunes: a gentle upstream side and a steep downstream side, where sand avalanches to form inclined layers (cross-beds). They point the way the current flowed.' : st === 'graded' ? 'A graded bed goes from coarse at the bottom to fine at the top, so it shows which way was up when it formed, even if the rock was later flipped.' : 'Mud cracks form where wet mud dries in the air, so they record a time when the mud was exposed.', 'Structures record how the sediment was laid down.');
      };
    }
  });

  /* es-landscape: Shaping the Land.
     opts:
       mode: 'river' | 'glacier' | 'slope' | 'wind'      modes: true or a list for tabs
       time: 0–1 (river: how far the meander has grown toward an oxbow); station: {width (m), depth (m), speed (m/s)} for the gauging station
       balance: glacier mass balance (m of water a year, −3 to +3)
       angle, frictionAngle (degrees, slope); wet: 0–1 (how much of the soil is filled with water)
       blank: true (letters on landforms); quiet: hides discharge, factor of safety, terminus position and landform names; lock */
  R('es-landscape', function (el, o) {
    var F = frame(el, o, 'Shaping the land', { aspect: 1.6, max: 460 });
    return F.modes({ river: river, glacier: glacier, slope: slopeM, wind: wind }, { river: 'Rivers', glacier: 'Glaciers', slope: 'Slopes', wind: 'Wind' });
    function L(nm, i) { return o.blank ? LETTERS[i] : nm; }

    function river(F) {
      F.size({ aspect: 1.55, max: 480, narrow: 0.75 });
      var st = o.station || {}, P = { t: clamp(num(o.time, 0.3), 0, 1), w: num(st.width, 20), d: num(st.depth, 1.5), v: num(st.speed, 0.8) };
      var T = F.tiles([{ k: 'q', label: 'Discharge Q = w × d × v', secret: true }]);
      var tsl = V.slider(F.ctl, { label: 'Time', min: 0, max: 1, step: 0.01, value: P.t, fmt: function (v) { return v < 0.95 ? 'meander growing' : 'cut off: oxbow lake'; }, input: function (v) { P.t = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { P.t = M.min(1, P.t + dt * 0.12); tsl.set(P.t); F.redraw(); if (P.t >= 1) return false; }, { label: 'Let it flow', reset: function () { if (P.t >= 1) P.t = 0; } });
      if (!o.station) { V.slider(row, { label: 'Width', min: 5, max: 60, step: 1, value: P.w, fmt: function (v) { return v + ' m'; }, input: function (v) { P.w = v; F.redraw(); } }); V.slider(row, { label: 'Depth', min: 0.3, max: 5, step: 0.1, value: P.d, fmt: function (v) { return fm(v, 1) + ' m'; }, input: function (v) { P.d = v; F.redraw(); } }); V.slider(row, { label: 'Speed', min: 0.1, max: 3, step: 0.05, value: P.v, fmt: function (v) { return fm(v, 2) + ' m/s'; }, input: function (v) { P.v = v; F.redraw(); } }); }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, ph = wide ? h * 0.36 : h * 0.3;
        // long profile: steep head to base level (sea)
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, ph);
        var prof = []; for (var x = 0; x <= 1.0001; x += 0.02) prof.push([10 + x * (w - 20), 14 + (ph - 40) * (1 - M.exp(-x * 3.2)) / (1 - M.exp(-3.2))]);
        poly(ctx, [[10, ph]].concat(prof, [[w - 10, ph]]), k.landDark); line(ctx, prof, { color: k.blue, w: 3 });
        ctx.fillStyle = k.sea; ctx.fillRect(w * 0.9, prof[prof.length - 1][1] - 2, w * 0.1, ph - prof[prof.length - 1][1] + 2);
        var LB = labeler(ctx);
        if (!F.quiet) { LB.put(L('steep, narrow V-shaped valley', 0), 16, 26, { size: 11, color: k.ink, halo: k.halo }); LB.put(L('gentle: wide floodplain', 1), w * 0.55, ph - 24, { size: 11, color: k.ink, halo: k.halo }); LB.put(L('delta at base level (the sea)', 2), w - 12, ph - 8, { size: 11, color: k.ink, align: 'right', halo: k.halo }); }
        else if (o.blank) { badge(ctx, 'A', 40, 34, { k: k }); badge(ctx, 'B', w * 0.6, ph - 30, { k: k }); badge(ctx, 'C', w - 30, ph - 16, { k: k }); }
        txt(ctx, 'Long profile: from the mountains to the sea', w / 2, ph + 2, { size: 10.5, color: k.muted, align: 'center', base: 'top' });
        // plan view: a sine-generated meander (the channel's direction swings as ω·sin(2πs)); the loop grows with time until it cuts itself off
        var my = ph + 22, mh = h - my - 8, mw = wide ? w * 0.62 : w - 20, om = 0.7 + 1.55 * P.t, cutoff = P.t >= 0.95;
        ctx.fillStyle = k.landSoft; ctx.fillRect(10, my, mw, mh);
        var raw = [[0, 0]], th0 = 0; for (var si = 1; si <= 300; si++) { var sv = si / 300 * 1.5, ang = om * M.sin(2 * PI * sv); raw.push([raw[si - 1][0] + M.cos(ang) / 300, raw[si - 1][1] + M.sin(ang) / 300]); }
        var xs = raw.map(function (q) { return q[0]; }), ys = raw.map(function (q) { return q[1]; }), xmn = M.min.apply(null, xs), xmx = M.max.apply(null, xs), ymn = M.min.apply(null, ys), ymx = M.max.apply(null, ys);
        var sc = M.min((mw - 30) / (xmx - xmn), (mh - 40) / M.max(0.05, ymx - ymn)), pts = raw.map(function (q) { return [10 + 15 + (q[0] - xmn) * sc + ((mw - 30) - (xmx - xmn) * sc) / 2, my + 20 + (q[1] - ymn) * sc + ((mh - 40) - (ymx - ymn) * sc) / 2]; });
        var ymid = (M.min.apply(null, pts.map(function (q) { return q[1]; })) + M.max.apply(null, pts.map(function (q) { return q[1]; }))) / 2;
        if (cutoff) {
          // the river takes the short cut across the neck; the old loop becomes an oxbow lake
          var a1 = 50, a2 = 150; line(ctx, pts.slice(a1, a2 + 1), { color: rgba(k.blue, 0.5), w: 10 }); line(ctx, pts.slice(0, a1 + 1).concat(pts.slice(a2)), { color: k.blue, w: 12 });
          var oc = pts[100]; if (!F.quiet) LB.put(L('oxbow lake', 3), oc[0], oc[1] + (oc[1] > ymid ? 22 : -22), { size: 11.5, color: k.ink, align: 'center', bold: true, halo: k.halo }); else if (o.blank) badge(ctx, 'D', oc[0], oc[1], { k: k });
        } else {
          line(ctx, pts, { color: k.blue, w: 12 });
          var iA = 100, pA = pts[iA], tA = [pts[iA + 2][0] - pts[iA - 2][0], pts[iA + 2][1] - pts[iA - 2][1]], tl = M.hypot(tA[0], tA[1]) || 1; tA = [tA[0] / tl, tA[1] / tl];
          var nA = [-tA[1], tA[0]], cvx = pts[iA + 8][0] + pts[iA - 8][0] - 2 * pA[0], cvy = pts[iA + 8][1] + pts[iA - 8][1] - 2 * pA[1], out = cvx * nA[0] + cvy * nA[1] > 0 ? -1 : 1; // the outside of the bend is away from its center
          for (var a = -1; a <= 1; a++) { var off = a * 3.8, len = 12 + (a * out + 1) * 11; arrow(ctx, pA[0] + nA[0] * off - tA[0] * len / 2, pA[1] + nA[1] * off - tA[1] * len / 2, pA[0] + nA[0] * off + tA[0] * len / 2, pA[1] + nA[1] * off + tA[1] * len / 2, { color: '#fff', w: 1.4, head: 5 }); }
          var outP = [pA[0] + nA[0] * out * 26, pA[1] + nA[1] * out * 26], inP = [pA[0] - nA[0] * out * 26, pA[1] - nA[1] * out * 26];
          if (!F.quiet) { LB.put(L('cut bank: fast water wears it away', 4), outP[0], outP[1], { size: 11, color: k.rust, align: 'center', bold: true, halo: k.halo }, [0, -12, 12]); LB.put(L('point bar: slow water drops sand', 5), inP[0], inP[1], { size: 11, color: k.dark ? '#ffd479' : '#8a6a00', align: 'center', bold: true, halo: k.halo }, [0, 12, -12]); }
          else if (o.blank) { badge(ctx, 'D', outP[0], outP[1], { k: k }); badge(ctx, 'E', inP[0], inP[1], { k: k }); }
          ctx.save(); ctx.fillStyle = rgba(k.gold, 0.45); ctx.beginPath(); ctx.arc(pA[0] - nA[0] * out * 17, pA[1] - nA[1] * out * 17, 9, 0, TAU); ctx.fill(); ctx.restore();
        }
        // gauging station
        var gx = wide ? 10 + mw + 16 : 10, gy = wide ? my : my, gw = wide ? w - gx - 10 : 0, gh = mh;
        if (wide) {
          ctx.save(); ctx.fillStyle = k.panel; rrect(ctx, gx, gy, gw, gh, 10); ctx.fill(); ctx.restore();
          txt(ctx, 'Gauging station', gx + 10, gy + 14, { size: 11.5, color: k.ink, bold: true });
          var sx = gx + 16, sw = gw - 32, sy = gy + 40, sd = M.min(gh - 70, 30 + P.d * 14);
          poly(ctx, [[sx, sy], [sx + sw, sy], [sx + sw * 0.85, sy + sd], [sx + sw * 0.15, sy + sd]], rgba(k.blue, 0.5), k.blue);
          txt(ctx, 'width ' + fm(P.w, 0) + ' m', sx + sw / 2, sy - 8, { size: 10.5, color: k.ink, align: 'center' }); txt(ctx, 'depth ' + fm(P.d, 1) + ' m', sx + sw / 2, sy + sd / 2, { size: 10.5, color: k.ink, align: 'center' }); txt(ctx, 'speed ' + fm(P.v, 2) + ' m/s', sx + sw / 2, sy + sd + 14, { size: 10.5, color: k.ink, align: 'center' });
        }
        var Q = P.w * P.d * P.v; T.q(nf(Q, 1) + ' m³/s');
        F.alt('A river’s long profile from steep mountains to the sea, and a meander bend seen from above' + (P.t >= 0.95 ? ' that has been cut off as an oxbow lake.' : ' with the fastest water on the outside of the bend.'));
        F.say('Water flows fastest on the <b>outside</b> of a bend, wearing away the cut bank, and slowest on the inside, where it drops sand (a point bar). Bends grow until the river cuts across the neck, leaving an oxbow lake. Discharge = width × depth × speed = <b>' + nf(Q, 1) + ' m³/s</b>; big gentle rivers carry far more water than steep mountain streams.', 'The fastest water is on the outside of a bend.');
      };
    }

    function glacier(F) {
      F.size({ aspect: 1.7, max: 400, narrow: 0.9 });
      var P = { b: clamp(num(o.balance, 0), -3, 3), term: 0.72, after: false, t: 0 };
      P.term = clamp(0.72 + P.b * 0.07, 0.4, 0.95);
      var T = F.tiles([{ k: 'b', label: 'Mass balance', secret: true }, { k: 'end', label: 'The end of the glacier', secret: true }]);
      V.slider(F.ctl, { label: 'Yearly snow gained minus ice melted', min: -3, max: 3, step: 0.1, value: P.b, fmt: function (v) { return (v > 0 ? '+' : '') + fm(v, 1) + ' m'; }, input: function (v) { P.b = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { P.t += dt; var target = clamp(0.72 + P.b * 0.07, 0.35, 0.95); P.term += (target - P.term) * M.min(1, dt * 0.4); F.redraw(); }, { label: 'Run the years', auto: !o.lock });
      check(row, 'Show the land after the ice melts', P.after, function (v) { P.after = v; F.redraw(); });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h;
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, h);
        function ground(x) { return h * 0.15 + (h * 0.75) * M.pow(x, 0.8); } // valley floor, steep near the top
        poly(ctx, [[0, h]].concat(Array.from({ length: 51 }, function (_, i) { var x = i / 50; return [x * w, ground(x)]; }), [[w, h]]), k.rockDark);
        if (!P.after) {
          var top = [], ela = 0.42, xe = P.term;
          for (var i = 0; i <= 60; i++) { var x = i / 60 * xe, th = 0.09 * h * M.sqrt(M.max(0, 1 - x / xe)) * (1 - 0.3 * x); top.push([x * w, ground(x) - th]); }
          var bot = []; for (i = 60; i >= 0; i--) { x = i / 60 * xe; bot.push([x * w, ground(x)]); }
          poly(ctx, top.concat(bot), k.ice, k.blue, 1.5);
          // snowy accumulation zone
          ctx.save(); ctx.beginPath(); ctx.rect(0, 0, ela * w, h); ctx.clip(); poly(ctx, top.concat(bot), '#ffffff', null); ctx.restore();
          line(ctx, [[ela * w, ground(ela) - 0.1 * h], [ela * w, ground(ela) + 8]], { color: k.rust, w: 2, dash: [5, 3] });
          // flow arrows inside the ice: always downhill, even when the end retreats
          for (var f = 0.08; f < xe - 0.05; f += 0.1) { var g1 = ground(f) - 0.035 * h, g2 = ground(f + 0.05) - 0.035 * h; arrow(ctx, f * w, g1, (f + 0.05) * w, g2, { color: k.blue, w: 1.6, head: 6 }); }
          if (!F.quiet) { txt(ctx, L('accumulation zone: more snow than melt', 0), ela * w * 0.5, ground(0.2) - 0.14 * h, { size: 11, color: k.ink, align: 'center', halo: k.halo }); txt(ctx, L('ablation zone: more melt', 1), (ela + xe) / 2 * w, ground((ela + xe) / 2) - 0.12 * h, { size: 11, color: k.ink, align: 'center', halo: k.halo }); txt(ctx, 'equilibrium line', ela * w + 6, ground(ela) + 16, { size: 10.5, color: k.rust }); }
          circle(ctx, xe * w, ground(xe) - 2, 4, k.rust); if (!F.quiet) txt(ctx, 'end (terminus)', xe * w + 8, ground(xe) - 10, { size: 10.5, color: k.ink, halo: k.halo });
        } else {
          // landforms left behind (labels; drawn simply on the valley)
          var lf = [['cirque', 0.08], ['arête and horn', 0.02], ['U-shaped valley', 0.35], ['lateral moraine', 0.55], ['end moraine', P.term], ['till and erratic boulders', P.term + 0.06]];
          var r = rng(4); for (var q = 0; q < 40; q++) { var xq = (0.3 + r() * (P.term - 0.25)) * w; circle(ctx, xq, ground(xq / w) - 2, 1.5 + r() * 3, '#9c8f80'); }
          ctx.fillStyle = '#9c8f80'; ctx.beginPath(); ctx.ellipse(P.term * w, ground(P.term) - 4, 18, 9, 0, PI, TAU); ctx.fill();
          circle(ctx, (P.term + 0.06) * w, ground(P.term + 0.06) - 9, 9, '#7d7368');
          lf.forEach(function (l, i) { var xx = clamp(l[1], 0.04, 0.96) * w; if (F.quiet && !o.blank) return; if (o.blank) badge(ctx, LETTERS[i], xx, ground(l[1]) - 26, { k: k }); else txt(ctx, l[0], xx, ground(clamp(l[1], 0, 1)) - 22 - (i % 2) * 14, { size: 11, color: k.ink, align: 'center', halo: k.halo }); });
        }
        var adv = P.b > 0.15 ? 'advancing' : P.b < -0.15 ? 'retreating' : 'holding steady';
        T.b((P.b > 0 ? '+' : '') + fm(P.b, 1) + ' m of water a year'); T.end(adv);
        F.alt('A valley glacier with its accumulation zone, ablation zone and end' + (P.after ? '; after melting, the landforms it left.' : '. Flow arrows point downhill.'));
        F.say('Ice always flows downhill, from where snow piles up to where it melts. When more melts than arrives, the end <b>retreats</b> even though the ice still flows forward; when more arrives, the end advances. Now: <b>' + adv + '</b>. Melting ice drops a jumble of all sizes (till), unlike sorted river deposits.', 'A retreating glacier still flows downhill; its end melts back faster than ice arrives.');
      };
    }

    function slopeM(F) {
      F.size({ aspect: 1.7, max: 400, narrow: 0.95 });
      var P = { a: clamp(num(o.angle, 30), 5, 60), phi: clamp(num(o.frictionAngle, 35), 10, 50), wet: clamp(num(o.wet, 0), 0, 1) };
      var T = F.tiles([{ k: 'fs', label: 'Factor of safety', secret: true }, { k: 'v', label: 'Verdict', secret: true }]);
      V.slider(F.ctl, { label: 'Slope angle', min: 5, max: 60, step: 1, value: P.a, fmt: function (v) { return v + '°'; }, input: function (v) { P.a = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Friction angle of the soil', min: 10, max: 50, step: 1, value: P.phi, fmt: function (v) { return v + '°'; }, input: function (v) { P.phi = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Water in the soil', min: 0, max: 1, step: 0.05, value: P.wet, fmt: function (v) { return v === 0 ? 'dry' : v < 1 ? fm(v * 100, 0) + '% full' : 'soaked'; }, input: function (v) { P.wet = v; F.redraw(); } });
      /* an infinite slope of sandy soil, water flowing parallel to the slope: FS = (1 − m·γw/γsat)·tan φ / tan θ,
         m = how full of water (0–1), γw/γsat ≈ 9.8/20 ≈ 0.49 when soaked. Dry: FS = tan φ / tan θ. */
      function fs() { return (1 - P.wet * 0.49) * M.tan(P.phi * RAD) / M.tan(P.a * RAD); }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, th = P.a * RAD, x0 = w * 0.08, y0 = h * 0.88, L = M.min(w * 0.6 / M.cos(th), h * 0.8 / M.sin(th));
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, h);
        var x1 = x0 + L * M.cos(th), y1 = y0 - L * M.sin(th);
        poly(ctx, [[x0, y0], [x1, y1], [x1, h], [x0, h]], k.soil);
        if (P.wet > 0) poly(ctx, [[x0, y0], [x1, y1], [x1, y1 + 30 * P.wet + 6], [x0, y0 + 30 * P.wet + 6]], rgba(k.blue, 0.35 + 0.3 * P.wet));
        // a block of soil on the slope, with forces
        var mx = (x0 + x1) / 2, my = (y0 + y1) / 2, bs = 46, F0 = fs();
        ctx.save(); ctx.translate(mx, my); ctx.rotate(-th); ctx.fillStyle = '#b08960'; ctx.fillRect(-bs / 2, -bs, bs, bs); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.strokeRect(-bs / 2, -bs, bs, bs);
        var drive = M.sin(th) * 80, resist = M.min(140, M.cos(th) * M.tan(P.phi * RAD) * (1 - P.wet * 0.49) * 80);
        arrow(ctx, 0, -bs / 2, -drive, -bs / 2, { color: k.red, w: 3 }); arrow(ctx, 0, -bs / 2 - 10, resist, -bs / 2 - 10, { color: k.green, w: 3 });
        ctx.restore();
        if (!F.quiet) { txt(ctx, 'pull down the slope', mx - 70, my - 60, { size: 11, color: k.red, bold: true, halo: k.halo }); txt(ctx, 'friction holding it', mx + 20, my - 80, { size: 11, color: k.dark ? '#8ce99a' : '#2b8a3e', bold: true, halo: k.halo }); }
        ctx.save(); ctx.strokeStyle = k.ink; ctx.beginPath(); ctx.arc(x0, y0, 40, -th, 0); ctx.stroke(); ctx.restore(); txt(ctx, P.a + '°', x0 + 46, y0 - 10, { size: 12, color: k.ink });
        if (P.wet > 0 && !F.quiet) txt(ctx, 'water in the pores pushes grains apart: less friction', x0 + 10, h - 12, { size: 11, color: k.blue, bold: true });
        var verdict = F0 < 1 ? 'fails: it slides' : F0 < 1.3 ? 'barely stable' : 'stable';
        T.fs(fm(F0, 2)); T.v(verdict);
        F.alt('Soil on a ' + (F.quiet ? '' : P.a + ' degree ') + 'slope with arrows for the pull down the slope and the friction holding it.' + (P.wet > 0 ? ' Water fills the pores.' : ''));
        F.say('Factor of safety = holding ÷ pulling = (1 − ' + fm(0.49 * P.wet, 2) + ') × tan ' + P.phi + '° ÷ tan ' + P.a + '° = <b>' + fm(F0, 2) + '</b>: the slope ' + (F0 < 1 ? '<b>fails</b>' : 'holds') + '. Water adds a little weight, but mainly it fills the pores and pushes the grains apart, cutting the friction that holds them: soaked soil can lose about half its grip.', 'Water in the pores cuts the friction that holds a slope.');
      };
    }

    function wind(F) {
      F.size({ aspect: 1.9, max: 360, narrow: 1.1 });
      var t = 0;
      var row = F.row(); F.player(row, function (dt) { t += dt; F.redraw(); }, { label: 'Blow', auto: true });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, base = h * 0.78, tt = V.reduced && t === 0 ? 0.5 : t;
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, base);
        ctx.fillStyle = k.sand; ctx.fillRect(0, base, w, h - base);
        var dunes = [[0.25, 0.22, 0.2], [0.62, 0.16, 0.15]];
        dunes.forEach(function (d, i) { var cx = d[0] * w + (tt * 6) % 40, hw = d[1] * w, hh = d[2] * h; ctx.fillStyle = mixHex(k.sand, '#c69c5a', 0.25); ctx.beginPath(); ctx.moveTo(cx - hw, base); ctx.quadraticCurveTo(cx - hw * 0.3, base - hh * 1.1, cx + hw * 0.25, base - hh); ctx.lineTo(cx + hw * 0.55, base); ctx.closePath(); ctx.fill(); if (!F.quiet) { txt(ctx, L('gentle windward side', i * 2), cx - hw * 0.55, base - hh * 0.75, { size: 10.5, color: k.ink, align: 'center', halo: k.halo }); txt(ctx, L('steep slip face', i * 2 + 1), cx + hw * 0.5, base - hh * 0.7, { size: 10.5, color: k.ink, align: 'left', halo: k.halo }); } });
        var r = rng(3); for (var g = 0; g < 50; g++) { var gx = (r() * w + tt * 90 * (0.6 + r())) % w, ph = ((gx / 40) % 1), gy = base - 4 - 16 * M.sin(ph * PI) * r(); circle(ctx, gx, gy, 1.4, '#a8864f'); }
        if (!F.quiet) { arrow(ctx, 20, 30, 140, 30, { color: k.blue, w: 2.5 }); txt(ctx, 'wind', 20, 46, { size: 12, color: k.blue, bold: true }); }
        // desert pavement on the right
        var px = w * 0.86, pw = w * 0.12; var r2 = rng(6); for (var s = 0; s < 18; s++) { ctx.fillStyle = ['#7d7368', '#8f8172', '#6b6157'][s % 3]; ctx.beginPath(); ctx.ellipse(px + r2() * pw, base + 3 + r2() * 4, 5 + r2() * 4, 3, 0, 0, TAU); ctx.fill(); }
        if (!F.quiet) txt(ctx, L('desert pavement: wind blew the fine grains away', 4), w - 8, h - 10, { size: 10.5, color: k.ink, align: 'right' });
        F.alt('Sand dunes moving with the wind: a gentle windward side and a steep slip face downwind; grains hop along the ground; stones left behind form desert pavement.');
        F.say('Wind lifts sand in short hops (saltation) up the gentle windward side; at the crest the sand slides down the steep slip face, which always faces downwind, so the dune creeps forward. Where wind blows away the fine grains (deflation), a pavement of stones is left.', 'A dune’s steep slip face points downwind.');
      };
    }
  });

  /* ---------- rock patterns for cross-sections (computed per pixel; u, v in pixels of the layer's own frame) ---------- */
  var PAT = {
    sandstone: [[226, 205, 150], function (u, v) { var cx = M.floor(u / 7), cy = M.floor(v / 7), hx = (M.sin(cx * 12.9898 + cy * 78.233) * 43758.5) % 1, ox = u - (cx + 0.5 + (hx - 0.5) * 0.4) * 7, oy = v - (cy + 0.5) * 7; return ox * ox + oy * oy < 1.6 ? 0.55 : 1; }],
    shale: [[150, 150, 145], function (u, v) { var row = M.floor(v / 6), yy = v - row * 6, xx = (u + row * 5) % 14; return yy < 1.3 && xx < 9 ? 0.6 : 1; }],
    siltstone: [[184, 170, 146], function (u, v) { return ((M.floor(u / 4) * 7 + M.floor(v / 4) * 13) % 9 === 0) ? 0.65 : 1; }],
    limestone: [[188, 205, 214], function (u, v) { var row = M.floor(v / 9), yy = v - row * 9, xx = (u + (row % 2) * 9) % 18; return yy < 1.2 || xx < 1.2 ? 0.62 : 1; }],
    conglomerate: [[200, 178, 140], function (u, v) { var cx = M.floor(u / 12), cy = M.floor(v / 12), ox = u - cx * 12 - 6, oy = v - cy * 12 - 6, d = ox * ox / 20 + oy * oy / 12; return M.abs(d - 1) < 0.3 ? 0.55 : 1; }],
    coal: [[40, 38, 36], function () { return 1; }],
    basalt: [[88, 88, 92], function (u, v) { var cx = M.floor(u / 9), cy = M.floor(v / 9), ox = u - cx * 9 - 4.5, oy = v - cy * 9 - 3; return (M.abs(ox) - oy < 1 && M.abs(ox) - oy > -0.6 && oy > -1 && oy < 3) ? 1.6 : 1; }],
    granite: [[226, 180, 168], function (u, v) { var cx = (u % 12) - 6, cy = (v % 12) - 6; return (M.abs(cx) < 0.9 && M.abs(cy) < 3.5) || (M.abs(cy) < 0.9 && M.abs(cx) < 3.5) ? 0.6 : 1; }],
    ash: [[236, 232, 222], function (u, v) { var cx = (u % 8) - 4, cy = (v % 6) - 3; return M.abs(M.abs(cx) - cy) < 0.7 && cy > -2 ? 0.75 : 1; }],
    schist: [[160, 160, 150], function (u, v) { var yy = (v + 3 * M.sin(u / 7)) % 7; return yy < 1.3 ? 0.6 : 1; }]
  };
  var ROCK_NAMES = { sandstone: 'sandstone', shale: 'shale', siltstone: 'siltstone', limestone: 'limestone', conglomerate: 'conglomerate', coal: 'coal', basalt: 'basalt', granite: 'granite', ash: 'volcanic ash bed', schist: 'schist (old metamorphic rock)' };

  /* a history of events -> a function giving the rock at any point. Coordinates: x 0..2 across, z 0..1 up. */
  function buildHistory(events) {
    var E = [], level = 0.08, id = 0;
    events.forEach(function (ev, i) {
      var e = Object.assign({}, ev); e.i = i;
      if (e.t === 'deposit' || e.t === 'lava') { e.thick = num(e.thick, e.t === 'lava' ? 0.05 : e.rock === 'ash' ? 0.025 : 0.08); e.top = level + e.thick; level = e.top; e.rock = e.t === 'lava' ? 'basalt' : (PAT[e.rock] ? e.rock : 'sandstone'); }
      else if (e.t === 'erode') { var lv = num(e.level, level - num(e.depth, 0.06)), amp = num(e.amp, 0.012), ph = num(e.phase, 1); e.surf = function (x) { return lv + amp * M.sin(x * 9 + ph) + amp * 0.5 * M.sin(x * 23 + ph * 2); }; e.lv = lv; level = lv + amp; }
      else if (e.t === 'tilt') { e.a = num(e.deg, 20) * RAD; e.px = num(e.px, 1); e.pz = num(e.pz, 0); }
      else if (e.t === 'fold') { e.A = num(e.amp, 0.08); e.L = num(e.wave, 1.4); e.ph = num(e.phase, 0); }
      else if (e.t === 'fault') { e.xs = num(e.x, 1); e.dip = num(e.dip, 60) * RAD; e.dir = e.dipDir === 'left' ? -1 : 1; e.slip = num(e.slip, 0.08); e.kind = e.kind === 'reverse' ? 'reverse' : 'normal'; }
      else if (e.t === 'intrude') { e.kind = e.kind || 'dike'; e.x = num(e.x, 0.8 * 2); e.w = num(e.w, e.kind === 'dike' ? 0.05 : 0.04); e.ztop = num(e.ztop, level - 0.005); e.rock = e.kind === 'pluton' ? 'granite' : 'basalt'; if (e.kind === 'sill') e.z = num(e.z, level * 0.6); }
      E.push(e);
    });
    E.level = level;
    function inFault(e, x, z) { var xp = e.xs + e.dir * (1 - z) / M.tan(e.dip); return e.dir > 0 ? x > xp : x < xp; }
    function faultVec(e) { var s = e.kind === 'normal' ? 1 : -1; return [e.dir * M.cos(e.dip) * e.slip * s, -M.sin(e.dip) * e.slip * s]; } // hanging wall motion
    function insideIntr(e, x, z) {
      if (e.kind === 'dike') return M.abs(x - e.x - (z - 0.5) * 0.15) < e.w / 2 && z < e.ztop;
      if (e.kind === 'sill') return M.abs(z - e.z) < e.w / 2 && x > num(e.x1, 0.3) && x < num(e.x2, 1.7);
      var dx = (x - e.x) / 0.32, dz = (z - 0.0) / 0.22; return dx * dx + dz * dz < 1 + 0.08 * M.sin(x * 20);
    }
    function distIntr(e, x, z) { // rough distance outside the intrusion
      if (e.kind === 'dike') return z < e.ztop + 0.02 ? M.abs(x - e.x - (z - 0.5) * 0.15) - e.w / 2 : 1;
      if (e.kind === 'sill') return x > num(e.x1, 0.3) - 0.02 && x < num(e.x2, 1.7) + 0.02 ? M.abs(z - e.z) - e.w / 2 : 1;
      var dx = (x - e.x) / 0.32, dz = z / 0.22; return (M.sqrt(dx * dx + dz * dz) - 1) * 0.25;
    }
    /* rock(x, z, upto): {id (event index, −1 basement, −2 air), u, v (coords in that rock's frame), baked} */
    function rock(x, z, upto) {
      var pending = -1, pu = 0, pv = 0, bakedAt = -1, n = upto == null ? E.length - 1 : upto;
      for (var j = n; j >= 0; j--) {
        var e = E[j];
        if (e.t === 'deposit' || e.t === 'lava') {
          if (z > e.top) return pending >= 0 ? { id: pending, u: pu, v: pv, baked: false } : { id: -2 };
          if (e.t === 'lava' && z < e.top - e.thick && z > e.top - e.thick - 0.015) bakedAt = j;
          pending = j; pu = x; pv = z;
        } else if (e.t === 'erode') { if (z > e.surf(x)) return pending >= 0 ? { id: pending, u: pu, v: pv, baked: false } : { id: -2 }; }
        else if (e.t === 'tilt') { var c = M.cos(-e.a), s = M.sin(-e.a), dx = x - e.px, dz = z - e.pz; x = e.px + dx * c - dz * s; z = e.pz + dx * s + dz * c; }
        else if (e.t === 'fold') z -= e.A * M.sin(2 * PI * x / e.L + e.ph);
        else if (e.t === 'fault') { if (inFault(e, x, z)) { var fv = faultVec(e); x += -fv[0]; z += -fv[1]; } }
        else if (e.t === 'intrude') { if (insideIntr(e, x, z)) return { id: j, u: x, v: z, baked: false }; if (distIntr(e, x, z) < 0.018) bakedAt = j; }
      }
      if (z > 0.08) return pending >= 0 ? { id: pending, u: pu, v: pv, baked: bakedAt >= 0 && bakedAt > pending ? false : false } : { id: -2 };
      return { id: -1, u: x, v: z, baked: bakedAt >= 0 };
    }
    function rockB(x, z, upto) { var r = rock(x, z, upto); if (r.id >= 0 && bakedAt(x, z, upto, r.id)) r.baked = true; return r; }
    function bakedAt(x, z, upto, id) { // is this point within reach of an intrusion younger than its rock (or just under a lava flow)?
      var n = upto == null ? E.length - 1 : upto, X = x, Z = z;
      for (var j = n; j > id; j--) { var e = E[j]; if (e.t === 'tilt') { var c = M.cos(-e.a), s = M.sin(-e.a), dx = X - e.px, dz = Z - e.pz; X = e.px + dx * c - dz * s; Z = e.pz + dx * s + dz * c; } else if (e.t === 'fold') Z -= e.A * M.sin(2 * PI * X / e.L + e.ph); else if (e.t === 'fault') { if (inFault(e, X, Z)) { var fv = faultVec(e); X -= fv[0]; Z -= fv[1]; } } else if (e.t === 'intrude') { if (distIntr(e, X, Z) < 0.018) return true; } else if (e.t === 'lava') { if (Z < e.top - e.thick && Z > e.top - e.thick - 0.016) return true; } }
      return false;
    }
    // forward map of a point from the frame after event j0 to the frame after event n (for drawing faults and unconformities)
    function fwd(x, z, j0, n) {
      for (var j = j0 + 1; j <= n; j++) { var e = E[j]; if (e.t === 'tilt') { var c = M.cos(e.a), s = M.sin(e.a), dx = x - e.px, dz = z - e.pz; x = e.px + dx * c - dz * s; z = e.pz + dx * s + dz * c; } else if (e.t === 'fold') z += e.A * M.sin(2 * PI * x / e.L + e.ph); else if (e.t === 'fault') { if (inFault(e, x, z)) { var fv = faultVec(e); x += fv[0]; z += fv[1]; } } }
      return [x, z];
    }
    return { E: E, rock: rockB, fwd: fwd, inFault: inFault, faultVec: faultVec };
  }
  // a random but sensible history for generators: deposits, then deformation, erosion, more deposits, an intrusion, maybe a fault
  function randomHistory(seed, steps) {
    var r = rng(seed || 1), rocks = ['sandstone', 'shale', 'limestone', 'siltstone', 'conglomerate'], ev = [], n1 = 3 + M.floor(r() * 2);
    for (var i = 0; i < n1; i++) ev.push({ t: 'deposit', rock: rocks[M.floor(r() * rocks.length)], thick: 0.07 + r() * 0.05 });
    var def = r(); if (def < 0.45) ev.push({ t: 'tilt', deg: (r() < 0.5 ? -1 : 1) * (12 + r() * 18) }); else if (def < 0.75) ev.push({ t: 'fold', amp: 0.05 + r() * 0.04, wave: 1.2 + r() * 0.8, phase: r() * 6 });
    ev.push({ t: 'erode', depth: 0.06 + r() * 0.04, phase: r() * 6 });
    var n2 = 1 + M.floor(r() * 2); for (i = 0; i < n2; i++) ev.push({ t: 'deposit', rock: rocks[M.floor(r() * rocks.length)], thick: 0.06 + r() * 0.05 });
    if (r() < 0.7) ev.splice(ev.length - (r() < 0.5 ? 0 : n2), 0, { t: 'intrude', kind: 'dike', x: 0.4 + r() * 1.2 });
    if (r() < 0.5) ev.push({ t: 'fault', x: 0.5 + r() * 1.0, dip: 55 + r() * 15, dipDir: r() < 0.5 ? 'left' : 'right', kind: r() < 0.6 ? 'normal' : 'reverse', slip: 0.05 + r() * 0.05 });
    if (steps) ev = ev.slice(0, M.max(3, steps));
    return ev;
  }

  /* es-strata: Rock Layers.
     opts:
       mode: 'section' | 'correlate'      modes: true or a list for tabs
       events: [{t: 'deposit', rock, fossil, thick}, {t: 'tilt', deg}, {t: 'fold', amp, wave}, {t: 'erode', depth},
                {t: 'fault', x, dip, dipDir: 'left'|'right', kind: 'normal'|'reverse', slip}, {t: 'intrude', kind: 'dike'|'sill'|'pluton', x, age},
                {t: 'lava'}, …] oldest first. Rocks: sandstone, shale, siltstone, limestone, conglomerate, coal, ash.
                x runs 0 to 2 across the section; heights 0 to 1. Ash beds and intrusions may carry age (million years).
       seed, steps: a random history for generators (the same seed gives the same history)
       letters: true (letter the layers, intrusions, faults and unconformities, in a shuffled order); replay: true (step through events)
       ages: true (show the ages of dated beds); columns: correlate data [[{rock, thick, fossil, key}], …] bottom to top
       quiet: hides the event list, rock names and the order; lock */
  var FOSSIL_ICON = { trilobite: 'T', ammonite: 'A', brachiopod: 'B', fern: 'F', fish: 'f' };
  R('es-strata', function (el, o) {
    var F = frame(el, o, 'Rock layers', { aspect: 2.0, max: 420 });
    return F.modes({ section: section, correlate: correlate }, { section: 'Cross-section', correlate: 'Match the layers' });

    function section(F) {
      F.size({ aspect: 2.0, max: 420, narrow: 1.2 });
      var events = o.events || (o.seed ? randomHistory(num(o.seed, 1), o.steps) : [{ t: 'deposit', rock: 'sandstone' }, { t: 'deposit', rock: 'shale', fossil: 'trilobite' }, { t: 'deposit', rock: 'limestone', fossil: 'brachiopod' }, { t: 'deposit', rock: 'siltstone' }, { t: 'tilt', deg: 18 }, { t: 'erode', depth: 0.08 }, { t: 'deposit', rock: 'conglomerate' }, { t: 'deposit', rock: 'ash', age: 95 }, { t: 'deposit', rock: 'sandstone' }, { t: 'intrude', kind: 'dike', x: 1.45, age: 80 }, { t: 'fault', x: 0.7, dip: 62, dipDir: 'left', kind: 'normal', slip: 0.07 }, { t: 'erode', depth: 0.015, amp: 0.006 }]);
      var Hh = buildHistory(events), E = Hh.E, upto = o.replay ? 0 : E.length - 1, LT = F.letters || !!o.letters, showAges = !!o.ages;
      // letters for features: deposits, intrusions, faults, buried erosion surfaces; shuffled so the order isn't alphabetical
      var feats = []; E.forEach(function (e, i) { if (e.t === 'deposit' || e.t === 'lava' || e.t === 'intrude' || e.t === 'fault') feats.push(i); else if (e.t === 'erode' && E.slice(i + 1).some(function (q) { return q.t === 'deposit' || q.t === 'lava'; })) feats.push(i); });
      var rs = rng(num(o.seed, 7) * 31 + 5), lettersOf = {}, perm = feats.slice(); for (var p = perm.length - 1; p > 0; p--) { var q = M.floor(rs() * (p + 1)), tq = perm[p]; perm[p] = perm[q]; perm[q] = tq; } perm.forEach(function (fi, li) { lettersOf[fi] = LETTERS[li]; });
      // fit the picture to the rock (true scale: the canvas is 2 units wide and ZR tall)
      var zTop = 0.2; for (var cx0 = 0; cx0 <= 2.0001; cx0 += 0.05) for (var cz0 = 1; cz0 > zTop; cz0 -= 0.01) if (Hh.rock(cx0, cz0).id !== -2) { zTop = cz0; break; }
      var ZR = M.min(1, zTop + 0.07); F.size({ aspect: clamp(2 / ZR, 1.6, 3.2), max: 460, narrow: clamp(2 / ZR, 1.2, 3) * 0.75 });
      var logEl = mk('ol', 'esv-steps'); F.el.insertBefore(logEl, F.statsEl); F._rows.push(logEl);
      if (o.replay && !F.lock) {
        var bts = mk('div', 'esv-btns'); F.ctl.appendChild(bts);
        V.button(bts, '◀ Back', function () { upto = M.max(0, upto - 1); F.redraw(); }); V.button(bts, 'Next event ▶', function () { upto = M.min(E.length - 1, upto + 1); F.redraw(); }, 'pri'); V.button(bts, 'Show all', function () { upto = E.length - 1; F.redraw(); });
      }
      if (!F.lock && !o.events && !o.seed) check(F.ctl, 'Letters for ordering', LT, function (v) { LT = v; F.redraw(); });
      F.keys(o.replay ? function (e) { var a = arrowKey(e); if (!a || !a[0]) return false; upto = clamp(upto + a[0], 0, E.length - 1); F.redraw(); return true; } : null, o.replay ? 'Left and right arrow keys step through the history.' : '');
      function desc(e) {
        if (e.t === 'deposit') return (e.rock === 'ash' ? 'A volcanic ash bed settles' : ROCK_NAMES[e.rock].charAt(0).toUpperCase() + ROCK_NAMES[e.rock].slice(1) + ' is deposited') + (e.fossil ? ' (with ' + e.fossil + ' fossils)' : '') + (e.age && showAges ? ', dated ' + e.age + ' million years' : '');
        if (e.t === 'lava') return 'A lava flow spreads over the surface';
        if (e.t === 'tilt') return 'The layers are tilted';
        if (e.t === 'fold') return 'The layers are folded';
        if (e.t === 'erode') return 'Erosion wears the surface down';
        if (e.t === 'fault') return 'A ' + e.kind + ' fault breaks the rock';
        if (e.t === 'intrude') return 'Magma intrudes as a ' + e.kind + (e.age && showAges ? ', dated ' + e.age + ' million years' : '');
      }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, dpr = M.min(1.5, F.c.dpr), W2 = M.round(w * dpr), H2 = M.round(h * dpr);

        var img = ctx.createImageData(W2, H2), d = img.data, sky = rgb(k.sky.charAt(0) === '#' ? k.sky : '#dcecf8'), skyTop = rgb(k.sky2.charAt(0) === '#' ? k.sky2 : '#f3f8fc'), base = PAT.schist;
        var samples = {}; // a few points inside each feature, for letters and fossils
        for (var py = 0; py < H2; py++) {
          var z = ZR * (1 - (py + 0.5) / H2);
          for (var px = 0; px < W2; px++) {
            var x = (px + 0.5) / W2 * 2, rr = Hh.rock(x, z, upto), o4 = (py * W2 + px) * 4, col, f = 1;
            if (rr.id === -2) { var t = py / H2; col = [lerp(skyTop[0], sky[0], t), lerp(skyTop[1], sky[1], t), lerp(skyTop[2], sky[2], t)]; }
            else {
              var rk = rr.id === -1 ? 'schist' : E[rr.id].rock, pt = PAT[rk] || base; col = pt[0];
              f = pt[1](rr.u * w / 2, (1 - rr.v) * h / ZR);
              if (rr.baked) f *= 0.72;
              if (rr.id >= 0 && (px % 23 === 0) && (py % 17 === 0)) { (samples[rr.id] = samples[rr.id] || []).push([px / dpr, py / dpr]); }
            }
            var dk = k.dark && rr.id !== -2 ? 0.82 : 1;
            d[o4] = M.min(255, col[0] * f * dk); d[o4 + 1] = M.min(255, col[1] * f * dk); d[o4 + 2] = M.min(255, col[2] * f * dk); d[o4 + 3] = 255;
          }
        }
        var oc = D.createElement('canvas'); oc.width = W2; oc.height = H2; oc.getContext('2d').putImageData(img, 0, 0);
        ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(oc, 0, 0, w, h); ctx.restore();
        function P(x, z) { return [x / 2 * w, (1 - z / ZR) * h]; }
        // faults as lines (drawn through the rock), with half-arrows showing the slip
        E.forEach(function (e, j) {
          if (j > upto) return;
          if (e.t === 'fault') { var pts = []; for (var zz = 0; zz <= 1.0001; zz += 0.02) { var xp = e.xs + e.dir * (1 - zz) / M.tan(e.dip), q = Hh.fwd(xp, zz, j, upto); if (Hh.rock(q[0], q[1], upto).id !== -2) pts.push(P(q[0], q[1])); } line(ctx, pts, { color: k.dark ? '#ffb4a3' : '#7a1c0c', w: 2.4 }); if (LT && pts.length) { var m0 = pts[M.floor(pts.length * 0.55)]; badge(ctx, lettersOf[j], m0[0] + 14, m0[1], { k: k }); } }
          if (e.t === 'erode' && lettersOf[j] && E.slice(j + 1, upto + 1).some(function (q2) { return q2.t === 'deposit' || q2.t === 'lava'; })) {
            var up2 = []; for (var x2 = 0; x2 <= 2.0001; x2 += 0.01) { var q3 = Hh.fwd(x2, e.surf(x2), j, upto); if (Hh.rock(q3[0], q3[1] - 0.004, upto).id !== -2) up2.push(P(q3[0], q3[1])); }
            line(ctx, up2, { color: k.dark ? '#ffd479' : '#5b3a0a', w: 2.2, dash: [8, 3, 2, 3] });
            if (LT && up2.length) { var m1 = up2[M.floor(up2.length * 0.2)]; badge(ctx, lettersOf[j], m1[0], m1[1] - 2, { k: k }); }
          }
        });
        // fossils and letters inside layers
        Object.keys(samples).forEach(function (id) {
          var e = E[+id], s = samples[id]; if (!s.length) return;
          if (e.fossil) { var rf = rng(+id + 3); for (var q = 0; q < M.min(4, s.length); q++) { var sp = s[M.floor(rf() * s.length)]; fossilIcon(ctx, sp[0], sp[1], e.fossil, k); } }
          var mid = s[M.floor(s.length / 2)];
          if (LT && lettersOf[+id]) badge(ctx, lettersOf[+id], mid[0], mid[1], { k: k });
          else if (!F.quiet && !LT && s.length > 3) pill(ctx, (e.rock === 'ash' ? 'ash' : e.t === 'intrude' ? e.kind : e.rock) + (showAges && e.age ? ' · ' + e.age + ' Ma' : ''), mid[0], mid[1], { k: k, size: 10.5, clamp: [w, h] });
          if (showAges && e.age && LT) pill(ctx, e.age + ' Ma', mid[0] + 34, mid[1], { k: k, size: 10.5 });
        });
        // the event list and the order
        var shown = E.slice(0, upto + 1);
        logEl.hidden = F.quiet; logEl.innerHTML = shown.map(function (e, i) { return '<li class="' + (i === upto && o.replay ? 'yes' : '') + '">' + esc(desc(e)) + (LT && lettersOf[i] ? ' <b>(' + lettersOf[i] + ')</b>' : '') + '</li>'; }).join('');
        var order = feats.filter(function (i) { return i <= upto; }).map(function (i) { return lettersOf[i]; });
        F.alt('A cross-section of rock layers' + (F.quiet ? '' : ' built from ' + shown.length + ' events: ' + shown.map(desc).join('; ')) + (LT ? '. Features are lettered ' + order.slice().sort().join(', ') + '.' : '.'));
        F.say(LT && !F.quiet ? 'Oldest to youngest: <b>' + order.join(', ') + '</b>. Layers are laid down flat, oldest at the bottom; anything that cuts across them (a dike, a fault) is younger than what it cuts; an erosion surface buried by younger layers is an unconformity, a gap in the record.' : 'Layers are laid down flat, oldest at the bottom. Anything that cuts across layers is younger than they are. A buried erosion surface (an unconformity) marks a gap in time.', 'Read the history from the bottom up, then add whatever cuts across.');
      };
    }

    function fossilIcon(ctx, x, y, kind, k) {
      ctx.save(); ctx.translate(x, y); ctx.strokeStyle = k.dark ? '#f1e3c8' : '#3b2a14'; ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2;
      if (kind === 'trilobite') { ctx.beginPath(); ctx.ellipse(0, 0, 5, 7, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(-2, 6); ctx.moveTo(2, -6); ctx.lineTo(2, 6); for (var i = -4; i <= 4; i += 2.5) { ctx.moveTo(-5, i); ctx.lineTo(5, i); } ctx.stroke(); }
      else if (kind === 'ammonite') { ctx.beginPath(); for (var t = 0; t < 12; t += 0.2) { var r = 0.7 * t; ctx.lineTo(r * M.cos(t), r * M.sin(t)); } ctx.stroke(); }
      else if (kind === 'fern') { ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, -7); for (var j = -5; j < 6; j += 2.5) { ctx.moveTo(0, j); ctx.lineTo(-4, j - 2); ctx.moveTo(0, j); ctx.lineTo(4, j - 2); } ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(0, 2, 6, PI, TAU); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(-4, -2); ctx.moveTo(0, 2); ctx.lineTo(0, -4); ctx.moveTo(0, 2); ctx.lineTo(4, -2); ctx.stroke(); }
      ctx.restore();
    }

    function correlate(F) {
      F.size({ aspect: 1.7, max: 460, narrow: 0.9 });
      var cols = o.columns || [
        [{ rock: 'sandstone', thick: 2, key: 'a' }, { rock: 'shale', thick: 3, fossil: 'trilobite', key: 'b' }, { rock: 'ash', thick: 0.6, key: 'ash' }, { rock: 'limestone', thick: 3, fossil: 'brachiopod', key: 'c' }, { rock: 'sandstone', thick: 2, key: 'd' }],
        [{ rock: 'shale', thick: 2, fossil: 'trilobite', key: 'b' }, { rock: 'ash', thick: 0.6, key: 'ash' }, { rock: 'limestone', thick: 1.5, fossil: 'brachiopod', key: 'c' }, { rock: 'siltstone', thick: 2.5, key: 'e' }],
        [{ rock: 'sandstone', thick: 3, key: 'a' }, { rock: 'shale', thick: 1.5, fossil: 'trilobite', key: 'b' }, { rock: 'ash', thick: 0.6, key: 'ash' }, { rock: 'sandstone', thick: 2, key: 'd' }, { rock: 'conglomerate', thick: 1.5, key: 'f' }]
      ];
      var ties = [], pick = null, geo = [];
      var T = F.tiles([{ k: 'n', label: 'Correct tie lines', secret: true }]);
      var bt = mk('div', 'esv-btns'); F.ctl.appendChild(bt); V.button(bt, 'Clear the lines', function () { ties = []; pick = null; F.redraw(); }); if (!F.quiet) V.button(bt, 'Show the matches', function () { ties = []; for (var c = 0; c < cols.length - 1; c++) cols[c].forEach(function (l, i) { var j = cols[c + 1].map(function (m) { return m.key; }).indexOf(l.key); if (j >= 0) ties.push([c, i, c + 1, j]); }); F.redraw(); });
      F.drag({ hit: function (x, y) { for (var g = 0; g < geo.length; g++) { var q = geo[g]; if (x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h) return g; } return null; }, start: function (g) { var q = geo[g]; if (pick && pick.c !== q.c && M.abs(pick.c - q.c) === 1) { ties.push(pick.c < q.c ? [pick.c, pick.i, q.c, q.i] : [q.c, q.i, pick.c, pick.i]); pick = null; } else pick = { c: q.c, i: q.i }; F.redraw(); }, move: function () { } });
      var kc = 0, ki = 0;
      F.keys(function (e) { var a = arrowKey(e); if (a) { if (a[0]) { kc = clamp(kc + a[0], 0, cols.length - 1); ki = M.min(ki, cols[kc].length - 1); } else ki = clamp(ki - a[1], 0, cols[kc].length - 1); F.redraw(); return true; } if (e.key === 'Enter' || e.key === ' ') { var g = geo.filter(function (q) { return q.c === kc && q.i === ki; })[0]; if (g) { if (pick && pick.c !== kc && M.abs(pick.c - kc) === 1) { ties.push(pick.c < kc ? [pick.c, pick.i, kc, ki] : [kc, ki, pick.c, pick.i]); pick = null; } else pick = { c: kc, i: ki }; } F.redraw(); return true; } return false; }, 'Tap a layer in one column, then the matching layer in the next column, to draw a tie line (or use the arrow keys and Enter).');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, n = cols.length, wide = w >= 560, chartW = wide ? w * 0.26 : 0, cw = M.min(90, (w - chartW - 20) / n * 0.5), gap = (w - chartW - 20 - n * cw) / M.max(1, n - 1), top = 30, bot = h - 16, maxT = M.max.apply(null, cols.map(function (c) { return c.reduce(function (a, l) { return a + num(l.thick, 1); }, 0); })), s = (bot - top) / maxT;
        geo = [];
        cols.forEach(function (c, ci) {
          var x = 10 + ci * (cw + gap), y = bot;
          txt(ctx, 'Site ' + (ci + 1), x + cw / 2, 14, { size: 12, color: k.ink, bold: true, align: 'center' });
          c.forEach(function (l, li) {
            var hh = num(l.thick, 1) * s; y -= hh; var pt = PAT[l.rock] || PAT.sandstone, rk = l.rock;
            // fill with the rock pattern
            ctx.save(); ctx.beginPath(); ctx.rect(x, y, cw, hh); ctx.clip(); ctx.fillStyle = 'rgb(' + pt[0].join(',') + ')'; ctx.fillRect(x, y, cw, hh);
            ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (var yy = y; yy < y + hh; yy += 2) for (var xx = x; xx < x + cw; xx += 2) if (pt[1](xx * 1.6, yy * 1.6) < 0.9) ctx.fillRect(xx, yy, 2, 2);
            ctx.restore(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, cw, hh);
            if (l.fossil) fossilIcon(ctx, x + cw * 0.72, y + hh / 2, l.fossil, k);
            if (!F.quiet && hh > 14 && !wide) { } else if (!F.quiet && hh > 14) txt(ctx, rk === 'ash' ? 'ash' : rk, x + cw + 4, y + hh / 2, { size: 9.5, color: k.muted });
            geo.push({ c: ci, i: li, x: x, y: y, w: cw, h: hh });
            if ((pick && pick.c === ci && pick.i === li) || (F.focused() && kc === ci && ki === li)) { ctx.save(); ctx.strokeStyle = '#b8963e'; ctx.lineWidth = 3; ctx.strokeRect(x - 1.5, y - 1.5, cw + 3, hh + 3); ctx.restore(); }
          });
        });
        var good = 0;
        ties.forEach(function (t) { var a = geo.filter(function (q) { return q.c === t[0] && q.i === t[1]; })[0], b = geo.filter(function (q) { return q.c === t[2] && q.i === t[3]; })[0]; if (!a || !b) return; var ok = cols[t[0]][t[1]].key === cols[t[2]][t[3]].key; if (ok) good++; line(ctx, [[a.x + a.w, a.y + a.h / 2], [b.x, b.y + b.h / 2]], { color: F.quiet ? k.ink : ok ? k.green : k.red, w: 2.2, dash: ok || F.quiet ? [] : [5, 4] }); });
        // range chart of the fossils
        if (wide) {
          var rx = w - chartW + 10, rw = chartW - 20, rows = [['trilobite', 0.1, 0.6], ['brachiopod', 0.3, 0.95]], ry = top + 10, rh = bot - top - 30;
          txt(ctx, 'Fossil range chart', rx, 14, { size: 12, color: k.ink, bold: true }); txt(ctx, 'older', rx + rw, bot - 6, { size: 10, color: k.muted, align: 'right' }); txt(ctx, 'younger', rx + rw, ry, { size: 10, color: k.muted, align: 'right' });
          rows.forEach(function (r, i) { var x = rx + 20 + i * 44, y1 = ry + rh * (1 - r[2]), y2 = ry + rh * (1 - r[1]); ctx.fillStyle = rgba(k.rust, 0.3); ctx.fillRect(x - 6, y1, 12, y2 - y1); fossilIcon(ctx, x, y2 + 12, r[0], k); txt(ctx, r[0], x, y1 - 8, { size: 10, color: k.ink, align: 'center' }); });
          var ox1 = ry + rh * (1 - 0.6), ox2 = ry + rh * (1 - 0.3); ctx.fillStyle = rgba(k.gold, 0.25); ctx.fillRect(rx + 4, ox1, rw - 8, ox2 - ox1); txt(ctx, 'both lived: overlap', rx + rw - 4, (ox1 + ox2) / 2, { size: 10, color: k.ink, align: 'right' });
        }
        T.n(good + ' of ' + ties.length);
        F.alt('Rock columns at ' + n + ' sites, with fossils and a volcanic ash bed, for matching layers by tie lines.');
        F.say('Match layers by their fossils and by a key bed such as a volcanic ash layer, which fell everywhere at once. Thickness and rock type alone can mislead: the same kind of rock can form at different times, and a layer can be missing where it was eroded or never laid down.', 'Match layers by fossils and key beds, not by thickness or color.');
      };
    }
  });

  /* es-halflife: Radioactive Clock.
     opts:
       isotope: 'C-14' | 'K-40' | 'U-238' | 'U-235' | 'Rb-87' (default 'C-14'); n: 100 | 400 atoms
       time: in half-lives (default 0) or years: a time in years
       graph: true (default); ratio: true (daughter-to-parent readout; default true); random: true (atoms decay one by one at random)
       seed: the same seed gives the same atoms
       quiet: hides the fraction left, the ratio and the age; lock */
  R('es-halflife', function (el, o) {
    var F = frame(el, o, 'Radioactive clock', { aspect: 1.9, max: 400 });
    F.size({ aspect: 1.9, max: 400, narrow: 0.8 });
    var iso = EM.ISOTOPES[o.isotope] ? o.isotope : 'C-14', n = o.n === 400 ? 400 : 100, I = EM.ISOTOPES[iso], th = o.years != null ? num(o.years, 0) / I.h : clamp(num(o.time, 0), 0, 6), rnd = o.random !== false, graph = o.graph !== false, ratio = o.ratio !== false;
    var r = rng(num(o.seed, 11) || 11), life = []; for (var i = 0; i < 400; i++) life.push(-M.log(1 - r()) / M.LN2); // each atom's decay time, in half-lives (exponential)
    var T = F.tiles([{ k: 'hl', label: 'Half-lives passed', secret: false }, { k: 'age', label: 'Time', secret: true }, { k: 'left', label: 'Parent atoms left', secret: true }, { k: 'dp', label: 'Daughter : parent', secret: true }]);
    if (!o.isotope) select(F.ctl, 'Isotope', Object.keys(EM.ISOTOPES).map(function (q) { return [q, EM.ISOTOPES[q].p + ' → ' + EM.ISOTOPES[q].d]; }), iso, function (v) { iso = v; I = EM.ISOTOPES[v]; F.redraw(); });
    var ts = V.slider(F.ctl, { label: 'Time', min: 0, max: 6, step: 0.01, value: th, fmt: function (v) { return fm(v, 2) + ' half-lives'; }, input: function (v) { th = v; F.redraw(); } });
    var row = F.row(); F.player(row, function (dt) { th = M.min(6, th + dt * 0.5); ts.set(th); F.redraw(); if (th >= 6) return false; }, { label: 'Let time pass', reset: function () { if (th >= 6) th = 0; } });
    V.button(row, '+1 half-life', function () { th = M.min(6, M.round(th) + 1); ts.set(th); F.redraw(); });
    V.button(row, 'Reset', function () { th = 0; ts.set(0); F.redraw(); });
    check(row, 'Random atoms', rnd, function (v) { rnd = v; F.redraw(); });
    F.keys(function (e) { var a = arrowKey(e); if (!a) return false; th = clamp(th + (a[0] || -a[1]) * 0.25, 0, 6); ts.set(th); F.redraw(); return true; }, 'Arrow keys move time forward and back.');
    function yrs(v) { return v >= 1e9 ? fm(v / 1e9, 2) + ' billion years' : v >= 1e6 ? nf(v / 1e6, 1) + ' million years' : nf(v) + ' years'; }
    F.draw = function () {
      var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, gw = wide ? w * 0.42 : w, gh = wide ? h : h * 0.5;
      var side = M.sqrt(n), cs = M.min((gw - 20) / side, (gh - 30) / side), x0 = (gw - cs * side) / 2, y0 = 24;
      var left = 0;
      for (var a = 0; a < n; a++) { var decayed = rnd ? life[a] < th : a >= n * EM.left(th); if (!decayed) left++; var cx = x0 + (a % side + 0.5) * cs, cy = y0 + (M.floor(a / side) + 0.5) * cs; circle(ctx, cx, cy, cs * 0.38, decayed ? (k.dark ? '#6c7a89' : '#adb5bd') : k.gold, decayed ? null : (k.dark ? '#ffe8a3' : '#8a6a00'), 1); }
      var pS = 'parent (' + I.p + ')', dS = 'daughter (' + I.d + ')', both = tw(ctx, pS, { size: 11, bold: true }) + tw(ctx, dS, { size: 11, bold: true }) + 12 < cs * side; txt(ctx, pS, x0, both ? 12 : 8, { size: both ? 11 : 10, color: k.dark ? '#ffd479' : '#8a6a00', bold: true }); txt(ctx, dS, x0 + cs * side, both ? 12 : 20, { size: both ? 11 : 10, color: k.muted, bold: true, align: 'right' });
      if (graph) {
        var r2 = wide ? { x: gw + 50, y: 18, w: w - gw - 64, h: h - 58 } : { x: 50, y: gh + 18, w: w - 64, h: h - gh - 56 };
        var c = chart(ctx, k, r2, { x: { min: 0, max: 6, step: 1, label: 'Half-lives', fmt: function (v) { return v; } }, y: { min: 0, max: 1, ticks: [0, 0.125, 0.25, 0.5, 1], fmt: function (v) { return v === 0.125 ? '1/8' : v === 0.25 ? '1/4' : v === 0.5 ? '1/2' : String(v); }, label: 'Parent left' } });
        c.clip(); var pts = []; for (var t = 0; t <= 6.0001; t += 0.05) pts.push([c.X(t), c.Y(EM.left(t))]); line(ctx, pts, { color: k.gold, w: 2.6 });
        var dpts = []; for (t = 0; t <= 6.0001; t += 0.05) dpts.push([c.X(t), c.Y(1 - EM.left(t))]); line(ctx, dpts, { color: k.muted, w: 1.8, dash: [5, 4] });
        [1, 2, 3].forEach(function (q) { line(ctx, [[c.X(q), c.Y(0)], [c.X(q), c.Y(EM.left(q))], [c.X(0), c.Y(EM.left(q))]], { color: rgba(k.rust, 0.5), w: 1, dash: [3, 3] }); });
        c.unclip();
        knob(ctx, c.X(th), c.Y(left / n), k.rust, 6, k);
        if (!F.quiet) txt(ctx, 'daughter atoms', c.X(4.2), c.Y(1 - EM.left(4.2)) - 10, { size: 10.5, color: k.muted, align: 'center' });
      }
      var exactLeft = EM.left(th), dp = (1 - exactLeft) / exactLeft;
      T.hl(fm(th, 2)); T.age(yrs(th * I.h)); T.left(left + ' of ' + n + ' (smooth curve: ' + fm(exactLeft * 100, 1) + '%)'); T.dp(fm(dp, 2)); if (!ratio) T.dp.box.hidden = true;
      F.alt('A grid of ' + n + ' ' + I.p + ' atoms decaying into ' + I.d + ', with a graph of the fraction left that halves every half-life' + (F.quiet ? '.' : ': ' + left + ' left after ' + fm(th, 2) + ' half-lives.'));
      F.say('Each half-life, half of the remaining parent atoms decay: 1/2, then 1/4, then 1/8 are left, never all gone. Each atom decays at random, but a large sample follows the smooth curve. ' + I.p + '’s half-life is ' + yrs(I.h) + '; useful for ' + I.range + '. Age = half-life × log₂(1 + D/P), assuming no daughter atoms at the start.', 'Each half-life halves what is left.');
    };
    F.redraw();
    return { destroy: F.reset };
  });

  /* es-deep-time: Deep Time.
     opts:
       analogy: 'year' | 'day' | 'field' | 'none' (Earth's history squeezed into one calendar year, one day or a 100 m field)
       zoom: [from, to] in million years ago (default [4540, 0]); events: list of ids or [{name, ma}]; dates: true (show dates)
       rate: {perYear, years, unit} (e.g. {perYear: 0.3, years: 5e6, unit: 'mm'}); letters: true (events lettered)
       quiet: hides dates, analogy times and rate results; lock */
  var EONS = [['Hadean', 4540, 4000, '#ae027e'], ['Archean', 4000, 2500, '#f0047f'], ['Proterozoic', 2500, 538.8, '#f73563'], ['Phanerozoic', 538.8, 0, '#9ad9dd']];
  var ERAS = [['Paleozoic', 538.8, 251.9, '#99c08d'], ['Mesozoic', 251.9, 66.0, '#67c5ca'], ['Cenozoic', 66.0, 0, '#f2f91d']];
  var PERIODS = [['Cambrian', 538.8, 485.4, '#7fa056'], ['Ordovician', 485.4, 443.8, '#009270'], ['Silurian', 443.8, 419.2, '#b3e1b6'], ['Devonian', 419.2, 358.9, '#cb8c37'], ['Carboniferous', 358.9, 298.9, '#67a599'], ['Permian', 298.9, 251.9, '#f04028'], ['Triassic', 251.9, 201.4, '#812b92'], ['Jurassic', 201.4, 143.1, '#34b2c9'], ['Cretaceous', 143.1, 66.0, '#7fc64e'], ['Paleogene', 66.0, 23.03, '#fd9a52'], ['Neogene', 23.03, 2.58, '#ffe619'], ['Quaternary', 2.58, 0, '#f9f97f']];
  var DT_EVENTS = { minerals: ['oldest known mineral grains', 4400], rocks: ['oldest known rocks', 4000], life: ['early life (fossil microbe mats)', 3500], oxygen: ['oxygen builds up in the air', 2400], cambrian: ['Cambrian explosion of animals', 538], ext1: ['mass extinction', 445], ext2: ['mass extinction', 372], ext3: ['largest mass extinction', 252], ext4: ['mass extinction', 201], dinos: ['first dinosaurs', 230], ext5: ['dinosaurs (except birds) die out', 66], humans: ['our species, Homo sapiens', 0.3] };
  R('es-deep-time', function (el, o) {
    var F = frame(el, o, 'Deep time', { aspect: 1.9, max: 420 });
    F.size({ aspect: 1.75, max: 440, narrow: 0.78 });
    var an = ['year', 'day', 'field', 'none'].indexOf(o.analogy) >= 0 ? o.analogy : 'year', zoom = Array.isArray(o.zoom) ? [num(o.zoom[0], 4540), num(o.zoom[1], 0)] : [4540, 0], LT = !!o.letters;
    var evs = (o.events || Object.keys(DT_EVENTS)).map(function (e) { return typeof e === 'string' ? (DT_EVENTS[e] ? { name: DT_EVENTS[e][0], ma: DT_EVENTS[e][1] } : null) : { name: e.name, ma: num(e.ma, 0) }; }).filter(Boolean);
    var sel = evs.length - 1, rate = o.rate || null;
    var T = F.tiles([{ k: 'ev', label: 'Event', secret: false }, { k: 'when', label: 'When', secret: true }, { k: 'an', label: an === 'day' ? 'On a 24-hour clock' : an === 'field' ? 'On a 100 m field' : 'On a one-year calendar', secret: true }].concat(rate ? [{ k: 'rate', label: 'Rate × time', secret: true }] : []));
    if (!F.lock) {
      V.seg(F.ctl, { label: 'Analogy', items: [['year', 'One year'], ['day', 'One day'], ['field', '100 m field']], value: an === 'none' ? 'year' : an, change: function (v) { an = v; T.an.label(v === 'day' ? 'On a 24-hour clock' : v === 'field' ? 'On a 100 m field' : 'On a one-year calendar'); F.redraw(); } });
      var zrow = F.row(); V.seg(zrow, { label: 'Zoom', items: [['all', 'All of Earth’s history'], ['ph', 'Last 540 million years'], ['cz', 'Last 66 million years']], value: zoom[0] > 1000 ? 'all' : zoom[0] > 100 ? 'ph' : 'cz', change: function (v) { zoom = v === 'all' ? [4540, 0] : v === 'ph' ? [560, 0] : [70, 0]; F.redraw(); } });
    }
    if (rate) { var rr = mk('p', 'esv-log'); F.el.insertBefore(rr, F.statsEl); F._rows.push(rr); }
    var geo = null;
    F.drag({ hit: function (x, y) { return geo && y > geo.y0 - 10 && y < geo.y1 + 30 ? 'm' : null; }, move: function (h, x) { var ma = geo.inv(x), best = 0, bd = 1e9; evs.forEach(function (e, i) { var d = M.abs(geo.X(e.ma) - x); if (d < bd) { bd = d; best = i; } }); sel = best; F.redraw(); }, touch: 'pan-y' });
    F.keys(function (e) { var a = arrowKey(e); if (!a || !a[0]) return false; sel = clamp(sel + a[0], 0, evs.length - 1); F.redraw(); return true; }, 'Tap an event marker (or use the left and right arrow keys) to see when it happened.');
    F.draw = function () {
      var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, x0 = 16, x1 = w - 16, lin = true;
      function X(ma) { return x0 + (zoom[0] - ma) / (zoom[0] - zoom[1]) * (x1 - x0); }
      var y0 = 34, bh = 20; geo = { X: X, inv: function (px) { return zoom[0] - (px - x0) / (x1 - x0) * (zoom[0] - zoom[1]); }, y0: y0, y1: y0 + bh * 3 + 20 };
      function band(list, y, hh, labels) { list.forEach(function (b) { var a = M.max(X(b[1]), x0), c = M.min(X(b[2]), x1); if (c <= x0 || a >= x1) return; ctx.fillStyle = b[3]; ctx.fillRect(a, y, c - a, hh); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.strokeRect(a + 0.5, y + 0.5, c - a, hh); if (labels && c - a > tw(ctx, b[0], { size: 10.5 }) + 6) txt(ctx, b[0], (a + c) / 2, y + hh / 2, { size: 10.5, color: '#1d2320', align: 'center' }); }); }
      txt(ctx, zoom[0] > 1000 ? 'Earth forms, about 4.54 billion years ago' : nf(zoom[0]) + ' million years ago', x0, 14, { size: 11, color: k.muted }); txt(ctx, 'today', x1, 14, { size: 11, color: k.muted, align: 'right' });
      band(EONS, y0, bh, true); band(ERAS, y0 + bh, bh, true); band(PERIODS, y0 + bh * 2, bh, zoom[0] < 1000);
      // ticks
      var step = niceStep(zoom[0] - zoom[1], 6); for (var m = 0; m <= zoom[0]; m += step) { var xx = X(m); line(ctx, [[xx, y0 + bh * 3], [xx, y0 + bh * 3 + 5]], { color: k.axis, w: 1 }); txt(ctx, m >= 1000 ? fm(m / 1000, 1) + ' billion' : nf(m) + (m ? ' million' : ''), xx, y0 + bh * 3 + 14, { size: 10, color: k.muted, align: 'center' }); }
      // events
      var LB = labeler(ctx), ey = y0 + bh * 3 + 34;
      evs.forEach(function (e, i) { if (e.ma > zoom[0] || e.ma < zoom[1]) return; var xx = X(e.ma); line(ctx, [[xx, y0], [xx, ey - 4]], { color: i === sel ? k.rust : rgba(k.ink, 0.35), w: i === sel ? 2 : 1 }); circle(ctx, xx, ey, i === sel ? 6 : 4, i === sel ? k.rust : k.ink); if (LT) badge(ctx, LETTERS[i], xx, ey + 18, { k: k, r: 9 }); else { var lx2 = clamp(xx, tw(ctx, e.name, { size: 10.5 }) / 2 + 4, w - tw(ctx, e.name, { size: 10.5 }) / 2 - 4); LB.put(e.name, lx2, ey + 18, { size: 10.5, color: i === sel ? k.rust : k.ink, align: 'center', bold: i === sel, before: function (yy) { line(ctx, [[xx, ey + 5], [lx2, yy - 7]], { color: rgba(k.ink, 0.25), w: 1 }); } }, [0, 16, 32, 48, 64, 80, 96, 112, 128, 144, 160]); } });
      // analogy strip
      var e = evs[sel], ay = h - 46;
      if (an !== 'none') {
        ctx.fillStyle = k.panel; rrect(ctx, x0, ay - 16, x1 - x0, 44, 10); ctx.fill();
        var q = EM.analogy(e.ma, an === 'none' ? 'year' : an), txt2;
        if (an === 'year') txt2 = EM.months[q.month - 1] + ' ' + q.day + ', ' + clock12(q.h + q.min / 60);
        else if (an === 'day') txt2 = (q.h < 10 ? '0' : '') + q.h + ':' + (q.m < 10 ? '0' : '') + q.m + ':' + (q.s < 9.5 ? '0' : '') + M.round(q.s) + ' (' + (q.before < 60 ? fm(q.before, 1) + ' seconds' : q.before < 3600 ? fm(q.before / 60, 1) + ' minutes' : fm(q.before / 3600, 1) + ' hours') + ' before midnight)';
        else txt2 = fm(q.m, 2) + ' m along (' + (q.left < 1 ? fm(q.left * 100, 1) + ' cm' : fm(q.left, 2) + ' m') + ' from the end)';
        var fx = x0 + 8 + (x1 - x0 - 16) * q.f; line(ctx, [[x0 + 8, ay + 6], [x1 - 8, ay + 6]], { color: k.axis, w: 2 }); circle(ctx, fx, ay + 6, 5, k.rust);
        txt(ctx, an === 'year' ? 'Jan 1: Earth forms' : an === 'day' ? 'midnight: Earth forms' : 'start: Earth forms', x0 + 8, ay - 6, { size: 10, color: k.muted }); txt(ctx, an === 'year' ? 'Dec 31, midnight: today' : an === 'day' ? 'midnight: today' : '100 m: today', x1 - 8, ay - 6, { size: 10, color: k.muted, align: 'right' });
        if (!F.quiet) txt(ctx, txt2, clamp(fx, 120, w - 120), ay + 20, { size: 11, color: k.ink, align: 'center', bold: true });
        T.an(txt2);
      } else T.an.box.hidden = true;
      T.ev(LT ? 'event ' + LETTERS[sel] : e.name); T.when(e.ma >= 1000 ? 'about ' + fm(e.ma / 1000, 2) + ' billion years ago' : e.ma >= 1 ? 'about ' + nf(e.ma) + ' million years ago' : 'about ' + nf(e.ma * 1e6) + ' years ago');
      if (rate) { var tot = num(rate.perYear, 0.3) * num(rate.years, 1e6), u = rate.unit || 'mm', big = u === 'mm' && tot >= 1e6 ? fm(tot / 1e6, 2) + ' km' : u === 'mm' && tot >= 1000 ? fm(tot / 1000, 1) + ' m' : nf(tot) + ' ' + u; T.rate(nf(num(rate.perYear, 0.3), 2) + ' ' + u + '/yr × ' + nf(num(rate.years, 1e6)) + ' yr = ' + big); rr.innerHTML = F.quiet ? '' : 'A change of <b>' + nf(num(rate.perYear, 0.3), 2) + ' ' + u + ' a year</b> for <b>' + nf(num(rate.years, 1e6)) + ' years</b> adds up to <b>' + big + '</b>. Tiny yearly changes build canyons and mountains given enough time.'; }
      F.alt('The geologic time scale from Earth’s formation to today with eons, eras and periods' + (LT ? ' and lettered events.' : ', and events such as ' + evs.slice(0, 4).map(function (q) { return q.name; }).join(', ') + '.'));
      F.say('All of Earth’s history squeezed into one year: animals with shells appear in mid-November, the dinosaurs die out around December 26, and our species shows up about 11:25 pm on December 31. People never lived alongside the dinosaurs (other than birds). Ages from the International Chronostratigraphic Chart, rounded.', 'Deep time is vast: humans arrive at the very end.');
    };
    F.redraw();
    return { destroy: F.reset };
  });

  // ---------- small vector helpers on the sphere (for moving continents) ----------
  function ll2v(lon, lat) { var a = lat * RAD, b = lon * RAD; return [M.cos(a) * M.cos(b), M.cos(a) * M.sin(b), M.sin(a)]; }
  function v2ll(v) { return [M.atan2(v[1], v[0]) * DEG, M.asin(clamp(v[2], -1, 1)) * DEG]; }
  function vcross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function vdot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function vnorm(a) { var l = M.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function rotAxis(v, ax, ang) { var c = M.cos(ang), s = M.sin(ang), d = vdot(ax, v), cr = vcross(ax, v); return [v[0] * c + cr[0] * s + ax[0] * d * (1 - c), v[1] * c + cr[1] * s + ax[1] * d * (1 - c), v[2] * c + cr[2] * s + ax[2] * d * (1 - c)]; }
  /* the rotation that carries point a1 onto b1 and turns a2 as close as possible to b2, as one axis and angle (an Euler pole) */
  function fitRotation(a1, b1, a2, b2) {
    var A1 = ll2v(a1[0], a1[1]), B1 = ll2v(b1[0], b1[1]), A2 = ll2v(a2[0], a2[1]), B2 = ll2v(b2[0], b2[1]);
    var ax1 = vcross(A1, B1), ang1 = M.acos(clamp(vdot(A1, B1), -1, 1)); ax1 = M.hypot(ax1[0], ax1[1], ax1[2]) < 1e-9 ? [0, 0, 1] : vnorm(ax1);
    var A2r = rotAxis(A2, ax1, ang1);
    function proj(v) { var d = vdot(v, B1); return vnorm([v[0] - B1[0] * d, v[1] - B1[1] * d, v[2] - B1[2] * d]); }
    var p = proj(A2r), q = proj(B2), ang2 = M.atan2(vdot(vcross(p, q), B1), vdot(p, q));
    // compose the two rotations into one: rotate three basis vectors and read off the axis and angle
    function R(v) { return rotAxis(rotAxis(v, ax1, ang1), B1, ang2); }
    var ex = R([1, 0, 0]), ey = R([0, 1, 0]), ez = R([0, 0, 1]), tr = ex[0] + ey[1] + ez[2], ang = M.acos(clamp((tr - 1) / 2, -1, 1));
    var ax = vnorm([ey[2] - ez[1], ez[0] - ex[2], ex[1] - ey[0]]); if (!isFinite(ax[0]) || ang < 1e-9) ax = [0, 0, 1];
    return { ax: ax, ang: ang, apply: function (lon, lat, f) { return v2ll(rotAxis(ll2v(lon, lat), ax, ang * (f == null ? 1 : f))); } };
  }
  var INDIA = [68.5, 23.5, 70, 22.8, 69, 22.3, 70.4, 20.9, 72.6, 21.5, 72.8, 19, 73.8, 15.5, 74.8, 12.9, 75.8, 11.2, 76.3, 9.9, 77.5, 8.1, 78.1, 8.8, 79.9, 10.3, 80.3, 13.1, 80.2, 15.5, 82.2, 16.9, 83.3, 17.7, 85.9, 19.8, 87, 21.5, 89, 21.8, 91.8, 22.3, 92.5, 25.5, 88, 27, 84, 28, 80, 30.5, 77, 34.5, 74, 34.5, 72, 33, 70, 30, 68.5, 26, 68.5, 23.5];
  var GONDWANA = (function () { // fits for 250 million years ago, relative to Africa (and Eurasia, kept fixed)
    var F = {};
    F.samerica = fitRotation([-35.2, -5.5], [9.0, 3.5], [-57.3, -35.8], [16.5, -31.5]);
    F.namerica = fitRotation([-63, 44.5], [-10.5, 31.5], [-80.5, 25.5], [-17.5, 13.5]);
    F.madagascar = fitRotation([49.3, -12], [43.8, -1.5], [45.2, -25.6], [40.6, -14]);
    F.india = fitRotation([72.8, 19], [48.8, -6], [77.5, 8.1], [46.5, -17]);
    F.antarctica = fitRotation([20, -70], [36, -37], [90, -66.5], [58, -45]);
    var t1 = F.antarctica.apply(128, -67.5), t2 = F.antarctica.apply(152, -71);
    F.australia = fitRotation([131.2, -31.5], t1, [146.4, -39.1], t2);
    return F;
  })();
  var BLOCKS = { namerica: ['namerica', 'greenland', 'baffin', 'ellesmere', 'victoria', 'newfoundland', 'cuba', 'hispaniola'], samerica: ['samerica'], africa: ['africa'], madagascar: ['madagascar'], india: ['india'], antarctica: ['antarctica'], australia: ['australia', 'tasmania', 'newguinea'], eurasia: ['eurasia', 'britain', 'ireland', 'iceland', 'svalbard', 'novaya', 'japan', 'hokkaido', 'sakhalin', 'taiwan', 'hainan', 'srilanka', 'luzon', 'mindanao', 'sumatra', 'java', 'borneo', 'sulawesi', 'chukotka', 'nzNorth', 'nzSouth'] };
  // evidence: [kind, block, lon, lat, radius°]
  var EVIDENCE = [
    ['Mesosaurus', 'samerica', -51, -28, 5], ['Mesosaurus', 'africa', 17, -26, 5],
    ['Glossopteris', 'samerica', -55, -22, 7], ['Glossopteris', 'africa', 26, -24, 7], ['Glossopteris', 'india', 79, 21, 5], ['Glossopteris', 'antarctica', 60, -76, 8], ['Glossopteris', 'australia', 144, -27, 7], ['Glossopteris', 'madagascar', 46.5, -20, 3],
    ['Lystrosaurus', 'africa', 25, -31, 4], ['Lystrosaurus', 'india', 80, 23.5, 4], ['Lystrosaurus', 'antarctica', 20, -78, 5],
    ['Cynognathus', 'samerica', -66, -32, 5], ['Cynognathus', 'africa', 23, -30.5, 4],
    ['mountains', 'namerica', -79, 37, 6], ['mountains', 'eurasia', 6, 61, 5], ['mountains', 'eurasia', -4, 57, 3], ['mountains', 'africa', -11, 21, 4],
    ['ice', 'samerica', -49, -26, 6], ['ice', 'africa', 24, -27, 6], ['ice', 'india', 78, 20, 5], ['ice', 'australia', 140, -31, 6], ['ice', 'antarctica', 45, -78, 6]
  ];
  var EVCOL = { Mesosaurus: '#1c7ed6', Glossopteris: '#2b8a3e', Lystrosaurus: '#e67700', Cynognathus: '#c2255c', mountains: '#6741d9', ice: '#0c8599' };
  var EVNAME = { Mesosaurus: 'Mesosaurus (freshwater reptile)', Glossopteris: 'Glossopteris (seed fern)', Lystrosaurus: 'Lystrosaurus (land reptile)', Cynognathus: 'Cynognathus (land reptile)', mountains: 'matching old mountain belts', ice: 'scratches from ancient ice sheets' };

  // draw plate boundaries on an equirectangular map P
  function drawBounds(ctx, P, k, o2) {
    BOUNDS.forEach(function (b, bi) {
      var col = b.t === 'd' ? k.red : b.t === 'c' ? k.blue : (k.dark ? '#8ce99a' : '#2b8a3e');
      mapPath(ctx, P, b.p).forEach(function (seg) {
        line(ctx, seg, { color: col, w: 2.4 });
        if (b.t === 'c') { // teeth on the overriding side
          for (var i = 1; i < seg.length; i++) { var a = seg[i - 1], c = seg[i], L = M.hypot(c[0] - a[0], c[1] - a[1]), n = M.floor(L / 9); for (var j = 0; j < n; j++) { var t = (j + 0.5) / n, x = lerp(a[0], c[0], t), y = lerp(a[1], c[1], t), ux = (c[0] - a[0]) / L, uy = (c[1] - a[1]) / L, nx = -uy * (b.over || 1), ny = ux * (b.over || 1); if (b.coll) continue; poly(ctx, [[x - ux * 2.6, y - uy * 2.6], [x + ux * 2.6, y + uy * 2.6], [x + nx * 4.5, y + ny * 4.5]], col); } }
        }
      });
    });
  }

  /* es-plates: Plate Map.
     opts:
       mode: 'map' | 'pangaea' | 'hotspot' | 'gps'      modes: true or a list for tabs
       show: list from 'boundaries', 'arrows', 'quakes', 'volcanoes', 'names' (map; default boundaries, arrows, names)
       letters: true (letter some boundaries for "what kind is B?"); age: million years ago (pangaea, 0–250, default 250)
       evidence: list from 'Mesosaurus', 'Glossopteris', 'Lystrosaurus', 'Cynognathus', 'mountains', 'ice' (pangaea; default all)
       speed: plate speed (hotspot, cm/yr); islands: [{name, km, ma}] (hotspot; default the Hawaiian–Emperor chain)
       stations: [{name, x, y (km), ve, vn (mm/yr)}]; pair: [i, j] (gps)
       quiet: hides rates, ages, boundary types and vector readouts; lock */
  R('es-plates', function (el, o) {
    var F = frame(el, o, 'Plate map', { aspect: 1.9, max: 460 });
    return F.modes({ map: map, pangaea: pangaea, hotspot: hotspot, gps: gps }, { map: 'Plates today', pangaea: 'Pangaea', hotspot: 'Hot spots', gps: 'GPS stations' });

    function map(F) {
      F.size({ aspect: 1.9, max: 460, narrow: 1.15 });
      var show = o.show || ['boundaries', 'arrows', 'names'], has = function (s) { return show.indexOf(s) >= 0; }, LT = F.letters, tapped = null, Pm = null;
      var T = F.tiles([{ k: 'b', label: 'Tapped boundary', secret: true }]);
      if (!F.lock) { var row = F.row(); ['quakes', 'volcanoes', 'arrows', 'names'].forEach(function (s) { check(row, { quakes: 'Earthquakes', volcanoes: 'Volcanoes', arrows: 'Motion arrows', names: 'Plate names' }[s], has(s), function (v) { if (v) show.push(s); else show = show.filter(function (q) { return q !== s; }); F.redraw(); }); }); }
      var lettered = [0, 1, 11, 17, 24, 32, 35]; // a few boundaries to letter: ridges, trenches, transforms
      F.drag({ hit: function (x, y) { if (!Pm) return null; var best = null, bd = 14; BOUNDS.forEach(function (b, bi) { mapPath(null, Pm, b.p).forEach(function (seg) { for (var i = 1; i < seg.length; i++) { var a = seg[i - 1], c = seg[i], L2 = (c[0] - a[0]) * (c[0] - a[0]) + (c[1] - a[1]) * (c[1] - a[1]) || 1, t = clamp(((x - a[0]) * (c[0] - a[0]) + (y - a[1]) * (c[1] - a[1])) / L2, 0, 1), d = M.hypot(x - a[0] - t * (c[0] - a[0]), y - a[1] - t * (c[1] - a[1])); if (d < bd) { bd = d; best = bi; } } }); }); return best == null ? null : best; }, start: function (bi) { tapped = bi; F.redraw(); }, move: function () { }, touch: 'pan-y' });
      F.keys(function (e) { var a = arrowKey(e); if (!a || !a[0]) return false; tapped = tapped == null ? 0 : (tapped + a[0] + BOUNDS.length) % BOUNDS.length; F.redraw(); return true; }, 'Tap a boundary to name it (or use the left and right arrow keys to step through them).');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, r = { x: 0, y: 0, w: w, h: h }, P = eqProj(r, 80, -65, 150); Pm = P;
        ctx.fillStyle = k.dark ? '#16324a' : '#cfe3f2'; ctx.fillRect(0, 0, w, h);
        drawLand(ctx, P, k.dark ? '#4f6b45' : '#e3dcc6', k.dark ? '#6e8f63' : '#b9ad8c');
        if (has('names') && !F.quiet) PLATES.forEach(function (p) { txt(ctx, p[0], P.X(p[1]), P.Y(p[2]), { size: w < 560 ? 9 : 11, color: k.dark ? '#dbe7ef' : '#41526b', align: 'center', italic: true, halo: k.dark ? 'rgba(22,50,74,0.6)' : 'rgba(207,227,242,0.7)' }); });
        if (has('quakes')) { var rq = rng(21); BOUNDS.forEach(function (b) { var pts = []; for (var i = 2; i < b.p.length; i += 2) { var n = b.t === 'c' ? 7 : 3; for (var j = 0; j < n; j++) { var t = rq(), lon = lerp(b.p[i - 2], b.p[i], t), lat = lerp(b.p[i - 1], b.p[i + 1], t), spread = b.t === 'c' ? 3 : 1; circle(ctx, P.X(lon + (rq() - 0.5) * spread * 2), P.Y(lat + (rq() - 0.5) * spread * 2), 1.5, rgba(k.red, 0.55)); } } }); }
        if (has('boundaries')) drawBounds(ctx, P, k);
        if (has('volcanoes')) { var rv = rng(5); BOUNDS.forEach(function (b) { if (b.t !== 'c' || b.coll) return; mapPath(null, P, b.p).forEach(function (seg) { for (var i = 1; i < seg.length; i++) { var a = seg[i - 1], c = seg[i], L = M.hypot(c[0] - a[0], c[1] - a[1]); if (L < 1) continue; var ux = (c[0] - a[0]) / L, uy = (c[1] - a[1]) / L, nx = -uy * (b.over || 1), ny = ux * (b.over || 1); for (var j = 0; j < L / 22; j++) { var t = rv(), x = lerp(a[0], c[0], t) + nx * 9, y = lerp(a[1], c[1], t) + ny * 9; poly(ctx, [[x, y - 4], [x - 3.5, y + 3], [x + 3.5, y + 3]], '#e8590c', k.dark ? '#000' : '#7a2e0b', 0.6); } } }); }); HOTSPOTS.forEach(function (hs) { var x = P.X(hs[0]), y = P.Y(hs[1]); poly(ctx, [[x, y - 5], [x - 4, y + 3.5], [x + 4, y + 3.5]], '#e8590c', '#000', 0.8); if (!F.quiet) txt(ctx, hs[2], x + 6, y, { size: 9.5, color: k.ink, halo: k.halo }); }); }
        if (has('arrows')) MOTIONS.forEach(function (mo) {
          var x = P.X(mo[0]), y = P.Y(mo[1]), a = mo[2] * RAD, L = 14, ux = M.cos(a), uy = -M.sin(a), op = { color: k.ink, w: 1.7, head: 6 };
          if (mo[5] === 'apart') { arrow(ctx, x - ux * 3, y - uy * 3, x - ux * (3 + L), y - uy * (3 + L), op); arrow(ctx, x + ux * 3, y + uy * 3, x + ux * (3 + L), y + uy * (3 + L), op); }
          else if (mo[5] === 'slide') { arrow(ctx, x - uy * 4 - ux * L / 2, y + ux * 4 - uy * L / 2, x - uy * 4 + ux * L / 2, y + ux * 4 + uy * L / 2, op); arrow(ctx, x + uy * 4 + ux * L / 2, y - ux * 4 + uy * L / 2, x + uy * 4 - ux * L / 2, y - ux * 4 - uy * L / 2, op); }
          else arrow(ctx, x, y, x + ux * L * 1.3, y + uy * L * 1.3, op);
          if (!F.quiet) { var s0 = fm(mo[3], 1) + ' cm/yr', tw0 = tw(ctx, s0, { size: 9.5 }); txt(ctx, s0, clamp(x, tw0 / 2 + 3, w - tw0 / 2 - 3), y + 13, { size: 9.5, color: k.ink, align: 'center', halo: k.halo }); }
        });
        if (LT) lettered.forEach(function (bi, i) { var b = BOUNDS[bi]; if (!b) return; var mid = M.floor(b.p.length / 4) * 2, x = P.X(b.p[mid]), y = P.Y(b.p[mid + 1]); badge(ctx, LETTERS[i], x + 10, y - 10, { k: k, r: 10 }); });
        if (tapped != null) { var tb = BOUNDS[tapped]; mapPath(null, P, tb.p).forEach(function (seg) { line(ctx, seg, { color: '#b8963e', w: 5, alpha: 0.6 }); }); T.b((tb.n || 'a boundary') + ': ' + { d: 'divergent (pulling apart)', c: tb.coll ? 'convergent (continents colliding)' : 'convergent (one plate sinks)', t: 'transform (sliding past)' }[tb.t]); }
        else T.b('tap a boundary');
        F.legend([{ c: k.red, t: 'divergent: plates pull apart', line: true }, { c: k.blue, t: 'convergent: plates push together (teeth on the upper plate)', line: true }, { c: k.dark ? '#8ce99a' : '#2b8a3e', t: 'transform: plates slide past', line: true }].concat(has('quakes') ? [{ c: rgba(k.red, 0.7), t: 'earthquakes' }] : []).concat(has('volcanoes') ? [{ c: '#e8590c', t: 'volcanoes' }] : []));
        if (F.quiet) F.legendEl.hidden = true;
        F.alt('A world map of the major tectonic plates with their boundaries' + (F.quiet ? '' : ' colored by type: divergent, convergent and transform') + (has('arrows') ? ', and arrows for how fast plates move' : '') + '. Boundaries are simplified.');
        F.say('Earth’s outer shell is broken into plates that move a few centimeters a year, about as fast as fingernails grow. Most earthquakes and volcanoes line up along the boundaries, but not all: hot spots like Hawaiʻi sit in the middle of a plate. Boundaries simplified; rates rounded.', 'Plates meet at divergent, convergent and transform boundaries.');
      };
    }

    function pangaea(F) {
      F.size({ aspect: 1.25, max: 520, narrow: 0.95 });
      var age = clamp(num(o.age, 250), 0, 250), ev = o.evidence || Object.keys(EVCOL), view = { lon: 10, lat: -15 }, down = null, G = null;
      var as = V.slider(F.ctl, { label: 'Time', min: 0, max: 250, step: 1, value: age, fmt: function (v) { return v ? v + ' million years ago' : 'today'; }, input: function (v) { age = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { age = M.max(0, age - dt * 40); as.set(M.round(age)); F.redraw(); if (age <= 0) return false; }, { label: 'Run time forward', reset: function () { if (age <= 0) age = 250; } });
      V.button(row, 'Back to Pangaea', function () { age = 250; as.set(250); F.redraw(); });
      F.drag({ hit: function (x, y) { return G && M.hypot(x - G.cx, y - G.cy) < G.r ? 'g' : null; }, start: function (h, x, y) { down = [x, y, view.lon, view.lat]; }, move: function (h, x, y) { var d = 90 / G.r; view.lon = down[2] - (x - down[0]) * d; view.lat = clamp(down[3] + (y - down[1]) * d, -80, 80); F.redraw(); } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; if (a[0]) { age = clamp(age - a[0] * 10, 0, 250); as.set(age); } else view.lat = clamp(view.lat - a[1] * 10, -80, 80); F.redraw(); return true; }, 'Left and right arrow keys move through time; drag the globe to turn it.');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, legendH = 0, rr = M.min(w * 0.46, (h - 20) * 0.5), cx = w / 2, cy = h / 2 + 2, f = age / 250;
        G = globeProj(view.lon, view.lat, cx, cy, rr);
        ctx.fillStyle = k.dark ? '#0b1a27' : '#eef4f8'; ctx.fillRect(0, 0, w, h);
        var gr = ctx.createRadialGradient(cx - rr * 0.3, cy - rr * 0.3, rr * 0.1, cx, cy, rr); gr.addColorStop(0, k.dark ? '#2e6a96' : '#7fb7df'); gr.addColorStop(1, k.dark ? '#163a58' : '#3f7fb0');
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.fillStyle = gr; ctx.fill(); ctx.clip();
        // graticule
        for (var la = -60; la <= 60; la += 30) { var ps = []; for (var lo = -180; lo <= 180; lo += 4) ps.push([lo, la]); globeLine(ctx, G, ps, { color: 'rgba(255,255,255,0.25)', w: 1 }); }
        for (lo = -180; lo < 180; lo += 30) { ps = []; for (la = -90; la <= 90; la += 4) ps.push([lo, la]); globeLine(ctx, G, ps, { color: 'rgba(255,255,255,0.25)', w: 1 }); }
        function moved(block, lon, lat) { var R0 = GONDWANA[block]; if (!R0) return [lon, lat]; return R0.apply(lon, lat, f); }
        function drawPoly(arr, block, fill, stroke) {
          var pts = [], vis = 0;
          for (var i = 0; i < arr.length; i += 2) { var j = (i + 2) % arr.length, n = M.max(1, M.ceil(M.hypot(wrap180(arr[j] - arr[i]), arr[j + 1] - arr[i + 1]) / 3)); if (block === 'antarctica' && (arr[i + 1] === -90 || arr[j + 1] === -90)) n = M.max(n, 30); for (var s = 0; s < n; s++) { var t = s / n, ll = moved(block, arr[i] + wrap180(arr[j] - arr[i]) * t, arr[i + 1] + (arr[j + 1] - arr[i + 1]) * t), q = G.p(ll[0], ll[1]); if (q[2] < 0) { var dx = q[0] - cx, dy = q[1] - cy, d = M.hypot(dx, dy) || 1; q = [cx + dx / d * rr, cy + dy / d * rr, 0]; } else vis++; pts.push(q); } }
          if (!vis) return; ctx.beginPath(); pts.forEach(function (q, i) { if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 0.9; ctx.stroke();
        }
        var COL = { namerica: '#d9c27a', samerica: '#b7d48a', africa: '#e8b07a', madagascar: '#e8b07a', india: '#e09a9a', antarctica: '#e9edf0', australia: '#d8a0c8', eurasia: '#c9c19c' };
        Object.keys(BLOCKS).forEach(function (bk) { BLOCKS[bk].forEach(function (key) { var arr = key === 'india' ? INDIA : LAND[key]; if (!arr) return; drawPoly(arr, bk, COL[bk], 'rgba(60,40,20,0.5)'); }); if (bk === 'eurasia' && f > 0.2) drawPoly(INDIA, 'none', k.dark ? '#245478' : '#5d9bc9', null); });
        // evidence patches ride along with their continents
        EVIDENCE.forEach(function (e) { if (ev.indexOf(e[0]) < 0) return; var ll = moved(e[1], e[2], e[3]), q = G.p(ll[0], ll[1]); if (q[2] <= 0) return; var rp = e[4] * RAD * rr * 0.9; ctx.save(); ctx.globalAlpha = 0.5; circle(ctx, q[0], q[1], rp, EVCOL[e[0]]); ctx.restore(); circle(ctx, q[0], q[1], rp, null, EVCOL[e[0]], 1.5); });
        ctx.restore();
        circle(ctx, cx, cy, rr, null, k.axis, 1.2);
        txt(ctx, age ? 'about ' + M.round(age) + ' million years ago' : 'today', 12, 18, { size: 13, color: k.ink, bold: true });
        txt(ctx, 'Simplified: continents shown relative to Africa', 12, h - 10, { size: 10.5, color: k.muted });
        F.legend(ev.map(function (e) { return { c: EVCOL[e], t: EVNAME[e] }; }));
        F.alt('A globe showing the continents ' + (age ? 'about ' + M.round(age) + ' million years ago' : 'today') + (age > 200 ? ', joined in the supercontinent Pangaea' : '') + ', with patches where matching fossils, mountain belts and ice-sheet scratches are found.');
        F.say('About 250 million years ago the continents were joined as <b>Pangaea</b>. The same fossils (like the freshwater reptile Mesosaurus, which could not swim an ocean), matching mountain belts and scratches from one great ice sheet line up when the continents are fitted back together. Whole plates moved, ocean floor and all. Pangaea was not the first supercontinent: Rodinia came together about a billion years ago.', 'Fit the continents together and the fossils and rocks line up.');
      };
    }

    function hotspot(F) {
      F.size({ aspect: 1.9, max: 400, narrow: 0.95 });
      var isl = o.islands || [{ name: 'Hawaiʻi', km: 0, ma: 0.4 }, { name: 'Maui', km: 180, ma: 1.3 }, { name: 'Molokaʻi', km: 260, ma: 1.9 }, { name: 'Oʻahu', km: 370, ma: 3.0 }, { name: 'Kauaʻi', km: 530, ma: 5.1 }, { name: 'Midway', km: 2450, ma: 28 }];
      var sp = num(o.speed, 9), t = 0, fullKm = M.max.apply(null, isl.map(function (q) { return q.km; })) * 1.08 || 600, maxKm = o.islands ? fullKm : 600, sel = M.min(4, isl.length - 1);
      var T = F.tiles([{ k: 'i', label: 'Island', secret: false }, { k: 'd', label: 'Distance from the hot spot', secret: true }, { k: 'a', label: 'Age', secret: true }, { k: 's', label: 'Plate speed = distance ÷ age', secret: true }]);
      var bt = mk('div', 'esv-btns'); F.ctl.appendChild(bt); isl.forEach(function (q, i) { V.button(bt, F.quiet ? LETTERS[i] : q.name, function () { sel = i; F.redraw(); }); });
      var row = F.row(); F.player(row, function (dt) { t = (t + dt * 0.25) % 1; F.redraw(); }, { label: 'Move the plate', auto: false });
      if (fullKm > 700) check(row, 'Show the whole chain', maxKm > 700, function (v) { maxKm = v ? fullKm : 600; F.redraw(); });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, sea = h * 0.38, litB = h * 0.62, x0 = w - 60;
        function X(km) { return x0 - km / maxKm * (x0 - 30); }
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, sea); ctx.fillStyle = rgba(k.blue, 0.4); ctx.fillRect(0, sea, w, h * 0.1);
        ctx.fillStyle = k.dark ? '#4a3d33' : '#8c7a6b'; ctx.fillRect(0, sea + h * 0.1, w, litB - sea - h * 0.1); ctx.fillStyle = k.mantle; ctx.fillRect(0, litB, w, h - litB);
        // the plume, fixed in the mantle
        var g = ctx.createLinearGradient(0, h, 0, litB); g.addColorStop(0, 'rgba(255,107,44,0.9)'); g.addColorStop(1, 'rgba(255,212,59,0.9)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0 - 18, h); ctx.quadraticCurveTo(x0 - 8, litB + 10, x0 - 10, litB - 4); ctx.lineTo(x0 + 10, litB - 4); ctx.quadraticCurveTo(x0 + 8, litB + 10, x0 + 18, h); ctx.closePath(); ctx.fill();
        if (!F.quiet) txt(ctx, 'hot spot (fixed)', x0, h - 10, { size: 11, color: '#fff', align: 'center', bold: true, halo: 'rgba(80,20,0,0.5)' });
        var shift = t * (x0 - 30) * 0.15;
        isl.forEach(function (q, i) { if (q.km > maxKm) return; var x = X(q.km) - shift, ht = M.max(6, 46 * M.exp(-q.ma / 6)), sub = q.ma > 8; ctx.fillStyle = i === sel ? k.rust : k.landDark; ctx.beginPath(); ctx.moveTo(x - 30, sea + h * 0.1); ctx.quadraticCurveTo(x, sea + h * 0.1 - (sub ? ht * 0.3 + 10 : ht + 18), x + 30, sea + h * 0.1); ctx.closePath(); ctx.fill(); if (F.quiet) badge(ctx, LETTERS[i], x, sea - 26, { k: k, r: 10 }); else { txt(ctx, q.name, x, sea - 30 - (i % 2) * 16, { size: 11, color: k.ink, align: 'center', bold: i === sel }); txt(ctx, fm(q.ma, 1) + ' Ma', x, sea + h * 0.1 + 14 + (i % 2) * 13, { size: 10, color: '#fff', align: 'center' }); } });
        arrow(ctx, x0 - 80, sea + h * 0.17, x0 - 180, sea + h * 0.17, { color: '#fff', w: 2.4 }); if (!F.quiet) txt(ctx, 'plate moves ' + fm(sp, 1) + ' cm/yr', x0 - 130, sea + h * 0.17 + 14, { size: 11, color: '#fff', align: 'center' });
        // ruler
        line(ctx, [[30, 18], [x0, 18]], { color: k.axis, w: 1.4 }); var stp = niceStep(maxKm, 5); for (var d = 0; d <= maxKm; d += stp) { line(ctx, [[X(d), 14], [X(d), 22]], { color: k.axis, w: 1.2 }); txt(ctx, nf(d) + ' km', X(d), 32, { size: 10, color: k.muted, align: 'center' }); }
        var q = isl[sel], v = q.ma > 0 ? q.km / q.ma / 10 : 0;
        T.i(F.quiet ? LETTERS[sel] : q.name); T.d(nf(q.km) + ' km'); T.a(fm(q.ma, 1) + ' million years'); T.s(q.ma > 0 && q.km > 0 ? nf(q.km) + ' km ÷ ' + fm(q.ma, 1) + ' Myr = ' + fm(v, 1) + ' cm/yr' : '—');
        F.alt('A plate moving over a fixed hot spot builds a chain of volcanoes; the farther an island is from the hot spot, the older it is.');
        F.say('The plate slides over a hot spot that stays put deep in the mantle, so each new volcano is carried away and a fresh one grows: ages increase with distance. ' + (q.km > 0 ? (F.quiet ? '' : q.name + ': ') + nf(q.km) + ' km in ' + fm(q.ma, 1) + ' million years is ' + nf(q.km * 1e5, 0) + ' cm ÷ ' + nf(q.ma * 1e6, 0) + ' years = <b>' + fm(v, 1) + ' cm/yr</b>.' : '') + ' Hawaiian ages and distances rounded (USGS).', 'Islands farther from the hot spot are older.');
      };
    }

    function gps(F) {
      F.size({ aspect: 1.5, max: 460, narrow: 1.0 });
      var st = (o.stations || [{ name: 'A', x: -80, y: 30, ve: -18, vn: 32 }, { name: 'B', x: 70, y: -20, ve: -4, vn: 6 }, { name: 'C', x: -60, y: -70, ve: -20, vn: 30 }, { name: 'D', x: 90, y: 60, ve: -3, vn: 4 }]).map(function (s) { return { name: s.name, x: num(s.x, 0), y: num(s.y, 0), ve: num(s.ve, 0), vn: num(s.vn, 0) }; });
      var pair = o.pair || [0, 1];
      var T = F.tiles([{ k: 'rel', label: 'Velocity of ' + st[pair[1]].name + ' relative to ' + st[pair[0]].name, secret: true }, { k: 'along', label: 'Change in distance', secret: true }, { k: 'v', label: 'The boundary between them', secret: true }]);
      var row = F.row(); V.seg(row, { label: 'From station', items: st.map(function (s, i) { return [String(i), 'From ' + s.name]; }), value: String(pair[0]), change: function (v) { pair[0] = +v; F.redraw(); } }); V.seg(row, { label: 'To station', items: st.map(function (s, i) { return [String(i), 'to ' + s.name]; }), value: String(pair[1]), change: function (v) { pair[1] = +v; F.redraw(); } });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, s = M.min(w, h) / 300, cx = w / 2, cy = h / 2, vs = 2.2 * s;
        ctx.fillStyle = k.landSoft; ctx.fillRect(0, 0, w, h);
        for (var gx = -150; gx <= 150; gx += 50) { line(ctx, [[cx + gx * s, 0], [cx + gx * s, h]], { color: k.grid, w: 1 }); line(ctx, [[0, cy + gx * s], [w, cy + gx * s]], { color: k.grid, w: 1 }); }
        if (!o.stations) { line(ctx, [[cx - 20 * s, 0], [cx + 30 * s, h]], { color: k.dark ? '#8ce99a' : '#2b8a3e', w: 2.5, dash: [8, 4] }); if (!F.quiet) txt(ctx, 'a fault?', cx + 26 * s, 14, { size: 11, color: k.muted }); }
        txt(ctx, 'N ↑', w - 14, 14, { size: 12, color: k.ink, bold: true, align: 'right' }); txt(ctx, 'grid: 50 km · arrows: mm per year', 10, h - 10, { size: 10.5, color: k.muted });
        st.forEach(function (q, i) { var x = cx + q.x * s, y = cy - q.y * s; arrow(ctx, x, y, x + q.ve * vs, y - q.vn * vs, { color: k.blue, w: 2.4 }); poly(ctx, [[x, y - 7], [x - 6, y + 4], [x + 6, y + 4]], k.ink); txt(ctx, q.name, x - 10, y - 10, { size: 13, color: k.ink, bold: true, align: 'right', halo: k.halo }); if (!F.quiet) txt(ctx, fm(M.hypot(q.ve, q.vn), 0) + ' mm/yr', x + 8, y + 12, { size: 10, color: k.muted, halo: k.halo }); });
        var a = st[pair[0]], b = st[pair[1]], rm = EM.relMotion(a, b), bx = cx + b.x * s, by = cy - b.y * s;
        if (pair[0] !== pair[1]) { arrow(ctx, bx, by, bx + rm.ve * vs, by - rm.vn * vs, { color: k.rust, w: 3, dash: [6, 3] }); line(ctx, [[cx + a.x * s, cy - a.y * s], [bx, by]], { color: rgba(k.rust, 0.4), w: 1.5, dash: [3, 4] }); }
        var verdict = M.abs(rm.along) < 0.25 * rm.speed ? 'sliding past (transform)' : rm.along > 0 ? 'opening (moving apart)' : 'closing (moving together)';
        T.rel('east ' + fm(rm.ve, 1) + ', north ' + fm(rm.vn, 1) + ' mm/yr (' + fm(rm.speed, 1) + ' mm/yr)'); T.along((rm.along >= 0 ? '+' : '') + fm(rm.along, 1) + ' mm/yr'); T.v(verdict);
        F.alt('GPS stations with velocity arrows in millimeters per year. The relative velocity of station ' + b.name + ' compared with ' + a.name + ' is drawn as a dashed arrow.');
        F.say('Each arrow shows how a station moves compared with a fixed frame, not compared with its neighbor. To see what the boundary does, subtract: velocity of ' + b.name + ' − velocity of ' + a.name + ' = (' + fm(rm.ve, 1) + ', ' + fm(rm.vn, 1) + ') mm/yr. The distance between them changes by <b>' + fm(rm.along, 1) + ' mm/yr</b>: <b>' + verdict + '</b>.', 'Subtract the two velocities to see how the stations move relative to each other.');
      };
    }
  });

  /* es-boundary: Plate Boundary Cross-Sections.
     opts:
       type: 'ridge' | 'rift' | 'ocean-ocean' | 'ocean-continent' | 'collision' | 'transform'      modes: true for tabs
       time: million years (ridge with stripes: how long it has spread, 0–6); speed: half spreading rate (cm/yr, default 2.5)
       stripes: true (ridge: magnetic stripes); ages: true (ridge: age colors and a ruler); quakes: true (earthquake foci)
       quakeList: [{km, depth}] (distance from the trench and depth, km); melt: true (where rock melts); forces: true (slab pull, ridge push)
       dip: slab dip (degrees, default 35); letters: true (letter the features)
       quiet: hides rates, ages, dip, boundary and feature names; lock */
  R('es-boundary', function (el, o) {
    var F = frame(el, o, 'Plate boundaries', { aspect: 1.9, max: 420 });
    var types = { ridge: 'Mid-ocean ridge', rift: 'Continental rift', 'ocean-ocean': 'Ocean meets ocean', 'ocean-continent': 'Ocean meets continent', collision: 'Continents collide', transform: 'Transform fault' };
    var map = {}; Object.keys(types).forEach(function (t) { map[t] = function (F) { scene(F, t); }; });
    o.mode = o.mode || o.type;
    return F.modes(map, types, o.type && map[o.type] ? o.type : 'ridge');
    function scene(F, ty) {
      F.size({ aspect: ty === 'transform' ? 1.6 : 1.9, max: 440, narrow: 1.0 });
      var P = { t: clamp(num(o.time, 3), 0, 6), v: num(o.speed, 2.5), stripes: o.stripes != null ? !!o.stripes : ty === 'ridge', quakes: o.quakes != null ? !!o.quakes : ty !== 'ridge', melt: o.melt != null ? !!o.melt : true, forces: !!o.forces, dip: clamp(num(o.dip, 35), 10, 70), slip: 0 };
      var LT = F.letters, labs = [];
      var T = F.tiles(ty === 'ridge' ? [{ k: 'half', label: 'Half rate (each plate)', secret: true }, { k: 'full', label: 'Full rate (plates apart)', secret: true }, { k: 'age', label: 'Crust at the marker', secret: true }] : ty === 'transform' ? [{ k: 's', label: 'Active fault', secret: true }] : [{ k: 'dip', label: 'Slab dip', secret: true }]);
      if (ty === 'ridge') {
        var tsl = V.slider(F.ctl, { label: 'Time spreading', min: 0, max: 6, step: 0.02, value: P.t, fmt: function (v) { return fm(v, 2) + ' million years'; }, input: function (v) { P.t = v; F.redraw(); } });
        V.slider(F.ctl, { label: 'Half rate', min: 1, max: 8, step: 0.1, value: P.v, fmt: function (v) { return fm(v, 1) + ' cm/yr'; }, input: function (v) { P.v = v; F.redraw(); } });
        var row = F.row(); F.player(row, function (dt) { P.t = M.min(6, P.t + dt * 0.5); tsl.set(P.t); F.redraw(); if (P.t >= 6) return false; }, { label: 'Spread', reset: function () { if (P.t >= 6) P.t = 0; } });
        P.probe = 50; V.slider(F.ctl, { label: 'Distance from the ridge', min: 0, max: 200, step: 1, value: P.probe, fmt: function (v) { return v + ' km'; }, input: function (v) { P.probe = v; F.redraw(); } });
      } else if (ty !== 'transform') {
        var row2 = F.row(); check(row2, 'Earthquakes', P.quakes, function (v) { P.quakes = v; F.redraw(); }); check(row2, 'Melting', P.melt, function (v) { P.melt = v; F.redraw(); }); check(row2, 'Forces', P.forces, function (v) { P.forces = v; F.redraw(); });
        if (ty === 'ocean-ocean' || ty === 'ocean-continent') V.slider(F.ctl, { label: 'Slab dip', min: 15, max: 70, step: 1, value: P.dip, fmt: function (v) { return v + '°'; }, input: function (v) { P.dip = v; F.redraw(); } });
      } else { var row3 = F.row(); F.player(row3, function (dt) { P.slip += dt; F.redraw(); }, { label: 'Slide', auto: true }); }
      function L(name, x, y, k, ctx) { labs.push(name); if (LT) badge(ctx, LETTERS[labs.length - 1], x, y, { k: k }); else if (!F.quiet) pill(ctx, name, x, y, { k: k, size: F.c.w < 560 ? 10 : 11, clamp: [F.c.w, F.c.h] }); }
      F.draw = function () {
        labs = []; var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h;
        if (ty === 'transform') return transform(k, ctx, w, h);
        // cross-section: x from −600 to +600 km, depth 0..Dm km; vertical scale exaggerated 2× (labeled)
        var Dm = ty === 'ridge' || ty === 'rift' ? 200 : 700, top = ty === 'ridge' ? M.round(h * 0.3) : ty === 'rift' ? 40 : 66, sx = w / 1200, sy = (h - top - 14) / (Dm + 10);
        function X(km) { return w / 2 + km * sx; } function Y(dkm) { return top + dkm * sy; }
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, Y(0));
        ctx.fillStyle = k.mantle; ctx.fillRect(0, Y(0), w, h - Y(0));
        var lith = ty === 'ridge' ? function (x) { return 6 + 95 * M.sqrt(M.abs(x) / 600); } : function () { return 100; };
        if (ty === 'ridge' || ty === 'rift') {
          // lithosphere thickens away from the ridge as it cools
          ctx.fillStyle = k.dark ? '#5a4636' : '#9a7c62'; ctx.beginPath(); ctx.moveTo(0, Y(0)); for (var x = -600; x <= 600; x += 10) ctx.lineTo(X(x), Y(ty === 'rift' ? 30 + 70 * M.min(1, M.abs(x) / 200) : lith(x))); ctx.lineTo(w, Y(0)); ctx.closePath(); ctx.fill();
          if (ty === 'ridge') {
            ctx.fillStyle = rgba(k.blue, 0.6); ctx.fillRect(0, Y(0) - 14, w, 14); ctx.fillStyle = k.dark ? '#444' : '#555'; ctx.fillRect(0, Y(0), w, 4);
            arrow(ctx, X(-60), Y(0) + 26, X(-200), Y(0) + 26, { color: '#fff', w: 2.4 }); arrow(ctx, X(60), Y(0) + 26, X(200), Y(0) + 26, { color: '#fff', w: 2.4 });
            if (!F.quiet) { txt(ctx, fm(P.v, 1) + ' cm/yr', X(-130), Y(0) + 40, { size: 11, color: '#fff', align: 'center', bold: true }); txt(ctx, fm(P.v, 1) + ' cm/yr', X(130), Y(0) + 40, { size: 11, color: '#fff', align: 'center', bold: true }); }
            L('mid-ocean ridge', X(0), Y(0) - 26, k, ctx); L('lithosphere (cool, rigid)', X(390), Y(lith(390) * 0.55), k, ctx); L('asthenosphere (hot, soft, solid)', X(-300), Y(165), k, ctx);
            // the sea floor seen from above: stripes recorded during the last P.t million years, a mirror image on both sides
            var sy0 = 6, shh = top - 2 - sy0 - 6, Rk = M.max(60, P.v * 10 * 6.3), SX = function (km) { return 10 + (km + Rk) / (2 * Rk) * (w - 20); };
            ctx.save(); ctx.beginPath(); ctx.rect(10, sy0, w - 20, shh); ctx.clip();
            for (var xs = -Rk; xs < Rk; xs += Rk / 300) { var ag = M.abs(xs + Rk / 600) / (P.v * 10), c2; if (ag > P.t) c2 = k.dark ? '#3a4650' : '#b8c2cc'; else if (o.ages) c2 = mix('#ff6b2c', '#4c6ef5', M.min(1, ag / 6)); else c2 = EM.polarity(ag) > 0 ? '#1d1d1d' : '#f4f2ec'; ctx.fillStyle = c2; ctx.fillRect(SX(xs), sy0, (w - 20) / 600 + 0.6, shh); }
            ctx.restore(); line(ctx, [[SX(0), sy0 - 2], [SX(0), sy0 + shh + 2]], { color: k.red, w: 2 });
            if (P.probe != null && P.probe <= Rk) { var px0 = SX(P.probe); poly(ctx, [[px0, sy0 + shh + 1], [px0 - 6, sy0 + shh + 12], [px0 + 6, sy0 + shh + 12]], k.rust); line(ctx, [[px0, sy0], [px0, sy0 + shh]], { color: k.rust, w: 2 }); }
            F.legend(o.ages ? [{ c: '#ff6b2c', t: 'young crust' }, { c: '#4c6ef5', t: 'older crust' }] : [{ c: '#1d1d1d', t: 'normal polarity (like today)' }, { c: '#f4f2ec', t: 'reversed polarity' }, { c: k.dark ? '#3a4650' : '#b8c2cc', t: 'older crust' }]);
            var tkst = niceStep(Rk, F.c.w < 560 ? 2 : 4); for (var d = tkst; d <= Rk; d += tkst) { [d, -d].forEach(function (dd) { line(ctx, [[SX(dd), sy0 + shh], [SX(dd), sy0 + shh + 4]], { color: k.ink, w: 1 }); }); txt(ctx, nf(d) + ' km', SX(d), sy0 + shh + 11, { size: 9.5, color: k.ink, align: 'center' }); }
                    } else {
            ctx.fillStyle = k.crust; ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(X(-120), Y(0)); ctx.lineTo(X(-40), Y(6)); ctx.lineTo(X(40), Y(6)); ctx.lineTo(X(120), Y(0)); ctx.lineTo(w, Y(0)); ctx.lineTo(w, Y(35)); ctx.lineTo(X(120), Y(35)); ctx.lineTo(X(40), Y(22)); ctx.lineTo(X(-40), Y(22)); ctx.lineTo(X(-120), Y(35)); ctx.lineTo(0, Y(35)); ctx.closePath(); ctx.fill();
            // normal faults dropping a valley
            [-80, -40, 40, 80].forEach(function (fx) { line(ctx, [[X(fx), Y(0) + (M.abs(fx) < 60 ? 6 : 0)], [X(fx * 0.6), Y(30)]], { color: k.dark ? '#ffb4a3' : '#7a1c0c', w: 1.8 }); });
            arrow(ctx, X(-160), Y(15), X(-280), Y(15), { color: '#fff', w: 2.2 }); arrow(ctx, X(160), Y(15), X(280), Y(15), { color: '#fff', w: 2.2 });
            L('rift valley', X(0), Y(0) - 18, k, ctx); L('continental crust stretched thin', X(260), Y(45), k, ctx);
          }
          if (P.melt) { ctx.save(); var g = ctx.createRadialGradient(X(0), Y(60), 2, X(0), Y(60), 50 * sx * 3); g.addColorStop(0, 'rgba(255,60,20,0.85)'); g.addColorStop(1, 'rgba(255,60,20,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(X(0), Y(55), 110 * sx, 45 * sy, 0, 0, TAU); ctx.fill(); ctx.restore(); for (var u = -1; u <= 1; u += 2) arrow(ctx, X(u * 90), Y(180), X(u * 25), Y(80), { color: 'rgba(255,255,255,0.7)', w: 1.8 }); L('rising rock melts as the pressure drops', X(0), Y(110), k, ctx); }
          if (P.quakes) { var rq = rng(4); for (var q = 0; q < 14; q++) circle(ctx, X((rq() - 0.5) * 60), Y(2 + rq() * 10), 3, '#ffd43b', '#7a5a00', 1); }
          if (P.forces && ty === 'ridge') { arrow(ctx, X(150), Y(40), X(330), Y(55), { color: '#fff', w: 3 }); L('ridge push (small)', X(240), Y(70), k, ctx); }
        } else {
          // subduction or collision
          var dip = P.dip * RAD, trench = ty === 'collision' ? 0 : -60, oc = ty === 'ocean-continent', coll = ty === 'collision';
          // the sinking slab: a band 100 km thick going down at the dip angle from the trench
          var slabLen = coll ? 260 : 900; function sp2(s, off) { return [X(trench + s * M.cos(dip) - off * M.sin(dip)), Y(s * M.sin(dip) + off * M.cos(dip))]; }
          ctx.fillStyle = k.dark ? '#5a4636' : '#9a7c62';
          // lower plate (left, coming in), and its slab
          ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(X(trench), Y(0)); for (var s2 = 0; s2 <= slabLen; s2 += 10) { var pp = sp2(s2, 0); ctx.lineTo(pp[0], pp[1]); } for (s2 = slabLen; s2 >= 0; s2 -= 10) { pp = sp2(s2, 100); ctx.lineTo(pp[0], pp[1]); } ctx.lineTo(0, Y(100)); ctx.closePath(); ctx.fill();
          // upper plate (right)
          ctx.beginPath(); ctx.moveTo(X(trench + 20), Y(0)); ctx.lineTo(w, Y(0)); ctx.lineTo(w, Y(100)); var ub = []; for (s2 = 0; s2 <= 120 / M.tan(dip) + 40; s2 += 8) ub.push(sp2(s2, 0)); ctx.lineTo(X(trench + 100 / M.tan(dip)), Y(100)); for (var i = ub.length - 1; i >= 0; i--) ctx.lineTo(ub[i][0], ub[i][1]); ctx.closePath(); ctx.fill();
          // crusts and water
          if (!coll) { ctx.fillStyle = rgba(k.blue, 0.6); ctx.fillRect(0, Y(0) - 16, X(trench + (oc ? 30 : 400)), 16); ctx.fillStyle = k.dark ? '#444' : '#555'; ctx.fillRect(0, Y(0), X(trench), 7 * sy + 2); }
          if (oc || coll) { ctx.fillStyle = k.crust; ctx.beginPath(); ctx.moveTo(X(trench + 30), Y(0)); ctx.lineTo(X(trench + 120), Y(0) - 14); ctx.lineTo(X(trench + 260), Y(0) - (coll ? 34 : 18)); ctx.lineTo(w, Y(0) - 10); ctx.lineTo(w, Y(35)); ctx.lineTo(X(trench + 200), Y(coll ? 70 : 40)); ctx.lineTo(X(trench + 60), Y(20)); ctx.closePath(); ctx.fill(); }
          if (coll) { ctx.fillStyle = k.crust; ctx.beginPath(); ctx.moveTo(0, Y(0) - 10); ctx.lineTo(X(-200), Y(0) - 14); ctx.lineTo(X(trench), Y(0) - 30); ctx.lineTo(X(trench + 40), Y(0) - 36); ctx.lineTo(X(trench + 60), Y(30)); ctx.lineTo(X(-150), Y(40)); ctx.lineTo(0, Y(35)); ctx.closePath(); ctx.fill(); L('high mountains of thick crust (no volcanoes)', X(trench + 60), Y(0) - 50, k, ctx); L('continental crust is too light to sink far', X(-260), Y(60), k, ctx); }
          else { L('trench', X(trench), Y(0) + 18, k, ctx); }
          // volcanic arc above where the slab reaches about 100 km
          if (!coll) { var arcX = trench + 100 / M.tan(dip) + 20; poly(ctx, [[X(arcX) - 16, Y(0) - (oc ? 16 : 0)], [X(arcX), Y(0) - (oc ? 40 : 24)], [X(arcX) + 16, Y(0) - (oc ? 16 : 0)]], '#7d6b5d'); L(oc ? 'volcanic mountains (continental arc)' : 'volcanic island arc', X(arcX), Y(0) - (oc ? 54 : 38), k, ctx);
            if (P.melt) { var mx = X(arcX), my = Y(95); var g2 = ctx.createRadialGradient(mx, my, 2, mx, my, 40 * sx * 2); g2.addColorStop(0, 'rgba(255,60,20,0.85)'); g2.addColorStop(1, 'rgba(255,60,20,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.ellipse(mx, my, 60 * sx, 22 * sy, 0, 0, TAU); ctx.fill(); var wp = sp2(100 / M.sin(dip), 0); for (var dd = 0; dd < 3; dd++) arrow(ctx, wp[0] - 6 + dd * 6, wp[1] - 4, mx - 10 + dd * 10, my + 12, { color: 'rgba(116,192,252,0.95)', w: 1.6, head: 6, dash: [3, 3] }); L('water from the slab helps the mantle melt', X(arcX + 230), Y(140), k, ctx); line(ctx, [[mx, my], [mx, Y(0) - (oc ? 18 : 2)]], { color: 'rgba(255,90,30,0.8)', w: 2, dash: [4, 3] }); }
          }
          if (P.quakes) { var rq2 = rng(9), list = o.quakeList ? o.quakeList.map(function (q) { return [num(q.km, 0), num(q.depth, 0)]; }) : null; if (list) list.forEach(function (q) { circle(ctx, X(trench + q[0]), Y(q[1]), 3.5, '#ffd43b', '#7a5a00', 1); }); else for (var qq = 0; qq < (coll ? 20 : 34); qq++) { var ss = rq2() * (coll ? 200 : 700 / M.sin(dip)), dep = ss * M.sin(dip); if (dep > 690) continue; var pq = sp2(ss, 5 + rq2() * 25); circle(ctx, pq[0], pq[1], 3, '#ffd43b', '#7a5a00', 1); } if (!coll && !LT) { var lp = sp2(470, 140); if (!F.quiet) txt(ctx, 'quakes deepen along the slab', lp[0], lp[1], { size: 11, color: '#fff', halo: 'rgba(60,20,0,0.5)', align: 'center' }); } }
          if (P.forces && !coll) { var a1 = sp2(250, 50), a2 = sp2(380, 50); arrow(ctx, a1[0], a1[1], a2[0], a2[1], { color: '#fff', w: 4 }); L('slab pull: the sinking slab drags its plate', a2[0] - 40, a2[1] + 40, k, ctx); }
          arrow(ctx, X(-500), Y(0) + 30, X(-380), Y(0) + 30, { color: '#fff', w: 2.4 }); if (!coll) arrow(ctx, X(450), Y(50), X(330), Y(50), { color: '#fff', w: 2 });
          if (!F.quiet && !coll) { var dp = sp2(160, -10); txt(ctx, P.dip + '°', dp[0] + 6, dp[1] - 6, { size: 11, color: '#fff', bold: true }); }
          L('asthenosphere', X(-380), Y(Dm * 0.7), k, ctx); if (!coll) { L('ocean lithosphere', X(-380), Y(55), k, ctx); L(oc ? 'continental lithosphere' : 'ocean lithosphere', X(420), Y(70), k, ctx); }
          // depth scale
          [100, 300, 500, 700].forEach(function (d) { if (d <= Dm) { line(ctx, [[w - 10, Y(d)], [w - 4, Y(d)]], { color: '#fff', w: 1.5 }); txt(ctx, d + ' km', w - 12, Y(d), { size: 10, color: '#fff', align: 'right' }); } });
          T.dip(P.dip + '° (tan ' + P.dip + '° ≈ ' + fm(M.tan(dip), 2) + ': depth ÷ distance)');
        }
        if (ty === 'ridge') { var pa = P.probe / (P.v * 10); T.half(fm(P.v, 1) + ' cm/yr'); T.full(fm(2 * P.v, 1) + ' cm/yr'); T.age(pa <= P.t ? fm(pa, 2) + ' million years, ' + (EM.polarity(pa) > 0 ? 'normal' : 'reversed') : 'older than this run'); T.age.label('Crust ' + P.probe + ' km from the ridge'); }
        F.alt('A cross-section of a ' + (F.quiet ? 'plate boundary' : types[ty].toLowerCase()) + ' showing the lithosphere and asthenosphere' + (LT ? ', with lettered features' : '') + '.');
        F.say({ ridge: 'Plates pull apart and hot rock rises to fill the gap, so there is never an open hole: new ocean floor forms at the ridge and records Earth’s magnetic field as it cools, making mirror-image stripes on both sides. Each plate moves away at the <b>half rate</b> (' + fm(P.v, 1) + ' cm/yr); they separate at the <b>full rate</b> (' + fm(2 * P.v, 1) + ' cm/yr).', rift: 'A continent stretches, thins and cracks; blocks drop along faults to make a rift valley, like East Africa’s. If it keeps going, a new ocean opens.', 'ocean-ocean': 'The older, colder, denser plate sinks at a trench. The slab mostly stays solid; water released from it lowers the melting point of the mantle above, which melts and feeds a volcanic island arc. Quakes deepen along the slab, so its dip can be measured: tan(dip) = depth ÷ distance.', 'ocean-continent': 'Dense ocean lithosphere sinks under lighter continental lithosphere. Water from the slab makes the mantle above it melt, building a chain of volcanic mountains like the Andes or Cascades. Quakes deepen along the slab.', collision: 'Continental crust is too light to sink far, so when two continents meet the crust crumples and thickens into high mountains like the Himalayas, with earthquakes but few volcanoes.' }[ty], 'Watch how the plates move at this boundary.');
      };
      function transform(k, ctx, w, h) {
        // map view: two ridge segments offset along a transform fault; fracture zones beyond (inactive)
        ctx.fillStyle = k.dark ? '#183f5e' : '#bcd8ee'; ctx.fillRect(0, 0, w, h);
        var y1 = h * 0.3, y2 = h * 0.7, xr1 = w * 0.38, xr2 = w * 0.62, ys = h * 0.5, flow = (P.slip * 20) % 40;
        // stripes (ages) on either side of each ridge
        [[xr1, 0, ys], [xr2, ys, h]].forEach(function (r) { for (var d = 0; d < w; d += 4) { var age = M.abs(d - r[0]) / (w * 0.12) * 2; ctx.fillStyle = EM.polarity(age) > 0 ? rgba('#1d1d1d', 0.35) : 'rgba(255,255,255,0.25)'; ctx.fillRect(d, r[1], 4, r[2] - r[1]); } });
        line(ctx, [[xr1, 0], [xr1, ys]], { color: k.red, w: 4 }); line(ctx, [[xr2, ys], [xr2, h]], { color: k.red, w: 4 });
        line(ctx, [[xr1, ys], [xr2, ys]], { color: k.dark ? '#8ce99a' : '#2b8a3e', w: 4 });
        line(ctx, [[0, ys], [xr1, ys]], { color: rgba(k.ink, 0.5), w: 2, dash: [6, 5] }); line(ctx, [[xr2, ys], [w, ys]], { color: rgba(k.ink, 0.5), w: 2, dash: [6, 5] });
        // spreading arrows: away from each ridge
        [[xr1, h * 0.15], [xr2, h * 0.85]].forEach(function (r) { arrow(ctx, r[0] - 10, r[1], r[0] - 70, r[1], { color: k.ink, w: 2 }); arrow(ctx, r[0] + 10, r[1], r[0] + 70, r[1], { color: k.ink, w: 2 }); });
        // slip on the active segment: between the ridges the two sides move opposite ways
        var mid = (xr1 + xr2) / 2; arrow(ctx, mid + 30 - flow * 0.2, ys - 14, mid - 30 - flow * 0.2, ys - 14, { color: k.rust, w: 2.6 }); arrow(ctx, mid - 30 + flow * 0.2, ys + 14, mid + 30 + flow * 0.2, ys + 14, { color: k.rust, w: 2.6 });
        L('ridge segment', xr1 - 60, h * 0.08 + 14, k, ctx); L('transform fault (active: plates slide past, earthquakes)', mid, ys - 40, k, ctx); L('fracture zone (inactive scar)', w * 0.14, ys + 34, k, ctx); L('ridge segment', xr2 + 60, h * 0.92, k, ctx); L('fracture zone (inactive scar)', w * 0.86, ys - 34, k, ctx);
        if (!LT && !F.quiet) txt(ctx, 'Seen from above', 10, 14, { size: 11, color: k.ink, bold: true });
        T.s('only between the two ridge ends');
        F.alt('Map view of two mid-ocean ridge segments offset along a transform fault, with spreading arrows and fracture zones.');
        F.say('The ridge looks offset, but the plates on the transform between the ridge ends slide past each other in the direction set by spreading, often the opposite of what the offset suggests. Only that segment is active; beyond the ridge ends the fracture zones are scars where both sides move together.', 'Only the segment between the ridge ends is active.');
      }
    }
  });

  var LAYER_COLS = ['#d8b26a', '#8f8a80', '#c7d6dd', '#b98f63', '#9fb07a', '#d9c3a0'];
  /* es-structures: Folds and Faults.
     opts:
       mode: 'fault' | 'rebound' | 'fold' | 'strikedip' | 'stress'      modes: true or a list for tabs
       type: fault: 'normal' | 'reverse' | 'thrust' | 'right-lateral' | 'left-lateral'; fold: 'anticline' | 'syncline' | 'dome' | 'basin' | 'plunging'
       slip: m (fault, 0–100 m in the drawing's units); erosion: 0–1 (fold: how deep the top is worn down)
       strike: degrees from north (strikedip, default 0 = N–S); dip: degrees (default 30); distance: m to the well (strikedip, default 200)
       rate: mm/yr (rebound, default 35); slipPerQuake: m (rebound, default 4); years: years since the last quake (rebound)
       stress: 'shallow' | 'deep' (stress mode)
       letters: true (letter the blocks or features); quiet: hides type names, depth, recurrence and wall labels; lock */
  R('es-structures', function (el, o) {
    var F = frame(el, o, 'Folds and faults', { aspect: 1.6, max: 460 });
    return F.modes({ fault: fault, rebound: rebound, fold: fold, strikedip: strikedip, stress: stress }, { fault: 'Faults', rebound: 'Elastic rebound', fold: 'Folds', strikedip: 'Strike and dip', stress: 'Bend or break' });

    // oblique block projection: x east (0..Lx), y north (0..Ly, into the picture), z up
    function proj(w, h, Lx, Ly, Lz) { var s = M.min(w / (Lx + Ly * 0.62) * 0.86, h / (Lz + Ly * 0.36) * 0.78), ox = (w - (Lx + Ly * 0.62) * s) / 2, oy = h - (h - (Lz + Ly * 0.36) * s) / 2 - 4; return function (x, y, z) { return [ox + (x + y * 0.62) * s, oy - (z + y * 0.36) * s]; }; }

    function fault(F) {
      F.size({ aspect: 1.55, max: 460, narrow: 0.95 });
      var ty = ['normal', 'reverse', 'thrust', 'right-lateral', 'left-lateral'].indexOf(o.type) >= 0 ? o.type : 'normal', slip = clamp(num(o.slip, 30), 0, 60), LT = F.letters;
      var T = F.tiles([{ k: 't', label: 'Fault type', secret: true }, { k: 'm', label: 'Movement', secret: true }]);
      if (!F.lock && !o.type) V.seg(F.ctl, { label: 'Type', items: [['normal', 'Normal'], ['reverse', 'Reverse'], ['thrust', 'Thrust'], ['right-lateral', 'Strike-slip (right)'], ['left-lateral', 'Strike-slip (left)']], value: ty, change: function (v) { ty = v; F.redraw(); } });
      var ss = V.slider(F.ctl, { label: 'Slip', min: 0, max: 60, step: 1, value: slip, fmt: function (v) { return v + ' m'; }, input: function (v) { slip = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { slip = M.min(60, slip + dt * 20); ss.set(slip); F.redraw(); if (slip >= 60) return false; }, { label: 'Slip', reset: function () { if (slip >= 60) slip = 0; } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; slip = clamp(slip + (a[0] || -a[1]) * 5, 0, 60); ss.set(slip); F.redraw(); return true; }, 'Arrow keys change the slip.');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, Lx = 300, Ly = 160, Lz = 120, P = proj(w, h, Lx, Ly, Lz + 40);
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, h);
        var ss2 = ty === 'right-lateral' || ty === 'left-lateral', dip = ty === 'thrust' ? 28 : ss2 ? 90 : 60, dr = dip * RAD, x0 = 150, ztop = Lz;
        var dx = 0, dz = 0, dy = 0; // hanging wall (east block) displacement
        if (ty === 'normal') { dx = slip * M.cos(dr); dz = -slip * M.sin(dr); } else if (ty === 'reverse' || ty === 'thrust') { dx = -slip * M.cos(dr); dz = slip * M.sin(dr); } else dy = ty === 'right-lateral' ? -slip : slip;
        function xf(z) { return ss2 ? x0 : x0 + (ztop - z) / M.tan(dr); } // fault trace on the front face (x at height z), before slip
        var bands = [0, 22, 44, 66, 88, 110];
        // a block face (front, y = yy) between x limits, with layers; side: 'fw' (west of the fault) or 'hw'
        function face(side, yy) {
          var pts = [], N = 30; // outline: from bottom left
          if (side === 'fw') { pts = [[0, 0], [xf(0), 0]]; for (var i = 0; i <= N; i++) { var z = i / N * ztop; pts.push([xf(z), z]); } pts.push([0, ztop]); }
          else { pts = [[xf(0), 0], [Lx, 0], [Lx, ztop]]; for (var j = N; j >= 0; j--) { var z2 = j / N * ztop; pts.push([xf(z2), z2]); } }
          var sh = side === 'hw' ? [dx, dz, dy] : [0, 0, 0];
          ctx.save(); ctx.beginPath(); pts.forEach(function (p, i) { var q = P(p[0] + sh[0], yy + sh[2], p[1] + sh[1]); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.clip();
          bands.forEach(function (b, i) { var a = P(-50 + sh[0], yy + sh[2], b + sh[1]), c = P(Lx + 50 + sh[0], yy + sh[2], b + 22 + sh[1]); ctx.fillStyle = LAYER_COLS[i % LAYER_COLS.length]; ctx.fillRect(a[0], c[1], c[0] - a[0], a[1] - c[1]); });
          ctx.restore();
          ctx.save(); ctx.beginPath(); pts.forEach(function (p, i) { var q = P(p[0] + sh[0], yy + sh[2], p[1] + sh[1]); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
        }
        function top(side) { var sh = side === 'hw' ? [dx, dz, dy] : [0, 0, 0], xa = side === 'fw' ? 0 : xf(ztop), xb = side === 'fw' ? xf(ztop) : Lx; poly(ctx, [P(xa + sh[0], 0 + sh[2], ztop + sh[1]), P(xb + sh[0], 0 + sh[2], ztop + sh[1]), P(xb + sh[0], Ly + sh[2], ztop + sh[1]), P(xa + sh[0], Ly + sh[2], ztop + sh[1])], k.dark ? '#5d7a4c' : '#a9c98a', 'rgba(0,0,0,0.35)', 1); }
        function side(sideK) { if (sideK !== 'hw') return; var sh = [dx, dz, dy]; ctx.save(); ctx.beginPath(); [[Lx, 0, 0], [Lx, Ly, 0], [Lx, Ly, ztop], [Lx, 0, ztop]].forEach(function (p, i) { var q = P(p[0] + sh[0], p[1] + sh[2], p[2] + sh[1]); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.clip(); bands.forEach(function (b, i) { var q1 = P(Lx + sh[0], 0 + sh[2], b + sh[1]), q2 = P(Lx + sh[0], Ly + sh[2], b + sh[1]), q3 = P(Lx + sh[0], Ly + sh[2], b + 22 + sh[1]), q4 = P(Lx + sh[0], 0 + sh[2], b + 22 + sh[1]); poly(ctx, [q1, q2, q3, q4], mixHex(LAYER_COLS[i % LAYER_COLS.length], '#000000', 0.18)); }); ctx.restore(); }
        // draw: the fault plane exposed on the top of the footwall (normal) is part of the hanging wall's movement; draw back to front
        // the exposed part of the fault plane: the footwall's scarp (normal fault) or the hanging wall's underside edge (reverse)
        function scarp() {
          if (ss2 || slip === 0) return;
          var col = k.dark ? '#7a6a5a' : '#b9a58f';
          if (dz < 0) poly(ctx, [P(xf(ztop + dz), 0, ztop + dz), P(xf(ztop), 0, ztop), P(xf(ztop), Ly, ztop), P(xf(ztop + dz), Ly, ztop + dz)], col, 'rgba(0,0,0,0.4)', 1);
          else poly(ctx, [P(xf(ztop - dz) + dx, 0, ztop), P(xf(ztop) + dx, 0, ztop + dz), P(xf(ztop) + dx, Ly, ztop + dz), P(xf(ztop - dz) + dx, Ly, ztop)], mixHex(col, '#000000', 0.25), 'rgba(0,0,0,0.4)', 1);
        }
        if (ss2) { top('fw'); top('hw'); face('fw', 0); face('hw', 0); side('hw'); }
        else if (dz < 0) { top('fw'); scarp(); top('hw'); face('fw', 0); face('hw', 0); side('hw'); }
        else { top('fw'); top('hw'); scarp(); face('fw', 0); face('hw', 0); side('hw'); }
        // a road across the top, broken by the fault
        var ry = Ly * 0.55; line(ctx, [P(0, ry, ztop), P(xf(ztop), ry, ztop)], { color: '#4a4a4a', w: 4 }); line(ctx, [P(xf(ztop) + dx, ry + dy, ztop + dz), P(Lx + dx, ry + dy, ztop + dz)], { color: '#4a4a4a', w: 4 });
        line(ctx, [P(0, ry, ztop), P(xf(ztop), ry, ztop)], { color: '#f8f8f8', w: 1, dash: [5, 4] }); line(ctx, [P(xf(ztop) + dx, ry + dy, ztop + dz), P(Lx + dx, ry + dy, ztop + dz)], { color: '#f8f8f8', w: 1, dash: [5, 4] });
        // stress arrows
        var ac = k.rust, mid = P(Lx / 2, Ly / 2, ztop + 50);
        if (ty === 'normal') { arrow(ctx, mid[0] - 30, mid[1], mid[0] - 110, mid[1], { color: ac, w: 3 }); arrow(ctx, mid[0] + 30, mid[1], mid[0] + 110, mid[1], { color: ac, w: 3 }); if (!F.quiet) txt(ctx, 'pulled apart (tension)', mid[0], mid[1] - 14, { size: 12, color: ac, align: 'center', bold: true }); }
        else if (!ss2) { arrow(ctx, mid[0] - 120, mid[1], mid[0] - 40, mid[1], { color: ac, w: 3 }); arrow(ctx, mid[0] + 120, mid[1], mid[0] + 40, mid[1], { color: ac, w: 3 }); if (!F.quiet) txt(ctx, 'squeezed (compression)', mid[0], mid[1] - 14, { size: 12, color: ac, align: 'center', bold: true }); }
        else { var a = P(Lx * 0.25, Ly * 0.2, ztop + 20), b = P(Lx * 0.25, Ly * 0.9, ztop + 20), c = P(Lx * 0.75, Ly * 0.9, ztop + 20), d2 = P(Lx * 0.75, Ly * 0.2, ztop + 20); var sgn = ty === 'right-lateral' ? 1 : -1; if (sgn > 0) { arrow(ctx, a[0], a[1], b[0], b[1], { color: ac, w: 3 }); arrow(ctx, c[0], c[1], d2[0], d2[1], { color: ac, w: 3 }); } else { arrow(ctx, b[0], b[1], a[0], a[1], { color: ac, w: 3 }); arrow(ctx, d2[0], d2[1], c[0], c[1], { color: ac, w: 3 }); } if (!F.quiet) txt(ctx, 'sheared', mid[0], mid[1] - 18, { size: 12, color: ac, align: 'center', bold: true }); }
        // labels
        var fwP = P(xf(ztop * 0.4) - 60, 0, ztop * 0.4), hwP = P(xf(ztop * 0.5) + 60 + dx, 0 + dy, ztop * 0.5 + dz);
        if (!ss2) { if (LT) { badge(ctx, 'A', fwP[0], fwP[1], { k: k }); badge(ctx, 'B', hwP[0], hwP[1], { k: k }); } else if (!F.quiet) { pill(ctx, 'footwall', fwP[0], fwP[1], { k: k, size: 12, bold: true }); pill(ctx, 'hanging wall', hwP[0], hwP[1], { k: k, size: 12, bold: true }); } }
        var mv = ty === 'normal' ? 'hanging wall moved down' : ty === 'reverse' ? 'hanging wall moved up' : ty === 'thrust' ? 'hanging wall pushed up a gently dipping fault' : ty === 'right-lateral' ? 'the far side moved to the right, sideways' : 'the far side moved to the left, sideways';
        T.t({ normal: 'normal fault', reverse: 'reverse fault', thrust: 'thrust fault (a low-angle reverse fault)', 'right-lateral': 'strike-slip, right-lateral', 'left-lateral': 'strike-slip, left-lateral' }[ty]); T.m(mv);
        F.alt('A block of layered rock cut by a ' + (F.quiet ? 'fault' : T.t ? ty + ' fault' : 'fault') + ' after ' + M.round(slip) + ' m of slip; layers and a road are offset.');
        F.say(ss2 ? 'In a strike-slip fault the blocks slide sideways past each other. Stand on one side and look across: if the far side moved right, it is right-lateral.' : 'The hanging wall is the block above the tilted fault; the footwall is below it. The type depends on how the hanging wall moved compared with the footwall, not on which side stands higher today: down in a normal fault (the crust is pulled apart), up in a reverse or thrust fault (squeezed).', 'The fault type depends on how the hanging wall moved.');
      };
    }

    function rebound(F) {
      F.size({ aspect: 1.8, max: 400, narrow: 1.0 });
      var P = { v: num(o.rate, 35), s: num(o.slipPerQuake, 4), yrs: num(o.years, 60) }, Tr = function () { return P.s * 1000 / P.v; }, quakes = 0;
      var T = F.tiles([{ k: 'rec', label: 'Average time between quakes', secret: true }, { k: 'stored', label: 'Strain stored (slip owed)', secret: true }]);
      var ys = V.slider(F.ctl, { label: 'Years since the last quake', min: 0, max: 400, step: 1, value: P.yrs, fmt: function (v) { return v + ' years'; }, input: function (v) { P.yrs = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Plate motion', min: 5, max: 60, step: 1, value: P.v, fmt: function (v) { return v + ' mm/yr'; }, input: function (v) { P.v = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Slip in each quake', min: 0.5, max: 10, step: 0.5, value: P.s, fmt: function (v) { return fm(v, 1) + ' m'; }, input: function (v) { P.s = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { P.yrs += dt * 40; if (P.yrs >= Tr()) { P.yrs = 0; quakes++; } ys.set(M.min(400, M.round(P.yrs))); F.redraw(); }, { label: 'Run the years' });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, cx = w / 2, cy = h * 0.45;
        ctx.fillStyle = k.landSoft; ctx.fillRect(0, 0, w, h * 0.78);
        line(ctx, [[cx, 0], [cx, h * 0.78]], { color: k.red, w: 3, dash: [10, 5] });
        if (!F.quiet) txt(ctx, 'locked fault', cx + 6, 14, { size: 11, color: k.red, bold: true });
        arrow(ctx, w * 0.12, h * 0.1, w * 0.12, h * 0.1 + 40, { color: k.ink, w: 2.4 }); arrow(ctx, w * 0.88, h * 0.1 + 40, w * 0.88, h * 0.1, { color: k.ink, w: 2.4 });
        // the fence: far-field offset d = v·t; locked fault: smooth bend (elastic), arctan profile; a quake would release the stored slip as a step
        var stored = P.v * P.yrs / 1000, amp = M.min(h * 0.28, stored * 26), pts = [];
        for (var x = 0; x <= w; x += 3) { var u = (x - cx) / (w * 0.08); pts.push([x, cy - amp * (2 / PI) * M.atan(u) * 0.5]); }
        line(ctx, pts, { color: '#8b5a2b', w: 4 });
        for (x = 6; x < w; x += 18) { var u2 = (x - cx) / (w * 0.08); var yy = cy - amp * (2 / PI) * M.atan(u2) * 0.5; line(ctx, [[x, yy - 8], [x, yy + 8]], { color: '#6b4a2b', w: 2 }); }
        if (!F.quiet) txt(ctx, 'fence built straight across the fault', w * 0.06, cy + 26, { size: 11, color: k.ink });
        // timeline
        var ty0 = h * 0.86, x0 = 20, x1 = w - 20, span = 400; line(ctx, [[x0, ty0], [x1, ty0]], { color: k.axis, w: 1.5 });
        for (var t = 0; t <= span; t += Tr()) { var xx = x0 + t / span * (x1 - x0); if (t > 0) { poly(ctx, [[xx, ty0 - 8], [xx - 5, ty0 + 2], [xx + 5, ty0 + 2]], k.red); } }
        var nx = x0 + M.min(P.yrs, span) / span * (x1 - x0); circle(ctx, nx, ty0, 5, k.rust);
        txt(ctx, 'now', nx, ty0 + 14, { size: 10, color: k.rust, align: 'center' }); txt(ctx, 'red marks: when the stored slip would be released, if quakes were regular (they are not exactly)', x0, h - 6, { size: 10, color: k.muted });
        T.rec(nf(Tr()) + ' years (' + fm(P.s, 1) + ' m ÷ ' + P.v + ' mm/yr)'); T.stored(fm(stored, 2) + ' m');
        F.alt('A map of a fence built across a locked fault. As the plates move, the fence bends near the fault; in an earthquake the fault slips and the fence snaps into two offset straight pieces.');
        F.say('The plates keep moving, but the fault is stuck, so the rock bends and stores strain like a bent stick. When the stress overcomes friction the fault slips suddenly and the rock snaps back: an earthquake. Here ' + P.v + ' mm/yr and ' + fm(P.s, 1) + ' m per quake give about <b>' + nf(Tr()) + ' years</b> between quakes, on average. Small quakes don’t prevent big ones: it takes about 1,000 magnitude 5 quakes to release the energy of one magnitude 7.', 'Strain builds while the fault is locked, then is released in a quake.');
      };
    }

    function fold(F) {
      F.size({ aspect: 1.5, max: 480, narrow: 0.95 });
      var ty = ['anticline', 'syncline', 'dome', 'basin', 'plunging'].indexOf(o.type) >= 0 ? o.type : 'anticline', er = clamp(num(o.erosion, 0.4), 0, 1), LT = F.letters;
      var T = F.tiles([{ k: 'core', label: 'In the core', secret: true }]);
      if (!F.lock && !o.type) V.seg(F.ctl, { label: 'Fold', items: [['anticline', 'Anticline'], ['syncline', 'Syncline'], ['dome', 'Dome'], ['basin', 'Basin'], ['plunging', 'Plunging']], value: ty, change: function (v) { ty = v; F.redraw(); } });
      var es = V.slider(F.ctl, { label: 'Erosion', min: 0, max: 1, step: 0.01, value: er, fmt: function (v) { return v < 0.05 ? 'none' : fm(v * 100, 0) + '% worn down'; }, input: function (v) { er = v; F.redraw(); } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; er = clamp(er + (a[0] || -a[1]) * 0.05, 0, 1); es.set(er); F.redraw(); return true; }, 'Arrow keys wear the top down or build it back.');
      // fold surface height offset at (x, y) in 0..1 coordinates
      function fz(x, y) { var c = M.cos(2 * PI * (x - 0.5)), cy2 = M.cos(2 * PI * (y - 0.5)), A = 0.3; if (ty === 'anticline') return A * (c + 1) / 2; if (ty === 'syncline') return -A * (c + 1) / 2 + A; if (ty === 'dome') return A * M.exp(-((x - 0.5) * (x - 0.5) + (y - 0.5) * (y - 0.5)) * 9); if (ty === 'basin') return A - A * M.exp(-((x - 0.5) * (x - 0.5) + (y - 0.5) * (y - 0.5)) * 9); return A * (c + 1) / 2 - 0.25 * y; }
      function layerAt(x, y, z) { var b = z - fz(x, y); return M.floor(b / 0.09); } // layer index (0 = oldest at the bottom)
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, Lz = 0.62, top = 0.62 - er * 0.32, P = proj(w, h, 1, 0.6, 0.7);
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, h);
        var N = 54, Ny = 30;
        function col(li) { var t = clamp((li + 2) / 11, 0, 1), c0 = t < 0.5 ? mixHex('#5b3f86', '#b5654a', t * 2) : mixHex('#b5654a', '#f2d27a', (t - 0.5) * 2); return (li % 2) ? mixHex(c0, '#ffffff', 0.12) : c0; } // older layers darker and more purple
        // top (eroded flat at height `top`): the map pattern
        for (var j = Ny - 1; j >= 0; j--) for (var i = 0; i < N; i++) { var x1 = i / N, x2 = (i + 1) / N, y1 = j / Ny * 0.6, y2 = (j + 1) / Ny * 0.6, li = layerAt((x1 + x2) / 2, (y1 + y2) / 2 / 0.6, top); poly(ctx, [P(x1, y1, top), P(x2, y1, top), P(x2, y2, top), P(x1, y2, top)], col(li), col(li), 0.6); }
        // front face (y = 0): the cross-section
        for (var i2 = 0; i2 < N; i2++) for (var zz = 0; zz < 70; zz++) { var xa = i2 / N, xb = (i2 + 1) / N, za = zz / 70 * top, zb = (zz + 1) / 70 * top, l2 = layerAt((xa + xb) / 2, 0, (za + zb) / 2); var cc = mixHex(col(l2), '#000000', 0.08); poly(ctx, [P(xa, 0, za), P(xb, 0, za), P(xb, 0, zb), P(xa, 0, zb)], cc, cc, 0.6); }
        // right face (x = 1)
        for (var j2 = 0; j2 < Ny; j2++) for (var z3 = 0; z3 < 40; z3++) { var ya = j2 / Ny * 0.6, yb = (j2 + 1) / Ny * 0.6, zc = z3 / 40 * top, zd = (z3 + 1) / 40 * top, l3 = layerAt(1, (ya + yb) / 2 / 0.6, (zc + zd) / 2); var c3 = mixHex(col(l3), '#000000', 0.2); poly(ctx, [P(1, ya, zc), P(1, yb, zc), P(1, yb, zd), P(1, ya, zd)], c3, c3, 0.6); }
        // outline
        [[P(0, 0, 0), P(1, 0, 0), P(1, 0, top), P(0, 0, top)], [P(1, 0, 0), P(1, 0.6, 0), P(1, 0.6, top), P(1, 0, top)], [P(0, 0, top), P(1, 0, top), P(1, 0.6, top), P(0, 0.6, top)]].forEach(function (q) { poly(ctx, q, null, 'rgba(0,0,0,0.5)', 1.2); });
        // ages on the map: oldest in an anticline's core
        var coreL = layerAt(0.5, 0.5, top), edgeL = layerAt(0.05, 0.5, top), older = coreL < edgeL;
        F.legend([{ c: '#5b3f86', t: 'older layers' }, { c: '#f2d27a', t: 'younger layers' }]);
        var cp = P(0.5, 0.3, top); if (!F.quiet) pill(ctx, older ? 'oldest rock in the middle' : 'youngest rock in the middle', cp[0], cp[1] - 2, { k: k, size: 11, bold: true });
        // strike and dip symbols on the limbs (long line along strike, tick pointing down-dip)
        if (ty === 'anticline' || ty === 'syncline' || ty === 'plunging') [0.25, 0.75].forEach(function (xx) { var p0 = P(xx, 0.1, top), p1 = P(xx, 0.45, top), m0 = P(xx, 0.28, top), down = (ty === 'syncline') === (xx > 0.5) ? -1 : 1, tick = P(xx + down * 0.05, 0.28, top); line(ctx, [p0, p1], { color: '#111', w: 2.4 }); line(ctx, [m0, tick], { color: '#111', w: 2.4 }); });
        T.core(older ? 'the oldest layers' : 'the youngest layers');
        F.alt('A block of folded rock (' + (F.quiet ? 'a fold' : ty) + ') worn down by erosion, showing the pattern of layers on the flat top and the folds on the sides.');
        F.say('Erosion often wears the land flat, so a fold is not always a hill or a valley. Read the map pattern instead: an anticline (or dome) has its <b>oldest</b> layers in the middle; a syncline (or basin) has its youngest there. The strike-and-dip symbols point down the slope of the layers.', 'Find folds by the pattern of rock ages, not by hills and valleys.');
      };
    }

    function strikedip(F) {
      F.size({ aspect: 1.9, max: 400, narrow: 0.8 });
      var P = { str: num(o.strike, 0), dip: clamp(num(o.dip, 30), 1, 89), d: num(o.distance, 200), az: 90 };
      var T = F.tiles([{ k: 'sd', label: 'Strike and dip', secret: false }, { k: 'dd', label: 'Distance along the dip direction', secret: true }, { k: 'depth', label: 'Depth to the layer at the well', secret: true }]);
      V.slider(F.ctl, { label: 'Strike (from north)', min: 0, max: 179, step: 1, value: P.str, fmt: function (v) { return 'N' + v + '°E'; }, input: function (v) { P.str = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Dip', min: 5, max: 85, step: 1, value: P.dip, fmt: function (v) { return v + '°'; }, input: function (v) { P.dip = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Well, distance east', min: 0, max: 500, step: 10, value: P.d, fmt: function (v) { return v + ' m'; }, input: function (v) { P.d = v; F.redraw(); } });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, mw = wide ? w * 0.45 : w, mh = wide ? h : h * 0.5;
        // map view
        ctx.fillStyle = k.landSoft; ctx.fillRect(0, 0, mw, mh);
        var cx = mw * 0.4, cy = mh * 0.55, sc = M.min(mw, mh) * 0.36 / 250, sr = P.str * RAD, dipAz = P.str + 90; // dip direction: 90° clockwise from the strike (east side when strike is N–S)
        var ux = M.sin(sr), uy = -M.cos(sr), dxv = M.sin(dipAz * RAD), dyv = -M.cos(dipAz * RAD);
        line(ctx, [[cx - ux * 140, cy - uy * 140], [cx + ux * 140, cy + uy * 140]], { color: k.rust, w: 3 });
        line(ctx, [[cx, cy], [cx + dxv * 22, cy + dyv * 22]], { color: k.rust, w: 3 }); if (!F.quiet || true) txt(ctx, P.dip + '°', cx + dxv * 34, cy + dyv * 34, { size: 12, color: k.rust, bold: true, align: 'center' });
        if (!F.quiet) txt(ctx, 'outcrop of the layer (strike line)', cx + ux * 60 + 8, cy + uy * 60 - 8, { size: 10.5, color: k.ink, halo: k.halo });
        var wx = cx + P.d * sc, wy = cy; circle(ctx, wx, wy, 6, k.blue, '#fff', 2); txt(ctx, 'well', wx + 8, wy - 8, { size: 11, color: k.ink, bold: true });
        line(ctx, [[cx, cy + 30], [wx, cy + 30]], { color: k.muted, w: 1.2 }); txt(ctx, P.d + ' m east', (cx + wx) / 2, cy + 42, { size: 10.5, color: k.muted, align: 'center' });
        // compass
        var kx = mw - 34, ky = 34; circle(ctx, kx, ky, 20, k.bg, k.axis, 1.2); arrow(ctx, kx, ky + 12, kx, ky - 16, { color: k.ink, w: 1.8, head: 7 }); txt(ctx, 'N', kx, ky - 26, { size: 11, color: k.ink, bold: true, align: 'center' });
        txt(ctx, 'Map view', 10, 14, { size: 11.5, color: k.ink, bold: true });
        // cross-section along the dip direction
        var sx0 = wide ? mw + 10 : 10, sy0 = wide ? 10 : mh + 10, sw = wide ? w - mw - 20 : w - 20, sh = wide ? h - 20 : h - mh - 20;
        var along = P.d * M.sin(dipAz * RAD); // the well's distance measured along the dip direction
        var depth = along * M.tan(P.dip * RAD), maxD = M.max(150, M.abs(along) * 1.2), s2 = M.min(sw / (maxD * 1.25), sh / (M.max(depth, 60) * 1.3)), gx = sx0 + 36, gy = sy0 + 26;
        ctx.fillStyle = k.sky; ctx.fillRect(sx0, sy0, sw, 26); ctx.fillStyle = k.soil; ctx.fillRect(sx0, gy, sw, sh - 26);
        var L = (sh) / s2; ctx.save(); ctx.beginPath(); ctx.rect(sx0, sy0, sw, sh); ctx.clip(); poly(ctx, [[gx - 16, gy], [gx - 16 + L * s2 / M.tan(P.dip * RAD), gy + L * s2], [gx + L * s2 / M.tan(P.dip * RAD), gy + L * s2], [gx, gy]], '#d8b26a', 'rgba(0,0,0,0.4)', 1); ctx.restore();
        if (along > 0) { var wxs = gx + along * s2; line(ctx, [[wxs, gy - 14], [wxs, gy + depth * s2]], { color: k.blue, w: 3 }); circle(ctx, wxs, gy + depth * s2, 4, k.blue); if (!F.quiet) txt(ctx, nf(depth, 0) + ' m', wxs + 8, gy + depth * s2 / 2, { size: 12, color: k.ink, bold: true, halo: k.halo }); line(ctx, [[gx, gy + 12], [wxs, gy + 12]], { color: '#fff', w: 1 }); }
        ctx.save(); ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(gx, gy, 30, 0, P.dip * RAD); ctx.stroke(); ctx.restore(); txt(ctx, P.dip + '°', gx + 36, gy + 12, { size: 11, color: '#fff', bold: true });
        txt(ctx, 'Cross-section along the dip direction', sx0 + 8, sy0 + 13, { size: 11, color: k.ink, bold: true });
        var strS = 'N' + P.str + '°E', dipS = P.dip + '° ' + (['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][M.round(wrap360(dipAz) / 45) % 8]);
        T.sd('strike ' + strS + ', dip ' + dipS); T.dd(nf(along, 0) + ' m'); T.depth(along > 0 ? nf(depth, 0) + ' m (distance × tan ' + P.dip + '°)' : 'the layer dips away from this side');
        F.alt('A tilted layer: a map with a strike-and-dip symbol and a well, and a cross-section showing the layer’s depth below the well.');
        F.say('Strike is the compass direction of a horizontal line on the tilted layer; dip is how steeply it slopes, measured at right angles to the strike, straight down the slope. A well ' + nf(along, 0) + ' m out along the dip direction meets the layer at depth = distance × tan(dip) = <b>' + (along > 0 ? nf(depth, 0) + ' m' : '—') + '</b>.', 'Dip points straight down the slope, at a right angle to the strike.');
      };
    }

    function stress(F) {
      F.size({ aspect: 2.0, max: 340, narrow: 1.1 });
      var deep = o.stress === 'deep', t = 0;
      if (!F.lock) V.seg(F.ctl, { label: 'Where', items: [['shallow', 'Cold, near the surface'], ['deep', 'Hot, deep down']], value: deep ? 'deep' : 'shallow', change: function (v) { deep = v === 'deep'; t = 0; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { t = M.min(1, t + dt * 0.35); F.redraw(); if (t >= 1) return false; }, { label: 'Squeeze', reset: function () { t = 0; } });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, tt = V.reduced && t === 0 ? 1 : t, cx = w / 2, cy = h / 2, bw = M.min(w * 0.3, 220) * (1 - 0.18 * tt), bh = h * 0.5 * (deep ? 1 + 0.15 * tt : 1);
        ctx.fillStyle = deep ? (k.dark ? '#4a2416' : '#ffe2d0') : k.panel; ctx.fillRect(0, 0, w, h);
        arrow(ctx, cx - bw / 2 - 90, cy, cx - bw / 2 - 12, cy, { color: k.rust, w: 4 }); arrow(ctx, cx + bw / 2 + 90, cy, cx + bw / 2 + 12, cy, { color: k.rust, w: 4 });
        ctx.save(); ctx.beginPath(); ctx.rect(cx - bw / 2, cy - bh / 2, bw, bh); ctx.clip();
        for (var i = 0; i < 6; i++) { var y0 = cy - bh / 2 + (i + 0.5) * bh / 6; ctx.strokeStyle = LAYER_COLS[i % 6]; ctx.lineWidth = bh / 6; ctx.beginPath(); for (var x = cx - bw / 2 - 4; x <= cx + bw / 2 + 4; x += 3) { var yy = deep ? y0 - M.sin((x - cx) / bw * PI * 2) * 22 * tt : y0; if (x === cx - bw / 2 - 4) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); } ctx.stroke(); }
        ctx.restore(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
        if (!deep && tt > 0.6) { line(ctx, [[cx - bw * 0.3, cy - bh / 2], [cx + bw * 0.2, cy + bh / 2]], { color: '#111', w: 3 }); line(ctx, [[cx + bw * 0.1, cy - bh / 2], [cx - bw * 0.15, cy + bh * 0.1]], { color: '#111', w: 2 }); }
        txt(ctx, deep ? 'Hot and deep: it bends and flows (ductile)' : 'Cold and near the surface: it breaks (brittle)', cx, 16, { size: 13, color: k.ink, bold: true, align: 'center' });
        F.alt('A layered rock sample squeezed from both sides: ' + (deep ? 'hot and deep, it folds without breaking.' : 'cold and shallow, it cracks along fractures.'));
        F.say('The same rock can break or bend. Near the surface, cold rock is brittle and fractures (faults). Deep down, with heat, pressure and time, rock is ductile and folds like warm wax without breaking.', 'Cold rock breaks; hot, deep rock bends.');
      };
    }
  });

  var MMI_COL = ['#ffffff', '#bfccff', '#a0e6ff', '#80ffff', '#7aff93', '#ffff00', '#ffc800', '#ff9100', '#ff0000', '#c80000'];
  var MMI_WORD = ['not felt', 'weak', 'weak', 'light', 'moderate', 'strong', 'very strong', 'severe', 'violent', 'extreme'];
  /* es-seismic: Seismic Waves.
     opts:
       mode: 'waves' | 'seismograms' | 'locate' | 'magnitude' | 'intensity'      modes: true or a list for tabs
       vp, vs: wave speeds (km/s, default 6 and 3.5); stations: seismograms [{name, distance (km)}] or locate [{x, y (km), lag (s)}]
       circles: true (locate: draw the circles); M1, M2: magnitudes (default 5 and 7); area: fault area (km²); slip: m (moment magnitude)
       blocks: true (magnitude: energy as blocks); basin: true (intensity: a soft-sediment basin); letters: true (lettered points)
       quiet: hides lag, distance, ratios, Mw and intensity values; lock */
  R('es-seismic', function (el, o) {
    var F = frame(el, o, 'Seismic waves', { aspect: 1.7, max: 440 });
    var vp = num(o.vp, 6), vs = num(o.vs, 3.5);
    return F.modes({ waves: waves, seismograms: grams, locate: locate, magnitude: magnitude, intensity: intensity }, { waves: 'Wave types', seismograms: 'Seismograms', locate: 'Find the epicenter', magnitude: 'Magnitude', intensity: 'Shaking' });

    function waves(F) {
      F.size({ aspect: 1.8, max: 400, narrow: 1.0 });
      var kind = 'P', t = 0, liquid = false;
      if (!F.lock) V.seg(F.ctl, { label: 'Wave', items: [['P', 'P (push-pull)'], ['S', 'S (side to side)'], ['Love', 'Love (surface)'], ['Rayleigh', 'Rayleigh (surface)']], value: kind, change: function (v) { kind = v; F.redraw(); } });
      check(F.ctl, 'Liquid layer on the right', liquid, function (v) { liquid = v; F.redraw(); });
      var row = F.row(); F.player(row, function (dt) { t += dt; F.redraw(); }, { label: 'Shake', auto: true });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, nx = 34, nz = 12, x0 = 20, z0 = 40, dxp = (w - 40) / nx, dzp = (h - 70) / nz, tt = V.reduced && t === 0 ? 0.4 : t;
        if (liquid) { ctx.fillStyle = rgba(k.blue, 0.2); ctx.fillRect(x0 + dxp * nx * 0.6, z0 - 6, dxp * nx * 0.4, dzp * nz + 12); if (!F.quiet) txt(ctx, 'liquid', x0 + dxp * nx * 0.8, z0 - 14, { size: 11, color: k.blue, align: 'center', bold: true }); }
        var spd = { P: 6, S: 3.5, Love: 3.2, Rayleigh: 2.9 }[kind], lam = 8, front = (tt * 6) % (nx + 10);
        for (var j = 0; j <= nz; j++) for (var i = 0; i <= nx; i++) {
          var ph = (i - front) / lam * TAU, env = i <= front ? 1 : 0, dx = 0, dz = 0, depthF = M.exp(-j / 4), A = 0.35;
          var inLiquid = liquid && i > nx * 0.6;
          if (kind === 'P') dx = A * M.sin(ph) * env;
          else if (kind === 'S') dz = inLiquid ? 0 : A * M.sin(ph) * env;
          else if (kind === 'Rayleigh') { dx = A * M.sin(ph) * env * depthF; dz = A * M.cos(ph) * env * depthF * 1.4; }
          else { dz = 0; dx = 0; }
          if (kind === 'S' && liquid && i > nx * 0.6) env = 0;
          var x = x0 + (i + dx) * dxp, y = z0 + (j + dz) * dzp, lv = kind === 'Love' ? A * M.sin(ph) * env * depthF : 0;
          circle(ctx, x, y, kind === 'Love' ? 2.4 + lv * 3 : 2.6, kind === 'Love' ? mix(k.blue, k.red, 0.5 + lv) : (env && (dx || dz) ? k.rust : k.muted));
        }
        if (kind === 'Love') txt(ctx, 'Love waves shake the ground side to side, in and out of the picture (color shows the sideways motion)', w / 2, h - 10, { size: 10.5, color: k.muted, align: 'center' });
        arrow(ctx, 20, 18, 120, 18, { color: k.ink, w: 2 }); txt(ctx, 'direction of travel' + (w < 520 && !F.quiet ? ', about ' + spd + ' km/s' : ''), 128, 18, { size: 11, color: k.ink });
        if (!F.quiet && w >= 520) txt(ctx, 'about ' + spd + ' km/s in crustal rock', w - 10, 18, { size: 11, color: k.ink, align: 'right' });
        F.alt({ P: 'P waves: particles push and pull along the direction the wave travels.', S: 'S waves: particles move side to side, across the direction of travel' + (liquid ? '; they cannot pass through the liquid.' : '.'), Love: 'Love waves: surface waves that shake the ground side to side.', Rayleigh: 'Rayleigh waves: surface waves that roll the ground in ellipses, strongest at the surface.' }[kind]);
        F.say({ P: '<b>P waves</b> (primary) push and pull the rock along their path, like a slinky; they are the fastest and travel through solids, liquids and gases.', S: '<b>S waves</b> (secondary) shake the rock side to side; they are slower and cannot travel through liquids, which do not spring back when sheared.', Love: '<b>Love waves</b> travel along the surface and shake the ground sideways.', Rayleigh: '<b>Rayleigh waves</b> roll along the surface like ocean swells; surface waves are slowest but often do the most damage.' }[kind], 'Different waves move the ground in different ways.');
      };
    }

    function grams(F) {
      F.size({ aspect: 1.45, max: 520, narrow: 0.75 });
      var st = (o.stations || [{ name: 'Station 1', distance: 120 }, { name: 'Station 2', distance: 300 }, { name: 'Station 3', distance: 520 }]).map(function (s) { return { name: s.name, d: num(s.distance, 200) }; });
      var gap = 20, geo = null;
      var T = F.tiles([{ k: 'gap', label: 'S−P gap on the chart', secret: false }, { k: 'dist', label: 'That gap means a distance of', secret: true }]);
      var gs = V.slider(F.ctl, { label: 'Slide a gap along the travel-time curves', min: 2, max: 90, step: 0.5, value: gap, fmt: function (v) { return fm(v, 1) + ' s'; }, input: function (v) { gap = v; F.redraw(); } });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, gw = wide ? w * 0.56 : w, gh = wide ? h : h * 0.55, tmax = 240;
        // seismograms
        var band = (gh - 50) / st.length, x0 = 64, x1 = gw - 10; function X(t) { return x0 + t / tmax * (x1 - x0); }
        st.forEach(function (s, i) {
          var y0 = 20 + (i + 0.5) * band, tp = s.d / vp, ts = s.d / vs, tl = s.d / 3.0, r = rng(i + 3), amp = band / 2 - 6, sc0 = 1 / M.sqrt(s.d / 120);
          txt(ctx, s.name, 8, y0 - 10, { size: 11, color: k.ink, bold: true }); if (!F.quiet) txt(ctx, nf(s.d) + ' km', 8, y0 + 6, { size: 10.5, color: k.muted });
          ctx.save(); ctx.beginPath(); ctx.rect(x0, y0 - band / 2, x1 - x0, band); ctx.clip(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1; ctx.beginPath();
          for (var t = 0; t <= tmax; t += 0.25) { var a = (r() - 0.5) * 0.04; if (t > tp) a += 0.22 * M.exp(-(t - tp) / 18) * M.sin(t * 6 + i); if (t > ts) a += 0.5 * M.exp(-(t - ts) / 22) * M.sin(t * 3.4 + i); if (t > tl) a += 0.8 * M.exp(-(t - tl) / 30) * M.sin(t * 1.3 + i); var y = y0 - a * amp * sc0; if (t) ctx.lineTo(X(t), y); else ctx.moveTo(X(t), y); }
          ctx.stroke(); ctx.restore();
          [[tp, 'P', k.blue], [ts, 'S', k.red], [tl, '', k.green]].forEach(function (q) { line(ctx, [[X(q[0]), y0 - band / 2 + 4], [X(q[0]), y0 + band / 2 - 4]], { color: q[2], w: 1.3, dash: [3, 3] }); if (q[1]) txt(ctx, q[1], X(q[0]) + 3, y0 - band / 2 + 10, { size: 10.5, color: q[2], bold: true }); });
          if (!F.quiet) { var gy2 = y0 + band / 2 - 8; line(ctx, [[X(tp), gy2], [X(ts), gy2]], { color: k.rust, w: 2 }); txt(ctx, fm(ts - tp, 1) + ' s', (X(tp) + X(ts)) / 2, gy2 - 8, { size: 10, color: k.rust, align: 'center', bold: true, halo: k.halo }); }
        });
        for (var tt2 = 0; tt2 <= tmax; tt2 += 50) { line(ctx, [[X(tt2), gh - 28], [X(tt2), gh - 23]], { color: k.axis, w: 1 }); txt(ctx, tt2 + ' s', X(tt2), gh - 15, { size: 10, color: k.muted, align: 'center' }); }
        F.legend([{ c: k.blue, t: 'P arrives', dash: true }, { c: k.red, t: 'S arrives', dash: true }, { c: k.green, t: 'surface waves arrive', dash: true }]);
        // travel-time curves
        var r2 = wide ? { x: gw + 46, y: 20, w: w - gw - 58, h: h - 60 } : { x: 46, y: gh + 18, w: w - 58, h: h - gh - 56 }, dmax = 800;
        var c = chart(ctx, k, r2, { x: { min: 0, max: dmax, step: 200, label: 'Distance (km)' }, y: { min: 0, max: dmax / vs * 1.05, step: 50, label: 'Travel time (s)' } });
        line(ctx, [[c.X(0), c.Y(0)], [c.X(dmax), c.Y(dmax / vp)]], { color: k.blue, w: 2.4 }); line(ctx, [[c.X(0), c.Y(0)], [c.X(dmax), c.Y(dmax / vs)]], { color: k.red, w: 2.4 });
        var dg = EM.spDistance(gap, vp, vs); if (dg <= dmax) { line(ctx, [[c.X(dg), c.Y(dg / vp)], [c.X(dg), c.Y(dg / vs)]], { color: k.rust, w: 4 }); txt(ctx, fm(gap, 1) + ' s', c.X(dg) + 6, c.Y((dg / vp + dg / vs) / 2), { size: 11, color: k.rust, bold: true }); if (!F.quiet) txt(ctx, nf(dg) + ' km', c.X(dg), c.Y(0) - 8, { size: 10.5, color: k.rust, align: 'center' }); }
        txt(ctx, 'P', c.X(dmax) - 8, c.Y(dmax / vp) - 10, { size: 11, color: k.blue, bold: true }); txt(ctx, 'S', c.X(dmax * 0.8) - 10, c.Y(dmax * 0.8 / vs) - 8, { size: 11, color: k.red, bold: true });
        T.gap(fm(gap, 1) + ' s'); T.dist(nf(dg) + ' km');
        F.alt('Seismograms from ' + st.length + ' stations with P, S and surface-wave arrivals, and a travel-time chart with lines for P and S waves.');
        F.say('One arrival can’t give the distance, because no one knows exactly when the quake began. The <b>gap</b> between the P and S arrivals grows with distance: with P at ' + vp + ' km/s and S at ' + vs + ' km/s, each second of gap means about ' + fm(vp * vs / (vp - vs), 1) + ' km, so distance = gap × ' + fm(vp * vs / (vp - vs), 1) + ' km/s.', 'The S−P gap gives the distance.');
      };
    }

    function locate(F) {
      F.size({ aspect: 1.3, max: 500, narrow: 0.95 });
      var st = (o.stations || [{ x: -160, y: 90, lag: 22.8 }, { x: 170, y: 120, lag: 31.9 }, { x: 60, y: -170, lag: 23.6 }]).map(function (s, i) { return { x: num(s.x, 0), y: num(s.y, 0), lag: num(s.lag, 20), name: s.name || ('Station ' + (i + 1)) }; });
      var circles = o.circles !== false, LT = F.letters, shown = circles ? st.length : 0;
      var T = F.tiles(st.map(function (s, i) { return { k: 's' + i, label: s.name, secret: true }; }));
      if (!F.lock) { var bt = mk('div', 'esv-btns'); F.ctl.appendChild(bt); V.button(bt, 'Draw the next circle', function () { shown = M.min(st.length, shown + 1); F.redraw(); }, 'pri'); V.button(bt, 'Clear', function () { shown = 0; F.redraw(); }); }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, sc = M.min(w, h) / 560, cx = w / 2, cy = h / 2;
        ctx.fillStyle = k.landSoft; ctx.fillRect(0, 0, w, h);
        for (var g = -300; g <= 300; g += 100) { line(ctx, [[cx + g * sc, 0], [cx + g * sc, h]], { color: k.grid, w: 1 }); line(ctx, [[0, cy - g * sc], [w, cy - g * sc]], { color: k.grid, w: 1 }); }
        txt(ctx, 'grid: 100 km', 8, h - 8, { size: 10.5, color: k.muted });
        st.forEach(function (s, i) { var r = EM.spDistance(s.lag, vp, vs) * sc, x = cx + s.x * sc, y = cy - s.y * sc; if (i < shown) { ctx.save(); ctx.strokeStyle = [k.blue, k.red, k.green][i % 3]; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore(); } poly(ctx, [[x, y - 8], [x - 7, y + 4], [x + 7, y + 4]], [k.blue, k.red, k.green][i % 3]); txt(ctx, s.name, x, y + 16, { size: 10.5, color: k.ink, align: 'center', bold: true, halo: k.halo }); T['s' + i]('gap ' + fm(s.lag, 1) + ' s → ' + nf(EM.spDistance(s.lag, vp, vs)) + ' km'); });
        // candidate points: where the first two circles cross (two points) and the true epicenter
        var a = st[0], b = st[1], ra = EM.spDistance(a.lag, vp, vs), rb = EM.spDistance(b.lag, vp, vs), dx = b.x - a.x, dy = b.y - a.y, d = M.hypot(dx, dy);
        if (shown >= 2 && d < ra + rb && d > M.abs(ra - rb)) { var aa = (ra * ra - rb * rb + d * d) / (2 * d), hh = M.sqrt(M.max(0, ra * ra - aa * aa)), px = a.x + aa * dx / d, py = a.y + aa * dy / d, p1 = [px + hh * dy / d, py - hh * dx / d], p2 = [px - hh * dy / d, py + hh * dx / d];
          [p1, p2].forEach(function (p, i) { var x = cx + p[0] * sc, y = cy - p[1] * sc, c = st[2], dc = M.hypot(p[0] - c.x, p[1] - c.y), on = shown >= 3 && M.abs(dc - EM.spDistance(c.lag, vp, vs)) < 15; circle(ctx, x, y, on ? 8 : 5, on ? '#ffd43b' : k.ink, on ? '#7a5a00' : null, 2); if (LT) badge(ctx, LETTERS[i], x + 14, y - 12, { k: k }); else if (!F.quiet && on) txt(ctx, 'epicenter', x + 12, y - 12, { size: 12, color: k.ink, bold: true, halo: k.halo }); });
        }
        F.alt('A map with three seismic stations and circles of the right distance from each; the circles meet at the epicenter.');
        F.say(shown < 2 ? 'Each station knows only how far away the quake was, not which way: the epicenter is somewhere on a circle around it.' : shown < 3 ? 'Two circles usually cross at <b>two</b> points, so two stations are not enough.' : 'The third circle picks the right crossing: the epicenter, where all three meet.', 'Three circles meet at the epicenter.');
      };
    }

    function magnitude(F) {
      F.size({ aspect: 1.6, max: 460, narrow: 0.8 });
      var P = { m1: clamp(num(o.M1, 5), 1, 9.5), m2: clamp(num(o.M2, 7), 1, 9.5), logA: false, area: num(o.area, 1000), slip: num(o.slip, 2) };
      var T = F.tiles([{ k: 'amp', label: 'Wave heights', secret: true }, { k: 'en', label: 'Energy released', secret: true }, { k: 'mw', label: 'Moment magnitude from the fault', secret: true }]);
      V.slider(F.ctl, { label: 'Quake 1', min: 1, max: 9.5, step: 0.1, value: P.m1, fmt: function (v) { return 'M ' + fm(v, 1); }, input: function (v) { P.m1 = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Quake 2', min: 1, max: 9.5, step: 0.1, value: P.m2, fmt: function (v) { return 'M ' + fm(v, 1); }, input: function (v) { P.m2 = v; F.redraw(); } });
      check(F.ctl, 'Log scale for the waves', P.logA, function (v) { P.logA = v; F.redraw(); });
      var row = F.row(); V.slider(row, { label: 'Fault area', min: 1, max: 100000, step: 1, value: P.area, fmt: function (v) { return nf(v) + ' km²'; }, input: function (v) { P.area = v; F.redraw(); } }); V.slider(row, { label: 'Average slip', min: 0.01, max: 20, step: 0.01, value: P.slip, fmt: function (v) { return fm(v, 2) + ' m'; }, input: function (v) { P.slip = v; F.redraw(); } });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, dM = P.m2 - P.m1, ar = EM.ampRatio(dM), er = EM.energyRatio(dM), half = h * 0.5;
        // two seismograms: heights in the ratio 10^ΔM
        var big = M.max(P.m1, P.m2), A1 = M.pow(10, P.m1 - big), A2 = M.pow(10, P.m2 - big);
        function hgt(a) { return P.logA ? M.max(0.02, (M.log10(a) + 5) / 5) : a; }
        [[P.m1, A1, 0], [P.m2, A2, 1]].forEach(function (q) { var y0 = 24 + q[2] * (half - 20) / 2 + (half - 20) / 4, amp = hgt(q[1]) * ((half - 20) / 4 - 6); ctx.save(); ctx.strokeStyle = q[2] ? k.red : k.blue; ctx.lineWidth = 1.6; ctx.beginPath(); for (var x = 70; x < w - 10; x += 2) { var t = (x - 70) / (w - 80), env = M.exp(-M.pow((t - 0.35) / 0.18, 2)); var y = y0 - amp * env * M.sin(x * 0.35); if (x === 70) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); txt(ctx, 'M ' + fm(q[0], 1), 10, y0, { size: 12, color: q[2] ? k.red : k.blue, bold: true }); });
        txt(ctx, P.logA ? 'wave heights on a log scale' : 'wave heights to scale', w - 10, 12, { size: 10.5, color: k.muted, align: 'right' });
        // energy: blocks
        var by = half + 14, bh = h - by - 10, n = M.round(er);
        txt(ctx, 'Energy: one block for quake 1', 10, by + 4, { size: 11, color: k.ink, bold: true });
        var bh2 = bh - 20; if (er >= 1 && er <= 4000) { var cols = M.ceil(M.sqrt(n * (w - 20) / bh2)), size = M.min((w - 20) / cols, bh2 / M.ceil(n / cols)) - 1; for (var i = 0; i < n; i++) { var cxb = 10 + (i % cols) * (size + 1), cyb = by + 14 + M.floor(i / cols) * (size + 1); ctx.fillStyle = i === 0 ? k.blue : rgba(k.red, 0.75); ctx.fillRect(cxb, cyb, M.max(1, size), M.max(1, size)); } }
        else txt(ctx, er > 4000 ? 'too many blocks to draw: ' + sci(er, 2) : 'quake 2 releases less energy than quake 1', 10, by + 30, { size: 12, color: k.ink });
        var M0 = EM.moment(P.area, P.slip), mw = EM.mw(M0);
        T.amp('×' + sig(ar, 3)); T.en('×' + sig(er, 3) + ' (10 to the power ' + fm(1.5 * dM, 2) + ')'); T.mw('M0 = ' + sci(M0, 2) + ' N·m → Mw ' + fm(mw, 1));
        F.alt('Two earthquakes of magnitude ' + fm(P.m1, 1) + ' and ' + fm(P.m2, 1) + ': their waves and their energy shown as blocks.');
        F.say('Each step of 1 in magnitude means waves about <b>10 times</b> taller and about <b>32 times</b> more energy (10<sup>1.5</sup>). M ' + fm(P.m2, 1) + ' vs M ' + fm(P.m1, 1) + ': waves ×' + sig(ar, 3) + ', energy ×' + sig(er, 3) + '. Moment magnitude comes from the fault: M0 = rigidity × area × slip (rigidity 3 × 10¹⁰ Pa), Mw = ⅔(log₁₀M0 − 9.1). The scale has no top, but no known fault is long enough to make a magnitude 10.', 'Each magnitude step: 10× taller waves, about 32× the energy.');
      };
    }

    function intensity(F) {
      F.size({ aspect: 1.4, max: 500, narrow: 0.95 });
      var P = { mag: num(o.M1, 6.5), basin: o.basin !== false }, LT = F.letters;
      var T = F.tiles([{ k: 'town', label: 'Shaking at the towns', secret: true }]);
      V.slider(F.ctl, { label: 'Magnitude', min: 4, max: 8, step: 0.1, value: P.mag, fmt: function (v) { return 'M ' + fm(v, 1); }, input: function (v) { P.mag = v; F.redraw(); } });
      check(F.ctl, 'Soft-sediment basin', P.basin, function (v) { P.basin = v; F.redraw(); });
      var towns = [[40, 20], [-90, 60], [140, -70], [-60, -120], [210, 90]];
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, sc = M.min(w, h) / 560, cx = w * 0.45, cy = h / 2, basin = [-130, -60, 70];
        function inBasin(x, y) { return P.basin && M.hypot(x - basin[0], y - basin[1]) < basin[2]; }
        var step = 6; for (var py = 0; py < h; py += step) for (var px = 0; px < w; px += step) { var x = (px + step / 2 - cx) / sc, y = (cy - py - step / 2) / sc, I = EM.mmi(P.mag, M.hypot(x, y), inBasin(x, y)), lvl = M.max(1, M.floor(I)); ctx.fillStyle = MMI_COL[lvl - 1]; ctx.fillRect(px, py, step, step); }
        if (P.basin) { ctx.save(); ctx.strokeStyle = k.dark ? '#fff' : '#333'; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(cx + basin[0] * sc, cy - basin[1] * sc, basin[2] * sc, 0, TAU); ctx.stroke(); ctx.restore(); if (!F.quiet) txt(ctx, 'soft, wet sediment', cx + basin[0] * sc, cy - basin[1] * sc - basin[2] * sc - 8, { size: 11, color: '#111', align: 'center', halo: 'rgba(255,255,255,0.7)' }); }
        ctx.save(); ctx.fillStyle = '#111'; ctx.beginPath(); for (var i = 0; i < 10; i++) { var rr = i % 2 ? 4 : 10, an = -PI / 2 + i * PI / 5; ctx.lineTo(cx + rr * M.cos(an), cy + rr * M.sin(an)); } ctx.closePath(); ctx.fill(); ctx.restore();
        var out = [];
        towns.forEach(function (t, i) { var x = cx + t[0] * sc, y = cy - t[1] * sc, I = EM.mmi(P.mag, M.hypot(t[0], t[1]), inBasin(t[0], t[1])); rrect(ctx, x - 5, y - 5, 10, 10, 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#111'; ctx.stroke(); if (LT) badge(ctx, LETTERS[i], x + 14, y - 12, { k: k, r: 10 }); else if (!F.quiet) txt(ctx, EM.ROMAN[M.floor(I)], x + 9, y - 9, { size: 13, color: '#111', bold: true, halo: 'rgba(255,255,255,0.8)' }); out.push(LETTERS[i] + ': ' + EM.ROMAN[M.floor(I)]); });
        // legend
        var lx = w - 108, ly = 12; for (var l = 0; l < 10; l++) { ctx.fillStyle = MMI_COL[l]; ctx.fillRect(lx, ly + l * 15, 16, 14); txt(ctx, EM.ROMAN[l + 1] + ' ' + MMI_WORD[l], lx + 22, ly + l * 15 + 7, { size: 10, color: k.ink }); }
        T.town(out.join(' · '));
        F.alt('A shaking map around an epicenter, with zones of Modified Mercalli intensity that weaken with distance and are stronger over soft sediment.');
        F.say('An earthquake has one <b>magnitude</b> but many <b>intensities</b>: shaking is strongest near the epicenter and weakens with distance, and soft, wet sediment shakes harder than solid rock. (A simple model for illustration; real maps come from recordings and reports.)', 'One magnitude, many intensities.');
      };
    }
  });

  /* es-volcano: Volcanoes.
     opts:
       type: 'shield' | 'cinder' | 'composite' | 'dome' | 'caldera' (default 'composite'); modes: true for tabs (volcano, VEI, hazards, monitoring)
       mode: 'volcano' | 'vei' | 'hazards' | 'monitor'
       silica: % (default by type); gas: 0–1; vei: 0–8; wind: direction the wind blows toward ('east', 'west', …) for ash
       monitor: {tilt: [...], so2: [...], quakes: [...]} series over 12 months (default: a volcano waking up)
       letters: true (lettered towns or features); quiet: hides the type name, VEI, eruption style and hazard names; lock */
  var VTYPES = { shield: { n: 'Shield volcano', w: 120, hgt: 9, slope: 'gentle (about 3–10°)', si: 49, ex: 'Mauna Loa, Hawaiʻi' }, cinder: { n: 'Cinder cone', w: 1.2, hgt: 0.25, slope: 'steep (about 30°)', si: 52, ex: 'Parícutin, Mexico' }, composite: { n: 'Composite volcano (stratovolcano)', w: 20, hgt: 2.6, slope: 'steep near the top', si: 60, ex: 'Mount St. Helens, Washington' }, dome: { n: 'Lava dome', w: 1, hgt: 0.3, slope: 'bulging, very steep', si: 70, ex: 'domes inside Mount St. Helens’ crater' }, caldera: { n: 'Caldera', w: 60, hgt: 1, slope: 'a collapsed bowl', si: 72, ex: 'Crater Lake, Oregon' } };
  R('es-volcano', function (el, o) {
    var F = frame(el, o, 'Volcanoes', { aspect: 1.7, max: 440 });
    return F.modes({ volcano: volcano, vei: vei, hazards: hazards, monitor: monitor }, { volcano: 'Volcano types', vei: 'Explosivity', hazards: 'Hazard map', monitor: 'Monitoring' }, 'volcano');

    function volcano(F) {
      F.size({ aspect: 1.8, max: 420, narrow: 0.95 });
      var ty = VTYPES[o.type] ? o.type : 'composite', si = num(o.silica, VTYPES[ty].si), gas = clamp(num(o.gas, 0.5), 0, 1), t = 0;
      var T = F.tiles([{ k: 'ty', label: 'Type', secret: true }, { k: 'st', label: 'Eruption style', secret: true }, { k: 'sz', label: 'Size', secret: true }]);
      if (!F.lock && !o.type) V.seg(F.ctl, { label: 'Type', items: Object.keys(VTYPES).map(function (q) { return [q, VTYPES[q].n.split(' (')[0]]; }), value: ty, change: function (v) { ty = v; si = VTYPES[v].si; ss.set(si); F.redraw(); } });
      var ss = V.slider(F.ctl, { label: 'Silica in the magma', min: 45, max: 75, step: 1, value: si, fmt: function (v) { return v + '%'; }, input: function (v) { si = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Gas in the magma', min: 0, max: 1, step: 0.05, value: gas, fmt: function (v) { return v < 0.3 ? 'little' : v < 0.7 ? 'some' : 'lots'; }, input: function (v) { gas = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { t += dt; F.redraw(); }, { label: 'Erupt', auto: false });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, V0 = VTYPES[ty], base = h * 0.72, explos = clamp((si - 50) / 22 * 0.7 + gas * 0.5, 0, 1.2), erupt = t > 0;
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, base); ctx.fillStyle = k.crust; ctx.fillRect(0, base, w, h - base);
        // shape (not to scale across types: each is drawn with its own horizontal and vertical scale, given below)
        var hw = w * 0.38, hh = { shield: h * 0.18, cinder: h * 0.32, composite: h * 0.46, dome: h * 0.22, caldera: h * 0.22 }[ty], cx = w / 2, pts = [];
        for (var x = -1; x <= 1.0001; x += 0.02) { var a = M.abs(x), y; if (ty === 'shield') y = 1 - a * a * 0.9 - a * 0.1; else if (ty === 'cinder') y = a < 0.12 ? 0.85 + (0.12 - a) * 0.5 : M.max(0, 1 - (a - 0.12) / 0.88 * 1.0) * 0.85 + 0.0; else if (ty === 'composite') y = M.pow(1 - a, 1.6); else if (ty === 'dome') y = M.sqrt(M.max(0, 1 - a * a * 1.6)); else y = a < 0.45 ? 0.35 : a < 0.6 ? 0.35 + (a - 0.45) / 0.15 * 0.65 : M.max(0, 1 - (a - 0.6) / 0.4); pts.push([cx + x * hw, base - y * hh]); }
        poly(ctx, [[cx - hw, base]].concat(pts, [[cx + hw, base]]), '#7d6b5d', '#4a3f36', 1.2);
        if (ty === 'composite') for (var l = 1; l < 6; l++) { var lp = pts.map(function (p) { return [p[0], p[1] + l * hh * 0.11]; }).filter(function (p) { return p[1] < base; }); line(ctx, lp, { color: l % 2 ? '#5c4f44' : '#a39280', w: 2 }); }
        if (ty === 'caldera') { ctx.fillStyle = rgba(k.blue, 0.6); ctx.fillRect(cx - hw * 0.44, base - hh * 0.35 - 4, hw * 0.88, 8); }
        // magma chamber and conduit
        var chY = base + (h - base) * 0.6; ctx.fillStyle = '#e8590c'; ctx.beginPath(); ctx.ellipse(cx, chY, w * 0.12, (h - base) * 0.22, 0, 0, TAU); ctx.fill(); ctx.fillRect(cx - 3, base - hh * 0.95, 6, chY - base + hh * 0.95);
        if (!F.quiet) txt(ctx, 'magma chamber', cx + w * 0.13, chY, { size: 11, color: '#fff' });
        // eruption
        if (erupt) {
          var top = base - hh * (ty === 'caldera' ? 0.35 : ty === 'dome' ? 1 : 0.98);
          if (explos > 0.6) { var colH = M.min(top - 6, top * explos), r = rng(M.floor(t * 8)); for (var i = 0; i < 40; i++) { var yy = top - r() * colH, spread = 8 + (top - yy) * 0.35; circle(ctx, cx + (r() - 0.5) * spread * 2, yy, 6 + r() * 12, rgba('#8a8580', 0.55)); } if (!F.quiet) txt(ctx, 'explosive: a column of ash and gas', cx + 30, 20, { size: 12, color: k.ink, bold: true }); }
          else { var fl = (t * 0.2) % 1; ctx.strokeStyle = '#ff6b2c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx, top); ctx.quadraticCurveTo(cx + hw * 0.3, top + hh * 0.2, cx + hw * fl * 0.9, base - 4); ctx.stroke(); for (var f2 = 0; f2 < 8; f2++) circle(ctx, cx + (f2 - 4) * 3, top - 10 - (f2 % 3) * 8 * (0.5 + gas), 3, '#ffd43b'); if (!F.quiet) txt(ctx, 'effusive: lava flows out', cx + 30, 20, { size: 12, color: k.ink, bold: true }); }
        }
        // inset: three volcanoes at one scale (heights stretched 2×)
        var iw = M.min(260, w * 0.36), ih = 46, ix = w - iw - 10, iy = 10, isc = (iw - 10) / 125;
        ctx.save(); ctx.fillStyle = k.dark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.75)'; rrect(ctx, ix, iy, iw, ih + 24, 8); ctx.fill(); ctx.restore();
        [['shield', 5, 60], ['composite', 5 + 122, 10], ['cinder', 5 + 122 - 8, 0.6]].forEach(function (q, qi) { var V1 = VTYPES[q[0]], bx2 = ix + 5 + (qi === 0 ? 60 : qi === 1 ? 108 : 122) * isc, hw2 = V1.w / 2 * isc, hh2 = V1.hgt * isc * 2; poly(ctx, [[bx2 - hw2, iy + ih], [bx2, iy + ih - hh2], [bx2 + hw2, iy + ih]], q[0] === ty ? k.rust : '#7d6b5d'); });
        line(ctx, [[ix + 4, iy + ih], [ix + iw - 4, iy + ih]], { color: k.axis, w: 1 });
        txt(ctx, 'Same scale: shield, composite, cinder cone (tiny)', ix + iw / 2, iy + ih + 12, { size: 9.5, color: k.muted, align: 'center' });
        if (!F.quiet) txt(ctx, V0.n, 12, 18, { size: 13, color: k.ink, bold: true });
        txt(ctx, 'about ' + nf(V0.w, V0.w < 2 ? 1 : 0) + ' km wide, ' + fm(V0.hgt, V0.hgt < 1 ? 2 : 1) + ' km tall' + (ty === 'shield' ? ' (from the sea floor)' : ''), 12, h - 10, { size: 10.5, color: '#fff' });
        var style = explos > 0.85 ? 'very explosive' : explos > 0.6 ? 'explosive' : explos > 0.35 ? 'mixed: fountains and some explosions' : 'gentle lava flows';
        T.ty(V0.n + ', like ' + V0.ex); T.st(style); T.sz('about ' + nf(V0.w, V0.w < 2 ? 1 : 0) + ' km wide; slopes ' + V0.slope);
        F.alt('A cross-section of a ' + (F.quiet ? 'volcano' : V0.n.toLowerCase()) + ' with its magma chamber' + (erupt ? ', erupting: ' + style : '') + '.');
        F.say('Runny, low-silica magma lets gas escape, so it pours out as lava flows and builds broad shield volcanoes. Sticky, silica-rich magma traps gas until it bursts, building steep composite volcanoes and domes, and sometimes emptying the chamber so the top collapses into a caldera. Each type is drawn at its own scale: a shield is far larger than a cinder cone.', 'Silica and gas set how a volcano erupts.');
      };
    }

    function vei(F) {
      F.size({ aspect: 1.6, max: 440, narrow: 0.8 });
      var v = clamp(M.round(num(o.vei, 5)), 0, 8);
      var T = F.tiles([{ k: 'v', label: 'VEI', secret: true }, { k: 'vol', label: 'Material thrown out', secret: true }, { k: 'ex', label: 'Example', secret: true }]);
      var vs2 = V.slider(F.ctl, { label: 'Volcanic Explosivity Index', min: 0, max: 8, step: 1, value: v, fmt: function (q) { return 'VEI ' + q; }, input: function (q) { v = q; F.redraw(); } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; v = clamp(v + (a[0] || -a[1]), 0, 8); vs2.set(v); F.redraw(); return true; }, 'Arrow keys change the VEI.');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, r = { x: 70, y: 20, w: w - 90, h: h - 60 };
        var c = chart(ctx, k, r, { x: { min: -0.5, max: 8.5, ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8], label: 'VEI', fmt: function (q) { return q; } }, y: { min: 1e3, max: 1e13, log: true, label: 'Volume thrown out (m³)', lpad: 58, fmt: function (q) { return q >= 1e9 ? nf(q / 1e9) + ' km³' : '10' + sup(M.round(M.log10(q))); } } });
        EM.VEI.forEach(function (q, i) { var lo = M.max(q.lo, 1e3), hi = i < 8 ? EM.VEI[i + 1].lo : 1e13, x0 = c.X(i - 0.38), x1 = c.X(i + 0.38); ctx.fillStyle = i === v ? k.rust : rgba(k.rust, 0.25); ctx.fillRect(x0, c.Y(hi), x1 - x0, c.Y(lo) - c.Y(hi)); });
        if (!F.quiet) txt(ctx, '×10 each step from VEI 2 up', c.X(5), c.Y(2e4), { size: 11, color: k.ink, align: 'center' });
        var q = EM.VEI[v]; T.v(v); T.vol(q.txt); T.ex(q.ex);
        F.alt('A chart of the Volcanic Explosivity Index from 0 to 8 against the volume of material erupted, on a log scale; VEI ' + (F.quiet ? '' : v) + ' is highlighted.');
        F.say('Each step of the Volcanic Explosivity Index (from VEI 2 up) means about <b>10 times</b> more material thrown out. VEI ' + v + ': ' + q.txt + ', like ' + q.ex + '.', 'Each VEI step: about 10 times more material.');
      };
    }

    function hazards(F) {
      F.size({ aspect: 1.25, max: 520, narrow: 1.0 });
      var windDir = { east: 0, north: 90, west: 180, south: 270, northeast: 45, southeast: 315, northwest: 135, southwest: 225 }[o.wind || 'east'], LT = F.letters, show = { lava: true, pf: true, lahar: true, ash: true, gas: true };
      var row = F.row(); [['lava', 'Lava flows'], ['pf', 'Pyroclastic flows'], ['lahar', 'Lahars'], ['ash', 'Ash fall'], ['gas', 'Gas']].forEach(function (q) { check(row, q[1], true, function (v) { show[q[0]] = v; F.redraw(); }); });
      var towns = [[0.22, 0.3], [0.75, 0.82], [0.85, 0.35], [0.3, 0.8], [0.62, 0.15]];
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, cx = w * 0.45, cy = h * 0.48, R0 = M.min(w, h);
        ctx.fillStyle = k.landSoft; ctx.fillRect(0, 0, w, h);
        for (var rr = 1; rr <= 5; rr++) { ctx.strokeStyle = rgba(k.ink, 0.12); ctx.beginPath(); ctx.arc(cx, cy, rr * R0 * 0.07, 0, TAU); ctx.stroke(); }
        // valleys radiating from the summit (where lahars go)
        var valleys = [[-0.4, 1.0], [2.2, 0.9], [3.6, 1.1]];
        valleys.forEach(function (v2) { var pts = []; for (var s = 0.05; s <= v2[1]; s += 0.02) { var a = v2[0] + 0.25 * M.sin(s * 6); pts.push([cx + M.cos(a) * s * R0 * 0.55, cy + M.sin(a) * s * R0 * 0.55]); } line(ctx, pts, { color: rgba(k.blue, 0.5), w: 2 }); if (show.lahar) line(ctx, pts, { color: rgba('#8a5a2b', 0.55), w: 12 }); });
        if (show.ash) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(-windDir * RAD); ctx.fillStyle = rgba('#7d7a75', 0.35); ctx.beginPath(); ctx.ellipse(R0 * 0.35, 0, R0 * 0.42, R0 * 0.12, 0, 0, TAU); ctx.fill(); ctx.restore(); }
        if (show.pf) { ctx.fillStyle = rgba('#d6336c', 0.35); ctx.beginPath(); ctx.arc(cx, cy, R0 * 0.16, 0, TAU); ctx.fill(); }
        if (show.lava) { line(ctx, [[cx, cy], [cx + R0 * 0.04, cy + R0 * 0.08], [cx + R0 * 0.02, cy + R0 * 0.14]], { color: '#ff6b2c', w: 6 }); }
        if (show.gas) { ctx.fillStyle = rgba('#fab005', 0.35); ctx.beginPath(); ctx.arc(cx, cy, R0 * 0.06, 0, TAU); ctx.fill(); }
        poly(ctx, [[cx, cy - 10], [cx - 9, cy + 6], [cx + 9, cy + 6]], '#4a3f36');
        towns.forEach(function (t, i) { var x = t[0] * w, y = t[1] * h; rrect(ctx, x - 6, y - 6, 12, 12, 2); ctx.fillStyle = k.bg; ctx.fill(); ctx.strokeStyle = k.ink; ctx.stroke(); if (LT) badge(ctx, LETTERS[i], x + 16, y - 12, { k: k, r: 10 }); });
        arrow(ctx, w - 70, h - 24, w - 70 + 40 * M.cos(windDir * RAD), h - 24 - 40 * M.sin(windDir * RAD), { color: k.ink, w: 2 }); txt(ctx, 'wind', w - 70, h - 8, { size: 10.5, color: k.ink, align: 'center' });
        if (!F.quiet) F.legend([{ c: '#ff6b2c', t: 'lava flows: slow, follow valleys' }, { c: '#d6336c', t: 'pyroclastic flows: hot, fast clouds of ash and gas' }, { c: '#8a5a2b', t: 'lahars: mudflows down river valleys, can travel far' }, { c: '#7d7a75', t: 'ash fall: downwind' }, { c: '#fab005', t: 'volcanic gas near the vent' }]);
        F.alt('A hazard map around a volcano with zones for lava flows, pyroclastic flows, lahars down valleys, ash fall downwind and gas' + (LT ? ', and lettered towns.' : '.'));
        F.say('Lava flows are usually slow enough to walk away from. Pyroclastic flows (fast, hot avalanches of ash and gas) and lahars (volcanic mudflows racing down river valleys) have killed far more people. Ash falls downwind, sometimes hundreds of kilometers away.', 'Pyroclastic flows and lahars are deadlier than lava.');
      };
    }

    function monitor(F) {
      F.size({ aspect: 1.5, max: 460, narrow: 0.75 });
      var m = o.monitor || null, r = rng(7), N = 12, tilt = [], so2 = [], qk = [];
      for (var i = 0; i < N; i++) { var waking = M.max(0, (i - 5) / 6); tilt.push(m && m.tilt ? num(m.tilt[i], 0) : 2 + waking * waking * 30 + (r() - 0.5) * 2); so2.push(m && m.so2 ? num(m.so2[i], 0) : 150 + waking * 1600 + r() * 80); qk.push(m && m.quakes ? num(m.quakes[i], 0) : M.round(3 + waking * waking * 90 + r() * 4)); }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, ph = (h - 30) / 3;
        [[tilt, 'Ground tilt (μrad): swelling', k.blue], [so2, 'SO₂ gas (tonnes a day)', k.gold], [qk, 'Earthquakes a month', k.red]].forEach(function (s, j) {
          var mx = M.max.apply(null, s[0]) * 1.1, c = chart(ctx, k, { x: 52, y: 14 + j * ph, w: w - 64, h: ph - 30 }, { x: { min: 0.5, max: N + 0.5, ticks: j === 2 ? [1, 3, 5, 7, 9, 11] : [], fmt: function (q) { return 'month ' + q; }, labels: j === 2 }, y: { min: 0, max: mx, step: niceStep(mx, 2) } });
          if (j === 2) s[0].forEach(function (v, i) { ctx.fillStyle = rgba(s[2], 0.7); ctx.fillRect(c.X(i + 1) - (w - 64) / N * 0.35, c.Y(v), (w - 64) / N * 0.7, c.Y(0) - c.Y(v)); });
          else line(ctx, s[0].map(function (v, i) { return [c.X(i + 1), c.Y(v)]; }), { color: s[2], w: 2.4 });
          txt(ctx, s[1], 58, 14 + j * ph + 10, { size: 11, color: k.ink, bold: true });
        });
        F.alt('Twelve months of monitoring at a volcano: ground tilt, sulfur dioxide output and earthquake counts' + (m ? '.' : ', all rising in the last months as magma moves up.'));
        F.say('A quiet volcano is not necessarily dead; many rest for centuries. Scientists watch for the ground swelling (tilt and GPS), more gas (sulfur dioxide) and swarms of small earthquakes, signs that magma is moving up. ' + (m ? '' : 'Here all three rise in the last months: the volcano is waking up.'), 'Swelling, gas and quakes can warn that a volcano is waking.');
      };
    }
  });

  /* es-water: Water Cycle and Groundwater.
     opts:
       mode: 'cycle' | 'groundwater'      modes: true or a list for tabs
       flux: true (moving water parcels on the arrows; default true); reservoirs: true (bars of where the water is; default true)
       drivers: true (color the processes powered by sunlight and by gravity); blank: true (letters on the arrows and parts)
       pump: pumping rate of well A, 0–1 (groundwater); wells: [{x (0–1 across 1,000 m), depth (0–1 of the sand), head (m, to override the reading)}] (A pumps, B watches);
       K: hydraulic conductivity (m/day, default 20); darcy: true (the K slider; default true). Gradient and Q come from the heads at wells A and B.
       quiet: hides names, percentages, the gradient and Q; lock */
  R('es-water', function (el, o) {
    var F = frame(el, o, 'Water cycle and groundwater', { aspect: 1.6, max: 460 });
    return F.modes({ cycle: cycle, groundwater: ground }, { cycle: 'Water cycle', groundwater: 'Groundwater' });

    function cycle(F) {
      F.size({ aspect: 1.45, max: 620, narrow: 0.58 });
      var flux = o.flux !== false, res = o.reservoirs !== false, drivers = !!o.drivers, fresh = false, t = 0, B = !!o.blank;
      var row = F.row(); F.player(row, function (dt) { t += dt; F.redraw(); }, { label: 'Move the water', auto: flux });
      check(row, 'Sun or gravity?', drivers, function (v) { drivers = v; F.redraw(); });
      if (res) check(row, 'Fresh water only', fresh, function (v) { fresh = v; F.redraw(); });
      // arrows: [name, x1, y1, x2, y2 (fractions of the scene), driver 'sun' | 'gravity']
      var AR = [['evaporation', 0.16, 0.66, 0.2, 0.22, 'sun'], ['transpiration', 0.62, 0.5, 0.58, 0.24, 'sun'], ['condensation', 0.28, 0.2, 0.36, 0.14, 'cooling'], ['precipitation', 0.5, 0.2, 0.47, 0.42, 'gravity'], ['sublimation', 0.84, 0.3, 0.8, 0.14, 'sun'], ['melting', 0.86, 0.36, 0.8, 0.52, 'sun'], ['runoff', 0.72, 0.56, 0.42, 0.66, 'gravity'], ['infiltration', 0.56, 0.62, 0.56, 0.78, 'gravity'], ['groundwater flow', 0.58, 0.86, 0.26, 0.82, 'gravity']];
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 600, sw = wide ? w * 0.64 : w, sh = wide ? h : h * 0.6;
        function X(f) { return f * sw; } function Y(f) { return f * sh; }
        var sky = ctx.createLinearGradient(0, 0, 0, Y(0.6)); sky.addColorStop(0, k.sky2); sky.addColorStop(1, k.sky); ctx.fillStyle = sky; ctx.fillRect(0, 0, sw, sh);
        // land: mountain on the right with a glacier, ocean on the left
        ctx.fillStyle = k.sea; ctx.fillRect(0, Y(0.66), X(0.32), sh - Y(0.66));
        poly(ctx, [[X(0.3), Y(0.66)], [X(0.55), Y(0.58)], [X(0.72), Y(0.5)], [X(0.85), Y(0.22)], [X(1), Y(0.4)], [X(1), sh], [X(0.3), sh]], k.landDark);
        poly(ctx, [[X(0.8), Y(0.3)], [X(0.85), Y(0.22)], [X(0.92), Y(0.3)], [X(0.87), Y(0.36)]], k.ice, k.blue, 1);
        ctx.fillStyle = k.soil; ctx.fillRect(X(0.3), Y(0.72), sw - X(0.3), Y(0.09));
        ctx.fillStyle = rgba(k.blue, 0.35); ctx.fillRect(X(0.3), Y(0.8), sw - X(0.3), sh - Y(0.8));
        ctx.fillStyle = rgba(k.blue, 0.6); ctx.beginPath(); ctx.ellipse(X(0.45), Y(0.66), X(0.05), Y(0.02), 0, 0, TAU); ctx.fill();
        // plants
        [[0.6, 0.55], [0.66, 0.53]].forEach(function (p) { line(ctx, [[X(p[0]), Y(p[1])], [X(p[0]), Y(p[1]) - 18]], { color: '#6b4f2a', w: 3 }); circle(ctx, X(p[0]), Y(p[1]) - 22, 10, k.green); });
        // clouds
        [[0.3, 0.13], [0.5, 0.12], [0.78, 0.1]].forEach(function (c) { for (var i = 0; i < 4; i++) circle(ctx, X(c[0]) + i * 12 - 18, Y(c[1]) + (i % 2) * 4, 13, k.cloud, rgba(k.ink, 0.15), 1); });
        // the Sun
        sunGlow(ctx, X(0.07), Y(0.08), 10);
        // arrows
        var LB = labeler(ctx);
        AR.forEach(function (a, i) {
          var col = drivers ? (a[5] === 'sun' ? '#e8590c' : a[5] === 'gravity' ? '#1c7ed6' : '#7048e8') : k.ink;
          arrow(ctx, X(a[1]), Y(a[2]), X(a[3]), Y(a[4]), { color: col, w: 2.4, head: 10 });
          if (flux) { for (var d = 0; d < 3; d++) { var f = ((t * 0.35 + d / 3 + i * 0.13) % 1); circle(ctx, lerp(X(a[1]), X(a[3]), f), lerp(Y(a[2]), Y(a[4]), f), 3, a[0] === 'evaporation' || a[0] === 'transpiration' || a[0] === 'sublimation' ? 'rgba(160,200,255,0.75)' : '#1c7ed6'); } }
          var mx = (X(a[1]) + X(a[3])) / 2, my = (Y(a[2]) + Y(a[4])) / 2;
          if (B || F.quiet) badge(ctx, LETTERS[i], mx + 12, my, { k: k, r: 10 }); else { var rt = mx > sw * 0.72; LB.put(a[0], rt ? mx - 10 : mx + 8, my, { size: 10.5, color: col, halo: k.halo, bold: true, align: rt ? 'right' : 'left' }, [0, 12, -12, 24]); }
        });
        if (!B && !F.quiet) { LB.put('ocean', X(0.12), Y(0.8), { size: 11, color: '#fff', bold: true }); LB.put('groundwater', X(0.75), Y(0.9), { size: 11, color: k.ink, bold: true, halo: k.halo }); LB.put('glacier', X(0.87), Y(0.39) + 8, { size: 10.5, color: k.ink, halo: k.halo }); LB.put('lake', X(0.45), Y(0.7) + 6, { size: 10.5, color: k.ink, halo: k.halo }); txt(ctx, wide ? 'clouds are tiny drops of liquid water or ice, not vapor' : 'clouds: tiny drops, not vapor', X(wide ? 0.4 : 0.98), Y(0.03) + 8, { size: 10.5, color: k.ink, halo: k.halo, align: wide ? 'left' : 'right' }); }
        if (drivers) F.legend([{ c: '#e8590c', t: 'powered by sunlight', line: true }, { c: '#1c7ed6', t: 'driven by gravity', line: true }, { c: '#7048e8', t: 'cooling', line: true }]); else F.legendEl.hidden = true;
        // reservoirs
        if (res) {
          var bx = wide ? sw + 14 : 14, by = wide ? 24 : sh + 24, bw = wide ? w - sw - 26 : w - 28, rows = EM.WATER.filter(function (q) { return fresh ? q.fresh != null : true; }).slice(0, 6), rh = ((wide ? h : h - sh) - 40) / rows.length;
          txt(ctx, fresh ? 'Where Earth’s fresh water is' : 'Where Earth’s water is', bx, by - 10, { size: 11.5, color: k.ink, bold: true });
          rows.forEach(function (q, i) { var v = fresh ? q.fresh : q.all, y = by + i * rh, frac = v / 100, lw = M.min(140, bw * 0.4), bwid = bw - lw - 44; txt(ctx, q.n.replace('Ice caps, glaciers and permanent snow', 'Ice and snow').replace('Ground ice and permafrost', 'Ground ice'), bx, y + rh * 0.35, { size: 10.5, color: k.ink }); ctx.fillStyle = k.blue; ctx.fillRect(bx + lw, y + rh * 0.15, M.max(1.5, bwid * frac), rh * 0.4); if (!F.quiet) txt(ctx, (v >= 1 ? fm(v, 1) : v >= 0.01 ? fm(v, 2) : fm(v, 4)) + '%', bx + lw + M.max(1.5, bwid * frac) + 4, y + rh * 0.35, { size: 10, color: k.muted }); txt(ctx, 'stays ' + q.res.replace('hundreds to hundreds of thousands of', 'up to hundreds of thousands of'), bx, y + rh * 0.72, { size: 9.5, color: k.muted }); });
          txt(ctx, 'USGS figures', bx + bw, (wide ? h : h) - 8, { size: 9.5, color: k.muted, align: 'right' });
        }
        F.alt('The water cycle: arrows for ' + (B || F.quiet ? 'lettered processes' : AR.map(function (a) { return a[0]; }).join(', ')) + (res ? ', and bars showing where Earth’s water is.' : '.'));
        F.say('Sunlight evaporates water from the ocean and land and plants give off vapor (transpiration); the invisible vapor cools, condenses into cloud droplets and falls as precipitation; gravity pulls it downhill as runoff and into the ground. Most fresh water is ice and groundwater: lakes and rivers hold well under 1% of it.', 'Water moves in a cycle driven by sunlight and gravity.');
      };
    }

    function ground(F) {
      F.size({ aspect: 1.55, max: 500, narrow: 0.62 });
      var P = { pump: clamp(num(o.pump, 0.4), 0, 1), K: num(o.K, 20), A: 1000, dh: 5, L: 500 }, darcy = o.darcy !== false, t = 0;
      // well A pumps; the others are neighbors' wells that only watch the water table
      var wells = o.wells || [{ x: 0.36, depth: 0.95 }, { x: 0.54, depth: 0.5 }];
      var T = F.tiles([{ k: 'h', label: 'Water level (head) at the wells', secret: true }, { k: 'grad', label: 'Hydraulic gradient Δh ÷ L', secret: true }, { k: 'q', label: 'Flow Q = K·A·Δh ÷ L, through A = 1,000 m²', secret: true }, { k: 'v', label: 'How fast it creeps (30% pore space)', secret: true }]);
      V.slider(F.ctl, { label: 'Pumping well A', min: 0, max: 1, step: 0.05, value: P.pump, fmt: function (v) { return v === 0 ? 'off' : fm(v * 100, 0) + '%'; }, input: function (v) { P.pump = v; F.redraw(); } });
      if (darcy) { var row = F.row(); V.slider(row, { label: 'K (sand ≈ 20 m/day)', min: 0.01, max: 300, step: 0.01, value: P.K, fmt: function (v) { return sig(v, 2) + ' m/day'; }, input: function (v) { P.K = v; F.redraw(); } }); }
      var row2 = F.row(); F.player(row2, function (dt) { t += dt; F.redraw(); }, { label: 'Let it seep', auto: true });
      // the scene in fractions: x 0…1 left to right, y 0…1 top to bottom
      function g(x) { return 0.12 + 0.16 * x + 0.045 * M.exp(-M.pow((x - 0.9) / 0.035, 2)); }                 // ground surface, high on the left (recharge area), a stream valley at x = 0.9
      function clayTop(x) { return 0.30 + 0.20 * x - 0.25 * M.exp(-x / 0.05); }                          // the clay bends up to the surface at the far left
      function clayBot(x) { return clayTop(x) + 0.07; } function aqBot(x) { return clayBot(x) + 0.15; }
      function wt0(x) { return g(x) + 0.08 - 0.092 * M.exp(-M.pow((x - 0.9) / 0.07, 2)); }               // water table: follows the land, meets it at the stream
      function head(i) { var wl = wells[i]; return wl.head != null ? +wl.head : 100 * (1 - wt(wl.x)); } // m above the bottom of the picture; the picture is 1,000 m wide and 100 m tall
      function wt(x) { var d = M.abs(x - wells[0].x), cone = P.pump * 0.09 * M.exp(-d / 0.2); return M.min(clayTop(x) - 0.005, M.max(g(x) - 0.003, wt0(x) + cone)); }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 600, sw = wide ? w * 0.68 : w, sh = wide ? h : h * 0.66;
        function X(f) { return f * sw; } function Y(f) { return f * sh; }
        function band(top, bot, fill) { ctx.beginPath(); var i, x; for (i = 0; i <= 200; i++) { x = i / 200; ctx.lineTo(X(x), Y(M.max(g(x), top(x)))); } for (i = 200; i >= 0; i--) { x = i / 200; ctx.lineTo(X(x), Y(M.max(g(x), bot(x)))); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, sw, sh);
        band(g, function (x) { return 1; }, k.rockDark);
        band(g, clayTop, '#d8c396');                                                  // sand above the clay
        band(wt, clayTop, 'rgba(70,140,215,0.55)');                                   // saturated sand: the unconfined aquifer
        band(clayTop, clayBot, '#8d7b6a');                                            // clay
        band(clayBot, aqBot, '#c9b27e'); band(clayBot, aqBot, 'rgba(70,140,215,0.5)'); // the confined (sandstone) aquifer
        var r = rng(3); for (var q = 0; q < 220; q++) { var gx = r(), gy = r(); if (gy < g(gx) || gy > aqBot(gx) || (gy > clayTop(gx) && gy < clayBot(gx))) continue; circle(ctx, X(gx), Y(gy), 1.2, 'rgba(90,70,40,0.35)'); }
        line(ctx, Array.from({ length: 201 }, function (_, i) { return i / 200; }).filter(function (x) { return clayTop(x) > g(x) + 0.02; }).map(function (x) { return [X(x), Y(wt(x))]; }), { color: '#1864ab', w: 2, dash: [6, 4] });
        // the stream where the water table meets the land
        var lvl = g(0.9) - 0.012; poly(ctx, Array.from({ length: 41 }, function (_, i) { var x = 0.85 + i * 0.1 / 40; return [X(x), Y(M.min(lvl, g(x)))]; }).concat(Array.from({ length: 41 }, function (_, i) { var x = 0.95 - i * 0.1 / 40; return [X(x), Y(g(x))]; })), k.sea);
        // a spring where the top of the clay meets the hillside: water above the clay seeps out
        var xs = 0.02; while (xs < 0.3 && clayTop(xs) < g(xs) + 0.004) xs += 0.002; for (var sp = 0; sp < 4; sp++) circle(ctx, X(xs) + 3 + sp * 4 + ((t * 12) % 4), Y(g(xs + sp * 0.006)) + 1, 1.8, k.blue);
        txt(ctx, 'vertical scale exaggerated', sw - 6, sh - 8, { size: 9.5, color: 'rgba(255,255,255,0.8)', align: 'right' });
        // flow arrows in the unconfined aquifer, toward the stream (and toward the pumping well)
        for (var fa = 0; fa < 7; fa++) { var fx = 0.12 + ((t * 0.03 + fa / 7) % 1) * 0.7, mid = function (x) { return (wt(x) + clayTop(x)) / 2; }, dir = wt(fx + 0.01) >= wt(fx) ? 1 : -1; arrow(ctx, X(fx), Y(mid(fx)), X(fx + dir * 0.05), Y(mid(fx + dir * 0.05)), { color: '#1864ab', w: 1.6, head: 6 }); }
        for (fa = 0; fa < 4; fa++) { var cx = 0.08 + ((t * 0.02 + fa / 4) % 1) * 0.8, cm = function (x) { return (clayBot(x) + aqBot(x)) / 2; }; arrow(ctx, X(cx), Y(cm(cx)), X(cx + 0.05), Y(cm(cx + 0.05)), { color: '#1864ab', w: 1.6, head: 6 }); }
        // wells
        var pipe = k.dark ? '#dee2e6' : '#495057';
        wells.forEach(function (wl, i) { var x = X(wl.x), top = Y(g(wl.x)), botf = g(wl.x) + wl.depth * (clayTop(wl.x) - g(wl.x)), bot = Y(botf); ctx.fillStyle = pipe; ctx.fillRect(x - 2.5, top - 14, 5, bot - top + 14); if (i === 0 && P.pump > 0) { for (var s = 0; s < 3; s++) circle(ctx, x + 6 + s * 5, top - 14 + ((t * 20 + s * 4) % 12), 1.8, k.blue); } var dry = botf < wt(wl.x); if (dry && !F.quiet) txt(ctx, 'dry!', x + 6, bot, { size: 10.5, color: k.red, bold: true, halo: k.halo }); else if (!dry) { line(ctx, [[x - 7, Y(wt(wl.x))], [x + 7, Y(wt(wl.x))]], { color: '#1864ab', w: 2.5 }); } if (F.letters || !F.quiet) badge(ctx, LETTERS[i], x, top - 26, { k: k, r: 10 }); if (!F.quiet && !F.letters && i < 2 && wide) txt(ctx, nf(head(i), 1) + ' m', x + 8, top - 26, { size: 10, color: '#1864ab', bold: true, halo: k.halo }); });
        // artesian well into the confined aquifer: its recharge area on the left is higher than the wellhead, so the water rises above the ground
        var ax = X(0.76), at = Y(g(0.76)); ctx.fillStyle = pipe; ctx.fillRect(ax - 2.5, at - 10, 5, Y((clayBot(0.76) + aqBot(0.76)) / 2) - at + 10); for (var s2 = 0; s2 < 6; s2++) circle(ctx, ax + (s2 - 2.5) * 2.5, at - 14 - M.abs(M.sin(t * 3 + s2)) * 8 - 2, 2, k.blue);
        if (!F.quiet && !F.letters) {
          var LB = labeler(ctx), sz = wide ? 10.5 : 9.5;
          LB.put(wide ? 'recharge area: rain soaks in' : 'recharge area', X(0.01), Y(g(0.01)) - 12, { size: sz, color: k.ink, halo: k.halo });
          LB.put('unsaturated zone', X(0.13), Y((g(0.15) + wt(0.15)) / 2) + 2, { size: sz, color: k.ink, halo: k.halo });
          LB.put('water table', X(0.2), Y(wt(0.2)) - 8, { size: sz, color: '#1864ab', bold: true, halo: k.halo });
          LB.put('unconfined aquifer', X(0.62), Y((wt(0.66) + clayTop(0.66)) / 2) + 6, { size: sz, color: k.ink, bold: true, halo: k.halo });
          LB.put('clay: holds water, barely lets it through', X(0.3), Y((clayTop(0.36) + clayBot(0.36)) / 2), { size: sz, color: '#fff', bold: true });
          LB.put('confined aquifer', X(0.3), Y((clayBot(0.4) + aqBot(0.4)) / 2), { size: sz, color: '#fff', bold: true, halo: 'rgba(0,0,0,0.25)' });
          LB.put('artesian well', ax + 6, at - 26, { size: sz, color: k.ink, halo: k.halo, bold: true });
          LB.put('stream fed by groundwater', X(0.995), Y(g(0.9)) - 24, { size: sz, color: k.ink, halo: k.halo, align: 'right' });
          if (P.pump > 0.1) LB.put('cone of depression', X(wells[0].x) - 8, Y(wt(wells[0].x)) + 12, { size: sz, color: '#1864ab', bold: true, halo: k.halo, align: 'right' });
          LB.put('bedrock', X(0.04), Y(0.9), { size: sz, color: '#fff' });
          LB.put('spring', X(xs) + 8, Y(g(xs)) + 12, { size: sz, color: k.ink, bold: true, halo: k.halo });
        }
        // porosity versus permeability: three cups, water draining through a hole
        var cx0 = wide ? sw + 14 : 12, cy0 = wide ? 22 : sh + 18, cw = wide ? w - sw - 24 : w - 24, chh = wide ? h * 0.42 : (h - sh) * 0.55;
        txt(ctx, 'Porosity (space) vs permeability (flow)', cx0, cy0, { size: 11, color: k.ink, bold: true });
        ['gravel', 'sand', 'clay'].forEach(function (m, i) {
          var x = cx0 + 6 + i * cw / 3, cup = M.min(70, cw / 3 - 16), yb = cy0 + 14 + chh, S2 = EM.SOILS[m], rate = m === 'gravel' ? 0.5 : m === 'sand' ? 0.12 : 0, lvl = M.max(0, 1 - ((t * rate) % 1.4));
          ctx.fillStyle = m === 'clay' ? '#9b8a78' : m === 'sand' ? '#e3cd94' : '#a9a29a'; ctx.fillRect(x, yb - chh * 0.8, cup, chh * 0.8);
          var rr2 = rng(i + 5); for (var gq = 0; gq < (m === 'gravel' ? 14 : m === 'sand' ? 60 : 0); gq++) circle(ctx, x + 4 + rr2() * (cup - 8), yb - 4 - rr2() * (chh * 0.8 - 8), m === 'gravel' ? 5 : 1.6, m === 'gravel' ? '#8a8379' : '#c9ae6c');
          ctx.fillStyle = 'rgba(70,140,215,0.45)'; ctx.fillRect(x, yb - chh * 0.8 * lvl, cup, chh * 0.8 * lvl);
          line(ctx, [[x, yb - chh * 0.9], [x, yb], [x + cup, yb], [x + cup, yb - chh * 0.9]], { color: k.axis, w: 1.5 });
          if (rate && lvl > 0) for (var dd = 0; dd < 3; dd++) circle(ctx, x + cup / 2, yb + 4 + ((t * 40 * rate + dd * 5) % 14), 1.8, k.blue);
          txt(ctx, m, x + cup / 2, yb + 26, { size: 10.5, color: k.ink, align: 'center', bold: true });
          if (!F.quiet) txt(ctx, 'pores ' + S2.por + '%', x + cup / 2, yb + 40, { size: 9.5, color: k.muted, align: 'center' });
        });
        if (!F.quiet && wide) { txt(ctx, 'Clay has the most pore space but its', cx0, cy0 + chh + 72, { size: 10, color: k.muted }); txt(ctx, 'pores are too tiny for water to flow.', cx0, cy0 + chh + 86, { size: 10, color: k.muted }); }
        var hA = head(0), hB = head(1), L = M.abs(wells[1].x - wells[0].x) * 1000, dh = M.abs(hA - hB), grad = dh / L, Q = EM.darcy(P.K, P.A, dh, L), vpore = P.K * grad / 0.3, toward = hA < hB ? 'A' : 'B';
        T.h('A ' + nf(hA, 1) + ' m, B ' + nf(hB, 1) + ' m'); T.grad(nf(dh, 1) + ' m ÷ ' + nf(L) + ' m = ' + fm(grad, 4)); T.q(sig(Q, 3) + ' m³/day, toward ' + toward); T.v('about ' + sig(vpore, 2) + ' m/day');
        F.alt('A cross-section through the ground: an unsaturated zone, the water table, an unconfined aquifer, a clay layer and a confined aquifer that rises to the surface in a recharge area, with a pumping well and its cone of depression, a neighbor’s shallow well, an artesian well and a stream fed by groundwater; beside it, cups of gravel, sand and clay showing how fast water drains through each.');
        F.say('Groundwater isn’t an underground lake or river: it fills the tiny spaces between grains and creeps through them, often less than a meter a day. Water flows from the higher water level (head) to the lower: here from ' + (toward === 'A' ? 'B to A' : 'A to B') + '. Darcy’s law: Q = K·A·Δh ÷ L = ' + sig(P.K, 2) + ' × 1,000 × ' + nf(dh, 1) + ' ÷ ' + nf(L) + ' = <b>' + sig(Q, 3) + ' m³/day</b>. Pumping well A draws the water table down into a cone; pump hard enough and the neighbor’s shallow well B goes dry. The artesian well flows on its own because its aquifer is filled from higher ground.', 'Groundwater fills the spaces between grains and creeps slowly.');
      };
    }
  });

  /* es-ocean: Ocean Circulation.
     opts:
       mode: 'currents' | 'density' | 'conveyor' | 'enso'      modes: true or a list for tabs
       highlight: a current's name; winds: true (prevailing winds over the currents map); letters: true (lettered currents)
       T1, S1, T2, S2: temperatures (°C) and salinities (g/kg) of two water samples (density mode)
       state: 'neutral' | 'elnino' | 'lanina'; anomaly: Niño 3.4 anomaly (°C)
       quiet: hides current names, densities and the state label; lock */
  R('es-ocean', function (el, o) {
    var F = frame(el, o, 'Ocean circulation', { aspect: 1.9, max: 460 });
    return F.modes({ currents: currents, density: dens, conveyor: conveyor, enso: enso }, { currents: 'Surface currents', density: 'Density', conveyor: 'Deep circulation', enso: 'El Niño' });
    /* on a narrow screen the world map shows half the globe at a time and pans sideways (drag or arrow keys) */
    function panMap(F, lon0) {
      var st = { lon: lon0, nar: false, sx: 1 };
      F.drag({ hit: function () { return st.nar ? 'pan' : null; }, start: function (h, x) { st.x0 = x; st.l0 = st.lon; }, move: function (h, x) { st.lon = wrap180(st.l0 - (x - st.x0) / st.sx); F.redraw(); }, touch: 'pan-y' });
      F.keys(function (e) { var a = arrowKey(e); if (!st.nar || !a || !a[0]) return false; st.lon = wrap180(st.lon + a[0] * 15); F.redraw(); return true; });
      st.proj = function (w, h) { st.nar = w < 560; var P = st.nar ? eqProj({ x: -w / 2, y: 0, w: 2 * w, h: h }, 72, -66, st.lon) : eqProj({ x: 0, y: 0, w: w, h: h }, 72, -66, lon0); st.sx = P.sx; F.hint(st.nar ? 'Drag the map sideways (or use the left and right arrow keys) to see the rest of the world.' : ''); F.cv.tabIndex = st.nar && !F.lock ? 0 : -1; return P; };
      return st;
    }

    function currents(F) {
      F.size({ aspect: 1.85, max: 460, narrow: 0.95 }); var PM = panMap(F, 20);
      var winds = !!o.winds, LT = F.letters, hl = o.highlight || null, t = 0;
      if (!F.lock) check(F.ctl, 'Prevailing winds', winds, function (v) { winds = v; F.redraw(); });
      var row = F.row(); F.player(row, function (dt) { t += dt; F.redraw(); }, { label: 'Flow', auto: true });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, P = PM.proj(w, h);
        ctx.fillStyle = k.dark ? '#16324a' : '#d3e6f3'; ctx.fillRect(0, 0, w, h);
        drawLand(ctx, P, k.dark ? '#4f6b45' : '#e3dcc6', k.dark ? '#6e8f63' : '#b9ad8c');
        if (winds) { [[-15, 1, 'trade winds'], [15, 1, ''], [-45, -1, 'westerlies'], [45, -1, '']].forEach(function (b) { for (var lo = -170; lo < 180; lo += 40) { var x = P.X(lo), y = P.Y(b[0]); arrow(ctx, x, y, x - b[1] * 26, y + (b[0] > 0 ? 1 : -1) * (b[1] > 0 ? 6 : -6), { color: rgba(k.ink, 0.35), w: 1.4, head: 6 }); } if (b[2] && !F.quiet && !LT) txt(ctx, b[2], P.X(-150), P.Y(b[0]) - 12, { size: 10, color: k.muted, halo: k.dark ? 'rgba(22,50,74,0.8)' : 'rgba(211,230,243,0.85)' }); }); }
        CURRENTS.forEach(function (c, i) {
          var col = c.w ? (k.dark ? '#ff8787' : '#e03131') : (k.dark ? '#74c0fc' : '#1971c2'), on = hl === c.n;
          mapPath(null, P, c.p).forEach(function (seg) { line(ctx, seg, { color: col, w: on ? 4 : 2.4, alpha: on || !hl ? 1 : 0.45 }); if (seg.length > 1) { var e1 = seg[seg.length - 2], e2 = seg[seg.length - 1]; arrowHead(ctx, e2[0], e2[1], M.atan2(e2[1] - e1[1], e2[0] - e1[0]), 9, col); }
            // moving dots along the current
            for (var d = 0; d < seg.length - 1; d++) { var a = seg[d], b = seg[d + 1], f = (t * 0.4 + d * 0.37) % 1; circle(ctx, lerp(a[0], b[0], f), lerp(a[1], b[1], f), 2, col); } });
          var mid = c.p.length / 2 | 0; mid -= mid % 2; var lx = P.X(c.p[mid]), ly = P.Y(c.p[mid + 1]);
          if (LT) badge(ctx, LETTERS[i % 26], lx, ly - 10, { k: k, r: 9 }); else if (!F.quiet && (on || ['Gulf Stream', 'Kuroshio', 'California', 'Humboldt (Peru)', 'Canary', 'Benguela', 'Antarctic Circumpolar', 'East Australian', 'Brazil', 'Agulhas', 'Labrador', 'North Atlantic Drift'].indexOf(c.n) >= 0) && lx > -10 && lx < w + 10) { var lw2 = tw(ctx, c.n, { size: w < 600 ? 9 : 10, bold: true }); txt(ctx, c.n, clamp(lx, lw2 / 2 + 3, w - lw2 / 2 - 3), ly - 9, { size: w < 600 ? 9 : 10, color: col, align: 'center', bold: true, halo: k.dark ? 'rgba(22,50,74,0.8)' : 'rgba(211,230,243,0.85)' }); }
        });
        GYRES.forEach(function (g) { [P.X(g[0]), P.X(g[0]) - P.r.w, P.X(g[0]) + P.r.w].forEach(function (x) { if (x < -20 || x > w + 20) return; var y = P.Y(g[1]); ctx.save(); ctx.strokeStyle = rgba(k.ink, 0.3); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 14, 0, PI * 1.6 * (g[2] < 0 ? -1 : 1), g[2] < 0); ctx.stroke(); ctx.restore(); var ea = PI * 1.6 * (g[2] < 0 ? -1 : 1); arrowHead(ctx, x + 14 * M.cos(ea), y + 14 * M.sin(ea), ea + (g[2] < 0 ? -PI / 2 : PI / 2), 7, rgba(k.ink, 0.45)); }); });
        F.legend([{ c: k.dark ? '#ff8787' : '#e03131', t: 'warm current', line: true }, { c: k.dark ? '#74c0fc' : '#1971c2', t: 'cool current', line: true }]);
        F.alt('A world map of the major ocean surface currents, warm ones in red and cool ones in blue, circling in great gyres' + (winds ? ', with the prevailing winds' : '') + '.');
        F.say('Steady winds drag the surface water, and Earth’s spin turns it, so the currents circle in five great gyres: clockwise in the Northern Hemisphere, counterclockwise in the Southern. Warm currents carry heat away from the tropics along the western sides of the oceans; cool currents flow toward the equator along the eastern sides. Tides do not drive these currents.', 'Winds and Earth’s spin drive the surface currents.');
      };
    }

    function dens(F) {
      F.size({ aspect: 1.8, max: 420, narrow: 0.85 });
      var P = { T1: num(o.T1, 25), S1: num(o.S1, 35), T2: num(o.T2, 2), S2: num(o.S2, 34.5) };
      var T = F.tiles([{ k: 'd1', label: 'Sample A density', secret: true }, { k: 'd2', label: 'Sample B density', secret: true }, { k: 'w', label: 'Which sinks?', secret: true }]);
      [['T1', 'A: temperature', -2, 30, '°C'], ['S1', 'A: salinity', 30, 40, ' g/kg'], ['T2', 'B: temperature', -2, 30, '°C'], ['S2', 'B: salinity', 30, 40, ' g/kg']].forEach(function (q) { V.slider(F.ctl, { label: q[1], min: q[2], max: q[3], step: 0.5, value: P[q[0]], fmt: function (v) { return fm(v, 1) + q[4]; }, input: function (v) { P[q[0]] = v; F.redraw(); } }); });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, d1 = EM.seawater(P.T1, P.S1), d2 = EM.seawater(P.T2, P.S2), wide = w >= 560, tw2 = wide ? w * 0.38 : w, th = wide ? h : h * 0.45;
        // the tank: the denser sample lies under the other
        var top = 24, bot = th - 16, x0 = 16, x1 = tw2 - 16, under = d1 > d2 ? 'A' : 'B';
        function cs(T) { return mix('#1c7ed6', '#e03131', clamp((T + 2) / 32, 0, 1)); }
        var lowC = under === 'A' ? cs(P.T1) : cs(P.T2), upC = under === 'A' ? cs(P.T2) : cs(P.T1);
        ctx.fillStyle = upC.replace('rgb', 'rgba').replace(')', ',0.45)'); ctx.fillRect(x0, top, x1 - x0, (bot - top) / 2); ctx.fillStyle = lowC.replace('rgb', 'rgba').replace(')', ',0.6)'); ctx.fillRect(x0, top + (bot - top) / 2, x1 - x0, (bot - top) / 2);
        line(ctx, [[x0, top - 6], [x0, bot], [x1, bot], [x1, top - 6]], { color: k.axis, w: 2.5 });
        txt(ctx, under === 'A' ? 'B' : 'A', (x0 + x1) / 2, top + (bot - top) / 4, { size: 20, color: k.ink, bold: true, align: 'center' }); txt(ctx, under, (x0 + x1) / 2, top + (bot - top) * 0.75, { size: 20, color: k.ink, bold: true, align: 'center' });
        // T–S diagram with lines of equal density (σ = density − 1000)
        var r = wide ? { x: tw2 + 48, y: 16, w: w - tw2 - 60, h: h - 56 } : { x: 48, y: th + 12, w: w - 60, h: h - th - 52 };
        var c = chart(ctx, k, r, { x: { min: 30, max: 40, step: 2, label: 'Salinity (g/kg)' }, y: { min: -2, max: 30, step: 5, label: 'Temperature (°C)' } });
        c.clip();
        for (var sig2 = 18; sig2 <= 32; sig2 += 1) { var pts = []; for (var S = 30; S <= 40; S += 0.25) { var lo = -2, hi = 30; for (var it = 0; it < 30; it++) { var mid = (lo + hi) / 2; if (EM.seawater(mid, S) - 1000 > sig2) lo = mid; else hi = mid; } var Tq = (lo + hi) / 2; if (Tq > -2 && Tq < 30) pts.push([c.X(S), c.Y(Tq)]); } line(ctx, pts, { color: rgba(k.ink, sig2 % 2 ? 0.15 : 0.35), w: 1 }); if (sig2 % 2 === 0 && pts.length && !F.quiet) txt(ctx, String(sig2), pts[pts.length - 1][0] - 4, pts[pts.length - 1][1] - 6, { size: 9, color: k.muted, align: 'right' }); }
        c.unclip();
        circle(ctx, c.X(P.S1), c.Y(P.T1), 7, cs(P.T1), '#fff', 2); txt(ctx, 'A', c.X(P.S1) + 10, c.Y(P.T1), { size: 12, color: k.ink, bold: true });
        circle(ctx, c.X(P.S2), c.Y(P.T2), 7, cs(P.T2), '#fff', 2); txt(ctx, 'B', c.X(P.S2) + 10, c.Y(P.T2), { size: 12, color: k.ink, bold: true });
        txt(ctx, wide ? 'lines: equal density (σ = kg/m³ − 1000); denser toward the lower right' : 'lines: equal density; denser at lower right', r.x + 4, r.y + r.h - 8, { size: 9.5, color: k.muted });
        T.d1(fm(d1, 2) + ' kg/m³'); T.d2(fm(d2, 2) + ' kg/m³'); T.w(M.abs(d1 - d2) < 0.005 ? 'neither: same density' : 'sample ' + under);
        F.alt('Two seawater samples, A and B, in a tank and on a temperature–salinity diagram with lines of equal density; the denser sample lies at the bottom.');
        F.say('Colder and saltier water is denser. Sample ' + under + ' is denser (' + fm(M.max(d1, d2), 2) + ' kg/m³) and sinks beneath the other. Salt makes water heavier, not lighter. Densities from the UNESCO equation of state for seawater at the surface.', 'Cold, salty water is the densest and sinks.');
      };
    }

    function conveyor(F) {
      F.size({ aspect: 1.85, max: 460, narrow: 0.95 }); var PM = panMap(F, 50);
      var t = 0, LT = F.letters;
      var row = F.row(); F.player(row, function (dt) { t += dt; F.redraw(); }, { label: 'Flow', auto: true });
      // a schematic loop: warm surface path and cold deep path (lon, lat)
      var surf = [[-80, 25], [-60, 38], [-35, 50], [-15, 58], [-20, 62]], deep = [[-25, 60], [-40, 45], [-45, 20], [-35, -5], [-25, -30], [-10, -48], [20, -52], [60, -50], [100, -48], [140, -45], [170, -35], [-170, -20], [-160, 0], [-165, 20]], back = [[-165, 25], [170, 10], [130, 0], [110, -10], [80, -15], [55, -25], [25, -38], [10, -30], [-10, -10], [-30, 5], [-55, 12], [-80, 22]];
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, P = PM.proj(w, h);
        ctx.fillStyle = k.dark ? '#16324a' : '#d3e6f3'; ctx.fillRect(0, 0, w, h); drawLand(ctx, P, k.dark ? '#4f6b45' : '#e3dcc6', k.dark ? '#6e8f63' : '#b9ad8c');
        function path(pts, col, wd, dash) { var flat = []; pts.forEach(function (p) { flat.push(p[0], p[1]); }); mapPath(null, P, flat).forEach(function (seg) { line(ctx, seg, { color: col, w: wd, dash: dash }); for (var i = 0; i < seg.length - 1; i++) { var f = (t * 0.25 + i * 0.3) % 1; circle(ctx, lerp(seg[i][0], seg[i + 1][0], f), lerp(seg[i][1], seg[i + 1][1], f), 2.4, col); } }); }
        path(surf.concat(back.slice().reverse().slice(0, 0)), '#e03131', 4); path(back, '#e8590c', 3.5); path(deep, '#1971c2', 4, [8, 5]);
        [[-25, 62], [-40, -68]].forEach(function (s, i) { var x = P.X(s[0]), y = P.Y(M.max(-62, s[1])); circle(ctx, x, y, 9, '#1971c2', '#fff', 2); arrow(ctx, x, y - 14, x, y - 2, { color: '#fff', w: 2, head: 6 }); if (LT) badge(ctx, LETTERS[i], x + 16, y, { k: k, r: 10 }); else if (!F.quiet) txt(ctx, i ? 'sinking near Antarctica' : 'sinking in the North Atlantic', x + 12, y + (i ? -10 : 0), { size: 10.5, color: k.ink, bold: true, halo: k.halo }); });
        [[-150, 5], [60, -55], [90, -20]].forEach(function (s, i) { var x = P.X(s[0]), y = P.Y(s[1]); circle(ctx, x, y, 7, '#e8590c', '#fff', 1.5); if (LT) badge(ctx, LETTERS[i + 2], x + 14, y, { k: k, r: 10 }); else if (!F.quiet && i === 0) txt(ctx, 'upwelling', x + 10, y, { size: 10.5, color: k.ink, halo: k.halo }); });
        F.legend([{ c: '#e03131', t: 'warm surface flow', line: true }, { c: '#1971c2', t: 'cold, salty deep flow', dash: true }]);
        F.alt('A schematic map of the global overturning circulation: cold, salty water sinks in the North Atlantic and around Antarctica, creeps along the deep ocean, rises again and returns at the surface.');
        F.say('Where surface water gets very cold and salty (the North Atlantic, around Antarctica), it becomes dense enough to sink, then creeps along the deep ocean floor for centuries before rising elsewhere. A full loop takes about 1,000 years. The deep ocean is not still. (A simplified picture: the real flow has many branches.)', 'Cold, salty water sinks and creeps through the deep ocean.');
      };
    }

    function enso(F) {
      F.size({ aspect: 1.8, max: 420, narrow: 0.95 });
      var st = ['neutral', 'elnino', 'lanina'].indexOf(o.state) >= 0 ? o.state : 'neutral', an = o.anomaly != null ? num(o.anomaly, 0) : null, t = 0;
      var T = F.tiles([{ k: 's', label: 'State', secret: true }, { k: 'a', label: 'Niño 3.4 anomaly', secret: true }]);
      if (!F.lock) V.seg(F.ctl, { label: 'State', items: [['lanina', 'La Niña'], ['neutral', 'Neutral'], ['elnino', 'El Niño']], value: st, change: function (v) { st = v; an = null; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { t += dt; F.redraw(); }, { label: 'Animate', auto: true });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, a = an != null ? an : st === 'elnino' ? 1.6 : st === 'lanina' ? -1.2 : 0.1, strength = clamp(a / 2, -1, 1);
        var sea = h * 0.32, bot = h - 18, x0 = 30, x1 = w - 30;
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, sea);
        // thermocline: deep in the west, shallow in the east; flatter in El Niño, steeper in La Niña
        function tc(f) { var west = 0.62 - 0.08 * strength, east = 0.2 + 0.36 * M.max(0, strength) - 0.05 * M.min(0, strength); return sea + (bot - sea) * lerp(west, east, f); }
        var warmEdge = 0.42 + 0.35 * strength;
        // warm pool
        ctx.beginPath(); ctx.moveTo(x0, sea); for (var f = 0; f <= 1.0001; f += 0.02) ctx.lineTo(lerp(x0, x1, f), tc(f) + 1); ctx.lineTo(x1, sea); ctx.closePath(); var g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#e8590c'); g.addColorStop(clamp(warmEdge, 0.05, 0.95), '#fab005'); g.addColorStop(1, '#4dabf7'); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.moveTo(x0, bot); for (f = 0; f <= 1.0001; f += 0.02) ctx.lineTo(lerp(x0, x1, f), tc(f)); ctx.lineTo(x1, bot); ctx.closePath(); ctx.fillStyle = '#1864ab'; ctx.fill();
        line(ctx, Array.from({ length: 51 }, function (_, i) { return [lerp(x0, x1, i / 50), tc(i / 50)]; }), { color: '#fff', w: 2, dash: [6, 4] });
        // land on both sides
        poly(ctx, [[0, sea - 30], [x0, sea - 10], [x0, h], [0, h]], k.landDark); poly(ctx, [[w, sea - 40], [x1, sea - 8], [x1, h], [w, h]], k.landDark);
        txt(ctx, 'Indonesia', 4, sea - 40, { size: 11, color: k.ink, bold: true }); txt(ctx, 'Peru', w - 4, sea - 50, { size: 11, color: k.ink, bold: true, align: 'right' });
        // trade winds and Walker circulation
        var tw3 = 1 - M.max(0, strength) * 0.9 + M.max(0, -strength) * 0.4;
        if (tw3 > 0.15) for (var i = 0; i < 3; i++) { var xx = lerp(x1 - 60, x0 + 60, ((t * 0.2 * tw3 + i / 3) % 1)); arrow(ctx, xx + 30, sea - 18, xx - 10 * tw3, sea - 18, { color: k.ink, w: 1 + 2 * tw3, head: 8 }); }
        var rainX = lerp(x0 + 40, x1 - 120, clamp(0.12 + 0.5 * M.max(0, strength), 0, 1)); for (var c2 = 0; c2 < 4; c2++) circle(ctx, rainX + c2 * 14 - 20, 30 + (c2 % 2) * 5, 14, k.cloud, rgba(k.ink, 0.2)); for (var dr = 0; dr < 8; dr++) line(ctx, [[rainX - 24 + dr * 7, 48], [rainX - 28 + dr * 7, 62]], { color: k.blue, w: 1.4 });
        // the Walker circulation: air rises over the rainy area, flows east aloft, sinks in the east, returns west as the trade winds (weak or broken in El Niño)
        var wa = clamp(0.9 - 0.7 * strength, 0.15, 1), wc = rgba(k.ink, 0.25 + 0.4 * wa), wx2 = x1 - 46;
        if (wx2 - rainX > 120) { arrow(ctx, rainX + 36, sea - 40, rainX + 36, 22, { color: wc, w: 1.6, head: 7, dash: [5, 4] }); arrow(ctx, rainX + 46, 14, wx2 - 10, 14, { color: wc, w: 1.6, head: 7, dash: [5, 4] }); arrow(ctx, wx2, 22, wx2, sea - 44, { color: wc, w: 1.6, head: 7, dash: [5, 4] }); if (!F.quiet && w > 480) txt(ctx, 'Walker circulation', (rainX + wx2) / 2, 26, { size: 10, color: k.muted, align: 'center', halo: k.halo }); }
        if (!F.quiet) { txt(ctx, 'trade winds', x1 - 160, sea - 32, { size: 11, color: k.ink }); txt(ctx, 'warm pool', x0 + 30, sea + 20, { size: 11, color: '#fff', bold: true }); txt(ctx, 'thermocline', lerp(x0, x1, 0.55), tc(0.55) + 14, { size: 10.5, color: '#fff' }); if (strength < 0.3) txt(ctx, 'upwelling of cold water', x1 - 8, sea + 16, { size: 10.5, color: '#fff', align: 'right' }); }
        // Niño 3.4 gauge
        if (strength < 0.3 && !F.quiet) for (var u = 0; u < 3; u++) { var ux = x1 - 30 - u * 26, uy = lerp(tc(1 - 0.03 - u * 0.035), sea + 26, ((t * 0.3 + u / 3) % 1)); arrow(ctx, ux, uy + 18, ux, uy, { color: '#a5d8ff', w: 2, head: 7 }); }
        var gw = M.min(150, w * 0.4), gx = w - gw - 46, gy = h - 42; ctx.fillStyle = k.panel; rrect(ctx, gx - 8, gy - 34, gw + 16, 60, 8); ctx.fill(); var gs = function (v) { return gx + (v + 2.5) / 5 * gw; }; ctx.fillStyle = 'rgba(28,111,214,0.3)'; ctx.fillRect(gs(-2.5), gy, gs(-0.5) - gs(-2.5), 8); ctx.fillStyle = 'rgba(224,49,49,0.3)'; ctx.fillRect(gs(0.5), gy, gs(2.5) - gs(0.5), 8); line(ctx, [[gs(-0.5), gy - 3], [gs(-0.5), gy + 11]], { color: k.ink, w: 1 }); line(ctx, [[gs(0.5), gy - 3], [gs(0.5), gy + 11]], { color: k.ink, w: 1 }); poly(ctx, [[gs(a), gy - 2], [gs(a) - 5, gy - 9], [gs(a) + 5, gy - 9]], k.rust); txt(ctx, 'Niño 3.4 anomaly' + (F.quiet ? '' : ': ' + (a > 0 ? '+' : '') + fm(a, 1) + ' °C'), gx, gy - 24, { size: 10, color: k.ink, bold: true }); txt(ctx, '−0.5', gs(-0.5), gy + 18, { size: 9, color: k.muted, align: 'center' }); txt(ctx, '+0.5', gs(0.5), gy + 18, { size: 9, color: k.muted, align: 'center' });
        var lab = a >= 0.5 ? 'El Niño' : a <= -0.5 ? 'La Niña' : 'neutral';
        T.s(lab); T.a((a > 0 ? '+' : '') + fm(a, 1) + ' °C');
        F.alt('A cross-section of the equatorial Pacific from Indonesia to Peru showing the warm pool, the tilted thermocline, the trade winds and where the rain falls' + (F.quiet ? '.' : ': ' + lab + '.'));
        F.say(lab === 'El Niño' ? 'In <b>El Niño</b> the trade winds weaken, warm water spreads east, the thermocline flattens and upwelling off South America weakens; the rainy area shifts toward the central Pacific.' : lab === 'La Niña' ? 'In <b>La Niña</b> the trade winds strengthen, piling warm water in the west; cold upwelling off Peru grows stronger.' : 'In <b>neutral</b> years the trade winds push warm water west, the thermocline tilts up toward South America and cold water wells up off Peru.', 'Trade winds, the warm pool and the thermocline shift together.');
        if (!F.quiet) F.legend([{ c: '#1c6fd6', t: 'La Niña: anomaly −0.5 °C or colder' }, { c: '#e03131', t: 'El Niño: +0.5 °C or warmer (NOAA’s threshold, held for several months)' }]);
      };
    }
  });

  /* es-atmosphere: The Atmosphere (U.S. Standard Atmosphere 1976).
     opts:
       probe: height in km (default 11); logP: true (pressure on a log axis); pie: true (gases in dry air; default true)
       markers: true (Everest, airliners, weather balloons, auroras; default true); units: 'hPa' | 'inHg' | 'kPa'
       letters: true (letter the layers); quiet: hides layer names and probe readouts; lock */
  R('es-atmosphere', function (el, o) {
    var F = frame(el, o, 'The atmosphere', { aspect: 1.35, max: 560 });
    F.size({ aspect: 1.3, max: 560, narrow: 0.62 });
    var P = { z: clamp(num(o.probe, 11), 0, 120), logP: !!o.logP, u: o.units || 'hPa' }, pie = o.pie !== false, marks = o.markers !== false, LT = F.letters, geo = null;
    var T = F.tiles([{ k: 'z', label: 'Height', secret: false }, { k: 't', label: 'Temperature', secret: true }, { k: 'p', label: 'Pressure', secret: true }, { k: 'r', label: 'Air density', secret: true }]);
    var zs = V.slider(F.ctl, { label: 'Probe height', min: 0, max: 120, step: 0.5, value: P.z, fmt: function (v) { return fm(v, 1) + ' km'; }, input: function (v) { P.z = v; F.redraw(); } });
    check(F.ctl, 'Log scale for pressure', P.logP, function (v) { P.logP = v; F.redraw(); });
    if (!o.units) V.seg(F.ctl, { label: 'Units', items: [['hPa', 'hPa'], ['inHg', 'inHg'], ['kPa', 'kPa']], value: P.u, change: function (v) { P.u = v; F.redraw(); } });
    F.drag({ hit: function (x, y) { return geo && y > geo.r.y - 6 && y < geo.r.y + geo.r.h + 6 && x > geo.r.x && x < geo.x2 ? 'z' : null; }, move: function (h, x, y) { P.z = clamp(M.round(geo.iy(y) * 2) / 2, 0, 120); zs.set(P.z); F.redraw(); }, touch: 'pan-x' });
    F.keys(function (e) { var a = arrowKey(e); if (!a || !a[1]) return false; P.z = clamp(P.z - a[1] * (e.shiftKey ? 10 : 1), 0, 120); zs.set(P.z); F.redraw(); return true; }, 'Drag up and down on the chart (or use the up and down arrow keys) to move the probe.');
    function pfmt(pa) { var hPa = pa / 100; if (P.u === 'inHg') return sig(hPa / EM.INHG, 3) + ' inHg'; if (P.u === 'kPa') return sig(hPa / 10, 3) + ' kPa'; return (hPa >= 10 ? nf(hPa, hPa >= 100 ? 0 : 1) : sig(hPa, 2)) + ' hPa'; }
    F.draw = function () {
      var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 600, cw = wide ? w * 0.62 : w, r = { x: 48, y: 14, w: (cw - 48 - 10) / 2 - 8, h: h - 54 - (wide ? 0 : h * 0.3) };
      var A = EM.atm(P.z);
      // temperature panel
      var c1 = chart(ctx, k, r, { x: { min: -100, max: 100, step: 50, label: 'Temperature (°C)' }, y: { min: 0, max: 120, step: 20, label: 'Height (km)' } });
      geo = { r: r, iy: c1.iy, x2: cw };
      EM.ATM_LAYERS.forEach(function (L, i) { ctx.fillStyle = [rgba(k.blue, 0.1), rgba(k.green, 0.1), rgba(k.gold, 0.1), rgba(k.red, 0.08)][i]; ctx.fillRect(r.x + 1, c1.Y(L[2]), r.w - 2, c1.Y(L[1]) - c1.Y(L[2])); if (LT) badge(ctx, LETTERS[i], r.x + r.w - 16, (c1.Y(L[1]) + c1.Y(L[2])) / 2, { k: k, r: 9 }); else if (!F.quiet) txt(ctx, L[0], r.x + 6, (c1.Y(L[1]) + c1.Y(L[2])) / 2, { size: 10.5, color: k.ink, bold: true }); });
      var tp = []; for (var z = 0; z <= 120; z += 0.5) tp.push([c1.X(EM.atm(z).T - 273.15), c1.Y(z)]); line(ctx, tp, { color: k.red, w: 2.6 });
      // ozone layer
      ctx.fillStyle = rgba(k.purple, 0.18); ctx.fillRect(r.x + r.w * 0.55, c1.Y(35), r.w * 0.45 - 1, c1.Y(15) - c1.Y(35)); if (!F.quiet && !LT) txt(ctx, 'ozone', r.x + r.w - 4, c1.Y(25), { size: 10, color: k.purple, align: 'right' });
      // pressure panel
      var r2 = { x: r.x + r.w + 16, y: r.y, w: r.w, h: r.h };
      var c2 = chart(ctx, k, r2, P.logP ? { x: { min: 1e-5, max: 1100, log: true, label: 'Pressure (hPa, log)', fmt: function (v) { return v >= 1 ? nf(v) : '10' + sup(M.round(M.log10(v))); } }, y: { min: 0, max: 120, step: 20, labels: false } } : { x: { min: 0, max: 1100, step: 250, label: 'Pressure (hPa)' }, y: { min: 0, max: 120, step: 20, labels: false } });
      if (marks) [[8.85, 'Everest', 6], [11, 'airliners', -6], [30, wide ? 'weather balloons burst' : 'balloons burst', -6], [100, 'auroras', -6]].forEach(function (m) { var xr = r2.x + r2.w; line(ctx, [[xr - 8, c2.Y(m[0])], [xr, c2.Y(m[0])]], { color: k.ink, w: 1.5 }); txt(ctx, m[1], xr - 10, c2.Y(m[0]) + m[2], { size: 9.5, color: k.muted, align: 'right', halo: k.halo }); });
      var pp = []; for (z = 0; z <= 120; z += 0.5) { var pv = EM.atm(z).P / 100; pp.push([c2.X(P.logP ? M.max(pv, 1e-5) : pv), c2.Y(z)]); } line(ctx, pp, { color: k.blue, w: 2.6 });
      if (!P.logP && !F.quiet) [5.5, 11, 16.5].forEach(function (zh, i) { var pv2 = EM.atm(zh).P / 100; circle(ctx, c2.X(pv2), c2.Y(zh), 3, k.blue); txt(ctx, ['½', '¼', '⅛'][i], c2.X(pv2) + 6, c2.Y(zh), { size: 11, color: k.blue, bold: true }); });
      // the probe
      [c1, c2].forEach(function (c, i) { line(ctx, [[i ? r2.x : r.x, c.Y(P.z)], [(i ? r2.x + r2.w : r.x + r.w), c.Y(P.z)]], { color: k.rust, w: 1.5, dash: [5, 4] }); });
      knob(ctx, c1.X(A.T - 273.15), c1.Y(P.z), k.rust, 5, k); knob(ctx, c2.X(P.logP ? M.max(A.P / 100, 1e-5) : A.P / 100), c2.Y(P.z), k.rust, 5, k);
      // pie of dry air and a barometer
      if (pie) {
        var ptop = r.y + r.h + 44, px = wide ? cw + (w - cw) / 2 : 14 + M.min(w * 0.17, (h - ptop - 12) / 2), py = wide ? h * 0.3 : (ptop + h) / 2 + 4, pr = wide ? M.min((w - cw) * 0.32, h * 0.2) : M.min(w * 0.17, (h - ptop - 30) / 2), a0 = -PI / 2, cols = ['#4dabf7', '#ff8787', '#ffd43b', '#868e96'];
        EM.AIR.forEach(function (g, i) { var a1 = a0 + g[1] / 100 * TAU; ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, pr, a0, M.max(a1, a0 + 0.02)); ctx.closePath(); ctx.fillStyle = cols[i]; ctx.fill(); a0 = a1; });
        var lgx = wide ? px - pr : px + pr + 14, lgy = wide ? py + pr + 14 : py - 22; txt(ctx, 'Dry air', wide ? px : lgx, wide ? py - pr - 10 : lgy - 18, { size: 11.5, color: k.ink, bold: true, align: wide ? 'center' : 'left' });
        EM.AIR.forEach(function (g, i) { var ly = lgy + i * 14; ctx.fillStyle = cols[i]; ctx.fillRect(lgx, ly - 5, 10, 10); txt(ctx, g[0] + (F.quiet ? '' : ' ' + fm(g[1], 2) + '%'), lgx + 14, ly, { size: 10, color: k.ink }); });
        txt(ctx, wide ? 'plus water vapor: 0–4%, it varies' : '+ water vapor, 0–4%', lgx, lgy + 4 * 14, { size: 10, color: k.muted });
        if (wide) { var bx = cw + (w - cw) / 2, by = h * 0.92, tubeH = h * 0.28, mm = A.P / 133.322; ctx.fillStyle = k.panel; ctx.fillRect(bx - 30, by - 6, 60, 10); line(ctx, [[bx, by], [bx, by - tubeH]], { color: k.axis, w: 6 }); line(ctx, [[bx, by], [bx, by - tubeH * clamp(mm / 800, 0, 1)]], { color: '#adb5bd', w: 4 }); txt(ctx, 'mercury: ' + (F.quiet ? '?' : nf(mm, 0) + ' mm'), bx + 10, by - tubeH * clamp(mm / 800, 0, 1), { size: 10, color: k.ink }); txt(ctx, '760 mm at sea level', bx, by + 12, { size: 9.5, color: k.muted, align: 'center' }); }
      }
      var lay = EM.ATM_LAYERS.filter(function (L) { return P.z >= L[1] && P.z <= L[2]; })[0] || EM.ATM_LAYERS[3];
      T.z(fm(P.z, 1) + ' km' + (F.quiet || LT ? '' : '<br>' + lay[0])); T.t(fm(A.T - 273.15, 0) + ' °C'); T.p(pfmt(A.P) + ' (' + sig(A.P / 1013.25, 2) + '% of sea level)'); T.r(sig(A.rho, 3) + ' kg/m³');
      F.alt('Temperature and pressure from the ground to 120 km: temperature falls, rises, falls and rises again through the troposphere, stratosphere, mesosphere and thermosphere, while pressure falls by about half every 5.5 km.');
      F.say('It does not get colder all the way up: ozone absorbs ultraviolet sunlight and warms the stratosphere, and the thin thermosphere is very hot. Pressure is the weight of the air above, so it falls by about the <b>same fraction</b> (about half) every 5.5 km, not the same amount. At ' + fm(P.z, 1) + ' km: <b>' + pfmt(A.P) + '</b>. Values from the U.S. Standard Atmosphere (1976), an average.', 'Temperature zigzags with height; pressure halves about every 5.5 km.');
    };
    F.redraw();
    return { destroy: F.reset };
  });

  /* es-humidity: Humidity and Dew Point (Magnus formula, saturation over water).
     opts:
       T: air temperature; Td: dew point (or RH: relative humidity %); units: 'C' | 'F' (default 'C')
       compare: [{T, RH}] (a second sample to compare); cycle: true (a day–night run at constant vapor)
       quiet: hides RH, dew point and vapor values; lock */
  R('es-humidity', function (el, o) {
    var F = frame(el, o, 'Humidity and dew point', { aspect: 1.55, max: 480 });
    F.size({ aspect: 1.5, max: 480, narrow: 0.95 });
    var fF = o.units === 'F', C2 = function (v) { return fF ? EM.fToC(v) : v; }, S = { T: C2(num(o.T, fF ? 86 : 30)), Td: null }, cmp = o.compare && o.compare[0] ? { T: C2(num(o.compare[0].T, 5)), RH: num(o.compare[0].RH, 100) } : null, cyc = !!o.cycle, ph = 0, geo = null, Tbase = null;
    S.Td = o.Td != null ? C2(num(o.Td, 20)) : o.RH != null ? EM.dewpoint(EM.esat(S.T) * num(o.RH, 50) / 100) : 20;
    function show(c, d) { return fF ? fm(EM.cToF(c), d == null ? 0 : d) + ' °F' : fm(c, d == null ? 1 : d) + ' °C'; }
    var T = F.tiles([{ k: 'e', label: 'Water vapor pressure', secret: true }, { k: 'es', label: 'Vapor pressure at saturation', secret: true }, { k: 'rh', label: 'Relative humidity', secret: true }, { k: 'td', label: 'Dew point', secret: true }]);
    var row = F.row();
    var cool = F.player(row, function (dt) { S.T = M.max(S.Td, S.T - dt * 4); F.redraw(); if (S.T <= S.Td + 1e-6) return false; }, { label: 'Cool the air' });
    var dn = F.player(row, function (dt) { ph += dt * 0.6; S.T = Tbase + 6 * M.sin(ph); if (S.T < S.Td) S.T = S.Td; F.redraw(); }, { label: 'Day and night', reset: function () { Tbase = S.T - 0; ph = 0; } });
    F.drag({ hit: function (x, y) { return geo && M.hypot(geo.X(S.T) - x, geo.Y(EM.esat(S.Td)) - y) < 24 ? 's' : null; }, move: function (h, x, y) { var Tn = clamp(geo.ix(x), -20, 45), e = clamp(geo.iy(y), 0.5, EM.esat(Tn)); S.T = Tn; S.Td = EM.dewpoint(e); F.redraw(); } });
    F.keys(function (e) { var a = arrowKey(e); if (!a) return false; if (a[0]) S.T = clamp(S.T + a[0], -20, 45); else { var ev = clamp(EM.esat(S.Td) * (1 - a[1] * 0.06), 0.5, EM.esat(S.T)); S.Td = EM.dewpoint(ev); } if (S.Td > S.T) S.Td = S.T; F.redraw(); return true; }, 'Drag the air sample (or use the arrow keys: left and right change its temperature, up and down its water vapor).');
    F.draw = function () {
      var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, r = { x: 56, y: 16, w: w - 72, h: h - 58 };
      var c = chart(ctx, k, r, { x: { min: -20, max: 45, step: fF ? 10 / 1.8 : 10, ticks: fF ? [-17.78, -6.67, 4.44, 15.56, 26.67, 37.78] : null, label: fF ? 'Temperature (°F)' : 'Temperature (°C)', fmt: function (v) { return fF ? fm(EM.cToF(v), 0) : fm(v, 0); } }, y: { min: 0, max: 100, step: 20, label: 'Water vapor pressure (hPa)', lpad: 44 } });
      geo = c; c.clip();
      var curve = []; for (var t = -20; t <= 45; t += 0.25) curve.push([c.X(t), c.Y(EM.esat(t))]);
      poly(ctx, curve.concat([[c.X(45), c.Y(100)], [c.X(-20), c.Y(100)]]), rgba(k.blue, 0.1)); line(ctx, curve, { color: k.blue, w: 2.6 });
      // RH guide curves (25, 50, 75%)
      [25, 50, 75].forEach(function (q) { var pts = []; for (var t2 = -20; t2 <= 45; t2 += 0.5) pts.push([c.X(t2), c.Y(EM.esat(t2) * q / 100)]); line(ctx, pts, { color: rgba(k.blue, 0.35), w: 1, dash: [4, 4] }); if (!F.quiet) txt(ctx, q + '%', c.X(43), c.Y(EM.esat(43) * q / 100) - 6, { size: 9.5, color: k.muted, align: 'right' }); });
      c.unclip();
      if (!F.quiet) { if (w >= 560) txt(ctx, 'saturation (100%): more vapor than this condenses', c.X(10), c.Y(EM.esat(28)), { size: 10.5, color: k.blue, bold: true, align: 'right', halo: k.halo }); else txt(ctx, 'saturation (100%)', c.X(34) - 4, c.Y(EM.esat(34)), { size: 10.5, color: k.blue, bold: true, align: 'right', halo: k.halo }); }
      var e = EM.esat(S.Td), x = c.X(S.T), y = c.Y(e);
      line(ctx, [[x, y], [c.X(S.Td), y]], { color: k.rust, w: 1.6, dash: [5, 4] }); circle(ctx, c.X(S.Td), y, 4, k.rust);
      if (!F.quiet) txt(ctx, 'dew point', c.X(S.Td) - 6, y - 10, { size: 10.5, color: k.rust, align: 'right' });
      knob(ctx, x, y, k.rust, 8, k); if (F.focused()) focusRing(ctx, x, y, 15);
      if (cmp) { var e2 = EM.esat(cmp.T) * cmp.RH / 100; circle(ctx, c.X(cmp.T), c.Y(e2), 7, k.blue, '#fff', 2); txt(ctx, 'B', c.X(cmp.T) + 10, c.Y(e2) - 8, { size: 12, color: k.blue, bold: true }); txt(ctx, 'A', x + 10, y - 10, { size: 12, color: k.rust, bold: true }); }
      if (S.T - S.Td < 0.3) txt(ctx, 'saturated: dew or fog forms', x + 12, y + 14, { size: 11, color: k.ink, bold: true, halo: k.halo });
      var rh = 100 * e / EM.esat(S.T);
      T.e(fm(e, 1) + ' hPa'); T.es(fm(EM.esat(S.T), 1) + ' hPa'); T.rh(fm(rh, 0) + '%'); T.td(show(S.Td));
      F.alt('A saturation curve of water vapor pressure against temperature, with an air sample at ' + (F.quiet ? 'a marked point' : show(S.T) + ' and a dew point of ' + show(S.Td)) + (cmp ? ' and a second sample B.' : '.'));
      F.say('Relative humidity compares the vapor in the air with the most there can be at that temperature: <b>' + fm(e, 1) + ' ÷ ' + fm(EM.esat(S.T), 1) + ' = ' + fm(rh, 0) + '%</b>. Cool the air with the same vapor and the relative humidity rises until it reaches 100% at the <b>dew point (' + show(S.Td) + ')</b>. Air doesn’t “hold” water like a sponge: saturation depends on temperature. The dew point measures the actual amount of vapor, so it tells how muggy it feels.' + (cmp ? ' Sample B has ' + (EM.esat(cmp.T) * cmp.RH / 100 > e ? 'more' : 'less') + ' water vapor than A, whatever their relative humidities.' : ''), 'Relative humidity depends on temperature; the dew point measures the vapor itself.');
    };
    F.redraw();
    if (cyc && !V.reduced) { Tbase = S.T; dn.start(); }
    return { destroy: F.reset };
  });

  /* es-parcel: Rising Air Parcel.
     opts:
       mode: 'lift' | 'mountain'      modes: true for tabs
       T0, Td0: temperature and dew point at the ground (°C); env: the surrounding air as [[height km, T °C], …] points, or a list of lapse rates (°C/km) for successive 1-km layers
       from the ground temperature (default 6.5 °C/km); its points can be dragged sideways
       peak: mountain top (km, mountain mode, default 3); at: where the air starts along the path (0 windward foot … 1 lee foot); lift: how high to lift the parcel (km, default 6)
       rates: {dry, moist, dew} °C/km to match a problem (e.g. {dry: 10, moist: 6, dew: 2}); default: dry 9.8, the rest computed
       show: list from 'dry', 'moist', 'dew', 'env' (lines to draw; default all)
       quiet: hides the cloud-base height, parcel temperatures and the verdict; lock */
  R('es-parcel', function (el, o) {
    var F = frame(el, o, 'Rising air', { aspect: 1.5, max: 500 });
    return F.modes({ lift: lift, mountain: mountain }, { lift: 'Lift a parcel', mountain: 'Over a mountain' });
    function lift(F) {
      F.size({ aspect: 1.45, max: 520, narrow: 0.85 });
      var P = { T0: num(o.T0, 25), Td0: num(o.Td0, 15), top: clamp(num(o.lift, 6), 1, 12) }, rates = o.rates || null, show = o.show || ['dry', 'moist', 'dew', 'env'], zz = { v: P.top }, sel = 0, geo = null, lapse1 = 6.5;
      // the surrounding air: points [height km, T °C] the learner can drag sideways; or a list of lapse rates for 1-km layers
      function uniform(G) { var e = [], zs = [0, 1, 2, 3, 4, 6, 8, 10, 12].filter(function (z) { return z <= P.top + 1e-9; }); if (zs[zs.length - 1] < P.top) zs.push(P.top); zs.forEach(function (z) { e.push([z, P.T0 - G * z]); }); return e; }
      var env = Array.isArray(o.env) && o.env.length ? (typeof o.env[0] === 'number' ? (function () { var e = [[0, P.T0]], T = P.T0; o.env.forEach(function (G, i) { T -= G; e.push([i + 1, T]); }); if (e[e.length - 1][0] < P.top) e.push([P.top, T - o.env[o.env.length - 1] * (P.top - e[e.length - 1][0])]); return e; })() : o.env.map(function (q) { return [+q[0], +q[1]]; })) : uniform(lapse1);
      var T = F.tiles([{ k: 'lcl', label: 'Cloud base (lifting condensation level)', secret: true }, { k: 'tp', label: 'Parcel at the top', secret: true }, { k: 'st', label: 'Lowest layer', secret: true }]);
      V.slider(F.ctl, { label: 'Ground temperature', min: -10, max: 40, step: 0.5, value: P.T0, fmt: function (v) { return fm(v, 1) + ' °C'; }, input: function (v) { var d = v - P.T0; P.T0 = v; env.forEach(function (q) { q[1] += d; }); if (P.Td0 > v) P.Td0 = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Ground dew point', min: -20, max: 30, step: 0.5, value: P.Td0, fmt: function (v) { return fm(v, 1) + ' °C'; }, input: function (v) { P.Td0 = M.min(v, P.T0); F.redraw(); } });
      V.slider(F.ctl, { label: 'Surrounding air cools (all layers)', min: 0, max: 12, step: 0.5, value: lapse1, fmt: function (v) { return fm(v, 1) + ' °C/km'; }, input: function (v) { lapse1 = v; env = uniform(v); F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { zz.v = M.min(P.top, zz.v + dt * 1.5); F.redraw(); if (zz.v >= P.top) return false; }, { label: 'Lift it', reset: function () { zz.v = 0; } });
      F.drag({ hit: function (x, y) { if (!geo) return null; var best = null, bd = 16; env.forEach(function (q, i) { if (i === 0 || q[0] > P.top + 1e-9) return; var d = M.hypot(geo.X(q[1]) - x, geo.Y(q[0]) - y); if (d < bd) { bd = d; best = i; } }); return best; }, start: function (i) { sel = i; }, move: function (i, x) { env[i][1] = M.round(clamp(geo.ix(x), -90, 45) * 2) / 2; F.redraw(); } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; var n = env.filter(function (q) { return q[0] <= P.top + 1e-9; }).length; if (a[1]) sel = clamp(sel - a[1], 1, n - 1); else { sel = clamp(sel, 1, n - 1); env[sel][1] = clamp(env[sel][1] + a[0] * (e.shiftKey ? 2 : 0.5), -90, 45); } F.redraw(); return true; }, 'Drag the black points of the surrounding air sideways to change how fast it cools in each layer (or use the arrow keys: up and down pick a point, left and right move it).');
      function Ef(z) { return interp(env, z); }
      function verdictOf(G, Gm) { return G < 0 ? 'stable (inversion)' : G < Gm ? 'stable' : G <= 9.8 ? 'conditionally unstable' : 'absolutely unstable'; }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, r = { x: 52, y: 14, w: w - 66, h: h - 54 };
        var pc = EM.parcel(P.T0, P.Td0, P.top, rates), tmin = M.min(P.T0 - 9.8 * P.top, Ef(P.top), -40), tmax = M.max(P.T0, M.max.apply(null, env.map(function (q) { return q[1]; })));
        var c = chart(ctx, k, r, { x: { min: M.max(-90, M.floor(tmin / 10) * 10), max: M.ceil((tmax + 5) / 10) * 10, step: 10, label: 'Temperature (°C)' }, y: { min: 0, max: P.top, step: P.top > 6 ? 2 : 1, label: 'Height (km)' } });
        geo = c; c.clip();
        var lcl = pc.lcl, upto = zz.v, pts = [], dpts = [];
        if (lcl != null && lcl <= upto) { var ctop = M.min(upto, P.top), cfill = k.dark ? 'rgba(200,215,230,0.16)' : 'rgba(120,140,165,0.11)', crad = w < 560 ? 8 : 12; for (var cz = lcl + 0.15; cz <= ctop; cz += 0.3) { var cxp = c.X(pc.T[M.min(pc.T.length - 1, M.round(cz / 0.02))]); for (var cc = -2; cc <= 2; cc++) circle(ctx, cxp + cc * crad, c.Y(cz) + (cc % 2) * 3, crad, cfill); } }
        if (show.indexOf('dry') >= 0) line(ctx, [[c.X(P.T0), c.Y(0)], [c.X(P.T0 - (rates && rates.dry || 9.8) * P.top), c.Y(P.top)]], { color: rgba(k.orange, 0.6), w: 1.4, dash: [6, 4] });
        for (var i = 0; i < pc.z.length; i++) { if (pc.z[i] > upto + 1e-9) break; pts.push([c.X(pc.T[i]), c.Y(pc.z[i])]); dpts.push([c.X(pc.Td[i]), c.Y(pc.z[i])]); }
        for (i = 0; i < pc.z.length - 1 && pc.z[i] < upto; i++) { var dT = pc.T[i] - Ef(pc.z[i]); ctx.fillStyle = dT > 0 ? rgba(k.red, 0.18) : rgba(k.blue, 0.12); var xa = c.X(pc.T[i]), xb = c.X(Ef(pc.z[i])); ctx.fillRect(M.min(xa, xb), c.Y(pc.z[i + 1]), M.abs(xb - xa), c.Y(pc.z[i]) - c.Y(pc.z[i + 1]) + 0.5); }
        if (show.indexOf('env') >= 0) line(ctx, Array.from({ length: 121 }, function (_, j) { var z = j / 120 * P.top; return [c.X(Ef(z)), c.Y(z)]; }), { color: k.ink, w: 2.4 });
        if (show.indexOf('dew') >= 0) line(ctx, dpts.filter(function (p, j) { return pc.z[j] <= (lcl == null ? 99 : lcl) + 1e-9; }), { color: k.green, w: 2, dash: [4, 3] });
        line(ctx, pts.filter(function (p, j) { return show.indexOf('moist') >= 0 || lcl == null || pc.z[j] <= lcl + 1e-9; }), { color: k.red, w: 3 });
        if (lcl != null && lcl <= upto) { line(ctx, [[r.x, c.Y(lcl)], [r.x + r.w, c.Y(lcl)]], { color: rgba(k.blue, 0.5), w: 1.2, dash: [5, 4] }); if (!F.quiet) txt(ctx, 'cloud base ' + fm(lcl, 2) + ' km', r.x + 6, c.Y(lcl) - 9, { size: 11, color: k.blue, bold: true, halo: k.halo }); }
        // each layer of the surrounding air: its lapse rate and stability
        var first = null, lays = [];
        for (i = 0; i < env.length - 1; i++) {
          var a = env[i], b = env[i + 1]; if (a[0] >= P.top - 1e-9) break;
          var zt = M.min(b[0], P.top), G = (a[1] - Ef(zt)) / (zt - a[0]), zm = (a[0] + zt) / 2, Gm = rates && rates.moist != null ? rates.moist : EM.moistLapse(Ef(zm), EM.pAt(zm)), v = verdictOf(G, Gm);
          if (!first) first = [G, v];
          if (lays.length && M.abs(lays[lays.length - 1].G - G) < 0.05 && lays[lays.length - 1].v === v) lays[lays.length - 1].z1 = zt; else lays.push({ z0: a[0], z1: zt, G: G, v: v });
        }
        lays.forEach(function (L) { var zm2 = (L.z0 + L.z1) / 2, ex = c.X(Ef(zm2)), lft = ex > r.x + r.w * 0.55; if (!F.quiet && c.Y(L.z0) - c.Y(L.z1) >= 15) txt(ctx, (w < 560 ? '' : fm(L.G, 1) + ' °C/km: ') + L.v, lft ? r.x + 8 : r.x + r.w - 6, c.Y(zm2), { size: w < 500 ? 9.5 : 10.5, color: L.v.indexOf('unstable') >= 0 ? k.red : k.muted, align: lft ? 'left' : 'right', halo: k.halo, bold: L.v.indexOf('absolutely') >= 0 }); if (L.z0 > 0) line(ctx, [[r.x, c.Y(L.z0)], [r.x + 10, c.Y(L.z0)]], { color: k.muted, w: 1 }); });
        c.unclip();
        env.forEach(function (q, j) { if (j === 0 || q[0] > P.top + 1e-9 || F.lock) return; circle(ctx, c.X(q[1]), c.Y(q[0]), 5, k.bg, k.ink, 2); if (F.focused() && j === sel) focusRing(ctx, c.X(q[1]), c.Y(q[0]), 11); });
        if (pts.length) knob(ctx, pts[pts.length - 1][0], pts[pts.length - 1][1], k.red, 6, k);
        F.legend([{ c: k.red, t: 'rising parcel', line: true }, { c: k.ink, t: 'surrounding air (drag the points)', line: true }, { c: k.green, t: 'parcel dew point (about 2 °C/km)', dash: true }, { c: k.orange, t: 'dry rate, ' + fm(rates && rates.dry || 9.8, 1) + ' °C/km', dash: true }].filter(function (q, j) { return j < 2 || show.indexOf(['', '', 'dew', 'dry'][j]) >= 0; }));
        var lastI = M.min(pc.z.length - 1, M.round(upto / 0.02)), Gm0 = EM.moistLapse(P.T0, 1000);
        T.lcl(lcl == null ? 'above the top' : fm(lcl, 2) + ' km'); T.tp(fm(pc.T[lastI], 1) + ' °C (air ' + fm(Ef(pc.z[lastI]), 1) + ' °C)'); T.st(first ? first[1] : '—'); if (first) T.st.label('Lowest layer (cools ' + fm(first[0], 1) + ' °C/km)');
        F.alt('A chart of height against temperature: a parcel of air rising from the ground cools at the dry rate until it reaches its dew point at the cloud base, then more slowly at the moist rate. The surrounding air is drawn for comparison, layer by layer.');
        F.say('Rising air expands as the pressure around it drops, and expanding air cools: about <b>9.8 °C per km</b> while dry. Its dew point drops too, about 2 °C per km, so the gap closes about 8 °C per km and a cloud forms where they meet (about 125 m per °C of spread). Inside the cloud, condensing vapor releases heat, so the parcel still cools, but more slowly. Where the parcel stays warmer than the air around it (red), it keeps rising on its own. A layer of surrounding air that cools faster than 9.8 °C/km is absolutely unstable; between the moist rate (about ' + fm(Gm0, 1) + ' °C/km near the ground here) and 9.8 it is <b>conditionally unstable</b>, stable for dry air but unstable once a cloud forms; slower than the moist rate, it is stable.', 'Rising air cools by expanding; a cloud forms where it reaches its dew point.');
      };
    }
    function mountain(F) {
      F.size({ aspect: 1.8, max: 440, narrow: 1.0 });
      var P = { T0: num(o.T0, 20), Td0: num(o.Td0, 12), peak: clamp(num(o.peak, 3), 0.5, 5), x: clamp(num(o.at, 0), 0, 1) }, rates = o.rates || null;
      var T = F.tiles([{ k: 'start', label: 'Start (windward foot)', secret: true }, { k: 'top', label: 'At the top', secret: true }, { k: 'end', label: 'End (leeward foot)', secret: true }, { k: 'here', label: 'The air now', secret: true }]);
      var geoM = null;
      F.drag({ hit: function (x, y) { return geoM && M.abs(y - geoM.y(x)) < 30 ? 'p' : null; }, move: function (h, x) { P.x = clamp((x - 14) / (F.c.w - 28), 0, 1); F.redraw(); }, touch: 'pan-y' });
      F.keys(function (e) { var a = arrowKey(e); if (!a || !a[0]) return false; P.x = clamp(P.x + a[0] * (e.shiftKey ? 0.1 : 0.02), 0, 1); F.redraw(); return true; }, 'Drag the air along its path (or use the left and right arrow keys).');
      V.slider(F.ctl, { label: 'Mountain height', min: 0.5, max: 5, step: 0.1, value: P.peak, fmt: function (v) { return fm(v, 1) + ' km'; }, input: function (v) { P.peak = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Start temperature', min: 0, max: 35, step: 0.5, value: P.T0, fmt: function (v) { return fm(v, 1) + ' °C'; }, input: function (v) { P.T0 = v; if (P.Td0 > v) P.Td0 = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Start dew point', min: -10, max: 30, step: 0.5, value: P.Td0, fmt: function (v) { return fm(v, 1) + ' °C'; }, input: function (v) { P.Td0 = M.min(v, P.T0); F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { P.x = M.min(1, P.x + dt * 0.18); F.redraw(); if (P.x >= 1) return false; }, { label: 'Blow the wind', reset: function () { P.x = 0; } });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, base = h - 30, s = (h - 70) / 5;
        ctx.fillStyle = k.sky; ctx.fillRect(0, 0, w, base);
        function hill(f) { return P.peak * M.exp(-M.pow((f - 0.5) / 0.18, 2)); }
        poly(ctx, [[0, base]].concat(Array.from({ length: 101 }, function (_, i) { return [i / 100 * w, base - hill(i / 100) * s]; }), [[w, base]]), k.landDark);
        ctx.fillStyle = k.landDark; ctx.fillRect(0, base, w, h - base);
        // the parcel going up the windward side and down the lee side
        var up = EM.parcel(P.T0, P.Td0, P.peak, rates), lcl = up.lcl, Ttop = up.T[up.T.length - 1], dry = rates && rates.dry || 9.8, Tend = Ttop + dry * P.peak;
        // dew point at the lee foot: the vapor left at the top (saturated there if a cloud formed), with its mixing ratio kept on the way down
        var satTop = lcl != null && lcl <= P.peak, TdEnd = rates && rates.dew != null ? (satTop ? Ttop : P.Td0 - rates.dew * P.peak) + rates.dew * P.peak : satTop ? EM.dewpoint(EM.esat(Ttop) * EM.pAt(0) / EM.pAt(P.peak)) : P.Td0;
        if (lcl != null && lcl < P.peak) { var cx1 = w * 0.32, cy1 = base - lcl * s; for (var c = 0; c < 7; c++) circle(ctx, cx1 + c * 14 - 20, cy1 - 8 - (c % 2) * 6 - (c / 7) * (P.peak - lcl) * s * 0.6, 13, k.cloud, rgba(k.ink, 0.2)); for (var d = 0; d < 10; d++) line(ctx, [[cx1 - 18 + d * 9, cy1 + 4], [cx1 - 22 + d * 9, cy1 + 20]], { color: k.blue, w: 1.4 }); if (!F.quiet) txt(ctx, 'cloud base ' + fm(lcl, 2) + ' km', cx1 - 30, cy1 + 32, { size: 10.5, color: k.ink, halo: k.halo }); }
        if (!F.quiet) txt(ctx, satTop ? 'rain shadow: dry' : 'no cloud: it just cools and warms', w - 8, base - 20, { size: 11, color: k.ink, bold: true, halo: k.halo, align: 'right' });
        // the wind arrow along the slope and the moving parcel
        var pts = Array.from({ length: 101 }, function (_, i) { return [i / 100 * w, base - hill(i / 100) * s - 18]; }); line(ctx, pts, { color: rgba(k.ink, 0.35), w: 1.4, dash: [6, 4] });
        geoM = { y: function (x) { return base - hill(x / w) * s - 18; } };
        var f = P.x, px = lerp(14, w - 14, f), py = base - hill(f) * s - 18, Tnow = f < 0.5 ? interp(up.z.map(function (z, i) { return [z, up.T[i]]; }), hill(f)) : Tend - dry * hill(f); circle(ctx, px, py, 9, mix(k.cool, k.hot, clamp(Tnow / 35, 0, 1)), '#fff', 2); if (F.focused()) focusRing(ctx, px, py, 15);
        T.here(fm(hill(f), 2) + ' km up, ' + fm(Tnow, 1) + ' °C');
        arrow(ctx, 50, 26, 120, 26, { color: k.ink, w: 2 }); txt(ctx, 'wind', 50, 40, { size: 11, color: k.ink });
        for (var km = 0; km <= 5; km++) { var yk = base - km * s; line(ctx, [[4, yk], [10, yk]], { color: k.ink, w: 1.2 }); txt(ctx, km + (km ? '' : ' km'), 13, yk, { size: 10, color: k.ink, halo: k.halo }); }
        T.start(fm(P.T0, 1) + ' °C, dew point ' + fm(P.Td0, 1) + ' °C'); T.top(fm(Ttop, 1) + ' °C'); T.end(fm(Tend, 1) + ' °C, dew point ' + fm(TdEnd, 1) + ' °C');
        F.alt('Air blowing over a mountain: it rises and cools, forms clouds and rain on the windward side, then sinks and warms on the lee side, ending warmer and drier than it started.');
        F.say(satTop ? 'Going up, the air cools at the dry rate to its cloud base, then at the slower moist rate while it rains out its moisture. Coming down the lee side it warms at the dry rate the whole way, by being squeezed, so it ends <b>warmer</b> (' + fm(Tend, 1) + ' °C vs ' + fm(P.T0, 1) + ' °C) and <b>drier</b> (dew point ' + fm(TdEnd, 1) + ' °C vs ' + fm(P.Td0, 1) + ' °C) than it started: the warm, dry wind of a rain shadow.' : 'The air never reaches its dew point, so no cloud forms: it cools at the dry rate going up and warms at the same rate coming down, ending just as it started. Raise the mountain or the dew point to make a cloud.', satTop ? 'Air ends warmer and drier on the lee side of a mountain.' : 'Without a cloud, the air ends as it started.');
      };
    }
  });

  /* es-energy: Earth's Energy.
     opts:
       mode: 'spectrum' | 'budget' | 'layer' | 'forcing'      modes: true or a list for tabs
       temps: list of temperatures in K (spectrum; default [5772, 288]); wien: true (mark the peaks); bands: true (absorption bands)
       albedo: 0–1 (budget, default 0.30); S: solar constant (W/m², default 1361); eps: 0–1 (layer: absorptivity, default 0.78)
       forcing: 'co2x2' | 'volcano' | 'solar' or a number of W/m²; feedbacks: list from 'vapor', 'ice', 'clouds' (switched on)
       quiet: hides temperatures, peak wavelengths and flux values; lock */
  R('es-energy', function (el, o) {
    var F = frame(el, o, 'Earth’s energy', { aspect: 1.6, max: 460 });
    return F.modes({ spectrum: spectrum, budget: budget, layer: layer, forcing: forcing }, { spectrum: 'Glowing bodies', budget: 'Energy budget', layer: 'Greenhouse layer', forcing: 'Forcings and feedbacks' });

    function spectrum(F) {
      F.size({ aspect: 1.6, max: 460, narrow: 0.95 });
      var temps = (o.temps || [5772, 288]).map(function (t) { return num(t, 288); }), wien = o.wien !== false, bands = !!o.bands, norm = true, T3 = temps[temps.length - 1];
      var T = F.tiles(temps.map(function (t, i) { return { k: 't' + i, label: 'At ' + nf(t) + ' K', secret: true }; }));
      var row = F.row(); check(row, 'Absorption bands in the air', bands, function (v) { bands = v; F.redraw(); }); check(row, 'Each curve to its own peak', norm, function (v) { norm = v; F.redraw(); });
      V.slider(F.ctl, { label: 'Last body’s temperature', min: 200, max: 6000, step: 1, value: T3, fmt: function (v) { return nf(v) + ' K (' + nf(v - 273) + ' °C)'; }, input: function (v) { temps[temps.length - 1] = v; F.redraw(); } });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, r = { x: 56, y: 16, w: w - 70, h: h - 56 };
        var maxB = 0; temps.forEach(function (t) { maxB = M.max(maxB, EM.planck(EM.wienPeak(t), t)); });
        var c = chart(ctx, k, r, { x: { min: 0.1, max: 100, log: true, label: 'Wavelength (μm, log scale)', fmt: function (v) { return v < 1 ? String(v) : nf(v); } }, y: norm ? { min: 0, max: 1.08, step: 0.25, label: 'Brightness (each to its peak)', lpad: 44, fmt: function (v) { return fm(v, 2); } } : { min: 1e-3, max: maxB * 3, log: true, label: 'Brightness (W m⁻² sr⁻¹ μm⁻¹)', lpad: 44 } });
        c.clip();
        // visible band
        var vis = ctx.createLinearGradient(c.X(0.38), 0, c.X(0.75), 0); ['#8b00ff', '#0000ff', '#00ff00', '#ffff00', '#ff7f00', '#ff0000'].forEach(function (cc, i) { vis.addColorStop(i / 5, cc); }); ctx.globalAlpha = 0.22; ctx.fillStyle = vis; ctx.fillRect(c.X(0.38), r.y, c.X(0.75) - c.X(0.38), r.h); ctx.globalAlpha = 1;
        if (bands) { var BL = labeler(ctx); [[0.1, 0.3, 'ozone'], [1.3, 1.5, ''], [1.8, 2.0, ''], [2.5, 3.0, ''], [4.2, 4.5, 'CO₂'], [5.5, 7.5, 'water vapor'], [9.4, 9.9, 'ozone'], [13, 17, 'CO₂'], [20, 100, 'water vapor']].forEach(function (b) { ctx.fillStyle = rgba(k.ink, 0.1); ctx.fillRect(c.X(b[0]), r.y, c.X(b[1]) - c.X(b[0]), r.h); if (b[2] && !F.quiet) BL.put(b[2], (c.X(b[0]) + c.X(b[1])) / 2, r.y + 10, { size: 9.5, color: k.muted, align: 'center', halo: k.halo }, [0, 13, 26]); }); }
        if (bands && !F.quiet) txt(ctx, 'window', c.X(11.2), r.y + 44, { size: 10, color: k.green, align: 'center', bold: true, halo: k.halo });
        c.unclip();
        var cols = [k.gold, k.red, k.blue, k.green];
        temps.forEach(function (t, i) { var pk = EM.planck(EM.wienPeak(t), t), pts = []; for (var e = -1; e <= 2.0001; e += 0.01) { var l = M.pow(10, e), b = EM.planck(l, t); pts.push([c.X(l), c.Y(norm ? b / pk : M.max(b, 1e-3))]); } c.clip(); line(ctx, pts, { color: cols[i % 4], w: 2.6 }); c.unclip(); var lp = EM.wienPeak(t); if (wien) { line(ctx, [[c.X(lp), c.Y(norm ? 1 : pk)], [c.X(lp), r.y + r.h]], { color: cols[i % 4], w: 1, dash: [3, 3] }); if (!F.quiet) txt(ctx, fm(lp, lp < 1 ? 2 : 1) + ' μm', c.X(lp) + 4, r.y + r.h - 10 - i * 14, { size: 10.5, color: cols[i % 4], bold: true }); } T['t' + i]('peak ' + fm(lp, lp < 1 ? 2 : 1) + ' μm; gives off ' + sig(EM.sigmaT4(t), 3) + ' W/m²'); });
        F.legend(temps.map(function (t, i) { return { c: cols[i % 4], t: nf(t) + ' K' + (t === 5772 ? ' (the Sun’s surface)' : t === 288 ? ' (Earth’s average surface)' : t === 310 ? ' (a person)' : t === 1400 ? ' (lava)' : ''), line: true }; }));
        F.alt('Glow curves for objects at ' + temps.map(function (t) { return nf(t) + ' K'; }).join(' and ') + ' on a log wavelength axis; hotter objects peak at shorter wavelengths' + (bands ? ', with the absorption bands of water vapor, carbon dioxide and ozone.' : '.'));
        F.say('Everything glows. Hot things peak at short wavelengths (the Sun at about 0.5 μm, visible light); Earth and people peak near 10 μm, in infrared we can’t see. Peak wavelength = 2,898 μm·K ÷ temperature (Wien). Total output = σT⁴, so doubling the temperature (in kelvins) multiplies the glow by 16.' + (bands ? ' Water vapor and CO₂ absorb much of Earth’s infrared, except in the window near 8–13 μm.' : ''), 'Everything glows; hotter things glow at shorter wavelengths and much more brightly.');
      };
    }

    function budget(F) {
      F.size({ aspect: 1.6, max: 460, narrow: 0.85 });
      var P = { a: clamp(num(o.albedo, 0.3), 0, 1), S: num(o.S, 1361) };
      var T = F.tiles([{ k: 'in', label: 'Sunlight, averaged over the globe (S/4)', secret: true }, { k: 'ref', label: 'Reflected', secret: true }, { k: 'abs', label: 'Absorbed = infrared out', secret: true }, { k: 'te', label: 'Balance temperature (no greenhouse)', secret: true }]);
      var asl = V.slider(F.ctl, { label: 'Albedo (fraction reflected)', min: 0, max: 0.9, step: 0.01, value: P.a, fmt: function (v) { return fm(v, 2); }, input: function (v) { P.a = v; F.redraw(); } });
      var row = F.row(); [['Fresh snow', 0.85], ['Ocean', 0.06], ['Forest', 0.15], ['Earth today', 0.3]].forEach(function (q) { V.button(row, q[0] + ' ' + q[1], function () { P.a = q[1]; asl.set(q[1]); F.redraw(); }); });
      F.draw = function () {
        var k = spaceBg(F), ctx = F.ctx, w = F.c.w, h = F.c.h, Sin = P.S / 4, ref = P.a * Sin, ab = Sin - ref, Te = EM.Te(P.S, P.a), narrow = w < 520, rr = M.min(w * 0.2, h * 0.24), cx = w * 0.5, cy = h - rr - (narrow ? 44 : 30);
        var g = ctx.createRadialGradient(cx - rr * 0.3, cy - rr * 0.3, rr * 0.1, cx, cy, rr); g.addColorStop(0, mix('#5aa2d8', '#ffffff', P.a * 0.6)); g.addColorStop(1, mix('#1f5585', '#bfd4e6', P.a * 0.6)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.fill();
        // arrow widths in proportion to the flows (340 W/m² is about 30 px)
        var sc = 30 / 340, top = 18;
        function band(x1, y1, x2, y2, val, col, big, small, side) {
          var wd = M.max(2, val * sc); arrow(ctx, x1, y1, x2, y2, { color: col, w: wd, head: M.max(12, wd * 1.3) });
          if (F.quiet) return; var lx, ly, al;
          if (side) { lx = lerp(x1, x2, 0.4) + side * (wd / 2 + 10); ly = lerp(y1, y2, 0.4); al = side < 0 ? 'right' : 'left'; } else { lx = x2; ly = y2 - 30; al = 'center'; }
          txt(ctx, big, lx, ly - 8, { size: 13, color: col, bold: true, align: al, halo: 'rgba(6,17,26,0.85)' }); txt(ctx, small, lx, ly + 8, { size: 10.5, color: '#dbe7ef', align: al, halo: 'rgba(6,17,26,0.85)' });
        }
        var tipY = top + 44;
        band(cx - rr * 1.25, top, cx - rr * 0.5, cy - rr * 0.9, Sin, '#ffd43b', nf(Sin) + ' W/m²', 'sunlight in', -1);
        if (ref > 0.5) band(cx - rr * 0.05, cy - rr - 4, cx + rr * 0.2, tipY, ref, '#e9ecef', nf(ref) + ' W/m²', 'reflected', 0);
        band(cx + rr * 0.72, cy - rr * 0.72, cx + rr * 1.55, tipY, ab, '#ff8787', nf(ab) + ' W/m²', 'infrared out', 0);
        var note = 'Earth catches sunlight on a disk (πR²) but glows from its whole sphere (4πR²): ÷ 4';
        if (narrow) { txt(ctx, 'Earth catches sunlight on a disk (πR²)', 10, h - 26, { size: 10, color: '#8fb3c6' }); txt(ctx, 'but glows from its whole sphere (4πR²): ÷ 4', 10, h - 12, { size: 10, color: '#8fb3c6' }); } else txt(ctx, note, 12, h - 12, { size: 10.5, color: '#8fb3c6' });
        if (!F.quiet) txt(ctx, fm(Te - 273.15, 1) + ' °C', cx, cy, { size: 15, color: '#fff', bold: true, align: 'center', halo: 'rgba(6,17,26,0.6)' });
        T.in(nf(Sin, 1) + ' W/m²'); T.ref(nf(ref, 1) + ' W/m²'); T.abs(nf(ab, 1) + ' W/m²'); T.te(fm(Te, 1) + ' K = ' + fm(Te - 273.15, 1) + ' °C');
        F.alt('Earth’s energy budget: sunlight in, part reflected, and the absorbed part given off as infrared; with albedo ' + fm(P.a, 2) + ' the balance temperature without greenhouse gases is ' + (F.quiet ? 'shown' : fm(Te - 273.15, 1) + ' degrees C') + '.');
        F.say('Sunlight at Earth: ' + nf(P.S) + ' W/m², spread over the globe: ÷4 = <b>' + nf(Sin, 1) + ' W/m²</b>. With albedo ' + fm(P.a, 2) + ', ' + nf(ab, 1) + ' W/m² is absorbed. To give that back as infrared, σT⁴ = ' + nf(ab, 1) + ', so T = <b>' + fm(Te, 1) + ' K (' + fm(Te - 273.15, 1) + ' °C)</b>. A high albedo means a surface reflects a lot and absorbs little. Earth’s real average, about 15 °C, is warmer because of the greenhouse effect.', 'Absorbed sunlight balances the infrared Earth gives off.');
      };
    }

    function layer(F) {
      F.size({ aspect: 1.55, max: 460, narrow: 0.85 });
      var P = { e: clamp(num(o.eps, 0.78), 0, 1), a: clamp(num(o.albedo, 0.3), 0, 0.9) };
      var T = F.tiles([{ k: 'ts', label: 'Surface temperature', secret: true }, { k: 'ta', label: 'Air layer temperature', secret: true }, { k: 'out', label: 'Infrared to space (= sunlight absorbed)', secret: true }]);
      V.slider(F.ctl, { label: 'Infrared absorbed by the air (ε)', min: 0, max: 1, step: 0.01, value: P.e, fmt: function (v) { return fm(v, 2); }, input: function (v) { P.e = v; F.redraw(); } });
      F.draw = function () {
        var k = spaceBg(F), ctx = F.ctx, w = F.c.w, h = F.c.h, Te = EM.Te(EM.S0, P.a), Ts = EM.Ts1(Te, P.e), Ta = Ts / M.pow(2, 0.25), A = EM.S0 * (1 - P.a) / 4, sTs = EM.sigmaT4(Ts), sTa = EM.sigmaT4(Ta);
        var gy = h * 0.82, ly = h * 0.42, narrow = w < 520;
        ctx.fillStyle = '#4f7a3f'; ctx.fillRect(0, gy, w, h - gy); ctx.fillStyle = 'rgba(160,200,255,' + (0.1 + 0.4 * P.e) + ')'; ctx.fillRect(0, ly - 16, w, 32);
        if (!F.quiet) { txt(ctx, 'ground', 10, gy + 16, { size: 11, color: '#fff' }); txt(ctx, 'air layer', 10, ly, { size: 11, color: '#fff', bold: true }); }
        var LB = labeler(ctx);
        function fl(x, y1, y2, val, col, small, side, ym) {
          var wd = M.max(1.5, val * 0.03); arrow(ctx, x, y1, x, y2, { color: col, w: wd, head: M.max(9, wd * 1.5) }); LB.reserve([x - wd / 2 - 2, M.min(y1, y2), wd + 4, M.abs(y2 - y1)]);
          if (F.quiet || val < 0.5) return; var lx = x + side * (wd / 2 + 8), al = side < 0 ? 'right' : 'left', my = ym || (y1 + y2) / 2;
          var yy = LB.put(nf(val), lx, my - 8, { size: 13, color: col, bold: true, align: al, halo: 'rgba(6,17,26,0.85)' }, [0, -30, 30, -56, 56]);
          if (yy !== false) txt(ctx, small, lx, yy + 15, { size: 10, color: '#dbe7ef', align: al, halo: 'rgba(6,17,26,0.85)' });
        }
        var xs = narrow ? [0.26, 0.42, 0.58, 0.76, 0.92] : [0.16, 0.36, 0.52, 0.7, 0.86];
        fl(w * xs[0], 10, gy - 4, A, '#ffd43b', 'sunlight', 1, (ly + 10) / 2 - 20);
        fl(w * xs[1], gy - 4, ly + 16, sTs, '#ff8787', narrow ? 'ground' : 'from the ground', 1);
        fl(w * xs[2], ly - 16, 10, (1 - P.e) * sTs, '#ff8787', narrow ? 'window' : 'through the window', 1);
        fl(w * xs[3], ly - 16, 10, P.e * sTa, '#ffa94d', narrow ? 'air, up' : 'from the air, up', 1);
        fl(w * xs[4], ly + 16, gy - 4, P.e * sTa, '#ffa94d', narrow ? 'air, down' : 'from the air, down', -1);
        T.ts(fm(Ts, 1) + ' K = ' + fm(Ts - 273.15, 1) + ' °C'); T.ta(fm(Ta - 273.15, 1) + ' °C'); T.out(nf((1 - P.e) * sTs + P.e * sTa, 1) + ' W/m²');
        F.alt('A one-layer greenhouse model: sunlight warms the ground; the ground’s infrared is partly absorbed by an air layer that glows both up and down.');
        F.say('The air layer absorbs a fraction ε of the ground’s infrared and glows both up and down, so the ground gets extra energy and warms until the energy leaving to space again equals the sunlight absorbed: T(surface) = T(balance) × (2 ÷ (2 − ε))^¼ = <b>' + fm(Ts - 273.15, 1) + ' °C</b>. Greenhouse gases don’t stop heat leaving; Earth still sends out as much as it absorbs, but more of it comes from higher, colder air. (This is not the ozone hole, which lets in more ultraviolet.)', 'Greenhouse gases absorb infrared and send some back down.');
      };
    }

    function forcing(F) {
      F.size({ aspect: 1.7, max: 440, narrow: 0.9 });
      var fk = typeof o.forcing === 'number' ? 'custom' : ['co2x2', 'volcano', 'solar'].indexOf(o.forcing) >= 0 ? o.forcing : 'co2x2', fv = typeof o.forcing === 'number' ? o.forcing : 0, fb = { vapor: true, ice: true, clouds: true };
      if (o.feedbacks) { fb = { vapor: false, ice: false, clouds: false }; o.feedbacks.forEach(function (q) { fb[q] = true; }); }
      var T = F.tiles([{ k: 'f', label: 'Push (forcing)', secret: true }, { k: 'lam', label: 'Net feedback', secret: true }, { k: 'eq', label: 'Warming once balanced', secret: true }]);
      if (!F.lock) V.seg(F.ctl, { label: 'Change', items: [['co2x2', 'CO₂ doubles'], ['volcano', 'Big eruption'], ['solar', '11-year solar cycle']], value: fk === 'custom' ? '' : fk, change: function (v) { fk = v; F.redraw(); } });
      var row = F.row(); var pk = check(row, 'Extra infrared from a warmer Earth (−, always on)', true, function () { }); pk.disabled = true; [['vapor', 'Water vapor (+)'], ['ice', 'Ice and snow (+)'], ['clouds', 'Clouds (likely +, uncertain)']].forEach(function (q) { check(row, q[1], fb[q[0]], function (v) { fb[q[0]] = v; F.redraw(); }); });
      function Ffun(t) { if (fk === 'co2x2') return 3.7; if (fk === 'volcano') return t < 0.3 ? -3 * t / 0.3 : -3 * M.exp(-(t - 0.3) / 1.0); if (fk === 'solar') return 0.1 * M.sin(2 * PI * t / 11); return fv; }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, lam = -(EM.FEEDBACK.planck + (fb.vapor ? EM.FEEDBACK.vapor : 0) + (fb.ice ? EM.FEEDBACK.ice : 0) + (fb.clouds ? EM.FEEDBACK.clouds : 0));
        var yrs = fk === 'co2x2' ? 200 : fk === 'volcano' ? 10 : 33, out = EM.twoBox(Ffun, yrs, lam, fk === 'volcano' ? 0.01 : 0.05), tmax = fk === 'co2x2' ? M.max(1, 3.7 / lam * 1.15) : M.max(0.1, M.max.apply(null, out.map(function (q) { return M.abs(q[1]); })) * 1.25);
        var c = chart(ctx, k, { x: 56, y: 16, w: w - 70, h: h - 56 }, { x: { min: 0, max: yrs, step: niceStep(yrs, 5), label: 'Years after the change' }, y: { min: fk === 'co2x2' ? 0 : -tmax, max: tmax, step: niceStep(tmax, 4), label: 'Warming (°C)', lpad: 44, fmt: function (v) { return fm(v, 2); } } });
        line(ctx, [[c.X(0), c.Y(0)], [c.X(yrs), c.Y(0)]], { color: k.axis, w: 1 });
        if (fk === 'co2x2') { var eq = 3.7 / lam; line(ctx, [[c.X(0), c.Y(eq)], [c.X(yrs), c.Y(eq)]], { color: k.rust, w: 1.4, dash: [6, 4] }); if (!F.quiet) txt(ctx, 'balanced warming ' + fm(eq, 1) + ' °C', c.X(yrs) - 4, c.Y(eq) - 8, { size: 11, color: k.rust, align: 'right', bold: true }); }
        line(ctx, out.map(function (q) { return [c.X(q[0]), c.Y(q[1])]; }), { color: k.red, w: 2.6 });
        // the energy imbalance at the top of the atmosphere, N = forcing − λ·warming: big at first, shrinking as Earth warms
        if (fk !== 'solar') { var tA = fk === 'volcano' ? 0.3 : 0.5, tB = out[out.length - 1][0], NA = Ffun(tA), NB = Ffun(tB) - lam * out[out.length - 1][1], ysc = 9, y0 = c.r.y + c.r.h * (fk === 'volcano' ? 0.12 : 0.8);
          [[tA, NA, 'imbalance at first'], [tB, NB, 'imbalance now']].forEach(function (q, i) { var x = i ? c.X(q[0]) - 26 : c.X(q[0]) + 26, L = q[1] * ysc; if (M.abs(L) < 2) L = q[1] < 0 ? -2 : 2; arrow(ctx, x, y0 - L / 2, x, y0 + L / 2, { color: k.gold, w: 5, head: 10 }); if (!F.quiet) { txt(ctx, (q[1] > 0 ? '+' : '') + fm(q[1], 1) + ' W/m²', x + (i ? -10 : 10), y0 - 7, { size: 11, color: k.gold, bold: true, align: i ? 'right' : 'left', halo: k.halo }); txt(ctx, q[2], x + (i ? -10 : 10), y0 + 8, { size: 10, color: k.muted, align: i ? 'right' : 'left', halo: k.halo }); } }); }
        var fnow = fk === 'co2x2' ? 3.7 : fk === 'volcano' ? -3 : fk === 'solar' ? 0.2 : fv;
        T.f((fnow > 0 ? '+' : '') + fm(fnow, 1) + ' W/m²' + (fk === 'solar' ? ' (low to high)' : fk === 'volcano' ? ' at the peak' : '')); T.lam('−' + fm(lam, 2) + ' W/m² per °C (Planck −3.22' + (fb.vapor ? ', vapor +1.30' : '') + (fb.ice ? ', ice +0.35' : '') + (fb.clouds ? ', clouds +0.42' : '') + ')'); T.eq(fk === 'co2x2' ? fm(3.7 / lam, 1) + ' °C' : '—');
        F.alt('Temperature change over time after ' + { co2x2: 'a doubling of carbon dioxide', volcano: 'a large volcanic eruption', solar: 'the 11-year solar cycle', custom: 'a forcing' }[fk] + ', with feedbacks switched ' + Object.keys(fb).filter(function (q) { return fb[q]; }).join(', ') + '.');
        F.say({ co2x2: 'Doubling CO₂ pushes about <b>+3.7 W/m²</b>. With no feedbacks, Earth would warm about 1.2 °C to balance it; water vapor and ice–albedo feedbacks amplify that (in science, \u201cpositive\u201d means the change strengthens itself, not that it’s good). With all feedbacks the balance is about 3 °C (likely 2.5–4 °C), reached slowly because the oceans take up heat for centuries. The gold arrows show the imbalance: Earth keeps gaining energy until it is warm enough to give it all back. Feedback values: IPCC AR6.', volcano: 'A big eruption puts a haze of sulfur droplets in the stratosphere that reflects sunlight: about <b>−3 W/m²</b> for a year or two. Earth cools a few tenths of a degree, then recovers, as after Pinatubo in 1991. Eruptions cool the climate; they don’t warm it.', solar: 'The Sun’s 11-year cycle changes the push by only about <b>0.2 W/m²</b> from low to high, a small wiggle next to CO₂’s 3.7 W/m² for a doubling.', custom: 'A forcing pushes the energy balance; feedbacks change how much warming it takes to rebalance.' }[fk], 'A forcing pushes; feedbacks amplify or damp the response.');
      };
    }
  });

  /* ---------- weather drawing helpers ---------- */
  // compass direction names
  var COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  function compass(deg) { return COMPASS[M.round(wrap360(deg) / 22.5) % 16]; }
  /* a wind barb at the station (x, y): the shaft points toward where the wind comes FROM (compass degrees), with a full
     barb for each 10 knots, a half barb for 5 and a pennant for 50, drawn on the clockwise side (Northern Hemisphere
     convention). Calm: a circle around the station. */
  function windBarb(ctx, x, y, from, kt, o) {
    o = o || {}; var len = o.len || 34, r0 = o.r0 || 7, col = o.color || '#000', lw = o.w || 1.6, a = from * RAD, ux = M.sin(a), uy = -M.cos(a), nx = M.cos(a), ny = M.sin(a);
    if (o.south) { nx = -nx; ny = -ny; }
    var k5 = M.round(kt / 5) * 5;
    if (k5 < 5) { circle(ctx, x, y, r0 + 4, null, col, lw); return; }
    var x0 = x + ux * r0, y0 = y + uy * r0, x1 = x + ux * (r0 + len), y1 = y + uy * (r0 + len), bl = len * 0.42, gap = len * 0.15, pos = r0 + len;
    line(ctx, [[x0, y0], [x1, y1]], { color: col, w: lw });
    var n50 = M.floor(k5 / 50), rem = k5 - n50 * 50, n10 = M.floor(rem / 10), n5 = rem % 10 ? 1 : 0;
    ctx.save(); ctx.fillStyle = col;
    for (var i = 0; i < n50; i++) { var pa = pos, pb = pos - gap * 1.2; ctx.beginPath(); ctx.moveTo(x + ux * pa, y + uy * pa); ctx.lineTo(x + ux * pa + nx * bl + ux * bl * 0.25, y + uy * pa + ny * bl + uy * bl * 0.25); ctx.lineTo(x + ux * pb, y + uy * pb); ctx.closePath(); ctx.fill(); pos -= gap * 1.5; }
    ctx.restore();
    for (i = 0; i < n10; i++) { line(ctx, [[x + ux * pos, y + uy * pos], [x + ux * pos + nx * bl + ux * bl * 0.35, y + uy * pos + ny * bl + uy * bl * 0.35]], { color: col, w: lw }); pos -= gap; }
    if (n5) { if (n10 + n50 === 0) pos -= gap; line(ctx, [[x + ux * pos, y + uy * pos], [x + ux * pos + nx * bl * 0.5 + ux * bl * 0.17, y + uy * pos + ny * bl * 0.5 + uy * bl * 0.17]], { color: col, w: lw }); }
  }
  // sky cover in eighths (0 clear … 8 overcast, 9 sky obscured) drawn in the station circle
  function skyCover(ctx, x, y, r, n, ink, bg) {
    circle(ctx, x, y, r, bg, ink, 1.6);
    ctx.save(); ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineWidth = 1.6;
    if (n === 9) { line(ctx, [[x - r * 0.7, y - r * 0.7], [x + r * 0.7, y + r * 0.7]], { color: ink, w: 1.6 }); line(ctx, [[x - r * 0.7, y + r * 0.7], [x + r * 0.7, y - r * 0.7]], { color: ink, w: 1.6 }); }
    else if (n >= 8) { circle(ctx, x, y, r, ink); }
    else if (n === 1) line(ctx, [[x, y - r], [x, y + r]], { color: ink, w: 1.6 });
    else if (n > 0) { var frac = n === 2 || n === 3 ? 0.25 : n === 4 || n === 5 ? 0.5 : 0.75; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, -PI / 2, -PI / 2 + frac * TAU); ctx.closePath(); ctx.fill(); if (n === 5 || n === 3) line(ctx, [[x, y - r], [x, y + r]], { color: ink, w: 1.6 }); if (n === 7) { ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, PI, -PI / 2); ctx.closePath(); ctx.fill(); ctx.fillStyle = bg; ctx.fillRect(x - r, y - 1, r * 0.95, 2); } }
    ctx.restore();
  }
  var COVER = [[0, 'clear'], [1, 'one-eighth'], [2, 'scattered (2/8)'], [4, 'half (4/8)'], [6, 'broken (6/8)'], [8, 'overcast'], [9, 'sky hidden (fog)']];
  var WX = { none: '', rain: 'rain', drizzle: 'drizzle', snow: 'snow', showers: 'rain showers', thunderstorm: 'thunderstorm', fog: 'fog', haze: 'haze', freezing: 'freezing rain' };
  // present-weather symbol (simplified forms of the standard symbols)
  function wxSymbol(ctx, kind, x, y, col, s) {
    s = s || 1; var dot = function (dx, dy) { circle(ctx, x + dx * s, y + dy * s, 2.6 * s, col); };
    if (kind === 'rain') { dot(-5, 0); dot(5, 0); }
    else if (kind === 'drizzle') { [-5, 5].forEach(function (d) { dot(d, -1); line(ctx, [[x + (d + 1.5) * s, y], [x + (d - 1) * s, y + 5 * s]], { color: col, w: 1.6 }); }); }
    else if (kind === 'snow') { [-6, 6].forEach(function (d) { for (var a = 0; a < 3; a++) { var an = a * PI / 3; line(ctx, [[x + d * s - 4 * s * M.cos(an), y - 4 * s * M.sin(an)], [x + d * s + 4 * s * M.cos(an), y + 4 * s * M.sin(an)]], { color: col, w: 1.4 }); } }); }
    else if (kind === 'showers') { poly(ctx, [[x - 6 * s, y - 2 * s], [x + 6 * s, y - 2 * s], [x, y + 8 * s]], null, col, 1.6); dot(0, -7); }
    else if (kind === 'thunderstorm') { line(ctx, [[x - 7 * s, y - 7 * s], [x - 7 * s, y + 7 * s]], { color: col, w: 1.8 }); line(ctx, [[x - 7 * s, y - 7 * s], [x + 6 * s, y - 7 * s], [x + 1 * s, y], [x + 6 * s, y + 7 * s]], { color: col, w: 1.8 }); arrowHead(ctx, x + 7 * s, y + 8 * s, 0.9, 6 * s, col); }
    else if (kind === 'fog') { [-4, 0, 4].forEach(function (d) { line(ctx, [[x - 8 * s, y + d * s], [x + 8 * s, y + d * s]], { color: col, w: 1.6 }); }); }
    else if (kind === 'haze') txt(ctx, '∞', x, y, { size: 16 * s, color: col, align: 'center' });
    else if (kind === 'freezing') { line(ctx, Array.from({ length: 13 }, function (_, i) { return [x - 9 * s + i * 1.5 * s, y + 3 * M.sin(i / 12 * TAU) * s]; }), { color: col, w: 1.6 }); dot(-3, -7); dot(4, -7); }
  }
  /* a weather front along pts ([[x, y], …], screen px): cold (blue triangles), warm (red half circles), stationary
     (alternating, on opposite sides) or occluded (purple, both on one side). side +1 puts the symbols on the right of the
     line's direction of travel through pts (screen coordinates), that is, the way the front moves. */
  function frontLine(ctx, pts, type, side, o) {
    o = o || {}; var sz = o.size || 9, gapPx = o.gap || 34, blue = o.blue || '#1c6fd6', red = o.red || '#e03131', pur = o.purple || '#9c36b5';
    var col = type === 'cold' ? blue : type === 'warm' ? red : type === 'occluded' ? pur : null;
    if (type === 'stationary') { // alternate red and blue segments
      var acc0 = 0; for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i], L = M.hypot(b[0] - a[0], b[1] - a[1]); line(ctx, [a, b], { color: M.floor((acc0 + L / 2) / gapPx) % 2 ? red : blue, w: 3 }); acc0 += L; }
    } else line(ctx, pts, { color: col, w: 3 });
    var acc = gapPx / 2, n = 0;
    for (i = 1; i < pts.length; i++) {
      var p = pts[i - 1], q = pts[i], segL = M.hypot(q[0] - p[0], q[1] - p[1]); if (!segL) continue; var ux = (q[0] - p[0]) / segL, uy = (q[1] - p[1]) / segL, nx = -uy * side, ny = ux * side;
      while (acc < segL) {
        var x = p[0] + ux * acc, y = p[1] + uy * acc, kind = type === 'cold' ? 'tri' : type === 'warm' ? 'semi' : n % 2 ? 'semi' : 'tri', c = type === 'occluded' ? pur : kind === 'tri' ? blue : red, sg = type === 'stationary' && kind === 'tri' ? -1 : 1;
        ctx.save(); ctx.fillStyle = c; ctx.beginPath();
        if (kind === 'tri') { ctx.moveTo(x - ux * sz * 0.8, y - uy * sz * 0.8); ctx.lineTo(x + nx * sg * sz * 1.1, y + ny * sg * sz * 1.1); ctx.lineTo(x + ux * sz * 0.8, y + uy * sz * 0.8); }
        else { var ang = M.atan2(uy, ux); ctx.moveTo(x - ux * sz * 0.8, y - uy * sz * 0.8); ctx.arc(x, y, sz * 0.8, ang + PI, ang, side * sg < 0); }
        ctx.closePath(); ctx.fill(); ctx.restore();
        acc += gapPx; n++;
      }
      acc -= segL;
    }
  }
  // a grid of a scalar field for contourSegs: f(x, y) in px over [0, w] × [0, h]
  function gridField(f, w, h, n) { var nx = n, ny = M.max(4, M.round(n * h / w)), z = new Float64Array((nx + 1) * (ny + 1)); for (var j = 0; j <= ny; j++) for (var i = 0; i <= nx; i++) z[j * (nx + 1) + i] = f(i / nx * w, j / ny * h); return { nx: nx, ny: ny, z: z, sx: w / nx, sy: h / ny }; }
  function drawContours(ctx, G, levels, o) {
    levels.forEach(function (lv) { var segs = contourSegs(G, lv); ctx.save(); ctx.strokeStyle = o.color; ctx.lineWidth = o.w || 1.3; ctx.beginPath(); segs.forEach(function (s) { ctx.moveTo(s[0] * G.sx, s[1] * G.sy); ctx.lineTo(s[2] * G.sx, s[3] * G.sy); }); ctx.stroke(); ctx.restore(); if (o.label && segs.length) { var s = segs[M.floor(segs.length * (o.at || 0.3))]; if (s) txt(ctx, o.label(lv), s[0] * G.sx, s[1] * G.sy, { size: 10, color: o.labelColor || o.color, align: 'center', halo: o.halo, bold: true }); } });
  }

  /* es-wind: Wind and Its Forces.
     opts:
       mode: 'isobars' | 'turntable' | 'global'      modes: true or a list for tabs
       hemisphere: 'N' | 'S'; lat: latitude (0–80, default 45); spacing: isobar spacing factor (0.5 close … 2 far, default 1)
       friction: true (near the ground; default false = aloft); release: {x, y} start of the parcel (fractions 0–1, y down; on tall phone screens the high sits above the low)
       forces: true (draw the force arrows; default true); letters: true (four lettered candidate wind arrows at a point instead of
       a parcel; seed shuffles them; answer: the surface wind with friction, the wind along the isobars without)
       spin: 'ccw' | 'cw' (turntable); month: 1–12 (global: shifts the rain belt); jets: true (global: the jet streams on a polar
       map; default true); waves: number of troughs in the polar jet (default 4)
       quiet: hides wind speeds, force names, belt names and jet labels; lock */
  R('es-wind', function (el, o) {
    var F = frame(el, o, 'Wind and its forces', { aspect: 1.6, max: 480 });
    return F.modes({ isobars: isobars, turntable: turntable, global: global }, { isobars: 'Pressure and wind', turntable: 'Spinning table', global: 'Global winds' });

    function isobars(F) {
      F.size({ aspect: 1.6, max: 480, narrow: 0.9 });
      var S = { hemi: o.hemisphere === 'S' ? 'S' : 'N', lat: clamp(num(o.lat, 45), 0, 80), sp: clamp(num(o.spacing, 1), 0.5, 2), fr: !!o.friction, forces: o.forces !== false, rel: o.release ? { x: clamp(num(o.release.x, 0.5), 0.02, 0.98), y: clamp(num(o.release.y, 0.2), 0.02, 0.98) } : null, idx: 1e9 }, path = null, geo = null;
      var LT = F.letters, seed = num(o.seed, 1);
      var T = F.tiles([{ k: 'v', label: 'Wind speed', secret: true }, { k: 'ang', label: 'Angle across the isobars', secret: true }]);
      if (!o.hemisphere) V.seg(F.ctl, { label: 'Hemisphere', items: [['N', 'Northern'], ['S', 'Southern']], value: S.hemi, change: function (v) { S.hemi = v; run(); } });
      V.slider(F.ctl, { label: 'Latitude', min: 0, max: 80, step: 1, value: S.lat, fmt: function (v) { return v + '°' + (v ? ' ' + S.hemi : ''); }, input: function (v) { S.lat = v; run(); } });
      V.slider(F.ctl, { label: 'Isobar spacing', min: 0.5, max: 2, step: 0.1, value: S.sp, fmt: function (v) { return v < 0.8 ? 'close' : v > 1.3 ? 'far apart' : 'medium'; }, input: function (v) { S.sp = v; run(); } });
      var row = F.row(); check(row, 'Near the ground (friction)', S.fr, function (v) { S.fr = v; run(); }); check(row, 'Show the forces', S.forces, function (v) { S.forces = v; F.redraw(); });
      var pl = LT ? null : F.player(row, function (dt) { S.idx += dt * 60; F.redraw(); if (S.idx >= path.length - 1) return false; }, { label: 'Release the air', reset: function () { S.idx = 0; } });
      F.drag({ hit: function (x, y) { return geo && !LT ? 'r' : null; }, start: function (h, x, y) { S.rel = { x: clamp(x / geo.w, 0.02, 0.98), y: clamp(y / geo.h, 0.02, 0.98) }; run(); }, move: function (h, x, y) { S.rel = { x: clamp(x / geo.w, 0.02, 0.98), y: clamp(y / geo.h, 0.02, 0.98) }; run(); }, touch: 'pan-y' });
      F.keys(function (e) { var a = arrowKey(e); if (!a || LT) return false; S.rel.x = clamp(S.rel.x + a[0] * 0.02, 0.02, 0.98); S.rel.y = clamp(S.rel.y + a[1] * 0.02, 0.02, 0.98); run(); return true; }, LT ? '' : 'Tap the map to release a parcel of air there (or move the start with the arrow keys), then press Release.');
      // the pressure field (hPa) in km: a high on the left, a low on the right
      // wide maps: the high on the left, the low on the right; tall (phone) maps: the high above the low
      var Wkm = 3000, LAY = { H: [0.22, 0.5], L: [0.76, 0.5], rel: { x: 0.66, y: 0.2 }, pt: [0.49, 0.3] };
      function layout(w, h) { var tall = h > w * 1.05; Wkm = tall ? 2000 : 3000; LAY = tall ? { H: [0.5, 0.22], L: [0.5, 0.76], rel: { x: 0.75, y: 0.62 }, pt: [0.64, 0.5] } : { H: [0.22, 0.5], L: [0.76, 0.5], rel: { x: 0.66, y: 0.2 }, pt: [0.49, 0.3] }; if (!S.rel) S.rel = { x: LAY.rel.x, y: LAY.rel.y }; }
      function field(Hkm) { var A = 22 / S.sp, s2 = 650 * 650, hx = LAY.H[0] * Wkm, hy = LAY.H[1] * Hkm, lx = LAY.L[0] * Wkm, ly = LAY.L[1] * Hkm; return function (x, y) { var dH = (x - hx) * (x - hx) + (y - hy) * (y - hy), dL = (x - lx) * (x - lx) + (y - ly) * (y - ly); return 1013 + A * M.exp(-dH / s2) - A * 1.1 * M.exp(-dL / s2); }; }
      function grad(p, x, y) { var d = 2; return [(p(x + d, y) - p(x - d, y)) / (2 * d), (p(x, y + d) - p(x, y - d)) / (2 * d)]; } // hPa per km; y is down (south)
      function fcor() { return EM.coriolisF(S.lat) * (S.hemi === 'S' ? -1 : 1); }
      // integrate a parcel: positions in km (x east, y SOUTH, as on the screen), velocity m/s
      function run() {
        if (!geo) { F.redraw(); return; }
        var p = field(geo.Hkm), f = fcor(), kf = S.fr ? 6e-5 : 1e-5, x = S.rel.x * Wkm, y = S.rel.y * geo.Hkm, u = 0, v = 0, dt = 60, out = [[x, y, 0, 0]], dMin = 1e9;
        for (var n = 0; n < 48 * 60; n++) {
          var g = grad(p, x, y), ax = -g[0] * 0.1 / 1.2, ay = -g[1] * 0.1 / 1.2; // PGF (m/s²), y down
          // Coriolis with y down: north-up (u, vn) with vn = −v; a_c = (f·vn, −f·u) north-up → screen (f·(−v), +f·u)
          ax += -f * v - kf * u; ay += f * u - kf * v;
          u += ax * dt; v += ay * dt; x += u * dt / 1000; y += v * dt / 1000;
          if (n % 5 === 4) out.push([x, y, u, v]);
          var dLow = M.hypot(x - LAY.L[0] * Wkm, y - LAY.L[1] * geo.Hkm); if (dLow < dMin) dMin = dLow;
          if (x < -50 || x > Wkm + 50 || y < -50 || y > geo.Hkm + 50 || dLow < 60 || (f === 0 && dLow > dMin + 40)) break; // no Coriolis: stop where it reaches the low
        }
        path = out; if (!pl || !pl.running()) S.idx = path.length - 1; F.redraw();
      }
      F.draw = function () {
        layout(F.c.w, F.c.h); var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, Hkm = Wkm * h / w, sc = w / Wkm, first = !geo || geo.w !== w || geo.h !== h;
        geo = { w: w, h: h, Hkm: Hkm }; if (first || !path) { run(); return; }
        var p = field(Hkm), G = gridField(function (px, py) { return p(px / sc, py / sc); }, w, h, 90);
        ctx.fillStyle = k.dark ? '#172a22' : '#f4f8f5'; ctx.fillRect(0, 0, w, h);
        var lv = []; for (var q = 972; q <= 1048; q += 4) lv.push(q);
        drawContours(ctx, G, lv, { color: k.dark ? '#8fb3c6' : '#5c7c8f', w: 1.3, label: function (l) { return String(l); }, at: 0.15, halo: k.halo, labelColor: k.muted });
        txt(ctx, 'H', LAY.H[0] * w, LAY.H[1] * h, { size: 28, color: k.blue, bold: true, align: 'center', halo: k.halo }); txt(ctx, 'L', LAY.L[0] * w, LAY.L[1] * h, { size: 28, color: k.red, bold: true, align: 'center', halo: k.halo });
        var f = fcor();
        if (LT) {
          // a point and four candidate arrows
          var px = LAY.pt[0] * w, py = LAY.pt[1] * h, gq = grad(p, px / sc, py / sc), gl = M.hypot(gq[0], gq[1]), dn = [-gq[0] / gl, -gq[1] / gl], hs = S.hemi === 'S' ? -1 : 1;
          function rot(vv, deg) { var a = deg * RAD; return [vv[0] * M.cos(a) - vv[1] * M.sin(a), vv[0] * M.sin(a) + vv[1] * M.cos(a)]; } // screen rotation: positive = clockwise on screen
          var geoV = rot(dn, 90 * hs), cand = [{ v: dn, t: 'straight toward the low' }, { v: geoV, t: 'along the isobars (aloft)' }, { v: rot(dn, 60 * hs), t: 'across the isobars toward the low (near the ground)' }, { v: rot(dn, -90 * hs), t: 'along the isobars the wrong way' }];
          var rr = rng(seed + 7), order = [0, 1, 2, 3].sort(function () { return rr() - 0.5; });
          order.forEach(function (ci, j) { var cv = cand[ci].v, ex = px + cv[0] * 54, ey = py + cv[1] * 54; arrow(ctx, px, py, ex, ey, { color: k.ink, w: 2.4, head: 10 }); badge(ctx, LETTERS[j], px + cv[0] * 70, py + cv[1] * 70, { k: k, r: 10 }); });
          circle(ctx, px, py, 5, k.rust, '#fff', 2);
          var ans = LETTERS[order.indexOf(S.fr ? 2 : 1)];
          T.v('—'); T.ang('—');
          F.alt('Isobars around a high (H) and a low (L), with four lettered arrows at a point showing possible wind directions.');
          F.say('Which arrow shows the wind at the point? ' + (S.fr ? 'Near the ground friction slows the wind, so Coriolis turns it less and it crosses the isobars toward the low: <b>' + ans + '</b>.' : 'Aloft, with no friction, the wind blows along the isobars with the low on its ' + (S.hemi === 'S' ? 'right' : 'left') + ' (' + (S.hemi === 'S' ? 'Southern' : 'Northern') + ' Hemisphere): <b>' + ans + '</b>.'), 'Choose the arrow that shows the wind.');
          return;
        }
        var i = M.min(path.length - 1, M.floor(S.idx)), cur = path[i];
        line(ctx, path.slice(0, i + 1).map(function (q2) { return [q2[0] * sc, q2[1] * sc]; }), { color: k.rust, w: 2.6 });
        circle(ctx, path[0][0] * sc, path[0][1] * sc, 4, k.rust);
        var cx = cur[0] * sc, cy = cur[1] * sc, sp = M.hypot(cur[2], cur[3]);
        if (S.forces) {
          var g2 = grad(p, cur[0], cur[1]), pg = [-g2[0] * 0.1 / 1.2, -g2[1] * 0.1 / 1.2], co = [-f * cur[3], f * cur[2]], frc = S.fr ? [-6e-5 * cur[2], -6e-5 * cur[3]] : [0, 0], ref = M.hypot(pg[0], pg[1]) || 1e-9, LB = labeler(ctx);
          [[pg, k.blue, 'pressure gradient'], [co, k.purple, 'Coriolis'], [frc, k.orange, 'friction']].forEach(function (fq) { var m = M.hypot(fq[0][0], fq[0][1]); if (m < ref * 0.03) return; var L = M.min(80, 52 * m / ref); arrow(ctx, cx, cy, cx + fq[0][0] / m * L, cy + fq[0][1] / m * L, { color: fq[1], w: 3, head: 10 }); if (!F.quiet) LB.put(fq[2], cx + fq[0][0] / m * (L + 8), cy + fq[0][1] / m * (L + 8), { size: 11, color: fq[1], bold: true, halo: k.halo, align: fq[0][0] < 0 ? 'right' : 'left' }, [0, 12, -12]); });
        }
        if (sp > 0.2) arrow(ctx, cx, cy, cx + cur[2] / sp * 26, cy + cur[3] / sp * 26, { color: k.ink, w: 1.6, head: 7, dash: [3, 2] });
        knob(ctx, cx, cy, k.rust, 7, k); if (F.focused()) focusRing(ctx, path[0][0] * sc, path[0][1] * sc, 12);
        // angle between the wind and the isobar through the point
        var g3 = grad(p, cur[0], cur[1]), gm = M.hypot(g3[0], g3[1]), ang = sp > 0.3 && gm > 0 ? M.asin(clamp(-(cur[2] * g3[0] + cur[3] * g3[1]) / (sp * gm), -1, 1)) * DEG : null;
        T.v(fm(sp, 1) + ' m/s (' + fm(sp * 3.6, 0) + ' km/h)'); T.ang(ang == null ? '—' : M.abs(ang) < 8 ? 'about along them (' + fm(M.abs(ang), 0) + '°)' : fm(M.abs(ang), 0) + '° ' + (ang > 0 ? 'toward the low' : 'toward the high'));
        F.legend(S.forces ? [{ c: k.blue, t: 'pressure-gradient force' }, { c: k.purple, t: 'Coriolis effect' }].concat(S.fr ? [{ c: k.orange, t: 'friction' }] : []).concat([{ c: k.rust, t: 'path of the air', line: true }]) : [{ c: k.rust, t: 'path of the air', line: true }]);
        F.alt('Isobars around a high and a low; a parcel of air released at a point starts toward the low, then turns ' + (f === 0 ? '' : S.hemi === 'S' ? 'left' : 'right') + (f === 0 ? 'heads straight for the low' : ' until it blows ' + (S.fr ? 'across the isobars at an angle toward the low' : 'along the isobars')) + '.');
        F.say(f === 0 ? 'At the equator there is no Coriolis effect, so the air heads straight for the low: that is why hurricanes can’t form right at the equator.' : 'The pressure-gradient force pushes the air toward low pressure, across the isobars. As the air speeds up, the Coriolis effect turns it to the <b>' + (S.hemi === 'S' ? 'left' : 'right') + '</b> (' + (S.hemi === 'S' ? 'Southern' : 'Northern') + ' Hemisphere) until the two balance' + (S.fr ? ', but near the ground friction slows the wind, so Coriolis is weaker and the wind crosses the isobars toward the low.' : ': aloft the wind blows <b>along</b> the isobars, faster where they are close together.') + ' Coriolis only changes the wind’s direction, never its speed, and it is weaker toward the equator. It is far too weak to set the swirl of a sink drain.', 'Pressure pushes toward the low; Coriolis turns the wind.');
      };
    }

    function turntable(F) {
      F.size({ aspect: 2.0, max: 420, narrow: 0.5 });
      var S = { spin: o.spin === 'cw' ? -1 : 1, turn: 60, t: 1 };
      V.slider(F.ctl, { label: 'How far the table turns while the ball crosses', min: 0, max: 120, step: 5, value: S.turn, fmt: function (v) { return v + '°'; }, input: function (v) { S.turn = v; F.redraw(); } });
      V.seg(F.ctl, { label: 'Spin', items: [['ccw', 'Counterclockwise (like the north)'], ['cw', 'Clockwise (like the south)']], value: S.spin > 0 ? 'ccw' : 'cw', change: function (v) { S.spin = v === 'ccw' ? 1 : -1; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { S.t = M.min(1, S.t + dt * 0.35); F.redraw(); if (S.t >= 1) return false; }, { label: 'Roll the ball', reset: function () { S.t = 0; } });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, R1 = wide ? M.min(w / 4 - 20, h / 2 - 34) : M.min(w / 2 - 20, h / 4 - 30);
        var cs = wide ? [[w / 4, h / 2 + 10], [3 * w / 4, h / 2 + 10]] : [[w / 2, h / 4 + 12], [w / 2, 3 * h / 4 + 6]];
        // the ball: from the left rim straight to the right rim (room frame), x(t) = −R + 2R·t
        function ballRoom(t) { return [-R1 * 0.92 + 1.84 * R1 * t, R1 * 0.12]; }
        function toDisk(pt, t) { var a = S.spin * S.turn * RAD * t; return [pt[0] * M.cos(a) - pt[1] * M.sin(a), pt[0] * M.sin(a) + pt[1] * M.cos(a)]; } // undo the table's turn (screen y is down, so +a is clockwise)
        [0, 1].forEach(function (pi) {
          var c = cs[pi], th = pi === 0 ? -S.spin * S.turn * RAD * S.t : 0;
          // the table, with marks that turn with it in the room view
          circle(ctx, c[0], c[1], R1, k.dark ? '#26382e' : '#eef3ee', k.axis, 2);
          for (var m = 0; m < 8; m++) { var a = th + m * PI / 4; line(ctx, [[c[0], c[1]], [c[0] + R1 * M.cos(a), c[1] + R1 * M.sin(a)]], { color: rgba(k.ink, 0.15), w: 1 }); }
          circle(ctx, c[0] + R1 * 0.8 * M.cos(th - PI / 2), c[1] + R1 * 0.8 * M.sin(th - PI / 2), 6, k.gold);
          // spin arrow
          var sa = -PI * 0.75, ea = -PI * 0.25; ctx.save(); ctx.strokeStyle = k.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c[0], c[1], R1 + 10, S.spin > 0 ? ea : sa, S.spin > 0 ? sa : ea, S.spin > 0); ctx.stroke(); ctx.restore(); var tipA = S.spin > 0 ? sa : ea; arrowHead(ctx, c[0] + (R1 + 10) * M.cos(tipA), c[1] + (R1 + 10) * M.sin(tipA), tipA + (S.spin > 0 ? -PI / 2 : PI / 2), 8, k.muted);
          var pts = []; for (var t = 0; t <= S.t + 1e-9; t += 0.01) { var b = ballRoom(t), q = pi === 0 ? b : toDisk(b, t); pts.push([c[0] + q[0], c[1] + q[1]]); }
          line(ctx, pts, { color: k.rust, w: 2.6 }); if (pts.length) circle(ctx, pts[pts.length - 1][0], pts[pts.length - 1][1], 7, k.rust, '#fff', 2);
          txt(ctx, pi === 0 ? 'Seen from the room: a straight path' : 'Seen from a camera riding the table: it curves', c[0], c[1] - R1 - 22, { size: 12, color: k.ink, bold: true, align: 'center' });
        });
        F.alt('A ball rolled across a spinning table: from the room its path is straight; from a camera riding the table it curves to the ' + (S.spin > 0 ? 'right' : 'left') + '.');
        F.say('The ball really goes straight. The table turns underneath it, so to someone riding the table the path bends to the <b>' + (S.spin > 0 ? 'right' : 'left') + '</b>. Earth seen from above the North Pole spins counterclockwise, so moving things seem to curve right in the Northern Hemisphere and left in the Southern. That apparent curve is the Coriolis effect; it changes the direction, not the speed.', 'The table turns under a ball that really goes straight.');
      };
    }

    function global(F) {
      F.size({ aspect: 1.35, max: 620, narrow: 0.42 });
      var S = { m: clamp(M.round(num(o.month, 7)), 1, 12), jets: o.jets !== false, waves: clamp(M.round(num(o.waves, 4)), 2, 7), ph: 0 }, LT = F.letters;
      V.slider(F.ctl, { label: 'Month', min: 1, max: 12, step: 1, value: S.m, fmt: function (v) { return EM.months[v - 1]; }, input: function (v) { S.m = v; F.redraw(); } });
      var row = F.row(); check(row, 'Jet streams', S.jets, function (v) { S.jets = v; F.redraw(); }); F.player(row, function (dt) { S.ph += dt * 0.15; F.redraw(); }, { label: 'Let the jet wander' });
      function itcz() { return 4 + 9 * M.cos(2 * PI * (S.m - 7.5) / 12); }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 600, ic = itcz(), sh = ic * 0.3;
        var gR = wide ? M.min(w * 0.24, h * 0.42) : M.min(w * 0.44, h * 0.18), gc = wide ? [w * 0.26, h * 0.5] : [w / 2, gR + 14];
        var sr = wide ? { x: w * 0.56, y: 26, w: w * 0.42, h: S.jets ? h * 0.34 : h * 0.8 } : { x: 34, y: gc[1] + gR + 36, w: w - 46, h: h * 0.2 };
        // --- the globe with belts and surface winds
        var G = globeProj(-20, 0, gc[0], gc[1], gR);
        circle(ctx, gc[0], gc[1], gR, k.dark ? '#1d4a6b' : '#bcd9ee'); globeLand(ctx, G, k.dark ? '#5a7a4c' : '#cfe0b8', null);
        var belts = [[ic, 'L', 'equatorial low: rain'], [30 + sh, 'H', 'subtropical high: deserts'], [-30 + sh, 'H', 'subtropical high: deserts'], [60 + sh * 0.5, 'L', 'subpolar low'], [-60 + sh * 0.5, 'L', 'subpolar low'], [88, 'H', 'polar high'], [-88, 'H', 'polar high']];
        belts.forEach(function (b, i) { var pts = []; for (var lo = -110; lo <= 70; lo += 4) pts.push([lo, b[0]]); globeLine(ctx, G, pts, { color: b[1] === 'L' ? rgba(k.red, 0.75) : rgba(k.blue, 0.75), w: b[1] === 'L' && i === 0 ? 6 : 3, dash: b[1] === 'H' ? [6, 4] : [] }); });
        // surface winds: from the NE (trades), SW (westerlies), NE (polar easterlies) in the north; mirrored in the south
        function windAt(lat) { var a = M.abs(lat - (lat > ic ? 0 : 0)), n = lat >= ic; var band = lat > ic ? (lat < 30 + sh ? 'trade' : lat < 60 + sh * 0.5 ? 'west' : 'polar') : (lat > -30 + sh ? 'trade' : lat > -60 + sh * 0.5 ? 'west' : 'polar'); var east = band === 'west' ? 1 : -1, north = band === 'trade' ? (n ? -1 : 1) : band === 'west' ? (n ? 1 : -1) : (n ? -1 : 1); return [east, north * 0.55, band]; }
        [-75, -45, -15, 15, 45, 75].concat([ic + (ic > 0 ? -9 : 9)]).forEach(function (lat) { if (M.abs(lat - ic) < 4) return; for (var lo = -70; lo <= 40; lo += 22) { var wv = windAt(lat), a = G.p(lo, lat), b = G.p(lo + wv[0] * 12, lat + wv[1] * 12); if (a[2] < 0.1 || b[2] < 0.1) continue; arrow(ctx, a[0], a[1], b[0], b[1], { color: k.ink, w: 1.8, head: 7 }); } });
        if (!F.quiet && !LT) { var LB = labeler(ctx); [[15, 'trade winds'], [-15, 'trade winds'], [45, 'westerlies'], [-45, 'westerlies'], [74, 'polar easterlies'], [-74, 'polar easterlies']].forEach(function (q) { var pp = G.p(-20, q[0] + (q[0] > 0 ? 6 : -6)); LB.put(q[1], pp[0] + gR * 0.32, pp[1], { size: 10.5, color: k.ink, bold: true, halo: k.halo, align: 'left' }); }); }
        if (LT) [[15, 0], [45, 1], [74, 2]].forEach(function (q) { var pp = G.p(30, q[0]); badge(ctx, LETTERS[q[1]], pp[0], pp[1], { k: k, r: 10 }); });
        // --- the pole-to-pole slice: three cells each side
        var c = chart(ctx, k, sr, { x: { min: -90, max: 90, ticks: [-90, -60, -30, 0, 30, 60, 90], label: wide ? 'Latitude' : '', fmt: function (v) { return v === 0 ? '0°' : M.abs(v) + '°' + (v > 0 ? 'N' : 'S'); } }, y: { min: 0, max: 18, step: 6, label: 'km', lpad: 26 } });
        var tp = function (lat) { return 16 - 8 * M.pow(M.sin(M.abs(lat) * RAD), 2); };
        line(ctx, Array.from({ length: 91 }, function (_, i) { var la = -90 + i * 2; return [c.X(la), c.Y(tp(la))]; }), { color: k.muted, w: 1.2, dash: [5, 4] });
        var edges = [-90, -60 + sh * 0.5, -30 + sh, ic, 30 + sh, 60 + sh * 0.5, 90];
        for (var ci = 0; ci < 6; ci++) {
          var a0 = edges[ci], a1 = edges[ci + 1]; // cells 0…5 from the south pole
          // rising at the ITCZ and at 60°, sinking at 30° and the poles
          var rises = function (lat) { return M.abs(lat - ic) < 1 || M.abs(M.abs(lat - sh * 0.5) - 60) < 1.5; };
          var r0 = rises(a0), xa = c.X(a0) + 8, xb = c.X(a1) - 8, top = c.Y(M.min(tp(a0), tp(a1)) - 2.5), bot = c.Y(1.2), col = ci === 2 || ci === 3 ? k.red : ci === 1 || ci === 4 ? k.green : k.blue;
          // loop: up at the rising edge, across the top, down at the sinking edge, back along the ground
          var xu = r0 ? xa : xb, xd = r0 ? xb : xa;
          ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xd, top); ctx.lineTo(xd, bot); ctx.lineTo(xu, bot); ctx.lineTo(xu, top); ctx.lineTo(xd, top); ctx.stroke(); ctx.restore();
          arrowHead(ctx, xu, (top + bot) / 2, -PI / 2, 8, col); arrowHead(ctx, xd, (top + bot) / 2, PI / 2, 8, col); arrowHead(ctx, (xu + xd) / 2, top, xd > xu ? 0 : PI, 8, col); arrowHead(ctx, (xu + xd) / 2, bot, xd > xu ? PI : 0, 8, col);
          if (!F.quiet && sr.w > 300) txt(ctx, ['polar', 'Ferrel', 'Hadley', 'Hadley', 'Ferrel', 'polar'][ci], (xa + xb) / 2, (top + bot) / 2, { size: 10, color: col, bold: true, align: 'center', halo: k.halo });
        }
        // rain where air rises, dry where it sinks
        [ic, 60 + sh * 0.5, -60 + sh * 0.5].forEach(function (la, i) { for (var d = 0; d < (i ? 4 : 7); d++) line(ctx, [[c.X(la) - 10 + d * 4, c.Y(3)], [c.X(la) - 12 + d * 4, c.Y(1)]], { color: k.blue, w: 1.2 }); });
        if (!F.quiet && sr.w > 300) [30 + sh, -30 + sh].forEach(function (la) { txt(ctx, 'dry', c.X(la), c.Y(0.4), { size: 10, color: k.orange, bold: true, align: 'center', base: 'bottom' }); });
        if (!F.quiet) txt(ctx, 'rain belt in ' + EM.months[S.m - 1] + ': ' + fm(M.abs(ic), 0) + '°' + (ic >= 0 ? 'N' : 'S'), sr.x + 4, sr.y - 10, { size: 11, color: k.ink, bold: true });
        // --- jet streams on a polar map
        if (S.jets) {
          var pr = wide ? M.min(w * 0.16, h * 0.2) : M.min(w * 0.42, h * 0.16), pc = wide ? [w * 0.77, h * 0.76] : [w / 2, sr.y + sr.h + 40 + pr], P2 = globeProj(-90, 90, pc[0], pc[1], pr);
          circle(ctx, pc[0], pc[1], pr, k.dark ? '#1d4a6b' : '#bcd9ee'); globeLand(ctx, P2, k.dark ? '#5a7a4c' : '#cfe0b8', null);
          var jet = function (lon, base, amp, nw) { return base + amp * M.sin(nw * lon * RAD + S.ph * 3); };
          var pj = [], sj = []; for (var lo2 = -180; lo2 <= 180; lo2 += 3) { pj.push([lo2, jet(lo2, 52, 11, S.waves)]); sj.push([lo2, jet(lo2 + 40, 30, 3, S.waves + 1)]); }
          globeLine(ctx, P2, pj, { color: k.purple, w: 4 }); globeLine(ctx, P2, sj, { color: k.orange, w: 3 });
          // troughs (dips toward the equator) and ridges
          if (!F.quiet) for (var wv2 = 0; wv2 < S.waves; wv2++) { var lt = (270 / S.waves + wv2 * 360 / S.waves - S.ph * 3 * DEG / S.waves), lr = lt + 180 / S.waves, qa = P2.p(lt, jet(lt, 52, 11, S.waves) - 6), qb = P2.p(lr, jet(lr, 52, 11, S.waves) + 6); txt(ctx, 'T', qa[0], qa[1], { size: 11, color: k.purple, bold: true, align: 'center', halo: k.halo }); txt(ctx, 'R', qb[0], qb[1], { size: 11, color: k.purple, bold: true, align: 'center', halo: k.halo }); }
          txt(ctx, 'Jet streams seen from above the North Pole', pc[0], pc[1] - pr - 12, { size: 11.5, color: k.ink, bold: true, align: 'center' });
          F.legend([{ c: k.red, t: 'low-pressure belt', line: true }, { c: k.blue, t: 'high-pressure belt', dash: true }, { c: k.purple, t: 'polar jet (T trough, R ridge)', line: true }, { c: k.orange, t: 'subtropical jet', line: true }]);
        } else F.legend([{ c: k.red, t: 'low-pressure belt', line: true }, { c: k.blue, t: 'high-pressure belt', dash: true }]);
        F.alt('A globe with the surface wind belts and pressure belts, a pole-to-pole slice of the Hadley, Ferrel and polar cells' + (S.jets ? ', and a polar map of the wavy jet streams.' : '.'));
        F.say('Air rises where the Sun heats the equator most (a belt of rain that follows the Sun north and south through the year), spreads poleward high up, and sinks near 30°, where the dry, sinking air makes the great deserts: they are dry because of sinking air, not because they are closer to the Sun. Along the ground, Coriolis turns the returning air into the trade winds, the westerlies and the polar easterlies. The polar jet stream meanders in waves: troughs bring cold air south, ridges bring warm air north.', 'Rising air brings rain; sinking air near 30° makes deserts.');
      };
    }
  });

  // a puffy cloud: overlapping circles filling an ellipse (rw, rh: half sizes); flat: a sheet-like anvil
  function puffCloud(ctx, x, y, rw, rh, col, seed, flat) {
    var r = rng(seed || 1), n = flat ? M.max(9, M.ceil(2 * rw / (rh * 1.1))) : M.max(6, M.round(rh / rw * 6) + 4); ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.95;
    if (flat) { ctx.beginPath(); ctx.ellipse(x, y, rw, rh * 0.8, 0, 0, TAU); ctx.fill(); }
    for (var i = 0; i < n; i++) { var t = n > 1 ? i / (n - 1) : 0.5, px = flat ? x - rw + 2 * rw * t : x + (r() - 0.5) * rw * 0.9, py = flat ? y + (r() - 0.5) * rh * 0.6 : y + rh - 2 * rh * t * 0.95, pr = flat ? rh * (0.8 + r() * 0.5) : rw * (0.55 + r() * 0.35); ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fill(); }
    if (!flat) { ctx.beginPath(); ctx.rect(x - rw * 0.9, y + rh - rw * 0.3, rw * 1.8, rw * 0.3); ctx.fill(); }
    ctx.restore();
  }

  /* es-weather-map: Weather Maps.
     opts:
       mode: 'station' | 'map' | 'section' | 'meteogram' | 'cyclone'      modes: true or a list for tabs
       station: {T, Td, p (hPa), tend (hPa in 3 h), dir (from, degrees), kt, cover (eighths 0–8, 9 hidden), wx ('none' | 'rain' |
         'drizzle' | 'snow' | 'showers' | 'thunderstorm' | 'fog' | 'haze' | 'freezing')}
       units: 'F' (°F, inches; default, as on U.S. maps) | 'C' (°C, mm). Wind is always in knots.
       front: 'cold' | 'warm' | 'occluded' | 'stationary' (section; meteogram uses cold or warm); hours: the map's time step in hours
         (map, 0–48) or the meteogram's length (24–72); stage: 1–6 (cyclone)
       letters: true (lettered points A–C on the map, letters on the section); quiet: hides decoded values, front names and stage names; lock */
  R('es-weather-map', function (el, o) {
    var F = frame(el, o, 'Weather maps', { aspect: 1.6, max: 480 });
    var US = o.units !== 'C';
    function tShow(c) { return US ? fm(EM.cToF(c), 0) : fm(c, 0); }
    return F.modes({ station: station, map: map, section: section, meteogram: meteogram, cyclone: cyclone }, { station: 'Station model', map: 'Surface map', section: 'Front cross-section', meteogram: 'Meteogram', cyclone: 'Life of a storm' });

    // one plotted station: T and Td in °C, p in hPa
    function plotStation(ctx, k, x, y, st, s, o2) {
      o2 = o2 || {}; s = s || 1; var r = 7 * s, ink = o2.ink || k.ink;
      windBarb(ctx, x, y, st.dir, st.kt, { len: 30 * s, r0: r, color: ink, w: 1.4 * s });
      skyCover(ctx, x, y, r, st.cover, ink, k.bg);
      var fs = 11 * s;
      txt(ctx, tShow(st.T), x - r - 4 * s, y - 10 * s, { size: fs, color: k.red, align: 'right', bold: true, halo: o2.halo });
      txt(ctx, tShow(st.Td), x - r - 4 * s, y + 11 * s, { size: fs, color: k.green, align: 'right', bold: true, halo: o2.halo });
      if (st.wx && st.wx !== 'none') wxSymbol(ctx, st.wx, x - r - 15 * s - (tShow(st.T).length > 2 ? 6 * s : 0), y + 0.5, ink, 0.75 * s);
      if (o2.full) { txt(ctx, EM.pcode(st.p), x + r + 4 * s, y - 10 * s, { size: fs, color: k.blue, bold: true, halo: o2.halo }); var tc = M.round(M.abs(st.tend) * 10); txt(ctx, (st.tend >= 0 ? '+' : '−') + (tc < 10 ? '0' : '') + tc, x + r + 4 * s, y + 11 * s, { size: fs, color: k.blue, bold: true, halo: o2.halo }); var tx = x + r + 4 * s + tw(ctx, '+12', { size: fs, bold: true }) + 5 * s; line(ctx, st.tend >= 0 ? [[tx, y + 15 * s], [tx + 8 * s, y + 7 * s]] : [[tx, y + 7 * s], [tx + 8 * s, y + 15 * s]], { color: k.blue, w: 1.6 }); }
      else if (o2.code) txt(ctx, EM.pcode(st.p), x + r + 3 * s, y - 9 * s, { size: fs * 0.9, color: k.blue, halo: o2.halo });
    }

    function station(F) {
      F.size({ aspect: 1.7, max: 400, narrow: 0.75 });
      var q = o.station || {}, st = { T: q.T != null ? (US ? EM.fToC(num(q.T, 72)) : num(q.T, 22)) : 22, Td: q.Td != null ? (US ? EM.fToC(num(q.Td, 58)) : num(q.Td, 14)) : 14.5, p: num(q.p, 1013.8), tend: num(q.tend, 1.2), dir: num(q.dir, 315), kt: num(q.kt, 15), cover: q.cover != null ? +q.cover : 6, wx: q.wx || 'none' };
      var row1 = F.ctl, row2 = F.row();
      V.slider(row1, { label: 'Temperature', min: US ? -20 : -30, max: US ? 110 : 45, step: 1, value: M.round(US ? EM.cToF(st.T) : st.T), fmt: function (v) { return v + (US ? ' °F' : ' °C'); }, input: function (v) { st.T = US ? EM.fToC(v) : v; if (st.Td > st.T) st.Td = st.T; F.redraw(); } });
      V.slider(row1, { label: 'Dew point', min: US ? -30 : -35, max: US ? 85 : 30, step: 1, value: M.round(US ? EM.cToF(st.Td) : st.Td), fmt: function (v) { return v + (US ? ' °F' : ' °C'); }, input: function (v) { st.Td = M.min(st.T, US ? EM.fToC(v) : v); F.redraw(); } });
      V.slider(row1, { label: 'Sea-level pressure', min: 960, max: 1050, step: 0.1, value: st.p, fmt: function (v) { return fm(v, 1) + ' hPa'; }, input: function (v) { st.p = v; F.redraw(); } });
      V.slider(row2, { label: 'Wind from', min: 0, max: 350, step: 10, value: st.dir, fmt: function (v) { return v + '° (' + compass(v) + ')'; }, input: function (v) { st.dir = v; F.redraw(); } });
      V.slider(row2, { label: 'Wind speed', min: 0, max: 75, step: 5, value: st.kt, fmt: function (v) { return v + ' kt'; }, input: function (v) { st.kt = v; F.redraw(); } });
      V.slider(row2, { label: '3-hour change', min: -5, max: 5, step: 0.1, value: st.tend, fmt: function (v) { return (v > 0 ? '+' : '') + fm(v, 1) + ' hPa'; }, input: function (v) { st.tend = v; F.redraw(); } });
      var row3 = F.row(); select(row3, 'Sky cover', COVER.map(function (c) { return [String(c[0]), c[1]]; }), String(st.cover), function (v) { st.cover = +v; F.redraw(); }); select(row3, 'Weather', Object.keys(WX).map(function (kk) { return [kk, kk === 'none' ? 'none' : WX[kk]]; }), st.wx, function (v) { st.wx = v; F.redraw(); });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 560, s = wide ? 2.6 : 2.1, cx = wide ? w * 0.27 : w / 2, cy = wide ? h / 2 : h * 0.3;
        plotStation(ctx, k, cx, cy, st, s, { full: true });
        // decode panel
        var px = wide ? w * 0.52 : 14, py = wide ? 28 : h * 0.58, lh = wide ? 26 : 20, Q = F.quiet;
        var rows = [['Temperature (upper left)', tShow(st.T) + (US ? ' °F' : ' °C'), k.red], ['Dew point (lower left)', tShow(st.Td) + (US ? ' °F' : ' °C'), k.green], ['Pressure code ' + EM.pcode(st.p) + ' (upper right)', fm(EM.pdecode(EM.pcode(st.p)), 1) + ' hPa', k.blue], ['3-hour change (lower right)', (st.tend >= 0 ? 'rose ' : 'fell ') + fm(M.abs(st.tend), 1) + ' hPa', k.blue], ['Wind (barbs)', st.kt < 5 ? 'calm' : 'from the ' + compass(st.dir) + ' at ' + (M.round(st.kt / 5) * 5) + ' kt', k.ink], ['Sky cover (circle)', COVER.filter(function (c) { return c[0] === st.cover; })[0][1], k.ink], ['Weather (left of the circle)', st.wx === 'none' ? 'none' : WX[st.wx], k.ink]];
        rows.forEach(function (rw, i) { txt(ctx, rw[0], px, py + i * lh, { size: wide ? 11.5 : 10.5, color: k.muted }); txt(ctx, Q ? '?' : rw[1], wide ? w - 14 : w - 14, py + i * lh, { size: wide ? 13 : 11.5, color: rw[2], bold: true, align: 'right' }); });
        if (!Q) txt(ctx, 'Code: ' + EM.pcode(st.p) + (+EM.pcode(st.p) >= 500 ? ' ≥ 500, so put 9 in front: 9' : ' < 500, so put 10 in front: 10') + EM.pcode(st.p).slice(0, 2) + '.' + EM.pcode(st.p).slice(2), px, py + rows.length * lh + 4, { size: 10.5, color: k.muted });
        txt(ctx, 'Barbs: half = 5 kt, full = 10 kt, pennant = 50 kt', px, py + rows.length * lh + 22, { size: 10.5, color: k.muted });
        F.alt('A station model: ' + (Q ? 'the values are hidden.' : 'temperature ' + tShow(st.T) + ', dew point ' + tShow(st.Td) + ', pressure code ' + EM.pcode(st.p) + ', wind from the ' + compass(st.dir) + ' at ' + st.kt + ' knots, sky ' + COVER.filter(function (c) { return c[0] === st.cover; })[0][1] + '.'));
        F.say('The pressure code keeps the last three digits of the sea-level pressure in tenths: ' + (Q ? '' : '<b>' + EM.pcode(st.p) + ' → ' + fm(EM.pdecode(EM.pcode(st.p)), 1) + ' hPa</b>. ') + 'The wind barb’s shaft points to where the wind comes <b>from</b> (it flies like a flag tail toward the station), not where it’s going.', 'Decode the station model.');
      };
    }

    function map(F) {
      F.size({ aspect: 1.6, max: 500, narrow: 1.15 });
      var S = { t: clamp(num(o.hours, 0), 0, 48), sel: null }, geo = null, LT = F.letters;
      var tl = V.slider(F.ctl, { label: 'Time', min: 0, max: 48, step: 3, value: S.t, fmt: function (v) { return v ? '+' + v + ' h' : 'now'; }, input: function (v) { S.t = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { S.t = M.min(48, S.t + dt * 8); tl.set(M.round(S.t / 3) * 3); F.redraw(); if (S.t >= 48) return false; }, { label: 'Move the storm', reset: function () { if (S.t >= 48) S.t = 0; } });
      F.drag({ hit: function () { return 'p'; }, start: function (h, x, y) { S.sel = [x / geo.w, y / geo.h]; F.redraw(); }, move: function () { }, touch: 'pan-y' });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; S.sel = S.sel || [0.5, 0.5]; S.sel[0] = clamp(S.sel[0] + a[0] * 0.03, 0, 1); S.sel[1] = clamp(S.sel[1] + a[1] * 0.03, 0, 1); F.redraw(); return true; }, 'Tap the map (or use the arrow keys) to read the wind and what is coming at that spot.');
      // the storm's layout in fractions of the map at time t (hours)
      function storm(t) {
        var L = [0.36 + 0.0055 * t, 0.36 - 0.0012 * t], occ = M.max(0, (t - 24) / 24) * 0.09, TP = [L[0] + occ * 0.75, L[1] + occ * 0.85];
        var wf = [[0, 0], [0.06, 0.03], [0.13, 0.06], [0.21, 0.07], [0.3, 0.07]].map(function (p) { return [TP[0] + p[0], TP[1] + p[1]]; });
        var cf = [[0, 0], [-0.03, 0.07], [-0.07, 0.15], [-0.12, 0.25], [-0.16, 0.36], [-0.19, 0.5]].map(function (p) { return [TP[0] + p[0] + t * 0.0012 * p[1] * 3, TP[1] + p[1]]; });
        return { L: L, TP: TP, wf: wf, cf: cf, occ: occ > 0.005 ? [L, [L[0] + (TP[0] - L[0]) * 0.5 + 0.01, L[1] + (TP[1] - L[1]) * 0.5], TP] : null, depth: 18 + 4 * M.min(1, t / 24) - (t > 36 ? (t - 36) * 0.4 : 0) };
      }
      function distSeg(p, a, b, ax) { var dx = (b[0] - a[0]) * ax, dy = b[1] - a[1], L2 = dx * dx + dy * dy, t = L2 ? clamp(((p[0] - a[0]) * ax * dx + (p[1] - a[1]) * dy) / L2, 0, 1) : 0, ex = (a[0] - p[0]) * ax + t * dx, ey = a[1] - p[1] + t * dy; return M.hypot(ex, ey); }
      function distLine(p, pts, ax) { var d = 9; for (var i = 1; i < pts.length; i++) d = M.min(d, distSeg(p, pts[i - 1], pts[i], ax)); return d; }
      // which side of a polyline (+1 right of travel, screen coordinates)
      function side(p, pts, ax) { var best = 9, sg = 0; for (var i = 1; i < pts.length; i++) { var d = distSeg(p, pts[i - 1], pts[i], ax); if (d < best) { best = d; var a = pts[i - 1], b = pts[i]; sg = M.sign((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])); } } return sg; }
      function region(p, Sm) { // 'cold' behind the cold front, 'warm' sector, 'ahead' of the warm front, 'north' of the low
        var bwf = p[0] > Sm.TP[0] - 0.02 ? (p[1] > interp(Sm.wf, p[0]) ? 'south' : 'north') : null; // y down: larger y is south
        var westOfCF = p[1] > Sm.TP[1] ? p[0] < interp(Sm.cf.map(function (q) { return [q[1], q[0]]; }), p[1]) : p[0] < Sm.L[0];
        if (p[1] > Sm.TP[1] - 0.01 && westOfCF) return 'cold';
        if (bwf === 'south' && !westOfCF) return 'warm';
        if (bwf === 'north' && p[0] > Sm.L[0]) return 'ahead';
        return p[0] < Sm.L[0] ? (p[1] < Sm.L[1] ? 'north' : 'cold') : 'north';
      }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, ax = w / h, Sm = storm(S.t); geo = { w: w, h: h };
        function pf(x, y) { // pressure in hPa at fractions (x, y)
          var dl = ((x - Sm.L[0]) * ax) * ((x - Sm.L[0]) * ax) + (y - Sm.L[1]) * (y - Sm.L[1]);
          var p = 1016 - Sm.depth * M.exp(-dl / 0.09) + 12 * M.exp(-(((x - 0.06) * ax) * ((x - 0.06) * ax) + (y - 0.3) * (y - 0.3)) / 0.12) + 9 * M.exp(-(((x - 1.0) * ax) * ((x - 1.0) * ax) + (y - 0.3) * (y - 0.3)) / 0.1);
          var df = M.min(distLine([x, y], Sm.cf, ax), distLine([x, y], Sm.wf, ax)); p -= 3.5 * M.exp(-df * df / 0.0025); return p;
        }
        ctx.fillStyle = k.dark ? '#172a22' : '#f6f8f4'; ctx.fillRect(0, 0, w, h);
        // precipitation: a narrow band along the cold front, a wide band ahead (north) of the warm front, and around the low
        var img = ctx.createImageData(M.ceil(w / 4), M.ceil(h / 4)), dpr = 4;
        for (var j = 0; j < img.height; j++) for (var i = 0; i < img.width; i++) {
          var fx = i * dpr / w, fy = j * dpr / h, dc = distLine([fx, fy], Sm.cf, ax), dw = distLine([fx, fy], Sm.wf, ax), aheadW = fy < interp(Sm.wf, fx) && fx > Sm.TP[0] - 0.05, dL = M.hypot((fx - Sm.L[0]) * ax, fy - Sm.L[1]);
          var pr = M.max(dc < 0.035 ? 1 - dc / 0.035 : 0, aheadW && dw < 0.16 ? 0.8 * (1 - dw / 0.16) : 0, dL < 0.12 ? 0.7 * (1 - dL / 0.12) : 0, Sm.occ && distLine([fx, fy], Sm.occ, ax) < 0.06 ? 0.7 : 0);
          var id = (j * img.width + i) * 4; if (pr > 0.05) { img.data[id] = 60; img.data[id + 1] = 170; img.data[id + 2] = 90; img.data[id + 3] = M.round(150 * pr); }
        }
        var tmp = D.createElement('canvas'); tmp.width = img.width; tmp.height = img.height; tmp.getContext('2d').putImageData(img, 0, 0); ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(tmp, 0, 0, w, h); ctx.restore();
        var G = gridField(function (px, py) { return pf(px / w, py / h); }, w, h, 110), lv = []; for (var q = 984; q <= 1036; q += 4) lv.push(q);
        drawContours(ctx, G, lv, { color: k.dark ? '#8fb3c6' : '#64808f', w: 1.2, label: function (l) { return String(l); }, at: 0.85, halo: k.halo, labelColor: k.muted });
        function P(pts) { return pts.map(function (p) { return [p[0] * w, p[1] * h]; }); }
        frontLine(ctx, P(Sm.cf), 'cold', -1, { size: 8, gap: 30 }); frontLine(ctx, P(Sm.wf), 'warm', -1, { size: 8, gap: 30 }); if (Sm.occ) frontLine(ctx, P(Sm.occ), 'occluded', -1, { size: 7, gap: 22 });
        txt(ctx, 'L', Sm.L[0] * w, Sm.L[1] * h, { size: 26, color: k.red, bold: true, align: 'center', halo: k.halo }); txt(ctx, 'H', 0.06 * w, 0.3 * h, { size: 26, color: k.blue, bold: true, align: 'center', halo: k.halo }); txt(ctx, 'H', 0.97 * w, 0.3 * h, { size: 26, color: k.blue, bold: true, align: 'center', halo: k.halo });
        // stations: wind from the pressure pattern (turned toward the low by friction), temperatures from the air mass
        function stAt(p) {
          var e = 0.004, gx = (pf(p[0] + e, p[1]) - pf(p[0] - e, p[1])) / (2 * e * ax), gy = (pf(p[0], p[1] + e) - pf(p[0], p[1] - e)) / (2 * e), gm = M.hypot(gx, gy) || 1, dn = [-gx / gm, -gy / gm], a = 60 * RAD, v = [dn[0] * M.cos(a) - dn[1] * M.sin(a), dn[0] * M.sin(a) + dn[1] * M.cos(a)];
          var to = M.atan2(v[0], -v[1]) * DEG, rg = region(p, Sm), mass = { warm: [24, 20, 4, 'none'], ahead: [12, 10, 8, 'rain'], cold: [7, -3, 2, 'none'], north: [4, 1, 8, 'drizzle'] }[rg];
          var nearCF = distLine(p, Sm.cf, ax) < 0.035; if (nearCF) mass = [mass[0], mass[1], 8, 'thunderstorm'];
          return { T: mass[0], Td: mass[1], p: pf(p[0], p[1]), tend: 0, dir: wrap360(to + 180), kt: clamp(M.round(gm * 0.25 / 5) * 5, 5, 35), cover: mass[2], wx: mass[3], region: rg };
        }
        var spots = [[0.14, 0.62], [0.3, 0.8], [0.52, 0.64], [0.68, 0.84], [0.7, 0.3], [0.88, 0.5], [0.4, 0.14], [0.9, 0.84]];
        if (w >= 560) spots.forEach(function (sp) { var st = stAt(sp); plotStation(ctx, k, sp[0] * w, sp[1] * h, st, 0.9, { halo: k.halo }); });
        if (LT) [[0.47, 0.7], [0.62, 0.22], [0.22, 0.75]].forEach(function (sp, i) { var px = sp[0] * w, py = sp[1] * h; circle(ctx, px, py, 4, k.ink); badge(ctx, LETTERS[i], px + 14, py - 12, { k: k, r: 10 }); });
        if (!F.quiet && !LT) { var mk2 = function (s, p, col) { var tw2 = tw(ctx, s, { size: 11, bold: true }); txt(ctx, s, clamp(p[0] * w, tw2 / 2 + 3, w - tw2 / 2 - 3), p[1] * h, { size: 11, color: col, bold: true, align: 'center', halo: k.halo }); }; mk2('warm, humid air (mT)', [Sm.TP[0] + 0.12, Sm.TP[1] + 0.24], k.red); mk2('cold, dry air (cP)', [Sm.TP[0] - 0.28, Sm.TP[1] + 0.1], k.blue); mk2('cold front', [Sm.cf[3][0] - 0.07, Sm.cf[3][1]], k.blue); mk2('warm front', [Sm.wf[3][0], Sm.wf[3][1] - 0.06], k.red); if (Sm.occ) mk2('occluded', [Sm.L[0] - 0.02, Sm.L[1] - 0.06], k.purple); }
        // the tapped point
        var sel = S.sel, info = '';
        if (sel) {
          var st2 = stAt(sel), rg = st2.region; circle(ctx, sel[0] * w, sel[1] * h, 9, null, k.rust, 2.5); arrow(ctx, sel[0] * w - 26 * M.sin(st2.dir * RAD), sel[1] * h + 26 * M.cos(st2.dir * RAD), sel[0] * w - 4 * M.sin(st2.dir * RAD), sel[1] * h + 4 * M.cos(st2.dir * RAD), { color: k.rust, w: 2.4, head: 8 });
          var next = { warm: 'Warm, humid air in the warm sector. The cold front is coming from the west: a line of showers or thunderstorms, then the wind shifts to the northwest, the temperature and dew point drop and the pressure rises.', ahead: 'Cool air ahead of the warm front: thickening clouds and steady rain. When the warm front passes, the rain stops, the temperature and dew point rise and the wind turns to the south.', cold: 'Cold, dry air behind the cold front: clearing skies, cooler and drier, with northwest winds and rising pressure.', north: 'Cool air north of the low: clouds and rain (or snow in winter) with east or northeast winds as the low passes to the south.' }[rg];
          info = 'Wind <b>from the ' + compass(st2.dir) + '</b> (it blows ' + (rg === 'cold' ? 'out of the cold air' : 'around the low') + '). ' + next;
        }
        F.alt('A surface weather map: isobars every 4 hPa, a low with a cold front and a warm front' + (Sm.occ ? ' and an occluded front' : '') + ', highs to the west and east, precipitation shaded green' + (LT ? ', and lettered points A, B and C.' : '.'));
        F.say(info || 'Isobars every 4 hPa; wind blows counterclockwise around the low and crosses the isobars toward it. Weather systems in the middle latitudes move mostly from west to east, so the weather to the west is a preview. Tap a spot to see its wind and what is coming.', 'Tap a spot to read its wind.');
        F.legend([{ c: '#1c6fd6', t: 'cold front' }, { c: '#e03131', t: 'warm front' }, { c: '#9c36b5', t: 'occluded front' }, { c: 'rgba(60,170,90,0.6)', t: 'precipitation' }]);
      };
    }

    function section(F) {
      F.size({ aspect: 2.0, max: 420, narrow: 0.95 });
      var fr = ['cold', 'warm', 'occluded', 'stationary'].indexOf(o.front) >= 0 ? o.front : 'cold', t = 0, LT = F.letters;
      if (!F.lock) V.seg(F.ctl, { label: 'Front', items: [['cold', 'Cold'], ['warm', 'Warm'], ['occluded', 'Occluded'], ['stationary', 'Stationary']], value: fr, change: function (v) { fr = v; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { t += dt; F.redraw(); }, { label: 'Animate' });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, g = h - 26, top = 16, kmH = (g - top) / 10, LB = labeler(ctx), lab = [];
        var sky = ctx.createLinearGradient(0, 0, 0, g); sky.addColorStop(0, k.sky2); sky.addColorStop(1, k.sky); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, g);
        ctx.fillStyle = k.landDark; ctx.fillRect(0, g, w, h - g);
        function Y(km) { return g - km * kmH; }
        var cold = k.dark ? 'rgba(116,192,252,0.25)' : 'rgba(28,111,214,0.16)', warmC = k.dark ? 'rgba(255,135,135,0.22)' : 'rgba(224,49,49,0.12)';
        var mv = (t * 6) % 24, cloud = function (x, y, rx, ry, col) { ctx.save(); ctx.fillStyle = col || k.cloud; ctx.globalAlpha = 0.92; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill(); ctx.restore(); };
        function rain(x0, x1, y0, dens) { for (var x = x0; x < x1; x += dens) line(ctx, [[x, y0], [x - 4, g]], { color: rgba(k.blue, 0.55), w: 1.2 }); }
        var SHORT = { 'cumulonimbus: heavy showers, thunderstorms, a narrow band': 'cumulonimbus: heavy showers', 'cold, dry air (cP) pushes in and lifts the warm air fast': 'cold air (cP) lifts warm air', 'stationary front: the air masses push side by side; neither wins, so clouds and rain can last for days': 'stationary front: rain can linger for days', 'warm, humid air (mT) glides up over the cold air': 'warm air (mT) glides up', 'gentle front (drawn far steeper than it is)': 'gentle front (drawn steeper)', 'nimbostratus: steady rain': 'nimbostratus' };
        function name(s, x, y, col) { if (!F.quiet && !LT) lab.push([w < 560 && SHORT[s] ? SHORT[s] : s, x, y, col]); }
        if (fr === 'cold' || fr === 'stationary') {
          var fx = w * 0.42 + (fr === 'cold' ? mv : 0), slope = fr === 'cold' ? 0.9 : 0.25; // km per % of width
          var front = function (x) { return M.max(0, (fx - x) / w * 100 * slope * 0.12); };
          if (fr === 'stationary') front = function (x) { return M.max(0, (x - fx) / w * 100 * 0.06); };
          ctx.fillStyle = warmC; ctx.fillRect(0, top, w, g - top);
          ctx.beginPath(); ctx.moveTo(fr === 'cold' ? 0 : w, g); for (var x = 0; x <= w; x += 4) ctx.lineTo(x, Y(M.min(10, front(x)))); ctx.lineTo(fr === 'cold' ? 0 : w, g); ctx.closePath(); ctx.fillStyle = cold; ctx.fill();
          line(ctx, Array.from({ length: M.ceil(w / 4) + 1 }, function (_, i) { return [i * 4, Y(M.min(10, front(i * 4)))]; }).filter(function (p) { return p[1] < g; }), { color: fr === 'cold' ? '#1c6fd6' : '#9c36b5', w: 3 });
          if (fr === 'cold') {
            // a cumulonimbus at the front: warm air shoved up steeply
            var cb = fx + 20; puffCloud(ctx, cb + 50, Y(9.6), 110, kmH * 0.45, k.cloud, 3, true); puffCloud(ctx, cb, Y(5.4), 40, kmH * 4.0, k.cloud, 5); rain(cb - 30, cb + 30, Y(1.5), 6); cloud(cb, Y(2), 50, kmH * 1.1, k.dark ? '#8a96a0' : '#c7ced4');
            arrow(ctx, fx + 70, Y(0.6), fx + 34, Y(2.6), { color: k.red, w: 2.4, head: 9 }); arrow(ctx, fx - 120, Y(0.6), fx - 60, Y(0.6), { color: k.blue, w: 2.4, head: 9 });
            name('cumulonimbus: heavy showers, thunderstorms, a narrow band', cb + 52, Y(7.2), k.ink); name('cold, dry air (cP) pushes in and lifts the warm air fast', fx - 160, Y(1.6), k.blue); name('warm, humid air (mT)', w * 0.8, Y(2.5), k.red); name('front moves this way →', fx - 110, Y(0.25), k.ink); name('steep front', fx - 60, Y(3.4), '#1c6fd6');
            if (LT) { badge(ctx, 'A', fx - 140, Y(3), { k: k }); badge(ctx, 'B', w * 0.8, Y(4), { k: k }); badge(ctx, 'C', cb, Y(5.5), { k: k }); }
          } else {
            for (var c2 = 0; c2 < 4; c2++) cloud(fx + 60 + c2 * 90, Y(1.5 + c2 * 1.4), 70, kmH * 0.5); rain(fx + 30, fx + 200, Y(1.2), 9);
            name('stationary front: the air masses push side by side; neither wins, so clouds and rain can last for days', 16, Y(9.2), k.ink); name('cold air (cP)', w * 0.8, Y(0.5), k.blue); name('warm air (mT)', 20, Y(3), k.red);
          }
        } else if (fr === 'warm') {
          var wx0 = w * 0.18 + mv, wslope = 0.035; // gentle: about 1 km up per 30 km sideways (shown much steeper)
          var wfront = function (x) { return M.max(0, (x - wx0) / w * 100 * wslope * 2.2); };
          ctx.fillStyle = warmC; ctx.fillRect(0, top, w, g - top);
          ctx.beginPath(); ctx.moveTo(wx0, g); for (var x2 = wx0; x2 <= w; x2 += 4) ctx.lineTo(x2, Y(M.min(10, wfront(x2)))); ctx.lineTo(w, g); ctx.closePath(); ctx.fillStyle = cold; ctx.fill();
          line(ctx, Array.from({ length: 101 }, function (_, i) { var xx = wx0 + i / 100 * (w - wx0); return [xx, Y(M.min(10, wfront(xx)))]; }), { color: '#e03131', w: 3 });
          // the cloud sequence ahead of the front, lowering and thickening toward it
          var seq = [['nimbostratus: steady rain', 0.12, 1.2, 2.2, 0], ['altostratus', 0.36, 3.6, 1.0, 1], ['cirrostratus', 0.58, 6.6, 0.6, 2], ['cirrus', 0.78, 9.2, 0.35, 3]];
          seq.forEach(function (sq) { var xx = wx0 + sq[1] * (w - wx0), yy = Y(sq[2] + sq[3] / 2); if (sq[4] === 3) { for (var s2 = 0; s2 < 5; s2++) line(ctx, [[xx - 40 + s2 * 18, yy + 4], [xx - 20 + s2 * 18, yy - 6]], { color: k.dark ? '#dee2e6' : '#adb5bd', w: 2 }); } else cloud(xx, yy, (w - wx0) * 0.13, kmH * sq[3] * 0.9, sq[4] === 0 ? (k.dark ? '#7a858e' : '#b8c0c7') : null); if (LT) badge(ctx, LETTERS[sq[4]], xx, yy - kmH * 0.9, { k: k }); else name(sq[0], xx - 30, yy - kmH * (sq[3] / 2 + 0.6), k.ink); });
          rain(wx0 + 10, wx0 + 0.24 * (w - wx0), Y(1.0), 9);
          arrow(ctx, wx0 - 80, Y(0.8), wx0 + 120, Y(3.4), { color: k.red, w: 2.4, head: 9 });
          name('warm, humid air (mT) glides up over the cold air', 14, Y(4.6), k.red); name('cold air (cP) ahead', w * 0.82, Y(0.5), k.blue); name('gentle front (drawn far steeper than it is)', wx0 + 40, Y(1.9), '#e03131'); name('front moves this way →', wx0 - 60, Y(0.25), k.ink);
        } else {
          // cold-type occlusion: cold air behind undercuts the cool air ahead; the warm air is lifted off the ground
          var ox = w * 0.45 + mv;
          ctx.fillStyle = warmC; ctx.fillRect(0, top, w, g - top);
          poly(ctx, [[0, g], [0, Y(10)], [ox - w * 0.08, Y(10)], [ox, Y(3.2)], [ox + 10, g]], k.dark ? 'rgba(116,192,252,0.35)' : 'rgba(28,111,214,0.26)');
          poly(ctx, [[ox + 10, g], [ox, Y(3.2)], [ox + w * 0.42, Y(9)], [w, Y(9.4)], [w, g]], cold);
          line(ctx, [[ox + 10, g], [ox, Y(3.2)]], { color: '#9c36b5', w: 3 }); line(ctx, [[ox, Y(3.2)], [ox + w * 0.42, Y(9)]], { color: '#e03131', w: 2.5 }); line(ctx, [[ox, Y(3.2)], [ox - w * 0.08, Y(10)]], { color: '#1c6fd6', w: 2.5 });
          puffCloud(ctx, ox + 30, Y(5), 70, kmH * 2.2, k.cloud, 7); rain(ox - 20, ox + 90, Y(2.6), 8);
          name('warm air (mT) lifted off the ground', ox - 60, Y(8.6), k.red); name('cold air', 20, Y(1.5), k.blue); name('cool air', w - 70, Y(1.5), k.blue); name('occluded front at the ground', ox + 18, Y(0.5), '#9c36b5');
        }
        // labels on top
        lab.forEach(function (L) { LB.put(L[0], clamp(L[1], 4, w - tw(ctx, L[0], { size: 11, bold: true }) - 4), L[2], { size: 11, color: L[3], bold: true, halo: k.halo }, [0, -14, 14, -28]); });
        // height scale
        for (var km = 0; km <= 10; km += 2) { line(ctx, [[w - 8, Y(km)], [w - 2, Y(km)]], { color: k.ink, w: 1 }); }
        txt(ctx, '10 km', w - 10, Y(10), { size: 9.5, color: k.muted, align: 'right' }); txt(ctx, 'sideways distance squeezed about 50 times', w - 10, h - 10, { size: 9.5, color: '#fff', align: 'right' });
        F.alt('A cross-section of a ' + (F.quiet ? '' : fr + ' ') + 'front: cold air, warm air, the sloping boundary between them, clouds and where the rain falls.');
        F.say({ cold: 'A cold front is steep: the dense cold air plows under the warm air and shoves it up fast, building tall cumulonimbus with a narrow band of heavy showers or thunderstorms. Behind it come cooler, drier air and clearing skies, not warmer weather.', warm: 'A warm front slopes gently: the warm air can’t push the denser cold air away along the ground, so it glides up over it. Clouds arrive in order, high to low (cirrus, cirrostratus, altostratus, then nimbostratus with a wide band of steady rain) for a day or more before the front passes.', occluded: 'An occluded front forms late in a storm’s life, when the faster cold front catches the warm front and lifts the warm air off the ground. It marks a mature storm that will soon weaken, not a new one.', stationary: 'A stationary front barely moves: the cold and warm air push side by side, and clouds and rain can linger along it for days.' }[fr], 'A front is the boundary between two air masses.');
      };
    }

    function meteogram(F) {
      F.size({ aspect: 1.25, max: 620, narrow: 0.62 });
      var fr = o.front === 'warm' ? 'warm' : 'cold', H = clamp(num(o.hours, 48), 24, 72);
      if (!F.lock && !F.quiet) V.seg(F.ctl, { label: 'Front', items: [['cold', 'Cold front passes'], ['warm', 'Warm front passes']], value: fr, change: function (v) { fr = v; F.redraw(); } });
      function series(hr) { // °C, hPa, wind {dir, kt}, precip mm/h
        var tp = H / 2, s = M.sin(2 * PI * (hr - 9) / 24), after = clamp((hr - tp) / 3, 0, 1), T, Td, p, dir, kt, pr = 0;
        if (fr === 'cold') { T = lerp(22 + 4 * s, 12 + 3 * s, after); Td = lerp(18, 4, clamp((hr - tp) / 4, 0, 1)); p = hr < tp ? 1012 - 0.17 * hr : M.min(1024, 1012 - 0.17 * tp + 0.45 * (hr - tp)); dir = hr < tp ? 200 : 310; kt = hr < tp ? 12 : M.abs(hr - tp) < 1.5 ? 30 : M.max(10, 22 - (hr - tp) * 0.4); if (hr > tp - 1.5 && hr < tp + 1.5) pr = 9 - 4 * M.abs(hr - tp); }
        else { T = lerp(7 + 2 * s, 18 + 3 * s, after); Td = lerp(5, 16, clamp((hr - tp) / 3, 0, 1)); p = hr < tp ? 1016 - 0.25 * hr : 1016 - 0.25 * tp - 0.02 * (hr - tp); dir = hr < tp ? 100 : 210; kt = hr < tp ? 10 : 12; if (hr > tp - 14 && hr < tp) pr = 1.2 + 0.8 * M.sin((hr - tp + 14) / 14 * PI); }
        return { T: T, Td: Td, p: p, dir: dir, kt: kt, pr: pr };
      }
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, x0 = 56, x1 = w - 14, ph = (h - 70) / 4, tp = H / 2, data = [];
        for (var hr = 0; hr <= H; hr += 0.5) data.push([hr, series(hr)]);
        var X = function (hr) { return x0 + (x1 - x0) * hr / H; };
        var panels = [{ y: 10, lab: US ? 'Temperature and dew point (°F)' : 'Temperature and dew point (°C)' }, { y: 10 + ph + 14, lab: 'Pressure (hPa)' }, { y: 10 + 2 * (ph + 14), lab: 'Wind' }, { y: 10 + 3 * (ph + 14), lab: US ? 'Precipitation (in/h)' : 'Precipitation (mm/h)' }];
        var Tv = data.map(function (d) { return US ? EM.cToF(d[1].T) : d[1].T; }), Dv = data.map(function (d) { return US ? EM.cToF(d[1].Td) : d[1].Td; }), tmin = M.floor(M.min.apply(null, Dv) / 10) * 10, tmax = M.ceil(M.max.apply(null, Tv) / 10) * 10;
        var c1 = chart(ctx, k, { x: x0, y: panels[0].y, w: x1 - x0, h: ph }, { x: { min: 0, max: H, step: 6, labels: false }, y: { min: tmin, max: tmax, step: niceStep(tmax - tmin, 3) } });
        line(ctx, data.map(function (d, i) { return [X(d[0]), c1.Y(Tv[i])]; }), { color: k.red, w: 2.4 }); line(ctx, data.map(function (d, i) { return [X(d[0]), c1.Y(Dv[i])]; }), { color: k.green, w: 2.4 });
        var pv = data.map(function (d) { return d[1].p; }), pmin = M.floor(M.min.apply(null, pv) - 1), pmax = M.ceil(M.max.apply(null, pv) + 1);
        var c2 = chart(ctx, k, { x: x0, y: panels[1].y, w: x1 - x0, h: ph }, { x: { min: 0, max: H, step: 6, labels: false }, y: { min: pmin, max: pmax, step: niceStep(pmax - pmin, 3) } });
        line(ctx, data.map(function (d) { return [X(d[0]), c2.Y(d[1].p)]; }), { color: k.blue, w: 2.4 });
        var c3 = chart(ctx, k, { x: x0, y: panels[2].y, w: x1 - x0, h: ph }, { x: { min: 0, max: H, step: 6, labels: false }, y: { min: 0, max: 1, labels: false, grid: false } });
        for (hr = 0; hr <= H; hr += 3) { var sd = series(hr); windBarb(ctx, X(hr), c3.Y(0.35), sd.dir, sd.kt, { len: M.min(30, ph * 0.5), r0: 2, color: k.ink, w: 1.3 }); circle(ctx, X(hr), c3.Y(0.35), 2, k.ink); }
        var prv = data.map(function (d) { return US ? d[1].pr / 25.4 : d[1].pr; }), prmax = US ? 0.4 : 10;
        var c4 = chart(ctx, k, { x: x0, y: panels[3].y, w: x1 - x0, h: ph }, { x: { min: 0, max: H, step: 6, label: 'Hours', fmt: function (v) { return String(v); } }, y: { min: 0, max: prmax, step: prmax / 2, fmt: function (v) { return fm(v, 2); } } });
        data.forEach(function (d, i) { if (prv[i] > 0) { ctx.fillStyle = rgba(k.green, 0.7); ctx.fillRect(X(d[0]) - 2, c4.Y(prv[i]), 4, c4.Y(0) - c4.Y(prv[i])); } });
        panels.forEach(function (pn) { txt(ctx, pn.lab, x0 + 6, pn.y + 9, { size: 10.5, color: k.ink, bold: true, halo: k.halo }); });
        line(ctx, [[X(tp), panels[0].y], [X(tp), panels[3].y + ph]], { color: k.rust, w: 1.5, dash: [5, 4] }); txt(ctx, 'front passes', X(tp) + 4, panels[0].y + ph - 8, { size: 10.5, color: k.rust, bold: true, halo: k.halo });
        F.legend([{ c: k.red, t: 'temperature', line: true }, { c: k.green, t: 'dew point', line: true }, { c: k.blue, t: 'pressure', line: true }]);
        F.alt('A 48-hour meteogram for one station: temperature, dew point, pressure, wind barbs and precipitation, with the moment a front passes marked.');
        F.say(fr === 'cold' ? (F.quiet ? '' : 'A <b>cold front</b> passes: ') + 'pressure falls as it approaches and jumps up after; the wind shifts from south-southwest to northwest with gusts; a short burst of heavy rain; then the temperature and dew point drop sharply.' : (F.quiet ? '' : 'A <b>warm front</b> passes: ') + 'hours of steady rain with falling pressure while the wind blows from the east; after it passes, the rain stops, the wind turns to the south-southwest, and the temperature and dew point rise.', 'Read the signs of a passing front.');
      };
    }

    function cyclone(F) {
      F.size({ aspect: 1.7, max: 440, narrow: 0.9 });
      var S = { st: clamp(M.round(num(o.stage, 3)), 1, 6) }, names = ['', 'Stationary front', 'A wave forms', 'Open wave', 'Mature storm', 'Occlusion', 'Dissipating'];
      var sl = V.slider(F.ctl, { label: 'Stage', min: 1, max: 6, step: 1, value: S.st, fmt: function (v) { return F.quiet ? String(v) : v + ': ' + names[v]; }, input: function (v) { S.st = v; F.redraw(); } });
      var row = F.row(), acc = 0; F.player(row, function (dt) { acc += dt; if (acc > 1.4) { acc = 0; S.st = S.st >= 6 ? 1 : S.st + 1; sl.set(S.st); F.redraw(); } }, { label: 'Play the life cycle' });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, st = S.st, ax = w / h;
        ctx.fillStyle = k.dark ? '#172a22' : '#f6f8f4'; ctx.fillRect(0, 0, w, h);
        var L = [0.42 + 0.04 * (st - 1), 0.5 - 0.03 * (st - 1)], depth = [0, 0, 4, 9, 16, 18, 8][st];
        if (st <= 2) { ctx.fillStyle = rgba(k.blue, 0.08); ctx.fillRect(0, 0, w, h * 0.5); ctx.fillStyle = rgba(k.red, 0.08); ctx.fillRect(0, h * 0.5, w, h * 0.5); } else { ctx.fillStyle = rgba(k.blue, 0.08); ctx.fillRect(0, 0, w, h); }
        if (depth > 0) { var G = gridField(function (px, py) { var dx = (px / w - L[0]) * ax, dy = py / h - L[1]; return 1012 - depth * M.exp(-(dx * dx + dy * dy) / 0.05); }, w, h, 60), lv = []; for (var q = 976; q < 1012; q += 4) lv.push(q); drawContours(ctx, G, lv, { color: k.dark ? '#8fb3c6' : '#64808f', w: 1.2 }); }
        function P(pts) { return pts.map(function (p) { return [p[0] * w, p[1] * h]; }); }
        if (st === 1) { frontLine(ctx, P([[0.05, 0.5], [0.35, 0.5], [0.65, 0.5], [0.95, 0.5]]), 'stationary', -1, { size: 8, gap: 30 }); arrow(ctx, w * 0.62, h * 0.3, w * 0.42, h * 0.3, { color: k.blue, w: 2.4 }); arrow(ctx, w * 0.42, h * 0.7, w * 0.62, h * 0.7, { color: k.red, w: 2.4 }); }
        else {
          var amp = [0, 0, 0.06, 0.12, 0.16, 0.16, 0.12][st], occ = st >= 5 ? (st === 5 ? 0.08 : 0.16) : 0, TP = [L[0] + occ * 0.9, L[1] + occ * 1.1];
          var wf = [[TP[0], TP[1]], [TP[0] + 0.12, TP[1] + 0.03], [TP[0] + 0.26, TP[1] + 0.06 + amp * 0.2]], cf = [[TP[0], TP[1]], [TP[0] - 0.05 - amp * 0.2, TP[1] + 0.12], [TP[0] - 0.12 - amp * 0.4, TP[1] + 0.26]];
          if (st === 2) { wf = [[L[0], L[1]], [L[0] + 0.2, 0.5], [0.95, 0.5]]; cf = [[L[0], L[1]], [L[0] - 0.12, 0.52], [0.05, 0.53]]; }
          if (st === 6) { ctx.globalAlpha = 0.5; }
          frontLine(ctx, P(cf), 'cold', -1, { size: 8, gap: 28 }); frontLine(ctx, P(wf), 'warm', -1, { size: 8, gap: 28 });
          if (occ) frontLine(ctx, P([L, TP]), 'occluded', -1, { size: 7, gap: 22 });
          ctx.globalAlpha = 1;
          if (st >= 3) poly(ctx, P([TP, wf[1], wf[2], [1, wf[2][1]], [1, 1], [cf[2][0] + 0.06, 1], cf[2], cf[1]]), rgba(k.red, st === 6 ? 0.05 : 0.1));
          txt(ctx, 'L', L[0] * w, L[1] * h, { size: 24 + depth * 0.4, color: k.red, bold: true, align: 'center', halo: k.halo });
          // circulation arrows around the low
          if (depth > 0) for (var a = 0; a < 4; a++) { var an = a * PI / 2 + 0.4, rr = 0.11 * h + depth; var x = L[0] * w + rr * M.cos(an), y = L[1] * h + rr * M.sin(an); arrow(ctx, x, y, x + 16 * M.sin(an), y - 16 * M.cos(an), { color: k.ink, w: 1.8, head: 7 }); }
        }
        if (!F.quiet) { txt(ctx, st + '. ' + names[st], 12, 18, { size: 14, color: k.ink, bold: true }); txt(ctx, 'cold air', 12, h * 0.12, { size: 11, color: k.blue, bold: true }); txt(ctx, 'warm air', 12, h * 0.92, { size: 11, color: k.red, bold: true }); }
        F.alt('Stage ' + st + ' of a mid-latitude storm' + (F.quiet ? '.' : ': ' + names[st] + '.'));
        F.say(F.quiet ? 'Which stage is this?' : ['', 'Cold and warm air meet along a stationary front, with winds blowing opposite ways on each side.', 'A kink (wave) forms on the front and pressure starts to fall at its tip.', 'An open wave: a low with a cold front and a warm front; the warm sector between them.', 'The mature storm: the deepest pressure and strongest winds; the faster cold front gains on the warm front.', 'Occlusion: the cold front catches the warm front and lifts the warm air off the ground. The storm is near its end, not its start.', 'Cut off from its warm, humid air, the low fills and the storm fades.'][st], 'Stages of a mid-latitude storm.');
      };
    }
  });

  /* es-clouds: Clouds and Precipitation.
     opts:
       mode: 'atlas' | 'growth' | 'ptype'      modes: true or a list for tabs
       highlight: a cloud name (atlas); blank: true (letters instead of names); warmFront: true (the clouds ahead of a warm front)
       r1, r2: droplet and drop radii in μm (growth; default 10 and 1000); process: 'warm' | 'cold' (growth); updraft: m/s (growth)
       profile: [[height m, T °C], …] from cloud base (3,000 m) to the ground (ptype; points draggable)
       quiet: hides cloud names, the droplet count and the outcome; lock */
  var CLOUDS = [
    // [name, level, x (0–1), base km, top km, weather]
    ['cirrus', 'high', 0.12, 9.5, 10.5, 'Thin wisps of ice crystals. Fair weather now, but often the first sign of an approaching warm front.'],
    ['cirrostratus', 'high', 0.4, 8.6, 9.2, 'A thin veil of ice that can make a halo around the Sun or Moon. Rain or snow often follows within a day.'],
    ['cirrocumulus', 'high', 0.66, 7.6, 8.2, 'Small ripples of ice puffs (a “mackerel sky”). Fair, but the weather may be changing.'],
    ['altostratus', 'middle', 0.2, 4.0, 5.0, 'A gray or bluish sheet; the Sun shows dimly, as if through frosted glass. Rain or snow may follow.'],
    ['altocumulus', 'middle', 0.56, 3.6, 4.4, 'Gray and white puffs in rows or patches. On a warm, humid morning they can hint at afternoon storms.'],
    ['stratus', 'low', 0.08, 0.4, 0.9, 'A flat, gray layer like fog that doesn’t touch the ground. Drizzle at most.'],
    ['stratocumulus', 'low', 0.3, 1.0, 1.7, 'A low, lumpy gray layer with gaps. Rarely more than light drizzle.'],
    ['nimbostratus', 'low', 0.52, 0.6, 3.2, 'A thick, dark gray layer (it can reach into the middle level) with steady rain or snow for hours.'],
    ['cumulus', 'low', 0.71, 1.0, 2.6, 'Puffy heaps with flat bases. Fair weather, though on a warm day they can grow into cumulonimbus.'],
    ['cumulonimbus', 'tall', 0.89, 1.0, 12, 'A towering storm cloud with an anvil top: thunderstorms, lightning, heavy showers, hail, gusty winds.']
  ];
  R('es-clouds', function (el, o) {
    var F = frame(el, o, 'Clouds and precipitation', { aspect: 1.5, max: 520 });
    return F.modes({ atlas: atlas, growth: growth, ptype: ptype }, { atlas: 'Cloud types', growth: 'Raindrops grow', ptype: 'Rain, sleet or snow?' });

    function atlas(F) {
      F.size({ aspect: 1.45, max: 560, narrow: 0.62 });
      var sel = o.highlight ? CLOUDS.map(function (c) { return c[0]; }).indexOf(o.highlight) : -1, wf = !!o.warmFront, B = !!o.blank || F.letters, boxes = [];
      var row = F.row(); check(row, 'Clouds ahead of a warm front', wf, function (v) { wf = v; F.redraw(); });
      F.drag({ hit: function (x, y) { for (var i = boxes.length - 1; i >= 0; i--) { var b = boxes[i]; if (b && x > b[0] && x < b[0] + b[2] && y > b[1] && y < b[1] + b[3]) return i + 1; } return null; }, start: function (h) { sel = h - 1; F.redraw(); }, move: function () { }, touch: 'pan-y' });
      F.keys(function (e) { var a = arrowKey(e); if (!a || !a[0]) return false; var vis = wf ? [0, 1, 3, 7] : CLOUDS.map(function (_, i) { return i; }), j = vis.indexOf(sel); sel = vis[(j + a[0] + vis.length) % vis.length]; F.redraw(); return true; }, 'Tap a cloud (or use the left and right arrow keys) to read about it.');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, x0 = 40, g = h - 22, kmH = (g - 12) / 13;
        function Y(km) { return g - km * kmH; }
        var sky = ctx.createLinearGradient(0, 0, 0, g); sky.addColorStop(0, k.dark ? '#0f1d2b' : '#9cc7ea'); sky.addColorStop(1, k.dark ? '#1f3b52' : '#e5f1fa'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, g);
        ctx.fillStyle = k.landDark; ctx.fillRect(0, g, w, h - g);
        // level bands
        [[5, 13, 'high: about 5–13 km'], [2, 7, 'middle: about 2–7 km'], [0, 2, 'low: below about 2 km']].forEach(function (b, i) { if (!F.quiet) txt(ctx, w < 520 ? b[2].split(':')[0] : b[2], x0 + 4, Y(b[1]) + 10 + (i === 1 ? 14 : 0), { size: 10, color: k.dark ? '#a9c4d8' : '#3d5a73', bold: true }); line(ctx, [[x0 - 6, Y(b[0])], [x0, Y(b[0])]], { color: k.ink, w: 1 }); });
        for (var km = 0; km <= 12; km += 2) { line(ctx, [[x0 - 5, Y(km)], [x0, Y(km)]], { color: k.ink, w: 1 }); txt(ctx, String(km), x0 - 8, Y(km), { size: 10, color: k.ink, align: 'right' }); }
        txt(ctx, 'km', x0 - 8, Y(13), { size: 10, color: k.ink, align: 'right' });
        var use = wf ? [[0, 0.88, 9.6, 10.4], [1, 0.68, 8.0, 8.6], [3, 0.46, 4.6, 5.6], [7, 0.2, 0.6, 3.4]] : CLOUDS.map(function (c, i) { return [i, c[2], c[3], c[4]]; });
        if (wf) { // the sloping warm front under the clouds
          var fx = function (km) { return x0 + 20 + km * (w - x0 - 40) / 11; }; line(ctx, [[fx(0), Y(0)], [fx(11), Y(11)]], { color: '#e03131', w: 3 }); if (!F.quiet) txt(ctx, w < 520 ? 'warm front →' : 'warm front: warm air rides up over cold air →', fx(1.5) + 10, Y(1.5), { size: 11, color: '#e03131', bold: true, halo: k.halo }); txt(ctx, 'they arrive in this order →', w - 10, 22, { size: 11, color: k.ink, bold: true, align: 'right' });
        }
        boxes = []; var NL = labeler(ctx);
        use.forEach(function (u, n) {
          var c = CLOUDS[u[0]], cx = x0 + u[1] * (w - x0 - 20), b0 = Y(u[2]), b1 = Y(u[3]), ww = M.min((w - x0) * (w < 520 && c[1] === 'low' ? 0.085 : 0.13), 110), on = sel === u[0], white = k.dark ? '#d5dde3' : '#ffffff', gray = k.dark ? '#8d99a3' : '#c1c9d0', dark = k.dark ? '#5c6670' : '#8c969e';
          ctx.save(); if (sel >= 0 && !on) ctx.globalAlpha = 0.55;
          var nm = c[0];
          if (nm === 'cirrus') { for (var s = 0; s < 6; s++) { var sx = cx - ww * 0.8 + s * ww * 0.3; ctx.strokeStyle = white; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, b0); ctx.quadraticCurveTo(sx + ww * 0.15, b1 + 2, sx + ww * 0.35, b1 - 2); ctx.stroke(); } }
          else if (nm === 'cirrostratus') { ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(cx, (b0 + b1) / 2, ww * 1.1, (b0 - b1) / 2 + 4, 0, 0, TAU); ctx.fill(); circle(ctx, cx + ww * 0.3, (b0 + b1) / 2, 4, '#fff3bf'); circle(ctx, cx + ww * 0.3, (b0 + b1) / 2, 14, null, 'rgba(255,255,255,0.8)', 1.5); }
          else if (nm === 'cirrocumulus') { for (var r2 = 0; r2 < 3; r2++) for (var cc = 0; cc < 9; cc++) circle(ctx, cx - ww * 0.8 + cc * ww * 0.2 + (r2 % 2) * 5, b1 + r2 * 6 + 3, 3, white); }
          else if (nm === 'altostratus') { ctx.fillStyle = gray; ctx.beginPath(); ctx.ellipse(cx, (b0 + b1) / 2, ww * 1.2, (b0 - b1) / 2, 0, 0, TAU); ctx.fill(); }
          else if (nm === 'altocumulus') { for (var r3 = 0; r3 < 2; r3++) for (var c3 = 0; c3 < 6; c3++) circle(ctx, cx - ww * 0.75 + c3 * ww * 0.3 + r3 * 8, b1 + 6 + r3 * 12, 8, r3 ? gray : white); }
          else if (nm === 'stratus') { ctx.fillStyle = gray; ctx.fillRect(cx - ww * 0.9, b1, ww * 1.8, b0 - b1); for (var d = 0; d < 8; d++) circle(ctx, cx - ww * 0.8 + d * ww * 0.22, b0 + 6 + (d % 3) * 4, 1, k.blue); }
          else if (nm === 'stratocumulus') { for (var c4 = 0; c4 < 7; c4++) circle(ctx, cx - ww * 0.9 + c4 * ww * 0.3, (b0 + b1) / 2, (b0 - b1) / 1.6, c4 % 2 ? gray : dark); }
          else if (nm === 'nimbostratus') { ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(cx, (b0 + b1) / 2, ww, (b0 - b1) / 2, 0, 0, TAU); ctx.fill(); for (var d2 = 0; d2 < 12; d2++) line(ctx, [[cx - ww * 0.8 + d2 * ww * 0.14, b0], [cx - ww * 0.8 + d2 * ww * 0.14 - 4, g]], { color: rgba(k.blue, 0.6), w: 1.2 }); }
          else if (nm === 'cumulus') { puffCloud(ctx, cx, (b0 + b1) / 2, ww * 0.45, (b0 - b1) / 2, white, 4); }
          else if (nm === 'cumulonimbus') { puffCloud(ctx, cx, (b0 + Y(10.6)) / 2, ww * 0.42, (b0 - Y(10.6)) / 2, white, 6); puffCloud(ctx, cx - ww * 0.15, Y(11.2), ww * 0.85, kmH * 0.35, white, 2, true); for (var d3 = 0; d3 < 8; d3++) line(ctx, [[cx - ww * 0.3 + d3 * ww * 0.08, b0], [cx - ww * 0.3 + d3 * ww * 0.08 - 4, g]], { color: rgba(k.blue, 0.7), w: 1.3 }); line(ctx, [[cx + 6, Y(5)], [cx - 4, Y(3.2)], [cx + 4, Y(3)], [cx - 6, Y(1)]], { color: '#ffd43b', w: 2.2 }); }
          ctx.restore();
          boxes[u[0]] = [cx - ww * 1.1, M.min(b1, b0) - 10, ww * 2.2, M.abs(b0 - b1) + 20];
          if (on) { ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); var bb = boxes[u[0]]; ctx.strokeRect(bb[0], bb[1], bb[2], bb[3]); ctx.restore(); if (F.focused()) focusRing(ctx, cx, (b0 + b1) / 2, 18); }
          var ly = nm === 'cumulonimbus' ? Y(12.3) : b1 - 10;
          if (B) badge(ctx, LETTERS[n], cx, ly, { k: k, r: 10 }); else if (!F.quiet) NL.put(nm, cx, ly, { size: w < 500 ? 10 : 11.5, color: k.dark ? '#e6ece8' : '#14324a', bold: true, align: 'center', halo: k.dark ? 'rgba(15,29,43,0.7)' : 'rgba(229,241,250,0.8)' }, [0, -13, 13, -26]);
        });
        var c0 = sel >= 0 ? CLOUDS[sel] : null;
        F.alt('A sky from the ground to 13 km with ' + (wf ? 'the clouds ahead of a warm front' : 'the ten main cloud types') + ' drawn at their usual heights' + (B ? ', lettered' : '') + '.');
        F.say(c0 ? (F.quiet || B ? '' : '<b>' + c0[0] + '</b> (' + c0[1] + '): ') + c0[5] : 'All clouds are made of tiny water droplets or ice crystals. Thick clouds look dark only because little sunlight gets through them. Names: cirro- high, alto- middle, strato- layered, cumulo- heaped, nimbo- or -nimbus means rain.', 'Tap a cloud.');
      };
    }

    function growth(F) {
      F.size({ aspect: 1.7, max: 440, narrow: 0.62 });
      var S = { r1: num(o.r1, 10), r2: num(o.r2, 1000), up: clamp(num(o.updraft, 1), 0, 10), proc: o.process === 'cold' ? 'cold' : 'warm', t: 1 };
      var T = F.tiles([{ k: 'n', label: 'Droplets in one drop = (R ÷ r)³', secret: true }, { k: 'v', label: 'Fall speeds vs the updraft', secret: true }]);
      V.slider(F.ctl, { label: 'Droplet radius r', min: 2, max: 50, step: 1, value: S.r1, fmt: function (v) { return v + ' μm'; }, input: function (v) { S.r1 = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Drop radius R', min: 50, max: 2500, step: 50, value: S.r2, fmt: function (v) { return v >= 1000 ? fm(v / 1000, 2) + ' mm' : v + ' μm'; }, input: function (v) { S.r2 = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Updraft', min: 0, max: 10, step: 0.1, value: S.up, fmt: function (v) { return fm(v, 1) + ' m/s'; }, input: function (v) { S.up = v; F.redraw(); } });
      var row = F.row(); if (!o.process) V.seg(row, { label: 'Process', items: [['warm', 'Warm cloud: bump and join'], ['cold', 'Cold cloud: ice grows']], value: S.proc, change: function (v) { S.proc = v; S.t = 0; F.redraw(); } });
      F.player(row, function (dt) { S.t = (S.t + dt * 0.2) % 1.2; F.redraw(); }, { label: 'Watch it grow' });
      var LADDER = [['nucleus (dust, salt)', 0.2], ['cloud droplet', 10], ['large cloud drop', 50], ['drizzle drop', 150], ['raindrop', 1000]];
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 600, lw = wide ? w * 0.56 : w, lh = wide ? h : h * 0.55;
        // the size ladder on a log scale of radius
        var r = { x: 20, y: 30, w: lw - 40, h: lh - 90 }, X = function (rad) { return r.x + (M.log10(rad) + 1) / (M.log10(3000) + 1) * r.w; };
        txt(ctx, 'Radius (log scale) and fall speed in still air', r.x, 14, { size: 11.5, color: k.ink, bold: true });
        line(ctx, [[r.x, r.y + r.h], [r.x + r.w, r.y + r.h]], { color: k.axis, w: 1.2 });
        [0.1, 1, 10, 100, 1000].forEach(function (v) { var x = X(v); line(ctx, [[x, r.y + r.h], [x, r.y + r.h + 5]], { color: k.axis, w: 1 }); txt(ctx, v >= 1000 ? '1 mm' : v + ' μm', x, r.y + r.h + 14, { size: 10, color: k.muted, align: 'center' }); });
        var LB = labeler(ctx);
        LADDER.forEach(function (L, i) {
          var x = X(L[1]), rr = (3 + i * 8) * M.min(1, r.w / 560), cy = r.y + r.h * 0.62 - rr, vf = EM.fallSpeed(L[1] * 2 / 1000), held = vf < S.up;
          circle(ctx, x, cy, rr, i === 0 ? k.muted : rgba(k.blue, held ? 0.35 : 0.75), k.blue, 1.2);
          var lw0 = tw(ctx, L[0], { size: 10, bold: true }); LB.put(L[0], clamp(x, r.x + lw0 / 2, r.x + r.w - lw0 / 2), cy - rr - 10, { size: 10, color: k.ink, align: 'center', bold: true, halo: k.halo }, [0, -14, -28]);
          if (i) txt(ctx, (vf < 0.1 ? fm(vf * 100, 1) + ' cm/s' : fm(vf, 1) + ' m/s'), x, cy + rr + 10, { size: 9.5, color: held ? k.orange : k.green, align: 'center', bold: true, halo: k.halo });
        });
        txt(ctx, wide ? 'sizes not to scale: a raindrop is about 100 times wider than a cloud droplet' : 'sizes not to scale', r.x, r.y + r.h + 32, { size: 9.5, color: k.muted });
        if (S.up > 0) txt(ctx, wide ? 'orange: too slow to fall through a ' + fm(S.up, 1) + ' m/s updraft' : 'orange: held up by the updraft', r.x, r.y + r.h + 46, { size: 9.5, color: k.orange });
        // process panel
        var px = wide ? lw + 10 : 10, py = wide ? 10 : lh + 6, pw = wide ? w - lw - 20 : w - 20, ph = wide ? h - 20 : h - lh - 12, cx = px + pw / 2;
        ctx.fillStyle = k.dark ? '#1b2b36' : '#eef4f9'; rrect(ctx, px, py, pw, ph, 10); ctx.fill();
        var rnd = rng(11), t = S.t;
        if (S.proc === 'warm') {
          txt(ctx, 'Warm cloud: a falling drop sweeps up droplets', px + 8, py + 14, { size: 10.5, color: k.ink, bold: true });
          var dy = py + 24 + clamp(t, 0, 1) * (ph - 50), dr = 6 + 6 * clamp(t, 0, 1), swept = 0;
          for (var i = 0; i < 70; i++) { var sx = px + 10 + rnd() * (pw - 20), sy = py + 30 + rnd() * (ph - 50), inPath = M.abs(sx - cx) < 12 && sy < dy; if (inPath) { swept++; continue; } circle(ctx, sx, sy, 2.2, rgba(k.blue, 0.6)); }
          ctx.fillStyle = rgba(k.blue, 0.12); ctx.fillRect(cx - 12, py + 24, 24, dy - py - 24);
          circle(ctx, cx, dy, dr, k.blue);
          txt(ctx, 'droplets collected: ' + swept, px + 8, py + ph - 10, { size: 10, color: k.muted });
        } else {
          txt(ctx, 'Cold cloud: ice grows, droplets shrink', px + 8, py + 14, { size: 10.5, color: k.ink, bold: true });
          var gr = clamp(t, 0, 1), cy2 = py + ph / 2 + 8, arm = 8 + 24 * gr;
          for (var j = 0; j < 22; j++) { var a = j / 22 * TAU, d = 50 + (j % 3) * 18, ddx = cx + d * M.cos(a), ddy = cy2 + d * M.sin(a) * 0.8, rr2 = M.max(0.6, 4.5 * (1 - gr * 0.85)); circle(ctx, ddx, ddy, rr2, rgba(k.blue, 0.6)); if (j % 4 === 0) arrow(ctx, ddx - (ddx - cx) * 0.15, ddy - (ddy - cy2) * 0.15, cx + (ddx - cx) * 0.45, cy2 + (ddy - cy2) * 0.45, { color: rgba(k.ink, 0.35), w: 1.2, head: 6, dash: [3, 3] }); }
          for (var s6 = 0; s6 < 6; s6++) { var an = s6 * PI / 3; line(ctx, [[cx, cy2], [cx + arm * M.cos(an), cy2 + arm * M.sin(an)]], { color: k.dark ? '#e7f5ff' : '#4dabf7', w: 3 }); line(ctx, [[cx + arm * 0.6 * M.cos(an), cy2 + arm * 0.6 * M.sin(an)], [cx + arm * 0.6 * M.cos(an) + arm * 0.25 * M.cos(an + 0.8), cy2 + arm * 0.6 * M.sin(an) + arm * 0.25 * M.sin(an + 0.8)]], { color: k.dark ? '#e7f5ff' : '#4dabf7', w: 2 }); }
          txt(ctx, 'water vapor moves from the droplets to the ice (below 0 °C)', px + 8, py + ph - 10, { size: 10, color: k.muted });
        }
        var n = EM.dropCount(S.r1, S.r2), v1 = EM.fallSpeed(S.r1 * 2 / 1000), v2 = EM.fallSpeed(S.r2 * 2 / 1000);
        T.n(n >= 1e4 ? nf(M.round(n)) : sig(n, 3)); T.v('r: ' + (v1 < 0.1 ? fm(v1 * 100, 1) + ' cm/s' : fm(v1, 2) + ' m/s') + '; R: ' + fm(v2, 1) + ' m/s; updraft ' + fm(S.up, 1) + ' m/s');
        F.alt('A size ladder from a condensation nucleus to a raindrop with fall speeds, and a picture of how drops grow in a ' + S.proc + ' cloud.');
        F.say('Cloud droplets are so small that they fall about a centimeter per second, and any updraft holds them up. They don’t just get heavy and fall: a raindrop of radius R holds (R ÷ r)³ droplets of radius r, here <b>' + (n >= 1e4 ? nf(M.round(n)) : sig(n, 3)) + '</b>. ' + (S.proc === 'warm' ? 'In warm clouds, bigger drops fall faster, bump into small ones and join them.' : 'In clouds colder than 0 °C, ice crystals grow at the expense of the supercooled droplets around them, then fall as snow, which may melt into rain.'), 'Droplets grow into raindrops by joining or by ice growth.');
      };
    }

    function ptype(F) {
      F.size({ aspect: 1.45, max: 500, narrow: 0.85 });
      var PRE = { snow: [[3000, -8], [2000, -5], [1000, -3], [0, -2]], rain: [[3000, -5], [2000, 0], [1000, 5], [0, 10]], sleet: [[3000, -5], [2200, 3], [1400, 3], [1100, 0], [0, -6]], freezing: [[3000, -5], [2000, 3], [1000, 3], [500, 0], [0, -2]] };
      var prof = (o.profile || PRE.freezing).map(function (q) { return [+q[0], +q[1]]; }).sort(function (a, b) { return b[0] - a[0]; }), geo = null, sel = 1, t = 1;
      var T = F.tiles([{ k: 'out', label: 'What reaches the ground', secret: true }, { k: 'warm', label: 'Warm layer aloft', secret: true }, { k: 'cold', label: 'Cold layer at the ground', secret: true }]);
      var row = F.row(); [['snow', 'Snow'], ['rain', 'Rain'], ['sleet', 'Sleet'], ['freezing', 'Freezing rain']].forEach(function (q) { V.button(row, q[1] + ' sounding', function () { prof = PRE[q[0]].map(function (p) { return p.slice(); }); F.redraw(); }); });
      F.player(row, function (dt) { t = (t + dt * 0.25) % 1.15; F.redraw(); }, { label: 'Drop a flake', auto: true });
      F.drag({ hit: function (x, y) { if (!geo) return null; var best = null, bd = 18; prof.forEach(function (q, i) { var d = M.hypot(geo.X(q[1]) - x, geo.Y(q[0]) - y); if (d < bd) { bd = d; best = i; } }); return best; }, start: function (i) { sel = i; }, move: function (i, x) { prof[i][1] = M.round(clamp(geo.ix(x), -15, 12) * 2) / 2; F.redraw(); } });
      F.keys(function (e) { var a = arrowKey(e); if (!a) return false; if (a[1]) sel = clamp(sel + a[1], 0, prof.length - 1); else prof[sel][1] = clamp(prof[sel][1] + a[0] * 0.5, -15, 12); F.redraw(); return true; }, 'Drag the points of the temperature profile sideways (or use the arrow keys: up and down pick a point, left and right change its temperature).');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, colW = M.min(130, w * 0.28), r = { x: 50, y: 14, w: w - 70 - colW, h: h - 54 };
        var c = chart(ctx, k, r, { x: { min: -15, max: 12, step: 5, label: 'Temperature (°C)' }, y: { min: 0, max: 3000, step: 500, label: 'Height (m)', lpad: 40, fmt: function (v) { return nf(v); } } });
        geo = c; c.clip();
        ctx.fillStyle = rgba(k.red, 0.08); ctx.fillRect(c.X(0), r.y, r.x + r.w - c.X(0), r.h); ctx.fillStyle = rgba(k.blue, 0.08); ctx.fillRect(r.x, r.y, c.X(0) - r.x, r.h);
        line(ctx, [[c.X(0), r.y], [c.X(0), r.y + r.h]], { color: k.ink, w: 1.5, dash: [5, 4] });
        // shade the warm layer and the cold layer under it
        var P = prof.slice().sort(function (a, b) { return b[0] - a[0]; });
        for (var z = 0; z < 3000; z += 25) { var tz = interp(P.slice().reverse(), z); if (tz > 0) { ctx.fillStyle = rgba(k.red, 0.25); ctx.fillRect(c.X(0), c.Y(z + 25), c.X(tz) - c.X(0), c.Y(z) - c.Y(z + 25)); } else { ctx.fillStyle = rgba(k.blue, 0.18); ctx.fillRect(c.X(tz), c.Y(z + 25), c.X(0) - c.X(tz), c.Y(z) - c.Y(z + 25)); } }
        line(ctx, P.map(function (q) { return [c.X(q[1]), c.Y(q[0])]; }), { color: k.ink, w: 2.6 });
        c.unclip();
        P.forEach(function (q) { var i = prof.indexOf(q); knob(ctx, c.X(q[1]), c.Y(q[0]), k.rust, 6, k); if (F.focused() && i === sel) focusRing(ctx, c.X(q[1]), c.Y(q[0]), 12); });
        txt(ctx, '0 °C', c.X(0) + 4, r.y + 10, { size: 10.5, color: k.ink, bold: true });
        // the falling particle column
        var res = EM.ptype(P), colX = r.x + r.w + 18 + colW / 2, fy = r.y + clamp(t, 0, 1) * r.h, zf = 3000 * (1 - clamp(t, 0, 1));
        ctx.fillStyle = k.dark ? '#1b2b36' : '#eef4f9'; rrect(ctx, colX - colW / 2 + 4, r.y, colW - 8, r.h, 8); ctx.fill();
        ctx.fillStyle = k.landDark; ctx.fillRect(colX - colW / 2 + 4, r.y + r.h - 6, colW - 8, 6);
        // state along the way: integrate the warm area above zf
        var warm = 0, coldB = 0, seen = false; for (var z2 = 3000; z2 > zf; z2 -= 25) { var tt = interp(P.slice().reverse(), z2); if (tt > 0) { warm += tt * 25; seen = true; } else if (seen) coldB += -tt * 25; }
        var melt = clamp((warm - 200) / 800, 0, 1), state = melt <= 0 ? 'flake' : melt < 1 ? 'slush' : 'drop', refrozen = melt > 0 && coldB > 1200;
        if (state === 'flake') { for (var a = 0; a < 3; a++) { var an = a * PI / 3; line(ctx, [[colX - 8 * M.cos(an), fy - 8 * M.sin(an)], [colX + 8 * M.cos(an), fy + 8 * M.sin(an)]], { color: k.dark ? '#e7f5ff' : '#4dabf7', w: 2 }); } }
        else if (refrozen) circle(ctx, colX, fy, 5, '#e9ecef', k.ink, 1.5);
        else { circle(ctx, colX, fy, 5 + 2 * (1 - melt), state === 'drop' ? k.blue : rgba(k.blue, 0.6), state === 'slush' ? '#fff' : null, 1.5); }
        if (t >= 1 && !F.quiet) txt(ctx, res.kind, colX, r.y + r.h - 18, { size: 12, color: k.ink, bold: true, align: 'center', halo: k.halo });
        txt(ctx, 'from the cloud', colX, r.y + 24, { size: 9.5, color: k.muted, align: 'center' });
        T.out(res.kind); T.warm(res.warm > 0 ? nf(res.warm) + ' °C·m above 0 °C' : 'none'); T.cold(res.cold > 0 ? nf(res.cold) + ' °C·m below 0 °C' : 'none');
        F.alt('A temperature profile from the cloud at 3,000 m to the ground' + (F.quiet ? '' : ', giving ' + res.kind) + ', with a particle falling through it.');
        F.say('Snow falls from the cloud. A warm layer aloft melts it (a deep or warm layer melts it all). Below, a deep cold layer refreezes the drops into ice pellets: <b>sleet</b>. If the cold layer is thin, the drops stay liquid, supercooled, and freeze on contact with the cold ground, roads and wires: <b>freezing rain</b>, the more dangerous of the two. Here: <b>' + res.kind + '</b>. (A rule of thumb based on the areas of the warm and cold layers; forecasters use more detail.)', 'Warm layers melt snow; cold layers below can refreeze it.');
      };
    }
  });

  /* es-storms: Storms.
     opts:
       mode: 'thunderstorm' | 'supercell' | 'hurricane'      modes: true or a list for tabs
       stage: 'cumulus' | 'mature' | 'dissipating' or time: minutes 0–60 (thunderstorm); delay: seconds from flash to thunder (1–45)
       shear: 0–1 (supercell: how much the wind changes with height); ef: 0–5 (row to highlight) or wind: mph (rated on the EF scale,
       supercell; on the Saffir–Simpson scale, hurricane); category: 1–5 (hurricane); surge: storm surge (m, or ft with units 'ft')
       hemisphere: 'N' | 'S' (hurricane spin); letters: true; quiet: hides the stage, category, EF rating and distance; lock */
  var EF_DMG = ['Light: shingles and gutters off, branches broken', 'Moderate: roofs badly stripped, mobile homes overturned, windows broken', 'Considerable: roofs torn off well-built houses, large trees snapped or uprooted', 'Severe: whole stories of well-built houses destroyed, trains overturned', 'Devastating: well-built houses leveled, cars thrown', 'Incredible: strong frame houses swept away, steel-reinforced concrete badly damaged'];
  var SS_DMG = ['Some damage: roofs, siding, gutters; trees snapped; power out for days', 'Extensive: major roof and siding damage; many trees down; power out for days to weeks', 'Devastating: well-built houses lose roof decking; many trees down; electricity and water out for days to weeks', 'Catastrophic: well-built houses lose most of the roof and some walls; most of the area uninhabitable for weeks or months', 'Catastrophic: a high share of frame homes destroyed; the area uninhabitable for weeks or months'];
  R('es-storms', function (el, o) {
    var F = frame(el, o, 'Storms', { aspect: 1.6, max: 480 });
    var ft = o.units === 'ft';
    return F.modes({ thunderstorm: tstorm, supercell: supercell, hurricane: hurricane }, { thunderstorm: 'Thunderstorm', supercell: 'Supercell and tornado', hurricane: 'Hurricane' });

    function scaleTable(F, rows, cur, head) {
      var tb = mk('table', 'lft'); tb.innerHTML = '<thead><tr>' + head.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r, i) { return '<tr' + (i === cur ? ' class="hi"' : '') + '>' + r.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
      var wrap = mk('div', 'esv-tbl'); wrap.appendChild(tb); F.el.insertBefore(wrap, F.statsEl); F._rows.push(wrap); return tb;
    }

    function tstorm(F) {
      F.size({ aspect: 1.7, max: 460, narrow: 0.85 });
      var stT = { cumulus: 8, mature: 28, dissipating: 50 }, S = { t: o.time != null ? clamp(num(o.time, 28), 0, 60) : stT[o.stage] != null ? stT[o.stage] : 28, delay: clamp(num(o.delay, 9), 1, 45), fl: -1 };
      var T = F.tiles([{ k: 'st', label: 'Stage', secret: true }, { k: 'd', label: 'Distance to the lightning', secret: true }]);
      var ts = V.slider(F.ctl, { label: 'Storm time', min: 0, max: 60, step: 1, value: S.t, fmt: function (v) { return v + ' min'; }, input: function (v) { S.t = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Flash to thunder', min: 1, max: 45, step: 0.5, value: S.delay, fmt: function (v) { return fm(v, 1) + ' s'; }, input: function (v) { S.delay = v; S.fl = -1; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { S.t = M.min(60, S.t + dt * 4); ts.set(M.round(S.t)); F.redraw(); if (S.t >= 60) return false; }, { label: 'Run the storm', reset: function () { if (S.t >= 60) S.t = 0; } });
      var fp = F.player(row, function (dt) { S.fl += dt * 3; F.redraw(); if (S.fl > S.delay + 1.5) { S.fl = -1; F.redraw(); return false; } }, { label: 'Flash! (3× speed)', reset: function () { S.fl = 0; } });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, g = h - 34, kmH = (g - 18) / 13, t = S.t, stage = t < 15 ? 'cumulus' : t < 40 ? 'mature' : 'dissipating';
        function Y(km) { return g - km * kmH; }
        var sky = ctx.createLinearGradient(0, 0, 0, g); sky.addColorStop(0, k.dark ? '#0f1d2b' : '#9cc7ea'); sky.addColorStop(1, k.dark ? '#1f3b52' : '#e5f1fa'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, g); ctx.fillStyle = k.landDark; ctx.fillRect(0, g, w, h - g);
        line(ctx, [[0, Y(12)], [w, Y(12)]], { color: k.muted, w: 1, dash: [6, 4] }); txt(ctx, 'tropopause (about 12 km)', w - 6, Y(12) - 8, { size: 9.5, color: k.muted, align: 'right' });
        var cx = w * 0.26, top = stage === 'cumulus' ? 2 + t * 0.5 : stage === 'mature' ? 12 : 12 - (t - 40) * 0.12, cw = M.min(w * 0.09, 80), fade = stage === 'dissipating' ? 1 - (t - 40) / 30 : 1, white = k.dark ? '#d5dde3' : '#ffffff', gray = k.dark ? '#7d8790' : '#aeb7bf';
        ctx.save(); ctx.globalAlpha = fade;
        puffCloud(ctx, cx, (Y(1.2) + Y(top)) / 2, cw, (Y(1.2) - Y(top)) / 2, white, 5);
        if (stage !== 'cumulus') { var aw = stage === 'mature' ? cw * (1.5 + (t - 15) * 0.08) : cw * 3.6; puffCloud(ctx, cx + aw * 0.45, Y(11.6), aw, kmH * 0.45, white, 2, true); }
        ctx.fillStyle = gray; ctx.fillRect(cx - cw * 0.9, Y(1.4), cw * 1.8, kmH * 0.3);
        ctx.restore();
        // drafts
        if (stage !== 'dissipating') for (var u = 0; u < 3; u++) { var yy = Y(1.5) - ((t * 20 + u * 40) % (Y(1.5) - Y(top - 0.5))); arrow(ctx, cx - cw * 0.3 + (stage === 'mature' ? -cw * 0.2 : 0), yy + 22, cx - cw * 0.3 + (stage === 'mature' ? -cw * 0.2 : 0), yy, { color: k.red, w: 3, head: 9 }); }
        if (stage !== 'cumulus') { var dx = stage === 'mature' ? cx + cw * 0.45 : cx; for (var d = 0; d < 3; d++) { var y2 = Y(8) + ((t * 18 + d * 40) % (Y(1) - Y(8))); arrow(ctx, dx, y2 - 22, dx, y2, { color: k.blue, w: 3, head: 9 }); } for (var rr = 0; rr < 14; rr++) line(ctx, [[dx - cw * 0.5 + rr * cw * 0.08, Y(1.3)], [dx - cw * 0.5 + rr * cw * 0.08 - 5, g]], { color: rgba(k.blue, stage === 'mature' ? 0.7 : 0.35), w: 1.3 }); }
        // the cold pool and gust front
        if (stage !== 'cumulus') { var gfx = cx + cw + (t - 15) * (w * 0.006); poly(ctx, [[cx - cw * 1.4, g], [cx - cw, g - 14], [gfx - 10, g - 14], [gfx, g]], rgba(k.blue, 0.22)); arrow(ctx, cx + cw * 0.5, g - 6, gfx, g - 6, { color: k.blue, w: 2, head: 8 }); if (!F.quiet) txt(ctx, 'gust front', gfx, g - 40, { size: 10, color: k.blue, bold: true, align: 'right', halo: k.halo }); }
        // lightning (mature) and the flash-to-thunder demo
        var ox = M.min(w - 30, cx + 34 + S.delay * 0.343 * (w * 0.62 / 15)), lx = cx + cw * 0.2;
        if (stage === 'mature' || S.fl >= 0) { var on = S.fl >= 0 ? S.fl < 0.4 : ((t * 7) % 3) < 0.5; if (on) line(ctx, [[lx, Y(4)], [lx - 8, Y(2.8)], [lx + 6, Y(2.3)], [lx - 6, g]], { color: '#ffd43b', w: 3 }); }
        circle(ctx, ox, g - 10, 7, k.rust); line(ctx, [[ox, g - 3], [ox, g]], { color: k.rust, w: 3 }); txt(ctx, 'you', ox, g - 24, { size: 10.5, color: k.rust, bold: true, align: 'center', halo: k.halo });
        if (S.fl >= 0) { var dpx = (ox - lx) * clamp(S.fl / S.delay, 0, 1); ctx.save(); ctx.strokeStyle = rgba(k.ink, 0.5); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lx, g, M.max(1, dpx), -PI / 2, 0); ctx.stroke(); ctx.restore(); txt(ctx, fm(M.min(S.fl, S.delay), 1) + ' s' + (S.fl >= S.delay ? ': thunder!' : ''), ox, Y(2.2), { size: 13, color: k.ink, bold: true, align: 'center', halo: k.halo }); }
        line(ctx, [[lx, g + 14], [ox, g + 14]], { color: k.ink, w: 1.2 }); [lx, ox].forEach(function (x) { line(ctx, [[x, g + 10], [x, g + 18]], { color: k.ink, w: 1.2 }); });
        var dist = EM.SOUND * S.delay;
        txt(ctx, F.quiet ? '? km' : fm(dist / 1000, 1) + ' km', (lx + ox) / 2, g + 24, { size: 10.5, color: '#fff', bold: true, align: 'center' });
        if (!F.quiet) { txt(ctx, ({ cumulus: '1. Cumulus stage: updrafts only', mature: '2. Mature stage: updrafts and downdrafts, rain, lightning', dissipating: '3. Dissipating stage: downdrafts take over' }[stage]).split(w < 560 ? ':' : '|')[0], 12, 18, { size: 13, color: k.ink, bold: true, halo: k.halo }); }
        F.legend([{ c: k.red, t: 'updraft' }, { c: k.blue, t: 'downdraft and cold outflow' }]);
        T.st(stage); T.d(fm(dist, 0) + ' m ≈ ' + fm(dist / 1000, 1) + ' km');
        F.alt('A thunderstorm ' + (F.quiet ? '' : 'in its ' + stage + ' stage ') + 'with its drafts, and a listener some distance away timing the thunder.');
        F.say('Sound travels about 343 m/s, so each second between the flash and the thunder is about a third of a kilometer (about 3 s per km, 5 s per mile): ' + fm(S.delay, 1) + ' s × 343 m/s = <b>' + fm(dist / 1000, 2) + ' km</b>. The downdraft starts inside the cloud, dragged down by falling rain and cooled by evaporation; it spreads along the ground as a gust front. Lightning can and often does strike the same tall place more than once.', 'Time the gap between flash and thunder to find the distance.');
      };
    }

    function supercell(F) {
      F.size({ aspect: 1.7, max: 440, narrow: 0.85 });
      var S = { sh: clamp(num(o.shear, 0.7), 0, 1), wind: o.wind != null ? num(o.wind, 120) : null, ef: o.ef != null ? clamp(M.round(num(o.ef, 2)), 0, 5) : null, t: 0 };
      var T = F.tiles([{ k: 'ef', label: 'EF rating', secret: true }]);
      V.slider(F.ctl, { label: 'Wind shear (change with height)', min: 0, max: 1, step: 0.05, value: S.sh, fmt: function (v) { return v < 0.3 ? 'weak' : v < 0.65 ? 'moderate' : 'strong'; }, input: function (v) { S.sh = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Tornado wind (from damage)', min: 65, max: 250, step: 5, value: S.wind || 120, fmt: function (v) { return v + ' mph'; }, input: function (v) { S.wind = v; S.ef = null; F.redraw(); } });
      var row = F.row(); F.player(row, function (dt) { S.t += dt; F.redraw(); }, { label: 'Spin', auto: true });
      var tb = scaleTable(F, EM.EF.map(function (e, i) { return ['EF' + e[0], e[0] === 5 ? 'over 200' : e[1] + '–' + e[2], EF_DMG[i]]; }), -1, ['Rating', 'Wind (mph, 3-s gust)', 'Typical damage']);
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, g = h - 20, kmH = (g - 14) / 13, sh = S.sh, t = S.t;
        function Y(km) { return g - km * kmH; }
        var sky = ctx.createLinearGradient(0, 0, 0, g); sky.addColorStop(0, k.dark ? '#0f1d2b' : '#9cc7ea'); sky.addColorStop(1, k.dark ? '#1f3b52' : '#e5f1fa'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, g); ctx.fillStyle = k.landDark; ctx.fillRect(0, g, w, h - g);
        // the wind profile: direction turns and speed grows with height
        var px = 76; txt(ctx, 'wind', px, Y(12.4), { size: 10.5, color: k.ink, bold: true, align: 'center' });
        [[0.3, 140, 10], [1.5, 180, 20], [3, 230, 30], [6, 260, 45], [9, 270, 60]].forEach(function (q) { var dir = lerp(250, q[1], sh), sp = lerp(25, q[2], sh), L = 8 + sp * 0.6, to = (dir + 180) * RAD; arrow(ctx, px - L / 2 * M.sin(to), Y(q[0]) + L / 2 * M.cos(to), px + L / 2 * M.sin(to), Y(q[0]) - L / 2 * M.cos(to), { color: k.ink, w: 2, head: 7 }); txt(ctx, q[0] + ' km', px - 30, Y(q[0]), { size: 9.5, color: k.muted, align: 'right' }); });
        var cx = w * 0.56, cw = M.min(w * 0.11, 90), white = k.dark ? '#d5dde3' : '#ffffff', gray = k.dark ? '#6c7780' : '#9aa4ad';
        puffCloud(ctx, cx, (Y(1.4) + Y(11)) / 2, cw, (Y(1.4) - Y(11)) / 2, white, 9); puffCloud(ctx, cx + cw * 1.6, Y(11.4), cw * 2.4, kmH * 0.5, white, 4, true); puffCloud(ctx, cx - cw * 0.1, Y(12.4), cw * 0.45, kmH * 0.5, white, 3);
        if (!F.quiet && w > 480) txt(ctx, 'overshooting top', cx + cw * 0.5, Y(12.6), { size: 9.5, color: k.ink, halo: k.halo });
        // the horizontal spin from shear, tilted upright by the updraft
        var vx = cx - cw * 2.6, vy = Y(0.8), vr = 10 + sh * 6;
        ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 2; for (var s = 0; s < 6; s++) { ctx.beginPath(); ctx.ellipse(vx - 50 + s * 18, vy, 5, vr, 0, 0, TAU); ctx.stroke(); } ctx.restore();
        if (!F.quiet && w > 480) txt(ctx, 'spin from the shear', vx - 56, vy - vr - 10, { size: 10, color: k.purple, bold: true, halo: k.halo });
        arrow(ctx, vx + 56, vy, cx - cw * 0.6, Y(2.2), { color: k.purple, w: 2, head: 8, dash: [5, 4] });
        // rotating updraft
        for (var a = 0; a < 5; a++) { var yy = Y(2.5 + a * 1.6), ph = t * 3 * (0.4 + sh) + a; ctx.save(); ctx.strokeStyle = k.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, yy, cw * 0.55, 7, 0, ph % TAU, ph % TAU + PI * 1.3); ctx.stroke(); ctx.restore(); }
        if (!F.quiet && w > 480) txt(ctx, 'rotating updraft (mesocyclone)', cx + cw * 0.7, Y(5.5), { size: 10, color: k.red, bold: true, halo: k.halo });
        // wall cloud and, with strong shear, a tornado
        ctx.fillStyle = gray; ctx.fillRect(cx - cw * 0.5, Y(1.4), cw, kmH * 0.45);
        if (sh >= 0.6) { var tw0 = 6 + (S.wind ? S.wind / 30 : 4); ctx.save(); ctx.fillStyle = k.dark ? 'rgba(180,190,200,0.8)' : 'rgba(110,120,130,0.85)'; ctx.beginPath(); ctx.moveTo(cx - tw0 * 2, Y(1.0)); ctx.quadraticCurveTo(cx - tw0 * 0.3, Y(0.5), cx - 3, g); ctx.lineTo(cx + 3, g); ctx.quadraticCurveTo(cx + tw0 * 0.4, Y(0.5), cx + tw0 * 2, Y(1.0)); ctx.closePath(); ctx.fill(); ctx.restore(); if (!F.quiet) txt(ctx, 'tornado', cx + 20, Y(0.5), { size: 10.5, color: k.ink, bold: true, halo: k.halo }); }
        if (!F.quiet && w > 480) txt(ctx, 'wall cloud', cx - cw * 0.5 - 6, Y(1.2), { size: 10, color: k.ink, align: 'right', halo: k.halo });
        for (var rr = 0; rr < 12; rr++) line(ctx, [[cx + cw * 0.9 + rr * 6, Y(1.4)], [cx + cw * 0.9 + rr * 6 - 5, g]], { color: rgba(k.blue, 0.6), w: 1.3 });
        var efr = S.ef != null ? S.ef : EM.efOf(S.wind || 120);
        Array.prototype.forEach.call(tb.tBodies[0].rows, function (rw, i) { rw.className = i === efr && !F.quiet ? 'hi' : ''; });
        T.ef(efr >= 0 ? 'EF' + efr : 'below EF0');
        F.alt('A supercell thunderstorm: winds that turn and strengthen with height, a horizontal spin tilted upright by the updraft into a rotating updraft, a wall cloud' + (sh >= 0.6 ? ' and a tornado.' : '.'));
        F.say('When the wind changes speed and direction with height, the air near the ground rolls into a horizontal spin. A strong updraft tilts it upright, and the whole updraft rotates: a supercell. Only some of them make tornadoes. A tornado is rated after it passes, from the damage it did: ' + (S.wind ? fm(S.wind, 0) + ' mph is <b>EF' + efr + '</b>' : '') + '. Tornadoes don’t avoid cities, rivers or valleys.', 'Wind shear plus a strong updraft makes a rotating storm.');
      };
    }

    function hurricane(F) {
      F.size({ aspect: 1.55, max: 560, narrow: 0.5 });
      var S = { mph: o.wind != null ? num(o.wind, 120) : o.category != null ? [0, 85, 100, 120, 140, 165][clamp(M.round(num(o.category, 3)), 1, 5)] : 120, surge: o.surge != null ? num(o.surge, 3) * (ft ? 0.3048 : 1) : 3, sh: o.hemisphere === 'S' ? -1 : 1, t: 0 };
      var T = F.tiles([{ k: 'cat', label: 'Saffir–Simpson category', secret: true }, { k: 'surge', label: 'Storm surge', secret: true }]);
      V.slider(F.ctl, { label: 'Sustained wind', min: 40, max: 190, step: 5, value: S.mph, fmt: function (v) { return v + ' mph (' + fm(v * 1.609, 0) + ' km/h)'; }, input: function (v) { S.mph = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Storm surge', min: 0, max: 8, step: 0.1, value: S.surge, fmt: function (v) { return ft ? fm(v / 0.3048, 0) + ' ft' : fm(v, 1) + ' m'; }, input: function (v) { S.surge = v; F.redraw(); } });
      var row = F.row(); if (!o.hemisphere) V.seg(row, { label: 'Hemisphere', items: [['N', 'Northern'], ['S', 'Southern']], value: S.sh > 0 ? 'N' : 'S', change: function (v) { S.sh = v === 'N' ? 1 : -1; F.redraw(); } });
      F.player(row, function (dt) { S.t += dt; F.redraw(); }, { label: 'Spin', auto: true });
      var tb = scaleTable(F, EM.SS.map(function (e, i) { return [String(e[0]), e[0] === 5 ? '157 or more' : e[1] + '–' + e[2], SS_DMG[i]]; }), -1, ['Category', 'Wind (mph, 1-min)', 'Typical wind damage']);
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 600, cat = EM.ssCat(S.mph), t = S.t;
        // --- top view
        var tvR = wide ? M.min(w * 0.2, h * 0.3) : M.min(w * 0.42, h * 0.16), tc = wide ? [w * 0.22, h * 0.34] : [w / 2, tvR + 10];
        ctx.fillStyle = k.dark ? '#183f5e' : '#4a8fc4'; ctx.beginPath(); ctx.arc(tc[0], tc[1], tvR + 6, 0, TAU); ctx.fill();
        var rot = -S.sh * t * 0.4; // counterclockwise in the north (screen: negative angle)
        for (var arm = 0; arm < 4; arm++) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = tvR * 0.13; ctx.lineCap = 'round'; ctx.beginPath(); for (var s = 0; s <= 1.0001; s += 0.02) { var rr = tvR * (0.16 + 0.84 * s), an = rot + arm * PI / 2 + S.sh * s * 3.2; var x = tc[0] + rr * M.cos(an), y = tc[1] + rr * M.sin(an); if (s) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
        circle(ctx, tc[0], tc[1], tvR * 0.2, 'rgba(255,255,255,0.95)'); circle(ctx, tc[0], tc[1], tvR * 0.08, k.dark ? '#183f5e' : '#4a8fc4');
        for (var q = 0; q < 4; q++) { var a0 = rot * 1.5 + q * PI / 2, rq = tvR * 0.62; arrowHead(ctx, tc[0] + rq * M.cos(a0), tc[1] + rq * M.sin(a0), a0 - S.sh * PI / 2, 10, k.rust); }
        if (!F.quiet) txt(ctx, 'eye and eyewall', tc[0], tc[1] + tvR + 18, { size: 10.5, color: k.ink, bold: true, align: 'center' });
        if (wide) txt(ctx, 'From above: winds spiral ' + (S.sh > 0 ? 'counterclockwise' : 'clockwise') + ' inward', tc[0], h * 0.34 + tvR + 40, { size: 10.5, color: k.muted, align: 'center' });
        // --- cross-section
        var cr = wide ? { x: w * 0.46, y: 14, w: w * 0.52, h: h * 0.52 } : { x: 10, y: tc[1] + tvR + 30, w: w - 20, h: h * 0.3 }, sea = cr.y + cr.h * 0.86, ccx = cr.x + cr.w / 2;
        ctx.fillStyle = k.dark ? '#1b2e40' : '#dcecf8'; ctx.fillRect(cr.x, cr.y, cr.w, sea - cr.y); ctx.fillStyle = k.dark ? '#2d6c99' : '#4a8fc4'; ctx.fillRect(cr.x, sea, cr.w, cr.y + cr.h - sea);
        txt(ctx, 'ocean at least 26.5 °C', cr.x + 8, sea + (cr.y + cr.h - sea) / 2, { size: 10, color: '#fff', bold: true });
        var white = k.dark ? '#d5dde3' : '#ffffff', eyeW = cr.w * 0.05;
        [-1, 1].forEach(function (sd) { puffCloud(ctx, ccx + sd * (eyeW + cr.w * 0.06), (sea + cr.y + cr.h * 0.12) / 2, cr.w * 0.06, (sea - cr.y - cr.h * 0.12) / 2, white, 3 + sd); puffCloud(ctx, ccx + sd * cr.w * 0.3, cr.y + cr.h * 0.16, cr.w * 0.2, cr.h * 0.07, white, 5, true); for (var b = 0; b < 2; b++) puffCloud(ctx, ccx + sd * cr.w * (0.25 + b * 0.12), sea - cr.h * 0.18, cr.w * 0.03, cr.h * 0.16, white, 7 + b); });
        // flows
        [-1, 1].forEach(function (sd) { arrow(ctx, ccx + sd * cr.w * 0.45, sea - 8, ccx + sd * (eyeW + cr.w * 0.13), sea - 8, { color: k.rust, w: 2.2, head: 8 }); arrow(ctx, ccx + sd * (eyeW + cr.w * 0.06), sea - 20, ccx + sd * (eyeW + cr.w * 0.06), cr.y + cr.h * 0.25, { color: k.red, w: 3, head: 9 }); arrow(ctx, ccx + sd * cr.w * 0.14, cr.y + cr.h * 0.14, ccx + sd * cr.w * 0.46, cr.y + cr.h * 0.14, { color: k.rust, w: 2, head: 8 }); arrow(ctx, ccx + sd * eyeW * 0.5, cr.y + cr.h * 0.3, ccx + sd * eyeW * 0.5, sea - 30, { color: k.blue, w: 2, head: 8 }); });
        if (!F.quiet && cr.w > 380) { txt(ctx, 'outflow aloft', ccx + cr.w * 0.3, cr.y + cr.h * 0.06, { size: 10, color: k.ink, align: 'center', halo: k.halo }); txt(ctx, 'eyewall: rising air, heat released', ccx + eyeW + cr.w * 0.12, cr.y + cr.h * 0.42, { size: 10, color: k.red, bold: true, halo: k.halo }); txt(ctx, 'eye: sinking, clear', ccx, sea - 18, { size: 10, color: k.blue, bold: true, align: 'center', halo: k.halo }); txt(ctx, 'moist air spirals in', cr.x + cr.w * 0.02, sea - 20, { size: 10, color: k.rust, halo: k.halo }); }
        // --- storm surge on a coastline
        var sr = wide ? { x: w * 0.46, y: h * 0.6, w: w * 0.52, h: h * 0.36 } : { x: 10, y: cr.y + cr.h + 14, w: w - 20, h: h - cr.y - cr.h - 24 }, gnd = function (f) { return f < 0.35 ? -3 + f / 0.35 * 3 : (f - 0.35) * 8; }; // ground height (m) across the panel
        var mPx = sr.h / 12, base = sr.y + sr.h * 0.62, Yh = function (m) { return base - m * mPx; };
        ctx.fillStyle = k.dark ? '#1b2e40' : '#eef6fc'; ctx.fillRect(sr.x, sr.y, sr.w, sr.h);
        ctx.fillStyle = k.dark ? '#2d6c99' : 'rgba(74,143,196,0.85)'; ctx.beginPath(); ctx.moveTo(sr.x, Yh(S.surge)); ctx.lineTo(sr.x + sr.w, Yh(S.surge)); ctx.lineTo(sr.x + sr.w, sr.y + sr.h); ctx.lineTo(sr.x, sr.y + sr.h); ctx.closePath(); ctx.fill();
        poly(ctx, [[sr.x, sr.y + sr.h]].concat(Array.from({ length: 51 }, function (_, i) { return [sr.x + i / 50 * sr.w, Yh(gnd(i / 50))]; })).concat([[sr.x + sr.w, sr.y + sr.h]]), k.sand);
        line(ctx, [[sr.x, Yh(0)], [sr.x + sr.w * 0.3, Yh(0)]], { color: '#fff', w: 1.2, dash: [4, 3] }); txt(ctx, 'normal sea level', sr.x + 4, Yh(0) + 10, { size: 9.5, color: '#fff' });
        [0.5, 0.65, 0.8].forEach(function (f) { var hx = sr.x + f * sr.w, hy = Yh(gnd(f)), hw = 22, hh = 16; ctx.fillStyle = k.dark ? '#c9b48a' : '#e8d9b5'; ctx.fillRect(hx - hw / 2, hy - hh, hw, hh); poly(ctx, [[hx - hw / 2 - 3, hy - hh], [hx, hy - hh - 10], [hx + hw / 2 + 3, hy - hh]], k.rust); var dep = S.surge - gnd(f); if (dep > 0) txt(ctx, ft ? fm(dep / 0.3048, 0) + ' ft' : fm(dep, 1) + ' m', hx, hy - hh - 16, { size: 10, color: k.ink, bold: true, align: 'center', halo: k.halo }); });
        txt(ctx, 'storm surge pushed ashore by the wind', sr.x + 6, sr.y + 12, { size: 10.5, color: k.ink, bold: true });
        Array.prototype.forEach.call(tb.tBodies[0].rows, function (rw, i) { rw.className = i === cat - 1 && !F.quiet ? 'hi' : ''; });
        T.cat(cat ? 'Category ' + cat : 'below hurricane strength (under 74 mph)'); T.surge(ft ? fm(S.surge / 0.3048, 0) + ' ft' : fm(S.surge, 1) + ' m');
        F.alt('A hurricane from above (spiral rain bands around an eye) and in cross-section (warm ocean, eyewall, outflow, sinking eye), and a coastline with storm surge.');
        F.say('A hurricane draws its energy from warm ocean water (at least about 26.5 °C): vapor condenses in the eyewall and releases heat. The Saffir–Simpson category counts only the wind: ' + S.mph + ' mph is ' + (cat ? '<b>Category ' + cat + '</b>' : 'below hurricane strength') + '. Storm surge and flooding rain, which the category does not measure, cause most hurricane deaths; even a weak storm can bring a deadly surge.', 'Warm ocean water powers a hurricane; the category measures only wind.');
      };
    }
  });

  /* es-climate-data: Climate Data.
     opts:
       mode: 'climograph' | 'series' | 'anomaly'      modes: true or a list for tabs
       city: one of singapore, miami, mumbai, darwin, phoenix, cairo, lima, denver, rome, seattle, capetown, london, sydney, chicago,
         moscow, fairbanks, yakutsk, utqiagvik; or data: {temp: [12 °C], precip: [12 mm], name}
       units: 'metric' | 'us'; koppen: true (the step-by-step classification; default true)
       preset: 'temperature' | 'co2' | 'sealevel' | 'seaice' | 'icecore' (series); baseline: [y1, y2] (temperature); window: running
         mean in years (0 = off); trend: true; range: [y1, y2] (the trend and zoom range); season: true (CO₂ seasonal cycle);
         projections: true (IPCC AR6 warming by 2081–2100)
       year: the year for the anomaly mode (default 2024)
       quiet: hides the climate class, the city name, the trend slope and the anomaly values; lock
     Data notes: the climographs are rounded normals for teaching; the records were entered by hand, rounded (see the models). */
  R('es-climate-data', function (el, o) {
    var F = frame(el, o, 'Climate data', { aspect: 1.6, max: 480 });
    var USU = o.units === 'us', MON = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    return F.modes({ climograph: climo, series: series, anomaly: anomaly }, { climograph: 'Climograph', series: 'Climate records', anomaly: 'Anomaly' });

    function climo(F) {
      F.size({ aspect: 1.75, max: 420, narrow: 0.95 });
      var cityKey = EM.CITIES[o.city] ? o.city : 'london', data = o.data ? { n: o.data.name || 'Mystery place', T: o.data.temp.map(Number), P: o.data.precip.map(Number), lat: null } : null, kop = o.koppen !== false, us = USU;
      if (!o.data && !F.lock) select(F.ctl, 'Place', Object.keys(EM.CITIES).map(function (kk) { return [kk, F.quiet ? 'Place ' + (Object.keys(EM.CITIES).indexOf(kk) + 1) : EM.CITIES[kk].n]; }), cityKey, function (v) { cityKey = v; F.redraw(); });
      if (!o.units) V.seg(F.ctl, { label: 'Units', items: [['metric', '°C, mm'], ['us', '°F, in']], value: us ? 'us' : 'metric', change: function (v) { us = v === 'us'; F.redraw(); } });
      var steps = mk('ol', 'esv-steps'); F.el.insertBefore(steps, F.statsEl); F._rows.push(steps);
      var T = F.tiles([{ k: 'cls', label: 'Climate class (Köppen)', secret: true }, { k: 'tot', label: 'Year: mean temperature, total precipitation', secret: false }]);
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, d = data || EM.CITIES[cityKey], r = { x: 46, y: 26, w: w - 96, h: h - 62 };
        var Tv = d.T.map(function (t) { return us ? EM.cToF(t) : t; }), Pv = d.P.map(function (p) { return us ? p / 25.4 : p; });
        var tmin = us ? M.min(20, M.floor(M.min.apply(null, Tv) / 20) * 20) : M.min(-10, M.floor(M.min.apply(null, Tv) / 10) * 10), tmax = us ? 100 : 40, pmax = us ? 20 : 500;
        if (M.max.apply(null, Pv) > pmax * 0.9) pmax = us ? 40 : 1000;
        var c = chart(ctx, k, r, { x: { min: 0, max: 12, ticks: [], labels: false, grid: false }, y: { min: tmin, max: tmax, step: us ? 20 : 10, label: us ? 'Temperature (°F)' : 'Temperature (°C)', lpad: 34 } });
        var bw = r.w / 12;
        Pv.forEach(function (p, i) { var hh = p / pmax * r.h; ctx.fillStyle = rgba(k.blue, 0.55); ctx.fillRect(r.x + i * bw + bw * 0.15, r.y + r.h - hh, bw * 0.7, hh); txt(ctx, MON[i], r.x + (i + 0.5) * bw, r.y + r.h + 10, { size: 11, color: k.muted, align: 'center' }); });
        for (var pv = 0; pv <= pmax; pv += pmax / 5) txt(ctx, fm(pv, 0), r.x + r.w + 6, r.y + r.h - pv / pmax * r.h, { size: 11, color: k.blue });
        txt(ctx, us ? 'Precipitation (in)' : 'Precipitation (mm)', r.x + r.w + 40, r.y + r.h / 2, { size: 12, color: k.blue, align: 'center', rot: PI / 2 });
        if (tmin < 0) line(ctx, [[r.x, c.Y(us ? 32 : 0)], [r.x + r.w, c.Y(us ? 32 : 0)]], { color: k.muted, w: 1, dash: [4, 3] });
        line(ctx, Tv.map(function (t, i) { return [r.x + (i + 0.5) * bw, c.Y(t)]; }), { color: k.red, w: 2.6 }); Tv.forEach(function (t, i) { circle(ctx, r.x + (i + 0.5) * bw, c.Y(t), 3, k.red); });
        txt(ctx, F.quiet ? 'Mystery place' : d.n + (d.lat != null ? ' (' + fm(M.abs(d.lat), 1) + '°' + (d.lat >= 0 ? 'N' : 'S') + ')' : ''), r.x, 12, { size: 12.5, color: k.ink, bold: true });
        var K = EM.koppen(d.T, d.P), MAT = K.MAT, MAP = K.MAP;
        T.cls(K.code + ': ' + K.name); T.tot((us ? fm(EM.cToF(MAT), 0) + ' °F, ' + fm(MAP / 25.4, 1) + ' in' : fm(MAT, 1) + ' °C, ' + nf(MAP) + ' mm'));
        // the Köppen steps
        steps.hidden = !kop || F.quiet;
        var tf = function (t) { return us ? fm(EM.cToF(t), 0) + ' °F' : fm(t, 1) + ' °C'; };
        var vals = [tf(K.Tw), (us ? fm(MAP / 25.4, 1) + ' in vs ' + fm(K.Pth / 25.4, 1) + ' in' : nf(MAP) + ' mm vs ' + nf(K.Pth) + ' mm'), tf(K.Tc), tf(K.Tc)];
        steps.innerHTML = K.steps.map(function (s, i) { return '<li>' + s.q.replace('18 °C', us ? '64 °F' : '18 °C').replace('−3 °C', us ? '27 °F' : '−3 °C').replace('10 °C', us ? '50 °F' : '10 °C') + ' <b>' + (s.v ? 'Yes' : 'No') + '</b> (' + vals[i] + ')</li>'; }).join('') + '<li>So: <b>' + K.code + ', ' + K.name + '</b>. (Thresholds: Peel and others, 2007; dryness threshold 20 × mean temperature + 0, 140 or 280 mm by how much rain falls in the warmer half of the year.)</li>';
        F.alt('A climograph' + (F.quiet ? '' : ' for ' + d.n) + ': monthly temperature as a line and precipitation as bars.');
        F.say((F.quiet ? '' : '<b>' + d.n + '</b>: ') + 'warmest month ' + tf(K.Tw) + ', coldest ' + tf(K.Tc) + '. ' + (K.south ? 'The warm months are December to February: a Southern Hemisphere place. ' : '') + (K.group === 'B' ? 'Dry climates are set by rain, not heat: some deserts are cool. ' : '') + 'A climate is the average over decades; one cold week says little about it.', 'Monthly temperature (line) and precipitation (bars).');
      };
    }

    function series(F) {
      F.size({ aspect: 1.75, max: 440, narrow: 0.9 });
      var PRE = { temperature: 'Global temperature (NASA)', co2: 'CO₂ at Mauna Loa (NOAA)', sealevel: 'Sea level from satellites', seaice: 'Arctic sea ice in September (NSIDC)', icecore: 'Ice core: 800,000 years' };
      var S = { pre: PRE[o.preset] ? o.preset : 'temperature', win: num(o.window, 0), trend: o.trend !== false && !!o.trend, base: o.baseline || null, rng: o.range || null, season: !!o.season, proj: !!o.projections };
      if (!F.lock) select(F.ctl, 'Record', Object.keys(PRE).map(function (kk) { return [kk, PRE[kk]]; }), S.pre, function (v) { S.pre = v; S.rng = null; mkCtl(); F.redraw(); });
      var row = F.row(), rf = null, rt = null;
      var T = F.tiles([{ k: 'tr', label: 'Trend (least squares)', secret: true }, { k: 'last', label: 'Latest value', secret: false }]);
      function data() {
        if (S.pre === 'temperature') return EM.GISTEMP.v.map(function (v, i) { return [EM.GISTEMP.y0 + i, v]; });
        if (S.pre === 'co2') return EM.MLO.v.map(function (v, i) { return [EM.MLO.y0 + i, v]; });
        if (S.pre === 'seaice') return EM.SEAICE.v.map(function (v, i) { return [EM.SEAICE.y0 + i, v]; });
        if (S.pre === 'sealevel') { var out = []; for (var y = 1993; y <= 2024; y++) out.push([y, EM.seaLevel(y)]); return out; }
        return EM.EPICA.slice().reverse().map(function (q) { return [-q[0], q[1]]; });
      }
      function mkCtl() {
        row.innerHTML = ''; var dd = data(), y0 = dd[0][0], y1 = dd[dd.length - 1][0], ice = S.pre === 'icecore';
        if (!ice) { var r0 = S.rng ? S.rng[0] : y0, r1 = S.rng ? S.rng[1] : y1; S.rng = [r0, r1];
          rf = V.slider(row, { label: 'From', min: y0, max: y1 - 5, step: 1, value: r0, fmt: function (v) { return String(v); }, input: function (v) { S.rng[0] = M.min(v, S.rng[1] - 5); F.redraw(); } });
          rt = V.slider(row, { label: 'To', min: y0 + 5, max: y1, step: 1, value: r1, fmt: function (v) { return String(v); }, input: function (v) { S.rng[1] = M.max(v, S.rng[0] + 5); F.redraw(); } });
          check(row, 'Trend line', S.trend, function (v) { S.trend = v; F.redraw(); });
          if (S.pre === 'temperature' || S.pre === 'seaice') select(row, 'Running mean', [['0', 'off'], ['5', '5 years'], ['10', '10 years'], ['30', '30 years']], String(S.win), function (v) { S.win = +v; F.redraw(); });
          if (S.pre === 'temperature') { select(row, 'Baseline', [['1951-1980', '1951–1980'], ['1991-2020', '1991–2020'], ['1880-1900', '1880–1900']], S.base ? S.base.join('-') : '1951-1980', function (v) { S.base = v.split('-').map(Number); F.redraw(); }); check(row, 'Projections', S.proj, function (v) { S.proj = v; F.redraw(); }); }
          if (S.pre === 'co2') check(row, 'Seasonal cycle', S.season, function (v) { S.season = v; F.redraw(); });
        }
      }
      mkCtl();
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, dd = data(), ice = S.pre === 'icecore', proj = S.pre === 'temperature' && S.proj, r = { x: 56, y: 22, w: w - 72 - (proj ? M.min(170, w * 0.28) : 0) - (ice ? 40 : 0), h: h - 62 };
        var base = 0; if (S.pre === 'temperature' && S.base) { var bs = dd.filter(function (q) { return q[0] >= S.base[0] && q[0] <= S.base[1]; }); base = bs.reduce(function (a, q) { return a + q[1]; }, 0) / bs.length; }
        dd = dd.map(function (q) { return [q[0], q[1] - base]; });
        var vis = ice ? dd : dd.filter(function (q) { return q[0] >= S.rng[0] && q[0] <= S.rng[1]; }), x0 = vis[0][0], x1 = vis[vis.length - 1][0];
        var pts = vis.slice(); if (S.pre === 'co2' && S.season && x1 - x0 <= 15) { pts = []; vis.forEach(function (q) { for (var m = 0; m < 12; m++) pts.push([q[0] + (m + 0.5) / 12, q[1] + EM.MLO_SEASON[m]]); }); }
        var ys = pts.map(function (q) { return q[1]; }), ymin = M.min.apply(null, ys), ymax = M.max.apply(null, ys), pad = (ymax - ymin) * 0.1 || 1;
        if (proj) { ymax = M.max(ymax, 1.6); }
        var unit = { temperature: '°C', co2: 'ppm', sealevel: 'mm', seaice: 'million km²', icecore: 'ppm' }[S.pre];
        var ylab = { temperature: 'Temperature anomaly (°C, vs ' + (S.base ? S.base.join('–') : '1951–1980') + ')', co2: 'CO₂ (ppm)', sealevel: 'Sea level (mm above 1993)', seaice: 'Extent (million km²)', icecore: 'CO₂ (ppm)' }[S.pre];
        var c = chart(ctx, k, r, { x: { min: x0, max: x1, step: ice ? 100 : niceStep(x1 - x0, 6), label: ice ? 'Thousand years ago' : 'Year', fmt: function (v) { return ice ? String(-v) : String(v); } }, y: { min: S.pre === 'seaice' || S.pre === 'sealevel' ? 0 : M.floor((ymin - pad) * 10) / 10, max: M.ceil((ymax + pad) * 10) / 10, label: ylab, lpad: 44, fmt: function (v) { return fm(v, S.pre === 'temperature' ? 1 : 0); } } });
        c.clip();
        if (S.pre === 'temperature') line(ctx, [[r.x, c.Y(0)], [r.x + r.w, c.Y(0)]], { color: k.axis, w: 1 });
        if (S.pre === 'temperature' || S.pre === 'seaice') { var bw = r.w / (x1 - x0 + 1); vis.forEach(function (q) { var y0 = S.pre === 'temperature' ? c.Y(0) : c.Y(0); ctx.fillStyle = S.pre === 'temperature' ? (q[1] >= 0 ? rgba(k.red, 0.55) : rgba(k.blue, 0.55)) : rgba(k.blue, 0.45); var yy = c.Y(q[1]); ctx.fillRect(c.X(q[0]) - bw * 0.4, M.min(yy, y0), bw * 0.8, M.abs(y0 - yy)); }); }
        else line(ctx, pts.map(function (q) { return [c.X(q[0]), c.Y(q[1])]; }), { color: S.pre === 'co2' ? k.ink : S.pre === 'icecore' ? k.ink : k.blue, w: 2.2 });
        if (ice) { // the temperature on a second axis, and today's CO₂
          var tY = function (t) { return r.y + r.h - (t + 10) / 14 * r.h; }; line(ctx, EM.EPICA.map(function (q) { return [c.X(-q[0]), tY(q[2])]; }), { color: k.red, w: 1.8, dash: [5, 3] });
          c.unclip(); [-10, -5, 0, 4].forEach(function (t) { txt(ctx, (t > 0 ? '+' : '') + t, r.x + r.w + 6, tY(t), { size: 10.5, color: k.red }); }); txt(ctx, 'Antarctic temperature change (°C)', r.x + r.w + 30, r.y + r.h / 2, { size: 11, color: k.red, align: 'center', rot: PI / 2 }); c.clip();
          line(ctx, [[r.x, c.Y(M.min(420, c.iy(r.y)))], [r.x + r.w, c.Y(M.min(420, c.iy(r.y)))]], { color: k.rust, w: 1.5, dash: [4, 3] });
        }
        // running mean
        if (S.win > 1 && !ice) { var rm = []; for (var i = 0; i < dd.length; i++) { var lo = i - M.floor(S.win / 2), hi = lo + S.win; if (lo < 0 || hi > dd.length) continue; var sm = 0; for (var j = lo; j < hi; j++) sm += dd[j][1]; var yr = dd[i][0]; if (yr >= x0 && yr <= x1) rm.push([c.X(yr), c.Y(sm / S.win)]); } line(ctx, rm, { color: k.ink, w: 2.6 }); }
        // trend
        var slope = null; if (S.trend && !ice) { slope = EM.slope(vis); var mx = vis.reduce(function (a, q) { return a + q[0]; }, 0) / vis.length, my = vis.reduce(function (a, q) { return a + q[1]; }, 0) / vis.length; line(ctx, [[c.X(x0), c.Y(my + slope * (x0 - mx))], [c.X(x1), c.Y(my + slope * (x1 - mx))]], { color: k.rust, w: 2.4, dash: [7, 4] }); }
        c.unclip();
        if (ice) txt(ctx, w < 560 ? 'today: about 420 ppm' : 'today: about 420 ppm, far above anything in this record', r.x + 6, r.y + 10, { size: 11, color: k.rust, bold: true, halo: k.halo });
        // projections: AR6 warming by 2081–2100 vs 1850–1900
        if (proj) { var px = r.x + r.w + 26, pw = w - px - 10, pr = { x: px, y: r.y, w: pw, h: r.h }, pc = chart(ctx, k, pr, { x: { min: 0, max: 5, ticks: [], labels: false, grid: false }, y: { min: 0, max: 6, step: 1, right: true, fmt: function (v) { return v + '°'; } } }); EM.SSP.forEach(function (sp, i) { var bx = px + (i + 0.5) * pw / 5; line(ctx, [[bx, pc.Y(sp[2])], [bx, pc.Y(sp[3])]], { color: rgba(k.red, 0.5), w: pw / 8 }); circle(ctx, bx, pc.Y(sp[1]), 3.5, k.red); if (pw / 5 >= 34) txt(ctx, sp[0].replace('SSP', ''), bx, pr.y + pr.h + 10, { size: 8.5, color: k.muted, align: 'center' }); else txt(ctx, sp[0].replace('SSP', ''), bx, pr.y + pr.h + 4, { size: 8.5, color: k.muted, align: 'right', rot: -PI / 2 }); }); txt(ctx, 'By 2081–2100', px, r.y - 10, { size: 9.5, color: k.ink, bold: true }); }
        var last = dd[dd.length - 1];
        T.tr(slope == null ? '—' : (slope > 0 ? '+' : '') + sig(slope * 10, 2) + ' ' + unit + ' per decade (' + x0 + '–' + x1 + ')'); T.last(ice ? '—' : fm(last[1], S.pre === 'co2' ? 1 : S.pre === 'sealevel' ? 0 : 2) + ' ' + unit + ' (' + last[0] + ')');
        var note = { temperature: 'NASA GISTEMP v4 yearly global means, rounded.', co2: 'NOAA Mauna Loa yearly means, rounded.' + (S.season ? (x1 - x0 <= 15 ? ' Monthly shape: the yearly mean plus the average seasonal cycle, not monthly measurements.' : ' Zoom to 15 years or fewer to see the seasonal cycle.') : ''), sealevel: 'A smooth fit to the satellite record (NASA), not the measurements themselves.', seaice: 'NSIDC September averages, rounded.', icecore: 'A sketch drawn after the EPICA Dome C ice core: shape only, not the data.' }[S.pre];
        F.alt('A chart of ' + PRE[S.pre] + (slope != null && !F.quiet ? ' with a trend of ' + sig(slope * 10, 2) + ' ' + unit + ' per decade.' : '.'));
        F.say(note + ' ' + { temperature: 'Single years bounce around; the trend over decades is the climate signal. A running mean smooths the bounces. Changing the baseline moves the zero line, not the trend.' + (S.proj ? ' The bars at the right are the IPCC AR6 projections of warming by 2081–2100 compared with 1850–1900 for five emission paths (dot: best estimate; bar: very likely range). Projections of climate aren\u2019t weather forecasts: they give the average over decades, not the weather on a given day.' : ''), co2: 'CO₂ dips every Northern summer as plants grow, then rises again; the yearly dip is not a reversal, and every yearly mean has been higher than the last.', sealevel: 'Rising about 10 cm since 1993, and faster now (about 4.5 mm a year) than in the 1990s.', seaice: 'Single years jump around, but September ice has shrunk by about a third since 1979.', icecore: 'Over 800,000 years, CO₂ and Antarctic temperature rose and fell together through ice ages about every 100,000 years, between about 180 and 300 ppm.' }[S.pre], 'Read the record.');
      };
    }

    function anomaly(F) {
      F.size({ aspect: 1.9, max: 360, narrow: 1.0 });
      var S = { y: clamp(M.round(num(o.year, 2024)), 1880, 2024), b: o.baseline ? o.baseline.join('-') : '1951-1980' };
      var T = F.tiles([{ k: 'an', label: 'Anomaly', secret: true }, { k: 'nrm', label: 'Baseline (normal) period', secret: false }]);
      V.slider(F.ctl, { label: 'Year', min: 1880, max: 2024, step: 1, value: S.y, fmt: function (v) { return String(v); }, input: function (v) { S.y = v; F.redraw(); } });
      V.seg(F.ctl, { label: 'Normal', items: [['1951-1980', '1951–1980'], ['1991-2020', '1991–2020']], value: S.b, change: function (v) { S.b = v; F.redraw(); } });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, g = EM.GISTEMP, b = S.b.split('-').map(Number), bs = g.v.slice(b[0] - g.y0, b[1] - g.y0 + 1), nrm = bs.reduce(function (a, v) { return a + v; }, 0) / bs.length, v = g.v[S.y - g.y0] - nrm;
        var r = { x: 60, y: 20, w: w - 80, h: h - 50 }, c = chart(ctx, k, r, { x: { min: -1.6, max: 1.6, step: 0.4, label: 'Difference from the ' + b.join('–') + ' normal (°C)', fmt: function (x) { return (x > 0 ? '+' : '') + fm(x, 1); } }, y: { min: 0, max: 1, labels: false, grid: false } });
        line(ctx, [[c.X(0), r.y], [c.X(0), r.y + r.h]], { color: k.ink, w: 2 }); txt(ctx, 'normal', c.X(0), r.y + 10, { size: 10.5, color: k.ink, bold: true, align: 'center', halo: k.halo });
        ctx.fillStyle = v >= 0 ? k.red : k.blue; ctx.fillRect(M.min(c.X(0), c.X(v)), r.y + r.h * 0.35, M.abs(c.X(v) - c.X(0)), r.h * 0.3);
        txt(ctx, String(S.y), r.x - 8, r.y + r.h * 0.5, { size: 13, color: k.ink, bold: true, align: 'right' });
        if (!F.quiet) txt(ctx, (v > 0 ? '+' : '') + fm(v, 2) + ' °C', c.X(v) + (v >= 0 ? 6 : -6), r.y + r.h * 0.5, { size: 12, color: k.ink, bold: true, align: v >= 0 ? 'left' : 'right', halo: k.halo });
        T.an((v > 0 ? '+' : '') + fm(v, 2) + ' °C'); T.nrm(b.join('–') + ' (mean ' + (nrm > 0 ? '+' : '') + fm(nrm, 2) + ' on the 1951–1980 scale)');
        F.alt('An anomaly bar: global temperature in ' + S.y + ' compared with the ' + b.join('–') + ' normal' + (F.quiet ? '.' : ': ' + fm(v, 2) + ' degrees.'));
        F.say('An anomaly is a value minus its normal (a 30-year average): ' + S.y + ' was ' + (F.quiet ? '' : '<b>' + (v > 0 ? '+' : '') + fm(v, 2) + ' °C</b> ') + 'compared with ' + b.join('–') + '. A later, warmer normal makes the same year look less unusual, but it doesn’t change the year. Anomaly maps show differences from normal, not temperatures.', 'An anomaly is a value minus its normal.');
      };
    }
  });

  /* es-carbon: Carbon Cycle.
     opts:
       emissions: GtC per year (fossil fuels plus land use; default 11.3); years: how long to run (default 30); airborne: a fixed share
       that stays in the air (0–1, to match a problem; default: the simple model decides, about 0.45 today)
       fast: true (the fast cycle; default true); slow: true (the slow cycle; default true); highlight: a reservoir (air, plants, soils,
       surface, deep, fossil, rocks) or flux (photo, resp, oceanIn, oceanOut, mixing, fossil, landUse, volcano, weathering, burial)
       blank: true (letters on the fluxes); quiet: hides ppm, fractions and flux values; lock */
  R('es-carbon', function (el, o) {
    var F = frame(el, o, 'Carbon cycle', { aspect: 1.6, max: 560 });
    F.size({ aspect: 1.55, max: 600, narrow: 0.5 });
    var C = EM.CARBON, S = { e: clamp(num(o.emissions, 11.3), 0, 25), yrs: clamp(M.round(num(o.years, 30)), 1, 100), af: o.airborne != null ? clamp(num(o.airborne, 0.45), 0, 1) : null, fast: o.fast !== false, slow: o.slow !== false, hl: o.highlight || null }, B = !!o.blank || F.letters;
    var T = F.tiles([{ k: 'ppm', label: 'CO₂ at the end of the run', secret: true }, { k: 'rise', label: 'Rise in the first year', secret: true }, { k: 'af', label: 'Share that stays in the air', secret: true }]);
    V.slider(F.ctl, { label: 'Emissions', min: 0, max: 25, step: 0.1, value: S.e, fmt: function (v) { return fm(v, 1) + ' GtC/yr'; }, input: function (v) { S.e = v; F.redraw(); } });
    V.slider(F.ctl, { label: 'Years', min: 1, max: 100, step: 1, value: S.yrs, fmt: function (v) { return v + ' yr'; }, input: function (v) { S.yrs = v; F.redraw(); } });
    var row = F.row(); check(row, 'Fast cycle (years to centuries)', S.fast, function (v) { S.fast = v; F.redraw(); }); check(row, 'Slow cycle (millions of years)', S.slow, function (v) { S.slow = v; F.redraw(); });
    var RES = { air: ['Atmosphere', 0.5, 0.1, C.res.air], plants: ['Land plants', 0.17, 0.36, C.res.plants], soils: ['Soils (and 1,400 in permafrost)', 0.17, 0.64, C.res.soils], surface: ['Surface ocean', 0.83, 0.36, C.res.surface], deep: ['Deep ocean', 0.83, 0.64, C.res.deep], fossil: ['Fossil fuels (reserves)', 0.5, 0.62, '1,000–2,000'], rocks: ['Rocks and sediments', 0.5, 0.9, 'tens of millions'] };
    // [key, from, to, value text, group, bend]
    var FLX = [['photo', 'air', 'plants', C.flux.photo, 'fast', -0.12, 'photosynthesis'], ['resp', 'plants', 'air', C.flux.resp, 'fast', -0.12, 'respiration and decay'], ['oceanIn', 'air', 'surface', C.flux.oceanIn, 'fast', 0.12, 'ocean takes up'], ['oceanOut', 'surface', 'air', C.flux.oceanOut, 'fast', 0.12, 'ocean gives off'], ['mixing', 'surface', 'deep', '90–100', 'fast', 0.2, 'mixing and sinking'], ['fossil', 'fossil', 'air', C.flux.fossil, 'human', 0, 'burning fossil fuels'], ['landUse', 'plants', 'air', C.flux.landUse, 'human', 0.3, 'land clearing'], ['volcano', 'rocks', 'air', C.flux.volcano, 'slow', -0.3, 'volcanoes'], ['weathering', 'air', 'rocks', C.flux.weathering, 'slow', 0.35, 'rock weathering'], ['burial', 'deep', 'rocks', C.flux.burial, 'slow', 0.15, 'burial in sediments']];
    F.draw = function () {
      var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 640, dw = wide ? w * 0.62 : w, dh = wide ? h : h * 0.6;
      function P(key) { var q = RES[key]; return [q[1] * dw, q[2] * dh]; }
      ctx.fillStyle = k.dark ? '#14262f' : '#f2f7f9'; ctx.fillRect(0, 0, dw, dh);
      ctx.fillStyle = k.dark ? '#183f5e' : '#cfe3f2'; ctx.fillRect(dw * 0.66, dh * 0.28, dw * 0.34, dh * 0.5); ctx.fillStyle = k.dark ? '#33472c' : '#e4eed7'; ctx.fillRect(0, dh * 0.28, dw * 0.34, dh * 0.5); ctx.fillStyle = k.dark ? '#3b342c' : '#e8dfd3'; ctx.fillRect(0, dh * 0.78, dw, dh * 0.22);
      var LB = labeler(ctx), n = 0;
      FLX.forEach(function (f) {
        var grp = f[4]; if ((grp === 'fast' && !S.fast) || (grp === 'slow' && !S.slow)) return;
        var a = P(f[1]), b = P(f[2]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = M.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, bend = f[5] * L, cx = mx + nx * bend, cy = my + ny * bend;
        var col = grp === 'human' ? k.red : grp === 'slow' ? k.muted : k.green, on = S.hl === f[0], val = typeof f[3] === 'number' ? f[3] : null, lw = val != null ? clamp(1.2 + M.sqrt(val) * 0.5, 1.4, 7) : 4;
        var sa = 0.2, ea = 0.8, pt = function (t) { return [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * cx + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * cy + t * t * b[1]]; };
        var pts = []; for (var t = sa; t <= ea + 1e-9; t += 0.03) pts.push(pt(t)); line(ctx, pts, { color: col, w: on ? lw + 2 : lw, alpha: S.hl && !on ? 0.4 : 1 });
        var e1 = pts[pts.length - 2], e2 = pts[pts.length - 1]; arrowHead(ctx, e2[0], e2[1], M.atan2(e2[1] - e1[1], e2[0] - e1[0]), 8 + lw, col);
        var lp = pt(0.5), lab = B ? null : (F.quiet ? f[6] : f[6] + ' ' + (val != null ? (val < 1 ? fm(val, 1) : nf(val, val < 10 ? 1 : 0)) : f[3]));
        if (B) badge(ctx, LETTERS[n], lp[0], lp[1], { k: k, r: 10 }); else LB.put(lab, lp[0], lp[1], { size: wide ? 10.5 : 9.5, color: col === k.muted ? k.ink : col, bold: true, align: 'center', halo: k.halo }, [0, 12, -12, 24, -24]);
        n++;
      });
      Object.keys(RES).forEach(function (key) {
        var q = RES[key], p = P(key), on = S.hl === key, bw = M.min(dw * 0.3, 150), bh = 38; if (key === 'fossil' && !S.slow && !S.e) return;
        ctx.save(); ctx.fillStyle = k.panel; ctx.strokeStyle = on ? k.gold : k.axis; ctx.lineWidth = on ? 3 : 1.5; rrect(ctx, p[0] - bw / 2, p[1] - bh / 2, bw, bh, 8); ctx.fill(); ctx.stroke(); ctx.restore();
        txt(ctx, q[0].replace(' (and 1,400 in permafrost)', ''), p[0], p[1] - 8, { size: wide ? 11.5 : 10, color: k.ink, bold: true, align: 'center' });
        txt(ctx, typeof q[3] === 'number' ? nf(q[3]) + ' GtC' : q[3] + (wide ? ' GtC' : ''), p[0], p[1] + 9, { size: wide ? 10.5 : 9.5, color: k.muted, align: 'center' });
      });
      if (wide) txt(ctx, 'GtC = billion tonnes of carbon; arrows in GtC per year; rounded', 8, dh - 8, { size: 9.5, color: k.muted }); else { txt(ctx, 'GtC = billion tonnes of carbon', 8, dh - 20, { size: 9.5, color: k.muted }); txt(ctx, 'arrows: GtC per year, rounded', 8, dh - 8, { size: 9.5, color: k.muted }); }
      // the run
      var run = EM.carbonRun(S.e, S.yrs, S.af), rx = wide ? dw + 50 : 50, ry = wide ? 26 : dh + 26, rw2 = wide ? w - dw - 64 : w - 64, rh2 = wide ? h * 0.42 : (h - dh) * 0.48;
      var ppm0 = C.now.ppm, ppms = [ppm0].concat(run.map(function (q) { return q.ppm; })), pmin = M.floor(M.min.apply(null, ppms) / 10) * 10, pmax = M.ceil(M.max.apply(null, ppms) / 10) * 10 + 10;
      var c = chart(ctx, k, { x: rx, y: ry, w: rw2, h: rh2 }, { x: { min: C.now.year, max: C.now.year + S.yrs, step: M.max(1, niceStep(S.yrs, 4)), label: 'Year', fmt: function (v) { return String(v); } }, y: { min: pmin, max: pmax, step: niceStep(pmax - pmin, 4), label: 'CO₂ (ppm)', lpad: 38 } });
      line(ctx, ppms.map(function (p, i) { return [c.X(C.now.year + i), c.Y(p)]; }), { color: k.ink, w: 2.4 });
      // where this year's emissions went
      var y1 = run[0], pr = M.min(rw2 * 0.22, (wide ? h - ry - rh2 - 70 : h - ry - rh2 - 60) / 2), pcx = rx + pr + 4, pcy = ry + rh2 + 46 + pr;
      txt(ctx, 'Where the first year’s emissions went', rx - 40, ry + rh2 + 34, { size: 11, color: k.ink, bold: true });
      if (y1.e > 0 && pr > 10) { var a0 = -PI / 2; [[y1.air, k.ink, 'air'], [y1.ocean, k.blue, 'ocean'], [y1.land, k.green, 'land']].forEach(function (s, i) { var a1 = a0 + M.max(0, s[0]) / y1.e * TAU; ctx.beginPath(); ctx.moveTo(pcx, pcy); ctx.arc(pcx, pcy, pr, a0, a1); ctx.closePath(); ctx.fillStyle = s[1]; ctx.fill(); a0 = a1; txt(ctx, s[2] + (F.quiet ? '' : ' ' + fm(M.max(0, s[0]) / y1.e * 100, 0) + '%'), pcx + pr + 12, pcy - 16 + i * 16, { size: 10.5, color: s[1] === k.ink ? k.ink : s[1], bold: true }); }); }
      var last = run[run.length - 1];
      T.ppm(fm(last.ppm, 0) + ' ppm after ' + S.yrs + ' yr'); T.rise(fm(y1.air, 2) + ' GtC ÷ 2.124 = ' + fm(y1.air / EM.PPM_GTC, 2) + ' ppm'); T.af(y1.e > 0 ? fm(y1.af * 100, 0) + '%' : '—');
      F.legend([{ c: k.green, t: 'fast cycle', line: true }, { c: k.red, t: 'from people', line: true }, { c: k.muted, t: 'slow cycle', line: true }]);
      F.alt('A carbon-cycle diagram of reservoirs and yearly flows, with a run of CO₂ in the air for ' + S.yrs + ' years of emissions at ' + fm(S.e, 1) + ' GtC per year.');
      F.say('Plants build themselves from CO₂ in the air (photosynthesis), not from soil. Of each year’s emissions, only about ' + fm((S.af != null ? S.af : y1.af) * 100, 0) + '% stays in the air; the ocean and land take up the rest, but that carbon is still in the cycle. Each 2.124 GtC added to the air raises CO₂ by 1 ppm: this year ' + fm(y1.air, 1) + ' GtC → <b>' + fm(y1.air / EM.PPM_GTC, 2) + ' ppm</b>. Volcanoes give off only about 0.1 GtC a year, about a hundredth of what people emit. (A simple model: sinks grow with the extra CO₂ in the air.)', 'Carbon moves among the air, plants, soils, ocean and rocks.');
    };
    F.redraw();
    return { destroy: F.reset };
  });

  /* es-chance: Chance and Recurrence.
     opts:
       mode: 'record' | 'odds' | 'ensemble'      modes: true or a list for tabs
       data: [{year, value}] (record; default: a made-up river with seed); level: a flow to rate (record); seed
       p: yearly chance (odds) or T: recurrence interval in years; n: years; trials: how many n-year stretches to simulate (default 200)
       members: ensemble size (default 30); lead: forecast day to read (default 5); spread: how different the starts are (default 1)
       quiet: hides computed intervals and probabilities; lock */
  R('es-chance', function (el, o) {
    var F = frame(el, o, 'Chance and recurrence', { aspect: 1.6, max: 460 });
    return F.modes({ record: record, odds: odds, ensemble: ensemble }, { record: 'Flood record', odds: 'At least once', ensemble: 'Forecast ensemble' });

    function record(F) {
      F.size({ aspect: 1.8, max: 420, narrow: 0.95 });
      var seed = num(o.seed, 7), data = o.data ? o.data.map(function (q) { return [+q.year, +q.value]; }) : null, S = { lv: null }, geo = null;
      function made() { var r = rng(seed), out = []; for (var y = 1985; y < 2025; y++) { var u = M.max(1e-6, r()), v = 400 - 120 * M.log(-M.log(u)); out.push([y, M.round(M.max(80, v) / 10) * 10]); } return out; }
      var D2 = data || made(), n = D2.length;
      S.lv = o.level != null ? num(o.level, 600) : M.round(D2.map(function (q) { return q[1]; }).sort(function (a, b) { return b - a; })[2]);
      var T = F.tiles([{ k: 'm', label: 'Years at or above the level (m)', secret: true }, { k: 'T', label: 'Recurrence interval (n + 1) ÷ m', secret: true }, { k: 'p', label: 'Chance in any one year', secret: true }]);
      var row = F.row(); if (!data) V.button(row, 'Another made-up river', function () { seed++; D2 = made(); F.redraw(); });
      var tbw = mk('div', 'esv-tbl'); F.el.insertBefore(tbw, F.statsEl); F._rows.push(tbw);
      F.drag({ hit: function (x, y) { return geo && x > geo.r.x && x < geo.r.x + geo.r.w ? 'l' : null; }, move: function (h, x, y) { S.lv = M.max(0, M.round(geo.iy(y) / 10) * 10); F.redraw(); }, touch: 'pan-x' });
      F.keys(function (e) { var a = arrowKey(e); if (!a || !a[1]) return false; S.lv = M.max(0, S.lv - a[1] * 10); F.redraw(); return true; }, 'Drag the level line up and down (or use the up and down arrow keys).');
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, r = { x: 56, y: 16, w: w - 72, h: h - 56 }, vmax = M.max.apply(null, D2.map(function (q) { return q[1]; }));
        var c = chart(ctx, k, r, { x: { min: D2[0][0] - 0.5, max: D2[n - 1][0] + 0.5, step: niceStep(n, 6), label: 'Year', fmt: function (v) { return String(M.round(v)); } }, y: { min: 0, max: niceStep(vmax, 1) * M.ceil(vmax * 1.1 / niceStep(vmax, 1)), label: o.data ? 'Yearly peak' : 'Yearly peak flow (m³/s)', lpad: 44 } });
        geo = c; var bw = r.w / n;
        D2.forEach(function (q) { var over = q[1] >= S.lv; ctx.fillStyle = over ? k.rust : rgba(k.blue, 0.55); ctx.fillRect(c.X(q[0]) - bw * 0.38, c.Y(q[1]), bw * 0.76, c.Y(0) - c.Y(q[1])); });
        line(ctx, [[r.x, c.Y(S.lv)], [r.x + r.w, c.Y(S.lv)]], { color: k.ink, w: 2, dash: [6, 4] }); knob(ctx, r.x + r.w - 10, c.Y(S.lv), k.ink, 6, k); if (F.focused()) focusRing(ctx, r.x + r.w - 10, c.Y(S.lv), 13);
        txt(ctx, 'level ' + nf(S.lv), r.x + r.w - 22, c.Y(S.lv) - 10, { size: 11, color: k.ink, bold: true, align: 'right', halo: k.halo });
        var m = D2.filter(function (q) { return q[1] >= S.lv; }).length, Tm = m ? EM.recurrence(n, m) : null;
        T.m(m + ' of ' + n); T.T(Tm ? fm(Tm, 1) + ' years' : 'not reached in ' + n + ' years'); T.p(Tm ? fm(100 / Tm, 1) + '%' : '—');
        var ranked = D2.slice().sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8);
        tbw.innerHTML = '<table><thead><tr><th>Rank m</th><th>Year</th><th>Peak</th><th>T = (n + 1) ÷ m</th><th>Chance a year</th></tr></thead><tbody>' + ranked.map(function (q, i) { var Ti = EM.recurrence(n, i + 1); return '<tr' + (q[1] >= S.lv && (i === m - 1) ? ' class="hi"' : '') + '><td>' + (i + 1) + '</td><td>' + q[0] + '</td><td>' + nf(q[1]) + '</td><td>' + (F.quiet ? '?' : fm(Ti, 1) + ' yr') + '</td><td>' + (F.quiet ? '?' : fm(100 / Ti, 1) + '%') + '</td></tr>'; }).join('') + '</tbody></table>';
        F.alt('A bar chart of ' + n + ' yearly peak flows with a level line; ' + m + ' years reach the level.');
        F.say('Rank the yearly peaks from biggest (m = 1). With n = ' + n + ' years, a peak of rank m has a recurrence interval T = (n + 1) ÷ m' + (F.quiet || !Tm ? '' : ' = ' + (n + 1) + ' ÷ ' + m + ' = <b>' + fm(Tm, 1) + ' years</b>, a <b>' + fm(100 / Tm, 1) + '%</b> chance in any year') + '. A “100-year flood” has a 1% chance every year; it can happen two years in a row, and it doesn’t come on a schedule.' + (o.data ? '' : ' (A made-up river.)'), 'Rank the peaks to estimate how often a level is reached.');
      };
    }

    function odds(F) {
      F.size({ aspect: 1.8, max: 440, narrow: 0.85 });
      var S = { p: o.p != null ? clamp(num(o.p, 0.01), 0.001, 0.5) : o.T != null ? 1 / clamp(num(o.T, 100), 2, 1000) : 0.01, n: clamp(M.round(num(o.n, 30)), 1, 100), trials: clamp(M.round(num(o.trials, 200)), 20, 2000), seed: num(o.seed, 3) };
      var T = F.tiles([{ k: 'ex', label: 'Chance of at least one: 1 − (1 − p)ⁿ', secret: true }, { k: 'sim', label: 'In the simulated stretches', secret: true }, { k: 'wr', label: 'The wrong way: n × p', secret: true }]);
      V.slider(F.ctl, { label: 'Event size (1 in T years)', min: 2, max: 500, step: 1, value: M.round(1 / S.p), fmt: function (v) { return '1 in ' + v + ' (' + fm(100 / v, 2) + '% a year)'; }, input: function (v) { S.p = 1 / v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Years n', min: 1, max: 100, step: 1, value: S.n, fmt: function (v) { return v + ' yr'; }, input: function (v) { S.n = v; F.redraw(); } });
      var row = F.row(); V.button(row, 'Run the stretches again', function () { S.seed++; F.redraw(); });
      F.draw = function () {
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, wide = w >= 600, r = { x: 52, y: 16, w: (wide ? w * 0.55 : w) - 66, h: (wide ? h : h * 0.55) - 52 }, p = S.p, n = S.n;
        var c = chart(ctx, k, r, { x: { min: 0, max: 100, step: 20, label: 'Years' }, y: { min: 0, max: 1, step: 0.25, label: 'Chance', lpad: 38, fmt: function (v) { return fm(v * 100, 0) + '%'; } } });
        c.clip(); line(ctx, [[c.X(0), c.Y(0)], [c.X(100), c.Y(100 * p)]], { color: k.red, w: 2, dash: [6, 4] }); c.unclip();
        line(ctx, Array.from({ length: 101 }, function (_, i) { return [c.X(i), c.Y(EM.atLeastOne(p, i))]; }), { color: k.blue, w: 2.6 });
        var ex = EM.atLeastOne(p, n); line(ctx, [[c.X(n), c.Y(0)], [c.X(n), c.Y(ex)]], { color: k.rust, w: 1.5, dash: [4, 3] }); knob(ctx, c.X(n), c.Y(ex), k.rust, 6, k);
        if (!F.quiet) txt(ctx, fm(ex * 100, 1) + '%', c.X(n) + 10, c.Y(ex) - 10, { size: 12, color: k.rust, bold: true, halo: k.halo });
        // simulate many n-year stretches
        var rr = rng(S.seed), counts = [], any = 0, b2b = 0; for (var t = 0; t < S.trials; t++) { var cnt = 0, prev = false, hadB = false; for (var y = 0; y < n; y++) { var hit = rr() < p; if (hit) { cnt++; if (prev) hadB = true; } prev = hit; } counts[cnt] = (counts[cnt] || 0) + 1; if (cnt) any++; if (hadB) b2b++; }
        var hr = wide ? { x: w * 0.6 + 30, y: 16, w: w * 0.4 - 46, h: h - 52 } : { x: 52, y: h * 0.55 + 20, w: w - 66, h: h * 0.45 - 56 }, maxC = M.max.apply(null, counts.filter(function (x) { return x; })), kmax = M.max(3, counts.length - 1);
        var hc = chart(ctx, k, hr, { x: { min: -0.5, max: kmax + 0.5, ticks: Array.from({ length: kmax + 1 }, function (_, i) { return i; }), label: 'Events in a ' + n + '-year stretch', fmt: function (v) { return String(v); } }, y: { min: 0, max: maxC * 1.15, label: 'Stretches', lpad: 34, step: niceStep(maxC, 4) } });
        for (var q = 0; q <= kmax; q++) { var cc = counts[q] || 0; ctx.fillStyle = q ? rgba(k.rust, 0.7) : rgba(k.blue, 0.5); ctx.fillRect(hc.X(q) - hr.w / (kmax + 1) * 0.35, hc.Y(cc), hr.w / (kmax + 1) * 0.7, hc.Y(0) - hc.Y(cc)); }
        F.legend([{ c: k.blue, t: 'right: 1 − (1 − p)ⁿ', line: true }, { c: k.red, t: 'wrong: adding the chances, n × p', dash: true }]);
        T.ex(fm(ex * 100, 1) + '%'); T.sim(fm(any / S.trials * 100, 1) + '% of ' + S.trials + ' had one or more' + (b2b ? '; ' + b2b + ' had two in a row' : '')); T.wr(fm(n * p * 100, 1) + '%' + (n * p > 1 ? ' (over 100%: impossible)' : ''));
        F.alt('The chance of at least one event in n years, a curve below the straight wrong line, and a histogram of events in ' + S.trials + ' simulated stretches.');
        F.say('Each year has the same chance p, whatever happened before. The chance of <b>at least one</b> event in n years is 1 − (1 − p)ⁿ, not n × p: with p = ' + fm(p * 100, 2) + '% and n = ' + n + ', that is ' + (F.quiet ? '?' : '<b>' + fm(ex * 100, 1) + '%</b>') + '. Adding the chances overcounts the years with more than one event; for 100 years of a 1-in-100 event it would say 100%, but the real chance is about 63%.', 'Use 1 − (1 − p)ⁿ, not n × p.');
      };
    }

    function ensemble(F) {
      F.size({ aspect: 1.8, max: 440, narrow: 0.95 });
      var S = { m: clamp(M.round(num(o.members, 30)), 5, 60), lead: clamp(num(o.lead, 5), 0, 10), sp: clamp(num(o.spread, 1), 0.1, 5), seed: num(o.seed, 5) }, cache = null;
      var T = F.tiles([{ k: 'pr', label: 'Chance of rain on that day', secret: true }]);
      V.slider(F.ctl, { label: 'Forecast day', min: 0, max: 10, step: 0.5, value: S.lead, fmt: function (v) { return 'day ' + fm(v, 1); }, input: function (v) { S.lead = v; F.redraw(); } });
      V.slider(F.ctl, { label: 'Members', min: 5, max: 60, step: 1, value: S.m, fmt: function (v) { return String(v); }, input: function (v) { S.m = v; cache = null; F.redraw(); } });
      V.slider(F.ctl, { label: 'Starting differences', min: 0.1, max: 5, step: 0.1, value: S.sp, fmt: function (v) { return fm(v, 1); }, input: function (v) { S.sp = v; cache = null; F.redraw(); } });
      // members of a toy model (Lorenz 1963) started near one point on its attractor: one model day = 1 time unit; 'rain' when x is above 0 (the right-hand lobe)
      function runAll() { var r = rng(S.seed), out = []; for (var i = 0; i < S.m; i++) { var s = [-9.292 + (r() - 0.5) * 0.02 * S.sp, -16.201 + (r() - 0.5) * 0.02 * S.sp, 15.603 + (r() - 0.5) * 0.02 * S.sp], tr = [s[0]]; for (var st = 0; st < 1000; st++) { s = EM.lorenz(s, 0.01); if (st % 4 === 3) tr.push(s[0]); } out.push(tr); } return out; } // 250 samples over 10 model days
      F.draw = function () {
        if (!cache) cache = runAll();
        var k = F.clear(), ctx = F.ctx, w = F.c.w, h = F.c.h, r = { x: 52, y: 16, w: w - 66, h: h - 52 };
        var c = chart(ctx, k, r, { x: { min: 0, max: 10, step: 1, label: 'Forecast day' }, y: { min: -20, max: 20, step: 10, label: 'Model weather', lpad: 14, labels: false } });
        ctx.fillStyle = rgba(k.blue, 0.07); ctx.fillRect(r.x, r.y, r.w, c.Y(0) - r.y);
        var idx = M.round(S.lead / 10 * 250), wet = 0;
        cache.forEach(function (tr) { var isWet = tr[idx] > 0; if (isWet) wet++; line(ctx, tr.map(function (x, i) { return [c.X(i / 25), c.Y(clamp(x, -20, 20))]; }), { color: isWet ? rgba(k.blue, 0.55) : rgba(k.orange, 0.55), w: 1.3 }); });
        line(ctx, [[c.X(S.lead), r.y], [c.X(S.lead), r.y + r.h]], { color: k.ink, w: 1.6, dash: [5, 4] });
        var pr = wet / cache.length;
        if (!F.quiet) txt(ctx, wet + ' of ' + cache.length + ' members: ' + fm(pr * 100, 0) + '% chance of rain', c.X(S.lead) + (S.lead > 6 ? -8 : 8), r.y + 12, { size: 12, color: k.ink, bold: true, align: S.lead > 6 ? 'right' : 'left', halo: k.halo });
        txt(ctx, 'rain', r.x + 6, r.y + 12, { size: 10.5, color: k.blue, bold: true }); txt(ctx, 'no rain', r.x + 6, r.y + r.h - 10, { size: 10.5, color: k.orange, bold: true });
        T.pr(fm(pr * 100, 0) + '% (' + wet + ' of ' + cache.length + ')');
        F.alt('Spaghetti lines of ' + cache.length + ' forecast members that start almost the same and spread apart with time.');
        F.say('The members start almost the same, but tiny differences grow (chaos), so after a few days they disagree. The share of members with rain on a day is the chance of rain: ' + (F.quiet ? '?' : '<b>' + fm(pr * 100, 0) + '%</b>') + '. A 40% chance means a 4-in-10 chance of rain at any one spot, not rain for 40% of the day. A forecast that gave 30% and then saw rain wasn’t wrong. (A toy model of chaos, not a real weather model.)', 'The share of members with rain is the forecast chance.');
      };
    }
  });

})(window, document);

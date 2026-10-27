/* Geography Ladder: the shared visual kit (names prefixed gg-) and the model (MathLadder.geog), on window.MathLadder.
   Load order: math/viz/core.js (+ viz.css), then this file (+ geog/viz/geog.css). Geography topic pages always load this file,
   and practice pages load it with the course (MathLadder.loadCourse), so generators may call MathLadder.geog.
   The model also runs in node (check-gen loads it): global.window = global; require('…/static/geog/viz/geog.js').
   Source parts: /tmp/work_geog/src/*.js (build: /tmp/work_geog/build.sh; the data part 02_data.js is made by build_data.py).
   Conventions for course builders: /tmp/work_geog/overview.md. Gallery: /tmp/work_geog/gallery.html + examples.js.

   Maps are drawn in the browser (SVG) from public-domain Natural Earth data (naturalearthdata.com), stored as TopoJSON in
   static/geog/data/ (world.json: countries, disputed areas, lakes; us.json: the 50 states and D.C.; features.json: rivers and
   physical regions; tz.json: time zones), projected with d3-geo (ISC license), vendored in static/geog/vendor/ and loaded on
   demand. A map shows "Loading the map…" for a moment, then draws; it redraws when its width changes.

   Embed:  <div class="ml-viz" data-viz="gg-map" data-opts='{"region":"weu","labels":true}'></div>

   COMMON OPTIONS (every visual)
     quiet: true (alias readout: false)  hide everything that could give a problem's answer away: names of asked places, readouts,
                 verdicts, Check buttons, legends that name the answer. interactive: false  a still picture.  task: a line above.
     caption: HTML under it.  label / alt: the picture's aria-label.  big: true  larger text (Maps and Places).
     readme: 'a note for the grown-up' (shown above with a "Read to me" tag).

   PLACE IDS: countries and other areas use ISO 3166 alpha-3 codes (FRA, USA, PSE, VAT; Kosovo XKX, Western Sahara ESH); U.S.
   states use postal codes (CA, NY, DC). Regions: continents AF AS EU NA SA OC; teaching groups nca car sam neu weu seu eeu naf waf
   maf eaf saf was csa eas sea oce; UN M49 subregions (MathLadder.geog.SUB); U.S. regions ne mw s w and divisions nen mat enc wnc
   sat esc wsc mtn pac. Physical features: ids in MathLadder.geog.R (rivers) and .PHYS (ranges, deserts, plains ...).

   THE VISUALS AND THEIR OPTIONS
   gg-map        a world or U.S. map. map: 'world' (default) | 'us'. proj: 'equalearth' (world default) | 'mercator' | 'robinson' |
                 'mollweide' | 'gallpeters' | 'winkel' | 'equirect' | 'natural' | 'local' (azimuthal, the default when zoomed to a
                 region) | 'albersusa' (U.S. default, with Alaska and Hawaii insets). region: a region code or a list of ids (zooms to
                 them; Russia's Asian part and overseas parts of countries are left out of the fit); wholeWorld: true keeps the world
                 view; only: region or ids (draw only those areas); focusAlso: [[lon, lat]] extra points to fit; height: px.
                 color: 'political' (default; neighbours differ) | 'plain' | 'continents' | 'data'. data: {id: number} with breaks:
                 [b1, b2, b3, b4] (5 classes) and legend: 'title' (a choropleth); cats: {id: 0-7} with catNames: ['…'] (categories,
                 with a key; colors k0 blue, k1 orange, k2 green, k3 red, k4 teal, k5 yellow, k6 purple, k7 brown).
                 highlight: [ids] or a region code (orange); highlight2: [ids] (blue); dim: true (fade areas outside the region).
                 mark: {id: 'A' | '?'} letters on places or physical features (ids from R or PHYS). labels: true (names that fit)
                 | 'postal' (U.S.) | [ids]; labelAll: true. capitals: true | [ids] (stars, with names unless capLabels: false).
                 points: [{lon, lat, label, mark, kind: 'star'}]. oceans, seas, continents: true (names). graticule: true | step.
                 lines: ['equator', 'cancer', 'capricorn', 'arctic', 'antarctic', 'prime', 'dateline'] (lineLabels: false hides).
                 features: [ids or kinds: 'rivers', 'range', 'desert', 'plain', 'plateau', 'basin', 'area', 'peninsula', 'island',
                 'valley', 'wetland', 'isthmus', 'all']; featureFocus: a continent code; hiFeature: id; featureLabels: false.
                 dots: false | true (small countries get a dot: in show mode only when highlighted, marked or in the data).
                 mode: 'show' | 'explore' (tap any area: name, capital, region, note; disputed areas explain the dispute) |
                 'find' (find: id or [ids], or the region's countries; prompt: 'Find'; findCap: true asks by capital; shuffle;
                 again: false). Explore and find have zoom buttons and drag-to-pan. ask: id (quiet: never labels that id).
                 Disputed areas are always hatched and described neutrally; lines show who administers an area today.
   gg-outline    one or more country (or state) shapes. ids: [..] (lettered A, B … when more than one) | id; map: 'us';
                 context: true (neighbours faint); capital: true; scale: false (no 500 km / 200 mile bar); whole: true (all
                 parts); names: false. quiet: no names.
   gg-globe      an orthographic globe; drag or arrow keys to turn. center: [lon, lat] | focus: id; highlight: [ids or
                 region codes]; color: 'plain' | 'political' | 'continents'; hemi: 'N' | 'S' | 'E' | 'W' (shades that half);
                 lines (as gg-map); continents, oceans, poles: true; points; mark; spin: true; buttons: false; size: px.
   gg-latlon     an equirectangular grid of latitude and longitude. bbox: [w, s, e, n]; step: degrees; point: [lon, lat];
                 mode: 'read' | 'place' (drag the pin to target: [lon, lat]; tol; snap; Check); mark: '?'; cities: [names from
                 MathLadder.geog.CITIES or {n, lon, lat}] (cityMarks: true letters them); lines; highlight; axisLabels: false.
   gg-projection world maps on one or two projections. proj: name | compare: [a, b]; choose: true (buttons; choices: [..]);
                 tissot: true (same-size circles; tissotR: degrees); highlight / highlight2: [ids or region codes];
                 truesize: id (drag the country's true-size outline across a Mercator map); keeps: false hides what each keeps.
                 quiet: no projection names (letters only when comparing).
   gg-timezones  world time zones (standard time, Natural Earth; offsets along the top) or us: true (states by their main zone;
                 split states dashed). cities: [names] with clocks for utc: minutes after midnight UTC (default noon); slider
                 (not quiet); ask: city name (its clock hidden when quiet); askAll; cityMarks; clocks: false; dateline: true;
                 bbox; highlightZone: offset.
   gg-town       a picture map on a grid (Maps and Places). layout: 'maple' | 'river' | 'hill' | 'room' (a bedroom);
                 places: [{kind, c, r}] replaces the layout's places (kinds: MathLadder.geog.SYMBOLS; columns c from 0 = A, rows
                 r from 0 = 1); grid: false; gridLines: false; key: true | false | [kinds]; names: {kind: 'label'} (renames in the
                 key); keyTitle; compass: false; points: 8; hideDir: 'E'; scale: {blocks, label, unit}; title; labels: true;
                 ask: kind or [c, r] ('?' badge); marks: {kind: 'A'}; route: [[c, r], …]; you: [c, r] (the walker);
                 highlightCell: [c, r]; mode: 'show' | 'find' (tap a square; answer: [c, r]; Check) | 'walk' (N/E/S/W buttons).
   gg-birdseye   things seen from the side and from above (THINGS: table chair bed cup tree house car lamp plate bucket ball
                 bike). things: [..] (pairs) | ask: thing with choices: [3 things] and from: 'side' | 'top' (pick the matching
                 view; Check) | match: true (match side views to top views) | fly: true (a scene: [things] that flies up into
                 a map; t: 0-1).
   gg-compass    a compass rose. points: 4 | 8; ask: 'E' ('?' on that point); highlight; words: true; hideAll; arrow: 'NE';
                 needle: true (a compass; turn the dial; turn: degrees); sun: 'rise' | 'noon' | 'set' (a child facing north,
                 Northern Hemisphere); around: {N: kind, E: kind, …} with center: kind and labels: true.
   gg-nested     places inside places. levels: ['Earth', …, 'A home']; icons: false; ask: index; highlight: index.
   gg-landforms  two illustrated scenes. scene: 'coast' (ocean island peninsula isthmus strait bay cape coast lake river source
                 mouth delta tributary) | 'land' (mountain glacier volcano hill valley plain plateau canyon desert waterfall lake
                 river tributary source mouth forest). show: [features to label] (default all; none when quiet); ask: feature
                 ('?'); marks: {feature: 'A'}; highlight; mode: 'show' | 'find' (find: [features]) | 'explore' (tap for a
                 definition). Definitions: MathLadder.geog.LANDFORMS.
   gg-sort       cards into groups. bins: ['…']; cards: [{text, bin, why}] | strings; shuffle; reveal: true; solved: true.
                 quiet: a lettered list of the cards.
   gg-climate    a climograph (°C and mm, or units: 'us'). type: a key of MathLadder.geog.CLIMATES (typical, made-up normals that
                 pass the Köppen rules) | data: {t: [12], p: [12], name}; hemi: 'S' (shifts six months); compare: [two types];
                 titles: ['…']. Not quiet: the Köppen type and yearly totals.
   gg-biome      mode 'chart' (default): biomes by yearly temperature and precipitation (simplified, after Whittaker 1975);
                 point: [°C, cm]; mark; highlight: biome; labels: true (show names even when quiet); mode: 'place' (tap to move
                 the point). Or biome: key | biomes: [keys] (small illustrated scenes; details: true adds climate, plants, animals).
   gg-pyramid    a population pyramid (21 five-year groups). shape: a key of MathLadder.geog.PYRAMIDS (expanding, young, stable,
                 contracting, stage1 … stage5) | an options object for MathLadder.geog.pyramid | data: {m: [], f: []};
                 compare: [shapes]; titles; highlight: 'young' | 'work' | 'old'; sliders: true; max: percent.
   gg-dtm        the demographic transition model. at: 0-100 (a time line with readout); stage: n (shaded); ask: n ('?' for its
                 name when quiet); country: {cbr, cdr, t}; population: false; slider: false.
   gg-models     diagrams. model: 'concentric' | 'sector' | 'nuclei' | 'latin' | 'vonthunen' | 'sea' | 'centralplace' |
                 'weber' (bulk: 'reducing' | 'gaining') | 'ranksize' (top, primate: true, values) | 'rostow' | 'worldsystems' |
                 'survey' | 'districts' (plan: 'packing' | 'cracking'; results: true shows the seat count when quiet).
                 Zones are numbered; the legend lists them (MathLadder.geog.MODELS). ask: zone index ('?') or 'name';
                 hideNames: true; highlight: index.
   gg-diffusion  how a trait spreads on a grid of places. type: 'contagious' | 'hierarchical' | 'relocation' | 'stimulus';
                 t: step (with Step and Start over); choose: true. quiet: three frames (at first, later, much later), no name.

   THE MODEL: MathLadder.geog (pure data and functions; no DOM; works in node)
     C: the 195 countries (193 UN members + the 2 observer states), each { id, n (name), alt [other names], cap, capAlt [other
       accepted capitals], sub (UN M49 subregion), cont (AF AS EU NA SA OC), g (teaching group), f (flags: L landlocked, O observer,
       T transcontinental, C capital needs its note, X capital not quizzed), note, lx/ly (label point), cc [lon, lat] of the capital,
       nb [firm neighbours], nbd [neighbours only through a disputed area], km2 (area from the map, rounded) }.
     O: other areas on the map (territories, disputed areas, Antarctica) { id, n, kind, of, note, cap }.
     S: the 50 states and DC { id (postal), n, cap, div, reg, date (statehood; ratification for the 13), ord, city (another
       well-known city, never the capital), nb, cc, lx/ly }.
     R (rivers), PHYS (ranges, deserts, plains, plateaus, basins, peninsulas, islands, valleys …), LAKES, CITIES ({n, c, utc
       (standard time), lon, lat}), OCEANS, SEAS, CONTINENT_LABELS, LINES, CONT, CONT7, SUB, GROUPS, DIV, REG.
     country(id), area(id), state(id), countries({g, sub, cont, landlocked, un}), states({reg, div, dc}), names(id) and
     capNames(id) (every accepted spelling, for text answers), capQuiz(id), neighbors(id), unsureNeighbors(id), contName(code),
     city(name), river(id), phys(id), has(c, flag), dist([lon, lat], [lon, lat]) km, fmtLat, fmtLon, fmtUTC, fmtClock(minutes).
     US_TZ, US_TZ_NAME, STATE_TZ, STATE_TZ_SPLIT; CLIMATES, CLIMATE_GROUPS, koppen(t, p, hemi), climate(key, hemi); BIOMES,
     biomeOf(°C, cm); AGES, pyramid(o), PYRAMIDS, dependency(p), lifeExpectancy(level); DTM_STAGES, dtm(t), dtmStage(cbr, cdr);
     MODELS; SYMBOLS, TOWNS, ROOM, ROOM_NAMES, THINGS, LANDFORMS.                                                              */
(function (W) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
/* ---- 02_data.js: generated by /tmp/work_geog/build_data.py from countries.txt, states.txt and Natural Earth (public domain). Do not edit. */
  var DATA = {"C":[{"id":"USA","n":"United States","cap":"Washington, D.C.","sub":"nam","cont":"NA","g":"nca","lx":-98.6,"ly":39.8,"cc":[-77.01,38.9],"nb":["CAN","MEX"],"km2":9793030,"alt":["United States of America","USA","U.S.","US","America"],"capAlt":["Washington","Washington DC","Washington D.C."]},{"id":"CAN","n":"Canada","cap":"Ottawa","sub":"nam","cont":"NA","g":"nca","lx":-101.91,"ly":60.32,"cc":[-75.7,45.42],"nb":["USA"],"km2":9351820},{"id":"MEX","n":"Mexico","cap":"Mexico City","sub":"cam","cont":"NA","g":"nca","lx":-102.29,"ly":23.92,"cc":[-99.13,19.44],"nb":["BLZ","GTM","USA"],"km2":1957790,"capAlt":["Ciudad de México","Ciudad de Mexico"]},{"id":"BLZ","n":"Belize","cap":"Belmopan","sub":"cam","cont":"NA","g":"nca","lx":-88.71,"ly":17.2,"cc":[-88.77,17.25],"nb":["GTM","MEX"],"km2":22660},{"id":"GTM","n":"Guatemala","cap":"Guatemala City","sub":"cam","cont":"NA","g":"nca","lx":-90.5,"ly":14.98,"cc":[-90.53,14.62],"nb":["BLZ","HND","MEX","SLV"],"km2":108080,"capAlt":["Ciudad de Guatemala"]},{"id":"HND","n":"Honduras","cap":"Tegucigalpa","sub":"cam","cont":"NA","g":"nca","lx":-86.89,"ly":14.79,"cc":[-87.22,14.1],"nb":["GTM","NIC","SLV"],"km2":113110},{"id":"SLV","n":"El Salvador","cap":"San Salvador","sub":"cam","cont":"NA","g":"nca","lx":-88.89,"ly":13.69,"cc":[-89.2,13.71],"nb":["GTM","HND"],"km2":20290},{"id":"NIC","n":"Nicaragua","cap":"Managua","sub":"cam","cont":"NA","g":"nca","lx":-85.07,"ly":12.67,"cc":[-86.27,12.15],"nb":["CRI","HND"],"km2":128560},{"id":"CRI","n":"Costa Rica","cap":"San José","sub":"cam","cont":"NA","g":"nca","lx":-84.08,"ly":10.07,"cc":[-84.09,9.94],"nb":["NIC","PAN"],"km2":51320,"capAlt":["San Jose"]},{"id":"PAN","n":"Panama","cap":"Panama City","sub":"cam","cont":"NA","g":"nca","lx":-80.35,"ly":8.72,"cc":[-79.53,8.97],"nb":["COL","CRI"],"km2":73920,"capAlt":["Ciudad de Panamá"]},{"id":"ATG","n":"Antigua and Barbuda","cap":"St. John's","sub":"car","cont":"NA","g":"car","lx":-61.79,"ly":17.35,"cc":[-61.85,17.12],"nb":[],"km2":430,"alt":["Antigua & Barbuda"],"capAlt":["Saint John's","St Johns"]},{"id":"BHS","n":"Bahamas","cap":"Nassau","sub":"car","cont":"NA","g":"car","lx":-77.15,"ly":26.4,"cc":[-77.35,25.08],"nb":[],"km2":12610,"alt":["The Bahamas"]},{"id":"BRB","n":"Barbados","cap":"Bridgetown","sub":"car","cont":"NA","g":"car","lx":-59.57,"ly":13.16,"cc":[-59.62,13.1],"nb":[],"km2":390},{"id":"CUB","n":"Cuba","cap":"Havana","sub":"car","cont":"NA","g":"car","lx":-77.98,"ly":21.33,"cc":[-82.37,23.13],"nb":[],"km2":108820,"capAlt":["La Habana"]},{"id":"DMA","n":"Dominica","cap":"Roseau","sub":"car","cont":"NA","g":"car","lx":-61.34,"ly":15.46,"cc":[-61.39,15.3],"nb":[],"km2":690},{"id":"DOM","n":"Dominican Republic","cap":"Santo Domingo","sub":"car","cont":"NA","g":"car","lx":-70.65,"ly":19.1,"cc":[-69.9,18.47],"nb":["HTI"],"km2":48390},{"id":"GRD","n":"Grenada","cap":"St. George's","sub":"car","cont":"NA","g":"car","lx":-61.68,"ly":12.11,"cc":[-61.74,12.05],"nb":[],"km2":280,"capAlt":["Saint George's","St Georges"]},{"id":"HTI","n":"Haiti","cap":"Port-au-Prince","sub":"car","cont":"NA","g":"car","lx":-72.22,"ly":19.26,"cc":[-72.34,18.54],"nb":["DOM"],"km2":26700,"capAlt":["Port au Prince"]},{"id":"JAM","n":"Jamaica","cap":"Kingston","sub":"car","cont":"NA","g":"car","lx":-77.32,"ly":18.14,"cc":[-76.77,17.98],"nb":[],"km2":10890},{"id":"KNA","n":"Saint Kitts and Nevis","cap":"Basseterre","sub":"car","cont":"NA","g":"car","lx":-62.76,"ly":17.34,"cc":[-62.72,17.3],"nb":[],"km2":230,"alt":["St. Kitts and Nevis","St Kitts and Nevis","Saint Kitts & Nevis"]},{"id":"LCA","n":"Saint Lucia","cap":"Castries","sub":"car","cont":"NA","g":"car","lx":-60.98,"ly":13.89,"cc":[-61.0,14.0],"nb":[],"km2":550,"alt":["St. Lucia","St Lucia"]},{"id":"VCT","n":"Saint Vincent and the Grenadines","cap":"Kingstown","sub":"car","cont":"NA","g":"car","lx":-61.34,"ly":13.09,"cc":[-61.21,13.15],"nb":[],"km2":310,"alt":["St. Vincent and the Grenadines","St Vincent and the Grenadines"]},{"id":"TTO","n":"Trinidad and Tobago","cap":"Port of Spain","sub":"car","cont":"NA","g":"car","lx":-60.92,"ly":11.0,"cc":[-61.52,10.65],"nb":[],"km2":5080,"alt":["Trinidad & Tobago"],"capAlt":["Port-of-Spain"]},{"id":"ARG","n":"Argentina","cap":"Buenos Aires","sub":"sam","cont":"SA","g":"sam","lx":-64.17,"ly":-33.5,"cc":[-58.4,-34.6],"nb":["BOL","BRA","CHL","PRY","URY"],"km2":2756860},{"id":"BOL","n":"Bolivia","cap":"Sucre","sub":"sam","cont":"SA","g":"sam","lx":-64.59,"ly":-16.67,"cc":[-65.26,-19.04],"nb":["ARG","BRA","CHL","PER","PRY"],"km2":1087700,"capAlt":["La Paz"],"f":"LC","note":"Sucre is the constitutional capital and home of the judiciary; La Paz is the seat of government. Both count as capitals."},{"id":"BRA","n":"Brazil","cap":"Brasília","sub":"sam","cont":"SA","g":"sam","lx":-49.56,"ly":-12.1,"cc":[-47.92,-15.78],"nb":["ARG","BOL","COL","FRA","GUY","PER","PRY","SUR","URY","VEN"],"km2":8555810,"capAlt":["Brasilia"]},{"id":"CHL","n":"Chile","cap":"Santiago","sub":"sam","cont":"SA","g":"sam","lx":-72.32,"ly":-38.15,"cc":[-70.67,-33.45],"nb":["ARG","BOL","PER"],"km2":701630,"note":"The national congress meets in Valparaíso."},{"id":"COL","n":"Colombia","cap":"Bogotá","sub":"sam","cont":"SA","g":"sam","lx":-73.17,"ly":3.37,"cc":[-74.09,4.6],"nb":["BRA","ECU","PAN","PER","VEN"],"km2":1136730,"capAlt":["Bogota"]},{"id":"ECU","n":"Ecuador","cap":"Quito","sub":"sam","cont":"SA","g":"sam","lx":-78.19,"ly":-1.26,"cc":[-78.5,-0.21],"nb":["COL","PER"],"km2":254510},{"id":"GUY","n":"Guyana","cap":"Georgetown","sub":"sam","cont":"SA","g":"sam","lx":-58.94,"ly":5.12,"cc":[-58.17,6.8],"nb":["BRA","SUR","VEN"],"km2":211230},{"id":"PRY","n":"Paraguay","cap":"Asunción","sub":"sam","cont":"SA","g":"sam","lx":-60.15,"ly":-21.67,"cc":[-57.64,-25.29],"nb":["ARG","BOL","BRA"],"km2":397820,"capAlt":["Asuncion"],"f":"L"},{"id":"PER","n":"Peru","cap":"Lima","sub":"sam","cont":"SA","g":"sam","lx":-72.9,"ly":-12.98,"cc":[-77.05,-12.05],"nb":["BOL","BRA","CHL","COL","ECU"],"km2":1299960},{"id":"SUR","n":"Suriname","cap":"Paramaribo","sub":"sam","cont":"SA","g":"sam","lx":-55.91,"ly":4.14,"cc":[-55.17,5.84],"nb":["BRA","FRA","GUY"],"km2":145010},{"id":"URY","n":"Uruguay","cap":"Montevideo","sub":"sam","cont":"SA","g":"sam","lx":-55.97,"ly":-32.96,"cc":[-56.17,-34.86],"nb":["ARG","BRA"],"km2":177790},{"id":"VEN","n":"Venezuela","cap":"Caracas","sub":"sam","cont":"SA","g":"sam","lx":-64.6,"ly":7.18,"cc":[-66.92,10.5],"nb":["BRA","COL","GUY"],"km2":911040},{"id":"DNK","n":"Denmark","cap":"Copenhagen","sub":"neu","cont":"EU","g":"neu","lx":9.02,"ly":55.97,"cc":[12.56,55.68],"nb":["DEU"],"km2":42250},{"id":"EST","n":"Estonia","cap":"Tallinn","sub":"neu","cont":"EU","g":"neu","lx":25.87,"ly":58.72,"cc":[24.73,59.43],"nb":["LVA","RUS"],"km2":45460},{"id":"FIN","n":"Finland","cap":"Helsinki","sub":"neu","cont":"EU","g":"neu","lx":27.28,"ly":63.25,"cc":[24.93,60.18],"nb":["NOR","RUS","SWE"],"km2":325490},{"id":"ISL","n":"Iceland","cap":"Reykjavík","sub":"neu","cont":"EU","g":"neu","lx":-18.67,"ly":64.78,"cc":[-21.95,64.15],"nb":[],"km2":99530,"capAlt":["Reykjavik"]},{"id":"IRL","n":"Ireland","cap":"Dublin","sub":"neu","cont":"EU","g":"neu","lx":-7.8,"ly":53.08,"cc":[-6.25,53.34],"nb":["GBR"],"km2":67910},{"id":"LVA","n":"Latvia","cap":"Riga","sub":"neu","cont":"EU","g":"neu","lx":25.46,"ly":57.07,"cc":[24.1,56.95],"nb":["BLR","EST","LTU","RUS"],"km2":63970},{"id":"LTU","n":"Lithuania","cap":"Vilnius","sub":"neu","cont":"EU","g":"neu","lx":24.09,"ly":55.1,"cc":[25.32,54.68],"nb":["BLR","LVA","POL","RUS"],"km2":64680},{"id":"NOR","n":"Norway","cap":"Oslo","sub":"neu","cont":"EU","g":"neu","lx":9.0,"ly":61.2,"cc":[10.75,59.92],"nb":["FIN","RUS","SWE"],"km2":371270},{"id":"SWE","n":"Sweden","cap":"Stockholm","sub":"neu","cont":"EU","g":"neu","lx":19.02,"ly":65.86,"cc":[18.1,59.35],"nb":["FIN","NOR"],"km2":445800},{"id":"GBR","n":"United Kingdom","cap":"London","sub":"neu","cont":"EU","g":"neu","lx":-2.12,"ly":54.4,"cc":[-0.12,51.5],"nb":["IRL"],"km2":237250,"alt":["UK","U.K.","Britain","Great Britain"]},{"id":"AUT","n":"Austria","cap":"Vienna","sub":"weu","cont":"EU","g":"weu","lx":14.13,"ly":47.52,"cc":[16.36,48.2],"nb":["CHE","CZE","DEU","HUN","ITA","LIE","SVK","SVN"],"km2":83550,"capAlt":["Wien"],"f":"L"},{"id":"BEL","n":"Belgium","cap":"Brussels","sub":"weu","cont":"EU","g":"weu","lx":4.8,"ly":50.79,"cc":[4.33,50.84],"nb":["DEU","FRA","LUX","NLD"],"km2":30520},{"id":"FRA","n":"France","cap":"Paris","sub":"weu","cont":"EU","g":"weu","lx":2.5,"ly":46.6,"cc":[2.33,48.87],"nb":["AND","BEL","BRA","CHE","DEU","ESP","ITA","LUX","MCO","SUR"],"km2":632620},{"id":"DEU","n":"Germany","cap":"Berlin","sub":"weu","cont":"EU","g":"weu","lx":9.68,"ly":50.96,"cc":[13.4,52.52],"nb":["AUT","BEL","CHE","CZE","DNK","FRA","LUX","NLD","POL"],"km2":357740},{"id":"LIE","n":"Liechtenstein","cap":"Vaduz","sub":"weu","cont":"EU","g":"weu","lx":9.56,"ly":47.11,"cc":[9.52,47.13],"nb":["AUT","CHE"],"km2":140,"f":"L","note":"Liechtenstein is doubly landlocked: its neighbors are landlocked too."},{"id":"LUX","n":"Luxembourg","cap":"Luxembourg","sub":"weu","cont":"EU","g":"weu","lx":6.08,"ly":49.73,"cc":[6.13,49.61],"nb":["BEL","DEU","FRA"],"km2":2600,"capAlt":["Luxembourg City"],"f":"L"},{"id":"MCO","n":"Monaco","cap":"Monaco","sub":"weu","cont":"EU","g":"weu","lx":7.4,"ly":43.74,"cc":[7.41,43.74],"nb":["FRA"],"km2":12,"note":"Monaco is a city-state."},{"id":"NLD","n":"Netherlands","cap":"Amsterdam","sub":"weu","cont":"EU","g":"weu","lx":5.61,"ly":52.42,"cc":[4.91,52.35],"nb":["BEL","DEU"],"km2":37350,"alt":["The Netherlands"],"capAlt":["The Hague"],"f":"C","note":"Amsterdam is the capital named in the constitution; the government and parliament sit in The Hague."},{"id":"CHE","n":"Switzerland","cap":"Bern","sub":"weu","cont":"EU","g":"weu","lx":7.46,"ly":46.72,"cc":[7.47,46.92],"nb":["AUT","DEU","FRA","ITA","LIE"],"km2":41070,"capAlt":["Berne"],"f":"L","note":"Switzerland's laws name no capital; Bern is the federal city, where the government and parliament sit."},{"id":"ALB","n":"Albania","cap":"Tirana","sub":"seu","cont":"EU","g":"seu","lx":20.11,"ly":40.65,"cc":[19.82,41.33],"nb":["GRC","MKD","MNE","XKX"],"km2":28230,"capAlt":["Tiranë"],"nbd":["SRB"]},{"id":"AND","n":"Andorra","cap":"Andorra la Vella","sub":"seu","cont":"EU","g":"seu","lx":1.54,"ly":42.55,"cc":[1.52,42.51],"nb":["ESP","FRA"],"km2":440,"f":"L"},{"id":"BIH","n":"Bosnia and Herzegovina","cap":"Sarajevo","sub":"seu","cont":"EU","g":"seu","lx":18.07,"ly":44.09,"cc":[18.38,43.85],"nb":["HRV","MNE","SRB"],"km2":51550,"alt":["Bosnia","Bosnia & Herzegovina"]},{"id":"HRV","n":"Croatia","cap":"Zagreb","sub":"seu","cont":"EU","g":"seu","lx":16.37,"ly":45.81,"cc":[16.0,45.8],"nb":["BIH","HUN","MNE","SRB","SVN"],"km2":54210},{"id":"GRC","n":"Greece","cap":"Athens","sub":"seu","cont":"EU","g":"seu","lx":21.73,"ly":39.49,"cc":[23.73,37.99],"nb":["ALB","BGR","MKD","TUR"],"km2":129680},{"id":"VAT","n":"Holy See","cap":"Vatican City","sub":"seu","cont":"EU","g":"seu","lx":12.45,"ly":41.9,"cc":[12.45,41.9],"nb":["ITA"],"km2":1,"alt":["Vatican City","Vatican"],"capAlt":["Vatican"],"f":"LO","note":"The Holy See is a UN observer state; its territory is Vatican City, a city-state inside Rome."},{"id":"ITA","n":"Italy","cap":"Rome","sub":"seu","cont":"EU","g":"seu","lx":11.08,"ly":44.73,"cc":[12.48,41.9],"nb":["AUT","CHE","FRA","SMR","SVN","VAT"],"km2":297710,"capAlt":["Roma"]},{"id":"MLT","n":"Malta","cap":"Valletta","sub":"seu","cont":"EU","g":"seu","lx":14.43,"ly":35.89,"cc":[14.51,35.9],"nb":[],"km2":270},{"id":"MNE","n":"Montenegro","cap":"Podgorica","sub":"seu","cont":"EU","g":"seu","lx":19.14,"ly":42.8,"cc":[19.27,42.47],"nb":["ALB","BIH","HRV","SRB","XKX"],"km2":13600,"note":"Cetinje, the old royal capital, is called the \"Old Royal Capital\" in the constitution.","nbd":["MKD"]},{"id":"MKD","n":"North Macedonia","cap":"Skopje","sub":"seu","cont":"EU","g":"seu","lx":21.56,"ly":41.56,"cc":[21.43,42.0],"nb":["ALB","BGR","GRC","SRB","XKX"],"km2":25230,"f":"L","nbd":["MNE"]},{"id":"PRT","n":"Portugal","cap":"Lisbon","sub":"seu","cont":"EU","g":"seu","lx":-8.27,"ly":39.61,"cc":[-9.15,38.72],"nb":["ESP"],"km2":90020,"capAlt":["Lisboa"]},{"id":"SMR","n":"San Marino","cap":"San Marino","sub":"seu","cont":"EU","g":"seu","lx":12.44,"ly":43.93,"cc":[12.44,43.94],"nb":["ITA"],"km2":68,"capAlt":["City of San Marino"],"f":"L"},{"id":"SRB","n":"Serbia","cap":"Belgrade","sub":"seu","cont":"EU","g":"seu","lx":20.79,"ly":44.19,"cc":[20.47,44.82],"nb":["BGR","BIH","HRV","HUN","MKD","MNE","ROU","XKX"],"km2":77120,"capAlt":["Beograd"],"f":"L","nbd":["ALB"]},{"id":"SVN","n":"Slovenia","cap":"Ljubljana","sub":"seu","cont":"EU","g":"seu","lx":14.92,"ly":46.06,"cc":[14.51,46.06],"nb":["AUT","HRV","HUN","ITA"],"km2":20100},{"id":"ESP","n":"Spain","cap":"Madrid","sub":"seu","cont":"EU","g":"seu","lx":-3.46,"ly":40.09,"cc":[-3.69,40.4],"nb":["AND","FRA","PRT"],"km2":500390},{"id":"BLR","n":"Belarus","cap":"Minsk","sub":"eeu","cont":"EU","g":"eeu","lx":28.42,"ly":53.82,"cc":[27.56,53.9],"nb":["LTU","LVA","POL","RUS","UKR"],"km2":205860,"f":"L"},{"id":"BGR","n":"Bulgaria","cap":"Sofia","sub":"eeu","cont":"EU","g":"eeu","lx":25.16,"ly":42.51,"cc":[23.31,42.69],"nb":["GRC","MKD","ROU","SRB","TUR"],"km2":112200},{"id":"CZE","n":"Czechia","cap":"Prague","sub":"eeu","cont":"EU","g":"eeu","lx":15.38,"ly":49.88,"cc":[14.46,50.09],"nb":["AUT","DEU","POL","SVK"],"km2":77900,"alt":["Czech Republic"],"capAlt":["Praha"],"f":"L"},{"id":"HUN","n":"Hungary","cap":"Budapest","sub":"eeu","cont":"EU","g":"eeu","lx":19.45,"ly":47.09,"cc":[19.08,47.5],"nb":["AUT","HRV","ROU","SRB","SVK","SVN","UKR"],"km2":92430,"f":"L"},{"id":"MDA","n":"Moldova","cap":"Chișinău","sub":"eeu","cont":"EU","g":"eeu","lx":28.49,"ly":47.43,"cc":[28.86,47.01],"nb":["ROU","UKR"],"km2":33040,"capAlt":["Chisinau"],"f":"L"},{"id":"POL","n":"Poland","cap":"Warsaw","sub":"eeu","cont":"EU","g":"eeu","lx":19.49,"ly":51.99,"cc":[21.0,52.25],"nb":["BLR","CZE","DEU","LTU","RUS","SVK","UKR"],"km2":316280,"capAlt":["Warszawa"]},{"id":"ROU","n":"Romania","cap":"Bucharest","sub":"eeu","cont":"EU","g":"eeu","lx":24.97,"ly":45.73,"cc":[26.1,44.44],"nb":["BGR","HUN","MDA","SRB","UKR"],"km2":234790,"capAlt":["București"]},{"id":"RUS","n":"Russia","cap":"Moscow","sub":"eeu","cont":"EU","g":"eeu","lx":44.69,"ly":58.25,"cc":[37.61,55.75],"nb":["AZE","BLR","CHN","EST","FIN","GEO","KAZ","LTU","LVA","MNG","NOR","POL","PRK","UKR"],"km2":17995050,"alt":["Russian Federation"],"capAlt":["Moskva"],"f":"T","note":"Russia spans Europe and Asia; most of its people live in the European part, west of the Ural Mountains."},{"id":"SVK","n":"Slovakia","cap":"Bratislava","sub":"eeu","cont":"EU","g":"eeu","lx":19.05,"ly":48.73,"cc":[17.12,48.15],"nb":["AUT","CZE","HUN","POL","UKR"],"km2":48000,"f":"L"},{"id":"UKR","n":"Ukraine","cap":"Kyiv","sub":"eeu","cont":"EU","g":"eeu","lx":32.14,"ly":49.72,"cc":[30.51,50.44],"nb":["BLR","HUN","MDA","POL","ROU","RUS","SVK"],"km2":572340,"capAlt":["Kiev"]},{"id":"DZA","n":"Algeria","cap":"Algiers","sub":"naf","cont":"AF","g":"naf","lx":2.81,"ly":27.4,"cc":[3.05,36.77],"nb":["LBY","MAR","MLI","MRT","NER","TUN"],"km2":2295100},{"id":"EGY","n":"Egypt","cap":"Cairo","sub":"naf","cont":"AF","g":"naf","lx":29.45,"ly":26.19,"cc":[31.25,30.05],"nb":["ISR","LBY","PSE","SDN"],"km2":990060,"f":"T","note":"Egypt's Sinai Peninsula is in Asia. Egypt has been building a New Administrative Capital east of Cairo; Cairo remains the capital."},{"id":"LBY","n":"Libya","cap":"Tripoli","sub":"naf","cont":"AF","g":"naf","lx":18.01,"ly":26.64,"cc":[13.18,32.89],"nb":["DZA","EGY","NER","SDN","TCD","TUN"],"km2":1604590},{"id":"MAR","n":"Morocco","cap":"Rabat","sub":"naf","cont":"AF","g":"naf","lx":-7.19,"ly":31.65,"cc":[-6.84,34.03],"nb":["DZA"],"km2":588720,"nbd":["MRT"]},{"id":"SDN","n":"Sudan","cap":"Khartoum","sub":"naf","cont":"AF","g":"naf","lx":29.26,"ly":16.33,"cc":[32.53,15.59],"nb":["CAF","EGY","ERI","ETH","LBY","SSD","TCD"],"km2":1875600,"note":"Khartoum lies where the Blue Nile and the White Nile meet."},{"id":"TUN","n":"Tunisia","cap":"Tunis","sub":"naf","cont":"AF","g":"naf","lx":9.01,"ly":33.69,"cc":[10.18,36.8],"nb":["DZA","LBY"],"km2":155800},{"id":"BEN","n":"Benin","cap":"Porto-Novo","sub":"waf","cont":"AF","g":"waf","lx":2.35,"ly":10.32,"cc":[2.62,6.48],"nb":["BFA","NER","NGA","TGO"],"km2":116080,"capAlt":["Porto Novo","Cotonou"],"f":"C","note":"Porto-Novo is the official capital; Cotonou is the seat of government and the largest city."},{"id":"BFA","n":"Burkina Faso","cap":"Ouagadougou","sub":"waf","cont":"AF","g":"waf","lx":-1.36,"ly":12.67,"cc":[-1.53,12.37],"nb":["BEN","CIV","GHA","MLI","NER","TGO"],"km2":272810,"f":"L"},{"id":"CPV","n":"Cabo Verde","cap":"Praia","sub":"waf","cont":"AF","g":"waf","lx":-23.64,"ly":15.07,"cc":[-23.52,14.92],"nb":[],"km2":3570,"alt":["Cape Verde"]},{"id":"CIV","n":"Côte d'Ivoire","cap":"Yamoussoukro","sub":"waf","cont":"AF","g":"waf","lx":-5.57,"ly":7.49,"cc":[-5.28,6.82],"nb":["BFA","GHA","GIN","LBR","MLI"],"km2":320650,"alt":["Cote d'Ivoire","Ivory Coast"],"capAlt":["Abidjan"],"f":"C","note":"Yamoussoukro is the official capital; Abidjan is the largest city, where most government offices are."},{"id":"GMB","n":"Gambia","cap":"Banjul","sub":"waf","cont":"AF","g":"waf","lx":-15.0,"ly":13.64,"cc":[-16.59,13.45],"nb":["SEN"],"km2":10270,"alt":["The Gambia"]},{"id":"GHA","n":"Ghana","cap":"Accra","sub":"waf","cont":"AF","g":"waf","lx":-1.04,"ly":7.72,"cc":[-0.22,5.55],"nb":["BFA","CIV","TGO"],"km2":238380},{"id":"GIN","n":"Guinea","cap":"Conakry","sub":"waf","cont":"AF","g":"waf","lx":-10.02,"ly":10.62,"cc":[-13.68,9.53],"nb":["CIV","GNB","LBR","MLI","SEN","SLE"],"km2":244130},{"id":"GNB","n":"Guinea-Bissau","cap":"Bissau","sub":"waf","cont":"AF","g":"waf","lx":-14.52,"ly":12.16,"cc":[-15.6,11.87],"nb":["GIN","SEN"],"km2":31930,"alt":["Guinea Bissau"]},{"id":"LBR","n":"Liberia","cap":"Monrovia","sub":"waf","cont":"AF","g":"waf","lx":-9.46,"ly":6.45,"cc":[-10.8,6.31],"nb":["CIV","GIN","SLE"],"km2":95140},{"id":"MLI","n":"Mali","cap":"Bamako","sub":"waf","cont":"AF","g":"waf","lx":-2.04,"ly":18.69,"cc":[-8.0,12.65],"nb":["BFA","CIV","DZA","GIN","MRT","NER","SEN"],"km2":1270870,"f":"L"},{"id":"MRT","n":"Mauritania","cap":"Nouakchott","sub":"waf","cont":"AF","g":"waf","lx":-9.74,"ly":19.59,"cc":[-15.98,18.09],"nb":["DZA","MLI","SEN"],"km2":1038220,"nbd":["MAR"]},{"id":"NER","n":"Niger","cap":"Niamey","sub":"waf","cont":"AF","g":"waf","lx":9.5,"ly":17.45,"cc":[2.11,13.52],"nb":["BEN","BFA","DZA","LBY","MLI","NGA","TCD"],"km2":1193680,"f":"L"},{"id":"NGA","n":"Nigeria","cap":"Abuja","sub":"waf","cont":"AF","g":"waf","lx":7.5,"ly":9.44,"cc":[7.53,9.09],"nb":["BEN","CMR","NER","TCD"],"km2":910620,"note":"Lagos, the largest city, was the capital until 1991."},{"id":"SEN","n":"Senegal","cap":"Dakar","sub":"waf","cont":"AF","g":"waf","lx":-14.78,"ly":15.14,"cc":[-17.48,14.72],"nb":["GIN","GMB","GNB","MLI","MRT"],"km2":196770},{"id":"SLE","n":"Sierra Leone","cap":"Freetown","sub":"waf","cont":"AF","g":"waf","lx":-11.76,"ly":8.62,"cc":[-13.24,8.47],"nb":["GIN","LBR"],"km2":71550},{"id":"TGO","n":"Togo","cap":"Lomé","sub":"waf","cont":"AF","g":"waf","lx":1.06,"ly":8.81,"cc":[1.22,6.13],"nb":["BEN","BFA","GHA"],"km2":56870,"capAlt":["Lome"]},{"id":"AGO","n":"Angola","cap":"Luanda","sub":"maf","cont":"AF","g":"maf","lx":17.98,"ly":-12.18,"cc":[13.23,-8.84],"nb":["COD","COG","NAM","ZMB"],"km2":1248830},{"id":"CMR","n":"Cameroon","cap":"Yaoundé","sub":"maf","cont":"AF","g":"maf","lx":12.47,"ly":4.59,"cc":[11.51,3.87],"nb":["CAF","COG","GAB","GNQ","NGA","TCD"],"km2":463730,"capAlt":["Yaounde"]},{"id":"CAF","n":"Central African Republic","cap":"Bangui","sub":"maf","cont":"AF","g":"maf","lx":20.91,"ly":6.99,"cc":[18.56,4.37],"nb":["CMR","COD","COG","SDN","SSD","TCD"],"km2":618640,"alt":["CAR"],"f":"L"},{"id":"TCD","n":"Chad","cap":"N'Djamena","sub":"maf","cont":"AF","g":"maf","lx":18.65,"ly":15.14,"cc":[15.05,12.12],"nb":["CAF","CMR","LBY","NER","NGA","SDN"],"km2":1282310,"capAlt":["Ndjamena","N’Djamena"],"f":"L"},{"id":"COG","n":"Republic of the Congo","cap":"Brazzaville","sub":"maf","cont":"AF","g":"maf","lx":15.9,"ly":0.14,"cc":[15.28,-4.26],"nb":["AGO","CAF","CMR","COD","GAB"],"km2":345570,"alt":["Congo","Congo-Brazzaville","Congo Republic"]},{"id":"COD","n":"Democratic Republic of the Congo","cap":"Kinshasa","sub":"maf","cont":"AF","g":"maf","lx":23.46,"ly":-1.86,"cc":[15.31,-4.33],"nb":["AGO","BDI","CAF","COG","RWA","SSD","TZA","UGA","ZMB"],"km2":2326540,"alt":["DR Congo","DRC","Congo-Kinshasa","D.R. Congo"]},{"id":"GNQ","n":"Equatorial Guinea","cap":"Ciudad de la Paz","sub":"maf","cont":"AF","g":"maf","lx":8.99,"ly":2.33,"cc":[10.66,1.58],"nb":["CMR","GAB"],"km2":26520,"capAlt":["Malabo"],"f":"C","note":"Ciudad de la Paz, a planned city on the mainland, has been named the capital in place of Malabo, on the island of Bioko; much of the government is still in Malabo. Both answers are accepted."},{"id":"GAB","n":"Gabon","cap":"Libreville","sub":"maf","cont":"AF","g":"maf","lx":11.84,"ly":-0.44,"cc":[9.46,0.39],"nb":["CMR","COG","GNQ"],"km2":259550},{"id":"STP","n":"São Tomé and Príncipe","cap":"São Tomé","sub":"maf","cont":"AF","g":"maf","lx":7.02,"ly":0.97,"cc":[6.73,0.33],"nb":[],"km2":980,"alt":["Sao Tome and Principe"],"capAlt":["Sao Tome"]},{"id":"BDI","n":"Burundi","cap":"Gitega","sub":"eaf","cont":"AF","g":"eaf","lx":29.92,"ly":-3.33,"cc":[29.92,-3.43],"nb":["COD","RWA","TZA"],"km2":27090,"capAlt":["Bujumbura"],"f":"LC","note":"Gitega became the political capital in 2019; Bujumbura, the largest city, remains the economic capital."},{"id":"COM","n":"Comoros","cap":"Moroni","sub":"eaf","cont":"AF","g":"eaf","lx":43.32,"ly":-11.73,"cc":[43.24,-11.7],"nb":[],"km2":1580},{"id":"DJI","n":"Djibouti","cap":"Djibouti","sub":"eaf","cont":"AF","g":"eaf","lx":42.5,"ly":11.98,"cc":[43.15,11.6],"nb":["ERI","ETH"],"km2":21610,"capAlt":["Djibouti City"],"nbd":["SOM"]},{"id":"ERI","n":"Eritrea","cap":"Asmara","sub":"eaf","cont":"AF","g":"eaf","lx":38.29,"ly":15.79,"cc":[38.93,15.33],"nb":["DJI","ETH","SDN"],"km2":123320},{"id":"ETH","n":"Ethiopia","cap":"Addis Ababa","sub":"eaf","cont":"AF","g":"eaf","lx":39.09,"ly":8.03,"cc":[38.7,9.04],"nb":["DJI","ERI","KEN","SDN","SOM","SSD"],"km2":1126260,"f":"L"},{"id":"KEN","n":"Kenya","cap":"Nairobi","sub":"eaf","cont":"AF","g":"eaf","lx":37.91,"ly":0.55,"cc":[36.81,-1.28],"nb":["ETH","SOM","SSD","TZA","UGA"],"km2":592600},{"id":"MDG","n":"Madagascar","cap":"Antananarivo","sub":"eaf","cont":"AF","g":"eaf","lx":46.7,"ly":-18.63,"cc":[47.51,-18.91],"nb":[],"km2":597970},{"id":"MWI","n":"Malawi","cap":"Lilongwe","sub":"eaf","cont":"AF","g":"eaf","lx":33.61,"ly":-13.39,"cc":[33.78,-13.98],"nb":["MOZ","TZA","ZMB"],"km2":119530,"f":"L"},{"id":"MUS","n":"Mauritius","cap":"Port Louis","sub":"eaf","cont":"AF","g":"eaf","lx":57.57,"ly":-20.3,"cc":[57.5,-20.17],"nb":[],"km2":1870},{"id":"MOZ","n":"Mozambique","cap":"Maputo","sub":"eaf","cont":"AF","g":"eaf","lx":37.84,"ly":-13.94,"cc":[32.59,-25.95],"nb":["MWI","SWZ","TZA","ZAF","ZMB","ZWE"],"km2":788820},{"id":"RWA","n":"Rwanda","cap":"Kigali","sub":"eaf","cont":"AF","g":"eaf","lx":30.1,"ly":-1.9,"cc":[30.06,-1.95],"nb":["BDI","COD","TZA","UGA"],"km2":25270,"f":"L"},{"id":"SYC","n":"Seychelles","cap":"Victoria","sub":"eaf","cont":"AF","g":"eaf","lx":55.48,"ly":-4.68,"cc":[55.45,-4.62],"nb":[],"km2":170},{"id":"SOM","n":"Somalia","cap":"Mogadishu","sub":"eaf","cont":"AF","g":"eaf","lx":45.19,"ly":3.57,"cc":[45.36,2.07],"nb":["ETH","KEN"],"km2":471260,"nbd":["DJI"]},{"id":"SSD","n":"South Sudan","cap":"Juba","sub":"eaf","cont":"AF","g":"eaf","lx":30.39,"ly":7.23,"cc":[31.58,4.83],"nb":["CAF","COD","ETH","KEN","SDN","UGA"],"km2":620610,"f":"L"},{"id":"UGA","n":"Uganda","cap":"Kampala","sub":"eaf","cont":"AF","g":"eaf","lx":32.95,"ly":1.97,"cc":[32.58,0.32],"nb":["COD","KEN","RWA","SSD","TZA"],"km2":241520,"f":"L"},{"id":"TZA","n":"Tanzania","cap":"Dodoma","sub":"eaf","cont":"AF","g":"eaf","lx":34.96,"ly":-6.05,"cc":[35.75,-6.18],"nb":["BDI","COD","KEN","MOZ","MWI","RWA","UGA","ZMB"],"km2":941940,"alt":["United Republic of Tanzania"],"capAlt":["Dar es Salaam"],"f":"C","note":"Dodoma is the official capital; Dar es Salaam is the largest city and still holds many offices."},{"id":"ZMB","n":"Zambia","cap":"Lusaka","sub":"eaf","cont":"AF","g":"eaf","lx":26.4,"ly":-14.66,"cc":[28.28,-15.41],"nb":["AGO","COD","MOZ","MWI","NAM","TZA","ZWE"],"km2":755640,"f":"L"},{"id":"ZWE","n":"Zimbabwe","cap":"Harare","sub":"eaf","cont":"AF","g":"eaf","lx":29.93,"ly":-18.91,"cc":[31.04,-17.82],"nb":["BWA","MOZ","ZAF","ZMB"],"km2":388240,"f":"L"},{"id":"BWA","n":"Botswana","cap":"Gaborone","sub":"saf","cont":"AF","g":"saf","lx":24.18,"ly":-22.1,"cc":[25.91,-24.65],"nb":["NAM","ZAF","ZWE"],"km2":577000,"f":"L"},{"id":"SWZ","n":"Eswatini","cap":"Mbabane","sub":"saf","cont":"AF","g":"saf","lx":31.47,"ly":-26.53,"cc":[31.13,-26.32],"nb":["MOZ","ZAF"],"km2":16930,"alt":["Swaziland"],"capAlt":["Lobamba"],"f":"LC","note":"Mbabane is the administrative capital; Lobamba is the royal and legislative capital."},{"id":"LSO","n":"Lesotho","cap":"Maseru","sub":"saf","cont":"AF","g":"saf","lx":28.25,"ly":-29.48,"cc":[27.48,-29.32],"nb":["ZAF"],"km2":29860,"f":"L","note":"Lesotho is completely surrounded by South Africa."},{"id":"NAM","n":"Namibia","cap":"Windhoek","sub":"saf","cont":"AF","g":"saf","lx":17.11,"ly":-20.58,"cc":[17.08,-22.57],"nb":["AGO","BWA","ZAF","ZMB"],"km2":824030},{"id":"ZAF","n":"South Africa","cap":"Pretoria","sub":"saf","cont":"AF","g":"saf","lx":23.67,"ly":-29.71,"cc":[28.23,-25.7],"nb":["BWA","LSO","MOZ","NAM","SWZ","ZWE"],"km2":1227950,"capAlt":["Cape Town","Bloemfontein"],"f":"C","note":"South Africa has three capitals: Pretoria (executive), Cape Town (legislative) and Bloemfontein (judicial)."},{"id":"ARM","n":"Armenia","cap":"Yerevan","sub":"was","cont":"AS","g":"was","lx":44.8,"ly":40.46,"cc":[44.51,40.18],"nb":["AZE","GEO","IRN","TUR"],"km2":29490,"f":"LT"},{"id":"AZE","n":"Azerbaijan","cap":"Baku","sub":"was","cont":"AS","g":"was","lx":47.21,"ly":40.4,"cc":[49.86,40.4],"nb":["ARM","GEO","IRN","RUS","TUR"],"km2":86080,"f":"LT"},{"id":"BHR","n":"Bahrain","cap":"Manama","sub":"was","cont":"AS","g":"was","lx":50.55,"ly":26.06,"cc":[50.58,26.24],"nb":[],"km2":540},{"id":"CYP","n":"Cyprus","cap":"Nicosia","sub":"was","cont":"AS","g":"was","lx":33.08,"ly":34.91,"cc":[33.37,35.17],"nb":[],"km2":5680,"f":"T","note":"Cyprus lies in Asia by geography but is a member of the European Union."},{"id":"GEO","n":"Georgia","cap":"Tbilisi","sub":"was","cont":"AS","g":"was","lx":43.74,"ly":41.87,"cc":[44.79,41.73],"nb":["ARM","AZE","RUS","TUR"],"km2":69120,"f":"T"},{"id":"IRQ","n":"Iraq","cap":"Baghdad","sub":"was","cont":"AS","g":"was","lx":43.26,"ly":33.09,"cc":[44.39,33.34],"nb":["IRN","JOR","KWT","SAU","SYR","TUR"],"km2":432010},{"id":"ISR","n":"Israel","cap":"Jerusalem","sub":"was","cont":"AS","g":"was","lx":34.85,"ly":30.91,"cc":[35.21,31.78],"nb":["EGY","JOR","LBN","PSE","SYR"],"km2":21850,"capAlt":["Tel Aviv"],"f":"X","note":"Israel designates Jerusalem as its capital. Its status is disputed: some countries recognize it, and many keep their embassies in Tel Aviv."},{"id":"JOR","n":"Jordan","cap":"Amman","sub":"was","cont":"AS","g":"was","lx":36.38,"ly":30.81,"cc":[35.93,31.95],"nb":["IRQ","ISR","PSE","SAU","SYR"],"km2":88390,"nbd":["LBN"]},{"id":"KWT","n":"Kuwait","cap":"Kuwait City","sub":"was","cont":"AS","g":"was","lx":47.31,"ly":29.41,"cc":[47.98,29.37],"nb":["IRQ","SAU"],"km2":17250,"capAlt":["Kuwait"]},{"id":"LBN","n":"Lebanon","cap":"Beirut","sub":"was","cont":"AS","g":"was","lx":35.99,"ly":34.13,"cc":[35.51,33.87],"nb":["ISR","SYR"],"km2":9970,"nbd":["JOR"]},{"id":"OMN","n":"Oman","cap":"Muscat","sub":"was","cont":"AS","g":"was","lx":57.34,"ly":22.12,"cc":[58.59,23.61],"nb":["ARE","SAU","YEM"],"km2":309790},{"id":"PSE","n":"Palestine","cap":"East Jerusalem","sub":"was","cont":"AS","g":"was","lx":35.29,"ly":32.05,"cc":[35.23,31.78],"nb":["EGY","ISR","JOR"],"km2":6310,"alt":["State of Palestine"],"capAlt":["Ramallah"],"f":"OX","note":"The State of Palestine is a UN observer state. It names East Jerusalem as its capital; the Palestinian Authority's offices are in Ramallah. Its status is disputed."},{"id":"QAT","n":"Qatar","cap":"Doha","sub":"was","cont":"AS","g":"was","lx":51.14,"ly":25.24,"cc":[51.53,25.29],"nb":["SAU"],"km2":11030},{"id":"SAU","n":"Saudi Arabia","cap":"Riyadh","sub":"was","cont":"AS","g":"was","lx":44.7,"ly":23.81,"cc":[46.77,24.64],"nb":["ARE","IRQ","JOR","KWT","OMN","QAT","YEM"],"km2":1931150},{"id":"SYR","n":"Syria","cap":"Damascus","sub":"was","cont":"AS","g":"was","lx":38.28,"ly":35.01,"cc":[36.3,33.5],"nb":["IRQ","ISR","JOR","LBN","TUR"],"km2":185030},{"id":"TUR","n":"Türkiye","cap":"Ankara","sub":"was","cont":"AS","g":"was","lx":34.51,"ly":39.35,"cc":[32.86,39.93],"nb":["ARM","AZE","BGR","GEO","GRC","IRN","IRQ","SYR"],"km2":780190,"alt":["Turkey","Turkiye"],"f":"T","note":"Türkiye (Turkey) spans Europe and Asia; Istanbul, its largest city, sits on both sides of the Bosporus."},{"id":"ARE","n":"United Arab Emirates","cap":"Abu Dhabi","sub":"was","cont":"AS","g":"was","lx":54.55,"ly":23.47,"cc":[54.37,24.47],"nb":["OMN","SAU"],"km2":70810,"alt":["UAE","U.A.E."]},{"id":"YEM","n":"Yemen","cap":"Sanaa","sub":"was","cont":"AS","g":"was","lx":45.87,"ly":15.33,"cc":[44.2,15.36],"nb":["OMN","SAU"],"km2":451900,"capAlt":["Sana'a","Aden"],"f":"C","note":"Sanaa is the capital named in the constitution; the government has also worked from Aden, a port city in the south. Both answers are accepted."},{"id":"KAZ","n":"Kazakhstan","cap":"Astana","sub":"cas","cont":"AS","g":"csa","lx":68.69,"ly":49.05,"cc":[71.43,51.18],"nb":["CHN","KGZ","RUS","TKM","UZB"],"km2":2714630,"f":"LT","note":"Kazakhstan's land reaches west of the Ural River, into Europe."},{"id":"KGZ","n":"Kyrgyzstan","cap":"Bishkek","sub":"cas","cont":"AS","g":"csa","lx":74.53,"ly":41.67,"cc":[74.58,42.88],"nb":["CHN","KAZ","TJK","UZB"],"km2":199110,"f":"L"},{"id":"TJK","n":"Tajikistan","cap":"Dushanbe","sub":"cas","cont":"AS","g":"csa","lx":72.59,"ly":38.2,"cc":[68.77,38.56],"nb":["AFG","CHN","KGZ","UZB"],"km2":140990,"f":"L"},{"id":"TKM","n":"Turkmenistan","cap":"Ashgabat","sub":"cas","cont":"AS","g":"csa","lx":58.68,"ly":39.86,"cc":[58.38,37.95],"nb":["AFG","IRN","KAZ","UZB"],"km2":465950,"capAlt":["Ashkhabad"],"f":"L"},{"id":"UZB","n":"Uzbekistan","cap":"Tashkent","sub":"cas","cont":"AS","g":"csa","lx":64.01,"ly":41.69,"cc":[69.29,41.31],"nb":["AFG","KAZ","KGZ","TJK","TKM"],"km2":449020,"f":"L","note":"Uzbekistan is doubly landlocked: its neighbors are landlocked too."},{"id":"AFG","n":"Afghanistan","cap":"Kabul","sub":"sas","cont":"AS","g":"csa","lx":66.5,"ly":34.16,"cc":[69.18,34.52],"nb":["CHN","IRN","PAK","TJK","TKM","UZB"],"km2":631200,"f":"L","nbd":["IND"]},{"id":"BGD","n":"Bangladesh","cap":"Dhaka","sub":"sas","cont":"AS","g":"csa","lx":89.68,"ly":24.21,"cc":[90.41,23.73],"nb":["IND","MMR"],"km2":135230},{"id":"BTN","n":"Bhutan","cap":"Thimphu","sub":"sas","cont":"AS","g":"csa","lx":90.04,"ly":27.54,"cc":[89.64,27.47],"nb":["CHN","IND"],"km2":39700,"f":"L","nbd":["MMR"]},{"id":"IND","n":"India","cap":"New Delhi","sub":"sas","cont":"AS","g":"csa","lx":79.36,"ly":22.69,"cc":[77.2,28.6],"nb":["BGD","BTN","CHN","MMR","NPL","PAK"],"km2":3107300,"capAlt":["Delhi"],"nbd":["AFG"]},{"id":"IRN","n":"Iran","cap":"Tehran","sub":"sas","cont":"AS","g":"csa","lx":54.93,"ly":32.17,"cc":[51.42,35.67],"nb":["AFG","ARM","AZE","IRQ","PAK","TKM","TUR"],"km2":1600460,"capAlt":["Teheran"]},{"id":"MDV","n":"Maldives","cap":"Malé","sub":"sas","cont":"AS","g":"csa","lx":73.51,"ly":4.17,"cc":[73.5,4.17],"nb":[],"km2":66,"capAlt":["Male"]},{"id":"NPL","n":"Nepal","cap":"Kathmandu","sub":"sas","cont":"AS","g":"csa","lx":83.64,"ly":28.3,"cc":[85.31,27.72],"nb":["CHN","IND"],"km2":146760,"f":"L"},{"id":"PAK","n":"Pakistan","cap":"Islamabad","sub":"sas","cont":"AS","g":"csa","lx":68.55,"ly":29.33,"cc":[73.16,33.7],"nb":["AFG","CHN","IND","IRN"],"km2":869300,"note":"Karachi, the largest city, was the capital until the 1960s."},{"id":"LKA","n":"Sri Lanka","cap":"Sri Jayawardenepura Kotte","sub":"sas","cont":"AS","g":"csa","lx":80.7,"ly":7.58,"cc":[79.9,6.9],"nb":[],"km2":65650,"capAlt":["Kotte","Colombo"],"f":"C","note":"Sri Jayawardenepura Kotte is the official capital, where parliament sits; Colombo, next to it, is the largest city and holds many offices."},{"id":"CHN","n":"China","cap":"Beijing","sub":"eas","cont":"AS","g":"eas","lx":106.34,"ly":32.5,"cc":[116.39,39.93],"nb":["AFG","BTN","HKG","IND","KAZ","KGZ","LAO","MAC","MMR","MNG","NPL","PAK","PRK","RUS","TJK","VNM"],"km2":9451820,"capAlt":["Peking"]},{"id":"JPN","n":"Japan","cap":"Tokyo","sub":"eas","cont":"AS","g":"eas","lx":138.44,"ly":36.14,"cc":[139.75,35.69],"nb":[],"km2":368670},{"id":"MNG","n":"Mongolia","cap":"Ulaanbaatar","sub":"eas","cont":"AS","g":"eas","lx":104.15,"ly":46.0,"cc":[106.91,47.92],"nb":["CHN","RUS"],"km2":1526850,"capAlt":["Ulan Bator"],"f":"L"},{"id":"PRK","n":"North Korea","cap":"Pyongyang","sub":"eas","cont":"AS","g":"eas","lx":126.44,"ly":39.89,"cc":[125.75,39.02],"nb":["CHN","KOR","RUS"],"km2":121510,"alt":["Democratic People's Republic of Korea","DPRK"]},{"id":"KOR","n":"South Korea","cap":"Seoul","sub":"eas","cont":"AS","g":"eas","lx":128.13,"ly":36.38,"cc":[127.0,37.57],"nb":["PRK"],"km2":97170,"alt":["Republic of Korea","Korea"]},{"id":"BRN","n":"Brunei","cap":"Bandar Seri Begawan","sub":"sea","cont":"AS","g":"sea","lx":114.55,"ly":4.45,"cc":[114.93,4.88],"nb":["MYS"],"km2":5650,"alt":["Brunei Darussalam"]},{"id":"KHM","n":"Cambodia","cap":"Phnom Penh","sub":"sea","cont":"AS","g":"sea","lx":104.5,"ly":12.65,"cc":[104.91,11.55],"nb":["LAO","THA","VNM"],"km2":180580},{"id":"IDN","n":"Indonesia","cap":"Jakarta","sub":"sea","cont":"AS","g":"sea","lx":101.89,"ly":-0.95,"cc":[106.83,-6.17],"nb":["MYS","PNG","TLS"],"km2":1864950,"capAlt":["Nusantara"],"f":"T","note":"Indonesia is building Nusantara, a planned city on Borneo, as its future capital; Jakarta is still the working capital. New Guinea's western half, part of Indonesia, is often counted with Oceania."},{"id":"LAO","n":"Laos","cap":"Vientiane","sub":"sea","cont":"AS","g":"sea","lx":102.53,"ly":19.43,"cc":[102.6,17.97],"nb":["CHN","KHM","MMR","THA","VNM"],"km2":228150,"alt":["Lao PDR"],"f":"L"},{"id":"MYS","n":"Malaysia","cap":"Kuala Lumpur","sub":"sea","cont":"AS","g":"sea","lx":113.84,"ly":2.53,"cc":[101.7,3.17],"nb":["BRN","IDN","THA"],"km2":326210,"capAlt":["Putrajaya"],"f":"C","note":"Kuala Lumpur is the capital; most federal government offices are in Putrajaya, a planned city nearby."},{"id":"MMR","n":"Myanmar","cap":"Naypyidaw","sub":"sea","cont":"AS","g":"sea","lx":95.8,"ly":21.57,"cc":[96.13,19.75],"nb":["BGD","CHN","IND","LAO","THA"],"km2":666440,"alt":["Burma"],"capAlt":["Nay Pyi Taw","Naypyitaw"],"note":"Yangon (Rangoon) was the capital until 2005.","nbd":["BTN"]},{"id":"PHL","n":"Philippines","cap":"Manila","sub":"sea","cont":"AS","g":"sea","lx":122.47,"ly":11.2,"cc":[120.98,14.61],"nb":[],"km2":289500,"alt":["The Philippines"]},{"id":"SGP","n":"Singapore","cap":"Singapore","sub":"sea","cont":"AS","g":"sea","lx":103.82,"ly":1.37,"cc":[103.85,1.29],"nb":[],"km2":480,"capAlt":["Singapore City"],"note":"Singapore is a city-state."},{"id":"THA","n":"Thailand","cap":"Bangkok","sub":"sea","cont":"AS","g":"sea","lx":101.07,"ly":15.46,"cc":[100.51,13.75],"nb":["KHM","LAO","MMR","MYS"],"km2":517330},{"id":"TLS","n":"Timor-Leste","cap":"Dili","sub":"sea","cont":"AS","g":"sea","lx":125.85,"ly":-8.8,"cc":[125.58,-8.56],"nb":["IDN"],"km2":14950,"alt":["East Timor","Timor Leste"]},{"id":"VNM","n":"Vietnam","cap":"Hanoi","sub":"sea","cont":"AS","g":"sea","lx":105.39,"ly":21.72,"cc":[105.85,21.04],"nb":["CHN","KHM","LAO"],"km2":328590,"alt":["Viet Nam"],"capAlt":["Ha Noi"]},{"id":"AUS","n":"Australia","cap":"Canberra","sub":"anz","cont":"OC","g":"oce","lx":134.05,"ly":-24.13,"cc":[149.13,-35.28],"nb":[],"km2":7855380},{"id":"NZL","n":"New Zealand","cap":"Wellington","sub":"anz","cont":"OC","g":"oce","lx":172.5,"ly":-41.5,"cc":[174.78,-41.3],"nb":[],"km2":268160},{"id":"FJI","n":"Fiji","cap":"Suva","sub":"mel","cont":"OC","g":"oce","lx":178.1,"ly":-17.8,"cc":[178.44,-18.13],"nb":[],"km2":18320},{"id":"PNG","n":"Papua New Guinea","cap":"Port Moresby","sub":"mel","cont":"OC","g":"oce","lx":143.91,"ly":-5.7,"cc":[147.19,-9.46],"nb":["IDN"],"km2":461530,"alt":["PNG"]},{"id":"SLB","n":"Solomon Islands","cap":"Honiara","sub":"mel","cont":"OC","g":"oce","lx":159.17,"ly":-8.03,"cc":[159.95,-9.44],"nb":[],"km2":25620},{"id":"VUT","n":"Vanuatu","cap":"Port Vila","sub":"mel","cont":"OC","g":"oce","lx":166.91,"ly":-15.37,"cc":[168.32,-17.73],"nb":[],"km2":11240},{"id":"KIR","n":"Kiribati","cap":"Tarawa","sub":"mic","cont":"OC","g":"oce","lx":173.0,"ly":1.4,"cc":[173.03,1.33],"nb":[],"km2":930,"capAlt":["South Tarawa"]},{"id":"MHL","n":"Marshall Islands","cap":"Majuro","sub":"mic","cont":"OC","g":"oce","lx":171.19,"ly":7.08,"cc":[171.38,7.1],"nb":[],"km2":240},{"id":"FSM","n":"Micronesia","cap":"Palikir","sub":"mic","cont":"OC","g":"oce","lx":158.23,"ly":6.89,"cc":[158.15,6.92],"nb":[],"km2":520,"alt":["Federated States of Micronesia"]},{"id":"NRU","n":"Nauru","cap":"Yaren","sub":"mic","cont":"OC","g":"oce","lx":166.93,"ly":-0.52,"cc":[166.92,-0.55],"nb":[],"km2":28,"capAlt":["Yaren District"],"f":"C","note":"Nauru has no official capital; the government sits in Yaren District."},{"id":"PLW","n":"Palau","cap":"Ngerulmud","sub":"mic","cont":"OC","g":"oce","lx":134.58,"ly":7.52,"cc":[134.62,7.5],"nb":[],"km2":340},{"id":"WSM","n":"Samoa","cap":"Apia","sub":"pol","cont":"OC","g":"oce","lx":-172.44,"ly":-13.64,"cc":[-171.74,-13.84],"nb":[],"km2":2690},{"id":"TON","n":"Tonga","cap":"Nukuʻalofa","sub":"pol","cont":"OC","g":"oce","lx":-175.16,"ly":-21.21,"cc":[-175.22,-21.14],"nb":[],"km2":430,"capAlt":["Nuku'alofa","Nukualofa"]},{"id":"TUV","n":"Tuvalu","cap":"Funafuti","sub":"pol","cont":"OC","g":"oce","lx":179.21,"ly":-8.51,"cc":[179.22,-8.52],"nb":[],"km2":10}],"O":[{"id":"abkhazia","n":"Abkhazia","kind":"disputed","note":"Abkhazia broke away from Georgia in the early 1990s. Russia and a few other countries recognize it; Georgia and most countries consider it part of Georgia.","lx":41.28,"ly":43.06,"layer":"disputed"},{"id":"abyei","n":"Abyei","kind":"disputed","note":"The Abyei area is claimed by both Sudan and South Sudan.","lx":28.41,"ly":9.74,"layer":"disputed"},{"id":"aksai","n":"Aksai Chin (administered by China)","kind":"disputed","note":"Aksai Chin is administered by China and claimed by India.","lx":79.17,"ly":35.06,"layer":"disputed"},{"id":"ASM","n":"American Samoa","kind":"territory","of":"USA","note":"American Samoa is a territory of the United States.","lx":-170.75,"ly":-14.33,"km2":120},{"id":"AIA","n":"Anguilla","kind":"territory","of":"GBR","note":"Anguilla is a territory of the United Kingdom.","lx":-63.03,"ly":18.24,"km2":80},{"id":"ATA","n":"Antarctica","kind":"continent","note":"Antarctica has no countries and no permanent residents. Under the Antarctic Treaty (1959), it is used for peaceful purposes and science; seven countries' territorial claims are set aside by the treaty.","lx":35.89,"ly":-79.84,"km2":19591070},{"id":"ABW","n":"Aruba","kind":"territory","of":"NLD","note":"Aruba is a territory of the Netherlands.","lx":-69.97,"ly":12.52,"km2":150},{"id":"arunachal","n":"Arunachal Pradesh (administered by India)","kind":"disputed","note":"Arunachal Pradesh is a state of India; China claims most of it.","lx":94.37,"ly":28.25,"layer":"disputed"},{"id":"ATC","n":"Ashmore and Cartier Islands","kind":"territory","of":"AUS","note":"Ashmore and Cartier Islands is a territory of Australia.","lx":123.59,"ly":-12.43,"km2":0},{"id":"BMU","n":"Bermuda","kind":"territory","of":"GBR","note":"Bermuda is a territory of the United Kingdom.","lx":-64.76,"ly":32.3,"km2":70},{"id":"IOT","n":"British Indian Ocean Territory","kind":"territory","of":"GBR","note":"The British Indian Ocean Territory (the Chagos Islands) is administered by the United Kingdom; Mauritius also claims the islands.","lx":71.35,"ly":-6.19,"km2":130},{"id":"VGB","n":"British Virgin Islands","kind":"territory","of":"GBR","note":"British Virgin Islands is a territory of the United Kingdom.","lx":-64.64,"ly":18.43,"km2":130},{"id":"CYM","n":"Cayman Islands","kind":"territory","of":"GBR","note":"Cayman Islands is a territory of the United Kingdom.","lx":-81.24,"ly":19.32,"km2":300},{"id":"IOA","n":"Christmas Island and Cocos Islands","kind":"territory","of":"AUS","note":"Christmas Island and Cocos Islands is a territory of Australia.","lx":105.67,"ly":-10.49,"km2":140},{"id":"COK","n":"Cook Islands","kind":"territory","of":"NZL","note":"Cook Islands is a territory of New Zealand.","lx":-159.79,"ly":-21.22,"km2":60},{"id":"crimea","n":"Crimea","kind":"disputed","note":"Crimea was part of Ukraine until 2014, when Russia took control of it and annexed it. Ukraine and most UN members consider it part of Ukraine; Russia considers it part of Russia.","lx":34.2,"ly":45.3,"layer":"disputed"},{"id":"CUW","n":"Curaçao","kind":"territory","of":"NLD","note":"Curaçao is a territory of the Netherlands.","lx":-68.92,"ly":12.15,"km2":430},{"id":"FLK","n":"Falkland Islands","kind":"territory","of":"GBR","note":"The Falkland Islands are a British overseas territory. Argentina also claims them and calls them the Islas Malvinas.","lx":-58.74,"ly":-51.61,"km2":11350},{"id":"FRO","n":"Faroe Islands","kind":"territory","of":"DNK","note":"Faroe Islands is a territory of Denmark.","lx":-7.06,"ly":62.19,"km2":1030},{"id":"PYF","n":"French Polynesia","kind":"territory","of":"FRA","note":"French Polynesia is a territory of France.","lx":-149.46,"ly":-17.63,"km2":2600},{"id":"ATF","n":"French Southern and Antarctic Lands","kind":"territory","of":"FRA","note":"French Southern and Antarctic Lands is a territory of France.","lx":69.12,"ly":-49.3,"km2":6940},{"id":"gb","n":"Gilgit-Baltistan (administered by Pakistan)","kind":"disputed","note":"Kashmir is divided among India, Pakistan and China. India and Pakistan each claim the whole of the former princely state of Jammu and Kashmir. This part is administered by Pakistan.","lx":74.85,"ly":36.0,"layer":"disputed"},{"id":"golan","n":"Golan Heights","kind":"disputed","note":"Israel has controlled the Golan Heights since 1967 and annexed it in 1981. Syria claims it; most countries consider it Syrian territory held by Israel, and a few recognize Israel's claim.","lx":35.73,"ly":32.99,"layer":"disputed"},{"id":"GRL","n":"Greenland","kind":"territory","of":"DNK","note":"Greenland, the world's largest island, is a self-governing part of the Kingdom of Denmark.","lx":-39.34,"ly":74.32,"km2":2460270},{"id":"GUM","n":"Guam","kind":"territory","of":"USA","note":"Guam is a territory of the United States.","lx":144.7,"ly":13.35,"km2":480},{"id":"GGY","n":"Guernsey","kind":"territory","of":"GBR","note":"Guernsey is a territory of the United Kingdom.","lx":-2.56,"ly":49.46,"km2":50},{"id":"HMD","n":"Heard Island and McDonald Islands","kind":"territory","of":"AUS","note":"Heard Island and McDonald Islands is a territory of Australia.","lx":73.51,"ly":-53.1,"km2":420},{"id":"HKG","n":"Hong Kong","kind":"territory","of":"CHN","note":"Hong Kong is a special administrative region of China.","lx":114.1,"ly":22.45,"km2":1020},{"id":"ilemi","n":"Ilemi Triangle","kind":"disputed","note":"The Ilemi Triangle is administered by Kenya and claimed by South Sudan.","lx":35.18,"ly":4.79,"layer":"disputed"},{"id":"IMN","n":"Isle of Man","kind":"territory","of":"GBR","note":"Isle of Man is a territory of the United Kingdom.","lx":-4.53,"ly":54.22,"km2":550},{"id":"jk","n":"Jammu and Kashmir (administered by India)","kind":"disputed","note":"Kashmir is divided among India, Pakistan and China. India and Pakistan each claim the whole of the former princely state of Jammu and Kashmir. This part is administered by India.","lx":77.29,"ly":34.06,"layer":"disputed"},{"id":"JEY","n":"Jersey","kind":"territory","of":"GBR","note":"Jersey is a territory of the United Kingdom.","lx":-2.09,"ly":49.22,"km2":130},{"id":"XKX","n":"Kosovo","kind":"disputed","note":"Kosovo declared independence from Serbia in 2008, with its capital at Pristina. More than 100 UN members have recognized it; Serbia and many others have not, and it is not a UN member.","cap":"Pristina","lx":20.86,"ly":42.59,"cc":[21.17,42.67],"km2":10860},{"id":"MAC","n":"Macau","kind":"territory","of":"CHN","note":"Macau is a special administrative region of China.","lx":113.56,"ly":22.13,"km2":20},{"id":"MSR","n":"Montserrat","kind":"territory","of":"GBR","note":"Montserrat is a territory of the United Kingdom.","lx":-62.19,"ly":16.74,"km2":80},{"id":"NCL","n":"New Caledonia","kind":"territory","of":"FRA","note":"New Caledonia is a territory of France.","lx":165.08,"ly":-21.06,"km2":18580},{"id":"NIU","n":"Niue","kind":"territory","of":"NZL","note":"Niue is a territory of New Zealand.","lx":-169.86,"ly":-19.05,"km2":200},{"id":"NFK","n":"Norfolk Island","kind":"territory","of":"AUS","note":"Norfolk Island is a territory of Australia.","lx":167.95,"ly":-29.03,"km2":40},{"id":"CYN","n":"Northern Cyprus","kind":"disputed","note":"The northern part of the island of Cyprus has been run by a Turkish Cypriot administration since 1974. Only Türkiye recognizes it as a state; the UN and other countries consider it part of the Republic of Cyprus.","lx":33.69,"ly":35.22,"layer":"disputed"},{"id":"MNP","n":"Northern Mariana Islands","kind":"territory","of":"USA","note":"Northern Mariana Islands is a territory of the United States.","lx":145.73,"ly":15.19,"km2":390},{"id":"PCN","n":"Pitcairn Islands","kind":"territory","of":"GBR","note":"Pitcairn Islands is a territory of the United Kingdom.","lx":-128.32,"ly":-24.36,"km2":40},{"id":"PRI","n":"Puerto Rico","kind":"territory","of":"USA","note":"Puerto Rico is a territory of the United States; its people are U.S. citizens.","lx":-66.48,"ly":18.23,"km2":8900},{"id":"SHN","n":"Saint Helena","kind":"territory","of":"GBR","note":"Saint Helena is a territory of the United Kingdom.","lx":-5.71,"ly":-15.95,"km2":180},{"id":"MAF","n":"Saint Martin (French part)","kind":"territory","of":"FRA","note":"Saint Martin (French part) is a territory of France.","lx":-63.05,"ly":18.08,"km2":50},{"id":"SPM","n":"Saint Pierre and Miquelon","kind":"territory","of":"FRA","note":"Saint Pierre and Miquelon is a territory of France.","lx":-56.33,"ly":47.04,"km2":200},{"id":"BLM","n":"Saint-Barthélemy","kind":"territory","of":"FRA","note":"Saint-Barthélemy is a territory of France.","lx":-62.83,"ly":17.9,"km2":20},{"id":"shaksgam","n":"Shaksgam Valley (administered by China)","kind":"disputed","note":"The Shaksgam Valley is administered by China and claimed by India.","lx":76.29,"ly":36.07,"layer":"disputed"},{"id":"KAS","n":"Siachen Glacier","kind":"disputed","note":"The Siachen Glacier, high in the Karakoram, is claimed by both India and Pakistan; India controls most of it.","lx":77.13,"ly":35.34,"layer":"disputed"},{"id":"SXM","n":"Sint Maarten (Dutch part)","kind":"territory","of":"NLD","note":"Sint Maarten (Dutch part) is a territory of the Netherlands.","lx":-63.07,"ly":18.04,"km2":40},{"id":"SOL","n":"Somaliland","kind":"disputed","note":"Somaliland, in northern Somalia, declared independence in 1991 and governs itself from Hargeisa. Somalia and most countries consider it part of Somalia.","cap":"Hargeisa","lx":46.73,"ly":9.44,"layer":"disputed","cc":[44.07,9.56]},{"id":"SGS","n":"South Georgia and the Islands","kind":"territory","of":"GBR","note":"South Georgia and the Islands is a territory of the United Kingdom.","lx":-31.06,"ly":-55.68,"km2":3650},{"id":"sossetia","n":"South Ossetia","kind":"disputed","note":"South Ossetia broke away from Georgia in the early 1990s. Russia and a few other countries recognize it; Georgia and most countries consider it part of Georgia.","lx":44.13,"ly":42.39,"layer":"disputed"},{"id":"TWN","n":"Taiwan","kind":"disputed","note":"Taiwan is governed by the Republic of China, with its capital at Taipei. The People's Republic of China claims Taiwan as part of China. Taiwan is not a member of the UN; a small number of countries recognize the Republic of China, and many others keep unofficial ties with Taiwan.","cap":"Taipei","lx":120.87,"ly":23.65,"cc":[121.57,25.04],"km2":35870},{"id":"transnistria","n":"Transnistria","kind":"disputed","note":"Transnistria has governed itself since 1992 but is not recognized by any UN member; Moldova and other countries consider it part of Moldova.","lx":29.25,"ly":47.29,"layer":"disputed"},{"id":"TCA","n":"Turks and Caicos Islands","kind":"territory","of":"GBR","note":"Turks and Caicos Islands is a territory of the United Kingdom.","lx":-71.75,"ly":21.82,"km2":330},{"id":"VIR","n":"United States Virgin Islands","kind":"territory","of":"USA","note":"United States Virgin Islands is a territory of the United States.","lx":-64.78,"ly":17.75,"km2":310},{"id":"WLF","n":"Wallis and Futuna","kind":"territory","of":"FRA","note":"Wallis and Futuna is a territory of France.","lx":-178.14,"ly":-14.29,"km2":130},{"id":"ESH","n":"Western Sahara","kind":"disputed","note":"Western Sahara is a disputed territory. Morocco controls most of it and claims all of it; the Polisario Front, which proclaimed the Sahrawi Arab Democratic Republic, controls the eastern part and claims all of it. The UN lists it as a non-self-governing territory.","lx":-13.68,"ly":25.24,"layer":"disputed"},{"id":"ALD","n":"Åland","kind":"territory","of":"FIN","note":"Åland is a territory of Finland.","lx":19.87,"ly":60.16,"km2":760}],"S":[{"id":"AL","n":"Alabama","cap":"Montgomery","div":"esc","reg":"s","lx":-86.72,"ly":32.86,"cc":[-86.28,32.36],"nb":["FL","GA","MS","TN"],"date":"1819-12-14","ord":22,"city":"Birmingham"},{"id":"AK","n":"Alaska","cap":"Juneau","div":"pac","reg":"w","lx":-152.5,"ly":64.0,"cc":[-134.42,58.31],"nb":[],"date":"1959-01-03","ord":49,"city":"Anchorage"},{"id":"AZ","n":"Arizona","cap":"Phoenix","div":"mtn","reg":"w","lx":-111.94,"ly":34.3,"cc":[-112.07,33.54],"nb":["CA","NM","NV","UT"],"date":"1912-02-14","ord":48,"city":"Tucson"},{"id":"AR","n":"Arkansas","cap":"Little Rock","div":"wsc","reg":"s","lx":-92.14,"ly":34.76,"cc":[-92.33,34.74],"nb":["LA","MO","MS","OK","TN","TX"],"date":"1836-06-15","ord":25,"city":"Fayetteville"},{"id":"CA","n":"California","cap":"Sacramento","div":"pac","reg":"w","lx":-119.59,"ly":36.75,"cc":[-121.47,38.58],"nb":["AZ","NV","OR"],"date":"1850-09-09","ord":31,"city":"Los Angeles"},{"id":"CO","n":"Colorado","cap":"Denver","div":"mtn","reg":"w","lx":-105.54,"ly":39.0,"cc":[-104.99,39.74],"nb":["KS","NE","NM","OK","UT","WY"],"date":"1876-08-01","ord":38,"city":"Colorado Springs"},{"id":"CT","n":"Connecticut","cap":"Hartford","div":"nen","reg":"ne","lx":-72.76,"ly":41.65,"cc":[-72.68,41.77],"nb":["MA","NY","RI"],"date":"1788-01-09","ord":5,"city":"Bridgeport"},{"id":"DE","n":"Delaware","cap":"Dover","div":"sat","reg":"s","lx":-75.41,"ly":38.87,"cc":[-75.52,39.16],"nb":["MD","PA"],"date":"1787-12-07","ord":1,"city":"Wilmington"},{"id":"FL","n":"Florida","cap":"Tallahassee","div":"sat","reg":"s","lx":-81.6,"ly":28.1,"cc":[-84.28,30.45],"nb":["AL","GA"],"date":"1845-03-03","ord":27,"city":"Miami"},{"id":"GA","n":"Georgia","cap":"Atlanta","div":"sat","reg":"s","lx":-83.41,"ly":32.85,"cc":[-84.4,33.83],"nb":["AL","FL","NC","SC","TN"],"date":"1788-01-02","ord":4,"city":"Savannah"},{"id":"HI","n":"Hawaii","cap":"Honolulu","div":"pac","reg":"w","lx":-155.5,"ly":19.7,"cc":[-157.86,21.31],"nb":[],"date":"1959-08-21","ord":50,"city":"Hilo"},{"id":"ID","n":"Idaho","cap":"Boise","div":"mtn","reg":"w","lx":-114.13,"ly":43.78,"cc":[-116.23,43.61],"nb":["MT","NV","OR","UT","WA","WY"],"date":"1890-07-03","ord":43,"city":"Idaho Falls"},{"id":"IL","n":"Illinois","cap":"Springfield","div":"enc","reg":"mw","lx":-89.2,"ly":39.95,"cc":[-89.65,39.82],"nb":["IA","IN","KY","MO","WI"],"date":"1818-12-03","ord":21,"city":"Chicago"},{"id":"IN","n":"Indiana","cap":"Indianapolis","div":"enc","reg":"mw","lx":-86.14,"ly":39.89,"cc":[-86.17,39.75],"nb":["IL","KY","MI","OH"],"date":"1816-12-11","ord":19,"city":"Fort Wayne"},{"id":"IA","n":"Iowa","cap":"Des Moines","div":"wnc","reg":"mw","lx":-93.39,"ly":42.04,"cc":[-93.62,41.58],"nb":["IL","MN","MO","NE","SD","WI"],"date":"1846-12-28","ord":29,"city":"Cedar Rapids"},{"id":"KS","n":"Kansas","cap":"Topeka","div":"wnc","reg":"mw","lx":-98.33,"ly":38.5,"cc":[-95.67,39.05],"nb":["CO","MO","NE","OK"],"date":"1861-01-29","ord":34,"city":"Wichita"},{"id":"KY","n":"Kentucky","cap":"Frankfort","div":"esc","reg":"s","lx":-85.57,"ly":37.4,"cc":[-84.87,38.2],"nb":["IL","IN","MO","OH","TN","VA","WV"],"date":"1792-06-01","ord":15,"city":"Louisville"},{"id":"LA","n":"Louisiana","cap":"Baton Rouge","div":"wsc","reg":"s","lx":-92.4,"ly":31.0,"cc":[-91.14,30.46],"nb":["AR","MS","TX"],"date":"1812-04-30","ord":18,"city":"New Orleans"},{"id":"ME","n":"Maine","cap":"Augusta","div":"nen","reg":"ne","lx":-69.2,"ly":45.15,"cc":[-69.78,44.31],"nb":["NH"],"date":"1820-03-15","ord":23,"city":"Portland"},{"id":"MD","n":"Maryland","cap":"Annapolis","div":"sat","reg":"s","lx":-77.05,"ly":39.39,"cc":[-76.49,38.98],"nb":["DC","DE","PA","VA","WV"],"date":"1788-04-28","ord":7,"city":"Baltimore"},{"id":"MA","n":"Massachusetts","cap":"Boston","div":"nen","reg":"ne","lx":-72.0,"ly":42.37,"cc":[-71.07,42.33],"nb":["CT","NH","NY","RI","VT"],"date":"1788-02-06","ord":6,"city":"Worcester"},{"id":"MI","n":"Michigan","cap":"Lansing","div":"enc","reg":"mw","lx":-84.6,"ly":43.6,"cc":[-84.55,42.73],"nb":["IN","OH","WI"],"date":"1837-01-26","ord":26,"city":"Detroit"},{"id":"MN","n":"Minnesota","cap":"Saint Paul","div":"wnc","reg":"mw","lx":-93.36,"ly":46.06,"cc":[-93.08,44.94],"nb":["IA","ND","SD","WI"],"date":"1858-05-11","ord":32,"city":"Minneapolis"},{"id":"MS","n":"Mississippi","cap":"Jackson","div":"esc","reg":"s","lx":-89.72,"ly":32.87,"cc":[-90.18,32.3],"nb":["AL","AR","LA","TN"],"date":"1817-12-10","ord":20,"city":"Biloxi"},{"id":"MO","n":"Missouri","cap":"Jefferson City","div":"wnc","reg":"mw","lx":-92.45,"ly":38.55,"cc":[-92.17,38.58],"nb":["AR","IA","IL","KS","KY","NE","OK","TN"],"date":"1821-08-10","ord":24,"city":"St. Louis"},{"id":"MT","n":"Montana","cap":"Helena","div":"mtn","reg":"w","lx":-110.04,"ly":47.0,"cc":[-112.04,46.59],"nb":["ID","ND","SD","WY"],"date":"1889-11-08","ord":41,"city":"Billings"},{"id":"NE","n":"Nebraska","cap":"Lincoln","div":"wnc","reg":"mw","lx":-99.69,"ly":41.5,"cc":[-96.68,40.82],"nb":["CO","IA","KS","MO","SD","WY"],"date":"1867-03-01","ord":37,"city":"Omaha"},{"id":"NV","n":"Nevada","cap":"Carson City","div":"mtn","reg":"w","lx":-117.02,"ly":39.43,"cc":[-119.77,39.16],"nb":["AZ","CA","ID","OR","UT"],"date":"1864-10-31","ord":36,"city":"Las Vegas"},{"id":"NH","n":"New Hampshire","cap":"Concord","div":"nen","reg":"ne","lx":-71.63,"ly":43.6,"cc":[-71.54,43.21],"nb":["MA","ME","VT"],"date":"1788-06-21","ord":9,"city":"Manchester"},{"id":"NJ","n":"New Jersey","cap":"Trenton","div":"mat","reg":"ne","lx":-74.47,"ly":40.04,"cc":[-74.74,40.22],"nb":["NY","PA"],"date":"1787-12-18","ord":3,"city":"Newark"},{"id":"NM","n":"New Mexico","cap":"Santa Fe","div":"mtn","reg":"w","lx":-106.02,"ly":34.5,"cc":[-105.94,35.69],"nb":["AZ","CO","OK","TX"],"date":"1912-01-06","ord":47,"city":"Albuquerque"},{"id":"NY","n":"New York","cap":"Albany","div":"mat","reg":"ne","lx":-75.32,"ly":43.2,"cc":[-73.82,42.67],"nb":["CT","MA","NJ","PA","VT"],"date":"1788-07-26","ord":11,"city":"New York City"},{"id":"NC","n":"North Carolina","cap":"Raleigh","div":"sat","reg":"s","lx":-78.87,"ly":35.62,"cc":[-78.64,35.82],"nb":["GA","SC","TN","VA"],"date":"1789-11-21","ord":12,"city":"Charlotte"},{"id":"ND","n":"North Dakota","cap":"Bismarck","div":"wnc","reg":"mw","lx":-100.3,"ly":47.47,"cc":[-100.78,46.81],"nb":["MN","MT","SD"],"date":"1889-11-02","ord":39,"city":"Fargo"},{"id":"OH","n":"Ohio","cap":"Columbus","div":"enc","reg":"mw","lx":-82.67,"ly":40.09,"cc":[-82.99,39.98],"nb":["IN","KY","MI","PA","WV"],"date":"1803-03-01","ord":17,"city":"Cleveland"},{"id":"OK","n":"Oklahoma","cap":"Oklahoma City","div":"wsc","reg":"s","lx":-97.13,"ly":35.45,"cc":[-97.52,35.47],"nb":["AR","CO","KS","MO","NM","TX"],"date":"1907-11-16","ord":46,"city":"Tulsa"},{"id":"OR","n":"Oregon","cap":"Salem","div":"pac","reg":"w","lx":-120.39,"ly":43.83,"cc":[-123.02,44.93],"nb":["CA","ID","NV","WA"],"date":"1859-02-14","ord":33,"city":"Portland"},{"id":"PA","n":"Pennsylvania","cap":"Harrisburg","div":"mat","reg":"ne","lx":-77.61,"ly":40.86,"cc":[-76.88,40.27],"nb":["DE","MD","NJ","NY","OH","WV"],"date":"1787-12-12","ord":2,"city":"Philadelphia"},{"id":"RI","n":"Rhode Island","cap":"Providence","div":"nen","reg":"ne","lx":-71.51,"ly":41.62,"cc":[-71.42,41.82],"nb":["CT","MA"],"date":"1790-05-29","ord":13,"city":"Newport"},{"id":"SC","n":"South Carolina","cap":"Columbia","div":"sat","reg":"s","lx":-80.65,"ly":33.86,"cc":[-80.9,34.04],"nb":["GA","NC"],"date":"1788-05-23","ord":8,"city":"Charleston"},{"id":"SD","n":"South Dakota","cap":"Pierre","div":"wnc","reg":"mw","lx":-100.25,"ly":44.47,"cc":[-100.35,44.37],"nb":["IA","MN","MT","ND","NE","WY"],"date":"1889-11-02","ord":40,"city":"Sioux Falls"},{"id":"TN","n":"Tennessee","cap":"Nashville","div":"esc","reg":"s","lx":-86.34,"ly":35.75,"cc":[-86.78,36.17],"nb":["AL","AR","GA","KY","MO","MS","NC","VA"],"date":"1796-06-01","ord":16,"city":"Memphis"},{"id":"TX","n":"Texas","cap":"Austin","div":"wsc","reg":"s","lx":-98.76,"ly":31.13,"cc":[-97.74,30.27],"nb":["AR","LA","NM","OK"],"date":"1845-12-29","ord":28,"city":"Houston"},{"id":"UT","n":"Utah","cap":"Salt Lake City","div":"mtn","reg":"w","lx":-111.54,"ly":39.5,"cc":[-111.93,40.78],"nb":["AZ","CO","ID","NV","WY"],"date":"1896-01-04","ord":45,"city":"Provo"},{"id":"VT","n":"Vermont","cap":"Montpelier","div":"nen","reg":"ne","lx":-72.73,"ly":44.09,"cc":[-72.58,44.26],"nb":["MA","NH","NY"],"date":"1791-03-04","ord":14,"city":"Burlington"},{"id":"VA","n":"Virginia","cap":"Richmond","div":"sat","reg":"s","lx":-78.24,"ly":37.74,"cc":[-77.45,37.55],"nb":["DC","KY","MD","NC","TN","WV"],"date":"1788-06-25","ord":10,"city":"Virginia Beach"},{"id":"WA","n":"Washington","cap":"Olympia","div":"pac","reg":"w","lx":-120.36,"ly":47.49,"cc":[-122.9,47.04],"nb":["ID","OR"],"date":"1889-11-11","ord":42,"city":"Seattle"},{"id":"WV","n":"West Virginia","cap":"Charleston","div":"sat","reg":"s","lx":-80.71,"ly":38.64,"cc":[-81.63,38.35],"nb":["KY","MD","OH","PA","VA"],"date":"1863-06-20","ord":35,"city":"Huntington"},{"id":"WI","n":"Wisconsin","cap":"Madison","div":"enc","reg":"mw","lx":-89.58,"ly":44.37,"cc":[-89.4,43.07],"nb":["IA","IL","MI","MN"],"date":"1848-05-29","ord":30,"city":"Milwaukee"},{"id":"WY","n":"Wyoming","cap":"Cheyenne","div":"mtn","reg":"w","lx":-107.55,"ly":43.0,"cc":[-104.82,41.14],"nb":["CO","ID","MT","NE","SD","UT"],"date":"1890-07-10","ord":44,"city":"Casper"},{"id":"DC","n":"District of Columbia","cap":"Washington","div":"sat","reg":"s","lx":-77.03,"ly":38.9,"cc":[-77.04,38.9],"nb":["MD","VA"],"city":"Georgetown"}],"R":[{"id":"nile","n":"Nile","cont":"AF"},{"id":"amazon","n":"Amazon","cont":"SA"},{"id":"yangtze","n":"Yangtze (Chang Jiang)","cont":"AS"},{"id":"mississippi","n":"Mississippi","cont":"NA"},{"id":"missouri","n":"Missouri","cont":"NA"},{"id":"ohio","n":"Ohio","cont":"NA"},{"id":"tennessee","n":"Tennessee","cont":"NA"},{"id":"arkansas","n":"Arkansas","cont":"NA"},{"id":"colorado","n":"Colorado","cont":"NA"},{"id":"columbia","n":"Columbia","cont":"NA"},{"id":"snake","n":"Snake","cont":"NA"},{"id":"riogrande","n":"Rio Grande","cont":"NA"},{"id":"hudson","n":"Hudson","cont":"NA"},{"id":"potomac","n":"Potomac","cont":"NA"},{"id":"stlawrence","n":"St. Lawrence","cont":"NA"},{"id":"yukon","n":"Yukon","cont":"NA"},{"id":"mackenzie","n":"Mackenzie","cont":"NA"},{"id":"yellow","n":"Yellow River (Huang He)","cont":"AS"},{"id":"mekong","n":"Mekong","cont":"AS"},{"id":"ganges","n":"Ganges","cont":"AS"},{"id":"indus","n":"Indus","cont":"AS"},{"id":"brahmaputra","n":"Brahmaputra","cont":"AS"},{"id":"euphrates","n":"Euphrates","cont":"AS"},{"id":"tigris","n":"Tigris","cont":"AS"},{"id":"ob","n":"Ob","cont":"AS"},{"id":"yenisey","n":"Yenisey","cont":"AS"},{"id":"lena","n":"Lena","cont":"AS"},{"id":"amur","n":"Amur","cont":"AS"},{"id":"irrawaddy","n":"Irrawaddy","cont":"AS"},{"id":"jordan","n":"Jordan","cont":"AS"},{"id":"congo","n":"Congo","cont":"AF"},{"id":"niger","n":"Niger","cont":"AF"},{"id":"zambezi","n":"Zambezi","cont":"AF"},{"id":"orange","n":"Orange","cont":"AF"},{"id":"limpopo","n":"Limpopo","cont":"AF"},{"id":"danube","n":"Danube","cont":"EU"},{"id":"volga","n":"Volga","cont":"EU"},{"id":"rhine","n":"Rhine","cont":"EU"},{"id":"dnieper","n":"Dnieper","cont":"EU"},{"id":"thames","n":"Thames","cont":"EU"},{"id":"seine","n":"Seine","cont":"EU"},{"id":"elbe","n":"Elbe","cont":"EU"},{"id":"loire","n":"Loire","cont":"EU"},{"id":"po","n":"Po","cont":"EU"},{"id":"vistula","n":"Vistula","cont":"EU"},{"id":"don","n":"Don","cont":"EU"},{"id":"parana","n":"Paraná","cont":"SA"},{"id":"orinoco","n":"Orinoco","cont":"SA"},{"id":"sanfrancisco","n":"São Francisco","cont":"SA"},{"id":"murray","n":"Murray","cont":"OC"},{"id":"darling","n":"Darling","cont":"OC"}],"G":[{"id":"himalayas","n":"Himalayas","k":"range","cont":"AS"},{"id":"andes","n":"Andes","k":"range","cont":"SA"},{"id":"rockies","n":"Rocky Mountains","k":"range","cont":"NA"},{"id":"alps","n":"Alps","k":"range","cont":"EU"},{"id":"appalachians","n":"Appalachian Mountains","k":"range","cont":"NA"},{"id":"urals","n":"Ural Mountains","k":"range","cont":"EU"},{"id":"atlas","n":"Atlas Mountains","k":"range","cont":"AF"},{"id":"caucasus","n":"Caucasus Mountains","k":"range","cont":"EU"},{"id":"greatdividing","n":"Great Dividing Range","k":"range","cont":"OC"},{"id":"sierranevada","n":"Sierra Nevada","k":"range","cont":"NA"},{"id":"cascades","n":"Cascade Range","k":"range","cont":"NA"},{"id":"alaskarange","n":"Alaska Range","k":"range","cont":"NA"},{"id":"brooks","n":"Brooks Range","k":"range","cont":"NA"},{"id":"pyrenees","n":"Pyrenees","k":"range","cont":"EU"},{"id":"carpathians","n":"Carpathian Mountains","k":"range","cont":"EU"},{"id":"zagros","n":"Zagros Mountains","k":"range","cont":"AS"},{"id":"hindukush","n":"Hindu Kush","k":"range","cont":"AS"},{"id":"tianshan","n":"Tian Shan","k":"range","cont":"AS"},{"id":"southernalps","n":"Southern Alps","k":"range","cont":"OC"},{"id":"ethiopianhighlands","n":"Ethiopian Highlands","k":"range","cont":"AF"},{"id":"drakensberg","n":"Drakensberg","k":"range","cont":"AF"},{"id":"sierramadreocc","n":"Sierra Madre Occidental","k":"range","cont":"NA"},{"id":"sierramadreor","n":"Sierra Madre Oriental","k":"range","cont":"NA"},{"id":"coastranges","n":"Coast Ranges","k":"range","cont":"NA"},{"id":"apennines","n":"Apennines","k":"range","cont":"EU"},{"id":"scandinavianmts","n":"Scandinavian Mountains","k":"range","cont":"EU"},{"id":"transantarctic","n":"Transantarctic Mountains","k":"range","cont":"AN"},{"id":"westernghats","n":"Western Ghats","k":"range","cont":"AS"},{"id":"sahara","n":"Sahara","k":"desert","cont":"AF"},{"id":"gobi","n":"Gobi Desert","k":"desert","cont":"AS"},{"id":"kalahari","n":"Kalahari Desert","k":"desert","cont":"AF"},{"id":"rubalkhali","n":"Rub' al Khali (Empty Quarter)","k":"desert","cont":"AS"},{"id":"atacama","n":"Atacama Desert","k":"desert","cont":"SA"},{"id":"namib","n":"Namib Desert","k":"desert","cont":"AF"},{"id":"greatvictoria","n":"Great Victoria Desert","k":"desert","cont":"OC"},{"id":"greatsandy","n":"Great Sandy Desert","k":"desert","cont":"OC"},{"id":"gibson","n":"Gibson Desert","k":"desert","cont":"OC"},{"id":"thar","n":"Thar Desert","k":"desert","cont":"AS"},{"id":"taklimakan","n":"Taklimakan Desert","k":"desert","cont":"AS"},{"id":"sonoran","n":"Sonoran Desert","k":"desert","cont":"NA"},{"id":"chihuahuan","n":"Chihuahuan Desert","k":"desert","cont":"NA"},{"id":"syrian","n":"Syrian Desert","k":"desert","cont":"AS"},{"id":"karakum","n":"Karakum Desert","k":"desert","cont":"AS"},{"id":"greatplains","n":"Great Plains","k":"plain","cont":"NA"},{"id":"coastalplain","n":"Atlantic and Gulf Coastal Plain","k":"plain","cont":"NA"},{"id":"centrallowland","n":"Central Lowland","k":"plain","cont":"NA"},{"id":"pampas","n":"Pampas","k":"plain","cont":"SA"},{"id":"llanos","n":"Llanos","k":"plain","cont":"SA"},{"id":"sahel","n":"Sahel","k":"plain","cont":"AF"},{"id":"neplain","n":"North European Plain","k":"plain","cont":"EU"},{"id":"westsiberian","n":"West Siberian Plain","k":"plain","cont":"AS"},{"id":"northchinaplain","n":"North China Plain","k":"plain","cont":"AS"},{"id":"gangesplain","n":"Ganges Plain","k":"plain","cont":"AS"},{"id":"granchaco","n":"Gran Chaco","k":"plain","cont":"SA"},{"id":"kazakhsteppe","n":"Kazakh Steppe","k":"plain","cont":"AS"},{"id":"nullarbor","n":"Nullarbor Plain","k":"plain","cont":"OC"},{"id":"tibet","n":"Plateau of Tibet","k":"plateau","cont":"AS"},{"id":"deccan","n":"Deccan Plateau","k":"plateau","cont":"AS"},{"id":"brazilianhighlands","n":"Brazilian Highlands","k":"plateau","cont":"SA"},{"id":"coloradoplateau","n":"Colorado Plateau","k":"plateau","cont":"NA"},{"id":"canadianshield","n":"Canadian Shield","k":"plateau","cont":"NA"},{"id":"mongolianplateau","n":"Mongolian Plateau","k":"plateau","cont":"AS"},{"id":"altiplano","n":"Altiplano","k":"plateau","cont":"SA"},{"id":"anatolia","n":"Anatolia","k":"plateau","cont":"AS"},{"id":"iberianplateau","n":"Meseta (Iberian Plateau)","k":"plateau","cont":"EU"},{"id":"amazonbasin","n":"Amazon Basin","k":"basin","cont":"SA"},{"id":"congobasin","n":"Congo Basin","k":"basin","cont":"AF"},{"id":"greatbasin","n":"Great Basin","k":"basin","cont":"NA"},{"id":"murraydarling","n":"Murray-Darling Basin","k":"basin","cont":"OC"},{"id":"siberia","n":"Siberia","k":"area","cont":"AS"},{"id":"patagonia","n":"Patagonia","k":"area","cont":"SA"},{"id":"arabianpen","n":"Arabian Peninsula","k":"peninsula","cont":"AS"},{"id":"indochina","n":"Indochina Peninsula","k":"peninsula","cont":"AS"},{"id":"scandinavia","n":"Scandinavian Peninsula","k":"peninsula","cont":"EU"},{"id":"balkan","n":"Balkan Peninsula","k":"peninsula","cont":"EU"},{"id":"kamchatka","n":"Kamchatka Peninsula","k":"peninsula","cont":"AS"},{"id":"malay","n":"Malay Peninsula","k":"peninsula","cont":"AS"},{"id":"somalipen","n":"Horn of Africa (Somali Peninsula)","k":"peninsula","cont":"AF"},{"id":"baja","n":"Baja California","k":"peninsula","cont":"NA"},{"id":"florida","n":"Florida Peninsula","k":"peninsula","cont":"NA"},{"id":"yucatan","n":"Yucatán Peninsula","k":"peninsula","cont":"NA"},{"id":"korea","n":"Korean Peninsula","k":"peninsula","cont":"AS"},{"id":"antarcticpen","n":"Antarctic Peninsula","k":"peninsula","cont":"AN"},{"id":"alaskapen","n":"Alaska Peninsula","k":"peninsula","cont":"NA"},{"id":"indiansub","n":"Indian subcontinent","k":"peninsula","cont":"AS"},{"id":"greenland","n":"Greenland","k":"island","cont":"NA"},{"id":"newguinea","n":"New Guinea","k":"island","cont":"OC"},{"id":"borneo","n":"Borneo","k":"island","cont":"AS"},{"id":"madagascar","n":"Madagascar","k":"island","cont":"AF"},{"id":"greatbritain","n":"Great Britain","k":"island","cont":"EU"},{"id":"sumatra","n":"Sumatra","k":"island","cont":"AS"},{"id":"honshu","n":"Honshu","k":"island","cont":"AS"},{"id":"baffin","n":"Baffin Island","k":"island","cont":"NA"},{"id":"iceland","n":"Iceland","k":"island","cont":"EU"},{"id":"tasmania","n":"Tasmania","k":"island","cont":"OC"},{"id":"riftvalley","n":"Great Rift Valley","k":"valley","cont":"AF"},{"id":"grandcanyon","n":"Grand Canyon","k":"valley","cont":"NA"},{"id":"centralvalley","n":"Central Valley","k":"valley","cont":"NA"},{"id":"pantanal","n":"Pantanal","k":"wetland","cont":"SA"},{"id":"sudd","n":"Sudd","k":"wetland","cont":"AF"},{"id":"panamaisthmus","n":"Isthmus of Panama","k":"isthmus","cont":"NA"},{"id":"kra","n":"Isthmus of Kra","k":"isthmus","cont":"AS"}],"L":[{"id":"deadsea","n":"Dead Sea"},{"id":"greatbearlake","n":"Great Bear Lake"},{"id":"greatsaltlake","n":"Great Salt Lake"},{"id":"greatslavelake","n":"Great Slave Lake"},{"id":"albert","n":"Lake Albert"},{"id":"athabasca","n":"Lake Athabasca"},{"id":"baikal","n":"Lake Baikal"},{"id":"balkhash","n":"Lake Balkhash"},{"id":"chad","n":"Lake Chad"},{"id":"champlain","n":"Lake Champlain"},{"id":"bodensee","n":"Lake Constance"},{"id":"edward","n":"Lake Edward"},{"id":"erie","n":"Lake Erie"},{"id":"eyrenorth","n":"Lake Eyre (Kati Thanda)"},{"id":"geneva","n":"Lake Geneva"},{"id":"huron","n":"Lake Huron"},{"id":"issykkul","n":"Lake Issyk-Kul"},{"id":"kariba","n":"Lake Kariba"},{"id":"kivu","n":"Lake Kivu"},{"id":"kyoga","n":"Lake Kyoga"},{"id":"ladoga","n":"Lake Ladoga"},{"id":"malawi","n":"Lake Malawi"},{"id":"mead","n":"Lake Mead"},{"id":"michigan","n":"Lake Michigan"},{"id":"moeru","n":"Lake Mweru"},{"id":"nasser","n":"Lake Nasser"},{"id":"denicaragua","n":"Lake Nicaragua"},{"id":"okeechobee","n":"Lake Okeechobee"},{"id":"onega","n":"Lake Onega"},{"id":"ontario","n":"Lake Ontario"},{"id":"peipus","n":"Lake Peipus"},{"id":"saimaa","n":"Lake Saimaa"},{"id":"stclair","n":"Lake Saint Clair"},{"id":"sevan","n":"Lake Sevan"},{"id":"superior","n":"Lake Superior"},{"id":"tahoe","n":"Lake Tahoe"},{"id":"tana","n":"Lake Tana"},{"id":"tanganyika","n":"Lake Tanganyika"},{"id":"taupo","n":"Lake Taupo"},{"id":"titicaca","n":"Lake Titicaca"},{"id":"turkana","n":"Lake Turkana"},{"id":"urmia","n":"Lake Urmia"},{"id":"van","n":"Lake Van"},{"id":"victoria","n":"Lake Victoria"},{"id":"volta","n":"Lake Volta"},{"id":"vanern","n":"Lake Vänern"},{"id":"vattern","n":"Lake Vättern"},{"id":"winnipeg","n":"Lake Winnipeg"},{"id":"winnipegosis","n":"Lake Winnipegosis"},{"id":"ofthewoods","n":"Lake of the Woods"},{"id":"northaralsea","n":"North Aral Sea"},{"id":"poyang","n":"Poyang Lake"},{"id":"qinghai","n":"Qinghai Lake"},{"id":"reindeerlake","n":"Reindeer Lake"},{"id":"seaofgalilee","n":"Sea of Galilee"},{"id":"southaralsea","n":"South Aral Sea"},{"id":"tonlesap","n":"Tonlé Sap"}],"CITIES":[{"n":"London","c":"GBR","utc":0,"lon":-0.12,"lat":51.5},{"n":"Reykjavík","c":"ISL","utc":0,"lon":-21.95,"lat":64.15},{"n":"Lisbon","c":"PRT","utc":0,"lon":-9.15,"lat":38.72},{"n":"Paris","c":"FRA","utc":1,"lon":2.33,"lat":48.87},{"n":"Rome","c":"ITA","utc":1,"lon":12.48,"lat":41.9},{"n":"Berlin","c":"DEU","utc":1,"lon":13.4,"lat":52.52},{"n":"Madrid","c":"ESP","utc":1,"lon":-3.69,"lat":40.4},{"n":"Lagos","c":"NGA","utc":1,"lon":3.39,"lat":6.45},{"n":"Cairo","c":"EGY","utc":2,"lon":31.25,"lat":30.05},{"n":"Johannesburg","c":"ZAF","utc":2,"lon":28.03,"lat":-26.17},{"n":"Athens","c":"GRC","utc":2,"lon":23.73,"lat":37.99},{"n":"Kyiv","c":"UKR","utc":2,"lon":30.51,"lat":50.44},{"n":"Moscow","c":"RUS","utc":3,"lon":37.61,"lat":55.75},{"n":"Istanbul","c":"TUR","utc":3,"lon":29.01,"lat":41.11},{"n":"Nairobi","c":"KEN","utc":3,"lon":36.81,"lat":-1.28},{"n":"Riyadh","c":"SAU","utc":3,"lon":46.77,"lat":24.64},{"n":"Tehran","c":"IRN","utc":3.5,"lon":51.42,"lat":35.67},{"n":"Dubai","c":"ARE","utc":4,"lon":55.28,"lat":25.23},{"n":"Kabul","c":"AFG","utc":4.5,"lon":69.18,"lat":34.52},{"n":"Karachi","c":"PAK","utc":5,"lon":66.99,"lat":24.87},{"n":"New Delhi","c":"IND","utc":5.5,"lon":77.2,"lat":28.6},{"n":"Mumbai","c":"IND","utc":5.5,"lon":72.86,"lat":19.02},{"n":"Kathmandu","c":"NPL","utc":5.75,"lon":85.31,"lat":27.72},{"n":"Dhaka","c":"BGD","utc":6,"lon":90.41,"lat":23.73},{"n":"Bangkok","c":"THA","utc":7,"lon":100.51,"lat":13.75},{"n":"Jakarta","c":"IDN","utc":7,"lon":106.83,"lat":-6.17},{"n":"Beijing","c":"CHN","utc":8,"lon":116.39,"lat":39.93},{"n":"Shanghai","c":"CHN","utc":8,"lon":121.43,"lat":31.22},{"n":"Singapore","c":"SGP","utc":8,"lon":103.85,"lat":1.29},{"n":"Manila","c":"PHL","utc":8,"lon":120.98,"lat":14.61},{"n":"Perth","c":"AUS","utc":8,"lon":115.84,"lat":-31.95},{"n":"Seoul","c":"KOR","utc":9,"lon":127.0,"lat":37.57},{"n":"Tokyo","c":"JPN","utc":9,"lon":139.75,"lat":35.69},{"n":"Sydney","c":"AUS","utc":10,"lon":151.18,"lat":-33.92},{"n":"Auckland","c":"NZL","utc":12,"lon":174.76,"lat":-36.85},{"n":"Apia","c":"WSM","utc":13,"lon":-171.74,"lat":-13.84},{"n":"Honolulu","c":"USA","utc":-10,"lon":-157.86,"lat":21.31},{"n":"Anchorage","c":"USA","utc":-9,"lon":-149.9,"lat":61.22},{"n":"Los Angeles","c":"USA","utc":-8,"lon":-118.18,"lat":33.99},{"n":"Vancouver","c":"CAN","utc":-8,"lon":-123.12,"lat":49.28},{"n":"Denver","c":"USA","utc":-7,"lon":-104.99,"lat":39.74},{"n":"Phoenix","c":"USA","utc":-7,"lon":-112.07,"lat":33.54},{"n":"Chicago","c":"USA","utc":-6,"lon":-87.75,"lat":41.83},{"n":"Mexico City","c":"MEX","utc":-6,"lon":-99.13,"lat":19.44},{"n":"New York","c":"USA","utc":-5,"lon":-73.98,"lat":40.75},{"n":"Toronto","c":"CAN","utc":-5,"lon":-79.42,"lat":43.7},{"n":"Bogotá","c":"COL","utc":-5,"lon":-74.09,"lat":4.6},{"n":"Lima","c":"PER","utc":-5,"lon":-77.05,"lat":-12.05},{"n":"Halifax","c":"CAN","utc":-4,"lon":-63.6,"lat":44.65},{"n":"Santiago","c":"CHL","utc":-4,"lon":-70.67,"lat":-33.45},{"n":"Buenos Aires","c":"ARG","utc":-3,"lon":-58.4,"lat":-34.6},{"n":"Rio de Janeiro","c":"BRA","utc":-3,"lon":-43.23,"lat":-22.92},{"n":"São Paulo","c":"BRA","utc":-3,"lon":-46.63,"lat":-23.56},{"n":"Cape Town","c":"ZAF","utc":2,"lon":18.43,"lat":-33.92},{"n":"Washington, D.C.","c":"USA","utc":-5,"lon":-77.01,"lat":38.9},{"n":"Quito","c":"ECU","utc":-5,"lon":-78.5,"lat":-0.21},{"n":"Ottawa","c":"CAN","utc":-5,"lon":-75.7,"lat":45.42},{"n":"Canberra","c":"AUS","utc":10,"lon":149.13,"lat":-35.28}],"SUB":{"naf":"Northern Africa","eaf":"Eastern Africa","maf":"Middle Africa","saf":"Southern Africa","waf":"Western Africa","car":"Caribbean","cam":"Central America","sam":"South America","nam":"Northern America","cas":"Central Asia","eas":"Eastern Asia","sea":"South-eastern Asia","sas":"Southern Asia","was":"Western Asia","eeu":"Eastern Europe","neu":"Northern Europe","seu":"Southern Europe","weu":"Western Europe","anz":"Australia and New Zealand","mel":"Melanesia","mic":"Micronesia","pol":"Polynesia"},"GROUPS":{"nca":"North and Central America","car":"the Caribbean","sam":"South America","neu":"Northern Europe","weu":"Western Europe","seu":"Southern Europe","eeu":"Eastern Europe","naf":"North Africa","waf":"West Africa","maf":"Central Africa","eaf":"East Africa","saf":"Southern Africa","was":"Southwest Asia","csa":"Central and South Asia","eas":"East Asia","sea":"Southeast Asia","oce":"Oceania"},"DIV":{"nen":"New England","mat":"Middle Atlantic","enc":"East North Central","wnc":"West North Central","sat":"South Atlantic","esc":"East South Central","wsc":"West South Central","mtn":"Mountain","pac":"Pacific"}};
  /* =====================================================================================================================
     THE MODEL: MathLadder.geog (pure data and functions; no DOM; works in node)
     ===================================================================================================================== */
  var M = Math;
  function fold(s) { s = String(s); try { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { return s; } }
  function uniq(a) { var o = [], seen = {}; a.forEach(function (x) { var k = String(x).toLowerCase(); if (x && !seen[k]) { seen[k] = 1; o.push(x); } }); return o; }
  // every spelling a learner might type: the name, its other names, without accents, St./Saint, and/&, no punctuation
  function variants(list) {
    var out = [];
    list.forEach(function (n) {
      if (!n) return;
      [n, fold(n)].forEach(function (x) {
        out.push(x);
        if (/\bSaint\b/.test(x)) out.push(x.replace(/\bSaint\b/g, 'St.'), x.replace(/\bSaint\b/g, 'St'));
        if (/\bSt\.\s/.test(x)) out.push(x.replace(/\bSt\.\s/g, 'Saint '), x.replace(/\bSt\.\s/g, 'St '));
        if (/ and /.test(x)) out.push(x.replace(/ and /g, ' & '));
        if (/[.,'’ʻ-]/.test(x)) out.push(x.replace(/[.,'’ʻ]/g, '').replace(/-/g, ' ').replace(/\s+/g, ' ').trim());
      });
    });
    return uniq(out);
  }
  var CONT = { AF: 'Africa', AN: 'Antarctica', AS: 'Asia', EU: 'Europe', NA: 'North America', OC: 'Oceania', SA: 'South America' };
  var CONT7 = ['Africa', 'Antarctica', 'Asia', 'Australia', 'Europe', 'North America', 'South America'];
  var REG = { ne: 'Northeast', mw: 'Midwest', s: 'South', w: 'West' };
  var C = DATA.C, O = DATA.O, S = DATA.S, byId = {}, oById = {}, sById = {};
  C.forEach(function (c) { byId[c.id] = c; c.un = c.f && c.f.indexOf('O') >= 0 ? 'observer' : 'member'; });
  O.forEach(function (o) { oById[o.id] = o; });
  S.forEach(function (s) { sById[s.id] = s; });
  function has(c, f) { return !!(c && c.f && c.f.indexOf(f) >= 0); }

  // ---- U.S. time zones: each state's main zone (standard time, hours from UTC) and the states split between two zones
  var US_TZ = { E: -5, C: -6, M: -7, P: -8, AK: -9, H: -10 };
  var US_TZ_NAME = { E: 'Eastern', C: 'Central', M: 'Mountain', P: 'Pacific', AK: 'Alaska', H: 'Hawaii-Aleutian' };
  var STATE_TZ = { CT: 'E', DE: 'E', DC: 'E', FL: 'E', GA: 'E', IN: 'E', KY: 'E', ME: 'E', MD: 'E', MA: 'E', MI: 'E', NH: 'E', NJ: 'E', NY: 'E', NC: 'E', OH: 'E', PA: 'E', RI: 'E', SC: 'E', VT: 'E', VA: 'E', WV: 'E',
    AL: 'C', AR: 'C', IL: 'C', IA: 'C', KS: 'C', LA: 'C', MN: 'C', MS: 'C', MO: 'C', NE: 'C', ND: 'C', OK: 'C', SD: 'C', TN: 'C', TX: 'C', WI: 'C',
    AZ: 'M', CO: 'M', ID: 'M', MT: 'M', NM: 'M', UT: 'M', WY: 'M', CA: 'P', NV: 'P', OR: 'P', WA: 'P', AK: 'AK', HI: 'H' };
  var STATE_TZ_SPLIT = { FL: 'C', IN: 'C', KY: 'C', MI: 'C', TN: 'E', KS: 'M', NE: 'M', ND: 'M', SD: 'M', TX: 'M', ID: 'P', OR: 'M', AK: 'H' };

  // ---- climates: typical (made-up but realistic) monthly normals, Northern Hemisphere, °C and mm; each passes MathLadder.geog.koppen
  var CLIMATES = {
    Af: { n: 'tropical rainforest', g: 'A', t: [26.5, 26.7, 27, 27.2, 27, 26.6, 26.3, 26.5, 26.7, 26.8, 26.7, 26.5], p: [250, 230, 260, 270, 240, 190, 170, 180, 190, 230, 260, 270] },
    Am: { n: 'tropical monsoon', g: 'A', t: [25, 26, 28, 30, 30, 28, 27, 27, 27, 27, 26, 25], p: [15, 15, 20, 40, 200, 500, 600, 450, 300, 150, 40, 15] },
    Aw: { n: 'tropical savanna (wet and dry)', g: 'A', t: [26, 28, 30, 31, 30, 28, 27, 27, 27, 27, 27, 26], p: [5, 10, 25, 60, 120, 150, 180, 200, 170, 90, 20, 5] },
    BWh: { n: 'hot desert', g: 'B', t: [14, 16, 20, 25, 30, 33, 34, 33, 31, 26, 20, 15], p: [5, 5, 3, 2, 1, 0, 0, 1, 1, 2, 4, 6] },
    BWk: { n: 'cold desert', g: 'B', t: [-8, -4, 4, 11, 17, 22, 25, 23, 17, 9, 1, -6], p: [4, 4, 6, 8, 12, 15, 18, 18, 12, 8, 5, 4] },
    BSk: { n: 'steppe (semiarid)', g: 'B', t: [-5, -2, 4, 10, 15, 20, 24, 23, 17, 10, 3, -3], p: [10, 12, 20, 30, 45, 45, 35, 30, 25, 20, 12, 10] },
    Csa: { n: 'Mediterranean', g: 'C', t: [10, 11, 13, 15, 19, 23, 26, 26, 23, 19, 14, 11], p: [100, 90, 70, 40, 20, 5, 1, 2, 10, 50, 90, 110] },
    Cfa: { n: 'humid subtropical', g: 'C', t: [5, 7, 12, 17, 22, 26, 28, 27, 24, 18, 12, 7], p: [100, 100, 120, 110, 110, 110, 120, 110, 100, 80, 90, 100] },
    Cfb: { n: 'marine west coast', g: 'C', t: [5, 6, 8, 10, 13, 16, 18, 18, 15, 12, 8, 6], p: [80, 60, 60, 50, 55, 55, 50, 60, 65, 85, 90, 90] },
    Dfa: { n: 'humid continental (hot summer)', g: 'D', t: [-6, -4, 2, 10, 16, 22, 24, 23, 18, 11, 4, -3], p: [40, 40, 60, 80, 100, 100, 100, 90, 80, 70, 60, 50] },
    Dfb: { n: 'humid continental (warm summer)', g: 'D', t: [-10, -8, -2, 6, 13, 17, 20, 18, 13, 6, -1, -7], p: [35, 30, 35, 45, 60, 75, 80, 75, 60, 50, 45, 40] },
    Dfc: { n: 'subarctic', g: 'D', t: [-25, -22, -14, -3, 7, 14, 17, 14, 7, -3, -15, -22], p: [15, 13, 15, 20, 35, 55, 65, 55, 40, 30, 20, 17] },
    ET: { n: 'tundra', g: 'E', t: [-28, -28, -25, -16, -5, 3, 7, 6, 1, -9, -20, -25], p: [8, 8, 8, 10, 12, 20, 30, 30, 20, 15, 10, 8] },
    EF: { n: 'ice cap', g: 'E', t: [-40, -42, -40, -32, -22, -14, -11, -14, -22, -32, -38, -40], p: [3, 3, 3, 3, 3, 4, 5, 5, 4, 3, 3, 3] }
  };
  var CLIMATE_GROUPS = { A: 'tropical', B: 'dry', C: 'temperate', D: 'continental', E: 'polar' };
  function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  // Köppen-Geiger main types (the 0 °C rule between C and D); t and p are 12 monthly values starting in January
  function koppen(t, p, hemi) {
    var south = hemi === 'S', P = sum(p), T = sum(t) / 12, tmax = M.max.apply(M, t), tmin = M.min.apply(M, t);
    var summer = south ? [9, 10, 11, 0, 1, 2] : [3, 4, 5, 6, 7, 8], winter = south ? [3, 4, 5, 6, 7, 8] : [9, 10, 11, 0, 1, 2];
    var ps = sum(summer.map(function (i) { return p[i]; })), pw = P - ps;
    if (tmax < 10) return tmax < 0 ? 'EF' : 'ET';
    var th = 20 * T + (ps >= 0.7 * P ? 280 : pw >= 0.7 * P ? 0 : 140);
    if (P < th) return (P < th / 2 ? 'BW' : 'BS') + (T >= 18 ? 'h' : 'k');
    if (tmin >= 18) { var pd = M.min.apply(M, p); return pd >= 60 ? 'Af' : pd >= 100 - P / 25 ? 'Am' : 'Aw'; }
    var g = tmin > 0 ? 'C' : 'D';
    var psmin = M.min.apply(M, summer.map(function (i) { return p[i]; })), psmax = M.max.apply(M, summer.map(function (i) { return p[i]; }));
    var pwmin = M.min.apply(M, winter.map(function (i) { return p[i]; })), pwmax = M.max.apply(M, winter.map(function (i) { return p[i]; }));
    var s = psmin < 40 && psmin < pwmax / 3 ? 's' : pwmin < psmax / 10 ? 'w' : 'f';
    var warm = t.filter(function (x) { return x >= 10; }).length;
    var third = tmax >= 22 ? 'a' : warm >= 4 ? 'b' : (g === 'D' && tmin < -38) ? 'd' : 'c';
    return g + s + third;
  }
  function shiftHemi(arr) { return arr.slice(6).concat(arr.slice(0, 6)); }
  function climate(key, hemi) { var c = CLIMATES[key]; if (!c) return null; return { key: key, n: c.n, g: c.g, t: hemi === 'S' ? shiftHemi(c.t) : c.t.slice(), p: hemi === 'S' ? shiftHemi(c.p) : c.p.slice(), hemi: hemi === 'S' ? 'S' : 'N' }; }

  // ---- biomes (simplified, after Whittaker 1975): mean annual temperature (°C) and annual precipitation (cm)
  var BIOMES = {
    rainforest: { n: 'tropical rainforest', climate: 'hot and wet all year', plants: 'tall broadleaf evergreen trees in layers, vines', animals: 'monkeys, parrots, frogs, insects' },
    seasonal: { n: 'tropical seasonal forest', climate: 'hot, with a long wet season and a short dry season', plants: 'trees that drop leaves in the dry season', animals: 'tigers, elephants, deer, birds' },
    savanna: { n: 'savanna', climate: 'hot, with a wet season and a long dry season', plants: 'grasses with scattered trees', animals: 'zebras, giraffes, lions, elephants' },
    desert: { n: 'desert', climate: 'very dry; hot or cold', plants: 'cactuses and small shrubs with deep or wide roots', animals: 'lizards, snakes, camels, burrowing rodents' },
    grassland: { n: 'temperate grassland', climate: 'hot summers, cold winters, moderate rain', plants: 'tall or short grasses, few trees', animals: 'bison, prairie dogs, hawks' },
    shrubland: { n: 'Mediterranean shrubland', climate: 'hot, dry summers and mild, rainy winters', plants: 'tough, small-leaved shrubs and oaks', animals: 'deer, rabbits, quail, lizards' },
    deciduous: { n: 'temperate deciduous forest', climate: 'four seasons, rain all year', plants: 'broadleaf trees that drop their leaves in fall', animals: 'deer, squirrels, bears, owls' },
    temprain: { n: 'temperate rainforest', climate: 'mild and very rainy', plants: 'huge conifers, mosses and ferns', animals: 'elk, salmon, banana slugs' },
    taiga: { n: 'taiga (boreal forest)', climate: 'long, very cold winters and short summers', plants: 'conifers: spruce, fir, pine', animals: 'moose, wolves, lynx, snowshoe hares' },
    tundra: { n: 'tundra', climate: 'very cold, with a short cool summer; frozen ground (permafrost)', plants: 'mosses, lichens, low shrubs, no trees', animals: 'caribou, arctic foxes, snowy owls' },
    ice: { n: 'ice sheet', climate: 'below freezing all year', plants: 'almost none', animals: 'penguins and seals along the coasts' }
  };
  function biomeOf(T, P) {
    if (T < -15) return 'ice';
    if (T < -5) return 'tundra';
    if (T < 3) return P < 15 ? 'tundra' : 'taiga';
    if (T < 20) return P < 25 ? 'desert' : P < 50 ? 'grassland' : P < 100 ? 'grassland' : P < 220 ? 'deciduous' : 'temprain';
    return P < 25 ? 'desert' : P < 150 ? 'savanna' : P < 250 ? 'seasonal' : 'rainforest';
  }

  // ---- population pyramids: 21 five-year age groups (0-4 ... 95-99, 100+), percent of the whole population
  var AGES = []; for (var a5 = 0; a5 < 100; a5 += 5) AGES.push(a5 + '–' + (a5 + 4)); AGES.push('100+');
  var MORT = { high: [0.32, 0.016, 0.00008, 0.085], mid: [0.08, 0.004, 0.00004, 0.088], low: [0.006, 0.0004, 0.00002, 0.095] };
  function survival(age, level, female) {
    var m = MORT[level] || MORT.mid, k = female ? 0.85 : 1;
    return M.exp(-k * (m[0] * (1 - M.exp(-age / 1.5)) + m[1] * age + (m[2] / m[3]) * (M.exp(m[3] * age) - 1)));
  }
  function lifeExpectancy(level, female) { var s = 0; for (var a = 0; a < 120; a += 0.5) s += 0.5 * survival(a + 0.25, level, female); return s; }
  // o: { growth: births grow by this fraction a year (0.03 = 3%), mort: 'high'|'mid'|'low', boom: [first group, last group, factor],
  //      migrants: [first group, last group, extra share], since: births changed at this rate only over the last `since` years }  ->  { m: [], f: [], ages }
  function pyramid(o) {
    o = o || {}; var g = o.growth === undefined ? 0.02 : o.growth, mort = o.mort || 'mid', m = [], f = [], tot = 0;
    for (var i = 0; i < 21; i++) {
      var mid = i * 5 + 2.5, births = M.pow(1 + g, -(o.since ? M.min(mid, o.since) : mid)), boom = o.boom && i >= o.boom[0] && i <= o.boom[1] ? o.boom[2] : 1;
      var mig = o.migrants && i >= o.migrants[0] && i <= o.migrants[1] ? 1 + o.migrants[2] : 1;
      var vm = births * boom * mig * survival(mid, mort, false) * 1.05, vf = births * boom * mig * survival(mid, mort, true);
      if (i === 20) { vm *= 0.6; vf *= 0.6; }
      m.push(vm); f.push(vf); tot += vm + vf;
    }
    function pct(v) { return M.round(v / tot * 1000) / 10; }
    return { m: m.map(pct), f: f.map(pct), ages: AGES.slice() };
  }
  var PYRAMIDS = { expanding: { growth: 0.03, mort: 'high' }, young: { growth: 0.025, mort: 'mid' }, stable: { growth: 0.0, mort: 'low' }, contracting: { growth: -0.02, mort: 'low', since: 45 },
    stage1: { growth: 0.004, mort: 'high' }, stage2: { growth: 0.03, mort: 'mid' }, stage3: { growth: 0.012, mort: 'mid' }, stage4: { growth: 0.0, mort: 'low' }, stage5: { growth: -0.02, mort: 'low', since: 45 } };
  function dependency(p) { // percent dependency ratio from a pyramid: (0-14 and 65+) / (15-64) * 100
    var young = 0, old = 0, work = 0;
    for (var i = 0; i < 21; i++) { var v = p.m[i] + p.f[i]; if (i < 3) young += v; else if (i >= 13) old += v; else work += v; }
    return { young: young, old: old, work: work, ratio: (young + old) / work * 100 };
  }

  // ---- the demographic transition model: crude birth and death rates (per 1,000) over a model time line 0-100
  var DTM_STAGES = [
    { n: 1, name: 'High stationary', from: 0, to: 20, desc: 'High birth and death rates; the population grows slowly or not at all.' },
    { n: 2, name: 'Early expanding', from: 20, to: 45, desc: 'Death rates fall with better food, water and medicine; birth rates stay high; the population grows fast.' },
    { n: 3, name: 'Late expanding', from: 45, to: 70, desc: 'Birth rates fall as families choose to have fewer children; growth slows.' },
    { n: 4, name: 'Low stationary', from: 70, to: 90, desc: 'Low birth and death rates; the population grows slowly or holds steady.' },
    { n: 5, name: 'Declining', from: 90, to: 100, desc: 'Some demographers add a fifth stage: birth rates fall below death rates and the population shrinks.' }];
  function smooth(x, a, b) { if (x <= a) return 0; if (x >= b) return 1; var u = (x - a) / (b - a); return u * u * (3 - 2 * u); }
  function dtm(x) {
    var cdr = 37 - 25 * smooth(x, 20, 50) - 3 * smooth(x, 55, 75) + 3 * smooth(x, 88, 100);
    var cbr = 40 - 27 * smooth(x, 42, 72) - 4 * smooth(x, 86, 98);
    if (x < 20) cdr += 2 * M.sin(x * 1.3);
    return { cbr: M.round(cbr * 10) / 10, cdr: M.round(cdr * 10) / 10, rni: M.round((cbr - cdr)) / 10 };
  }
  function dtmStage(cbr, cdr) { // the stage that best fits a country's crude birth and death rates
    if (cbr < cdr - 0.5) return 5;
    if (cdr >= 25 && cbr - cdr < 10) return 1;
    if (cbr >= 30) return cdr > 18 ? 2 : (cbr - cdr >= 20 ? 2 : 3);
    if (cbr >= 18) return 3;
    return 4;
  }

  // ---- diagrams for gg-models: zones from the center out (or parts), with short descriptions
  var MODELS = {
    concentric: { n: 'Concentric zone model (Burgess, 1925)', zones: ['Central business district', 'Zone in transition', 'Working-class homes', 'Middle-class homes', 'Commuter zone'] },
    sector: { n: 'Sector model (Hoyt, 1939)', zones: ['Central business district', 'Industry and transportation', 'Low-income homes', 'Middle-income homes', 'High-income homes'] },
    nuclei: { n: 'Multiple nuclei model (Harris and Ullman, 1945)', zones: ['Central business district', 'Wholesale and light industry', 'Low-income homes', 'Middle-income homes', 'High-income homes', 'Heavy industry', 'Outlying business district', 'Suburb', 'Industrial suburb'] },
    latin: { n: 'Latin American city model (Griffin and Ford, 1980)', zones: ['Central business district and market', 'Spine and elite residential sector', 'Zone of maturity', 'Zone of in situ accretion', 'Zone of peripheral squatter settlements', 'Industry', 'Mall'] },
    vonthunen: { n: 'Von Thünen model (1826)', zones: ['Market town', 'Market gardening and dairy', 'Forest (firewood and lumber)', 'Grains and field crops', 'Ranching and grazing'] },
    sea: { n: 'Zones of the sea (UN Convention on the Law of the Sea)', zones: ['Land', 'Territorial sea: 12 nautical miles', 'Contiguous zone: 24 nautical miles', 'Exclusive economic zone: 200 nautical miles', 'High seas'] },
    centralplace: { n: 'Central place theory (Christaller, 1933)', zones: ['City (high-order goods)', 'Town', 'Village', 'Hamlet (low-order goods)'] },
    weber: { n: 'Least cost theory (Weber, 1909)', zones: ['Raw material 1', 'Raw material 2', 'Market', 'Least-cost location'] },
    ranksize: { n: 'The rank-size rule', zones: [] },
    rostow: { n: 'Stages of economic growth (Rostow, 1960)', zones: ['Traditional society', 'Preconditions for take-off', 'Take-off', 'Drive to maturity', 'High mass consumption'] },
    worldsystems: { n: 'World-systems theory (Wallerstein)', zones: ['Core', 'Semi-periphery', 'Periphery'] },
    survey: { n: 'Land survey systems', zones: ['Metes and bounds', 'Township and range', 'Long lots'] },
    districts: { n: 'Drawing districts', zones: ['Packing', 'Cracking'] }
  };

  // ---- Maps and Places: a picture town on a grid, a bedroom, symbols, things seen from the side and from above, landforms
  var SYMBOLS = { house: 'House', school: 'School', park: 'Park', tree: 'Trees', pond: 'Pond', lake: 'Lake', river: 'River', road: 'Road', rail: 'Railroad',
    bridge: 'Bridge', store: 'Store', library: 'Library', hospital: 'Hospital', fire: 'Fire station', post: 'Post office', farm: 'Farm', playground: 'Playground',
    busstop: 'Bus stop', mountain: 'Mountain', tent: 'Campground', picnic: 'Picnic area', police: 'Police station', field: 'Ball field', town: 'Town hall' };
  // towns: cols x rows cells (columns lettered A..., rows numbered 1... from the top); place kinds from SYMBOLS; water and park
  // cells are listed as areas. Roads run along every cell edge (one block = one cell).
  var TOWNS = {
    maple: { cols: 6, rows: 6, places: [['house', 0, 0], ['house', 1, 0], ['school', 3, 0], ['park', 5, 0], ['store', 0, 2], ['library', 2, 2], ['playground', 4, 2],
      ['pond', 5, 3], ['hospital', 1, 4], ['fire', 3, 4], ['post', 0, 5], ['farm', 5, 5], ['house', 2, 5], ['busstop', 4, 4], ['tree', 4, 0], ['town', 2, 1]] },
    river: { cols: 6, rows: 6, river: [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5]], bridges: [[3, 2], [3, 5]], places: [['house', 0, 0], ['school', 1, 1], ['park', 5, 0], ['store', 4, 1],
      ['library', 0, 3], ['hospital', 5, 3], ['fire', 1, 4], ['post', 4, 4], ['farm', 0, 5], ['playground', 5, 5], ['house', 2, 2], ['police', 4, 3], ['tree', 2, 5]] },
    hill: { cols: 7, rows: 5, places: [['mountain', 6, 0], ['tent', 5, 1], ['lake', 0, 0], ['picnic', 1, 1], ['house', 3, 0], ['school', 2, 3], ['store', 4, 2], ['farm', 6, 4],
      ['field', 0, 4], ['library', 4, 4], ['post', 3, 2], ['tree', 6, 2], ['busstop', 1, 3]] }
  };
  var ROOM = { cols: 5, rows: 4, things: [['bed', 0, 0, 2, 1], ['window', 2, -1, 1, 0], ['desk', 4, 0, 1, 1], ['chair', 3, 1, 1, 1], ['rug', 2, 1, 1, 2], ['toybox', 0, 3, 1, 1], ['shelf', 4, 2, 1, 2], ['door', 2, 4, 1, 0], ['lamp', 0, 2, 1, 1], ['plant', 3, 3, 1, 1]] };
  var ROOM_NAMES = { bed: 'bed', window: 'window', desk: 'desk', chair: 'chair', rug: 'rug', toybox: 'toy box', shelf: 'bookshelf', door: 'door', lamp: 'lamp', plant: 'plant' };
  var THINGS = { table: 'table', chair: 'chair', bed: 'bed', cup: 'cup', tree: 'tree', house: 'house', car: 'car', lamp: 'lamp', plate: 'plate', bucket: 'bucket', ball: 'ball', bike: 'bike' };
  var LANDFORMS = {
    mountain: { n: 'mountain', k: 'land', d: 'very high land with steep sides and a peak' },
    hill: { n: 'hill', k: 'land', d: 'land that is higher than the land around it, but lower and rounder than a mountain' },
    valley: { n: 'valley', k: 'land', d: 'low land between hills or mountains' },
    plain: { n: 'plain', k: 'land', d: 'a wide area of flat, low land' },
    plateau: { n: 'plateau', k: 'land', d: 'flat land that is high above the land around it, with steep sides' },
    canyon: { n: 'canyon', k: 'land', d: 'a deep, narrow valley with steep sides, often cut by a river' },
    volcano: { n: 'volcano', k: 'land', d: 'a mountain built up by melted rock from inside the Earth' },
    island: { n: 'island', k: 'land', d: 'land with water all around it', pair: 'lake' },
    peninsula: { n: 'peninsula', k: 'land', d: 'land with water on three sides', pair: 'bay' },
    isthmus: { n: 'isthmus', k: 'land', d: 'a narrow strip of land that joins two larger pieces of land', pair: 'strait' },
    cape: { n: 'cape', k: 'land', d: 'a point of land that sticks out into the water' },
    coast: { n: 'coast', k: 'land', d: 'the land along the sea' },
    desert: { n: 'desert', k: 'land', d: 'a very dry place with little rain' },
    forest: { n: 'forest', k: 'land', d: 'a large area covered with trees' },
    ocean: { n: 'ocean', k: 'water', d: 'a huge body of salt water' },
    lake: { n: 'lake', k: 'water', d: 'a body of water with land all around it', pair: 'island' },
    river: { n: 'river', k: 'water', d: 'water that flows across the land in a channel' },
    bay: { n: 'bay', k: 'water', d: 'part of a sea or lake that curves into the land', pair: 'peninsula' },
    gulf: { n: 'gulf', k: 'water', d: 'a large bay' },
    strait: { n: 'strait', k: 'water', d: 'a narrow strip of water that joins two larger bodies of water', pair: 'isthmus' },
    source: { n: 'source', k: 'water', d: 'the place where a river begins' },
    mouth: { n: 'mouth', k: 'water', d: 'the place where a river flows into a lake, sea or ocean' },
    tributary: { n: 'tributary', k: 'water', d: 'a smaller river that flows into a larger river' },
    delta: { n: 'delta', k: 'land', d: 'flat land built from mud and sand at a river\'s mouth' },
    waterfall: { n: 'waterfall', k: 'water', d: 'a place where a river drops over a steep edge' },
    glacier: { n: 'glacier', k: 'water', d: 'a huge, slow-moving river of ice' }
  };
  var OCEANS = [{ id: 'pacific', n: 'Pacific Ocean', lon: -150, lat: 0 }, { id: 'atlantic', n: 'Atlantic Ocean', lon: -35, lat: 15 }, { id: 'indian', n: 'Indian Ocean', lon: 80, lat: -20 },
    { id: 'arctic', n: 'Arctic Ocean', lon: 0, lat: 84 }, { id: 'southern', n: 'Southern Ocean', lon: 60, lat: -62 }];
  var CONTINENT_LABELS = [{ id: 'NA', n: 'North America', lon: -100, lat: 45 }, { id: 'SA', n: 'South America', lon: -60, lat: -15 }, { id: 'EU', n: 'Europe', lon: 20, lat: 52 },
    { id: 'AF', n: 'Africa', lon: 20, lat: 5 }, { id: 'AS', n: 'Asia', lon: 90, lat: 45 }, { id: 'OC', n: 'Australia', lon: 134, lat: -25 }, { id: 'AN', n: 'Antarctica', lon: 0, lat: -82 }];
  var SEAS = [{ n: 'Mediterranean Sea', lon: 18, lat: 35 }, { n: 'Caribbean Sea', lon: -75, lat: 15 }, { n: 'Gulf of Mexico', lon: -90, lat: 25 }, { n: 'Arabian Sea', lon: 64, lat: 15 },
    { n: 'Bay of Bengal', lon: 89, lat: 15 }, { n: 'South China Sea', lon: 114, lat: 13 }, { n: 'North Sea', lon: 3, lat: 56 }, { n: 'Black Sea', lon: 34, lat: 43.2 }, { n: 'Red Sea', lon: 38.5, lat: 20 },
    { n: 'Bering Sea', lon: -178, lat: 58 }, { n: 'Caspian Sea', lon: 51, lat: 42 }, { n: 'Hudson Bay', lon: -85, lat: 60 }, { n: 'Persian Gulf', lon: 51.5, lat: 27 }, { n: 'Sea of Japan', lon: 135, lat: 40 },
    { n: 'Baltic Sea', lon: 19, lat: 57 }, { n: 'Coral Sea', lon: 155, lat: -18 }, { n: 'Tasman Sea', lon: 162, lat: -40 }];
  var LINES = { equator: { n: 'Equator', lat: 0 }, cancer: { n: 'Tropic of Cancer', lat: 23.44 }, capricorn: { n: 'Tropic of Capricorn', lat: -23.44 },
    arctic: { n: 'Arctic Circle', lat: 66.56 }, antarctic: { n: 'Antarctic Circle', lat: -66.56 }, prime: { n: 'Prime meridian', lon: 0 }, dateline: { n: '180° meridian', lon: 180 } };

  // ---- small helpers for problems
  function rad(d) { return d * M.PI / 180; }
  function dist(a, b) { // great-circle distance in km between [lon, lat] points (mean Earth radius 6,371 km)
    var p1 = rad(a[1]), p2 = rad(b[1]), dl = rad(b[0] - a[0]), dp = p2 - p1;
    var h = M.sin(dp / 2) * M.sin(dp / 2) + M.cos(p1) * M.cos(p2) * M.sin(dl / 2) * M.sin(dl / 2);
    return 2 * 6371 * M.asin(M.min(1, M.sqrt(h)));
  }
  function fmtDeg(v, pos, neg, dp) { var a = M.abs(v), s = dp ? a.toFixed(dp) : String(M.round(a)); return s + '° ' + (v > 0 ? pos : v < 0 ? neg : ''); }
  function fmtLat(v, dp) { return v === 0 ? '0°' : fmtDeg(v, 'N', 'S', dp).trim(); }
  function fmtLon(v, dp) { return v === 0 || M.abs(v) === 180 ? M.abs(v) + '°' : fmtDeg(v, 'E', 'W', dp).trim(); }
  function fmtUTC(h) { if (h === 0) return 'UTC'; var s = h < 0 ? '−' : '+', a = M.abs(h), hh = M.floor(a), mm = M.round((a - hh) * 60); return 'UTC' + s + hh + (mm ? ':' + (mm < 10 ? '0' : '') + mm : ''); }
  function fmtClock(mins, ampm) { // minutes after midnight (any integer) -> "3:05 p.m." (12-hour) or "15:05"
    mins = ((M.round(mins) % 1440) + 1440) % 1440; var h = M.floor(mins / 60), m = mins % 60, mm = (m < 10 ? '0' : '') + m;
    if (ampm === false) return (h < 10 ? '0' : '') + h + ':' + mm;
    if (h === 0 && m === 0) return '12:00 midnight'; if (h === 12 && m === 0) return '12:00 noon';
    return (h % 12 === 0 ? 12 : h % 12) + ':' + mm + (h < 12 ? ' a.m.' : ' p.m.');
  }

  var G = ML.geog = {
    DATA: DATA, C: C, O: O, S: S, R: DATA.R, PHYS: DATA.G, LAKES: DATA.L, CITIES: DATA.CITIES,
    CONT: CONT, CONT7: CONT7, SUB: DATA.SUB, GROUPS: DATA.GROUPS, DIV: DATA.DIV, REG: REG,
    US_TZ: US_TZ, US_TZ_NAME: US_TZ_NAME, STATE_TZ: STATE_TZ, STATE_TZ_SPLIT: STATE_TZ_SPLIT,
    CLIMATES: CLIMATES, CLIMATE_GROUPS: CLIMATE_GROUPS, koppen: koppen, climate: climate,
    BIOMES: BIOMES, biomeOf: biomeOf, AGES: AGES, pyramid: pyramid, PYRAMIDS: PYRAMIDS, dependency: dependency, lifeExpectancy: lifeExpectancy,
    DTM_STAGES: DTM_STAGES, dtm: dtm, dtmStage: dtmStage, MODELS: MODELS,
    SYMBOLS: SYMBOLS, TOWNS: TOWNS, ROOM: ROOM, ROOM_NAMES: ROOM_NAMES, THINGS: THINGS, LANDFORMS: LANDFORMS,
    OCEANS: OCEANS, CONTINENT_LABELS: CONTINENT_LABELS, SEAS: SEAS, LINES: LINES,
    dist: dist, fmtLat: fmtLat, fmtLon: fmtLon, fmtUTC: fmtUTC, fmtClock: fmtClock, fold: fold, variants: variants,
    // a UN country (member or observer) by id, or null
    country: function (id) { return byId[id] || null; },
    // any area on the world map: a country, a territory, a disputed area or Antarctica
    area: function (id) { return byId[id] || oById[id] || null; },
    state: function (id) { return sById[id] || null; },
    has: has,
    // countries matching a filter: { g: group, sub: subregion, cont: continent, landlocked: true, un: 'member' }; a function also works
    countries: function (f) {
      if (typeof f === 'function') return C.filter(f);
      f = f || {};
      return C.filter(function (c) {
        if (f.g && (Array.isArray(f.g) ? f.g.indexOf(c.g) < 0 : c.g !== f.g)) return false;
        if (f.sub && c.sub !== f.sub) return false; if (f.cont && c.cont !== f.cont) return false;
        if (f.landlocked !== undefined && has(c, 'L') !== !!f.landlocked) return false;
        if (f.un && c.un !== f.un) return false; return true;
      });
    },
    states: function (f) {
      f = f || {}; return S.filter(function (s) {
        if (!f.dc && s.id === 'DC') return false;
        if (f.reg && s.reg !== f.reg) return false; if (f.div && (Array.isArray(f.div) ? f.div.indexOf(s.div) < 0 : s.div !== f.div)) return false; return true;
      });
    },
    // the names a learner may type for a country or a state, and for its capital
    names: function (id) { var c = byId[id] || oById[id] || sById[id]; return c ? variants([c.n].concat(c.alt || [])) : []; },
    capNames: function (id) { var c = byId[id] || sById[id]; if (!c) return []; return variants([c.cap].concat(c.capAlt || [])); },
    // true when a capital has one clear answer to quiz on its own (Israel and Palestine are not quizzed; see each note)
    capQuiz: function (id) { var c = byId[id]; return !!c && !has(c, 'X'); },
    // firm neighbours that are UN countries (borders through a disputed area are left out); notNeighbors leaves out those too
    neighbors: function (id) { var c = byId[id] || sById[id]; return c ? c.nb.filter(function (x) { return byId[x] || sById[x]; }) : []; },
    unsureNeighbors: function (id) { var c = byId[id]; return c && c.nbd ? c.nbd.slice() : []; },
    contName: function (code) { return CONT[code] || code; },
    city: function (name) { for (var i = 0; i < DATA.CITIES.length; i++) if (DATA.CITIES[i].n === name) return DATA.CITIES[i]; return null; },
    river: function (id) { for (var i = 0; i < DATA.R.length; i++) if (DATA.R[i].id === id) return DATA.R[i]; return null; },
    phys: function (id) { for (var i = 0; i < DATA.G.length; i++) if (DATA.G[i].id === id) return DATA.G[i]; return null; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
/* =======================================================================================================================
   THE VISUALS (need a browser and MathLadder.viz; skipped in node, where only the helpers below, MathLadder.geog.vis, are set up)
   ======================================================================================================================= */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var DOM = !!(ML.viz && D);   // false in node: the helpers (MathLadder.geog.vis) are still exposed, the visuals are not registered
  var V = ML.viz, G = ML.geog, M = Math, NS = 'http://www.w3.org/2000/svg';
  var GV = G.vis = {};   // shared helpers for the gg- visuals (also used by a course's own visuals file, if any)

  // ---- where the kit was loaded from: data and the vendored d3-geo sit next to it
  var SRC = (D && D.currentScript && D.currentScript.src) || '';
  if (D && !/geog\/viz\/geog\.js/.test(SRC)) { var sc = D.querySelector('script[src*="geog/viz/geog.js"]'); SRC = sc ? sc.src : '/geog/viz/geog.js'; }
  var BASE = SRC.replace(/geog\/viz\/geog\.js.*$/, ''), VER = (SRC.match(/[?&]v=([^&]+)/) || [])[1] || '1';

  // ---- DOM and SVG helpers
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function s(tag, attrs, parent) { var e = D.createElementNS(NS, tag); if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function svgRoot(w, hh, cls) { var r = s('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'gg-svg' + (cls ? ' ' + cls : ''), role: 'img' }); r.setAttribute('preserveAspectRatio', 'xMidYMid meet'); return r; }
  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function text(parent, x, y, str, cls, attrs) { var t = s('text', Object.assign({ x: x, y: y, class: cls || 'gg-lab' }, attrs || {}), parent); t.textContent = str; return t; }
  function btn(parent, label, fn, cls) { var b = h('button', 'ml-btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; b.addEventListener('click', fn); parent.appendChild(b); return b; }
  function okMark(ok) { return ok ? '<span class="ggv-ok" aria-hidden="true">✓</span>' : '<span class="ggv-bad" aria-hidden="true">✗</span>'; }
  function shuffle(a, seed) { a = a.slice(); var x = seed || 7; for (var i = a.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; var j = M.floor(x / 233280 * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // a visual's frame: task line, read-me note, body, controls, live output, caption
  function frame(el, o, name) {
    el.classList.add('ggv', 'ggv-' + name);
    var F = { o: o, quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false, el: el };
    if (o.big) el.classList.add('ggv-big');
    if (o.readme) el.appendChild(h('p', 'ggv-readme', '<span class="ggv-readme-tag">Read to me</span> ' + o.readme));
    if (o.task) el.appendChild(h('p', 'ggv-task', o.task));
    F.body = h('div', 'ggv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ggv-ctl'); el.appendChild(F.ctl);
    F.out = h('p', 'ggv-out'); F.out.setAttribute('aria-live', 'polite'); F.out.hidden = true; el.appendChild(F.out);
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    F.say = function (html) { F.out.innerHTML = html || ''; F.out.hidden = !html; if (html && ML.typeset) try { ML.typeset(F.out); } catch (e) { } };
    F.alt = function (svg, str) { svg.setAttribute('aria-label', o.label || str); };
    return F;
  }

  // ---- loading: d3-geo (vendored, on demand) and the TopoJSON map data
  var d3p = null;
  function needD3() {
    if (W.d3 && W.d3.geoPath) return Promise.resolve(W.d3);
    if (d3p) return d3p;
    d3p = new Promise(function (res, rej) {
      var sc = D.createElement('script'); sc.src = BASE + 'geog/vendor/d3-geo.min.js?v=' + VER; sc.async = true;
      sc.onload = function () { W.d3 && W.d3.geoPath ? res(W.d3) : rej(new Error('d3-geo did not load')); }; sc.onerror = function () { rej(new Error('d3-geo did not load')); };
      D.head.appendChild(sc);
    });
    return d3p;
  }
  var dataP = {};
  function decode(T) {
    var sc = T.transform.scale, tr = T.transform.translate;
    var arcs = T.arcs.map(function (a) { var x = 0, y = 0; return a.map(function (p) { x += p[0]; y += p[1]; return [x * sc[0] + tr[0], y * sc[1] + tr[1]]; }); });
    function arc(i) { return i < 0 ? arcs[~i].slice().reverse() : arcs[i]; }
    function line(ix) { var out = []; ix.forEach(function (i, k) { var a = arc(i); out = out.concat(k ? a.slice(1) : a); }); return out; }
    function geom(g) {
      switch (g.type) {
        case 'Polygon': return { type: 'Polygon', coordinates: g.arcs.map(line) };
        case 'MultiPolygon': return { type: 'MultiPolygon', coordinates: g.arcs.map(function (p) { return p.map(line); }) };
        case 'LineString': return { type: 'LineString', coordinates: line(g.arcs) };
        case 'MultiLineString': return { type: 'MultiLineString', coordinates: g.arcs.map(line) };
        case 'Point': return { type: 'Point', coordinates: [g.coordinates[0] * sc[0] + tr[0], g.coordinates[1] * sc[1] + tr[1]] };
      }
      return null;
    }
    var out = { topo: T, arcs: arcs, objects: {} };
    Object.keys(T.objects).forEach(function (k) {
      out.objects[k] = T.objects[k].geometries.filter(function (g) { return g.type; }).map(function (g) { return { type: 'Feature', id: g.id, properties: g.properties || {}, geometry: geom(g) }; });
    });
    // borders shared by two features of an object (drawn once), and coastlines (used by one)
    out.mesh = function (k, shared) {
      var use = {};
      T.objects[k].geometries.forEach(function (g) {
        (function w(a) { if (typeof a === 'number') { var i = a < 0 ? ~a : a; (use[i] = use[i] || []).push(g.id); } else if (a) a.forEach(w); })(g.arcs);
      });
      var lines = [];
      Object.keys(use).forEach(function (i) { if ((use[i].length > 1) === shared) lines.push(arcs[+i]); });
      return { type: 'MultiLineString', coordinates: lines };
    };
    out.byId = function (k, id) { var a = out.objects[k] || []; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; };
    return out;
  }
  function loadData(name) {
    if (!dataP[name]) dataP[name] = fetch(BASE + 'geog/data/' + name + '.json?v=' + VER).then(function (r) { if (!r.ok) throw new Error('map data ' + name + ': ' + r.status); return r.json(); }).then(decode);
    return dataP[name];
  }
  function need(names) { return Promise.all([needD3()].concat(names.map(loadData))).then(function (r) { var o = { d3: r[0] }; names.forEach(function (n, i) { o[n] = r[i + 1]; }); return o; }); }

  // ---- projections (d3-geo, plus Robinson, Mollweide, Gall-Peters and Winkel tripel written here)
  var ROB = [[1, 0], [0.9986, 0.062], [0.9954, 0.124], [0.99, 0.186], [0.9822, 0.248], [0.973, 0.31], [0.96, 0.372], [0.9427, 0.434], [0.9216, 0.4958], [0.8962, 0.5571],
    [0.8679, 0.6176], [0.835, 0.6769], [0.7986, 0.7346], [0.7597, 0.7903], [0.7186, 0.8435], [0.6732, 0.8936], [0.6213, 0.9394], [0.5722, 0.9761], [0.5322, 1]];
  function robinsonRaw(l, p) { var a = M.min(90, M.abs(p) * 180 / M.PI) / 5, i = M.min(17, M.floor(a)), f = a - i, X = ROB[i][0] + (ROB[i + 1][0] - ROB[i][0]) * f, Y = ROB[i][1] + (ROB[i + 1][1] - ROB[i][1]) * f; return [0.8487 * X * l, 1.3523 * Y * (p < 0 ? -1 : 1)]; }
  function mollweideRaw(l, p) { var t = p, k = M.PI * M.sin(p); for (var i = 0; i < 30; i++) { var d = (t + M.sin(t) - k) / (1 + M.cos(t)); t -= d; if (M.abs(d) < 1e-9) break; } t /= 2; return [2 * M.SQRT2 / M.PI * l * M.cos(t), M.SQRT2 * M.sin(t)]; }
  function gallPetersRaw(l, p) { var c = M.cos(M.PI / 4); return [l * c, M.sin(p) / c]; }
  function sinci(x) { return x ? x / M.sin(x) : 1; }
  function winkelRaw(l, p) { var cy = M.cos(p), hx = l / 2, si = sinci(M.acos(M.max(-1, M.min(1, cy * M.cos(hx))))); var ax = 2 * cy * M.sin(hx) * si, ay = M.sin(p) * si; return [(ax + l * 2 / M.PI) / 2, (ay + p) / 2]; }
  var PROJ_NAMES = { equalearth: 'Equal Earth', mercator: 'Mercator', robinson: 'Robinson', mollweide: 'Mollweide', gallpeters: 'Gall-Peters', winkel: 'Winkel tripel', equirect: 'Equirectangular (plate carrée)', natural: 'Natural Earth', ortho: 'Orthographic (globe)', albersusa: 'Albers (U.S.)', local: 'Azimuthal equal-area' };
  function projection(d3, name, center) {
    switch (name) {
      case 'mercator': return d3.geoMercator();
      case 'robinson': return d3.geoProjection(robinsonRaw);
      case 'mollweide': return d3.geoProjection(mollweideRaw);
      case 'gallpeters': return d3.geoProjection(gallPetersRaw);
      case 'winkel': return d3.geoProjection(winkelRaw);
      case 'equirect': return d3.geoEquirectangular();
      case 'natural': return d3.geoNaturalEarth1();
      case 'ortho': return d3.geoOrthographic().clipAngle(90);
      case 'albersusa': return d3.geoAlbersUsa();
      case 'local': return d3.geoAzimuthalEqualArea().rotate([-(center ? center[0] : 0), -(center ? center[1] : 0)]);
      default: return d3.geoEqualEarth();
    }
  }
  // the outline of the whole map for fitting (Mercator is cut off near the poles)
  function outline(name) {
    if (name === 'mercator') return { type: 'MultiPoint', coordinates: [[-180, -66], [180, 80]] };
    return { type: 'Sphere' };
  }

  // ---- colors: the political map's colors (no two neighbours alike), continents, a sequential scale and categories
  var polyColor = null;
  function politicalColors() {
    if (polyColor) return polyColor;
    polyColor = {};
    var all = G.C.map(function (c) { return { id: c.id, nb: c.nb || [] }; }).concat(G.O.map(function (o) { return { id: o.id, nb: [] }; }))
      .concat(G.S.map(function (st) { return { id: 'us-' + st.id, nb: st.nb.map(function (x) { return 'us-' + x; }) }; }));
    all.sort(function (a, b) { return b.nb.length - a.nb.length; });
    all.forEach(function (c) { var used = {}; c.nb.forEach(function (n) { if (polyColor[n] != null) used[polyColor[n]] = 1; }); for (var k = 0; k < 6; k++) if (!used[k]) { polyColor[c.id] = k; break; } if (polyColor[c.id] == null) polyColor[c.id] = 0; });
    return polyColor;
  }
  var CONT_ORDER = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC', 'AN'];
  function contOf(id) { var c = G.country(id); if (c) return c.cont; var o = G.area(id); if (!o) return null; if (o.id === 'ATA') return 'AN'; var sov = o.of && G.country(o.of); var reg = { GRL: 'NA', PRI: 'NA', VIR: 'NA', GUM: 'OC', MNP: 'OC', ASM: 'OC', TWN: 'AS', XKX: 'EU', ESH: 'AF', SOL: 'AF', CYN: 'AS', KAS: 'AS', HKG: 'AS', MAC: 'AS', FLK: 'SA', NCL: 'OC', PYF: 'OC', ABW: 'NA', CUW: 'NA', SXM: 'NA', MAF: 'NA', BLM: 'NA', AIA: 'NA', BMU: 'NA', CYM: 'NA', VGB: 'NA', TCA: 'NA', MSR: 'NA', SPM: 'NA', FRO: 'EU', ALD: 'EU', JEY: 'EU', GGY: 'EU', IMN: 'EU', COK: 'OC', NIU: 'OC', NFK: 'OC', WLF: 'OC', PCN: 'OC', ATC: 'OC' }[o.id]; return reg || (sov ? sov.cont : null); }

  Object.assign(GV, { h: h, s: s, svgRoot: svgRoot, esc: esc, text: text, btn: btn, okMark: okMark, shuffle: shuffle, LETTERS: LETTERS, frame: frame,
    needD3: needD3, loadData: loadData, need: need, projection: projection, outline: outline, PROJ_NAMES: PROJ_NAMES, politicalColors: politicalColors, contOf: contOf, CONT_ORDER: CONT_ORDER, BASE: BASE });
  if (!DOM) return;   // node: no visuals
  /* ---------------------------------------------------------------------------------------------------- gg-map */
  // the areas of a map with what the learner may be told about them
  function areaInfo(id, kind) {
    if (kind === 'us') {
      var st = G.state(id); if (!st) return null;
      return { n: st.n, html: '<b>' + esc(st.n) + '</b> (' + st.id + ')' + (st.id === 'DC' ? '<br>The nation\'s capital, a federal district, not a state.' : '<br>Capital: ' + esc(st.cap) + '<br>Region: ' + G.REG[st.reg] + ' (' + G.DIV[st.div] + ')' + (st.date ? '<br>Joined: ' + st.date.slice(0, 4) + (st.ord <= 13 ? ' (one of the first 13 states)' : '') : '')) };
    }
    var c = G.country(id);
    if (c) return { n: c.n, html: '<b>' + esc(c.n) + '</b>' + (c.alt && c.alt.length ? ' <small>(also ' + esc(c.alt.filter(function (a) { return a.length > 3; }).slice(0, 2).join(', ') || c.alt[0]) + ')</small>' : '') + '<br>Capital: ' + esc(c.cap) + (c.capAlt && G.has(c, 'C') ? ' (see the note)' : '') + '<br>' + G.contName(c.cont) + ' · ' + esc(G.SUB[c.sub]) + (c.un === 'observer' ? '<br>A UN observer state' : '') + (c.note ? '<br><small>' + esc(c.note) + '</small>' : '') };
    var a = G.area(id); if (!a) return null;
    return { n: a.n, html: '<b>' + esc(a.n) + '</b>' + (a.note ? '<br><small>' + esc(a.note) + '</small>' : '') };
  }
  // the ids a region option stands for: a continent (AF), a teaching group (weu), a subregion (was), a U.S. region (ne) or division (nen), or a list
  function regionIds(kind, r) {
    if (!r) return null;
    if (Array.isArray(r)) return r;
    if (kind === 'us') { var st = G.S.filter(function (x) { return x.reg === r || x.div === r; }); return st.length ? st.map(function (x) { return x.id; }) : null; }
    var cs = G.C.filter(function (c) { return c.cont === r || c.g === r || c.sub === r; });
    return cs.length ? cs.map(function (c) { return c.id; }) : null;
  }
  // the main part of a feature (drops far-off islands and overseas parts) for fitting the view
  function mainPart(d3, f) {
    var g = f.geometry; if (!g || g.type !== 'MultiPolygon') return f;
    var info = G.area(f.id) || G.state(f.id), c0 = info ? [info.lx, info.ly] : d3.geoCentroid(f);
    var keep = g.coordinates.filter(function (p) { return d3.geoDistance(d3.geoCentroid({ type: 'Polygon', coordinates: p }), c0) < 0.42; });
    return { type: 'Feature', id: f.id, geometry: { type: 'MultiPolygon', coordinates: keep.length ? keep : g.coordinates } };
  }
  var FEATURE_KINDS = ['range', 'desert', 'plain', 'plateau', 'basin', 'area', 'peninsula', 'island', 'valley', 'wetland', 'isthmus'];

  V.register('gg-map', function (el, o) {
    var F = frame(el, o, 'map'), kind = o.map === 'us' ? 'us' : 'world';
    var box = h('div', 'ggm-box'); F.body.appendChild(box);
    box.appendChild(h('p', 'ggv-loading', 'Loading the map…'));
    var legend = h('div', 'ggm-legend'); F.body.appendChild(legend);
    var info = h('div', 'ggm-info'); info.hidden = true; F.body.appendChild(info);
    var mode = o.mode || 'show', zoom = 1, pan = [0, 0], selected = null, Dd = null, ctx = null;
    var wantFeat = o.features || o.rivers ? true : false;
    var findList = mode === 'find' ? (Array.isArray(o.find) ? o.find.slice() : o.find ? [o.find] : (regionIds(kind, o.region) || []).slice()) : [];
    if (mode === 'find' && o.shuffle !== false) findList = shuffle(findList, o.seed || 3);
    var fi = 0, tries = 0, score = 0;
    var names = kind === 'us' ? ['us'] : ['world'];
    if (wantFeat) names.push('features');
    need(names).then(function (r) {
      Dd = r;
      var d3 = r.d3, data = r[kind === 'us' ? 'us' : 'world'];
      var areas = kind === 'us' ? data.objects.states : data.objects.countries, disputed = kind === 'us' ? [] : data.objects.disputed;
      var focusIds = regionIds(kind, o.region || o.focus);
      if (o.only) { var only = regionIds(kind, o.only); areas = areas.filter(function (f) { return only.indexOf(f.id) >= 0; }); disputed = []; }
      ctx = { d3: d3, data: data, areas: areas, disputed: disputed, focusIds: focusIds };
      if (mode === 'find') startFind(); else draw();
      if (F.interactive && (mode === 'explore' || mode === 'find')) addZoom();
      var lastW = box.clientWidth; if ('ResizeObserver' in W) new ResizeObserver(function () { var cw = box.clientWidth; if (cw && M.abs(cw - lastW) > 20) { lastW = cw; draw(); } }).observe(F.body);
    }).catch(function (e) { box.innerHTML = '<p class="ml-viz-err">This map could not be drawn.</p>'; if (W.console) W.console.error(e); });

    function addZoom() {
      if (o.zoom === false) return;
      var z = h('div', 'ggm-zoomer');
      btn(z, '+', function () { zoom = M.min(12, zoom * 1.6); draw(); }).setAttribute('aria-label', 'Zoom in');
      btn(z, '−', function () { zoom = M.max(1, zoom / 1.6); if (zoom === 1) pan = [0, 0]; draw(); }).setAttribute('aria-label', 'Zoom out');
      btn(z, '⟲', function () { zoom = 1; pan = [0, 0]; draw(); }).setAttribute('aria-label', 'Reset the view');
      box.parentNode.insertBefore(z, box);
    }
    function startFind() {
      if (!findList.length) { draw(); return; }
      var id = findList[fi], a = areaInfo(id, kind);
      F.ctl.innerHTML = ''; tries = 0;
      var p = h('p', 'ggm-prompt', (o.prompt || 'Find') + ' <b>' + esc(o.findCap ? (G.country(id) || G.state(id) || {}).cap : (a ? a.n : id)) + '</b>' + (o.findCap ? ' (tap its country)' : '') + (findList.length > 1 ? ' <small>(' + (fi + 1) + ' of ' + findList.length + ')</small>' : ''));
      F.ctl.appendChild(p); F.say(''); selected = null; draw();
    }
    function onPick(id) {
      if (mode === 'explore') { selected = id; var a = areaInfo(id, kind); info.hidden = !a; info.innerHTML = a ? a.html : ''; draw(); return; }
      if (mode !== 'find' || fi >= findList.length) return;
      var want = findList[fi], a = areaInfo(id, kind), w = areaInfo(want, kind);
      if (id === want) {
        score += tries ? 0 : 1; selected = id;
        F.say(okMark(true) + ' Yes, that is ' + esc(w.n) + '.' + (o.findCap ? ' Its capital is ' + esc((G.country(want) || G.state(want)).cap) + '.' : ''));
        draw(); F.ctl.innerHTML = '';
        if (fi < findList.length - 1) btn(F.ctl, 'Next ▶', function () { fi++; startFind(); }, 'pri');
        else { F.ctl.appendChild(h('p', 'ggm-prompt', 'Done! ' + score + ' of ' + findList.length + ' on the first try.')); if (o.again !== false) btn(F.ctl, 'Play again', function () { fi = 0; score = 0; findList = shuffle(findList, (o.seed || 3) + score + 1); startFind(); }); }
      } else {
        tries++; selected = null;
        F.say(okMark(false) + ' That is ' + esc(a ? a.n : 'not it') + '.' + (tries >= 2 ? ' Look for the flashing outline.' : ' Try again.'));
        draw(tries >= 2 ? want : null);
      }
    }

    function draw(flash) {
      if (!ctx) return;
      var d3 = ctx.d3, w = M.max(240, box.clientWidth || el.clientWidth || 600), projName = o.proj || (kind === 'us' ? 'albersusa' : (ctx.focusIds && !o.wholeWorld ? 'local' : 'equalearth'));
      var focusF = null;
      if (ctx.focusIds && !o.wholeWorld) {
        focusF = { type: 'FeatureCollection', features: ctx.areas.filter(function (f) { return ctx.focusIds.indexOf(f.id) >= 0; }).map(function (f) { return mainPart(d3, f); }) };
        if (o.focusAlso) o.focusAlso.forEach(function (p) { focusF.features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: p } }); });
      }
      var proj = projection(d3, projName, focusF ? d3.geoCentroid(focusF) : null), pad = 8;
      if (o.rotate && proj.rotate) proj.rotate(o.rotate);
      var target = focusF || (kind === 'us' ? { type: 'FeatureCollection', features: ctx.areas } : outline(projName));
      proj.fitWidth(w - 2 * pad, target);
      var path = d3.geoPath(proj), b = path.bounds(target), hh = M.ceil(b[1][1] - b[0][1]) + 2 * pad;
      var maxH = o.height || M.round(w * (focusF ? 0.95 : 0.75));
      if (hh > maxH) { hh = maxH; proj.fitExtent([[pad, pad], [w - pad, hh - pad]], target); }
      else proj.fitExtent([[pad, pad], [w - pad, hh - pad]], target);
      if (projName === 'mercator' || projName === 'equirect' || projName === 'gallpeters') proj.clipExtent([[0, 0], [w, hh]]);
      if (zoom !== 1) { var t0 = proj.translate(), sc0 = proj.scale(); proj.scale(sc0 * zoom).translate([w / 2 + (t0[0] - w / 2) * zoom + pan[0], hh / 2 + (t0[1] - hh / 2) * zoom + pan[1]]); proj.clipExtent && projName !== 'albersusa' && proj.clipExtent([[0, 0], [w, hh]]); }
      path = d3.geoPath(proj);
      box.innerHTML = '';
      var svg = svgRoot(w, hh, 'ggm-svg'); box.appendChild(svg);
      var defs = s('defs', null, svg), hid = V.uid('gghatch');
      var pat = s('pattern', { id: hid, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs); s('rect', { width: 6, height: 6, class: 'gg-dispbg' }, pat); s('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'gg-displine' }, pat);
      // water and graticule
      if (projName === 'albersusa') s('rect', { x: 0, y: 0, width: w, height: hh, class: 'gg-water gg-water-us' }, svg);
      else if (focusF || zoom !== 1 || projName === 'mercator') s('rect', { x: 0, y: 0, width: w, height: hh, class: 'gg-water' }, svg);   // Mercator has no sphere outline: its water fills the clipped frame
      else s('path', { d: path(outline(projName)), class: 'gg-water' }, svg);
      if (o.graticule && projName !== 'albersusa') s('path', { d: path(d3.geoGraticule().step([o.graticule === true ? 30 : o.graticule, o.graticule === true ? 30 : o.graticule])()), class: 'gg-grat' }, svg);
      // areas
      var colorMode = o.color || (o.data || o.cats ? 'data' : 'political'), pc = politicalColors(), hi = o.highlight || [], hi2 = o.highlight2 || [];
      if (typeof hi === 'string') hi = regionIds(kind, hi) || [hi];
      var gA = s('g', { class: 'gg-areas' }, svg), dots = [], q = o.breaks;
      var markIds = o.mark ? Object.keys(o.mark) : [];
      ctx.areas.forEach(function (f) {
        var id = f.id, cls = 'gg-a', d = path(f); if (!d) return;
        if (colorMode === 'political') cls += ' gg-c' + (pc[(kind === 'us' ? 'us-' : '') + id] || 0);
        else if (colorMode === 'continents') { var ct = contOf(id); cls += ' gg-cont-' + (ct || 'x'); }
        else if (colorMode === 'data') {
          var v = o.data ? o.data[id] : null, cat = o.cats ? o.cats[id] : null;
          if (o.cats && cat != null) cls += ' gg-k' + cat; else if (v != null && q) { var k = 0; while (k < q.length && v >= q[k]) k++; cls += ' gg-q' + k; } else cls += ' gg-nodata';
        } else cls += ' gg-plain';
        if (ctx.focusIds && o.dim !== false && ctx.focusIds.indexOf(id) < 0 && (o.dim || mode === 'find')) cls += ' gg-dim';
        if (hi.indexOf(id) >= 0) cls += ' gg-hi'; if (hi2.indexOf(id) >= 0) cls += ' gg-hi2';
        if (selected === id) cls += mode === 'find' ? ' gg-right' : ' gg-sel';
        if (flash === id) cls += ' gg-flash';
        if (kind === 'world' && !G.country(id) && id !== 'ATA') cls += ' gg-terr';
        var p = s('path', { d: d, class: cls, 'data-id': id }, gA);
        var area = path.area(f), inf = G.area(id) || G.state(id);
        var wantDot = o.dots === true || hi.indexOf(id) >= 0 || hi2.indexOf(id) >= 0 || markIds.indexOf(id) >= 0 || (o.data && o.data[id] != null) || (o.cats && o.cats[id] != null) ||
          (mode !== 'show' && (!ctx.focusIds || mode === 'explore' || ctx.focusIds.indexOf(id) >= 0));
        if (wantDot && area < (o.dotArea || 30) && inf && (G.country(id) || kind === 'us' || o.dotAll)) dots.push({ id: id, cls: cls, xy: proj([inf.lx, inf.ly]) });
        if (F.interactive && (mode === 'explore' || mode === 'find')) bindPick(p, id);
      });
      // disputed areas: hatched
      var gD = s('g', { class: 'gg-disputed' }, svg);
      ctx.disputed.forEach(function (f) { var d = path(f); if (!d) return; var p = s('path', { d: d, class: 'gg-disp' + (selected === f.id ? ' gg-sel' : ''), 'data-id': f.id, fill: 'url(#' + hid + ')' }, gD); if (F.interactive && mode === 'explore') bindPick(p, f.id); });
      // lakes
      var lakes = ctx.data.objects.lakes || [];
      if (o.lakes !== false) { var gL = s('g', { class: 'gg-lakes' }, svg); lakes.forEach(function (f) { var d = path(f); if (d) s('path', { d: d, class: 'gg-lake', 'data-id': f.id }, gL); }); }
      // physical features
      var labels = [];
      if (Dd.features && (o.features || o.rivers)) drawFeatures(svg, path, labels);
      // special lines
      (o.lines || []).forEach(function (k) {
        var L = G.LINES[k]; if (!L) return;
        var ln = L.lat !== undefined ? { type: 'LineString', coordinates: d3.range(-180, 180.1, 2).map(function (x) { return [x, L.lat]; }) } : { type: 'LineString', coordinates: d3.range(-90, 90.1, 2).map(function (y) { return [L.lon, y]; }) };
        var d = path(ln); if (!d) return;
        s('path', { d: d, class: 'gg-line gg-line-' + k }, svg);
        if (o.lineLabels !== false && !(F.quiet && o.ask === k)) { var pt = proj(L.lat !== undefined ? [o.lineLabelLon != null ? o.lineLabelLon : -150, L.lat] : [L.lon, -50]); if (pt && pt[0] > 0 && pt[0] < w) labels.push({ x: pt[0] + 4, y: pt[1] - 4, t: L.n, cls: 'gg-lab gg-lab-line', pri: 5, anchor: 'start' }); }
      });
      // dots for small countries
      var gDot = s('g', { class: 'gg-dots' }, svg);
      dots.forEach(function (dt) {
        if (!dt.xy || o.dots === false) return;
        var c = s('circle', { cx: dt.xy[0], cy: dt.xy[1], r: o.big ? 6 : (focusF || zoom > 1.5 ? 4.5 : 3.2), class: dt.cls.replace('gg-a', 'gg-dot'), 'data-id': dt.id }, gDot);
        if (F.interactive && (mode === 'explore' || mode === 'find')) bindPick(c, dt.id, true);
      });
      // ocean, sea and continent names
      if (o.oceans) G.OCEANS.forEach(function (oc) { if (F.quiet && o.ask === oc.id) return; var pt = proj([oc.lon, oc.lat]); if (pt && pt[0] > 20 && pt[0] < w - 20 && pt[1] > 8 && pt[1] < hh - 8) labels.push({ x: pt[0], y: pt[1], t: oc.n, cls: 'gg-lab gg-lab-ocean', pri: 9 }); });
      if (o.seas) G.SEAS.forEach(function (oc) { var pt = proj([oc.lon, oc.lat]); if (pt && pt[0] > 20 && pt[0] < w - 20 && pt[1] > 8 && pt[1] < hh - 8) labels.push({ x: pt[0], y: pt[1], t: oc.n, cls: 'gg-lab gg-lab-sea', pri: 6 }); });
      if (o.continents) G.CONTINENT_LABELS.forEach(function (cl) { if (F.quiet && o.ask === cl.id) return; var pt = proj([cl.lon, cl.lat]); if (pt) labels.push({ x: pt[0], y: pt[1], t: cl.n, cls: 'gg-lab gg-lab-cont', pri: 10 }); });
      // capitals and points
      var caps = o.capitals === true ? (ctx.focusIds || (kind === 'us' ? G.S.map(function (x) { return x.id; }) : G.C.map(function (c) { return c.id; }))) : (o.capitals || []);
      var gP = s('g', { class: 'gg-points' }, svg);
      caps.forEach(function (id) {
        var c = G.country(id) || G.state(id); if (!c || !c.cc) return; var pt = proj(c.cc); if (!pt) return;
        star(gP, pt[0], pt[1], o.big ? 6 : 4.5, 'gg-cap');
        if (o.capLabels !== false && !(F.quiet && (o.ask === id || markIds.indexOf(id) >= 0))) labels.push({ x: pt[0] + 6, y: pt[1] + 4, t: c.cap, cls: 'gg-lab gg-lab-cap', pri: 4, anchor: 'start' });
      });
      (o.points || []).forEach(function (pp) {
        var pt = proj([pp.lon, pp.lat]); if (!pt) return;
        if (pp.kind === 'star') star(gP, pt[0], pt[1], 5.5, 'gg-cap'); else s('circle', { cx: pt[0], cy: pt[1], r: pp.r || 4, class: 'gg-pt' + (pp.cls ? ' ' + pp.cls : '') }, gP);
        if (pp.mark) labels.push({ x: pt[0], y: pt[1] - 14, t: pp.mark, cls: 'gg-mark', pri: 20, mark: true });
        else if (pp.label) labels.push({ x: pt[0] + 6, y: pt[1] + 4, t: pp.label, cls: 'gg-lab gg-lab-pt', pri: 8, anchor: 'start' });
      });
      // names of areas
      var labIds = o.labels === true || o.labels === 'postal' ? ctx.areas.map(function (f) { return f.id; }) : (o.labels || []);
      if (labIds.length) {
        labIds.forEach(function (id) {
          if (F.quiet && (o.ask === id || markIds.indexOf(id) >= 0)) return;
          if (ctx.focusIds && o.labels === true && ctx.focusIds.indexOf(id) < 0 && o.labelAll !== true) return;
          var inf = kind === 'us' ? G.state(id) : (G.country(id) || (o.labelAll ? G.area(id) : null)); if (!inf) return;
          var f = ctx.data.byId(kind === 'us' ? 'states' : 'countries', id); if (!f) return;
          var pt = proj([inf.lx, inf.ly]); if (!pt) return;
          var bw = path.bounds(mainPart(d3, f)), aw = bw[1][0] - bw[0][0];
          var t = o.labels === 'postal' ? id : inf.n, est = t.length * 6.2;
          if (o.labels === true && !o.labelAll && aw < est * 0.55 && kind !== 'us') return;
          labels.push({ x: pt[0], y: pt[1], t: t, cls: 'gg-lab gg-lab-area', pri: M.min(7, aw / 30), area: true });
        });
      }
      // letters and question marks
      markIds.forEach(function (id) {
        var inf = kind === 'us' ? G.state(id) : G.area(id); if (!inf) return; var pt = proj([inf.lx, inf.ly]); if (!pt) return;
        labels.push({ x: pt[0], y: pt[1], t: o.mark[id], cls: 'gg-mark', pri: 20, mark: true });
      });
      placeLabels(svg, labels, w, hh);
      // legend
      legend.innerHTML = '';
      if (colorMode === 'data' && (o.legend || o.catNames)) {
        var lg = '';
        if (o.catNames) o.catNames.forEach(function (n, i) { if (n == null) return; lg += '<span><i class="gg-sw gg-k' + i + '"></i>' + esc(n) + '</span>'; });
        else if (q) { for (var k = 0; k <= q.length; k++) lg += '<span><i class="gg-sw gg-q' + k + '"></i>' + (k === 0 ? 'under ' + fmtN(q[0]) : k === q.length ? fmtN(q[k - 1]) + ' or more' : fmtN(q[k - 1]) + '–' + fmtN(q[k])) + '</span>'; }
        legend.innerHTML = (o.legend ? '<b>' + esc(o.legend) + '</b> ' : '') + lg;
      }
      if (!F.quiet && ctx.disputed.length && o.disputedNote !== false && !focusF) legend.insertAdjacentHTML('beforeend', '<span class="gg-dispnote"><i class="gg-sw gg-sw-disp"></i>Disputed areas' + (mode === 'explore' ? ' (tap to read more)' : '') + '</span>');
      legend.hidden = !legend.innerHTML;
      F.alt(svg, o.alt || describe());
      if (mode === 'explore' || mode === 'find') enablePan(svg);
    }
    function fmtN(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function star(g, x, y, r, cls) { var pts = []; for (var i = 0; i < 10; i++) { var a = -M.PI / 2 + i * M.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push((x + rr * M.cos(a)).toFixed(1) + ',' + (y + rr * M.sin(a)).toFixed(1)); } s('polygon', { points: pts.join(' '), class: cls }, g); }
    function describe() {
      var t = (kind === 'us' ? 'A map of the United States' : ctx.focusIds ? 'A map of part of the world' : 'A map of the world');
      if (o.highlight && !F.quiet) t += ', with ' + [].concat(o.highlight).map(function (id) { var a = areaInfo(id, kind); return a ? a.n : id; }).join(', ') + ' highlighted';
      else if (o.highlight) t += ', with one or more places highlighted';
      if (o.mark) t += ', with letters marking places';
      return t + '.';
    }
    function bindPick(p, id, isDot) {
      p.setAttribute('tabindex', '0'); p.setAttribute('role', 'button');
      p.setAttribute('aria-label', mode === 'find' ? 'A place on the map' + (isDot ? ' (small)' : '') : ((areaInfo(id, kind) || {}).n || id));
      p.addEventListener('click', function (e) { if (moved) return; e.stopPropagation(); onPick(id); });
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(id); } });
    }
    var moved = false;
    function enablePan(svg) {
      var start = null;
      svg.addEventListener('pointerdown', function (e) { if (zoom === 1) return; start = [e.clientX, e.clientY, pan[0], pan[1]]; moved = false; });
      svg.addEventListener('pointermove', function (e) { if (!start) return; var dx = e.clientX - start[0], dy = e.clientY - start[1]; if (M.abs(dx) + M.abs(dy) > 4) moved = true; if (moved) { pan = [start[2] + dx, start[3] + dy]; schedule(); } });
      W.addEventListener('pointerup', function () { if (start) { start = null; setTimeout(function () { moved = false; }, 30); } });
      svg.style.touchAction = zoom === 1 ? 'auto' : 'none';
    }
    var raf = 0; function schedule() { if (!raf) raf = W.requestAnimationFrame(function () { raf = 0; draw(); }); }
    function drawFeatures(svg, path, labels) {
      var FD = Dd.features, want = [].concat(o.features || []).concat(o.rivers ? ['rivers'] : []), focus = o.featureFocus;
      var gR = s('g', { class: 'gg-phys' }, svg), gRiv = s('g', { class: 'gg-rivers' }, svg);
      FD.objects.regions.forEach(function (f) {
        var info = G.phys(f.id); if (!info) return;
        if (want.indexOf(f.id) < 0 && want.indexOf(info.k) < 0 && !(want.indexOf('all') >= 0)) return;
        if (focus && info.cont !== focus && want.indexOf(f.id) < 0) return;
        var d = path(f); if (!d) return;
        s('path', { d: d, class: 'gg-ph gg-ph-' + info.k + ((o.hiFeature === f.id) ? ' gg-ph-hi' : '') }, gR);
        addFeatLabel(f, info, path, labels);
      });
      FD.objects.rivers.forEach(function (f) {
        var info = G.river(f.id); if (!info) return;
        if (want.indexOf(f.id) < 0 && want.indexOf('rivers') < 0) return;
        if (focus && info.cont !== focus && want.indexOf(f.id) < 0) return;
        var d = path(f); if (!d) return;
        s('path', { d: d, class: 'gg-river' + (o.hiFeature === f.id ? ' gg-river-hi' : '') }, gRiv);
        addFeatLabel(f, info, path, labels, true);
      });
    }
    function addFeatLabel(f, info, path, labels, river) {
      var mk = o.mark && o.mark[f.id];
      var gm = f.geometry, single = river && gm.type === 'LineString', pts = river ? (single ? gm.coordinates : [].concat.apply([], gm.coordinates)) : null;
      var c = path.centroid(river ? { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: pts } } : f);
      if (!c || isNaN(c[0])) return;
      if (single) {   // a river stored as one line: put the label on the line, at its point nearest the middle of its points
        var best = null, bd = Infinity; pts.forEach(function (p) { var q = path.centroid({ type: 'Point', coordinates: p }); if (!q || isNaN(q[0])) return; var d = (q[0] - c[0]) * (q[0] - c[0]) + (q[1] - c[1]) * (q[1] - c[1]); if (d < bd) { bd = d; best = q; } });
        if (best) c = best;
      }
      if (mk) labels.push({ x: c[0], y: c[1], t: mk, cls: 'gg-mark', pri: 20, mark: true });
      else if (!(F.quiet && (o.ask === f.id || o.hiFeature === f.id)) && o.featureLabels !== false) labels.push({ x: c[0], y: c[1], t: info.n, cls: 'gg-lab gg-lab-' + (river ? 'river' : info.k), pri: 6 });
    }
  });

  // greedy label placement: higher priority first, skip a label that would overlap one already placed (marks always shown)
  function placeLabels(svg, labels, w, hh) {
    var g = s('g', { class: 'gg-labels' }, svg), boxes = [];
    labels.sort(function (a, b) { return b.pri - a.pri; });
    labels.forEach(function (L) {
      if (L.mark) {
        var r = L.t.length > 1 ? 11 : 10; s('circle', { cx: L.x, cy: L.y, r: r, class: 'gg-markbg' }, g);
        text(g, L.x, L.y + 4.5, L.t, 'gg-mark', { 'text-anchor': 'middle' }); boxes.push([L.x - r, L.y - r, L.x + r, L.y + r]); return;
      }
      var est = L.t.length * (L.cls.indexOf('cont') >= 0 ? 7.5 : 6.4), anchor = L.anchor || 'middle';
      var x0 = anchor === 'start' ? L.x : L.x - est / 2, bx = [x0 - 2, L.y - 10, x0 + est + 2, L.y + 4];
      if (bx[0] < 0) { L.x -= bx[0]; bx[2] -= bx[0]; bx[0] = 0; }
      if (bx[2] > w) { if (anchor === 'start' && L.x - 12 - est > 0) { anchor = 'end'; L.x -= 12; bx = [L.x - est - 2, L.y - 10, L.x + 2, L.y + 4]; } else { var sh = bx[2] - w; L.x -= sh; bx[0] -= sh; bx[2] = w; } }
      if (bx[1] < 0 || bx[3] > hh) return;
      for (var i = 0; i < boxes.length; i++) { var B = boxes[i]; if (bx[0] < B[2] && bx[2] > B[0] && bx[1] < B[3] && bx[3] > B[1]) return; }
      boxes.push(bx); text(g, L.x, L.y, L.t, L.cls, { 'text-anchor': anchor });
    });
  }
  GV.placeLabels = placeLabels; GV.areaInfo = areaInfo; GV.regionIds = regionIds; GV.mainPart = mainPart;

  /* ---------------------------------------------------------------------------------------------------- gg-outline */
  V.register('gg-outline', function (el, o) {
    var F = frame(el, o, 'outline'), kind = o.map === 'us' ? 'us' : 'world', ids = [].concat(o.ids || o.id || []);
    var box = h('div', 'ggo-row'); F.body.appendChild(box); box.appendChild(h('p', 'ggv-loading', 'Loading…'));
    need([kind]).then(function (r) {
      var d3 = r.d3, data = r[kind], obj = kind === 'us' ? 'states' : 'countries';
      function drawAll() {
        box.innerHTML = '';
        var n = ids.length, cw = M.min(o.size || 260, M.max(140, ((F.body.clientWidth || 300) - (n - 1) * 10) / M.min(n, 3)));
        ids.forEach(function (id, i) {
          var f = data.byId(obj, id) || (kind === 'world' ? data.byId('disputed', id) : null); if (!f) return;
          var main = o.whole ? f : mainPart(d3, f), cell = h('figure', 'ggo-cell'), hh = M.round(cw * 0.8);
          var svg = svgRoot(cw, hh, 'ggo-svg'); cell.appendChild(svg); box.appendChild(cell);
          var proj = d3.geoAzimuthalEqualArea().rotate([-d3.geoCentroid(main)[0], -d3.geoCentroid(main)[1]]).fitExtent([[10, 10], [cw - 10, hh - 10]], main), path = d3.geoPath(proj);
          if (o.context) data.objects[obj].forEach(function (g) { if (g.id === id) return; var d = path(g); if (d) s('path', { d: d, class: 'ggo-ctx' }, svg); });
          s('path', { d: path(o.whole ? f : main), class: 'ggo-shape' + (o.color ? ' gg-k' + i : '') }, svg);
          var inf = kind === 'us' ? G.state(id) : G.area(id);
          if (o.capital && inf && inf.cc) { var pt = proj(inf.cc); if (pt) { s('circle', { cx: pt[0], cy: pt[1], r: 4, class: 'gg-cap' }, svg); } }
          var cap = n > 1 ? LETTERS[i] : '';
          if (!F.quiet && o.names !== false && inf) cap += (cap ? '  ' : '') + inf.n;
          if (cap) cell.appendChild(h('figcaption', 'ggo-cap', esc(cap)));
          if (o.scale !== false) { // a 500 km (or 200 mi for U.S. states) scale bar
            var km = o.scaleKm || (kind === 'us' ? 321.9 : 500), c0 = d3.geoCentroid(main), p1 = proj(c0), p2 = proj([c0[0] + km / (111.32 * M.cos(c0[1] * M.PI / 180)), c0[1]]);
            if (p1 && p2) { var L = M.abs(p2[0] - p1[0]); if (L > 8 && L < cw - 20) { var y = hh - 8; s('line', { x1: 10, y1: y, x2: 10 + L, y2: y, class: 'ggo-scale' }, svg); text(svg, 10, y - 4, kind === 'us' ? '200 miles' : '500 km', 'gg-lab gg-lab-scale'); } }
          }
          F.alt(svg, (n > 1 ? 'Shape ' + LETTERS[i] + ': ' : '') + 'the outline of ' + (F.quiet || o.names === false ? (kind === 'us' ? 'a state' : 'a country') : (inf ? inf.n : id)) + ', seen from above' + (o.context ? ', with its neighbors shown faintly' : '') + '.');
        });
      }
      drawAll();
      var last = F.body.clientWidth; if ('ResizeObserver' in W) new ResizeObserver(function () { if (M.abs(F.body.clientWidth - last) > 30) { last = F.body.clientWidth; drawAll(); } }).observe(F.body);
    }).catch(function (e) { box.innerHTML = '<p class="ml-viz-err">This picture could not be drawn.</p>'; if (W.console) W.console.error(e); });
    return {};
  });
  /* ---------------------------------------------------------------------------------------------------- gg-globe */
  V.register('gg-globe', function (el, o) {
    var F = frame(el, o, 'globe'), box = h('div', 'ggg-box'); F.body.appendChild(box); box.appendChild(h('p', 'ggv-loading', 'Loading the globe…'));
    var rot = [0, -20, 0], ctx = null, spin = null;
    if (o.center) rot = [-o.center[0], -o.center[1], 0];
    need(['world']).then(function (r) {
      ctx = r;
      if (o.focus) { var a = G.area(o.focus) || G.country(o.focus); if (a) rot = [-a.lx, -M.max(-60, M.min(60, a.ly)), 0]; }
      draw();
      if (F.interactive) {
        enableDrag();
        if (o.spin && !V.reduced) { spin = V.loop(box, function (dt) { rot[0] += dt * 12; draw(); }); var sb = btn(F.ctl, '⏸ Stop', function () { if (spin.running()) { spin.stop(); sb.textContent = '▶ Spin'; } else { spin.start(); sb.textContent = '⏸ Stop'; } }); }
        if (o.buttons !== false) {
          [['◀', 'Turn west', [10, 0]], ['▶', 'Turn east', [-10, 0]], ['▲', 'Tilt north', [0, -10]], ['▼', 'Tilt south', [0, 10]]].forEach(function (b) {
            btn(F.ctl, b[0], function () { rot[0] += b[2][0]; rot[1] = M.max(-90, M.min(90, rot[1] + b[2][1])); draw(); }).setAttribute('aria-label', b[1]);
          });
        }
      }
      var lastW = box.clientWidth; if ('ResizeObserver' in W) new ResizeObserver(function () { if (M.abs(box.clientWidth - lastW) > 20) { lastW = box.clientWidth; draw(); } }).observe(box);
    }).catch(function (e) { box.innerHTML = '<p class="ml-viz-err">This globe could not be drawn.</p>'; if (W.console) W.console.error(e); });
    var svg = null;
    function draw() {
      var d3 = ctx.d3, data = ctx.world, w = M.min(o.size || 420, M.max(200, box.clientWidth || 300)), hh = w;
      var proj = d3.geoOrthographic().rotate(rot).fitExtent([[6, 6], [w - 6, hh - 6]], { type: 'Sphere' }).clipAngle(90), path = d3.geoPath(proj);
      if (!svg) { svg = svgRoot(w, hh, 'ggg-svg'); box.innerHTML = ''; box.appendChild(svg); svg.setAttribute('tabindex', F.interactive ? '0' : '-1'); keys(svg); }
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + hh); svg.style.maxWidth = w + 'px';
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      s('path', { d: path({ type: 'Sphere' }), class: 'gg-water' }, svg);
      if (o.graticule !== false) s('path', { d: path(d3.geoGraticule10()), class: 'gg-grat' }, svg);
      var pc = politicalColors(), hi = [].concat(o.highlight || []), hiIds = [];
      hi.forEach(function (x) { var ids = regionIds('world', x); hiIds = hiIds.concat(ids || [x]); });
      var g = s('g', null, svg);
      data.objects.countries.forEach(function (f) {
        var d = path(f); if (!d) return; var cls = 'gg-a';
        if (o.color === 'continents') cls += ' gg-cont-' + (contOf(f.id) || 'x'); else if (o.color === 'political') cls += ' gg-c' + (pc[f.id] || 0); else cls += ' gg-plain';
        if (hiIds.indexOf(f.id) >= 0) cls += ' gg-hi';
        s('path', { d: d, class: cls }, g);
      });
      data.objects.disputed.forEach(function (f) { var d = path(f); if (d) s('path', { d: d, class: 'gg-a ' + (o.color === 'continents' ? 'gg-cont-' + (contOf(f.id) || 'x') : 'gg-plain') + (hiIds.indexOf(f.id) >= 0 ? ' gg-hi' : '') }, g); });
      (data.objects.lakes || []).forEach(function (f) { var d = path(f); if (d) s('path', { d: d, class: 'gg-lake' }, g); });
      if (o.hemi) { var hc = { N: [0, 90], S: [0, -90], E: [90, 0], W: [-90, 0] }[o.hemi]; if (hc) s('path', { d: path(d3.geoCircle().center(hc).radius(90)()), class: 'gg-hemi' }, svg); }
      var labels = [];
      (o.lines || []).forEach(function (k) {
        var L = G.LINES[k]; if (!L) return;
        var ln = L.lat !== undefined ? { type: 'LineString', coordinates: d3.range(-180, 180.1, 3).map(function (x) { return [x, L.lat]; }) } : { type: 'LineString', coordinates: d3.range(-90, 90.1, 3).map(function (y) { return [L.lon, y]; }).concat(d3.range(90, -90.1, -3).map(function (y) { return [L.lon + 180, y]; })) };
        var d = path(ln); if (d) s('path', { d: d, class: 'gg-line gg-line-' + k }, svg);
        if (!(F.quiet && o.ask === k) && o.lineLabels !== false) { var cands = L.lat !== undefined ? [-rot[0], -rot[0] - 30, -rot[0] + 30] : [L.lon]; for (var i = 0; i < cands.length; i++) { var p = proj(L.lat !== undefined ? [cands[i], L.lat] : [L.lon, -rot[1] + 15]); if (p && d3.geoDistance(L.lat !== undefined ? [cands[i], L.lat] : [L.lon, -rot[1] + 15], [-rot[0], -rot[1]]) < 1.3) { labels.push({ x: p[0], y: p[1] - 5, t: L.n, cls: 'gg-lab gg-lab-line', pri: 5 }); break; } } }
      });
      function vis(ll) { return d3.geoDistance(ll, [-rot[0], -rot[1]]) < M.PI / 2 - 0.05; }
      if (o.continents) G.CONTINENT_LABELS.forEach(function (c) { if (F.quiet && o.ask === c.id) return; if (vis([c.lon, c.lat])) { var p = proj([c.lon, c.lat]); labels.push({ x: p[0], y: p[1], t: c.n, cls: 'gg-lab gg-lab-cont', pri: 10 }); } });
      if (o.oceans) G.OCEANS.forEach(function (c) { if (F.quiet && o.ask === c.id) return; if (vis([c.lon, c.lat])) { var p = proj([c.lon, c.lat]); labels.push({ x: p[0], y: p[1], t: c.n, cls: 'gg-lab gg-lab-ocean', pri: 9 }); } });
      if (o.poles) [['North Pole', [0, 90]], ['South Pole', [0, -90]]].forEach(function (pp) { if (vis(pp[1])) { var p = proj(pp[1]); s('circle', { cx: p[0], cy: p[1], r: 4, class: 'gg-pt' }, svg); if (!(F.quiet && o.ask === pp[0])) labels.push({ x: p[0] + 6, y: p[1] + 4, t: pp[0], cls: 'gg-lab gg-lab-pt', pri: 8, anchor: 'start' }); } });
      (o.points || []).forEach(function (pp) { if (!vis([pp.lon, pp.lat])) return; var p = proj([pp.lon, pp.lat]); s('circle', { cx: p[0], cy: p[1], r: 4.5, class: 'gg-pt' }, svg); if (pp.mark) labels.push({ x: p[0], y: p[1] - 14, t: pp.mark, cls: 'gg-mark', pri: 20, mark: true }); else if (pp.label) labels.push({ x: p[0] + 6, y: p[1] + 4, t: pp.label, cls: 'gg-lab gg-lab-pt', pri: 8, anchor: 'start' }); });
      if (o.mark) Object.keys(o.mark).forEach(function (id) { var a = G.area(id); if (a && vis([a.lx, a.ly])) { var p = proj([a.lx, a.ly]); labels.push({ x: p[0], y: p[1], t: o.mark[id], cls: 'gg-mark', pri: 20, mark: true }); } });
      s('path', { d: path({ type: 'Sphere' }), class: 'gg-rim' }, svg);
      placeLabels(svg, labels, w, hh);
      F.alt(svg, o.alt || ('A globe' + (o.hemi ? ' with the ' + { N: 'Northern', S: 'Southern', E: 'Eastern', W: 'Western' }[o.hemi] + ' Hemisphere shaded' : '') + (hi.length && !F.quiet ? ', with ' + hi.map(function (x) { var a = G.area(x); return a ? a.n : G.contName(x); }).join(', ') + ' highlighted' : '') + (F.interactive ? '. Drag it, or use the arrow keys, to turn it.' : '.')));
    }
    function enableDrag() {
      var st = null; svg.style.touchAction = 'none'; svg.style.cursor = 'grab';
      svg.addEventListener('pointerdown', function (e) { st = [e.clientX, e.clientY, rot[0], rot[1]]; try { svg.setPointerCapture(e.pointerId); } catch (er) { } if (spin) spin.stop(); svg.style.cursor = 'grabbing'; });
      svg.addEventListener('pointermove', function (e) { if (!st) return; var k = 180 / M.max(200, svg.getBoundingClientRect().width); rot = [st[2] + (e.clientX - st[0]) * k, M.max(-90, M.min(90, st[3] - (e.clientY - st[1]) * k)), 0]; sched(); });
      svg.addEventListener('pointerup', function () { st = null; svg.style.cursor = 'grab'; });
    }
    var raf = 0; function sched() { if (!raf) raf = W.requestAnimationFrame(function () { raf = 0; draw(); }); }
    function keys(sv) { sv.addEventListener('keydown', function (e) { var d = { ArrowLeft: [10, 0], ArrowRight: [-10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key]; if (!d || !F.interactive) return; e.preventDefault(); rot[0] += d[0]; rot[1] = M.max(-90, M.min(90, rot[1] + d[1])); draw(); }); }
    return {};
  });

  /* ---------------------------------------------------------------------------------------------------- gg-latlon */
  V.register('gg-latlon', function (el, o) {
    var F = frame(el, o, 'latlon'), box = h('div', 'ggl-box'); F.body.appendChild(box); box.appendChild(h('p', 'ggv-loading', 'Loading the map…'));
    var bb = o.bbox || [-180, -90, 180, 90], step = o.step || (bb[2] - bb[0] > 200 ? 30 : bb[2] - bb[0] > 80 ? 15 : bb[2] - bb[0] > 30 ? 10 : 5);
    var pt = o.point ? o.point.slice() : null, mode = o.mode || (o.target ? 'place' : 'read'), checked = false, ctx = null;
    if (mode === 'place' && !pt) pt = [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2];
    need(['world']).then(function (r) {
      ctx = r; draw();
      if (mode === 'place' && F.interactive && !F.quiet) btn(F.ctl, 'Check', function () { checked = true; draw(); }, 'pri');
      var lastW = box.clientWidth; if ('ResizeObserver' in W) new ResizeObserver(function () { if (M.abs(box.clientWidth - lastW) > 20) { lastW = box.clientWidth; draw(); } }).observe(box);
    }).catch(function (e) { box.innerHTML = '<p class="ml-viz-err">This map could not be drawn.</p>'; if (W.console) W.console.error(e); });
    function snap(v) { var sn = o.snap || (step >= 15 ? 5 : 1); return M.round(v / sn) * sn; }
    function draw() {
      var d3 = ctx.d3, w = M.max(260, box.clientWidth || 600), padL = 38, padR = 12, padT = 18, padB = 22;
      var poly = { type: 'Polygon', coordinates: [[[bb[0], bb[1]], [bb[0], bb[3]], [bb[2], bb[3]], [bb[2], bb[1]], [bb[0], bb[1]]]] };
      var proj = d3.geoEquirectangular().fitWidth(w - padL - padR, { type: 'MultiPoint', coordinates: [[bb[0], bb[1]], [bb[2], bb[3]]] });
      var b0 = d3.geoPath(proj).bounds({ type: 'MultiPoint', coordinates: [[bb[0], bb[1]], [bb[2], bb[3]]] }), hh = M.round(b0[1][1] - b0[0][1]) + padT + padB;
      proj.fitExtent([[padL, padT], [w - padR, hh - padB]], { type: 'MultiPoint', coordinates: [[bb[0], bb[1]], [bb[2], bb[3]]] }).clipExtent([[padL, padT], [w - padR, hh - padB]]);
      var path = d3.geoPath(proj); box.innerHTML = '';
      var svg = svgRoot(w, hh, 'ggl-svg'); box.appendChild(svg);
      s('rect', { x: padL, y: padT, width: w - padL - padR, height: hh - padT - padB, class: 'gg-water' }, svg);
      var g = s('g', null, svg);
      ctx.world.objects.countries.concat(ctx.world.objects.disputed).forEach(function (f) { var d = path(f); if (d) s('path', { d: d, class: 'gg-a gg-plain' + ((o.highlight || []).indexOf(f.id) >= 0 ? ' gg-hi' : '') }, g); });
      // the grid, with labels on the edges
      var gl = s('g', { class: 'ggl-grid' }, svg);
      // on a narrow screen, label every second (third …) line so the labels do not run into each other (the lines all stay)
      var lonPx = M.abs(proj([step, 0])[0] - proj([0, 0])[0]), latPx = M.abs(proj([0, 0])[1] - proj([0, step])[1]);
      var lonW = 0; for (var lw = M.ceil(bb[0] / step) * step; lw <= bb[2]; lw += step) lonW = M.max(lonW, G.fmtLon(lw).length * 6.2 + 6);
      var kLon = M.max(1, M.ceil(lonW / M.max(1, lonPx))), kLat = M.max(1, M.ceil(14 / M.max(1, latPx)));
      function every(v, k) { var i = M.round(v / step); return k === 1 || ((i % k) + k) % k === 0; }
      for (var lon = M.ceil(bb[0] / step) * step; lon <= bb[2]; lon += step) { var x = proj([lon, 0])[0]; s('line', { x1: x, y1: padT, x2: x, y2: hh - padB, class: 'ggl-gl' + (lon === 0 ? ' ggl-gl0' : '') }, gl); if (o.axisLabels !== false && every(lon, kLon)) text(gl, x, hh - 6, G.fmtLon(lon), 'gg-lab ggl-ax', { 'text-anchor': 'middle' }); }
      for (var lat = M.ceil(bb[1] / step) * step; lat <= bb[3]; lat += step) { var y = proj([bb[0], lat])[1]; s('line', { x1: padL, y1: y, x2: w - padR, y2: y, class: 'ggl-gl' + (lat === 0 ? ' ggl-gl0' : '') }, gl); if (o.axisLabels !== false && every(lat, kLat)) text(gl, padL - 4, y + 4, G.fmtLat(lat), 'gg-lab ggl-ax', { 'text-anchor': 'end' }); }
      var labels = [];
      (o.lines || []).forEach(function (k) { var L = G.LINES[k]; if (!L || L.lat === undefined) return; var y = proj([0, L.lat])[1]; s('line', { x1: padL, y1: y, x2: w - padR, y2: y, class: 'gg-line gg-line-' + k }, svg); if (!(F.quiet && o.ask === k)) labels.push({ x: w - padR - 4, y: y - 4, t: L.n, cls: 'gg-lab gg-lab-line', pri: 5, anchor: 'end' }); });
      (o.cities || []).forEach(function (cn, i) { var c = typeof cn === 'string' ? G.city(cn) : cn; if (!c) return; var p = proj([c.lon, c.lat]); s('circle', { cx: p[0], cy: p[1], r: 4, class: 'gg-pt' }, svg); if (o.cityMarks) labels.push({ x: p[0], y: p[1] - 13, t: LETTERS[i], cls: 'gg-mark', pri: 20, mark: true }); else labels.push({ x: p[0] + 6, y: p[1] + 4, t: c.n, cls: 'gg-lab gg-lab-pt', pri: 8, anchor: 'start' }); });
      if (pt) {
        var p = proj(pt), cls = 'ggl-pin' + (checked && o.target ? (M.abs(pt[0] - o.target[0]) <= (o.tol || 0.6) && M.abs(pt[1] - o.target[1]) <= (o.tol || 0.6) ? ' ok' : ' no') : '');
        var pin = s('g', { class: cls, transform: 'translate(' + p[0] + ',' + p[1] + ')' }, svg); s('circle', { r: 11, class: 'ggl-pin-halo' }, pin); s('circle', { r: 5.5, class: 'ggl-pin-dot' }, pin);
        if (o.mark) labels.push({ x: p[0], y: p[1] - 18, t: o.mark, cls: 'gg-mark', pri: 21, mark: true });
        if (mode === 'place' && F.interactive) dragPin(svg, proj, pin);
      }
      placeLabels(svg, labels, w, hh);
      if (pt && !F.quiet) F.say((mode === 'place' ? 'The pin is at ' : 'This point is at ') + '<b>' + G.fmtLat(pt[1]) + ', ' + G.fmtLon(pt[0]) + '</b>' + (checked && o.target ? (svg.querySelector('.ok') ? ' ' + okMark(true) + ' Right on target.' : ' ' + okMark(false) + ' The target is ' + G.fmtLat(o.target[1]) + ', ' + G.fmtLon(o.target[0]) + '.') : ''));
      F.alt(svg, o.alt || ('A map with a grid of latitude and longitude lines every ' + step + ' degrees' + (pt ? (F.quiet ? ', and a point marked on it' : ', and a point at ' + G.fmtLat(pt[1]) + ', ' + G.fmtLon(pt[0])) : '') + (mode === 'place' ? '. Drag the pin, or use the arrow keys, to move it.' : '.')));
    }
    function dragPin(svg, proj, pin) {
      svg.style.touchAction = 'none'; pin.style.cursor = 'grab'; svg.setAttribute('tabindex', '0');
      var on = false;
      svg.addEventListener('pointerdown', function (e) { on = true; try { svg.setPointerCapture(e.pointerId); } catch (er) { } move(e); });
      svg.addEventListener('pointermove', function (e) { if (on) move(e); });
      svg.addEventListener('pointerup', function () { on = false; });
      function move(e) { var r = svg.getBoundingClientRect(), k = svg.viewBox.baseVal.width / r.width, ll = proj.invert([(e.clientX - r.left) * k, (e.clientY - r.top) * k]); if (!ll) return; pt = [M.max(bb[0], M.min(bb[2], snap(ll[0]))), M.max(bb[1], M.min(bb[3], snap(ll[1])))]; checked = false; sched(); }
      svg.addEventListener('keydown', function (e) { var sn = o.snap || (step >= 15 ? 5 : 1), d = { ArrowLeft: [-sn, 0], ArrowRight: [sn, 0], ArrowUp: [0, sn], ArrowDown: [0, -sn] }[e.key]; if (!d) return; e.preventDefault(); pt = [M.max(bb[0], M.min(bb[2], pt[0] + d[0])), M.max(bb[1], M.min(bb[3], pt[1] + d[1]))]; checked = false; draw(); setTimeout(function () { var s2 = box.querySelector('svg'); if (s2) s2.focus(); }, 0); });
    }
    var raf = 0; function sched() { if (!raf) raf = W.requestAnimationFrame(function () { raf = 0; draw(); var s2 = box.querySelector('svg'); }); }
    return {};
  });

  /* ---------------------------------------------------------------------------------------------------- gg-projection */
  var PROJ_KEEPS = {
    mercator: 'Keeps angles and the shapes of small areas, so a straight line is a steady compass course. Areas grow larger and larger toward the poles.',
    gallpeters: 'An equal-area map: every country has its true size compared with others. Shapes are stretched up and down near the equator and squashed near the poles.',
    mollweide: 'An equal-area map in an oval. Shapes bend toward the edges.',
    equalearth: 'An equal-area map that keeps shapes fairly natural; made in 2018 for world maps.',
    robinson: 'A compromise: nothing is exactly true, but sizes and shapes are only a little off. Areas near the poles are somewhat enlarged.',
    winkel: 'A compromise used by many atlases: small errors in area, shape and distance together.',
    equirect: 'Latitude and longitude drawn as a square grid. Simple, but it stretches lands east and west toward the poles.',
    natural: 'A compromise designed to look pleasing for world maps.',
    ortho: 'The globe as seen from space: true shapes near the center, but only half the world at once.'
  };
  V.register('gg-projection', function (el, o) {
    var F = frame(el, o, 'proj'), list = [].concat(o.compare || o.proj || 'mercator'), cur = list.slice(), ctx = null, drag = null;
    var row = h('div', 'ggp-row'); F.body.appendChild(row); row.appendChild(h('p', 'ggv-loading', 'Loading the maps…'));
    var tsPos = null; // true-size overlay position [lon, lat]
    need(['world']).then(function (r) {
      ctx = r;
      if (o.truesize) { var a = G.area(o.truesize); tsPos = a ? [a.lx, a.ly] : [0, 0]; }
      if (o.choose && F.interactive) {
        var items = (o.choices || ['mercator', 'gallpeters', 'robinson', 'equalearth', 'mollweide', 'winkel']).map(function (k) { return [k, PROJ_NAMES[k]]; });
        V.seg(F.ctl, { label: 'Projection', items: items, value: cur[0], change: function (v) { cur = [v]; draw(); } });
      }
      draw();
      var lastW = row.clientWidth; if ('ResizeObserver' in W) new ResizeObserver(function () { if (M.abs(row.clientWidth - lastW) > 20) { lastW = row.clientWidth; draw(); } }).observe(row);
    }).catch(function (e) { row.innerHTML = '<p class="ml-viz-err">These maps could not be drawn.</p>'; if (W.console) W.console.error(e); });
    function draw() {
      var d3 = ctx.d3, n = cur.length, tw = M.max(260, row.clientWidth || 600), w = n > 1 && tw > 620 ? (tw - 12) / 2 : tw;
      row.innerHTML = '';
      var hi = []; [].concat(o.highlight || []).forEach(function (x) { hi = hi.concat(regionIds('world', x) || [x]); });
      cur.forEach(function (name, i) {
        var cell = h('figure', 'ggp-cell'); row.appendChild(cell);
        var proj = projection(d3, name), out = outline(name);
        proj.fitWidth(w - 8, out); var b = d3.geoPath(proj).bounds(out), hh = M.min(M.round(w * 1.05), M.ceil(b[1][1] - b[0][1]) + 8);
        proj.fitExtent([[4, 4], [w - 4, hh - 4]], out); if (name === 'mercator' || name === 'gallpeters' || name === 'equirect') proj.clipExtent([[0, 0], [w, hh]]);
        var path = d3.geoPath(proj), svg = svgRoot(w, hh, 'ggp-svg'); cell.appendChild(svg);
        if (name === 'mercator') s('rect', { x: 0, y: 0, width: w, height: hh, class: 'gg-water' }, svg); else s('path', { d: path({ type: 'Sphere' }), class: 'gg-water' }, svg);
        s('path', { d: path(d3.geoGraticule10()), class: 'gg-grat' }, svg);
        ctx.world.objects.countries.concat(ctx.world.objects.disputed).forEach(function (f) { var d = path(f); if (d) s('path', { d: d, class: 'gg-a gg-plain' + (hi.indexOf(f.id) >= 0 ? ' gg-hi' : '') + (o.highlight2 && [].concat(o.highlight2).indexOf(f.id) >= 0 ? ' gg-hi2' : '') }, svg); });
        if (o.tissot) {
          var lats = name === 'mercator' ? [-60, -30, 0, 30, 60] : [-75, -45, -15, 15, 45, 75];
          for (var lon = -150; lon <= 150; lon += 30) lats.forEach(function (lat) { var d = path(d3.geoCircle().center([lon, lat]).radius(o.tissotR || 6).precision(5)()); if (d) s('path', { d: d, class: 'ggp-tissot' }, svg); });
        }
        if (o.truesize && tsPos && name === 'mercator') {
          var f0 = ctx.world.byId('countries', o.truesize) || ctx.world.byId('disputed', o.truesize), a0 = G.area(o.truesize);
          if (f0 && a0) {
            var r1 = d3.geoRotation([-a0.lx, -a0.ly]), r2 = d3.geoRotation([-tsPos[0], -tsPos[1]]);
            var moved = JSON.parse(JSON.stringify(mainPart(d3, f0).geometry)); (function walk(c) { if (typeof c[0] === 'number') { var p = r2.invert(r1(c)); c[0] = p[0]; c[1] = p[1]; } else c.forEach(walk); })(moved.coordinates);
            var dd = path(moved); if (dd) { var gp = s('path', { d: dd, class: 'ggp-ts' }, svg); if (F.interactive) bindTS(svg, proj, gp); }
          }
        }
        if (!F.quiet || o.names) cell.appendChild(h('figcaption', 'ggp-cap', (n > 1 ? '<b>' + LETTERS[i] + '</b> ' : '') + (F.quiet ? '' : '<b>' + esc(PROJ_NAMES[name]) + '</b>' + (o.keeps !== false ? ': ' + esc(PROJ_KEEPS[name] || '') : ''))));
        else if (n > 1) cell.appendChild(h('figcaption', 'ggp-cap', '<b>' + LETTERS[i] + '</b>'));
        F.alt(svg, o.alt || ((n > 1 ? 'Map ' + LETTERS[i] + ': ' : '') + 'a world map' + (F.quiet ? '' : ' on the ' + PROJ_NAMES[name] + ' projection') + (o.tissot ? ', with same-size circles drawn on the globe to show the stretching' : '') + (hi.length && !F.quiet ? ', with ' + [].concat(o.highlight).map(function (x) { var a = G.area(x); return a ? a.n : G.contName(x); }).join(' and ') + ' highlighted' : '') + '.'));
      });
      if (o.truesize && !F.quiet) { var a = G.area(o.truesize); F.say('Drag the outline of <b>' + esc(a ? a.n : '') + '</b>: it keeps its true size and changes only how Mercator draws it. Now at about ' + G.fmtLat(M.round(tsPos[1])) + '.'); }
    }
    function bindTS(svg, proj, gp) {
      gp.style.cursor = 'grab'; svg.style.touchAction = 'none'; var on = false;
      gp.addEventListener('pointerdown', function (e) { on = true; try { svg.setPointerCapture(e.pointerId); } catch (er) { } e.preventDefault(); });
      svg.addEventListener('pointermove', function (e) { if (!on) return; var r = svg.getBoundingClientRect(), k = svg.viewBox.baseVal.width / r.width, ll = proj.invert([(e.clientX - r.left) * k, (e.clientY - r.top) * k]); if (ll) { tsPos = [ll[0], M.max(-70, M.min(75, ll[1]))]; sched(); } });
      svg.addEventListener('pointerup', function () { on = false; });
    }
    var raf = 0; function sched() { if (!raf) raf = W.requestAnimationFrame(function () { raf = 0; draw(); }); }
    return {};
  });
  GV.PROJ_KEEPS = PROJ_KEEPS;

  /* ---------------------------------------------------------------------------------------------------- gg-timezones */
  V.register('gg-timezones', function (el, o) {
    var F = frame(el, o, 'tz'), box = h('div', 'ggt-box'); F.body.appendChild(box); box.appendChild(h('p', 'ggv-loading', 'Loading the map…'));
    var us = !!o.us, utc = o.utc != null ? o.utc : 12 * 60, ctx = null, sl = null;
    need(us ? ['us'] : ['world', 'tz']).then(function (r) {
      ctx = r; draw();
      if (F.interactive && o.slider !== false && !F.quiet) sl = V.slider(F.ctl, { label: 'Time in London (UTC)', min: 0, max: 1425, step: 15, value: utc, fmt: function (v) { return G.fmtClock(v); }, input: function (v) { utc = v; draw(); } });
      var lastW = box.clientWidth; if ('ResizeObserver' in W) new ResizeObserver(function () { if (M.abs(box.clientWidth - lastW) > 20) { lastW = box.clientWidth; draw(); } }).observe(box);
    }).catch(function (e) { box.innerHTML = '<p class="ml-viz-err">This map could not be drawn.</p>'; if (W.console) W.console.error(e); });
    function draw() {
      var d3 = ctx.d3, w = M.max(260, box.clientWidth || 600), hh, proj, path, svg, labels = [];
      box.innerHTML = '';
      if (us) {
        proj = d3.geoAlbersUsa(); var fc = { type: 'FeatureCollection', features: ctx.us.objects.states }; proj.fitWidth(w - 10, fc); var bd = d3.geoPath(proj).bounds(fc); hh = M.ceil(bd[1][1] - bd[0][1]) + 30; proj.fitExtent([[5, 5], [w - 5, hh - 25]], fc); path = d3.geoPath(proj);
        svg = svgRoot(w, hh, 'ggt-svg'); box.appendChild(svg); s('rect', { x: 0, y: 0, width: w, height: hh, class: 'gg-water gg-water-us' }, svg);
        var order = ['H', 'AK', 'P', 'M', 'C', 'E'];
        ctx.us.objects.states.forEach(function (f) { var z = G.STATE_TZ[f.id], d = path(f); if (!d) return; s('path', { d: d, class: 'gg-a ggt-z' + order.indexOf(z) + (G.STATE_TZ_SPLIT[f.id] && o.split !== false ? ' ggt-split' : '') }, svg); });
        if (!(F.quiet && o.zoneNames === false)) order.forEach(function (z) {
          var sts = ctx.us.objects.states.filter(function (f) { return G.STATE_TZ[f.id] === z && !G.STATE_TZ_SPLIT[f.id]; }); if (!sts.length) return;
          var c = path.centroid({ type: 'FeatureCollection', features: sts }); if (!c || isNaN(c[0])) return;
          if (!(F.quiet && o.ask === z)) labels.push({ x: c[0], y: z === 'C' || z === 'M' ? c[1] - 40 : c[1], t: G.US_TZ_NAME[z], cls: 'gg-lab ggt-zn', pri: 9 });
        });
      } else {
        proj = d3.geoEquirectangular(); var bb = o.bbox || [-180, -60, 180, 80], mp = { type: 'MultiPoint', coordinates: [[bb[0], bb[1]], [bb[2], bb[3]]] };
        proj.fitWidth(w - 4, mp); var b0 = d3.geoPath(proj).bounds(mp); hh = M.ceil(b0[1][1] - b0[0][1]) + 24; proj.fitExtent([[2, 20], [w - 2, hh - 4]], mp).clipExtent([[0, 18], [w, hh]]); path = d3.geoPath(proj);
        svg = svgRoot(w, hh, 'ggt-svg'); box.appendChild(svg); s('rect', { x: 0, y: 18, width: w, height: hh - 18, class: 'gg-water' }, svg);
        ctx.tz.objects.zones.forEach(function (f) { var z = f.properties.z, d = path(f); if (!d) return; var k = ((M.round(z) % 2) + 2) % 2; s('path', { d: d, class: 'ggt-zone ggt-b' + k + (z % 1 ? ' ggt-half' : '') + (o.highlightZone != null && z === o.highlightZone ? ' gg-hi' : '') }, svg); });
        ctx.world.objects.countries.concat(ctx.world.objects.disputed).forEach(function (f) { var d = path(f); if (d) s('path', { d: d, class: 'ggt-land' }, svg); });
        for (var zz = -12, zst = w < 500 ? 3 : w < 800 ? 2 : 1; zz <= 12; zz++) { if (zz % zst) continue; var x = proj([zz * 15, 0])[0]; if (x < 8 || x > w - 8) continue; if (!F.quiet || o.offsets) text(svg, x, 13, (zz > 0 ? '+' : zz < 0 ? '−' : '') + M.abs(zz), 'gg-lab ggt-off', { 'text-anchor': 'middle' }); }
        if (o.dateline) { s('path', { d: path({ type: 'LineString', coordinates: [[180, -60], [180, 80]] }), class: 'gg-line gg-line-dateline' }, svg); }
      }
      (o.cities || []).forEach(function (cn, i) {
        var c = typeof cn === 'string' ? G.city(cn) : cn; if (!c) return; var p = proj([c.lon, c.lat]); if (!p) return;
        s('circle', { cx: p[0], cy: p[1], r: 4.5, class: 'gg-pt' }, svg);
        var asked = F.quiet && (o.ask === c.n || (o.askAll));
        var t = c.n + (asked || o.clocks === false ? '' : ' ' + G.fmtClock(utc + c.utc * 60).replace(':00 noon', ' noon').replace(':00 midnight', ' midnight'));
        if (o.cityMarks) labels.push({ x: p[0], y: p[1] - 13, t: LETTERS[i], cls: 'gg-mark', pri: 20, mark: true }); else labels.push({ x: p[0] + 6, y: p[1] + 4, t: t, cls: 'gg-lab gg-lab-pt', pri: 8, anchor: 'start' });
      });
      placeLabels(svg, labels, w, hh);
      F.alt(svg, o.alt || (us ? 'A map of the United States colored by time zone.' : 'A world map of time zones; the numbers along the top are hours ahead of (+) or behind (−) UTC.') + (o.cities && !F.quiet && o.clocks !== false ? ' Clocks: ' + o.cities.map(function (cn) { var c = typeof cn === 'string' ? G.city(cn) : cn; return c ? c.n + ' ' + G.fmtClock(utc + c.utc * 60) : ''; }).join(', ') + '.' : ''));
    }
    return {};
  });
  /* ======================================================================================================== Maps and Places */
  // ---- things seen from the side and from above (each drawn in a 100 x 100 box)
  function g(parent, attrs) { return s('g', attrs, parent); }
  var DRAW = {
    table: { side: function (p) { s('rect', { x: 12, y: 38, width: 76, height: 9, rx: 2, class: 'ggk-wood' }, p); s('rect', { x: 18, y: 47, width: 7, height: 38, class: 'ggk-wood2' }, p); s('rect', { x: 75, y: 47, width: 7, height: 38, class: 'ggk-wood2' }, p); },
      top: function (p) { s('rect', { x: 14, y: 24, width: 72, height: 52, rx: 4, class: 'ggk-wood' }, p); s('rect', { x: 22, y: 32, width: 56, height: 36, rx: 3, class: 'ggk-woodhi' }, p); } },
    chair: { side: function (p) { s('rect', { x: 30, y: 52, width: 40, height: 7, class: 'ggk-wood' }, p); s('rect', { x: 62, y: 14, width: 7, height: 40, class: 'ggk-wood' }, p); s('rect', { x: 32, y: 59, width: 6, height: 28, class: 'ggk-wood2' }, p); s('rect', { x: 62, y: 59, width: 6, height: 28, class: 'ggk-wood2' }, p); },
      top: function (p) { s('rect', { x: 28, y: 28, width: 44, height: 44, rx: 4, class: 'ggk-wood' }, p); s('rect', { x: 66, y: 26, width: 9, height: 48, rx: 2, class: 'ggk-wood2' }, p); } },
    bed: { side: function (p) { s('rect', { x: 8, y: 55, width: 84, height: 18, rx: 3, class: 'ggk-blanket' }, p); s('rect', { x: 8, y: 30, width: 8, height: 52, class: 'ggk-wood2' }, p); s('rect', { x: 84, y: 48, width: 8, height: 34, class: 'ggk-wood2' }, p); s('ellipse', { cx: 26, cy: 51, rx: 10, ry: 5, class: 'ggk-pillow' }, p); },
      top: function (p) { s('rect', { x: 24, y: 8, width: 52, height: 84, rx: 4, class: 'ggk-blanket' }, p); s('rect', { x: 30, y: 12, width: 40, height: 16, rx: 5, class: 'ggk-pillow' }, p); s('path', { d: 'M24 40 H76', class: 'ggk-fold' }, p); } },
    cup: { side: function (p) { s('path', { d: 'M30 30 H66 L62 80 H34 Z', class: 'ggk-cup' }, p); s('path', { d: 'M66 40 C84 40 84 66 63 66', class: 'ggk-handle' }, p); },
      top: function (p) { s('circle', { cx: 48, cy: 50, r: 24, class: 'ggk-cup' }, p); s('circle', { cx: 48, cy: 50, r: 17, class: 'ggk-drink' }, p); s('rect', { x: 71, y: 45, width: 14, height: 10, rx: 4, class: 'ggk-cup' }, p); } },
    tree: { side: function (p) { s('rect', { x: 44, y: 55, width: 12, height: 35, class: 'ggk-trunk' }, p); s('circle', { cx: 50, cy: 40, r: 27, class: 'ggk-leaf' }, p); s('circle', { cx: 40, cy: 34, r: 10, class: 'ggk-leafhi' }, p); },
      top: function (p) { s('circle', { cx: 50, cy: 50, r: 34, class: 'ggk-leaf' }, p); s('circle', { cx: 42, cy: 42, r: 13, class: 'ggk-leafhi' }, p); s('circle', { cx: 60, cy: 58, r: 9, class: 'ggk-leafhi' }, p); } },
    house: { side: function (p) { s('rect', { x: 22, y: 45, width: 56, height: 42, class: 'ggk-wall' }, p); s('path', { d: 'M15 47 L50 16 L85 47 Z', class: 'ggk-roof' }, p); s('rect', { x: 43, y: 62, width: 14, height: 25, class: 'ggk-door' }, p); s('rect', { x: 28, y: 54, width: 10, height: 10, class: 'ggk-win' }, p); s('rect', { x: 62, y: 54, width: 10, height: 10, class: 'ggk-win' }, p); },
      top: function (p) { s('rect', { x: 16, y: 22, width: 68, height: 28, class: 'ggk-roof' }, p); s('rect', { x: 16, y: 50, width: 68, height: 28, class: 'ggk-roof2' }, p); s('path', { d: 'M16 50 H84', class: 'ggk-ridge' }, p); s('rect', { x: 64, y: 28, width: 9, height: 9, class: 'ggk-door' }, p); } },
    car: { side: function (p) { s('path', { d: 'M10 66 V54 L24 52 L34 36 H64 L78 52 L90 56 V66 Z', class: 'ggk-car' }, p); s('path', { d: 'M38 40 H50 V51 H31 Z M54 40 H62 L72 51 H54 Z', class: 'ggk-glass' }, p); s('circle', { cx: 28, cy: 68, r: 9, class: 'ggk-tire' }, p); s('circle', { cx: 72, cy: 68, r: 9, class: 'ggk-tire' }, p); },
      top: function (p) { s('rect', { x: 32, y: 10, width: 36, height: 80, rx: 12, class: 'ggk-car' }, p); s('path', { d: 'M36 30 H64 L60 40 H40 Z', class: 'ggk-glass' }, p); s('path', { d: 'M40 70 H60 L63 78 H37 Z', class: 'ggk-glass' }, p); s('rect', { x: 40, y: 42, width: 20, height: 26, rx: 3, class: 'ggk-carroof' }, p); } },
    lamp: { side: function (p) { s('path', { d: 'M34 18 H66 L74 44 H26 Z', class: 'ggk-shade' }, p); s('rect', { x: 47, y: 44, width: 6, height: 36, class: 'ggk-metal' }, p); s('rect', { x: 32, y: 80, width: 36, height: 7, rx: 3, class: 'ggk-metal' }, p); },
      top: function (p) { s('circle', { cx: 50, cy: 50, r: 26, class: 'ggk-shade' }, p); s('circle', { cx: 50, cy: 50, r: 15, class: 'ggk-shadein' }, p); s('circle', { cx: 50, cy: 50, r: 6, class: 'ggk-bulb' }, p); } },
    plate: { side: function (p) { s('path', { d: 'M12 56 Q50 70 88 56 L84 62 Q50 72 16 62 Z', class: 'ggk-plate' }, p); },
      top: function (p) { s('circle', { cx: 50, cy: 50, r: 36, class: 'ggk-plate' }, p); s('circle', { cx: 50, cy: 50, r: 24, class: 'ggk-platein' }, p); } },
    bucket: { side: function (p) { s('path', { d: 'M26 34 H74 L66 86 H34 Z', class: 'ggk-bucket' }, p); s('path', { d: 'M28 34 C30 6 70 6 72 34', class: 'ggk-handle' }, p); },
      top: function (p) { s('circle', { cx: 50, cy: 50, r: 32, class: 'ggk-bucket' }, p); s('circle', { cx: 50, cy: 50, r: 22, class: 'ggk-bucketin' }, p); s('path', { d: 'M18 50 H82', class: 'ggk-handle' }, p); } },
    ball: { side: function (p) { s('circle', { cx: 50, cy: 52, r: 30, class: 'ggk-ball' }, p); s('path', { d: 'M22 46 Q50 60 78 46', class: 'ggk-ballline' }, p); },
      top: function (p) { s('circle', { cx: 50, cy: 50, r: 30, class: 'ggk-ball' }, p); s('path', { d: 'M50 20 Q62 50 50 80', class: 'ggk-ballline' }, p); } },
    bike: { side: function (p) { s('circle', { cx: 26, cy: 64, r: 16, class: 'ggk-wheel' }, p); s('circle', { cx: 76, cy: 64, r: 16, class: 'ggk-wheel' }, p); s('path', { d: 'M26 64 L44 40 H68 L76 64 M44 40 L52 64 L68 40 M40 34 H50 M66 40 L64 28 H74', class: 'ggk-frame' }, p); },
      top: function (p) { s('path', { d: 'M50 10 V90', class: 'ggk-wheeltop' }, p); s('path', { d: 'M34 26 H66', class: 'ggk-frame' }, p); s('rect', { x: 45, y: 52, width: 10, height: 14, rx: 3, class: 'ggk-seat' }, p); } }
  };
  function thing(svgParent, key, view, x, y, size) { var gg = g(svgParent, { transform: 'translate(' + x + ',' + y + ') scale(' + size / 100 + ')' }); if (DRAW[key]) DRAW[key][view](gg); return gg; }
  GV.thing = thing;

  V.register('gg-birdseye', function (el, o) {
    var F = frame(el, o, 'birdseye'), mode = o.mode || (o.ask ? 'ask' : o.match ? 'match' : o.fly ? 'fly' : 'pair');
    var things = [].concat(o.things || o.thing || ['table', 'tree']);
    var box = h('div', 'ggb-box'); F.body.appendChild(box);
    function card(parent, key, view, label, cls) {
      var fig = h('figure', 'ggb-card' + (cls ? ' ' + cls : '')), svg = svgRoot(120, 120, 'ggb-svg'); fig.appendChild(svg);
      s('rect', { x: 2, y: 2, width: 116, height: 116, rx: 12, class: view === 'top' ? 'ggb-bgtop' : 'ggb-bgside' }, svg);
      if (view === 'side') s('line', { x1: 8, y1: 102, x2: 112, y2: 102, class: 'ggb-floor' }, svg);
      thing(svg, key, view, 10, 10, 100);
      F.alt(svg, (F.quiet && (view === 'top' || cls === 'ggb-choice') ? 'A picture seen ' + (view === 'top' ? 'from above' : 'from the side') : 'A ' + (G.THINGS[key] || key) + ' seen ' + (view === 'top' ? 'from above' : 'from the side')) + (label ? ', ' + label : '') + '.');
      if (label) fig.appendChild(h('figcaption', 'ggb-cap', label)); parent.appendChild(fig); return fig;
    }
    if (mode === 'pair') {
      things.forEach(function (k) {
        var row = h('div', 'ggb-row'); box.appendChild(row);
        card(row, k, 'side', 'From the side'); row.appendChild(h('span', 'ggb-arrow', '<span aria-hidden="true">➜</span>'));
        card(row, k, 'top', 'From above' + (F.quiet ? '' : ': a ' + G.THINGS[k]));
      });
    } else if (mode === 'ask') {
      var key = o.ask || things[0], ch = o.choices || [key, 'plate', 'house'], ok = ch.indexOf(key), pick = null, done = false, fromTop = o.from === 'top';
      var r1 = h('div', 'ggb-row'); box.appendChild(r1); card(r1, key, fromTop ? 'top' : 'side', fromTop ? 'From above' + (F.quiet ? '' : ': a ' + G.THINGS[key]) : 'From the side: a ' + G.THINGS[key]);
      box.appendChild(h('p', 'ggb-q', o.prompt || (fromTop ? 'Which picture shows the same thing from the side?' : 'Which picture shows it from above?')));
      var r2 = h('div', 'ggb-row'); box.appendChild(r2);
      var cards = ch.map(function (k, i) { var c = card(r2, k, fromTop ? 'side' : 'top', LETTERS[i], 'ggb-choice'); if (F.interactive && !F.quiet) { c.tabIndex = 0; c.setAttribute('role', 'button'); var go = function () { if (done) return; pick = i; cards.forEach(function (cc, j) { cc.setAttribute('aria-pressed', String(j === i)); }); }; c.addEventListener('click', go); c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); } return c; });
      if (F.interactive && !F.quiet) btn(F.ctl, 'Check', function () { if (pick == null) { F.say('Tap a picture first.'); return; } cards[pick].classList.add(pick === ok ? 'ok' : 'no'); F.say(pick === ok ? okMark(true) + ' Yes! From above, a ' + G.THINGS[key] + ' looks like that.' : okMark(false) + ' Not that one. Think about the top of the ' + G.THINGS[key] + '.'); if (pick === ok) done = true; }, 'pri');
    } else if (mode === 'match') {
      var order = shuffle(things.map(function (_, i) { return i; }), o.seed || 5), picked = null, pairs = {};
      var top = h('div', 'ggb-row ggb-wrap'); box.appendChild(top); box.appendChild(h('p', 'ggb-q', F.quiet ? 'From above:' : 'Tap a thing, then the way it looks from above.'));
      var bot = h('div', 'ggb-row ggb-wrap'); box.appendChild(bot);
      var sides = things.map(function (k, i) { return card(top, k, 'side', String(i + 1), 'ggb-choice'); });
      var tops = order.map(function (ix, j) { return card(bot, things[ix], 'top', LETTERS[j], 'ggb-choice'); });
      if (F.interactive && !F.quiet) {
        sides.forEach(function (c, i) { c.tabIndex = 0; c.setAttribute('role', 'button'); var go = function () { picked = i; sides.forEach(function (cc, j) { cc.setAttribute('aria-pressed', String(j === i)); }); }; c.addEventListener('click', go); c.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); }); });
        tops.forEach(function (c, j) { c.tabIndex = 0; c.setAttribute('role', 'button'); var go = function () { if (picked == null) { F.say('Tap a thing in the top row first.'); return; } pairs[picked] = j; sides[picked].querySelector('figcaption').textContent = (picked + 1) + ' → ' + LETTERS[j]; picked = null; sides.forEach(function (cc) { cc.setAttribute('aria-pressed', 'false'); }); }; c.addEventListener('click', go); c.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); }); });
        btn(F.ctl, 'Check', function () { var right = 0; sides.forEach(function (c, i) { var ok2 = pairs[i] != null && order[pairs[i]] === i; c.classList.toggle('ok', ok2); c.classList.toggle('no', pairs[i] != null && !ok2); if (ok2) right++; }); F.say(right === things.length ? okMark(true) + ' All matched!' : right + ' of ' + things.length + ' match. Fix the others.'); }, 'pri');
      }
    } else { // fly: a little scene seen from the side, then from above
      var scene = o.scene || ['table', 'chair', 'cup'], wv = 360, hv = 200, svg = svgRoot(wv, hv, 'ggb-fly'); box.appendChild(svg);
      s('rect', { x: 0, y: 0, width: wv, height: hv, rx: 12, class: 'ggb-bgside' }, svg);
      var sideG = g(svg), topG = g(svg, { opacity: 0 });
      s('line', { x1: 10, y1: 172, x2: 350, y2: 172, class: 'ggb-floor' }, sideG);
      scene.forEach(function (k, i) { thing(sideG, k, 'side', 30 + i * 110, 72, 100); });
      s('rect', { x: 8, y: 8, width: wv - 16, height: hv - 16, rx: 10, class: 'ggb-bgtop' }, topG);
      scene.forEach(function (k, i) { thing(topG, k, 'top', 30 + i * 110, 50, 100); });
      var bird = text(svg, 330, 40, '🐦', 'ggb-bird');
      function set(t) { sideG.setAttribute('opacity', 1 - t); topG.setAttribute('opacity', t); bird.setAttribute('y', 170 - 140 * t); F.alt(svg, t < 0.5 ? 'A ' + scene.join(', a ') + ', seen from the side.' : 'The same things seen from above, the way a bird sees them.'); }
      set(o.t || 0);
      if (F.interactive) V.slider(F.ctl, { label: 'Fly up', min: 0, max: 1, step: 0.05, value: o.t || 0, fmt: function (v) { return v < 0.3 ? 'on the ground' : v < 0.7 ? 'flying up' : 'looking down'; }, input: set });
    }
    return {};
  });

  // ---- map symbols (for gg-town and keys), each drawn in a 40 x 40 box centered on 0,0
  var SYM = {
    house: function (p) { s('rect', { x: -11, y: -4, width: 22, height: 16, class: 'ggk-wall' }, p); s('path', { d: 'M-15 -3 L0 -16 L15 -3 Z', class: 'ggk-roof' }, p); s('rect', { x: -3, y: 4, width: 6, height: 8, class: 'ggk-door' }, p); },
    school: function (p) { s('rect', { x: -16, y: -6, width: 32, height: 20, class: 'ggk-school' }, p); s('path', { d: 'M-18 -5 L0 -14 L18 -5 Z', class: 'ggk-roof' }, p); s('path', { d: 'M0 -14 V-22', class: 'ggk-pole' }, p); s('path', { d: 'M0 -22 H8 L6 -19 L8 -16 H0', class: 'ggk-flag' }, p); s('rect', { x: -3, y: 4, width: 6, height: 10, class: 'ggk-door' }, p); s('rect', { x: -12, y: -1, width: 6, height: 5, class: 'ggk-win' }, p); s('rect', { x: 6, y: -1, width: 6, height: 5, class: 'ggk-win' }, p); },
    tree: function (p) { s('rect', { x: -2.5, y: 4, width: 5, height: 11, class: 'ggk-trunk' }, p); s('circle', { cx: 0, cy: -3, r: 11, class: 'ggk-leaf' }, p); },
    park: function (p) { s('rect', { x: -18, y: -18, width: 36, height: 36, rx: 6, class: 'ggk-parkbg' }, p); [[-8, -6], [8, -8], [0, 8]].forEach(function (c) { s('circle', { cx: c[0], cy: c[1], r: 7, class: 'ggk-leaf' }, p); }); },
    pond: function (p) { s('ellipse', { cx: 0, cy: 2, rx: 17, ry: 11, class: 'ggk-water' }, p); s('path', { d: 'M-8 0 q4 -3 8 0 M2 6 q4 -3 8 0', class: 'ggk-ripple' }, p); },
    lake: function (p) { s('path', { d: 'M-19 -6 Q-14 -19 2 -16 Q18 -18 19 -2 Q20 14 4 17 Q-14 19 -18 8 Z', class: 'ggk-water' }, p); },
    store: function (p) { s('rect', { x: -15, y: -8, width: 30, height: 22, class: 'ggk-wall' }, p); for (var i = 0; i < 5; i++) s('rect', { x: -16 + i * 6.4, y: -13, width: 6.4, height: 7, class: i % 2 ? 'ggk-awn2' : 'ggk-awn' }, p); s('rect', { x: -4, y: 3, width: 8, height: 11, class: 'ggk-door' }, p); },
    library: function (p) { s('rect', { x: -16, y: -8, width: 32, height: 22, class: 'ggk-school' }, p); s('path', { d: 'M-18 -8 L0 -17 L18 -8 Z', class: 'ggk-roof3' }, p); s('path', { d: 'M-8 -2 Q-4 -5 0 -2 Q4 -5 8 -2 V9 Q4 6 0 9 Q-4 6 -8 9 Z', class: 'ggk-book' }, p); s('path', { d: 'M0 -2 V9', class: 'ggk-fold' }, p); },
    hospital: function (p) { s('rect', { x: -15, y: -15, width: 30, height: 30, rx: 5, class: 'ggk-hosp' }, p); text(p, 0, 7, 'H', 'ggk-H', { 'text-anchor': 'middle' }); },
    fire: function (p) { s('rect', { x: -16, y: -10, width: 32, height: 24, class: 'ggk-fire' }, p); s('rect', { x: -11, y: -2, width: 22, height: 16, rx: 2, class: 'ggk-firedoor' }, p); s('path', { d: 'M0 -18 C6 -12 4 -10 3 -8 C6 -9 7 -12 6 -14 C10 -10 8 -4 0 -4 C-8 -4 -9 -11 -4 -15 C-4 -12 -2 -10 0 -10 C-2 -13 -2 -16 0 -18 Z', class: 'ggk-flame' }, p); },
    post: function (p) { s('rect', { x: -15, y: -10, width: 30, height: 20, rx: 2, class: 'ggk-env' }, p); s('path', { d: 'M-15 -10 L0 2 L15 -10', class: 'ggk-envline' }, p); },
    farm: function (p) { s('rect', { x: -14, y: -4, width: 28, height: 18, class: 'ggk-barn' }, p); s('path', { d: 'M-17 -3 L-10 -13 H10 L17 -3 Z', class: 'ggk-barnroof' }, p); s('path', { d: 'M-5 14 V3 H5 V14 M-5 3 L5 14 M5 3 L-5 14', class: 'ggk-barnx' }, p); },
    playground: function (p) { s('path', { d: 'M-15 14 L-9 -12 L-3 14 M-9 -12 H12 M12 -12 L16 14 M12 -12 L8 14', class: 'ggk-swing' }, p); s('path', { d: 'M1 -12 V4 M7 -12 V4', class: 'ggk-rope' }, p); s('rect', { x: 0, y: 4, width: 8, height: 3, class: 'ggk-seatbar' }, p); },
    busstop: function (p) { s('path', { d: 'M0 -2 V16', class: 'ggk-pole' }, p); s('rect', { x: -10, y: -18, width: 20, height: 16, rx: 3, class: 'ggk-sign' }, p); s('rect', { x: -6, y: -15, width: 12, height: 8, rx: 2, class: 'ggk-bus' }, p); },
    mountain: function (p) { s('path', { d: 'M-19 14 L-4 -14 L4 -2 L9 -9 L19 14 Z', class: 'ggk-mtn' }, p); s('path', { d: 'M-8 -6 L-4 -14 L0 -7 Z', class: 'ggk-snow' }, p); },
    tent: function (p) { s('path', { d: 'M-16 13 L0 -15 L16 13 Z', class: 'ggk-tent' }, p); s('path', { d: 'M0 -15 L-4 13 H4 Z', class: 'ggk-tentdoor' }, p); },
    picnic: function (p) { s('rect', { x: -14, y: -8, width: 28, height: 6, class: 'ggk-wood' }, p); s('rect', { x: -16, y: 4, width: 32, height: 4, class: 'ggk-wood2' }, p); s('path', { d: 'M-10 -2 L-13 14 M10 -2 L13 14', class: 'ggk-legs' }, p); },
    police: function (p) { s('path', { d: 'M0 -16 L14 -10 V2 C14 10 6 15 0 17 C-6 15 -14 10 -14 2 V-10 Z', class: 'ggk-shield' }, p); s('path', { d: 'M0 -7 L2.4 -1.5 L8 -1.2 L3.6 2.4 L5 8 L0 5 L-5 8 L-3.6 2.4 L-8 -1.2 L-2.4 -1.5 Z', class: 'ggk-star' }, p); },
    field: function (p) { s('rect', { x: -17, y: -14, width: 34, height: 28, rx: 3, class: 'ggk-parkbg' }, p); s('path', { d: 'M0 -9 L9 0 L0 9 L-9 0 Z', class: 'ggk-diamond' }, p); },
    town: function (p) { s('rect', { x: -16, y: -2, width: 32, height: 16, class: 'ggk-school' }, p); s('path', { d: 'M-10 -2 A10 10 0 0 1 10 -2 Z', class: 'ggk-dome' }, p); for (var i = 0; i < 4; i++) s('rect', { x: -12 + i * 7, y: 1, width: 3, height: 12, class: 'ggk-col' }, p); },
    river: function (p) { s('path', { d: 'M-19 -10 C-6 -16 -4 0 6 -4 S16 6 19 4 V12 C14 14 8 6 0 10 S-12 0 -19 4 Z', class: 'ggk-water' }, p); },
    road: function (p) { s('rect', { x: -19, y: -6, width: 38, height: 12, class: 'ggk-road' }, p); s('path', { d: 'M-17 0 H17', class: 'ggk-roadline' }, p); },
    rail: function (p) { s('path', { d: 'M-19 -4 H19 M-19 4 H19', class: 'ggk-rail' }, p); for (var i = -16; i <= 16; i += 6) s('path', { d: 'M' + i + ' -7 V7', class: 'ggk-tie' }, p); },
    bridge: function (p) { s('rect', { x: -19, y: -12, width: 38, height: 24, class: 'ggk-water' }, p); s('rect', { x: -8, y: -14, width: 16, height: 28, class: 'ggk-road' }, p); s('path', { d: 'M-9 -14 V14 M9 -14 V14', class: 'ggk-rail' }, p); }
  };
  function sym(parent, kind, x, y, size) { var gg = g(parent, { transform: 'translate(' + x + ',' + y + ') scale(' + (size || 40) / 40 + ')', class: 'ggk-sym ggk-sym-' + kind }); if (SYM[kind]) SYM[kind](gg); return gg; }
  GV.sym = sym; GV.SYM = SYM;
  // a compass rose: 4 or 8 points; hide: a point whose letter is replaced by '?'
  function rose(parent, x, y, r, o) {
    o = o || {}; var gg = g(parent, { transform: 'translate(' + x + ',' + y + ')', class: 'ggk-rose' }), pts = o.points === 8 ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] : ['N', 'E', 'S', 'W'];
    s('circle', { r: r * 0.62, class: 'ggk-rosering' }, gg);
    pts.forEach(function (d, i) {
      var a = (o.points === 8 ? i * 45 : i * 90) * M.PI / 180, len = d.length === 1 ? r : r * 0.62, w = d.length === 1 ? r * 0.2 : r * 0.13;
      var tip = [M.sin(a) * len, -M.cos(a) * len], l = [M.sin(a - M.PI / 2) * w, -M.cos(a - M.PI / 2) * w], rr = [-l[0], -l[1]];
      s('path', { d: 'M0 0 L' + l[0] + ' ' + l[1] + ' L' + tip[0] + ' ' + tip[1] + ' Z', class: 'ggk-roseA' + (o.hi === d ? ' ggk-rosehi' : '') }, gg);
      s('path', { d: 'M0 0 L' + rr[0] + ' ' + rr[1] + ' L' + tip[0] + ' ' + tip[1] + ' Z', class: 'ggk-roseB' + (o.hi === d ? ' ggk-rosehi' : '') }, gg);
      if (o.letters !== false) { var lr = len + (d.length === 1 ? r * 0.24 : r * 0.3), lab = o.hide === d || (o.hideAll && d !== 'N') ? '?' : (o.words && d.length === 1 ? { N: 'North', E: 'East', S: 'South', W: 'West' }[d] : d);
        text(gg, M.sin(a) * lr, -M.cos(a) * lr + 4.5, lab, 'ggk-roselab' + (d.length > 1 ? ' ggk-roselab2' : '') + (lab === '?' ? ' ggk-ask' : ''), { 'text-anchor': 'middle' }); }
    });
    s('circle', { r: r * 0.08, class: 'ggk-rosedot' }, gg);
    return gg;
  }
  GV.rose = rose;

  // ---- gg-town: a picture map on a grid
  V.register('gg-town', function (el, o) {
    var F = frame(el, o, 'town'), L = o.layout === 'room' ? 'room' : (G.TOWNS[o.layout] ? o.layout : 'maple'), room = L === 'room';
    var T = room ? G.ROOM : G.TOWNS[L], cols = o.cols || T.cols, rows = o.rows || T.rows, cell = room ? 70 : 62, gridOn = o.grid !== false && !room || o.grid === true;
    var places = (o.places || (room ? T.things : T.places)).map(function (p) { return Array.isArray(p) ? { kind: p[0], c: p[1], r: p[2], w: p[3], h: p[4] } : p; });
    var names = Object.assign({}, room ? G.ROOM_NAMES : G.SYMBOLS, o.names || {});
    var mode = o.mode || 'show', you = o.you ? o.you.slice() : null, pick = null, checked = false;
    var mL = gridOn ? 26 : 10, mT = (gridOn ? 26 : 10) + (o.title ? 22 : 0), keyW = o.key === false || room && !o.key ? 0 : 150;
    var roseW = !keyW && o.compass !== false && !room ? 96 : 0;   // no key: the compass rose gets its own column
    var mapW = cols * cell, mapH = rows * cell, W0 = mL + mapW + 10 + keyW + roseW, H0 = mT + mapH + (o.scale ? 36 : 12);
    var box = h('div', 'ggk-box'); F.body.appendChild(box);
    function cellXY(c, r) { return [mL + c * cell, mT + r * cell]; }
    function draw() {
      box.innerHTML = '';
      var narrow = (box.clientWidth || 600) < 480 && keyW, nk = keyKinds().length, Wv = narrow ? mL + mapW + 10 : W0;
      var Hv = narrow ? H0 + 30 + (o.compass !== false && !room ? 64 : 0) + M.ceil(nk / 2) * 30 : M.max(H0, keyW ? mT + (o.compass !== false && !room ? 96 : 0) + 34 + nk * 30 + 8 : 0);
      var svg = svgRoot(Wv, Hv, 'ggk-svg'); box.appendChild(svg);
      if (o.title) text(svg, mL, 16, o.title, 'ggk-title');
      s('rect', { x: mL, y: mT, width: mapW, height: mapH, rx: 8, class: room ? 'ggk-floor' : 'ggk-grass' }, svg);
      if (room) {
        s('rect', { x: mL, y: mT, width: mapW, height: mapH, rx: 4, class: 'ggk-walls' }, svg);
      } else {
        (T.river || []).forEach(function (rc) { var p = cellXY(rc[0], rc[1]); s('rect', { x: p[0] + 8, y: p[1] - 1, width: cell - 16, height: cell + 2, class: 'ggk-riverband' }, svg); });
        // roads on every cell edge (skipping water)
        for (var c = 0; c <= cols; c++) s('line', { x1: mL + c * cell, y1: mT, x2: mL + c * cell, y2: mT + mapH, class: 'ggk-street' }, svg);
        for (var r = 0; r <= rows; r++) { var y = mT + r * cell; (function () { var segs = []; for (var cc = 0; cc < cols; cc++) { var wet = (T.river || []).some(function (q) { return q[0] === cc && (q[1] === r || q[1] === r - 1); }) && !(T.bridges || []).some(function (q) { return q[0] === cc && q[1] === r; }); if (!wet) segs.push(cc); } segs.forEach(function (cc) { s('line', { x1: mL + cc * cell, y1: y, x2: mL + (cc + 1) * cell, y2: y, class: 'ggk-street' }, svg); }); })(); }
        (T.bridges || []).forEach(function (b) { var p = cellXY(b[0], b[1]); s('rect', { x: p[0] + 6, y: p[1] - 7, width: cell - 12, height: 14, rx: 2, class: 'ggk-bridge' }, svg); });
        for (c = 0; c <= cols; c++) s('line', { x1: mL + c * cell, y1: mT, x2: mL + c * cell, y2: mT + mapH, class: 'ggk-streetline' }, svg);
      }
      // places
      places.forEach(function (p, i) {
        var xy = cellXY(p.c, p.r), pw = (p.w || 1) * cell, ph = (p.h || 1) * cell, cx = xy[0] + pw / 2, cy = xy[1] + ph / 2;
        if (room) { drawRoomThing(svg, p, xy, pw, ph); }
        else if (p.kind === 'lake' || p.kind === 'pond') { s('ellipse', { cx: cx, cy: cy, rx: cell * 0.44, ry: cell * 0.34, class: 'ggk-water' }, svg); }
        else if (p.kind === 'park') { s('rect', { x: xy[0] + 5, y: xy[1] + 5, width: cell - 10, height: cell - 10, rx: 8, class: 'ggk-parkbg' }, svg); [[-12, -8], [11, -10], [0, 10]].forEach(function (d) { s('circle', { cx: cx + d[0], cy: cy + d[1], r: 9, class: 'ggk-leaf' }, svg); }); }
        else sym(svg, p.kind, cx, cy, cell * 0.72);
        var lab = o.marks && (o.marks[p.kind] || o.marks[i]); var ask = o.ask === p.kind || (Array.isArray(o.ask) && o.ask[0] === p.c && o.ask[1] === p.r);
        if (lab || ask) { s('circle', { cx: xy[0] + pw - 11, cy: xy[1] + 11, r: 10, class: 'gg-markbg' }, svg); text(svg, xy[0] + pw - 11, xy[1] + 15.5, ask ? '?' : lab, 'gg-mark', { 'text-anchor': 'middle' }); }
        if (o.labels && !(F.quiet && ask)) text(svg, cx, xy[1] + ph - 3, names[p.kind] || p.kind, 'gg-lab ggk-plab', { 'text-anchor': 'middle' });
      });
      // grid letters and numbers
      if (gridOn) for (c = 0; c < cols; c++) { text(svg, mL + c * cell + cell / 2, mT - 8, LETTERS[c], 'ggk-gridlab', { 'text-anchor': 'middle' }); }
      if (gridOn) for (r = 0; r < rows; r++) { text(svg, mL - 13, mT + r * cell + cell / 2 + 5, String(r + 1), 'ggk-gridlab', { 'text-anchor': 'middle' }); }
      if (gridOn && o.gridLines !== false) { for (c = 1; c < cols; c++) s('line', { x1: mL + c * cell, y1: mT, x2: mL + c * cell, y2: mT + mapH, class: 'ggk-gridline' }, svg); for (r = 1; r < rows; r++) s('line', { x1: mL, y1: mT + r * cell, x2: mL + mapW, y2: mT + r * cell, class: 'ggk-gridline' }, svg); }
      if (o.highlightCell) { var hc = cellXY(o.highlightCell[0], o.highlightCell[1]); s('rect', { x: hc[0] + 2, y: hc[1] + 2, width: cell - 4, height: cell - 4, rx: 6, class: 'ggk-hicell' }, svg); }
      // route
      if (o.route && o.route.length > 1) { var d = o.route.map(function (q, i) { var p = cellXY(q[0], q[1]); return (i ? 'L' : 'M') + (p[0] + cell / 2) + ' ' + (p[1] + cell / 2); }).join(' '); s('path', { d: d, class: 'ggk-route' }, svg); var e = cellXY(o.route[o.route.length - 1][0], o.route[o.route.length - 1][1]); s('circle', { cx: e[0] + cell / 2, cy: e[1] + cell / 2, r: 5, class: 'ggk-routeend' }, svg); }
      // the walker
      if (you) { var yp = cellXY(you[0], you[1]); var yg = g(svg, { transform: 'translate(' + (yp[0] + cell / 2) + ',' + (yp[1] + cell / 2) + ')', class: 'ggk-you' }); s('circle', { r: 13, class: 'ggk-youbg' }, yg); s('circle', { cy: -3, r: 4.5, class: 'ggk-face' }, yg); s('path', { d: 'M-6 9 Q0 -2 6 9 Z', class: 'ggk-body' }, yg); }
      if (pick) { var pp = cellXY(pick[0], pick[1]); s('rect', { x: pp[0] + 3, y: pp[1] + 3, width: cell - 6, height: cell - 6, rx: 6, class: 'ggk-pick' + (checked ? (o.answer && pick[0] === o.answer[0] && pick[1] === o.answer[1] ? ' ok' : ' no') : '') }, svg); }
      // compass rose and scale bar
      if (o.compass !== false && !room) { var rx = narrow ? mL + mapW - 30 : mL + mapW + 10 + (keyW ? keyW / 2 : roseW / 2), ry = narrow ? mT + mapH + 4 : mT + 44; if (!narrow) rose(svg, rx, ry, 30, { points: o.points || 4, hide: o.hideDir }); else rose(svg, mL + mapW / 2, mT + mapH + (o.scale ? 36 : 12) + 32, 22, { points: o.points || 4, hide: o.hideDir }); }
      if (o.scale) { var sy = mT + mapH + 22, n = o.scale.blocks || 2; s('line', { x1: mL, y1: sy, x2: mL + n * cell, y2: sy, class: 'ggk-scalebar' }, svg); for (var k = 0; k <= n; k++) s('line', { x1: mL + k * cell, y1: sy - 5, x2: mL + k * cell, y2: sy + 5, class: 'ggk-scalebar' }, svg); text(svg, mL + n * cell + 8, sy + 5, (o.scale.label || (n + ' ' + (o.scale.unit || 'blocks'))), 'ggk-scalelab'); }
      // key
      if (keyW) {
        var kinds = keyKinds(), kx = narrow ? mL : mL + mapW + 14, ky = narrow ? mT + mapH + (o.scale ? 40 : 14) + (o.compass !== false && !room ? 64 : 0) : mT + (o.compass !== false && !room ? 96 : 0), perCol = narrow ? 2 : 1;
        s('rect', { x: kx - 4, y: ky - 4, width: narrow ? mapW : keyW - 8, height: 26 + M.ceil(kinds.length / perCol) * 30, rx: 8, class: 'ggk-keybox' }, svg);
        text(svg, kx + 4, ky + 13, o.keyTitle || 'Map Key', 'ggk-keytitle');
        kinds.forEach(function (k, i) { var col = i % perCol, row = M.floor(i / perCol), x = kx + 8 + col * (mapW / 2), y = ky + 34 + row * 30; sym(svg, k, x + 10, y, 26); text(svg, x + 28, y + 5, F.quiet && o.ask === k && o.hideKeyName ? '?' : (names[k] || k), 'ggk-keylab'); });
      }
      F.alt(svg, o.alt || describe());
      if (mode === 'find' && F.interactive && !F.quiet) bindFind(svg);
    }
    function keyKinds() { if (Array.isArray(o.key)) return o.key; var seen = []; places.forEach(function (p) { if (seen.indexOf(p.kind) < 0 && SYM[p.kind]) seen.push(p.kind); }); return seen; }
    function describe() {
      if (room) return 'A map of a bedroom seen from above' + (F.quiet ? '.' : ': ' + places.map(function (p) { return names[p.kind]; }).join(', ') + '.');
      var t = 'A picture map of a town' + (gridOn ? ' on a grid with columns A to ' + LETTERS[cols - 1] + ' and rows 1 to ' + rows : '') + (o.compass !== false ? ', with a compass rose' : '') + (keyW ? ' and a map key' : '');
      if (!F.quiet) t += '. It shows ' + places.map(function (p) { return names[p.kind] + (gridOn ? ' in ' + LETTERS[p.c] + (p.r + 1) : ''); }).join(', ');
      if (o.ask) t += '. A question mark marks one place';
      return t + '.';
    }
    function drawRoomThing(svg, p, xy, pw, ph) {
      var x = xy[0], y = xy[1];
      if (p.kind === 'window') { s('rect', { x: x + 8, y: mT - 5, width: pw - 16, height: 10, class: 'ggk-window' }, svg); return; }
      if (p.kind === 'door') { s('rect', { x: x + 8, y: mT + mapH - 5, width: pw - 16, height: 10, class: 'ggk-floor' }, svg); s('path', { d: 'M' + (x + 8) + ' ' + (mT + mapH) + ' A' + (pw - 16) + ' ' + (pw - 16) + ' 0 0 1 ' + (x + pw - 8) + ' ' + (mT + mapH - (pw - 16)), class: 'ggk-doorswing' }, svg); return; }
      if (p.kind === 'bed') { s('rect', { x: x + 6, y: y + 6, width: pw - 12, height: ph - 12, rx: 6, class: 'ggk-blanket' }, svg); s('rect', { x: x + 12, y: y + 10, width: 34, height: ph - 20, rx: 6, class: 'ggk-pillow' }, svg); return; }
      if (p.kind === 'rug') { s('rect', { x: x + 6, y: y + 6, width: pw - 12, height: ph - 12, rx: 10, class: 'ggk-rug' }, svg); s('rect', { x: x + 14, y: y + 14, width: pw - 28, height: ph - 28, rx: 6, class: 'ggk-rug2' }, svg); return; }
      if (p.kind === 'desk') { s('rect', { x: x + 6, y: y + 8, width: pw - 12, height: ph - 22, rx: 3, class: 'ggk-wood' }, svg); s('rect', { x: x + 16, y: y + 16, width: 22, height: 14, rx: 2, class: 'ggk-book' }, svg); return; }
      if (p.kind === 'chair') { thing(svg, 'chair', 'top', x + 10, y + 10, pw - 20); return; }
      if (p.kind === 'toybox') { s('rect', { x: x + 10, y: y + 12, width: pw - 20, height: ph - 24, rx: 4, class: 'ggk-toybox' }, svg); s('circle', { cx: x + pw / 2 - 8, cy: y + ph / 2, r: 6, class: 'ggk-ball' }, svg); s('rect', { x: x + pw / 2 + 2, y: y + ph / 2 - 6, width: 11, height: 11, class: 'ggk-block' }, svg); return; }
      if (p.kind === 'shelf') { s('rect', { x: x + pw - 22, y: y + 6, width: 16, height: ph - 12, class: 'ggk-wood2' }, svg); for (var i = 0; i < 5; i++) s('rect', { x: x + pw - 20, y: y + 12 + i * (ph - 24) / 5, width: 12, height: (ph - 24) / 5 - 3, class: i % 2 ? 'ggk-book' : 'ggk-book2' }, svg); return; }
      if (p.kind === 'lamp') { thing(svg, 'lamp', 'top', x + 14, y + 14, pw - 28); return; }
      if (p.kind === 'plant') { s('circle', { cx: x + pw / 2, cy: y + ph / 2, r: 14, class: 'ggk-pot' }, svg); [[0, -10], [9, 4], [-9, 4], [0, 0]].forEach(function (d) { s('circle', { cx: x + pw / 2 + d[0], cy: y + ph / 2 + d[1], r: 8, class: 'ggk-leaf' }, svg); }); return; }
    }
    function bindFind(svg) {
      svg.style.cursor = 'pointer';
      svg.addEventListener('click', function (e) { var r = svg.getBoundingClientRect(), k = svg.viewBox.baseVal.width / r.width, x = (e.clientX - r.left) * k - mL, y = (e.clientY - r.top) * k - mT; var c = M.floor(x / cell), rr = M.floor(y / cell); if (c < 0 || rr < 0 || c >= cols || rr >= rows) return; pick = [c, rr]; checked = false; draw(); F.say('You picked square ' + LETTERS[c] + (rr + 1) + '.'); });
    }
    draw();
    if (mode === 'find' && F.interactive && !F.quiet) btn(F.ctl, 'Check', function () { if (!pick) { F.say('Tap a square first.'); return; } checked = true; draw(); var ok = o.answer && pick[0] === o.answer[0] && pick[1] === o.answer[1]; F.say(ok ? okMark(true) + ' Yes, ' + LETTERS[pick[0]] + (pick[1] + 1) + '.' : okMark(false) + ' Look again: find the letter at the top, then the number on the side.'); }, 'pri');
    if (mode === 'walk' && F.interactive) {
      var start = you ? you.slice() : [0, 0]; you = you || [0, 0]; var steps = [];
      [['N', 'North ▲', [0, -1]], ['W', '◀ West', [-1, 0]], ['E', 'East ▶', [1, 0]], ['S', 'South ▼', [0, 1]]].forEach(function (b) {
        btn(F.ctl, b[1], function () { var nx = you[0] + b[2][0], ny = you[1] + b[2][1]; if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) { F.say('That is the edge of the map.'); return; } you = [nx, ny]; steps.push(b[0]); draw(); var here = places.filter(function (p) { return p.c === nx && p.r === ny; })[0]; F.say('You walked ' + steps.length + ' block' + (steps.length > 1 ? 's' : '') + '. ' + (here ? 'You are at the ' + (names[here.kind] || here.kind).toLowerCase() + '.' : '')); });
      });
      btn(F.ctl, 'Start over', function () { you = start.slice(); steps = []; draw(); F.say(''); });
    }
    var lastW = box.clientWidth; if ('ResizeObserver' in W) new ResizeObserver(function () { if ((box.clientWidth < 480) !== (lastW < 480)) { lastW = box.clientWidth; draw(); } }).observe(box);
    return {};
  });

  // ---- gg-compass
  V.register('gg-compass', function (el, o) {
    var F = frame(el, o, 'compass'), box = h('div', 'ggc-box'); F.body.appendChild(box);
    var pts = o.points === 8 ? 8 : 4, turn = o.turn || 0;
    function draw() {
      box.innerHTML = '';
      if (o.sun) { drawSun(); return; }
      if (o.around) { drawAround(); return; }
      var svg = svgRoot(260, 260, 'ggc-svg'); box.appendChild(svg);
      if (o.needle) {
        s('circle', { cx: 130, cy: 130, r: 118, class: 'ggc-case' }, svg);
        var gg = g(svg, { transform: 'rotate(' + turn + ' 130 130)' }); rose(gg, 130, 130, 78, { points: pts, hide: o.ask, words: o.words });
        var nd = g(svg, { transform: 'translate(130,130)' }); s('path', { d: 'M0 -84 L9 0 L-9 0 Z', class: 'ggc-north' }, nd); s('path', { d: 'M0 84 L9 0 L-9 0 Z', class: 'ggc-south' }, nd); s('circle', { r: 6, class: 'ggk-rosedot' }, nd);
        F.alt(svg, 'A compass. The needle points north. ' + (M.abs(((turn % 360) + 360) % 360) < 5 ? 'The N on the dial lines up with the needle.' : 'The dial is turned, so the N does not line up with the needle yet.'));
      } else {
        rose(svg, 130, 130, 100, { points: pts, hide: o.ask, hi: F.quiet ? null : o.highlight, words: o.words, hideAll: o.hideAll });
        if (o.arrow) { var a = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 }[o.arrow] * M.PI / 180; s('path', { d: 'M130 130 L' + (130 + M.sin(a) * 92) + ' ' + (130 - M.cos(a) * 92), class: 'ggc-arrow' }, svg); }
        F.alt(svg, 'A compass rose with ' + pts + ' points' + (o.ask ? '; one direction is shown as a question mark' : '') + (o.arrow && !F.quiet ? '; an arrow points ' + o.arrow : o.arrow ? '; an arrow points one way' : '') + '.');
      }
    }
    function drawAround() { // a home in the middle and things around it
      var svg = svgRoot(320, 320, 'ggc-svg'); box.appendChild(svg);
      s('rect', { x: 0, y: 0, width: 320, height: 320, rx: 14, class: 'ggk-grass' }, svg);
      var center = o.center || 'house'; sym(svg, center, 160, 160, 54);
      var off = { N: [0, -1], NE: [1, -1], E: [1, 0], SE: [1, 1], S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1] };
      Object.keys(o.around).forEach(function (d) { var v = off[d]; if (!v) return; var x = 160 + v[0] * 110, y = 160 + v[1] * 110; sym(svg, o.around[d], x, y, 48); if (o.labels) text(svg, x, y + 34, G.SYMBOLS[o.around[d]] || o.around[d], 'gg-lab ggk-plab', { 'text-anchor': 'middle' }); });
      rose(svg, 38, 38, 22, { points: 4, letters: true });
      F.alt(svg, 'A ' + (G.SYMBOLS[center] || center).toLowerCase() + ' in the middle, with ' + Object.keys(o.around).map(function (d) { return (G.SYMBOLS[o.around[d]] || o.around[d]).toLowerCase() + (F.quiet ? '' : ' to the ' + d); }).join(', ') + '. North is up.');
    }
    function drawSun() { // a child facing north with the Sun in the morning, at noon or in the evening (Northern Hemisphere)
      var svg = svgRoot(360, 220, 'ggc-svg'); box.appendChild(svg);
      s('rect', { x: 0, y: 0, width: 360, height: 220, rx: 14, class: 'ggc-sky' + (o.sun === 'noon' ? '' : ' ggc-sky2') }, svg);
      s('rect', { x: 0, y: 150, width: 360, height: 70, class: 'ggk-grass' }, svg);
      var sx = o.sun === 'rise' ? 320 : o.sun === 'set' ? 40 : 180, sy = o.sun === 'noon' ? 40 : 128;
      s('circle', { cx: sx, cy: sy, r: 22, class: 'ggc-sun' }, svg); for (var i = 0; i < 8; i++) { var a = i * M.PI / 4; s('path', { d: 'M' + (sx + M.cos(a) * 27) + ' ' + (sy + M.sin(a) * 27) + ' L' + (sx + M.cos(a) * 35) + ' ' + (sy + M.sin(a) * 35), class: 'ggc-ray' }, svg); }
      text(svg, 20, 190, F.quiet && o.ask === 'W' ? '?' : 'West', 'ggk-roselab' + (F.quiet && o.ask === 'W' ? ' ggk-ask' : ''), {}); text(svg, 340, 190, F.quiet && o.ask === 'E' ? '?' : 'East', 'ggk-roselab' + (F.quiet && o.ask === 'E' ? ' ggk-ask' : ''), { 'text-anchor': 'end' });
      text(svg, 180, 210, F.quiet && o.ask === 'S' ? '?' : 'South (behind you)', 'ggk-roselab ggk-roselab2', { 'text-anchor': 'middle' });
      var kid = g(svg, { transform: 'translate(180,150)' }); s('circle', { cy: -38, r: 11, class: 'ggk-face' }, kid); s('path', { d: 'M-14 0 Q0 -40 14 0 Z', class: 'ggk-body2' }, kid);
      text(svg, 180, 75, 'North (ahead)', 'ggk-roselab ggk-roselab2', { 'text-anchor': 'middle' });
      F.alt(svg, 'A child faces north. ' + (F.quiet ? 'The Sun is low on one side.' : o.sun === 'rise' ? 'In the morning the Sun is low in the east, on the child\'s right.' : o.sun === 'set' ? 'In the evening the Sun is low in the west, on the child\'s left.' : 'At midday the Sun is high, toward the south (behind the child) in places north of the tropics.'));
    }
    draw();
    if (o.needle && F.interactive) V.slider(F.ctl, { label: 'Turn the compass dial', min: -180, max: 180, step: 5, value: turn, fmt: function (v) { return M.abs(v) < 5 ? 'lined up' : v + '°'; }, input: function (v) { turn = v; draw(); } });
    return {};
  });

  // ---- gg-nested: places inside places
  V.register('gg-nested', function (el, o) {
    var F = frame(el, o, 'nested'), lv = o.levels || ['Earth', 'North America', 'The United States', 'A state', 'A town or city', 'A neighborhood', 'A home'];
    var icons = o.icons || ['🌍', '🗺️', '🇺🇸', '📍', '🏙️', '🏘️', '🏠'];
    var n = lv.length, Wv = 420, step = 16, Hv = 6 + n * 30 + 40, svg = svgRoot(Wv, Hv, 'ggn-svg'); F.body.appendChild(svg);
    lv.forEach(function (name, i) {
      var x = 6 + i * step, y = 6 + i * 30, w = Wv - 12 - 2 * i * step, hh = (Hv - 6 - i * 4) - y;
      s('rect', { x: x, y: y, width: w, height: hh, rx: 12, class: 'ggn-box ggn-l' + (i % 7) + (o.highlight === i ? ' ggn-hi' : '') }, svg);
      var lab = (F.quiet && o.ask === i) ? '?' : name;
      text(svg, x + 12, y + 20, (icons[i] && !F.quiet && o.icons !== false ? icons[i] + ' ' : '') + lab, 'ggn-lab' + (lab === '?' ? ' ggk-ask' : ''));
    });
    F.alt(svg, 'Boxes inside boxes: ' + lv.map(function (x, i) { return F.quiet && o.ask === i ? 'a hidden place' : x; }).join(', inside it ') + '.');
    return {};
  });

  // ---- gg-sort: sort cards into groups (or put them in order)
  V.register('gg-sort', function (el, o) {
    var F = frame(el, o, 'sort'), bins = o.bins || ['Group 1', 'Group 2'], cards = (o.cards || []).map(function (c, i) { return typeof c === 'string' ? { text: c, i: i } : Object.assign({ i: i }, c); });
    if (o.shuffle !== false) cards = shuffle(cards, o.seed || 11);
    var where = {}, picked = null;
    if (o.solved) cards.forEach(function (c) { where[c.i] = c.bin; });
    var wrap = h('div', 'ggs-wrap'); F.body.appendChild(wrap);
    function draw(check) {
      wrap.innerHTML = '';
      if (F.quiet) { var ul = h('ol', 'ggs-list'); cards.forEach(function (c, j) { ul.appendChild(h('li', 'ggs-card', '<b>' + LETTERS[j] + '</b> ' + esc(c.text))); }); wrap.appendChild(ul); return; }
      var pool = h('div', 'ggs-pool'); wrap.appendChild(pool);
      var binEls = bins.map(function (b, k) { var be = h('div', 'ggs-bin'), hd = h('button', 'ggs-binhead', (k + 1) + '. ' + esc(b)); hd.type = 'button'; hd.addEventListener('click', function () { if (picked != null) { where[picked] = k; picked = null; draw(); } }); be.appendChild(hd); return be; });
      var row = h('div', 'ggs-bins'); binEls.forEach(function (b) { row.appendChild(b); }); wrap.appendChild(row);
      cards.forEach(function (c) {
        var b = h('button', 'ggs-card', esc(c.text)); b.type = 'button'; b.setAttribute('aria-pressed', String(picked === c.i));
        if (check && where[c.i] != null) b.classList.add(where[c.i] === c.bin ? 'ok' : 'no');
        b.addEventListener('click', function () { picked = picked === c.i ? null : c.i; draw(); });
        b.addEventListener('keydown', function (e) { var k = parseInt(e.key, 10); if (k >= 1 && k <= bins.length) { where[c.i] = k - 1; picked = null; draw(); } else if (e.key === '0') { delete where[c.i]; draw(); } });
        (where[c.i] != null ? binEls[where[c.i]] : pool).appendChild(b);
        if (check && where[c.i] != null && where[c.i] !== c.bin && c.why) b.title = c.why;
      });
      if (!pool.children.length) pool.appendChild(h('p', 'ggs-empty', 'All cards are sorted.'));
    }
    draw();
    if (F.interactive && !F.quiet) {
      F.ctl.appendChild(h('p', 'ggs-help', 'Tap a card, then a group. Keyboard: focus a card and press a group\'s number.'));
      btn(F.ctl, 'Check', function () { draw(true); var right = cards.filter(function (c) { return where[c.i] === c.bin; }).length, wrong = cards.filter(function (c) { return where[c.i] != null && where[c.i] !== c.bin; }); F.say(right === cards.length ? okMark(true) + ' All sorted!' : right + ' of ' + cards.length + ' are right.' + (wrong.length && wrong[0].why ? ' Hint: ' + esc(wrong[0].why) : '')); }, 'pri');
      if (o.reveal) btn(F.ctl, 'Show me', function () { cards.forEach(function (c) { where[c.i] = c.bin; }); draw(true); F.say('Here is how they sort.'); });
    }
    return {};
  });
  // ---- gg-landforms: two illustrated scenes, the coast (water shapes) and the land (high and low land)
  var SCENES = {
    coast: {
      alt: 'An illustrated map of a coast seen from above',
      draw: function (svg) {
        s('rect', { x: 0, y: 0, width: 640, height: 400, class: 'ggf-sea', 'data-f': 'ocean' }, svg);
        s('path', { d: 'M0 0 H640 V230 L600 236 L575 262 L548 300 L535 268 L510 240 L490 212 L450 178 L410 172 L380 190 L360 215 L350 240 L345 300 L336 348 L320 372 L302 356 L300 300 L304 240 L288 206 L262 192 L232 186 L222 196 L206 204 L190 196 L160 186 L122 182 L108 190 L104 216 L102 248 L125 262 L148 295 L152 335 L128 372 L80 386 L36 372 L18 330 L28 288 L58 262 L84 250 L86 216 L82 192 L55 178 L20 172 L0 170 Z', class: 'ggf-land', 'data-f': 'coast' }, svg);
        s('path', { d: 'M222 196 L206 204 L190 196 C192 208 198 218 206 220 C214 218 220 208 222 196 Z', class: 'ggf-delta', 'data-f': 'delta' }, svg);
        s('ellipse', { cx: 470, cy: 86, rx: 54, ry: 26, class: 'ggf-water', 'data-f': 'lake' }, svg);
        s('path', { d: 'M470 112 C462 130 445 150 432 175', class: 'ggf-river2' }, svg);
        s('path', { d: 'M182 22 C170 50 196 70 178 100 C160 130 196 150 200 170 C203 182 206 192 206 202', class: 'ggf-river', 'data-f': 'river' }, svg);
        s('path', { d: 'M70 50 C90 70 120 80 140 96 C155 108 168 110 178 104', class: 'ggf-river ggf-trib', 'data-f': 'tributary' }, svg);
        s('circle', { cx: 182, cy: 22, r: 6, class: 'ggf-spring', 'data-f': 'source' }, svg);
        s('path', { d: 'M372 300 L398 290 L432 300 L450 330 L440 358 L404 366 L378 350 L368 326 Z', class: 'ggf-land ggf-island2' }, svg);
        s('path', { d: 'M560 330 C575 318 610 320 618 340 C625 360 600 376 578 372 C556 368 548 345 560 330 Z', class: 'ggf-land', 'data-f': 'island' }, svg);
        [[60, 60], [250, 60], [300, 110], [560, 140], [380, 60], [600, 60], [120, 300], [60, 330]].forEach(function (p) { s('circle', { cx: p[0], cy: p[1], r: 7, class: 'ggk-leaf ggf-tree' }, svg); });
        s('path', { d: 'M520 40 L540 14 L560 40 Z M545 40 L560 22 L575 40 Z', class: 'ggk-mtn' }, svg);
      },
      f: { ocean: [210, 330], island: [589, 346], peninsula: [322, 268], isthmus: [94, 232], strait: [357, 344], bay: [430, 212], cape: [548, 290], coast: [600, 220], lake: [470, 90], river: [182, 140], source: [182, 22], mouth: [206, 204], delta: [206, 222], tributary: [110, 76] }
    },
    land: {
      alt: 'An illustrated landscape with mountains, a volcano, hills, a valley, a plain, a plateau and more',
      draw: function (svg) {
        s('rect', { x: 0, y: 0, width: 640, height: 400, class: 'ggf-sky' }, svg);
        s('path', { d: 'M0 262 L0 120 L60 70 L95 105 L140 35 L190 95 L225 70 L262 140 L280 262 Z', class: 'ggf-mtn', 'data-f': 'mountain' }, svg);
        s('path', { d: 'M122 60 L140 35 L160 62 L150 56 L140 66 L131 57 Z M48 82 L60 70 L72 84 L62 80 Z M215 82 L225 70 L235 88 L226 84 Z', class: 'ggk-snow' }, svg);
        s('path', { d: 'M136 52 C150 90 164 122 174 170 L192 168 C180 120 162 84 148 50 Z', class: 'ggf-glacier', 'data-f': 'glacier' }, svg);
        s('path', { d: 'M318 262 L356 128 L374 128 L414 262 Z', class: 'ggf-volcano', 'data-f': 'volcano' }, svg);
        s('path', { d: 'M356 128 Q365 120 374 128 Z', class: 'ggf-crater' }, svg);
        [[368, 108, 9], [378, 92, 11], [372, 74, 8]].forEach(function (c) { s('circle', { cx: c[0], cy: c[1], r: c[2], class: 'ggf-smoke' }, svg); });
        s('path', { d: 'M262 140 L280 262 L330 262 Z', class: 'ggf-mtn2' }, svg);
        s('path', { d: 'M396 262 Q420 196 452 232 Q480 186 520 262 Z', class: 'ggf-hill', 'data-f': 'hill' }, svg);
        s('path', { d: 'M0 262 H470 V400 H0 Z', class: 'ggf-plain', 'data-f': 'plain' }, svg);
        s('path', { d: 'M240 262 Q262 300 300 262 Z', class: 'ggf-valley', 'data-f': 'valley' }, svg);
        s('path', { d: 'M470 330 V206 L486 198 H640 V330 Z', class: 'ggf-plateau', 'data-f': 'plateau' }, svg);
        s('path', { d: 'M540 198 L556 230 L560 300 L572 300 L578 230 L594 198 Z', class: 'ggf-canyon', 'data-f': 'canyon' }, svg);
        s('path', { d: 'M470 330 H640 V400 H470 Z', class: 'ggf-desert', 'data-f': 'desert' }, svg);
        [[520, 360], [600, 372]].forEach(function (c) { s('path', { d: 'M' + c[0] + ' ' + (c[1] + 18) + ' V' + (c[1] - 16) + ' M' + (c[0] - 9) + ' ' + (c[1] - 4) + ' V' + (c[1] + 2) + ' H' + c[0] + ' M' + (c[0] + 9) + ' ' + (c[1] - 10) + ' V' + (c[1] - 2) + ' H' + c[0], class: 'ggf-cactus' }, svg); });
        s('path', { d: 'M470 214 C474 240 466 270 470 300', class: 'ggf-fall', 'data-f': 'waterfall' }, svg);
        s('path', { d: 'M470 302 C430 310 400 316 368 330', class: 'ggf-river' }, svg);
        s('ellipse', { cx: 300, cy: 338, rx: 72, ry: 22, class: 'ggf-water', 'data-f': 'lake' }, svg);
        s('path', { d: 'M182 172 C200 200 236 214 262 250 C276 270 250 296 262 318', class: 'ggf-river', 'data-f': 'river' }, svg);
        s('path', { d: 'M30 280 C80 300 150 290 200 286 C220 284 238 292 252 296', class: 'ggf-river ggf-trib', 'data-f': 'tributary' }, svg);
        s('circle', { cx: 182, cy: 172, r: 5.5, class: 'ggf-spring', 'data-f': 'source' }, svg);
        var forest = g(svg, { 'data-f': 'forest' });
        [[70, 318], [92, 330], [114, 318], [136, 332], [158, 320], [80, 345], [104, 352], [128, 348]].forEach(function (p) { s('path', { d: 'M' + p[0] + ' ' + (p[1] - 18) + ' L' + (p[0] + 9) + ' ' + p[1] + ' H' + (p[0] - 9) + ' Z', class: 'ggk-leaf' }, forest); s('rect', { x: p[0] - 1.5, y: p[1], width: 3, height: 5, class: 'ggk-trunk' }, forest); });
      },
      f: { mountain: [60, 120], glacier: [160, 120], volcano: [365, 205], hill: [458, 232], valley: [270, 270], plain: [200, 375], plateau: [610, 222], canyon: [566, 248], desert: [560, 388], waterfall: [470, 258], lake: [300, 342], river: [232, 232], tributary: [60, 290], source: [182, 172], mouth: [262, 318], forest: [112, 300] }
    }
  };
  V.register('gg-landforms', function (el, o) {
    var F = frame(el, o, 'land'), sc = SCENES[o.scene] ? o.scene : 'coast', S0 = SCENES[sc], mode = o.mode || 'show', pick = null, checked = false;
    var show = o.show || (F.quiet ? [] : Object.keys(S0.f)), box = h('div', 'ggf-box'); F.body.appendChild(box);
    var findList = mode === 'find' ? [].concat(o.find || shuffle(Object.keys(S0.f), o.seed || 4).slice(0, 5)) : [], fi = 0;
    function draw() {
      box.innerHTML = '';
      var svg = svgRoot(640, 400, 'ggf-svg'); box.appendChild(svg); S0.draw(svg);
      if (o.highlight) [].concat(o.highlight).forEach(function (k) { svg.querySelectorAll('[data-f="' + k + '"]').forEach(function (e) { e.classList.add('ggf-hi'); }); });
      if (pick && mode === 'find') svg.querySelectorAll('[data-f="' + pick + '"]').forEach(function (e) { e.classList.add(checked ? (pick === findList[fi] ? 'ggf-ok' : 'ggf-no') : 'ggf-hi'); });
      var labels = [];
      Object.keys(S0.f).forEach(function (k) {
        var p = S0.f[k], ask = o.ask === k, mk = o.marks && o.marks[k];
        if (ask || mk) labels.push({ x: p[0], y: p[1], t: ask ? '?' : mk, cls: 'gg-mark', pri: 20, mark: true });
        else if (show.indexOf(k) >= 0 && mode !== 'find') labels.push({ x: p[0], y: p[1] + 4, t: G.LANDFORMS[k] ? G.LANDFORMS[k].n : k, cls: 'gg-lab ggf-lab', pri: 5 });
      });
      placeLabels(svg, labels, 640, 400);
      F.alt(svg, S0.alt + (show.length && mode !== 'find' ? ', labeled: ' + show.map(function (k) { return G.LANDFORMS[k] ? G.LANDFORMS[k].n : k; }).join(', ') : '') + (o.ask ? '. A question mark points to one feature' : '') + '.');
      if (mode === 'find' && F.interactive) {
        svg.style.cursor = 'pointer';
        svg.addEventListener('click', function (e) { var t = e.target.closest('[data-f]'); if (!t) return; pick = t.getAttribute('data-f'); checked = false; draw(); F.say('You picked the ' + (G.LANDFORMS[pick] ? G.LANDFORMS[pick].n : pick) + '.'); });
      }
    }
    function prompt() { F.ctl.innerHTML = ''; if (!findList.length) return; F.ctl.appendChild(h('p', 'ggm-prompt', 'Tap the <b>' + esc(G.LANDFORMS[findList[fi]].n) + '</b>' + (findList.length > 1 ? ' <small>(' + (fi + 1) + ' of ' + findList.length + ')</small>' : ''))); btn(F.ctl, 'Check', function () { if (!pick) { F.say('Tap a part of the picture first.'); return; } checked = true; draw(); var ok = pick === findList[fi]; F.say(ok ? okMark(true) + ' Yes! ' + esc(cap1(G.LANDFORMS[pick].n)) + ': ' + esc(G.LANDFORMS[pick].d) + '.' : okMark(false) + ' That is the ' + esc(G.LANDFORMS[pick].n) + '. A ' + esc(G.LANDFORMS[findList[fi]].n) + ' is ' + esc(G.LANDFORMS[findList[fi]].d) + '.'); if (ok && fi < findList.length - 1) btn(F.ctl, 'Next ▶', function () { fi++; pick = null; draw(); prompt(); F.say(''); }, 'pri'); }, 'pri'); }
    function cap1(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
    draw(); if (mode === 'find' && F.interactive) prompt();
    if (mode === 'explore' && F.interactive) { box.addEventListener('click', function (e) { var t = e.target.closest('[data-f]'); if (!t) return; var k = t.getAttribute('data-f'), L = G.LANDFORMS[k]; if (L) F.say('<b>' + esc(cap1(L.n)) + '</b>: ' + esc(L.d) + '.'); }); }
    return {};
  });
  GV.SCENES = SCENES;
  /* ======================================================================================================== charts and models */
  var MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  function cToF(c) { return c * 9 / 5 + 32; }
  // ---- gg-climate: a climograph
  V.register('gg-climate', function (el, o) {
    var F = frame(el, o, 'climate'), list = o.compare ? o.compare : [o.type || (o.data ? null : 'Cfa')], us = o.units === 'us';
    var row = h('div', 'ggx-row'); F.body.appendChild(row);
    function one(key, i) {
      var c = key ? G.climate(key, o.hemi) : { t: o.data.t, p: o.data.p, n: o.data.name || '', key: null, hemi: o.hemi || 'N' };
      var t = c.t.map(function (v) { return us ? cToF(v) : v; }), p = c.p.map(function (v) { return us ? v / 25.4 : v; });
      var tmin = M.min(us ? 0 : -10, M.floor(M.min.apply(M, t) / 10) * 10), tmax = M.max(us ? 90 : 30, M.ceil(M.max.apply(M, t) / 10) * 10), pmax = us ? M.max(4, M.ceil(M.max.apply(M, p))) : M.max(100, M.ceil(M.max.apply(M, p) / 50) * 50);
      var Wv = 420, Hv = 260, x0 = 44, x1 = Wv - 44, y0 = 24, y1 = Hv - 28, bw = (x1 - x0) / 12;
      var fig = h('figure', 'ggx-cell'), svg = svgRoot(Wv, Hv, 'ggx-svg'); fig.appendChild(svg); row.appendChild(fig);
      function Y(v) { return y1 - (v - tmin) / (tmax - tmin) * (y1 - y0); } function YP(v) { return y1 - v / pmax * (y1 - y0); }
      for (var k = tmin; k <= tmax; k += 10) { s('line', { x1: x0, y1: Y(k), x2: x1, y2: Y(k), class: 'ggx-grid' + (k === (us ? 32 : 0) ? ' ggx-zero' : '') }, svg); text(svg, x0 - 5, Y(k) + 4, String(k).replace('-', '−'), 'ggx-ax ggx-axt', { 'text-anchor': 'end' }); }
      var pst = us ? 1 : (pmax > 300 ? 100 : 50); for (k = 0; k <= pmax; k += pst) text(svg, x1 + 5, YP(k) + 4, String(k), 'ggx-ax ggx-axp');
      p.forEach(function (v, j) { s('rect', { x: x0 + j * bw + 3, y: YP(v), width: bw - 6, height: y1 - YP(v), class: 'ggx-bar' }, svg); text(svg, x0 + j * bw + bw / 2, y1 + 15, MONTHS[j], 'ggx-ax', { 'text-anchor': 'middle' }); });
      s('path', { d: t.map(function (v, j) { return (j ? 'L' : 'M') + (x0 + j * bw + bw / 2) + ' ' + Y(v); }).join(' '), class: 'ggx-tline' }, svg);
      t.forEach(function (v, j) { s('circle', { cx: x0 + j * bw + bw / 2, cy: Y(v), r: 3.2, class: 'ggx-tdot' }, svg); });
      text(svg, x0 - 40, 13, us ? '°F' : '°C', 'ggx-ax ggx-axt'); text(svg, x1 + 2, 13, us ? 'inches' : 'mm', 'ggx-ax ggx-axp');
      var name = !F.quiet && c.n ? (key ? 'A typical ' + c.n + ' climate (' + key + ')' : c.n) : '';
      var cap = (list.length > 1 ? '<b>' + LETTERS[i] + '</b> ' : '') + esc(o.titles ? o.titles[i] : name);
      if (cap.trim()) fig.appendChild(h('figcaption', 'ggx-cap', cap));
      var T = c.t.reduce(function (a, b) { return a + b; }, 0) / 12, P = c.p.reduce(function (a, b) { return a + b; }, 0);
      F.alt(svg, (list.length > 1 ? 'Climograph ' + LETTERS[i] + ': ' : 'A climograph: ') + 'average temperature by month as a line and precipitation by month as bars. Temperatures run from ' + M.round(M.min.apply(M, t)) + ' to ' + M.round(M.max.apply(M, t)) + (us ? ' °F' : ' °C') + '; the wettest month has ' + M.round(M.max.apply(M, p) * (us ? 10 : 1)) / (us ? 10 : 1) + (us ? ' inches' : ' mm') + '.');
      return { T: T, P: P, c: c };
    }
    var res = list.map(one);
    if (!F.quiet && list.length === 1 && o.readout !== false) { var r = res[0]; F.say('Yearly average ' + (us ? M.round(cToF(r.T)) + ' °F' : M.round(r.T * 10) / 10 + ' °C') + ', total precipitation ' + (us ? M.round(r.P / 25.4) + ' inches' : M.round(r.P) + ' mm') + '. Köppen type: <b>' + G.koppen(r.c.t, r.c.p, r.c.hemi) + '</b>.'); }
    return {};
  });

  // ---- gg-biome: the biome chart (temperature against precipitation) or a small biome scene
  var BIOME_ORDER = ['rainforest', 'seasonal', 'savanna', 'desert', 'grassland', 'deciduous', 'temprain', 'taiga', 'tundra', 'ice'];
  function biomeScene(svg, b, x, y, w, hh) {
    var gg = g(svg, { transform: 'translate(' + x + ',' + y + ')' }), sky = { desert: 'ggy-skyhot', savanna: 'ggy-skyhot', tundra: 'ggy-skycold', ice: 'ggy-skycold', taiga: 'ggy-skycold' }[b] || 'ggy-sky';
    s('rect', { width: w, height: hh, rx: 10, class: sky }, gg);
    var ground = { desert: 'ggy-sand', savanna: 'ggy-dry', grassland: 'ggy-grass', tundra: 'ggy-tundra', ice: 'ggy-ice', taiga: 'ggy-snowg', shrubland: 'ggy-dry' }[b] || 'ggy-ground';
    s('rect', { y: hh * 0.68, width: w, height: hh * 0.32, class: ground }, gg);
    function broad(cx, cy, r, cls) { s('rect', { x: cx - r * 0.12, y: cy, width: r * 0.24, height: r * 1.2, class: 'ggk-trunk' }, gg); s('circle', { cx: cx, cy: cy, r: r, class: cls || 'ggk-leaf' }, gg); }
    function conifer(cx, cy, r) { s('path', { d: 'M' + cx + ' ' + (cy - r * 1.6) + ' L' + (cx + r) + ' ' + (cy + r * 0.6) + ' H' + (cx - r) + ' Z', class: 'ggy-conifer' }, gg); s('rect', { x: cx - 2, y: cy + r * 0.6, width: 4, height: r * 0.4, class: 'ggk-trunk' }, gg); }
    var gy = hh * 0.7;
    switch (b) {
      case 'rainforest': [[0.15, 0.3, 0.17], [0.4, 0.22, 0.2], [0.68, 0.28, 0.18], [0.88, 0.35, 0.14], [0.28, 0.45, 0.13], [0.56, 0.47, 0.13]].forEach(function (q) { broad(q[0] * w, q[1] * hh, q[2] * hh, 'ggy-jungle'); }); break;
      case 'seasonal': [[0.2, 0.36, 0.14], [0.5, 0.32, 0.16], [0.8, 0.38, 0.13]].forEach(function (q) { broad(q[0] * w, q[1] * hh, q[2] * hh); }); break;
      case 'savanna': [[0.3, 0.42], [0.75, 0.48]].forEach(function (q) { s('rect', { x: q[0] * w - 2, y: q[1] * hh, width: 4, height: gy - q[1] * hh, class: 'ggk-trunk' }, gg); s('ellipse', { cx: q[0] * w, cy: q[1] * hh, rx: w * 0.13, ry: hh * 0.05, class: 'ggk-leaf' }, gg); }); grass(); break;
      case 'desert': [[0.3, 0.5], [0.7, 0.56]].forEach(function (q) { var cx = q[0] * w, cy = q[1] * hh; s('path', { d: 'M' + cx + ' ' + (gy + 4) + ' V' + cy + ' M' + (cx - 9) + ' ' + (cy + 14) + ' V' + (cy + 22) + ' H' + cx + ' M' + (cx + 9) + ' ' + (cy + 8) + ' V' + (cy + 16) + ' H' + cx, class: 'ggf-cactus' }, gg); }); s('circle', { cx: w * 0.85, cy: hh * 0.2, r: hh * 0.09, class: 'ggc-sun' }, gg); break;
      case 'grassland': grass(); grass(0.5); break;
      case 'shrubland': [[0.2, 0.62], [0.45, 0.6], [0.7, 0.63], [0.88, 0.6]].forEach(function (q) { s('ellipse', { cx: q[0] * w, cy: q[1] * hh, rx: w * 0.07, ry: hh * 0.08, class: 'ggy-shrub' }, gg); }); broad(0.58 * w, 0.42 * hh, 0.1 * hh, 'ggy-shrub'); break;
      case 'deciduous': [[0.2, 0.38, 'ggy-fall1'], [0.47, 0.34, 'ggk-leaf'], [0.75, 0.38, 'ggy-fall2']].forEach(function (q) { broad(q[0] * w, q[1] * hh, 0.15 * hh, q[2]); }); break;
      case 'temprain': [[0.2, 0.55], [0.45, 0.5], [0.72, 0.55], [0.9, 0.58]].forEach(function (q) { conifer(q[0] * w, q[1] * hh, 0.14 * hh); }); s('ellipse', { cx: w * 0.3, cy: gy + 8, rx: 12, ry: 5, class: 'ggy-fern' }, gg); break;
      case 'taiga': [[0.15, 0.55], [0.35, 0.5], [0.55, 0.56], [0.75, 0.5], [0.92, 0.57]].forEach(function (q) { conifer(q[0] * w, q[1] * hh, 0.11 * hh); }); break;
      case 'tundra': [[0.2, 0.7], [0.4, 0.72], [0.65, 0.7], [0.85, 0.73]].forEach(function (q) { s('ellipse', { cx: q[0] * w, cy: q[1] * hh, rx: 10, ry: 4, class: 'ggy-moss' }, gg); }); break;
      case 'ice': s('path', { d: 'M0 ' + gy + ' L' + w * 0.3 + ' ' + hh * 0.5 + ' L' + w * 0.6 + ' ' + hh * 0.58 + ' L' + w + ' ' + hh * 0.48 + ' V' + gy + ' Z', class: 'ggy-ice' }, gg); break;
    }
    function grass(off) { for (var i = 0; i < 9; i++) { var cx = (i + 0.5 + (off || 0)) * w / 9.5; s('path', { d: 'M' + (cx - 4) + ' ' + (gy + 6) + ' L' + cx + ' ' + (gy - 10) + ' L' + (cx + 4) + ' ' + (gy + 6), class: 'ggy-blade' }, gg); } }
    return gg;
  }
  V.register('gg-biome', function (el, o) {
    var F = frame(el, o, 'biome'), mode = o.mode || (o.biome || o.biomes ? 'scene' : 'chart');
    if (mode === 'scene') {
      var bl = [].concat(o.biomes || o.biome), row = h('div', 'ggx-row'); F.body.appendChild(row);
      bl.forEach(function (b, i) {
        var fig = h('figure', 'ggx-cell ggy-cell'), svg = svgRoot(220, 140, 'ggy-svg'); fig.appendChild(svg); row.appendChild(fig);
        biomeScene(svg, b, 0, 0, 220, 140);
        var B = G.BIOMES[b] || {}; fig.appendChild(h('figcaption', 'ggx-cap', (bl.length > 1 ? '<b>' + LETTERS[i] + '</b> ' : '') + (F.quiet ? '' : '<b>' + esc(B.n) + '</b>' + (o.details ? '<br><small>' + esc(B.climate) + '. Plants: ' + esc(B.plants) + '. Animals: ' + esc(B.animals) + '.</small>' : ''))));
        F.alt(svg, (bl.length > 1 ? 'Scene ' + LETTERS[i] + ': ' : '') + (F.quiet ? 'a landscape: ' + (B.plants || '') : 'a ' + B.n + ' landscape with ' + B.plants) + '.');
      });
      return {};
    }
    var pt = o.point ? o.point.slice() : null, Wv = 460, Hv = 320, x0 = 46, x1 = Wv - 12, y0 = 12, y1 = Hv - 36, Pmax = 450, Tmin = -20, Tmax = 32;
    var box = h('div', 'ggy-box'); F.body.appendChild(box);
    function X(P) { return x0 + P / Pmax * (x1 - x0); } function Y(T) { return y1 - (T - Tmin) / (Tmax - Tmin) * (y1 - y0); }
    function draw() {
      box.innerHTML = ''; var svg = svgRoot(Wv, Hv, 'ggy-chart'); box.appendChild(svg);
      var sums = {};
      for (var T = Tmin; T < Tmax; T += 1) for (var P = 0; P < Pmax; P += 10) {
        if (P > 60 + (T + 20) * 12) continue; // the climates that exist on Earth form a triangle: cold places are never very wet
        var b = G.biomeOf(T + 0.5, P + 5); s('rect', { x: X(P), y: Y(T + 1), width: X(P + 10) - X(P) + 0.3, height: Y(T) - Y(T + 1) + 0.3, class: 'ggy-b-' + b + (o.highlight === b ? ' ggy-bhi' : '') }, svg);
        var sm = sums[b] = sums[b] || [0, 0, 0]; sm[0] += P + 5; sm[1] += T + 0.5; sm[2]++;
      }
      s('path', { d: 'M' + X(0) + ' ' + y1 + ' V' + y0 + ' M' + X(0) + ' ' + y1 + ' H' + x1, class: 'ggx-axis' }, svg);
      for (var t = -20; t <= 30; t += 10) text(svg, x0 - 5, Y(t) + 4, String(t).replace('-', '−'), 'ggx-ax', { 'text-anchor': 'end' });
      for (var p = 0; p <= 400; p += 100) text(svg, X(p), y1 + 15, String(p), 'ggx-ax', { 'text-anchor': 'middle' });
      text(svg, (x0 + x1) / 2, Hv - 4, 'Precipitation (cm per year)', 'ggx-ax ggx-title', { 'text-anchor': 'middle' });
      text(svg, 12, (y0 + y1) / 2, 'Temperature (°C, yearly average)', 'ggx-ax ggx-title', { 'text-anchor': 'middle', transform: 'rotate(-90 12 ' + (y0 + y1) / 2 + ')' });
      var labels = [];
      if (!F.quiet || o.labels) Object.keys(sums).forEach(function (b) { var sm = sums[b]; if (o.ask === b) return; labels.push({ x: X(sm[0] / sm[2]), y: Y(sm[1] / sm[2]) + 4, t: G.BIOMES[b].n.replace(' (boreal forest)', ''), cls: 'gg-lab ggy-lab', pri: sm[2] / 100 }); });
      if (pt) { s('circle', { cx: X(pt[1]), cy: Y(pt[0]), r: 7, class: 'ggy-pt' }, svg); if (o.mark) labels.push({ x: X(pt[1]), y: Y(pt[0]) - 16, t: o.mark, cls: 'gg-mark', pri: 20, mark: true }); }
      placeLabels(svg, labels, Wv, Hv);
      F.alt(svg, 'A chart of biomes by yearly average temperature (up) and yearly precipitation (across)' + (pt ? (F.quiet ? ', with one place marked' : ', with a point at ' + pt[0] + ' °C and ' + pt[1] + ' cm') : '') + '.');
      if (pt && !F.quiet) F.say('At ' + pt[0] + ' °C and ' + pt[1] + ' cm a year: <b>' + esc(G.BIOMES[G.biomeOf(pt[0], pt[1])].n) + '</b>.');
      if (o.mode === 'place' && F.interactive) { svg.style.cursor = 'crosshair'; svg.addEventListener('click', function (e) { var r = svg.getBoundingClientRect(), k = Wv / r.width, px = (e.clientX - r.left) * k, py = (e.clientY - r.top) * k; var P = M.round((px - x0) / (x1 - x0) * Pmax / 5) * 5, T = M.round(Tmin + (y1 - py) / (y1 - y0) * (Tmax - Tmin)); if (P < 0 || P > Pmax || T < Tmin || T > Tmax) return; pt = [T, P]; draw(); }); }
    }
    draw(); return {};
  });

  // ---- gg-pyramid
  V.register('gg-pyramid', function (el, o) {
    var F = frame(el, o, 'pyramid'), list = o.compare || [o.shape || (o.data ? null : 'expanding')], gr = null, mort = null;
    var row = h('div', 'ggx-row'); F.body.appendChild(row);
    var custom = o.shape && typeof o.shape === 'object' ? o.shape : null;
    function data(sh) { if (o.data && !sh) return o.data; if (sh && typeof sh === 'object') return G.pyramid(sh); var q = Object.assign({}, G.PYRAMIDS[sh] || G.PYRAMIDS.expanding); if (gr != null) q.growth = gr; if (mort) q.mort = mort; return G.pyramid(q); }
    function draw() {
      row.innerHTML = '';
      list.forEach(function (sh, i) {
        var d = data(custom || sh), Wv = 360, Hv = 300, cx = Wv / 2, y0 = 10, y1 = Hv - 30, bh = (y1 - y0) / 21, mx = o.max || M.max(6, M.ceil(M.max.apply(M, d.m.concat(d.f)) / 2) * 2), half = cx - 40;
        var fig = h('figure', 'ggx-cell'), svg = svgRoot(Wv, Hv, 'ggx-svg'); fig.appendChild(svg); row.appendChild(fig);
        for (var k = 0; k <= mx; k += mx > 8 ? 4 : 2) { [cx - 18 - k / mx * half, cx + 18 + k / mx * half].forEach(function (x) { s('line', { x1: x, y1: y0, x2: x, y2: y1, class: 'ggx-grid' }, svg); text(svg, x, y1 + 14, k + '%', 'ggx-ax', { 'text-anchor': 'middle' }); }); }
        for (var a = 0; a < 21; a++) {
          var y = y1 - (a + 1) * bh, band = a < 3 ? 'young' : a >= 13 ? 'old' : 'work', hl = o.highlight === band ? ' ggx-hl' : '';
          s('rect', { x: cx - 18 - d.m[a] / mx * half, y: y + 0.5, width: d.m[a] / mx * half, height: bh - 1, class: 'ggx-male' + hl }, svg);
          s('rect', { x: cx + 18, y: y + 0.5, width: d.f[a] / mx * half, height: bh - 1, class: 'ggx-female' + hl }, svg);
          if (a % 2 === 0) text(svg, cx, y + bh - 2, a === 20 ? '100+' : String(a * 5), 'ggx-ax ggx-age', { 'text-anchor': 'middle' });
        }
        text(svg, 10, y0 + 10, 'Male', 'ggx-ax ggx-title'); text(svg, Wv - 10, y0 + 10, 'Female', 'ggx-ax ggx-title', { 'text-anchor': 'end' });
        text(svg, cx, Hv - 2, 'Percent of the population in each 5-year age group', 'ggx-ax', { 'text-anchor': 'middle' });
        var nm = typeof sh === 'string' ? sh : '', cap = (list.length > 1 ? '<b>' + LETTERS[i] + '</b> ' : '') + (o.titles ? esc(o.titles[i]) : (!F.quiet && nm ? esc({ expanding: 'Expanding: fast growth', young: 'Young and growing', stable: 'Stable: slow or no growth', contracting: 'Contracting: an aging, shrinking population', stage1: 'Stage 1', stage2: 'Stage 2', stage3: 'Stage 3', stage4: 'Stage 4', stage5: 'Stage 5' }[nm] || nm) : ''));
        if (cap.trim()) fig.appendChild(h('figcaption', 'ggx-cap', cap));
        var dep = G.dependency(d);
        F.alt(svg, (list.length > 1 ? 'Pyramid ' + LETTERS[i] + ': ' : 'A population pyramid: ') + 'about ' + M.round(dep.young) + ' percent of people are under 15 and ' + M.round(dep.old) + ' percent are 65 or older.');
        if (!F.quiet && list.length === 1 && o.readout !== false) F.say('Under 15: <b>' + M.round(dep.young) + '%</b> · 15 to 64: <b>' + M.round(dep.work) + '%</b> · 65 and over: <b>' + M.round(dep.old) + '%</b> · dependency ratio: <b>' + M.round(dep.ratio) + '</b> dependents per 100 people of working age.');
      });
    }
    draw();
    if (o.sliders && F.interactive && !F.quiet) {
      var base = G.PYRAMIDS[list[0]] || G.PYRAMIDS.expanding; gr = base.growth; mort = base.mort;
      V.slider(F.ctl, { label: 'Births each year grow by', min: -0.02, max: 0.04, step: 0.002, value: gr, fmt: function (v) { return (v * 100).toFixed(1) + '%'; }, input: function (v) { gr = v; draw(); } });
      V.seg(F.ctl, { label: 'Death rates', items: [['high', 'High'], ['mid', 'Medium'], ['low', 'Low']], value: mort, change: function (v) { mort = v; draw(); } });
    }
    return {};
  });

  // ---- gg-dtm: the demographic transition model
  V.register('gg-dtm', function (el, o) {
    var F = frame(el, o, 'dtm'), Wv = 520, Hv = 300, x0 = 40, x1 = Wv - 14, y0 = 26, y1 = Hv - 40, at = o.at != null ? o.at : null;
    var box = h('div', 'ggd-box'); F.body.appendChild(box);
    function X(t) { return x0 + t / 100 * (x1 - x0); } function Y(v) { return y1 - v / 50 * (y1 - y0); }
    function draw() {
      box.innerHTML = ''; var svg = svgRoot(Wv, Hv, 'ggx-svg'); box.appendChild(svg);
      G.DTM_STAGES.forEach(function (st, i) {
        s('rect', { x: X(st.from), y: y0 - 18, width: X(st.to) - X(st.from), height: y1 - y0 + 18, class: 'ggd-band ggd-b' + (i % 2) + (o.stage === st.n ? ' ggd-hi' : '') }, svg);
        text(svg, (X(st.from) + X(st.to)) / 2, y0 - 5, F.quiet && o.ask === st.n ? '?' : 'Stage ' + st.n, 'ggx-ax ggx-title' + (F.quiet && o.ask === st.n ? ' ggk-ask' : ''), { 'text-anchor': 'middle' });
      });
      for (var v = 0; v <= 50; v += 10) { s('line', { x1: x0, y1: Y(v), x2: x1, y2: Y(v), class: 'ggx-grid' }, svg); text(svg, x0 - 5, Y(v) + 4, String(v), 'ggx-ax', { 'text-anchor': 'end' }); }
      var cb = [], cd = [], pop = [], P = 1, pts = [];
      for (var t = 0; t <= 100; t += 1) { var r = G.dtm(t); cb.push((t ? 'L' : 'M') + X(t) + ' ' + Y(r.cbr)); cd.push((t ? 'L' : 'M') + X(t) + ' ' + Y(r.cdr)); P *= 1 + (r.cbr - r.cdr) / 1000 * 1.6; pts.push([t, P]); }
      if (o.population !== false) { var pm = pts[pts.length - 1][1] > pts[90][1] ? pts[pts.length - 1][1] : M.max.apply(M, pts.map(function (q) { return q[1]; })); s('path', { d: pts.map(function (q, i) { return (i ? 'L' : 'M') + X(q[0]) + ' ' + (y1 - (q[1] - 1) / (pm - 1) * (y1 - y0) * 0.9); }).join(' '), class: 'ggd-pop' }, svg); }
      s('path', { d: cb.join(' '), class: 'ggd-cbr' }, svg); s('path', { d: cd.join(' '), class: 'ggd-cdr' }, svg);
      text(svg, x0 - 34, 12, 'per 1,000', 'ggx-ax');
      text(svg, x0, y1 + 16, 'Birth rate', 'ggx-ax ggd-lcbr'); text(svg, x0 + 80, y1 + 16, 'Death rate', 'ggx-ax ggd-lcdr'); if (o.population !== false) text(svg, x0 + 166, y1 + 16, 'Total population', 'ggx-ax ggd-lpop');
      text(svg, x1, y1 + 32, 'Time →', 'ggx-ax', { 'text-anchor': 'end' });
      if (o.country) { var c = o.country, xx = X(c.t != null ? c.t : 50); s('circle', { cx: xx, cy: Y(c.cbr), r: 5, class: 'ggd-cbrpt' }, svg); s('circle', { cx: xx, cy: Y(c.cdr), r: 5, class: 'ggd-cdrpt' }, svg); }
      if (at != null) { var rr = G.dtm(at); s('line', { x1: X(at), y1: y0, x2: X(at), y2: y1, class: 'ggd-at' }, svg); if (!F.quiet) F.say('Birth rate <b>' + rr.cbr + '</b>, death rate <b>' + rr.cdr + '</b> per 1,000: natural increase <b>' + rr.rni.toFixed(1) + '%</b> a year. Stage ' + stageAt(at) + ': ' + esc(G.DTM_STAGES[stageAt(at) - 1].desc)); }
      F.alt(svg, 'The demographic transition model: birth and death rates over time in five stages' + (o.population !== false ? ', with total population rising' : '') + '.');
    }
    function stageAt(t) { for (var i = 0; i < G.DTM_STAGES.length; i++) if (t < G.DTM_STAGES[i].to || i === 4) return G.DTM_STAGES[i].n; return 5; }
    draw();
    if (F.interactive && !F.quiet && o.slider !== false) V.slider(F.ctl, { label: 'Move through time', min: 0, max: 100, step: 1, value: at == null ? 30 : at, fmt: function (v) { return 'stage ' + stageAt(v); }, input: function (v) { at = v; draw(); } });
    return {};
  });

  // ---- gg-models: diagrams for human geography
  V.register('gg-models', function (el, o) {
    var F = frame(el, o, 'models'), key = G.MODELS[o.model] ? o.model : 'concentric', MD = G.MODELS[key], Wv = 420, Hv = 320;
    var svg = svgRoot(Wv, Hv, 'ggx-svg ggz-svg'); F.body.appendChild(svg);
    var cx = Wv / 2, cy = Hv / 2, legend = true, labels = [];
    function num(x, y, i) { var t = F.quiet && o.ask === i ? '?' : String(i + 1); labels.push({ x: x, y: y, t: t, cls: 'gg-mark', pri: 20, mark: true }); }
    switch (key) {
      case 'concentric': case 'vonthunen':
        for (var i = MD.zones.length - 1; i >= 0; i--) s('circle', { cx: cx, cy: cy, r: 22 + i * 30, class: 'ggz-z' + i + (o.highlight === i ? ' ggz-hi' : '') }, svg);
        MD.zones.forEach(function (z, i) { num(i ? cx + 22 + (i - 0.5) * 30 : cx, cy, i); });
        if (key === 'vonthunen') text(svg, 12, Hv - 10, 'Farther from the market, it costs more to carry goods there.', 'ggx-ax');
        break;
      case 'sector':
        s('circle', { cx: cx, cy: cy, r: 140, class: 'ggz-z3' }, svg);
        [[0, 40, 4], [60, 100, 2], [150, 190, 1], [190, 230, 2], [300, 340, 2], [100, 150, 3]].forEach(function (w2) { var a0 = (w2[0] - 90) * M.PI / 180, a1 = (w2[1] - 90) * M.PI / 180; s('path', { d: 'M' + cx + ' ' + cy + ' L' + (cx + 140 * M.cos(a0)) + ' ' + (cy + 140 * M.sin(a0)) + ' A140 140 0 0 1 ' + (cx + 140 * M.cos(a1)) + ' ' + (cy + 140 * M.sin(a1)) + ' Z', class: 'ggz-z' + w2[2] + (o.highlight === w2[2] ? ' ggz-hi' : '') }, svg); });
        s('circle', { cx: cx, cy: cy, r: 26, class: 'ggz-z0' }, svg);
        num(cx, cy, 0); num(cx + 50, cy + 80, 1); num(cx - 80, cy + 50, 2); num(cx - 60, cy - 70, 3); num(cx + 70, cy - 60, 4);
        break;
      case 'nuclei':
        s('rect', { x: 40, y: 20, width: 340, height: 280, rx: 14, class: 'ggz-z3' }, svg);
        [[170, 120, 70, 60, 0], [130, 70, 160, 50, 1], [240, 120, 60, 90, 2], [80, 120, 90, 120, 3], [300, 40, 70, 80, 4], [250, 220, 110, 70, 5], [60, 40, 60, 70, 6], [300, 130, 70, 80, 7], [130, 240, 100, 50, 8]].forEach(function (b) { s('rect', { x: b[0], y: b[1], width: b[2], height: b[3], rx: 6, class: 'ggz-z' + (b[4] % 9) + (o.highlight === b[4] ? ' ggz-hi' : '') }, svg); num(b[0] + b[2] / 2, b[1] + b[3] / 2, b[4]); });
        break;
      case 'latin':
        for (var j = 4; j >= 2; j--) s('path', { d: 'M' + (cx - (40 + j * 35)) + ' ' + (Hv - 20) + ' A' + (40 + j * 35) + ' ' + (40 + j * 35) + ' 0 0 1 ' + (cx + 40 + j * 35) + ' ' + (Hv - 20) + ' Z', class: 'ggz-z' + j + (o.highlight === j ? ' ggz-hi' : '') }, svg);
        s('path', { d: 'M' + (cx - 14) + ' ' + (Hv - 20) + ' L' + (cx - 30) + ' 40 H' + (cx + 30) + ' L' + (cx + 14) + ' ' + (Hv - 20) + ' Z', class: 'ggz-z1' + (o.highlight === 1 ? ' ggz-hi' : '') }, svg);
        s('path', { d: 'M' + (cx + 60) + ' ' + (Hv - 20) + ' L' + (cx + 170) + ' ' + (Hv - 120) + ' L' + (cx + 190) + ' ' + (Hv - 100) + ' L' + (cx + 90) + ' ' + (Hv - 20) + ' Z', class: 'ggz-z5' }, svg);
        s('circle', { cx: cx, cy: Hv - 20, r: 30, class: 'ggz-z0' }, svg); s('circle', { cx: cx, cy: 52, r: 12, class: 'ggz-z6' }, svg);
        num(cx, Hv - 32, 0); num(cx, 110, 1); num(cx - 46, Hv - 100, 2); num(cx - 110, Hv - 84, 3); num(cx - 115, Hv - 135, 4); num(cx + 140, Hv - 95, 5); num(cx, 52, 6);
        break;
      case 'sea':
        s('rect', { x: 0, y: 0, width: Wv, height: Hv, class: 'ggz-sea' }, svg);
        var bands = [[0, 60, 'ggz-land'], [60, 90, 'ggz-z1'], [90, 120, 'ggz-z2'], [120, 340, 'ggz-z3'], [340, Wv, 'ggz-z4']];
        bands.forEach(function (b, i) { s('rect', { x: b[0], y: 20, width: b[1] - b[0], height: Hv - 60, class: b[2] + (o.highlight === i ? ' ggz-hi' : '') }, svg); num((b[0] + b[1]) / 2, Hv / 2, i); });
        text(svg, 10, Hv - 12, 'Not to scale. Distances are measured from the coast (the baseline).', 'ggx-ax');
        break;
      case 'centralplace':
        var R = 120; function hex(x, y, r, cls) { var p = []; for (var k = 0; k < 6; k++) { var a = M.PI / 3 * k; p.push((x + r * M.cos(a)).toFixed(1) + ',' + (y + r * M.sin(a)).toFixed(1)); } s('polygon', { points: p.join(' '), class: cls }, svg); }
        hex(cx, cy, R, 'ggz-hex1'); for (var k2 = 0; k2 < 6; k2++) { var a2 = M.PI / 3 * k2 + M.PI / 6; hex(cx + R * 0.58 * M.cos(a2), cy + R * 0.58 * M.sin(a2), R * 0.33, 'ggz-hex2'); }
        s('circle', { cx: cx, cy: cy, r: 12, class: 'ggz-city' }, svg); for (k2 = 0; k2 < 6; k2++) { var a3 = M.PI / 3 * k2; s('circle', { cx: cx + R * M.cos(a3), cy: cy + R * M.sin(a3), r: 8, class: 'ggz-town' }, svg); var a4 = a3 + M.PI / 6; s('circle', { cx: cx + R * 0.58 * M.cos(a4), cy: cy + R * 0.58 * M.sin(a4), r: 5, class: 'ggz-village' }, svg); }
        num(cx, cy - 26, 0); num(cx + R + 18, cy, 1); num(cx + R * 0.58 * M.cos(M.PI / 6) + 16, cy + R * 0.58 * M.sin(M.PI / 6), 2);
        break;
      case 'weber':
        var A = [70, 260], B = [350, 260], Mk = [210, 50], L0 = o.bulk === 'gaining' ? [195, 90] : o.bulk === 'reducing' ? [110, 235] : [190, 190];
        s('path', { d: 'M' + A + ' L' + B + ' L' + Mk + ' Z', class: 'ggz-tri' }, svg); [A, B, Mk].forEach(function (p2) { s('path', { d: 'M' + L0 + ' L' + p2, class: 'ggz-route' }, svg); });
        s('circle', { cx: A[0], cy: A[1], r: 10, class: 'ggz-town' }, svg); s('circle', { cx: B[0], cy: B[1], r: 10, class: 'ggz-town' }, svg); s('rect', { x: Mk[0] - 10, y: Mk[1] - 10, width: 20, height: 20, class: 'ggz-city' }, svg); s('circle', { cx: L0[0], cy: L0[1], r: 9, class: 'ggz-factory' }, svg);
        num(A[0], A[1] + 24, 0); num(B[0], B[1] + 24, 1); num(Mk[0], Mk[1] - 24, 2); num(L0[0] + 22, L0[1], 3);
        break;
      case 'ranksize':
        legend = false; var top = o.top || 1000, primate = o.primate, n = 8, bw = 40;
        for (var r2 = 1; r2 <= n; r2++) { var v = primate && r2 > 1 ? top / 3 / r2 : top / r2, hh2 = v / top * 230; s('rect', { x: 40 + (r2 - 1) * (bw + 6), y: 270 - hh2, width: bw, height: hh2, class: 'ggz-bar' }, svg); text(svg, 40 + (r2 - 1) * (bw + 6) + bw / 2, 288, String(r2), 'ggx-ax', { 'text-anchor': 'middle' }); if (!F.quiet || o.values) text(svg, 40 + (r2 - 1) * (bw + 6) + bw / 2, 264 - hh2, fmtK(v), 'ggx-ax', { 'text-anchor': 'middle' }); }
        text(svg, 40, Hv - 8, 'City rank (1 = largest)', 'ggx-ax');
        break;
      case 'rostow': case 'worldsystems':
        if (key === 'rostow') MD.zones.forEach(function (z, i) { s('rect', { x: 20 + i * 76, y: 250 - i * 45, width: 76, height: 45 + i * 45, class: 'ggz-z' + i + (o.highlight === i ? ' ggz-hi' : '') }, svg); num(20 + i * 76 + 38, 268 - i * 45, i); });
        else { [[150, 2], [95, 1], [45, 0]].forEach(function (c) { s('circle', { cx: cx, cy: cy, r: c[0], class: 'ggz-z' + c[1] + (o.highlight === c[1] ? ' ggz-hi' : '') }, svg); }); num(cx, cy, 0); num(cx + 70, cy, 1); num(cx + 122, cy, 2); }
        break;
      case 'survey':
        legend = true;
        s('path', { d: 'M20 40 L120 30 L135 110 L90 150 L30 130 Z M120 30 L130 60 L135 110', class: 'ggz-lot' }, svg); num(75, 170, 0);
        for (var a5 = 0; a5 < 4; a5++) for (var b5 = 0; b5 < 4; b5++) s('rect', { x: 160 + a5 * 28, y: 30 + b5 * 28, width: 28, height: 28, class: 'ggz-lot' }, svg); num(216, 170, 1);
        s('path', { d: 'M300 20 C320 80 300 120 320 180', class: 'ggf-river' }, svg); for (var c5 = 0; c5 < 7; c5++) s('path', { d: 'M' + (312 - (c5 < 3 ? 0 : 0)) + ' ' + (30 + c5 * 22) + ' L400 ' + (26 + c5 * 22), class: 'ggz-lotline' }, svg); num(360, 200, 2);
        break;
      case 'districts':
        legend = false; var plan = o.plan === 'cracking' ? 'cracking' : 'packing';
        var isA = function (r, c) { return c < 2 || (c === 2 && r < 2) || (c === 3 && (r === 2 || r === 3)) || (c === 4 && r === 4); }; // 15 of 25 voters in group A
        var dOf = function (r, c) { return plan === 'packing' ? c : r; }, wins = { A: 0, B: 0 };
        for (var d6 = 0; d6 < 5; d6++) { var na = 0; for (var q6 = 0; q6 < 5; q6++) if (plan === 'packing' ? isA(q6, d6) : isA(d6, q6)) na++; wins[na >= 3 ? 'A' : 'B']++; }
        for (var r6 = 0; r6 < 5; r6++) for (var c6 = 0; c6 < 5; c6++) { s('rect', { x: 60 + c6 * 60, y: 10 + r6 * 56, width: 60, height: 56, class: 'ggz-d' + (dOf(r6, c6) % 2) }, svg); s('circle', { cx: 90 + c6 * 60, cy: 38 + r6 * 56, r: 15, class: isA(r6, c6) ? 'ggz-vA' : 'ggz-vB' }, svg); text(svg, 90 + c6 * 60, 43 + r6 * 56, isA(r6, c6) ? 'A' : 'B', 'ggz-vlab', { 'text-anchor': 'middle' }); }
        text(svg, 10, Hv - 22, 'Group A has 15 of 25 voters (60%). Each ' + (plan === 'packing' ? 'column' : 'row') + ' of squares is one district.', 'ggx-ax');
        if (!F.quiet || o.results) text(svg, 10, Hv - 6, 'Districts won: A ' + wins.A + ', B ' + wins.B + '.', 'ggx-ax ggx-title');
        break;
    }
    placeLabels(svg, labels, Wv, Hv);
    var cap = h('div', 'ggz-legend'); F.body.appendChild(cap);
    var html = (F.quiet && o.ask === 'name' ? '' : '<b>' + esc(MD.n) + '</b>');
    if (legend && MD.zones.length) html += '<ol>' + MD.zones.map(function (z, i) { return '<li' + (o.highlight === i ? ' class="ggz-lhi"' : '') + '>' + (F.quiet && (o.ask === i || o.hideNames) ? '?' : esc(z)) + '</li>'; }).join('') + '</ol>';
    cap.innerHTML = html; cap.hidden = !html;
    F.alt(svg, o.alt || ('A diagram: ' + (F.quiet ? 'a model with numbered zones' : MD.n) + '.'));
    function fmtK(v) { return v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0) + 'M' : M.round(v) + 'k'; }
    return {};
  });

  // ---- gg-diffusion: how an idea or trait spreads
  V.register('gg-diffusion', function (el, o) {
    var F = frame(el, o, 'diffusion'), type = o.type || 'contagious', cols = 18, rows = 11, seed = o.seed || 9, steps = 6;
    function rnd(i) { var x = M.sin(i * 12.9898 + seed * 78.233) * 43758.5453; return x - M.floor(x); }
    var cells = []; for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { var k = r * cols + c, sz = rnd(k) > 0.94 ? 3 : rnd(k + 500) > 0.8 ? 2 : 1; cells.push({ r: r, c: c, size: sz }); }
    var big = cells.filter(function (q) { return q.size === 3; });
    function state(t) { // 0 not adopted, 1 adopted, 2 adopted in a changed form (stimulus), 3 left (relocation)
      return cells.map(function (q, i) {
        if (type === 'contagious' || type === 'stimulus') { var d = M.hypot(q.c - 4, q.r - 5); if (d <= t * 1.7 + 0.3 && rnd(i + t) < 0.9) return type === 'stimulus' && d > 2.5 ? 2 : 1; return 0; }
        if (type === 'hierarchical') { if (q.size === 3 && t >= 1) return 1; if (q.size === 2 && t >= 3) return 1; if (t >= 5 && M.min.apply(M, big.map(function (b) { return M.hypot(b.c - q.c, b.r - q.r); })) < 4) return 1; return 0; }
        if (type === 'relocation') { var home = M.hypot(q.c - 3, q.r - 3) < 2.6, away = M.hypot(q.c - 14, q.r - 7) < M.min(2.6, t * 0.6); if (home) return t >= 3 && rnd(i) < 0.4 ? 3 : 1; return away ? 1 : 0; }
        return 0;
      });
    }
    var t = o.t != null ? o.t : (F.quiet ? null : 0), wrap = h('div', 'ggx-row'); F.body.appendChild(wrap);
    function grid(tt, label) {
      var fig = h('figure', 'ggx-cell'), svg = svgRoot(cols * 20 + 10, rows * 20 + 10, 'ggq-svg'); fig.appendChild(svg); wrap.appendChild(fig);
      s('rect', { x: 0, y: 0, width: cols * 20 + 10, height: rows * 20 + 10, rx: 8, class: 'ggq-bg' }, svg);
      var st = state(tt);
      cells.forEach(function (q, i) { s('circle', { cx: 15 + q.c * 20, cy: 15 + q.r * 20, r: q.size === 3 ? 8 : q.size === 2 ? 5.5 : 3.5, class: 'ggq-c' + st[i] }, svg); });
      if (label) fig.appendChild(h('figcaption', 'ggx-cap', label));
      var n = st.filter(function (v) { return v === 1 || v === 2; }).length;
      F.alt(svg, 'A grid of places (bigger dots are bigger cities): ' + n + ' have the new idea' + (label ? ' at ' + label.replace(/<[^>]+>/g, '').toLowerCase() : '') + '.');
    }
    function draw() { wrap.innerHTML = ''; if (t == null) { [0, 2, 5].forEach(function (tt, i) { grid(tt, '<b>' + (i === 0 ? 'At first' : i === 1 ? 'Later' : 'Much later') + '</b>'); }); } else grid(t, 'Step ' + t + ' of ' + steps); }
    draw();
    var NAMES = { contagious: 'Contagious diffusion: it spreads from person to person, to the nearest places first.', hierarchical: 'Hierarchical diffusion: it reaches the largest cities first, then smaller places.', relocation: 'Relocation diffusion: people carry it with them when they move.', stimulus: 'Stimulus diffusion: the idea spreads, but people change it to fit their own culture (orange dots).' };
    if (!F.quiet) F.say(NAMES[type]);
    if (F.interactive && !F.quiet && t != null) {
      btn(F.ctl, 'Step ▶', function () { if (t < steps) { t++; draw(); } }, 'pri'); btn(F.ctl, 'Start over', function () { t = 0; draw(); });
      if (o.choose) V.seg(F.ctl, { label: 'Kind of diffusion', items: [['contagious', 'Contagious'], ['hierarchical', 'Hierarchical'], ['relocation', 'Relocation'], ['stimulus', 'Stimulus']], value: type, change: function (v) { type = v; t = 0; draw(); F.say(NAMES[type]); } });
    }
    return {};
  });
})(typeof window !== 'undefined' ? window : globalThis, typeof document !== 'undefined' ? document : null);

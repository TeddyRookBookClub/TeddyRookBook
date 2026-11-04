---
title: "Navier–Stokes: air over a wing"
summary: "The equations of flowing air and water, solved live around a wing you can tilt, reshape and turn upside down like a race car's."
emoji: "🌬️"
gtags: [famous-problems, chaos]
weight: 340
ladder_links:
  - { url: "/math/calculus-4/divergence-curl/", why: "the ∇· and ∇² in the equations" }
  - { url: "/math/calculus-4/fluid-flow/", why: "sources, sinks and circulation in a flow" }
  - { url: "/math/calculus-3/partial-derivatives/", why: "rates of change in space and in time" }
  - { url: "/math/differential-equations/heat-equation/", why: "the spreading term ν∇²u on its own" }
  - { url: "/math/numerical-analysis/heat-explicit/", why: "how a computer steps an equation like this forward on a grid" }
  - { url: "/physics/physics-2/continuity/", why: "flow rate and why incompressible flow speeds up in a narrow pipe" }
  - { url: "/physics/physics-2/bernoulli/", why: "faster air, lower pressure" }
  - { url: "/physics/mechanics/quadratic-drag/", why: "drag at everyday speeds" }
  - { url: "/math/gallery/lorenz/", why: "chaos that began as a model of moving air" }
  - { url: "/math/gallery/double-pendulum/", why: "how tiny differences grow, as they do in turbulence" }
  - { url: "/math/gallery/mandelbrot/", why: "simple rules, endless detail" }
credits:
  - { name: "Our own simulation", what: "a lattice Boltzmann flow solver, wing shapes and drawing, written for this page and run in your browser" }
  - { name: "S. Chen and G. D. Doolen, Lattice Boltzmann Method for Fluid Flows, Annual Review of Fluid Mechanics 30 (1998)", url: "https://doi.org/10.1146/annurev.fluid.30.1.329", what: "the method our solver uses (the D2Q9 lattice with BGK collisions and bounce-back walls)" }
  - { name: "Jos Stam, Stable Fluids, SIGGRAPH 1999", url: "https://doi.org/10.1145/311535.311548", what: "the backward-tracing step we use to carry the smoke along with the flow" }
  - { name: "Lattice Boltzmann methods (Grokipedia)", url: "https://grokipedia.com/page/Lattice_Boltzmann_methods", what: "background on the method" }
  - { name: "Navier–Stokes equations (Grokipedia)", url: "https://grokipedia.com/page/Navier%E2%80%93Stokes_equations", what: "the equations and their terms" }
  - { name: "Navier–Stokes existence and smoothness (Grokipedia)", url: "https://grokipedia.com/page/Navier%E2%80%93Stokes_existence_and_smoothness", what: "the Millennium Problem and its history" }
  - { name: "NACA airfoil (Grokipedia)", url: "https://grokipedia.com/page/NACA_airfoil", what: "the 4-digit wing-section formulas" }
  - { name: "Reynolds number (Grokipedia)", url: "https://grokipedia.com/page/Reynolds_number", what: "definition and typical values" }
  - { name: "Stall (fluid dynamics) (Grokipedia)", url: "https://grokipedia.com/page/Stall_(fluid_dynamics)", what: "flow separation and stall" }
  - { name: "Computational fluid dynamics (Grokipedia)", url: "https://grokipedia.com/page/Computational_fluid_dynamics", what: "RANS, LES and how engineers use CFD" }
  - { name: "Downforce (Grokipedia)", url: "https://grokipedia.com/page/Downforce", what: "inverted wings on race cars" }
  - { name: "Ground effect (cars) (Grokipedia)", url: "https://grokipedia.com/page/Ground_effect_(cars)", what: "downforce from the car's floor" }
  - { name: "The Race, The aero restrictions each F1 team will face in 2026 (December 19, 2025)", url: "https://the-race.com/formula-1/the-aero-restrictions-each-f1-team-will-face-in-2026", what: "how the Aerodynamic Testing Restrictions work (the sliding scale, reset twice a year)" }
  - { name: "Quanta Magazine, September 8, 2026", url: "https://www.quantamagazine.org/ai-has-solved-one-of-maths-1-million-millennium-prize-problems-20260908/", what: "report on the announced proof of a singularity" }
  - { name: "The Decoder, September 14, 2026: the Clay Mathematics Institute's statement", url: "https://the-decoder.com/clay-mathematics-institute-says-the-navier-stokes-millennium-prize-problem-has-apparently-been-settled/", what: "quotes the institute: the problem has \"apparently been settled\" and the review is \"deliberately unhurried\"" }
  - { name: "Clay Mathematics Institute, Rules for the Millennium Prize Problems", url: "https://claymath.org/millennium-problems/rules", what: "publication and two-year waiting rule for an award" }
---
## What you're seeing

Wind blows from left to right past a slice of a wing. The computer is solving the equations of a flowing fluid on a grid of tiny squares, many times a second.

- **Colors** show pressure: blue where the air pressure is lower than the open air around it, red where it is higher. You can switch to speed or swirl.
- **Smoke streaks** are fed in at the left edge and carried by the air. They show the paths the air takes.
- **Arrows** show the force the air puts on the wing. The green one is **lift** (or **downforce** when it points down). The gold one is **drag**, the push backward.

At a gentle angle the air splits at the nose and slides smoothly along both surfaces. It hurries over the curved top, where the pressure drops, and the wing is pulled upward. Tilt it too far and the air can no longer follow the top surface. It tears away, and the space behind the wing fills with tumbling swirls. That is a **stall**.

Turn the wing upside down and the low pressure moves to the underside. Now the force points down. That is what the wings on a race car do.

## Why it works

**Two rules for a fluid.** Picture the air as a velocity $\role{velocity}{\mathbf{u}}$ at every point: an arrow showing which way and how fast the air there is moving. Two laws decide how those arrows change.

The first says that no air is created or destroyed:

$$\nabla \cdot \role{velocity}{\mathbf{u}} = 0$$

The symbol $\nabla\cdot$ (the *divergence*) measures how much flow leaves a tiny box minus how much enters. Zero means whatever flows in must flow out. This is what **incompressible** means: the fluid cannot be squeezed into less space. Water is nearly like this, and so is air moving much slower than the speed of sound.

The second law is Newton's $F = ma$ for each small parcel of fluid:

$$\frac{\partial \role{velocity}{\mathbf{u}}}{\partial \role{time}{t}} + (\role{velocity}{\mathbf{u}} \cdot \nabla)\,\role{velocity}{\mathbf{u}} = -\frac{1}{\rho}\nabla \role{pressure}{p} + \role[kinematic viscosity]{constant}{\nu}\,\nabla^2 \role{velocity}{\mathbf{u}} + \role[outside force per unit mass]{force}{\mathbf{f}}$$

Read it term by term:

- $\partial \mathbf{u}/\partial t$: how fast the velocity changes at one fixed spot.
- $(\mathbf{u}\cdot\nabla)\mathbf{u}$: the fluid carries its own motion along with it. A parcel moving into a faster region speeds up. Together these two terms are the parcel's acceleration.
- $-\nabla p/\rho$: fluid is pushed from high pressure toward low pressure. Here $\rho$ is the density, which stays the same in an incompressible fluid.
- $\nu \nabla^2 \mathbf{u}$: **viscosity**, the fluid's inner friction. It smooths out differences in speed between neighboring layers, the way heat spreads out. Honey has a large $\nu$; air has a small one. A fluid with this term is called **viscous**.
- $\mathbf{f}$: any outside push, such as gravity.

There is no separate equation for the pressure. It takes whatever values are needed to keep $\nabla\cdot\mathbf{u} = 0$ true everywhere at every moment. That is why the pressure on top of the wing "knows" about the wing before the air reaches it.

**One number sums up the flow.** The **Reynolds number** compares the carrying-along term to the viscous term:

$$\mathrm{Re} = \frac{\role{velocity}{U}\,\role[length]{position}{L}}{\role[kinematic viscosity]{constant}{\nu}}$$

Here $U$ is the speed of the oncoming air and $L$ is the size of the object (for a wing, its chord, the distance from nose to tail). At small $\mathrm{Re}$, viscosity wins and the flow is smooth and syrupy. At large $\mathrm{Re}$, the carrying-along term wins and the flow breaks into eddies inside eddies: **turbulence**. A race car's wing at speed has a Reynolds number in the millions. Our grid can only reach several hundred, so its forces are a rough model, not a wind tunnel.

**Why the equations are hard.** The term $(\mathbf{u}\cdot\nabla)\mathbf{u}$ multiplies the unknown by itself. Because of it, doubling a push does not double the response, and tiny differences can grow, as in the [Lorenz attractor](/math/gallery/lorenz/). In turbulent air, swirls a meter across feed swirls a millimeter across. Following every one of them for a real car would need far more grid points than any computer has.

**How our simulation works.** We do not solve the equations above directly. Instead we use a *lattice Boltzmann* method. Each grid square holds nine numbers: how much fluid is moving in each of eight directions, plus how much is sitting still. Each step, the fluid hops to the neighboring squares, and then the numbers in each square relax a little toward a balanced mix. When fluid would hop into the wing, it bounces back. For slow flow, the averages of these hops obey the incompressible Navier–Stokes equations. The force on the wing is the momentum of all the bounces added up.

**How engineers use the equations.** No one can write down a formula for the air around a real car. Engineers use **computational fluid dynamics** (CFD): they cut the space around the car into millions of small cells and solve an approximate version of the equations in each. The fine swirls of turbulence are too small to follow, so they are modeled. *RANS* (Reynolds-averaged Navier–Stokes) solves for the average flow and estimates what the swirls add. *LES* (large-eddy simulation) follows the big swirls and models only the small ones. Results are checked against **wind tunnels**, where a scale model sits in a stream of air on sensitive scales.

**Race car wings.** A Formula 1 car's wings are shaped like aircraft wings turned upside down. They make **downforce**, which presses the tires into the road so the car can corner faster without sliding. The car's floor is shaped to speed up the air flowing beneath it. Faster air means lower pressure, so the car is sucked toward the track. This is called **ground effect**. Behind every car trails a turbulent wake, often called **"dirty air."** A car following closely gets less downforce from its own wings in that wake, which makes passing harder.

The rules limit how much each team may test. Under the FIA's **Aerodynamic Testing Restrictions**, in use since 2021, each team gets a set number of wind-tunnel runs and CFD simulations. It is a sliding scale: teams higher in the championship standings get less, and lower teams get more. The amounts are reset twice a year.

## Where it stands today

The equations are about 200 years old. Claude-Louis Navier wrote them down in 1822, and George Gabriel Stokes completed them in 1845. Yet a basic question stayed open: **do they always make sense?**

Start with a smooth, gentle flow in three-dimensional space, with finite energy. Does it stay smooth forever? Or can the velocity become infinite at some point after a finite time? That breakdown is called a **singularity**, or **blow-up**. In two dimensions this was settled long ago: smooth flows stay smooth. In 1934 Jean Leray proved that rough, "weak" solutions exist forever in three dimensions too, but not that they stay smooth. In 2000 the Clay Mathematics Institute made the three-dimensional question one of its seven **Millennium Prize Problems**, with \$1 million for a proof either way.

In September 2026 a proof was announced that the answer is no. In three-dimensional space, a smooth flow pushed by a smooth outside force can develop a singularity in a finite time. A version of the argument was checked by computer in the Lean proof assistant. The Clay Mathematics Institute said the problem has "apparently been settled" and that its review will be "deliberately unhurried." As of November 2026, the prize has not been awarded. Under the institute's rules, a solution must be published and then still be accepted by mathematicians at least two years later.

The result does not change how engineers design wings. Real air is made of molecules, and long before a flow could reach infinite speed, the smooth-fluid picture would stop being a good description. The question is about the equations themselves.

## Try this

- Press **Smooth flight**, then drag the angle up slowly. Around what angle does the smoke stop hugging the top surface?
- Press **Stall** and switch the colors to **swirl**. Watch swirls peel off the top and bottom of the wing by turns.
- Press **Race car wing**. Where is the blue, low-pressure region now?
- Set the camber to 0% and the angle to 0°. Why is there no lift? Now tilt it to 5°.
- Lower the Reynolds number to 50 and then raise it to 800. Which looks more like syrup, and which more like air?
- Make the wing very thick (24%) and compare the drag with a thin one (6%) at the same angle.

# Electronics and Microcontrollers (rbelec): lessons.
SAFE_BENCH = ('<div class="rb-safe"><b>Safety at the bench.</b><ul>'
  '<li>Work only with low voltage: batteries and USB power, 3.3 to 12 volts. Never open, modify or wire anything that plugs into a wall outlet.</li>'
  '<li>Switch off or unplug the power before you move a wire.</li>'
  '<li>Do not let a battery\'s two terminals touch through a wire or a tool. A short circuit can make a large current, heat and even fire.</li></ul></div>')

LESSONS = {
"safe-workbench": LES([
 P("Before the first circuit, set up the bench. A little care here prevents the few accidents that hobby electronics has: burns from a soldering iron, and batteries that overheat."),
 K("Three habits cover most of it. <b>Low voltage only</b> (batteries and USB). <b>Lithium batteries handled by the maker's rules</b>: the right charger, never charged unattended, and never used once damaged or swollen. <b>A soldering iron that always goes back in its stand</b>, with fresh air and safety glasses."),
 N(SAFE_BENCH),
 H("Lithium batteries"),
 P("Most robots run on lithium-ion or lithium-polymer (LiPo) cells. They hold a lot of energy in a small, light pack, which is why they are popular and why they need care. A LiPo cell is about 3.7 volts in the middle of its range and 4.2 volts when full. A pack marked <b>3S</b> has three cells in series: about 11.1 volts nominal and 12.6 volts full."),
 N('<div class="rb-safe"><b>Lithium battery rules</b> (from battery makers and university safety offices)<ul>'
   '<li>Charge only with a charger made for lithium cells, set to the pack\'s cell count.</li>'
   '<li>Never leave a charging battery unattended. Charge it on a surface that will not burn, away from things that can.</li>'
   '<li>Never charge or use a pack that is swollen, punctured or damaged. Stop, and dispose of it as the maker directs, at a battery recycling drop-off, not in the trash.</li>'
   '<li>Do not leave packs in a hot car, and do not run them completely flat.</li>'
   '<li>For a first robot, AA cells or a USB power bank avoid most of this.</li></ul></div>'),
 H("Soldering"),
 P("Soldering joins wires and parts with a melted metal alloy. The iron's tip runs at about 300 to 400 °C. You can do a great deal of robotics with no soldering at all, using breadboards and plug-in wires; when you are ready, learn it with an experienced adult."),
 N('<div class="rb-safe"><b>Soldering rules</b> (from university safety offices)<ul>'
   '<li>The iron goes back in its stand every time you let go of it. Treat it as hot until it has been unplugged and cooled.</li>'
   '<li>Work with fresh air or a fume extractor, so the flux smoke is not breathed in.</li>'
   '<li>Wear safety glasses; clipped wire ends and solder can fly.</li>'
   '<li>Use lead-free solder. Do not eat or drink at the bench, and wash your hands with soap and water afterward.</li>'
   '<li>Keep paper and other things that burn away from the iron.</li></ul></div>'),
 H("Moving parts"),
 P("Motors and gears can pinch fingers and catch hair or loose sleeves. Test a new robot with its wheels off the table, on a block, and keep your hands clear until the power is off."),
 EX("Pack voltage", "A LiPo pack is marked 2S. What is its voltage when fully charged?", ["Two cells in series add their voltages.", "$2 \\times 4.2 = 8.4\\ \\text{V}$."], "8.4 V."),
 M("Treating a lithium pack like an AA cell. AA cells are forgiving; lithium packs need their own charger and must be retired if they swell."),
 TRY,
], "udel", "ada", "stan"),

"ohms-law": LES([
 P("Voltage, current and resistance are the three numbers of every circuit. One simple rule ties them together."),
 K("<b>Ohm's law:</b> $V = IR$. Voltage $V$ (volts) is the push; current $I$ (amps) is the flow; resistance $R$ (ohms, Ω) is how hard the part resists. Know any two and you can find the third: $I = V/R$, $R = V/I$."),
 V("rb-circuit", {"mode": "ohm"}, "Change the voltage and the resistance and watch the current. Double the voltage: the current doubles. Double the resistance: it halves."),
 W("Every pick of a part in robotics, from an LED's resistor to a motor's wire size, starts with Ohm's law. The physics behind it is on the Physics Ladder."),
 H("Worked examples"),
 EX("Find the current", "A 220 Ω resistor is across 5 V. What current flows?", ["$I = V/R = 5/220 \\approx 0.0227\\ \\text{A}$.", "Multiply by 1,000: about $22.7\\ \\text{mA}$."], "About 22.7 mA."),
 EX("Find the resistance", "You measure 3.3 V across a part and 10 mA through it. What is its resistance?", ["$10\\ \\text{mA} = 0.010\\ \\text{A}$.", "$R = 3.3 / 0.010 = 330\\ \\Omega$."], "330 Ω."),
 P("<b>The breadboard.</b> A solderless breadboard has rows of five holes joined underneath, and long rails along the sides for power and ground. Parts in the same short row are connected; the gap down the middle separates the two halves."),
 M("Mixing milliamps and amps. Change mA to A (divide by 1,000) before you use $V = IR$, or use the shortcut: volts divided by kilohms gives milliamps."),
 H("Hands-on: measure it"),
 N('<div class="rb-parts"><b>Starter bench</b>, three price points (approximate U.S. prices, 2026)<ul>'
   '<li><b>\\$0:</b> a free online circuit simulator in your browser, and our Science Lab circuits page.</li>'
   '<li><b>About \\$25 to \\$40:</b> a solderless breadboard, jumper wires, a resistor assortment, LEDs, and a basic digital multimeter.</li>'
   '<li><b>About \\$50 to \\$70:</b> the same plus a microcontroller starter kit (an Arduino Uno-compatible board or a Raspberry Pi Pico, with sensors).</li></ul></div>'),
 P("Put a resistor across a 9 V battery's clip on the breadboard. Measure the voltage across it with the multimeter, then calculate the current. Swap resistors and predict before you measure."),
 N(SAFE_BENCH),
 TRY,
], "hh", "ard"),

"led-resistor": LES([
 P("An LED connected straight to a battery can burn out in a flash. It needs a partner: a resistor in series."),
 K("An LED drops a nearly fixed voltage, its <b>forward voltage</b> $V_f$ (about 2 V for red, about 3 V for blue or white). The resistor takes the rest. Choose $R = \\dfrac{V_{\\text{supply}} - V_f}{I}$, with $I$ about 10 to 20 mA for a small LED."),
 V("rb-circuit", {"mode": "led", "on": True}, "Change the battery and the resistor. The readout shows the current through the LED."),
 W("The LED's own resistance changes wildly with voltage, so you cannot set its current by voltage alone. The resistor makes the current steady and safe. The same idea, limiting current, protects microcontroller pins."),
 EX("Pick a resistor", "A red LED ($V_f = 2\\ \\text{V}$) on a 5 V pin, at 15 mA.", ["Left for the resistor: $5 - 2 = 3\\ \\text{V}$.", "$R = 3 / 0.015 = 200\\ \\Omega$.", "Pick the next standard value up: $220\\ \\Omega$."], "220 Ω."),
 EX("Blue on 3.3 V", "A blue LED ($V_f = 3.0\\ \\text{V}$) on a 3.3 V pin at 10 mA.", ["$3.3 - 3.0 = 0.3\\ \\text{V}$.", "$R = 0.3/0.010 = 30\\ \\Omega$."], "About 30 Ω; it will be dim if $V_f$ is a little higher, which is normal for blue on 3.3 V."),
 M("Dividing the whole supply voltage by the current. Subtract the LED's forward voltage first."),
 N("Microcontroller pins can only supply a small current; check the board's documentation. An Arduino Uno pin is rated for 20 mA continuous, with an absolute maximum of 40 mA; a Raspberry Pi Pico pin is safest at a few milliamps. Use a transistor or driver for anything bigger, like a motor."),
 TRY,
], "hh", "ard"),

"voltage-divider": LES([
 P("Many sensors are just resistors whose resistance changes: with light, with temperature, with bending. A microcontroller cannot read resistance. It can read voltage. A voltage divider turns one into the other."),
 K("Two resistors in series across $V_{\\text{in}}$ split it. The voltage across the bottom one is $V_{\\text{out}} = V_{\\text{in}} \\dfrac{R_2}{R_1 + R_2}$, where $R_2$ is the resistor between the output and ground."),
 V("rb-divider", {"mode": "divider"}, "Change the light on the sensor and watch the output voltage and the reading."),
 W("The current is the same through both resistors, so each gets a share of the voltage in proportion to its resistance. This is Ohm's law on two parts at once."),
 EX("Half and half", "$V_{\\text{in}} = 5\\ \\text{V}$, $R_1 = R_2 = 10\\ \\text{k}\\Omega$.", ["$V_{\\text{out}} = 5 \\times \\dfrac{10}{20} = 2.5\\ \\text{V}$."], "2.5 V."),
 EX("A light sensor", "A light-dependent resistor (top, $R_1$) reads 2 kΩ in bright light; the fixed bottom resistor is 10 kΩ; $V_{\\text{in}} = 3.3\\ \\text{V}$.", ["$V_{\\text{out}} = 3.3 \\times \\dfrac{10}{12} = 2.75\\ \\text{V}$.", "In the dark the sensor might be 50 kΩ: $3.3 \\times \\dfrac{10}{60} = 0.55\\ \\text{V}$."], "2.75 V bright, about 0.55 V dark."),
 M("Putting the wrong resistor on top of the fraction. The top of the fraction is the resistor between the output and ground."),
 TRY,
], "hh", "ard", "rpi"),

"analog-input": LES([
 P("A microcontroller thinks in whole numbers. To read a voltage, it uses an <b>analog-to-digital converter</b> (ADC) that turns the voltage into a count."),
 K("An $n$-bit ADC gives readings from $0$ to $2^n - 1$. A 10-bit ADC (Arduino Uno) reads 0 to 1023; a 12-bit one reads 0 to 4095. Reading $= \\dfrac{V}{V_{\\text{ref}}} \\times (2^n - 1)$, rounded. The Pico's ADC returns 0 to 65535 in MicroPython, scaled up from 12 bits."),
 V("rb-divider", {"mode": "adc", "bits": 10}, "Slide the input voltage and watch the count. Each step of the count is one tiny slice of the voltage."),
 W("Knowing the size of one step tells you how fine your measurement can be. With 10 bits and 5 V, one count is about 4.9 mV. Noise smaller than that is invisible; noise bigger shows up as a jumpy reading."),
 EX("Voltage to count", "A 10-bit ADC with $V_{\\text{ref}} = 5\\ \\text{V}$ reads 2.0 V.", ["$\\dfrac{2.0}{5} \\times 1023 = 409.2$.", "Rounded: 409."], "409."),
 EX("Count to voltage", "A 12-bit ADC with $V_{\\text{ref}} = 3.3\\ \\text{V}$ reads 3000.", ["$V = \\dfrac{3000}{4095} \\times 3.3 \\approx 2.42\\ \\text{V}$."], "About 2.42 V."),
 M("Using 1024 or 4096 as the top reading. The largest reading is one less, because counting starts at 0."),
 N('<div class="rb-safe"><b>Safety for your board.</b> Never put more than the board\'s own supply voltage on an input pin. A Pico and many newer boards run at 3.3 V, and 5 V on a pin can damage them.</div>'),
 TRY,
], "ard", "rpi"),

"pwm": LES([
 P("A microcontroller pin is either on or off. Yet robots dim lights and run motors at half speed. The trick is to switch very fast."),
 K("<b>Pulse-width modulation</b> (PWM) switches a pin fully on and off many times a second. The <b>duty cycle</b> is the fraction of time it is on. The average voltage is the duty cycle times the supply: $V_{\\text{avg}} = D \\times V$."),
 V("rb-pwm", {"duty": 0.5, "v": 5}, "Slide the duty cycle and watch the pulses, the average voltage and the motor speed."),
 W("Switching wastes very little power: when the switch is fully on or fully off, almost nothing heats up inside it. A motor's inertia smooths the pulses into a steady speed, and your eye smooths a blinking LED into a dimmer glow."),
 EX("Average voltage", "A 5 V pin runs at 30% duty.", ["$0.30 \\times 5 = 1.5\\ \\text{V}$ on average."], "1.5 V."),
 EX("An 8-bit setting", "Arduino's analogWrite takes 0 to 255. What duty cycle is 64?", ["$64 / 255 \\approx 0.251$."], "About 25%."),
 M("Thinking PWM makes a lower steady voltage. The pin is always at full voltage or zero; only the average is lower. That is why a motor needs a motor driver: the pin itself cannot supply a motor's current."),
 H("Hands-on: fade an LED and spin a motor"),
 N('<div class="rb-parts"><b>Parts</b> (about \\$15 to \\$25 beyond the starter kit)<ul><li>A small DC gear motor and a dual motor driver board (an H-bridge)</li><li>A battery holder for 4 AA cells for the motor, kept separate from the board\'s USB power, with grounds joined</li></ul></div>'),
 P("Fade an LED from 0 to 255 in a loop. Then wire the motor through the driver and ramp it up the same way. Notice that a motor does not start turning until the duty cycle is high enough to beat friction."),
 N('<div class="rb-safe"><b>Safety.</b> Keep fingers and hair clear of the motor\'s shaft and gears while it runs, and switch the power off before touching anything.</div>'),
 TRY,
], "ard", "rpi", "hh"),
}

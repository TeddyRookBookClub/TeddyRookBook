# Sensing and Estimation (rbsense): lessons.
LESSONS = {
"encoders": LES([
 P("How far has the robot driven? Its wheels can tell it, if they can count their own turns."),
 K("A <b>wheel encoder</b> sends a pulse each time the shaft turns a small step. With $C$ counts per turn, $\\text{turns} = \\text{counts}/C$ and $\\text{distance} = \\text{turns} \\times \\pi d$. If the encoder is on the motor before a gearbox, multiply $C$ by the gear ratio."),
 V("rb-encoder", {"cpr": 20, "r": 3}, "Turn the wheel and watch the count and the distance."),
 W("Each count is a tiny, known slice of a turn. Counting slices gives turns; each turn rolls one circumference. Two encoders, one per wheel, also tell the robot how much it has turned, which is the start of odometry."),
 EX("Distance", "A 7 cm wheel, 360 counts per turn, 900 counts.", ["$900/360 = 2.5$ turns.", "$2.5 \\times \\pi \\times 7 \\approx 55\\ \\text{cm}$."], "About 55 cm."),
 M("Using the radius instead of the circumference, or forgetting the gear ratio between the motor and the wheel."),
 H("Hands-on: a bot that knows how far it went"),
 N('<div class="rb-parts"><b>A first mobile robot</b>, three price points (approximate U.S. prices, 2026)<ul><li><b>\\$0:</b> a free browser simulator for microcontroller code, and our Robotics Ladder pictures.</li><li><b>About \\$35 to \\$60:</b> a two-wheel robot chassis kit with gear motors and encoder discs, a dual motor driver, a 4-AA battery holder, and your starter-kit microcontroller.</li><li><b>About \\$80 to \\$150:</b> a chassis with metal gear motors and magnetic encoders, an IMU board and a distance sensor.</li></ul></div>'),
 P("Program the robot to drive 1 meter by counting encoder pulses. Mark the start on the floor, run it ten times, and measure where it stops each time. Write the numbers down: they are your first test log."),
 N('<div class="rb-safe"><b>Safety.</b> Test on the floor, not a table. Pick the robot up by its body, not its wheels, and switch it off before you handle the motors.</div>'),
 TRY,
], "sieg", "ard"),

"ultrasonic-ranging": LES([
 P("Bats find insects by listening for echoes. A cheap ultrasonic sensor does the same with a click too high for us to hear."),
 K("The sensor sends a pulse of sound and times the echo. Sound goes <b>there and back</b>, so $d = \\dfrac{v\\,t}{2}$, with $v \\approx 343\\ \\text{m/s}$ in room-temperature air. A closer formula is $v \\approx 331 + 0.6\\,T$ m/s, with $T$ in °C."),
 V("rb-sta", {"sensor": True}, "The robot uses its distance reading to stop before the wall."),
 W("Sound is slow enough to time with a microcontroller: 1 meter away gives an echo after about 5.8 ms. Soft, angled or very small objects send back weak echoes, so these sensors can miss things a camera would see."),
 EX("Echo time to distance", "An echo after 1,750 µs.", ["$343 \\times 0.00175 \\approx 0.600\\ \\text{m}$ round trip.", "Half: about 0.30 m."], "About 30 cm."),
 M("Forgetting to halve the round trip, which makes every object look twice as far as it is."),
 TRY,
], "sieg", "ard"),

"imu": LES([
 P("An <b>inertial measurement unit</b> (IMU) is a tiny chip that feels motion. It usually holds an accelerometer and a gyro."),
 K("At rest, the <b>accelerometer</b> feels only gravity, so its tilt is $\\theta = \\arctan(a_x / a_z)$. The <b>gyro</b> measures turn rate $\\omega$; adding it up, $\\theta \\leftarrow \\theta + \\omega\\,\\Delta t$, gives angle, but small errors pile up, so the angle <b>drifts</b>."),
 V("rb-noise", {"filter": "none"}, "A noisy tilt reading. The accelerometer is right on average but jumpy."),
 W("The accelerometer cannot tell gravity from speeding up, so it is fooled during motion. The gyro is smooth over short times, but a tiny bias, added up for minutes, becomes a big error. Each is good where the other is weak."),
 EX("Tilt", "At rest: $a_x = 3.4$, $a_z = 9.2$ (m/s²).", ["$\\arctan(3.4/9.2) \\approx \\arctan(0.37) \\approx 20.3^\\circ$."], "About 20°."),
 EX("Drift", "A gyro bias of 0.05 °/s, added up for 10 minutes.", ["$0.05 \\times 600 = 30^\\circ$."], "30° of false turn."),
 M("Trusting the accelerometer while the robot speeds up, or the gyro's angle after a long time."),
 TRY,
], "pr", "sieg"),

"noise-averaging": LES([
 P("Read a distance sensor ten times while nothing moves, and you get ten slightly different numbers. That scatter is <b>noise</b>."),
 K("Noise is measured by its <b>standard deviation</b> $\\sigma$. Averaging $N$ independent readings gives an average whose standard deviation is $\\sigma/\\sqrt{N}$."),
 V("rb-noise", {"filter": "avg"}, "A moving average smooths the noise. Notice it also lags behind real changes."),
 W("Random errors partly cancel when you add them, but not completely. The spread of a sum grows like $\\sqrt{N}$, so the spread of the average, the sum divided by $N$, shrinks like $1/\\sqrt{N}$. The Math Ladder's statistics topics show why."),
 EX("Shrink the noise", "One reading has $\\sigma = 2\\ \\text{cm}$. Average 16.", ["$2/\\sqrt{16} = 0.5\\ \\text{cm}$."], "0.5 cm."),
 EX("How many?", "To cut the noise to a third?", ["$\\sqrt{N} = 3$, so $N = 9$."], "9 readings."),
 M("Expecting averaging 4 readings to cut the noise to a quarter. It halves it. And averaging slows the robot's reaction, because old readings stay in the average."),
 TRY,
], "pr"),

"complementary-filter": LES([
 P("The gyro is smooth but drifts; the accelerometer is right on average but jumpy. Blend them and get the best of both."),
 K("The <b>complementary filter</b>: $\\theta \\leftarrow \\alpha\\,(\\theta + \\omega\\,\\Delta t) + (1 - \\alpha)\\,\\theta_{\\text{acc}}$, with $\\alpha$ close to 1, such as 0.98."),
 V("rb-noise", {"filter": "comp"}, "The blended angle follows quick changes like the gyro and stays anchored like the accelerometer."),
 W("Each step mostly trusts the gyro's quick update, so the result is smooth. But each step also pulls 2% toward the accelerometer, so over a second or two any drift is pulled back out. That is why it is called complementary: one sensor covers the other's weakness."),
 EX("One step", "$\\alpha = 0.98$, last $\\theta = 10^\\circ$, gyro 20 °/s, $\\Delta t = 0.01$, accelerometer 12°.", ["Gyro guess: $10 + 0.2 = 10.2$.", "$0.98 \\times 10.2 + 0.02 \\times 12 = 9.996 + 0.24 = 10.236$."], "About 10.24°."),
 M("Swapping the weights and trusting the noisy accelerometer most."),
 H("Hands-on: a tilt meter"),
 P("Wire an IMU board to your microcontroller. Print three angles side by side: accelerometer alone, gyro alone, and the complementary blend. Tilt the board and hold it; then shake it. Which one would you trust to balance a robot?"),
 TRY,
], "pr", "sieg"),

"kalman-1d": LES([
 P("A Kalman filter sounds hard, but its main idea fits in one line: blend what you predicted with what you measured, trusting each by how good it is."),
 K("Keep an estimate $x$ and its uncertainty (variance) $P$. A measurement $z$ has variance $R$. The <b>gain</b> is $K = \\dfrac{P}{P + R}$. Update: $x \\leftarrow x + K(z - x)$ and $P \\leftarrow (1 - K)P$. Between measurements, predict the motion and let $P$ grow a little."),
 V("rb-kalman", {"r": 4, "q": 0.5}, "The filter tracks a moving cart from noisy readings. Make the sensor noisier and watch the gain drop."),
 W("If the prediction is shaky ($P$ big), $K$ is near 1 and the estimate jumps to the measurement. If the sensor is noisy ($R$ big), $K$ is near 0 and the estimate barely moves. The new $P$ is smaller than either: two pieces of evidence beat one. This is Bayes' rule for bell-shaped uncertainty."),
 EX("One update", "Predict $x = 100$, $P = 4$. Measure $z = 106$, $R = 12$.", ["$K = 4/16 = 0.25$.", "$x = 100 + 0.25 \\times 6 = 101.5$.", "$P = 0.75 \\times 4 = 3$."], "Estimate 101.5, variance 3."),
 M("Thinking a Kalman filter just averages. It weighs each source by how much it is trusted, and the weights change as it runs."),
 TRY,
], "pr"),
}

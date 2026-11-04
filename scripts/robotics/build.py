#!/usr/bin/env python3
"""Robotics Ladder: build data/robotics/topics/<course>.json and data/robotics/lessons/<course>.json.

Skill maps (units and topics) are defined here; lessons live in scripts/robotics/src/<course>.py (each defines LESSONS,
a dict topic slug -> {"blocks": [...], "sources": [...]}). Run:  python3 scripts/robotics/build.py
then:  node scripts/math/check-course.js robotics  and  node scripts/math/check-gen.js <course>
"""
import json, os, sys, importlib.util

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRCDIR = os.path.join(os.path.dirname(__file__), 'src')

def T(slug, unit, title, short, prereqs, xp, trouble, viz=(), lab=None):
    t = {"slug": slug, "unit": unit, "title": title, "short": short, "prereqs": list(prereqs), "xp": xp, "trouble": trouble, "viz": list(viz)}
    if lab: t["lab"] = lab
    return t

COURSES = {
 "rbkids": {
  "units": [
   ("robots", "What Robots Are", "Machines that sense, decide and act on their own, and the parts that do each job."),
   ("build", "Build and Program", "A first safe circuit, programs as steps and loops, and a cardboard arm you can make at the kitchen table."),
  ],
  "topics": [
   T("what-is-a-robot", "robots", "What Makes a Robot", "A robot senses the world, decides with a program, and acts, over and over.", [], 1,
     "Children call any machine with motors a robot, even one a person steers every moment.", ["rb-sta"]),
   T("sensors-and-motors", "robots", "Sensors and Motors", "Sensors are a robot's senses; motors, servos, lights and speakers are its muscles.", ["rbkids.what-is-a-robot"], 1,
     "Children mix up the two jobs and call a motor a sensor because it is part of the robot."),
   T("simple-circuits", "build", "A First Circuit", "Current flows only around a complete loop: battery, switch, resistor and LED.", ["rbkids.sensors-and-motors"], 1,
     "Children leave a gap in the loop, or put the LED in backward and think the parts are broken.", ["rb-circuit"], "/science-lab/circuits/"),
   T("block-coding", "build", "Programs, Steps and Loops", "A program is a list of steps the robot follows in order; a loop repeats steps.", ["rbkids.what-is-a-robot"], 1,
     "Children count a turn as a move, or forget that a loop runs its steps more than once.", ["rb-grid"]),
   T("cardboard-arm", "build", "A Cardboard Arm and a Bristlebot", "A lever arm moves its end farther than your hand, but with less force.", ["rbkids.simple-circuits", "rbkids.block-coding"], 2,
     "Children expect a long arm to be both farther-reaching and stronger.", ["rb-lever"]),
  ]},
 "rbelec": {
  "units": [
   ("bench", "The Safe Workbench", "Low voltage only, batteries and soldering done the careful way."),
   ("circuits", "Circuits on a Breadboard", "Ohm's law, the resistor every LED needs, and voltage dividers."),
   ("mcu", "Talking to a Microcontroller", "Analog readings and PWM on an Arduino or Raspberry Pi Pico."),
  ],
  "topics": [
   T("safe-workbench", "bench", "A Safe Electronics Bench", "Low-voltage kits, batteries handled by the maker's rules, and a soldering iron that always goes back in its stand.", ["rbkids.simple-circuits"], 1,
     "Beginners treat a lithium battery like an AA cell, or set a hot iron down on the table."),
   T("ohms-law", "circuits", "Ohm's Law on a Breadboard", "Voltage pushes, resistance resists, and current is the result: V = IR.", ["physsci.ohms-law", "rbelec.safe-workbench"], 2,
     "Students mix up milliamps and amps, or forget which breadboard holes are connected.", ["rb-circuit"], "/science-lab/circuits/"),
   T("led-resistor", "circuits", "The Resistor Every LED Needs", "Pick the series resistor from what is left after the LED's forward voltage: R = (V - Vf)/I.", ["rbelec.ohms-law"], 2,
     "Students divide the whole supply voltage by the current, forgetting the LED's own voltage drop.", ["rb-circuit"]),
   T("voltage-divider", "circuits", "Voltage Dividers and Sensors", "Two resistors in series split a voltage; a light sensor in a divider turns light into volts.", ["rbelec.ohms-law", "phys2.series-resistors"], 2,
     "Students put the wrong resistor on top of the fraction, R1 instead of the one between the output and ground.", ["rb-divider"]),
   T("analog-input", "mcu", "Analog Readings", "An analog-to-digital converter turns 0 to 3.3 V into a whole number from 0 to 1023 (10-bit) or 4095 (12-bit).", ["rbelec.voltage-divider", "g8.proportional-slope"], 2,
     "Students use 1024 or 4096 as the top reading instead of one less.", ["rb-divider"]),
   T("pwm", "mcu", "PWM: Fast Switching for Motors and Lights", "Switch fully on and off very fast; the fraction of time on, the duty cycle, sets the average voltage.", ["rbelec.analog-input"], 2,
     "Students think PWM makes a lower steady voltage, or confuse the frequency with the duty cycle.", ["rb-pwm"]),
  ]},
 "rbprog": {
  "units": [
   ("python", "Python on a Raspberry Pi", "Reading code like the computer does, and turning sensor readings into decisions."),
   ("structure", "Programs That Run Forever", "State machines and steady control loops."),
   ("embedded", "C on a Microcontroller", "Integer sizes, overflow and bit masks: the bugs that bite on small chips."),
  ],
  "topics": [
   T("trace-code", "python", "Tracing Code by Hand", "Follow a program one line at a time, writing down every variable, to know what it will do.", ["rbkids.block-coding", "g6.variables-meaning"], 2,
     "Students guess what the loop does instead of writing down each pass, and miss the last pass or the first."),
   T("sensor-decisions", "python", "Decisions from Sensors", "if, elif and else turn readings into actions; the order of the tests matters.", ["rbprog.trace-code"], 2,
     "Students write tests in an order where an early, broad test hides a later, narrow one."),
   T("state-machines", "structure", "State Machines", "A robot is always in one state; each input moves it along a rule to the next.", ["rbprog.sensor-decisions"], 2,
     "Students write long chains of if statements that forget what the robot was already doing.", ["rb-fsm"]),
   T("loop-timing", "structure", "Loop Timing", "A control loop runs at a steady rate: period = 1 / frequency, and all the work must fit inside it.", ["rbprog.state-machines"], 2,
     "Students mix up milliseconds and seconds, or forget that the work itself takes time."),
   T("integers-and-bits", "embedded", "Integers, Overflow and Bit Masks", "An 8-bit unsigned number wraps from 255 to 0; masks set, clear and test single bits.", ["rbprog.trace-code", "rbelec.analog-input"], 3,
     "Students expect 250 + 10 to be 260 in an 8-bit variable, or clear a bit with OR."),
  ]},
 "rbmech": {
  "units": [
   ("drive", "Gears, Torque and Wheels", "How motors turn into force and speed."),
   ("frames", "Frames and Kinematics", "Where things are, from the robot's point of view and the world's, and where an arm's hand ends up."),
  ],
  "topics": [
   T("gears", "drive", "Gear Ratios", "A small gear driving a big one trades speed for torque by the ratio of their teeth.", ["physsci.simple-machines"], 2,
     "Students divide the wrong way and make the slow gear faster.", ["rb-gears"]),
   T("torque-motors", "drive", "Torque and Choosing a Motor", "Torque is force times lever arm; a motor must beat the load's torque, m g L, with room to spare.", ["phys1.torque", "rbmech.gears"], 2,
     "Students forget that holding a load farther out takes more torque, or mix up grams and kilograms.", ["rb-lever"]),
   T("wheel-speed", "drive", "Wheels and Speed", "Rolling speed is angular speed times radius: v = ωr, and rpm must be turned into radians per second first.", ["phys1.linear-angular", "rbmech.gears"], 2,
     "Students multiply rpm by the radius without converting to radians per second.", ["rb-encoder"]),
   T("coordinate-frames", "frames", "Coordinate Frames", "A point seen by the robot becomes a point on the map by a rotation and a shift.", ["pre.matrix-transformations", "geo.trig-ratios"], 3,
     "Students add the robot's position but forget to rotate by its heading, or rotate the wrong way.", ["rb-frames"]),
   T("forward-kinematics", "frames", "Forward Kinematics of a Two-Link Arm", "Given the joint angles, the hand is at x = L1 cos θ1 + L2 cos(θ1 + θ2), y = L1 sin θ1 + L2 sin(θ1 + θ2).", ["rbmech.coordinate-frames"], 3,
     "Students use θ2 alone for the second link instead of θ1 + θ2.", ["rb-arm"]),
   T("inverse-kinematics", "frames", "Inverse Kinematics of a Two-Link Arm", "Given where the hand should go, the law of cosines gives the elbow angle; there are usually two answers, and sometimes none.", ["rbmech.forward-kinematics", "geo.law-of-cosines", "pre.inverse-trig"], 3,
     "Students forget to check that the target is in reach, or miss the second, elbow-up solution.", ["rb-arm"]),
  ]},
 "rbctrl": {
  "units": [
   ("loops", "Feedback Loops", "Measure, compare, correct: why closing the loop works."),
   ("pid", "PID Control", "Proportional, integral and derivative, one term at a time."),
   ("response", "Response and Stability", "How fast a system settles, and when a controller makes things worse."),
  ],
  "topics": [
   T("open-closed-loop", "loops", "Open and Closed Loops", "Open loop runs a fixed command; closed loop measures the error, setpoint minus measurement, and corrects it.", ["rbprog.loop-timing"], 2,
     "Students get the sign of the error backward, measurement minus setpoint."),
   T("p-control", "pid", "Proportional Control", "Command = Kp times the error, limited to what the motor can give.", ["rbctrl.open-closed-loop", "alg1.linear-models-context"], 2,
     "Students forget the motor's limit, so a big error gives an impossible command.", ["rb-pid"]),
   T("pid-step", "pid", "One Step of a PID Controller", "u = Kp e + Ki (sum of e Δt) + Kd (Δe / Δt), computed fresh every loop.", ["rbctrl.p-control"], 3,
     "Students forget Δt in the integral or derivative term, or use the error from the wrong step.", ["rb-pid"]),
   T("first-order-response", "response", "Time Constants", "A first-order system covers 63% of the way to its new value in one time constant τ, and about 99% in 5τ.", ["rbctrl.open-closed-loop", "alg2.exponential-log-models"], 3,
     "Students think the system arrives after one time constant.", ["rb-pid"]),
   T("stability", "response", "Stability and Tuning", "Too much gain overshoots and can oscillate or diverge; tune P first, then D, then a little I.", ["rbctrl.pid-step", "rbctrl.first-order-response"], 3,
     "Students keep raising the gain to go faster and are surprised when the robot starts to shake.", ["rb-pid"]),
  ]},
 "rbsense": {
  "units": [
   ("sensors", "Sensors", "Encoders, sound echoes and inertial sensors."),
   ("estimation", "Noise and Estimation", "Averages, filters and the Kalman filter's idea: blend a prediction with a measurement."),
  ],
  "topics": [
   T("encoders", "sensors", "Wheel Encoders", "Counts divided by counts per turn give turns; turns times the circumference give distance.", ["rbmech.wheel-speed"], 2,
     "Students use the radius instead of the circumference, or forget the gear ratio between motor and wheel.", ["rb-encoder"]),
   T("ultrasonic-ranging", "sensors", "Ultrasonic Distance", "Sound goes out and back, so distance = speed of sound times time, divided by 2.", ["rbprog.sensor-decisions", "physsci.speed"], 2,
     "Students forget to halve the round trip.", ["rb-sta"]),
   T("imu", "sensors", "Accelerometers and Gyros", "At rest, an accelerometer's tilt is atan(ax / az); a gyro gives turn rate, which adds up to angle and drifts.", ["geo.inverse-trig-angles", "rbsense.encoders"], 3,
     "Students trust the accelerometer while the robot is speeding up, or the gyro's angle after a long time.", ["rb-noise"]),
   T("noise-averaging", "estimation", "Noise and Averages", "Averaging N independent readings shrinks the noise by the square root of N.", ["stat.standard-deviation", "rbsense.ultrasonic-ranging"], 2,
     "Students expect averaging 4 readings to cut the noise to a quarter, not a half.", ["rb-noise"]),
   T("complementary-filter", "estimation", "The Complementary Filter", "Trust the gyro over short times and the accelerometer over long times: θ = α(θ + ω Δt) + (1 − α) θ_acc.", ["rbsense.imu", "rbsense.noise-averaging"], 3,
     "Students swap the weights and trust the noisy accelerometer most.", ["rb-noise"]),
   T("kalman-1d", "estimation", "A Kalman Filter in One Dimension", "Gain K = P / (P + R); new estimate = old + K (measurement − old); new P = (1 − K) P.", ["rbsense.noise-averaging", "stat.bayes-rule"], 3,
     "Students think a Kalman filter just averages; it weighs each source by how much it is trusted.", ["rb-kalman"]),
  ]},
 "rbmobile": {
  "units": [
   ("motion", "Driving and Dead Reckoning", "How two wheels steer a robot, and how it keeps track of where it is."),
   ("plan", "Maps and Paths", "Grids, shortest paths and the ideas behind SLAM."),
  ],
  "topics": [
   T("differential-drive", "motion", "Differential Drive", "Two wheels: v = (vR + vL)/2, ω = (vR − vL)/W, and the turning radius is v / ω.", ["rbmech.wheel-speed", "rbctrl.p-control"], 2,
     "Students divide by half the wheel track instead of the whole track, or mix up which wheel is faster for a left turn.", ["rb-diffdrive"]),
   T("odometry", "motion", "Odometry", "Update the pose each step: x += d cos θ, y += d sin θ, θ += Δθ.", ["rbmobile.differential-drive", "rbsense.encoders", "rbmech.coordinate-frames"], 3,
     "Students update the heading before moving, or forget that small errors grow with every meter.", ["rb-diffdrive"]),
   T("occupancy-grids", "plan", "Occupancy Grids", "Cut the floor into cells: cell = floor(position / cell size); each cell is free, occupied or unknown.", ["rbmobile.odometry"], 2,
     "Students round instead of taking the floor, or count cells from 1."),
   T("grid-search", "plan", "Shortest Paths on a Grid", "Breadth-first search explores in rings and finds the fewest moves; Dijkstra's algorithm does the same with costs.", ["rbmobile.occupancy-grids", "disc.shortest-paths"], 3,
     "Students count the cells on the path including the start, so they are off by one.", ["rb-astar"]),
   T("a-star", "plan", "A* Search", "A* adds a guess of the distance left, f = g + h, so it looks toward the goal first and still finds the shortest path.", ["rbmobile.grid-search"], 3,
     "Students use a guess that can overestimate, which can miss the shortest path.", ["rb-astar"]),
   T("slam-ideas", "plan", "Drift, Landmarks and SLAM", "A heading error θ makes the position error grow like d sin θ; seeing known landmarks again pulls the estimate back.", ["rbmobile.odometry", "rbsense.kalman-1d"], 3,
     "Students think a small heading error stays small, when its effect grows with every meter driven.", ["rb-diffdrive"]),
  ]},
 "rbros": {
  "units": [
   ("graph", "The ROS 2 Graph", "Nodes, topics, services and actions: how robot programs talk."),
   ("frames", "Units, Frames and Simulation", "The shared conventions that let programs agree, and how simulators step time."),
  ],
  "topics": [
   T("nodes-topics", "graph", "Nodes and Topics", "Each job is a node; nodes publish and subscribe to named topics at steady rates.", ["rbprog.state-machines", "rbprog.loop-timing"], 2,
     "Students make one giant program, or forget that a topic with no publisher just stays silent.", ["rb-ros"]),
   T("services-actions", "graph", "Services and Actions", "A topic streams, a service asks once and waits for one reply, and an action runs a long task with feedback and can be canceled.", ["rbros.nodes-topics"], 2,
     "Students use a service for a long task, so the caller freezes until it is done."),
   T("units-conventions", "frames", "Units and Axes: REP 103", "ROS uses SI units (meters, seconds, radians) and right-handed frames: x forward, y left, z up.", ["rbros.nodes-topics", "rbmech.coordinate-frames"], 2,
     "Students publish degrees or centimeters where every other node expects radians and meters."),
   T("transforms", "frames", "Chains of Transforms", "A point in the camera's frame reaches the map through a chain: camera to base, base to map.", ["rbros.units-conventions", "rbmobile.odometry"], 3,
     "Students apply the transforms in the wrong order.", ["rb-frames"]),
   T("simulation", "frames", "How a Simulator Steps Time", "A simulator advances in fixed steps Δt; the real-time factor is simulated time over wall-clock time.", ["rbros.nodes-topics", "calc2.slope-fields-euler"], 2,
     "Students think a slow simulation gives wrong answers, or that a large time step is always fine.", ["rb-pid"]),
  ]},
 "rbvision": {
  "units": [
   ("images", "Images as Numbers", "Pixels, colors and the size of a picture in memory."),
   ("seeing", "From Pixels to Steering", "Thresholds, centers and the pinhole camera."),
  ],
  "topics": [
   T("pixels", "images", "Pixels and Image Size", "An image is a grid of pixels; a color pixel stores three numbers, so a 640 × 480 color frame is 921,600 bytes.", ["rbprog.integers-and-bits"], 2,
     "Students forget the three color channels, or mix up bits and bytes."),
   T("color-threshold", "seeing", "Color Thresholding", "Keep the pixels whose color passes a test, such as red − (green + blue)/2 > T; the rest are background.", ["rbvision.pixels", "rbprog.sensor-decisions"], 2,
     "Students set one threshold in a bright room and are surprised when it fails in a dim one.", ["rb-threshold"]),
   T("centroid-steering", "seeing", "Finding the Center and Steering", "The target's center is the average column of the pixels that pass; the steering error is that minus the image center.", ["rbvision.color-threshold", "rbctrl.p-control"], 3,
     "Students measure the error from the left edge instead of from the center.", ["rb-threshold"]),
   T("pinhole-camera", "seeing", "The Pinhole Camera", "Image size in pixels = f × real size ÷ distance, so a known size gives the distance.", ["rbvision.pixels", "geo.similar-right-triangles"], 3,
     "Students mix units: focal length in pixels, sizes and distances both in meters.", ["rb-pinhole"]),
  ]},
 "rbcap": {
  "units": [
   ("project", "Building a Real Project", "Power, testing and a ladder of projects."),
   ("career", "Careers", "What the work is, how people get there, and honest timelines."),
  ],
  "topics": [
   T("power-budget", "project", "Power Budgets and Battery Life", "Add up the current of every part; battery life is about capacity ÷ current, less a safety margin.", ["rbelec.pwm", "rbelec.safe-workbench"], 2,
     "Students forget the motors' current, which is usually most of it, or run a battery right down to empty."),
   T("design-test", "project", "Design, Build, Test, Repeat", "Change one thing at a time, run several trials, and record the success rate honestly.", ["rbcap.power-budget", "g7.experimental-probability"], 2,
     "Students change three things at once and can't tell which one helped."),
   T("careers", "career", "Robotics Careers and Honest Timelines", "Most robotics engineers hold an engineering degree; technicians often start with two years of training. A portfolio of finished projects helps at every level.", ["rbcap.design-test"], 1,
     "Learners believe a six-month course alone leads to an engineering job title."),
  ]},
}

# ---------- helpers handed to every lesson file in src/ (so each file just builds blocks)
def P(h): return {"t": "p", "html": h}
def K(h): return {"t": "key", "html": h}
def W(h): return {"t": "why", "html": h}
def M(h): return {"t": "mistake", "html": h}
def N(h): return {"t": "note", "html": h}
def H(x): return {"t": "h", "text": x}
def EX(title, q, steps, a): return {"t": "ex", "title": title, "q": q, "steps": list(steps), "a": a}
def V(name, opts=None, cap=None):
    b = {"t": "viz", "name": name}
    if opts: b["opts"] = opts
    if cap: b["cap"] = cap
    return b
def LI(*items): return {"t": "list", "items": list(items)}
def TB(head, rows, cap=None):
    b = {"t": "table", "head": list(head), "rows": [list(r) for r in rows]}
    if cap: b["cap"] = cap
    return b
TRY = {"t": "try"}
SRC = {
 "mr": {"name": "Kevin M. Lynch and Frank C. Park, Modern Robotics: Mechanics, Planning, and Control (Cambridge University Press, 2017), free preprint and videos", "url": "https://hades.mech.northwestern.edu/index.php/Modern_Robotics"},
 "ocw": {"name": "MIT OpenCourseWare, 2.12 Introduction to Robotics (Fall 2005)", "url": "https://ocw.mit.edu/courses/2-12-introduction-to-robotics-fall-2005/"},
 "ros": {"name": "ROS 2 Documentation (Jazzy), beginner tutorials and concepts", "url": "https://docs.ros.org/en/jazzy/"},
 "rep103": {"name": "REP 103: Standard Units of Measure and Coordinate Conventions", "url": "https://www.ros.org/reps/rep-0103.html"},
 "pr": {"name": "Sebastian Thrun, Wolfram Burgard and Dieter Fox, Probabilistic Robotics (MIT Press, 2005)"},
 "rpi": {"name": "Raspberry Pi Foundation, Raspberry Pi Projects", "url": "https://projects.raspberrypi.org/"},
 "ard": {"name": "Arduino Documentation", "url": "https://docs.arduino.cc/"},
 "first": {"name": "FIRST (For Inspiration and Recognition of Science and Technology), programs for students", "url": "https://www.firstinspires.org/"},
 "ada": {"name": "Adafruit Learning System, Li-Ion & LiPoly Batteries", "url": "https://learn.adafruit.com/li-ion-and-lipoly-batteries"},
 "udel": {"name": "University of Delaware Environmental Health & Safety, Chemical Safety Moment 91: Li-ion and LiPo Battery Safety (2024)", "url": "https://www1.udel.edu/ehs/research/downloads/csm/91.pdf"},
 "stan": {"name": "Stanford University Environmental Health & Safety, Soldering Safety Fact Sheet", "url": "https://ehs.stanford.edu/wp-content/uploads/Soldering-Safety-Fact-Sheet.pdf"},
 "bls_me": {"name": "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook: Mechanical Engineers (page modified August 27, 2026)", "url": "https://www.bls.gov/ooh/architecture-and-engineering/mechanical-engineers.htm"},
 "bls_ee": {"name": "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook: Electrical and Electronics Engineers (page modified October 29, 2026)", "url": "https://www.bls.gov/ooh/architecture-and-engineering/electrical-and-electronics-engineers.htm"},
 "bls_tech": {"name": "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook: Electro-mechanical and Mechatronics Technologists and Technicians (page modified August 27, 2026)", "url": "https://www.bls.gov/ooh/architecture-and-engineering/electro-mechanical-technicians.htm"},
 "am": {"name": "Karl J. Åström and Richard M. Murray, Feedback Systems: An Introduction for Scientists and Engineers, 2nd ed. (Princeton University Press), free online edition", "url": "https://www.cds.caltech.edu/~murray/amwiki/"},
 "hart": {"name": "Peter E. Hart, Nils J. Nilsson and Bertram Raphael, A Formal Basis for the Heuristic Determination of Minimum Cost Paths, IEEE Transactions on Systems Science and Cybernetics (1968)"},
 "sieg": {"name": "Roland Siegwart, Illah R. Nourbakhsh and Davide Scaramuzza, Introduction to Autonomous Mobile Robots, 2nd ed. (MIT Press, 2011)"},
 "szel": {"name": "Richard Szeliski, Computer Vision: Algorithms and Applications, 2nd ed. (Springer, 2022), free online edition", "url": "https://szeliski.org/Book/"},
 "hh": {"name": "Paul Horowitz and Winfield Hill, The Art of Electronics, 3rd ed. (Cambridge University Press, 2015)"},
 "kr": {"name": "Brian W. Kernighan and Dennis M. Ritchie, The C Programming Language, 2nd ed. (Prentice Hall, 1988)"},
 "py": {"name": "The Python Tutorial, Python Software Foundation", "url": "https://docs.python.org/3/tutorial/"},
}
def LES(blocks, *src): return {"blocks": list(blocks), "sources": [SRC[s] for s in src]}
HELP = dict(P=P, K=K, W=W, M=M, N=N, H=H, EX=EX, V=V, LI=LI, TB=TB, TRY=TRY, SRC=SRC, LES=LES)

def build():
    out_t = os.path.join(ROOT, 'data', 'robotics', 'topics'); out_l = os.path.join(ROOT, 'data', 'robotics', 'lessons')
    os.makedirs(out_t, exist_ok=True); os.makedirs(out_l, exist_ok=True)
    for key, c in COURSES.items():
        units = [{"key": k, "title": t, "blurb": b} for k, t, b in c["units"]]
        topics = []
        for t in c["topics"]:
            d = {"id": key + "." + t["slug"]}; d.update(t); topics.append(d)
        with open(os.path.join(out_t, key + '.json'), 'w') as f:
            json.dump({"course": key, "units": units, "topics": topics}, f, ensure_ascii=False, indent=1); f.write('\n')
        src = os.path.join(SRCDIR, key + '.py')
        if os.path.exists(src):
            spec = importlib.util.spec_from_file_location('rb_' + key, src); m = importlib.util.module_from_spec(spec); m.__dict__.update(HELP); spec.loader.exec_module(m)
            les = {}
            for t in c["topics"]:
                if t["slug"] in m.LESSONS: les[key + "." + t["slug"]] = m.LESSONS[t["slug"]]
            extra = set(m.LESSONS) - {t["slug"] for t in c["topics"]}
            if extra: print('WARNING', key, 'lessons for unknown topics:', sorted(extra))
            with open(os.path.join(out_l, key + '.json'), 'w') as f:
                json.dump(les, f, ensure_ascii=False, indent=1); f.write('\n')
            print(key, len(topics), 'topics,', len(les), 'lessons')
        else:
            print(key, len(topics), 'topics, no lessons yet')

if __name__ == '__main__':
    build()

# ROS 2 and Simulation (rbros): lessons. Concepts follow the ROS 2 documentation and REP 103.
SETUP = ('<div class="rb-parts"><b>Getting set up</b><ul><li>ROS 2 runs best on Ubuntu Linux. Each ROS 2 release is tied to an Ubuntu version; the official documentation lists which goes with which.</li>'
         '<li><b>\\$0:</b> install it on a spare computer or in a virtual machine, and use the built-in turtlesim and the Gazebo simulator; no robot needed.</li>'
         '<li><b>About \\$100 to \\$200 more:</b> a Raspberry Pi 4 or 5 on your mobile robot, talking to your laptop over Wi-Fi.</li></ul></div>')

LESSONS = {
"nodes-topics": LES([
 P("Real robots run many programs at once: one reads the lidar, one plans a path, one drives the motors. ROS 2 (Robot Operating System 2) is a free set of tools that lets them talk. It is not an operating system; it runs on top of one."),
 K("Each program is a <b>node</b> that does one job. Nodes send <b>messages</b> on named <b>topics</b>. A <b>publisher</b> sends; any number of <b>subscribers</b> receive. Neither needs to know about the other, only the topic's name and message type."),
 V("rb-ros", {"rate": 10}, "Nodes passing messages on topics. Stop the camera node and see who notices."),
 W("Splitting a robot into small nodes means each can be written, tested and restarted alone. Swap a real camera for a simulated one, and the rest of the robot never knows. That is why most research and many companies build on ROS 2."),
 EX("Message count", "A lidar node publishes at 10 Hz. How many scans in a minute?", ["$10 \\times 60 = 600$."], "600."),
 M("Building one giant program, or forgetting that a topic with no publisher stays silent. A node waiting for a topic that nobody publishes just waits."),
 H("Try it"),
 N(SETUP),
 P("Work through the official beginner tutorials in order: install, turtlesim, nodes, topics. Run <code>ros2 topic list</code> and <code>ros2 topic echo</code> to watch messages go by. Then write a tiny publisher and subscriber of your own in Python."),
 TRY,
], "ros"),

"services-actions": LES([
 P("Topics stream data. Sometimes a node needs to ask a question, or start a long job."),
 K("A <b>service</b> is one request and one reply, like asking a question. An <b>action</b> is for long jobs: you send a goal, get steady <b>feedback</b>, receive a <b>result</b>, and can <b>cancel</b> along the way."),
 TB(["Tool", "Pattern", "Good for"], [["Topic", "Stream, many listeners", "Sensor data, robot state"], ["Service", "Ask once, get one answer", "\"Reset the odometry\", \"what is the map?\""], ["Action", "Goal, feedback, result, cancel", "\"Drive to the kitchen\", \"move the arm there\""]]),
 W("Picking the right tool keeps the robot responsive. A service call to a two-minute job would leave the caller with no news and no way to stop it."),
 EX("Pick one", "Dock to the charger, which takes about a minute, and let the user stop it.", ["Long, needs progress and a way to stop."], "An action."),
 M("Using a service for a long task, so the caller waits with no progress and cannot cancel."),
 TRY,
], "ros"),

"units-conventions": LES([
 P("When many people write nodes for one robot, they must agree on units and directions. ROS has written agreements called REPs; REP 103 sets units and axes."),
 K("<b>REP 103:</b> use SI units: meters, seconds, kilograms, radians (and m/s, rad/s). Frames are right-handed. On a robot's body: <b>$x$ forward, $y$ left, $z$ up</b>. Positive rotation about $z$ is counterclockwise seen from above, so a positive turn is to the left."),
 V("rb-frames", {"x": 0, "y": 0, "th": 0}, "The robot's body frame: $x$ forward, $y$ to its left."),
 W("A node that publishes centimeters or degrees, while every other node expects meters and radians, gives answers off by a factor of 100 or 57. Agreeing once, in writing, avoids a whole family of bugs."),
 EX("Convert", "A heading of 45° in a ROS 2 message?", ["$45 \\times \\pi/180 \\approx 0.785$."], "About 0.785 rad."),
 M("Publishing degrees or centimeters where every other node expects radians and meters."),
 TRY,
], "rep103", "ros"),

"transforms": LES([
 P("A camera on the robot's head sees a ball. Where is the ball on the map? It takes a chain of frames to answer."),
 K("Each <b>transform</b> says how one frame sits in another: a rotation and a shift. To move a point from the camera frame to the map, apply <b>camera → base</b>, then <b>base → map</b>, working outward. In ROS 2 the <b>tf2</b> library keeps this chain up to date over time."),
 V("rb-frames", {"x": 1.5, "y": 1, "th": 45}, "A point seen in the robot's frame, placed on the map by rotate-then-shift."),
 W("The order matters because rotating and shifting do not commute: rotate then shift is a different move from shift then rotate. Working outward from the frame where the point was measured always gives the right order."),
 EX("Base to map", "Robot at (2, 3), heading 90°. Point $(1, 0)$ in the base frame.", ["Rotate by 90°: $(0, 1)$.", "Shift: $(2, 4)$."], "(2, 4) on the map."),
 M("Applying the transforms in the wrong order."),
 TRY,
], "ros", "mr"),

"simulation": LES([
 P("Simulators let you test a robot that you have not built, or test a risky move without breaking anything. Gazebo is the simulator most often used with ROS 2."),
 K("A simulator advances the world in fixed <b>time steps</b> $\\Delta t$: compute forces, update speeds, update positions, repeat. The <b>real-time factor</b> is simulated time divided by clock time: below 1 it runs slower than life, above 1 faster."),
 V("rb-pid", {"mode": "pid", "kp": 2, "ki": 0.2, "kd": 0.4}, "This picture is a tiny simulation itself: it steps a cart's motion forward in small time steps."),
 W("Smaller steps follow the true motion more closely but take more work; too large a step can make a simulation blow up. A slow real-time factor does not make the physics wrong, it only takes longer to watch. The catch with all simulation: real motors, friction and sensors differ from the model, so a design must still be tested on hardware."),
 EX("Steps", "1 ms steps, 10 s simulated.", ["$10 / 0.001 = 10{,}000$ steps."], "10,000 steps."),
 M("Thinking a slow simulation gives wrong answers, or that a large time step is always fine."),
 H("Try it"),
 P("Spawn a simple wheeled robot in Gazebo following the ROS 2 and Gazebo tutorials, drive it from the keyboard, and record its odometry topic. Then run your encoder-square test from the Navigation course in simulation and compare the drift with your real robot's."),
 TRY,
], "ros", "mr"),
}

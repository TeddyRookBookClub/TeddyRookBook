# Mobile Robots and Navigation (rbmobile): lessons.
LESSONS = {
"differential-drive": LES([
 P("Most small robots and robot vacuums steer like a tank: no steering wheel, just two drive wheels that can run at different speeds."),
 K("With right and left wheel speeds $v_R$, $v_L$ and the wheels $W$ apart: forward speed $v = \\dfrac{v_R + v_L}{2}$, turn rate $\\omega = \\dfrac{v_R - v_L}{W}$ (radians per second, positive = left), and the center drives a circle of radius $v/\\omega$."),
 V("rb-diffdrive", {"vl": 0.3, "vr": 0.5}, "Set the two wheel speeds and watch the path. Equal speeds go straight; opposite speeds spin in place."),
 W("Picture the robot turning about a point on its axle line. Both wheels turn at the same rate $\\omega$ about that point, but the outer wheel is $W$ farther away, so it must move $\\omega W$ faster. That gives $v_R - v_L = \\omega W$."),
 EX("Turn rate", "$v_L = 0.2$, $v_R = 0.4$ m/s, $W = 0.15$ m.", ["$v = 0.3\\ \\text{m/s}$.", "$\\omega = 0.2/0.15 \\approx 1.33\\ \\text{rad/s}$.", "Radius $= 0.3/1.33 \\approx 0.23\\ \\text{m}$."], "1.33 rad/s, curving left on a 0.23 m radius."),
 M("Dividing by half the wheel track instead of the whole track, or mixing up which wheel is faster in a left turn (the right one)."),
 TRY,
], "sieg", "mr"),

"odometry": LES([
 P("With no GPS indoors, a robot can still keep track of itself by adding up its own small moves. This is <b>odometry</b>, or dead reckoning."),
 K("Each loop, the encoders give a distance $d$ and a turn $\\Delta\\theta$. Update the pose: $x \\leftarrow x + d\\cos\\theta$, $y \\leftarrow y + d\\sin\\theta$, then $\\theta \\leftarrow \\theta + \\Delta\\theta$. Small loops make this simple rule accurate."),
 V("rb-diffdrive", {"vl": 0.4, "vr": 0.42, "drift": True}, "The true path and the odometry estimate. Watch them slowly separate."),
 W("Each step is a tiny straight move along the current heading, which is the coordinate-frames rule with the robot's own forward direction. But every step's small error is kept forever: slipping wheels, a slightly wrong wheel size. So odometry drifts, and the error grows the farther the robot goes."),
 EX("One step", "Pose $(1.0, 2.0)$, heading $60^\\circ$, move $0.5$ m.", ["$x = 1 + 0.5\\cos 60^\\circ = 1.25$.", "$y = 2 + 0.5\\sin 60^\\circ \\approx 2.43$."], "(1.25, 2.43)."),
 M("Updating the heading before moving when the rule says move first, or forgetting that small errors grow with every meter."),
 H("Hands-on: drive a square"),
 P("Program your robot to drive a 1-meter square using encoder odometry, and mark where it ends. Repeat five times. The gap between start and finish shows your odometry's drift. Try slower turns, or measuring your wheel size more carefully, and see what helps."),
 TRY,
], "sieg", "pr"),

"occupancy-grids": LES([
 P("To plan a path, a robot needs a map. The simplest robot map is a grid of squares on graph paper."),
 K("An <b>occupancy grid</b> cuts the floor into square cells of size $s$. A point at $x$ falls in column $\\lfloor x / s \\rfloor$ (round down, counting from 0). Each cell is marked <b>free</b>, <b>occupied</b> or <b>unknown</b>, often as a probability."),
 V("rb-astar", {"algo": "bfs"}, "A grid map. Click cells to add or remove walls."),
 W("A grid turns the world into something a computer can search. Smaller cells give a more exact map but more cells: halving the size makes four times as many, which takes more memory and more search time."),
 EX("Which cell?", "Cells 0.25 m wide. A point at $x = 1.6$ m.", ["$1.6 / 0.25 = 6.4$.", "Round down: column 6."], "Column 6."),
 EX("How big?", "A 5 m × 4 m room, 0.1 m cells.", ["$50 \\times 40 = 2000$ cells."], "2,000 cells."),
 M("Rounding to the nearest cell instead of down, or counting cells from 1."),
 TRY,
], "pr", "sieg"),

"grid-search": LES([
 P("Given a grid map, how does a robot find the shortest way around the walls?"),
 K("<b>Breadth-first search</b> (BFS) spreads out from the start one ring at a time, like ripples in a pond. The first time it reaches the goal, it has found a path with the fewest moves. <b>Dijkstra's algorithm</b> does the same when moves have different costs, always growing from the closest unfinished cell."),
 V("rb-astar", {"algo": "bfs"}, "Run the search step by step. Every cell in a ring is the same number of moves from the start."),
 W("BFS never reaches a cell by a long path before a short one, because it finishes each ring before starting the next. That guarantee is why it finds the shortest path. The cost is that it searches in every direction, even away from the goal."),
 EX("No walls", "From (0, 0) to (4, 3), moving up, down, left or right.", ["Every path needs 4 moves across and 3 up."], "7 moves."),
 M("Counting cells on the path, including the start, instead of moves. Seven moves visit eight cells."),
 N("The Math Ladder's shortest-paths topic covers Dijkstra's algorithm on general graphs."),
 TRY,
], "hart", "sieg"),

"a-star": LES([
 P("BFS searches in every direction. A* searches toward the goal first, and still finds the shortest path."),
 K("<b>A*</b> scores each waiting cell by $f = g + h$: $g$ is the cost so far and $h$ is a <b>guess</b> of the cost left. It always opens the cell with the smallest $f$. If $h$ never overestimates (it is <b>admissible</b>), A* finds a shortest path. On a 4-connected grid, the Manhattan distance $|\\Delta x| + |\\Delta y|$ works."),
 V("rb-astar", {"algo": "astar"}, "Compare A* with breadth-first search on the same walls. A* opens far fewer cells."),
 W("The guess pulls the search toward the goal. Because the guess is never too big, A* cannot be fooled into stopping on a longer path: any cell on a shorter path would have a smaller $f$ and be opened first. Peter Hart, Nils Nilsson and Bertram Raphael published it in 1968 for Shakey, one of the first mobile robots."),
 EX("Score a cell", "Goal at (9, 6). Cell (4, 2) reached with $g = 5$.", ["$h = 5 + 4 = 9$.", "$f = 5 + 9 = 14$."], "14."),
 M("Using a guess that can overestimate. A* may then find a path quickly, but not the shortest one."),
 TRY,
], "hart", "sieg"),

"slam-ideas": LES([
 P("Odometry drifts. A map needs to know where the robot is; knowing where the robot is needs a map. Doing both at once is called <b>SLAM</b>: simultaneous localization and mapping."),
 K("A heading error $\\theta$ pushes the robot sideways by about $d\\sin\\theta$ after $d$ meters, so errors grow with distance. Seeing a <b>landmark</b> again, whose place is already on the map, pulls the estimate back. Recognizing a place seen before and fixing the whole map is called <b>loop closure</b>."),
 V("rb-diffdrive", {"vl": 0.4, "vr": 0.4, "drift": True}, "Odometry drifts away from the true path. A real robot would use landmarks to correct it."),
 W("SLAM methods are built from the pieces in this ladder: odometry predicts, sensors measure, and a filter like the Kalman filter blends the two, now for the robot's pose and the landmarks' places together. Modern robot vacuums with lidar or cameras use SLAM to clean in neat rows."),
 EX("Sideways error", "A 2° heading error over 10 m.", ["$10 \\sin 2^\\circ \\approx 10 \\times 0.035 = 0.35\\ \\text{m}$."], "About 35 cm."),
 M("Thinking a small heading error stays small. Its effect grows with every meter driven."),
 N("This topic gives the ideas only. A full treatment needs probability through Bayes' rule and the multivariable Kalman filter; Probabilistic Robotics by Thrun, Burgard and Fox is the standard text."),
 TRY,
], "pr", "sieg"),
}

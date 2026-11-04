# Capstone Projects and Careers (rbcap): lessons. Career facts from the BLS Occupational Outlook Handbook pages
# (Mechanical Engineers and Electro-mechanical Technicians modified August 27, 2026; Electrical and Electronics
# Engineers modified October 29, 2026). Pay is the May 2025 median; projections are for 2025 to 2035.
LESSONS = {
"power-budget": LES([
 P("Robots stop for one reason more than any other: the battery ran down. A power budget tells you how long it will last before you build."),
 K("Add up the current of every part on the battery. Battery life is about $\\dfrac{\\text{usable capacity (mAh)}}{\\text{average current (mA)}}$ hours. Count only part of the capacity as usable, such as 80%: lithium packs should not be run completely flat."),
 TB(["Part", "Typical current"], [["Microcontroller board", "20 to 80 mA"], ["Raspberry Pi computer", "300 to 700 mA, more under load"], ["Two small drive motors", "300 mA to over 1 A; much more when stalled"], ["Hobby servo", "100 to 500 mA moving; more when straining"], ["Camera", "about 150 to 250 mA"]], "Rough figures; your parts' datasheets have the real ones."),
 W("Motors usually use most of the power, and their draw jumps when they climb or stall. A budget made with average numbers is a first guess; measure the real current with a multimeter or a current sensor, and plan on less run time than the math says."),
 EX("Run time", "Board 50 mA, motors 600 mA, sensor 20 mA, from a 2,000 mAh pack using 80%.", ["Total 670 mA.", "$0.8 \\times 2000 = 1600\\ \\text{mAh}$.", "$1600/670 \\approx 2.4$ hours."], "About 2.4 hours."),
 M("Forgetting the motors' current, or running a lithium battery right down to empty."),
 N('<div class="rb-safe"><b>Battery safety reminder.</b> Use the right lithium charger, never charge unattended, charge on a surface that will not burn, and retire any pack that is swollen or damaged. See <a href="/robotics/electronics-and-microcontrollers/safe-workbench/">A Safe Electronics Bench</a>.</div>'),
 TRY,
], "ada", "udel", "hh"),

"design-test": LES([
 P("A robot that worked once is a good start. A robot that works 19 times out of 20 is a finished project. The difference is testing."),
 K("Engineers work in a cycle: <b>design, build, test, change one thing, test again</b>. Run each version several times, record <b>every</b> run in a test log, and compare success rates."),
 TB(["Version", "Change", "Runs", "Successes", "Rate"], [["1", "first build", "10", "6", "60%"], ["2", "slower turns", "10", "8", "80%"], ["3", "new tires", "10", "7", "70%"]], "A sample test log for a line follower."),
 W("If you change three things at once and it gets better, you cannot tell which change helped, or whether one hurt. With only a few runs, luck can look like progress; more runs make the comparison fair. Competitions like FIRST reward teams that test this way."),
 EX("Success rate", "17 successes in 20 runs.", ["$17/20 = 0.85$."], "85%."),
 M("Changing three things at once, or only writing down the runs that worked."),
 H("A project ladder for your portfolio"),
 LI("<b>Rung 1:</b> a line follower with two light sensors and a state machine.",
    "<b>Rung 2:</b> an obstacle avoider with an ultrasonic sensor and encoder odometry; log its square-test drift.",
    "<b>Rung 3:</b> a two-joint servo arm that reaches typed-in targets with inverse kinematics.",
    "<b>Rung 4:</b> a wheel-speed PID controller with a plot of step responses at three gains.",
    "<b>Rung 5:</b> a ball chaser with a camera and color thresholding.",
    "<b>Rung 6:</b> the same robot in ROS 2: nodes for the camera, the controller and the motors, tested first in simulation."),
 P("For each rung, write a one-page report: the goal, a photo or short video, the code, the test log, and what you would change next. That stack of pages is a portfolio."),
 TRY,
], "first", "ocw"),

"careers": LES([
 P("Robotics jobs are real and interesting, and the path to them is well known. Here is what the official numbers say, without hype."),
 K("\"Robotics engineer\" is not its own category in U.S. government job data. The Bureau of Labor Statistics (BLS) counts robotic engineers among <b>mechanical engineers</b>; many others work as electrical and electronics engineers, software developers, or <b>electro-mechanical and mechatronics technicians</b>. Engineering jobs typically start with a <b>bachelor's degree</b>; technician jobs with an <b>associate's degree or a certificate</b>."),
 TB(["Occupation (BLS)", "Typical entry education", "Median pay, May 2025", "Projected growth, 2025–2035"], [
   ["Mechanical engineers (includes robotic engineers)", "Bachelor's degree", "\\$104,110", "11%"],
   ["Electrical and electronics engineers", "Bachelor's degree", "\\$125,040", "8%"],
   ["Electro-mechanical and mechatronics technologists and technicians", "Associate's degree or postsecondary certificate", "\\$73,900", "3%"]],
   "Source: BLS Occupational Outlook Handbook, pages modified August and October 2026. Projections are estimates and can change."),
 W("Short online roadmaps can build real skills and a portfolio, and that matters at every level. But a few months of self-study is not the same as an engineering degree, and employers know it. An honest plan uses self-study to explore, to build projects, and to prepare for a technician program, a degree, or a robotics-related software role."),
 LI("<b>Middle and high school:</b> FIRST LEGO League, FIRST Tech Challenge and FIRST Robotics Competition; math through precalculus, and calculus if you can; physics.",
    "<b>Two-year path:</b> a community college program in mechatronics, electronics or automation leads to technician work that keeps robots running in factories and warehouses.",
    "<b>Four-year path:</b> a bachelor's in mechanical, electrical or computer engineering, or computer science, with robotics electives, a robotics club and internships.",
    "<b>Career changers:</b> people with software or technician experience often move in through robotics software or test roles, building on what they know."),
 EX("Hours", "Ten hours a week for 26 weeks.", ["$10 \\times 26 = 260$ hours."], "260 hours: about two college courses' worth of work."),
 M("Believing a six-month course alone leads to an engineering job title."),
 N('See our <a href="/robotics/roadmap/">Six-Month Roadmap, Improved</a> for a realistic plan, and the <a href="/being-an-adult/apply-for-a-job/">Apply for a Job</a> guide for résumés and interviews.'),
 TRY,
], "bls_me", "bls_ee", "bls_tech", "first"),
}

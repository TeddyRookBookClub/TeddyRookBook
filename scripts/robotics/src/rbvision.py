# Robot Vision (rbvision): lessons.
LESSONS = {
"pixels": LES([
 P("To a robot, a picture is not a scene. It is a big table of numbers."),
 K("An image is a grid of <b>pixels</b>, $w$ wide and $h$ tall. A grayscale pixel is one number, usually 0 (black) to 255 (white), one byte. A color pixel stores three: red, green and blue. So a color frame takes $w \\times h \\times 3$ bytes."),
 W("Knowing the size of an image tells you what a small computer can handle. A 640 × 480 color frame is 921,600 bytes; at 30 frames a second, that is about 28 MB every second. Robots shrink images, turn them gray, or look at only part of them to keep up."),
 EX("Frame size", "A 320 × 240 color image.", ["$320 \\times 240 = 76{,}800$ pixels.", "$\\times 3 = 230{,}400$ bytes."], "230,400 bytes."),
 M("Forgetting the three color channels, or mixing up bits and bytes (8 bits make 1 byte)."),
 H("Hands-on: see the numbers"),
 N('<div class="rb-parts"><b>Camera setups</b> (approximate U.S. prices, 2026)<ul><li><b>\\$0:</b> your computer\'s webcam with free Python image libraries.</li><li><b>About \\$25 to \\$35:</b> a Raspberry Pi camera module for a Raspberry Pi you already have.</li><li><b>About \\$60 to \\$90:</b> a small smart-camera board that finds colors and tags itself and sends results to a microcontroller.</li></ul></div>'),
 P("Load a photo in Python and print the three numbers of one pixel on a red apple and one on a leaf. Which number is biggest in each?"),
 TRY,
], "szel", "rpi"),

"color-threshold": LES([
 P("The simplest way to find a red ball: keep the pixels that look red and ignore the rest."),
 K("<b>Thresholding</b> tests every pixel and keeps those that pass, making a black-and-white <b>mask</b>. A simple redness test: keep pixels where $r - \\dfrac{g + b}{2} > T$ for some threshold $T$."),
 V("rb-threshold", {"t": 60}, "Slide the threshold. Too low, and the background sneaks in; too high, and the ball disappears."),
 W("A pure red has a big red number and small green and blue. White is bright in all three, so plain \"red &gt; 150\" would wrongly keep white. Subtracting the other channels asks how much <i>more</i> red there is, which is closer to what our eyes call red."),
 EX("Test a pixel", "Pixel (200, 80, 60), $T = 60$.", ["$(80 + 60)/2 = 70$.", "$200 - 70 = 130 > 60$."], "It passes."),
 M("Setting one threshold in a bright room and being surprised when it fails in a dim one. Light changes all the numbers; many robots use color spaces such as HSV that separate color from brightness."),
 TRY,
], "szel"),

"centroid-steering": LES([
 P("The mask shows where the ball is. Now steer toward it."),
 K("The target's <b>center</b> (centroid) is the average column of the pixels that passed. The <b>steering error</b> is that column minus the image's middle column, $w/2$. Feed it to a proportional controller: turn toward the target, harder when it is farther off center."),
 V("rb-threshold", {"t": 50}, "The cross marks the center of the kept pixels. The readout gives the steering error."),
 W("This is closed-loop control with a camera as the sensor. Each frame measures the error and the robot corrects; as it turns, the ball moves toward the middle and the error shrinks. It is how many FIRST robots line up with targets."),
 EX("Steering error", "Image 320 wide; kept pixels in columns 210, 214, 220, 224.", ["Center: $(210 + 214 + 220 + 224)/4 = 217$.", "Error: $217 - 160 = 57$."], "57 pixels right of center: turn right."),
 M("Measuring the error from the left edge instead of from the center."),
 H("Hands-on: a ball-chasing robot"),
 P("Put a camera on your mobile robot. Each frame: threshold for your ball's color, find the center, and set the wheel speeds from the steering error. Start with a small gain and raise it until the robot turns briskly without wobbling."),
 N('<div class="rb-safe"><b>Safety.</b> Chase a soft ball in an open room at low speed, with the power switch in reach. Keep the robot away from stairs.</div>'),
 TRY,
], "szel", "first"),

"pinhole-camera": LES([
 P("A camera squashes the 3-D world onto a flat image. A simple model tells us exactly how, and lets a robot measure distance with one camera."),
 K("In the <b>pinhole model</b>, an object of height $H$ at distance $Z$ makes an image $h = \\dfrac{f\\,H}{Z}$ pixels tall, where $f$ is the focal length measured in pixels. Know the object's real size, and $Z = \\dfrac{f\\,H}{h}$."),
 V("rb-pinhole", {"h": 1, "z": 3, "f": 500}, "Move the object closer or farther, or make it bigger. The image size changes as $f H / Z$."),
 W("Light from the top and bottom of the object passes through the pinhole and makes two similar triangles, one outside the camera and one inside. Similar triangles have equal ratios: $h/f = H/Z$. The Math Ladder's similar-triangles topic is all you need."),
 EX("How far?", "A 0.2 m ball looks 50 pixels wide, with $f = 600$.", ["$Z = 600 \\times 0.2 / 50 = 2.4\\ \\text{m}$."], "2.4 m."),
 M("Mixing units: the focal length is in pixels, and the size and distance must both be in meters (or both in centimeters)."),
 N("Real lenses bend straight lines a little; camera calibration measures $f$ and that bending from photos of a checkerboard."),
 TRY,
], "szel", "mr"),
}



function playGame() {
	window.location.href = "./robot_battle_game.html";
}

// needed due to Inkscape calculating y values from bottom to top, rather than top to bottom
var yOffset = 500;

// just to put the robot in a better place on the canvas
var xOffset = 20;

function drawStrokedRect(ctx, x, y, width, height) {
	ctx.fillRect(x + xOffset, yOffset - y - height, width, height);
	ctx.strokeRect(x + xOffset, yOffset - y - height, width, height);
}

function drawChestDecoration(ctx) {
   ctx.strokeStyle = "black";
   ctx.lineWidth = 2;
   ctx.strokeRect(71 + xOffset, 258, 96, 60);

   // ctx.beginPath();
   // ctx.moveTo(120 , 330);
   // ctx.lineTo(138, 330);
   // ctx.stroke();
}

function drawEyes(ctx) {
   // eyes
   ctx.fillStyle = "#ffffff"; // white
   ctx.lineWidth=5;
   ctx.beginPath();

   var y = 164;

   ctx.stroke();
   ctx.arc(100 + xOffset, y, 7, 0, 2*Math.PI);
   ctx.fill();

   ctx.moveTo(138 + xOffset, y);
   ctx.arc(138 + xOffset, y, 7, 0, 2*Math.PI);
   ctx.stroke();
   ctx.fill();
}

function drawRobot(ctx, colour) {
   ctx.fillStyle = colour;
   ctx.strokestyle = "black";
   ctx.lineWidth = 3;

   // head
	drawStrokedRect(ctx, 90, 293, 57, 84);
   drawStrokedRect(ctx, 64, 316, 109, 38);

	// neck
   drawStrokedRect(ctx, 106, 285, 26, 8);

   // body
   drawStrokedRect(ctx, 50, 125, 136, 162);
   drawStrokedRect(ctx, 8, 260, 220, 27);

   // arms
   drawStrokedRect(ctx, 8, 170, 27, 117);
   drawStrokedRect(ctx, 201, 166, 27, 121);

   // hands
   drawStrokedRect(ctx, 0, 141, 42, 32);
   drawStrokedRect(ctx, 194, 136, 42, 32);

   // legs
   drawStrokedRect(ctx, 71, 0, 42, 125);
   drawStrokedRect(ctx, 127, 0, 42, 125);

   // feet
   drawStrokedRect(ctx, 48, 1, 65, 26);
	drawStrokedRect(ctx, 127, 1, 68, 26);

   drawEyes(ctx);
   drawChestDecoration(ctx);
}

function drawRobots() {
   var goodRobotCanvas = document.getElementById('goodRobot');
   var goodRobotContext = goodRobotCanvas.getContext('2d');
   var badRobotCanvas = document.getElementById('badRobot');
   var badRobotContext = badRobotCanvas.getContext('2d');

   if (goodRobotCanvas.getContext) {
      drawRobot(goodRobotContext, "firebrick");
   }

   if (badRobotCanvas.getContext) {
      drawRobot(badRobotContext, "limegreen");
   }
}

function playGame() {
   document.getElementById("introDiv").style.display = 'none';
   document.getElementById("gameDiv").style.display = 'block';
   drawRobots();
}

// renders the screen

// just to put the robot in a better place on the canvas
var yOffset = 5;
var xOffset = 20;

//    draw and clear rectangles . . .
function drawOffsetStrokedRect(ctx, x, y, width, height) {
   ctx.fillRect(x + xOffset, y + yOffset, width, height);
   ctx.strokeRect(x + xOffset, y + yOffset, width, height);
}

function clearOffsetStrokedRect(ctx, x, y, width, height) {
   ctx.clearRect(x + xOffset, y + yOffset, width, height);
   ctx.strokeStyle = $("body").css("background-color");
   ctx.lineWidth = 4;
   ctx.strokeRect(x + xOffset, y + yOffset, width, height);
}

function drawStrokedRectWithGradient(ctx, position, colour, canvas) {
   var width = canvas.width;
   var halfWidth = width / 2;
   var y = canvas.height - ((1 + position) * width);

   // Create radial gradient, in the form (x,y,r,x1,y1,r1) . . .
   ctx.moveTo(0, y);
   var gradient = ctx.createRadialGradient(halfWidth, y + halfWidth, 7, 30, y + halfWidth, halfWidth);
   gradient.addColorStop(0, "gold");
   gradient.addColorStop(1, colour);
   ctx.fillStyle = gradient;

   ctx.fillRect(0, y, width, width);
   ctx.strokeStyle = "black";
   ctx.lineWidth = 2;
   ctx.strokeRect(0, y, width, width);
}

var screen = {
   draw() {
      goodRobot.draw();
      badRobot.draw();
   }
};

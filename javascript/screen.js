// renders the screen
var screen = (function() {
   // just to put the robot in a better place on the canvas
   const xOffset = 20;
   const yOffset = 5;

   //    draw and clear rectangles . . .
   var drawOffsetStrokedRect = function(ctx, x, y, width, height) {
      ctx.fillRect(x + xOffset, y + yOffset, width, height);
      ctx.strokeRect(x + xOffset, y + yOffset, width, height);
   };

   var clearOffsetStrokedRect = function(ctx, x, y, width, height) {
      ctx.clearRect(x + xOffset, y + yOffset, width, height);
      ctx.strokeStyle = $("body").css("background-color");
      ctx.lineWidth = 4;
      ctx.strokeRect(x + xOffset, y + yOffset, width, height);
   };

   var drawStrokedRectWithGradient = function(ctx, position, colour, canvas) {
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
   };

   var draw = function(goodRobot, badRobot, goodEnergyBar, badEnergyBar, calculation) {
      goodRobot.draw();
      badRobot.draw();
      goodEnergyBar.draw();
      badEnergyBar.draw();
      calculation.draw();
   };

   return {
      drawOffsetStrokedRect,
      clearOffsetStrokedRect,
      drawStrokedRectWithGradient,
      draw,
      // at some point it would be good not to need to export these offset values,
      // i.e. put those methods that use them into this class in some form
      xOffset,
      yOffset
   };

}());

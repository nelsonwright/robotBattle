var EnergyBar = function(robot, canvas, colour) {
   var context;

   if (canvas.getContext) {
      context = canvas.getContext("2d");
   }

   var draw = function() {
      // blank the canvas before drawing anything . . .
      canvas.width = canvas.width;

      for (let i = 0; i < robot.energy; i++) {
         screen.drawStrokedRectWithGradient(context, i, colour, canvas);
      }
   };

   return {
      draw
   };
};

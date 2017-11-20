var timer = (function() {
   var canvas, context, timeRemaining;

   var setup = function(canvas) {
      this.canvas = canvas;

      if (canvas.getContext) {
         this.context = canvas.getContext("2d");
      }
   };

   var setTimeRemaining = function(timeRemaining) {
      this.timeRemaining = timeRemaining;
   };

   var draw = function() {
      var timeRemainingBoxWidth;
      this.context.fillStyle = "orange";

      timeRemainingBoxWidth = (timer.timeRemaining / gameState.timeForSums) * timer.canvas.width;
      this.context.fillRect(0, 0, timeRemainingBoxWidth, 60);
   };

   var clearCanvas = function() {
      this.canvas.width = this.canvas.width;
   };


  // Explicitly reveal public pointers to the private functions
  // that we want to reveal publicly

   return {
      setup: setup,
      setTimeRemaining: setTimeRemaining,
      draw: draw,
      clearCanvas: clearCanvas
   }

})();

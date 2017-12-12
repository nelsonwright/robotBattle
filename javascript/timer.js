var timer = (function() {
   var canvas, context, timeRemaining, totalTimeForQuestion;

   var setup = function(canvas) {
      this.canvas = canvas;

      if (this.canvas.getContext) {
         this.context = canvas.getContext("2d");
      }
   };

   var setTimeForQuestion = function(timeRemaining) {
      this.timeRemaining = timeRemaining;
      this.totalTimeForQuestion = timeRemaining;
   };

   var timeLeft = function() {
      return this.timeRemaining;
   };

   var clearCanvas = function() {
      this.canvas.width = this.canvas.width;
   };

   var decrement = function() {
      this.timeRemaining--;
   };

   var draw = function() {
      var timeRemainingBoxWidth;

      this.clearCanvas();
      this.context.fillStyle = "orange";
      timeRemainingBoxWidth = (this.timeRemaining / this.totalTimeForQuestion) * this.canvas.width;
      this.context.fillRect(0, 0, timeRemainingBoxWidth, 60);
   };

  // Explicitly reveal public pointers to the private functions
  // that we want to reveal publicly

   return {
      setup,
      setTimeForQuestion,
      timeLeft,
      clearCanvas,
      decrement,
      draw
   };

}());

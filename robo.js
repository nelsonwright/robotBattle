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

// these are the unicode values for the keyboard keys when pressed
var key = Object.freeze({
   isTopRowDigit(actionCode) {
      return actionCode >= 48 && actionCode <= 57;
   },
   isKeypadDigit(actionCode) {
      return actionCode >= 96 && actionCode <= 105;
   },
   isDigit(actionCode) {
      return this.isTopRowDigit(actionCode) || this.isKeypadDigit(actionCode);
   },
   enter: 13   // the enter or return key
});

var questionOutcome = Object.freeze({
   correct: "Got it right!",
   incorrect: "Wrong!",
   tooSlow: "Too slow!"
});

var gameState = {
   battleInProgress: false,      // to indicate if we're battling a robot
   timeForSums: 10,              // how many seconds you have to complete a sum
   timerId: null,                // ID for when we want to pause for a bit
   goodRobotMaxEnergy: 8,        // how many energy cells the good robot starts with
   badRobotMaxEnergy: 8,         // how many energy cells the bad robot starts with
   pauseBetweenQuestions: 2.5,   // time in seconds between questions
   lightRippleFrequency: 2,      // how many times a second to ripple the robot body lights
   lightRippleIntervalId: null   // ID for light rippling, as above
};

function Robot(colour, lightColours, canvas) {
   this.colour = colour;
   this.lightColours = Object.freeze(lightColours);
   this.canvas = canvas;
   this.context = null;

   var self = this;

   if (this.canvas.getContext) {
      this.context = this.canvas.getContext("2d");
   }

   function drawBodyLight(position) {
      var y = 152 + yOffset;
      var x = 87;
      var areaWidth = 100;
      var circleRadius = 5;

      self.context.beginPath();
      self.context.moveTo(x + xOffset + position * (areaWidth/3), y);
      self.context.arc(x + xOffset + position * (areaWidth/3), y, circleRadius, 0, 2 * Math.PI);

      self.context.stroke();
      self.context.fill();
   }

   function drawEyes() {
      var y = 337 + yOffset;
      self.context.fillStyle = "white";
      self.context.lineWidth = 4;

      self.context.beginPath();
      self.context.arc(100 + xOffset, y, 7, 0, 2*Math.PI);
      self.context.stroke();
      self.context.fill();

      self.context.moveTo(138 + xOffset, y);
      self.context.arc(138 + xOffset, y, 7, 0, 2*Math.PI);
      self.context.stroke();
      self.context.fill();
   }

   function clearLeftArmAndHand() {
      clearOffsetStrokedRect(self.context, 8, 170, 27, 117);
      clearOffsetStrokedRect(self.context, 0, 141, 42, 32);
   }

   function drawLeftArmAndHand() {
      drawOffsetStrokedRect(self.context, 8, 170, 27, 117);
      drawOffsetStrokedRect(self.context, 0, 141, 42, 32);
   }

   function drawRightArmAndHand() {
      drawOffsetStrokedRect(self.context, 201, 166, 27, 121);
      drawOffsetStrokedRect(self.context, 194, 136, 42, 32);
   }

   function drawLeftArmAndHandUp() {
      clearLeftArmAndHand();

      self.context.fillStyle = self.colour;
      self.context.strokeStyle = "black";

      drawOffsetStrokedRect(self.context, 8, 260, 27, 160);
   }

   function drawArmsAndHands() {
      drawLeftArmAndHand();
      drawRightArmAndHand();
   }

   this.drawBodyLights = function() {
      var i;  //loop counter

      self.context.lineWidth = 2;

      for (i=0; i<3; i++) {
         self.context.fillStyle = this.lightColours[i];
         drawBodyLight(i);
      }
   };

   this.chooseAndDrawLights = function() {
      var i;  //loop counter
      var lightToChange;
      var randomColourIndex;

      for (i = 0; i < 2; i++) {
         lightToChange = Math.floor(Math.random() * 3);
         randomColourIndex = Math.floor(Math.random() * this.lightColours.length);

         this.context.fillStyle = this.lightColours[randomColourIndex];
         drawBodyLight(lightToChange);
      }
   };

   this.draw = function() {
      function drawBodyDecoration() {
         var y = 185 + yOffset;
         var x = 71;
         var width =  96;
         var height = 60;
         var i; // loop counter

         self.context.strokeStyle = "black";
         self.context.lineWidth = 2;

         self.context.strokeRect(x + xOffset, y, width, height);

         // draw the grille on the body
         for (i=0; i<3; i++) {
               // horizontal lines
               self.context.beginPath();
               self.context.moveTo(x + xOffset, y + i*(height/3));
               self.context.lineTo(x + xOffset + width, y + i*(height/3));
               self.context.stroke();
         }

         for (i=0; i<4; i++) {
            //vertical lines
            self.context.beginPath();
            self.context.moveTo(x + xOffset + i*(width/4), y);
            self.context.lineTo(x + xOffset + i*(width/4), y + height);
            self.context.stroke();
         }

         self.drawBodyLights();
      }

      // first, blank the canvas . . .
      this.canvas.width = this.canvas.width;

      // needed due to Inkscape calculating y values from bottom to top, rather than
      // top to bottom, and the drawing points are taken from Inkscape designs
      this.context.translate(0, this.canvas.height);
      this.context.scale(1,-1);

      this.context.fillStyle = this.colour;
      this.context.strokestyle = "black";
      this.context.lineWidth = 4;

      // head
      drawOffsetStrokedRect(this.context, 90, 293, 57, 84);
      drawOffsetStrokedRect(this.context, 64, 316, 109, 38);

      // neck
      drawOffsetStrokedRect(this.context, 106, 285, 26, 8);

      // body
      drawOffsetStrokedRect(this.context, 50, 125, 136, 162);
      drawOffsetStrokedRect(this.context, 8, 260, 220, 27);

      drawArmsAndHands();

      // legs
      drawOffsetStrokedRect(this.context, 71, 0, 42, 125);
      drawOffsetStrokedRect(this.context, 127, 0, 42, 125);

      // feet
      drawOffsetStrokedRect(this.context, 48, 0, 65, 26);
      drawOffsetStrokedRect(this.context, 127, 0, 68, 26);

      drawEyes();
      drawBodyDecoration();
   };
}

var goodRobot;
var badRobot;

function rippleRobotBodyLights () {
   goodRobot.chooseAndDrawLights();
   badRobot.chooseAndDrawLights();
}

function EnergyBar() {
   this.canvas = null;
   this.context = null;
   this.colour = null;
}

var goodEnergyBar = new EnergyBar();
var badEnergyBar = new EnergyBar();

var timer = {
   canvas: null,
   context:  null,
   timeRemaining: null,
   setup(canvas) {
      this.canvas = canvas;

      if (canvas.getContext) {
         this.context = canvas.getContext("2d");
      }
   },
   setTimeRemaining() {
      this.timeRemaining = gameState.timeForSums;
   },
   draw() {
      var timeRemainingBoxWidth;
      this.context.fillStyle = "orange";

      timeRemainingBoxWidth = (timer.timeRemaining / gameState.timeForSums) * timer.canvas.width;
      this.context.fillRect(0, 0, timeRemainingBoxWidth, 60);
   },
   clearCanvas() {
      this.canvas.width = this.canvas.width;
   }
};

var calculation = {
   firstFactor: null,
   secondFactor: null,
   digitToGuess: null,
   answerIndex: null,
   questionText: "",
   answerText: "",
   resultText: null,
   inProgress: false, // indicates if we're answering a question at the moment
   intervalId: null,  // timer id for this question
   create() {
      this.firstFactor = Math.floor(Math.random() * 10 + 2);
      this.secondFactor = Math.floor(Math.random() * 10 + 2);
      this.answerIndex = 0;
      this.digitToGuess = this.calcDigitToGuess();
   },
   product() {
      return this.firstFactor * this.secondFactor;
   },
   createQuestionText() {
      this.wipeText();
      this.create();
      this.answerText = "?";
      this.questionText = this.firstFactor + " X " + this.secondFactor + " = ";
      this.resultText = "Awaiting answer . . .";
      return this.questionText + " " + this.answerText;
   },
   correctDigitGuessed(digitGuessed) {
      return digitGuessed === this.digitToGuess;
   },
   calcDigitToGuess () {
      return parseInt(this.product().toString()[this.answerIndex]);
   },
   updateDigitToGuess() {
      this.answerIndex++;
      this.digitToGuess = this.calcDigitToGuess();
   },
   gotItAllCorrect() {
      return this.answerIndex >= parseInt(this.product().toString().length);
   },
   wipeText() {
      this.resultText = " ";
      this.answerText = "";
      this.questionText = "";
   },
   composeCorrectAnswerText() {
      return "It's " + this.product();
   }
};

function drawRobots() {
   goodRobot.draw();
   badRobot.draw();
}

/**************************
*   draw the energy bars
***************************/
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

function drawEnergyBar(energyBar, robot) {
   // blank the canvas before drawing anything . . .
   energyBar.canvas.width = energyBar.canvas.width;

   for (var i = 0; i < robot.energy; i++) {
      drawStrokedRectWithGradient(energyBar.context, i, energyBar.colour, energyBar.canvas);
   }
}

function drawGoodRobotEnergyBar() {
   drawEnergyBar(goodEnergyBar, goodRobot);
}

function drawBadRobotEnergyBar() {
   drawEnergyBar(badEnergyBar, badRobot);
}

function drawEnergyBars() {
   drawGoodRobotEnergyBar();
   drawBadRobotEnergyBar();
}

// end of energy bar drawing section

function setEnergyBarAttributes() {
   goodEnergyBar.canvas = document.getElementById("energyBarGood");
   goodEnergyBar.colour = "firebrick";

   if (goodEnergyBar.canvas.getContext) {
      goodEnergyBar.context = (goodEnergyBar.canvas.getContext("2d"));
   }

   badEnergyBar.canvas = document.getElementById("energyBarBad");
   badEnergyBar.colour = "green";

   if (badEnergyBar.canvas.getContext) {
      badEnergyBar.context = (badEnergyBar.canvas.getContext("2d"));
   }
}

function setRobotAttributes() {
   var lightColours = ["gold", "mediumpurple", "limegreen", "white", "royalblue", "orange"];
   goodRobot = new Robot("firebrick", lightColours, document.getElementById("goodRobot"));

   lightColours = ["red", "royalblue", "magenta", "gold", "white", "plum"];
   badRobot = new Robot("limegreen", lightColours, document.getElementById("badRobot"));
}

function setTimerAttributes() {
   timer.setup(document.getElementById("questionTimer"));
}

function initialiseModels() {
   setRobotAttributes();
   setEnergyBarAttributes();
   setTimerAttributes();
}

function setUpQuestion() {
   document.getElementById("questionAndAnswersPara").textContent = calculation.createQuestionText();
   document.getElementById("resultPara").textContent = calculation.resultText;
   timer.setTimeRemaining();
   clearInterval(calculation.intervalId);
}

function unicodeToNumeral(numberCode) {
   // the digits 0-9 on the top row of the keyboard are unicode values 48 - 57
   // the numeric keypad digits are unicode values 96 - 105

   var digitPressed;

   if (key.isTopRowDigit(numberCode)) {
      digitPressed = numberCode - 48;
   } else {
      digitPressed = numberCode - 96;
   }

   return digitPressed;
}

function setNumberButtonsDisabled(disabledState) {
   var buttons = $("#numeralsDiv button");

   if (disabledState) {
      buttons
      .attr("disabled","disabled")
      .fadeTo("fast", 0.5);
   } else {
      buttons
      .removeAttr('disabled')
      .fadeTo("fast", 1);
   }
}

function disableNumberButtons() {
   setNumberButtonsDisabled(true);
}

function enableNumberButtons() {
   setNumberButtonsDisabled(false);
}

function resetRobotBodyLights() {
   goodRobot.drawBodyLights();
   badRobot.drawBodyLights();
}

function displayTimerValue() {
   timer.clearCanvas();
   timer.draw();
}

function showNumberButtons() {
   $("#numeralsDiv").toggleClass("hidden");
   $("#playAgain").toggleClass("hidden");
}

function showPlayAgainButton() {
   $("#numeralsDiv").toggleClass("hidden");
   $("#playAgain").toggleClass("hidden");
}

function stopRipplingBodyLights() {
   clearInterval(gameState.lightRippleIntervalId);
   gameState.lightRippleIntervalId = null;
}

function startRipplingBodyLights() {
   gameState.lightRippleIntervalId = setInterval(rippleRobotBodyLights, (1 / gameState.lightRippleFrequency) * 1000);
}

function stopTimers() {
   clearTimeout(gameState.timerId);
   clearInterval(calculation.intervalId);
   stopRipplingBodyLights();
}

function checkEnergy() {
   drawEnergyBars();

   if (goodRobot.energy < 0) {
      stopTimers();

      $("#questionAndAnswersPara").text("Bad Robot Wins!");
      $("#resultPara").text("Oh no!");
      showPlayAgainButton();
      return;
   }

   if (badRobot.energy < 0) {
      stopTimers();

      $("#questionAndAnswersPara").text("Good Robot Wins!");
      $("#resultPara").text("Hooray!");
      showPlayAgainButton();
      return;
   }
}

function stopQuestion() {
   stopTimers();
   disableNumberButtons();
}

function showFeedbackToAnswer(outcome) {
   stopQuestion();

   if (outcome === questionOutcome.correct) {
      calculation.resultText = outcome.toString();
   } else {
      calculation.resultText = outcome.toString() + " " + calculation.composeCorrectAnswerText();
   }

   $("#resultPara").text(calculation.resultText);
}

function getNextQuestionReadyIfBothRobotsAlive() {
   if (goodRobot.energy >= 0 && badRobot.energy >= 0) {
      gameState.intervalId = setTimeout(resetForNextQuestion, gameState.pauseBetweenQuestions * 1000);
   }
}

function handleTimerRunDown() {
   stopTimers();
   showFeedbackToAnswer(questionOutcome.tooSlow);
   goodRobot.energy--;
   checkEnergy();
   calculation.inProgress = false;

   timer.clearCanvas();
   resetRobotBodyLights();
   getNextQuestionReadyIfBothRobotsAlive();
}

function processSums() {
   timer.timeRemaining--;

   if (timer.timeRemaining > 0) {
      displayTimerValue();
   } else {
      handleTimerRunDown();
   }
}

function resetForNextQuestion() {
   calculation.wipeText();
   setUpQuestion();
   displayTimerValue();

   calculation.inProgress = true;
   enableNumberButtons();
   calculation.intervalId = setInterval(processSums, 1000);
   startRipplingBodyLights();
}

function humanReadyToDoSums() {
   document.getElementById("humanReady").className="hidden";
   document.getElementById("questionAndAnswersPara").className="questionAndAnswersPara";
   document.getElementById("resultPara").className="";
   setUpQuestion();
   displayTimerValue();

   // we'll need to set these up at different points later, but for now, both here is ok . . .
   gameState.battleInProgress = true;
   calculation.inProgress = true;

   enableNumberButtons();
   startRipplingBodyLights();
   calculation.intervalId = setInterval(processSums, 1000);
}

function getNextQuestionIfAlive() {
   resetRobotBodyLights();
   checkEnergy();
   calculation.inProgress = false;
   getNextQuestionReadyIfBothRobotsAlive();
}

function setInitialRobotEnergy() {
   goodRobot.energy = gameState.goodRobotMaxEnergy;
   badRobot.energy = gameState.badRobotMaxEnergy;
}

function drawInitialEnergyBars() {
   setInitialRobotEnergy();
   drawEnergyBars();
}

function processCorrectDigit() {
   calculation.updateDigitToGuess();

   if (calculation.gotItAllCorrect()) {
      stopQuestion();
      showFeedbackToAnswer(questionOutcome.correct);
      badRobot.energy--;
      getNextQuestionIfAlive();
   }
}

function processIncorrectDigit() {
   stopTimers();
   showFeedbackToAnswer(questionOutcome.incorrect);
   goodRobot.energy--;
   getNextQuestionIfAlive();
}

function processAttemptedSumAnswer(digitPressed) {
   calculation.answerText = calculation.answerText === "?" ? digitPressed : calculation.answerText + digitPressed.toString();
   document.getElementById("questionAndAnswersPara").textContent = calculation.questionText + calculation.answerText;

   if (calculation.correctDigitGuessed(digitPressed)) {
      processCorrectDigit();
   } else {
      processIncorrectDigit();
   }
}

function noBattleInProgress() {
   return !gameState.battleInProgress;
}

function interpretNumberInput(number) {
   if (calculation.inProgress) {
      processAttemptedSumAnswer(number);
   } else if (noBattleInProgress()) {
      humanReadyToDoSums();
   }
}

function clickedANumber(numberButton) {
   interpretNumberInput(parseInt(numberButton.textContent));
}

function pressedAKey(e) {
   var unicode = e.keyCode? e.keyCode : e.charCode;

   if (key.isDigit(unicode)) {
         interpretNumberInput(unicodeToNumeral(unicode));
   }
}

function startAnotherGame() {
   drawRobots();
   showNumberButtons();
   enableNumberButtons();
   drawInitialEnergyBars();
   humanReadyToDoSums();
}

function swapIntroForGameScreen() {
   $("#introDiv, #gameDiv").toggleClass("hidden");
}

function playGame() {
   swapIntroForGameScreen();
   initialiseModels();
   drawRobots();
   drawInitialEnergyBars();
}

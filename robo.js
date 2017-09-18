// just to put the robot in a better place on the canvas
var yOffset = 5;
var xOffset = 20;

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

   if (this.canvas.getContext) {
      this.context = this.canvas.getContext("2d");
   }
}

var goodRobot;
var badRobot;

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

/**************************************
*   Stuff to do with drawing the robot
***************************************/
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

function drawBodyLight(ctx, position) {
   var y = 152 + yOffset;
   var x = 87;
   var areaWidth = 100;
   var circleRadius = 5;

   ctx.beginPath();
   ctx.moveTo(x + xOffset + position * (areaWidth/3), y);
   ctx.arc(x + xOffset + position * (areaWidth/3), y, circleRadius, 0, 2 * Math.PI);

   ctx.stroke();
   ctx.fill();
}

function drawBodyLights(robot) {
   var ctx = robot.context;
   var i;  //loop counter

   ctx.lineWidth = 2;

   for (i=0; i<3; i++) {
      ctx.fillStyle = robot.lightColours[i];
      drawBodyLight(ctx, i);
   }
}

function chooseAndDrawLights(robot) {
   var ctx = robot.context;
   var i;  //loop counter
   var lightToChange;
   var randomColourIndex;

   for (i = 0; i < 2; i++) {
      lightToChange = Math.floor(Math.random() * 3);
      randomColourIndex = Math.floor(Math.random() * robot.lightColours.length);

      ctx.fillStyle = robot.lightColours[randomColourIndex];
      drawBodyLight(ctx, lightToChange);
   }
}

function rippleRobotBodyLights() {
   chooseAndDrawLights(goodRobot);
   chooseAndDrawLights(badRobot);
}

function drawBodyDecoration(robot) {
   var ctx = robot.context;
   var y = 185 + yOffset;
   var x = 71;
   var width =  96;
   var height = 60;
   var i; // loop counter

   ctx.strokeStyle = "black";
   ctx.lineWidth = 2;

   ctx.strokeRect(x + xOffset, y, width, height);

   // draw the grille on the body
   for (i=0; i<3; i++) {
         // horizontal lines
         ctx.beginPath();
         ctx.moveTo(x + xOffset, y + i*(height/3));
         ctx.lineTo(x + xOffset + width, y + i*(height/3));
         ctx.stroke();
   }

   for (i=0; i<4; i++) {
      //vertical lines
      ctx.beginPath();
      ctx.moveTo(x + xOffset + i*(width/4), y);
      ctx.lineTo(x + xOffset + i*(width/4), y + height);
      ctx.stroke();
   }

   drawBodyLights(robot);
}

function drawEyes(ctx) {
   var y = 337 + yOffset;
   ctx.fillStyle = "white";
   ctx.lineWidth = 4;

   ctx.beginPath();
   ctx.arc(100 + xOffset, y, 7, 0, 2*Math.PI);
   ctx.stroke();
   ctx.fill();

   ctx.moveTo(138 + xOffset, y);
   ctx.arc(138 + xOffset, y, 7, 0, 2*Math.PI);
   ctx.stroke();
   ctx.fill();
}

function clearLeftArmAndHand(ctx) {
   clearOffsetStrokedRect(ctx, 8, 170, 27, 117);
   clearOffsetStrokedRect(ctx, 0, 141, 42, 32);
}

function drawLeftArmAndHand(ctx) {
   drawOffsetStrokedRect(ctx, 8, 170, 27, 117);
   drawOffsetStrokedRect(ctx, 0, 141, 42, 32);
}

function drawRightArmAndHand(ctx) {
   drawOffsetStrokedRect(ctx, 201, 166, 27, 121);
   drawOffsetStrokedRect(ctx, 194, 136, 42, 32);
}

function drawLeftArmAndHandUp(ctx) {
   clearLeftArmAndHand(ctx);

   ctx.fillStyle = goodRobot.colour;
   ctx.strokeStyle = "black";

   drawOffsetStrokedRect(ctx, 8, 260, 27, 160);
   // drawOffsetStrokedRect(ctx, 0, 200, 42, 212);
}

function drawArmsAndHands(ctx) {
   drawLeftArmAndHand(ctx);
   drawRightArmAndHand(ctx);
}

function drawRobot(robot) {
   var ctx = robot.context;

   // first, blank the canvas . . .
   robot.canvas.width = robot.canvas.width;

   // needed due to Inkscape calculating y values from bottom to top, rather than
   // top to bottom, and the drawing points are taken from Inkscape designs
   ctx.translate(0, robot.canvas.height);
   ctx.scale(1,-1);

   ctx.fillStyle = robot.colour;
   ctx.strokestyle = "black";
   ctx.lineWidth = 4;

   // head
   drawOffsetStrokedRect(ctx, 90, 293, 57, 84);
   drawOffsetStrokedRect(ctx, 64, 316, 109, 38);

   // neck
   drawOffsetStrokedRect(ctx, 106, 285, 26, 8);

   // body
   drawOffsetStrokedRect(ctx, 50, 125, 136, 162);
   drawOffsetStrokedRect(ctx, 8, 260, 220, 27);

   drawArmsAndHands(ctx);

   // legs
   drawOffsetStrokedRect(ctx, 71, 0, 42, 125);
   drawOffsetStrokedRect(ctx, 127, 0, 42, 125);

   // feet
   drawOffsetStrokedRect(ctx, 48, 0, 65, 26);
   drawOffsetStrokedRect(ctx, 127, 0, 68, 26);

   drawEyes(ctx);
   drawBodyDecoration(robot);
}

function drawRobots() {
   drawRobot(goodRobot);
   drawRobot(badRobot);
}

// end of robot drawing section

/*******************************
*   draw the countdown timer
*******************************/
function drawTimer() {
   var timeRemainingBoxWidth;
   timer.context.fillStyle = "orange";

   timeRemainingBoxWidth = (timer.timeRemaining / gameState.timeForSums) * timer.canvas.width;
   timer.context.fillRect(0, 0, timeRemainingBoxWidth, 60);
}
// end of countdown timer drawing section

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

function setNumberButtonsDisabled(state) {
   var numbersDiv = document.getElementById("numeralsDiv");
   var numberButtons = numbersDiv.getElementsByTagName("button");
   var i; //loop counter

   for (i = 0; i < numberButtons.length; i++) {
      numberButtons[i].disabled = state;
      numberButtons[i].style.opacity = state === true ? 0.5 : 1;
   }
}

function disableNumberButtons() {
   setNumberButtonsDisabled(true);
}

function enableNumberButtons() {
   setNumberButtonsDisabled(false);
}

function resetTimerCanvas() {
   timer.canvas.width = timer.canvas.width;
}

function resetGoodRobotBodyLights() {
   drawBodyLights(goodRobot);
}

function displayTimerValue() {
   resetTimerCanvas();
   drawTimer();
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

   resetTimerCanvas();
   resetGoodRobotBodyLights();
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
   resetGoodRobotBodyLights();
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

// needed due to Inkscape calculating y values from bottom to top, rather than top to bottom
var yOffset = 450;

// just to put the robot in a better place on the canvas
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
	enter: 13	// the enter or return key
});

var gameState = {
   battleInProgress: false,   // to indicate if we're battling a robot
   timeForSums: 10,				// how many seconds you have to complete a sum
   timerId: null,             // timerId for when we want to pause for a bit
   goodRobotMaxEnergy: 8,
   badRobotMaxEnergy: 8
};

var goodRobot = {
   energy: null
};

var badRobot = {
   energy: null
};

var calculation = {
   firstFactor: null,
   secondFactor: null,
   digitToGuess: null,
   timeAllowed: null, // how many seconds you're allowed to answer this particular calculation
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
   setTimeAllowed() {
      this.timeAllowed = gameState.timeForSums;
   },
   composeCorrectAnswerText() {
      return "It's " + this.product();
   }
};

/**************************************
*   Stuff to do with drawing the robots
***************************************/
function drawOffsetStrokedRect(ctx, x, y, width, height) {
	ctx.fillRect(x + xOffset, yOffset - y - height, width, height);
	ctx.strokeRect(x + xOffset, yOffset - y - height, width, height);
}

function choosFillStyle(position) {
   var fillstyle = "white"; //default

   switch(position) {
      case 0:
         fillstyle = "gold";
         break;
      case 1:
         fillstyle = "mediumpurple";
         break;
      case 2:
         fillstyle = "deepskyblue";
         break;
   }
   return fillstyle;
}

function drawChestLights(ctx) {
   var y = yOffset - 157;
   var x = 87;
   var areaWidth = 100;
   var circleRadius = 5;
   var i;  //loop counter

   ctx.lineWidth=3;

   for (i=0; i<3; i++) {
      ctx.fillStyle = choosFillStyle(i);
      ctx.beginPath();
      ctx.moveTo(x + xOffset + i*(areaWidth/3), y);
      ctx.arc(x + xOffset + i*(areaWidth/3), y, circleRadius, 0, 2*Math.PI);

      ctx.stroke();
      ctx.fill();
   }
}

function drawChestDecoration(ctx) {
   var y = yOffset - 245;
   var x = 71;
   var width =  96;
   var height = 60;
   var i; // loop counter

   ctx.strokeStyle = "black";
   ctx.lineWidth = 2;

   ctx.strokeRect(x + xOffset, y, width, height);

   // draw the grille on the chest
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

   drawChestLights(ctx);
}

function drawEyes(ctx) {
   var y = yOffset - 337;
   ctx.fillStyle = "white";
   ctx.lineWidth=5;

   ctx.beginPath();
   ctx.arc(100 + xOffset, y, 7, 0, 2*Math.PI);
   ctx.stroke();
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
	drawOffsetStrokedRect(ctx, 90, 293, 57, 84);
   drawOffsetStrokedRect(ctx, 64, 316, 109, 38);

	// neck
   drawOffsetStrokedRect(ctx, 106, 285, 26, 8);

   // body
   drawOffsetStrokedRect(ctx, 50, 125, 136, 162);
   drawOffsetStrokedRect(ctx, 8, 260, 220, 27);

   // arms
   drawOffsetStrokedRect(ctx, 8, 170, 27, 117);
   drawOffsetStrokedRect(ctx, 201, 166, 27, 121);

   // hands
   drawOffsetStrokedRect(ctx, 0, 141, 42, 32);
   drawOffsetStrokedRect(ctx, 194, 136, 42, 32);

   // legs
   drawOffsetStrokedRect(ctx, 71, 0, 42, 125);
   drawOffsetStrokedRect(ctx, 127, 0, 42, 125);

   // feet
   drawOffsetStrokedRect(ctx, 48, 1, 65, 26);
	drawOffsetStrokedRect(ctx, 127, 1, 68, 26);

   drawEyes(ctx);
   drawChestDecoration(ctx);
}

function drawRobots() {
   var goodRobotCanvas = document.getElementById("goodRobot");
   var badRobotCanvas = document.getElementById("badRobot");

   if (goodRobotCanvas.getContext) {
      drawRobot(goodRobotCanvas.getContext("2d"), "firebrick");
   }

   if (badRobotCanvas.getContext) {
      drawRobot(badRobotCanvas.getContext("2d"), "limegreen");
   }
}
// end of robot drawing section

/***********************************************
*   Stuff to do with drawing the countdown timer
************************************************/
function drawTimer(ctx, timeRemaining, virtualCanvasWidth) {
   var timeRemainingBoxWidth;

   ctx.fillStyle = "orange";

   timeRemainingBoxWidth = (calculation.timeAllowed / gameState.timeForSums) * virtualCanvasWidth;
   ctx.fillRect(0, 0, timeRemainingBoxWidth, 60);
}
// end of countdown timer drawing section

/********************************************
*   Stuff to do with drawing the energy bars
*********************************************/
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

function drawEnergyBar(energy, colour, canvas) {
   canvas.width = canvas.width;
   var ctx = canvas.getContext("2d");

   for (var i=0; i<energy; i++) {
      drawStrokedRectWithGradient(ctx, i, colour, canvas);
   }
}

function drawGoodRobotEnergyBar(goodEnergyBarCanvas) {
   drawEnergyBar(goodRobot.energy, "firebrick", goodEnergyBarCanvas);
}

function drawBadRobotEnergyBar(badEnergyBarCanvas) {
   drawEnergyBar(badRobot.energy, "green", badEnergyBarCanvas);
}

function drawEnergyBars() {
   var goodEnergyBarCanvas = document.getElementById("energyBarGood");
   var badEnergyBarCanvas = document.getElementById("energyBarBad");

   if (goodEnergyBarCanvas.getContext) {
      drawGoodRobotEnergyBar(goodEnergyBarCanvas);
   }

   if (badEnergyBarCanvas.getContext) {
      drawBadRobotEnergyBar(badEnergyBarCanvas);
   }
}

// end of energy bar drawing section


function setUpQuestion() {
   document.getElementById("questionAndAnswersPara").textContent = calculation.createQuestionText();
   document.getElementById("resultPara").textContent = calculation.resultText;
   calculation.setTimeAllowed();
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

function resetCanvas() {
   var timerCanvas = document.getElementById("questionTimer");
   timerCanvas.width = timerCanvas.width;
}

function displayTimerValue() {
   var timerCanvas = document.getElementById("questionTimer");

   if (timerCanvas.getContext) {
      resetCanvas();
      drawTimer(timerCanvas.getContext("2d"), calculation.timeAllowed, timerCanvas.width);
   }
}

function displayTimeOutMessage() {
   document.getElementById("resultPara").textContent = calculation.resultText;
}

function showNumberButtons() {
   $("#numeralsDiv").toggleClass("hidden");
   $("#playAgain").toggleClass("hidden");
}

function showPlayAgainButton() {
   $("#numeralsDiv").toggleClass("hidden");
   $("#playAgain").toggleClass("hidden");
}

function checkEnergy() {
   drawEnergyBars();

   if (goodRobot.energy < 0) {
      clearTimeout(gameState.timerId);
      clearInterval(calculation.intervalId);

      document.getElementById("questionAndAnswersPara").textContent = "Bad Robot Wins!";
      document.getElementById("resultPara").textContent = "Oh no!";
      showPlayAgainButton();
      return;
   }

   if (badRobot.energy < 0) {
      clearTimeout(gameState.timerId);
      clearInterval(calculation.intervalId);

      document.getElementById("questionAndAnswersPara").textContent = "Good Robot Wins!";
      document.getElementById("resultPara").textContent = "Hooray!";
      showPlayAgainButton();
      return;
   }
}

function processSums() {
   calculation.timeAllowed--;

	if (calculation.timeAllowed > 0) {
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
}


function getNextQuestionReadyIfBothRobotsAlive() {
   if (goodRobot.energy >= 0 && badRobot.energy >= 0) {
      gameState.intervalId = setTimeout(resetForNextQuestion, 2500);
   }
}

function stopQuestion() {
   clearInterval(calculation.intervalId);
   disableNumberButtons();
}

function showFeedbackToAnswer(feedback) {
   stopQuestion();
   calculation.resultText = feedback + " " + calculation.composeCorrectAnswerText();
   document.getElementById("resultPara").textContent = calculation.resultText;
}

function handleTimerRunDown() {
   showFeedbackToAnswer("Too Slow!");
   goodRobot.energy--;
   checkEnergy();
   calculation.inProgress = false;

   displayTimeOutMessage();
   resetCanvas();
   getNextQuestionReadyIfBothRobotsAlive();
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
   calculation.intervalId = setInterval(processSums, 1000);
}

function getNextQuestionIfAlive() {
   checkEnergy();
   calculation.inProgress = false;
   getNextQuestionReadyIfBothRobotsAlive();
}

function drawInitialEnergyBars() {
   setInitialRobotEnergy();
   drawEnergyBars();
}

function processCorrectDigit() {
   calculation.updateDigitToGuess();

   if (calculation.gotItAllCorrect()) {
      stopQuestion();

      calculation.resultText = "Got it right!";
      document.getElementById("resultPara").textContent = calculation.resultText;

      badRobot.energy--;
      getNextQuestionIfAlive();
   }
}

function processIncorrectDigit() {
   showFeedbackToAnswer("Wrong!");
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

function setInitialRobotEnergy() {
   goodRobot.energy = gameState.goodRobotMaxEnergy;
   badRobot.energy = gameState.badRobotMaxEnergy;
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
   showNumberButtons();
   enableNumberButtons();
   setInitialRobotEnergy();
   drawInitialEnergyBars();
   humanReadyToDoSums();
}

function playGame() {
   document.getElementById("introDiv").style.display = "none";
   document.getElementById("gameDiv").style.display = "block";
   drawRobots();
   drawInitialEnergyBars();
}

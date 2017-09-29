
var goodEnergyBar = new EnergyBar();
var badEnergyBar = new EnergyBar();

var goodRobot;
var badRobot;

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

function rippleRobotBodyLights () {
   goodRobot.chooseAndDrawLights();
   badRobot.chooseAndDrawLights();
}

function drawScreen() {
   screen.draw();
}

/**************************
*   draw the energy bars
***************************/

function drawEnergyBar(energyBar, robot) {
   // blank the canvas before drawing anything . . .
   energyBar.canvas.width = energyBar.canvas.width;

   for (let i = 0; i < robot.energy; i++) {
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

/********************
* Initialise models
********************/
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
// end of model initialisation

function setUpQuestion() {
   document.getElementById("questionAndAnswersPara").textContent = calculation.createQuestionText();
   document.getElementById("resultPara").textContent = calculation.resultText;
   timer.setTimeRemaining();
   clearInterval(calculation.intervalId);
}

function disableNumberButtons() {
   $("#numeralsDiv button")
      .attr("disabled","disabled")
      .fadeTo("fast", 0.5);
}

function enableNumberButtons() {
   $("#numeralsDiv button")
      .removeAttr("disabled")
      .fadeTo("fast", 1);
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
      goodRobot.leftArmRaised = true;
      calculation.resultText = outcome.toString();
      screen.draw();
   } else {
      badRobot.leftArmRaised = true;
      calculation.resultText = outcome.toString() + " " + calculation.composeCorrectAnswerText();
      screen.draw();
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
   goodRobot.leftArmRaised = false;
   badRobot.leftArmRaised = false;
   screen.draw();
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

function pressedAKey(e) {
   var unicode = e.keyCode? e.keyCode : e.charCode;

   if (key.isDigit(unicode)) {
         interpretNumberInput(unicodeToNumeral(unicode));
   }
}

function setHandlers() {
   $("#numeralsDiv button")
      .on("click", function() {
         interpretNumberInput(parseInt(this.textContent));
      });

   $("body")
      .on("keyup", function(event) {
         pressedAKey(event);
      });
}

function startAnotherGame() {
   initialiseModels();
   screen.draw();
   drawInitialEnergyBars();
   showNumberButtons();
   enableNumberButtons();
   humanReadyToDoSums();
}

function swapIntroForGameScreen() {
   $("#introDiv, #gameDiv").toggleClass("hidden");
}

function playGame() {
   setHandlers();
   swapIntroForGameScreen();
   initialiseModels();
   screen.draw();
   drawInitialEnergyBars();
}

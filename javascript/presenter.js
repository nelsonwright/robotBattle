
var goodEnergyBar, badEnergyBar;
var goodRobot, badRobot;

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

function drawEnergyBars() {
   goodEnergyBar.draw();
   badEnergyBar.draw();
}

/********************
* Initialise models
********************/
function saveOptions() {
   options.additionSingleDigits = $(".optionsDiv  #additionSingleDigits").is(":checked");
   options.additionDoubleDigits = $(".optionsDiv  #additionDoubleDigits").is(":checked");
   options.multiplication = $(".optionsDiv #multiplication").is(":checked");
}

function atLeastOneOptionSelected() {
   return $(".optionsDiv input:checkbox:checked").length > 0
}

function setEnergyBarAttributes() {
   goodEnergyBar = new EnergyBar(goodRobot, document.getElementById("energyBarGood"), "firebrick");

   if (goodEnergyBar.canvas.getContext) {
      goodEnergyBar.context = (goodEnergyBar.canvas.getContext("2d"));
   }

   badEnergyBar = new EnergyBar(badRobot, document.getElementById("energyBarBad"), "green");

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

function setInitialRobotEnergy() {
   goodRobot.energy = gameState.goodRobotMaxEnergy;
   badRobot.energy = gameState.badRobotMaxEnergy;
}

function initialiseModels() {
   setRobotAttributes();
   setEnergyBarAttributes();
   setTimerAttributes();
   setInitialRobotEnergy();
}
// end of model initialisation

function setUpQuestion() {
   $("#questionAndAnswersPara").text(calculation.createQuestionText());
   $("#resultPara").text(calculation.resultText);
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
   $("#numeralsDiv, #playAgain").toggleClass("hidden");
}

function showPlayAgainButton() {
   $("#numeralsDiv, #playAgain").toggleClass("hidden");
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
   clearInterval(goodRobot.electricityIntervalId);
   clearInterval(badRobot.electricityIntervalId);
   clearInterval(goodRobot.explosionIntervalId);
   clearInterval(badRobot.explosionIntervalId);
   stopRipplingBodyLights();
}

function checkEnergy() {
   drawEnergyBars();

   if (goodRobot.energy < 0) {
      stopTimers();

      $("#questionAndAnswersPara").text("Bad Robot Wins!");
      $("#resultPara").text("Oh no!");
      goodRobot.isExploding = true;
      badRobot.rightArmRaised = true;
      drawScreen();
      showPlayAgainButton();
      return;
   }

   if (badRobot.energy < 0) {
      stopTimers();

      $("#questionAndAnswersPara").text("Good Robot Wins!");
      $("#resultPara").text("Hooray!");
      badRobot.isExploding = true;
      goodRobot.rightArmRaised = true;
      drawScreen();
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
      badRobot.electricityFlash = true;
      calculation.resultText = outcome.toString();
      drawScreen();
   } else {
      badRobot.leftArmRaised = true;
      goodRobot.electricityFlash = true;
      calculation.resultText = `${outcome.toString()} ${calculation.composeCorrectAnswerText()}`;
      drawScreen();
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
   goodRobot.righttArmRaised = false;
   badRobot.leftArmRaised = false;
   badRobot.righttArmRaised = false;
   goodRobot.electricityFlash = false;
   badRobot.electricityFlash = false;

   drawScreen();
   startRipplingBodyLights();
}

function humanReadyToDoSums() {
   $("#humanReady").hide();
   $("#questionAndAnswersPara").show();
   $("#resultPara").show();

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
   $("#questionAndAnswersPara").text(calculation.questionText + calculation.answerText);

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

   $("#optionsButton")
      .on("click", function() {
         $(".introText, .optionsDiv, #optionsButton, #storyButton")
            .toggleClass("hidden");
      });

      $("#storyButton")
      .on("click", function() {
         $(".introText, .optionsDiv, #optionsButton, #storyButton")
            .toggleClass("hidden");
      });

   $("#playGameButton")
      .on("click", function() {
         if (atLeastOneOptionSelected()) {
               saveOptions();
               playGame();
         } else {
            // it would be good to do something nicer than this at some point ...
            alert("You need to select at least one option");
         }
      });
}

function startAnotherGame() {
   initialiseModels();
   drawScreen();
   showNumberButtons();
   enableNumberButtons();
   humanReadyToDoSums();
}

function swapIntroForGameScreen() {
   $("#introDiv, #gameDiv").toggleClass("hidden");
}

function playGame() {
   swapIntroForGameScreen();
   initialiseModels();
   drawScreen();
}

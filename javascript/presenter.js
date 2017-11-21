
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
   // create an object of just the selected/checked options, excluding headers . . .
   selectedOptions = $(".optionsDiv input:checkbox:checked")
      .not(".optionsDiv input:checkbox[name$='Header']")
      .map(function() {
         return this.value;
   });
}

function atLeastOneOptionSelected() {
   return $(".optionsDiv input:checkbox:checked").length > 0;
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
   timer.setTimeForQuestion(gameState.timeForSums);
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
   timer.draw();
}

function showNumberButtons() {
   $("#numeralsDiv, #playAgain").toggleClass("hidden");
}

function showPlayAgainButton() {
   $("#numeralsDiv, #playAgain").toggleClass("hidden");
   $("#playAgain button").focus();
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

      calculation.questionText = "Bad Robot Wins!";
      calculation.resultText = "Oh no!";

      goodRobot.isExploding = true;
      badRobot.leftArmRaised = true;
      badRobot.rightArmRaised = true;
      drawScreen();
      showPlayAgainButton();
      return;
   }

   if (badRobot.energy < 0) {
      stopTimers();

      calculation.questionText = "Good Robot Wins!";
      calculation.resultText = "Hooray!";

      badRobot.isExploding = true;
      goodRobot.leftArmRaised = true;
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

function pickRightOrLeftArmToRaise(robot) {
   if (Math.random() > 0.5) {
      robot.rightArmRaised = true;
   } else {
      robot.leftArmRaised = true;
   }
}

function showFeedbackToAnswer(outcome) {
   stopQuestion();

   if (outcome === questionOutcome.correct) {
      pickRightOrLeftArmToRaise(goodRobot);
      badRobot.electricityFlash = true;
      calculation.resultText = outcome.toString();
      drawScreen();
   } else {
      pickRightOrLeftArmToRaise(badRobot);
      goodRobot.electricityFlash = true;
      calculation.resultText = `${outcome.toString()} ${calculation.composeCorrectAnswerText()}`;
      drawScreen();
   }
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
   goodRobot.rightArmRaised = false;
   badRobot.leftArmRaised = false;
   badRobot.rightArmRaised = false;
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
   calculation.updateQuestionText(digitPressed);
   drawScreen();

   if (calculation.correctDigitGuessed(digitPressed)) {
      processCorrectDigit();
   } else {
      processIncorrectDigit();
   }
}

function noBattleInProgress() {
   return !gameState.battleInProgress;
}

function battleInProgress() {
   return gameState.battleInProgress;
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

   if (key.isDigit(unicode) && battleInProgress()) {
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

   // these two methods below duplicate code a lot, but can't quite see how to
   // do it all in one method right now.  Hmm.

   $("#optionsButton")
      .on("click", function() {
         $(this)
            .fadeOut("fast", function() {
               $(".optionsDiv, .introText").slideToggle(300);
               $("#storyButton").fadeIn("fast");
            });
      });

   $("#storyButton")
      .on("click", function() {
         $(this)
            .fadeOut("fast", function() {
               $(".optionsDiv, .introText").slideToggle(300);
               $("#optionsButton").fadeIn("fast");
            });
      });

   $("#playGameButton")
      .focus()
      .on("click", function() {
         if (atLeastOneOptionSelected()) {
               saveOptions();
               playGame();
         } else {
            // it would be good to do something nicer than this at some point ...
            alert("You need to select at least one option");
         }
      });

   //handlers for checkboxes that are for groups of options with a name ending in "...Header"
   $(".optionsDiv input:checkbox[name$='Header']")
      .on("click", function() {
         var checkedState = $(this).prop('checked');
         $(this).siblings('input').prop('checked', checkedState);
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
   $("#humanReady button").focus();
}

function playGame() {
   swapIntroForGameScreen();
   initialiseModels();
   drawScreen();
}

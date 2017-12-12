var goodEnergyBar, badEnergyBar;
var goodRobot, badRobot;
var selectedOptions;

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
   screen.draw(goodRobot, badRobot, goodEnergyBar, badEnergyBar, calculation);
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
   badEnergyBar = new EnergyBar(badRobot, document.getElementById("energyBarBad"), "green");
}

function setRobotAttributes() {
   var lightColours = ["gold", "mediumpurple", "limegreen", "white", "royalblue", "orange"];
   goodRobot = new Robot("firebrick", lightColours, document.getElementById("goodRobot"), gameState.goodRobotMaxEnergy);

   lightColours = ["red", "royalblue", "magenta", "gold", "white", "plum"];
   badRobot = new Robot("limegreen", lightColours, document.getElementById("badRobot"), gameState.badRobotMaxEnergy);
}

function setTimerAttributes() {
   timer.setup(document.getElementById("questionTimer"));
}

function enableNumberButtons() {
   $("#numeralsDiv button")
      .removeAttr("disabled")
      .fadeTo("fast", 1);
}

function showNumberButtons() {
   $("#playAgain").hide();
   $("#numeralsDiv").show();
   enableNumberButtons();
}

function initialiseModels() {
   setRobotAttributes();
   setEnergyBarAttributes();
   setTimerAttributes();
   gameState.battleInProgress = false;
   calculation.wipeText();
   calculation.setInProgress(false);
   timer.clearCanvas();
   showNumberButtons();
}
// end of model initialisation

function setUpQuestion() {
   $("#questionAndAnswersPara").text(calculation.createQuestionText(selectedOptions));
   $("#resultPara").text(calculation.getResultText());
   timer.setTimeForQuestion(gameState.timeForSums);
   clearInterval(calculation.intervalId);
}

function disableNumberButtons() {
   $("#numeralsDiv button")
      .attr("disabled","disabled")
      .fadeTo("fast", 0.5);
}

function resetRobotBodyLights() {
   goodRobot.drawBodyLights();
   badRobot.drawBodyLights();
}

function displayTimerValue() {
   timer.draw();
}

function showPlayAgainButton() {
   $("#numeralsDiv").hide();
   $("#playAgain")
      .delay(3500)
      .fadeIn("slow", function() {
         $("#startAnotherGameButton").focus();
      }
   );
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

   if (goodRobot.runOutOfEnergy()) {
      stopTimers();

      calculation.setQuestionText("Bad Robot Wins!");
      calculation.setResultText("Oh no!");

      goodRobot.setToExplode();
      badRobot.setLeftArmRaised(true);
      badRobot.setRightArmRaised(true);
      drawScreen();
      showPlayAgainButton();
   }

   if (badRobot.runOutOfEnergy()) {
      stopTimers();

      calculation.setQuestionText("Good Robot Wins!");
      calculation.setResultText("Hooray!");

      badRobot.setToExplode();
      goodRobot.setLeftArmRaised(true);
      goodRobot.setRightArmRaised(true);
      drawScreen();
      showPlayAgainButton();
   }
}

function stopQuestion() {
   stopTimers();
   disableNumberButtons();
}

function pickRightOrLeftArmToRaise(robot) {
   if (Math.random() > 0.5) {
      robot.setRightArmRaised(true);
   } else {
      robot.setLeftArmRaised(true);
   }
}

function showFeedbackToAnswer(outcome) {
   stopQuestion();

   if (outcome === calculation.questionOutcome.correct) {
      pickRightOrLeftArmToRaise(goodRobot);
      badRobot.setElectricityToFlash();
      calculation.setResultText(outcome.toString());
      drawScreen();
   } else {
      pickRightOrLeftArmToRaise(badRobot);
      goodRobot.setElectricityToFlash();
      calculation.setResultText(`${outcome.toString()} ${calculation.composeCorrectAnswerText()}`);
      drawScreen();
   }
}

function getNextQuestionReadyIfBothRobotsAlive() {
   if (goodRobot.hasEnergy() && badRobot.hasEnergy()) {
      gameState.intervalId = setTimeout(resetForNextQuestion, gameState.pauseBetweenQuestions * 1000);
   }
}

function handleTimerRunDown() {
   stopTimers();
   showFeedbackToAnswer(calculation.questionOutcome.tooSlow);
   goodRobot.reduceEnergy();
   checkEnergy();
   calculation.setInProgress(false);

   timer.clearCanvas();
   resetRobotBodyLights();
   getNextQuestionReadyIfBothRobotsAlive();
}

function processSums() {
   timer.decrement();

   if (timer.timeLeft() > 0) {
      displayTimerValue();
   } else {
      handleTimerRunDown();
   }
}

function resetForNextQuestion() {
   calculation.wipeText();
   setUpQuestion();
   displayTimerValue();

   calculation.setInProgress(true);
   enableNumberButtons();
   calculation.intervalId = setInterval(processSums, 1000);
   goodRobot.setLeftArmRaised(false);
   goodRobot.setRightArmRaised(false);
   badRobot.setLeftArmRaised(false);
   badRobot.setRightArmRaised(false);

   drawScreen();
   startRipplingBodyLights();
}

function humanReadyToDoSums() {
   setUpQuestion();
   displayTimerValue();

   // we'll need to set these up at different points later, but for now, both here is ok . . .
   gameState.battleInProgress = true;
   calculation.setInProgress(true);

   showNumberButtons();
   enableNumberButtons();
   startRipplingBodyLights();
   calculation.intervalId = setInterval(processSums, 1000);
   drawScreen();
}

function getNextQuestionIfAlive() {
   resetRobotBodyLights();
   checkEnergy();
   calculation.setInProgress(false);
   getNextQuestionReadyIfBothRobotsAlive();
}

function processCorrectDigit() {
   calculation.updateDigitToGuess();

   if (calculation.gotItAllCorrect()) {
      stopQuestion();

      // TODO: at some stage, we shouldn't reach in to the calculation object and
      // access this directly, law of demeter and all that . . .
      showFeedbackToAnswer(calculation.questionOutcome.correct);
      badRobot.reduceEnergy();
      getNextQuestionIfAlive();
   }
}

function processIncorrectDigit() {
   stopTimers();
   showFeedbackToAnswer(calculation.questionOutcome.incorrect);
   goodRobot.reduceEnergy();
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
   if (calculation.isInProgress()) {
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
               $(".optionsDiv, .introText").slideToggle(gameState.optionsSpeed);
               $("#storyButton").fadeIn("fast");
            });
      });

   $("#storyButton")
      .on("click", function() {
         $(this)
            .fadeOut("fast", function() {
               $(".optionsDiv, .introText").slideToggle(gameState.optionsSpeed);
               $("#optionsButton").fadeIn("fast");
            });
      });

   $("#startAnotherGameButton")
      .on("click", function() {
         $("#playAgain")
            .fadeOut("fast", function() {
               startAnotherGame();
            });
      });

   $("#showOptionsAfterGameButton")
      .on("click", function() {
         $("#playAgain")
            .fadeOut("fast", function() {
               $("#gameDiv").hide();
               $("#introDiv").show();
               $(".introText").hide();
               $("#storyButton").show();
               $("#optionsButton").hide();
               $(".optionsDiv").fadeIn();
            });
      });

   $("#playGameButton")
      .focus()
      .on("click", function() {
         if (atLeastOneOptionSelected()) {
               saveOptions();
               playGame();
         } else {
            if ($("#optionsButton").is(":visible")) {
               $("#optionsButton")
               .effect("highlight")
               .effect("shake");
            } else {
               $(this).effect("shake");
               $(".optionsDiv p")
               .effect("highlight");
            }
         }
      });

   //handlers for checkboxes that are for groups of options with a name ending in "...Header"
   $(".optionsDiv input:checkbox[name$='Header']")
      .on("click", function() {
         var checkedState = $(this).prop("checked");
         $(this).siblings('input').prop("checked", checkedState);
      });
}

function startAnotherGame() {
   initialiseModels();
   drawScreen();
   $("#humanReady button").focus();
}

function swapIntroForGameScreen() {
   $("#introDiv").hide();
   $("#gameDiv").show();
}

function playGame() {
   swapIntroForGameScreen();
   initialiseModels();
   drawScreen();
   $("#humanReady button").focus();
}

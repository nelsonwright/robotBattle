// needed due to Inkscape calculating y values from bottom to top, rather than top to bottom
var yOffset = 450;

// just to put the robot in a better place on the canvas
var xOffset = 20;

// these are the unicode values for the keyboard keys when pressed
var key = Object.freeze({
	isTopRowDigit: function(actionCode) {
		return actionCode >= 48 && actionCode <= 57;
	},
	isKeypadDigit: function(actionCode) {
		return actionCode >= 96 && actionCode <= 105;
	},
	isDigit: function(actionCode) {
		return this.isTopRowDigit(actionCode) || this.isKeypadDigit(actionCode);
	},
	enter: 13	// the enter or return key
});

var calculation = {
   firstFactor: null,
   secondFactor: null,
   digitToGuess: null,
   timeAllowed: 7, // how many seconds you're allowed to answer
   answerIndex: null,
   timeToAnswerText: null,
   text: null,
   answerText: "",
   resultText: null,
   create: function() {
      this.firstFactor = Math.floor(Math.random() * 10 + 2);
      this.secondFactor = Math.floor(Math.random() * 10 + 2);
      this.answerIndex = 0;
      this.digitToGuess = this.calcDigitToGuess();
   },
   product: function() {
      return this.firstFactor * this.secondFactor;
   },
   createQuestionText: function () {
      this.create();
      return this.firstFactor + ' X ' + this.secondFactor + ' = ';
   },
   correctDigitGuessed: function(digitGuessed) {
      return digitGuessed === this.digitToGuess;
   },
   calcDigitToGuess: function () {
      return parseInt(this.product().toString()[this.answerIndex]);
   },
   updateDigitToGuess: function() {
      this.answerIndex++;
      this.digitToGuess = this.calcDigitToGuess();
   },
   gotItAllCorrect: function() {
      return this.answerIndex >= parseInt(this.product().toString().length);
   },
   wipeText: function() {
      this.timeToAnswerText = "";
      this.text = "";
      this.resultText = " ";
      this.answerText = "";
   }
};

function setUpQuestion() {
   var answersPara = document.getElementById('questionAndAnswersPara');
   answersPara.innerHTML = calculation.createQuestionText();
}

function pressedAKey(e) {
	var unicode = e.keyCode? e.keyCode : e.charCode;

	if (key.isDigit(unicode)) {
		processAttemptedSumAnswer(unicode);
	}
}

function processAttemptedSumAnswer(numberCode) {
	// the digits 0-9 on the top row of the keyboard are unicode values 48 - 57
	// the numeric keypad digits are unicode values 96 - 105
	var digitPressed;


	if (key.isTopRowDigit(numberCode)) {
		digitPressed = numberCode - 48;
	} else {
		digitPressed = numberCode - 96;
	}

   console.log("The digit is " + digitPressed);

	// if (sleep.calculation.correctDigitGuessed(digitPressed)) {
	// 	sleep.calculation.answerText = sleep.calculation.answerText === '?' ? digitPressed : sleep.calculation.answerText + digitPressed.toString();
	// 	sleep.calculation.updateDigitToGuess();
   //    renderSleepingState();
   //
	// 	if (sleep.calculation.gotItAllCorrect()) {
	// 		clearInterval(gameState.sumsIntervalId);
	// 		sleep.calculation.resultText = "Got it right!";
	// 		sleep.correctAnswers++;
   //       renderSleepingState();
   //       waitABitThenKeepSleeping();
	// 	}
	// } else {
	// 	sleep.calculation.answerText = sleep.calculation.answerText === '?' ? digitPressed : sleep.calculation.answerText + digitPressed.toString();
	// 	//oh dear, got it wrong . . .
	// 	clearInterval(gameState.sumsIntervalId);
	// 	sleep.calculation.resultText = "Wrong! Ha ha!";
   //    renderSleepingState();
   //    waitABitThenKeepSleeping();
	// }
}

function drawStrokedRect(ctx, x, y, width, height) {
	ctx.fillRect(x + xOffset, yOffset - y - height, width, height);
	ctx.strokeRect(x + xOffset, yOffset - y - height, width, height);
}

function drawChestLights(ctx) {
   var y = yOffset - 157;
   var x = 87;
   var areaWidth = 100;
   var circleRadius = 5;


   ctx.lineWidth=3;

   for (var i=0; i<3; i++) {
      switch(i) {
         case 0:
            ctx.fillStyle = "gold";
            break;
         case 1:
            ctx.fillStyle = "mediumpurple";
            break;
         case 2:
            ctx.fillStyle = "deepskyblue";
            break;
      }
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
   ctx.strokeStyle = "black";
   ctx.lineWidth = 2;

   ctx.strokeRect(x + xOffset, y, width, height);

   // draw the grille on the chest
   for (var i=0; i<3; i++) {
         // horizontal lines
         ctx.beginPath();
         ctx.moveTo(x + xOffset, y + i*(height/3));
         ctx.lineTo(x + xOffset + width, y + i*(height/3));
         ctx.stroke();
   }

   for (var i=0; i<4; i++) {
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
	drawStrokedRect(ctx, 90, 293, 57, 84);
   drawStrokedRect(ctx, 64, 316, 109, 38);

	// neck
   drawStrokedRect(ctx, 106, 285, 26, 8);

   // body
   drawStrokedRect(ctx, 50, 125, 136, 162);
   drawStrokedRect(ctx, 8, 260, 220, 27);

   // arms
   drawStrokedRect(ctx, 8, 170, 27, 117);
   drawStrokedRect(ctx, 201, 166, 27, 121);

   // hands
   drawStrokedRect(ctx, 0, 141, 42, 32);
   drawStrokedRect(ctx, 194, 136, 42, 32);

   // legs
   drawStrokedRect(ctx, 71, 0, 42, 125);
   drawStrokedRect(ctx, 127, 0, 42, 125);

   // feet
   drawStrokedRect(ctx, 48, 1, 65, 26);
	drawStrokedRect(ctx, 127, 1, 68, 26);

   drawEyes(ctx);
   drawChestDecoration(ctx);
}

function drawRobots() {
   var goodRobotCanvas = document.getElementById('goodRobot');
   var goodRobotContext = goodRobotCanvas.getContext('2d');
   var badRobotCanvas = document.getElementById('badRobot');
   var badRobotContext = badRobotCanvas.getContext('2d');

   if (goodRobotCanvas.getContext) {
      drawRobot(goodRobotContext, "firebrick");
   }

   if (badRobotCanvas.getContext) {
      drawRobot(badRobotContext, "limegreen");
   }
}

function playGame() {
   document.getElementById("introDiv").style.display = 'none';
   document.getElementById("gameDiv").style.display = 'block';
   drawRobots();
   setUpQuestion();
}

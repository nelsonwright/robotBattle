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
   lightRippleIntervalId: null,  // ID for light rippling, as above
   explosionSpeed: 50            // time in millis between robot explosion frames
};

var selectedOptions;

function Robot(colour, lightColours, canvas) {
   this.colour = colour;
   this.lightColours = Object.freeze(lightColours);
   this.canvas = canvas;
   this.context = null;
   this.leftArmRaised = false;
   this.rightArmRaised = false;
   this.electricityFlash = false;
   this.isExploding = false;
   this.electricityIntervalId;
   this.explosionIntervalId;
   this.explodeFactor;

   var self = this;

   if (this.canvas.getContext) {
      this.context = this.canvas.getContext("2d");
   }

   this.drawElectricity = function(x, y) {
      self.context.save();

      self.context.strokeStyle = "gold";
      self.context.lineWidth = 2;
      self.context.globalAlpha = 0.9;

      if (Math.random() > 0.5) {
         self.context.fillStyle = "lightGoldenRodYellow ";
      } else {
         self.context.fillStyle = "gold";
      }

      self.context.beginPath();
      self.context.moveTo(10 + x + xOffset, 46 + y + yOffset);

      self.context.lineTo(26 + x + xOffset, 28 + y + yOffset);
      self.context.lineTo(28 + x + xOffset, 46 + y + yOffset);
      self.context.lineTo(55 + x + xOffset, 21 + y + yOffset);
      self.context.lineTo(62 + x + xOffset, 41 + y + yOffset);
      self.context.lineTo(92 + x + xOffset,  6 + y + yOffset);
      self.context.lineTo(67 + x + xOffset, 22 + y + yOffset);
      self.context.lineTo(58 + x + xOffset,  7 + y + yOffset);
      self.context.lineTo(35 + x + xOffset, 28 + y + yOffset);
      self.context.lineTo(29 + x + xOffset, 16 + y + yOffset);
      self.context.closePath();

      self.context.stroke();
      self.context.fill();

      self.context.restore();
   };

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

   function drawEyes(adjust) {
      if (typeof adjust === "undefined") {
         adjust = 0;
      }

      var y = 337 + yOffset + adjust;
      self.context.save();

      self.context.fillStyle = "white";
      self.context.lineWidth = 4;

      self.context.beginPath();
      self.context.arc(100 + xOffset, y , 7, 0, 2*Math.PI);
      self.context.stroke();
      self.context.fill();

      self.context.moveTo(138 + xOffset, y);
      self.context.arc(138 + xOffset, y, 7, 0, 2*Math.PI);
      self.context.stroke();
      self.context.fill();
      self.context.closePath();

      self.context.restore();
   }

   function clearLeftArmAndHand() {
      clearOffsetStrokedRect(self.context, 8, 170, 27, 117);
      clearOffsetStrokedRect(self.context, 0, 141, 42, 32);
   }

   function drawRightArmAndHand() {
      drawOffsetStrokedRect(self.context, 201, 170, 27, 117);
      drawOffsetStrokedRect(self.context, 194, 141, 42, 32);
   }

   function drawRightArmAndHandUp() {
      drawOffsetStrokedRect(self.context, 201, 260, 27, 117);
      drawOffsetStrokedRect(self.context, 194, 378, 42, 32);
   }

   function drawLeftArmAndHand() {
      drawOffsetStrokedRect(self.context, 8, 170, 27, 117);
      drawOffsetStrokedRect(self.context, 0, 141, 42, 32);
   }

   function drawLeftArmAndHandUp() {
      self.context.fillStyle = self.colour;
      self.context.strokeStyle = "black";

      drawOffsetStrokedRect(self.context, 8, 260, 27, 117);
      drawOffsetStrokedRect(self.context, 0, 378, 42, 32);
   }

   function drawArmsAndHands() {
      if (self.leftArmRaised) {
         drawLeftArmAndHandUp();
      } else {
         drawLeftArmAndHand();
      }

      if (self.rightArmRaised) {
         drawRightArmAndHandUp();
      } else {
         drawRightArmAndHand();
      }
   }

   function drawBodyDecoration() {
      var y = 185 + yOffset;
      var x = 71;
      var width =  96;
      var height = 60;

      self.context.save();

      self.context.strokeStyle = "black";
      self.context.lineWidth = 2;

      self.context.strokeRect(x + xOffset, y, width, height);

      // draw the grille on the body
      for (let i = 0; i < 3; i++) {
            // horizontal lines
            self.context.beginPath();
            self.context.moveTo(x + xOffset, y + i*(height/3));
            self.context.lineTo(x + xOffset + width, y + i*(height/3));
            self.context.stroke();
      }

      for (let i = 0; i < 4; i++) {
         //vertical lines
         self.context.beginPath();
         self.context.moveTo(x + xOffset + i*(width/4), y);
         self.context.lineTo(x + xOffset + i*(width/4), y + height);
         self.context.stroke();
      }

      self.drawBodyLights();

      self.context.restore();
   }

   function drawFlashingElectrity() {
      var height = self.canvas.height;
      var width = self.canvas.width;

      var x = (width / 8) + ((width / 3) * Math.random());
      var y = (height / 3) + ((height / 4) * Math.random());

      if (self.electricityFlash) {
         self.electricityIntervalId = setInterval(self.drawElectricity, 100, x, y);
         self.electricityFlash = false;
      } else {
         clearInterval(self.electricityIntervalId);
      }
   }

   function explodeLimbs() {
      if (self.explodeFactor > 20) {
         clearInterval(self.explosionIntervalId);
         return;
      }

      self.canvas.width = self.canvas.width;

      self.context.translate(0, self.canvas.height);
      self.context.scale(1,-1);

      var textureImage = document.getElementById("rustTexture");
      patternFill = self.context.createPattern(textureImage, "repeat");
      self.context.fillStyle = patternFill;

      self.context.strokestyle = "black";
      self.context.lineWidth = 4;

      self.explodeFactor++;
      var adjust = self.explodeFactor * 10;

      // head
      drawOffsetStrokedRect(self.context, 90, 293 + adjust, 57, 84);
      drawOffsetStrokedRect(self.context, 64, 316 + adjust, 109, 38);
      drawEyes(adjust);

      // neck
      drawOffsetStrokedRect(self.context, 106, 285 + adjust, 26, 8);

      // body
      drawOffsetStrokedRect(self.context, 50, 125, 136, 162);
      drawOffsetStrokedRect(self.context, 8, 260, 220, 27);
      drawBodyDecoration();

      drawArmsAndHands();

      // legs
      drawOffsetStrokedRect(self.context, 71, 0, 42, 125);
      drawOffsetStrokedRect(self.context, 127, 0, 42, 125);

      // feet
      drawOffsetStrokedRect(self.context, 48, 0, 65, 26);
      drawOffsetStrokedRect(self.context, 127, 0, 68, 26);
   }

   function explode() {
      self.explodeFactor = 1;
      self.explosionIntervalId = setInterval(explodeLimbs, gameState.explosionSpeed);
   }

   this.drawBodyLights = function() {
      self.context.lineWidth = 2;

      for (let i = 0; i < 3; i++) {
         if (self.isExploding) {
            self.context.fillStyle = "black";
         } else {
            self.context.fillStyle = this.lightColours[i];
         }

         drawBodyLight(i);
      }
   };

   this.chooseAndDrawLights = function() {
      var lightToChange;
      var randomColourIndex;

      for (let i = 0; i < 2; i++) {
         lightToChange = Math.floor(Math.random() * 3);
         randomColourIndex = Math.floor(Math.random() * this.lightColours.length);

         this.context.fillStyle = this.lightColours[randomColourIndex];
         drawBodyLight(lightToChange);
      }
   };

   this.draw = function() {
      // first, blank the canvas . . .
      this.canvas.width = this.canvas.width;

      // needed due to Inkscape calculating y values from bottom to top, rather than
      // top to bottom, and the drawing points are taken from Inkscape designs
      this.context.translate(0, this.canvas.height);
      this.context.scale(1,-1);

      this.context.fillStyle = this.colour;
      this.context.strokestyle = "black";
      this.context.lineWidth = 4

      // head
      drawOffsetStrokedRect(this.context, 90, 293, 57, 84);
      drawOffsetStrokedRect(this.context, 64, 316, 109, 38);
      drawEyes();

      // neck
      drawOffsetStrokedRect(this.context, 106, 285, 26, 8);

      // body
      drawOffsetStrokedRect(this.context, 50, 125, 136, 162);
      drawOffsetStrokedRect(this.context, 8, 260, 220, 27);
      drawBodyDecoration();

      drawArmsAndHands();

      // legs
      drawOffsetStrokedRect(this.context, 71, 0, 42, 125);
      drawOffsetStrokedRect(this.context, 127, 0, 42, 125);

      // feet
      drawOffsetStrokedRect(this.context, 48, 0, 65, 26);
      drawOffsetStrokedRect(this.context, 127, 0, 68, 26);

      drawFlashingElectrity();

      if (this.isExploding) {
         explode();
      }
   };
}

function EnergyBar(robot, canvas, colour) {
   this.robot = robot;
   this.canvas = canvas;
   this.colour = colour;
   this.context = null;

   this.draw = function() {
      // blank the canvas before drawing anything . . .
      this.canvas.width = this.canvas.width;

      for (let i = 0; i < this.robot.energy; i++) {
         drawStrokedRectWithGradient(this.context, i, this.colour, this.canvas);
      }
   }
}

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
   answerRequired: null,
   answerIndex: null,
   type: null,
   optionChosen: null,
   questionText: "",
   answerText: "",
   resultText: null,
   inProgress: false, // indicates if we're answering a question at the moment
   intervalId: null,  // timer id for this question
   create() {
      this.answerIndex = 0;
      this.answerText = "?";
      this.optionChosen = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];

      switch (this.optionChosen) {
         case "additionSingleDigits":
            this.type = "addition";
            this.firstFactor = Math.floor(Math.random() * 9) + 1;
            this.secondFactor = Math.floor(Math.random() * 9) + 1;
            this.answerRequired = this.sum();
            break;
         case "additionDoubleDigits":
            this.type = "addition";
            this.firstFactor = Math.floor(Math.random() * 10) + 10 + Math.floor(Math.random() * 40) + 1;
            this.secondFactor = Math.floor(Math.random() * 10) + 10 + Math.floor(Math.random() * 40) + 1;
            this.answerRequired = this.sum();
            break;
         case "numberBondsTo10":
            this.type = "addition";
            this.firstFactor = Math.floor(Math.random() * 10)  + 1;
            this.secondFactor = 10;
            this.answerRequired = this.secondFactor - this.firstFactor;
            break;
         case "numberBondsTo20":
            this.type = "addition";
            this.firstFactor = Math.floor(Math.random() * 20)  + 1;
            this.secondFactor = 20;
            this.answerRequired = this.secondFactor - this.firstFactor;
            break;

         case "subtractionSingleDigits":
            this.type = "subtraction";
            this.firstFactor = Math.floor(Math.random() * 9) + 1;
            this.secondFactor = Math.floor(Math.random() * this.firstFactor);
            this.answerRequired = this.firstFactor - this.secondFactor;
            break;
         case "subtractionDoubleDigits":
            this.type = "subtraction";
            this.firstFactor = Math.floor(Math.random() * 10) + 10
            this.secondFactor = Math.floor(Math.random() * this.firstFactor);
            this.answerRequired = this.firstFactor - this.secondFactor;
            break;

         case "multiplication_2_to_5":
            this.type = "multiplication";
            this.firstFactor = Math.floor(Math.random() * 4) + 2;
            this.secondFactor = Math.floor(Math.random() * 4) + 2;
            this.answerRequired = this.product();
            break;
         case "multiplication_6_to_10":
            this.type = "multiplication";
            this.firstFactor = Math.floor(Math.random() * 5) + 6;
            this.secondFactor = Math.floor(Math.random() * 5) + 6;
            this.answerRequired = this.product();
            break;
         case "multiplication_2_to_10":
            this.type = "multiplication";
            this.firstFactor = Math.floor(Math.random() * 9) + 2;
            this.secondFactor = Math.floor(Math.random() * 9) + 2;
            this.answerRequired = this.product();
            break;
         case "multiplication_2_to_12":
            this.type = "multiplication";
            this.firstFactor = Math.floor(Math.random() * 11) + 2;
            this.secondFactor = Math.floor(Math.random() * 11) + 2;
            this.answerRequired = this.product();
            break;
      }

      this.digitToGuess = this.calcDigitToGuess();
   },
   product() {
      return this.firstFactor * this.secondFactor;
   },
   sum() {
      return this.firstFactor + this.secondFactor;
   },
   setQuestionText() {
      if (this.optionChosen.match("numberBonds")) {
         this.questionText = `${this.firstFactor} ${this.operand} ${this.answerText} = ${this.secondFactor}`;
      } else {
         this.questionText = `${this.firstFactor} ${this.operand} ${this.secondFactor} = ${this.answerText}`;
      }
   },
   createQuestionText() {
      this.wipeText();
      this.create();
      this.operand = this.type === "addition" ? "+" : "X";

      switch(this.type) {
         case "addition":
            this.operand = "+";
            break;
         case "subtraction":
            this.operand = "-";
            break;
         case "multiplication":
            this.operand = "X";
            break;
         default:
            console.log("unknown type" + this.type);
      }

      this.setQuestionText();
      this.resultText = "Awaiting answer . . .";
      return this.questionText;
   },
   updateQuestionText(digitPressed) {
      this.answerText = this.answerText === "?" ? digitPressed : this.answerText + digitPressed.toString();
      this.setQuestionText();
   },
   correctDigitGuessed(digitGuessed) {
      return digitGuessed === this.digitToGuess;
   },
   calcDigitToGuess () {
      return parseInt(this.answerRequired.toString()[this.answerIndex]);
   },
   updateDigitToGuess() {
      this.answerIndex++;
      this.digitToGuess = this.calcDigitToGuess();
   },
   gotItAllCorrect() {
      return this.answerIndex >= this.answerRequired.toString().length;
   },
   wipeText() {
      this.resultText = " ";
      this.answerText = "";
      this.questionText = "";
   },
   composeCorrectAnswerText() {
      return `It's ${this.answerRequired}`;
   },
   draw() {
      $("#questionAndAnswersPara").text(this.questionText);
      $("#resultPara").text(this.resultText);
   }
};

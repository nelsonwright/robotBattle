var Robot = function(colour, lightColours, canvas, energy) {
   var context;
   var leftArmRaised;
   var rightArmRaised;
   var electricityFlash;
   var isExploding;
   var electricityIntervalId;
   var explosionIntervalId;
   var explodeFactor;
   var textureImage = document.getElementById("rustTexture");
   var explosionImage = document.getElementById("explosion");

   if (canvas.getContext) {
      context = canvas.getContext("2d");
   }

   function drawElectricity(x, y) {
      context.save();

      context.strokeStyle = "gold";
      context.lineWidth = 2;
      context.globalAlpha = 0.9;

      if (Math.random() > 0.5) {
         context.fillStyle = "lightGoldenRodYellow ";
      } else {
         context.fillStyle = "gold";
      }

      context.beginPath();
      context.moveTo(10 + x + screen.xOffset, 46 + y + screen.yOffset);

      context.lineTo(26 + x + screen.xOffset, 28 + y + screen.yOffset);
      context.lineTo(28 + x + screen.xOffset, 46 + y + screen.yOffset);
      context.lineTo(55 + x + screen.xOffset, 21 + y + screen.yOffset);
      context.lineTo(62 + x + screen.xOffset, 41 + y + screen.yOffset);
      context.lineTo(92 + x + screen.xOffset,  6 + y + screen.yOffset);
      context.lineTo(67 + x + screen.xOffset, 22 + y + screen.yOffset);
      context.lineTo(58 + x + screen.xOffset,  7 + y + screen.yOffset);
      context.lineTo(35 + x + screen.xOffset, 28 + y + screen.yOffset);
      context.lineTo(29 + x + screen.xOffset, 16 + y + screen.yOffset);
      context.closePath();

      context.stroke();
      context.fill();

      context.restore();
   }

   function drawBodyLight(position) {
      var y = 152 + screen.yOffset;
      var x = 87;
      var areaWidth = 100;
      var circleRadius = 5;

      context.beginPath();
      context.moveTo(x + screen.xOffset + position * (areaWidth/3), y);
      context.arc(x + screen.xOffset + position * (areaWidth/3), y, circleRadius, 0, 2 * Math.PI);

      context.stroke();
      context.fill();
   }

   function drawEyes(adjust) {
      if (typeof adjust === "undefined") {
         adjust = 0;
      }

      var y = 337 + screen.yOffset + adjust;
      context.save();

      context.fillStyle = "white";
      context.lineWidth = 4;

      context.beginPath();
      context.arc(100 + screen.xOffset, y , 7, 0, 2*Math.PI);
      context.stroke();
      context.fill();

      context.moveTo(138 + screen.xOffset, y);
      context.arc(138 + screen.xOffset, y, 7, 0, 2*Math.PI);
      context.stroke();
      context.fill();
      context.closePath();

      context.restore();
   }

   function clearLeftArmAndHand() {
      screen.clearOffsetStrokedRect(context, 8, 170, 27, 117);
      screen.clearOffsetStrokedRect(context, 0, 141, 42, 32);
   }

   function drawRightArmAndHand() {
      screen.drawOffsetStrokedRect(context, 201, 170, 27, 117);
      screen.drawOffsetStrokedRect(context, 194, 141, 42, 32);
   }

   function drawRightArmAndHandUp() {
      screen.drawOffsetStrokedRect(context, 201, 260, 27, 117);
      screen.drawOffsetStrokedRect(context, 194, 378, 42, 32);
   }

   function drawLeftArmAndHand() {
      screen.drawOffsetStrokedRect(context, 8, 170, 27, 117);
      screen.drawOffsetStrokedRect(context, 0, 141, 42, 32);
   }

   function drawLeftArmAndHandUp() {
      context.fillStyle = colour;
      context.strokeStyle = "black";

      screen.drawOffsetStrokedRect(context, 8, 260, 27, 117);
      screen.drawOffsetStrokedRect(context, 0, 378, 42, 32);
   }

   function drawArmsAndHands(adjust) {
      if (leftArmRaised) {
         drawLeftArmAndHandUp();
      } else {
         drawLeftArmAndHand();
      }

      if (rightArmRaised) {
         drawRightArmAndHandUp();
      } else {
         drawRightArmAndHand();
      }
   }

   function drawBodyDecoration() {
      var y = 185 + screen.yOffset;
      var x = 71;
      var width =  96;
      var height = 60;

      context.save();

      context.strokeStyle = "black";
      context.lineWidth = 2;

      context.strokeRect(x + screen.xOffset, y, width, height);

      // draw the grille on the body
      for (let i = 0; i < 3; i++) {
            // horizontal lines
            context.beginPath();
            context.moveTo(x + screen.xOffset, y + i*(height/3));
            context.lineTo(x + screen.xOffset + width, y + i*(height/3));
            context.stroke();
      }

      for (let i = 0; i < 4; i++) {
         //vertical lines
         context.beginPath();
         context.moveTo(x + screen.xOffset + i*(width/4), y);
         context.lineTo(x + screen.xOffset + i*(width/4), y + height);
         context.stroke();
      }

      drawBodyLights();

      context.restore();
   }

   function drawFlashingElectrity() {
      var height = canvas.height;
      var width = canvas.width;

      var x = (width / 8) + ((width / 3) * Math.random());
      var y = (height / 3) + ((height / 4) * Math.random());

      if (electricityFlash) {
         electricityIntervalId = setInterval(drawElectricity, 100, x, y);
         electricityFlash = false;
      } else {
         clearInterval(electricityIntervalId);
      }
   }

   function drawExplosion() {
      context.save();
      var alpha;

      if (explodeFactor <= 3) {
         alpha = 1;
      } else if (explodeFactor > 10) {
         alpha = 0.8 * (1 / (explodeFactor - 10));
      } else {
         alpha = 0.8;
      }

      context.globalAlpha = alpha;
      context.drawImage(explosionImage, 10, 160);

      context.restore();
   }

   function explodeLimbs(patternFill) {

      if (explodeFactor > 20) {
         clearInterval(explosionIntervalId);
         isExploding = false;
         canvas.width = canvas.width;
         return;
      }

      canvas.width = canvas.width;

      context.translate(0, canvas.height);
      context.scale(1,-1);


      context.fillStyle = patternFill;

      context.strokestyle = "black";
      context.lineWidth = 4;

      explodeFactor++;
      var adjust = explodeFactor * 10;

      // head
      screen.drawOffsetStrokedRect(context, 90, 293 + adjust, 57, 84);
      screen.drawOffsetStrokedRect(context, 64, 316 + adjust, 109, 38);
      drawEyes(adjust);

      // neck
      screen.drawOffsetStrokedRect(context, 106, 285 + adjust, 26, 8);

      // body
      context.save();
      context.rotate(explodeFactor * 5 * Math.PI / 180);

      screen.drawOffsetStrokedRect(context, 50, 125, 136, 162);
      screen.drawOffsetStrokedRect(context, 8, 260, 220, 27);
      drawBodyDecoration();
      context.restore();

      // arms and hands
      context.save();
      context.rotate(0 - explodeFactor * 7 * Math.PI / 180);
      drawArmsAndHands();
      context.restore();

      // legs
      context.save();
      context.translate(0, adjust * 4);
      context.rotate(0 - explodeFactor * 4 * Math.PI / 180);

      screen.drawOffsetStrokedRect(context, 71, 0, 42, 125);
      screen.drawOffsetStrokedRect(context, 127, 0, 42, 125);
      context.restore();

      // feet
      context.save();
      context.translate(adjust * 1.5, adjust * 1.5);

      screen.drawOffsetStrokedRect(context, 48, 0, 65, 26);
      screen.drawOffsetStrokedRect(context, 127, 0, 68, 26);
      context.restore();

      drawExplosion();
   }

   function explode() {
      var patternFill = context.createPattern(textureImage, "repeat");

      explodeFactor = 1;
      explosionIntervalId = setInterval(explodeLimbs, gameState.explosionSpeed, patternFill);
   }

   var drawBodyLights = function() {
      context.lineWidth = 2;

      for (let i = 0; i < 3; i++) {
         if (isExploding) {
            context.fillStyle = "black";
         } else {
            context.fillStyle = lightColours[i];
         }

         drawBodyLight(i);
      }
   };

   var chooseAndDrawLights = function() {
      var lightToChange;
      var randomColourIndex;

      for (let i = 0; i < 2; i++) {
         lightToChange = Math.floor(Math.random() * 3);
         randomColourIndex = Math.floor(Math.random() * lightColours.length);

         context.fillStyle = lightColours[randomColourIndex];
         drawBodyLight(lightToChange);
      }
   };

   var setElectricityToFlash = function() {
      electricityFlash = true;
   }

   var setToExplode = function() {
      isExploding = true;
   }

   var getEnergy = function() {
      return energy;
   }

   var runOutOfEnergy = function() {
      return energy < 0;
   }

   var hasEnergy = function() {
      return energy >= 0;
   }

   var reduceEnergy = function() {
      energy --;
   }

   var setLeftArmRaised = function(state) {
      leftArmRaised = state;
   }

   var setRightArmRaised = function(state) {
      rightArmRaised = state;
   }

   var draw = function() {
      // first, blank the canvas . . .
      canvas.width = canvas.width;

      // needed due to Inkscape calculating y values from bottom to top, rather than
      // top to bottom, and the drawing points are taken from Inkscape designs
      context.translate(0, canvas.height);
      context.scale(1,-1);

      context.fillStyle = colour;
      context.strokestyle = "black";
      context.lineWidth = 4;

      // head
      screen.drawOffsetStrokedRect(context, 90, 293, 57, 84);
      screen.drawOffsetStrokedRect(context, 64, 316, 109, 38);
      drawEyes();

      // neck
      screen.drawOffsetStrokedRect(context, 106, 285, 26, 8);

      // body
      screen.drawOffsetStrokedRect(context, 50, 125, 136, 162);
      screen.drawOffsetStrokedRect(context, 8, 260, 220, 27);
      drawBodyDecoration();

      drawArmsAndHands();

      // legs
      screen.drawOffsetStrokedRect(context, 71, 0, 42, 125);
      screen.drawOffsetStrokedRect(context, 127, 0, 42, 125);

      // feet
      screen.drawOffsetStrokedRect(context, 48, 0, 65, 26);
      screen.drawOffsetStrokedRect(context, 127, 0, 68, 26);

      drawFlashingElectrity();

      if (isExploding) {
         explode();
      }
   };

   return {
      chooseAndDrawLights,
      drawBodyLights,
      setElectricityToFlash,
      setToExplode,
      getEnergy,
      runOutOfEnergy,
      hasEnergy,
      reduceEnergy,
      setLeftArmRaised,
      setRightArmRaised,
      draw
   }
}

// creates the questions and expected answers
var calculation = (function() {
   var firstFactor, secondFactor, thirdFactor, digitToGuess, answerRequired,
       answerIndex, optionChosen, resultText, operand;
   var questionText = "";
   var answerText = "";
   var inProgress = false;  // indicates if we're answering a question at the moment
   var intervalId; // timer id for this question


   // hmm. should probably put these next four functions into their own helper . . .
   function randomNumberTwoToTwelve() {
      return Math.floor(Math.random() * 11) + 2;
   }

   function randomSingleDigit() {
      return Math.floor(Math.random() * 9) + 1;
   }

   function randomButLessThan(number) {
      return Math.floor(Math.random() * number);
   }

   function randomBetween(first, second) {
      return  Math.floor(Math.random() * ((second + 1) - first)) + first;
   }

   function product() {
      return firstFactor * secondFactor;
   }

   function sum() {
      return firstFactor + secondFactor;
   }

   function setTextForQuestion() {
      if (optionChosen.match("OneMore")) {
         questionText = `1 more than ${firstFactor} is ${answerText}`;
      } else if (optionChosen.match("OneLess")) {
         questionText = `1 less than ${firstFactor} is ${answerText}`;
      } else if (optionChosen.match("NumberBonds")) {
         questionText = `${firstFactor} ${operand} ${answerText} = ${secondFactor}`;
      } else if (optionChosen.match("sequence")) {
         questionText = `${firstFactor}${operand}${secondFactor}${operand}${answerText}${operand}${thirdFactor}`;
      } else {
         questionText = `${firstFactor} ${operand} ${secondFactor} = ${answerText}`;
      }
   }

   function calcDigitToGuess () {
      return parseInt(answerRequired.toString().charAt(answerIndex));
   }

   function calculateMultiplicationComponentsFor(optionChosen) {
      firstFactor = randomNumberTwoToTwelve();
      secondFactor = optionChosen.split("_", 2)[1];
      answerRequired = product();
   }

   function calculateSequenceComponentsFor(optionChosen) {
      var sequenceChosen = parseInt(optionChosen.split("_", 2)[1]);
      var startOfSequence = sequenceChosen * randomBetween(0, 9);
      firstFactor = startOfSequence;
      secondFactor = startOfSequence + sequenceChosen;
      answerRequired = startOfSequence + (sequenceChosen * 2);
      thirdFactor = startOfSequence + (sequenceChosen * 3);
   }

   function calculateAdditionComponentsFor(optionChosen) {
      switch (optionChosen) {
         case "SingleDigits":
            firstFactor = randomSingleDigit();
            secondFactor = randomSingleDigit();
            answerRequired = sum();
            break;
         case "DoubleDigits":
            firstFactor = randomBetween(10, 99);
            secondFactor = randomBetween(10, 99);
            answerRequired = sum();
            break;
         case "NumberBondsTo10":
            firstFactor = randomBetween(1, 10);
            secondFactor = 10;
            answerRequired = secondFactor - firstFactor;
            break;
         case "NumberBondsTo20":
            firstFactor = randomBetween(0, 20);
            secondFactor = 20;
            answerRequired = secondFactor - firstFactor;
            break;
         case "OneMore":
            firstFactor = randomSingleDigit();
            secondFactor = 1;
            answerRequired = firstFactor + secondFactor;
            break;
      }
   }

   function calculateSubtractionComponentsFor(optionChosen) {
      switch (optionChosen) {
         case "SingleDigits":
            firstFactor = randomSingleDigit();
            secondFactor = randomButLessThan(firstFactor);
            answerRequired = firstFactor - secondFactor;
            break;
         case "DoubleDigits":
            firstFactor = randomBetween(20, 99);
            secondFactor = randomButLessThan(firstFactor);
            answerRequired = firstFactor - secondFactor;
            break;
         case "OneLess":
            firstFactor = randomSingleDigit();
            secondFactor = 1;
            answerRequired = firstFactor - secondFactor;
            break;
      }
   }

   function calculateDivisionComponentsFor(optionChosen) {
      secondFactor = optionChosen.split("_", 2)[1];
      firstFactor = randomNumberTwoToTwelve() * secondFactor;
      answerRequired = firstFactor / secondFactor;
   }

   function create(selectedOptions) {
      answerIndex = 0;
      answerText = "?";
      optionChosen = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];

      // TODO: use html5 data attributes on the html instead of this monstrosity, e.g.
      // instead of
      // <input type="checkbox" value="additionSingleDigits" checked>
      // have
      //<input type="checkbox" value="addition" data-calcType="SingleDigits" checked>

      // regex: just match the lower case part before any upper case letters or underscore
      var typeChosen = optionChosen.toString().match(/\b([a-z]+)(?=[A-Z]|_)/)[1];
      var optionDetail = optionChosen.replace(typeChosen,"");

      switch (typeChosen) {
         case "addition":
            operand = "+";
            calculateAdditionComponentsFor(optionDetail);
         break;
         case "subtraction":
            operand = "-";
            calculateSubtractionComponentsFor(optionDetail);
         break;
         case "sequence":
            operand = "...";
            calculateSequenceComponentsFor(optionDetail);
         break;
         case "multiplication":
            operand = "X";
            calculateMultiplicationComponentsFor(optionDetail);
         break;
         case "division":
            operand = "÷";
            calculateDivisionComponentsFor(optionDetail);
         break;
      }

      digitToGuess = calcDigitToGuess();
   }

   var questionOutcome = Object.freeze({
      correct: "Got it right!",
      incorrect: "Wrong!",
      tooSlow: "Too slow!"
   });

   var wipeText = function() {
      resultText = " ";
      answerText = "";
      questionText = "";
   };

   var createQuestionText = function(selectedOptions) {
      wipeText();
      create(selectedOptions);
      setTextForQuestion();
      resultText = "Awaiting answer . . .";
      return questionText;
   };

   var updateQuestionText = function(digitPressed) {
      answerText = answerText === "?" ? digitPressed : answerText + digitPressed.toString();
      setTextForQuestion();
   };

   var setQuestionText = function(text) {
      questionText = text;
   };

   var setResultText = function(text) {
      resultText = text;
   };

   var getResultText = function() {
      return resultText;
   };

   var setInProgress = function(state) {
      inProgress = state;
   };

   var isInProgress = function() {
      return inProgress;
   };

   var correctDigitGuessed = function(digitGuessed) {
      return digitGuessed === digitToGuess;
   };

   var updateDigitToGuess = function() {
      answerIndex++;
      digitToGuess = calcDigitToGuess();
   };

   var gotItAllCorrect = function() {
      return answerIndex >= answerRequired.toString().length;
   };

   var composeCorrectAnswerText = function() {
      return `It's ${answerRequired}`;
   };

   var draw = function() {
      if (inProgress) {
         $("#humanReady").hide();
         $("#questionAndAnswersPara,#resultPara").show();
         $("#questionAndAnswersPara").text(questionText);
         $("#resultPara").text(resultText);
      } else {
         $("#humanReady").show();
         $("#questionAndAnswersPara,#resultPara").hide();
      }
   };

   return {
      intervalId,
      questionOutcome,
      wipeText,
      createQuestionText,
      updateQuestionText,
      setQuestionText,
      setResultText,
      getResultText,
      setInProgress,
      isInProgress,
      correctDigitGuessed,
      updateDigitToGuess,
      gotItAllCorrect,
      composeCorrectAnswerText,
      draw
   };

}());

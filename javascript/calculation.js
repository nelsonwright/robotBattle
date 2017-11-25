// creates the questions and expected answers
var calculation = (function() {
   var firstFactor, secondFactor, digitToGuess, answerRequired, answerIndex,
       optionChosen, resultText, operand;
   var questionText = "";
   var answerText = "";
   var inProgress = false;  // indicates if we're answering a question at the moment
   var intervalId; // timer id for this question


   // hmm. should probably put these next four functions into their own helper module . . .
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

   function calculateMultiplicationComponentsFor(optionChosen) {
      firstFactor = randomNumberTwoToTwelve();
      secondFactor = optionChosen.split("_", 2)[1];
      answerRequired = product();
   }

   function setTextForQuestion() {
      if (optionChosen.match("NumberBonds")) {
         questionText = `${firstFactor} ${operand} ${answerText} = ${secondFactor}`;
      } else {
         questionText = `${firstFactor} ${operand} ${secondFactor} = ${answerText}`;
      }
   }

   function calcDigitToGuess () {
      return parseInt(answerRequired.toString().charAt(answerIndex));
   }

   function calculateAdditionComponentsFor(optionChosen) {
      switch (optionChosen) {
         case "additionSingleDigits":
            firstFactor = randomSingleDigit();
            secondFactor = randomSingleDigit();
            answerRequired = sum();
            break;
         case "additionDoubleDigits":
            firstFactor = randomBetween(10, 99);
            secondFactor = randomBetween(10, 99);
            answerRequired = sum();
            break;
         case "additionNumberBondsTo10":
            firstFactor = randomBetween(1, 10);
            secondFactor = 10;
            answerRequired = secondFactor - firstFactor;
            break;
         case "additionNumberBondsTo20":
            firstFactor = randomBetween(0, 20);
            secondFactor = 20;
            answerRequired = secondFactor - firstFactor;
            break;
      }
   }

   function calculateSubtractionComponentsFor(optionChosen) {
      switch (optionChosen) {
         case "subtractionSingleDigits":
            firstFactor = randomSingleDigit();
            secondFactor = randomButLessThan(firstFactor);
            answerRequired = firstFactor - secondFactor;
            break;
         case "subtractionDoubleDigits":
            firstFactor = randomBetween(20, 99);
            secondFactor = randomButLessThan(firstFactor);
            answerRequired = firstFactor - secondFactor;
            break;
      }
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

      switch (typeChosen) {
         case "addition":
            operand = "+";
            calculateAdditionComponentsFor(optionChosen);
         break;
         case "subtraction":
            operand = "-";
            calculateSubtractionComponentsFor(optionChosen);
         break;
         case "multiplication":
            operand = "X";
            calculateMultiplicationComponentsFor(optionChosen);
         break;
      }

      digitToGuess = calcDigitToGuess();
   }

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
      $("#questionAndAnswersPara").text(questionText);
      $("#resultPara").text(resultText);
   };

   return {
      intervalId,
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

// creates the questions and expected answers
var calculation = (function() {
   var firstFactor, secondFactor, digitToGuess, answerRequired, answerIndex,
      type, optionChosen, resultText, operand;
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
      return  Math.floor(Math.random() * (second + 1) - first) + first;
   }

   function product() {
      return firstFactor * secondFactor;
   }

   function sum() {
      return firstFactor + secondFactor;
   }

   function setUpMultiplication(optionChosen) {
      type = "multiplication";
      firstFactor = randomNumberTwoToTwelve();
      secondFactor = optionChosen.split("_", 1);
      answerRequired = product();
   }

   function setTextForQuestion() {
      if (optionChosen.match("numberBonds")) {
         questionText = `${firstFactor} ${operand} ${answerText} = ${secondFactor}`;
      } else {
         questionText = `${firstFactor} ${operand} ${secondFactor} = ${answerText}`;
      }
   }

   function calcDigitToGuess () {
      return parseInt(answerRequired.toString().charAt(answerIndex));
   };

   function create(selectedOptions) {
      answerIndex = 0;
      answerText = "?";
      optionChosen = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];

      switch (optionChosen) {
         case "additionSingleDigits":
            type = "addition";
            firstFactor = randomSingleDigit();
            secondFactor = randomSingleDigit();
            answerRequired = sum();
            break;
         case "additionDoubleDigits":
            type = "addition";
            firstFactor = randomBetween(10, 99);
            secondFactor = randomBetween(10, 99);
            answerRequired = sum();
            break;
         case "numberBondsTo10":
            type = "addition";
            firstFactor = randomBetween(1, 10);
            secondFactor = 10;
            answerRequired = secondFactor - firstFactor;
            break;
         case "numberBondsTo20":
            type = "addition";
            firstFactor = randomBetween(1, 20);
            secondFactor = 20;
            answerRequired = secondFactor - firstFactor;
            break;

         case "subtractionSingleDigits":
            type = "subtraction";
            firstFactor = randomSingleDigit();
            secondFactor = randomButLessThan(firstFactor);
            answerRequired = firstFactor - secondFactor;
            break;
         case "subtractionDoubleDigits":
            type = "subtraction";
            firstFactor = randomBetween(1, 99);
            secondFactor = randomButLessThan(firstFactor);
            answerRequired = firstFactor - secondFactor;
            break;

         case "2_times_table":
         case "3_times_table":
         case "4_times_table":
         case "5_times_table":
         case "6_times_table":
         case "7_times_table":
         case "8_times_table":
         case "9_times_table":
         case "10_times_table":
         case "11_times_table":
         case "12_times_table":
            setUpMultiplication(optionChosen);
            break;
         default:
            // no recognised option
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

      switch(type) {
         case "addition":
            operand = "+";
            break;
         case "subtraction":
            operand = "-";
            break;
         case "multiplication":
            operand = "X";
            break;
      }

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

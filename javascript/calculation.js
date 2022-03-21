// creates the questions and expected answers
var calculation = (function() {
   var firstComponent, secondComponent, thirdComponent, digitToGuess, answerRequired,
       answerIndex, optionChosen, resultText, operand;
   var priorFirstDivisionComponent;
   var questionText = "";
   var answerText = "";
   var inProgress = false;  // indicates if we're answering a question at the moment
   var intervalId; // timer id for this question

   function product() {
      return firstComponent * secondComponent;
   }

   function sum() {
      return firstComponent + secondComponent;
   }

   function setTextForQuestion() {
      if (optionChosen.match("OneMore")) {
         questionText = `1 more than ${firstComponent} is ${answerText}`;
      } else if (optionChosen.match("OneLess")) {
         questionText = `1 less than ${firstComponent} is ${answerText}`;
      } else if (optionChosen.match("NumberBonds")) {
         questionText = `${firstComponent} ${operand} ${answerText} = ${secondComponent}`;
      } else if (optionChosen.match("sequence")) {
         questionText = `${firstComponent}${operand}${secondComponent}${operand}${answerText}${operand}${thirdComponent}`;
      } else {
         questionText = `${firstComponent} ${operand} ${secondComponent} = ${answerText}`;
      }
   }

   function calcDigitToGuess () {
      return parseInt(answerRequired.toString().charAt(answerIndex));
   }

   function calculateMultiplicationComponentsFor(optionChosen) {
      firstComponent = randomNumberHelper.twoToTwelveAvoiding(firstComponent);
      secondComponent = optionChosen.split("_", 2)[1];
      answerRequired = product();
   }

   function calculateSequenceComponentsFor(optionChosen) {
      var sequenceChosen = parseInt(optionChosen.split("_", 2)[1]);
      var startOfSequence = sequenceChosen * randomNumberHelper.betweenButAvoiding(0, 9, firstComponent);
      firstComponent = startOfSequence;
      secondComponent = startOfSequence + sequenceChosen;
      answerRequired = startOfSequence + (sequenceChosen * 2);
      thirdComponent = startOfSequence + (sequenceChosen * 3);
   }

   function calculateAdditionComponentsFor(optionChosen) {
      switch (optionChosen) {
         case "SingleDigits":
            firstComponent = randomNumberHelper.singleDigitAvoiding(firstComponent);
            secondComponent = randomNumberHelper.singleDigitAvoiding();
            answerRequired = sum();
            break;
         case "DoubleDigits":
            firstComponent = randomNumberHelper.betweenButAvoiding(10, 99, firstComponent);
            secondComponent = randomNumberHelper.between(10, 99);
            answerRequired = sum();
            break;
         case "NumberBondsTo10":
            firstComponent = randomNumberHelper.betweenButAvoiding(1, 10, firstComponent);
            secondComponent = 10;
            answerRequired = secondComponent - firstComponent;
            break;
         case "NumberBondsTo20":
            firstComponent = randomNumberHelper.betweenButAvoiding(0, 20, firstComponent);
            secondComponent = 20;
            answerRequired = secondComponent - firstComponent;
            break;
         case "OneMore":
            firstComponent = randomNumberHelper.singleDigitAvoiding(firstComponent);
            secondComponent = 1;
            answerRequired = firstComponent + secondComponent;
            break;
      }
   }

   function calculateSubtractionComponentsFor(optionChosen) {
      switch (optionChosen) {
         case "SingleDigits":
            firstComponent = randomNumberHelper.singleDigitAvoiding(firstComponent);
            secondComponent = randomNumberHelper.lessThan(firstComponent);
            answerRequired = firstComponent - secondComponent;
            break;
         case "DoubleDigits":
            firstComponent = randomNumberHelper.betweenButAvoiding(20, 99, firstComponent);
            secondComponent = randomNumberHelper.lessThan(firstComponent);
            answerRequired = firstComponent - secondComponent;
            break;
         case "OneLess":
            firstComponent = randomNumberHelper.singleDigitAvoiding(firstComponent);
            secondComponent = 1;
            answerRequired = firstComponent - secondComponent;
            break;
      }
   }

   function calculateDivisionComponentsFor(optionChosen) {
      secondComponent = optionChosen.split("_", 2)[1];

      firstComponent = randomNumberHelper.twoToTwelveAvoiding(priorFirstDivisionComponent);

      //save away the first factor, so we can avoid repeating the question next time
      priorFirstDivisionComponent = firstComponent;
      firstComponent = firstComponent * secondComponent;

      answerRequired = firstComponent / secondComponent;
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

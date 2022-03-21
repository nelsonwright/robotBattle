// A helper for the creation of the random numbers used in the questions
var randomNumberHelper = (function() {

   function twoToTwelve() {
      return Math.floor(Math.random() * 11) + 2;
   };

   function singleDigit() {
     return Math.floor(Math.random() * 9) + 1;
   };

   var between = function(first, second) {
     return  Math.floor(Math.random() * ((second + 1) - first)) + first;
   };


  var twoToTwelveAvoiding = function(numberToAvoid) {
     var candidateNumber;

     candidateNumber = twoToTwelve();

     while (candidateNumber === numberToAvoid) {
       candidateNumber = twoToTwelve();
     }

     return candidateNumber;
  };

  var singleDigitAvoiding = function(numberToAvoid) {
     var candidateNumber;

     candidateNumber = singleDigit();

     while (candidateNumber === numberToAvoid) {
       candidateNumber = singleDigit();
     }

     return candidateNumber;
  };

  var lessThan = function (number) {
     return Math.floor(Math.random() * number);
  };

  var betweenButAvoiding = function (first, second, numberToAvoid) {
     var candidateNumber;

     candidateNumber = between(first, second);

     while (candidateNumber === numberToAvoid) {
      candidateNumber = between(first, second);
     }

     return candidateNumber;
  };

  // Explicitly reveal public pointers to the private functions
  // that we want to reveal publicly

   return {
     twoToTwelveAvoiding,
     singleDigitAvoiding,
     lessThan,
     between,
     betweenButAvoiding
   };

}());

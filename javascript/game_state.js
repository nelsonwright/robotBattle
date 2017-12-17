var gameState = {
   battleInProgress: false,      // to indicate if we're battling a robot
   timeForSums: 10,              // how many seconds you have to complete a sum
   timerId: null,                // ID for when we want to pause for a bit
   timerInterval: 100,           // how often the timer will draw itself, in millis
   goodRobotMaxEnergy: 8,        // how many energy cells the good robot starts with
   badRobotMaxEnergy: 8,         // how many energy cells the bad robot starts with
   pauseBetweenQuestions: 2.5,   // time in seconds between questions
   lightRippleFrequency: 2,      // how many times a second to ripple the robot body lights
   lightRippleIntervalId: null,  // ID for light rippling, as above
   explosionSpeed: 100,          // time in millis between robot explosion frames
   optionsSpeed: 300             // time in millis to show/hide the options screen
};

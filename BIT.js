/* 
   BIT-GPT 1.1 by Chris B.
   this file contains the UI and animation logic
   Hi Matt! 
*/

var obj1, obj2, obj3, obj4;
var yesSound, noSound;

// movement
var targetX, targetY;
var currentX, currentY;
var lastMoveTime = 0;
const moveDelay = 2000;
const moveDuration = 30000;
var easingStartTime = 0;

const animationQueue = [];
var scaling = false;
var scaleCoeff = 1;
var scaleStartTime = 0;
const minScale = 0.2;


var deviceType = 0; //0 for desktop 1 for mobile
var deviceTypeScale = 1; //amount to scale BIT by for different displays

//dynamic timing options
var scalingDownDuration = 350;
var delayDuration = 80;
var scalingUpDuration = 350;
var totalScalingDuration =
  scalingDownDuration + delayDuration + scalingUpDuration; //pre-calculate for default state

// YES
var scaleCoeffObj3 = 0.1;
var scalingObj3 = false;
const minScaleObj3 = 0.1;
const maxScaleObj3 = 1;

// NO
var scaleCoeffObj4 = 0.1;
var scalingObj4 = false;
const minScaleObj4 = 0.1;
const maxScaleObj4 = 1;

// UI
var lastClickTime = 0;
const baseCooldownPeriod = 500;

// p5.js built in 'preload' Function
// Loads models and sounds before setup or loop

function preload() {
  obj1 = loadModel("data/bit_1.obj");
  obj2 = loadModel("data/bit_2.obj");
  obj3 = loadModel("data/bit_yes.obj");
  obj4 = loadModel("data/bit_no.obj");
  yesSound = loadSound("data/yes.mp3"); //built in p5.js function
  noSound = loadSound("data/no.mp3");
}

function setup() {
    if (isMobile.any) {
    deviceType = 1;
    deviceTypeScale = 0.5;
  } else {
    deviceType = 0;
    deviceTypeScale = 1;
  }
  createCanvas(windowWidth - 50, windowHeight - 50, WEBGL);
  background(0);

  currentX = 0; // Initialize position
  currentY = 0;
  pickNewTarget(); //movement
  easingStartTime = millis();

  initializeUI();
}

function draw() {
  
  background(0); //BIT was rendered using basic shading techniques
  noStroke();
  lights();

  updatePosition();
  handleScaling();
  renderScene();
  processAnimationQueue();
}

function pickNewTarget() {
 // restricts movement to less than 1/3 of screen width and height from the center
  targetX = random(-width/3, width/3);
  targetY = random(-height/3, height/3);
}

function updatePosition() {
  const timeElapsed = millis() - lastMoveTime;
  if (timeElapsed > moveDelay) {
    pickNewTarget();
    lastMoveTime = millis();
    easingStartTime = millis();
  }

  var t = (millis() - easingStartTime) / moveDuration;
  t = constrain(t, 0, 1); // Ensure t stays within bounds
  t = easeOutExpo(t); // Apply ramping
  currentX = lerp(currentX, targetX, t);
  currentY = lerp(currentY, targetY, t);
}

function handleScaling() {
  if (scaling) {
    const elapsedTime = millis() - scaleStartTime;
    if (elapsedTime < scalingDownDuration) {
      // Scaling down phase
      const s = elapsedTime / scalingDownDuration;
      const easingValue = easeInOutQuad(s);
      scaleCoeff = lerp(1, minScale, easingValue);

      // Update scaling for YES and NO objects
      updateObjectScales(easingValue);
    } else if (elapsedTime < scalingDownDuration + delayDuration) {
      // Delay phase at minimum scale
      scaleCoeff = minScale;
      scaleCoeffObj3 = scalingObj3 ? maxScaleObj3 : minScaleObj3;
      scaleCoeffObj4 = scalingObj4 ? maxScaleObj4 : minScaleObj4;
    } else if (elapsedTime < totalScalingDuration) {
      // Scaling up phase
      const s =
        (elapsedTime - scalingDownDuration - delayDuration) / scalingUpDuration;
      const easingValue = easeInOutQuad(s);
      scaleCoeff = lerp(minScale, 1, easingValue);

      // Reverse scaling for YES and NO objects
      reverseObjectScales(easingValue);
    } else {
      // End of scaling animation
      scaling = false;
      scaleCoeff = 1;
      scaleCoeffObj3 = minScaleObj3;
      scaleCoeffObj4 = minScaleObj4;
    }
  } else {
    // Default scaling when not animating
    scaleCoeff = 1;
    scaleCoeffObj3 = minScaleObj3;
    scaleCoeffObj4 = minScaleObj4;
  }
}

function updateObjectScales(easingValue) {
  if (scalingObj3) {
    scaleCoeffObj3 = lerp(minScaleObj3, maxScaleObj3, easingValue);
  } else {
    scaleCoeffObj3 = minScaleObj3;
  }

  if (scalingObj4) {
    scaleCoeffObj4 = lerp(minScaleObj4, maxScaleObj4, easingValue);
  } else {
    scaleCoeffObj4 = minScaleObj4;
  }
}

function reverseObjectScales(easingValue) {
  if (scalingObj3) {
    scaleCoeffObj3 = lerp(maxScaleObj3, minScaleObj3, easingValue);
  } else {
    scaleCoeffObj3 = minScaleObj3;
  }

  if (scalingObj4) {
    scaleCoeffObj4 = lerp(maxScaleObj4, minScaleObj4, easingValue);
  } else {
    scaleCoeffObj4 = minScaleObj4;
  }
}

function renderScene() {
  // main objects
  renderObject(obj1, 140, 230, 250, 0.006, scaleCoeff*deviceTypeScale);
  renderObject(obj2, 140, 230, 250, 0.004 + PI, scaleCoeff*deviceTypeScale);

  // YES and NO objects
  renderObject(obj3, 254, 175, 75, 0.001, scaleCoeffObj3*deviceTypeScale);
  renderObject(obj4, 255, 100, 40, 0.002, scaleCoeffObj4*deviceTypeScale);
}

// Offset is for dynamic scaling.

function renderObject(obj, r, g, b, offset, scaleValue) {
  push();
  translate(currentX, currentY, 0);
  rotateY(0.5 - sin(millis() * 0.0015));
  rotateZ(0.5 - cos(millis() * 0.0022));
  ambientMaterial(r, g, b); // Set object material color
  const dynamicScale = (1 + sin(millis() * 0.006 + offset) * 0.1) * 4;
  scale(dynamicScale * scaleValue); // Scale object
  model(obj);
  pop();
}

// Ease out exponential function
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - pow(2, -10 * t);
}

// Ease in-out quadratic function
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Enqueue an animation type ('YES' or 'NO')
function enqueueAnimation(type) {
  animationQueue.push(type);
}

// Process the next animation in the queue
function processAnimationQueue() {
  if (!scaling && animationQueue.length > 0) {
    const nextAnimation = animationQueue.shift();
    if (nextAnimation === "YES") {
      startYesAnimation();
    } else if (nextAnimation === "NO") {
      startNoAnimation();
    }
  }
}



// Start 'YES' animation
function startYesAnimation() {
//  console.log("Starting YES animation");
  scaling = true;
  scalingObj3 = true; // Enable YES object scaling
  scalingObj4 = false; // Disable NO object scaling
  scaleStartTime = millis();
  yesSound.play(); //actual part that plays the sounds
}

// Start 'NO' animation
function startNoAnimation() {
//  console.log("Starting NO animation");
  scaling = true;
  scalingObj3 = false; // Disable YES object scaling
  scalingObj4 = true; // Enable NO object scaling
  scaleStartTime = millis();
  noSound.play();
}

function mousePressed() {
  if (
    mouseX >= 0 &&
    mouseX <= width &&
    mouseY >= 70 &&
    mouseY <= height
  ) {
    const currentTime = millis();
    if (currentTime - lastClickTime >= baseCooldownPeriod) {
      lastClickTime = currentTime;
      const randomChoice = random([true, false]);
      if (randomChoice) {
        onYes();
      } else {
        onNo();
      }
    } else {
   //   console.log("cooldown active");
    }
  }
}

// handler for 'YES'
function onYes() {
  animationQueue.push("YES");
}

// handler for 'NO'
function onNo() {
  animationQueue.push("NO");
}

function clearInputBox() {
  gptInput.value=('');
}




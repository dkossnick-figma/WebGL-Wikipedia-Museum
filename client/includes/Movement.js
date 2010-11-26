/**
 * Global scope (yuck!) functions and variables for moving the camera around
 * the scene and handling the animation.
 */

var currentlyPressedKeys = Object();

var pitch = 0;
var pitchRate = 0;

var yaw = 0;
var yawRate = 0;

var xPos = 0;
var yPos = 0.4;
var zPos = 0;

var speed = 0;

var lastTime = 0;
var piOver180 = Math.PI / 180;
var joggingAngle = 0;


function handleKeyDown(event) {
  currentlyPressedKeys[event.keyCode] = true;
}


function handleKeyUp(event) {
  currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
  if (currentlyPressedKeys[33]) {
    // Page Up
    pitchRate = 0.1;
  } else if (currentlyPressedKeys[34]) {
    // Page Down
    pitchRate = -0.1;
  } else {
    pitchRate = 0;
  }

  if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
    // Left cursor key or A
    yawRate = 0.1;
  } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
    // Right cursor key or D
    yawRate = -0.1;
  } else {
    yawRate = 0;
  }

  if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
    // Up cursor key or W
    speed = 0.003;
  } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
    // Down cursor key
    speed = -0.003;
  } else {
    speed = 0;
  }
}

function animate() {
  var timeNow = new Date().getTime();
  var newZPos = zPos;
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;

    // Check for collision. If too close to an object, do not update position, yaw, pitch, etc.
    //if (vertexPositions != null)
      //  console.log(vertexPositions);

    if (speed != 0) {
      xPos = xPos - Math.sin(yaw * piOver180) * speed * elapsed;
      newZPos = zPos - Math.cos(yaw * piOver180) * speed * elapsed;

      joggingAngle += elapsed * 0.6;  // 0.6 "fiddle factor" - makes it feel more realistic :-)
      yPos = Math.sin(joggingAngle * piOver180) / 20 + 0.4
    }
    // only update if zPos is
    if ((zPos >= 1.5 && newZPos < zPos) || zPos < 1.5) {
        //console.log("collision: " + xPos + " " + yPos + " " + zPos);
        zPos = newZPos;
    }

    yaw += yawRate * elapsed;
    pitch += pitchRate * elapsed;

  }
  lastTime = timeNow;
}

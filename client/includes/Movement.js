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
var zPos = 1.0;

var speed = 0;

var lastTime = 0;
var piOver180 = Math.PI / 180;
var joggingAngle = 0;

var angle = 0;

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
  document.getElementById("debug").innerHTML = "X=" + xPos + ", Y=" + yPos + ", Z=" + zPos;
  var timeNow = new Date().getTime();
  var newZPos = zPos, oldZPos = zPos;
  var newXPos = xPos, oldXPos = xPos;
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;
    
    // update moving lights
    document.getElementById("directionX1").value = Math.max(Math.min(Math.cos(angle * piOver180),1.0),-1.0);
    document.getElementById("directionZ1").value = Math.max(Math.min(Math.sin(angle * piOver180),1.0),-1.0);

    document.getElementById("directionX2").value = Math.max(Math.min(Math.cos(angle *2 * piOver180),1.0),-1.0);
    document.getElementById("directionY2").value = Math.max(Math.min(Math.sin(angle *2 * piOver180),1.0),-1.0);
    document.getElementById("directionZ2").value = Math.max(Math.min(Math.cos(angle *2 * piOver180),1.0),-1.0);
    document.getElementById("lightPositionX2").value = Math.max(Math.min(Math.cos(angle *2 * piOver180),1.0),-1.0);
    document.getElementById("lightPositionY2").value = Math.max(Math.min(Math.sin(angle *2* piOver180),1.0),-1.0);
    document.getElementById("lightPositionZ2").value = Math.max(Math.min(Math.cos(angle *2* piOver180),1.0),-1.0);
    angle = (angle % 360) + 1;
    document.getElementById('debug2').innerHTML = 'angle = ' + angle;
    
    if (speed != 0) {
      newXPos = xPos - Math.sin(yaw * piOver180) * speed * elapsed;
      newZPos = zPos - Math.cos(yaw * piOver180) * speed * elapsed;

      collided = true;
      
      // collision detection with potential future coords in x-z plane
      if ((inrange(newXPos, -2, 2) && inrange(newZPos, -2, 2))
          || (inrange(newXPos, -0.5, 0.5) && inrange(newZPos, -4, 4))
          || (inrange(newXPos, -4, 4) && inrange(newZPos, -0.5, 0.5))
          || (inrange(newXPos, -3.85, 0.5) && inrange(newZPos, -4, -3))
          || (inrange(newXPos, -0.5, 3.85) && inrange(newZPos, 3, 4))
          || (inrange(newXPos, -4, -3) && inrange(newZPos, -0.5, 3.85))
          || (inrange(newXPos, 3, 4) && inrange(newZPos, -3.85, 0.5))) {
        collided = false;
      }
      
      // collision detection with teapot + stand
      if (Math.abs(newXPos) <= 0.25 && Math.abs(newZPos) <= 0.25) {
        collided = true;
      }

      if (!collided) {
        xPos = newXPos;
        zPos = newZPos;
      }

      joggingAngle += elapsed * 0.6;  // 0.6 "fiddle factor" - makes it feel more realistic :-)
      yPos = Math.sin(joggingAngle * piOver180) / 20 + 0.4;
  
      // tunnel teleport!!!
      var buff = 0.1; // prevent users from being stuck at +/-[1.95, 2.0]

      // teleport between (1) top/bottom and (2) left/right tunnels
      // checks if in zone, and if traveling out of room. (if incoming, won't tp)
      if (Math.abs(zPos) >= 3.0 && Math.abs(zPos) <= 4.0
          && Math.abs(xPos) >= 1.9 && Math.abs(xPos) <= 2.4) {

        if (zPos < 0) {
          zPos = 3 + (zPos + 4);
        } else {
          zPos = -3 - (4 - zPos);
        }
        if (xPos < 0) {
          xPos = 0.5 + (2.5 + xPos);
        } else {
          xPos = -0.5 - (2.5 - xPos);
        }
        
        // going south
        if (oldXPos < xPos) {
          //console.log("going north!");
          WAGinstance.onTeleport(WAGConsts.NORTH);
        } else {
          //console.log("going south!");
          WAGinstance.onTeleport(WAGConsts.SOUTH);
        }

      } else if (Math.abs(zPos) >= 1.9 && Math.abs(zPos) <= 2.4
                 && Math.abs(xPos) >= 3.0 && Math.abs(xPos) <= 4.0) {
        if (xPos < 0) {
          xPos = 3 + (xPos + 4);
        } else {
          xPos = -3 - (4 - xPos);
        }
        if (zPos < 0) {
          zPos = 0.5 + (2.5 + zPos);
        } else {
          zPos = -0.5 - (2.5 - zPos);
        }

        if (oldZPos < zPos) {
          WAGinstance.onTeleport(WAGConsts.WEST);
        } else {
          WAGinstance.onTeleport(WAGConsts.EAST);
        }
      }
    }

    yaw += yawRate * elapsed;
    pitch += pitchRate * elapsed;

  }
  lastTime = timeNow;
}

function inrange(pos, min, max) {
  var buff = 0.15;
  if (pos > (min + buff) && pos < (max - buff)) {
    return true;
  }
  return false;
}

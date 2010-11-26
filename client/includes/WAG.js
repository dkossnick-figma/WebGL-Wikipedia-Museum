function WAG(canvas) {
  this.canvas = document.getElementById(canvas);

  this.initialize = function() {
    try {
      gl = this.canvas.getContext("experimental-webgl");
      gl.viewportWidth = this.canvas.width;
      gl.viewportHeight = this.canvas.height;
    } catch(e) {
    }
    if (!gl) {
      alert("Could not initialise WebGL, sorry :-(");
    }

    initShaders(function() {
      initTexture();

      // init the cube variables here
    	initBuffers();

      this.loadWorld();

      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      gl.clearDepth(1.0);

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL)

      gl.enable(gl.CULL_FACE);

      //gl.enable(gl.LIGHTING);

      document.onkeydown = handleKeyDown;
      document.onkeyup = handleKeyUp;

      setInterval(tick, 15);
    }.bind(this));
  }

  this.loadWorld = function() {
    $.ajax({
      url: "world.txt",
      dataType: "text",
      success: function(data) {
        handleLoadedWorld(Room.walls, data);
      }
    });

    $.ajax({
      url: "floor.txt",
      dataType: "text",
      success: function(data) {
        handleLoadedWorld(Room.floor, data);
      }
    });
  }
}

$(document).ready(function() {
  WAGinstance = new WAG("wagCanvas");
  WAGinstance.initialize();
});

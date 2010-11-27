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

    this.initShaders(function() {
      // Initializes the architecture and textures of the room
      room.initialize();

      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      gl.clearDepth(1.0);

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL)

      gl.enable(gl.CULL_FACE);

      //gl.enable(gl.LIGHTING);

      document.onkeydown = handleKeyDown;
      document.onkeyup = handleKeyUp;

      setInterval(function() {
        handleKeys();
        drawScene();
        animate();
      }, 33);
    }.bind(this));
  }

  this.initShaders = function(cb) {
    createProgram("perFragment", function(prog) {
      perFragmentProgram = prog;
      createProgram("spotlight", function(prog) {
        spotlightProgram = prog;
        createProgram("perVertex", function(prog) {
          perVertexProgram = prog;
          cb();
        });
      });
    });
  }

}

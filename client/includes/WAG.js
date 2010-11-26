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
      this.initTexture();

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

  this.initTexture = function() {
    // Load wall texture
    Room.walls.texture = gl.createTexture();
    Room.walls.texture.image = new Image();
    Room.walls.texture.image.onload = function() {
      handleLoadedTexture(Room.walls.texture)
    }

    Room.walls.texture.image.src = "mud.gif";

    // Load floor texture
    Room.floor.texture = gl.createTexture();
    Room.floor.texture.image = new Image();
    Room.floor.texture.image.onload = function() {
      handleLoadedTexture(Room.floor.texture)
    }

    Room.floor.texture.image.src = "stone.jpg";

    // Load TEMP texture
    Room.TEMPtexture = gl.createTexture();
    Room.TEMPtexture.image = new Image();
    Room.TEMPtexture.image.onload = function() {
      handleLoadedTexture(Room.TEMPtexture)
    }

    Room.TEMPtexture.image.src = "stone.jpg";
  }

}

$(document).ready(function() {
  WAGinstance = new WAG("wagCanvas");
  WAGinstance.initialize();
});

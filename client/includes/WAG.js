// WAG = "Wikipedia Art Gallery" :)
function WAG(canvas) {
  this.canvas = document.getElementById(canvas);

  this.perFragmentProgram = null;
  this.spotlightProgram = null;

  this.programs = {
    perFragment: {
      fragment: "includes/lighting-fs.frag",
      vertex:   "includes/lighting-vs.vert"
    },
    spotlight: {
      fragment: "includes/spotlight-fs.frag",
      vertex:   "includes/spotlight-vs.vert"
    }
  };

  this.map = {};
  this.currentRoom = null;
  this.prevPointer = {
    key: null,
    dir: null
  };

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

      $('#categoryChanger').submit(this.changeCategory);

      setInterval(function() {
        handleKeys();
        drawScene();
        animate();
      }, 33);
    }.bind(this));
  }

  this.initShaders = function(cb) {
    // No need for per-fragment shader to wait for the other shaders
    createProgram("perFragment", function(prog) {
      this.perFragmentProgram = prog;
      cb();
    }.bind(this));
    createProgram("spotlight", function(prog) {
      this.spotlightProgram = prog;
    }.bind(this));
  }

  /**
   * Callback called by /category/:cat
   */
  this.handleCategoryImages = function(data) {
    if (data.resultCode != 0) {
      alert("Error in retrieving category: " + data.resultCode);
    } else {
      $('#loadingtext').fadeIn("medium");
      // substring below removes the "category:" at the start of the str
      $('#s').val(data.category.replace(/_/gi, " "));
      $('#loadingtext').text(data.category.substring(9).replace(/_/gi, " "));
      $('#loadingtext').fadeOut(3000);
    
      // Add the new room to the map
      var oldContinueKey = "";
      if (data.oldContinueKey) {
        oldContinueKey = data.oldContinueKey;
      }
      this.currentRoom = data.category + "|" + oldContinueKey;
      if (!this.map[this.currentRoom]) {
        this.map[this.currentRoom] = {
          N: null,
          E: null,
          S: null,
          W: null
        };
      }
      // Set the pointer at the old room
      if (this.prevPointer.key) {
        this.map[this.prevPointer.key][this.prevPointer.dir] = this.currentRoom;
        
        // add history to current room
        var oppositeDir;        
        switch (this.prevPointer.dir) {
          case WAGConsts.NORTH: oppositeDir = WAGConsts.SOUTH; break;
          case WAGConsts.SOUTH: oppositeDir = WAGConsts.NORTH; break;
          case WAGConsts.EAST:  oppositeDir = WAGConsts.WEST;  break;
          case WAGConsts.WEST:  oppositeDir = WAGConsts.EAST;  break;
        }
        
        // TODO: this is working only on client side
        this.map[this.currentRoom][oppositeDir] = this.prevPointer.key;
      }

      room.clearPaintings();
      for (var i in data.data) {
        var preload = new Image();
        preload.onload = function() {
          room.addPainting({
            img: this.src,
            width: this.width,
            height: this.height
          });
        };
        preload.src = data.data[i].thumb_url;
      }
    }
  }

  /**
   * Fakes an Ajax request to the node. segment should already be
   * appropriately urlencoded.
   */
  this._fakeAjax = function(segment) {
    // Since the node is on a different domain, we can't use Ajax.
    $('head').append('<script type="text/javascript" '+
      'src="http://node.art.kimbei.com/' + segment +
      '"></script>');
  }

  this.changeCategory = function() {
    var category = $('#s').val();

    this.onTeleport(WAGConsts.NORTH, category.replace(/ /g, "_"));
    /*$('#loadingtext').show();

    // Since the node is on a different domain, we can't use Ajax.
    this._fakeAjax('category/' + encodeURI(category));*/

    return false;
  }

  /**
   * Calls the initial fetch from the node.
   */
  this.startFetch = function() {
    this._fakeAjax('start');
  }

  this.onTeleport = function(direction, category) {
    this.prevPointer.key = this.currentRoom;
    this.prevPointer.dir = direction;

    $('#loadingtext').text("Loading...");
    $('#loadingtext').fadeIn("medium");

    if (category != "") {
      this._fakeAjax('category/' + encodeURI(category));    
    } else if (this.map[this.currentRoom][direction]) {
      var goTo = this.map[this.currentRoom][direction].split("|");
      this._fakeAjax('category/' + goTo[0] + "/" + goTo[1]);
    } else {
      this._fakeAjax('more');
    }
  }

}

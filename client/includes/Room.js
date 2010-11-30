/**
 * Represents a room in the scene and each of its components.
 */

function Room(loadCompleteCallback) {
  this.onLoadComplete = loadCompleteCallback;

  this.walls = {
    type: "generator",
    generate: function() {
      var gen = new WorldGenerator();
      return gen.generateWorld();
    },
    textureMap: "textures/wallpaper.jpg"
  };
  this.floor = {
    type: "generator",
    generate: function() {
      return [[-4,0,-4,0,16],[-4,0,4,0,0],[4,0,4,10.18,0],
              [-4,0,-4,0,16],[4,0,-4,10.18,16],[4,0,4,10.18,0]];
    },
    textureMap: "textures/plank.jpg"
  };
  this.ceiling = {
    type: "generator",
    generate: function() {
      return [[-4,1,-4,0,8],[-4,1,4,0,0],[4,1,4,8,0],
              [-4,1,-4,0,8],[4,1,-4,8,8],[4,1,4,8,0]];
    },
    textureMap: "textures/wallpaper.jpg"
  };
  this.teapot = {
    type: "object",
    generate: TeapotGenerator,
    textureMap: "textures/teapot.jpg"
  };

  this.paintingImages = [];
  this.paintingCoords = [
    { origin: [  1.25, 0.55, -2.0  ], dir: "n" },
    { origin: [ -1.25, 0.55, -2.0  ], dir: "n" },
    { origin: [  1.25, 0.55,  2.0  ], dir: "s" },
    { origin: [ -1.25, 0.55,  2.0  ], dir: "s" },
    { origin: [ -2.0,  0.55, -1.25 ], dir: "w" },
    { origin: [ -2.0,  0.55,  1.25 ], dir: "w" },
    { origin: [  2.0,  0.55, -1.25 ], dir: "e" },
    { origin: [  2.0,  0.55,  1.25 ], dir: "e" }
  ];

  // TODO: Why does the wall have to be last for it to render?
  this.components = ["ceiling", "floor", "walls", "teapot"];
  this.loadedComponents = 0;
  this.hasCompletedLoading = false;

  this._initTexture = function(component_name) {
    var component = this[component_name];
    component.positionBuffer = null;
    component.textureCoordBuffer = null;
    component.normalBuffer = null;
    component.texture = gl.createTexture();
    component.texture.image = new Image();
    component.texture.image.onload = function() {
      this._handleLoadedTexture(component);
    }.bind(this);
    component.texture.image.src = component.textureMap;
  }

  this._loadWorld = function(component_name) {
    var component = this[component_name];
    if (component.type == "painting") {
      this._handleLoadedWorld(component, this._generatePainting(component));
      return;
    } else if (component.type == "generator") {
      this._handleLoadedWorld(component, component.generate());
      return;
    } else if (component.type == "object") {
      this._handleLoadedObject(component, component.generate());
      return;
    }

    $.ajax({
      url: component.world,
      dataType: "text",
      success: function(data) {
        this._handleLoadedWorld(component, data);
      }.bind(this)
    });
  }

  this._generatePainting = function(component/*, origin, direction*/) {
    var maxWidth = 0.9, maxHeight = 0.5;
    var l = 0.04;    // thickness of painting
    var w = maxWidth;
    var h = component.height * (maxWidth / component.width);

    if (h > maxHeight) {
      h = maxHeight;
      w = component.width * (maxHeight / component.height);
    }

    // painting goes "inward", not outward for south/east wall
    if (component.direction == "s" || component.direction == "e") {
      l = -l;
    }

    var x = component.origin[0], y = component.origin[1], z = component.origin[2];

    var v = [], r = [];

    /*********
      7 ------ 6
     / |      / |
    0 -|---- 1  | (origin in middle of 4-5-6-7 for n/s
    |  |     |  |                  and 1-6-5-2 for e/w)
    |  4 ----|- 5
    | /      | /
    3 ------ 2
    *************/

    // x-z coords switched for side walls
    if (component.direction == "e" || component.direction == "w") {
      var temp = x;
      x = z;
      z = temp;
    }

    // calculate critical points
    v[0] = [ x - (w / 2.0), y + (h / 2.0), z + l ];
    v[1] = [ x + (w / 2.0), y + (h / 2.0), z + l ];
    v[2] = [ x + (w / 2.0), y - (h / 2.0), z + l ];
    v[3] = [ x - (w / 2.0), y - (h / 2.0), z + l ];
    v[4] = [ x - (w / 2.0), y - (h / 2.0), z ];
    v[5] = [ x + (w / 2.0), y - (h / 2.0), z ];
    v[6] = [ x + (w / 2.0), y + (h / 2.0), z ];
    v[7] = [ x - (w / 2.0), y + (h / 2.0), z ];

    r[0] = [ 0.0, 1.0 ];
    r[1] = [ 0.0, 0.0 ];
    r[2] = [ 1.0, 0.0 ];
    r[3] = [ 1.0, 1.0 ];

    if (component.direction == "s" || component.direction == "w") {
      r.reverse();
    }

    // switch x/z coords for side walls
    if (component.direction == "e" || component.direction == "w") {
      for (var i in v) {
        var temp = v[i][0];
        v[i][0] = v[i][2];
        v[i][2] = temp;
      }
    }

    // calculate triangles now!
    var vertices = [];
    var textures = [];

    // front face
    vertices.push(v[0]);  textures.push(r[0]);
    vertices.push(v[3]);  textures.push(r[1]);
    vertices.push(v[2]);  textures.push(r[2]);
    vertices.push(v[0]);  textures.push(r[0]);
    vertices.push(v[1]);  textures.push(r[3]);
    vertices.push(v[2]);  textures.push(r[2]);

    // right face
    vertices.push(v[1]);  textures.push(r[1]);
    vertices.push(v[2]);  textures.push(r[1]);
    vertices.push(v[5]);  textures.push(r[1]);
    vertices.push(v[1]);  textures.push(r[1]);
    vertices.push(v[6]);  textures.push(r[1]);
    vertices.push(v[5]);  textures.push(r[1]);

    // left face
    vertices.push(v[0]);  textures.push(r[1]);
    vertices.push(v[3]);  textures.push(r[1]);
    vertices.push(v[4]);  textures.push(r[1]);
    vertices.push(v[0]);  textures.push(r[1]);
    vertices.push(v[7]);  textures.push(r[1]);
    vertices.push(v[4]);  textures.push(r[1]);

    // top face
    vertices.push(v[0]);  textures.push(r[1]);
    vertices.push(v[1]);  textures.push(r[1]);
    vertices.push(v[6]);  textures.push(r[1]);
    vertices.push(v[0]);  textures.push(r[1]);
    vertices.push(v[7]);  textures.push(r[1]);
    vertices.push(v[6]);  textures.push(r[1]);

    // bottom face
    vertices.push(v[4]);  textures.push(r[1]);
    vertices.push(v[3]);  textures.push(r[1]);
    vertices.push(v[2]);  textures.push(r[1]);
    vertices.push(v[4]);  textures.push(r[1]);
    vertices.push(v[5]);  textures.push(r[1]);
    vertices.push(v[2]);  textures.push(r[1]);

    var lines = [];

    for (var i = 0; i < vertices.length; i++) {
      lines.push(vertices[i].concat(textures[i]));
    }

    return lines;
  }

  this._handleLoadedTexture = function(component) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, component.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
      component.texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);

    if (component.type == "painting") {
      component.state++;
    } else {
      this._hasLoadedCheck();
    }
  }

  this._handleLoadedObject = function(component, data) {
    component.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, component.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexNormals), gl.STATIC_DRAW);
    component.normalBuffer.itemSize = 3;
    component.normalBuffer.numItems = data.vertexNormals.length / 3;

    component.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, component.textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexTextureCoords), gl.STATIC_DRAW);
    component.textureCoordBuffer.itemSize = 2;
    component.textureCoordBuffer.numItems = data.vertexTextureCoords.length / 2;

    component.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, component.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexPositions), gl.STATIC_DRAW);
    component.positionBuffer.itemSize = 3;
    component.positionBuffer.numItems = data.vertexPositions.length / 3;

    component.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, component.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), gl.STREAM_DRAW);
    component.indexBuffer.itemSize = 1;
    component.indexBuffer.numItems = data.indices.length;

    this._hasLoadedCheck();
  }

  /*
   * Destroys a component given a reference to the component.
   * NOTE: Does not clean up this.allComponents, or the component itself.
   */
  this._destroyComponent = function(component) {
    gl.deleteBuffer(component.normalBuffer);
    gl.deleteBuffer(component.textureCoordBuffer);
    gl.deleteBuffer(component.positionBuffer);
    if (component.type == "object") {
      gl.deleteBuffer(component.indexBuffer);
    }
    gl.deleteTexture(component.texture);
  }

  this._handleLoadedWorld = function(component, data) {
    var lines;
    if (typeof data == "string") {
      lines = data.split("\n");
    } else {
      lines = data;
    }

    var vertexCount = 0;
    var vertexPositions = [];
    var vertexTextureCoords = [];
    var vertexNormals = [];
    var currentTriangle = []
    function addTriangleToLists(triangle, normal, flip) {
      if (flip) {
        triangle = [triangle[0], triangle[2], triangle[1]];
      } else {
        normal = normal.x(-1);
      }
      for (var i in triangle) {
        vertex = triangle[i];

        vertexPositions.push(vertex.position.e(1));
        vertexPositions.push(vertex.position.e(2));
        vertexPositions.push(vertex.position.e(3));

        vertexTextureCoords.push(vertex.textureCoords[0]);
        vertexTextureCoords.push(vertex.textureCoords[1]);

        vertexNormals.push(normal.e(1));
        vertexNormals.push(normal.e(2));
        vertexNormals.push(normal.e(3));
      }
    }

    for (var i in lines) {
      var vals;
      if (typeof data == "string") {
        vals = lines[i].replace(/^\s+/, "").split(/\s+/);
      } else {
        vals = lines[i];
      }

      if (vals.length == 5 && vals[0] != "//") {
        // It is a line describing a vertex.  Construct an object to
        // represent it:
        vertex = {
          position : $V([parseFloat(vals[0]), parseFloat(vals[1]), parseFloat(vals[2])]),
          textureCoords : [parseFloat(vals[3]), parseFloat(vals[4])]
        };
        currentTriangle.push(vertex);

        if (currentTriangle.length == 3) {
          var sideVector1 = currentTriangle[1].position.subtract(currentTriangle[0].position);
          var sideVector2 = currentTriangle[0].position.subtract(currentTriangle[2].position);
          var normal = sideVector1.cross(sideVector2).toUnitVector();

          // Add front and back-facing triangles
          addTriangleToLists(currentTriangle, normal, false);
          addTriangleToLists(currentTriangle, normal, true);

          currentTriangle = [];
          vertexCount += 6;
        }
      }
    }

    component.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, component.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
    component.positionBuffer.itemSize = 3;
    component.positionBuffer.numItems = vertexCount;

    component.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, component.textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
    component.textureCoordBuffer.itemSize = 2;
    component.textureCoordBuffer.numItems = vertexCount;

    component.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, component.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    component.normalBuffer.itemSize = 3;
    component.normalBuffer.numItems = vertexCount;

    if (component.type == "painting") {
      component.state++;
    } else {
      this._hasLoadedCheck();
    }
  }

  this._hasLoadedCheck = function() {
    this.loadedComponents++;
    // Check that both world and textures have loaded for all components
    if (this.loadedComponents == this.components.length * 2) {
      // All components loaded
      this.hasCompletedLoading = true;
      this.onLoadComplete();
    }
  }

  this.renderComponents = function() {
    if (!this.hasCompletedLoading) {
      return;
    }

    for (var i in this.allComponents) {
      var component_name = this.allComponents[i];
      var component = this[component_name];

      // If this is a painting and it is not yet compeletely loaded, ignore.
      if (component.type == "painting" && component.state < 2) {
        continue;
      }

      mvPushMatrix();

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, component.texture);
      gl.uniform1i(currentProgram.samplerUniform, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, component.textureCoordBuffer);
      gl.vertexAttribPointer(currentProgram.textureCoordAttribute,
        component.textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, component.normalBuffer);
      gl.vertexAttribPointer(currentProgram.vertexNormalAttribute,
        component.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, component.positionBuffer);
      gl.vertexAttribPointer(currentProgram.vertexPositionAttribute,
        component.positionBuffer.itemSize, gl.FLOAT, false, 0, 0);

      setMatrixUniforms();

      if (component.type == "object") {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, component.indexBuffer);
        gl.drawElements(gl.TRIANGLES, component.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.drawArrays(gl.TRIANGLES, 0, component.positionBuffer.numItems);
      }

      mvPopMatrix();
    }
  }

  /**
   * Removes any current paintings and frees their memory.
   */
  this.clearPaintings = function() {
    for (var i = 0; i < this.paintingImages.length; i++) {
      this._destroyComponent(this["painting" + i]);
      delete this["painting" + i];
    }
    this.paintingImages = [];
    this.allComponents = this.components.slice();
  }

  this.addPainting = function(painting) {
    // Add new painting and render it
    var i = this.paintingImages.length;
    this.paintingImages.push(painting);
    var objName = "painting" + i;
    var painting = {
      type: "painting",
      textureMap: this.paintingImages[i].img,
      width: this.paintingImages[i].width,
      height: this.paintingImages[i].height,
      origin: this.paintingCoords[i].origin,
      direction: this.paintingCoords[i].dir,
      state: 0
    };
    this[objName] = painting;
    this.allComponents.push(objName);

    // Set off initialization for the painting
    this._initTexture(objName);
    this._loadWorld(objName);
  }

  this.initialize = function() {
    this.allComponents = this.components.slice();
    // For each component, load the world and the texture
    for (var i in this.components) {
      var component_name = this.components[i];
      this._initTexture(component_name);
      this._loadWorld(component_name);
    }
  }

};

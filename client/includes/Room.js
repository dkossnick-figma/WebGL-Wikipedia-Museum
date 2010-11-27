/**
 * Represents a room in the scene and each of its components.
 */

function Room(loadCompleteCallback) {
  this.onLoadComplete = loadCompleteCallback;

  this.walls = {
    world: "world.txt",
    textureMap: "01.jpg"
  };
  this.floor = {
    world: "floor.txt",
    textureMap: "stone.jpg"
  };
  this.ceiling = {
    world: "ceiling.txt",
    textureMap: "stone.jpg"
  };
  this.painting = {
    world: "painting.txt",
    textureMap: "mona-lisa-painting.jpg"
  };

  this.components = ["walls", "floor", "ceiling", "painting"];
  this.loadedComponents = 0;

  this._initTexture = function(component_name) {
    var component = this[component_name];
    component.positionBuffer = null;
    component.textureCoordBuffer = null;
    component.normalBuffer = null;
    component.texture = gl.createTexture();
    component.texture.image = new Image();
    component.texture.image.onload = function() {
      handleLoadedTexture(component.texture)
    }
    component.texture.image.src = component.textureMap;
  }

  this._loadWorld = function(component_name) {
    var component = this[component_name];
    $.ajax({
      url: component.world,
      dataType: "text",
      success: function(data) {
        this._handleLoadedWorld(component, data);
      }.bind(this)
    });
  }

  this._handleLoadedWorld = function(component, data) {
    var lines = data.split("\n");
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
      var vals = lines[i].replace(/^\s+/, "").split(/\s+/);
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
          // TODO(kozzles): better solution to painting "reflection" error than
          // doing backfacing triangles twice??
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

    this.loadedComponents++;
    if (this.loadedComponents == this.components.length) {
      // All components loaded
      this.onLoadComplete();
    }
  }

  this.renderComponents = function() {
    for (var i in this.components) {
      var component_name = this.components[i];
      var component = this[component_name];

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
      gl.drawArrays(gl.TRIANGLES, 0, component.positionBuffer.numItems);

      mvPopMatrix();
    }
  }

  this.initialize = function() {
    // For each component, load the world and the texture
    for (var i in this.components) {
      var component_name = this.components[i];
      this._initTexture(component_name);
      this._loadWorld(component_name);
    }
  }

};

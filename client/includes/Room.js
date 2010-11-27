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
    textureMap: "Stravinsky_picasso.png",
    width: 430,
    height: 640
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
  
  this._generatePainting = function(component, origin/*, direction*/) {		
		
		var maxWidth = 0.5, maxHeight = 0.5;
		
		var l = 0.05;    // thickness of painting
		var w = maxWidth;
		var h = component.height * (maxWidth / component.width);
		
		if (h > maxHeight) {
			h = maxHeight;
			w = component.width * (maxHeight / component.height);
		}
		
		var x = origin[0], y = origin[1], z = origin[2];

		var v = [], r = [];
		// origin is in middle of 4-5-6-7		
		// below is actually only for far wall
		
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
		
		
		// calculate triangles now!
		/*********
		
			7 ------ 6
		 / |      / |
		0 -|---- 1  |
		|  |     |  |
		|  4 ----|- 5
		| /      | /
		3 ------ 2
		
		*************/		
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
  

  this._handleLoadedWorld = function(component, data) {

  	var lines;
  	
  	if (component.world != "painting.txt") {
    	lines = data.split("\n");  		  	
  	} else {
  		var origin = [ 0.0, 0.55, -3.0 ];
  		lines = this._generatePainting(component, origin); 
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
      if (component.world != "painting.txt") {
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

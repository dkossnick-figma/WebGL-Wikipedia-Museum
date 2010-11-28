/**
 * Represents a room in the scene and each of its components.
 */

function Room(loadCompleteCallback) {
  this.onLoadComplete = loadCompleteCallback;

  this.walls = {
  	type: "room",
    world: "world.txt",
    textureMap: "01.jpg"
  };
  this.floor = {
  	type: "room",
    world: "floor.txt",
    textureMap: "textures/plank.jpg"
  };
  this.ceiling = {
  	type: "room",
    world: "ceiling.txt",
    textureMap: "stone.jpg"
  };

  this.paintingImages = [
  	{ img: "mona-lisa-painting.jpg", width: 380, height: 600 },
  	{ img: "Picasso_Portrait_of_Daniel-Henry_Kahnweiler_1910.jpg", width: 528, height: 720 },
  	{ img: "mona-lisa-painting.jpg", width: 380, height: 600 },
  ];
  this.paintingCoords = [
  	//{ origin: [ 0.0, 0.55, -3.0 ], dir: "n" },
  	{ origin: [ -3.0, 0.55, 0 ], dir: "e" },
  	{ origin: [ -1.5, 0.55, -3.0 ], dir: "n" },
  	{ origin: [ -0.75, 0.55, 3.0], dir: "s" }
  ]; 

  // TODO: Why does the wall have to be last for it to render?
  this.components = ["ceiling", "floor", "walls"];
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
      this._handleLoadedTexture(component.texture);
    }.bind(this);
    component.texture.image.src = component.textureMap;
  }

  this._loadWorld = function(component_name) {
		var component = this[component_name];
    if (component.type == "painting") {
    	this._handleLoadedWorld(component, null);
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
		
		if (component.direction == "s") {
			l = -l;
		}
		
		var x = component.origin[0], y = component.origin[1], z = component.origin[2];

		var v = [], r = [];

		/*********		
			7 ------ 6
		 / |      / |
		0 -|---- 1  | (origin in middle of 4-5-6-7)
		|  |     |  | ASCII art by yby
		|  4 ----|- 5
		| /      | /
		3 ------ 2		
		*************/
		
		
		// N: x by y, depth z
		// E: z by y, depth x
		
		// below is for east wall, middle is 1-6-5-2
		
		if (component.direction == "e" || component.direction == "w") {
			var temp = x;
			x = z;
			z = temp;			
		}

		// below is actually only for north + south wall
		v[0] = [ x - (w / 2.0), y + (h / 2.0), z + l ];
		v[1] = [ x + (w / 2.0), y + (h / 2.0), z + l ];
		v[2] = [ x + (w / 2.0), y - (h / 2.0), z + l ];
		v[3] = [ x - (w / 2.0), y - (h / 2.0), z + l ];
		v[4] = [ x - (w / 2.0), y - (h / 2.0), z ];
		v[5] = [ x + (w / 2.0), y - (h / 2.0), z ];
		v[6] = [ x + (w / 2.0), y + (h / 2.0), z ];
		v[7] = [ x - (w / 2.0), y + (h / 2.0), z ];		
		
		/*r[0] = [ 0.0, 1.0 ];
		r[1] = [ 0.0, 0.0 ];
		r[2] = [ 1.0, 0.0 ];
		r[3] = [ 1.0, 1.0 ];*/

		r[0] = [ 0.0, 1.0 ];
		r[1] = [ 0.0, 0.0 ];
		r[2] = [ 1.0, 0.0 ];
		r[3] = [ 1.0, 1.0 ];
		
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

  this._handleLoadedTexture = function(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);

    this._hasLoadedCheck();
  }

  this._handleLoadedWorld = function(component, data) {
  	var lines;

  	if (data != null) {
    	lines = data.split("\n");
  	} else {
  		lines = this._generatePainting(component);
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
      if (data != null) {
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

    this._hasLoadedCheck();
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
  	// For each painting, add to component
  	for (var i in this.paintingImages) {
  		var painting = {
  			type: "painting",
  			textureMap: this.paintingImages[i].img,
  			width: this.paintingImages[i].width,
  			height: this.paintingImages[i].height,
  			origin: this.paintingCoords[i].origin,
  			direction: this.paintingCoords[i].dir
  		};
  		var objName = "painting" + i;
  		this[objName] = painting;
  		this.components.push(objName);
  	}

    // For each component, load the world and the texture
    for (var i in this.components) {
      var component_name = this.components[i];
      this._initTexture(component_name);
      this._loadWorld(component_name);
    }
  }

};

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
varying vec4 vTransformedNormal;
varying vec4 vPosition;
  
// new
//  varying vec3 eyeVec;
//  varying vec3 lightDir;


/*
varying vec3 normal, lightDir, eyeVec;

void main()
{	
	normal = gl_NormalMatrix * gl_Normal;

	vec3 vVertex = vec3(gl_ModelViewMatrix * gl_Vertex);

	lightDir = vec3(gl_LightSource[0].position.xyz - vVertex);
	eyeVec = -vVertex;

	gl_Position = ftransform();		
}
*/


void main(void) {
  vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
  gl_Position = uPMatrix * vPosition;
  vTextureCoord = aTextureCoord;
  vTransformedNormal = /*uNMatrix */ vec4(aVertexNormal, 1.0);
  // new
  //    lightDir = vec3(lightsource.xyz - vPosition);
  //    eyeVec = -vPosition;
}
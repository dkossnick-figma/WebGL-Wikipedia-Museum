attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec3 uAmbientColor;

uniform vec3 uPointLightingLocation;
uniform vec3 uPointLightingColor;

uniform bool uUseLighting;

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

void main(void) {
  vec4 mvPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
  gl_Position = uPMatrix * mvPosition;
  vTextureCoord = aTextureCoord;

  if (!uUseLighting) {
    vLightWeighting = vec3(1.0, 1.0, 1.0);
  } else {
/*      vec3 lightDirection = normalize(uPointLightingLocation - mvPosition.xyz);


    vec4 transformedNormal = uNMatrix * vec4(aVertexNormal, 1.0);
    float directionalLightWeighting = max(dot(transformedNormal.xyz, lightDirection), 0.0);
    vLightWeighting = uAmbientColor + uPointLightingColor * directionalLightWeighting;
    
    */
    vec3 lightDirection = normalize(uPointLightingLocation - aVertexPosition);
    // light intensity as inverse of distance
    //float lightDistance = sqrt((uPointLightingLocation.x - aVertexPosition.x)**2) +
     //                         (uPointLightingLocation.y - aVertexPosition.y)**2) +
      //                        (uPointLightingLocation.z - aVertexPosition.z)**2));
    //vec3 lightIntensity = max(1.0 / (uPointLightingLocation - aVertexPosition), 0.0);
    //vec3 lightDirection = normalize(uPointLightingLocation - mvPosition.xyz);
    
    vec4 transformedNormal = vec4(aVertexNormal, 1.0); // * uNMatrix
    float directionalLightWeighting = max(dot(transformedNormal.xyz, lightDirection), 0.0);
    //float distanceLightWeighting = ;
    vLightWeighting = uAmbientColor + uPointLightingColor * directionalLightWeighting;// distanceLightWeighting *;
    
  }
}
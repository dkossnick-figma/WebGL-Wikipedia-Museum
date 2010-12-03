// per-fragment

#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec4 vTransformedNormal;
varying vec4 vPosition;

uniform bool uUseLighting;
uniform bool uUseTextures;

uniform vec3 uAmbientColor;

uniform vec3 uPointLightingLocation1;
uniform vec3 uPointLightingLocation2;
uniform vec3 uPointLightingLocation3;
uniform vec3 uPointLightingLocation4;
uniform vec3 uPointLightingColor;

uniform sampler2D uSampler;


void main(void) {
  vec3 lightWeighting;
  if (!uUseLighting) {
    lightWeighting = vec3(1.0, 1.0, 1.0);
  } else {
    vec3 lightDirection1 = normalize(uPointLightingLocation1 - vPosition.xyz);
    vec3 lightDirection2 = normalize(uPointLightingLocation2 - vPosition.xyz);
    vec3 lightDirection3 = normalize(uPointLightingLocation3 - vPosition.xyz);
    vec3 lightDirection4 = normalize(uPointLightingLocation4 - vPosition.xyz);

    float directionalLightWeighting = max(dot(normalize(vTransformedNormal.xyz), lightDirection1), 0.0) +
        max(dot(normalize(vTransformedNormal.xyz), lightDirection2), 0.0) +
        max(dot(normalize(vTransformedNormal.xyz), lightDirection3), 0.0) +
        max(dot(normalize(vTransformedNormal.xyz), lightDirection4), 0.0);
    directionalLightWeighting = directionalLightWeighting / 3.0;
    lightWeighting = uAmbientColor + uPointLightingColor * directionalLightWeighting;
  }

  vec4 fragmentColor;
  if (uUseTextures) {
    fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  } else {
    fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
}
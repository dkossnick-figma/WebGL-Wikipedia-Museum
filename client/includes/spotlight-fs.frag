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

uniform vec3 uPointLightingLocation;
uniform vec3 uPointLightingColor;
uniform vec3 uPointLightingDirection;

uniform sampler2D uSampler;

uniform float uInnerAngle;
uniform float uOuterAngle;

void main(void) {
  vec3 lightWeighting = uAmbientColor;
  if (!uUseLighting) {
    lightWeighting = vec3(1.0, 1.0, 1.0);
  } else {
    vec3 lightDirection = normalize(uPointLightingLocation - vPosition.xyz);
    float directionalLightWeighting = max(dot(normalize(vTransformedNormal.xyz), lightDirection), 0.0);
    float diff = acos(dot(lightDirection, uPointLightingDirection));
    if (diff < uInnerAngle)
        lightWeighting += uPointLightingColor * directionalLightWeighting;
    else if (diff <= uOuterAngle) {
        // scalingFactor - gives a gradient between two circles
        float c = (uOuterAngle - diff) / (uOuterAngle - uInnerAngle);
        lightWeighting += uPointLightingColor * directionalLightWeighting * vec3(c,c,c);
    }
  }

  vec4 fragmentColor;
  if (uUseTextures) {
    fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  } else {
    fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
}
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

uniform vec3 uSpotlightDirection1;
uniform vec3 uSpotlightDirection2;
uniform vec3 uSpotlightDirection3;
uniform vec3 uSpotlightDirection4;

uniform sampler2D uSampler;

uniform float uInnerAngle;
uniform float uOuterAngle;

void main(void) {
  vec3 lightWeighting = uAmbientColor;
  if (!uUseLighting) {
    lightWeighting = vec3(1.0, 1.0, 1.0);
  } else {
    // point lighting
    /*
    vec3 lightDirection1 = normalize(uPointLightingLocation1 - vPosition.xyz);
    vec3 lightDirection2 = normalize(uPointLightingLocation2 - vPosition.xyz);
    vec3 lightDirection3 = normalize(uPointLightingLocation3 - vPosition.xyz);
    vec3 lightDirection4 = normalize(uPointLightingLocation4 - vPosition.xyz);
    float directionalLightWeighting = max(dot(normalize(vTransformedNormal.xyz), lightDirection1), 0.0) +
        max(dot(normalize(vTransformedNormal.xyz), lightDirection2), 0.0) +
        max(dot(normalize(vTransformedNormal.xyz), lightDirection3), 0.0) +
        max(dot(normalize(vTransformedNormal.xyz), lightDirection4), 0.0);
    directionalLightWeighting = directionalLightWeighting / 3.0;
    lightWeighting += uPointLightingColor * directionalLightWeighting;*/
    
    // many spotlights
    vec3 lightDirectionFromPt1 = normalize(uPointLightingLocation1 - vPosition.xyz);
    vec3 lightDirectionFromPt2 = normalize(uPointLightingLocation2 - vPosition.xyz);
    vec3 lightDirectionFromPt3 = normalize(uPointLightingLocation3 - vPosition.xyz);
    vec3 lightDirectionFromPt4 = normalize(uPointLightingLocation4 - vPosition.xyz);
    float spotlightWeighting1 = max(dot(normalize(vTransformedNormal.xyz), lightDirectionFromPt1), 0.0);
    float spotlightWeighting2 = max(dot(normalize(vTransformedNormal.xyz), lightDirectionFromPt2), 0.0);
    float spotlightWeighting3 = max(dot(normalize(vTransformedNormal.xyz), lightDirectionFromPt3), 0.0);
    float spotlightWeighting4 = max(dot(normalize(vTransformedNormal.xyz), lightDirectionFromPt4), 0.0);
    float diff1 = acos(dot(lightDirectionFromPt1, normalize(uSpotlightDirection1)));
    float diff2 = acos(dot(lightDirectionFromPt2, normalize(uSpotlightDirection2)));
    float diff3 = acos(dot(lightDirectionFromPt3, normalize(uSpotlightDirection3)));
    float diff4 = acos(dot(lightDirectionFromPt4, normalize(uSpotlightDirection4)));
    if (diff1 < uInnerAngle) lightWeighting += uPointLightingColor * spotlightWeighting1;
    else if (diff1 <= uOuterAngle) {
        // scalingFactor - gives a gradient between two circles
        float c = (uOuterAngle - diff1) / (uOuterAngle - uInnerAngle);
        lightWeighting += uPointLightingColor * spotlightWeighting1 * vec3(c,c,c);
    }
    if (diff2 < uInnerAngle) lightWeighting += uPointLightingColor * spotlightWeighting2;
    else if (diff2 <= uOuterAngle) {
        // scalingFactor - gives a gradient between two circles
        float c = (uOuterAngle - diff2) / (uOuterAngle - uInnerAngle);
        lightWeighting += uPointLightingColor * spotlightWeighting2 * vec3(c,c,c);
    }
    if (diff3 < uInnerAngle) lightWeighting += uPointLightingColor * spotlightWeighting3;
    else if (diff3 <= uOuterAngle) {
        // scalingFactor - gives a gradient between two circles
        float c = (uOuterAngle - diff3) / (uOuterAngle - uInnerAngle);
        lightWeighting += uPointLightingColor * spotlightWeighting3 * vec3(c,c,c);
    }
    if (diff4 < uInnerAngle) lightWeighting += uPointLightingColor * spotlightWeighting4;
    else if (diff4 <= uOuterAngle) {
        // scalingFactor - gives a gradient between two circles
        float c = (uOuterAngle - diff4) / (uOuterAngle - uInnerAngle);
        lightWeighting += uPointLightingColor * spotlightWeighting4 * vec3(c,c,c);
    }
    
    
    // 1 spotlight
/*    vec3 lightDirectionFromPt = normalize(uSpotlightLocation - vPosition.xyz);
    float spotlightWeighting = max(dot(normalize(vTransformedNormal.xyz), lightDirectionFromPt), 0.0);
    float diff = acos(dot(lightDirectionFromPt, normalize(uSpotlightDirection)));
    if (diff < uInnerAngle)
        lightWeighting += uPointLightingColor * spotlightWeighting;
    else if (diff <= uOuterAngle) {
        // scalingFactor - gives a gradient between two circles
        float c = (uOuterAngle - diff) / (uOuterAngle - uInnerAngle);
        lightWeighting += uPointLightingColor * spotlightWeighting * vec3(c,c,c);
    }*/
  }
  
  vec4 fragmentColor;
  if (uUseTextures) {
    fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  } else {
    fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
}


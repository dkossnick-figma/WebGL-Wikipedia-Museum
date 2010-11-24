#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec4 vTransformedNormal;
varying vec4 vPosition;

uniform bool uUseLighting;
uniform bool uUseTextures;

uniform vec3 uAmbientColor;
uniform float uSpotCosCutoff;
uniform float uCosOuterConeAngle;
uniform float uCosInnerConeAngle;

uniform vec3 uPointLightingLocation;
uniform vec3 uPointLightingColor;
uniform vec3 uPointLightingDirection;

uniform sampler2D uSampler;

void main(void) {
    vec4 final_color = vec4(1.0,1.0,1.0,1.0);
    vec4 textureColor;
    if (uUseTextures) {
      textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    } else {
      textureColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    if (!uUseLighting) {
      gl_FragColor = textureColor;
      return;
    }
    final_color.xyz = uAmbientColor * textureColor.xyz;
    
    vec3 L = normalize(uPointLightingDirection);
    vec3 D = normalize(uPointLightingLocation - vPosition.xyz);
    
    if (dot(-L, D) > uSpotCosCutoff)
    {
        vec3 N = normalize(vTransformedNormal.xyz);
        
        float lambertTerm = max( dot(N,L), 0.0);
        if(lambertTerm > 0.0)
        {
            float lambertTerm = max( dot(N,L), 0.0);
            if(lambertTerm > 0.0)
            {
                final_color += textureColor * lambertTerm;
            }
        }
    }
    else
    {
        final_color += textureColor;
    }
    
    gl_FragColor = final_color;
}

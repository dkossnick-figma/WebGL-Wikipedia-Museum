// Per vertex

#ifdef GL_ES
precision highp float;
#endif

uniform bool uUseTextures;

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

uniform sampler2D uSampler;

void main(void) {
   vec4 textureColor;
   if (uUseTextures) {
      textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
   }
   else {
      textureColor = vec4(1.0,1.0,1.0,1.0);
   }
   gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);
}
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

// new
const float cos_outer_cone_angle = 0.8; // 36 degrees
const float cos_inner_cone_angle = 0.799; // 32 degrees?
const float spotCosCutoff = -0.3;
const float shininess = 0.9;

void main(void) {
  vec4 final_color = vec4(1.0,0,0,1.0);
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
  
  vec3 L = normalize(uPointLightingDirection);
  vec3 D = normalize(uPointLightingLocation - vPosition.xyz);
  
  if (dot(-L, D) >= spotCosCutoff)
  {
      vec3 N = normalize(vTransformedNormal.xyz);
      
      final_color =  vec4(0.0,1.0,0,1.0);
  
      float lambertTerm = max( dot(N,L), 0.0);
      if(lambertTerm > 0.0)
      {
          final_color = textureColor * lambertTerm;
      /*
          vec3 E = normalize(eyeVec);
          vec3 R = reflect(-L, N);
          
          float specular = pow( max(dot(R, E), 0.0), 
          gl_FrontMaterial.shininess );
          
          final_color += gl_LightSource[0].specular * 
          gl_FrontMaterial.specular * 
          specular;*/
      }
  }
  
  gl_FragColor = final_color;
}

/*
  vec4 final_color;
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
  
  vec3 spotDirection = normalize(uPointLightingLocation - vPosition.xyz);
  vec3 lightDirection = normalize(uPointLightingDirection);
  
  float cos_cur_angle = dot(-lightDirection, spotDirection);
  float cos_inner_minus_outer_angle = cos_inner_cone_angle - cos_outer_cone_angle;
  
  // Don't need dynamic branching at all, precompute 
  // falloff (i will call it spot)
  float spot = clamp((cos_cur_angle - cos_outer_cone_angle) / 
         cos_inner_minus_outer_angle, 0.0, 1.0);
  
  float lambertTerm = max( dot(vTransformedNormal.xyz,lightDirection), 0.0);
  if(lambertTerm > 0.0)
  {
      final_color = textureColor + lambertTerm * spot;
  }
  
  
  vec3 lightWeighting;

  float directionalLightWeighting = max(dot(normalize(vTransformedNormal.xyz), spotDirection), 0.0);
  lightWeighting = uAmbientColor + directionalLightWeighting * uPointLightingColor;
  
  gl_FragColor = vec4( final_color.xyz, textureColor.a);
}*/




/*
varying vec3 normal, lightDir, eyeVec;

void main (void)
{
vec4 final_color =
(gl_FrontLightModelProduct.sceneColor * gl_FrontMaterial.ambient) +
(gl_LightSource[0].ambient * gl_FrontMaterial.ambient);

vec3 L = normalize(lightDir);
vec3 D = normalize(gl_LightSource[0].spotDirection);

float cos_cur_angle = dot(-L, D);

float cos_inner_cone_angle = gl_LightSource[0].spotCosCutoff;

float cos_inner_minus_outer_angle = 
      cos_inner_cone_angle - cos_outer_cone_angle;

//****************************************************
// Don't need dynamic branching at all, precompute 
// falloff(i will call it spot)
float spot = 0.0;
spot = clamp((cos_cur_angle - cos_outer_cone_angle) / 
       cos_inner_minus_outer_angle, 0.0, 1.0);
//****************************************************

vec3 N = normalize(normal);

float lambertTerm = max( dot(N,L), 0.0);
if(lambertTerm > 0.0)
{
	final_color += gl_LightSource[0].diffuse *
		gl_FrontMaterial.diffuse *
		lambertTerm * spot;

	vec3 E = normalize(eyeVec);
	vec3 R = reflect(-L, N);

	float specular = pow( max(dot(R, E), 0.0),
		gl_FrontMaterial.shininess );

	final_color += gl_LightSource[0].specular *
		gl_FrontMaterial.specular *
		specular * spot;
}
gl_FragColor = final_color;
}
*/
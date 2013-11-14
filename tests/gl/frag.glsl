#version 150
in vec3 Color;
out vec4 outColor;
void main() {
  vec4 color = vec4(Color,1.0);

  //to make soft roundish particles  
  color *= max(0.0, 1.0 - 2.0 * length(gl_PointCoord - 0.5));

//  outColor = vec4(color, 1.0);
  outColor = color;
}

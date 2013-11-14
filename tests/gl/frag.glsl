#version 100
varying vec3 v_color;
void main() {
//gl_FragColor = vec4(1,0,0,1);
    gl_FragColor = vec4(v_color.r,v_color.g,v_color.b,1.0);
//  vec4 color = vec4(Color.r,Color.g,Color.b,1.0);

  //to make soft roundish particles  
//  color *= max(0.0, 1.0 - 2.0 * length(gl_PointCoord - 0.5));

//  outColor = vec4(color, 1.0);
//  outColor = color;
//gl_FragColor = color;
}

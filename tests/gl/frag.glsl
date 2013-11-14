#version 120
#ifdef GL_ES
    precision mediump float;
#endif
varying vec3 v_color;
void main() {
    vec4 color = vec4(v_color.r,v_color.g,v_color.b,1.0);
    //to make soft roundish particles  
    color *= max(0.0, 1.0 - 2.0 * length(gl_PointCoord - 0.5));
    gl_FragColor = color;
}

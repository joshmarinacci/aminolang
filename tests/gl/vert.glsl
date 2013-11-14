#version 100

uniform float time;
uniform vec2 gravity;

attribute vec2 position;
attribute vec3 incolor;
attribute vec2 delta;
attribute float delay;

varying vec3 v_color;

void main() {
//  float gravity = -0.8;
  float rtime = time-delay;
//  if(rtime < 0) {
//    rtime = 0;
//  }
//  rtime = mod(rtime,4);
//  v_color = c2;//vec3(1.0,0.0,1.0);
  //*((4-rtime)/2.0);
  float tx = position.x + delta.x*rtime + gravity.x*rtime*rtime;
  float ty = position.y + delta.y*rtime + gravity.y*rtime*rtime;
  gl_Position = vec4(tx/3.0, ty/3.0, 0.0, 1.0);

v_color = incolor;
//gl_Position = vec4(0,0,0,1);
}


#version 150 core
in vec2 position;
in vec3 color;
in vec2 delta;
in float delay;
uniform float time;
uniform vec2 gravity;

out vec3 Color;

void main() {
//  float gravity = -0.8;
  float rtime = time-delay;
//  if(rtime < 0) {
//    rtime = 0;
//  }
  rtime = mod(rtime,4);
  Color = color*((4-rtime)/2.0);
  float tx = position.x + delta.x*rtime + gravity.x*rtime*rtime;
  float ty = position.y + delta.y*rtime + gravity.y*rtime*rtime;
  gl_Position = vec4(tx/3, ty/3, 0.0, 1.0);
}


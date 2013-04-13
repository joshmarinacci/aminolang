#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>

#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>
#include "shaders.h"

Shader::Shader() {
    printf("creating a shader\n");
}

int Shader::compileVertShader(const char* text) {
    GLint stat;
    printf("inside compile vert shader\n");
    GLuint vertShader = glCreateShader(GL_VERTEX_SHADER);
    printf("created a shader\n");
    glShaderSource(vertShader, 1, (const char **) &text, NULL);
    glCompileShader(vertShader);
    printf("compiled\n");
    glGetShaderiv(vertShader, GL_COMPILE_STATUS, &stat);
    if (!stat) {
        printf("Error: vertex shader did not compile!\n");
        //exit(1);
    }
    return vertShader;
}

int Shader::compileFragShader(const char* text) {
    GLint stat;
    GLuint fragShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragShader, 1, (const char **) &text, NULL);
    glCompileShader(fragShader);
    glGetShaderiv(fragShader, GL_COMPILE_STATUS, &stat);
    if (!stat) {
        printf("Error: fragment shader did not compile!\n");
        //exit(1);
    }
    return fragShader;
}

int Shader::compileProgram(int vertShader, int fragShader) {
    GLuint program = glCreateProgram();
    GLint stat;
    glAttachShader(program, vertShader);
    glAttachShader(program, fragShader);
    glLinkProgram(program);
    
    glGetProgramiv(program, GL_LINK_STATUS, &stat);
    if (!stat) {
        char log[1000];
        GLsizei len;
        glGetProgramInfoLog(program, 1000, &len, log);
        printf("Error: linking:\n%s\n", log);
        //exit(1);
    }
    return program;
}


/* ==== Color Shader impl === */

ColorShader::ColorShader() {
   static const char *fragShaderText =
   //the precision only seems to work on mobile, not desktop
      "precision mediump float;\n"
      "varying vec4 v_color;\n"
      "void main() {\n"
      "   gl_FragColor = v_color;\n"
      "}\n";
      
   static const char *vertShaderText =
      "uniform mat4 modelviewProjection;\n"
//      "uniform mat4 trans;\n"
      "attribute vec4 pos;\n"
      "attribute vec4 color;\n"
      "varying vec4 v_color;\n"
      "void main() {\n"
      "   gl_Position = pos * modelviewProjection;\n"
      "   v_color = color;\n"
      "}\n";

      printf("about to compile shaders\n");
   GLuint vert = compileVertShader(vertShaderText);
   printf("did a compile\n");
   GLuint frag = compileFragShader(fragShaderText);
   prog = compileProgram(vert,frag);
   
      printf("about to use shaders\n");
   glUseProgram(prog);
   attr_pos   = glGetAttribLocation(prog, "pos");
   attr_color = glGetAttribLocation(prog, "color");
   u_matrix   = glGetUniformLocation(prog, "modelviewProjection");
//   u_trans    = glGetUniformLocation(prog, "trans");
   printf("Uniform modelviewProjection at %d\n", u_matrix);
   printf("Attrib pos at %d\n", attr_pos);
   printf("Attrib color at %d\n", attr_color);
}   

void ColorShader::apply(GLfloat modelView[16], GLfloat trans[16], GLfloat verts[][2], GLfloat colors[][3]) {
    glUseProgram(prog);
    glUniformMatrix4fv(u_matrix, 1, GL_FALSE, modelView);
//    glUniformMatrix4fv(u_trans, 1, GL_FALSE, trans);
    

    glVertexAttribPointer(attr_pos,   2, GL_FLOAT, GL_FALSE, 0, verts);
    glVertexAttribPointer(attr_color, 3, GL_FLOAT, GL_FALSE, 0, colors);
    glEnableVertexAttribArray(attr_pos);
    glEnableVertexAttribArray(attr_color);
    
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray(attr_pos);
    glDisableVertexAttribArray(attr_color);
}    





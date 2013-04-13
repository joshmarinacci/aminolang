#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>

#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>
#include "shaders.h"
#include "common.h"
#include <png.h>

Shader::Shader() {
    printf("creating a shader\n");
}

int Shader::compileVertShader(const char* text) {
    GLint stat;
    GLuint vertShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertShader, 1, (const char **) &text, NULL);
    glCompileShader(vertShader);
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
}   

void ColorShader::apply(GLfloat modelView[16], GLfloat trans[16], GLfloat verts[][2], GLfloat colors[][3]) {
    glUseProgram(prog);
    glUniformMatrix4fv(u_matrix, 1, GL_FALSE, modelView);
    

    glVertexAttribPointer(attr_pos,   2, GL_FLOAT, GL_FALSE, 0, verts);
    glVertexAttribPointer(attr_color, 3, GL_FLOAT, GL_FALSE, 0, colors);
    glEnableVertexAttribArray(attr_pos);
    glEnableVertexAttribArray(attr_color);
    
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray(attr_pos);
    glDisableVertexAttribArray(attr_color);
}    






static int keys[] =  {-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,63,72,-1,74,75,76,78,68,80,81,79,83,64,84,65,66,53,54,55,56,57,58,59,60,61,62,-1,67,-1,85,-1,-1,73,0,1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,69,71,70,77,82,-1,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1};
static double offsets[] = {0.0,15.0,17.0,16.0,35.0,15.0,52.0,17.0,71.0,13.0,86.0,12.0,100.0,17.0,119.0,18.0,139.0,18.0,159.0,7.0,168.0,6.0,176.0,15.0,193.0,12.0,207.0,22.0,231.0,18.0,251.0,19.0,272.0,14.0,288.0,19.0,309.0,15.0,326.0,13.0,341.0,13.0,356.0,17.0,375.0,14.0,391.0,22.0,415.0,14.0,431.0,13.0,446.0,14.0,462.0,13.0,477.0,15.0,494.0,11.0,507.0,15.0,524.0,13.0,539.0,8.0,549.0,13.0,564.0,15.0,581.0,6.0,589.0,6.0,597.0,13.0,612.0,6.0,620.0,22.0,644.0,15.0,661.0,14.0,677.0,15.0,694.0,15.0,711.0,10.0,723.0,11.0,736.0,8.0,746.0,15.0,763.0,12.0,777.0,19.0,798.0,13.0,813.0,12.0,827.0,11.0,840.0,14.0,856.0,14.0,872.0,14.0,888.0,14.0,904.0,14.0,920.0,14.0,936.0,14.0,952.0,14.0,968.0,14.0,984.0,14.0,1000.0,6.0,1008.0,6.0,1016.0,6.0,1024.0,9.0,1035.0,6.0,1043.0,5.0,1050.0,8.0,1060.0,8.0,1070.0,9.0,1081.0,6.0,1089.0,22.0,1113.0,16.0,1131.0,14.0,1147.0,20.0,1169.0,13.0,1184.0,18.0,1204.0,13.0,1219.0,7.0,1228.0,7.0,1237.0,11.0,1250.0,14.0,1266.0,8.0,1276.0,14.0,};

FontShader::FontShader() {
    static const char *vertShaderText =
      "uniform mat4 modelviewProjection;\n"
      "uniform mat4 trans;\n"
      "attribute vec4 pos;\n"
      "attribute vec2 texcoords;\n"
      "varying vec2 uv;\n"
      "void main() {\n"
      "   gl_Position = pos * modelviewProjection;\n"
      "   uv = texcoords;\n"
      "}\n";
      
    static const char *fragShaderText =
      "precision mediump float;\n"
      "varying vec2 uv;\n"
      "uniform sampler2D tex;\n"
      "void main() {\n"
        "   gl_FragColor = texture2D(tex,uv);\n"
      "}\n";
      
    GLuint vert = compileVertShader(vertShaderText);
    GLuint frag = compileFragShader(fragShaderText);
    prog = compileProgram(vert,frag);
    
    glUseProgram(prog);
    attr_pos = glGetAttribLocation(prog,"pos");
    attr_texcoords = glGetAttribLocation(prog, "texcoords");
    attr_tex = glGetAttribLocation(prog, "tex");
    u_matrix = glGetUniformLocation(prog, "modelviewProjection");
    u_trans  = glGetUniformLocation(prog, "trans");
    
    int w = 0;
    int h;
    printf("about to load a texture\n");
//    texID = png_texture_load("/data/node/blue.png",&w,&h);
    printf("font texture = %d %d x %d\n",texID,w,h);
}
void FontShader::apply(GLfloat modelView[16], GLfloat trans[16], char* text, float offX, float offY) {
    glUseProgram(prog);
    glUniformMatrix4fv(u_matrix, 1, GL_FALSE, modelView);
    glUniformMatrix4fv(u_trans, 1, GL_FALSE, trans);
    glUniform1i(attr_tex, 0);
    
    float charX = 0;
    int len = strlen(text);

    for(int i=0; i<len; i++) {
        int ch = text[i];
        int n = keys[ch];
        float cho = (float) offsets[n*2];
        float chw = (float) offsets[n*2+1];
        float iw = 1121;
        float ih = 34;

        float tx  = cho/iw;
        float ty2  = 1.0-(35/ih);
        float tx2 = (cho+chw)/iw;
        float ty = 1.0-(7/ih);

        GLfloat texcoords[6][2];
        texcoords[0][0] = tx;    texcoords[0][1] = ty;
        texcoords[1][0] = tx2;   texcoords[1][1] = ty;
        texcoords[2][0] = tx2;   texcoords[2][1] = ty2;
        
        texcoords[3][0] = tx2;   texcoords[3][1] = ty2;
        texcoords[4][0] = tx;    texcoords[4][1] = ty2;
        texcoords[5][0] = tx;    texcoords[5][1] = ty;

        //set the texture coordinates
        glVertexAttribPointer(attr_texcoords, 2, GL_FLOAT, GL_FALSE, 0, texcoords);
        glEnableVertexAttribArray(attr_texcoords);


        Bounds* bounds = new Bounds(charX, 0, chw, 35-8);
        float x = (float)bounds->getX()+offX;
        float y = (float)bounds->getY()+offY;
        float x2 = (float)bounds->getX()+bounds->getW()+offX;
        float y2 = (float)bounds->getY()+bounds->getH()+offY;

        GLfloat verts[6][2];
        verts[0][0] = x;    verts[0][1] = y;
        verts[1][0] = x2;   verts[1][1] = y;
        verts[2][0] = x2;   verts[2][1] = y2;
        
        verts[3][0] = x2;   verts[3][1] = y2;
        verts[4][0] = x;    verts[4][1] = y2;
        verts[5][0] = x;    verts[5][1] = y;
        
        //set the vertices
        glVertexAttribPointer(attr_pos, 2, GL_FLOAT, GL_FALSE, 0, verts);
        glEnableVertexAttribArray(attr_pos);
        //set the active texture
        //glActiveTexture(GL_TEXTURE0);
        //glBindTexture(GL_TEXTURE_2D,texID);
        //draw it
        //glDrawArrays(GL_TRIANGLES, 0, 6);
        charX += chw;
        glDisableVertexAttribArray(attr_pos);
        glDisableVertexAttribArray(attr_texcoords);
    }
}







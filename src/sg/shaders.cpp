#include <string.h>
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
#ifdef KLAATU
      "precision mediump float;\n"
#endif
      "varying vec4 v_color;\n"
      "void main() {\n"
      "   gl_FragColor = v_color;\n"
      "}\n";
      
   static const char *vertShaderText =
      "uniform mat4 modelviewProjection;\n"
      "uniform mat4 trans;\n"
      "attribute vec4 pos;\n"
      "attribute vec4 color;\n"
      "varying vec4 v_color;\n"
      "void main() {\n"
      "   gl_Position = modelviewProjection * trans * pos;\n"
      "   v_color = color;\n"
      "}\n";

   GLuint vert = compileVertShader(vertShaderText);
   printf("did a compile\n");
   GLuint frag = compileFragShader(fragShaderText);
   prog = compileProgram(vert,frag);
   
   glUseProgram(prog);
   attr_pos   = glGetAttribLocation(prog, "pos");
   attr_color = glGetAttribLocation(prog, "color");
   u_matrix   = glGetUniformLocation(prog, "modelviewProjection");
   u_trans    = glGetUniformLocation(prog, "trans");
}   

void ColorShader::apply(GLfloat modelView[16], GLfloat trans[16], GLfloat verts[][2], GLfloat colors[][3]) {
    glUseProgram(prog);
    glUniformMatrix4fv(u_matrix, 1, GL_FALSE, modelView);
    glUniformMatrix4fv(u_trans,  1, GL_FALSE, trans);
    

    glVertexAttribPointer(attr_pos,   2, GL_FLOAT, GL_FALSE, 0, verts);
    glVertexAttribPointer(attr_color, 3, GL_FLOAT, GL_FALSE, 0, colors);
    glEnableVertexAttribArray(attr_pos);
    glEnableVertexAttribArray(attr_color);
    
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray(attr_pos);
    glDisableVertexAttribArray(attr_color);
}    


/* ==== Color Shader impl === */
/*
RectShader::RectShader() {
   static const char *fragShaderText =
   //the precision only seems to work on mobile, not desktop
#ifdef KLAATU
      "precision mediump float;\n"
#endif
      "varying vec4 v_color;\n"
      "void main() {\n"
      "   gl_FragColor = v_color;\n"
      "}\n";
      
   static const char *vertShaderText =
      "uniform mat4 modelviewProjection;\n"
      "uniform mat4 trans;\n"
      "attribute vec4 pos;\n"
      "attribute vec4 color;\n"
      "varying vec4 v_color;\n"
      "void main() {\n"
      "   gl_Position = trans * pos * modelviewProjection;\n"
      "   v_color = color;\n"
      "}\n";

   GLuint vert = compileVertShader(vertShaderText);
   printf("did a compile\n");
   GLuint frag = compileFragShader(fragShaderText);
   prog = compileProgram(vert,frag);
   
   glUseProgram(prog);
   attr_pos   = glGetAttribLocation(prog, "pos");
   attr_color = glGetAttribLocation(prog, "color");
   u_matrix   = glGetUniformLocation(prog, "modelviewProjection");
   u_trans    = glGetUniformLocation(prog, "trans");
}   

void RectShader::apply(GLfloat modelView[16], GLfloat trans[16], GLfloat verts[][2], GLfloat colors[][3]) {
    glUseProgram(prog);
    glUniformMatrix4fv(u_matrix, 1, GL_FALSE, modelView);
    glUniformMatrix4fv(u_trans,  1, GL_FALSE, trans);
    

    glVertexAttribPointer(attr_pos,   2, GL_FLOAT, GL_FALSE, 0, verts);
    glVertexAttribPointer(attr_color, 3, GL_FLOAT, GL_FALSE, 0, colors);
    glEnableVertexAttribArray(attr_pos);
    glEnableVertexAttribArray(attr_color);
    
    glDrawArrays(GL_LINES, 0, 8);
    
    glDisableVertexAttribArray(attr_pos);
    glDisableVertexAttribArray(attr_color);
}    

*/


FontShader::FontShader() {
    static const char *vertShaderText =
      "uniform mat4 modelviewProjection;\n"
      "uniform mat4 trans;\n"
      "attribute vec4 pos;\n"
      "attribute vec2 texcoords;\n"
      "varying vec2 uv;\n"
      "void main() {\n"
      "   gl_Position = modelviewProjection * trans * pos;\n"
      "   uv = texcoords;\n"
      "}\n";
      
    static const char *fragShaderText =
#ifdef KLAATU
      "precision mediump float;\n"
#endif
      "varying vec2 uv;\n"
      "uniform sampler2D tex;\n"
      "uniform vec3 color;\n"
      "void main() {\n"
      "   vec4 texel = texture2D(tex, uv);\n"
//      "   if(texel.a < 0.9) { discard; }\n"
      "    gl_FragColor = vec4(color.r,color.g,color.b,texel.a);\n"
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
    u_color  = glGetUniformLocation(prog, "color");
    
    GLubyte image_data[12] = {
        255,0  ,255,
        255,255,255,
        0  ,255,255,
        0  ,0  ,255
    };
    // Generate the OpenGL texture object
    GLuint texture;
    glGenTextures(1, &texture);
    glBindTexture(GL_TEXTURE_2D, texture);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, 2, 2, 0, GL_RGB, GL_UNSIGNED_BYTE, image_data);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    texID = texture;
}

static void drawLetter(float tx, float ty, float tx2, float ty2,
    float x, float y, float x2, float y2,
    int attr_pos, int attr_texcoords, AminoFont* font
    ) {

    GLfloat texcoords[6][2];
    texcoords[0][0] = tx;    texcoords[0][1] = ty;
    texcoords[1][0] = tx2;   texcoords[1][1] = ty;
    texcoords[2][0] = tx2;   texcoords[2][1] = ty2;
    
    texcoords[3][0] = tx2;   texcoords[3][1] = ty2;
    texcoords[4][0] = tx;    texcoords[4][1] = ty2;
    texcoords[5][0] = tx;    texcoords[5][1] = ty;
    
    glVertexAttribPointer(attr_texcoords, 2, GL_FLOAT, GL_FALSE, 0, texcoords);
    glEnableVertexAttribArray(attr_texcoords);
    
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
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D,font->texid);
    //draw it
    glDrawArrays(GL_TRIANGLES, 0, 6);
    //break it down
    glDisableVertexAttribArray(attr_pos);
    glDisableVertexAttribArray(attr_texcoords);
}

void FontShader::apply(GLfloat modelView[16], GLfloat trans[16], 
        char* text, float offX, float offY,  
        float r, float g, float b, 
        float fsize,
        AminoFont* font
        ) {
    if(font == NULL) {
        printf("can't draw. null font passed in!!!\n");
        return;
    }
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    glUseProgram(prog);
    glUniformMatrix4fv(u_matrix, 1, GL_FALSE, modelView);
    glUniformMatrix4fv(u_trans,  1, GL_FALSE, trans);
    glUniform3f(u_color, r,g,b);
    glUniform1i(attr_tex, 0);
    
    int len = strlen(text);
    float scale = fsize/40.0;
    float charx = 0;
    float rowheight = font->imageheight/font->rowcount;
    for(int i=0; i<len; i++) {
        int ch = text[i];
        int n = ch - font->minchar;
        
        float tx = font->offsets[n] /font->imagewidth;
        float ty = font->yoffsets[n]/font->imageheight;
        float tw = font->widths[n]  /font->imagewidth;
        float th = rowheight        /font->imageheight;
    
        float x = charx + offX;
        float y = 0 + offY;
        float w = font->widths[n]*scale;
        float h = rowheight*scale;
        drawLetter(
            tx,ty,tx+tw,ty+th,
            x,y,x+w,y+h,
            attr_pos, attr_texcoords, font);
        charx += w;
    }
    glDisable(GL_BLEND);
}



TextureShader::TextureShader() {
    static const char *vertShaderText =
      "uniform mat4 modelviewProjection;\n"
      "uniform mat4 trans;\n"
      "attribute vec4 pos;\n"
      "attribute vec2 texcoords;\n"
      "varying vec2 uv;\n"
      "void main() {\n"
      "   gl_Position = modelviewProjection * trans * pos;\n"
      "   uv = texcoords;\n"
      "}\n";
      
    static const char *fragShaderText =
#ifdef KLAATU
      "precision mediump float;\n"
#endif
      "varying vec2 uv;\n"
      "uniform sampler2D tex;\n"
      "void main() {\n"
        "   gl_FragColor = texture2D(tex,uv);\n"
      "}\n";
      
    GLuint vert = compileVertShader(vertShaderText);
    GLuint frag = compileFragShader(fragShaderText);
    prog = compileProgram(vert,frag);
    
    glUseProgram(prog);
    attr_pos   = glGetAttribLocation(prog, "pos");
    attr_texcoords = glGetAttribLocation(prog, "texcoords");
    attr_tex = glGetAttribLocation(prog, "tex");
    u_matrix   = glGetUniformLocation(prog, "modelviewProjection");
    u_trans    = glGetUniformLocation(prog, "trans");
    
    int w;
    int h;
    GLubyte image_data[12] = {
        255,0  ,255,
        255,255,255,
        0  ,255,255,
        0  ,0  ,255
    };
    // Generate the OpenGL texture object
    GLuint texture;
    glGenTextures(1, &texture);
    glBindTexture(GL_TEXTURE_2D, texture);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, 2, 2, 0, GL_RGB, GL_UNSIGNED_BYTE, image_data);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    texID = texture;
}

void TextureShader::apply(GLfloat modelView[16], GLfloat trans[16], GLfloat verts[][2], GLfloat texcoords[][2], int texid) {
    //printf("doing texture shader apply %d\n",texid);
    glEnable(GL_BLEND);
    glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
    glUseProgram(prog);
    
    glUniformMatrix4fv(u_matrix, 1, GL_FALSE, modelView);
    glUniformMatrix4fv(u_trans,  1, GL_FALSE, trans);
    glUniform1i(attr_tex, 0);
    

    glVertexAttribPointer(attr_texcoords, 2, GL_FLOAT, GL_FALSE, 0, texcoords);
    glEnableVertexAttribArray(attr_texcoords);

    glVertexAttribPointer(attr_pos,   2, GL_FLOAT, GL_FALSE, 0, verts);
    glEnableVertexAttribArray(attr_pos);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, texid);
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray(attr_pos);
    glDisableVertexAttribArray(attr_texcoords);
    glDisable(GL_BLEND);
}    


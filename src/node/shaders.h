#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>
#include "mathutils.h"

class Shader {
public:
    Shader();
    virtual int compileVertShader(const char* text);
    virtual int compileFragShader(const char* text);
    virtual int compileProgram(int vert, int frag);
    virtual ~Shader() {}
};

class ColorShader: public Shader {
public:
    ColorShader();
    virtual void apply(GLfloat modelView[16], GLfloat trans[16], GLfloat verts[][2], GLfloat colors[][3]);
    int prog;
    GLint u_matrix, u_trans;
    GLint attr_pos;
    GLint attr_color;
    
/*    
void draw() {
        GLfloat mat[16];
        loadOrthoMatrix(mat, 0, 720, 1280, 0, 0, 100);
        glUniformMatrix4fv(this->u_matrix, 1, GL_FALSE, mat);
    
    //GLfloat mat[16], rot[16], scale[16];
    
    // Set the modelview/projection matrix
    //make_z_rot_matrix(view_rotx, rot);
    //float sc = 0.2;
    //make_scale_matrix(sc,sc,sc, scale);
    //mul_matrix(mat, rot, scale);
    
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    
    float x = 0;
    float y = 0;
    float x2 = 50;
    float y2 = 50;
        printf("filling quad color with %f,%f -> %f,%f\n",x,y,x2,y2);
   
        GLfloat verts[6][2];
        verts[0][0] = x;
        verts[0][1] = y;
        verts[1][0] = x2;
        verts[1][1] = y;
        verts[2][0] = x2;
        verts[2][1] = y2;
        
        verts[3][0] = x2;
        verts[3][1] = y2;
        verts[4][0] = x;
        verts[4][1] = y2;
        verts[5][0] = x;
        verts[5][1] = y;

        GLfloat colors[6][3];
        for(int i=0; i<6; i++) {
            for(int j=0; j<3; j++) {
                //                colors[i][j] = tcol->comps[j];
                colors[i][j] = 0.5;
            }
        }

    glVertexAttribPointer(this->attr_pos,   2, GL_FLOAT, GL_FALSE, 0, verts);
    glVertexAttribPointer(this->attr_color, 3, GL_FLOAT, GL_FALSE, 0, colors);
    glEnableVertexAttribArray(this->attr_pos);
    glEnableVertexAttribArray(this->attr_color);
    
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray(this->attr_pos);
    glDisableVertexAttribArray(this->attr_color);
    
}
*/
    
};

class FontShader: public Shader {
public:
    FontShader();
    virtual void apply(GLfloat modelView[16], GLfloat trans[16], char* text, float x, float y);
    int prog;
    GLint u_matrix, u_trans;
    GLint attr_pos;
    GLint attr_texcoords, attr_tex, texID;
};




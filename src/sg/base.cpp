#include "base.h"

using namespace v8;



ColorShader* colorShader;
TextureShader* textureShader;
FontShader* fontShader;
GLfloat* modelView;
GLfloat* globaltx;
int width = 640;
int height = 480;


std::stack<void*> matrixStack;
int rootHandle;
std::map<int,AminoFont*> fontmap;


void scale(double x, double y){
    GLfloat scale[16];
    GLfloat temp[16];
    make_scale_matrix((float)x,(float)y, 1.0, scale);
    mul_matrix(temp, globaltx, scale);
    copy_matrix(globaltx,temp);
}

void translate(double x, double y) {
    GLfloat tr[16];
    GLfloat trans2[16];
    make_trans_matrix((float)x,(float)y,0,tr);
    mul_matrix(trans2, globaltx, tr);
    copy_matrix(globaltx,trans2);
}

void rotate(double x, double y, double z) {
    GLfloat rot[16];
    GLfloat temp[16];
    
    make_y_rot_matrix(y, rot);
    mul_matrix(temp, globaltx, rot);
    copy_matrix(globaltx,temp);
    
    make_z_rot_matrix(z, rot);
    mul_matrix(temp, globaltx, rot);
    copy_matrix(globaltx,temp);
}

void save() {
    GLfloat* temp = new GLfloat[16];
    copy_matrix(temp,globaltx);
    matrixStack.push(globaltx);
    globaltx = temp;
}

void restore() {
    globaltx = (GLfloat*)matrixStack.top();
    matrixStack.pop();
}


void TextNode::draw() {
    if(fontmap.size() < 1) return;
    AminoFont* font = fontmap[0];
    save();
    translate(tx,ty);
    scale(scalex,scaley);
    rotate(rotatex,rotatey,rotatez);
    fontShader->apply(modelView, 
        globaltx, text, x,y, r,g,b, fontsize,font);
    restore();
}


void Rect::draw() {
	if(visible == 0) return;
        float x =  this->x;
        float y =  this->y;
        float x2 = this->x+w;
        float y2 = this->y+h;
        
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
                colors[i][j] = 0.5;
                if(j==0) colors[i][j] = r;
                if(j==1) colors[i][j] = g;
                if(j==2) colors[i][j] = b;
            }
        }
        
        save();
        translate(tx,ty);
        scale(scalex,scaley);
        rotate(rotatex,rotatey,rotatez);
        if(texid != INVALID) {
            GLfloat texcoords[6][2];
            float tx  = 0;
            float ty2 = 1;
            float tx2 = 1;
            float ty  = 0;
            texcoords[0][0] = tx;    texcoords[0][1] = ty;
            texcoords[1][0] = tx2;   texcoords[1][1] = ty;
            texcoords[2][0] = tx2;   texcoords[2][1] = ty2;
            
            texcoords[3][0] = tx2;   texcoords[3][1] = ty2;
            texcoords[4][0] = tx;    texcoords[4][1] = ty2;
            texcoords[5][0] = tx;    texcoords[5][1] = ty;
            textureShader->apply(modelView, globaltx, verts, texcoords, texid);
        } else {
            colorShader->apply(modelView, globaltx, verts, colors, opacity);
        }
        restore();
    }


void Group::draw() {
    	if(visible != 1) return;
    save();
    translate(tx,ty);
    scale(scalex,scaley);
    rotate(rotatex,rotatey,rotatez);
    for(int i=0; i<children.size(); i++) {
        children[i]->draw();
    }
    restore();
}



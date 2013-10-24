#include "AbstractRenderer.h"

class GLContext {
public:
    std::stack<void*> matrixStack;
    GLfloat* globaltx;
    GLContext() {
        this->globaltx = new GLfloat[16];
        make_identity_matrix(this->globaltx);
    }
    void translate(double x, double y) {
        GLfloat tr[16];
        GLfloat trans2[16];
        make_trans_matrix((float)x,(float)y,0,tr);
        mul_matrix(trans2, this->globaltx, tr);
        copy_matrix(this->globaltx,trans2);
    }
    void rotate(double x, double y, double z) {
        GLfloat rot[16];
        GLfloat temp[16];
        
        make_x_rot_matrix(x, rot);
        mul_matrix(temp, this->globaltx, rot);
        copy_matrix(this->globaltx,temp);
    
        make_y_rot_matrix(y, rot);
        mul_matrix(temp, this->globaltx, rot);
        copy_matrix(this->globaltx,temp);
        
        make_z_rot_matrix(z, rot);
        mul_matrix(temp, this->globaltx, rot);
        copy_matrix(this->globaltx,temp);
    }
        
    void scale(double x, double y){
        GLfloat scale[16];
        GLfloat temp[16];
        make_scale_matrix((float)x,(float)y, 1.0, scale);
        mul_matrix(temp, this->globaltx, scale);
        copy_matrix(this->globaltx,temp);
    }

    void save() {
        GLfloat* temp = new GLfloat[16];
        copy_matrix(temp,this->globaltx);
        this->matrixStack.push(this->globaltx);
        this->globaltx = temp;
    }
    
    void restore() {
        this->globaltx = (GLfloat*)this->matrixStack.top();
        this->matrixStack.pop();
    }
};

class SimpleRenderer : public AbstractRenderer {
public:
    virtual void startRender(AminoNode* node);
    virtual void render(GLContext* c, AminoNode* node);
    virtual void drawGroup(GLContext* c, Group* group);
    virtual void drawRect(GLContext* c, Rect* rect);
    virtual void drawText(GLContext* c, TextNode* text);
};




#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>
#include <string>
#include <stack>

using std::stack;

class TStage : public Stage {
public:
    virtual void draw();
};

class TCore : public Core {
public:
    virtual void start();
    virtual Stage* createStage();
    TStage* _stage;
};


class GLGFX: public GFX {
public:
    GLGFX();
    GLfloat* transform;
    virtual void save();
    virtual void restore();
    virtual void translate(double x, double y);
    virtual void fillQuadColor(Color* color, Bounds* bounds);
    virtual void fillQuadTexture(Bounds* bounds,  Bounds* textureBounds);
    virtual void fillQuadText(char* text, double x, double y);
    stack<void*> matrixStack;
};


class TColor : public Color {
public:
    TColor(GLfloat r, GLfloat g, GLfloat b);
    GLfloat* comps;
};

class TGroup : public Group {
public:
    TGroup();
    virtual void add(Node* child);
    virtual void markDirty();
    virtual bool isParent();
};

class TRect : public Rect {
public:
    TRect();
    virtual void draw(GFX* gfx);
    virtual Bounds* getBounds();
};

class TBounds : public Bounds {
public:
    virtual float getX2();
    virtual float getY2();
};


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
};

class FontShader: public Shader {
public:
    FontShader();
    virtual void apply(GLfloat modelView[16], GLfloat trans[16], char* text);
    int prog;
    GLint u_matrix, u_trans;
    GLint attr_pos;
    GLint attr_texcoords, attr_tex, texID;
};

class TextureShader: public Shader {
public:
    TextureShader();
    virtual void apply(GLfloat modelView[16], GLfloat trans[16], GLfloat verts[][2], GLfloat texcoords[][2]);
    int prog;
    GLint u_matrix, u_trans;
    GLint attr_pos;
    GLint attr_texcoords, attr_tex, texID;
};


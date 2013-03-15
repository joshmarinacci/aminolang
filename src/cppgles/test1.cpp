#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>

#include "build/cpp/out.h"
#include "src/cppgles/impl.h"

using android::sp;

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

int main(int argc, char** argv) {
    printf("i'm the C++ program here.\n");
    
    
    TCore* core = new TCore();   
    Stage* stage = core->createStage();    
    
    TRect* r1 = new TRect();
    r1->setTx(720/2);
    r1->setTy(1280/2);
    r1->setW(720/2);
    r1->setH(1280/2);
    r1->setFill(new TColor(1,0,0));
    
    TRect* r2 = new TRect();
    r2->setTx(0);
    r2->setTy(0);
    r2->setW(720/2);
    r2->setH(1280/2);
    r2->setFill(new TColor(0,1,1));
    
    
    TRect* r3 = new TRect();
    r3->setTx(720/2);
    r3->setTy(1280/2);
    r3->setW(100);
    r3->setH(100);
    r3->setFill(new TColor(0,1,0));
    
    
    TGroup* g = new TGroup();
    g->add(r1);
    g->add(r2);
    g->add(r3);
    
    stage->setRoot(g);
    
    core->start();
}

#define ASSERT_EQ(A, B) {if ((A) != (B)) {printf ("ERROR: %d\n", __LINE__); exit(9); }}
#define ASSERT_NE(A, B) {if ((A) == (B)) {printf ("ERROR: %d\n", __LINE__); exit(9); }}
#define EXPECT_TRUE(A) {if ((A) == 0) {printf ("ERROR: %d\n", __LINE__); exit(9); }}

// graphics setup statics
static EGLDisplay mEglDisplay = EGL_NO_DISPLAY;
static EGLSurface mEglSurface = EGL_NO_SURFACE;
static EGLContext mEglContext = EGL_NO_CONTEXT;
static sp<android::SurfaceComposerClient> mSession;
static sp<android::SurfaceControl>        mControl;
static sp<android::Surface>               mAndroidSurface;

//globals for shaders
static GLint attr_pos = 0, attr_color = 1;
static GLint u_matrix = -1;
static GLint u_trans  = -1;

//globals for geom
static GLfloat view_rotx = 0.0, view_roty = 0.0;



void klaatu_init_graphics(int *width, int *height)
{
  
    android::DisplayInfo display_info;


// initial part shamelessly stolen from klaatu-api
  static EGLint sDefaultContextAttribs[] = {
    EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE };
  static EGLint sDefaultConfigAttribs[] = {
    EGL_SURFACE_TYPE, EGL_PBUFFER_BIT, EGL_RENDERABLE_TYPE, EGL_OPENGL_ES2_BIT,
    EGL_RED_SIZE, 8, EGL_GREEN_SIZE, 8, EGL_BLUE_SIZE, 8, EGL_ALPHA_SIZE, 8,
    EGL_DEPTH_SIZE, 16, EGL_STENCIL_SIZE, 8, EGL_NONE };


    mSession = new android::SurfaceComposerClient();
  int status = mSession->getDisplayInfo(0, &display_info);
  *width = display_info.w;
  *height = display_info.h;
  mControl = mSession->createSurface(
      0, *width, *height, android::PIXEL_FORMAT_RGB_888);
  android::SurfaceComposerClient::openGlobalTransaction();
  mControl->setLayer(0x40000000);
  android::SurfaceComposerClient::closeGlobalTransaction();
  mAndroidSurface = mControl->getSurface();
  EGLNativeWindowType eglWindow = mAndroidSurface.get();
  mEglDisplay = eglGetDisplay(EGL_DEFAULT_DISPLAY);
  ASSERT_EQ(EGL_SUCCESS, eglGetError());
  ASSERT_NE(EGL_NO_DISPLAY, mEglDisplay);
  EGLint majorVersion, minorVersion;
  EXPECT_TRUE(eglInitialize(mEglDisplay, &majorVersion, &minorVersion));
  ASSERT_EQ(EGL_SUCCESS, eglGetError());
  printf("EglVersion %d:%d\n", majorVersion, minorVersion);

  EGLint numConfigs = 0;
  EGLConfig  mGlConfig;
  EXPECT_TRUE(eglChooseConfig(mEglDisplay, sDefaultConfigAttribs, &mGlConfig, 1, &numConfigs));
  printf("numConfigs %d\n", numConfigs);
  mEglSurface = eglCreateWindowSurface(mEglDisplay, mGlConfig, eglWindow, NULL);
  ASSERT_EQ(EGL_SUCCESS, eglGetError());
  ASSERT_NE(EGL_NO_SURFACE, mEglSurface);
  mEglContext = eglCreateContext(mEglDisplay, mGlConfig, EGL_NO_CONTEXT, sDefaultContextAttribs);
  ASSERT_EQ(EGL_SUCCESS, eglGetError());
  ASSERT_NE(EGL_NO_CONTEXT, mEglContext);
  EXPECT_TRUE(eglMakeCurrent(mEglDisplay, mEglSurface, mEglSurface, mEglContext));
  ASSERT_EQ(EGL_SUCCESS, eglGetError());
  

}


static void
create_shaders(void)
{
   static const char *fragShaderText =
      "precision mediump float;\n"
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

   GLuint fragShader, vertShader, program;
   GLint stat;


   fragShader = glCreateShader(GL_FRAGMENT_SHADER);
   glShaderSource(fragShader, 1, (const char **) &fragShaderText, NULL);
   glCompileShader(fragShader);
   glGetShaderiv(fragShader, GL_COMPILE_STATUS, &stat);
   if (!stat) {
      printf("Error: fragment shader did not compile!\n");
      exit(1);
   }

   vertShader = glCreateShader(GL_VERTEX_SHADER);
   glShaderSource(vertShader, 1, (const char **) &vertShaderText, NULL);
   glCompileShader(vertShader);
   glGetShaderiv(vertShader, GL_COMPILE_STATUS, &stat);
   if (!stat) {
      printf("Error: vertex shader did not compile!\n");
      exit(1);
   }

   program = glCreateProgram();
   glAttachShader(program, fragShader);
   glAttachShader(program, vertShader);
   glLinkProgram(program);

   glGetProgramiv(program, GL_LINK_STATUS, &stat);
   if (!stat) {
      char log[1000];
      GLsizei len;
      glGetProgramInfoLog(program, 1000, &len, log);
      printf("Error: linking:\n%s\n", log);
      exit(1);
   }

   glUseProgram(program);

   if (1) {
      /* test setting attrib locations */
      glBindAttribLocation(program, attr_pos, "pos");
      glBindAttribLocation(program, attr_color, "color");
      glLinkProgram(program);  /* needed to put attribs into effect */
   }
   else {
      /* test automatic attrib locations */
      attr_pos = glGetAttribLocation(program, "pos");
      attr_color = glGetAttribLocation(program, "color");
   }

   u_matrix = glGetUniformLocation(program, "modelviewProjection");
   u_trans  = glGetUniformLocation(program, "trans");
   printf("Uniform modelviewProjection at %d\n", u_matrix);
   printf("Uniform trans at %d\n", u_trans);
   printf("Attrib pos at %d\n", attr_pos);
   printf("Attrib color at %d\n", attr_color);
}


static void
make_z_rot_matrix(GLfloat angle, GLfloat *m)
{
   float c = cos(angle * M_PI / 180.0);
   float s = sin(angle * M_PI / 180.0);
   int i;
   for (i = 0; i < 16; i++)
      m[i] = 0.0;
   m[0] = m[5] = m[10] = m[15] = 1.0;

   m[0] = c;
   m[1] = s;
   m[4] = -s;
   m[5] = c;
}

static void
make_scale_matrix(GLfloat xs, GLfloat ys, GLfloat zs, GLfloat *m)
{
   int i;
   for (i = 0; i < 16; i++)
      m[i] = 0.0;
   m[0] = xs;
   m[5] = ys;
   m[10] = zs;
   m[15] = 1.0;
}


static void
make_identity_matrix(GLfloat *m) {
   int i;
   for (i = 0; i < 16; i++)
      m[i] = 0.0;
    m[0] = 1;
    m[5] = 1;
    m[10] = 1;
    m[15] = 1;
}

static void 
make_trans_matrix(GLfloat x, GLfloat y, GLfloat *m)
{
    make_identity_matrix(m);
    m[12] = x;
    m[13] = y;
}

static void
mul_matrix(GLfloat *prod, const GLfloat *a, const GLfloat *b)
{
#define A(row,col)  a[(col<<2)+row]
#define B(row,col)  b[(col<<2)+row]
#define P(row,col)  p[(col<<2)+row]
   GLfloat p[16];
   GLint i;
   for (i = 0; i < 4; i++) {
      const GLfloat ai0=A(i,0),  ai1=A(i,1),  ai2=A(i,2),  ai3=A(i,3);
      P(i,0) = ai0 * B(0,0) + ai1 * B(1,0) + ai2 * B(2,0) + ai3 * B(3,0);
      P(i,1) = ai0 * B(0,1) + ai1 * B(1,1) + ai2 * B(2,1) + ai3 * B(3,1);
      P(i,2) = ai0 * B(0,2) + ai1 * B(1,2) + ai2 * B(2,2) + ai3 * B(3,2);
      P(i,3) = ai0 * B(0,3) + ai1 * B(1,3) + ai2 * B(2,3) + ai3 * B(3,3);
   }
   memcpy(prod, p, sizeof(p));
#undef A
#undef B
#undef PROD
}




Stage* TCore::createStage(){
    _stage = new TStage();
    return _stage;
  }
  
  
ColorShader* colorShader;

void TCore::start() {
    printf("the core is starting\n");
    int winWidth = 300, winHeight = 300;
    EGLint egl_major, egl_minor;
    const char *s;
    
    klaatu_init_graphics( &winWidth, &winHeight);
    if (!mEglDisplay) {
        printf("Error: eglGetDisplay() failed\n");
    }
    
    s = eglQueryString(mEglDisplay, EGL_VERSION);
    printf("EGL_VERSION = %s\n", s);
    
    s = eglQueryString(mEglDisplay, EGL_VENDOR);
    printf("EGL_VENDOR = %s\n", s);
    
    s = eglQueryString(mEglDisplay, EGL_EXTENSIONS);
    printf("EGL_EXTENSIONS = %s\n", s);
    
    s = eglQueryString(mEglDisplay, EGL_CLIENT_APIS);
    printf("EGL_CLIENT_APIS = %s\n", s);
    
    printf("GL_RENDERER   = %s\n", (char *) glGetString(GL_RENDERER));
    printf("GL_VERSION    = %s\n", (char *) glGetString(GL_VERSION));
    printf("GL_VENDOR     = %s\n", (char *) glGetString(GL_VENDOR));
    printf("GL_EXTENSIONS = %s\n", (char *) glGetString(GL_EXTENSIONS));

    
    glClearColor(1.0, 1.0, 1.0, 1.0);

    create_shaders();
    colorShader = new ColorShader();
    
    for (;;) {
        _stage->draw();
        eglSwapBuffers(mEglDisplay, mEglSurface);
    } 
}

void drawIt(GLGFX* gfx, Node* root) {
    if(!root->getVisible()) return;
    gfx->save();
    gfx->translate(root->getTx(), root->getTy());
    root->draw(gfx);
    if(root->isParent()) {
        Group* group = (Group*)root;
        for(int i=0; i<group->nodes.size(); i++) {
            Node* child = (Node*)group->nodes.at(i);
            drawIt(gfx,child);
        }
    }
    gfx->restore();
}
    
void TStage::draw() {
    GLfloat mat[16], rot[16], scale[16], trans[16];
    
    // Set the modelview/projection matrix
    make_trans_matrix(-720/2,-1280/2,trans);
    //make_z_rot_matrix(view_rotx, rot);
    float sc = 0.00162;
    make_scale_matrix(sc*1.73,sc,sc, scale);
    mul_matrix(mat, scale, trans);
    glUniformMatrix4fv(u_matrix, 1, GL_FALSE, mat);
    
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
   
   
    GLGFX* gfx = new GLGFX();
    drawIt(gfx,root);
    delete gfx;
}


GLGFX::GLGFX() {
    transform = new GLfloat[16];
    make_identity_matrix(transform);
}
void GLGFX::save() {
    GLfloat* t2 = new GLfloat[16];
    for(int i=0; i<16; i++) {
        t2[i] = transform[i];
    }
    matrixStack.push(transform);
    transform = t2;
}

void GLGFX::restore() {
    transform = (GLfloat*)matrixStack.top();
    matrixStack.pop();
}

void printMat(GLfloat *m) {
    printf("matrix: ");
    for(int i=0; i<16; i++) {
        printf(" %2.2f",m[i]);
    }
    printf("\n");
}
void GLGFX::translate(double x, double y) {
    GLfloat tr[16];
    GLfloat trans2[16];
    make_trans_matrix((float)x,(float)y,tr);
    mul_matrix(trans2, transform, tr);
    for (int i = 0; i < 16; i++) transform[i] = trans2[i];
}

void colorShaderApply(GLfloat verts[][2], GLfloat colors[][3]) {
    glVertexAttribPointer(attr_pos,   2, GL_FLOAT, GL_FALSE, 0, verts);
    glVertexAttribPointer(attr_color, 3, GL_FLOAT, GL_FALSE, 0, colors);
    glEnableVertexAttribArray(attr_pos);
    glEnableVertexAttribArray(attr_color);
    
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray(attr_pos);
    glDisableVertexAttribArray(attr_color);
}    

void GLGFX::fillQuadColor(Color* color, Bounds* bounds) {
    float x =  bounds->getX();
    float y =  bounds->getY();
    float x2 = ((TBounds*)bounds)->getX2();
    float y2 = ((TBounds*)bounds)->getY2();

    
    GLfloat verts[6][2];
    GLfloat colors[6][3];
    
    TColor* tcol = (TColor*)color;
    
    for(int i=0; i<6; i++) {
        for(int j=0; j<3; j++) {
            colors[i][j] = tcol->comps[j];
        }
    }
    
    static GLfloat sverts[6][2] = {
      { -1, -1 },
      {  1, -1 },
      {  1,  1 },
      {  1,  1 },
      { -1,  1 },
      { -1, -1 }
    };
    
    static GLfloat scolors[6][3] = {
      { 1, 0, 0 },
      { 1, 0, 0 },
      { 1, 0, 0 },
      { 1, 0, 0 },
      { 1, 0, 0 },
      { 1, 0, 0 }
    };
    
    for(int i=0; i<6; i++) {
        for(int j=0; j<2; j++) {
            verts[i][j] = sverts[i][j];
        }
    }
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
    
//    glUniformMatrix4fv(u_trans, 1, GL_FALSE, transform);
    colorShader->apply(transform,verts,colors);
//    colorShaderApply(verts,colors);
    
/*
            float x = (float)bounds.getX();
            float y = (float)bounds.getY();
            float x2 = bounds.getX2();
            float y2 = bounds.getY2();
            FloatBuffer verts = Buffers.newDirectFloatBuffer(new float[]{
                    x, y,
                    x2, y,
                    x2, y2,
                    x2, y2,
                    x, y2,
                    x, y
            });
            FloatBuffer colors = Buffers.newDirectFloatBuffer(new float[]{
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0
            });

            test2.colorShader.apply(gl,transform,verts,colors);
*/
}


/*
        public void fillQuadTexture(Tex tex, Bounds bounds,  Bounds textureBounds) {
            float x = (float)bounds.getX();
            float y = (float)bounds.getY();
            float x2 = bounds.getX2();
            float y2 = bounds.getY2();
            FloatBuffer verts = Buffers.newDirectFloatBuffer(new float[]{
                    x, y,
                    x2, y,
                    x2, y2,
                    x2, y2,
                    x, y2,
                    x, y
            });

            float iw = test2.textureShader.mainTexture.getImageWidth();
            float ih = test2.textureShader.mainTexture.getImageHeight();

            float tx  = (float)textureBounds.getX()/iw;
            float ty  = (float)textureBounds.getY()/ih;
            float tx2 = textureBounds.getX2()/iw;
            float ty2 = textureBounds.getY2()/ih;

            FloatBuffer texcoords = Buffers.newDirectFloatBuffer(new float[]{
                    tx,  ty,
                    tx2, ty,
                    tx2, ty2,
                    tx2, ty2,
                    tx,  ty2,
                    tx,  ty
            });
            test2.textureShader.apply(gl,transform,verts, texcoords);
        }
        public void fillQuadTexture(Tex tex, Bounds bounds, Bounds textureBounds, Insets insets) {
            //upper left
            float[] xs = new float[]{(float)bounds.getX(), insets.getLeft(), bounds.getX2() - insets.getRight(), bounds.getX2()};
            float[] ys = new float[]{(float)bounds.getY(), insets.getTop(), bounds.getY2() - insets.getBottom(), bounds.getY2()};
            for(int j=0; j<3; j++) {
                for (int i = 0; i < 3; i++) {
                    Bounds b2 = new Bounds(xs[i], ys[j], xs[i + 1]-xs[i], ys[j+1]-ys[j]);
                    fillQuadTexture(tex, b2, textureBounds);
                }
            }
        }
        public void fillQuadText(Color color, String text, double x, double y) {
            test2.fontShader.apply(gl,transform,text);
        }
*/


/*
TRect::TRect() {
}

void TRect::draw(GFX* gfx) {
    printf("creating a rect\n");
    
    static GLfloat sverts[6][2] = {
      { -1, -1 },
      {  1, -1 },
      {  1,  1 },
      {  1,  1 },
      { -1,  1 },
      { -1, -1 }
    };
    static GLfloat scolors[6][3] = {
      { 1, 0, 0 },
      { 0, 1, 0 },
      { 1, 0, 0 },
      { 0, 1, 0 },
      { 0, 1, 0 },
      { 0, 0, 1 }
    };
    
    for(int i=0; i<6; i++) {
        for(int j=0; j<2; j++) {
            verts[i][j] = sverts[i][j];
        }
        for(int j=0; j<3; j++) {
            colors[i][j] = scolors[i][j];
        }
    }
    verts[0][0] = x;
    verts[0][1] = y;
    verts[1][0] = x+w;
    verts[1][1] = y;
    verts[2][0] = x+w;
    verts[2][1] = y+h;
    
    verts[3][0] = x+w;
    verts[3][1] = y+h;
    verts[4][0] = x;
    verts[4][1] = y+h;
    verts[5][0] = x;
    verts[5][1] = y;
    
    glVertexAttribPointer(attr_pos,   2, GL_FLOAT, GL_FALSE, 0, &(verts));
    glVertexAttribPointer(attr_color, 3, GL_FLOAT, GL_FALSE, 0, &(colors));
    glEnableVertexAttribArray(attr_pos);
    glEnableVertexAttribArray(attr_color);
    
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray(attr_pos);
    glDisableVertexAttribArray(attr_color);
}
*/

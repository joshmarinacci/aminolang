#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>

#include <png.h>

#include "build/cpp/out.h"
#include "src/cppgles/impl.h"
#include "src/cppgles/events.h"

#include <time.h>


using android::sp;




class TEventManager : public EventManager {
public:
    vector<Callback*> callbacks;
    vector<void*> targets;
    virtual void on(void* type, void* target, Callback* fn) {
        targets.push_back(target);
        callbacks.push_back(fn);
    }
    virtual XEvent* createEvent() {
        return new Event();
    }

    virtual void fireEvent(XEvent* event) {
        Event* e = (Event*)event;
        //printf("firing event at %d %f %f\n",event->target, e->x, e->y); 
        for(int i=0; i<callbacks.size(); i++) {
            Callback* cb = callbacks.at(i);
            void* target = targets.at(i);
            if(event->target == target) {
                if(cb != NULL) {
                    cb->call(e);
                }
            }
        }
    }
};

static TEventManager* em = new TEventManager();

TRect* r1;
class J1Callback : public Callback {
public:
    virtual void call(void* obj) {
        printf("got a callback for rect at %f\n",r1->getTx());
        r1->setFill(new TColor(0,1,0));
    }
};


TRect* r2;
class J2Callback : public Callback {
public:
    virtual void call(void* obj) {
        Event* evt  = (Event*)obj;
        //printf("event point = %f %f\n",evt->deltaX,evt->deltaY);
        r2->setTx(r2->getTx()+evt->deltaX);
        r2->setTy(r2->getTy()+evt->deltaY);
    }
};
/*
int main(int argc, char** argv) {
    printf("i'm the C++ program here.\n");
    TCore* core = new TCore();   
    Stage* stage = core->createStage();    
    TGroup* g = new TGroup();
    
    r1 = new TRect();
    r1->setTx(720/2);
    r1->setTy(1280/2);
    r1->setW(720/2);
    r1->setH(1280/2);
    r1->setFill(new TColor(1,0,0));
    g->add(r1);
    //em->on(NULL,r1,new J1Callback());
    
    r2 = new TRect();
    r2->setTx(0);
    r2->setTy(0);
    r2->setW(720/2);
    r2->setH(1280/2);
    r2->setFill(new TColor(0,1,1));
    g->add(r2);
    em->on(NULL, r2, new J2Callback());
    
    
    PushButton* b1 = new TPushButton();
    b1->setTx(100);
    b1->setTy(100);
    b1->setW(200);
    b1->setH(100);
    g->add(b1);
    
    
    
    stage->setRoot(g);
    
    core->start();
}
*/

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

//globals for geom
static GLfloat view_rotx = 90, view_roty = 0.0;



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
    _stage->setEventManager(em);
    return _stage;
  }
  
void TStage::addAnim(PropAnim* anim) {
    anims.push_back(anim);
}

  
ColorShader* colorShader;
TextureShader* textureShader;
FontShader* fontShader;
EventSingleton* eventSingleton;

Node* findNode(Node* root, Point* pt) {
    //printf("  looking at ty %f pt = %f , %f\n",root->getTy(),pt->getX(),pt->getY());
    if(root == NULL) return NULL;
    if(!root->getVisible()) {return NULL;}
    
    Point* inner = new Point();
    inner->setX(pt->getX() - root->getTx());
    inner->setY(pt->getY() - root->getTy());
    
    
    if(root->isParent()) {
        Group* group = (Group*)root;
        for(int i=group->nodes.size()-1; i>=0; i--) {
            Node* child = (Node*)group->nodes.at(i);
            Node* ret = findNode(child, inner);
            if(ret != NULL) return ret;
        }
    }
    
    if(root->contains(inner)) {
        //printf("  contains! %f %f\n", root->getTy(), ((TRect*)root)->getW());
        return root;
    }
    return NULL;
}

class EVDispatcher : public EventSingleton {
public:
    bool down;
    TCore* core;
    EVDispatcher(TCore* inCore) {
        down = false;
        core = inCore;
    }
    float startX;
    float startY;
    float prevX;
    float prevY;
    virtual void touchStart(float rx, float ry, unsigned int tap_count=0) { 
        
        float x = ry/2;
        float y = 360-rx/2;
        
        Event* evt = (Event*)em->createEvent();
        evt->x = x;
        evt->y = y;
        Point* pt = new Point();
        pt->setX(x);
        pt->setY(y);
        evt->setPoint(pt);
        if(down) {
            //printf("touch moving\n");
            evt->deltaX = x-prevX;
            evt->deltaY = y-prevY;
            evt->type = MOVE;
        } else {
            //printf("touch starting\n");
            startX = x;
            startY = y;
            evt->deltaX = 0;
            evt->deltaY = 0;
            down = true;
            evt->type = PRESS;
        }
        
        //printf("looking\n");
        evt->target = findNode(core->_stage->getRoot(),pt);
        prevX = x;
        prevY = y;
        em->fireEvent(evt);
    }
    
    virtual void touchMove(float rx, float ry, unsigned int tap_count=0) { 
        float x = ry/2;
        float y = 360-rx/2;
        //printf("touch moving\n");
        Event* evt = (Event*)em->createEvent();
        evt->x = x;
        evt->y = y;
        evt->deltaX = x;
        evt->deltaY = y;
        Point* pt = new Point();
        pt->setX(x);
        pt->setY(y);
        evt->setPoint(pt);
        evt->target = findNode(core->_stage->getRoot(),pt);
        em->fireEvent(evt);
    }
    virtual void touchEnd(float rx, float ry, unsigned int tap_count=0) { 
        float x = ry/2;
        float y = 360-rx/2;
        //printf("touch ending\n");
        Event* evt = (Event*)em->createEvent();
        evt->x = x;
        evt->y = y;
        evt->deltaX = 0;
        evt->deltaY = 0;
        Point* pt = new Point();
        pt->setX(x);
        pt->setY(y);
        evt->setPoint(pt);
        evt->target = findNode(core->_stage->getRoot(),pt);
        evt->type = RELEASE;
        em->fireEvent(evt);
        down = false;
    }
};

void processAnims(TStage* stage) {
    for(int i=0; i<stage->anims.size(); i++) {
        TPropAnim* anim = (TPropAnim*)stage->anims.at(i);
        if(!anim->alive) continue;
        
        if(anim->startTime == -1) {
            anim->startTime = clock();
            anim->currTime = anim->startTime;
        } else {
            anim->currTime = clock();
        }
        
        float elapsed = ((float)(anim->currTime-anim->startTime))/((float)CLOCKS_PER_SEC);
        //printf("ellapsed = %f\n",elapsed);
        float t = elapsed / ((float)anim->getDuration()/1000.0);
        //printf("time = %f\n",t);
        if(t > 1) {
            anim->alive = false;
            t = 1;
        }
        float sv = anim->getStartvalue();
        float ev = anim->getEndvalue();
        float v = t*(ev-sv)+sv;
        //printf("v = %f\n",v);
        
        string prop = anim->getName();
        Node* target = anim->getTarget();
        if(prop == "tx") {
            target->setTx(v);
        }
        if(prop == "ty") {
            target->setTy(v);
        }
    }
}


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

    
    
    printf("window size = %d %d\n",winWidth,winHeight);
    
    
    eventSingleton = new EVDispatcher(this);
    enable_touch(winWidth,winHeight);


    
    glClearColor(1.0, 1.0, 1.0, 1.0);

    colorShader = new ColorShader();
    textureShader = new TextureShader();
    fontShader = new FontShader();
    
    for (;;) {
        if(event_indication) {
            event_process();
        }
        processAnims(_stage);
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
    
static GLfloat* modelView;
void TStage::draw() {
    GLfloat /*mat[16], */rot[16], scale[16], trans[16];
    modelView = new GLfloat[16];
    
    // Set the modelview/projection matrix
    //float sc = 0.0015;
    float sc = 0.0031;
    make_scale_matrix(sc*1.73,sc*-1,sc, scale);
    make_trans_matrix(-1280/4,-720/4,trans);
    make_z_rot_matrix(90, rot);
    
    GLfloat mat2[16];
    mul_matrix(mat2, scale, rot);
    mul_matrix(modelView, mat2, trans);
    
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
    
    colorShader->apply(modelView, transform,verts,colors);
}
void GLGFX::fillQuadText(char* text, double x, double y) {
    fontShader->apply(modelView,transform,text,x,y);
}
void GLGFX::fillQuadTexture(Bounds* bounds,  Bounds* textureBounds) {
    float x =  bounds->getX();
    float y =  bounds->getY();
    float x2 = ((TBounds*)bounds)->getX2();
    float y2 = ((TBounds*)bounds)->getY2();
    //printf("%f %f %f %f\n",bounds->getX(),bounds->getY(),bounds->getW(),bounds->getH());
    //printMat(transform);
    GLfloat verts[6][2];
    verts[0][0] = x;    verts[0][1] = y;
    verts[1][0] = x2;   verts[1][1] = y;
    verts[2][0] = x2;   verts[2][1] = y2;
    
    verts[3][0] = x2;   verts[3][1] = y2;
    verts[4][0] = x;    verts[4][1] = y2;
    verts[5][0] = x;    verts[5][1] = y;
    
    GLfloat texcoords[6][2];
    
    float tx = 0;
    float ty = 1;
    float tx2 = 1;
    float ty2 = 0;
    texcoords[0][0] = tx;    texcoords[0][1] = ty;
    texcoords[1][0] = tx2;   texcoords[1][1] = ty;
    texcoords[2][0] = tx2;   texcoords[2][1] = ty2;
    
    texcoords[3][0] = tx2;   texcoords[3][1] = ty2;
    texcoords[4][0] = tx;    texcoords[4][1] = ty2;
    texcoords[5][0] = tx;    texcoords[5][1] = ty;

    textureShader->apply(modelView,transform,verts,texcoords);
}


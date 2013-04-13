#include <node.h>

#include "core.h"

#include <math.h>
#include <time.h>

using android::sp;

static EGLDisplay mEglDisplay = EGL_NO_DISPLAY;
static EGLSurface mEglSurface = EGL_NO_SURFACE;
static EGLContext mEglContext = EGL_NO_CONTEXT;
static sp<android::SurfaceComposerClient> mSession;
static sp<android::SurfaceControl>        mControl;
static sp<android::Surface>               mAndroidSurface;


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

class KlaatuCore : public NodeCore , public node::ObjectWrap{
public:
    virtual void start() {
    }
    
    
    static v8::Handle<v8::Value> real_OpenWindow(const v8::Arguments& args) {
        HandleScope scope;
        return scope.Close(Undefined());
    }
    
    static v8::Handle<v8::Value> real_Start(const v8::Arguments& args) {
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
        printf(" window size = %d %d\n",winWidth,winHeight);
        glClearColor(1.0, 1.0, 1.0, 1.0);
    
        HandleScope scope;
        colorShader = new ColorShader();
        Local<Function> drawCB = Local<Function>::Cast(args[0]);        
        Local<Function> eventCB = Local<Function>::Cast(args[1]);
        
        modelView = new GLfloat[16];
        printf("starting\n");
        for (;;) {
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            GLfloat mat[16];
            loadOrthoMatrix(modelView, 0, 720, 1280, 0, 0, 100);
            
            /*
            GLGFX* glgfx = new GLGFX();
            glgfx->fillQuadColor(NULL, new Bounds(0,0,50,50));
            delete glgfx;
            */
            
            //create a wrapper template for gfx
            Handle<ObjectTemplate> point_templ = ObjectTemplate::New();
            point_templ->SetInternalFieldCount(1);
            point_templ->Set(String::NewSymbol("fillQuadColor"),FunctionTemplate::New(GLGFX::node_fillQuadColor)->GetFunction());
            
            GLGFX* gfx = new GLGFX();
            Local<Object> obj = point_templ->NewInstance();
            obj->SetInternalField(0, External::New(gfx));
            Handle<Value> argv[] = { obj };
            drawCB->Call(Context::GetCurrent()->Global(), 1, argv);
            delete gfx;

            eglSwapBuffers(mEglDisplay, mEglSurface);
        } 
        return scope.Close(Undefined());
    }
    
    static void Init() {
        Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
        tpl->SetClassName(String::NewSymbol("Core"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);
        tpl->PrototypeTemplate()->Set(String::NewSymbol("real_OpenWindow"),FunctionTemplate::New(real_OpenWindow)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("real_Start"),FunctionTemplate::New(real_Start)->GetFunction());
        constructor = Persistent<Function>::New(tpl->GetFunction());
    }
    static Handle<Value> NewInstance(const Arguments& args) {
      HandleScope scope;
      const unsigned argc = 1;
      Handle<Value> argv[argc] = { args[0] };
      Local<Object> instance = constructor->NewInstance(argc, argv);
      return scope.Close(instance);
    }
    
    //wrap the real constructor
    static Handle<Value> New(const Arguments& args) {
      HandleScope scope;
      KlaatuCore* obj = new KlaatuCore();
      obj->start();
      //obj->real_OpenWindow(args);
      obj->Wrap(args.This());
      return args.This();
    }
    
    
};


Handle<Value> CreateObject(const Arguments& args) {
    HandleScope scope;
    return scope.Close(KlaatuCore::NewInstance(args));
}

//a simple test that opens a 400x400 window
//and draws a grey rect on a black background
Handle<Value> TestNative(const Arguments& args) {
    printf("in TestNative\n");
    
    HandleScope scope;
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
    printf(" window size = %d %d\n",winWidth,winHeight);
    glClearColor(1.0, 1.0, 1.0, 1.0);
    colorShader = new ColorShader();
    modelView = new GLfloat[16];
    for (;;) {
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        GLfloat mat[16];
        loadOrthoMatrix(modelView, 0, 720, 1280, 0, 0, 100);
        
        GLGFX* glgfx = new GLGFX();
        glgfx->fillQuadColor(1,1,1, new Bounds(0,0,50,50));
        delete glgfx;
        
        eglSwapBuffers(mEglDisplay, mEglSurface);
    } 
    return scope.Close(Undefined());
}


void InitAll(Handle<Object> exports, Handle<Object> module) {
    KlaatuCore::Init();
    exports->Set(String::NewSymbol("testNative"),FunctionTemplate::New(TestNative)->GetFunction());  
    exports->Set(String::NewSymbol("createCore"),FunctionTemplate::New(CreateObject)->GetFunction());
  //exports->Set(String::NewSymbol("testNative"),FunctionTemplate::New(TestNative)->GetFunction());
}

NODE_MODULE(aminonative, InitAll)


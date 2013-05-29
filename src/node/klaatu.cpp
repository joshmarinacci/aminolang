#include <node.h>
#include <math.h>
#include <time.h>


#include "core.h"

using android::sp;

static EGLDisplay mEglDisplay = EGL_NO_DISPLAY;
static EGLSurface mEglSurface = EGL_NO_SURFACE;
static EGLContext mEglContext = EGL_NO_CONTEXT;
static sp<android::SurfaceComposerClient> mSession;
static sp<android::SurfaceControl>        mControl;
static sp<android::Surface>               mAndroidSurface;

static int audioCount = 0;
static double elapsedTime;
static int elapsedCount;

void klaatu_init_graphics(int *width, int *height)
{
  
    android::DisplayInfo display_info;

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
  printf("width and height = %d %d\n",*width, *height);
  mControl = mSession->createSurface(0,
      *width, *height, android::PIXEL_FORMAT_RGB_888, 0);
  printf("done with surface s\n");
  
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

static int winWidth;
static int winHeight;
class KlaatuCore : public NodeCore , public node::ObjectWrap{
public:
    virtual void start() {
        printf("started the KlaatuCore\n");
    }
    static v8::Handle<v8::Value> real_Init(const v8::Arguments& args) {
        HandleScope scope;
        printf("doing real Klaatu init\n");
        EGLint egl_major, egl_minor;
        const char *s;
        printf("about to init screen\n");
        klaatu_init_graphics( &winWidth, &winHeight);
        if (!mEglDisplay) {
            printf("Error: eglGetDisplay() failed\n");
        }
        glClearColor(1.0, 1.0, 1.0, 1.0);
        colorShader = new ColorShader();
        modelView = new GLfloat[16];
        printf("=== about to create a memory leak\n");
        void* leak2 = malloc(5000);
        printf("=== allocated 10k of memory\n");
        printf("finishing up with init\n");
        
        
        printf("doing a quick test draw\n");
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        GLfloat ortho[16], rot[16], trans[16], temp1[16], idmat[16], proj[16];
        printf("loading identity\n");
        make_identity_matrix(idmat);
        printf("loading pixel perfect\n");
        loadPixelPerfect(proj, winWidth, winHeight, 500, 100, -1000);
        printf("doing mul matrix\n");
        mul_matrix(modelView, proj, idmat);
        printf("creating a new instance\n");
        
        Handle<Value> obj = GLGFX::NewInstance(args);
        GLGFX* gfx = node::ObjectWrap::Unwrap<GLGFX>(obj->ToObject());        
        gfx->scale(1,-1);
        gfx->translate(-winWidth/2,-winHeight/2);
        
        printf("about to swap buffers\n");
        
        eglSwapBuffers(mEglDisplay, mEglSurface);
        printf("swapped the buffers. returning to node side\n");
        return scope.Close(Undefined());
    }
    
    static v8::Handle<v8::Value> real_Repaint(const v8::Arguments& args) {
        printf("inside real_Repaint\n");
        HandleScope scope;
        return scope.Close(Undefined());
    }
    
    static void Init() {
        elapsedTime = 0;
        elapsedCount = 0;
        Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
        tpl->SetClassName(String::NewSymbol("Core"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);
        tpl->PrototypeTemplate()->Set(String::NewSymbol("real_Init"),FunctionTemplate::New(real_Init)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("real_Repaint"),FunctionTemplate::New(real_Repaint)->GetFunction());
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
      obj->Wrap(args.This());
      return args.This();
    }
    
    
};

Handle<Value> CreateObject(const Arguments& args) {
    HandleScope scope;
    return scope.Close(KlaatuCore::NewInstance(args));
}

void InitAll(Handle<Object> exports, Handle<Object> module) {
    KlaatuCore::Init();
    GLGFX::Init();
    exports->Set(String::NewSymbol("createCore"),FunctionTemplate::New(CreateObject)->GetFunction());
}



NODE_MODULE(aminonative, InitAll)


#include <node.h>

#include "core.h"

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

class MacCore : public NodeCore , public node::ObjectWrap{
public:
    virtual void start() {
    }
    
    
    static v8::Handle<v8::Value> real_OpenWindow(const v8::Arguments& args) {
        HandleScope scope;
        return scope.Close(Undefined());
    }
    
    static v8::Handle<v8::Value> real_Start(const v8::Arguments& args) {
        HandleScope scope;
        colorShader = new ColorShader();
        Local<Function> drawCB = Local<Function>::Cast(args[0]);        
        Local<Function> eventCB = Local<Function>::Cast(args[1]);
        
        printf("starting\n");
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
      MacCore* obj = new MacCore();
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
    printf("window size = %d %d\n",winWidth,winHeight);
    glClearColor(1.0, 1.0, 1.0, 1.0);
    colorShader = new ColorShader();
    for (;;) {
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
        gfx->fillQuadColor(NULL, new Bounds(0,0,50,50);
        delete gfx;
        eglSwapBuffers(mEglDisplay, mEglSurface);
    } 
    return scope.Close(Undefined());
}
    


void InitAll(Handle<Object> exports, Handle<Object> module) {
  KlaatuCore::Init();
  exports->Set(String::NewSymbol("createCore"),FunctionTemplate::New(CreateObject)->GetFunction());
  exports->Set(String::NewSymbol("testNative"),FunctionTemplate::New(TestNative)->GetFunction());
}

NODE_MODULE(amino, InitAll)


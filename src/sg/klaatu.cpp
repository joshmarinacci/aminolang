#include "base.h"
#include "klaatu_events.h"
#include <binder/ProcessState.h>


static float near = 150;
static float far = -300;
static float eye = 600;

using android::sp;
using android::ProcessState;

static EGLDisplay mEglDisplay = EGL_NO_DISPLAY;
static EGLSurface mEglSurface = EGL_NO_SURFACE;
static EGLContext mEglContext = EGL_NO_CONTEXT;
static sp<android::SurfaceComposerClient> mSession;
static sp<android::SurfaceControl>        mControl;
static sp<android::Surface>               mAndroidSurface;


void klaatu_init_graphics(int *width, int *height)
{
  
    android::DisplayInfo display_info;
    
    printf("initting klaatu graphics\n");


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
  
  mControl = mSession->createSurface(0,
      *width, *height, android::PIXEL_FORMAT_RGB_888, 0);
  
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

  EGLint numConfigs = 0;
  EGLConfig  mGlConfig;
  EXPECT_TRUE(eglChooseConfig(mEglDisplay, sDefaultConfigAttribs, &mGlConfig, 1, &numConfigs));
  mEglSurface = eglCreateWindowSurface(mEglDisplay, mGlConfig, eglWindow, NULL);
  ASSERT_EQ(EGL_SUCCESS, eglGetError());
  ASSERT_NE(EGL_NO_SURFACE, mEglSurface);
  mEglContext = eglCreateContext(mEglDisplay, mGlConfig, EGL_NO_CONTEXT, sDefaultContextAttribs);
  ASSERT_EQ(EGL_SUCCESS, eglGetError());
  ASSERT_NE(EGL_NO_CONTEXT, mEglContext);
  EXPECT_TRUE(eglMakeCurrent(mEglDisplay, mEglSurface, mEglSurface, mEglContext));
  ASSERT_EQ(EGL_SUCCESS, eglGetError());
  
}

Handle<Value> init(const Arguments& args) {
	matrixStack = std::stack<void*>();
    HandleScope scope;
    

    EGLint egl_major, egl_minor;
    const char *s;
    klaatu_init_graphics( &width, &height);
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
    printf(" window size = %d %d\n",width,height);
    
    
    return scope.Close(Undefined());
}


EventSingleton* eventSingleton;
class EVDispatcher : public EventSingleton {
public:
    bool down;
    EVDispatcher() {
        down = false;
    }
    virtual void touchStart(float rx, float ry, unsigned int tap_count=0) { 
        if(!eventCallbackSet) warnAbort("WARNING. Event callback not set");
        if(down) {
            //printf("touch moving\n");
            Local<Object> event = Object::New();
            event->Set(String::NewSymbol("type"), String::New("mouseposition"));
            event->Set(String::NewSymbol("x"), Number::New(rx));
            event->Set(String::NewSymbol("y"), Number::New(ry));
            Handle<Value> argv[] = {event};
            NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, argv);
        } else {
            down = true;
            //printf("touch starting\n");
            Local<Object> event = Object::New();
            Handle<Value> argv[] = {event};
            
            event->Set(String::NewSymbol("type"), String::New("mouseposition"));
            event->Set(String::NewSymbol("x"), Number::New(rx));
            event->Set(String::NewSymbol("y"), Number::New(ry));
            NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, argv);
            
            event->Set(String::NewSymbol("type"), String::New("mousebutton"));
            event->Set(String::NewSymbol("button"), Number::New(0));
            event->Set(String::NewSymbol("state"), Number::New(1));
            NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, argv);
            
        }
    }
    virtual void touchMove(float rx, float ry, unsigned int tap_count=0) { 
        if(!eventCallbackSet) warnAbort("WARNING. Event callback not set");
        //printf("touch moving\n");
    }
    virtual void touchEnd(float rx, float ry, unsigned int tap_count=0) { 
        if(!eventCallbackSet) warnAbort("WARNING. Event callback not set");
        //printf("touch ending\n");
        Local<Object> event = Object::New();
        event->Set(String::NewSymbol("type"), String::New("mousebutton"));
        event->Set(String::NewSymbol("button"), Number::New(0));
        event->Set(String::NewSymbol("state"), Number::New(0));
        Handle<Value> argv[] = {event};
        NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, argv);
        down = false;
    }
};

Handle<Value> createWindow(const Arguments& args) {
    HandleScope scope;
    
    colorShader = new ColorShader();
    textureShader = new TextureShader();
    fontShader = new FontShader();
    eventSingleton = new EVDispatcher();
    printf("enabling touch with screen size %d %d\n",width,height);
    enable_touch(width,height);
    
    modelView = new GLfloat[16];
    globaltx = new GLfloat[16];
    make_identity_matrix(globaltx);
    
    //have to start the threadpool first or we will get no sound
    ProcessState::self()->startThreadPool();
    glViewport(0,0,width, height);
    return scope.Close(Undefined());
}


// JOSH: NO-OP.  This is here just to match the desktop equivalents
Handle<Value> setWindowSize(const Arguments& args) {
    HandleScope scope;
    return scope.Close(Undefined());
}

static const bool DEBUG_RENDER_LOOP = false;
void render() {
    if(DEBUG_RENDER_LOOP) {    printf("processing events\n"); }
    if(event_indication) {
        //((EVDispatcher*)eventSingleton)->cb = NODE_EVENT_CALLBACK;
        event_process();
    }
    
    
    if(DEBUG_RENDER_LOOP) { printf("processing updates\n"); }
    for(int j=0; j<updates.size(); j++) {
        updates[j]->apply();
    }
    updates.clear();


    GLfloat* scaleM = new GLfloat[16];
    make_scale_matrix(1,-1,1,scaleM);
    //make_scale_matrix(1,1,1,scaleM);
    GLfloat* transM = new GLfloat[16];
    make_trans_matrix(-width/2,height/2,0,transM);
    //make_trans_matrix(10,10,0,transM);
    //make_trans_matrix(0,0,0,transM);
    
    GLfloat* m4 = new GLfloat[16];
    mul_matrix(m4, transM, scaleM); 


    GLfloat* pixelM = new GLfloat[16];
//    loadPixelPerfect(pixelM, width, height, 600, 100, -150);
    loadPixelPerfect(pixelM, width, height, eye, near, far);
    //printf("eye = %f\n",eye);
    //loadPerspectiveMatrix(pixelM, 45, 1, 10, -100);
    
//    GLfloat* m5 = new GLfloat[16];
    //transpose(m5,pixelM);
    
    mul_matrix(modelView,pixelM,m4);
    make_identity_matrix(globaltx);
    glViewport(0,0,width, height);

    glClearColor(1,1,1,1);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glDisable(GL_DEPTH_TEST);
    
    if(DEBUG_RENDER_LOOP) { printf("processing anims\n"); }

    for(int j=0; j<anims.size(); j++) {
        anims[j]->update();
    }
    
    if(DEBUG_RENDER_LOOP) { printf("processing drawing\n"); }

    AminoNode* root = rects[rootHandle];
    root->draw();
    
    //glfwSwapBuffers();
    eglSwapBuffers(mEglDisplay, mEglSurface);
}


Handle<Value> tick(const Arguments& args) {
    HandleScope scope;
    render();
    return scope.Close(Undefined());
}


Handle<Value> selfDrive(const Arguments& args) {
    HandleScope scope;
    for(int i =0; i<100; i++) {
        render();
    }
    return scope.Close(Undefined());
}

Handle<Value> setEventCallback(const Arguments& args) {
    HandleScope scope;
    eventCallbackSet = true;
    NODE_EVENT_CALLBACK = Persistent<Function>::New(Handle<Function>::Cast(args[0]));
    return scope.Close(Undefined());
}


void InitAll(Handle<Object> exports, Handle<Object> module) {
    exports->Set(String::NewSymbol("init"),             FunctionTemplate::New(init)->GetFunction());
    exports->Set(String::NewSymbol("createWindow"),     FunctionTemplate::New(createWindow)->GetFunction());
    exports->Set(String::NewSymbol("setWindowSize"),    FunctionTemplate::New(setWindowSize)->GetFunction());
    exports->Set(String::NewSymbol("createRect"),       FunctionTemplate::New(createRect)->GetFunction());
    exports->Set(String::NewSymbol("createGroup"),      FunctionTemplate::New(createGroup)->GetFunction());
    exports->Set(String::NewSymbol("createText"),       FunctionTemplate::New(createText)->GetFunction());
    exports->Set(String::NewSymbol("createAnim"),       FunctionTemplate::New(createAnim)->GetFunction());
    exports->Set(String::NewSymbol("stopAnim"),         FunctionTemplate::New(stopAnim)->GetFunction());
    exports->Set(String::NewSymbol("updateProperty"),   FunctionTemplate::New(updateProperty)->GetFunction());
    exports->Set(String::NewSymbol("updateAnimProperty"),FunctionTemplate::New(updateAnimProperty)->GetFunction());
    exports->Set(String::NewSymbol("addNodeToGroup"),   FunctionTemplate::New(addNodeToGroup)->GetFunction());
    exports->Set(String::NewSymbol("tick"),             FunctionTemplate::New(tick)->GetFunction());
    exports->Set(String::NewSymbol("selfDrive"),        FunctionTemplate::New(selfDrive)->GetFunction());
    exports->Set(String::NewSymbol("setEventCallback"), FunctionTemplate::New(setEventCallback)->GetFunction());
    exports->Set(String::NewSymbol("setRoot"),          FunctionTemplate::New(setRoot)->GetFunction());
    exports->Set(String::NewSymbol("loadPngToTexture"), FunctionTemplate::New(loadPngToTexture)->GetFunction());   
    exports->Set(String::NewSymbol("loadJpegToTexture"),FunctionTemplate::New(loadJpegToTexture)->GetFunction());
    exports->Set(String::NewSymbol("createNativeFont"), FunctionTemplate::New(createNativeFont)->GetFunction());
}

NODE_MODULE(sgtest, InitAll)


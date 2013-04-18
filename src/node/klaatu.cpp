#include <node.h>
#include <math.h>
#include <time.h>

#include <media/mediaplayer.h>
#include <binder/ProcessState.h>

#include "core.h"
#include "klaatu_events.h"

using android::sp;
using android::ProcessState;
using android::MediaPlayer;

static EGLDisplay mEglDisplay = EGL_NO_DISPLAY;
static EGLSurface mEglSurface = EGL_NO_SURFACE;
static EGLContext mEglContext = EGL_NO_CONTEXT;
static sp<android::SurfaceComposerClient> mSession;
static sp<android::SurfaceControl>        mControl;
static sp<android::Surface>               mAndroidSurface;

static int audioCount = 0;
class MyListener : public android::MediaPlayerListener {
public:
    android::sp<android::MediaPlayer> mp;
    MyListener(android::sp<android::MediaPlayer> arg_mp) {
        mp = arg_mp;
    }
    // Notify messages defined in include/media/mediaplayer.h
    virtual void notify(int msg, int ext1, int ext2, const android::Parcel *obj) {
        printf("audio count = %d\n",audioCount);
	switch (msg) {
	case android::MEDIA_PLAYBACK_COMPLETE:
	    printf("Playback complete\n");
	    mp->disconnect();
	    //audioCount--;
	    //exit(0);
	    break;

	case android::MEDIA_ERROR:
	    printf("Received Media Error %d %d\n", ext1, ext2);
	    exit(0);

	case android::MEDIA_INFO:
	    printf("Received media info %d %d\n", ext1, ext2);
	    break;

	default:
	    printf("Not handling MediaPlayerListener message %d %d %d\n", msg, ext1, ext2);
	    break;
	}
    }
};


static android::sp<android::MediaPlayer> mp;
void test_audio() {
    printf("testing the audio subsystem\n");
    char* file = "/data/node/01_789.mp3";
    int fd = ::open(file, O_RDONLY);
    if (fd < 0) {
        perror("Unable to open file!");
        exit(1);
        
    }
    struct stat stat_buf;
    int ret = ::fstat(fd, &stat_buf);
    if (ret < 0) {
        perror("Unable to stat file");
        exit(1);
    }
    printf("Setting up file %s, size %lld bytes\n", file, stat_buf.st_size);
    printf("preparing a media player\n");
    mp = new android::MediaPlayer();
    mp->reset();
    mp->setListener(new MyListener(mp));
    mp->setAudioStreamType(AUDIO_STREAM_MUSIC);
    mp->setDataSource(fd,   0, stat_buf.st_size);
    printf("closing the FD\n");
    close(fd);
    printf("preparing the FD\n");
    mp->prepare();
    printf("starting the FD\n");
    mp->start();    
}

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

EventSingleton* eventSingleton;
class EVDispatcher : public EventSingleton {
public:
    bool down;
    Local<Function> cb;
    EVDispatcher() {
        down = false;
    }
    virtual void touchStart(float rx, float ry, unsigned int tap_count=0) { 
        if(down) {
            //printf("touch moving\n");
            Local<Object> event = Object::New();
            event->Set(String::NewSymbol("x"), Number::New(rx));
            event->Set(String::NewSymbol("y"), Number::New(ry));
            event->Set(String::NewSymbol("type"), String::New("drag"));
            Handle<Value> argv[] = {event};
            cb->Call(Context::GetCurrent()->Global(), 1, argv);
            
        } else {
            down = true;
            //printf("touch starting\n");
            Local<Object> event = Object::New();
            event->Set(String::NewSymbol("x"), Number::New(rx));
            event->Set(String::NewSymbol("y"), Number::New(ry));
            event->Set(String::NewSymbol("type"), String::New("press"));
            Handle<Value> argv[] = {event};
            cb->Call(Context::GetCurrent()->Global(), 1, argv);
        }
    }
    virtual void touchMove(float rx, float ry, unsigned int tap_count=0) { 
        //printf("touch moving\n");
    }
    virtual void touchEnd(float rx, float ry, unsigned int tap_count=0) { 
        //printf("touch ending\n");
        Local<Object> event = Object::New();
        event->Set(String::NewSymbol("x"), Number::New(rx));
        event->Set(String::NewSymbol("y"), Number::New(ry));
        event->Set(String::NewSymbol("type"), String::New("release"));
        Handle<Value> argv[] = {event};
        cb->Call(Context::GetCurrent()->Global(), 1, argv);
        down = false;
    }
};


static int winWidth;
static int winHeight;
class KlaatuCore : public NodeCore , public node::ObjectWrap{
public:
    virtual void start() {
    }
    
    
    static v8::Handle<v8::Value> real_OpenWindow(const v8::Arguments& args) {
        HandleScope scope;
        return scope.Close(Undefined());
    }
    

    static v8::Handle<v8::Value> real_Init(const v8::Arguments& args) {
        HandleScope scope;

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
        fontShader  = new FontShader();
        textureShader = new TextureShader();
        
        
        eventSingleton = new EVDispatcher();
        enable_touch(winWidth,winHeight);

        
        
        //have to start the threadpool first or we will get no sound
        ProcessState::self()->startThreadPool();

        
        //test_audio();
        //Handle<Value> start_argv[] = {};
        //startCB->Call(Context::GetCurrent()->Global(), 0, start_argv);

        modelView = new GLfloat[16];
        return scope.Close(Undefined());
    }
    
    static v8::Handle<v8::Value> real_Repaint(const v8::Arguments& args) {
        HandleScope scope;
        Local<Function> drawCB = Local<Function>::Cast(args[0]);        
        Local<Function> eventCB = Local<Function>::Cast(args[1]);
        if(event_indication) {
            ((EVDispatcher*)eventSingleton)->cb = eventCB;
            event_process();
        }
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        GLfloat ortho[16], rot[16], trans[16], temp1[16], idmat[16];
        make_identity_matrix(idmat);
        make_trans_matrix(1,1,trans);
        make_z_rot_matrix(30,  rot);
        mul_matrix(temp1, rot, trans);
        loadOrthoMatrix(ortho, 0, winWidth, winHeight, 0, 0, 100);
        //printf("idmat = %f\n",idmat[12]);
        //idmat[12]= 0.5;
        mul_matrix(modelView, idmat, ortho);
        
        
        
        //create a wrapper template for gfx
        Handle<ObjectTemplate> point_templ = ObjectTemplate::New();
        point_templ->SetInternalFieldCount(1);
        point_templ->Set(String::NewSymbol("fillQuadColor"),FunctionTemplate::New(GLGFX::node_fillQuadColor)->GetFunction());
        point_templ->Set(String::NewSymbol("fillQuadText"),FunctionTemplate::New(GLGFX::node_fillQuadText)->GetFunction());
        point_templ->Set(String::NewSymbol("fillQuadTexture"),FunctionTemplate::New(GLGFX::node_fillQuadTexture)->GetFunction());
        point_templ->Set(String::NewSymbol("setFontData"),FunctionTemplate::New(GLGFX::node_setFontData)->GetFunction());
        point_templ->Set(String::NewSymbol("save"),FunctionTemplate::New(GLGFX::node_save)->GetFunction());
        point_templ->Set(String::NewSymbol("restore"),FunctionTemplate::New(GLGFX::node_restore)->GetFunction());
        point_templ->Set(String::NewSymbol("translate"),FunctionTemplate::New(GLGFX::node_translate)->GetFunction());
        
        GLGFX* gfx = new GLGFX();
        gfx->translate(800,0);
        gfx->rotate(90);
        Local<Object> obj = point_templ->NewInstance();
        obj->SetInternalField(0, External::New(gfx));
        Handle<Value> argv[] = { obj };
        drawCB->Call(Context::GetCurrent()->Global(), 1, argv);
        delete gfx;

        eglSwapBuffers(mEglDisplay, mEglSurface);
        return scope.Close(Undefined());
    }
    
    static void Init() {
        Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
        tpl->SetClassName(String::NewSymbol("Core"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);
        tpl->PrototypeTemplate()->Set(String::NewSymbol("real_OpenWindow"),FunctionTemplate::New(real_OpenWindow)->GetFunction());
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

Handle<Value> LoadTexture(const Arguments& args) {
    HandleScope scope;
    Local<Value> arg(args[0]);
    if(Buffer::HasInstance(args[0])) {
        Handle<Object> other = args[0]->ToObject();
        size_t length = Buffer::Length(other);
        uint8_t* data = (uint8_t*) Buffer::Data(other);
        int w = (int)(args[1]->ToNumber()->NumberValue());
        int h = (int)(args[2]->ToNumber()->NumberValue());
        printf("LoadTexture with image size %d x %d\n",w,h);
        GLuint texture;
        glGenTextures(1, &texture);
        glBindTexture(GL_TEXTURE_2D, texture);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
        glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        Local<Number> num = Number::New(texture);
        return scope.Close(num);
    }
    return scope.Close(Undefined());
}

class AminoMediaPlayer : public node::ObjectWrap {
public:
    static v8::Persistent<v8::Function> constructor;
    static void Init() {
        // Prepare constructor template
        Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
        tpl->SetClassName(String::NewSymbol("MediaPlayer"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);
        // Prototype
        tpl->PrototypeTemplate()->Set(String::NewSymbol("cpp_start"), FunctionTemplate::New(node_start)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("cpp_stop"), FunctionTemplate::New(node_stop)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("cpp_pause"), FunctionTemplate::New(node_pause)->GetFunction());
        constructor = Persistent<Function>::New(tpl->GetFunction());
    }
    //call the real constructor
    static Handle<Value> New(const Arguments& args) {
        HandleScope scope;
        v8::String::Utf8Value param1(args[0]->ToString());
        std::string text = std::string(*param1);    
        char * file = new char [text.length()+1];
        std::strcpy (file, text.c_str());
        
    
        printf("creating a  media player for %s\n",file);
        int fd = ::open(file, O_RDONLY);
        if (fd < 0) {
            perror("Unable to open file!");
            exit(1);
        }
        
        struct stat stat_buf;
        int ret = ::fstat(fd, &stat_buf);
        if (ret < 0) {
            perror("Unable to stat file");
            exit(1);
        }
        
        printf("Setting up file %s, size %lld bytes\n", file, stat_buf.st_size);
        printf("preparing a media player\n");
        MediaPlayer *mp = new MediaPlayer();
        mp->reset();
        mp->setListener(new MyListener(mp));
        mp->setAudioStreamType(AUDIO_STREAM_MUSIC);
        mp->setDataSource(fd,   0, stat_buf.st_size);
        printf("closing the FD\n");
        close(fd);
        printf("preparing the FD\n");
        mp->prepare();
        printf("starting the FD\n");
        AminoMediaPlayer* obj = new AminoMediaPlayer(mp);
        obj->Wrap(args.This());
        return args.This();
    }
    //util method to call the node constructor
    static Handle<v8::Value> NewInstance(const v8::Arguments& args) {
        HandleScope scope;
        const unsigned argc = 1;
        Handle<Value> argv[argc] = { args[0] };
        Local<Object> instance = constructor->NewInstance(argc, argv);
        return scope.Close(instance);
    }
    
    MediaPlayer* mp;
    AminoMediaPlayer(MediaPlayer* mp) {
        this->mp = mp;
    }
    static Handle<v8::Value> node_start(const v8::Arguments& args) {
        HandleScope scope;
        AminoMediaPlayer* self = ObjectWrap::Unwrap<AminoMediaPlayer>(args.This());
        self->mp->start();
        return scope.Close(Undefined());
    };
    static Handle<v8::Value> node_stop(const v8::Arguments& args) {
        HandleScope scope;
        AminoMediaPlayer* self = ObjectWrap::Unwrap<AminoMediaPlayer>(args.This());
        self->mp->pause();
        self->mp->seekTo(0);
        return scope.Close(Undefined());
    };
    static Handle<v8::Value> node_pause(const v8::Arguments& args) {
        HandleScope scope;
        AminoMediaPlayer* self = ObjectWrap::Unwrap<AminoMediaPlayer>(args.This());
        self->mp->pause();
        return scope.Close(Undefined());
    };
};
Persistent<Function> AminoMediaPlayer::constructor;

Handle<Value> CreateMediaPlayer(const Arguments& args) {
    HandleScope scope;
    return scope.Close(AminoMediaPlayer::NewInstance(args));
}

void InitAll(Handle<Object> exports, Handle<Object> module) {
    KlaatuCore::Init();
    AminoMediaPlayer::Init();
    exports->Set(String::NewSymbol("testNative"),FunctionTemplate::New(TestNative)->GetFunction());  
    exports->Set(String::NewSymbol("createCore"),FunctionTemplate::New(CreateObject)->GetFunction());
    exports->Set(String::NewSymbol("loadTexture"),FunctionTemplate::New(LoadTexture)->GetFunction());
    exports->Set(String::NewSymbol("createMediaPlayer"),FunctionTemplate::New(CreateMediaPlayer)->GetFunction());
}



NODE_MODULE(aminonative, InitAll)


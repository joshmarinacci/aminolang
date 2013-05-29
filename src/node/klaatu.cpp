#include <node.h>
#include <math.h>
#include <time.h>
#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>

#define ASSERT_EQ(A, B) {if ((A) != (B)) {printf ("ERROR: %d\n", __LINE__); exit(9); }}
#define ASSERT_NE(A, B) {if ((A) == (B)) {printf ("ERROR: %d\n", __LINE__); exit(9); }}
#define EXPECT_TRUE(A) {if ((A) == 0) {printf ("ERROR: %d\n", __LINE__); exit(9); }}


using namespace v8;
using namespace node;
using android::sp;




static GLfloat* modelView;
static EGLDisplay mEglDisplay = EGL_NO_DISPLAY;
static EGLSurface mEglSurface = EGL_NO_SURFACE;
static EGLContext mEglContext = EGL_NO_CONTEXT;
static sp<android::SurfaceComposerClient> mSession;
static sp<android::SurfaceControl>        mControl;
static sp<android::Surface>               mAndroidSurface;

static int audioCount = 0;
static double elapsedTime;
static int elapsedCount;

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

static void
loadPixelPerfect(GLfloat *m, float width, float height, float z_eye, float z_near, float z_far) {
    float kdn = z_eye - z_near;
    float kdf = z_eye - z_far;
    float ksz = - (kdf+kdn)/(kdf-kdn);
    float ktz = - (2.0f*kdn*kdf)/(kdf-kdn);
    
    m[0]=(2.0f*z_eye)/width; m[1]=0;                    m[2]=0; m[3]=0;
    m[4]=0;                  m[5]=(2.0f*z_eye)/height;  m[6]=0; m[7]=0;
    m[8]=0; m[9]=0; m[10]=ktz-ksz*z_eye; m[11]=-1.0f;
    m[12]=0; m[13]=0; m[14]=ktz; m[15]=z_eye;
}
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
GLint u_matrix, u_trans;
GLint attr_pos;
GLint attr_color;    
int prog;

int compileVertShader(const char* text) {
    GLint stat;
    GLuint vertShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertShader, 1, (const char **) &text, NULL);
    glCompileShader(vertShader);
    glGetShaderiv(vertShader, GL_COMPILE_STATUS, &stat);
    if (!stat) {
        printf("Error: vertex shader did not compile!\n");
    }
    return vertShader;
}

int compileFragShader(const char* text) {
    GLint stat;
    GLuint fragShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragShader, 1, (const char **) &text, NULL);
    glCompileShader(fragShader);
    glGetShaderiv(fragShader, GL_COMPILE_STATUS, &stat);
    if (!stat) {
        printf("Error: fragment shader did not compile!\n");
    }
    return fragShader;
}

int compileProgram(int vertShader, int fragShader) {
    GLuint program = glCreateProgram();
    GLint stat;
    glAttachShader(program, vertShader);
    glAttachShader(program, fragShader);
    glLinkProgram(program);
    glGetProgramiv(program, GL_LINK_STATUS, &stat);
    if (!stat) {
        char log[1000];
        GLsizei len;
        glGetProgramInfoLog(program, 1000, &len, log);
        printf("Error: linking:\n%s\n", log);
    }
    return program;
}

void load_color_shader() {
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
      "   gl_Position = trans * pos * modelviewProjection;\n"
      "   v_color = color;\n"
      "}\n";

   GLuint vert = compileVertShader(vertShaderText);
   GLuint frag = compileFragShader(fragShaderText);
   prog = compileProgram(vert,frag);
   
   glUseProgram(prog);
   attr_pos   = glGetAttribLocation(prog, "pos");
   attr_color = glGetAttribLocation(prog, "color");
   u_matrix   = glGetUniformLocation(prog, "modelviewProjection");
   u_trans    = glGetUniformLocation(prog, "trans");

}

class KlaatuCore : public node::ObjectWrap{
public:
    KlaatuCore() {
    }
    ~KlaatuCore() { }
    static v8::Persistent<v8::Function> constructor;
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
        
        
        //colorShader = new ColorShader();
        load_color_shader();
        
        modelView = new GLfloat[16];
        printf("=== about to create a memory leak\n");
        void* leak2 = malloc(10*1000);
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
Persistent<Function> KlaatuCore::constructor;

Handle<Value> CreateObject(const Arguments& args) {
    HandleScope scope;
    return scope.Close(KlaatuCore::NewInstance(args));
}

void InitAll(Handle<Object> exports, Handle<Object> module) {
    KlaatuCore::Init();
    //GLGFX::Init();
    exports->Set(String::NewSymbol("createCore"),FunctionTemplate::New(CreateObject)->GetFunction());
}

NODE_MODULE(aminonative, InitAll)


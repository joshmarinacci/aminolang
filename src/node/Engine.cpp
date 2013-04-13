#include <node.h>
#include <iostream>
#include <vector>
#include <math.h>

#define USE_FULL_GL 0
#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>



using namespace android;
using namespace v8;

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


  mSession = new SurfaceComposerClient();
  int status = mSession->getDisplayInfo(0, &display_info);
  *width = display_info.w;
  *height = display_info.h;
  mControl = mSession->createSurface(
				     0, *width, *height, PIXEL_FORMAT_RGB_888);
  SurfaceComposerClient::openGlobalTransaction();
  mControl->setLayer(0x40000000);
  SurfaceComposerClient::closeGlobalTransaction();
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
//#ifndef KLAATU
/*
   static const char *fragShaderText =
      "varying vec4 v_color;\n"
      "void main() {\n"
      "   gl_FragColor = v_color;\n"
      "}\n";
      */
//#else
   static const char *fragShaderText =
      "precision mediump float;\n"
      "varying vec4 v_color;\n"
      "void main() {\n"
      "   gl_FragColor = v_color;\n"
//      "   gl_FragColor = vec4(1.0,0.0,1.0,1.0);\n"
      "}\n";
//#endif //KLAATU
   static const char *vertShaderText =
      "uniform mat4 modelviewProjection;\n"
      "attribute vec4 pos;\n"
      "attribute vec4 color;\n"
      "varying vec4 v_color;\n"
      "void main() {\n"
      "   gl_Position = pos * modelviewProjection;\n"
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
   printf("Uniform modelviewProjection at %d\n", u_matrix);
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
loadOrthoMatrix(GLfloat *modelView,  GLfloat left, GLfloat right, GLfloat bottom, GLfloat top, GLfloat near, GLfloat far) {
            GLfloat r_l = right - left;
            GLfloat t_b = top - bottom;
            GLfloat f_n = far - near;
            GLfloat tx = - (right + left) / (right - left);
            GLfloat ty = - (top + bottom) / (top - bottom);
            GLfloat tz = - (far + near) / (far - near);
            
            modelView[0] = 2.0f / r_l;
            modelView[1] = 0.0f;
            modelView[2] = 0.0f;
            modelView[3] = tx;
        
            modelView[4] = 0.0f;
            modelView[5] = 2.0f / t_b;
            modelView[6] = 0.0f;
            modelView[7] = ty;
        
            modelView[8] = 0.0f;
            modelView[9] = 0.0f;
            modelView[10] = 2.0f / f_n;
            modelView[11] = tz;
        
            modelView[12] = 0.0f;
            modelView[13] = 0.0f;
            modelView[14] = 0.0f;
            modelView[15] = 1.0f;
    }


void draw() {
    
    //GLfloat mat[16], rot[16], scale[16];
    
    // Set the modelview/projection matrix
    //make_z_rot_matrix(view_rotx, rot);
    //float sc = 0.2;
    //make_scale_matrix(sc,sc,sc, scale);
    //mul_matrix(mat, rot, scale);
    GLfloat mat[16];
    loadOrthoMatrix(mat, 0, 720, 1280, 0, 0, 100);
    
    glUniformMatrix4fv(u_matrix, 1, GL_FALSE, mat);
    
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    
    float x = 0;
    float y = 0;
    float x2 = 50;
    float y2 = 50;
        printf("filling quad color with %f,%f -> %f,%f\n",x,y,x2,y2);
   
        GLfloat verts[6][2];
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

        /*
    static const GLfloat colors[6][3] = {
      { 1, 0, 0 },
      { 0, 1, 0 },
      { 1, 0, 0 },
      { 0, 1, 0 },
      { 0, 1, 0 },
      { 0, 0, 1 }
    };
    */
    
        GLfloat colors[6][3];
        for(int i=0; i<6; i++) {
            for(int j=0; j<3; j++) {
                //                colors[i][j] = tcol->comps[j];
                colors[i][j] = 0.5;
            }
        }

    glVertexAttribPointer(attr_pos,   2, GL_FLOAT, GL_FALSE, 0, verts);
    glVertexAttribPointer(attr_color, 3, GL_FLOAT, GL_FALSE, 0, colors);
    glEnableVertexAttribArray(attr_pos);
    glEnableVertexAttribArray(attr_color);
    
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray(attr_pos);
    glDisableVertexAttribArray(attr_color);
    
}




void init() {
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
}

void start() {
    for (;;) {
        draw();
        eglSwapBuffers(mEglDisplay, mEglSurface);
    }
}




Handle<Value> TestNative(const Arguments& args) {
    printf("in TestNative\n");
    HandleScope scope;
    init();
    start();
    return scope.Close(Undefined());
}

void InitAll(Handle<Object> exports, Handle<Object> module) {
//  MacCore::Init();
  exports->Set(String::NewSymbol("testNative"),FunctionTemplate::New(TestNative)->GetFunction());
}
NODE_MODULE(amino, InitAll)


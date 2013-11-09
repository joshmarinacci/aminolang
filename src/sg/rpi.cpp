
#include "base.h"
//#include "AbstractRenderer.h"
#include "SimpleRenderer.h"
#include "bcm_host.h"
#include <linux/input.h>

// ========== Event Callbacks ===========

/*
static void GLFW_WINDOW_SIZE_CALLBACK_FUNCTION(int newWidth, int newHeight) {
	width = newWidth;
	height = newHeight;
    if(!eventCallbackSet) warnAbort("WARNING. Event callback not set");
    Local<Object> event_obj = Object::New();
    event_obj->Set(String::NewSymbol("type"), String::New("windowsize"));
    event_obj->Set(String::NewSymbol("width"), Number::New(width));
    event_obj->Set(String::NewSymbol("height"), Number::New(height));
    Handle<Value> event_argv[] = {event_obj};
    NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, event_argv);
}
static int GLFW_WINDOW_CLOSE_CALLBACK_FUNCTION(void) {
    if(!eventCallbackSet) warnAbort("WARNING. Event callback not set");
    Local<Object> event_obj = Object::New();
    event_obj->Set(String::NewSymbol("type"), String::New("windowclose"));
    Handle<Value> event_argv[] = {event_obj};
    NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, event_argv);
    return GL_TRUE;
}
*/
static float near = 150;
static float far = -300;
static float eye = 600;



/*
static void GLFW_MOUSE_POS_CALLBACK_FUNCTION(int x, int y) {
    if(!eventCallbackSet) warnAbort("WARNING. Event callback not set");
    Local<Object> event_obj = Object::New();
    event_obj->Set(String::NewSymbol("type"), String::New("mouseposition"));
    event_obj->Set(String::NewSymbol("x"), Number::New(x));
    event_obj->Set(String::NewSymbol("y"), Number::New(y));
    Handle<Value> event_argv[] = {event_obj};
    NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, event_argv);
}

static void GLFW_MOUSE_BUTTON_CALLBACK_FUNCTION(int button, int state) {
    if(!eventCallbackSet) warnAbort("ERROR. Event callback not set");
    Local<Object> event_obj = Object::New();
    event_obj->Set(String::NewSymbol("type"), String::New("mousebutton"));
    event_obj->Set(String::NewSymbol("button"), Number::New(button));
    event_obj->Set(String::NewSymbol("state"), Number::New(state));
    Handle<Value> event_argv[] = {event_obj};
    NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, event_argv);
}
*/


typedef struct
{
   uint32_t screen_width;
   uint32_t screen_height;
   
// OpenGL|ES objects
   EGLDisplay display;
   EGLSurface surface;
   EGLContext context;

} PWindow;

static PWindow _state, *state=&_state;

static void init_ogl(PWindow *state)
{
   int32_t success = 0;
   EGLBoolean result;
   EGLint num_config;

   static EGL_DISPMANX_WINDOW_T nativewindow;

   DISPMANX_ELEMENT_HANDLE_T dispman_element;
   DISPMANX_DISPLAY_HANDLE_T dispman_display;
   DISPMANX_UPDATE_HANDLE_T dispman_update;
   VC_RECT_T dst_rect;
   VC_RECT_T src_rect;

   static const EGLint attribute_list[] =
   {
      EGL_RED_SIZE, 8,
      EGL_GREEN_SIZE, 8,
      EGL_BLUE_SIZE, 8,
      EGL_ALPHA_SIZE, 8,
      EGL_SURFACE_TYPE, EGL_WINDOW_BIT,
      EGL_NONE
   };
   
   static const EGLint context_attributes[] = 
   {
      EGL_CONTEXT_CLIENT_VERSION, 2,
      EGL_NONE
   };

   EGLConfig config;

   // get an EGL display connection
   state->display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
   assert(state->display!=EGL_NO_DISPLAY);

   // initialize the EGL display connection
   result = eglInitialize(state->display, NULL, NULL);
   assert(EGL_FALSE != result);

   // get an appropriate EGL frame buffer configuration
   result = eglChooseConfig(state->display, attribute_list, &config, 1, &num_config);
   assert(EGL_FALSE != result);

   // choose opengl 2
   result = eglBindAPI(EGL_OPENGL_ES_API);
   assert(EGL_FALSE != result);
   
   // create an EGL rendering context
   state->context = eglCreateContext(state->display, config, EGL_NO_CONTEXT, context_attributes);
   assert(state->context!=EGL_NO_CONTEXT);

   // create an EGL window surface
   success = graphics_get_display_size(0 /* LCD */, &state->screen_width, &state->screen_height);
   assert( success >= 0 );
   printf("RPI: display size = %d x %d\n",state->screen_width, state->screen_height);

   dst_rect.x = 0;
   dst_rect.y = 0;
   dst_rect.width = state->screen_width;
   dst_rect.height = state->screen_height;
      
   src_rect.x = 0;
   src_rect.y = 0;
   src_rect.width = state->screen_width << 16;
   src_rect.height = state->screen_height << 16;        

   dispman_display = vc_dispmanx_display_open( 0 /* LCD */);
   dispman_update = vc_dispmanx_update_start( 0 );
         
   dispman_element = vc_dispmanx_element_add ( dispman_update, dispman_display,
      0/*layer*/, &dst_rect, 0/*src*/,
      &src_rect, DISPMANX_PROTECTION_NONE, 0 /*alpha*/, 0/*clamp*/, (DISPMANX_TRANSFORM_T)0/*transform*/);
      
   nativewindow.element = dispman_element;
   nativewindow.width = state->screen_width;
   nativewindow.height = state->screen_height;
   vc_dispmanx_update_submit_sync( dispman_update );
      
   state->surface = eglCreateWindowSurface( state->display, config, &nativewindow, NULL );
   assert(state->surface != EGL_NO_SURFACE);

   // connect the context to the surface
   result = eglMakeCurrent(state->display, state->surface, state->surface, state->context);
   assert(EGL_FALSE != result);

   
   
   //now we have a real opengl context so we can do stuff
   glClearColor(1,0,0,1);
   glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
   eglSwapBuffers(state->display, state->surface);
   
   printf("rpi.c: got to the real opengl context\n");

}


const char* mouse_device = "/dev/input/event0";
int mouse_fd;
const char* key_device   = "/dev/input/event1";
int key_fd;

void init_mouse() {
    char name[256] = "Unknown";
    printf("initting the mouse\n");

    if((getuid()) != 0) {
        printf("you are not root. this might not work\n");
    }
    if((mouse_fd = open(mouse_device, O_RDONLY | O_NONBLOCK)) == -1) {
        printf("this is not a valid device\n",mouse_device);
        exit(0);
    }
    
    ioctl(mouse_fd, EVIOCGNAME(sizeof (name)), name);
    printf("Reading from: %s (%s)\n", mouse_device,name);
    ioctl(mouse_fd, EVIOCGPHYS(sizeof (name)), name);
    printf("Location %s (%s)\n", mouse_device,name);
}

void init_keyboard() {
    char name[256] = "Unknown";
    printf("initting the keyboard\n");

    if((getuid()) != 0) {
        printf("you are not root. this might not work\n");
    }
    if((key_fd = open(key_device, O_RDONLY | O_NONBLOCK)) == -1) {
        printf("this is not a valid device\n",key_device);
        exit(0);
    }
    
    ioctl(key_fd, EVIOCGNAME(sizeof (name)), name);
    printf("Reading from: %s (%s)\n", key_device,name);
    ioctl(key_fd, EVIOCGPHYS(sizeof (name)), name);
    printf("Location %s (%s)\n", key_device,name);
}

Handle<Value> init(const Arguments& args) {
	matrixStack = std::stack<void*>();
    HandleScope scope;
    bcm_host_init();
    // Clear application state
    memset( state, 0, sizeof( *state ) );
      
    // Start OGLES
    init_ogl(state);    
    
    width = state->screen_width;
    height = state->screen_height;
    
    
    init_mouse();
    init_keyboard();
    
    return scope.Close(Undefined());
}


Handle<Value> createWindow(const Arguments& args) {
    HandleScope scope;
    int w  = args[0]->ToNumber()->NumberValue();
    int h  = args[1]->ToNumber()->NumberValue();
    //window already allocated at this point.
    
    //    glfwSetWindowSizeCallback(GLFW_WINDOW_SIZE_CALLBACK_FUNCTION);
    //    glfwSetWindowCloseCallback(GLFW_WINDOW_CLOSE_CALLBACK_FUNCTION);
    //    glfwSetMousePosCallback(GLFW_MOUSE_POS_CALLBACK_FUNCTION);
    //    glfwSetMouseButtonCallback(GLFW_MOUSE_BUTTON_CALLBACK_FUNCTION);
    //    glfwSetKeyCallback(GLFW_KEY_CALLBACK_FUNCTION);
    
    colorShader = new ColorShader();
    textureShader = new TextureShader();
    fontShader = new FontShader();
    modelView = new GLfloat[16];

    globaltx = new GLfloat[16];
    make_identity_matrix(globaltx);
    

    
    glViewport(0,0,width, height);
    return scope.Close(Undefined());
}

Handle<Value> setWindowSize(const Arguments& args) {
    HandleScope scope;
    int w  = args[0]->ToNumber()->NumberValue();
    int h  = args[1]->ToNumber()->NumberValue();
//    width = w;
//    height = h;
    printf("pretending to set the window size to: %d %d\n",width,height);
    return scope.Close(Undefined());
}

Handle<Value> getWindowSize(const Arguments& args) {
    HandleScope scope;
    Local<Object> obj = Object::New();
    obj->Set(String::NewSymbol("w"), Number::New(width));
    obj->Set(String::NewSymbol("h"), Number::New(height));
    return scope.Close(obj);
}

void dump_event(struct input_event* event) {
    switch(event->type) {
        case EV_SYN: printf("EV_SYN  event separator\n"); break;
        case EV_KEY: printf("EV_KEY  keyboard or button \n"); break;
        case EV_REL: printf("EV_REL  relative axis\n"); break;
        case EV_ABS: printf("EV_ABS  absolute axis\n"); break;
        case EV_MSC: printf("EV_MSC  misc\n"); break;
        case EV_LED: printf("EV_LED  led\n"); break;
        case EV_SND: printf("EV_SND  sound\n"); break;
        case EV_REP: printf("EV_REP  autorepeating\n"); break;
        case EV_FF:  printf("EV_FF   force feedback send\n"); break;
        case EV_PWR: printf("EV_PWR  power button\n"); break;
        case EV_FF_STATUS: printf("EV_FF_STATUS force feedback receive\n"); break;
        case EV_MAX: printf("EV_MAX  max value\n"); break;
    }
    printf("type = %d code = %d value = %d\n",event->type,event->code,event->value);
}

static int mouse_x = 0;
static int mouse_y = 0;

static void GLFW_MOUSE_POS_CALLBACK_FUNCTION(int x, int y) {
    if(!eventCallbackSet) warnAbort("WARNING. Event callback not set");
    Local<Object> event_obj = Object::New();
    event_obj->Set(String::NewSymbol("type"), String::New("mouseposition"));
    event_obj->Set(String::NewSymbol("x"), Number::New(x));
    event_obj->Set(String::NewSymbol("y"), Number::New(y));
    Handle<Value> event_argv[] = {event_obj};
    NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, event_argv);
}

static void GLFW_KEY_CALLBACK_FUNCTION(int key, int action) {
    if(!eventCallbackSet) warnAbort("WARNING. Event callback not set");
    Local<Object> event_obj = Object::New();
    if(action == 0) {
        event_obj->Set(String::NewSymbol("type"), String::New("keyrelease"));
    }
    if(action == 1) {
        event_obj->Set(String::NewSymbol("type"), String::New("keypress"));
    }
    if(action == 2) {
        event_obj->Set(String::NewSymbol("type"), String::New("keyrepeat"));
    }
    event_obj->Set(String::NewSymbol("keycode"), Number::New(key));
    Handle<Value> event_argv[] = {event_obj};
    NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, event_argv);
}


static void GLFW_MOUSE_BUTTON_CALLBACK_FUNCTION(int button, int state) {
    if(!eventCallbackSet) warnAbort("ERROR. Event callback not set");
    Local<Object> event_obj = Object::New();
    event_obj->Set(String::NewSymbol("type"), String::New("mousebutton"));
    event_obj->Set(String::NewSymbol("button"), Number::New(button));
    event_obj->Set(String::NewSymbol("state"), Number::New(state));
    Handle<Value> event_argv[] = {event_obj};
    NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, event_argv);
}
int KEYBOARD = 5061;
int MOUSE    = 5062;

void processInput(int fd, int type) {
    int size = sizeof(struct input_event);
    struct input_event ev[64];
//    printf("processing input\n");
    int rd = read(fd, ev, size*64);
    if(rd == -1) return;
    if(rd < size) {
        printf("read too little!!!  %d\n",rd);
    }
    //process all events
    for(int i=0; i<(int)(rd/size); i++) {
        //dump_event(&(ev[i]));
        //check for relative mouse motion
        if(ev[i].type == EV_REL) {
            if(ev[i].code == 0) {
                mouse_x += ev[i].value;
            }
            if(ev[i].code == 1) {
                mouse_y += ev[i].value;
            }
            if(mouse_x < 0) mouse_x = 0;
            if(mouse_y < 0) mouse_y = 0;
            if(mouse_x > width)  { mouse_x = width;  }
            if(mouse_y > height) { mouse_y = height; }
            //printf("mouse moved to: %d %d\n", mouse_x, mouse_y);
            GLFW_MOUSE_POS_CALLBACK_FUNCTION(mouse_x, mouse_y);
        }
        
        if(ev[i].type == EV_KEY) {
            //printf("key or button pressed code = %d, state = %d\n",ev[i].code, ev[i].value);
            if(type == MOUSE) {
                //emit mouse event
                GLFW_MOUSE_BUTTON_CALLBACK_FUNCTION(ev[i].code,ev[i].value);
            }
            if(type == KEYBOARD) {
                //emit keyboard event
                GLFW_KEY_CALLBACK_FUNCTION(ev[i].code, ev[i].value);
            }
            
        }
    }
}

void sendValidate() {
    if(!eventCallbackSet) warnAbort("WARNING. Event callback not set");
    Local<Object> event_obj = Object::New();
    event_obj->Set(String::NewSymbol("type"), String::New("validate"));
    Handle<Value> event_argv[] = {event_obj};
    NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, event_argv);    
}

struct DebugEvent {
    double inputtime;
    double validatetime;
    double updatestime;
    double animationstime;
    double rendertime;
    double frametime;
    double framewithsynctime;
};

void render() {
    DebugEvent de;
    double starttime = getTime();
    
    //process input
    processInput(mouse_fd,MOUSE);
    processInput(key_fd,KEYBOARD);
    double postinput = getTime();
    de.inputtime = postinput-starttime;
    
    //send the validate event
    sendValidate();
    double postvalidate = getTime();
    de.validatetime = postvalidate-postinput;
    
    int updatecount = updates.size();
    //apply the processed updates
    for(int j=0; j<updates.size(); j++) {
        updates[j]->apply();
    }
    updates.clear();
    double postupdates = getTime();
    de.updatestime = postupdates-postvalidate;
    
    //apply the animations
    for(int j=0; j<anims.size(); j++) {
        anims[j]->update();
    }
    double postanim = getTime();
    de.animationstime = postanim-postupdates;

    //set up the viewport
    GLfloat* scaleM = new GLfloat[16];
    make_scale_matrix(1,-1,1,scaleM);
    GLfloat* transM = new GLfloat[16];
    make_trans_matrix(-width/2,height/2,0,transM);
    GLfloat* m4 = new GLfloat[16];
    mul_matrix(m4, transM, scaleM); 
    GLfloat* pixelM = new GLfloat[16];
    loadPixelPerfect(pixelM, width, height, eye, near, far);
    mul_matrix(modelView,pixelM,m4);
    make_identity_matrix(globaltx);
    glViewport(0,0,width, height);
    glClearColor(1,1,1,1);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glDisable(GL_DEPTH_TEST);
    AminoNode* root = rects[rootHandle];
    SimpleRenderer* rend = new SimpleRenderer();
    double prerender = getTime();
    rend->startRender(root);
    delete rend;
    double postrender = getTime();
    de.rendertime = postrender-prerender;
    de.frametime = postrender-starttime;
    eglSwapBuffers(state->display, state->surface);
    double postswap = getTime();
    de.framewithsynctime = postswap-starttime;
//    printf("input = %.2f validate = %.2f update = %.2f update count %d ",  de.inputtime, de.validatetime, de.updatestime, updatecount);
//    printf("animtime = %.2f render = %.2f frame = %.2f, full frame = %.2f\n", de.animationstime, de.rendertime, de.frametime, de.framewithsynctime);
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

Handle<Value> runTest(const Arguments& args) {
    HandleScope scope;
    
    double startTime = getTime();
    int count = 100;
    Local<v8::Object> opts = args[0]->ToObject();
    count = (int)(opts
        ->Get(String::NewSymbol("count"))
        ->ToNumber()
        ->NumberValue()
        );
    
    
    bool sync = false;
    sync = opts
        ->Get(String::NewSymbol("sync"))
        ->ToBoolean()
        ->BooleanValue();
        
    printf("rendering %d times, vsync = %d\n",count,sync);

    printf("applying updates first\n");
    for(int j=0; j<updates.size(); j++) {
        updates[j]->apply();
    }
    updates.clear();
    
    printf("setting up the screen\n");
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
    
    GLfloat* m5 = new GLfloat[16];
    //transpose(m5,pixelM);
    
    mul_matrix(modelView,pixelM,m4);
    
    
    make_identity_matrix(globaltx);
    glViewport(0,0,width, height);
    glClearColor(1,1,1,1);
    
    
    glDisable(GL_DEPTH_TEST);
    printf("running %d times\n",count);
    for(int i=0; i<count; i++) {
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        /*
        for(int j=0; j<anims.size(); j++) {
            anims[j]->update();
        }
        */
        AminoNode* root = rects[rootHandle];
        SimpleRenderer* rend = new SimpleRenderer();
        rend->startRender(root);
        delete rend;
        if(sync) {
            eglSwapBuffers(state->display, state->surface);
        }
    }
    
    double endTime = getTime();
    Local<Object> ret = Object::New();
    ret->Set(String::NewSymbol("count"),Number::New(count));
    ret->Set(String::NewSymbol("totalTime"),Number::New(endTime-startTime));
    return scope.Close(ret);
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
    exports->Set(String::NewSymbol("getWindowSize"),    FunctionTemplate::New(getWindowSize)->GetFunction());
    exports->Set(String::NewSymbol("createRect"),       FunctionTemplate::New(createRect)->GetFunction());
    exports->Set(String::NewSymbol("createPoly"),       FunctionTemplate::New(createPoly)->GetFunction());
    exports->Set(String::NewSymbol("createGroup"),      FunctionTemplate::New(createGroup)->GetFunction());
    exports->Set(String::NewSymbol("createText"),       FunctionTemplate::New(createText)->GetFunction());
    exports->Set(String::NewSymbol("createAnim"),       FunctionTemplate::New(createAnim)->GetFunction());
    exports->Set(String::NewSymbol("stopAnim"),         FunctionTemplate::New(stopAnim)->GetFunction());
    exports->Set(String::NewSymbol("updateProperty"),   FunctionTemplate::New(updateProperty)->GetFunction());
    exports->Set(String::NewSymbol("updateAnimProperty"),FunctionTemplate::New(updateAnimProperty)->GetFunction());
    exports->Set(String::NewSymbol("addNodeToGroup"),   FunctionTemplate::New(addNodeToGroup)->GetFunction());
    exports->Set(String::NewSymbol("removeNodeFromGroup"),   FunctionTemplate::New(removeNodeFromGroup)->GetFunction());
    exports->Set(String::NewSymbol("tick"),             FunctionTemplate::New(tick)->GetFunction());
    exports->Set(String::NewSymbol("selfDrive"),        FunctionTemplate::New(selfDrive)->GetFunction());
    exports->Set(String::NewSymbol("setEventCallback"), FunctionTemplate::New(setEventCallback)->GetFunction());
    exports->Set(String::NewSymbol("setRoot"),          FunctionTemplate::New(setRoot)->GetFunction());
    exports->Set(String::NewSymbol("loadPngToTexture"), FunctionTemplate::New(loadPngToTexture)->GetFunction());   
    exports->Set(String::NewSymbol("loadJpegToTexture"),FunctionTemplate::New(loadJpegToTexture)->GetFunction());
    exports->Set(String::NewSymbol("createNativeFont"), FunctionTemplate::New(createNativeFont)->GetFunction());
    exports->Set(String::NewSymbol("getCharWidth"),     FunctionTemplate::New(getCharWidth)->GetFunction());
    exports->Set(String::NewSymbol("getFontHeight"),    FunctionTemplate::New(getFontHeight)->GetFunction());
    exports->Set(String::NewSymbol("runTest"),          FunctionTemplate::New(runTest)->GetFunction());
}

NODE_MODULE(aminonative, InitAll)


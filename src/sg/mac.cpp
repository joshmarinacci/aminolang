#include "base.h"



// ========== Event Callbacks ===========

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
static float near = 150;
static float far = -300;
static float eye = 600;
//1000,250,-500
//far = -eye/2.  near = -far/2;  ex: 800,200,-400.
//400+200+600 = 1200
//    loadPixelPerfect(pixelM, width, height, 600, 100, -150);


static void GLFW_KEY_CALLBACK_FUNCTION(int key, int action) {
//    printf("callback key = %d action = %d\n",key,action);
/*
    switch(key) {
        case 65: eye-=10; break;
        case 81: eye+=10; break;
        case 87: near+=5; break;
        case 83: near-=5; break;
        case 69: far-=5; break;
        case 68: far+=5; break;
    }
    */
//    printf("eye = %f near = %f far = %f\n",eye,near,far);
    if(!eventCallbackSet) warnAbort("WARNING. Event callback not set");
    Local<Object> event_obj = Object::New();
    if(action == 1) {
        event_obj->Set(String::NewSymbol("type"), String::New("keypress"));
    }
    if(action == 0) {
        event_obj->Set(String::NewSymbol("type"), String::New("keyrelease"));
    }
    event_obj->Set(String::NewSymbol("keycode"), Number::New(key));
    Handle<Value> event_argv[] = {event_obj};
    NODE_EVENT_CALLBACK->Call(Context::GetCurrent()->Global(), 1, event_argv);
}


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

/*
int main(int argc, char**argv) {
    printf("running my app\n");
    
    
    if(!glfwInit()) {
        printf("error. quitting\n");
        glfwTerminate();
        exit(EXIT_FAILURE);
    }
    
    if(!glfwOpenWindow(width,height, 8, 8, 8, 0, 24, 0, GLFW_WINDOW)) {
        printf("error. quitting\n");
        glfwTerminate();
        exit(EXIT_FAILURE);        
    }
    
    
    
    
    //create globals
    colorShader = new ColorShader();
    textureShader = new TextureShader();
    
    
    modelView = new GLfloat[16];
    loadOrthoMatrix(modelView, 0, width, height, 0, 0, 100);
    globaltx = new GLfloat[16];
    make_identity_matrix(globaltx);
    
    
    glViewport(0,0,width, height);
    //set up our data
    rects.push_back(new Rect());
    rects.push_back(new Rect());
    rects.push_back(new Rect());

    anims.push_back(new Anim(rects[0],0, -100,700,  1000, FOREVER, true));
    anims.push_back(new Anim(rects[1],1,    0,100,   333, 3, true));
    anims.push_back(new Anim(rects[2],0,    0,300,  5000, FOREVER, false));
    
    float t = 0;
    for(int i=0; i<60*5; i++) {
        glClearColor(1,1,1,1);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        for(int j=0; j<anims.size(); j++) {
            anims[j]->update();
        }
        for(int j=0; j<rects.size(); j++) {
            rects[j]->draw();
        }
        
        glfwSwapBuffers();
    }
    
    return 0;
}
*/

Handle<Value> init(const Arguments& args) {
	matrixStack = std::stack<void*>();
    HandleScope scope;
    if(!glfwInit()) {
        printf("error. quitting\n");
        glfwTerminate();
        exit(EXIT_FAILURE);
    }
    return scope.Close(Undefined());
}


Handle<Value> createWindow(const Arguments& args) {
    HandleScope scope;
    int w  = args[0]->ToNumber()->NumberValue();
    int h  = args[1]->ToNumber()->NumberValue();
    width = w;
    height = h;
    if(!glfwOpenWindow(width,height, 8, 8, 8, 0, 24, 0, GLFW_WINDOW)) {
        printf("error. quitting\n");
        glfwTerminate();
        exit(EXIT_FAILURE);        
    }
    
    glfwSetWindowSizeCallback(GLFW_WINDOW_SIZE_CALLBACK_FUNCTION);
    glfwSetWindowCloseCallback(GLFW_WINDOW_CLOSE_CALLBACK_FUNCTION);
    glfwSetMousePosCallback(GLFW_MOUSE_POS_CALLBACK_FUNCTION);
    glfwSetMouseButtonCallback(GLFW_MOUSE_BUTTON_CALLBACK_FUNCTION);
    glfwSetKeyCallback(GLFW_KEY_CALLBACK_FUNCTION);
    
    colorShader = new ColorShader();
    textureShader = new TextureShader();
    fontShader = new FontShader();
    modelView = new GLfloat[16];

	printf("created globaltx %d\n",globaltx);
    globaltx = new GLfloat[16];
	printf("created globaltx %d\n",globaltx);
    make_identity_matrix(globaltx);
    

    
    
    glViewport(0,0,width, height);
    return scope.Close(Undefined());
}

Handle<Value> setWindowSize(const Arguments& args) {
    HandleScope scope;
    int w  = args[0]->ToNumber()->NumberValue();
    int h  = args[1]->ToNumber()->NumberValue();
    width = w;
    height = h;
    glfwSetWindowSize(width,height);
    return scope.Close(Undefined());
}


void render() {
	printf("inside render\n");
	

    for(int j=0; j<updates.size(); j++) {
        updates[j]->apply();
    }
    printf("done with updates\n");
    updates.clear();
    
    printf("doing screen sizing\n");
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
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glDisable(GL_DEPTH_TEST);
    printf("animating\n");
    for(int j=0; j<anims.size(); j++) {
        anims[j]->update();
    }
    printf("drawing\n");
    AminoNode* root = rects[rootHandle];
    printf("got root\n");
    root->draw();
    printf("swapping screen\n");
    
    glfwSwapBuffers();
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


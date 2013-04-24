#include <node.h>

#include "core.h"


static int old_x;
static int old_y;
static int old_but;
class MacCore : public NodeCore , public node::ObjectWrap{
public:
    virtual void start() {
        if(!glfwInit()) {
            printf("error. quitting\n");
            glfwTerminate();
            exit(EXIT_FAILURE);
        }
        printf("inited the GLFW\n");
    }
    
    
    static v8::Handle<v8::Value> real_OpenWindow(const v8::Arguments& args) {
        HandleScope scope;
        int ret = glfwOpenWindow(360, 640, 8, 8, 8, 0, 24, 0, GLFW_WINDOW);
        if(!ret) {
            printf("error. quitting\n");
            glfwTerminate();
            exit(EXIT_FAILURE);
        }
        
        return scope.Close(Undefined());
    }

    static Local<Function> global_event_CB;
    static void GLFW_KEY_CALLBACK_FUNCTION(int key, int action) {
        //        printf("callback key = %d action = %d\n",key,action);
        Local<Object> event_obj = Object::New();
        event_obj->Set(String::NewSymbol("type"), String::New("key"));
        event_obj->Set(String::NewSymbol("keycode"), Number::New(key));
        event_obj->Set(String::NewSymbol("action"), Number::New(action));
        int shift = 0;
        if(glfwGetKey(GLFW_KEY_LSHIFT) == 1) shift = 1;
        if(glfwGetKey(GLFW_KEY_RSHIFT) == 1) shift = 1;
        event_obj->Set(String::NewSymbol("shift"), Number::New(shift));
        Handle<Value> event_argv[] = {event_obj};
        global_event_CB->Call(Context::GetCurrent()->Global(), 1, event_argv);
    }
    
    static v8::Handle<v8::Value> real_Init(const v8::Arguments& args) {
        HandleScope scope;
        colorShader = new ColorShader();
        fontShader  = new FontShader();
        textureShader = new TextureShader();
        glfwSetKeyCallback(GLFW_KEY_CALLBACK_FUNCTION);
        return scope.Close(Undefined());
    }
    
    static void processMouseEvents(Local<Function> eventCB) {
        //check for events
        int mx;
        int my;
        glfwGetMousePos(&mx,&my);
        int mbut = glfwGetMouseButton(GLFW_MOUSE_BUTTON_LEFT);
        if(old_x != mx || old_y != my || old_but != mbut) {
            //printf("mouse = %d,%d  %d\n",mx,my,mbut);
            //create a small JS object for the event info
            Local<Object> event_obj = Object::New();
            //event_obj->Set(String::NewSymbol("button"), Number::New(mbut));
            if(old_but != mbut) {
                if(mbut == 1) {
                    event_obj->Set(String::NewSymbol("type"), String::New("press"));
                } else {
                    event_obj->Set(String::NewSymbol("type"), String::New("release"));
                }
            } else {
                if(mbut == 1) {
                    event_obj->Set(String::NewSymbol("type"), String::New("drag"));
                } else {
                    event_obj->Set(String::NewSymbol("type"), String::New("move"));
                }
            }
            event_obj->Set(String::NewSymbol("x"), Number::New(mx));
            event_obj->Set(String::NewSymbol("y"), Number::New(my));
            //call the event callback
            Handle<Value> event_argv[] = {event_obj};
            eventCB->Call(Context::GetCurrent()->Global(), 1, event_argv);
        }
        old_x = mx;
        old_y = my;
        old_but = mbut;
    }
    static v8::Handle<v8::Value> real_Repaint(const v8::Arguments& args) {
        HandleScope scope;
        Local<Function> drawCB = Local<Function>::Cast(args[0]);        
        Local<Function> eventCB = Local<Function>::Cast(args[1]);
        global_event_CB = eventCB;
         
        processMouseEvents(eventCB);
        
        //do the drawing
        glClear( GL_COLOR_BUFFER_BIT );
        
        GLfloat rot[16], scale[16], trans[16];
        modelView = new GLfloat[16];
        
        loadOrthoMatrix(modelView, 0, 360, 640, 0, 0, 100);
        
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        
        //printf("setting up gfx fill quad\n");
        Handle<ObjectTemplate> point_templ = ObjectTemplate::New();
        point_templ->SetInternalFieldCount(1);
        point_templ->Set(String::NewSymbol("fillQuadColor"),FunctionTemplate::New(GLGFX::node_fillQuadColor)->GetFunction());
        point_templ->Set(String::NewSymbol("fillQuadText"),FunctionTemplate::New(GLGFX::node_fillQuadText)->GetFunction());
        point_templ->Set(String::NewSymbol("fillQuadTexture"),FunctionTemplate::New(GLGFX::node_fillQuadTexture)->GetFunction());
        point_templ->Set(String::NewSymbol("setFontData"),FunctionTemplate::New(GLGFX::node_setFontData)->GetFunction());
        point_templ->Set(String::NewSymbol("save"),FunctionTemplate::New(GLGFX::node_save)->GetFunction());
        point_templ->Set(String::NewSymbol("restore"),FunctionTemplate::New(GLGFX::node_restore)->GetFunction());
        point_templ->Set(String::NewSymbol("translate"),FunctionTemplate::New(GLGFX::node_translate)->GetFunction());
        point_templ->Set(String::NewSymbol("rotate"),FunctionTemplate::New(GLGFX::node_rotate)->GetFunction());
        point_templ->Set(String::NewSymbol("scale"),FunctionTemplate::New(GLGFX::node_scale)->GetFunction());
        
        GLGFX* gfx = new GLGFX();
        Local<Object> obj = point_templ->NewInstance();
        obj->SetInternalField(0, External::New(gfx));
        Handle<Value> argv[] = { obj };
        drawCB->Call(Context::GetCurrent()->Global(), 1, argv);
        
        glfwSwapBuffers();
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
      MacCore* obj = new MacCore();
      obj->start();
      //obj->real_OpenWindow(args);
      obj->Wrap(args.This());
      return args.This();
    }
    
};

Local<Function> MacCore::global_event_CB;

Handle<Value> CreateObject(const Arguments& args) {
    HandleScope scope;
    return scope.Close(MacCore::NewInstance(args));
}

//a simple test that opens a 400x400 window
//and draws a grey rect on a black background
Handle<Value> TestNative(const Arguments& args) {
    printf("in TestNative\n");
    HandleScope scope;
    
    MacCore* core = new MacCore();
    core->start();
    core->real_OpenWindow(args);
    colorShader = new ColorShader();
    while (glfwGetWindowParam(GLFW_OPENED))
    {
        glClear( GL_COLOR_BUFFER_BIT );
        GLfloat rot[16], scale[16], trans[16];
        modelView = new GLfloat[16];
        loadOrthoMatrix(modelView, 0, 400, 400, 0, 0, 100);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        GLGFX* gfx = new GLGFX();
        gfx->fillQuadColor(1,1,0, new Bounds(0,0,50,50));
        delete gfx;
        glfwSwapBuffers();
    }
    
    glfwTerminate();
    exit(EXIT_SUCCESS);

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


void InitAll(Handle<Object> exports, Handle<Object> module) {
    MacCore::Init();
    exports->Set(String::NewSymbol("createCore"),FunctionTemplate::New(CreateObject)->GetFunction());
    exports->Set(String::NewSymbol("testNative"),FunctionTemplate::New(TestNative)->GetFunction());
    exports->Set(String::NewSymbol("loadTexture"),FunctionTemplate::New(LoadTexture)->GetFunction());
}

NODE_MODULE(amino, InitAll)


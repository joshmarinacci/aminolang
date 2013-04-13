#include <node.h>

#include "core.h"


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
        int ret = glfwOpenWindow(400, 400, 8, 8, 8, 0, 24, 0, GLFW_WINDOW);
        if(!ret) {
            printf("error. quitting\n");
            glfwTerminate();
            exit(EXIT_FAILURE);
        }
        
        return scope.Close(Undefined());
    }
    
    static v8::Handle<v8::Value> real_Start(const v8::Arguments& args) {
        HandleScope scope;
        colorShader = new ColorShader();
        Local<Function> drawCB = Local<Function>::Cast(args[0]);        
        Local<Function> eventCB = Local<Function>::Cast(args[1]);
        while (glfwGetWindowParam(GLFW_OPENED))
        {
            
            //check for events
            int mx;
            int my;
            glfwGetMousePos(&mx,&my);
            int mbut = glfwGetMouseButton(GLFW_MOUSE_BUTTON_LEFT);
            //printf("mouse = %d,%d  %d\n",mx,my,mbut);
            
            //create a small JS object for the event info
            Local<Object> event_obj = Object::New();
            event_obj->Set(String::NewSymbol("msg"), String::New("hello_world"));
            event_obj->Set(String::NewSymbol("x"), Number::New(mx));
            event_obj->Set(String::NewSymbol("y"), Number::New(my));
            event_obj->Set(String::NewSymbol("button"), Number::New(mbut));
            
            //call the event callback
            Handle<Value> event_argv[] = {event_obj};
            eventCB->Call(Context::GetCurrent()->Global(), 1, event_argv);
            
            //do the drawing
            glClear( GL_COLOR_BUFFER_BIT );
            
            GLfloat rot[16], scale[16], trans[16];
            modelView = new GLfloat[16];
            
            loadOrthoMatrix(modelView, 0, 800, 800, 0, 0, 100);
            
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            
            Handle<ObjectTemplate> point_templ = ObjectTemplate::New();
            point_templ->SetInternalFieldCount(1);
            point_templ->Set(String::NewSymbol("fillQuadColor"),FunctionTemplate::New(GLGFX::node_fillQuadColor)->GetFunction());
            
            GLGFX* gfx = new GLGFX();
            Local<Object> obj = point_templ->NewInstance();
            obj->SetInternalField(0, External::New(gfx));
            Handle<Value> argv[] = { obj };
            drawCB->Call(Context::GetCurrent()->Global(), 1, argv);
            
            glfwSwapBuffers();
        }
    
        glfwTerminate();
        exit(EXIT_SUCCESS);
        
        
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
        gfx->fillQuadColor(NULL, new Bounds(0,0,50,50));
        delete gfx;
        glfwSwapBuffers();
    }
    
    glfwTerminate();
    exit(EXIT_SUCCESS);

    return scope.Close(Undefined());
}
    


void InitAll(Handle<Object> exports, Handle<Object> module) {
  MacCore::Init();
  exports->Set(String::NewSymbol("createCore"),FunctionTemplate::New(CreateObject)->GetFunction());
  exports->Set(String::NewSymbol("testNative"),FunctionTemplate::New(TestNative)->GetFunction());
}

NODE_MODULE(amino, InitAll)


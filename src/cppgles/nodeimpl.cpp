//#define BUILDING_NODE_EXTENSION
#include <math.h>
#include <node.h>
#include "out.h"
#include "impl.h"
#include "mathutils.h"
#include <GL/glfw.h>
#include <stack>

using namespace v8;

class GLGFX: public GFX, public node::ObjectWrap {
public:
    static void dumpValue(Local<Value> val) {
        if(val.IsEmpty()) { printf("is empty\n"); }
        if(val->IsFunction()) { printf("it is a function\n"); }
        if(val->IsString()) { printf("it is a string\n"); }
        if(val->IsArray()) {    printf("it is an array\n"); }
        if(val->IsObject()) {   printf("it is an object\n"); }
        if(val->IsBoolean()) {  printf("it is a boolean\n");  }
        if(val->IsNumber()) {  printf("it is a number\n");  }
        if(val->IsExternal()) {  printf("it is external\n");  }
        if(val->IsInt32()) {  printf("it is int32\n");  }
        if(val->IsUint32()) {  printf("it is uint32\n");  }
        if(val->IsDate()) {  printf("it is a date\n");  }
        if(val->IsBooleanObject()) { printf("it is a Boolean Object\n");  }
        if(val->IsNumberObject()) {  printf("it is a Number Object\n");  }
        if(val->IsStringObject()) { printf("it is a String Object\n");  }
        if(val->IsNativeError()) {  printf("it is a Native Error\n");  }
        if(val->IsRegExp()) {  printf("it is a Reg Exp\n");  }
    }
    static Handle<v8::Value> node_fillQuadColor(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        Local<Value> arg(args[0]);
        
        v8::String::Utf8Value param1(args[0]->ToString());
        std::string foo = std::string(*param1);    
        //printf("str %s\n",foo.c_str());
        
        if(args[1]->IsObject()) {
            Local<Object> bnds = args[1]->ToObject();
            Local<Value> w = bnds->Get(String::New("w"));
            //dumpValue(w);
            double dx = bnds->Get(String::New("x"))->NumberValue();
            double dy = bnds->Get(String::New("y"))->NumberValue();
            double dw = bnds->Get(String::New("w"))->NumberValue();
            double dh = bnds->Get(String::New("h"))->NumberValue();
            self->fillQuadColor(NULL,new BBounds(dx,dy,dw,dh));
        }

        return scope.Close(Undefined());
    }
    
    GLfloat* transform;
    stack<void*> matrixStack;
    GLGFX() {
        transform = new GLfloat[16];
        make_identity_matrix(transform);
    }
    ~GLGFX() {
    }
    void save() {
        GLfloat* t2 = new GLfloat[16];
        for(int i=0; i<16; i++) {
            t2[i] = transform[i];
        }
        matrixStack.push(transform);
        transform = t2;
    }
    
    void restore() {
        transform = (GLfloat*)matrixStack.top();
        matrixStack.pop();
    }

    void translate(double x, double y) {
        GLfloat tr[16];
        GLfloat trans2[16];
        make_trans_matrix((float)x,(float)y,tr);
        mul_matrix(trans2, transform, tr);
        for (int i = 0; i < 16; i++) transform[i] = trans2[i];
    }
    
    void fillQuadColor(Color* color, Bounds* bounds) {
        float x =  bounds->getX();
        float y =  bounds->getY();
        float x2 = bounds->getX()+bounds->getW();
        float y2 = bounds->getY()+bounds->getH();
        //printf("filling quad color with %f,%f -> %f,%f\n",x,y,x2,y2);
    
        
        GLfloat verts[6][2];
        GLfloat colors[6][3];
        
        //BColor* tcol = (BColor*)color;
        
        for(int i=0; i<6; i++) {
            for(int j=0; j<3; j++) {
                //                colors[i][j] = tcol->comps[j];
                colors[i][j] = 0.8;
            }
        }
        
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
        
        //printf("view = %f, trans = %f\n", modelView[0], transform[0]);
        colorShader->apply(modelView, transform,verts,colors);
    }
    void scale(double x, double y){
    }
    void rotate(double theta){
    }
private:
};

class NodeCore : public Core , public node::ObjectWrap {
public:
    static void Init() {
        if(!glfwInit()) {
            printf("error. quitting\n");
            glfwTerminate();
            exit(EXIT_FAILURE);
        }
        printf("inited the GLFW\n");
        
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
      NodeCore* obj = new NodeCore();
      obj->Wrap(args.This());
      return args.This();
    }
    NodeCore() {
        printf("in the NodeCore constructor\n");
    }
    ~NodeCore() { }
    
    static v8::Handle<v8::Value> real_OpenWindow(const v8::Arguments& args) {
        HandleScope scope;
        int ret = glfwOpenWindow(640, 480, 8, 8, 8, 0, 24, 0, GLFW_WINDOW);
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
            
            // Set the modelview/projection matrix
            float sc = 0.0017;
            //float sc = 0.0031;
            make_scale_matrix(sc*1.73,sc*-1,sc, scale);
            make_trans_matrix(-640/2,-480/2,trans);
            make_z_rot_matrix(0, rot);
            
            GLfloat mat2[16];
            mul_matrix(mat2, scale, rot);
            mul_matrix(modelView, mat2, trans);
            
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
    
private:
    static v8::Persistent<v8::Function> constructor;
};
Persistent<Function> NodeCore::constructor;


Handle<Value> CreateObject(const Arguments& args) {
    HandleScope scope;
    return scope.Close(NodeCore::NewInstance(args));
}


void InitAll(Handle<Object> exports, Handle<Object> module) {
  NodeCore::Init();
  module->Set(String::NewSymbol("exports"),FunctionTemplate::New(CreateObject)->GetFunction());
}

NODE_MODULE(aminonode, InitAll)


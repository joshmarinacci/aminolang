#include <node.h>
#include <node_buffer.h>
#include <stack>
#include <string>
#include <map>
#include "common.h"
#include "shaders.h"
#include "mathutils.h"

#include <time.h>

#ifdef MAC
#include <mach/mach_time.h>
#endif


// from android samples
/* return current time in milliseconds */



static double now_ms(void) {
    return 0;
    
    /*
    struct timespec res;
    clock_gettime(CLOCK_REALTIME, &res);
    return 1000.0 * res.tv_sec + (double) res.tv_nsec / 1e6;
    */
}


using namespace v8;
using namespace node;

static GLfloat* modelView;
static GLfloat* globaltx;
static ColorShader* colorShader;
static RectShader* rectShader;
static FontShader* fontShader;
static TextureShader* textureShader;
static std::stack<void*> matrixStack;

static std::map<int,AminoFont*> fontmap;

class GLGFX : public node::ObjectWrap {
public:
    static v8::Persistent<v8::Function> constructor;
    
    static void Init() {
        Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
        tpl->SetClassName(String::NewSymbol("GFX"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);
        tpl->PrototypeTemplate()->Set(String::NewSymbol("fillQuadColor"),FunctionTemplate::New(node_fillQuadColor)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("strokeQuadColor"),FunctionTemplate::New(node_strokeQuadColor)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("fillQuadText"),FunctionTemplate::New(node_fillQuadText)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("fillQuadTexture"),FunctionTemplate::New(node_fillQuadTexture)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("fillQuadTextureSlice"),FunctionTemplate::New(node_fillQuadTextureSlice)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("save"),FunctionTemplate::New(node_save)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("restore"),FunctionTemplate::New(node_restore)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("translate"),FunctionTemplate::New(node_translate)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("rotate"),FunctionTemplate::New(node_rotate)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("scale"),FunctionTemplate::New(node_scale)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("enableClip"),FunctionTemplate::New(node_enableClip)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("disableClip"),FunctionTemplate::New(node_disableClip)->GetFunction());
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
      GLGFX* obj = new GLGFX();
      obj->Wrap(args.This());
      return args.This();
    }
    
    
    static void dumpValue(Local<Value> val) {
        if(val.IsEmpty()) { printf("is empty\n"); }
        if(val->IsFunction()) { printf("it is a function\n"); }
        if(val->IsString()) { printf("it is a string\n"); }
        if(val->IsArray()) {    printf("it is an array\n"); }
        if(val->IsObject()) {   printf("it is an objects\n"); }
        printf("yep it is\n");
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
        
        double r = 1;
        double g = 0;
        double b = 1;
        if(args[0]->IsObject()) {
            Local<Object> fill = args[0]->ToObject();
            r = fill->Get(String::New("r"))->NumberValue();
            g = fill->Get(String::New("g"))->NumberValue();
            b = fill->Get(String::New("b"))->NumberValue();
        }
        
        
        if(args[1]->IsObject()) {
            Local<Object> bnds = args[1]->ToObject();
            double dx = bnds->Get(String::New("x"))->NumberValue();
            double dy = bnds->Get(String::New("y"))->NumberValue();
            double dw = bnds->Get(String::New("w"))->NumberValue();
            double dh = bnds->Get(String::New("h"))->NumberValue();
            self->fillQuadColor(r,g,b,new Bounds(dx,dy,dw,dh));
        }

        return scope.Close(Undefined());
    }
    
    static Handle<v8::Value> node_fillQuadText(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        
        if(args.Length() < 6) {
            printf("WARNING: node_fillQuadText not called with correct number of parameters\n");
        }
        //text color
        Local<Object> color = args[0]->ToObject();
        double r = color->Get(String::New("r"))->NumberValue();
        double g = color->Get(String::New("g"))->NumberValue();
        double b = color->Get(String::New("b"))->NumberValue();
        
        //string to draw
        v8::String::Utf8Value param1(args[1]->ToString());
        std::string text = std::string(*param1);    
        char * cstr = new char [text.length()+1];
        std::strcpy (cstr, text.c_str());
        
        //x and y position
        double x = args[2]->ToNumber()->NumberValue();
        double y = args[3]->ToNumber()->NumberValue();
        
        double fsize = 35;
        if(args.Length() >= 5) {
            fsize = args[4]->ToNumber()->NumberValue();
        }
        
        int fontid = -1;
        AminoFont* font = NULL;
        if(args.Length() >= 6) {
            fontid = args[5]->ToNumber()->NumberValue();
            font = fontmap[fontid];
        }
        self->fillQuadText(cstr, x, y, r,g,b, fsize, font);
        return scope.Close(Undefined());
    }
    
    static Handle<v8::Value> node_fillQuadTexture(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        int texid = args[0]->ToNumber()->NumberValue();
        double x  = args[1]->ToNumber()->NumberValue();
        double y  = args[2]->ToNumber()->NumberValue();
        double w  = args[3]->ToNumber()->NumberValue();
        double h  = args[4]->ToNumber()->NumberValue();
        self->fillQuadTexture(texid,x,y,w,h);
        return scope.Close(Undefined());
    }
    
    static Handle<v8::Value> node_fillQuadTextureSlice(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        int texid  = args[0]->ToNumber()->NumberValue();
        double sx  = args[1]->ToNumber()->NumberValue();
        double sy  = args[2]->ToNumber()->NumberValue();
        double sw  = args[3]->ToNumber()->NumberValue();
        double sh  = args[4]->ToNumber()->NumberValue();
        double dx  = args[5]->ToNumber()->NumberValue();
        double dy  = args[6]->ToNumber()->NumberValue();
        double dw  = args[7]->ToNumber()->NumberValue();
        double dh  = args[8]->ToNumber()->NumberValue();
        self->fillQuadTextureSlice(texid,sx,sy,sw,sh, dx,dy,dw,dh);
        return scope.Close(Undefined());
    }
    
    //GLfloat* transform;
    GLGFX() {
        globaltx = new GLfloat[16];
        make_identity_matrix(globaltx);
    }
    ~GLGFX() {
    }
    
    static Handle<v8::Value> node_save(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        self->save();
        return scope.Close(Undefined());
    }
    void save() {
        GLfloat* t2 = new GLfloat[16];
        for(int i=0; i<16; i++) {
            t2[i] = globaltx[i];
        }
        matrixStack.push(globaltx);
        globaltx = t2;
    }
    
    static Handle<v8::Value> node_restore(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        self->restore();
        return scope.Close(Undefined());
    }
    void restore() {
        globaltx = (GLfloat*)matrixStack.top();
        matrixStack.pop();
    }

    static Handle<v8::Value> node_translate(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        double x = args[0]->ToNumber()->NumberValue();
        double y = args[1]->ToNumber()->NumberValue();
        self->translate(x,y);
        return scope.Close(Undefined());
    }
    void translate(double x, double y) {
        GLfloat tr[16];
        GLfloat trans2[16];
        make_trans_matrix((float)x,(float)y,tr);
        mul_matrix(trans2, globaltx, tr);
        for (int i = 0; i < 16; i++) globaltx[i] = trans2[i];
    }
    void translateZ(double z) {
        GLfloat tr[16];
        GLfloat trans2[16];
        make_trans_z_matrix((float)z,tr);
        mul_matrix(trans2, globaltx, tr);
        for (int i = 0; i < 16; i++) globaltx[i] = trans2[i];
    }
    
    static Handle<v8::Value> node_rotate(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        double a = args[0]->ToNumber()->NumberValue();
        self->rotate(a);
        return scope.Close(Undefined());
    }
    void rotate(double a) {
        GLfloat rot[16];
        GLfloat temp[16];
        make_z_rot_matrix(a, rot);
        mul_matrix(temp, globaltx, rot);
        for (int i = 0; i < 16; i++) globaltx[i] = temp[i];
    }
    void rotateY(double a) {
        GLfloat rot[16];
        GLfloat trans2[16];
        make_y_rot_matrix(a, rot);
        mul_matrix(trans2, globaltx, rot);
        for (int i = 0; i < 16; i++) globaltx[i] = trans2[i];
    }
    static Handle<v8::Value> node_scale(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        double sx = args[0]->ToNumber()->NumberValue();
        double sy = args[1]->ToNumber()->NumberValue();
        self->scale(sx,sy);
        return scope.Close(Undefined());
    }
    void scale(double x, double y){
        GLfloat scale[16];
        GLfloat temp[16];
        make_scale_matrix((float)x,(float)y, 1.0, scale);
        mul_matrix(temp, globaltx, scale);
        for (int i = 0; i < 16; i++) globaltx[i] = temp[i];
    }
    
    static Handle<v8::Value> node_enableClip(const v8::Arguments& args) {
        //printf("in enable clip\n");
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        
        //printf("checking object\n");
        if(args[0]->IsObject()) {
            Local<Object> bnds = args[0]->ToObject();
            //printf("got object\n");
            double dx = bnds->Get(String::New("x"))->NumberValue();
            double dy = bnds->Get(String::New("y"))->NumberValue();
            double dw = bnds->Get(String::New("w"))->NumberValue();
            double dh = bnds->Get(String::New("h"))->NumberValue();
            //printf("got vals: %f %f %f %f\n",dx,dy,dw,dh);
            //self->enableClip(new Bounds(dx,dy,dw,dh));
            glScissor(dx,dy,dw,dh);
            glEnable(GL_SCISSOR_TEST);
        }
        return scope.Close(Undefined());
    }
    
    static Handle<v8::Value> node_disableClip(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        //self->disableClip();
        glDisable(GL_SCISSOR_TEST);
        return scope.Close(Undefined());
    }


    void fillQuadColor(float r, float g, float b, Bounds* bounds) {
        
        float x =  bounds->getX();
        float y =  bounds->getY();
        float x2 = bounds->getX()+bounds->getW();
        float y2 = bounds->getY()+bounds->getH();

        
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
        
        GLfloat colors[6][3];
        
        for(int i=0; i<6; i++) {
            for(int j=0; j<3; j++) {
                colors[i][j] = 0.5;
                if(j==0) colors[i][j] = r;
                if(j==1) colors[i][j] = g;
                if(j==2) colors[i][j] = b;
            }
        }
        
        colorShader->apply(modelView, globaltx, verts, colors);
    }
    
    
    static Handle<v8::Value> node_strokeQuadColor(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        
        double r = 1;
        double g = 0;
        double b = 1;
        if(args[0]->IsObject()) {
            Local<Object> fill = args[0]->ToObject();
            r = fill->Get(String::New("r"))->NumberValue();
            g = fill->Get(String::New("g"))->NumberValue();
            b = fill->Get(String::New("b"))->NumberValue();
        }
        
        
        if(args[1]->IsObject()) {
            Local<Object> bnds = args[1]->ToObject();
            double dx = bnds->Get(String::New("x"))->NumberValue();
            double dy = bnds->Get(String::New("y"))->NumberValue();
            double dw = bnds->Get(String::New("w"))->NumberValue();
            double dh = bnds->Get(String::New("h"))->NumberValue();
            self->strokeQuadColor(r,g,b,new Bounds(dx,dy,dw,dh));
        }

        return scope.Close(Undefined());
    }
    
    void strokeQuadColor(float r, float g, float b, Bounds* bounds) {
        float x =  bounds->getX();
        float y =  bounds->getY();
        float x2 = bounds->getX()+bounds->getW();
        float y2 = bounds->getY()+bounds->getH();

        GLfloat verts[8][2];
        verts[0][0] = x;
        verts[0][1] = y;
        verts[1][0] = x2;
        verts[1][1] = y;
        
        verts[2][0] = x2;
        verts[2][1] = y;
        verts[3][0] = x2;
        verts[3][1] = y2;
        
        verts[4][0] = x2;
        verts[4][1] = y2;
        verts[5][0] = x;
        verts[5][1] = y2;
        
        verts[6][0] = x;
        verts[6][1] = y2;
        verts[7][0] = x;
        verts[7][1] = y;

        GLfloat colors[8][3];
        
        for(int i=0; i<8; i++) {
            for(int j=0; j<3; j++) {
                colors[i][j] = 0.5;
                if(j==0) colors[i][j] = r;
                if(j==1) colors[i][j] = g;
                if(j==2) colors[i][j] = b;
            }
        }
        
        rectShader->apply(modelView, globaltx, verts, colors);
    }
    
    void fillQuadText(char* text, double x, double y, double r, double g, double b, double fsize, AminoFont* font) {
        fontShader->apply(modelView, globaltx, text, x, y, r, g, b, fsize, font);
    }
    void fillQuadTexture(int texid, double x, double y, double w, double h) {
        float x2 = x+w;
        float y2 = y+h;
    
        GLfloat verts[6][2];
        verts[0][0] = x;    verts[0][1] = y;
        verts[1][0] = x2;   verts[1][1] = y;
        verts[2][0] = x2;   verts[2][1] = y2;
        
        verts[3][0] = x2;   verts[3][1] = y2;
        verts[4][0] = x;    verts[4][1] = y2;
        verts[5][0] = x;    verts[5][1] = y;
        
        GLfloat texcoords[6][2];
        float tx  = 0;
        float ty2 = 1;
        float tx2 = 1;
        float ty  = 0;
        texcoords[0][0] = tx;    texcoords[0][1] = ty;
        texcoords[1][0] = tx2;   texcoords[1][1] = ty;
        texcoords[2][0] = tx2;   texcoords[2][1] = ty2;
        
        texcoords[3][0] = tx2;   texcoords[3][1] = ty2;
        texcoords[4][0] = tx;    texcoords[4][1] = ty2;
        texcoords[5][0] = tx;    texcoords[5][1] = ty;
        
        textureShader->apply(modelView, globaltx, verts, texcoords, texid);
    }
    void fillQuadTextureSlice(int texid, 
        double sx, double sy, double sw, double sh,
        double x, double y, double w, double h
        ) {
    
        float x2 = x+w;
        float y2 = y+h;
        GLfloat verts[6][2];
        verts[0][0] = x;    verts[0][1] = y;
        verts[1][0] = x2;   verts[1][1] = y;
        verts[2][0] = x2;   verts[2][1] = y2;
        
        verts[3][0] = x2;   verts[3][1] = y2;
        verts[4][0] = x;    verts[4][1] = y2;
        verts[5][0] = x;    verts[5][1] = y;
        
         
        float fw = 512;
        float fh = 512;
        GLfloat texcoords[6][2];
        float tx  = sx/fw;
        float ty  = sy/fh;
        float tx2 = (sx+sw)/fw;
        float ty2 = (sy+sh)/fh;
        texcoords[0][0] = tx;    texcoords[0][1] = ty;
        texcoords[1][0] = tx2;   texcoords[1][1] = ty;
        texcoords[2][0] = tx2;   texcoords[2][1] = ty2;
        
        texcoords[3][0] = tx2;   texcoords[3][1] = ty2;
        texcoords[4][0] = tx;    texcoords[4][1] = ty2;
        texcoords[5][0] = tx;    texcoords[5][1] = ty;
        
        textureShader->apply(modelView, globaltx, verts, texcoords, texid);
    }
    
private:
};
Persistent<Function> GLGFX::constructor;


class NodeCore {
public:
    NodeCore() {
    }
    ~NodeCore() { }
        
    static v8::Persistent<v8::Function> constructor;
private:
};
Persistent<Function> NodeCore::constructor;


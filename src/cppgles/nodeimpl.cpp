//#define BUILDING_NODE_EXTENSION
#include <math.h>
#include <node.h>
#include "out.h"
#include "impl.h"
#include <GL/glfw.h>
#include <stack>

using namespace v8;

//these should probably move into the NodeStage class or a GraphicsUtils class
#define ASSERT_EQ(A, B) {if ((A) != (B)) {printf ("ERROR: %d\n", __LINE__); exit(9); }}
#define ASSERT_NE(A, B) {if ((A) == (B)) {printf ("ERROR: %d\n", __LINE__); exit(9); }}
#define EXPECT_TRUE(A) {if ((A) == 0) {printf ("ERROR: %d\n", __LINE__); exit(9); }}
static GLfloat view_rotx = 90, view_roty = 0.0;
static GLfloat* modelView;
static ColorShader* colorShader;

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
make_trans_matrix(GLfloat x, GLfloat y, GLfloat *m)
{
    make_identity_matrix(m);
    m[12] = x;
    m[13] = y;
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

class GLGFX: public GFX {
public:
    GLfloat* transform;
    stack<void*> matrixStack;
    GLGFX() {
        transform = new GLfloat[16];
        make_identity_matrix(transform);
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
        printf("filling quad color with %f,%f -> %f,%f\n",x,y,x2,y2);
    
        
        GLfloat verts[6][2];
        GLfloat colors[6][3];
        
        BColor* tcol = (BColor*)color;
        
        for(int i=0; i<6; i++) {
            for(int j=0; j<3; j++) {
//                colors[i][j] = tcol->comps[j];
                colors[i][j] = 0.8;
            }
        }
        
        
        static GLfloat sverts[6][2] = {
          { -1, -1 },
          {  1, -1 },
          {  1,  1 },
          {  1,  1 },
          { -1,  1 },
          { -1, -1 }
        };
        
        
        for(int i=0; i<6; i++) {
            for(int j=0; j<2; j++) {
                verts[i][j] = sverts[i][j];
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
        
        colorShader->apply(modelView, transform,verts,colors);
    }
    void scale(double x, double y){
    }
    void rotate(double theta){
    }
};



class NodeRect : public Rect, public node::ObjectWrap {
public:
    static void Init() {
        Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
        tpl->SetClassName(String::NewSymbol("Rect"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);
        tpl->PrototypeTemplate()->Set(String::NewSymbol("setW"),FunctionTemplate::New(SetW)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("setH"),FunctionTemplate::New(SetH)->GetFunction());
        constructor = Persistent<Function>::New(tpl->GetFunction());
    }
    static Handle<Value> NewInstance(const Arguments& args) {
        HandleScope scope;
        const unsigned argc = 1;
        Handle<Value> argv[argc] = { args[0] };
        Local<Object> instance = constructor->NewInstance(argc, argv);
        return scope.Close(instance);
    }
    static Handle<Value> New(const Arguments& args) {
        HandleScope scope;
        NodeRect* obj = new NodeRect();
        obj->Wrap(args.This());
        return args.This();
    }

    void draw(GFX* gfx) {
        printf("NodeRect::draw\n");
        Bounds* bounds = getBounds();
        GLGFX* g = (GLGFX*)gfx;
        setFill(new BColor(0.5,0.6,0.7));
        g->fillQuadColor(getFill(), bounds);
    }
    Bounds* getBounds() {
        BBounds* b = new BBounds(
                this->getX(),
                this->getY(),
                this->getW(),
                this->getH()
            );
        return b;
    }
    
private:    
    static v8::Persistent<v8::Function> constructor;
    //invoke the real SetW
    static v8::Handle<v8::Value> SetW(const v8::Arguments& args) {
        printf("setting the width %f\n", args[0]->NumberValue());
        Rect* obj = ObjectWrap::Unwrap<Rect>(args.This());
        obj->w = args[0]->NumberValue();
        HandleScope scope;
        return scope.Close(Undefined());
    }
    
    //invoke the real SetH
    static v8::Handle<v8::Value> SetH(const v8::Arguments& args) {
        printf("setting the height %f\n", args[0]->NumberValue());
        Rect* obj = ObjectWrap::Unwrap<Rect>(args.This());
        obj->h = args[0]->NumberValue();
        HandleScope scope;
        return scope.Close(Undefined());
    }
};
Persistent<Function> NodeRect::constructor;

class NodeStage : public Stage, public node::ObjectWrap {
public:
    static void Init() {
        Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
        tpl->SetClassName(String::NewSymbol("Stage"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);
        tpl->PrototypeTemplate()->Set(String::NewSymbol("setRoot"),FunctionTemplate::New(SetRoot)->GetFunction());
        constructor = Persistent<Function>::New(tpl->GetFunction());
    }
    static Handle<Value> NewInstance(const Arguments& args) {
        HandleScope scope;
        const unsigned argc = 1;
        Handle<Value> argv[argc] = { args[0] };
        Local<Object> instance = constructor->NewInstance(argc, argv);
        return scope.Close(instance);
    }
    static Handle<Value> New(const Arguments& args) {
        HandleScope scope;
        NodeStage* obj = new NodeStage();
        obj->Wrap(args.This());
        return args.This();
    }
    
    void draw() {
        GLfloat /*mat[16], */rot[16], scale[16], trans[16];
        modelView = new GLfloat[16];
        
        // Set the modelview/projection matrix
        float sc = 0.0017;
        //float sc = 0.0031;
        make_scale_matrix(sc*1.73,sc*-1,sc, scale);
        //make_scale_matrix(sc,sc,sc,scale);
        make_trans_matrix(-640/2,-480/2,trans);
        make_z_rot_matrix(0, rot);
        
        GLfloat mat2[16];
        mul_matrix(mat2, scale, rot);
        mul_matrix(modelView, mat2, trans);
        
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        
        GLGFX* gfx = new GLGFX();
        drawIt(gfx,root);
        delete gfx;
    }
    
    void drawIt(GLGFX* gfx, Node* root) {
        if(!root->getVisible()) return;
    //    gfx->save();
    //    printf("tx = %f ty = %f\n",root->getTx(),root->getTy());
    //    gfx->translate(root->getTx(), root->getTy());
        root->draw(gfx);
    //    gfx->restore();
    }
private:
    static v8::Persistent<v8::Function> constructor;    
    //invoke the real SetH
    static v8::Handle<v8::Value> SetRoot(const v8::Arguments& args) {
        HandleScope scope;
        NodeStage* self = ObjectWrap::Unwrap<NodeStage>(args.This());
        NodeRect* root = ObjectWrap::Unwrap<NodeRect>(args[0]->ToObject());
        self->root = root;
        return scope.Close(Undefined());
    }
};
Persistent<Function> NodeStage::constructor;

class NodeCore : public Core , public node::ObjectWrap {
public:
    static void Init() {
        if(!glfwInit()) {
            printf("error. quitting\n");
            glfwTerminate();
            exit(EXIT_FAILURE);
        }
        
        // Prepare constructor template
        Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
        tpl->SetClassName(String::NewSymbol("Core"));
        tpl->InstanceTemplate()->SetInternalFieldCount(1);
        tpl->PrototypeTemplate()->Set(String::NewSymbol("start"),
            FunctionTemplate::New(Start)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("createStage"),
            FunctionTemplate::New(CreateStage)->GetFunction());
        tpl->PrototypeTemplate()->Set(String::NewSymbol("createRect"),
            FunctionTemplate::New(CreateRect)->GetFunction());
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
    
    Stage* createStage() {
        printf("real create stage\n");
        /* Create a windowed mode window and its OpenGL context */
        int ret = glfwOpenWindow(640, 480, 8, 8, 8, 0, 24, 0, GLFW_WINDOW);
        if(!ret) {
            printf("error. quitting\n");
            glfwTerminate();
            exit(EXIT_FAILURE);
        }
        //_stage = new NodeStage();
        //return _stage;
        return NULL;
    }
    
    static v8::Handle<v8::Value> CreateStage(const v8::Arguments& args) {
        printf("wrappered NodeCore:CreateStage\n");
        HandleScope scope;
        NodeCore* self = ObjectWrap::Unwrap<NodeCore>(args.This());
        self->createStage();
        Handle<Value> newObj = NodeStage::NewInstance(args);
        self->_stage = ObjectWrap::Unwrap<NodeStage>(newObj->ToObject());
        return scope.Close(newObj);
    }
    
    
    Rect* createRect() {
        return new NodeRect();
    }
    
    static v8::Handle<v8::Value> CreateRect(const v8::Arguments& args) {
        HandleScope scope;
        NodeCore* self = Unwrap<NodeCore>(args.This());
        Handle<Value> newObj = NodeRect::NewInstance(args);
        return scope.Close(newObj);
    }
    
    
    void realstart(Callback* fn) {
        printf("starting\n");
        colorShader = new ColorShader();
        
        while (glfwGetWindowParam(GLFW_OPENED))
        {
            printf("drawing\n");
            glClear( GL_COLOR_BUFFER_BIT );
            this->_stage->draw();
            glfwSwapBuffers();
        }
    
        glfwTerminate();
        exit(EXIT_SUCCESS);
    }
    
    static v8::Handle<v8::Value> Start(const v8::Arguments& args) {
        HandleScope scope;
        Core* self = Unwrap<NodeCore>(args.This());
        printf("starting\n");
        Callback* cb = new Callback();
        self->start(cb);
        printf("starting\n");
        return scope.Close(Undefined());
    }
    
private:
    NodeStage* _stage;
    static v8::Persistent<v8::Function> constructor;
};
Persistent<Function> NodeCore::constructor;


Handle<Value> CreateObject(const Arguments& args) {
    printf("invoking CreateObject\n");
    HandleScope scope;
    return scope.Close(NodeCore::NewInstance(args));
}


void InitAll(Handle<Object> exports, Handle<Object> module) {
    
  NodeCore::Init();
  NodeStage::Init();
  NodeRect::Init();

  module->Set(String::NewSymbol("exports"),
      FunctionTemplate::New(CreateObject)->GetFunction());
  
  /*
  NodeCore* core = new NodeCore();
  Stage* stage = core->createStage();
  Rect* rect   = core->createRect();
  rect->setW(100);
  rect->setH(100);
  rect->setVisible(true);
  stage->setRoot(rect);
  core->start(NULL);*/
}

NODE_MODULE(aminonode, InitAll)


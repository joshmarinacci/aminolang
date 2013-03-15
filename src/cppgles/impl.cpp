#include "build/cpp/out.h"
#include "src/cppgles/impl.h"


TColor::TColor(GLfloat r, GLfloat g, GLfloat b) {
    comps = new GLfloat[3];
    comps[0] = r;
    comps[1] = g;
    comps[2] = b;
}



TGroup::TGroup() {
    setVisible(true);
}
void TGroup::markDirty() {
}
bool TGroup::isParent() {
    return true;
}

void TGroup::add(Node* child) {
    this->nodes.push_back(child);
    child->setParent(this);
    this->markDirty();
}


/* ========== rect impl ============ */
TRect::TRect() {
    setVisible(true);
    setFill(new TColor(0,0,0));
}
Bounds* TRect::getBounds() {
    Bounds* b = new TBounds();
    b->setX(this->getX());
    b->setY(this->getY());
    b->setW(this->getW());
    b->setH(this->getH());
    return b;
}
    

void TRect::draw(GFX* gfx) {
    Bounds* bounds = getBounds();
    GLGFX* g = (GLGFX*)gfx;
//    Color* color = new TColor(0,0,1);
    g->fillQuadColor(getFill(), bounds);
    //delete bounds;
}



/* ==== Bounds Impl ========== */
float TBounds::getX2() {
    return this->getX() + this->getW();
}
float TBounds::getY2() {
    return this->getY() + this->getH();
}


/* === Shader impl ==== */

Shader::Shader() {
    printf("creating a shader\n");
}

int Shader::compileVertShader(const char* text) {
    GLint stat;
    GLuint vertShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertShader, 1, (const char **) &text, NULL);
    glCompileShader(vertShader);
    glGetShaderiv(vertShader, GL_COMPILE_STATUS, &stat);
    if (!stat) {
        printf("Error: vertex shader did not compile!\n");
        exit(1);
    }
    return vertShader;
}

int Shader::compileFragShader(const char* text) {
    GLint stat;
    GLuint fragShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragShader, 1, (const char **) &text, NULL);
    glCompileShader(fragShader);
    glGetShaderiv(fragShader, GL_COMPILE_STATUS, &stat);
    if (!stat) {
        printf("Error: fragment shader did not compile!\n");
        exit(1);
    }
    return fragShader;
}

int Shader::compileProgram(int vertShader, int fragShader) {
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
        exit(1);
    }
    return program;
}


/* ==== Color Shader impl === */
static GLint attr_pos = 0, attr_color = 1;
static GLint u_matrix = -1;
static GLint u_trans  = -1;

ColorShader::ColorShader() {
   static const char *fragShaderText =
      "precision mediump float;\n"
      "varying vec4 v_color;\n"
      "void main() {\n"
      "   gl_FragColor = v_color;\n"
//      "   gl_FragColor = vec4(1.0,0.0,1.0,1.0);\n"
      "}\n";
      
   static const char *vertShaderText =
      "uniform mat4 modelviewProjection;\n"
      "uniform mat4 trans;\n"
      "attribute vec4 pos;\n"
      "attribute vec4 color;\n"
      "varying vec4 v_color;\n"
      "void main() {\n"
      "   gl_Position = modelviewProjection * trans * pos;\n"
      "   v_color = color;\n"
      "}\n";

   GLuint vert = compileVertShader(vertShaderText);
   GLuint frag = compileFragShader(fragShaderText);
   GLuint prog = compileProgram(vert,frag);
   
   glUseProgram(prog);
   attr_pos   = glGetAttribLocation(prog, "pos");
   attr_color = glGetAttribLocation(prog, "color");
   u_matrix   = glGetUniformLocation(prog, "modelviewProjection");
   u_trans    = glGetUniformLocation(prog, "trans");
}   

//}
//void colorShaderApply(GLfloat verts[][2], GLfloat colors[][3]) {
void ColorShader::apply(GLfloat trans[16], GLfloat verts[][2], GLfloat colors[][3]) {
    glUniformMatrix4fv(u_trans, 1, GL_FALSE, trans);

    glVertexAttribPointer(attr_pos,   2, GL_FLOAT, GL_FALSE, 0, verts);
    glVertexAttribPointer(attr_color, 3, GL_FLOAT, GL_FALSE, 0, colors);
    glEnableVertexAttribArray(attr_pos);
    glEnableVertexAttribArray(attr_color);
    
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray(attr_pos);
    glDisableVertexAttribArray(attr_color);
}    


FontShader::FontShader() {
}

TextureShader::TextureShader() {
}

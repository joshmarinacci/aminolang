#include "build/cpp/out.h"
#include "src/cppgles/impl.h"

#include <png.h>

GLuint png_texture_load(const char * file_name, int * width, int * height);

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
//    g->fillQuadColor(getFill(), bounds);
    //g->fillQuadTexture(bounds, NULL);
    char* text = "ABCDEF";
    g->fillQuadText(text,0,0);
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

static GLint attr_texcoords = 0;
static GLint attr_tex = 0;
static GLint texID;

static int keys[] =  {-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,63,72,-1,74,75,76,78,68,80,81,79,83,64,84,65,66,53,54,55,56,57,58,59,60,61,62,-1,67,-1,85,-1,-1,73,0,1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,69,71,70,77,82,-1,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1};
static double offsets[] = {0.0,15.0,17.0,16.0,35.0,15.0,52.0,17.0,71.0,13.0,86.0,12.0,100.0,17.0,119.0,18.0,139.0,18.0,159.0,7.0,168.0,6.0,176.0,15.0,193.0,12.0,207.0,22.0,231.0,18.0,251.0,19.0,272.0,14.0,288.0,19.0,309.0,15.0,326.0,13.0,341.0,13.0,356.0,17.0,375.0,14.0,391.0,22.0,415.0,14.0,431.0,13.0,446.0,14.0,462.0,13.0,477.0,15.0,494.0,11.0,507.0,15.0,524.0,13.0,539.0,8.0,549.0,13.0,564.0,15.0,581.0,6.0,589.0,6.0,597.0,13.0,612.0,6.0,620.0,22.0,644.0,15.0,661.0,14.0,677.0,15.0,694.0,15.0,711.0,10.0,723.0,11.0,736.0,8.0,746.0,15.0,763.0,12.0,777.0,19.0,798.0,13.0,813.0,12.0,827.0,11.0,840.0,14.0,856.0,14.0,872.0,14.0,888.0,14.0,904.0,14.0,920.0,14.0,936.0,14.0,952.0,14.0,968.0,14.0,984.0,14.0,1000.0,6.0,1008.0,6.0,1016.0,6.0,1024.0,9.0,1035.0,6.0,1043.0,5.0,1050.0,8.0,1060.0,8.0,1070.0,9.0,1081.0,6.0,1089.0,22.0,1113.0,16.0,1131.0,14.0,1147.0,20.0,1169.0,13.0,1184.0,18.0,1204.0,13.0,1219.0,7.0,1228.0,7.0,1237.0,11.0,1250.0,14.0,1266.0,8.0,1276.0,14.0,};

FontShader::FontShader() {
    static const char *vertShaderText =
      "uniform mat4 modelviewProjection;\n"
      "uniform mat4 trans;\n"
      "attribute vec4 pos;\n"
      "attribute vec2 texcoords;\n"
      "varying vec2 uv;\n"
      "void main() {\n"
      "   gl_Position = modelviewProjection * trans * pos;\n"
      "   uv = texcoords;\n"
      "}\n";
      
    static const char *fragShaderText =
      "precision mediump float;\n"
      "varying vec2 uv;\n"
      "uniform sampler2D tex;\n"
      "void main() {\n"
//      "   vec4 texel = texture2D(tex, uv);\n"
      //"   if(texel.a <= 0.01) { discard; }\n"
      //"   gl_FragColor = vec4(texel.r,texel.g,1, 1);\n"
        "   gl_FragColor = texture2D(tex,uv);\n"
        //"   gl_FragColor = vec4(1.0,0.0,1.0,1.0);\n"
      "}\n";
      
    GLuint vert = compileVertShader(vertShaderText);
    GLuint frag = compileFragShader(fragShaderText);
    GLuint prog = compileProgram(vert,frag);
    
    glUseProgram(prog);
    //glEnable(GL_TEXTURE_2D);
    
    attr_pos = glGetAttribLocation(prog,"pos");
    attr_texcoords = glGetAttribLocation(prog, "texcoords");
    attr_tex = glGetAttribLocation(prog, "tex");
    u_matrix = glGetUniformLocation(prog, "modelViewProjection");
    u_trans  = glGetUniformLocation(prog, "trans");
    
    int w;
    int h;
    texID = png_texture_load("/data/klaatu/font3.png",&w,&h);
    printf("font texture = %d %d x %d\n",texID,w,h);
}
void FontShader::apply(GLfloat trans[16], char* text) {
//    glUseProgram(prog);
    glUniformMatrix4fv(u_trans, 1, GL_FALSE, trans);
    glUniform1i(attr_tex, 0);
    
    float charX = 0;
    int len = strlen(text);
    //printf("drawing text %s %d\n",text,len);

    for(int i=0; i<len; i++) {
        int ch = text[i];
        int n = keys[ch];
        float cho = (float) offsets[n*2];
        float chw = (float) offsets[n*2+1];
        //printf("drawing: %c key %d width = %f %f \n", ch, n, chw, cho);
        //p("drawing " + ch + " " + (char)ch + " key = " + n + " width = " + chw + " " + cho + " ");
        //float iw = 1121;//mainTexture.getImageWidth();
        //float ih = 34;//mainTexture.getImageHeight();
        float iw = 256;
        float ih = 256;

        float tx  = cho/iw;
        float ty  = 1.0-(25/ih);//7/ih;
        float tx2 = (cho+chw)/iw;
        float ty2 = 1.0-(7/ih);//(25*3)/ih;

        GLfloat texcoords[6][2];
        texcoords[0][0] = tx;    texcoords[0][1] = ty;
        texcoords[1][0] = tx2;   texcoords[1][1] = ty;
        texcoords[2][0] = tx2;   texcoords[2][1] = ty2;
        
        texcoords[3][0] = tx2;   texcoords[3][1] = ty2;
        texcoords[4][0] = tx;    texcoords[4][1] = ty2;
        texcoords[5][0] = tx;    texcoords[5][1] = ty;

        //set the texture coordinates
        glVertexAttribPointer(attr_texcoords, 2, GL_FLOAT, GL_FALSE, 0, texcoords);
        glEnableVertexAttribArray(attr_texcoords);


        TBounds* bounds = new TBounds();
        bounds->setX(charX);
        bounds->setY(0);
        bounds->setW(chw);
        bounds->setH(17);
        float x = (float)bounds->getX();
        float y = (float)bounds->getY();
        float x2 = (float)bounds->getX2();
        float y2 = (float)bounds->getY2();
        GLfloat verts[6][2];
        //printf("drawing at %f\n",x);
        verts[0][0] = x;    verts[0][1] = y;
        verts[1][0] = x2;   verts[1][1] = y;
        verts[2][0] = x2;   verts[2][1] = y2;
        
        verts[3][0] = x2;   verts[3][1] = y2;
        verts[4][0] = x;    verts[4][1] = y2;
        verts[5][0] = x;    verts[5][1] = y;
        
        //set the vertices
        glVertexAttribPointer(attr_pos, 2, GL_FLOAT, GL_FALSE, 0, verts);
        glEnableVertexAttribArray(attr_pos);
        //set the active texture
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D,texID);
        //draw it
        glDrawArrays(GL_TRIANGLES, 0, 6);
        charX += chw;
        glDisableVertexAttribArray(attr_pos);
        glDisableVertexAttribArray(attr_texcoords);
    }
}


TextureShader::TextureShader() {
    static const char *vertShaderText =
      "uniform mat4 modelviewProjection;\n"
      "uniform mat4 trans;\n"
      "attribute vec4 pos;\n"
      "attribute vec2 texcoords;\n"
      "varying vec2 uv;\n"
      "void main() {\n"
      "   gl_Position = modelviewProjection * trans * pos;\n"
      "   uv = texcoords;\n"
      "}\n";
      
    static const char *fragShaderText =
      "precision mediump float;\n"
      "varying vec2 uv;\n"
      "uniform sampler2D tex;\n"
      "void main() {\n"
        "   gl_FragColor = texture2D(tex,uv);\n"
        //"   gl_FragColor = vec4(1.0,0.0,1.0,1.0);\n"
      "}\n";
      
    GLuint vert = compileVertShader(vertShaderText);
    GLuint frag = compileFragShader(fragShaderText);
    GLuint prog = compileProgram(vert,frag);
    
    glUseProgram(prog);
    attr_pos   = glGetAttribLocation(prog, "pos");
    attr_texcoords = glGetAttribLocation(prog, "texcoords");
    attr_tex = glGetAttribLocation(prog, "tex");
    u_matrix   = glGetUniformLocation(prog, "modelviewProjection");
    u_trans    = glGetUniformLocation(prog, "trans");
    
    int w;
    int h;
    texID = png_texture_load("/data/klaatu/font3.png",&w,&h);
    printf("texture = %d %d x %d\n",texID,w,h);
}

void TextureShader::apply(GLfloat trans[16], GLfloat verts[][2], GLfloat texcoords[][2]) {
    glUniformMatrix4fv(u_trans, 1, GL_FALSE, trans);
    glUniform1i(attr_tex, 0);
    

    glVertexAttribPointer(attr_pos,   2, GL_FLOAT, GL_FALSE, 0, verts);
    glVertexAttribPointer(attr_texcoords, 2, GL_FLOAT, GL_FALSE, 0, texcoords);
    glEnableVertexAttribArray(attr_pos);
    glEnableVertexAttribArray(attr_texcoords);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, texID);
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray(attr_pos);
    glDisableVertexAttribArray(attr_texcoords);
}    




/* =========== PNG to Texture ========= */

GLuint png_texture_load(const char * file_name, int * width, int * height)
{
    png_byte header[8];

    FILE *fp = fopen(file_name, "rb");
    if (fp == 0)
    {
        perror(file_name);
        return 0;
    }

    // read the header
    fread(header, 1, 8, fp);

    if (png_sig_cmp(header, 0, 8))
    {
        fprintf(stderr, "error: %s is not a PNG.\n", file_name);
        fclose(fp);
        return 0;
    }

    png_structp png_ptr = png_create_read_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
    if (!png_ptr)
    {
        fprintf(stderr, "error: png_create_read_struct returned 0.\n");
        fclose(fp);
        return 0;
    }

    // create png info struct
    png_infop info_ptr = png_create_info_struct(png_ptr);
    if (!info_ptr)
    {
        fprintf(stderr, "error: png_create_info_struct returned 0.\n");
        png_destroy_read_struct(&png_ptr, (png_infopp)NULL, (png_infopp)NULL);
        fclose(fp);
        return 0;
    }

    // create png info struct
    png_infop end_info = png_create_info_struct(png_ptr);
    if (!end_info)
    {
        fprintf(stderr, "error: png_create_info_struct returned 0.\n");
        png_destroy_read_struct(&png_ptr, &info_ptr, (png_infopp) NULL);
        fclose(fp);
        return 0;
    }

    // the code in this if statement gets called if libpng encounters an error
    if (setjmp(png_jmpbuf(png_ptr))) {
        fprintf(stderr, "error from libpng\n");
        png_destroy_read_struct(&png_ptr, &info_ptr, &end_info);
        fclose(fp);
        return 0;
    }

    // init png reading
    png_init_io(png_ptr, fp);

    // let libpng know you already read the first 8 bytes
    png_set_sig_bytes(png_ptr, 8);

    // read all the info up to the image data
    png_read_info(png_ptr, info_ptr);

    // variables to pass to get info
    int bit_depth, color_type;
    png_uint_32 temp_width, temp_height;

    // get info about png
    png_get_IHDR(png_ptr, info_ptr, &temp_width, &temp_height, &bit_depth, &color_type,
        NULL, NULL, NULL);

    if (width){ *width = temp_width; }
    if (height){ *height = temp_height; }

    // Update the png info struct.
    png_read_update_info(png_ptr, info_ptr);

    // Row size in bytes.
    int rowbytes = png_get_rowbytes(png_ptr, info_ptr);

    // glTexImage2d requires rows to be 4-byte aligned
    rowbytes += 3 - ((rowbytes-1) % 4);

    // Allocate the image_data as a big block, to be given to opengl
    png_byte * image_data;
    image_data = (png_byte*) malloc(rowbytes * temp_height * sizeof(png_byte)+15);
    if (image_data == NULL)
    {
        fprintf(stderr, "error: could not allocate memory for PNG image data\n");
        png_destroy_read_struct(&png_ptr, &info_ptr, &end_info);
        fclose(fp);
        return 0;
    }

    // row_pointers is for pointing to image_data for reading the png with libpng
    png_bytep * row_pointers = (png_bytep*) malloc(temp_height * sizeof(png_bytep));
    if (row_pointers == NULL)
    {
        fprintf(stderr, "error: could not allocate memory for PNG row pointers\n");
        png_destroy_read_struct(&png_ptr, &info_ptr, &end_info);
        free(image_data);
        fclose(fp);
        return 0;
    }

    // set the individual row_pointers to point at the correct offsets of image_data
    int i;
    for (i = 0; i < temp_height; i++)
    {
        row_pointers[temp_height - 1 - i] = image_data + i * rowbytes;
    }

    // read the png into image_data through row_pointers
    png_read_image(png_ptr, row_pointers);

    // Generate the OpenGL texture object
    GLuint texture;
    glGenTextures(1, &texture);
    glBindTexture(GL_TEXTURE_2D, texture);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, temp_width, temp_height, 0, GL_RGB, GL_UNSIGNED_BYTE, image_data);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

    // clean up
    png_destroy_read_struct(&png_ptr, &info_ptr, &end_info);
    free(image_data);
    free(row_pointers);
    fclose(fp);
    return texture;
}

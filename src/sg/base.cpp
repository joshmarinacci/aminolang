#include "base.h"

using namespace v8;



ColorShader* colorShader;
TextureShader* textureShader;
FontShader* fontShader;
GLfloat* modelView;
GLfloat* globaltx;
int width = 640;
int height = 480;


std::stack<void*> matrixStack;
int rootHandle;
std::map<int,AminoFont*> fontmap;


void scale(double x, double y){
    GLfloat scale[16];
    GLfloat temp[16];
    make_scale_matrix((float)x,(float)y, 1.0, scale);
    mul_matrix(temp, globaltx, scale);
    copy_matrix(globaltx,temp);
}

void translate(double x, double y) {
    GLfloat tr[16];
    GLfloat trans2[16];
    make_trans_matrix((float)x,(float)y,0,tr);
    mul_matrix(trans2, globaltx, tr);
    copy_matrix(globaltx,trans2);
}

void rotate(double x, double y, double z) {
    GLfloat rot[16];
    GLfloat temp[16];
    
    
    make_x_rot_matrix(x, rot);
    mul_matrix(temp, globaltx, rot);
    copy_matrix(globaltx,temp);

    make_y_rot_matrix(y, rot);
    mul_matrix(temp, globaltx, rot);
    copy_matrix(globaltx,temp);
    
    make_z_rot_matrix(z, rot);
    mul_matrix(temp, globaltx, rot);
    copy_matrix(globaltx,temp);
}

void save() {
    GLfloat* temp = new GLfloat[16];
    copy_matrix(temp,globaltx);
    matrixStack.push(globaltx);
    globaltx = temp;
}

void restore() {
    globaltx = (GLfloat*)matrixStack.top();
    matrixStack.pop();
}

// --------------------------------------------------------------- add_text ---
static void add_text( vertex_buffer_t * buffer, texture_font_t * font,
               wchar_t * text, vec4 * color, vec2 * pen )
{
    size_t i;
    float r = color->red, g = color->green, b = color->blue, a = color->alpha;
    for( i=0; i<wcslen(text); ++i )
    {
        texture_glyph_t *glyph = texture_font_get_glyph( font, text[i] );
        if( glyph != NULL )
        {
            int kerning = 0;
            if( i > 0)
            {
                kerning = texture_glyph_get_kerning( glyph, text[i-1] );
            }
            pen->x += kerning;
            int x0  = (int)( pen->x + glyph->offset_x );
            int y0  = (int)( pen->y + glyph->offset_y );
            int x1  = (int)( x0 + glyph->width );
            int y1  = (int)( y0 - glyph->height );
            float s0 = glyph->s0;
            float t0 = glyph->t0;
            float s1 = glyph->s1;
            float t1 = glyph->t1;
            GLuint indices[6] = {0,1,2, 0,2,3};
            vertex_t vertices[4] = { { x0,y0,0,  s0,t0,  r,g,b,a },
                                     { x0,y1,0,  s0,t1,  r,g,b,a },
                                     { x1,y1,0,  s1,t1,  r,g,b,a },
                                     { x1,y0,0,  s1,t0,  r,g,b,a } };
            vertex_buffer_push_back( buffer, vertices, 4, indices, 6 );
            pen->x += glyph->advance_x;
        }
    }
}

void TextNode::refreshText() {
    if(fontid == INVALID) return;
    AminoFont* font = fontmap[fontid];
    vec2 pen = {{5,400}};
    vec4 black = {{0,1,0,1}};
    pen.x = 0;
    pen.y = 0;
    black.r = r;
    black.g = g;
    black.b = b;
    
    wchar_t *t2 = const_cast<wchar_t*>(text.c_str());//GetWC(text);
    vertex_buffer_delete(buffer);
    buffer = vertex_buffer_new( "vertex:3f,tex_coord:2f,color:4f" );
    texture_font_t *f = font->fonts[fontsize];
    assert(f);
    add_text(buffer,font->fonts[fontsize],t2,&black,&pen);
//    texture_font_delete(afont->font);
}
void TextNode::draw() {
    if(fontmap.size() < 1) return;
    if(fontid == INVALID) return;
    AminoFont* font = fontmap[fontid];
    save();
    translate(tx,ty);
    scale(scalex,scaley);
    rotate(rotatex,rotatey,rotatez);
    
    
    mat4   model, view, projection;
    mat4_set_identity( &projection );
    mat4_set_identity( &model );
    mat4_set_identity( &view );
    
    //view == globaltx, plus we must flip the ty coord
    size_t i;
    for(i=0;i<16; i++) {
        view.data[i] = globaltx[i];
    }
    view.data[13] = height-globaltx[13];
    
    glBindTexture( GL_TEXTURE_2D, font->atlas->id );
    mat4_set_orthographic( &projection, 0, width, 0, height, -1, 1);
    glEnable( GL_BLEND );
    glBlendFunc( GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA );
    glUseProgram( font->shader );
    {
        glUniform1i( glGetUniformLocation( font->shader, "texture" ),             0 );
        glUniformMatrix4fv( glGetUniformLocation( font->shader, "model" ),        1, 0,  model.data );
        glUniformMatrix4fv( glGetUniformLocation( font->shader, "view" ),         1, 0,  view.data  );
        glUniformMatrix4fv( glGetUniformLocation( font->shader, "projection" ),   1, 0,  projection.data);
        vertex_buffer_render(buffer, GL_TRIANGLES );
    }
    restore();
}


void Rect::draw() {
	if(visible == 0) return;
        float x =  this->x;
        float y =  this->y;
        float x2 = this->x+w;
        float y2 = this->y+h;
        
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
        
        save();
        translate(tx,ty);
        scale(scalex,scaley);
        rotate(rotatex,rotatey,rotatez);
        if(texid != INVALID) {
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
        } else {
            colorShader->apply(modelView, globaltx, verts, colors, opacity);
        }
        restore();
    }


void Group::draw() {
    if(visible != 1) return;
    save();
    translate(tx,ty);
    scale(scalex,scaley);
    rotate(rotatex,rotatey,rotatez);
    for(int i=0; i<children.size(); i++) {
        children[i]->draw();
    }
    restore();
}



#include "SimpleRenderer.h"


void SimpleRenderer::startRender(AminoNode* root) {
    GLContext* c = new GLContext();
    this->render(c,root);
}
void SimpleRenderer::render(GLContext* c, AminoNode* root) {
    if(root == NULL) {
        printf("WARNING. NULL NODE!\n");
        return;
    }
    
    //skip non-visible nodes
    if(root->visible != 1) return;
    
    c->save();
    c->translate(root->tx,root->ty);
    c->scale(root->scalex,root->scaley);
    c->rotate(root->rotatex,root->rotatey,root->rotatez);
    
    switch(root->type) {
    case GROUP:
        this->drawGroup(c,(Group*)root);
        break;
    case RECT:
        this->drawRect(c,(Rect*)root);
        break;
    case TEXT:
        this->drawText(c,(TextNode*)root);
        break;
    }
    
    c->restore();
}        


void SimpleRenderer::drawGroup(GLContext* c, Group* group) {
    if(group->cliprect == 1) {
        //turn on stenciling
        glDepthMask(GL_FALSE);
        glEnable(GL_STENCIL_TEST);
        //clear the buffers
        
        //setup the stencil
        glStencilFunc(GL_ALWAYS, 0x1, 0xFF);
        glStencilOp(GL_KEEP, GL_KEEP, GL_REPLACE);
        glStencilMask(0xFF);
        glColorMask( GL_FALSE, GL_FALSE, GL_FALSE, GL_FALSE );
        glDepthMask( GL_FALSE );
        glClear(GL_STENCIL_BUFFER_BIT | GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        
        //draw the stencil
        float x = 0;
        float y = 0;
        float x2 = group->w;
        float y2 = group->h;
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
                colors[i][j] = 1.0;
            }
        }
        colorShader->apply(modelView, c->globaltx, verts, colors, 1.0);
    
        //set function to draw pixels where the buffer is equal to 1
        glStencilFunc(GL_EQUAL, 0x1, 0xFF);
        glStencilMask(0x00);
        //turn color buffer drawing back on
        glColorMask(GL_TRUE,GL_TRUE,GL_TRUE,GL_TRUE);
        
    }
    for(int i=0; i<group->children.size(); i++) {
        this->render(c,group->children[i]);
    }
    if(group->cliprect == 1) {
        glDisable(GL_STENCIL_TEST);
    }
}
void SimpleRenderer::drawRect(GLContext* c, Rect* rect) {
    float x =  rect->x;
    float y =  rect->y;
    float x2 = rect->x+rect->w;
    float y2 = rect->y+rect->h;
        
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
            if(j==0) colors[i][j] = rect->r;
            if(j==1) colors[i][j] = rect->g;
            if(j==2) colors[i][j] = rect->b;
        }
    }
        
    if(rect->texid != INVALID) {
        GLfloat texcoords[6][2];
        float tx  = rect->left;
        float ty2 = rect->bottom;//1;
        float tx2 = rect->right;//1;
        float ty  = rect->top;//0;
        texcoords[0][0] = tx;    texcoords[0][1] = ty;
        texcoords[1][0] = tx2;   texcoords[1][1] = ty;
        texcoords[2][0] = tx2;   texcoords[2][1] = ty2;
        
        texcoords[3][0] = tx2;   texcoords[3][1] = ty2;
        texcoords[4][0] = tx;    texcoords[4][1] = ty2;
        texcoords[5][0] = tx;    texcoords[5][1] = ty;
        textureShader->apply(modelView, c->globaltx, verts, texcoords, rect->texid);
    } else {
        colorShader->apply(modelView, c->globaltx, verts, colors, rect->opacity);
    }
}

void SimpleRenderer::drawText(GLContext* c, TextNode* text) {
    if(fontmap.size() < 1) return;
    if(text->fontid == INVALID) return;
    AminoFont* font = fontmap[text->fontid];
    
    
    mat4   model, view, projection;
    mat4_set_identity( &projection );
    mat4_set_identity( &model );
    mat4_set_identity( &view );
    
    //view == globaltx, plus we must flip the ty coord
    size_t i;
    for(i=0;i<16; i++) {
        view.data[i] = c->globaltx[i];
    }
    view.data[13] = height-c->globaltx[13];
    
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
        vertex_buffer_render(text->buffer, GL_TRIANGLES );
    }
}


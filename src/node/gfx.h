#ifdef MAC
#include <GL/glfw.h>
#endif

#ifdef KLAATU
#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>
#endif

#ifdef LINUX
#include <GL/glfw.h>
#include <GL/glext.h>
#endif



class AminoFont {
public:
    int id;
    int texid;
    int minchar;
    int maxchar;
    
    int includedLength;
    float * included;
    int widthsLength;
    float * widths;
    int offsetsLength;
    float * offsets;
    void setData(char* data, int w, int h) {
        GLuint texture;
        glGenTextures(1, &texture);
        glBindTexture(GL_TEXTURE_2D, texture);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
        glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        texid = texture;
    }
};


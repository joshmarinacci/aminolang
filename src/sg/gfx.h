#ifndef AMINOGFX
#define AMINOGFX

#ifdef MAC
#include <GL/glfw.h>
#include <sys/time.h>

//return the current time in msec
static double getTime(void) {
    timeval time;
    gettimeofday(&time, NULL);
    long millis = (time.tv_sec * 1000) + (time.tv_usec / 1000);    
}

#endif

#ifdef KLAATU
#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>

//return the current time in msec
static double getTime(void) {
    struct timespec res;
    clock_gettime(CLOCK_REALTIME, &res);
    return 1000.0 * res.tv_sec + ((double) res.tv_nsec / 1e6);
}
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
    int imagewidth;
    int imageheight;
    int colcount;
    int rowcount;
    
    int includedLength;
    float * included;
    int widthsLength;
    float * widths;
    int offsetsLength;
    float * offsets;
    int yoffsetsLength;
    float * yoffsets;
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

#endif

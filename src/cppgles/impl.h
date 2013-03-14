#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>

class GLGFX: public GFX {
public:
    GLGFX();
    GLfloat transform[16];
    virtual void save();
    virtual void restore();
    virtual void translate(double x, double y);
    virtual void fillQuadColor(int color, Bounds* bounds);
    const static int RED = 1;
};


class TGroup : public Group {
public:
    virtual void add(Node* child);
    virtual void markDirty();
};

class TRect : public Rect {
public:
    TRect();
    virtual void draw(GFX* gfx);
    virtual Bounds* getBounds();
};

class TBounds : public Bounds {
public:
    virtual float getX2();
    virtual float getY2();
};



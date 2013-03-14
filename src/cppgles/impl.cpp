#include "build/cpp/out.h"


class TGroup : public Group {
public:
    virtual void add(Node* child);
    virtual void markDirty();
}

class TRect : public Rect {
public:
    TRect();
    virtual void draw(GFX* gfx);
};

void TGroup::markDirty() {
}

void TGroup::add(Node* child) {
    this->children.add(child);
    child->setParent(this);
    this->markDirty();
}

int TGroup::getChildCount() {
    return this->children.size();
}

Node* TGroup::getChild(int i) {
    return this->children.get(i);
}
    

/* ========== rect impl ============ */

void TRect::draw(GFX* gfx) {
    Bounds* bounds = getBounds();
    gfx.fillQuadColor(GFX::RED, bounds);
    bounds.destroy();
}





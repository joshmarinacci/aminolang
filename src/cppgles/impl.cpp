#include "build/cpp/out.h"
#include "src/cppgles/impl.h"


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
    g->fillQuadColor(GLGFX::RED, bounds);
    //delete bounds;
}



/* ==== Bounds Impl ========== */
float TBounds::getX2() {
    return this->getX() + this->getW();
}
float TBounds::getY2() {
    return this->getY() + this->getH();
}




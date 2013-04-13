class Point  {
public:
    Point(double x, double y);
    virtual ~Point() {}

double x;
virtual double getX();
virtual Point* setX(double inX);
    double y;
virtual double getY();
virtual Point* setY(double inY);
    virtual Point* minus(Point* p);
};
class Color  {
public:
    Color();
    virtual ~Color() {}

};

class Bounds  {
public:
    Bounds(double x, double y, double w, double h) {
        this->x = x;
        this->y = y;
        this->w = w;
        this->h = h;
    }
    virtual ~Bounds() {}

    double x;
    virtual double getX() { return x; }
    virtual Bounds* setX(double inX){ x=inX; return this;}
    double y;
    virtual double getY(){ return y;}
    virtual Bounds* setY(double inY){ y=inY; return this;}
    double w;
    virtual double getW(){ return w;}
    virtual Bounds* setW(double inW){ w=inW; return this;}
    double h;
    virtual double getH(){ return h;}
    virtual Bounds* setH(double inH){ h=inH; return this;}
    virtual bool containsBounds(Bounds* b){
        if(b->x<this->x){
            return false;
        }
        
        if(b->x+b->w>this->x+this->w){
            return false;
        }
        
        if(b->y<this->y){
            return false;
        }
        
        if(b->y+b->h>this->y+this->h){
            return false;
        }
        
        return true;
    }
};

/*
class Bounds {
public:
    Bounds(float x, float y, float w, float h) {
    }
    ~Bounds() {
    }
    virtual float getX2() {
        return this->getX() + this->getW();
    }
    virtual float getY2() {
        return this->getY() + this->getH();
    }
    virtual Bounds* add(float x, float y) {
        BBounds* b2 = new BBounds(
            getX()+x,
            getY()+y,
            getW(),
            getH()
            );
        return b2;
    }
};
*/
/*
Color::Color(GLfloat r, GLfloat g, GLfloat b) {
    comps = new GLfloat[3];
    comps[0] = r;
    comps[1] = g;
    comps[2] = b;
}
*/




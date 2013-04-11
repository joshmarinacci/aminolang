var amino = require('../../build/Release/aminonode');
var core = amino();//.getCore(); //cpp


function Point ( x,  y) {
    this.x = x;
    this.y = y;
    this.x;
    this.getX = function(){
        return this.x;
    }
    this.y;
    this.getY = function(){
        return this.y;
    }
    this.minus = function(p){
        var pt;
        var x;
        x = this.x-p.x;
        var y;
        y = this.y-p.y;
        pt = new Point(x,y);
        return pt;
    }
}
    
function JSStage() {
    this.listeners = {};
    this.on = function(name, target, fn) {
        if(!this.listeners[name]) {
            this.listeners[name] = [];
        }
        var list = this.listeners[name];
        list.push({target:target, fn:fn});
    }
    this.fireEvent = function(e) {
        // console.log("firing",e);
        // console.log(this.listeners);
        if(this.listeners[e.type]) {
            // console.log("got a list");
            var list = this.listeners[e.type];
            for(var i in list) {
                var l = list[i];
                if(l.target == e.target) l.fn(e);
            }
        }
    }
    this.createEvent = function() {
        return {};
    }
    
    
    
    this.root = null;
    this.setRoot = function(root) {
        this.root = root;
    }
    var self = this;
    this.draw = function(gfx)  {
        self.root.draw(gfx);
    }
    self.prevButton = 0;
    this.processEvents = function(e) {
        if(e.button == 1 && self.prevButton == 0) {
            self.processPointerEvent("PRESS", new Point(e.x,e.y));
        }
        if(e.button == 0 && self.prevButton == 1) {
            self.processPointerEvent("RELEASE", new Point(e.x,e.y));
        }
        self.prevButton = e.button;
    }
    this.processPointerEvent= function(type, point) {
        //console.log("processing a pointer event " + type + " ", point);
        
        var event = this.createEvent();
        event.type = type;
        if(type == "PRESS") {
            event.point = point;
        }
        
        var node = this.findNode(point);
        console.log("clicked on node: " + node);
        event.point = point;
        if(type=="PRESS"){
            this.dragFocus = node;
            this.keyboardFocus = node;
        }
        if(type=="RELEASE"){
            this.dragFocus = null;
        }
        if(node!=null){
            event.target = node;
            this.fireEvent(event)
        }
        
    }
    this.findNode = function(point) {
        //go in reverse, ie: front to back
        return this.real_findNode(this.root,point);
    }
    this.real_findNode = function(node, point) {
        if(!node) return null;
        if(node.getVisible && !node.getVisible()) return null;
        var pt2 = new Point(point.x,point.y);
        /*
        if(node instanceof Transform) {
            pt2 = node.toInnerCoords(pt2);
        } else {
            pt2 = new Point(pt2.x-node.getTx(),pt2.y-node.getTy());
        }
        */
        
        if(node.isparent && node.isparent()) {
            //go in reverse, front to back
            for(var i=node.getChildCount()-1; i>=0; i--) {
                var ret = this.real_findNode(node.getChild(i),pt2);
                if(ret != null) return ret;
            }
        }
        if(node.contains(pt2)) {
            return node;
        }
        return null;
    }
    
}

function JSRect() {
    this.w = 0;
    this.h = 0;
    this.x = 0;
    this.y = 0;
    this.setW = function(w) {
        this.w = w;
    };
    this.setH = function(h) {
        this.h = h;
    };
    var self = this;
    this.draw = function(gfx) {
        gfx.fillQuadColor(self.getFill(),self.getBounds());
    };
    this.getFill = function() {
        return "red";
    };
    this.getBounds = function() {
        return {x:0, y:0, w:self.w, h:self.h };
    };
    this.contains = function(pt){
        if(pt.x<this.x){
            return false;}
        ;
            if(pt.x>this.x+this.w){
            return false;}
        ;
            if(pt.y<this.y){
            return false;}
        ;
            if(pt.y>this.y+this.h){
            return false;}
        ;
        return true;
    }
}

core.createStage = function() {
    this.stage = new JSStage();
    return this.stage;
}

core.createRect = function() {
    return new JSRect();
}
core.windowCreated = false;
core.start = function() {
    if(!this.windowCreated) {
        core.real_OpenWindow();
    }
    this.real_Start(this.stage.draw, this.stage.processEvents);
}


exports.getCore =function() { return core; }


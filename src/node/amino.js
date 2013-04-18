/*
add this to the out.js file
exports.GFX = GFX;
exports.Node = Node;
exports.Point = Point;
*/

// 'extend' is From Jo lib, by Dave Balmer
// syntactic sugar to make it easier to extend a class
Function.prototype.extend = function(superclass, proto) {
	// create our new subclass
	this.prototype = new superclass();
	/*

	// optional subclass methods and properties
	if (proto) {
		for (var i in proto)
			this.prototype[i] = proto[i];
	}
	*/
};

var generated = require('/data/node/out.js');
var Point = generated.Point;
var amino = require('/data/node/aminonative');
var core = amino.createCore();
core.testNative = amino.testNative;

var PNG = require('/data/node/png-node.js');
var pixel_data = null;
PNG.decode('/data/node/font2.png', function(pixels) {
    pixel_data = pixels;
});



function JSStage() {
    this.listeners = {};
    this.on = function(name, target, fn) {
        if(!this.listeners[name]) {
            this.listeners[name] = [];
        }
        var list = this.listeners[name];
        list.push({target:target, fn:fn});
    }
    
    this.anims = [];
    this.addAnim = function(anim) {
        this.anims.push(anim);
    }
    this.processAnims = function() {
        for(var i in this.anims) {
            this.anims[i].update();
        }
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
    this.getRoot = function() {
        return this.root;
    };
    
    var self = this;
    this.draw = function(gfx)  {
        self.processAnims();
        self.draw_helper(gfx,self.root);
    }
    
    this.draw_helper = function(ctx, root) {
        if(!root.getVisible()) return;
        ctx.save();
        ctx.translate(root.getTx(),root.getTy());
        root.draw(ctx);
        /*
        if(root instanceof Transform) {
            ctx.scale(root.getScalex(),root.getScaley());
            var theta = root.getRotate()/180*Math.PI;
            ctx.rotate(theta);
        }
        */
        
        
        if(root.isParent && root.isParent()) {
            for(var i=0; i<root.getChildCount(); i++) {
                this.draw_helper(ctx,root.getChild(i));
            }
        }
        ctx.restore();
    }
    
    //self.prevButton = 0;
    this.processEvents = function(e) {
        //console.log("raw event: ",e);
        if(e.type == "press") {
            self.processPointerEvent("PRESS", new Point(e.x,e.y));
        }
        if(e.type == "release") {
            self.processPointerEvent("RELEASE", new Point(e.x,e.y));
        }
        if(e.type == "drag") {
            self.processPointerEvent("DRAG",new Point(e.x,e.y));
        }
        //self.prevButton = e.button;
    }
    this.mouselast = new Point(0,0);
    this.processPointerEvent= function(type, point) {
        //console.log("processing a pointer event " + type + " ", point);
        
        var event = this.createEvent();
        event.type = type;
        //console.log("type = " + event.type + " " + this.mouselast.x + " " + this.mouselast.y);
        if(type == "PRESS") {
            event.point = point;
        }
        if(type == "DRAG") {
            event.delta = point.minus(this.mouselast);
            event.point = point;
        }
        
        var node = this.findNode(point);
        //console.log("clicked on node: " + node);
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
        this.mouselast = point;        
    }
    function fromScreenCoords(point) {
        var x = point.x;
        var y = point.y;
        
        var th = 90/180*Math.PI;
        var x2 =  x*Math.cos(th) + y*Math.sin(th);
        var y2 = -x*Math.sin(th) + y*Math.cos(th);
        return new Point(x2,800+y2);
    }
    this.findNode = function(point) {
        var pt2 = fromScreenCoords(point);
        //console.log("about to find a node for point "
        //    + point.x + ","+ point.y + " -> " + pt2.x + ","+pt2.y);
        return this.real_findNode(this.root,pt2);
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
        pt2 = new Point(pt2.getX()-node.getTx(),pt2.getY()-node.getTy());
        
        
        if(node.isParent && node.isParent()) {
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
    
    this.findNodeById = function(id) {
        return this.findNodeById_helper(id,this.getRoot());
    }
    this.findNodeById_helper = function(id, node) {
        if(node.id && node.id == id) return node;
        if(node.isParent && node.isParent()) {
            for(var i=0; i<node.getChildCount(); i++) {
                var ret = this.findNodeById_helper(id,node.getChild(i));
                if(ret != null) return ret;
            }
        }
        return null;
    }
    
    this.loadTexture = function(path, w, h, cb) {
        PNG.decode(path, function(pixels) {
            var texid = amino.loadTexture(pixels,w, h);
            cb(texid);
        });
    }
    
    this.loadSong = function(path) {
        console.log("loading a SONG: " + path);
        var song = amino.createMediaPlayer(path);
        song.playing = false;
        song.isPlaying = function() {
            return song.playing;
        }
        song.play = function() {
            console.log(song.start);
            song.cpp_start();
            song.playing = true;
        }
        song.pause = function() {
            song.playing = false;
            song.cpp_stop();
        }
        return song;
    }
}

function JSRect() {
    this.parent;
    this.getParent = function(){
        return this.parent;
    }
    this.setParent = function(Parent){
        this.parent=Parent;
        this.markDirty();
        return this;
    }
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    
    this.getX = function(){
        return this.x;
    }
    this.setX = function(X){
        this.x=X;
        this.markDirty();
        return this;
    }
    this.getY = function(){
        return this.y;
    }
    this.setY = function(Y){
        this.y=Y;
        this.markDirty();
        return this;
    }
    this.setW = function(w) {
        this.w = w;
        return this;
    };
    this.getW = function() {
        return this.w;
    };
    
    this.setH = function(h) {
        this.h = h;
        return this;
    };
    this.getH = function() {
        return this.h;
    };
    this.fill = new Color(0.5,0.5,0.5);
    this.getFill = function(){
        return this.fill;
    }
    this.setFill = function(Fill){
        this.fill=Fill;
        this.markDirty();
        return this;
    }
    
    var self = this;
    this.draw = function(gfx) {
        if(self.strokeWidth) {
            var border = self.getBounds();
            border.x--;
            border.y--;
            border.w+=2;
            border.h+=2;
            
            gfx.fillQuadColor(new Color(0,0,0), border); 
        }
        var fill = self.getFill();
        if(typeof fill == "string") {
            var r = parseInt(fill.substring(1,3),16);
            var g = parseInt(fill.substring(3,5),16);
            var b = parseInt(fill.substring(5,7),16);
            gfx.fillQuadColor(new Color(r/255,g/255,b/255), self.getBounds());
        } else {
            gfx.fillQuadColor(self.getFill(),self.getBounds());
        }
    };
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
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
JSRect.extend(generated.Node);

core.createStage = function() {
    this.stage = new JSStage();
    return this.stage;
}

core.createRect = function() {
    return new JSRect();
}



function Color(r,g,b) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.getRFloat = function() {
        return this.r;
    }
    this.getGFloat = function() {
        return this.g;
    }
    this.getBFloat = function() {
        return this.b;
    }
}

function JSGroup() {
    this.nodes = [];
    this.add = function(child) {
        if(child == null) {
            console.log("ERROR. tried to add a null child to a group");
            return;
        }
        this.nodes.push(child);
        child.setParent(this);
        this.markDirty();
    }
    this.isParent = function() { return true; }
    this.getChildCount = function() {
        return this.nodes.length;
    }
    this.getChild = function(i) {
        return this.nodes[i];
    }
    this.toInnerCoords = function(pt){
            return pt;
    }
    this.visible = true;
    this.getVisible = function(){
        return this.visible;
    }
    this.setVisible = function(visible){
        this.visible=visible;
        this.markDirty();
        return this;
    }
    this.draw = function(ctx) {
    }
    this.clear = function() {
        this.nodes = [];
    }
}
JSGroup.extend(generated.Node);

core.createGroup = function() {
    return new JSGroup();
}


var imageLoaded = false;
function JSPushButton() {
    var self = this;
    this.w = 200;
    this.h = 100;
    this.install = function(stage) {
        stage.on("PRESS", this, function(e) {
            self.setBaseColor("#aaaaff");
        });
        stage.on("RELEASE", this, function(e) {
            self.setBaseColor("#aaaaaa");
        });
    };
    
    this.draw = function(gfx) {
        if(!imageLoaded && pixel_data != null) {
            gfx.setFontData(pixel_data,1121,34);
            imageLoaded = true;
        }
        
        var border = self.getBounds();
        border.x--;
        border.y--;
        border.w+=2;
        border.h+=2;
        
        gfx.fillQuadColor(new Color(0,0,0), border); 
        
        var fill = self.getBaseColor();
        if(typeof fill == "string") {
            var r = parseInt(fill.substring(1,3),16);
            var g = parseInt(fill.substring(3,5),16);
            var b = parseInt(fill.substring(5,7),16);
            gfx.fillQuadColor(new Color(r/255,g/255,b/255), self.getBounds());
        } else {
            gfx.fillQuadColor(self.getBaseColor(),self.getBounds());
        }

        var bnds = self.getBounds();
        gfx.fillQuadText(new Color(0,0,0), self.getText(), bnds.x+10, bnds.y+3);
    };
    this.setBaseColor(new Color(0.5,0.5,0.5));
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
}
JSPushButton.extend(generated.PushButton);
core.createPushButton = function() {
    var comp = new JSPushButton();
    comp.install(this.stage);
    return comp;
}



function JSToggleButton() {
    var self = this;
    this.w = 200;
    this.h = 100;
    this.draw = function(gfx) {
        gfx.fillQuadColor(self.getBaseColor(),self.getBounds());
    };
    this.setBaseColor(new Color(0.5,0.5,0.5));
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
}
JSToggleButton.extend(generated.ToggleButton);
core.createToggleButton = function() {
    return new JSToggleButton();
}


function JSLabel() {
    var self = this;
    this.w = 200;
    this.h = 100;
    
    this.draw = function(gfx) {
        var bnds = self.getBounds();
        gfx.fillQuadText(new Color(0,0,0), self.getText(), bnds.x+10, bnds.y+10);
    };
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
}
JSLabel.extend(generated.Label);
core.createLabel = function() {
    console.log("inside create label");
    var comp = new JSLabel();
    return comp;
}



function JSSlider() {
    var self = this;
    this.w = 200;
    this.h = 100;
    this.valueToPoint = function(v) {
        return (this.value-this.minvalue) *
            (this.w / (this.maxvalue-this.minvalue));
    }
    this.pointToValue = function(p) {
        return p * (this.maxvalue-this.minvalue)/this.w + this.minvalue;
    }
    this.draw = function(gfx) {
        var color = new Color(0.5,0.5,0.5);
        gfx.fillQuadColor(color,self.getBounds());
        color = new Color(0,0,0);
        var v = this.valueToPoint(this.value);
        var bds = { 
            x: self.x + self.getTx(), 
            y: self.y + self.getTy(),
            w: v,
            h: self.getH()
        };
        gfx.fillQuadColor(color, bds);
        
    }
    /*
    EventManager.get().on(Events.Drag, this, function(e) {
        var r = e.target;
        r.setValue(r.pointToValue(e.point.x-r.getX()));
    });
    */
    this.setBaseColor(new Color(0.5,0.5,0.5));
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
}
JSSlider.extend(generated.Slider);
core.createSlider = function() {
    return new JSSlider();
}



var SceneParser = function() {
    this.parseChildren = function(core, val, obj) {
        for(var i=0; i<obj.children.length; i++) {
            var ch = obj.children[i];
            var chv = this.parse(core, ch);
            val.add(chv);
        }
    }
    
    this.fillProps = function(out, obj) {
        for(var prop in obj) {
            if(prop == "type") continue;
            if(prop == "children") continue;
            out[prop] = obj[prop];
        }
    }
    
    this.findNode = function(id, node) {
        if(node.id && node.id == id) return node;
        if(node.isparent && node.isparent()) {
            for(var i=0; i<node.getChildCount(); i++) {
                var ret = this.findNode(id,node.getChild(i));
                if(ret != null) return ret;
            }
        }
        return null;
    }
    
    this.parseBindings = function(val, obj) {
        console.log("parsing bindings " + obj.bindings.length);
        val.bindings = [];
        for(var i=0; i<obj.bindings.length; i++) {
            var bin = obj.bindings[i];
            var trans = new Transition();
            trans.id = bin.id;
            trans.pushTrigger = this.findNode(bin.pushTrigger,val);
            trans.pushTarget = this.findNode(bin.pushTarget,val);
            val.bindings.push(trans);
        }
    }

    this.typeMap = {
        "Group":"createGroup",
        "Rect": "createRect",
        "PushButton": "createPushButton",
        "ToggleButton":"createToggleButton",
        "Label":"createLabel",
//        "Slider":Slider,
//        "ListView":ListView,
        "Document":"createGroup",
        "DynamicGroup":"createGroup",
//        "AnchorPanel":AnchorPanel,
    };
    this.parentTypeMap = {
        "Group":JSGroup,
        "Document":JSGroup,
        "DynamicGroup":JSGroup,
//        "AnchorPanel":AnchorPanel,
    };
    
    this.parse = function(core, obj) {
        if(this.typeMap[obj.type]) {
            var out = core[this.typeMap[obj.type]]();
            //var out = new this.typeMap[obj.type]();
            out.type = obj.type;
            if(this.parentTypeMap[obj.type]) {
                this.fillProps(out,obj);
                this.parseChildren(core, out,obj);
            } else {
                this.fillProps(out,obj);
            }
            
            if(obj.type == "Document" && obj.bindings) {
                this.parseBindings(out,obj);
            }
            
            return out;
        }
        console.log("warning. no object parsed here!");
    }
}




core.windowCreated = false;

core.start = function() {
    if(!this.windowCreated) {
        core.real_OpenWindow();
    }
    var drawcb = this.stage.draw;
    var eventcb = this.stage.processEvents;
    
    core.real_Init();
    setInterval(function() {
        core.real_Repaint(drawcb,eventcb);
    },5)
}


exports.getCore =function() { return core; }
exports.Color = Color;
exports.SceneParser = SceneParser;


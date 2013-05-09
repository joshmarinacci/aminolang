/*
add this to the out.js file
exports.GFX = GFX;
exports.Node = Node;
exports.Point = Point;
*/

var http = require('http');
var url = require('url');
var fs = require('fs');
var child_process = require('child_process');
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


//String extension
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

function ParseRGBString(Fill) {
    if(typeof Fill == "string") {
        //strip off any leading #
        if(Fill.substring(0,1) == "#") {
            Fill = Fill.substring(1);
        }
        //pull out the components
        var r = parseInt(Fill.substring(0,2),16);
        var g = parseInt(Fill.substring(2,4),16);
        var b = parseInt(Fill.substring(4,6),16);
        //turn into a Color object
        return new Color(r/255,g/255,b/255);
    }
    //else pass through
    return Fill;
}

var generated;
var amino;
var PNG;
var FONT_IMAGE_PATH;

var OS = "KLAATU";
if(process.platform == "darwin") {
    OS = "MAC";
}
if(OS == "MAC") {
    generated = require('./out.js');
    amino = require('../../build/Release/amino.node');
    PNG = require('png-js');
    FONT_IMAGE_PATH = "./tests/font2.png";
} else {
    console.log("about to load amino");
    amino = require('/data/phonetest/aminonative');
    console.log("loaded up here");
    generated = require('/data/phonetest/out.js');
    PNG = require('/data/phonetest/png-node.js');
    FONT_IMAGE_PATH = "/data/phonetest/font2.png";
}

var Point = generated.Point;
var core = amino.createCore();
core.testNative = amino.testNative;
core.loadJpegFromBuffer = amino.loadJpegFromBuffer;

function decodeImage (width, height, buffer, done)
{
    var image =
    {
        width   : width,
        height  : height,
        buffer  : new Buffer(width * height * 4)
    };

    var cmd = "convert"
    var args = [
        "-format", "rgba",
        "-depth", "8",
        "-size", width + "x"  + height,
        "-",
        "rgba:-"
    ];        
    
    var child = child_process.spawn(cmd, args);
    
    var received = 0;
    child.stdout.on("data", function (data) {
        data.copy(image.buffer, received);
        received += data.length;
    });
    child.stderr.on("data", function (data) {
        console.log(data.toString());
    });
    
    child.on("exit", function (code) {
        done(null, image);
    });
    
    child.stdin.write(buffer);
    child.stdin.end();
}



// Keyboard setup

var KEY_TO_CHAR_MAP = {};
for(var i=32; i<=90; i++) {
    KEY_TO_CHAR_MAP[i]= String.fromCharCode(i);
}
//console.log(KEY_TO_CHAR_MAP);
var SHIFT_MAP = {};
for(var i=65; i<=90; i++) {
    SHIFT_MAP[KEY_TO_CHAR_MAP[i]] = String.fromCharCode(i+32);
}
//console.log(SHIFT_MAP);



function JSStage() {
    this.width = core.DEFAULT_WIDTH;
    this.height = core.DEFAULT_HEIGHT;
    this.listeners = {};
    this.on = function(name, target, fn) {
        if(target == null) {
            target = this;
        }
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
    //var repaintTimer = new SpeedTimer("Stage.draw");
    this.draw = function(gfx)  {
        //repaintTimer.start();        
        
        self.processAnims();
        if(core.SCALE2X) gfx.scale(2,2);
        self.draw_helper(gfx,self.root);
        
        //repaintTimer.end();
    }
    
    this.draw_helper = function(ctx, root) {
        if(!root.getVisible()) return;
        ctx.save();
        ctx.translate(root.getTx(),root.getTy());
        root.draw(ctx);
        
        if(root instanceof generated.Transform) {
            ctx.scale(root.getScalex(),root.getScaley());
            ctx.rotate(root.getRotate());
        }
        
        if(root.isParent && root.isParent()) {
            for(var i=0; i<root.getChildCount(); i++) {
                this.draw_helper(ctx,root.getChild(i));
            }
        }
        ctx.restore();
    }
    
    this.processEvents = function(e) {
        var x = e.x;
        var y = e.y;
        if(e.type == "key") {
            self.processRawKeyEvent(e);
            return;
        }
        if(e.type == "press") {
            self.processPointerEvent("PRESS", new Point(x,y));
            return;
        }
        if(e.type == "release") {
            self.processPointerEvent("RELEASE", new Point(x,y));
            return;
        }
        if(e.type == "drag") {
            self.processPointerEvent("DRAG",new Point(x,y));
            return;
        }
        
        //skip move events for now
        if(e.type == "move") {
            return;
        }
        
        if(e.type == "windowsize") {
            self.processWindowSizeEvent(e);
            return;
        }
        console.log("unhandled event:",e);
    }
    
    this.processWindowSizeEvent = function(e) {
        this.width = e.width;
        this.height = e.height;
        this.fireEvent({type:"WINDOWSIZE",width:this.width, height:this.height, target: this});
    }
    
    this.processRawKeyEvent = function(e) {
        console.log("key event:",e);
        var event = this.createEvent();
        if(e.action == 0) {
            event.type = "KEYPRESS";
            event.keycode = e.keycode;
            if(KEY_TO_CHAR_MAP[e.keycode]) {
                var ch = KEY_TO_CHAR_MAP[e.keycode];
                if(e.shift == 0) {
                    if(SHIFT_MAP[ch]) {
                        ch = SHIFT_MAP[ch];
                    }
                }
                event.printableChar = ch;
                event.printable = true;
            }
            if(this.keyboardFocus != null) {
                event.target = this.keyboardFocus;
                this.fireEvent(event);
            }
        }
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
            if(core.SCALE2X) {
                event.delta.x = event.delta.x/2;
                event.delta.y = event.delta.y/2;
            }
            event.point = point;
        }
        var node = this.findNodeByXY(point);
        var pt2 = fromScreenCoords(point);
        event.point = pt2;
        
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
        
        //send a second drag to the stage just for swipe events
        if(type == "DRAG") {
            event.target = this;
            this.fireEvent(event);
        }
    }
    function fromScreenCoords(point) {
        var x = point.x;
        var y = point.y;
        
        if(core.SCREEN_ROTATE) {
            var th = 90/180*Math.PI;
            var x2 =  x*Math.cos(th) + y*Math.sin(th);
            var y2 = -x*Math.sin(th) + y*Math.cos(th);
            return new Point(x2,800+y2);
        }
        
        if(core.SCALE2X) {
            var x2 = x/2;
            var y2 = y/2;
            return new Point(x2,y2);
        }
        
        return new Point(x,y);
    }
    this.findNodeByXY = function(point) {
        var pt2 = fromScreenCoords(point);
//        console.log("about to find a node for point "
//            + point.x + ","+ point.y + " -> " + pt2.x + ","+pt2.y);
        return this.real_findNodeByXY(this.root,pt2);
    }
    this.real_findNodeByXY = function(node, point) {
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
                var ret = this.real_findNodeByXY(node.getChild(i),pt2);
                if(ret != null) return ret;
            }
        }
        if(!node.contains) {
            console.log("WARNING! Node is missing contains method");
        }
        if(node.contains && node.contains(pt2)) {
            return node;
        }
        return null;
    }    
    
    this.find = function(id) {
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
        if(!core.started) {
            throw "Can't load a texture before core is started";
        }
        if(path.toLowerCase().endsWith(".jpg"))  {
            console.log("doing a jpeg");
            this.loadLocalJPG(path,w,h,cb);
            return;
        } 
        PNG.decode(path, function(pixels) {
            var texid = amino.loadTexture(pixels,w, h);
            cb(texid);
        });
    }
    this.loadLocalJPG = function(path, w, h, cb) {
        var buf = fs.readFileSync(path);
        decodeImage(w,h,buf,function(err,img) {
            var texid = amino.loadTexture(img.buffer,w,h);
            cb(texid);
        });
    };
    
    this.loadRemoteTexture = function(path, w, h, cb) {
        var options = url.parse(path);
        options.encoding = null;
        http.request(options, function(res) {
                var buffers = [];
                res.on("data",function(d) {
                    buffers.push(d);
                });
                res.on("end", function() {
                    var buf = Buffer.concat(buffers);
                    decodeImage(75,75,buf,function(err, img) {
                            var texid = amino.loadTexture(img.buffer,75,75);
                            cb(texid);
                    });
                });
        }).end();
    }
    
    this.loadSong = function(path) {
        console.log("loading a SONG: " + path);
        var song = amino.createMediaPlayer(path);
        song.playing = false;
        song.isPlaying = function() {
            return song.playing;
        }
        song.stop = function() {
            song.cpp_stop();
            song.playing = false;
        }
        song.play = function() {
            song.cpp_start();
            song.playing = true;
        }
        song.pause = function() {
            song.playing = false;
            song.cpp_pause();
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
        this.fill = ParseRGBString(Fill);
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
    this.remove = function(target) {
        var n = this.nodes.indexOf(target);
        this.nodes.splice(n,1);
    }
    this.clear = function() {
        this.nodes = [];
    }
}
JSGroup.extend(generated.Node);

core.createGroup = function() {
    return new JSGroup();
}


function JSTransform() {
    this.isParent = function() {        return true; }
    this.getChildCount = function() {   return 1;  }
    this.setChild = function(ch) {
        this.child = ch;
        this.child.setParent(this);
    }
    this.getChild = function(i) {       return this.child;   }
    this.toInnerCoords = function(pt) {
        //console.log("turning ", pt2);
        var pt2 = new Point(
            pt.x-this.getTx(),
            pt.y-this.getTy()
            );
        //console.log("to ",pt2);
        pt2 = new Point( pt2.x/this.getScalex(), pt2.y/this.getScaley());
        //console.log("to ", pt2);
        var theta = this.getRotate()/180*Math.PI;
        //console.log("cos of theta = " + node.getRotate() + " " + theta + " " + Math.cos(theta));
        pt2 = new Point(
            (Math.cos(theta)*pt2.x + Math.sin(theta)*pt2.y),
            (-Math.sin(theta)*pt2.x + Math.cos(theta)*pt2.y)
            );
        return pt2;
        //console.log("to ", pt2);
//            console.log("theta = " + (Math.cos(theta)*pt2.x + Math.sin(theta)*pt2.y));
//            console.log("theta = " + (Math.sin(theta)*pt2.x - Math.cos(theta)*pt2.y));
    }
    this.type = "Transform";
}
JSTransform.extend(generated.Transform);
core.createTransform = function() {
    var comp = new JSTransform();
    comp.type = "Transform";
    return comp;
}

JSAnchorPanel = function() {
    this.nodes = [];
    this.fill = ParseRGBString("#cccccc");
    this.isParent = function() { return true; }
    this.getChildCount = function() {
        return this.nodes.length;
    }
    this.getChild = function(i) {
        return this.nodes[i];
    }
    this.setFill = function(fill) {
        this.fill = ParseRGBString("#cccccc");
        return this;
    };
    this.getFill = function() {
        return this.fill;
    };
    this.add = function(child) {
        if(child == null) {
            console.log("ERROR. tried to add a null child to a group");
            return;
        }
        this.nodes.push(child);
        child.setParent(this);
        this.markDirty();
    };
    this.draw = function(gfx) {
        var border = self.getBounds();
        border.x--;
        border.y--;
        border.w+=2;
        border.h+=2;
        gfx.fillQuadColor(new Color(0,0,0), border);
        
        var fill = this.getFill();
        gfx.fillQuadColor(this.getFill(),this.getBounds());
    };    
    var self = this;
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
    this.setW = function(w) {
        this.w = w;
        this.redoLayout();
        this.markDirty();
        return this;
    }
    this.setH = function(h) {
        this.h = h;
        this.redoLayout();
        this.markDirty();
        return this;
    }
    this.redoLayout = function() {
        for(var i in this.nodes) {
            var node = this.nodes[i];
            //bottom aligned
            if(node.anchorBottom && !node.anchorTop) {
                node.setTy(this.getH() - (this.orig_h - node.orig_ty));
            }
            //stretch vert
            if(node.anchorBottom && node.anchorTop) {
                var obottom = this.orig_h - node.orig_ty - node.orig_h;
                node.setTy(node.orig_ty);
                node.setH(this.getH()-obottom);
            }
            //right aligned
            if(node.anchorRight && !node.anchorLeft) {
                node.setTx(this.getW() - (this.orig_w - node.orig_tx));
            }
            //stretch horiz
            if(node.anchorRight && node.anchorLeft) {
                var oright = this.orig_w - node.orig_tx - node.orig_w;
                node.setTx(node.orig_tx);
                node.setW(this.getW()-oright);
            }
        }
    }
}
JSAnchorPanel.extend(generated.AnchorPanel);
core.createAnchorPanel = function() {
    return new JSAnchorPanel();
}

JSListView = function() {
    var self = this;
    this.w = 100;
    this.h = 200;
    this.cellHeight = 32;
    this.cellWidth = 32;
    this.DEBUG = false;
	this.listModel = ['a','b','c'];
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
    this.scroll = 0;
    this.layout = "vert";
    this.draw = function(gfx) {
        var bounds = this.getBounds();
        var b = {
            x:0,
            y:+this.getTy()*2+40*2,
            w:bounds.w*2,
            h:bounds.h*2
        }
        gfx.enableClip(b);
        
        
        //border
        var border = self.getBounds();
        border.x--;
        border.y--;
        border.w+=2;
        border.h+=2;
        gfx.fillQuadColor(new Color(0,0,0), border);
        
        //background
        var fill =  ParseRGBString("#ccffff");
        gfx.fillQuadColor(fill,this.getBounds());
        this.drawCells(gfx);
        gfx.disableClip();
    }
    this.drawCells = function(gfx) {
        if(this.layout == "horizwrap") {
            var lx = 0;
            var ly = -this.scroll;
            for(var i=0; i<this.listModel.length; i++) {
                if(ly >= 0 - this.cellHeight && ly < this.getH()) {
                    if(this.cellRenderer) {
                        this.cellRenderer(gfx, this.listModel[i], {x:lx, y:ly, w:this.cellWidth-2, h:this.cellHeight-2});
                    } else {
                        gfx.fillQuadColor(new Color(0.5,0.5,0.5), {x:lx, y:ly, w:this.cellWidth-2, h:this.cellHeight-2});
                        gfx.fillQuadText(new Color(0,0,0), this.listModel[i], lx, ly);
                    }
                }
                lx += this.cellWidth;
                if(lx + this.cellWidth > this.getW()) {
                    lx = 0;
                    ly += this.cellHeight;
                }
            }
            return;
        }
        
        if(this.layout == "horiz") {
            for(var i=0; i<this.listModel.length; i++) {
                var lx = -this.scroll;
                var ly = 0;
                for(var i=0; i<this.listModel.length; i++) {
                    gfx.fillQuadColor(new Color(0.5,0.5,0.5), {x:lx, y:ly, w:this.cellWidth-2, h:this.getH()-2});
                    lx += this.cellWidth;
                }
            }
        }
        
        if(this.layout == "vert") {
            var bnds = self.getBounds();
            for(var i=0; i<this.listModel.length; i++) {
                var y = i*this.cellHeight;
                if(y < this.scroll-this.cellHeight) continue;
                if(y > this.getH()+this.scroll) break;
                if(this.cellRenderer) {
                    this.cellRenderer(gfx, this.listModel[i], 
                        {
                            x:bnds.x, 
                            y:bnds.y+3+y-this.scroll,
                            w:this.getW(), 
                            h:this.cellHeight
                        });
                } else {
                    gfx.fillQuadText(new Color(0,0,0), 
                        this.listModel[i],
                        bnds.x+10, bnds.y+3+y-this.scroll);
                }
            }
            return;
        }
        
        
        
    }
    
    this.install = function(stage) {
        var pressPoint = null;
        stage.on("PRESS", this, function(e) {
            //console.log("pressed on list at: ",e.point);
            pressPoint = e.point;
        });
        stage.on("DRAG", this, function(e) {
            var maxScroll = 100;
            if(self.layout == "vert") {
                self.scroll -= e.delta.y;
                maxScroll = self.cellHeight * self.listModel.length - self.getH();
            }
            if(self.layout == "horiz") {
                self.scroll -= e.delta.x;
                maxScroll = self.cellWidth * self.listModel.length - self.getW();
            }
            if(self.layout == "horizwrap") {
                self.scroll -= e.delta.y;
                var rowLen = Math.floor(self.getW() / self.cellWidth);
                var rows = Math.ceil(self.listModel.length / rowLen);
                maxScroll = self.cellHeight * rows - self.getH();
            }
            
            if(self.scroll < 0) self.scroll = 0;
            if(self.scroll > maxScroll) {
                self.scroll = maxScroll;
            }
        });
        stage.on("RELEASE", this, function(e) {
            //console.log("released at ", e.point);
            if(!pressPoint) return;
            var dx = e.point.x-pressPoint.x;
            var dy = e.point.y-pressPoint.y;
            //console.log("delta = " + dx + " " + dy);
            if(Math.abs(dx) < 5 && Math.abs(dy) < 5) {
                //console.log("firing a selection");
                var event = {
                    type:"SELECT",
                    target:self,
                }
                if(self.layout == "vert") {
                    event.index = -99;
                    //console.log("x = " + e.point.y + " "+ self.scroll + " " + self.getTy());
                    var py = e.point.y -self.getTy() + self.scroll;
                    var index = Math.round(py/self.cellHeight);
                    //console.log("py",py,"index",index);
                    index--;
                    if(index < 0) index = 0;
                    if(index > self.listModel.length-1) {
                        index = self.listModel.length;
                    }
                    event.index = index;
                }
                stage.fireEvent(event);
            }
        });
    }
}
JSListView.extend(generated.ListView);
core.createListView = function() {
    var comp = new JSListView();
    comp.install(this.stage);
    return comp;
}
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
        gfx.fillQuadText(new Color(0,0,0), self.getText(), bnds.x+10, bnds.y+3, this.getFontSize());
    };
    this.setBaseColor = function(base) {
        this.baseColor = ParseRGBString(base);
    }
    this.setBaseColor("#888888");
        
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
    this.install = function(stage) {
        stage.on("PRESS", this, function(e) {
            self.setBaseColor("#aaaaff");
        });
        stage.on("RELEASE", this, function(e) {
            self.setBaseColor("#aaaaaa");
        });
    };
    this.draw = function(gfx) {
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
        gfx.fillQuadText(new Color(0,0,0), self.getText(), bnds.x+10, bnds.y+3, this.getFontSize());
    };
    this.setBaseColor(new Color(0.5,0.5,0.5));
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
}
JSToggleButton.extend(generated.ToggleButton);
core.createToggleButton = function() {
    var comp = new JSToggleButton();
    comp.install(this.stage);
    return comp;
}

function notNull(name, obj) {
    if(!obj) throw (name + " is null!!!");
}

function JSLabel() {
    var self = this;
    this.w = 200;
    this.h = 100;
    this.textColor = new Color(0,0,0);
    
    this.draw = function(gfx) {
        var bnds = self.getBounds();
        notNull("bounds",bnds);
        var color = this.getTextColor();
        notNull("color", color);
        gfx.fillQuadText(color, self.getText(), bnds.x+10, bnds.y+10, this.getFontSize(), this.font.fontid);
    };
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
}
JSLabel.extend(generated.Label);
core.createLabel = function() {
    var comp = new JSLabel();
    return comp;
}

function JSFont(jsonpath, pngpath, w, h) {
    //load json
    var jsontext = fs.readFileSync(jsonpath);
    this.json = JSON.parse(jsontext);
    
    var self = this;
    this.loaded = false;
    //load png
    this.loadImage = function() {
        console.log("loading image: " + pngpath);
        var texid = amino.loadPngFromBuffer(pngpath);
        console.log("texid = " + texid);
        console.log("included 0 = " + self.json.included[0]);
        console.log("width 0 = " + self.json.widths[0]);
        console.log("offset 0 = " + self.json.offsets[0]);
        self.fontid = amino.createNativeFont(
            texid,
            self.json.minchar,
            self.json.maxchar,
            self.json.included,
            self.json.widths,
            self.json.offsets
            );
        self.loaded = true;
        console.log("fully loaded the font with id: " + self.fontid);
    }    
}
core.fonts = [];
core.createFont = function(jsonpath, pngpath, w, h) {
    var font = new JSFont(jsonpath, pngpath, w, h);
    core.fonts.push(font);
    return font;
}

function JSTextbox() {
    var self = this;
    this.w = 200;
    this.h = 40;
    this.focused = false;
    this.setFocused = function(focused) {
        this.focused = focused;
    }
    this.install = function(stage) {
        stage.on("PRESS", this, function(e) {
            self.setFocused(true);
        });
        stage.on("KEYPRESS",this,function(e) {
            if(e.printable) {
                self.setText(self.getText()+e.printableChar);
            }
            //enter key
            if(e.keycode == 294) {
                stage.fireEvent({
                        type:"action",
                        target:self
                });
            }
            //backspace
            if(e.keycode == 295) {
                console.log("backspace");
                var txt = self.getText();
                self.setText(txt.substring(0,txt.length-1));
            }
        });
    };
    this.draw = function(gfx) {
        var border = self.getBounds();
        border.x--;
        border.y--;
        border.w+=2;
        border.h+=2;
        
        gfx.fillQuadColor(new Color(1.0,1.0,1.0), border);
        
        var bnds = self.getBounds();
        if(this.focused) {
            gfx.fillQuadColor(new Color(0.8,0.8,0.8), bnds);
        } else {
            gfx.fillQuadColor(new Color(0.5,0.5,0.5), bnds);
        }
        
        gfx.fillQuadText(new Color(0,0,0), self.getText(), bnds.x+10, bnds.y+3);
    };

    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
}
JSTextbox.extend(generated.Textbox);
core.createTextbox = function() {
    var comp = new JSTextbox();
    comp.install(this.stage);
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
        var bounds = self.getBounds();
        gfx.fillQuadColor(color,self.getBounds());
        color = new Color(0,0,0);
        var v = this.valueToPoint(this.value);
        var bds = { 
            x: bounds.x,
            y: bounds.y,
            w: v,
            h: bounds.h
        };
        gfx.fillQuadColor(color, bds);
        
    }
    
    var self = this;
    this.install = function(stage) {
        stage.on("DRAG", this, function(e) {
            var r = e.target;
            r.setValue(r.pointToValue(e.point.x-r.getTx()));
        });
    }
    
    this.setBaseColor(new Color(0.5,0.5,0.5));
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
}
JSSlider.extend(generated.Slider);
core.createSlider = function() {
    var comp = new JSSlider();
    comp.install(this.stage);
    return comp;
}


function JSImageView() {
    this.loaded = false;
    this.loading = false;
    this.stage = null;
    this.iw = 100;
    this.ih = 100;
    this.install = function(stage)  {
        this.stage = stage;
    }
    this.setUrl = function(url) {
        this.url = url;
        this.loaded = false;
        this.loading = false;
    }
    var self = this;
    this.loadImage = function() {
        if(this.loading) return;
        if(!this.url) return;
        console.log("starting to load the image " + this.url);
        this.loading = true;
        this.stage.loadRemoteTexture(this.url, this.iw, this.ih, function(id) {
            console.log("finished loading the image view");
            self.texid = id;
            self.loaded = true;
        });
    }
    this.draw = function(gfx) {
        if(this.loaded) {
            gfx.fillQuadTexture(this.texid, 0,0, 256, 256);
        } else {
            this.loadImage();
        }
    }
}
JSImageView.extend(generated.ImageView);
core.createImageView = function() {
    var comp = new JSImageView();
    comp.install(this.stage);
    return comp;
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
        out.orig_tx = obj.tx;
        out.orig_ty = obj.ty;
        out.orig_w = obj.w;
        out.orig_h = obj.h;
        /*
        if(obj.type == "AnchorPanel") {
            console.log("doing an anchor panel. orig w h = " + obj.w + " " + obj.h);
            out.orig_w = obj.w;
            out.orig_h = obj.h;
        }
        */
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
        /*
        for(var i=0; i<obj.bindings.length; i++) {
            var bin = obj.bindings[i];
            var trans = new Transition();
            trans.id = bin.id;
            trans.pushTrigger = this.findNode(bin.pushTrigger,val);
            trans.pushTarget = this.findNode(bin.pushTarget,val);
            val.bindings.push(trans);
        }
        */
    }

    this.typeMap = {
        "Group":"createGroup",
        "Rect": "createRect",
        "PushButton": "createPushButton",
        "ToggleButton":"createToggleButton",
        "Label":"createLabel",
        "Slider":"createSlider",
        "ListView":"createListView",
        "Document":"createGroup",
        "DynamicGroup":"createGroup",
        "AnchorPanel":"createAnchorPanel",
    };
    this.parentTypeMap = {
        "Group":JSGroup,
        "Document":JSGroup,
        "DynamicGroup":JSGroup,
        "AnchorPanel":JSAnchorPanel,
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
        console.log("warning. no object for type " + obj.type);
    }
}




core.windowCreated = false;

var log = function(s) {
    console.log(s);
}

function SpeedTimer(title) {
    this.count = 0;
    this.title = title;
    this.startTime = new Date().getTime();
    this.pulse = function() {
        this.count++;
        if(this.count >= 10) {
            var time = new Date().getTime();
            var dt = time-this.startTime;
            console.log(title + " " + (dt/10) + "msec / frame");
            this.count = 0;
            this.startTime = time;
        }
    }
    this.cstart = 0;
    this.accum = 0;
    this.start = function() {
        this.cstart = new Date().getTime();
    }
    this.end = function() {
        this.accum += (new Date().getTime() - this.cstart);
        this.check();
    }
    this.check = function() {
        this.count++;
        if(this.count >= 10) {
            console.log(title +"  : " + this.accum/10 + " ms/frame");
            this.count = 0;
            this.accum = 0;
        }
    }
}

core.started = false;
core.start = function() {
    if(!this.windowCreated) {
        core.real_OpenWindow();
    }
    var drawcb = this.stage.draw;
    var eventcb = this.stage.processEvents;
    core.real_Init();
    
    for(var i in core.fonts) {
        var font = core.fonts[i];
        font.loadImage();
    }
    
    //send one windowsize event on phones
    if(core.device == "galaxynexus") {
        core.stage.fireEvent({type:"WINDOWSIZE",width:core.stage.width, height:core.stage.height, target: core.stage});
    }
    core.started = true;
    //var tim = new SpeedTimer("fps");
    setInterval(function() {
        //tim.pulse();
        core.real_Repaint(drawcb,eventcb);
    },0)
}

core.setDevice = function(device) {
    this.device = device;
    if(device == "galaxynexus") {
        core.SCREEN_ROTATE = false;
        core.SCALE2X = true;
        core.DEFAULT_WIDTH=360;
        core.DEFAULT_HEIGHT=640;
    }
    if(device == "mac") {
        core.SCREEN_ROTATE = false;
        core.SCALE2X = false;
        core.DEFAULT_WIDTH=640;
        core.DEFAULT_HEIGHT=480;
    }
}


function elasticIn(t) {
    var p = 0.3;
    return -(Math.pow(2,10*(t-1)) * Math.sin(((t-1)-p/4)*(2*Math.PI)/p));
}
function elasticOut(t) {
    var p = 0.3;
    return Math.pow(2,-10*t) * Math.sin((t-p/4)*(2*Math.PI)/p) + 1;
}
function cubicIn(t) {
    return Math.pow(t,3);
}
function cubicOut(t) {
    return 1-cubicIn(1-t);
}
function smoothstepIn(t) {
    return t*t*(3-2*t);
}
function cubicInOut(t) {
    if(t < 0.5) return cubicIn(t*2.0)/2.0;
    return 1-cubicIn((1-t)*2)/2;                
}
function camelize(s) {
    return s.substring(0,1).toUpperCase() + s.substring(1);
}
function anim(node, prop, start, finish, dur) {
    if(!node) {
        console.log("ERROR! Can't animate. Node to animate is null!");
    }
    return {
        node:node,
        prop:prop,
        sval:start,
        fval:finish,
        dur:dur,
        running:false,
        finished:false,
        easefn:null,
        setVal:function(t) {
            if(this.easefn != null) {
                t = this.easefn(t);
            }
            var v = (this.fval-this.sval)*t + this.sval;
            node["set"+camelize(this.prop)](v);
        },
        update:function() {
            if(this.finished) return;
            if(!this.running) {
                this.startTime = new Date().getTime();
                this.running = true;
                if(this.beforecb) this.beforecb();
                return;
            }
            var time = new Date().getTime();
            var dt = time-this.startTime;
            var t = dt/this.dur;
            if(t > 1) {
                this.finished = true;
                if(this.aftercb) this.aftercb();
                this.setVal(1);
                return;
            }
            this.setVal(t);
        },
        setEase:function(easefn) {
            this.easefn = easefn;
            return this;
        },
        after: function(aftercb) {
            this.aftercb = aftercb;
            return this;
        },
        before: function(beforecb) {
            this.beforecb = beforecb;
            return this;
        },
    };
}


exports.getCore =function() { return core; }
exports.Color = Color;
exports.SceneParser = SceneParser;
exports.anim = anim;
exports.cubicInOut = cubicInOut;

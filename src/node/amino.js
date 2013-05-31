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
var widgets;
var textcontrol;
var amino;

var OS = "KLAATU";
if(process.platform == "darwin") {
    OS = "MAC";
}
if(OS == "MAC") {
    generated = require('./out.js');
    amino = require("./amino.node");
    widgets = require('./widgets.js');
    textcontrol = require('./textcontrol.js');
} else {
    amino = require('/data/phonetest/aminonative');
    generated = require('/data/phonetest/out.js');
    widgets = require('./widgets.js');
    textcontrol = require('./textcontrol.js');
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
//lower symbols
for(var i=32; i<=64; i++) {
    KEY_TO_CHAR_MAP[i]= String.fromCharCode(i);
}
//letters
for(var i=65; i<=90; i++) {
    KEY_TO_CHAR_MAP[i]= String.fromCharCode(i+32);
}
//upper symbols
KEY_TO_CHAR_MAP[91]=String.fromCharCode(91);
KEY_TO_CHAR_MAP[92]=String.fromCharCode(92);
KEY_TO_CHAR_MAP[93]=String.fromCharCode(93);
KEY_TO_CHAR_MAP[96]=String.fromCharCode(96);
//console.log(KEY_TO_CHAR_MAP);
var SHIFT_MAP = {};
//capital letters
for(var i=97; i<=122; i++) {
    SHIFT_MAP[String.fromCharCode(i)] = String.fromCharCode(i-32);
}
SHIFT_MAP['1'] = '!';
SHIFT_MAP['2'] = '@';
SHIFT_MAP['3'] = '#';
SHIFT_MAP['4'] = '$';
SHIFT_MAP['5'] = '%';
SHIFT_MAP['6'] = '^';
SHIFT_MAP['7'] = '&';
SHIFT_MAP['8'] = '*';
SHIFT_MAP['9'] = '(';
SHIFT_MAP['0'] = ')';

SHIFT_MAP['-'] = '_';
SHIFT_MAP['='] = '+';
SHIFT_MAP['['] = '{';
SHIFT_MAP[']'] = '}';
SHIFT_MAP['\\'] = '\|';
SHIFT_MAP['`'] = '~';


SHIFT_MAP[';'] = ':';
SHIFT_MAP['\''] = '\"';

SHIFT_MAP[','] = '<';
SHIFT_MAP['.'] = '>';
SHIFT_MAP['/'] = '?';
//console.log(SHIFT_MAP);



function JSStage() {
    this.width = core.DEFAULT_WIDTH;
    this.height = core.DEFAULT_HEIGHT;
    
    this.setSize = function(w,h) {
        this.width = w;
        this.height = h;
    }
    this.listeners = {};
    this.on = function(name, target, fn) {
        name = name.toLowerCase();
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
        if(this.listeners[e.type.toLowerCase()]) {
            // console.log("got a list");
            var list = this.listeners[e.type.toLowerCase()];
            for(var i in list) {
                var l = list[i];
                if(l.target == e.target) l.fn(e);
            }
        }
    }
    this.createEvent = function() {
        return {};
    }
    
    this.keyboardFocus = null;
    this.getKeyboardFocus = function(){
        return this.keyboardFocus;
    }
    this.setKeyboardFocus = function(KeyboardFocus){
        this.keyboardFocus=KeyboardFocus;
        //this.markDirty();
        return this;
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
        
        var wgfx = {
            fillQuadColor: function(c,b) {
                gfx.fillQuadColor(ParseRGBString(c),b);
            },
            fillQuadText: function(color, str, x, y, size, fontid) {
                if(!str) str = "ERROR";
                if(!size) size = 20;
                if(fontid == undefined) fontid = -1;
                //console.log("fillQuadText: ",color,str,x,y,size,fontid);
                gfx.fillQuadText(ParseRGBString(color),str,x,y,size,fontid);
            },
            fillQuadTexture: function() {
                gfx.fillQuadTexture(arguments);
            },
            fillQuadTextureSlice: gfx.fillQuadTextureSlice,
            //enableClip:gfx.enableClip,
            //disableClip:gfx.disableClip
            fillRect: function(color, bounds) {
                this.fillQuadColor(color,bounds);
            },
            strokeRect: function(color, bounds) {
                gfx.strokeQuadColor(ParseRGBString(color),bounds);
            },
            drawText: function(color, text, x, y, size, font) {
                var scale = size/font.basesize;
                this.fillQuadText(color, text, 
                    x, 
                    y-font.ascent*scale - 10*scale, 
                    size, font.fontid);
            },
        };
        
        function delegate(obj, name, del) {
            obj[name] = function() { del[name].apply(del,arguments); }
        }
        
        //just delegate the rest of them directly
        delegate(wgfx,"translate",gfx);
        delegate(wgfx,"scale",gfx);
        delegate(wgfx,"rotate",gfx);
        delegate(wgfx,"save",gfx);
        delegate(wgfx,"restore",gfx);
        
        self.processAnims();
        if(core.SCALE2X) wgfx.scale(2,2);
        self.draw_helper(wgfx,self.root);
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
    
    var self = this;
    this.repeatEvent = null;
    this.repeatTimeout = null;
    this.repeatKey = function() {
        self.fireEvent(self.repeatEvent);
        self.repeatTimeout = setTimeout(self.repeatKey, 20);
    }
    this.processRawKeyEvent = function(e) {
        console.log("key event:",e);
        if(this.repeatTimeout) {
            clearTimeout(this.repeatTimeout);
            this.repeatTimeout = null;
            this.repeatEvent = null;
        }
        var event = this.createEvent();
        if(e.action == 1) {
            event.type = "KEYPRESS";
            event.keycode = e.keycode;
            event.shift   = (e.shift == 1);
            event.system  = (e.system == 1);
            event.alt     = (e.alt == 1);
            event.control = (e.control == 1);
            if(KEY_TO_CHAR_MAP[e.keycode]) {
                var ch = KEY_TO_CHAR_MAP[e.keycode];
                if(e.shift == 1) {
                    if(SHIFT_MAP[ch]) {
                        ch = SHIFT_MAP[ch];
                    }
                }
                
                event.printableChar = ch;
                event.printable = true;
            }
            if(this.keyboardFocus != null) {
                event.target = this.keyboardFocus;
                this.repeatTimeout = setTimeout(this.repeatKey,300);
                this.repeatEvent = event;
                this.fireEvent(event);
            }
        }
    }
    
    this.mouselast = new Point(0,0);
    this.processPointerEvent= function(type, point) {
        //console.log("processing a pointer event " + type + " ", point);
        type = type.toLowerCase();
        var event = this.createEvent();
        event.type = type;
        console.log("type = " + event.type + " " + this.mouselast.x + " " + this.mouselast.y);
        if(type == "press") {
            event.point = point;
        }
        if(type == "drag") {
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
        
        if(type=="press"){
            this.dragFocus = node;
            this.keyboardFocus = node;
        }
        if(type=="drag") {
            if(this.dragFocus != null) {
                node = this.dragFocus;
            }
        }
        if(type=="release"){
            this.dragFocus = null;
        }
        if(node!=null){
            event.target = node;
            this.fireEvent(event)
        }
        this.mouselast = point;        
        
        //send a second drag to the stage just for swipe events
        if(type == "drag") {
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
    this.getFill = function(){
        return this.fill;
    }
    this.setFill = function(Fill){
        this.fill = Fill;
        this.markDirty();
        return this;
    }
    this.setFill("#888888");
    
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
        gfx.fillQuadColor(self.getFill(),self.getBounds());
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
    this.isParent = function() { return true; }
    this.getChildCount = function() {
        return this.nodes.length;
    }
    this.getChild = function(i) {
        return this.nodes[i];
    }
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
        gfx.fillQuadColor("#000000", border);
        gfx.fillQuadColor(this.getFill(),this.getBounds());
    };    
    var self = this;
    this.getBounds = function() {
        return {x:this.x, y:this.y, w:this.w, h:this.h };
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
            //top aligned
            if(node.anchorTop && !node.anchorBottom) {
                node.setTy(node.top);
            }
            //bottom aligned
            if(node.anchorBottom && !node.anchorTop) {
                node.setTy(this.getH() - node.bottom - node.getH());
            }
            //left aligned
            if(node.anchorLeft && !node.anchorRight) {
                node.setTx(node.left);
            }
            //right aligned
            if(node.anchorRight && !node.anchorLeft) {
                node.setTx(this.getW() - node.right - node.getW());
            }
            
            //horizontal stretch
            if(node.anchorRight && node.anchorLeft) {
                node.setTx(node.left);
                node.setW(this.getW()- node.left - node.right);
            }
            //vertical stretch
            if(node.anchorTop && node.anchorBottom) {
                node.setTy(node.top);
                node.setH(this.getH() - node.top - node.bottom);
            }
        }
    }
}
JSAnchorPanel.extend(generated.AnchorPanel);
core.createAnchorPanel = function() {
    var comp = new JSAnchorPanel();
    comp.setFill("#cccccc");
    return comp;
}

widgets.CommonListView.extend(generated.ListView);
core.createListView = function() {
    var comp = new widgets.CommonListView();
    comp.font = this.DEFAULT_FONT;
    comp.install(this.stage);
    return comp;
}

widgets.CommonPushButton.extend(generated.PushButton);
core.createPushButton = function() {
    var comp = new widgets.CommonPushButton();
    comp.font = this.DEFAULT_FONT;
    comp.install(this.stage);
    return comp;
}


widgets.CommonToggleButton.extend(generated.ToggleButton);
core.createToggleButton = function() {
    var comp = new widgets.CommonToggleButton();
    comp.font = this.DEFAULT_FONT;
    comp.install(this.stage);
    return comp;
}

widgets.CommonLabel.extend(generated.Label);
core.createLabel = function() {
    var comp = new widgets.CommonLabel();
    comp.font = this.DEFAULT_FONT;
    comp.install(this.stage);
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
        console.log("JSFont: loading image: " + pngpath);
        var fontImage = amino.loadPngFromBuffer(pngpath);
        self.fontid = amino.createNativeFont(
            fontImage.texid,
            self.json.minchar,
            self.json.maxchar,
            self.json.included,
            self.json.widths,
            self.json.offsets
            );
        self.loaded = true;
        console.log("JSFont: fully loaded the font with id: " + self.fontid);
        
    }    
    this.calcStringWidth = function(str, size) {
        var total = 0;
        for(var i=0; i<str.length; i++) {
            var ch = str.charCodeAt(i);
            var n = ch - this.json.minchar;
            var w = this.json.widths[n];
            total += w;
        }
        return total * size/this.basesize;
    }
    this.getHeight = function(fs,gfx) {
        return this.json.height * (fs/this.basesize);
    }
    this.getAscent = function(fs,gfx) {
        return this.ascent * (fs/this.basesize);
    }
}
core.fonts = [];
core.createFont = function(jsonpath, pngpath, w, h) {
    var font = new JSFont(jsonpath, pngpath, w, h);
    core.fonts.push(font);
    return font;
}
core.DEFAULT_FONT = core.createFont(__dirname+"/test1.json",__dirname+"/test1.png",2153, 58);
core.DEFAULT_FONT.basesize = core.DEFAULT_FONT.json.size;
core.DEFAULT_FONT.scaledsize = 20;
core.DEFAULT_FONT.ascent = core.DEFAULT_FONT.json.ascent;
core.DEFAULT_FONT.scale = core.DEFAULT_FONT.scaledsize/core.DEFAULT_FONT.basesize
//console.log("DEFAULT_FONT = ", core.DEFAULT_FONT);


function JSTextArea() {
    textcontrol.JSTextControl();
    this.wrapping = true;
    this.view.wrapping = this.wrapping;
    this.view.layout();
}
JSTextArea.extend(textcontrol.JSTextControl);
core.createTextArea = function() {
    var comp = new JSTextArea();
    comp.font = this.DEFAULT_FONT;
    comp.view.font = this.DEFAULT_FONT;
    comp.view.control = comp;
    comp.install(this.stage);
    return comp;
}

function JSTextField() {
    textcontrol.JSTextControl();
    this.wrapping = false;
    this.view.wrapping = this.wrapping;
    this.view.layout();
    this.getBounds = function() {
        return {
            x:0,
            y:0,
            w:this.getW(),
            h:this.getH()
        };
    }
}
JSTextField.extend(textcontrol.JSTextControl);

core.createTextField = function() {
    var comp = new JSTextField();
    comp.setFont(this.DEFAULT_FONT);
    comp.install(this.stage);
    return comp;
}


/*
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
        var bounds = self.getBounds();
        gfx.fillQuadColor(this.getBaseColor(),this.getBounds());
        var v = this.valueToPoint(this.value);
        var bds = { 
            x: bounds.x,
            y: bounds.y,
            w: v,
            h: bounds.h
        };
        gfx.fillQuadColor("#ff0000", bds);
        
    }
    
    var self = this;
    this.install = function(stage) {
        stage.on("DRAG", this, function(e) {
            var r = e.target;
            r.setValue(r.pointToValue(e.point.x-r.getTx()));
        });
    }
    
    this.setBaseColor("#888888");
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
}
*/

widgets.CommonSlider.extend(generated.Slider);
core.createSlider = function() {
    var comp = new widgets.CommonSlider();
    comp.font = this.DEFAULT_FONT;
    comp.install(this.stage);
    return comp;
}


function JSImageView() {
    this.loaded = false;
    this.loading = false;
    this.stage = null;
    this.image = null;
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
        if(this.url.toLowerCase().endsWith(".png")) {
            this.image = amino.loadPngFromBuffer(this.url);
        } else {
            this.image = amino.loadJpegFromBuffer(this.url);
        }
        console.log("image = ", this.image);
        this.loaded = true;
    }
    this.draw = function(gfx) {
        if(this.loaded && this.image) {
            if(this.sw && this.sh) {
                gfx.fillQuadTexture(this.image.texid, 0,0, this.sw, this.sh);
            } else {
                gfx.fillQuadTexture(this.image.texid, 0,0, this.image.w, this.image.h);
            }
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
            if(prop == "fill") {
                out["set"+camelize(prop)](obj[prop]);
                continue;
            }
            out[prop] = obj[prop];
        }
        //fill in missing props
        if(!obj.left) {
            out.left = obj.tx;
        }
        if(!obj.top) {
            out.top = obj.ty;
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
        "ImageView":"createImageView",
        "TextField":"createTextField",
        "TextArea":"createTextArea",
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
        core.real_OpenWindow(this.stage.width, this.stage.height);
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
exports.ParseRGBString = ParseRGBString;
exports.Color = Color;
exports.SceneParser = SceneParser;
exports.anim = anim;
exports.cubicInOut = cubicInOut;

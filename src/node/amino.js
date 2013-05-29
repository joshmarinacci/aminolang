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
//var PNG;

var OS = "KLAATU";
amino = require('/data/phonetest/aminonative');
widgets = require('./widgets.js');
textcontrol = require('./textcontrol.js');
console.log("loaded up here");
generated = require('/data/phonetest/out.js');


var Point = generated.Point;
var core = amino.createCore();

function JSStage() {
    this.width = core.DEFAULT_WIDTH;
    this.height = core.DEFAULT_HEIGHT;
    
    this.setSize = function(w,h) {
        this.width = w;
        this.height = h;
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
        //repaintTimer.start(); 
        console.log("inside the drawing\n");
        
        var wgfx = {
            fillQuadColor: function(c,b) {
                console.log("filling with color");
                gfx.fillQuadColor(ParseRGBString(c),b);
            },
            fillQuadText: function(color, str, x, y, size, fontid) {
                //console.log("fillQuadText: ",color,str,x,y,size,fontid);
                if(!str) str = "ERROR";
                if(!size) size = 20;
                if(fontid == undefined) fontid = -1;
                //gfx.fillQuadText(ParseRGBString(color),str,x,y,size,fontid);
            },
            fillQuadTexture: function() {
                //gfx.fillQuadTexture(arguments);
            },
            fillQuadTextureSlice: gfx.fillQuadTextureSlice,
            //enableClip:gfx.enableClip,
            //disableClip:gfx.disableClip
            fillRect: function(color, bounds) {
                this.fillQuadColor(color,bounds);
            },
            strokeRect: function(color, bounds) {
                //gfx.strokeQuadColor(ParseRGBString(color),bounds);
            },
            drawText: function(color, text, x, y, size, font) {
                var scale = size/font.basesize;
                //this.fillQuadText(color, text, 
                //    x, 
                //    y-font.ascent*scale - 10*scale, 
                //    size, font.fontid);
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


core.windowCreated = false;

var log = function(s) {
    console.log(s);
}

core.started = false;
core.start = function() {
    var drawcb = this.stage.draw;
    var eventcb = this.stage.processEvents;
    console.log("initing gfx");
    core.real_Init();
    console.log("returned from real init");
    setInterval(function() {
        console.log("about to pulse");
        core.real_Repaint(drawcb,eventcb);
    },0)
    console.log("returning to so we can loop\n");
}

function camelize(s) {
    return s.substring(0,1).toUpperCase() + s.substring(1);
}

exports.getCore =function() { return core; }
exports.ParseRGBString = ParseRGBString;
exports.Color = Color;

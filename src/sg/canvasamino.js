console.log("inside the canvas amino");
console.log("exported amino = ", this['mymodule']);

var amino = this['mymodule'];
amino.sgtest = {
}
amino.native = {
    list:[],
    
    init: function() {
        console.log("canvas amino doesn't really do an init");
    },
    setEventCallback: function(cb) {
        console.log("pretending to set an event callback");
    },
    createWindow: function(w,h) {
        console.log("pretending to open an window:",w,h);
    },
    createRect: function() {
        var rect = {
            "kind":"CanvasRect",
            tx:0,
            ty:0,
            w:100,
            h:100,
            r:0.5,
            g:0.5,
            b:0.5,
            draw: function(g) {
                if(this.visible != 1) return;
                g.save();
                g.translate(this.tx,this.ty);
                g.scale(this.scalex,this.scaley);
                if(this.opacity != 1.0) {
                    g.globalAlpha = this.opacity;
                }
                g.fillStyle = 'rgb('+this.r*255+','+this.g*255+','+this.b*255+')';
                if(this.texid) {
                    //console.log(" now texid = ",this.texid);
                    g.drawImage(this.texid, 0,0);
                } else {
                    g.fillRect(0,0,this.w,this.h);
                }
                g.restore();
            },
        }
        this.list.push(rect);
        return rect;
    },
    createPoly: function() {
        var rect = {
            "kind":"CanvasPoly",
            tx:0,
            ty:0,
            w:100,
            h:100,
            r:0.5,
            g:0.5,
            b:0.5,
            draw: function(g) {
                if(this.visible != 1) return;
                g.save();
                g.translate(this.tx,this.ty);
                g.scale(this.scalex,this.scaley);
                g.fillStyle = 'rgb('+this.r*255+','+this.g*255+','+this.b*255+')';
                g.beginPath();
                var gm = this.geometry;
                for(var i=0; i<this.geometry.length; i+=2) {
                    if(i == 0) {
                        g.moveTo(gm[i],gm[i+1]);
                    } else {
                        g.lineTo(gm[i],gm[i+1]);
                    }
                }
                if(this.closed) {
                    g.closePath();
                }
                if(this.filled) {
                    g.fill();
                } else {
                    g.stroke();
                }
                g.restore();
            },
        }
        this.list.push(rect);
        return rect;
    },
    createGroup: function() {
        var group = {
            kind:"CanvasGroup",
            children:[],
            tx:0,
            ty:0,
            scalex:1,
            scaley:1,
            draw: function(g) {
                if(this.visible != 1) return;
                g.save();
                g.translate(this.tx,this.ty);
                g.scale(this.scalex,this.scaley);
                for(var i=0; i<this.children.length; i++) {
                    this.children[i].draw(g);
                }
                g.restore();
            }
        }
        this.list.push(group);
        return group;
    },
    createText: function() {
        var text = {
            kind:"CanvasText",
            text:"foo",
            tx:0,
            ty:0,
            draw: function(g) {
                if(this.visible != 1) return;
                g.fillStyle = "black";
                g.font = "20px sans-serif";
                g.fillText(this.text,this.tx,this.ty);
            }
        };
        return text;
    },
    addNodeToGroup: function(h1,h2) {
        h2.children.push(h1);
    },
    
    createDefaultFont: function() {
        return new CanvasFont(this.domctx);
    },
    
    loadJpegToTexture: function(path,cb) {
        var img = new Image();
        img.onload = function() {
            img.texid = img;
            cb(img);
        }
        img.src = path;
    },
    
    updateProperty: function(handle, key, value) {
        handle[key] = value;
    },
    setRoot: function(root) {
        this.root = root;
    },
    tick: function() {
        var w = this.domcanvas.width;
        var h = this.domcanvas.height;
        var g = this.domctx;
        g.fillStyle = "white";
        g.fillRect(0,0,w,h);
        this.root.draw(g);
    },
    setImmediate: function(loop) {
        setTimeout(loop,100);
    },
    setWindowSize: function(w,h) {
        //NO OP
    },
    getWindowSize: function() {
        return {
            w: this.domcanvas.width,
            h: this.domcanvas.height
        };
    }
};


amino.KEY_MAP.LEFT_ARROW   = 37; //browser right key
amino.KEY_MAP.UP_ARROW     = 38; //backspace key
amino.KEY_MAP.RIGHT_ARROW  = 39; //browser right key
amino.KEY_MAP.DOWN_ARROW   = 40; //backspace key
amino.KEY_MAP.BACKSPACE    = 8; //backspace key
amino.KEY_MAP.ENTER        = 13; //backspace key

function CanvasFont(g) {
    this.g = g;
    this.calcStringWidth = function(str,size) {
        g.font = size+"px sans-serif";
        var metrics = this.g.measureText(str);
        return metrics.width;
    };
    this.getHeight = function(size) {
        g.font = size+"px sans-serif";
        return this.g.measureText('M').width;
    };
    this.getCharWidth = function(ch) {
        var metrics = this.g.measureText(ch);
        return metrics.width;
    };
}

//does platform specific native event handler setup
function attachEvent(node,name,func) {
    if(node.addEventListener) {
        node.addEventListener(name,func,false);
    } else if(node.attachEvent) {
        node.attachEvent(name,func);
    }
};
function setupEventHandlers(dom) {
    var self = this;
    
    attachEvent(dom,'mousedown',function(e){
        mouseState.pressed = true;
        baconbus.push({type:"mouseposition", x:e.x, y:e.y});
        baconbus.push({type:"mousebutton", button:0, state:1});
    });
    attachEvent(dom,'mousemove',function(e){
        baconbus.push({type:"mouseposition", x:e.x, y:e.y});
    });
    attachEvent(dom,'mouseup',function(e){
        mouseState.pressed = false;
        baconbus.push({type:"mouseposition", x:e.x, y:e.y});
        baconbus.push({type:"mousebutton", button:0, state:0});
    });
    attachEvent(window,'keydown',function(e){
        if(e.metaKey) return;
        e.preventDefault();
        console.log(e);
        var evt = {
                type:"keypress",
                keycode: e.keyCode,
                shift:   e.shiftKey?1:0,
                control: e.ctrlKey?1:0,
                system:  e.metaKey?1:0,
        };
        baconbus.push(evt);
    });
    attachEvent(window,'keyup',function(e){
        e.preventDefault();
        baconbus.push({
                type:"keyrelease",
                keycode: e.keyCode,
        });
    });
    if(window.DeviceMotionEvent) {
        console.log("motion IS supported");
        attachEvent(window,'devicemotion',function(e){
            //self.processAccelEvent(Events.AccelerometerChanged, e);
        });
    } else {
        console.log("motion not supported");
    }    
}

amino.bacon = Bacon;
amino.startApp = function(id, cb) {
    var domcanvas = document.getElementById(id);
    amino.native.domcanvas = domcanvas;
    amino.native.domctx = domcanvas.getContext('2d');
    setupEventHandlers(amino.native.domcanvas);
    Core._core = new Core();
    Core._core.init();
    var stage = Core._core.createStage(600,600);
    cb(Core._core,stage);
    Core._core.start();
}

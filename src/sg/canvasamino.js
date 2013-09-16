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
                g.fillStyle = 'rgb('+this.r*255+','+this.g*255+','+this.b*255+')';
                g.fillRect(this.tx,this.ty,this.w,this.h);
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
                g.fillStyle = "black";
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
    
    updateProperty: function(handle, key, value) {
        //console.log("updating the property of handle",handle,key,value);
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
    }
};

function CanvasFont(g) {
    this.g = g;
    this.calcStringWidth = function(str,size) {
        var metrics = this.g.measureText(str);
        console.log("metrics = ", metrics);
        return metrics.width;
    };
    this.getHeight = function(fs) {
        return this.g.measureText('M').width;
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
        baconbus.push({type:"mouseposition", x:e.x, y:e.y});
        baconbus.push({type:"mousebutton", button:0, state:1});
    });
    attachEvent(dom,'mousemove',function(e){
        baconbus.push({type:"mouseposition", x:e.x, y:e.y});
    });
    attachEvent(dom,'mouseup',function(e){
        baconbus.push({type:"mouseposition", x:e.x, y:e.y});
        baconbus.push({type:"mousebutton", button:0, state:0});
    });
    attachEvent(window,'keydown',function(e){
        //self.processKeyEvent(Events.KeyPress, self.domCanvas,e);
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

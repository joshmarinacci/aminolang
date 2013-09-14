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
            fill: "#ff00ff",
            draw: function(g) {
                g.fillStyle = this.fill;
                g.fillRect(this.tx,this.ty,this.w,this.h);
            }
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
            draw: function(g) {
                g.save();
                g.translate(this.tx,this.ty);
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
        console.log(h2,h1);
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
        setTimeout(loop,1000);
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

amino.bacon = Bacon;
amino.startApp = function(id, cb) {
    var domcanvas = document.getElementById(id);
    console.log("dom canvas = ",domcanvas);
    amino.native.domcanvas = domcanvas;
    amino.native.domctx = domcanvas.getContext('2d');
    Core._core = new Core();
    Core._core.init();
    var stage = Core._core.createStage(600,600);
    cb(Core._core,stage);
    Core._core.start();
}

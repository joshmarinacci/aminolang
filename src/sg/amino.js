/** 
@class dummy
@desc a dummy header to work around a doc generation bug. ignore
*/
var deps = {
    'bacon':'./Bacon',
    'fs':'fs',
    'sgtest':"./aminonative.node",
}

function jrequire(lib) {
    return require(deps[lib]);
}

if(typeof exports == 'undefined'){
    var exports = this['mymodule'] = {};
    exports.inbrowser = true;
    //inside the browser.
    jrequire = function(lib) {
        console.log("faking loading lib: " + lib);
        return this[lib];
    }
}


var fs = jrequire('fs');
exports.bacon = jrequire('bacon');

var OS = "BROWSER";
if((typeof process) != 'undefined') {
    OS = "KLAATU";
    if(process.platform == "darwin") {
        OS = "MAC";
    }
}

function d(str) {
    console.log("AMINO: ",str);
}
d("OS is " + OS)
exports.colortheme = {
    base:    "#ccffcc",
    neutral: "#cccccc",
    text:    "#000000",
    accent:  "#55ff55",
    listview: {
        cell: {
            fillEven: "#ffffff",
            fillOdd:  "#eeeeee",
            fillSelected: "#88ccff",
        }
    }
}




exports.sgtest = jrequire('sgtest');


exports.native = {
    init: function() {
        exports.sgtest.init();
    },
    updateProperty: function(handle, name, value) {
        exports.sgtest.updateProperty(handle, propsHash[name], value);        
    },
    setRoot: function(handle) {
        exports.sgtest.setRoot(handle);
    },
    tick: function() {
        exports.sgtest.tick();
    },
    setImmediate: function(loop) {
        setImmediate(loop);
    },
    setEventCallback: function(cb) {
        exports.sgtest.setEventCallback(cb);
    },
    createWindow: function(w,h) {
        exports.sgtest.createWindow(w,h);
    },
    createRect: function() {
        return exports.sgtest.createRect();
    },
    addNodeToGroup: function(h1,h2) {
        exports.sgtest.addNodeToGroup(h1,h2);
    },
    createGroup: function() {
        return exports.sgtest.createGroup();
    },
    loadPngToTexture: function(imagefile) {
        return exports.sgtest.loadPngToTexture(imagefile);
    },
    loadJpegToTexture: function(imagefile) {
        return exports.sgtest.loadJpegToTexture(imagefile);
    },
    createNativeFont: function(texid,json) {
        return exports.sgtest.createNativeFont(texid,json);
    },
    createText: function() {
        return exports.sgtest.createText();
    },
    setWindowSize: function(w,h) {
        exports.sgtest.setWindowSize(w,h);
    },
    createAnim: function(handle,prop,start,end,dur,count,rev) {
        return exports.sgtest.createAnim(handle,propsHash[prop],start,end,dur,count,rev);
    },
    updateAnimProperty: function(handle, prop, type) {
        exports.sgtest.updateAnimProperty(handle, propsHash[prop], type);
    },
}

var mouseState = {
    pressed:false,
    x:0,
    y:0,
 }
var baconbus = null;


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
        return {
            r:r/255,
            g:g/255,
            b:b/255
        };
    }
    return Fill;
}

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

function setupBacon(core) {
    var bus = new exports.bacon.Bus();
    baconbus = bus;
    
    var log = function(str) {return function(v) {console.log(str + " ", v); } }
    var print = function(str) { return function(v) {  console.log(str);  } }
    var typeIs = function(name) { return function(e) { return e.type == name; } };
    
    function exitApp() { setTimeout(function() { process.exit(0); },10); };
    
    function mousePressed() { return mouseState.pressed; }
     
    bus.filter(typeIs("windowclose")).onValue(exitApp);
    bus.filter(typeIs("windowsize"))
    .onValue(function(e) {
        core.fireEvent({
                type:"windowsize",
                source:core.stage,
                width:e.width,
                height:e.height,
        });
    });
    
    //mouse presses
    pressStream = bus.filter(typeIs("mousebutton"))
        .filter(function(e) { return e.state == 1; });
        //        .onValue(log("mouse pressed"));

    pressStream.onValue(function(e) {
        var node = core.findNodeAtXY(mouseState.x,mouseState.y);
        if(node != null) {
            mouseState.pressTarget = node;
            var pt = core.globalToLocal({x:mouseState.x,y:mouseState.y},node);
            core.fireEventAtTarget(
                node,
                {
                    type:"press",
                    pressed:mouseState.pressed,
                    x:mouseState.x,
                    y:mouseState.y,
                    point:pt,
                    target:node,
                }
            );
        }
    });
    
    //mouse drags
    bus.filter(typeIs("mouseposition"))
        .onValue(function(e) {
            mouseState.x = e.x;
            mouseState.y = e.y;
        });
    var diffstream = bus.filter(typeIs("mouseposition"))
        .diff(null,function(a,b) { 
            if(!a) {
                return {dx:0,dy:0};
            } else {
                return {dx:b.x-a.x,dy:b.y-a.y};
            }
        });
        
    bus.filter(typeIs("mouseposition"))
        .zip(diffstream,function(a,b) {
                a.dx = b.dx;
                a.dy = b.dy;
                return a;
        })
        .filter(mousePressed)
        .onValue(function(e) {
            var node = core.findNodeAtXY(mouseState.x,mouseState.y);
            if(node != null) {
	            var pt = core.globalToLocal({x:mouseState.x,y:mouseState.y},node);
                core.fireEventAtTarget(
                    node,
                    {
                        type:"drag",
                        pressed:mouseState.pressed,
                        x:mouseState.x,
                        y:mouseState.y,
                        dx:e.dx,
                        dy:e.dy,
	                    point:pt,
                        target:node,
                    }
                );
            }
            core.fireEvent({
                    type: "drag",
                    type:"drag",
                    pressed:mouseState.pressed,
                    x:mouseState.x,
                    y:mouseState.y,
                    dx:e.dx,
                    dy:e.dy,
                    point:pt,
                    source:core,
            });
        });
        
    //mouse releases
    var releaseStream = bus.filter(typeIs("mousebutton"))
        .filter(function(e) { return e.state == 0; });
        //        .onValue(log("mouse released"));
    releaseStream.onValue(function(e) {
        var node = core.findNodeAtXY(mouseState.x,mouseState.y);
        if(node != null) {
            core.fireEventAtTarget(
                node,
                {
                    type:"release",
                    pressed:mouseState.pressed,
                    x:mouseState.x,
                    y:mouseState.y,
                    target:node,
                }
            );
            if(mouseState.pressTarget == node) {
            }
        }
    });
        
        
    //mouse clicks
    clickStream = bus.filter(typeIs("mousebutton"))
        .slidingWindow(2,2)
        .filter(function(a) {
                return (a[0].state == 1 && a[1].state == 0);
        });
        //    clickStream.onValue(log("mouse clicked"));
    clickStream.onValue(function(e) {
        var node = core.findNodeAtXY(mouseState.x,mouseState.y);
        if(node && node == mouseState.pressTarget) {
            core.fireEventAtTarget(node,
                {
                    type:"click",
                    x:mouseState.x,
                    y:mouseState.y,
                    target:node
                }
                );
                    
        }
        
    });
    
    
    bus.filter(typeIs("animend"))
        .onValue(core.notifyAnimEnd);

    var repeatEvent = null;
    var repeatTimeout = null;
    var repeatKey = function() {
        if(repeatEvent) {
            core.fireEventAtTarget(core.keyfocus,repeatEvent);
            repeatTimeout = setTimeout(repeatKey, 20);
        }
    }
        
    bus.filter(typeIs("keypress"))
        .onValue(function(e) {
            if(repeatTimeout) {
                clearTimeout(repeatTimeout);
                repeatTimeout = null;
                repeatEvent = null;
            }
            
            var event = {
                type:"keypress",
            }
            event.keycode = e.keycode;
            event.shift   = (e.shift == 1);
            event.system  = (e.system == 1);
            event.alt     = (e.alt == 1);
            event.control = (e.control == 1);
            event.printable = false;
            event.printableChar = 0;
            if(KEY_TO_CHAR_MAP[e.keycode]) {
                event.printable = true;
                var ch = KEY_TO_CHAR_MAP[e.keycode];
                if(e.shift == 1) {
                    if(SHIFT_MAP[ch]) {
                        ch = SHIFT_MAP[ch];
                    }
                }
                event.printableChar = ch;
            }
            if(core.keyfocus) {
                event.target = core.keyfocus;
                repeatTimeout = setTimeout(repeatKey,300)
                repeatEvent = event;
                core.fireEventAtTarget(core.keyfocus,event);
            }
        });
    bus.filter(typeIs("keyrelease"))
        .onValue(function(e) {
            if(repeatTimeout) {
                clearTimeout(repeatTimeout);
                repeatTimeout = null;
                repeatEvent = null;
            }
        });
}


/** 
@func ComposeObject transform the supplied prototype object into a constructor that can then be invoked with 'new'
*/
exports.ComposeObject = function(proto) {
    function delgate(obj, name, comp) {
        obj.comps[name] = new comp.proto();
        if(comp.promote) {
            comp.promote.forEach(function(propname) {
                obj["set"+camelize(propname)] = function(value) {
                    //delegate to the nested component
                    //console.log('delegating ' + propname + ' to ',obj.comps[name]);
                    this.comps[name]["set"+camelize(propname)](value);
                    return this;
                };
                obj["get"+camelize(propname)] = function() {
                    //console.log('delegating ' + propname + ' to ',obj.comps[name]);
                    return this.comps[name]["get"+camelize(propname)]();
                };
            });
        }
    }
    
    function delegateProp(obj, name, prop) {
        obj.props[name] = prop.value;
        obj["set"+camelize(name)] = function(value) {
            this.props[name] = value;
            return this;
        };
        obj["get"+camelize(name)] = function() {
            return this.props[name];
        };
        if(prop.set) {
            obj["set"+camelize(name)] = prop.set;
        }
    }
    
    function generalizeProp(obj, name, prop) {
        obj["set"+camelize(name)] = function(value) {
            obj.set(name,value);
            return this;
        };
    }
    return function() {
        var obj = this;
        
        if(proto.extend) {
            var sup = new proto.extend();
            for(var name in sup) {
                obj[name] = sup[name];
            }
        } else {
            obj.props = {};
            obj.comps = {};
        }
        
        if(proto.comps) {
            for(var name in proto.comps) {
                delgate(obj,name,proto.comps[name]);
            };
        }
        if(proto.props) {
            for(var name in proto.props) {
                delegateProp(obj, name, proto.props[name]);
            }
        }
        
        if(proto.set) {
            obj.set = proto.set;
            for(var name in proto.props) {
                generalizeProp(obj, name, proto.props[name]);
            }
        }
        if(proto.get) {
            obj.get = proto.get;
            proto.props.forEach(function(prop) {
                obj["get"+camelize(prop.name)] = function() {
                    return obj.get(prop.name);
                };
            });
        }
        if(proto.init) {
            obj.init = proto.init;
            obj.init();
        }
        obj.type = proto.type;
        return this;
    }
}


var propsHash = {
    "tx":23,
    "ty":1,
    "scalex":2,
    "scaley":3,
    "rotateZ":4,
    "r":5,
    "g":6,
    "b":7,
    "texid":8,
    "text":9,
    "w":10,
    "h":11,
    "fontSize":12,
    "lerplinear":13,
    "lerpcubicin":14,
    "lerpcubicout":15,
    "lerpprop":16,
    "lerpcubicinout":17,
    "visible":18,
    "rotateX":19,
    "rotateY":20,
    "x":21,
    "y":22,
}

exports.propsHash = propsHash;

function camelize(s) {
	return s.substring(0,1).toUpperCase() + s.substring(1);
}


/**
@class ProtoRect
@desc the basic primitive rectangle
*/
exports.ProtoRect = exports.ComposeObject({
    type: "Rect",
    props: {
        /** @prop id id of the rectangle. might not be unique */
        id: { value: "no id" },
        /** @prop tx translate X */
        tx: { value: 0 },
        /** @prop ty translate Y */
        ty: { value: 0 },
        /** @prop visible visible or not. 1 or 0, not true or false */
        visible: { value: 1 },
        x: { value: 0 },
        y: { value: 0 },
        /** @prop w width of the rectangle. default value = 300 */
        w: { value: 300 },
        /** @prop h height of the rectangle. default value = 100 */
        h: { value: 100 },
        r: { value: 0},
        g: { value: 1},
        b: { value: 0},
        /** @prop fill fill color of the rectangle. Should be a hex value like #af03b6 */
        fill: {
            value: '#ff0000', 
        }
    },
    //replaces all setters
    set: function(name, value) {
        this.props[name] = value;
        //mirror the property to the native side
        if(this.live) {
            if(propsHash[name]) {
                exports.native.updateProperty(this.handle,name,value);
            }
        }
        
        if(name == 'fill') {
            var color = ParseRGBString(value);
            this.setR(color.r);
            this.setG(color.g);
            this.setB(color.b);
            return this;
        }
    },
    /*
    //replaces all getters
    get: function(name) {
        return this.props[name];
    },
    */
    init: function() {
        this.handle = exports.native.createRect();
        this.live = true;
        //invoke all setters once to push default values to the native side
        for(var propname in this.props) {
            this.set(propname, this.props[propname]);
        }
        this.type = "rect";
        var rect = this;
        
        /** @func contains  returns true if the rect contains the x and y. 
        x and y should be in the coordinate space of the rectangle.
        */
        this.contains = function(x,y) {
            if(x >=  rect.getX()  && x <= rect.getX() + rect.getW()) {
                if(y >= rect.getY() && y <= rect.getY() + rect.getH()) {
                    return true;
                }
            }
            return false;
        }
        
    }
});

/**
@class ProtoGroup
@desc The group primitive. Use it to group other nodes together.
*/
exports.ProtoGroup = exports.ComposeObject({
    type: "Group",
    props: {
        /** @prop tx translate X. @default 0 */
        tx: { value: 0 },
        /** @prop ty translate Y. @default 0*/
        ty: { value: 0 },
        /** @prop scalex scale X. @default 1*/
        scalex: { value: 1 },
        /** @prop scaley scale Y. @default 1*/
        scaley: { value: 1 },
        /** @prop visible visible or not. 1 or 0, not true or false. @default 1 */
        visible: { value: 1 },
    },
    //replaces all setters
    set: function(name, value) {
        this.props[name] = value;
        if(name == 'visible') {
            this.props[name] = (value?1:0);
        }
        //mirror the property to the native side
        if(this.live) {
            exports.native.updateProperty(this.handle, name, this.props[name]);
        }
    },
    init: function() {
        this.handle = exports.native.createGroup();
        this.children = [];
        this.live = true;
        /** @func add(child)  add a child to the group. Must be a non-null node. */
        this.add = function(node) {
            if(node == undefined) abort("can't add a null child to a group");
            if(!this.live) abort("error. trying to add child to a group that isn't live yet");
            if(node.handle == undefined) abort("the child doesn't have a handle");
            this.children.push(node);
            node.parent = this;
            exports.native.addNodeToGroup(node.handle,this.handle);
        }
        this.isParent = function() { return true; }
        
        /** @func getChildCount()  returns the number of child nodes inside this group */
        this.getChildCount = function() {
            return this.children.length;
        }
        /** @func getChild(i)  returns the child at index i */
        this.getChild = function(i) {
            return this.children[i];
        }
        /** @func remove(target)  remove the target child */
        this.remove = function(target) {
            var n = this.children.indexOf(target);
            this.children.splice(n,1);
            target.parent = null;
        }
        /** @func clear() remove all children of this group */
        this.clear = function() {
            for(var i in this.children) {
                this.children[i].setVisible(false);
            }
            this.children = [];
        }
        //invoke all setters once to push default values to the native side
        for(var propname in this.props) {
            this.set(propname, this.props[propname]);
        }
        this.type = "group";
    }
});

/** 
@class ProtoText
@desc  The text primitive. Use it to draw a single run of text with the
same font, size, and color.
*/
exports.ProtoText = exports.ComposeObject({
    type:"Text",
    props: {
        /** @prop tx translate X. @default 0 */
        tx: { value: 0 },
        /** @prop ty translate Y. @default 0 */
        ty: { value: 0 },
        /** @prop visible  @default true */
        visible: { value: 1 },
        /** @prop text  the exact string to display */
        text: { value: 'silly text' },
        /** @prop fontSize the fontsize of this text string */
        fontSize: { value: 20 },
        r: { value: 0},
        g: { value: 1},
        b: { value: 0},
        /** @prop fill fill color of the rectangle. Should be a hex value like #af03b6 */
        fill: {
            value: '#000000', 
        }
    },
    //replaces all setters
    set: function(name, value) {
        this.props[name] = value;
        //mirror the property to the native side
        if(this.live) {
            exports.native.updateProperty(this.handle, name, value);
            //console.log('updated the property ' + name);
        }
        
        if(name == 'fill') {
            var color = ParseRGBString(value);
            this.setR(color.r);
            this.setG(color.g);
            this.setB(color.b);
            return this;
        }
    },
    init: function() {
        this.live = true;
        this.handle = exports.native.createText();
        //invoke all setters once to push default values to the native side
        for(var propname in this.props) {
            this.set(propname, this.props[propname]);
        }
        this.type = "text";
    }
});

/** 
@class ImageView
@desc a view which shows an image loaded from a path. It will always show the full image.
*/
exports.ProtoImageView = exports.ComposeObject({
    props: {
        /** @prop tx translate X. @default 0 */
        tx: { value: 0   },
        /** @prop ty translate Y. @default 0 */
        ty: { value: 0   },
        /** @prop x x value. @default 0 */
        x:  { value: 0   },
        /** @prop y y value. @default 0 */
        y:  { value: 0   },
        r:  { value: 0   },
        g:  { value: 0   },
        b:  { value: 1   },
        /** @prop x width of the image view @default 100 */
        w:  { value: 100 },
        /** @prop h height of the image view @default 100 */
        h:  { value: 100 },
        /** @prop visible @default true */
        visible: { value:1 },
        /** @prop src  the file to load this image from @default null */
        src: { 
            value: null ,
        },
    },
    //replaces all setters
    set: function(name, value) {
        this.props[name] = value;
        //mirror the property to the native side
        if(this.live) {
            exports.native.updateProperty(this.handle, name, value);
            console.log('updated the property ' + name + " with the handle " + this.handle);
        }
        if(name == 'src') {
            console.log('set the source to ' + this.props.src);
            var src = this.props.src;
            if(src.toLowerCase().endsWith(".png")) {
                this.image = exports.native.loadPngToTexture(src);
            } else {
                this.image = exports.native.loadJpegToTexture(src);
            }
            console.log("loaded an image");
            if(this.image) {
                console.log('setting a texture prop: ', this.image);
                exports.native.updateProperty(this.handle, "texid", this.image.texid);
                console.log("done with texture prop");
            }
            
        }
    },
    init: function() {
        this.live = true;
        this.handle = exports.native.createRect();
    }
});


/**
@class ProtoWidget
@desc  the base class for all widgets. Widgets are a kind of node used for UI controls. All widgets
have a size (width/height), can be hidden (visible = false), an ID, and left/right/top/bottom properties
to be used by layout panels. 
*/
exports.ProtoWidget = exports.ComposeObject({
    type: "widget",
    comps: {
        base: {
            proto: exports.ProtoGroup,
            promote: ["tx","ty","visible"],
        },
    },
    props: {
        /** @prop id  The id of the widget. It is set to the string 'no id' by default. You should set it to some unique value. Can be used
        later to search for the node. similar to the HTML DOM form of 'id'.*/
        id: { value: "no id" },
        /** @prop left The distance from the left edge of this widget to it's parent container. Only applies when put inside
        of an anchor panel and when the anchorLeft property is set to true. @default = 0 */
        left: { value: 0 },
        /** @prop right The distance from the right edge of this widget to it's parent container. Only applies when put inside
        of an anchor panel and when the anchorRight property is set to true. @default = 0 */
        right: { value: 0 },
        /** @prop top The distance from the top edge of this widget to it's parent container. Only applies when put inside
        of an anchor panel and when the anchorTop property is set to true. @default = 0 */
        top: { value: 0 },
        /** @prop bottom The distance from the bottom edge of this widget to it's parent container. Only applies when put inside
        of an anchor panel and when the anchorBottom property is set to true. @default = 0 */
        bottom: { value: 0 },
        /** @prop anchorLeft Determines if this widget should be left anchored by its parent. Only applies when put inside
        of an anchor panel. @default = false */
        anchorLeft: { value: false },
        /** @prop anchorRight Determines if this widget should be right anchored by its parent. Only applies when put inside
        of an anchor panel. @default = false */
        anchorRight: { value: false },
        /** @prop anchorTop Determines if this widget should be top anchored by its parent. Only applies when put inside
        of an anchor panel. @default = false */
        anchorTop: { value: false },
        /** @prop anchorBottom Determines if this widget should be bottom anchored by its parent. Only applies when put inside
        of an anchor panel. @default = false */
        anchorBottom: { value: false },
        /** @prop parent A reference to this widget's immediate parent container. */
        parent: { value: null },
    },
    init: function() {
        this.handle = this.comps.base.handle;
        this.font = Core._core.defaultFont;
        /** @func contains(x,y)  returns true if the bounds of this widget contain the passed in x and y. */
        this.contains = function(x,y) {
            if(x >=  0  && x <= this.getW()) {
                if(y >= 0 && y <= this.getH()) {
                    return true;
                }
            }
            return false;
        }
    }
});



/*
function SGTextControl() {
    textcontrol.JSTextControl.call(this);
    var oldlayout = this.view.layout;
    var self = this;
    this.cursor.notifyChange = function() {
        var ch  = self.view.getElementAt(self.cursor.index);
        var pos = self.view.indexToXY(self.cursor.index);
        var chx = 0;
        if(self.cursor.bias == self.cursor.FORWARD && ch.width)  { chx = ch.width; }
        if(self.cursor.bias == self.cursor.BACKWARD) { }
        self.setProp(self.cursorHandle, 'tx',pos.x+chx);
    }
    this.view.layout = function() {
        oldlayout.call(this);
        if(!this.lines || this.lines.length < 1) return;
        var line = this.lines[0];
        if(!line.runs || line.runs.length < 1) return;
        var run = line.runs[0];
        self.setProp(self.textHandle,"text",run.model.text.substring(run.start, run.end));
        var pos = this.indexToXY(this.control.cursor.index);
        self.setProp(self.cursorHandle, 'tx',pos.x);
    }
    this.init = function(core) {
        this.handle = sgtest.createGroup();
        this.rectHandle = sgtest.createRect();
        this.cursorHandle = sgtest.createRect();
        this.textHandle = sgtest.createText();
        sgtest.addNodeToGroup(this.rectHandle,this.handle);
        sgtest.addNodeToGroup(this.textHandle,this.handle);
        sgtest.addNodeToGroup(this.cursorHandle,this.handle);
        this.live = true;
        this.delegateProps({ tx:0, ty:0, scalex:1, scaley:1, rotatez:0, visible:1 },this.handle);
        this.delegateProps({x:0,y:0,w:100,h:30,r:0.4,g:0.8,b:0.3},this.rectHandle);
        this.delegateProps({text:"sometext",fontSize:20},this.textHandle);
        this.setProp(this.cursorHandle,'x',0);
        this.setProp(this.cursorHandle,'w',2);
        this.setProp(this.cursorHandle,'h',30);
        this.setProp(this.cursorHandle,'r',1);
        this.setProp(this.cursorHandle,'g',0);
        this.setProp(this.cursorHandle,'b',0);
        
        this.install(core);
        
        var self = this;
        core.on("press",this,function() {
            core.requestFocus(self);
        });
        core.on("focusgain",this,function() {
            self.setBackgroundFill("#44aaff");
        });
        core.on("focusloss",this,function() {
            self.setBackgroundFill("#2266aa");
        });
        this.setText = function(text) {
            this.model.setText(text);
            this.view.layout();
            return this;
        }
        this.getText = function() {
            return this.model.getText();
        }
        this.setBackgroundFill = function(color) {
            color = ParseRGBString(color);
            this.setProp(this.rectHandle,'r',color.r);
            this.setProp(this.rectHandle,'g',color.g);
            this.setProp(this.rectHandle,'b',color.b);
            return this;
        }
        this.view.font = this.font;
    }
    this.draw = function() {
    }
    this.contains = function(x,y) {
        if(x >=  this.getX()  && x <= this.getX() + this.getW()) {
            if(y >= this.getY() && y <= this.getY() + this.getH()) {
                return true;
            }
        }
        return false;
    }
}
*/
//SGTextControl.extend(SGWidget);

/*
function SGTextField() {
    SGTextControl.call(this);
    this.setWrapping(false);
}
//SGTextField.extend(SGTextControl);
*/

/*
function SGTextArea() {
    SGTextControl.call(this);
    this.setWrapping(true);
}
//SGTextArea.extend(SGTextControl);
*/

/** @class Stage
@desc A stage represents a window. On mobile devices there will only be one stage. On desktop there can be multiple. A stage
can only be created by using the core.createStage() function. 
*/
function SGStage(core) {
	this.core = core;
	/** @func setSize(w,h) set the width and height of the stage. Has no effect on mobile. */
	this.setSize = function(width,height) {
	    this.width = width;
	    this.height = height;
	    exports.native.setWindowSize(this.width,this.height);
	}
	/** @func getW returns the width of this stage. */
	this.getW = function() {
	    return this.width;
	}
	/** @func getH returns the height of this stage. */
	this.getH = function() {
	    return this.height;
	}
	/** @func on(name,node,cb) sets a callback for events matching the specified name on the 
	specified node. Use null for the node to match global events. */
	this.on = function(name, node, cb) {
		this.core.on(name, node, cb);
	}
	/** @func getRoot returns the root node of this stage. */
	this.getRoot = function() {
		return this.core.root;
	}
	/** @func set the root node of this stage. */
	this.setRoot = function(root) {
		this.core.setRoot(root);
		return this;
	}
	/** @func find(id) searches the stage's node tree for a node with the requested ID. Returns null if no node is found. */
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
    
}

/**
@class Font
@desc Represents a particular font face. The face is set to a specific style,
but can be used at multiple sizes.
*/
function JSFont(jsonfile, imagefile) {
    //create the default font
    var jsontext = fs.readFileSync(jsonfile);
    this.json = JSON.parse(jsontext);
    this.image = exports.native.loadPngToTexture(imagefile);
    this.nativefont = exports.native.createNativeFont(this.image.texid,this.json);
    this.basesize = this.json.size;
    this.scale = 0.5;
    /** @func calcStringWidth(string, size)  returns the width of the specified string rendered at the specified size */
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
    /** @func getHeight(size) returns the height of this font at the requested size */
    this.getHeight = function(fs) {
        return this.json.height * (fs/this.basesize);
    }
    /** @func getAscent(fs) returns the ascent of this font at the requested size */
    this.getAscent = function(fs) {
        return this.ascent * (fs/this.basesize);
    }
}


exports.native.createDefaultFont = function() {
    return new JSFont(__dirname+"/font.json",__dirname+"/font.png");
}

/** @class Anim
@desc  Anim animates ones property of a node. It must be created using the
core.createAnim() function.
*/
function SGAnim(node, prop, start, end, dur) {
    this.node = node;
    this.prop = prop;
    this.start = start;
    this.end = end;
    this.duration = dur;
    this.count = 1;
    this.autoreverse = false;
    this.afterCallbacks = [];
    this.beforeCallbacks = [];
    this.init = function(core) {
        this.handle = exports.native.createAnim(
            this.node.handle,
            this.prop,
            this.start,this.end,this.duration,this.count,this.autoreverse);
    }
    /** @func setIterpolator(type) Sets the interpolator to use for this animation. Valid values include: 
      amino.Interpolators.CubicIn and amino.Interpolators.CubicInOut and amino.Interpolators.Linear
     */
    this.setInterpolator = function(lerptype) {
        this.lerptype = lerptype;
        exports.native.updateAnimProperty(this.handle, "lerpprop", lerptype);
        return this;
    }
    this.setCount = function(count) {
        this.count = count;
        exports.native.updateAnimProperty(this.handle, "count", count);
        return this;
    }
    this.setAutoreverse = function(av) {
        this.autoreverse = av;
        exports.native.updateAnimProperty(this.handle, "autoreverse", av);
        return this;
    }
    this.finish = function() {
        var setterName = "set"+camelize(this.prop);
        var setter = this.node[setterName];
        if(setter) {
            setter.call(this.node,this.end);
        }
        for(var i in this.afterCallbacks) {
            this.afterCallbacks[i]();
        }
    }
    /** @func after(cb)  Sets a callback to be called when the animation finishes. Note: an infinite animation will never finish. */
    this.after = function(cb) {
        this.afterCallbacks.push(cb);
        return this;
    }
    
    this.before = function(cb) {
        this.beforeCallbacks.push(cb);
        return this;
    }
}



/** 
@class Core
@desc The core of Amino. Only one will exist at runtime. Always access through the callback 
*/
function Core() {
    this.anims = [];
    /** @func createPropAnim(node, propertyName, startValue, endValue, duration, count, autoreverse) 
    creates a new property animation. Node is the node to be animated. propertyName is the string name of the property
    to animate. This should be a numeric property like tx or scalex. start and end are the starting and ending values
    of the animation. Duration is the length of the animation in milliseconds. 1000 = one second. Count is
    how many times the animation should loop. Use -1 to loop forever. Autoreverse determines if the animation should
    alternate direction on every other time. Only applies if the animatione will play more than one time.
    */
    this.createPropAnim = function(node, prop, start, end, dur) {
        var anim = new SGAnim(node,prop,start,end,dur);
        anim.init(this);
        this.anims.push(anim);
        return anim;
    }
    var self = this;
    //TODO: actually clean out dead animations when they end
    this.notifyAnimEnd = function(e) {
        //console.log("getting notification of animation ending: ", e);
        var found = -1;
        for(var i=0; i<self.anims.length; i++) {
            var anim = self.anims[i];
            if(anim.handle == e.id) {
                found = i;
                anim.finish();
            }
        }
    }
    
    this.init = function() {
        exports.native.init();
        setupBacon(this);
        exports.native.setEventCallback(function(e) {
            if(e.type == "mousebutton") {
                mouseState.pressed = (e.state == 1);
            }
            baconbus.push(e);
        });
    }
    
    this.root = null;
    this.start = function() {
        if(!this.root) {
            console.log("ERROR. No root set!");
            process.exit();
        }
        // use setTimeout for looping
        function tickLoop() {
            exports.native.tick();
            setTimeout(tickLoop,1);
        }
        
        function immediateLoop() {
            exports.native.tick();
            exports.native.setImmediate(immediateLoop);
        }
        setTimeout(immediateLoop,1);
        //setTimeout(tickLoop,1);
    }
    
    /** @func createStage(w,h)  creates a new stage. Only applies on desktop. */
    this.createStage = function(w,h) {
        exports.native.createWindow(w,h);
        this.defaultFont = exports.native.createDefaultFont();
        this.stage = new SGStage(this);
        return this.stage;
    }
    
    this.setRoot = function(node) {
        exports.native.setRoot(node.handle);
        this.root = node;
    }
    this.findNodeAtXY = function(x,y) {
        	return this.findNodeAtXY_helper(this.root,x,y);
    }
    this.findNodeAtXY_helper = function(root,x,y) {
        if(!root) return null;
        if(!root.getVisible()) return null;
    
        if(root.children) {
            for(var i=root.children.length-1; i>=0; i--) {
                var node = root.children[i];
                var tx = x - node.getTx();
                var ty = y - node.getTy();
                var found = this.findNodeAtXY_helper(node,tx,ty);
                if(found) {
                	return found;
            	}
            }
        }
        if(root.contains && root.contains(x,y)) {
           return root;
        }
        return null;
    }
    this.globalToLocal = function(pt, node) {
    	if(node.parent) {
    		var pt2 = {
    			x: pt.x - node.getTx(),
    			y: pt.y - node.getTy()
    			}
    		return this.globalToLocal(pt2,node.parent);
    	} else {
	    	return pt;
	    }
    }
    this.listeners = {};
    this.on = function(name, target, listener) {
        name = name.toLowerCase();
        if(target == null) {
            target = this;
        }
        if(!this.listeners[name]) {
            this.listeners[name] = [];
        }
        this.listeners[name].push({
                target:target,
                func:listener
        });
    }
    this.fireEventAtTarget= function(target, event) {
        //        console.log("firing an event at target:",event.type);
        if(!event.type) { console.log("WARNING. Event has no type!"); }
        if(this.listeners[event.type]) {
            this.listeners[event.type].forEach(function(l) {
                    if(l.target == target) {
                        l.func(event);
                    }
            });
        }
    }
    this.fireEvent = function(event) {
        if(!event.type) { console.log("WARNING. Event has no type!"); }
        if(this.listeners[event.type]) {
            this.listeners[event.type].forEach(function(l) {
                    if(l.target == event.source) {
                        l.func(event);
                    }
            });
        }
    };
    
    this.requestFocus = function(target) {
        if(this.keyfocus) {
            this.fireEventAtTarget(this.keyfocus,{type:"focusloss",target:this.keyfocus});
        }
        this.keyfocus = target;
        if(this.keyfocus) {
            this.fireEventAtTarget(this.keyfocus,{type:"focusgain",target:this.keyfocus});
        }
    }
}

function startApp(cb) {
    console.log("starting the app");
    Core._core = new Core();
    Core._core.init();
    var stage = Core._core.createStage(600,600);
    cb(Core._core,stage);
    Core._core.start();
}

exports.getCore = function() {
    return Core._core;
}
exports.startApp = startApp;
exports.Interpolators = {
    Linear:propsHash["lerplinear"],
    CubicIn:propsHash["lerpcubicin"],
    CubicInOut:propsHash["lerpcubicinout"],
}





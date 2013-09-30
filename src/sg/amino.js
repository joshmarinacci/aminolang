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
    base:    "#f9be00",

    neutral: "#cccccc",
    text:    "#000000",
    accent:  "#55ff55",
    listview: {
        cell: {
            fillEven: "#f5f5f5",
            fillOdd:  "#eeeeee",
            fillSelected: "#88ccff",
        }
    },
    textfield: {
        bg: {
            unfocused: "#d0d0d0",
            focused: "#f0f0f0",
        }
    },
    button: {
        fill: {
            normal: "#dddddd",
            selected: "#888888",
            pressed: "#aaaaaa",
        }
    }
}

exports.SOFTKEYBOARD_ENABLED = false;


exports.sgtest = jrequire('sgtest');

var fontmap = {};

var defaultFonts = {
    'source': {
        weights: {
            200: {
                normal: "SourceSansPro-ExtraLight.ttf",
                italic: "SourceSansPro-ExtraLightItalic.ttf",
            },
            300: {
                normal: "SourceSansPro-Light.ttf",
                italic: "SourceSansPro-LightItalic.ttf",
            },
            400: {
                normal: "SourceSansPro-Regular.ttf",
                italic: "SourceSansPro-Italic.ttf",
            },
            
            600: {
                normal: "SourceSansPro-Semibold.ttf",
                italic: "SourceSansPro-SemiboldItalic.ttf",
            },
            700: {
                normal: "SourceSansPro-Bold.ttf",
                italic: "SourceSansPro-BoldItalic.ttf",
            },
            900: {
                normal: "SourceSansPro-Black.ttf",
                italic: "SourceSansPro-BlackItalic.ttf",
            },
        }
    },
    'awesome': {
        weights: {
            400: {
                normal: "fontawesome-webfont.ttf",
            },
        }
    },
}

exports.native = {
    createNativeFont: function(path) {
        //console.log('creating native font ' + path);
        return exports.sgtest.createNativeFont(path);
    },
    init: function(core) {
        //console.log("doing native init");
        exports.sgtest.init();
    },
    createWindow: function(core,w,h) {
        exports.sgtest.createWindow(w,h);
        fontmap['source']  = new JSFont(defaultFonts['source']);
        fontmap['awesome'] = new JSFont(defaultFonts['awesome']);
        core.defaultFont = fontmap['source'];
    },
    getFont: function(name) {
        return fontmap[name];
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
    createRect: function()  {          return exports.sgtest.createRect();    },
    createGroup: function() {          return exports.sgtest.createGroup();   },
    createPoly: function()  {          return exports.sgtest.createPoly();    },
    addNodeToGroup: function(h1,h2) {
        exports.sgtest.addNodeToGroup(h1,h2);
    },
    loadPngToTexture: function(imagefile,cb) {
        var img = exports.sgtest.loadPngToTexture(imagefile);
        cb(img);
    },
    loadJpegToTexture: function(imagefile, cb) {
        var img = exports.sgtest.loadJpegToTexture(imagefile);
        cb(img);
    },
    createText: function() {
        return exports.sgtest.createText();
    },
    setWindowSize: function(w,h) {
        exports.sgtest.setWindowSize(w,h);
    },
    getWindowSize: function(w,h) {
        return exports.sgtest.getWindowSize(w,h);
    },
    createAnim: function(handle,prop,start,end,dur,count,rev) {
        return exports.sgtest.createAnim(handle,propsHash[prop],start,end,dur,count,rev);
    },
    updateAnimProperty: function(handle, prop, type) {
        exports.sgtest.updateAnimProperty(handle, propsHash[prop], type);
    },
    
    createPropAnim: function(node,prop,start,end,dur) {
        return new SGAnim(node,prop,start,end,dur);
    },

}

var mouseState = {
    pressed:false,
    x:0,
    y:0,
    pressTarget:null,
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

exports.KEY_MAP = {
    UP_ARROW:      283,
    DOWN_ARROW:    284,
    RIGHT_ARROW:   286,
    LEFT_ARROW:    285,
    BACKSPACE:     295,
    ENTER:         294,
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
                    x:pt.x,
                    y:pt.y,
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
                return {dx:0,dy:0,dtime:new Date().getTime()};
            } else {
                return {dx:b.x-a.x,dy:b.y-a.y, dtime: b.time-a.time};
            }
        });
        
    bus.filter(typeIs("mouseposition"))
        .zip(diffstream,function(a,b) {
                a.dx = b.dx;
                a.dy = b.dy;
                a.dtime = b.dtime;
                return a;
        })
        .filter(mousePressed)
        .onValue(function(e) {
            var node = mouseState.pressTarget;
            if(node == null) {
                node = core.findNodeAtXY(mouseState.x,mouseState.y);
            }
            if(node != null) {
	            var pt = core.globalToLocal({x:mouseState.x,y:mouseState.y},node);
                core.fireEventAtTarget(
                    node,
                    {
                        type:"drag",
                        pressed:mouseState.pressed,
                        x:pt.x,
                        y:pt.y,
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
                    point:{x:mouseState.x, y:mouseState.y},
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
        mouseState.pressTarget = null;
        
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
                //console.log("firing",event,"at",core.keyfocus);
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
            this.dirty = true;
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
            this.dirty = true;
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
    
    //general
    "visible":18,
    "opacity":27,
    "r":5,
    "g":6,
    "b":7,
    "texid":8,
    "w":10,
    "h":11,
    "x":21,
    "y":22,
    
    //transforms
    "tx":23,
    "ty":1,
    "scalex":2,
    "scaley":3,
    "rotateZ":4,
    "rotateX":19,
    "rotateY":20,
    
    //text
    "text":9,
    "fontSize":12,
    "fontId":28,
    
    //animation
    "count":29,
    "lerplinear":13,
    "lerpcubicin":14,
    "lerpcubicout":15,
    "lerpprop":16,
    "lerpcubicinout":17,
    
    
    //geometry
    "geometry":24,
    "filled":25,
    "closed":26,
    
    //rectangle texture
    "textureLeft":  30,
    "textureRight": 31,
    "textureTop":   32,
    "textureBottom":33,    
    
    //clipping
    "cliprect": 34,
   
}

exports.propsHash = propsHash;

function camelize(s) {
	return s.substring(0,1).toUpperCase() + s.substring(1);
}



var doshort = true;
function shortCircuit(target,x,y) {
    if(!target.shortCircuit) return false;
    if(doshort && x === y) {
        return true;
    }
    return false;
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
        /** @prop scalex scale X. @default 1*/
        scalex: { value: 1 },
        /** @prop scaley scale Y. @default 1*/
        scaley: { value: 1 },
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
        opacity: { value: 1},
        /** @prop fill fill color of the rectangle. Should be a hex value like #af03b6 */
        fill: {
            value: '#ff0000', 
        }
    },
    //replaces all setters
    set: function(name, value) {
        if(shortCircuit(this, this.props[name],value)) return;
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
        this.shortCircuit = false;
        //invoke all setters once to push default values to the native side
        for(var propname in this.props) {
            this.set(propname, this.props[propname]);
        }
        this.shortCircuit = true;
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
@class ProtoPoly
@desc the basic primitive polygon composed of lines. may or may not be filled. may or may not be closed.
*/
exports.ProtoPoly = exports.ComposeObject({
    type: "Poly",
    props: {
        /** @prop id id of the rectangle. might not be unique */
        id: { value: "no id" },
        /** @prop tx translate X */
        tx: { value: 0 },
        /** @prop ty translate Y */
        ty: { value: 0 },
        /** @prop scalex scale X. @default 1*/
        scalex: { value: 1 },
        /** @prop scaley scale Y. @default 1*/
        scaley: { value: 1 },
        /** @prop visible visible or not. 1 or 0, not true or false */
        visible: { value: 1 },
        /** @prop w width of the rectangle. default value = 300 */
        w: { value: 300 },
        /** @prop h height of the rectangle. default value = 100 */
        h: { value: 100 },
        r: { value: 0},
        g: { value: 1},
        b: { value: 0},
        geometry: { value: [0,0, 50,0, 50,50]},
        filled: { value: false },
        closed: { value: true  },
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
        this.handle = exports.native.createPoly();
        this.live = true;
        //invoke all setters once to push default values to the native side
        for(var propname in this.props) {
            this.set(propname, this.props[propname]);
        }
        this.type = "rect";
        var rect = this;
        
        this.contains = function(x,y) {
            //dont calc containment for now
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
        w: { value: 100 },
        h: { value: 100 },
        cliprect: { value: 0 },
    },
    //replaces all setters
    set: function(name, value) {
        if(shortCircuit(this,this.props[name],value)) return;
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
            return this;
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
        this.shortCircuit = true;
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
        /** @prop scalex scale X. @default 1*/
        scalex: { value: 1 },
        /** @prop scaley scale Y. @default 1*/
        scaley: { value: 1 },
        /** @prop visible  @default true */
        visible: { value: 1 },
        /** @prop text  the exact string to display */
        text: { value: 'silly text' },
        /** @prop fontSize the fontsize of this text string */
        fontSize: { value: 20 },
        fontName: { value: 'source' },
        fontWeight: { value: 400 },
        fontStyle: { value: 'normal' },
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
        if(shortCircuit(this,this.props[name],value)) return;
        this.props[name] = value;
        //mirror the property to the native side
        if(this.live) {
            if(name == 'fontName') {
                if(!fontmap[value]) {
                    console.log("WARNING. No font '" + value + "' found!!!");
                }
                this.font = fontmap[value];
                this.updateFont();
                return;
            }
            exports.native.updateProperty(this.handle, name, value);
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
        var self = this;
        exports.getCore().on('validate',null,function() {
            if(self.dirty) {
                self.updateFont();
                exports.native.updateProperty(self.handle, 'text', self.getText());
                self.dirty = false;
            }
        });
        this.live = true;
        this.handle = exports.native.createText();
        this.updateFont = function() {
            var id = this.font.getNative(this.getFontSize(),this.getFontWeight(),this.getFontStyle());
            exports.native.updateProperty(this.handle, 'fontId', id);
        }
        this.type = "text";
        this.font = Core._core.defaultFont;
        this.updateFont();
        //invoke all setters once to push default values to the native side
        for(var propname in this.props) {
            this.set(propname, this.props[propname]);
        }
        this.shortCircuit = true;
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
        /** @prop scalex scale X. @default 1*/
        scalex: { value: 1 },
        /** @prop scaley scale Y. @default 1*/
        scaley: { value: 1 },
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
        
        textureLeft:   { value: 0 },
        textureRight:  { value: 1 },
        textureTop:    { value: 0 },
        textureBottom: { value: 1 },
    },
    //replaces all setters
    set: function(name, value) {
        this.props[name] = value;
        //mirror the property to the native side
        if(this.live) {
            exports.native.updateProperty(this.handle, name, value);
        }
        if(name == 'src' && value != null) {
            var src = this.props.src;
            var self = this;
            if(src.toLowerCase().endsWith(".png")) {
                exports.native.loadPngToTexture(src, function(image) {
                    self.image = image;
                    self.setW(image.w);
                    self.setH(image.h);
                    if(self.image) {
                        exports.native.updateProperty(self.handle, "texid", self.image.texid);
                    }
                });
            } else {
                exports.native.loadJpegToTexture(src, function(image) {
                    self.setW(image.w);
                    self.setH(image.h);
                    self.image = image;
                    if(self.image) {
                        exports.native.updateProperty(self.handle, "texid", self.image.texid);
                    }
                });
            }
            
        }
    },
    init: function() {
        this.live = true;
        this.handle = exports.native.createRect();
        //invoke all setters once to push default values to the native side
        for(var propname in this.props) {
            this.set(propname, this.props[propname]);
        }
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
            promote: ["tx","ty","scalex","scaley","visible"],
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
function JSFont(desc) {
    var reg = desc.weights[400];
    this.desc = desc;
    this.weights = {};
    for(var weight in desc.weights) {
        this.weights[weight] = exports.native.createNativeFont(__dirname+"/fonts/"+desc.weights[weight].normal);
    }
    
    this.getNative = function(size, weight, style) {
        if(this.weights[weight] != undefined) {
            return this.weights[weight];
        }
        console.log("ERROR. COULDN'T find the native for " + size + " " + weight + " " + style);
        return this.weights[400];
    }
    /** @func calcStringWidth(string, size)  returns the width of the specified string rendered at the specified size */
    this.calcStringWidth = function(str, size, weight, style) {
        return exports.sgtest.getCharWidth(str,size,this.getNative(size,weight,style));
    }
    /** @func getHeight(size) returns the height of this font at the requested size */
    this.getHeight = function(size, weight, style) {
        if(size == undefined) {
            throw new Error("SIZE IS UNDEFINED");
        }
        return exports.sgtest.getFontHeight(size, this.getNative(size, weight, style));
    }
    /** @func getAscent(fs) returns the ascent of this font at the requested size */
    this.getAscent = function(fs) {
        return 15;
    }
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
            this.start,this.end,this.duration);
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
        var anim = exports.native.createPropAnim(node,prop,start,end,dur);
        anim.init(this);
        this.anims.push(anim);
        return anim;
    }
    var self = this;
    //TODO: actually clean out dead animations when they end
    this.notifyAnimEnd = function(e) {
        var found = -1;
        for(var i=0; i<self.anims.length; i++) {
            var anim = self.anims[i];
            if(anim.handle == e.id) {
                found = i;
                anim.finish();
            }
        }
    }
    
    var ecount = 0;
    this.init = function() {
        exports.native.init(this);
        setupBacon(this);
        exports.native.setEventCallback(function(e) {
            ecount++;
            e.time = new Date().getTime();
            if(e.type == "mousebutton") {
                mouseState.pressed = (e.state == 1);
            }
            baconbus.push(e);
        });
    }
    
    this.root = null;
    this.validate = function() {
        this.fireEvent({ type:"validate", source:this});
        //console.log("total events for this frame = " + ecount);
        ecount = 0;
    }
    this.start = function() {
        var core = this;
        //send a final window size event to make sure everything is lined up correctly
        var size = exports.native.getWindowSize();
        baconbus.push({
            type:"windowsize",
            width:size.w,
            height:size.h,
        });
        if(!this.root) {
            throw new Error("ERROR. No root set on stage");
        }
        // use setTimeout for looping
        function tickLoop() {
            exports.native.tick(core);
            setTimeout(tickLoop,1);
        }
        
        var self = this;
        function immediateLoop() {
            try {
                //console.time("tick");
                exports.native.tick(core);
                self.validate();
                //console.timeEnd("tick");
            } catch (ex) {
                console.log(ex);
                console.log(ex.stack);
                console.log("EXCEPTION. QUITTING!");
                return;
            }
            exports.native.setImmediate(immediateLoop);
        }
        setTimeout(immediateLoop,1);
        //setTimeout(tickLoop,1);
    }
    
    /** @func createStage(w,h)  creates a new stage. Only applies on desktop. */
    this.createStage = function(w,h) {
        exports.native.createWindow(this,w,h);
        this.stage = new SGStage(this);
        return this.stage;
    }
    
    this.getFont = function(name) {
        return exports.native.getFont(name);
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
        
        var tx = x-root.getTx();
        var ty = y-root.getTy();
        tx = tx/root.getScalex();
        ty = ty/root.getScaley();
    
        if(root.children) {
            for(var i=root.children.length-1; i>=0; i--) {
                var node = root.children[i];
                var found = this.findNodeAtXY_helper(node,tx,ty);
                if(found) {
                	return found;
            	}
            }
        }
        if(root.contains && root.contains(tx,ty)) {
           return root;
        }
        return null;
    }
    this.globalToLocal = function(pt, node) {
    	if(node.parent) {
    		pt =  this.globalToLocal(pt,node.parent);
            return {
                x: (pt.x - node.getTx())/node.getScalex(),
                y: (pt.y - node.getTy())/node.getScaley(),
            }
    	} else {
    	    return {
                x: (pt.x - node.getTx())/node.getScalex(),
                y: (pt.y - node.getTy())/node.getScaley(),
	    	}
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





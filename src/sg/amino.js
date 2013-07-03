var fs = require('fs');
var bacon = require('./Bacon');
//var sgtest = require("./build/Release/sgtest.node");

var OS = "KLAATU";
if(process.platform == "darwin") {
    OS = "MAC";
}

var sgtest;
if(OS == "MAC") {
    sgtest = require('./aminonative.node');
} else {
    amino = require('./aminonative.node');
}

var textcontrol = require('./textcontrol.js');

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
    var bus = new bacon.Bus();
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

function camelize(s) {
	return s.substring(0,1).toUpperCase() + s.substring(1);
}

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

function SGNode() {
	this.live = false;
	
	this.createProp = function(name,handle) {
		this["set"+camelize(name)] = function(v) {
			this[name] = v;
			if(this.live) {
			    if(!propsHash[name]) {
			        console.log("WARNING: no prop key for " + name + " " + this.id);
			    }
				sgtest.updateProperty(handle, propsHash[name],v);
				if(this.propertyUpdated) {
				    this.propertyUpdated(name,v);
				}
			}
			return this;
		};
		this["get"+camelize(name)] = function() {
			return this[name];
		};
	}
	
	this.setProp = function(handle, name, value) {
		if(handle == null)  console.log("WARNING can't set prop " + name + ", the handle is null");
		sgtest.updateProperty(handle, propsHash[name],value);
	}

    
	this.delegateProps = function(props, handle) {
		for(var name in props) {
			this[name] = props[name]; //set the initial value
			this.createProp(name,handle);
			sgtest.updateProperty(handle, propsHash[name], props[name]);
		}
	}
	
	this.id = "noid";
	this.setId = function(id) {
		this.id = id;
		return this;
	}
	this.getId = function() {
	    return this.id;
	}
	this.getParent = function() {
	    return this.parent;
	}
	this.visible = true;
    this.setVisible = function(visible) {
        this.visible = visible;
        this.setProp(this.handle,'visible',visible?1:0);            
        return this;
    }	
    this.getVisible = function() {
        return this.visible;
    }
}

function SGTestNode() {
	SGNode(this);
	this.init = function() {
		this.handle = sgtest.createRect();
		this.live = true;
		this.delegateProps({ tx:0, ty:0, scalex:1, scaley:1, visible:1 },this.handle);
		//rect props
		this.delegateProps({  x: 0, y: 0, w: 100, h: 100 },this.handle);
	}
}
SGTestNode.extend(SGNode);


function SGRect() {
	SGNode(this);
    this.init = function() {
        this.handle = sgtest.createRect();
        console.log("==== handle = " + this.handle);
        this.live = true;
        var props = { tx:0, ty:0, x:0, y:0, w:100, h:100, r: 0, g: 1, b:0, scalex: 1, scaley:1, rotateZ: 0, rotateX:0, rotateY: 0, visible:1 };
        this.delegateProps(props,this.handle);
        this.setFill = function(color) {
            color = ParseRGBString(color);
            this.setProp(this.handle,'r',color.r);
            this.setProp(this.handle,'g',color.g);
            this.setProp(this.handle,'b',color.b);
            return this;
        }
        this.getFill = function() {
            return this.color;
        }
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
SGRect.extend(SGNode);

function SGGroup() {
    this.live = false;
    this.children = [];
    this.add = function(node) {
    	if(!node) abort("can't add a null child to a group");
        if(!this.live) abort("error. trying to add child to a group that isn't live yet");
        this.children.push(node);
        node.parent = this;
        sgtest.addNodeToGroup(node.handle,this.handle);
    }
    this.isParent = function() { return true; }
    this.getChildCount = function() {
    	return this.children.length;
    }
    this.getChild = function(i) {
    	return this.children[i];
    }
    this.remove = function(target) {
        var n = this.children.indexOf(target);
        this.children.splice(n,1);
        target.parent = null;
    }
    this.clear = function() {
        for(var i in this.children) {
            this.children[i].setVisible(false);
        }
        this.children = [];
    }
            
    
    this.init = function() {
        this.handle = sgtest.createGroup();
        var props = { tx:0, ty:0, scalex:1, scaley:1, rotateX:0, rotateY:0, rotateZ:0, visible:1};
        this.delegateProps(props,this.handle);
        this.live = true;
    }
}
SGGroup.extend(SGNode);




function SGWidget() {
    this.contains = function(x,y) {
        if(x >=  this.getX()  && x <= this.getX() + this.getW()) {
            if(y >= this.getY() && y <= this.getY() + this.getH()) {
                return true;
            }
        }
        return false;
    }
    this.propertyUpdated = function() {
    }
    this.createLocalProp = function(name,value) {
    	this["set"+camelize(name)]= function(v) {
    		this[name] = v;
    		this.propertyUpdated(name,v);
    		return this;
    	}
		this["get"+camelize(name)] = function() {
			return this[name];
		};
		this["set"+camelize(name)](value);
    }
    this.createLocalProps = function(props) {
		for(var name in props) {
			this.createLocalProp(name,props[name]);
		}
    }
    
    this.createLocalProps({
    	anchorLeft:true,
    	anchorRight:false,
    	anchorTop:true,
    	anchorBottom:false,
    	left:0,
		right:0,
		top:0,
		bottom:0,
    });
}
SGWidget.extend(SGNode);



function SGAnchorPanel() {
    this.live = false;
    this.children = [];
    this.isParent = function() { return true; }
    this.getChildCount = function() {
    	return this.children.length;
    }
    this.getChild = function(i) {
    	return this.children[i];
    }
    this.add = function(node) {
    	if(!node) abort("can't add a null child to an anchor panel");
        if(!this.live) abort("error. trying to add child to a group that isn't live yet");
        this.children.push(node);
        node.parent = this;
        sgtest.addNodeToGroup(node.handle,this.handle);
        this.redoLayout();
    }
    this.propertyUpdated = function(name,value) {
        this.redoLayout();
    }
    this.redoLayout = function() {
        for(var i in this.children) {
            var node = this.children[i];
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
    this.init = function() {
        this.handle = sgtest.createGroup();
        this.bgHandle = sgtest.createRect();
        sgtest.addNodeToGroup(this.bgHandle,this.handle);
        var props = { tx:0, ty:0, scalex:1, scaley:1, rotateZ:0 };
        this.delegateProps(props,this.handle);
        this.delegateProps({x:0,y:0,w:100,h:100},this.bgHandle);
        
        this.setFill = function(fill) {
            var color = ParseRGBString(fill);
            this.setProp(this.bgHandle,'r',color.r);
            this.setProp(this.bgHandle,'g',color.g);
            this.setProp(this.bgHandle,'b',color.b);
        	return this;
        }
        this.live = true;
    }
}
SGAnchorPanel.extend(SGWidget);


function SGLabel() {
    this.live = false;
    this.init = function() {    
        this.handle = sgtest.createText();
        var props = { tx:0, ty:0, x:0, y:0, r: 0, g: 0, b:0, scalex: 1, scaley:1, rotatez: 0, text:"silly text", fontSize:15, visible:1};
        this.delegateProps(props,this.handle);
        
        this.setTextColor = function(textcolor) {
            var color = ParseRGBString(textcolor);
            this.setProp(this.handle,'r',color.r);
            this.setProp(this.handle,'g',color.g);
            this.setProp(this.handle,'b',color.b);
            return this;
        }
        this.setColor = this.setTextColor;
        this.live = true;
	    this.createLocalProps({
    		w:0,
    		h:0,
    		});
        
    }
}
SGLabel.extend(SGWidget);



function SGButton() {
    this.live = false;
    this.children = [];
    this.init = function(core) {
        this.handle = sgtest.createGroup();
        this.rectHandle = sgtest.createRect();
        this.textHandle = sgtest.createText();
        sgtest.addNodeToGroup(this.rectHandle,this.handle);
        sgtest.addNodeToGroup(this.textHandle,this.handle);
        this.live = true;
        this.delegateProps({ tx:0, ty:0, scalex:1, scaley:1, rotatez:0 },this.handle);
        this.delegateProps({x:0,y:0,w:100,h:30,r:0.4,g:0.8,b:0.3},this.rectHandle);
        this.delegateProps({text:"sometext",fontSize:15},this.textHandle);
        
        // whenever width or height is changed, reposition the text
        var oldsetw = this.setW;
        this.setW = function(w) {
            oldsetw.apply(this,[w]);
            var textw = this.font.calcStringWidth(this.getText(),this.getFontSize());
            this.setProp(this.textHandle,'tx',(w-textw)/2);
            return this;
        };
        var oldseth = this.setH;
        this.setH = function(h) {
            oldseth.apply(this,[h]);
            var texth = this.font.getHeight(this.getFontSize());
            this.setProp(this.textHandle,'ty',(h-texth)/2);
            return this;
        }
        
        this.setBaseColor = function(color) {
            color = ParseRGBString(color);
            this.setProp(this.rectHandle,'r',color.r);
            this.setProp(this.rectHandle,'g',color.g);
            this.setProp(this.rectHandle,'b',color.b);
            return this;
        }
        this.setTextColor = function(textcolor) {
            var color = ParseRGBString(textcolor);
            this.setProp(this.textHandle,'r',color.r);
            this.setProp(this.textHandle,'g',color.g);
            this.setProp(this.textHandle,'b',color.b);
            return this;
        }
        
        // set up events
        var self = this;
        core.on("press",this,function(e) {
            self.setBaseColor("#aaee88");
        });
        core.on("release",this,function(e) {
            self.setBaseColor("#77cc55");
        });
        core.on("click",this,function(e) {
            core.fireEvent({type:'action',source:self});
        });
        
        self.setBaseColor("#77cc55");
        self.setTextColor("#ffffff");
        
        // done
        this.createLocalProps({enabled:true});
    }
}
SGButton.extend(SGWidget);

function SGToggleButton() {
}
SGToggleButton.extend(SGButton);


function SGSlider() {
	this.mirrorProp = function(handle, name, value) {
		var old = this["set"+camelize(name)];
		this["set"+camelize(name)] = function(v) {
			old.apply(this,[v]);
			this.setProp(handle,name,v);
			return this;
		}
	}
	
	this.pointToValue = function(x) {
		return x/this.getW()*100;
	}
	this.init = function(core) {
        this.handle = sgtest.createGroup();
        this.bgHandle = sgtest.createRect();
        this.thumbHandle = sgtest.createRect();
        sgtest.addNodeToGroup(this.bgHandle,this.handle);
        sgtest.addNodeToGroup(this.thumbHandle,this.handle);
        this.live = true;
        
        //transform props
        this.delegateProps({ tx:0, ty:0, scalex:1, scaley:1, rotatez:0 },this.handle);
        this.delegateProps({ x:0, y:0, w:100, h:30, r:1, g:0, b:0.3},this.bgHandle);
        this.setProp(this.thumbHandle,'w',50);
        this.mirrorProp(this.thumbHandle,'h',50);
        this.setValue = function(v) {
        	this.value = v;
        	var fract = v/100;
        	var pxv = fract*this.getW();
        	this.setProp(this.thumbHandle,'w',pxv);
        	return this;
        }
        this.getValue = function(v) {
        	return this.value;
        }
        
        core.on("drag", this, function(e) {
            var r = e.target;
            r.setValue(r.pointToValue(e.point.x));
            core.fireEvent({type:'change',source:r, value:r.getValue()});
        });
	}

}
SGSlider.extend(SGWidget);

function SGSpinner() {
	this.active = false;
	this.init = function(core) {
        this.handle = sgtest.createGroup();
        this.part1 = sgtest.createRect();
        this.part2 = sgtest.createRect();
        sgtest.addNodeToGroup(this.part1,this.handle);
        sgtest.addNodeToGroup(this.part2,this.handle);
        this.live = true;
        this.delegateProps({ tx:0, ty:0, scalex:1, scaley:1, rotatez:0, visible:0 },this.handle);
        this.setW = function(w) {
        	this.w = w;
        	this.setProp(this.part1,'w',w);
        	this.setProp(this.part2,'w',w);
        	return this;
        }
        this.setH = function(h) {
        	this.h = h;
        	this.setProp(this.part1,'h',h);
        	this.setProp(this.part2,'h',h);
        	return this;
        }
        this.setActive = function(active) {
        	this.active = active;
        	if(active) {
        		this.setVisible(1);
				this.setProp(this.part1,'tx',-25);
				this.setProp(this.part1,'ty',-25);
				this.setProp(this.part2,'tx',-25);
				this.setProp(this.part2,'ty',-25);
				this.a1 = sgtest.createAnim(this.part1, propsHash["rotatez"], 0,  360, 1000, -1, false);
				this.a2 = sgtest.createAnim(this.part2, propsHash["rotatez"], 0, -360, 1000, -1, false);
				this.a1f =sgtest.createAnim(this.part1, propsHash["opacity"], 0, 1, 1000, 1, false);
				this.a2f =sgtest.createAnim(this.part2, propsHash["opacity"], 0, 1, 1000, 1, false);
        	} else {
        		//stop animations
        		this.setVisible(0);
        		sgtest.stopAnim(this.a1);
        		sgtest.stopAnim(this.a2);
        		sgtest.stopAnim(this.a1f);
        		sgtest.stopAnim(this.a2f);
        	}
	        return this;
	    }
	    this.getActive = function() {
		    return this.active;
		}
    }
    this.contains = function() { return false; }
}
SGSpinner.extend(SGWidget);

function SGListView() {
    this.listModel = [];
    for(var i=0; i<30; i++) {
        this.listModel.push(i+"");
    }
    this.scroll = 0;
    
	this.createLocalProps({
		x:0,
		y:0,
		w:300,
		h:300,
		cellHeight:32,
		cellWidth:32,
		layout:"vert",
		selectedIndex:-1,
	});
		
	this.propertyUpdated = function(name,value) {
		if(name == "w") {
			this.setProp(this.rectHandle,'w',value);
			this.regenerateCells();
		}
		if(name == "h") {
			this.setProp(this.rectHandle,'h',value);
			this.regenerateCells();
		}
	}
	this.init = function(core) {
        this.handle = sgtest.createGroup();
        this.rectHandle = sgtest.createRect();
	    sgtest.addNodeToGroup(this.rectHandle,this.handle);
        this.delegateProps({ tx:0, ty:0, scalex:1, scaley:1, rotatez:0 },this.handle);
        this.live = true;
        var self = this;
        core.on("drag", this, function(e) {
        	self.scroll -= e.dy;
        	if(self.scroll < 0) self.scroll = 0;
        	var max = self.listModel.length*self.cellHeight - self.getH();
        	if(self.scroll > max) { self.scroll = max; }
        	
        	self.regenerateCells();
        });
	}
	
	this.cells = [];
	this.generateCell = function() {
		var cell = {};
		cell.handle = sgtest.createGroup();
		cell.bgHandle = sgtest.createRect();
		cell.textHandle = sgtest.createText();
		sgtest.addNodeToGroup(cell.bgHandle,cell.handle);
		sgtest.addNodeToGroup(cell.textHandle,cell.handle);
		this.setProp(cell.textHandle, "fontSize",15);
		var self = this;
		cell.setW = function(w) {
			cell.w = w;
			self.setProp(cell.bgHandle,'w',w);
		}
		cell.setTy = function(ty) {
			cell.ty = ty;
			self.setProp(cell.handle,'ty',ty);
		}
		cell.setTx = function(ty) {
			cell.tx = tx;
			self.setProp(cell.handle,'tx',tx);
		}
		cell.setText = function(text) {
			cell.text = text;
			self.setProp(cell.textHandle,'text',text);
        }
        cell.setBackgroundFill = function(color) {
            this.color = ParseRGBString(color);
            self.setProp(this.bgHandle,'r',this.color.r);
            self.setProp(this.bgHandle,'g',this.color.g);
            self.setProp(this.bgHandle,'b',this.color.b);            
        }
		this.setProp(cell.bgHandle,'r',1);  
		this.setProp(cell.bgHandle,'h',30);
		return cell;
	}
	this.textCellRenderer = null;
	this.setTextCellRenderer = function(textCellRenderer) {
	    this.textCellRenderer = textCellRenderer;
	    this.regenerateCells();
	    return this;
	}
	this.fillCellValues = function(cell,i, item) {
	    if(this.textCellRenderer) {
	        this.textCellRenderer(cell,i,item);
	        return;
	    }
		cell.setText(item);
		if(i%2 == 0) {
			this.setProp(cell.bgHandle,'g',0);
		} else {
			this.setProp(cell.bgHandle,'g',1);
		}
	}
	
	this.regenerateCells = function() {
		var start= Math.min(this.listModel.length, Math.floor(this.scroll/this.cellHeight));
		var end = Math.min(this.listModel.length, Math.floor((this.getH()+this.scroll)/this.cellHeight));
		var remainder = this.scroll - Math.floor(this.scroll/this.cellHeight)*this.cellHeight ;
		var self = this;
		this.cells.forEach(function(cell) {
            self.setProp(cell.handle,'visible',0);
		});

		var i = start;
		for(var n=0; n<end-start; n++) {
			if(!this.cells[n]) {
				this.cells[n] = this.generateCell();
				sgtest.addNodeToGroup(this.cells[n].handle,this.handle);
			}
			var cell = this.cells[n];
			this.setProp(cell.handle,'visible',1);
			cell.setTy(n*this.cellHeight - remainder);
			cell.setW(this.getW());
			this.fillCellValues(cell,i,this.listModel[i]);
			i++;
		}
	}
}
SGListView.extend(SGWidget);


function SGImageView() {
    this.init = function(core) {
        this.handle = sgtest.createRect();
        this.live = true;
        var props = { tx:0, ty:0, x:0, y:0, w:100, h:100, r: 0, g: 1, b:0, scalex: 1, scaley:1, rotateX:0, rotateZ: 0, rotateY: 0};
        this.delegateProps(props,this.handle);
    }
    this.setSrc = function(src) {
        this.src = src;
        console.log("loading the image: " + src);
        if(this.src.toLowerCase().endsWith(".png")) {
            this.image = sgtest.loadPngToTexture(this.src);
        } else {
            this.image = sgtest.loadJpegToTexture(this.src);
            console.log("loaded an image");
        }
        if(this.image) {
        console.log('setting a texture prop');
            this.setProp(this.handle,"texid",this.image.texid);
            console.log("done with texture prop");
        }
    }
}
SGImageView.extend(SGWidget);

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
SGTextControl.extend(SGWidget);
function SGTextField() {
    SGTextControl.call(this);
    this.setWrapping(false);
}
SGTextField.extend(SGTextControl);

function SGTextArea() {
    SGTextControl.call(this);
    this.setWrapping(true);
}
SGTextArea.extend(SGTextControl);

function SGStage(core) {
	this.core = core;
	this.setSize = function(width,height) {
	    this.width = width;
	    this.height = height;
	    sgtest.setWindowSize(this.width,this.height);
	}
	this.getW = function() {
	    return this.width;
	}
	this.getH = function() {
	    return this.height;
	}
	this.on = function(name, node, cb) {
		this.core.on(name, node, cb);
	}
	this.getRoot = function() {
		return this.core.root;
	}
	this.setRoot = function(root) {
		this.core.setRoot(root);
		return this;
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
    
}


function JSFont(jsonfile, imagefile) {
    //create the default font
    var jsontext = fs.readFileSync(jsonfile);
    this.json = JSON.parse(jsontext);
    this.image = sgtest.loadPngToTexture(imagefile);
    this.nativefont = sgtest.createNativeFont(this.image.texid,this.json);
    this.basesize = this.json.size;
    this.scale = 0.5;
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

function SGAnim(node, prop, start, end, dur, count, autoreverse) {
    this.node = node;
    this.prop = prop;
    this.start = start;
    this.end = end;
    this.duration = dur;
    this.count = count;
    this.autoreverse = autoreverse;
    this.afterCallbacks = [];
    this.init = function(core) {
        this.handle = sgtest.createAnim(
            this.node.handle,
            propsHash[this.prop],
            this.start,this.end,this.duration,this.count,this.autoreverse);
    }
    this.setInterpolator = function(lerptype) {
        this.lerptype = lerptype;
        sgtest.updateAnimProperty(this.handle, propsHash["lerpprop"], lerptype);
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
    this.after = function(cb) {
        this.afterCallbacks.push(cb);
        return this;
    }
}

function Core() {

	this.createTestNode = function() {
		var node = new SGTestNode();
		node.init();
		return node;
	}
    this.createRect = function() {
        var node = new SGRect();
        node.init();
        return node;
    };
    this.createLabel = function() {
        var node = new SGLabel();
        node.font = this.font;
        node.init();
        return node;
    }
    this.createGroup = function() {
        var node = new SGGroup();
        node.init();
        return node;
    }
    
    this.createPushButton = function() {
        var node = new SGButton();
        node.font = this.defaultFont;
        node.init(this);
        return node;
    }
    this.createToggleButton = function() {
        var node = new SGToggleButton();
        node.font = this.defaultFont;
        node.init(this);
        return node;
    }
    this.createSlider = function() {
    	var node = new SGSlider();
    	node.init(this);
    	return node;
    }
    this.createSpinner = function() {
    	var node = new SGSpinner();
    	node.init(this);
    	return node;
    }
    this.createAnchorPanel = function() {
    	var node = new SGAnchorPanel();
		node.init(this);
		return node;
    }
    this.createListView = function() {
    	var node = new SGListView();
    	node.init(this);
    	return node;
    }
    this.createImageView = function() {
        var node = new SGImageView();
        node.init(this);
        return node;
    }
    
    this.createTextField = function() {
        var node = new SGTextField();
        node.font = this.defaultFont;
        node.init(this);
        return node;
    }
    this.createTextArea = function() {
        var node = new SGTextArea();
        node.font = this.defaultFont;
        node.init(this);
        return node;
    }
    
    this.anims = [];
    this.createPropAnim = function(node, prop, start, end, dur, count, autoreverse) {
        var anim = new SGAnim(node,prop,start,end,dur,count,autoreverse);
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
        sgtest.init();
        setupBacon(this);
        sgtest.setEventCallback(function(e) {
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
            sgtest.tick();
            setTimeout(tickLoop,1);
        }
        
        function immediateLoop() {
            sgtest.tick();
            setImmediate(immediateLoop);
        }
        setTimeout(immediateLoop,1);
        //setTimeout(tickLoop,1);
    }
    
    this.createStage = function(w,h) {
        sgtest.createWindow(w,h);
        this.defaultFont = new JSFont(__dirname+"/font.json",__dirname+"/font.png");
        this.stage = new SGStage(this);
        return this.stage;
    }
    
    this.setRoot = function(node) {
        sgtest.setRoot(node.handle);
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
    Core._core = new Core();
    Core._core.init();
    var stage = Core._core.createStage(600,600);
    cb(Core._core,stage);
    Core._core.start();
}

exports.startApp = startApp;
exports.Interpolators = {
    CubicIn:propsHash["lerpcubicin"],
    CubicInOut:propsHash["lerpcubicinout"],
}


var SceneParser = function() {
    
    this.parseChildren = function(core, val, obj) {
        for(var i=0; i<obj.children.length; i++) {
            var ch = obj.children[i];
            var chv = this.parse(core, ch);
            if(chv) val.add(chv);
        }
    }
    
    this.fillProps = function(out, obj) {
        for(var prop in obj) {
           	var setter = "set"+camelize(prop);
            if(prop == "type") continue;
            if(prop == "self") continue;
            if(prop == "children") continue;
            if(prop == "fill") {
            	if(out[setter]) {
	                out["set"+camelize(prop)](obj[prop]);
                } else {
                	console.log("WARNING. Setter not found: " + setter);
                }
                continue;
            }
            if(!out[setter]) {
            	console.log("warning. no setter: " + setter);
            } else {
            	out[setter](obj[prop]);
            }
        }
        //fill in missing props
        if(!obj.left) {
            out.left = obj.tx;
        }
        if(!obj.top) {
            out.top = obj.ty;
        }
        	//console.log(out.type + " " + out.id);
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
        "Group":SGGroup,
        "Document":SGGroup,
        "DynamicGroup":SGGroup,
        "AnchorPanel":SGGroup,
    };
    
    this.parse = function(core, obj) {
	   	var type = this.typeMap[obj.type];
        if(type) {
        	if(!core[type]) {
        		console.log("WARNING. Type not found: " + type);
        		return null;
        	}

            var out = core[this.typeMap[obj.type]]();
            //var out = new this.typeMap[obj.type]();
            out.type = obj.type;
            if(this.parentTypeMap[obj.type]) {
                this.fillProps(out,obj);
                this.parseChildren(core, out,obj);
            } else {
                this.fillProps(out,obj);
            }
            
            return out;
        }
        console.log("warning. no object for type " + obj.type);
    }
}

exports.SceneParser = SceneParser;


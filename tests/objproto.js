var amino = require('../build/desktop/amino.js');

function ParseRGBString(Fill) {
    if(typeof Fill == "string") {
        //strip off any leading #
        if(Fill.substring(0,1) == "#") {
            Fill = Fill.substring(1);
        }
        //pull out the comps
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
function camelize(s) {
	return s.substring(0,1).toUpperCase() + s.substring(1);
}

amino.startApp(function(core, stage) {
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


function Compose(proto) {
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
        return this;
    }
}


var ProtoRect = Compose({
    type: "Rect",
    props: {
        tx: { value: 0 },
        ty: { value: 0 },
        visible: { value: 1 },
        x: { value: 0 },
        y: { value: 0 },
        w: { value: 300 },
        h: { value: 100 },
        r: { value: 0},
        g: { value: 1},
        b: { value: 0},
        fill: {
            value: '#ff0000', 
        }
    },
    //replaces all setters
    set: function(name, value) {
        this.props[name] = value;
        //mirror the property to the native side
        if(this.live) {
            if(amino.propsHash[name]) {
                amino.sgtest.updateProperty(this.handle, amino.propsHash[name], value);
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
        this.handle = amino.sgtest.createRect();
        this.live = true;
        //invoke all setters once to push default values to the native side
        for(var propname in this.props) {
            this.set(propname, this.props[propname]);
        }
        this.type = "rect";
        var rect = this;
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

var ProtoGroup = Compose({
    type: "Group",
    props: {
        tx: { value: 0 },
        ty: { value: 0 },
        visible: { value: 1 },
    },
    //replaces all setters
    set: function(name, value) {
        this.props[name] = value;
        //mirror the property to the native side
        if(this.live) {
            amino.sgtest.updateProperty(this.handle, amino.propsHash[name], value);
            //console.log('updated the property ' + name);
        }
    },
    init: function() {
        this.handle = amino.sgtest.createGroup();
        this.children = [];
        this.live = true;
        this.add = function(node) {
            if(!node) abort("can't add a null child to a group");
            if(!this.live) abort("error. trying to add child to a group that isn't live yet");
            if(!node.handle) abort("the child doesn't have a handle");
            this.children.push(node);
            node.parent = this;
            amino.sgtest.addNodeToGroup(node.handle,this.handle);
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
        //invoke all setters once to push default values to the native side
        for(var propname in this.props) {
            this.set(propname, this.props[propname]);
        }
        this.type = "group";
    }
});


var ProtoText = Compose({
    props: {
        tx: { value: 0 },
        ty: { value: 0 },
        visible: { value: 1 },
        text: { value: 'silly text' },
        fontSize: { value: 20 },
    },
    //replaces all setters
    set: function(name, value) {
        this.props[name] = value;
        //mirror the property to the native side
        if(this.live) {
            amino.sgtest.updateProperty(this.handle, amino.propsHash[name], value);
            //console.log('updated the property ' + name);
        }
    },
    init: function() {
        this.live = true;
        this.handle = amino.sgtest.createText();
        //invoke all setters once to push default values to the native side
        for(var propname in this.props) {
            this.set(propname, this.props[propname]);
        }
        this.type = "text";
    }
});

var group = new ProtoGroup();
group.setTx(0);
stage.setRoot(group);
/*
var rect = new ProtoRect();
rect.setFill("#ff00ff");
console.log(' w = ' + rect.getW());
rect.setW(50);
console.log(' w = ' + rect.getW());
group.add(rect);

var label = new ProtoText();
label.setTx(0).setTy(50);
group.add(label);
*/

Widget = Compose({
    type: "widget",
    comps: {
        base: {
            proto: ProtoGroup,
            promote: ["tx","ty","visible"],
        },
    },
    props: {
        id: { value: "no id" },
        left: { value: 0 },
        right: { value: 0 },
        top: { value: 0 },
        bottom: { value: 0 },
        anchorLeft: { value: true },
        anchorRight: { value: false },
        anchorTop: { value: true },
        anchorBottom: { value: false },
        parent: { value: null },
    },
    init: function() {
        //console.log("init of the widget");
        //console.log(this.props);
        //console.log(this.comps);
        this.handle = this.comps.base.handle;
        this.font = core.defaultFont;
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

var ProtoButton = Compose({
    type: "Button",
    extend: Widget,
    comps: {
        background: {
            proto: ProtoRect,
            promote: ['w','h','fill'],
        },
        label: {
            proto: ProtoText,
            promote: ['text','fontSize'],
        },
    },
    props: {
        //override w to center the label
        w: {
            value: 100,
            set: function(w) {
                this.comps.background.setW(w);
                var textw = this.font.calcStringWidth(this.getText(),this.getFontSize());
                this.comps.label.setTx((w-textw)/2);
                return this;
            }
        },
        //override h to center the label
        h: {
            value:100, 
            set: function(h) {
                this.comps.background.setH(h);
                var texth = this.font.getHeight(this.getFontSize());
                this.comps.label.setTy((h-texth)/2);
                return this;
            }
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.label);
        this.type = 'button';
        
        var self = this;
        this.setFill("#77cc55");
        core.on('press', this, function(e) {
            self.setFill("#aaee88");
        });
        core.on("release",this,function(e) {
            self.setFill("#77cc55");
        });
        core.on("click",this,function(e) {
            core.fireEvent({type:'action',source:self});
        });
    }
});

var button = new ProtoButton();
button
      .setId("button1")
      .setTy(200)
      .setTx(100)
      .setW(100)
      .setH(50)
      .setText('button')
      ;
group.add(button);

core.on('action',button, function(e) {
    console.log("the button " + e.source.getId() + " fired an action");
});



var ProtoSlider = Compose({
    type: 'Slider',
    extend: Widget,
    comps: {
        background: {
            proto: ProtoRect,
            promote: ['w','h','fill'],
        },
        thumb: {
            proto: ProtoRect,
        },
    },
    props: {
        min: { value: 0 },
        max: { value: 100 },
        value: {
            value:"0", 
            set: function(value) {
                this.props.value = value;
                var thumbval = (value/100)*this.getW();
                this.comps.thumb.setTx(thumbval);
                return this;
            }
        }
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.thumb);
        this.comps.background.setFill("#77cc55");
        this.comps.thumb.setW(30);
        this.comps.thumb.setH(30);
        this.comps.thumb.setFill("#00ff00");
        
        this.pointToValue = function(x) {
            return x/this.getW()*100;
        }
        
        var self = this;
        core.on('drag', this, function(e) {
            self.setValue(self.pointToValue(e.point.x));
        });
    }
});


var slider = new ProtoSlider();
slider
    .setW(200).setH(30)
    .setTx(100).setTy(300)
    .setValue(33);

group.add(slider);


});

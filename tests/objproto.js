var amino = require('../build/desktop/amino.js');

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
function camelize(s) {
	return s.substring(0,1).toUpperCase() + s.substring(1);
}

amino.startApp(function(core, stage) {
function delgate(obj, name, comp) {
    obj.comps[name] = new comp.proto();
    comp.promote.forEach(function(propname) {
        obj["set"+camelize(propname)] = function(value) {
            //delegate to the nested component
            //console.log('delegating ' + propname + ' to ',obj.comps[name]);
            obj.comps[name]["set"+camelize(propname)](value);
            return obj;
        };
        obj["get"+camelize(propname)] = function() {
            //console.log('delegating ' + propname + ' to ',obj.comps[name]);
            return obj.comps[name]["get"+camelize(propname)]();
        };
    });
}

function Compose(proto) {
    return function() {
        this.props = {};
        this.comps = {};
        var obj = this;
        
        if(proto.components) {
            console.log("building sub components");
            for(var name in proto.components) {
                delgate(obj,name,proto.components[name]);
            };
        }
        if(proto.props) {
            proto.props.forEach(function(prop) {
                obj.props[prop.name] = prop.value;
                obj["set"+camelize(prop.name)] = function(value) {
                    this.props[prop.name] = value;
                    return this;
                };
                obj["get"+camelize(prop.name)] = function() {
                    return this.props[prop.name];
                };
                if(prop.set) {
                    obj["set"+camelize(prop.name)] = prop.set;
                }
            });
        }
        
        if(proto.set) {
            obj.set = proto.set;
            proto.props.forEach(function(prop) {
                obj["set"+camelize(prop.name)] = function(value) {
                    obj.set(prop.name,value);
                    return this;
                };
            });
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

var rect = core.createRect();
rect.setX(30);
rect.setY(100);
rect.setW(20);
rect.setH(20);
rect.setFill("#ff0000");

var ProtoRect = Compose({
    props: [
        { name:'tx', value:0 },
        { name:'ty', value:0 },
        { name:'x',  value:0 },
        { name:'y',  value:0 },
        { name:'w',  value:300 },
        { name:'h',  value:100 },
        { name:'r',  value:0 },
        { name:'g',  value:1 },
        { name:'b',  value:0 },
        { name: 'visible', value: 1 },
    ],
    //replaces all setters
    set: function(name, value) {
        this.props[name] = value;
        //mirror the property to the native side
        if(this.live) {
            amino.sgtest.updateProperty(this.handle, amino.propsHash[name], value);
            //console.log('updated the property ' + name);
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
    props: [
        { name: 'tx', value:0 },
        { name: 'ty', value:0 },
        { name: 'visible', value: 1 },
    ],
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
        console.log("initting a new group");
        this.handle = amino.sgtest.createGroup();
        this.children = [];
        this.live = true;
        this.add = function(node) {
            console.log('adding a child to a group');
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
    props: [
        { name: 'tx', value:0 },
        { name: 'ty', value:0 },
        { name: 'visible', value: 1 },
        { name: 'text', value: 'silly text' },
        { name: 'fontSize', value: 20 },
    ],    
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
console.log(' w = ' + rect.getW());
rect.setW(50);
console.log(' w = ' + rect.getW());
group.add(rect);

var label = new ProtoText();
label.setTx(0).setTy(50);
group.add(label);
*/


var ProtoButton = Compose({
    components: {
        base: {
            proto: ProtoGroup,
            promote: ["tx","ty","visible"],
        },
        background: {
            proto: ProtoRect,
            promote: ['w','h'],
        },
        label: {
            proto: ProtoText,
            promote: ['text','fontSize'],
        },
    },
    props: [
        { name:'id', value:'noid' },
        
        //override w to center the label
        { name:'w',  value:100, set: function(w) {
            this.comps.background.setW(w);
            var textw = this.font.calcStringWidth(this.getText(),this.getFontSize());
            this.comps.label.setTx((w-textw)/2);
            return this;
        }},
        //override h to center the label
        { name:'h',  value:100, set: function(h) {
            this.comps.background.setH(h);
            var texth = this.font.getHeight(this.getFontSize());
            this.comps.label.setTy((h-texth)/2);
            return this;
        }},
    ],
    init: function() {
        this.handle = this.comps.base.handle;
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.label);
        this.font = core.defaultFont;
        this.contains = this.comps.background.contains;
        this.type = 'button';
        
        this.setBaseColor = function(color) {
            color = ParseRGBString(color);
            this.comps.background.setR(color.r);
            this.comps.background.setG(color.g);
            this.comps.background.setB(color.b);
            return this;
        }
        
        var self = this;
        core.on('press', this, function(e) {
            self.setBaseColor("#aaee88");
        });
        core.on("release",this,function(e) {
            self.setBaseColor("#77cc55");
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


});

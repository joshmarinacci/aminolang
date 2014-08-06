var amino = require('amino.js');
var ou = require('./superprops-util');

function mirrorAmino(me,mirrorprops) {
    function camelize(s) {
    	return s.substring(0,1).toUpperCase() + s.substring(1);
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

    function mirrorProp(obj,old,native) {
        obj[old].watch(function(newval,oldval){
            if(native == 'fill') {
                var color = ParseRGBString(newval);
                //console.log('converting',color);
                amino.native.updateProperty(obj.handle,'r',color.r);
                amino.native.updateProperty(obj.handle,'g',color.g);
                amino.native.updateProperty(obj.handle,'b',color.b);
                return;
            }
            if(native == 'visible') {
                //console.log("doing visible prop");
                amino.native.updateProperty(obj.handle,native, newval?1:0);
                return;
            }

            //console.log("update property",obj.handle,native,newval);
            amino.native.updateProperty(obj.handle, native,newval);
        });
        obj['get'+camelize(native)] = function() {
            return obj[old]();
        }
    }

    for(var name in mirrorprops) {
        mirrorProp(me,name,mirrorprops[name]);
    }
}


function Rect() {
    ou.makeProps(this,{
        id: 'unknown id',
        visible:true,
        x:0,
        y:0,
        sx:1,
        sy:1,

        w:50,
        h:50,
        opacity: 1.0,
        fill:'#ffffff',
    });
    this.handle = amino.native.createRect();
    mirrorAmino(this,{
        x:'tx',
        y:'ty',
        w:'w',
        h:'h',
        visible:'visible',
        sx:'scalex',
        sy:'scaley',
        fill:'fill',
        id:'id',
    });
    this.contains = function(x,y) {
        if(x >= 0 && x <= this.w()) {
            if(y >= 0 && y <= this.h()) {
                return true;
            }
        }
        return false;
    }
}

function Text() {
    ou.makeProps(this,{
        id: 'unknown id',
        visible:true,
        x:0,
        y:0,
        sx:1,
        sy:1,
        text:'silly text',
        fontSize: 20,
        fontName: 'source',
        fontWeight: 400,
        fontStyle:'normal',
        opacity: 1.0,
        fill:'#ffffff',
    });
    this.handle = amino.native.createText();
    mirrorAmino(this,{
        x:'tx',
        y:'ty',
        visible:'visible',
        sx:'scalex',
        sy:'scaley',
        fill:'fill',
        text:'text',
        id:'id',
    });
    this.font = amino.getCore().defaultFont;
    this.updateFont = function() {
        var id = this.font.getNative(20, 400, 'normal');
        amino.native.updateProperty(this.handle, 'fontId', id);
    }
    this.calcWidth = function() {
        return this.font.calcStringWidth(this.text(), 20, 400, 'normal');
    }
    this.calcHeight = function() {
        return this.font.getHeight(20, 400, 'normal');
    }
    this.updateFont();
}

function Group() {
    ou.makeProps(this, {
        id: 'unknown id',
        visible:true,

        x:0,
        y:0,
        sx:1,
        sy:1,
        rx:0,
        ry:0,
        rz:0,

    });

    this.handle = amino.native.createGroup();
    mirrorAmino(this, {
        x:'tx',
        y:'ty',
        sx:'scalex',
        sy:'scaley',
        rx:'rotateX',
        ry:'rotateY',
        rz:'rotateZ',
        visible:'visible',
        id:'id',
    });

    this.children = [];
    this.add = function(node) {
        if(node == undefined) throw new Error("can't add a null child to a group");
        if(node.handle == undefined) throw new Error("the child doesn't have a handle");
        this.children.push(node);
        node.parent = this;
        amino.native.addNodeToGroup(node.handle,this.handle);
        return this;
    }
    this.isParent = function() { return true; }

    this.getVisible = this.visible;
}


function Button() {
    Group.call(this);
    ou.makeProps(this, {
        w:100,
        h:50,
        text:'a button',
    });
    this.background = new Rect();
    this.add(this.background);
    this.background.fill("#0044cc");
    this.background.w.match(this.w);
    this.background.h.match(this.h);

    this.label = new Text().fill("#ffffff").y(20);
    this.add(this.label);
    this.label.text.match(this.text);
    this.text('a button');
    var self = this;
    this.w.watch(function() {
        var textw = self.label.calcWidth()*2;
        var texth = self.label.calcHeight()*2;
        self.label.x((self.w()-textw)/2);
        self.label.y((self.h()-texth)/2 + texth);
    });

    this.contains = function(x,y) {
        if(x >= 0 && x <= this.w()) {
            if(y >= 0 && y <= this.h()) {
                return true;
            }
        }
        return false;
    }
    var self = this;
    amino.getCore().on('press', this.background, function(e) {
        self.background.fill('#44ccff');
    });
    amino.getCore().on('release', this.background, function(e) {
        self.background.fill('#0044cc');
    });
}


exports.Group = Group;
exports.Rect = Rect;
exports.Text = Text;
exports.Button = Button;

var amino = require('./amino.js');

function camelize(s) {
	return s.substring(0,1).toUpperCase() + s.substring(1);
}

/** A simple push button */
exports.PushButton = amino.ComposeObject({
    type: "PushButton",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        },
        label: {
            proto: amino.ProtoText,
            promote: ['text','fontSize'],
        },
    },
    props: {
        //override w to center the label
        w: {
            value: 100,
            set: function(w) {
                this.props.w = w;
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
                this.props.h = h;
                console.log("button height set to: " + h);
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
        
        var self = this;
        this.setFill(amino.colortheme.accent);
        amino.getCore().on('press', this, function(e) {
            self.setFill("#aaee88");
        });
        amino.getCore().on("release",this,function(e) {
            self.setFill(amino.colortheme.accent);
        });
        amino.getCore().on("click",this,function(e) {
            amino.getCore().fireEvent({type:'action',source:self});
        });
    }
});

/** A slider to choose a value between the max and min */
exports.Slider = amino.ComposeObject({
    type: 'Slider',
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        },
        thumb: {
            proto: amino.ProtoRect,
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
        this.comps.thumb.setW(30);
        this.comps.thumb.setH(30);
        
        this.pointToValue = function(x) {
            return x/this.getW()*100;
        }
        
        var self = this;
        this.comps.background.setFill(amino.colortheme.neutral);
        this.comps.thumb.setFill(amino.colortheme.accent);
        amino.getCore().on('drag', this, function(e) {
            self.setValue(self.pointToValue(e.point.x));
        });
    }
});

/** A spinner to indicate progress of some activity */
exports.ProgressSpinner = amino.ComposeObject({
    type: 'ProgressSpinner',
    extend: amino.ProtoWidget,
    comps: {
        part1: {
            proto: amino.ProtoRect,
        },
        part2: {
            proto: amino.ProtoRect,
        }
    },
    props: {
        size: {
            value: 50,
            set: function(w) {
                console.log("value set");
                this.comps.part1.setW(w).setH(w);
                this.comps.part2.setW(w).setH(w);
                this.comps.part1.setX(-w/2).setY(-w/2).setTx(w/2).setTy(w/2);
                this.comps.part2.setX(-w/2).setY(-w/2).setTx(w/2).setTy(w/2);
                return this;
            }
        },
        active: {
            value:false,
            set: function(active) {
                this.props.active = active;
                console.log("active = " + this.props.active);
                if(this.props.active) {
                    //start animations;
                    this.setVisible(1);
                    this.a1 = amino.getCore().createPropAnim(this.comps.part1, "rotateZ", 0,  360, 1500, -1, false);
                    this.a2 = amino.getCore().createPropAnim(this.comps.part2, "rotateZ", 0, -360, 1500, -1, false);
                } else {
                    //stop animations
                    this.setVisible(0);
                    //this.a1.stop();
                }
                return this;
            }
        },
    },
    init: function() {
        this.comps.base.add(this.comps.part1);
        this.comps.base.add(this.comps.part2);
        this.comps.part1.setFill(amino.colortheme.text);
        this.comps.part2.setFill(amino.colortheme.text);
        this.contains = function() { return false; }
        this.setVisible(0);
    }
});

/** A basic label. can set a width and do left,center,right alignment. */
exports.Label = amino.ComposeObject({
    type:"Label",
    extend: amino.ProtoWidget,
    comps: {
        text: {
            proto: amino.ProtoText,
            promote: ['text','fontSize'],
        }
    },
    props: {
        w: {
            value: 50,
            set: function(w) {
                var textw = this.font.calcStringWidth(this.getText(),this.getFontSize());
                this.comps.text.setTx((w-textw)/2);
                return this;
            }
        },
        h: {
            value: 30,
            set: function(h) {
                console.log("WARNING: not really setting the height on the label");
                return this;
            }
        }
    },
    init: function() {
        this.comps.base.add(this.comps.text);
        this.contains = function() { return false; }
    }
});

/** AnchorPanel is a container which lays out it's children using anchor
constraints like top and left */

exports.AnchorPanel = amino.ComposeObject({
    type:"AnchorPanel",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        }
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.contains = function() { return false; }
        this.children = [];
        this.isParent = function() { return true; }
        this.add = function(node) {
            if(!node) abort("can't add a null child to an anchor panel");
            if(!this.live) abort("error. trying to add child to a group that isn't live yet");
            this.children.push(node);
            node.parent = this;
            this.comps.base.add(node);
            //sgtest.addNodeToGroup(node.handle,this.handle);
            this.redoLayout();
        }
        this.live = true;
        
        this.setFill(amino.colortheme.base);
        this.redoLayout = function() {
            for(var i in this.children) {
                var node = this.children[i];
                if(node.getAnchorTop == undefined) {
                    console.log("WARNING Node without getAnchorTop. Is it not a widget?");
                    continue;
                }
                //top aligned
                if(node.getAnchorTop() && !node.getAnchorBottom()) {
                    node.setTy(node.getTop());
                }
                
                //bottom aligned
                if(!node.getAnchorTop() && node.getAnchorBottom()) {
                    node.setTy(this.getH() - node.getBottom() - node.getH());
                }
                
                //vertical stretch
                if(node.getAnchorTop()  && node.getAnchorBottom()) {
                    node.setTy(node.getTop());
                    node.setH(this.getH() - node.getTop() - node.getBottom());
                }
                
                //left aligned
                if(node.getAnchorLeft() && !node.getAnchorRight()) {
                    node.setTx(node.getLeft());
                }
                
                //right aligned
                if(!node.getAnchorLeft() && node.getAnchorRight()) {
                    node.setTx(this.getW() - node.getRight() - node.getW());
                }
                
                //horizontal stretch
                if(node.getAnchorRight() && node.getAnchorLeft()) {
                    node.setTx(node.getLeft());
                    node.setW(this.getW()- node.getLeft() - node.getRight());
                }
                
            }
        }
        
        
    }
});


exports.VerticalPanel = amino.ComposeObject({
    type:"VerticalPanel",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        }
    },
    props: {
        gap: { value: 10 },
        padding: { value: 10 },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.contains = function() { return false; }
        this.children = [];
        this.isParent = function() { return true; }
        this.add = function(node) {
            if(!node) abort("can't add a null child to an anchor panel");
            if(!this.live) abort("error. trying to add child to a group that isn't live yet");
            this.children.push(node);
            node.parent = this;
            this.comps.base.add(node);
            this.redoLayout();
        }
        this.live = true;
        this.setFill(amino.colortheme.base);
        this.redoLayout = function() {
            var y = this.getPadding();
            for(var i in this.children) {
                var node = this.children[i];
                node.setTx(this.getPadding());
                node.setTy(y);
                y += node.getH() + this.getGap();
                node.setW(this.getW()-this.getPadding()*2);
            }
        }
        
        
    }
});


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
                    console.log("WARNING. Setter not found: " + setter + " for type " + obj.type);
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
        "Group":amino.ProtoGroup,
        "Rect": amino.ProtoRect,
        "PushButton": exports.PushButton,
        "ToggleButton":"createToggleButton",
        "Label":exports.Label,
        "Slider":exports.Slider,
        "ListView":exports.AnchorPanel,//"createListView",
        "Document":amino.ProtoGroup,
        "DynamicGroup":amino.ProtoGroup,
        "AnchorPanel":exports.AnchorPanel,
        "ImageView":exports.ImageView,
        "TextField":exports.Label, //"createTextField",
        "TextArea":exports.Label, //"createTextArea",
    };
    this.parentTypeMap = {
        "Group":amino.ProtoGroup,
        "Document":amino.ProtoGroup,
        "DynamicGroup":amino.ProtoGroup,
        "AnchorPanel":exports.AnchorPanel,
    };
    
    this.parse = function(core, obj) {
	   	var type = this.typeMap[obj.type];
        if(type) {
            console.log("doing type ", obj.type);
            var out = type();
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

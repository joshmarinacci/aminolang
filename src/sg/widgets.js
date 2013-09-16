/** 
@class dummy
@desc a dummy header to work around a doc generation bug. ignore
*/

if(typeof exports == 'undefined' || exports.inbrowser==true) {
    var widgets = this['widgets'] = {};
    var amino = this['mymodule'];
} else {
    var amino = require('./amino.js');
    var widgets = exports;
}


function camelize(s) {
	return s.substring(0,1).toUpperCase() + s.substring(1);
}

/**
@class PushButton
@desc a simple push button. The colors are set by the global amino theme. You can listen for action events on the button
with code like this:
@codestart
core.on('action',myButton,function(event) {
    console.log("the button " + event.source + " fired an action");
});
@codeend
or using the onAction function
@codestart
myButton.onAction(function(event) {
    console.log("the button " + event.source + " fired an action");
});
@codeend
*/
widgets.PushButton = amino.ComposeObject({
    type: "PushButton",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            /** @prop w the width of this push button */
            /** @prop h the width of this push button */
            /** @prop fill the fill color this push button. Should be a hex string. */
            promote: ['w','h','fill'],
        },
        label: {
            proto: amino.ProtoText,
            /** @prop text the text label of this button. */
            /** @prop fontSize the font size to use for this button. */
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
            var event = {type:'action',source:self};
            amino.getCore().fireEvent(event);
            if(self.actioncb) self.actioncb(event);
        });
        /** @func onAction(cb) a function to call when this button fires an action. You can also listen for the 'action' event. */
        this.onAction = function(cb) {
            this.actioncb = cb;
            return this;
        }
    }
});

/**
@class Slider
@desc A slider to choose a value. The value is restricted to be between the max and min values.
The color of this slider is determined by the global amino theme.
*/
widgets.Slider = amino.ComposeObject({
    type: 'Slider',
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            /** @prop w the width of this slider */
            /** @prop h the width of this slider */
            /** @prop fill the fill color this slider. Should be a hex string. */
            promote: ['w','h','fill'],
        },
        thumb: {
            proto: amino.ProtoRect,
        },
    },
    props: {
        /** @prop min the minimum value of this slider */
        min: { value: 0 },
        /** @prop max the maximum value of this slider */
        max: { value: 100 },
        /** @prop value the current value of this slider */
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
        this.setW(100).setH(20);
        this.comps.thumb.setW(20);
        this.comps.thumb.setH(20);
        
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

/** 
@class Spinner
@desc A spinner to indicate progress of some activity 
*/
widgets.ProgressSpinner = amino.ComposeObject({
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
        /** @prop size  the size of this slider, in pixels. */
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
        /** @prop active a boolean property to turn the spinner on or off. 
          The spinner will only be visible while it is active. */
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
        this.setSize(30);
        this.setVisible(0);
    }
});

/** 
@class Label
@desc A basic label. Can set a width and do left,center,right alignment. 
*/
widgets.Label = amino.ComposeObject({
    type:"Label",
    extend: amino.ProtoWidget,
    comps: {
        text: {
            proto: amino.ProtoText,
            /** @prop text  the text of this label */
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

/**
@class AnchorPanel
@desc A container which lays out it's children using anchor
constraints like right and bottom. */
widgets.AnchorPanel = amino.ComposeObject({
    type:"AnchorPanel",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        }
    },
    props: {
        w: {
            value: 300,
            set: function(w) {
                this.props['w'] = w;
                this.comps.background.setW(w);
                this.redoLayout();
                return this;
            }
        },
        h: {
            value: 300,
            set: function(h) {
                this.props['h'] = h;
                this.comps.background.setH(h);
                this.redoLayout();
                return this;
            }
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.contains = function() { return false; }
        this.children = [];
        this.isParent = function() { return true; }
        /** @func  add(node) adds a new child to this panel */
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


/**
@class VerticalPanel
@desc A panel which lays out it's children in a vertical box. All children will be given the width
of the panel, minus pading.
*/
widgets.VerticalPanel = amino.ComposeObject({
    type:"VerticalPanel",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        }
    },
    props: {
        /** @prop gap the gap between widgets in the panel */
        gap: { value: 10 },
        /** @prop padding the padding between widgets and the edges of the panel */
        padding: { value: 10 },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.contains = function() { return false; }
        this.children = [];
        this.isParent = function() { return true; }
        /** @func add(node) adds a widget to this panel */
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

/**
@class ListViewCell
@desc A panel which lays out it's children in a vertical box. All children will be given the width
of the panel, minus pading.
*/
widgets.ListViewCell = amino.ComposeObject({
    type: "ListViewCell",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        },
        label: {
            proto: amino.ProtoText,
            /** @prop text text of the cell */
            /** @prop fontSize font size of the label */
            promote: ['text','fontSize'],
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.label);
        this.comps.label.setTx(5);
        this.comps.label.setTy(8);
        this.setText("foo");
    },
});


/**
@class ListView
@desc Shows a list of items. Scrolls if there are too many items to fit on the screen. It can be customized
by setting a new TextCellRenderer or a new CellGenerator.
*/
widgets.ListView = amino.ComposeObject({
    type:"ListView",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        }
    },
    props: {
        /** @prop cellHeight the height of cells. All cells have the same height. */
        cellHeight: { value: 32 },
        /** @prop cellWidth the width of cells. Not currently used. */
        cellWidth: { value: 32 },
        /** @prop layout the layout orientaiton of this list view. Currently only 'vertical' is supported. */
        layout: { value: "vertical" },
        /** @prop selectedIndex not supported yet */
        selectedIndex: { value:-1 },
        /** @prop w the width of the list view. */
        w: {
            value: 300,
            set: function(w) {
                this.props['w'] = w;
                this.comps.background.setW(w);
                this.regenerateCells();
                return this;
            }
        },
        /** @prop h the width of the list view. */
        h: {
            value: 300,
            set: function(h) {
                this.props['h'] = h;
                this.comps.background.setH(h);
                this.regenerateCells();
                return this;
            }
        },
    },
    init: function() {
        console.log("making a list view");
        this.comps.base.add(this.comps.background);
        this.setFill("#ffccff");

        this.listModel = [];
        for(var i=0; i<30; i++) {
            this.listModel.push(i+" foo");
        }
        this.scroll = 0;
        
        
        var self = this;
        amino.getCore().on("drag",this,function(e) {
            self.scroll -= e.dy;
            if(self.scroll < 0) self.scroll = 0;
            var max = self.listModel.length*self.getCellHeight() - self.getH();
            if(self.scroll > max) { self.scroll = max; }
            self.regenerateCells();
        });
        
        this.cells = [];
        this.cg = function() {
            var cell = new widgets.ListViewCell();
            cell.comps.label.setFontSize(15);
            return cell;
        }
        this.generateCell = function() {
            return this.cg();
        };
        /** @func setCellGenerator(func) set a function which will return new ListCells when called. */
        this.setCellGenerator = function(cg) {
            this.cg = cg;
            //nuke all of the old cells
            this.cells = [];
        }
        
        this.textCellRenderer = null;
        /** @func setTextCellRenderer(func) set a function which will customize a list cell with an item.
        The function will be called with the cell, index of the item, and the item.
        */
        this.setTextCellRenderer = function(textCellRenderer) {
            this.textCellRenderer = textCellRenderer;
            ///this.regenerateCells();
            return this;
        }
        this.fillCellValues = function(cell,i, item) {
            if(this.textCellRenderer) {
                this.textCellRenderer(cell,i,item);
                return;
            }
            cell.setText(item);
            if(i%2 == 0) {
                cell.setFill(amino.colortheme.listview.cell.fillEven);
            } else {
                cell.setFill(amino.colortheme.listview.cell.fillOdd);
            }
        }
        
        this.regenerateCells = function() {
            var ch = this.getCellHeight();
            var start= Math.min(this.listModel.length, Math.floor(this.scroll/ch));
            var end = Math.min(this.listModel.length, Math.floor((this.getH()+this.scroll)/ch));
            var remainder = this.scroll - Math.floor(this.scroll/ch)*ch;
            var self = this;
            this.cells.forEach(function(cell) {
                cell.setVisible(false);
            });
    
            var i = start;
            for(var n=0; n<end-start; n++) {
                if(!this.cells[n]) {
                    this.cells[n] = this.generateCell();
                    this.comps.base.add(this.cells[n]);
                }
                var cell = this.cells[n];
                cell.setVisible(true);
                cell.setTy(n*ch - remainder);
                cell.setW(this.getW());
                cell.setH(this.getCellHeight());
                this.fillCellValues(cell,i,this.listModel[i]);
                i++;
            }
        }
        
        this.regenerateCells();
    },
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

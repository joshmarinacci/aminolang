var amino = require('./amino.js');

/** A simple push button */
exports.Button = amino.ComposeObject({
    type: "Button",
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
        this.type = 'button';
        
        var self = this;
        this.setFill("#77cc55");
        amino.getCore().on('press', this, function(e) {
            self.setFill("#aaee88");
        });
        amino.getCore().on("release",this,function(e) {
            self.setFill("#77cc55");
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
        this.comps.background.setFill("#77cc55");
        this.comps.thumb.setW(30);
        this.comps.thumb.setH(30);
        this.comps.thumb.setFill("#00ff00");
        
        this.pointToValue = function(x) {
            return x/this.getW()*100;
        }
        
        var self = this;
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
                this.comps.part1.setW(w).setH(w);
                this.comps.part2.setW(w).setH(w);
                return this;
            }
        },
        active: {
            value:false,
            set: function(active) {
                this.props.active = active;
                if(this.props.active) {
                    //start animations;
                    this.setVisible(1);
                    this.a1 = amino.getCore().createPropAnim(this.comps.part1, "tx", 0, 100, 1000, -1, false);
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
            promote: ['w','h'],
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
        
        this.redoLayout = function() {
            for(var i in this.children) {
                var node = this.children[i];
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


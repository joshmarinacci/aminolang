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



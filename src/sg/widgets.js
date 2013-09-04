var amino = require('./amino.js');

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


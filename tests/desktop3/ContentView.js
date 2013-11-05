var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');

exports.ContentView = amino.ComposeObject({
    type:"ContentView",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['fill','w','h'],
        },
        contents: {
            proto: amino.ProtoGroup,
        },
        toolbar: {
            proto: widgets.HorizontalPanel,
        },
    },
    props: {
        w: {
            value: 300,
            set: function(w) {
                this.props.w = w;
                this.comps.background.setW(w);
                this.comps.toolbar.setW(w);
                this.comps.contents.children.forEach(function(ch) {
                    if(ch.setW) ch.setW(w);
                    if(ch.setTx) ch.setTx(0);
                });
                return this;
            }
        },
        h: {
            value: 300,
            set: function(h) {
                this.props.h = h;
                this.comps.background.setH(h);
                this.comps.toolbar.setH(30);
                this.comps.contents.children.forEach(function(ch) {
                    if(ch.setH) ch.setH(h-30);
                    if(ch.setTy) ch.setTy(0);
                });
                return this;
            }
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.contents);
        this.comps.base.add(this.comps.toolbar);
        this.comps.toolbar.setH(30).setGap(5).setPadding(3).setFill("#dddddd");
        this.comps.contents.setTy(30);
        this.children = [
            this.comps.contents, this.comps.toolbar,
        ];
    },
    
});


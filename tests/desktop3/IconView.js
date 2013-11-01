var amino = require('../../build/desktop/amino.js');
var Global = require('./Global.js');
var widgets = require('../../build/desktop/widgets.js');
exports.IconView = amino.ComposeObject({
    type:"IconView",
    extend:amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['fill','w','h'],
        },
        title: {
            proto: widgets.Label,
            promote: ['text'],
        },
    },
    props: {
        item: {
            value: null,
            set: function(item) {
                this.props.item = item;
                return this;
            }
        }
    },
    
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.title);
        this.comps.title.setTx(5).setTy(5);
        var self = this;
        amino.getCore().on('click',this,function(e) {
            Global.openView(self.getItem());
        });
        
    }
});


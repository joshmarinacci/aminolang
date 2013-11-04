var amino   = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');


exports.ChatCell = amino.ComposeObject({
    type:"ChatCell",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: widgets.AnchorPanel,
            promote: ['w','h','fill'],
        },
        author: {
            proto: widgets.Label,
        },
        text: {
            proto: widgets.Label,
        },
    },
    props: {
        w: {
            value: 100,
            set: function(w) {
                this.props.w = w;
                this.comps.background.setW(w);
            },
        }
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.author
            .setText('foo')
            .setFontSize(15)
            .setLeft(0)
            .setAnchorLeft(true)
            .setRight(0)
            ;
        this.comps.text
            .setFontSize(15)
            .setText('bar')
            .setAnchorLeft(true)
            .setLeft(60)
            .setRight(60)            
            ;
        this.comps.background.add(this.comps.author);
        this.comps.background.add(this.comps.text);
        this.setW(400);
    },
});

exports.buildApp = function(core, stage, db) {
    var panel = new widgets.AnchorPanel();
    panel.isApp = function() { return true; }
    
    
    var lv = new widgets.ListView()
        .setAnchorLeft(true).setAnchorRight(true).setAnchorTop(true).setAnchorBottom(true)
        .setBottom(35);
    panel.add(lv);
    lv.setModel([
        {
            author: "Bob",
            text: "Hi Don"
        },
        {
            author: "Don",
            text: "Hi Bob"
        },
        {
            author: "Bob",
            text: "I'm hungry"
        },
    ]);
    lv.setCellGenerator(function() { return new exports.ChatCell(); });
    lv.setTextCellRenderer(function(cell,index,item) {
        if(item == null) return;
        cell.comps.author.setText(item.author);
        cell.comps.text.setText(item.text);
        if(item.author == "Don") {
            cell.comps.author.setAnchorLeft(false).setAnchorRight(true);
            cell.comps.text.setAnchorLeft(false).setAnchorRight(true);
            cell.comps.author.setAlign("right");
            cell.comps.text.setAlign("right");
        } else {
            cell.comps.author.setAnchorLeft(true).setAnchorRight(false);
            cell.comps.text.setAnchorLeft(true).setAnchorRight(false);
            cell.comps.author.setAlign("left");
            cell.comps.text.setAlign("left");
        }
    });

    var tf = new widgets.TextField().setText('Lunch?')
        .setH(30)
        .setAnchorLeft(true).setAnchorRight(true).setAnchorBottom(true)
        ;
    panel.add(tf);
    
    
    return panel;
}

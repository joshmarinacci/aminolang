var amino = null;
var widgets = null;
if(process.platform == 'darwin') {
    amino = require('../../build/desktop/amino.js');
    widgets = require('../../build/desktop/widgets.js');
} else {
    amino = require('./amino.js');    
    widgets = require('./widgets.js');
}

var EmailListViewCell = amino.ComposeObject({
    type: "EmailListViewCell",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        },
        line: {
            proto: amino.ProtoRect,
        },
        from: {
            proto: amino.ProtoText,
        },
        subject: {
            proto: amino.ProtoText,
        },
        desc: {
            proto: amino.ProtoText,
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.line);
        
        this.comps.from.setText("from")
            .setFill("#3498db")
            .setFontWeight(600)
            .setTx(8).setTy(22)
            .setFontSize(15);
        this.comps.base.add(this.comps.from);

        this.comps.subject.setText("subject")
            .setTx(8).setTy(42)
            .setFontSize(15);
        this.comps.base.add(this.comps.subject);
        
        this.comps.desc.setText("desc")
            .setTx(8).setTy(64)
            .setFontWeight(200)
            .setFontSize(15);
        this.comps.base.add(this.comps.desc);
    },
});


function EmailApp(stage,nav,data) {
    var panel = new widgets.AnchorPanel()
        .setFill(amino.bg_accent_color).setId("emailapp");
    panel.add(new widgets.Label()
            .setText("Inbox")
            .setH(30)
            .setFill("#ffffff")
            .setAlign("center")
            .setFontSize(20)
            .setFontWeight(600)
            .setTx(0)
            .setTy(0)
            .setAnchorLeft(true).setLeft(10)
            .setAnchorRight(true).setRight(10)
            .setAnchorTop(true).setTop(0)
            );
    
    var lv = new widgets.ListView();
    lv.setCellGenerator(function() {
        var cell = new EmailListViewCell();
        return cell;
    });
    lv.setTextCellRenderer(function(cell,i,item) {
        if(item == null) return;
        cell.comps.from.setText(item.from);
        cell.comps.subject.setText(item.subject.substring(0,30));
        cell.comps.desc.setText(item.body.substring(0,50));
        cell.comps.background.setFill("#fffffa");
        cell.comps.line.setFill("#f1ebeb");
        cell.comps.line.setH(1);
    });
    lv.setCellHeight(80);
    lv.setW(320).setH(200)
        .setFill("#ffffff")
        .setTop(30).setAnchorTop(true)
        .setBottom(60).setAnchorBottom(true)
        .setLeft(0).setAnchorLeft(true)
        .setRight(0).setAnchorRight(true)
    ;
    lv.setModel(data.emails);
    
    stage.on('select',lv,function(e) {
        console.log(lv.listModel[lv.getSelectedIndex()]);
//        nav.push("composeEmail");
    });
    //console.log(data.emails);
    
    
    panel.add(lv);
    
    var buttons = ['\uF013','\uF011','\uF130','\uF006'];
    var i = 0;
    buttons.forEach(function(btn) {
        panel.add(new widgets.PushButton()
            .setColor("#ffffff")
            .setFontName('awesome')
            .setFontSize(40)
            .setText(btn)
            .setBottom(5).setAnchorBottom(true)
            .setLeft(20+i*75).setAnchorLeft(true)
            .setFill("#69b88a")
            .setW(50).setH(50)
            );
        i++;
    });
   
    /*
    panel.add(new widgets.PushButton()
            .setColor("#ffffff")
            .setFontName('awesome')
            .setFontSize(40)
            .setText("\uF013")
            .setBottom(5).setAnchorBottom(true)
            .setLeft(10).setAnchorLeft(true)
            .setFill("#69b88a")
            .setW(40).setH(40)
//            .onAction(function() { nav.push("composeEmail"); })
            );
    panel.add(new widgets.PushButton()
            .setFontName('awesome')
            .setFontSize(40)
            .setText("\uF011")
            .setW(30).setH(30)
            .setBottom(5).setAnchorBottom(true)
            .setLeft(90).setAnchorLeft(true)
//            .onAction(function() { nav.push("replyEmail"); })
            );
    panel.add(new widgets.PushButton()
            .setFontName('awesome')
            .setFontSize(40)
            .setText("\uF130")
            .setBottom(5).setAnchorBottom(true)
            .setLeft(150).setAnchorLeft(true)
            .setW(30).setH(30)
            );
    panel.add(new widgets.PushButton()
            .setFontName('awesome')
            .setFontSize(40)
            .setText("\uF006")
            .setBottom(5).setAnchorBottom(true)
            .setLeft(200).setAnchorLeft(true)
            .setW(30).setH(30)
            );

*/


    nav.register(panel);
    
    var replyPanel = new widgets.AnchorPanel()
        .setFill("#ffff00").setVisible(false);
    replyPanel.add(new widgets.PushButton().setText("cancel")
        .setW(80).setH(30)
        .setAnchorBottom(true).setBottom(5)
        .setAnchorLeft(true).setLeft(5)
        .onAction(function() {  nav.pop(); })
        );
    replyPanel.add(new widgets.PushButton().setText("send")
        .setW(80).setH(30)
        .setAnchorBottom(true).setBottom(5)
        .setAnchorRight(true).setRight(5)
        .onAction(function() {  nav.pop(); })
        );
    
    nav.register(replyPanel);
    nav.createTransition("replyEmail", panel, replyPanel, "easeIn");
    
    
    var composePanel = new widgets.AnchorPanel()
        .setFill("#ffff00").setVisible(false);
    composePanel.add(new widgets.PushButton().setText("cancel")
        .setW(80).setH(30)
        .setAnchorBottom(true).setBottom(5)
        .setAnchorLeft(true).setLeft(5)
        .onAction(function() {  nav.pop(); })
        );
    composePanel.add(new widgets.PushButton().setText("send")
        .setW(80).setH(30)
        .setAnchorBottom(true).setBottom(5)
        .setAnchorRight(true).setRight(5)
        .onAction(function() {  nav.pop(); })
        );
    nav.register(composePanel);
    nav.createTransition("composeEmail", panel, composePanel, "easeIn");
        
    
    var g = new amino.ProtoGroup();
    g.add(panel);
    g.add(replyPanel);
    g.add(composePanel);
    return g;       
}

exports.EmailApp = EmailApp;

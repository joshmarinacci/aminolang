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
        from: {
            proto: amino.ProtoText,
        },
        subject: {
            proto: amino.ProtoText,
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.from);
        this.comps.base.add(this.comps.subject);
        
        this.comps.from.setText("from");
        this.comps.from.setTx(5);
        this.comps.from.setTy(5);
        this.comps.from.setFontSize(16);

        this.comps.subject.setText("subject");
        this.comps.subject.setTx(5);
        this.comps.subject.setTy(25);
        this.comps.subject.setFontSize(12);
    },
});


function EmailApp(stage,nav,data) {
    var panel = new widgets.AnchorPanel();
    
    var lv = new widgets.ListView();
    lv.setCellGenerator(function() {
        var cell = new EmailListViewCell();
        return cell;
    });
    lv.setTextCellRenderer(function(cell,i,item) {
        cell.comps.from.setText(item.from);
        cell.comps.subject.setText(item.subject);
    });
    lv.setCellHeight(40);
    lv.setW(320).setH(200)
    .setTop(20+40).setAnchorTop(true)
    .setBottom(40).setAnchorBottom(true)
    .setLeft(0).setAnchorLeft(true)
    .setRight(0).setAnchorRight(true)
    ;
    lv.listModel = data.emails;
    
    stage.on('select',lv,function(e) {
        console.log("selected an email");
        console.log(lv.listModel[lv.getSelectedIndex()]);
        nav.push("composeEmail");
    });
    //console.log(data.emails);
    
    
    panel.add(lv);
    
    panel.add(new widgets.PushButton()
            .setText("reply")
            .setBottom(10).setAnchorBottom(true)
            .setW(90).setH(40).setTx(94).setTy(390)
            .onAction(function() { nav.push("replyEmail"); })
            );
    panel.add(new widgets.PushButton()
            .setText("delete")
            .setBottom(10).setAnchorBottom(true)
            .setW(90).setH(40).setTx(190).setTy(390));
    panel.add(new widgets.PushButton()
            .setText("compose")
            .setBottom(10).setAnchorBottom(true)
            .setW(90).setH(40).setTx(0).setTy(390)
            .onAction(function() { nav.push("composeEmail"); })
            );
    //list view
    panel.add(new widgets.Label()
            .setText("Email").setW(297).setFontSize(20)
            .setTy(4).setTx(4).setH(32));
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
    nav.createTransition("composeEmail",panel,composePanel, "easeIn");
        
    
    var g = new amino.ProtoGroup();
    g.add(panel);
    g.add(replyPanel);
    g.add(composePanel);
    return g;       
}

exports.EmailApp = EmailApp;

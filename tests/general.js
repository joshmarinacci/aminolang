var amino = null;
var widgets = null;
if(process.platform == 'darwin') {
    amino = require('../build/desktop/amino.js');
    widgets = require('../build/desktop/widgets.js');
} else {
    amino = require('./amino.js');    
    widgets = require('./widgets.js');
}
amino.startApp(function(core,stage) {

    var g = new amino.ProtoGroup();
    g.add(new amino.ProtoRect()
        .setTx(100).setTy(50)
        .setW(30).setH(50));
    
    g.add(new amino.ProtoRect()
        .setTx(0).setTy(100)
        .setW(20).setH(20));
    
//    g.setTx(100);
    
    g.add(new amino.ProtoText()
        .setText("a text node")
        .setTy(50));
    g.add(new widgets.PushButton()
        .setText("a button")
        .setW(100).setH(30)
        //.setTx(-70).setTy(0)
        );
    g.add(new widgets.Label()
        .setText("a label")
        .setTx(50).setTy(200));
        
        
    g.add(new widgets.Slider().setTy(230));
    
    g.add(new widgets.ProgressSpinner().setTx(200).setTy(50).setVisible(true));
    
    
    var panel = new widgets.AnchorPanel()
        .setW(100).setH(100).setTx(200).setTy(130);
        
    panel.add(new widgets.PushButton().setText("foo")
        .setW(80).setH(20)
        .setAnchorRight(true).setRight(0));
        
    panel.add(new widgets.PushButton().setText("foo")
        .setW(80).setH(20)
        .setAnchorBottom(true).setBottom(0));
    
    g.add(panel);
    
    
    var lv = new widgets.ListView().setW(60).setH(100).setTx(-100).setTy(50);
    g.add(lv);
    
    stage.setRoot(g);

});

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

    var root = new amino.ProtoGroup();
    stage.setRoot(root);
    
    
    var col1 = 5;
    var col2 = 150;
    var colw = 140;
    var col3 = 295;
    root.add(new amino.ProtoGroup()
        .add(new widgets.Label().setText("rect"))
        .add(new amino.ProtoRect().setW(30).setH(30).setFill("#00ff00").setTy(30))
        .setTx(col1).setTy(0)
        );
    
    root.add(new amino.ProtoGroup()
        .add(new widgets.Label().setText("text"))
        .add(new amino.ProtoText().setFill("#00ff00").setTy(40).setText("some text"))
        .setTx(col2).setTy(0)
        );
    
    root.add(new amino.ProtoGroup()
        .add(new widgets.Label().setText("button"))
        .add(new widgets.PushButton().setText("a button").setW(70).setH(30).setTy(30))
        .setTx(col3).setTy(0)
        );
    
    root.add(new widgets.AnchorPanel()
        .add(new widgets.Label().setText("label left"))
        .add(new widgets.Label().setText("X").setW(colw).setH(30).setTy(30).setAlign("left"))
        .setTx(col1).setTy(100).setW(colw).setH(95)
        );
    root.add(new widgets.AnchorPanel()
        .add(new widgets.Label().setText("label center"))
        .add(new widgets.Label().setText("X").setW(colw).setH(30).setTy(30).setAlign("center"))
        .setTx(col2).setTy(100).setW(colw).setH(95)
        );
    root.add(new widgets.AnchorPanel()
        .add(new widgets.Label().setText("label right"))
        .add(new widgets.Label().setText("X").setW(colwg).setH(30).setTy(30).setAlign("right"))
        .setTx(col3).setTy(100).setW(colw).setH(95)
        );
/*    
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
*/
});

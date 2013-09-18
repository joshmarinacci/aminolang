var amino = null;
var widgets = null;
if(process.platform == 'darwin') {
    amino = require('../../build/desktop/amino.js');
    widgets = require('../../build/desktop/widgets.js');
} else {
    amino = require('./amino.js');    
    widgets = require('./widgets.js');
}


function LockScreen(core,stage) {
    var g = new widgets.AnchorPanel().setFill("#5577ff").setW(stage.getW()/2);
    console.log("getting state height: " + stage.getH());
    stage.on("WINDOWSIZE", stage, function(e) {
        g.setW(e.width/2).setH(e.height/2);
    });


    g.add(new widgets.Label().setText("12:38").setTx(10)
        .setFill("#ffffff")
        .setFontSize(80)
        .setAnchorTop(true).setTop(20)
        );
    g.add(new amino.ProtoText().setText("Tuesday Jan 18th").setTx(20).setTy(100).setFill("#ffffff").setFontSize(20));
    //time
    //date
    //weather
    //battery
    
    
    g.add(new widgets.PushButton().setText("unlock")
        .setLeft(20).setAnchorLeft(true)
        .setRight(20).setAnchorRight(true)
        .setBottom(10).setAnchorBottom(true)
        .setW(200).setH(40).onAction(function() {
                g.setVisible(false);
    }));
    return g;
}
exports.LockScreen = LockScreen;

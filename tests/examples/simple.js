if(typeof document == "undefined") {
    var amino = require('amino.js');
    var widgets= require('widgets.js'); 
}
amino.startApp(function(core, stage) {
    var group = new amino.ProtoGroup();
    //    var text = new amino.ProtoText().setTx(100).setTy(100).setText("foo").setFill("#33cc44").setFontSize(10);
    stage.setRoot(group);
    
    var button = new widgets.PushButton().setText("a button").setTx(50).setTy(50).setW(150).setH(30);
    group.add(button);
    
    
    var textfield = new widgets.TextField().setTx(50).setTy(100).setW(150).setH(30);
    group.add(textfield);

    var rect = new amino.ProtoRect().setW(10).setH(10).setFill("#33cc44");
    group.add(rect);
    core.on("move",null,function(e) {
        rect.setTx(e.x+1);
        rect.setTy(e.y+1);
    });
    
});

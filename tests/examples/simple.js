if(typeof document == "undefined") {
    var amino = require('amino.js');
    var widgets= require('widgets.js'); 
}
amino.startApp(function(core, stage) {
    var group = new amino.ProtoGroup();
    //    var text = new amino.ProtoText().setTx(100).setTy(100).setText("foo").setFill("#33cc44").setFontSize(10);
    stage.setRoot(group);
    
    var rect = new amino.ProtoRect().setW(20).setH(20).setFill("#33cc44");
    group.add(rect);
    core.on("move",null,function(e) {
//        console.log("the mouse has moved",e);
        rect.setTx(e.x);
        rect.setTy(e.y);
    });
});

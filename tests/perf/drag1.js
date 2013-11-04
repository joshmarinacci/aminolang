if(typeof document == "undefined") {
    var amino = require('amino.js');
    var widgets= require('widgets.js'); 
}

amino.startApp(function(core, stage) {
    stage.setSize(320,480);
    
    var root = new amino.ProtoGroup();
//    root.setScalex(2).setScaley(2);
    stage.setRoot(root);
    
    var lv = new widgets.ListView().setW(320).setH(600).setTy(50);
    lv.setCellWidth(100).setCellHeight(100);
    lv.setLayout('flow');
    root.add(lv);
});

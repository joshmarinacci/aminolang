var amino = null;
var widgets = null;
if(process.platform == 'darwin') {
    amino = require('../../build/desktop/amino.js');
    widgets = require('../../build/desktop/widgets.js');
} else {
    amino = require('./amino.js');    
    widgets = require('./widgets.js');
}


amino.startApp(function(core, stage) {
    stage.setSize(320,480);
    
    var root = new amino.ProtoGroup();
    stage.setRoot(root);
    
    var lv = new widgets.ListView().setW(320).setH(300).setTy(50);
    lv.setCellWidth(100).setCellHeight(100);
    lv.setLayout('flow');
    root.add(lv);
    
    core.on('edgeswipestart',null,function(e) {
        console.log("edge swiping: ",e.type,e.direction,e.x,e.y);
    });
    core.on('edgeswipedrag',null,function(e) {
        console.log("edge swiping: ",e.type,e.direction,e.x,e.y);
    });
});

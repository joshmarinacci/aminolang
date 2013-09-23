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
//    root.setScalex(2).setScaley(2);
    stage.setRoot(root);
    
    var lv = new widgets.ListView().setW(320).setH(300).setTy(50);
    root.add(lv);
});

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
    stage.setSize(600,400);
    
    var lv = new widgets.ListView();
    lv.setW(300).setH(400);
    stage.setRoot(lv);
    /*
    var root = new amino.ProtoGroup();
    root.setCliprect(1);
    root.setW(100);
    root.setH(200);
    var rect = new amino.ProtoRect().setW(300).setH(300).setTx(0).setTy(0);
    root.add(rect);
    stage.setRoot(root);
    */
});

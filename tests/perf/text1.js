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
    
    
    var button = new widgets.PushButton()
        .setText('ABCabc')
        .setW(100).setH(50)
        .setFontSize(10)
        ;
    root.add(button);
    
});

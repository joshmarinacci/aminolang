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
    
    console.log(core.getFont("vera"));
    console.log(core.getFont("awesome"));
    
    var root = new amino.ProtoGroup();
    stage.setRoot(root);
    
    var button = new widgets.PushButton()
//        .setFontName('vera')
        .setText('Button')
        .setFontSize(15)
        .setW(100).setH(50)
        ;
    root.add(button);
    var button2 = new widgets.PushButton()
        .setFontName('awesome')
        .setFontSize(15)
        .setText('\uF152')
        .setW(100).setH(50)
        .setTx(110)
        ;
    root.add(button2);
});

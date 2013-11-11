var amino = require('amino.js');    
var widgets = require('widgets.js');


amino.startApp(function(core, stage) {
    stage.setSize(320,480);
    
    var text = new widgets.TextField();
    text.setW(300).setH(200).setTy(30);
    text.setWrapping(true);
//    text.setFontSize(30);
    text.setText('This is some very long text that we are going to read about today');
    
    stage.setRoot(text);
    
});

var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');

amino.startApp(function(core, stage) {
    var root = new amino.ProtoGroup();
    stage.setRoot(root);
    var rect = new amino.ProtoRect();
    root.add(rect);
    
    
    /*
    
    windowview has w/h x/y, title, and folder that it maps to
    iconview has x/y, title, and folder that it maps to
    
    windowview draggable from titlebar
    windowview resizable from lower right corner
    */
    

});
/*
//next steps. figure out why i can't use this or self in the getBounds() functions
switch to ortho
make multiple rects be positioned correctly. needs to have a group root object
integrate mouse events on mac
integrate keyboard events on mac
figure out uniform color object and implement on all platforms


*/

console.log("about to launch");
var core = require('../src/cppgles/aminonode.js').getCore();

var stage = core.createStage(); 
var rect = core.createRect();
rect.setW(100);
rect.setH(100);
stage.setRoot(rect);
stage.on("PRESS", rect, function() {
    console.log("got a click on the rectangle");
    /*
    if(rect.getFill() == 'blue') {
        rect.setFill("red");
    } else {
        rect.setFill("blue");
    }
    */
});


core.start();



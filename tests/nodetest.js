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
var r1 = core.createRect();
r1.setX(100).setY(100).setW(50).setH(50).setFill("green");
var r2 = core.createRect();
r2.setX(0).setY(0).setW(50).setH(50).setFill("green");

var gr = core.createGroup();
gr.add(r1);
gr.add(r2);
stage.setRoot(gr);
stage.on("PRESS", r1, function() {
    console.log("got a click on the rectangle");
    /*
    if(rect.getFill() == 'blue') {
        rect.setFill("red");
    } else {
        rect.setFill("blue");
    }
    */
});

stage.on("DRAG",r2, function(e) {
    console.log("drag event",e.delta);
    e.target.setTx(e.target.getTx()+e.delta.getX());
    e.target.setTy(e.target.getTy()+e.delta.getY());
});


core.start();


